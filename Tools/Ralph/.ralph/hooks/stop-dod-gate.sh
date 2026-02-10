#!/bin/bash
# =============================================================================
# Ralph Wiggum - Stop Hook: DoD Gate
# Blocks Claude from stopping if DoD is not satisfied
#
# Exit codes:
#   0 - Allow stop (DoD passed)
#   2 - Block stop (DoD not satisfied)
# =============================================================================

set -e

# Read input from stdin (Claude hook format)
INPUT=$(cat)

# Parse input JSON
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
STOP_REASON=$(echo "$INPUT" | jq -r '.stop_reason // "unknown"')

# Change to project directory
cd "$CWD" 2>/dev/null || cd "."

# =============================================================================
# Configuration
# =============================================================================

# Find ralph.yml config
CONFIG_FILE=""
for path in "ralph.yml" ".claude/ralph.yml"; do
    if [[ -f "$path" ]]; then
        CONFIG_FILE="$path"
        break
    fi
done

# Find Ralph session
RALPH_SESSION_BASE="${RALPH_SESSION_BASE:-.ralph}"
HOOK_CONTEXT_FILE="${RALPH_HOOK_CONTEXT:-}"

# =============================================================================
# DoD Validation
# =============================================================================

validate_dod_for_stop() {
    # If no config, use simple completion marker check
    if [[ -z "$CONFIG_FILE" || ! -f "$CONFIG_FILE" ]]; then
        # No DoD configured, allow stop
        return 0
    fi

    # Check if yq is available
    if ! command -v yq &>/dev/null; then
        # Can't validate without yq, allow stop
        return 0
    fi

    # Get DoD checklist
    local checklist
    checklist=$(yq e '.definition_of_done.checklist // []' "$CONFIG_FILE" 2>/dev/null)

    if [[ "$checklist" == "[]" || -z "$checklist" ]]; then
        # No checklist, allow stop
        return 0
    fi

    # Get count of required items
    local count
    count=$(echo "$checklist" | yq e 'length' -)

    local all_passed=true

    for ((i=0; i<count; i++)); do
        local item
        item=$(yq e ".definition_of_done.checklist[$i]" "$CONFIG_FILE")

        local required
        required=$(echo "$item" | yq e '.required // true' -)

        if [[ "$required" != "true" ]]; then
            continue
        fi

        local type
        type=$(echo "$item" | yq e '.type' -)

        case "$type" in
            command)
                local cmd
                cmd=$(echo "$item" | yq e '.command' -)
                if [[ ! "$cmd" =~ ^[a-zA-Z0-9_./" -]+$ ]]; then
                    all_passed=false
                    break
                fi
                if ! bash -c "$cmd" >/dev/null 2>&1; then
                    all_passed=false
                    break
                fi
                ;;
            # Other types don't block stop
        esac
    done

    if [[ "$all_passed" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# =============================================================================
# Main Logic
# =============================================================================

# Skip DoD check for certain stop reasons
case "$STOP_REASON" in
    user_interrupt|timeout|error)
        # Allow these stops without DoD check
        echo '{"message": "Stop allowed (reason: '"$STOP_REASON"')"}'
        exit 0
        ;;
esac

# Validate DoD
if validate_dod_for_stop; then
    # DoD passed, allow stop
    echo '{"message": "DoD validation passed, stop allowed"}'
    exit 0
else
    # DoD not satisfied, block stop
    cat <<EOF
{
    "message": "DoD not satisfied - please complete all required checks before stopping",
    "additionalContext": "IMPORTANT: Definition of Done requirements are not met. Please run the required tests/checks and fix any issues before completing the task."
}
EOF
    exit 2
fi
