
try:
    import simplejson as json
except ImportError:
    import json
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import inspect
from sqlalchemy.ext.declarative import declarative_base
from geoalchemy2 import Geometry, Geography
import sys
import os
import sqlalchemy
import pyparsing
import hashlib
import time
import random
import datetime

Base = declarative_base()


class NoMatches(Exception):
    pass


class TooManyMatches(Exception):
    pass


class CompilationError(Exception):
    pass


# source: http://flask.pocoo.org/snippets/35/
class ReverseProxied(object):
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        script_name = environ.get('HTTP_SCRIPT_NAME', '')
        if script_name:
            environ['SCRIPT_NAME'] = script_name
            path_info = environ['PATH_INFO']
            if path_info.startswith(script_name):
                environ['PATH_INFO'] = path_info[len(script_name):]
        return self.app(environ, start_response)


class EAlGIS(object):
    "singleton with key application (eg. database connection) state"
    # pattern credit: http://stackoverflow.com/questions/42558/python-and-the-singleton-pattern
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(EAlGIS, cls).__new__(cls, *args, **kwargs)
            cls._instance._made = False
        return cls._instance

    def __init__(self):
        # don't want to construct multiple times
        if self._made:
            return
        self._made = True
        self.app = self._generate_app()
        self.db = SQLAlchemy(self.app)
        self.migrate = Migrate(self.app, self.db)
        self.datainfo = None

    def _connection_string(self):
        # try and autoconfigure for running under docker
        dbuser = os.environ.get('DB_USERNAME')
        dbpassword = os.environ.get('DB_PASSWORD')
        dbhost = os.environ.get('DB_HOST')
        if dbuser and dbpassword and dbhost:
            return 'postgres://%s:%s@%s:5432/ealgis' % (dbuser, dbpassword, dbhost)
        return 'postgres:///ealgis'

    def _generate_app(self):
        app = Flask(__name__)
        app.wsgi_app = ReverseProxied(app.wsgi_app)
        app.config['PROPAGATE_EXCEPTIONS'] = True
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        app.config['SQLALCHEMY_DATABASE_URI'] = self._connection_string()

        return app

    def create_extensions(self):
        extensions = ('postgis', 'postgis_topology', 'citext', 'hstore')
        for extension in extensions:
            try:
                self.db.engine.execute('CREATE EXTENSION %s;' % extension)
                db.session.commit()
            except sqlalchemy.exc.ProgrammingError as e:
                if 'already exists' not in str(e):
                    print "couldn't load: %s (%s)" % (extension, e)

    def get_datainfo(self):
        """grab a representation of the data available in the database
        result is cached, so after first call this is fast"""

        def dump_linkage(linkage):
            name = linkage.attribute_table.name
            if linkage.attribute_table.metadata_json is not None:
                obj = json.loads(linkage.attribute_table.metadata_json)
            else:
                obj = {}
            obj['_id'] = linkage.id
            return name, obj

        def dump_source(source):
            if source.table_info.metadata_json is not None:
                source_info = json.loads(source.table_info.metadata_json)
            else:
                source_info = {'description': source.table_info.name}
            source_info['_id'] = source.id

            # source_info['tables'] = dict(dump_linkage(t) for t in source.linkages)
            source_info['type'] = source.geometry_type
            return source_info

        def make_datainfo():
            # our geography sources
            info = {}
            for source in GeometrySource.query.all():
                name = source.table_info.name
                info[name] = dump_source(source)
            return info

        if self.datainfo is None:
            self.datainfo = make_datainfo()
        return self.datainfo

    def serve(self):
        self.cache = {}
        print "%d >> spinning up" % (os.getpid())
        # prime datainfo
        self.get_datainfo()
        print "%d >> ready" % (os.getpid())
        return self.app

    def set_setting(self, k, v):
        try:
            setting = self.db.session.query(Setting).filter(Setting.key == k).one()
            setting.value = v
            self.db.session.commit()
        except sqlalchemy.orm.exc.NoResultFound:
            setting = Setting(key=k, value=v)
            self.db.session.add(setting)
            self.db.session.commit()

    def clear_setting(self, k):
        try:
            setting = self.db.session.query(Setting).filter(Setting.key == k).one()
            self.db.session.delete(setting)
            self.db.session.commit()
        except sqlalchemy.orm.exc.NoResultFound:
            pass

    def get_setting(self, k, d=None):
        try:
            setting = self.db.session.query(Setting).filter(Setting.key == k).one()
            return setting.value
        except sqlalchemy.orm.exc.NoResultFound:
            if d is None:
                raise KeyError()
            return d

    def _get_metadata(self):
        metadata = db.MetaData(bind=db.engine)
        metadata.reflect()
        return metadata

    def metadata_dirty(self):
        self._metadata = None
    
    def engineurl(self):
        return self.db.engine.url

    def dbname(self):
        return self.db.engine.url.database

    def dbhost(self):
        return self.db.engine.url.host

    def dbuser(self):
        return self.db.engine.url.username

    def dbport(self):
        return self.db.engine.url.port

    def dbpassword(self):
        return self.db.engine.url.password

    def have_table(self, table_name):
        try:
            self.get_table(table_name)
            return True
        except sqlalchemy.exc.NoSuchTableError:
            return False

    def get_table(self, table_name):
        return sqlalchemy.Table(table_name, sqlalchemy.MetaData(), autoload=True, autoload_with=db.engine)

    def get_table_names(self):
        "this is a more lightweight approach to getting table names from the db that avoids all of that messy reflection"
        "c.f. http://docs.sqlalchemy.org/en/rel_0_9/core/reflection.html?highlight=inspector#fine-grained-reflection-with-inspector"
        inspector = inspect(db.engine)
        return inspector.get_table_names()

    def unload(self, table_name):
        "drop a table and all associated EAlGIS information"
        try:
            ti = self.get_table_info(table_name)
        except sqlalchemy.orm.exc.NoResultFound:
            print >>sys.stderr, "table `%s' is not registered with EAlGIS, unload request ignored." % table_name
            return False
        try:
            tbl = self.get_table(table_name)
            tbl.drop(self.db.engine)
            self.db.session.delete(ti)
            self.db.session.commit()
            return True
        except sqlalchemy.exc.NoSuchTableError:
            print >>sys.stderr, "mystery unregister bug"
            return False

    def get_table_class(self, table_name):
        # nothing bad happens if there is a clash, but it produces
        # warnings
        nm = str('tbl_%s_%s' % (table_name, hashlib.sha1("%s%g%g" % (table_name, random.random(), time.time())).hexdigest()[:8]))
        return type(nm, (Base,), {'__table__': self.get_table(table_name)})

    def geom_column(self, table_name):
        info = self.get_table(table_name)
        geom_columns = []

        for column in info.columns:
            # GeoAlchemy2 lets us find geometry columns
            if isinstance(column.type, Geometry):
                geom_columns.append(column)

        if len(geom_columns) > 1:
            raise Exception("more than one geometry column?")
        return geom_columns[0]

    def set_table_metadata(self, table_name, meta_dict):
        ti = self.get_table_info(table_name)
        ti.metadata_json = json.dumps(meta_dict)
        self.db.session.commit()

    def register_columns(self, table_name, columns):
        ti = self.get_table_info(table_name)
        for column_name, meta_dict in columns:
            ci = ColumnInfo(name=column_name, table_info=ti, metadata_json=json.dumps(meta_dict))
            self.db.session.add(ci)
        self.db.session.commit()

    def register_column(self, table_name, column_name, meta_dict):
        self.register_columns(table_name, [column_name, meta_dict])

    def required_srids(self):
        srids = set()

        def add_srid(s):
            if s is not None:
                srids.add(int(s))

        add_srid(self.get_setting('projected_srid', None))
        add_srid(self.get_setting('map_srid', None))
        return srids

    def repair_geometry(self, geometry_source):
        print "running geometry QC and repair:", geometry_source.table_info.name
        cls = self.get_table_class(geometry_source.table_info.name)
        geom_attr = getattr(cls, geometry_source.column)
        self.db.session.execute(sqlalchemy.update(
            cls.__table__, values={
                geom_attr: sqlalchemy.func.st_multi(sqlalchemy.func.st_buffer(geom_attr, 0))
            }).where(sqlalchemy.func.st_isvalid(geom_attr) == False))  # noqa

    def reproject(self, geometry_source, to_srid):
        # add the geometry column
        new_column = "%s_%d" % (geometry_source.column, to_srid)
        self.db.session.execute(sqlalchemy.func.addgeometrycolumn(
            geometry_source.table_info.name,
            new_column,
            to_srid,
            geometry_source.geometry_type,
            2))  # fixme ndim=2 shouldn't be hard-coded
        self.db.session.commit()
        # committed, so we can introspect it, and then transform original
        # geometry data to this SRID
        cls = self.get_table_class(geometry_source.table_info.name)
        tbl = cls.__table__
        self.db.session.execute(
            sqlalchemy.update(
                tbl, values={
                    getattr(tbl.c, new_column):
                    sqlalchemy.func.st_transform(
                        sqlalchemy.func.ST_Force2D(
                            getattr(tbl.c, geometry_source.column)),
                        to_srid)
                }))
        # record projection information in the DB
        proj_info = GeometrySourceProjected(
            geometry_source_id=geometry_source.id,
            srid=to_srid,
            column=new_column)
        self.db.session.add(proj_info)
        # make a geometry index on this
        self.db.session.commit()
        self.db.session.execute("CREATE INDEX %s ON %s USING gist ( %s )" % (
            "%s_%s_gist" % (
                geometry_source.table_info.name,
                new_column),
            geometry_source.table_info.name,
            new_column))
        self.db.session.commit()

    def register_table(self, table_name, geom=False, srid=None, gid=None):
        self.metadata_dirty()
        ti = TableInfo(name=table_name)
        self.db.session.add(ti)
        if geom:
            column = self.geom_column(table_name)
            if column is None:
                raise Exception("Cannot automatically determine geometry column for `%s'" % table_name)
            # figure out what type of geometry this is
            qstr = 'SELECT geometrytype(%s) as geomtype FROM %s WHERE %s IS NOT null GROUP BY geomtype' % \
                (column.name, table_name, column.name)
            conn = self.db.session.connection()
            res = conn.execute(qstr)
            rows = res.fetchall()
            if len(rows) != 1:
                geomtype = 'GEOMETRY'
            else:
                geomtype = rows[0][0]
            ti.geometry_source = GeometrySource(column=column.name, geometry_type=geomtype, srid=srid, gid=gid)
            to_generate = self.required_srids()
            if srid in to_generate:
                to_generate.remove(srid)
            self.repair_geometry(ti.geometry_source)
            for gen_srid in to_generate:
                self.reproject(ti.geometry_source, gen_srid)
        self.db.session.commit()
        return ti

    def get_table_info(self, table_name):
        return TableInfo.query.filter(TableInfo.name == table_name).one()

    def get_geometry_source(self, table_name):
        return GeometrySource.query.join(GeometrySource.table_info).filter(TableInfo.name == table_name).one()

    def get_geometry_source_by_id(self, id):
        return GeometrySource.query.filter(GeometrySource.id == id).one()

    def resolve_attribute(self, geometry_source, attribute):
        attribute = attribute.lower()  # upper case tables or columns seem unlikely, but a possible FIXME
        # supports table_name.column_name OR just column_name
        s = attribute.split('.', 1)
        q = self.db.session.query(ColumnInfo, GeometryLinkage.id).join(TableInfo).join(GeometryLinkage)
        if len(s) == 2:
            q = q.filter(TableInfo.name == s[0])
            attr_name = s[1]
        else:
            attr_name = s[0]
        q = q.filter(GeometryLinkage.geometry_source == geometry_source).filter(ColumnInfo.name == attr_name)
        matches = q.all()
        if len(matches) > 1:
            raise TooManyMatches(attribute)
        elif len(matches) == 0:
            raise NoMatches(attribute)
        else:
            ci, linkage_id = matches[0]
            return GeometryLinkage.query.get(linkage_id), ci

    def add_geolinkage(self, geo_table_name, geo_column, attr_table_name, attr_column):
        geo_source = self.get_geometry_source(geo_table_name)
        attr_table = self.get_table_info(attr_table_name)
        linkage = GeometryLinkage(
            geometry_source=geo_source,
            geo_column=geo_column,
            attribute_table=attr_table,
            attr_column=attr_column)
        self.db.session.add(linkage)
        self.db.session.commit()

    def get_geometry_relation(self, from_source, to_source):
        try:
            return self.db.session.query(GeometryRelation).filter(
                GeometryRelation.geo_source_id == from_source.id,
                GeometryRelation.overlaps_with_id == to_source.id).one()
        except sqlalchemy.orm.exc.NoResultFound:
            return None

    def recompile_all(self):
        for defn in MapDefinition.query.all():
            config = defn.get()
            defn.set(config, force=True)


