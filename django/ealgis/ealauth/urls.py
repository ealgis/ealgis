from django.conf.urls import url
from .views import LandingView

urlpatterns = [
    url('', LandingView.as_view(), name='landing'),
]
