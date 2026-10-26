---
description: "Sprint Start Preparation: sprint folder, sprint-status.yaml entries and task decomposition"
argument-hint: "<N> [--tasks-only]"
---

# Sprint Start Preparation

You are an experienced Scrum Master and Tech Lead. You must prepare and facilitate starting a new sprint: verify the conditions, create the sprint folder, register the sprint in `.bmad/sprint-status.yaml` and decompose the stories into tasks (Sprint Planning Part 2, "The How").

## Usage

| Invocation | What it does | Replaces |
|------------|--------------|----------|
| `/workflow:start <N>` | Full start: prerequisites, capacity, planning, `project-management/sprints/sprint-{N}-{slug}/` (sprint-goal.md, sprint-dependencies.md, board.md, `tasks/TASK-*.md`), sprint and stories written to `.bmad/sprint-status.yaml`, tasks registered | former sprint start steps (removed in 9.0) |
| `/workflow:start <N> --tasks-only` | Decompose the stories of an **existing** sprint into tasks (Steps 7 to 9 only, skip Steps 1 to 6) | `/workflow:start <N>` |

## Arguments
$ARGUMENTS

Arguments:
- Sprint number (e.g., `5`, `005`); if missing, ask which sprint to start
- (Optional) Duration in days (default: 10 days = 2 weeks)
- `--tasks-only`: only decompose the stories of an existing sprint into tasks

Examples: `/workflow:start 5`, `/workflow:start 5 --tasks-only`

> **Plan mode is mandatory for the decomposition** (Step 7): analyze the impacted code, propose the task breakdown and wait for validation before writing files.

> **Status lives in `.bmad/sprint-status.yaml`** (schema: `.claude/templates/project/sprint-status.md`), never in markdown. Sprint, task and board files hold content only.

## MISSION

### Step 1: Verify Prerequisites

#### 1.1 Previous Sprint Closed
```bash
# Check previous sprint status
# - Sprint Review completed
# - Retrospective completed
# - All US finished or carried over
```

#### 1.2 Prioritized Backlog
- Product Owner has prioritized the backlog
- Candidate US are estimated
- Acceptance criteria are defined

#### 1.3 Team Available
- Availability confirmed
- Vacations identified
- Capacity calculated

### Step 2: Calculate Capacity

```
══════════════════════════════════════════════════════════════
📊 CAPACITY CALCULATION - Sprint {N}
══════════════════════════════════════════════════════════════

Sprint duration: {X} working days
Start date: {YYYY-MM-DD}
End date: {YYYY-MM-DD}

──────────────────────────────────────────────────────────────
👥 TEAM AVAILABILITY
──────────────────────────────────────────────────────────────

| Member | Days available | Focus (%) | Capacity |
|--------|-------------|-----------|----------|
| Dev 1  | 10/10       | 80%       | 8 days  |
| Dev 2  | 8/10        | 80%       | 6.4 days|
| Dev 3  | 10/10       | 50%       | 5 days  |
| Total  | -           | -         | 19.4 days|

──────────────────────────────────────────────────────────────
📈 VELOCITY
──────────────────────────────────────────────────────────────

| Sprint | Planned points | Delivered points |
|--------|------------------|---------------|
| S-3    | 25               | 23            |
| S-2    | 28               | 26            |
| S-1    | 30               | 28            |
| Average| 27.7             | 25.7          |

Average velocity: 26 points
Adjusted capacity: ~24 points (10% safety factor)
```

### Step 3: Prepare Sprint Planning

```
══════════════════════════════════════════════════════════════
📋 SPRINT PLANNING - Sprint {N}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 SPRINT GOAL (to define with PO)
──────────────────────────────────────────────────────────────

> "{Clear business objective in one sentence}"

Example: "Users can create an account and log in
via OAuth2 (Google, GitHub)"

──────────────────────────────────────────────────────────────
📦 CANDIDATE USER STORIES
──────────────────────────────────────────────────────────────

| Priority | US | Title | Points | Status |
|----------|-----|-------|--------|--------|
| 🔴 Must  | US-045 | User registration | 5 | Ready |
| 🔴 Must  | US-046 | Google OAuth login | 8 | Ready |
| 🔴 Must  | US-047 | GitHub OAuth login | 5 | Ready |
| 🟡 Should| US-048 | Password reset | 3 | Ready |
| 🟡 Should| US-049 | User profile page | 5 | Ready |
| 🟢 Could | US-050 | Custom avatar | 2 | Ready |

Candidate total: 28 points
Capacity: 24 points

──────────────────────────────────────────────────────────────
✅ DEFINITION OF READY (verify for each US)
──────────────────────────────────────────────────────────────

For each selected US:
- [ ] Clear and complete description
- [ ] Defined acceptance criteria (Given/When/Then)
- [ ] Points estimation
- [ ] Dependencies identified
- [ ] Mockups/designs available (if UI)
- [ ] Test data prepared
- [ ] No technical blocker

──────────────────────────────────────────────────────────────
📅 PLANNED CEREMONIES
──────────────────────────────────────────────────────────────

| Ceremony | Date | Time | Duration | Location |
|-----------|------|-------|-------|------|
| Sprint Planning P1 | {date} | 09:00 | 2h | Room A |
| Sprint Planning P2 | {date} | 14:00 | 2h | Room A |
| Daily Scrum | Daily | 09:30 | 15min | Stand-up |
| Backlog Refinement | {date} | 14:00 | 1h | Room B |
| Sprint Review | {end date} | 14:00 | 2h | Room A |
| Retrospective | {end date} | 16:30 | 1h30 | Room A |
```

### Step 4: Create Sprint Structure

Create sprint folder (templates in `.claude/templates/project/`):

```
project-management/
└── sprints/
    └── sprint-{N}-{slug}/
        ├── sprint-goal.md
        ├── sprint-dependencies.md
        ├── board.md                  # single Kanban view, content only
        ├── tasks/
        │   ├── README.md             # overview: tasks grouped by US
        │   ├── TASK-001.md           # one file per task (.claude/templates/project/task.md)
        │   └── ...
        ├── daily-notes/
        │   └── {YYYY-MM-DD}.md
        ├── sprint-review.md
        └── sprint-retro.md
```

### Step 5: sprint-goal.md Template

```markdown
# Sprint {N}: {Goal}

## Information

| Attribute | Value |
|----------|--------|
| Number | {N} |
| Start | {YYYY-MM-DD} |
| End | {YYYY-MM-DD} |
| Duration | {X} days |
| Capacity | {Y} points |

## Sprint Goal

> "{Clear business objective}"

## Definition of Done (Reminder)

- [ ] Code review approved (2 reviewers)
- [ ] Unit tests (coverage ≥ 80%)
- [ ] Integration tests pass
- [ ] Documentation updated
- [ ] No technical debt added
- [ ] Deployable to production

## Sprint Backlog

| ID | Title | Points | Assigned | Status |
|----|-------|--------|---------|--------|
| US-045 | User registration | 5 | @dev1 | 🔵 To Do |
| US-046 | Google OAuth login | 8 | @dev2 | 🔵 To Do |
| US-047 | GitHub OAuth login | 5 | @dev1 | 🔵 To Do |
| US-048 | Password reset | 3 | @dev3 | 🔵 To Do |

**Total committed: 21 points**

## Dependencies

| US | Depends on | Status |
|----|-----------|--------|
| US-046 | Google OAuth Console config | ✅ Done |
| US-047 | GitHub OAuth App config | ⏳ In progress |

## Identified Risks

| Risk | Probability | Impact | Mitigation |
|--------|-------------|--------|------------|
| Google API changes | Low | Medium | Use official lib |
| Dev2 sick | Medium | Medium | @dev1 can take over |

## Burndown Chart

```
Points |
  21   |████
  18   |████████
  15   |████████████
  12   |████████████████
   9   |████████████████████
   6   |████████████████████████
   3   |████████████████████████████
   0   |________________________________
       D1  D2  D3  D4  D5  D6  D7  D8  D9  D10
```

## Notes

{Sprint planning notes, decisions made...}
```

### Step 6: Sync `.bmad/sprint-status.yaml`

`/gate:check sprint` and `/workflow:implement` read the sprint from `.bmad/sprint-status.yaml`. Write it now from the `sprint-goal.md` above and the selected US files (`project-management/backlog/user-stories/US-*.md`):

1. Create `.bmad/` if missing.
2. `metadata`: `sprint_id` (`sprint-{N}`), `name`, `start_date`, `end_date`, `goal`, `capacity_points`, taken from `sprint-goal.md`.
3. `stories`: one entry per selected US: `title`, `status: ready-for-dev`, `story_points`, `epic_id`, `priority` (MoSCoW), `dependencies`, `tasks`, `history: []`.
4. File already present for the **same** `sprint_id`: keep the existing statuses (never move a story back) and only add the new US.
5. File present for **another** sprint: first move its stories under `archived_sprints.<old sprint_id>` (`status`, `points`), then write the new sprint.

```yaml
# .bmad/sprint-status.yaml
version: "1.0"
metadata:
  sprint_id: "sprint-2"
  name: "User management"
  start_date: "2026-11-02"
  end_date: "2026-11-13"
  goal: "Users can sign up, log in and edit their profile"
  capacity_points: 21
stories:
  US-010:
    title: "User sign-up"
    status: "ready-for-dev"
    story_points: 5
    epic_id: "EPIC-002"
    priority: "must"
    dependencies: ["US-001"]
    tasks: { total: 0, completed: 0, list: [] }
    history: []
archived_sprints:
  sprint-1:
    stories:
      US-001: { status: "done", points: 5 }
```

### Step 7: Decompose Stories into Tasks

Read `sprint-goal.md`, `sprint-dependencies.md` and every referenced US in `project-management/backlog/user-stories/` (with `--tasks-only`, start here). Adapt the task types to the project's actual stack (read `CLAUDE.md` / `.claude/rules/`); the table below is a typical example.

| Layer | Prefix | Typical tasks |
|-------|--------|---------------|
| Database | `[DB]` | Entity, migration, repository, fixtures |
| Backend | `[BE]` | Service, API resource, DTO, processor, voter |
| Frontend Web | `[FE-WEB]` | Controller, template, component |
| Frontend Mobile | `[FE-MOB]` | Model, repository, state, screen |
| Tests | `[TEST]` | Unit, integration, API, E2E |
| Documentation | `[DOC]` | Code docs, README, OpenAPI |
| DevOps | `[OPS]` | Docker, CI/CD |
| Review | `[REV]` | Code review |

**Good task (SMART)**: Specific (clear action), Measurable (know when done), Assignable (single owner), Realistic, Time-bound (estimated in hours, not points).

**Size rules**: minimum 30 min, maximum 8 h (1 day), ideal 2 to 4 h. Over 8 h: split into subtasks.

**Vertical slicing**: each US gets DB + API + front + tests + doc + review tasks as needed. Typical size: simple CRUD ~15 tasks, business feature ~18, UI only ~11.

For each US, create one `tasks/TASK-{NNN}.md` per task from `.claude/templates/project/task.md` (IDs continue after the last existing `TASK-*`, as `/project:backlog add task` does) with: type, estimation, `Depends on`, description, files to create or modify, validation criteria. Then add a section to `tasks/README.md`:

```markdown
## US-XXX: [Title] (Epic EPIC-XXX, [X] points)

| ID | Type | Task | Estimation | Depends on |
|----|------|------|------------|-----------|
| TASK-001 | [DB] | Create [Name] entity | 2h | - |
| TASK-002 | [DB] | Migration | 1h | TASK-001 |
| TASK-003 | [BE] | API resource | 3h | TASK-001 |
| TASK-004 | [TEST] | API tests | 2h | TASK-003 |

**Total estimated**: XXh
```

Add the dependencies as a Mermaid graph (`TASK-001 --> TASK-002`) and a summary by layer (tasks and hours). Also add a "Cross-cutting technical tasks" section (environment, dependency updates, CI pipeline, identified refactoring) with one `tasks/TASK-{NNN}.md` each (no US).

Rules:
1. Estimation in hours (not points)
2. One task = one owner
3. Max 2 tasks in progress per person
4. Explicit dependencies (Mermaid graph)

### Step 8: Board and Tasks Overview

Create `board.md` (template `.claude/templates/project/board.md`):

```markdown
# Task Board - Sprint {N}

> Generated view: regenerated from `.bmad/sprint-status.yaml` by `/workflow:status --board`. Do not edit by hand.

## to-do
| ID | US | Task | Estimation | Assigned |
|----|-----|------|------------|---------|

## in-progress | review | done | blocked
(same layout, one table per column)

## Metrics
- **Tasks**: X total | X completed (X%)
- **Hours**: Xh estimated | Xh spent | Xh remaining
```

`tasks/README.md` also holds the overview table (US, title, points, tasks, hours), the breakdown by type and the conventions: ID `TASK-[NNN]`, size 0.5 h to 8 h, statuses tracked in `.bmad/sprint-status.yaml` (`to-do | in-progress | done | blocked`).

### Step 9: Register Tasks in `.bmad/sprint-status.yaml`

For every created task (US tasks and cross-cutting tasks), following `.claude/templates/project/sprint-status.md`:

1. Create `.bmad/sprint-status.yaml` from the `/workflow:init` skeleton if missing (with `--tasks-only` the sprint and stories already exist; if not, run the full `/workflow:start <N>`)
2. Append the TASK ids to `stories.<US>.tasks.list`
3. Set `stories.<US>.tasks.status.<TASK>: to-do`
4. Update `stories.<US>.tasks.total` (`completed` stays the number of `done` tasks)

### Step 10: Final Checklist

```
══════════════════════════════════════════════════════════════
✅ SPRINT {N} START CHECKLIST
══════════════════════════════════════════════════════════════

## Before Sprint Planning

- [ ] Previous sprint officially completed
- [ ] Retrospective actions in progress
- [ ] Backlog prioritized by PO
- [ ] Candidate US estimated and "Ready"
- [ ] Team capacity calculated
- [ ] Rooms booked for ceremonies

## During Sprint Planning

### Part 1 - WHAT (with PO)
- [ ] Sprint Goal defined and accepted
- [ ] US selected by team
- [ ] Commitment on scope
- [ ] Dependencies identified

### Part 2 - HOW (dev team)
- [ ] Breakdown into tasks
- [ ] Task estimation
- [ ] Initial assignment
- [ ] Risks discussed

## After Sprint Planning

- [ ] Sprint backlog visible (board updated)
- [ ] Daily Scrum scheduled
- [ ] Tools configured (board, branches, etc.)
- [ ] Team communication (channel, notifications)

══════════════════════════════════════════════════════════════
🚀 SPRINT {N} READY TO START!
══════════════════════════════════════════════════════════════
```

## Scrum Tips

### Sprint Goal
- One sentence
- Business value oriented
- Measurable
- Shared by entire team

### Commitment vs Forecast
- Team commits to Sprint Goal
- Number of points is a forecast
- Confidence increases with experience

### Focus Factor
- Beginner team: 50-60%
- Established team: 70-80%
- Mature team: 80-90%

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /gate:check sprint {N}                                ║
║    Check the sprint is ready (gate)                      ║
║                                                          ║
║  → /workflow:implement {N}                               ║
║    Start TDD/BDD development                             ║
║                                                          ║
║  See also:                                               ║
║  • /project:backlog next story — Pick the first story    ║
║  • /workflow:status  — Check sprint progress             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
