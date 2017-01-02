from django.conf.urls import url
from .views import ReactHomeView

urlpatterns = [
    # fancy HTML5 routing, anything that doesn't match an
    # explict endpoint goes into our single page react app
    url('^.*$', ReactHomeView.as_view(), name='home'),
]
