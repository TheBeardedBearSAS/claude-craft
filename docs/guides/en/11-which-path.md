# Which Path? Choose Your Workflow in 30 Seconds

> **Who is this for?** Anyone about to start work with Claude Craft who wonders "which commands do I run, and in what order?". Answer two questions, follow one path.
>
> **Rule of thumb:** one situation = one path = one short command sequence. You never need the other 100+ commands to get started.

---

## 1. The decision tree

```
                    What are you doing today?
                               │
        ┌──────────────┬───────┴────────┬──────────────────┐
        ▼              ▼                ▼                  ▼
  A new product    Existing code,    A bug to fix     A planned sprint
  from scratch     no backlog yet                     you want finished
        │              │                │             without babysitting
        ▼              ▼                ▼                  ▼
   GREENFIELD      BROWNFIELD        BUGFIX         AUTONOMOUS SPRINT
  /workflow:init  /project:scan     /qa:tdd         /workflow:auto-sprint N
        │              │          (+ Quick Flow)          │
        ▼              ▼                ▼                  ▼
     Section 2      Section 3       Section 4          Section 5

  Lost at any moment?  →  /workflow:status   (Section 6)
```

Not sure? Ask yourself:

1. **Is there already code?** No → Greenfield. Yes → go to question 2.
2. **Is there already a backlog (epics and stories)?** No → Brownfield. Yes → go to question 3.
3. **Is it a single bug?** Yes → Bugfix. No → continue the sprint with `/workflow:start N`, or hand it over to the Autonomous Sprint.

---

## 2. Greenfield: a new product

You have an idea and an empty repository. Follow the main path, one phase at a time:

```
/workflow:init  →  /workflow:plan  →  /workflow:design  →  /workflow:start 1
                →  /workflow:implement  →  /workflow:review  →  /workflow:retro
```

| Step | Command | What you get |
|------|---------|--------------|
| 1 | `/workflow:init` | Project analysis, recommended track (Quick, Standard or Enterprise), and `.bmad/sprint-status.yaml` |
| 2 | `/workflow:plan` | PRD, personas and the generated backlog |
| 3 | `/workflow:design` | Technical specification and architecture |
| 4 | `/workflow:start 1` | Sprint 1 prepared: stories selected and ready for development |
| 5 | `/workflow:implement` | Stories built with TDD (Red → Green → Refactor) |
| 6 | `/workflow:review` | Sprint review preparation |
| 7 | `/workflow:retro` | Retrospective, then loop back to `/workflow:start 2` |

For a narrated, step-by-step version, read the [Complete Workflow tutorial](10-complete-workflow.md).

---

## 3. Brownfield: existing code, no backlog

You inherit (or already wrote) a codebase, but nobody documented what it does. Reverse-engineer the product first, then join the main path:

```
/project:scan  →  /project:reverse-prd  →  /project:reverse-stories
               →  /project:gap-analysis  →  /workflow:start
```

| Step | Command | What you get |
|------|---------|--------------|
| 1 | `/project:scan` | Inventory of the codebase: stack, structure, modules |
| 2 | `/project:reverse-prd` | A PRD rebuilt from what the code actually does |
| 3 | `/project:reverse-stories` | User stories inferred from existing features |
| 4 | `/project:gap-analysis` | Missing features, missing tests, technical debt |
| 5 | `/workflow:start` | First sprint planned from the gaps; continue with `/workflow:implement` |

See also the [Existing Project setup guide](09-setup-existing-project.md).

---

## 4. Bugfix: reproduce first, then fix

A bug does not need a PRD. Use the lightest track and let the test drive the fix:

```
/qa:tdd        ← write the test that reproduces the bug FIRST (it must fail)
/workflow:init --quick    ← Quick Flow track: implement only
```

1. Run `/qa:tdd` and describe the bug. The test that reproduces it is written **before** any fix, and must fail.
2. Run `/workflow:init --quick` to force the Quick Flow track (no planning or design phases).
3. Fix the code until the test passes, then refactor. The test stays in the suite as a regression guard: a fixed bug should never come back.

See the [Bug Fixing guide](04-bug-fixing.md) for details.

---

## 5. Autonomous sprint: one command, start to merge

When the work is already planned, let Claude Craft drive the whole sprint:

```
/workflow:auto-sprint N
```

**Prerequisites**

- A backlog exists (from the Greenfield or Brownfield path).
- Sprint `N` is planned.

**What it does:** it chains start, task breakdown, validation, implementation, pull request, CI, review, retrospective and finally merge. The run ends with the **PR, a green CI and the merge**. You review the result instead of typing each command.

Prefer control over speed? Stay on the manual main path of Section 2.

---

## 6. Where am I?

At any point, whatever the path:

```
/workflow:status
```

It shows the current phase, the progress of the sprint and the recommended next action.

> **Single source of truth:** `.bmad/sprint-status.yaml` holds the status of every story (`backlog → ready-for-dev → in-progress → review → done`, or `blocked`). It is created by `/workflow:init`, and every command reads and updates it. If two views disagree, this file wins.

---

## Cheat sheet

| Situation | Start with | Then |
|-----------|-----------|------|
| New product | `/workflow:init` | `/workflow:plan` → `/workflow:design` → `/workflow:start 1` |
| Existing code, no backlog | `/project:scan` | `/project:reverse-prd` → `/project:reverse-stories` → `/project:gap-analysis` → `/workflow:start` |
| Bug | `/qa:tdd` | `/workflow:init --quick` |
| Planned sprint, hands-off | `/workflow:auto-sprint N` | Review the PR |
| Lost | `/workflow:status` | Follow the recommended action |
