#!/bin/bash
# =============================================================================
# Recette - Chrome MCP Verification Module
# Verifies Claude in Chrome MCP is active and configured correctly
# =============================================================================

# Module state
CHROME_MCP_VERIFIED=false
CHROME_MCP_VERSION=""
CHROME_BASE_URL=""

# Required minimum version
CHROME_MCP_MIN_VERSION="1.0.36"

# =============================================================================
# Color and Message Helpers (use Ralph's if available)
# =============================================================================

_print_info() {
    if type print_info &>/dev/null; then
        print_info "$1"
    else
        echo "ℹ  $1"
    fi
}

_print_success() {
    if type print_success &>/dev/null; then
        print_success "$1"
    else
        echo "✓  $1"
    fi
}

_print_error() {
    if type print_error &>/dev/null; then
        print_error "$1"
    else
        echo "✗  $1" >&2
    fi
}

_print_warning() {
    if type print_warning &>/dev/null; then
        print_warning "$1"
    else
        echo "⚠  $1"
    fi
}

# =============================================================================
# Version Comparison
# =============================================================================

# Compare semantic versions: returns 0 if v1 >= v2
version_gte() {
    local v1="$1"
    local v2="$2"

    # Split versions into arrays
    IFS='.' read -ra v1_parts <<< "$v1"
    IFS='.' read -ra v2_parts <<< "$v2"

    # Compare each part
    for ((i=0; i<3; i++)); do
        local p1="${v1_parts[i]:-0}"
        local p2="${v2_parts[i]:-0}"

        if [[ "$p1" -gt "$p2" ]]; then
            return 0
        elif [[ "$p1" -lt "$p2" ]]; then
            return 1
        fi
    done

    return 0  # Equal
}

# =============================================================================
# MCP Detection
# =============================================================================

# Check if Claude in Chrome MCP is available
detect_chrome_mcp() {
    local mcp_list=""

    # Try to get list of MCPs
    if command -v claude &>/dev/null; then
        mcp_list=$(claude mcp list 2>/dev/null || echo "")
    fi

    # Check for claude-in-chrome or similar
    if echo "$mcp_list" | grep -qi "claude-in-chrome\|chrome\|browser"; then
        return 0
    fi

    return 1
}

