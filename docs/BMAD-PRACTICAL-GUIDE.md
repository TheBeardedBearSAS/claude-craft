# BMAD v6 Practical Guide

A step-by-step guide to using BMAD (Build, Measure, Analyze, Deliver) project management in Claude Craft.

---

## What is BMAD?

BMAD v6 is Claude Craft's integrated project management framework that brings Agile methodology directly into your AI-assisted development workflow.

### Key Features

- **9 Specialized Agents** - Each with distinct expertise (PM, BA, Architect, PO, SM, Dev, QA, UX, BMAD Master)
- **Status-based Routing** - Stories automatically flow through a state machine
- **5 Quality Gates** - Validation checkpoints at each phase
- **Batch Processing** - Queue and execute multiple stories
- **TDD Phase Tracking** - Red → Green → Refactor cycle per story

---

## Getting Started

### Initialize BMAD in Your Project

```bash
# Start Claude Code in your project
cd ~/my-project
claude

# Initialize BMAD
/bmad:init
```

This creates:
```
.bmad/
├── config.yaml           # BMAD configuration
├── sprint-status.yaml    # Current sprint state
├── backlog/              # Story files
│   ├── EPIC-001.md
│   └── US-001.md
└── hooks/                # Claude Code hooks
    ├── sprint-context.sh
    ├── story-status.sh
    └── quality-gate.sh
```

### Check Status

```bash
/bmad:status
```

---

## The 9 BMAD Agents

### BMAD Master (`@bmad-master`)

**Role:** Central orchestrator and coordinator

**When to use:**
- Starting a new project phase
- Routing work to appropriate agents
- Checking overall project status
- Coordinating multi-agent workflows

```
@bmad-master Initialize the project with BMAD methodology
@bmad-master Route this feature request to the right agent
@bmad-master What's the current project status?
```

**Key Commands:**
- `/bmad:init` - Initialize BMAD
- `/bmad:status` - Show status
- `/bmad:route` - Route to agent
- `/bmad:handoff` - Handoff between agents

---

### Product Manager (`@pm`)

**Role:** Product strategy and PRD creation

**When to use:**
- Defining product vision
- Creating Product Requirements Documents
- Prioritizing features
- Setting success metrics

```
@pm Create a PRD for user authentication feature
@pm Prioritize these features for next quarter
@pm Define OKRs for the mobile app launch
```

**Key Commands:**
- `/pm:prd` - Create PRD
- `/pm:vision` - Define vision
- `/pm:roadmap` - Create roadmap
- `/pm:prioritize` - Prioritize features
- `/pm:okr` - Define OKRs

**Quality Gate:** PRD Gate (≥80%)

---

### Business Analyst (`@ba`)

**Role:** Requirements engineering and documentation

**When to use:**
- Gathering requirements
- Creating use cases
- Building user story maps
- Gap analysis

```
@ba Analyze requirements for the payment module
@ba Create a user story map for checkout flow
@ba What are the gaps between current and desired state?
```

**Key Commands:**
- `/ba:analyze` - Analyze requirements
- `/ba:use-cases` - Create use cases
- `/ba:story-map` - Build story map
- `/ba:gap-analysis` - Gap analysis
- `/ba:requirements` - Document requirements

---

### Architect (`@architect`)

**Role:** Technical architecture and design

**When to use:**
- Designing system architecture
- Creating technical specifications
- Defining API contracts
- Making architectural decisions

```
@architect Design the architecture for this feature
@architect Create an ADR for choosing JWT over sessions
@architect Design the database schema for orders
```

**Key Commands:**
- `/arch:design` - Design architecture
- `/arch:techspec` - Create tech spec
- `/arch:adr` - Document ADR
- `/arch:api` - Design API
- `/arch:database` - Design database
- `/arch:security` - Security review

**Quality Gate:** Tech Spec Gate (≥90%)

---

### Product Owner (`@po`)

**Role:** Backlog management and acceptance

**When to use:**
- Prioritizing backlog
- Writing user stories
- Defining acceptance criteria
- Accepting/rejecting work

```
@po Prioritize this backlog for the next sprint
@po Review and accept US-005
@po Refine these user stories
```

**Key Commands:**
- `/po:prioritize` - Prioritize backlog
- `/po:refine` - Refine stories
- `/po:accept` - Accept work
- `/po:reject` - Reject work
- `/po:release` - Plan release

---

### Scrum Master (`@sm`)

**Role:** Agile facilitation and team coordination

