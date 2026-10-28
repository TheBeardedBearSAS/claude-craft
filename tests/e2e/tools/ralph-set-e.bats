#!/usr/bin/env bats
# `set -euo pipefail` hardening tests for Tools/Ralph (ralph.sh + lib/*.sh).
#
# Why: every Ralph module runs under errexit. Constructs such as `((x++))`
# with x=0, `var=$(cmd_that_returns_1)` or `grep` pipes without fallback
# killed the loop silently in nominal cases. Unlike ralph-parallel-session.bats,
# these tests keep errexit ON after sourcing, exactly like a real run.
#
# A mock `claude` on the PATH records "<PWD>|<args>" for every invocation and
# answers `/context` with "Context: ${MOCK_CONTEXT_PCT}%".

setup() {
    PROJECT_ROOT="$(cd "$BATS_TEST_DIRNAME/../../.." && pwd)"
    RALPH="$PROJECT_ROOT/Tools/Ralph/ralph.sh"
    RALPH_LIB="$PROJECT_ROOT/Tools/Ralph/lib"
    export PROJECT_ROOT RALPH RALPH_LIB

    # Per-test scratch dir under BATS_TMPDIR (avoid /tmp per project rule).
    SCRATCH="$BATS_TMPDIR/ralph-sete-$$-${BATS_TEST_NUMBER:-0}"
    mkdir -p "$SCRATCH"
    SCRATCH="$(cd "$SCRATCH" && pwd)"
    export SCRATCH

    export GIT_AUTHOR_NAME="Ralph Test" GIT_AUTHOR_EMAIL="ralph@test.local"
    export GIT_COMMITTER_NAME="Ralph Test" GIT_COMMITTER_EMAIL="ralph@test.local"

    REPO="$SCRATCH/repo"
    mkdir -p "$REPO"
    git -C "$REPO" init -q -b main
    echo "seed" > "$REPO/README.md"
    git -C "$REPO" add README.md
    git -C "$REPO" commit -q -m "chore: seed"
    export REPO

    MOCK_DIR="$SCRATCH/mock"
    mkdir -p "$MOCK_DIR"
    cat > "$MOCK_DIR/claude" <<'EOF'
#!/bin/bash
printf '%s|%s\n' "$PWD" "$(printf '%s ' "$@" | tr '\n' ' ')" >> "$MOCK_LOG"
case " $* " in
    *" /context "*) echo "Context: ${MOCK_CONTEXT_PCT:-12}%" ;;
    *" /compact "*) echo "compacted" ;;
    *)
        # MOCK_FAIL_FIRST=1: the first prompt call fails (e.g. API overload).
        if [[ -n "${MOCK_FAIL_FIRST:-}" && ! -e "$MOCK_LOG.failed" ]]; then
            touch "$MOCK_LOG.failed"
            echo "API Error: overloaded" >&2
            exit 1
        fi
        echo "work" > "mock-output-$$.txt"
        echo "implemented the change ${MOCK_SUFFIX:-}"
        ;;
esac
EOF
    chmod +x "$MOCK_DIR/claude"
    export MOCK_LOG="$SCRATCH/claude.log"
    export PATH="$MOCK_DIR:$PATH"

    # Stub ralph.sh found by spawn_session via SCRIPT_DIR: bounds the real loop.
    STUB_DIR="$SCRATCH/stub"
    mkdir -p "$STUB_DIR"
    cat > "$STUB_DIR/ralph.sh" <<EOF
#!/bin/bash
exec bash "$RALPH" --max-iterations=2 --delay=0 "\$@"
EOF
    chmod +x "$STUB_DIR/ralph.sh"
    export STUB_DIR
}

teardown() {
    [ -d "$SCRATCH" ] && rm -rf "$SCRATCH"
}

# ─────────────────────────────────────────────────────────────────────────────
# (c) Real loop: reaches the summary with exit_reason=max_iterations.
# ─────────────────────────────────────────────────────────────────────────────

# A real run: the first Claude call fails transiently (API overload), the
# second succeeds. Whatever happens in an iteration, the loop must reach
# print_summary with exit_reason=max_iterations — never exit silently.
@test "loop: ralph.sh --max-iterations=2 ends with exit_reason=max_iterations" {
    cd "$REPO"
    MOCK_FAIL_FIRST=1 run bash "$RALPH" --max-iterations=2 --delay=0 "hello"
    echo "$output"; echo "--- claude log ---"; cat "$MOCK_LOG" || true

    [ "$status" -eq 1 ]
    echo "$output" | grep -q "Claude invocation failed"
    echo "$output" | grep -q "Exit reason:.*max_iterations"
    # Both iterations really invoked Claude with the prompt.
    [ "$(grep -vc -- '/context\|/compact' "$MOCK_LOG")" -eq 2 ]
}

@test "loop: completion marker without ralph.yml ends with exit_reason=dod_complete" {
    cd "$REPO"
    MOCK_SUFFIX='<promise>COMPLETE</promise>' run bash "$RALPH" --max-iterations=2 --delay=0 "hello"
    echo "$output"

    [ "$status" -eq 0 ]
    ! echo "$output" | grep -q "numeric argument required"
    echo "$output" | grep -q "Exit reason:.*dod_complete"
}

# ─────────────────────────────────────────────────────────────────────────────
# (b) Every Claude call is pinned to the Ralph session's Claude UUID.
# ─────────────────────────────────────────────────────────────────────────────

