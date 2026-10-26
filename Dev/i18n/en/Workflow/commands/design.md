---
name: workflow-design
description: "Execute the Design (Solutioning) phase - generate the technical specification (default) or the project constitution (--constitution)"
argument-hint: "[--constitution] [--continue]"
arguments:
  - name: constitution
    description: Generate the project constitution (project-management/constitution.md) instead of the tech spec
    required: false
  - name: continue
    description: Continue from where left off
    required: false
---

# /workflow:design

## Mission

Execute the Design (Solutioning) phase: turn the PRD into a Technical Specification, architecture diagrams, data model, API design and ADRs. With `--constitution`, capture the immutable project decisions in a Project Constitution instead.

## Usage

| Invocation | What it does | Replaces |
|------------|--------------|----------|
| `/workflow:design` | Reads `project-management/prd.md`, writes `project-management/tech-spec.md` + architecture files + ADRs | `/workflow:design` |
| `/workflow:design --constitution` | Writes `project-management/constitution.md` (immutable decisions, used by `/gate:check alignment`) | `/workflow:design --constitution` |
| `/workflow:design --continue` | Resumes an interrupted design session | - |

Canonical document order: PRD → tech spec → backlog → sprint.

## When to Use

- **Standard** and **Enterprise** tracks
- After `/workflow:plan --only=prd` is complete
- `--constitution`: at project start (or any time decisions must be locked)

## Prerequisites

- PRD exists at `project-management/prd.md` (`--constitution`: only optional sources, see below)
- Technology stack identified (asked interactively for new projects)

## Plan Mode

> **Plan mode is mandatory.** Claude activates plan mode to analyze impacted code, propose a generation strategy and wait for your validation before creating artifacts.

## Workflow: Tech Spec (default)

### Step 1: PRD Analysis

```
╔══════════════════════════════════════════════════════════╗
║              DESIGN PHASE - STARTING                      ║
║ Track: Standard | Phase: 3 of 4 - Design (Solutioning)    ║
║ Loading project-management/prd.md ...                     ║
║ ├── Functional requirements: 12                           ║
║ ├── Non-functional requirements: 8                        ║
║ └── Integrations required: 2                              ║
╚══════════════════════════════════════════════════════════╝
```

Extract from the PRD: functional requirements (`FR-xxx`), non-functional requirements (performance, security, scalability), personas and journeys, constraints and assumptions, integrations. If `project-management/analysis/constraints.md` exists (Enterprise), load it too.

### Step 2: Codebase Analysis

Existing codebase: detect stack (backend, frontend, database, cache, infrastructure) and existing patterns (architecture, API style, auth, testing) and stay consistent with them.

New project: ask the technology questions.

```
┌─────────────────────────────────────────────────────────┐
│ QUESTIONS - Technology Stack                             │
├─────────────────────────────────────────────────────────┤
│ 1. Preferred backend framework? (Symfony/Laravel/Node)   │
│ 2. Frontend framework? (React/Vue/Angular/None)          │
│ 3. Database preference? (PostgreSQL/MySQL/MongoDB)       │
│ 4. Deployment target? (Docker/K8s/Serverless/VPS)        │
│ 5. Any existing integrations to consider?                │
└─────────────────────────────────────────────────────────┘
```

### Step 3: Architecture Questions

```
┌─────────────────────────────────────────────────────────┐
│ QUESTIONS - Architecture Decisions                       │
├─────────────────────────────────────────────────────────┤
│ 1. Monolith or Microservices?                            │
│ 2. API style preference? (REST/GraphQL/gRPC)             │
│ 3. Expected scale? (users, requests/sec)                 │
│ 4. Real-time features needed? (WebSockets/SSE)           │
│ 5. File storage requirements? (S3/local/CDN)             │
│ 6. Background job processing needs?                      │
│ 7. Third-party integrations? (payments, email, etc.)     │
└─────────────────────────────────────────────────────────┘
```

### Step 4: Design Tasks

Execute in order:

| # | Task | Output |
|---|------|--------|
| 1 | Tech Spec (template `.claude/templates/project/tech-spec.md`) | `project-management/tech-spec.md` |
| 2 | C4 diagrams (context, container, component) | `project-management/architecture/c4-*.md` |
| 3 | Data model: ERD (Mermaid `erDiagram`) + schemas; validate relationships, missing entities, indexing | `project-management/architecture/erd.md` |
| 4 | API design: endpoints derived from FR-xxx and personas, payloads, errors, auth | `project-management/architecture/api.md` |
| 5 | Security and performance: OWASP mitigations, authN/authZ, encryption, rate limiting, GDPR gaps | `project-management/architecture/security.md` |
| 6 | ADRs for key decisions (database, API style, authentication) | `docs/adr/ADR-00x-*.md` |
| 7 | Testing strategy (coverage target 80%), CI/CD and deployment, monitoring | in `tech-spec.md` |

