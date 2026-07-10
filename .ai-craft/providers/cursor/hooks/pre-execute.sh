#!/bin/bash
# AI Craft - Cursor Provider Pre-Execute Hook
# Multi-AI Development Framework
# This hook runs before any Cursor command execution

set -euo pipefail

# Logging
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$HOOK_DIR")"
LOG_FILE="$PROJECT_DIR/../logs/cursor-hooks.log"

log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [CURSOR-PRE-EXECUTE] $1" >> "$LOG_FILE"
}

log "Starting pre-execute hook"

# Environment validation
if [[ ! -d "$HOME/.cursor" && ! -f "$HOME/.config/cursor/config.json" ]]; then
    log "WARNING: No Cursor configuration found"
    echo "⚠️  Cursor requires configuration. Please install Cursor extension in VSCode" >&2
fi

# Check if we're in a valid project directory
if [[ ! -d ".ai-craft" && ! -d ".claude" ]]; then
    log "WARNING: Not in an AI Craft project directory"
    echo "⚠️  This command should be run from an AI Craft project directory" >&2
fi

# Validate AI-CRAFT.md exists
if [[ -f ".ai-craft/AI-CRAFT.md" ]]; then
    log "Found AI-CRAFT.md"
    log "AI-CRAFT.md will be available as context in Cursor"
elif [[ -f ".claude/CLAUDE.md" ]]; then
    log "Found CLAUDE.md (legacy)"
fi

# Model validation
if [[ -n "${CURSOR_MODEL:-}" ]]; then
    log "Using model: $CURSOR_MODEL"
else
    log "No model specified, using Cursor default"
fi

# Check for VSCode workspace
if [[ -d ".vscode" ]]; then
    log "Found VSCode workspace configuration"
    if [[ -f ".vscode/settings.json" ]]; then
        log "Found workspace settings"
    fi
fi

# Check for Cursor extension
if [[ -d "$HOME/.vscode/extensions/continuumai.cursor-*" ]]; then
    log "Cursor extension is installed"
else
    log "WARNING: Cursor extension not found"
    echo "⚠️  Cursor extension not installed. Please install from VSCode marketplace" >&2
fi

log "Pre-execute hook completed successfully"
exit 0
