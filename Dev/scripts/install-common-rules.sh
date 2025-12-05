#!/bin/bash

#===============================================================================
# install-common-rules.sh
#
# Multilingual installation script for common rules, agents and commands
# for Claude Code in an existing project.
#
# Usage:
#   ./install-common-rules.sh [OPTIONS] [TARGET_DIR]
#
# Options:
#   --install       Install files (default)
#   --update        Update existing files only
#   --force         Overwrite files without confirmation
#   --dry-run       Simulate without making changes
#   --backup        Create backup before changes
#   --interactive   Interactive mode to choose components
#   --lang=XX       Language (en, fr, es, de, pt) - default: en
#   --agents-only   Install agents only
#   --commands-only Install commands only
#   --templates-only Install templates only
#   --checklists-only Install checklists only
#   -h, --help      Show help
#
# Examples:
#   ./install-common-rules.sh ~/Projects/myapp
#   ./install-common-rules.sh --lang=fr ~/Projects/myapp
#   ./install-common-rules.sh --update --backup ~/Projects/myapp
#   ./install-common-rules.sh --dry-run .
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# Configuration
#-------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="$(basename "$0")"
VERSION="2.0.0"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Options par défaut
action="install"
force=false
dry_run=false
backup=false
interactive=false
agents_only=false
commands_only=false
templates_only=false
checklists_only=false
target_dir=""
lang="en"

#-------------------------------------------------------------------------------
# Load i18n messages
#-------------------------------------------------------------------------------
load_messages() {
    local lang_file="$I18N_DIR/messages/${lang}.sh"
    if [[ -f "$lang_file" ]]; then
        # shellcheck source=/dev/null
        source "$lang_file"
    else
        # Fallback to English
        local fallback="$I18N_DIR/messages/en.sh"
        if [[ -f "$fallback" ]]; then
            # shellcheck source=/dev/null
            source "$fallback"
        else
            # Minimal defaults if no message file found
            MSG_INFO="INFO"
            MSG_SUCCESS="SUCCESS"
            MSG_WARNING="WARNING"
            MSG_ERROR="ERROR"
            MSG_DRY_RUN="DRY-RUN"
            MSG_INSTALLING="Installing..."
            MSG_CREATING="Creating:"
            MSG_UPDATING="Updating:"
            MSG_SKIPPING="Skipping (file exists):"
            MSG_BACKUP_CREATED="Backup created:"
            MSG_ERR_UNKNOWN_OPTION="Unknown option:"
            MSG_ERR_UNEXPECTED_ARG="Unexpected argument:"
            MSG_ERR_INVALID_DIR="Invalid target directory:"
            MSG_ERR_FILE_NOT_FOUND="Source file not found:"
            MSG_ERR_DIR_NOT_FOUND="Source directory not found:"
            MSG_INSTALLING_AGENTS="Installing agents..."
            MSG_INSTALLING_COMMANDS="Installing commands..."
            MSG_INSTALLING_TEMPLATES="Installing templates..."
            MSG_INSTALLING_CHECKLISTS="Installing checklists..."
            MSG_AGENTS_NOT_FOUND="Agents directory not found:"
            MSG_COMMANDS_NOT_FOUND="Commands directory not found:"
            MSG_TEMPLATES_NOT_FOUND="Templates directory not found:"
            MSG_CHECKLISTS_NOT_FOUND="Checklists directory not found:"
            MSG_SUMMARY="SUMMARY"
            MSG_MODE="Mode:"
            MSG_TARGET="Target:"
            MSG_FILES_CREATED="Files created:"
            MSG_FILES_UPDATED="Files updated:"
            MSG_FILES_SKIPPED="Files skipped:"
            MSG_ERRORS="Errors:"
            MSG_DRY_RUN_NOTE="Run without --dry-run to apply changes."
            MSG_DRY_RUN_WOULD_CREATE="Would create directory:"
            MSG_DRY_RUN_WOULD_COPY="Would copy:"
            MSG_HEADER_COMMON="Install Common Rules"
            MSG_HELP_USAGE="Usage:"
            MSG_HELP_OPTIONS="Options:"
            MSG_HELP_EXAMPLES="Examples:"
            MSG_HELP_INSTALL="Install files (default)"
            MSG_HELP_UPDATE="Update existing files only"
            MSG_HELP_FORCE="Overwrite all files"
            MSG_HELP_DRY_RUN="Simulate without changes"
            MSG_HELP_BACKUP="Create backup before changes"
            MSG_HELP_INTERACTIVE="Interactive mode"
            MSG_HELP_LANG="Language (en, fr, es, de, pt)"
            MSG_INSTALL_SUCCESS="Installation successful!"
            MSG_INSTALL_FAILED="Installation failed"
            MSG_NEXT_STEPS="Next steps:"
            MSG_STEP_RESTART="Restart Claude Code to load commands"
        fi
    fi
}

