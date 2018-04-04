FROM node:8.10.0-wheezy

RUN mkdir /npm /frontend
WORKDIR /frontend

EXPOSE 35729

RUN yarn global add webpack@4.4.1 webpack-cli@2.0.13

ADD docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]