#!/bin/bash

echo "** ealgis: spinning up"

keyfile=/data/secret_key
if [ ! -f "$keyfile" ]; then
    echo "new web containiner, generating secret key file"
    python -c "import random,string; print ''.join(random.choice(string.letters + string.digits) for x in range(32))" > "$keyfile"
fi

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
