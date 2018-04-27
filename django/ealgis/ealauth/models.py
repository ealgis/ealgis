import json
from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User
from django.apps import apps
from ealgis.util import make_logger
from ealgis_common.db import broker
import pyparsing
import hashlib
import copy

logger = make_logger(__name__)


# Create your models here.
class CompilationError(Exception):
    pass


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)
    recent_tables = JSONField(default=list)
    favourite_tables = JSONField(default=list)


class MapDefinition(models.Model):
    PRIVATE_SHARED = 1
    AUTHENTICATED_USERS_SHARED = 2
    PUBLIC_SHARED = 3
    SHARED_CHOICES = (
        (PRIVATE_SHARED, 'Private'),
        (AUTHENTICATED_USERS_SHARED, 'Authenticated Users Only'),
        (PUBLIC_SHARED, 'Public On The Web'),
    )

    "map definition - all state for a EAlGIS map"
    name = models.CharField(max_length=32)
    owner_user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField(blank=True, default="")
    json = JSONField(null=True)
    shared = models.IntegerField(
        choices=SHARED_CHOICES, default=PRIVATE_SHARED)

    class Meta:
        unique_together = ('name', 'owner_user_id')

    def get(self):
        if self.json is not None:
            return self.json
        return {}

    def compile_expr(self, layer, **kwargs):
        # in here to avoid circular import
        from ealgis.dataexpr import DataExpression
        geometry_source_name = layer['geometry']
        schema_name = layer['schema']

        db = broker.access_schema(schema_name)
        geometry_source = db.get_geometry_source(geometry_source_name)

        return DataExpression(
            layer['name'],
            geometry_source,
            layer['fill'].get('expression', ''),
            layer['fill'].get('conditional', ''),
            apps.get_app_config('ealauth').map_srid,
            **kwargs)

    def _layer_build_postgis_query(self, old_layer, layer, force):
        def get_recurse(obj, *args):
            for v in args[:-1]:
                obj = obj.get(v)
                if obj is None:
                    return None
            return obj.get(args[-1])

        # can we skip SQL compilation? it's sometimes slow, so worth extra code
        def old_differs(*args):
            old = get_recurse(old_layer, *args)
            new = get_recurse(layer, *args)
            return old != new

        if force or '_postgis_query' not in layer or not old_layer or old_differs('geometry') or old_differs('fill', 'expression') or old_differs('fill', 'conditional'):
            logger.debug(
                "compiling query for layer: {}".format(layer.get('name')))
            expr = self.compile_expr(layer)
            layer['_postgis_query'] = expr.get_postgis_query()
            logger.debug("... compilation complete; query:")
            logger.debug(layer['_postgis_query'])

    def _layer_update_hash(self, layer):
        try:
            del layer['hash']
        except KeyError:
            pass

        hash_obj = {
            "schema": layer["schema"],
            "geometry": layer["geometry"],
            "expression": layer["fill"]["expression"],
            "conditional": layer["fill"]["conditional"],
        }
        layer['hash'] = hashlib.sha1(json.dumps(
            hash_obj).encode("utf-8")).hexdigest()[:8]

    def _layer_set_latlon_bbox(self, layer, bbox):
        layer["latlon_bbox"] = bbox

    def _get_latlon_bbox(self, layer):
        db = broker.access_data()
        return db.get_bbox_for_layer(layer)

    def _set(self, defn, force=False):
        def _private_clear(obj):
            "clear all fields beginning with an _ (recursively down the tree)"
            for k, v in obj.copy().items():
                if k.startswith('_'):
                    del obj[k]
                elif isinstance(v, dict):
                    _private_clear(v)

        def _private_copy_over(from_obj, to_obj):
            "copy private keys from old object to new object"
            for k, v in from_obj.items():
                if k.startswith('_'):
                    to_obj[k] = v
                elif isinstance(v, dict):
                    jump_to_obj = to_obj.get(k)
                    if jump_to_obj is not None:
                        _private_copy_over(v, jump_to_obj)

        # Otherwise _private_clear() ends up removing private properties from old_layer too
        old_defn = copy.deepcopy(self.get())
        if 'layers' not in defn:
            defn['layers'] = []
        if 'layers' not in old_defn:
            old_defn['layers'] = []
        rev = old_defn.get('rev', 0) + 1
        defn['rev'] = rev
        for idx, layer in enumerate(defn['layers']):
            # we don't allow the client to set private variables (security)
            # we simply clear & copy over from the last object in the database
            # FIXME: private variables should be removed (no need for frontend to see them)
            _private_clear(layer)
            old_layer = None
            try:
                old_layer = old_defn['layers'][idx]
            except IndexError:
                pass
            if old_layer is not None:
                _private_copy_over(old_layer, layer)
            # rebuild postgis query
            self._layer_build_postgis_query(old_layer, layer, force)
            # update layer hash
            self._layer_update_hash(layer)
            # calculate latlon bounding box of the expression
            self._layer_set_latlon_bbox(layer, self._get_latlon_bbox(layer))
        self.json = defn
        return rev

    def set(self, defn, **kwargs):
        try:
            return self._set(defn, **kwargs)
        except pyparsing.ParseException as e:
            raise CompilationError(str(e))

    def has_master_layer(self, layerId):
        return "master" in self.json["layers"][layerId]

    def restore_master_layer(self, layerId):
        self.json["layers"][layerId] = copy.deepcopy(self.json["layers"][layerId]["master"])
