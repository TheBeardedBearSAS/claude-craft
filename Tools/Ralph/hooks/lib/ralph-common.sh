#!/usr/bin/env bash
set -euo pipefail
# =============================================================================
# Ralph Wiggum - fonctions communes des hooks (sourcé, jamais exécuté)
#
# Résout hook-io.sh et les gardes (block-dangerous-commands.sh, guard-network.sh) :
#   1. copiés dans le projet à côté des hooks (.ralph/hooks/ et .ralph/hooks/lib/)
#   2. sinon dans le paquet claude-craft (Dev/i18n/base/Common/hooks/scripts/)
# =============================================================================

RALPH_HOOKS_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

# ralph_shared <chemin relatif> : affiche le chemin du script partagé, échoue s'il manque.
ralph_shared() {
    local base="$RALPH_HOOKS_DIR" c
    for c in "$base/$1" "$base/../../../Dev/i18n/base/Common/hooks/scripts/$1"; do
        if [ -f "$c" ]; then
            printf '%s' "$c"
            return 0
        fi
    done
    return 1
}

if ! _hook_io=$(ralph_shared lib/hook-io.sh); then
    echo "ralph hooks: lib/hook-io.sh introuvable" >&2
    exit 1
fi
# shellcheck source=/dev/null
. "$_hook_io"

# Valeur au chemin pointé dans un JSON donné (sans toucher à HOOK_INPUT).
ralph_json_get() {
    local HOOK_INPUT=$1
    hook_get "$2"
}

# Encode une commande en payload PreToolUse {"tool_input":{"command":...}}.
ralph_payload() {
    if hook_has_jq; then
        jq -cn --arg c "$1" '{tool_input: {command: $c}}'
    else
        node -e 'process.stdout.write(JSON.stringify({tool_input: {command: process.argv[1]}}))' "$1"
    fi
}

# ralph_guard_verdict <commande> : 0 = autorisée ; 1 = refusée (motif sur stdout).
# Échoue fermé : garde introuvable ou pas de parseur => refus.
ralph_guard_verdict() {
    local payload guard path out rc
    hook_has_parser || { printf 'no JSON parser to inspect the command'; return 1; }
    payload=$(ralph_payload "$1")
    for guard in block-dangerous-commands.sh guard-network.sh; do
        path=$(ralph_shared "$guard") || { printf 'guard %s not found' "$guard"; return 1; }
        rc=0
        out=$(printf '%s' "$payload" | BLOCK_RM_RF=dangerous bash "$path" 2>&1 1>/dev/null) || rc=$?
        if [ "$rc" -ne 0 ]; then
            printf '%s' "${out:-blocked by $guard}"
            return 1
        fi
    done
    return 0
}

# ralph_find_config : affiche ralph.yml s'il existe (cwd = projet).
ralph_find_config() {
    local p
    for p in ralph.yml .claude/ralph.yml; do
        if [ -f "$p" ]; then
            printf '%s' "$p"
            return 0
        fi
    done
    return 1
}

# ralph_dod_items <config> : un objet JSON compact par ligne (checklist de la DoD).
# Rien si yq est absent ou la checklist vide.
ralph_dod_items() {
    local json
    command -v yq >/dev/null 2>&1 || return 0
    json=$(yq -o=json '.definition_of_done.checklist // []' "$1" 2>/dev/null) || return 0
    if hook_has_jq; then
        printf '%s' "$json" | jq -c '.[]?'
    elif command -v node >/dev/null 2>&1; then
        printf '%s' "$json" | node -e '
            let s = "";
            process.stdin.on("data", (d) => (s += d)).on("end", () => {
                const v = JSON.parse(s || "[]");
                if (Array.isArray(v)) for (const i of v) console.log(JSON.stringify(i));
            });'
    fi
}

# Élément marqué `required: false` (JSON compact) ?
ralph_item_optional() {
    case "$1" in
        *'"required":false'*) return 0 ;;
        *) return 1 ;;
    esac
}
