#!/bin/bash
# =============================================================================
# Ralph Wiggum - Messages Français
# =============================================================================

# Header
MSG_HEADER="Ralph Wiggum - Boucle Continue d'Agent IA"
MSG_VERSION="Version"

# Status
MSG_ITERATION="Itération"
MSG_OF="sur"
MSG_SESSION="Session"
MSG_STATUS="Statut"
MSG_RUNNING="En cours"
MSG_COMPLETE="Terminé"
MSG_FAILED="Échec"
MSG_TIMEOUT="Délai dépassé"
MSG_CIRCUIT_BREAKER="Disjoncteur"

# Session
MSG_SESSION_CREATED="Session créée"
MSG_SESSION_RESUMED="Session reprise"
MSG_SESSION_ID="ID de session"
MSG_SESSION_NOT_FOUND="Session introuvable"
MSG_SESSION_DIR="Répertoire de session"

# Loop
MSG_STARTING_LOOP="Démarrage de la boucle Ralph"
MSG_PROMPT="Prompt"
MSG_INVOKING_CLAUDE="Invocation de Claude..."
MSG_WAITING="Attente"
MSG_SECONDS="secondes"
MSG_LOOP_COMPLETE="Boucle terminée"
MSG_LOOP_STOPPED="Boucle arrêtée"

# Definition of Done
MSG_DOD_TITLE="Definition of Done"
MSG_DOD_CHECKING="Vérification des critères DoD..."
MSG_DOD_PASSED="DoD VALIDÉ"
MSG_DOD_FAILED="DoD NON COMPLÈTE"
MSG_DOD_ITEM_PASSED="OK"
MSG_DOD_ITEM_FAILED="ÉCHEC"
MSG_DOD_ITEM_SKIPPED="IGNORÉ"
MSG_DOD_REQUIRED="Requis"
MSG_DOD_OPTIONAL="Optionnel"
MSG_DOD_ALL_REQUIRED_PASSED="Tous les critères requis sont validés !"
MSG_DOD_MISSING_REQUIRED="Critères requis manquants :"
MSG_DOD_HUMAN_GATE="Validation humaine"
MSG_DOD_HUMAN_PROMPT="Est-ce correct ? (o/n) :"

# Validators
MSG_VALIDATOR_COMMAND="Exécution de la commande"
MSG_VALIDATOR_OUTPUT="Vérification du pattern de sortie"
MSG_VALIDATOR_FILE="Vérification des fichiers modifiés"
MSG_VALIDATOR_HOOK="Exécution du hook"
MSG_VALIDATOR_HUMAN="En attente de validation humaine"

# Circuit Breaker
MSG_CB_TRIGGERED="Disjoncteur déclenché"
MSG_CB_NO_CHANGES="Aucune modification de fichier depuis"
MSG_CB_ITERATIONS="itérations"
MSG_CB_REPEATED_ERRORS="Erreurs répétées détectées"
MSG_CB_OUTPUT_DECLINE="Sortie réduite de"
MSG_CB_PERCENT="pourcent"
MSG_CB_MAX_REACHED="Nombre maximum d'itérations atteint"
MSG_CB_RESET="Disjoncteur réinitialisé"

# Gestion du contexte
MSG_CONTEXT_LIMIT_DETECTED="Limite de contexte détectée"
MSG_CONTEXT_COMPACTING="Exécution de l'auto-compact"
MSG_CONTEXT_COMPACTED="Contexte compacté avec succès"
MSG_CONTEXT_COMPACT_FAILED="Échec de l'auto-compact"
MSG_CONTEXT_RETRYING="Nouvelle tentative apres compact"
MSG_CONTEXT_MAX_REACHED="Nombre maximum de compacts atteint"
MSG_CONTEXT_DISABLED="Auto-compact désactivé"

