#!/bin/bash

function defaults {
    : ${DBSERVER:="db"}
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

CENSUSBASE="2016 Datapacks"
CENSUSDIR="/data/$CENSUSBASE"
CENSUSZIP="/app/archive/Digital Boundaries.zip"

mkdir -p "/app/archive/" "/app/dump/"

if [ ! -d "$CENSUSDIR" ]; then
    echo "Download the Australian Census 2016"

    if [ ! -f "$CENSUSZIP" ]; then
	cd "/app/archive/" && 
        wget -c -t 1 'https://www.dropbox.com/s/rwzwea1om64g0wk/2016_ATSIP_ALL_for_AUS_short-header.zip' &&
        wget -c -t 1 'https://www.dropbox.com/s/yhija2zkbf358ml/2016_GCP_ALL_for_AUS_short-header.zip' &&
        wget -c -t 1 'https://www.dropbox.com/s/0tq7jftbc3aeksq/2016_PEP_ALL_for_AUS_short-header.zip' &&
        wget -c -t 1 'https://www.dropbox.com/s/nt0iprg6kmk1xgl/2016_TSP_ALL_for_AUS_short-header.zip' &&
        wget -c -t 1 'https://www.dropbox.com/s/52tlsr7k20lm5vy/2016_WPP_ALL_for_AUS_short-header.zip' &&
        wget -c -t 1 'https://www.dropbox.com/s/7tahcw8vko9h3x3/Digital%20Boundaries.zip'
    fi

    echo "Extracting the Australian Census 2016"
    (
        rm -rf /data/tmp &&
        cd /data &&
        mkdir tmp &&
        cd /data/tmp &&
        unzip '/app/archive/Digital Boundaries.zip' &&
        for i in ATSIP GCP PEP TSP WPP; do
            (mkdir "$i" && cd "$i" && unzip /app/archive/*_${i}_*.zip)
        done &&
        cd /data &&
        mv 'tmp' '2016 Datapacks'
    )

fi

echo "loading the 2016 Australian Census"

python /app/loaders/aus-census-2016/recipe.py
