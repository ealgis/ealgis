from django.contrib.auth.models import User
from .models import *
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from ealgis.ealgis import NoMatches, TooManyMatches, CompilationError

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
        self._set(map, map.json)
        return map

    def update(self, instance, data):
        # Will only be done if an existing object is being updated
        self._set(instance, data["json"])
        return instance
    
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


class ColumnInfoSerializer(serializers.Serializer):
    name = serializers.CharField()


class TableInfoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    metadata_json = serializers.JSONField()
    columns = serializers.JSONField()