#!/bin/bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum - Main Loop Module
# Core iteration loop logic and Claude invocation
# =============================================================================

# Claude command configuration
CLAUDE_COMMAND="${CLAUDE_COMMAND:-claude}"
CLAUDE_ARGS="${CLAUDE_ARGS:-}"

# =============================================================================
# Claude Invocation
# =============================================================================

invoke_claude() {
    local session_id="$1"
    local prompt="$2"
    local timeout="$3"

    # Build the command
    local cmd="$CLAUDE_COMMAND"

    # Add continue flag if we have a session
    if [[ -n "$session_id" ]]; then
        cmd="$cmd --continue"
    fi

    # Add prompt
    cmd="$cmd -p"

    # Log the invocation
    log_session "$session_id" "INFO" "Invoking Claude: $cmd \"${prompt:0:100}...\""

    # Execute with timeout
    local timeout_sec=$((timeout / 1000))
    local output
    local exit_code

    # Use timeout command if available
    if command -v timeout &> /dev/null; then
        output=$(timeout "${timeout_sec}s" $cmd "$prompt" 2>&1)
        exit_code=$?

        # Check for timeout (exit code 124)
        if [[ $exit_code -eq 124 ]]; then
            log_session "$session_id" "ERROR" "Claude invocation timed out after ${timeout_sec}s"
            return 124
        fi
    else
        # Fallback without timeout
        output=$($cmd "$prompt" 2>&1)
        exit_code=$?
    fi

    # Log result
    if [[ $exit_code -eq 0 ]]; then
        log_session "$session_id" "INFO" "Claude responded (${#output} chars)"
    else
        log_session "$session_id" "ERROR" "Claude failed with exit code $exit_code"
    fi

    # Output the response
    echo "$output"
    return $exit_code
}

# =============================================================================
# Output Processing
# =============================================================================

process_output() {
    local output="$1"
    local session_id="$2"

    # Store the raw output
    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"
    local output_file="$session_dir/last_output.txt"

    echo "$output" > "$output_file"

    # Extract any structured data if present
    # Look for JSON blocks, completion markers, etc.

    # Check for completion marker
    if echo "$output" | grep -q "$DEFAULT_COMPLETION_MARKER"; then
        log_session "$session_id" "INFO" "Completion marker found in output"
        return 0
    fi

    return 1
}

# =============================================================================
# File Change Detection
# =============================================================================

detect_file_changes() {
    local session_id="$1"

    # Use git to detect changes if available
    if command -v git &> /dev/null && git rev-parse --git-dir &> /dev/null; then
        local changes=$(git status --porcelain 2>/dev/null | wc -l)
        log_session "$session_id" "DEBUG" "Detected $changes file changes"
        echo "$changes"
    else
        # Fallback: check modification times in common source directories
        local changes=0
        for dir in src lib app tests; do
            if [[ -d "$dir" ]]; then
                local recent=$(find "$dir" -type f -mmin -1 2>/dev/null | wc -l)
                changes=$((changes + recent))
            fi
        done
        echo "$changes"
    fi
}

# =============================================================================
# Progress Detection
# =============================================================================

check_progress() {
    local session_id="$1"
    local output="$2"
    local previous_length="$3"

    local current_length=${#output}
    local file_changes=$(detect_file_changes "$session_id")

    # Progress indicators
    local has_progress=false

    # 1. Files were changed
    if [[ $file_changes -gt 0 ]]; then
        has_progress=true
        log_session "$session_id" "INFO" "Progress: $file_changes files changed"
    fi

    # 2. Output length is significant (not just errors)
    if [[ $current_length -gt 100 ]]; then
        # Check if output contains actual work indicators
        if echo "$output" | grep -qE "(created|modified|fixed|implemented|added|updated)" ; then
            has_progress=true
            log_session "$session_id" "INFO" "Progress: Work indicators found in output"
        fi
    fi

    # Update metrics
    update_session_state "$session_id" "metrics.file_changes" "$file_changes"

    if [[ "$has_progress" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# =============================================================================
# Error Detection
# =============================================================================

detect_errors() {
    local output="$1"
    local errors=()

    # NOTE: Context limit detection is handled by context-manager.sh module
    # via detect_context_limit() function. Do NOT add context patterns here.

    # Common error patterns
    local error_patterns=(
        "Error:"
        "error:"
        "FAILED"
        "Exception"
        "fatal:"
        "Cannot"
        "could not"
        "Permission denied"
        "No such file"
        "command not found"
    )

    for pattern in "${error_patterns[@]}"; do
        if echo "$output" | grep -q "$pattern"; then
            errors+=("$pattern")
        fi
    done

    if [[ ${#errors[@]} -gt 0 ]]; then
        printf '%s\n' "${errors[@]}"
        return 1
    fi

    return 0
}

# =============================================================================
# Loop State
# =============================================================================

get_loop_state() {
    local session_id="$1"
    local state
    state=$(get_session_state "$session_id")

    if [[ -z "$state" || "$state" == "{}" ]]; then
        echo '{"iteration":0,"status":"unknown","circuit_breaker":{},"dod_results":[]}'
        return
    fi

    local result
    result=$(echo "$state" | jq '{
        iteration: (.current_iteration // 0),
        status: (.status // "unknown"),
        circuit_breaker: (.circuit_breaker // {}),
        dod_results: (.dod_results // [])
    }' 2>/dev/null)

    if [[ -n "$result" ]]; then
        echo "$result"
    else
        echo '{"iteration":0,"status":"unknown","circuit_breaker":{},"dod_results":[]}'
    fi
}

should_continue_loop() {
    local session_id="$1"
    local iteration="$2"
    local max_iterations="$3"

    # Check max iterations
    if [[ $iteration -ge $max_iterations ]]; then
        return 1
    fi

    # Check circuit breaker
    if check_circuit_breaker; then
        return 1
    fi

    # Check session status (with error handling)
    local state
    state=$(get_session_state "$session_id")

    local status="running"  # Default to continue
    if [[ -n "$state" && "$state" != "{}" ]]; then
        status=$(echo "$state" | jq -r '.status // "running"' 2>/dev/null) || status="running"
    fi

    if [[ "$status" == "completed" || "$status" == "failed" ]]; then
        return 1
    fi

    return 0
}
