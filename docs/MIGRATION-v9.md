# Migration Guide v8 → v9

> **v9.0.0** completes the project-management simplification started in 8.23.4: the redirect stubs kept
> since 8.25.0 / 8.26.0 are removed, together with the `/sprint:` namespace. Active PM commands: 86 → 35.

---

## Breaking Changes Summary

- 52 deprecated commands are removed (they printed a warning and redirected since 8.25.0 / 8.26.0).
- The `/sprint:` namespace no longer exists: use `/workflow:implement`, `/workflow:status` and `/project:backlog`.
- `.bmad/sprint-status.yaml` is the single source of truth for story and task status (since 8.24.0); markdown files hold content only.
- `claude-craft update` and both installers delete the retired files listed in `config/removed-commands.yaml`.
- Not changed: `/team:delivery` is kept (Agent Teams variant of `/workflow:auto-sprint`).

## Main path

```
/workflow:init → /workflow:plan → /workflow:design → /workflow:start N → /workflow:implement → /workflow:review → /workflow:retro
                 (+ /workflow:status at any time; /workflow:auto-sprint N runs start → … → merge)
```

See the decision tree: [Which path?](guides/en/11-which-path.md).

---

## Complete Mapping Table

### Backlog — `/project:backlog`

| Before (≤ 8.26) | After (9.0) |
|---|---|
| `/project:add-epic` | `/project:backlog add epic` |
| `/project:add-story` | `/project:backlog add story` |
| `/project:add-task` | `/project:backlog add task` |
| `/project:list-epics` | `/project:backlog list epic` |
| `/project:list-stories` | `/project:backlog list story` |
| `/project:list-tasks` | `/project:backlog list task` |
| `/project:update-epic` | `/project:backlog edit epic` |
| `/project:update-story` | `/project:backlog edit story` |
| `/project:move-task` | `/project:backlog move task` |
| `/sprint:next-story` | `/project:backlog next story` |
| `/sprint:transition` | `/project:backlog move story` |
| `/sprint:auto-route` | `/project:backlog move story --auto` |

### Brownfield, traceability, reports, migration — `/project:`

| Before (≤ 8.26) | After (9.0) |
|---|---|
| `/project:scan` | `/project:reverse scan` |
| `/project:reverse-prd` | `/project:reverse prd` |
| `/project:reverse-stories` | `/project:reverse stories` |
| `/project:gap-analysis` | `/project:reverse gaps` |
| `/project:coverage-map` | `/project:trace --gaps` |
| `/project:burndown` | `/project:report burndown` |
| `/project:metrics` | `/project:report metrics` |
| `/project:dependencies` | `/project:report deps` |
| `/project:critical-path` | `/project:report deps --critical` |
| `/project:analyze-backlog` | `/project:migrate --analyze` |
| `/project:migrate-backlog` | `/project:migrate` |
| `/project:update-stories` | `/project:migrate --stories` |
| `/project:sync-backlog` | `/project:migrate --resync` |

### Quality gates — `/gate:check`

| Before (≤ 8.26) | After (9.0) |
|---|---|
| `/project:checkpoint` | `/gate:check --phase=<phase>` |
| `/gate:validate-prd` | `/gate:check prd` |
| `/gate:validate-techspec` | `/gate:check spec` |
| `/gate:validate-backlog` | `/gate:check backlog` |
| `/gate:validate-sprint` | `/gate:check sprint` |
| `/gate:validate-story` | `/gate:check story` |
| `/gate:validate-alignment` | `/gate:check alignment` |
| `/gate:report` | `/gate:check all` |
| `/common:pre-commit-check` | `/gate:check commit` |
| `/common:pre-merge-check` | `/gate:check merge` |
| `/common:release-checklist` | `/gate:check release` |

### Workflow — `/workflow:`

| Before (≤ 8.26) | After (9.0) |
|---|---|
| `/project:run-sprint` | `/workflow:implement` |
| `/project:run-epic` | `/workflow:implement --epic` |
| `/project:run-queue` | `/workflow:implement --queue` |
| `/project:board` | `/workflow:status --board` |
| `/project:batch-status` | `/workflow:status --queue` |
| `/project:generate-prd` | `/workflow:plan --only=prd` |
| `/project:generate-backlog` | `/workflow:plan --only=backlog` |
| `/project:generate-tech-spec` | `/workflow:design` |
| `/project:generate-constitution` | `/workflow:design --constitution` |
| `/project:decompose-tasks` | `/workflow:start` |
| `/sprint:dev` | `/workflow:implement` |
| `/sprint:status` | `/workflow:status` |
| `/workflow:analyze` | `/workflow:plan --research` |
| `/common:daily-standup` | `/workflow:status --standup` |

### QA and common

| Before (≤ 8.26) | After (9.0) |
|---|---|
| `/qa:report` | `/qa:status --report` |
| `/common:setup-project-context` | `/common:init --context` |

### Retired without replacement command

| Before | After |
|---|---|
| `/common:sub-agents-patterns` | skill `sub-agents-patterns` (8.26.0) |
| `/common:add-technology`, `/common:audit-claude-alignment`, `/common:audit-freshness` | maintainer-only, in a clone of the claude-craft repository (8.24.0) |

---

## Upgrade steps

1. `npx @the-bearded-bear/claude-craft update` — refreshes the commands and deletes the retired files.
2. Replace old invocations in your own scripts, aliases and `CLAUDE.md` using the table above.
3. Projects with a pre-8.24 backlog: run `/project:migrate --analyze`, then `/project:migrate` to move statuses into `.bmad/sprint-status.yaml`.
