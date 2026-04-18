#!/bin/bash
# shellcheck disable=SC2310
IFS=$'\n\t'
# =============================================================================
# Claude Code Multi-Account Manager
# Manage multiple Claude Code accounts easily
# =============================================================================

# Note: set -e intentionally not used — the script handles errors explicitly
# with return codes and print_error, and set -e causes issues with ((var++)).

# Configuration
CLAUDE_PROFILES_DIR="$HOME/.claude-profiles"
SHELL_RC=""
CLAUDE_BIN="claude"
VERSION="1.1.0"

# Exit codes
EXIT_OK=0
EXIT_ERROR=1
EXIT_USAGE=2
EXIT_NOT_FOUND=3
EXIT_MISSING_DEP=4

# JSON output mode
JSON_OUTPUT=false

# Temp files tracking for signal cleanup
_TMP_FILES=()
_cleanup() { rm -f "${_TMP_FILES[@]}" 2>/dev/null; }
trap _cleanup EXIT

# i18n Configuration
VALID_LANGS=("en" "fr" "es" "de" "pt")
DEFAULT_LANG="en"
LANG_ARG=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# Shared UI library (colors + print helpers)
TOOLS_LIB_DIR="$(dirname "$SCRIPT_DIR")/lib"
if [[ -f "$TOOLS_LIB_DIR/tools-ui.sh" ]]; then
    # shellcheck source=../lib/tools-ui.sh
    source "$TOOLS_LIB_DIR/tools-ui.sh"
else
    # Inline fallback when lib is missing
    C_RESET='\033[0m' C_BOLD='\033[1m' C_DIM='\033[2m'
    C_RED='\033[0;31m' C_GREEN='\033[0;32m' C_YELLOW='\033[0;33m'
    C_BLUE='\033[0;34m' C_MAGENTA='\033[0;35m' C_CYAN='\033[0;36m'
    print_success() { echo -e "${C_GREEN}✓${C_RESET} $1"; }
    print_error()   { echo -e "${C_RED}✗${C_RESET} $1"; }
    print_info()    { echo -e "${C_BLUE}ℹ${C_RESET} $1"; }
    print_warning() { echo -e "${C_YELLOW}⚠${C_RESET} $1"; }
fi

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
                    exit $EXIT_USAGE
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
        chmod 0700 "$CLAUDE_PROFILES_DIR"
        print_success "${MSG_PROFILES_DIR_CREATED} $CLAUDE_PROFILES_DIR"
    fi
}

# Validate that a profile directory exists
validate_profile() {
    local profile_name="$1"
    local profile_path="$CLAUDE_PROFILES_DIR/$profile_name"
    if [[ ! -d "$profile_path" ]]; then
        print_error "${MSG_REMOVE_NOT_FOUND}: '$profile_name'"
        return 1
    fi
    return 0
}

sanitize_name() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-'
}

check_jq() {
    if ! command -v jq &>/dev/null; then
        print_error "jq is required but not installed"
        echo ""
        echo "Installation:"
        echo "  Ubuntu/Debian: sudo apt install jq"
        echo "  macOS:         brew install jq"
        exit $EXIT_MISSING_DEP
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
    if [[ "$JSON_OUTPUT" == true ]]; then
        list_profiles_json
        return
    fi

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

        # Warn if permissions are too open
        local perms
        perms=$(stat -c '%a' "$profile_dir" 2>/dev/null || stat -f '%Lp' "$profile_dir" 2>/dev/null)
        if [[ -n "$perms" && "$perms" != "700" ]]; then
            print_warning "${MSG_WARN_PERMISSIONS:-Permissions too open ($perms)}: chmod 0700 $profile_dir"
        fi

        echo ""

        index=$((index + 1))
    done

    echo -e "   ${C_GREEN}●${C_RESET} ${MSG_STATUS_LEGEND_AUTH}   ${C_YELLOW}○${C_RESET} ${MSG_STATUS_LEGEND_NOT_AUTH}"
    echo -e "   ${C_GREEN}${MSG_MODE_LABEL_SHARED}${C_RESET} = ${MSG_MODE_LEGEND}   ${C_MAGENTA}${MSG_MODE_LABEL_ISOLATED}${C_RESET} = ${MSG_MODE_LEGEND_ISOLATED}   ${C_YELLOW}${MSG_MODE_LABEL_LEGACY}${C_RESET} = ${MSG_MODE_LEGEND_LEGACY}\n"
}

