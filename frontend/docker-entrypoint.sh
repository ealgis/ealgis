#!/bin/sh

command="$1"
if [ x"$command" = x"webpack" ]; then
    export TERM=xterm
    yarn

    webpack --progress --colors --watch
    echo "webpack quit, status $?, sleeping..."
    while /bin/true; do
        sleep 60
    done
    exit
fi

echo "executing: $*"
exec $*

