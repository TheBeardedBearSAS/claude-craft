#!/usr/bin/env bash
# sync-docs.sh — Copy and transform docs/*.md into website/ for VitePress
# Source of truth: docs/ directory. This script is idempotent.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBSITE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$WEBSITE_DIR/.." && pwd)"
DOCS_DIR="$PROJECT_ROOT/docs"

# --- Helpers ---

# Add frontmatter to a file if not already present
add_frontmatter() {
  local file="$1"
  local title="$2"
  local desc="${3:-}"

  if head -1 "$file" | grep -q '^---$'; then
    return  # already has frontmatter
  fi

  local tmp
  tmp=$(mktemp)
  {
    echo "---"
    echo "title: \"$title\""
    [ -n "$desc" ] && echo "description: \"$desc\""
    echo "---"
    echo ""
    cat "$file"
  } > "$tmp"
  mv "$tmp" "$file"
}

# Copy a doc file, deriving title from first H1 or filename
copy_doc() {
  local src="$1"
  local dest="$2"
  local title="${3:-}"
  local desc="${4:-}"

  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"

  # Derive title from first H1 if not provided
  if [ -z "$title" ]; then
    title=$(grep -m1 '^# ' "$src" | sed 's/^# //' || basename "$src" .md)
  fi

  add_frontmatter "$dest" "$title" "$desc"
}

