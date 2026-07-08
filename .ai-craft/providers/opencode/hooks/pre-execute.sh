#!/bin/bash
# AI Craft - OpenCode Provider Pre-Execute Hook
# Multi-AI Development Framework
# This hook runs before any OpenCode command execution

set -euo pipefail

# Logging
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$HOOK_DIR")"
LOG_FILE="$PROJECT_DIR/../logs/opencode-hooks.log"

log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [OPENCODE-PRE-EXECUTE] $1" >> "$LOG_FILE"
}

log "Starting pre-execute hook"

# Environment validation
# OpenCode is self-hosted, check if server is running
if ! command -v opencode &> /dev/null; then
    log "WARNING: OpenCode CLI not found in PATH"
    echo "⚠️  OpenCode CLI not found. Please install: npm install -g @open-code-ai/cli" >&2
fi

# Check if OpenCode server is running
if ! curl -s http://localhost:12345/api/health &> /dev/null; then
    log "WARNING: OpenCode server not responding on localhost:12345"
    echo "⚠️  OpenCode server not running. Please start with: opencode" >&2
fi

# Check if we're in a valid project directory
if [[ ! -d ".ai-craft" && ! -d ".claude" ]]; then
    log "WARNING: Not in an AI Craft project directory"
    echo "⚠️  This command should be run from an AI Craft project directory" >&2
fi

# Validate AI-CRAFT.md exists
if [[ -f ".ai-craft/AI-CRAFT.md" ]]; then
    log "Found AI-CRAFT.md"
    log "AI-CRAFT.md will be used as project context"
elif [[ -f ".claude/CLAUDE.md" ]]; then
    log "Found CLAUDE.md (legacy)"
fi

# Model validation
if [[ -n "${OPENCODE_MODEL:-}" ]]; then
    log "Using model: $OPENCODE_MODEL"
else
    log "No model specified, using OpenCode default"
fi

# Check for custom models directory
if [[ -d ".ai-craft/providers/opencode/models" ]]; then
    log "Found custom models directory"
    MODEL_COUNT=$(ls -1 .ai-craft/providers/opencode/models/ | wc -l)
    log "Loaded $MODEL_COUNT custom models"
fi

# Check for plugins
if [[ -d ".ai-craft/providers/opencode/plugins" ]]; then
    log "Found plugins directory"
    PLUGIN_COUNT=$(ls -1 .ai-craft/providers/opencode/plugins/ | wc -l)
    log "Loaded $PLUGIN_COUNT plugins"
fi

log "Pre-execute hook completed successfully"
exit 0
