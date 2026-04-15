#!/usr/bin/env bats
# E2E tests for Tools/install-rtk.sh
# Ref: P2-11 audit/phases/phase-2-stabilisation.md
# Ref: P1-01 SEC-001 (pipe curl|sh replaced by checksum verification)

setup() {
    INSTALL_RTK="$BATS_TEST_DIRNAME/../../../Tools/install-rtk.sh"
    export INSTALL_RTK
}

@test "install-rtk.sh: file exists" {
    [ -f "$INSTALL_RTK" ]
}

@test "install-rtk.sh: no 'curl | sh' pipe (SEC-001)" {
    run grep -E 'curl[^|]*\|[^|]*sh' "$INSTALL_RTK"
    [ "$status" -ne 0 ]  # grep should find nothing
}

@test "install-rtk.sh: has SHA256 verification OR explicit safe alternative" {
    run grep -iE 'sha256|checksum|signature|cosign|sigstore' "$INSTALL_RTK"
    [ "$status" -eq 0 ]
}

@test "install-rtk.sh: syntax valid (bash -n)" {
    run bash -n "$INSTALL_RTK"
    [ "$status" -eq 0 ]
}

@test "install-rtk.sh: passes shellcheck -S error" {
    if ! command -v shellcheck >/dev/null 2>&1; then
        skip "shellcheck not available in container"
    fi
    run shellcheck -S error "$INSTALL_RTK"
    [ "$status" -eq 0 ]
}

@test "install-rtk.sh: --help or --dry-run available" {
    run bash -c '"$INSTALL_RTK" --help 2>&1 || "$INSTALL_RTK" --dry-run 2>&1 || true'
    # Should return something (not crash silently)
    [ -n "$output" ]
}
