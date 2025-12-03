#!/bin/bash
# =============================================================================
# Claude Projects Manager
# Gère les projets dans claude-projects.yaml de manière interactive
# =============================================================================

set -e

# Configuration
DEFAULT_CONFIG="$HOME/.claude/claude-projects.yaml"
CONFIG_FILE=""

# Couleurs
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BLUE='\033[0;34m'
C_MAGENTA='\033[0;35m'
C_CYAN='\033[0;36m'
C_DIM='\033[2m'

# Technologies disponibles
AVAILABLE_TECHS=("symfony" "flutter" "python" "react" "reactnative")

# =============================================================================
# Utilitaires
# =============================================================================

print_header() {
    echo -e "\n${C_CYAN}╔════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${C_CYAN}║${C_RESET}     ${C_BOLD}📁 Claude Projects Manager${C_RESET}                            ${C_CYAN}║${C_RESET}"
    echo -e "${C_CYAN}╚════════════════════════════════════════════════════════════╝${C_RESET}\n"
}

print_success() { echo -e "${C_GREEN}✓${C_RESET} $1"; }
print_error() { echo -e "${C_RED}✗${C_RESET} $1"; }
print_info() { echo -e "${C_BLUE}ℹ${C_RESET} $1"; }
print_warning() { echo -e "${C_YELLOW}⚠${C_RESET} $1"; }

check_yq() {
    if ! command -v yq &>/dev/null; then
        print_error "yq est requis mais non installé"
        echo ""
        echo "Installation:"
        echo "  Ubuntu/Debian: sudo apt install yq"
        echo "  macOS:         brew install yq"
        echo "  Snap:          sudo snap install yq"
        exit 1
    fi
}

ensure_config_file() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        print_info "Création du fichier de configuration..."
        mkdir -p "$(dirname "$CONFIG_FILE")"
        cat > "$CONFIG_FILE" << 'YAML'
# Claude Code Projects Configuration
# Géré par claude-projects

settings:
  default_mode: "install"
  backup: true

projects: []
YAML
        print_success "Fichier créé: $CONFIG_FILE"
    fi
}

