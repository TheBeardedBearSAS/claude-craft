#!/bin/bash
# =============================================================================
# Ralph Wiggum - Messages Francais
# =============================================================================

# Header
MSG_HEADER="Ralph Wiggum - Boucle Continue d'Agent IA"
MSG_VERSION="Version"

# Status
MSG_ITERATION="Iteration"
MSG_OF="sur"
MSG_SESSION="Session"
MSG_STATUS="Statut"
MSG_RUNNING="En cours"
MSG_COMPLETE="Termine"
MSG_FAILED="Echec"
MSG_TIMEOUT="Delai depasse"
MSG_CIRCUIT_BREAKER="Disjoncteur"

# Session
MSG_SESSION_CREATED="Session creee"
MSG_SESSION_RESUMED="Session reprise"
MSG_SESSION_ID="ID de session"
MSG_SESSION_NOT_FOUND="Session introuvable"
MSG_SESSION_DIR="Repertoire de session"

# Loop
MSG_STARTING_LOOP="Demarrage de la boucle Ralph"
MSG_PROMPT="Prompt"
MSG_INVOKING_CLAUDE="Invocation de Claude..."
MSG_WAITING="Attente"
MSG_SECONDS="secondes"
MSG_LOOP_COMPLETE="Boucle terminee"
MSG_LOOP_STOPPED="Boucle arretee"

# Definition of Done
MSG_DOD_TITLE="Definition of Done"
MSG_DOD_CHECKING="Verification des criteres DoD..."
MSG_DOD_PASSED="DoD VALIDE"
MSG_DOD_FAILED="DoD NON COMPLETE"
MSG_DOD_ITEM_PASSED="OK"
MSG_DOD_ITEM_FAILED="ECHEC"
MSG_DOD_ITEM_SKIPPED="IGNORE"
MSG_DOD_REQUIRED="Requis"
MSG_DOD_OPTIONAL="Optionnel"
MSG_DOD_ALL_REQUIRED_PASSED="Tous les criteres requis sont valides !"
MSG_DOD_MISSING_REQUIRED="Criteres requis manquants :"
MSG_DOD_HUMAN_GATE="Validation humaine"
MSG_DOD_HUMAN_PROMPT="Est-ce correct ? (o/n) :"

# Validators
MSG_VALIDATOR_COMMAND="Execution de la commande"
MSG_VALIDATOR_OUTPUT="Verification du pattern de sortie"
MSG_VALIDATOR_FILE="Verification des fichiers modifies"
MSG_VALIDATOR_HOOK="Execution du hook"
MSG_VALIDATOR_HUMAN="En attente de validation humaine"

# Circuit Breaker
MSG_CB_TRIGGERED="Disjoncteur declenche"
MSG_CB_NO_CHANGES="Aucune modification de fichier depuis"
MSG_CB_ITERATIONS="iterations"
MSG_CB_REPEATED_ERRORS="Erreurs repetees detectees"
MSG_CB_OUTPUT_DECLINE="Sortie reduite de"
MSG_CB_PERCENT="pourcent"
MSG_CB_MAX_REACHED="Nombre maximum d'iterations atteint"
MSG_CB_RESET="Disjoncteur reinitialise"

# Gestion du contexte
MSG_CONTEXT_LIMIT_DETECTED="Limite de contexte detectee"
MSG_CONTEXT_COMPACTING="Execution de l'auto-compact"
MSG_CONTEXT_COMPACTED="Contexte compacte avec succes"
MSG_CONTEXT_COMPACT_FAILED="Echec de l'auto-compact"
MSG_CONTEXT_RETRYING="Nouvelle tentative apres compact"
MSG_CONTEXT_MAX_REACHED="Nombre maximum de compacts atteint"
MSG_CONTEXT_DISABLED="Auto-compact desactive"

# Gestion avancee du contexte
MSG_CONTEXT_NEW_SESSION="Creation de session de continuation"
MSG_CONTEXT_EXTEND="Extension de la limite de compacts"
MSG_CONTEXT_OVERFLOW_FAIL="Limite de contexte depassee, arret"
MSG_CONTEXT_PREVENTIVE="Contexte a {0}% - compact preventif"
MSG_CONTEXT_CONTINUATION_CREATED="Session de continuation creee"
MSG_CONTEXT_MAX_CONTINUATIONS="Nombre maximum de sessions de continuation atteint"
MSG_CONTEXT_RECONSTRUCTING="Reconstruction du contexte depuis le fichier de progres"

# Progres du sprint
MSG_SPRINT_PROGRESS_SAVED="Progres du sprint sauvegarde"
MSG_SPRINT_PROGRESS_LOADED="Progres du sprint charge"
MSG_SPRINT_CURRENT_TASK="Tache en cours"
MSG_SPRINT_COMPLETED_TASKS="Taches terminees"
MSG_SPRINT_PHASE="Phase"