# Compteurs
files_created=0
files_updated=0
files_skipped=0
errors=0

#-------------------------------------------------------------------------------
# Utility functions
#-------------------------------------------------------------------------------
log_info() {
    echo -e "${BLUE}[${MSG_INFO}]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[${MSG_SUCCESS}]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[${MSG_WARNING}]${NC} $1"
}

log_error() {
    echo -e "${RED}[${MSG_ERROR}]${NC} $1" >&2
}

log_dry_run() {
    echo -e "${CYAN}[${MSG_DRY_RUN}]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  📦 ${MSG_HEADER_COMMON} - v${VERSION}                    ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_usage() {
    cat << EOF
${MSG_HELP_USAGE} $SCRIPT_NAME [OPTIONS] [TARGET_DIR]

${MSG_HEADER_COMMON}

${MSG_HELP_OPTIONS}
    --install           ${MSG_HELP_INSTALL}
    --update            ${MSG_HELP_UPDATE}
    --force             ${MSG_HELP_FORCE}
    --dry-run           ${MSG_HELP_DRY_RUN}
    --backup            ${MSG_HELP_BACKUP}
    --interactive       ${MSG_HELP_INTERACTIVE}
    --lang=XX           ${MSG_HELP_LANG}
    --agents-only       Install agents only
    --commands-only     Install commands only
    --templates-only    Install templates only
    --checklists-only   Install checklists only
    -h, --help          Show help

${MSG_HELP_EXAMPLES}
    $SCRIPT_NAME ~/Projects/myapp
    $SCRIPT_NAME --lang=fr ~/Projects/myapp
    $SCRIPT_NAME --update --backup ~/Projects/myapp
    $SCRIPT_NAME --dry-run .

EOF
}

#-------------------------------------------------------------------------------
# Argument parsing
#-------------------------------------------------------------------------------
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --install)
                action="install"
                shift
                ;;
            --update)
                action="update"
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --backup)
                backup=true
                shift
                ;;
            --interactive)
                interactive=true
                shift
                ;;
            --lang=*)
                lang="${1#--lang=}"
                shift
                ;;
            --agents-only)
                agents_only=true
                shift
                ;;
            --commands-only)
                commands_only=true
                shift
                ;;
            --templates-only)
                templates_only=true
                shift
                ;;
            --checklists-only)
                checklists_only=true
                shift
                ;;
            -h|--help)
                load_messages
                print_usage
                exit 0
                ;;
            -*)
                load_messages
                log_error "${MSG_ERR_UNKNOWN_OPTION} $1"
                print_usage
                exit 1
                ;;
            *)
                if [[ -z "$target_dir" ]]; then
                    target_dir="$1"
                else
                    load_messages
                    log_error "${MSG_ERR_UNEXPECTED_ARG} $1"
                    print_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done

    # Load messages after lang is set
    load_messages

    # If no filter specified, install all
    if ! $agents_only && ! $commands_only && ! $templates_only && ! $checklists_only; then
        agents_only=true
        commands_only=true
        templates_only=true
        checklists_only=true
    fi

    # Default target directory
    if [[ -z "$target_dir" ]]; then
        target_dir="."
    fi

    # Resolve absolute path
    target_dir="$(cd "$target_dir" 2>/dev/null && pwd)" || {
        log_error "${MSG_ERR_INVALID_DIR} $target_dir"
        exit 1
    }
}

#-------------------------------------------------------------------------------
# Installation functions
#-------------------------------------------------------------------------------
create_backup() {
    local file="$1"
    if [[ -f "$file" ]]; then
        local backup_file="${file}.backup.$(date +%Y%m%d_%H%M%S)"
        if $dry_run; then
            log_dry_run "Backup: $file -> $backup_file"
        else
            cp "$file" "$backup_file"
            log_info "${MSG_BACKUP_CREATED} $backup_file"
        fi
    fi
}