# Get Chrome MCP version
get_chrome_mcp_version() {
    local version=""

    # Try to get version from MCP
    if command -v claude &>/dev/null; then
        version=$(claude mcp call claude-in-chrome get_version 2>/dev/null || echo "")
    fi

    # Extract version number if present
    if [[ -n "$version" ]]; then
        CHROME_MCP_VERSION=$(echo "$version" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    fi

    echo "$CHROME_MCP_VERSION"
}

# =============================================================================
# Connection Verification
# =============================================================================

# Check connection to Chrome extension
check_chrome_connection() {
    local status=""

    if command -v claude &>/dev/null; then
        status=$(claude mcp call claude-in-chrome get_status 2>/dev/null || echo "")
    fi

    if [[ -z "$status" ]]; then
        return 1
    fi

    if echo "$status" | grep -qi "error\|disconnected\|not found"; then
        return 1
    fi

    return 0
}

# Test navigation to a URL
test_chrome_navigation() {
    local url="$1"
    local result=""

    if command -v claude &>/dev/null; then
        result=$(claude mcp call claude-in-chrome navigate_to_url --url "$url" 2>/dev/null || echo "error")
    fi

    if echo "$result" | grep -qi "error\|failed\|denied\|blocked"; then
        return 1
    fi

    return 0
}

# =============================================================================
# Main Verification Function
# =============================================================================

# Full verification of Chrome MCP
# Returns: 0 = OK, 1 = MCP not found, 2 = connection failed, 3 = version too old
check_chrome_mcp() {
    local base_url="${1:-$CHROME_BASE_URL}"
    local verbose="${2:-false}"

    [[ "$verbose" == "true" ]] && _print_info "Checking Chrome MCP..."

    # 1. Check if MCP is available
    if ! detect_chrome_mcp; then
        _print_error "MCP 'claude-in-chrome' non detecte"
        echo ""
        _print_info "Solutions:"
        _print_info "  1. Lancer Claude Code avec: claude --chrome"
        _print_info "  2. Ou executer /chrome dans la session"
        _print_info "  3. Verifier l'extension Chrome (v$CHROME_MCP_MIN_VERSION+)"
        return 1
    fi

    [[ "$verbose" == "true" ]] && _print_success "MCP detected"

    # 2. Check connection to extension
    if ! check_chrome_connection; then
        _print_error "Extension Chrome non connectee"
        echo ""
        _print_info "Verifier que:"
        _print_info "  - Chrome est ouvert"
        _print_info "  - L'extension Claude in Chrome est active"
        _print_info "  - L'extension est a jour"
        return 2
    fi

    [[ "$verbose" == "true" ]] && _print_success "Chrome extension connected"

    # 3. Check version
    local version
    version=$(get_chrome_mcp_version)

    if [[ -n "$version" ]]; then
        if ! version_gte "$version" "$CHROME_MCP_MIN_VERSION"; then
            _print_error "Extension Chrome v$version < v$CHROME_MCP_MIN_VERSION"
            _print_info "Veuillez mettre a jour l'extension Chrome"
            return 3
        fi
        [[ "$verbose" == "true" ]] && _print_success "Version $version OK"
    fi

    # 4. Check site permissions (if base_url provided)
    if [[ -n "$base_url" ]]; then
        [[ "$verbose" == "true" ]] && _print_info "Testing navigation to $base_url..."

        if ! test_chrome_navigation "$base_url"; then
            _print_warning "Permission Chrome requise pour: $base_url"
            _print_info "Autorisez l'extension sur ce domaine dans Chrome"
            # Not a fatal error, just a warning
        else
            [[ "$verbose" == "true" ]] && _print_success "Site access OK"
        fi
    fi

    CHROME_MCP_VERIFIED=true
    _print_success "MCP Claude in Chrome: OK"
    return 0
}

# =============================================================================
# Interactive Prompt
# =============================================================================

# Prompt user to enable Chrome if not available
prompt_chrome_enable() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         Chrome MCP Required for Recette                     ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "La recette automatisee necessite Claude in Chrome."
    echo ""
    echo "Options:"
    echo "  1. Lancer une nouvelle session avec: claude --chrome"
    echo "  2. Activer Chrome dans cette session: /chrome"
    echo ""
    echo "Documentation: https://docs.claude.ai/claude-code/chrome"
    echo ""
}

# =============================================================================
# Quick Check (for scripts)
# =============================================================================

# Quick boolean check - returns 0 if Chrome MCP is ready
is_chrome_ready() {
    [[ "$CHROME_MCP_VERIFIED" == "true" ]] && return 0

    detect_chrome_mcp && check_chrome_connection
}

# =============================================================================
# Get Chrome Capabilities
# =============================================================================

get_chrome_capabilities() {
    cat << 'EOF'
{
    "navigation": ["navigate_to_url", "go_back", "go_forward", "refresh"],
    "interaction": ["click_element", "type_text", "fill_form", "scroll", "hover"],
    "reading": ["read_dom_state", "get_element_text", "get_element_attribute"],
    "debugging": ["read_console_logs", "get_network_requests", "get_page_errors"],
    "capture": ["take_screenshot", "record_gif"],
    "form": ["select_option", "check_checkbox", "upload_file"]
}
EOF
}

# =============================================================================
# Error Messages
# =============================================================================

# Get error message for exit code
get_chrome_error_message() {
    local code="$1"

    case "$code" in
        0)
            echo "Chrome MCP ready"
            ;;
        1)
            echo "MCP 'claude-in-chrome' non detecte. Utilisez 'claude --chrome' ou '/chrome'"
            ;;
        2)
            echo "Extension Chrome non connectee. Verifiez que Chrome est ouvert et l'extension active"
            ;;
        3)
            echo "Version de l'extension Chrome obsolete. Mise a jour requise vers v$CHROME_MCP_MIN_VERSION+"
            ;;
        *)
            echo "Erreur Chrome inconnue (code: $code)"
            ;;
    esac
}

# =============================================================================
# Export
# =============================================================================

export CHROME_MCP_VERIFIED
export CHROME_MCP_VERSION
export CHROME_BASE_URL
