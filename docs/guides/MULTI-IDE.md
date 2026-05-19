# Multi-IDE Export Guide

Export Claude Craft to **Cursor** and **Windsurf** IDEs with a single command.

---

## Overview

Claude Craft is built for **Claude Code**, but its principles work in any AI-powered IDE. This guide shows how to export a condensed, single-file version compatible with:

- **Cursor IDE** (`.cursorrules`)
- **Windsurf IDE** (`.windsurfrules`)

---

## Quick Start

```bash
# Export to both IDEs
./scripts/export-multi-ide.sh
```

**Output:**
- `bundles/cursor/.cursorrules` — Ready for Cursor
- `bundles/windsurf/.windsurfrules` — Ready for Windsurf

---

## What Gets Exported

The export script combines:

1. **CLAUDE.md** — Core framework (technologies, commands, agents, BMAD v6)
2. **INDEX.md** — Condensed quick reference (architecture, SOLID, testing, security)
3. **Key rules (condensed):**
   - SOLID principles
   - KISS / DRY / YAGNI
   - Testing (TDD/BDD)
   - Security (OWASP 2025)
   - Git Workflow (Conventional Commits)

Total size: **~200-250 lines** (vs. full Claude Craft 10,000+ lines)

---

## Installation

### Cursor IDE

1. Run export:
   ```bash
   ./scripts/export-multi-ide.sh
   ```

2. Copy to your project:
   ```bash
   cp bundles/cursor/.cursorrules /path/to/your/project/.cursorrules
   ```

3. Restart Cursor or reload the window.

4. Cursor's AI will now follow Claude Craft principles.

### Windsurf IDE

1. Run export:
   ```bash
   ./scripts/export-multi-ide.sh
   ```

2. Copy to your project:
   ```bash
   cp bundles/windsurf/.windsurfrules /path/to/your/project/.windsurfrules
   ```

3. Restart Windsurf or reload the window.

4. Windsurf's AI will now follow Claude Craft principles.

---

## Skill Portability Matrix

Not all Claude Craft skill features are supported on every surface. This matrix shows what works where:

| Skill type | Claude Code | Codex CLI | Gemini CLI | VS Code Ext | Cursor / Windsurf |
|------------|:-----------:|:---------:|:----------:|:-----------:|:-----------------:|
| SKILL.md slim (rules only) | ✅ natif | ✅ via bundle | ✅ via bundle | ✅ | ✅ |
| `context: fork` (isolated context) | ✅ | ❌ non supporté | ❌ non supporté | ✅ | ❌ |
| `disable-model-invocation` | ✅ | ❌ ignoré | ❌ ignoré | ✅ | ❌ |
| Slash commands (`/skill:*`) | ✅ natif | ❌ | ❌ | ❌ | ❌ |
| Sub-agents (`@agent`) | ✅ | ❌ | ❌ | ❌ | ❌ |
| BMAD v6 full workflow | ✅ | Principes seulement | Principes seulement | Partiel | Principes seulement |
| QA Recette (Chrome automation) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ralph Wiggum (AI loop) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Hook system (pre/post tool) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Token optimization (RTK) | ✅ | ❌ | ❌ | ❌ | ❌ |

**Légende :** ✅ = fully supported | ⚠️ = partial / manual adaptation needed | ❌ = not supported

**Recommendation:** For full features, use Claude Craft with **Claude Code**.

---

## Differences vs. Claude Code

| Feature | Claude Code | Cursor / Windsurf |
|---------|-------------|-------------------|
| **Rules** | Full 27 rules | Condensed 5 key rules |
| **Skills** | 67+ skills | Skills documented (manual copy) |
| **Commands** | 211 commands | Not available (native IDE commands) |
| **Agents** | 72 agents | Not available |
| **BMAD v6** | Full workflow | Principles documented |
| **QA Recette** | Automated testing | Not available |
| **Ralph Wiggum** | AI loop | Not available |

---

## Customization

### Add Project-Specific Rules

Edit the exported file and add your rules at the end:

```markdown
## Project-Specific Rules

- Always use PostgreSQL (not MySQL)
- API prefix: `/api/v2/`
- Authentication: OAuth2 only
```

### Include More Rules

Edit `scripts/export-multi-ide.sh` and add more rules:

```bash
# Add context management
echo "### Context Management" >> "$CURSOR_OUTPUT"
grep -A 20 "^## Principes" "$PROJECT_ROOT/.claude/rules/12-context-management.md" | head -20 >> "$CURSOR_OUTPUT"
```

---

## File Formats

### .cursorrules (Cursor IDE)

Markdown file loaded automatically by Cursor. Supports:
- Headers (`#`, `##`, `###`)
- Lists (`-`, `1.`)
- Code blocks (` ``` `)
- Tables

### .windsurfrules (Windsurf IDE)

Markdown file loaded automatically by Windsurf. Same format as Cursor.

---

## Troubleshooting

### Rules Not Applied

1. Verify file is in project root
2. Restart IDE
3. Check IDE settings for AI rules location

### File Too Large

If the IDE complains about file size:

1. Edit `scripts/export-multi-ide.sh`
2. Remove less critical sections (e.g., full INDEX.md)
3. Re-export

### Conflicts with Existing Rules

If you have existing `.cursorrules` or `.windsurfrules`:

1. Backup existing file:
   ```bash
   cp .cursorrules .cursorrules.backup
   ```

2. Merge manually or replace

---

## Updating

When Claude Craft updates:

```bash
# Pull latest
git pull origin main

# Re-export
./scripts/export-multi-ide.sh

# Copy to your project
cp bundles/cursor/.cursorrules /path/to/your/project/
```

---

## Attribution

Exported files include attribution to **The Bearded CTO / Claude Craft**.

**License:** MIT  
**Repository:** https://github.com/TheBeardedCTO/claude-craft

---

**Last updated:** 2026-04-17  
**Version:** 1.0.0
