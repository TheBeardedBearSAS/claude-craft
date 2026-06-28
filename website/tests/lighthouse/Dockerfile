# Lighthouse harness — reproducible scoring env (CLAUDE.md: always use Docker)
FROM node:24-bookworm-slim

# Chromium + fonts for headless Lighthouse runs
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium fonts-liberation fonts-dejavu-core ca-certificates git curl \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_PATH=/usr/bin/chromium
# Lighthouse pinned for deterministic scoring
RUN npm install -g lighthouse@12.2.1 http-server@14.1.1

WORKDIR /site
ENTRYPOINT ["bash", "/site/tests/lighthouse/run.sh"]
