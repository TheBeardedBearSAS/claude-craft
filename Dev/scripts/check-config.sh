#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Claude Code Rules - Vérification de l'installation des projets
# ═══════════════════════════════════════════════════════════════════════════
#
# Ce script vérifie que les règles Claude Code sont correctement installées
# pour tous les projets définis dans le fichier de configuration YAML.
#
# Dépendances:
#   - yq (https://github.com/mikefarah/yq)
#
# Usage:
#   ./check-config.sh [OPTIONS] [CONFIG_FILE]
#
# Options:
#   --check           Vérification simple (défaut)
#   --fix             Proposer de corriger les problèmes
#   --project NAME    Vérifier uniquement ce projet
#   --help            Afficher l'aide
#
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_CONFIG="${SCRIPT_DIR}/../../claude-projects.yaml"
INSTALL_SCRIPT="${SCRIPT_DIR}/install-from-config.sh"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Variables globales
config_file=""
fix_mode=false
project_filter=""

# Compteurs
total_projects=0
ok_projects=0
total_issues=0
declare -a issues_list=()

# ─────────────────────────────────────────────────────────────────────────────
# Fonctions utilitaires
# ─────────────────────────────────────────────────────────────────────────────
log_ok() { echo -e "     ${GREEN}✓${NC} $1"; }
log_warn() { echo -e "     ${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "     ${RED}✗${NC} $1"; }
log_info() { echo -e "     ${BLUE}ℹ${NC} $1"; }

print_header() {
    echo ""
    echo -e "${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║${NC}  🔍 $1"
    echo -e "${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# ─────────────────────────────────────────────────────────────────────────────
# Vérification des dépendances
# ─────────────────────────────────────────────────────────────────────────────
check_dependencies() {
    if ! command -v yq &> /dev/null; then
        echo -e "${RED}✗${NC} yq n'est pas installé."
        echo ""
        echo "Installation:"
        echo "  Ubuntu/Debian: sudo apt install yq"
        echo "  macOS:         brew install yq"
        echo "  Manual:        https://github.com/mikefarah/yq"
        echo ""
        exit 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Affichage de l'aide
# ─────────────────────────────────────────────────────────────────────────────
show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS] [CONFIG_FILE]

Vérifie l'installation des règles Claude Code pour les projets configurés.

Options:
  --check           Vérification simple (défaut)
  --fix             Proposer de corriger les problèmes détectés
  --project NAME    Vérifier uniquement le projet spécifié
  --help            Afficher cette aide

Fichier de config:
  Si non spécifié, utilise: ${DEFAULT_CONFIG}

Exemples:
  $(basename "$0")                        # Vérifie tous les projets
  $(basename "$0") --project kapitain     # Vérifie un projet
  $(basename "$0") --fix                  # Vérifie et propose de corriger
  $(basename "$0") ./my-config.yaml       # Utilise un autre fichier

EOF
}

# ─────────────────────────────────────────────────────────────────────────────
# Parse des arguments
# ─────────────────────────────────────────────────────────────────────────────
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --check)
                shift
                ;;
            --fix)
                fix_mode=true
                shift
                ;;
            --project)
                project_filter="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            -*)
                echo -e "${RED}✗${NC} Option inconnue: $1"
                show_help
                exit 1
                ;;
            *)
                if [[ -z "$config_file" ]]; then
                    config_file="$1"
                else
                    echo -e "${RED}✗${NC} Argument inattendu: $1"
                    exit 1
                fi
                shift
                ;;
        esac
    done

    # Utiliser la config par défaut si non spécifiée
    if [[ -z "$config_file" ]]; then
        config_file="$DEFAULT_CONFIG"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Fonctions helpers de vérification
# ─────────────────────────────────────────────────────────────────────────────

