import json
import os

import sqlalchemy as sqlalchemy
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker


class NoMatches(Exception):
    pass


class TooManyMatches(Exception):
    pass


class CompilationError(Exception):
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

        self.schemas = None
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

        onlylist = ["table_info", "column_info", "geometry_source_projected", "geometry_source", "geometry_linkage"]
        for table_name in table_names:
            if table_name not in onlylist:
                onlylist.append(table_name)

        metadata.reflect(bind=self.db.engine, only=onlylist, schema=schema_name)
        b = automap_base(metadata=metadata)
        b.prepare()

        return [b.classes[t] for t in table_names]

    def get_table_class(self, table_name, schema_name):
        """
        use SQLAlchemy's automap magic to reflect a table on-the-fly
        saves having to reflect all tables on startup (the census alone us ~5,000 tables!)
        """
        return self.get_table_classes([table_name], schema_name)[0]

    def is_compliant_schema(self, schema_name):
        """determines if a given schema is EAlGIS-compliant"""

        # Tables required for a schemas to be EAlGIS-compliant
        required_tables = ["table_info", "column_info", "geometry_linkage",
                           "geometry_source", "geometry_source_projected"]

        inspector = inspect(self.db)
        table_names = inspector.get_table_names(schema=schema_name)

        if not set(required_tables).issubset(table_names):
            return False

        if "ealgis_metadata" in table_names:
            return True

        return False

    def get_schemas(self, skip_cache=False):
        """identify and load EAlGIS-compliant schemas available in the database"""

        def make_schemas():
            # PostgreSQL and PostGIS system schemas
            system_schemas = ["information_schema", "tiger", "tiger_data", "topology", "public"]

            inspector = inspect(self.db)

            schemas = []
            for schema_name in inspector.get_schema_names():
                if schema_name not in system_schemas:
                    if self.is_compliant_schema(schema_name):
                        schemas.append(schema_name)
            return schemas

        if skip_cache is True or self.schemas is None:
            self.schemas = make_schemas()
        return self.schemas

    def get_datainfo(self):
        """grab a representation of the spatial data available in the database
        result is cached, so after first call this is fast"""

        # def dump_linkage(linkage):
        #     name = linkage.attribute_table.name
        #     if linkage.attribute_table.metadata_json is not None:
        #         obj = json.loads(linkage.attribute_table.metadata_json)
        #     else:
        #         obj = {}
        #     obj['_id'] = linkage.id
        #     return name, obj

        def dump_source(source):
            if source.table_info.metadata_json is not None:
                source_info = json.loads(source.table_info.metadata_json)
            else:
                source_info = {'description': source.table_info.name}
            source_info['_id'] = source.id

            # source_info['tables'] = dict(dump_linkage(t) for t in source.linkages)
            source_info['geometry_type'] = source.geometry_type
            source_info['name'] = source.table_info.name
            source_info['schema_name'] = source.__table__.schema
            return source_info

        def make_datainfo():
            # our geography sources
            info = {}

            for schema_name in self.get_schemas():
                geometrysource, tableinfo = self.get_table_classes(["geometry_source", "table_info"], schema_name)

                for source in self.session.query(geometrysource).all():
                    name = "{}.{}".format(schema_name, source.table_info.name)
                    info[name] = dump_source(source)
            return info

        if self.datainfo is None:
            self.datainfo = make_datainfo()
        return self.datainfo

    def get_tableinfo(self):
        """grab a representation of the tabular data available in the database
        result is cached, so after first call this is fast"""

        def dump_table_info(table):
            if table.metadata_json is not None:
                table_info = json.loads(table.metadata_json)
            else:
                table_info = {'description': table.name}
            table_info['_id'] = table.id

            table_info['name'] = table.name
            table_info['schema_name'] = table.__table__.schema
            return table_info

        def make_tableinfo():
            # our tabular sources
            info = {}

            for schema_name in self.get_schemas():
                tableinfo = self.get_table_class("table_info", schema_name)
                geodata_tables = [v["name"] for (k, v) in self.get_datainfo().items()]

                for table_info in self.session.query(tableinfo).all():
                    if table_info.name not in geodata_tables:
                        name = "{}.{}".format(schema_name, table_info.name)
                        info[name] = dump_table_info(table_info)
            return info

        if self.tableinfo is None:
            self.tableinfo = make_tableinfo()
        return self.tableinfo

    def get_data_info(self, table_name, schema_name):
        geometrysource, tableinfo = self.get_table_classes(["geometry_source", "table_info"], schema_name)
        return self.session.query(geometrysource).join(geometrysource.table_info).filter(tableinfo.name == table_name).first().table_info

    def get_table_info(self, table_name, schema_name):
        geometrysource, tableinfo = self.get_table_classes(["geometry_source", "table_info"], schema_name)
        return self.session.query(tableinfo).outerjoin(geometrysource, tableinfo.id == geometrysource.tableinfo_id).filter(tableinfo.name == table_name).filter(geometrysource.tableinfo_id is None).first()

    def get_geometry_source(self, table_name, schema_name):
        geometrysource, tableinfo = self.get_table_classes(["geometry_source", "table_info"], schema_name)
        return self.session.query(geometrysource).join(geometrysource.table_info).filter(tableinfo.name == table_name).one()

    def get_geometry_source_by_id(self, id, schema_name):
        geometrysource = self.get_table_class("geometry_source", schema_name)
        return self.query(geometrysource).filter(geometrysource.id == id).one()

    def get_geometry_source_info_by_gid(self, table_name, gid, schema_name):
        table = self.get_table_class(table_name, schema_name)
        row = self.session.query(table).filter(table.gid == gid).first()

        # FIXME Ugly hack
        dict = row.__dict__
        del dict["geom"]
        del dict["geom_3857"]
        del dict["geom_3112"]
        del dict["_sa_instance_state"]

        return dict

    def resolve_attribute(self, geometry_source, attribute):
        attribute = attribute.lower()  # upper case tables or columns seem unlikely, but a possible FIXME
        # supports table_name.column_name OR just column_name
        s = attribute.split('.', 1)

        ColumnInfo, GeometryLinkage, TableInfo = self.get_table_classes(["column_info", "geometry_linkage", "table_info"], geometry_source.__table__.schema)

        q = self.session.query(ColumnInfo, GeometryLinkage.id).join(TableInfo).join(GeometryLinkage)
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
            return self.session.query(GeometryLinkage).get(linkage_id), ci

    def get_tile(self, query, x, y, z):
        def create_vectortile_sql(query, bounds):
            # Sets the number of decimal places per GeoJSON coordinate to reduce response size
            # (e.g. 10 decimal places per lat/long in 100 polygons with 50 sets of coords is 2 * 10 * 100 * 50 = 100,000 bytes uncompressed
            # dropping 6 decimal places would save 60,000 bytes per request)
            def setDecimalPlaces():
                # Sets the tolerance in degrees to thin (aka simplify or generalise) the vector data on the server before it's returned
                def tolerance():
                    # Standard width of a single 256 pixel map tile at zoom level one
                    stdTileWidth = 78271.52
                    # Rough (based on equatorial radius of the Earth), but more than adequate for online mapping
                    metres2Degrees = (2 * math.pi * 6378137) / 360

                    return (stdTileWidth / math.pow(2, z - 1)) / metres2Degrees

                tolerance = tolerance()
                places = 0
                precision = 1.0

                while (precision > tolerance):
                    places += 1
                    precision /= 10

                return places

            import math

            srid = "3857"
            west, south = mercantile.xy(bounds.west, bounds.south)
            east, north = mercantile.xy(bounds.east, bounds.north)

            decimalPlaces = setDecimalPlaces()

            resolution = 6378137.0 * 2.0 * math.pi / 256.0 / math.pow(2.0, z)
            tolerance = resolution / 20

            # A bit of a hack - assign the minimum area a feature must have to be visible at each zoom level.
            # if(z <= 4):
            #     min_area = 2500000
            # elif(z <= 8):
            #     # min_area = 350000
            #     min_area = 1000000
            # elif(z <= 12):
            #     min_area = 50000
            # elif(z <= 16):
            #     min_area = 2000
            # else:
            #     min_area = 0 # Display all features beyond zoom 16

            # Marginally less hacky - scale the min area based on the resolution
            min_area = resolution * 1000

            # For PBF in Python-land
            # SCALE = 4096
            # geomtrans = 'ST_AsText(ST_TransScale(%s, %.12f, %.12f, %.12f, %.12f)) AS geom' % ("_clip_geom", -west, -south, SCALE / (east - west), SCALE / (north - south))

            # @TODO Replace ST_Intersection() with ST_ClipByBox2d() when we upgrade PostGIS/GEOS (Wrap around ST_Simplify(...)).
            SQL_TEMPLATE = """
                WITH _conf AS (
                    SELECT
                        20 AS magic,
                        {res} AS res,
                        {decimalPlaces} AS decimal_places,
                        {min_area} AS min_area,
                        {tolerance} AS tolerance,
                        ST_SetSRID(ST_MakeBox2D(ST_MakePoint({west}, {south}), ST_MakePoint({east}, {north})), {srid}) AS extent
                    ),
                    -- end conf
                    _geom AS (
                        SELECT ST_Simplify(
                            ST_SnapToGrid(
                                CASE WHEN ST_CoveredBy(geom_3857, extent) = FALSE THEN geom_3857 ELSE ST_Intersection(geom_3857, extent) END,
                            res/magic, res/magic),
                            tolerance) AS _clip_geom,
                        * FROM (
                            -- main query
                            {query}
                            ) _wrap, _conf
                        WHERE geom_3857 && extent AND ST_Area(geom_3857) >= min_area
                    )
                    -- end geom
                SELECT gid, q,
                    ST_AsGeoJSON(ST_Transform(_clip_geom, 4326), _conf.decimal_places) AS geom
                    FROM _geom, _conf
                    WHERE NOT ST_IsEmpty(_clip_geom)"""

            return SQL_TEMPLATE.format(res=resolution, decimalPlaces=decimalPlaces, min_area=min_area, tolerance=tolerance, query=query, west=west, south=south, east=east, north=north, srid=srid)

        # Wrap EALGIS query in a PostGIS query to produce a vector tile
        import mercantile
        vt_query = create_vectortile_sql(query, bounds=mercantile.bounds(x, y, z))
        return self.session.execute(vt_query)
