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

if [ x"$command" = x"build" ]; then
    export TERM=xterm
    yarn

    rm -rf /frontend/dist
    mkdir /frontend/dist
    webpack --progress --colors --config webpack.prod.js
    cd /frontend/dist && tar czvf /build/frontend.tgz .
    exit
fi

echo "executing: $*"
exec $*

