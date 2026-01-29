#!/bin/bash
# =============================================================================
# Ralph Wiggum - Metrics Exporter Module
# Export session metrics in JSON and Prometheus formats
# =============================================================================

# Metrics state
METRICS_ENABLED="${METRICS_ENABLED:-true}"
METRICS_FORMAT="${METRICS_FORMAT:-json}"
METRICS_REALTIME_ENABLED="${METRICS_REALTIME_ENABLED:-true}"
METRICS_REALTIME_INTERVAL="${METRICS_REALTIME_INTERVAL:-1000}"

# Metrics data
declare -A METRICS_DATA
METRICS_START_TIME=0
METRICS_ITERATION_TIMES=()
METRICS_CONTEXT_SAMPLES=()
METRICS_DOD_CHECKS=0
METRICS_DOD_PASSED=0

# =============================================================================
# Initialization
# =============================================================================

init_metrics_exporter() {
    METRICS_START_TIME=$(date +%s)
    METRICS_ITERATION_TIMES=()
    METRICS_CONTEXT_SAMPLES=()
    METRICS_DOD_CHECKS=0
    METRICS_DOD_PASSED=0

    # Load settings from config if available
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local enabled
        enabled=$(yq e '.metrics.enabled // "true"' "$CONFIG_FILE" 2>/dev/null)
        METRICS_ENABLED="$enabled"

        local format
        format=$(yq e '.metrics.format // "json"' "$CONFIG_FILE" 2>/dev/null)
        METRICS_FORMAT="$format"

        local realtime
        realtime=$(yq e '.metrics.realtime.enabled // "true"' "$CONFIG_FILE" 2>/dev/null)
        METRICS_REALTIME_ENABLED="$realtime"

        local interval
        interval=$(yq e '.metrics.realtime.interval_ms // "1000"' "$CONFIG_FILE" 2>/dev/null)
        if [[ "$interval" =~ ^[0-9]+$ ]]; then
            METRICS_REALTIME_INTERVAL="$interval"
        fi
    fi

    print_verbose "Metrics exporter initialized (format: $METRICS_FORMAT)"
}

# =============================================================================
# Metrics Collection
# =============================================================================

record_iteration_start() {
    local iteration="$1"
    METRICS_DATA["iteration_${iteration}_start"]=$(date +%s%3N)
}

record_iteration_end() {
    local iteration="$1"
    local end_time=$(date +%s%3N)
    local start_time="${METRICS_DATA["iteration_${iteration}_start"]:-$end_time}"
    local duration=$((end_time - start_time))

    METRICS_ITERATION_TIMES+=("$duration")
    METRICS_DATA["iteration_${iteration}_duration"]="$duration"
}

record_context_usage() {
    local usage_percent="$1"
    METRICS_CONTEXT_SAMPLES+=("$usage_percent")
    METRICS_DATA["last_context_usage"]="$usage_percent"
}

record_dod_check() {
    local passed="$1"
    METRICS_DOD_CHECKS=$((METRICS_DOD_CHECKS + 1))
    if [[ "$passed" == "true" ]]; then
        METRICS_DOD_PASSED=$((METRICS_DOD_PASSED + 1))
    fi
}

record_circuit_breaker_state() {
    local triggered="$1"
    local streak="$2"
    METRICS_DATA["cb_triggered"]="$triggered"
    METRICS_DATA["cb_no_progress_streak"]="$streak"
}

record_compact_event() {
    local count="${METRICS_DATA["compacts_performed"]:-0}"
    METRICS_DATA["compacts_performed"]=$((count + 1))
}

# =============================================================================
# Statistical Calculations
# =============================================================================

