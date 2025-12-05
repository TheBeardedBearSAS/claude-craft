#!/bin/bash
# =============================================================================
# Claude Projects Manager
# Manage projects in claude-projects.yaml interactively
# =============================================================================

set -e

# Configuration
DEFAULT_CONFIG="$HOME/.claude/claude-projects.yaml"
CONFIG_FILE=""

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
C_DIM='\033[2m'

# Available technologies
AVAILABLE_TECHS=("symfony" "flutter" "python" "react" "reactnative")

# =============================================================================
# i18n - Load messages
# =============================================================================

load_messages() {
    local lang="${LANG_ARG:-$DEFAULT_LANG}"
    local msg_file="$I18N_DIR/projects/${lang}.sh"

    if [[ -f "$msg_file" ]]; then
        # shellcheck source=/dev/null
        source "$msg_file"
    else
        # Fallback to English
        local fallback="$I18N_DIR/projects/en.sh"
        if [[ -f "$fallback" ]]; then
            # shellcheck source=/dev/null
            source "$fallback"
        else
            # Minimal embedded defaults
            MSG_HEADER="Claude Projects Manager"
            MSG_INVALID_CHOICE="Invalid choice"
            MSG_UNKNOWN_COMMAND="Unknown command:"
            MSG_GOODBYE="Goodbye!"
            MSG_INVALID_LANG="Invalid language:"
            MSG_VALID_LANGS="Valid languages:"
            MSG_YQ_REQUIRED="yq is required but not installed"
            MSG_YQ_INSTALL="Installation:"
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
    echo -e "${C_CYAN}║${C_RESET}     ${C_BOLD}📁 ${MSG_HEADER}${C_RESET}                            ${C_CYAN}║${C_RESET}"
    echo -e "${C_CYAN}╚════════════════════════════════════════════════════════════╝${C_RESET}\n"
}

print_success() { echo -e "${C_GREEN}✓${C_RESET} $1"; }
print_error() { echo -e "${C_RED}✗${C_RESET} $1"; }
print_info() { echo -e "${C_BLUE}ℹ${C_RESET} $1"; }
print_warning() { echo -e "${C_YELLOW}⚠${C_RESET} $1"; }

check_yq() {
    if ! command -v yq &>/dev/null; then
        print_error "${MSG_YQ_REQUIRED}"
        echo ""
        echo "${MSG_YQ_INSTALL}"
        echo "  Ubuntu/Debian: sudo apt install yq"
        echo "  macOS:         brew install yq"
        echo "  Snap:          sudo snap install yq"
        exit 1
    fi
}

ensure_config_file() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        print_info "${MSG_CONFIG_CREATING}"
        mkdir -p "$(dirname "$CONFIG_FILE")"
        cat > "$CONFIG_FILE" << 'YAML'
# Claude Code Projects Configuration
# Managed by claude-projects

settings:
  default_mode: "install"
  backup: true

projects: []
YAML
        print_success "${MSG_CONFIG_CREATED} $CONFIG_FILE"
    fi
}

