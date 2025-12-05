#!/bin/bash
# =============================================================================
# Claude Code Multi-Account Manager
# Gère facilement plusieurs comptes Claude Code
# =============================================================================

set -e

# Configuration
CLAUDE_PROFILES_DIR="$HOME/.claude-profiles"
SHELL_RC=""
CLAUDE_BIN="claude"

# Couleurs
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BLUE='\033[0;34m'
C_MAGENTA='\033[0;35m'
C_CYAN='\033[0;36m'

# =============================================================================
# Utilitaires
# =============================================================================

print_header() {
    echo -e "\n${C_CYAN}╔════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${C_CYAN}║${C_RESET}     ${C_BOLD}🔐 Claude Code Multi-Account Manager${C_RESET}                  ${C_CYAN}║${C_RESET}"
    echo -e "${C_CYAN}╚════════════════════════════════════════════════════════════╝${C_RESET}\n"
}

print_success() {
    echo -e "${C_GREEN}✓${C_RESET} $1"
}

print_error() {
    echo -e "${C_RED}✗${C_RESET} $1"
}

print_info() {
    echo -e "${C_BLUE}ℹ${C_RESET} $1"
}

print_warning() {
    echo -e "${C_YELLOW}⚠${C_RESET} $1"
}

detect_shell_rc() {
    if [[ -n "$ZSH_VERSION" ]] || [[ "$SHELL" == *"zsh"* ]]; then
        SHELL_RC="$HOME/.zshrc"
    elif [[ -n "$BASH_VERSION" ]] || [[ "$SHELL" == *"bash"* ]]; then
        SHELL_RC="$HOME/.bashrc"
    else
        SHELL_RC="$HOME/.profile"
    fi
}

ensure_profiles_dir() {
    if [[ ! -d "$CLAUDE_PROFILES_DIR" ]]; then
        mkdir -p "$CLAUDE_PROFILES_DIR"
        print_success "Répertoire des profils créé: $CLAUDE_PROFILES_DIR"
    fi
}

# =============================================================================
# Gestion des modes (shared/isolated)
# =============================================================================

# Lire le mode d'un profil
get_profile_mode() {
    local profile_name="$1"
    local mode_file="$CLAUDE_PROFILES_DIR/$profile_name/.mode"
    cat "$mode_file" 2>/dev/null || echo "legacy"
}

# Obtenir le label du mode pour affichage
get_mode_label() {
    local mode="$1"
    case "$mode" in
        shared)   echo "${C_GREEN}[partagé]${C_RESET}" ;;
        isolated) echo "${C_MAGENTA}[isolé]${C_RESET}" ;;
        *)        echo "${C_YELLOW}[legacy]${C_RESET}" ;;
    esac
}

# Configurer un profil en mode partagé
setup_shared_profile() {
    local profile_path="$1"
    echo "shared" > "$profile_path/.mode"

    # Créer symlink vers ~/.claude pour la config
    if [[ -d "$HOME/.claude" ]]; then
        ln -sf "$HOME/.claude" "$profile_path/config"
        print_success "Symlink créé vers ~/.claude"
    else
        print_warning "~/.claude n'existe pas, le symlink sera créé plus tard"
    fi
}

# Configurer un profil en mode isolé
setup_isolated_profile() {
    local profile_path="$1"
    echo "isolated" > "$profile_path/.mode"

    # Copier ~/.claude si existe
    if [[ -d "$HOME/.claude" ]]; then
        # Copie tout sauf les credentials
        for item in "$HOME/.claude"/*; do
            [[ -e "$item" ]] || continue
            local basename=$(basename "$item")
            # Ne pas copier les credentials
            if [[ "$basename" != ".credentials.json" ]]; then
                cp -r "$item" "$profile_path/" 2>/dev/null || true
            fi
        done
        print_success "Configuration copiée depuis ~/.claude"
    else
        print_warning "~/.claude n'existe pas, profil vide créé"
    fi
}

# Demander le mode lors de la création
ask_profile_mode() {
    echo ""
    print_info "Choisissez le mode du profil:"
    echo -e "  ${C_CYAN}1)${C_RESET} Partagé  - Même config que ~/.claude (switch pour limites)"
    echo -e "  ${C_CYAN}2)${C_RESET} Isolé    - Config indépendante (ex: client)"
    echo ""
    read -p "Mode [1]: " mode_choice
    mode_choice=${mode_choice:-1}

    case "$mode_choice" in
        2) echo "isolated" ;;
        *) echo "shared" ;;
    esac
}

# =============================================================================
# Gestion des profils
# =============================================================================

list_profiles() {
    echo -e "\n${C_BOLD}📋 Profils configurés :${C_RESET}\n"

    if [[ ! -d "$CLAUDE_PROFILES_DIR" ]] || [[ -z "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
        print_warning "Aucun profil configuré"
        echo -e "   Utilise ${C_CYAN}Ajouter un profil${C_RESET} pour commencer\n"
        return
    fi

    local index=1
    for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
        [[ ! -d "$profile_dir" ]] && continue

        local profile_name=$(basename "$profile_dir")
        local credentials_file="$profile_dir/.credentials.json"
        local settings_file="$profile_dir/settings.json"

        # Essaie de lire l'email depuis les credentials
        local email="(non authentifié)"
        if [[ -f "$credentials_file" ]]; then
            local stored_email=$(jq -r '.email // empty' "$credentials_file" 2>/dev/null)
            [[ -n "$stored_email" ]] && email="$stored_email"
        fi

        # Status
        local status="${C_YELLOW}○${C_RESET}"
        if [[ -f "$credentials_file" ]]; then
            status="${C_GREEN}●${C_RESET}"
        fi

        # Mode du profil
        local mode=$(get_profile_mode "$profile_name")
        local mode_label=$(get_mode_label "$mode")

        echo -e "   $status ${C_BOLD}$profile_name${C_RESET} $mode_label"
        echo -e "     └─ $email"
        echo -e "     └─ Alias: ${C_CYAN}claude-$profile_name${C_RESET}"
        echo ""

        ((index++))
    done

    echo -e "   ${C_GREEN}●${C_RESET} = authentifié   ${C_YELLOW}○${C_RESET} = non authentifié"
    echo -e "   ${C_GREEN}[partagé]${C_RESET} = config ~/.claude   ${C_MAGENTA}[isolé]${C_RESET} = config indépendante   ${C_YELLOW}[legacy]${C_RESET} = ancien profil\n"
}

add_profile() {
    echo -e "\n${C_BOLD}➕ Ajouter un nouveau profil${C_RESET}\n"

    # Demande le nom du profil
    echo -e "Nom du profil (ex: ${C_CYAN}perso${C_RESET}, ${C_CYAN}pro${C_RESET}, ${C_CYAN}client-acme${C_RESET}):"
    read -p "> " profile_name

    # Validation du nom
    if [[ -z "$profile_name" ]]; then
        print_error "Le nom ne peut pas être vide"
        return 1
    fi

    # Nettoie le nom (lowercase, remplace espaces par tirets)
    profile_name=$(echo "$profile_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')

    local profile_path="$CLAUDE_PROFILES_DIR/$profile_name"

    if [[ -d "$profile_path" ]]; then
        print_error "Le profil '$profile_name' existe déjà"
        return 1
    fi

    # Crée le répertoire du profil
    mkdir -p "$profile_path"

    # Demande le mode
    local mode=$(ask_profile_mode)

    if [[ "$mode" == "isolated" ]]; then
        setup_isolated_profile "$profile_path"
    else
        setup_shared_profile "$profile_path"
    fi

    print_success "Profil '$profile_name' créé en mode $mode"

    # Ajoute l'alias au shell RC
    add_alias_to_shell "$profile_name"

    # Propose de s'authentifier maintenant
    echo ""
    read -p "Authentifier ce profil maintenant ? (o/N) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[OoYy]$ ]]; then
        authenticate_profile "$profile_name"
    else
        print_info "Pour t'authentifier plus tard: ${C_CYAN}claude-$profile_name${C_RESET}"
        print_info "Ou relance ce script et choisis 'Authentifier un profil'"
    fi
}

add_alias_to_shell() {
    local profile_name="$1"
    local alias_line="alias claude-${profile_name}=\"CLAUDE_CONFIG_DIR='$CLAUDE_PROFILES_DIR/$profile_name' $CLAUDE_BIN\""

    detect_shell_rc

    # Vérifie si l'alias existe déjà
    if grep -q "alias claude-${profile_name}=" "$SHELL_RC" 2>/dev/null; then
        print_info "Alias déjà présent dans $SHELL_RC"
        return
    fi

    # Ajoute le marqueur de section si pas présent
    if ! grep -q "# Claude Code Profiles" "$SHELL_RC" 2>/dev/null; then
        echo "" >> "$SHELL_RC"
        echo "# Claude Code Profiles - Géré par claude-accounts" >> "$SHELL_RC"
    fi

    # Ajoute l'alias
    echo "$alias_line" >> "$SHELL_RC"
    print_success "Alias ajouté à $SHELL_RC"
    print_warning "Exécute ${C_CYAN}source $SHELL_RC${C_RESET} ou ouvre un nouveau terminal"
}

remove_profile() {
    echo -e "\n${C_BOLD}🗑️  Supprimer un profil${C_RESET}\n"

    if [[ ! -d "$CLAUDE_PROFILES_DIR" ]] || [[ -z "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
        print_warning "Aucun profil à supprimer"
        return
    fi

    # Liste les profils disponibles
    echo "Profils disponibles :"
    local profiles=()
    local index=1
    for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
        [[ ! -d "$profile_dir" ]] && continue
        local profile_name=$(basename "$profile_dir")
        profiles+=("$profile_name")
        echo -e "  ${C_CYAN}$index)${C_RESET} $profile_name"
        ((index++))
    done

    echo ""
    read -p "Numéro du profil à supprimer (ou nom): " choice

    local profile_to_delete=""

    # Si c'est un numéro
    if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -le "${#profiles[@]}" ]]; then
        profile_to_delete="${profiles[$((choice-1))]}"
    else
        profile_to_delete="$choice"
    fi

    local profile_path="$CLAUDE_PROFILES_DIR/$profile_to_delete"

    if [[ ! -d "$profile_path" ]]; then
        print_error "Profil '$profile_to_delete' non trouvé"
        return 1
    fi

    # Confirmation
    echo ""
    print_warning "Tu vas supprimer le profil '${C_BOLD}$profile_to_delete${C_RESET}'"
    read -p "Confirmer ? (o/N) " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
        print_info "Suppression annulée"
        return
    fi

    # Supprime le répertoire
    rm -rf "$profile_path"
    print_success "Profil '$profile_to_delete' supprimé"

    # Supprime l'alias du shell RC
    detect_shell_rc
    if [[ -f "$SHELL_RC" ]]; then
        # Utilise sed pour supprimer la ligne d'alias
        sed -i.bak "/alias claude-${profile_to_delete}=/d" "$SHELL_RC"
        rm -f "${SHELL_RC}.bak"
        print_success "Alias supprimé de $SHELL_RC"
    fi
}

migrate_profile() {
    echo -e "\n${C_BOLD}🔄 Migrer un profil legacy${C_RESET}\n"

    if [[ ! -d "$CLAUDE_PROFILES_DIR" ]] || [[ -z "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
        print_warning "Aucun profil configuré"
        return
    fi

    # Lister les profils legacy (sans fichier .mode)
    local legacy_profiles=()
    for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
        [[ -d "$profile_dir" ]] || continue
        local pname=$(basename "$profile_dir")
        local mode=$(get_profile_mode "$pname")
        if [[ "$mode" == "legacy" ]]; then
            legacy_profiles+=("$pname")
        fi
    done

    if [[ ${#legacy_profiles[@]} -eq 0 ]]; then
        print_success "Aucun profil legacy à migrer (tous ont déjà un mode)"
        return
    fi

    echo "Profils legacy (sans mode) :"
    local i=1
    for pname in "${legacy_profiles[@]}"; do
        echo -e "  ${C_CYAN}$i)${C_RESET} $pname"
        ((i++))
    done
    echo ""
    read -p "Numéro du profil à migrer: " choice

    if [[ -z "$choice" ]] || ! [[ "$choice" =~ ^[0-9]+$ ]] || [[ "$choice" -lt 1 ]] || [[ "$choice" -gt ${#legacy_profiles[@]} ]]; then
        print_error "Choix invalide"
        return 1
    fi

    local selected="${legacy_profiles[$((choice-1))]}"
    local profile_path="$CLAUDE_PROFILES_DIR/$selected"

    echo ""
    print_info "Migrer '$selected' vers quel mode ?"
    echo -e "  ${C_CYAN}1)${C_RESET} Partagé  - Créer symlink vers ~/.claude"
    echo -e "  ${C_CYAN}2)${C_RESET} Isolé    - Garder config actuelle isolée"
    echo ""
    read -p "Mode [1]: " mode_choice
    mode_choice=${mode_choice:-1}

    case "$mode_choice" in
        2)
            echo "isolated" > "$profile_path/.mode"
            print_success "Profil '$selected' migré en mode ISOLÉ"
            print_info "La configuration existante est conservée"
            ;;
        *)
            echo "shared" > "$profile_path/.mode"
            # Créer symlink config si pas déjà présent
            if [[ ! -L "$profile_path/config" ]] && [[ -d "$HOME/.claude" ]]; then
                ln -sf "$HOME/.claude" "$profile_path/config"
                print_success "Symlink créé vers ~/.claude"
            fi
            print_success "Profil '$selected' migré en mode PARTAGÉ"
            ;;
    esac
}

authenticate_profile() {
    local profile_name="$1"

    if [[ -z "$profile_name" ]]; then
        echo -e "\n${C_BOLD}🔐 Authentifier un profil${C_RESET}\n"

        if [[ ! -d "$CLAUDE_PROFILES_DIR" ]] || [[ -z "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
            print_warning "Aucun profil configuré. Crée d'abord un profil."
            return
        fi

        # Liste les profils
        echo "Profils disponibles :"
        local profiles=()
        local index=1
        for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
            [[ ! -d "$profile_dir" ]] && continue
            local pname=$(basename "$profile_dir")
            profiles+=("$pname")
            echo -e "  ${C_CYAN}$index)${C_RESET} $pname"
            ((index++))
        done

        echo ""
        read -p "Numéro du profil à authentifier: " choice

        if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -le "${#profiles[@]}" ]]; then
            profile_name="${profiles[$((choice-1))]}"
        else
            print_error "Choix invalide"
            return 1
        fi
    fi

    local profile_path="$CLAUDE_PROFILES_DIR/$profile_name"

    if [[ ! -d "$profile_path" ]]; then
        print_error "Profil '$profile_name' non trouvé"
        return 1
    fi

    echo ""
    print_info "Lancement de Claude Code pour le profil '${C_BOLD}$profile_name${C_RESET}'..."
    print_info "Connecte-toi avec le compte souhaité"
    echo ""

    # Lance Claude Code avec le config dir du profil
    CLAUDE_CONFIG_DIR="$profile_path" $CLAUDE_BIN
}

launch_profile() {
    echo -e "\n${C_BOLD}🚀 Lancer Claude Code${C_RESET}\n"

    # Option pour le profil par défaut
    echo -e "  ${C_CYAN}0)${C_RESET} default (config par défaut)"

    if [[ -d "$CLAUDE_PROFILES_DIR" ]] && [[ -n "$(ls -A "$CLAUDE_PROFILES_DIR" 2>/dev/null)" ]]; then
        local profiles=("default")
        local index=1
        for profile_dir in "$CLAUDE_PROFILES_DIR"/*/; do
            [[ ! -d "$profile_dir" ]] && continue
            local profile_name=$(basename "$profile_dir")
            profiles+=("$profile_name")
            echo -e "  ${C_CYAN}$index)${C_RESET} $profile_name"
            ((index++))
        done

        echo ""
        read -p "Choix: " choice

        if [[ "$choice" == "0" ]]; then
            print_info "Lancement avec config par défaut..."
            $CLAUDE_BIN
        elif [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -le "$((${#profiles[@]}-1))" ]]; then
            local selected="${profiles[$choice]}"
            print_info "Lancement du profil '$selected'..."
            CLAUDE_CONFIG_DIR="$CLAUDE_PROFILES_DIR/$selected" $CLAUDE_BIN
        else
            print_error "Choix invalide"
        fi
    else
        print_warning "Aucun profil configuré, lancement avec config par défaut"
        $CLAUDE_BIN
    fi
}

show_usage() {
    echo -e "\n${C_BOLD}📖 Utilisation${C_RESET}\n"

    echo -e "${C_CYAN}Commandes rapides :${C_RESET}"
    echo -e "  ${C_BOLD}claude-accounts add <nom>${C_RESET}     Ajoute un nouveau profil (partagé ou isolé)"
    echo -e "  ${C_BOLD}claude-accounts rm <nom>${C_RESET}      Supprime un profil"
    echo -e "  ${C_BOLD}claude-accounts list${C_RESET}          Liste les profils avec leur mode"
    echo -e "  ${C_BOLD}claude-accounts auth <nom>${C_RESET}    Authentifie un profil"
    echo -e "  ${C_BOLD}claude-accounts run <nom>${C_RESET}     Lance Claude Code avec un profil"
    echo -e "  ${C_BOLD}claude-accounts migrate${C_RESET}       Migre un profil legacy vers shared/isolated"
    echo ""

    echo -e "${C_CYAN}Modes de profil :${C_RESET}"
    echo -e "  ${C_GREEN}[partagé]${C_RESET}   Config commune (~/.claude), switch pour limites"
    echo -e "  ${C_MAGENTA}[isolé]${C_RESET}     Config indépendante, pour clients"
    echo -e "  ${C_YELLOW}[legacy]${C_RESET}    Ancien profil, peut être migré"
    echo ""

    echo -e "${C_CYAN}Après configuration, utilise les alias :${C_RESET}"
    echo -e "  ${C_BOLD}claude-perso${C_RESET}      Lance avec le profil 'perso'"
    echo -e "  ${C_BOLD}claude-pro${C_RESET}        Lance avec le profil 'pro'"
    echo ""

    echo -e "${C_CYAN}Ou la fonction cc() si ajoutée :${C_RESET}"
    echo -e "  ${C_BOLD}cc perso${C_RESET}          Lance avec le profil 'perso'"
    echo -e "  ${C_BOLD}cc pro${C_RESET}            Lance avec le profil 'pro'"
    echo ""
}

