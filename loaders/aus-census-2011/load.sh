#!/bin/bash

function defaults {
    : ${DBSERVER:="datastore"}
    : ${DBPORT:="5432"}
    : ${DBUSER="postgres"}
    : ${DBNAME="${DBUSER}"}
    : ${DBPASS="${DBUSER}"}

    export DBSERVER DBPORT DBUSER DBNAME DBPASS DOCKER_HOST
}

function postgreswait {
    if hash psql 2>/dev/null; then
        while ! echo "select 1;" | PGPASSWORD="$DBPASS" psql -h "$DBSERVER" -p "$DBPORT" -U "$DBUSER" "$DBNAME" >/dev/null; do
            echo "Waiting for PostgreSQL to be ready for queries."
            sleep 5
        done
    else
        echo "[WARN] No psql installed, cannot use it to verify postgresql is up"
    fi
}

defaults
postgreswait

CENSUSBASE="2011 Datapacks BCP_IP_TSP_PEP_ECP_WPP_ERP_Release 3"
CENSUSDIR="/data/$CENSUSBASE"
CENSUS7Z="/app/archive/$CENSUSBASE.7z"

mkdir -p "/app/archive/" "/app/dump/"

echo "$CENSUSDIR"

if [ ! -d "$CENSUSDIR" ]; then

    if [ ! -f "$CENSUS7Z" ]; then
        echo "Downloading the Australian Census 2011..."
        wget -c -t 1 -O "$CENSUS7Z" 'https://www.dropbox.com/s/yo6rnms4lwgc8zj/2011%20Datapacks%20BCP_IP_TSP_PEP_ECP_WPP_ERP_Release%203.7z?dl=1'
    fi

    echo "Extracting the Australian Census 2011..."
    cd /data && 7zr x "$CENSUS7Z"
fi

echo "loading the 2011 Australian Census"

python /app/loaders/aus-census-2011/recipe.py
