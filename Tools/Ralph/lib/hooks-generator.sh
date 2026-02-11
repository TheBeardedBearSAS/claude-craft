#!/bin/bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum - Hooks Generator Module
# Generate Claude Code 2.1.23+ hooks configuration
# =============================================================================

# Hooks configuration
HOOKS_ENABLED="${HOOKS_ENABLED:-true}"
HOOKS_MODE="${HOOKS_MODE:-advanced}"
HOOKS_DIR="${HOOKS_DIR:-.ralph/hooks}"

# =============================================================================
# Initialize Hooks
# =============================================================================

init_hooks() {
    if [[ "$HOOKS_ENABLED" != "true" ]]; then
        print_verbose "Hooks disabled, skipping initialization"
        return 0
    fi

    # Load settings from config
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local enabled
        enabled=$(yq e '.hooks.enabled // "true"' "$CONFIG_FILE" 2>/dev/null)
        HOOKS_ENABLED="$enabled"

        local mode
        mode=$(yq e '.hooks.mode // "advanced"' "$CONFIG_FILE" 2>/dev/null)
        HOOKS_MODE="$mode"
    fi

    # Create hooks directory if needed
    mkdir -p "$HOOKS_DIR"

    # Ensure hook scripts exist and are executable
    ensure_hook_scripts

    print_verbose "Hooks initialized (mode: $HOOKS_MODE)"
}

# =============================================================================
# Ensure Hook Scripts Exist
# =============================================================================

ensure_hook_scripts() {
    local scripts=(
        "stop-dod-gate.sh"
        "session-restore.sh"
        "status-injector.sh"
        "pre-tool-context.sh"
    )

    for script in "${scripts[@]}"; do
        local script_path="$HOOKS_DIR/$script"
        if [[ -f "$script_path" ]] && head -1 "$script_path" | grep -q "^#!"; then
            chmod +x "$script_path"
        fi
    done
}

# =============================================================================
# Generate Claude Settings JSON
# =============================================================================

generate_hooks_config() {
    local output_file="${1:-.claude/settings.json}"
    local project_dir="${2:-.}"

    # Ensure .claude directory exists
    mkdir -p "$(dirname "$output_file")"

    # Read existing settings if present
    local existing_settings="{}"
    if [[ -f "$output_file" ]]; then
        existing_settings=$(cat "$output_file" 2>/dev/null || echo "{}")
    fi

    # Generate hooks configuration based on mode
    local hooks_config
    case "$HOOKS_MODE" in
        simple)
            hooks_config=$(generate_simple_hooks_config)
            ;;
        advanced)
            hooks_config=$(generate_advanced_hooks_config)
            ;;
        *)
            print_warning "Unknown hooks mode: $HOOKS_MODE, using simple"
            hooks_config=$(generate_simple_hooks_config)
            ;;
    esac

    # Merge with existing settings
    local merged
    if command -v jq &>/dev/null; then
        merged=$(echo "$existing_settings" | jq --argjson hooks "$hooks_config" '. + {hooks: $hooks}')
    else
        # Fallback: just write hooks config
        merged="{\"hooks\": $hooks_config}"
    fi

    # Write to file
    echo "$merged" > "$output_file"

    print_success "${MSG_HOOKS_CONFIG_GENERATED:-Hooks configuration generated}: $output_file"
}

# =============================================================================
# Simple Hooks Configuration
# =============================================================================

generate_simple_hooks_config() {
    local hooks_dir_abs
    hooks_dir_abs=$(cd "$HOOKS_DIR" 2>/dev/null && pwd || echo "$PWD/$HOOKS_DIR")

    cat <<EOF
{
    "Stop": [
        {
            "matcher": ".*",
            "hooks": [
                {
                    "type": "command",
                    "command": "$hooks_dir_abs/stop-dod-gate.sh"
                }
            ]
        }
    ]
}
EOF
}

# =============================================================================
# Advanced Hooks Configuration
# =============================================================================

generate_advanced_hooks_config() {
    local hooks_dir_abs
    hooks_dir_abs=$(cd "$HOOKS_DIR" 2>/dev/null && pwd || echo "$PWD/$HOOKS_DIR")

    cat <<EOF
{
    "SessionStart": [
        {
            "matcher": ".*",
            "hooks": [
                {
                    "type": "command",
                    "command": "$hooks_dir_abs/session-restore.sh"
                }
            ]
        }
    ],
    "PreToolUse": [
        {
            "matcher": ".*",
            "hooks": [
                {
                    "type": "command",
                    "command": "$hooks_dir_abs/status-injector.sh",
                    "once": true
                }
            ]
        }
    ],
    "Stop": [
        {
            "matcher": ".*",
            "hooks": [
                {
                    "type": "command",
                    "command": "$hooks_dir_abs/stop-dod-gate.sh"
                }
            ]
        }
    ]
}
EOF
}

