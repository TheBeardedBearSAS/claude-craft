#!/bin/bash
# ============================================================================
# install-common.sh - Shared library for Claude Craft installation scripts
# Version: 1.0.0
#
# This library provides common functions used by all technology-specific
# installation scripts to reduce code duplication.
#
# Usage: source this file from install-*-rules.sh scripts
#   source "$SCRIPT_DIR/lib/install-common.sh"
#
# Required variables (must be set before sourcing):
#   - SCRIPT_DIR: Directory of the calling script
#   - I18N_DIR: Path to i18n directory
#   - TECH_NAME: Technology name (e.g., "React", "Flutter")
#   - TECH_NAMESPACE: Command namespace (e.g., "react", "flutter")
#   - DEFAULT_STACK: Default tech stack description
#   - TECH_RULES: Array of tech-specific rules
#   - lang: Current language (default: "en")
# ============================================================================

# ============================================================================
# COLORS
# ============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_dry_run() { echo -e "${YELLOW}[DRY-RUN]${NC} $1"; }

# ============================================================================
# I18N SUPPORT
# ============================================================================
load_messages() {
    local lang_file="$I18N_DIR/messages/${lang}.sh"
    if [[ -f "$lang_file" ]]; then
        # shellcheck source=/dev/null
        source "$lang_file"
    elif [[ -f "$I18N_DIR/messages/en.sh" ]]; then
        # shellcheck source=/dev/null
        source "$I18N_DIR/messages/en.sh"
    fi
}

# ============================================================================
# SOURCE DIRECTORY RESOLUTION
# ============================================================================
get_source_dir() {
    local i18n_src="$I18N_DIR/$lang/$TECH_NAME"
    if [[ -d "$i18n_src" ]]; then
        echo "$i18n_src"
    else
        echo "$SCRIPT_DIR"
    fi
}

# ============================================================================
# VERIFICATION
# ============================================================================
verify_source_files() {
    local missing=0
    local src_dir
    src_dir=$(get_source_dir)

    for rule in "${TECH_RULES[@]}"; do
        if [[ ! -f "${src_dir}/rules/${rule}" ]]; then
            log_error "Missing source file: rules/${rule}"
            missing=1
        fi
    done
    if [[ ! -f "${src_dir}/CLAUDE.md.template" ]]; then
        log_error "Missing source file: CLAUDE.md.template"
        missing=1
    fi
    if [[ $missing -eq 1 ]]; then exit 1; fi
}

detect_installation() {
    local target_dir="$1"
    if [[ -d "${target_dir}/.claude" ]]; then
        if [[ -f "${target_dir}/.claude/rules/00-project-context.md" ]]; then
            echo "existing"
        else
            echo "partial"
        fi
    else
        echo "none"
    fi
}

# ============================================================================
# BACKUP
# ============================================================================
create_backup() {
    local target_dir="$1"
    local dry_run="$2"
    local backup_dir="${target_dir}/.claude-backup-$(date +%Y%m%d-%H%M%S)"
    if [[ -d "${target_dir}/.claude" ]]; then
        if [[ "$dry_run" == "true" ]]; then
            log_dry_run "Backup: ${backup_dir}"
        else
            cp -r "${target_dir}/.claude" "${backup_dir}"
            log_success "Backup created: ${backup_dir}"
        fi
    fi
}

# ============================================================================
# DIRECTORY STRUCTURE
# ============================================================================
create_directory_structure() {
    local target_dir="$1"
    local dry_run="$2"
    local dirs=(
        ".claude"
        ".claude/rules"
        ".claude/skills"
        ".claude/templates"
        ".claude/checklists"
        ".claude/examples"
        ".claude/commands/${TECH_NAMESPACE}"
        ".claude/agents"
    )
    for dir in "${dirs[@]}"; do
        if [[ "$dry_run" == "true" ]]; then
            log_dry_run "Create directory: ${target_dir}/${dir}"
        else
            mkdir -p "${target_dir}/${dir}"
        fi
    done
}

