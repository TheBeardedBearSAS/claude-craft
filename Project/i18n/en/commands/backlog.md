---
description: "Manage the backlog: add, list, edit and move EPICs, User Stories and Tasks"
argument-hint: "<add|list|edit|move> <epic|story|task> [args]"
---

# Backlog

Single entry point to manage the project backlog: create, list, edit and move EPICs, User Stories and Tasks.

## Usage

| Invocation | What it does | Replaces |
|------------|--------------|----------|
| `/project:backlog add epic "Name" [priority]` | Create an EPIC | `/project:backlog add epic` |
| `/project:backlog add story EPIC-XXX "Name" [points]` | Create a User Story in an EPIC | `/project:backlog add story` |
| `/project:backlog add task US-XXX "[TYPE] Description" 4h` | Create a Task in a User Story | `/project:backlog add task` |
| `/project:backlog list epic [status] [priority]` | List EPICs with derived status and progress | `/project:backlog list epic` |
| `/project:backlog list story [epic EPIC-XXX \| sprint N \| status S \| backlog]` | List User Stories | `/project:backlog list story` |
| `/project:backlog list task [us US-XXX \| sprint N \| type T \| status S]` | List Tasks | `/project:backlog list task` |
| `/project:backlog edit epic EPIC-XXX [field] [value]` | Modify an EPIC | `/project:backlog edit epic` |
| `/project:backlog edit story US-XXX [field] [value]` | Modify a User Story | `/project:backlog edit story` |
| `/project:backlog move task TASK-XXX <in-progress\|blocked\|done>` | Change a Task status | `/project:backlog move task` |

There is no `edit task` and no `move story`/`move epic`: story statuses are changed with `/sprint:transition`, EPIC statuses are derived.

## Arguments

$ARGUMENTS: `<action> <entity> [args]`

1. First word = action: `add`, `list`, `edit` or `move`
2. Second word = entity: `epic`, `story` or `task` (`move` only accepts `task`)
3. The rest is passed to the matching section below
4. Missing or unknown action/entity: display the Usage table and stop. `move story` / `move epic`: answer that story statuses are changed with `/sprint:transition` and EPIC status is derived

## Shared Rules

### Source of truth for status

- **Status lives only in `.bmad/sprint-status.yaml`** (single source of truth, schema: `.claude/templates/project/sprint-status.md`). Use the exact status strings of the schema.
  - Story: `backlog`, `ready-for-dev`, `in-progress`, `review`, `done`, `blocked`
  - Task (`stories.<US>.tasks.status.<TASK>`): `to-do`, `in-progress`, `blocked`, `done`
- **Markdown files hold content only** (name, description, points, criteria, estimation, blocker text, time spent). Never write a status in an EPIC, US or task file, nor in tables inside them.
- **EPIC status is derived, never stored**: all stories `backlog` (or no story) = not started; all `done` = done; any `blocked` and none in progress = blocked; otherwise in progress.
- Boards (`board.md`) are generated views: regenerate them from `.bmad/sprint-status.yaml`, never edit by hand.
- If `.bmad/sprint-status.yaml` is missing, create it from the `/workflow:init` skeleton.

### Paths and templates

| Item | Path |
|------|------|
| EPICs | `project-management/backlog/epics/EPIC-{ID}-{slug}.md` |
| User Stories | `project-management/backlog/user-stories/US-{ID}-{slug}.md` |
| Tasks (US in sprint) | `project-management/sprints/sprint-{N}-{slug}/tasks/TASK-{ID}.md` |
| Tasks (otherwise) | `project-management/backlog/tasks/TASK-{ID}.md` |
| Index | `project-management/backlog/index.md` |
| Templates | `.claude/templates/project/{epic,user-story,task}.md` |

### Plan mode (add, edit, move)

> **Plan mode is mandatory** for every action that writes (`add`, `edit`, `move`). Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes. `list` is read-only.

### Status icons (list)

| Icon | Meaning |
|------|---------|
| 🔴 | To Do / backlog (not started) |
| 🟡 | In Progress |
| ⏸️ | Blocked |
| 🟢 | Done |

## add epic

`/project:backlog add epic "EPIC Name" [priority]`

- **Name** (required), **Priority** (optional): High, Medium, Low (default: Medium)

