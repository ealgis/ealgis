#!/bin/bash

DB=ealgis

cmd_dropdb()
{
    dropdb ealgis
}

cmd_mkdb()
{
    createdb "$DB" && 
    ( 
        (echo 'CREATE EXTENSION postgis;' | psql "$DB") && 
        (echo 'CREATE EXTENSION postgis_topology;' | psql "$DB")
    ) && 
    echo "$db created" &&
    ealgis syncdb
}

cmd_install()
{
    ( cd backend && sudo pip install -e . )
    if [ ! -d /etc/ealgis ]; then
        sudo mkdir /etc/ealgis
        sudo chown root.vagrant /etc/ealgis
        sudo chmod 750 /etc/ealgis
        python -c "import random,string; print ''.join(random.choice(string.letters + string.digits) for x in range(32))" | sudo /bin/bash -c 'cat > /etc/ealgis/secret_key'
    fi
}

case "$1" in
vagrant_vmware)
    vagrant plugin install vagrant-vmware-fusion
    vagrant plugin license vagrant-vmware-fusion "$2"
    vagrant up --provider vmware_fusion
    ;;
mkdb)
    cmd_mkdb
    ;;
dropdb)
    cmd_dropdb
    ;;
lint)
    flake8 --exclude 'svn,CVS,.bzr,.hg,.git,__pycache__,2011 Datapacks BCP_IP_TSP_PEP_ECP_WPP_ERP_Release 3' .
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
*)
    echo "unknown command \`$1'"
    ;;
esac

