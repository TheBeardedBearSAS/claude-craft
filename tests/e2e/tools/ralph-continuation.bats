#!/usr/bin/env bats
# Prompt hygiene, CLI precedence and conductor counters for Tools/Ralph.
#
# Why: the continuation prompt ("Continuation du Sprint") was prepended to
# every iteration even without compaction, diagnostics printed on stdout
# (with ANSI codes) leaked into prompts captured through `$(...)`, the i18n
# template `{0}` was printed verbatim, ralph.yml overrode --max-iterations,
# and `((x++))` from 0 killed the sprint conductor under errexit.
#
# Like ralph-set-e.bats, errexit stays ON after sourcing. The mock `claude`
# stores every prompt (last argument) in $MOCK_PROMPTS/prompt-<n>.txt.

setup() {
    PROJECT_ROOT="$(cd "$BATS_TEST_DIRNAME/../../.." && pwd)"
    RALPH="$PROJECT_ROOT/Tools/Ralph/ralph.sh"
    export PROJECT_ROOT RALPH

    # Per-test scratch dir under BATS_TMPDIR (avoid /tmp per project rule).
    SCRATCH="$BATS_TMPDIR/ralph-cont-$$-${BATS_TEST_NUMBER:-0}"
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
    MOCK_PROMPTS="$SCRATCH/prompts"
    mkdir -p "$MOCK_DIR" "$MOCK_PROMPTS"
    cat > "$MOCK_DIR/claude" <<'EOF'
#!/bin/bash
printf '%s|%s\n' "$PWD" "$(printf '%s ' "$@" | tr '\n' ' ')" >> "$MOCK_LOG"
case " $* " in
    *" /context "*) echo "Context: ${MOCK_CONTEXT_PCT:-12}%" ;;
    *" /compact "*) echo "compacted" ;;
    *)
        n=$(( $(find "$MOCK_PROMPTS" -name 'prompt-*.txt' | wc -l) + 1 ))
        printf '%s' "${!#}" > "$MOCK_PROMPTS/prompt-$n.txt"
        # MOCK_LIMIT_FIRST=1: the first prompt hits the context limit.
        if [[ -n "${MOCK_LIMIT_FIRST:-}" && $n -eq 1 ]]; then
            echo "Context limit reached - use /compact or /clear"
            exit 0
        fi
        echo "work" > "mock-output-$$.txt"
        echo "implemented the change"
        ;;
esac
EOF
    chmod +x "$MOCK_DIR/claude"
    export MOCK_LOG="$SCRATCH/claude.log" MOCK_PROMPTS
    export PATH="$MOCK_DIR:$PATH"

    # Stub ralph.sh found through SCRIPT_DIR: bounds the real loop.
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

dump_prompts() {
    local f
    for f in "$MOCK_PROMPTS"/prompt-*.txt; do
        [ -f "$f" ] || continue
        echo "--- $(basename "$f") ---"
        cat -v "$f"; echo
    done
}

write_sprint_status() {
    mkdir -p "$REPO/.bmad"
    cat > "$REPO/.bmad/sprint-status.yaml" <<'EOF'
stories:
  story1:
    title: "First story"
    description: "first"
    status: ready-for-dev
  story2:
    title: "Second story"
    description: "second"
    status: ready-for-dev
EOF
}

# ─────────────────────────────────────────────────────────────────────────────
# (a) No continuation text without a real compaction / handoff.
# ─────────────────────────────────────────────────────────────────────────────

@test "prompt: iteration 1 without compaction is exactly the user prompt" {
    cd "$REPO"
    run bash "$RALPH" --max-iterations=2 --delay=0 "hello"
    echo "$output"; dump_prompts

    [ -f "$MOCK_PROMPTS/prompt-1.txt" ]
    [ "$(cat "$MOCK_PROMPTS/prompt-1.txt")" = "hello" ]
    ! grep -q "Continuation du Sprint" "$MOCK_PROMPTS"/prompt-*.txt
}

# ─────────────────────────────────────────────────────────────────────────────
# (b) Diagnostics never leak into prompts.
# ─────────────────────────────────────────────────────────────────────────────

@test "prompt: no ANSI code nor print_info/print_verbose output in any prompt" {
    cd "$REPO"
    MOCK_CONTEXT_PCT=97 run bash "$RALPH" --verbose --max-iterations=2 --delay=0 "hello"
    echo "$output"; dump_prompts

    [ -f "$MOCK_PROMPTS/prompt-2.txt" ]
    # Iteration 2 follows a real preventive compaction: continuation expected.
    grep -q "Continuation du Sprint" "$MOCK_PROMPTS/prompt-2.txt"
    ! grep -q $'\x1b' "$MOCK_PROMPTS"/prompt-*.txt
    ! grep -qE 'ℹ|✓|⚠|Reconstructing context|Loaded module|Context manager initialized' "$MOCK_PROMPTS"/prompt-*.txt
}