1. **Generate ID**: read `project-management/backlog/epics/`, find the last `EPIC-XXX`, increment
2. **Collect** (if not provided): description, MMF (Minimum Marketable Feature), 2-3 business objectives, success criteria
3. **Create the file** from `.claude/templates/project/epic.md`, replacing `{ID}`, `{NOM}`, `{PRIORITE}`, `{MINIMUM_MARKETABLE_FEATURE}`, `{DESCRIPTION}`, `{DATE}` (YYYY-MM-DD), `{OBJECTIF_1}`, `{OBJECTIF_2}`, `{CRITERE_1}`, `{CRITERE_2}`. No status is written.
4. **Update the index**: add the EPIC to the EPICs table, update counters

```
✅ EPIC created successfully!

📋 EPIC-{ID}: {NAME}
   Status: derived from its stories (none yet)
   Priority: {PRIORITY}
   File: project-management/backlog/epics/EPIC-{ID}-{slug}.md

Next steps:
  /project:backlog add story EPIC-{ID} "User Story Name"
```

Example: `/project:backlog add epic "Authentication System" High` creates `project-management/backlog/epics/EPIC-001-authentication-system.md`.

Validation: name not empty, priority in High/Medium/Low, `project-management/backlog/epics/` exists, ID unique.

## add story

`/project:backlog add story EPIC-XXX "US Name" [points]`

- **EPIC-ID** (required), **Name** (required), **Points** (optional): Fibonacci (1, 2, 3, 5, 8)

1. **Validate the EPIC** exists in `project-management/backlog/epics/`; if not, display an error with the available EPICs
2. **Generate ID**: read `project-management/backlog/user-stories/`, find the last `US-XXX`, increment
3. **Collect**: persona (P-XXX or description), action, benefit, at least 2 acceptance criteria in Gherkin format, points (estimate if not provided)
4. **Create the file** from `.claude/templates/project/user-story.md`, replacing `{ID}`, `{NOM}`, `{EPIC_ID}`, `{SPRINT}` ("Backlog" = unassigned), `{POINTS}`, `{PERSONA}`, `{PERSONA_ID}`, `{ACTION}`, `{BENEFICE}`, `{DATE}`; add the Gherkin criteria
5. **Register the status** in `.bmad/sprint-status.yaml`: add `stories.US-{ID}` with `title`, `status: backlog`, `story_points`, `epic_id`, `priority`, `dependencies: []`, `tasks: { total: 0, completed: 0, list: [] }`, `history: []`
6. **Update the EPIC** (add the US to its User Stories table, no status column; update progress) and the **index** ("Prioritized Backlog" section, counters)

```
✅ User Story created successfully!

📖 US-{ID}: {NAME}
   EPIC: {EPIC_ID}
   Status: backlog (.bmad/sprint-status.yaml)
   Points: {POINTS}
   File: project-management/backlog/user-stories/US-{ID}-{slug}.md

Next steps:
  /sprint:transition US-{ID} sprint-X                # Assign to sprint
  /project:backlog add task US-{ID} "[BE] ..." 4h    # Add tasks
```

Example: `/project:backlog add story EPIC-001 "User login" 5`.

INVEST check: **I**ndependent, **N**egotiable, **V**aluable, **E**stimable (points provided), **S**mall (≤ 8 points, otherwise suggest splitting), **T**estable (clear acceptance criteria).

## add task

`/project:backlog add task US-XXX "[TYPE] Description" estimation`

- **US-ID** (required), **Description** with type in brackets (required), **Estimation** in hours (required, e.g. 4h, 2h, 0.5h)

| Type | Prefix | Description |
|------|--------|-------------|
| Database | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Mobile | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unit, Integration, E2E |
| Documentation | `[DOC]` | PHPDoc, DartDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Review | `[REV]` | Code Review |

1. **Validate the US** exists in `project-management/backlog/user-stories/` and get its sprint (if any); otherwise display an error
2. **Validate the estimation**: minimum 0.5h, maximum 8h, ideal 2-4h; if > 8h, suggest splitting the task
3. **Generate ID**: find the last task ID, increment
4. **Create the file** from `.claude/templates/project/task.md`, replacing `{ID}`, `{DESCRIPTION}`, `{US_ID}`, `{TYPE}`, `{ESTIMATION}`, `{DATE}`, `{DESCRIPTION_DETAILLEE}`; path: sprint tasks directory if the US is in a sprint, else `project-management/backlog/tasks/`
5. **Register the task** in `.bmad/sprint-status.yaml`: append `TASK-{ID}` to `stories.{US_ID}.tasks.list`, set `stories.{US_ID}.tasks.status.TASK-{ID}: to-do`, update `stories.{US_ID}.tasks.total` (keep `completed` = number of `done` tasks)
6. **Update the US** (add the task to its Tasks table, no status column; update progress)
7. **Update the board** if the US is in a sprint: regenerate `board.md` from `.bmad/sprint-status.yaml` (the task appears in `to-do`) and update metrics