select_config_file() {
    echo -e "${C_BOLD}📄 ${MSG_CONFIG_TITLE}${C_RESET}\n"

    local configs=()

    # Look for existing files
    [[ -f "$DEFAULT_CONFIG" ]] && configs+=("$DEFAULT_CONFIG")
    [[ -f "./claude-projects.yaml" ]] && configs+=("./claude-projects.yaml")

    if [[ ${#configs[@]} -gt 0 ]]; then
        echo "${MSG_CONFIG_FILES_FOUND}"
        local i=1
        for cfg in "${configs[@]}"; do
            echo -e "  ${C_CYAN}$i)${C_RESET} $cfg"
            ((i++))
        done
        echo -e "  ${C_CYAN}$i)${C_RESET} ${MSG_CONFIG_OTHER}"
        echo -e "  ${C_CYAN}n)${C_RESET} ${MSG_CONFIG_NEW}"
        echo ""
        read -p "${MSG_CONFIG_PROMPT} " choice

        if [[ "$choice" == "n" ]]; then
            read -p "${MSG_CONFIG_NEW_PATH} " CONFIG_FILE
            CONFIG_FILE="${CONFIG_FILE/#\~/$HOME}"
        elif [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -le "${#configs[@]}" ]]; then
            CONFIG_FILE="${configs[$((choice-1))]}"
        elif [[ "$choice" =~ ^[0-9]+$ ]]; then
            read -p "${MSG_CONFIG_PATH} " CONFIG_FILE
            CONFIG_FILE="${CONFIG_FILE/#\~/$HOME}"
        else
            CONFIG_FILE="$DEFAULT_CONFIG"
        fi
    else
        echo "${MSG_CONFIG_NONE}"
        read -p "${MSG_CONFIG_PATH} ${MSG_CONFIG_DEFAULT} $DEFAULT_CONFIG): " CONFIG_FILE
        CONFIG_FILE="${CONFIG_FILE:-$DEFAULT_CONFIG}"
        CONFIG_FILE="${CONFIG_FILE/#\~/$HOME}"
    fi

    ensure_config_file
    print_success "${MSG_CONFIG_CURRENT} $CONFIG_FILE"
}

# =============================================================================
# Project management
# =============================================================================

list_projects() {
    echo -e "\n${C_BOLD}📋 ${MSG_PROJECTS_TITLE}${C_RESET}\n"

    local count=$(yq '.projects | length' "$CONFIG_FILE")

    if [[ "$count" == "0" ]] || [[ -z "$count" ]]; then
        print_warning "${MSG_PROJECTS_NONE}"
        echo -e "   ${MSG_PROJECTS_USE_ADD}\n"
        return
    fi

    for ((i=0; i<count; i++)); do
        local name=$(yq ".projects[$i].name" "$CONFIG_FILE")
        local desc=$(yq ".projects[$i].description // \"\"" "$CONFIG_FILE")
        local root=$(yq ".projects[$i].root" "$CONFIG_FILE")
        local common=$(yq ".projects[$i].common // false" "$CONFIG_FILE")
        local modules_count=$(yq ".projects[$i].modules | length" "$CONFIG_FILE")

        echo -e "  ${C_CYAN}$((i+1)))${C_RESET} ${C_BOLD}$name${C_RESET}"
        [[ -n "$desc" && "$desc" != "null" ]] && echo -e "     ${C_DIM}$desc${C_RESET}"
        echo -e "     📂 $root"
        echo -e "     📦 $modules_count ${MSG_PROJECTS_MODULES} | ${MSG_PROJECTS_COMMON} $([ "$common" == "true" ] && echo "✓" || echo "✗")"

        # List modules
        for ((j=0; j<modules_count; j++)); do
            local mod_path=$(yq ".projects[$i].modules[$j].path" "$CONFIG_FILE")
            local mod_tech=$(yq ".projects[$i].modules[$j].tech" "$CONFIG_FILE")
            echo -e "        └─ ${C_YELLOW}$mod_path${C_RESET} → $mod_tech"
        done
        echo ""
    done
}

add_project() {
    echo -e "\n${C_BOLD}➕ ${MSG_ADD_PROJECT_TITLE}${C_RESET}\n"

    # Project name
    read -p "${MSG_ADD_PROJECT_NAME} " proj_name
    if [[ -z "$proj_name" ]]; then
        print_error "${MSG_ADD_PROJECT_NAME_EMPTY}"
        return 1
    fi

    # Check if project already exists
    local exists=$(yq ".projects[] | select(.name == \"$proj_name\") | .name" "$CONFIG_FILE")
    if [[ -n "$exists" ]]; then
        print_error "${MSG_ADD_PROJECT_EXISTS}: '$proj_name'"
        return 1
    fi

    # Description
    read -p "${MSG_ADD_PROJECT_DESC} " proj_desc

    # Root path
    read -p "${MSG_ADD_PROJECT_ROOT} " proj_root
    if [[ -z "$proj_root" ]]; then
        print_error "${MSG_ADD_PROJECT_ROOT_EMPTY}"
        return 1
    fi

    # Common
    read -p "${MSG_ADD_PROJECT_COMMON} ${MSG_YES_NO_DEFAULT} " common_choice
    local proj_common="true"
    [[ "$common_choice" =~ ^[Nn]$ ]] && proj_common="false"

    # Add project
    yq -i ".projects += [{\"name\": \"$proj_name\", \"description\": \"$proj_desc\", \"root\": \"$proj_root\", \"common\": $proj_common, \"modules\": []}]" "$CONFIG_FILE"

    print_success "${MSG_ADD_PROJECT_CREATED}: '$proj_name'"

    # Offer to add modules
    echo ""
    read -p "${MSG_ADD_PROJECT_MODULES_NOW} ${MSG_YES_NO_DEFAULT} " add_modules
    if [[ ! "$add_modules" =~ ^[Nn]$ ]]; then
        add_module_to_project "$proj_name"
    fi
}

add_module_to_project() {
    local proj_name="$1"

    if [[ -z "$proj_name" ]]; then
        echo -e "\n${C_BOLD}📦 ${MSG_MENU_MODULE}${C_RESET}\n"

        # List projects for selection
        local count=$(yq '.projects | length' "$CONFIG_FILE")
        if [[ "$count" == "0" ]]; then
            print_warning "${MSG_PROJECTS_NONE}"
            return
        fi

        echo "${MSG_PROJECTS_SELECT}"
        for ((i=0; i<count; i++)); do
            local name=$(yq ".projects[$i].name" "$CONFIG_FILE")
            echo -e "  ${C_CYAN}$((i+1)))${C_RESET} $name"
        done

        read -p "${MSG_CONFIG_PROMPT} " choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -le "$count" ]]; then
            proj_name=$(yq ".projects[$((choice-1))].name" "$CONFIG_FILE")
        else
            print_error "${MSG_INVALID_CHOICE}"
            return 1
        fi
    fi

    local proj_index=$(yq ".projects | to_entries | .[] | select(.value.name == \"$proj_name\") | .key" "$CONFIG_FILE")

    while true; do
        echo ""
        echo -e "${C_BOLD}${MSG_MODULES_ADD_TO} '$proj_name'${C_RESET}\n"

        # Module path
        read -p "${MSG_MODULES_PATH} " mod_path
        if [[ -z "$mod_path" ]]; then
            print_error "${MSG_MODULES_PATH_EMPTY}"
            continue
        fi

        # Technology
        echo ""
        echo "${MSG_MODULES_TECH}"
        for ((i=0; i<${#AVAILABLE_TECHS[@]}; i++)); do
            echo -e "  ${C_CYAN}$((i+1)))${C_RESET} ${AVAILABLE_TECHS[$i]}"
        done

        read -p "${MSG_MODULES_TECH_PROMPT} " tech_choice
        if [[ "$tech_choice" =~ ^[0-9]+$ ]] && [[ "$tech_choice" -ge 1 ]] && [[ "$tech_choice" -le "${#AVAILABLE_TECHS[@]}" ]]; then
            local mod_tech="${AVAILABLE_TECHS[$((tech_choice-1))]}"
        else
            print_error "${MSG_INVALID_CHOICE}"
            continue
        fi

        # Description (optional)
        read -p "${MSG_MODULES_DESC} " mod_desc

        # Add module
        if [[ -n "$mod_desc" ]]; then
            yq -i ".projects[$proj_index].modules += [{\"path\": \"$mod_path\", \"tech\": \"$mod_tech\", \"description\": \"$mod_desc\"}]" "$CONFIG_FILE"
        else
            yq -i ".projects[$proj_index].modules += [{\"path\": \"$mod_path\", \"tech\": \"$mod_tech\"}]" "$CONFIG_FILE"
        fi

        print_success "${MSG_MODULES_ADDED}: '$mod_path' ($mod_tech)"

        echo ""
        read -p "${MSG_MODULES_ADD_ANOTHER} ${MSG_CONFIRM_YES_NO} " another
        [[ ! "$another" =~ ^[OoYySs]$ ]] && break
    done
}

edit_project() {
    echo -e "\n${C_BOLD}✏️  ${MSG_EDIT_PROJECT_TITLE}${C_RESET}\n"

    local count=$(yq '.projects | length' "$CONFIG_FILE")
    if [[ "$count" == "0" ]]; then
        print_warning "${MSG_PROJECTS_NONE}"
        return
    fi

    # List projects
    echo "${MSG_EDIT_PROJECT_SELECT}"
    for ((i=0; i<count; i++)); do
        local name=$(yq ".projects[$i].name" "$CONFIG_FILE")
        echo -e "  ${C_CYAN}$((i+1)))${C_RESET} $name"
    done

    read -p "${MSG_CONFIG_PROMPT} " choice
    if [[ ! "$choice" =~ ^[0-9]+$ ]] || [[ "$choice" -lt 1 ]] || [[ "$choice" -gt "$count" ]]; then
        print_error "${MSG_INVALID_CHOICE}"
        return 1
    fi

    local proj_index=$((choice-1))
    local proj_name=$(yq ".projects[$proj_index].name" "$CONFIG_FILE")
    local proj_desc=$(yq ".projects[$proj_index].description // \"\"" "$CONFIG_FILE")
    local proj_root=$(yq ".projects[$proj_index].root" "$CONFIG_FILE")
    local proj_common=$(yq ".projects[$proj_index].common // false" "$CONFIG_FILE")

    echo ""
    echo -e "${C_BOLD}${MSG_EDIT_PROJECT_EDITING} '$proj_name'${C_RESET}"
    echo -e "${C_DIM}${MSG_EDIT_PROJECT_KEEP}${C_RESET}\n"

    # Name
    read -p "${MSG_EDIT_PROJECT_NAME} [$proj_name]: " new_name
    [[ -n "$new_name" ]] && yq -i ".projects[$proj_index].name = \"$new_name\"" "$CONFIG_FILE"

    # Description
    read -p "${MSG_EDIT_PROJECT_DESC} [$proj_desc]: " new_desc
    [[ -n "$new_desc" ]] && yq -i ".projects[$proj_index].description = \"$new_desc\"" "$CONFIG_FILE"

    # Root
    read -p "${MSG_EDIT_PROJECT_ROOT} [$proj_root]: " new_root
    [[ -n "$new_root" ]] && yq -i ".projects[$proj_index].root = \"$new_root\"" "$CONFIG_FILE"

    # Common
    local common_display=$([ "$proj_common" == "true" ] && echo "Y/n" || echo "y/N")
    read -p "${MSG_EDIT_PROJECT_COMMON} [$common_display]: " new_common
    if [[ "$new_common" =~ ^[OoYySs]$ ]]; then
        yq -i ".projects[$proj_index].common = true" "$CONFIG_FILE"
    elif [[ "$new_common" =~ ^[Nn]$ ]]; then
        yq -i ".projects[$proj_index].common = false" "$CONFIG_FILE"
    fi

    print_success "${MSG_EDIT_PROJECT_DONE}"

    # Offer to manage modules
    echo ""
    read -p "${MSG_EDIT_PROJECT_MANAGE_MODULES} ${MSG_CONFIRM_YES_NO} " manage_modules
    if [[ "$manage_modules" =~ ^[OoYySs]$ ]]; then
        manage_project_modules "$proj_index"
    fi
}

manage_project_modules() {
    local proj_index="$1"
    local proj_name=$(yq ".projects[$proj_index].name" "$CONFIG_FILE")

    while true; do
        echo ""
        echo -e "${C_BOLD}${MSG_MODULES_TITLE} '$proj_name'${C_RESET}\n"

        local modules_count=$(yq ".projects[$proj_index].modules | length" "$CONFIG_FILE")

        if [[ "$modules_count" == "0" ]]; then
            print_warning "${MSG_MODULES_NONE}"
        else
            for ((j=0; j<modules_count; j++)); do
                local mod_path=$(yq ".projects[$proj_index].modules[$j].path" "$CONFIG_FILE")
                local mod_tech=$(yq ".projects[$proj_index].modules[$j].tech" "$CONFIG_FILE")
                echo -e "  ${C_CYAN}$((j+1)))${C_RESET} $mod_path → ${C_YELLOW}$mod_tech${C_RESET}"
            done
        fi

        echo ""
        echo -e "  ${C_GREEN}a)${C_RESET} ${MSG_MODULES_ADD}"
        echo -e "  ${C_RED}d)${C_RESET} ${MSG_MODULES_DELETE}"
        echo -e "  ${C_DIM}q)${C_RESET} ${MSG_MODULES_BACK}"
        echo ""

        read -p "${MSG_CONFIG_PROMPT} " action

        case "$action" in
            a|A)
                add_module_to_project "$proj_name"
                ;;
            d|D)
                if [[ "$modules_count" -gt 0 ]]; then
                    read -p "${MSG_MODULES_DELETE_PROMPT} " del_choice
                    if [[ "$del_choice" =~ ^[0-9]+$ ]] && [[ "$del_choice" -ge 1 ]] && [[ "$del_choice" -le "$modules_count" ]]; then
                        yq -i "del(.projects[$proj_index].modules[$((del_choice-1))])" "$CONFIG_FILE"
                        print_success "${MSG_MODULES_DELETED}"
                    else
                        print_error "${MSG_INVALID_CHOICE}"
                    fi
                fi
                ;;
            q|Q)
                break
                ;;
        esac
    done
}

