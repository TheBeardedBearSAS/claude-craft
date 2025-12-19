#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Claude Code Rules - Installation depuis fichier de configuration
# ═══════════════════════════════════════════════════════════════════════════
#
# Ce script lit un fichier de configuration YAML et installe les règles
# Claude Code selon les définitions de projets.
#
# Dépendances:
#   - yq (https://github.com/mikefarah/yq)
#
# Usage:
#   ./install-from-config.sh [OPTIONS] [CONFIG_FILE]
#
# Options:
#   --project NAME    Installer uniquement ce projet
#   --dry-run         Simuler l'installation
#   --validate        Valider la config sans installer
#   --list            Lister les projets configurés
#   --force           Forcer la réinstallation
#   --backup          Créer une backup avant modification
#   --help            Afficher l'aide
#
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_CONFIG="${SCRIPT_DIR}/../../claude-projects.yaml"
VALID_TECHS=("symfony" "flutter" "python" "react" "reactnative")
VALID_LANGS=("en" "fr" "es" "de" "pt")

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
project_filter=""
dry_run=false
validate_only=false
list_only=false
force_mode=false
preserve_config=false
backup_mode=false
default_lang="en"

# Compteurs
total_agents=0
total_commands=0
total_modules=0

# ─────────────────────────────────────────────────────────────────────────────
# Fonctions utilitaires
# ─────────────────────────────────────────────────────────────────────────────
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1" >&2; }
log_step() { echo -e "${CYAN}→${NC} $1"; }

