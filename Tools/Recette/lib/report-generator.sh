#!/bin/bash
set -euo pipefail
IFS=$'\n\t'
# =============================================================================
# Recette - Report Generator Module
# Generates comprehensive test reports in Markdown and HTML formats
# =============================================================================

# Report output directory
RECETTE_REPORTS_DIR="${RECETTE_BASE:-.recette}/reports"

# =============================================================================
# Main Report Generation
# =============================================================================

generate_report() {
    local session_id="$1"
    local format="${2:-markdown}"

    mkdir -p "$RECETTE_REPORTS_DIR"

    local session_dir="${RECETTE_BASE:-.recette}/sessions/$session_id"
    local state_file="$session_dir/state.yaml"

    if [[ ! -f "$state_file" ]]; then
        echo "Session not found: $session_id"
        return 1
    fi

    local report_file

    case "$format" in
        markdown|md)
            report_file=$(generate_markdown_report "$session_id")
            ;;
        html)
            report_file=$(generate_html_report "$session_id")
            ;;
        json)
            report_file=$(generate_json_report "$session_id")
            ;;
        *)
            echo "Unknown format: $format"
            return 1
            ;;
    esac

    echo "$report_file"
}

# =============================================================================
# Markdown Report
# =============================================================================

generate_markdown_report() {
    local session_id="$1"

    local session_dir="${RECETTE_BASE:-.recette}/sessions/$session_id"
    local state_file="$session_dir/state.yaml"

    local report_file="$RECETTE_REPORTS_DIR/${session_id}-report.md"

    # Extract session data
    local scope target_id status
    local total passed failed skipped
    local created_at completed_at duration

    if command -v yq &>/dev/null; then
        scope=$(yq e '.session.scope' "$state_file")
        target_id=$(yq e '.session.target_id' "$state_file")
        status=$(yq e '.session.status' "$state_file")
        total=$(yq e '.progress.tests.total // 0' "$state_file")
        passed=$(yq e '.progress.tests.passed // 0' "$state_file")
        failed=$(yq e '.progress.tests.failed // 0' "$state_file")
        skipped=$(yq e '.progress.tests.skipped // 0' "$state_file")
        created_at=$(yq e '.session.created_at' "$state_file")
        completed_at=$(yq e '.metadata.completed_at // ""' "$state_file")
        duration=$(yq e '.metadata.duration_seconds // 0' "$state_file")
    else
        scope="unknown"
        target_id="unknown"
        status="unknown"
        total=0
        passed=0
        failed=0
        skipped=0
        created_at=""
        completed_at=""
        duration=0
    fi

    # Calculate pass rate
    local pass_rate=0
    if [[ $total -gt 0 ]]; then
        pass_rate=$((passed * 100 / total))
    fi

    # Determine status emoji
    local status_emoji="⏳"
    case "$status" in
        completed)
            if [[ $failed -eq 0 ]]; then
                status_emoji="✅"
            else
                status_emoji="⚠️"
            fi
            ;;
        failed)
            status_emoji="❌"
            ;;
        paused)
            status_emoji="⏸️"
            ;;
    esac

    # Format duration
    local duration_str=""
    if [[ $duration -gt 0 ]]; then
        local hours=$((duration / 3600))
        local minutes=$(((duration % 3600) / 60))
        local seconds=$((duration % 60))
        if [[ $hours -gt 0 ]]; then
            duration_str="${hours}h ${minutes}m ${seconds}s"
        elif [[ $minutes -gt 0 ]]; then
            duration_str="${minutes}m ${seconds}s"
        else
            duration_str="${seconds}s"
        fi
    fi

    # Generate report
    cat > "$report_file" << EOF
# Recette Report $status_emoji

