from functools import lru_cache
from sqlalchemy import inspect
from geoalchemy2.types import Geometry
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database, drop_database
from sqlalchemy.schema import CreateSchema
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import not_
from ..dataschema.schema_v1 import store
from collections import Counter
from .util import cmdrun
import os
import sqlalchemy
import traceback as tb
from .util import make_logger

Base = declarative_base()
logger = make_logger(__name__)


class EngineInfo():
    """
    mix-in providing convenience methods to grab
    connection params
    """

    def dbname(self):
        return self.engine.engine.url.database

    def dbhost(self):
        return self.engine.engine.url.host

    def dbuser(self):
        return self.engine.engine.url.username

    def dbport(self):
        return self.engine.engine.url.port

    def dbpassword(self):
        return self.engine.engine.url.password


class Database(EngineInfo):
    """
    This should be a global singleton in the application. No SQL sessions are used
    by any of the methods in this class. The single global `engine` instance is stored
    within this class.
    """

    # PostgreSQL and PostGIS system schemas
    system_schemas = ["information_schema", "tiger", "tiger_data", "topology", "public"]

    def __init__(self):
        self.engine = self.make_engine()
        self.inspector = inspect(self.engine)
        self._reflection_cache = {}
        self.compliant = [
            t for t in self.inspector.get_schema_names() if
            t not in self.system_schemas and self._has_required_ealgis_tables(t)]

    @classmethod
    def make_engine(cls, **kwargs):
        return create_engine(cls.make_connection_string(**kwargs))

    @classmethod
    def make_connection_string(cls, db_host=None, db_name=None, db_user=None, db_password=None):
        ge = os.environ.get
        db_host = db_host or ge('DATASTORE_HOST') or ge('DB_HOST')
        db_name = db_name or ge('DATASTORE_NAME') or ge('DB_NAME')
        db_user = db_user or ge('DATASTORE_USERNAME') or ge('DB_USERNAME')
        db_password = db_password or ge('DATASTORE_PASSWORD') or ge('DB_PASSWORD')
        return 'postgres://{}:{}@{}:5432/{}'.format(db_user, db_password, db_host, db_name)

    def get_schema_reflection(self, schema_name):
        if schema_name not in self._reflection_cache:
            self._reflection_cache[schema_name] = SchemaReflection(schema_name, self.engine)
        return self._reflection_cache[schema_name]

    def access_data(self):
        return DataAccess(engine=self.engine)

    def access_schema(self, schema_name):
        return SchemaAccess(self.get_schema_reflection(schema_name))

    @classmethod
    def _is_system_schema(cls, schema_name):
        return schema_name in cls.system_schemas

    def _has_required_ealgis_tables(self, schema_name):
        try:
            required_tables = ["ealgis_metadata", "table_info", "column_info", "geometry_linkage", "geometry_source", "geometry_source_projection"]
            table_names = self.inspector.get_table_names(schema=schema_name)
            return set(required_tables).issubset(table_names)
        except sqlalchemy.exc.SQLAlchemyError:
            logger.warning("Error while attemping to check schema for required tables: {}".format(schema_name))
            logger.warning(tb.format_exc())

    @lru_cache(maxsize=None)
    def get_geometry_schemas(self):
        r = []
        for schema_name in self.compliant:
            with self.access_schema(schema_name) as db:
                GeometrySource = db.get_table_class("geometry_source")
                if db.session.query(GeometrySource).first() is not None:
                    r.append(schema_name)
        return r

    @lru_cache(maxsize=None)
    def get_ealgis_schemas(self):
        r = []
        for schema_name in self.compliant:
            try:
                with self.access_schema(schema_name) as db:
                    ColumnInfo = db.get_table_class("column_info")
                    if db.session.query(ColumnInfo).first() is not None:
                        r.append(schema_name)
            except sqlalchemy.exc.SQLAlchemyError:
                logger.warning("Error while attemping to inspect schema: {}".format(schema_name))
                logger.warning(tb.format_exc())
        return r