@test "prompt: reactive compaction retry carries the continuation prompt" {
    cd "$REPO"
    MOCK_LIMIT_FIRST=1 MOCK_CONTEXT_PCT=97 run bash "$RALPH" --max-iterations=1 --delay=0 "hello"
    echo "$output"; dump_prompts

    [ -f "$MOCK_PROMPTS/prompt-2.txt" ]
    grep -q "Continuation du Sprint" "$MOCK_PROMPTS/prompt-2.txt"
    grep -q "hello" "$MOCK_PROMPTS/prompt-2.txt"
    ! grep -q $'\x1b' "$MOCK_PROMPTS/prompt-2.txt"
}

# ─────────────────────────────────────────────────────────────────────────────
# (c) i18n template substitution in the 5 languages.
# ─────────────────────────────────────────────────────────────────────────────

@test "context: preventive compact shows the real percentage in en fr es de pt" {
    cd "$REPO"
    local lang
    for lang in en fr es de pt; do
        rm -rf "$REPO/.ralph"
        run bash -c "
            source '$RALPH'
            LANG_ARG='$lang'
            load_messages
            load_modules
            RALPH_SESSION_BASE='$REPO/.ralph'
            sid=\$(create_session 'hello')
            invoke_claude \"\$sid\" 'first' 60000 > /dev/null
            MOCK_CONTEXT_PCT=97 check_preventive_compact \"\$sid\"
        "
        echo "[$lang] $output"
        [ "$status" -eq 0 ]
        echo "$output" | grep -q "97%"
        ! echo "$output" | grep -qF "{0}"
    done
}

# ─────────────────────────────────────────────────────────────────────────────
# (d) CLI > ralph.yml > defaults.
# ─────────────────────────────────────────────────────────────────────────────

@test "config: --max-iterations=2 wins over session.max_iterations: 5 in ralph.yml" {
    command -v yq
    cd "$REPO"
    printf 'session:\n  max_iterations: 5\n' > ralph.yml
    run bash "$RALPH" --max-iterations=2 --delay=0 "hello"
    echo "$output"; dump_prompts

    echo "$output" | grep -q "of 2"
    ! echo "$output" | grep -q "of 5"
    [ "$(find "$MOCK_PROMPTS" -name 'prompt-*.txt' | wc -l)" -eq 2 ]
}

# ─────────────────────────────────────────────────────────────────────────────
# (e) Sprint conductor and escalation counters under errexit.
# ─────────────────────────────────────────────────────────────────────────────

@test "conductor: parallel run processes 2 stories up to its summary" {
    command -v yq
    cd "$REPO"
    write_sprint_status
    run timeout 300 bash -c "
        source '$RALPH'
        load_messages
        load_modules
        SCRIPT_DIR='$STUB_DIR'
        RALPH_SESSION_BASE='$REPO/.ralph'
        ASC_STOP_WINDOW='23:59'
        cmd_sprint_conductor --parallel 2 Sprint-1
    "
    echo "$output"; dump_prompts

    [ "$status" -eq 0 ]
    echo "$output" | grep -q "Sprint Conductor Summary"
    grep -q "First story" "$MOCK_PROMPTS"/prompt-*.txt
    grep -q "Second story" "$MOCK_PROMPTS"/prompt-*.txt
}

@test "conductor: sequential run processes 2 failing stories up to its summary" {
    command -v yq
    cd "$REPO"
    write_sprint_status
    run timeout 300 bash -c "
        source '$RALPH'
        load_messages
        load_modules
        SCRIPT_DIR='$STUB_DIR'
        RALPH_SESSION_BASE='$REPO/.ralph'
        ASC_STOP_WINDOW='23:59'
        cmd_sprint_conductor Sprint-1
    "
    echo "$output"; dump_prompts

    [ "$status" -eq 0 ]
    echo "$output" | grep -q "Sprint Conductor Summary"
    echo "$output" | grep -qE "Failed: +2"
}

@test "escalation: counters start from 0 without killing the shell" {
    cd "$REPO"
    run bash -c "
        source '$RALPH'
        load_messages
        load_modules
        RALPH_SESSION_BASE='$REPO/.ralph'
        init_escalation_service
        printf 'id: E1\nlevel: high\nerror_type: x\ncreated_at: now\npriority: 2\n' > \"\$ESCALATION_QUEUE_DIR/E1.yaml\"
        printf 'id: E2\nlevel: low\nerror_type: y\ncreated_at: now\npriority: 4\n' > \"\$ESCALATION_QUEUE_DIR/E2.yaml\"
        get_pending_count
        list_escalations
        echo after
    "
    echo "$output"

    [ "$status" -eq 0 ]
    echo "$output" | grep -qx "2"
    echo "$output" | grep -q "Total: 2"
    echo "$output" | grep -qx "after"
}
