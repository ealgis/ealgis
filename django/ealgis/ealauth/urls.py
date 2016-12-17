from django.conf.urls import url, include
from .views import LandingView, UserViewSet, MapDefinitionViewSet

from django.contrib import admin
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'maps', MapDefinitionViewSet, 'Maps')

urlpatterns = [
    url(r'^api/', include(router.urls)),
    url('^$', LandingView.as_view(), name='landing'),
]
