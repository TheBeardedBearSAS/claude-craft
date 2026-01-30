# Migration Guide: v3.x to v4.x

Complete guide for migrating Claude Craft projects from version 3.x to 4.x.

---

## What's New in v4.x

### Major Changes

1. **TCL Structure** - Tiered Context Loading for 95% token reduction
2. **BMAD v6** - Complete project management framework
3. **Ralph Wiggum v2** - Claude Code hooks integration
4. **9 BMAD Agents** - Agent-as-Code YAML format
5. **5 Quality Gates** - Validation at each phase
6. **Status-based Routing** - Automatic story transitions

### Breaking Changes

| v3.x | v4.x | Migration |
|------|------|-----------|
| `.claude/rules/*.md` | `.claude/references/{tech}/*.md` | Automatic |
| Flat structure | TCL hierarchy | Automatic |
| `ralph.sh` | `ralph.yml` + hooks | Manual |
| `/workflow:` commands | `/bmad:` + `/sprint:` + `/gate:` | Command rename |

---

## Prerequisites

Before migrating:

1. **Backup your project**
   ```bash
   cp -r .claude .claude.backup
   ```

2. **Commit any pending changes**
   ```bash
   git add -A && git commit -m "Pre-migration snapshot"
   ```

3. **Update Claude Craft**
   ```bash
   cd ~/claude-craft
   git pull origin main
   ```

---

## Automatic Migration

### Using Make

```bash
# Preview changes (dry run)
make migrate-dry-run TARGET=~/my-project

# Run migration
make migrate TARGET=~/my-project

# With backup
make migrate TARGET=~/my-project OPTIONS="--backup"
```

### Using NPX

```bash
# Preview
npx @the-bearded-bear/claude-craft migrate ~/my-project --dry-run

# Migrate
npx @the-bearded-bear/claude-craft migrate ~/my-project
```

### Using Script

```bash
./Dev/scripts/migrate-project.sh ~/my-project
```

---

## What Gets Migrated

### 1. Directory Structure

**Before (v3.x):**
```
.claude/
├── rules/
│   ├── 00-project-context.md
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   └── ...
├── agents/
├── commands/
└── CLAUDE.md
```

**After (v4.x):**
```
.claude/
├── CLAUDE.md           # Minimal (~200 tokens)
├── INDEX.md            # Quick reference
├── context.yaml        # Skill triggers
├── references/
│   ├── base/           # Universal principles
│   │   ├── solid-principles.md
│   │   ├── kiss-dry-yagni.md
│   │   └── ...
│   └── {technology}/   # Tech-specific
│       ├── architecture.md
│       ├── coding-standards.md
│       └── ...
├── skills/             # On-demand loading
├── agents/
├── commands/
├── templates/
└── checklists/
```

### 2. Rule Files Mapping

| v3.x Rule | v4.x Location |
|-----------|---------------|
| `01-workflow-analysis.md` | `references/base/workflow-analysis.md` |
| `02-architecture.md` | `references/{tech}/architecture.md` |
| `03-coding-standards.md` | `references/{tech}/coding-standards.md` |
| `04-solid-principles.md` | `references/base/solid-principles.md` |
| `05-kiss-dry-yagni.md` | `references/base/kiss-dry-yagni.md` |
| `06-docker-tooling.md` | `references/{tech}/tooling.md` |
| `07-testing.md` | `references/{tech}/testing.md` |
| `08-quality-tools.md` | `references/{tech}/quality-tools.md` |
| `09-git-workflow.md` | `references/base/git-workflow.md` |
| `10-documentation.md` | `references/base/documentation.md` |
| `11-security.md` | `references/{tech}/security.md` |

### 3. CLAUDE.md Transformation

**Before (v3.x):** Large file with all rules inline

**After (v4.x):** Minimal config with references

```markdown
# Claude-Craft - Multi-Technology Framework

**Version:** 5.2.1

## Quick Reference

See `@.claude/INDEX.md` for condensed checklists.

## Technology Quick Links

| Technology | Reference |
|------------|-----------|
| Symfony | `@.claude/references/symfony/` |

## Available Commands

...
```

---

## Manual Migration Steps

If automatic migration fails or you need custom handling:

### Step 1: Create New Structure

```bash
mkdir -p .claude/references/base
mkdir -p .claude/references/{your-tech}
mkdir -p .claude/skills
```

### Step 2: Move Base Rules

```bash
# From old rules/ to new references/base/
mv .claude/rules/04-solid-principles.md .claude/references/base/solid-principles.md
mv .claude/rules/05-kiss-dry-yagni.md .claude/references/base/kiss-dry-yagni.md
mv .claude/rules/09-git-workflow.md .claude/references/base/git-workflow.md
mv .claude/rules/10-documentation.md .claude/references/base/documentation.md
mv .claude/rules/01-workflow-analysis.md .claude/references/base/workflow-analysis.md
```

