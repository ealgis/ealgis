from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User

# Create your models here.
class TableInfo(models.Model):
    "metadata for each table that has been loaded into the system"
    name = models.CharField(max_length=256, unique=True)


class ColumnInfo(models.Model):
    "metadata for columns in the tables"
    name = models.CharField(max_length=256, unique=True)
    tableinfo_id = models.ForeignKey(TableInfo, related_name='columns', on_delete=models.CASCADE)
    metadata_json = JSONField(max_length=2048, null=True)

    class Meta:
        unique_together = ('name', 'tableinfo_id')


class GeometrySource(models.Model):
    "table describing sources of geometry information: the table, and the column"
    tableinfo_id = models.ForeignKey(TableInfo, on_delete=models.CASCADE)
    geometry_type = models.CharField(max_length=256)
    column = models.CharField(max_length=256)
    srid = models.IntegerField()
    gid = models.CharField(max_length=256)

    def __str__(self):
        return "GeometrySource<%s.%s>" % (self.table_info.name, self.column)
    
    def srid_column(self, srid):
        if self.srid == srid:
            return self.column
        proj = [t for t in self.reprojections.all() if t.srid == srid]
        if len(proj) == 1:
            return proj[0].column
        else:
            return None


class GeometrySourceProjected(models.Model):
    "details of an additional column (on the same table as the source) with the source reprojected to this srid"
    geometry_source_id = models.ForeignKey(GeometrySource, on_delete=models.CASCADE)
    srid = models.IntegerField()
    column = models.CharField(max_length=256)

    class Meta:
        verbose_name = "Geometry source projection"
        verbose_name_plural = "Geometry source projections"


class GeometryLinkage(models.Model):
    "details of links to tie attribute data to columns in a geometry table"
    # the geometry table, and the column which links a row in our attribute table with
    # a row in the geometry table
    geo_source_id = models.ForeignKey(GeometrySource, on_delete=models.CASCADE)
    geo_column = models.CharField(max_length=256)
    # the attribute table, and the column which links a row in our geomtry table with
    # a row in the attribute table
    attr_table_info_id = models.ForeignKey(TableInfo, on_delete=models.CASCADE)
    attr_column = models.CharField(max_length=256)


class MapDefinition(models.Model):
    "map definition - all state for a EAlGIS map"
    name = models.CharField(max_length=32)
    owner_user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    json = JSONField(null=True)

    class Meta:
        unique_together = ('name', 'owner_user_id')