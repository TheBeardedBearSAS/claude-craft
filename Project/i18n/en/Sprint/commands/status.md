---
description: "Sprint Status"
argument-hint: "[sprint N] [--bmad] [--verbose]"
---

# Sprint Status

Display detailed metrics and sprint progress.

## Arguments

$ARGUMENTS (optional, format: [sprint N] [--bmad] [--verbose])
- **sprint N** (optional): Sprint number
- **--bmad** (optional): Include BMAD v6 state machine routing, TDD phase tracking, and auto-routing suggestions (reads from `.bmad/sprint-status.yaml`)
- **--verbose** (optional): Show detailed task breakdown per story (only with `--bmad`)
- If not specified, displays current sprint

## Process

### Step 1: Identify sprint

1. Find requested sprint or current sprint
2. Read sprint-goal.md
3. If `--bmad`: also read `.bmad/sprint-status.yaml` for state machine data

### Step 2: Collect data

1. Read all sprint User Stories
2. Read all associated Tasks
3. Calculate metrics
4. If `--bmad`: parse BMAD routing rules, TDD phases, and story state transitions

### Step 3: Generate report

Create detailed report with:
- Overview
- Progress by US
- Time metrics
- Burndown chart (text)
- Blockers
- Risks

If `--bmad` is specified, additionally include:
- BMAD state machine diagram with story counts per state
- TDD phase indicators per in-progress story
- Auto-routing suggestions (e.g., stories ready to transition)
- Acceptance criteria completion status

## Output Format

```
╔══════════════════════════════════════════════════════════════════╗
║  📊 SPRINT 1 - STATUS REPORT                                     ║
║  Generated: 2024-01-22 14:30                                     ║
╚══════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────┐
│ 🎯 SPRINT GOAL                                                   │
├──────────────────────────────────────────────────────────────────┤
│ Walking Skeleton - Complete authentication and first page       │
│ Period: 2024-01-15 → 2024-01-29 (Day 8/14)                     │
└──────────────────────────────────────────────────────────────────┘

══════════════════════════════════════════════════════════════════════════
📈 OVERVIEW

Overall progress:
██████████████░░░░░░░░░░░░░░░░░░ 45%

│ Metric            │ Current│ Target │ Status │
├───────────────────┼────────┼────────┼────────┤
│ Points completed  │ 5      │ 10     │ 🟡 50% │
│ Tasks completed   │ 8      │ 16     │ 🟡 50% │
│ Hours completed   │ 28h    │ 62h    │ 🟡 45% │
│ Remaining days    │ 6      │ -      │        │

══════════════════════════════════════════════════════════════════════════
📖 PROGRESS BY USER STORY

│ US      │ Name               │ Points │ Tasks    │ Status          │
├─────────┼────────────────────┼────────┼──────────┼─────────────────┤
│ US-001  │ User login         │ 5      │ 6/10     │ 🟡 In Progress  │
│         │                    │        │ 60%      │ ██████░░░░      │
├─────────┼────────────────────┼────────┼──────────┼─────────────────┤
│ US-002  │ Product list       │ 5      │ 2/6      │ 🔴 To Do        │
│         │                    │        │ 33%      │ ███░░░░░░░      │

══════════════════════════════════════════════════════════════════════════
⏱️ TIME METRICS

Estimated vs Actual (hours):
│ Type    │ Est.   │ Actual │ Diff   │
├─────────┼────────┼────────┼────────┤
│ [DB]    │ 6h     │ 5.5h   │ -0.5h  │ ✅
│ [BE]    │ 20h    │ 12h    │ -      │ 🟡 In progress
│ [FE-WEB]│ 12h    │ 3h     │ -      │ 🟡 In progress
│ [FE-MOB]│ 14h    │ 0h     │ -      │ ⏸️ Blocked
│ [TEST]  │ 10h    │ 7.5h   │ -2.5h  │ ✅ Under-estimated

Daily velocity: 4h/day (target: 4.4h/day)

══════════════════════════════════════════════════════════════════════════
📉 BURNDOWN (simplified)

Remaining hours per day:
62h │████████████████████████████████████████████████████████████████
    │█████████████████████████████████████████████████████░░░░░░░░░░░
    │██████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░
    │█████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │█████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ← Ideal
34h │████████████████████████████████████████████████ ← Actual
    └───────────────────────────────────────────────────────────────
    D1  D2  D3  D4  D5  D6  D7  D8  D9  D10 D11 D12 D13 D14

Status: 🟡 Slightly behind (6h)

══════════════════════════════════════════════════════════════════════════
⚠️ BLOCKERS

│ Task     │ US     │ Blocker                     │ Since  │
├──────────┼────────┼─────────────────────────────┼────────┤
│ TASK-008 │ US-001 │ Waiting for auth API        │ 2 days │
│ TASK-021 │ US-002 │ Missing SMTP config         │ 1 day  │

Impact: 14h blocked (22% of sprint)

══════════════════════════════════════════════════════════════════════════
🚨 RISKS

│ Level  │ Description                           │ Mitigation              │
├────────┼───────────────────────────────────────┼─────────────────────────┤
│ 🔴 High│ Mobile blocked for 2 days             │ Prioritize TASK-005     │
│ 🟡 Med │ 6h behind schedule                    │ Possible overtime       │
│ 🟢 Low │ Tests under-estimated                 │ Add buffer sprint 2     │

══════════════════════════════════════════════════════════════════════════
📋 RECOMMENDED ACTIONS

1. 🔴 URGENT: Unblock TASK-008 by completing TASK-005
2. 🟡 Configure SMTP to unblock TASK-021
3. 🟢 Review test estimations for future sprints

══════════════════════════════════════════════════════════════════════════

Actions:
  /project:board                    # View Kanban
  /project:move-task TASK-XXX done  # Complete a task
  /project:list-tasks status blocked # View all blockers
```

## BMAD Output (with --bmad)

When `--bmad` is specified, the report additionally includes:

```
State Machine:
------------------------------------------------------
[backlog 2] -> [ready-for-dev 3] -> [in-progress 2] -> [review 1] -> [done 4]
                                        |
                                     [blocked 1]

In Progress:
------------------------------------------------------
US-005: User authentication
   TDD: Green | Tasks: 3/5 | AC: 1/3
   Current: TASK-015 - Implement JWT validation

US-007: Password reset
   TDD: Red | Tasks: 0/4 | AC: 0/2
   Current: Writing first test

Auto-routing suggestions:
------------------------------------------------------
US-008 has all tasks complete -> /sprint:transition US-008 review
```

## Examples

```
# Current sprint status
/sprint:status

# Sprint 2 status
/sprint:status sprint 2

# Sprint status with BMAD state machine
/sprint:status --bmad

# Verbose BMAD status
/sprint:status --bmad --verbose
```

## Report Generation

Report is also saved in:
`project-management/sprints/sprint-XXX/status-YYYY-MM-DD.md`

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /sprint:next-story                                    ║
║    Pick the next story to work on                        ║
║                                                          ║
║  → /sprint:dev                                           ║
║    Continue development                                  ║
║                                                          ║
║  → /workflow:review                                      ║
║    Sprint review (if sprint is complete)                 ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
