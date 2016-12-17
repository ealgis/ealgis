#!/bin/sh

command="$1"
if [ x"$command" = x"gulp" ]; then
    npm install .
    gulp
    sleep 50000
    exit
fi

echo "executing: $*"
exec $*