# Gestion avancée du contexte
MSG_CONTEXT_NEW_SESSION="Création de session de continuation"
MSG_CONTEXT_EXTEND="Extension de la limite de compacts"
MSG_CONTEXT_OVERFLOW_FAIL="Limite de contexte dépassée, arrêt"
MSG_CONTEXT_PREVENTIVE="Contexte à {0}% - compact préventif"
MSG_CONTEXT_BELOW_MIN="Contexte à {0}% - en dessous du seuil minimum ({1}%), compact ignoré"
MSG_CONTEXT_CONTINUATION_CREATED="Session de continuation créée"
MSG_CONTEXT_MAX_CONTINUATIONS="Nombre maximum de sessions de continuation atteint"
MSG_CONTEXT_RECONSTRUCTING="Reconstruction du contexte depuis le fichier de progrès"

# Progrès du sprint
MSG_SPRINT_PROGRESS_SAVED="Progrès du sprint sauvegardé"
MSG_SPRINT_PROGRESS_LOADED="Progrès du sprint chargé"
MSG_SPRINT_CURRENT_TASK="Tâche en cours"
MSG_SPRINT_COMPLETED_TASKS="Tâches terminées"
MSG_SPRINT_PHASE="Phase"

# Compact stratégique
MSG_CONTEXT_SPRINT_START="Compact au démarrage du sprint pour un contexte propre"
MSG_CONTEXT_TASK_COMPLETE="Tâche terminée - compact stratégique"
MSG_CONTEXT_US_COMPLETE="US terminée - compact stratégique"

# Checkpointing
MSG_CHECKPOINT_CREATING="Création du checkpoint..."
MSG_CHECKPOINT_CREATED="Checkpoint créé"
MSG_CHECKPOINT_RESTORING="Restauration depuis checkpoint..."
MSG_CHECKPOINT_RESTORED="Checkpoint restauré"
MSG_CHECKPOINT_BRANCH="Branche checkpoint"
MSG_CHECKPOINT_COMMIT="Commit"
MSG_CHECKPOINT_FAILED="Échec du checkpoint"

# Configuration
MSG_CONFIG_LOADING="Chargement de la configuration..."
MSG_CONFIG_LOADED="Configuration chargée"
MSG_CONFIG_NOT_FOUND="Fichier de configuration introuvable"
MSG_CONFIG_USING_DEFAULTS="Utilisation de la configuration par défaut"
MSG_CONFIG_INVALID="Configuration invalide"
MSG_CONFIG_CREATED="Configuration créée"

# Output
MSG_OUTPUT_LOG="Fichier de log"
MSG_OUTPUT_METRICS="Fichier de métriques"
MSG_OUTPUT_WRITING="Écriture de la sortie..."
MSG_OUTPUT_SAVED="Sortie sauvegardée"

# Errors
MSG_ERROR="Erreur"
MSG_ERROR_CLAUDE_NOT_FOUND="Commande claude introuvable"
MSG_ERROR_NO_PROMPT="Aucun prompt fourni"
MSG_ERROR_INVALID_SESSION="Session invalide"
MSG_ERROR_TIMEOUT="Opération expirée"
MSG_ERROR_VALIDATION="Erreur de validation"
MSG_ERROR_GIT_NOT_FOUND="Git introuvable (requis pour le checkpointing)"
MSG_ERROR_JQ_NOT_FOUND="jq introuvable (requis pour le parsing JSON)"
MSG_ERROR_YQ_NOT_FOUND="yq introuvable (requis pour le parsing YAML)"

# Summary
MSG_SUMMARY_TITLE="Résumé de la session"
MSG_SUMMARY_ITERATIONS="Itérations totales"
MSG_SUMMARY_DURATION="Durée"
MSG_SUMMARY_DOD_STATUS="Statut DoD"
MSG_SUMMARY_FILES_CHANGED="Fichiers modifiés"
MSG_SUMMARY_EXIT_REASON="Raison de sortie"

# Help
MSG_HELP_USAGE="Utilisation"
MSG_HELP_DESCRIPTION="Exécuter Claude en boucle continue jusqu'à complétion de la tâche"
MSG_HELP_OPTIONS="Options"
MSG_HELP_PROMPT="Le prompt de tâche pour Claude"
MSG_HELP_CONFIG="Chemin vers le fichier ralph.yml"
MSG_HELP_CONTINUE="Reprendre une session existante"
MSG_HELP_MAX_ITER="Itérations maximum (défaut: 25)"
MSG_HELP_VERBOSE="Activer la sortie verbose"
MSG_HELP_DRY_RUN="Montrer ce qui serait fait sans exécuter"
MSG_HELP_LANG="Langue (en, fr, es, de, pt)"
MSG_HELP_HELP="Afficher ce message d'aide"
MSG_HELP_EXAMPLES="Exemples"
MSG_HELP_EXAMPLE_BASIC="Utilisation basique avec prompt"
MSG_HELP_EXAMPLE_CONFIG="Avec fichier de configuration"
MSG_HELP_EXAMPLE_RESUME="Reprendre une session précédente"

