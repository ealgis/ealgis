from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User

# Create your models here.
class MapDefinition(models.Model):
    "map definition - all state for a EAlGIS map"
    name = models.CharField(max_length=32)
    owner_user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    json = JSONField(null=True)

    class Meta:
        unique_together = ('name', 'owner_user_id')