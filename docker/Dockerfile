FROM nginx:stable-alpine@sha256:6a0f9e30dfafae85467e60bc66d48076df1c0825ec3f9b518a2a9d3d9264ea26
LABEL maintainer "Daniel Gerhardt <code@dgerhardt.net>"

ARG ARSNOVA_BUILD_DIR

COPY docker/arsnova.nginx.conf /etc/nginx/conf.d/arsnova.conf
COPY "$ARSNOVA_BUILD_DIR" /opt/arsnova/web
COPY docker/docker-entrypoint.d/* /docker-entrypoint.d/

RUN rm /etc/nginx/conf.d/default.conf
