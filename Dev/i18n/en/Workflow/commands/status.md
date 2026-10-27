---
name: workflow-status
description: "Where am I + next action: workflow phase, sprint metrics, Kanban board (--board), batch queue (--queue), stand-up (--standup) and gates (--gates)"
argument-hint: "[--board|--queue|--standup|--gates] [--sprint N] [--verbose]"
arguments:
  - name: view
    description: "Optional view: --board, --queue, --standup or --gates (default: phase + sprint metrics + next action)"
    required: false
  - name: sprint
    description: "Sprint number (--sprint N), defaults to the current sprint"
    required: false
  - name: verbose
    description: Show detailed status with all artifacts
    required: false
---

# /workflow:status

## Mission

Answer "where am I and what do I do next?". Display the workflow phase, the sprint metrics and the recommended next action. The same command also renders the Kanban board, the batch queue, the daily stand-up and the gate summary.

This command **updates** `project-management/workflow-status.yaml` (`current_phase`, `artifacts`, `next_action`, `next_command`) each time it runs, so the file always reflects what exists on disk.

## Usage

| Mode | What it does | Replaces |
|------|--------------|----------|
| `/workflow:status` | Default view: workflow phase + sprint metrics + next action | `/workflow:status` |
| `/workflow:status --verbose` | Same, with every artifact and the health checks | - |
| `/workflow:status --board` | Kanban board of the sprint, regenerates `board.md` | `/workflow:status --board` |
| `/workflow:status --queue [--history]` | Batch queue (`.bmad/batch-queue.yaml`) and its history | `/workflow:status --queue` |
| `/workflow:status --standup [date]` | Daily stand-up summary (yesterday / today / blockers) | `/workflow:status --standup` |
| `/workflow:status --gates` | Quality gate summary, runs/reads `/gate:check all` | - |
| `--sprint N` | Target sprint N instead of the current one (combines with any view) | - |

```bash
/workflow:status                   # Phase + sprint metrics + next action
/workflow:status --verbose         # Detailed view with all artifacts
/workflow:status --board           # Kanban board of the current sprint
/workflow:status --board --sprint 2
/workflow:status --queue --history
/workflow:status --standup
/workflow:status --gates
```

## Sources of truth

| Data | Source |
|------|--------|
| Workflow phase, artifacts, next action | `project-management/workflow-status.yaml` (updated by this command) |
| Statuses of stories and tasks, TDD phase, routing | `.bmad/sprint-status.yaml` (single source of truth for status; schema in `.claude/templates/project/sprint-status.md`) |
| Content (titles, estimates, types, AC) | Markdown files in `project-management/` (never a source of status) |
| Batch queue | `.bmad/batch-queue.yaml` |

## Process (default view)

### Step 1: Read and refresh the workflow state

1. Read `project-management/workflow-status.yaml`; if missing, show the "No workflow initialized" screen below.
2. Check which artifacts exist (`prd.md`, `tech-spec.md`, `backlog/`, `sprints/`, ...) and set each artifact status.
3. Deduce `current_phase` and update `artifacts`, `next_action`, `next_command`, `updated_at` in the file.

### Step 2: Read the sprint metrics

1. Identify the sprint (`--sprint N` or the current one: the sprint with non-Done stories) and read its `sprint-goal.md`.
2. Read `.bmad/sprint-status.yaml`: story/task statuses, `tdd_phase`, assignments, blockers.
3. Compute points, tasks and hours done vs target, per-story progress, burndown, blockers and risks.
4. Add BMAD routing: state machine counts, TDD phase of in-progress stories, auto-routing suggestions (stories whose tasks are all done are ready for `review`).

### Step 3: Display

Phase view, sprint metrics, then the next action and its command.

## Output Format

### Standard View

