#!/usr/bin/env bash
# =============================================================================
# Agent Teams - Token Cost Estimator
# Estimates token cost of Agent Teams operation vs sequential execution
#
# Based on empirical data from:
#   - reports/audit-pipeline.md (Section 6: Token Cost Estimation)
#   - reports/devils-advocate.md (Section 4.1: Realistic Cost Multiplier)
# =============================================================================
set -euo pipefail

# =============================================================================
# Constants: Model Pricing (per million tokens, USD)
# =============================================================================

# Input pricing ($/M tokens)
declare -A MODEL_INPUT_PRICE=(
    [opus]=15.00
    [sonnet]=3.00
    [haiku]=0.25
)

# Output pricing ($/M tokens)
declare -A MODEL_OUTPUT_PRICE=(
    [opus]=75.00
    [sonnet]=15.00
    [haiku]=1.25
)

# Fast Mode pricing ($/M tokens) — 6x standard pricing
declare -A MODEL_INPUT_PRICE_FAST=(
    [opus]=30.00
    [sonnet]=3.00
    [haiku]=0.25
)

declare -A MODEL_OUTPUT_PRICE_FAST=(
    [opus]=150.00
    [sonnet]=15.00
    [haiku]=1.25
)

# =============================================================================
# Constants: Token Usage Baselines (from audit-pipeline.md Section 6.1)
# =============================================================================

# Average tokens per audit check (sequential, single agent)
TOKENS_PER_CHECK=12500

# Technology detection phase (fixed cost)
TOKENS_DETECTION=2000

# Score calculation + report generation (fixed cost)
TOKENS_REPORT=8000

# =============================================================================
# Constants: Task Type Baselines
# Tokens per unit and minutes per unit vary by task type.
# audit.md references --task-type audit but the flag was not implemented.
# =============================================================================

declare -A TASK_TYPE_TOKENS_PER_UNIT=(
    [audit]=12500      # tokens per check
    [sprint]=35000     # tokens per story
    [security]=15000   # tokens per check
    [delivery]=45000   # tokens per story
)

declare -A TASK_TYPE_MINUTES_PER_UNIT=(
    [audit]=1.5
    [sprint]=15.0
    [security]=2.0
    [delivery]=20.0
)

# =============================================================================
# Constants: Overhead Factors (from devils-advocate.md Section 4.1)
# =============================================================================

# Per-agent fixed overhead: system prompt, context loading, warmup
# (audit-pipeline.md Section 6.2: ~2K startup + ~3K coordination per agent)
TOKENS_AGENT_STARTUP=2000

# Per-agent coordination: task management, messaging
TOKENS_AGENT_COORDINATION=3000

# Context duplication factor by worker model
# Applied to per-agent context reload (not total work tokens)
# Each agent reloads ~5-8K of shared context (CLAUDE.md, project files)
# Haiku: smaller context but more retries -> higher duplication
# Sonnet: better reasoning, fewer retries -> moderate duplication
# Opus: best reasoning, no retries -> lowest duplication
declare -A CONTEXT_DUPLICATION_FACTOR=(
    [haiku]=0.60
    [sonnet]=0.30
    [opus]=0.15
)

# Base context tokens each agent reloads (shared project context)
# A4: Dynamic per task-type — audit workers need less context than delivery workers
TOKENS_CONTEXT_PER_AGENT=6000  # default, overridden by task type

declare -A TASK_TYPE_CONTEXT_TOKENS=(
    [audit]=4000     # Audit workers only need tech reference + checks
    [sprint]=5000    # Sprint workers need story + tech spec + TDD commands
    [security]=3500  # Security workers need OWASP checklist + tech reference
    [delivery]=5500  # Delivery workers need story + file domains + TDD commands
)

# Coordination overhead (task creation, messaging, status checks)
# B1: Adaptive overhead — scales with number of workers
# Formula: base_pct + (N_workers * per_worker_pct) replaces flat 15%
COORDINATION_OVERHEAD_PERCENT=15  # default, overridden by adaptive formula
COORDINATION_BASE_PCT=5
COORDINATION_PER_WORKER_PCT=3.5

# Input/output token ratio (approx 70% input, 30% output)
INPUT_RATIO=0.70
OUTPUT_RATIO=0.30

# =============================================================================
# Constants: Time Estimates
# =============================================================================

# Average minutes per check (sequential)
MINUTES_PER_CHECK=1.5

# Agent startup time (minutes)
AGENT_STARTUP_MINUTES=0.15

# Aggregation phase (minutes)
AGGREGATION_MINUTES=1.0

