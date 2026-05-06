#!/usr/bin/env bats
# E2E tests for the security-critical helpers in cli/lib/path-safety.js.
#
# Why: The CLI Node tests already cover assertSafeTarget()/assertSafeLang(),
# but BATS gives us a black-box guarantee that the helpers cannot be bypassed
# from the shell side either (relative paths, symlinks, $PWD games).
#
# Strategy: drive the CLI binary with adversarial arguments and check that
# the process exits with a non-zero status before any side effect.

setup() {
    PROJECT_ROOT="$BATS_TEST_DIRNAME/../../.."
    CLI="$PROJECT_ROOT/cli/index.js"
    export CLI PROJECT_ROOT
    SAFE_TARGET="$BATS_TMPDIR/cc-bats-$$"
    mkdir -p "$SAFE_TARGET"
    export SAFE_TARGET
}

teardown() {
    [ -d "$SAFE_TARGET" ] && rm -rf "$SAFE_TARGET"
}

@test "cli: refuses --target=/" {
    run node "$CLI" update --target=/ --tech=symfony --lang=en
    [ "$status" -ne 0 ]
    echo "$output" | grep -qiE 'system directory|forbidden|refus'
}

@test "cli: refuses --target=/etc" {
    run node "$CLI" update --target=/etc --tech=symfony --lang=en
    [ "$status" -ne 0 ]
    echo "$output" | grep -qiE 'system directory|forbidden|refus'
}

@test "cli: refuses --target=/usr" {
    run node "$CLI" update --target=/usr --tech=symfony --lang=en
    [ "$status" -ne 0 ]
}

@test "cli: refuses relative path resolving to /etc via ../../" {
    cd "$SAFE_TARGET"
    # Construct a relative path from $SAFE_TARGET that resolves to /etc.
    # /tmp/cc-bats-XXXX → ../../etc → /etc
    run node "$CLI" update --target=../../etc --tech=symfony --lang=en
    [ "$status" -ne 0 ]
}

@test "cli: refuses --lang=AB (uppercase)" {
    run node "$CLI" update --target="$SAFE_TARGET" --tech=symfony --lang=AB
    [ "$status" -ne 0 ]
    echo "$output" | grep -qiE 'invalid|lang'
}

@test "cli: refuses --lang=fr_FR (with underscore)" {
    run node "$CLI" update --target="$SAFE_TARGET" --tech=symfony --lang=fr_FR
    [ "$status" -ne 0 ]
}

@test "cli: refuses --lang containing shell metacharacters" {
    run node "$CLI" update --target="$SAFE_TARGET" --tech=symfony --lang='fr;rm'
    [ "$status" -ne 0 ]
}

@test "cli: refuses --lang containing newline" {
    run node "$CLI" update --target="$SAFE_TARGET" --tech=symfony --lang=$'fr\nls'
    [ "$status" -ne 0 ]
}

@test "cli: accepts --lang=fr (canonical case)" {
    # We don't assert success of the full command (no .claude/ dir present);
    # we assert the lang validation does not fire.
    run node "$CLI" update --target="$SAFE_TARGET" --tech=symfony --lang=fr
    # Allow exit codes other than 0 (e.g. nothing to update) but not the
    # specific "Invalid --lang" exit.
    if [ "$status" -ne 0 ]; then
        ! echo "$output" | grep -qi 'Invalid --lang'
    fi
}
