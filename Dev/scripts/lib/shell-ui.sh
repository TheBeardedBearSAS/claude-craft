#!/bin/bash
set -euo pipefail
IFS=$'\n\t'
# ═══════════════════════════════════════════════════════════════════════════
# shell-ui.sh — Shared UI functions for Claude-Craft shell scripts
# ═══════════════════════════════════════════════════════════════════════════
#
# Provides consistent colors, logging, headers, and section formatting.
# Source this file from any install/check script:
#
#   source "$(dirname "${BASH_SOURCE[0]}")/lib/shell-ui.sh"
#
# ═══════════════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────────────────
# ANSI Colors
# ─────────────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# ─────────────────────────────────────────────────────────────────────────────
# Logging functions
# ─────────────────────────────────────────────────────────────────────────────
ui_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
ui_success() { echo -e "${GREEN}[OK]${NC} $1"; }
ui_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
ui_error()   { echo -e "${RED}[ERROR]${NC} $1"; }
ui_dry_run() { echo -e "${YELLOW}[DRY-RUN]${NC} $1"; }

# ─────────────────────────────────────────────────────────────────────────────
# Check-style logging (indented with icons)
# ─────────────────────────────────────────────────────────────────────────────
ui_check_ok()   { echo -e "     ${GREEN}✓${NC} $1"; }
ui_check_warn() { echo -e "     ${YELLOW}⚠${NC} $1"; }
ui_check_fail() { echo -e "     ${RED}✗${NC} $1"; }
ui_check_info() { echo -e "     ${BLUE}ℹ${NC} $1"; }

# ─────────────────────────────────────────────────────────────────────────────
# Section headers
# ─────────────────────────────────────────────────────────────────────────────

# Print a boxed header with icon
# Usage: ui_header "Title text"
ui_header() {
    echo ""
    echo -e "${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║${NC}  $1"
    echo -e "${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Print a colored boxed header
# Usage: ui_box "Title" "$CYAN"
ui_box() {
    local title="$1"
    local color="${2:-$CYAN}"
    echo -e "${color}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${color}║${NC}  ${title}"
    echo -e "${color}╚════════════════════════════════════════════════════════════╝${NC}"
}

# Print a separator line
# Usage: ui_separator
ui_separator() {
    echo -e "${BOLD}══════════════════════════════════════════════════════════════${NC}"
}

# ─────────────────────────────────────────────────────────────────────────────
# Progress indicators
# ─────────────────────────────────────────────────────────────────────────────

# Print a step indicator
# Usage: ui_step 1 5 "Installing common rules..."
ui_step() {
    local current="$1"
    local total="$2"
    local message="$3"
    echo -e "${CYAN}[${current}/${total}]${NC} ${message}"
}
