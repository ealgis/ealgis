
EAlGIS: geographic data analysis system using Python and Postgres.
===================================

EAlGIS is intended to be run within Vagrant. To get started:

    # make a new VM, provision using puppet. may take a while
    vagrant up
    # or, if using vagrant vmware
    ./develop.sh vagrant_vmware /path/to/license.lic

    # log into the vm
    vagrant ssh
    cd /vagrant
    # create a database
    ./develop.sh mkdb
    # make a secret key for auth
    ./develop.sh install

Add a user:

    ealgis adduser "Grahame Bowland <grahame@angrygoats.net>"

Then to launch EAlGIS:

    ./develop.sh start

On your host, browse to:

    http://localhost:8080

... and you should be up and running.

However, you won't have any data. You'll need to load one or more datasets into EAlGIS.
You may wish to start with the 2011 Australian Census:

    http://github.com/grahame/ealgis-aus-census-2011
