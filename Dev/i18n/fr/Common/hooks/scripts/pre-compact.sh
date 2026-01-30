#!/bin/bash
# Hook Pre Compact: Sauvegarder l'état avant compaction mémoire
# S'exécute sur l'événement PreCompact
set -e

# Lire l'entrée JSON depuis stdin
INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
TIMESTAMP=$(date +%Y%m%d%H%M%S)

cd "$CWD" 2>/dev/null || true

# S'assurer que les répertoires existent
mkdir -p .claude/logs
mkdir -p .bmad/backups 2>/dev/null || true
mkdir -p .recette/backups 2>/dev/null || true

# Journaliser l'événement de compaction
echo "[$(date -Iseconds)] [COMPACT] Compaction du contexte déclenchée - session: $SESSION_ID" >> .claude/logs/session.log

# Sauvegarder le statut du sprint BMAD si existant
if [[ -f ".bmad/sprint-status.yaml" ]]; then
    cp .bmad/sprint-status.yaml ".bmad/backups/sprint-status-${TIMESTAMP}.yaml"
    echo "[$(date -Iseconds)] [COMPACT] Sauvegarde de sprint-status.yaml" >> .claude/logs/session.log
fi

# Sauvegarder le contexte de la story courante si existant
if [[ -f ".bmad/current-story.yaml" ]]; then
    cp .bmad/current-story.yaml ".bmad/backups/current-story-${TIMESTAMP}.yaml"
    echo "[$(date -Iseconds)] [COMPACT] Sauvegarde de current-story.yaml" >> .claude/logs/session.log
fi

# Sauvegarder la session recette si existante
if [[ -d ".recette/sessions" ]]; then
    ACTIVE_SESSION=$(find .recette/sessions -name "*.yaml" -mmin -60 2>/dev/null | head -1)
    if [[ -n "$ACTIVE_SESSION" ]]; then
        cp "$ACTIVE_SESSION" ".recette/backups/$(basename "$ACTIVE_SESSION" .yaml)-${TIMESTAMP}.yaml"
        echo "[$(date -Iseconds)] [COMPACT] Sauvegarde de la session recette" >> .claude/logs/session.log
    fi
fi

# Nettoyer les anciennes sauvegardes (garder les 10 dernières)
for backup_dir in .bmad/backups .recette/backups; do
    if [[ -d "$backup_dir" ]]; then
        ls -t "$backup_dir"/*.yaml 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    fi
done

# Message de sortie à préserver dans le contexte
echo '{"additionalContext": "État sauvegardé avant compaction. Contexte du sprint et de la story préservé."}'

exit 0
