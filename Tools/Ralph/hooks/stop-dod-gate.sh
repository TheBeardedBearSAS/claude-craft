#!/usr/bin/env bash
# =============================================================================
# Ralph Wiggum - Stop Hook: DoD Gate
# Empêche Claude de s'arrêter tant que la Definition of Done n'est pas satisfaite.
#
# Contrat Claude Code (Stop) : blocage = JSON {"decision":"block","reason":...} sur
# stdout avec exit 0 ; `stop_hook_active` vrai => on laisse passer (anti-boucle).
#
# Sécurité : ralph.yml peut venir d'un dépôt cloné (non fiable). Chaque commande DoD
# passe d'abord par block-dangerous-commands.sh et guard-network.sh ; refusée => non
# exécutée et signalée dans la raison.
# =============================================================================
set -euo pipefail

HOOK_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=lib/ralph-common.sh
. "$HOOK_DIR/lib/ralph-common.sh"

hook_has_parser || exit 0
hook_input
[ "$(hook_get stop_hook_active)" = "true" ] && exit 0

CWD=$(hook_get cwd)
cd "${CWD:-.}" 2>/dev/null || true

CONFIG_FILE=$(ralph_find_config) || exit 0

run_dod_command() {
    if command -v timeout >/dev/null 2>&1; then
        timeout "${RALPH_DOD_TIMEOUT:-300}" bash -c "$1" </dev/null >/dev/null 2>&1
    else
        bash -c "$1" </dev/null >/dev/null 2>&1
    fi
}

failures=""
while IFS= read -r line; do
    [ -n "$line" ] || continue
    ralph_item_optional "$line" && continue
    [ "$(ralph_json_get "$line" type)" = "command" ] || continue
    name=$(ralph_json_get "$line" name)
    [ -n "$name" ] || name=$(ralph_json_get "$line" id)
    cmd=$(ralph_json_get "$line" command)
    if [ -z "$cmd" ]; then
        failures="$failures- ${name:-unnamed}: no command defined
"
    elif ! verdict=$(ralph_guard_verdict "$cmd"); then
        failures="$failures- ${name:-unnamed}: command refused and not run (blocked: $verdict)
"
    elif ! run_dod_command "$cmd"; then
        failures="$failures- ${name:-unnamed}: failed
"
    fi
done < <(ralph_dod_items "$CONFIG_FILE")

if [ -n "$failures" ]; then
    hook_stop_block "Definition of Done not satisfied. Fix the following before stopping:
$failures"
fi
exit 0
