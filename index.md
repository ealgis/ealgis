![Unemployment % in Perth, Australia](https://raw.github.com/grahame/ealgis/master/doc/screenshots/unemployment.png "Unemployment % in Perth, Australia")

EAlGIS manages geospatial data within a PostGIS database. 'Recipes' specify how geospatial data is loaded (or derived from existing data) and ensure the data in the database is loaded repeatably. Recipes generate metadata, associating attribution information with the geometry it applies to.

A web interface is provided which allows one or more polygon layers to be shown on top of a greyscale Google Maps base layer. The layers are colourised based on a user-defined colour scheme, according to an equation input by the user. This equation can access any attributes available for the layer's geometry.

An example formula might be (for the Australian census) `100 * B2 / B3` which calculates the percentage of women in each polygon within the layer. In the case of the census, these attributes are available at on multiple geometries - from SA1 through to the Australia as a whole. EAlGIS calculates the SQL query needed to perform these calculations, including managing cross-table joins.

The system is quick and interactive. Any data generated can be downloaded in CSV format.

[Mozilla Persona](https://www.mozilla.org/en-US/persona/) is used for user authentication. EAlGIS itself stores no passwords, maintaining only a list of email addresses which are permitted access. The access control system is simple and could be improved by a contributor.

Have a look at [README.md](https://github.com/grahame/ealgis/blob/master/README.md) in the repository to get started setting up EAlGIS.

There are a number of [open issues](https://github.com/grahame/ealgis/issues) which include some features to be added. I would be very happy to help anyone who wanted to knock some of these off.

### Authors and Contributors
EAlGIS has been developed by @grahame. Contributions extremely welcome!

### Support or Contact
Prod me on twitter [@GrahameBowland](http://twitter.com/GrahameBowland) or email me - grahame@oreamnos.com.au
