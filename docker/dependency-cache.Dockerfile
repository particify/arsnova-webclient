ARG BASE_TAG
FROM docker.io/particifydev/chromebrowser-nodejs:$BASE_TAG

ARG YARN_GLOBAL_FOLDER

COPY $YARN_GLOBAL_FOLDER /root/.yarn/berry