# =============================================================================
# Defaults
# =============================================================================

DEFAULT_TECHS=2
DEFAULT_CHECKS=5
DEFAULT_WORKER_MODEL="sonnet"
DEFAULT_LEADER_MODEL="opus"
DEFAULT_TASK_TYPE=""
DRY_RUN=false
FAST_MODE=false
MAX_COST=""  # A3: Budget guard — empty means no limit
AUTO_SIZE=false

# =============================================================================
# Global Variables
# =============================================================================

TASK_TYPE=""

# =============================================================================
# Usage
# =============================================================================

show_help() {
    cat <<'HELP'
Agent Teams - Token Cost Estimator

Estimates token cost and time for Agent Teams parallel execution
versus sequential execution of audit/check commands.

USAGE:
    cost-estimator.sh [OPTIONS]

OPTIONS:
    --techs N           Number of technology stacks (default: 2)
    --checks N          Number of checks per technology (default: 5)
    --worker-model M    Worker agent model: haiku|sonnet|opus (default: sonnet)
    --leader-model M    Leader agent model: haiku|sonnet|opus (default: opus)
    --tokens-per-check N  Override tokens per check estimate (default: 12500)
    --task-type T       Task type: audit|sprint|security|delivery
                        Overrides --tokens-per-check with type-specific baselines:
                          audit:    12,500 tokens/check, 1.5 min
                          sprint:   35,000 tokens/story, 15 min
                          security: 15,000 tokens/check, 2 min
                          delivery: 45,000 tokens/story, 20 min
    --fast-mode         Use Fast Mode pricing (6x cost for Opus)
    --max-cost N        Maximum budget in dollars; output WITHIN_BUDGET=true/false
    --auto-size         Recommend optimal team size based on workload
    --dry-run           Show configuration without calculating
    --help              Show this help

EXAMPLES:
    # 2-tech project with Sonnet workers
    cost-estimator.sh --techs 2 --checks 5 --worker-model sonnet

    # 3-tech project with Haiku workers (cost-optimized)
    cost-estimator.sh --techs 3 --checks 5 --worker-model haiku

    # Audit task type (uses audit-specific baselines)
    cost-estimator.sh --techs 2 --checks 5 --task-type audit

    # Quick check with dry-run
    cost-estimator.sh --techs 4 --dry-run

COST FORMULA:
    sequential_tokens = detection + (N_techs * N_checks * tokens_per_check) + report
    parallel_tokens   = sequential_tokens * (1 + overhead_factor)

    overhead_factor = 0.14 * N_agents + context_duplication_factor + coordination_overhead

    Context duplication factors:
      haiku  = 0.60 (smaller context, more retries)
      sonnet = 0.30 (balanced)
      opus   = 0.15 (best reasoning, fewest retries)

DATA SOURCES:
    - reports/audit-pipeline.md Section 6
    - reports/devils-advocate.md Section 4.1
HELP
}

# =============================================================================
# Argument Parsing
# =============================================================================

parse_args() {
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
            --task-type)
                TASK_TYPE="$2"
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
            --auto-size)
                AUTO_SIZE=true
                shift
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
    if [[ -n "$TASK_TYPE" ]]; then
        if [[ -z "${TASK_TYPE_TOKENS_PER_UNIT[$TASK_TYPE]+x}" ]]; then
            echo "ERROR: --task-type must be audit|sprint|security|delivery, got: $TASK_TYPE" >&2
            exit 1
        fi
        # Override tokens-per-check and minutes-per-check with task type baselines
        tokens_check=${TASK_TYPE_TOKENS_PER_UNIT[$TASK_TYPE]}
        MINUTES_PER_CHECK=${TASK_TYPE_MINUTES_PER_UNIT[$TASK_TYPE]}
    fi

    # Export to globals
    N_TECHS=$n_techs
    N_CHECKS=$n_checks
    WORKER_MODEL=$worker_model
    LEADER_MODEL=$leader_model
    TOKENS_PER_CHECK=$tokens_check
}

# =============================================================================
# Core Estimation Functions
# =============================================================================

# Calculate sequential token usage
# Returns: total tokens for sequential execution
estimate_sequential_tokens() {
    local n_techs=$1
    local n_checks=$2
    local tokens_per_check=$3

    local work_tokens=$((n_techs * n_checks * tokens_per_check))
    local total=$((TOKENS_DETECTION + work_tokens + TOKENS_REPORT))

    echo "$total"
}