list_profiles_json() {
    local json_profiles="[]"

    if [[ -d "$CLAUDE_PROFILES_DIR" ]] && [[ -n "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
        for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
            [[ ! -d "$profile_dir" ]] && continue

            local pname=$(basename "$profile_dir")
            local cred_file="$profile_dir/.credentials.json"
            local authenticated=false
            local email=""
            local mode=$(get_profile_mode "$pname")
            local perms
            perms=$(stat -c '%a' "$profile_dir" 2>/dev/null || stat -f '%Lp' "$profile_dir" 2>/dev/null)

            if [[ -f "$cred_file" ]]; then
                authenticated=true
                email=$(jq -r '.email // ""' "$cred_file" 2>/dev/null)
            fi

            json_profiles=$(echo "$json_profiles" | jq \
                --arg name "$pname" \
                --arg mode "$mode" \
                --argjson auth "$authenticated" \
                --arg email "$email" \
                --arg perms "${perms:-unknown}" \
                '. + [{"name":$name,"mode":$mode,"authenticated":$auth,"email":$email,"permissions":$perms}]')
        done
    fi

    jq -n --argjson profiles "$json_profiles" '{"profiles":$profiles}'
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
    profile_name=$(sanitize_name "$profile_name")

    local profile_path="$CLAUDE_PROFILES_DIR/$profile_name"

    if [[ -d "$profile_path" ]]; then
        print_error "${MSG_ADD_PROFILE_EXISTS}: '$profile_name'"
        return 1
    fi

    # Create profile directory with restricted permissions
    mkdir -p "$profile_path"
    chmod 0700 "$profile_path"

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
        index=$((index + 1))
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
        grep -vF "alias claude-${profile_to_delete}=" "$SHELL_RC" > "${SHELL_RC}.tmp" && mv "${SHELL_RC}.tmp" "$SHELL_RC"
        print_success "${MSG_ALIAS_REMOVED} $SHELL_RC"
    fi
}

migrate_profile() {
    echo -e "\n${C_BOLD}🔄 ${MSG_MIGRATE_TITLE}${C_RESET}\n"

    if [[ ! -d "$CLAUDE_PROFILES_DIR" ]] || [[ -z "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
        print_warning "${MSG_NO_PROFILE}"
        return 0
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
        i=$((i + 1))
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
            chmod 0700 "$profile_path"
            print_success "${MSG_MIGRATE_DONE_ISOLATED}: '$selected'"
            print_info "${MSG_MIGRATE_CONFIG_KEPT}"
            ;;
        *)
            echo "shared" > "$profile_path/.mode"
            chmod 0700 "$profile_path"
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
            index=$((index + 1))
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
            index=$((index + 1))
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
    echo -e "  ${C_BOLD}claude-accounts sync${C_RESET}          ${MSG_USAGE_SYNC_DESC:-Sync isolated profiles with ~/.claude}"
    echo -e "  ${C_BOLD}claude-accounts migrate${C_RESET}       ${MSG_USAGE_MIGRATE_DESC}"
    echo -e "  ${C_BOLD}claude-accounts doctor${C_RESET}        ${MSG_USAGE_DOCTOR_DESC:-Check profile health}"
    echo -e "  ${C_BOLD}claude-accounts --json list${C_RESET}   ${MSG_USAGE_JSON_DESC:-JSON output for scripting}"
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

    # Auto-detect from .claude-profile if no argument
    if [[ -z \"\$profile\" && -f .claude-profile ]]; then
        profile=\$(cat .claude-profile | tr -d '[:space:]')
    fi

    if [[ -z \"\$profile\" ]]; then
        # Without argument, launch interactive selector
        claude-accounts run
    elif [[ -d \"\$profiles_dir/\$profile\" ]]; then
        export CLAUDE_PROFILE_NAME=\"\$profile\"
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
# Sync - Synchronize isolated profiles with ~/.claude
# =============================================================================

cmd_sync() {
    echo -e "\n${C_BOLD}${MSG_SYNC_TITLE:-Sync isolated profiles with ~/.claude}${C_RESET}\n"

    if [[ ! -d "$CLAUDE_PROFILES_DIR" ]] || [[ -z "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
        print_warning "${MSG_NO_PROFILE}"
        return 0
    fi

    local synced=0
    local skipped=0

    for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
        [[ ! -d "$profile_dir" ]] && continue
        local profile_name
        profile_name=$(basename "$profile_dir")
        local mode
        mode=$(get_profile_mode "$profile_name")

        if [[ "$mode" == "shared" ]]; then
            print_info "$profile_name: ${MSG_SYNC_SHARED_SKIP:-shared mode, already synced via symlink}"
            skipped=$((skipped + 1))
            continue
        fi

        if [[ "$mode" == "isolated" ]]; then
            print_info "${MSG_SYNC_SYNCING:-Syncing} $profile_name..."

            # Sync hooks directory
            if [[ -d "$HOME/.claude/hooks" ]]; then
                mkdir -p "$profile_dir/hooks"
                for hook_file in "$HOME/.claude/hooks"/*; do
                    [[ -e "$hook_file" ]] || continue
                    local hook_name
                    hook_name=$(basename "$hook_file")
                    cp "$hook_file" "$profile_dir/hooks/$hook_name"
                done
                print_success "  hooks/ -> $profile_name/hooks/"
            fi

            # Sync settings.json (merge env block, preserve profile-specific settings)
            if [[ -f "$HOME/.claude/settings.json" && -f "$profile_dir/settings.json" ]]; then
                # Merge: take env and hooks from source, preserve profile permissions
                if command -v jq &>/dev/null; then
                    local merged
                    merged=$(jq -s '.[0] * .[1] | .env = (.[0].env // {} ) * (.[1].env // {})' \
                        "$profile_dir/settings.json" "$HOME/.claude/settings.json" 2>/dev/null) || true
                    if [[ -n "$merged" ]]; then
                        echo "$merged" > "$profile_dir/settings.json"
                        print_success "  settings.json merged"
                    fi
                else
                    cp "$HOME/.claude/settings.json" "$profile_dir/settings.json"
                    print_success "  settings.json copied"
                fi
            elif [[ -f "$HOME/.claude/settings.json" ]]; then
                cp "$HOME/.claude/settings.json" "$profile_dir/settings.json"
                print_success "  settings.json copied"
            fi

            # Sync RTK.md
            if [[ -f "$HOME/.claude/RTK.md" ]]; then
                cp "$HOME/.claude/RTK.md" "$profile_dir/RTK.md"
            fi

            synced=$((synced + 1))
        fi
    done

    echo ""
    print_success "${MSG_SYNC_DONE:-Sync complete}: $synced ${MSG_SYNC_SYNCED:-synced}, $skipped ${MSG_SYNC_SKIPPED:-skipped (shared)}"
}

# =============================================================================
# Doctor - Profile health check
# =============================================================================

cmd_doctor() {
    echo -e "\n${C_BOLD}🩺 ${MSG_DOCTOR_TITLE:-Profile Health Check}${C_RESET}\n"

    local issues=0
    local checked=0

    if [[ ! -d "$CLAUDE_PROFILES_DIR" ]] || [[ -z "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
        print_warning "${MSG_NO_PROFILE}"
        return 0
    fi

    # Check shell RC for orphan aliases
    detect_shell_rc
    local aliases_in_rc=()
    if [[ -f "$SHELL_RC" ]]; then
        while IFS= read -r line; do
            local alias_name
            alias_name=$(echo "$line" | grep -oP 'alias claude-\K[^=]+' 2>/dev/null || true)
            [[ -n "$alias_name" ]] && aliases_in_rc+=("$alias_name")
        done < <(grep "^alias claude-" "$SHELL_RC" 2>/dev/null || true)
    fi

    for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
        [[ ! -d "$profile_dir" ]] && continue
        checked=$((checked + 1))

        local pname=$(basename "$profile_dir")
        echo -e "${C_BOLD}  $pname${C_RESET}"

        # 1. Check permissions
        local perms
        perms=$(stat -c '%a' "$profile_dir" 2>/dev/null || stat -f '%Lp' "$profile_dir" 2>/dev/null)
        if [[ "$perms" == "700" ]]; then
            echo -e "    ${C_GREEN}✓${C_RESET} ${MSG_DOCTOR_PERMS_OK:-Permissions 0700}"
        else
            echo -e "    ${C_RED}✗${C_RESET} ${MSG_DOCTOR_PERMS_BAD:-Permissions $perms (expected 0700)}"
            issues=$((issues + 1))
        fi

        # 2. Check mode file
        local pmode
        pmode=$(get_profile_mode "$pname")
        if [[ -f "$profile_dir/.mode" ]]; then
            echo -e "    ${C_GREEN}✓${C_RESET} ${MSG_DOCTOR_MODE_OK:-Mode}: $pmode"
        else
            echo -e "    ${C_YELLOW}⚠${C_RESET} ${MSG_DOCTOR_MODE_MISSING:-No .mode file (legacy profile)}"
            issues=$((issues + 1))
        fi

        # 3. Check symlinks (shared mode)
        if [[ "$pmode" == "shared" && -L "$profile_dir/config" ]]; then
            if [[ -d "$profile_dir/config" ]]; then
                echo -e "    ${C_GREEN}✓${C_RESET} ${MSG_DOCTOR_SYMLINK_OK:-Symlink valid}"
            else
                echo -e "    ${C_RED}✗${C_RESET} ${MSG_DOCTOR_SYMLINK_BROKEN:-Broken symlink: config}"
                issues=$((issues + 1))
            fi
        fi

        # 4. Check credentials parseable
        local cred_file="$profile_dir/.credentials.json"
        if [[ -f "$cred_file" ]]; then
            if jq empty "$cred_file" 2>/dev/null; then
                echo -e "    ${C_GREEN}✓${C_RESET} ${MSG_DOCTOR_CREDS_OK:-Credentials valid JSON}"
            else
                echo -e "    ${C_RED}✗${C_RESET} ${MSG_DOCTOR_CREDS_BAD:-Credentials file corrupt}"
                issues=$((issues + 1))
            fi
        else
            echo -e "    ${C_YELLOW}⚠${C_RESET} ${MSG_DOCTOR_CREDS_MISSING:-Not authenticated}"
        fi

        # 5. Check alias exists in shell RC
        local has_alias=false
        for a in "${aliases_in_rc[@]}"; do
            [[ "$a" == "$pname" ]] && has_alias=true
        done
        if $has_alias; then
            echo -e "    ${C_GREEN}✓${C_RESET} ${MSG_DOCTOR_ALIAS_OK:-Alias in $SHELL_RC}"
        else
            echo -e "    ${C_YELLOW}⚠${C_RESET} ${MSG_DOCTOR_ALIAS_MISSING:-No alias in $SHELL_RC}"
            issues=$((issues + 1))
        fi

        echo ""
    done

    # Check for orphan aliases (alias exists but profile dir doesn't)
    for alias_name in "${aliases_in_rc[@]}"; do
        if [[ ! -d "$CLAUDE_PROFILES_DIR/$alias_name" ]]; then
            echo -e "  ${C_RED}✗${C_RESET} ${MSG_DOCTOR_ORPHAN_ALIAS:-Orphan alias}: claude-$alias_name"
            issues=$((issues + 1))
        fi
    done

    echo ""
    if [[ $issues -eq 0 ]]; then
        print_success "${MSG_DOCTOR_ALL_OK:-All $checked profiles healthy}"
    else
        print_warning "${MSG_DOCTOR_ISSUES:-$issues issue(s) found across $checked profile(s)}"
    fi
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
    echo -e "  ${C_CYAN}7)${C_RESET} 🔁 ${MSG_MENU_SYNC:-Sync isolated profiles}"
    echo -e "  ${C_CYAN}8)${C_RESET} 🔄 ${MSG_MENU_MIGRATE}"
    echo -e "  ${C_CYAN}9)${C_RESET} 🩺 ${MSG_MENU_DOCTOR:-Profile health check}"
    echo -e "  ${C_CYAN}0)${C_RESET} 📖 ${MSG_MENU_HELP}"
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
            7) cmd_sync ;;
            8) migrate_profile ;;
            9) cmd_doctor ;;
            0) show_usage ;;
            q|Q) echo -e "\n${C_GREEN}${MSG_GOODBYE}${C_RESET}\n"; exit $EXIT_OK ;;
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

    # Remove --lang and --json from remaining args
    local args=()
    for arg in "$@"; do
        [[ "$arg" == --lang=* || "$arg" == "--json" ]] && continue
        args+=("$arg")
    done

    ensure_profiles_dir

    case "$command" in
        add|a)
            if [[ -n "${args[0]}" ]]; then
                profile_name=$(sanitize_name "${args[0]}")
                local profile_path="$CLAUDE_PROFILES_DIR/$profile_name"

                if [[ -d "$profile_path" ]]; then
                    print_error "${MSG_ADD_PROFILE_EXISTS}: '$profile_name'"
                    exit $EXIT_ERROR
                fi

                mkdir -p "$profile_path"
                chmod 0700 "$profile_path"
                print_success "${MSG_ADD_PROFILE_CREATED}: '$profile_name'"
                add_alias_to_shell "$profile_name"
            else
                add_profile
            fi
            ;;
        rm|remove|delete)
            if [[ -n "${args[0]}" ]]; then
                local name
                name=$(sanitize_name "${args[0]}")
                local profile_path="$CLAUDE_PROFILES_DIR/$name"
                if [[ -d "$profile_path" ]]; then
                    # Check for --force flag
                    local force=false
                    for a in "${args[@]:1}"; do
                        [[ "$a" == "--force" ]] && force=true
                    done

                    # Create backup before deletion (kept permanently)
                    local backup_file="$CLAUDE_PROFILES_DIR/${name}.backup.tar.gz"
                    tar czf "$backup_file" -C "$CLAUDE_PROFILES_DIR" "$name" 2>/dev/null
                    print_info "${MSG_BACKUP_CREATED:-Backup created}: $backup_file"

                    if [[ "$force" != true ]]; then
                        read -p "${MSG_CONFIRM_DELETE:-Delete profile} '$name'? ${MSG_CONFIRM_YES_NO} " -n 1 -r
                        echo ""
                        if [[ ! $REPLY =~ ^[OoYySs]$ ]]; then
                            print_info "${MSG_REMOVE_CANCELLED}"
                            return 0
                        fi
                    fi

                    rm -rf "$profile_path"
                    print_success "${MSG_REMOVE_DONE}: '$name'"

                    detect_shell_rc
                    if [[ -f "$SHELL_RC" ]]; then
                        grep -vF "alias claude-${name}=" "$SHELL_RC" > "${SHELL_RC}.tmp" && mv "${SHELL_RC}.tmp" "$SHELL_RC"
                    fi
                else
                    print_error "${MSG_REMOVE_NOT_FOUND}: '$name'"
                    exit $EXIT_NOT_FOUND
                fi
            else
                remove_profile
            fi
            ;;
        list|ls|l)
            list_profiles
            ;;
        auth|login)
            if [[ -n "${args[0]:-}" ]]; then
                validate_profile "${args[0]}" || exit $EXIT_NOT_FOUND
            fi
            authenticate_profile "${args[0]:-}"
            ;;
        run|start|r)
            if [[ -n "${args[0]:-}" ]]; then
                validate_profile "${args[0]}" || exit $EXIT_NOT_FOUND
                local profile_path="$CLAUDE_PROFILES_DIR/${args[0]}"
                CLAUDE_CONFIG_DIR="$profile_path" $CLAUDE_BIN "${args[@]:1}"
            else
                launch_profile
            fi
            ;;
        sync|s)
            cmd_sync
            ;;
        migrate|m)
            migrate_profile
            ;;
        doctor|doc)
            cmd_doctor
            ;;
        help|h|--help|-h)
            show_usage
            ;;
        *)
            print_error "${MSG_UNKNOWN_COMMAND} $command"
            show_usage
            exit $EXIT_USAGE
            ;;
    esac
}

# =============================================================================
# Entry point
# =============================================================================

ensure_profiles_dir
detect_shell_rc
check_jq

# Filter out --lang and --json from args for CLI mode check
cli_args=()
for arg in "$@"; do
    case "$arg" in
        --lang=*) ;;
        --json) JSON_OUTPUT=true ;;
        *) cli_args+=("$arg") ;;
    esac
done

# Handle --version / -V
for arg in "${cli_args[@]}"; do
    if [[ "$arg" == "--version" || "$arg" == "-V" ]]; then
        if [[ "$JSON_OUTPUT" == true ]]; then
            echo "{\"version\":\"$VERSION\"}"
        else
            echo "claude-accounts $VERSION"
        fi
        exit $EXIT_OK
    fi
done

if [[ ${#cli_args[@]} -gt 0 ]]; then
    cli_mode "${cli_args[@]}"
else
    main_menu
fi
