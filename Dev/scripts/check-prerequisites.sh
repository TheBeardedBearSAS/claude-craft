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

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Options
VERBOSE=false
FIX=false

for arg in "$@"; do
    case $arg in
        --verbose) VERBOSE=true ;;
        --fix) FIX=true ;;
    esac
done

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  Claude Craft Prerequisites Check                          ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
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
            echo -e "  ${GREEN}[OK]${NC} $cmd: $version"
        else
            echo -e "  ${GREEN}[OK]${NC} $cmd"
        fi
        return 0
    else
        if [[ "$required" == "required" ]]; then
            echo -e "  ${RED}[MISSING]${NC} $cmd - $description"
            ((ERRORS++))
            if $FIX; then
                case $OS in
                    macos) echo -e "       ${YELLOW}Fix:${NC} $install_macos" ;;
                    debian) echo -e "       ${YELLOW}Fix:${NC} $install_debian" ;;
                    arch) echo -e "       ${YELLOW}Fix:${NC} Check Arch Wiki for $cmd" ;;
                    *) echo -e "       ${YELLOW}Fix:${NC} Install $cmd manually" ;;
                esac
            fi
        else
            echo -e "  ${YELLOW}[OPTIONAL]${NC} $cmd - $description"
            if $FIX; then
                case $OS in
                    macos) echo -e "       ${YELLOW}Install:${NC} $install_macos" ;;
                    debian) echo -e "       ${YELLOW}Install:${NC} $install_debian" ;;
                    *) echo -e "       ${YELLOW}Install:${NC} See documentation for $cmd" ;;
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
            echo -e "  ${RED}[WRONG VERSION]${NC} yq - You have the Python version, need Mike Farah's yq v4"
            if $FIX; then
                echo -e "       ${YELLOW}Fix (macOS):${NC} brew install yq"
                echo -e "       ${YELLOW}Fix (Linux):${NC} sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq && sudo chmod +x /usr/local/bin/yq"
            fi
            ((ERRORS++))
            return 1
        fi
    fi
    return 1
}

# Check Node.js version
check_node_version() {
    if command -v node &> /dev/null; then
        local version=$(node --version | sed 's/v//' | cut -d. -f1)
        if [[ $version -ge 18 ]]; then
            return 0
        else
            echo -e "  ${RED}[OLD VERSION]${NC} node - Found v$version, need v18+"
            if $FIX; then
                echo -e "       ${YELLOW}Fix:${NC} Use nvm to install Node.js 20: nvm install 20 && nvm use 20"
            fi
            ((ERRORS++))
            return 1
        fi
    fi
    return 1
}

echo -e "${YELLOW}Required Dependencies:${NC}"
echo ""

check "node" "Node.js 18+ for NPX and CLI" \
    "brew install node" \
    "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs" \
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
echo -e "${YELLOW}Recommended Dependencies:${NC}"
echo ""

check "docker" "Container runtime" \
    "Download Docker Desktop from docker.com" \
    "curl -fsSL https://get.docker.com | sudo sh" \
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
        echo -e "  ${GREEN}[OK]${NC} Docker daemon is running"
    else
        echo -e "  ${YELLOW}[WARNING]${NC} Docker is installed but not running"
        if $FIX; then
            echo -e "       ${YELLOW}Fix:${NC} Start Docker Desktop or run: sudo systemctl start docker"
        fi
    fi
fi

echo ""
echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"

if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}All required prerequisites are installed!${NC}"
    echo ""
    echo "You can now install Claude Craft:"
    echo "  npx @the-bearded-bear/claude-craft install ~/my-project --tech=symfony"
    echo ""
    exit 0
else
    echo -e "${RED}Missing $ERRORS required prerequisite(s).${NC}"
    echo ""
    if ! $FIX; then
        echo "Run with --fix to see installation commands:"
        echo "  ./check-prerequisites.sh --fix"
    fi
    echo ""
    exit 1
fi
