#!/bin/bash
# Shared library for tech install scripts (install-{tech}-rules.sh)
# Sourced by thin wrappers that define tech-specific variables before sourcing.
#
# Required variables (set by wrapper before sourcing):
#   SCRIPT_DIR, I18N_DIR, TECH_NAME, TECH_DISPLAY_NAME, TECH_NAMESPACE,
#   DEFAULT_STACK, VERSION, TECH_RULE_MAPPINGS, TECH_RULES,
#   HELP_DESCRIPTION, AVAILABLE_COMMANDS, ARCHITECTURE_SUMMARY,
#   CODING_STANDARDS_SUMMARY, TESTING_STACK, TECH_REFERENCES, FILE_CONTEXTS
#
# Optional variables (with defaults):
#   TECH_2026_REFS=()              - Array of 2026 reference files
#   TECH_2026_REFS_SRC_DIR=""      - Source dir for 2026 refs (auto-derived if empty)
#   TECH_EXTRA_SED_ARGS=()         - Extra sed arguments for project-context.md
#   TECH_VERIFY_FILE="CLAUDE.md.template" - File to verify in verify_source_files()

# shellcheck disable=SC2154

# --- Caller script name (for --version and --help) ---
_CALLER_SCRIPT="$(basename "${BASH_SOURCE[1]}")"

# --- Default optional variables ---
[[ -v TECH_2026_REFS ]] || TECH_2026_REFS=()
[[ -v TECH_EXTRA_SED_ARGS ]] || TECH_EXTRA_SED_ARGS=()
: "${TECH_VERIFY_FILE:=CLAUDE.md.template}"

# --- Default lang ---
lang="en"

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# LOAD I18N MESSAGES
# ============================================================================
load_messages() {
    local lang_file="$I18N_DIR/messages/${lang}.sh"
    if [[ -f "$lang_file" ]]; then
        # shellcheck disable=SC1090
        source "$lang_file"
    elif [[ -f "$I18N_DIR/messages/en.sh" ]]; then
        # shellcheck disable=SC1090
        source "$I18N_DIR/messages/en.sh"
    fi
}

show_help() {
    cat << EOF
Usage: ${_CALLER_SCRIPT} [OPTIONS] [PROJECT_DIR]

Install/update Claude Code rules for ${TECH_DISPLAY_NAME} projects.
Uses TCL (Tiered Context Loading) architecture to optimize tokens.

Options:
    --install       Full installation
    --update        Update common rules only
    --force         Overwrite all files (automatic backup)
    --preserve-config  Preserve CLAUDE.md and INDEX.md with --force
    --dry-run       Show actions without executing them
    --backup        Create backup before changes
    --interactive   Prompt for project values
    --lang=XX       Language for rules (en, fr, es, de, pt)
    --version       Show version
    --help          Show this help

Description:
${HELP_DESCRIPTION}
EOF
}

# ============================================================================
# LOGGING
# ============================================================================
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_dry_run() { echo -e "${YELLOW}[DRY-RUN]${NC} $1"; }

# ============================================================================
# SOURCE RESOLUTION
# ============================================================================
get_source_dir() {
    local i18n_src="$I18N_DIR/$lang/$TECH_NAME"
    if [[ -d "$i18n_src" ]]; then
        echo "$i18n_src"
    else
        echo "$SCRIPT_DIR"
    fi
}

verify_source_files() {
    local missing=0
    local src_dir
    src_dir=$(get_source_dir)

    for rule in "${TECH_RULES[@]}"; do
        if [ ! -f "${src_dir}/rules/${rule}" ]; then
            log_error "Missing source file: rules/${rule}"
            missing=1
        fi
    done
    if [ ! -f "${src_dir}/${TECH_VERIFY_FILE}" ]; then
        log_error "Missing source file: ${TECH_VERIFY_FILE}"
        missing=1
    fi
    if [ $missing -eq 1 ]; then exit 1; fi
}

# ============================================================================
# INSTALLATION DETECTION
# ============================================================================
detect_installation() {
    local target_dir="$1"
    if [ -d "${target_dir}/.claude" ]; then
        if [ -d "${target_dir}/.claude/references/${TECH_NAMESPACE}" ]; then
            echo "tcl"
        elif [ -f "${target_dir}/.claude/rules/00-project-context.md" ]; then
            echo "legacy"
        else
            echo "partial"
        fi
    else
        echo "none"
    fi
}