select_config_file() {
    echo -e "${C_BOLD}📄 Fichier de configuration${C_RESET}\n"

    local configs=()

    # Cherche les fichiers existants
    [[ -f "$DEFAULT_CONFIG" ]] && configs+=("$DEFAULT_CONFIG")
    [[ -f "./claude-projects.yaml" ]] && configs+=("./claude-projects.yaml")
    [[ -f "./Dev/claude-projects.yaml" ]] && configs+=("./Dev/claude-projects.yaml")

    if [[ ${#configs[@]} -gt 0 ]]; then
        echo "Fichiers trouvés:"
        local i=1
        for cfg in "${configs[@]}"; do
            echo -e "  ${C_CYAN}$i)${C_RESET} $cfg"
            ((i++))
        done
        echo -e "  ${C_CYAN}$i)${C_RESET} Autre chemin..."
        echo -e "  ${C_CYAN}n)${C_RESET} Nouveau fichier"
        echo ""
        read -p "Choix: " choice

        if [[ "$choice" == "n" ]]; then
            read -p "Chemin du nouveau fichier: " CONFIG_FILE
            CONFIG_FILE="${CONFIG_FILE/#\~/$HOME}"
        elif [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -le "${#configs[@]}" ]]; then
            CONFIG_FILE="${configs[$((choice-1))]}"
        elif [[ "$choice" =~ ^[0-9]+$ ]]; then
            read -p "Chemin du fichier: " CONFIG_FILE
            CONFIG_FILE="${CONFIG_FILE/#\~/$HOME}"
        else
            CONFIG_FILE="$DEFAULT_CONFIG"
        fi
    else
        echo "Aucun fichier trouvé."
        read -p "Chemin du fichier (défaut: $DEFAULT_CONFIG): " CONFIG_FILE
        CONFIG_FILE="${CONFIG_FILE:-$DEFAULT_CONFIG}"
        CONFIG_FILE="${CONFIG_FILE/#\~/$HOME}"
    fi

    ensure_config_file
    print_success "Configuration: $CONFIG_FILE"
}

# =============================================================================
# Gestion des projets
# =============================================================================

list_projects() {
    echo -e "\n${C_BOLD}📋 Projets configurés${C_RESET}\n"

    local count=$(yq '.projects | length' "$CONFIG_FILE")

    if [[ "$count" == "0" ]] || [[ -z "$count" ]]; then
        print_warning "Aucun projet configuré"
        echo -e "   Utilise ${C_CYAN}Ajouter un projet${C_RESET} pour commencer\n"
        return
    fi

    for ((i=0; i<count; i++)); do
        local name=$(yq ".projects[$i].name" "$CONFIG_FILE")
        local desc=$(yq ".projects[$i].description // \"\"" "$CONFIG_FILE")
        local root=$(yq ".projects[$i].root" "$CONFIG_FILE")
        local common=$(yq ".projects[$i].common // false" "$CONFIG_FILE")
        local modules_count=$(yq ".projects[$i].modules | length" "$CONFIG_FILE")

        echo -e "  ${C_CYAN}$((i+1)))${C_RESET} ${C_BOLD}$name${C_RESET}"
        [[ -n "$desc" && "$desc" != "null" ]] && echo -e "     ${C_DIM}$desc${C_RESET}"
        echo -e "     📂 $root"
        echo -e "     📦 $modules_count module(s) | Common: $([ "$common" == "true" ] && echo "✓" || echo "✗")"

        # Liste les modules
        for ((j=0; j<modules_count; j++)); do
            local mod_path=$(yq ".projects[$i].modules[$j].path" "$CONFIG_FILE")
            local mod_tech=$(yq ".projects[$i].modules[$j].tech" "$CONFIG_FILE")
            echo -e "        └─ ${C_YELLOW}$mod_path${C_RESET} → $mod_tech"
        done
        echo ""
    done
}

add_project() {
    echo -e "\n${C_BOLD}➕ Ajouter un nouveau projet${C_RESET}\n"

    # Nom du projet
    read -p "Nom du projet (ex: mon-app): " proj_name
    if [[ -z "$proj_name" ]]; then
        print_error "Le nom ne peut pas être vide"
        return 1
    fi

    # Vérifie si le projet existe déjà
    local exists=$(yq ".projects[] | select(.name == \"$proj_name\") | .name" "$CONFIG_FILE")
    if [[ -n "$exists" ]]; then
        print_error "Le projet '$proj_name' existe déjà"
        return 1
    fi

    # Description
    read -p "Description (optionnel): " proj_desc

    # Chemin racine
    read -p "Chemin racine (ex: ~/Projects/mon-app): " proj_root
    if [[ -z "$proj_root" ]]; then
        print_error "Le chemin ne peut pas être vide"
        return 1
    fi

    # Common
    read -p "Installer les règles communes à la racine ? (O/n): " common_choice
    local proj_common="true"
    [[ "$common_choice" =~ ^[Nn]$ ]] && proj_common="false"

    # Ajoute le projet
    yq -i ".projects += [{\"name\": \"$proj_name\", \"description\": \"$proj_desc\", \"root\": \"$proj_root\", \"common\": $proj_common, \"modules\": []}]" "$CONFIG_FILE"

    print_success "Projet '$proj_name' créé"

    # Propose d'ajouter des modules
    echo ""
    read -p "Ajouter des modules maintenant ? (O/n): " add_modules
    if [[ ! "$add_modules" =~ ^[Nn]$ ]]; then
        add_module_to_project "$proj_name"
    fi
}

add_module_to_project() {
    local proj_name="$1"

    if [[ -z "$proj_name" ]]; then
        echo -e "\n${C_BOLD}📦 Ajouter un module${C_RESET}\n"

        # Liste les projets pour sélection
        local count=$(yq '.projects | length' "$CONFIG_FILE")
        if [[ "$count" == "0" ]]; then
            print_warning "Aucun projet configuré"
            return
        fi

        echo "Sélectionne un projet:"
        for ((i=0; i<count; i++)); do
            local name=$(yq ".projects[$i].name" "$CONFIG_FILE")
            echo -e "  ${C_CYAN}$((i+1)))${C_RESET} $name"
        done

        read -p "Choix: " choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -le "$count" ]]; then
            proj_name=$(yq ".projects[$((choice-1))].name" "$CONFIG_FILE")
        else
            print_error "Choix invalide"
            return 1
        fi
    fi

    local proj_index=$(yq ".projects | to_entries | .[] | select(.value.name == \"$proj_name\") | .key" "$CONFIG_FILE")

    while true; do
        echo ""
        echo -e "${C_BOLD}Ajouter un module à '$proj_name'${C_RESET}\n"

        # Path du module
        read -p "Chemin du module (ex: frontend, backend, . pour racine): " mod_path
        if [[ -z "$mod_path" ]]; then
            print_error "Le chemin ne peut pas être vide"
            continue
        fi

        # Technologie
        echo ""
        echo "Technologies disponibles:"
        for ((i=0; i<${#AVAILABLE_TECHS[@]}; i++)); do
            echo -e "  ${C_CYAN}$((i+1)))${C_RESET} ${AVAILABLE_TECHS[$i]}"
        done

        read -p "Choix: " tech_choice
        if [[ "$tech_choice" =~ ^[0-9]+$ ]] && [[ "$tech_choice" -ge 1 ]] && [[ "$tech_choice" -le "${#AVAILABLE_TECHS[@]}" ]]; then
            local mod_tech="${AVAILABLE_TECHS[$((tech_choice-1))]}"
        else
            print_error "Choix invalide"
            continue
        fi

        # Description (optionnel)
        read -p "Description (optionnel): " mod_desc

        # Ajoute le module
        if [[ -n "$mod_desc" ]]; then
            yq -i ".projects[$proj_index].modules += [{\"path\": \"$mod_path\", \"tech\": \"$mod_tech\", \"description\": \"$mod_desc\"}]" "$CONFIG_FILE"
        else
            yq -i ".projects[$proj_index].modules += [{\"path\": \"$mod_path\", \"tech\": \"$mod_tech\"}]" "$CONFIG_FILE"
        fi

        print_success "Module '$mod_path' ($mod_tech) ajouté"

        echo ""
        read -p "Ajouter un autre module ? (o/N): " another
        [[ ! "$another" =~ ^[OoYy]$ ]] && break
    done
}

edit_project() {
    echo -e "\n${C_BOLD}✏️  Modifier un projet${C_RESET}\n"

    local count=$(yq '.projects | length' "$CONFIG_FILE")
    if [[ "$count" == "0" ]]; then
        print_warning "Aucun projet configuré"
        return
    fi

    # Liste les projets
    echo "Sélectionne un projet à modifier:"
    for ((i=0; i<count; i++)); do
        local name=$(yq ".projects[$i].name" "$CONFIG_FILE")
        echo -e "  ${C_CYAN}$((i+1)))${C_RESET} $name"
    done

    read -p "Choix: " choice
    if [[ ! "$choice" =~ ^[0-9]+$ ]] || [[ "$choice" -lt 1 ]] || [[ "$choice" -gt "$count" ]]; then
        print_error "Choix invalide"
        return 1
    fi

    local proj_index=$((choice-1))
    local proj_name=$(yq ".projects[$proj_index].name" "$CONFIG_FILE")
    local proj_desc=$(yq ".projects[$proj_index].description // \"\"" "$CONFIG_FILE")
    local proj_root=$(yq ".projects[$proj_index].root" "$CONFIG_FILE")
    local proj_common=$(yq ".projects[$proj_index].common // false" "$CONFIG_FILE")

    echo ""
    echo -e "${C_BOLD}Modification de '$proj_name'${C_RESET}"
    echo -e "${C_DIM}(Appuie sur Entrée pour garder la valeur actuelle)${C_RESET}\n"

    # Nom
    read -p "Nom [$proj_name]: " new_name
    [[ -n "$new_name" ]] && yq -i ".projects[$proj_index].name = \"$new_name\"" "$CONFIG_FILE"

    # Description
    read -p "Description [$proj_desc]: " new_desc
    [[ -n "$new_desc" ]] && yq -i ".projects[$proj_index].description = \"$new_desc\"" "$CONFIG_FILE"

    # Root
    read -p "Chemin racine [$proj_root]: " new_root
    [[ -n "$new_root" ]] && yq -i ".projects[$proj_index].root = \"$new_root\"" "$CONFIG_FILE"

    # Common
    local common_display=$([ "$proj_common" == "true" ] && echo "O/n" || echo "o/N")
    read -p "Installer common ? [$common_display]: " new_common
    if [[ "$new_common" =~ ^[OoYy]$ ]]; then
        yq -i ".projects[$proj_index].common = true" "$CONFIG_FILE"
    elif [[ "$new_common" =~ ^[Nn]$ ]]; then
        yq -i ".projects[$proj_index].common = false" "$CONFIG_FILE"
    fi

    print_success "Projet modifié"

    # Propose de gérer les modules
    echo ""
    read -p "Gérer les modules ? (o/N): " manage_modules
    if [[ "$manage_modules" =~ ^[OoYy]$ ]]; then
        manage_project_modules "$proj_index"
    fi
}

manage_project_modules() {
    local proj_index="$1"
    local proj_name=$(yq ".projects[$proj_index].name" "$CONFIG_FILE")

    while true; do
        echo ""
        echo -e "${C_BOLD}Modules de '$proj_name'${C_RESET}\n"

        local modules_count=$(yq ".projects[$proj_index].modules | length" "$CONFIG_FILE")

        if [[ "$modules_count" == "0" ]]; then
            print_warning "Aucun module"
        else
            for ((j=0; j<modules_count; j++)); do
                local mod_path=$(yq ".projects[$proj_index].modules[$j].path" "$CONFIG_FILE")
                local mod_tech=$(yq ".projects[$proj_index].modules[$j].tech" "$CONFIG_FILE")
                echo -e "  ${C_CYAN}$((j+1)))${C_RESET} $mod_path → ${C_YELLOW}$mod_tech${C_RESET}"
            done
        fi

        echo ""
        echo -e "  ${C_GREEN}a)${C_RESET} Ajouter un module"
        echo -e "  ${C_RED}d)${C_RESET} Supprimer un module"
        echo -e "  ${C_DIM}q)${C_RESET} Retour"
        echo ""

        read -p "Choix: " action

        case "$action" in
            a|A)
                add_module_to_project "$proj_name"
                ;;
            d|D)
                if [[ "$modules_count" -gt 0 ]]; then
                    read -p "Numéro du module à supprimer: " del_choice
                    if [[ "$del_choice" =~ ^[0-9]+$ ]] && [[ "$del_choice" -ge 1 ]] && [[ "$del_choice" -le "$modules_count" ]]; then
                        yq -i "del(.projects[$proj_index].modules[$((del_choice-1))])" "$CONFIG_FILE"
                        print_success "Module supprimé"
                    else
                        print_error "Choix invalide"
                    fi
                fi
                ;;
            q|Q)
                break
                ;;
        esac
    done
}

delete_project() {
    echo -e "\n${C_BOLD}🗑️  Supprimer un projet${C_RESET}\n"

    local count=$(yq '.projects | length' "$CONFIG_FILE")
    if [[ "$count" == "0" ]]; then
        print_warning "Aucun projet configuré"
        return
    fi

    # Liste les projets
    echo "Sélectionne un projet à supprimer:"
    for ((i=0; i<count; i++)); do
        local name=$(yq ".projects[$i].name" "$CONFIG_FILE")
        echo -e "  ${C_CYAN}$((i+1)))${C_RESET} $name"
    done

    read -p "Choix: " choice
    if [[ ! "$choice" =~ ^[0-9]+$ ]] || [[ "$choice" -lt 1 ]] || [[ "$choice" -gt "$count" ]]; then
        print_error "Choix invalide"
        return 1
    fi

    local proj_index=$((choice-1))
    local proj_name=$(yq ".projects[$proj_index].name" "$CONFIG_FILE")

    echo ""
    print_warning "Tu vas supprimer le projet '${C_BOLD}$proj_name${C_RESET}'"
    read -p "Confirmer ? (o/N): " confirm

    if [[ "$confirm" =~ ^[OoYy]$ ]]; then
        yq -i "del(.projects[$proj_index])" "$CONFIG_FILE"
        print_success "Projet '$proj_name' supprimé"
    else
        print_info "Suppression annulée"
    fi
}

