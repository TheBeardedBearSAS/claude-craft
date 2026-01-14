#!/bin/bash
# =============================================================================
# Ralph Wiggum - Circuit Breaker Module
# Safety mechanism to prevent infinite loops and detect stalls
# =============================================================================

# Circuit breaker thresholds (defaults)
CB_NO_CHANGES_THRESHOLD="${CB_NO_CHANGES_THRESHOLD:-3}"
CB_REPEATED_ERROR_THRESHOLD="${CB_REPEATED_ERROR_THRESHOLD:-5}"
CB_OUTPUT_DECLINE_THRESHOLD="${CB_OUTPUT_DECLINE_THRESHOLD:-70}"

# Circuit breaker state
CB_ITERATIONS_WITHOUT_CHANGES=0
CB_CONSECUTIVE_ERRORS=0
CB_PEAK_OUTPUT_LENGTH=0
CB_LAST_OUTPUT_LENGTH=0
CB_TRIGGERED=false
CB_TRIGGER_REASON=""

# =============================================================================
# Initialization
# =============================================================================

init_circuit_breaker() {
    CB_ITERATIONS_WITHOUT_CHANGES=0
    CB_CONSECUTIVE_ERRORS=0
    CB_PEAK_OUTPUT_LENGTH=0
    CB_LAST_OUTPUT_LENGTH=0
    CB_TRIGGERED=false
    CB_TRIGGER_REASON=""

    # Load thresholds from config if available (with validation)
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local no_changes
        no_changes=$(yq e '.circuit_breaker.no_file_changes_threshold // ""' "$CONFIG_FILE" 2>/dev/null)
        if [[ -n "$no_changes" && "$no_changes" =~ ^[0-9]+$ ]]; then
            CB_NO_CHANGES_THRESHOLD=$no_changes
        fi

        local errors
        errors=$(yq e '.circuit_breaker.repeated_error_threshold // ""' "$CONFIG_FILE" 2>/dev/null)
        if [[ -n "$errors" && "$errors" =~ ^[0-9]+$ ]]; then
            CB_REPEATED_ERROR_THRESHOLD=$errors
        fi

        local decline
        decline=$(yq e '.circuit_breaker.output_decline_threshold // ""' "$CONFIG_FILE" 2>/dev/null)
        if [[ -n "$decline" && "$decline" =~ ^[0-9]+$ ]]; then
            CB_OUTPUT_DECLINE_THRESHOLD=$decline
        fi
    fi

    print_verbose "Circuit breaker initialized:"
    print_verbose "  - No changes threshold: $CB_NO_CHANGES_THRESHOLD"
    print_verbose "  - Error threshold: $CB_REPEATED_ERROR_THRESHOLD"
    print_verbose "  - Output decline threshold: ${CB_OUTPUT_DECLINE_THRESHOLD}%"
}

# =============================================================================
# Circuit Breaker Check
# =============================================================================

check_circuit_breaker() {
    # Return 0 (true) if triggered, 1 (false) if OK to continue

    # Check no progress (no file changes)
    if [[ $CB_ITERATIONS_WITHOUT_CHANGES -ge $CB_NO_CHANGES_THRESHOLD ]]; then
        CB_TRIGGERED=true
        CB_TRIGGER_REASON="no_progress"
        print_warning "${MSG_CB_TRIGGERED}: ${MSG_CB_NO_CHANGES} $CB_ITERATIONS_WITHOUT_CHANGES ${MSG_CB_ITERATIONS}"
        return 0
    fi

    # Check repeated errors
    if [[ $CB_CONSECUTIVE_ERRORS -ge $CB_REPEATED_ERROR_THRESHOLD ]]; then
        CB_TRIGGERED=true
        CB_TRIGGER_REASON="repeated_errors"
        print_warning "${MSG_CB_TRIGGERED}: ${MSG_CB_REPEATED_ERRORS}"
        return 0
    fi

    # Check output decline
    if [[ $CB_PEAK_OUTPUT_LENGTH -gt 0 && $CB_LAST_OUTPUT_LENGTH -gt 0 ]]; then
        local decline_percent=$(( (CB_PEAK_OUTPUT_LENGTH - CB_LAST_OUTPUT_LENGTH) * 100 / CB_PEAK_OUTPUT_LENGTH ))
        if [[ $decline_percent -ge $CB_OUTPUT_DECLINE_THRESHOLD ]]; then
            CB_TRIGGERED=true
            CB_TRIGGER_REASON="output_decline"
            print_warning "${MSG_CB_TRIGGERED}: ${MSG_CB_OUTPUT_DECLINE} ${decline_percent}${MSG_CB_PERCENT}"
            return 0
        fi
    fi

    return 1
}

