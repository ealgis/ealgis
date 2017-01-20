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
    def create(self, data):
        # Will only be done if a new object is being created
        map = MapDefinition(
            name = data["name"],
            owner_user_id = data["owner_user_id"],
            description = data["description"],
            json = data["json"]
        )
        self._set(map, map.json)

        # Create new layers in GeoServer
        gsmap = GeoServerMap(map.name, map.owner_user_id, map.json["rev"], map.json)
        gsmap.create_layers()

        return map

    def update(self, map, data):
        # Will only be done if an existing object is being updated
        self._set(map, data["json"])

        # Recreate all layers in GeoServer
        gsmap = GeoServerMap(map.name, map.owner_user_id, data.json["rev"], data.json)
        gsmap.recreate_layers()

        return map
    
    def _set(self, map, json):
        try:
            map.set(json)
            map.save()
        except ValueError as e:
            raise ValidationError(detail="Unknown value error ({})".format(e.message))
        except CompilationError as e:
            raise ValidationError(detail="Expression compilation failed ({})".format(e.message))
        except NoMatches as e:
            raise ValidationError(detail="Attribute could not be resolved ({})".format(e.message))
        except TooManyMatches as e:
            raise ValidationError(detail="Attribube reference is ambiguous ({})".format(e.message))

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