install_cc_function() {
    echo -e "\n${C_BOLD}⚡ Installer la fonction cc()${C_RESET}\n"

    detect_shell_rc

    local cc_function='
# Fonction cc() pour lancer Claude Code avec un profil
cc() {
    local profile="${1:-}"
    local profiles_dir="$HOME/.claude-profiles"

    if [[ -z "$profile" ]]; then
        # Sans argument, lance le sélecteur interactif
        claude-accounts run
    elif [[ -d "$profiles_dir/$profile" ]]; then
        CLAUDE_CONFIG_DIR="$profiles_dir/$profile" claude "${@:2}"
    else
        echo "Profil '\''$profile'\'' non trouvé. Profils disponibles:"
        ls -1 "$profiles_dir" 2>/dev/null || echo "  (aucun)"
    fi
}'

    if grep -q "^cc()" "$SHELL_RC" 2>/dev/null; then
        print_info "La fonction cc() est déjà installée"
        return
    fi

    echo "$cc_function" >> "$SHELL_RC"
    print_success "Fonction cc() ajoutée à $SHELL_RC"
    print_warning "Exécute ${C_CYAN}source $SHELL_RC${C_RESET} pour l'activer"

    echo ""
    echo -e "${C_CYAN}Usage:${C_RESET}"
    echo -e "  ${C_BOLD}cc${C_RESET}            Menu de sélection"
    echo -e "  ${C_BOLD}cc perso${C_RESET}      Profil 'perso'"
    echo -e "  ${C_BOLD}cc pro${C_RESET}        Profil 'pro'"
}

# =============================================================================
# Menu principal
# =============================================================================

show_menu() {
    echo -e "${C_BOLD}Que veux-tu faire ?${C_RESET}\n"
    echo -e "  ${C_CYAN}1)${C_RESET} 📋 Lister les profils"
    echo -e "  ${C_CYAN}2)${C_RESET} ➕ Ajouter un profil"
    echo -e "  ${C_CYAN}3)${C_RESET} 🗑️  Supprimer un profil"
    echo -e "  ${C_CYAN}4)${C_RESET} 🔐 Authentifier un profil"
    echo -e "  ${C_CYAN}5)${C_RESET} 🚀 Lancer Claude Code"
    echo -e "  ${C_CYAN}6)${C_RESET} ⚡ Installer la fonction cc()"
    echo -e "  ${C_CYAN}7)${C_RESET} 🔄 Migrer un profil legacy"
    echo -e "  ${C_CYAN}8)${C_RESET} 📖 Aide"
    echo -e "  ${C_CYAN}q)${C_RESET} Quitter"
    echo ""
}

main_menu() {
    while true; do
        print_header
        show_menu

        read -p "Choix: " -n 1 -r choice
        echo ""

        case $choice in
            1) list_profiles ;;
            2) add_profile ;;
            3) remove_profile ;;
            4) authenticate_profile ;;
            5) launch_profile ;;
            6) install_cc_function ;;
            7) migrate_profile ;;
            8) show_usage ;;
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

cli_mode() {
    local command="$1"
    shift

    ensure_profiles_dir

    case "$command" in
        add|a)
            if [[ -n "$1" ]]; then
                profile_name="$1"
                profile_name=$(echo "$profile_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')
                local profile_path="$CLAUDE_PROFILES_DIR/$profile_name"

                if [[ -d "$profile_path" ]]; then
                    print_error "Le profil '$profile_name' existe déjà"
                    exit 1
                fi

                mkdir -p "$profile_path"
                print_success "Profil '$profile_name' créé"
                add_alias_to_shell "$profile_name"
            else
                add_profile
            fi
            ;;
        rm|remove|delete)
            if [[ -n "$1" ]]; then
                local profile_path="$CLAUDE_PROFILES_DIR/$1"
                if [[ -d "$profile_path" ]]; then
                    rm -rf "$profile_path"
                    print_success "Profil '$1' supprimé"

                    detect_shell_rc
                    sed -i.bak "/alias claude-${1}=/d" "$SHELL_RC" 2>/dev/null
                    rm -f "${SHELL_RC}.bak"
                else
                    print_error "Profil '$1' non trouvé"
                    exit 1
                fi
            else
                remove_profile
            fi
            ;;
        list|ls|l)
            list_profiles
            ;;
        auth|login)
            authenticate_profile "$1"
            ;;
        run|start|r)
            if [[ -n "$1" ]]; then
                local profile_path="$CLAUDE_PROFILES_DIR/$1"
                if [[ -d "$profile_path" ]]; then
                    CLAUDE_CONFIG_DIR="$profile_path" $CLAUDE_BIN "${@:2}"
                else
                    print_error "Profil '$1' non trouvé"
                    exit 1
                fi
            else
                launch_profile
            fi
            ;;
        migrate|m)
            migrate_profile
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

ensure_profiles_dir
detect_shell_rc

if [[ $# -gt 0 ]]; then
    cli_mode "$@"
else
    main_menu
fi
