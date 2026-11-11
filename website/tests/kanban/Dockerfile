# Kanban browser harness — reproducible env (CLAUDE.md: always use Docker)
#
# Same recipe as the CI job `kanban-e2e`: Node 24 + `playwright install --with-deps` of the three
# engines Playwright ships (Chromium, Firefox, WebKit) at the exact version of website/package-lock.json
# (run.sh passes it as PLAYWRIGHT_VERSION, so the image, the lockfile and CI cannot drift apart).
# The official mcr.microsoft.com/playwright image would save this layer but ships Node 26, not the
# Node 24 the CLI server runs on in CI.
FROM node:24-bookworm-slim

ARG PLAYWRIGHT_VERSION
RUN test -n "$PLAYWRIGHT_VERSION" \
    && apt-get update \
    && apt-get install -y --no-install-recommends fonts-liberation fonts-dejavu-core ca-certificates \
    && PLAYWRIGHT_BROWSERS_PATH=/ms-playwright npx -y "playwright@${PLAYWRIGHT_VERSION}" install --with-deps chromium firefox webkit \
    && chmod -R a+rX /ms-playwright \
    && rm -rf /var/lib/apt/lists/* /root/.npm

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    HOME=/work/home \
    NPM_CONFIG_CACHE=/npm-cache

# /work: throw-away copy of the repo (host mount stays read-only, no root-owned files).
# /npm-cache: world-writable so a named volume works with `--user <uid>`.
RUN mkdir -p /work /npm-cache /out && chmod 777 /work /npm-cache /out
WORKDIR /work
ENTRYPOINT ["bash", "/src/website/tests/kanban/run.sh"]
