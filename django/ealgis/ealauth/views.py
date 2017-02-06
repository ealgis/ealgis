from django.views.generic import TemplateView
from django.db.models import Q

from django.contrib.auth.models import User
from .models import *

from rest_framework import viewsets, mixins
from rest_framework.views import APIView
from rest_framework.decorators import api_view, detail_route, list_route
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.exceptions import NotFound, ValidationError
from .serializers import UserSerializer, MapDefinitionSerializer, TableInfoSerializer, DataInfoSerializer
from ealgis.colour_scale import definitions, make_colour_scale
from django.apps import apps

try:
    import simplejson as json
except ImportError:
    import json
import time
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from ealgis.colour_scale import definitions
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
        
    def retrieve(self, request, format=None, pk=None):        
        queryset = self.get_queryset()
        map = queryset.filter(id=pk).first()

        # Compile layer fill styles and attach an olStyleDef for consumption by the UI
        for k, l in map.json["layers"].items():
            fill = l['fill']
            do_fill = (fill['expression'] != '')

            # Line styles are simple and can already be read from the existing JSON object
            if do_fill:
                scale_min = float(fill['scale_min'])
                scale_max = float(fill['scale_max'])
                opacity = float(fill['opacity'])
                l["olStyleDef"] = make_colour_scale(l, 'q', float(scale_min), float(scale_max), opacity)

        serializer = self.serializer_class(map, context={"request": request})
        return Response(serializer.data)
    
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
    
    @detail_route(methods=['get'], permission_classes=[IsAdminUser])
    def clone(self, request, pk=None, format=None):
        queryset = self.get_queryset()
        map = queryset.filter(id=pk).first()
        
        map.name = "{} Cloned {}".format(map.name, int(round(time.time() * 1000)))[:32]
        map.pk = None
        map.json["rev"] = 0
        map.save()

        return Response({
            # "exists": map is not None
            "new_map_id": map.id
        })
    
    @detail_route(methods=['get'])
    def foo(self, request, pk=None, format=None):
        queryset = self.get_queryset()
        map = queryset.filter(id=pk).first()

        # map.set(map.json)
        # map.save()

        # from ealgis.ealauth.geoserver import GeoServerMap

        # gsmap = GeoServerMap(map.name, map.owner_user_id, map.json["rev"], map.json)
        # gsmap.create_layers()

        return Response({
            "updated": True
        })


class ReadOnlyGenericTableInfoViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    def retrieve(self, request, format=None, pk=None):
        eal = apps.get_app_config('ealauth').eal
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