### Step 3: Move Tech-Specific Rules

```bash
# Example for Symfony
mv .claude/rules/02-architecture.md .claude/references/symfony/architecture.md
mv .claude/rules/03-coding-standards.md .claude/references/symfony/coding-standards.md
mv .claude/rules/07-testing.md .claude/references/symfony/testing.md
mv .claude/rules/11-security.md .claude/references/symfony/security.md
```

### Step 4: Create INDEX.md

Create `.claude/INDEX.md` with condensed reference:

```markdown
# Quick Reference Index

## Architecture Principles
- Clean Architecture layers
- Dependency direction: outer → inner
- Domain is the core

## Testing
- TDD: Red → Green → Refactor
- 80% coverage minimum

## Commands Quick Reference
- `/symfony:check-architecture`
- `/common:pre-commit-check`
```

### Step 5: Update CLAUDE.md

Replace with minimal version (see template above).

### Step 6: Preserve Custom Content

```bash
# Keep your project context
cp .claude.backup/rules/00-project-context.md .claude/rules/
```

---

## Migrating Ralph Wiggum

### v3.x Ralph (Shell-based)

```bash
# Old usage
./ralph.sh "task description"
```

### v4.x Ralph (Hooks-integrated)

1. **Create ralph.yml**
   ```yaml
   version: 1
   max_iterations: 10
   technology: symfony

   dod:
     - type: command
       command: "npm test"
       expect_exit_code: 0
   ```

2. **Enable hooks in settings.json**
   ```json
   {
     "hooks": {
       "SessionStart": [{
         "command": ".claude/hooks/ralph-context.sh"
       }]
     }
   }
   ```

3. **New usage**
   ```bash
   /common:ralph-run "task description"
   ```

---

## Migrating BMAD

### v3.x Workflow Commands

```bash
# Old
/workflow:init
/workflow:analyze
/workflow:plan
/workflow:design
/workflow:implement
```

### v4.x BMAD Commands

```bash
# New - Same commands still work
/workflow:init
/workflow:status

# Plus new BMAD commands
/bmad:init
/bmad:status
/bmad:route

# Sprint management
/sprint:next-story
/sprint:transition US-001 in-progress

# Quality gates
/gate:validate-prd
/gate:validate-story US-001
```

---

## Command Changes

### Renamed Commands

| v3.x | v4.x |
|------|------|
| `/project:sprint-status` | `/sprint:bmad-status` |
| `/project:validate-story` | `/gate:validate-story` |

### New Commands

- `/bmad:init` - Initialize BMAD
- `/bmad:route` - Route to agent
- `/sprint:transition` - Transition story
- `/sprint:auto-route` - Auto routing
- `/gate:validate-*` - Quality gates
- `/project:run-epic` - Batch processing
- `/project:run-queue` - Queue processing

---

## Post-Migration Checklist

After migration, verify:

- [ ] `.claude/CLAUDE.md` exists and is minimal
- [ ] `.claude/INDEX.md` exists
- [ ] `.claude/references/` structure is correct
- [ ] Commands work: `/common:pre-commit-check`
- [ ] Agents work: `@{tech}-reviewer`
- [ ] Skills work: `/testing`
- [ ] Custom project context preserved

### Verification Commands

```bash
# Count files
find .claude -name "*.md" | wc -l

# Test commands
claude
/common:pre-commit-check

# Check structure
ls -la .claude/
ls -la .claude/references/
```

---

## Rollback

If migration fails:

```bash
# Restore from backup
rm -rf .claude
mv .claude.backup .claude

# Or restore from git
git checkout -- .claude/
```

---

## Troubleshooting

### "Reference file not found"

```bash
# Check file exists
ls -la .claude/references/{tech}/

# Reinstall if needed
make install-symfony TARGET=. OPTIONS="--force"
```

### "Command not recognized"

Restart Claude Code session:
```bash
exit
claude
```

### "BMAD not initialized"

```bash
/bmad:init
```

### Custom rules lost

Check backup:
```bash
ls .claude.backup/rules/
cp .claude.backup/rules/00-project-context.md .claude/rules/
```

---

## Getting Help

- Check [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Open GitHub Issue](https://github.com/TheBeardedBearSAS/claude-craft/issues)

---

## See Also

- [BMAD Practical Guide](BMAD-PRACTICAL-GUIDE.md)
- [Ralph Wiggum Guide](RALPH-GUIDE.md)
- [Installation Guide](INSTALLATION.md)