Security checklist example:

```
✅ Authentication: JWT with HttpOnly cookies
✅ Authorization: RBAC with policies
✅ Data encryption: AES-256 at rest, TLS 1.3 in transit
✅ Input validation: DTO validation + sanitization
✅ Rate limiting: 100 req/min per user
⚠️  GDPR compliance: needs data retention policy
```

### Step 5: Design Review Gate

- Tech Spec covers all PRD requirements (every `FR-xxx` traceable)
- Architecture supports the NFRs (performance, security)
- Data model handles all entities; API design covers all user stories
- Security, testing strategy and deployment approach documented
- ADRs complete and justified

Offer iterations: caching strategy, expanded API documentation, deployment pipeline.

### Step 6: Completion

```
╔══════════════════════════════════════════════════════════╗
║              DESIGN PHASE COMPLETE                        ║
║ ✅ project-management/tech-spec.md                        ║
║ ✅ project-management/architecture/ (c4, erd, api, sec.)  ║
║ ✅ docs/adr/ (3 ADRs)                                     ║
║ • 24 API endpoints • 8 entities • 3 integrations          ║
║                                                           ║
║ NEXT: /workflow:plan --only=backlog                       ║
║ THEN: /workflow:start 1                                   ║
╚══════════════════════════════════════════════════════════╝
```

The backlog reads `project-management/prd.md` and, once it exists, `project-management/tech-spec.md`. After design, recommend `/workflow:plan --only=backlog` then `/workflow:start 1`.

## Workflow: Constitution (`--constitution`)

### Phase 1: Context Discovery

Automatic analysis of: `README.md`, `project-management/prd.md`, `project-management/tech-spec.md`, codebase structure (patterns, conventions) and `.claude/` configuration. List which sources were found.

### Phase 2: Interactive Clarification

Ask the user, by theme, to fill the gaps:

| Theme | Questions |
|-------|-----------|
| Vision & Mission | Vision in one sentence; what, for whom, why; non-negotiable objectives; what would make the project a failure |
| Technical Constraints | Locked technologies; mandatory architecture pattern; infrastructure constraints; mandatory third-party integrations |
| Design Principles | Mandatory patterns; forbidden patterns/practices; code standards; required testing strategy |
| Non-Functional Requirements | Performance targets (latency, load); security; compliance (GDPR, SOC2); availability/uptime |
| Boundaries | Out of scope; external systems; team boundaries and ownership; who may amend the constitution |

### Phase 3: Generation

1. Load template `.claude/templates/project/constitution.md`
2. Fill vision, mission and non-negotiable objectives
3. Lock the tech stack (technologies and versions)
4. Capture mandatory and forbidden patterns
5. Record performance, security and compliance targets
6. Document exclusions, integration boundaries and the amendment process

### Phase 4: Review & Ratification

Output: `project-management/constitution.md` with sections Vision & Mission, Technical Constraints, Design Principles, Non-Functional Requirements, Boundaries, Amendment Process. Offer to adjust locked decisions, add constraints or refine boundaries. Optional discovery notes go to `project-management/analysis/discovery-notes.md`.

The constitution is the reference used by `/gate:check alignment`. Next steps: `/workflow:plan --only=prd` if no PRD yet, otherwise run the default `/workflow:design`.

## Agents Involved

- **tech-lead**: Overall technical design and ADR creation
- **api-designer**: REST/GraphQL API design
- **database-architect**: Data model and schema design
- **ui-designer**: Frontend architecture (if applicable)
- **devops-engineer**: Deployment and infrastructure design

## Output Files

| File | Purpose |
|------|---------|
| `project-management/tech-spec.md` | Complete Technical Specification |
| `project-management/constitution.md` | Project Constitution (`--constitution`) |
| `project-management/architecture/c4-*.md` | C4 architecture diagrams |
| `project-management/architecture/erd.md` | Entity Relationship Diagram |
| `project-management/architecture/api.md` | API endpoint documentation |
| `project-management/architecture/security.md` | Security design |
| `docs/adr/*.md` | Architecture Decision Records |

## Example Session

```
User: /workflow:design

Claude: Loading project-management/prd.md: 12 FR, 8 NFR.
Detected: Symfony + React + PostgreSQL.
❓ Current API is REST. Keep REST or migrate to GraphQL?
> Keep REST
[... interactive Q&A ...]
✅ Tech Spec generated: project-management/tech-spec.md
Next: /workflow:plan --only=backlog, then /workflow:start 1
```

## Related Commands

- `/workflow:plan` - Previous phase (`--only=prd`, `--only=backlog`)
- `/workflow:start` - Start the first sprint
- `/workflow:implement` - Implementation phase
- `/workflow:status` - Check progress
- `/gate:check` - Quality gates (`alignment` uses the constitution)
- `/common:architecture-decision` - Create individual ADRs
