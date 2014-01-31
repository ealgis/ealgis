#!/usr/bin/env python

# top-level for uwsgi
from db import EAlGIS

eal = EAlGIS()
app = eal.serve()

# load in URL handlers
import handlers

print "handlers loaded:", handlers
