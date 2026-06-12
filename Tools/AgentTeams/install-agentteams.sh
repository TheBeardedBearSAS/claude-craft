#!/bin/bash
# =============================================================================
# install-agentteams.sh — Install AgentTeams helper scripts into a project
#
# The /team:* commands (sprint, audit, delivery, security) expect helper
# scripts at <project>/Tools/AgentTeams/lib/:
#   - cost-estimator.sh      (token/cost estimation)
#   - cost-dashboard.sh      (cost dashboard)
#   - ralph-teams-adapter.sh (--ralph-mode integration)
#   - compatibility-check.sh (Claude Code tool/agent compatibility)
#   - result-aggregator.sh   (aggregate parallel agent results)
#
# When they are absent the commands degrade gracefully (manual estimation, no
# --ralph-mode). This script copies them into the target project so the
# commands work out of the box.
#
# Usage:
#   bash install-agentteams.sh [TARGET_DIR]   # default TARGET_DIR: .
#   bash install-agentteams.sh --check [TARGET_DIR]
#   bash install-agentteams.sh --uninstall [TARGET_DIR]
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_LIB="$SCRIPT_DIR/lib"

# Minimal UI (no hard dependency on shared helpers).
print_success() { echo "✓ $1"; }
print_error()   { echo "✗ $1" >&2; }
print_info()    { echo "ℹ $1"; }
print_warning() { echo "⚠ $1"; }

mode="install"
target="."

for arg in "$@"; do
    case "$arg" in
        --check)     mode="check" ;;
        --uninstall) mode="uninstall" ;;
        -h|--help)
            sed -n '2,22p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
            exit 0
            ;;
        -*)
            print_error "Unknown option: $arg"
            exit 1
            ;;
        *) target="$arg" ;;
    esac
done

target="$(cd "$target" 2>/dev/null && pwd)" || {
    print_error "Target directory not found: $target"
    exit 1
}
dest_lib="$target/Tools/AgentTeams/lib"

if [[ ! -d "$SRC_LIB" ]]; then
    print_error "Source lib not found: $SRC_LIB"
    exit 1
fi

case "$mode" in
    check)
        missing=0
        for f in "$SRC_LIB"/*.sh; do
            name="$(basename "$f")"
            if [[ -f "$dest_lib/$name" ]]; then
                print_success "$name present"
            else
                print_warning "$name MISSING at $dest_lib"
                missing=$((missing + 1))
            fi
        done
        [[ $missing -eq 0 ]] && print_success "AgentTeams installed at $dest_lib" || exit 1
        ;;
    uninstall)
        if [[ -d "$dest_lib" ]]; then
            rm -f "$dest_lib"/*.sh
            rmdir "$dest_lib" 2>/dev/null || true
            print_success "Removed AgentTeams scripts from $dest_lib"
        else
            print_info "Nothing to remove at $dest_lib"
        fi
        ;;
    install)
        mkdir -p "$dest_lib"
        cp "$SRC_LIB"/*.sh "$dest_lib/"
        chmod +x "$dest_lib"/*.sh 2>/dev/null || true
        count=$(find "$dest_lib" -maxdepth 1 -name '*.sh' | wc -l | tr -d ' ')
        print_success "Installed $count AgentTeams helper scripts to $dest_lib"
        ;;
esac