# Vérifie un répertoire et compte les fichiers .md
# Args: $1=dir, $2=label, $3=min_count
# Returns: 0 si OK, 1 si problème
check_dir_count() {
    local dir="$1"
    local label="$2"
    local min_count="$3"

    if [[ ! -d "$dir" ]]; then
        log_error "$label: non trouvé"
        return 1
    fi

    local count
    count=$(find "$dir" -maxdepth 2 -name "*.md" 2>/dev/null | wc -l | tr -d ' ')

    if [[ $count -lt $min_count ]]; then
        log_warn "$label: $count fichiers (attendu: >= $min_count)"
        return 1
    fi

    log_ok "$label: $count fichiers"
    return 0
}

# Vérifie qu'un fichier existe
# Args: $1=file, $2=label
check_file_exists() {
    local file="$1"
    local label="$2"

    if [[ -f "$file" ]]; then
        log_ok "$label: présent"
        return 0
    else
        log_error "$label: non trouvé"
        return 1
    fi
}

# Vérifie un répertoire optionnel (info seulement)
# Args: $1=dir, $2=label
check_dir_optional() {
    local dir="$1"
    local label="$2"

    if [[ -d "$dir" ]]; then
        local count
        count=$(find "$dir" -maxdepth 2 -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
        log_info "$label: $count fichiers"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Vérification Common (règles transversales)
# ─────────────────────────────────────────────────────────────────────────────
check_common_installation() {
    local path="$1"
    local issues=0

    echo -e "   ${BOLD}Common:${NC}"

    if [[ ! -d "$path/.claude" ]]; then
        log_error ".claude/: non trouvé"
        return 1
    fi

    # Agents (obligatoire, min 5)
    check_dir_count "$path/.claude/agents" "agents" 5 || ((issues++)) || true

    # Commands/common (obligatoire, min 10)
    check_dir_count "$path/.claude/commands/common" "commands/common" 10 || ((issues++)) || true

    # Checklists (obligatoire, min 2)
    check_dir_count "$path/.claude/checklists" "checklists" 2 || ((issues++)) || true

    # Optionnels
    check_dir_optional "$path/.claude/commands/project" "commands/project"

    return $issues
}

# ─────────────────────────────────────────────────────────────────────────────
# Vérification Symfony
# ─────────────────────────────────────────────────────────────────────────────
check_symfony_installation() {
    local path="$1"
    local issues=0

    if [[ ! -d "$path/.claude" ]]; then
        log_error ".claude/: non trouvé"
        return 1
    fi

    # Rules (obligatoire - cœur de Symfony, min 15)
    check_dir_count "$path/.claude/rules" "rules" 15 || ((issues++)) || true

    # Commands/symfony (obligatoire, min 5)
    check_dir_count "$path/.claude/commands/symfony" "commands/symfony" 5 || ((issues++)) || true

    # Templates (obligatoire, min 5)
    check_dir_count "$path/.claude/templates" "templates" 5 || ((issues++)) || true

    # Checklists (obligatoire, min 3)
    check_dir_count "$path/.claude/checklists" "checklists" 3 || ((issues++)) || true

    # CLAUDE.md (obligatoire)
    check_file_exists "$path/.claude/CLAUDE.md" "CLAUDE.md" || ((issues++)) || true

    # Agents (obligatoire, min 1)
    check_dir_count "$path/.claude/agents" "agents" 1 || ((issues++)) || true

    # Optionnels
    check_dir_optional "$path/.claude/adr" "adr"
    check_dir_optional "$path/.claude/examples" "examples"

    return $issues
}

# ─────────────────────────────────────────────────────────────────────────────
# Vérification Flutter
# ─────────────────────────────────────────────────────────────────────────────
check_flutter_installation() {
    local path="$1"
    local issues=0

    if [[ ! -d "$path/.claude" ]]; then
        log_error ".claude/: non trouvé"
        return 1
    fi

    # Rules (obligatoire, min 10)
    check_dir_count "$path/.claude/rules" "rules" 10 || ((issues++)) || true

    # Commands/flutter (obligatoire, min 5)
    check_dir_count "$path/.claude/commands/flutter" "commands/flutter" 5 || ((issues++)) || true

    # Templates (obligatoire, min 3)
    check_dir_count "$path/.claude/templates" "templates" 3 || ((issues++)) || true

    # Checklists (obligatoire, min 2)
    check_dir_count "$path/.claude/checklists" "checklists" 2 || ((issues++)) || true

    # CLAUDE.md (obligatoire)
    check_file_exists "$path/.claude/CLAUDE.md" "CLAUDE.md" || ((issues++)) || true

    # Agents (obligatoire, min 1)
    check_dir_count "$path/.claude/agents" "agents" 1 || ((issues++)) || true

    return $issues
}

# ─────────────────────────────────────────────────────────────────────────────
# Vérification React
# ─────────────────────────────────────────────────────────────────────────────
check_react_installation() {
    local path="$1"
    local issues=0

    if [[ ! -d "$path/.claude" ]]; then
        log_error ".claude/: non trouvé"
        return 1
    fi

    # Rules (obligatoire, min 8)
    check_dir_count "$path/.claude/rules" "rules" 8 || ((issues++)) || true

    # Commands/react (obligatoire, min 5)
    check_dir_count "$path/.claude/commands/react" "commands/react" 5 || ((issues++)) || true

    # Templates (obligatoire, min 2)
    check_dir_count "$path/.claude/templates" "templates" 2 || ((issues++)) || true

    # Checklists (obligatoire, min 2)
    check_dir_count "$path/.claude/checklists" "checklists" 2 || ((issues++)) || true

    # CLAUDE.md (obligatoire)
    check_file_exists "$path/.claude/CLAUDE.md" "CLAUDE.md" || ((issues++)) || true

    # Agents (obligatoire, min 1)
    check_dir_count "$path/.claude/agents" "agents" 1 || ((issues++)) || true

    return $issues
}

# ─────────────────────────────────────────────────────────────────────────────
# Vérification React Native
# ─────────────────────────────────────────────────────────────────────────────
check_reactnative_installation() {
    local path="$1"
    local issues=0

    if [[ ! -d "$path/.claude" ]]; then
        log_error ".claude/: non trouvé"
        return 1
    fi

    # Rules (obligatoire, min 10)
    check_dir_count "$path/.claude/rules" "rules" 10 || ((issues++)) || true

    # Commands/reactnative (obligatoire, min 5)
    check_dir_count "$path/.claude/commands/reactnative" "commands/reactnative" 5 || ((issues++)) || true

    # Templates (obligatoire, min 2)
    check_dir_count "$path/.claude/templates" "templates" 2 || ((issues++)) || true

    # Checklists (obligatoire, min 2)
    check_dir_count "$path/.claude/checklists" "checklists" 2 || ((issues++)) || true

    # CLAUDE.md (obligatoire)
    check_file_exists "$path/.claude/CLAUDE.md" "CLAUDE.md" || ((issues++)) || true

    # Agents (obligatoire, min 1)
    check_dir_count "$path/.claude/agents" "agents" 1 || ((issues++)) || true

    return $issues
}

# ─────────────────────────────────────────────────────────────────────────────
# Vérification Python
# ─────────────────────────────────────────────────────────────────────────────
check_python_installation() {
    local path="$1"
    local issues=0

    if [[ ! -d "$path/.claude" ]]; then
        log_error ".claude/: non trouvé"
        return 1
    fi

    # Rules (obligatoire, min 6)
    check_dir_count "$path/.claude/rules" "rules" 6 || ((issues++)) || true

    # Commands/python (obligatoire, min 5)
    check_dir_count "$path/.claude/commands/python" "commands/python" 5 || ((issues++)) || true

    # Templates (obligatoire, min 2)
    check_dir_count "$path/.claude/templates" "templates" 2 || ((issues++)) || true

    # Checklists (obligatoire, min 2)
    check_dir_count "$path/.claude/checklists" "checklists" 2 || ((issues++)) || true

    # CLAUDE.md (obligatoire)
    check_file_exists "$path/.claude/CLAUDE.md" "CLAUDE.md" || ((issues++)) || true

    # Agents (obligatoire, min 1)
    check_dir_count "$path/.claude/agents" "agents" 1 || ((issues++)) || true

    return $issues
}

# ─────────────────────────────────────────────────────────────────────────────
# Dispatcher - vérifie un module selon sa technologie
# ─────────────────────────────────────────────────────────────────────────────
check_module() {
    local path="$1"
    local tech="$2"
    local label="$3"
    local issues=0

    echo -e "   ${BOLD}$label:${NC}"

    case "$tech" in
        symfony)
            check_symfony_installation "$path"
            issues=$?
            ;;
        flutter)
            check_flutter_installation "$path"
            issues=$?
            ;;
        react)
            check_react_installation "$path"
            issues=$?
            ;;
        reactnative)
            check_reactnative_installation "$path"
            issues=$?
            ;;
        python)
            check_python_installation "$path"
            issues=$?
            ;;
        *)
            log_warn "Technologie inconnue: $tech"
            issues=1
            ;;
    esac

    return $issues
}

