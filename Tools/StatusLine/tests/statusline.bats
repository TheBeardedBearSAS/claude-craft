#!/usr/bin/env bats
# =============================================================================
# Claude Code Status Line v2.0 — Tests
# =============================================================================
#
# Run with: docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/StatusLine/tests/
# =============================================================================

SCRIPT="/mnt/StatusLine/statusline.sh"

setup() {
    # Install jq in Alpine (bats/bats image is Alpine-based)
    if ! command -v jq &>/dev/null; then
        apk add --no-cache jq >/dev/null 2>&1
    fi

    # Minimal JSON input
    BASIC_JSON='{"model":{"display_name":"Opus","id":"claude-opus-4-6"},"workspace":{"current_dir":"/tmp/test","project_dir":"/tmp/test"},"cost":{"total_cost_usd":0.42}}'

    # JSON with context_window
    CONTEXT_JSON='{"model":{"display_name":"Opus","id":"claude-opus-4-6"},"context_window":{"used_percentage":42,"context_window_size":200000},"cost":{"total_cost_usd":0.5},"workspace":{"current_dir":"/tmp/test","project_dir":"/tmp/test"}}'

    # JSON with agent and vim
    AGENT_VIM_JSON='{"model":{"display_name":"Sonnet","id":"claude-sonnet-4-5"},"workspace":{"current_dir":"/tmp/test","project_dir":"/tmp/test"},"cost":{"total_cost_usd":1.23},"agent":{"name":"tdd-coach"},"vim":{"mode":"normal"}}'

    # JSON with lines and duration (for burn rate)
    FULL_JSON='{"model":{"display_name":"Opus","id":"claude-opus-4-6"},"context_window":{"used_percentage":75},"cost":{"total_cost_usd":3.0,"total_duration_ms":300000,"total_lines_added":156,"total_lines_removed":23},"workspace":{"current_dir":"/tmp/test","project_dir":"/tmp/test"}}'

    # Disable ccusage-dependent features for deterministic tests
    export SHOW_SESSION_LIMIT=false
    export SHOW_WEEKLY_LIMIT=false
    # Disable git to avoid needing a real repo
    export SHOW_GIT=false

    # Ensure clean cache
    rm -rf "${XDG_CACHE_HOME:-$HOME/.cache}/claude-statusline"
}

# ============================================================
# VERSION / HELP
# ============================================================

@test "--version prints version" {
    run bash "$SCRIPT" --version
    [ "$status" -eq 0 ]
    [[ "$output" == *"claude-statusline 2.0.0"* ]]
}

@test "--help prints usage" {
    run bash "$SCRIPT" --help
    [ "$status" -eq 0 ]
    [[ "$output" == *"Claude Code Status Line"* ]]
    [[ "$output" == *"type"* ]]
    [[ "$output" == *"command"* ]]
}

# ============================================================
# BASIC OUTPUT
# ============================================================

@test "basic JSON produces output" {
    run bash -c "echo '$BASIC_JSON' | bash $SCRIPT"
    [ "$status" -eq 0 ]
    [ -n "$output" ]
}

@test "output contains model name" {
    run bash -c "echo '$BASIC_JSON' | bash $SCRIPT"
    [[ "$output" == *"Opus"* ]]
}

@test "output contains project name" {
    run bash -c "echo '$BASIC_JSON' | bash $SCRIPT"
    [[ "$output" == *"test"* ]]
}

@test "output contains cost" {
    run bash -c "echo '$BASIC_JSON' | bash $SCRIPT"
    [[ "$output" == *"0.42"* ]]
}

@test "output contains profile default" {
    unset CLAUDE_CONFIG_DIR
    run bash -c "echo '$BASIC_JSON' | bash $SCRIPT"
    [[ "$output" == *"default"* ]]
}

@test "custom profile from CLAUDE_CONFIG_DIR" {
    export CLAUDE_CONFIG_DIR=/home/user/.claude-profiles/pro
    run bash -c "echo '$BASIC_JSON' | bash $SCRIPT"
    [[ "$output" == *"pro"* ]]
}

# ============================================================
# CONTEXT THRESHOLDS
# ============================================================

@test "context 42% shows green (below warn)" {
    run bash -c "echo '$CONTEXT_JSON' | bash $SCRIPT"
    [[ "$output" == *"42%"* ]]
    # Green color code
    [[ "$output" == *"01;32m"* ]]
}

@test "context 65% shows yellow (between warn and crit)" {
    local json='{"model":{"display_name":"Opus","id":"claude-opus-4-6"},"context_window":{"used_percentage":65},"cost":{"total_cost_usd":0},"workspace":{"current_dir":"/tmp/test","project_dir":"/tmp/test"}}'
    run bash -c "echo '$json' | bash $SCRIPT"
    [[ "$output" == *"65%"* ]]
    # Yellow color code
    [[ "$output" == *"01;33m"* ]]
}

