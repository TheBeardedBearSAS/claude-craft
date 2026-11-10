#!/usr/bin/env bash
# PreToolUse(Edit|Write|NotebookEdit) : refuse l'écriture des fichiers de secrets
# (.env, clés, credentials). Les fichiers d'exemple (.env.example…) restent éditables.
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

hook_require_parser
hook_input
FILE=$(hook_get tool_input.file_path)
[ -n "$FILE" ] || FILE=$(hook_get tool_input.notebook_path)

if [ -n "$FILE" ] && is_sensitive_path "$FILE"; then
  hook_block "Cannot modify sensitive file: $FILE"
fi
exit 0
