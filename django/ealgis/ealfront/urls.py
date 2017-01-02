from django.conf.urls import url
from .views import ReactHomeView

urlpatterns = [
    url('^$', ReactHomeView.as_view(), name='home'),
]