# model definitions; using Flask-SQLAlchemy; models use a subclass that is defined on the
# db instance
db = EAlGIS().db


class Setting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(256), unique=True, index=True)
    value = db.Column(db.Text())


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email_address = db.Column(db.String(256), unique=True, index=True)
    name = db.Column(db.String(256))


class TableInfo(db.Model):
    "metadata for each table that has been loaded into the system"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256), unique=True, index=True)
    geometry_source = db.relationship(
        'GeometrySource',
        backref=db.backref('table_info'),
        cascade="all",
        uselist=False)
    column_info = db.relationship(
        'ColumnInfo',
        backref=db.backref('table_info'),
        cascade="all",
        lazy='dynamic')
    linkages = db.relationship(
        'GeometryLinkage',
        backref=db.backref('attribute_table'),
        cascade="all",
        lazy='dynamic')
    metadata_json = db.Column(db.String(2048))


class ColumnInfo(db.Model):
    "metadata for columns in the tabbles"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256), index=True)
    tableinfo_id = db.Column(db.Integer, db.ForeignKey('table_info.id'), index=True, nullable=False)
    metadata_json = db.Column(db.String(2048))
    __table_args__ = (db.UniqueConstraint('name', 'tableinfo_id'), )


class GeometrySourceProjected(db.Model):
    "details of an additional column (on the same table as the source) with the source reprojected to this srid"
    id = db.Column(db.Integer, primary_key=True)
    geometry_source_id = db.Column(db.Integer, db.ForeignKey('geometry_source.id'), index=True, nullable=False)
    srid = db.Column(db.Integer, nullable=False)
    column = db.Column(db.String(256), nullable=False)


