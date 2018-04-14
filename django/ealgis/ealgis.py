import os

import sqlalchemy as sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .tiles import Tiles
from .materialised_views import MaterialisedViews


class NoMatches(Exception):
    pass


class TooManyMatches(Exception):
    pass


class CompilationError(Exception):
    pass


class ValueError(Exception):
    pass


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

        self.db = create_engine(self._connection_string())
        Session = sessionmaker()
        Session.configure(bind=self.db)
        self.session = Session()

        # self.schema_names = None
        # self.schemas = None
        self.datainfo = None
        self.tableinfo = None

    def _connection_string(self):
        # try and autoconfigure for running under docker
        dbuser = os.environ.get('DB_USERNAME')
        dbpassword = os.environ.get('DB_PASSWORD')
        dbhost = os.environ.get('DB_HOST')
        dbport = os.environ.get('DB_PORT')
        dbname = os.environ.get('DB_NAME')
        if dbuser and dbpassword and dbhost:
            return 'postgres://%s:%s@%s:%s/%s' % (dbuser, dbpassword, dbhost, dbport, dbname)
        return 'postgres:///ealgis'

    def get_table_classes(self, table_names, schema_name):
        """
        required for cases like eal.resolve_attribute() where one query needs to join
        across multiple tables from the same Base
        """
        from sqlalchemy.ext.automap import automap_base
        metadata = sqlalchemy.MetaData()

        onlylist = ["table_info", "column_info", "geometry_source", "geometry_linkage"]
        for table_name in table_names:
            if table_name not in onlylist:
                onlylist.append(table_name)

        metadata.reflect(bind=self.db.engine,
                         only=onlylist, schema=schema_name)
        b = automap_base(metadata=metadata)
        b.prepare()

        return [b.classes[t] for t in table_names]

    def get_table_class(self, table_name, schema_name):
        """
        use SQLAlchemy's automap magic to reflect a table on-the-fly
        saves having to reflect all tables on startup (the census alone us ~5,000 tables!)
        """
        return self.get_table_classes([table_name], schema_name)[0]

    def get_data_info(self, table_name, schema_name):
        geometrysource, tableinfo = self.get_table_classes(
            ["geometry_source", "table_info"], schema_name)
        return self.session.query(geometrysource).join(geometrysource.table_info).filter(tableinfo.name == table_name).first().table_info

    def get_table_info_by_id(self, table_id, schema_name):
        geometrysource, tableinfo = self.get_table_classes(
            ["geometry_source", "table_info"], schema_name)
        return self.session.query(tableinfo).filter(tableinfo.id == table_id).first()

    def get_table_info_by_ids(self, table_ids, schema_name):
        geometrysource, tableinfo = self.get_table_classes(
            ["geometry_source", "table_info"], schema_name)
        return self.session.query(tableinfo).filter(tableinfo.id.in_(table_ids)).all()

    def get_geometry_source(self, table_name, schema_name):
        geometrysource, tableinfo = self.get_table_classes(
            ["geometry_source", "table_info"], schema_name)
        return self.session.query(geometrysource).join(geometrysource.table_info).filter(tableinfo.name == table_name).one()

    def get_geometry_source_columns(self, geometry_source, schema_name):
        geometry_source_column = self.get_table_class(
            "geometry_source_column", schema_name)
        return self.session.query(geometry_source_column).filter(geometry_source_column.geometry_source_id == geometry_source.id).all()

    def get_column_info_by_names(self, column_names, schema_name, geo_source_id=None):
        columninfo, geometrylinkage, tableinfo = self.get_table_classes(
            ["column_info", "geometry_linkage", "table_info"], schema_name)
        query = self.session.query(columninfo, geometrylinkage, tableinfo)\
                    .outerjoin(geometrylinkage, columninfo.table_info_id == geometrylinkage.table_info_id)\
                    .outerjoin(tableinfo, columninfo.table_info_id == tableinfo.id)\

        if geo_source_id is not None:
            query = query.filter(
                geometrylinkage.geometry_source_id == geo_source_id)

        column_names = [item.lower() for item in column_names]
        return query.filter(sqlalchemy.func.lower(columninfo.name).in_(column_names)).all()

    def get_column_info_by_name(self, column_name, schema_name, geo_source_id=None):
        return self.get_column_info_by_name([column_name], schema_name, geo_source_id=None)

    def resolve_attribute(self, geometry_source, attribute):
        # upper case tables or columns seem unlikely, but a possible FIXME
        attribute = attribute.lower()
        # supports table_name.column_name OR just column_name
        s = attribute.split('.', 1)

        ColumnInfo, GeometryLinkage, TableInfo = self.get_table_classes(
            ["column_info", "geometry_linkage", "table_info"], geometry_source.__table__.schema)

        q = self.session.query(ColumnInfo, GeometryLinkage.id).join(
            TableInfo).join(GeometryLinkage)
        if len(s) == 2:
            q = q.filter(TableInfo.name == s[0])
            attr_name = s[1]
        else:
            attr_name = s[0]
        q = q.filter(GeometryLinkage.geometry_source_id == geometry_source.id).filter(ColumnInfo.name == attr_name)
        matches = q.all()
        if len(matches) > 1:
            raise TooManyMatches(attribute)
        elif len(matches) == 0:
            raise NoMatches(attribute)
        else:
            ci, linkage_id = matches[0]
            return self.session.query(GeometryLinkage).get(linkage_id), ci

    def def_get_summary_stats_for_layer(self, layer):
        SQL_TEMPLATE = """
            SELECT
                MIN(sq.q),
                MAX(sq.q),
                STDDEV(sq.q)
            FROM ({query}) AS sq"""

        (min, max, stddev) = self.session.execute(
            SQL_TEMPLATE.format(query=layer["_postgis_query"])).first()

        return {
            "min": min,
            "max": max,
            "stddev": stddev if stddev is not None else 0,
        }

    def get_tile(self, query, x, y, z):
        return Tiles.get_tile(self, query, x, y, z)

    def get_tile_mv(self, layer, x, y, z):
        return Tiles.get_tile_mv(self, layer, x, y, z)

    def create_materialised_view_for_table(self, table_name, schema_name, execute):
        return MaterialisedViews.create_materialised_view_for_table(self, table_name, schema_name, execute)
