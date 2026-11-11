#!/usr/bin/env bash
# Kanban browser harness (runs INSIDE the container; use `make`-less wrapper below).
#
# From the repo root:
#   bash website/tests/kanban/run.sh            # build image + run specs
#   UPDATE_KNOWN=1 bash website/tests/kanban/run.sh   # regenerate known-violations.json
#
# The repo is mounted read-only at /src and copied to /work, so node_modules/dist/reports
# never touch the host tree (host root node_modules is root-owned). Report -> website/tests/kanban/report/.
set -euo pipefail

if [ ! -d /src/website ]; then
  # ---- host side: build the image and re-run this script in the container ----
  ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
  HARNESS="$ROOT/website/tests/kanban"
  IMAGE=cc-kanban-e2e
  docker build -q -t "$IMAGE" "$HARNESS" >/dev/null
  mkdir -p "$HARNESS/report"
  exec docker run --rm --user "$(id -u):$(id -g)" \
    -e UPDATE_KNOWN="${UPDATE_KNOWN:-0}" \
    -v "$ROOT":/src:ro \
    -v "$HARNESS/report":/out \
    -v "$HARNESS/known-violations.json":/out-known/known-violations.json \
    -v cc-kanban-npm-cache:/npm-cache \
    "$IMAGE" "$@"
fi

# ---- container side ----
# Generated/unreadable website content (root-owned locale dirs) is not needed by the harness.
mkdir -p /work/repo
tar -C /src --exclude=.git --exclude=node_modules --exclude=dist --exclude=audit --exclude=docs \
    --exclude='website/[a-z][a-z]' --exclude=website/.vitepress --exclude=website/test-results \
    --exclude=website/public --exclude=website/tests/kanban/report -cf - . \
  | tar -C /work/repo -xf -
cd /work/repo
mkdir -p "$HOME"

npm ci --no-audit --no-fund
npm run kanban:build
( cd website && npm ci --no-audit --no-fund )

# Largest JS chunk (informational budget)
find cli/kanban/client/dist/assets -name '*.js' -printf '%s %p\n' | sort -rn | head -1

# Use the host baseline (writable mount) so UPDATE_KNOWN rewrites the tracked file.
cp /out-known/known-violations.json website/tests/kanban/known-violations.json 2>/dev/null || true

rc=0
( cd website && npx playwright test --config tests/kanban/playwright.config.ts ) || rc=$?

cp -r website/tests/kanban/report/. /out/ 2>/dev/null || true
if [ "${UPDATE_KNOWN:-0}" = "1" ]; then
  cat website/tests/kanban/known-violations.json > /out-known/known-violations.json
fi
exit "$rc"