class GeometrySource(db.Model):
    "table describing sources of geometry information: the table, and the column"
    id = db.Column(db.Integer, primary_key=True)
    tableinfo_id = db.Column(db.Integer, db.ForeignKey('table_info.id'), index=True, nullable=False)
    geometry_type = db.Column(db.String(256), nullable=False)
    column = db.Column(db.String(256), nullable=False)
    srid = db.Column(db.Integer, nullable=False)
    gid = db.Column(db.String(256), nullable=False)
    linkages = db.relationship(
        'GeometryLinkage',
        backref=db.backref('geometry_source'),
        cascade="all",
        lazy='dynamic')
    reprojections = db.relationship(
        'GeometrySourceProjected',
        backref=db.backref('geometry_source'),
        cascade="all",
        lazy='dynamic')
    from_relations = db.relationship(
        'GeometryRelation',
        backref=db.backref('geometry_source'),
        cascade="all",
        lazy='dynamic',
        foreign_keys="[GeometryRelation.geo_source_id]")
    with_relations = db.relationship(
        'GeometryRelation',
        backref=db.backref('overlaps_geometry_source'),
        cascade="all",
        lazy='dynamic',
        foreign_keys="[GeometryRelation.overlaps_with_id]")

    def __repr__(self):
        return "GeometrySource<%s.%s>" % (self.table_info.name, self.column)

    def srid_column(self, srid):
        if self.srid == srid:
            return self.column
        proj = [t for t in self.reprojections.all() if t.srid == srid]
        if len(proj) == 1:
            return proj[0].column
        else:
            return None