```
╔══════════════════════════════════════════════════════════════════╗
║                       WORKFLOW STATUS                             ║
╠══════════════════════════════════════════════════════════════════╣
║ Project: my-awesome-app                                           ║
║ Track: STANDARD                                                   ║
║ Current Phase: Implementation ████████░░░░░░░░ 45%                ║
╠══════════════════════════════════════════════════════════════════╣
║  Phase 1: Analysis        ⏭️  Skipped (Standard track)            ║
║  Phase 2: Planning        ✅ PRD, backlog (18 stories, 89 pts)    ║
║  Phase 3: Design          ✅ Tech spec, architecture, 3 ADRs      ║
║  Phase 4: Implementation  🔄 Sprint 1 (Day 8/14)                  ║
╠══════════════════════════════════════════════════════════════════╣
║ SPRINT 1 - Walking Skeleton                                       ║
║ Points: 5/10 🟡 50%  Tasks: 8/16  Hours: 28h/62h                  ║
║ State: [backlog 2] [ready-for-dev 3] [in-progress 2] [review 1]   ║
║        [done 4] [blocked 1]                                       ║
║ Blockers: TASK-008 (waiting for auth API, 2 days)                 ║
╠══════════════════════════════════════════════════════════════════╣
║ NEXT ACTION: Continue the sprint                                  ║
║ COMMAND: /workflow:implement                                      ║
╚══════════════════════════════════════════════════════════════════╝
```

### Sprint metrics block

```
Overall progress: ██████████████░░░░░░░░░░░░░░░░░░ 45%

│ US      │ Name         │ Pts │ Tasks │ TDD   │ Status         │
├─────────┼──────────────┼─────┼───────┼───────┼────────────────┤
│ US-005  │ User login   │ 5   │ 3/5   │ Green │ 🟡 In Progress │
│ US-007  │ Password reset │ 3 │ 0/4   │ Red   │ 🟡 In Progress │

Burndown: 34h remaining, ideal 28h → 🟡 slightly behind (6h)
Risks: 🔴 mobile blocked for 2 days → prioritize TASK-005
Auto-routing: US-008 has all tasks complete → /project:backlog move story US-008 review
```

The report is also saved in `project-management/sprints/sprint-{N}-{slug}/status-YYYY-MM-DD.md`.

### Verbose View (--verbose)

Adds, per phase, every artifact with its path, version and counts (PRD requirements, personas, EPICs and stories by priority, planned sprints, tech spec stack, architecture diagrams, API endpoints designed/remaining, ADRs, security review), then:

```
║ WORKFLOW HEALTH                                                   ║
║ ✅ PRD aligns with backlog                                        ║
║ ✅ Tech spec covers all requirements                              ║
║ ⚠️  API design incomplete (6 endpoints remaining)                 ║
║ ⚠️  Security review pending                                       ║
║ NEXT ACTIONS                                                      ║
║ 1. Complete API design      → /workflow:design                    ║
║ 2. Then start implementation → /workflow:implement                ║
```

### No Workflow Initialized

```
╔══════════════════════════════════════════════════════════════════╗
║  ⚠️  No workflow initialized for this project                     ║
║  To get started, run:  /workflow:init                             ║
║  • Analyze your project context                                   ║
║  • Recommend the track (Quick/Standard/Enterprise)                ║
║  • Initialize workflow tracking                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

### Quick Flow Status

No phases are required. Show the current task if tracked (e.g. `TASK-042: Fix login validation bug, In Progress`) and the available commands: `/qa:tdd` (continue with TDD), `/project:backlog move task <TASK> done` (mark complete), `/workflow:init` (start a new workflow).

## `--board`: Kanban board

Display the Kanban board of the current sprint (or `--sprint N`).

1. Identify the sprint (given number, otherwise the current sprint with non-Done tasks).
2. Read the statuses from `.bmad/sprint-status.yaml` (`stories.<US>.status`, `stories.<US>.tasks.status.<TASK>`) and the content (titles, estimates, types) from the US and task markdown files (`tasks/TASK-*.md`).
3. Group tasks by column: 🔴 To Do, 🟡 In Progress, ⏸️ Blocked, 🟢 Done.
4. Compute tasks per column, estimated and completed hours, progress percentage, progress by type (`[DB]`, `[BE]`, `[WEB]`, `[MOB]`, `[TEST]`) and by user story.

```
╔══════════════════════════════════════════════════════════════════╗
║  📋 SPRINT 1 - Kanban Board                                      ║
║  Goal: Walking Skeleton - Auth + First page                      ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 🔴 TO DO (4)    │ 🟡 IN PROGRESS  │ ⏸️ BLOCKED (1)  │ 🟢 DONE (8)     │
│                 │ (3)             │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ TASK-009 [TEST] │ TASK-005 [BE]   │ TASK-008 [MOB]  │ TASK-001 [DB]   │
│ E2E Tests       │ Auth Service    │ Login Screen    │ User Entity ✓   │
│ 4h @US-001      │ 4h @US-001      │ ⚠️ Waiting API  │ 2h @US-001      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

