from django.contrib import admin
from .models import MapDefinition, Profile

# Register your models here.
admin.register(MapDefinition)(admin.ModelAdmin)
admin.register(Profile)(admin.ModelAdmin)
