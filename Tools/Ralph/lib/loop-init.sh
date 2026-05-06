#!/bin/bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum — Loop initialisation
#
# Extracted from ralph.sh::run_ralph() (lines 436-499) in audit-driven release
# v8.3.x (Sprint 4 deep refactor of ARCH-002). Splits the original monolithic
# init phase into two functions because session creation needs to happen in
# between (it is the only step that produces SESSION_ID, which the post-session
# inits then consume).
#
# Pattern:
#   run_ralph()
#     ralph_init_loop_pre_session             # Bloc A : metrics/dashboard/health/hooks
#     create_session OR resume_session        # Bloc B : produces SESSION_ID (stays inline)
#     ralph_init_loop_post_session "$SESSION_ID"  # Bloc C : circuit breaker, autonomous, context manager
#
# Sourced by ralph.sh::load_modules(). Depends on functions provided by
# previously-loaded modules:
#   - init_metrics_exporter            → metrics-exporter.sh
#   - init_dashboard                   → dashboard.sh
#   - init_health_monitor              → health-monitor.sh
#   - init_hooks                       → hooks-generator.sh
#   - init_circuit_breaker             → circuit-breaker.sh
#   - enable_autonomous_mode           → circuit-breaker.sh
#   - init_recovery_engine             → recovery-engine.sh
#   - init_escalation_service          → escalation-service.sh
#   - init_context_manager             → context-manager.sh
#   - export_session_context_for_hooks → hooks-generator.sh
#   - print_info, print_verbose        → ralph.sh (helpers)
#
# Reads global variables AUTONOMOUS_MODE, PROMPT, MAX_ITERATIONS, TIMEOUT,
# MSG_STARTING_LOOP, MSG_SESSION_ID — owned by parse_args/load_messages, never
# mutated here.
# =============================================================================

# Initialise observability subsystems that do NOT need a session id yet.
# Idempotent if any module is missing (each call is type-guarded).
ralph_init_loop_pre_session() {
    if type init_metrics_exporter &>/dev/null; then
        init_metrics_exporter
    fi

    if type init_dashboard &>/dev/null; then
        init_dashboard
    fi

    if type init_health_monitor &>/dev/null; then
        init_health_monitor
    fi

    if type init_hooks &>/dev/null; then
        init_hooks
    fi
}

# Initialise resilience and context subsystems that depend on the session id.
# Must be called after the session has been created or resumed.
#
# Arguments:
#   $1 session_id — Ralph session identifier, just produced by Bloc B.
ralph_init_loop_post_session() {
    local session_id="$1"

    # Initialize circuit breaker — always present (loaded ahead of this module).
    init_circuit_breaker

    # Enable autonomous mode if requested
    if [[ "${AUTONOMOUS_MODE:-false}" == "true" ]]; then
        if type enable_autonomous_mode &>/dev/null; then
            enable_autonomous_mode
        fi

        if type init_recovery_engine &>/dev/null; then
            init_recovery_engine
        fi

        if type init_escalation_service &>/dev/null; then
            init_escalation_service
        fi
    fi

    # Initialize context manager (auto-compact)
    if type init_context_manager &>/dev/null; then
        init_context_manager
    fi

    print_info "${MSG_STARTING_LOOP}..."
    print_verbose "${MSG_SESSION_ID}: $session_id"
    print_verbose "Max iterations: $MAX_ITERATIONS"
    print_verbose "Timeout: ${TIMEOUT}ms"

    # Export session context for hooks
    if type export_session_context_for_hooks &>/dev/null; then
        export_session_context_for_hooks "$session_id" "STARTING" "$PROMPT"
    fi
}
