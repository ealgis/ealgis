#
FROM nginx:latest
MAINTAINER Grahame Bowland <grahame@angrygoats.net>

RUN rm -rf /etc/nginx
COPY nginx /etc/nginx

EXPOSE 80 443

VOLUME ['/app']

CMD ["nginx", "-g", "daemon off;"]
