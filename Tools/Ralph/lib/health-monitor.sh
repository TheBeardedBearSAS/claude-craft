#!/bin/bash
# =============================================================================
# Ralph Wiggum - Health Monitor Module
# Detect degradation patterns and early warning signs
# =============================================================================

# Health monitor configuration
HEALTH_MONITOR_ENABLED="${HEALTH_MONITOR_ENABLED:-true}"
HEALTH_STALL_DETECTION="${HEALTH_STALL_DETECTION:-true}"
HEALTH_ERROR_SPIRAL="${HEALTH_ERROR_SPIRAL:-true}"
HEALTH_CONTEXT_BLOAT="${HEALTH_CONTEXT_BLOAT:-true}"

# Health state
HEALTH_STATUS="HEALTHY"
HEALTH_WARNINGS=()
HEALTH_ERROR_HISTORY=()
HEALTH_CONTEXT_HISTORY=()
HEALTH_ITERATION_HISTORY=()

# Thresholds
HEALTH_STALL_THRESHOLD=3
HEALTH_ERROR_SPIRAL_THRESHOLD=3
HEALTH_CONTEXT_GROWTH_RATE=20
HEALTH_ITERATION_SLOWDOWN_RATE=50

# =============================================================================
# Initialization
# =============================================================================

init_health_monitor() {
    HEALTH_STATUS="HEALTHY"
    HEALTH_WARNINGS=()
    HEALTH_ERROR_HISTORY=()
    HEALTH_CONTEXT_HISTORY=()
    HEALTH_ITERATION_HISTORY=()

    # Load settings from config
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local enabled
        enabled=$(yq e '.health_monitor.enabled // "true"' "$CONFIG_FILE" 2>/dev/null)
        HEALTH_MONITOR_ENABLED="$enabled"

        local stall
        stall=$(yq e '.health_monitor.patterns.stall_detection // "true"' "$CONFIG_FILE" 2>/dev/null)
        HEALTH_STALL_DETECTION="$stall"

        local spiral
        spiral=$(yq e '.health_monitor.patterns.error_spiral // "true"' "$CONFIG_FILE" 2>/dev/null)
        HEALTH_ERROR_SPIRAL="$spiral"

        local bloat
        bloat=$(yq e '.health_monitor.patterns.context_bloat // "true"' "$CONFIG_FILE" 2>/dev/null)
        HEALTH_CONTEXT_BLOAT="$bloat"
    fi

    print_verbose "Health monitor initialized"
}

# =============================================================================
# Record Health Data
# =============================================================================