Tasks: ████████████████████░░░░░░░░░░ 8/16 (50%)
Hours: ████████████░░░░░░░░░░░░░░░░░░ 28h/62h (45%)
Blocked: 1 task (6h)
```

With many tasks, use the compact format:

```
📋 Sprint 1 - Kanban (32 tasks)
🔴 To Do (12):      TASK-015, TASK-016, TASK-017, TASK-018...
🟡 In Progress (5): TASK-005, TASK-006, TASK-012, TASK-019, TASK-020
⏸️ Blocked (2):     TASK-008 (API), TASK-021 (config)
🟢 Done (13):       TASK-001..TASK-004, TASK-007, TASK-009..TASK-014
Progress: 13/32 (41%) | 45h/98h
```

`board.md` is a **generated view**: after display, the sprint's `board.md` file is regenerated from `.bmad/sprint-status.yaml` (template `.claude/templates/project/board.md`). It is never edited by hand and never the source of a status.

Actions: `/project:backlog move task TASK-XXX in-progress` (start), `/project:backlog move task TASK-XXX done` (complete).

## `--queue`: batch queue

Display the status of the batch queue (`/workflow:implement --queue`).

1. Read `.bmad/batch-queue.yaml`, parse the entries and load the checkpoint.
2. Group stories by status: `pending` (waiting), `running` (in progress), `completed`, `failed` (error), `skipped` (a dependency failed).
3. Show the queue state; with `--history`, also the completed and failed stories with timing.

```
═══════════════════════════════════════════════════════
              Batch Queue Status
═══════════════════════════════════════════════════════
Mode: Sequential
Checkpoint: US-011 (2026-01-29 10:45:00)

⏳ Pending: 3   🔄 Running: 1   ✅ Completed: 2   ❌ Failed: 0   ⏭️ Skipped: 0

Running:
🔄 US-012: Profile page
   Started: 2026-01-29 10:45:00 (15 min ago) | TDD Phase: green | Task: 2/4

Pending:
[4] US-013: Password reset (Dependencies: US-010 ✅, US-011 ✅)
[5] US-014: Email verification (Dependencies: US-010 ✅)

██████████░░░░░░░░░░ 50% (3/6 stories) | Estimated completion: ~1h 30m
═══════════════════════════════════════════════════════
```

`--history` adds the completed table (story, started, completed, duration), the failed stories (error, TDD phase), the skipped ones (reason, e.g. "Depends on failed US-013") and statistics: total time, average per story, success rate (5/6 = 83%), points completed.

An empty queue shows how to fill it: `/workflow:implement --queue` or `/workflow:implement --epic EPIC-001`.

Queue management:

```bash
.bmad/lib/batch-executor.sh add US-001 1   # add a story (priority 1)
# Retry a failed story: .bmad/batch-queue.yaml → US-013: status: pending
/workflow:implement --queue                # run the queue
/workflow:implement --queue --resume       # resume from the checkpoint
# Clear the queue:       .bmad/batch-queue.yaml → queue: []
```

Queue file format:

```yaml
queue:
  - story_id: "US-001"
    priority: 1
    status: "pending"
    dependencies: []
    added_at: "2026-01-29T10:00:00Z"

checkpoints:
  last_completed: "US-001"
  timestamp: "2026-01-29T10:42:00Z"
  stories_completed: 1
