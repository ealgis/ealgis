#!/bin/bash

DB=ealgis
DOCKER_IMAGE="angrygoat/ealgis"

: ${DOCKER_BUILD_OPTIONS:="--pull=true"}
: ${DOCKER_COMPOSE_BUILD_OPTIONS:="--pull"}

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

dockerbuild() {
    gittag=`git describe --abbrev=0 --tags 2> /dev/null`
    gitbranch=`git rev-parse --abbrev-ref HEAD 2> /dev/null`

    # only use tags when on master (release) branch
    if [ $gitbranch != "master" ]; then
        echo "Ignoring tags, not on master branch"
        gittag=$gitbranch
    fi

    # if no git tag, then use branch name
    if [ -z ${gittag+x} ]; then
        echo "No git tag set, using branch name"
        gittag=$gitbranch
    fi

    for tag in "${DOCKER_IMAGE}:${gittag}"; do
        echo "############################################################# ${DOCKER_IMAGE} ${tag}"
        set -x
        cd backend &&
            docker build ${DOCKER_BUILD_OPTIONS} -t ${tag} -f Dockerfile . &&
            docker push ${tag}
        set +x
    done
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
dockerbuild)
    dockerbuild
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

