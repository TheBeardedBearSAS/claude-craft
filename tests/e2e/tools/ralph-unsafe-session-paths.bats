#!/usr/bin/env bats
# Unsafe story ids and leader state for Tools/Ralph parallel sessions.
#
# Why: is_story_in_progress looked the story id up as a PARALLEL_SESSIONS key
# (keys are session ids, values story ids), so a story with a running worker
# was not seen as in progress; the session id embedded the raw story id, so a
# `/` or `../` in it created directories outside .ralph/parallel/sessions/ and
# a space made `git worktree add -b ralph/<session>` fail (worker sharing the
# leader's directory); cmd_sprint_conductor read --lang after the messages
# were loaded, so the leader kept its English messages.
#
# Like ralph-handoff-workers.bats, errexit stays ON after sourcing. The mock
# `claude` logs "$PWD|args" in $MOCK_LOG; the ralph.sh stub (found through
# SCRIPT_DIR) runs the real ralph.sh with one iteration.

setup() {
    PROJECT_ROOT="$(cd "$BATS_TEST_DIRNAME/../../.." && pwd)"
    RALPH="$PROJECT_ROOT/Tools/Ralph/ralph.sh"
    export PROJECT_ROOT RALPH

    # Per-test scratch dir under BATS_TMPDIR (avoid /tmp per project rule).
    SCRATCH="$BATS_TMPDIR/ralph-usp-$$-${BATS_TEST_NUMBER:-0}"
    mkdir -p "$SCRATCH"
    SCRATCH="$(cd "$SCRATCH" && pwd)"
    export SCRATCH

    export GIT_AUTHOR_NAME="Ralph Test" GIT_AUTHOR_EMAIL="ralph@test.local"
    export GIT_COMMITTER_NAME="Ralph Test" GIT_COMMITTER_EMAIL="ralph@test.local"

    # The repo is nested so that `../` ids have room to escape it.
    REPO="$SCRATCH/a/b/repo"
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
    *" /context "*) echo "Context: 12%" ;;
    *" /compact "*) echo "compacted" ;;
    *) echo "implemented the change" ;;
esac
EOF
    chmod +x "$MOCK_DIR/claude"
    export MOCK_LOG="$SCRATCH/claude.log"
    : > "$MOCK_LOG"
    export PATH="$MOCK_DIR:$PATH"

    STUB_DIR="$SCRATCH/stub"
    mkdir -p "$STUB_DIR"
    cat > "$STUB_DIR/ralph.sh" <<EOF
#!/bin/bash
exec bash "$RALPH" --max-iterations=1 --delay=0 "\$@"
EOF
    chmod +x "$STUB_DIR/ralph.sh"
    export STUB_DIR
}

teardown() {
    [ -d "$SCRATCH" ] && rm -rf "$SCRATCH"
}

# Every path under $SCRATCH, except git internals and test bookkeeping.
snapshot() {
    find "$SCRATCH" -name .git -prune -o -print \
        | grep -vE "^$SCRATCH/(mock|stub|snap|claude\.log)" | sort
}
export -f snapshot

# $1 = story id: spawn one parallel worker from the leader, wait for it.
run_spawn() {
    run timeout 120 bash -c "
        source '$RALPH'
        load_messages
        load_modules
        SCRIPT_DIR='$STUB_DIR'
        RALPH_SESSION_BASE='$REPO/.ralph'
        cd '$REPO'
        init_parallel_manager
        mkdir -p '$SCRATCH/snap'
        snapshot > '$SCRATCH/snap/before.txt'
        spawn_session \"\$1\" 'Implement it'
        wait_all_sessions 0
        snapshot > '$SCRATCH/snap/after.txt'
    " _ "$1"
}

# ─────────────────────────────────────────────────────────────────────────────
# (a) A story with a running worker is in progress, whatever its YAML status.
# ─────────────────────────────────────────────────────────────────────────────

@test "conductor: is_story_in_progress is true while a parallel worker runs the story" {
    command -v yq
    cd "$REPO"
    mkdir -p .bmad
    printf 'stories:\n  US-1:\n    title: "First"\n    status: ready-for-dev\n' > .bmad/sprint-status.yaml
    run timeout 120 bash -c "
        source '$RALPH'
        load_messages
        load_modules
        SCRIPT_DIR='$STUB_DIR'
        RALPH_SESSION_BASE='$REPO/.ralph'
        init_parallel_manager
        spawn_session US-1 'Implement it'
        if is_story_in_progress US-1; then echo 'US-1: IN-PROGRESS'; else echo 'US-1: IDLE'; fi
        if is_story_in_progress US-2; then echo 'US-2: IN-PROGRESS'; else echo 'US-2: IDLE'; fi
        wait_all_sessions 0
    "
    echo "$output"

    [ "$status" -eq 0 ]
    echo "$output" | grep -qx "US-1: IN-PROGRESS"
    echo "$output" | grep -qx "US-2: IDLE"
}

