# Migration Guide v6 → v7

> **v7.0.0** breaks `/common:` and `/project:` virtual prefixes into real namespaces.
> Total commands: 155 (unchanged) — only the prefixes change.

---

## Breaking Changes Summary

- `/common:` reduced from 38 to 12 commands
- 26 commands moved to 4 new namespaces: `/workflow:`, `/team:`, `/qa:`, `/uiux:`
- 1 command moved to `/docker:`
- `/project:` split into `/sprint:` (5) and `/gate:` (6)
- 4 `/project:` commands renamed (stripped `project-` prefix)

---

## Complete Mapping Table

### From `/common:` → `/workflow:` (9 commands)

| Before | After |
|--------|-------|
| `/common:workflow-init` | `/workflow:init` |
| `/common:workflow-analyze` | `/workflow:analyze` |
| `/common:workflow-plan` | `/workflow:plan` |
| `/common:workflow-design` | `/workflow:design` |
| `/common:workflow-implement` | `/workflow:implement` |
| `/common:workflow-status` | `/workflow:status` |
| `/common:sprint-retro` | `/workflow:retro` |
| `/common:sprint-review` | `/workflow:review` |
| `/common:sprint-start` | `/workflow:start` |

### From `/common:` → `/team:` (4 commands)

| Before | After |
|--------|-------|
| `/common:team-audit` | `/team:audit` |
| `/common:team-delivery` | `/team:delivery` |
| `/common:team-security` | `/team:security` |
| `/common:team-sprint` | `/team:sprint` |

### From `/common:` → `/qa:` (6 commands)

| Before | After |
|--------|-------|
| `/common:recette` | `/qa:recette` |
| `/common:recette-fix` | `/qa:fix` |
| `/common:recette-regression` | `/qa:regression` |
| `/common:recette-report` | `/qa:report` |
| `/common:recette-status` | `/qa:status` |
| `/common:fix-bug-tdd` | `/qa:tdd` |

### From `/common:` → `/uiux:` (7 commands)

| Before | After |
|--------|-------|
| `/common:a11y-audit` | `/uiux:a11y-audit` |
| `/common:a11y-component` | `/uiux:a11y-component` |
| `/common:uiux-audit` | `/uiux:audit` |
| `/common:uiux-component-spec` | `/uiux:component-spec` |
| `/common:uiux-orchestrator` | `/uiux:orchestrator` |
| `/common:ux-user-flow` | `/uiux:user-flow` |
| `/common:ui-design-tokens` | `/uiux:design-tokens` |

### From `/common:` → `/docker:` (1 command)

| Before | After |
|--------|-------|
| `/common:docker-optimize` | `/docker:optimize` |

### From `/project:` → `/sprint:` (5 commands)

| Before | After |
|--------|-------|
| `/project:sprint-transition` | `/sprint:transition` |
| `/project:sprint-next-story` | `/sprint:next-story` |
| `/project:sprint-status` | `/sprint:status` |
| `/project:sprint-auto-route` | `/sprint:auto-route` |
| `/project:sprint-dev` | `/sprint:dev` |

### From `/project:` → `/gate:` (6 commands)

| Before | After |
|--------|-------|
| `/project:gate-validate-prd` | `/gate:validate-prd` |
| `/project:gate-validate-backlog` | `/gate:validate-backlog` |
| `/project:gate-validate-techspec` | `/gate:validate-techspec` |
| `/project:gate-validate-sprint` | `/gate:validate-sprint` |
| `/project:gate-validate-story` | `/gate:validate-story` |
| `/project:gate-report` | `/gate:report` |

### Renamed in `/project:` (4 commands)

| Before | After |
|--------|-------|
| `/project:project-run-sprint` | `/project:run-sprint` |
| `/project:project-run-epic` | `/project:run-epic` |
| `/project:project-run-queue` | `/project:run-queue` |
| `/project:project-batch-status` | `/project:batch-status` |

---

## Migration Steps

```bash
# 1. Update claude-craft
npx @the-bearded-bear/claude-craft install . --tech=<your-tech> --lang=<your-lang> --force

# 2. Find broken references in your project
grep -rn '/common:\(workflow-\|sprint-retro\|sprint-review\|sprint-start\|team-\|recette\|fix-bug-tdd\|uiux-\|a11y-\|ui-design\|ux-user\|docker-optimize\)' .claude/
grep -rn '/project:\(sprint-\|gate-\|project-\)' .claude/

# 3. If you have custom scripts calling these commands, update them
```

---

## What's New in v7.26.0

v7.26.0 introduces token optimization and enhanced Claude Code v2.1.63-v2.1.105 compatibility.

### Key Additions

- **RTK Integration** — Rust Token Killer reduces token usage 55-65% via `/common:setup-rtk`
- **8 New Hook Events** — PostCompact, StopFailure, TaskCreated, CwdChanged, FileChanged, PermissionDenied, Elicitation, ElicitationResult
- **Hook Enhancements** — Conditional `if` field (v2.1.85), `defer` permission (v2.1.89), PreCompact blocking (v2.1.105)
- **New Commands** — `/effort`, `/context`, `/loop`, `/proactive`, `/color`, `/rename`, `/powerup`, `/team-onboarding`
- **Agent Frontmatter** — `effort`, `maxTurns`, `disallowedTools` fields (v2.1.78+)
- **Auto Mode** — AI permission classifier for Team plans (v2.1.94+)
- **MCP Tool Search** — Lazy loading reduces context overhead ~95% (v2.1.80+)
- **Subprocess Sandboxing** — PID namespace isolation + env scrubbing (v2.1.98+)
- **Hook Templates** — Ready-to-use templates in `.claude/templates/hooks/`
- **Managed Settings** — `managed-settings.d/` for enterprise config (v2.1.83+)

### Security Updates

7 CVEs documented (see `SECURITY.md`). Minimum security version: **v2.1.97**.

### Setup RTK (Optional)

```bash
/common:setup-rtk
```

**No breaking changes** — All v7.x commands remain stable.

---

## What Has NOT Changed

- Total command count: 204+
- All agent names (`@tdd-coach`, `@react-reviewer`, etc.)
- Tech-specific commands (`/react:*`, `/symfony:*`, etc.)
- BMAD workflow phases
- Installation process (`npx @the-bearded-bear/claude-craft install`)
- Skills (`/solid-principles`, `/testing`, etc.)
