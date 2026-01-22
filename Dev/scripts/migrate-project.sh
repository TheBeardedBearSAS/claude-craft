#!/bin/bash
#
# migrate-project.sh - Migrate existing claude-craft projects to v3.0
#
# This script upgrades projects installed with older versions of claude-craft
# to the latest format (skills, hooks, MCP support).
#
# Usage:
#   ./migrate-project.sh [OPTIONS] <target-directory>
#
# Options:
#   --dry-run       Show what would be done without making changes
#   --force         Overwrite without asking
#   --backup        Create backup before migration (default: true)
#   --no-backup     Skip backup creation
#   --lang=XX       Language (en, fr, es, de, pt) - default: en
#   --interactive   Ask before each change
#   -h, --help      Show this help
#
# Examples:
#   ./migrate-project.sh ~/my-project
#   ./migrate-project.sh --dry-run ~/my-project
#   ./migrate-project.sh --lang=fr ~/my-project
#

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_CRAFT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load common library
source "$SCRIPT_DIR/lib/install-common.sh"

# Version
CURRENT_VERSION="3.0.0"
VERSION_FILE=".claude/.claude-craft-version"

# Defaults
DRY_RUN=false
FORCE=false
BACKUP=true
INTERACTIVE=false
LANG="en"
TARGET_DIR=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
log_dry_run() { echo -e "${YELLOW}[DRY-RUN]${NC} Would: $1"; }

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --backup)
                BACKUP=true
                shift
                ;;
            --no-backup)
                BACKUP=false
                shift
                ;;
            --interactive)
                INTERACTIVE=true
                shift
                ;;
            --lang=*)
                LANG="${1#*=}"
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
                TARGET_DIR="$1"
                shift
                ;;
        esac
    done

    if [[ -z "$TARGET_DIR" ]]; then
        log_error "Target directory required"
        show_help
        exit 1
    fi

    # Expand path
    TARGET_DIR=$(realpath "$TARGET_DIR" 2>/dev/null || echo "$TARGET_DIR")
}

show_help() {
    head -30 "$0" | tail -28 | sed 's/^# //' | sed 's/^#//'
}

# Detect installed version
detect_version() {
    local target="$1"

    if [[ -f "$target/$VERSION_FILE" ]]; then
        cat "$target/$VERSION_FILE"
        return
    fi

    # Heuristic detection based on structure
    if [[ -d "$target/.claude/skills" ]]; then
        echo "2.x"
    elif [[ -d "$target/.claude/rules" ]]; then
        echo "1.x"
    else
        echo "unknown"
    fi
}

# Check if project has claude-craft installed
is_claude_craft_project() {
    local target="$1"
    [[ -d "$target/.claude" ]] && [[ -f "$target/.claude/CLAUDE.md" || -d "$target/.claude/rules" || -d "$target/.claude/skills" ]]
}

# Create backup
create_backup() {
    local target="$1"
    local backup_dir="${target}/.claude-backup-$(date +%Y%m%d-%H%M%S)"

    if [[ "$DRY_RUN" == true ]]; then
        log_dry_run "Create backup at $backup_dir"
        return
    fi

    log_info "Creating backup..."
    cp -r "$target/.claude" "$backup_dir"
    log_success "Backup created: $backup_dir"
}