# ============================================================================
# COPY FUNCTIONS
# ============================================================================

# Copy skills from Common/
copy_generic_skills() {
    local target_dir="$1"
    local dry_run="$2"
    local common_skills_dir="$I18N_DIR/$lang/Common/skills"

    if [[ ! -d "$common_skills_dir" ]]; then
        return 0
    fi

    local count=0
    while IFS= read -r -d '' skill_dir; do
        local skill_name
        skill_name=$(basename "$skill_dir")
        local dest_dir="${target_dir}/.claude/skills/${skill_name}"

        if [[ "$dry_run" == "true" ]]; then
            log_dry_run "Copy skill: skills/${skill_name}/"
        else
            mkdir -p "$dest_dir"
            cp "$skill_dir"/*.md "$dest_dir/" 2>/dev/null || true
        fi
        ((count++)) || true
    done < <(find "$common_skills_dir" -mindepth 1 -maxdepth 1 -type d -print0)

    if [[ "$dry_run" == "false" ]] && [[ $count -gt 0 ]]; then
        log_success "$count generic skills copied from Common/"
    fi
}

# Copy legacy rules from Common/
copy_generic_rules() {
    local target_dir="$1"
    local dry_run="$2"

    # First install skills (new format)
    copy_generic_skills "$target_dir" "$dry_run"

    # Then install legacy rules
    local common_rules_dir="$I18N_DIR/$lang/Common/rules"

    if [[ ! -d "$common_rules_dir" ]]; then
        return 0
    fi

    local count=0
    for file in "$common_rules_dir"/*.md "$common_rules_dir"/*.md.template; do
        [[ -f "$file" ]] || continue
        local filename
        filename=$(basename "$file")
        if [[ "$dry_run" == "true" ]]; then
            log_dry_run "Copy generic: rules/$filename"
        else
            cp "$file" "${target_dir}/.claude/rules/$filename"
        fi
        ((count++)) || true
    done

    if [[ "$dry_run" == "false" ]] && [[ $count -gt 0 ]]; then
        log_success "$count generic rules copied from Common/"
    fi
}

# Copy tech-specific skills
copy_tech_skills() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local tech_skills_dir="${src_dir}/skills"

    if [[ ! -d "$tech_skills_dir" ]]; then
        return 0
    fi

    local count=0
    while IFS= read -r -d '' skill_dir; do
        local skill_name
        skill_name=$(basename "$skill_dir")
        local dest_dir="${target_dir}/.claude/skills/${skill_name}"

        if [[ "$dry_run" == "true" ]]; then
            log_dry_run "Copy skill: skills/${skill_name}/"
        else
            mkdir -p "$dest_dir"
            cp "$skill_dir"/*.md "$dest_dir/" 2>/dev/null || true
        fi
        ((count++)) || true
    done < <(find "$tech_skills_dir" -mindepth 1 -maxdepth 1 -type d -print0)

    if [[ "$dry_run" == "false" ]] && [[ $count -gt 0 ]]; then
        log_success "$count ${TECH_NAME}-specific skills copied"
    fi
}

# Copy all rules (generic + tech-specific)
copy_common_rules() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)

    # First, install generic rules and skills
    copy_generic_rules "$target_dir" "$dry_run"

    # Install tech-specific skills
    copy_tech_skills "$target_dir" "$dry_run"

    # Install tech-specific rules (backward compatibility)
    local count=0
    for rule in "${TECH_RULES[@]}"; do
        local src_file="${src_dir}/rules/${rule}"
        # Fallback to local if i18n not available
        if [[ ! -f "$src_file" ]]; then
            src_file="${SCRIPT_DIR}/rules/${rule}"
        fi
        if [[ ! -f "$src_file" ]]; then
            log_warning "Rule not found: $rule"
            continue
        fi
        if [[ "$dry_run" == "true" ]]; then
            log_dry_run "Copy: rules/${rule}"
        else
            cp "$src_file" "${target_dir}/.claude/rules/${rule}"
        fi
        ((count++)) || true
    done
    if [[ "$dry_run" == "false" ]] && [[ $count -gt 0 ]]; then
        log_success "$count ${TECH_NAME}-specific rules copied"
    fi
}

copy_templates() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local tmpl_dir="${src_dir}/templates"
    if [[ ! -d "$tmpl_dir" ]]; then
        tmpl_dir="${SCRIPT_DIR}/templates"
    fi

    if [[ "$dry_run" == "true" ]]; then
        log_dry_run "Copy: templates/*.md"
    else
        cp "${tmpl_dir}/"*.md "${target_dir}/.claude/templates/" 2>/dev/null || true
        log_success "Templates copied"
    fi
}

copy_checklists() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local chk_dir="${src_dir}/checklists"
    if [[ ! -d "$chk_dir" ]]; then
        chk_dir="${SCRIPT_DIR}/checklists"
    fi

    if [[ "$dry_run" == "true" ]]; then
        log_dry_run "Copy: checklists/*.md"
    else
        cp "${chk_dir}/"*.md "${target_dir}/.claude/checklists/" 2>/dev/null || true
        log_success "Checklists copied"
    fi
}

copy_commands() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local cmd_dir="${src_dir}/commands"
    if [[ ! -d "$cmd_dir" ]]; then
        cmd_dir="${SCRIPT_DIR}/claude-commands/${TECH_NAMESPACE}"
    fi

    if [[ -d "$cmd_dir" ]]; then
        if [[ "$dry_run" == "true" ]]; then
            log_dry_run "Copy: commands/${TECH_NAMESPACE}/*.md"
        else
            cp "${cmd_dir}/"*.md "${target_dir}/.claude/commands/${TECH_NAMESPACE}/" 2>/dev/null || true
            local files=( "${cmd_dir}/"*.md )
            local count=${#files[@]}
            log_success "${count} commands copied (/${TECH_NAMESPACE}:*)"
        fi
    fi
}

copy_agents() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local agt_dir="${src_dir}/agents"
    if [[ ! -d "$agt_dir" ]]; then
        agt_dir="${SCRIPT_DIR}/claude-agents"
    fi

    if [[ -d "$agt_dir" ]]; then
        if [[ "$dry_run" == "true" ]]; then
            log_dry_run "Copy: agents/*.md"
        else
            cp "${agt_dir}/"*.md "${target_dir}/.claude/agents/" 2>/dev/null || true
            local files=( "${agt_dir}/"*.md )
            local count=${#files[@]}
            log_success "${count} agents copied"
        fi
    fi
}

# ============================================================================
# INTERACTIVE MODE
# ============================================================================
prompt_project_info() {
    echo ""
    echo "Configuration du projet ${TECH_NAME}"
    echo "=========================================="
    read -rp "Project name [MyProject]: " PROJECT_NAME
    PROJECT_NAME="${PROJECT_NAME:-MyProject}"
    read -rp "Tech stack [${DEFAULT_STACK}]: " TECH_STACK
    TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"
    echo ""
    read -rp "Confirm? [Y/n]: " CONFIRM
    if [[ ! "${CONFIRM:-Y}" =~ ^[Yy]$ ]]; then
        log_warning "Installation cancelled"
        exit 0
    fi
}

# ============================================================================
# TEMPLATE PROCESSING
# ============================================================================
process_templates() {
    local target_dir="$1"
    local project_name="$2"
    local tech_stack="$3"
    local dry_run="$4"
    local generation_date
    generation_date=$(date +%Y-%m-%d)
    local src_dir
    src_dir=$(get_source_dir)

    if [[ "$dry_run" == "true" ]]; then
        log_dry_run "Generate CLAUDE.md and 00-project-context.md"
    else
        sed -e "s/{{PROJECT_NAME}}/${project_name}/g" \
            -e "s/{{TECH_STACK}}/${tech_stack}/g" \
            -e "s/{{GENERATION_DATE}}/${generation_date}/g" \
            "${src_dir}/CLAUDE.md.template" > "${target_dir}/.claude/CLAUDE.md"

        sed -e "s/{{PROJECT_NAME}}/${project_name}/g" \
            -e "s/{{TECH_STACK}}/${tech_stack}/g" \
            "${src_dir}/rules/00-project-context.md.template" > "${target_dir}/.claude/rules/00-project-context.md"

        log_success "CLAUDE.md and 00-project-context.md generated"
    fi
}

# ============================================================================
# MAIN INSTALLATION LOGIC
# ============================================================================
# This function can be called from tech scripts after setting up variables
run_installation() {
    local mode="$1"
    local force="$2"
    local dry_run="$3"
    local backup="$4"
    local interactive="$5"
    local target_dir="$6"

    # Create backup if requested
    if [[ "$backup" == "true" ]] || [[ "$force" == "true" ]]; then
        create_backup "$target_dir" "$dry_run"
    fi

    case $mode in
        install)
            if [[ "$interactive" == "true" ]]; then
                prompt_project_info
            else
                PROJECT_NAME="${PROJECT_NAME:-MyProject}"
                TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"
            fi
            create_directory_structure "$target_dir" "$dry_run"
            copy_common_rules "$target_dir" "$dry_run"
            copy_templates "$target_dir" "$dry_run"
            copy_checklists "$target_dir" "$dry_run"
            copy_commands "$target_dir" "$dry_run"
            copy_agents "$target_dir" "$dry_run"
            process_templates "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run"
            ;;
        update)
            if [[ "$force" == "true" ]]; then
                log_warning "Force mode: ALL files will be overwritten"
                if [[ "$interactive" == "true" ]]; then
                    prompt_project_info
                else
                    PROJECT_NAME="${PROJECT_NAME:-MyProject}"
                    TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"
                fi
                create_directory_structure "$target_dir" "$dry_run"
                copy_common_rules "$target_dir" "$dry_run"
                copy_templates "$target_dir" "$dry_run"
                copy_checklists "$target_dir" "$dry_run"
                copy_commands "$target_dir" "$dry_run"
                copy_agents "$target_dir" "$dry_run"
                process_templates "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run"
            else
                log_info "Updating common rules..."
                create_directory_structure "$target_dir" "$dry_run"
                copy_common_rules "$target_dir" "$dry_run"
                copy_templates "$target_dir" "$dry_run"
                copy_checklists "$target_dir" "$dry_run"
                copy_commands "$target_dir" "$dry_run"
                copy_agents "$target_dir" "$dry_run"
                log_info "Preserved files: 00-project-context.md, CLAUDE.md"
            fi
            ;;
    esac
}

# ============================================================================
# ARGUMENT PARSING
# ============================================================================
parse_args() {
    local -n _mode=$1
    local -n _force=$2
    local -n _dry_run=$3
    local -n _backup=$4
    local -n _interactive=$5
    local -n _target_dir=$6
    shift 6

    _mode=""
    _force="false"
    _dry_run="false"
    _backup="false"
    _interactive="false"
    _target_dir="."

    while [[ $# -gt 0 ]]; do
        case $1 in
            --install) _mode="install"; shift ;;
            --update) _mode="update"; shift ;;
            --force) _force="true"; shift ;;
            --dry-run) _dry_run="true"; shift ;;
            --backup) _backup="true"; shift ;;
            --interactive) _interactive="true"; shift ;;
            --lang=*) lang="${1#--lang=}"; shift ;;
            --version) echo "install-${TECH_NAMESPACE}-rules.sh version ${VERSION}"; exit 0 ;;
            --help|-h) show_help; exit 0 ;;
            -*) log_error "Unknown option: $1"; exit 1 ;;
            *) _target_dir="$1"; shift ;;
        esac
    done
}
