#!/bin/bash

# push images to Docker Hub

if [ ! -f ./django/VERSION ]; then
    echo "File not found!"
    return
fi

VERSION=`cat ./django/VERSION`
CMD="$1"

if [ x"$VERSION" = x ]; then
    echo "set a version!"
    return
fi

if [ x"$CMD" = x ]; then
    echo "provide a command - all, frontend or django!"
    return
fi

if [ "$CMD" = "frontend" ] || [ "$CMD" = "all" ]; then
        echo pushing prod nginx container
        docker tag ealgis/nginx:latest ealgis/nginx:"$VERSION"
        docker push ealgis/nginx:latest
        docker push ealgis/nginx:"$VERSION"
fi

if [ "$CMD" = "django" ] || [ "$CMD" = "all" ]; then
        echo pushing prod uwsgi container
        docker tag ealgis/uwsgi:latest ealgis/uwsgi:"$VERSION"
        docker push ealgis/uwsgi:latest
        docker push ealgis/uwsgi:"$VERSION"
fi