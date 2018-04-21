import math
from django.apps import apps
from rest_framework.exceptions import ValidationError
from django.http.response import HttpResponse
from rest_framework.response import Response


class MaterialisedViews:
    @staticmethod
    def create_materialised_view_for_table(eal, table_name, schema_name, execute):
        # Zoom levels to generate geometry columns for
        ZOOM_LEVELS = [5, 7, 9, 11]
        sqlLog = []  # For dumping SQL back to the client

        def getViewName(table_name):
            return "{table_name}_view".format(table_name=table_name)

        def getGeomColumnDefinition(table_name, schema_name, zoom_level):
            # FIXME If we end up keeping this approach then do some math that isn't purely back-of-the-napkin
            # to work out the area of a pixel at each zoom level so we can do a better job of ejecting and
            # simplifying features.

            resolution = 6378137.0 * 2.0 * math.pi / \
                256.0 / math.pow(2.0, zoom_level)
            tolerance = resolution / 20
            if zoom_level <= 7:
                min_area = resolution * 200
            elif zoom_level <= 9:
                min_area = resolution * 400
            else:
                min_area = resolution * 500

            GEOM_COLUMN_DEF = """
                CASE WHEN ST_Area(geomtable.geom_3857) >= {min_area} THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, {res}/20, {res}/20),
                        {tolerance}
                    )), 4326)
                ELSE NULL END AS geom_4326_z{zoom_level},"""

            return GEOM_COLUMN_DEF.format(min_area=min_area, res=resolution, tolerance=tolerance, zoom_level=zoom_level)

        def getGeomColumnIndexDefinition(view_name, schema_name, zoom_level):
            GEOM_COLUMN_IDX = 'CREATE INDEX "{view_name}_geom_4326_z{zoom_level}_gist" ON "{schema_name}"."{view_name}" USING GIST ("geom_4326_z{zoom_level}")'
            return GEOM_COLUMN_IDX.format(view_name=view_name, schema_name=schema_name, zoom_level=zoom_level)

        view_name = getViewName(table_name)

        # Nuke the view if it exists already
        NUKE_EXISTING_MATVIEW = "DROP MATERIALIZED VIEW IF EXISTS {schema_name}.{view_name} CASCADE".format(
            schema_name=schema_name, view_name=view_name)

        if execute:
            eal.session.execute(NUKE_EXISTING_MATVIEW)
            eal.session.commit()
        else:
            sqlLog.append(NUKE_EXISTING_MATVIEW)

        # Create the materialised view
        geomColumnDefsSQL = []
        for zoom_level in ZOOM_LEVELS:
            geomColumnDefsSQL.append(getGeomColumnDefinition(
                table_name, schema_name, zoom_level))

        MATVIEW_SQL_DEF = """
            CREATE MATERIALIZED VIEW {schema_name}.{view_name} AS
                SELECT
                    {geom_column_defs}
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM {schema_name}.{table_name} AS geomtable"""
        MATVIEW_SQL_DEF = MATVIEW_SQL_DEF.format(
            schema_name=schema_name, view_name=view_name, geom_column_defs="".join(geomColumnDefsSQL), table_name=table_name)

        if execute:
            eal.session.execute(MATVIEW_SQL_DEF)
        else:
            sqlLog.append(MATVIEW_SQL_DEF)

        # Create indexes on our zoom-level specific geometry columns
        # @TODO Wot does the "default to the original geom" query use?
        for zoom_level in ZOOM_LEVELS:
            GEOM_COLUMN_IDX = getGeomColumnIndexDefinition(
                view_name, schema_name, zoom_level)

            if execute:
                eal.session.execute(GEOM_COLUMN_IDX)
            else:
                sqlLog.append(GEOM_COLUMN_IDX)

        # Create index on geom_4326
        GEOM_COLUMN_IDX = 'CREATE INDEX "{view_name}_geom_4326_gist" ON "{schema_name}"."{view_name}" USING GIST ("geom_4326")'.format(
            view_name=view_name, schema_name=schema_name)
        if execute:
            eal.session.execute(GEOM_COLUMN_IDX)
        else:
            sqlLog.append(GEOM_COLUMN_IDX)

        # Copy non-geometry indexes from the original table
        from sqlalchemy.engine import reflection
        insp = reflection.Inspector.from_engine(eal.db)

        for index in insp.get_indexes(table_name, schema=schema_name):
            index_name = index["name"].replace(
                table_name, table_name + "_view")

            if "dialect_options" in index and "postgresql_using" in index["dialect_options"]:
                index_type = index["dialect_options"]["postgresql_using"]
                IDX_DEF = 'CREATE INDEX "{index_name}" ON "{schema_name}"."{view_name}" USING {index_type} ("{column_name}")'.format(
                    index_name=index_name, schema_name=schema_name, view_name=view_name, index_type=index_type, column_name=index["column_names"][0])
            elif "unique" in index and index["unique"] is True:
                IDX_DEF = 'CREATE UNIQUE INDEX "{index_name}" ON "{schema_name}"."{view_name}" ("{column_name}")'.format(
                    index_name=index_name, schema_name=schema_name, view_name=view_name, column_name=index["column_names"][0])
            else:
                # print("Skipping {}".format(index_name))
                # print(index)
                continue

            if execute:
                eal.session.execute(IDX_DEF)
            else:
                sqlLog.append(IDX_DEF)

        # And, lastly, an index for the primary key on the master table
        GID_IDX_DEF = 'CREATE UNIQUE INDEX "{view_name}_gid_idx" ON "{schema_name}"."{view_name}" ("gid");'.format(
            schema_name=schema_name, view_name=view_name)
        if execute:
            eal.session.execute(GID_IDX_DEF)
        else:
            sqlLog.append(GID_IDX_DEF)

        # Now commit everything in one go
        if execute:
            eal.session.commit()
            return "{schema_name}.{view_name}".format(schema_name=schema_name, view_name=view_name)
        else:
            return {
                "name": "{schema_name}.{view_name}".format(schema_name=schema_name, view_name=view_name),
                "sql": ";\n".join(sqlLog),
            }

    @staticmethod
    def create_views(request, format=None):
        qp = request.query_params
        execute = True if "execute" in qp else False

        viewNames = []
        if "table_name" in qp and "schema_name" in qp:
            table = eal.get_data_info(qp["table_name"], qp["schema_name"])
            tables = "{}.{}".format(qp["schema_name"], table.name)
            viewNames.append(self.create_materialised_view_for_table(
                table.name, qp["schema_name"], execute))
        elif "all_tables" in qp:
            tables = eal.get_datainfo()
            for key in tables:
                viewNames.append(self.create_materialised_view_for_table(
                    tables[key]["name"], tables[key]["schema_name"], execute))
        else:
            raise ValidationError(
                detail="Invalid query - must specify table_name or all_tables and schema_name.")

        if execute:
            return Response({"views": viewNames})
        else:
            sqlAllViews = []
            for view in viewNames:
                sqlAllViews.append(view["sql"])

            return HttpResponse("\n\n\n".join(sqlAllViews), content_type="text/plain")
