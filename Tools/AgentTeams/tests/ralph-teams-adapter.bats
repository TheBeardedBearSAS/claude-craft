#!/usr/bin/env bats
# =============================================================================
# Tests for ralph-teams-adapter.sh
# Run: docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/AgentTeams/tests/ralph-teams-adapter.bats
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
LIB="$SCRIPT_DIR/lib/ralph-teams-adapter.sh"

setup() {
    export TEST_DIR=$(mktemp -d)
    export TEAMS_DRY_RUN="false"
    export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=""
    export TEAMS_WATCHDOG_INTERVAL=60
    export TEAMS_WATCHDOG_TIMEOUT=300
}

teardown() {
    rm -rf "$TEST_DIR"
}

# Helper: source the library in a clean subshell and run commands
# We need to re-source each time because the library has global state
_source_and_run() {
    (
        source "$LIB"
        "$@"
    )
}

# =============================================================================
# teams_is_available()
# =============================================================================

@test "teams_is_available returns true when env var is set to 1" {
    run bash -c "
        export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
        source '$LIB'
        teams_is_available && echo 'available'
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"available"* ]]
}

@test "teams_is_available returns false when env var is not set" {
    run bash -c "
        unset CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS
        source '$LIB'
        teams_is_available && echo 'available' || echo 'not available'
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"not available"* ]]
}

@test "teams_is_available returns false when env var is 0" {
    run bash -c "
        export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=0
        source '$LIB'
        teams_is_available && echo 'available' || echo 'not available'
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"not available"* ]]
}

# =============================================================================
# teams_init()
# =============================================================================

@test "teams_init creates session directory and log file" {
    run bash -c "
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        [ -d '$TEST_DIR/session' ] && echo 'dir_ok'
        [ -f '$TEST_DIR/session/adapter.log' ] && echo 'log_ok'
        [ -f '$TEST_DIR/session/state.yaml' ] && echo 'state_ok'
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"dir_ok"* ]]
    [[ "$output" == *"log_ok"* ]]
    [[ "$output" == *"state_ok"* ]]
}

@test "teams_init twice is idempotent (already initialized)" {
    run bash -c "
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_init '$TEST_DIR/session' 2>&1
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"Already initialized"* ]]
}

# =============================================================================
# teams_create_team()
# =============================================================================

@test "teams_create_team registers teammates correctly" {
    run bash -c "
        export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        # Redirect stdout to file instead of \$() to avoid subshell losing associative array state
        teams_create_team 'conductor' 3 > '$TEST_DIR/team_id.txt' 2>/dev/null
        echo \"team_id=\$(cat '$TEST_DIR/team_id.txt')\"
        idle=\$(teams_get_idle_teammates)
        echo \"idle_count=\$(echo \"\$idle\" | wc -l)\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"team_id=team-ralph-"* ]]
    [[ "$output" == *"idle_count=3"* ]]
}

@test "teams_create_team in dry-run mode" {
    run bash -c "
        export TEAMS_DRY_RUN=true
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        team_id=\$(teams_create_team 'conductor' 2 2>/dev/null)
        echo \"team_id=\$team_id\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"team_id=dry-run-team-"* ]]
}

@test "teams_create_team in fallback mode (no Agent Teams)" {
    run bash -c "
        unset CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        team_id=\$(teams_create_team 'conductor' 2 2>/dev/null)
        echo \"team_id=\$team_id\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"team_id=fallback-"* ]]
}

# =============================================================================
# teams_assign_story()
# =============================================================================

@test "teams_assign_story assigns to idle teammate" {
    run bash -c "
        export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 2 2>/dev/null
        teams_assign_story 'US-001' 'Implement login' 2>/dev/null
        echo \"active=\$(teams_get_active_count)\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"active=1"* ]]
}

@test "teams_assign_story returns 1 when no idle teammate" {
    run bash -c "
        export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 1 2>/dev/null
        teams_assign_story 'US-001' 'Implement login' 2>/dev/null
        # Use || to capture exit code without set -e killing the shell
        exit_code=0
        teams_assign_story 'US-002' 'Implement logout' 2>/dev/null || exit_code=\$?
        echo \"exit=\$exit_code\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"exit=1"* ]]
}

@test "teams_assign_story in dry-run mode" {
    run bash -c "
        export TEAMS_DRY_RUN=true
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 1 2>/dev/null
        teams_assign_story 'US-001' 'Implement login' 2>&1
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"DRY-RUN"* ]]
    [[ "$output" == *"Would assign story US-001"* ]]
}

# =============================================================================
# teams_mark_completed() / teams_mark_failed()
# =============================================================================

@test "teams_mark_completed updates counters and status" {
    run bash -c "
        export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 1 2>/dev/null
        teams_assign_story 'US-001' 'Implement login' 2>/dev/null
        teams_mark_completed 'US-001' 2>/dev/null
        echo \"active=\$(teams_get_active_count)\"
        idle=\$(teams_get_idle_teammates)
        echo \"idle=\$idle\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"active=0"* ]]
    [[ "$output" == *"idle=dev-1"* ]]
}

