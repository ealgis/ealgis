#!/bin/sh

command="$1"
if [ x"$command" = x"webpack" ]; then
    export TERM=xterm
    npm install .

    # Build material-ui-autocomplete-google-places again if we only have src
    # Temporary workaround until we can merge our changes upstream
    # if [ ! -d "/frontend/node_modules/material-ui-autocomplete-google-places/lib" ]; then
    #     cd /frontend/node_modules/material-ui-autocomplete-google-places
    #     npm install --only=dev .
    #     npm run build
    #     cd /frontend
    # fi
    # End material-ui-autocomplete-google-places build

    webpack --progress --colors --watch
    echo "webpack quit, status $?, sleeping..."
    while /bin/true; do
        sleep 60
    done
    exit
fi

echo "executing: $*"
exec $*

