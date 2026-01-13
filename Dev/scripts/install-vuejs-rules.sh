#!/bin/bash
# Installation/Mise a jour des regles Claude Code pour projets Vue.js
# Version: 1.0.0
# Usage: ./install-vuejs-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"
TECH_NAME="VueJS"
TECH_NAMESPACE="vuejs"
DEFAULT_STACK="Vue.js 3.5, TypeScript, Vite, Pinia, Vue Router"
lang="en"

PROJECT_SPECIFIC_FILES=("rules/00-project-context.md")

# Fichiers tech-specifiques
TECH_RULES=(
    "02-architecture-vuejs.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-vuejs.md"
    "08-quality-tools.md"
    "11-security-vuejs.md"
)

# Alias pour compatibilite
COMMON_RULES=("${TECH_RULES[@]}")

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
        # shellcheck source=/dev/null
        source "$lang_file"
    elif [[ -f "$I18N_DIR/messages/en.sh" ]]; then
        # shellcheck source=/dev/null
        source "$I18N_DIR/messages/en.sh"
    fi
}

show_help() {
    cat << EOF
Usage: install-vuejs-rules.sh [OPTIONS] [PROJECT_DIR]

Installation/Mise a jour des regles Claude Code pour projets Vue.js.

Options:
    --install       Installation complete
    --update        Mise a jour des regles communes uniquement
    --force         Ecraser tous les fichiers (backup automatique)
    --preserve-config  Preserver CLAUDE.md et 00-project-context.md avec --force
    --dry-run       Afficher les actions sans les executer
    --backup        Creer un backup avant modifications
    --interactive   Demander les valeurs du projet
    --lang=XX       Langue (en, fr, es, de, pt) - default: en
    --version       Afficher la version
    --help          Afficher cette aide

Description:
    Regles couvrant :
    - Composition API, Script Setup, Pinia
    - Vue.js 3.5+, TypeScript strict mode
    - Vitest, Vue Test Utils, Playwright
    - ESLint, Prettier, vue-tsc
    - OWASP Security, XSS Prevention
EOF
}

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_dry_run() { echo -e "${YELLOW}[DRY-RUN]${NC} $1"; }

# Get source directory (i18n or local fallback)
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

    for rule in "${COMMON_RULES[@]}"; do
        if [ ! -f "${src_dir}/rules/${rule}" ]; then
            log_error "Fichier source manquant: rules/${rule}"
            missing=1
        fi
    done
    if [ ! -f "${src_dir}/CLAUDE.md.template" ]; then
        log_error "Fichier source manquant: CLAUDE.md.template"
        missing=1
    fi
    if [ $missing -eq 1 ]; then exit 1; fi
}

detect_installation() {
    local target_dir="$1"
    if [ -d "${target_dir}/.claude" ]; then
        if [ -f "${target_dir}/.claude/rules/00-project-context.md" ]; then
            echo "existing"
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
            log_success "Backup cree: ${backup_dir}"
        fi
    fi
}

create_directory_structure() {
    local target_dir="$1"
    local dry_run="$2"
    local dirs=(".claude" ".claude/rules" ".claude/templates" ".claude/checklists" ".claude/examples" ".claude/commands/${TECH_NAMESPACE}" ".claude/agents")
    for dir in "${dirs[@]}"; do
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Creer repertoire: ${target_dir}/${dir}"
        else
            mkdir -p "${target_dir}/${dir}"
        fi
    done
}

# Copie des skills generiques depuis Common/
copy_generic_skills() {
    local target_dir="$1"
    local dry_run="$2"
    local common_skills_dir="$I18N_DIR/$lang/Common/skills"

    if [[ ! -d "$common_skills_dir" ]]; then
        return 0
    fi

    local count=0
    while IFS= read -r -d '' skill_dir; do
        local skill_name=$(basename "$skill_dir")
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

# Copie des regles generiques depuis Common/
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
        local filename=$(basename "$file")
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copy generic: rules/$filename"
        else
            cp "$file" "${target_dir}/.claude/rules/$filename"
        fi
        ((count++)) || true
    done

    if [ "$dry_run" = "false" ] && [ $count -gt 0 ]; then
        log_success "$count generic rules copied from Common/"
    fi
}

# Copie des skills tech-specifiques
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
        local skill_name=$(basename "$skill_dir")
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
        log_success "$count Vue.js-specific skills copied"
    fi
}

