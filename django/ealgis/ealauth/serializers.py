from django.contrib.auth.models import User
from .models import *
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'groups')


class MapDefinitionSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MapDefinition
        fields = ('name', 'description', 'json', 'owner_user_id')


class ColumnInfoSerializer(serializers.Serializer):
    name = serializers.CharField()


class TableInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    metadata_json = serializers.JSONField()
    columns = serializers.JSONField()