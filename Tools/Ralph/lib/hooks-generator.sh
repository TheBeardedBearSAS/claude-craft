#!/bin/bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum - Hooks Generator Module
# Installe les scripts de hooks Ralph dans le projet et fusionne leur configuration
# dans .claude/settings.json sans jamais toucher aux hooks de l'utilisateur
# (fusion via Dev/scripts/lib/merge-hooks.mjs, entrées Ralph repérées par `/.ralph/hooks/`).
# =============================================================================

# Hooks configuration
HOOKS_ENABLED="${HOOKS_ENABLED:-true}"
HOOKS_MODE="${HOOKS_MODE:-advanced}"
# Répertoire des scripts dans le projet : ${HOOKS_DIR:-$PWD/.ralph/hooks} (résolu à l'appel)

# Sources fournies avec le paquet (Tools/Ralph/hooks et Dev/ voisins de Tools/).
_RALPH_HOOKS_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/../hooks" && pwd)"
_RALPH_SHARED_SRC="$_RALPH_HOOKS_SRC/../../../Dev/i18n/base/Common/hooks/scripts"

# Marqueur identifiant les entrées Ralph dans settings.json
RALPH_HOOKS_MATCH="/.ralph/hooks/"

# =============================================================================
# Initialize Hooks
# =============================================================================

init_hooks() {
    if [[ "$HOOKS_ENABLED" != "true" ]]; then
        print_verbose "Hooks disabled, skipping initialization"
        return 0
    fi

    # Load settings from config
    if [[ -n "${CONFIG_FILE:-}" && -f "$CONFIG_FILE" ]] && command -v yq &> /dev/null; then
        local enabled
        enabled=$(yq e '.hooks.enabled // "true"' "$CONFIG_FILE" 2>/dev/null)
        HOOKS_ENABLED="$enabled"

        local mode
        mode=$(yq e '.hooks.mode // "advanced"' "$CONFIG_FILE" 2>/dev/null)
        HOOKS_MODE="$mode"
    fi

    # Copy scripts into the project if absent and make them executable
    ensure_hook_scripts

    print_verbose "Hooks initialized (mode: $HOOKS_MODE)"
}

# =============================================================================
# Ensure Hook Scripts Exist (copied from the package when absent)
# =============================================================================

_copy_hook_script() {
    local src="$1" dest="$2"
    if [[ ! -f "$src" ]]; then
        print_warning "Hook script source not found: $src"
        return 0
    fi
    if [[ ! -f "$dest" ]]; then
        mkdir -p "$(dirname "$dest")"
        cp "$src" "$dest"
    fi
    if head -1 "$dest" | grep -q "^#!"; then
        chmod +x "$dest"
    fi
}

ensure_hook_scripts() {
    local dest="${HOOKS_DIR:-$PWD/.ralph/hooks}"
    local script

    mkdir -p "$dest/lib"

    for script in stop-dod-gate.sh session-restore.sh pre-tool-context.sh lib/ralph-common.sh; do
        _copy_hook_script "$_RALPH_HOOKS_SRC/$script" "$dest/$script"
    done

    # Gardes partagées : la DoD ne lance une commande qu'après leur verdict
    for script in block-dangerous-commands.sh guard-network.sh lib/hook-io.sh; do
        _copy_hook_script "$_RALPH_SHARED_SRC/$script" "$dest/$script"
    done
}

# =============================================================================
# merge-hooks.mjs resolution
# =============================================================================

# Affiche le chemin de merge-hooks.mjs ; échoue (avec avertissement) si node ou le script manque.
_ralph_merge_hooks_js() {
    local js="${RALPH_MERGE_HOOKS_JS:-$_RALPH_HOOKS_SRC/../../../Dev/scripts/lib/merge-hooks.mjs}"
    if ! command -v node &>/dev/null; then
        print_warning "node not found: .claude/settings.json left untouched"
        return 1
    fi
    if [[ ! -f "$js" ]]; then
        print_warning "merge-hooks.mjs not found ($js): .claude/settings.json left untouched"
        return 1
    fi
    printf '%s' "$js"
}

# =============================================================================
# Generate Claude Settings JSON
# =============================================================================

