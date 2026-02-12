#!/usr/bin/env bats
# =============================================================================
# Tests for claude-accounts.sh
# Run: docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/MultiAccount/tests/
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
SCRIPT="$SCRIPT_DIR/claude-accounts.sh"

setup() {
    # Install jq if missing (Alpine-based bats image)
    if ! command -v jq &>/dev/null; then
        apk add --no-cache jq >/dev/null 2>&1 || true
    fi
    # Create isolated test environment
    export TEST_DIR=$(mktemp -d)
    export HOME="$TEST_DIR"
    export CLAUDE_PROFILES_DIR="$TEST_DIR/.claude-profiles"
    mkdir -p "$CLAUDE_PROFILES_DIR"
    export PATH="/usr/bin:/usr/local/bin:/bin:$PATH"
    # Create a minimal shell RC
    export SHELL="/bin/bash"
    touch "$TEST_DIR/.bashrc"
}

teardown() {
    rm -rf "$TEST_DIR"
}

# =============================================================================
# Version
# =============================================================================

@test "--version shows version" {
    run bash "$SCRIPT" --version
    [ "$status" -eq 0 ]
    [[ "$output" == "claude-accounts "* ]]
}

@test "-V shows version" {
    run bash "$SCRIPT" -V
    [ "$status" -eq 0 ]
    [[ "$output" == "claude-accounts "* ]]
}

@test "--json --version shows JSON" {
    run bash "$SCRIPT" --json --version
    [ "$status" -eq 0 ]
    echo "$output" | jq -e '.version' >/dev/null
}

# =============================================================================
# sanitize_name (tested via add)
# =============================================================================

@test "add sanitizes profile name (lowercase, remove spaces)" {
    run bash "$SCRIPT" add "My Profile"
    [ "$status" -eq 0 ]
    [ -d "$CLAUDE_PROFILES_DIR/my-profile" ]
}

@test "add sanitizes profile name (special chars)" {
    run bash "$SCRIPT" add "test@foo!bar"
    [ "$status" -eq 0 ]
    [ -d "$CLAUDE_PROFILES_DIR/testfoobar" ]
}

# =============================================================================
# Profile CRUD
# =============================================================================

@test "add creates profile directory" {
    run bash "$SCRIPT" add testprofile
    [ "$status" -eq 0 ]
    [ -d "$CLAUDE_PROFILES_DIR/testprofile" ]
}

@test "add sets permissions 0700" {
    run bash "$SCRIPT" add secureprofile
    [ "$status" -eq 0 ]
    local perms
    perms=$(stat -c '%a' "$CLAUDE_PROFILES_DIR/secureprofile" 2>/dev/null || stat -f '%Lp' "$CLAUDE_PROFILES_DIR/secureprofile")
    [ "$perms" = "700" ]
}

@test "add rejects duplicate profile" {
    bash "$SCRIPT" add duptest
    run bash "$SCRIPT" add duptest
    [ "$status" -ne 0 ]
}

@test "list shows profiles" {
    bash "$SCRIPT" add myprofile
    run bash "$SCRIPT" list
    [ "$status" -eq 0 ]
    [[ "$output" == *"myprofile"* ]]
}

@test "rm deletes profile with --force" {
    bash "$SCRIPT" add todelete
    [ -d "$CLAUDE_PROFILES_DIR/todelete" ]
    run bash "$SCRIPT" rm todelete --force
    [ "$status" -eq 0 ]
    [ ! -d "$CLAUDE_PROFILES_DIR/todelete" ]
}

@test "rm creates backup before deletion" {
    bash "$SCRIPT" add backuptest
    run bash "$SCRIPT" rm backuptest --force
    [ "$status" -eq 0 ]
    [ -f "$CLAUDE_PROFILES_DIR/backuptest.backup.tar.gz" ]
}

@test "rm nonexistent profile returns exit code 3" {
    run bash "$SCRIPT" rm nonexistent --force
    [ "$status" -eq 3 ]
}

# =============================================================================
# run / auth validation
# =============================================================================

@test "run nonexistent profile returns exit code 3" {
    run bash "$SCRIPT" run nonexistent
    [ "$status" -eq 3 ]
}

@test "auth nonexistent profile returns exit code 3" {
    run bash "$SCRIPT" auth nonexistent
    [ "$status" -eq 3 ]
}

# =============================================================================
# --json output
# =============================================================================

@test "--json list outputs valid JSON" {
    bash "$SCRIPT" add jsontest
    run bash "$SCRIPT" --json list
    [ "$status" -eq 0 ]
    echo "$output" | jq -e '.profiles' >/dev/null
}

@test "--json list contains profile data" {
    bash "$SCRIPT" add jsondata
    run bash "$SCRIPT" --json list
    [ "$status" -eq 0 ]
    local name
    name=$(echo "$output" | jq -r '.profiles[0].name')
    [ "$name" = "jsondata" ]
}

@test "--json list shows authenticated false when no credentials" {
    bash "$SCRIPT" add noauth
    run bash "$SCRIPT" --json list
    [ "$status" -eq 0 ]
    local auth
    auth=$(echo "$output" | jq -r '.profiles[0].authenticated')
    [ "$auth" = "false" ]
}

@test "--json list empty returns empty array" {
    rm -rf "$CLAUDE_PROFILES_DIR"/*
    run bash "$SCRIPT" --json list
    [ "$status" -eq 0 ]
    local count
    count=$(echo "$output" | jq '.profiles | length')
    [ "$count" -eq 0 ]
}

# =============================================================================
# Exit codes
# =============================================================================

@test "unknown command returns exit code 2" {
    run bash "$SCRIPT" unknowncmd
    [ "$status" -eq 2 ]
}

@test "help returns exit code 0" {
    run bash "$SCRIPT" help
    [ "$status" -eq 0 ]
}

# =============================================================================
# Doctor
# =============================================================================

@test "doctor runs without error" {
    bash "$SCRIPT" add healthcheck
    run bash "$SCRIPT" doctor
    [ "$status" -eq 0 ]
}

@test "doctor detects permission issues" {
    bash "$SCRIPT" add permtest
    chmod 0755 "$CLAUDE_PROFILES_DIR/permtest"
    run bash "$SCRIPT" doctor
    [ "$status" -eq 0 ]
    [[ "$output" == *"0700"* ]]
}

@test "doctor on empty profiles shows warning" {
    rm -rf "$CLAUDE_PROFILES_DIR"/*
    run bash "$SCRIPT" doctor
    [ "$status" -eq 0 ]
}
