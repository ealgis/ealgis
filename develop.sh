#!/bin/bash

DB=ealgis

cmd_psql()
{
    PAGER=less PGPASSWORD="$DB_ENV_POSTGRES_PASSWORD" exec psql -h "$DB_PORT_5432_TCP_ADDR" -U "$DB_ENV_POSTGRES_USER" -p "$DB_PORT_5432_TCP_PORT" $*
}

jslint()
{
    docker run --rm -v $PWD:/app muccg/jslint:latest /app/backend/static/ealgis.js
}

pylint()
{
    docker run --rm -v $PWD:/app muccg/pylint:latest /app/backend/
}

case "$1" in
jslint)
    jslint
    ;;
pylint)
    pylint
    ;;
lint)
    jslint
    pylint
    ;;
psql)
    shift
    cmd_psql $*
    ;;
lint)
    flake8 --ignore E501 --exclude 'svn,CVS,.bzr,.hg,.git,__pycache__,2011 Datapacks BCP_IP_TSP_PEP_ECP_WPP_ERP_Release 3' --count .
    ;;
tests)
    nosetests ealgis
    ;;
install)
    cmd_install
    ;;
start)
    if [[ x"$2" != x ]]; then
        P="$2"
    else
        P=4
    fi
    uwsgi --plugins http,python -s 127.0.0.1:8888 -w ealgis.ealwsgi:app --master -p "$P" --lazy
    ;;
socketstart)
    if [[ x"$2" != x ]]; then
        P="$2"
    else
        P=4
    fi
    uwsgi --plugins http,python -s ealgis.sock -w ealgis.ealwsgi:app --umask 0000 --master -p "$P" --lazy
    ;;
*)
    echo "unknown command \`$1'"
    ;;
esac