@test "loop: every claude call (incl. /context) uses --session-id/--resume of the session" {
    cd "$REPO"
    run bash "$RALPH" --max-iterations=2 --delay=0 "hello"
    echo "$output"; echo "--- claude log ---"; cat "$MOCK_LOG" || true

    [ -s "$MOCK_LOG" ]
    ! grep -q -- '--continue' "$MOCK_LOG"
    # No call without an explicit session.
    ! grep -vE -- '--(session-id|resume) [0-9a-fA-F-]{36}' "$MOCK_LOG"

    local uuid
    uuid="$(cat "$REPO"/.ralph/sessions/*/claude_session_id)"
    [ -n "$uuid" ]
    # /context was really probed, and only against this session.
    grep -q -- "--resume $uuid -p /context" "$MOCK_LOG"
    [ "$(grep -oE -- '--(session-id|resume) [0-9a-fA-F-]{36}' "$MOCK_LOG" | awk '{print $2}' | sort -u)" = "$uuid" ]
}

@test "context: preventive compact probes /context and runs /compact with --resume" {
    cd "$REPO"
    run bash -c "
        source '$RALPH'
        load_messages
        load_modules
        RALPH_SESSION_BASE='$REPO/.ralph'
        sid=\$(create_session 'hello')
        # No Claude session yet: nothing to probe, no call at all.
        check_preventive_compact \"\$sid\" || true
        [ ! -s '$MOCK_LOG' ] || { echo 'claude called before a session exists'; exit 9; }
        invoke_claude \"\$sid\" 'first' 60000 > /dev/null
        MOCK_CONTEXT_PCT=97 check_preventive_compact \"\$sid\"
        echo \"preventive_status=\$?\"
    "
    echo "$output"; echo "--- claude log ---"; cat "$MOCK_LOG" || true

    [ "$status" -eq 0 ]
    echo "$output" | grep -q "preventive_status=0"

    local uuid
    uuid="$(cat "$REPO"/.ralph/sessions/*/claude_session_id)"
    grep -q -- "--resume $uuid -p /context" "$MOCK_LOG"
    grep -q -- "--resume $uuid -p /compact" "$MOCK_LOG"
    ! grep -q -- '--continue' "$MOCK_LOG"
    ! grep -vE -- '--(session-id|resume) [0-9a-fA-F-]{36}' "$MOCK_LOG"
}

# ─────────────────────────────────────────────────────────────────────────────
# (a) Parallel: process_stories_parallel reaches the final summary.
# ─────────────────────────────────────────────────────────────────────────────

@test "parallel: process_stories_parallel 'US-1 US-2' reaches the summary under set -e" {
    cd "$REPO"
    run timeout 300 bash -c "
        source '$RALPH'
        source '$RALPH_LIB/parallel-manager.sh'
        SCRIPT_DIR='$STUB_DIR'
        RALPH_SESSION_BASE='$REPO/.ralph'
        PARALLEL_ENABLED=true
        init_parallel_manager
        process_stories_parallel 'US-1 US-2'
    "
    echo "$output"; echo "--- claude log ---"; cat "$MOCK_LOG" || true

    [ "$status" -eq 0 ]
    echo "$output" | grep -q "Parallel Execution Summary"
    echo "$output" | grep -qE "Sessions spawned: +2"
    # Mock never emits the DoD marker: each worker ends on max_iterations
    # (exit 1), and the leader must survive collecting those failures.
    echo "$output" | grep -qE "Failed: +2"
}

# ─────────────────────────────────────────────────────────────────────────────
# yq-backed paths (yq is pinned in the e2e image).
# ─────────────────────────────────────────────────────────────────────────────

@test "yq: merge_worker_reports merges a completed report into state and graph" {
    command -v yq
    cd "$REPO"
    run bash -c "
        source '$RALPH'
        source '$RALPH_LIB/parallel-manager.sh'
        RALPH_SESSION_BASE='$REPO/.ralph'
        init_parallel_manager
        update_parallel_state spawn S1 US-1
        echo '{\"nodes\":{\"US-1\":{\"status\":\"pending\",\"deps\":[]}},\"edges\":[]}' > \"\$PARALLEL_DEPENDENCY_GRAPH\"
        write_worker_report w1 S1 US-1 completed
        merge_worker_reports
    "
    echo "$output"

    [ "$status" -eq 0 ]
    local state="$REPO/.ralph/parallel/state.yaml"
    [ "$(yq '.sessions.completed[0]' "$state")" = "S1" ]
    [ "$(yq '.sessions.active | length' "$state")" = "0" ]
    [ "$(yq '.metrics.total_completed' "$state")" = "1" ]
    [ "$(yq '.metrics.efficiency' "$state")" = "100" ]
    [ "$(jq -r '.nodes["US-1"].status' "$REPO/.ralph/parallel/dependencies.json")" = "completed" ]
    [ -z "$(ls "$REPO/.ralph/parallel/workers/")" ]
}

@test "yq: ralph.yml session.max_iterations is loaded" {
    command -v yq
    cd "$REPO"
    printf 'session:\n  max_iterations: 3\n' > ralph.yml
    run bash -c "source '$RALPH'; load_messages; load_config > /dev/null; echo \"\$MAX_ITERATIONS\""
    echo "$output"

    [ "$status" -eq 0 ]
    [ "$(echo "$output" | tail -1)" = "3" ]
}
