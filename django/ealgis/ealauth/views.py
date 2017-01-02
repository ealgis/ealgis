from django.views.generic import TemplateView
from django.db.models import Q

from django.contrib.auth.models import User
from .models import *

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import api_view, detail_route
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.exceptions import NotFound, ValidationError
from .serializers import UserSerializer, MapDefinitionSerializer, TableInfoSerializer
from ealgis.colour_scale import definitions
from django.apps import apps

try:
    import simplejson as json
except ImportError:
    import json
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .serializers import UserSerializer, MapDefinitionSerializer, TableInfoSerializer, ColumnInfoSerializer
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
    
    @detail_route(methods=['get'])
    def exists(self, request, pk=None, format=None):
        queryset = self.get_queryset()
        map = queryset.filter(id=pk).first()

        return Response({
            "exists": map is not None
        })


class TableInfoViewSet(viewsets.ViewSet):
    """
    API endpoint that allows tables to be viewed or edited.
    """
    serializer_class = TableInfoSerializer
    permission_classes = (IsAuthenticated,)

    def list(self, request, format=None):
        eal = apps.get_app_config('ealauth').eal
        tables = eal.get_datainfo()
        return Response(tables)
    
    # @TODO Make a Custom ViewSet that can handle common tasks like schema checking?
    def retrieve(self, request, format=None, pk=None):
        eal = apps.get_app_config('ealauth').eal

<<<<<<< 4a0a353442c3d2c84f5a961fbb5920126212c082
        schema_name = request.query_params.get('schema', None)
        if schema_name is None or not schema_name:
            raise ValidationError(detail="No schema name provided.")
        elif schema_name not in eal.get_schemas():
            raise ValidationError(detail="Schema name '{}' is not a known schema.".format(schema_name))

        table = eal.get_table_info(pk, schema_name)

        if table is None:
            raise NotFound()

        columninfo = eal.get_table_class("column_info", schema_name)
        table.columns = columns = {}
        for column in eal.session.query(columninfo).filter_by(tableinfo_id=table.id).all():
            columns[column.name] = json.loads(column.metadata_json)
        
        serializer = TableInfoSerializer(table)
        return Response(serializer.data)
=======
class ColumnInfoViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows columns to be viewed or edited.
    """
    queryset = ColumnInfo.objects.all()
    serializer_class = ColumnInfoSerializer
    permission_classes = (IsAuthenticated,)
>>>>>>> add endpoint /api/0.1/self returning current user


class ColoursViewset(viewsets.ViewSet):
    """
    API endpoint that returns available colours scale for styling.
    """
    permission_classes = (IsAuthenticated,)

    def list(self, request, format=None):
        return Response(definitions.get_json())


class SchemasViewSet(viewsets.ViewSet):
    """
    API endpoint that scans the database for EAlGIS-compliant schemas.
    """

    def list(self, request, format=None):
        eal = apps.get_app_config('ealauth').eal
        schema_names = eal.get_schemas()
        return Response(schema_names)
