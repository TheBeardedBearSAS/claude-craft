#!/bin/bash
# Installation/Mise a jour des regles Claude Code pour projets React
# Version: 1.1.0
# Usage: ./install-react-rules.sh [OPTIONS] [PROJECT_DIR]

set -e

VERSION="1.1.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TECH_NAME="React"
TECH_NAMESPACE="react"
DEFAULT_STACK="React 18+, TypeScript 5+, Vite, TailwindCSS, React Query, Zustand"

PROJECT_SPECIFIC_FILES=("rules/00-project-context.md")

COMMON_RULES=(
    "01-workflow-analysis.md"
    "02-architecture.md"
    "03-coding-standards.md"
    "04-solid-principles.md"
    "05-kiss-dry-yagni.md"
    "06-tooling.md"
    "07-testing.md"
    "08-quality-tools.md"
    "09-git-workflow.md"
    "10-documentation.md"
    "11-security.md"
)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_help() {
    cat << EOF
Usage: install-react-rules.sh [OPTIONS] [PROJECT_DIR]

Installation/Mise a jour des regles Claude Code pour projets React TypeScript.

Options:
    --install       Installation complete
    --update        Mise a jour des regles communes uniquement
    --force         Ecraser tous les fichiers (backup automatique)
    --dry-run       Afficher les actions sans les executer
    --backup        Creer un backup avant modifications
    --interactive   Demander les valeurs du projet
    --version       Afficher la version
    --help          Afficher cette aide

Description:
    11 fichiers de regles couvrant :
    - Feature-based Architecture, Atomic Design
    - TypeScript strict, ESLint, Prettier
    - Tests Vitest, RTL, Playwright
    - State Management, Performance, Security
EOF
}

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_dry_run() { echo -e "${YELLOW}[DRY-RUN]${NC} $1"; }

