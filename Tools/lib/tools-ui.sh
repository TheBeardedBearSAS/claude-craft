#!/bin/bash
# =============================================================================
# tools-ui.sh — Shared UI helpers for Claude Craft CLI tools
# Source this file from any tool script for consistent colors and helpers.
# =============================================================================

# Guard against double-sourcing
[[ -n "${_TOOLS_UI_LOADED:-}" ]] && return 0
_TOOLS_UI_LOADED=1

# ---------------------------------------------------------------------------
# Colors (with NO_COLOR / non-tty support)
# ---------------------------------------------------------------------------
if [[ ! -t 1 ]] || [[ -n "${NO_COLOR:-}" ]]; then
    C_RESET='' C_BOLD='' C_DIM=''
    C_RED='' C_GREEN='' C_YELLOW='' C_BLUE='' C_MAGENTA='' C_CYAN=''
else
    C_RESET='\033[0m'
    C_BOLD='\033[1m'
    C_DIM='\033[2m'
    C_RED='\033[0;31m'
    C_GREEN='\033[0;32m'
    C_YELLOW='\033[0;33m'
    C_BLUE='\033[0;34m'
    C_MAGENTA='\033[0;35m'
    C_CYAN='\033[0;36m'
fi

# ---------------------------------------------------------------------------
# Print helpers
# ---------------------------------------------------------------------------
print_success() { echo -e "${C_GREEN}✓${C_RESET} $1"; }
print_error()   { echo -e "${C_RED}✗${C_RESET} $1"; }
print_info()    { echo -e "${C_BLUE}ℹ${C_RESET} $1"; }
print_warning() { echo -e "${C_YELLOW}⚠${C_RESET} $1"; }

# ---------------------------------------------------------------------------
# select_from_list — present a numbered list and return the selected item
#
# Usage:
#   local items=("alpha" "beta" "gamma")
#   local selected
#   selected=$(select_from_list "Pick one:" "${items[@]}")
#
# Returns the selected item string on stdout, or returns 1 on bad input.
# ---------------------------------------------------------------------------
select_from_list() {
    local prompt="$1"
    shift
    local items=("$@")

    local i=1
    for item in "${items[@]}"; do
        echo -e "  ${C_CYAN}$i)${C_RESET} $item"
        i=$((i + 1))
    done
    echo ""
    read -p "$prompt " choice

    if [[ "$choice" =~ ^[0-9]+$ ]] && [[ "$choice" -ge 1 ]] && [[ "$choice" -le "${#items[@]}" ]]; then
        echo "${items[$((choice - 1))]}"
        return 0
    fi
    return 1
}
