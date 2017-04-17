from django.contrib import admin
from .models import MapDefinition

# Register your models here.
admin.register(MapDefinition)(admin.ModelAdmin)
