# Adding Claude-Craft to an Existing Project

This comprehensive tutorial guides you through adding Claude-Craft to a project that already has code. You'll learn how to safely install, make Claude understand your codebase, and push your first AI-assisted modifications.

**Time required:** ~20-30 minutes

---

## Table of Contents

1. [Before You Start](#1-before-you-start)
2. [Backup Your Project](#2-backup-your-project)
3. [Analyze Your Project Structure](#3-analyze-your-project-structure)
4. [Check for Conflicts](#4-check-for-conflicts)
5. [Choose Your Technology Stack](#5-choose-your-technology-stack)
6. [Install Claude-Craft](#6-install-claude-craft)
7. [Merge Configurations](#7-merge-configurations)
8. [Make Claude Understand Your Codebase](#8-make-claude-understand-your-codebase)
9. [Your First Modification](#9-your-first-modification)
10. [Team Onboarding](#10-team-onboarding)
11. [Migration from Other AI Tools](#11-migration-from-other-ai-tools)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Before You Start

### Important Warnings

> **Warning:** Installing Claude-Craft will create a `.claude/` directory in your project. If one already exists, you'll need to decide whether to merge, replace, or preserve it.

> **Warning:** Always create a backup branch before installation. This allows easy rollback if something goes wrong.

### Prerequisites Checklist

- [ ] Your project is tracked in Git
- [ ] You have committed all current changes
- [ ] You have write access to the project directory
- [ ] Node.js 20+ installed (for NPX method)
- [ ] Claude Code installed (recommended: v2.1.193, minimum: v2.1.97 — CVE-2025-59536 patched)

### When NOT to Install

Consider postponing installation if:
- You have uncommitted changes
- You're in the middle of a critical release
- The project has complex existing `.claude/` configuration
- Multiple team members are actively pushing changes

---

## 2. Backup Your Project

**Never skip this step.** Create a backup branch before installation.

### Create Backup Branch

```bash
# Navigate to your project
cd ~/your-existing-project

# Make sure everything is committed
git status
```

If you see uncommitted changes:
```bash
git add .
git commit -m "chore: save work before Claude-Craft installation"
```

Now create the backup:
```bash
# Create and stay on backup branch
git checkout -b backup/before-claude-craft

# Return to your main branch
git checkout main  # or 'master' or your default branch
```

### Verify Backup

```bash
# Confirm backup branch exists
git branch | grep backup
```

Expected output:
```
  backup/before-claude-craft
```

### Rollback Plan

If anything goes wrong, you can rollback:
```bash
# Discard all changes and return to backup
git checkout backup/before-claude-craft
git branch -D main
git checkout -b main
```

---

## 3. Analyze Your Project Structure

Before installing, understand what you already have.

### Check for Existing .claude Directory

```bash
# Check if .claude already exists
ls -la .claude/ 2>/dev/null || echo "No .claude directory found"
```

**If .claude exists:**
- Note what files are inside
- Decide: merge, replace, or preserve
- See [Section 7: Merge Configurations](#7-merge-configurations)

### Identify Your Project Structure

```bash
# List root directory
ls -la

# Show directory tree (first 2 levels)
find . -maxdepth 2 -type d | head -20
```

Take note of:
- Main source directories (`src/`, `app/`, `lib/`)
- Configuration files (`.env`, `config/`, `settings/`)
- Test directories (`tests/`, `test/`, `spec/`)
- Documentation (`docs/`, `README.md`)

### Check for Other AI Tool Configurations

```bash
# Check for Cursor rules
ls -la .cursorrules 2>/dev/null

# Check for GitHub Copilot instructions
ls -la .github/copilot-instructions.md 2>/dev/null

# Check for other Claude configs
ls -la CLAUDE.md 2>/dev/null
```

Note any existing configurations - you may want to migrate them (see [Section 11](#11-migration-from-other-ai-tools)).

---

## 4. Check for Conflicts

### Files That May Conflict

| File/Directory | Claude-Craft Creates | Your Project May Have |
|----------------|---------------------|----------------------|
| `.claude/` | Yes | Maybe |
| `.claude/CLAUDE.md` | Yes | Maybe |
| `.claude/rules/` | Yes | Maybe |
| `CLAUDE.md` (root) | No | Maybe |

### Decision Matrix

| Scenario | Recommendation |
|----------|----------------|
| No `.claude/` exists | Install normally |
| Empty `.claude/` exists | Install with `--force` |
| `.claude/` has custom rules | Use `--preserve-config` |
| Root `CLAUDE.md` exists | Keep it, it won't conflict |

---

## 5. Choose Your Technology Stack

Identify the primary technology of your project:

| Your Project Uses | Install Command |
|------------------|-----------------|
| C#/.NET | `--tech=csharp` |
| PHP/Symfony | `--tech=symfony` |
| PHP/Laravel | `--tech=laravel` |
| PHP (generic) | `--tech=php` |
| Dart/Flutter | `--tech=flutter` |
| Python/FastAPI/Django | `--tech=python` |
| JavaScript/React | `--tech=react` |
| JavaScript/React Native | `--tech=reactnative` |
| TypeScript/Angular | `--tech=angular` |
| TypeScript/Vue.js | `--tech=vuejs` |
| Multiple/Other | `--tech=common` |

**For monorepos:** Install to each subproject separately (see below).

---

## 6. Install Claude-Craft

### Standard Installation

**Method A: NPX (Recommended)**
```bash
cd ~/your-existing-project
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en
```

**Method B: Makefile**
```bash
cd ~/claude-craft
make install-symfony TARGET=~/your-existing-project RULES_LANG=en
```

### Preserving Existing Configuration

If you have existing `.claude/` files you want to keep:

```bash
# NPX with preserve flag
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en --preserve-config

# Makefile with preserve flag
make install-symfony TARGET=~/your-existing-project RULES_LANG=en OPTIONS="--preserve-config"
```

**What `--preserve-config` keeps:**
- `CLAUDE.md` (your project description)
- `rules/00-project-context.md` (your custom context)
- Any custom rules you've added

### Monorepo Installation

For projects with multiple apps:

```
my-monorepo/
├── frontend/    (React)
├── backend/     (Symfony)
└── mobile/      (Flutter)
```

Install to each directory:
```bash
# Install React to frontend
npx @the-bearded-bear/claude-craft install ./frontend --tech=react --lang=en

# Install Symfony to backend
npx @the-bearded-bear/claude-craft install ./backend --tech=symfony --lang=en

# Install Flutter to mobile
npx @the-bearded-bear/claude-craft install ./mobile --tech=flutter --lang=en
```

### Verify Installation

```bash
ls -la .claude/
```

Expected structure:
```
.claude/
├── CLAUDE.md
├── agents/
├── checklists/
├── commands/
├── rules/
└── templates/
```

---

## 7. Merge Configurations

If you had existing configurations, merge them now.

### Merging CLAUDE.md

If you had a custom `CLAUDE.md`:

1. Open both files:
   ```bash
   # Your old file (if backed up)
   cat .claude/CLAUDE.md.backup

   # New Claude-Craft file
   cat .claude/CLAUDE.md
   ```

2. Copy your custom sections into the new file
3. Keep the Claude-Craft structure, add your content

### Merging Custom Rules

If you had custom rules in `rules/`:

1. Claude-Craft rules are numbered `01-xx.md` through `12-xx.md`
2. Add your custom rules as `90-custom-rule.md`, `91-another-rule.md`
3. Higher numbers = lower priority, but still included

### Example Merge

```bash
# Rename your old custom rule
mv .claude/rules/my-custom-rules.md .claude/rules/90-project-custom-rules.md
```

---

## 8. Make Claude Understand Your Codebase

**This is the most important section.** A successful Claude-Craft setup isn't just about installing files—it's about making Claude truly understand your project.

### 8.1 Initial Codebase Exploration

Launch Claude Code in your project:

```bash
cd ~/your-existing-project
claude
```

Start with a broad exploration:

```
Explore this codebase and give me a comprehensive summary of:
1. The overall project structure
2. Main directories and their purposes
3. Key entry points
4. Configuration files you find
```

**Expected outcome:** Claude should describe your project structure accurately. If it gets things wrong, correct it—this helps Claude learn.

**Verify Claude's understanding:**
```
Based on what you found, what type of project is this?
What framework or technology stack is used?
```

### 8.2 Understanding Architecture

Ask Claude to identify architectural patterns:

```
Analyze the architecture of this project:
1. What architectural pattern does it follow? (MVC, Clean Architecture, etc.)
2. What are the main layers and their responsibilities?
3. How is the code organized into modules/domains?
4. What design patterns do you see being used?
```

**Verify with specific questions:**
```
Show me an example of how a request flows through the system,
from entry point to database and back.
```

If Claude's analysis is accurate, great! If not, correct it:
```
Actually, this project uses Clean Architecture with these layers:
- Domain (src/Domain/)
- Application (src/Application/)
- Infrastructure (src/Infrastructure/)
- Presentation (src/Controller/)
Please update your understanding.
```

### 8.3 Discovering Business Logic

Help Claude understand what your project actually does:

```
What are the main business domains or features in this codebase?
List the core entities and explain their relationships.
```

**Use specialized agents:**

```
@database-architect
Analyze the database schema in this project.
What are the main entities, their relationships, and any patterns you notice?
```

```
@api-designer
Review the API endpoints in this project.
What resources are exposed? What patterns are used?
```

### 8.4 Documenting Context

You have two options to configure the project context:

**Option A: Interactive Setup (Recommended)**

Use the built-in command to auto-detect your stack and answer targeted questions:

```bash
/common:setup-project-context
```

The command will analyze your existing codebase, detect technologies, and ask only for missing information.

**Option B: Manual Configuration**

Create or update the project context file manually:

```bash
nano .claude/references/<your-tech>/project-context.md
```

Fill in the template with what you've discovered:

```markdown
## Project Overview
- **Name**: [Your project name]
- **Description**: [What Claude learned + your additions]
- **Domain**: [e.g., E-commerce, Healthcare, FinTech]

## Architecture
- **Pattern**: [What Claude identified]
- **Layers**: [List them]
- **Key Directories**:
  - `src/Domain/` - Business logic and entities
  - `src/Application/` - Use cases and services
  - [etc.]

## Business Context
- **Main Entities**: [List core domain objects]
- **Key Workflows**: [Describe main user journeys]
- **External Integrations**: [APIs, services you connect to]

## Development Conventions
- **Testing**: [Your testing approach]
- **Code Style**: [Your standards]
- **Git Workflow**: [Your branching strategy]

## Important Notes for AI
- [Anything Claude should always remember]
- [Pitfalls to avoid]
- [Special considerations]
```

Save and verify Claude sees it:
```
Read the project context file and summarize what you understand
about this project now.
```

---

## 9. Your First Modification

Now let's make your first AI-assisted change and push it.

### 9.1 Choose a Simple Task

Good first tasks:
- [ ] Add a missing unit test
- [ ] Fix a small bug
- [ ] Add documentation to a function
- [ ] Refactor a method for clarity
- [ ] Add input validation

**Avoid for first task:**
- Large features
- Critical security changes
- Database migrations
- Breaking API changes

### 9.2 Let Claude Analyze

Ask Claude to analyze before making changes:

```
I want to [describe your task].

Before making any changes:
1. Analyze the relevant code
2. Explain your approach
3. List the files you'll modify
4. Describe the tests you'll add or update
```

**Review Claude's plan carefully.** Ask questions:
```
Why did you choose this approach?
Are there any risks with this change?
What tests will verify this works?
```

### 9.3 Implement the Change

Once you're satisfied with the plan:
```
Go ahead and implement this change following TDD:
1. First write/update the tests
2. Then implement the code
3. Run the tests to verify
```

### 9.4 Review and Commit

Before committing, run quality checks:

```
/common:pre-commit-check
```

Review all changes:
```bash
git diff
git status
```

If everything looks good:
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: [describe what you did]

- [bullet point of change]
- [another change]
- Added tests for [feature]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 9.5 Push Your Changes

```bash
# Push to remote
git push origin main
```

If your CI/CD runs, verify it passes:
```bash
# Check CI status (if using GitHub)
gh run list --limit 1
```

**Congratulations!** You've made your first AI-assisted modification.

---

## 10. Team Onboarding

Share Claude-Craft with your team.

### Commit the Configuration

```bash
# Add Claude-Craft files to git
git add .claude/

# Commit
git commit -m "feat: add Claude-Craft AI development configuration

- Added rules for [your tech stack]
- Configured project context
- Added agents and commands"

# Push
git push origin main
```

### Notify Your Team

Create a brief guide for teammates:

```markdown
## Using Claude-Craft in This Project

1. Install Claude Code: [link]
2. Pull latest changes: `git pull`
3. Launch in project: `cd project && claude`

### Quick Commands
- `/common:pre-commit-check` - Run before committing
- `@tdd-coach` - Get help with tests
- `@{tech}-reviewer` - Code review

### Project Context
Our AI assistant understands:
- [Architecture patterns we use]
- [Coding conventions]
- [Business domain]
```

### Team Demo

Consider running a short demo:
1. Show Claude exploring the codebase
2. Demonstrate a simple task
3. Show the pre-commit workflow
4. Answer questions

---

## 11. Migration from Other AI Tools

If you're using other AI coding tools, migrate their configurations.

### From Cursor Rules (.cursorrules)

```bash
# Check if you have Cursor rules
cat .cursorrules 2>/dev/null
```

Migration:
1. Open `.cursorrules`
2. Copy relevant rules
3. Add to `.claude/rules/90-migrated-cursor-rules.md`
4. Adapt format to Claude-Craft style

### From GitHub Copilot Instructions

```bash
# Check for Copilot instructions
cat .github/copilot-instructions.md 2>/dev/null
```

Migration:
1. Open the Copilot instructions
2. Extract coding guidelines
3. Add to project context or custom rules

### From Other Claude Configurations

If you have a root `CLAUDE.md`:
```bash
# Review existing config
cat CLAUDE.md 2>/dev/null
```

Migration:
1. Compare with new `.claude/CLAUDE.md`
2. Merge unique content
3. Keep root `CLAUDE.md` if it has project documentation
4. Remove if it's redundant with `.claude/`

### Migration Mapping Table

| Old Location | Claude-Craft Location |
|--------------|----------------------|
| `.cursorrules` | `.claude/rules/90-custom.md` |
| `.github/copilot-instructions.md` | `.claude/references/<your-tech>/project-context.md` |
| `CLAUDE.md` (root) | `.claude/CLAUDE.md` |
| Custom prompts | `.claude/commands/custom/` |

---

## 12. Troubleshooting

### Installation Issues

**Problem:** "Directory already exists" error
```bash
# Solution: Use force flag
npx @the-bearded-bear/claude-craft install . --tech=symfony --force
```

**Problem:** "Permission denied"
```bash
# Solution: Check ownership
ls -la .claude/
# Fix permissions
chmod -R 755 .claude/
```

**Problem:** "CLAUDE.md not found" after install
```bash
# Solution: Re-run installation
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en
```

### Claude Understanding Issues

**Problem:** Claude doesn't understand my project structure

Solution: Be explicit in your context file and during conversation:
```
This project uses [specific pattern]. The main source code is in [directory].
When I ask about [domain term], I mean [explanation].
```

**Problem:** Claude suggests wrong patterns

Solution: Correct and reinforce:
```
We don't use [pattern] in this project. We use [correct pattern] because [reason].
Please remember this for future suggestions.
```

**Problem:** Claude forgets context between sessions

Solution: Ensure `00-project-context.md` is comprehensive. Key information should be in files, not just conversation.

### Rollback

If you need to undo the installation:

```bash
# Remove Claude-Craft files
rm -rf .claude/

# Restore from backup branch
git checkout backup/before-claude-craft -- .

# Or hard reset
git checkout backup/before-claude-craft
```

---

## v8.7.1 Migration Notes

If you are upgrading an existing Claude-Craft installation to v8.7.1:

### New Features to Configure

1. **Token Optimization (RTK):** Run `/common:setup-rtk` in Claude Code to configure 55-65% token savings
2. **Hook Templates:** New templates available in `.claude/templates/hooks/` for output filtering, context preservation, and re-injection
3. **Managed Settings:** Use `.claude/managed-settings.d/` for modular team configuration
4. **Agent Frontmatter:** Add `effort`, `maxTurns`, `disallowedTools` to custom agents for cost control

### Claude Code Version Requirements

| Feature | Minimum Version |
|---------|----------------|
| Core Claude-Craft | v2.1.97 (CVE-2025-59536 patched) |
| `/effort`, `/model` | v2.1.72 |
| `/context` | v2.1.74 |
| Agent frontmatter | v2.1.78 |
| MCP Tool Search | v2.1.80 |
| Managed settings | v2.1.83 |
| Auto Mode | v2.1.94 |
| MCP security fixes | v2.1.97 |
| Subprocess sandboxing | v2.1.98 |
| `/proactive`, PreCompact blocking | v2.1.105 |

### Updating Installation

```bash
# Update rules (preserves project-specific files)
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en --update

# Or via Makefile
make install-symfony TARGET=. RULES_LANG=en OPTIONS="--update"
```

---

## Summary

You've successfully:
- [x] Backed up your project
- [x] Installed Claude-Craft safely
- [x] Made Claude understand your codebase
- [x] Made your first AI-assisted modification
- [x] Pushed changes to your repository
- [x] Prepared for team onboarding

### What's Next?

| Task | Guide |
|------|-------|
| Learn the full TDD workflow | [Feature Development](03-feature-development.md) |
| Debug issues effectively | [Bug Fixing](04-bug-fixing.md) |
| Manage your backlog with AI | [Backlog Management](07-backlog-management.md) |
| Explore advanced tools | [Tools Reference](05-tools-reference.md) |

---

[&larr; Previous: Setup New Project](08-setup-new-project.md) | [Back to Index](../index.md)