class SchemaReflection(EngineInfo):
    """
    reflects a schema, giving us ORM access to the tables within it
    """

    def __init__(self, schema_name, engine):
        self._schema_name = schema_name
        self.engine = engine
        self.class_version = Counter()
        self.table_cache = {}
        self.class_names_used = Counter()
        #
        _, tables = store.load_schema(schema_name)
        self.tables = dict((t.name, t) for t in tables)
        self.classes = dict((t.name, self.get_table_class(t.name)) for t in tables)

    def get_table_names(self):
        "this is a more lightweight approach to getting table names from the db that avoids all of that messy reflection"
        "c.f. http://docs.sqlalchemy.org/en/rel_0_9/core/reflection.html?highlight=inspector#fine-grained-reflection-with-inspector"
        inspector = inspect(self.engine)
        return inspector.get_table_names(schema=self._schema_name)

    def get_table_class(self, table_name, refresh=False):
        """
        table definitions may change over time (as the result of the addition of columns, ...)
        use `refresh=True` to if getting a table class when this may be the case (e.g. from
        a data loader)
        """
        if refresh or table_name not in self.table_cache:
            self.class_names_used[table_name] += 1
            count = self.class_names_used[table_name]
            nm = "Table_{}.{}".format(self._schema_name, table_name)
            if count > 1:
                nm = '{}_{}'.format(nm, count)
            self.table_cache[table_name] = type(nm, (Base,), {'__table__': self.get_table(table_name)})
        return self.table_cache[table_name]

    def have_table(self, table_name):
        try:
            self.get_table(table_name)
            return True
        except sqlalchemy.exc.NoSuchTableError:
            return False

    def get_table(self, table_name):
        return sqlalchemy.Table(table_name, sqlalchemy.MetaData(), schema=self._schema_name, autoload=True, autoload_with=self.engine)


class DataAccess(EngineInfo):
    """
    Access the datastore.
    None of the methods on this class are bound to schemas.
    To access a schema, see the subclass SchemaAccess
    """

    def __init__(self, engine):
        self.Session = sessionmaker()
        self.engine = engine
        self.Session.configure(bind=self.engine)
        # note: this is to ensure that any callers not using `with` will break
        self.session = None

    def __enter__(self):
        # it shouldn't be possible for this instance to be used more than
        # once at a time; we've hit bugs where threads have accidentally
        # shared DataAccess instances, with breakage as a result
        if self.session is not None:
            raise Exception("{} nested access to the schema".format(id(self)))
        self.session = self.Session()
        return self

    def __exit__(self, type, value, traceback):
        self.session.close()
        self.session = None


