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
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# Source TCL common functions
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# Shared UI (colors + logging)
# shellcheck source=lib/shell-ui.sh
source "${SCRIPT_DIR}/lib/shell-ui.sh"

# Default options
action="install"
force=false
dry_run=false
backup=false
interactive=false
preserve_config=false
rules_only=false
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

# Counters
files_created=0
files_updated=0
files_skipped=0
errors=0

#-------------------------------------------------------------------------------
# Utility functions
#-------------------------------------------------------------------------------
log_info() { ui_info "$@"; }
log_success() { ui_success "$@"; }
log_warning() { ui_warning "$@"; }
log_error() { ui_error "$@"; }
log_dry_run() { ui_dry_run "$@"; }

print_header() {
    ui_box "📦 ${MSG_HEADER_COMMON} - v${VERSION}" "$CYAN"
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
    --preserve-config   Preserve CLAUDE.md when using --force
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
            --preserve-config)
                preserve_config=true
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
            --rules-only)
                rules_only=true
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
    if ! $rules_only && ! $agents_only && ! $commands_only && ! $templates_only && ! $checklists_only; then
        rules_only=true
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
    local exclude="${4:-}"  # Optional: filename to exclude

    if [[ ! -d "$src_dir" ]]; then
        log_error "${MSG_ERR_DIR_NOT_FOUND} $src_dir"
        ((++errors))
        return 1
    fi

    # Process files
    while IFS= read -r -d '' file; do
        local filename
        filename=$(basename "$file")
        # Skip excluded files
        if [[ -n "$exclude" && "$filename" == "$exclude" ]]; then
            continue
        fi
        local relative_path="${file#$src_dir/}"
        local dest_file="$dest_dir/$relative_path"
        copy_file "$file" "$dest_file"
    done < <(find "$src_dir" -type f -name "$pattern" -print0)
}

#-------------------------------------------------------------------------------
# Component installation
#-------------------------------------------------------------------------------
install_rules() {
    log_info "${MSG_INSTALLING_RULES:-Installing skills and rules...}"

    # Install skills (base + lang overlay)
    local base_skills="$I18N_DIR/base/Common/skills"
    local lang_skills="$I18N_DIR/$lang/Common/skills"
    local dest_skills="$target_dir/.claude/skills"

    if [[ -d "$base_skills" ]] || [[ -d "$lang_skills" ]]; then
        [[ -d "$base_skills" ]] && copy_directory "$base_skills" "$dest_skills" "*.md"
        [[ -d "$lang_skills" ]] && copy_directory "$lang_skills" "$dest_skills" "*.md"
    else
        log_warning "${MSG_SKILLS_NOT_FOUND:-Common skills directory not found}"
    fi

    # Also install legacy rules for backward compatibility (base + lang overlay)
    local base_rules="$I18N_DIR/base/Common/rules"
    local lang_rules="$I18N_DIR/$lang/Common/rules"
    local dest_rules="$target_dir/.claude/rules"

    [[ -d "$base_rules" ]] && copy_directory "$base_rules" "$dest_rules" "*.md"
    [[ -d "$base_rules" ]] && copy_directory "$base_rules" "$dest_rules" "*.md.template"
    [[ -d "$lang_rules" ]] && copy_directory "$lang_rules" "$dest_rules" "*.md"
    [[ -d "$lang_rules" ]] && copy_directory "$lang_rules" "$dest_rules" "*.md.template"
}

install_agents() {
    log_info "${MSG_INSTALLING_AGENTS}"

    local base_agents="$I18N_DIR/base/Common/agents"
    local lang_agents="$I18N_DIR/$lang/Common/agents"
    local dest_agents="$target_dir/.claude/agents"

    if [[ -d "$base_agents" ]] || [[ -d "$lang_agents" ]]; then
        [[ -d "$base_agents" ]] && copy_directory "$base_agents" "$dest_agents" "*.md"
        [[ -d "$lang_agents" ]] && copy_directory "$lang_agents" "$dest_agents" "*.md"
    elif [[ -d "$SCRIPT_DIR/claude-agents" ]]; then
        copy_directory "$SCRIPT_DIR/claude-agents" "$dest_agents" "*.md"
    else
        log_warning "${MSG_AGENTS_NOT_FOUND}"
    fi
}

