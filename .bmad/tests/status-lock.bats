#!/usr/bin/env bats
bats_require_minimum_version 1.5.0
# =============================================================================
# Tests for .bmad/lib/status-lock.sh — the advisory lock shared with the
# Kanban server (cli/kanban/server/services/lock.js) around writes of
# .bmad/sprint-status.yaml.
#
# The bats image has no yq: the routing-engine / batch-executor tests put a
# yq stub on PATH that records every `yq -i` and whether the lock was held.
#
# Run: docker run --rm -v "$(pwd):/mnt" bats/bats:latest /mnt/.bmad/tests/
# =============================================================================

BMAD_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
LIB="$BMAD_DIR/lib/status-lock.sh"

setup() {
    YAML="$BATS_TEST_TMPDIR/sprint-status.yaml"
    LOCK="$YAML.lock"
    printf 'original\n' > "$YAML"
}

# in_lib <bash snippet>: run the snippet in a fresh bash with the lib sourced
# (exec: when backgrounded, $! is that bash itself, so signals reach it;
# always called via `run` or `&`, i.e. in a subshell, never in the test shell)
# — a separate process, so the lib traps never touch the bats process.
in_lib() {
    exec bash -c "set -euo pipefail; source '$LIB'; STATUS_LOCK_RETRIES=\${STATUS_LOCK_RETRIES:-2}; $1"
}

now_ms() {
    local t="${EPOCHREALTIME//[.,]/}"
    echo $((t / 1000))
}

# A lock owned by another, live process (this bats process), taken just now.
write_live_foreign_lock() {
    printf '{"pid":%d,"ts":%d}' "$$" "$(now_ms)" > "$LOCK"
}

@test "lock is held during the command and removed afterwards" {
    run in_lib "with_status_lock '$YAML' cat '$LOCK'"
    [ "$status" -eq 0 ]
    [[ "$output" == '{"pid":'* ]]
    [ ! -e "$LOCK" ]
}