class GeometryLinkage(db.Model):
    "details of links to tie attribute data to columns in a geometry table"
    id = db.Column(db.Integer, primary_key=True)
    # the geometry table, and the column which links a row in our attribute table with
    # a row in the geometry table
    geo_source_id = db.Column(db.Integer, db.ForeignKey('geometry_source.id'), index=True, nullable=False)
    geo_column = db.Column(db.String(256))
    # the attribute table, and the column which links a row in our geomtry table with
    # a row in the attribute table
    attr_table_info_id = db.Column(db.Integer, db.ForeignKey('table_info.id'), nullable=False)
    attr_column = db.Column(db.String(256))


class GeometryIntersection(db.Model):
    "intersection of two priority geometries, indexed by gids from their source columns"
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    geometry_relation_id = db.Column(db.Integer, db.ForeignKey('geometry_relation.id'), index=True, nullable=False)
    gid = db.Column(db.Integer, index=True, nullable=False)
    with_gid = db.Column(db.Integer, index=True, nullable=False)
    percentage_overlap = db.Column(db.Float, nullable=False)
    area_overlap = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return "<%d,%d>: %.2f%%" % (
            self.gid,
            self.with_gid,
            self.percentage_overlap)


class GeometryTouches(db.Model):
    "geometries that touch but do not overlap"
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    geometry_relation_id = db.Column(db.Integer, db.ForeignKey('geometry_relation.id'), index=True, nullable=False)
    gid = db.Column(db.Integer, index=True, nullable=False)
    with_gid = db.Column(db.Integer, index=True, nullable=False)

    def __repr__(self):
        return "<%d,%d>" % (
            self.gid,
            self.with_gid)


