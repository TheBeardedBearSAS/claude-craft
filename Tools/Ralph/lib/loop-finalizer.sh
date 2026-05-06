#!/bin/bash
# =============================================================================
# Ralph Wiggum — Post-loop finalisation
#
# Extracted from ralph.sh::run_ralph() (lines 688-741) in audit-driven release
# v8.3.x (Sprint 4 deep refactor of ARCH-002). This block runs once after the
# main while-loop exits. It is a sequence of one-way calls to finalise every
# observability subsystem and persist the session — none of these calls feed
# back into the loop, which is what makes the extraction safe.
#
# Sourced by ralph.sh::load_modules(). Depends on functions provided by
# previously-loaded modules:
#   - save_sprint_progress           → sprint-progress.sh
#   - save_metrics_export            → metrics-exporter.sh
#   - aggregate_session_metrics      → metrics-exporter.sh
#   - record_circuit_breaker_outcome → circuit-breaker.sh
#   - finalize_dashboard             → dashboard.sh
#   - print_summary                  → ralph.sh (defined locally, sourced)
#   - save_session                   → session.sh
#   - print_warning                  → ralph.sh (helper)
#
# Reads global variables MAX_ITERATIONS, MSG_CB_MAX_REACHED, CB_ADAPTIVE_ENABLED,
# CB_CURRENT_PROFILE — each owned by parse_args/load_messages/circuit-breaker.sh
# respectively, never mutated here.
# =============================================================================

# Run all post-loop finalisation steps and exit with the appropriate code.
#
# Arguments:
#   $1 session_id   — current Ralph session identifier
#   $2 iteration    — final iteration count (1-based)
#   $3 dod_passed   — "true" if Definition of Done validated, else "false"
#   $4 exit_reason  — initial exit reason from the loop body (may be "")
#   $5 start_time   — epoch seconds at loop start (for duration computation)
#
# Returns 0 if Definition of Done passed, 1 otherwise — same contract as the
# original inline code.
ralph_finalize_loop() {
    local session_id="$1"
    local iteration="$2"
    local dod_passed="$3"
    local exit_reason="$4"
    local start_time="$5"

    # Refine exit_reason if max iterations reached without DoD passing.
    if [[ $iteration -ge $MAX_ITERATIONS && "$dod_passed" != "true" ]]; then
        exit_reason="max_iterations"
        print_warning "${MSG_CB_MAX_REACHED}"
    fi

    # Calculate duration
    local end_time
    end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Save sprint progress before summary
    if type save_sprint_progress &>/dev/null; then
        save_sprint_progress "$session_id"
    fi

    # Save metrics export
    if type save_metrics_export &>/dev/null; then
        local final_status="completed"
        [[ "$dod_passed" != "true" ]] && final_status="failed"
        save_metrics_export "$session_id" "$final_status"
    fi

    # Aggregate metrics for history
    if type aggregate_session_metrics &>/dev/null; then
        aggregate_session_metrics "$session_id"
    fi

    # Record circuit breaker outcome for learning
    if type record_circuit_breaker_outcome &>/dev/null && [[ "${CB_ADAPTIVE_ENABLED:-false}" == "true" ]]; then
        local success="false"
        [[ "$dod_passed" == "true" ]] && success="true"
        record_circuit_breaker_outcome "${CB_CURRENT_PROFILE:-default}" "$success" "$iteration"
    fi

    # Finalize dashboard
    if type finalize_dashboard &>/dev/null; then
        local dash_status="completed"
        [[ "$dod_passed" != "true" ]] && dash_status="failed"
        [[ "$exit_reason" == "circuit_breaker" ]] && dash_status="interrupted"
        finalize_dashboard "$dash_status"
    fi

    # Print summary
    print_summary "$session_id" "$iteration" "$duration" "$dod_passed" "$exit_reason"

    # Save final state
    save_session "$session_id" "$exit_reason"

    # Return appropriate exit code (preserves run_ralph's pre-refactor contract)
    if [[ "$dod_passed" == "true" ]]; then
        return 0
    else
        return 1
    fi
}