# Menu (if interactive)
MSG_MENU_TITLE="Que souhaitez-vous faire ?"
MSG_MENU_START="Démarrer nouvelle session Ralph"
MSG_MENU_RESUME="Reprendre session existante"
MSG_MENU_LIST="Lister les sessions"
MSG_MENU_CONFIG="Créer une configuration"
MSG_MENU_HELP="Aide"
MSG_MENU_QUIT="Quitter"

# Misc
MSG_PRESS_ENTER="Appuyez sur Entrée pour continuer..."
MSG_YES="oui"
MSG_NO="non"
MSG_CANCEL="Annulé"
MSG_GOODBYE="Au revoir !"
MSG_INVALID_CHOICE="Choix invalide"
MSG_CONFIRM="Confirmer"
MSG_WARNING="Attention"
MSG_INFO="Info"
MSG_SUCCESS="Succès"

# =============================================================================
# Messages v2.0
# =============================================================================

# Auto-detection
MSG_AUTO_DETECT="Détection automatique du type de projet..."
MSG_AUTO_DETECT_FOUND="Type de projet détecté"
MSG_AUTO_DETECT_CONFIDENCE="Confiance"
MSG_AUTO_DETECT_NOT_FOUND="Impossible de détecter le type de projet"
MSG_HELP_AUTO_DETECT="Détecter auto le type de projet et configurer DoD"
MSG_HELP_INIT="Générer la config sans exécuter (init seulement)"
MSG_HELP_INTERACTIVE="Assistant de configuration interactif"

# Dashboard
MSG_DASHBOARD_ENABLED="Dashboard activé"
MSG_DASHBOARD_DISABLED="Dashboard désactivé"
MSG_DASHBOARD_MODE="Mode dashboard"

# Métriques
MSG_METRICS_ENABLED="Collecte de métriques activée"
MSG_METRICS_EXPORTED="Métriques exportées"
MSG_METRICS_FORMAT="Format des métriques"

# Moniteur de santé
MSG_HEALTH_HEALTHY="Santé : OK"
MSG_HEALTH_WARNING="Avertissement santé"
MSG_HEALTH_CRITICAL="Santé critique"
MSG_HEALTH_STALL="Blocage détecté"
MSG_HEALTH_ERROR_SPIRAL="Spirale d'erreurs détectée"
MSG_HEALTH_CONTEXT_BLOAT="Gonflement du contexte détecté"

# Hooks
MSG_HOOKS_ENABLED="Intégration hooks activée"
MSG_HOOKS_DISABLED="Intégration hooks désactivée"
MSG_HOOKS_CONFIG_GENERATED="Configuration hooks générée"
MSG_HOOKS_DOD_BLOCKED="DoD non satisfait - arrêt bloqué"

# Disjoncteur adaptatif
MSG_CB_ADAPTIVE_ENABLED="Disjoncteur adaptatif activé"
MSG_CB_PROFILE_DETECTED="Profil détecté"
MSG_CB_LEARNING_ENABLED="Apprentissage historique activé"
MSG_CB_LEARNING_ADJUSTED="Seuils ajustés selon l'historique"

# Générateur de configuration
MSG_CONFIG_GENERATED="Configuration générée"
MSG_CONFIG_WIZARD_TITLE="Assistant de configuration"
MSG_CONFIG_DETECTING="Détection des paramètres du projet..."
MSG_CONFIG_CONFIRM="Est-ce correct ?"

# Prompts envoyés à Claude ({0} = contexte reconstruit)
MSG_PROMPT_CONTINUATION="# Continuation du Sprint

Vous reprenez le travail sur ce sprint après une compaction de contexte.
Le fichier sprint-progress.md contient l'état complet du travail effectué.

