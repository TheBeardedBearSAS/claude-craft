#!/bin/bash
# Installation/Mise a jour des regles Claude Code pour projets Flutter
# Version: 2.0.0
# Usage: ./install-flutter-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

VERSION="2.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"
TECH_NAME="Flutter"
TECH_NAMESPACE="flutter"
DEFAULT_STACK="Flutter 3.24+, Dart 3.5+, Riverpod, go_router"
lang="en"

PROJECT_SPECIFIC_FILES=("rules/00-project-context.md")

# Fichiers tech-specifiques (les generiques sont dans Common/rules/)
# Rules supprimees (maintenant dans Common/): 01, 04, 05, 09, 10
TECH_RULES=(
    "02-architecture.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-flutter.md"
    "08-quality-tools.md"
    "11-security-flutter.md"
    "12-performance.md"
    "13-state-management.md"
)

# Alias pour compatibilite
COMMON_RULES=("${TECH_RULES[@]}")

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
Usage: install-flutter-rules.sh [OPTIONS] [PROJECT_DIR]

Installation/Mise a jour des regles Claude Code pour projets Flutter.

Options:
    --install       Installation complete
    --update        Mise a jour des regles communes uniquement
    --force         Ecraser tous les fichiers (backup automatique)
    --preserve-config  Preserver CLAUDE.md et 00-project-context.md avec --force
    --dry-run       Afficher les actions sans les executer
    --backup        Creer un backup avant modifications
    --interactive   Demander les valeurs du projet
    --lang=XX       Set language (en, fr, es, de, pt - default: en)
    --version       Afficher la version
    --help          Afficher cette aide

Description:
    13 fichiers de regles couvrant :
    - Clean Architecture + BLoC/Riverpod
    - Standards Dart (Effective Dart)
    - Tests (Widget, Unit, Integration, Golden)
    - Qualite (dart analyze, DCM, lints)
    - State Management, Performance, Security
EOF
}

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_dry_run() { echo -e "${YELLOW}[DRY-RUN]${NC} $1"; }

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

# Copie des regles generiques depuis Common/ (backward compatibility)
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
        log_success "$count Flutter-specific skills copied"
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

    # Ensuite, installer les regles tech-specifiques (backward compatibility)
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
        log_success "$count Flutter-specific rules copied"
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

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Copier: templates/*.md"
    else
        cp "${tmpl_dir}/"*.md "${target_dir}/.claude/templates/" 2>/dev/null || true
        log_success "Templates copies"
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

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Copier: checklists/*.md"
    else
        cp "${chk_dir}/"*.md "${target_dir}/.claude/checklists/" 2>/dev/null || true
        log_success "Checklists copiees"
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
            log_dry_run "Copier: commands/*.md"
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
            log_success "Agents copies"
        fi
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
    local preserve_config="${5:-false}"
    local generation_date=$(date +%Y-%m-%d)
    local src_dir
    src_dir=$(get_source_dir)

    local claude_md="${target_dir}/.claude/CLAUDE.md"
    local project_context="${target_dir}/.claude/rules/00-project-context.md"

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Generer CLAUDE.md et 00-project-context.md"
    else
        # Generate CLAUDE.md (check preserve_config)
        if [ -f "$claude_md" ] && [ "$preserve_config" = "true" ]; then
            log_info "Preserved: CLAUDE.md (--preserve-config)"
        else
            sed -e "s/{{PROJECT_NAME}}/${project_name}/g" \
                -e "s/{{TECH_STACK}}/${tech_stack}/g" \
                -e "s/{{GENERATION_DATE}}/${generation_date}/g" \
                "${src_dir}/CLAUDE.md.template" > "$claude_md"
            log_success "CLAUDE.md genere"
        fi

        # Generate 00-project-context.md (check preserve_config)
        if [ -f "$project_context" ] && [ "$preserve_config" = "true" ]; then
            log_info "Preserved: 00-project-context.md (--preserve-config)"
        else
            sed -e "s/{{PROJECT_NAME}}/${project_name}/g" \
                -e "s/{{TECH_STACK}}/${tech_stack}/g" \
                "${src_dir}/rules/00-project-context.md.template" > "$project_context"
            log_success "00-project-context.md genere"
        fi
    fi
}

show_summary() {
    local target_dir="$1"
    local src_dir
    src_dir=$(get_source_dir)
    local cmd_count=$(ls -1 "${src_dir}/commands/"*.md 2>/dev/null | wc -l)
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
    local mode="" force="false" dry_run="false" backup="false" interactive="false" preserve_config="false" target_dir="."

    while [[ $# -gt 0 ]]; do
        case $1 in
            --install) mode="install"; shift ;;
            --update) mode="update"; shift ;;
            --force) force="true"; shift ;;
            --preserve-config) preserve_config="true"; shift ;;
            --dry-run) dry_run="true"; shift ;;
            --backup) backup="true"; shift ;;
            --interactive) interactive="true"; shift ;;
            --lang=*) lang="${1#--lang=}"; shift ;;
            --version) echo "install-flutter-rules.sh version ${VERSION}"; exit 0 ;;
            --help|-h) show_help; exit 0 ;;
            -*) log_error "Option inconnue: $1"; exit 1 ;;
            *) target_dir="$1"; shift ;;
        esac
    done

    # Load i18n messages after lang is set
    load_messages

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
            process_templates "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run" "$preserve_config"
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
                process_templates "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run" "$preserve_config"
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