copy_file() {
    local src="$1"
    local dest="$2"
    local relative_dest="${dest#$target_dir/}"

    # Check if source file exists
    if [[ ! -f "$src" ]]; then
        log_error "${MSG_ERR_FILE_NOT_FOUND} $src"
        ((++errors))
        return 1
    fi

    # Create destination directory
    local dest_dir="$(dirname "$dest")"
    if $dry_run; then
        if [[ ! -d "$dest_dir" ]]; then
            log_dry_run "${MSG_DRY_RUN_WOULD_CREATE} $dest_dir"
        fi
    else
        mkdir -p "$dest_dir"
    fi

    # Check if file already exists
    if [[ -f "$dest" ]]; then
        if [[ "$action" == "install" ]] && ! $force; then
            log_warning "${MSG_SKIPPING} $relative_dest"
            ((++files_skipped))
            return 0
        fi

        # Backup if requested
        if $backup; then
            create_backup "$dest"
        fi

        if $dry_run; then
            log_dry_run "${MSG_UPDATING} $relative_dest"
        else
            cp "$src" "$dest"
            log_info "${MSG_UPDATING} $relative_dest"
        fi
        ((++files_updated))
    else
        if $dry_run; then
            log_dry_run "${MSG_CREATING} $relative_dest"
        else
            cp "$src" "$dest"
            log_success "${MSG_CREATING} $relative_dest"
        fi
        ((++files_created))
    fi
}

copy_directory() {
    local src_dir="$1"
    local dest_dir="$2"
    local pattern="${3:-*}"

    if [[ ! -d "$src_dir" ]]; then
        log_error "${MSG_ERR_DIR_NOT_FOUND} $src_dir"
        ((++errors))
        return 1
    fi

    # Process files
    while IFS= read -r -d '' file; do
        local relative_path="${file#$src_dir/}"
        local dest_file="$dest_dir/$relative_path"
        copy_file "$file" "$dest_file"
    done < <(find "$src_dir" -type f -name "$pattern" -print0)
}

#-------------------------------------------------------------------------------
# Component installation
#-------------------------------------------------------------------------------
install_agents() {
    log_info "${MSG_INSTALLING_AGENTS}"

    # Use i18n directory if available, fallback to local
    local src_agents="$I18N_DIR/$lang/Common/agents"
    if [[ ! -d "$src_agents" ]]; then
        src_agents="$SCRIPT_DIR/claude-agents"
    fi
    local dest_agents="$target_dir/.claude/agents"

    if [[ -d "$src_agents" ]]; then
        copy_directory "$src_agents" "$dest_agents" "*.md"
    else
        log_warning "${MSG_AGENTS_NOT_FOUND} $src_agents"
    fi
}

install_commands() {
    log_info "${MSG_INSTALLING_COMMANDS}"

    # Use i18n directory if available, fallback to local
    local src_commands="$I18N_DIR/$lang/Common/commands"
    if [[ ! -d "$src_commands" ]]; then
        src_commands="$SCRIPT_DIR/claude-commands/common"
    fi
    local dest_commands="$target_dir/.claude/commands/common"

    if [[ -d "$src_commands" ]]; then
        copy_directory "$src_commands" "$dest_commands" "*.md"
    else
        log_warning "${MSG_COMMANDS_NOT_FOUND} $src_commands"
    fi
}

install_templates() {
    log_info "${MSG_INSTALLING_TEMPLATES}"

    # Use i18n directory if available, fallback to local
    local src_templates="$I18N_DIR/$lang/Common/templates"
    if [[ ! -d "$src_templates" ]]; then
        src_templates="$SCRIPT_DIR/templates"
    fi
    local dest_templates="$target_dir/.github"

    if [[ -d "$src_templates" ]]; then
        # PR Template
        if [[ -f "$src_templates/pull-request-template.md" ]]; then
            copy_file "$src_templates/pull-request-template.md" "$dest_templates/PULL_REQUEST_TEMPLATE.md"
        fi

        # Issue Templates
        if [[ -d "$src_templates/issue-templates" ]]; then
            copy_directory "$src_templates/issue-templates" "$dest_templates/ISSUE_TEMPLATE" "*.md"
        fi
    else
        log_warning "${MSG_TEMPLATES_NOT_FOUND} $src_templates"
    fi
}