delete_project() {
    echo -e "\n${C_BOLD}🗑️  ${MSG_DELETE_PROJECT_TITLE}${C_RESET}\n"

    local count=$(yq '.projects | length' "$CONFIG_FILE")
    if [[ "$count" == "0" ]]; then
        print_warning "${MSG_PROJECTS_NONE}"
        return
    fi

    # List projects
    echo "${MSG_DELETE_PROJECT_SELECT}"
    for ((i=0; i<count; i++)); do
        local name=$(yq ".projects[$i].name" "$CONFIG_FILE")
        echo -e "  ${C_CYAN}$((i+1)))${C_RESET} $name"
    done

    read -p "${MSG_CONFIG_PROMPT} " choice
    if [[ ! "$choice" =~ ^[0-9]+$ ]] || [[ "$choice" -lt 1 ]] || [[ "$choice" -gt "$count" ]]; then
        print_error "${MSG_INVALID_CHOICE}"
        return 1
    fi

    local proj_index=$((choice-1))
    local proj_name=$(yq ".projects[$proj_index].name" "$CONFIG_FILE")

    echo ""
    print_warning "${MSG_DELETE_PROJECT_CONFIRM} '${C_BOLD}$proj_name${C_RESET}'"
    read -p "${MSG_CONFIRM_YES_NO} " confirm

    if [[ "$confirm" =~ ^[OoYySs]$ ]]; then
        yq -i "del(.projects[$proj_index])" "$CONFIG_FILE"
        print_success "${MSG_DELETE_PROJECT_DONE}: '$proj_name'"
    else
        print_info "${MSG_DELETE_PROJECT_CANCELLED}"
    fi
}