install_commands() {
    log_info "${MSG_INSTALLING_COMMANDS}"

    # Namespace mapping: SourceDir:target_dir_name
    local namespaces="Common:common Workflow:workflow Team:team QA:qa UIUX:uiux"
    local found_any=false

    # Temporarily set IFS to include space for word splitting
    local OLD_IFS="$IFS"
    IFS=' '
    for ns_pair in $namespaces; do
        local ns_source="${ns_pair%%:*}"
        local ns_target="${ns_pair##*:}"

        local base_commands="$I18N_DIR/base/${ns_source}/commands"
        local lang_commands="$I18N_DIR/$lang/${ns_source}/commands"
        local dest_commands="$target_dir/.claude/commands/${ns_target}"

        # Determine exclusion (add-technology.md only for Common)
        local exclude=""
        if [[ "$ns_source" == "Common" ]]; then
            exclude="add-technology.md"
        fi

        if [[ -d "$base_commands" ]] || [[ -d "$lang_commands" ]]; then
            found_any=true
            if [[ -d "$base_commands" ]]; then
                copy_directory "$base_commands" "$dest_commands" "*.md" "$exclude"
            fi
            if [[ -d "$lang_commands" ]]; then
                copy_directory "$lang_commands" "$dest_commands" "*.md" "$exclude"
            fi
        fi
    done
    IFS="$OLD_IFS"

    if ! $found_any; then
        if [[ -d "$SCRIPT_DIR/claude-commands/common" ]]; then
            copy_directory "$SCRIPT_DIR/claude-commands/common" "$target_dir/.claude/commands/common" "*.md" "add-technology.md"
        else
            log_warning "${MSG_COMMANDS_NOT_FOUND}"
        fi
    fi
}

