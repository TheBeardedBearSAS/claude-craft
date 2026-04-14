#!/usr/bin/env bash
# UserPromptSubmit hook — log each user prompt (preview only, no full content).

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

# Read prompt from stdin (Claude Code passes it as JSON)
INPUT=$(cat 2>/dev/null || echo "")
PROMPT=""
if [[ -n "$INPUT" ]] && command -v jq &>/dev/null; then
  PROMPT=$(echo "$INPUT" | jq -r '.prompt // .user_prompt // ""' 2>/dev/null || echo "")
fi

# Preview : first 200 chars, sanitized
PREVIEW=$(printf '%s' "$PROMPT" | tr -d '\n' | cut -c1-200)
TOKEN_EST=$(( ${#PROMPT} / 4 ))

sqlite3 "$MEMORY_DB" <<SQL
INSERT INTO prompts(session_id, submitted_at, prompt_preview, token_estimate)
VALUES ('$(sql_escape "$SESSION_ID")', '$NOW', '$(sql_escape "$PREVIEW")', $TOKEN_EST);
SQL

echo '{}'
