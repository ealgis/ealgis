from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

from ealgis.ealauth.models import MapDefinition
from ealgis.ealgis import NoMatches, TooManyMatches, CompilationError


@receiver(pre_save, sender=MapDefinition)
def pre_save_map(sender, instance, raw, using, update_fields, **kwargs):
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

# Layers can be shared amongst maps - so we'll leave this stub here for 
# later use if we want to write layer cleaning up code.
# @receiver(post_delete, sender=MapDefinition)
# def delete_map(sender, instance, **kwargs):
#     # Remove all layers from GeoServer
#     gsmap = GeoServerMap(instance.name, instance.owner_user_id, instance.json["rev"], instance.json)
#     gsmap.remove_layers()