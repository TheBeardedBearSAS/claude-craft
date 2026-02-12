---
name: workflow-init
description: Analyze project context and recommend the optimal development workflow track
arguments:
  - name: scope
    description: Optional scope hint (bug, feature, platform, migration)
    required: false
  - name: track
    description: Force a specific track (--quick, --standard, --enterprise)
    required: false
---

# /workflow:init

## Mission

Analyze the current project context and recommend the optimal development workflow track. Initialize workflow tracking and guide the user through the appropriate phases.

## Workflow

### Step 1: Context Discovery

```
╔══════════════════════════════════════════════════════════╗
║             WORKFLOW INITIALIZATION                       ║
╠══════════════════════════════════════════════════════════╣
║ Analyzing project context...                              ║
╚══════════════════════════════════════════════════════════╝
```

**Analyze:**

1. **Project Structure**
   - Check for `.claude/` directory
   - Detect technology stack from files
   - Identify framework (Symfony, Flutter, React, etc.)

2. **Existing Documentation**
   - `project-management/prd.md` - PRD exists?
   - `project-management/tech-spec.md` - Tech Spec exists?
   - `project-management/backlog/` - Backlog exists?
   - `README.md` - Project description

3. **Codebase Size**
   - Count source files
   - Estimate complexity
   - Identify components/modules

4. **Git Context**
   - Current branch
   - Recent commits
   - Open changes

### Step 2: Complexity Assessment

**Scoring Matrix:**

| Factor | Quick (1) | Standard (2) | Enterprise (3) |
|--------|-----------|--------------|----------------|
| Files to modify | 1-5 | 5-50 | 50+ |
| New entities/tables | 0 | 1-3 | 4+ |
| External integrations | 0 | 1 | 2+ |
| User stories estimated | 1-3 | 3-15 | 15+ |
| Teams involved | 1 | 1 | 2+ |
| Security implications | Low | Medium | High |

**Calculate Score:**
- Score 6-8: Quick Flow
- Score 9-14: Standard
- Score 15+: Enterprise

### Step 3: Track Recommendation

```
╔══════════════════════════════════════════════════════════╗
║               PROJECT ANALYSIS COMPLETE                   ║
╠══════════════════════════════════════════════════════════╣
║ Project: my-awesome-app                                   ║
║ Stack: Symfony 7.x + React 18                             ║
║ Status: Existing project with backlog                     ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ COMPLEXITY ASSESSMENT:                                    ║
║ ├── Files impacted:      ~25        [Standard]            ║
║ ├── New entities:        2          [Standard]            ║
║ ├── Integrations:        1 (Stripe) [Standard]            ║
║ ├── Estimated stories:   8          [Standard]            ║
║ ├── Teams:               1          [Quick]               ║
║ └── Security:            High       [Enterprise]          ║
║                                                           ║
║ ═══════════════════════════════════════════════════════  ║
║ RECOMMENDED TRACK: STANDARD                               ║
║ ═══════════════════════════════════════════════════════  ║
║                                                           ║
║ Reasoning:                                                ║
║ • Feature scope requires planning (8 stories)             ║
║ • External integration needs tech design                  ║
║ • Security implications require careful architecture      ║
║ • Single team can handle without full enterprise process  ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 4: Phase Planning

Based on track, show the workflow:

**Quick Flow:**
```
╔══════════════════════════════════════════════════════════╗
║              QUICK FLOW WORKFLOW                          ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────────────┐                                     ║
║  │  IMPLEMENTATION  │ ← Start here                        ║
║  └──────────────────┘                                     ║
║                                                           ║
║ No documentation required. Direct to coding.              ║
║                                                           ║
║ Commands:                                                 ║
║ • /common:fix-bug-tdd    - Fix with TDD                   ║
║ • /project:add-task      - Track the work                 ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

**Standard:**
```
╔══════════════════════════════════════════════════════════╗
║              STANDARD WORKFLOW                            ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────┐    ┌──────────┐    ┌──────────────┐        ║
║  │ PLANNING │ →  │  DESIGN  │ →  │IMPLEMENTATION│        ║
║  └──────────┘    └──────────┘    └──────────────┘        ║
║       ↑                                                   ║
║   Start here                                              ║
║                                                           ║
║ Phase 1 - Planning:                                       ║
║ • /project:generate-prd    - Create/update PRD            ║
║ • /project:generate-backlog - Create user stories         ║
║                                                           ║
║ Phase 2 - Design:                                         ║
║ • /project:generate-tech-spec - Technical design          ║
║                                                           ║
║ Phase 3 - Implementation:                                 ║
║ • /project:sprint-dev      - TDD/BDD development          ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

**Enterprise:**
```
╔══════════════════════════════════════════════════════════╗
║              ENTERPRISE WORKFLOW                          ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌────────────┐  ║
║  │ ANALYSIS │→ │ PLANNING │→ │ DESIGN │→ │IMPLEMENTATION│ ║
║  └──────────┘  └──────────┘  └────────┘  └────────────┘  ║
║       ↑                                                   ║
║   Start here                                              ║
║                                                           ║
║ Phase 1 - Analysis:                                       ║
║ • /workflow:analyze        - Research & exploration       ║
║                                                           ║
║ Phase 2 - Planning:                                       ║
║ • /project:generate-prd    - Full PRD                     ║
║ • /project:generate-backlog - Complete backlog            ║
║                                                           ║
║ Phase 3 - Design:                                         ║
║ • /project:generate-tech-spec - Full tech spec            ║
║ • /common:architecture-decision - ADRs                    ║
║                                                           ║
║ Phase 4 - Implementation:                                 ║
║ • /project:sprint-dev      - Sprint-by-sprint dev         ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 5: Initialize Tracking

Create workflow status file:

```yaml
# project-management/workflow-status.yaml
project: my-awesome-app
track: standard
initialized_at: 2026-01-07T10:00:00Z
current_phase: planning

phases:
  analysis:
    status: skipped
    reason: "Standard track - analysis not required"
  planning:
    status: pending
    artifacts:
      prd: pending
      personas: pending
      backlog: pending
  design:
    status: pending
    artifacts:
      tech_spec: pending
      architecture: pending
  implementation:
    status: pending

next_action: "Generate or update PRD"
next_command: "/project:generate-prd"
```

### Step 6: Prompt Next Action

```
╔══════════════════════════════════════════════════════════╗
║                    READY TO START                         ║
╠══════════════════════════════════════════════════════════╣
║ Workflow initialized: STANDARD track                      ║
║ Status file: project-management/workflow-status.yaml      ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ NEXT STEP: Planning Phase                                 ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Start with: /workflow:plan                                ║
║                                                           ║
║ Or jump to specific tasks:                                ║
║ • /project:generate-prd     - Create requirements doc     ║
║ • /project:generate-backlog - Create user stories         ║
║                                                           ║
║ Check progress anytime: /workflow:status                  ║
╚══════════════════════════════════════════════════════════╝
```

## Override Options

```bash
# Force specific track
/workflow:init --quick          # Force Quick Flow
/workflow:init --standard       # Force Standard
/workflow:init --enterprise     # Force Enterprise

# Provide scope hint
/workflow:init bug              # Hint: this is a bug fix
/workflow:init feature          # Hint: new feature
/workflow:init platform         # Hint: platform work
```

## Related Commands

- `/workflow:status` - Check current workflow progress
- `/workflow:plan` - Start planning phase
- `/workflow:design` - Start design phase
- `/workflow:implement` - Start implementation phase
- `/workflow:analyze` - Start analysis phase (Enterprise only)
