from django.views.generic import TemplateView
from django.db.models import Q

from django.contrib.auth.models import User
from .models import *

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .serializers import UserSerializer, MapDefinitionSerializer, TableInfoSerializer, ColumnInfoSerializer
from ealgis.colour_scale import definitions
from ealgis.ealgis import EAlGIS


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

    def get_queryset(self):
        # More complex example from SO:
        # http://stackoverflow.com/questions/34968725/djangorestframework-how-to-get-user-in-viewset
        return MapDefinition.objects.filter(owner_user_id=self.request.user)


class TableInfoViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows tables to be viewed or edited.
    """
    # Use this approach to prefetch info for columns related to this table
    # http://stackoverflow.com/a/29910181
    queryset = TableInfo.objects.all().prefetch_related('columns')
    serializer_class = TableInfoSerializer


class ColumnInfoViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows columns to be viewed or edited.
    """
    queryset = ColumnInfo.objects.all()
    serializer_class = ColumnInfoSerializer


class ColoursViewset(viewsets.ViewSet):
    """
    API endpoint that returns available colours scale for styling.
    """
    def list(self, request, format=None):
        return Response(definitions.get_json())


class SchemasViewSet(viewsets.ViewSet):
    """
    API endpoint that scans the database for EAlGIS-compliant schemas.
    """
    permission_classes = (IsAdminUser,)

    def list(self, request, format=None):
        # @TODO Shove this into Django global state
        eal = EAlGIS()
        schemas = eal.scan_schemas()
        return Response(schemas)