class SchemaAccess(DataAccess):
    """
    access a data schema within the datastore
    """

    def __init__(self, reflect):
        super().__init__(engine=reflect.engine)
        self._reflect = reflect
        self.classes = self._reflect.classes
        self.tables = self._reflect.tables
        self._schema_name = reflect._schema_name

    def dbschema(self):
        return self._schema_name

    '''
    Database Table Accessors
    '''

    def get_table_names(self, *args, **kwargs):
        return self._reflect.get_table_names(*args, **kwargs)

    def get_table_class(self, *args, **kwargs):
        return self._reflect.get_table_class(*args, **kwargs)

    def have_table(self, *args, **kwargs):
        return self._reflect.have_table(*args, **kwargs)

    def get_table(self, *args, **kwargs):
        return self._reflect.get_table(*args, **kwargs)

    def get_table_class_by_id(self, table_id, **kwargs):
        try:
            table_info = self.get_table_info_by_id(table_id)
            return self.get_table_class(table_info.name, **kwargs)
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve table class for table `{}'".format(table_id))

    '''
    Geometry Source Accessors
    '''

    def get_geometry_source(self, table_name):
        TableInfo = self.classes['table_info']
        GeometrySource = self.classes['geometry_source']
        try:
            return self.session.query(GeometrySource).join(TableInfo, TableInfo.id == GeometrySource.table_info_id).filter(TableInfo.name == table_name).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve geometry_source row for `{}'".format(table_name))

    def get_geometry_source_table_info(self, table_name):
        TableInfo = self.classes['table_info']
        GeometrySource = self.classes['geometry_source']
        try:
            return self.session.query(GeometrySource, TableInfo).join(TableInfo, TableInfo.id == GeometrySource.table_info_id).filter(TableInfo.name == table_name).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve geometry_source table for '{}'".format(table_name))

    def get_geometry_sources(self):
        GeometrySource = self.classes['geometry_source']
        try:
            return self.session.query(GeometrySource).all()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve geometry_source tables")

    def get_geometry_sources_table_info(self):
        TableInfo = self.classes['table_info']
        GeometrySource = self.classes['geometry_source']
        try:
            return self.session.query(GeometrySource, TableInfo).join(TableInfo, TableInfo.id == GeometrySource.table_info_id).all()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve geometry_source tables")

    def get_geometry_source_column(self, geometry_source, srid):
        GeometrySourceProjection = self.classes['geometry_source_projection']
        return self.session.query(GeometrySourceProjection).filter(GeometrySourceProjection.geometry_source_id == geometry_source.id).filter(GeometrySourceProjection.srid == srid).one()

    def get_geometry_source_by_id(self, id):
        GeometrySource = self.classes['geometry_source']
        try:
            return self.session.query(GeometrySource).filter(GeometrySource.id == id).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve geometry_source row for id `{}'".format(id))

    def get_geometry_source_row(self, table_name, gid):
        table = self.get_table(table_name)
        try:
            return self.session.query(table).filter(table.columns["gid"] == gid).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve geometry_source row for gid `{}'".format(gid))

    def get_geometry_source_attribute_columns(self, table_name):
        info = self.get_table(table_name)
        columns = []

        for column in info.columns:
            # GeoAlchemy2 lets us find geometry columns
            if isinstance(column.type, Geometry) is False and info.primary_key.contains_column(column) is False:
                columns.append(column)

        if len(columns) == 0:
            raise Exception("no non-geometry columns found for '{table_name}'?".format(table_name=table_name))
        return columns

    def find_geom_column(self, table_name, srid=None):
        info = self.get_table(table_name)
        geom_columns = []

        for column in info.columns:
            # GeoAlchemy2 lets us find geometry columns
            if not isinstance(column.type, Geometry):
                continue
            if srid is None or column.type.srid == srid:
                geom_columns.append(column)

        if len(geom_columns) > 1:
            raise Exception("more than one geometry column for srid '{srid}'?".format(srid=srid))
        elif len(geom_columns) == 0:
            raise Exception("no geometry columns for srid '{srid}'?".format(srid=srid))
        return geom_columns[0]

    '''
    Data Table Accessors
    '''

    def get_table_info(self, table_name):
        TableInfo = self.classes['table_info']
        try:
            return self.session.query(TableInfo).filter(TableInfo.name == table_name).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve table_info row for `{}'".format(table_name))

    def get_table_info_by_id(self, table_id):
        result = self.get_table_info_by_ids([table_id])
        if len(result) == 0:
            raise Exception("could not retrieve table_info for table id '{}'".format(table_id))
        else:
            return result[0]

    def get_table_info_by_ids(self, table_ids):
        TableInfo = self.classes['table_info']
        try:
            return self.session.query(TableInfo).filter(TableInfo.id.in_(table_ids)).all()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve table_info for a range of table ids")

    def get_table_info_and_geometry_linkage_by_id(self, table_id, geo_source_id=None):
        result = self.get_table_info_and_geometry_linkage_by_ids([table_id], geo_source_id)
        if len(result) == 0:
            raise Exception("could not retrieve table_info for table id '{}'".format(table_id))
        else:
            return result[0]

    def get_table_info_and_geometry_linkage_by_ids(self, table_ids=None, geo_source_id=None):
        TableInfo = self.classes['table_info']
        GeometryLinkage = self.classes['geometry_linkage']
        try:
            query = self.session.query(TableInfo, GeometryLinkage).join(GeometryLinkage, TableInfo.id == GeometryLinkage.attr_table_id)

            if table_ids is not None:
                query = query.filter(TableInfo.id.in_(table_ids))

            if geo_source_id is not None:
                query = query.filter(GeometryLinkage.geometry_source_id == geo_source_id)

            return query.all()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve table_info for a range of table ids")

    def get_table_info_and_geometry_linkage_by_family_and_geometry(self, table_family, geo_source_id):
        GeometryLinkage = self.classes['geometry_linkage']
        TableInfo = self.classes['table_info']
        try:
            return self.session.query(TableInfo, GeometryLinkage)\
                .join(GeometryLinkage, TableInfo.id == GeometryLinkage.attr_table_id)\
                .filter(TableInfo.metadata_json["family"].astext == table_family)\
                .filter(GeometryLinkage.geometry_source_id == geo_source_id).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not find a matching table for this geometry source")

    def get_geometry_relation(self, from_source, to_source):
        GeometryRelation = self.classes['geometry_relation']
        try:
            return self.session.query(GeometryRelation).filter(
                GeometryRelation.geo_source_id == from_source.id,
                GeometryRelation.overlaps_with_id == to_source.id).one()
        except sqlalchemy.orm.exc.NoResultFound:
            return None

    def search_tables(self, search_terms, search_terms_excluded, geo_source_id=None):
        GeometryLinkage = self.classes['geometry_linkage']
        TableInfo = self.classes['table_info']
        try:
            query = self.session.query(TableInfo, GeometryLinkage)\
                .join(GeometryLinkage, TableInfo.id == GeometryLinkage.attr_table_id)\
                .filter(GeometryLinkage.geometry_source_id == geo_source_id)

            # Further filter the resultset by one or more search terms (e.g. "diploma,advaned,females")
            for term in search_terms:
                query = query.filter(TableInfo.metadata_json["type"].astext.ilike("%{}%".format(term)))

            # Further filter the resultset by one or more excluded search terms (e.g. "diploma,advaned,females")
            for term in search_terms_excluded:
                query = query.filter(not_(TableInfo.metadata_json["type"].astext.ilike("%{}%".format(term))))

            return query.order_by(TableInfo.id).all()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not search tables")

    '''
    Columns Accessors
    '''

    def get_column_info(self, id):
        ColumnInfo = self.classes['column_info']
        try:
            return self.session.query(ColumnInfo).filter(ColumnInfo.id == id).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve column_info row for id `{}'".format(id))

    def get_column_info_by_names(self, column_names, geo_source_id=None):
        ColumnInfo = self.classes['column_info']
        TableInfo = self.classes['table_info']
        GeometryLinkage = self.classes['geometry_linkage']

        try:
            query = self.session.query(ColumnInfo, GeometryLinkage)\
                .join(TableInfo, ColumnInfo.table_info_id == TableInfo.id)\
                .join(GeometryLinkage, TableInfo.id == GeometryLinkage.attr_table_id)\

            if geo_source_id is not None:
                query = query.filter(GeometryLinkage.geometry_source_id == geo_source_id)

            column_names = [item.lower().strip() for item in column_names]
            return query.filter(sqlalchemy.func.lower(ColumnInfo.name).in_(column_names)).all()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve column_info a range of column names")

    def get_column_info_by_name(self, column_name, geo_source_id=None):
        result = self.get_column_info_by_names([column_name], geo_source_id)
        if len(result) == 0:
            return []
        else:
            return [column for column, geometrylinkage in result]

    def search_columns(self, search_terms, search_terms_excluded, geo_source_id=None):
        GeometryLinkage = self.classes['geometry_linkage']
        TableInfo = self.classes['table_info']
        ColumnInfo = self.classes['column_info']
        try:
            query = self.session.query(ColumnInfo.table_info_id)\
                .join(TableInfo, ColumnInfo.table_info_id == TableInfo.id)\
                .join(GeometryLinkage, TableInfo.id == GeometryLinkage.attr_table_id)\
                .filter(GeometryLinkage.geometry_source_id == geo_source_id)

            # Further filter the resultset by one or more search terms (e.g. "diploma,advaned,females")
            for term in search_terms:
                query = query.filter(ColumnInfo.metadata_json["type"].astext.ilike("%{}%".format(term)))

            # Further filter the resultset by one or more excluded search terms (e.g. "diploma,advaned,females")
            for term in search_terms_excluded:
                query = query.filter(not_(ColumnInfo.metadata_json["type"].astext.ilike("%{}%".format(term))))

            tableIds = query.distinct().all()

            if len(tableIds) > 0:
                return self.get_table_info_and_geometry_linkage_by_ids(tableIds)
            else:
                return []
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not search columns")

    def fetch_columns(self, tableinfo_id=None):
        GeometryLinkage = self.classes['geometry_linkage']
        ColumnInfo = self.classes['column_info']
        TableInfo = self.classes['table_info']
        try:
            return self.session.query(ColumnInfo, GeometryLinkage, TableInfo)\
                .outerjoin(GeometryLinkage, ColumnInfo.table_info_id == GeometryLinkage.attr_table_id)\
                .outerjoin(TableInfo, ColumnInfo.table_info_id == TableInfo.id)\
                .filter(ColumnInfo.table_info_id == tableinfo_id).order_by(ColumnInfo.id).all()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not find any columns for table '{}'".format(tableinfo_id))

    '''
    Data Attribute Accessors
    '''

    def get_attribute_info(self, geometry_source, attribute_name):
        GeometryLinkage = self.classes['geometry_linkage']
        ColumnInfo = self.classes['column_info']
        try:
            return self.session.query(ColumnInfo, GeometryLinkage).join(GeometryLinkage, ColumnInfo.table_info_id == GeometryLinkage.attr_table_id).filter(GeometryLinkage.geometry_source_id == geometry_source.id).filter(ColumnInfo.name == attribute_name).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not find attribute '{}'".format(attribute_name))

    '''
    Miscellaneous
    '''

    @lru_cache(maxsize=None)
    def get_schema_metadata(self):
        EalgisMetadata = self.classes['ealgis_metadata']
        try:
            return self.session.query(EalgisMetadata).first()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve ealgis_metadata table")


