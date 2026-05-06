#!/usr/bin/env bats
# Behavioral baseline tests for Tools/Ralph/ralph.sh.
#
# Why: the existing tests/e2e/tools/ralph.bats is 100% static smoke checks
# (file exists, shebang, syntax, --help). Before refactoring run_ralph()
# (the 342-line core loop) into smaller modules, we need at least one
# behavioral test per critical surface so a silent regression triggers a
# CI failure.
#
# Coverage scope:
#   - parse_args validation (numeric flags, unknown options)
#   - load_messages populates the MSG_* globals
#   - --dry-run --max-iterations=1 end-to-end without invoking claude
#
# All tests use `bash -c "source ralph.sh; ..."` to leverage the sourcing
# guard at the bottom of ralph.sh (`if BASH_SOURCE == 0`) so main() is
# never auto-invoked.

setup() {
    PROJECT_ROOT="$BATS_TEST_DIRNAME/../../.."
    RALPH="$PROJECT_ROOT/Tools/Ralph/ralph.sh"
    export RALPH PROJECT_ROOT

    # Per-test scratch dir under BATS_TMPDIR (avoid /tmp per project rule).
    SCRATCH="$BATS_TMPDIR/ralph-bats-$$-${BATS_TEST_NUMBER:-0}"
    mkdir -p "$SCRATCH"
    export SCRATCH
}

teardown() {
    [ -d "$SCRATCH" ] && rm -rf "$SCRATCH"
}

# ─────────────────────────────────────────────────────────────────────────────
# Test 1 — parse_args: valid numeric flags assign their globals.
# Why: the audit-driven refactor of run_ralph() consumes MAX_ITERATIONS,
# TIMEOUT, DELAY. A regression on parse_args would silently fall back to
# defaults without surfacing in any other test.
# ─────────────────────────────────────────────────────────────────────────────

@test "parse_args: --max-iterations=10 assigns MAX_ITERATIONS=10" {
    run bash -c "source '$RALPH'; parse_args --max-iterations=10; echo \"\$MAX_ITERATIONS\""
    [ "$status" -eq 0 ]
    [ "$output" = "10" ]
}

@test "parse_args: --timeout=30000 assigns TIMEOUT=30000" {
    run bash -c "source '$RALPH'; parse_args --timeout=30000; echo \"\$TIMEOUT\""
    [ "$status" -eq 0 ]
    [ "$output" = "30000" ]
}

@test "parse_args: --delay=500 assigns DELAY=500" {
    run bash -c "source '$RALPH'; parse_args --delay=500; echo \"\$DELAY\""
    [ "$status" -eq 0 ]
    [ "$output" = "500" ]
}

@test "parse_args: --dry-run sets DRY_RUN=true" {
    run bash -c "source '$RALPH'; parse_args --dry-run; echo \"\$DRY_RUN\""
    [ "$status" -eq 0 ]
    [ "$output" = "true" ]
}

# ─────────────────────────────────────────────────────────────────────────────
# Test 2 — parse_args: rejects non-numeric values for numeric flags.
# Why: a regression that accepts garbage into MAX_ITERATIONS would crash
# the loop's `while [[ $iteration -lt $MAX_ITERATIONS ]]` with an arithmetic
# error or worse, run forever. We pin the contract here.
# ─────────────────────────────────────────────────────────────────────────────

@test "parse_args: --max-iterations=abc fails non-zero" {
    run bash -c "source '$RALPH'; parse_args --max-iterations=abc"
    [ "$status" -ne 0 ]
    echo "$output" | grep -qiE 'must be a positive integer'
}

@test "parse_args: --timeout=-5 fails non-zero" {
    run bash -c "source '$RALPH'; parse_args --timeout=-5"
    [ "$status" -ne 0 ]
}

@test "parse_args: unknown --foo flag fails non-zero" {
    run bash -c "source '$RALPH'; parse_args --foo=bar"
    [ "$status" -ne 0 ]
    echo "$output" | grep -qiE 'unknown option'
}

