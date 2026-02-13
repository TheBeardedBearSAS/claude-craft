#!/usr/bin/env bash
# =============================================================================
# Ralph Teams Adapter - Agent Teams Abstraction Layer
# Encapsulates Agent Teams API behind an interface compatible with
# existing parallel-manager.sh patterns. Falls back to bash-based
# parallelism when Agent Teams is not available.
#
# Requires: CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 (env var)
# Version: 1.0.0
# =============================================================================

set -eo pipefail

# =============================================================================
# Constants & Configuration
# =============================================================================

TEAMS_ADAPTER_VERSION="1.0.0"
TEAMS_ENV_VAR="CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS"
TEAMS_WATCHDOG_INTERVAL="${TEAMS_WATCHDOG_INTERVAL:-60}"   # seconds between health checks
TEAMS_WATCHDOG_TIMEOUT="${TEAMS_WATCHDOG_TIMEOUT:-300}"    # 5 min timeout before fallback
TEAMS_DRY_RUN="${TEAMS_DRY_RUN:-false}"

# B6: Per-task timeout (seconds) — overrides TEAMS_WATCHDOG_TIMEOUT per task type
# Default: 0 = use TEAMS_WATCHDOG_TIMEOUT; set via --timeout-per-task or task type
TEAMS_PER_TASK_TIMEOUT="${TEAMS_PER_TASK_TIMEOUT:-0}"

# Per-task timeout baselines (seconds) = 1.5x estimated duration
declare -A TASK_TYPE_TIMEOUT=(
    [audit]=135       # 1.5 min * 1.5 = 2.25 min = 135s
    [sprint]=1350     # 15 min * 1.5 = 22.5 min = 1350s
    [security]=180    # 2 min * 1.5 = 3 min = 180s
    [delivery]=1800   # 20 min * 1.5 = 30 min = 1800s
)

# A6: Context recovery — completions counter for TaskList re-read suggestion
_TEAMS_COMPLETIONS_SINCE_REREAD=0
TEAMS_REREAD_INTERVAL=5  # suggest re-read every N completions

# State
_TEAMS_INITIALIZED=false
_TEAMS_AVAILABLE=false
_TEAMS_TEAM_ID=""
_TEAMS_LEAD_NAME=""
_TEAMS_SESSION_DIR=""
_TEAMS_LOG_FILE=""

# Teammate tracking
declare -A _TEAMS_TEAMMATES        # name -> agent mapping
declare -A _TEAMS_TEAMMATE_STATUS  # name -> status (idle|working|stalled|shutdown)
declare -A _TEAMS_TEAMMATE_LAST_SEEN  # name -> unix timestamp of last activity
declare -A _TEAMS_STORY_ASSIGNMENT    # story_id -> teammate_name

# Counters
_TEAMS_STORIES_ASSIGNED=0
_TEAMS_STORIES_COMPLETED=0
_TEAMS_STORIES_FAILED=0
_TEAMS_WATCHDOG_PID=""

# =============================================================================
# Detection & Initialization
# =============================================================================

# Check if Agent Teams feature is available
teams_is_available() {
    [[ "${CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS:-0}" == "1" ]]
}

# Initialize the adapter layer
# Usage: teams_init [--dry-run] [session_dir]
teams_init() {
    local session_dir="${1:-.ralph/agent-teams}"

    if [[ "$_TEAMS_INITIALIZED" == "true" ]]; then
        _teams_log "Already initialized"
        return 0
    fi

    _TEAMS_SESSION_DIR="$session_dir"
    mkdir -p "$_TEAMS_SESSION_DIR"
    _TEAMS_LOG_FILE="$_TEAMS_SESSION_DIR/adapter.log"

    _teams_log "Initializing Ralph Teams Adapter v${TEAMS_ADAPTER_VERSION}"

    # Check Agent Teams availability
    if teams_is_available; then
        _TEAMS_AVAILABLE=true
        _teams_log "Agent Teams feature detected (${TEAMS_ENV_VAR}=1)"
    else
        _TEAMS_AVAILABLE=false
        _teams_log "Agent Teams not available, will use fallback mode"
    fi

    if [[ "$TEAMS_DRY_RUN" == "true" ]]; then
        _teams_log "[DRY-RUN] Adapter initialized in dry-run mode"
    fi

    # Write state file
    _teams_write_state "initialized"

    _TEAMS_INITIALIZED=true
    return 0
}

