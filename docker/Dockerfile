ARG IMAGE_BASETAG=stable-alpine
FROM nginx:$IMAGE_BASETAG
LABEL maintainer "Daniel Gerhardt <code@dgerhardt.net>"

ARG ARSNOVA_BUILD_DIR

COPY docker/arsnova.nginx.conf /etc/nginx/conf.d/arsnova.conf
COPY "$ARSNOVA_BUILD_DIR" /opt/arsnova/web

RUN rm /etc/nginx/conf.d/default.conf
