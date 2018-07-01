#!/bin/bash

# push images to Docker Hub
# @TODO version images

ver="$1"

if [ x"$ver" = x ]; then
        echo "set a version!"
        exit 1
fi

echo pushing prod nginx container
docker tag ealgis/nginx:latest ealgis/nginx:"$ver"
docker push ealgis/nginx:latest
docker push ealgis/nginx:"$ver"

echo pushing prod uwsgi container
docker tag ealgis/uwsgi:latest ealgis/uwsgi:"$ver"
docker push ealgis/uwsgi:latest
docker push ealgis/uwsgi:"$ver"

