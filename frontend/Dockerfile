FROM node:8.1.2-wheezy

RUN mkdir /npm /frontend
WORKDIR /frontend

EXPOSE 35729

RUN npm install -g webpack
ADD docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
