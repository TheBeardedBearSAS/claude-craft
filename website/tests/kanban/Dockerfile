# Kanban browser harness — reproducible env (CLAUDE.md: always use Docker)
FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium fonts-liberation fonts-dejavu-core ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_PATH=/usr/bin/chromium \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    HOME=/work/home \
    NPM_CONFIG_CACHE=/npm-cache

# /work: throw-away copy of the repo (host mount stays read-only, no root-owned files).
# /npm-cache: world-writable so a named volume works with `--user <uid>`.
RUN mkdir -p /work /npm-cache /out && chmod 777 /work /npm-cache /out
WORKDIR /work
ENTRYPOINT ["bash", "/src/website/tests/kanban/run.sh"]
