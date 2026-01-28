FROM nginx:stable-alpine@sha256:e35873a161d0a08cc31e55f160301ad1676eec6d0072d4feccf78b3e7469d3ae
LABEL maintainer "Daniel Gerhardt <code@dgerhardt.net>"

ARG ARSNOVA_BUILD_DIR

COPY docker/arsnova.nginx.conf /etc/nginx/conf.d/arsnova.conf
COPY "$ARSNOVA_BUILD_DIR" /opt/arsnova/web
COPY docker/docker-entrypoint.d/* /docker-entrypoint.d/

RUN rm /etc/nginx/conf.d/default.conf
