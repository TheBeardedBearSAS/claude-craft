# Skills Publishing Guide

How to create, validate, and distribute Claude Code skills from Claude-Craft.

---

## Overview

Claude Code skills extend Claude's capabilities with reusable instructions, guidelines, and workflows. A skill is a directory containing a `SKILL.md` file (with YAML frontmatter and instructions) and optional supporting files like `REFERENCE.md`, templates, or scripts.

Claude Code skills follow the [Agent Skills](https://agentskills.io) open standard. Skills can be invoked explicitly via `/skill-name` or loaded automatically by Claude when the description matches the current task.

### How Skills Work

1. **Description-based discovery** -- Claude reads skill descriptions to decide when to load them automatically
2. **Slash command invocation** -- Users type `/skill-name` to invoke directly
3. **Context injection** -- When active, the skill's content is added to Claude's context
4. **Supporting files** -- `REFERENCE.md` and other files provide detailed content loaded on demand

---

## Skill Format

### Directory Structure

```
skill-name/
  SKILL.md           # Required -- frontmatter + brief instructions
  REFERENCE.md       # Recommended -- detailed content (loaded on demand)
  README.md          # Recommended for standalone distribution
```

### SKILL.md Structure

```yaml
---
name: skill-name
description: What this skill does. Use when [trigger conditions].
triggers:
  files: ["*.py", "**/tests/**"]
  keywords: ["keyword1", "keyword2"]
auto_suggest: true
---

# Skill Title

Brief description of what this skill provides.

See @REFERENCE.md for detailed documentation.

## Quick Reference

- Key point 1
- Key point 2
- Key point 3
```

### Frontmatter Fields

#### Claude-Craft Convention Fields

These fields are used by Claude-Craft for skill organization and auto-suggestion:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier (lowercase, hyphens). Becomes the `/slash-command` |
| `description` | Yes | What the skill does and when to use it. Claude uses this for auto-discovery |
| `triggers.files` | Yes | Glob patterns for file types that trigger this skill |
| `triggers.keywords` | Yes | Keywords that trigger this skill |
| `auto_suggest` | Yes | Whether Claude can auto-load this skill (`true`/`false`) |

#### Official Claude Code Fields

These additional fields are supported by the Claude Code runtime:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Display name. If omitted, uses directory name. Max 64 chars |
| `description` | Recommended | What the skill does. If omitted, uses first paragraph of content |
| `argument-hint` | No | Hint for autocomplete (e.g., `[issue-number]`) |
| `disable-model-invocation` | No | Set `true` to prevent auto-loading. Default: `false` |
| `user-invocable` | No | Set `false` to hide from `/` menu. Default: `true` |
| `allowed-tools` | No | Tools Claude can use without asking when skill is active |
| `model` | No | Model to use when skill is active |
| `context` | No | Set to `fork` to run in a subagent |
| `agent` | No | Subagent type when `context: fork` is set |

### REFERENCE.md

The detailed reference document loaded on demand. Keep `SKILL.md` under 500 lines and move comprehensive content to `REFERENCE.md`.

Reference it from SKILL.md:

```markdown
See @REFERENCE.md for detailed documentation.
```

---

## Publishing Checklist

Before sharing a skill, verify the following:

### Content Quality

- [ ] `SKILL.md` has valid YAML frontmatter with `name` and `description`
- [ ] `SKILL.md` has a clear Quick Reference section
- [ ] `REFERENCE.md` has comprehensive documentation
- [ ] Description is in English for broad reach
- [ ] Content is well-structured with headers, examples, and checklists
- [ ] No spelling or grammar errors

### Portability

- [ ] No project-specific file paths or references
- [ ] No references to internal tools or infrastructure
- [ ] Technology-agnostic (for universal skills) or clearly scoped
- [ ] Triggers are relevant and not too broad
- [ ] Examples use pseudocode or clearly labeled language-specific code

### Metadata

- [ ] `name` is lowercase with hyphens, max 64 characters
- [ ] `description` clearly states what the skill does AND when to use it
- [ ] `triggers.files` covers relevant file patterns
- [ ] `triggers.keywords` covers common terms users would say
- [ ] `auto_suggest` is set appropriately

### Distribution Files

- [ ] `README.md` included with installation instructions
- [ ] Attribution to Claude-Craft included
- [ ] License information included

---

## Distribution Methods

### 1. Project-Level (Committed to Repo)

The simplest approach. Commit skills to `.claude/skills/` in your project repository.

```
your-project/
  .claude/
    skills/
      solid-principles/
        SKILL.md
        REFERENCE.md
```

**Pros:** Version-controlled, team-shared, no extra tooling.
**Cons:** Must copy to each project manually.

### 2. Personal Skills (Global)

Install skills to `~/.claude/skills/` for availability across all projects.

```bash
cp -r solid-principles/ ~/.claude/skills/solid-principles/
```

**Pros:** Available everywhere, no per-project setup.
**Cons:** Not version-controlled, not shared with team.

### 3. Git Repository

Share skills via a Git repository. Users clone or copy individual skill directories.

```bash
# Clone the full framework
git clone https://github.com/TheBeardedBearSAS/claude-craft.git

# Copy specific skills
cp -r claude-craft/.claude/skills/solid-principles/ your-project/.claude/skills/
```

**Pros:** Version-controlled, easy to update, community contributions.
**Cons:** Requires manual copy to target projects.

### 4. npm Package (via Claude-Craft installer)

Claude-Craft distributes skills as part of its npm package:

```bash
npx @the-bearded-bear/claude-craft install . --tech=react --lang=en
```

This installs the full framework including all universal and tech-specific skills.

**Pros:** One-command install, includes all skills, proper versioning.
**Cons:** Installs the full framework, not individual skills.

### 5. Claude Code Plugins

Skills can be packaged as Claude Code plugins for broader distribution:

```
my-plugin/
  plugin.json
  skills/
    solid-principles/
      SKILL.md
      REFERENCE.md
```

Plugin skills use a `plugin-name:skill-name` namespace to avoid conflicts.

**Pros:** Official distribution mechanism, namespace isolation.
**Cons:** Requires plugin packaging.

### 6. Managed Settings (Enterprise)

For organizations, skills can be deployed enterprise-wide through Claude Code managed settings.

**Pros:** Centralized management, enforced across all users.
**Cons:** Requires enterprise Claude Code setup.

---

## Attribution

When distributing skills from Claude-Craft, include attribution:

### In README.md

```markdown
Part of [Claude-Craft](https://github.com/TheBeardedBearSAS/claude-craft) --
AI-assisted development framework for Claude Code.
```

### In SKILL.md (optional)

You may add a comment in the SKILL.md frontmatter or content:

```markdown
> From [Claude-Craft](https://github.com/TheBeardedBearSAS/claude-craft)
```

### License

All Claude-Craft skills are distributed under the MIT license. See the main repository for the full license text.

---

## Pilot Skills

These 4 universal skills are prepared for standalone distribution:

### solid-principles

| Field | Value |
|-------|-------|
| **Path** | `.claude/skills/solid-principles/` |
| **Scope** | Universal (any OOP language) |
| **Content** | SRP, OCP, LSP, ISP, DIP with examples and checklists |
| **Files** | `SKILL.md`, `REFERENCE.md`, `README.md` |

### testing

| Field | Value |
|-------|-------|
| **Path** | `.claude/skills/testing/` |
| **Scope** | Universal (any testing framework) |
| **Content** | TDD, BDD, test pyramid, AAA pattern, anti-patterns |
| **Files** | `SKILL.md`, `REFERENCE.md`, `README.md` |

### security

| Field | Value |
|-------|-------|
| **Path** | `.claude/skills/security/` |
| **Scope** | Universal (any technology stack) |
| **Content** | OWASP Top 10, auth, validation, encryption, headers |
| **Files** | `SKILL.md`, `REFERENCE.md`, `README.md` |

### git-workflow

| Field | Value |
|-------|-------|
| **Path** | `.claude/skills/git-workflow/` |
| **Scope** | Universal (any Git-based project) |
| **Content** | GitHub Flow, conventional commits, branching, code review |
| **Files** | `SKILL.md`, `REFERENCE.md`, `README.md` |

---

## Creating New Skills

### Step-by-Step

1. Create a directory under `.claude/skills/`:
   ```bash
   mkdir -p .claude/skills/my-skill
   ```

2. Write `SKILL.md` with frontmatter and quick reference:
   ```yaml
   ---
   name: my-skill
   description: What it does. Use when [conditions].
   triggers:
     files: ["relevant-patterns"]
     keywords: ["relevant", "keywords"]
   auto_suggest: true
   ---

   # My Skill

   See @REFERENCE.md for detailed documentation.

   ## Quick Reference
   - Key point 1
   - Key point 2
   ```

3. Write `REFERENCE.md` with comprehensive content

4. Add `README.md` for standalone distribution

5. Run the publishing checklist above

### Guidelines

- Keep `SKILL.md` under 500 lines (move details to `REFERENCE.md`)
- Write descriptions that match how users naturally phrase requests
- Include trigger keywords that cover synonyms and related terms
- Use pseudocode examples for universal skills
- Add checklists for actionable validation

---

## Resources

- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Agent Skills Open Standard](https://agentskills.io)
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
- [Claude-Craft Repository](https://github.com/TheBeardedBearSAS/claude-craft)
