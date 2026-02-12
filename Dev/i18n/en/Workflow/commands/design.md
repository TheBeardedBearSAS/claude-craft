---
name: workflow-design
description: Execute the Design (Solutioning) phase - technical specification and architecture
arguments:
  - name: continue
    description: Continue from where left off
    required: false
---

# /workflow:design

## Mission

Execute the Design (Solutioning) phase of the development workflow. This phase focuses on creating the Technical Specification, designing the architecture, and documenting key technical decisions.

## When to Use

- **Standard** and **Enterprise** tracks
- After `/workflow:plan` is complete
- When PRD and backlog are ready

## Prerequisites

- PRD exists at `project-management/prd.md`
- Backlog exists at `project-management/backlog/`

## Workflow

### Step 1: Design Setup

```
╔══════════════════════════════════════════════════════════╗
║              DESIGN PHASE - STARTING                      ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Phase: 3 of 4 - Design (Solutioning)                      ║
║                                                           ║
║ Objectives:                                               ║
║ • Create Technical Specification from PRD                 ║
║ • Design system architecture (C4 diagrams)                ║
║ • Define data model and API design                        ║
║ • Document Architecture Decision Records (ADRs)           ║
║ • Plan testing strategy                                   ║
╚══════════════════════════════════════════════════════════╝
```

### Step 2: Load Planning Artifacts

```
╔══════════════════════════════════════════════════════════╗
║              LOADING PLANNING ARTIFACTS                   ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ PRD Analysis:                                             ║
║ ├── ✅ prd.md loaded                                      ║
║ ├── Functional requirements: 12                           ║
║ ├── Non-functional requirements: 8                        ║
║ └── Integrations required: 2                              ║
║                                                           ║
║ Backlog Summary:                                          ║
║ ├── ✅ backlog/ loaded                                    ║
║ ├── EPICs: 4                                              ║
║ ├── User Stories: 18                                      ║
║ └── Total Story Points: 89                                ║
║                                                           ║
║ Constraints (if Enterprise):                              ║
║ └── ✅ analysis/constraints.md loaded                     ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 3: Design Tasks

Execute design tasks in order:

```
╔══════════════════════════════════════════════════════════╗
║                 DESIGN TASKS                              ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ □ Task 1: Generate Tech Spec                              ║
║   Command: /project:generate-tech-spec                    ║
║   Output: project-management/tech-spec.md                 ║
║                                                           ║
║ □ Task 2: Architecture Design                             ║
║   Create C4 diagrams (context, container, component)      ║
║   Output: project-management/architecture/                ║
║                                                           ║
║ □ Task 3: Data Model Design                               ║
║   ERD and database schema                                 ║
║   Output: project-management/architecture/erd.md          ║
║                                                           ║
║ □ Task 4: API Design                                      ║
║   Endpoints, payloads, authentication                     ║
║   Output: project-management/architecture/api.md          ║
║                                                           ║
║ □ Task 5: Create ADRs                                     ║
║   Document key technical decisions                        ║
║   Output: docs/adr/                                       ║
║                                                           ║
║ □ Task 6: Security Review                                 ║
║   OWASP checklist, auth strategy                          ║
║   Output: project-management/architecture/security.md     ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 4: Execute Tech Spec Generation

```
Starting /project:generate-tech-spec...

Analyzing PRD requirements...
Detecting existing codebase patterns...

[Tech Spec generation workflow runs with interactive Q&A]

✅ Tech Spec created: project-management/tech-spec.md
```

### Step 5: Architecture Diagrams

Generate C4 architecture diagrams:

```
╔══════════════════════════════════════════════════════════╗
║             ARCHITECTURE DIAGRAMS                         ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ C4 Level 1 - System Context:                              ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │                                                     │  ║
║ │     [User] ──────► [Our System] ──────► [Stripe]    │  ║
║ │                         │                           │  ║
║ │                         ▼                           │  ║
║ │                    [SendGrid]                       │  ║
║ │                                                     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ C4 Level 2 - Container:                                   ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │                                                     │  ║
║ │  [React SPA] ──► [Symfony API] ──► [PostgreSQL]    │  ║
║ │                       │                             │  ║
║ │                       ▼                             │  ║
║ │                    [Redis]                          │  ║
║ │                                                     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Files created:                                            ║
║ ├── architecture/c4-context.md                            ║
║ ├── architecture/c4-container.md                          ║
║ └── architecture/c4-component.md                          ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 6: ADR Creation

Document key architecture decisions:

```
╔══════════════════════════════════════════════════════════╗
║        ARCHITECTURE DECISION RECORDS (ADRs)               ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ ADRs Created:                                             ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-001: Database Choice                             │  ║
║ │ Decision: PostgreSQL                                 │  ║
║ │ Rationale: ACID compliance, JSON support, existing   │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-002: API Style                                   │  ║
║ │ Decision: REST with JSON:API                         │  ║
║ │ Rationale: Team expertise, caching, simplicity       │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-003: Authentication                              │  ║
║ │ Decision: JWT with refresh tokens                    │  ║
║ │ Rationale: Stateless, mobile-friendly, standard      │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Files: docs/adr/ADR-001.md, ADR-002.md, ADR-003.md       ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 7: Design Review Gate

```
╔══════════════════════════════════════════════════════════╗
║              DESIGN REVIEW GATE                           ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Checklist:                                                ║
║ ✅ Tech Spec covers all PRD requirements                  ║
║ ✅ Architecture supports NFRs (performance, security)     ║
║ ✅ Data model handles all entities                        ║
║ ✅ API design covers all user stories                     ║
║ ✅ Security considerations documented                     ║
║ ✅ Testing strategy defined                               ║
║ ✅ Deployment approach documented                         ║
║                                                           ║
║ Review Questions:                                         ║
║ 1. Is the architecture appropriate for the scale?         ║
║ 2. Are there any missing integrations?                    ║
║ 3. Is the security approach sufficient?                   ║
║ 4. Are ADRs complete and justified?                       ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 8: Phase Completion

```
╔══════════════════════════════════════════════════════════╗
║              DESIGN PHASE COMPLETE                        ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Artifacts Created:                                        ║
║ ✅ tech-spec.md            Technical Specification        ║
║ ✅ architecture/                                          ║
║    ├── c4-context.md       System context diagram         ║
║    ├── c4-container.md     Container diagram              ║
║    ├── c4-component.md     Component diagram              ║
║    ├── erd.md              Entity Relationship Diagram    ║
║    ├── api.md              API design                     ║
║    └── security.md         Security considerations        ║
║ ✅ docs/adr/               3 Architecture Decision Records║
║                                                           ║
║ Summary:                                                  ║
║ • 24 API endpoints designed                               ║
║ • 8 database entities defined                             ║
║ • 3 external integrations specified                       ║
║ • 80% test coverage target set                            ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ NEXT PHASE: Implementation                                ║
║ Command: /workflow:implement                              ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Ready to start Sprint 1 development!                      ║
╚══════════════════════════════════════════════════════════╝
```

## Agents Involved

- **tech-lead**: Overall technical design and ADR creation
- **api-designer**: REST/GraphQL API design
- **database-architect**: Data model and schema design
- **ui-designer**: Frontend architecture (if applicable)
- **devops-engineer**: Deployment and infrastructure design

## Output Files

| File | Purpose |
|------|---------|
| `tech-spec.md` | Complete Technical Specification |
| `architecture/c4-*.md` | C4 architecture diagrams |
| `architecture/erd.md` | Entity Relationship Diagram |
| `architecture/api.md` | API endpoint documentation |
| `architecture/security.md` | Security design |
| `docs/adr/*.md` | Architecture Decision Records |

## Related Commands

- `/workflow:plan` - Previous phase
- `/workflow:implement` - Next phase
- `/workflow:status` - Check progress
- `/project:generate-tech-spec` - Direct tech spec generation
- `/common:architecture-decision` - Create individual ADRs