# Rewrite internal links: (SOMETHING.md) -> (/en/path)
rewrite_links_in_dir() {
  local dir="$1"  # en, fr, etc.
  local base_dir="$2"  # full path to locale dir

  find "$base_dir" -name '*.md' -type f -print0 | while IFS= read -r -d '' file; do
    sed -i \
      -e "s|(\(\.\./\)*QUICKSTART\.md)|(/$dir/getting-started/quickstart)|g" \
      -e "s|(\(\.\./\)*QUICKSTART)|(/$dir/getting-started/quickstart)|g" \
      -e "s|(\(\.\./\)*PREREQUISITES\.md)|(/$dir/getting-started/prerequisites)|g" \
      -e "s|(\(\.\./\)*PREREQUISITES)|(/$dir/getting-started/prerequisites)|g" \
      -e "s|(\(\.\./\)*INSTALLATION\.md)|(/$dir/getting-started/installation)|g" \
      -e "s|(\(\.\./\)*INSTALLATION)|(/$dir/getting-started/installation)|g" \
      -e "s|(\(\.\./\)*CONFIGURATION\.md)|(/$dir/getting-started/configuration)|g" \
      -e "s|(\(\.\./\)*CONFIGURATION)|(/$dir/getting-started/configuration)|g" \
      -e "s|(\(\.\./\)*CLI-REFERENCE\.md)|(/$dir/reference/cli)|g" \
      -e "s|(\(\.\./\)*CLI-REFERENCE)|(/$dir/reference/cli)|g" \
      -e "s|(\(\.\./\)*COMMANDS-FULL-REFERENCE\.md)|(/$dir/reference/commands-full)|g" \
      -e "s|(\(\.\./\)*COMMANDS-FULL-REFERENCE)|(/$dir/reference/commands-full)|g" \
      -e "s|(\(\.\./\)*COMMANDS\.md)|(/$dir/reference/commands)|g" \
      -e "s|(\(\.\./\)*COMMANDS)|(/$dir/reference/commands)|g" \
      -e "s|(\(\.\./\)*AGENTS-FULL-REFERENCE\.md)|(/$dir/reference/agents-full)|g" \
      -e "s|(\(\.\./\)*AGENTS-FULL-REFERENCE)|(/$dir/reference/agents-full)|g" \
      -e "s|(\(\.\./\)*AGENTS\.md)|(/$dir/reference/agents)|g" \
      -e "s|(\(\.\./\)*AGENTS)|(/$dir/reference/agents)|g" \
      -e "s|(\(\.\./\)*SKILLS\.md)|(/$dir/reference/skills)|g" \
      -e "s|(\(\.\./\)*SKILLS)|(/$dir/reference/skills)|g" \
      -e "s|(\(\.\./\)*TECHNOLOGIES\.md)|(/$dir/reference/technologies)|g" \
      -e "s|(\(\.\./\)*TECHNOLOGIES)|(/$dir/reference/technologies)|g" \
      -e "s|(\(\.\./\)*MAKEFILE-REFERENCE\.md)|(/$dir/reference/makefile)|g" \
      -e "s|(\(\.\./\)*MAKEFILE-REFERENCE)|(/$dir/reference/makefile)|g" \
      -e "s|(\(\.\./\)*SCRIPTS-REFERENCE\.md)|(/$dir/reference/scripts)|g" \
      -e "s|(\(\.\./\)*SCRIPTS-REFERENCE)|(/$dir/reference/scripts)|g" \
      -e "s|(\(\.\./\)*HOOKS\.md)|(/$dir/reference/hooks)|g" \
      -e "s|(\(\.\./\)*HOOKS)|(/$dir/reference/hooks)|g" \
      -e "s|(\(\.\./\)*MCP\.md)|(/$dir/reference/mcp)|g" \
      -e "s|(\(\.\./\)*MCP)|(/$dir/reference/mcp)|g" \
      -e "s|(\(\.\./\)*ARCHITECTURE\.md)|(/$dir/architecture)|g" \
      -e "s|(\(\.\./\)*ARCHITECTURE)|(/$dir/architecture)|g" \
      -e "s|(\(\.\./\)*FAQ\.md)|(/$dir/faq)|g" \
      -e "s|(\(\.\./\)*FAQ)|(/$dir/faq)|g" \
      -e "s|(\(\.\./\)*TROUBLESHOOTING\.md)|(/$dir/troubleshooting)|g" \
      -e "s|(\(\.\./\)*TROUBLESHOOTING)|(/$dir/troubleshooting)|g" \
      -e "s|(\(\.\./\)*MIGRATION\.md)|(/$dir/migration/)|g" \
      -e "s|(\(\.\./\)*MIGRATION-v4\.md)|(/$dir/migration/v4)|g" \
      -e "s|(\(\.\./\)*MIGRATION-v6\.md)|(/$dir/migration/v6)|g" \
      -e "s|(\(\.\./\)*MIGRATION-v7\.md)|(/$dir/migration/v7)|g" \
      -e "s|(\(\.\./\)*BMAD-PRACTICAL-GUIDE\.md)|(/en/frameworks/bmad-guide)|g" \
      -e "s|(\(\.\./\)*BMAD-PRACTICAL-GUIDE)|(/en/frameworks/bmad-guide)|g" \
      -e "s|(\(\.\./\)*RALPH-GUIDE\.md)|(/en/frameworks/ralph-guide)|g" \
      -e "s|(\(\.\./\)*RALPH-GUIDE)|(/en/frameworks/ralph-guide)|g" \
      -e "s|(\(\.\./\)*AGENT-TEAMS-GUIDE\.md)|(/en/frameworks/agent-teams)|g" \
      -e "s|(\(\.\./\)*AGENT-TEAMS-GUIDE)|(/en/frameworks/agent-teams)|g" \
      -e "s|(\(\.\./\)*CONTRIBUTING\.md)|(/en/contributing)|g" \
      -e "s|(\(\.\./\)*CONTRIBUTING)|(/en/contributing)|g" \
      -e "s|(\(\.\./\)*CHANGELOG\.md)|(/en/changelog)|g" \
      -e "s|(\(\.\./\)*CHANGELOG)|(/en/changelog)|g" \
      -e "s|(/docs/QUICKSTART)|(/$dir/getting-started/quickstart)|g" \
      -e "s|(/docs/PREREQUISITES)|(/$dir/getting-started/prerequisites)|g" \
      -e "s|(/docs/INSTALLATION)|(/$dir/getting-started/installation)|g" \
      -e "s|(/docs/CONFIGURATION)|(/$dir/getting-started/configuration)|g" \
      -e "s|(/docs/CLI-REFERENCE)|(/$dir/reference/cli)|g" \
      -e "s|(/docs/COMMANDS)|(/$dir/reference/commands)|g" \
      -e "s|(/docs/AGENTS)|(/$dir/reference/agents)|g" \
      -e "s|(/docs/SKILLS)|(/$dir/reference/skills)|g" \
      -e "s|(/docs/HOOKS)|(/$dir/reference/hooks)|g" \
      -e "s|(/docs/MCP)|(/$dir/reference/mcp)|g" \
      -e "s|(/docs/FAQ)|(/$dir/faq)|g" \
      -e "s|(/docs/TROUBLESHOOTING)|(/$dir/troubleshooting)|g" \
      "$file"
  done
}

echo "=== Syncing docs to VitePress ==="

# --- English docs (main) ---
echo "  Syncing English docs..."

copy_doc "$DOCS_DIR/QUICKSTART.md"              "$WEBSITE_DIR/en/getting-started/quickstart.md" "Quick Start" "Get started with Claude Craft in 5 minutes"
copy_doc "$DOCS_DIR/PREREQUISITES.md"            "$WEBSITE_DIR/en/getting-started/prerequisites.md" "Prerequisites" "Required dependencies for Claude Craft"
copy_doc "$DOCS_DIR/INSTALLATION.md"             "$WEBSITE_DIR/en/getting-started/installation.md" "Installation" "Install Claude Craft in your project"
copy_doc "$DOCS_DIR/CONFIGURATION.md"            "$WEBSITE_DIR/en/getting-started/configuration.md" "Configuration" "Configure Claude Craft for your project"