# Calculate parallel token usage with Agent Teams
# Returns: total tokens for parallel execution
#
# Formula breakdown (from audit-pipeline.md Section 6.2 + devils-advocate.md Section 4.1):
#   parallel_tokens = work_tokens
#                   + agent_startup_overhead (N_agents * startup_cost)
#                   + context_duplication (N_workers * context_per_agent * duplication_factor)
#                   + coordination_overhead (leader coordination with workers)
#                   + leader_overhead (detection + aggregation + report)
estimate_parallel_tokens() {
    local n_techs=$1
    local n_checks=$2
    local tokens_per_check=$3
    local worker_model=$4

    local n_workers=$n_techs
    local n_agents=$((n_techs + 1))  # 1 leader + N tech auditors

    # Base work tokens (same work, distributed across agents)
    local work_tokens=$((n_techs * n_checks * tokens_per_check))

    # Agent startup overhead (each agent pays startup cost)
    local startup_overhead=$((n_agents * TOKENS_AGENT_STARTUP))

    # A4: Use task-type-specific context tokens if available
    local ctx_per_agent=$TOKENS_CONTEXT_PER_AGENT
    if [[ -n "$TASK_TYPE" ]] && [[ -n "${TASK_TYPE_CONTEXT_TOKENS[$TASK_TYPE]+x}" ]]; then
        ctx_per_agent=${TASK_TYPE_CONTEXT_TOKENS[$TASK_TYPE]}
    fi

    # Context duplication: each worker reloads shared context
    # Factor scales how much extra context is needed (retries, re-reads)
    local ctx_factor=${CONTEXT_DUPLICATION_FACTOR[$worker_model]}
    local ctx_overhead
    ctx_overhead=$(awk "BEGIN { printf \"%d\", $n_workers * $ctx_per_agent * (1 + $ctx_factor) }")

    # Leader overhead (detection + aggregation + per-worker coordination)
    local leader_overhead=$((TOKENS_DETECTION + TOKENS_REPORT + TOKENS_AGENT_COORDINATION * n_workers))

    # B1: Adaptive coordination overhead — scales with worker count
    # Formula: base_pct + (N_workers * per_worker_pct)
    # 2 workers = 12%, 3 = 15.5%, 4 = 19%
    local effective_coord_pct
    effective_coord_pct=$(awk "BEGIN { printf \"%.1f\", $COORDINATION_BASE_PCT + ($n_workers * $COORDINATION_PER_WORKER_PCT) }")

    # Coordination overhead: percentage of work tokens for messaging/task management
    local coord_pct_overhead
    coord_pct_overhead=$(awk "BEGIN { printf \"%d\", $work_tokens * $effective_coord_pct / 100 }")

    # Total parallel tokens
    local total=$((work_tokens + startup_overhead + ctx_overhead + leader_overhead + coord_pct_overhead))

    echo "$total"
}

# Calculate sequential time estimate (minutes)
estimate_sequential_time() {
    local n_techs=$1
    local n_checks=$2

    local total_checks=$((n_techs * n_checks))
    # Sequential: each check runs one after another
    local time
    time=$(awk "BEGIN { printf \"%.1f\", $total_checks * $MINUTES_PER_CHECK + 1.0 }")
    echo "$time"
}

# Calculate parallel time estimate (minutes)
estimate_parallel_time() {
    local n_techs=$1
    local n_checks=$2

    # Parallel: all techs run simultaneously, checks within each tech are sequential
    # Time = agent startup + max(checks per tech) + aggregation
    local time
    time=$(awk "BEGIN { printf \"%.1f\", $AGENT_STARTUP_MINUTES + ($n_checks * $MINUTES_PER_CHECK) + $AGGREGATION_MINUTES }")
    echo "$time"
}

# Calculate cost in USD for a given model and token count
# Usage: calculate_cost <model> <total_tokens>
calculate_cost() {
    local model=$1
    local total_tokens=$2

    local input_price output_price
    if [[ "$FAST_MODE" == "true" ]]; then
        input_price=${MODEL_INPUT_PRICE_FAST[$model]}
        output_price=${MODEL_OUTPUT_PRICE_FAST[$model]}
    else
        input_price=${MODEL_INPUT_PRICE[$model]}
        output_price=${MODEL_OUTPUT_PRICE[$model]}
    fi

    # Split tokens into input/output using ratio
    local cost
    cost=$(awk "BEGIN {
        input_tokens = $total_tokens * $INPUT_RATIO
        output_tokens = $total_tokens * $OUTPUT_RATIO
        input_cost = input_tokens * $input_price / 1000000
        output_cost = output_tokens * $output_price / 1000000
        printf \"%.4f\", input_cost + output_cost
    }")

    echo "$cost"
}

