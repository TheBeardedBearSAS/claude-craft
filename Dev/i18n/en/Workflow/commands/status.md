---
name: workflow-status
description: Display current workflow progress and next recommended actions
arguments:
  - name: verbose
    description: Show detailed status with all artifacts
    required: false
---

# /workflow:status

## Mission

Display the current state of the development workflow, including completed phases, current progress, and recommended next actions.

## Usage

```bash
/workflow:status           # Standard status view
/workflow:status --verbose # Detailed view with all artifacts
```

## Output Format

### Standard View

```
╔══════════════════════════════════════════════════════════════════╗
║                       WORKFLOW STATUS                             ║
╠══════════════════════════════════════════════════════════════════╣
║ Project: my-awesome-app                                           ║
║ Track: STANDARD                                                   ║
║ Started: 2026-01-07                                               ║
║ Current Phase: Design ████████████░░░░ 75%                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Phase 1: Analysis                                                ║
║  └── ⏭️  Skipped (Standard track)                                 ║
║                                                                   ║
║  Phase 2: Planning                                                ║
║  └── ✅ Complete                                                  ║
║      ├── PRD: ✅ Complete                                         ║
║      ├── Personas: ✅ 3 defined                                   ║
║      └── Backlog: ✅ 18 stories (89 pts)                          ║
║                                                                   ║
║  Phase 3: Design                                                  ║
║  └── 🔄 In Progress                                               ║
║      ├── Tech Spec: ✅ Complete                                   ║
║      ├── Architecture: ✅ C4 diagrams created                     ║
║      ├── API Design: 🔄 In Progress (18/24 endpoints)             ║
║      └── ADRs: ✅ 3 created                                       ║
║                                                                   ║
║  Phase 4: Implementation                                          ║
║  └── ⏳ Pending                                                   ║
║      └── Sprint 1: Ready to start (21 pts)                        ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ NEXT ACTION: Complete API design                                  ║
║ COMMAND: /workflow:design --continue                              ║
╚══════════════════════════════════════════════════════════════════╝
```

### Verbose View (--verbose)

```
╔══════════════════════════════════════════════════════════════════╗
║                   WORKFLOW STATUS (VERBOSE)                       ║
╠══════════════════════════════════════════════════════════════════╣
║ Project: my-awesome-app                                           ║
║ Track: STANDARD                                                   ║
║ Started: 2026-01-07T10:00:00Z                                     ║
║ Last Update: 2026-01-07T15:30:00Z                                 ║
║ Status File: project-management/workflow-status.yaml              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║ ══════════════════════════════════════════════════════════════   ║
║ PHASE 2: PLANNING (Complete)                                      ║
║ ══════════════════════════════════════════════════════════════   ║
║                                                                   ║
║ PRD: project-management/prd.md                                    ║
║ ├── Version: 1.0                                                  ║
║ ├── Functional Requirements: 12                                   ║
║ ├── Non-Functional Requirements: 8                                ║
║ ├── Success Metrics: 5 KPIs defined                               ║
║ └── Last Modified: 2026-01-07T11:00:00Z                           ║
║                                                                   ║
║ Personas: project-management/personas.md                          ║
║ ├── Primary: Business Owner, Freelancer                           ║
║ └── Secondary: Accountant                                         ║
║                                                                   ║
║ Backlog: project-management/backlog/                              ║
║ ├── EPICs: 4                                                      ║
║ │   ├── EPIC-001: User Management (21 pts)                        ║
║ │   ├── EPIC-002: Payment Integration (24 pts)                    ║
║ │   ├── EPIC-003: Reporting (23 pts)                              ║
║ │   └── EPIC-004: Notifications (21 pts)                          ║
║ ├── User Stories: 18                                              ║
║ │   ├── P0 (Must Have): 8 stories                                 ║
║ │   ├── P1 (Should Have): 6 stories                               ║
║ │   └── P2 (Nice to Have): 4 stories                              ║
║ └── Total Story Points: 89                                        ║
║                                                                   ║
║ Sprints Planned:                                                  ║
║ ├── Sprint 1: Walking Skeleton (21 pts) - 5 stories               ║
║ ├── Sprint 2: Core Features (28 pts) - 6 stories                  ║
║ ├── Sprint 3: Payments (24 pts) - 4 stories                       ║
║ └── Sprint 4: Polish (16 pts) - 3 stories                         ║
║                                                                   ║
║ ══════════════════════════════════════════════════════════════   ║
║ PHASE 3: DESIGN (In Progress - 75%)                               ║
║ ══════════════════════════════════════════════════════════════   ║
║                                                                   ║
║ Tech Spec: project-management/tech-spec.md ✅                     ║
║ ├── Version: 1.0                                                  ║
║ ├── Architecture: Clean Architecture (Hexagonal)                  ║
║ ├── Stack: Symfony 7.x + React 18 + PostgreSQL 16                 ║
║ └── Integrations: Stripe, SendGrid, AWS S3                        ║
║                                                                   ║
║ Architecture: project-management/architecture/ ✅                 ║
║ ├── c4-context.md - System context diagram                        ║
║ ├── c4-container.md - Container diagram                           ║
║ ├── c4-component.md - Component diagram                           ║
║ └── erd.md - Entity Relationship Diagram (8 entities)             ║
║                                                                   ║
║ API Design: project-management/architecture/api.md 🔄             ║
║ ├── Designed: 18 endpoints                                        ║
║ ├── Remaining: 6 endpoints                                        ║
║ └── Auth: JWT with refresh tokens                                 ║
║                                                                   ║
║ ADRs: docs/adr/ ✅                                                ║
║ ├── ADR-001: Database (PostgreSQL)                                ║
║ ├── ADR-002: API Style (REST)                                     ║
║ └── ADR-003: Authentication (JWT)                                 ║
║                                                                   ║
║ Security: project-management/architecture/security.md ⏳          ║
║ └── Status: Pending                                               ║
║                                                                   ║
║ ══════════════════════════════════════════════════════════════   ║
║ PHASE 4: IMPLEMENTATION (Pending)                                 ║
║ ══════════════════════════════════════════════════════════════   ║
║                                                                   ║
║ Sprint 1: sprint-001-walking-skeleton                             ║
║ ├── Status: Ready to start                                        ║
║ ├── Stories: 5                                                    ║
║ ├── Points: 21                                                    ║
║ └── Tasks: 0 (not yet decomposed)                                 ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ WORKFLOW HEALTH                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ ✅ PRD aligns with backlog                                        ║
║ ✅ Tech spec covers all requirements                              ║
║ ✅ Architecture documented                                        ║
║ ⚠️  API design incomplete (6 endpoints remaining)                 ║
║ ⚠️  Security review pending                                       ║
╠══════════════════════════════════════════════════════════════════╣
║ NEXT ACTIONS                                                      ║
╠══════════════════════════════════════════════════════════════════╣
║ 1. Complete API design (6 remaining endpoints)                    ║
║    Command: /workflow:design --continue                           ║
║                                                                   ║
║ 2. Complete security review                                       ║
║    Command: (included in design phase)                            ║
║                                                                   ║
║ 3. Then start implementation                                      ║
║    Command: /workflow:implement                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

### No Workflow Initialized

```
╔══════════════════════════════════════════════════════════════════╗
║                       WORKFLOW STATUS                             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ⚠️  No workflow initialized for this project                     ║
║                                                                   ║
║  To get started, run:                                             ║
║                                                                   ║
║    /workflow:init                                                 ║
║                                                                   ║
║  This will:                                                       ║
║  • Analyze your project context                                   ║
║  • Recommend the appropriate track (Quick/Standard/Enterprise)    ║
║  • Initialize workflow tracking                                   ║
║  • Guide you through the development phases                       ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