# ─────────────────────────────────────────────────────────────────────────────
# Vérifier un projet
# ─────────────────────────────────────────────────────────────────────────────
check_project() {
    local project_index="$1"
    local project_ok=true
    local project_issues=0

    local name root common module_count
    name=$(yq e ".projects[$project_index].name" "$config_file")
    root=$(yq e ".projects[$project_index].root" "$config_file")
    common=$(yq e ".projects[$project_index].common // true" "$config_file")
    module_count=$(yq e ".projects[$project_index].modules | length" "$config_file")

    # Expand le chemin
    local expanded_root
    expanded_root=$(eval echo "$root")

    echo -e "\n${BOLD}📦 $name${NC}"

    # Vérifier que le root existe
    if [[ ! -d "$expanded_root" ]]; then
        log_error "Root: $expanded_root (non trouvé)"
        issues_list+=("$name:root")
        ((total_issues++)) || true
        return 1
    fi
    echo -e "   Root: ${CYAN}$expanded_root${NC} ${GREEN}✓${NC}"

    # Vérifier les règles communes
    if [[ "$common" == "true" ]]; then
        local common_issues=0
        check_common_installation "$expanded_root" || common_issues=$?
        if [[ $common_issues -gt 0 ]]; then
            issues_list+=("$name:common")
            ((total_issues += common_issues)) || true
            project_ok=false
        fi
    fi

    # Vérifier chaque module
    for ((j=0; j<module_count; j++)); do
        local path tech
        path=$(yq e ".projects[$project_index].modules[$j].path" "$config_file")
        tech=$(yq e ".projects[$project_index].modules[$j].tech" "$config_file")

        local target_path
        if [[ "$path" == "." ]]; then
            target_path="$expanded_root"
        elif [[ "$path" == /* ]]; then
            # Chemin absolu
            target_path="$path"
        else
            target_path="$expanded_root/$path"
        fi

        # Expand le chemin
        target_path=$(eval echo "$target_path")

        local module_label="Module $(basename "$target_path") [$tech]"

        if [[ ! -d "$target_path" ]]; then
            echo -e "   ${BOLD}$module_label:${NC}"
            log_error "répertoire non trouvé: $target_path"
            issues_list+=("$name:$tech:$target_path")
            ((total_issues++)) || true
            project_ok=false
            continue
        fi

        local module_issues=0
        check_module "$target_path" "$tech" "$module_label" || module_issues=$?
        if [[ $module_issues -gt 0 ]]; then
            issues_list+=("$name:$tech:$target_path")
            ((total_issues += module_issues)) || true
            project_ok=false
        fi
    done

    if [[ "$project_ok" == "true" ]]; then
        ((ok_projects++)) || true
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Proposer les corrections
# ─────────────────────────────────────────────────────────────────────────────
fix_issues() {
    if [[ ${#issues_list[@]} -eq 0 ]]; then
        return
    fi

    echo ""
    echo -e "${BOLD}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Corrections proposées :${NC}"
    echo -e "${BOLD}══════════════════════════════════════════════════════════════${NC}"
    echo ""

    # Extraire les projets uniques avec des problèmes
    declare -A projects_to_fix
    for issue in "${issues_list[@]}"; do
        local project_name="${issue%%:*}"
        projects_to_fix["$project_name"]=1
    done

    for project_name in "${!projects_to_fix[@]}"; do
        echo -e "  ${CYAN}→${NC} Réinstaller le projet ${BOLD}$project_name${NC}"
        echo -e "    Commande: ${GREEN}make config-install PROJECT=$project_name OPTIONS=--force${NC}"
        echo ""
    done

    echo -e "${YELLOW}Voulez-vous exécuter ces corrections ? (o/N)${NC}"
    read -r response

    if [[ "$response" =~ ^[oOyY]$ ]]; then
        for project_name in "${!projects_to_fix[@]}"; do
            echo ""
            echo -e "${CYAN}→ Installation de $project_name...${NC}"
            if [[ -x "$INSTALL_SCRIPT" ]]; then
                "$INSTALL_SCRIPT" --project "$project_name" --force "$config_file"
            else
                echo -e "${RED}✗${NC} Script d'installation introuvable: $INSTALL_SCRIPT"
            fi
        done
    else
        echo ""
        echo "Corrections annulées."
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Afficher le résumé
# ─────────────────────────────────────────────────────────────────────────────
print_summary() {
    echo ""
    echo -e "${BOLD}══════════════════════════════════════════════════════════════${NC}"

    if [[ $total_issues -eq 0 ]]; then
        echo -e "${GREEN}✓ Tous les projets sont correctement installés !${NC}"
        echo -e "  Projets vérifiés: $total_projects"
    else
        echo -e "${YELLOW}Résumé: $ok_projects/$total_projects projets OK, $total_issues problème(s) détecté(s)${NC}"

        if [[ "$fix_mode" == "false" ]]; then
            echo ""
            echo -e "  Pour corriger: ${CYAN}make config-check-fix${NC}"
        fi
    fi

    echo -e "${BOLD}══════════════════════════════════════════════════════════════${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────
# Point d'entrée principal
# ─────────────────────────────────────────────────────────────────────────────
main() {
    parse_args "$@"
    check_dependencies

    # Vérifier que le fichier de config existe
    if [[ ! -f "$config_file" ]]; then
        echo -e "${RED}✗${NC} Fichier de configuration introuvable: $config_file"
        exit 1
    fi

    print_header "Vérification des projets configurés"
    echo -e "Config: ${CYAN}$config_file${NC}"

    local project_count
    project_count=$(yq e '.projects | length' "$config_file")

    if [[ "$project_count" -eq 0 ]]; then
        echo -e "${YELLOW}⚠${NC} Aucun projet défini dans la configuration"
        exit 0
    fi

    # Vérifier chaque projet
    for ((i=0; i<project_count; i++)); do
        local name
        name=$(yq e ".projects[$i].name" "$config_file")

        # Filtrer par projet si demandé
        if [[ -n "$project_filter" && "$name" != "$project_filter" ]]; then
            continue
        fi

        ((total_projects++)) || true
        check_project "$i" || true
    done

    # Si un filtre était appliqué et aucun projet trouvé
    if [[ -n "$project_filter" && $total_projects -eq 0 ]]; then
        echo -e "${RED}✗${NC} Projet non trouvé: $project_filter"
        echo ""
        echo "Projets disponibles:"
        for ((i=0; i<project_count; i++)); do
            local name
            name=$(yq e ".projects[$i].name" "$config_file")
            echo "  - $name"
        done
        exit 1
    fi

    print_summary

    # Mode fix
    if [[ "$fix_mode" == "true" ]]; then
        fix_issues
    fi

    # Code de retour
    if [[ $total_issues -gt 0 ]]; then
        exit 1
    fi
    exit 0
}

main "$@"
