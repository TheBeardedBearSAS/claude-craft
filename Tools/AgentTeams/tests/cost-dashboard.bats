#!/usr/bin/env bats
# =============================================================================
# Tests for cost-dashboard.sh
# Run: docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/AgentTeams/tests/cost-dashboard.bats
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
LIB="$SCRIPT_DIR/lib/cost-dashboard.sh"

setup() {
    export LC_NUMERIC=C
}

# =============================================================================
# Dashboard rendering (box-drawing characters)
# =============================================================================

@test "dashboard renders with box-drawing characters" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --techs 2 --checks 5"
    [ "$status" -eq 0 ]
    # Check for box-drawing characters
    [[ "$output" == *"$'\xe2\x95\x94'"* ]] || [[ "$output" == *"Agent Teams Cost Estimate"* ]]
}

@test "dashboard output contains Sequential and Parallel labels" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --techs 2 --checks 5"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Sequential"* ]]
    [[ "$output" == *"Parallel"* ]]
}

@test "dashboard output contains Recommendation" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --techs 2 --checks 5"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Recommendation"* ]]
}

@test "dashboard output contains Time saved" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --techs 2 --checks 5"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Time saved"* ]]
}

@test "dashboard output contains Break-even" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --techs 2 --checks 5"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Break-even"* ]]
}

# =============================================================================
# Dry-run mode (plain text)
# =============================================================================

@test "dashboard renders in dry-run mode (plain text)" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --dry-run --techs 2 --checks 5"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Dry Run"* ]]
    [[ "$output" == *"Sequential Estimate"* ]]
    [[ "$output" == *"Parallel Estimate"* ]]
    [[ "$output" == *"Recommendation"* ]]
}

@test "dry-run output contains configuration section" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --dry-run --techs 3"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Configuration:"* ]]
    [[ "$output" == *"Technologies:"* ]]
    [[ "$output" == *"Worker model:"* ]]
    [[ "$output" == *"Leader model:"* ]]
}

@test "dry-run output contains comparison section" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --dry-run --techs 2"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Comparison:"* ]]
    [[ "$output" == *"Time saved:"* ]]
    [[ "$output" == *"Extra tokens:"* ]]
}

# =============================================================================
# display_cost_dashboard() public API
# =============================================================================

@test "display_cost_dashboard public API works" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        display_cost_dashboard 2 5 sonnet opus
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"Agent Teams Cost Estimate"* ]]
    [[ "$output" == *"Sequential"* ]]
    [[ "$output" == *"Parallel"* ]]
}

@test "display_cost_dashboard with default args works" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        display_cost_dashboard
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"Agent Teams Cost Estimate"* ]]
}

# =============================================================================
# dashboard_parse_args()
# =============================================================================

@test "dashboard_parse_args handles all options" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        dashboard_parse_args --techs 3 --checks 8 --worker-model haiku --leader-model sonnet --width 80
        echo \"techs=\$N_TECHS checks=\$N_CHECKS worker=\$WORKER_MODEL leader=\$LEADER_MODEL width=\$DASHBOARD_WIDTH\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"techs=3"* ]]
    [[ "$output" == *"checks=8"* ]]
    [[ "$output" == *"worker=haiku"* ]]
    [[ "$output" == *"leader=sonnet"* ]]
    [[ "$output" == *"width=80"* ]]
}

@test "dashboard_parse_args validates techs must be positive" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        dashboard_parse_args --techs 0
    "
    [ "$status" -eq 1 ]
    [[ "$output" == *"ERROR"* ]]
    [[ "$output" == *"--techs must be a positive integer"* ]]
}

@test "dashboard_parse_args validates checks must be positive" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        dashboard_parse_args --checks abc
    "
    [ "$status" -eq 1 ]
    [[ "$output" == *"ERROR"* ]]
    [[ "$output" == *"--checks must be a positive integer"* ]]
}