# =============================================================================
# Team Lifecycle
# =============================================================================

# Create a team with conductor (lead) and dev agents
# Usage: teams_create_team <lead_name> <dev_count>
# Example: teams_create_team "ralph-conductor" 1
teams_create_team() {
    local lead_name="${1:?Lead name required}"
    local dev_count="${2:-1}"

    _teams_require_init

    _TEAMS_LEAD_NAME="$lead_name"

    if [[ "$TEAMS_DRY_RUN" == "true" ]]; then
        _teams_log "[DRY-RUN] Would create team: lead=$lead_name, dev_agents=$dev_count"
        _TEAMS_TEAM_ID="dry-run-team-$(date +%s)"
        for i in $(seq 1 "$dev_count"); do
            local dev_name="dev-${i}"
            _TEAMS_TEAMMATES["$dev_name"]="dev"
            _TEAMS_TEAMMATE_STATUS["$dev_name"]="idle"
            _TEAMS_TEAMMATE_LAST_SEEN["$dev_name"]=$(date +%s)
        done
        _teams_write_state "team_created"
        echo "$_TEAMS_TEAM_ID"
        return 0
    fi

    if [[ "$_TEAMS_AVAILABLE" != "true" ]]; then
        _teams_log "Agent Teams not available, team creation skipped (fallback mode)"
        _TEAMS_TEAM_ID="fallback-$$"
        _teams_write_state "fallback_mode"
        echo "$_TEAMS_TEAM_ID"
        return 0
    fi

    _teams_log "Creating team: lead=$lead_name, dev_agents=$dev_count"

    # Generate team ID
    _TEAMS_TEAM_ID="team-ralph-$(date +%s)-$$"

    # Register teammates
    for i in $(seq 1 "$dev_count"); do
        local dev_name="dev-${i}"
        _TEAMS_TEAMMATES["$dev_name"]="dev"
        _TEAMS_TEAMMATE_STATUS["$dev_name"]="idle"
        _TEAMS_TEAMMATE_LAST_SEEN["$dev_name"]=$(date +%s)
        _teams_log "Registered teammate: $dev_name (agent: dev)"
    done

    _teams_write_state "team_created"
    _teams_log "Team created: $_TEAMS_TEAM_ID (${#_TEAMS_TEAMMATES[@]} teammates)"

    echo "$_TEAMS_TEAM_ID"
}

# =============================================================================
# Story Assignment
# =============================================================================

# Assign a story to an available teammate
# Usage: teams_assign_story <story_id> <prompt>
# Returns: 0 on success, 1 if no teammate available
teams_assign_story() {
    local story_id="${1:?Story ID required}"
    local prompt="${2:?Prompt required}"

    _teams_require_init

    # Find an idle teammate
    local target_teammate=""
    for name in "${!_TEAMS_TEAMMATE_STATUS[@]}"; do
        if [[ "${_TEAMS_TEAMMATE_STATUS[$name]}" == "idle" ]]; then
            target_teammate="$name"
            break
        fi
    done

    if [[ -z "$target_teammate" ]]; then
        _teams_log "No idle teammate available for story $story_id"
        return 1
    fi

    if [[ "$TEAMS_DRY_RUN" == "true" ]]; then
        _teams_log "[DRY-RUN] Would assign story $story_id to $target_teammate"
        _teams_log "[DRY-RUN] Prompt: ${prompt:0:100}..."
        _TEAMS_TEAMMATE_STATUS["$target_teammate"]="working"
        _TEAMS_STORY_ASSIGNMENT["$story_id"]="$target_teammate"
        _TEAMS_STORIES_ASSIGNED=$((_TEAMS_STORIES_ASSIGNED + 1))
        return 0
    fi

    if [[ "$_TEAMS_AVAILABLE" != "true" ]]; then
        # Fallback: delegate to existing parallel-manager or sequential execution
        _teams_log "Fallback mode: story $story_id queued for sequential processing"
        _TEAMS_STORY_ASSIGNMENT["$story_id"]="fallback"
        _TEAMS_STORIES_ASSIGNED=$((_TEAMS_STORIES_ASSIGNED + 1))
        return 0
    fi

    _teams_log "Assigning story $story_id to $target_teammate"

    # Update teammate status
    _TEAMS_TEAMMATE_STATUS["$target_teammate"]="working"
    _TEAMS_TEAMMATE_LAST_SEEN["$target_teammate"]=$(date +%s)
    _TEAMS_STORY_ASSIGNMENT["$story_id"]="$target_teammate"
    _TEAMS_STORIES_ASSIGNED=$((_TEAMS_STORIES_ASSIGNED + 1))

    # In Agent Teams mode, the conductor (team lead) would use:
    #   TaskCreate to create a task for the story
    #   SendMessage to notify the dev teammate
    # This is done through Claude Code's native Agent Teams API,
    # which the conductor agent invokes directly. This adapter
    # tracks the state for monitoring and recovery purposes.

    _teams_write_state "story_assigned"
    return 0
}

