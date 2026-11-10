#!/usr/bin/env bash
# SessionEnd : journalise la fin de session et ajoute une ligne de métriques JSONL.
# Budget par défaut d'un SessionEnd : 1,5 s — le fragment full relève `timeout` à 5.
# Aucune sortie n'est lue par Claude Code à ce stade : stdout reste vide.
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

hook_has_parser || exit 0
hook_input
CWD=$(hook_get cwd)
[ -z "$CWD" ] || cd "$CWD" 2>/dev/null || true
SESSION_ID=$(hook_get session_id)
REASON=$(hook_get reason)
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
DAY=$(date -u +%Y%m%d)
METRICS=".claude/metrics/session-$DAY.jsonl"
mkdir -p .claude/logs .claude/metrics

printf '[%s] [SESSION_END] session: %s, reason: %s\n' "$NOW" "${SESSION_ID:-unknown}" "${REASON:-unknown}" >>.claude/logs/session.log

# Fichiers modifiés = entrées de `git status` (0 hors dépôt git).
FILES=$(git status --porcelain -- . ':!.claude' 2>/dev/null | wc -l | tr -d ' ')

# Échecs d'outils du jour ; `|| true` : grep -c affiche déjà 0 et sort en 1 sans correspondance.
FAILURES=0
if [ -f .claude/logs/tool-failures.log ]; then
  FAILURES=$(grep -c "^\[$(date -u +%Y-%m-%d)" .claude/logs/tool-failures.log) || true
fi

STORY=none
STATUS=unknown
if [ -f .bmad/current-story.yaml ]; then
  STORY=$(grep '^id:' .bmad/current-story.yaml | head -n 1 | cut -d' ' -f2) || true
  STATUS=$(grep '^status:' .bmad/current-story.yaml | head -n 1 | cut -d' ' -f2) || true
fi

hook_object timestamp "$NOW" session_id "${SESSION_ID:-unknown}" reason "${REASON:-unknown}" \
  files_modified "${FILES:-0}" tool_failures "${FAILURES:-0}" \
  current_story "${STORY:-none}" story_status "${STATUS:-unknown}" >>"$METRICS"

# Résumé quotidien : totaux recalculés depuis le JSONL (format compact maîtrisé).
total() { grep -o "\"$1\":[0-9]*" "$METRICS" | cut -d: -f2 | awk '{ s += $1 } END { print s + 0 }'; }
hook_object date "$(date -u +%Y-%m-%d)" total_sessions "$(wc -l <"$METRICS" | tr -d ' ')" \
  total_files_modified "$(total files_modified)" total_tool_failures "$(total tool_failures)" \
  generated_at "$NOW" >".claude/metrics/daily-summary-$DAY.json"

# Rétention : métriques 30 jours, journaux 7 jours.
find .claude/metrics -type f \( -name '*.jsonl' -o -name 'daily-summary-*.json' \) -mtime +30 -delete 2>/dev/null
find .claude/logs -type f -name '*.log' -mtime +7 -delete 2>/dev/null
exit 0
