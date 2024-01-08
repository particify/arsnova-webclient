ARG APP_IMAGE
FROM $APP_IMAGE AS build
RUN ls -l /opt/arsnova/web/*

FROM registry.gitlab.com/particify/dev/foss/devcontainers/typescript-node:1-20-bookworm

COPY --from=build /opt/arsnova/web/ /app/
