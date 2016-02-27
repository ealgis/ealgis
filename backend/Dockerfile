FROM angrygoat/ealgis:next
MAINTAINER Grahame Bowland <grahame@angrygoats.net>

USER root

WORKDIR /app
COPY . /app/backend

WORKDIR /app/backend

RUN rm -rf ealgis.egg-info/
RUN pip uninstall -y ealgis || exit 0
RUN cat setup.py
RUN pip install --upgrade -e .
RUN cat /usr/local/bin/ealgis

EXPOSE 9000 9001
VOLUME ["/app", "/data", "/recipes", "/scratch"]

ENV HOME /data

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["uwsgi"]
