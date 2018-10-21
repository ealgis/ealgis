from django.dispatch import receiver
from django.db.models.signals import post_save, pre_save
from django.contrib.auth.models import User
from .models import Profile
from .admin import is_private_site
from .mailgun import send_new_user_welcome_mail, send_new_user_signed_up_admin_mail, send_new_user_welcome_awaiting_approval_mail, send_new_user_admin_awaiting_approval_mail, send_new_user_approved_mail


@receiver(pre_save, sender=Profile)
def approve_user(sender, instance, **kwargs):
    if is_private_site():
        if instance.tracker.has_changed("is_approved") and instance.is_approved is True:
            send_new_user_approved_mail(instance.user)


@receiver(post_save, sender=User)
def create_user(sender, instance, created, **kwargs):
    if created:
        if is_private_site() is False:
            is_approved = True
            send_new_user_welcome_mail(instance)
            send_new_user_signed_up_admin_mail(instance)
        else:
            is_approved = False
            send_new_user_welcome_awaiting_approval_mail(instance)
            send_new_user_admin_awaiting_approval_mail(instance)

        Profile.objects.create(user=instance, is_approved=is_approved)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
