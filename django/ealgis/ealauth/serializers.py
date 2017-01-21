from django.contrib.auth.models import User
from .models import *
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from ealgis.ealgis import NoMatches, TooManyMatches, CompilationError
from ealgis.ealauth.geoserver import GeoServerMap

class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = (
            'url',
            'username',
            'first_name',
            'last_name',
            'email',
            'is_staff',
            'is_active',
            'date_joined',
            'groups')


class MapDefinitionSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MapDefinition
        fields = ('id', 'name', 'description', 'json', 'owner_user_id')


class JSONMetadataField(serializers.Field):
    """
    JSON metadata objects are serialized into a JSON string, 
    and from a string to a JSON object.
    """
    def to_representation(self, metadata_json):
        return json.loads(metadata_json)

    def to_internal_value(self, metadata_json):
        return json.dumps(metadata_json)

class TableInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    metadata_json = JSONMetadataField()
    columns = serializers.JSONField()

class DataInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    metadata_json = JSONMetadataField()