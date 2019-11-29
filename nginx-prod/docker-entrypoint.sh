#!/bin/sh

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

if [ "$HTTPS_ENABLED" = "FALSE" ]; then
  if [ "$ENVIRONMENT" = "PRODUCTION" ]; then
    nginxconf="/etc/nginx/docker.http.prod.conf"
  else
    nginxconf="/etc/nginx/docker.http.conf"
  fi
else
    nginxconf="/etc/nginx/docker.https.conf"
fi
envsubst '\$HTTPS_ENABLED \$SERVER_NAME $DJANGO_LOCATION' < $nginxconf > /etc/nginx/conf.d/docker.conf

CMD="$1"
if [ "$CMD" = "nginx" ]; then
    nginx -g 'daemon off;'
fi

exec "$@"
