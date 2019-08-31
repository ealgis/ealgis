from django.conf.urls import url, include
from .views import (
    EalgisConfigView,
    CurrentUserView,
    UserViewSet,
    ProfileViewSet,
    MapDefinitionViewSet,
    TableInfoViewSet,
    DataInfoViewSet,
    ColumnInfoViewSet,
    ColoursViewset,
    LogoutUserView,
    SchemasViewSet,
    api_not_found)
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)

# Need to set basename because Reasons
# http://www.django-rest-framework.org/api-guide/routers/#usage (see note re `basename`)
# http://stackoverflow.com/questions/22083090/what-base-name-parameter-do-i-need-in-my-route-to-make-this-django-api-work
router.register(r'profile', ProfileViewSet, basename='Profile')
router.register(r'maps', MapDefinitionViewSet, basename='MapDefinition')
router.register(r'colours', ColoursViewset, basename='colours')
router.register(r'schemas', SchemasViewSet, basename='schemas')
router.register(r'tableinfo', TableInfoViewSet, basename='tableinfo')
router.register(r'datainfo', DataInfoViewSet, basename='datainfo')
router.register(r'columninfo', ColumnInfoViewSet, basename='columninfo')

urlpatterns = [
    url(r'^api/0.1/', include(router.urls)),
    url(r'^api/0.1/config$', EalgisConfigView.as_view(), name='api-config'),
    url(r'^api/0.1/self$', CurrentUserView.as_view(), name='api-self'),
    url(r'^api/0.1/logout$', LogoutUserView.as_view(), name='api-logout'),
    # make sure that the API never serves up the react app
    url(r'^api/0.1/.*', api_not_found),
]
