#!/usr/bin/env bash
# =============================================================================
# Ralph Wiggum - SessionStart Hook: Session Restore
# Injecte le contexte Ralph au démarrage de session : session active, avancement du
# sprint, git, et liste de la Definition of Done (sans exécuter aucune commande).
# =============================================================================
set -euo pipefail

HOOK_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=lib/ralph-common.sh
. "$HOOK_DIR/lib/ralph-common.sh"

hook_has_parser || exit 0
hook_input
CWD=$(hook_get cwd)
cd "${CWD:-.}" 2>/dev/null || true

RALPH_SESSION_BASE="${RALPH_SESSION_BASE:-.ralph}"
HOOK_CONTEXT_FILE="${RALPH_HOOK_CONTEXT:-}"

# Nombre de lignes de `$2` correspondant à `$1` (toujours un seul nombre).
count_matches() {
    local n
    n=$(grep -c "$1" "$2" 2>/dev/null || true)
    printf '%s' "${n:-0}"
}

# Liste (sans exécuter) les éléments requis de la DoD.
dod_listing() {
    local config line name out=""
    config=$(ralph_find_config) || return 0
    if ! command -v yq >/dev/null 2>&1; then
        printf 'Definition of Done: %s present (yq missing, not listed)' "$config"
        return 0
    fi
    while IFS= read -r line; do
        [ -n "$line" ] || continue
        ralph_item_optional "$line" && continue
        name=$(ralph_json_get "$line" name)
        [ -n "$name" ] || name=$(ralph_json_get "$line" id)
        out="$out
- ${name:-unnamed}"
    done < <(ralph_dod_items "$config")
    [ -z "$out" ] || printf 'Definition of Done (checked when you stop):%s' "$out"
}

build_session_context() {
    local context="" phase task ralph_session ctx_json
    if [ -n "$HOOK_CONTEXT_FILE" ] && [ -f "$HOOK_CONTEXT_FILE" ]; then
        ctx_json=$(cat "$HOOK_CONTEXT_FILE")
        phase=$(ralph_json_get "$ctx_json" phase)
        task=$(ralph_json_get "$ctx_json" current_task)
        ralph_session=$(ralph_json_get "$ctx_json" session_id)
        context="Ralph Wiggum Session Active
- Ralph Session: $ralph_session
- Phase: ${phase:-UNKNOWN}
- Current Task: ${task:-None}"
    fi

    local progress_file="$RALPH_SESSION_BASE/sprint-progress.md"
    if [ -f "$progress_file" ]; then
        local done_n todo_n current_phase
        done_n=$(count_matches '^[[:space:]]*- \[x\]' "$progress_file")
        todo_n=$(count_matches '^[[:space:]]*- \[ \]' "$progress_file")
        current_phase=$(awk '/^## Current Phase: /{sub(/^## Current Phase: /, ""); print; exit}' "$progress_file")
        context="${context:+$context
}Sprint Progress:
- Completed Tasks: $done_n
- Pending Tasks: $todo_n"
        [ -z "$current_phase" ] || context="$context
- Sprint Phase: $current_phase"
    fi

    if [ -n "$context" ] && command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
        local branch changes
        branch=$(git branch --show-current 2>/dev/null || true)
        changes=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ' || true)
        context="$context

Git Status:
- Branch: ${branch:-detached}
- Uncommitted changes: ${changes:-0}"
    fi

    local dod
    dod=$(dod_listing)
    [ -z "$dod" ] || context="${context:+$context

}$dod"

    printf '%s' "${context:-Ralph Wiggum monitoring active}"
}

hook_context SessionStart "$(build_session_context)"
