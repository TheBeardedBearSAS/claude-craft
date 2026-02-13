#!/usr/bin/env bash
# =============================================================================
# Agent Teams - Cost Dashboard
# Displays a comparative cost/time table BEFORE launching a team operation
#
# Uses cost-estimator.sh functions internally for calculations.
# =============================================================================
set -euo pipefail

# =============================================================================
# Resolve script directory and source dependencies
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/cost-estimator.sh"

# =============================================================================
# Dashboard Box Drawing Characters
# =============================================================================

DASH_TL="╔"
DASH_TR="╗"
DASH_BL="╚"
DASH_BR="╝"
DASH_H="═"
DASH_V="║"
DASH_ML="╠"
DASH_MR="╣"

# =============================================================================
# Dashboard Configuration
# =============================================================================

DASHBOARD_WIDTH=60
DRY_RUN=false
MAX_COST=""

# =============================================================================
# Usage
# =============================================================================

show_help() {
    cat <<'HELP'
Agent Teams - Cost Dashboard

Displays a comparative table showing estimated cost, time, and token
usage for sequential vs parallel execution BEFORE launching a team.

USAGE:
    cost-dashboard.sh [OPTIONS]

OPTIONS:
    --techs N           Number of technology stacks (default: 2)
    --checks N          Number of checks per technology (default: 5)
    --worker-model M    Worker agent model: haiku|sonnet|opus (default: sonnet)
    --leader-model M    Leader agent model: haiku|sonnet|opus (default: opus)
    --tokens-per-check N  Override tokens per check estimate (default: 12500)
    --fast-mode         Use Fast Mode pricing (6x cost for Opus)
    --max-cost N        Maximum budget in dollars; shows WITHIN_BUDGET status
    --width N           Dashboard width in characters (default: 60)
    --dry-run           Show what would be displayed without color
    --help              Show this help

EXAMPLES:
    # Show cost comparison for 2-tech project
    cost-dashboard.sh --techs 2 --checks 5

    # Cost comparison with Haiku workers (cheaper)
    cost-dashboard.sh --techs 3 --worker-model haiku

    # Dry-run to see plain-text output
    cost-dashboard.sh --techs 2 --dry-run

RECOMMENDATION LOGIC:
    USE PARALLEL when:
      - Time saved > 30% AND extra token cost < 50%
    STAY SEQUENTIAL otherwise.
HELP
}

# =============================================================================
# Argument Parsing
# =============================================================================

dashboard_parse_args() {
    local n_techs=$DEFAULT_TECHS
    local n_checks=$DEFAULT_CHECKS
    local worker_model=$DEFAULT_WORKER_MODEL
    local leader_model=$DEFAULT_LEADER_MODEL
    local tokens_check=$TOKENS_PER_CHECK

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --techs)
                n_techs="$2"
                shift 2
                ;;
            --checks)
                n_checks="$2"
                shift 2
                ;;
            --worker-model)
                worker_model="$2"
                shift 2
                ;;
            --leader-model)
                leader_model="$2"
                shift 2
                ;;
            --tokens-per-check)
                tokens_check="$2"
                shift 2
                ;;
            --fast-mode)
                FAST_MODE=true
                shift
                ;;
            --max-cost)
                MAX_COST="$2"
                shift 2
                ;;
            --width)
                DASHBOARD_WIDTH="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                echo "ERROR: Unknown option: $1" >&2
                echo "Use --help for usage information." >&2
                exit 1
                ;;
        esac
    done

    # Validate inputs
    if [[ ! "$n_techs" =~ ^[1-9][0-9]*$ ]]; then
        echo "ERROR: --techs must be a positive integer, got: $n_techs" >&2
        exit 1
    fi
    if [[ ! "$n_checks" =~ ^[1-9][0-9]*$ ]]; then
        echo "ERROR: --checks must be a positive integer, got: $n_checks" >&2
        exit 1
    fi
    if [[ -z "${MODEL_INPUT_PRICE[$worker_model]+x}" ]]; then
        echo "ERROR: --worker-model must be haiku|sonnet|opus, got: $worker_model" >&2
        exit 1
    fi
    if [[ -z "${MODEL_INPUT_PRICE[$leader_model]+x}" ]]; then
        echo "ERROR: --leader-model must be haiku|sonnet|opus, got: $leader_model" >&2
        exit 1
    fi

    # Export to globals
    N_TECHS=$n_techs
    N_CHECKS=$n_checks
    WORKER_MODEL=$worker_model
    LEADER_MODEL=$leader_model
    TOKENS_PER_CHECK=$tokens_check
}

# =============================================================================
# Dashboard Rendering Helpers
# =============================================================================

