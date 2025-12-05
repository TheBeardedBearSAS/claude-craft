#!/bin/bash
# =============================================================================
# Claude Accounts - Messages Français
# =============================================================================

# Header
MSG_HEADER="Gestionnaire Multi-Comptes Claude Code"

# Menu
MSG_MENU_TITLE="Que veux-tu faire ?"
MSG_MENU_LIST="Lister les profils"
MSG_MENU_ADD="Ajouter un profil"
MSG_MENU_REMOVE="Supprimer un profil"
MSG_MENU_AUTH="Authentifier un profil"
MSG_MENU_LAUNCH="Lancer Claude Code"
MSG_MENU_CC_FUNC="Installer la fonction cc()"
MSG_MENU_MIGRATE="Migrer un profil legacy"
MSG_MENU_HELP="Aide"
MSG_MENU_QUIT="Quitter"

# Status
MSG_STATUS_AUTH="authentifié"
MSG_STATUS_NOT_AUTH="non authentifié"
MSG_STATUS_LEGEND_AUTH="= authentifié"
MSG_STATUS_LEGEND_NOT_AUTH="= non authentifié"

# Profile modes
MSG_MODE_SHARED="partagé"
MSG_MODE_ISOLATED="isolé"
MSG_MODE_LEGACY="legacy"
MSG_MODE_LABEL_SHARED="[partagé]"
MSG_MODE_LABEL_ISOLATED="[isolé]"
MSG_MODE_LABEL_LEGACY="[legacy]"
MSG_MODE_LEGEND="config ~/.claude"
MSG_MODE_LEGEND_ISOLATED="config indépendante"
MSG_MODE_LEGEND_LEGACY="ancien profil"

# List profiles
MSG_PROFILES_TITLE="Profils configurés :"
MSG_NO_PROFILE="Aucun profil configuré"
MSG_USE_ADD="Utilise Ajouter un profil pour commencer"
MSG_PROFILES_AVAILABLE="Profils disponibles :"
MSG_ALIAS_LABEL="Alias :"

# Directory
MSG_PROFILES_DIR_CREATED="Répertoire des profils créé :"

# Add profile
MSG_ADD_TITLE="Ajouter un nouveau profil"
MSG_ADD_NAME_PROMPT="Nom du profil (ex: perso, pro, client-acme) :"
MSG_ADD_NAME_EMPTY="Le nom ne peut pas être vide"
MSG_ADD_PROFILE_EXISTS="Le profil existe déjà"
MSG_ADD_PROFILE_CREATED="Profil créé"
MSG_ADD_AUTH_NOW="Authentifier ce profil maintenant ?"
MSG_ADD_AUTH_LATER="Pour t'authentifier plus tard :"
MSG_ADD_AUTH_OR="Ou relance ce script et choisis 'Authentifier un profil'"

# Mode selection
MSG_MODE_CHOOSE="Choisissez le mode du profil :"
MSG_MODE_SHARED_DESC="Partagé  - Même config que ~/.claude (switch pour limites)"
MSG_MODE_ISOLATED_DESC="Isolé    - Config indépendante (ex: client)"
MSG_MODE_PROMPT="Mode [1] :"

# Setup messages
MSG_SYMLINK_CREATED="Symlink créé vers ~/.claude"
MSG_CLAUDE_DIR_MISSING="~/.claude n'existe pas, le symlink sera créé plus tard"
MSG_CONFIG_COPIED="Configuration copiée depuis ~/.claude"
MSG_EMPTY_PROFILE="~/.claude n'existe pas, profil vide créé"

# Remove profile
MSG_REMOVE_TITLE="Supprimer un profil"
MSG_REMOVE_NO_PROFILE="Aucun profil à supprimer"
MSG_REMOVE_NUMBER_PROMPT="Numéro du profil à supprimer (ou nom) :"
MSG_REMOVE_NOT_FOUND="Profil non trouvé"
MSG_REMOVE_CONFIRM="Tu vas supprimer le profil"
MSG_REMOVE_CANCELLED="Suppression annulée"
MSG_REMOVE_DONE="Profil supprimé"
MSG_ALIAS_REMOVED="Alias supprimé de"

