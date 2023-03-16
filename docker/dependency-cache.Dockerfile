ARG BASE_TAG
FROM particifydev/chromebrowser-nodejs:$BASE_TAG

ARG YARN_GLOBAL_FOLDER

COPY $YARN_GLOBAL_FOLDER /root/.yarn/berry