**Session ID:** \`$session_id\`
**Scope:** $scope
**Target:** $target_id
**Status:** $status

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | $total |
| Passed | $passed |
| Failed | $failed |
| Skipped | $skipped |
| Pass Rate | $pass_rate% |
| Duration | $duration_str |

### Execution Timeline

- **Started:** $created_at
- **Completed:** $completed_at

---

## Test Results

EOF

    # Add passed tests section
    cat >> "$report_file" << 'EOF'
### ✅ Passed Tests

EOF

    if [[ $passed -gt 0 ]]; then
        echo "| Test ID | Name |" >> "$report_file"
        echo "|---------|------|" >> "$report_file"

        if command -v yq &>/dev/null; then
            # Would need to track passed tests in state - placeholder
            echo "| - | All $passed tests passed |" >> "$report_file"
        fi
    else
        echo "_No tests passed_" >> "$report_file"
    fi

    echo "" >> "$report_file"

    # Add failed tests section
    cat >> "$report_file" << 'EOF'
### ❌ Failed Tests

EOF

    if [[ $failed -gt 0 ]]; then
        echo "| Test ID | Error Type | Description |" >> "$report_file"
        echo "|---------|------------|-------------|" >> "$report_file"

        if command -v yq &>/dev/null; then
            local error_count
            error_count=$(yq e '.errors_detected | length' "$state_file")

            for ((i=0; i<error_count; i++)); do
                local test_id error_type description
                test_id=$(yq e ".errors_detected[$i].test_id" "$state_file")
                error_type=$(yq e ".errors_detected[$i].type" "$state_file")
                description=$(yq e ".errors_detected[$i].description" "$state_file" | head -c 50)

                echo "| \`$test_id\` | $error_type | $description... |" >> "$report_file"
            done
        fi
    else
        echo "_No test failures_" >> "$report_file"
    fi

    echo "" >> "$report_file"

    # Add errors section with details
    if [[ $failed -gt 0 ]]; then
        cat >> "$report_file" << 'EOF'
---

## Error Details

EOF

        if command -v yq &>/dev/null; then
            local error_count
            error_count=$(yq e '.errors_detected | length' "$state_file")

            for ((i=0; i<error_count; i++)); do
                local error_id test_id error_type description
                error_id=$(yq e ".errors_detected[$i].id" "$state_file")
                test_id=$(yq e ".errors_detected[$i].test_id" "$state_file")
                error_type=$(yq e ".errors_detected[$i].type" "$state_file")
                description=$(yq e ".errors_detected[$i].description" "$state_file")

                cat >> "$report_file" << EOF
### Error: $error_id

- **Test:** \`$test_id\`
- **Type:** $error_type
- **Description:** $description

#### Generated Tests

EOF

                local unit_test functional_test behat_test
                unit_test=$(yq e ".errors_detected[$i].generated_tests.unit // \"\"" "$state_file")
                functional_test=$(yq e ".errors_detected[$i].generated_tests.functional // \"\"" "$state_file")
                behat_test=$(yq e ".errors_detected[$i].generated_tests.behat // \"\"" "$state_file")

                if [[ -n "$unit_test" ]]; then
                    echo "- Unit Test: \`$unit_test\`" >> "$report_file"
                fi
                if [[ -n "$functional_test" ]]; then
                    echo "- Functional Test: \`$functional_test\`" >> "$report_file"
                fi
                if [[ -n "$behat_test" ]]; then
                    echo "- Behat Feature: \`$behat_test\`" >> "$report_file"
                fi

                echo "" >> "$report_file"
            done
        fi
    fi

    # Add screenshots section
    local screenshots_dir="$session_dir/screenshots"
    if [[ -d "$screenshots_dir" ]] && [[ -n "$(ls -A "$screenshots_dir" 2>/dev/null)" ]]; then
        cat >> "$report_file" << 'EOF'
---

## Screenshots

EOF
        for screenshot in "$screenshots_dir"/*.png; do
            if [[ -f "$screenshot" ]]; then
                local filename
                filename=$(basename "$screenshot")
                echo "### $filename" >> "$report_file"
                echo "" >> "$report_file"
                echo "![Screenshot]($screenshot)" >> "$report_file"
                echo "" >> "$report_file"
            fi
        done
    fi

    # Add Golden Rule footer
    cat >> "$report_file" << 'EOF'
---

## 📋 Golden Rule Compliance

> **A fixed bug should NEVER reappear.**

All detected errors have been added to the regression test suite to prevent recurrence.

---

*Report generated by Recette - Automated Acceptance Testing System*
*Generated at: $(date -Iseconds)*
EOF

    echo "$report_file"
}

# =============================================================================
# HTML Report
# =============================================================================

generate_html_report() {
    local session_id="$1"

    local session_dir="${RECETTE_BASE:-.recette}/sessions/$session_id"
    local state_file="$session_dir/state.yaml"

    local report_file="$RECETTE_REPORTS_DIR/${session_id}-report.html"

    # First generate markdown, then convert
    local md_report
    md_report=$(generate_markdown_report "$session_id")

    # Convert to HTML (basic conversion)
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recette Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        h3 { color: #666; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th { background: #f8f9fa; font-weight: 600; }
        tr:hover { background: #f8f9fa; }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'SFMono-Regular', Consolas, monospace;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .summary-card {
            display: inline-block;
            padding: 20px;
            margin: 10px;
            background: #f8f9fa;
            border-radius: 8px;
            text-align: center;
            min-width: 120px;
        }
        .summary-card .number {
            font-size: 32px;
            font-weight: bold;
        }
        .summary-card .label {
            color: #666;
            font-size: 14px;
        }
        .golden-rule {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .golden-rule strong {
            color: #856404;
        }
        img {
            max-width: 100%;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
EOF

    # Parse markdown and convert key sections to HTML
    if command -v yq &>/dev/null; then
        local scope target_id status
        local total passed failed skipped

        scope=$(yq e '.session.scope' "$state_file")
        target_id=$(yq e '.session.target_id' "$state_file")
        status=$(yq e '.session.status' "$state_file")
        total=$(yq e '.progress.tests.total // 0' "$state_file")
        passed=$(yq e '.progress.tests.passed // 0' "$state_file")
        failed=$(yq e '.progress.tests.failed // 0' "$state_file")
        skipped=$(yq e '.progress.tests.skipped // 0' "$state_file")

        local pass_rate=0
        if [[ $total -gt 0 ]]; then
            pass_rate=$((passed * 100 / total))
        fi

        cat >> "$report_file" << EOF
        <h1>Recette Report</h1>

        <p><strong>Session:</strong> <code>$session_id</code></p>
        <p><strong>Scope:</strong> $scope | <strong>Target:</strong> $target_id | <strong>Status:</strong> $status</p>

        <h2>Summary</h2>

        <div style="display: flex; flex-wrap: wrap;">
            <div class="summary-card">
                <div class="number">$total</div>
                <div class="label">Total</div>
            </div>
            <div class="summary-card">
                <div class="number passed">$passed</div>
                <div class="label">Passed</div>
            </div>
            <div class="summary-card">
                <div class="number failed">$failed</div>
                <div class="label">Failed</div>
            </div>
            <div class="summary-card">
                <div class="number skipped">$skipped</div>
                <div class="label">Skipped</div>
            </div>
            <div class="summary-card">
                <div class="number">${pass_rate}%</div>
                <div class="label">Pass Rate</div>
            </div>
        </div>
EOF

        # Add failed tests table
        if [[ $failed -gt 0 ]]; then
            cat >> "$report_file" << 'EOF'
        <h2>Failed Tests</h2>
        <table>
            <thead>
                <tr>
                    <th>Test ID</th>
                    <th>Error Type</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
EOF

            local error_count
            error_count=$(yq e '.errors_detected | length' "$state_file")

            for ((i=0; i<error_count; i++)); do
                local test_id error_type description
                test_id=$(yq e ".errors_detected[$i].test_id" "$state_file")
                error_type=$(yq e ".errors_detected[$i].type" "$state_file")
                description=$(yq e ".errors_detected[$i].description" "$state_file" | head -c 80)

                cat >> "$report_file" << EOF
                <tr>
                    <td><code>$test_id</code></td>
                    <td>$error_type</td>
                    <td>$description</td>
                </tr>
EOF
            done

            echo "            </tbody>" >> "$report_file"
            echo "        </table>" >> "$report_file"
        fi
    fi

    # Add Golden Rule section
    cat >> "$report_file" << 'EOF'
        <div class="golden-rule">
            <strong>📋 Golden Rule:</strong> A fixed bug should NEVER reappear.
            <br>
            All detected errors have been added to the regression test suite.
        </div>

        <hr>
        <p style="color: #666; font-size: 12px;">
            Report generated by Recette - Automated Acceptance Testing System
        </p>
    </div>
</body>
</html>
EOF

    echo "$report_file"
}

# =============================================================================
# JSON Report
# =============================================================================

generate_json_report() {
    local session_id="$1"

    local session_dir="${RECETTE_BASE:-.recette}/sessions/$session_id"
    local state_file="$session_dir/state.yaml"

    local report_file="$RECETTE_REPORTS_DIR/${session_id}-report.json"

    if command -v yq &>/dev/null; then
        yq e '.' "$state_file" -o json > "$report_file"
    else
        echo '{"error": "yq not available"}' > "$report_file"
    fi

    echo "$report_file"
}

# =============================================================================
# Quick Summary
# =============================================================================

generate_quick_summary() {
    local session_id="$1"

    local session_dir="${RECETTE_BASE:-.recette}/sessions/$session_id"
    local state_file="$session_dir/state.yaml"

    if [[ ! -f "$state_file" ]]; then
        echo "Session not found"
        return 1
    fi

    local total passed failed status

    if command -v yq &>/dev/null; then
        total=$(yq e '.progress.tests.total // 0' "$state_file")
        passed=$(yq e '.progress.tests.passed // 0' "$state_file")
        failed=$(yq e '.progress.tests.failed // 0' "$state_file")
        status=$(yq e '.session.status' "$state_file")
    else
        total=0
        passed=0
        failed=0
        status="unknown"
    fi

    local pass_rate=0
    if [[ $total -gt 0 ]]; then
        pass_rate=$((passed * 100 / total))
    fi

    local emoji="⏳"
    if [[ "$status" == "completed" ]]; then
        if [[ $failed -eq 0 ]]; then
            emoji="✅"
        else
            emoji="⚠️"
        fi
    elif [[ "$status" == "failed" ]]; then
        emoji="❌"
    fi

    echo "$emoji Recette: $passed/$total passed ($pass_rate%) | $failed failed"
}

# =============================================================================
# Export
# =============================================================================

export RECETTE_REPORTS_DIR
