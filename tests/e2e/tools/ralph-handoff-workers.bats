#!/usr/bin/env bats
# Session handoff, continuation sessions and parallel workers for Tools/Ralph.
#
# Why: the preventive compaction's "max_compacts reached" return code (3) was
# swallowed by `|| true`, so Ralph kept the exhausted Claude session; the
# continuation id was passed to create_session as a prompt (orphan session dir,
# no state.json for the real id); parallel workers never got --lang; the
# reconstructed context sections were English whatever --lang; failed parallel
# workers were neither counted nor blocked; worker reports and info.yaml were
# heredocs (an id with `"` broke the YAML), story lists were word-split (ids
# with spaces), and `.ralph/stories/${id}.yml` followed `../` in the id.
#
# Like ralph-conductor-sessions.bats, errexit stays ON after sourcing. The mock
# `claude` stores every prompt (last argument) in $MOCK_PROMPTS/prompt-<n>-<pid>.txt;
# the ralph.sh stub logs its arguments (one line per worker) in $RALPH_ARGS_LOG.

setup() {
    PROJECT_ROOT="$(cd "$BATS_TEST_DIRNAME/../../.." && pwd)"
    RALPH="$PROJECT_ROOT/Tools/Ralph/ralph.sh"
    export PROJECT_ROOT RALPH

    # Per-test scratch dir under BATS_TMPDIR (avoid /tmp per project rule).
    SCRATCH="$BATS_TMPDIR/ralph-hw-$$-${BATS_TEST_NUMBER:-0}"
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

    # Stub ralph.sh found through SCRIPT_DIR: logs its arguments, bounds the loop.
    STUB_DIR="$SCRATCH/stub"
    RALPH_ARGS_LOG="$SCRATCH/ralph-args.log"
    mkdir -p "$STUB_DIR"
    : > "$RALPH_ARGS_LOG"
    cat > "$STUB_DIR/ralph.sh" <<EOF
#!/bin/bash
printf '%s\n' "\$*" | tr '\n' ' ' >> "$RALPH_ARGS_LOG"
echo >> "$RALPH_ARGS_LOG"
exec bash "$RALPH" --max-iterations=1 --delay=0 "\$@"
EOF
    chmod +x "$STUB_DIR/ralph.sh"
    export STUB_DIR RALPH_ARGS_LOG
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

story_field() {
    STORY_ID="$1" yq ".stories[strenv(STORY_ID)].$2" "$REPO/.bmad/sprint-status.yaml"
}

write_stories() {
    mkdir -p "$REPO/.bmad"
    cat > "$REPO/.bmad/sprint-status.yaml"
}

# $1 = extra shell lines run before the conductor, then conductor arguments.
run_conductor() {
    local pre="$1"
    shift
    run timeout 300 bash -c "
        source '$RALPH'
        $pre
        load_messages
        load_modules
        SCRIPT_DIR='$STUB_DIR'
        RALPH_SESSION_BASE='$REPO/.ralph'
        ASC_STOP_WINDOW='23:59'
        cmd_sprint_conductor $* Sprint-1
    "
}

# Preventive compaction at 97% >= 90%, max_compacts reached on iteration 3.
write_preventive_config() {
    printf 'context:\n  max_compacts: 1\n  preventive_threshold: 90\n' > "$REPO/ralph.yml"
}

# ─────────────────────────────────────────────────────────────────────────────
# (a) max_compacts reached by the PREVENTIVE compaction switches session.
# ─────────────────────────────────────────────────────────────────────────────

@test "context: preventive max_compacts 1 switches to a continuation session with a handoff prompt" {
    command -v yq
    cd "$REPO"
    write_preventive_config
    MOCK_CONTEXT_PCT=97 run bash "$RALPH" --max-iterations=3 --delay=0 "hello"
    echo "$output"; dump_prompts; cat "$MOCK_LOG"

    echo "$output" | grep -q "Switching to continuation session"
    [ "$(grep -o -- '--session-id [0-9a-fA-F-]*' "$MOCK_LOG" | sort -u | wc -l)" -eq 2 ]
    [ -f "$(prompt_file 3)" ]
    grep -qF "# New Continuation Session" "$(prompt_file 3)"
}

# ─────────────────────────────────────────────────────────────────────────────
# (b) The continuation session is a real session, without orphan directory.
# ─────────────────────────────────────────────────────────────────────────────

@test "session: continuation session has its own state.json and session.log, no orphan dir" {
    command -v yq
    cd "$REPO"
    # Reactive path (limit on prompts 1 and 3): independent from (a).
    printf 'context:\n  max_compacts: 1\n  preventive_threshold: 0\n' > ralph.yml
    MOCK_LIMIT_ON="1 3" MOCK_CONTEXT_PCT=97 run bash "$RALPH" --max-iterations=2 --delay=0 "hello"
    echo "$output"
    ls -la "$REPO/.ralph/sessions"

    local cont_id
    cont_id=$(echo "$output" | grep -o "Switching to continuation session: .*" | head -1 | sed 's/.*: //')
    [ -n "$cont_id" ]
    [ -f "$REPO/.ralph/sessions/$cont_id/state.json" ]
    [ -f "$REPO/.ralph/sessions/$cont_id/session.log" ]
    # Original + continuation, each one a full session.
    [ "$(find "$REPO/.ralph/sessions" -mindepth 1 -maxdepth 1 -type d | wc -l)" -eq 2 ]
    local d
    for d in "$REPO/.ralph/sessions"/*/; do
        [ -f "$d/state.json" ]
    done
    [ "$(jq -r '.previous_session' "$REPO/.ralph/sessions/$cont_id/state.json")" != "null" ]
}

# ─────────────────────────────────────────────────────────────────────────────
# (c) Parallel workers receive the conductor language.
# ─────────────────────────────────────────────────────────────────────────────

@test "conductor: --parallel 2 passes --lang=fr (flag or LANG_ARG) to every worker" {
    command -v yq
    cd "$REPO"
    local variant pre args
    for variant in flag env; do
        rm -rf "$REPO/.ralph"
        : > "$RALPH_ARGS_LOG"
        write_stories <<'EOF'
stories:
  story1:
    title: "First story"
    status: ready-for-dev
  story2:
    title: "Second story"
    status: ready-for-dev
EOF
        if [ "$variant" = flag ]; then
            pre=""; args="--parallel 2 --lang=fr"
        else
            pre="LANG_ARG=fr"; args="--parallel 2"
        fi
        run_conductor "$pre" "$args"
        echo "[$variant] $output"; cat "$RALPH_ARGS_LOG"

        [ "$status" -eq 0 ]
        [ "$(grep -c . "$RALPH_ARGS_LOG")" -eq 2 ]
        [ "$(grep -c -- "--lang=fr" "$RALPH_ARGS_LOG")" -eq 2 ]
    done
}

# ─────────────────────────────────────────────────────────────────────────────
# (d) reconstruct_context sections follow the chosen language.
# ─────────────────────────────────────────────────────────────────────────────

SECTION_HEADERS=(
    "en|## Sprint Progress|## Recent Changes|## Test Status|## Current Task"
    "fr|## Progression du Sprint|## Changements Récents|## État des Tests|## Tâche en Cours"
    "es|## Progreso del Sprint|## Cambios Recientes|## Estado de las Pruebas|## Tarea Actual"
    "de|## Sprint-Fortschritt|## Letzte Änderungen|## Teststatus|## Aktuelle Aufgabe"
    "pt|## Progresso do Sprint|## Alterações Recentes|## Estado dos Testes|## Tarefa Atual"
)

@test "context: reconstruct_context sections are in the chosen language (en fr es de pt)" {
    cd "$REPO"
    local entry lang header
    for entry in "${SECTION_HEADERS[@]}"; do
        lang="${entry%%|*}"
        run bash -c "
            source '$RALPH'
            LANG_ARG='$lang'
            load_messages
            load_modules
            reconstruct_context ralph-test 2> /dev/null
        "
        echo "[$lang] $output"
        [ "$status" -eq 0 ]

        IFS='|' read -r -a headers <<< "${entry#*|}"
        for header in "${headers[@]}"; do
            echo "$output" | grep -qxF "$header"
        done
        if [ "$lang" != "en" ]; then
            ! echo "$output" | grep -qE "^## (Sprint Progress|Recent Changes|Test Status|Current Task)$"
            ! echo "$output" | grep -qE "No sprint progress file found|No uncommitted changes|No current task"
        fi
    done
}

# ─────────────────────────────────────────────────────────────────────────────
# (e) A failed parallel worker is counted as Failed and its story blocked.
# ─────────────────────────────────────────────────────────────────────────────

@test "conductor: failed parallel workers are counted in Failed and stories go to blocked" {
    command -v yq
    cd "$REPO"
    write_stories <<'EOF'
stories:
  story1:
    title: "First story"
    status: ready-for-dev
  story2:
    title: "Second story"
    status: ready-for-dev
EOF
    run_conductor "" --parallel 2
    echo "$output"; cat .bmad/sprint-status.yaml

    [ "$status" -eq 0 ]
    echo "$output" | grep -qE "^  Failed: +2$"
    [ "$(story_field story1 status)" = "blocked" ]
    [ "$(story_field story2 status)" = "blocked" ]
}

# ─────────────────────────────────────────────────────────────────────────────
# (f) Story ids with `"`, spaces or `../` are data, not syntax nor paths.
# ─────────────────────────────────────────────────────────────────────────────

@test "conductor: parallel ids with a quote or a space keep worker reports and the loop intact" {
    command -v yq
    cd "$REPO"
    write_stories <<'EOF'
stories:
  'US 1':
    title: "Space story"
    status: ready-for-dev
  'US"2':
    title: "Quote story"
    status: ready-for-dev
EOF
    run_conductor "" --parallel 2
    echo "$output"; dump_prompts; cat .bmad/sprint-status.yaml

    [ "$status" -eq 0 ]
    echo "$output" | grep -q "Sprint Conductor Summary"
    grep -q "Space story" "$MOCK_PROMPTS"/prompt-*.txt
    grep -q "Quote story" "$MOCK_PROMPTS"/prompt-*.txt
    # No story invented by word-splitting ("US", "1").
    [ "$(yq '.stories | keys | length' .bmad/sprint-status.yaml)" = "2" ]
    [ "$(story_field 'US 1' status)" = "blocked" ]
    [ "$(story_field 'US"2' status)" = "blocked" ]
    echo "$output" | grep -qE "^  Failed: +2$"
}

@test "conductor: a story id with ../ never loads a config outside .ralph/stories/" {
    command -v yq
    cd "$REPO"
    mkdir -p .ralph/stories
    printf 'session:\n  max_iterations: 1\n' > .ralph/evil.yml
    printf 'session:\n  max_iterations: 1\n' > .ralph/stories/US-1.yml
    write_stories <<'EOF'
stories:
  US-1:
    title: "Legit story"
    status: ready-for-dev
  '../evil':
    title: "Traversal story"
    status: ready-for-dev
EOF
    run_conductor ""
    echo "$output"; cat "$RALPH_ARGS_LOG"

    [ "$status" -eq 0 ]
    [ "$(grep -c . "$RALPH_ARGS_LOG")" -eq 2 ]
    grep -qF -- "--config=.ralph/stories/US-1.yml" "$RALPH_ARGS_LOG"
    ! grep -qF "evil.yml" "$RALPH_ARGS_LOG"
}
