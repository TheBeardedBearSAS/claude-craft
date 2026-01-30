#!/bin/bash
# Hook Post Tool Use Failure: Récupération après échec d'outil
# S'exécute sur l'événement PostToolUseFailure
set -e

# Lire l'entrée JSON depuis stdin
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
ERROR=$(echo "$INPUT" | jq -r '.error // "unknown"')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TIMESTAMP=$(date -Iseconds)

# S'assurer que le répertoire logs existe
mkdir -p .claude/logs

# Journaliser l'échec pour analyse
log_failure() {
    local severity="$1"
    local message="$2"
    echo "[${TIMESTAMP}] [${severity}] [${TOOL_NAME}] ${message}" >> .claude/logs/tool-failures.log
}

# Fournir un contexte de récupération selon le type d'outil
case "$TOOL_NAME" in
    "Bash")
        log_failure "ERROR" "Commande Bash échouée: $ERROR"

        if echo "$ERROR" | grep -q "command not found"; then
            echo '{"additionalContext": "Commande non trouvée. Vérifiez si la commande est installée ou utilisez un conteneur Docker."}'
        elif echo "$ERROR" | grep -q "permission denied"; then
            echo '{"additionalContext": "Permission refusée. Vérifiez les permissions du fichier ou utilisez les privilèges appropriés."}'
        elif echo "$ERROR" | grep -q "No such file or directory"; then
            echo '{"additionalContext": "Fichier ou répertoire non trouvé. Vérifiez que le chemin existe."}'
        elif echo "$ERROR" | grep -q "timeout"; then
            echo '{"additionalContext": "Commande expirée. Envisagez d'\''augmenter le timeout ou d'\''optimiser la commande."}'
        else
            echo '{"continue": true}'
        fi
        ;;

    "Edit"|"Write")
        log_failure "ERROR" "Opération fichier échouée: $ERROR"

        if echo "$ERROR" | grep -q "Permission denied"; then
            echo '{"additionalContext": "Permission d'\''écriture refusée. Vérifiez les permissions sur le fichier."}'
        elif echo "$ERROR" | grep -q "No such file"; then
            echo '{"additionalContext": "Le répertoire cible n'\''existe peut-être pas. Créez d'\''abord les répertoires parents."}'
        elif echo "$ERROR" | grep -q "not unique"; then
            echo '{"additionalContext": "L'\''old_string de l'\''Edit n'\''est pas unique. Fournissez plus de contexte."}'
        else
            echo '{"continue": true}'
        fi
        ;;

    "Read")
        log_failure "WARN" "Lecture échouée: $ERROR"

        if echo "$ERROR" | grep -q "No such file"; then
            echo '{"additionalContext": "Fichier non trouvé. Utilisez Glob pour rechercher le bon chemin."}'
        elif echo "$ERROR" | grep -q "Is a directory"; then
            echo '{"additionalContext": "La cible est un répertoire, pas un fichier. Utilisez ls ou Glob pour lister le contenu."}'
        else
            echo '{"continue": true}'
        fi
        ;;

    "Glob"|"Grep")
        log_failure "WARN" "Recherche échouée: $ERROR"
        echo '{"additionalContext": "Opération de recherche échouée. Vérifiez la syntaxe du pattern et le chemin."}'
        ;;

    "Task")
        log_failure "ERROR" "Sub-agent échoué: $ERROR"

        if echo "$ERROR" | grep -q "timeout"; then
            echo '{"additionalContext": "Sub-agent expiré. Envisagez de découper la tâche en parties plus petites."}'
        else
            echo '{"continue": true}'
        fi
        ;;

    *)
        log_failure "INFO" "Outil échoué: $ERROR"
        echo '{"continue": true}'
        ;;
esac

exit 0