validate_config() {
    echo -e "\n${C_BOLD}✅ ${MSG_VALIDATE_TITLE}${C_RESET}\n"

    local errors=0
    local warnings=0
    local count=$(yq '.projects | length' "$CONFIG_FILE")

    if [[ "$count" == "0" ]]; then
        print_warning "${MSG_PROJECTS_NONE}"
        return
    fi

    for ((i=0; i<count; i++)); do
        local name=$(yq ".projects[$i].name" "$CONFIG_FILE")
        local root=$(yq ".projects[$i].root" "$CONFIG_FILE")
        local modules_count=$(yq ".projects[$i].modules | length" "$CONFIG_FILE")

        echo -e "${MSG_VALIDATE_PROJECT} ${C_BOLD}$name${C_RESET}"

        # Check name
        if [[ -z "$name" || "$name" == "null" ]]; then
            print_error "  ${MSG_VALIDATE_NAME_MISSING}"
            ((errors++))
        fi

        # Check root
        if [[ -z "$root" || "$root" == "null" ]]; then
            print_error "  ${MSG_VALIDATE_ROOT_MISSING}"
            ((errors++))
        else
            local expanded_root="${root/#\~/$HOME}"
            if [[ ! -d "$expanded_root" ]]; then
                print_warning "  ${MSG_VALIDATE_DIR_NOT_FOUND} $root"
                ((warnings++))
            else
                print_success "  ${MSG_VALIDATE_DIR_FOUND} $root"
            fi
        fi

        # Check modules
        if [[ "$modules_count" == "0" ]]; then
            print_warning "  ${MSG_VALIDATE_NO_MODULE}"
            ((warnings++))
        else
            for ((j=0; j<modules_count; j++)); do
                local mod_path=$(yq ".projects[$i].modules[$j].path" "$CONFIG_FILE")
                local mod_tech=$(yq ".projects[$i].modules[$j].tech" "$CONFIG_FILE")

                # Check technology
                local valid_tech=false
                for tech in "${AVAILABLE_TECHS[@]}"; do
                    [[ "$mod_tech" == "$tech" ]] && valid_tech=true
                done

                if [[ "$valid_tech" == "false" ]]; then
                    print_error "  ${MSG_VALIDATE_MODULE} '$mod_path': ${MSG_VALIDATE_INVALID_TECH} '$mod_tech'"
                    ((errors++))
                else
                    print_success "  ${MSG_VALIDATE_MODULE} '$mod_path' → $mod_tech"
                fi
            done
        fi
        echo ""
    done

    # Summary
    echo -e "${C_BOLD}${MSG_VALIDATE_SUMMARY}${C_RESET}"
    echo -e "  ${MSG_VALIDATE_PROJECTS} $count"
    echo -e "  ${MSG_VALIDATE_ERRORS} ${C_RED}$errors${C_RESET}"
    echo -e "  ${MSG_VALIDATE_WARNINGS} ${C_YELLOW}$warnings${C_RESET}"

    if [[ "$errors" -eq 0 ]]; then
        echo ""
        print_success "${MSG_VALIDATE_OK}"
    else
        echo ""
        print_error "${MSG_VALIDATE_FAIL}"
    fi
}

