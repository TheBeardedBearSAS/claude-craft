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
    local random=$(head -c 4 /dev/urandom | xxd -p)
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

    # Update status to running
    local tmp_file=$(mktemp)
    jq '.status = "running" | .resumed_at = "'"$(date -Iseconds)"'"' "$state_file" > "$tmp_file"
    mv "$tmp_file" "$state_file"

    return 0
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

    if [[ -f "$state_file" ]]; then
        local tmp_file=$(mktemp)
        jq ".$field = $value" "$state_file" > "$tmp_file"
        mv "$tmp_file" "$state_file"
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
    local timestamp=$(date -Iseconds)

    # Update state file
    local tmp_file=$(mktemp)
    jq --argjson iter "$iteration" --argjson len "$output_length" '
        .current_iteration = $iter |
        .metrics.total_iterations = $iter |
        .metrics.peak_output_length = (if $len > .metrics.peak_output_length then $len else .metrics.peak_output_length end)
    ' "$state_file" > "$tmp_file"
    mv "$tmp_file" "$state_file"

    # Append to metrics history
    local metric_entry=$(jq -n \
        --arg ts "$timestamp" \
        --argjson iter "$iteration" \
        --argjson len "$output_length" \
        '{timestamp: $ts, iteration: $iter, output_length: $len}')

    tmp_file=$(mktemp)
    jq ". + [$metric_entry]" "$metrics_file" > "$tmp_file"
    mv "$tmp_file" "$metrics_file"
}

# =============================================================================
# Session Saving
# =============================================================================

save_session() {
    local session_id="$1"
    local exit_reason="$2"
    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local state_file="$session_dir/state.json"

    if [[ -f "$state_file" ]]; then
        local tmp_file=$(mktemp)
        jq --arg reason "$exit_reason" '
            .status = "completed" |
            .exit_reason = $reason |
            .completed_at = "'"$(date -Iseconds)"'"
        ' "$state_file" > "$tmp_file"
        mv "$tmp_file" "$state_file"
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
