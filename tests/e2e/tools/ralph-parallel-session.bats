#!/usr/bin/env bats
# Session isolation tests for Ralph parallel workers (Tools/Ralph/lib/parallel-manager.sh).
#
# Why: invoke_claude() used `claude --continue`, which resumes "the most recent
# conversation in the current directory". Parallel workers all ran in the same
# directory, so they resumed/interleaved the SAME Claude conversation and wrote
# to the SAME working tree. These tests pin the contract:
#   - each Ralph session owns an explicit Claude session UUID
#     (`--session-id <uuid>` on first call, `--resume <uuid>` afterwards);
#   - each parallel worker runs in its own git worktree, removed at the end.
#
# A mock `claude` on the PATH records "<PWD>|<args>" for every invocation.

setup() {
    PROJECT_ROOT="$(cd "$BATS_TEST_DIRNAME/../../.." && pwd)"
    RALPH="$PROJECT_ROOT/Tools/Ralph/ralph.sh"
    RALPH_LIB="$PROJECT_ROOT/Tools/Ralph/lib"
    export PROJECT_ROOT RALPH RALPH_LIB

    # Per-test scratch dir under BATS_TMPDIR (avoid /tmp per project rule).
    SCRATCH="$BATS_TMPDIR/ralph-par-$$-${BATS_TEST_NUMBER:-0}"
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

    # Mock claude: log invocation, leave an uncommitted file behind, report work.
    MOCK_DIR="$SCRATCH/mock"
    mkdir -p "$MOCK_DIR"
    cat > "$MOCK_DIR/claude" <<'EOF'
#!/bin/bash
printf '%s|%s\n' "$PWD" "$(printf '%s ' "$@" | tr '\n' ' ')" >> "$MOCK_LOG"
echo "work" > "mock-output-$$.txt"
echo "implemented the change"
EOF
    chmod +x "$MOCK_DIR/claude"
    export MOCK_LOG="$SCRATCH/claude.log"
    export PATH="$MOCK_DIR:$PATH"

    # Stub ralph.sh found by spawn_session via SCRIPT_DIR: bounds the real loop
    # (yq is absent from the e2e image, so a ralph.yml would be ignored).
    STUB_DIR="$SCRATCH/stub"
    mkdir -p "$STUB_DIR"
    cat > "$STUB_DIR/ralph.sh" <<EOF
#!/bin/bash
exec bash "$RALPH" --max-iterations=2 --delay=1 "\$@"
EOF
    chmod +x "$STUB_DIR/ralph.sh"
    export STUB_DIR
}

teardown() {
    [ -d "$SCRATCH" ] && rm -rf "$SCRATCH"
}

# Print the distinct Claude session UUIDs passed by invocations made from $1.
uuids_for_dir() {
    awk -F'|' -v d="$1" '$1 == d { print $2 }' "$MOCK_LOG" \
        | grep -oE -- '--(session-id|resume) [0-9a-fA-F-]{36}' \
        | awk '{ print $2 }' | sort -u
}

@test "parallel: two workers use distinct explicit Claude sessions in dedicated worktrees" {
    cd "$REPO"
    run bash -c "
        set +e
        source '$RALPH'
        source '$RALPH_LIB/parallel-manager.sh'
        set +eu
        SCRIPT_DIR='$STUB_DIR'
        RALPH_SESSION_BASE='$REPO/.ralph'
        init_parallel_manager
        spawn_session US-1 'Implement US-1' > /dev/null
        spawn_session US-2 'Implement US-2' > /dev/null
        wait_all_sessions 180
    "
    echo "--- manager output ---"; echo "$output"
    echo "--- claude log ---"; cat "$MOCK_LOG" || true

    [ -s "$MOCK_LOG" ]

    # Never rely on "most recent conversation in this directory".
    ! grep -q -- '--continue' "$MOCK_LOG"

    # Two workers, two distinct working directories, none of them the main tree.
    local dirs
    dirs="$(cut -d'|' -f1 "$MOCK_LOG" | sort -u)"
    [ "$(printf '%s\n' "$dirs" | grep -c .)" -eq 2 ]
    ! printf '%s\n' "$dirs" | grep -qxF "$REPO"

    # Exactly one Claude session per worker, and the two sessions differ.
    local all_ids="" d ids
    while IFS= read -r d; do
        ids="$(uuids_for_dir "$d")"
        [ "$(printf '%s\n' "$ids" | grep -c .)" -eq 1 ]
        all_ids+="$ids"$'\n'
    done <<< "$dirs"
    [ "$(printf '%s' "$all_ids" | sort -u | grep -c .)" -eq 2 ]

    # Worktrees cleaned up; per-story branches keep the (WIP-committed) work.
    [ "$(git -C "$REPO" worktree list | wc -l)" -eq 1 ]
    local b
    for story in US-1 US-2; do
        b="$(git -C "$REPO" for-each-ref --format='%(refname:short)' "refs/heads/ralph/PAR-${story}-*")"
        [ -n "$b" ]
        git -C "$REPO" log --format=%s "$b" | grep -q "^wip(ralph): ${story}"
    done
}

@test "sequential: first call uses --session-id, next calls --resume the same UUID" {
    cd "$REPO"
    run bash -c "
        set +e
        source '$RALPH'
        source '$RALPH_LIB/session.sh'
        source '$RALPH_LIB/loop.sh'
        set +eu
        RALPH_SESSION_BASE='$REPO/.ralph'
        sid=\$(create_session 'hello')
        invoke_claude \"\$sid\" 'first' 60000 > /dev/null
        invoke_claude \"\$sid\" 'second' 60000 > /dev/null
    "
    echo "$output"; cat "$MOCK_LOG" || true

    [ "$(wc -l < "$MOCK_LOG")" -eq 2 ]
    ! grep -q -- '--continue' "$MOCK_LOG"

    local first second
    first="$(sed -n 1p "$MOCK_LOG" | grep -oE -- '--session-id [0-9a-fA-F-]{36}' | awk '{print $2}')"
    second="$(sed -n 2p "$MOCK_LOG" | grep -oE -- '--resume [0-9a-fA-F-]{36}' | awk '{print $2}')"
    [ -n "$first" ]
    [ "$first" = "$second" ]

    # The UUID is persisted under .ralph/ so `ralph.sh --continue=<id>` can resume it.
    grep -rqx "$first" "$REPO/.ralph/sessions/"
}
