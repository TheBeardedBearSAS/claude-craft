#!/usr/bin/env bash
# PreCompact hook — capture critical context before compaction, re-inject it.

set -euo pipefail

SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=./_db.sh
source "$SCRIPT_DIR/_db.sh"

if ! command -v sqlite3 &>/dev/null || ! command -v jq &>/dev/null; then
  echo '{}' ; exit 0
fi

init_memory_db

SESSION_ID=$(current_session_id)
NOW=$(date -u -Iseconds)
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Build preserved context: essentials + recent tool events + recent prompts
ESSENTIALS=""
if [[ -f "$PROJECT_DIR/.claude/context-essentials.md" ]]; then
  ESSENTIALS=$(head -60 "$PROJECT_DIR/.claude/context-essentials.md")
fi

RECENT_TOOLS=$(sqlite3 "$MEMORY_DB" "SELECT tool_name || ' → ' || COALESCE(target_path,'') FROM tool_events WHERE session_id='$SESSION_ID' ORDER BY occurred_at DESC LIMIT 10;" 2>/dev/null || echo "")

RECENT_PROMPTS=$(sqlite3 "$MEMORY_DB" "SELECT prompt_preview FROM prompts WHERE session_id='$SESSION_ID' ORDER BY submitted_at DESC LIMIT 3;" 2>/dev/null || echo "")

CONTEXT="=== CRITICAL CONTEXT PRESERVED ==="
[[ -n "$ESSENTIALS" ]] && CONTEXT+=$'\n\n## Project essentials\n'"$ESSENTIALS"
[[ -n "$RECENT_PROMPTS" ]] && CONTEXT+=$'\n\n## Recent prompts\n'"$RECENT_PROMPTS"
[[ -n "$RECENT_TOOLS" ]] && CONTEXT+=$'\n\n## Recent tool events\n'"$RECENT_TOOLS"

# Persist
sqlite3 "$MEMORY_DB" <<SQL
INSERT INTO compactions(session_id, compacted_at, preserved_context)
VALUES ('$(sql_escape "$SESSION_ID")', '$NOW', '$(sql_escape "$CONTEXT")');
SQL

# Re-inject
jq -n --arg msg "$CONTEXT" '{"systemMessage": $msg}'
