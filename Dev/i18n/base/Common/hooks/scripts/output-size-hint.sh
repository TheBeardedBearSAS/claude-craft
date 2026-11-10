#!/usr/bin/env bash
# PostToolUse(Bash|Grep|Glob) : sortie volumineuse => conseil de synthèse envoyé
# au modèle via additionalContext (un echo sur stdout ne lui parvient pas).
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

hook_has_parser || exit 0
hook_input
OUT=$(hook_get tool_response.stdout)
[ -n "$OUT" ] || OUT=$(hook_get tool_response)
LEN=${#OUT}

if [ "$LEN" -gt 50000 ]; then
  hook_context PostToolUse "Output very large (${LEN} chars). Summarize key findings only; do not repeat output verbatim."
elif [ "$(hook_get tool_name)" = "Bash" ] && [ "$LEN" -gt 10000 ]; then
  hook_context PostToolUse "Output: $(printf '%s\n' "$OUT" | wc -l | tr -d ' ') lines. Extract only relevant information."
fi
exit 0
