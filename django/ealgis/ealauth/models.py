from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User

# Create your models here.
class DataTableInfo(models.Model):
    "metadata for each table that has been loaded into the system"
    name = models.CharField(max_length=256, unique=True)
    # @TODO Geom linkages

    class Meta:
        verbose_name = "DataTable"
        verbose_name_plural = "DataTables"


class ColumnInfo(models.Model):
    "metadata for columns in the tables"
    name = models.CharField(max_length=256, unique=True)
    datatableinfo_id = models.ForeignKey(DataTableInfo, on_delete=models.CASCADE)
    metadata_json = JSONField(max_length=2048, null=True)

    class Meta:
        unique_together = ('name', 'datatableinfo_id')
        verbose_name = "ColumnInfo"
        verbose_name_plural = "ColumnInfos"


class MapDefinition(models.Model):
    "map definition - all state for a EAlGIS map"
    name = models.CharField(max_length=32)
    owner_user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    json = JSONField(null=True)

    class Meta:
        unique_together = ('name', 'owner_user_id')