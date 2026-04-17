#!/usr/bin/env bash
# Export Claude Craft to Cursor and Windsurf IDEs
# Combines CLAUDE.md + condensed rules + INDEX.md into single-file configs
# Usage: ./scripts/export-multi-ide.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BUNDLES_DIR="$PROJECT_ROOT/bundles"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Claude Craft Multi-IDE Export ===${NC}"
echo ""

# Create bundles directories
mkdir -p "$BUNDLES_DIR/cursor"
mkdir -p "$BUNDLES_DIR/windsurf"

# --- CURSOR EXPORT (.cursorrules) ---
echo -e "${GREEN}Exporting to Cursor (.cursorrules)...${NC}"

CURSOR_OUTPUT="$BUNDLES_DIR/cursor/.cursorrules"

cat > "$CURSOR_OUTPUT" << 'EOF'
# Claude Craft — AI-First TDD Framework for Cursor IDE
# Generated from https://github.com/TheBeardedCTO/claude-craft
# Version: 8.0.1 | Last updated: 2026-04-17

---

EOF

# Append CLAUDE.md
echo "## Core Framework" >> "$CURSOR_OUTPUT"
echo "" >> "$CURSOR_OUTPUT"
cat "$PROJECT_ROOT/.claude/CLAUDE.md" >> "$CURSOR_OUTPUT"
echo "" >> "$CURSOR_OUTPUT"

# Append INDEX.md (condensed rules)
echo "## Quick Reference Index" >> "$CURSOR_OUTPUT"
echo "" >> "$CURSOR_OUTPUT"
cat "$PROJECT_ROOT/.claude/INDEX.md" >> "$CURSOR_OUTPUT"
echo "" >> "$CURSOR_OUTPUT"

# Append key rules (condensed)
echo "## Essential Rules (Condensed)" >> "$CURSOR_OUTPUT"
echo "" >> "$CURSOR_OUTPUT"

# SOLID
echo "### SOLID Principles" >> "$CURSOR_OUTPUT"
grep -A 30 "^## The 5 Principles" "$PROJECT_ROOT/.claude/rules/04-solid-principles.md" | head -30 >> "$CURSOR_OUTPUT" || echo "SRP | OCP | LSP | ISP | DIP — See full rules in .claude/rules/04-solid-principles.md" >> "$CURSOR_OUTPUT"
echo "" >> "$CURSOR_OUTPUT"

# KISS/DRY/YAGNI
echo "### KISS, DRY, YAGNI" >> "$CURSOR_OUTPUT"
grep -A 15 "^## KISS" "$PROJECT_ROOT/.claude/rules/05-kiss-dry-yagni.md" | head -15 >> "$CURSOR_OUTPUT" || echo "Cognitive Complexity < 10 | Rule of 3 for DRY | YAGNI: only what's required NOW" >> "$CURSOR_OUTPUT"
echo "" >> "$CURSOR_OUTPUT"

# Testing
echo "### Testing" >> "$CURSOR_OUTPUT"
grep -A 20 "^## Fundamentals" "$PROJECT_ROOT/.claude/rules/07-testing.md" | head -20 >> "$CURSOR_OUTPUT" || echo "TDD: RED → GREEN → REFACTOR | Coverage >= 80% | Mutation testing" >> "$CURSOR_OUTPUT"
echo "" >> "$CURSOR_OUTPUT"

# Security
echo "### Security" >> "$CURSOR_OUTPUT"
grep -A 15 "^## OWASP Top 10:2025" "$PROJECT_ROOT/.claude/rules/11-security.md" | head -15 >> "$CURSOR_OUTPUT" || echo "OWASP Top 10:2025 | Argon2id | JWT EdDSA | Supply Chain Security" >> "$CURSOR_OUTPUT"
echo "" >> "$CURSOR_OUTPUT"

# Git Workflow
echo "### Git Workflow" >> "$CURSOR_OUTPUT"
grep -A 15 "^## Core Principles" "$PROJECT_ROOT/.claude/rules/09-git-workflow.md" | head -15 >> "$CURSOR_OUTPUT" || echo "Conventional Commits | GitHub Flow | Feature branches < 3 days" >> "$CURSOR_OUTPUT"
echo "" >> "$CURSOR_OUTPUT"

# Footer
cat >> "$CURSOR_OUTPUT" << 'EOF'

---

## Full Documentation

For complete documentation, visit: https://claude-craft.dev

For full rules and references:
- SOLID: .claude/rules/04-solid-principles.md
- KISS/DRY/YAGNI: .claude/rules/05-kiss-dry-yagni.md
- Testing: .claude/rules/07-testing.md
- Security: .claude/rules/11-security.md
- Git Workflow: .claude/rules/09-git-workflow.md
- Context Management: .claude/rules/12-context-management.md

**Attribution:** The Bearded CTO / Claude Craft
**License:** MIT
**Repository:** https://github.com/TheBeardedCTO/claude-craft
EOF

echo -e "  ${YELLOW}→${NC} Created: $CURSOR_OUTPUT"

# --- WINDSURF EXPORT (.windsurfrules) ---
echo -e "${GREEN}Exporting to Windsurf (.windsurfrules)...${NC}"

WINDSURF_OUTPUT="$BUNDLES_DIR/windsurf/.windsurfrules"

# Windsurf uses similar markdown format
cp "$CURSOR_OUTPUT" "$WINDSURF_OUTPUT"

# Update header for Windsurf
sed -i '1s/.*/# Claude Craft — AI-First TDD Framework for Windsurf IDE/' "$WINDSURF_OUTPUT"

echo -e "  ${YELLOW}→${NC} Created: $WINDSURF_OUTPUT"

# --- SUMMARY ---
echo ""
echo -e "${BLUE}=== Export Complete ===${NC}"
echo ""
echo -e "${GREEN}✓${NC} Cursor bundle:   bundles/cursor/.cursorrules"
echo -e "${GREEN}✓${NC} Windsurf bundle: bundles/windsurf/.windsurfrules"
echo ""
echo -e "${YELLOW}Usage:${NC}"
echo "  Cursor:   Copy bundles/cursor/.cursorrules to your project root"
echo "  Windsurf: Copy bundles/windsurf/.windsurfrules to your project root"
echo ""
echo -e "${BLUE}Note:${NC} These bundles are self-contained but condensed."
echo "      For full features, use Claude Craft with Claude Code."
