#!/bin/bash
# Installation/Mise a jour des regles Claude Code pour projets Symfony
# Version: 1.1.0
# Usage: ./install-symfony-rules.sh [OPTIONS] [PROJECT_DIR]
#
# Installe les regles Clean Architecture + DDD pour Symfony
# Fusion des meilleures pratiques de CareLink, Atoll-Tourisme et Nexar

set -e

# ============================================================================
# CONSTANTS
# ============================================================================
VERSION="1.1.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TECH_NAME="Symfony"
TECH_NAMESPACE="symfony"

# Fichiers specifiques au projet (jamais ecrases en mode update)
PROJECT_SPECIFIC_FILES=(
    "rules/00-project-context.md"
)

# Fichiers communs (toujours mis a jour)
COMMON_RULES=(
    "01-workflow-analysis.md"
    "02-architecture-clean-ddd.md"
    "03-coding-standards.md"
    "04-solid-principles.md"
    "05-kiss-dry-yagni.md"
    "06-docker-hadolint.md"
    "07-testing-tdd-bdd.md"
    "08-quality-tools.md"
    "09-git-workflow.md"
    "10-documentation.md"
    "11-security-rgpd.md"
    "12-performance.md"
    "13-ddd-patterns.md"
    "14-multitenant.md"
    "15-doctrine-extensions.md"
    "16-i18n.md"
    "17-async.md"
    "18-value-objects.md"
    "19-aggregates.md"
    "20-domain-events.md"
    "21-cqrs.md"
)

# ============================================================================
# COLORS
# ============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# FUNCTIONS
# ============================================================================

show_help() {
    cat << 'EOF'
Usage: install-symfony-rules.sh [OPTIONS] [PROJECT_DIR]

Installation/Mise a jour des regles Claude Code pour projets Symfony.
Fusion des meilleures pratiques de CareLink, Atoll-Tourisme et Nexar.

Options:
    --install       Installation complete (nouveaux fichiers)
    --update        Mise a jour des regles communes uniquement
    --force         Ecraser tous les fichiers (backup automatique)
    --dry-run       Afficher les actions sans les executer
    --backup        Creer un backup avant modifications
    --interactive   Demander les valeurs du projet
    --version       Afficher la version
    --help          Afficher cette aide

Arguments:
    PROJECT_DIR     Repertoire du projet (defaut: repertoire courant)

Exemples:
    ./install-symfony-rules.sh --install ./mon-projet-symfony
    ./install-symfony-rules.sh --update
    ./install-symfony-rules.sh --force --backup ./projet
    ./install-symfony-rules.sh --dry-run
    ./install-symfony-rules.sh --interactive ./nouveau-projet

Description:
    Ce script installe ou met a jour les regles Claude Code pour projets
    Symfony suivant Clean Architecture + DDD + Hexagonal.

    21 fichiers de regles couvrant :
    - Architecture DDD/CQRS/Hexagonale
    - Standards de code PSR-12
    - TDD/BDD obligatoire
    - Docker/Hadolint
    - Qualite (PHPStan, CS-Fixer, Rector, Deptrac)
    - Securite OWASP/RGPD
    - Multitenant, i18n, Async

    9 templates :
    - analysis.md, value-object.md, service.md
    - aggregate-root.md, domain-event.md
    - test-unit.md, test-integration.md, test-behat.md

    5 checklists :
    - pre-commit.md, new-feature.md, refactoring.md, security-rgpd.md

    4 exemples :
    - clean-architecture-structure.md, value-object-examples.md
    - aggregate-examples.md, domain-event-examples.md

    5 commandes Symfony :
    - /symfony:check-compliance, /symfony:check-architecture
    - /symfony:check-code-quality, /symfony:check-security
    - /symfony:check-testing

    1 agent :
    - @symfony-reviewer
EOF
}

show_version() {
    echo "install-symfony-rules.sh version ${VERSION}"
    echo "Regles fusionnees depuis : CareLink, Atoll-Tourisme, Nexar"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_dry_run() {
    echo -e "${YELLOW}[DRY-RUN]${NC} $1"
}

# Verification des fichiers sources
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

    if [ $missing -eq 1 ]; then
        log_error "Fichiers sources manquants. Verifiez l'installation du script."
        exit 1
    fi
}