# Calculate blended cost for parallel execution (leader + workers)
calculate_parallel_cost() {
    local leader_model=$1
    local worker_model=$2
    local total_tokens=$3
    local n_techs=$4

    local n_agents=$((n_techs + 1))

    # Leader tokens (roughly 15-20% of total)
    local leader_tokens
    leader_tokens=$(awk "BEGIN { printf \"%d\", $total_tokens * 0.18 }")

    # Worker tokens (remaining)
    local worker_tokens=$((total_tokens - leader_tokens))

    local leader_cost
    leader_cost=$(calculate_cost "$leader_model" "$leader_tokens")

    local worker_cost
    worker_cost=$(calculate_cost "$worker_model" "$worker_tokens")

    awk "BEGIN { printf \"%.4f\", $leader_cost + $worker_cost }"
}

# Calculate break-even point (min checks where parallel is faster)
calculate_break_even() {
    local n_techs=$1

    # Break-even: sequential time > parallel time
    # seq_time = n_techs * n_checks * min_per_check + 1
    # par_time = startup + n_checks * min_per_check + aggregation
    # seq_time > par_time when:
    # n_techs * n_checks * min_per_check > startup + n_checks * min_per_check + aggregation
    # n_checks * min_per_check * (n_techs - 1) > startup + aggregation
    # n_checks > (startup + aggregation) / (min_per_check * (n_techs - 1))

    if [[ $n_techs -le 1 ]]; then
        echo "N/A (single tech, no benefit)"
        return
    fi

    local break_even
    break_even=$(awk "BEGIN {
        divisor = $MINUTES_PER_CHECK * ($n_techs - 1)
        if (divisor <= 0) {
            print \"N/A\"
        } else {
            be = ($AGENT_STARTUP_MINUTES + $AGGREGATION_MINUTES) / divisor
            printf \"%d\", (be == int(be)) ? be : int(be) + 1
        }
    }")

    echo "$break_even checks/tech"
}

# =============================================================================
# B3: Team Size Recommendation
# =============================================================================

# Recommend optimal team size based on workload
# Sprint/delivery: min(ceil(units/2), 3)
# Audit/security: min(units, 4) — one worker per tech/dimension
recommend_team_size() {
    local n_units=$1
    local task_type="${2:-audit}"

    case "$task_type" in
        sprint|delivery)
            # 2-3 stories = 1 worker, 4-5 = 2, 6+ = 3
            local size
            size=$(awk "BEGIN {
                s = int(($n_units + 1) / 2)
                if (s < 1) s = 1
                if (s > 3) s = 3
                print s
            }")
            echo "$size"
            ;;
        audit|security|*)
            # One worker per tech/dimension, capped at 4
            local size
            size=$(awk "BEGIN {
                s = $n_units
                if (s < 1) s = 1
                if (s > 4) s = 4
                print s
            }")
            echo "$size"
            ;;
    esac
}

# =============================================================================
# Output Functions
# =============================================================================

# Format token count with K suffix
format_tokens() {
    local tokens=$1
    awk "BEGIN { printf \"%.1fK\", $tokens / 1000 }"
}

# Format cost with $ prefix
format_cost() {
    local cost=$1
    awk "BEGIN { printf \"\$%.4f\", $cost }"
}

# Determine recommendation based on time/cost analysis
get_recommendation() {
    local seq_time=$1
    local par_time=$2
    local seq_tokens=$3
    local par_tokens=$4

    local time_saved_pct
    time_saved_pct=$(awk "BEGIN {
        if ($seq_time <= 0) print 0
        else printf \"%d\", (($seq_time - $par_time) / $seq_time) * 100
    }")

    local extra_cost_pct
    extra_cost_pct=$(awk "BEGIN {
        if ($seq_tokens <= 0) print 0
        else printf \"%d\", (($par_tokens - $seq_tokens) / $seq_tokens) * 100
    }")

    # Recommendation logic: parallel if time_saved > 30% AND extra_cost < 50%
    if [[ $time_saved_pct -gt 30 ]] && [[ $extra_cost_pct -lt 50 ]]; then
        echo "USE PARALLEL"
    else
        echo "STAY SEQUENTIAL"
    fi
}

# =============================================================================
# Dry Run Output
# =============================================================================

