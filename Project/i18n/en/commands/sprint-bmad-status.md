---
description: Display BMAD sprint status with routing information
argument-hint: [--verbose]
---

# Sprint BMAD Status

Display comprehensive sprint status using BMAD v6 tracking with state machine routing.

## Arguments

$ARGUMENTS (format: [--verbose])
- **--verbose** (optional): Show detailed task breakdown per story

## Process

### Step 1: Load sprint-status.yaml

1. Read `.bmad/sprint-status.yaml`
2. Parse metadata, stories, routing rules
3. If file doesn't exist, prompt for `/project:migrate-backlog`

### Step 2: Extract metadata

Display sprint information:
- Sprint ID and name
- Start and end dates
- Sprint goal
- Days remaining

### Step 3: Count stories by status

Aggregate stories across all states:
- 📋 Backlog
- 🎯 Ready for Dev
- 🔄 In Progress
- 👀 Review
- ✅ Done
- ⛔ Blocked

Calculate:
- Total story points planned
- Story points completed
- Velocity (if historical data)
- Burndown progress

### Step 4: Show state machine

Display current routing state:
```
backlog → ready-for-dev → in-progress → review → done
   ↓          ↓              ↓           ↓
   └──────────┴──────────────┴───────────┴→ blocked
```

Highlight stories at each state.

### Step 5: Show detailed view (if --verbose)

For each story:
- Story ID and title
- Current status and TDD phase
- Tasks breakdown (completed/total)
- Acceptance criteria status
- Current task being worked on
- Time in current status

### Step 6: Auto-routing suggestions

Check if any automatic transitions should occur:
- Stories with all tasks complete → suggest move to review
- Stories unblocked → suggest resuming previous status
- Stories in review too long → highlight

## Output Format

```
═══════════════════════════════════════════════════════
                  BMAD Sprint Status
═══════════════════════════════════════════════════════

Sprint: {SPRINT_ID} - {SPRINT_NAME}
Period: {START_DATE} → {END_DATE} ({DAYS_REMAINING} days left)
Goal: {SPRINT_GOAL}

Progress: ▓▓▓▓▓▓▓▓░░░░░░░░░░░░ 40% (24/60 pts)

Stories by Status:
──────────────────────────────────────────────────────
📋 Backlog:       2
🎯 Ready for Dev: 3
🔄 In Progress:   2
👀 Review:        1
✅ Done:          4
⛔ Blocked:       1

State Machine:
──────────────────────────────────────────────────────
[📋 2] → [🎯 3] → [🔄 2] → [👀 1] → [✅ 4]
                     ↓
                  [⛔ 1]

In Progress:
──────────────────────────────────────────────────────
🔄 US-005: User authentication
   TDD: 🟢 Green | Tasks: 3/5 | AC: 1/3
   Current: TASK-015 - Implement JWT validation

🔄 US-007: Password reset
   TDD: 🔴 Red | Tasks: 0/4 | AC: 0/2
   Current: Writing first test

Blocked:
──────────────────────────────────────────────────────
⛔ US-003: OAuth integration
   Reason: Waiting for API credentials
   Blocked since: 2026-01-27 (2 days)

Auto-routing suggestions:
──────────────────────────────────────────────────────
💡 US-008 has all tasks complete → /sprint:transition US-008 review

Commands:
  /sprint:next-story         Pick next story
  /sprint:transition <ID>    Change status
  /sprint:auto-route        Apply auto transitions
═══════════════════════════════════════════════════════
```

## Example

```
/sprint:bmad-status
/sprint:bmad-status --verbose
```

## Integration

This command reads from `.bmad/sprint-status.yaml` which is maintained by:
- `/project:migrate-backlog` - Initial creation
- `/project:sync-backlog` - Sync with markdown files
- `/sprint:transition` - Status changes
- Development workflows - Task/AC completion