# Print a horizontal line
dash_line() {
    local char="${1:-$DASH_H}"
    local left="${2:-$DASH_TL}"
    local right="${3:-$DASH_TR}"
    local w=$((DASHBOARD_WIDTH - 2))

    printf "%s" "$left"
    for ((i = 0; i < w; i++)); do printf "%s" "$char"; done
    printf "%s\n" "$right"
}

# Print a padded content line
dash_content() {
    local text="$1"
    local text_len=${#text}
    local padding=$((DASHBOARD_WIDTH - text_len - 4))

    if [[ $padding -lt 0 ]]; then
        padding=0
    fi

    printf "%s  %s%*s%s\n" "$DASH_V" "$text" "$padding" "" "$DASH_V"
}

# Print an empty line inside the box
dash_empty() {
    local w=$((DASHBOARD_WIDTH - 2))
    printf "%s%*s%s\n" "$DASH_V" "$w" "" "$DASH_V"
}

# =============================================================================
# Main Dashboard Display
# =============================================================================

render_cost_dashboard() {
    # Calculate all estimates
    local seq_tokens
    local par_tokens
    local seq_time
    local par_time
    local seq_cost
    local par_cost
    local recommendation
    local break_even

    seq_tokens=$(estimate_sequential_tokens "$N_TECHS" "$N_CHECKS" "$TOKENS_PER_CHECK")
    par_tokens=$(estimate_parallel_tokens "$N_TECHS" "$N_CHECKS" "$TOKENS_PER_CHECK" "$WORKER_MODEL")
    seq_time=$(estimate_sequential_time "$N_TECHS" "$N_CHECKS")
    par_time=$(estimate_parallel_time "$N_TECHS" "$N_CHECKS")
    seq_cost=$(calculate_cost "$LEADER_MODEL" "$seq_tokens")
    par_cost=$(calculate_parallel_cost "$LEADER_MODEL" "$WORKER_MODEL" "$par_tokens" "$N_TECHS")
    recommendation=$(get_recommendation "$seq_time" "$par_time" "$seq_tokens" "$par_tokens")
    break_even=$(calculate_break_even "$N_TECHS")

    # Derived values
    local token_overhead_pct
    token_overhead_pct=$(awk "BEGIN {
        if ($seq_tokens <= 0) print 0
        else printf \"%d\", (($par_tokens - $seq_tokens) / $seq_tokens) * 100
    }")

    local time_saved_pct
    time_saved_pct=$(awk "BEGIN {
        if ($seq_time <= 0) print 0
        else printf \"%d\", (($seq_time - $par_time) / $seq_time) * 100
    }")

    local time_saved_min
    time_saved_min=$(awk "BEGIN { printf \"%.1f\", $seq_time - $par_time }")

    local seq_tokens_fmt
    seq_tokens_fmt=$(format_tokens "$seq_tokens")

    local par_tokens_fmt
    par_tokens_fmt=$(format_tokens "$par_tokens")

    local seq_cost_fmt
    seq_cost_fmt=$(format_cost "$seq_cost")

    local par_cost_fmt
    par_cost_fmt=$(format_cost "$par_cost")

    # Render the dashboard box
    echo ""
    dash_line "$DASH_H" "$DASH_TL" "$DASH_TR"
    dash_content "Agent Teams Cost Estimate"
    dash_line "$DASH_H" "$DASH_ML" "$DASH_MR"
    dash_content "Config: ${N_TECHS} techs x ${N_CHECKS} checks | ${WORKER_MODEL} workers"
    dash_line "$DASH_H" "$DASH_ML" "$DASH_MR"
    if [[ "$FAST_MODE" == "true" ]]; then
        dash_content "WARNING: Fast Mode ON - Opus cost 6x higher!"
        dash_line "$DASH_H" "$DASH_ML" "$DASH_MR"
    fi
    dash_content "Sequential: ~${seq_tokens_fmt} tokens | ~${seq_time} min | ~${seq_cost_fmt}"
    dash_content "Parallel:   ~${par_tokens_fmt} tokens | ~${par_time} min | ~${par_cost_fmt}"
    dash_line "$DASH_H" "$DASH_ML" "$DASH_MR"
    dash_content "Time saved: ${time_saved_min} min (${time_saved_pct}%)"
    dash_content "Extra cost: +${token_overhead_pct}% tokens"
    dash_content "Break-even: ${break_even}"
    dash_line "$DASH_H" "$DASH_ML" "$DASH_MR"
    # A3: Budget guard display
    if [[ -n "$MAX_COST" ]]; then
        local within_budget
        within_budget=$(awk "BEGIN {
            if ($par_cost <= $MAX_COST) print \"YES\"
            else print \"NO - OVER BUDGET\"
        }")
        dash_content "Budget: \$${MAX_COST} | Within budget: ${within_budget}"
        dash_line "$DASH_H" "$DASH_ML" "$DASH_MR"
    fi
    dash_content "Recommendation: ${recommendation}"
    dash_line "$DASH_H" "$DASH_BL" "$DASH_BR"
    echo ""
}

# =============================================================================
# Dry Run: Plain Text Output
# =============================================================================

render_dry_run_dashboard() {
    local seq_tokens
    local par_tokens

    seq_tokens=$(estimate_sequential_tokens "$N_TECHS" "$N_CHECKS" "$TOKENS_PER_CHECK")
    par_tokens=$(estimate_parallel_tokens "$N_TECHS" "$N_CHECKS" "$TOKENS_PER_CHECK" "$WORKER_MODEL")

    local seq_time par_time seq_cost par_cost recommendation

    seq_time=$(estimate_sequential_time "$N_TECHS" "$N_CHECKS")
    par_time=$(estimate_parallel_time "$N_TECHS" "$N_CHECKS")
    seq_cost=$(calculate_cost "$LEADER_MODEL" "$seq_tokens")
    par_cost=$(calculate_parallel_cost "$LEADER_MODEL" "$WORKER_MODEL" "$par_tokens" "$N_TECHS")
    recommendation=$(get_recommendation "$seq_time" "$par_time" "$seq_tokens" "$par_tokens")

    local token_overhead_pct
    token_overhead_pct=$(awk "BEGIN {
        if ($seq_tokens <= 0) print 0
        else printf \"%d\", (($par_tokens - $seq_tokens) / $seq_tokens) * 100
    }")

    local time_saved_pct
    time_saved_pct=$(awk "BEGIN {
        if ($seq_time <= 0) print 0
        else printf \"%d\", (($seq_time - $par_time) / $seq_time) * 100
    }")

    cat <<EOF
=== Agent Teams Cost Estimate (Dry Run) ===

Configuration:
  Technologies:    $N_TECHS
  Checks per tech: $N_CHECKS
  Worker model:    $WORKER_MODEL
  Leader model:    $LEADER_MODEL
  Agents:          $((N_TECHS + 1)) (1 leader + $N_TECHS workers)
  Fast Mode:     $FAST_MODE
EOF
    if [[ "$FAST_MODE" == "true" ]]; then
        cat <<EOF

  WARNING: Fast Mode is enabled!
  Opus pricing: \$${MODEL_INPUT_PRICE_FAST[opus]} / \$${MODEL_OUTPUT_PRICE_FAST[opus]} (6x standard)
EOF
    fi
    cat <<EOF

Sequential Estimate:
  Tokens: ~$(format_tokens "$seq_tokens")
  Time:   ~${seq_time} min
  Cost:   ~$(format_cost "$seq_cost")

Parallel Estimate:
  Tokens: ~$(format_tokens "$par_tokens")
  Time:   ~${par_time} min
  Cost:   ~$(format_cost "$par_cost")

Comparison:
  Time saved:   $(awk "BEGIN { printf \"%.1f\", $seq_time - $par_time }") min (${time_saved_pct}%)
  Extra tokens: +${token_overhead_pct}%
EOF
    if [[ -n "$MAX_COST" ]]; then
        local within_budget
        within_budget=$(awk "BEGIN {
            if ($par_cost <= $MAX_COST) print \"YES\"
            else print \"NO - OVER BUDGET\"
        }")
        cat <<EOF

Budget:
  Max cost:      \$$MAX_COST
  Within budget: $within_budget
EOF
    fi
    cat <<EOF

Recommendation: $recommendation
EOF
}

# =============================================================================
# Public API: display_cost_dashboard
# Can be called from other scripts after sourcing this file
# =============================================================================

display_cost_dashboard() {
    local techs="${1:-$DEFAULT_TECHS}"
    local checks="${2:-$DEFAULT_CHECKS}"
    local worker="${3:-$DEFAULT_WORKER_MODEL}"
    local leader="${4:-$DEFAULT_LEADER_MODEL}"
    local fast="${5:-false}"

    N_TECHS=$techs
    N_CHECKS=$checks
    WORKER_MODEL=$worker
    LEADER_MODEL=$leader
    FAST_MODE=$fast

    render_cost_dashboard
}

# =============================================================================
# Main Entrypoint
# =============================================================================

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    dashboard_parse_args "$@"

    if [[ "$DRY_RUN" == "true" ]]; then
        render_dry_run_dashboard
    else
        render_cost_dashboard
    fi
fi
