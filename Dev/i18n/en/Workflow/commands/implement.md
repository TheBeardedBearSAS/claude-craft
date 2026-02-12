---
name: workflow-implement
description: Execute the Implementation phase - sprint development with TDD/BDD
arguments:
  - name: sprint
    description: Specific sprint number to work on
    required: false
---

# /workflow:implement

## Mission

Execute the Implementation phase of the development workflow. This phase focuses on sprint-by-sprint development using TDD/BDD practices, following the technical design established in previous phases.

## When to Use

- After `/workflow:design` is complete (Standard/Enterprise tracks)
- After `/workflow:init` for Quick Flow track
- When ready to start coding

## Prerequisites

For Standard/Enterprise tracks:
- Tech Spec exists at `project-management/tech-spec.md`
- Backlog exists at `project-management/backlog/`
- Sprint structure defined in `project-management/sprints/`

For Quick Flow:
- Clear understanding of the bug/feature to implement

## Workflow

### Step 1: Implementation Setup

```
╔══════════════════════════════════════════════════════════╗
║           IMPLEMENTATION PHASE - STARTING                 ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Phase: 4 of 4 - Implementation                            ║
║                                                           ║
║ Objectives:                                               ║
║ • Execute sprint development with TDD/BDD                 ║
║ • Implement user stories following tech spec              ║
║ • Maintain code quality and test coverage                 ║
║ • Complete Definition of Done for each story              ║
╚══════════════════════════════════════════════════════════╝
```

### Step 2: Sprint Selection

```
╔══════════════════════════════════════════════════════════╗
║               SPRINT OVERVIEW                             ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Available Sprints:                                        ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 1: Walking Skeleton                           │  ║
║ │ Status: Ready to start                               │  ║
║ │ Stories: 5 | Points: 21                              │  ║
║ │ Focus: Infrastructure + first end-to-end feature     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 2: Core Features                              │  ║
║ │ Status: Planned                                      │  ║
║ │ Stories: 6 | Points: 28                              │  ║
║ │ Focus: User management, authentication               │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 3: Payment Integration                        │  ║
║ │ Status: Planned                                      │  ║
║ │ Stories: 4 | Points: 24                              │  ║
║ │ Focus: Stripe integration, checkout flow             │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Select sprint to work on (default: Sprint 1)              ║
╚══════════════════════════════════════════════════════════╝
```

### Step 3: Redirect to Sprint Development

For full sprint execution, this command redirects to the specialized sprint-dev command:

```
╔══════════════════════════════════════════════════════════╗
║           STARTING SPRINT DEVELOPMENT                     ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Invoking: /project:sprint-dev sprint-001-walking-skeleton ║
║                                                           ║
║ Sprint Development Mode Features:                         ║
║ • Mandatory plan mode before each task                    ║
║ • TDD cycle: RED → GREEN → REFACTOR                       ║
║ • Automatic status updates                                ║
║ • Conventional commits with story references              ║
║ • Definition of Done validation                           ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 4: Implementation Guidance

Provide context from design phase:

```
╔══════════════════════════════════════════════════════════╗
║           IMPLEMENTATION CONTEXT                          ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ From Tech Spec:                                           ║
║ ├── Architecture: Clean Architecture (Hexagonal)          ║
║ ├── API Style: REST with JSON:API                         ║
║ ├── Auth: JWT with refresh tokens                         ║
║ ├── Database: PostgreSQL with Doctrine ORM                ║
║ └── Testing: PHPUnit + Jest + Playwright                  ║
║                                                           ║
║ Relevant ADRs:                                            ║
║ ├── ADR-001: Database choice (PostgreSQL)                 ║
║ ├── ADR-002: API style (REST)                             ║
║ └── ADR-003: Authentication (JWT)                         ║
║                                                           ║
║ Code Standards:                                           ║
║ ├── Follow existing patterns in codebase                  ║
║ ├── Test coverage target: 80%                             ║
║ └── Use technology-specific rules:                        ║
║     /symfony:*, /react:*, etc.                            ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 5: Quick Flow Mode

For Quick Flow track (bug fixes, small features):

```
╔══════════════════════════════════════════════════════════╗
║           QUICK FLOW - DIRECT IMPLEMENTATION              ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ No sprint structure needed for Quick Flow.                ║
║                                                           ║
║ Available Commands:                                       ║
║                                                           ║
║ For Bug Fixes:                                            ║
║ • /common:fix-bug-tdd        - Fix with TDD approach      ║
║                                                           ║
║ For Small Features:                                       ║
║ • /{tech}:* commands         - Technology-specific        ║
║                                                           ║
║ Tracking:                                                 ║
║ • /project:add-task          - Track as task              ║
║ • /project:move-task done    - Mark complete              ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 6: Sprint Completion

After sprint completion:

```
╔══════════════════════════════════════════════════════════╗
║           SPRINT COMPLETE                                 ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Sprint 1: Walking Skeleton                                ║
║ Status: ✅ Complete                                       ║
║                                                           ║
║ Metrics:                                                  ║
║ ├── Stories completed: 5/5                                ║
║ ├── Points delivered: 21                                  ║
║ ├── Velocity: 21 pts/sprint                               ║
║ ├── Test coverage: 82%                                    ║
║ └── Commits: 23                                           ║
║                                                           ║
║ Artifacts:                                                ║
║ ├── sprint-review.md generated                            ║
║ └── sprint-retro.md template ready                        ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ NEXT ACTIONS:                                             ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ 1. /common:sprint-review     - Conduct sprint review      ║
║ 2. /common:sprint-retro      - Run retrospective          ║
║ 3. /workflow:implement 2     - Start Sprint 2             ║
║                                                           ║
║ Or check overall progress: /workflow:status               ║
╚══════════════════════════════════════════════════════════╝
```

### Step 7: Workflow Completion

When all sprints are done:

```
╔══════════════════════════════════════════════════════════╗
║           IMPLEMENTATION PHASE COMPLETE                   ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ All planned sprints completed!                            ║
║                                                           ║
║ Project Summary:                                          ║
║ ├── Total Sprints: 4                                      ║
║ ├── Total Stories: 18                                     ║
║ ├── Total Points: 89                                      ║
║ ├── Average Velocity: 22 pts/sprint                       ║
║ ├── Test Coverage: 84%                                    ║
║ └── Total Commits: 87                                     ║
║                                                           ║
║ Next Steps:                                               ║
║ • /common:release-checklist  - Prepare for release        ║
║ • /common:generate-changelog - Generate release notes     ║
║ • Deploy to staging/production                            ║
║                                                           ║
║ ═══════════════════════════════════════════════════════  ║
║           🎉 PROJECT WORKFLOW COMPLETE! 🎉                ║
║ ═══════════════════════════════════════════════════════  ║
╚══════════════════════════════════════════════════════════╝
```

## Agents Involved

- **tech-lead**: Task decomposition, architecture guidance
- **tdd-coach**: TDD/BDD methodology guidance
- **{tech}-reviewer**: Code review (Symfony, Flutter, React, Python, ReactNative)
- **devops-engineer**: CI/CD and deployment

## Related Commands

- `/workflow:design` - Previous phase
- `/workflow:status` - Check progress
- `/project:sprint-dev` - Full sprint development mode
- `/common:fix-bug-tdd` - Quick bug fixes
- `/common:sprint-review` - Sprint review ceremony
- `/common:sprint-retro` - Sprint retrospective
