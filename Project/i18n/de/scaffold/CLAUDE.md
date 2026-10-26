# Claude Code Configuration - Project Management

## Available agents

### 🎯 Product Owner (`@po`)
Expert in backlog management, personas, User Stories and prioritization.
- CSPO certified (Certified Scrum Product Owner)
- Skilled in: INVEST, 3C, Gherkin, SMART, MoSCoW, MMF

### 🔧 Tech Lead (`@tech`)
Expert in architecture, technical decomposition and Scrum facilitation.
- CSM certified (Certified Scrum Master)
- Skilled in: Hexagonal Architecture{{STACK_SKILLS}}

## Custom commands

### Backlog Generation & Management (`/project:`)

| Command | Description |
|---------|-------------|
| `/project:generate-backlog` | Generate the full backlog |
| `/project:decompose-tasks N` | Break sprint N into tasks |
| `/project:migrate --analyze` | Analyze the existing backlog |
| `/project:migrate` | Migrate an existing backlog |
| `/project:migrate --resync` | Synchronize the backlog index |

### EPIC Management (`/project:`)

| Command | Description |
|---------|-------------|
| `/project:backlog add epic "Name"` | Create a new EPIC |
| `/project:backlog list epic` | List all EPICs |
| `/project:backlog edit epic EPIC-XXX` | Edit an EPIC |

### User Story Management (`/project:`)

| Command | Description |
|---------|-------------|
| `/project:backlog add story EPIC-XXX "Name"` | Create a User Story |
| `/project:backlog list story` | List User Stories |
| `/project:backlog edit story US-XXX` | Edit a User Story |
| `/project:migrate --stories` | Update multiple User Stories |

### Task Management (`/project:`)

| Command | Description |
|---------|-------------|
| `/project:backlog add task US-XXX "[TYPE] Desc" Xh` | Create a task |
| `/project:backlog list task` | List tasks |
| `/project:backlog move task TASK-XXX status` | Change status |

### Visualization & Execution (`/project:`)

| Command | Description |
|---------|-------------|
| `/project:board` | Show the sprint Kanban |
| `/project:batch-status` | Batch status of items |
| `/project:run-sprint N` | Run a full sprint |
| `/project:run-epic EPIC-XXX` | Run a full EPIC |
| `/project:run-queue` | Run the queue |
| `/project:generate-prd` | Generate the PRD |
| `/project:generate-tech-spec` | Generate the technical spec |

### Sprint (`/sprint:`)

| Command | Description |
|---------|-------------|
| `/sprint:status` | Detailed sprint metrics |
| `/sprint:transition US-XXX status` | Change a User Story's status/sprint |
| `/sprint:next-story` | Next story ready for dev |
| `/sprint:auto-route` | Automatic story routing |
| `/sprint:dev US-XXX` | Develop a story |

### Quality Gates (`/gate:`)

| Command | Description |
|---------|-------------|
| `/gate:check backlog` | Validate backlog compliance (score /100) |
| `/gate:check prd` | Validate the PRD |
| `/gate:check spec` | Validate the technical spec |
| `/gate:check story US-XXX` | Validate a User Story (DoD) |
| `/gate:check sprint N` | Validate a sprint |
| `/gate:check all` | Full quality report |

## Technical stack

```yaml
{{STACK_BLOCK}}
```

## Project structure

```
project-management/
├── README.md                     # Overview
├── personas.md                   # Persona definitions (min 3)
├── definition-of-done.md         # Project DoD
├── dependencies-matrix.md        # Dependencies matrix (Mermaid)
├── backlog/
│   ├── epics/
│   │   └── EPIC-XXX-name.md      # With MMF
│   └── user-stories/
│       └── US-XXX-name.md        # INVEST + 3C + Gherkin SMART
└── sprints/
    └── sprint-{N}-{slug}/
        ├── sprint-goal.md        # Sprint Goal + Ceremonies + Retro
        ├── sprint-dependencies.md
        ├── board.md              # Kanban
        └── tasks/
            ├── README.md
            └── TASK-XXX.md       # One file per task
```

## Applied SCRUM standards

### Fundamentals
- **3 Pillars**: Transparency, Inspection, Adaptation
- **Agile Manifesto**: 4 values, 12 principles
- **Sprint**: fixed 2 weeks
- **Velocity**: 20-40 points/sprint

### User Stories
- Format: "As a [P-XXX]... I want... So that..."
- **INVEST** validation: Independent, Negotiable, Valuable, Estimable, Sized ≤8pts, Testable
- The **3 Cs**: Card, Conversation, Confirmation
- **Vertical Slicing**: {{STACK_SLICE}}

### Acceptance Criteria
- **Gherkin** format: GIVEN [context] / WHEN [actor] [action] / THEN [result]
- **SMART** validation: Specific, Measurable, Achievable, Realistic, Time-bound
- Minimum: 1 nominal + 2 alternative + 2 error cases

### Epics
- **MMF** (Minimum Marketable Feature) mandatory
- Dependencies with a **Mermaid** graph

### Sprints
- Sprint 1 = **Walking Skeleton** (minimal complete feature)
- **Sprint Goal** in one sentence
- **Ceremonies**: Planning (Part 1 & 2), Daily, Review, Retro, Refinement
- Retrospective **Prime Directive** included

### Tasks
- Estimation in **hours** (0.5h - 8h max)
- Types: [DB], [BE], [FE-WEB], [FE-MOB], [TEST], [DOC], [REV], [OPS]
- Dependencies with a **Mermaid** graph
- Statuses: 🔲 To Do | 🔄 In Progress | 👀 Review | ✅ Done | 🚫 Blocked

## Recommended workflow

```bash
# 1. Initialize the backlog
/project:generate-backlog

# 2. Validate compliance
/gate:check backlog

# 3. Plan sprint 1
/project:decompose-tasks 001

# 4. Get the next story
/sprint:next-story

# 5. Develop a story
/sprint:dev US-XXX

# 6. Track the sprint
/sprint:status

# 7. Prepare the next sprint
/project:decompose-tasks 002
```

## Naming conventions

| Element | Format | Example |
|---------|--------|---------|
| Epic | EPIC-XXX-name | EPIC-001-authentication |
| User Story | US-XXX-name | US-001-signup |
| Persona | P-XXX | P-001 |
| Sprint | sprint-{N}-{slug} | sprint-1-walking_skeleton   |
| Task | TASK-XXX | TASK-005 |

## Code quality

- Tests > 80% coverage

{{QUALITY_BLOCK}}
