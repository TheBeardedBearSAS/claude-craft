---
description: "Manage the backlog: add, list, edit and move EPICs, User Stories and Tasks, pick the next story, move story statuses and apply routing rules"
argument-hint: "<add|list|edit|move|next> <epic|story|task> [args] | move story --auto"
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
| `/project:backlog next story [--claim]` | Pick the next `ready-for-dev` story by priority and dependencies (`--claim` moves it to `in-progress`) | `/project:backlog next story` |
| `/project:backlog move story US-XXX <backlog\|ready-for-dev\|in-progress\|review\|done\|blocked\|sprint-N> ["reason"]` | Change a story status through the BMAD state machine, with gates | `/project:backlog move story` |
| `/project:backlog move story --auto [--dry-run]` | Evaluate the `routing.auto_transitions` rules from `.bmad/sprint-status.yaml` and apply the triggered transitions | `/project:backlog move story --auto` |

There is no `edit task` and no `move epic`: EPIC statuses are derived. Story statuses are changed with `move story` (state machine with gates); the `routing.auto_transitions` rules are also applied after every transition.

## Arguments

$ARGUMENTS: `<action> <entity> [args]`

1. First word = action: `add`, `list`, `edit`, `move` or `next`
2. Second word = entity: `epic`, `story` or `task` (`move` accepts `task` or `story`, `next` only `story`)
3. The rest is passed to the matching section below
4. Missing or unknown action/entity: display the Usage table and stop. `move epic`: answer that EPIC status is derived

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
  /project:backlog move story US-{ID} sprint-X                # Assign to sprint
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
  /workflow:status --board                                     # View Kanban
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

Suggest actions: `/project:backlog move story US-XXX sprint-2` (assign to sprint), `/project:backlog move story US-XXX in-progress` (change status), `/project:backlog add task US-XXX "[BE] ..." 4h`.

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

> **Status is not editable here.** An EPIC status is derived from its stories' statuses in `.bmad/sprint-status.yaml`. To change a story status use `/project:backlog move story`; for a task status use `/project:backlog move task`.

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

> **Status is not editable here.** Statuses live in `.bmad/sprint-status.yaml`. To change a story status use `/project:backlog move story`; for a task status use `/project:backlog move task`.

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

- **TASK-ID** (required); **Destination** (required): `in-progress` (start), `blocked`, `done`. For a **story** status use `/project:backlog move story`.

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
  /project:backlog move story US-001 done
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

## next story

`/project:backlog next story [--claim]`

- **--claim** (optional): automatically move the story to `in-progress`

1. **Load**: read `.bmad/sprint-status.yaml`, collect the stories with status `ready-for-dev`, sort by priority (if defined) or by ID
2. **Check prerequisites** for each ready story: no blocking dependencies (every `Depends on` story is `done` or `review`, otherwise show which stories block), story points estimated, tasks decomposed, acceptance criteria defined
3. **Select**, in this order: all dependencies resolved, no blocking dependencies, lower story ID (earlier in the backlog), lower story points (simpler first)
4. **Display** the story: ID and title, points, EPIC, acceptance criteria, task list, prerequisites, dependencies, notes
5. **Claim** (only with `--claim`): same effect as `/project:backlog move story US-XXX in-progress` (gates, history): status `in-progress`, `tdd_phase` set to `red`, `current_task` set to the first task, entry appended to `history`
6. **Guide**: first task to work on and TDD reminder

```
═══════════════════════════════════════════════════════
              Next Story Ready for Dev
═══════════════════════════════════════════════════════

📖 US-012: Implement user profile page
   Epic: EPIC-003 (User Management)
   Points: 5
   Priority: High

Acceptance Criteria (3):
□ AC1: User can view their profile information
□ AC2: User can edit their name and email
□ AC3: Changes are validated before saving

Tasks (4):
□ TASK-031 [BE] Create profile API endpoint
□ TASK-033 [FE] Create profile component

Prerequisites:
✅ No blocking dependencies
✅ Story points estimated
✅ Tasks decomposed
✅ Acceptance criteria defined

Dependencies:
✅ US-001 (Login Page) — done

To start working:
  /project:backlog move story US-012 in-progress
Or use: /project:backlog next story --claim
═══════════════════════════════════════════════════════
```

