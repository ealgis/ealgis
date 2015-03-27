#!/usr/bin/env python

# top-level for uwsgi
from db import EAlGIS

eal = EAlGIS()
app = eal.serve().wsgi_app

# load in URL handlers
import handlers  # noqa