validate_config() {
    echo -e "\n${C_BOLD}✅ Validation de la configuration${C_RESET}\n"

    local errors=0
    local warnings=0
    local count=$(yq '.projects | length' "$CONFIG_FILE")

    if [[ "$count" == "0" ]]; then
        print_warning "Aucun projet configuré"
        return
    fi

    for ((i=0; i<count; i++)); do
        local name=$(yq ".projects[$i].name" "$CONFIG_FILE")
        local root=$(yq ".projects[$i].root" "$CONFIG_FILE")
        local modules_count=$(yq ".projects[$i].modules | length" "$CONFIG_FILE")

        echo -e "Projet: ${C_BOLD}$name${C_RESET}"

        # Vérifie le nom
        if [[ -z "$name" || "$name" == "null" ]]; then
            print_error "  Nom manquant"
            ((errors++))
        fi

        # Vérifie le root
        if [[ -z "$root" || "$root" == "null" ]]; then
            print_error "  Chemin racine manquant"
            ((errors++))
        else
            local expanded_root="${root/#\~/$HOME}"
            if [[ ! -d "$expanded_root" ]]; then
                print_warning "  Répertoire inexistant: $root"
                ((warnings++))
            else
                print_success "  Répertoire trouvé: $root"
            fi
        fi

        # Vérifie les modules
        if [[ "$modules_count" == "0" ]]; then
            print_warning "  Aucun module configuré"
            ((warnings++))
        else
            for ((j=0; j<modules_count; j++)); do
                local mod_path=$(yq ".projects[$i].modules[$j].path" "$CONFIG_FILE")
                local mod_tech=$(yq ".projects[$i].modules[$j].tech" "$CONFIG_FILE")

                # Vérifie la technologie
                local valid_tech=false
                for tech in "${AVAILABLE_TECHS[@]}"; do
                    [[ "$mod_tech" == "$tech" ]] && valid_tech=true
                done

                if [[ "$valid_tech" == "false" ]]; then
                    print_error "  Module '$mod_path': technologie invalide '$mod_tech'"
                    ((errors++))
                else
                    print_success "  Module '$mod_path' → $mod_tech"
                fi
            done
        fi
        echo ""
    done

    # Résumé
    echo -e "${C_BOLD}Résumé:${C_RESET}"
    echo -e "  Projets: $count"
    echo -e "  Erreurs: ${C_RED}$errors${C_RESET}"
    echo -e "  Avertissements: ${C_YELLOW}$warnings${C_RESET}"

    if [[ "$errors" -eq 0 ]]; then
        echo ""
        print_success "Configuration valide"
    else
        echo ""
        print_error "Configuration invalide - corrige les erreurs"
    fi
}

