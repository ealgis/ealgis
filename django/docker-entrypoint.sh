#!/bin/bash

function postgres_ready(){
python << END
import sys
import psycopg2
try:
    conn = psycopg2.connect(dbname="$DB_NAME", user="$DB_USERNAME", password="$DB_PASSWORD", host="$DB_HOST")
    conn2 = psycopg2.connect(dbname="$DATASTORE_NAME", user="$DATASTORE_USERNAME", password="$DATASTORE_PASSWORD", host="$DATASTORE_HOST")
except psycopg2.OperationalError:
    sys.exit(-1)
sys.exit(0)
END
}

waitfordb()
{
  until postgres_ready; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done

  >&2 echo "Postgres is up - continuing..."

  sleep 8
}



CMD="$1"
echo $CMD
if [ "$CMD" = "runserver" ]; then
   waitfordb
   django-admin migrate
   django-admin runserver "0.0.0.0:8000"
   exit
fi

if [ "$CMD" = "build" ]; then
   waitfordb
   export ENVIRONMENT=PRODUCTION
   rm -rf /build/static
   django-admin collectstatic --noinput
   cd /build/static && tar czvf /build/django.tgz . && rm -rf /build/static
   exit
fi

if [ "$CMD" = "uwsgi" ]; then
   waitfordb
   export ENVIRONMENT=PRODUCTION
   django-admin migrate
   django-admin collectstatic --noinput
   chown 1000:1000 /var/log/django.log
   uwsgi --lazy-apps --uid 1000 --gid 1000 --http-socket :9090 --wsgi ealgis.wsgi --master --processes 8 --threads 8
   exit
fi

exec "$@"