# =============================================================================
# Export Session Context for Hooks
# =============================================================================

export_session_context_for_hooks() {
    local session_id="$1"
    local phase="${2:-UNKNOWN}"
    local task="${3:-}"

    # Create context file for hooks to read
    local context_file="$RALPH_SESSION_BASE/sessions/$session_id/hook-context.json"

    cat > "$context_file" <<EOF
{
    "session_id": "$session_id",
    "phase": "$phase",
    "current_task": "$task",
    "timestamp": "$(date -Iseconds)",
    "config_file": "$CONFIG_FILE",
    "project_dir": "$PWD"
}
EOF

    # Export as environment variable for hooks
    export RALPH_HOOK_CONTEXT="$context_file"
}

# =============================================================================
# Get Hook Context for additionalContext
# =============================================================================

get_hook_additional_context() {
    local session_id="$1"

    # Build context string for Claude's additionalContext
    local phase="UNKNOWN"
    local task=""
    local dod_status=""

    # Get phase from sprint progress if available
    if type get_current_phase &>/dev/null; then
        phase=$(get_current_phase 2>/dev/null || echo "UNKNOWN")
    fi

    # Get current task
    if type get_current_task &>/dev/null; then
        task=$(get_current_task 2>/dev/null || echo "")
    fi

    # Get DoD status summary
    if [[ -n "$CONFIG_FILE" && -f "$CONFIG_FILE" ]]; then
        dod_status="DoD configured"
    else
        dod_status="DoD: simple marker mode"
    fi

    cat <<EOF
Ralph Wiggum Context:
- Session: $session_id
- Phase: $phase
- Current Task: ${task:-None}
- $dod_status
EOF
}

# =============================================================================
# Remove Hooks Configuration
# =============================================================================

remove_hooks_config() {
    local settings_file="${1:-.claude/settings.json}"

    if [[ ! -f "$settings_file" ]]; then
        return 0
    fi

    if command -v jq &>/dev/null; then
        local updated
        updated=$(jq 'del(.hooks)' "$settings_file" 2>/dev/null)
        if [[ -n "$updated" ]]; then
            echo "$updated" > "$settings_file"
            print_info "Hooks configuration removed from $settings_file"
        fi
    fi
}

# =============================================================================
# Validate Hooks Setup
# =============================================================================

validate_hooks_setup() {
    local errors=0

    # Check hooks directory
    if [[ ! -d "$HOOKS_DIR" ]]; then
        print_warning "Hooks directory not found: $HOOKS_DIR"
        errors=$((errors + 1))
    fi

    # Check required scripts
    local required_scripts=("stop-dod-gate.sh")
    if [[ "$HOOKS_MODE" == "advanced" ]]; then
        required_scripts+=("session-restore.sh" "status-injector.sh")
    fi

    for script in "${required_scripts[@]}"; do
        local script_path="$HOOKS_DIR/$script"
        if [[ ! -f "$script_path" ]]; then
            print_warning "Hook script not found: $script_path"
            errors=$((errors + 1))
        elif [[ ! -x "$script_path" ]]; then
            print_warning "Hook script not executable: $script_path"
            if [[ -f "$script_path" ]] && head -1 "$script_path" | grep -q "^#!"; then
                chmod +x "$script_path" 2>/dev/null && print_info "Made executable: $script_path"
            else
                print_warning "Skipped chmod: no shebang in $script_path"
            fi
        fi
    done

    # Check Claude settings
    if [[ -f ".claude/settings.json" ]]; then
        if command -v jq &>/dev/null; then
            local has_hooks
            has_hooks=$(jq -e '.hooks' ".claude/settings.json" 2>/dev/null)
            if [[ -z "$has_hooks" ]]; then
                print_warning "No hooks configured in .claude/settings.json"
                errors=$((errors + 1))
            fi
        fi
    else
        print_warning ".claude/settings.json not found"
        errors=$((errors + 1))
    fi

    if [[ $errors -eq 0 ]]; then
        print_success "Hooks setup validated"
        return 0
    else
        print_warning "Hooks setup has $errors issues"
        return 1
    fi
}

# =============================================================================
# Hook Exit Codes Reference
# =============================================================================
#
# Exit codes for hook scripts (Claude Code 2.1.23+):
#   0 - Continue (success)
#   1 - Error (abort with error message)
#   2 - Block (reject the operation)
#
# Hook output format:
#   JSON object with optional fields:
#   - message: string to display
#   - additionalContext: string to inject into Claude's context
#   - error: error message (for exit code 1)
#
# =============================================================================
