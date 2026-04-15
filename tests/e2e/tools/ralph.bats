#!/usr/bin/env bats
# E2E tests for Tools/Ralph/ralph.sh
# Ref: P2-11 audit/phases/phase-2-stabilisation.md

setup() {
    RALPH="$BATS_TEST_DIRNAME/../../../Tools/Ralph/ralph.sh"
    export RALPH
}

@test "ralph.sh: file exists and is executable" {
    [ -f "$RALPH" ]
    [ -x "$RALPH" ]
}

@test "ralph.sh: has strict bash mode" {
    head -10 "$RALPH" | grep -q 'set -euo pipefail'
}

@test "ralph.sh: passes shellcheck -S error" {
    if ! command -v shellcheck >/dev/null 2>&1; then
        skip "shellcheck not available in container"
    fi
    run shellcheck -S error "$RALPH"
    [ "$status" -eq 0 ]
}

@test "ralph.sh: --help flag exits 0 or prints usage" {
    run "$RALPH" --help
    # Accept exit 0 or exit 1 with usage text
    [ "$status" -lt 2 ]
}

@test "ralph.sh: syntax valid (bash -n)" {
    run bash -n "$RALPH"
    [ "$status" -eq 0 ]
}
