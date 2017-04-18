from django.contrib.auth.models import User
from .models import MapDefinition

from rest_framework import viewsets, mixins, status
from rest_framework.views import APIView
from rest_framework.decorators import detail_route, list_route
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from .serializers import UserSerializer, MapDefinitionSerializer, TableInfoSerializer, DataInfoSerializer
from ealgis.colour_scale import definitions, make_colour_scale
from django.apps import apps

import json
import time
from django.http import HttpResponseNotFound


def api_not_found(request):
    return HttpResponseNotFound()


class CurrentUserView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (IsAdminUser,)
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer


class MapDefinitionViewSet(viewsets.ModelViewSet):
    """
    API endpoint to allow map definitions to be viewed or edited by the user that owns them.
    """
    serializer_class = MapDefinitionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        # More complex example from SO:
        # http://stackoverflow.com/questions/34968725/djangorestframework-how-to-get-user-in-viewset
        return MapDefinition.objects.filter(owner_user_id=self.request.user)

    def create(self, request):
        # request.data is from the POST object. We want to take these
        # values and supplement it with the user.id that's defined
        # in our URL parameter
        data = {
            'name': request.data['name'],
            'description': request.data['description'],
            'json': request.data['json'] if "json" in request.data else {},
            'owner_user_id': self.request.user.id
        }

        serializer = MapDefinitionSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @list_route(methods=['get'])
    def compileStyle(self, request, format=None):
        qp = request.query_params

        # We only need the fill params on the layer to compile the style
        layer = {
            "fill": {
                "opacity": qp["opacity"],
                "scale_max": qp["scale_max"],
                "scale_min": qp["scale_min"],
                "expression": qp["expression"],
                "scale_flip": qp["scale_flip"],
                "scale_name": qp["scale_name"],
                "scale_nlevels": qp["scale_nlevels"],
            }
        }

        scale_min = float(layer["fill"]['scale_min'])
        scale_max = float(layer["fill"]['scale_max'])
        opacity = float(layer["fill"]['opacity'])

        return Response(make_colour_scale(layer, 'q', scale_min, scale_max, opacity))

    @detail_route(methods=['get'])
    def exists(self, request, pk=None, format=None):
        queryset = self.get_queryset()
        map = queryset.filter(id=pk).first()

        return Response({
            "exists": map is not None
        })

    @detail_route(methods=['put'])
    def clone(self, request, pk=None, format=None):
        queryset = self.get_queryset()
        map = queryset.filter(id=pk).first()

        map.name = "{} Copied {}".format(map.name, int(round(time.time() * 1000)))[:32]
        map.json["rev"] = 0
        map.id = None
        map.pk = None
        map.save()

        serializer = self.serializer_class(map)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @detail_route(methods=['get'])
    def tiles(self, request, pk=None, format=None):
        queryset = self.get_queryset()
        map = queryset.filter(id=pk).first()
        qp = request.query_params

        # Validate required params for serving a vector tile
        # Layer OK?
        layer = None
        for l in map.json["layers"]:
            if l["hash"] == qp["layer"]:
                layer = l
                break

        if layer is None:
            raise ValidationError(detail="Layer not found.")

        # Format OK?
        if "format" not in qp or qp["format"] not in ["geojson", "pbf"]:
            raise ValidationError(detail="Unknown format '{format}".format(format=format))

        # Has Tile Coordinates OK?
        if not("x" in qp and "y" in qp and "z" in qp):
            raise ValidationError(detail="Tile coordinates (X, Y, Z) not found.")

        # OK, generate a GeoJSON Vector Tile
        def row_to_dict(row):
            def f(item):
                return not item[0] == 'geom'
            return dict(i for i in row.items() if f(i))

        def to_geojson_feature(row):
            def process_geometry(geometry):
                return json.loads(geometry)

            return {
                "type": "Feature",
                "geometry": process_geometry(row["geom"]),
                "properties": row_to_dict(row),
            }

        def to_pbf_feature(row):
            def process_geometry(geometry):
                return geometry

            return {
                "geometry": process_geometry(row['geom']),
                "properties": row_to_dict(row)
            }

        from django.core.cache import cache
        format = qp["format"]
        cache_key = "layer_{}_{}_{}_{}".format(qp["layer"], qp["x"], qp["y"], qp["z"])
        cache_time = 60 * 60 * 24 * 365  # time to live in seconds
        memcachedEnabled = False if "no_memcached" in qp else True
        fromMemcached = False

        if memcachedEnabled:
            features = cache.get(cache_key)
            if features is not None:
                fromMemcached = True

        if memcachedEnabled is False or features is None:
            eal = apps.get_app_config('ealauth').eal
            results = eal.get_tile(layer["_postgis_query"], int(qp["x"]), int(qp["y"]), int(qp["z"]))

            if qp["format"] == "geojson":
                features = [to_geojson_feature(row) for row in results]
            elif qp["format"] == "pbf":
                layers = [{
                    "name": "Layer A",
                    "features": [to_pbf_feature(row) for row in results]
                }]

                # Is sloooooooow
                import mapbox_vector_tile
                features = mapbox_vector_tile.encode(layers)

            if memcachedEnabled:
                cache.set(cache_key, features, cache_time)

        headers = {
            "Access-Control-Allow-Origin": "*",
            "X-From-Memcached": fromMemcached,
        }

        if qp["format"] == "geojson":
            return Response({
                "type": "FeatureCollection",
                "features": features
            }, headers=headers)

        elif qp["format"] == "pbf":
            from django.http.response import HttpResponse
            response = HttpResponse(features, content_type="application/x-protobuf")
            for key, val in headers.items():
                response[key] = val
            return response


class ReadOnlyGenericTableInfoViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    def retrieve(self, request, format=None, pk=None):
        schema_name = self.get_schema_from_request(request)

        table = self.getter_method(pk, schema_name)
        if table is None:
            raise NotFound()

        table = self.add_columns_to_table(table, schema_name)

        serializer = self.serializer_class(table)
        return Response(serializer.data)

    def get_schema_from_request(self, request):
        eal = apps.get_app_config('ealauth').eal

        schema_name = request.query_params.get('schema', None)
        if schema_name is None or not schema_name:
            raise ValidationError(detail="No schema name provided.")
        elif schema_name not in eal.get_schemas():
            raise ValidationError(detail="Schema name '{}' is not a known schema.".format(schema_name))
        return schema_name

    def add_columns_to_table(self, table, schema_name):
        eal = apps.get_app_config('ealauth').eal

        columninfo = eal.get_table_class("column_info", schema_name)
        columns = {}
        for column in eal.session.query(columninfo).filter_by(tableinfo_id=table.id).all():
            columns[column.name] = json.loads(column.metadata_json)

        if len(columns) > 0:
            table.columns = columns
        return table


class DataInfoViewSet(ReadOnlyGenericTableInfoViewSet):
    """
    API endpoint that allows tabular tables to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = DataInfoSerializer
    getter_method = apps.get_app_config('ealauth').eal.get_data_info

    def list(self, request, format=None):
        eal = apps.get_app_config('ealauth').eal
        tables = eal.get_datainfo()
        return Response(tables)

    def retrieve(self, request, format=None, pk=None):
        eal = apps.get_app_config('ealauth').eal
        schema_name = self.get_schema_from_request(request)

        gid = request.query_params.get('gid', None)
        row = eal.get_geometry_source_info_by_gid(pk, gid, schema_name)
        return Response(row)


class TableInfoViewSet(ReadOnlyGenericTableInfoViewSet):
    """
    API endpoint that allows data tables to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = TableInfoSerializer
    getter_method = apps.get_app_config('ealauth').eal.get_table_info

    def list(self, request, format=None):
        eal = apps.get_app_config('ealauth').eal
        tables = eal.get_tableinfo()
        return Response(tables)


class ColoursViewset(viewsets.ViewSet):
    """
    API endpoint that returns available colours scale for styling.
    """
    permission_classes = (IsAuthenticated,)

    def list(self, request, format=None):
        return Response(definitions.get_json())

    @list_route(methods=['get'])
    def defs(self, request):
        return Response(definitions.get_defs_json())


class SchemasViewSet(viewsets.ViewSet):
    """
    API endpoint that scans the database for EAlGIS-compliant schemas.
    """

    def list(self, request, format=None):
        eal = apps.get_app_config('ealauth').eal
        schema_names = eal.get_schemas()
        return Response(schema_names)
