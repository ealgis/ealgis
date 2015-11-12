#!/bin/bash

wait_for_postgres()
{
    while ! /app/develop.sh psql -l >/dev/null 2>&1; do
        echo "(sleeping 5)"
        sleep 5
    done
    echo "postgresql is up, continuing"
}

echo "** ealgis: spinning up"

keyfile=/data/secret_key
if [ ! -f "$keyfile" ]; then
    echo "new web containiner, generating secret key file"
    python -c "import random,string; print ''.join(random.choice(string.letters + string.digits) for x in range(32))" > "$keyfile"
fi

# install local copy of ealgis
( cd /app/backend && pip install -e . )

command="$1"

if [ x"$command" = x"uwsgi" ]; then
    echo "waiting for postgresql to come up..."
    wait_for_postgres
    echo "syncdb"
    ealgis syncdb
    echo "starting uwsgi"
    rm -f /data/ealgis.sock
    chown ealgis /data
    cd /app &&
        su ealgis -c "uwsgi --ini /app/uwsgi/ealgis.uwsgi"
    while true; do
        echo "** uwsgi has quit: sleep 30 **"
        sleep 30
    done
fi

echo "executing: $*"
exec $*
