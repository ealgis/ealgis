from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from ealgis.ealauth.models import Profile
from django.apps import apps


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if apps.get_app_config('ealauth').private_site == "0":
            is_approved = True
        else:
            is_approved = False

        Profile.objects.create(user=instance, is_approved=is_approved)

    elif not hasattr(instance, "profile"):
        # Migrating existing users
        Profile.objects.create(user=instance, is_approved=True)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
