---
name: workflow-implement
description: "Execute the Implementation phase - TDD/BDD development of a sprint, an epic, a story or the batch queue (sequential, or parallel via /team:delivery --phase=implementation)"
argument-hint: "[<N>|--epic <EPIC>|--story <US-ID>|--queue] [--resume] [--parallel N] [--auto] [--dry-run]"
arguments:
  - name: sprint
    description: Sprint number, "next" or "current" (default - current sprint)
    required: false
  - name: epic
    description: "--epic <EPIC> - implement every story of an epic (e.g. EPIC-001)"
    required: false
  - name: story
    description: "--story <US-ID> - implement a single story (e.g. US-001)"
    required: false
  - name: queue
    description: "--queue - process the batch queue .bmad/batch-queue.yaml"
    required: false
---

# /workflow:implement

## Mission

Execute the Implementation phase: sprint-by-sprint (or epic / story / queue) development with TDD/BDD, following the technical design from the previous phases. It is the single entry point for implementation: it replaces `/workflow:implement`, `/workflow:implement`, `/workflow:implement --epic` and `/workflow:implement --queue`.

**Sequential by default.** `--parallel N` delegates execution to `/team:delivery --phase=implementation` (Agent Teams).

## Usage

```bash
/workflow:implement [<N>|--epic <EPIC>|--story <US-ID>|--queue] [--resume] [--parallel N] [--auto] [--dry-run]
```

| Mode / flag | What it does | Replaces |
|-------------|--------------|----------|
| `<N>` / `next` / `current` | Implement sprint N, the next incomplete sprint, or the active one (default: current) | `/workflow:implement`, `/workflow:implement` |
| `--epic <EPIC>` | Queue and implement every story of an epic, dependencies first | `/workflow:implement --epic <EPIC>` |
| `--story <US-ID>` | Implement one story (task loop + validation) | (one story) |
| `--queue` | Process the batch queue `.bmad/batch-queue.yaml` | `/workflow:implement --queue` |
| `--resume` | Resume from the last checkpoint (stopped sprint or interrupted queue) | `/workflow:implement --queue --resume` |
| `--parallel N` | Run up to N independent stories in parallel by delegating to `/team:delivery --phase=implementation` | `/workflow:implement --queue --parallel N` |
| `--auto` | Start immediately, without the confirmation prompt | `--auto` |
| `--dry-run` | Preview the execution plan; nothing is changed | `--dry-run` |

**Single source of truth:** every status change is written to `.bmad/sprint-status.yaml` (schema: `.claude/templates/project/sprint-status.md`) - story transitions, `tdd_phase`, task statuses, `tasks.completed` and `history`. Markdown files carry content only, never status.

## When to Use

- After `/workflow:design` (Standard/Enterprise) and `/workflow:start <N>` (sprint folder, tasks)
- After `/workflow:init` for the Quick Flow track
- When ready to start coding

## Prerequisites

Standard/Enterprise:
- Tech Spec at `project-management/tech-spec.md`, backlog at `project-management/backlog/`
- Sprint with decomposed tasks in `project-management/sprints/sprint-{N}-{slug}/` (`sprint-goal.md`, `board.md`, `tasks/TASK-*.md`) - run `/workflow:start <N>` (or `/workflow:start <N> --tasks-only`) if missing
- Stories in `.bmad/sprint-status.yaml`

Quick Flow: a clear understanding of the bug/feature to implement.

## Plan Mode

> **Plan mode is mandatory.** Before each task, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## Workflow

### Step 1: Select the scope

1. Parse the arguments (mode, then flags). Without a mode, use the current sprint.
2. Read `.bmad/sprint-status.yaml` and build the list of eligible stories:
   - `<N>`: the sprint stories in `ready-for-dev` or `in-progress`
   - `--epic <EPIC>`: stories whose `epic_id` matches, not done, not blocked (blocked ones are flagged for review)
   - `--story <US-ID>`: that single story
   - `--queue`: stories with status `pending` in `.bmad/batch-queue.yaml`, sorted by priority
3. For a sprint, run `/gate:check sprint` first; if the gate fails, show the issues and stop.

```
Sprint 1: Walking Skeleton
   Goal: Complete authentication flow end-to-end
   3 User Stories, 17 Tasks
   To Do: 15 | In Progress: 2 | Done: 0
```

### Step 2: Build the execution plan

1. Analyze dependencies between stories and build the dependency graph.
2. Order the stories: no dependencies first, then by priority, then lower ID first.
3. Identify the groups that can run in parallel.
4. Write the queue to `.bmad/batch-queue.yaml` (for `--epic` and sprint modes with several stories):

```yaml
queue:
  - story_id: "US-010"
    priority: 1
    status: "pending"
    dependencies: []
  - story_id: "US-011"
    priority: 2
    status: "pending"
    dependencies: ["US-010"]
```

With `--dry-run`, display the plan and stop:

