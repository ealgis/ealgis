from django.views.generic import TemplateView
from ealgis.ealauth.admin import is_development


class ReactHomeView(TemplateView):
    template_name = "index.dev.html" if is_development() is True else "index.prod.html"
