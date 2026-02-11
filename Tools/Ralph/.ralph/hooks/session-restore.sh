#!/bin/bash
# =============================================================================
# Ralph Wiggum - SessionStart Hook: Session Restore
# Injects Ralph context when a Claude session starts
#
# Exit codes:
#   0 - Success (with additionalContext)
#   1 - Error
# =============================================================================

set -euo pipefail

# Read input from stdin (Claude hook format)
INPUT=$(cat)

# Parse input JSON
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // ""')

# Change to project directory
cd "$CWD" 2>/dev/null || cd "."

# =============================================================================
# Configuration
# =============================================================================

RALPH_SESSION_BASE="${RALPH_SESSION_BASE:-.ralph}"
HOOK_CONTEXT_FILE="${RALPH_HOOK_CONTEXT:-}"

# =============================================================================
# Build Context
# =============================================================================

build_session_context() {
    local context=""

    # Check for Ralph session
    if [[ -f "$HOOK_CONTEXT_FILE" ]]; then
        local phase
        phase=$(jq -r '.phase // "UNKNOWN"' "$HOOK_CONTEXT_FILE" 2>/dev/null)
        local task
        task=$(jq -r '.current_task // ""' "$HOOK_CONTEXT_FILE" 2>/dev/null)
        local ralph_session
        ralph_session=$(jq -r '.session_id // ""' "$HOOK_CONTEXT_FILE" 2>/dev/null)

        context="Ralph Wiggum Session Active
- Ralph Session: $ralph_session
- Phase: $phase
- Current Task: ${task:-None}"
    fi

    # Check for sprint progress file
    local progress_file="$RALPH_SESSION_BASE/sprint-progress.md"
    if [[ -f "$progress_file" ]]; then
        # Extract key info from progress file
        local completed_count
        completed_count=$(grep -c '^\s*- \[x\]' "$progress_file" 2>/dev/null || echo "0")
        local pending_count
        pending_count=$(grep -c '^\s*- \[ \]' "$progress_file" 2>/dev/null || echo "0")

        if [[ -n "$context" ]]; then
            context="$context
- Completed Tasks: $completed_count
- Pending Tasks: $pending_count"
        else
            context="Sprint Progress:
- Completed Tasks: $completed_count
- Pending Tasks: $pending_count"
        fi

        # Add current phase from progress file
        local current_phase
        current_phase=$(grep -oP '(?<=## Current Phase: ).*' "$progress_file" 2>/dev/null | head -1)
        if [[ -n "$current_phase" ]]; then
            context="$context
- Sprint Phase: $current_phase"
        fi
    fi

    # Check for git status
    if command -v git &>/dev/null && git rev-parse --git-dir &>/dev/null 2>&1; then
        local branch
        branch=$(git branch --show-current 2>/dev/null)
        local changes
        changes=$(git status --porcelain 2>/dev/null | wc -l)

        if [[ -n "$context" ]]; then
            context="$context

Git Status:
- Branch: ${branch:-detached}
- Uncommitted changes: $changes"
        fi
    fi

    # If no context was built, provide minimal info
    if [[ -z "$context" ]]; then
        context="Ralph Wiggum monitoring active"
    fi

    echo "$context"
}

# =============================================================================
# Main Logic
# =============================================================================

# Build context
CONTEXT=$(build_session_context)

# Output JSON response
cat <<EOF
{
    "additionalContext": $(echo "$CONTEXT" | jq -Rs .)
}
EOF

exit 0