# Detection du type d'installation existante
detect_installation() {
    local target_dir="$1"

    if [ -d "${target_dir}/.claude" ]; then
        if [ -f "${target_dir}/.claude/rules/00-project-context.md" ]; then
            echo "existing"
        elif [ -f "${target_dir}/.claude/CLAUDE.md" ]; then
            echo "partial"
        else
            echo "empty"
        fi
    else
        echo "none"
    fi
}

# Migration des anciennes installations
detect_migration_needed() {
    local target_dir="$1"

    # Verifier si CLAUDE.md existe a la racine mais pas dans .claude/
    if [ -f "${target_dir}/CLAUDE.md" ] && [ ! -f "${target_dir}/.claude/CLAUDE.md" ]; then
        echo "root_claude_md"
    # Verifier si les rules sont directement dans .claude/ au lieu de .claude/rules/
    elif [ -f "${target_dir}/.claude/01-workflow-analysis.md" ]; then
        echo "flat_structure"
    else
        echo "none"
    fi
}

# Creation du backup
create_backup() {
    local target_dir="$1"
    local dry_run="$2"
    local backup_dir="${target_dir}/.claude-backup-$(date +%Y%m%d-%H%M%S)"

    if [ -d "${target_dir}/.claude" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Backup: ${target_dir}/.claude -> ${backup_dir}"
        else
            cp -r "${target_dir}/.claude" "${backup_dir}"
            log_success "Backup cree: ${backup_dir}"
        fi
    fi
}

# Creation de la structure de repertoires
create_directory_structure() {
    local target_dir="$1"
    local dry_run="$2"

    local dirs=(
        ".claude"
        ".claude/rules"
        ".claude/templates"
        ".claude/checklists"
        ".claude/adr"
        ".claude/examples"
        ".claude/commands"
        ".claude/commands/${TECH_NAMESPACE}"
        ".claude/agents"
    )

    for dir in "${dirs[@]}"; do
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Creer repertoire: ${target_dir}/${dir}"
        else
            mkdir -p "${target_dir}/${dir}"
        fi
    done
}

# Copie des regles communes
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

    if [ "$dry_run" = "false" ]; then
        log_success "21 fichiers de regles copies"
    fi
}