When no story is ready, show the backlog status (stories in backlog needing refinement, in progress, blocked) and suggestions: refine backlog stories (`/project:migrate --stories`), help with in-progress stories, unblock a blocked story (show the `blocked_reason`), view the dependency graph (`/project:report deps`), view the sprint (`/workflow:status`) and check story readiness (`/gate:check backlog`).

After claiming a story, follow TDD: 🔴 RED (failing test for the first AC/task), 🟢 GREEN (minimum code to pass), 🔵 REFACTOR (clean up, tests stay green), repeat per task. `tdd_phase` in `.bmad/sprint-status.yaml` tracks the phase.

Examples: `/project:backlog next story`, `/project:backlog next story --claim`.

## move story

`/project:backlog move story US-XXX <status> ["reason"]`

- **US-ID** (required); **Status** (required): `backlog`, `ready-for-dev`, `in-progress`, `review`, `done`, `blocked`, or `sprint-N` (assign the story to sprint N, e.g. `sprint-2`)
- **reason** (required for `blocked`): stored as `blocked_reason`

```
backlog → ready-for-dev → in-progress → review → done
                              ↑            │
                              └────────────┘  (changes requested)
any status → blocked → previous_status (resume)
```

| From | To | Allowed |
|------|----|---------|
| backlog | ready-for-dev | ✅ |
| ready-for-dev | in-progress | ✅ |
| in-progress | review | ✅ |
| review | done | ✅ |
| review | in-progress | ✅ (changes requested) |
| any | blocked | ✅ (reason required) |
| blocked | previous_status | ✅ (resume) |
| in-progress | done | ❌ **Forbidden** (go through `review`) |

Process:

1. **Validate the story**: read `.bmad/sprint-status.yaml`, find the story by ID, get its current status
2. **Validate the transition** against the table above; otherwise display the valid transitions from the current status
3. **Check the gates** of the target status; a failed gate blocks the transition and lists the required actions:

| → Target | Gate requirements |
|----------|-------------------|
| `ready-for-dev` | Acceptance criteria defined, story points estimated, tasks decomposed |
| `in-progress` | No blocking dependencies, developer assigned (optional) |
| `review` | All tasks completed, tests passing (TDD green or refactor), code pushed |
| `done` | Code reviewed, all AC validated, DoD checklist complete |
| `blocked` | `blocked_reason` provided |

4. **Execute the transition**: everything is written in `.bmad/sprint-status.yaml` (single source of truth for status, schema in `.claude/templates/project/sprint-status.md`); Markdown US/EPIC files hold content only and never get a status:
   1. Store `previous_status` in `stories.<US>`
   2. Update `stories.<US>.status`
   3. Set the timestamps
   4. Update `stories.<US>.tdd_phase` if applicable
   5. Append an entry to `stories.<US>.history` (`timestamp`, `from`, `to`, `by`, `reason`)
5. **Apply the side effects**: `→ in-progress`: `tdd_phase: red`, `current_task` = first task | `→ review`: `tdd_phase: refactor`, clear `current_task` | `→ done`: clear `tdd_phase`, record the completion time | `→ blocked`: store `blocked_reason` and `previous_status`
6. **Apply the routing rules**: after every transition, evaluate `routing.auto_transitions` (see `move story --auto` below) so that the dependent transitions are chained

```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: "in-progress"
    to: "review"
    by: "manual"
    reason: "All tasks complete"
```

Successful transition:

```
📖 US-005: User authentication

Status: in-progress → review ✅

Gate checks:
✅ All tasks completed (5/5)
✅ Tests passing
✅ Code pushed

History updated:
• 2026-01-29 10:00 - in-progress → review (manual)
• 2026-01-27 09:00 - ready-for-dev → in-progress
```

Gate failed:

```
📖 US-005: User authentication

Requested: in-progress → review ❌

Gate failures:
❌ Tasks incomplete: 3/5
❌ TDD phase is 'red' - tests should pass first

Required actions:
1. Complete remaining tasks (TASK-015, TASK-016)
2. Move TDD to green phase: .bmad/sprint-status.yaml → US-005: tdd_phase: green

Then retry: /project:backlog move story US-005 review
```

