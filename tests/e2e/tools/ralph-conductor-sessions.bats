#!/usr/bin/env bats
# Sprint conductor sessions, story ids and continuation prompts for Tools/Ralph.
#
# Why: `$(spawn_session ...)` waited for the background worker (it inherits
# the substitution pipe) and lost the session counters in the subshell, story
# ids were spliced into yq expressions (`.stories.${id}`), the continuation and
# handoff prompts were French whatever --lang, and `$(run_auto_compact ...)`
# lost the compact counter so max_compacts never switched sessions.
#
# Like ralph-continuation.bats, errexit stays ON after sourcing. The mock
# `claude` stores every prompt (last argument) in $MOCK_PROMPTS/prompt-<n>-<pid>.txt.

setup() {
    PROJECT_ROOT="$(cd "$BATS_TEST_DIRNAME/../../.." && pwd)"
    RALPH="$PROJECT_ROOT/Tools/Ralph/ralph.sh"
    export PROJECT_ROOT RALPH

    # Per-test scratch dir under BATS_TMPDIR (avoid /tmp per project rule).
    SCRATCH="$BATS_TMPDIR/ralph-cs-$$-${BATS_TEST_NUMBER:-0}"
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
        printf '%s' "${!#}" > "$MOCK_PROMPTS/prompt-$n-$$.txt"
        # MOCK_WAIT_SECOND=1: the first prompt waits (15 s max) for a second
        # one; seeing it while still running proves concurrent workers.
        if [[ -n "${MOCK_WAIT_SECOND:-}" ]] && mkdir "$MOCK_PROMPTS/.first" 2>/dev/null; then
            for _ in $(seq 150); do
                if [[ $(find "$MOCK_PROMPTS" -name 'prompt-*.txt' | wc -l) -ge 2 ]]; then
                    touch "$SCRATCH/concurrent-ok"
                    break
                fi
                sleep 0.1
            done
        fi
        # MOCK_LIMIT_ON="1 3": these prompt numbers hit the context limit.
        case " ${MOCK_LIMIT_ON:-} " in
            *" $n "*)
                echo "Context limit reached - use /compact or /clear"
                exit 0
                ;;
        esac
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
exec bash "$RALPH" --max-iterations="\${STUB_ITERATIONS:-2}" --delay=0 "\$@"
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

# Path of the n-th prompt received by the mock.
prompt_file() {
    local f
    for f in "$MOCK_PROMPTS"/prompt-"$1"-*.txt; do
        echo "$f"
        return 0
    done
}

reset_run() {
    rm -rf "$REPO/.ralph" "$MOCK_PROMPTS"
    mkdir -p "$MOCK_PROMPTS"
    : > "$MOCK_LOG"
}

story_field() {
    STORY_ID="$1" yq ".stories[strenv(STORY_ID)].$2" "$REPO/.bmad/sprint-status.yaml"
}

