from django.contrib import admin
from .models import *

# Register your models here.
admin.register(TableInfo, ColumnInfo, GeometrySource, GeometrySourceProjected, GeometryLinkage, MapDefinition)(admin.ModelAdmin)