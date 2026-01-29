#!/bin/bash
# =============================================================================
# Ralph Wiggum - Session Management Module
# Handles session creation, storage, and retrieval
# =============================================================================

# Session directory (default: .ralph in current directory)
RALPH_SESSION_BASE="${RALPH_SESSION_BASE:-$PWD/.ralph}"

# =============================================================================
# Session ID Generation
# =============================================================================

generate_session_id() {
    # Generate a unique session ID using timestamp and random string
    local timestamp=$(date +%s)
    local random

    # Use utils function if available, otherwise fallback chain
    if type generate_random_suffix &>/dev/null; then
        random=$(generate_random_suffix 4)
    elif command -v xxd &>/dev/null; then
        random=$(head -c 4 /dev/urandom | xxd -p)
    elif command -v od &>/dev/null; then
        random=$(head -c 4 /dev/urandom | od -An -tx1 | tr -d ' \n')
    else
        # Fallback: use $RANDOM (less entropy but portable)
        random=$(printf '%04x%04x' $RANDOM $RANDOM | head -c 8)
    fi

    echo "ralph-${timestamp}-${random}"
}

# =============================================================================
# Session Creation
# =============================================================================

create_session() {
    local prompt="$1"
    local session_id=$(generate_session_id)
    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"

    # Create session directory
    mkdir -p "$session_dir"

    # Create session state file
    local state_file="$session_dir/state.json"
    cat > "$state_file" <<EOF
{
    "id": "$session_id",
    "created_at": "$(date -Iseconds)",
    "status": "running",
    "initial_prompt": $(echo "$prompt" | jq -Rs .),
    "current_iteration": 0,
    "metrics": {
        "total_iterations": 0,
        "file_changes": 0,
        "errors": 0,
        "peak_output_length": 0
    },
    "circuit_breaker": {
        "iterations_without_changes": 0,
        "consecutive_errors": 0,
        "last_output_length": 0
    },
    "dod_results": []
}
EOF

    # Create log file
    touch "$session_dir/session.log"

    # Create metrics file
    echo "[]" > "$session_dir/metrics.json"

    echo "$session_id"
}

# =============================================================================
# Session Resume
# =============================================================================

resume_session() {
    local session_id="$1"
    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local state_file="$session_dir/state.json"

    if [[ ! -f "$state_file" ]]; then
        return 1
    fi

    # Update status to running (with error handling)
    local tmp_file="${state_file}.tmp.$$"
    local resumed_at
    resumed_at=$(date -Iseconds)

    if jq --arg resumed "$resumed_at" '.status = "running" | .resumed_at = $resumed' "$state_file" > "$tmp_file" 2>/dev/null; then
        mv "$tmp_file" "$state_file"
        return 0
    else
        rm -f "$tmp_file"
        return 1
    fi
}

# =============================================================================
# Session State Management
# =============================================================================

get_session_state() {
    local session_id="$1"
    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local state_file="$session_dir/state.json"

    if [[ -f "$state_file" ]]; then
        cat "$state_file"
    else
        echo "{}"
    fi
}

update_session_state() {
    local session_id="$1"
    local field="$2"
    local value="$3"
    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local state_file="$session_dir/state.json"

    if [[ ! -f "$state_file" ]]; then
        return 1
    fi

    local tmp_file="${state_file}.tmp.$$"

    # Use --argjson for numeric values, --arg for strings
    # Try as JSON first (numbers, booleans, objects), fall back to string
    if jq --argjson val "$value" ".$field = \$val" "$state_file" > "$tmp_file" 2>/dev/null; then
        mv "$tmp_file" "$state_file"
        return 0
    elif jq --arg val "$value" ".$field = \$val" "$state_file" > "$tmp_file" 2>/dev/null; then
        mv "$tmp_file" "$state_file"
        return 0
    else
        rm -f "$tmp_file"
        return 1
    fi
}

# =============================================================================
# Session Metrics
# =============================================================================

