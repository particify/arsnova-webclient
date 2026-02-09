FROM nginx:stable-alpine@sha256:15e96e59aa3b0aada3a121296e3bce117721f42d88f5f64217ef4b18f458c6ab
LABEL maintainer "Daniel Gerhardt <code@dgerhardt.net>"

ARG ARSNOVA_BUILD_DIR

COPY docker/arsnova.nginx.conf /etc/nginx/conf.d/arsnova.conf
COPY "$ARSNOVA_BUILD_DIR" /opt/arsnova/web
COPY docker/docker-entrypoint.d/* /docker-entrypoint.d/

RUN rm /etc/nginx/conf.d/default.conf
