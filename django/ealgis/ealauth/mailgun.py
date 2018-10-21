import requests
from ..util import get_env
from .admin import get_ealgis_admins
from raven.contrib.django.raven_compat.models import client


def send_mail(to, subject, html):
    try:
        r = requests.post(
            "https://api.mailgun.net/v3/{}/messages".format(get_env("MAILGUN_DOMAIN")),
            auth=("api", get_env("MAILGUN_API_KEY")),
            data={"from": get_env("MAILGUN_FROM"),
                  "to": [to],
                  "subject": subject,
                  "html": html})

        if r.status_code != 200:
            raise Exception("Got a {code} error from Mailgun: {text}".format(code=r.status_code, text=r.text))
    except Exception:
        client.captureException()


def send_new_user_welcome_mail(user):
    html = """
    Hi,<br />
    <br />
    Welcome to Ealgis!<br />
    <br />
    You've just created your account on the {ealgis_site_name} Ealgis site. Welcome to the Ealgis community!<br />
    <br />
    We're continually working to improve Ealgis - so if you have any questions, suggestions, or new ideas for Ealgis please get in touch with us at <a href="mailto:{ealgis_site_contact_mail}">{ealgis_site_contact_mail}</a>.<br />
    <br />
    Your account detail are -<br />
    <br />
    Username: {username}<br />
    Email: {email}<br />
    <br />
    Regards,<br />
    <br />
    The Ealgis Team
    """.format(ealgis_site_name=get_env("EALGIS_SITE_NAME"), ealgis_site_contact_mail=get_env("EALGIS_SITE_CONTACT_EMAIL"), username=user.username, email=user.email)

    send_mail(user.email, "Welcome to Ealgis", html)


def send_new_user_signed_up_admin_mail(user):
    admins = get_ealgis_admins()

    if len(admins) > 0:
        html = """
        Hi Ealgis Admins,<br />
        <br />
        Just letting you know that a new user has signed up to the <em>{ealgis_site_name}</em> Ealgis instance.<br />
        <br />
        Username: {username}<br />
        Email: {email}<br />
        <br />
        Regards,<br />
        <br />
        Your friendly Ealgis bot
        """.format(ealgis_site_name=get_env("EALGIS_SITE_NAME"), admin_url="{base_url}/admin/ealauth/profile/{id}/change/".format(base_url=get_env("EALGIS_BASE_URL"), id=user.id), username=user.username, email=user.email)

        to = [u.email for u in admins]

        send_mail(to, "INFO: A new Ealgis user has signed up", html)


def send_new_user_welcome_awaiting_approval_mail(user):
    html = """
    Hi,<br />
    <br />
    Welcome to Ealgis!<br />
    <br />
    The {ealgis_site_name} Ealgis site is private and only open to access by pre-approved users.
    The Ealgis administrators have been notified and will review your application (this usually doesn't take more than 24 hours).<br />
    <br />
    If you have any questions, please get in touch with us at <a href="mailto:{ealgis_site_contact_mail}">{ealgis_site_contact_mail}</a>.<br />
    <br />
    Regards,<br />
    <br />
    The Ealgis Team
    """.format(ealgis_site_name=get_env("EALGIS_SITE_NAME"), ealgis_site_contact_mail=get_env("EALGIS_SITE_CONTACT_EMAIL"))

    send_mail(user.email, "Welcome to Ealgis", html)


def send_new_user_admin_awaiting_approval_mail(user):
    admins = get_ealgis_admins()

    if len(admins) > 0:
        html = """
        Hi Ealgis Admins,<br />
        <br />
        We have a new user awaiting approval on the <em>{ealgis_site_name}</em> Ealgis instance.<br />
        <br />
        Username: {username}<br />
        Email: {email}<br />
        <br />
        Click here to approve this user: <a href="{admin_url}">{admin_url}</a><br />
        <br />
        Regards,<br />
        <br />
        Your friendly Ealgis bot
        """.format(ealgis_site_name=get_env("EALGIS_SITE_NAME"), admin_url="{base_url}/admin/ealauth/profile/{id}/change/".format(base_url=get_env("EALGIS_BASE_URL"), id=user.id), username=user.username, email=user.email)

        to = [u.email for u in admins]

        send_mail(to, "ACTION: A new Ealgis user is awaiting approval", html)


def send_new_user_approved_mail(user):
    html = """
    Hi {first_name},<br />
    <br />
    Your {ealgis_site_name} Ealgis account has been approved.<br />
    <br />
    You can now start creating maps and exploring all of the data that Ealgis puts at your fingertips at <a href="{ealgis_site_url}">{ealgis_site_url}</a>.<br />
    <br />
    We're continually working to improve Ealgis - so if you have any questions, suggestions, or new ideas for Ealgis please get in touch with us at <a href="mailto:{ealgis_site_contact_mail}">{ealgis_site_contact_mail}</a>.<br />
    <br />
    Regards,<br />
    <br />
    The Ealgis Team
    """.format(first_name=user.first_name, ealgis_site_name=get_env("EALGIS_SITE_NAME"), ealgis_site_url=get_env("EALGIS_BASE_URL"), ealgis_site_contact_mail=get_env("EALGIS_SITE_CONTACT_EMAIL"))

    send_mail(user.email, "Welcome to Ealgis", html)
