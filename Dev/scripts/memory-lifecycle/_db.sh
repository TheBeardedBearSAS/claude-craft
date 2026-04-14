#!/usr/bin/env bash
# _db.sh — Shared DB helpers for memory-lifecycle hooks.
# Sourced by other scripts, not executed directly.

set -euo pipefail

MEMORY_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}/.claude"
MEMORY_DB="$MEMORY_DIR/memory.db"

mkdir -p "$MEMORY_DIR"

# Initialize schema if DB doesn't exist
init_memory_db() {
  if [[ ! -f "$MEMORY_DB" ]]; then
    sqlite3 "$MEMORY_DB" <<'SQL'
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  project_dir TEXT,
  git_branch TEXT,
  git_commit TEXT,
  summary TEXT
);

CREATE TABLE IF NOT EXISTS prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  submitted_at TEXT NOT NULL,
  prompt_preview TEXT,
  token_estimate INTEGER
);

CREATE TABLE IF NOT EXISTS tool_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  occurred_at TEXT NOT NULL,
  tool_name TEXT,
  target_path TEXT,
  summary TEXT
);

CREATE TABLE IF NOT EXISTS compactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  compacted_at TEXT NOT NULL,
  preserved_context TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_session ON prompts(session_id);
CREATE INDEX IF NOT EXISTS idx_tools_session ON tool_events(session_id);
SQL
  fi
}

# Get or create current session id (one per day per project)
current_session_id() {
  local today
  today=$(date -u +%Y%m%d)
  local project_hash
  project_hash=$(echo -n "${CLAUDE_PROJECT_DIR:-$(pwd)}" | sha1sum | cut -c1-8)
  echo "${today}-${project_hash}"
}

# Safe SQL escape (basic)
sql_escape() {
  printf '%s' "$1" | sed "s/'/''/g"
}
