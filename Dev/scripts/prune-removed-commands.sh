#!/bin/bash
# Delete retired command files (config/removed-commands.yaml) from <target>/.claude/commands/.
# Usage: prune-removed-commands.sh <target_dir> [manifest]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
target_dir="${1:?usage: prune-removed-commands.sh <target_dir> [manifest]}"
manifest="${2:-$SCRIPT_DIR/../../config/removed-commands.yaml}"
commands_dir="$target_dir/.claude/commands"

[[ -f "$manifest" && -d "$commands_dir" ]] || exit 0

# Entries are list items `  - <namespace>/<command>.md`; anything else is ignored,
# which also rules out `..` or absolute paths.
grep -oE '^[[:space:]]*-[[:space:]]+[a-z]+/[a-z0-9-]+\.md' "$manifest" | sed -E 's/^[[:space:]]*-[[:space:]]+//' |
    while read -r rel; do
        if [[ -f "$commands_dir/$rel" ]]; then
            rm -f "$commands_dir/$rel"
            echo "  removed retired command: .claude/commands/$rel"
        fi
    done
