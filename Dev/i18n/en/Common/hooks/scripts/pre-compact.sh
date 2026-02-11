#!/bin/bash
# Pre Compact Hook: Save state before memory compaction
# Runs on PreCompact event
set -e

# Read JSON input from stdin
INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TIMESTAMP=$(date +%Y%m%d%H%M%S)

cd "$CWD" 2>/dev/null || true

# Ensure directories exist
mkdir -p .claude/logs
mkdir -p .bmad/backups 2>/dev/null || true
mkdir -p .recette/backups 2>/dev/null || true

# Log compaction event
echo "[$(date -Iseconds)] [COMPACT] Context compaction triggered - session: $SESSION_ID" >> .claude/logs/session.log

# Backup BMAD sprint status if exists
if [[ -f ".bmad/sprint-status.yaml" ]]; then
    cp .bmad/sprint-status.yaml ".bmad/backups/sprint-status-${TIMESTAMP}.yaml"
    echo "[$(date -Iseconds)] [COMPACT] Backed up sprint-status.yaml" >> .claude/logs/session.log
fi

# Backup current story context if exists
if [[ -f ".bmad/current-story.yaml" ]]; then
    cp .bmad/current-story.yaml ".bmad/backups/current-story-${TIMESTAMP}.yaml"
    echo "[$(date -Iseconds)] [COMPACT] Backed up current-story.yaml" >> .claude/logs/session.log
fi

# Backup recette session if exists
if [[ -d ".recette/sessions" ]]; then
    ACTIVE_SESSION=$(find .recette/sessions -name "*.yaml" -mmin -60 2>/dev/null | head -1)
    if [[ -n "$ACTIVE_SESSION" ]]; then
        cp "$ACTIVE_SESSION" ".recette/backups/$(basename "$ACTIVE_SESSION" .yaml)-${TIMESTAMP}.yaml"
        echo "[$(date -Iseconds)] [COMPACT] Backed up recette session" >> .claude/logs/session.log
    fi
fi

# Cleanup old backups (keep last 10)
for backup_dir in .bmad/backups .recette/backups; do
    if [[ -d "$backup_dir" ]]; then
        ls -t "$backup_dir"/*.yaml 2>/dev/null | tail -n +11 | xargs -r rm -f 2>/dev/null || true
    fi
done

# Output message to preserve in context
echo '{"additionalContext": "State backed up before compaction. Sprint and story context preserved."}'

exit 0