show_dry_run() {
    cat <<EOF
=== Cost Estimator Configuration (Dry Run) ===

Technologies:       $N_TECHS
Checks per tech:    $N_CHECKS
Total checks:       $((N_TECHS * N_CHECKS))
Worker model:       $WORKER_MODEL
Leader model:       $LEADER_MODEL
Tokens per check:   $TOKENS_PER_CHECK
Agent count:        $((N_TECHS + 1)) (1 leader + $N_TECHS workers)

Context duplication factor ($WORKER_MODEL): ${CONTEXT_DUPLICATION_FACTOR[$WORKER_MODEL]}
Coordination overhead: ${COORDINATION_OVERHEAD_PERCENT}%

Model pricing (input/output per M tokens):
  opus:   \$${MODEL_INPUT_PRICE[opus]} / \$${MODEL_OUTPUT_PRICE[opus]}
  sonnet: \$${MODEL_INPUT_PRICE[sonnet]} / \$${MODEL_OUTPUT_PRICE[sonnet]}
  haiku:  \$${MODEL_INPUT_PRICE[haiku]} / \$${MODEL_OUTPUT_PRICE[haiku]}

Fast Mode:          $FAST_MODE
EOF
    if [[ "$FAST_MODE" == "true" ]]; then
        cat <<EOF

WARNING: Fast Mode is enabled - Opus pricing is 6x higher!
  opus (fast): \$${MODEL_INPUT_PRICE_FAST[opus]} / \$${MODEL_OUTPUT_PRICE_FAST[opus]}
EOF
    fi
    if [[ -n "$TASK_TYPE" ]]; then
        cat <<EOF

Task type:          $TASK_TYPE
  Tokens/unit:      ${TASK_TYPE_TOKENS_PER_UNIT[$TASK_TYPE]}
  Minutes/unit:     ${TASK_TYPE_MINUTES_PER_UNIT[$TASK_TYPE]}
EOF
    fi
    if [[ -n "$MAX_COST" ]]; then
        cat <<EOF

Budget limit:       \$$MAX_COST
EOF
    fi
    if [[ "$AUTO_SIZE" == "true" ]]; then
        local rec_size
        rec_size=$(recommend_team_size "$N_TECHS" "${TASK_TYPE:-audit}")
        cat <<EOF

Recommended workers: $rec_size
EOF
    fi
    cat <<EOF

No calculation performed (--dry-run).
EOF
}

# =============================================================================
# Full Estimate Output (machine-readable key=value)
# =============================================================================

output_estimate() {
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

    # A2: Fast Mode warning field
    local fast_mode_warning="false"
    if [[ "$FAST_MODE" == "true" ]]; then
        fast_mode_warning="true"
    fi

    # A3: Budget guard
    local within_budget="true"
    if [[ -n "$MAX_COST" ]]; then
        within_budget=$(awk "BEGIN {
            if ($par_cost <= $MAX_COST) print \"true\"
            else print \"false\"
        }")
    fi

    # B3: Auto-size recommendation
    local recommended_workers=""
    if [[ "$AUTO_SIZE" == "true" ]]; then
        recommended_workers=$(recommend_team_size "$N_TECHS" "${TASK_TYPE:-audit}")
    fi

    # Output key=value pairs (consumable by cost-dashboard.sh)
    cat <<EOF
TECHS=$N_TECHS
CHECKS=$N_CHECKS
WORKER_MODEL=$WORKER_MODEL
LEADER_MODEL=$LEADER_MODEL
FAST_MODE=$FAST_MODE
FAST_MODE_WARNING=$fast_mode_warning
TASK_TYPE=${TASK_TYPE:-audit}
SEQ_TOKENS=$seq_tokens
PAR_TOKENS=$par_tokens
SEQ_TIME=$seq_time
PAR_TIME=$par_time
SEQ_COST=$seq_cost
PAR_COST=$par_cost
TOKEN_OVERHEAD_PCT=$token_overhead_pct
TIME_SAVED_PCT=$time_saved_pct
TIME_SAVED_MIN=$time_saved_min
BREAK_EVEN=$break_even
RECOMMENDATION=$recommendation
EOF

    # A3: Budget guard fields (only when --max-cost is set)
    if [[ -n "$MAX_COST" ]]; then
        cat <<EOF
MAX_COST=$MAX_COST
WITHIN_BUDGET=$within_budget
EOF
    fi

    # B3: Auto-size recommendation (only when --auto-size is set)
    if [[ "$AUTO_SIZE" == "true" ]]; then
        cat <<EOF
RECOMMENDED_WORKERS=$recommended_workers
EOF
    fi
}

# =============================================================================
# Library Mode: Source-able functions
# =============================================================================

# When sourced by another script, only define functions without executing
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    parse_args "$@"

    if [[ "$DRY_RUN" == "true" ]]; then
        show_dry_run
    else
        output_estimate
    fi
fi
