#!/bin/bash
# =============================================================================
# Ralph Wiggum - PreToolUse Hook: Context Injector
# Injects relevant context before specific tool uses
#
# Exit codes:
#   0 - Continue (with optional additionalContext)
#   1 - Error
#   2 - Block tool use
# =============================================================================

set -e

# Read input from stdin (Claude hook format)
INPUT=$(cat)

# Parse input JSON
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input // "{}"')

# Change to project directory
cd "$CWD" 2>/dev/null || cd "."

# =============================================================================
# Configuration
# =============================================================================

RALPH_SESSION_BASE="${RALPH_SESSION_BASE:-.ralph}"

# =============================================================================
# Tool-Specific Context
# =============================================================================

get_tool_context() {
    local tool="$1"
    local context=""

    case "$tool" in
        # Bash tool - remind about docker requirement
        Bash)
            # Check CLAUDE.md for docker requirement
            if [[ -f ".claude/CLAUDE.md" ]]; then
                if grep -q "docker" ".claude/CLAUDE.md" 2>/dev/null; then
                    context="Reminder: Use docker for commands as per project guidelines"
                fi
            fi
            ;;

        # Write/Edit tools - check for protected files
        Write|Edit)
            local file_path
            file_path=$(echo "$TOOL_INPUT" | jq -r '.file_path // .path // ""')
            if [[ -n "$file_path" ]]; then
                # Check if file is in protected list
                if [[ "$file_path" == *".env"* ]] || [[ "$file_path" == *"secrets"* ]]; then
                    context="Warning: Modifying sensitive file. Ensure no secrets are exposed."
                fi
            fi
            ;;

        # Task tool - remind about sprint context
        Task)
            local progress_file="$RALPH_SESSION_BASE/sprint-progress.md"
            if [[ -f "$progress_file" ]]; then
                local current_task
                current_task=$(grep -oP '(?<=## Current Task: ).*' "$progress_file" 2>/dev/null | head -1)
                if [[ -n "$current_task" ]]; then
                    context="Current sprint task: $current_task"
                fi
            fi
            ;;

        *)
            # No specific context for other tools
            ;;
    esac

    echo "$context"
}

# =============================================================================
# Main Logic
# =============================================================================

# Get tool-specific context
CONTEXT=$(get_tool_context "$TOOL_NAME")

# Output JSON response
if [[ -n "$CONTEXT" ]]; then
    cat <<EOF
{
    "additionalContext": $(echo "$CONTEXT" | jq -Rs .)
}
EOF
else
    echo '{}'
fi

exit 0