install_checklists() {
    log_info "${MSG_INSTALLING_CHECKLISTS}"

    # Use i18n directory if available, fallback to local
    local src_checklists="$I18N_DIR/$lang/Common/checklists"
    if [[ ! -d "$src_checklists" ]]; then
        src_checklists="$SCRIPT_DIR/checklists"
    fi
    local dest_checklists="$target_dir/.claude/checklists"

    if [[ -d "$src_checklists" ]]; then
        copy_directory "$src_checklists" "$dest_checklists" "*.md"
    else
        log_warning "${MSG_CHECKLISTS_NOT_FOUND} $src_checklists"
    fi
}

#-------------------------------------------------------------------------------
# Mode interactif
#-------------------------------------------------------------------------------
run_interactive() {
    echo ""
    echo "Mode interactif - Choisissez les composants à installer:"
    echo ""

    local install_agents_choice=false
    local install_commands_choice=false
    local install_templates_choice=false
    local install_checklists_choice=false

    read -p "Installer les agents transversaux ? (y/n) [y]: " choice
    [[ "$choice" != "n" && "$choice" != "N" ]] && install_agents_choice=true

    read -p "Installer les commandes /common: ? (y/n) [y]: " choice
    [[ "$choice" != "n" && "$choice" != "N" ]] && install_commands_choice=true

    read -p "Installer les templates PR/Issues ? (y/n) [y]: " choice
    [[ "$choice" != "n" && "$choice" != "N" ]] && install_templates_choice=true

    read -p "Installer les checklists ? (y/n) [y]: " choice
    [[ "$choice" != "n" && "$choice" != "N" ]] && install_checklists_choice=true

    echo ""

    agents_only=$install_agents_choice
    commands_only=$install_commands_choice
    templates_only=$install_templates_choice
    checklists_only=$install_checklists_choice
}

#-------------------------------------------------------------------------------
# Summary display
#-------------------------------------------------------------------------------
print_summary() {
    echo ""
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN} 📊 ${MSG_SUMMARY}${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo ""

    if $dry_run; then
        echo -e "  ${CYAN}${MSG_MODE}${NC} ${MSG_DRY_RUN}"
    else
        echo -e "  ${CYAN}${MSG_MODE}${NC} $action"
    fi

    echo -e "  ${CYAN}${MSG_TARGET}${NC} $target_dir"
    echo -e "  ${CYAN}Language:${NC} $lang"
    echo ""
    echo -e "  ${GREEN}${MSG_FILES_CREATED}${NC}    $files_created"
    echo -e "  ${BLUE}${MSG_FILES_UPDATED}${NC} $files_updated"
    echo -e "  ${YELLOW}${MSG_FILES_SKIPPED}${NC}  $files_skipped"

    if [[ $errors -gt 0 ]]; then
        echo -e "  ${RED}${MSG_ERRORS}${NC}           $errors"
    fi

    echo ""

    if $dry_run; then
        echo -e "${YELLOW}ℹ️  ${MSG_DRY_RUN_NOTE}${NC}"
    elif [[ $errors -eq 0 ]]; then
        echo -e "${GREEN}✅ ${MSG_INSTALL_SUCCESS}${NC}"
        echo ""
        echo -e "${CYAN}${MSG_NEXT_STEPS}${NC}"
        echo -e "  • ${MSG_STEP_RESTART}"
    else
        echo -e "${RED}⚠️  ${MSG_INSTALL_FAILED}${NC}"
    fi

    echo ""
}

#-------------------------------------------------------------------------------
# Main
#-------------------------------------------------------------------------------
main() {
    print_header
    parse_args "$@"

    log_info "Répertoire cible: $target_dir"
    log_info "Action: $action"

    if $dry_run; then
        log_info "Mode: Dry-run (aucune modification)"
    fi

    if $interactive; then
        run_interactive
    fi

    echo ""

    # Installation des composants sélectionnés
    if $agents_only; then
        install_agents
    fi

    if $commands_only; then
        install_commands
    fi

    if $templates_only; then
        install_templates
    fi

    if $checklists_only; then
        install_checklists
    fi

    print_summary

    # Code de sortie
    if [[ $errors -gt 0 ]]; then
        exit 1
    fi

    exit 0
}

# Exécuter
main "$@"