copy_common_rules() {
    local target_dir="$1"
    local dry_run="$2"
    local src_dir
    src_dir=$(get_source_dir)

    # D'abord, installer les regles et skills generiques
    copy_generic_rules "$target_dir" "$dry_run"

    # Installer les skills tech-specifiques
    copy_tech_skills "$target_dir" "$dry_run"

    # Ensuite, installer les regles tech-specifiques
    local count=0
    for rule in "${TECH_RULES[@]}"; do
        local src_file="${src_dir}/rules/${rule}"
        # Fallback to local if i18n not available
        if [ ! -f "$src_file" ]; then
            src_file="${SCRIPT_DIR}/rules/${rule}"
        fi
        if [ ! -f "$src_file" ]; then
            log_warning "Rule not found: $rule"
            continue
        fi
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copier: rules/${rule}"
        else
            cp "$src_file" "${target_dir}/.claude/rules/${rule}"
        fi
        ((count++)) || true
    done
    if [ "$dry_run" = "false" ] && [ $count -gt 0 ]; then
        log_success "$count Vue.js-specific rules copied"
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
            log_dry_run "Copier: templates/*"
        else
            cp "${tmpl_dir}/"* "${target_dir}/.claude/templates/" 2>/dev/null || true
            log_success "Templates copies"
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
            log_dry_run "Copier: checklists/*.md"
        else
            cp "${chk_dir}/"*.md "${target_dir}/.claude/checklists/" 2>/dev/null || true
            log_success "Checklists copiees"
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
            log_dry_run "Copier: commands/${TECH_NAMESPACE}/*.md"
        else
            cp "${cmd_dir}/"*.md "${target_dir}/.claude/commands/${TECH_NAMESPACE}/" 2>/dev/null || true
            local count=$(ls -1 "${cmd_dir}/"*.md 2>/dev/null | wc -l)
            log_success "${count} commandes copiees (/${TECH_NAMESPACE}:*)"
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
            log_dry_run "Copier: agents/*.md"
        else
            cp "${agt_dir}/"*.md "${target_dir}/.claude/agents/" 2>/dev/null || true
            local count=$(ls -1 "${agt_dir}/"*.md 2>/dev/null | wc -l)
            log_success "${count} agents copies"
        fi
    fi
}

generate_claude_md() {
    local target_dir="$1"
    local dry_run="$2"
    local project_name="${3:-$(basename "$(cd "$target_dir" && pwd)")}"
    local src_dir
    src_dir=$(get_source_dir)

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Generer: CLAUDE.md"
        return
    fi

    local template="${src_dir}/CLAUDE.md.template"
    if [ ! -f "$template" ]; then
        template="${SCRIPT_DIR}/CLAUDE.md.template"
    fi
    if [ -f "$template" ]; then
        sed -e "s/{{PROJECT_NAME}}/${project_name}/g" \
            -e "s/{{VUE_VERSION}}/3.5/g" \
            -e "s/{{TS_VERSION}}/5.4/g" \
            -e "s/{{ARCHITECTURE_PATTERN}}/Modular Architecture/g" \
            "$template" > "${target_dir}/.claude/CLAUDE.md"
        log_success "CLAUDE.md genere"
    fi
}

generate_project_context() {
    local target_dir="$1"
    local dry_run="$2"
    local project_name="${3:-$(basename "$(cd "$target_dir" && pwd)")}"
    local src_dir
    src_dir=$(get_source_dir)

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Generer: rules/00-project-context.md"
        return
    fi

    local template="${src_dir}/rules/00-project-context.md.template"
    if [ ! -f "$template" ]; then
        template="${SCRIPT_DIR}/rules/00-project-context.md.template"
    fi
    if [ -f "$template" ]; then
        sed -e "s/{{PROJECT_NAME}}/${project_name}/g" \
            -e "s/{{PROJECT_DESCRIPTION}}/Vue.js application/g" \
            -e "s/{{VUE_VERSION}}/3.5/g" \
            -e "s/{{TS_VERSION}}/5.4/g" \
            -e "s/{{VITE_VERSION}}/5.4/g" \
            -e "s/{{PINIA_VERSION}}/2.2/g" \
            -e "s/{{ROUTER_VERSION}}/4.3/g" \
            -e "s/{{UI_FRAMEWORK}}/None/g" \
            -e "s/{{UI_VERSION}}/-/g" \
            -e "s/{{ARCHITECTURE_PATTERN}}/Modular Architecture/g" \
            -e "s/{{MODULE}}/feature/g" \
            -e "s/{{MODULE_1}}/Auth/g" \
            -e "s/{{MODULE_1_DESCRIPTION}}/User authentication and authorization/g" \
            -e "s/{{MODULE_2}}/Core/g" \
            -e "s/{{MODULE_2_DESCRIPTION}}/Core application features/g" \
            -e "s/{{SERVICE_1}}/API/g" \
            -e "s/{{PURPOSE_1}}/Backend REST API/g" \
            -e "s/{{DOC_URL_1}}/#/g" \
            -e "s/{{SERVICE_2}}/Analytics/g" \
            -e "s/{{PURPOSE_2}}/Usage tracking/g" \
            -e "s/{{DOC_URL_2}}/#/g" \
            "$template" > "${target_dir}/.claude/rules/00-project-context.md"
        log_success "Project context genere"
    fi
}

