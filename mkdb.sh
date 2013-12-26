#!/bin/bash

createdb "$1" && 
( 
if [ -f /usr/share/postgresql/9.1/contrib/postgis-1.5/postgis.sql ]; then 
    psql -q "$1" -f /usr/share/postgresql/9.1/contrib/postgis-1.5/postgis.sql &&
    psql -q "$1" -f /usr/share/postgresql/9.1/contrib/postgis-1.5/spatial_ref_sys.sql
else
    (echo 'CREATE EXTENSION postgis;' | psql "$1") && 
    (echo 'CREATE EXTENSION postgis_topology;' | psql "$1")
fi
)
echo "$1 created"