# ─────────────────────────────────────────────────────────────────────────────
# (b) `/` and `../` in a story id never create paths outside the parallel dirs.
# ─────────────────────────────────────────────────────────────────────────────

@test "parallel: story ids with / or ../ create nothing outside sessions/ and worktrees/" {
    command -v yq
    local id allowed new
    allowed="^$REPO/\.ralph/parallel/(sessions|worktrees)(/|$)"
    for id in 'x/../../../../escape' '../../../../escape2' 'a/b'; do
        run_spawn "$id"
        echo "[$id] $output"
        [ "$status" -eq 0 ]

        new=$(comm -13 "$SCRATCH/snap/before.txt" "$SCRATCH/snap/after.txt")
        echo "new paths:"; echo "$new"
        [ -n "$new" ]
        ! echo "$new" | grep -vE "$allowed" || false
        rm -rf "$REPO/.ralph" "$SCRATCH/snap"
    done
}

# ─────────────────────────────────────────────────────────────────────────────
# (c) A story id with a space still gets its own git worktree.
# ─────────────────────────────────────────────────────────────────────────────

@test "parallel: a story id with a space runs in a dedicated worktree on a sanitized branch" {
    command -v yq
    run_spawn "US 1"
    echo "$output"; cat "$MOCK_LOG"; git -C "$REPO" branch --list

    [ "$status" -eq 0 ]
    ! echo "$output" | grep -q "No git worktree" || false
    grep -q "^$REPO/\.ralph/parallel/worktrees/" "$MOCK_LOG"
    ! grep -q "^$REPO|" "$MOCK_LOG" || false
    local branches
    branches=$(git -C "$REPO" for-each-ref --format='%(refname:short)' 'refs/heads/ralph/')
    [ "$(echo "$branches" | grep -c .)" -eq 1 ]
    ! echo "$branches" | grep -q ' ' || false
    # Session directory named after the sanitized id, in sessions/.
    [ "$(find "$REPO/.ralph/parallel/sessions" -mindepth 1 -maxdepth 1 -type d | wc -l)" -eq 1 ]
    ! find "$REPO/.ralph/parallel/sessions" -mindepth 1 -maxdepth 1 -name '* *' | grep -q . || false
}

# ─────────────────────────────────────────────────────────────────────────────
# (d) cmd_sprint_conductor --lang=fr switches the leader messages to French.
# ─────────────────────────────────────────────────────────────────────────────

# $1 = conductor arguments: run it from a leader whose messages are English.
run_conductor_lang() {
    cd "$REPO"
    mkdir -p .bmad
    printf 'stories:\n  US-1:\n    title: "First"\n    status: ready-for-dev\n' > .bmad/sprint-status.yaml
    run timeout 300 bash -c "
        source '$RALPH'
        load_messages
        load_modules
        SCRIPT_DIR='$STUB_DIR'
        RALPH_SESSION_BASE='$REPO/.ralph'
        ASC_STOP_WINDOW='23:59'
        cmd_sprint_conductor $1 Sprint-1
    "
    echo "$output"
}

@test "conductor: --lang=fr prints the leader output (log lines, summary) in French" {
    command -v yq
    run_conductor_lang "--lang=fr"

    [ "$status" -eq 0 ]
    echo "$output" | grep -qF "Conducteur de sprint autonome (ASC)"
    echo "$output" | grep -qF "[ASC] Mode SÉQUENTIEL"
    echo "$output" | grep -qF "[ASC] Traitement de la story : US-1"
    echo "$output" | grep -qF "[ASC] Échec de la story : US-1"
    echo "$output" | grep -qF "[ASC] Plus aucune story disponible"
    echo "$output" | grep -qF "Résumé du conducteur de sprint"
    echo "$output" | grep -qE "^  Échecs : +1$"
    # No English leader line left (the summary's escalation keys come from jq).
    ! echo "$output" | grep -qE "\[ASC\] (Running in|Processing story|Story failed|No more stories|Sprint Conductor completed)" || false
    ! echo "$output" | grep -qE "Sprint Conductor Summary|^  Failed:|^Stories:|Autonomous Sprint Conductor" || false
}

@test "conductor: without --lang the leader output stays in English" {
    command -v yq
    run_conductor_lang ""

    [ "$status" -eq 0 ]
    echo "$output" | grep -qF "Autonomous Sprint Conductor (ASC)"
    echo "$output" | grep -qF "[ASC] Running in SEQUENTIAL mode"
    echo "$output" | grep -qF "[ASC] Processing story: US-1"
    echo "$output" | grep -qF "[ASC] Transitioned US-1 to blocked"
    echo "$output" | grep -qF "Sprint Conductor Summary"
    echo "$output" | grep -qE "^  Completed: 0$"
    echo "$output" | grep -qE "^  Failed:    1$"
    echo "$output" | grep -qE "^  Skipped:   0$"
}