# Mark a story as completed by a teammate
# Usage: teams_mark_completed <story_id>
teams_mark_completed() {
    local story_id="${1:?Story ID required}"

    local teammate="${_TEAMS_STORY_ASSIGNMENT[$story_id]:-}"
    if [[ -z "$teammate" ]]; then
        _teams_log "Warning: story $story_id not found in assignments"
        return 1
    fi

    _teams_log "Story completed: $story_id (by $teammate)"

    _TEAMS_TEAMMATE_STATUS["$teammate"]="idle"
    _TEAMS_TEAMMATE_LAST_SEEN["$teammate"]=$(date +%s)
    _TEAMS_STORIES_COMPLETED=$((_TEAMS_STORIES_COMPLETED + 1))
    unset "_TEAMS_STORY_ASSIGNMENT[$story_id]"

    # A6: Track completions for context recovery suggestion
    _TEAMS_COMPLETIONS_SINCE_REREAD=$((_TEAMS_COMPLETIONS_SINCE_REREAD + 1))
    if [[ $_TEAMS_COMPLETIONS_SINCE_REREAD -ge $TEAMS_REREAD_INTERVAL ]]; then
        _teams_log "CONTEXT RECOVERY: $TEAMS_REREAD_INTERVAL completions since last re-read. Leader should call TaskList to refresh team awareness."
        _TEAMS_COMPLETIONS_SINCE_REREAD=0
    fi

    _teams_write_state "story_completed"
    return 0
}

# Mark a story as failed
# Usage: teams_mark_failed <story_id>
teams_mark_failed() {
    local story_id="${1:?Story ID required}"

    local teammate="${_TEAMS_STORY_ASSIGNMENT[$story_id]:-}"
    if [[ -z "$teammate" ]]; then
        _teams_log "Warning: story $story_id not found in assignments"
        return 1
    fi

    _teams_log "Story failed: $story_id (by $teammate)"

    _TEAMS_TEAMMATE_STATUS["$teammate"]="idle"
    _TEAMS_TEAMMATE_LAST_SEEN["$teammate"]=$(date +%s)
    _TEAMS_STORIES_FAILED=$((_TEAMS_STORIES_FAILED + 1))
    unset "_TEAMS_STORY_ASSIGNMENT[$story_id]"

    _teams_write_state "story_failed"
    return 0
}

# =============================================================================
# Waiting & Synchronization
# =============================================================================

