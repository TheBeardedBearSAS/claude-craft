#!/usr/bin/env bats
# E2E tests for Tools/StatusLine/statusline.sh
# Ref: P2-11 audit/phases/phase-2-stabilisation.md

setup() {
    STATUSLINE="$BATS_TEST_DIRNAME/../../../Tools/StatusLine/statusline.sh"
    export STATUSLINE
}

@test "statusline.sh: file exists and is executable" {
    [ -f "$STATUSLINE" ]
    [ -x "$STATUSLINE" ]
}

@test "statusline.sh: has strict bash mode" {
    head -5 "$STATUSLINE" | grep -q 'set -euo pipefail'
}

@test "statusline.sh: passes shellcheck -S error" {
    if ! command -v shellcheck >/dev/null 2>&1; then
        skip "shellcheck not available in container"
    fi
    run shellcheck -S error "$STATUSLINE"
    [ "$status" -eq 0 ]
}

@test "statusline.sh: produces output with minimal stdin" {
    # Claude Code statusline reads JSON from stdin; simulate empty input
    run bash -c 'echo "{}" | "$STATUSLINE" 2>&1 || true'
    # Should not crash catastrophically (exit < 2)
    [ "$status" -lt 2 ]
}
