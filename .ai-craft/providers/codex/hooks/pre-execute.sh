#!/bin/bash
# AI Craft - Codex Provider Pre-Execute Hook
# Multi-AI Development Framework
# This hook runs before any Codex command execution

set -euo pipefail

# Logging
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$HOOK_DIR")"
LOG_FILE="$PROJECT_DIR/../logs/codex-hooks.log"

log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [CODEX-PRE-EXECUTE] $1" >> "$LOG_FILE"
}

log "Starting pre-execute hook"

# Environment validation
if [[ -z "${GOOGLE_API_KEY:-}" && -z "${CODEX_API_KEY:-}" ]]; then
    log "WARNING: No Google or Codex API key found"
    echo "⚠️  Codex requires an API key. Please set GOOGLE_API_KEY or CODEX_API_KEY" >&2
    exit 1
fi

# Check if we're in a valid project directory
if [[ ! -d ".ai-craft" && ! -d ".claude" ]]; then
    log "WARNING: Not in an AI Craft project directory"
    echo "⚠️  This command should be run from an AI Craft project directory" >&2
fi

# Validate AI-CRAFT.md exists and set as context
if [[ -f ".ai-craft/AI-CRAFT.md" ]]; then
    log "Found AI-CRAFT.md"
    # Codex uses project context automatically
    log "AI-CRAFT.md will be used as project context"
elif [[ -f ".claude/CLAUDE.md" ]]; then
    log "Found CLAUDE.md (legacy)"
fi

# Model validation
if [[ -n "${CODEX_MODEL:-}" ]]; then
    log "Using model: $CODEX_MODEL"
else
    log "No model specified, using default (gemini-2.5-flash)"
fi

# Check project size for Codex indexing
PROJECT_SIZE=$(find . -type f -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.json" -o -name "*.yaml" -o -name "*.md" | wc -l | tr -d ' ')
if [[ "$PROJECT_SIZE" -gt 10000 ]]; then
    log "WARNING: Project has $PROJECT_SIZE files, Codex indexing may be slow"
fi

log "Pre-execute hook completed successfully"
exit 0
