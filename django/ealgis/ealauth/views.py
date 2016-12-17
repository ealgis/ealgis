from django.views.generic import TemplateView

from django.contrib.auth.models import User
from rest_framework import viewsets
from .serializers import UserSerializer

class LandingView(TemplateView):
    template_name = 'landing.html'

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer