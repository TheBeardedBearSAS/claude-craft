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
        ns="${rel%%/*}"
        # Current layout (bear-<ns>/) and the pre-10.0 one (<ns>/): both are ours to retire.
        for dir in "bear-$rel" "$rel"; do
            if [[ -f "$commands_dir/$dir" ]]; then
                rm -f "$commands_dir/$dir"
                echo "  removed retired command: .claude/commands/$dir"
            fi
        done
        # Drop the namespace folder once it is empty (e.g. /sprint: in 9.0)
        rmdir "$commands_dir/bear-$ns" "$commands_dir/$ns" 2>/dev/null || true
    done