```
✅ Task created successfully!

🔧 TASK-{ID}: {DESCRIPTION}
   US: {US_ID}
   Type: {TYPE}
   Status: to-do (.bmad/sprint-status.yaml)
   Estimation: {ESTIMATION}h
   File: {PATH}

Next steps:
  /project:backlog move task TASK-{ID} in-progress  # Start task
  /project:board                                     # View Kanban
```

Examples: `/project:backlog add task US-001 "[BE] Login API endpoint" 4h`, `/project:backlog add task US-001 "[TEST] AuthService unit tests" 3h`.

Validation: type valid, estimation between 0.5h and 8h, User Story exists, ID unique.

## list epic

`/project:backlog list epic [status] [priority]`

- **Status** (derived from stories): todo, in-progress, blocked, done, all (default: all)
- **Priority**: high, medium, low

1. Scan `project-management/backlog/epics/`, read each `EPIC-XXX-*.md` for content metadata (name, priority)
2. Read the statuses of its stories from `.bmad/sprint-status.yaml`
3. Apply filters; for each EPIC count total USs, USs by status, and progress percentage (EPIC status derived as described in Shared Rules)
4. Display the table

```
📋 Project EPICs

| ID | Name | Status | Priority | US | Progress |
|----|-----|--------|----------|-----|-------------|
| EPIC-001 | Authentication | 🟡 In Progress | High | 5 | ████░░░░░░ 40% |
| EPIC-002 | Catalog | 🔴 To Do | Medium | 8 | ░░░░░░░░░░ 0% |

───────────────────────────────────────────────────
Summary: 2 EPICs | 🔴 1 To Do | 🟡 1 In Progress | 🟢 0 Done
```

With many EPICs (e.g. 12), use the compact format: one line per status group (`🔴 To Do (5): EPIC-002, EPIC-003, ...`, `🟡 In Progress (4): EPIC-001 (40%), ...`, `⏸️ Blocked`, `🟢 Done`).

Examples: `/project:backlog list epic`, `/project:backlog list epic in-progress`, `/project:backlog list epic all high`, `/project:backlog list epic blocked`.

For one EPIC's details suggest: `cat project-management/backlog/epics/EPIC-001-*.md`.

## list story

`/project:backlog list story [filter] [value]`

- `epic EPIC-XXX`: filter by EPIC | `sprint N`: filter by sprint | `status STATUS`: backlog, ready-for-dev, in-progress, review, done, blocked | `backlog`: only USs not assigned to a sprint

1. Scan `project-management/backlog/user-stories/`, read each `US-XXX-*.md` for content metadata (title, EPIC, sprint)
2. Read each US status, task statuses and counts from `.bmad/sprint-status.yaml`
3. Apply the filters; per US count total tasks, tasks by status, progress percentage
4. Display a table grouped by EPIC or sprint depending on context

```
📖 User Stories - EPIC-001: Authentication

| ID | Name | Sprint | Status | Points | Tasks | Progress |
|----|-----|--------|--------|--------|-------|-------------|
| US-001 | User login | Sprint 1 | 🟡 In Progress | 5 | 4/6 | ██████░░░░ 67% |
| US-002 | Registration | Sprint 1 | 🔴 To Do | 3 | 0/5 | ░░░░░░░░░░ 0% |
| US-003 | Forgot password | Backlog | 🔴 To Do | 3 | - | - |

───────────────────────────────────────────────────
Total: 3 US | 11 points | 🔴 2 | 🟡 1 | 🟢 0
```

- By sprint: columns `ID | EPIC | Name | Status | Points | Tasks | Progress`, footer `Sprint 1: 3 US | 13 points | Done: 5 pts (38%)`
- Backlog (unassigned): columns `ID | EPIC | Name | Priority | Points | Status`, footer `Backlog: 3 US | 16 points to plan`

