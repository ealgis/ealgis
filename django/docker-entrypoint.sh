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

until postgres_ready; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - continuing..."

sleep 8

django-admin migrate

CMD="$1"
echo $CMD
if [ "$CMD" = "runserver" ]; then
    django-admin runserver "0.0.0.0:8000"
fi

exec "$@"