generate_hooks_config() {
    local output_file="${1:-.claude/settings.json}"

    local merge_js
    merge_js=$(_ralph_merge_hooks_js) || return 0

    ensure_hook_scripts

    local fragment_body
    case "$HOOKS_MODE" in
        simple)
            fragment_body=$(generate_simple_hooks_config)
            ;;
        advanced)
            fragment_body=$(generate_advanced_hooks_config)
            ;;
        *)
            print_warning "Unknown hooks mode: $HOOKS_MODE, using simple"
            fragment_body=$(generate_simple_hooks_config)
            ;;
    esac

    mkdir -p "$(dirname "$output_file")"
    local fragment="${output_file}.ralph-fragment.$$"
    printf '{"hooks": %s}\n' "$fragment_body" > "$fragment"

    # Retire d'abord les anciennes entrées Ralph (chemins absolus d'avant, `once`, ...),
    # puis ajoute les courantes : les hooks de l'utilisateur ne sont jamais touchés.
    if node "$merge_js" remove --settings "$output_file" --match "$RALPH_HOOKS_MATCH" >/dev/null \
        && node "$merge_js" add --settings "$output_file" --fragment "$fragment" >/dev/null; then
        print_success "${MSG_HOOKS_CONFIG_GENERATED:-Hooks configuration generated}: $output_file"
    else
        print_warning "Hooks configuration could not be merged into $output_file"
    fi
    rm -f "$fragment"
}

# =============================================================================
# Simple Hooks Configuration
# =============================================================================

generate_simple_hooks_config() {
    cat <<'EOF'
{
    "Stop": [
        {
            "hooks": [
                {
                    "type": "command",
                    "command": "bash \"$CLAUDE_PROJECT_DIR/.ralph/hooks/stop-dod-gate.sh\"",
                    "timeout": 300
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
    cat <<'EOF'
{
    "SessionStart": [
        {
            "hooks": [
                {
                    "type": "command",
                    "command": "bash \"$CLAUDE_PROJECT_DIR/.ralph/hooks/session-restore.sh\"",
                    "timeout": 10
                }
            ]
        }
    ],
    "PreToolUse": [
        {
            "matcher": "Agent|Task",
            "hooks": [
                {
                    "type": "command",
                    "command": "bash \"$CLAUDE_PROJECT_DIR/.ralph/hooks/pre-tool-context.sh\"",
                    "timeout": 5
                }
            ]
        }
    ],
    "Stop": [
        {
            "hooks": [
                {
                    "type": "command",
                    "command": "bash \"$CLAUDE_PROJECT_DIR/.ralph/hooks/stop-dod-gate.sh\"",
                    "timeout": 300
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
# Remove Hooks Configuration (uniquement les entrées Ralph)
# =============================================================================

remove_hooks_config() {
    local settings_file="${1:-.claude/settings.json}"

    if [[ ! -f "$settings_file" ]]; then
        return 0
    fi

    local merge_js
    merge_js=$(_ralph_merge_hooks_js) || return 0

    if node "$merge_js" remove --settings "$settings_file" --match "$RALPH_HOOKS_MATCH" >/dev/null; then
        print_info "Ralph hooks removed from $settings_file"
    fi
}

# =============================================================================
# Validate Hooks Setup
# =============================================================================

validate_hooks_setup() {
    local errors=0
    local hooks_dir="${HOOKS_DIR:-$PWD/.ralph/hooks}"

    # Check hooks directory
    if [[ ! -d "$hooks_dir" ]]; then
        print_warning "Hooks directory not found: $hooks_dir"
        errors=$((errors + 1))
    fi

    # Check required scripts
    local required_scripts=("stop-dod-gate.sh")
    if [[ "$HOOKS_MODE" == "advanced" ]]; then
        required_scripts+=("session-restore.sh" "pre-tool-context.sh")
    fi

    local script
    for script in "${required_scripts[@]}"; do
        local script_path="$hooks_dir/$script"
        if [[ ! -f "$script_path" ]]; then
            print_warning "Hook script not found: $script_path"
            errors=$((errors + 1))
        elif [[ ! -x "$script_path" ]]; then
            print_warning "Hook script not executable: $script_path"
            if head -1 "$script_path" | grep -q "^#!"; then
                chmod +x "$script_path" 2>/dev/null && print_info "Made executable: $script_path"
            else
                print_warning "Skipped chmod: no shebang in $script_path"
            fi
        fi
    done

    # Check Claude settings
    if [[ -f ".claude/settings.json" ]]; then
        if ! grep -q "$RALPH_HOOKS_MATCH" ".claude/settings.json"; then
            print_warning "No Ralph hooks configured in .claude/settings.json"
            errors=$((errors + 1))
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
# Hook Contract Reference (Claude Code)
# =============================================================================
#
# Payload JSON on stdin. Exit codes: 0 = ok, 2 = block (stderr shown to the model).
# Output reaching the model: hookSpecificOutput.{hookEventName, additionalContext}.
# Stop: print {"decision":"block","reason":"..."} with exit 0 ; `stop_hook_active`
# is true when the hook already forced a continuation (must then allow the stop).
#
# =============================================================================
