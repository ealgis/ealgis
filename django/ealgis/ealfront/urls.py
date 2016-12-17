from django.conf.urls import url
from .views import ReactHomeView

urlpatterns = [
    url('^eal/$', ReactHomeView.as_view(), name='home'),
]
