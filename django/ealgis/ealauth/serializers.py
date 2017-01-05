from django.contrib.auth.models import User
from .models import *
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'groups')


class MapDefinitionSerializer(serializers.HyperlinkedModelSerializer):
    def create(self, data):
        # Will only be done if a new object is being created
        map = MapDefinition(
            name = data["name"],
            owner_user_id = data["owner_user_id"],
            description = data["description"],
            json = data["json"]
        )
        map.set(map.json)
        map.save()
        return map

    def update(self, instance, data):
        # Will only be done if a new object is being created
        instance.set(data["json"])
        instance.save()
        return instance

    class Meta:
        model = MapDefinition
        fields = ('id', 'name', 'description', 'json', 'owner_user_id')


class ColumnInfoSerializer(serializers.Serializer):
    name = serializers.CharField()


class TableInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    metadata_json = serializers.JSONField()
    columns = serializers.JSONField()