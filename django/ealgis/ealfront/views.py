from django.views.generic import TemplateView
from ealgis.ealauth.admin import is_development


class ReactHomeView(TemplateView):
    template_name = "index.html"