show_config_path() {
    echo ""
    print_info "${MSG_CONFIG_CURRENT} ${C_BOLD}$CONFIG_FILE${C_RESET}"
    echo ""
}

# =============================================================================
# Main menu
# =============================================================================

show_menu() {
    echo -e "${C_BOLD}${MSG_MENU_TITLE}${C_RESET}\n"
    echo -e "  ${C_CYAN}1)${C_RESET} 📋 ${MSG_MENU_LIST}"
    echo -e "  ${C_CYAN}2)${C_RESET} ➕ ${MSG_MENU_ADD}"
    echo -e "  ${C_CYAN}3)${C_RESET} ✏️  ${MSG_MENU_EDIT}"
    echo -e "  ${C_CYAN}4)${C_RESET} 📦 ${MSG_MENU_MODULE}"
    echo -e "  ${C_CYAN}5)${C_RESET} 🗑️  ${MSG_MENU_DELETE}"
    echo -e "  ${C_CYAN}6)${C_RESET} ✅ ${MSG_MENU_VALIDATE}"
    echo -e "  ${C_CYAN}7)${C_RESET} 📄 ${MSG_MENU_CHANGE_CONFIG}"
    echo -e "  ${C_CYAN}q)${C_RESET} ${MSG_MENU_QUIT}"
    echo ""
}

