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

# function geoserverwait {
#     while true
#     do
#         status_code=$(curl --write-out %{http_code} --silent --output /dev/null http://$1:$2)
#         case "$status_code" in
#             200)
#                 break;;
#             *)
#                 echo "$(date) - waiting to connect $1 $2"
#                 sleep 5;;
#         esac
#     done

#     echo "$(date) - connected to $1 $2"

#     exec 6>&-
#     exec 6<&-
# }

dockerwait $GEOSERVER_HOST $GEOSERVER_PORT

CMD="$1"
if [ "$CMD" = "nginx" ]; then
    nginx -g 'daemon off;'
fi

exec "$@"