show_summary() {
    local target_dir="$1"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN} Vue.js Rules - Installation terminee${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "Repertoire: ${BLUE}${target_dir}/.claude/${NC}"
    echo ""
    echo "Fichiers installes:"
    ls -la "${target_dir}/.claude/rules/"*.md 2>/dev/null | awk '{print "  - rules/" $NF}' | xargs -I {} basename {}
    echo ""
    echo "Commandes disponibles:"
    echo "  /${TECH_NAMESPACE}:check-compliance"
    echo "  /${TECH_NAMESPACE}:check-architecture"
    echo "  /${TECH_NAMESPACE}:check-code-quality"
    echo "  /${TECH_NAMESPACE}:check-testing"
    echo "  /${TECH_NAMESPACE}:check-security"
    echo "  /${TECH_NAMESPACE}:generate-component"
    echo ""
    echo -e "${YELLOW}Prochaines etapes:${NC}"
    echo "  1. Personnaliser .claude/rules/00-project-context.md"
    echo "  2. Personnaliser .claude/CLAUDE.md"
    echo "  3. Utiliser les commandes /${TECH_NAMESPACE}:*"
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================
main() {
    local mode="install"
    local dry_run="false"
    local do_backup="false"
    local force="false"
    local preserve_config="false"
    local interactive="false"
    local skip_common="false"
    local target_dir=""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --install)
                mode="install"
                shift
                ;;
            --update)
                mode="update"
                shift
                ;;
            --force)
                force="true"
                do_backup="true"
                shift
                ;;
            --preserve-config)
                preserve_config="true"
                shift
                ;;
            --dry-run)
                dry_run="true"
                shift
                ;;
            --backup)
                do_backup="true"
                shift
                ;;
            --skip-common)
                skip_common="true"
                shift
                ;;
            --interactive)
                interactive="true"
                shift
                ;;
            --lang=*)
                lang="${1#*=}"
                shift
                ;;
            --version)
                echo "install-vuejs-rules.sh version $VERSION"
                exit 0
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            -*)
                log_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
            *)
                target_dir="$1"
                shift
                ;;
        esac
    done

    # Set default target directory
    if [ -z "$target_dir" ]; then
        target_dir="."
    fi

    # Resolve to absolute path
    target_dir="$(cd "$target_dir" && pwd)"

    # Load i18n messages
    load_messages

    # Verify source files
    verify_source_files

    # Detect existing installation
    local install_status
    install_status=$(detect_installation "$target_dir")

    log_info "Installation Vue.js rules to: $target_dir"
    log_info "Mode: $mode | Language: $lang | Status: $install_status"

    # Create backup if needed
    if [ "$do_backup" = "true" ]; then
        create_backup "$target_dir" "$dry_run"
    fi

    # Create directory structure
    create_directory_structure "$target_dir" "$dry_run"

    # Copy files based on mode
    if [ "$mode" = "install" ] || [ "$mode" = "update" ]; then
        if [ "$skip_common" = "false" ]; then
            copy_common_rules "$target_dir" "$dry_run"
        else
            log_info "Skipping common rules (multi-tech mode)"
        fi
        copy_templates "$target_dir" "$dry_run"
        copy_checklists "$target_dir" "$dry_run"
        copy_commands "$target_dir" "$dry_run"
        copy_agents "$target_dir" "$dry_run"
    fi

    # Generate project files (only on fresh install or with force)
    if [ "$install_status" = "none" ] || ([ "$force" = "true" ] && [ "$preserve_config" = "false" ]); then
        generate_claude_md "$target_dir" "$dry_run"
        generate_project_context "$target_dir" "$dry_run"
    fi

    # Show summary
    if [ "$dry_run" = "false" ]; then
        show_summary "$target_dir"
    else
        log_info "Dry run complete. No files were modified."
    fi
}

main "$@"