Invalid transition: show the current and requested statuses, the reason (`Cannot transition directly from 'in-progress' to 'done'`), the valid transitions from the current status and the state machine.

Special cases:

- **Block**: `/project:backlog move story US-003 blocked "Waiting for API credentials"` stores the reason and preserves the previous status for resume
- **Unblock**: `/project:backlog move story US-003 in-progress` returns to the previous status
- **Changes requested** (review): `/project:backlog move story US-005 in-progress`
- **Assign to a sprint**: `/project:backlog move story US-003 sprint-2` assigns the story to sprint 2, creates the sprint directory if necessary; the story status is preserved
- **Cascade to tasks**: `→ in-progress` leaves tasks in their current status (started individually); `→ done` checks that all tasks are done and warns otherwise; `→ blocked` marks all in-progress tasks as blocked

Next steps by target status: `→ in-progress`: `/workflow:implement --story US-XXX` | `→ review`: `/gate:check story` (validate the DoD) | `→ done`: `/project:backlog next story` (and `/workflow:review` when the sprint is done) | `→ blocked`: resolve the blocker, then `/project:backlog move story US-XXX in-progress`.

### move story --auto

`/project:backlog move story --auto [--dry-run]`

Evaluate the routing rules and transition the stories accordingly (no story ID). **--dry-run** previews the transitions without applying them. The same rules are also applied after every `move story` transition and, depending on the `routing.auto_transitions` settings, in the Stop hook, after a task completion and at session start.

1. **Load**: read `.bmad/sprint-status.yaml`, load `routing.auto_transitions.rules`, get all stories
2. **Evaluate** every rule for every story:

| Rule | `when` | From → To |
|------|--------|-----------|
| `all_tasks_complete` | `tasks.completed == tasks.total && tasks.total > 0` | `in-progress` → `review` |
| `review_approved` | `review.approved == true` | `review` → `done` |
| `blocked_detection` | `blocked_reason != null` | `*` → `blocked` |
| `unblocked` | `blocked_reason == null && previous_status != null` | `blocked` → `previous_status` |

3. **Check prerequisites** before auto-transitioning: gate requirements of the target status (same as `move story`), no conflicting rules, story not manually locked
4. **Execute** (unless `--dry-run`): log the transition, update the status, record it in `history` with `by: "auto-route"`, apply the side effects (TDD phase, etc.)
5. **Report**: rules evaluated, stories checked, transitions made, unchanged stories, errors or warnings

```
═══════════════════════════════════════════════════════
           Auto-Route Preview (DRY RUN)
═══════════════════════════════════════════════════════
Evaluating 4 routing rules against 8 stories...

Would transition:
📖 US-005: User authentication
   Rule: all_tasks_complete
   in-progress → review
   Reason: 5/5 tasks completed

📖 US-003: OAuth integration
   Rule: unblocked
   blocked → in-progress
   Reason: blocked_reason cleared

Summary:
Rules evaluated: 4 | Stories checked: 8
Would transition: 2 | No change needed: 6

Run without --dry-run to apply transitions.
═══════════════════════════════════════════════════════
```

Without `--dry-run` the report lists `✅ US-005: in-progress → review` with the rule and details, then `Transitioned: N`. When nothing is triggered: `No automatic transitions needed.` followed by the stories by status.

Custom rules and triggers are configured in `.bmad/sprint-status.yaml`:

```yaml
routing:
  auto_transitions:
    enabled: true
    run_on_session_start: false
    run_on_task_complete: true
    rules:
      - name: "review_timeout"
        description: "Flag stories in review > 2 days"
        when: "status == 'review' && days_in_status > 2"
        action: "flag"  # flag | transition | notify
      - name: "priority_bump"
        description: "Notify on high priority ready stories"
        when: "priority == 'high' && status == 'ready-for-dev'"
        action: "notify"
```

Next steps: `/project:backlog next story` (pick the next routed story), `/workflow:implement` (start development).

Examples: `/project:backlog move story US-005 review`, `/project:backlog move story US-003 blocked "Waiting for external API"`, `/project:backlog move story --auto --dry-run`, `/project:backlog move story --auto`.