class DataLoaderFactory:
    def __init__(self, clean=True, **kwargs):
        # create database and connect
        connection_string = Database.make_connection_string(**kwargs)
        self.engine = create_engine(connection_string)
        if self._create_database(connection_string, clean):
            self._create_extensions(connection_string)

    def make_schema_access(self, schema_name):
        reflect = SchemaReflection(schema_name, self.engine)
        return SchemaAccess(reflect)

    def make_loader(self, schema_name, **loader_kwargs):
        if not self.engine.dialect.has_schema(self.engine, schema_name):
            self._create_schema(schema_name)
        return DataLoader(self.engine, schema_name, **loader_kwargs)

    def _create_database(self, connection_string, clean):
        # Initialise the database
        if clean and database_exists(connection_string):
            logger.info("database already exists: deleting.")
            drop_database(connection_string)
        if not database_exists(connection_string):
            create_database(connection_string)
            logger.debug("database created")
            return True

    def _create_schema(self, schema_name):
        logger.info("create schema: %s" % schema_name)
        self.engine.execute(CreateSchema(schema_name))

    def _create_extensions(self, connection_string):
        extensions = ('postgis', 'postgis_topology')
        for extension in extensions:
            try:
                logger.info("creating extension: %s" % extension)
                self.engine.execute('CREATE EXTENSION %s;' % extension)
            except sqlalchemy.exc.ProgrammingError as e:
                if 'already exists' not in str(e):
                    print("couldn't load: %s (%s)" % (extension, e))