# Compact strategique
MSG_CONTEXT_SPRINT_START="Compact au demarrage du sprint pour un contexte propre"
MSG_CONTEXT_TASK_COMPLETE="Tache terminee - compact strategique"
MSG_CONTEXT_US_COMPLETE="US terminee - compact strategique"

# Checkpointing
MSG_CHECKPOINT_CREATING="Creation du checkpoint..."
MSG_CHECKPOINT_CREATED="Checkpoint cree"
MSG_CHECKPOINT_RESTORING="Restauration depuis checkpoint..."
MSG_CHECKPOINT_RESTORED="Checkpoint restaure"
MSG_CHECKPOINT_BRANCH="Branche checkpoint"
MSG_CHECKPOINT_COMMIT="Commit"
MSG_CHECKPOINT_FAILED="Echec du checkpoint"

# Configuration
MSG_CONFIG_LOADING="Chargement de la configuration..."
MSG_CONFIG_LOADED="Configuration chargee"
MSG_CONFIG_NOT_FOUND="Fichier de configuration introuvable"
MSG_CONFIG_USING_DEFAULTS="Utilisation de la configuration par defaut"
MSG_CONFIG_INVALID="Configuration invalide"
MSG_CONFIG_CREATED="Configuration creee"

# Output
MSG_OUTPUT_LOG="Fichier de log"
MSG_OUTPUT_METRICS="Fichier de metriques"
MSG_OUTPUT_WRITING="Ecriture de la sortie..."
MSG_OUTPUT_SAVED="Sortie sauvegardee"

# Errors
MSG_ERROR="Erreur"
MSG_ERROR_CLAUDE_NOT_FOUND="Commande claude introuvable"
MSG_ERROR_NO_PROMPT="Aucun prompt fourni"
MSG_ERROR_INVALID_SESSION="Session invalide"
MSG_ERROR_TIMEOUT="Operation expiree"
MSG_ERROR_VALIDATION="Erreur de validation"
MSG_ERROR_GIT_NOT_FOUND="Git introuvable (requis pour le checkpointing)"
MSG_ERROR_JQ_NOT_FOUND="jq introuvable (requis pour le parsing JSON)"
MSG_ERROR_YQ_NOT_FOUND="yq introuvable (requis pour le parsing YAML)"

# Summary
MSG_SUMMARY_TITLE="Resume de la session"
MSG_SUMMARY_ITERATIONS="Iterations totales"
MSG_SUMMARY_DURATION="Duree"
MSG_SUMMARY_DOD_STATUS="Statut DoD"
MSG_SUMMARY_FILES_CHANGED="Fichiers modifies"
MSG_SUMMARY_EXIT_REASON="Raison de sortie"

# Help
MSG_HELP_USAGE="Utilisation"
MSG_HELP_DESCRIPTION="Executer Claude en boucle continue jusqu'a completion de la tache"
MSG_HELP_OPTIONS="Options"
MSG_HELP_PROMPT="Le prompt de tache pour Claude"
MSG_HELP_CONFIG="Chemin vers le fichier ralph.yml"
MSG_HELP_CONTINUE="Reprendre une session existante"
MSG_HELP_MAX_ITER="Iterations maximum (defaut: 25)"
MSG_HELP_VERBOSE="Activer la sortie verbose"
MSG_HELP_DRY_RUN="Montrer ce qui serait fait sans executer"
MSG_HELP_LANG="Langue (en, fr, es, de, pt)"
MSG_HELP_HELP="Afficher ce message d'aide"
MSG_HELP_EXAMPLES="Exemples"
MSG_HELP_EXAMPLE_BASIC="Utilisation basique avec prompt"
MSG_HELP_EXAMPLE_CONFIG="Avec fichier de configuration"
MSG_HELP_EXAMPLE_RESUME="Reprendre une session precedente"

# Menu (if interactive)
MSG_MENU_TITLE="Que souhaitez-vous faire ?"
MSG_MENU_START="Demarrer nouvelle session Ralph"
MSG_MENU_RESUME="Reprendre session existante"
MSG_MENU_LIST="Lister les sessions"
MSG_MENU_CONFIG="Creer une configuration"
MSG_MENU_HELP="Aide"
MSG_MENU_QUIT="Quitter"

# Misc
MSG_PRESS_ENTER="Appuyez sur Entree pour continuer..."
MSG_YES="oui"
MSG_NO="non"
MSG_CANCEL="Annule"
MSG_GOODBYE="Au revoir !"
MSG_INVALID_CHOICE="Choix invalide"
MSG_CONFIRM="Confirmer"
MSG_WARNING="Attention"
MSG_INFO="Info"
MSG_SUCCESS="Succes"
