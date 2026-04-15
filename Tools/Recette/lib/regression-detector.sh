#!/bin/bash
set -euo pipefail
IFS=$'\n\t'
# =============================================================================
# Recette - Regression Detector Module
# Compares test runs and detects regressions
# Implements the Golden Rule: A fixed bug should NEVER reappear
# =============================================================================

# Metrics storage
RECETTE_METRICS_DIR="${RECETTE_BASE:-.recette}/metrics"
RECETTE_REGRESSION_DIR="${RECETTE_BASE:-.recette}/regression"

# =============================================================================
# Metrics Storage
# =============================================================================

# Save run metrics for comparison
save_run_metrics() {
    local session_id="$1"
    local scope="$2"
    local target_id="$3"

    mkdir -p "$RECETTE_METRICS_DIR"

    local metrics_file="$RECETTE_METRICS_DIR/history.jsonl"

    # Get session results
    local session_dir="${RECETTE_BASE:-.recette}/sessions/$session_id"
    local state_file="$session_dir/state.yaml"

    if [[ ! -f "$state_file" ]]; then
        return 1
    fi

    local total passed failed skipped
    if command -v yq &>/dev/null; then
        total=$(yq e '.progress.tests.total // 0' "$state_file")
        passed=$(yq e '.progress.tests.passed // 0' "$state_file")
        failed=$(yq e '.progress.tests.failed // 0' "$state_file")
        skipped=$(yq e '.progress.tests.skipped // 0' "$state_file")
    else
        total=0
        passed=0
        failed=0
        skipped=0
    fi

    # Get list of failed test IDs
    local failed_tests=""
    if command -v yq &>/dev/null; then
        failed_tests=$(yq e '[.errors_detected[].test_id] | join(",")' "$state_file" 2>/dev/null || echo "")
    fi

    # Build metrics entry
    local entry
    entry=$(jq -n \
        --arg session_id "$session_id" \
        --arg scope "$scope" \
        --arg target_id "$target_id" \
        --arg timestamp "$(date -Iseconds)" \
        --argjson total "$total" \
        --argjson passed "$passed" \
        --argjson failed "$failed" \
        --argjson skipped "$skipped" \
        --arg failed_tests "$failed_tests" \
        '{
            session_id: $session_id,
            scope: $scope,
            target_id: $target_id,
            timestamp: $timestamp,
            total: $total,
            passed: $passed,
            failed: $failed,
            skipped: $skipped,
            failed_tests: ($failed_tests | split(",") | map(select(. != "")))
        }')

    echo "$entry" >> "$metrics_file"
}

# =============================================================================
# Regression Detection
# =============================================================================

