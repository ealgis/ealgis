from django.contrib.auth.models import User, AnonymousUser
from django.contrib.auth import logout
from django.db.models import Q
from django.http.response import HttpResponse, StreamingHttpResponse
from django.core.cache import cache
from django.http import HttpResponseNotFound
from .models import MapDefinition
from geoalchemy2.elements import WKBElement

from rest_framework import viewsets, mixins, status
from rest_framework.views import APIView
from rest_framework.decorators import detail_route, list_route
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .permissions import AllowAnyIfPublicSite, IsAuthenticatedAndApproved, IsMapOwnerOrReadOnly, IsMapOwner, CanViewOrCloneMap
from rest_framework_jsonp.renderers import JSONPRenderer

from .serializers import UserSerializer, ProfileSerializer, MapDefinitionSerializer, TableInfoSerializer, DataInfoSerializer, ColumnInfoSerializer, EALGISMetadataSerializer

import time
import copy
import urllib.parse
import json
import csv
from ealgis_common.util import make_logger
from ealgis.mvt import TileGenerator
from ealgis.ealauth.admin import is_private_site
from ealgis.util import get_env, get_version
from ealgis.datastore import datastore


logger = make_logger(__name__)


def api_not_found(request):
    return HttpResponseNotFound()


class EalgisConfigView(APIView):
    """
    A view that returns the count of active users in JSONP
    """
    renderer_classes = (JSONPRenderer,)

    def get(self, request):
        def getCustomOAuth2ProviderDetails():
            from django.conf import settings
            if hasattr(settings, "CUSTOM_OAUTH2_BACKEND") and settings.CUSTOM_OAUTH2_BACKEND is True:
                from ealgis.ealauth.backends import CustomOAuth2
                return {"name": CustomOAuth2.name, "title": CustomOAuth2.title}
            return None

        #############################################################
        # WARNING - ONLY PUT PUBLIC SECRETS HERE. EALGIS SENDS ALL
        # OF THIS INFO TO THE EALGIS FRONTEND DURING APP STARTUP.
        #############################################################
        return Response({
            "VERSION": get_version(),
            "ENVIRONMENT": get_env("ENVIRONMENT"),
            "PRIVATE_SITE": False if get_env("EALGIS_PRIVATE_SITE") == "0" else True,
            "EALGIS_SITE_CONTACT_EMAIL": get_env("EALGIS_SITE_CONTACT_EMAIL"),
            "GOOGLE_ANALYTICS_UA": get_env("GOOGLE_ANALYTICS_UA"),
            "GOOGLE_MAPS_API_KEY": get_env("GOOGLE_MAPS_API_KEY"),
            "MAPBOX_API_KEY": get_env("MAPBOX_API_KEY"),
            "EALGIS_BASEMAP_PROVIDER": get_env("EALGIS_BASEMAP_PROVIDER"),
            "THUNDERFOREST_API_KEY": get_env("THUNDERFOREST_API_KEY"),
            "THUNDERFOREST_MAP_STYLE": get_env("THUNDERFOREST_MAP_STYLE"),
            "RAVEN_URL": get_env("RAVEN_URL"),
            "DEFAULT_MAP_POSITION": {
                "lat": float(get_env("DEFAULT_MAP_POSITION_LAT")),
                "lon": float(get_env("DEFAULT_MAP_POSITION_LON")),
                "zoom": int(get_env("DEFAULT_MAP_POSITION_ZOOM")),
            },
            "AUTH_PROVIDERS": {
                "GOOGLE": False if get_env("SOCIAL_AUTH_GOOGLE_OAUTH2_KEY") is None else True,
                "FACEBOOK": False if get_env("SOCIAL_AUTH_FACEBOOK_KEY") is None else True,
                "TWITTER": False if get_env("SOCIAL_AUTH_TWITTER_KEY") is None else True,
                "CUSTOM_OAUTH2": getCustomOAuth2ProviderDetails(),
            }
        })


class CurrentUserView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(
                request.user, context={'request': request}
            )

            return Response({
                "is_logged_in": True,
                "user": serializer.data
            })
        else:
            return Response({
                "is_logged_in": False,
                "user": None
            })


class LogoutUserView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        logout(request)
        return Response({})


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (IsAdminUser,)
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer


class ProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows user profiles to be viewed or edited.
    """
    permission_classes = (IsAuthenticatedAndApproved,)
    serializer_class = ProfileSerializer

    def get_queryset(self):
        return self.request.user.profile

    @list_route(methods=['put'])
    def recent_tables(self, request, format=None):
        # Add our new tables to the start of the list of recent
        # tables that the user has interacted with.
        if "table" in request.data and isinstance(request.data["table"], dict):
            # If they're valid tables
            tmp_recent_tables = []
            # Support for sending multiple tables in the future
            for table in [request.data["table"]]:
                with datastore().access_schema(table["schema_name"]) as db:
                    tbl = db.get_table_info_by_id(table["id"])
                    if tbl is not None:
                        tmp_recent_tables.append({"id": tbl.id, "schema_name": table["schema_name"]})

            # With no duplicates
            profile = self.get_queryset()
            tmp_recent_tables += profile.recent_tables
            recent_tables = []
            [recent_tables.append(t) for t in tmp_recent_tables if t not in recent_tables]

            # Discard any older recent tables
            if len(recent_tables) > 10:
                recent_tables = recent_tables[10:]

            serializer = ProfileSerializer(profile, data={"recent_tables": recent_tables}, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.validated_data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)

    @list_route(methods=['put'])
    def favourite_tables(self, request, format=None):
        if "tables" in request.data and isinstance(request.data["tables"], list):
            profile = self.get_queryset()
            favourite_tables = copy.deepcopy(profile.favourite_tables)
            removed_tables = []

            for table in request.data["tables"]:
                with datastore().access_schema(table["schema_name"]) as db:
                    tbl = db.get_table_info_by_id(table["id"])
                if tbl is not None:
                    tbl_partial = {"id": tbl.id, "schema_name": table["schema_name"]}

                    if tbl_partial in profile.favourite_tables:
                        removed_tables.append(tbl_partial)
                        favourite_tables.remove(tbl_partial)
                    else:
                        favourite_tables.append(tbl_partial)

            serializer = ProfileSerializer(profile, data={"favourite_tables": favourite_tables}, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "favourite_tables": serializer.validated_data["favourite_tables"],
                    "removed": removed_tables
                })
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({}, status=status.HTTP_400_BAD_REQUEST)


class MapDefinitionViewSet(viewsets.ModelViewSet):
    """
    API endpoint to allow map definitions to be viewed or edited by the user that owns them.
    """
    permission_classes = (IsAuthenticatedAndApproved, IsMapOwnerOrReadOnly,)
    serializer_class = MapDefinitionSerializer

    def get_queryset(self):
        # More complex example from SO:
        # http://stackoverflow.com/questions/34968725/djangorestframework-how-to-get-user-in-viewset

        if isinstance(self.request.user, AnonymousUser):
            if is_private_site() is False:
                return MapDefinition.objects.filter(
                    Q(
                        Q(shared=MapDefinition.AUTHENTICATED_USERS_SHARED) | Q(shared=MapDefinition.PUBLIC_SHARED)
                    )
                )
        else:
            return MapDefinition.objects.filter(
                Q(owner_user_id=self.request.user) |
                Q(
                    ~Q(owner_user_id=self.request.user) & Q(
                        shared=MapDefinition.AUTHENTICATED_USERS_SHARED) | Q(shared=MapDefinition.PUBLIC_SHARED)
                )
                # owner_user_id=self.request.user
            )

    def list(self, request, format=None):
        maps = MapDefinition.objects.all().filter(owner_user_id=self.request.user)
        serializer = MapDefinitionSerializer(maps, many=True)
        return Response(serializer.data)

    @list_route(methods=['get'], permission_classes=(AllowAnyIfPublicSite,))
    def all(self, request, format=None):
        maps = self.get_queryset()
        serializer = MapDefinitionSerializer(maps, many=True)
        return Response(serializer.data)

    @list_route(methods=['get'], permission_classes=(AllowAnyIfPublicSite,))
    def shared(self, request, format=None):
        maps = None
        if isinstance(request.user, AnonymousUser):
            if is_private_site() is False:
                maps = MapDefinition.objects.all().filter(shared=MapDefinition.AUTHENTICATED_USERS_SHARED)
        else:
            maps = MapDefinition.objects.all().filter(shared=MapDefinition.AUTHENTICATED_USERS_SHARED).exclude(owner_user_id=request.user)

        serializer = MapDefinitionSerializer(maps, many=True)
        return Response(serializer.data)

    @list_route(methods=['get'], permission_classes=(AllowAnyIfPublicSite,))
    def public(self, request, format=None):
        maps = None
        if isinstance(request.user, AnonymousUser):
            if is_private_site() is False:
                maps = MapDefinition.objects.all().filter(shared=MapDefinition.PUBLIC_SHARED)
        else:
            maps = MapDefinition.objects.all().filter(shared=MapDefinition.PUBLIC_SHARED).exclude(owner_user_id=request.user)

        serializer = MapDefinitionSerializer(maps, many=True)
        return Response(serializer.data)

    def create(self, request):
        # request.data is from the POST object. We want to take these
        # values and supplement it with the user.id that's defined
        # in our URL parameter
        data = {
            "name": request.data["name"],
            "description": request.data["description"] if "description" in request.data else "",
            "json": request.data["json"] if "json" in request.data else {"layers": []},
            "owner_user_id": self.request.user.id
        }

        serializer = MapDefinitionSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['put'])
    def addLayer(self, request, pk=None, format=None):
        map = self.get_object()

        if "layer" not in request.data:
            raise ValidationError(detail="Layer object not found.")

        json = map.json
        if "layers" not in json:
            json["layers"] = []  # Just in case
        json["layers"].append(request.data["layer"])

        serializer = MapDefinitionSerializer(
            map, data={"json": json}, partial=True)
        if serializer.is_valid():
            serializer.save()

            layerId = len(serializer.validated_data["json"]["layers"]) - 1
            newLayer = serializer.validated_data["json"]["layers"][layerId]

            return Response({
                "layerId": layerId,
                "layer": newLayer,
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['put'])
    def updateLayer(self, request, pk=None, format=None):
        map = self.get_object()
        layerId = int(request.data["layerId"])

        if not (layerId >= 0 or type(request.data["layer"]) is dict):
            raise ValidationError(
                detail="LayerId and/or Layer object not found.")

        if (layerId + 1) > len(map.json["layers"]):
            raise ValidationError(detail="Layer not found.")

        json = copy.deepcopy(map.json)
        json["layers"][layerId] = request.data["layer"]

        serializer = MapDefinitionSerializer(
            map, data={"json": json}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data["json"]["layers"][layerId])
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['put'], permission_classes=(IsAuthenticatedAndApproved, CanViewOrCloneMap,))
    def clone(self, request, pk=None, format=None):
        map = self.get_object()

        map.name = "{} Copied {}".format(
            map.name, int(round(time.time() * 1000)))[:32]
        map.json["rev"] = 0
        map.id = None
        map.pk = None
        map.owner_user_id = request.user
        map.shared = MapDefinition.PRIVATE_SHARED
        map.save()

        serializer = self.serializer_class(map)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @detail_route(methods=['get'], permission_classes=(IsAuthenticatedAndApproved, IsMapOwner,))
    def query_summary(self, request, pk=None, format=None):
        map = self.get_object()
        qp = request.query_params

        layer = None
        if "layer" in qp:
            for l in map.json["layers"]:
                if l["hash"] == qp["layer"]:
                    layer = l
                    break

        if layer is None:
            raise ValidationError(detail="Layer not found.")

        with datastore().access_data() as db:
            return Response(db.get_summary_stats_for_layer(layer))

    def _handle_export_csv(self, request, bounds=None, suffix=None):
        mapDefn = self.get_object()
        include_geom_attrs = request.query_params.get(
            "include_geom_attrs", False)
        include_geom_attrs = True if (include_geom_attrs == "true") else False

        from ..dataexport import export_csv_iter
        response = StreamingHttpResponse(export_csv_iter(
            mapDefn, bounds=bounds, include_geom_attrs=include_geom_attrs), content_type="text/csv")
        filename_parts = [urllib.parse.quote(mapDefn.name)]
        if suffix is not None:
            filename_parts.append(suffix)
        filename = '_'.join(filename_parts) + '.csv'
        response['Content-Disposition'] = 'attachment; filename="{}"'.format(filename)
        response['Cache-Control'] = 'max-age=86400, public'
        return response

    @detail_route(methods=['get'], permission_classes=(CanViewOrCloneMap,))
    def export_csv(self, request, pk=None, format=None):
        return self._handle_export_csv(request)

    @detail_route(methods=['get'], permission_classes=(CanViewOrCloneMap,))
    def export_csv_viewport(self, request, pk=None, format=None):
        ne = list(map(float, request.query_params.get("ne", None).split(',')))
        sw = list(map(float, request.query_params.get("sw", None).split(',')))
        if len(ne) != 2 or len(sw) != 2:
            return Response(status=status.HTTP_404_NOT_FOUND)
        suffix = "%f_%f_%f_%f" % (ne[0], ne[1], sw[0], sw[1])
        return self._handle_export_csv(request, bounds=(ne, sw), suffix=suffix)

    @detail_route(methods=['get'], permission_classes=(CanViewOrCloneMap,))
    def tile(self, request, pk=None, format=None):
        map = self.get_object()
        layer_hash = request.query_params.get("layer", None)
        z = request.query_params.get("z", None)
        x = request.query_params.get("x", None)
        y = request.query_params.get("y", None)

        # Layer OK?
        layer = None
        for l in map.json["layers"]:
            if l["hash"] == layer_hash:
                layer = l
                break
        if layer is None:
            raise ValidationError(detail="Layer not found.")

        # Has Tile Coordinates OK?
        if z is None or x is None or y is None:
            raise ValidationError(detail="Tile coordinates (X, Y, Z) not found.")

        cache_key = "map_{}_layer_{}_{}_{}_{}".format(map.id, layer_hash, x, y, z)
        memcachedEnabled = True
        fromMemcached = False

        if memcachedEnabled:
            mvt_tile = cache.get(cache_key)
            if mvt_tile is not None:
                fromMemcached = True

        if memcachedEnabled is False or mvt_tile is None:
            mvt_tile = TileGenerator.mvt(layer, int(x), int(y), int(z))

            if memcachedEnabled:
                cache.set(cache_key, mvt_tile, timeout=60 * 60 * 24 * 365)

        response = HttpResponse(
            mvt_tile,
            content_type="application/vnd.mapbox-vector-tile"
        )

        headers = {
            "Access-Control-Allow-Origin": "*",
            "X-From-Memcached": fromMemcached,
        }
        for key, val in headers.items():
            response[key] = val
        return response


class DataInfoViewSet(viewsets.ViewSet):
    """
    API endpoint that allows tabular tables to be viewed or edited.
    """
    permission_classes = (AllowAnyIfPublicSite,)
    serializer_class = DataInfoSerializer

    def list(self, request, format=None):
        tables = []

        # NOTE: not in the for loop directly, to avoid recursive use of schema access
        schema_names = datastore().get_geometry_schemas()
        for schema_name in schema_names:
            with datastore().access_schema(schema_name) as db:
                metadata = db.get_schema_metadata()
                geometry_sources = db.get_geometry_sources_table_info()

            for (geometrysource, tableinfo) in geometry_sources:
                tables.append({
                    "_id": geometrysource.id,
                    "name": tableinfo.name,
                    "description": tableinfo.metadata_json['description'],
                    "geometry_type": geometrysource.geometry_type,
                    "schema_name": schema_name,
                    "schema_title": metadata.name,
                    "schema_date_published": metadata.date_published
                })

        tables.sort(key=lambda table: table["description"])
        tables.sort(key=lambda table: table["schema_date_published"], reverse=True)
        for table in tables:
            del table["schema_date_published"]

        tables = {table["schema_name"] + "." + table["name"]: table for table in tables}
        return Response(tables)

    def retrieve(self, request, format=None, pk=None):
        table_name = pk
        gid = request.query_params.get('gid', None)
        schema_name = request.query_params.get('schema', None)

        with datastore().access_schema(schema_name) as db:
            row = db.get_geometry_source_row(table_name, gid)

            info = {}
            for col, val in row._asdict().items():
                if isinstance(val, WKBElement) is False:
                    info[col] = val

        return Response(info)


class TableInfoViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    API endpoint that allows data tables to be viewed or edited.
    """
    permission_classes = (IsAuthenticatedAndApproved,)
    serializer_class = TableInfoSerializer

    def get_queryset(self):
        pass

    def list(self, request, format=None):
        schema_name = request.query_params.get('schema', None)
        geo_source_id = request.query_params.get('geo_source_id', None)

        if schema_name is None:
            schema_names = datastore().get_ealgis_schemas()
        else:
            schema_names = [schema_name]

        tables = {}
        for schema_name in schema_names:
            with datastore().access_schema(schema_name) as db:
                for table, geometrylinkage in db.get_table_info_and_geometry_linkage_by_ids(geo_source_id=geo_source_id):
                    tmp = TableInfoSerializer(table).data
                    tmp["schema_name"] = schema_name
                    tmp["geometry_source_schema_name"] = geometrylinkage.geometry_source_schema_name
                    tmp["geometry_source_id"] = geometrylinkage.geometry_source_id

                    tableUID = "{}.{}".format(schema_name, table.id)
                    tables[tableUID] = tmp

        if len(tables) == 0:
            raise NotFound()
        return Response(tables)

    @list_route(methods=['post'])
    def fetch(self, request, format=None):
        tables = {}
        if isinstance(request.data, list) and len(request.data) > 0:
            for table in request.data:
                with datastore().access_schema(table["schema_name"]) as db:
                    tbl, geometrylinkage = db.get_table_info_and_geometry_linkage_by_id(table["id"])

                tmp = TableInfoSerializer(tbl).data
                tmp["schema_name"] = table["schema_name"]
                tmp["geometry_source_schema_name"] = geometrylinkage.geometry_source_schema_name
                tmp["geometry_source_id"] = geometrylinkage.geometry_source_id

                tableUID = "%s.%s" % (tmp["schema_name"], tmp["id"])
                tables[tableUID] = tmp

        return Response({"tables": tables})

    @list_route(methods=['get'])
    def fetch_table_for_geometry(self, request, format=None):
        schema_name = request.query_params.get('schema', None)
        table_family = request.query_params.get('table_family', None)
        geo_source_id = request.query_params.get('geo_source_id', None)

        with datastore().access_schema(schema_name) as db:
            try:
                table, geometrylinkage = db.get_table_info_and_geometry_linkage_by_family_and_geometry(table_family, geo_source_id)
            except Exception:
                raise NotFound()

        tmp = TableInfoSerializer(table).data
        tmp["schema_name"] = schema_name
        tmp["geometry_source_schema_name"] = geometrylinkage.geometry_source_schema_name
        tmp["geometry_source_id"] = geometrylinkage.geometry_source_id

        return Response({"table": tmp})

    @list_route(methods=['get'])
    def search(self, request, format=None):
        def getSchemasToQuery(schemas, schema_families):
            schemaNames = []
            ealgisSchemas = datastore().get_ealgis_schemas()

            if schemas is not None:
                schemas = json.loads(schemas)
                schemaNames += [s for s in schemas if s in ealgisSchemas]

            if schema_families is not None:
                schema_families = json.loads(schema_families)
                for schema_name in ealgisSchemas:
                    with datastore().access_schema(schema_name) as db:
                        metadata = db.get_schema_metadata()
                    if metadata.family in schema_families and schema_name not in schemaNames:
                        schemaNames.append(schema_name)

            # Default to searching all available schemas
            if len(schemaNames) == 0:
                schemaNames = ealgisSchemas

            # Sort scheams by name and date published
            schemas = []
            for schema_name in schemaNames:
                with datastore().access_schema(schema_name) as db:
                    metadata = db.get_schema_metadata()

                schema = EALGISMetadataSerializer(metadata).data
                schema["schema_name"] = schema_name
                schemas.append(schema)

            schemas.sort(key=lambda schema: schema["name"])
            schemas.sort(key=lambda schema: schema["date_published"], reverse=True)
            return [schema["schema_name"] for schema in schemas]

        schema_name = request.query_params.get('schema', None)
        geo_source_id = request.query_params.get('geo_source_id', None)
        schema_families = request.query_params.get('schema_families', None)
        schemas = request.query_params.get('schemas', None)
        search = request.query_params.get('search', None)
        search_excluded = request.query_params.get('search_excluded', None)

        search_terms = []
        if search is not None and search != "":
            search_terms = search.split(",")

        search_terms_excluded = []
        if search_excluded is not None and search_excluded != "":
            search_terms_excluded = search_excluded.split(",")

        response = {}
        for schema_name in getSchemasToQuery(schemas, schema_families):
            with datastore().access_schema(schema_name) as db:
                tables = []

                # If we have a single search term it may be a column name,
                # so let's look that up first before trying a regular string
                # search of Table metadata.
                if len(search_terms) == 1:
                    columns = db.get_column_info_by_name(search_terms[0], geo_source_id)

                    if len(columns) > 0:
                        table_ids = [c.table_info_id for c in columns]
                        if len(table_ids) > 0:
                            tables = db.get_table_info_and_geometry_linkage_by_ids(table_ids)

                # If our column search didn't get a response, try serching the Table
                # metadata instead
                if len(tables) == 0:
                    # Search for columns or tables that contain our search terms
                    tables = db.search_columns(search_terms, search_terms_excluded, geo_source_id)

                    # Constrain our search window to a given geometry source (e.g. All tables relating to SA3s)
                    # e.g. https://localhost:8443/api/0.1/tableinfo/search/?search=landlord&schema=aus_census_2011&geo_source_id=4
                    # Find all columns mentioning "landlord" at SA3 level
                    tables += db.search_tables(search_terms, search_terms_excluded, geo_source_id)

            for table, geometrylinkage in tables:
                tmp = TableInfoSerializer(table).data
                tmp["schema_name"] = schema_name
                tmp["geometry_source_schema_name"] = geometrylinkage.geometry_source_schema_name
                tmp["geometry_source_id"] = geometrylinkage.geometry_source_id

                tableUID = "%s.%s" % (schema_name, table.id)
                response[tableUID] = tmp

        if len(response) == 0:
            raise NotFound()
        return Response(response)


class ColumnInfoViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    API endpoint that allows data columns to be viewed.
    """
    permission_classes = (IsAuthenticatedAndApproved,)
    serializer_class = ColumnInfoSerializer

    def get_queryset(self):
        pass

    def retrieve(self, request, format=None, pk=None):
        id = pk
        schema_name = request.query_params.get('schema', None)

        # e.g. https://localhost:8443/api/0.1/columninfo/142949/?schema=aus_census_2011_bcp&format=json
        # Number of Persons usually resident Five; Non-family households
        with datastore().access_schema(schema_name) as db:
            column = db.get_column_info(id)
            if column is None:
                raise NotFound()

            table, geometrylinkage = db.get_table_info_and_geometry_linkage_by_id(column.table_info_id)
            if table is None:
                raise NotFound()

            return Response({
                "column": {
                    **self.serializer_class(column).data,
                    **{
                        "schema_name": schema_name,
                        "geometry_source_schema_name": geometrylinkage.geometry_source_schema_name,
                        "geometry_source_id": geometrylinkage.geometry_source_id
                    },
                },
                "table": {
                    **TableInfoSerializer(table).data,
                    **{
                        "geometry_source_schema_name": geometrylinkage.geometry_source_schema_name,
                        "geometry_source_id": geometrylinkage.geometry_source_id
                    },
                },
                "schema": schema_name,
            })

    @list_route(methods=['post'])
    def by_schema(self, request, format=None):
        columnsByUID = {}
        tablesByUID = {}

        for schema_name in request.data:
            with datastore().access_schema(schema_name) as db:
                columns = db.get_column_info_by_names(request.data[schema_name])
                tableIds = list(set([col.table_info_id for col, gl in columns]))
                tables = db.get_table_info_and_geometry_linkage_by_ids(tableIds)

            for column, geometrylinkage in columns:
                col = ColumnInfoSerializer(column).data
                col["schema_name"] = schema_name
                col["geometry_source_schema_name"] = geometrylinkage.geometry_source_schema_name
                col["geometry_source_id"] = geometrylinkage.geometry_source_id
                columnsByUID["%s.%s" % (schema_name, column.id)] = col

            for table, geometrylinkage in tables:
                tbl = TableInfoSerializer(table).data
                tbl["schema_name"] = schema_name
                tbl["geometry_source_schema_name"] = geometrylinkage.geometry_source_schema_name
                tbl["geometry_source_id"] = geometrylinkage.geometry_source_id
                tablesByUID["%s.%s" % (schema_name, table.id)] = tbl

        return Response({"columns": columnsByUID, "tables": tablesByUID})

    @list_route(methods=['get'])
    def fetch_for_table(self, request, format=None):
        schema_name = request.query_params.get('schema', None)
        tableinfo_id = request.query_params.get('tableinfo_id', None)

        # Constrain our fetch to a given table (i.e. All columns relating to a specific table)
        # NB: For the Census data this implicitly limits us to a geometry soruce as well
        # e.g. https://localhost:8443/api/0.1/columninfo/fetch_for_table/?schema=aus_census_2011_xcp&tableinfo_id=490
        # Find all columns mentioning in table "Ancestry by Birthplace of Parents by Sex - Persons" (x06s3_aust_lga)
        with datastore().access_schema(schema_name) as db:
            columns = db.fetch_columns(tableinfo_id)

        # Split the response into an object of columns tables indexed by ther uid.
        # Often columns will refer to the same table, so this reduces payload size.
        response = {
            "columns": {},
            "tables": {},
        }
        types = []
        for (column, geometrylinkage, tableinfo) in columns:
            table = TableInfoSerializer(tableinfo).data
            table["schema_name"] = schema_name
            table["geometry_source_schema_name"] = geometrylinkage.geometry_source_schema_name
            table["geometry_source_id"] = geometrylinkage.geometry_source_id

            tableUID = "%s.%s" % (schema_name, table["name"])
            if tableUID not in response["tables"]:
                response["tables"][tableUID] = table

            col = self.serializer_class(column).data
            col["schema_name"] = schema_name
            col["geometry_source_schema_name"] = geometrylinkage.geometry_source_schema_name
            col["geometry_source_id"] = geometrylinkage.geometry_source_id

            columnUID = "%s.%s" % (schema_name, column.name)
            response["columns"][columnUID] = col

            types.append(column.metadata_json["type"])

        if len(response["columns"]) == 0:
            raise NotFound()
        return Response(response)

    @detail_route(methods=['get'])
    def summary_stats(self, request, pk=None, format=None):
        id = pk
        schema_name = request.query_params.get('schema', None)

        # e.g. https://localhost:8443/api/0.1/columninfo/60631/summary_stats/?schema=aus_census_2011_bcp&format=json
        # Number of Persons usually resident One; Non-family households
        with datastore().access_schema(schema_name) as db:
            column = db.get_column_info(id)
            if column is None:
                raise NotFound()

            table = db.get_table_info_by_id(column.table_info_id)
            if table is None:
                raise NotFound()

            return Response(db.get_summary_stats_for_column(column, table))


class ColoursViewset(viewsets.ViewSet):
    """
    API endpoint that returns available colours scale for styling.
    """
    permission_classes = (IsAuthenticatedAndApproved,)

    def list(self, request, format=None):
        with open('/app/contrib/colorbrewer/ColorBrewer_all_schemes_RGBonly3.csv') as f:
            reader = csv.reader(f)
            header = next(reader)

            colours = []
            for row in reader:
                # Break out before we get to the license embedded in the CSV file
                if row[0] == "" and row[4] == "":
                    break
                colours.append(row)

            response = Response({"header": header, "colours": colours})
            return response


class SchemasViewSet(viewsets.ViewSet):
    """
    API endpoint that scans the database for EAlGIS-compliant schemas.
    """
    permission_classes = (IsAuthenticatedAndApproved,)

    def list(self, request, format=None):
        schema_names = datastore().get_ealgis_schemas()

        schemas = []
        for schema_name in schema_names:
            with datastore().access_schema(schema_name) as db:
                metadata = db.get_schema_metadata()

            schema = EALGISMetadataSerializer(metadata).data
            schema["schema_name"] = schema_name
            schemas.append(schema)

        schemas.sort(key=lambda schema: schema["name"])
        schemas.sort(key=lambda schema: schema["date_published"], reverse=True)
        schemas = {schema["schema_name"]: schema for schema in schemas}
        return Response(schemas)
