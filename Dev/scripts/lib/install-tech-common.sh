#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

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

# --- Shared UI (colors + logging) ---
# shellcheck source=shell-ui.sh
source "$(dirname "${BASH_SOURCE[0]}")/shell-ui.sh"

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
# LOGGING (backward-compat aliases → shell-ui.sh)
# ============================================================================
log_info() { ui_info "$@"; }
log_success() { ui_success "$@"; }
log_warning() { ui_warning "$@"; }
log_error() { ui_error "$@"; }
log_dry_run() { ui_dry_run "$@"; }

# ============================================================================
# SOURCE RESOLUTION
# ============================================================================
get_source_dir() {
    local i18n_src="$I18N_DIR/$lang/$TECH_NAME"
    local base_src="$I18N_DIR/base/$TECH_NAME"
    if [[ -d "$i18n_src" ]]; then
        echo "$i18n_src"
    elif [[ -d "$base_src" ]]; then
        echo "$base_src"
    else
        echo "$SCRIPT_DIR"
    fi
}

# Copy files from i18n with base fallback (base first, then lang overlay)
# Usage: copy_i18n_files "Common/skills" "$dest_dir" "*.md"
copy_i18n_files() {
    local subpath="$1"
    local dest="$2"
    local pattern="${3:-*}"
    local base_dir="$I18N_DIR/base/$subpath"
    local lang_dir="$I18N_DIR/$lang/$subpath"

    if [[ -d "$base_dir" ]]; then
        find "$base_dir" -maxdepth 1 -name "$pattern" -type f -exec cp {} "$dest/" \; 2>/dev/null || true
    fi
    # Lang overlay: overrides base files if both exist
    if [[ -d "$lang_dir" ]]; then
        find "$lang_dir" -maxdepth 1 -name "$pattern" -type f -exec cp {} "$dest/" \; 2>/dev/null || true
    fi
}

# Copy directory recursively from i18n with base fallback
# Usage: copy_i18n_dir "Common/skills" "$dest_dir"
copy_i18n_dir() {
    local subpath="$1"
    local dest="$2"
    local base_dir="$I18N_DIR/base/$subpath"
    local lang_dir="$I18N_DIR/$lang/$subpath"

    if [[ -d "$base_dir" ]]; then
        cp -r "$base_dir/"* "$dest/" 2>/dev/null || true
    fi
    if [[ -d "$lang_dir" ]]; then
        cp -r "$lang_dir/"* "$dest/" 2>/dev/null || true
    fi
}

# Resolve i18n file path with base fallback
# Usage: resolve_i18n_file "Common/templates/CLAUDE.md.template"
resolve_i18n_file() {
    local subpath="$1"
    local lang_file="$I18N_DIR/$lang/$subpath"
    local base_file="$I18N_DIR/base/$subpath"

    if [[ -f "$lang_file" ]]; then
        echo "$lang_file"
    elif [[ -f "$base_file" ]]; then
        echo "$base_file"
    else
        echo ""
    fi
}

# Check if i18n directory exists in either lang or base
# Usage: i18n_dir_exists "Common/skills"
i18n_dir_exists() {
    local subpath="$1"
    [[ -d "$I18N_DIR/$lang/$subpath" ]] || [[ -d "$I18N_DIR/base/$subpath" ]]
}