# Detect regressions by comparing with previous run
detect_regressions() {
    local session_id="$1"
    local scope="$2"
    local target_id="$3"

    local metrics_file="$RECETTE_METRICS_DIR/history.jsonl"

    if [[ ! -f "$metrics_file" ]]; then
        echo '{"regressions": [], "new_failures": [], "fixed": []}'
        return 0
    fi

    # Get current run results
    local session_dir="${RECETTE_BASE:-.recette}/sessions/$session_id"
    local state_file="$session_dir/state.yaml"

    if [[ ! -f "$state_file" ]]; then
        echo '{"error": "Session not found"}'
        return 1
    fi

    # Get current failed tests
    local current_failed=()
    if command -v yq &>/dev/null; then
        while IFS= read -r test_id; do
            [[ -n "$test_id" ]] && current_failed+=("$test_id")
        done < <(yq e '.errors_detected[].test_id' "$state_file" 2>/dev/null)
    fi

    # Get previous run for same scope/target
    local previous_run
    previous_run=$(grep "\"scope\":\"$scope\"" "$metrics_file" | \
                   grep "\"target_id\":\"$target_id\"" | \
                   grep -v "\"session_id\":\"$session_id\"" | \
                   tail -1)

    if [[ -z "$previous_run" ]]; then
        # No previous run - all failures are new
        local new_failures_json
        new_failures_json=$(printf '%s\n' "${current_failed[@]}" | jq -R . | jq -s .)
        echo "{\"regressions\": [], \"new_failures\": $new_failures_json, \"fixed\": [], \"first_run\": true}"
        return 0
    fi

    # Get previous failed tests
    local previous_failed
    previous_failed=$(echo "$previous_run" | jq -r '.failed_tests[]')

    # Calculate differences
    local regressions=()
    local new_failures=()
    local fixed=()

    # Find regressions: tests that passed before but fail now
    for test_id in "${current_failed[@]}"; do
        if ! echo "$previous_failed" | grep -q "^$test_id$"; then
            # Check if this test existed and passed in previous run
            local was_in_previous
            was_in_previous=$(echo "$previous_run" | jq -r '.failed_tests | index("'"$test_id"'")')
            if [[ "$was_in_previous" == "null" ]]; then
                regressions+=("$test_id")
            else
                new_failures+=("$test_id")
            fi
        fi
    done

    # Find fixed: tests that failed before but pass now
    while IFS= read -r test_id; do
        [[ -z "$test_id" ]] && continue
        local is_still_failing=false
        for current_id in "${current_failed[@]}"; do
            if [[ "$current_id" == "$test_id" ]]; then
                is_still_failing=true
                break
            fi
        done
        if [[ "$is_still_failing" == "false" ]]; then
            fixed+=("$test_id")
        fi
    done <<< "$previous_failed"

    # Build result JSON
    local regressions_json
    local new_failures_json
    local fixed_json

    if [[ ${#regressions[@]} -gt 0 ]]; then
        regressions_json=$(printf '%s\n' "${regressions[@]}" | jq -R . | jq -s .)
    else
        regressions_json="[]"
    fi

    if [[ ${#new_failures[@]} -gt 0 ]]; then
        new_failures_json=$(printf '%s\n' "${new_failures[@]}" | jq -R . | jq -s .)
    else
        new_failures_json="[]"
    fi

    if [[ ${#fixed[@]} -gt 0 ]]; then
        fixed_json=$(printf '%s\n' "${fixed[@]}" | jq -R . | jq -s .)
    else
        fixed_json="[]"
    fi

    cat << EOF
{
    "regressions": $regressions_json,
    "new_failures": $new_failures_json,
    "fixed": $fixed_json,
    "regression_count": ${#regressions[@]},
    "new_failure_count": ${#new_failures[@]},
    "fixed_count": ${#fixed[@]}
}
EOF
}

# =============================================================================
# Regression Report
# =============================================================================

generate_regression_report() {
    local session_id="$1"
    local scope="$2"
    local target_id="$3"

    # Detect regressions
    local analysis
    analysis=$(detect_regressions "$session_id" "$scope" "$target_id")

    local regression_count
    local new_failure_count
    local fixed_count

    regression_count=$(echo "$analysis" | jq -r '.regression_count // 0')
    new_failure_count=$(echo "$analysis" | jq -r '.new_failure_count // 0')
    fixed_count=$(echo "$analysis" | jq -r '.fixed_count // 0')

    # Generate report
    local report_file="$RECETTE_REGRESSION_DIR/report-$(date +%Y%m%d-%H%M%S).md"
    mkdir -p "$(dirname "$report_file")"

    cat > "$report_file" << EOF
# Regression Analysis Report

**Session:** $session_id
**Scope:** $scope
**Target:** $target_id
**Date:** $(date -Iseconds)

## Summary

| Metric | Count |
|--------|-------|
| Regressions | $regression_count |
| New Failures | $new_failure_count |
| Fixed | $fixed_count |

EOF

    # Add regression details
    if [[ $regression_count -gt 0 ]]; then
        cat >> "$report_file" << 'EOF'
## ⚠️ Regressions Detected

These tests were passing before but are now failing:

EOF
        echo "$analysis" | jq -r '.regressions[]' | while read -r test_id; do
            echo "- \`$test_id\`" >> "$report_file"
        done

        cat >> "$report_file" << 'EOF'

**Action Required:** These regressions violate the Golden Rule. Investigate immediately.

EOF
    fi

    # Add new failures
    if [[ $new_failure_count -gt 0 ]]; then
        cat >> "$report_file" << 'EOF'
## 🔴 New Failures

These are new test failures (not regressions):

EOF
        echo "$analysis" | jq -r '.new_failures[]' | while read -r test_id; do
            echo "- \`$test_id\`" >> "$report_file"
        done
        echo "" >> "$report_file"
    fi

    # Add fixed tests
    if [[ $fixed_count -gt 0 ]]; then
        cat >> "$report_file" << 'EOF'
## ✅ Fixed

These tests were failing but are now passing:

EOF
        echo "$analysis" | jq -r '.fixed[]' | while read -r test_id; do
            echo "- \`$test_id\`" >> "$report_file"
        done
        echo "" >> "$report_file"
    fi

    echo "$report_file"
}

# =============================================================================
# Registry Management
# =============================================================================

# Get all registered regression tests
get_regression_tests() {
    local registry_file="$RECETTE_REGRESSION_DIR/registry.yaml"

    if [[ ! -f "$registry_file" ]]; then
        echo "[]"
        return
    fi

    if command -v yq &>/dev/null; then
        yq e '.entries' "$registry_file" -o json
    else
        echo "[]"
    fi
}

# Check if a test is in the regression registry
is_regression_test() {
    local test_id="$1"
    local registry_file="$RECETTE_REGRESSION_DIR/registry.yaml"

    if [[ ! -f "$registry_file" ]]; then
        return 1
    fi

    if command -v yq &>/dev/null; then
        local found
        found=$(yq e ".entries[] | select(.error_id == \"$test_id\") | .id" "$registry_file" 2>/dev/null)
        [[ -n "$found" ]] && return 0
    fi

    return 1
}

# Update regression test status
update_regression_status() {
    local error_id="$1"
    local new_status="$2"  # active, verified, obsolete

    local registry_file="$RECETTE_REGRESSION_DIR/registry.yaml"

    if [[ ! -f "$registry_file" ]]; then
        return 1
    fi

    if command -v yq &>/dev/null; then
        yq e -i "(.entries[] | select(.error_id == \"$error_id\")).status = \"$new_status\"" "$registry_file"
    fi
}

# =============================================================================
# Trend Analysis
# =============================================================================

# Get trend data for a scope/target
get_trend_data() {
    local scope="$1"
    local target_id="$2"
    local limit="${3:-10}"

    local metrics_file="$RECETTE_METRICS_DIR/history.jsonl"

    if [[ ! -f "$metrics_file" ]]; then
        echo "[]"
        return
    fi

    # Get last N runs for this scope/target
    grep "\"scope\":\"$scope\"" "$metrics_file" | \
        grep "\"target_id\":\"$target_id\"" | \
        tail -n "$limit" | \
        jq -s '.'
}

# Calculate stability score
calculate_stability_score() {
    local scope="$1"
    local target_id="$2"

    local trend
    trend=$(get_trend_data "$scope" "$target_id" 10)

    if [[ "$trend" == "[]" ]]; then
        echo "100"
        return
    fi

    # Calculate score based on:
    # - Regression rate (heavily penalized)
    # - Failure trend (improving vs degrading)
    # - Overall pass rate

    local total_runs
    local total_regressions
    local total_failures
    local total_tests

    total_runs=$(echo "$trend" | jq 'length')
    total_regressions=0  # Would need regression detection per run
    total_failures=$(echo "$trend" | jq '[.[].failed] | add // 0')
    total_tests=$(echo "$trend" | jq '[.[].total] | add // 0')

    if [[ $total_tests -eq 0 ]]; then
        echo "100"
        return
    fi

    local pass_rate
    pass_rate=$(echo "scale=2; (1 - $total_failures / $total_tests) * 100" | bc)

    echo "${pass_rate%.*}"
}

# =============================================================================
# Alerts
# =============================================================================

# Check if regression alert should be triggered
should_alert_regression() {
    local analysis="$1"

    local regression_count
    regression_count=$(echo "$analysis" | jq -r '.regression_count // 0')

    [[ $regression_count -gt 0 ]]
}

# Generate alert message
generate_alert_message() {
    local analysis="$1"
    local scope="$2"
    local target_id="$3"

    local regression_count
    regression_count=$(echo "$analysis" | jq -r '.regression_count // 0')

    local regressions
    regressions=$(echo "$analysis" | jq -r '.regressions | join(", ")')

    cat << EOF
🚨 REGRESSION ALERT 🚨

$regression_count regression(s) detected in $scope:$target_id

Affected tests: $regressions

The Golden Rule has been violated: A fixed bug has reappeared!

Immediate investigation required.
EOF
}

# =============================================================================
# Clean History
# =============================================================================

# Clean old history entries
clean_history() {
    local days="${1:-30}"

    local metrics_file="$RECETTE_METRICS_DIR/history.jsonl"

    if [[ ! -f "$metrics_file" ]]; then
        return 0
    fi

    local cutoff_date
    cutoff_date=$(date -d "$days days ago" -Iseconds 2>/dev/null || date -v-${days}d -Iseconds)

    # Create temp file with entries newer than cutoff
    local temp_file="${metrics_file}.tmp"

    while IFS= read -r line; do
        local timestamp
        timestamp=$(echo "$line" | jq -r '.timestamp')
        if [[ "$timestamp" > "$cutoff_date" ]]; then
            echo "$line"
        fi
    done < "$metrics_file" > "$temp_file"

    mv "$temp_file" "$metrics_file"
}

# =============================================================================
# Export
# =============================================================================

export RECETTE_METRICS_DIR
export RECETTE_REGRESSION_DIR