write_two_stories() {
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

run_conductor() {
    run timeout 300 bash -c "
        source '$RALPH'
        load_messages
        load_modules
        SCRIPT_DIR='$STUB_DIR'
        RALPH_SESSION_BASE='$REPO/.ralph'
        ASC_STOP_WINDOW='23:59'
        cmd_sprint_conductor $* Sprint-1
    "
}

# Compaction scenario reaching max_compacts: 1 on the second limit (prompt 3).
write_max_compacts_config() {
    printf 'context:\n  max_compacts: 1\n  preventive_threshold: 0\n' > "$REPO/ralph.yml"
}

CONT_HEADERS=(
    "en:# Sprint Continuation"
    "fr:# Continuation du Sprint"
    "es:# Continuación del Sprint"
    "de:# Sprint-Fortsetzung"
    "pt:# Continuação do Sprint"
)
HANDOFF_HEADERS=(
    "en:# New Continuation Session"
    "fr:# Nouvelle Session de Continuation"
    "es:# Nueva Sesión de Continuación"
    "de:# Neue Fortsetzungssitzung"
    "pt:# Nova Sessão de Continuação"
)

# ─────────────────────────────────────────────────────────────────────────────
# (a) Parallel workers really run concurrently and are counted.
# ─────────────────────────────────────────────────────────────────────────────

@test "conductor: --parallel 2 runs 2 workers concurrently and counts them" {
    command -v yq
    cd "$REPO"
    write_two_stories
    export MOCK_WAIT_SECOND=1 STUB_ITERATIONS=1
    run_conductor --parallel 2
    echo "$output"; dump_prompts

    [ "$status" -eq 0 ]
    [ -f "$SCRATCH/concurrent-ok" ]
    echo "$output" | grep -qE "Sessions spawned: +2"
}

@test "conductor: --parallel 1 frees the slot and spawns the second wave" {
    command -v yq
    cd "$REPO"
    write_two_stories
    export STUB_ITERATIONS=1
    run_conductor --parallel 1
    echo "$output"; dump_prompts

    [ "$status" -eq 0 ]
    echo "$output" | grep -qE "Sessions spawned: +2"
    grep -q "First story" "$MOCK_PROMPTS"/prompt-*.txt
    grep -q "Second story" "$MOCK_PROMPTS"/prompt-*.txt
}

# ─────────────────────────────────────────────────────────────────────────────
# (b) Story ids are data for yq, never expressions.
# ─────────────────────────────────────────────────────────────────────────────

@test "conductor: dashed ids and a yq-expression id are claimed, prompted and transitioned" {
    command -v yq
    cd "$REPO"
    mkdir -p .bmad
    cat > .bmad/sprint-status.yaml <<'EOF'
stories:
  US-001:
    title: "Dash story one"
    description: "one"
    status: ready-for-dev
  US-002:
    title: "Dash story two"
    description: "two"
    status: ready-for-dev
  'US-3 | .pwned = 1':
    title: "Expression story"
    description: "three"
    status: ready-for-dev
EOF
    run_conductor
    echo "$output"; dump_prompts; cat .bmad/sprint-status.yaml

    [ "$status" -eq 0 ]
    local id
    for id in "US-001" "US-002" "US-3 | .pwned = 1"; do
        [[ "$(story_field "$id" claimed_by)" == ASC-* ]]
        [ "$(story_field "$id" status)" = "blocked" ]
    done
    grep -q "Dash story one" "$MOCK_PROMPTS"/prompt-*.txt
    grep -q "Dash story two" "$MOCK_PROMPTS"/prompt-*.txt
    grep -q "Expression story" "$MOCK_PROMPTS"/prompt-*.txt
    [ "$(yq '[.. | select(tag == "!!map" and has("pwned"))] | length' .bmad/sprint-status.yaml)" = "0" ]
}

# ─────────────────────────────────────────────────────────────────────────────
# (c) Continuation and handoff prompts follow --lang.
# ─────────────────────────────────────────────────────────────────────────────

@test "prompt: reactive compaction continuation prompt is in the --lang language" {
    cd "$REPO"
    local entry lang header
    for entry in "${CONT_HEADERS[@]}"; do
        lang="${entry%%:*}"; header="${entry#*:}"
        reset_run
        MOCK_LIMIT_ON=1 MOCK_CONTEXT_PCT=97 run bash "$RALPH" --lang="$lang" --max-iterations=1 --delay=0 "hello"
        echo "[$lang]"; dump_prompts

        [ -f "$(prompt_file 2)" ]
        grep -qF "$header" "$(prompt_file 2)"
        grep -q "hello" "$(prompt_file 2)"
        if [ "$lang" = "en" ]; then
            ! grep -qE "Vous reprenez|Continuez|Lisez" "$(prompt_file 2)"
        fi
    done
}

@test "prompt: session handoff prompt is in the --lang language" {
    command -v yq
    cd "$REPO"
    write_max_compacts_config
    local entry lang header
    for entry in "${HANDOFF_HEADERS[@]}"; do
        lang="${entry%%:*}"; header="${entry#*:}"
        reset_run
        MOCK_LIMIT_ON="1 3" MOCK_CONTEXT_PCT=97 run bash "$RALPH" --lang="$lang" --max-iterations=2 --delay=0 "hello"
        echo "[$lang] $output"; dump_prompts

        [ -f "$(prompt_file 4)" ]
        grep -qF "$header" "$(prompt_file 4)"
        if [ "$lang" = "en" ]; then
            ! grep -qE "Cette session|Reprenez" "$(prompt_file 4)"
        fi
    done
}

@test "context: below-minimum message substitutes {0} and {1}" {
    cd "$REPO"
    MOCK_LIMIT_ON=1 MOCK_CONTEXT_PCT=10 run bash "$RALPH" --lang=fr --verbose --max-iterations=1 --delay=0 "hello"
    echo "$output"

    echo "$output" | grep -q "Contexte à 10%"
    echo "$output" | grep -q "(50%)"
    ! echo "$output" | grep -qF "{0}"
    ! echo "$output" | grep -qF "{1}"
}

# ─────────────────────────────────────────────────────────────────────────────
# (d) max_compacts reached in reactive compaction switches Claude session.
# ─────────────────────────────────────────────────────────────────────────────

@test "context: max_compacts 1 switches to a continuation session with a new Claude id" {
    command -v yq
    cd "$REPO"
    write_max_compacts_config
    MOCK_LIMIT_ON="1 3" MOCK_CONTEXT_PCT=97 run bash "$RALPH" --max-iterations=2 --delay=0 "hello"
    echo "$output"; dump_prompts; cat "$MOCK_LOG"

    echo "$output" | grep -q "Switching to continuation session"
    [ "$(grep -o -- '--session-id [0-9a-fA-F-]*' "$MOCK_LOG" | sort -u | wc -l)" -eq 2 ]
    grep -qF "# New Continuation Session" "$(prompt_file 4)"
}
