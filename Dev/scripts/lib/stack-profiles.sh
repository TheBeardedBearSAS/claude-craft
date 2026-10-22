#!/bin/bash
set -euo pipefail
# Stack profiles — render stack-aware snippets from Dev/stack-profiles/<tech>/.
# Pure bash (no yq/jq): sourced by install-common-rules.sh and install-project-commands.sh.

STACK_PROFILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../stack-profiles" && pwd)"

# "project, python,react,python" -> "python react" (deduped, order kept, unknown techs dropped)
parse_tech_list() {
    local IFS=$', \t\n' tech result=" "
    for tech in $1; do
        [[ "$tech" == "project" || "$tech" == "common" ]] && continue
        [[ "$result" == *" $tech "* ]] && continue
        if [[ ! -f "$STACK_PROFILES_DIR/$tech/stack.txt" ]]; then
            echo "Warning: no stack profile for '$tech' (skipped)" >&2
            continue
        fi
        result+="$tech "
    done
    result="${result# }"
    echo "${result% }"
}

all_profile_techs() {
    local dir
    for dir in "$STACK_PROFILES_DIR"/*/; do
        [[ -f "$dir/stack.txt" ]] && basename "$dir"
    done | tr '\n' ' '
}

_profile_line() { sed -n "${2}p" "$STACK_PROFILES_DIR/$1/stack.txt"; }

# $1 = separator, rest = techs -> "Python, React"
stack_display_names() {
    local sep="$1" out="" tech
    shift
    for tech in "$@"; do
        out+="${out:+$sep}$(_profile_line "$tech" 1)"
    done
    echo "$out"
}

# "python: FastAPI, ..." per tech (body of the CLAUDE.md yaml block)
render_stack_block() {
    local tech
    for tech in "$@"; do
        echo "$tech: $(_profile_line "$tech" 2)"
    done
}

# "### Python" + quality bullets per tech having a quality.md
render_quality_block() {
    local tech first=true
    for tech in "$@"; do
        [[ -f "$STACK_PROFILES_DIR/$tech/quality.md" ]] || continue
        $first || echo ""
        first=false
        echo "### $(_profile_line "$tech" 1)"
        cat "$STACK_PROFILES_DIR/$tech/quality.md"
    done
}

# JSON array entries ('      "Bash(x)",') for the settings.json allow list, deduped
render_permission_lines() {
    local tech rule seen=$'\n'
    for tech in "$@"; do
        [[ -f "$STACK_PROFILES_DIR/$tech/permissions.txt" ]] || continue
        while IFS= read -r rule; do
            [[ -z "$rule" || "$seen" == *$'\n'"$rule"$'\n'* ]] && continue
            seen+="$rule"$'\n'
            echo "      \"$rule\","
        done < "$STACK_PROFILES_DIR/$tech/permissions.txt"
    done
}