class DataLoader(SchemaAccess):
    def __init__(self, engine, schema_name, mandatory_srids=None):
        self.engine = engine
        self._mandatory_srids = mandatory_srids
        metadata, tables = store.load_schema(schema_name)
        metadata.create_all(engine)
        super().__init__(SchemaReflection(schema_name, self.engine))

    def access_schema(self, schema_name):
        return SchemaAccess(SchemaReflection(schema_name, self.engine))

    def set_table_metadata(self, table_name, meta_dict):
        ti = self.get_table_info(table_name)
        ti.metadata_json = meta_dict
        self.session.commit()

    def register_columns(self, table_name, columns):
        ti = self.get_table_info(table_name)
        for column_name, meta_dict in columns:
            self.session.execute(
                self.tables['column_info'].insert().values(
                    name=column_name,
                    table_info_id=ti.id,
                    metadata_json=meta_dict))
        self.session.commit()

    def register_column(self, table_name, column_name, meta_dict):
        self.register_columns(table_name, [column_name, meta_dict])

    def reproject(self, geometry_source_id, from_column, to_srid):
        # add the geometry column
        GeometrySource = self.classes['geometry_source']
        TableInfo = self.classes['table_info']
        geometry_source = self.session.query(GeometrySource).filter(GeometrySource.id == geometry_source_id).one()
        table_info = self.session.query(TableInfo).filter(TableInfo.id == geometry_source.table_info_id).one()
        new_column = "%s_%d" % (from_column, to_srid)
        self.session.execute(sqlalchemy.func.addgeometrycolumn(
            self._schema_name,
            table_info.name,
            new_column,
            to_srid,
            geometry_source.geometry_type,
            2))  # fixme ndim=2 shouldn't be hard-coded
        self.session.commit()
        # committed, so we can introspect it, and then transform original
        # geometry data to this SRID
        cls = self.get_table_class(table_info.name, refresh=True)
        tbl = cls.__table__
        self.session.execute(
            sqlalchemy.update(
                tbl, values={
                    getattr(tbl.c, new_column):
                    sqlalchemy.func.st_transform(
                        sqlalchemy.func.ST_Force2D(
                            getattr(tbl.c, from_column)),
                        to_srid)
                }))
        self.session.execute(
            self.tables['geometry_source_projection'].insert().values(
                geometry_source_id=geometry_source_id,
                geometry_column=new_column,
                srid=to_srid))
        # make a geometry index on this
        self.session.commit()
        self.session.execute("CREATE INDEX %s ON %s.%s USING gist ( %s )" % (
            "%s_%s_gist" % (
                table_info.name,
                new_column),
            self._schema_name,
            table_info.name,
            new_column))
        self.session.commit()

    def add_mvt_area_column(self, geometry_source_id, column):
        # add a column with the square root of geometry areas pre-calculated for EPSG:3857
        # used for vector tile creation
        GeometrySource = self.classes['geometry_source']
        TableInfo = self.classes['table_info']
        geometry_source = self.session.query(GeometrySource).filter(GeometrySource.id == geometry_source_id).one()
        table_info = self.session.query(TableInfo).filter(TableInfo.id == geometry_source.table_info_id).one()
        new_column = "sqrt_area_%s" % (column.name)

        self.session.execute("ALTER TABLE %s.%s ADD COLUMN %s numeric" % (self._schema_name, table_info.name, new_column))
        self.session.commit()

        cls = self.get_table_class(table_info.name, refresh=True)
        tbl = cls.__table__

        self.session.execute(
            sqlalchemy.update(
                tbl, values={
                    new_column:
                    sqlalchemy.func.sqrt(sqlalchemy.func.st_area(column))
                }))
        self.session.commit()

        self.session.execute("CREATE INDEX %s ON %s.%s USING btree ( %s )" % (
            "%s_%s_btree" % (
                table_info.name,
                new_column),
            self._schema_name,
            table_info.name,
            new_column))
        self.session.commit()

    def register_table(self, table_name, geom=False, srid=None, gid=None):
        table_info_id, = self.session.execute(
            self.tables['table_info'].insert().values(
                name=table_name)).inserted_primary_key
        if geom:
            column = self.find_geom_column(table_name)
            if column is None:
                raise Exception("Cannot automatically determine geometry column for `%s'" % table_name)
            # if we don't have an SRID yet, infer from the column
            if srid is None:
                srid = column.type.srid
            # figure out what type of geometry this is
            qstr = 'SELECT geometrytype(%s) as geomtype FROM %s.%s WHERE %s IS NOT null GROUP BY geomtype' % \
                (column.name, self._schema_name, table_name, column.name)
            conn = self.session.connection()
            res = conn.execute(qstr)
            rows = res.fetchall()
            if len(rows) != 1:
                geomtype = 'GEOMETRY'
            else:
                geomtype = rows[0][0]
            source_id, = self.session.execute(
                self.tables['geometry_source'].insert().values(
                    table_info_id=table_info_id,
                    geometry_type=geomtype,
                    gid_column=gid)).inserted_primary_key
            self.session.execute(
                self.tables['geometry_source_projection'].insert().values(
                    geometry_source_id=source_id,
                    geometry_column=column.name,
                    srid=srid))
            to_generate = set(self._mandatory_srids)
            if srid in to_generate:
                to_generate.remove(srid)
            for gen_srid in to_generate:
                self.reproject(source_id, column.name, gen_srid)

            # add pre-calculated area column for use by vector tile output
            if geomtype == "POLYGON" or geomtype == "MULTIPOLYGON" or geomtype == "GEOMETRY" or geomtype == "GEOMETRYCOLLECTION":
                column = self.find_geom_column(table_name, 3857)
                self.add_mvt_area_column(source_id, column)
            elif geomtype == "POINT":
                # no need to calculate areas for this data type
                pass
            else:
                raise Exception("geometry `%s' will not be accessible: unknown geomtype %s" % (column.name, geomtype))
        self.session.commit()
        return self.get_table_info(table_name)

    def add_geolinkage(self, geo_access, geo_table_name, geo_column, attr_table_name, attr_column):
        attr_table = self.get_table_info(attr_table_name)
        geo_source = geo_access.get_geometry_source(geo_table_name)
        GeometryLinkage = self.classes['geometry_linkage']
        linkage = GeometryLinkage(
            geometry_source_schema_name=geo_access._schema_name,
            geometry_source_id=geo_source.id,
            attr_table_id=attr_table.id,
            attr_column=attr_column)
        self.session.add(linkage)
        self.session.commit()

    def has_dependency(self, required_schema):
        with SchemaAccess(SchemaReflection(required_schema, self.engine)) as dep_access:
            metadata_cls = dep_access.get_table_class('ealgis_metadata')
            metadata = self.session.query(metadata_cls).one()
            Dependencies = self.classes['dependencies']
            return True if self.session.query(Dependencies).filter(Dependencies.uuid == metadata.uuid).one_or_none() is not None else False

    def add_dependency(self, required_schema):
        with SchemaAccess(SchemaReflection(required_schema, self.engine)) as dep_access:
            metadata_cls = dep_access.get_table_class('ealgis_metadata')
            metadata = self.session.query(metadata_cls).one()

            if self.has_dependency(required_schema) is False:
                Dependencies = self.classes['dependencies']
                self.session.add(Dependencies(
                    name=required_schema,
                    uuid=metadata.uuid))
                self.session.commit()

    def has_metadata(self):
        EALGISMetadata = self.classes['ealgis_metadata']
        return True if self.session.query(EALGISMetadata).one_or_none() is not None else False

    def set_metadata(self, **kwargs):
        self.session.execute(
            self.tables['ealgis_metadata'].insert().values(**kwargs))
        self.session.commit()

    def is_table_registered(self, table_name):
        TableInfo = self.classes['table_info']
        return True if self.session.query(TableInfo).filter(TableInfo.name == table_name).one_or_none() is not None else False

    def result(self):
        return DataLoaderResult(
            self._schema_name,
            self.engine.engine.url,
            self.engine.engine.url.password)


class DataLoaderResult:
    def __init__(self, schema_name, engine_url, dbpassword):
        self._engine_url = engine_url
        self._dbpassword = dbpassword
        self._schema_name = schema_name

    def dump(self, target_dir):
        target_file = os.path.join(target_dir, '%s.dump' % self._schema_name)
        logger.info("dumping database: %s" % target_file)
        # FIXME: don't litter the environment
        os.environ['PGPASSWORD'] = self._dbpassword
        shp_cmd = [
            "pg_dump",
            str(self._engine_url),
            "--schema=%s" % self._schema_name,
            "--format=c",
            "--file=%s" % target_file]

        stdout, stderr, code = cmdrun(shp_cmd)
        if code != 0:
            raise Exception("database dump with pg_dump failed: %s." % stderr)
        else:
            logger.info("successfully dumped database to %s" % target_file)
            logger.info("load with: pg_restore --username=user --dbname=db /path/to/%s" % self._schema_name)
            logger.info("then run VACUUM ANALYZE;")
