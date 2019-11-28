# EAlGIS

![EAlGIS screenshot](https://raw.github.com/ealgis/ealgis/next/doc/screenshots/template-easy-code.png "EAlGIS")

# Build status

[![Build Status](https://travis-ci.org/ealgis/ealgis.svg?branch=next)](https://travis-ci.org/ealgis/ealgis)

# End to end testing

![BrowserStack logo](https://raw.githubusercontent.com/ealgis/ealgis/next/logos/browserstack-logo-600x315.png)

We are in the process of integrating [BrowserStack](https://browserstack.com) tests into our CI pipeline. Thanks
very much to BrowserStack for providing free access for the project.

# Interactive Data Analysis

EAlGIS offers:

-   a web interface to allow quick, interactive analysis of geospatial data, overlaid over a Google baselayer using OpenLayers
    -   add one or more "polygon" layers, which plot a given loaded polygon data source (PostGIS table)
    -   polygons in the layer are filled according to a function, which uses attributes that are linked to the chosen geometry
        functions are simple expressions. to plot the percentage of women in each Australian Census SA1 polygon, you would enter
        the formula "100 \* B2 / B3". this is automatically resolved into a database query which can be called by MapServer
    -   polygons can also be filtered out. For example, if you wish to avoid SA1s which have very few people (and thus may have
        nonsense values when percentages of some attribute are calculated), you might add a filter "b3 > 30" when plotting the
        Australian Census.
    -   download calculated values for further analysis
    -   user access delegated to Mozilla Personas
-   reproducable data loader infrastructure, and pre-supplied loader for the Australian Census 2011.
    -   be sure where the data in your database came from
    -   automated reprojection to map SRIDs (a big performance win)
    -   includes loaders for shapefiles, and for CSV data (which can be linked with shapefiles, for easy interactive analysis)
-   framework for off-line analysis work
    -   perform complex analysis outside of EAlGIS, and then load the results in to visualise them on a map

# Installation

EAlGIS is intended to be run within [Docker](https://docker.com).
For development, you will also need [Yarn](https://yarnpkg.com/) installed.

To get started, fire up the backend:

> docker-compose up

Then, fire up the frontend:

> cd frontend  
> yarn install  
> yarn start

# Django Setup

Add a [Python Social Auth](http://python-social-auth.readthedocs.io/en/latest) backend of your choice. e.g. [Social backends](http://python-social-auth.readthedocs.io/en/latest/backends/index.html#social-backends).

Assuming you're configuring Google as a backend for auth:

Refer to [PySocialAuth Google](http://python-social-auth.readthedocs.io/en/latest/backends/google.html) and [Google - Using OAuth 2.0 to Access Google APIs](https://developers.google.com/identity/protocols/OAuth2?csw=1#Registering).

-   Create a Web application OAuth 2 Client in the Google API's Console
    -   Add `https://localhost:3000` as an **Authorised JavaScript origin**
    -   Add `https://localhost:3000/complete/google-oauth2/` as an **Authorised redirect URI**
    -   Enable the Google+ API
-   Copy `django/web-variables.env.tmpl` to `django/web-varibles.env`
-   Add the resulting Client Id and Secret to `django/web-variables.env`
-   Nuke and restart your Docker containers
-   Navigate to `https://localhost:3000`, choose Google as your signon option, and you should be sent through the Google OAuth flow and end up back at `https://localhost:3000` with your username displayed on the app.

Now you're up and running!

# Becoming An Admin

Making yourself an admin:

Hop into your running `ealgis_web` Docker container:

`docker exec -i -t ealgis_web_1 /bin/bash`

And enter the Django Admin shell:

```
django-admin shell
from django.contrib.auth.models import User
User.objects.all()
user=_[0]
user.is_staff = True
user.is_superuser = True
user.save()
user.profile.is_approved = True
user.profile.save()
```

Now you should be able to navigate to the Django admin backend at `https://localhost:3000/admin/`!

# Choosing a basemap

EALGIS supports a choice of four basemap providers that can be configured via environment variables in `web-variables.env`.

<table>
    <tr>
        <td><strong>Provider</strong></td>
        <td><strong>Basemap Style</strong></td>
    </tr>
    <tr>
        <td><a href="https://www.mapbox.com">Mapbox Light</a><br />Free for personal use.<br />Charges for private or commercial use.</td>
        <td><img src="static/basemap_mapbox_light.jpg" width="448" height="338" /></td>
    </tr>
    <tr>
        <td><a href="https://operations.osmfoundation.org/policies/tiles/">OpenStreetMap</a><br />Free use with some <a href="https://operations.osmfoundation.org/policies/tiles/">limitations</a>.</td>
        <td><img src="static/basemap_osm.jpg" width="448" height="338" /></td>
    </tr>
    <tr>
        <td><a href="http://maps.stamen.com/#toner/">Stamen Maps</a><br />Free and Creative Commons Attribution licensed. </td>
        <td><img src="static/basemap_stamen_toner.jpg" width="448" height="338" /></td>
    </tr>
    <tr>
        <td><a href="https://thunderforest.com">Thunderforest</a><br />Free below 150,000 tiles/month.</td>
        <td><img src="static/basemap_thunderforest_mobile_atlas.jpg" width="448" height="338" /><br /><img src="static/basemap_thunderforest_neighbourhood.jpg" width="448" height="338" /></td>
    </tr>
</table>

# Adding a Custom OAuth2 Provider

EALGIS supports custom OAuth2 providers through [pluggable backends](http://python-social-auth.readthedocs.io/en/latest/backends/implementation.html) in Python Social Auth. To add your own custom OAuth2 provider you'll need to:

1.  Create a `backends.py` file according to the Python Social Auth's [documentation](http://python-social-auth.readthedocs.io/en/latest/backends/implementation.html#oauth2). The class must be called `CustomOAuth2` and must contain an additional class variable called `title` that will be used for the label of its login button. For example:

```python
class CustomOAuth2(BaseOAuth2):
    """Our custom OAuth2 authentication backend"""
    name = 'custom'
    title = 'Our Custom Provider'
```

Ensure the class variable name holds the value 'custom'. Python Social Auth settings variables for authentication providers are based on the provider name. EALGIS will recognise your provider if you name it 'custom'.

2.  Use Docker volumes to inject the file into the `web` container at `/app/ealgis/ealauth/backends.py`

3.  To validate that your provider is available check the output of `https://localhost:3000/api/0.1/config` for

```json
"CUSTOM_OAUTH2" : {"name": "myprovidername", "title": "Our Custom Provider"}
```

# Get some data

However, you won't have any data. You'll need to load one or more datasets into EAlGIS.
You may wish to start with the 2016 Australian Census: https://github.com/ealgis/aus-census-2016

When loading data, you might want to clone the loader module in the `data/uwsgi` directory
of the EAlGIS checkout. The code will then be available in `/data` in your
uwsgi container.

# Code of Conduct

Please see the [Code of Conduct](https://github.com/ealgis/ealgis/blob/next/CODE_OF_CONDUCT.md).

# Development

## Dump and restore Docker images

From time to time you made need to nuke your Docker images and start again in order to free up disk space. This appears to occur due to Docker's handling of its shared disk image - at least on macOS - and its inability to free up disk space when containers are removed.

To work around this we need to save our Docker images (to avoid the need to rebuild them), reset Docker, and then reload and tag our images.

1.  Save all of your Docker images to a `.tar` file:

```
docker save $(docker images -q) -o mydockerimages.tar
```

2.  Save the tags used to describe each image:

```
docker images | sed '1d' | awk '{print $1 " " $2 " " $3}' > mydockerimages.list
```

3.  Nuke your Docker disk image `Docker > Preferences > Reset > Remove all data`

4.  With your freshly reset Docker, reload your images:

```
docker load -i mydockerimages.tar
```

5.  And tag the imported images:

```
while read REPOSITORY TAG IMAGE_ID
do
  echo "== Tagging $REPOSITORY $TAG $IMAGE_ID =="
  docker tag "$IMAGE_ID" "$REPOSITORY:$TAG"
done < mydockerimages.list
```

Steps courtesy of [https://stackoverflow.com/a/37650072](https://stackoverflow.com/a/37650072).

# Data Loaders

EAlGIS data loaders convert data into a compatible database representation, in a repeatable and reproducible manner.

## Overview

Each data loader will output its data in PostgreSQL dump format, in the `dump/` directory within
your EAlGIS repository. You can import those dumps into your datastore with this command:

**Tip:** There's nothing special about the schemas generated by this loader, or how the data is structured, so you can use them anywhere you like.

Four things happen when you run the loader:

1. A (temporary) PostgreSQL + PostGIS database called `ealgis` is created
2. Schemas are created for each grouping of boundaries in this repo (e.g. `au_federal_electorate_boundaries`, `au_wa_state_electorate_boundaries`, et cetera)
3. All of the spatial data files known to `recipe.py` are analysed and imported into their relevant schema
4. A series of PostgreSQL `.dump` files are generated - one for each schema.

At the end of the load process you'll find the PostgreSQL `.dump` files in a new `dump` directory at the root of this repo.

### Loading the data into EALGIS

The `.dump` files created by this loader are intended to completely replace any existing electoral boundary schemas in your EALGIS database. So, if you're re-running the loader to add new boundaries, remember to `DROP SCHEMA schema_name CASCADE;` before running `pg_restore`.

**Tip:** If you have a multiprocessor machine, `pg_restore` comes with an optional [--jobs](https://www.postgresql.org/docs/11/app-pgrestore.html) flag to use multiple concurrent processes/threads to dramatically reduce the time taken to load the data.

#### If you're using a Dockerised EALGIS install

Drop your `.dump` files in the `loaders` directory of your EALGIS install. If necessary, add the `loaders` directory to the `datastore` container in your `docker-compose.yml` file:

#### If you're using RDS or some other flavour of standalone PostgreSQL database

Then just check that the version of `pg_restore` installed locally matches the major version of your PostgreSQL database, work out your connection details, and run `pg_restore` for each of the `.dump` files as above.

**Tip:** See IBM's guide [Install only the necessary tools for a lean, mean PostgreSQL client machine](https://www.ibm.com/cloud/blog/new-builders/postgresql-tips-installing-the-postgresql-client) to find out how to install `pg_restore` on your machine.

Then run:

```
docker exec -it ealgis_datastore_1 sh
pg_restore --host=localhost --username=postgres --dbname=datastore /app/dump/sample.dump
```

```
pg_restore --username=postgres --dbname=postgres /app/dump/filename.dump
```

### As your last steps

1. Run [`VACUUM ANALYZE;`](https://www.postgresql.org/docs/11/sql-vacuum.html) against your EALGIS database
2. Restart your EALGIS `web` container so it picks up the newly refreshed schemas

And you're done!

## Australian Census 2011

If you have not already downloaded the raw census data, it will be downloaded to the `archive/`
directory within your EAlGIS repository.

```
docker-compose -f docker-compose-dataloader.yml run dataloader /bin/bash
cd /app/loaders/aus-census-2011/
./load.sh
```

## Australian Census 2016

If you have not already downloaded the raw census data, it will be downloaded to the `archive/`
directory within your EAlGIS repository.

```
docker-compose -f docker-compose-dataloader.yml run dataloader /bin/bash
cd /app/loaders/aus-census-2011/
./load.sh
```

## Australian Electorate Boundaries

### Overview

This loader generates database schemas for Australian federal, state, and territory electoral boundaries.
When boundaries are updated, they will be added to this repository. Historical boundaries will continue to be available.

To contribute by adding new electoral boundaries to this repo, see the 'Adding new boundaries to the loader' section below.

Raw data for this loader is kept in the [australian-electorates](https://github.com/ealgis/australian-electorates) data
repository. This will be automatically cloned within the `archive/` subdirectory of your EAlGIS repository, if it 
does not already exist.

### Running the loader

Running the loader is as simple as:

```
docker-compose -f docker-compose-dataloader.yml run dataloader /bin/bash
cd /app/loaders/aus-electorates/
./load.sh
```

### Adding new boundaries to the loader

Adding new electoral boundaries to this repo is a two-step process - and PRs are very welcome!

### 1. Get the data

This loader currently supports data in Shapefiles, MID/MIF, and KML (godsforbid).

Once you've found the spatial data from the relevant electoral commission simply:

1. Zip up the data (the data files themselves - not the folder they're in)
2. Give it a sensible filename
3. Create a new directory for it (usually named after the year the boundaries were declared) in the 
   [australian-electorates](https://github.com/ealgis/australian-electorates) data repository.

**Tip:** If the electoral commission supplies any metadata documents (PDFs, DOCX, et cetera) with the boundaries please ensure those get committed alongside the data as well.

**Important:** Be sure to add a `README.md` file containg the URL where you found the boundaries, and any notes about what you did to repackage or change the files from the originals provided by the electoral commission. (As a principle, there should be sufficient detail in your notes to allow someone else to reproduce what you did with no other knowledge.)

#### Adding a new spatial data format

The loader uses GDAL's venerable [ogr2ogr](https://gdal.org/programs/ogr2ogr.html) tool to load spatial data into PostgreSQL - so there's practically no limit on the data formats you could use. Additional formats can be added by creating a new `GeoDataLoader` class in [ealgis-common](https://github.com/ealgis/ealgis/blob/master/django/ealgis/common/loaders.py).

### 2. Add your boundaries to recipe.py

Find the relevant section in `recipe.py` and add a new tuple for your boundaries. For example:

```python
('wa_2011_lc', 'Western Australian Legislative Council 2011', 'WA/2011/waec2011_final_boundaries_lc.zip', load_shapefile, (WGS84,))
```

| Parameter                                     | Description                                                                                                                                                       |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `wa_2011_lc`                                  | The name of the database table that your boundaries will be loaded into.                                                                                          |
| `Western Australian Legislative Council 2011` | This is the human-readable name that EALGIS users will see.                                                                                                       |
| `WA/2011/waec2011_final_boundaries_lc.zip`    | This is the relative path to the ZIP file in this repo containing the spatial data.                                                                               |
| `load_shapefile`                              | This is the name of the loader function for the spatial data format the boundaries are stored in. Supported loaders: `load_shapefile`, `load_mapinfo`, `load_kml` |
| `(WGS84,)`                                    | This tells the loader which coordinate reference system the data was provided in. (This should be in the metadata.)                                               |

##  Generic CSV Loader

Got some data in CSV files you want to load into your EALGIS install? Well you've come to the right place!

To follow this guide you'll need two things:

1. Some spatial data (Covered under `Load the relevant geographic areas` below.)
2. Some CSV formatted data (Covered under `Creating the config file for your data` below.)

**Tip:** We're going to talk a lot about "schemas" in this guide. In a technical sense, these are literally PostgreSQL database schemas. In a practical sense, they're containers for grouping together one or more datasets. e.g. The `ABS Census 2016 - General Community Profile` data probably lives in a schema called `aus_census_2016_gcp`.

At the end of this process you'll have a PostgreSQL `.dump` file containing a schema with your dataset(s) that you can load into your EALGIS install. This file is intended to **completely** replace the existing schema.

Since you'll likely have multiple datasets in one schema we recommend keeping the CSV and JSON files for each schema in a structure like so:

```
config/
    schema_name/
        dataset_a/
            dataset_a.csv
            dataset_a.json
        dataset_b_/
            dataset_b_.csv
            dataset_b_.json
        ...
```

Should you then ever need to create the schema from scratch, it's then just a matter of running `load.sh` against each of the JSON files in turn.

### 0. Prerequisites

-   [Docker Desktop](https://www.docker.com/products/docker-desktop)
-   [Docker Compose](https://docs.docker.com/compose/install/)
-   [PostgreSQL's Command-line tools](https://www.ibm.com/cloud/blog/new-builders/postgresql-tips-installing-the-postgresql-client)
-   [An EALGIS install](https://github.com/ealgis/ealgis/)

### 1. Initialise the database

But before you start any of that you need to initialise the standalone database that this CSV loader will use to temporarily store your data. Simply run:

```
docker-compose up datastore
```

And if all goes well will the log will end with:

```
LOG:  database system is ready to accept connections
```

You can verify this by connecting to the database on `localhost` (username/password: `postgres/postgres`) and looking at the database called `ealgis`. At this stage it should be populated with the default `public` schema, and the three special schemas that come with PostGIS by default:

```
    List of schemas
    Name    |  Owner
------------+----------
 public     | postgres
 tiger      | postgres
 tiger_data | postgres
 topology   | postgres
(4 rows)
```

You can now exit and shutdown the datastore Docker container (`docker-compose stop datastore`).

### 2. Load the relevant geographic areas

Next up you'll need to load in the spatial data that will provide the link between your CSV and seeing your data on a map.

This will be the same data that you've already got loaded in your EALGIS install, but for the purposes of this loader we also need a copy in the loader's database. (For Census data, it's found in schemas like `aus_census_2016_shapes`.)

#### Getting spatial data

If you're working with data using ABS geographic areas or electoral boundaries, then you can simply download the relevant PostgreSQL dump files from our [postgresql_dumps](https://github.com/ealgis/postgresql_dumps) repo.

**Tip:** If you'd like to run the data loaders yourself the postgresql_dumps repo has links to our collection of data loaders.

##### Your own custom data

If you're working with your own custom data, then you'll need to use `pg_dump` to dump out your spatial data schema.

#### Loading spatial data

Wherever you got your data from, drop the `.dump` somewhere in this repo and run:

```
docker-compose -f docker-compose-dataloader.yml run dataloader /bin/bash
```

Once inside the dataloader container you can `pg_restore` your dump file.

#### Restoring the whole schema

It's usually best to restore the whole schema (even if that can take quite a while). For example:

```
pg_restore --host=datastore --username=postgres --dbname=ealgis /app/aus_census_2016_shapes.dump
```

#### Selectively restoring the schema

**Caveat emptor: This process may change with future versions of EALGIS and may break in fun and interesting ways.**

But if you really want to, you can restore only the geometry tables that are relevant to the CSV files that will be in the schema created by this loader.

In this case, let's load data from the `sa2` table:

```
pg_restore --host=datastore --username=postgres --dbname=ealgis --schema-only /app/aus_census_2016_shapes.dump
pg_restore --host=datastore --username=postgres --dbname=ealgis --data-only --table=table_info /app/aus_census_2016_shapes.dump
pg_restore --host=datastore --username=postgres --dbname=ealgis --data-only --table=ealgis_metadata /app/aus_census_2016_shapes.dump
pg_restore --host=datastore --username=postgres --dbname=ealgis --data-only --table=column_info /app/aus_census_2016_shapes.dump
pg_restore --host=datastore --username=postgres --dbname=ealgis --data-only --table=geometry_source /app/aus_census_2016_shapes.dump
pg_restore --host=datastore --username=postgres --dbname=ealgis --data-only --table=geometry_source_projection /app/aus_census_2016_shapes.dump
pg_restore --host=datastore --username=postgres --dbname=ealgis --data-only --table=sa2 /app/aus_census_2016_shapes.dump
```

### 3. Creating the config file for your data

Now we can move on to the main event: Writing the JSON file that describes our data!

Check out the `config/sample/` directory in this repo for an example CSV and JSON file based on the [2017-18 Regional Population Growth](https://www.abs.gov.au/AUSSTATS/abs@.nsf/Lookup/3218.0Main+Features12017-18?OpenDocument) data for NSW from the ABS. All of the documentation and examples from here on are based on this dataset and should be read alongside the sample files provided.

Each CSV dataset that you want to load into a schema will needs its own JSON file.

#### Data

| Attribute     | Description                                                                                                                |          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| type          | Possible values: `csv`                                                                                                     | Required |
| file          | The name of the file containing the data. Relative to the location of your JSON config file.                               | Required |
| db_table_name | The name of the database table that will be created for this dataset. May not contain invalid characters like `.` and `-`. | Required |
| csv           | A JSON object with directives that control how the CSV file will be processed. See `CSV Options` below.                    | Required |

##### CSV Options

**Important:** CSV column names must be unique within each schema. i.e. Two datasets in the same schema can't use the same column name.

**Note:** All CSV column names will be converted to lower case during the ingest process.

| Attribute | Description                                                              |                                                              |
| --------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| dialect   | From [csv.reader](https://docs.python.org/3/library/csv.html#csv.reader) | Optional. Defaults to `excel`.                               |
| encoding  | The character encoding of the CSV file.                                  | Optional. Defaults to `utf-8-sig`.                           |
| skip      | How many lines to skip.                                                  | Required. Set to 0 if not applicable. (This makes no sense.) |

#### Schema

**Note:** If you've already run this CSV loader and created a schema then you only need to provide the `name` attribute.

| Attribute      | Description                                                                |                                                                                        |
| -------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| name           | The name of the schema that the dataset will be loaded into. e.g. `sample` | Required. Must be a valid PostgreSQL schema name.                                      |
| title          | The title of the schema has users will see it. e.g. `2019 Project Data`    | Optional - only needed if the schema doesn't exist.                                    |
| description    | A description for the schema.                                              | Optional - only needed if the schema doesn't exist.                                    |
| date_published | When the schema was published. e.g. `2019-03-27`                           | Optional - only needed if the schema doesn't exist. Must be formatted as `YYYY-MM-DD`. |

![Screenshot of the EALGIS Data Browser - Schema listing](static/databrowser_schema.png)

#### Geometry Linkage

| Attribute    | Description                                                                                                     |                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| shape_schema | The name of the database schema that contains the geometry for this dataset. e.g. `aus_census_2016_shape`       | Required                         |
| shape_table  | The name of the database table that contains the geometry for this dataset. e.g. `sa2`                          | Required                         |
| shape_column | The name of the column in `shape_table` that contains the ids for the geometry in this dataset. e.g. `sa2_main` | Required                         |
| csv_column   | The name of the column in the CSV file that contains the ids for the geometry. e.g. `sa2_main`                  | Required                         |
| match        | The method used for comparing `csv_column` and `shape_column`.                                                  | Required. Possible values: `str` |

#### Metadata

| Attribute       | Description                                                                                                    |          |
| --------------- | -------------------------------------------------------------------------------------------------------------- | -------- |
| collection_name | The name of the collection of datasets this data will be grouped with. e.g. `New South Wales`                  | Required |
| title           | A name of the dataset that users will see in the data browser. e.g. `Regional Population Growth, NSW, 2017-18` | Required |
| description     | A description for this dataset that users will see in the data browser.                                        | Required |
| kind            | The sub-title for this dataset. Usually, the population/thing the data is describing. e.g. `Persons`           | Required |
| family          | A short identifier/acronym/product code for this dataset. e.g. `3218.0`                                        | Required |

![Screenshot of the EALGIS Data Browser - Table list](static/databrowser_table_list.png)

#### Column Metadata

An optional JSON object that provides human-readable titles for the column names in the CSV.

For example:

```json
"column_metadata": {
    "erp_30_june_2017": "ERP at 30 June 2017",
    "erp_30_june_2018": "ERP at 30 June 2018"
}
```

![Screenshot of the EALGIS Data Browser - Data table](static/databrowser_data_table.png)

### 4. Run the data loader

Now that you've described how your data should be processed we can run the loader!

```
docker-compose -f docker-compose-dataloader.yml run dataloader /bin/bash
./load.sh /app/config/sample/config.json
```

The output should look something like this:

```
2019-08-18 10:07:36,403 [INFO   ] [MainThread]  create schema: sample
2019-08-18 10:07:38,443 [INFO   ] [MainThread]  dumping database: /app/dump/sample.dump
2019-08-18 10:07:38,757 [INFO   ] [MainThread]  successfully dumped database to /app/dump/sample.dump
2019-08-18 10:07:38,760 [INFO   ] [MainThread]  load with: pg_restore --username=user --dbname=db /path/to/sample
2019-08-18 10:07:38,763 [INFO   ] [MainThread]  then run VACUUM ANALYZE;
```

### 5. Loading the data into EALGIS

Drop your `.dump` file in the `loaders` directory of your EALGIS install. If necessary, add the `loaders` directory to the `datastore` container in your `docker-compose.yml` file:

```yaml
volumes:
    - ./loaders:/app
```

**Note:** The `.dump` file created by this loader is intended to completely replace the existing schema in your EALGIS install. So remember to `DROP SCHEMA schema_name CASCADE;` before trying to `pg_restore` this schema.

```
docker exec -it ealgis_datastore_1 sh
pg_restore --host=localhost --username=postgres --dbname=datastore /app/sample.dump
```

As your last steps:

1. Run `VACUUM ANALYZE;`
2. Restart your EALGIS `web` container so it picks up the newly refreshed schema

And you're done!
