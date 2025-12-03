#!/bin/bash

#===============================================================================
# install-common-rules.sh
#
# Script d'installation des règles, agents et commandes transversales
# pour Claude Code dans un projet existant.
#
# Usage:
#   ./install-common-rules.sh [OPTIONS] [TARGET_DIR]
#
# Options:
#   --install       Installe les fichiers (par défaut)
#   --update        Met à jour les fichiers existants
#   --force         Écrase les fichiers sans confirmation
#   --dry-run       Simule l'installation sans modifier les fichiers
#   --backup        Crée une sauvegarde avant modification
#   --interactive   Mode interactif pour choisir les composants
#   --agents-only   Installe uniquement les agents
#   --commands-only Installe uniquement les commandes
#   --templates-only Installe uniquement les templates
#   --checklists-only Installe uniquement les checklists
#   -h, --help      Affiche cette aide
#
# Exemples:
#   ./install-common-rules.sh ~/Projects/myapp
#   ./install-common-rules.sh --update --backup ~/Projects/myapp
#   ./install-common-rules.sh --dry-run .
#   ./install-common-rules.sh --interactive ~/Projects/myapp
#===============================================================================

set -euo pipefail

#-------------------------------------------------------------------------------
# Configuration
#-------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="$(basename "$0")"
VERSION="1.0.0"

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

# Compteurs
files_created=0
files_updated=0
files_skipped=0
errors=0

#-------------------------------------------------------------------------------
# Fonctions utilitaires
#-------------------------------------------------------------------------------
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_dry_run() {
    echo -e "${CYAN}[DRY-RUN]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  📦 Install Common Rules - v${VERSION}                         ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_usage() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS] [TARGET_DIR]

Script d'installation des règles transversales Claude Code.

Options:
    --install           Installe les fichiers (par défaut)
    --update            Met à jour les fichiers existants
    --force             Écrase les fichiers sans confirmation
    --dry-run           Simule l'installation sans modifier les fichiers
    --backup            Crée une sauvegarde avant modification
    --interactive       Mode interactif pour choisir les composants
    --agents-only       Installe uniquement les agents
    --commands-only     Installe uniquement les commandes
    --templates-only    Installe uniquement les templates
    --checklists-only   Installe uniquement les checklists
    -h, --help          Affiche cette aide

Exemples:
    $SCRIPT_NAME ~/Projects/myapp
    $SCRIPT_NAME --update --backup ~/Projects/myapp
    $SCRIPT_NAME --dry-run .
    $SCRIPT_NAME --interactive ~/Projects/myapp

Composants installés:
    - 5 agents transversaux (DevOps, Database, Refactoring, API, Performance)
    - 12 commandes /common: (audit, workflow, documentation, etc.)
    - Templates (PR, Issues)
    - Checklists (DoD, Code Review, Security, Release)

EOF
}

#-------------------------------------------------------------------------------
# Parsing des arguments
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
                print_usage
                exit 0
                ;;
            -*)
                log_error "Option inconnue: $1"
                print_usage
                exit 1
                ;;
            *)
                if [[ -z "$target_dir" ]]; then
                    target_dir="$1"
                else
                    log_error "Argument inattendu: $1"
                    print_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done

    # Si aucun filtre spécifié, installer tout
    if ! $agents_only && ! $commands_only && ! $templates_only && ! $checklists_only; then
        agents_only=true
        commands_only=true
        templates_only=true
        checklists_only=true
    fi

    # Répertoire cible par défaut
    if [[ -z "$target_dir" ]]; then
        target_dir="."
    fi

    # Résoudre le chemin absolu
    target_dir="$(cd "$target_dir" 2>/dev/null && pwd)" || {
        log_error "Répertoire cible invalide: $target_dir"
        exit 1
    }
}

#-------------------------------------------------------------------------------
# Fonctions d'installation
#-------------------------------------------------------------------------------
create_backup() {
    local file="$1"
    if [[ -f "$file" ]]; then
        local backup_file="${file}.backup.$(date +%Y%m%d_%H%M%S)"
        if $dry_run; then
            log_dry_run "Backup: $file -> $backup_file"
        else
            cp "$file" "$backup_file"
            log_info "Backup créé: $backup_file"
        fi
    fi
}

