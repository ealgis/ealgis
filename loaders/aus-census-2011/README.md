# EAlGIS - Australian Census 2011

(To find out what EAlGIS is, see https://github.com/ealgis/ealgis/)

## Importing the census

Run:

    docker-compose run dataloader /bin/bash
    ./load.sh

If you have not already downloaded the census, it will be downloaded and
extracted.

Once that has run successfully, consult the output and run `pg_restore` on ./tmp/aus_census_2011 into your actual EAlGIS database. Don't forget to run `VACUUM ANALYZE;` too.

```
pg_restore --username=postgres --dbname=postgres /app/aus_census_2011
```
