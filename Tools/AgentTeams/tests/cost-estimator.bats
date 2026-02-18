#!/usr/bin/env bats
# =============================================================================
# Tests for cost-estimator.sh
# Run: docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/AgentTeams/tests/cost-estimator.bats
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$BATS_TEST_FILENAME")/.." && pwd)"
LIB="$SCRIPT_DIR/lib/cost-estimator.sh"

setup() {
    export LC_NUMERIC=C
}

# =============================================================================
# estimate_sequential_tokens()
# =============================================================================

@test "estimate_sequential_tokens calculates correctly (detection + work + report)" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        result=\$(estimate_sequential_tokens 2 5 12500)
        echo \"tokens=\$result\"
        # Expected: 2000 + (2 * 5 * 12500) + 8000 = 2000 + 125000 + 8000 = 135000
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"tokens=135000"* ]]
}

@test "estimate_sequential_tokens with 1 tech 1 check" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        result=\$(estimate_sequential_tokens 1 1 12500)
        echo \"tokens=\$result\"
        # Expected: 2000 + (1 * 1 * 12500) + 8000 = 22500
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"tokens=22500"* ]]
}

# =============================================================================
# estimate_parallel_tokens()
# =============================================================================

@test "estimate_parallel_tokens is higher than sequential (overhead)" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        seq_tokens=\$(estimate_sequential_tokens 2 5 12500)
        par_tokens=\$(estimate_parallel_tokens 2 5 12500 sonnet)
        if [ \"\$par_tokens\" -gt \"\$seq_tokens\" ]; then
            echo 'parallel_higher=true'
        else
            echo 'parallel_higher=false'
        fi
        echo \"seq=\$seq_tokens par=\$par_tokens\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"parallel_higher=true"* ]]
}

@test "estimate_parallel_tokens with haiku has higher overhead than opus" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        haiku=\$(estimate_parallel_tokens 2 5 12500 haiku)
        opus=\$(estimate_parallel_tokens 2 5 12500 opus)
        if [ \"\$haiku\" -gt \"\$opus\" ]; then
            echo 'haiku_higher=true'
        else
            echo 'haiku_higher=false'
        fi
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"haiku_higher=true"* ]]
}

# =============================================================================
# estimate_sequential_time() / estimate_parallel_time()
# =============================================================================

@test "estimate_sequential_time scales with techs * checks" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        time1=\$(estimate_sequential_time 1 5)
        time2=\$(estimate_sequential_time 2 5)
        echo \"time1=\$time1 time2=\$time2\"
        # time2 should be roughly double time1
        if awk \"BEGIN { exit !(\$time2 > \$time1) }\"; then
            echo 'scales=true'
        else
            echo 'scales=false'
        fi
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"scales=true"* ]]
}

@test "estimate_parallel_time is less than sequential for 2+ techs" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        seq_time=\$(estimate_sequential_time 3 5)
        par_time=\$(estimate_parallel_time 3 5)
        echo \"seq=\$seq_time par=\$par_time\"
        if awk \"BEGIN { exit !(\$par_time < \$seq_time) }\"; then
            echo 'parallel_faster=true'
        else
            echo 'parallel_faster=false'
        fi
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"parallel_faster=true"* ]]
}

# =============================================================================
# calculate_cost()
# =============================================================================

@test "calculate_cost computes correct cost for opus" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        cost=\$(calculate_cost opus 100000)
        echo \"cost=\$cost\"
        # 70000 input * 5/1M + 30000 output * 25/1M = 0.35 + 0.75 = 1.1000
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"cost=1.1000"* ]]
}

@test "calculate_cost computes correct cost for sonnet" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        cost=\$(calculate_cost sonnet 100000)
        echo \"cost=\$cost\"
        # 70000 input * 3/1M + 30000 output * 15/1M = 0.21 + 0.45 = 0.6600
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"cost=0.6600"* ]]
}

@test "calculate_cost computes correct cost for haiku" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        cost=\$(calculate_cost haiku 100000)
        echo \"cost=\$cost\"
        # 70000 input * 1/1M + 30000 output * 5/1M = 0.07 + 0.15 = 0.2200
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"cost=0.2200"* ]]
}

# =============================================================================
# calculate_parallel_cost()
# =============================================================================

@test "calculate_parallel_cost blends leader and worker costs" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        cost=\$(calculate_parallel_cost opus sonnet 200000 2)
        echo \"cost=\$cost\"
        # Should be a non-zero value (blend of opus leader + sonnet workers)
        if awk \"BEGIN { exit !(\$cost > 0) }\"; then
            echo 'valid=true'
        else
            echo 'valid=false'
        fi
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"valid=true"* ]]
}

# =============================================================================
# calculate_break_even()
# =============================================================================