show_config_path() {
    echo ""
    print_info "Fichier de configuration: ${C_BOLD}$CONFIG_FILE${C_RESET}"
    echo ""
}

# =============================================================================
# Menu principal
# =============================================================================

show_menu() {
    echo -e "${C_BOLD}Que veux-tu faire ?${C_RESET}\n"
    echo -e "  ${C_CYAN}1)${C_RESET} 📋 Lister les projets"
    echo -e "  ${C_CYAN}2)${C_RESET} ➕ Ajouter un projet"
    echo -e "  ${C_CYAN}3)${C_RESET} ✏️  Modifier un projet"
    echo -e "  ${C_CYAN}4)${C_RESET} 📦 Ajouter un module"
    echo -e "  ${C_CYAN}5)${C_RESET} 🗑️  Supprimer un projet"
    echo -e "  ${C_CYAN}6)${C_RESET} ✅ Valider la configuration"
    echo -e "  ${C_CYAN}7)${C_RESET} 📄 Changer de fichier config"
    echo -e "  ${C_CYAN}q)${C_RESET} Quitter"
    echo ""
}

main_menu() {
    while true; do
        print_header
        show_config_path
        show_menu

        read -p "Choix: " -n 1 -r choice
        echo ""

        case $choice in
            1) list_projects ;;
            2) add_project ;;
            3) edit_project ;;
            4) add_module_to_project ;;
            5) delete_project ;;
            6) validate_config ;;
            7) select_config_file ;;
            q|Q) echo -e "\n${C_GREEN}À bientôt !${C_RESET}\n"; exit 0 ;;
            *) print_error "Choix invalide" ;;
        esac

        echo ""
        read -p "Appuie sur Entrée pour continuer..." -r
    done
}

