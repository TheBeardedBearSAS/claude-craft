---
description: End-to-end sprint orchestrator (start -> decompose -> validate -> implement -> PR -> CI -> review -> retro -> merge)
argument-hint: "<N> [--auto-merge] [--max-fix-attempts=2] [--max-workers=3] [--base=main] [--dry-run] [--overnight]"
---

# Auto Sprint — End-to-End Sprint Orchestrator

You act as **Product Owner / Scrum Master** and drive a full sprint from kick-off to merge
in a **single command**. Each ceremony runs inside an **isolated sub-agent**: the sub-agent's
own context window replaces the manual `/clear` between steps, so your orchestrator context
stays lean. The implementation phase is run by **you as conductor** (same logic as
`/team:sprint`) to avoid nesting Agent Teams.

This automates what was previously six manual commands with a `/clear` in between:

```
/workflow:start N -> /project:decompose-tasks 00N -> /gate:validate-sprint 00N
-> /team:sprint "sprint-00N" -> /workflow:review N -> /workflow:retro N
```

…and adds: branch, commit, Pull Request, CI watch, and merge.

## Arguments

$ARGUMENTS

- `<N>` : Sprint number (e.g. `5`). **Required.**
- `--auto-merge` : Merge automatically once CI is green and DoD passes. **Default: OFF** — the
  command pauses and waits for an explicit human GO before merging (honors "review obligatoire",
  rule 09, and the Karpathy "no auto-merge without human review" principle).
- `--max-fix-attempts=2` : Max auto-fix retries per failing gate before aborting (default: 2).
- `--max-workers=3` : Max parallel dev workers in the implementation phase (default: 2, max: 3).
- `--base=main` : Base branch for the PR (default: `main`).
- `--dry-run` : Print the planned 9 phases and the resolved sprint context, then stop. **No writes.**
- `--overnight` : Pass-through to the implementation phase (bounded, stops at 6am).

## Prerequisites

