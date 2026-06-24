#!/bin/bash
#===============================================================================
# check-prerequisites.sh - Verify Claude Craft Prerequisites
#
# Usage:
#   ./check-prerequisites.sh [--verbose] [--fix]
#
# Options:
#   --verbose    Show detailed version information
#   --fix        Show installation commands for missing tools
#
# Exit codes:
#   0 - All required prerequisites installed
#   1 - Missing required prerequisites
#===============================================================================

set -euo pipefail
IFS=$'\n\t'

# Shared UI library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/lib/shell-ui.sh"

# Options
VERBOSE=false
FIX=false

for arg in "$@"; do
    case $arg in
        --verbose) VERBOSE=true ;;
        --fix) FIX=true ;;
    esac
done

ui_box "Claude Craft Prerequisites Check"
echo ""

ERRORS=0

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ -f /etc/debian_version ]]; then
        echo "debian"
    elif [[ -f /etc/arch-release ]]; then
        echo "arch"
    elif [[ -f /etc/redhat-release ]]; then
        echo "rhel"
    else
        echo "unknown"
    fi
}

OS=$(detect_os)

# Check function
check() {
    local cmd=$1
    local description=$2
    local install_macos=$3
    local install_debian=$4
    local required=$5

    if command -v "$cmd" &> /dev/null; then
        if $VERBOSE; then
            local version=$($cmd --version 2>&1 | head -n1)
            ui_check_ok "$cmd: $version"
        else
            ui_check_ok "$cmd"
        fi
        return 0
    else
        if [[ "$required" == "required" ]]; then
            ui_check_fail "$cmd - $description"
            ERRORS=$((ERRORS + 1))
            if $FIX; then
                case $OS in
                    macos) ui_check_info "Fix: $install_macos" ;;
                    debian) ui_check_info "Fix: $install_debian" ;;
                    arch) ui_check_info "Fix: Check Arch Wiki for $cmd" ;;
                    *) ui_check_info "Fix: Install $cmd manually" ;;
                esac
            fi
        else
            ui_check_warn "$cmd - $description"
            if $FIX; then
                case $OS in
                    macos) ui_check_info "Install: $install_macos" ;;
                    debian) ui_check_info "Install: $install_debian" ;;
                    *) ui_check_info "Install: See documentation for $cmd" ;;
                esac
            fi
        fi
        return 1
    fi
}

# Check yq version
check_yq_version() {
    if command -v yq &> /dev/null; then
        local version_output=$(yq --version 2>&1)
        if echo "$version_output" | grep -q "mikefarah"; then
            return 0
        else
            ui_check_fail "yq - You have the Python version, need Mike Farah's yq v4"
            if $FIX; then
                ui_check_info "Fix (macOS): brew install yq"
                ui_check_info "Fix (Linux): sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq && sudo chmod +x /usr/local/bin/yq"
            fi
            ERRORS=$((ERRORS + 1))
            return 1
        fi
    fi
    return 1
}

# Check Node.js version
check_node_version() {
    if command -v node &> /dev/null; then
        local version=$(node --version | sed 's/v//' | cut -d. -f1)
        if [[ $version -ge 22 ]]; then
            return 0
        else
            ui_check_fail "node - Found v$version, need v22+"
            if $FIX; then
                ui_check_info "Fix: Use nvm to install Node.js 22: nvm install 22 && nvm use 22"
            fi
            ERRORS=$((ERRORS + 1))
            return 1
        fi
    fi
    return 1
}

echo -e "${BOLD}Required Dependencies:${NC}"
echo ""

check "node" "Node.js 22+ for NPX and CLI" \
    "brew install node" \
    "sudo apt install nodejs npm" \
    "required"
check_node_version

check "npm" "npm package manager" \
    "brew install node" \
    "sudo apt install npm" \
    "required"

check "bash" "Bash shell for scripts" \
    "(pre-installed)" \
    "(pre-installed)" \
    "required"

check "yq" "YAML processor for configuration" \
    "brew install yq" \
    "sudo apt install yq" \
    "required"
check_yq_version

check "git" "Version control" \
    "brew install git" \
    "sudo apt install git" \
    "required"

echo ""
echo -e "${BOLD}Recommended Dependencies:${NC}"
echo ""

check "docker" "Container runtime" \
    "Download Docker Desktop from docker.com" \
    "sudo apt install docker.io docker-compose-v2" \
    "optional"

check "jq" "JSON processor (for StatusLine)" \
    "brew install jq" \
    "sudo apt install jq" \
    "optional"

check "make" "Build automation" \
    "xcode-select --install" \
    "sudo apt install make" \
    "optional"

echo ""

# Check Docker running (if installed)
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        ui_check_ok "Docker daemon is running"
    else
        ui_check_warn "Docker is installed but not running"
        if $FIX; then
            ui_check_info "Fix: Start Docker Desktop or run: sudo systemctl start docker"
        fi
    fi
fi

echo ""
ui_separator

if [[ $ERRORS -eq 0 ]]; then
    ui_success "All required prerequisites are installed!"
    echo ""
    echo "You can now install Claude Craft:"
    echo "  npx @the-bearded-bear/claude-craft install ~/my-project --tech=symfony"
    echo ""
    exit 0
else
    ui_error "Missing $ERRORS required prerequisite(s)."
    echo ""
    if ! $FIX; then
        echo "Run with --fix to see installation commands:"
        echo "  ./check-prerequisites.sh --fix"
    fi
    echo ""
    exit 1
fi
