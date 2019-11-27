#!/bin/bash

function defaults {
    : ${DBSERVER:="datastore"}
    : ${DBPORT:="5432"}
    : ${DBNAME="ealgis"}
    : ${DBUSER="postgres"}
    : ${DBPASS="${DBUSER}"}

    export DBSERVER DBPORT DBNAME DBUSER DBPASS DOCKER_HOST
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

python recipe.py $*