main_menu() {
    while true; do
        print_header
        show_config_path
        show_menu

        read -p "${MSG_CONFIG_PROMPT} " -n 1 -r choice
        echo ""

        case $choice in
            1) list_projects ;;
            2) add_project ;;
            3) edit_project ;;
            4) add_module_to_project ;;
            5) delete_project ;;
            6) validate_config ;;
            7) select_config_file ;;
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

show_usage() {
    echo -e "\n${C_BOLD}📖 ${MSG_USAGE_TITLE}${C_RESET}\n"
    echo -e "${C_CYAN}${MSG_USAGE_INTERACTIVE}${C_RESET}"
    echo -e "  ${C_BOLD}claude-projects${C_RESET}                    ${MSG_USAGE_MENU}"
    echo ""
    echo -e "${C_CYAN}${MSG_USAGE_COMMANDS}${C_RESET}"
    echo -e "  ${C_BOLD}claude-projects list${C_RESET}               ${MSG_USAGE_LIST}"
    echo -e "  ${C_BOLD}claude-projects add${C_RESET}                ${MSG_USAGE_ADD}"
    echo -e "  ${C_BOLD}claude-projects edit${C_RESET}               ${MSG_USAGE_EDIT}"
    echo -e "  ${C_BOLD}claude-projects delete${C_RESET}             ${MSG_USAGE_DELETE}"
    echo -e "  ${C_BOLD}claude-projects validate${C_RESET}           ${MSG_USAGE_VALIDATE}"
    echo ""
    echo -e "${C_CYAN}${MSG_USAGE_OPTIONS}${C_RESET}"
    echo -e "  ${C_BOLD}-c, --config <file>${C_RESET}   ${MSG_USAGE_CONFIG}"
    echo -e "  ${C_BOLD}--lang=XX${C_RESET}             ${MSG_USAGE_LANG}"
    echo ""
    echo -e "${C_CYAN}${MSG_USAGE_EXAMPLES}${C_RESET}"
    echo -e "  claude-projects -c ./my-projects.yaml list"
    echo -e "  claude-projects --config ~/projects.yaml add"
    echo -e "  claude-projects --lang=fr list"
    echo ""
}

cli_mode() {
    local command="$1"
    shift

    case "$command" in
        list|ls|l)
            list_projects
            ;;
        add|a)
            add_project
            ;;
        edit|e)
            edit_project
            ;;
        module|m)
            add_module_to_project
            ;;
        delete|rm|d)
            delete_project
            ;;
        validate|v)
            validate_config
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

check_yq

# Parse arguments
cli_args=()
while [[ $# -gt 0 ]]; do
    case "$1" in
        -c|--config)
            CONFIG_FILE="${2/#\~/$HOME}"
            shift 2
            ;;
        --lang=*)
            # Already parsed earlier, skip
            shift
            ;;
        *)
            cli_args+=("$1")
            shift
            ;;
    esac
done

# Default config if not specified
if [[ -z "$CONFIG_FILE" ]]; then
    if [[ -f "./claude-projects.yaml" ]]; then
        CONFIG_FILE="./claude-projects.yaml"
    else
        CONFIG_FILE="$DEFAULT_CONFIG"
    fi
fi

if [[ ${#cli_args[@]} -gt 0 ]]; then
    ensure_config_file
    cli_mode "${cli_args[@]}"
else
    select_config_file
    main_menu
fi