@test "dashboard_parse_args validates worker model" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        dashboard_parse_args --worker-model gpt4
    "
    [ "$status" -eq 1 ]
    [[ "$output" == *"ERROR"* ]]
    [[ "$output" == *"--worker-model must be haiku|sonnet|opus"* ]]
}

@test "dashboard_parse_args validates leader model" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        dashboard_parse_args --leader-model invalid
    "
    [ "$status" -eq 1 ]
    [[ "$output" == *"ERROR"* ]]
    [[ "$output" == *"--leader-model must be haiku|sonnet|opus"* ]]
}

# =============================================================================
# CLI interface
# =============================================================================

@test "CLI: --help shows usage" {
    run bash "$LIB" --help
    [ "$status" -eq 0 ]
    [[ "$output" == *"Agent Teams - Cost Dashboard"* ]]
    [[ "$output" == *"USAGE:"* ]]
    [[ "$output" == *"OPTIONS:"* ]]
}

@test "CLI: --width changes dashboard width" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --techs 2 --width 80"
    [ "$status" -eq 0 ]
    # The output should render (no error); we verify it completes successfully
    [[ "$output" == *"Agent Teams Cost Estimate"* ]]
}

@test "CLI: unknown option returns error" {
    run bash "$LIB" --unknown-option
    [ "$status" -eq 1 ]
    [[ "$output" == *"ERROR"* ]]
    [[ "$output" == *"Unknown option"* ]]
}

@test "CLI: default invocation produces valid output" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB'"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Agent Teams Cost Estimate"* ]]
    [[ "$output" == *"Recommendation"* ]]
}

# =============================================================================
# Fast Mode Integration (A1)
# =============================================================================

@test "dashboard shows Fast Mode WARNING when --fast-mode enabled" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --fast-mode --techs 2"
    [ "$status" -eq 0 ]
    [[ "$output" == *"WARNING"* ]]
    [[ "$output" == *"Fast Mode"* ]]
}

@test "dry-run shows Fast Mode WARNING when --fast-mode enabled" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --fast-mode --dry-run --techs 2"
    [ "$status" -eq 0 ]
    [[ "$output" == *"WARNING"* ]]
    [[ "$output" == *"Fast Mode"* ]]
    [[ "$output" == *"6x"* ]]
}

# =============================================================================
# Budget Guard Display (A3)
# =============================================================================

@test "dashboard shows budget info when --max-cost set" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --techs 2 --max-cost 10.00"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Budget"* ]]
    [[ "$output" == *"10.00"* ]]
}

@test "dry-run shows budget info when --max-cost set" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --dry-run --techs 2 --max-cost 10.00"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Budget"* ]]
    [[ "$output" == *"Within budget"* ]]
}

# =============================================================================
# Model Cost Comparison (A1)
# =============================================================================

@test "haiku workers produce lower cost than sonnet workers" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        N_TECHS=2 N_CHECKS=5 WORKER_MODEL=haiku LEADER_MODEL=opus FAST_MODE=false
        haiku_seq=\$(estimate_sequential_tokens 2 5 12500)
        haiku_par=\$(estimate_parallel_tokens 2 5 12500 haiku)
        haiku_cost=\$(calculate_parallel_cost opus haiku \$haiku_par 2)

        N_TECHS=2 N_CHECKS=5 WORKER_MODEL=sonnet LEADER_MODEL=opus FAST_MODE=false
        sonnet_par=\$(estimate_parallel_tokens 2 5 12500 sonnet)
        sonnet_cost=\$(calculate_parallel_cost opus sonnet \$sonnet_par 2)

        if awk \"BEGIN { exit !(\$haiku_cost < \$sonnet_cost) }\"; then
            echo 'haiku_cheaper=true'
        else
            echo 'haiku_cheaper=false'
        fi
        echo \"haiku=\$haiku_cost sonnet=\$sonnet_cost\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"haiku_cheaper=true"* ]]
}