print_header() {
    echo ""
    echo -e "${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║${NC}  $1"
    echo -e "${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${BOLD}──────────────────────────────────────────────────────────────${NC}"
    echo -e "${BOLD}$1${NC}"
    echo -e "${BOLD}──────────────────────────────────────────────────────────────${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────
# Vérification des dépendances
# ─────────────────────────────────────────────────────────────────────────────
check_dependencies() {
    if ! command -v yq &> /dev/null; then
        log_error "yq n'est pas installé."
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

Installation des règles Claude Code depuis un fichier de configuration YAML.

Options:
  --project NAME    Installer uniquement le projet spécifié
  --dry-run         Simuler l'installation sans modifications
  --validate        Valider la configuration sans installer
  --list            Lister les projets configurés
  --force           Forcer la réinstallation (écrase les fichiers existants)
  --preserve-config Avec --force, préserver CLAUDE.md et 00-project-context.md
  --backup          Créer une backup avant modification
  --help            Afficher cette aide

Fichier de config:
  Si non spécifié, utilise: ${DEFAULT_CONFIG}

Technologies supportées:
  symfony, flutter, python, react, reactnative

Exemples:
  $(basename "$0") --list
  $(basename "$0") --validate ./my-config.yaml
  $(basename "$0") --project ecommerce-platform
  $(basename "$0") --dry-run --project saas-platform
  $(basename "$0") --force --backup ./claude-projects.yaml

EOF
}

# ─────────────────────────────────────────────────────────────────────────────
# Parse des arguments
# ─────────────────────────────────────────────────────────────────────────────
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --project)
                project_filter="$2"
                shift 2
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --validate)
                validate_only=true
                shift
                ;;
            --list)
                list_only=true
                shift
                ;;
            --force)
                force_mode=true
                shift
                ;;
            --preserve-config)
                preserve_config=true
                shift
                ;;
            --backup)
                backup_mode=true
                shift
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
                if [[ -z "$config_file" ]]; then
                    config_file="$1"
                else
                    log_error "Argument inattendu: $1"
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
# Validation de la configuration
# ─────────────────────────────────────────────────────────────────────────────
validate_config() {
    local errors=0

    print_section "Validation de la configuration"
    log_info "Fichier: $config_file"
    echo ""

    # Vérifier que le fichier existe
    if [[ ! -f "$config_file" ]]; then
        log_error "Le fichier de configuration n'existe pas: $config_file"
        return 1
    fi

    # Vérifier la syntaxe YAML
    if ! yq e '.' "$config_file" > /dev/null 2>&1; then
        log_error "Syntaxe YAML invalide"
        return 1
    fi
    log_success "Syntaxe YAML valide"

    # Vérifier la présence de projets
    local project_count
    project_count=$(yq e '.projects | length' "$config_file")
    if [[ "$project_count" -eq 0 ]]; then
        log_error "Aucun projet défini dans la configuration"
        return 1
    fi
    log_success "$project_count projet(s) défini(s)"

    # Valider la langue par défaut (settings.default_lang)
    local default_lang
    default_lang=$(yq e '.settings.default_lang // "en"' "$config_file")
    local lang_valid=false
    for valid_lang in "${VALID_LANGS[@]}"; do
        if [[ "$default_lang" == "$valid_lang" ]]; then
            lang_valid=true
            break
        fi
    done
    if [[ "$lang_valid" == "false" ]]; then
        log_error "Langue par défaut invalide: $default_lang"
        log_error "Langues valides: ${VALID_LANGS[*]}"
        ((errors++))
    else
        log_success "Langue par défaut: $default_lang"
    fi

    # Valider chaque projet
    for ((i=0; i<project_count; i++)); do
        local name root common module_count project_lang
        name=$(yq e ".projects[$i].name" "$config_file")
        root=$(yq e ".projects[$i].root" "$config_file")
        common=$(yq e ".projects[$i].common // true" "$config_file")
        module_count=$(yq e ".projects[$i].modules | length" "$config_file")
        project_lang=$(yq e ".projects[$i].lang // \"\"" "$config_file")

        echo ""
        log_info "Projet: $name"

        # Vérifier les champs obligatoires
        if [[ "$name" == "null" || -z "$name" ]]; then
            log_error "  Champ 'name' manquant pour le projet $((i+1))"
            ((errors++))
        fi

        if [[ "$root" == "null" || -z "$root" ]]; then
            log_error "  Champ 'root' manquant pour le projet: $name"
            ((errors++))
        else
            # Expand le chemin
            local expanded_root
            expanded_root=$(eval echo "$root")
            log_step "  Root: $expanded_root"
        fi

        if [[ "$module_count" -eq 0 ]]; then
            log_error "  Aucun module défini pour le projet: $name"
            ((errors++))
        else
            log_step "  Modules: $module_count"
        fi

        # Valider la langue du projet si définie
        if [[ -n "$project_lang" && "$project_lang" != "null" ]]; then
            local project_lang_valid=false
            for valid_lang in "${VALID_LANGS[@]}"; do
                if [[ "$project_lang" == "$valid_lang" ]]; then
                    project_lang_valid=true
                    break
                fi
            done
            if [[ "$project_lang_valid" == "false" ]]; then
                log_error "  Langue invalide pour le projet: $project_lang"
                log_error "  Langues valides: ${VALID_LANGS[*]}"
                ((errors++))
            else
                log_step "  Langue: $project_lang"
            fi
        fi

        # Valider chaque module
        for ((j=0; j<module_count; j++)); do
            local path tech
            path=$(yq e ".projects[$i].modules[$j].path" "$config_file")
            tech=$(yq e ".projects[$i].modules[$j].tech" "$config_file")

            if [[ "$path" == "null" || -z "$path" ]]; then
                log_error "    Module $((j+1)): champ 'path' manquant"
                ((errors++))
                continue
            fi

            if [[ "$tech" == "null" || -z "$tech" ]]; then
                log_error "    Module '$path': champ 'tech' manquant"
                ((errors++))
                continue
            fi

            # Vérifier que la technologie est valide
            local valid=false
            for valid_tech in "${VALID_TECHS[@]}"; do
                if [[ "$tech" == "$valid_tech" ]]; then
                    valid=true
                    break
                fi
            done

            if [[ "$valid" == "false" ]]; then
                log_error "    Module '$path': technologie '$tech' invalide"
                log_error "    Technologies valides: ${VALID_TECHS[*]}"
                ((errors++))
            else
                log_success "    $path → $tech"
            fi
        done
    done

    echo ""
    if [[ $errors -gt 0 ]]; then
        log_error "Validation échouée avec $errors erreur(s)"
        return 1
    else
        log_success "Configuration valide"
        return 0
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Lister les projets
# ─────────────────────────────────────────────────────────────────────────────
list_projects() {
    print_header "📋 Projets configurés"

    # Afficher la langue par défaut
    echo -e "Langue par défaut: ${BOLD}$default_lang${NC}"
    echo ""

    local project_count
    project_count=$(yq e '.projects | length' "$config_file")

    for ((i=0; i<project_count; i++)); do
        local name description root common module_count project_lang
        name=$(yq e ".projects[$i].name" "$config_file")
        description=$(yq e ".projects[$i].description // \"\"" "$config_file")
        root=$(yq e ".projects[$i].root" "$config_file")
        common=$(yq e ".projects[$i].common // true" "$config_file")
        module_count=$(yq e ".projects[$i].modules | length" "$config_file")
        project_lang=$(yq e ".projects[$i].lang // \"\"" "$config_file")

        local expanded_root
        expanded_root=$(eval echo "$root")

        echo -e "${BOLD}$name${NC}"
        if [[ -n "$description" && "$description" != "null" ]]; then
            echo -e "  ${CYAN}$description${NC}"
        fi
        echo "  Root: $expanded_root"
        if [[ -n "$project_lang" && "$project_lang" != "null" ]]; then
            echo "  Lang: $project_lang"
        else
            echo "  Lang: (default: $default_lang)"
        fi
        echo "  Common: $common"
        echo "  Modules:"

        for ((j=0; j<module_count; j++)); do
            local path tech desc
            path=$(yq e ".projects[$i].modules[$j].path" "$config_file")
            tech=$(yq e ".projects[$i].modules[$j].tech" "$config_file")
            desc=$(yq e ".projects[$i].modules[$j].description // \"\"" "$config_file")

            if [[ "$path" == "." ]]; then
                path="(racine)"
            fi

            echo -n "    - $path [$tech]"
            if [[ -n "$desc" && "$desc" != "null" ]]; then
                echo -e " ${CYAN}$desc${NC}"
            else
                echo ""
            fi
        done
        echo ""
    done
}

# ─────────────────────────────────────────────────────────────────────────────
# Obtenir le script d'installation pour une technologie
# ─────────────────────────────────────────────────────────────────────────────
get_install_script() {
    local tech="$1"
    local script=""

    case "$tech" in
        symfony)
            script="${SCRIPT_DIR}/install-symfony-rules.sh"
            ;;
        flutter)
            script="${SCRIPT_DIR}/install-flutter-rules.sh"
            ;;
        python)
            script="${SCRIPT_DIR}/install-python-rules.sh"
            ;;
        react)
            script="${SCRIPT_DIR}/install-react-rules.sh"
            ;;
        reactnative)
            script="${SCRIPT_DIR}/install-reactnative-rules.sh"
            ;;
        common)
            script="${SCRIPT_DIR}/install-common-rules.sh"
            ;;
    esac

    echo "$script"
}