**When to use:**
- Planning sprints
- Running ceremonies
- Tracking velocity
- Removing impediments

```
@sm Plan sprint 3 with the team
@sm Run the sprint retrospective
@sm What's blocking the team?
```

**Key Commands:**
- `/sm:plan-sprint` - Plan sprint
- `/sm:daily` - Daily standup
- `/sm:review` - Sprint review
- `/sm:retro` - Retrospective
- `/sm:velocity` - Track velocity
- `/sm:burndown` - Show burndown

---

### Developer (`@dev`)

**Role:** TDD implementation and clean code

**When to use:**
- Implementing features
- Writing tests first (TDD)
- Code refactoring
- Code review

```
@dev Implement US-005 using TDD
@dev Refactor this service for better testability
@dev Review this pull request
```

**Key Commands:**
- `/dev:implement` - Implement feature
- `/dev:tdd` - TDD cycle
- `/dev:test` - Write tests
- `/dev:refactor` - Refactor code
- `/dev:review` - Code review
- `/dev:fix` - Fix bug

**TDD Phases:**
- 🔴 Red - Write failing test
- 🟢 Green - Implement to pass
- 🔵 Refactor - Clean up code

---

### QA Engineer (`@qa`)

**Role:** Quality assurance and test automation

**When to use:**
- Defining test strategy
- Validating acceptance criteria
- Automating tests
- Exploratory testing

```
@qa Validate acceptance criteria for US-005
@qa Create automated tests for the login flow
@qa What's the test coverage for the payment module?
```

**Key Commands:**
- `/qa:strategy` - Test strategy
- `/qa:validate` - Validate AC
- `/qa:automate` - Automate tests
- `/qa:explore` - Exploratory testing
- `/qa:report` - Quality report
- `/qa:bug` - Report bug

---

### UX Designer (`@ux`)

**Role:** User experience and accessibility

**When to use:**
- User research
- Creating personas and journeys
- Designing wireframes
- Accessibility audits

```
@ux Design the user journey for onboarding
@ux Create personas for our target users
@ux Audit this page for accessibility
```

**Key Commands:**
- `/ux:research` - User research
- `/ux:persona` - Create persona
- `/ux:journey` - Map journey
- `/ux:wireframe` - Create wireframe
- `/ux:flow` - Design flow
- `/ux:accessibility` - A11y audit

---

## Quality Gates

Quality gates are validation checkpoints that ensure work meets standards before progressing.

### 1. PRD Gate (≥80%)

**When:** Vision → PRD

**Validates:**
- [ ] Problem statement defined
- [ ] Target users identified
- [ ] Goals and objectives clear
- [ ] Success metrics defined
- [ ] Scope boundaries set

```bash
/gate:validate-prd docs/prd.md
```

---

### 2. Tech Spec Gate (≥90%)

**When:** PRD → Technical Specification

**Validates:**
- [ ] Architecture documented
- [ ] API contracts defined
- [ ] Security considerations addressed
- [ ] Performance requirements set
- [ ] Testing strategy defined
- [ ] Deployment plan created

```bash
/gate:validate-techspec docs/tech-spec.md
```

---

### 3. Backlog Gate (INVEST 6/6)

**When:** Tech Spec → Backlog

**Validates each story for:**
- **I**ndependent - Can be developed separately
- **N**egotiable - Details can be discussed
- **V**aluable - Delivers user value
- **E**stimable - Can be estimated
- **S**mall - Fits in a sprint
- **T**estable - Has clear acceptance criteria

```bash
/gate:validate-backlog
```

---

### 4. Sprint Ready (100%)

**When:** Backlog → Sprint

**Validates:**
- [ ] Sprint goal defined
- [ ] All stories have estimates
- [ ] Stories are prioritized
- [ ] Dependencies identified
- [ ] Team capacity confirmed

```bash
/gate:validate-sprint
```

---

### 5. Story DoD (100%)

**When:** Development → Done

**Validates:**
- [ ] All tasks completed
- [ ] Tests passing
- [ ] Acceptance criteria met
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No blockers

```bash
/gate:validate-story US-005
```

---

### Full Gates Report

```bash
/gate:report
```

---

## Status-based Routing

Stories automatically transition through statuses:

```
┌─────────┐    ┌──────────────┐    ┌─────────────┐    ┌────────┐    ┌──────┐
│ backlog │───▶│ ready-for-dev │───▶│ in-progress │───▶│ review │───▶│ done │
└─────────┘    └──────────────┘    └─────────────┘    └────────┘    └──────┘
     │               │                    │               │
     └───────────────┴────────────────────┴───────────────┴──────▶ blocked
```

