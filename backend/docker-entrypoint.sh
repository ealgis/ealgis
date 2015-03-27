#!/bin/bash

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
    echo "starting uwsgi"
    cd /app && uwsgi --plugins http,python -s :9100 -w ealgis.ealwsgi:app --master -p "8" --lazy
fi

echo "executing: $*"
exec $*