```
Implement: EPIC-002 (DRY RUN)
Stories: 5 | Total points: 21

[1] US-010: User registration (5 pts)  deps: none
[2] US-011: User login (5 pts)         deps: US-010
[3] US-012: Profile page (5 pts)       deps: US-010
[4] US-013: Password reset (3 pts)     deps: US-010, US-011
[5] US-014: Email verification (3 pts) deps: US-010

Parallelizable after US-010: US-011, US-012, US-014
DRY RUN - no changes made. Run without --dry-run to execute.
```

Unless `--auto` is given, ask for confirmation before executing.

### Step 3: Execute

- **Sequential (default):** process the stories one by one with the story loop below, with a checkpoint after each story.
- **`--parallel N`:** hand the independent stories (no unmet dependency) to `/team:delivery --phase=implementation`, which runs up to N teammates in parallel. `/team:delivery` writes its transitions to the same `.bmad/sprint-status.yaml`; stories with dependencies wait until their prerequisites are `done`.

```
Mode: Parallel (3 workers)
Worker 1: US-010 - User registration       [running]
Worker 2: (waiting for dependencies)
[10:15] US-010 done -> starting US-011, US-012, US-014 in parallel
[10:30] US-013 done (deps US-010, US-011 satisfied)
```

#### Story loop

For each story in `ready-for-dev` or `in-progress`:

1. **Transition the story to `in-progress`** (`status`, `previous_status`, `tdd_phase`, `history` entry in the YAML).
2. **Display the acceptance criteria** (Gherkin).
3. **Process each task** with the task loop.

```
US-001: User Authentication (5 pts)  -  in-progress

   GIVEN a registered user with valid credentials
   WHEN they submit the login form
   THEN they should see their dashboard
   AND a session should be created

   TASK-001 [DB] Create User entity .............. to-do
   TASK-002 [BE] Authentication service .......... to-do
   TASK-003 [FE-WEB] Login form .................. to-do
   TASK-004 [TEST] E2E authentication tests ...... to-do
```

#### Task loop (TDD)

For each task in `to-do`, in the processing order below:

**3.1 Display the task** (estimation, description, files to modify, Definition of Done).

**3.2 Plan mode (mandatory).** Explore the impacted code and dependencies, document the findings, then propose a plan: files to create/modify, tests to write first, risks and mitigations. Wait for validation:

```
[continue] Proceed   [skip] Skip this task   [block] Mark as blocked   [stop] Stop (state saved)
```

**3.3 Mark the task `in-progress`.** In `.bmad/sprint-status.yaml`: set `stories.<US>.tasks.status.<TASK>: in-progress`; for the first task of a `ready-for-dev` story, transition the story to `in-progress` (`status`, `previous_status`, `tdd_phase`, history entry). Regenerate `board.md` (generated view) and update `index.md`.

**3.4 TDD cycle.**

```
RED       Write failing tests          -> FAILED (expected)
GREEN     Implement the minimum code   -> PASSED
REFACTOR  Improve quality              -> PASSED (no regression)
```

Update `tdd_phase` (`red` -> `green` -> `refactor`) in the YAML at each phase.

**3.5 Definition of Done check.**

```
- [x] Code written and functional
- [x] Tests pass (3/3)
- [ ] Code reviewed -> handled by TASK-XXX [REV]
```

**3.6 Mark the task `done`.** Ask for the actual time spent, then update:
- `.bmad/sprint-status.yaml`: `tasks.status.<TASK>: done` and `tasks.completed` (= number of `done` tasks)
- Task file content metadata (`time_spent`, `updated_at`; no status)
- `board.md` (regenerated from the YAML), `index.md`, sprint metrics

**3.7 Conventional commit** with the story reference:

```
feat(entity): create User entity with authentication support

- Add User entity with email, password_hash, roles
- Add unit tests for User entity

Refs: TASK-001, US-001
```

#### Story validation

When all tasks of a story are `done`: check each acceptance criterion, run the E2E tests if present, run the quality gate (`/gate:check story` when configured), then transition the story (`in-progress` -> `review` -> `done`) in the YAML, with `previous_status` and a `history` entry. Update the EPIC progress (EPIC status is derived).

```
US-001 validation: 4/4 tasks, acceptance criteria met, E2E passed
US-001 -> done  |  EPIC-001: 1/3 stories (33%)
```

After every transition the `routing.auto_transitions` rules apply (see `/project:backlog move story --auto`).

### Step 4: Handle failures and blocks

- **Blocked task:** mark it `blocked` with the reason in the YAML, then choose: [1] skip and continue with the next unblocked task, [2] try to resolve the blocker, [3] stop.
- **Failed story (queue / epic):** mark it `failed` with the error, TDD phase and last checkpoint; stories depending on it are skipped. Apply `resume_on_failure` from the queue settings (continue or stop). Fix the cause, then run `/workflow:implement --resume`.

### Step 5: Checkpoints and resume

A checkpoint is saved after each story in `.bmad/batch-queue.yaml`:

```yaml
checkpoints:
  last_completed: "US-012"
  timestamp: "2026-01-29T14:30:00Z"
  stories_completed: 3
  stories_failed: 0
```

`--resume` reloads the checkpoint (or, for a stopped sprint, the last completed task) and continues:

```
Resuming Sprint 1: Walking Skeleton - 8/17 tasks (47%)
Last completed: TASK-008 [BE] JWT Token Service
Next task: TASK-009 [FE-WEB] Login Controller - continue? [y/n]
```

### Step 6: Report

```
Batch complete: 5 done | 0 failed | 0 skipped
US-010 45 min | US-011 38 min | US-012 52 min | US-013 28 min | US-014 35 min
Total 3h 18min - average 40 min per story
```

When all stories of a sprint are `done`:

```
Sprint 1 complete: 5/5 stories, 21 points, velocity 21 pts/sprint
Hours: 38h actual vs 42h estimated | Test coverage: 82% | Commits: 23
sprint-review.md generated, sprint-retro.md template ready
```

Next actions: `/workflow:review`, `/workflow:retro`, `/workflow:implement <N+1>`, or `/workflow:status`.

## Task Processing Order

| Order | Type | Description |
|-------|------|-------------|
| 1 | `[DB]` | Database (entities, migrations, repositories) |
| 2 | `[BE]` | Backend (services, APIs, business logic) |
| 3 | `[FE-WEB]` | Frontend Web (controllers, templates, JS) |
| 4 | `[FE-MOB]` | Frontend Mobile (screens, blocs, widgets) |
| 5 | `[TEST]` | Additional tests (E2E, performance) |
| 6 | `[DOC]` | Documentation |
| 7 | `[REV]` | Code Review |

## Control Commands

| Command | Action |
|---------|--------|
| `continue` | Validate the plan and proceed |
| `skip` | Skip this task (stays `to-do`) |
| `block [reason]` | Mark the task `blocked` with a reason |
| `stop` | Stop and save the current state |
| `status` | Display current progress (`/workflow:status`) |
| `board` | Show the Kanban board (`/workflow:status --board`) |

## Automatic Updates

At each status change, all statuses go to `.bmad/sprint-status.yaml`; markdown files get content only.

1. **sprint-status.yaml:** task status (`to-do | in-progress | done | blocked`), `tasks.completed`, `tdd_phase`, story transitions (`ready-for-dev` -> `in-progress` -> `review` -> `done`) with `previous_status` and a `history` entry
2. **Task file:** `time_spent`, `updated_at` (no status)
3. **User story file:** task progress display (no status)
4. **EPIC file:** story progress (status derived)
5. **board.md:** Kanban columns regenerated from the YAML
6. **index.md:** global metrics

## Files Updated

| File | Updates |
|------|---------|
| `.bmad/sprint-status.yaml` | Story status, `tdd_phase`, task statuses, `tasks.completed`, history |
| `.bmad/batch-queue.yaml` | Queue entries, statuses, checkpoints |
| `project-management/backlog/user-stories/US-XXX.md` | Task progress (content only) |
| `project-management/backlog/epics/EPIC-XXX.md` | Story progress |
| `project-management/sprints/sprint-{N}-{slug}/board.md` | Kanban columns (regenerated) |
| `project-management/sprints/sprint-{N}-{slug}/tasks/*.md` | Time spent (no status) |
| `project-management/sprints/sprint-{N}-{slug}/sprint-review.md` | Generated at the end |

## Queue Configuration

Settings in `.bmad/batch-queue.yaml`:

```yaml
execution:
  mode: "sequential"  # or "parallel"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
  timeout_per_story: 3600
settings:
  auto_retry: true
  max_retries: 2
  retry_delay: 60
```

If Ralph is configured, set `bmad_integration.batch_queue_file: ".bmad/batch-queue.yaml"` in `ralph.yml` to integrate batch execution.

## Quick Flow Mode

For bug fixes and small features no sprint structure is needed:
- Bug fixes: `/qa:tdd` (TDD approach)
- Small features: the technology-specific `/{tech}:*` commands
- Tracking: `/project:backlog add task` then `/project:backlog move task done`

## Agents Involved

- **tech-lead**: Task decomposition, architecture guidance
- **tdd-coach**: TDD/BDD methodology guidance
- **{tech}-reviewer**: Code review (Symfony, Flutter, React, Python, ReactNative)
- **devops-engineer**: CI/CD and deployment

## Related Commands

- `/workflow:design` - Previous phase; `/workflow:start <N>` - create the sprint and its tasks
- `/workflow:status` - Progress, board (`--board`), queue (`--queue`), gates (`--gates`)
- `/team:delivery --phase=implementation` - Parallel engine used by `--parallel N`; `/team:delivery` - Parallel writing + implementation
- `/project:backlog move story <US> <status>` - Manual story transition
- `/qa:tdd` - Quick bug fixes
- `/workflow:review` - Sprint review ceremony
- `/workflow:retro` - Sprint retrospective