# Install AgentTeams helper scripts (cost-estimator, ralph-teams-adapter,
# compatibility-check, ...) used by the /team:* commands. They are shipped
# alongside the Team command namespace so /team:sprint etc. find them at
# <project>/Tools/AgentTeams/lib/ instead of warning "scripts MISSING".
install_agentteams() {
    local craft_root
    craft_root="$(cd "$SCRIPT_DIR/../.." && pwd)"
    local src_lib="$craft_root/Tools/AgentTeams/lib"
    local dest_lib="$target_dir/Tools/AgentTeams/lib"

    if [[ ! -d "$src_lib" ]]; then
        log_warning "AgentTeams lib not found at $src_lib (skipping)"
        return 0
    fi

    log_info "${MSG_INSTALLING_AGENTTEAMS:-Installing AgentTeams helper scripts...}"
    copy_directory "$src_lib" "$dest_lib" "*.sh"

    # Some helper scripts ship without the executable bit; ensure +x on copies.
    if ! $dry_run && [[ -d "$dest_lib" ]]; then
        chmod +x "$dest_lib"/*.sh 2>/dev/null || true
    fi
}

install_templates() {
    log_info "${MSG_INSTALLING_TEMPLATES}"

    local base_templates="$I18N_DIR/base/Common/templates"
    local lang_templates="$I18N_DIR/$lang/Common/templates"
    local dest_templates="$target_dir/.github"

    # Determine effective source (lang > base > local)
    local src_templates=""
    if [[ -d "$lang_templates" ]]; then
        src_templates="$lang_templates"
    elif [[ -d "$base_templates" ]]; then
        src_templates="$base_templates"
    elif [[ -d "$SCRIPT_DIR/templates" ]]; then
        src_templates="$SCRIPT_DIR/templates"
    fi

    if [[ -n "$src_templates" ]]; then
        # PR Template (check lang first, then base)
        local pr_template=""
        if [[ -f "$lang_templates/pull-request-template.md" ]]; then
            pr_template="$lang_templates/pull-request-template.md"
        elif [[ -f "$base_templates/pull-request-template.md" ]]; then
            pr_template="$base_templates/pull-request-template.md"
        fi
        if [[ -n "$pr_template" ]]; then
            copy_file "$pr_template" "$dest_templates/PULL_REQUEST_TEMPLATE.md"
        fi

        # Issue Templates (check lang first, then base)
        local issue_dir=""
        if [[ -d "$lang_templates/issue-templates" ]]; then
            issue_dir="$lang_templates/issue-templates"
        elif [[ -d "$base_templates/issue-templates" ]]; then
            issue_dir="$base_templates/issue-templates"
        fi
        if [[ -n "$issue_dir" ]]; then
            copy_directory "$issue_dir" "$dest_templates/ISSUE_TEMPLATE" "*.md"
        fi
    else
        log_warning "${MSG_TEMPLATES_NOT_FOUND}"
    fi
}

install_checklists() {
    log_info "${MSG_INSTALLING_CHECKLISTS}"

    local base_checklists="$I18N_DIR/base/Common/checklists"
    local lang_checklists="$I18N_DIR/$lang/Common/checklists"
    local dest_checklists="$target_dir/.claude/checklists"

    if [[ -d "$base_checklists" ]] || [[ -d "$lang_checklists" ]]; then
        [[ -d "$base_checklists" ]] && copy_directory "$base_checklists" "$dest_checklists" "*.md"
        [[ -d "$lang_checklists" ]] && copy_directory "$lang_checklists" "$dest_checklists" "*.md"
    elif [[ -d "$SCRIPT_DIR/checklists" ]]; then
        copy_directory "$SCRIPT_DIR/checklists" "$dest_checklists" "*.md"
    else
        log_warning "${MSG_CHECKLISTS_NOT_FOUND}"
    fi
}

install_config() {
    log_info "${MSG_INSTALLING_CONFIG:-Installing configuration files...}"

    local base_templates="$I18N_DIR/base/Common/templates"
    local lang_templates="$I18N_DIR/$lang/Common/templates"

    # Install .claudeignore (only if not exists — never overwrite user customizations)
    local claudeignore_src="$base_templates/claudeignore.template"
    local claudeignore_dest="$target_dir/.claudeignore"
    if [[ -f "$claudeignore_src" && ! -f "$claudeignore_dest" ]]; then
        if $dry_run; then
            log_dry_run "${MSG_CREATING:-Creating} .claudeignore"
        else
            cp "$claudeignore_src" "$claudeignore_dest"
            log_success "${MSG_CREATING:-Creating} .claudeignore"
        fi
        ((++files_created))
    fi

    # Install settings.json (only if not exists OR --force)
    local settings_src="$lang_templates/settings.json.template"
    [[ ! -f "$settings_src" ]] && settings_src="$base_templates/settings.json.template"
    local settings_dest="$target_dir/.claude/settings.json"
    if [[ -f "$settings_src" ]]; then
        if [[ ! -f "$settings_dest" ]] || $force; then
            if $dry_run; then
                log_dry_run "${MSG_CREATING:-Creating} .claude/settings.json"
            else
                mkdir -p "$(dirname "$settings_dest")"
                cp "$settings_src" "$settings_dest"
                log_success "${MSG_CREATING:-Creating} .claude/settings.json"
            fi
            ((++files_created))
        else
            log_info "Skipped: .claude/settings.json (already exists, use --force to overwrite)"
            ((++files_skipped))
        fi
    fi

    # Install settings.local.json (only if not exists — never overwrite)
    local local_settings_src="$base_templates/settings.local.json.template"
    local local_settings_dest="$target_dir/.claude/settings.local.json"
    if [[ -f "$local_settings_src" && ! -f "$local_settings_dest" ]]; then
        if $dry_run; then
            log_dry_run "${MSG_CREATING:-Creating} .claude/settings.local.json"
        else
            mkdir -p "$(dirname "$local_settings_dest")"
            cp "$local_settings_src" "$local_settings_dest"
            log_success "${MSG_CREATING:-Creating} .claude/settings.local.json"
        fi
        ((++files_created))
    fi

    # Install context-essentials.md (only if not exists)
    local context_src="$lang_templates/context-essentials.md"
    [[ ! -f "$context_src" ]] && context_src="$base_templates/context-essentials.md"
    local context_dest="$target_dir/.claude/context-essentials.md"
    if [[ -f "$context_src" && ! -f "$context_dest" ]]; then
        if $dry_run; then
            log_dry_run "${MSG_CREATING:-Creating} .claude/context-essentials.md"
        else
            mkdir -p "$(dirname "$context_dest")"
            cp "$context_src" "$context_dest"
            log_success "${MSG_CREATING:-Creating} .claude/context-essentials.md"
        fi
        ((++files_created))
    fi
}

install_claude_md() {
    log_info "${MSG_INSTALLING_CLAUDE_MD:-Installing CLAUDE.md...}"

    # Resolve template with base fallback
    local src_template="$I18N_DIR/$lang/Common/templates/CLAUDE.md.template"
    if [[ ! -f "$src_template" ]]; then
        src_template="$I18N_DIR/base/Common/templates/CLAUDE.md.template"
    fi
    local dest_file="$target_dir/.claude/CLAUDE.md"

    if [[ ! -f "$src_template" ]]; then
        log_warning "${MSG_CLAUDE_MD_NOT_FOUND:-CLAUDE.md template not found}"
        return 0
    fi

    # Only create if doesn't exist (never overwrite user customizations)
    if [[ -f "$dest_file" ]]; then
        if $preserve_config; then
            log_info "Preserved: .claude/CLAUDE.md (--preserve-config)"
            ((++files_skipped))
            return 0
        elif ! $force; then
            log_warning "${MSG_SKIPPING} .claude/CLAUDE.md (use --force to overwrite)"
            ((++files_skipped))
            return 0
        fi
    fi

    # Build technology list
    local tech_list="- Common (agents, commands, skills)"

    # Build agents list (from base + lang overlay, lang takes precedence)
    local agents_list=""
    local -A agents_seen=()
    local agents_dirs=("$I18N_DIR/base/Common/agents" "$I18N_DIR/$lang/Common/agents")
    for src_agents in "${agents_dirs[@]}"; do
        if [[ -d "$src_agents" ]]; then
            while IFS= read -r agent_file; do
                local agent_name
                agent_name=$(grep -m1 "^name:" "$agent_file" 2>/dev/null | sed 's/^name:[[:space:]]*//' | tr -d '"' || true)
                local agent_desc
                agent_desc=$(grep -m1 "^description:" "$agent_file" 2>/dev/null | sed 's/^description:[[:space:]]*//' | tr -d '"' | head -c 60 || true)
                if [[ -n "$agent_name" ]]; then
                    agents_seen["$agent_name"]="- \`@${agent_name}\` - ${agent_desc}\n"
                fi
            done < <(find "$src_agents" -name "*.md" -type f | sort)
        fi
    done
    for key in $(printf '%s\n' "${!agents_seen[@]}" | sort); do
        agents_list="${agents_list}${agents_seen[$key]}"
    done

    # Build commands list (from all namespaces, base + lang overlay per namespace)
    local commands_list=""
    local -A cmds_seen=()
    local ns_pair
    for ns_pair in Common:common Workflow:workflow Team:team QA:qa UIUX:uiux; do
        local ns_source="${ns_pair%%:*}"
        local ns_prefix="${ns_pair##*:}"
        local cmd_dirs=("$I18N_DIR/base/${ns_source}/commands" "$I18N_DIR/$lang/${ns_source}/commands")
        for src_commands in "${cmd_dirs[@]}"; do
            if [[ -d "$src_commands" ]]; then
                while IFS= read -r cmd_file; do
                    local cmd_name
                    cmd_name=$(basename "$cmd_file" .md)
                    # Exclude add-technology (claude-craft internal command, Common only)
                    if [[ "$ns_source" == "Common" && "$cmd_name" == "add-technology" ]]; then
                        continue
                    fi
                    local cmd_desc
                    cmd_desc=$(grep -m1 "^description:" "$cmd_file" 2>/dev/null | sed 's/^description:[[:space:]]*//' | tr -d '"' | head -c 60 || true)
                    if [[ -n "$cmd_desc" ]]; then
                        cmds_seen["${ns_prefix}:${cmd_name}"]="- \`/${ns_prefix}:${cmd_name}\` - ${cmd_desc}\n"
                    fi
                done < <(find "$src_commands" -name "*.md" -type f | sort)
            fi
        done
    done
    for key in $(printf '%s\n' "${!cmds_seen[@]}" | sort); do
        commands_list="${commands_list}${cmds_seen[$key]}"
    done

    # Create destination directory
    if $dry_run; then
        log_dry_run "${MSG_CREATING} .claude/CLAUDE.md"
        ((++files_created))
        return 0
    fi

    mkdir -p "$(dirname "$dest_file")"

    # Get project info for placeholders
    local project_name
    project_name=$(basename "$target_dir")
    local generation_date
    generation_date=$(date +%Y-%m-%d)
    local project_root
    project_root=$(basename "$target_dir")

    # Copy template and replace placeholders using awk (handles multiline better than sed)
    awk -v tech="$tech_list" -v agents="$agents_list" -v commands="$commands_list" \
        -v project_name="$project_name" -v gen_date="$generation_date" \
        -v version="$VERSION" -v project_root="$project_root" '
    {
        gsub(/\{\{PROJECT_NAME\}\}/, project_name)
        gsub(/\{\{GENERATION_DATE\}\}/, gen_date)
        gsub(/\{\{VERSION\}\}/, version)
        gsub(/\{\{PROJECT_ROOT\}\}/, project_root)
        gsub(/{TECH_LIST}/, tech)
        gsub(/{AGENTS_LIST}/, agents)
        gsub(/{COMMANDS_LIST}/, commands)
        # Convert literal \n to actual newlines
        gsub(/\\n/, "\n")
        print
    }' "$src_template" > "$dest_file"

    log_success "${MSG_CREATING} .claude/CLAUDE.md"
    ((++files_created))
}