@test "teams_mark_failed updates counters and status" {
    run bash -c "
        export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 1 2>/dev/null
        teams_assign_story 'US-002' 'Broken feature' 2>/dev/null
        teams_mark_failed 'US-002' 2>/dev/null
        echo \"active=\$(teams_get_active_count)\"
        status_json=\$(teams_get_status)
        failed=\$(echo \"\$status_json\" | grep -o '\"failed\": [0-9]*' | head -1)
        echo \"failed_line=\$failed\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"active=0"* ]]
    [[ "$output" == *"failed_line=\"failed\": 1"* ]]
}

@test "teams_mark_completed returns 1 for unknown story" {
    run bash -c "
        export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 1 2>/dev/null
        # Use || to capture exit code without set -e killing the shell
        exit_code=0
        teams_mark_completed 'UNKNOWN-999' 2>/dev/null || exit_code=\$?
        echo \"exit=\$exit_code\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"exit=1"* ]]
}

# =============================================================================
# teams_get_idle_teammates() / teams_get_active_count()
# =============================================================================

@test "teams_get_idle_teammates returns correct list" {
    run bash -c "
        export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 3 2>/dev/null
        teams_assign_story 'US-001' 'Task 1' 2>/dev/null
        idle_count=\$(teams_get_idle_teammates | wc -l)
        echo \"idle_count=\$idle_count\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"idle_count=2"* ]]
}

@test "teams_get_active_count returns correct count" {
    run bash -c "
        export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 3 2>/dev/null
        teams_assign_story 'US-001' 'Task 1' 2>/dev/null
        teams_assign_story 'US-002' 'Task 2' 2>/dev/null
        echo \"active=\$(teams_get_active_count)\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"active=2"* ]]
}

# =============================================================================
# teams_watchdog()
# =============================================================================

@test "teams_watchdog detects stalled teammates" {
    run bash -c "
        export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
        export TEAMS_WATCHDOG_TIMEOUT=1
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 1 2>/dev/null
        teams_assign_story 'US-001' 'Task 1' 2>/dev/null
        # Fake old timestamp to simulate stall
        _TEAMS_TEAMMATE_LAST_SEEN['dev-1']=1000000
        teams_watchdog 2>&1
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"WATCHDOG"* ]]
    [[ "$output" == *"unresponsive"* ]]
}

@test "teams_watchdog warns at half-timeout" {
    run bash -c "
        export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
        export TEAMS_WATCHDOG_TIMEOUT=600
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 1 2>/dev/null
        teams_assign_story 'US-001' 'Task 1' 2>/dev/null
        # Set last_seen to ~half timeout ago
        _TEAMS_TEAMMATE_LAST_SEEN['dev-1']=\$((  \$(date +%s) - 350 ))
        teams_watchdog 2>&1
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"WATCHDOG: Warning"* ]]
}

# =============================================================================
# teams_fallback_sequential()
# =============================================================================

@test "teams_fallback_sequential removes assignment and marks shutdown" {
    run bash -c "
        export TEAMS_DRY_RUN=true
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 1 2>/dev/null
        teams_assign_story 'US-001' 'Task 1' 2>/dev/null
        teams_fallback_sequential 'US-001' 'dev-1' 2>&1
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"DRY-RUN"* ]]
    [[ "$output" == *"Would fallback story US-001"* ]]
}

# =============================================================================
# teams_cleanup()
# =============================================================================

@test "teams_cleanup shuts down all teammates" {
    run bash -c "
        export TEAMS_DRY_RUN=true
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 2 2>/dev/null
        teams_cleanup 2>&1
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"DRY-RUN"* ]]
    [[ "$output" == *"Would clean up team"* ]]
}

# =============================================================================
# teams_get_status()
# =============================================================================

@test "teams_get_status returns valid JSON" {
    run bash -c "
        export TEAMS_DRY_RUN=true
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 1 2>/dev/null
        status_json=\$(teams_get_status)
        echo \"\$status_json\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"\"version\":"* ]]
    [[ "$output" == *"\"initialized\": true"* ]]
    [[ "$output" == *"\"dry_run\": true"* ]]
    [[ "$output" == *"\"teammates\":"* ]]
    [[ "$output" == *"\"stories\":"* ]]
}

# =============================================================================
# teams_wait_completion() dry-run
# =============================================================================

@test "teams_wait_completion in dry-run mode completes instantly" {
    run bash -c "
        export TEAMS_DRY_RUN=true
        source '$LIB'
        teams_init '$TEST_DIR/session' 2>/dev/null
        teams_create_team 'conductor' 1 2>/dev/null
        teams_assign_story 'US-001' 'Task 1' 2>/dev/null
        teams_wait_completion 5 2>&1
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"DRY-RUN"* ]]
}

# =============================================================================
# CLI Interface
# =============================================================================

@test "CLI: cmd_teams_adapter help shows usage" {
    run bash -c "
        source '$LIB'
        cmd_teams_adapter help
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"Ralph Teams Adapter"* ]]
    [[ "$output" == *"Usage:"* ]]
    [[ "$output" == *"Commands:"* ]]
}

@test "CLI: cmd_teams_adapter --help shows usage" {
    run bash -c "
        source '$LIB'
        cmd_teams_adapter --help
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"Ralph Teams Adapter"* ]]
}

@test "CLI: cmd_teams_adapter --dry-run init works" {
    run bash -c "
        source '$LIB'
        cmd_teams_adapter --dry-run init '$TEST_DIR/session' 2>&1
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"DRY-RUN"* ]]
}

@test "CLI: script executed directly with help" {
    run bash "$LIB" help
    [ "$status" -eq 0 ]
    [[ "$output" == *"Ralph Teams Adapter"* ]]
}

@test "CLI: unknown command returns error" {
    run bash -c "
        source '$LIB'
        cmd_teams_adapter nonexistent 2>&1
    "
    [ "$status" -eq 1 ]
    [[ "$output" == *"Unknown command"* ]]
}
