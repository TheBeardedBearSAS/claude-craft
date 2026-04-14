#!/usr/bin/env bash
# PostToolUse hook — log significant tool events (Edit/Write/Bash only per matcher).

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

INPUT=$(cat 2>/dev/null || echo "")
TOOL_NAME=""
TARGET=""
SUMMARY=""

if [[ -n "$INPUT" ]] && command -v jq &>/dev/null; then
  TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""' 2>/dev/null || echo "")
  TARGET=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.command // ""' 2>/dev/null | cut -c1-300)
  SUMMARY=$(echo "$INPUT" | jq -r '.tool_response.summary // ""' 2>/dev/null | cut -c1-300)
fi

[[ -z "$TOOL_NAME" ]] && { echo '{}'; exit 0; }

sqlite3 "$MEMORY_DB" <<SQL
INSERT INTO tool_events(session_id, occurred_at, tool_name, target_path, summary)
VALUES ('$(sql_escape "$SESSION_ID")', '$NOW', '$(sql_escape "$TOOL_NAME")', '$(sql_escape "$TARGET")', '$(sql_escape "$SUMMARY")');
SQL

echo '{}'
