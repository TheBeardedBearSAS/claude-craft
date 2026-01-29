#!/bin/bash
# BMAD v6 - Sprint Context Hook (SessionStart)
# Injects sprint context at the start of each Claude Code session
#
# Usage in .claude/settings.json:
# {
#   "hooks": {
#     "SessionStart": [{
#       "command": ".bmad/hooks/sprint-context.sh",
#       "timeout": 5000
#     }]
#   }
# }

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BMAD_DIR="$(dirname "$SCRIPT_DIR")"
SPRINT_STATUS_FILE="${BMAD_DIR}/sprint-status.yaml"

# Check if sprint-status.yaml exists
if [[ ! -f "$SPRINT_STATUS_FILE" ]]; then
    echo "⚠️ BMAD: No sprint-status.yaml found"
    echo "Run '/project:migrate-backlog' to initialize BMAD v6"
    exit 0
fi

# Check for yq
if ! command -v yq &> /dev/null; then
    echo "⚠️ BMAD: yq not installed (required for sprint context)"
    exit 0
fi

# Extract sprint metadata
sprint_id=$(yq '.metadata.sprint_id // "N/A"' "$SPRINT_STATUS_FILE" 2>/dev/null)
sprint_name=$(yq '.metadata.name // "N/A"' "$SPRINT_STATUS_FILE" 2>/dev/null)
end_date=$(yq '.metadata.end_date // "N/A"' "$SPRINT_STATUS_FILE" 2>/dev/null)

# Count stories by status
backlog=$(yq '[.stories[] | select(.status == "backlog")] | length' "$SPRINT_STATUS_FILE" 2>/dev/null || echo "0")
ready=$(yq '[.stories[] | select(.status == "ready-for-dev")] | length' "$SPRINT_STATUS_FILE" 2>/dev/null || echo "0")
in_progress=$(yq '[.stories[] | select(.status == "in-progress")] | length' "$SPRINT_STATUS_FILE" 2>/dev/null || echo "0")
review=$(yq '[.stories[] | select(.status == "review")] | length' "$SPRINT_STATUS_FILE" 2>/dev/null || echo "0")
done=$(yq '[.stories[] | select(.status == "done")] | length' "$SPRINT_STATUS_FILE" 2>/dev/null || echo "0")
blocked=$(yq '[.stories[] | select(.status == "blocked")] | length' "$SPRINT_STATUS_FILE" 2>/dev/null || echo "0")

# Calculate total and progress
total=$((backlog + ready + in_progress + review + done + blocked))
if [[ $total -gt 0 ]]; then
    progress=$((done * 100 / total))
else
    progress=0
fi

# Output context
cat << EOF
────────────────────────────────────────
📋 BMAD Sprint Context
────────────────────────────────────────
Sprint: $sprint_id - $sprint_name
End: $end_date | Progress: ${progress}%

Stories: 📋$backlog 🎯$ready 🔄$in_progress 👀$review ✅$done ⛔$blocked

EOF

# Show current story if in-progress
current_story=$(yq '.stories | to_entries[] | select(.value.status == "in-progress") | "\(.key): \(.value.title)"' "$SPRINT_STATUS_FILE" 2>/dev/null | head -1)
if [[ -n "$current_story" ]]; then
    tdd_phase=$(yq '.stories | to_entries[] | select(.value.status == "in-progress") | .value.tdd_phase // "unknown"' "$SPRINT_STATUS_FILE" 2>/dev/null | head -1)
    echo "🔄 Current: $current_story"
    echo "   TDD Phase: $tdd_phase"
    echo ""
fi

# Show blocked stories as warning
if [[ "$blocked" -gt 0 ]]; then
    echo "⚠️ Blocked stories:"
    yq '.stories | to_entries[] | select(.value.status == "blocked") | "   - \(.key): \(.value.blocked_reason // \"no reason\")"' "$SPRINT_STATUS_FILE" 2>/dev/null
    echo ""
fi

echo "Commands: /sprint:status | /sprint:next-story | /sprint:transition"
echo "────────────────────────────────────────"