# Migrate profile
MSG_MIGRATE_TITLE="Migrer un profil legacy"
MSG_MIGRATE_NO_LEGACY="Aucun profil legacy à migrer (tous ont déjà un mode)"
MSG_MIGRATE_LEGACY_LIST="Profils legacy (sans mode) :"
MSG_MIGRATE_NUMBER_PROMPT="Numéro du profil à migrer :"
MSG_MIGRATE_TO_MODE="Migrer vers quel mode ?"
MSG_MIGRATE_SHARED_DESC="Partagé  - Créer symlink vers ~/.claude"
MSG_MIGRATE_ISOLATED_DESC="Isolé    - Garder config actuelle isolée"
MSG_MIGRATE_DONE_SHARED="Profil migré en mode PARTAGÉ"
MSG_MIGRATE_DONE_ISOLATED="Profil migré en mode ISOLÉ"
MSG_MIGRATE_CONFIG_KEPT="La configuration existante est conservée"

# Auth profile
MSG_AUTH_TITLE="Authentifier un profil"
MSG_AUTH_CREATE_FIRST="Aucun profil configuré. Crée d'abord un profil."
MSG_AUTH_NUMBER_PROMPT="Numéro du profil à authentifier :"
MSG_AUTH_LAUNCHING="Lancement de Claude Code pour le profil"
MSG_AUTH_CONNECT="Connecte-toi avec le compte souhaité"

# Launch profile
MSG_LAUNCH_TITLE="Lancer Claude Code"
MSG_LAUNCH_DEFAULT="default (config par défaut)"
MSG_LAUNCH_PROMPT="Choix :"
MSG_LAUNCH_WITH_DEFAULT="Lancement avec config par défaut..."
MSG_LAUNCH_WITH_PROFILE="Lancement du profil"
MSG_LAUNCH_NO_PROFILE="Aucun profil configuré, lancement avec config par défaut"

# Usage/Help
MSG_USAGE_TITLE="Utilisation"
MSG_USAGE_QUICK="Commandes rapides :"
MSG_USAGE_ADD_DESC="Ajoute un nouveau profil (partagé ou isolé)"
MSG_USAGE_RM_DESC="Supprime un profil"
MSG_USAGE_LIST_DESC="Liste les profils avec leur mode"
MSG_USAGE_AUTH_DESC="Authentifie un profil"
MSG_USAGE_RUN_DESC="Lance Claude Code avec un profil"
MSG_USAGE_MIGRATE_DESC="Migre un profil legacy vers shared/isolated"
MSG_USAGE_MODES="Modes de profil :"
MSG_USAGE_MODE_SHARED_DESC="Config commune (~/.claude), switch pour limites"
MSG_USAGE_MODE_ISOLATED_DESC="Config indépendante, pour clients"
MSG_USAGE_MODE_LEGACY_DESC="Ancien profil, peut être migré"
MSG_USAGE_ALIAS="Après configuration, utilise les alias :"
MSG_USAGE_OR_CC="Ou la fonction cc() si ajoutée :"
MSG_USAGE_LANG_DESC="Langue (en, fr, es, de, pt)"

# cc() function
MSG_CC_TITLE="Installer la fonction cc()"
MSG_CC_ALREADY="La fonction cc() est déjà installée"
MSG_CC_ADDED="Fonction cc() ajoutée à"
MSG_CC_USAGE="Usage :"
MSG_CC_MENU="Menu de sélection"
MSG_CC_PROFILE="Profil"
MSG_CC_NOT_FOUND="non trouvé. Profils disponibles :"
MSG_CC_NONE="(aucun)"

# Alias
MSG_ALIAS_EXISTS="Alias déjà présent dans"
MSG_ALIAS_ADDED="Alias ajouté à"
MSG_SOURCE_OR_NEW="Exécute source ou ouvre un nouveau terminal"

# Prompts
MSG_CONFIRM_YES_NO="(o/N)"
MSG_PRESS_ENTER="Appuie sur Entrée pour continuer..."
MSG_INVALID_CHOICE="Choix invalide"
MSG_UNKNOWN_COMMAND="Commande inconnue :"
MSG_GOODBYE="À bientôt !"
MSG_INVALID_LANG="Langue invalide :"
MSG_VALID_LANGS="Langues valides :"

# Mode in creation
MSG_MODE_IN="en mode"
