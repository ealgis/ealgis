from django.views.generic import TemplateView
from django.db.models import Q

from django.contrib.auth.models import User
from .models import *

from rest_framework import viewsets
from .serializers import UserSerializer, MapDefinitionSerializer

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
    API endpoint to allow map definitions to be viewed or edited.
    """
    serializer_class = MapDefinitionSerializer

    def get_queryset(self):
        return MapDefinition.objects.filter(owner_user_id=self.request.user)