#!/usr/bin/env bash
# PostToolUseFailure : journalise l'échec d'un outil et, quand une piste de
# récupération est connue, la transmet au modèle (hookSpecificOutput.additionalContext).
# Les messages ci-dessous s'adressent au modèle et aux journaux : en anglais, quelle
# que soit la langue d'installation.
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

hook_has_parser || exit 0
hook_input
TOOL=$(hook_get tool_name)
ERROR=$(hook_get error)
CWD=$(hook_get cwd)
[ -z "$CWD" ] || cd "$CWD" 2>/dev/null || true

has() { printf '%s' "$ERROR" | grep -qiE -e "$1"; }

# Piste de récupération (vide = aucune) selon l'outil et le message d'erreur.
recovery_hint() {
  case "$TOOL" in
    Bash)
      if has "command not found"; then printf 'Command not found. Check that it is installed, or run it in a Docker container.'
      elif has "permission denied"; then printf 'Permission denied. Check file permissions instead of retrying with elevated rights.'
      elif has "no such file or directory"; then printf 'File or directory not found. Check that the path exists.'
      elif has "timeout|timed out"; then printf 'Command timed out. Raise the timeout or narrow the command.'
      fi ;;
    Edit | Write)
      if has "permission denied"; then printf 'Write permission denied. Check the file permissions.'
      elif has "no such file"; then printf 'The target directory may not exist. Create the parent directories first.'
      elif has "not unique|multiple matches|found [0-9]+ matches"; then printf 'old_string is not unique. Provide more surrounding context.'
      fi ;;
    Read)
      if has "no such file"; then printf 'File not found. Use Glob to locate the right path.'
      elif has "is a directory"; then printf 'The target is a directory, not a file. Use ls or Glob to list its content.'
      fi ;;
    Glob | Grep) printf 'Search failed. Check the pattern syntax and the path.' ;;
    Agent | Task) has "timeout|timed out" && printf 'Sub-agent timed out. Consider splitting the task into smaller parts.' ;;
  esac
}

severity=ERROR
case "$TOOL" in Read | Glob | Grep) severity=WARN ;; esac
mkdir -p .claude/logs 2>/dev/null
printf '[%s] [%s] [%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$severity" "$TOOL" \
  "$(printf '%s' "$ERROR" | tr '\n' ' ' | cut -c1-300)" >>.claude/logs/tool-failures.log 2>/dev/null

HINT=$(recovery_hint)
[ -z "$HINT" ] || hook_context PostToolUseFailure "$HINT"
exit 0
