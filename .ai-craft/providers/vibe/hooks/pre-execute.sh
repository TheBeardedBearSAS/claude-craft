#!/bin/bash
# AI Craft - Vibe Provider Pre-Execute Hook
# Multi-AI Development Framework
# This hook runs before any Vibe command execution

set -euo pipefail

# Logging
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$HOOK_DIR")"
LOG_FILE="$PROJECT_DIR/../logs/vibe-hooks.log"

log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [VIBE-PRE-EXECUTE] $1" >> "$LOG_FILE"
}

log "Starting pre-execute hook"

# Environment validation
if [[ -z "${MISTRAL_API_KEY:-}" && ! -f "$HOME/.vibe/config" ]]; then
    log "WARNING: No MISTRAL_API_KEY set and no Vibe config found"
    echo "⚠️  Vibe requires API key or local configuration. Please set MISTRAL_API_KEY or run 'vibe configure'" >&2
    exit 1
fi

# Check if we're in a valid project directory
if [[ ! -d ".ai-craft" && ! -d ".claude" ]]; then
    log "WARNING: Not in an AI Craft project directory"
    echo "⚠️  This command should be run from an AI Craft project directory" >&2
fi

# Validate AI-CRAFT.md exists
if [[ -f ".ai-craft/AI-CRAFT.md" ]]; then
    log "Found AI-CRAFT.md, setting as system prompt"
    export VIBE_SYSTEM_PROMPT="$(cat .ai-craft/AI-CRAFT.md)"
    log "System prompt configured from AI-CRAFT.md"
elif [[ -f ".claude/CLAUDE.md" ]]; then
    log "Found CLAUDE.md, converting to system prompt"
    export VIBE_SYSTEM_PROMPT="$(cat .claude/CLAUDE.md)"
    log "System prompt configured from CLAUDE.md (legacy)"
else
    log "No system prompt file found"
fi

# Model validation
if [[ -n "${VIBE_MODEL:-}" ]]; then
    log "Using model: $VIBE_MODEL"
else
    log "No model specified, using default"
fi

# Token budget check
MAX_TOKENS=${MAX_TOKENS:-32768}
if [[ "$MAX_TOKENS" -gt 32768 ]]; then
    log "WARNING: Requested tokens ($MAX_TOKENS) exceeds recommended maximum (32768)"
fi

log "Pre-execute hook completed successfully"
exit 0