# Wait for all active stories to complete
# Usage: teams_wait_completion [timeout_seconds]
teams_wait_completion() {
    local timeout="${1:-0}"  # 0 = wait forever
    local start_time
    start_time=$(date +%s)

    _teams_require_init

    if [[ "$TEAMS_DRY_RUN" == "true" ]]; then
        _teams_log "[DRY-RUN] Would wait for ${#_TEAMS_STORY_ASSIGNMENT[@]} active stories"
        # Simulate instant completion in dry-run
        for story_id in "${!_TEAMS_STORY_ASSIGNMENT[@]}"; do
            teams_mark_completed "$story_id"
        done
        return 0
    fi

    _teams_log "Waiting for ${#_TEAMS_STORY_ASSIGNMENT[@]} active stories..."

    while [[ ${#_TEAMS_STORY_ASSIGNMENT[@]} -gt 0 ]]; do
        # Check timeout
        if [[ $timeout -gt 0 ]]; then
            local elapsed=$(( $(date +%s) - start_time ))
            if [[ $elapsed -ge $timeout ]]; then
                _teams_log "Wait timeout reached after ${elapsed}s"
                return 1
            fi
        fi

        # Run watchdog check
        teams_watchdog

        sleep "$TEAMS_WATCHDOG_INTERVAL"
    done

    _teams_log "All stories completed"
    return 0
}

# Get list of idle teammates
# Usage: teams_get_idle_teammates
teams_get_idle_teammates() {
    for name in "${!_TEAMS_TEAMMATE_STATUS[@]}"; do
        if [[ "${_TEAMS_TEAMMATE_STATUS[$name]}" == "idle" ]]; then
            echo "$name"
        fi
    done
}

# Get count of active (working) teammates
# Usage: teams_get_active_count
teams_get_active_count() {
    local count=0
    for name in "${!_TEAMS_TEAMMATE_STATUS[@]}"; do
        if [[ "${_TEAMS_TEAMMATE_STATUS[$name]}" == "working" ]]; then
            count=$((count + 1))
        fi
    done
    echo "$count"
}

# =============================================================================
# Recovery: Timeout Watchdog (Task #11)
# =============================================================================

# Check teammate health periodically
# Detects stalled teammates and triggers fallback if needed
# Usage: teams_watchdog
teams_watchdog() {
    _teams_require_init

    local now
    now=$(date +%s)

    if [[ "$TEAMS_DRY_RUN" == "true" ]]; then
        _teams_log "[DRY-RUN] Watchdog check: ${#_TEAMS_STORY_ASSIGNMENT[@]} active assignments"
        return 0
    fi

    for name in "${!_TEAMS_TEAMMATE_STATUS[@]}"; do
        if [[ "${_TEAMS_TEAMMATE_STATUS[$name]}" != "working" ]]; then
            continue
        fi

        local last_seen="${_TEAMS_TEAMMATE_LAST_SEEN[$name]:-0}"
        local elapsed=$((now - last_seen))

        # B6: Per-task timeout takes precedence over global timeout
        local effective_timeout=$TEAMS_WATCHDOG_TIMEOUT
        if [[ $TEAMS_PER_TASK_TIMEOUT -gt 0 ]]; then
            effective_timeout=$TEAMS_PER_TASK_TIMEOUT
        fi

        if [[ $elapsed -ge $effective_timeout ]]; then
            _teams_log "WATCHDOG: Teammate '$name' unresponsive for ${elapsed}s (timeout: ${effective_timeout}s)"
            _TEAMS_TEAMMATE_STATUS["$name"]="stalled"

            # Find the story assigned to this teammate
            local stalled_story=""
            for story_id in "${!_TEAMS_STORY_ASSIGNMENT[@]}"; do
                if [[ "${_TEAMS_STORY_ASSIGNMENT[$story_id]}" == "$name" ]]; then
                    stalled_story="$story_id"
                    break
                fi
            done

            if [[ -n "$stalled_story" ]]; then
                _teams_log "WATCHDOG: Story '$stalled_story' was assigned to stalled teammate '$name'"
                _teams_log "WATCHDOG: Triggering fallback to sequential for '$stalled_story'"
                teams_fallback_sequential "$stalled_story" "$name"
            fi
        elif [[ $elapsed -ge $((effective_timeout / 2)) ]]; then
            # A6: If prolonged inactivity, suggest context re-read
            _teams_log "WATCHDOG: Consider re-reading TaskList to refresh team awareness (context compaction mitigation)"
            _teams_log "WATCHDOG: Warning - teammate '$name' quiet for ${elapsed}s"
        fi
    done
}

# Graceful degradation: fallback a stalled story to sequential processing
# Usage: teams_fallback_sequential <story_id> <teammate_name>
teams_fallback_sequential() {
    local story_id="${1:?Story ID required}"
    local teammate_name="${2:?Teammate name required}"

    _teams_require_init

    if [[ "$TEAMS_DRY_RUN" == "true" ]]; then
        _teams_log "[DRY-RUN] Would fallback story $story_id from $teammate_name to sequential"
        unset "_TEAMS_STORY_ASSIGNMENT[$story_id]"
        _TEAMS_TEAMMATE_STATUS["$teammate_name"]="shutdown"
        return 0
    fi

    _teams_log "FALLBACK: Story $story_id removed from stalled teammate $teammate_name"

    # Remove the assignment
    unset "_TEAMS_STORY_ASSIGNMENT[$story_id]"

    # Attempt graceful shutdown of stalled teammate
    _teams_shutdown_teammate "$teammate_name"

    # Mark teammate as shutdown
    _TEAMS_TEAMMATE_STATUS["$teammate_name"]="shutdown"

    # The story will be picked up by the conductor for sequential execution
    # via existing sprint-conductor.sh execute_story_with_ralph()
    _teams_log "FALLBACK: Story $story_id available for sequential reprocessing"

    _teams_write_state "fallback_triggered"
    return 0
}

# Attempt to shutdown a stalled teammate
# Usage: _teams_shutdown_teammate <teammate_name>
_teams_shutdown_teammate() {
    local teammate_name="$1"

    _teams_log "Requesting shutdown for stalled teammate: $teammate_name"

    # In Agent Teams mode, the conductor would send:
    #   SendMessage(type="shutdown_request", recipient=teammate_name)
    # If the teammate doesn't respond, it remains orphaned but the
    # conductor continues with sequential fallback.

    # Give a brief window for graceful shutdown
    local shutdown_wait=10
    _teams_log "Waiting ${shutdown_wait}s for teammate '$teammate_name' to acknowledge shutdown"

    # In real Agent Teams mode, this would poll for shutdown_response
    # For the adapter, we simply mark it and move on
    _TEAMS_TEAMMATE_STATUS["$teammate_name"]="shutdown"
    _teams_log "Teammate '$teammate_name' marked as shutdown (may be orphaned)"
}

# =============================================================================
# B6: Per-Task Timeout Configuration
# =============================================================================

# Set per-task timeout from task type
# Usage: teams_set_task_timeout <task_type>
teams_set_task_timeout() {
    local task_type="${1:?Task type required (audit|sprint|security|delivery)}"

    if [[ -n "${TASK_TYPE_TIMEOUT[$task_type]+x}" ]]; then
        TEAMS_PER_TASK_TIMEOUT=${TASK_TYPE_TIMEOUT[$task_type]}
        _teams_log "Per-task timeout set to ${TEAMS_PER_TASK_TIMEOUT}s for task type: $task_type"
    else
        _teams_log "Warning: Unknown task type '$task_type', using default timeout"
    fi
}

# =============================================================================
# Cleanup
# =============================================================================

# Clean up team resources
# Usage: teams_cleanup
teams_cleanup() {
    if [[ "$_TEAMS_INITIALIZED" != "true" ]]; then
        return 0
    fi

    _teams_log "Cleaning up team resources..."

    if [[ "$TEAMS_DRY_RUN" == "true" ]]; then
        _teams_log "[DRY-RUN] Would clean up team $_TEAMS_TEAM_ID"
        _teams_write_state "cleaned_up"
        _reset_adapter_state
        return 0
    fi

    # Shutdown all active teammates
    for name in "${!_TEAMS_TEAMMATE_STATUS[@]}"; do
        local status="${_TEAMS_TEAMMATE_STATUS[$name]}"
        if [[ "$status" == "working" || "$status" == "idle" ]]; then
            _teams_log "Requesting shutdown for teammate: $name (status: $status)"
            _teams_shutdown_teammate "$name"
        fi
    done

    # Wait briefly for clean shutdowns
    sleep 2

    _teams_write_state "cleaned_up"
    _teams_log "Team $_TEAMS_TEAM_ID cleaned up"

    _reset_adapter_state
}

# =============================================================================
# Status & Reporting
# =============================================================================

# Get adapter status as JSON
# Usage: teams_get_status
teams_get_status() {
    local active_count
    active_count=$(teams_get_active_count 2>/dev/null || echo "0")

    local teammate_list="[]"
    if [[ ${#_TEAMS_TEAMMATES[@]} -gt 0 ]]; then
        teammate_list="["
        local first=true
        for name in "${!_TEAMS_TEAMMATES[@]}"; do
            [[ "$first" != "true" ]] && teammate_list+=","
            first=false
            teammate_list+="{\"name\":\"$name\",\"agent\":\"${_TEAMS_TEAMMATES[$name]}\",\"status\":\"${_TEAMS_TEAMMATE_STATUS[$name]:-unknown}\"}"
        done
        teammate_list+="]"
    fi

    cat << EOF
{
    "version": "$TEAMS_ADAPTER_VERSION",
    "initialized": $_TEAMS_INITIALIZED,
    "agent_teams_available": $_TEAMS_AVAILABLE,
    "dry_run": $TEAMS_DRY_RUN,
    "team_id": "$_TEAMS_TEAM_ID",
    "lead": "$_TEAMS_LEAD_NAME",
    "teammates": $teammate_list,
    "stories": {
        "assigned": $_TEAMS_STORIES_ASSIGNED,
        "completed": $_TEAMS_STORIES_COMPLETED,
        "failed": $_TEAMS_STORIES_FAILED,
        "active": ${#_TEAMS_STORY_ASSIGNMENT[@]}
    },
    "watchdog": {
        "interval_seconds": $TEAMS_WATCHDOG_INTERVAL,
        "timeout_seconds": $TEAMS_WATCHDOG_TIMEOUT
    }
}
EOF
}

# =============================================================================
# Internal Helpers
# =============================================================================

_teams_require_init() {
    if [[ "$_TEAMS_INITIALIZED" != "true" ]]; then
        echo "ERROR: Teams adapter not initialized. Call teams_init() first." >&2
        return 1
    fi
}

# Safe count of associative array elements (handles empty arrays with nounset)
_teams_active_story_count() {
    echo "${#_TEAMS_STORY_ASSIGNMENT[@]}"
}

_teams_teammate_count() {
    echo "${#_TEAMS_TEAMMATES[@]}"
}

_teams_log() {
    local message="$1"
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local log_line="[$timestamp] [teams-adapter] $message"

    if [[ -n "${_TEAMS_LOG_FILE:-}" ]]; then
        echo "$log_line" >> "$_TEAMS_LOG_FILE"
    fi

    # Also print to stderr for visibility
    echo "$log_line" >&2
}

_teams_write_state() {
    local event="$1"

    if [[ -z "${_TEAMS_SESSION_DIR:-}" ]]; then
        return
    fi

    local state_file="$_TEAMS_SESSION_DIR/state.yaml"

    cat > "$state_file" << EOF
adapter_version: "$TEAMS_ADAPTER_VERSION"
team_id: "$_TEAMS_TEAM_ID"
lead: "$_TEAMS_LEAD_NAME"
agent_teams_available: $_TEAMS_AVAILABLE
dry_run: $TEAMS_DRY_RUN
last_event: "$event"
last_updated: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
stories:
  assigned: $_TEAMS_STORIES_ASSIGNED
  completed: $_TEAMS_STORIES_COMPLETED
  failed: $_TEAMS_STORIES_FAILED
  active: ${#_TEAMS_STORY_ASSIGNMENT[@]}
watchdog:
  interval: $TEAMS_WATCHDOG_INTERVAL
  timeout: $TEAMS_WATCHDOG_TIMEOUT
EOF
}

_reset_adapter_state() {
    _TEAMS_INITIALIZED=false
    _TEAMS_AVAILABLE=false
    _TEAMS_TEAM_ID=""
    _TEAMS_LEAD_NAME=""
    _TEAMS_STORIES_ASSIGNED=0
    _TEAMS_STORIES_COMPLETED=0
    _TEAMS_STORIES_FAILED=0

    # Clear associative arrays
    for key in "${!_TEAMS_TEAMMATES[@]}"; do unset "_TEAMS_TEAMMATES[$key]"; done
    for key in "${!_TEAMS_TEAMMATE_STATUS[@]}"; do unset "_TEAMS_TEAMMATE_STATUS[$key]"; done
    for key in "${!_TEAMS_TEAMMATE_LAST_SEEN[@]}"; do unset "_TEAMS_TEAMMATE_LAST_SEEN[$key]"; done
    for key in "${!_TEAMS_STORY_ASSIGNMENT[@]}"; do unset "_TEAMS_STORY_ASSIGNMENT[$key]"; done
}

# =============================================================================
# CLI Interface
# =============================================================================

_teams_usage() {
    cat << EOF
Ralph Teams Adapter v${TEAMS_ADAPTER_VERSION}
Abstraction layer for Claude Code Agent Teams integration.

Usage: ralph-teams-adapter.sh <command> [options]

Commands:
  init [session_dir]          Initialize the adapter
  create-team <lead> <count>  Create a team with N dev agents
  assign <story_id> <prompt>  Assign a story to an idle teammate
  complete <story_id>         Mark a story as completed
  fail <story_id>             Mark a story as failed
  wait [timeout]              Wait for all stories to complete
  watchdog                    Run a single watchdog health check
  status                      Show adapter status (JSON)
  cleanup                     Clean up team resources
  help                        Show this help

Options:
  --dry-run                   Simulate all operations without side effects
  --help                      Show this help

Environment:
  CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1  Enable Agent Teams mode
  TEAMS_WATCHDOG_INTERVAL=60              Watchdog check interval (seconds)
  TEAMS_WATCHDOG_TIMEOUT=300              Teammate timeout before fallback (seconds)
  TEAMS_DRY_RUN=true                      Enable dry-run mode

Examples:
  # Initialize and create a 2-agent team (conductor + 1 dev)
  ralph-teams-adapter.sh init
  ralph-teams-adapter.sh create-team ralph-conductor 1

  # Assign a story
  ralph-teams-adapter.sh assign US-001 "Implement login feature"

  # Wait for completion
  ralph-teams-adapter.sh wait 3600

  # Dry run
  ralph-teams-adapter.sh --dry-run init
  ralph-teams-adapter.sh --dry-run create-team conductor 1
EOF
}

cmd_teams_adapter() {
    # Parse global options first
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dry-run)
                TEAMS_DRY_RUN="true"
                shift
                ;;
            --help|-h)
                _teams_usage
                return 0
                ;;
            *)
                break
                ;;
        esac
    done

    local command="${1:-help}"
    shift || true

    case "$command" in
        init)
            teams_init "${1:-.ralph/agent-teams}"
            ;;
        create-team)
            local lead="${1:?Lead name required}"
            local count="${2:-1}"
            teams_create_team "$lead" "$count"
            ;;
        assign)
            local story_id="${1:?Story ID required}"
            local prompt="${2:?Prompt required}"
            teams_assign_story "$story_id" "$prompt"
            ;;
        complete)
            local story_id="${1:?Story ID required}"
            teams_mark_completed "$story_id"
            ;;
        fail)
            local story_id="${1:?Story ID required}"
            teams_mark_failed "$story_id"
            ;;
        wait)
            teams_wait_completion "${1:-0}"
            ;;
        watchdog)
            teams_watchdog
            ;;
        status)
            teams_get_status
            ;;
        cleanup)
            teams_cleanup
            ;;
        help|--help|-h)
            _teams_usage
            ;;
        *)
            echo "Unknown command: $command" >&2
            echo "Run 'ralph-teams-adapter.sh help' for usage." >&2
            return 1
            ;;
    esac
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    cmd_teams_adapter "$@"
fi
