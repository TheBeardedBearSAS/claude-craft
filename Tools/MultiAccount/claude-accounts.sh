#!/bin/bash
# =============================================================================
# Claude Code Multi-Account Manager
# Manage multiple Claude Code accounts easily
# =============================================================================

set -e

# Configuration
CLAUDE_PROFILES_DIR="$HOME/.claude-profiles"
SHELL_RC=""
CLAUDE_BIN="claude"

# i18n Configuration
VALID_LANGS=("en" "fr" "es" "de" "pt")
DEFAULT_LANG="en"
LANG_ARG=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# Colors
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BLUE='\033[0;34m'
C_MAGENTA='\033[0;35m'
C_CYAN='\033[0;36m'

# =============================================================================
# i18n - Load messages
# =============================================================================

load_messages() {
    local lang="${LANG_ARG:-$DEFAULT_LANG}"
    local msg_file="$I18N_DIR/accounts/${lang}.sh"

    if [[ -f "$msg_file" ]]; then
        # shellcheck source=/dev/null
        source "$msg_file"
    else
        # Fallback to English
        local fallback="$I18N_DIR/accounts/en.sh"
        if [[ -f "$fallback" ]]; then
            # shellcheck source=/dev/null
            source "$fallback"
        else
            # Minimal embedded defaults
            MSG_HEADER="Claude Code Multi-Account Manager"
            MSG_INVALID_CHOICE="Invalid choice"
            MSG_UNKNOWN_COMMAND="Unknown command:"
            MSG_GOODBYE="Goodbye!"
            MSG_INVALID_LANG="Invalid language:"
            MSG_VALID_LANGS="Valid languages:"
        fi
    fi
}

# Parse --lang early (before other args)
parse_lang() {
    for arg in "$@"; do
        case "$arg" in
            --lang=*)
                LANG_ARG="${arg#--lang=}"
                # Validate language
                local valid=false
                for l in "${VALID_LANGS[@]}"; do
                    [[ "$LANG_ARG" == "$l" ]] && valid=true
                done
                if ! $valid; then
                    echo -e "${C_RED}${MSG_INVALID_LANG:-Invalid language:}${C_RESET} $LANG_ARG"
                    echo "${MSG_VALID_LANGS:-Valid languages:} ${VALID_LANGS[*]}"
                    exit 1
                fi
                ;;
        esac
    done
}

# Parse language first
parse_lang "$@"
load_messages

# =============================================================================
# Utilities
# =============================================================================

print_header() {
    echo -e "\n${C_CYAN}╔════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${C_CYAN}║${C_RESET}     ${C_BOLD}🔐 ${MSG_HEADER}${C_RESET}                  ${C_CYAN}║${C_RESET}"
    echo -e "${C_CYAN}╚════════════════════════════════════════════════════════════╝${C_RESET}\n"
}

print_success() {
    echo -e "${C_GREEN}✓${C_RESET} $1"
}

print_error() {
    echo -e "${C_RED}✗${C_RESET} $1"
}

print_info() {
    echo -e "${C_BLUE}ℹ${C_RESET} $1"
}

print_warning() {
    echo -e "${C_YELLOW}⚠${C_RESET} $1"
}

detect_shell_rc() {
    if [[ -n "$ZSH_VERSION" ]] || [[ "$SHELL" == *"zsh"* ]]; then
        SHELL_RC="$HOME/.zshrc"
    elif [[ -n "$BASH_VERSION" ]] || [[ "$SHELL" == *"bash"* ]]; then
        SHELL_RC="$HOME/.bashrc"
    else
        SHELL_RC="$HOME/.profile"
    fi
}

ensure_profiles_dir() {
    if [[ ! -d "$CLAUDE_PROFILES_DIR" ]]; then
        mkdir -p "$CLAUDE_PROFILES_DIR"
        print_success "${MSG_PROFILES_DIR_CREATED} $CLAUDE_PROFILES_DIR"
    fi
}

# =============================================================================
# Mode management (shared/isolated)
# =============================================================================

# Read profile mode
get_profile_mode() {
    local profile_name="$1"
    local mode_file="$CLAUDE_PROFILES_DIR/$profile_name/.mode"
    cat "$mode_file" 2>/dev/null || echo "legacy"
}