{0}

## Instructions

1. **Lisez** le progrès ci-dessus pour comprendre l'état actuel
2. **Vérifiez** les fichiers modifiés si nécessaire
3. **Reprenez** la tâche en cours là où elle s'est arrêtée
4. **Continuez** le workflow TDD (RED -> GREEN -> REFACTOR)
5. **Mettez à jour** sprint-progress.md après chaque tâche terminée

## Commandes Importantes

- Après chaque tâche : mettre à jour sprint-progress.md
- Si blocage : le noter dans la section Blockers
- Si décision importante : l'ajouter dans Key Decisions

Continuez l'implémentation."

# {0} = id de la session précédente, {1} = contexte reconstruit
MSG_PROMPT_HANDOFF="# Nouvelle Session de Continuation

Cette session continue le travail de la session précédente ({0}).
Le contexte a été réinitialisé mais le fichier sprint-progress.md contient tout le progrès.

{1}

## Contexte de la Transition

- Session précédente : {0}
- Raison : limite de contexte atteinte (max compacts)
- Le travail a été sauvegardé dans sprint-progress.md
- Les fichiers sont dans l'état du dernier checkpoint git

## Instructions

1. **Vérifiez** l'état actuel via git status
2. **Lisez** sprint-progress.md pour le contexte complet
3. **Identifiez** la tâche en cours et son état
4. **Continuez** exactement là où la session précédente s'est arrêtée

Reprenez le travail."

# Sections du contexte reconstruit envoyées à Claude ({0} = phase)
MSG_SECTION_PROGRESS="## Progression du Sprint"
MSG_SECTION_CURRENT_STATE="### État Actuel"
MSG_SECTION_UNKNOWN="Inconnu"
MSG_SECTION_COMPLETED_TASKS="### Tâches Terminées"
MSG_SECTION_NONE_YET="Aucune pour l'instant"
MSG_SECTION_KEY_DECISIONS="### Décisions Clés"
MSG_SECTION_NONE_RECORDED="Aucune enregistrée"
MSG_SECTION_NO_PROGRESS_FILE="Aucun fichier de progression du sprint trouvé."
MSG_SECTION_GIT="## Changements Récents"
MSG_SECTION_NOT_GIT="Pas dans un dépôt git."
MSG_SECTION_MODIFIED_FILES="### Fichiers Modifiés (commits récents)"
MSG_SECTION_NO_RECENT_CHANGES="Aucun changement récent"
MSG_SECTION_NO_COMMITS="Aucun commit pour l'instant"
MSG_SECTION_RECENT_COMMITS="### Commits Récents"
MSG_SECTION_UNCOMMITTED="### Changements Non Commités"
MSG_SECTION_NO_UNCOMMITTED="Aucun changement non commité."
MSG_SECTION_TESTS="## État des Tests"
MSG_SECTION_UNIT_TESTS="Tests Unitaires"
MSG_SECTION_INTEGRATION_TESTS="Tests d'Intégration"
MSG_SECTION_TASK="## Tâche en Cours"
MSG_SECTION_TASK_LABEL="Tâche"
MSG_SECTION_CONTINUE_PHASE="Reprenez là où vous vous étiez arrêté dans la phase {0}."
MSG_SECTION_NO_TASK="Aucune tâche en cours."
MSG_SECTION_NO_TASK_INFO="Aucune information sur la tâche en cours."