- Claude Code v2.1.32+ with Agent Teams support
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` set
- `gh` CLI authenticated (PR create / checks / merge)
- Docker available (all tests run via Docker — see project CLAUDE.md)
- BMAD v6 project with `.bmad/sprint-status.yaml` present

> If a prerequisite is missing, abort early with a clear, actionable message. Do not silently skip a phase.

## Sprint number normalization

The chained commands disagree on format. Normalize **once** in Phase 0 and pass the right form
to each phase:

| Phase | Expected form |
|-------|---------------|
| `start`, `review`, `retro` | bare `N` (e.g. `5`) |
| `decompose-tasks` | zero-padded `00N` (e.g. `005`) |
| `team:sprint` (implementation) | free-form sprint name resolved from the folder / status file |

Resolve the sprint folder by globbing `project-management/sprints/sprint-{N}-*/` and read
`.bmad/sprint-status.yaml` for the canonical sprint name and story list.

## Process

### Phase 0 — Normalize & branch (inline)

1. Parse `<N>` and flags. Derive `N`, `00N`, sprint slug, and sprint name.
2. Resolve `project-management/sprints/sprint-{N}-*/` and `.bmad/sprint-status.yaml`.
   **Abort** if neither exists (nothing to orchestrate).
3. Verify the working tree is clean and `--base` is up to date. **Abort** if dirty.
4. Create / checkout the feature branch `feature/sprint-{N}-<slug>` from `--base`
   (rule 09: `main` always deployable — never work directly on the base branch).
5. If `--dry-run`: print the resolved context + the 9 planned phases and **stop here**.

### Phase 1 — Start (sub-agent)

Spawn one isolated sub-agent:

> "Read `.claude/commands/workflow/start.md` and execute it for sprint **N**.
> Create the sprint folder structure, `sprint-goal.md`, and the pre-sprint checklist.
> Return a terse summary (< 50 tokens) and the list of files created."

### Phase 2 — Decompose (sub-agent)

> "Read `.claude/commands/project/decompose-tasks.md` and execute it for sprint **00N**.
> Generate the per-US task files, `task-board.md`, and the dependency graph.
> Return a terse summary and the files created."

### Phase 3 — Validate gate (sub-agent + auto-fix loop)

> "Read `.claude/commands/gate/validate-sprint.md` and run it for sprint **00N**.
> Return PASS/FAIL, the score, and the list of failing criteria."

**On FAIL → auto-fix loop** (up to `--max-fix-attempts`):
- Spawn a remediation sub-agent that fixes the reported gaps (stories not `ready-for-dev`,
  missing estimates, unresolved dependencies) directly in the sprint files.
- Re-run the validation sub-agent.
- If still failing after `--max-fix-attempts` → **abort** with the remediation report.

### Phase 4 — Implement (you = conductor)

Assume the **`/team:sprint` conductor role directly** (do **not** spawn a nested Agent Team):

1. Read `.bmad/sprint-status.yaml`; filter stories at `ready-for-dev`.
2. Analyze file-domain independence (flag `**/Shared/**`, `**/Common/**`, `**/Utils/**`,
   `**/Helpers/**` overlaps → sequence in the same worker).
3. Estimate cost via `Tools/AgentTeams/lib/cost-estimator.sh` (honor the Fast Mode blocking
   guard and `--max-cost` if present).
4. `TaskCreate` one dev worker per independent story (max `--max-workers`), lean context
   (only `@.claude/references/<project-tech>/CLAUDE.md`). Workers follow TDD Red/Green/Refactor
   with **Docker** test commands.
5. Poll `TaskList` every 30s (back off to 60s after 3 idle polls). Refresh `TaskList`
   every 5 worker completions (context-compaction mitigation). Cap worker completion messages
   at < 50 tokens.
6. Validate the **DoD** per story; transition `in-progress -> review` in `sprint-status.yaml`
   via the single-writer pattern.

**On DoD miss for a story → auto-fix loop** (same retry budget): re-task the worker with the
failing checks; after `--max-fix-attempts`, mark the story `blocked` and continue.

### Phase 5 — Commit & PR (inline)

1. Commit the implementation with **Conventional Commits** (atomic per story where possible).
2. Push the feature branch.
3. Open a **draft** PR against `--base` via `gh pr create` (title + body summarizing the sprint
   goal, stories delivered, and DoD status).

### Phase 6 — CI watch (inline + auto-fix loop)

1. Watch CI: `gh pr checks --watch` (poll ~30s).
2. **On red → auto-fix loop** (up to `--max-fix-attempts`): read the failing job logs
   (`gh run view --log-failed`), spawn a fix sub-agent, commit + push, re-watch.
3. After `--max-fix-attempts` still red → **abort** with the failing-check report.

### Phase 7 — Review (sub-agent)

> "Read `.claude/commands/workflow/review.md` and execute it for sprint **N** (it uses
> `git log` / `gh pr` to gather sprint data). Produce `sprint-review.md`. Return a terse summary."

### Phase 8 — Retro (sub-agent)

> "Read `.claude/commands/workflow/retro.md` and execute it for sprint **N**.
> Produce `sprint-retro.md` with SMART action items. Return a terse summary."

### Phase 9 — Merge (inline, gated)

- **If `--auto-merge`** AND CI is green AND DoD passed:
  `gh pr ready` then `gh pr merge --squash --delete-branch`.
- **Otherwise (default)**: **pause**. Present the final summary, the PR link, CI status, and the
  DoD report, then **wait for an explicit human GO** before merging.

> **Merge errors are surfaced, never hardcoded.** If the merge is blocked by branch protection,
> report it and suggest `--admin`. If it is blocked because the PR touches `.github/workflows/`
> and the token lacks the `workflow` scope, report that and suggest a manual squash-and-push.
> Do not bake repository-specific quirks into this generic command.

## Final report

```
================================================================
AUTO SPRINT — Summary
================================================================
Sprint        : sprint-<N>-<slug>
Branch        : feature/sprint-<N>-<slug>
Base          : <base>
PR            : <url>  (CI: <green|red>)
----------------------------------------------------------------
Phase            | Status | Notes
-----------------|--------|---------------------------------------
0 Normalize      | OK     | <N>/00<N>, branch ready
1 Start          | OK     | sprint-goal.md
2 Decompose      | OK     | N task files
3 Validate gate  | OK     | score X% (Y fix attempts)
4 Implement      | OK     | A/B stories, C blocked
5 Commit + PR    | OK     | <url>
6 CI watch       | OK     | green (Z fix attempts)
7 Review         | OK     | sprint-review.md
8 Retro          | OK     | sprint-retro.md
9 Merge          | PAUSED | awaiting human GO   (or MERGED)
================================================================
```

## Error handling

| Situation | Behavior |
|-----------|----------|
| Sprint folder / status file missing | Abort in Phase 0 |
| Working tree dirty | Abort in Phase 0 |
| Validate gate fails after retries | Abort with remediation report |
| Story DoD miss after retries | Mark `blocked`, continue, report at the end |
| CI red after retries | Abort with failing-check report |
| Merge blocked (protection / scope) | Surface the error + suggested flag, do not force |
| Agent Teams unavailable | Abort Phase 4 with a setup hint (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) |

## Notes

- **No nested Agent Teams**: you run the conductor role yourself in Phase 4.
- **Auto-merge is opt-in** and intentionally gated behind a flag.
- **Docker is mandatory** for tests (project CLAUDE.md).
- Sub-agent isolation is what replaces `/clear` — keep each sub-agent report terse.
