#!/bin/bash

# push images to Docker Hub
# @TODO version images

echo pushing prod nginx container
# docker tag ealgis/nginx ealgis/nginx:`someversion`
docker push ealgis/nginx

echo pushing prod uwsgi container
# docker tag ealgis/uwsgi ealgis/uwsgi:`someversion`
docker push ealgis/uwsgi

