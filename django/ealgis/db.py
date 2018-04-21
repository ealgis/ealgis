from functools import lru_cache
from sqlalchemy import inspect
from geoalchemy2.types import Geometry
from sqlalchemy import create_engine, not_
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from ealgis_data_schema.schema_v1 import store
from collections import Counter
import os
import sqlalchemy
import atexit

Base = declarative_base()


class DataAccessBroker:
    def __init__(self):
        self.providers = {}

    def Provide(self, schema_name):
        if schema_name in self.providers:
            return self.providers[schema_name]
        self.providers[schema_name] = DataAccess(DataAccess.make_engine(), schema_name)
        return self.providers[schema_name]

    def cleanup(self):
        for schema_name, provider in self.providers.items():
            provider.cleanup()


broker = DataAccessBroker()


def exit_handler():
    broker.cleanup()


atexit.register(exit_handler)

# WIP! Once finished move back to ealgis_common?


class DataAccess():
    def __init__(self, engine, schema_name=None):
        self._table_names_used = Counter()
        #
        self.engine = engine
        Session = sessionmaker()
        Session.configure(bind=self.engine)
        self.session = Session()
        self._schema_name = schema_name
        #
        self.inspector = inspect(self.engine)
        self.schemas = self.inspector.get_schema_names()
        #
        self.classes = {}
        if schema_name is not None:
            _, tables = store.load_schema(schema_name)
            self.tables = dict((t.name, t) for t in tables)
            #
            self.classes = dict((t.name, self.get_table_class(t.name)) for t in tables)

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self.cleanup()

    def cleanup(self):
        self.session.close()
        del self.engine

    @classmethod
    def make_engine(cls, db_name=os.environ.get("DB_NAME")):
        return create_engine(cls.make_connection_string(db_name))

    @classmethod
    def make_connection_string(cls, db_name):
        dbuser = os.environ.get('DB_USERNAME')
        dbpassword = os.environ.get('DB_PASSWORD')
        dbhost = os.environ.get('DB_HOST')
        return 'postgres://%s:%s@%s:5432/%s' % (dbuser, dbpassword, dbhost, db_name)

    def engineurl(self):
        return self.engine.engine.url

    def dbname(self):
        return self.engine.engine.url.database

    def dbhost(self):
        return self.engine.engine.url.host

    def dbuser(self):
        return self.engine.engine.url.username

    def dbport(self):
        return self.engine.engine.url.port

    def dbschema(self):
        return self._schema_name

    def dbpassword(self):
        return self.engine.engine.url.password

    def access_schema(self, schema_name):
        return DataAccess(self.engine, schema_name)

    '''
    Schema Accessors
    '''

    def get_schemas(self):
        return self.schemas

    def is_system_schema(self, schema_name):
        # PostgreSQL and PostGIS system schemas
        system_schemas = ["information_schema", "tiger", "tiger_data", "topology", "public"]
        return schema_name in system_schemas

    def has_required_ealgis_tables(self, schema_name):
        required_tables = ["ealgis_metadata", "table_info", "column_info", "geometry_linkage", "geometry_source", "geometry_source_projection"]
        table_names = self.inspector.get_table_names(schema=schema_name)
        return set(required_tables).issubset(table_names)

    @lru_cache(maxsize=None)
    def get_geometry_schemas(self):
        def is_compliant_schema(schema_name):
            """determines if a given schema is EAlGIS-compliant"""

            if self.has_required_ealgis_tables(schema_name):
                db = broker.Provide(schema_name)
                GeometrySource = db.get_table_class("geometry_source")

                # The schema must have at least some rows in geometry_sources
                if db.session.query(GeometrySource).first() is not None:
                    return True
            return False

        schemas = []
        for schema_name in self.get_schemas():
            if self.is_system_schema(schema_name) is False:
                if is_compliant_schema(schema_name):
                    schemas.append(schema_name)
        return schemas

    @lru_cache(maxsize=None)
    def get_ealgis_schemas(self):
        def is_compliant_schema(schema_name):
            """determines if a given schema is EAlGIS-compliant"""

            if self.has_required_ealgis_tables(schema_name):
                db = broker.Provide(schema_name)
                ColumnInfo = db.get_table_class("column_info")

                # The schema must have at least some rows in column_info
                # If not, it's probably just a geometry/shapes schema
                if db.session.query(ColumnInfo).first() is not None:
                    return True
            return False

        schemas = []
        for schema_name in self.get_schemas():
            if self.is_system_schema(schema_name) is False:
                if is_compliant_schema(schema_name):
                    schemas.append(schema_name)
        return schemas

    '''
    Database Table Accessors
    '''

    def have_table(self, table_name):
        try:
            self.get_table(table_name)
            return True
        except sqlalchemy.exc.NoSuchTableError:
            return False

    def get_table(self, table_name):
        return sqlalchemy.Table(table_name, sqlalchemy.MetaData(), schema=self._schema_name, autoload=True, autoload_with=self.engine.engine)

    def get_table_names(self):
        "this is a more lightweight approach to getting table names from the db that avoids all of that messy reflection"
        "c.f. http://docs.sqlalchemy.org/en/rel_0_9/core/reflection.html?highlight=inspector#fine-grained-reflection-with-inspector"
        inspector = inspect(self.engine.engine)
        return inspector.get_table_names(schema=self._schema_name)

    def get_table_class(self, table_name):
        # DataAccess operates on a per-schema basis now, so we don't need to worry about clashing of table names
        if table_name in self.classes:
            return self.classes[table_name]
        nm = "Table_%s.%s_%d" % (self._schema_name, table_name, 1)
        tc = type(nm, (Base,), {'__table__': self.get_table(table_name)})
        self.classes[table_name] = tc
        return tc

    def get_table_class_by_id(self, table_id):
        try:
            table_info = self.get_table_info_by_id(table_id)
            return self.get_table_class(table_info.name)
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

    def find_geom_column(self, table_name, srid):
        info = self.get_table(table_name)
        geom_columns = []

        for column in info.columns:
            # GeoAlchemy2 lets us find geometry columns
            if isinstance(column.type, Geometry):
                geom_columns.append(column)

        if len(geom_columns) > 1:
            raise Exception("more than one geometry column for srid '{srid}'?".format(srid=srid))
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

    def get_table_info_by_id(self, table_id, geo_source_id=None):
        GeometryLinkage = self.classes['geometry_linkage']
        TableInfo = self.classes['table_info']
        try:
            query = self.session.query(TableInfo)
            if geo_source_id is not None:
                query = query.join(GeometryLinkage, TableInfo.id == GeometryLinkage.attr_table_id)\
                    .filter(GeometryLinkage.geometry_source_id == geo_source_id)

            return query.filter(TableInfo.id == table_id).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve table_info row for `{}'".format(table_id))

    def get_table_info_by_ids(self, table_ids):
        TableInfo = self.classes['table_info']
        try:
            return self.session.query(TableInfo).filter(TableInfo.id.in_(table_ids)).all()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve column_info a range of column names")

    def get_geometry_relation(self, from_source, to_source):
        GeometryRelation = self.classes['geometry_relation']
        try:
            return self.session.query(GeometryRelation).filter(
                GeometryRelation.geo_source_id == from_source.id,
                GeometryRelation.overlaps_with_id == to_source.id).one()
        except sqlalchemy.orm.exc.NoResultFound:
            return None

    def get_data_tables(self, geo_source_id=None):
        TableInfo = self.classes['table_info']
        try:
            if geo_source_id is None:
                return self.session.query(TableInfo).all()
            else:
                GeometryLinkage = self.classes['geometry_linkage']
                return self.session.query(TableInfo).join(GeometryLinkage, TableInfo.id == GeometryLinkage.attr_table_id).filter(GeometryLinkage.geometry_source_id == geo_source_id).all()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve table_info tables")

    def search_tables(self, search_terms, search_terms_excluded, geo_source_id=None):
        GeometryLinkage = self.classes['geometry_linkage']
        TableInfo = self.classes['table_info']
        try:
            query = self.session.query(TableInfo)\
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
            query = self.session.query(ColumnInfo)

            if geo_source_id is not None:
                query = query.join(TableInfo, ColumnInfo.table_info_id == TableInfo.id)\
                    .join(GeometryLinkage, TableInfo.id == GeometryLinkage.attr_table_id)\
                    .filter(GeometryLinkage.geometry_source_id == geo_source_id)

            column_names = [item.lower().strip() for item in column_names]
            return query.filter(sqlalchemy.func.lower(ColumnInfo.name).in_(column_names)).all()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve column_info a range of column names")

    def get_column_info_by_name(self, column_name, geo_source_id=None):
        return self.get_column_info_by_names([column_name], geo_source_id)

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

    def get_summary_stats_for_column(self, column, table):
        SQL_TEMPLATE = """
            SELECT
                MIN(sq.q),
                MAX(sq.q),
                STDDEV(sq.q)
            FROM (SELECT {col_name} AS q FROM {schema_name}.{table_name}) AS sq"""

        (min, max, stddev) = self.session.execute(SQL_TEMPLATE.format(col_name=column.name, schema_name=self._schema_name, table_name=table.name)).first()

        return {
            "min": min,
            "max": max,
            "stddev": stddev,
        }

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

    def get_schema_metadata(self):
        EalgisMetadata = self.classes['ealgis_metadata']
        try:
            return self.session.query(EalgisMetadata).first()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve ealgis_metadata table")

    def get_summary_stats_for_layer(self, layer):
        SQL_TEMPLATE = """
            SELECT
                MIN(sq.q),
                MAX(sq.q),
                STDDEV(sq.q)
            FROM ({query}) AS sq"""

        (min, max, stddev) = self.session.execute(SQL_TEMPLATE.format(query=layer["_postgis_query"])).first()

        return {
            "min": min,
            "max": max,
            "stddev": stddev if stddev is not None else 0,
        }

    def get_bbox_for_layer(self, layer):
        SQL_TEMPLATE = """
            SELECT
                ST_XMin(latlon_bbox) AS minx,
                ST_XMax(latlon_bbox) AS maxx,
                ST_YMin(latlon_bbox) AS miny,
                ST_YMax(latlon_bbox) as maxy
            FROM (
                SELECT
                    -- Eugh
                    Box2D(ST_GeomFromText(ST_AsText(ST_Transform(ST_SetSRID(ST_Extent(geom_3857), 3857), 4326)))) AS latlon_bbox
                FROM (
                    {query}
                ) AS exp
            ) AS bbox;
        """

        return dict(self.session.execute(SQL_TEMPLATE.format(query=layer["_postgis_query"])).first())
