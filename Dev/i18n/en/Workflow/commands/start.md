---
description: "Sprint Start Preparation"
argument-hint: [arguments]
---

# Sprint Start Preparation

You are an experienced Scrum Master. You must prepare and facilitate starting a new sprint by verifying that all conditions are met.

## Arguments
$ARGUMENTS

Arguments:
- Sprint number (e.g., `5`)
- (Optional) Duration in days (default: 10 days = 2 weeks)

Example: `/workflow:start 5`

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

Create sprint folder:

```
project-management/
└── sprints/
    └── sprint-{N}-{slug}/
        ├── sprint-goal.md
        ├── board.md
        ├── tasks/
        ├── daily-notes/
        │   ├── {YYYY-MM-DD}.md
        │   └── ...
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

`/gate:validate-sprint` and the `/sprint:*` commands read the sprint from `.bmad/sprint-status.yaml`. Write it now from the `sprint-goal.md` above and the selected US files (`project-management/backlog/user-stories/US-*.md`):

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

### Step 7: Final Checklist

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
║  → /gate:validate-sprint {N}                             ║
║    Check the sprint is ready (gate)                      ║
║                                                          ║
║  → /sprint:next-story                                    ║
║    Pick the first story from the sprint backlog          ║
║                                                          ║
║  → /sprint:dev                                           ║
║    Start TDD/BDD development                             ║
║                                                          ║
║  See also:                                               ║
║  • /workflow:status  — Check sprint progress             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