# Get mode label for display
get_mode_label() {
    local mode="$1"
    case "$mode" in
        shared)   echo "${C_GREEN}${MSG_MODE_LABEL_SHARED}${C_RESET}" ;;
        isolated) echo "${C_MAGENTA}${MSG_MODE_LABEL_ISOLATED}${C_RESET}" ;;
        *)        echo "${C_YELLOW}${MSG_MODE_LABEL_LEGACY}${C_RESET}" ;;
    esac
}

# Configure profile in shared mode
setup_shared_profile() {
    local profile_path="$1"
    echo "shared" > "$profile_path/.mode"

    # Create symlink to ~/.claude for config
    if [[ -d "$HOME/.claude" ]]; then
        ln -sf "$HOME/.claude" "$profile_path/config"
        print_success "${MSG_SYMLINK_CREATED}"
    else
        print_warning "${MSG_CLAUDE_DIR_MISSING}"
    fi
}

# Configure profile in isolated mode
setup_isolated_profile() {
    local profile_path="$1"
    echo "isolated" > "$profile_path/.mode"

    # Copy ~/.claude if exists
    if [[ -d "$HOME/.claude" ]]; then
        # Copy everything except credentials
        for item in "$HOME/.claude"/*; do
            [[ -e "$item" ]] || continue
            local basename=$(basename "$item")
            # Don't copy credentials
            if [[ "$basename" != ".credentials.json" ]]; then
                cp -r "$item" "$profile_path/" 2>/dev/null || true
            fi
        done
        print_success "${MSG_CONFIG_COPIED}"
    else
        print_warning "${MSG_EMPTY_PROFILE}"
    fi
}

# Ask for mode during creation
ask_profile_mode() {
    echo ""
    print_info "${MSG_MODE_CHOOSE}"
    echo -e "  ${C_CYAN}1)${C_RESET} ${MSG_MODE_SHARED_DESC}"
    echo -e "  ${C_CYAN}2)${C_RESET} ${MSG_MODE_ISOLATED_DESC}"
    echo ""
    read -p "${MSG_MODE_PROMPT} " mode_choice
    mode_choice=${mode_choice:-1}

    case "$mode_choice" in
        2) echo "isolated" ;;
        *) echo "shared" ;;
    esac
}

# =============================================================================
# Profile management
# =============================================================================

list_profiles() {
    echo -e "\n${C_BOLD}📋 ${MSG_PROFILES_TITLE}${C_RESET}\n"

    if [[ ! -d "$CLAUDE_PROFILES_DIR" ]] || [[ -z "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
        print_warning "${MSG_NO_PROFILE}"
        echo -e "   ${MSG_USE_ADD}\n"
        return
    fi

    local index=1
    for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
        [[ ! -d "$profile_dir" ]] && continue

        local profile_name=$(basename "$profile_dir")
        local credentials_file="$profile_dir/.credentials.json"
        local settings_file="$profile_dir/settings.json"

        # Try to read email from credentials
        local email="(${MSG_STATUS_NOT_AUTH})"
        if [[ -f "$credentials_file" ]]; then
            local stored_email=$(jq -r '.email // empty' "$credentials_file" 2>/dev/null)
            [[ -n "$stored_email" ]] && email="$stored_email"
        fi

        # Status
        local status="${C_YELLOW}○${C_RESET}"
        if [[ -f "$credentials_file" ]]; then
            status="${C_GREEN}●${C_RESET}"
        fi

        # Profile mode
        local mode=$(get_profile_mode "$profile_name")
        local mode_label=$(get_mode_label "$mode")

        echo -e "   $status ${C_BOLD}$profile_name${C_RESET} $mode_label"
        echo -e "     └─ $email"
        echo -e "     └─ ${MSG_ALIAS_LABEL} ${C_CYAN}claude-$profile_name${C_RESET}"
        echo ""

        ((index++))
    done

    echo -e "   ${C_GREEN}●${C_RESET} ${MSG_STATUS_LEGEND_AUTH}   ${C_YELLOW}○${C_RESET} ${MSG_STATUS_LEGEND_NOT_AUTH}"
    echo -e "   ${C_GREEN}${MSG_MODE_LABEL_SHARED}${C_RESET} = ${MSG_MODE_LEGEND}   ${C_MAGENTA}${MSG_MODE_LABEL_ISOLATED}${C_RESET} = ${MSG_MODE_LEGEND_ISOLATED}   ${C_YELLOW}${MSG_MODE_LABEL_LEGACY}${C_RESET} = ${MSG_MODE_LEGEND_LEGACY}\n"
}

add_profile() {
    echo -e "\n${C_BOLD}➕ ${MSG_ADD_TITLE}${C_RESET}\n"

    # Ask for profile name
    echo -e "${MSG_ADD_NAME_PROMPT}"
    read -p "> " profile_name

    # Validate name
    if [[ -z "$profile_name" ]]; then
        print_error "${MSG_ADD_NAME_EMPTY}"
        return 1
    fi

    # Clean name (lowercase, replace spaces with dashes)
    profile_name=$(echo "$profile_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')

    local profile_path="$CLAUDE_PROFILES_DIR/$profile_name"

    if [[ -d "$profile_path" ]]; then
        print_error "${MSG_ADD_PROFILE_EXISTS}: '$profile_name'"
        return 1
    fi

    # Create profile directory
    mkdir -p "$profile_path"

    # Ask for mode
    local mode=$(ask_profile_mode)

    if [[ "$mode" == "isolated" ]]; then
        setup_isolated_profile "$profile_path"
    else
        setup_shared_profile "$profile_path"
    fi

    print_success "${MSG_ADD_PROFILE_CREATED} '$profile_name' ${MSG_MODE_IN} $mode"

    # Add alias to shell RC
    add_alias_to_shell "$profile_name"

    # Offer to authenticate now
    echo ""
    read -p "${MSG_ADD_AUTH_NOW} ${MSG_CONFIRM_YES_NO} " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[OoYySs]$ ]]; then
        authenticate_profile "$profile_name"
    else
        print_info "${MSG_ADD_AUTH_LATER} ${C_CYAN}claude-$profile_name${C_RESET}"
        print_info "${MSG_ADD_AUTH_OR}"
    fi
}

add_alias_to_shell() {
    local profile_name="$1"
    local alias_line="alias claude-${profile_name}=\"CLAUDE_CONFIG_DIR='$CLAUDE_PROFILES_DIR/$profile_name' $CLAUDE_BIN\""

    detect_shell_rc

    # Check if alias already exists
    if grep -q "alias claude-${profile_name}=" "$SHELL_RC" 2>/dev/null; then
        print_info "${MSG_ALIAS_EXISTS} $SHELL_RC"
        return
    fi

    # Add section marker if not present
    if ! grep -q "# Claude Code Profiles" "$SHELL_RC" 2>/dev/null; then
        echo "" >> "$SHELL_RC"
        echo "# Claude Code Profiles - Managed by claude-accounts" >> "$SHELL_RC"
    fi

    # Add alias
    echo "$alias_line" >> "$SHELL_RC"
    print_success "${MSG_ALIAS_ADDED} $SHELL_RC"
    print_warning "${MSG_SOURCE_OR_NEW}: ${C_CYAN}source $SHELL_RC${C_RESET}"
}

remove_profile() {
    echo -e "\n${C_BOLD}🗑️  ${MSG_REMOVE_TITLE}${C_RESET}\n"

    if [[ ! -d "$CLAUDE_PROFILES_DIR" ]] || [[ -z "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
        print_warning "${MSG_REMOVE_NO_PROFILE}"
        return
    fi

    # List available profiles
    echo "${MSG_PROFILES_AVAILABLE}"
    local profiles=()
    local index=1
    for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
        [[ ! -d "$profile_dir" ]] && continue
        local profile_name=$(basename "$profile_dir")
        profiles+=("$profile_name")
        echo -e "  ${C_CYAN}$index)${C_RESET} $profile_name"
        ((index++))
    done

    echo ""
    read -p "${MSG_REMOVE_NUMBER_PROMPT} " choice

    local profile_to_delete=""

    # If it's a number
    if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -le "${#profiles[@]}" ]]; then
        profile_to_delete="${profiles[$((choice-1))]}"
    else
        profile_to_delete="$choice"
    fi

    local profile_path="$CLAUDE_PROFILES_DIR/$profile_to_delete"

    if [[ ! -d "$profile_path" ]]; then
        print_error "${MSG_REMOVE_NOT_FOUND}: '$profile_to_delete'"
        return 1
    fi

    # Confirmation
    echo ""
    print_warning "${MSG_REMOVE_CONFIRM} '${C_BOLD}$profile_to_delete${C_RESET}'"
    read -p "${MSG_CONFIRM_YES_NO} " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[OoYySs]$ ]]; then
        print_info "${MSG_REMOVE_CANCELLED}"
        return
    fi

    # Delete directory
    rm -rf "$profile_path"
    print_success "${MSG_REMOVE_DONE}: '$profile_to_delete'"

    # Remove alias from shell RC
    detect_shell_rc
    if [[ -f "$SHELL_RC" ]]; then
        # Use sed to delete alias line
        sed -i.bak "/alias claude-${profile_to_delete}=/d" "$SHELL_RC"
        rm -f "${SHELL_RC}.bak"
        print_success "${MSG_ALIAS_REMOVED} $SHELL_RC"
    fi
}

migrate_profile() {
    echo -e "\n${C_BOLD}🔄 ${MSG_MIGRATE_TITLE}${C_RESET}\n"

    if [[ ! -d "$CLAUDE_PROFILES_DIR" ]] || [[ -z "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
        print_warning "${MSG_NO_PROFILE}"
        return
    fi

    # List legacy profiles (without .mode file)
    local legacy_profiles=()
    for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
        [[ -d "$profile_dir" ]] || continue
        local pname=$(basename "$profile_dir")
        local mode=$(get_profile_mode "$pname")
        if [[ "$mode" == "legacy" ]]; then
            legacy_profiles+=("$pname")
        fi
    done

    if [[ ${#legacy_profiles[@]} -eq 0 ]]; then
        print_success "${MSG_MIGRATE_NO_LEGACY}"
        return
    fi

    echo "${MSG_MIGRATE_LEGACY_LIST}"
    local i=1
    for pname in "${legacy_profiles[@]}"; do
        echo -e "  ${C_CYAN}$i)${C_RESET} $pname"
        ((i++))
    done
    echo ""
    read -p "${MSG_MIGRATE_NUMBER_PROMPT} " choice

    if [[ -z "$choice" ]] || ! [[ "$choice" =~ ^[0-9]+$ ]] || [[ "$choice" -lt 1 ]] || [[ "$choice" -gt ${#legacy_profiles[@]} ]]; then
        print_error "${MSG_INVALID_CHOICE}"
        return 1
    fi

    local selected="${legacy_profiles[$((choice-1))]}"
    local profile_path="$CLAUDE_PROFILES_DIR/$selected"

    echo ""
    print_info "${MSG_MIGRATE_TO_MODE} '$selected'"
    echo -e "  ${C_CYAN}1)${C_RESET} ${MSG_MIGRATE_SHARED_DESC}"
    echo -e "  ${C_CYAN}2)${C_RESET} ${MSG_MIGRATE_ISOLATED_DESC}"
    echo ""
    read -p "${MSG_MODE_PROMPT} " mode_choice
    mode_choice=${mode_choice:-1}

    case "$mode_choice" in
        2)
            echo "isolated" > "$profile_path/.mode"
            print_success "${MSG_MIGRATE_DONE_ISOLATED}: '$selected'"
            print_info "${MSG_MIGRATE_CONFIG_KEPT}"
            ;;
        *)
            echo "shared" > "$profile_path/.mode"
            # Create symlink config if not already present
            if [[ ! -L "$profile_path/config" ]] && [[ -d "$HOME/.claude" ]]; then
                ln -sf "$HOME/.claude" "$profile_path/config"
                print_success "${MSG_SYMLINK_CREATED}"
            fi
            print_success "${MSG_MIGRATE_DONE_SHARED}: '$selected'"
            ;;
    esac
}

authenticate_profile() {
    local profile_name="$1"

    if [[ -z "$profile_name" ]]; then
        echo -e "\n${C_BOLD}🔐 ${MSG_AUTH_TITLE}${C_RESET}\n"

        if [[ ! -d "$CLAUDE_PROFILES_DIR" ]] || [[ -z "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
            print_warning "${MSG_AUTH_CREATE_FIRST}"
            return
        fi

        # List profiles
        echo "${MSG_PROFILES_AVAILABLE}"
        local profiles=()
        local index=1
        for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
            [[ ! -d "$profile_dir" ]] && continue
            local pname=$(basename "$profile_dir")
            profiles+=("$pname")
            echo -e "  ${C_CYAN}$index)${C_RESET} $pname"
            ((index++))
        done

        echo ""
        read -p "${MSG_AUTH_NUMBER_PROMPT} " choice

        if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -le "${#profiles[@]}" ]]; then
            profile_name="${profiles[$((choice-1))]}"
        else
            print_error "${MSG_INVALID_CHOICE}"
            return 1
        fi
    fi

    local profile_path="$CLAUDE_PROFILES_DIR/$profile_name"

    if [[ ! -d "$profile_path" ]]; then
        print_error "${MSG_REMOVE_NOT_FOUND}: '$profile_name'"
        return 1
    fi

    echo ""
    print_info "${MSG_AUTH_LAUNCHING} '${C_BOLD}$profile_name${C_RESET}'..."
    print_info "${MSG_AUTH_CONNECT}"
    echo ""

    # Launch Claude Code with profile config dir
    CLAUDE_CONFIG_DIR="$profile_path" $CLAUDE_BIN
}

launch_profile() {
    echo -e "\n${C_BOLD}🚀 ${MSG_LAUNCH_TITLE}${C_RESET}\n"

    # Option for default profile
    echo -e "  ${C_CYAN}0)${C_RESET} ${MSG_LAUNCH_DEFAULT}"

    if [[ -d "$CLAUDE_PROFILES_DIR" ]] && [[ -n "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
        local profiles=("default")
        local index=1
        for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
            [[ ! -d "$profile_dir" ]] && continue
            local profile_name=$(basename "$profile_dir")
            profiles+=("$profile_name")
            echo -e "  ${C_CYAN}$index)${C_RESET} $profile_name"
            ((index++))
        done

        echo ""
        read -p "${MSG_LAUNCH_PROMPT} " choice

        if [[ "$choice" == "0" ]]; then
            print_info "${MSG_LAUNCH_WITH_DEFAULT}"
            $CLAUDE_BIN
        elif [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -le "$((${#profiles[@]}-1))" ]]; then
            local selected="${profiles[$choice]}"
            print_info "${MSG_LAUNCH_WITH_PROFILE} '$selected'..."
            CLAUDE_CONFIG_DIR="$CLAUDE_PROFILES_DIR/$selected" $CLAUDE_BIN
        else
            print_error "${MSG_INVALID_CHOICE}"
        fi
    else
        print_warning "${MSG_LAUNCH_NO_PROFILE}"
        $CLAUDE_BIN
    fi
}

show_usage() {
    echo -e "\n${C_BOLD}📖 ${MSG_USAGE_TITLE}${C_RESET}\n"

    echo -e "${C_CYAN}${MSG_USAGE_QUICK}${C_RESET}"
    echo -e "  ${C_BOLD}claude-accounts add <name>${C_RESET}     ${MSG_USAGE_ADD_DESC}"
    echo -e "  ${C_BOLD}claude-accounts rm <name>${C_RESET}      ${MSG_USAGE_RM_DESC}"
    echo -e "  ${C_BOLD}claude-accounts list${C_RESET}          ${MSG_USAGE_LIST_DESC}"
    echo -e "  ${C_BOLD}claude-accounts auth <name>${C_RESET}    ${MSG_USAGE_AUTH_DESC}"
    echo -e "  ${C_BOLD}claude-accounts run <name>${C_RESET}     ${MSG_USAGE_RUN_DESC}"
    echo -e "  ${C_BOLD}claude-accounts migrate${C_RESET}       ${MSG_USAGE_MIGRATE_DESC}"
    echo -e "  ${C_BOLD}claude-accounts --lang=XX${C_RESET}     ${MSG_USAGE_LANG_DESC}"
    echo ""

    echo -e "${C_CYAN}${MSG_USAGE_MODES}${C_RESET}"
    echo -e "  ${C_GREEN}${MSG_MODE_LABEL_SHARED}${C_RESET}   ${MSG_USAGE_MODE_SHARED_DESC}"
    echo -e "  ${C_MAGENTA}${MSG_MODE_LABEL_ISOLATED}${C_RESET}     ${MSG_USAGE_MODE_ISOLATED_DESC}"
    echo -e "  ${C_YELLOW}${MSG_MODE_LABEL_LEGACY}${C_RESET}    ${MSG_USAGE_MODE_LEGACY_DESC}"
    echo ""

    echo -e "${C_CYAN}${MSG_USAGE_ALIAS}${C_RESET}"
    echo -e "  ${C_BOLD}claude-perso${C_RESET}      ${MSG_CC_PROFILE} 'perso'"
    echo -e "  ${C_BOLD}claude-pro${C_RESET}        ${MSG_CC_PROFILE} 'pro'"
    echo ""

    echo -e "${C_CYAN}${MSG_USAGE_OR_CC}${C_RESET}"
    echo -e "  ${C_BOLD}ccsp perso${C_RESET}        ${MSG_CC_PROFILE} 'perso'"
    echo -e "  ${C_BOLD}ccsp pro${C_RESET}          ${MSG_CC_PROFILE} 'pro'"
    echo ""
}

install_ccsp_function() {
    echo -e "\n${C_BOLD}⚡ ${MSG_CC_TITLE}${C_RESET}\n"

    detect_shell_rc

    local ccsp_function="
# ccsp() function to launch Claude Code with a profile (Claude Code Switch Profile)
ccsp() {
    local profile=\"\${1:-}\"
    local profiles_dir=\"\$HOME/.claude-profiles\"

    if [[ -z \"\$profile\" ]]; then
        # Without argument, launch interactive selector
        claude-accounts run
    elif [[ -d \"\$profiles_dir/\$profile\" ]]; then
        CLAUDE_CONFIG_DIR=\"\$profiles_dir/\$profile\" claude \"\${@:2}\"
    else
        echo \"${MSG_CC_PROFILE} '\$profile' ${MSG_CC_NOT_FOUND}\"
        ls -1 \"\$profiles_dir\" 2>/dev/null || echo \"  ${MSG_CC_NONE}\"
    fi
}"

    if grep -q "^ccsp()" "$SHELL_RC" 2>/dev/null; then
        print_info "${MSG_CC_ALREADY}"
        return
    fi

    echo "$ccsp_function" >> "$SHELL_RC"
    print_success "${MSG_CC_ADDED} $SHELL_RC"
    print_warning "${MSG_SOURCE_OR_NEW}: ${C_CYAN}source $SHELL_RC${C_RESET}"

    echo ""
    echo -e "${C_CYAN}${MSG_CC_USAGE}${C_RESET}"
    echo -e "  ${C_BOLD}ccsp${C_RESET}          ${MSG_CC_MENU}"
    echo -e "  ${C_BOLD}ccsp perso${C_RESET}    ${MSG_CC_PROFILE} 'perso'"
    echo -e "  ${C_BOLD}ccsp pro${C_RESET}      ${MSG_CC_PROFILE} 'pro'"
}

# =============================================================================
# Main menu
# =============================================================================

show_menu() {
    echo -e "${C_BOLD}${MSG_MENU_TITLE}${C_RESET}\n"
    echo -e "  ${C_CYAN}1)${C_RESET} 📋 ${MSG_MENU_LIST}"
    echo -e "  ${C_CYAN}2)${C_RESET} ➕ ${MSG_MENU_ADD}"
    echo -e "  ${C_CYAN}3)${C_RESET} 🗑️  ${MSG_MENU_REMOVE}"
    echo -e "  ${C_CYAN}4)${C_RESET} 🔐 ${MSG_MENU_AUTH}"
    echo -e "  ${C_CYAN}5)${C_RESET} 🚀 ${MSG_MENU_LAUNCH}"
    echo -e "  ${C_CYAN}6)${C_RESET} ⚡ ${MSG_MENU_CCSP_FUNC}"
    echo -e "  ${C_CYAN}7)${C_RESET} 🔄 ${MSG_MENU_MIGRATE}"
    echo -e "  ${C_CYAN}8)${C_RESET} 📖 ${MSG_MENU_HELP}"
    echo -e "  ${C_CYAN}q)${C_RESET} ${MSG_MENU_QUIT}"
    echo ""
}

main_menu() {
    while true; do
        print_header
        show_menu

        read -p "${MSG_LAUNCH_PROMPT} " -n 1 -r choice
        echo ""

        case $choice in
            1) list_profiles ;;
            2) add_profile ;;
            3) remove_profile ;;
            4) authenticate_profile ;;
            5) launch_profile ;;
            6) install_ccsp_function ;;
            7) migrate_profile ;;
            8) show_usage ;;
            q|Q) echo -e "\n${C_GREEN}${MSG_GOODBYE}${C_RESET}\n"; exit 0 ;;
            *) print_error "${MSG_INVALID_CHOICE}" ;;
        esac

        echo ""
        read -p "${MSG_PRESS_ENTER}" -r
    done
}

# =============================================================================
# CLI mode
# =============================================================================

cli_mode() {
    local command="$1"
    shift

    # Remove --lang from remaining args
    local args=()
    for arg in "$@"; do
        [[ "$arg" != --lang=* ]] && args+=("$arg")
    done

    ensure_profiles_dir

    case "$command" in
        add|a)
            if [[ -n "${args[0]}" ]]; then
                profile_name="${args[0]}"
                profile_name=$(echo "$profile_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
                local profile_path="$CLAUDE_PROFILES_DIR/$profile_name"

                if [[ -d "$profile_path" ]]; then
                    print_error "${MSG_ADD_PROFILE_EXISTS}: '$profile_name'"
                    exit 1
                fi

                mkdir -p "$profile_path"
                print_success "${MSG_ADD_PROFILE_CREATED}: '$profile_name'"
                add_alias_to_shell "$profile_name"
            else
                add_profile
            fi
            ;;
        rm|remove|delete)
            if [[ -n "${args[0]}" ]]; then
                local profile_path="$CLAUDE_PROFILES_DIR/${args[0]}"
                if [[ -d "$profile_path" ]]; then
                    rm -rf "$profile_path"
                    print_success "${MSG_REMOVE_DONE}: '${args[0]}'"

                    detect_shell_rc
                    sed -i.bak "/alias claude-${args[0]}=/d" "$SHELL_RC" 2>/dev/null
                    rm -f "${SHELL_RC}.bak"
                else
                    print_error "${MSG_REMOVE_NOT_FOUND}: '${args[0]}'"
                    exit 1
                fi
            else
                remove_profile
            fi
            ;;
        list|ls|l)
            list_profiles
            ;;
        auth|login)
            authenticate_profile "${args[0]}"
            ;;
        run|start|r)
            if [[ -n "${args[0]}" ]]; then
                local profile_path="$CLAUDE_PROFILES_DIR/${args[0]}"
                if [[ -d "$profile_path" ]]; then
                    CLAUDE_CONFIG_DIR="$profile_path" $CLAUDE_BIN "${args[@]:1}"
                else
                    print_error "${MSG_REMOVE_NOT_FOUND}: '${args[0]}'"
                    exit 1
                fi
            else
                launch_profile
            fi
            ;;
        migrate|m)
            migrate_profile
            ;;
        help|h|--help|-h)
            show_usage
            ;;
        *)
            print_error "${MSG_UNKNOWN_COMMAND} $command"
            show_usage
            exit 1
            ;;
    esac
}

# =============================================================================
# Entry point
# =============================================================================

ensure_profiles_dir
detect_shell_rc

# Filter out --lang from args for CLI mode check
cli_args=()
for arg in "$@"; do
    [[ "$arg" != --lang=* ]] && cli_args+=("$arg")
done

if [[ ${#cli_args[@]} -gt 0 ]]; then
    cli_mode "${cli_args[@]}"
else
    main_menu
fi
