from django.contrib import admin
from django.contrib.auth.models import User
from django.apps import apps
from django.db import connection
from .models import MapDefinition, Profile
from ..util import get_env

# Register your models here.
admin.register(MapDefinition)(admin.ModelAdmin)
admin.register(Profile)(admin.ModelAdmin)


def get_ealgis_admins():
    if "auth_users" in connection.introspection.table_names():
        return User.objects.filter(is_staff=True, is_superuser=True, is_active=True).all()
    else:
        return []


def is_private_site():
    return apps.get_app_config("ealauth").private_site == "1"


def is_development():
    return get_env("ENVIRONMENT") == "DEVELOPMENT"
