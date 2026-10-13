ARG APP_IMAGE
FROM $APP_IMAGE AS build
RUN ls -l /opt/arsnova/web/*

FROM registry.gitlab.com/particify/dev/foss/devcontainers/typescript-node:4-24-trixie

COPY --from=build /opt/arsnova/web/ /app/

# The shared libraries Playwright's Chromium needs come with the image: installing them needs
# root, and the container filesystem would lose them on every recreate. The browser itself is
# installed at container start (scripts/install-test-browser) into a volume on /opt/playwright.
ENV PLAYWRIGHT_BROWSERS_PATH=/opt/playwright
ENV CHROME_BIN=/opt/playwright/chrome-headless-shell
RUN npx --yes playwright install-deps chromium \
  && rm -rf /var/lib/apt/lists/* /root/.npm/_npx \
  && install -d -o dev -g dev /opt/playwright
