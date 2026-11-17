#!/bin/bash
# legacy-commands.sh — migrate pre-10.0 command folders to their bear- prefixed names.
#
# Since 10.0 commands live in .claude/commands/bear-<ns>/ (prefixed). An installation
# made by an older version still has .claude/commands/<ns>/ (unprefixed): left alone, every
# command would exist twice. In the old folder every file we ship (same name as a file of
# bear-<ns>/, or listed in config/removed-commands.yaml) is deleted and every other file (the
# user's own) is kept. The folder is removed when empty, otherwise kept with a warning.
#
# Usage (sourced): migrate_legacy_commands <target_dir> <ns>...

LEGACY_COMMANDS_MANIFEST="${LEGACY_COMMANDS_MANIFEST:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)/config/removed-commands.yaml}"

migrate_legacy_commands() {
    local target_dir="$1"
    shift
    local commands_dir="$target_dir/.claude/commands" ns old new f name
    local -a foreign
    for ns in "$@"; do
        old="$commands_dir/$ns"
        new="$commands_dir/bear-$ns"
        [[ -d "$old" && -d "$new" ]] || continue
        foreign=()
        while IFS= read -r -d '' f; do
            name="${f#"$old"/}"
            if [[ -f "$new/$name" ]] ||
                { [[ -f "$LEGACY_COMMANDS_MANIFEST" ]] &&
                    grep -qE "^[[:space:]]*(-[[:space:]]+)?${ns}/${name//./\\.}(:|[[:space:]]|$)" "$LEGACY_COMMANDS_MANIFEST"; }; then
                rm -f "$f"
            else
                foreign+=("$name")
            fi
        done < <(find "$old" -type f -print0 | sort -z)
        if [[ ${#foreign[@]} -eq 0 ]]; then
            find "$old" -depth -delete
            echo "  migrated .claude/commands/$ns/ -> .claude/commands/bear-$ns/ (old folder removed)"
        else
            find "$old" -mindepth 1 -type d -empty -delete
            echo "  [WARN] .claude/commands/$ns/ kept for your files (${foreign[*]}): our commands moved to /bear-$ns:*" >&2
        fi
    done
}