# Copie des templates
copy_templates() {
    local target_dir="$1"
    local dry_run="$2"

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Copier: templates/*.md"
    else
        cp "${SCRIPT_DIR}/templates/"*.md "${target_dir}/.claude/templates/"
        log_success "9 templates copies"
    fi
}

# Copie des checklists
copy_checklists() {
    local target_dir="$1"
    local dry_run="$2"

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Copier: checklists/*.md"
    else
        cp "${SCRIPT_DIR}/checklists/"*.md "${target_dir}/.claude/checklists/"
        log_success "5 checklists copiees"
    fi
}

# Copie des ADR
copy_adr() {
    local target_dir="$1"
    local dry_run="$2"

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Copier: adr/README.md, adr/template.md"
    else
        cp "${SCRIPT_DIR}/adr/README.md" "${target_dir}/.claude/adr/" 2>/dev/null || true
        cp "${SCRIPT_DIR}/adr/template.md" "${target_dir}/.claude/adr/" 2>/dev/null || true
        log_success "ADR template copie"
    fi
}

# Copie des exemples
copy_examples() {
    local target_dir="$1"
    local dry_run="$2"

    if [ -d "${SCRIPT_DIR}/examples" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copier: examples/*.md"
        else
            cp "${SCRIPT_DIR}/examples/"*.md "${target_dir}/.claude/examples/" 2>/dev/null || true
            log_success "4 exemples copies"
        fi
    fi
}

# Copie des commandes
copy_commands() {
    local target_dir="$1"
    local dry_run="$2"

    if [ -d "${SCRIPT_DIR}/claude-commands/${TECH_NAMESPACE}" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copier: claude-commands/${TECH_NAMESPACE}/*.md"
        else
            cp "${SCRIPT_DIR}/claude-commands/${TECH_NAMESPACE}/"*.md "${target_dir}/.claude/commands/${TECH_NAMESPACE}/" 2>/dev/null || true
            local count=$(ls -1 "${SCRIPT_DIR}/claude-commands/${TECH_NAMESPACE}/"*.md 2>/dev/null | wc -l)
            log_success "${count} commandes ${TECH_NAMESPACE} copiees"
        fi
    fi
}

# Copie des agents
copy_agents() {
    local target_dir="$1"
    local dry_run="$2"

    if [ -d "${SCRIPT_DIR}/claude-agents" ]; then
        if [ "$dry_run" = "true" ]; then
            log_dry_run "Copier: claude-agents/*.md"
        else
            cp "${SCRIPT_DIR}/claude-agents/"*.md "${target_dir}/.claude/agents/" 2>/dev/null || true
            local count=$(ls -1 "${SCRIPT_DIR}/claude-agents/"*.md 2>/dev/null | wc -l)
            log_success "${count} agents copies"
        fi
    fi
}

# Demander les informations du projet (mode interactif)
prompt_project_info() {
    echo ""
    echo "=========================================="
    echo "Configuration du projet"
    echo "=========================================="
    echo ""

    read -p "Nom du projet [MonProjet]: " PROJECT_NAME
    PROJECT_NAME="${PROJECT_NAME:-MonProjet}"

    echo ""
    echo "Stack technique (exemples):"
    echo "  - Symfony 7.2, PHP 8.3, PostgreSQL 16, Redis 7"
    echo "  - Symfony 6.4 LTS, PHP 8.2, MySQL 8, Redis 7"
    echo ""
    read -p "Stack technique [Symfony 7.2, PHP 8.3, PostgreSQL 16]: " TECH_STACK
    TECH_STACK="${TECH_STACK:-Symfony 7.2, PHP 8.3, PostgreSQL 16}"

    echo ""
    echo "Configuration:"
    echo "  Projet: ${PROJECT_NAME}"
    echo "  Stack: ${TECH_STACK}"
    echo ""

    read -p "Confirmer? [Y/n]: " CONFIRM
    CONFIRM="${CONFIRM:-Y}"

    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
        log_warning "Installation annulee"
        exit 0
    fi
}

# Traitement du template CLAUDE.md
process_claude_md_template() {
    local target_dir="$1"
    local project_name="$2"
    local tech_stack="$3"
    local dry_run="$4"

    local generation_date=$(date +%Y-%m-%d)

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Generer CLAUDE.md avec:"
        log_dry_run "  PROJECT_NAME: ${project_name}"
        log_dry_run "  TECH_STACK: ${tech_stack}"
        log_dry_run "  GENERATION_DATE: ${generation_date}"
    else
        sed -e "s/{{PROJECT_NAME}}/${project_name}/g" \
            -e "s/{{TECH_STACK}}/${tech_stack}/g" \
            -e "s/{{GENERATION_DATE}}/${generation_date}/g" \
            "${SCRIPT_DIR}/CLAUDE.md.template" \
            > "${target_dir}/.claude/CLAUDE.md"
        log_success "CLAUDE.md genere"
    fi
}

# Traitement du template project-context
process_project_context_template() {
    local target_dir="$1"
    local project_name="$2"
    local tech_stack="$3"
    local dry_run="$4"

    if [ "$dry_run" = "true" ]; then
        log_dry_run "Generer 00-project-context.md"
    else
        sed -e "s/{{PROJECT_NAME}}/${project_name}/g" \
            -e "s/{{TECH_STACK}}/${tech_stack}/g" \
            "${SCRIPT_DIR}/rules/00-project-context.md.template" \
            > "${target_dir}/.claude/rules/00-project-context.md"
        log_success "00-project-context.md genere (a personnaliser)"
    fi
}

# Mise a jour preservant les fichiers specifiques au projet
update_rules() {
    local target_dir="$1"
    local force="$2"
    local dry_run="$3"

    log_info "Mise a jour des regles communes..."

    # Copier les regles communes
    copy_common_rules "$target_dir" "$dry_run"

    # Copier templates et checklists
    copy_templates "$target_dir" "$dry_run"
    copy_checklists "$target_dir" "$dry_run"

    # Mettre a jour ADR template uniquement
    copy_adr "$target_dir" "$dry_run"

    # Mettre a jour exemples
    copy_examples "$target_dir" "$dry_run"

    # Mettre a jour commandes
    copy_commands "$target_dir" "$dry_run"

    # Mettre a jour agents
    copy_agents "$target_dir" "$dry_run"

    # Fichiers preserves
    if [ "$force" = "false" ]; then
        log_info "Fichiers preserves (specifiques au projet):"
        for file in "${PROJECT_SPECIFIC_FILES[@]}"; do
            echo "  - .claude/${file}"
        done
        echo "  - .claude/CLAUDE.md (sections personnalisees)"
    fi
}

# Afficher le resume de l'installation
show_summary() {
    local target_dir="$1"
    local mode="$2"

    # Compter les commandes et agents installes
    local commands_count=0
    local agents_count=0
    if [ -d "${target_dir}/.claude/commands/${TECH_NAMESPACE}" ]; then
        commands_count=$(ls -1 "${target_dir}/.claude/commands/${TECH_NAMESPACE}/"*.md 2>/dev/null | wc -l)
    fi
    if [ -d "${target_dir}/.claude/agents" ]; then
        agents_count=$(ls -1 "${target_dir}/.claude/agents/"*.md 2>/dev/null | wc -l)
    fi

    echo ""
    echo "=========================================="
    echo "Installation terminee!"
    echo "=========================================="
    echo ""
    echo "Structure creee:"
    echo "  ${target_dir}/"
    echo "  |-- .claude/"
    echo "  |   |-- CLAUDE.md"
    echo "  |   |-- rules/                  (21 fichiers)"
    echo "  |   |   |-- 00-project-context.md"
    echo "  |   |   |-- 01-workflow-analysis.md"
    echo "  |   |   |-- ... (19 autres)"
    echo "  |   |   |-- 21-cqrs.md"
    echo "  |   |-- templates/              (9 fichiers)"
    echo "  |   |-- checklists/             (5 fichiers)"
    echo "  |   |-- adr/                    (2 fichiers)"
    echo "  |   |-- examples/               (4 fichiers)"
    echo "  |   |-- commands/${TECH_NAMESPACE}/       (${commands_count} commandes)"
    echo "  |   |-- agents/                 (${agents_count} agents)"
    echo ""

    # Lister les commandes disponibles
    if [ $commands_count -gt 0 ]; then
        echo "Commandes disponibles:"
        for cmd_file in "${target_dir}/.claude/commands/${TECH_NAMESPACE}/"*.md; do
            if [ -f "$cmd_file" ]; then
                local cmd_name=$(basename "$cmd_file" .md)
                echo "  - /${TECH_NAMESPACE}:${cmd_name}"
            fi
        done
        echo ""
    fi

    # Lister les agents disponibles
    if [ $agents_count -gt 0 ]; then
        echo "Agents disponibles:"
        for agent_file in "${target_dir}/.claude/agents/"*.md; do
            if [ -f "$agent_file" ]; then
                local agent_name=$(basename "$agent_file" .md)
                echo "  - @${agent_name}"
            fi
        done
        echo ""
    fi

    echo "Prochaines etapes:"
    echo "  1. Editer .claude/rules/00-project-context.md"
    echo "     (Decrire votre domaine metier et bounded contexts)"
    echo ""
    echo "  2. Personnaliser .claude/CLAUDE.md"
    echo "     (Ajouter la configuration specifique au projet)"
    echo ""
    echo "  3. Creer vos premiers ADRs dans .claude/adr/"
    echo "     (Documenter les decisions architecturales)"
    echo ""
    echo "Documentation:"
    echo "  - Regles: .claude/rules/README.md"
    echo "  - Templates: .claude/templates/README.md"
    echo "  - Checklists: .claude/checklists/README.md"
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    # Variables par defaut
    local mode=""
    local force="false"
    local dry_run="false"
    local backup="false"
    local interactive="false"
    local target_dir="."

    # Parser les arguments
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
                shift
                ;;
            --dry-run)
                dry_run="true"
                shift
                ;;
            --backup)
                backup="true"
                shift
                ;;
            --interactive)
                interactive="true"
                shift
                ;;
            --version)
                show_version
                exit 0
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            -*)
                log_error "Option inconnue: $1"
                echo "Utilisez --help pour voir les options disponibles"
                exit 1
                ;;
            *)
                target_dir="$1"
                shift
                ;;
        esac
    done

    # Resoudre le chemin absolu
    if [ "$target_dir" != "." ]; then
        if [ ! -d "$target_dir" ]; then
            log_error "Repertoire inexistant: $target_dir"
            exit 1
        fi
        target_dir="$(cd "${target_dir}" && pwd)"
    else
        target_dir="$(pwd)"
    fi

    echo ""
    echo "=========================================="
    echo "Installation des regles Claude Code"
    echo "pour projets Symfony"
    echo "=========================================="
    echo ""
    echo "Version: ${VERSION}"
    echo "Repertoire cible: ${target_dir}"

    # Verifier les fichiers sources
    verify_source_files

    # Auto-detection du mode si non specifie
    if [ -z "$mode" ]; then
        local installation_status=$(detect_installation "$target_dir")
        case $installation_status in
            existing)
                log_info "Installation existante detectee -> mode update"
                mode="update"
                ;;
            partial|empty)
                log_info "Installation partielle detectee -> mode install"
                mode="install"
                ;;
            none)
                log_info "Aucune installation detectee -> mode install"
                mode="install"
                ;;
        esac
    fi

    echo "Mode: ${mode}"
    if [ "$dry_run" = "true" ]; then
        echo "Mode dry-run: aucune modification ne sera effectuee"
    fi
    echo ""

    # Verifier si migration necessaire
    local migration=$(detect_migration_needed "$target_dir")
    if [ "$migration" != "none" ]; then
        log_warning "Migration necessaire detectee: ${migration}"
        log_warning "Utilisez --force --backup pour migrer"
    fi

    # Creer backup si demande ou en mode force
    if [ "$backup" = "true" ] || [ "$force" = "true" ]; then
        create_backup "$target_dir" "$dry_run"
    fi

    # Executer selon le mode
    case $mode in
        install)
            # Mode interactif pour demander les infos projet
            if [ "$interactive" = "true" ]; then
                prompt_project_info
            else
                PROJECT_NAME="${PROJECT_NAME:-MonProjet}"
                TECH_STACK="${TECH_STACK:-Symfony 7.2, PHP 8.3, PostgreSQL 16}"
            fi

            log_info "Installation complete..."
            create_directory_structure "$target_dir" "$dry_run"
            copy_common_rules "$target_dir" "$dry_run"
            copy_templates "$target_dir" "$dry_run"
            copy_checklists "$target_dir" "$dry_run"
            copy_adr "$target_dir" "$dry_run"
            copy_examples "$target_dir" "$dry_run"
            copy_commands "$target_dir" "$dry_run"
            copy_agents "$target_dir" "$dry_run"
            process_project_context_template "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run"
            process_claude_md_template "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run"
            ;;
        update)
            if [ "$force" = "true" ]; then
                log_warning "Mode force: TOUS les fichiers seront ecrases"
                if [ "$interactive" = "true" ]; then
                    prompt_project_info
                else
                    PROJECT_NAME="${PROJECT_NAME:-MonProjet}"
                    TECH_STACK="${TECH_STACK:-Symfony 7.2, PHP 8.3, PostgreSQL 16}"
                fi
                create_directory_structure "$target_dir" "$dry_run"
                copy_common_rules "$target_dir" "$dry_run"
                copy_templates "$target_dir" "$dry_run"
                copy_checklists "$target_dir" "$dry_run"
                copy_adr "$target_dir" "$dry_run"
                copy_examples "$target_dir" "$dry_run"
                copy_commands "$target_dir" "$dry_run"
                copy_agents "$target_dir" "$dry_run"
                process_project_context_template "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run"
                process_claude_md_template "$target_dir" "$PROJECT_NAME" "$TECH_STACK" "$dry_run"
            else
                update_rules "$target_dir" "$force" "$dry_run"
            fi
            ;;
    esac

    # Afficher le resume
    if [ "$dry_run" = "false" ]; then
        show_summary "$target_dir" "$mode"
    else
        echo ""
        log_dry_run "Fin de la simulation. Aucune modification effectuee."
    fi
}

main "$@"