Examples: `/project:backlog list story`, `... list story epic EPIC-001`, `... list story sprint 1`, `... list story status blocked`, `... list story backlog`.

Suggest actions: `/sprint:transition US-XXX sprint-2` (assign to sprint), `/sprint:transition US-XXX in-progress` (change status), `/project:backlog add task US-XXX "[BE] ..." 4h`.

## list task

`/project:backlog list task [filter] [value]`

- `us US-XXX` | `sprint N` | `type TYPE` (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV) | `status STATUS` (to-do, in-progress, blocked, done)

1. Scan `project-management/sprints/sprint-{N}-{slug}/tasks/` and `project-management/backlog/tasks/` (if it exists), read each `TASK-XXX.md` for content metadata (type, description, estimation)
2. Read each task status from `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`)
3. Apply filters; compute total estimated hours, completed hours, breakdown by type and by status
4. Display

```
🔧 Tasks - US-001: User login

| ID | Type | Description | Status | Est. | Spent |
|----|------|-------------|--------|------|-------|
| TASK-001 | [DB] | User entity | 🟢 Done | 2h | 2h |
| TASK-003 | [BE] | Login API endpoint | 🟡 In Progress | 4h | 2h |
| TASK-004 | [FE-WEB] | Auth controller | 🔴 To Do | 3h | - |
| TASK-005 | [FE-MOB] | Login screen | ⏸️ Blocked | 6h | - |

───────────────────────────────────────────────────
US-001: 4 tasks | 15h estimated | 4h completed (27%)
```

- By sprint: summary by status (`🔴 To Do (8 tasks, 24h)`, ...) and by type (bar per `[DB]`, `[BE]`, ...), footer `Sprint 1: 25 tasks | 77h estimated | 35h completed (45%)`
- Blocked (`status blocked`): columns `ID | US | Type | Description | Blocker`, footer `2 blocked tasks | 14h waiting`, then an `Actions:` list of how to resolve each blocker

Examples: `/project:backlog list task`, `... list task us US-001`, `... list task sprint 1`, `... list task type BE`, `... list task status blocked`.

## edit epic

`/project:backlog edit epic EPIC-XXX [field] [value]`

| Field | Description | Example |
|-------|-------------|---------|
| `name` | EPIC name | "New name" |
| `priority` | Priority | High, Medium, Low |
| `mmf` | Minimum Marketable Feature | "MMF description" |
| `description` | Description | "New description" |

> **Status is not editable here.** An EPIC status is derived from its stories' statuses in `.bmad/sprint-status.yaml`. To change a story status use `/sprint:transition`; for a task status use `/project:backlog move task`.

- **Interactive mode** (ID only): display the current fields numbered (Name, Priority, MMF, Description) and ask which one to modify (`1-4`, or `q` to quit)
- **Direct mode** (field and value): modify the field directly

Steps: validate the EPIC exists, read the file, modify the field, update the modification date, save, update the index if necessary.

```
✅ EPIC updated!

📋 EPIC-001: Authentication system

Modification:
  Priority: High → Medium

File: project-management/backlog/epics/EPIC-001-authentication-system.md
```

Examples: `/project:backlog edit epic EPIC-001`, `... edit epic EPIC-001 name "Authentication and Authorization"`, `... edit epic EPIC-001 priority Low`, `... edit epic EPIC-001 mmf "Allow SSO and 2FA"`.

Validation: field must be modifiable, priority High/Medium/Low, name not empty.

## edit story

`/project:backlog edit story US-XXX [field] [value]`

| Field | Description | Example |
|-------|-------------|---------|
| `name` | US name | "New name" |
| `points` | Story points | 1, 2, 3, 5, 8 |
| `epic` | Parent EPIC | EPIC-002 |
| `persona` | Related persona | P-001 |
| `story` | US text | "As a..." |
| `criteria` | Acceptance criteria | (interactive mode) |

> **Status is not editable here.** Statuses live in `.bmad/sprint-status.yaml`. To change a story status use `/sprint:transition`; for a task status use `/project:backlog move task`.