# ─────────────────────────────────────────────────────────────────────────────
# Installer les règles pour un module
# ─────────────────────────────────────────────────────────────────────────────
install_module() {
    local target_path="$1"
    local tech="$2"
    local description="$3"
    local lang="$4"

    local script
    script=$(get_install_script "$tech")

    if [[ ! -f "$script" ]]; then
        log_error "Script d'installation introuvable: $script"
        return 1
    fi

    # Construire les options
    local opts=("--install")
    if [[ "$force_mode" == "true" ]]; then
        opts=("--force")
    fi
    if [[ "$preserve_config" == "true" ]]; then
        opts+=("--preserve-config")
    fi
    if [[ "$backup_mode" == "true" ]]; then
        opts+=("--backup")
    fi
    # Ajouter la langue
    opts+=("--lang=$lang")

    local label="$tech"
    if [[ -n "$description" && "$description" != "null" ]]; then
        label="$tech ($description)"
    fi

    log_step "$target_path"
    log_info "  Technologie: $label"
    log_info "  Langue: $lang"

    if [[ "$dry_run" == "true" ]]; then
        log_info "  [DRY-RUN] Exécuterait: $script ${opts[*]} $target_path"
    else
        # Créer le répertoire si nécessaire
        if [[ ! -d "$target_path" ]]; then
            mkdir -p "$target_path"
        fi

        # Exécuter le script
        if "$script" "${opts[@]}" "$target_path"; then
            log_success "  Installation réussie"

            # Compter les fichiers installés
            local agents_count commands_count
            agents_count=$(find "$target_path/.claude/agents" -name "*.md" 2>/dev/null | wc -l || echo "0")
            commands_count=$(find "$target_path/.claude/commands" -name "*.md" 2>/dev/null | wc -l || echo "0")

            total_agents=$((total_agents + agents_count))
            total_commands=$((total_commands + commands_count))
            total_modules=$((total_modules + 1))
        else
            log_error "  Installation échouée"
            return 1
        fi
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Installer un projet
# ─────────────────────────────────────────────────────────────────────────────
install_project() {
    local project_index="$1"

    local name description root common module_count project_lang
    name=$(yq e ".projects[$project_index].name" "$config_file")
    description=$(yq e ".projects[$project_index].description // \"\"" "$config_file")
    root=$(yq e ".projects[$project_index].root" "$config_file")
    common=$(yq e ".projects[$project_index].common // true" "$config_file")
    module_count=$(yq e ".projects[$project_index].modules | length" "$config_file")
    # Langue du projet avec fallback sur default_lang
    project_lang=$(yq e ".projects[$project_index].lang // \"$default_lang\"" "$config_file")

    # Expand le chemin
    local expanded_root
    expanded_root=$(eval echo "$root")

    print_header "📦 Installation: $name"

    echo "Projet: $name"
    if [[ -n "$description" && "$description" != "null" ]]; then
        echo "Description: $description"
    fi
    echo "Root: $expanded_root"
    echo "Langue: $project_lang"
    echo ""

    # Vérifier que le répertoire racine existe
    if [[ ! -d "$expanded_root" ]]; then
        if [[ "$dry_run" == "true" ]]; then
            log_info "[DRY-RUN] Créerait le répertoire: $expanded_root"
        else
            log_warning "Le répertoire n'existe pas, création: $expanded_root"
            mkdir -p "$expanded_root"
        fi
    fi

    local step=1
    local total_steps=$module_count
    if [[ "$common" == "true" ]]; then
        total_steps=$((total_steps + 1))
    fi

    # Installer les règles communes si demandé
    if [[ "$common" == "true" ]]; then
        print_section "[$step/$total_steps] Installation des règles communes"
        install_module "$expanded_root" "common" "" "$project_lang"
        ((step++))
    fi

    # Installer chaque module
    for ((j=0; j<module_count; j++)); do
        local path tech desc
        path=$(yq e ".projects[$project_index].modules[$j].path" "$config_file")
        tech=$(yq e ".projects[$project_index].modules[$j].tech" "$config_file")
        desc=$(yq e ".projects[$project_index].modules[$j].description // \"\"" "$config_file")

        print_section "[$step/$total_steps] Installation $tech"

        local target_path
        if [[ "$path" == "." ]]; then
            target_path="$expanded_root"
        elif [[ "$path" == /* ]]; then
            # Chemin absolu - utiliser tel quel
            target_path="$path"
        else
            # Chemin relatif - concaténer avec root
            target_path="$expanded_root/$path"
        fi

        # Créer le répertoire cible s'il n'existe pas
        if [[ ! -d "$target_path" ]]; then
            if [[ "$dry_run" == "true" ]]; then
                log_info "[DRY-RUN] Créerait le répertoire: $target_path"
            else
                log_warning "Le répertoire n'existe pas, création: $target_path"
                mkdir -p "$target_path"
            fi
        fi

        install_module "$target_path" "$tech" "$desc" "$project_lang"
        ((step++))
    done
}

# ─────────────────────────────────────────────────────────────────────────────
# Installation principale
# ─────────────────────────────────────────────────────────────────────────────
install_all() {
    local project_count
    project_count=$(yq e '.projects | length' "$config_file")

    for ((i=0; i<project_count; i++)); do
        local name
        name=$(yq e ".projects[$i].name" "$config_file")

        # Filtrer par projet si demandé
        if [[ -n "$project_filter" && "$name" != "$project_filter" ]]; then
            continue
        fi

        install_project "$i"
    done

    # Si un filtre était appliqué et aucun projet trouvé
    if [[ -n "$project_filter" ]]; then
        local found=false
        for ((i=0; i<project_count; i++)); do
            local name
            name=$(yq e ".projects[$i].name" "$config_file")
            if [[ "$name" == "$project_filter" ]]; then
                found=true
                break
            fi
        done
        if [[ "$found" == "false" ]]; then
            log_error "Projet non trouvé: $project_filter"
            echo ""
            echo "Projets disponibles:"
            for ((i=0; i<project_count; i++)); do
                local name
                name=$(yq e ".projects[$i].name" "$config_file")
                echo "  - $name"
            done
            exit 1
        fi
    fi

    # Résumé final
    if [[ "$dry_run" == "false" ]]; then
        echo ""
        echo -e "${BOLD}══════════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}✓ Installation terminée!${NC}"
        echo ""
        echo "   Modules configurés: $total_modules"
        echo "   Agents installés:   $total_agents"
        echo "   Commandes installées: $total_commands"
        echo -e "${BOLD}══════════════════════════════════════════════════════════════${NC}"
    else
        echo ""
        echo -e "${YELLOW}[DRY-RUN] Aucune modification effectuée${NC}"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Point d'entrée principal
# ─────────────────────────────────────────────────────────────────────────────
main() {
    parse_args "$@"
    check_dependencies

    # Vérifier que le fichier de config existe
    if [[ ! -f "$config_file" ]]; then
        log_error "Fichier de configuration introuvable: $config_file"
        echo ""
        echo "Créez un fichier de configuration à partir du template:"
        echo "  cp claude-projects.yaml.example claude-projects.yaml"
        echo ""
        exit 1
    fi

    # Lire la langue par défaut depuis la configuration
    default_lang=$(yq e '.settings.default_lang // "en"' "$config_file")

    # Mode liste uniquement (après lecture de default_lang pour l'affichage)
    if [[ "$list_only" == "true" ]]; then
        list_projects
        exit 0
    fi

    # Mode validation uniquement
    if [[ "$validate_only" == "true" ]]; then
        if validate_config; then
            exit 0
        else
            exit 1
        fi
    fi

    # Validation avant installation
    if ! validate_config; then
        exit 1
    fi

    # Installation
    if [[ "$dry_run" == "true" ]]; then
        print_header "🔍 Mode simulation (dry-run)"
    fi

    install_all
}

main "$@"