@test "calculate_break_even returns N/A for single tech" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        result=\$(calculate_break_even 1)
        echo \"result=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"N/A"* ]]
}

@test "calculate_break_even returns valid number for 2+ techs" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        result=\$(calculate_break_even 3)
        echo \"result=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"checks/tech"* ]]
    # Should NOT contain N/A
    [[ "$output" != *"N/A"* ]]
}

# =============================================================================
# get_recommendation()
# =============================================================================

@test "get_recommendation returns USE PARALLEL when time saved > 30%" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        # seq_time=20, par_time=5 -> 75% saved; seq_tokens=100000, par_tokens=130000 -> 30% extra
        result=\$(get_recommendation 20.0 5.0 100000 130000)
        echo \"rec=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"rec=USE PARALLEL"* ]]
}

@test "get_recommendation returns STAY SEQUENTIAL when not worth it" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        # seq_time=10, par_time=9 -> 10% saved (< 30%)
        result=\$(get_recommendation 10.0 9.0 100000 110000)
        echo \"rec=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"rec=STAY SEQUENTIAL"* ]]
}

@test "get_recommendation returns STAY SEQUENTIAL when extra cost > 50%" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        # time saved 50% but extra cost 60%
        result=\$(get_recommendation 20.0 10.0 100000 160000)
        echo \"rec=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"rec=STAY SEQUENTIAL"* ]]
}

# =============================================================================
# format_tokens() / format_cost()
# =============================================================================

@test "format_tokens formats with K suffix" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        result=\$(format_tokens 135000)
        echo \"formatted=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"formatted=135.0K"* ]]
}

@test "format_cost formats with dollar prefix" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        result=\$(format_cost 3.3000)
        echo \"formatted=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *'formatted=$3.3000'* ]]
}

# =============================================================================
# CLI Interface
# =============================================================================

@test "CLI: --help shows usage" {
    run bash "$LIB" --help
    [ "$status" -eq 0 ]
    [[ "$output" == *"Agent Teams - Token Cost Estimator"* ]]
    [[ "$output" == *"USAGE:"* ]]
    [[ "$output" == *"OPTIONS:"* ]]
}

@test "CLI: --dry-run shows config without calculating" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --dry-run --techs 2"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Cost Estimator Configuration (Dry Run)"* ]]
    [[ "$output" == *"Technologies:"* ]]
    [[ "$output" == *"No calculation performed"* ]]
}

@test "CLI: invalid --techs 0 returns error" {
    run bash "$LIB" --techs 0
    [ "$status" -eq 1 ]
    [[ "$output" == *"ERROR"* ]]
    [[ "$output" == *"--techs must be a positive integer"* ]]
}

@test "CLI: invalid --worker-model invalid returns error" {
    run bash "$LIB" --worker-model invalid
    [ "$status" -eq 1 ]
    [[ "$output" == *"ERROR"* ]]
    [[ "$output" == *"--worker-model must be haiku|sonnet|opus"* ]]
}

@test "CLI: default values produce valid output" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB'"
    [ "$status" -eq 0 ]
    [[ "$output" == *"TECHS="* ]]
    [[ "$output" == *"SEQ_TOKENS="* ]]
    [[ "$output" == *"PAR_TOKENS="* ]]
    [[ "$output" == *"RECOMMENDATION="* ]]
}

# =============================================================================
# Fast Mode Pricing (A1)
# =============================================================================

@test "calculate_cost with fast mode uses 6x opus pricing" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        FAST_MODE=true
        cost=\$(calculate_cost opus 100000)
        echo \"cost=\$cost\"
        # 70000 input * 30/1M + 30000 output * 150/1M = 2.10 + 4.50 = 6.6000
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"cost=6.6000"* ]]
}

@test "calculate_cost with fast mode sonnet price unchanged" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        FAST_MODE=true
        cost=\$(calculate_cost sonnet 100000)
        echo \"cost=\$cost\"
        # Sonnet fast mode pricing same as standard: 3/15 -> 0.6600
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"cost=0.6600"* ]]
}

@test "calculate_cost with fast mode haiku price unchanged" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        FAST_MODE=true
        cost=\$(calculate_cost haiku 100000)
        echo \"cost=\$cost\"
        # Haiku fast mode pricing same as standard: 1/5 -> 0.2200
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"cost=0.2200"* ]]
}

@test "CLI: --fast-mode shows warning in dry-run" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --fast-mode --dry-run --techs 2"
    [ "$status" -eq 0 ]
    [[ "$output" == *"Fast Mode"* ]]
    [[ "$output" == *"WARNING"* ]]
    [[ "$output" == *"6x"* ]]
}

# =============================================================================
# Recommendation Edge Cases (A1)
# =============================================================================

@test "get_recommendation handles zero sequential time" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        result=\$(get_recommendation 0 0 100000 120000)
        echo \"rec=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"rec=STAY SEQUENTIAL"* ]]
}

