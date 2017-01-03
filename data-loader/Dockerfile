# don't use the python container, as a bunch of our deps are a pain
# in the neck to compile, so we're better off using debian's system
# python
FROM debian:jessie
MAINTAINER Keith Moss <keithamoss@gmail.com>

# httpredir sucks
RUN sed -i s/httpredir.debian.org/mirror.aarnet.edu.au/ /etc/apt/sources.list

# this is a bit of a kitchen sink. we use this container to
# run ealgis 'recipes'; at some point we should break the recipe
# container out
#
# postgis is only needed for the shp2pgsql binary
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      python-dev git python-pip uwsgi uwsgi-plugin-python python-psycopg2 \
      python-mapscript python-cairo liblzma-dev libxml2-dev \
      python-gdal gdal-bin postgis libxslt-dev pkg-config p7zip gdal-bin \
      libpq-dev \
      wget less git zip && \
  apt-get autoremove -y --purge && \
  apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# this is required to get PostgreSQL 9.6 client tools into the container on Jessie
# https://wiki.postgresql.org/wiki/Apt
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ jessie-pgdg main" > /etc/apt/sources.list.d/pgdg.list
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN apt-get update && apt-get install -y postgresql-client-9.6

WORKDIR /app

RUN pip install -U "pip<8"

COPY requirements.txt requirements.txt 
RUN pip install -r requirements.txt && \
  rm -rf /root/.cache/pip/