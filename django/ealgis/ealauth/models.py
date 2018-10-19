import base64
import hashlib
import json

from django.core.cache import cache
import pyparsing
from django.apps import apps
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField
from django.db import models
from model_utils import FieldTracker

from ..datastore import datastore
from ..util import make_logger
from .exceptions import CompilationError

logger = make_logger(__name__)


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)
    recent_tables = JSONField(default=list, blank=True, null=True)
    favourite_tables = JSONField(default=list, blank=True, null=True)

    tracker = FieldTracker()

    def __str__(self):
        return self.user.username


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
    name = models.CharField(max_length=128)
    owner_user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField(blank=True, default="")
    json = JSONField(null=True)
    shared = models.IntegerField(
        choices=SHARED_CHOICES, default=PRIVATE_SHARED)

    class Meta:
        unique_together = ('name', 'owner_user_id')

    def has_geometry(self, layer):
        return "geometry" in layer and layer["geometry"] is not None

    @staticmethod
    def compile_expr(layer, **kwargs):
        # in here to avoid circular import
        from ..dataexpr import DataExpression
        geometry_source_name = layer['geometry']
        schema_name = layer['schema']

        with datastore().access_schema(schema_name) as db:
            geometry_source = db.get_geometry_source(geometry_source_name)

        return DataExpression(
            layer['name'],
            geometry_source,
            layer['fill'].get('expression', ''),
            layer['fill'].get('conditional', ''),
            apps.get_app_config('ealauth').map_srid,
            **kwargs)

    @staticmethod
    def layer_hash(layer):
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
        # URL-safe base64 encoded SHA1 hash
        json_layer = json.dumps(hash_obj, sort_keys=True).encode('utf8')
        digest = hashlib.sha1(json_layer).digest()
        return base64.b64encode(digest, altchars=b'.-').decode('ascii')

    @staticmethod
    def layer_postgis_query(layer):
        cache_key = layer['hash']
        query = cache.get(cache_key)
        if query is None:
            try:
                expr = MapDefinition.compile_expr(layer)
                query = expr.get_postgis_query()
                logger.debug("... compilation complete; query:")
                logger.debug(query)
            except pyparsing.ParseException as e:
                raise CompilationError(str(e))
            cache.set(cache_key, query)
        return query

    def clean(self):
        for idx, layer in enumerate(self.json['layers']):
            # FIXME: do this in a migration instead
            if '_postgis_query' in layer:
                del layer['_postgis_query']
            if self.has_geometry(layer):
                logger.debug(['>clean', idx, layer])
                layer['hash'] = self.layer_hash(layer)
                layer['latlon_bbox'] = MapDefinition.get_bbox_for_layer(layer)
                # ... and check that we can compile this layer (and warm up the cache)
                self.layer_postgis_query(layer)

    @staticmethod
    def get_summary_stats_for_layer(layer):
        SQL_TEMPLATE = """
            SELECT
                MIN(sq.q),
                MAX(sq.q),
                STDDEV(sq.q)
            FROM ({query}) AS sq"""

        with datastore().access_data() as db:
            (min_value, max_value, stddev) = db.session.execute(SQL_TEMPLATE.format(query=MapDefinition.layer_postgis_query(layer))).first()
        return {
            "min": min_value or 0,
            "max": max_value or 0,
            "stddev": stddev or 0,
        }

    @staticmethod
    def get_bbox_for_layer(layer):
        SQL_TEMPLATE = """
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
        """

        with datastore().access_data() as db:
            return dict(db.session.execute(SQL_TEMPLATE.format(query=MapDefinition.layer_postgis_query(layer))).first())

    @staticmethod
    def get_summary_stats_for_column(column, table):
        SQL_TEMPLATE = """
            SELECT
                MIN(sq.q),
                MAX(sq.q),
                STDDEV(sq.q)
            FROM (SELECT {col_name} AS q FROM {schema_name}.{table_name}) AS sq"""

        with datastore().access_data() as db:
            (min_value, max_value, stddev) = db.session.execute(SQL_TEMPLATE.format(col_name=column.name, schema_name=db._schema_name, table_name=table.name)).first()

        return {
            "min": min_value or 0,
            "max": max_value or 0,
            "stddev": stddev or 0,
        }