@test "get_recommendation exact 30% time saved threshold stays sequential" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        # 30% saved exactly (not > 30%) and 40% extra cost
        result=\$(get_recommendation 10.0 7.0 100000 140000)
        echo \"rec=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"rec=STAY SEQUENTIAL"* ]]
}

@test "get_recommendation exact 50% extra cost threshold stays sequential" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        # 40% time saved but exactly 50% extra cost (not < 50%)
        result=\$(get_recommendation 10.0 6.0 100000 150000)
        echo \"rec=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"rec=STAY SEQUENTIAL"* ]]
}

@test "get_recommendation 1 tech returns STAY SEQUENTIAL" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        seq_time=\$(estimate_sequential_time 1 5)
        par_time=\$(estimate_parallel_time 1 5)
        seq_tokens=\$(estimate_sequential_tokens 1 5 12500)
        par_tokens=\$(estimate_parallel_tokens 1 5 12500 sonnet)
        result=\$(get_recommendation \$seq_time \$par_time \$seq_tokens \$par_tokens)
        echo \"rec=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"rec=STAY SEQUENTIAL"* ]]
}

# =============================================================================
# Break-Even Validation (A1)
# =============================================================================

@test "break_even is monotonically decreasing with more techs" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        be2=\$(calculate_break_even 2 | grep -o '[0-9]*')
        be4=\$(calculate_break_even 4 | grep -o '[0-9]*')
        if [ \"\$be4\" -le \"\$be2\" ]; then
            echo 'monotone=true'
        else
            echo 'monotone=false'
        fi
        echo \"be2=\$be2 be4=\$be4\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"monotone=true"* ]]
}

# =============================================================================
# Task Type Baselines (A1)
# =============================================================================

@test "CLI: --task-type audit uses audit baselines" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --task-type audit --techs 2 --checks 5"
    [ "$status" -eq 0 ]
    [[ "$output" == *"TASK_TYPE=audit"* ]]
}

@test "CLI: --task-type sprint uses sprint baselines" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --task-type sprint --techs 2 --checks 3"
    [ "$status" -eq 0 ]
    [[ "$output" == *"TASK_TYPE=sprint"* ]]
}

@test "CLI: --task-type invalid returns error" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --task-type invalid --techs 2"
    [ "$status" -eq 1 ]
    [[ "$output" == *"ERROR"* ]]
    [[ "$output" == *"--task-type must be audit|sprint|security|delivery"* ]]
}

# =============================================================================
# Budget Guard (A3)
# =============================================================================

@test "CLI: --max-cost outputs WITHIN_BUDGET=true when under budget" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --techs 1 --checks 1 --max-cost 100.00"
    [ "$status" -eq 0 ]
    [[ "$output" == *"WITHIN_BUDGET=true"* ]]
    [[ "$output" == *"MAX_COST=100.00"* ]]
}

@test "CLI: --max-cost outputs WITHIN_BUDGET=false when over budget" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --techs 4 --checks 10 --max-cost 0.01"
    [ "$status" -eq 0 ]
    [[ "$output" == *"WITHIN_BUDGET=false"* ]]
}

# =============================================================================
# Auto-Size (B3)
# =============================================================================

@test "CLI: --auto-size outputs RECOMMENDED_WORKERS" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --techs 3 --checks 5 --auto-size"
    [ "$status" -eq 0 ]
    [[ "$output" == *"RECOMMENDED_WORKERS="* ]]
}

@test "recommend_team_size returns 1 for 2 stories sprint" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        result=\$(recommend_team_size 2 sprint)
        echo \"size=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"size=1"* ]]
}

@test "recommend_team_size returns 3 for 6 stories sprint" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        result=\$(recommend_team_size 6 sprint)
        echo \"size=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"size=3"* ]]
}

@test "recommend_team_size caps at 4 for audit" {
    run bash -c "
        export LC_NUMERIC=C
        source '$LIB'
        result=\$(recommend_team_size 10 audit)
        echo \"size=\$result\"
    "
    [ "$status" -eq 0 ]
    [[ "$output" == *"size=4"* ]]
}

# =============================================================================
# Fast Mode Output Field (A2)
# =============================================================================

@test "CLI: output contains FAST_MODE_WARNING=true when fast mode enabled" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --fast-mode --techs 2"
    [ "$status" -eq 0 ]
    [[ "$output" == *"FAST_MODE_WARNING=true"* ]]
}

@test "CLI: output contains FAST_MODE_WARNING=false when fast mode disabled" {
    run bash -c "export LC_NUMERIC=C && bash '$LIB' --techs 2"
    [ "$status" -eq 0 ]
    [[ "$output" == *"FAST_MODE_WARNING=false"* ]]
}