calculate_average() {
    local -n arr=$1
    local sum=0
    local count=${#arr[@]}

    if [[ $count -eq 0 ]]; then
        echo "0"
        return
    fi

    for val in "${arr[@]}"; do
        sum=$((sum + val))
    done

    echo $((sum / count))
}

calculate_p95() {
    local -n arr=$1
    local count=${#arr[@]}

    if [[ $count -eq 0 ]]; then
        echo "0"
        return
    fi

    # Sort the array
    local sorted=($(printf '%s\n' "${arr[@]}" | sort -n))

    # Calculate P95 index (95th percentile)
    local idx=$(( (count * 95) / 100 ))
    if [[ $idx -ge $count ]]; then
        idx=$((count - 1))
    fi

    echo "${sorted[$idx]}"
}

calculate_max() {
    local -n arr=$1
    local max=0

    for val in "${arr[@]}"; do
        if [[ $val -gt $max ]]; then
            max=$val
        fi
    done

    echo "$max"
}

# =============================================================================
# JSON Export
# =============================================================================

export_metrics_json() {
    local session_id="$1"
    local status="${2:-running}"

    local end_time=$(date +%s)
    local duration=$((end_time - METRICS_START_TIME))

    # Calculate statistics
    local total_iterations=${#METRICS_ITERATION_TIMES[@]}
    local successful_iterations=$((total_iterations - ${METRICS_DATA["cb_no_progress_streak"]:-0}))
    local avg_duration=$(calculate_average METRICS_ITERATION_TIMES)
    local p95_response=$(calculate_p95 METRICS_ITERATION_TIMES)
    local peak_context=$(calculate_max METRICS_CONTEXT_SAMPLES)

    # Build JSON
    cat <<EOF
{
    "session": {
        "id": "$session_id",
        "duration_seconds": $duration,
        "status": "$status",
        "started_at": "$(date -d "@$METRICS_START_TIME" -Iseconds 2>/dev/null || date -r "$METRICS_START_TIME" -Iseconds 2>/dev/null || echo "unknown")"
    },
    "iterations": {
        "total": $total_iterations,
        "successful": $successful_iterations,
        "average_duration_ms": $avg_duration
    },
    "circuit_breaker": {
        "triggered": ${METRICS_DATA["cb_triggered"]:-false},
        "peak_no_progress_streak": ${METRICS_DATA["cb_no_progress_streak"]:-0}
    },
    "context": {
        "compacts_performed": ${METRICS_DATA["compacts_performed"]:-0},
        "peak_usage_percent": $peak_context
    },
    "dod": {
        "passed": $([ "$METRICS_DOD_PASSED" -gt 0 ] && echo "true" || echo "false"),
        "checks_performed": $METRICS_DOD_CHECKS
    },
    "performance": {
        "p95_response_time_ms": $p95_response
    }
}
EOF
}

# =============================================================================
# Prometheus Export
# =============================================================================

export_metrics_prometheus() {
    local session_id="$1"
    local status="${2:-running}"

    local end_time=$(date +%s)
    local duration=$((end_time - METRICS_START_TIME))

    # Calculate statistics
    local total_iterations=${#METRICS_ITERATION_TIMES[@]}
    local successful_iterations=$((total_iterations - ${METRICS_DATA["cb_no_progress_streak"]:-0}))
    local avg_duration=$(calculate_average METRICS_ITERATION_TIMES)
    local p95_response=$(calculate_p95 METRICS_ITERATION_TIMES)
    local peak_context=$(calculate_max METRICS_CONTEXT_SAMPLES)

    # Build Prometheus format
    cat <<EOF
# HELP ralph_session_duration_seconds Duration of the Ralph session in seconds
# TYPE ralph_session_duration_seconds gauge
ralph_session_duration_seconds{session_id="$session_id"} $duration

# HELP ralph_iterations_total Total number of iterations
# TYPE ralph_iterations_total counter
ralph_iterations_total{session_id="$session_id"} $total_iterations

# HELP ralph_iterations_successful Number of successful iterations
# TYPE ralph_iterations_successful counter
ralph_iterations_successful{session_id="$session_id"} $successful_iterations

# HELP ralph_iteration_duration_ms_avg Average iteration duration in milliseconds
# TYPE ralph_iteration_duration_ms_avg gauge
ralph_iteration_duration_ms_avg{session_id="$session_id"} $avg_duration

# HELP ralph_iteration_duration_ms_p95 P95 iteration duration in milliseconds
# TYPE ralph_iteration_duration_ms_p95 gauge
ralph_iteration_duration_ms_p95{session_id="$session_id"} $p95_response

# HELP ralph_circuit_breaker_triggered Whether the circuit breaker was triggered
# TYPE ralph_circuit_breaker_triggered gauge
ralph_circuit_breaker_triggered{session_id="$session_id"} $([ "${METRICS_DATA["cb_triggered"]}" == "true" ] && echo "1" || echo "0")

# HELP ralph_no_progress_streak Current no-progress streak
# TYPE ralph_no_progress_streak gauge
ralph_no_progress_streak{session_id="$session_id"} ${METRICS_DATA["cb_no_progress_streak"]:-0}

# HELP ralph_context_compacts_total Total number of context compacts
# TYPE ralph_context_compacts_total counter
ralph_context_compacts_total{session_id="$session_id"} ${METRICS_DATA["compacts_performed"]:-0}

# HELP ralph_context_usage_percent_peak Peak context usage percentage
# TYPE ralph_context_usage_percent_peak gauge
ralph_context_usage_percent_peak{session_id="$session_id"} $peak_context

# HELP ralph_dod_checks_total Total number of DoD checks
# TYPE ralph_dod_checks_total counter
ralph_dod_checks_total{session_id="$session_id"} $METRICS_DOD_CHECKS

# HELP ralph_dod_passed Whether DoD passed
# TYPE ralph_dod_passed gauge
ralph_dod_passed{session_id="$session_id"} $([ "$METRICS_DOD_PASSED" -gt 0 ] && echo "1" || echo "0")
EOF
}

# =============================================================================
# Export to File
# =============================================================================

save_metrics_export() {
    local session_id="$1"
    local status="${2:-completed}"
    local session_dir="$RALPH_SESSION_BASE/sessions/$session_id"

    if [[ "$METRICS_ENABLED" != "true" ]]; then
        return 0
    fi

    # Ensure session directory exists
    mkdir -p "$session_dir"

    # Export based on format
    case "$METRICS_FORMAT" in
        json)
            export_metrics_json "$session_id" "$status" > "$session_dir/metrics-export.json"
            ;;
        prometheus)
            export_metrics_prometheus "$session_id" "$status" > "$session_dir/metrics-export.prom"
            ;;
        both)
            export_metrics_json "$session_id" "$status" > "$session_dir/metrics-export.json"
            export_metrics_prometheus "$session_id" "$status" > "$session_dir/metrics-export.prom"
            ;;
    esac

    print_verbose "Metrics exported to $session_dir"
}

# =============================================================================
# Real-time Metrics (for dashboard)
# =============================================================================

get_realtime_metrics() {
    local session_id="$1"

    local end_time=$(date +%s)
    local duration=$((end_time - METRICS_START_TIME))
    local total_iterations=${#METRICS_ITERATION_TIMES[@]}
    local peak_context=$(calculate_max METRICS_CONTEXT_SAMPLES)

    # Return compact JSON for dashboard
    cat <<EOF
{
    "duration": $duration,
    "iterations": $total_iterations,
    "context_usage": ${METRICS_DATA["last_context_usage"]:-0},
    "peak_context": $peak_context,
    "cb_streak": ${METRICS_DATA["cb_no_progress_streak"]:-0},
    "dod_checks": $METRICS_DOD_CHECKS,
    "compacts": ${METRICS_DATA["compacts_performed"]:-0}
}
EOF
}

# =============================================================================
# Metrics Aggregation for History
# =============================================================================

aggregate_session_metrics() {
    local history_file="$RALPH_SESSION_BASE/history/metrics-history.json"
    local session_id="$1"

    # Ensure history directory exists
    mkdir -p "$(dirname "$history_file")"

    # Initialize history file if needed
    if [[ ! -f "$history_file" ]]; then
        echo '{"sessions": []}' > "$history_file"
    fi

    # Get current metrics
    local metrics
    metrics=$(export_metrics_json "$session_id" "completed")

    # Append to history (keep last 100 sessions)
    local tmp_file="${history_file}.tmp.$$"
    if jq --argjson new "$metrics" '
        .sessions = (.sessions + [$new] | .[-100:])
    ' "$history_file" > "$tmp_file" 2>/dev/null; then
        mv "$tmp_file" "$history_file"
    else
        rm -f "$tmp_file"
    fi
}

# =============================================================================
# Historical Analytics
# =============================================================================

get_historical_stats() {
    local history_file="$RALPH_SESSION_BASE/history/metrics-history.json"

    if [[ ! -f "$history_file" ]]; then
        echo '{"sessions_count": 0, "avg_duration": 0, "avg_iterations": 0, "success_rate": 0}'
        return
    fi

    jq '
        {
            sessions_count: (.sessions | length),
            avg_duration: (if (.sessions | length) > 0 then (.sessions | map(.session.duration_seconds) | add / length | floor) else 0 end),
            avg_iterations: (if (.sessions | length) > 0 then (.sessions | map(.iterations.total) | add / length | floor) else 0 end),
            success_rate: (if (.sessions | length) > 0 then (.sessions | map(select(.dod.passed == true)) | length) / (.sessions | length) * 100 | floor else 0 end)
        }
    ' "$history_file" 2>/dev/null || echo '{"sessions_count": 0, "avg_duration": 0, "avg_iterations": 0, "success_rate": 0}'
}