copy_doc "$DOCS_DIR/CLI-REFERENCE.md"            "$WEBSITE_DIR/en/reference/cli.md" "CLI Reference" "Full CLI documentation"
copy_doc "$DOCS_DIR/COMMANDS.md"                 "$WEBSITE_DIR/en/reference/commands.md" "Commands" "All slash commands"
copy_doc "$DOCS_DIR/COMMANDS-FULL-REFERENCE.md"  "$WEBSITE_DIR/en/reference/commands-full.md" "Commands (Full Reference)" "Complete command documentation"
copy_doc "$DOCS_DIR/AGENTS.md"                   "$WEBSITE_DIR/en/reference/agents.md" "Agents" "All AI agents"
copy_doc "$DOCS_DIR/AGENTS-FULL-REFERENCE.md"    "$WEBSITE_DIR/en/reference/agents-full.md" "Agents (Full Reference)" "Complete agent documentation"
copy_doc "$DOCS_DIR/SKILLS.md"                   "$WEBSITE_DIR/en/reference/skills.md" "Skills" "Best practices skills"
copy_doc "$DOCS_DIR/TECHNOLOGIES.md"             "$WEBSITE_DIR/en/reference/technologies.md" "Technologies" "Supported technology stacks"
copy_doc "$DOCS_DIR/MAKEFILE-REFERENCE.md"       "$WEBSITE_DIR/en/reference/makefile.md" "Makefile Reference" "Makefile targets and usage"
copy_doc "$DOCS_DIR/SCRIPTS-REFERENCE.md"        "$WEBSITE_DIR/en/reference/scripts.md" "Scripts Reference" "Shell scripts documentation"
copy_doc "$DOCS_DIR/HOOKS.md"                    "$WEBSITE_DIR/en/reference/hooks.md" "Hooks" "Claude Code hooks"
copy_doc "$DOCS_DIR/MCP.md"                      "$WEBSITE_DIR/en/reference/mcp.md" "MCP" "Model Context Protocol"

copy_doc "$DOCS_DIR/BMAD-PRACTICAL-GUIDE.md"     "$WEBSITE_DIR/en/frameworks/bmad-guide.md" "BMAD Practical Guide" "BMAD v6 framework guide"
copy_doc "$DOCS_DIR/RALPH-GUIDE.md"              "$WEBSITE_DIR/en/frameworks/ralph-guide.md" "Ralph Wiggum Guide" "Continuous AI loop guide"
copy_doc "$DOCS_DIR/AGENT-TEAMS-GUIDE.md"        "$WEBSITE_DIR/en/frameworks/agent-teams.md" "Agent Teams" "Multi-agent coordination guide"

copy_doc "$DOCS_DIR/ARCHITECTURE.md"             "$WEBSITE_DIR/en/architecture.md" "Architecture" "Project architecture"
copy_doc "$DOCS_DIR/FAQ.md"                      "$WEBSITE_DIR/en/faq.md" "FAQ" "Frequently asked questions"
copy_doc "$DOCS_DIR/TROUBLESHOOTING.md"          "$WEBSITE_DIR/en/troubleshooting.md" "Troubleshooting" "Problem solving guide"

copy_doc "$DOCS_DIR/MIGRATION.md"                "$WEBSITE_DIR/en/migration/index.md" "Migration" "Migration guides"
copy_doc "$DOCS_DIR/MIGRATION-v4.md"             "$WEBSITE_DIR/en/migration/v4.md" "v4 Migration" "Migrate to v4"
copy_doc "$DOCS_DIR/MIGRATION-v6.md"             "$WEBSITE_DIR/en/migration/v6.md" "v6 Migration" "Migrate to v6"
copy_doc "$DOCS_DIR/MIGRATION-v7.md"             "$WEBSITE_DIR/en/migration/v7.md" "v7 Migration" "Migrate to v7"

copy_doc "$PROJECT_ROOT/CHANGELOG.md"            "$WEBSITE_DIR/en/changelog.md" "Changelog" "Release history"
copy_doc "$PROJECT_ROOT/CONTRIBUTING.md"         "$WEBSITE_DIR/en/contributing.md" "Contributing" "How to contribute"

