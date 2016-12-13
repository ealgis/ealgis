FROM python:3.5

ENV PYTHONUNBUFFERED 1
ENV VIRTUAL_ENV /env
ENV PYTHON_PIP_VERSION 9.0.1
ENV DJANGO_SETTINGS_MODULE ealgis.settings

RUN pyvenv "$VIRTUAL_ENV" && \
    "$VIRTUAL_ENV"/bin/pip install -U pip==$PYTHON_PIP_VERSION

ENV PATH "$VIRTUAL_ENV"/bin:$PATH

RUN mkdir /app

WORKDIR /app

ADD requirements.txt /app/
RUN pip install -r requirements.txt
ADD . /app/
RUN pip install -e .

ENTRYPOINT ["/app/docker-entrypoint.sh"]
