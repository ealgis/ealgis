from django.views.generic import TemplateView
from django.db.models import Q

from django.contrib.auth.models import User
from .models import *

from rest_framework import viewsets
from .serializers import UserSerializer, MapDefinitionSerializer, TableInfoSerializer, ColumnInfoSerializer

class LandingView(TemplateView):
    template_name = 'landing.html'


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
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