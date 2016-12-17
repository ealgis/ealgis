FROM node:7.2-wheezy

RUN mkdir /npm /frontend
WORKDIR /frontend

RUN npm install -g gulp-cli
ADD docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
