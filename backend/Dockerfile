#

# don't use the python container, as a bunch of our deps are a pain
# in the neck to compile, so we're better off using debian's system
# python
FROM debian:jessie
MAINTAINER Grahame Bowland <grahame@angrygoats.net>

# this is a bit of a kitchen sink. we use this container to
# run ealgis 'recipes'; at some point we should break the recipe
# container out
#
# postgis is only needed for the shp2pgsql binary
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      python-dev git python-pip uwsgi python-psycopg2 \
      python-mapscript python-cairo liblzma-dev libxml2-dev \
      python-gdal gdal-bin \
      postgis \
      libxslt-dev pkg-config p7zip gdal-bin \
      postgresql-client-9.4 libpq-dev \
      uwsgi-plugin-python \
      less git && \
  apt-get autoremove -y --purge && \
  apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app

RUN pip install \
    simplejson markdown Geoalchemy flask flask-sqlalchemy ipython \
    openpyxl==1.8.6 flake8 nose sqlalchemy-citext lxml \
    pyparsing rauth  \
    'git+https://github.com/garbados/flask-browserid.git' \
    backports.lzma && \
  rm -rf /root/.cache/pip/

RUN adduser --system --uid 1000 --shell /bin/bash ealgis

EXPOSE 9000 9001

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

VOLUME ["/app", "/data", "/recipes"]

# entrypoint shell script that by default starts runserver
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["uwsgi"]
