#!/bin/bash
set -euo pipefail
IFS=$'\n\t'
#
# export-plugin.sh - Export claude-craft as a Claude Code plugin
#
# This script packages claude-craft components into the official Claude Code
# plugin format for distribution via marketplace or direct installation.
#
# Usage:
#   ./export-plugin.sh [OPTIONS] <output-directory>
#
# Options:
#   --tech=TECH      Technology to export (common, symfony, flutter, python, react, reactnative, project, infra)
#   --lang=LANG      Language (en, fr, es, de, pt) - default: en
#   --name=NAME      Plugin name (default: claude-craft-<tech>)
#   --version=VER    Plugin version (default: 3.0.0)
#   --all            Export all technologies as separate plugins
#   -h, --help       Show this help
#
# Examples:
#   ./export-plugin.sh --tech=symfony --lang=fr ./plugins
#   ./export-plugin.sh --all ./plugins
#

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_CRAFT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Defaults
TECH=""
LANG="en"
PLUGIN_NAME=""
VERSION="3.0.0"
OUTPUT_DIR=""
EXPORT_ALL=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

show_help() {
    head -25 "$0" | tail -23 | sed 's/^# //' | sed 's/^#//'
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --tech=*)
                TECH="${1#*=}"
                shift
                ;;
            --lang=*)
                LANG="${1#*=}"
                shift
                ;;
            --name=*)
                PLUGIN_NAME="${1#*=}"
                shift
                ;;
            --version=*)
                VERSION="${1#*=}"
                shift
                ;;
            --all)
                EXPORT_ALL=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -*)
                log_error "Unknown option: $1"
                exit 1
                ;;
            *)
                OUTPUT_DIR="$1"
                shift
                ;;
        esac
    done

    if [[ -z "$OUTPUT_DIR" ]]; then
        log_error "Output directory required"
        show_help
        exit 1
    fi

    if [[ "$EXPORT_ALL" != true ]] && [[ -z "$TECH" ]]; then
        log_error "Technology required (use --tech=... or --all)"
        exit 1
    fi
}

# Create plugin.json manifest
create_manifest() {
    local plugin_dir="$1"
    local name="$2"
    local description="$3"

    mkdir -p "$plugin_dir/.claude-plugin"

    cat > "$plugin_dir/.claude-plugin/plugin.json" << EOF
{
  "name": "$name",
  "description": "$description",
  "version": "$VERSION",
  "author": {
    "name": "Claude-Craft",
    "url": "https://github.com/your-org/claude-craft"
  },
  "repository": "https://github.com/your-org/claude-craft",
  "license": "MIT"
}
EOF
    log_success "Created plugin.json manifest"
}

# Export a single technology
export_tech() {
    local tech="$1"
    local output="$2"
    local name="${PLUGIN_NAME:-claude-craft-$tech}"
    local plugin_dir="$output/$name"

    log_info "Exporting $tech to $plugin_dir..."

    # Determine source directory
    local src_base=""
    case "$tech" in
        common)
            src_base="$CLAUDE_CRAFT_ROOT/Dev/i18n/$LANG/Common"
            ;;
        symfony|flutter|python|react|reactnative)
            # Capitalize first letter
            local tech_cap="$(echo "${tech:0:1}" | tr '[:lower:]' '[:upper:]')${tech:1}"
            [[ "$tech" == "reactnative" ]] && tech_cap="ReactNative"
            src_base="$CLAUDE_CRAFT_ROOT/Dev/i18n/$LANG/$tech_cap"
            ;;
        project)
            src_base="$CLAUDE_CRAFT_ROOT/Project/i18n/$LANG"
            ;;
        infra)
            src_base="$CLAUDE_CRAFT_ROOT/Infra/i18n/$LANG"
            ;;
        *)
            log_error "Unknown technology: $tech"
            return 1
            ;;
    esac

    if [[ ! -d "$src_base" ]]; then
        log_error "Source directory not found: $src_base"
        return 1
    fi

    # Create plugin directory structure
    mkdir -p "$plugin_dir"

    # Create manifest
    local description="Claude Code rules, commands, and agents for $tech development"
    create_manifest "$plugin_dir" "$name" "$description"

    # Copy commands (with namespace prefix removed - plugin adds it automatically)
    if [[ -d "$src_base/commands" ]]; then
        mkdir -p "$plugin_dir/commands"
        cp -r "$src_base/commands"/*.md "$plugin_dir/commands/" 2>/dev/null || true
        log_success "Copied commands"
    fi

    # Copy agents
    if [[ -d "$src_base/agents" ]]; then
        mkdir -p "$plugin_dir/agents"
        cp -r "$src_base/agents"/*.md "$plugin_dir/agents/" 2>/dev/null || true
        log_success "Copied agents"
    fi

    # Copy skills
    if [[ -d "$src_base/skills" ]]; then
        mkdir -p "$plugin_dir/skills"
        cp -r "$src_base/skills"/* "$plugin_dir/skills/" 2>/dev/null || true
        log_success "Copied skills"
    fi

    # Copy templates
    if [[ -d "$src_base/templates" ]]; then
        mkdir -p "$plugin_dir/templates"
        cp -r "$src_base/templates"/* "$plugin_dir/templates/" 2>/dev/null || true
        log_success "Copied templates"
    fi

    # Copy checklists
    if [[ -d "$src_base/checklists" ]]; then
        mkdir -p "$plugin_dir/checklists"
        cp -r "$src_base/checklists"/* "$plugin_dir/checklists/" 2>/dev/null || true
        log_success "Copied checklists"
    fi

    # Copy hooks (for common only)
    if [[ "$tech" == "common" ]] && [[ -d "$src_base/hooks" ]]; then
        mkdir -p "$plugin_dir/hooks"

        # Create hooks.json from the hook scripts
        cat > "$plugin_dir/hooks/hooks.json" << 'EOF'
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{"type": "command", "command": ".claude/hooks/post-edit-lint.sh", "timeout": 60}]
      }
    ]
  }
}
EOF
        log_success "Created hooks configuration"
    fi

    # Create README
    cat > "$plugin_dir/README.md" << EOF
# $name

Claude Code plugin for $tech development.

## Installation

\`\`\`bash
claude /plugin install $name
\`\`\`

Or test locally:
\`\`\`bash
claude --plugin-dir ./$name
\`\`\`

## Contents

- Commands: \`/$name:command-name\`
- Agents: Custom subagents for $tech
- Skills: Auto-invoked expertise
- Templates: Code generation patterns

## Version

$VERSION

## License

MIT
EOF

    log_success "Plugin exported to: $plugin_dir"
    echo ""
}

# Main
main() {
    echo "========================================"
    echo "  Claude-Craft Plugin Export"
    echo "========================================"
    echo ""

    mkdir -p "$OUTPUT_DIR"

    if [[ "$EXPORT_ALL" == true ]]; then
        log_info "Exporting all technologies..."
        for tech in common symfony flutter python react reactnative project infra; do
            export_tech "$tech" "$OUTPUT_DIR"
        done
    else
        export_tech "$TECH" "$OUTPUT_DIR"
    fi

    echo "========================================"
    log_success "Export complete!"
    echo "========================================"
    echo ""
    echo "Next steps:"
    echo "  1. Test plugin: claude --plugin-dir $OUTPUT_DIR/<plugin-name>"
    echo "  2. Publish to marketplace or share directly"
    echo ""
}

parse_args "$@"
main
