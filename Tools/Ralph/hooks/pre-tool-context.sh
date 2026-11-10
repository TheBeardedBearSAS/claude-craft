#!/usr/bin/env bash
# =============================================================================
# Ralph Wiggum - PreToolUse Hook (matcher Agent|Task) : rappel de la tâche de sprint
# courante avant de déléguer à un sous-agent. Les gardes du dépôt couvrent déjà
# docker / fichiers sensibles : ce hook ne s'occupe plus que du sprint.
# =============================================================================
set -euo pipefail

HOOK_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=lib/ralph-common.sh
. "$HOOK_DIR/lib/ralph-common.sh"

hook_has_parser || exit 0
hook_input
case "$(hook_get tool_name)" in
    Agent | Task) ;;
    *) exit 0 ;;
esac

CWD=$(hook_get cwd)
cd "${CWD:-.}" 2>/dev/null || true

progress_file="${RALPH_SESSION_BASE:-.ralph}/sprint-progress.md"
[ -f "$progress_file" ] || exit 0
current_task=$(awk '/^## Current Task: /{sub(/^## Current Task: /, ""); print; exit}' "$progress_file")
[ -n "$current_task" ] || exit 0

hook_context PreToolUse "Current sprint task: $current_task"
