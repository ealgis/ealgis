#!/bin/bash

# wait for a given host:port to become available
#
# $1 host
# $2 port
function dockerwait {
    while ! exec 6<>/dev/tcp/$1/$2; do
        echo "$(date) - waiting to connect $1 $2"
        sleep 5
    done
    echo "$(date) - connected to $1 $2"

    exec 6>&-
    exec 6<&-
}

dockerwait $DB_HOST $DB_PORT
sleep 3

django-admin migrate

CMD="$1"
echo $CMD
if [ "$CMD" = "runserver" ]; then
    django-admin runserver "0.0.0.0:8000"
fi

exec "$@"