update_session_metrics() {
    local session_id="$1"
    local iteration="$2"
    local output="$3"
    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local state_file="$session_dir/state.json"
    local metrics_file="$session_dir/metrics.json"

    if [[ ! -f "$state_file" ]]; then
        return 1
    fi

    # Calculate metrics
    local output_length=${#output}
    local timestamp
    timestamp=$(date -Iseconds)

    # Update state file (with error handling)
    local tmp_file="${state_file}.tmp.$$"
    if jq --argjson iter "$iteration" --argjson len "$output_length" '
        .current_iteration = $iter |
        .metrics.total_iterations = $iter |
        .metrics.peak_output_length = (if $len > .metrics.peak_output_length then $len else .metrics.peak_output_length end)
    ' "$state_file" > "$tmp_file" 2>/dev/null; then
        mv "$tmp_file" "$state_file"
    else
        rm -f "$tmp_file"
        # Continue to metrics update even if state update fails
    fi

    # Append to metrics history (if file exists)
    if [[ -f "$metrics_file" ]]; then
        local metric_entry
        metric_entry=$(jq -n \
            --arg ts "$timestamp" \
            --argjson iter "$iteration" \
            --argjson len "$output_length" \
            '{timestamp: $ts, iteration: $iter, output_length: $len}' 2>/dev/null)

        if [[ -n "$metric_entry" ]]; then
            tmp_file="${metrics_file}.tmp.$$"
            if jq --argjson entry "$metric_entry" '. + [$entry]' "$metrics_file" > "$tmp_file" 2>/dev/null; then
                mv "$tmp_file" "$metrics_file"
            else
                rm -f "$tmp_file"
            fi
        fi
    fi
}

# =============================================================================
# Session Saving
# =============================================================================

save_session() {
    local session_id="$1"
    local exit_reason="$2"
    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local state_file="$session_dir/state.json"

    if [[ ! -f "$state_file" ]]; then
        return 1
    fi

    local tmp_file="${state_file}.tmp.$$"
    local completed_at
    completed_at=$(date -Iseconds)

    if jq --arg reason "$exit_reason" --arg completed "$completed_at" '
        .status = "completed" |
        .exit_reason = $reason |
        .completed_at = $completed
    ' "$state_file" > "$tmp_file" 2>/dev/null; then
        mv "$tmp_file" "$state_file"
        return 0
    else
        rm -f "$tmp_file"
        return 1
    fi
}

# =============================================================================
# Session Listing
# =============================================================================

list_sessions() {
    local sessions_dir="$RALPH_SESSION_BASE/sessions"

    if [[ ! -d "$sessions_dir" ]]; then
        echo "[]"
        return
    fi

    local sessions=()
    for dir in "$sessions_dir"/*/; do
        if [[ -d "$dir" ]]; then
            local state_file="$dir/state.json"
            if [[ -f "$state_file" ]]; then
                sessions+=("$(cat "$state_file")")
            fi
        fi
    done

    # Convert to JSON array
    printf '%s\n' "${sessions[@]}" | jq -s '.'
}

# =============================================================================
# Session Cleanup
# =============================================================================

cleanup_session() {
    local session_id="$1"
    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"

    if [[ -d "$session_dir" ]]; then
        rm -rf "$session_dir"
        return 0
    fi
    return 1
}

# =============================================================================
# Log Writing
# =============================================================================

log_session() {
    local session_id="$1"
    local level="$2"
    local message="$3"
    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local log_file="$session_dir/session.log"

    if [[ -f "$log_file" ]]; then
        echo "[$(date -Iseconds)] [$level] $message" >> "$log_file"
    fi
}

# =============================================================================
# Export Session for Hooks (v2.0)
# =============================================================================

export_session_for_hooks() {
    local session_id="$1"

    if [[ -z "$session_id" ]]; then
        return 1
    fi

    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local state_file="$session_dir/state.json"

    # Export environment variables for hooks
    export RALPH_SESSION_ID="$session_id"
    export RALPH_SESSION_DIR="$session_dir"
    export RALPH_PROJECT_DIR="$PWD"

    # Export state file path
    if [[ -f "$state_file" ]]; then
        export RALPH_STATE_FILE="$state_file"
    fi

    # Export config file path
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]]; then
        export RALPH_CONFIG_FILE="$CONFIG_FILE"
    fi
}

# =============================================================================
# Get Session Context for Hooks
# =============================================================================

get_session_context() {
    local session_id="$1"

    if [[ -z "$session_id" ]]; then
        echo '{"error": "no session"}'
        return 1
    fi

    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local state_file="$session_dir/state.json"

    if [[ ! -f "$state_file" ]]; then
        echo '{"error": "state file not found"}'
        return 1
    fi

    # Build context JSON
    local state
    state=$(cat "$state_file" 2>/dev/null)

    local context
    context=$(jq -n \
        --argjson state "$state" \
        --arg project_dir "$PWD" \
        --arg config_file "${CONFIG_FILE:-}" \
        '{
            session: $state,
            project_dir: $project_dir,
            config_file: $config_file
        }' 2>/dev/null)

    echo "$context"
}

# =============================================================================
# Get Session Context String for additionalContext
# =============================================================================

get_session_context_string() {
    local session_id="$1"
    local phase="${2:-UNKNOWN}"
    local task="${3:-}"

    local context="Ralph Wiggum Session Active"
    context="$context
Session ID: $session_id"

    if [[ -n "$phase" ]]; then
        context="$context
Phase: $phase"
    fi

    if [[ -n "$task" ]]; then
        context="$context
Current Task: $task"
    fi

    # Add iteration info from state
    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local state_file="$session_dir/state.json"

    if [[ -f "$state_file" ]]; then
        local iteration
        iteration=$(jq -r '.current_iteration // 0' "$state_file" 2>/dev/null)
        context="$context
Iteration: $iteration / $MAX_ITERATIONS"
    fi

    # Add circuit breaker status
    if [[ -n "$CB_ITERATIONS_WITHOUT_CHANGES" ]]; then
        context="$context
Circuit Breaker: $CB_ITERATIONS_WITHOUT_CHANGES / $CB_NO_CHANGES_THRESHOLD"
    fi

    echo "$context"
}

# =============================================================================
# Create Hook Context File
# =============================================================================

create_hook_context_file() {
    local session_id="$1"
    local phase="${2:-UNKNOWN}"
    local task="${3:-}"

    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local context_file="$session_dir/hook-context.json"

    # Ensure directory exists
    mkdir -p "$session_dir"

    # Create context file
    cat > "$context_file" <<EOF
{
    "session_id": "$session_id",
    "phase": "$phase",
    "current_task": "$task",
    "max_iterations": $MAX_ITERATIONS,
    "current_iteration": ${CB_ITERATIONS_WITHOUT_CHANGES:-0},
    "circuit_breaker": {
        "no_progress_streak": ${CB_ITERATIONS_WITHOUT_CHANGES:-0},
        "threshold": ${CB_NO_CHANGES_THRESHOLD:-4}
    },
    "timestamp": "$(date -Iseconds)",
    "config_file": "${CONFIG_FILE:-}",
    "project_dir": "$PWD"
}
EOF

    # Export path for hooks
    export RALPH_HOOK_CONTEXT="$context_file"

    echo "$context_file"
}

# =============================================================================
# Session Handoff for Continuation
# =============================================================================

get_session_handoff_context() {
    local session_id="$1"

    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local state_file="$session_dir/state.json"

    if [[ ! -f "$state_file" ]]; then
        echo ""
        return 1
    fi

    # Build handoff context
    local handoff=""

    # Get initial prompt
    local initial_prompt
    initial_prompt=$(jq -r '.initial_prompt // ""' "$state_file" 2>/dev/null)
    if [[ -n "$initial_prompt" ]]; then
        handoff="Original Task: $initial_prompt"
    fi

    # Get progress
    local iteration
    iteration=$(jq -r '.current_iteration // 0' "$state_file" 2>/dev/null)
    handoff="$handoff

Progress: Completed $iteration iterations"

    # Get DoD results summary
    local dod_file="$session_dir/dod_results.json"
    if [[ -f "$dod_file" ]]; then
        local passed
        passed=$(jq '[.[] | select(.passed == true)] | length' "$dod_file" 2>/dev/null)
        local total
        total=$(jq 'length' "$dod_file" 2>/dev/null)
        handoff="$handoff
DoD: $passed / $total checks passing"
    fi

    echo "$handoff"
}
