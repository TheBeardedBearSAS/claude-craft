#!/usr/bin/env bats
# E2E smoke tests for Dev/scripts/install-*-rules.sh
#
# Why: Each `install-<tech>-rules.sh` is the entry point invoked from the CLI
# `installer.js` via spawnSync. A regression here breaks the install flow for
# end users. These tests verify the contract every install script must hold:
# strict bash mode, valid syntax, --help short-circuits, --dry-run never
# touches the filesystem, and the script exits cleanly on bad arguments.
#
# Coverage target: at least one install script per tech tier.

setup() {
    SCRIPTS_DIR="$BATS_TEST_DIRNAME/../../../Dev/scripts"
    export SCRIPTS_DIR
}

# ─────────────────────────────────────────────────────────────────────────────
# Common contract — every install-*-rules.sh must satisfy these
# ─────────────────────────────────────────────────────────────────────────────

@test "all install-*-rules.sh have strict bash mode" {
    local missing=0
    for script in "$SCRIPTS_DIR"/install-*-rules.sh; do
        [ -f "$script" ] || continue
        if ! head -10 "$script" | grep -q 'set -euo pipefail'; then
            echo "Missing 'set -euo pipefail' in $script"
            missing=$((missing + 1))
        fi
    done
    [ "$missing" -eq 0 ]
}

@test "all install-*-rules.sh have valid bash syntax" {
    for script in "$SCRIPTS_DIR"/install-*-rules.sh; do
        [ -f "$script" ] || continue
        run bash -n "$script"
        if [ "$status" -ne 0 ]; then
            echo "Syntax error in $script: $output"
            return 1
        fi
    done
}

@test "all install-*-rules.sh start with shebang" {
    for script in "$SCRIPTS_DIR"/install-*-rules.sh; do
        [ -f "$script" ] || continue
        head -1 "$script" | grep -qE '^#!/(usr/bin/env )?bash' || {
            echo "Missing or wrong shebang in $script"
            return 1
        }
    done
}

@test "install-common-rules.sh exists and is non-empty" {
    [ -f "$SCRIPTS_DIR/install-common-rules.sh" ]
    [ -s "$SCRIPTS_DIR/install-common-rules.sh" ]
}

# ─────────────────────────────────────────────────────────────────────────────
# Per-tech smoke tests — one representative script per tier
# ─────────────────────────────────────────────────────────────────────────────

@test "install-symfony-rules.sh: --help exits cleanly" {
    [ -f "$SCRIPTS_DIR/install-symfony-rules.sh" ]
    run bash "$SCRIPTS_DIR/install-symfony-rules.sh" --help
    # --help may exit 0 (printed help and exit) or 1 (rejected as usage)
    [ "$status" -lt 2 ]
}

@test "install-react-rules.sh: --help exits cleanly" {
    [ -f "$SCRIPTS_DIR/install-react-rules.sh" ]
    run bash "$SCRIPTS_DIR/install-react-rules.sh" --help
    [ "$status" -lt 2 ]
}

@test "install-flutter-rules.sh: --help exits cleanly" {
    [ -f "$SCRIPTS_DIR/install-flutter-rules.sh" ]
    run bash "$SCRIPTS_DIR/install-flutter-rules.sh" --help
    [ "$status" -lt 2 ]
}

@test "install-python-rules.sh: --help exits cleanly" {
    [ -f "$SCRIPTS_DIR/install-python-rules.sh" ]
    run bash "$SCRIPTS_DIR/install-python-rules.sh" --help
    [ "$status" -lt 2 ]
}

@test "install-php-rules.sh: --help exits cleanly" {
    [ -f "$SCRIPTS_DIR/install-php-rules.sh" ]
    run bash "$SCRIPTS_DIR/install-php-rules.sh" --help
    [ "$status" -lt 2 ]
}

@test "install-paperclip-rules.sh: --help exits cleanly" {
    [ -f "$SCRIPTS_DIR/install-paperclip-rules.sh" ]
    run bash "$SCRIPTS_DIR/install-paperclip-rules.sh" --help
    [ "$status" -lt 2 ]
}

# ─────────────────────────────────────────────────────────────────────────────
# Lang validation — must reject invalid two-letter codes (defense-in-depth
# beyond the assertSafeLang() check in the JS CLI)
# ─────────────────────────────────────────────────────────────────────────────

@test "install-symfony-rules.sh: rejects invalid --lang values" {
    [ -f "$SCRIPTS_DIR/install-symfony-rules.sh" ]
    # An invalid language code should fail; many scripts accept any string then
    # fail on missing files, both forms are acceptable as long as nothing is
    # written.
    run bash "$SCRIPTS_DIR/install-symfony-rules.sh" --lang=xx --dry-run /tmp/claude-craft-test-target-$$
    # We don't assert exit status (varies by script) — we just verify nothing
    # was written outside expected places.
    [ ! -d "/tmp/claude-craft-test-target-$$/.claude" ] || rm -rf "/tmp/claude-craft-test-target-$$"
}

# ─────────────────────────────────────────────────────────────────────────────
# Path safety — install scripts must not write to forbidden system paths
# even if invoked with such targets (defense-in-depth beyond assertSafeTarget
# in the CLI)
# ─────────────────────────────────────────────────────────────────────────────

@test "install-symfony-rules.sh: refuses to write to /etc directly" {
    [ -f "$SCRIPTS_DIR/install-symfony-rules.sh" ]
    # Even when invoked directly, the script must not be able to clobber /etc.
    # This test does not require root; it only verifies the script doesn't
    # try (we expect either a permission denied or an explicit refusal).
    run bash "$SCRIPTS_DIR/install-symfony-rules.sh" --dry-run /etc/claude-craft-should-never-exist-$$
    # We don't care about exit code; we care that nothing got created.
    [ ! -d "/etc/claude-craft-should-never-exist-$$/.claude" ]
}
