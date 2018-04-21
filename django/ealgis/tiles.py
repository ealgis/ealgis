import math
from .db import broker


class Tiles:
    @staticmethod
    def get_tile(query, x, y, z):
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
        vt_query = create_vectortile_sql(
            query, bounds=mercantile.bounds(x, y, z))

        db = broker.Provide(None)
        return db.session.execute(vt_query)

    @staticmethod
    def get_tile_mv(layer, x, y, z):
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

            # Buffer the tile extent to ensure the rendered features line up
            # and, importantly, by the size of the border line width to ensure
            # we don't see the clipped borders of tiles.
            tileSize = 256  # pixels
            # Roughly how many metres in a given pixel at this zoom level
            pixelInMetres = (east - west) / tileSize
            minRenderBuffer = 2  # Ensure our buffer is never lower than 2 pixels
            renderBufferPixel = minRenderBuffer

            if "line" in layer and layer["line"]["width"] > 0:
                # 0.5 to ensure the whole tile border is outside the visible part of the tile
                renderBufferPixel = max(minRenderBuffer, math.ceil(
                    layer["line"]["width"] / 2) + 0.5)

            extent_buffer = pixelInMetres * renderBufferPixel

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

            # SQL_TEMPLATE_MATVIEW = """
            #     WITH _conf AS (
            #         SELECT
            #             {decimalPlaces} AS decimal_places,
            #             ST_SetSRID(ST_MakeBox2D(ST_MakePoint({west}, {south}), ST_MakePoint({east}, {north})), {srid}) AS extent,
            #             ST_Buffer(ST_SetSRID(ST_MakeBox2D(ST_MakePoint({west}, {south}), ST_MakePoint({east}, {north})), {srid}), 20) AS extent_buffered
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
            #     SELECT gid, q,
            #         ST_AsGeoJSON(ST_Transform({geom_column_name}, 4326), _conf.decimal_places) AS geom
            #         FROM _geom, _conf"""

            SQL_TEMPLATE_MATVIEW_CLIPBYBOX = """
              WITH _conf AS (
                  SELECT
                      {decimalPlaces} AS decimal_places,
                      ST_Transform(ST_SetSRID(ST_MakeBox2D(ST_MakePoint({west}, {south}), ST_MakePoint({east}, {north})), {srid}), 4326) AS extent,
                      ST_Transform(ST_Buffer(ST_SetSRID(ST_MakeBox2D(ST_MakePoint({west}, {south}), ST_MakePoint({east}, {north})), {srid}), {extent_buffer}), 4326) AS extent_buffered
                  ),
                  -- end conf
                  _geom AS (
                      SELECT
                          ST_ClipByBox2D({geom_column_name_wrap}, extent_buffered) AS {geom_column_name},
                          gid, q
                      FROM (
                      -- main query
                      {query}
                      ) _wrap, _conf
                      WHERE {geom_column_name_wrap} && extent
                  )
                  -- end geom
              SELECT gid, q,
                  ST_AsGeoJSON({geom_column_name}, _conf.decimal_places) AS geom
                  FROM _geom, _conf
                  WHERE ST_IsEmpty({geom_column_name}) = FALSE"""

            # SQL_TEMPLATE_MATVIEW_WITH_CLIPPING = """
            #     WITH _conf AS (
            #         SELECT
            #             20 AS magic,
            #             {res} AS res,
            #             {decimalPlaces} AS decimal_places,
            #             ST_SetSRID(ST_MakeBox2D(ST_MakePoint({west}, {south}), ST_MakePoint({east}, {north})), {srid}) AS extent,
            #             ST_Buffer(ST_SetSRID(ST_MakeBox2D(ST_MakePoint({west}, {south}), ST_MakePoint({east}, {north})), {srid}), 10) AS extent_buffered
            #         ),
            #         -- end conf
            #         _geom AS (
            #             SELECT
            #                 ST_SnapToGrid(
            #                     CASE WHEN
            #                         ST_CoveredBy({geom_column_name}, extent) = TRUE
            #                     THEN
            #                         {geom_column_name}
            #                     ELSE
            #                         ST_Intersection(
            #                             CASE WHEN
            #                                 ST_IsValid({geom_column_name}) = TRUE
            #                             THEN
            #                                 {geom_column_name}
            #                             ELSE
            #                                 ST_MakeValid({geom_column_name})
            #                             END
            #                             , extent_buffered)
            #                     END,
            #                     res/magic, res/magic
            #                 ) AS {geom_column_name},
            #                 gid, q
            #             FROM (
            #             -- main query
            #             {query}
            #             ) _wrap, _conf
            #             WHERE {geom_column_name} && extent
            #         )
            #         -- end geom
            #     SELECT gid, q,
            #         ST_AsGeoJSON(ST_Transform({geom_column_name}, 4326), _conf.decimal_places) AS geom
            #         FROM _geom, _conf"""

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
                    return "geom_4326_z5"
                elif zoom_level <= 7:
                    return "geom_4326_z7"
                elif zoom_level <= 9:
                    return "geom_4326_z9"
                elif zoom_level <= 11:
                    return "geom_4326_z11"
                else:
                    return "geom_4326"

            # Use materialised view
            if True:
                geomColumnName = get_geom_column_name(layer["hash"], z)

                # Substitute our materialised view table in the stored query
                geomTableName = "{schema_name}.{geometry_name}".format(
                    geometry_name=layer["geometry"], schema_name=layer["schema"])
                matViewName = "{schema_name}.{geometry_name}_view".format(
                    schema_name=layer["schema"], geometry_name=layer["geometry"])
                query = layer["_postgis_query"].replace(
                    "geom_3857", "geom_4326").replace(geomTableName, matViewName)

                # Substitute in our zoom-level specific geom column name
                query = query.replace(".geom_4326", ".{geom_column_name}".format(
                    geom_column_name=geomColumnName))

                # print("{}, {} / {} / {}".format(east, west,
                #                                 east - west, (east - west) / 256))

                # print("Use matview column {} for zoom {}".format(geomColumnName, z))
                sql = SQL_TEMPLATE_MATVIEW_CLIPBYBOX.format(decimalPlaces=decimalPlaces, geom_column_name=geomColumnName, geom_column_name_wrap="_wrap.{}".format(geomColumnName.split("_z")[0]),
                                                            query=query, west=west, south=south, east=east, north=north, srid=srid, extent_buffer=extent_buffer)

                # print(sql)
                return sql

            # Use raw query
            else:
                print("Use raw query")
                return SQL_TEMPLATE_NO_SIMPLIFICATION.format(res=resolution, decimalPlaces=decimalPlaces, min_area=min_area, tolerance=tolerance, query=layer["_postgis_query"], west=west, south=south, east=east, north=north, srid=srid)

        # Wrap EALGIS query in a PostGIS query to produce a vector tile
        import mercantile
        vt_query = create_vectortile_sql(
            layer, bounds=mercantile.bounds(x, y, z))

        db = broker.Provide(None)
        return db.session.execute(vt_query)