# =============================================================================
# CLI directe
# =============================================================================

show_usage() {
    echo -e "\n${C_BOLD}📖 Utilisation${C_RESET}\n"
    echo -e "${C_CYAN}Mode interactif:${C_RESET}"
    echo -e "  ${C_BOLD}claude-projects${C_RESET}                    Menu interactif"
    echo ""
    echo -e "${C_CYAN}Commandes directes:${C_RESET}"
    echo -e "  ${C_BOLD}claude-projects list${C_RESET}               Liste les projets"
    echo -e "  ${C_BOLD}claude-projects add${C_RESET}                Ajoute un projet"
    echo -e "  ${C_BOLD}claude-projects edit${C_RESET}               Modifie un projet"
    echo -e "  ${C_BOLD}claude-projects delete${C_RESET}             Supprime un projet"
    echo -e "  ${C_BOLD}claude-projects validate${C_RESET}           Valide la configuration"
    echo ""
    echo -e "${C_CYAN}Options:${C_RESET}"
    echo -e "  ${C_BOLD}-c, --config <file>${C_RESET}   Fichier de configuration"
    echo ""
    echo -e "${C_CYAN}Exemples:${C_RESET}"
    echo -e "  claude-projects -c ./my-projects.yaml list"
    echo -e "  claude-projects --config ~/projects.yaml add"
    echo ""
}

cli_mode() {
    local command="$1"
    shift

    case "$command" in
        list|ls|l)
            list_projects
            ;;
        add|a)
            add_project
            ;;
        edit|e)
            edit_project
            ;;
        module|m)
            add_module_to_project
            ;;
        delete|rm|d)
            delete_project
            ;;
        validate|v)
            validate_config
            ;;
        help|h|--help|-h)
            show_usage
            ;;
        *)
            print_error "Commande inconnue: $command"
            show_usage
            exit 1
            ;;
    esac
}

# =============================================================================
# Point d'entrée
# =============================================================================

check_yq

# Parse les arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -c|--config)
            CONFIG_FILE="${2/#\~/$HOME}"
            shift 2
            ;;
        *)
            break
            ;;
    esac
done

# Config par défaut si non spécifié
if [[ -z "$CONFIG_FILE" ]]; then
    if [[ -f "./claude-projects.yaml" ]]; then
        CONFIG_FILE="./claude-projects.yaml"
    elif [[ -f "./Dev/claude-projects.yaml" ]]; then
        CONFIG_FILE="./Dev/claude-projects.yaml"
    else
        CONFIG_FILE="$DEFAULT_CONFIG"
    fi
fi

if [[ $# -gt 0 ]]; then
    ensure_config_file
    cli_mode "$@"
else
    select_config_file
    main_menu
fi
