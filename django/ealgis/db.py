from sqlalchemy import inspect
from geoalchemy2.types import Geometry
from sqlalchemy import create_engine, not_
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from ealgis_data_schema.schema_v1 import store
from collections import Counter
import os
import sqlalchemy

Base = declarative_base()

# WIP! Once finished move back to ealgis_common


class DatabaseAccess:
    # def __init__(self, engine, schema_name):
    #     self._table_names_used = Counter()
    #     #
    #     self.engine = engine
    #     Session = sessionmaker()
    #     Session.configure(bind=self.engine)
    #     self.session = Session()
    #     self._schema_name = schema_name
    #     #
    #     _, tables = store.load_schema(schema_name)
    #     self.tables = dict((t.name, t) for t in tables)
    #     self.classes = dict((t.name, self.get_table_class(t.name)) for t in tables)

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
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


class SchemaLoader(DatabaseAccess):
    def __init__(self, engine):
        self._table_names_used = Counter()
        #
        self.engine = engine
        Session = sessionmaker()
        Session.configure(bind=self.engine)
        self.session = Session()
        #
        inspector = inspect(self.engine)
        self.schemas = inspector.get_schema_names()

    def get_schemas(self):
        return self.schemas

    def get_ealgis_schemas(self):
        def is_compliant_schema(schema_name):
            """determines if a given schema is EAlGIS-compliant"""

            required_tables = ["ealgis_metadata", "table_info", "column_info", "geometry_linkage", "geometry_source", "geometry_source_projection"]

            inspector = inspect(self.engine)
            table_names = inspector.get_table_names(schema=schema_name)

            if set(required_tables).issubset(table_names):
                return True
            return False

        # PostgreSQL and PostGIS system schemas
        system_schemas = ["information_schema", "tiger", "tiger_data", "topology", "public"]

        schemas = []
        for schema_name in self.get_schemas():
            if schema_name not in system_schemas:
                if is_compliant_schema(schema_name):
                    schemas.append(schema_name)
        return schemas


class DataAccess(DatabaseAccess):
    def __init__(self, engine, schema_name):
        self._table_names_used = Counter()
        #
        self.engine = engine
        Session = sessionmaker()
        Session.configure(bind=self.engine)
        self.session = Session()
        self._schema_name = schema_name
        #
        _, tables = store.load_schema(schema_name)
        self.tables = dict((t.name, t) for t in tables)
        self.classes = dict((t.name, self.get_table_class(t.name)) for t in tables)

    def access_schema(self, schema_name):
        return DataAccess(self.engine, schema_name)

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
        # nothing bad happens if there is a clash, but it produces warnings
        self._table_names_used[table_name] += 1
        nm = "Table_%s_%d" % (table_name, self._table_names_used[table_name])
        return type(nm, (Base,), {'__table__': self.get_table(table_name)})

    def get_metadata(self):
        EalgisMetadata = self.classes['ealgis_metadata']
        try:
            return self.session.query(EalgisMetadata).first()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve ealgis_metadata table")

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

    def get_table_info(self, table_name):
        TableInfo = self.classes['table_info']
        try:
            return self.session.query(TableInfo).filter(TableInfo.name == table_name).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve table_info row for `{}'".format(table_name))

    def get_table_info_by_id(self, table_id):
        TableInfo = self.classes['table_info']
        try:
            return self.session.query(TableInfo).filter(TableInfo.id == table_id).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve table_info row for `{}'".format(table_id))

    def get_geometry_source(self, table_name):
        TableInfo = self.classes['table_info']
        GeometrySource = self.classes['geometry_source']
        try:
            return self.session.query(GeometrySource).join(TableInfo, TableInfo.id == GeometrySource.table_info_id).filter(TableInfo.name == table_name).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve geometry_source row for `{}'".format(table_name))

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

    def get_column_info(self, id):
        ColumnInfo = self.classes['column_info']
        try:
            return self.session.query(ColumnInfo).filter(ColumnInfo.id == id).one()
        except sqlalchemy.orm.exc.NoResultFound:
            raise Exception("could not retrieve column_info row for id `{}'".format(id))

    def get_summary_stats_for_column(self, column, table):
        SQL_TEMPLATE = """
            SELECT
                MIN(sq.q),
                MAX(sq.q),
                STDDEV(sq.q)
            FROM (SELECT {col_name} AS q FROM {schema_name}.{table_name}) AS sq"""

        (min, max, stddev) = self.session.execute(
            SQL_TEMPLATE.format(col_name=column.name, schema_name=self._schema_name, table_name=table.name)).first()

        return {
            "min": min,
            "max": max,
            "stddev": stddev,
        }

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
