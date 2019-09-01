from .datastore import datastore
from .util import z_res
from .ealauth.models import MapDefinition
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
            base_query = MapDefinition.layer_postgis_query(layer)
            if z == 15 or layer["type"] in ["POINT", "MULTIPOINT"]:
                data_query = base_query.replace(
                    "ST_AsEWKB({})".format(geom_column_definition),
                    "ST_AsMVTGeom({geom_column_definition}, {extent})".format(geom_column_definition=geom_column_definition, extent=extent)
                )
            else:
                # Bodge bodge
                # Fudge the simplification tolerance so that collections of small and dense geometries (e.g. SA1s in capital cities)
                # don't get dropped too soon
                data_query = base_query.replace(
                    "ST_AsEWKB({})".format(geom_column_definition),
                    "ST_AsMVTGeom(ST_Simplify({geom_column_definition}, {simplify_tolerance}), {extent})".format(geom_column_definition=geom_column_definition, simplify_tolerance=z_res(z + 2), extent=extent)
                )

            # Drop any geometries that are too small for the user to see in this tile (smaller than about a pixel)
            area_filter = ""
            if layer["type"] in ["POLYGON", "MULTIPOLYGON"]:
                area_filter = "{geom_table_name}.sqrt_area_geom_3857 >= {area_threshold} AND".format(geom_table_name=geom_table_name, area_threshold=z_res(z + 1.5))

            # FIXME Build this whole query in SQLAlchemy instead
            # We need to begin a WHERE clause if there's no filter on the layer
            if " WHERE " not in base_query:
                where_cause = "WHERE"
            else:
                where_cause = "AND"

            return """
                SELECT
                    ST_AsMVT(tile)
                FROM
                    ({data_query}
                    {where_cause}
                        {area_filter}
                        {geom_column_definition} && {extent}
                    ) as tile""".format(data_query=data_query, where_cause=where_cause, area_filter=area_filter, geom_column_definition=geom_column_definition, extent=extent)

        # Wrap EALGIS query in a PostGIS query to produce a vector tile
        mvt_query = create_vectortile_sql(layer, bounds=bounds(x, y, z))
        with datastore().access_data() as db:
            tile = db.session.execute(mvt_query).fetchone()[0]

        return BytesIO(tile).read()
