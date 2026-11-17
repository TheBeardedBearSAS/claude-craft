#!/usr/bin/env bash
# SessionStart hook — open or reuse today's session row.
# Output: JSON hookSpecificOutput.additionalContext recalling the last session summary (if any).

set -euo pipefail

SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
# shellcheck source=./_db.sh
source "$SCRIPT_DIR/_db.sh"

if ! command -v sqlite3 &>/dev/null; then
  echo '{}' ; exit 0
fi

init_memory_db

SESSION_ID=$(current_session_id)
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

GIT_BRANCH=$(git -C "$PROJECT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
GIT_COMMIT=$(git -C "$PROJECT_DIR" rev-parse --short HEAD 2>/dev/null || echo "")

sqlite3 "$MEMORY_DB" <<SQL
INSERT OR IGNORE INTO sessions(id, started_at, project_dir, git_branch, git_commit)
VALUES ('$(sql_escape "$SESSION_ID")', '$NOW', '$(sql_escape "$PROJECT_DIR")', '$(sql_escape "$GIT_BRANCH")', '$(sql_escape "$GIT_COMMIT")');
SQL

# Recall last completed session summary (if any)
LAST_SUMMARY=$(sqlite3 "$MEMORY_DB" "SELECT summary FROM sessions WHERE id != '$SESSION_ID' AND summary IS NOT NULL ORDER BY started_at DESC LIMIT 1;" 2>/dev/null || echo "")

if [[ -n "$LAST_SUMMARY" ]] && command -v jq &>/dev/null; then
  MSG="Recall from last session:"$'\n\n'"$LAST_SUMMARY"
  # additionalContext (seul canal lu par le modèle) ; systemMessage ne s'affiche que dans l'UI.
  jq -cn --arg msg "$MSG" '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: $msg}}'
else
  echo '{}'
fi
