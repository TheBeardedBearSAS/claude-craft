#!/usr/bin/env bats
# =============================================================================
# Static anti-regression guard: no bare `((var++))` / `((var--))` under set -e.
#
# `set -euo pipefail` + a standalone `((var++))` is a latent abort: the
# post-increment returns exit code 1 when the variable is 0 (or the pre-value
# is 0), killing the script. The safe form is `var=$((var + 1))` (or, if the
# command form is required, `((var++)) || true`).
#
# This test FAILS if any targeted `set -e` script reintroduces the unguarded
# command form. C-style `for ((i=0; i<n; i++))` loops are NOT matched (the
# `((` is not immediately followed by `var++))`).
#
# Run: docker run --rm -v "$(pwd):/mnt" bats/bats:latest /mnt/.bmad/tests/
# =============================================================================

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"

# Files that combine `set -euo pipefail` with arithmetic counters.
TARGET_FILES=(
    ".bmad/lib/gate-validator.sh"
    ".bmad/lib/routing-engine.sh"
    ".bmad/lib/batch-executor.sh"
    ".bmad/hooks/quality-gate.sh"
    "Dev/scripts/install-from-config.sh"
    "Dev/scripts/check-prerequisites.sh"
)

# Matches the standalone command form `((var++))` / `((var--))` only.
BARE_INCR_RE='\(\([a-zA-Z_][a-zA-Z0-9_]*(\+\+|--)\)\)'

@test "no unguarded ((var++))/((var--)) in set -e scripts" {
    violations=""
    for rel in "${TARGET_FILES[@]}"; do
        f="$REPO_ROOT/$rel"
        [ -f "$f" ] || continue
        # Flag bare increments, excluding any guarded by `|| true`.
        hits="$(grep -nE "$BARE_INCR_RE" "$f" | grep -v '|| true' || true)"
        if [ -n "$hits" ]; then
            violations+="$rel:"$'\n'"$hits"$'\n'
        fi
    done

    if [ -n "$violations" ]; then
        echo "Unguarded post/pre-increment found (use var=\$((var + 1))):" >&2
        echo "$violations" >&2
    fi
    [ -z "$violations" ]
}
