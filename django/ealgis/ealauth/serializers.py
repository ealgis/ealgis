import json
from django.contrib.auth.models import User
from .models import (
    MapDefinition)
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueTogetherValidator
from ealgis.colour_scale import make_colour_scale
from ealgis.ealgis import ValueError, NoMatches, TooManyMatches, CompilationError
from urllib.parse import quote_plus


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'url',
            'username',
            'first_name',
            'last_name',
            'email',
            'is_staff',
            'is_active',
            'date_joined',
            'groups')


class UserPublicDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'first_name',
            'last_name')


class MapDefinitionSerializer(serializers.ModelSerializer):
    owner = UserPublicDetailsSerializer(source='owner_user_id', read_only=True)

    class Meta:
        model = MapDefinition
        fields = ('id', 'name', 'description', 'json',
                  'shared', 'owner_user_id', 'owner')
        validators = [
            UniqueTogetherValidator(
                queryset=MapDefinition.objects.all(),
                fields=('name', 'owner_user_id'),
                message='Please choose a map name that you haven\'t used before.'
            )
        ]

    def update(self, instance, data):
        # FIXME Do this properly
        instance.name = data["name"]
        if "description" in data:
            instance.description = data["description"]
        if "shared" in data:
            instance.shared = data["shared"]

        self._set(instance, data["json"])

        instance.save()
        return instance

    def _set(self, map, json):
        try:
            map.set(json)
        except ValueError as e:
            raise ValidationError(
                detail={"valueExpression": "Unknown value error ({})".format(e.message)})
        except CompilationError as e:
            raise ValidationError(
                detail={"valueExpression": "Expression compilation failed ({})".format(e.message)})
        except NoMatches as e:
            raise ValidationError(
                detail={"valueExpression": "Attribute could not be resolved ({})".format(e)})
        except TooManyMatches as e:
            raise ValidationError(detail={
                                  "valueExpression": "Attribube reference is ambiguous ({})".format(e.message)})
        except Exception as e:
            raise ValidationError(
                detail={"filterExpression": "Compilation error ({})".format(e)})

    def to_representation(self, obj):
        map = super(serializers.ModelSerializer, self).to_representation(obj)

        # Add a URL-safe map name for client-side to use to make semi-human-readable URLs
        map["name-url-safe"] = quote_plus(map["name"].replace(" ", "-"))

        # FIXME Compile all this client-side
        # Compile layer fill styles and attach an olStyleDef for consumption by the UI
        if "layers" not in map["json"]:
            map["json"]["layers"] = []

        for layerId, layer in enumerate(map["json"]["layers"]):
            # Internal fields for handling draft vs published layers.
            # Only expose the published 'master' layer until the draft layer is actually promoted to published.
            if "master" in layer:
                layer = map["json"]["layers"][layerId] = layer["master"]

            olStyleDef = self.createOLStyleDef(layer)
            if olStyleDef is not False:
                layer["olStyleDef"] = olStyleDef
        return map

    def createOLStyleDef(self, layer):
        fill = layer['fill']
        do_fill = (fill['expression'] != '')

        # Line styles are simple and can already be read from the existing JSON object
        if do_fill:
            scale_min = float(fill['scale_min'])
            scale_max = float(fill['scale_max'])
            opacity = float(fill['opacity'])
            return make_colour_scale(layer, 'q', float(scale_min), float(scale_max), opacity)
        return False


class JSONMetadataField(serializers.Field):
    """
    JSON metadata objects are serialized into a JSON string,
    and from a string to a JSON object.
    """

    def to_representation(self, metadata_json):
        json_metadata = json.loads(metadata_json)
        json_metadata["type"] = json_metadata["type"].replace("_", " ")
        return json_metadata

    def to_internal_value(self, metadata_json):
        return json.dumps(metadata_json)


class TableInfoWithColumnsSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    metadata_json = JSONMetadataField()
    columns = serializers.JSONField()


class TableInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    metadata_json = JSONMetadataField()


class DataInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    metadata_json = JSONMetadataField()


class ColumnInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    tableinfo_id = serializers.IntegerField()
    metadata_json = JSONMetadataField()


class GeometryLinkageSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    geo_source_id = serializers.IntegerField()
    geo_column = serializers.CharField()
    attr_table_info_id = serializers.IntegerField()
    attr_column = serializers.CharField()
