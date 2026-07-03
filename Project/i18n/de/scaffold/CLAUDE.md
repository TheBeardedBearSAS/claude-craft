# Claude Code Configuration - Project Management

## Available agents

### 🎯 Product Owner (`@po`)
Expert in backlog management, personas, User Stories and prioritization.
- CSPO certified (Certified Scrum Product Owner)
- Skilled in: INVEST, 3C, Gherkin, SMART, MoSCoW, MMF

### 🔧 Tech Lead (`@tech`)
Expert in architecture, technical decomposition and Scrum facilitation.
- CSM certified (Certified Scrum Master)
- Skilled in: Symfony, Flutter, API Platform, Hexagonal Architecture

## Custom commands

### Backlog Generation & Management (`/project:`)

| Command | Description |
|---------|-------------|
| `/project:generate-backlog` | Generate the full backlog |
| `/project:decompose-tasks N` | Break sprint N into tasks |
| `/project:analyze-backlog` | Analyze the existing backlog |
| `/project:migrate-backlog` | Migrate an existing backlog |
| `/project:sync-backlog` | Synchronize the backlog index |

### EPIC Management (`/project:`)

| Command | Description |
|---------|-------------|
| `/project:add-epic "Name"` | Create a new EPIC |
| `/project:list-epics` | List all EPICs |
| `/project:update-epic EPIC-XXX` | Edit an EPIC |

### User Story Management (`/project:`)

| Command | Description |
|---------|-------------|
| `/project:add-story EPIC-XXX "Name"` | Create a User Story |
| `/project:list-stories` | List User Stories |
| `/project:update-story US-XXX` | Edit a User Story |
| `/project:update-stories` | Update multiple User Stories |

### Task Management (`/project:`)

| Command | Description |
|---------|-------------|
| `/project:add-task US-XXX "[TYPE] Desc" Xh` | Create a task |
| `/project:list-tasks` | List tasks |
| `/project:move-task TASK-XXX status` | Change status |

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
| `/gate:validate-backlog` | Validate backlog compliance (score /100) |
| `/gate:validate-prd` | Validate the PRD |
| `/gate:validate-techspec` | Validate the technical spec |
| `/gate:validate-story US-XXX` | Validate a User Story (DoD) |
| `/gate:validate-sprint N` | Validate a sprint |
| `/gate:report` | Full quality report |

## Technical stack

```yaml
web: Symfony UX + Turbo (Twig, Stimulus, Live Components)
mobile: Flutter (Dart, Material/Cupertino)
api: API Platform (REST, OpenAPI)
database: PostgreSQL + Doctrine ORM
infrastructure: Docker
tests: PHPUnit, Flutter Test
quality: PHPStan max, Dart analyzer
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
    └── sprint-XXX-goal/
        ├── sprint-goal.md        # Sprint Goal + Ceremonies + Retro
        ├── sprint-dependencies.md
        ├── tasks/
        │   ├── README.md
        │   └── US-XXX-tasks.md   # Detailed tasks
        └── task-board.md         # Kanban
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
- **Vertical Slicing**: Symfony + Flutter + API + PostgreSQL

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
/gate:validate-backlog

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
| Sprint | sprint-XXX-goal | sprint-001-walking_skeleton |
| Task | T-XXX-YY | T-001-05 |

## Code quality

### Backend (Symfony)
- PHPStan max level
- Tests > 80% coverage
- Hexagonal architecture
- PSR-12

### Mobile (Flutter)
- Strict Dart analyzer
- Widget tests
- BLoC/Riverpod
- Material Design 3

### API (API Platform)
- Auto-generated OpenAPI
- Validation constraints
- Serialization groups
- Security voters