# ─────────────────────────────────────────────────────────────────────────────
# Test 3 — load_messages defines the MSG_* globals after sourcing.
# Why: every print_* helper interpolates ${MSG_*} variables. A regression
# that broke the i18n source path would result in empty banners with no
# error, masking other failures.
# ─────────────────────────────────────────────────────────────────────────────

@test "load_messages: en locale defines MSG_HEADER, MSG_ERROR, MSG_GOODBYE" {
    output=$(bash -c "source '$RALPH'; load_messages; echo \"H=\${MSG_HEADER:-MISSING}|E=\${MSG_ERROR:-MISSING}|G=\${MSG_GOODBYE:-MISSING}\"")
    echo "$output"
    [[ "$output" != *"H=MISSING"* ]]
    [[ "$output" != *"E=MISSING"* ]]
    [[ "$output" != *"G=MISSING"* ]]
}

@test "load_messages: invalid LANG_ARG falls back to en" {
    output=$(bash -c "source '$RALPH'; LANG_ARG=zz; load_messages; echo \"\${MSG_HEADER:-MISSING}\"")
    [ "$output" != "MISSING" ]
    [ -n "$output" ]
}

# ─────────────────────────────────────────────────────────────────────────────
# Test 4 — Smoke: --dry-run --max-iterations=1 end-to-end.
# Why: this is the lowest-cost end-to-end exercise of run_ralph(). It walks
# through Bloc A (init subsystems), Bloc B (create session), Bloc C (circuit
# breaker), the iteration loop body in dry-run mode (skips claude), and
# Bloc L (post-loop cleanup). If any of the three extracted modules
# misbehave, this test fails.
#
# We provide a fake `claude` on the PATH that records its calls; the dry-run
# branch must NOT invoke it. Status code is expected to be non-zero (DoD not
# passed because no claude response), but the script must exit cleanly
# rather than crash.
# ─────────────────────────────────────────────────────────────────────────────

@test "ralph --dry-run --max-iterations=1 exits cleanly without invoking claude" {
    # Mock claude that logs every invocation. The mock writes to MOCK_LOG so
    # we can later assert that the dry-run path did NOT call it.
    mock_dir="$SCRATCH/mock"
    mkdir -p "$mock_dir"
    cat > "$mock_dir/claude" <<'EOF'
#!/bin/bash
echo "INVOKED with args: $*" >> "${MOCK_LOG:-/dev/null}"
echo '{"result": "<promise>COMPLETE</promise>"}'
EOF
    chmod +x "$mock_dir/claude"
    export MOCK_LOG="$SCRATCH/claude.log"

    cd "$SCRATCH"
    # NB: prompt is a POSITIONAL argument in ralph.sh, not --prompt=.
    PATH="$mock_dir:$PATH" run bash "$RALPH" --dry-run --max-iterations=1 "hello world"

    # Status: dry-run completes without DoD passing (DoD is skipped after the
    # `continue` in the dry-run shortcut), so the script returns 1. We just
    # require the status to be <= 1 (no bash crash, no >= 2 error).
    [ "$status" -le 1 ]

    # Critical assertion: claude was not invoked in dry-run mode.
    if [ -f "$MOCK_LOG" ]; then
        ! grep -q "INVOKED" "$MOCK_LOG"
    fi

    # Session directory must have been created (Bloc B of run_ralph() ran).
    [ -d ".ralph" ]
}

# ─────────────────────────────────────────────────────────────────────────────
# Test 5 — Help flag exits cleanly with usage on stdout.
# Why: pre-existing ralph.bats already covers this, but the assertion is
# weak (status < 2). Tighten to status == 0 and stdout must contain a usage
# pattern (one of: "Usage", a flag we know exists, or the binary name).
# ─────────────────────────────────────────────────────────────────────────────

@test "ralph --help: status 0 and Usage banner on stdout" {
    run bash "$RALPH" --help
    [ "$status" -eq 0 ]
    echo "$output" | grep -qiE 'usage|--max-iterations|ralph'
}
