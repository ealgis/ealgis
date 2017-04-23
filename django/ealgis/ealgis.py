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

    def get_geometry_source_info_by_gid(self, table_name, gid, schema_name):
        table = self.get_table_class(table_name, schema_name)
        row = self.session.query(table).filter(table.gid == gid).first()

        # FIXME Ugly hack - We have no models for the indivudal geom tables, but could use reflection?
        dict = row.__dict__
        del dict["geom"]
        del dict["geom_3857"]
        del dict["geom_3112"]
        del dict["_sa_instance_state"]

        return dict

    def get_column_info(self, column_id, schema_name):
        columninfo = self.get_table_class("column_info", schema_name)
        return self.session.query(columninfo).filter(columninfo.id == column_id).first()

    def get_column_info_by_name(self, column_name, schema_name, geo_source_id=None):
        columninfo, geometrylinkage = self.get_table_classes(["column_info", "geometry_linkage"], schema_name)
        query = self.session.query(columninfo, geometrylinkage).outerjoin(geometrylinkage, columninfo.tableinfo_id == geometrylinkage.attr_table_info_id)

        if geo_source_id is not None:
            query = query.filter(geometrylinkage.geo_source_id == geo_source_id)
        query = query.filter(columninfo.name == column_name).all()
        return query

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

    def get_tile_mv(self, layer, x, y, z):
        def create_vectortile_sql(layer, bounds):
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
            # SQL_TEMPLATE = """
            #     WITH _conf AS (
            #         SELECT
            #             20 AS magic,
            #             {res} AS res,
            #             {decimalPlaces} AS decimal_places,
            #             {min_area} AS min_area,
            #             {tolerance} AS tolerance,
            #             ST_SetSRID(ST_MakeBox2D(ST_MakePoint({west}, {south}), ST_MakePoint({east}, {north})), {srid}) AS extent
            #         ),
            #         -- end conf
            #         _geom AS (
            #             SELECT ST_Simplify(
            #                 ST_SnapToGrid(
            #                     CASE WHEN ST_CoveredBy(geom_3857, extent) = FALSE THEN geom_3857 ELSE ST_Intersection(geom_3857, extent) END,
            #                 res/magic, res/magic),
            #                 tolerance) AS _clip_geom,
            #             * FROM (
            #                 -- main query
            #                 {query}
            #                 ) _wrap, _conf
            #             WHERE geom_3857 && extent AND ST_Area(geom_3857) >= min_area
            #         )
            #         -- end geom
            #     SELECT gid, q,
            #         ST_AsGeoJSON(ST_Transform(_clip_geom, 4326), _conf.decimal_places) AS geom

            #         FROM _geom, _conf
            #         WHERE NOT ST_IsEmpty(_clip_geom)"""

            SQL_TEMPLATE_NO_SIMPLIFICATION = """
                WITH _conf AS (
                    SELECT
                        {decimalPlaces} AS decimal_places,
                        ST_SetSRID(ST_MakeBox2D(ST_MakePoint({west}, {south}), ST_MakePoint({east}, {north})), {srid}) AS extent
                    ),
                    -- end conf
                    _geom AS (
                        SELECT geom_3857 AS _clip_geom,
                        * FROM (
                            -- main query
                            {query}
                            ) _wrap, _conf
                        WHERE geom_3857 && extent
                    )
                    -- end geom
                SELECT gid, q,
                    ST_AsGeoJSON(ST_Transform(_clip_geom, 4326), _conf.decimal_places) AS geom
                    FROM _geom, _conf
                    WHERE NOT ST_IsEmpty(_clip_geom)"""

            SQL_TEMPLATE_MATVIEW = """
                WITH _conf AS (
                    SELECT
                        {decimalPlaces} AS decimal_places,
                        ST_SetSRID(ST_MakeBox2D(ST_MakePoint({west}, {south}), ST_MakePoint({east}, {north})), {srid}) AS extent
                    ),
                    -- end conf
                    _geom AS (
                        SELECT
                            {geom_column_name},
                            gid, q
                        FROM (
                        -- main query
                        {query}
                        ) _wrap, _conf
                        WHERE {geom_column_name} && extent
                    )
                    -- end geom
                SELECT gid, q,
                    ST_AsGeoJSON(ST_Transform({geom_column_name}, 4326), _conf.decimal_places) AS geom
                    FROM _geom, _conf"""

            # For server-side GeoJSON creation
            # Access with:
            # return Response(results.fetchone()["jsonb_build_object"], headers=headers)
            # SQL_TEMPLATE_MATVIEW_JSONB = """
            #     WITH _conf AS (
            #         SELECT
            #             {decimalPlaces} AS decimal_places,
            #             ST_SetSRID(ST_MakeBox2D(ST_MakePoint({west}, {south}), ST_MakePoint({east}, {north})), {srid}) AS extent
            #         ),
            #         -- end conf
            #         _geom AS (
            #             SELECT
            #                 {geom_column_name},
            #                 gid, q
            #             FROM (
            #             -- main query
            #             {query}
            #             ) _wrap, _conf
            #             WHERE {geom_column_name} && extent
            #         )
            #         -- end geom
            #     SELECT
            #         jsonb_build_object(
            #             'type',     'FeatureCollection',
            #             'features', jsonb_agg(features.jsonb_build_object)
            #         )
            #     FROM
            #         (SELECT
            #             jsonb_build_object(
            #                 'type',       'Feature',
            #                 'id',         gid,
            #                 'geometry',   ST_AsGeoJSON({geom_column_name}, _conf.decimal_places)::jsonb,
            #                 'properties', to_jsonb(row) - 'gid' - '{geom_column_name}'
            #             )
            #         FROM
            #             (SELECT
            #                 gid, q,
            #                 ST_Transform({geom_column_name}, 4326) AS geom
            #                 FROM _geom, _conf
            #             ) AS row, _conf
            #         ) AS features"""

            def get_geom_column_name(layer_hash, zoom_level):
                if zoom_level <= 5:
                    return "geom_3857_z5"
                elif zoom_level <= 7:
                    return "geom_3857_z7"
                elif zoom_level <= 9:
                    return "geom_3857_z9"
                elif zoom_level <= 11:
                    return "geom_3857_z11"
                else:
                    return "geom_3857"

            # Use materialised view
            if True:
                geomColumnName = get_geom_column_name(layer["hash"], z)

                # Substitute our materialised view table in the stored query
                geomTableName = "{schema_name}.{geometry_name}".format(geometry_name=layer["geometry"], schema_name=layer["schema"])
                matViewName = "{schema_name}.{geometry_name}_view".format(schema_name=layer["schema"], geometry_name=layer["geometry"])
                query = layer["_postgis_query"].replace(geomTableName, matViewName)

                # Substitute in our zoom-level specific geom column name
                query = query.replace(".geom_3857", ".{geom_column_name}".format(geom_column_name=geomColumnName))

                # print("Use matview column {} for zoom {}".format(geomColumnName, z))
                sql = SQL_TEMPLATE_MATVIEW.format(decimalPlaces=decimalPlaces, geom_column_name=geomColumnName, query=query, west=west, south=south, east=east, north=north, srid=srid)
                # print(sql)
                return sql

            # Use raw query
            else:
                print("Use raw query")
                return SQL_TEMPLATE_NO_SIMPLIFICATION.format(res=resolution, decimalPlaces=decimalPlaces, min_area=min_area, tolerance=tolerance, query=layer["_postgis_query"], west=west, south=south, east=east, north=north, srid=srid)

        # Wrap EALGIS query in a PostGIS query to produce a vector tile
        import mercantile
        vt_query = create_vectortile_sql(layer, bounds=mercantile.bounds(x, y, z))
        return self.session.execute(vt_query)

    def create_materialised_view_for_table(self, table_name, schema_name, execute):
        # Zoom levels to generate geometry columns for
        ZOOM_LEVELS = [5, 7, 9, 11]
        sqlLog = []  # For dumping SQL back to the client

        def getViewName(table_name):
            return "{table_name}_view".format(table_name=table_name)

        def getGeomColumnDefinition(table_name, schema_name, zoom_level):
            # FIXME If we end up keeping this approach then do some math that isn't purely back-of-the-napkin
            # to work out the area of a pixel at each zoom level so we can do a better job of ejecting and
            # simplifying features.

            import math
            resolution = 6378137.0 * 2.0 * math.pi / 256.0 / math.pow(2.0, zoom_level)
            tolerance = resolution / 20
            if zoom_level <= 7:
                min_area = resolution * 200
            elif zoom_level <= 9:
                min_area = resolution * 400
            else:
                min_area = resolution * 500

            GEOM_COLUMN_DEF = """
                CASE WHEN ST_Area(geomtable.geom_3857) >= {min_area} THEN
                    ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, {res}/20, {res}/20),
                        {tolerance}
                    )
                ELSE NULL END AS geom_3857_z{zoom_level},"""

            return GEOM_COLUMN_DEF.format(min_area=min_area, res=resolution, tolerance=tolerance, zoom_level=zoom_level)

        def getGeomColumnIndexDefinition(view_name, schema_name, zoom_level):
            GEOM_COLUMN_IDX = 'CREATE INDEX "{view_name}_geom_3857_z{zoom_level}_gist" ON "{schema_name}"."{view_name}" USING GIST ("geom_3857_z{zoom_level}")'
            return GEOM_COLUMN_IDX.format(view_name=view_name, schema_name=schema_name, zoom_level=zoom_level)

        view_name = getViewName(table_name)

        # Nuke the view if it exists already
        NUKE_EXISTING_MATVIEW = "DROP MATERIALIZED VIEW IF EXISTS {schema_name}.{view_name}".format(schema_name=schema_name, view_name=view_name)

        if execute:
            self.session.execute(NUKE_EXISTING_MATVIEW)
            self.session.commit()
        else:
            sqlLog.append(NUKE_EXISTING_MATVIEW)

        # Create the materialised view
        geomColumnDefsSQL = []
        for zoom_level in ZOOM_LEVELS:
            geomColumnDefsSQL.append(getGeomColumnDefinition(table_name, schema_name, zoom_level))

        MATVIEW_SQL_DEF = """
            CREATE MATERIALIZED VIEW {schema_name}.{view_name} AS
                SELECT
                    {geom_column_defs}
                    geomtable.*
                FROM {schema_name}.{table_name} AS geomtable"""
        MATVIEW_SQL_DEF = MATVIEW_SQL_DEF.format(schema_name=schema_name, view_name=view_name, geom_column_defs="".join(geomColumnDefsSQL), table_name=table_name)

        if execute:
            self.session.execute(MATVIEW_SQL_DEF)
        else:
            sqlLog.append(MATVIEW_SQL_DEF)

        # Create indexes on our zoom-level specific geometry columns
        # @TODO Wot does the "default to the original geom" query use?
        for zoom_level in ZOOM_LEVELS:
            GEOM_COLUMN_IDX = getGeomColumnIndexDefinition(view_name, schema_name, zoom_level)

            if execute:
                self.session.execute(GEOM_COLUMN_IDX)
            else:
                sqlLog.append(GEOM_COLUMN_IDX)

        # Copy non-geometry indexes from the original table
        from sqlalchemy.engine import reflection
        insp = reflection.Inspector.from_engine(self.db)

        for index in insp.get_indexes(table_name, schema=schema_name):
            index_name = index["name"].replace(table_name, table_name + "_view")

            if "dialect_options" in index and "postgresql_using" in index["dialect_options"]:
                index_type = index["dialect_options"]["postgresql_using"]
                IDX_DEF = 'CREATE INDEX "{index_name}" ON "{schema_name}"."{view_name}" USING {index_type} ("{column_name}")'.format(index_name=index_name, schema_name=schema_name, view_name=view_name, index_type=index_type, column_name=index["column_names"][0])
            elif "unique" in index and index["unique"] is True:
                IDX_DEF = 'CREATE UNIQUE INDEX "{index_name}" ON "{schema_name}"."{view_name}" ("{column_name}")'.format(index_name=index_name, schema_name=schema_name, view_name=view_name, column_name=index["column_names"][0])
            else:
                # print("Skipping {}".format(index_name))
                # print(index)
                continue

            if execute:
                self.session.execute(IDX_DEF)
            else:
                sqlLog.append(IDX_DEF)

        # And, lastly, an index for the primary key on the master table
        GID_IDX_DEF = 'CREATE UNIQUE INDEX "{view_name}_gid_idx" ON "{schema_name}"."{view_name}" ("gid");'.format(schema_name=schema_name, view_name=view_name)
        if execute:
            self.session.execute(GID_IDX_DEF)
        else:
            sqlLog.append(GID_IDX_DEF)

        # Now commit everything in one go
        if execute:
            self.session.commit()
            return "{schema_name}.{view_name}".format(schema_name=schema_name, view_name=view_name)
        else:
            return {
                "name": "{schema_name}.{view_name}".format(schema_name=schema_name, view_name=view_name),
                "sql": ";\n".join(sqlLog),
            }
