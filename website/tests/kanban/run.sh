#!/usr/bin/env bash
# Kanban browser harness (runs INSIDE the container; use `make`-less wrapper below).
#
# From the repo root:
#   bash website/tests/kanban/run.sh            # build image + run specs
#   bash website/tests/kanban/run.sh a11y.spec.ts   # extra args go to `playwright test`
#
# The repo is mounted read-only at /src and copied to /work, so node_modules/dist/reports
# never touch the host tree (host root node_modules is root-owned). Report -> website/tests/kanban/report/,
# test outputs (traces, screenshots) -> website/tests/kanban/results/ (both git-ignored).
# KANBAN_SCREENSHOTS=1 also captures every view for a visual check (screenshots.spec.ts).
# Browser: the Chromium that Playwright ships, as in CI (downloaded once into the npm cache volume).
# KANBAN_BROWSER=system uses the distribution Chromium of the image instead (older: it has hidden a
# history-handling defect that CI caught).
set -euo pipefail

if [ ! -d /src/website ]; then
  # ---- host side: build the image and re-run this script in the container ----
  ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
  HARNESS="$ROOT/website/tests/kanban"
  IMAGE=cc-kanban-e2e
  docker build -q -t "$IMAGE" "$HARNESS" >/dev/null
  rm -rf "$HARNESS/results"
  mkdir -p "$HARNESS/report" "$HARNESS/results"
  exec docker run --rm --user "$(id -u):$(id -g)" \
    -e KANBAN_SCREENSHOTS="${KANBAN_SCREENSHOTS:-0}" \
    -e KANBAN_BROWSER="${KANBAN_BROWSER:-playwright}" \
    -v "$ROOT":/src:ro \
    -v "$HARNESS/report":/out \
    -v "$HARNESS/results":/out-results \
    -v cc-kanban-npm-cache:/npm-cache \
    "$IMAGE" "$@"
fi

# ---- container side ----
# Generated/unreadable website content (root-owned locale dirs) is not needed by the harness.
mkdir -p /work/repo
tar -C /src --ignore-failed-read --exclude=.git --exclude=node_modules --exclude=.test-tmp --exclude=.stryker-tmp --exclude=coverage --exclude=dist --exclude=audit --exclude=docs \
    --exclude='website/[a-z][a-z]' --exclude=website/.vitepress --exclude=website/test-results \
    --exclude=website/public --exclude=website/tests/kanban/report --exclude=website/tests/kanban/results -cf - . \
  | tar -C /work/repo -xf -
cd /work/repo
mkdir -p "$HOME"

npm ci --no-audit --no-fund
npm run kanban:build
( cd website && npm ci --no-audit --no-fund )

if [ "${KANBAN_BROWSER:-playwright}" != "system" ]; then
  unset CHROME_PATH
  export PLAYWRIGHT_BROWSERS_PATH=/npm-cache/ms-playwright
  ( cd website && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0 npx playwright install chromium )
fi

# Largest JS chunk (informational budget)
find cli/kanban/client/dist/assets -name '*.js' -printf '%s %p\n' | sort -rn | head -1

rc=0
( cd website && npx playwright test --config tests/kanban/playwright.config.ts "$@" ) || rc=$?

cp -r website/tests/kanban/report/. /out/ 2>/dev/null || true
cp -r website/tests/kanban/results/. /out-results/ 2>/dev/null || true
exit "$rc"
