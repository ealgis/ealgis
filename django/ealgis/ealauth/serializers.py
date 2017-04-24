import json
from django.contrib.auth.models import User
from .models import (
    MapDefinition)
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueTogetherValidator
from ealgis.colour_scale import make_colour_scale
from ealgis.ealgis import ValueError, NoMatches, TooManyMatches, CompilationError


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

    def update(self, instance, data):
        self._set(instance, data["json"])
        instance.save()
        return instance

    def _set(self, map, json):
        try:
            map.set(json)
        except ValueError as e:
            raise ValidationError(detail="Unknown value error ({})".format(e.message))
        except CompilationError as e:
            raise ValidationError(detail="Expression compilation failed ({})".format(e.message))
        except NoMatches as e:
            raise ValidationError(detail="Attribute could not be resolved ({})".format(e))
        except TooManyMatches as e:
            raise ValidationError(detail="Attribube reference is ambiguous ({})".format(e.message))

    def to_representation(self, obj):
        map = super(serializers.ModelSerializer, self).to_representation(obj)

        # FIXME Compile all this client-side
        # Compile layer fill styles and attach an olStyleDef for consumption by the UI
        if "layers" not in map["json"]:
            map["json"]["layers"] = []

        for l in map["json"]["layers"]:
            fill = l['fill']
            do_fill = (fill['expression'] != '')

            # Line styles are simple and can already be read from the existing JSON object
            if do_fill:
                scale_min = float(fill['scale_min'])
                scale_max = float(fill['scale_max'])
                opacity = float(fill['opacity'])
                l["olStyleDef"] = make_colour_scale(l, 'q', float(scale_min), float(scale_max), opacity)
        return map


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
    