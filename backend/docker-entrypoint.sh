#!/bin/bash


function defaults {
    : ${DBSERVER:="db"}
    : ${DBPORT:="5432"}
    : ${DBUSER="ealgis"}
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

echo "** ealgis: spinning up"

keyfile=/data/secret_key
if [ ! -f "$keyfile" ]; then
    echo "new web containiner, generating secret key file"
    python -c "import random,string; print ''.join(random.choice(string.letters + string.digits) for x in range(32))" > "$keyfile"
fi

defaults
postgreswait

command="$1"
if [ x"$command" = x"uwsgi" ]; then
    echo "syncdb"
    ealgis syncdb
    echo "starting uwsgi"
    rm -f /data/ealgis.sock
    cd /app &&
        uwsgi --ini /app/uwsgi/ealgis.uwsgi
    while true; do
        echo "** uwsgi has quit: sleep 30 **"
        sleep 30
    done
fi

echo "executing: $*"
exec $*