@test "lock content is the exact JSON shape lock.js parses: {\"pid\":<int>,\"ts\":<ms>}" {
    run in_lib "show() { cat '$LOCK'; echo; echo \"self=\$BASHPID\"; }; with_status_lock '$YAML' show"
    [ "$status" -eq 0 ]
    content="${lines[0]}"
    [[ "$content" =~ ^\{\"pid\":([0-9]+),\"ts\":([0-9]+)\}$ ]]
    pid="${BASH_REMATCH[1]}"
    ts="${BASH_REMATCH[2]}"
    # pid is the process that took the lock, ts is epoch milliseconds (13 digits, ~now)
    [ "${lines[1]}" = "self=$pid" ]
    [ "${#ts}" -eq 13 ]
    diff=$(( $(now_ms) - ts ))
    [ "$diff" -ge 0 ]
    [ "$diff" -lt 5000 ]
}

@test "lock is released when the command fails, and the failure code is kept" {
    run in_lib "with_status_lock '$YAML' false"
    [ "$status" -eq 1 ]
    [ ! -e "$LOCK" ]

    # a wrapped function that calls exit (as cmd_transition does) also releases
    run in_lib "boom() { exit 3; }; with_status_lock '$YAML' boom"
    [ "$status" -eq 3 ]
    [ ! -e "$LOCK" ]
}

@test "lock is released when the process is interrupted (TERM)" {
    # `wait` (not a foreground sleep) so bash runs its TERM trap at once.
    in_lib "w() { sleep 30 & echo \$! > '$BATS_TEST_TMPDIR/sleep.pid'; wait \$!; }; with_status_lock '$YAML' w" >/dev/null 2>&1 3>&- &
    pid=$!
    for _ in $(seq 1 50); do [ -s "$BATS_TEST_TMPDIR/sleep.pid" ] && break; sleep 0.05; done
    [ -e "$LOCK" ]
    kill -TERM "$pid"
    status=0
    wait "$pid" || status=$?
    kill "$(cat "$BATS_TEST_TMPDIR/sleep.pid")" 2>/dev/null || true
    [ "$status" -eq 143 ]
    [ ! -e "$LOCK" ]
}

@test "live lock of another process: fails on stderr, nothing written, lock untouched" {
    write_live_foreign_lock
    before="$(cat "$LOCK")"
    run in_lib "with_status_lock '$YAML' sh -c 'echo overwritten > \"\$1\"' _ '$YAML'"
    [ "$status" -ne 0 ]
    [[ "$output" == *"locked"* ]]
    [ "$(cat "$YAML")" = "original" ]
    [ "$(cat "$LOCK")" = "$before" ]
}

@test "the error message goes to stderr, not stdout" {
    write_live_foreign_lock
    run in_lib "with_status_lock '$YAML' true 2>/dev/null"
    [ "$status" -ne 0 ]
    [ -z "$output" ]
}

@test "stale lock (ts older than 10 s, live pid) is taken over" {
    printf '{"pid":%d,"ts":%d}' "$$" "$(( $(now_ms) - 11000 ))" > "$LOCK"
    run in_lib "with_status_lock '$YAML' sh -c 'echo written > \"\$1\"' _ '$YAML'"
    [ "$status" -eq 0 ]
    [ "$(cat "$YAML")" = "written" ]
    [ ! -e "$LOCK" ]
}

@test "lock of a dead pid (fresh ts) is taken over" {
    bash -c 'exit 0' &
    dead=$!
    wait "$dead"
    printf '{"pid":%d,"ts":%d}' "$dead" "$(now_ms)" > "$LOCK"
    run in_lib "with_status_lock '$YAML' sh -c 'echo written > \"\$1\"' _ '$YAML'"
    [ "$status" -eq 0 ]
    [ "$(cat "$YAML")" = "written" ]
}

@test "unreadable lock content: old mtime is taken over, fresh mtime is respected" {
    printf 'garbage' > "$LOCK"
    run in_lib "with_status_lock '$YAML' true"
    [ "$status" -ne 0 ]
    [ "$(cat "$LOCK")" = "garbage" ]

    touch -t 202001010000 "$LOCK"
    run in_lib "with_status_lock '$YAML' sh -c 'echo written > \"\$1\"' _ '$YAML'"
    [ "$status" -eq 0 ]
    [ "$(cat "$YAML")" = "written" ]
}

@test "a lock that is not a regular file (planted symlink) is replaced, never opened" {
    # /dev/null keeps the test deterministic; to a FIFO the same open would block forever.
    ln -s /dev/null "$LOCK"
    run in_lib "with_status_lock '$YAML' sh -c 'test -f \"\$1\" && ! test -L \"\$1\" && echo written > \"\$2\"' _ '$LOCK' '$YAML'"
    [ "$status" -eq 0 ]
    [ "$(cat "$YAML")" = "written" ]
    [ ! -e "$LOCK" ]
    [ ! -L "$LOCK" ]
}

@test "nested with_status_lock in the same process does not deadlock" {
    run in_lib "inner() { with_status_lock '$YAML' test -e '$LOCK'; test -e '$LOCK'; }; with_status_lock '$YAML' inner"
    [ "$status" -eq 0 ]
    [ ! -e "$LOCK" ]
}

@test "release never removes a lock that is not ours" {
    # Simulate a takeover by another writer while we hold the lock.
    run in_lib "steal() { printf '{\"pid\":1,\"ts\":1}' > '$LOCK'; }; with_status_lock '$YAML' steal"
    [ "$status" -eq 0 ]
    [ "$(cat "$LOCK")" = '{"pid":1,"ts":1}' ]
}

# Seen on macOS (lost update in the test below): the holder released between our failed create and the staleness
# check, and a third writer took the lock right after. "Vanished, so stale" made us remove that fresh lock.
@test "a lock that vanished during the staleness check is not judged stale (nothing to remove)" {
    rm -f "$LOCK"
    run in_lib "_status_lock_is_stale '$LOCK'"
    [ "$status" -ne 0 ]
}

# Seen on macOS (lost update in the test below, again): a writer judged the lock of a holder that had just released
# and exited ("pid gone"), and removed the lock a third writer had taken meanwhile. Here the lock is replaced right
# after the staleness verdict, as that third writer would.
@test "a lock replaced after the staleness verdict is not removed" {
    bash -c 'exit 0' &
    dead=$!
    wait "$dead"
    printf '{"pid":%d,"ts":%d}' "$dead" "$(now_ms)" > "$LOCK"
    live="$(printf '{"pid":%d,"ts":%d}' "$$" "$(now_ms)")"
    run in_lib "eval \"original\$(declare -f _status_lock_is_stale)\"
        _status_lock_is_stale() { original_status_lock_is_stale \"\$@\" && { printf '%s' '$live' > '$LOCK'; return 0; }; }
        with_status_lock '$YAML' sh -c 'echo written > \"\$1\"' _ '$YAML'"
    [ "$status" -ne 0 ]
    [ "$(cat "$LOCK")" = "$live" ]
    [ "$(cat "$YAML")" = "original" ]
}

@test "concurrent read-modify-write writers in background lose no update" {
    : > "$YAML"
    pids=()
    for i in 1 2 3 4 5 6 7 8; do
        STATUS_LOCK_RETRIES=200 in_lib "rmw() { c=\$(cat '$YAML'); sleep 0.05; printf '%s\nline-$i\n' \"\$c\" > '$YAML'; }; with_status_lock '$YAML' rmw" 3>&- &
        pids+=("$!")
    done
    for p in "${pids[@]}"; do wait "$p"; done
    [ "$(grep -c '^line-' "$YAML")" -eq 8 ]
    [ "$(grep '^line-' "$YAML" | sort -u | wc -l)" -eq 8 ]
    [ ! -e "$LOCK" ]
}

# -----------------------------------------------------------------------------
# The real writers take the lock
# -----------------------------------------------------------------------------

# Copy the scripts into a throwaway project with a yq stub on PATH.
make_project() {
    P="$BATS_TEST_TMPDIR/proj"
    mkdir -p "$P/.bmad/lib" "$P/.bmad/.tmp" "$P/bin"
    cp "$BMAD_DIR/lib/routing-engine.sh" "$BMAD_DIR/lib/batch-executor.sh" "$LIB" "$P/.bmad/lib/"
    SS="$P/.bmad/sprint-status.yaml"
    printf 'stories:\n  US-1:\n    status: ready-for-dev\n' > "$SS"
    YQ_LOG="$P/yq-writes.log"
    : > "$YQ_LOG"
    cat > "$P/bin/yq" <<EOF
#!/usr/bin/env bash
# yq stub: log writes with the lock state, answer the few reads the scripts make
if [ "\$1" = "-i" ]; then
    if [ -e "$SS.lock" ]; then state=locked; else state=unlocked; fi
    echo "\$(basename "\${@: -1}") \$state" >> "$YQ_LOG"
    exit 0
fi
case "\$1" in
    .story_id) echo US-1 ;;
    .status) echo completed ;;
    .worker_id) echo w1 ;;
    .reported_at) echo 2026-01-01T00:00:00Z ;;
    *'.status // ""'*) echo ready-for-dev ;;
    *to_entries*) echo US-1 ;;
    *'| .status') echo completed ;;
    *) echo "" ;;
