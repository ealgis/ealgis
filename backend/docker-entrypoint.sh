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
    cd /app &&
        su ealgis -c "uwsgi --plugins http,python -s /data/ealgis.sock -w ealgis.ealwsgi:app --umask 0000 -w ealgis.ealwsgi:app --master -p 8 --lazy"
fi

echo "executing: $*"
exec $*