class GeometryRelation(db.Model):
    "relationship of geometries; eg. one row in a geometry table with another row in another table (possibly the same table)"
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    geo_source_id = db.Column(db.Integer, db.ForeignKey('geometry_source.id'), nullable=False)
    overlaps_with_id = db.Column(db.Integer, db.ForeignKey('geometry_source.id'), nullable=False)
    intersections = db.relationship(
        'GeometryIntersection',
        cascade="all",
        backref=db.backref('relation'),
        lazy='dynamic')
    touches = db.relationship(
        'GeometryTouches',
        cascade="all",
        backref=db.backref('relation'),
        lazy='dynamic')
    __table_args__ = (
        db.UniqueConstraint('geo_source_id', 'overlaps_with_id'),
        sqlalchemy.Index('georelation_lookup', geo_source_id, overlaps_with_id))

# mapserver epoch; allows us to force re-compilation when things are changed
MAPSERVER_EPOCH = 2


class MapDefinition(db.Model):
    "map definition - all state for a EAlGIS map"
    hash_exclude = ('name', 'visible')
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(32), nullable=False, index=True)
    description = db.Column(db.Text())
    json = db.Column(db.Text())

    @classmethod
    def get_by_name(self, map_name):
        try:
            return MapDefinition.query.filter(MapDefinition.name == map_name).one()
        except sqlalchemy.orm.exc.NoResultFound:
            return None

    def get(self):
        if self.json is not None:
            return json.loads(self.json)
        return {}

    def compile_expr(self, layer, **kwargs):
        # in here to avoid circular import
        from dataexpr import DataExpression
        geometry_source_name = layer['geometry']
        geometry_source = EAlGIS().get_geometry_source(geometry_source_name)
        return DataExpression(
            layer['name'],
            geometry_source,
            layer['fill'].get('expression', ''),
            layer['fill'].get('conditional', ''),
            int(EAlGIS().get_setting('map_srid')),
            **kwargs)

    def _private_clear(self, obj):
        for k, v in obj.items():
            if k.startswith('_'):
                del obj[k]
            elif type(v) == dict:
                self._private_clear(v)

    def _private_copy_over(self, from_obj, to_obj):
        for k, v in from_obj.items():
            if k.startswith('_'):
                to_obj[k] = v
            elif type(v) == dict:
                jump_to_obj = to_obj.get(k)
                if jump_to_obj is not None:
                    self._private_copy_over(v, jump_to_obj)

    def _layer_build_mapserver_query(self, old_layer, layer, force):
        def get_recurse(obj, *args):
            for v in args[:-1]:
                obj = obj.get(v)
                if obj is None:
                    return None
            return obj.get(args[-1])

        # can we skip SQL compilation? it's sometimes slow, so worth extra code
        def old_differs(*args):
            old = get_recurse(old_layer, *args)
            new = get_recurse(layer, *args)
            return old != new

        if force or not old_layer or old_differs('geometry') or old_differs('fill', 'expression') or old_differs('fill', 'conditional') or get_recurse(layer, 'fill', '_mapserver_epoch') != MAPSERVER_EPOCH:
            print "compiling query for layer:", layer.get('name')
            expr = self.compile_expr(layer)
            layer['fill']['_mapserver_query'] = expr.get_mapserver_query()
            layer['fill']['_mapserver_epoch'] = MAPSERVER_EPOCH
            print "... compilation complete; query:"
            print layer['fill']['_mapserver_query']

    def _layer_update_hash(self, layer):
        try:
            del layer['hash']
        except KeyError:
            pass
        hash_obj = layer.copy()
        for k in MapDefinition.hash_exclude:
            if k in hash_obj:
                del hash_obj[k]
        layer['hash'] = hashlib.sha1(json.dumps(hash_obj)).hexdigest()[:8]

    def _set(self, defn, force=False):
        old_defn = self.get()
        if 'layers' not in old_defn:
            old_defn['layers'] = {}
        rev = old_defn.get('rev', 0) + 1
        defn['rev'] = rev
        for k, layer in defn['layers'].items():
            # compile layer SQL expression (this is sometimes slow, so best to do
            # just the once)
            old_layer = old_defn['layers'].get(k)
            # private variables we don't allow the client to set; we simply clear & copy over
            # from the last object in the database
            self._private_clear(layer)
            if old_layer is not None:
                self._private_copy_over(old_layer, layer)
            # rebuild mapserver query
            self._layer_build_mapserver_query(old_layer, layer, force)
            # update layer hash
            self._layer_update_hash(layer)
        self.json = json.dumps(defn)
        return rev

    def set(self, defn, **kwargs):
        try:
            return self._set(defn, **kwargs)
        except pyparsing.ParseException as e:
            raise CompilationError(str(e))


class EALGISMetadata(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256))
    version = db.Column(db.Float())
    description = db.Column(db.Text())
    date = db.Column(db.DateTime(timezone=True), default=datetime.datetime.utcnow)