- **Interactive mode** (ID only): display the numbered fields (Name, EPIC, Points, Persona, Story, Acceptance criteria) and ask which one to modify (`1-6`, or `q`)
- **Direct mode**: e.g. `/project:backlog edit story US-001 points 8`
- **Acceptance criteria** (interactive): list the criteria (CA-1, CA-2, ...) then ask `(a)dd, (m)odify, (d)elete, (q)uit`; a new criterion is entered in Gherkin (GIVEN / WHEN / THEN)

Steps: validate the US exists, read the file, modify the field, update the modification date, save, update the parent EPIC if changed, update the index.

```
✅ User Story updated!

📖 US-001: User login

Modification:
  Points: 5 → 8

⚠️ Warning: 8 points is the maximum recommended.
   Consider splitting this US if too complex.

File: project-management/backlog/user-stories/US-001-user-login.md
```

If the parent EPIC changes (`EPIC: EPIC-001 → EPIC-002`), report the updates: US removed from the old EPIC list, added to the new one, index updated; also update `epic_id` in `.bmad/sprint-status.yaml`.

Examples: `/project:backlog edit story US-001`, `... edit story US-001 points 3`, `... edit story US-001 epic EPIC-002`, `... edit story US-001 name "User login with SSO"`.

Validation: points Fibonacci (1, 2, 3, 5, 8), warn to split if > 8, EPIC must exist, persona must be defined in personas.md.

## move task

`/project:backlog move task TASK-XXX <destination>`

- **TASK-ID** (required); **Destination** (required): `in-progress` (start), `blocked`, `done`. For a **story** status use `/sprint:transition`.

```
to-do ──→ in-progress ──→ done
   │            │
   │            ↓
   └────→ blocked ←────┘
              │
              ↓
         in-progress
```

| From | To | Allowed |
|------|----|---------|
| to-do | in-progress | ✅ |
| to-do | blocked | ✅ |
| to-do | done | ❌ **Forbidden** |
| in-progress | done | ✅ |
| in-progress | blocked | ✅ |
| in-progress | to-do | ✅ (rollback) |
| blocked | in-progress | ✅ |
| done | in-progress | ⚠️ (reopening) |

Process:

1. **Validate the task**: find the task file, read its current status from `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`), identify the US and sprint
2. **Validate the transition** against the table; to-do → done is blocked and `in-progress` is suggested
3. **To blocked**: ask for the blocker (`What is the blocker for TASK-XXX?`)
4. **To done**: ask for the time spent (`Time spent on TASK-XXX? (estimation: 4h)`)
5. **Update the status**: write it in `.bmad/sprint-status.yaml` (`stories.<US>.tasks.status.<TASK>`), recompute `stories.<US>.tasks.completed` (= number of `done` tasks); never in the task file. In the task file only content changes: blocker text if blocked, time spent if done, modification date
6. **Update the board**: regenerate the sprint `board.md` from `.bmad/sprint-status.yaml` and update metrics
7. **Update the User Story** (task list content, progress recomputed from `.bmad/sprint-status.yaml`); if all tasks are done, suggest completing the US
8. **Update the index** global counters

Outputs:

```
✅ Task moved!

🔧 TASK-003: Login API endpoint
   Before: to-do
   After: in-progress

📖 US-001: User login
   Progress: 2/6 → 3/6 (50%)

Next steps:
  /project:backlog move task TASK-003 done       # When completed
  /project:backlog move task TASK-003 blocked    # If blocked
```

On `done`, also show estimation vs actual time (`Estimation: 4h`, `Actual time: 3.5h ✓`), the US progress bar and the sprint totals (tasks done, hours completed). When all tasks of the US are done:

```
🎉 All tasks of US-001 completed!

Recommended next step:
  /sprint:transition US-001 done
```

Workflow error:

```
❌ Transition not allowed!

🔧 TASK-004: Auth controller
   Current status: to-do
   Requested transition: → done

Rule: A task must go through "In Progress" before "Done"

Correct action:
  /project:backlog move task TASK-004 in-progress
  # ... work on task ...
  /project:backlog move task TASK-004 done
```

On `blocked`, show `Status: in-progress → blocked`, the blocker text and how to unblock (complete the blocking task, then `/project:backlog move task TASK-005 in-progress`).

Examples: `/project:backlog move task TASK-001 in-progress`, `... move task TASK-001 done`, `... move task TASK-001 blocked`, `... move task TASK-001 in-progress` (unblock).

Metrics updated at each move: task count by status, estimated vs actual hours, US progress, sprint progress, Kanban board.
