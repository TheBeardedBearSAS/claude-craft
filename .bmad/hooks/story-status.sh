#!/bin/bash
# BMAD v6 - Story Status Hook (PreToolUse, once:true)
# Injects current story status before the first tool use
#
# Usage in .claude/settings.json:
# {
#   "hooks": {
#     "PreToolUse": [{
#       "command": ".bmad/hooks/story-status.sh",
#       "once": true,
#       "timeout": 3000
#     }]
#   }
# }

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BMAD_DIR="$(dirname "$SCRIPT_DIR")"
SPRINT_STATUS_FILE="${BMAD_DIR}/sprint-status.yaml"

# Check if sprint-status.yaml exists
if [[ ! -f "$SPRINT_STATUS_FILE" ]]; then
    exit 0
fi

# Check for yq
if ! command -v yq &> /dev/null; then
    exit 0
fi

# Get current in-progress story
in_progress=$(yq '.stories | to_entries[] | select(.value.status == "in-progress")' "$SPRINT_STATUS_FILE" 2>/dev/null)

if [[ -z "$in_progress" || "$in_progress" == "null" ]]; then
    # No story in progress - suggest picking one
    ready_count=$(yq '[.stories[] | select(.status == "ready-for-dev")] | length' "$SPRINT_STATUS_FILE" 2>/dev/null || echo "0")

    if [[ "$ready_count" -gt 0 ]]; then
        next_story=$(yq '.stories | to_entries[] | select(.value.status == "ready-for-dev") | .key' "$SPRINT_STATUS_FILE" 2>/dev/null | head -1)
        echo "💡 No story in progress. $ready_count stories ready."
        echo "   Next: /sprint:transition $next_story in-progress"
    fi
    exit 0
fi

# Get story details
story_id=$(yq '.stories | to_entries[] | select(.value.status == "in-progress") | .key' "$SPRINT_STATUS_FILE" 2>/dev/null | head -1)
title=$(yq ".stories.${story_id}.title // \"\"" "$SPRINT_STATUS_FILE" 2>/dev/null)
tdd_phase=$(yq ".stories.${story_id}.tdd_phase // \"unknown\"" "$SPRINT_STATUS_FILE" 2>/dev/null)
current_task=$(yq ".stories.${story_id}.current_task // \"\"" "$SPRINT_STATUS_FILE" 2>/dev/null)
tasks_total=$(yq ".stories.${story_id}.tasks.total // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)
tasks_completed=$(yq ".stories.${story_id}.tasks.completed // 0" "$SPRINT_STATUS_FILE" 2>/dev/null)

# Output story context
echo "────────────────────────────────────────"
echo "📖 Working on: $story_id"
echo "   $title"
echo ""
echo "   TDD Phase: $tdd_phase"
echo "   Tasks: $tasks_completed/$tasks_total completed"

if [[ -n "$current_task" && "$current_task" != "null" ]]; then
    task_title=$(yq ".stories.${story_id}.tasks.list[] | select(.id == \"$current_task\") | .title // \"\"" "$SPRINT_STATUS_FILE" 2>/dev/null)
    echo "   Current: $current_task - $task_title"
fi

# TDD guidance based on phase
case "$tdd_phase" in
    red)
        echo ""
        echo "🔴 TDD RED: Write a failing test first"
        ;;
    green)
        echo ""
        echo "🟢 TDD GREEN: Implement code to pass the test"
        ;;
    refactor)
        echo ""
        echo "🔵 TDD REFACTOR: Clean up while keeping tests green"
        ;;
esac

echo "────────────────────────────────────────"
