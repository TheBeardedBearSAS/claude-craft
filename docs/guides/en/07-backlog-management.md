# Backlog Management Guide

Complete workflow for creating and managing a SCRUM backlog with Claude-Craft.

---

## Overview

Claude-Craft provides a comprehensive set of commands for managing your product backlog following SCRUM methodology:

- **One `/project:backlog` command** (`add`, `list`, `edit`, `move`, plus `next story` and `move story --auto` for story routing) together with `/workflow:plan --only=backlog`, `/workflow:start` and `/workflow:status --board`; the old `/project:add-*`, `list-*`, `update-*`, `move-task`, `/project:generate-backlog`, `/project:decompose-tasks`, `/project:board` and `/sprint:*` commands are deprecated stubs removed in 9.0
- **5 templates** for consistent structure
- **Vertical slicing** enforcement across all tech layers
- **INVEST model** validation for User Stories

### Philosophy

Based on:
- Agile Manifesto principles
- 12 Agile Principles
- SCRUM fundamentals
- Vertical slicing (every US touches all layers)

---

## Initial Backlog Generation

### From Specifications

Place your project specifications in `./docs/` then run:

```bash
/workflow:plan --only=backlog symfony+flutter
```

### Generated Structure

```
project-management/
├── README.md                    # Project overview
├── personas.md                  # User personas (min. 3)
├── definition-of-done.md        # Progressive DoD levels
├── dependencies-matrix.md       # Epic and US dependencies
├── backlog/
│   ├── epics/                   # EPIC-XXX-name.md files
│   └── user-stories/            # US-XXX-name.md files
└── sprints/
    └── sprint-XXX-goal/         # Sprint plans
```

---

## SCRUM Structure

### Personas

Minimum 3 personas required, each with:
- **Identity**: Name, role, demographics
- **Goals**: What they want to achieve
- **Frustrations**: Pain points to solve

Format: `P-001`, `P-002`, `P-003`...

### EPICs

Large features containing multiple User Stories:

| Field | Description |
|-------|-------------|
| ID | Unique identifier (EPIC-001, EPIC-002...) |
| MMF | Minimum Marketable Feature |
| Status | Draft, Ready, In Progress, Done |
| Business Objectives | Why this EPIC matters |
| Success Criteria | How to measure success |

### User Stories

Follow the **INVEST** model:

| Letter | Meaning | Validation |
|--------|---------|------------|
| **I** | Independent | No dependencies on other US |
| **N** | Negotiable | Details can be discussed |
| **V** | Valuable | Delivers user value |
| **E** | Estimable | Can be sized in points |
| **S** | Sized | Max 8 story points |
| **T** | Testable | Has clear acceptance criteria |

#### The 3 Cs

1. **Card**: Brief description
2. **Conversation**: Discussion details
3. **Confirmation**: Acceptance criteria

#### Acceptance Criteria (Gherkin)

Each US requires:
- 1 nominal scenario (happy path)
- 2 alternative scenarios
- 2 error scenarios

```gherkin
Scenario: User logs in successfully
  Given a registered user with valid credentials
  When they submit the login form
  Then they should see their dashboard
  And a session should be created
```

### Tasks

Technical work items within a User Story:

| Type | Description | Typical Duration |
|------|-------------|------------------|
| `[DB]` | Database (entities, migrations) | 1-3h |
| `[BE]` | Backend (services, APIs) | 2-4h |
| `[FE-WEB]` | Frontend Web (controllers, templates) | 2-4h |
| `[FE-MOB]` | Frontend Mobile (screens, blocs) | 3-5h |
| `[TEST]` | Testing (unit, integration, E2E) | 2-4h |
| `[DOC]` | Documentation | 0.5-1h |
| `[OPS]` | DevOps (CI/CD, deployment) | 1-2h |
| `[REV]` | Code review | 1-2h |

**Estimation rules:**
- Task duration: 0.5h - 8h max
- Story points (Fibonacci): 1, 2, 3, 5, 8, 13, 21
- Max US size: 8 points (split if larger)

---

## Workflow

### Status Flow

```
┌─────────┐     ┌─────────────┐     ┌──────┐
│  To Do  │ ──→ │ In Progress │ ──→ │ Done │
└─────────┘     └─────────────┘     └──────┘
     │                │
     │                ↓
     └────────→ ┌─────────┐
                │ Blocked │
                └─────────┘
                     │
                     ↓
              ┌─────────────┐
              │ In Progress │
              └─────────────┘
```

**Forbidden transitions:**
- To Do → Done (must go through In Progress)
- Any → To Do (except manual reopen)

---

## Commands Reference

### Creation Commands

