from django.contrib.auth.models import User
from .models import (
    MapDefinition, Profile)
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueTogetherValidator
from urllib.parse import quote_plus
from ealgis.util import make_logger


logger = make_logger(__name__)


class NoMatches(Exception):
    pass


class TooManyMatches(Exception):
    pass


class CompilationError(Exception):
    pass


class ValueError(Exception):
    pass


class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Profile
        fields = (
            'is_approved',
            'recent_tables',
            'favourite_tables')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    is_approved = serializers.BooleanField(source='profile.is_approved')
    recent_tables = serializers.JSONField(source='profile.recent_tables')
    favourite_tables = serializers.JSONField(source='profile.favourite_tables')

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
            'groups',
            'is_approved',
            'recent_tables',
            'favourite_tables')


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
        if "name" in data:
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
            raise
            raise ValidationError(
                detail={"filterExpression": "Compilation error ({})".format(e)})

    def to_representation(self, obj):
        map = super(serializers.ModelSerializer, self).to_representation(obj)

        # Add a URL-safe map name for client-side to use to make semi-human-readable URLs
        map["name-url-safe"] = quote_plus(map["name"].replace(" ", "-"))

        if "layers" not in map["json"]:
            map["json"]["layers"] = []

        # October 2018 - Introducing "type_of_data" attribute (continuous or discrete). Assume continuous for pre-existing layers.
        for layer in map["json"]["layers"]:
            if "type_of_data" not in layer:
                layer["type_of_data"] = "continuous"
        return map


class TableInfoWithColumnsSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    metadata_json = serializers.JSONField()
    columns = serializers.JSONField()


class TableInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    metadata_json = serializers.JSONField()


class DataInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    metadata_json = serializers.JSONField()


class ColumnInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    table_info_id = serializers.IntegerField()
    metadata_json = serializers.JSONField()


class GeometryLinkageSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    geometry_source_schema_name = serializers.CharField()
    geometry_source_id = serializers.IntegerField()
    attr_table_id = serializers.IntegerField()
    attr_column = serializers.CharField()


class EALGISMetadataSerializer(serializers.Serializer):
    name = serializers.CharField()
    family = serializers.CharField()
    uuid = serializers.CharField()
    description = serializers.CharField()
    date_created = serializers.DateTimeField()
    date_published = serializers.DateTimeField()