# English guides
echo "  Syncing English guides..."
for guide in "$DOCS_DIR/guides/en/"*.md; do
  fname=$(basename "$guide")
  copy_doc "$guide" "$WEBSITE_DIR/en/guides/$fname"
done

# Rewrite links in all English files
echo "  Rewriting English links..."
rewrite_links_in_dir "en" "$WEBSITE_DIR/en"

# --- French ---
echo "  Syncing French docs..."
[ -f "$DOCS_DIR/i18n/fr/QUICKSTART.md" ]      && copy_doc "$DOCS_DIR/i18n/fr/QUICKSTART.md"      "$WEBSITE_DIR/fr/getting-started/quickstart.md" "Démarrage Rapide"
[ -f "$DOCS_DIR/i18n/fr/PREREQUISITES.md" ]    && copy_doc "$DOCS_DIR/i18n/fr/PREREQUISITES.md"    "$WEBSITE_DIR/fr/getting-started/prerequisites.md" "Prérequis"
[ -f "$DOCS_DIR/i18n/fr/CLI-REFERENCE.md" ]    && copy_doc "$DOCS_DIR/i18n/fr/CLI-REFERENCE.md"    "$WEBSITE_DIR/fr/reference/cli.md" "Référence CLI"
[ -f "$DOCS_DIR/i18n/fr/FAQ.md" ]              && copy_doc "$DOCS_DIR/i18n/fr/FAQ.md"              "$WEBSITE_DIR/fr/faq.md" "FAQ"
[ -f "$DOCS_DIR/i18n/fr/TROUBLESHOOTING.md" ]  && copy_doc "$DOCS_DIR/i18n/fr/TROUBLESHOOTING.md"  "$WEBSITE_DIR/fr/troubleshooting.md" "Dépannage"

for guide in "$DOCS_DIR/guides/fr/"*.md; do
  fname=$(basename "$guide")
  copy_doc "$guide" "$WEBSITE_DIR/fr/guides/$fname"
done

rewrite_links_in_dir "fr" "$WEBSITE_DIR/fr"

# --- Spanish ---
echo "  Syncing Spanish docs..."
[ -f "$DOCS_DIR/i18n/es/QUICKSTART.md" ]      && copy_doc "$DOCS_DIR/i18n/es/QUICKSTART.md"      "$WEBSITE_DIR/es/getting-started/quickstart.md" "Inicio Rápido"
[ -f "$DOCS_DIR/i18n/es/PREREQUISITES.md" ]    && copy_doc "$DOCS_DIR/i18n/es/PREREQUISITES.md"    "$WEBSITE_DIR/es/getting-started/prerequisites.md" "Requisitos"

for guide in "$DOCS_DIR/guides/es/"*.md; do
  fname=$(basename "$guide")
  copy_doc "$guide" "$WEBSITE_DIR/es/guides/$fname"
done

rewrite_links_in_dir "es" "$WEBSITE_DIR/es"

# --- German ---
echo "  Syncing German docs..."
[ -f "$DOCS_DIR/i18n/de/QUICKSTART.md" ]      && copy_doc "$DOCS_DIR/i18n/de/QUICKSTART.md"      "$WEBSITE_DIR/de/getting-started/quickstart.md" "Schnellstart"
[ -f "$DOCS_DIR/i18n/de/PREREQUISITES.md" ]    && copy_doc "$DOCS_DIR/i18n/de/PREREQUISITES.md"    "$WEBSITE_DIR/de/getting-started/prerequisites.md" "Voraussetzungen"

for guide in "$DOCS_DIR/guides/de/"*.md; do
  fname=$(basename "$guide")
  copy_doc "$guide" "$WEBSITE_DIR/de/guides/$fname"
done

rewrite_links_in_dir "de" "$WEBSITE_DIR/de"

# --- Portuguese ---
echo "  Syncing Portuguese docs..."
[ -f "$DOCS_DIR/i18n/pt/QUICKSTART.md" ]      && copy_doc "$DOCS_DIR/i18n/pt/QUICKSTART.md"      "$WEBSITE_DIR/pt/getting-started/quickstart.md" "Início Rápido"
[ -f "$DOCS_DIR/i18n/pt/PREREQUISITES.md" ]    && copy_doc "$DOCS_DIR/i18n/pt/PREREQUISITES.md"    "$WEBSITE_DIR/pt/getting-started/prerequisites.md" "Pré-requisitos"

for guide in "$DOCS_DIR/guides/pt/"*.md; do
  fname=$(basename "$guide")
  copy_doc "$guide" "$WEBSITE_DIR/pt/guides/$fname"
done

rewrite_links_in_dir "pt" "$WEBSITE_DIR/pt"

echo "=== Sync complete ==="
