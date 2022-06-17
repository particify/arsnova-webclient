ARG APP_IMAGE
FROM $APP_IMAGE AS build
RUN ls -l /opt/arsnova/web/*

FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-16
ARG VSCODE_USERNAME=node
ARG USERNAME=dev
RUN groupmod -n $USERNAME $VSCODE_USERNAME \
  && usermod -l $USERNAME $VSCODE_USERNAME --move-home --home /home/$USERNAME \
  && sed -i s/$VSCODE_USERNAME/$USERNAME/ /etc/sudoers.d/$VSCODE_USERNAME \
  && mv /etc/sudoers.d/$VSCODE_USERNAME /etc/sudoers.d/$USERNAME

COPY --from=build /opt/arsnova/web/ /app/
