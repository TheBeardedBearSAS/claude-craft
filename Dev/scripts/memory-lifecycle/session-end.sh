#!/usr/bin/env bash
# SessionEnd hook — finalize session, compute summary from tool events + prompts.

set -euo pipefail

SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=./_db.sh
source "$SCRIPT_DIR/_db.sh"

if ! command -v sqlite3 &>/dev/null; then
  echo '{}' ; exit 0
fi

init_memory_db

SESSION_ID=$(current_session_id)
NOW=$(date -u -Iseconds)

PROMPT_COUNT=$(sqlite3 "$MEMORY_DB" "SELECT COUNT(*) FROM prompts WHERE session_id='$SESSION_ID';" 2>/dev/null || echo 0)
TOOL_COUNT=$(sqlite3 "$MEMORY_DB" "SELECT COUNT(*) FROM tool_events WHERE session_id='$SESSION_ID';" 2>/dev/null || echo 0)
FILES_EDITED=$(sqlite3 "$MEMORY_DB" "SELECT COUNT(DISTINCT target_path) FROM tool_events WHERE session_id='$SESSION_ID' AND tool_name IN ('Edit','Write');" 2>/dev/null || echo 0)

# Top 5 edited files
TOP_FILES=$(sqlite3 "$MEMORY_DB" "SELECT target_path FROM tool_events WHERE session_id='$SESSION_ID' AND tool_name IN ('Edit','Write') AND target_path != '' GROUP BY target_path ORDER BY COUNT(*) DESC LIMIT 5;" 2>/dev/null | tr '\n' '|' || echo "")

SUMMARY="Session $SESSION_ID: $PROMPT_COUNT prompts, $TOOL_COUNT tool events, $FILES_EDITED files edited. Top: $TOP_FILES"

sqlite3 "$MEMORY_DB" <<SQL
UPDATE sessions SET ended_at='$NOW', summary='$(sql_escape "$SUMMARY")' WHERE id='$(sql_escape "$SESSION_ID")';
SQL

echo '{}'
