#!/usr/bin/env bash
# SessionStart (matcher startup) : détecte la stack du projet et la transmet au modèle
# (hookSpecificOutput.additionalContext) ; exporte quelques variables d'environnement
# non sensibles de .env.local dans CLAUDE_ENV_FILE.
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

hook_has_parser || exit 0
hook_input
CWD=$(hook_get cwd)
[ -z "$CWD" ] || cd "$CWD" 2>/dev/null || true

# Variables sûres de .env.local, au format `export NAME=valeur`. Valeurs limitées à
# [A-Za-z0-9_.:/-] : CLAUDE_ENV_FILE est sourcé par le shell, pas de métacaractères.
# DATABASE_URL est exclue (identifiants possibles) ; commentaires et lignes vides ignorés.
if [ -n "${CLAUDE_ENV_FILE:-}" ] && [ -f .env.local ]; then
  sed -n -E 's#^(NODE_ENV|APP_ENV|APP_DEBUG|DATABASE_HOST|DATABASE_PORT|LOG_LEVEL|PORT|HOST)=([A-Za-z0-9_.:/-]*)$#export \1=\2#p' \
    .env.local >>"$CLAUDE_ENV_FILE" 2>/dev/null
fi

# json_field <fichier> <chemin.pointé> : valeur d'un champ d'un fichier JSON.
json_field() {
  local saved=$HOOK_INPUT value
  HOOK_INPUT=$(cat "$1" 2>/dev/null)
  value=$(hook_get "$2" 2>/dev/null)
  HOOK_INPUT=$saved
  printf '%s' "$value"
}

CONTEXT=""
add() { [ -z "$2" ] || CONTEXT="$CONTEXT$1 $2, "; }

if [ -f composer.json ]; then
  add Symfony "$(json_field composer.json 'require.symfony/framework-bundle')"
  add PHP "$(json_field composer.json require.php)"
fi
if [ -f package.json ]; then
  add React "$(json_field package.json dependencies.react)"
  add Next.js "$(json_field package.json dependencies.next)"
fi
[ ! -f pubspec.yaml ] || CONTEXT="${CONTEXT}Flutter/Dart, "
[ ! -f pyproject.toml ] || CONTEXT="${CONTEXT}Python, "

# Services déclarés dans les fichiers Compose (noms canoniques et historiques).
COMPOSE=$(cat compose.yaml compose.yml docker-compose.yaml docker-compose.yml 2>/dev/null)
for svc in postgres:PostgreSQL mysql:MySQL redis:Redis; do
  ! printf '%s' "$COMPOSE" | grep -qi "${svc%%:*}" || CONTEXT="${CONTEXT}${svc##*:}, "
done

CONTEXT=${CONTEXT%, }
[ -z "$CONTEXT" ] || hook_context SessionStart "Project stack: $CONTEXT"
exit 0
