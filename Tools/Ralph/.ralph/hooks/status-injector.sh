#!/bin/bash
# =============================================================================
# Ralph Wiggum - PreToolUse Hook: Status Injector
# Injects current DoD status before first tool use (once: true)
#
# Exit codes:
#   0 - Continue (with additionalContext)
#   1 - Error
# =============================================================================

set -euo pipefail

# Read input from stdin (Claude hook format)
INPUT=$(cat)

# Parse input JSON
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')

# Change to project directory
cd "$CWD" 2>/dev/null || cd "."

# =============================================================================
# Configuration
# =============================================================================

CONFIG_FILE=""
for path in "ralph.yml" ".claude/ralph.yml"; do
    if [[ -f "$path" ]]; then
        CONFIG_FILE="$path"
        break
    fi
done

RALPH_SESSION_BASE="${RALPH_SESSION_BASE:-.ralph}"

# =============================================================================
# Get DoD Status
# =============================================================================

get_dod_status() {
    local status=""

    # If no config, basic status
    if [[ -z "$CONFIG_FILE" || ! -f "$CONFIG_FILE" ]]; then
        echo "DoD: Using simple completion marker (<promise>COMPLETE</promise>)"
        return
    fi

    # Check if yq is available
    if ! command -v yq &>/dev/null; then
        echo "DoD: Configuration present but yq not available for parsing"
        return
    fi

    # Get DoD checklist
    local checklist
    checklist=$(yq e '.definition_of_done.checklist // []' "$CONFIG_FILE" 2>/dev/null)

    if [[ "$checklist" == "[]" || -z "$checklist" ]]; then
        local marker
        marker=$(yq e '.definition_of_done.completion_marker // "<promise>COMPLETE</promise>"' "$CONFIG_FILE" 2>/dev/null)
        echo "DoD: Using completion marker: $marker"
        return
    fi

    # Check each item
    status="Definition of Done Status:"
    local count
    count=$(echo "$checklist" | yq e 'length' -)

    local passed=0
    local failed=0
    local total=0

    for ((i=0; i<count; i++)); do
        local item
        item=$(yq e ".definition_of_done.checklist[$i]" "$CONFIG_FILE")

        local id
        id=$(echo "$item" | yq e '.id' -)
        local name
        name=$(echo "$item" | yq e '.name' -)
        local type
        type=$(echo "$item" | yq e '.type' -)
        local required
        required=$(echo "$item" | yq e '.required // true' -)

        if [[ "$required" != "true" ]]; then
            continue
        fi

        total=$((total + 1))

        local check_passed=false
        case "$type" in
            command)
                local cmd
                cmd=$(echo "$item" | yq e '.command' -)
                if [[ "$cmd" =~ ^[a-zA-Z0-9_./" -]+$ ]] && bash -c "$cmd" >/dev/null 2>&1; then
                    check_passed=true
                fi
                ;;
            *)
                # Can't check other types here
                check_passed=true
                ;;
        esac

        if [[ "$check_passed" == "true" ]]; then
            passed=$((passed + 1))
            status="$status
  [PASS] $name"
        else
            failed=$((failed + 1))
            status="$status
  [FAIL] $name"
        fi
    done

    status="$status

Summary: $passed/$total required checks passing"

    if [[ $failed -gt 0 ]]; then
        status="$status
IMPORTANT: Fix failing checks before completing the task."
    fi

    echo "$status"
}

# =============================================================================
# Main Logic
# =============================================================================

# Get DoD status
DOD_STATUS=$(get_dod_status)

# Output JSON response
cat <<EOF
{
    "additionalContext": $(echo "$DOD_STATUS" | jq -Rs .)
}
EOF

exit 0