esac
EOF
    chmod +x "$P/bin/yq"
    export PATH="$P/bin:$PATH"
}

@test "routing-engine writes happen under the lock" {
    make_project
    run bash "$P/.bmad/lib/routing-engine.sh" transition US-1 in-progress
    [ "$status" -eq 0 ]
    [ "$(grep -c 'sprint-status.yaml locked' "$YQ_LOG")" -eq 3 ]
    run ! grep -q unlocked "$YQ_LOG"
    [ ! -e "$SS.lock" ]
}

@test "routing-engine writers fail cleanly without writing when another process holds the lock" {
    make_project
    printf '{"pid":%d,"ts":%d}' "$$" "$(now_ms)" > "$SS.lock"
    export STATUS_LOCK_RETRIES=1
    for cmd in "transition US-1 in-progress" "tdd-phase US-1 green" "tests-status US-1 true" "auto-claim"; do
        # shellcheck disable=SC2086
        run bash "$P/.bmad/lib/routing-engine.sh" $cmd
        echo "$cmd -> $status: $output"
        [ "$status" -ne 0 ]
        [[ "$output" == *"locked"* ]]
    done
    [ ! -s "$YQ_LOG" ]
    [ -e "$SS.lock" ]
}

@test "batch-executor writers of sprint-status.yaml take the lock" {
    make_project
    run bash "$P/.bmad/lib/batch-executor.sh" claim US-1
    [ "$status" -eq 0 ]
    grep -q 'sprint-status.yaml locked' "$YQ_LOG"
    run ! grep -q 'sprint-status.yaml unlocked' "$YQ_LOG"

    printf 'worker_id: w1\n' > "$P/.bmad/.tmp/worker-w1.yaml"
    : > "$YQ_LOG"
    run bash -c "source '$P/.bmad/lib/batch-executor.sh' >/dev/null; merge_worker_reports"
    [ "$status" -eq 0 ]
    [ "$(grep -c 'sprint-status.yaml locked' "$YQ_LOG")" -eq 2 ]
    run ! grep -q 'sprint-status.yaml unlocked' "$YQ_LOG"
    [ ! -e "$SS.lock" ]
}

@test "batch-executor writers fail cleanly without writing when another process holds the lock" {
    make_project
    printf '{"pid":%d,"ts":%d}' "$$" "$(now_ms)" > "$SS.lock"
    export STATUS_LOCK_RETRIES=1
    printf 'worker_id: w1\n' > "$P/.bmad/.tmp/worker-w1.yaml"

    run bash "$P/.bmad/lib/batch-executor.sh" claim US-1
    [ "$status" -ne 0 ]
    [[ "$output" == *"locked"* ]]

    run bash -c "source '$P/.bmad/lib/batch-executor.sh' >/dev/null; merge_worker_reports"
    [ "$status" -ne 0 ]
    [ -e "$P/.bmad/.tmp/worker-w1.yaml" ]   # report kept for a later merge

    run bash -c "source '$P/.bmad/lib/batch-executor.sh' >/dev/null; BATCH_QUEUE_FILE=/dev/null wait_and_transition US-1 review 5"
    [ "$status" -ne 0 ]

    run ! grep -q 'sprint-status.yaml' "$YQ_LOG"
    [ -e "$SS.lock" ]
}
