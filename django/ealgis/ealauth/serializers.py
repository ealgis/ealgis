from django.contrib.auth.models import User
from .models import *
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueTogetherValidator
from ealgis.ealgis import NoMatches, TooManyMatches, CompilationError

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


class MapDefinitionSerializer(serializers.ModelSerializer):
    # def create(self, data):
    #     # Will only be done if a new object is being created
    #     print("data", data)
    #     print("user", self.request.user)
    #     map = MapDefinition(
    #         name = data["name"],
    #         owner_user_id = data["owner_user_id"],
    #         description = data["description"],
    #         json = data["json"]
    #     )
    #     # self._set(map, map.json)

    #     return map

    class Meta:
        model = MapDefinition
        fields = ('id', 'name', 'description', 'json', 'owner_user_id')
        validators = [
            UniqueTogetherValidator(
                queryset=MapDefinition.objects.all(),
                fields=('name', 'owner_user_id'),
                message='Please choose a map name that you haven\'t used before.'
            )
        ]


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