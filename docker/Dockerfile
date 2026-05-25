FROM nginx:stable-alpine@sha256:5f979dcfed4ce6461873f087e8c980d6e29b084b9e8776d9704a7e989b5f4898
LABEL maintainer "Daniel Gerhardt <code@dgerhardt.net>"

ARG ARSNOVA_BUILD_DIR

COPY docker/arsnova.nginx.conf /etc/nginx/conf.d/arsnova.conf
COPY "$ARSNOVA_BUILD_DIR" /opt/arsnova/web
COPY docker/docker-entrypoint.d/* /docker-entrypoint.d/

RUN rm /etc/nginx/conf.d/default.conf