### Quick Flow Status

```
╔══════════════════════════════════════════════════════════════════╗
║                       WORKFLOW STATUS                             ║
╠══════════════════════════════════════════════════════════════════╣
║ Project: my-awesome-app                                           ║
║ Track: QUICK FLOW                                                 ║
║ Started: 2026-01-07                                               ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Quick Flow - Direct Implementation                               ║
║  └── 🔄 In Progress                                               ║
║                                                                   ║
║  No phases required for Quick Flow.                               ║
║  Working directly on implementation.                              ║
║                                                                   ║
║  Current Task (if tracked):                                       ║
║  └── TASK-042: Fix login validation bug                           ║
║      Status: In Progress                                          ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ COMMANDS AVAILABLE                                                ║
╠══════════════════════════════════════════════════════════════════╣
║ • /common:fix-bug-tdd     - Continue with TDD approach            ║
║ • /project:move-task done - Mark task complete                    ║
║ • /workflow:init          - Start new workflow                    ║
╚══════════════════════════════════════════════════════════════════╝
```

## Status File Structure

The status is read from `project-management/workflow-status.yaml`:

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
      personas:
        status: complete
        path: project-management/personas.md
        count: 3
      backlog:
        status: complete
        path: project-management/backlog/
        epics: 4
        stories: 18
        points: 89
  design:
    status: in_progress
    started_at: 2026-01-07T12:00:00Z
    progress: 75
    artifacts:
      tech_spec:
        status: complete
        path: project-management/tech-spec.md
      architecture:
        status: complete
        path: project-management/architecture/
      api_design:
        status: in_progress
        progress: "18/24 endpoints"
      adrs:
        status: complete
        count: 3
        path: docs/adr/
      security:
        status: pending
  implementation:
    status: pending
    sprints:
      - name: sprint-001-walking-skeleton
        status: pending
        points: 21
        stories: 5

next_action: "Complete API design"
next_command: "/workflow:design --continue"
```

## Related Commands

- `/workflow:init` - Initialize new workflow
- `/workflow:analyze` - Analysis phase
- `/workflow:plan` - Planning phase
- `/workflow:design` - Design phase
- `/workflow:implement` - Implementation phase