| Command | Description |
|---------|-------------|
| `/workflow:plan --only=backlog [stack]` | Generate complete backlog from specs |
| `/project:backlog add epic` | Create a new EPIC |
| `/project:backlog add story` | Add a User Story to an EPIC |
| `/project:backlog add task` | Create a technical task for a US |

### Viewing Commands

| Command | Description |
|---------|-------------|
| `/project:backlog list epic` | Display all EPICs with status |
| `/project:backlog list story [filter]` | List User Stories (by EPIC, Sprint, Status) |
| `/project:backlog list task [filter]` | List tasks (by US, Sprint, Type, Status) |
| `/workflow:status --board [sprint]` | Show Kanban board |
| `/workflow:status [sprint]` | Detailed sprint progress report |

### Update Commands

| Command | Description |
|---------|-------------|
| `/project:backlog move story [id] [status/sprint]` | Change US status or assign to sprint |
| `/project:backlog move task [id] [status]` | Change task status |
| `/project:backlog edit epic [id]` | Modify an existing EPIC |
| `/project:backlog edit story [id]` | Modify an existing User Story |

### Advanced Commands

| Command | Description |
|---------|-------------|
| `/workflow:start [sprint]` | Break down sprint US into tasks |
| `/gate:check backlog` | Audit backlog quality (SCRUM compliance) |

---

## Complete Example: New Project

### Step 1: Generate Initial Backlog

```bash
# Ensure specs are in ./docs/
/workflow:plan --only=backlog symfony+flutter
```

### Step 2: Validate Quality

```bash
/gate:check backlog
```

This generates `scrum-validation-report.md` with:
- INVEST compliance score
- 3 Cs verification
- SMART criteria analysis
- Estimation consistency

### Step 3: Review Sprint 1

```bash
/workflow:status --board 1
```

Displays Kanban board with columns:
- To Do | In Progress | In Review | Done | Blocked

### Step 4: Decompose into Tasks

```bash
/workflow:start 1
```

Creates detailed task breakdown:
- Tasks grouped by US
- Dependency graph (Mermaid)
- Time estimates per layer

### Step 5: Start Working

```bash
# Move first task to in progress
/project:backlog move task TASK-001 in-progress

# Later, mark as done
/project:backlog move task TASK-001 done

# If blocked
/project:backlog move task TASK-002 blocked "Waiting for API specs"
```

### Step 6: Track Progress

```bash
/workflow:status 1
```

### Step 7: Set Up Recurring Monitoring (Optional)

Use `/loop` (v2.1.71+) to automatically monitor sprint progress:

```bash
# Check sprint status every 30 minutes
/loop 30m /workflow:status 1

# Run pre-commit checks every 5 minutes during development
/loop 5m /gate:check commit
```

Alias: `/proactive` (v2.1.105+).

Shows:
- Overall progress and burndown
- Metrics by User Story
- Blockers and risks
- Recommended actions

---

## Templates

Claude-Craft provides 5 templates for consistent backlog structure:

| Template | Purpose |
|----------|---------|
| `epic.md` | EPIC file structure with metadata, objectives, US list |
| `user-story.md` | US structure with Gherkin criteria, tasks table |
| `task.md` | Task structure with DoD checklist |
| `board.md` | Kanban board with metrics calculation |
| `index.md` | Backlog index with global summary |

---

## SCRUM Rules Enforced

| Rule | Value |
|------|-------|
| Sprint duration | 2 weeks (fixed) |
| Velocity | 20-40 points/sprint |
| Max US size | 8 points (split if larger) |
| Estimation scale | Fibonacci (1, 2, 3, 5, 8, 13, 21) |
| Task duration | 0.5h - 8h max |

### Sprint 1: Walking Skeleton

The first sprint must include:
- Complete infrastructure setup
- 1 end-to-end feature (not just setup)
- Testable on both Web and Mobile

### Vertical Slicing

**Every User Story MUST traverse all layers:**

```
UI (Web/Mobile) → API → Business Logic → Database
```

No "Backend only", "Frontend only", or "Mobile only" User Stories allowed.

---

## Checklist: Backlog Ready

- [ ] Minimum 3 personas defined
- [ ] EPICs have MMF and success criteria
- [ ] User Stories follow INVEST model
- [ ] Acceptance criteria in Gherkin format
- [ ] Stories estimated in Fibonacci points
- [ ] Sprint 1 = Walking Skeleton
- [ ] Definition of Done documented
- [ ] Backlog validated (`/gate:check backlog`)

---

[&larr; Troubleshooting](06-troubleshooting.md) | [Next: Setup New Project &rarr;](08-setup-new-project.md)
