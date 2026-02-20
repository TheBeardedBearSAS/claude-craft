#!/bin/bash
# =============================================================================
# install-rtk.sh — Install and configure RTK (Rust Token Killer)
#
# RTK reduces LLM token consumption by 60-90% by intercepting terminal
# commands and compressing their outputs before they reach Claude Code.
#
# Usage:
#   bash install-rtk.sh [--lang=XX] [--uninstall] [--check]
#
# Options:
#   --lang=XX      Language (en, fr, es, de, pt). Default: en
#   --uninstall    Remove RTK hooks from settings.json
#   --check        Check RTK installation status
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Resolve script directory and source dependencies
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOLS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Source UI helpers
if [[ -f "$TOOLS_DIR/lib/tools-ui.sh" ]]; then
    source "$TOOLS_DIR/lib/tools-ui.sh"
elif [[ -f "$HOME/.local/lib/claude-craft/tools-ui.sh" ]]; then
    source "$HOME/.local/lib/claude-craft/tools-ui.sh"
else
    # Minimal fallback
    print_success() { echo "✓ $1"; }
    print_error()   { echo "✗ $1"; }
    print_info()    { echo "ℹ $1"; }
    print_warning() { echo "⚠ $1"; }
fi

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
LANG_CODE="en"
ACTION="install"

for arg in "$@"; do
    case "$arg" in
        --lang=*) LANG_CODE="${arg#--lang=}" ;;
        --uninstall) ACTION="uninstall" ;;
        --check) ACTION="check" ;;
    esac
done

# Validate language
case "$LANG_CODE" in
    en|fr|es|de|pt) ;;
    *) LANG_CODE="en" ;;
esac

# ---------------------------------------------------------------------------
# Load i18n messages
# ---------------------------------------------------------------------------
I18N_FILE="$TOOLS_DIR/i18n/rtk/${LANG_CODE}.sh"
if [[ -f "$I18N_FILE" ]]; then
    source "$I18N_FILE"
else
    # Fallback to English
    source "$TOOLS_DIR/i18n/rtk/en.sh"
fi

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CLAUDE_DIR="$HOME/.claude"
CLAUDE_CONFIG="${CLAUDE_CONFIG_DIR:-$CLAUDE_DIR}"
SETTINGS_FILE="$CLAUDE_CONFIG/settings.json"
HOOKS_DIR="$CLAUDE_DIR/hooks"
HOOK_SCRIPT="$HOOKS_DIR/rtk-rewrite.sh"
RTK_MD="$CLAUDE_DIR/RTK.md"

# The hook entry we manage in settings.json
RTK_HOOK_MATCHER="Bash"
RTK_HOOK_COMMAND="~/.claude/hooks/rtk-rewrite.sh"

# ---------------------------------------------------------------------------
# check_prerequisites — verify jq and curl are available
# ---------------------------------------------------------------------------
check_prerequisites() {
    print_info "$MSG_PREREQ_TITLE"
    local ok=true

    if command -v jq &>/dev/null; then
        print_success "$MSG_PREREQ_JQ"
    else
        print_error "$MSG_PREREQ_JQ_MISSING"
        ok=false
    fi

    if command -v curl &>/dev/null; then
        print_success "$MSG_PREREQ_CURL"
    else
        print_error "$MSG_PREREQ_CURL_MISSING"
        ok=false
    fi

    if [[ "$ok" != true ]]; then
        exit 1
    fi
}

# ---------------------------------------------------------------------------
# check_rtk_installed — check if RTK binary exists
# ---------------------------------------------------------------------------
check_rtk_installed() {
    if command -v rtk &>/dev/null; then
        return 0
    fi
    return 1
}

# ---------------------------------------------------------------------------
# install_rtk_binary — install RTK via official installer
# ---------------------------------------------------------------------------
install_rtk_binary() {
    print_info "$MSG_RTK_CHECK"

    if check_rtk_installed; then
        local version
        version=$(rtk --version 2>/dev/null || echo "unknown")
        print_success "$MSG_RTK_INSTALLED ($version)"
        return 0
    fi

    print_warning "$MSG_RTK_NOT_FOUND"
    print_info "$MSG_RTK_INSTALL_START"

    if curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh; then
        # Re-check after install (binary might be in a new path)
        export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
        if check_rtk_installed; then
            local version
            version=$(rtk --version 2>/dev/null || echo "unknown")
            print_success "$MSG_RTK_INSTALL_OK ($version)"
        else
            print_error "$MSG_RTK_INSTALL_FAIL"
            exit 1
        fi
    else
        print_error "$MSG_RTK_INSTALL_FAIL"
        exit 1
    fi
}

