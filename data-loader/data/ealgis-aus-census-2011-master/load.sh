#!/bin/bash

function defaults {
    : ${DBSERVER:="db"}
    : ${DBPORT:="5432"}
    : ${DBUSER="postgres"}
    : ${DBNAME="${DBUSER}"}
    : ${DBPASS="${DBUSER}"}

    export DBSERVER DBPORT DBUSER DBNAME DBPASS DOCKER_HOST
}

function postgreswait {
    if hash psql 2>/dev/null; then
        while ! echo "select 1;" | PGPASSWORD="$DBPASS" psql -h "$DBSERVER" -p "$DBPORT" -U "$DBUSER" "$DBNAME" >/dev/null; do
            echo "Waiting for PostgreSQL to be ready for queries."
            sleep 5
        done
    else
        echo "[WARN] No psql installed, cannot use it to verify postgresql is up"
    fi
}

defaults
postgreswait

# echo "downloading the 2011 Australian Census"

# cd /app/data/ealgis-aus-census-2011-master

# if [ ! -d "2011 Datapacks BCP_IP_TSP_PEP_ECP_WPP_ERP_Release 3" ]; then
#     if [ ! -f '2011 Datapacks BCP_IP_TSP_PEP_ECP_WPP_ERP_Release 3.7z' ]; then
#         wget -O datapacks.tmp https://dl.dropboxusercontent.com/u/10671102/census/2011%20Datapacks%20BCP_IP_TSP_PEP_ECP_WPP_ERP_Release%203.7z &&
#             mv datapacks.tmp '2011 Datapacks BCP_IP_TSP_PEP_ECP_WPP_ERP_Release 3.7z'
#     fi
#     7zr x '2011 Datapacks BCP_IP_TSP_PEP_ECP_WPP_ERP_Release 3.7z'
# fi

echo "loading the 2011 Australian Census"

python /app/ealgis-loader/aus_census_2011.py