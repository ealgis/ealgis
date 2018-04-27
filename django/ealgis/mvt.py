from ealgis_common.db import broker
from ealgis.util import z_res
from mercantile import bounds, xy
from io import BytesIO


class TileGenerator:
    @staticmethod
    def mvt(layer, x, y, z):
        def create_vectortile_sql(layer, bounds):
            # Create extent
            west, south = xy(bounds.west, bounds.south)
            east, north = xy(bounds.east, bounds.north)
            extent = "ST_MakeBox2D(ST_MakePoint({west}, {south}), ST_MakePoint({east}, {north}))".format(west=west, south=south, east=east, north=north)

            # e.g. aus_census_2011_shapes.sa1
            geom_table_name = "{schema_name}.{geometry_name}".format(geometry_name=layer["geometry"], schema_name=layer["schema"])
            # e.g. aus_census_2011_shapes.sa1.geom_3857
            geom_column_definition = "{}.geom_3857".format(geom_table_name)

            # Replace the compiled geometry column definition with the zoom-level dependent version
            # e.g. Replace "ST_AsEWKB(aus_census_2011_shapes.sa1.geom_3857)" with "ST_AsMVTGeom(ST_Simplify(aus_census_2011_shapes.sa1.geom_3857, TOLERANCE), EXTENT_OF_TILE)"

            # Zoom 15 is our highest resolution (configured in OpenLayers), so we need to grab
            # unsimplified geometries to allow us to re-use them as the user zooms in.
            if z == 15:
                data_query = layer["_postgis_query"].replace(
                    "ST_AsEWKB({})".format(geom_column_definition),
                    "ST_AsMVTGeom({geom_column_definition}, {extent})".format(geom_column_definition=geom_column_definition, extent=extent)
                )
            else:
                # Bodge bodge
                # Fudge the simplification tolerance so that collections of small and dense geometries (e.g. SA1s in capital cities)
                # don't get dropped too soon
                data_query = layer["_postgis_query"].replace(
                    "ST_AsEWKB({})".format(geom_column_definition),
                    "ST_AsMVTGeom(ST_Simplify({geom_column_definition}, {simplify_tolerance}), {extent})".format(geom_column_definition=geom_column_definition, simplify_tolerance=z_res(z + 2), extent=extent)
                )

            # NOT IN USE
            # Drop any geometries that are too small for the user to see in this tile (smaller than a pixel)
            area_filter = ""
            # area_threshold = (40075016.6855785 / (256 * pow(2, z)))
            # area_filter = "sqrt({table_name}.area) >= {area_threshold} AND".format(table_name=table_name, area_threshold=area_threshold)
            # area_filter = "{table_name}.area_sqrt >= z_res({z}) AND".format(table_name=table_name, z=z + 1.5)

            query = """
                SELECT
                    ST_AsMVT(tile)
                FROM
                    ({data_query}
                    WHERE
                        {area_filter}
                        {geom_column_definition} && {extent}
                    ) as tile""".format(data_query=data_query, area_filter=area_filter, geom_column_definition=geom_column_definition, extent=extent)

            # print(query)
            return query

        # Wrap EALGIS query in a PostGIS query to produce a vector tile
        mvt_query = create_vectortile_sql(layer, bounds=bounds(x, y, z))
        db = broker.access_data()
        tile = db.session.execute(mvt_query).fetchone()[0]

        return BytesIO(tile).read()