verify_source_files() {
    local missing=0
    for rule in "${COMMON_RULES[@]}"; do
        if [ ! -f "${SCRIPT_DIR}/rules/${rule}" ]; then
            log_error "Fichier source manquant: rules/${rule}"
            missing=1
        fi
    done
    if [ ! -f "${SCRIPT_DIR}/CLAUDE.md.template" ]; then
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

copy_common_rules() {
    local target_dir="$1"
    local dry_run="$2"
    for rule in "${COMMON_RULES[@]}"; do
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copier: rules/${rule}"
        else
            cp "${SCRIPT_DIR}/rules/${rule}" "${target_dir}/.claude/rules/${rule}"
        fi
    done
    if [ "$dry_run" = "false" ]; then log_success "${#COMMON_RULES[@]} fichiers de regles copies"; fi
}

copy_templates() {
    local target_dir="$1"
    local dry_run="$2"
    if [ "$dry_run" = "true" ]; then
        log_dry_run "Copier: templates/*.md"
    else
        cp "${SCRIPT_DIR}/templates/"*.md "${target_dir}/.claude/templates/" 2>/dev/null || true
        log_success "Templates copies"
    fi
}

copy_checklists() {
    local target_dir="$1"
    local dry_run="$2"
    if [ "$dry_run" = "true" ]; then
        log_dry_run "Copier: checklists/*.md"
    else
        cp "${SCRIPT_DIR}/checklists/"*.md "${target_dir}/.claude/checklists/" 2>/dev/null || true
        log_success "Checklists copiees"
    fi
}

copy_commands() {
    local target_dir="$1"
    local dry_run="$2"
    if [ "$dry_run" = "true" ]; then
        log_dry_run "Copier: claude-commands/${TECH_NAMESPACE}/*.md"
    else
        cp "${SCRIPT_DIR}/claude-commands/${TECH_NAMESPACE}/"*.md "${target_dir}/.claude/commands/${TECH_NAMESPACE}/" 2>/dev/null || true
        local count=$(ls -1 "${SCRIPT_DIR}/claude-commands/${TECH_NAMESPACE}/"*.md 2>/dev/null | wc -l)
        log_success "${count} commandes copiees (/${TECH_NAMESPACE}:*)"
    fi
}

copy_agents() {
    local target_dir="$1"
    local dry_run="$2"
    if [ "$dry_run" = "true" ]; then
        log_dry_run "Copier: claude-agents/*.md"
    else
        cp "${SCRIPT_DIR}/claude-agents/"*.md "${target_dir}/.claude/agents/" 2>/dev/null || true
        log_success "Agents copies"
    fi
}

prompt_project_info() {
    echo ""
    echo "Configuration du projet ${TECH_NAME}"
    echo "=========================================="
    read -p "Nom du projet [MonProjet]: " PROJECT_NAME
    PROJECT_NAME="${PROJECT_NAME:-MonProjet}"
    read -p "Stack technique [${DEFAULT_STACK}]: " TECH_STACK
    TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"
    echo ""
    read -p "Confirmer? [Y/n]: " CONFIRM
    if [[ ! "${CONFIRM:-Y}" =~ ^[Yy]$ ]]; then
        log_warning "Installation annulee"
        exit 0
    fi
}

process_templates() {
    local target_dir="$1"
    local project_name="$2"
    local tech_stack="$3"
    local dry_run="$4"
    local generation_date=$(date +%Y-%m-%d)

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Generer CLAUDE.md et 00-project-context.md"
    else
        sed -e "s/{{PROJECT_NAME}}/${project_name}/g" \
            -e "s/{{TECH_STACK}}/${tech_stack}/g" \
            -e "s/{{GENERATION_DATE}}/${generation_date}/g" \
            "${SCRIPT_DIR}/CLAUDE.md.template" > "${target_dir}/.claude/CLAUDE.md"

        sed -e "s/{{PROJECT_NAME}}/${project_name}/g" \
            -e "s/{{TECH_STACK}}/${tech_stack}/g" \
            "${SCRIPT_DIR}/rules/00-project-context.md.template" > "${target_dir}/.claude/rules/00-project-context.md"

        log_success "CLAUDE.md et 00-project-context.md generes"
    fi
}

show_summary() {
    local target_dir="$1"
    local cmd_count=$(ls -1 "${SCRIPT_DIR}/claude-commands/${TECH_NAMESPACE}/"*.md 2>/dev/null | wc -l)
    echo ""
    echo "=========================================="
    echo "Installation ${TECH_NAME} terminee!"
    echo "=========================================="
    echo ""
    echo "Structure creee: ${target_dir}/.claude/"
    echo "  - rules/                    (${#COMMON_RULES[@]} fichiers)"
    echo "  - templates/"
    echo "  - checklists/"
    echo "  - commands/${TECH_NAMESPACE}/     (${cmd_count} commandes)"
    echo "  - agents/"
    echo ""
    echo "Commandes disponibles:"
    echo "  /${TECH_NAMESPACE}:check-compliance     Audit complet (score /100)"
    echo "  /${TECH_NAMESPACE}:check-architecture   Architecture seule"
    echo "  /${TECH_NAMESPACE}:check-code-quality   Qualite code"
    echo "  /${TECH_NAMESPACE}:check-testing        Tests"
    echo "  /${TECH_NAMESPACE}:check-security       Securite"
    echo ""
    echo "Prochaines etapes:"
    echo "  1. Editer .claude/rules/00-project-context.md"
    echo "  2. Personnaliser .claude/CLAUDE.md"
    echo "  3. Redemarrer Claude Code pour charger les commandes"
    echo ""
}

main() {
    local mode="" force="false" dry_run="false" backup="false" interactive="false" target_dir="."

    while [[ $# -gt 0 ]]; do
        case $1 in
            --install) mode="install"; shift ;;
            --update) mode="update"; shift ;;
            --force) force="true"; shift ;;
            --dry-run) dry_run="true"; shift ;;
            --backup) backup="true"; shift ;;
            --interactive) interactive="true"; shift ;;
            --version) echo "install-react-rules.sh version ${VERSION}"; exit 0 ;;
            --help|-h) show_help; exit 0 ;;
            -*) log_error "Option inconnue: $1"; exit 1 ;;
            *) target_dir="$1"; shift ;;
        esac
    done

    [ "$target_dir" != "." ] && [ -d "$target_dir" ] && target_dir="$(cd "${target_dir}" && pwd)" || target_dir="$(pwd)"

    echo ""
    echo "Installation des regles Claude Code - ${TECH_NAME}"
    echo "=========================================="
    echo "Version: ${VERSION}"
    echo "Repertoire: ${target_dir}"

    verify_source_files

    if [ -z "$mode" ]; then
        case $(detect_installation "$target_dir") in
            existing) log_info "Installation existante -> mode update"; mode="update" ;;
            *) log_info "Nouvelle installation"; mode="install" ;;
        esac
    fi

    [ "$backup" = "true" ] || [ "$force" = "true" ] && create_backup "$target_dir" "$dry_run"

    case $mode in
        install)
            [ "$interactive" = "true" ] && prompt_project_info || { PROJECT_NAME="${PROJECT_NAME:-MonProjet}"; TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"; }
            create_directory_structure "$target_dir" "$dry_run"
            copy_common_rules "$target_dir" "$dry_run"
            copy_templates "$target_dir" "$dry_run"
            copy_checklists "$target_dir" "$dry_run"
            copy_commands "$target_dir" "$dry_run"
            copy_agents "$target_dir" "$dry_run"
            process_templates "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run"
            ;;
        update)
            if [ "$force" = "true" ]; then
                log_warning "Mode force: TOUS les fichiers seront ecrases"
                [ "$interactive" = "true" ] && prompt_project_info || { PROJECT_NAME="${PROJECT_NAME:-MonProjet}"; TECH_STACK="${TECH_STACK:-${DEFAULT_STACK}}"; }
                create_directory_structure "$target_dir" "$dry_run"
                copy_common_rules "$target_dir" "$dry_run"
                copy_templates "$target_dir" "$dry_run"
                copy_checklists "$target_dir" "$dry_run"
                copy_commands "$target_dir" "$dry_run"
                copy_agents "$target_dir" "$dry_run"
                process_templates "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run"
            else
                log_info "Mise a jour des regles communes..."
                create_directory_structure "$target_dir" "$dry_run"
                copy_common_rules "$target_dir" "$dry_run"
                copy_templates "$target_dir" "$dry_run"
                copy_checklists "$target_dir" "$dry_run"
                copy_commands "$target_dir" "$dry_run"
                copy_agents "$target_dir" "$dry_run"
                log_info "Fichiers preserves: 00-project-context.md, CLAUDE.md"
            fi
            ;;
    esac

    if [ "$dry_run" = "false" ]; then show_summary "$target_dir"; else log_dry_run "Fin de la simulation"; fi
}

main "$@"
