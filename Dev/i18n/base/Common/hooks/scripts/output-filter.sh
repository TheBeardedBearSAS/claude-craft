#!/usr/bin/env bash
# PostToolUse(Bash), opt-in (voir templates/examples/output-filter.json) : une sortie
# de plus de 50 000 caractères est REMPLACÉE par ses 8 000 premiers caractères, pour
# que le modèle n'ingère jamais le blob entier. Contrairement à output-size-hint.sh
# (simple conseil), cela économise réellement du contexte.
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

hook_has_parser || exit 0
hook_input
OUT=$(hook_get tool_response.stdout)
LEN=${#OUT}
[ "$LEN" -gt 50000 ] || exit 0

INTERRUPTED=false
[ "$(hook_get tool_response.interrupted)" != true ] || INTERRUPTED=true
HEAD=$(printf '%s' "$OUT" | head -c 8000)
hook_replace_bash_output \
  "[output truncated by the output-filter hook: ${LEN} chars total, first 8000 shown. Re-run with a narrower command (grep/head/tail) to see more.]
${HEAD}" \
  "$(hook_get tool_response.stderr)" "$INTERRUPTED"
exit 0