copy_file() {
    local src="$1"
    local dest="$2"
    local relative_dest="${dest#$target_dir/}"

    # Vérifier si le fichier source existe
    if [[ ! -f "$src" ]]; then
        log_error "Fichier source introuvable: $src"
        ((errors++))
        return 1
    fi

    # Créer le répertoire de destination
    local dest_dir="$(dirname "$dest")"
    if $dry_run; then
        if [[ ! -d "$dest_dir" ]]; then
            log_dry_run "Créer répertoire: $dest_dir"
        fi
    else
        mkdir -p "$dest_dir"
    fi

    # Vérifier si le fichier existe déjà
    if [[ -f "$dest" ]]; then
        if [[ "$action" == "install" ]] && ! $force; then
            log_warning "Fichier existant (skip): $relative_dest"
            ((files_skipped++))
            return 0
        fi

        # Backup si demandé
        if $backup; then
            create_backup "$dest"
        fi

        if $dry_run; then
            log_dry_run "Mise à jour: $relative_dest"
        else
            cp "$src" "$dest"
            log_info "Mis à jour: $relative_dest"
        fi
        ((files_updated++))
    else
        if $dry_run; then
            log_dry_run "Création: $relative_dest"
        else
            cp "$src" "$dest"
            log_success "Créé: $relative_dest"
        fi
        ((files_created++))
    fi
}

copy_directory() {
    local src_dir="$1"
    local dest_dir="$2"
    local pattern="${3:-*}"

    if [[ ! -d "$src_dir" ]]; then
        log_error "Répertoire source introuvable: $src_dir"
        ((errors++))
        return 1
    fi

    # Parcourir les fichiers
    while IFS= read -r -d '' file; do
        local relative_path="${file#$src_dir/}"
        local dest_file="$dest_dir/$relative_path"
        copy_file "$file" "$dest_file"
    done < <(find "$src_dir" -type f -name "$pattern" -print0)
}

#-------------------------------------------------------------------------------
# Installation des composants
#-------------------------------------------------------------------------------
install_agents() {
    log_info "Installation des agents..."

    local src_agents="$SCRIPT_DIR/claude-agents"
    local dest_agents="$target_dir/.claude/agents"

    if [[ -d "$src_agents" ]]; then
        copy_directory "$src_agents" "$dest_agents" "*.md"
    else
        log_warning "Répertoire agents non trouvé: $src_agents"
    fi
}

install_commands() {
    log_info "Installation des commandes /common:..."

    local src_commands="$SCRIPT_DIR/claude-commands/common"
    local dest_commands="$target_dir/.claude/commands/common"

    if [[ -d "$src_commands" ]]; then
        copy_directory "$src_commands" "$dest_commands" "*.md"
    else
        log_warning "Répertoire commandes non trouvé: $src_commands"
    fi
}

install_templates() {
    log_info "Installation des templates..."

    local src_templates="$SCRIPT_DIR/templates"
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
        log_warning "Répertoire templates non trouvé: $src_templates"
    fi
}

install_checklists() {
    log_info "Installation des checklists..."

    local src_checklists="$SCRIPT_DIR/checklists"
    local dest_checklists="$target_dir/.claude/checklists"

    if [[ -d "$src_checklists" ]]; then
        copy_directory "$src_checklists" "$dest_checklists" "*.md"
    else
        log_warning "Répertoire checklists non trouvé: $src_checklists"
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
# Affichage du résumé
#-------------------------------------------------------------------------------
print_summary() {
    echo ""
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN} 📊 RÉSUMÉ${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo ""

    if $dry_run; then
        echo -e "  ${CYAN}Mode:${NC} Dry-run (simulation)"
    else
        echo -e "  ${CYAN}Mode:${NC} $action"
    fi

    echo -e "  ${CYAN}Cible:${NC} $target_dir"
    echo ""
    echo -e "  ${GREEN}Fichiers créés:${NC}    $files_created"
    echo -e "  ${BLUE}Fichiers mis à jour:${NC} $files_updated"
    echo -e "  ${YELLOW}Fichiers ignorés:${NC}  $files_skipped"

    if [[ $errors -gt 0 ]]; then
        echo -e "  ${RED}Erreurs:${NC}           $errors"
    fi

    echo ""

    if $dry_run; then
        echo -e "${YELLOW}ℹ️  Exécutez sans --dry-run pour appliquer les changements.${NC}"
    elif [[ $errors -eq 0 ]]; then
        echo -e "${GREEN}✅ Installation terminée avec succès !${NC}"
    else
        echo -e "${RED}⚠️  Installation terminée avec des erreurs.${NC}"
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