record_health_data() {
    local iteration="$1"
    local had_error="${2:-false}"
    local context_usage="${3:-0}"
    local iteration_duration="${4:-0}"

    # Record error
    HEALTH_ERROR_HISTORY+=("$had_error")
    # Keep last 10
    if [[ ${#HEALTH_ERROR_HISTORY[@]} -gt 10 ]]; then
        HEALTH_ERROR_HISTORY=("${HEALTH_ERROR_HISTORY[@]:1}")
    fi

    # Record context usage
    HEALTH_CONTEXT_HISTORY+=("$context_usage")
    if [[ ${#HEALTH_CONTEXT_HISTORY[@]} -gt 10 ]]; then
        HEALTH_CONTEXT_HISTORY=("${HEALTH_CONTEXT_HISTORY[@]:1}")
    fi

    # Record iteration duration
    HEALTH_ITERATION_HISTORY+=("$iteration_duration")
    if [[ ${#HEALTH_ITERATION_HISTORY[@]} -gt 10 ]]; then
        HEALTH_ITERATION_HISTORY=("${HEALTH_ITERATION_HISTORY[@]:1}")
    fi
}

# =============================================================================
# Check All Health Patterns
# =============================================================================

check_health_patterns() {
    if [[ "$HEALTH_MONITOR_ENABLED" != "true" ]]; then
        return 0
    fi

    HEALTH_WARNINGS=()
    local has_warning=false

    # Check stall detection
    if [[ "$HEALTH_STALL_DETECTION" == "true" ]]; then
        if detect_stall; then
            has_warning=true
        fi
    fi

    # Check error spiral
    if [[ "$HEALTH_ERROR_SPIRAL" == "true" ]]; then
        if detect_error_spiral; then
            has_warning=true
        fi
    fi

    # Check context bloat
    if [[ "$HEALTH_CONTEXT_BLOAT" == "true" ]]; then
        if detect_context_bloat; then
            has_warning=true
        fi
    fi

    # Check iteration slowdown
    if detect_iteration_slowdown; then
        has_warning=true
    fi

    # Update overall status
    if [[ "$has_warning" == "true" ]]; then
        if [[ ${#HEALTH_WARNINGS[@]} -ge 2 ]]; then
            HEALTH_STATUS="CRITICAL"
        else
            HEALTH_STATUS="WARNING"
        fi
        return 1
    else
        HEALTH_STATUS="HEALTHY"
        return 0
    fi
}

# =============================================================================
# Stall Detection
# =============================================================================

detect_stall() {
    # Check if circuit breaker is near threshold
    local cb_streak="${CB_ITERATIONS_WITHOUT_CHANGES:-0}"
    local cb_threshold="${CB_NO_CHANGES_THRESHOLD:-4}"

    if [[ $cb_streak -ge $((cb_threshold - 1)) ]]; then
        HEALTH_WARNINGS+=("Stall detected: No progress for $cb_streak iterations")
        return 0
    fi

    return 1
}

# =============================================================================
# Error Spiral Detection
# =============================================================================

detect_error_spiral() {
    local error_count=0
    local recent_count=${#HEALTH_ERROR_HISTORY[@]}

    if [[ $recent_count -lt 3 ]]; then
        return 1
    fi

    # Count errors in last 5 iterations
    local check_count=5
    if [[ $recent_count -lt $check_count ]]; then
        check_count=$recent_count
    fi

    for ((i=recent_count-check_count; i<recent_count; i++)); do
        if [[ "${HEALTH_ERROR_HISTORY[$i]}" == "true" ]]; then
            error_count=$((error_count + 1))
        fi
    done

    if [[ $error_count -ge $HEALTH_ERROR_SPIRAL_THRESHOLD ]]; then
        HEALTH_WARNINGS+=("Error spiral: $error_count errors in last $check_count iterations")
        return 0
    fi

    return 1
}

# =============================================================================
# Context Bloat Detection
# =============================================================================

detect_context_bloat() {
    local history_count=${#HEALTH_CONTEXT_HISTORY[@]}

    if [[ $history_count -lt 3 ]]; then
        return 1
    fi

    # Check if context is growing rapidly
    local first_idx=$((history_count - 3))
    local first_value=${HEALTH_CONTEXT_HISTORY[$first_idx]}
    local last_value=${HEALTH_CONTEXT_HISTORY[$((history_count - 1))]}

    if [[ $first_value -eq 0 ]]; then
        return 1
    fi

    local growth_rate=$(( (last_value - first_value) * 100 / first_value ))

    if [[ $growth_rate -ge $HEALTH_CONTEXT_GROWTH_RATE ]]; then
        HEALTH_WARNINGS+=("Context bloat: ${growth_rate}% growth in last 3 iterations (usage: ${last_value}%)")
        return 0
    fi

    # Check if approaching limit
    if [[ $last_value -ge 90 ]]; then
        HEALTH_WARNINGS+=("Context critical: ${last_value}% usage")
        return 0
    fi

    return 1
}

# =============================================================================
# Iteration Slowdown Detection
# =============================================================================

detect_iteration_slowdown() {
    local history_count=${#HEALTH_ITERATION_HISTORY[@]}

    if [[ $history_count -lt 3 ]]; then
        return 1
    fi

    # Compare first and last iteration times
    local first_idx=$((history_count - 3))
    local first_value=${HEALTH_ITERATION_HISTORY[$first_idx]}
    local last_value=${HEALTH_ITERATION_HISTORY[$((history_count - 1))]}

    if [[ $first_value -eq 0 ]]; then
        return 1
    fi

    local slowdown_rate=$(( (last_value - first_value) * 100 / first_value ))

    if [[ $slowdown_rate -ge $HEALTH_ITERATION_SLOWDOWN_RATE ]]; then
        HEALTH_WARNINGS+=("Iteration slowdown: ${slowdown_rate}% slower than baseline")
        return 0
    fi

    return 1
}

# =============================================================================
# Get Health Status
# =============================================================================

get_health_status() {
    cat <<EOF
{
    "status": "$HEALTH_STATUS",
    "warnings": $(printf '%s\n' "${HEALTH_WARNINGS[@]}" | jq -R . | jq -s .),
    "metrics": {
        "error_history_size": ${#HEALTH_ERROR_HISTORY[@]},
        "context_history_size": ${#HEALTH_CONTEXT_HISTORY[@]},
        "iteration_history_size": ${#HEALTH_ITERATION_HISTORY[@]}
    }
}
EOF
}

# =============================================================================
# Print Health Warnings
# =============================================================================

print_health_warnings() {
    if [[ ${#HEALTH_WARNINGS[@]} -eq 0 ]]; then
        return 0
    fi

    echo ""
    case "$HEALTH_STATUS" in
        CRITICAL)
            print_error "${MSG_HEALTH_CRITICAL:-Health Critical}"
            ;;
        WARNING)
            print_warning "${MSG_HEALTH_WARNING:-Health Warning}"
            ;;
    esac

    for warning in "${HEALTH_WARNINGS[@]}"; do
        echo "  - $warning"
    done
    echo ""
}

# =============================================================================
# Recommendations
# =============================================================================

get_health_recommendations() {
    local recommendations=()

    for warning in "${HEALTH_WARNINGS[@]}"; do
        case "$warning" in
            *"Stall"*)
                recommendations+=("Consider rephrasing the task or breaking it into smaller steps")
                ;;
            *"Error spiral"*)
                recommendations+=("Review recent error messages and address root cause")
                recommendations+=("Consider running manual debugging before continuing")
                ;;
            *"Context bloat"*)
                recommendations+=("Consider running /compact to free up context space")
                recommendations+=("Break large outputs into smaller chunks")
                ;;
            *"Context critical"*)
                recommendations+=("URGENT: Run /compact immediately or start new session")
                ;;
            *"slowdown"*)
                recommendations+=("Session may be degrading - consider checkpoint and restart")
                ;;
        esac
    done

    # Remove duplicates
    local unique_recs=()
    for rec in "${recommendations[@]}"; do
        local is_dup=false
        for urec in "${unique_recs[@]}"; do
            if [[ "$rec" == "$urec" ]]; then
                is_dup=true
                break
            fi
        done
        if [[ "$is_dup" == "false" ]]; then
            unique_recs+=("$rec")
        fi
    done

    printf '%s\n' "${unique_recs[@]}"
}

# =============================================================================
# Auto-Recovery Suggestions
# =============================================================================

suggest_recovery_action() {
    if [[ "$HEALTH_STATUS" == "HEALTHY" ]]; then
        echo "none"
        return 0
    fi

    # Priority-based suggestions
    for warning in "${HEALTH_WARNINGS[@]}"; do
        case "$warning" in
            *"Context critical"*)
                echo "force_compact"
                return 0
                ;;
            *"Context bloat"*)
                echo "preventive_compact"
                return 0
                ;;
            *"Error spiral"*)
                echo "pause_and_review"
                return 0
                ;;
            *"Stall"*)
                echo "rephrase_task"
                return 0
                ;;
        esac
    done

    echo "monitor"
}

# =============================================================================
# Health Report
# =============================================================================

generate_health_report() {
    local session_id="$1"

    echo "=============================================="
    echo "  Ralph Wiggum Health Report"
    echo "=============================================="
    echo ""
    echo "Session: $session_id"
    echo "Status: $HEALTH_STATUS"
    echo ""

    if [[ ${#HEALTH_WARNINGS[@]} -gt 0 ]]; then
        echo "Warnings:"
        for warning in "${HEALTH_WARNINGS[@]}"; do
            echo "  - $warning"
        done
        echo ""

        echo "Recommendations:"
        get_health_recommendations | while read -r rec; do
            echo "  - $rec"
        done
        echo ""

        echo "Suggested Action: $(suggest_recovery_action)"
    else
        echo "No health issues detected."
    fi

    echo ""
    echo "=============================================="
}