### Transition Commands

```bash
# View current status
/sprint:bmad-status

# Get next story ready for development
/sprint:next-story --claim

# Transition a story
/sprint:transition US-005 in-progress
/sprint:transition US-005 review
/sprint:transition US-005 done

# Block a story
/sprint:transition US-005 blocked --reason="Waiting for API"

# Run automatic routing rules
/sprint:auto-route
```

### TDD Phase Within In-Progress

When a story is `in-progress`, track the TDD phase:

```yaml
# In story frontmatter
status: in-progress
tdd_phase: red  # or green, refactor
```

Visual indicators:
- 🔴 **red** - Writing failing tests
- 🟢 **green** - Implementing to pass
- 🔵 **refactor** - Cleaning up code

---

## Batch Processing

Process multiple stories automatically.

### Queue an Epic

```bash
# Queue all stories from an epic
/project:run-epic EPIC-002
```

### Process the Queue

```bash
# Process stories in queue
/project:run-queue

# With parallel processing
/project:run-queue --parallel 3
```

### Execute Full Sprint

```bash
# Run entire sprint automatically
/project:run-sprint

# With auto-routing
/project:run-sprint --auto
```

### Check Batch Status

```bash
/project:batch-status
```

---

## Complete Workflow Example

### 1. Initialize Project

```bash
/bmad:init
@bmad-master Set up BMAD for a new e-commerce platform
```

### 2. Define Product (PM Phase)

```bash
@pm Create a PRD for the shopping cart feature
/gate:validate-prd docs/prd.md
```

### 3. Analyze Requirements (BA Phase)

```bash
@ba Analyze requirements and create user story map
```

### 4. Design Architecture (Architect Phase)

```bash
@architect Create technical specification from the PRD
/gate:validate-techspec docs/tech-spec.md
```

### 5. Prepare Backlog (PO Phase)

```bash
@po Create and prioritize user stories
/gate:validate-backlog
```

### 6. Plan Sprint (SM Phase)

```bash
@sm Plan sprint 1 with selected stories
/gate:validate-sprint
```

### 7. Implement (Dev Phase)

```bash
# Get next story
/sprint:next-story --claim

# Implement with TDD
@dev Implement US-001 using TDD

# 🔴 Red - Write failing test
/sprint:transition US-001 in-progress
# Write test...

# 🟢 Green - Implement
# Write code to pass...

# 🔵 Refactor - Clean up
# Refactor...

# Move to review
/sprint:transition US-001 review
```

### 8. Validate (QA Phase)

```bash
@qa Validate acceptance criteria for US-001
/gate:validate-story US-001
```

### 9. Complete

```bash
/sprint:transition US-001 done
```

---

## Tips for Success

### 1. Start Simple

Begin with `/workflow:init --quick` for bug fixes before using full BMAD.

### 2. Use Quality Gates

Don't skip gates - they catch issues early.

### 3. Let Agents Collaborate

Use handoffs:
```bash
@bmad-master Handoff from PM to Architect for technical design
```

### 4. Track TDD Phases

Update `tdd_phase` in story frontmatter to track progress.

### 5. Review Metrics

```bash
/sm:velocity
/sm:burndown
/bmad:status
```

---

## Configuration

### .bmad/config.yaml

```yaml
version: 2
project:
  name: "My Project"
  methodology: "scrum"

quality_gates:
  prd:
    threshold: 80
    enabled: true
  tech_spec:
    threshold: 90
    enabled: true
  backlog:
    invest_required: true
  story:
    dod_required: true

routing:
  auto_route: true
  rules:
    - from: backlog
      to: ready-for-dev
      condition: "has_estimate && has_ac"
    - from: ready-for-dev
      to: in-progress
      condition: "claimed_by_dev"

tdd:
  enforce: true
  phases: ["red", "green", "refactor"]
```

---

## Troubleshooting

### "No sprint-status.yaml found"

```bash
/bmad:init
```

### Quality gate always fails

Check required fields:
```bash
/gate:report
```

### Stories not transitioning

Verify status flow is valid:
- `backlog` → `ready-for-dev` (not direct to `in-progress`)

---

## See Also

- [Commands Reference](COMMANDS.md)
- [Agents Reference](AGENTS.md)
- [Ralph Wiggum Guide](RALPH-GUIDE.md)
- [Workflow Methodology](../README.md#workflow-methodology)