@test "context 85% shows red (above crit)" {
    local json='{"model":{"display_name":"Opus","id":"claude-opus-4-6"},"context_window":{"used_percentage":85},"cost":{"total_cost_usd":0},"workspace":{"current_dir":"/tmp/test","project_dir":"/tmp/test"}}'
    run bash -c "echo '$json' | bash $SCRIPT"
    [[ "$output" == *"85%"* ]]
    # Red color code
    [[ "$output" == *"01;31m"* ]]
}

# ============================================================
# TOGGLE TESTS
# ============================================================

@test "SHOW_PROFILE=false hides profile" {
    export SHOW_PROFILE=false
    run bash -c "echo '$BASIC_JSON' | bash $SCRIPT"
    [[ "$output" != *"default"* ]]
}

@test "SHOW_MODEL=false hides model" {
    export SHOW_MODEL=false
    run bash -c "echo '$BASIC_JSON' | bash $SCRIPT"
    [[ "$output" != *"Opus"* ]]
}

@test "SHOW_COST=false hides cost" {
    export SHOW_COST=false
    run bash -c "echo '$BASIC_JSON' | bash $SCRIPT"
    [[ "$output" != *"0.42"* ]]
}

@test "SHOW_TIME=false hides time" {
    export SHOW_TIME=false
    run bash -c "echo '$BASIC_JSON' | bash $SCRIPT"
    [[ "$output" != *"🕐"* ]]
}

# ============================================================
# AGENT & VIM
# ============================================================

@test "agent name displayed when present" {
    run bash -c "echo '$AGENT_VIM_JSON' | bash $SCRIPT"
    [[ "$output" == *"@tdd-coach"* ]]
}

@test "vim mode displayed uppercase" {
    run bash -c "echo '$AGENT_VIM_JSON' | bash $SCRIPT"
    [[ "$output" == *"NORMAL"* ]]
}

@test "agent hidden when SHOW_AGENT=false" {
    export SHOW_AGENT=false
    run bash -c "echo '$AGENT_VIM_JSON' | bash $SCRIPT"
    [[ "$output" != *"@tdd-coach"* ]]
}

# ============================================================
# PROGRESS BAR
# ============================================================

@test "CONTEXT_BAR_STYLE=bar shows bar" {
    export CONTEXT_BAR_STYLE=bar
    run bash -c "echo '$CONTEXT_JSON' | bash $SCRIPT"
    [[ "$output" == *"▓"* ]]
    [[ "$output" == *"░"* ]]
}

@test "CONTEXT_BAR_STYLE=both shows bar and percentage" {
    export CONTEXT_BAR_STYLE=both
    run bash -c "echo '$CONTEXT_JSON' | bash $SCRIPT"
    [[ "$output" == *"▓"* ]]
    [[ "$output" == *"42%"* ]]
}

# ============================================================
# DISPLAY MODES
# ============================================================

@test "compact mode produces single line" {
    export STATUSLINE_MODE=compact
    run bash -c "echo '$BASIC_JSON' | bash $SCRIPT"
    local lines=$(echo "$output" | wc -l)
    [ "$lines" -eq 1 ]
}

@test "detailed mode produces two lines" {
    export STATUSLINE_MODE=detailed
    run bash -c "echo '$CONTEXT_JSON' | bash $SCRIPT"
    local lines=$(echo "$output" | wc -l)
    [ "$lines" -eq 2 ]
}

# ============================================================
# BURN RATE & LINES CHANGED
# ============================================================

@test "burn rate shown when SHOW_BURN_RATE=true" {
    export SHOW_BURN_RATE=true
    run bash -c "echo '$FULL_JSON' | bash $SCRIPT"
    [[ "$output" == *"/min"* ]]
}

@test "lines changed shown when SHOW_LINES_CHANGED=true in detailed mode" {
    export SHOW_LINES_CHANGED=true
    export STATUSLINE_MODE=detailed
    run bash -c "echo '$FULL_JSON' | bash $SCRIPT"
    [[ "$output" == *"+156"* ]]
    [[ "$output" == *"-23"* ]]
}

# ============================================================
# EDGE CASES
# ============================================================

@test "empty JSON does not crash" {
    run bash -c "echo '{}' | bash $SCRIPT"
    [ "$status" -eq 0 ]
}

@test "minimal JSON with only model" {
    run bash -c "echo '{\"model\":{\"display_name\":\"Test\"}}' | bash $SCRIPT"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Test"* ]]
}

@test "model emoji for sonnet" {
    run bash -c "echo '$AGENT_VIM_JSON' | bash $SCRIPT"
    [[ "$output" == *"🎵"* ]]
}