# =============================================================================
# Update Circuit Breaker State
# =============================================================================

update_circuit_breaker() {
    local event_type="$1"
    local output="$2"

    case "$event_type" in
        progress)
            # Reset counters on progress
            CB_ITERATIONS_WITHOUT_CHANGES=0
            CB_CONSECUTIVE_ERRORS=0

            # Update output tracking
            local output_length=${#output}
            CB_LAST_OUTPUT_LENGTH=$output_length
            if [[ $output_length -gt $CB_PEAK_OUTPUT_LENGTH ]]; then
                CB_PEAK_OUTPUT_LENGTH=$output_length
            fi
            ;;

        no_progress)
            CB_ITERATIONS_WITHOUT_CHANGES=$((CB_ITERATIONS_WITHOUT_CHANGES + 1))
            print_verbose "No progress: $CB_ITERATIONS_WITHOUT_CHANGES / $CB_NO_CHANGES_THRESHOLD"
            ;;

        error)
            CB_CONSECUTIVE_ERRORS=$((CB_CONSECUTIVE_ERRORS + 1))
            print_verbose "Error count: $CB_CONSECUTIVE_ERRORS / $CB_REPEATED_ERROR_THRESHOLD"
            ;;

        reset)
            CB_ITERATIONS_WITHOUT_CHANGES=0
            CB_CONSECUTIVE_ERRORS=0
            CB_TRIGGERED=false
            CB_TRIGGER_REASON=""
            print_verbose "${MSG_CB_RESET}"
            ;;
    esac

    # Update session state if available
    if [[ -n "$SESSION_ID" ]]; then
        update_session_state "$SESSION_ID" "circuit_breaker" "{
            \"iterations_without_changes\": $CB_ITERATIONS_WITHOUT_CHANGES,
            \"consecutive_errors\": $CB_CONSECUTIVE_ERRORS,
            \"peak_output_length\": $CB_PEAK_OUTPUT_LENGTH,
            \"last_output_length\": $CB_LAST_OUTPUT_LENGTH,
            \"triggered\": $CB_TRIGGERED,
            \"trigger_reason\": \"$CB_TRIGGER_REASON\"
        }"
    fi
}

# =============================================================================
# Circuit Breaker Status
# =============================================================================

get_circuit_breaker_status() {
    cat <<EOF
{
    "iterations_without_changes": $CB_ITERATIONS_WITHOUT_CHANGES,
    "consecutive_errors": $CB_CONSECUTIVE_ERRORS,
    "peak_output_length": $CB_PEAK_OUTPUT_LENGTH,
    "last_output_length": $CB_LAST_OUTPUT_LENGTH,
    "triggered": $CB_TRIGGERED,
    "trigger_reason": "$CB_TRIGGER_REASON",
    "thresholds": {
        "no_changes": $CB_NO_CHANGES_THRESHOLD,
        "errors": $CB_REPEATED_ERROR_THRESHOLD,
        "output_decline": $CB_OUTPUT_DECLINE_THRESHOLD
    }
}
EOF
}

# =============================================================================
# Force Trip
# =============================================================================

trip_circuit_breaker() {
    local reason="$1"
    CB_TRIGGERED=true
    CB_TRIGGER_REASON="${reason:-manual}"
    print_warning "${MSG_CB_TRIGGERED}: $CB_TRIGGER_REASON"
}