# ---------------------------------------------------------------------------
# configure_rtk_hooks — run rtk init to create hook script + RTK.md
# ---------------------------------------------------------------------------
configure_rtk_hooks() {
    print_info "$MSG_HOOKS_TITLE"

    # Skip if hook script already exists
    if [[ -f "$HOOK_SCRIPT" ]]; then
        print_success "$MSG_HOOKS_SKIP"
        return 0
    fi

    mkdir -p "$HOOKS_DIR"

    print_info "$MSG_HOOKS_INIT"
    # --no-patch: creates hook + RTK.md without touching settings.json
    if rtk init -g --no-patch 2>/dev/null; then
        print_success "$MSG_HOOKS_INIT_OK"
    else
        # rtk init may fail if already configured — check if hook exists now
        if [[ -f "$HOOK_SCRIPT" ]]; then
            print_success "$MSG_HOOKS_INIT_OK"
        else
            print_error "$MSG_HOOKS_INIT_FAIL"
            exit 1
        fi
    fi
}

# ---------------------------------------------------------------------------
# merge_settings_json — safely add RTK hook to PreToolUse array
#
# This function:
# - Creates settings.json if it doesn't exist
# - Creates a backup before modifying
# - Appends the RTK hook to .hooks.PreToolUse[] without overwriting existing hooks
# - Is idempotent (skips if hook already present)
# ---------------------------------------------------------------------------
merge_settings_json() {
    print_info "$MSG_MERGE_TITLE"

    mkdir -p "$CLAUDE_DIR"

    # If settings.json doesn't exist, create minimal one with RTK hook
    if [[ ! -f "$SETTINGS_FILE" ]]; then
        cat > "$SETTINGS_FILE" <<'SETTINGS_EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/rtk-rewrite.sh"
          }
        ]
      }
    ]
  }
}
SETTINGS_EOF
        print_success "$MSG_MERGE_CREATED"
        return 0
    fi

    # Check if RTK hook is already present (idempotent)
    if jq -e '.hooks.PreToolUse[]? | select(.hooks[]?.command == "~/.claude/hooks/rtk-rewrite.sh")' "$SETTINGS_FILE" &>/dev/null; then
        print_success "$MSG_MERGE_EXISTS"
        return 0
    fi

    # Backup before modifying
    local backup="${SETTINGS_FILE}.bak.$(date +%Y%m%d%H%M%S)"
    cp "$SETTINGS_FILE" "$backup"
    print_info "$MSG_MERGE_BACKUP $backup"

    # Build the RTK hook entry
    local rtk_hook='{"matcher":"Bash","hooks":[{"type":"command","command":"~/.claude/hooks/rtk-rewrite.sh"}]}'

    # Merge: append to existing PreToolUse array (or create it)
    local tmp_file="${SETTINGS_FILE}.tmp"
    if jq --argjson hook "$rtk_hook" '
        # Ensure .hooks exists
        .hooks //= {} |
        # Ensure .hooks.PreToolUse is an array
        .hooks.PreToolUse //= [] |
        # Append RTK hook
        .hooks.PreToolUse += [$hook]
    ' "$SETTINGS_FILE" > "$tmp_file" 2>/dev/null; then
        mv "$tmp_file" "$SETTINGS_FILE"
        print_success "$MSG_MERGE_ADDED"
    else
        rm -f "$tmp_file"
        print_error "$MSG_MERGE_FAIL"
        # Restore backup
        cp "$backup" "$SETTINGS_FILE"
        exit 1
    fi
}

