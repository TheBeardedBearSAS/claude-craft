# Migration Guide: v5.x to v6.0

**Version:** 6.0.0

Guide for migrating Claude Craft projects from version 5.x to 6.0.

---

## Breaking Changes

### 1. `/common:full-audit` removed

The standalone full-audit command has been replaced by the Agent Teams sequential audit.

| Before (v5.x) | After (v6.0) |
|----------------|-------------|
| `/common:full-audit` | `/team:audit --sequential` |

The `team-audit` command provides the same functionality with better reporting and the option to parallelize across multiple technology stacks.

### 2. `/common:ralph-sprint` removed

The Autonomous Sprint Conductor command has been replaced by the Agent Teams sprint with Ralph mode.

| Before (v5.x) | After (v6.0) |
|----------------|-------------|
| `/common:ralph-sprint "Sprint 3" --overnight` | `/team:sprint --ralph-mode "Sprint 3" --overnight` |
| `/common:ralph-sprint "Sprint 3" --parallel 3` | `/team:sprint --ralph-mode "Sprint 3" --parallel 3` |
| `/common:ralph-sprint "Sprint 3" --supervised` | `/team:sprint --ralph-mode "Sprint 3" --supervised` |

All `ralph-sprint` CLI options are supported via `team-sprint --ralph-mode`.

### 3. `@workflow-orchestrator` agent removed

The workflow orchestrator agent has been replaced by direct `/workflow:*` commands.

| Before (v5.x) | After (v6.0) |
|----------------|-------------|
| `@workflow-orchestrator Initialize a workflow` | `/workflow:init` |
| `@workflow-orchestrator What's the status?` | `/workflow:status` |
| `@workflow-orchestrator Transition to design` | `/workflow:design` |

The `/workflow:*` commands provide the same functionality with clearer intent and better discoverability.

---

## What's NOT Changed

- **`/common:ralph-run`** - Still available for continuous loop execution
- **`@ralph-conductor`** - Still available for Ralph session orchestration
- **`Tools/Ralph/`** - All Ralph infrastructure remains intact
- **All other agents, commands, and skills** - No changes

---

## Migration Steps

### Step 1: Update Claude Craft

```bash
npx @the-bearded-bear/claude-craft install . --force
```

### Step 2: Update Custom Scripts

Search your project for references to the removed items:

```bash
grep -r "full-audit\|ralph-sprint\|workflow-orchestrator" .claude/ .bmad/
```

Replace any matches following the mapping tables above.

### Step 3: Update CI/CD Pipelines

If your CI/CD pipelines reference these commands:

```bash
# Before
/common:full-audit
/common:ralph-sprint "Sprint N" --overnight

# After
/team:audit --sequential
/team:sprint --ralph-mode "Sprint N" --overnight
```

### Step 4: Update Ralph Configuration

If you have `ralph-autonomous.yml` configuration, it continues to work with `team-sprint --ralph-mode`. No configuration changes needed.

---

## Post-Migration Checklist

- [ ] No references to `/common:full-audit` in project files
- [ ] No references to `/common:ralph-sprint` in project files
- [ ] No references to `@workflow-orchestrator` in project files
- [ ] CI/CD pipelines updated
- [ ] Ralph configuration still working with `team-sprint --ralph-mode`
- [ ] Workflows accessible via `/workflow:*` commands

---

## Rollback

If you need to revert to v5.x:

```bash
# Reinstall previous version
npx @the-bearded-bear/claude-craft@5 install . --force

# Or restore from git
git checkout -- .claude/
```

---

## Getting Help

- Check [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Open GitHub Issue](https://github.com/TheBeardedBearSAS/claude-craft/issues)

---

## See Also

- [BMAD Practical Guide](BMAD-PRACTICAL-GUIDE.md)
- [Ralph Wiggum Guide](RALPH-GUIDE.md)
- [Agent Teams Guide](AGENT-TEAMS-GUIDE.md)
- [Migration v3 → v4](MIGRATION-v4.md)
