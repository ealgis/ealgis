from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.db.models import Q
from django.http.response import HttpResponse
from django.core.cache import cache
from .models import MapDefinition
from geoalchemy2.elements import WKBElement

from rest_framework import viewsets, mixins, status
from rest_framework.views import APIView
from rest_framework.decorators import detail_route, list_route
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .permissions import IsAuthenticatedAndApproved, IsMapOwnerOrReadOnly, IsMapOwner, CanCloneMap

from .serializers import UserSerializer, ProfileSerializer, MapDefinitionSerializer, TableInfoSerializer, DataInfoSerializer, ColumnInfoSerializer, GeometryLinkageSerializer, EALGISMetadataSerializer
from ealgis.colour_scale import definitions, make_colour_scale

import time
import copy
import urllib.parse
import json
from django.http import HttpResponseNotFound
from ealgis.util import deepupdate
from ealgis_common.db import broker
from ealgis.mvt import TileGenerator


def api_not_found(request):
    return HttpResponseNotFound()


class CurrentUserView(APIView):
    def get(self, request):
        if request.user.is_authenticated():
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
        if "tables" in request.data and isinstance(request.data["tables"], list):
            # If they're valid tables
            tmp_recent_tables = []
            for table in request.data["tables"]:
                with broker.access_schema(table["schema_name"]) as db:
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
                db = broker.access_schema(table["schema_name"])
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

    @list_route(methods=['get'])
    def all(self, request, format=None):
        maps = self.get_queryset()

        # Reset any abandoned edit sessions
        # This only works because /maps/all/ is called on app load
        for map in maps:
            for layerId, layer in enumerate(map.json["layers"]):
                if map.has_master_layer(layerId):
                    map.restore_master_layer(layerId)

                    serializer = MapDefinitionSerializer(map, data={"json": map.json}, partial=True)
                    if serializer.is_valid():
                        serializer.save()

        serializer = MapDefinitionSerializer(maps, many=True)
        return Response(serializer.data)

    @list_route(methods=['get'])
    def shared(self, request, format=None):
        maps = MapDefinition.objects.all().filter(
            shared=MapDefinition.AUTHENTICATED_USERS_SHARED).exclude(owner_user_id=request.user)
        serializer = MapDefinitionSerializer(maps, many=True)
        return Response(serializer.data)

    @list_route(methods=['get'])
    def public(self, request, format=None):
        maps = MapDefinition.objects.all().filter(
            shared=MapDefinition.PUBLIC_SHARED).exclude(owner_user_id=request.user)
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

            olStyleDef = serializer.createOLStyleDef(newLayer)
            if olStyleDef is not False:
                newLayer["olStyleDef"] = olStyleDef

            return Response({
                "layerId": layerId,
                "layer": newLayer,
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['put'])
    def initDraftLayer(self, request, pk=None, format=None):
        map = self.get_object()
        layerId = int(request.data["layerId"])

        if layerId < 0:
            raise ValidationError(detail="LayerId not valid.")

        if (layerId + 1) > len(map.json["layers"]):
            raise ValidationError(detail="Layer not found.")

        json = map.json
        layer = json["layers"][layerId]

        if "master" in layer:
            layer = layer["master"]

        # Make a new master object (first time editing this layer) so we have a copy to restore
        # if we don't publish the edits to this layer.
        layer["master"] = copy.deepcopy(layer)
        layer["draft"] = True
        json["layers"][layerId] = layer

        serializer = MapDefinitionSerializer(
            map, data={"json": json}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({})
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['put'])
    def editDraftLayer(self, request, pk=None, format=None):
        map = self.get_object()
        layerId = int(request.data["layerId"])

        if not (layerId >= 0 or type(request.data["layer"]) is dict):
            raise ValidationError(
                detail="LayerId and/or Layer object not found.")

        if (layerId + 1) > len(map.json["layers"]):
            raise ValidationError(detail="Layer not found.")

        json = copy.deepcopy(map.json)
        layer = json["layers"][layerId]

        if "master" not in layer:
            raise ValidationError(detail="Layer edit session not initialised.")

        json["layers"][layerId] = deepupdate(layer, request.data["layer"])

        serializer = MapDefinitionSerializer(
            map, data={"json": json}, partial=True)
        if serializer.is_valid():
            serializer.save()

            newLayer = serializer.validated_data["json"]["layers"][layerId]
            del newLayer["master"]
            del newLayer["draft"]

            olStyleDef = serializer.createOLStyleDef(newLayer)
            if olStyleDef is not False:
                newLayer["olStyleDef"] = olStyleDef

            return Response(newLayer)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['put'])
    def publishLayer(self, request, pk=None, format=None):
        map = self.get_object()
        layerId = int(request.data["layerId"])

        if not (layerId >= 0 or type(request.data["layer"]) is dict):
            raise ValidationError(
                detail="LayerId and/or Layer object not found.")

        if (layerId + 1) > len(map.json["layers"]):
            raise ValidationError(detail="Layer not found.")

        json = map.json
        json["layers"][layerId] = request.data["layer"]

        serializer = MapDefinitionSerializer(
            map, data={"json": json}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data["json"]["layers"][layerId])
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @detail_route(methods=['put'])
    def restoreMasterLayer(self, request, pk=None, format=None):
        map = self.get_object()
        layerId = int(request.data["layerId"])

        if not (layerId >= 0 or type(request.data["layer"]) is dict):
            raise ValidationError(
                detail="LayerId and/or Layer object not found.")

        if (layerId + 1) > len(map.json["layers"]):
            raise ValidationError(detail="Layer not found.")

        if "master" not in map.json["layers"][layerId] or "draft" not in map.json["layers"][layerId]:
            raise ValidationError(
                detail="Layer has not been edited - nothing to restore.")

        json = map.json
        json["layers"][layerId] = copy.deepcopy(
            json["layers"][layerId]["master"])

        serializer = MapDefinitionSerializer(
            map, data={"json": json}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data["json"]["layers"][layerId])
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

    @detail_route(methods=['put'], permission_classes=(IsAuthenticatedAndApproved, CanCloneMap,))
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

        with broker.access_data() as db:
            return Response(db.get_summary_stats_for_layer(layer))

    @detail_route(methods=['get'])
    def export_csv(self, request, pk=None, format=None):
        mapDefn = self.get_object()
        include_geom_attrs = request.query_params.get(
            "include_geom_attrs", False)
        include_geom_attrs = True if (include_geom_attrs == "true") else False

        from ..dataexport import export_csv_iter
        response = HttpResponse(export_csv_iter(
            mapDefn, include_geom_attrs=include_geom_attrs), content_type="text/csv")
        response['Content-Disposition'] = 'attachment; filename="%s.csv"' % urllib.parse.quote(
            mapDefn.name)
        response['Cache-Control'] = 'max-age=86400, public'
        return response

    @detail_route(methods=['get'])
    def export_csv_viewport(self, request, pk=None, format=None):
        mapDefn = self.get_object()
        include_geom_attrs = request.query_params.get(
            "include_geom_attrs", False)
        include_geom_attrs = True if (include_geom_attrs == "true") else False

        ne = list(map(float, request.query_params.get("ne", None).split(',')))
        sw = list(map(float, request.query_params.get("sw", None).split(',')))
        if len(ne) != 2 or len(sw) != 2:
            return Response(status=status.HTTP_404_NOT_FOUND)

        from ..dataexport import export_csv_iter
        response = HttpResponse(export_csv_iter(mapDefn, bounds=(
            ne, sw), include_geom_attrs=include_geom_attrs), content_type="text/csv")
        response['Content-Disposition'] = 'attachment; filename="%s_%f_%f_%f_%f.csv"' % (
            urllib.parse.quote(mapDefn.name), ne[0], ne[1], sw[0], sw[1])
        response['Cache-Control'] = 'max-age=86400, public'
        return response

    @detail_route(methods=['get'])
    def columns(self, request, pk=None, format=None):
        qp = request.query_params

        raise ValidationError(detail="What does this method do? Why aren't we using the similar ones on /api/0.1/columninfo/columninfo?")

        layerId = int(qp["layerId"]) if "layerId" in qp else None
        if layerId is None:
            raise NotFound()

        response = []
        for c in self.get_object().json["layers"][layerId]["selectedColumns"]:
            db = broker.Provide(c["schema"])
            column = db.get_column_info(c["id"])
            if column is None:
                raise NotFound()

            db = broker.access_schema(c["schema"])
            table = db.get_table_info_by_id(column.table_info_id)
            if table is None:
                raise NotFound()

            response.append({
                "column": ColumnInfoSerializer(column).data,
                "table": TableInfoSerializer(table).data,
                "schema": c["schema"],
            })
        return Response(response)

    @detail_route(methods=['get'])
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

        cache_key = "layer_{}_{}_{}_{}".format(layer_hash, x, y, z)
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
    permission_classes = (IsAuthenticatedAndApproved,)
    serializer_class = DataInfoSerializer

    def list(self, request, format=None):
        info = broker.schema_information()
        tables = {}
        for schema_name in info.get_geometry_schemas():
            metadata = broker.access_schema(schema_name).get_schema_metadata()
            geometry_sources = broker.access_schema(schema_name).get_geometry_sources_table_info()

            for (geometrysource, tableinfo) in geometry_sources:
                # if tableinfo.name == "lga" or tableinfo.name == "sa1":
                uname = "{}.{}".format(schema_name, tableinfo.name)
                tables[uname] = {
                    "_id": geometrysource.id,
                    "name": tableinfo.name,
                    "description": tableinfo.metadata_json['description'],
                    "geometry_type": geometrysource.geometry_type,
                    "schema_name": schema_name,
                    "schema_title": metadata.name
                }

        return Response(tables)

    def retrieve(self, request, format=None, pk=None):
        table_name = pk
        gid = request.query_params.get('gid', None)
        schema_name = request.query_params.get('schema', None)

        with broker.access_schema(schema_name) as db:
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
            info = broker.schema_information()
            schema_names = info.get_ealgis_schemas()
        else:
            schema_names = [schema_name]

        tables = {}
        for schema_name in schema_names:
            db = broker.access_schema(schema_name)
            for t in db.get_data_tables(geo_source_id):
                uname = "{}.{}".format(schema_name, t.id)
                tables[uname] = {
                    **TableInfoSerializer(t).data,
                    **{"schema_name": schema_name}
                }

        if len(tables) == 0:
            raise NotFound()
        return Response(tables)

    @list_route(methods=['post'])
    def fetch(self, request, format=None):
        tables = {}
        if isinstance(request.data, list) and len(request.data) > 0:
            for table in request.data:
                db = broker.access_schema(table["schema_name"])
                tbl = db.get_table_info_by_id(table["id"])
                if tbl is not None:
                    tmp = TableInfoSerializer(tbl).data
                    tmp["schema_name"] = table["schema_name"]

                    tableUID = "%s.%s" % (tmp["schema_name"], tmp["id"])
                    tables[tableUID] = tmp

        return Response({"tables": tables})

    @list_route(methods=['get'])
    def search(self, request, format=None):
        def getSchemasToQuery(schemas, schema_families):
            schemaNames = []
            info = broker.schema_information()
            ealgisSchemas = info.get_ealgis_schemas()

            if schemas is not None:
                schemas = json.loads(schemas)
                schemaNames += [s for s in schemas if s in ealgisSchemas]

            if schema_families is not None:
                schema_families = json.loads(schema_families)
                for schema_name in ealgisSchemas:
                    metadata = broker.access_schema(schema_name).get_schema_metadata()
                    if metadata.family in schema_families and schema_name not in schemaNames:
                        schemaNames.append(schema_name)

            # Default to searching all available schemas
            if len(schemaNames) == 0:
                schemaNames = ealgisSchemas

            return schemaNames

        schema_name = request.query_params.get('schema', None)
        geo_source_id = request.query_params.get('geo_source_id', None)
        schema_families = request.query_params.get('schema_families', None)
        schemas = request.query_params.get('schemas', None)
        search = request.query_params.get('search', None)
        search_excluded = request.query_params.get('search_excluded', None)
        qp = request.query_params

        search_terms = []
        if search is not None and search != "":
            search_terms = search.split(",")

        search_terms_excluded = []
        if search_excluded is not None and search_excluded != "":
            search_terms_excluded = search_excluded.split(",")

        response = {}
        for schema_name in getSchemasToQuery(schemas, schema_families):
            db = broker.access_schema(schema_name)
            tables = []

            # If we have a single search term it may be a column name,
            # so let's look that up first before trying a regular string
            # search of Table metadata.
            if len(search_terms) == 1:
                columns = db.get_column_info_by_name(search_terms[0], geo_source_id)

                if len(columns) > 0:
                    table_ids = [c.table_info_id for c in columns]
                    tables = db.get_table_info_by_ids(table_ids)

            # If our column search didn't get a response, try serching the Table
            # metadata instead
            if len(tables) == 0:
                # Now we can search for columns AND tables that contain our search terms
                tables = db.search_columns(search_terms, search_terms_excluded, geo_source_id)

                # Constrain our search window to a given geometry source (e.g. All tables relating to SA3s)
                # e.g. https://localhost:8443/api/0.1/tableinfo/search/?search=landlord&schema=aus_census_2011&geo_source_id=4
                # Find all columns mentioning "landlord" at SA3 level
                tables += db.search_tables(search_terms, search_terms_excluded, geo_source_id)

            for tableinfo in tables:
                table = TableInfoSerializer(tableinfo).data
                table["schema_name"] = schema_name

                tableUID = "%s.%s" % (schema_name, table["id"])
                response[tableUID] = table

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
        with broker.access_schema(schema_name) as db:
            column = db.get_column_info(id)
            if column is None:
                raise NotFound()

            table = db.get_table_info_by_id(column.table_info_id)
            if table is None:
                raise NotFound()

            return Response({
                "column": {
                    **self.serializer_class(column).data,
                    **{"schema_name": schema_name}
                },
                "table": TableInfoSerializer(table).data,
                "schema": schema_name,
            })

    @list_route(methods=['post'])
    def by_schema(self, request, format=None):
        columnsByUID = {}
        tablesByUID = {}

        for schema_name in request.data:
            db = broker.access_schema(schema_name)
            columns = db.get_column_info_by_names(request.data[schema_name])
            tableIds = list(set([col.table_info_id for col in columns]))
            tables = db.get_table_info_by_ids(tableIds)

            for column in columns:
                col = ColumnInfoSerializer(column).data
                col["schema_name"] = schema_name
                columnsByUID["%s.%s" % (schema_name, column.id)] = col

            for table in tables:
                tmp = TableInfoSerializer(table).data
                tmp["schema_name"] = schema_name
                tablesByUID["%s.%s" % (schema_name, table.id)] = tmp

        return Response({"columns": columnsByUID, "tables": tablesByUID})

    @list_route(methods=['get'])
    def fetch_for_table(self, request, format=None):
        schema_name = request.query_params.get('schema', None)
        tableinfo_id = request.query_params.get('tableinfo_id', None)

        # Constrain our fetch to a given table (i.e. All columns relating to a specific table)
        # NB: For the Census data this implicitly limits us to a geometry soruce as well
        # e.g. https://localhost:8443/api/0.1/columninfo/fetch_for_table/?schema=aus_census_2011_xcp&tableinfo_id=490
        # Find all columns mentioning in table "Ancestry by Birthplace of Parents by Sex - Persons" (x06s3_aust_lga)
        with broker.access_schema(schema_name) as db:
            columns = db.fetch_columns(tableinfo_id)

        # Split the response into an object of columns tables indexed by ther uid.
        # Often columns will refer to the same table, so this reduces payload size.
        response = {
            "columns": {},
            "tables": {},
        }
        for (column, geomlinkage, tableinfo) in columns:
            table = TableInfoSerializer(tableinfo).data
            table["schema_name"] = schema_name

            tableUID = "%s.%s" % (schema_name, table["name"])
            if tableUID not in response["tables"]:
                response["tables"][tableUID] = table

            col = self.serializer_class(column).data
            col["schema_name"] = schema_name
            col["geomlinkage"] = GeometryLinkageSerializer(geomlinkage).data
            columnUID = "%s.%s" % (schema_name, column.name)
            response["columns"][columnUID] = col

        if len(response["columns"]) == 0:
            raise NotFound()
        return Response(response)

    @detail_route(methods=['get'])
    def summary_stats(self, request, pk=None, format=None):
        id = pk
        schema_name = request.query_params.get('schema', None)

        # e.g. https://localhost:8443/api/0.1/columninfo/60631/summary_stats/?schema=aus_census_2011_bcp&format=json
        # Number of Persons usually resident One; Non-family households
        with broker.access_schema(schema_name) as db:
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
        return Response(definitions.get_json())

    @list_route(methods=['get'])
    def defs(self, request):
        return Response(definitions.get_defs_json())


class SchemasViewSet(viewsets.ViewSet):
    """
    API endpoint that scans the database for EAlGIS-compliant schemas.
    """
    permission_classes = (IsAuthenticatedAndApproved,)

    def list(self, request, format=None):
        info = broker.schema_information()
        schema_names = info.get_ealgis_schemas()

        schemas = {}
        for schema_name in schema_names:
            metadata = broker.access_schema(schema_name).get_schema_metadata()
            schemas[schema_name] = EALGISMetadataSerializer(metadata).data
            schemas[schema_name]["schema_name"] = schema_name
        return Response(schemas)
