#!/usr/bin/env bash
# Stop : exécute les tests avant que Claude s'arrête ; en cas d'échec, refuse l'arrêt
# avec {"decision":"block","reason":…} (stdout = ce seul JSON ; sinon stdout vide).
#   - stop_hook_active=true : on ne bloque jamais (sinon boucle infinie)
#   - toute la sortie des tests va dans .claude/logs/quality-gate.log
#   - QUALITY_GATE_CMD surcharge la détection (npm test, phpunit, pytest, flutter, go)
#   - après un succès, les tests sont sautés tant que l'arbre git ne change pas
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

hook_has_parser || exit 0
hook_input
[ "$(hook_get stop_hook_active)" = "true" ] && exit 0
cwd=$(hook_get cwd)
[ -z "$cwd" ] || cd "$cwd" 2>/dev/null || exit 0

# Commande de test du projet (vide si aucun framework détecté).
detect_cmd() {
  if [ -n "${QUALITY_GATE_CMD:-}" ]; then printf '%s' "$QUALITY_GATE_CMD"; return; fi
  if [ -f package.json ]; then
    local saved=$HOOK_INPUT script
    HOOK_INPUT=$(cat package.json)
    script=$(hook_get scripts.test)
    HOOK_INPUT=$saved
    case "$script" in "" | *"no test specified"*) ;; *) printf 'npm test'; return ;; esac
  fi
  if [ -f composer.json ] && [ -x vendor/bin/phpunit ]; then printf 'vendor/bin/phpunit'
  elif { [ -f pyproject.toml ] || [ -f setup.py ]; } && command -v pytest >/dev/null 2>&1; then printf 'pytest -q'
  elif [ -f pubspec.yaml ] && command -v flutter >/dev/null 2>&1; then printf 'flutter test'
  elif [ -f go.mod ] && command -v go >/dev/null 2>&1; then printf 'go test ./...'
  fi
}

cmd=$(detect_cmd)
[ -n "$cmd" ] || exit 0

# Empreinte de l'arbre de travail (hors journaux) : vide hors dépôt git => pas de cache.
fingerprint=""
if git rev-parse --git-dir >/dev/null 2>&1; then
  fingerprint=$({ git status --porcelain -- . ':!.claude/logs'; git diff HEAD -- . ':!.claude/logs'; } 2>/dev/null | cksum)
fi
ok_file=.claude/logs/quality-gate.ok
if [ -n "$fingerprint" ] && [ -f "$ok_file" ] && [ "$(cat "$ok_file")" = "$fingerprint" ]; then
  exit 0
fi

mkdir -p .claude/logs
log=.claude/logs/quality-gate.log
if bash -c "$cmd" >"$log" 2>&1; then
  printf '%s' "$fingerprint" >"$ok_file"
  exit 0
fi
rm -f "$ok_file"
hook_stop_block "$(printf 'Tests failing:\n%s' "$(tail -n 20 "$log")")"
exit 0
