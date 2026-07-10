#!/bin/bash
# AI Craft - Vibe Provider Post-Execute Hook
# Multi-AI Development Framework
# This hook runs after any Vibe command execution

set -euo pipefail

# Logging
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$HOOK_DIR")"
LOG_FILE="$PROJECT_DIR/../logs/vibe-hooks.log"

log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [VIBE-POST-EXECUTE] $1" >> "$LOG_FILE"
}

log "Starting post-execute hook"

# Check exit code from previous command
EXIT_CODE=${1:-0}
if [[ $EXIT_CODE -ne 0 ]]; then
    log "ERROR: Previous command failed with exit code $EXIT_CODE"
    # Don't exit with error, just log it
fi

# Log completion
log "Command completed with exit code: $EXIT_CODE"

# Cleanup temporary files if any
if [[ -n "${VIBE_TEMP_DIR:-}" && -d "$VIBE_TEMP_DIR" ]]; then
    log "Cleaning up temporary directory: $VIBE_TEMP_DIR"
    rm -rf "$VIBE_TEMP_DIR" 2>/dev/null || log "WARNING: Failed to cleanup temp dir"
fi

# Update usage statistics
USAGE_FILE="$PROJECT_DIR/../usage-stats.json"
mkdir -p "$(dirname "$USAGE_FILE")"

# Increment command count
if [[ -f "$USAGE_FILE" ]]; then
    COMMAND_COUNT=$(jq -r '.commands.vibe // 0' "$USAGE_FILE" 2>/dev/null || echo 0)
    jq ".commands.vibe = $((COMMAND_COUNT + 1))" "$USAGE_FILE" > "${USAGE_FILE}.tmp" 2>/dev/null && mv "${USAGE_FILE}.tmp" "$USAGE_FILE" 2>/dev/null || \
        log "WARNING: Failed to update usage statistics"
fi

# Notify if this was a long-running command
if [[ -n "${COMMAND_START_TIME:-}" ]]; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - COMMAND_START_TIME))
    if [[ $DURATION -gt 60 ]]; then
        log "Long-running command: ${DURATION}s"
    fi
fi

log "Post-execute hook completed successfully"
exit 0