# Sprint Conductor (leader ASC)
MSG_ASC_HEADER="Conducteur de sprint autonome (ASC)"
MSG_ASC_NO_PARALLEL_MANAGER="Gestionnaire parallèle indisponible, passage en séquentiel"
MSG_ASC_INITIALIZED="Conducteur de sprint initialisé"
MSG_ASC_INIT_SESSION="  Session : {0}"
MSG_ASC_INIT_MODE="  Mode : {0}"
MSG_ASC_INIT_MAX_STORIES="  Stories maximum : {0}"
MSG_ASC_INIT_MAX_RUNTIME="  Durée maximum : {0}h"
MSG_ASC_INIT_PARALLEL="  Parallèle : {0} (max {1})"
MSG_ASC_INITIALIZED_ID="Conducteur de sprint initialisé : {0}"
MSG_ASC_STARTING="Démarrage du conducteur de sprint pour : {0} (mode : {1})"
MSG_ASC_PARALLEL_MODE="Mode PARALLÈLE ({0} sessions simultanées max)"
MSG_ASC_SEQUENTIAL_MODE="Mode SÉQUENTIEL"
MSG_ASC_NO_PARALLEL_STORIES="Aucune story disponible pour le traitement parallèle"
MSG_ASC_FOUND_STORIES="{0} stories trouvées pour le traitement parallèle"
MSG_ASC_STOP_PARALLEL="Condition d'arrêt atteinte, arrêt du traitement parallèle"
MSG_ASC_WAVE="=== Vague {0} ==="
MSG_ASC_WAITING_ACTIVE="Attente de la fin de {0} sessions actives..."
MSG_ASC_WAITING_ESCALATIONS="Attente de {0} escalades en suspens..."
MSG_ASC_WAITING_ALL="Attente de la fin de toutes les sessions parallèles..."
MSG_ASC_SPAWNED="Session parallèle {0} lancée pour la story {1}"
MSG_ASC_SPAWN_FAILED="Échec du lancement de la session pour {0}"
MSG_ASC_PAR_COMPLETED="Story terminée en parallèle : {0}"
MSG_ASC_PAR_FAILED="Échec de la story en parallèle : {0}"
MSG_ASC_NO_MORE_STORIES="Plus aucune story disponible"
MSG_ASC_PROCESSING="Traitement de la story : {0}"
MSG_ASC_CLAIMED="Story réservée : {0}"
MSG_ASC_UNCLAIMED="Story libérée : {0}"
MSG_ASC_CLAIM_FAILED="Échec de la réservation de la story : {0}"
MSG_ASC_CLAIM_FAILED_OTHER="Échec de la réservation de la story : {0} (peut-être réservée par un autre processus)"
MSG_ASC_SPAWNING_RALPH="Lancement de Ralph pour la story : {0}"
MSG_ASC_RALPH_NOT_FOUND="Script Ralph introuvable : {0}"
MSG_ASC_COMPLETED="Story terminée : {0}"
MSG_ASC_FAILED="Échec de la story : {0}"
MSG_ASC_ESCALATED="Story escaladée : {0}"
MSG_ASC_SKIPPED="Story ignorée : {0}"
MSG_ASC_SKIPPED_BY_USER="Story ignorée par l'utilisateur : {0}"
MSG_ASC_TRANSITIONED="{0} passée à {1}"
MSG_ASC_MAX_STORIES="Nombre maximum de stories atteint : {0}"
MSG_ASC_MAX_FAILURES="Nombre maximum d'échecs consécutifs atteint : {0}"
MSG_ASC_MAX_RUNTIME="Durée maximum atteinte : {0}h"
MSG_ASC_STOP_WINDOW="Fenêtre d'arrêt atteinte : {0} (fenêtre : {1})"
MSG_ASC_CRITICAL_ESCALATION="Escalade critique en suspens - pause"
MSG_ASC_SUPERVISED_TITLE="Mode supervisé : story prête"
MSG_ASC_SUPERVISED_STORY="Story : {0}"
MSG_ASC_SUPERVISED_TITLE_LINE="Titre : {0}"
MSG_ASC_SUPERVISED_PROMPT="Démarrer cette story ? (y=oui / n=non / s=tout passer) : "
MSG_ASC_SUMMARY="Résumé du conducteur de sprint"
MSG_ASC_SUMMARY_SESSION="Session : {0}"
MSG_ASC_SUMMARY_DURATION="Durée : {0}h {1}m"
MSG_ASC_SUMMARY_STORIES="Stories :"
MSG_ASC_SUMMARY_COMPLETED="  Terminées : {0}"
MSG_ASC_SUMMARY_FAILED="  Échecs :    {0}"
MSG_ASC_SUMMARY_SKIPPED="  Ignorées :  {0}"
MSG_ASC_SUMMARY_ESCALATIONS="Escalades :"
MSG_ASC_SUMMARY_RECOVERY="Tentatives de récupération :"
MSG_ASC_DONE="Conducteur de sprint terminé"
