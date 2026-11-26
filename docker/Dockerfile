# Alpine's nginx-mod-http-brotli targets Alpine's nginx, not the nginx.org
# binary of this image, so the module is built from nginx's pkg-oss against
# the image's exact nginx version, as docker-nginx's modules/Dockerfile.alpine
# does.
FROM nginx:stable-alpine@sha256:8eb04fe3b385090e9aa02961f77398ad09b6bf33ab07f6669a5bb7acce22c0d3 AS brotli-module

SHELL ["/bin/ash", "-exo", "pipefail", "-c"]

RUN apk add abuild coreutils curl g++ gcc git libxml2-utils libxslt linux-headers \
      make musl-dev openssl openssl-dev pcre2-dev unzip xz zlib-dev \
    # allow abuild as a root user
    && printf "#!/bin/sh\\nSETFATTR=true /usr/bin/abuild -F \"\$@\"\\n" > /usr/local/bin/abuild \
    && chmod +x /usr/local/bin/abuild \
    && git clone -b ${NGINX_VERSION}-${PKG_RELEASE} https://github.com/nginx/pkg-oss/ /pkg-oss \
    && cd /pkg-oss/alpine \
    && make abuild-module-brotli BASE_VERSION=$NGINX_VERSION NGINX_VERSION=$NGINX_VERSION \
    && apk add $(. ./abuild-module-brotli/APKBUILD; echo $makedepends;) \
    && make module-brotli BASE_VERSION=$NGINX_VERSION NGINX_VERSION=$NGINX_VERSION \
    && mkdir /tmp/packages \
    && find ~/packages -type f -name "nginx-module-brotli-${NGINX_VERSION}*.apk" -exec mv -v {} /tmp/packages/ \;

FROM nginx:stable-alpine@sha256:8eb04fe3b385090e9aa02961f77398ad09b6bf33ab07f6669a5bb7acce22c0d3 AS precompressed-assets

ARG ARSNOVA_BUILD_DIR

# GNU gzip, so the flags do not depend on BusyBox's build options
RUN apk add --no-cache brotli gzip

COPY "$ARSNOVA_BUILD_DIR" /opt/arsnova/web

RUN find /opt/arsnova/web -type f \( \
      -name '*.css' -o \
      -name '*.html' -o \
      -name '*.ico' -o \
      -name '*.js' -o \
      -name '*.json' -o \
      -name '*.svg' -o \
      -name '*.ttf' -o \
      -name '*.txt' -o \
      -name '*.webmanifest' \
    \) -exec brotli -k -q 11 {} + -exec gzip -k -9 {} +

FROM nginx:stable-alpine@sha256:8eb04fe3b385090e9aa02961f77398ad09b6bf33ab07f6669a5bb7acce22c0d3
LABEL maintainer "Daniel Gerhardt <code@dgerhardt.net>"

RUN --mount=type=bind,target=/tmp/packages/,source=/tmp/packages/,from=brotli-module \
    apk add --no-cache --allow-untrusted /tmp/packages/nginx-module-brotli-${NGINX_VERSION}*.apk \
    && sed -i '1i load_module modules/ngx_http_brotli_static_module.so;' /etc/nginx/nginx.conf

COPY docker/arsnova.nginx.conf /etc/nginx/conf.d/arsnova.conf
COPY --from=precompressed-assets /opt/arsnova/web /opt/arsnova/web
COPY docker/docker-entrypoint.d/* /docker-entrypoint.d/

RUN rm /etc/nginx/conf.d/default.conf