create_backup() {
    local target_dir="$1"
    local dry_run="$2"
    local backup_dir="${target_dir}/.claude-backup-$(date +%Y%m%d-%H%M%S)"
    if [ -d "${target_dir}/.claude" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Backup: ${backup_dir}"
        else
            cp -r "${target_dir}/.claude" "${backup_dir}"
            log_success "Backup created: ${backup_dir}"
        fi
    fi
}

# ============================================================================
# COPY FUNCTIONS
# ============================================================================

# Copy generic skills from Common/
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

        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy skill: skills/${skill_name}/"
        else
            mkdir -p "$dest_dir"
            cp "$skill_dir"/*.md "$dest_dir/" 2>/dev/null || true
        fi
        ((count++)) || true
    done < <(find "$common_skills_dir" -mindepth 1 -maxdepth 1 -type d -print0)

    if [ "$dry_run" = "false" ] && [ $count -gt 0 ]; then
        log_success "$count generic skills copied from Common/"
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

        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy skill: skills/${skill_name}/"
        else
            mkdir -p "$dest_dir"
            cp "$skill_dir"/*.md "$dest_dir/" 2>/dev/null || true
        fi
        ((count++)) || true
    done < <(find "$tech_skills_dir" -mindepth 1 -maxdepth 1 -type d -print0)

    if [ "$dry_run" = "false" ] && [ $count -gt 0 ]; then
        log_success "$count ${TECH_DISPLAY_NAME}-specific skills copied"
    fi
}

copy_templates() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local tmpl_dir="${src_dir}/templates"
    if [ ! -d "$tmpl_dir" ]; then
        tmpl_dir="${SCRIPT_DIR}/templates"
    fi

    if [ -d "$tmpl_dir" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: templates/*.md"
        else
            cp "${tmpl_dir}/"*.md "${target_dir}/.claude/templates/" 2>/dev/null || true
            log_success "Templates copied"
        fi
    fi
}

copy_checklists() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local chk_dir="${src_dir}/checklists"
    if [ ! -d "$chk_dir" ]; then
        chk_dir="${SCRIPT_DIR}/checklists"
    fi

    if [ -d "$chk_dir" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: checklists/*.md"
        else
            cp "${chk_dir}/"*.md "${target_dir}/.claude/checklists/" 2>/dev/null || true
            log_success "Checklists copied"
        fi
    fi
}

copy_commands() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)
    local cmd_dir="${src_dir}/commands"
    if [ ! -d "$cmd_dir" ]; then
        cmd_dir="${SCRIPT_DIR}/claude-commands/${TECH_NAMESPACE}"
    fi

    if [ -d "$cmd_dir" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: commands/${TECH_NAMESPACE}/*.md"
        else
            cp "${cmd_dir}/"*.md "${target_dir}/.claude/commands/${TECH_NAMESPACE}/" 2>/dev/null || true
            local count
            count=$(ls -1 "${cmd_dir}/"*.md 2>/dev/null | wc -l)
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
    if [ ! -d "$agt_dir" ]; then
        agt_dir="${SCRIPT_DIR}/claude-agents"
    fi

    if [ -d "$agt_dir" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: agents/*.md"
        else
            cp "${agt_dir}/"*.md "${target_dir}/.claude/agents/" 2>/dev/null || true
            log_success "Agents copied"
        fi
    fi
}

# ============================================================================
# INTERACTIVE PROMPT
# ============================================================================
prompt_project_info() {
    echo ""
    echo "Project configuration - ${TECH_DISPLAY_NAME}"
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
# TCL INSTALLATION
# ============================================================================
install_tcl() {
    local target_dir="$1"
    local project_name="$2"
    local tech_stack="$3"
    local dry_run="$4"
    local preserve_config="${5:-false}"
    local skip_common="${6:-false}"
    local src_dir
    src_dir=$(get_source_dir)

    # 1. Create TCL directory structure
    create_tcl_directory_structure "$target_dir" "$TECH_NAMESPACE" "$dry_run"

    # 2. Copy base references (universal principles)
    if [ "$skip_common" = "false" ]; then
        copy_base_references "$target_dir" "$I18N_DIR" "$lang" "$dry_run"
    fi

    # 3. Copy tech-specific references
    copy_tech_references "$target_dir" "$src_dir" "$TECH_NAMESPACE" "$dry_run" "${TECH_RULE_MAPPINGS[@]}"

    # 3b. Copy 2026 feature references (if any)
    if [[ ${#TECH_2026_REFS[@]} -gt 0 ]] && [ "$dry_run" = "false" ]; then
        local refs_2026_src="${TECH_2026_REFS_SRC_DIR:-${SCRIPT_DIR}/../../.claude/references/${TECH_NAMESPACE}}"
        local refs_2026_dst="${target_dir}/.claude/references/${TECH_NAMESPACE}"
        local count_2026=0
        for ref_file in "${TECH_2026_REFS[@]}"; do
            if [ -f "${refs_2026_src}/${ref_file}" ]; then
                cp "${refs_2026_src}/${ref_file}" "${refs_2026_dst}/"
                ((count_2026++)) || true
            fi
        done
        if [ $count_2026 -gt 0 ]; then
            log_success "${count_2026} 2026 feature references copied"
        fi
    fi

    # 4. Copy project context template
    if [ "$dry_run" = "false" ]; then
        local ctx_template="${src_dir}/rules/00-project-context.md.template"
        if [ -f "$ctx_template" ]; then
            local sed_args=(-e "s/{{PROJECT_NAME}}/${project_name}/g" -e "s/{{TECH_STACK}}/${tech_stack}/g")
            if [[ ${#TECH_EXTRA_SED_ARGS[@]} -gt 0 ]]; then
                sed_args+=("${TECH_EXTRA_SED_ARGS[@]}")
            fi
            sed "${sed_args[@]}" "$ctx_template" > "${target_dir}/.claude/references/${TECH_NAMESPACE}/project-context.md"
            log_success "project-context.md generated"
        fi
    fi

    # 5. Copy skills
    if [ "$skip_common" = "false" ]; then
        copy_generic_skills "$target_dir" "$dry_run"
    fi
    copy_tech_skills "$target_dir" "$dry_run"

    # 6. Copy templates, checklists, commands, agents
    copy_templates "$target_dir" "$dry_run"
    copy_checklists "$target_dir" "$dry_run"
    copy_commands "$target_dir" "$dry_run"
    copy_agents "$target_dir" "$dry_run"

    # 7. Generate minimal CLAUDE.md
    generate_minimal_claude_md "$target_dir" "$project_name" "$TECH_DISPLAY_NAME" \
        "$tech_stack" "$TECH_NAMESPACE" "$AVAILABLE_COMMANDS" "$dry_run" "$preserve_config"

    # 8. Generate INDEX.md
    generate_index_md "$target_dir" "$TECH_DISPLAY_NAME" "$tech_stack" "$TECH_NAMESPACE" \
        "$ARCHITECTURE_SUMMARY" "$CODING_STANDARDS_SUMMARY" "$TESTING_STACK" \
        "$TECH_REFERENCES" "$dry_run" "$preserve_config"

    # 9. Generate context.yaml
    generate_context_yaml "$target_dir" "$FILE_CONTEXTS" "$dry_run" "$preserve_config"
}

# ============================================================================
# MAIN CLI
# ============================================================================
main() {
    local mode="" force="false" dry_run="false" backup="false" interactive="false" preserve_config="false" skip_common="false" target_dir="."

    while [[ $# -gt 0 ]]; do
        case $1 in
            --install) mode="install"; shift ;;
            --update) mode="update"; shift ;;
            --force) force="true"; shift ;;
            --preserve-config) preserve_config="true"; shift ;;
            --dry-run) dry_run="true"; shift ;;
            --backup) backup="true"; shift ;;
            --skip-common) skip_common="true"; shift ;;
            --interactive) interactive="true"; shift ;;
            --lang=*) lang="${1#--lang=}"; shift ;;
            --version) echo "${_CALLER_SCRIPT} version ${VERSION}"; exit 0 ;;
            --help|-h) show_help; exit 0 ;;
            -*) log_error "Unknown option: $1"; exit 1 ;;
            *) target_dir="$1"; shift ;;
        esac
    done

    load_messages

    [ "$target_dir" != "." ] && [ -d "$target_dir" ] && target_dir="$(cd "${target_dir}" && pwd)" || target_dir="$(pwd)"

    echo ""
    echo "Installing Claude Code rules - ${TECH_DISPLAY_NAME} (TCL)"
    echo "=========================================="
    echo "Version: ${VERSION}"
    echo "Directory: ${target_dir}"

    verify_source_files

    if [ -z "$mode" ]; then
        case $(detect_installation "$target_dir") in
            tcl) log_info "Existing TCL installation -> update mode"; mode="update" ;;
            legacy) log_info "Legacy installation detected -> TCL migration"; mode="install" ;;
            *) log_info "New TCL installation"; mode="install" ;;
        esac
    fi

    [ "$backup" = "true" ] || [ "$force" = "true" ] && create_backup "$target_dir" "$dry_run"

    case $mode in
        install)
            [ "$interactive" = "true" ] && prompt_project_info || { PROJECT_NAME="${PROJECT_NAME:-MyProject}"; TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"; }
            install_tcl "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run" "$preserve_config" "$skip_common"
            ;;
        update)
            if [ "$force" = "true" ]; then
                log_warning "Force mode: ALL files will be overwritten"
                [ "$interactive" = "true" ] && prompt_project_info || { PROJECT_NAME="${PROJECT_NAME:-MyProject}"; TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"; }
                install_tcl "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run" "$preserve_config" "$skip_common"
            else
                log_info "Updating references..."
                PROJECT_NAME="${PROJECT_NAME:-MyProject}"
                TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"
                install_tcl "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run" "true" "$skip_common"
            fi
            ;;
    esac

    if [ "$dry_run" = "false" ]; then
        show_tcl_summary "$target_dir" "$TECH_DISPLAY_NAME" "$TECH_NAMESPACE"
    else
        log_dry_run "End of simulation"
    fi
}

# Entry point called by wrappers
run_tech_install() {
    main "$@"
}
