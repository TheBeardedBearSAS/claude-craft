#!/usr/bin/env bash
# PreCompact (optionnel, projets BMAD) : sauvegarde l'état du sprint/de la story/de la
# session de recette avant la compaction. Le stdout d'un hook PreCompact est lu comme
# consignes de compaction : on émet donc du TEXTE BRUT (pas de JSON). Non branché par
# défaut : la réinjection de context-essentials.md est déjà assurée par le fragment
# `default` (PreCompact + SessionStart compact).
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

hook_has_parser || exit 0
hook_input
CWD=$(hook_get cwd)
[ -z "$CWD" ] || cd "$CWD" 2>/dev/null || true
SESSION_ID=$(hook_get session_id)
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
STAMP=$(date -u +%Y%m%d%H%M%S)
mkdir -p .claude/logs
log() { printf '[%s] [COMPACT] %s\n' "$NOW" "$1" >>.claude/logs/session.log; }

# backup <fichier> <dossier> <nom> : copie horodatée, journalisée.
backup() {
  mkdir -p "$2" && cp "$1" "$2/$3-$STAMP.yaml" && log "Backed up $1"
}

# Ne garde que les 10 sauvegardes les plus récentes d'un dossier.
prune() {
  local f i=0
  while IFS= read -r f; do
    i=$((i + 1))
    [ "$i" -le 10 ] || rm -f "$f"
  done < <(ls -t "$1"/*.yaml 2>/dev/null)
}

log "Context compaction triggered (session: ${SESSION_ID:-unknown})"
SAVED=""
if [ -f .bmad/sprint-status.yaml ]; then
  backup .bmad/sprint-status.yaml .bmad/backups sprint-status && SAVED="$SAVED .bmad/sprint-status.yaml"
fi
if [ -f .bmad/current-story.yaml ]; then
  backup .bmad/current-story.yaml .bmad/backups current-story && SAVED="$SAVED .bmad/current-story.yaml"
fi
if [ -d .recette/sessions ]; then
  ACTIVE=$(find .recette/sessions -name '*.yaml' -mmin -60 2>/dev/null | head -n 1)
  [ -z "$ACTIVE" ] || backup "$ACTIVE" .recette/backups "$(basename "$ACTIVE" .yaml)"
fi
for d in .bmad/backups .recette/backups; do
  [ ! -d "$d" ] || prune "$d"
done

[ -z "$SAVED" ] || printf 'When compacting, keep the current BMAD sprint and story context (backed up:%s).\n' "$SAVED"
exit 0