```

## `--standup`: daily stand-up

Generate a summary of the development activity for the daily stand-up. Optional argument: a period (default: since yesterday).

1. Collect data (commands run via Docker when they depend on the project environment):

```bash
git log --since="yesterday" --oneline --all   # commits since yesterday
git branch -a --sort=-committerdate | head -10
gh pr list --state open                       # open PRs
gh issue list --assignee @me --state open     # current issues
git status --short                            # local changes
```

2. Read the sprint block from `.bmad/sprint-status.yaml`: sprint number, day X/10, points remaining, burndown (📉 on track / 📈 ahead / 📊 behind).
3. Generate the summary: done (commits, merged PRs, closed issues), planned (in progress by branch/issue/assignee/status, to start), blockers/risks (blocker, impact, action), active pull requests (age, reviews), notes.
4. Short format for Slack/Teams:

```markdown
**📅 Daily - {YYYY-MM-DD}**
**Yesterday:** • PR #123 merged (Google OAuth) • 5 commits on feature/auth
**Today:** • Finish PR #125 (GitHub OAuth) • Start Issue #50 (Password reset)
**Blockers:** • ⚠️ Review pending PR #125 (@dev3)
**PRs to review:** • PR #127 - Fix user profile (0/2)
```

5. Team metrics over 7 days (commits, PRs, reviews, issues per member) and current velocity (points delivered per day, cumulative vs ideal, e.g. "📈 Ahead by 1.6 points").

Stand-up rules: 15 minutes max for the whole team, standing, same time every day, no problem solving (parking lot), focus on the sprint goal. Anti-patterns: reporting to the Scrum Master, long technical discussions, vague "I worked on X". Alternative format "walk the board": Done → In Progress → To Do, focus on what blocks progress.

For a daily digest, a scheduled GitHub Action (cron `0 7 * * 1-5`) can run the same git/gh commands and post the result to Slack.

## `--gates`: gate summary

Summarize the quality gates by running (or reading the last result of) `/gate:check all`.

| Gate | Threshold |
|------|-----------|
| PRD | >= 80% |
| Tech spec | >= 90% |
| INVEST | 6/6 |
| Sprint ready | 100% |
| Story DoD | 100% |
| Spec alignment | >= 85% |

```
GATES
✅ prd 86%   ✅ tech-spec 92%   ✅ invest 6/6
⚠️ sprint-ready 80%   ⏳ story-dod (US-005 in progress)   ✅ spec-alignment 88%
Next: fix the sprint-ready blockers → /gate:check sprint-ready
```

For one gate, use `/gate:check <gate>` directly.

## Status file structure

The workflow status is read from, and written to, `project-management/workflow-status.yaml`:

```yaml
project: my-awesome-app
track: standard  # quick | standard | enterprise
initialized_at: 2026-01-07T10:00:00Z
updated_at: 2026-01-07T15:30:00Z
current_phase: design

phases:
  analysis:
    status: skipped  # pending | in_progress | complete | skipped
    reason: "Standard track - analysis not required"
  planning:
    status: complete
    completed_at: 2026-01-07T12:00:00Z
    artifacts:
      prd:
        status: complete
        path: project-management/prd.md
      backlog:
        status: complete
        path: project-management/backlog/
        epics: 4
        stories: 18
        points: 89
  design:
    status: in_progress
    progress: 75
    artifacts:
      tech_spec:
        status: complete
        path: project-management/tech-spec.md
      api_design:
        status: in_progress
        progress: "18/24 endpoints"
  implementation:
    status: pending
    sprints:
      - name: sprint-1-walking-skeleton
        status: pending
        points: 21
        stories: 5

next_action: "Complete API design"
next_command: "/workflow:design"
```

Story and task statuses are NOT stored here: they live only in `.bmad/sprint-status.yaml`.

## Related Commands

- `/workflow:init` - Initialize the workflow
- `/workflow:plan` - Planning phase (`--research`, `--only=prd`, `--only=backlog`)
- `/workflow:design` - Design phase
- `/workflow:start` - Sprint preparation
- `/workflow:implement` - Implementation phase
- `/project:backlog` - Add, list, edit, move stories and tasks
- `/gate:check` - Quality gates

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║  Based on current phase:                                 ║
║                                                          ║
║  • init      → /workflow:plan                            ║
║  • plan      → /workflow:design                          ║
║  • design    → /workflow:start {N}                       ║
║  • start     → /workflow:implement                       ║
║  • implement → /workflow:review                          ║
║  • review    → /workflow:retro                           ║
║  • retro     → /workflow:start {N+1}                     ║
║                                                          ║
║  Anytime: /workflow:status                               ║
╚══════════════════════════════════════════════════════════╝
```
