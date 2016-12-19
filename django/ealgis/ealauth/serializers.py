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


class ColumnInfoSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ColumnInfo
        fields = ('id', 'name')


class TableInfoSerializer(serializers.HyperlinkedModelSerializer):
    columns = ColumnInfoSerializer(many=True)

    # Use this approach to return the pkey of related columns
    # http://www.django-rest-framework.org/api-guide/relations/#primarykeyrelatedfield
    # columns = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    # Use this approach to return links to the API endpoint of related columns
    # http://stackoverflow.com/a/29910181
    # columns = serializers.HyperlinkedRelatedField(many=True, read_only=True, view_name='columninfo-detail')

    class Meta:
        model = TableInfo
        fields = ('id', 'name', 'columns')