# ---------------------------------------------------------------------------
# verify_installation — check that everything is correctly installed
# ---------------------------------------------------------------------------
verify_installation() {
    print_info "$MSG_VERIFY_TITLE"
    local ok=true

    # Check binary
    if check_rtk_installed; then
        print_success "$MSG_VERIFY_BINARY"
    else
        print_error "$MSG_VERIFY_BINARY"
        ok=false
    fi

    # Check hook script
    if [[ -f "$HOOK_SCRIPT" ]] && [[ -x "$HOOK_SCRIPT" ]]; then
        print_success "$MSG_VERIFY_HOOK"
    else
        print_error "$MSG_VERIFY_HOOK"
        ok=false
    fi

    # Check settings.json entry
    if [[ -f "$SETTINGS_FILE" ]] && jq -e '.hooks.PreToolUse[]? | select(.hooks[]?.command == "~/.claude/hooks/rtk-rewrite.sh")' "$SETTINGS_FILE" &>/dev/null; then
        print_success "$MSG_VERIFY_SETTINGS"
    else
        print_error "$MSG_VERIFY_SETTINGS"
        ok=false
    fi

    if [[ "$ok" == true ]]; then
        echo ""
        print_success "$MSG_VERIFY_OK"
    else
        echo ""
        print_error "$MSG_VERIFY_FAIL"
        exit 1
    fi
}

# ---------------------------------------------------------------------------
# uninstall_rtk — remove RTK hooks from settings.json
# ---------------------------------------------------------------------------
uninstall_rtk() {
    print_info "$MSG_UNINSTALL_TITLE"
    local changed=false

    # Remove hook from settings.json
    if [[ -f "$SETTINGS_FILE" ]] && jq -e '.hooks.PreToolUse[]? | select(.hooks[]?.command == "~/.claude/hooks/rtk-rewrite.sh")' "$SETTINGS_FILE" &>/dev/null; then
        local backup="${SETTINGS_FILE}.bak.$(date +%Y%m%d%H%M%S)"
        cp "$SETTINGS_FILE" "$backup"

        local tmp_file="${SETTINGS_FILE}.tmp"
        jq '
            .hooks.PreToolUse = [
                .hooks.PreToolUse[]? |
                select(.hooks[]?.command != "~/.claude/hooks/rtk-rewrite.sh")
            ]
        ' "$SETTINGS_FILE" > "$tmp_file" && mv "$tmp_file" "$SETTINGS_FILE"
        print_success "$MSG_UNINSTALL_HOOK_REMOVED"
        changed=true
    fi

    # Remove hook script
    if [[ -f "$HOOK_SCRIPT" ]]; then
        rm -f "$HOOK_SCRIPT"
        print_success "$MSG_UNINSTALL_SCRIPT_REMOVED"
        changed=true
    fi

    # Remove RTK.md
    if [[ -f "$RTK_MD" ]]; then
        rm -f "$RTK_MD"
        print_success "$MSG_UNINSTALL_MD_REMOVED"
        changed=true
    fi

    if [[ "$changed" == true ]]; then
        echo ""
        print_success "$MSG_UNINSTALL_DONE"
    else
        print_info "$MSG_UNINSTALL_NOTHING"
    fi
}

# ---------------------------------------------------------------------------
# check_status — show current RTK installation status
# ---------------------------------------------------------------------------
check_status() {
    print_info "$MSG_RTK_CHECK"
    echo ""

    # Binary
    if check_rtk_installed; then
        local version
        version=$(rtk --version 2>/dev/null || echo "unknown")
        print_success "$MSG_VERIFY_BINARY ($version)"
    else
        print_error "$MSG_VERIFY_BINARY"
    fi

    # Hook script
    if [[ -f "$HOOK_SCRIPT" ]] && [[ -x "$HOOK_SCRIPT" ]]; then
        print_success "$MSG_VERIFY_HOOK"
    else
        print_error "$MSG_VERIFY_HOOK"
    fi

    # Settings entry
    if [[ -f "$SETTINGS_FILE" ]] && jq -e '.hooks.PreToolUse[]? | select(.hooks[]?.command == "~/.claude/hooks/rtk-rewrite.sh")' "$SETTINGS_FILE" &>/dev/null; then
        print_success "$MSG_VERIFY_SETTINGS"
    else
        print_error "$MSG_VERIFY_SETTINGS"
    fi

    # Show savings if available
    echo ""
    if check_rtk_installed; then
        print_info "$MSG_GAIN_TITLE"
        rtk gain 2>/dev/null || print_info "$MSG_GAIN_NONE"
    fi
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║  $MSG_HEADER"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""

    case "$ACTION" in
        install)
            check_prerequisites
            echo ""
            install_rtk_binary
            echo ""
            configure_rtk_hooks
            echo ""
            merge_settings_json
            echo ""
            verify_installation
            echo ""
            print_success "$MSG_DONE"
            ;;
        uninstall)
            uninstall_rtk
            ;;
        check)
            check_status
            ;;
    esac
}

main