verify_source_files() {
    local missing=0
    local src_dir
    src_dir=$(get_source_dir)

    for rule in "${TECH_RULES[@]}"; do
        local rule_file="${src_dir}/rules/${rule}"
        local base_rule_file="$I18N_DIR/base/$TECH_NAME/rules/${rule}"
        if [ ! -f "$rule_file" ] && [ ! -f "$base_rule_file" ]; then
            log_error "Missing source file: rules/${rule}"
            missing=1
        fi
    done
    local verify_file="${src_dir}/${TECH_VERIFY_FILE}"
    local base_verify_file="$I18N_DIR/base/$TECH_NAME/${TECH_VERIFY_FILE}"
    if [ ! -f "$verify_file" ] && [ ! -f "$base_verify_file" ]; then
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

# Copy generic skills from Common/ (base + lang overlay)
copy_generic_skills() {
    local target_dir="$1"
    local dry_run="$2"
    local base_skills_dir="$I18N_DIR/base/Common/skills"
    local lang_skills_dir="$I18N_DIR/$lang/Common/skills"

    if [[ ! -d "$base_skills_dir" ]] && [[ ! -d "$lang_skills_dir" ]]; then
        return 0
    fi

    # Collect unique skill directory names from both base and lang
    local -A skill_names=()
    if [[ -d "$base_skills_dir" ]]; then
        while IFS= read -r -d '' skill_dir; do
            skill_names["$(basename "$skill_dir")"]=1
        done < <(find "$base_skills_dir" -mindepth 1 -maxdepth 1 -type d -print0)
    fi
    if [[ -d "$lang_skills_dir" ]]; then
        while IFS= read -r -d '' skill_dir; do
            skill_names["$(basename "$skill_dir")"]=1
        done < <(find "$lang_skills_dir" -mindepth 1 -maxdepth 1 -type d -print0)
    fi

    local count=0
    for skill_name in "${!skill_names[@]}"; do
        local dest_dir="${target_dir}/.claude/skills/${skill_name}"

        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy skill: skills/${skill_name}/"
        else
            mkdir -p "$dest_dir"
            # Base first, then lang overlay
            [[ -d "$base_skills_dir/$skill_name" ]] && cp "$base_skills_dir/$skill_name/"*.md "$dest_dir/" 2>/dev/null || true
            [[ -d "$lang_skills_dir/$skill_name" ]] && cp "$lang_skills_dir/$skill_name/"*.md "$dest_dir/" 2>/dev/null || true
        fi
        ((count++)) || true
    done

    if [ "$dry_run" = "false" ] && [ $count -gt 0 ]; then
        log_success "$count generic skills copied from Common/"
    fi
}

# Copy tech-specific skills (base + lang overlay)
copy_tech_skills() {
    local target_dir="$1"
    local dry_run="$2"
    local base_skills_dir="$I18N_DIR/base/$TECH_NAME/skills"
    local lang_skills_dir="$I18N_DIR/$lang/$TECH_NAME/skills"

    if [[ ! -d "$base_skills_dir" ]] && [[ ! -d "$lang_skills_dir" ]]; then
        return 0
    fi

    # Collect unique skill directory names from both base and lang
    local -A skill_names=()
    if [[ -d "$base_skills_dir" ]]; then
        while IFS= read -r -d '' skill_dir; do
            skill_names["$(basename "$skill_dir")"]=1
        done < <(find "$base_skills_dir" -mindepth 1 -maxdepth 1 -type d -print0)
    fi
    if [[ -d "$lang_skills_dir" ]]; then
        while IFS= read -r -d '' skill_dir; do
            skill_names["$(basename "$skill_dir")"]=1
        done < <(find "$lang_skills_dir" -mindepth 1 -maxdepth 1 -type d -print0)
    fi

    local count=0
    for skill_name in "${!skill_names[@]}"; do
        local dest_dir="${target_dir}/.claude/skills/${skill_name}"

        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy skill: skills/${skill_name}/"
        else
            mkdir -p "$dest_dir"
            [[ -d "$base_skills_dir/$skill_name" ]] && cp "$base_skills_dir/$skill_name/"*.md "$dest_dir/" 2>/dev/null || true
            [[ -d "$lang_skills_dir/$skill_name" ]] && cp "$lang_skills_dir/$skill_name/"*.md "$dest_dir/" 2>/dev/null || true
        fi
        ((count++)) || true
    done

    if [ "$dry_run" = "false" ] && [ $count -gt 0 ]; then
        log_success "$count ${TECH_DISPLAY_NAME}-specific skills copied"
    fi
}

copy_templates() {
    local target_dir="$1"
    local dry_run="$2"
    local dest="${target_dir}/.claude/templates"

    if i18n_dir_exists "$TECH_NAME/templates"; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: templates/*.md"
        else
            copy_i18n_files "$TECH_NAME/templates" "$dest" "*.md"
            log_success "Templates copied"
        fi
    elif [ -d "${SCRIPT_DIR}/templates" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: templates/*.md"
        else
            cp "${SCRIPT_DIR}/templates/"*.md "$dest/" 2>/dev/null || true
            log_success "Templates copied"
        fi
    fi
}

copy_checklists() {
    local target_dir="$1"
    local dry_run="$2"
    local dest="${target_dir}/.claude/checklists"

    if i18n_dir_exists "$TECH_NAME/checklists"; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: checklists/*.md"
        else
            copy_i18n_files "$TECH_NAME/checklists" "$dest" "*.md"
            log_success "Checklists copied"
        fi
    elif [ -d "${SCRIPT_DIR}/checklists" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: checklists/*.md"
        else
            cp "${SCRIPT_DIR}/checklists/"*.md "$dest/" 2>/dev/null || true
            log_success "Checklists copied"
        fi
    fi
}

copy_commands() {
    local target_dir="$1"
    local dry_run="$2"
    local dest="${target_dir}/.claude/commands/${TECH_NAMESPACE}"

    if i18n_dir_exists "$TECH_NAME/commands"; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: commands/${TECH_NAMESPACE}/*.md"
        else
            copy_i18n_files "$TECH_NAME/commands" "$dest" "*.md"
            local count
            count=$(find "$dest" -name "*.md" -type f 2>/dev/null | wc -l)
            log_success "${count} commands copied (/${TECH_NAMESPACE}:*)"
        fi
    elif [ -d "${SCRIPT_DIR}/claude-commands/${TECH_NAMESPACE}" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: commands/${TECH_NAMESPACE}/*.md"
        else
            cp "${SCRIPT_DIR}/claude-commands/${TECH_NAMESPACE}/"*.md "$dest/" 2>/dev/null || true
            local count
            count=$(ls -1 "${SCRIPT_DIR}/claude-commands/${TECH_NAMESPACE}/"*.md 2>/dev/null | wc -l)
            log_success "${count} commands copied (/${TECH_NAMESPACE}:*)"
        fi
    fi
}

copy_agents() {
    local target_dir="$1"
    local dry_run="$2"
    local dest="${target_dir}/.claude/agents"

    if i18n_dir_exists "$TECH_NAME/agents"; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: agents/*.md"
        else
            copy_i18n_files "$TECH_NAME/agents" "$dest" "*.md"
            log_success "Agents copied"
        fi
    elif [ -d "${SCRIPT_DIR}/claude-agents" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy: agents/*.md"
        else
            cp "${SCRIPT_DIR}/claude-agents/"*.md "$dest/" 2>/dev/null || true
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
        # Skip if source and destination resolve to the same directory
        local resolved_src resolved_dst
        resolved_src="$(cd "$refs_2026_src" 2>/dev/null && pwd)" || resolved_src=""
        resolved_dst="$(cd "$refs_2026_dst" 2>/dev/null && pwd)" || resolved_dst=""
        local count_2026=0
        if [ -n "$resolved_src" ] && [ "$resolved_src" = "$resolved_dst" ]; then
            log_success "2026 feature references already in place (same directory)"
        else
            for ref_file in "${TECH_2026_REFS[@]}"; do
                if [ -f "${refs_2026_src}/${ref_file}" ]; then
                    cp "${refs_2026_src}/${ref_file}" "${refs_2026_dst}/"
                    ((count_2026++)) || true
                fi
            done
        fi
        if [ $count_2026 -gt 0 ]; then
            log_success "${count_2026} 2026 feature references copied"
        fi
    fi

    # 4. Copy project context template (base + lang fallback)
    if [ "$dry_run" = "false" ]; then
        local ctx_template
        ctx_template=$(resolve_i18n_file "$TECH_NAME/rules/00-project-context.md.template")
        if [[ -z "$ctx_template" ]]; then
            ctx_template="${src_dir}/rules/00-project-context.md.template"
        fi
        if [ -f "$ctx_template" ]; then
            local sed_args=(-e "s#{{PROJECT_NAME}}#${project_name}#g" -e "s#{{TECH_STACK}}#${tech_stack}#g")
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
