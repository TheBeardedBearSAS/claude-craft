#!/bin/bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum — Per-iteration observability sinks
#
# Extracted from ralph.sh::run_ralph() (lines 644-669) in audit-driven release
# v8.3.x (Sprint 4 deep refactor of ARCH-002). All calls in this module are
# one-way observability sinks — nothing they produce is read by the rest of
# the iteration body, which makes this the lowest-risk extraction candidate.
#
# Sourced by ralph.sh::load_modules(). Depends on functions provided by
# previously-loaded modules:
#   - update_session_metrics    → session.sh
#   - record_iteration_end      → metrics-exporter.sh
#   - record_health_data        → metrics-exporter.sh
#   - check_health_patterns     → health-monitor.sh
#   - print_health_warnings     → health-monitor.sh
#   - create_checkpoint         → checkpoint.sh
#
# Each call site preserves the original `type X &>/dev/null` guards so a
# missing module degrades gracefully (matches behaviour pre-refactor).
# =============================================================================

# Record metrics, health data, and a checkpoint at the end of one iteration.
#
# Arguments:
#   $1 session_id     — current Ralph session identifier
#   $2 iteration      — 1-based iteration counter
#   $3 response       — last Claude response (used by the checkpoint)
#   $4 invoke_status  — exit code from the last invoke_claude call
#
# Reads global associative array METRICS_DATA (declared by metrics-exporter.sh).
# Side effects: writes session metrics, health JSON, checkpoint files under
# the session directory. No return value.
ralph_record_iteration_observability() {
    local session_id="$1"
    local iteration="$2"
    local response="$3"
    local invoke_status="$4"

    # Update metrics — always present (session.sh is loaded before this module).
    update_session_metrics "$session_id" "$iteration" "$response"

    # Record iteration end for metrics
    if type record_iteration_end &>/dev/null; then
        record_iteration_end "$iteration"
    fi

    # Record health data
    if type record_health_data &>/dev/null; then
        local had_error="false"
        [[ $invoke_status -ne 0 ]] && had_error="true"
        record_health_data "$iteration" "$had_error" "${METRICS_DATA["last_context_usage"]:-0}" "${METRICS_DATA["iteration_${iteration}_duration"]:-0}"
    fi

    # Check health patterns
    if type check_health_patterns &>/dev/null; then
        if ! check_health_patterns; then
            if type print_health_warnings &>/dev/null; then
                print_health_warnings
            fi
        fi
    fi

    # Create checkpoint (async if configured)
    create_checkpoint "$session_id" "$iteration"
}
