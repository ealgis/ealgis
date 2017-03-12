try:
    import simplejson as json
except ImportError:
    import json
from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User
from django.apps import apps
import pyparsing
import hashlib

# Create your models here.
# mapserver epoch; allows us to force re-compilation when things are changed
MAPSERVER_EPOCH = 2

class MapDefinition(models.Model):
    "map definition - all state for a EAlGIS map"
    name = models.CharField(max_length=32)
    owner_user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    json = JSONField(null=True)

    class Meta:
        unique_together = ('name', 'owner_user_id')

    @classmethod
    def get_by_name(self, map_name):
        try:
            return MapDefinition.query.filter(MapDefinition.name == map_name).one()
        except sqlalchemy.orm.exc.NoResultFound:
            return None

    def get(self):
        self.eal = apps.get_app_config('ealauth').eal
        if self.json is not None:
            return self.json
        return {}

    def compile_expr(self, layer, **kwargs):
        # in here to avoid circular import
        from ealgis.dataexpr import DataExpression
        geometry_source_name = layer['geometry']
        schema_name = layer['schema']
        geometry_source = self.eal.get_geometry_source(geometry_source_name, schema_name)

        return DataExpression(
            layer['name'],
            geometry_source,
            layer['fill'].get('expression', ''),
            layer['fill'].get('conditional', ''),
            apps.get_app_config('ealauth').map_srid,
            **kwargs)

    def _private_clear(self, obj):
        for k, v in obj.copy().items():
            if k.startswith('_'):
                del obj[k]
            elif type(v) == dict:
                self._private_clear(v)

    def _private_copy_over(self, from_obj, to_obj):
        for k, v in from_obj.items():
            if k.startswith('_'):
                to_obj[k] = v
            elif type(v) == dict:
                jump_to_obj = to_obj.get(k)
                if jump_to_obj is not None:
                    self._private_copy_over(v, jump_to_obj)

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

        if force or not old_layer or old_differs('geometry') or old_differs('fill', 'expression') or old_differs('fill', 'conditional') or get_recurse(layer, 'fill', '_mapserver_epoch') != MAPSERVER_EPOCH:
            print("compiling query for layer:", layer.get('name'))
            expr = self.compile_expr(layer)
            layer['_postgis_query'] = expr.get_postgis_query()
            layer['_mapserver_epoch'] = MAPSERVER_EPOCH
            print("... compilation complete; query:")
            print(layer['_postgis_query'])

    def _layer_update_hash(self, layer):
        try:
            del layer['hash']
        except KeyError:
            pass

        hash_obj = {
            "schema": layer["schema"],
            "geometry": layer["geometry"],
            "expression": layer["fill"]["expression"]
        }
        layer['hash'] = hashlib.sha1(json.dumps(hash_obj).encode("utf-8")).hexdigest()[:8]
    
    def _layer_set_latlon_bbox(self, layer, bbox):
        layer["latlon_bbox"] = bbox
    
    def _get_latlon_bbox(self, layer):
        bbox_query = """
            SELECT 
                ST_XMin(latlon_bbox) AS minx, 
                ST_XMax(latlon_bbox) AS maxx, 
                ST_YMin(latlon_bbox) AS miny, 
                ST_YMax(latlon_bbox) as maxy 
            FROM (
                SELECT 
                    -- Eugh
                    Box2D(ST_GeomFromText(ST_AsText(ST_Transform(ST_SetSRID(ST_Extent(geom_3857), 3857), 4326)))) AS latlon_bbox 
                FROM (
                    {query}
                ) AS exp
            ) AS bbox;
        """.format(query=layer['_postgis_query'])
        
        eal = apps.get_app_config('ealauth').eal
        results = eal.session.execute(bbox_query)
        return dict(results.first())

    def _set(self, defn, force=False):
        old_defn = self.get()
        if 'layers' not in old_defn:
            old_defn['layers'] = {}
        rev = old_defn.get('rev', 0) + 1
        defn['rev'] = rev
        for k, layer in defn['layers'].items():
            # compile layer SQL expression (this is sometimes slow, so best to do
            # just the once)
            old_layer = old_defn['layers'].get(k)
            # private variables we don't allow the client to set; we simply clear & copy over
            # from the last object in the database
            self._private_clear(layer)
            if old_layer is not None:
                self._private_copy_over(old_layer, layer)
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