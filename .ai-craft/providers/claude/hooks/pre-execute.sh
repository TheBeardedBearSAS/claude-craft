#!/bin/bash
# AI Craft - Claude Code Provider Pre-Execute Hook
# Multi-AI Development Framework
# This hook runs before any Claude Code command execution

set -euo pipefail

# Logging
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$HOOK_DIR")"
LOG_FILE="$PROJECT_DIR/../logs/claude-hooks.log"

log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [CLAUDE-PRE-EXECUTE] $1" >> "$LOG_FILE"
}

log "Starting pre-execute hook"

# Environment validation
if [[ ! -f "$HOME/.claude/config.json" && ! -f "$HOME/.config/claude/config.json" ]]; then
    log "WARNING: No Claude Code configuration found"
    echo "⚠️  Claude Code requires configuration. Please run 'claude auth'" >&2
fi

# Check if we're in a valid project directory
if [[ ! -d ".ai-craft" && ! -d ".claude" ]]; then
    log "WARNING: Not in an AI Craft project directory"
    echo "⚠️  This command should be run from an AI Craft project directory" >&2
fi

# Validate AI-CRAFT.md exists
if [[ -f ".ai-craft/AI-CRAFT.md" ]]; then
    log "Found AI-CRAFT.md"
    # Claude Code will use this automatically as system prompt
    log "AI-CRAFT.md will be used as context"
elif [[ -f ".claude/CLAUDE.md" ]]; then
    log "Found CLAUDE.md (legacy)"
fi

# Model validation
if [[ -n "${CLAUDE_MODEL:-}" ]]; then
    log "Using model: $CLAUDE_MODEL"
    # Validate it's a supported model
    case "$CLAUDE_MODEL" in
        claude-3-7-sonnet*|claude-3-5-sonnet*|claude-3-haiku*|claude-opus*|claude-sonnet*)
            log "Model is valid"
            ;;
        *)
            log "WARNING: Unknown model, using default"
            ;;
    esac
fi

# Check for project-specific Claude settings
if [[ -f ".claude/settings.json" ]]; then
    log "Found project-specific Claude settings"
fi

log "Pre-execute hook completed successfully"
exit 0