# Migrate rules to skills format
migrate_rules_to_skills() {
    local target="$1"
    local rules_dir="$target/.claude/rules"
    local skills_dir="$target/.claude/skills"

    if [[ ! -d "$rules_dir" ]]; then
        log_info "No rules directory found - skipping rules migration"
        return
    fi

    log_info "Migrating rules to skills format..."

    for rule_file in "$rules_dir"/*.md; do
        [[ -f "$rule_file" ]] || continue

        local filename=$(basename "$rule_file")

        # Skip template files
        [[ "$filename" == *".template"* ]] && continue
        [[ "$filename" == "00-project-context.md" ]] && continue

        # Extract skill name from filename (remove number prefix and extension)
        local skill_name=$(echo "$filename" | sed 's/^[0-9]*-//' | sed 's/\.md$//')

        if [[ "$DRY_RUN" == true ]]; then
            log_dry_run "Convert $filename -> skills/$skill_name/"
            continue
        fi

        # Create skill directory
        local skill_dir="$skills_dir/$skill_name"
        mkdir -p "$skill_dir"

        # Create SKILL.md with frontmatter - pointing to the rule file directly
        local title=$(head -1 "$rule_file" | sed 's/^# //')
        cat > "$skill_dir/SKILL.md" << EOF
---
name: $skill_name
description: $title. Use when working with ${skill_name//-/ }.
---

# $title

This skill provides guidelines and best practices.

See ../../rules/$filename for detailed documentation.
EOF

        # Note: REFERENCE.md is no longer created - SKILL.md points directly to the rule file

        log_success "Migrated: $filename -> skills/$skill_name/"
    done
}

# Add hooks templates
add_hooks() {
    local target="$1"
    local hooks_dir="$target/.claude/hooks"
    local src_hooks="$CLAUDE_CRAFT_ROOT/i18n/$LANG/Common/hooks"

    if [[ -d "$hooks_dir" ]]; then
        log_info "Hooks directory already exists - skipping"
        return
    fi

    log_info "Adding hooks templates..."

    if [[ "$DRY_RUN" == true ]]; then
        log_dry_run "Create hooks directory with templates"
        return
    fi

    mkdir -p "$hooks_dir"

    # Copy scripts
    if [[ -d "$src_hooks/scripts" ]]; then
        cp -r "$src_hooks/scripts"/* "$hooks_dir/"
        chmod +x "$hooks_dir"/*.sh 2>/dev/null || true
    fi

    # Copy quickstart
    if [[ -f "$src_hooks/HOOKS-QUICKSTART.md" ]]; then
        cp "$src_hooks/HOOKS-QUICKSTART.md" "$hooks_dir/"
    fi

    log_success "Hooks templates added"
}

# Add MCP templates
add_mcp() {
    local target="$1"
    local mcp_file="$target/.mcp.json"
    local src_mcp="$CLAUDE_CRAFT_ROOT/i18n/$LANG/Common/mcp"

    if [[ -f "$mcp_file" ]]; then
        log_info "MCP configuration already exists - skipping"
        return
    fi

    log_info "Adding MCP configuration (Context7)..."

    if [[ "$DRY_RUN" == true ]]; then
        log_dry_run "Create .mcp.json with Context7"
        return
    fi

    # Add Context7 by default
    if [[ -f "$src_mcp/templates/context7.mcp.json" ]]; then
        cp "$src_mcp/templates/context7.mcp.json" "$mcp_file"
    else
        cat > "$mcp_file" << 'EOF'
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
EOF
    fi

    log_success "MCP configuration added (Context7 enabled)"
}

# Update settings.json
update_settings() {
    local target="$1"
    local settings_file="$target/.claude/settings.json"

    if [[ ! -f "$settings_file" ]]; then
        log_info "No settings.json found - creating default"

        if [[ "$DRY_RUN" == true ]]; then
            log_dry_run "Create settings.json"
            return
        fi

        cat > "$settings_file" << 'EOF'
{
  "permissions": {
    "allow": [],
    "deny": []
  }
}
EOF
        log_success "Created settings.json"
        return
    fi

    # Check if hooks section exists
    if ! grep -q '"hooks"' "$settings_file"; then
        log_info "settings.json exists but no hooks section - consider adding hooks manually"
    fi
}

# Update CLAUDE.md
update_claude_md() {
    local target="$1"
    local claude_md="$target/.claude/CLAUDE.md"

    if [[ ! -f "$claude_md" ]]; then
        log_warning "CLAUDE.md not found"
        return
    fi

    # Check if already has hooks/MCP sections
    if grep -q "## Hooks" "$claude_md" || grep -q "## MCP" "$claude_md"; then
        log_info "CLAUDE.md already has Hooks/MCP sections"
        return
    fi

    log_info "Updating CLAUDE.md with Hooks/MCP references..."

    if [[ "$DRY_RUN" == true ]]; then
        log_dry_run "Add Hooks/MCP sections to CLAUDE.md"
        return
    fi

    cat >> "$claude_md" << 'EOF'

## Hooks

This project uses Claude Code hooks for automated quality control.
See `.claude/hooks/` for available automation scripts.

## MCP Integration

This project is configured with MCP servers for extended capabilities.
See `.mcp.json` for configuration.

Use "use context7" in prompts for up-to-date library documentation.
EOF

    log_success "CLAUDE.md updated"
}

# Write version file
write_version() {
    local target="$1"

    if [[ "$DRY_RUN" == true ]]; then
        log_dry_run "Write version $CURRENT_VERSION to $VERSION_FILE"
        return
    fi

    echo "$CURRENT_VERSION" > "$target/$VERSION_FILE"
    log_success "Version file updated: $CURRENT_VERSION"
}

# Main migration
migrate() {
    local target="$TARGET_DIR"

    echo "========================================"
    echo "  Claude-Craft Project Migration v$CURRENT_VERSION"
    echo "========================================"
    echo ""
    echo "Target: $target"
    echo "Language: $LANG"
    echo "Dry-run: $DRY_RUN"
    echo ""

    # Validate target
    if [[ ! -d "$target" ]]; then
        log_error "Directory not found: $target"
        exit 1
    fi

    # Check if claude-craft project
    if ! is_claude_craft_project "$target"; then
        log_error "Not a claude-craft project (no .claude directory found)"
        exit 1
    fi

    # Detect current version
    local current_version=$(detect_version "$target")
    log_info "Detected version: $current_version"

    if [[ "$current_version" == "$CURRENT_VERSION" ]]; then
        log_success "Project is already at version $CURRENT_VERSION"
        exit 0
    fi

    # Create backup
    if [[ "$BACKUP" == true ]]; then
        create_backup "$target"
    fi

    echo ""
    log_info "Starting migration..."
    echo ""

    # Run migrations
    migrate_rules_to_skills "$target"
    add_hooks "$target"
    add_mcp "$target"
    update_settings "$target"
    update_claude_md "$target"
    write_version "$target"

    echo ""
    if [[ "$DRY_RUN" == true ]]; then
        echo "========================================"
        log_warning "DRY-RUN complete - no changes were made"
        echo "========================================"
    else
        echo "========================================"
        log_success "Migration complete!"
        echo "========================================"
        echo ""
        echo "Next steps:"
        echo "  1. Review .claude/hooks/ and customize scripts"
        echo "  2. Review .mcp.json and add your API tokens"
        echo "  3. Add hooks to .claude/settings.json"
        echo ""
    fi
}

# Entry point
parse_args "$@"
migrate
