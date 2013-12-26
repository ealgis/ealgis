
EAlGIS
======

Interactive Data Analysis
-------------------------

EAlGIS offers:

 * a web interface to allow quick, interactive analysis of geospatial data, overlaid over a Google baselayer using OpenLayers
     - add one or more "polygon" layers, which plot a given loaded polygon data source (PostGIS table)
     - polygons in the layer are filled according to a function, which uses attributes that are linked to the chosen geometry
       functions are simple expressions. to plot the percentage of women in each Australian Census SA1 polygon, you would enter 
       the formula "100 * B2 / B3". this is automatically resolved into a database query which can be called by MapServer
     - polygons can also be filtered out. For example, if you wish to avoid SA1s which have very few people (and thus may have 
       nonsense values when percentages of some attribute are calculated), you might add a filter "b3 > 30" when plotting the 
       Australian Census.
     - download calculated values for further analysis
     - user access delegated to Mozilla Personas
 * reproducable data loader infrastructure, and pre-supplied loader for the Australian Census 2011.
     - be sure where the data in your database came from
     - automated reprojection to map SRIDs (a big performance win)
     - includes loaders for shapefiles, and for CSV data (which can be linked with shapefiles, for easy interactive analysis)
 * framework for off-line analysis work
     - perform complex analysis outside of EAlGIS, and then load the results in to visualise them on a map

Installation
------------

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
You may wish to start with the 2011 Australian Census: http://github.com/grahame/ealgis-aus-census-2011

When loading data, you might want to clone the loader module in the `modules` directory 
of the EAlGIS checkout. The code will then be available in `/vagrant/modules` in your 
vagrant VM.