#-------------------------------------------------------------------------------
# Interactive mode
#-------------------------------------------------------------------------------
run_interactive() {
    echo ""
    echo "Interactive mode - Choose components to install:"
    echo ""

    local install_agents_choice=false
    local install_commands_choice=false
    local install_templates_choice=false
    local install_checklists_choice=false

    read -p "Install common agents? (y/n) [y]: " choice
    [[ "$choice" != "n" && "$choice" != "N" ]] && install_agents_choice=true

    read -p "Install /common: commands? (y/n) [y]: " choice
    [[ "$choice" != "n" && "$choice" != "N" ]] && install_commands_choice=true

    read -p "Install PR/Issues templates? (y/n) [y]: " choice
    [[ "$choice" != "n" && "$choice" != "N" ]] && install_templates_choice=true

    read -p "Install checklists? (y/n) [y]: " choice
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
    parse_args "$@"
    print_header

    log_info "Target directory: $target_dir"
    log_info "Action: $action"

    if $dry_run; then
        log_info "Mode: Dry-run (no changes)"
    fi

    if $interactive; then
        run_interactive
    fi

    echo ""

    # Install selected components
    if $rules_only; then
        install_rules
    fi

    if $agents_only; then
        install_agents
    fi

    if $commands_only; then
        install_commands
        install_agentteams
    fi

    if $templates_only; then
        install_templates
    fi

    if $checklists_only; then
        install_checklists
    fi

    # Always install config and CLAUDE.md template (if rules are installed)
    if $rules_only; then
        install_config
        install_claude_md
    fi

    # Copy AGENTS.md template to target root (idempotent — won't overwrite existing)
    local agents_template
    agents_template="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../.claude/templates/AGENTS.md.template"
    local agents_target="$target_dir/AGENTS.md"
    if [[ -f "$agents_template" && ! -f "$agents_target" ]]; then
        if $dry_run; then
            log_dry_run "Would create $agents_target from AGENTS.md.template"
        else
            cp "$agents_template" "$agents_target"
            log_success "[install-common-rules] Created $agents_target from template"
            ((++files_created))
        fi
    elif [[ -f "$agents_target" ]]; then
        log_info "[install-common-rules] AGENTS.md exists at $agents_target (not overwritten)"
        ((++files_skipped))
    fi

    print_summary

    # Exit code
    if [[ $errors -gt 0 ]]; then
        exit 1
    fi

    exit 0
}

# Execute
main "$@"
