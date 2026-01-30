#!/bin/bash
# Session End Hook: Collect metrics and logs at session end
# Runs on SessionEnd event (called Stop in some versions)
set -e

# Read JSON input from stdin
INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
STOP_REASON=$(echo "$INPUT" | jq -r '.stop_reason // "unknown"')
TIMESTAMP=$(date -Iseconds)
DATE_SHORT=$(date +%Y%m%d)

cd "$CWD" 2>/dev/null || true

# Ensure directories exist
mkdir -p .claude/logs
mkdir -p .claude/metrics

# Log session end
{
    echo "[${TIMESTAMP}] [SESSION_END] Session: $SESSION_ID"
    echo "[${TIMESTAMP}] [SESSION_END] Stop reason: $STOP_REASON"
} >> .claude/logs/session.log

# Collect session metrics
collect_metrics() {
    local metrics_file=".claude/metrics/session-${DATE_SHORT}.jsonl"

    # Count files modified in this session (last hour)
    local files_modified=$(find . -type f -mmin -60 \
        -not -path "./.git/*" \
        -not -path "./node_modules/*" \
        -not -path "./vendor/*" \
        -not -path "./.claude/*" \
        2>/dev/null | wc -l | tr -d ' ')

    # Count tool failures if log exists
    local tool_failures=0
    if [[ -f ".claude/logs/tool-failures.log" ]]; then
        tool_failures=$(grep -c "$(date +%Y-%m-%d)" .claude/logs/tool-failures.log 2>/dev/null || echo 0)
    fi

    # Check BMAD status
    local current_story="none"
    local story_status="unknown"
    if [[ -f ".bmad/current-story.yaml" ]]; then
        current_story=$(grep "^id:" .bmad/current-story.yaml 2>/dev/null | cut -d' ' -f2 || echo "none")
        story_status=$(grep "^status:" .bmad/current-story.yaml 2>/dev/null | cut -d' ' -f2 || echo "unknown")
    fi

    # Build metrics JSON
    local metric_entry=$(cat <<EOF
{"timestamp":"${TIMESTAMP}","session_id":"${SESSION_ID}","stop_reason":"${STOP_REASON}","files_modified":${files_modified},"tool_failures":${tool_failures},"current_story":"${current_story}","story_status":"${story_status}"}
EOF
)

    echo "$metric_entry" >> "$metrics_file"
}

# Generate daily summary if this is the last session of the day
generate_daily_summary() {
    local metrics_file=".claude/metrics/session-${DATE_SHORT}.jsonl"
    local summary_file=".claude/metrics/daily-summary-${DATE_SHORT}.json"

    if [[ -f "$metrics_file" ]]; then
        local session_count=$(wc -l < "$metrics_file" | tr -d ' ')
        local total_files=$(jq -s '[.[].files_modified] | add' "$metrics_file" 2>/dev/null || echo 0)
        local total_failures=$(jq -s '[.[].tool_failures] | add' "$metrics_file" 2>/dev/null || echo 0)

        cat > "$summary_file" <<EOF
{
  "date": "${DATE_SHORT}",
  "total_sessions": ${session_count},
  "total_files_modified": ${total_files},
  "total_tool_failures": ${total_failures},
  "generated_at": "${TIMESTAMP}"
}
EOF
    fi
}

# Run metrics collection
collect_metrics

# Generate summary (runs every time, overwrites previous)
generate_daily_summary

# Cleanup old metrics (keep last 30 days)
find .claude/metrics -name "*.jsonl" -mtime +30 -delete 2>/dev/null || true
find .claude/metrics -name "daily-summary-*.json" -mtime +30 -delete 2>/dev/null || true

# Cleanup old logs (keep last 7 days)
find .claude/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true

echo '{"continue": true}'

exit 0
