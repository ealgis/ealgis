#!/bin/bash

CMD="$1"
PUSH="$2"

if [ x"$CMD" = x ]; then
    echo "provide a command - all, frontend or django!"
    return
fi

if [ "$CMD" = "frontend" ] || [ "$CMD" = "all" ]; then
  \rm -f nginx-prod/build/*.tgz
  mkdir -p nginx-prod/build/

  # build the frontend assets (this takes quite a while due to minification)
  (cd frontend && yarn install && yarn build && cd build && tar czvf ../../build/frontend.tgz .)

  # build the django assets
  docker-compose -f docker-compose-buildpy.yml build
  docker-compose -f docker-compose-buildpy.yml run web
  docker-compose -f docker-compose-buildpy.yml stop

  # build production nginx image
  cp build/frontend.tgz build/django.tgz nginx-prod/build # this is horrible, fixme

  echo building prod nginx container
  (cd nginx-prod && docker build -t ealgis/nginx:latest .)
fi

if [ "$CMD" = "django" ] || [ "$CMD" = "all" ]; then
  echo building prod uwsgi container
  (cd django && docker build -t ealgis/uwsgi:latest .)

  # remove build artefact
  if [ -f django/ealgis/ealfront/templates/index.html ]; then
    rm django/ealgis/ealfront/templates/index.html
  fi
fi

if [ "$PUSH" = "push" ]; then
    ./prodbuild-dockerpush.sh "$CMD"
fi