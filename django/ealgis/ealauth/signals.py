from django.contrib.auth.models import User
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

from ealgis.ealauth.models import MapDefinition
from ealgis.ealauth.geoserver import GeoServerMap
from ealgis.ealgis import NoMatches, TooManyMatches, CompilationError

@receiver(pre_save, sender=MapDefinition)
def pre_save_map(sender, instance, raw, using, update_fields, **kwargs):
    print("signals: pre_save_map")

    try:
        instance.set(instance.json)
    except ValueError as e:
        raise ValidationError(detail="Unknown value error ({})".format(e.message))
    except CompilationError as e:
        raise ValidationError(detail="Expression compilation failed ({})".format(e.message))
    except NoMatches as e:
        raise ValidationError(detail="Attribute could not be resolved ({})".format(e.message))
    except TooManyMatches as e:
        raise ValidationError(detail="Attribube reference is ambiguous ({})".format(e.message))


@receiver(post_save, sender=MapDefinition)
def save_map(sender, instance, created, **kwargs):
    gsmap = GeoServerMap(instance.name, instance.owner_user_id, instance.json["rev"], instance.json)

    if created is True:
        # Create new layers in GeoServer    
        gsmap.create_layers()
    else:
        # Recreate all layers in GeoServer
        gsmap.recreate_layers()

@receiver(post_delete, sender=MapDefinition)
def delete_map(sender, instance, **kwargs):
    # Remove all layers from GeoServer
    gsmap = GeoServerMap(instance.name, instance.owner_user_id, instance.json["rev"], instance.json)
    gsmap.remove_layers()