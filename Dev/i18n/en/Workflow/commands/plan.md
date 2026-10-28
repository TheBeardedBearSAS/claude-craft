---
name: workflow-plan
description: "Execute the Planning phase - research (--research), PRD (--only=prd) and SCRUM backlog (--only=backlog)"
argument-hint: "[--research] [--only=prd|backlog] [--continue]"
arguments:
  - name: research
    description: "Run the research step first (former /workflow:plan --research): domain, market, technical research, constraints, risks"
    required: false
  - name: only
    description: "Run a single step: prd (PRD + personas) or backlog (personas, DoD, epics, user stories, sprints)"
    required: false
  - name: continue
    description: Continue from where left off
    required: false
---

# /workflow:plan

## Mission

Execute the Planning phase of the development workflow: optional research, Product Requirements Document (PRD), personas, and the SCRUM backlog (epics, user stories, sprint folders). This command contains the full generation logic; there is no separate PRD or backlog generator to call.

## Usage

| Invocation | What it does | Replaces |
|------------|--------------|----------|
| `/workflow:plan` | Full phase: PRD, then backlog (add `--research` to start with research) | - |
| `/workflow:plan --research` | Research, exploration, constraints and risks, before the PRD. Writes `project-management/analysis/` | `/workflow:plan --research` |
| `/workflow:plan --only=prd` | PRD + personas only. Writes `project-management/prd.md` | `/workflow:plan --only=prd` |
| `/workflow:plan --only=backlog` | Backlog only: reads `project-management/prd.md` (+ `project-management/tech-spec.md` if present), writes personas, DoD, epics, user stories with `**Implements**`, sprint folders `sprint-{N}-{slug}`, and registers the stories in `.bmad/sprint-status.yaml` with status `backlog` | `/workflow:plan --only=backlog` |
| `/workflow:plan --continue` | Resume an interrupted run | - |

`--research` can be combined with `--only=prd` (research then PRD).

## Canonical Order

Documents are produced in this order: **PRD, then tech spec, then backlog, then sprint**.

- **Quick track**: `/workflow:plan` (no flag) generates PRD + backlog in one pass.
- **Standard / Enterprise (recommended)**: `/workflow:plan --only=prd` then `/workflow:design` then `/workflow:plan --only=backlog`. The backlog then reads `project-management/prd.md` and `project-management/tech-spec.md`, so stories carry the real architecture and `**Implements**` points to the PRD `FR-xxx`.
- **Enterprise**: start with `/workflow:plan --research --only=prd`.

Without a PRD, `--only=backlog` falls back to the specs found in `./docs/` (ARCHITECTURE_TECHNIQUE*.md, CAHIER_DES_CHARGES*.md or any other spec file) and warns that traceability is degraded.

## When to Use

- **Standard** and **Enterprise** tracks, after `/workflow:init`
- When starting feature planning, or when the PRD or backlog must be regenerated

## Plan Mode

> **Plan mode is mandatory.** Claude activates plan mode to structure the approach, identify dependencies, and present a generation strategy before creating artifacts.

## Workflow

### Step 1: Planning Setup and Existing Artifacts

Show the track and phase (Planning = phase 2 of 4), then check `project-management/`: `prd.md`, `personas.md`, `backlog/`, `analysis/` (constraints.md, research-summary.md). Existing files are never overwritten silently: ask to update, merge or skip.

### Step 2 (`--research`): Research Phase

Former `/workflow:plan --research`. Focus on research, exploration and constraints before the PRD.

**Guided questions**

| Area | Questions |
|------|-----------|
| Domain | What problem? Which stakeholders? Business drivers? What does success look like? |
| Market | Existing solutions? Competitors? Industry best practices? Emerging trends? |
| Technical | Candidate technologies? Integrations? Scalability? Security / compliance? |

If MCP Context7 is configured, use it for up-to-date technical documentation (`/deep-research` for deep web research; outside claude.ai, the `@research-assistant` agent).

**Constraints**: document technical (existing backend, database), business (budget, timeline, backward compatibility), regulatory (GDPR, PCI DSS) and resource (team size, no DevOps) constraints.

**Risks and opportunities**: risk table (risk, impact, likelihood, mitigation) and opportunities.

**Artifacts**

```
project-management/analysis/
├── research-summary.md      # Key findings
├── constraints.md           # All identified constraints
├── risks-opportunities.md   # Risk register & opportunities
└── technical-options.md     # Technology evaluation
```

Agents: **research-assistant** (technical research), **product-owner** (business context). Next: PRD (the analysis feeds it).

### Step 3 (`--only=prd` or full run): PRD Generation

Writes `project-management/prd.md` and `project-management/personas.md`.

**Phase 1 - Context discovery**: read `README.md`, scan `./docs/` for specifications, read `project-management/personas.md` and `project-management/analysis/` if present, analyze the codebase for the tech stack, review the conversation. List the sources found.

**Phase 2 - Interactive clarification** (ask only what is missing):

| Topic | Questions |
|-------|-----------|
| Problem and opportunity | What problem? Who suffers most? Cost of not solving it? Business opportunity? |
| Target users | Primary users (role, demographics)? Goals? Frustrations with current solutions? Secondary users? |
| Goals and metrics | Business goals? KPIs with target values and timeline? What does MVP success look like? |
| Scope and constraints | Must-have features (P0)? Explicitly out of scope? Technical, budget, timeline, compliance constraints? |

**Phase 3 - Generation**: load the PRD template (`.claude/templates/project/prd.md` if present), fill every section, create detailed personas, organize requirements as P0/P1/P2 with stable IDs `FR-001`, `FR-002`... (functional) and `NFR-001`... (non-functional) so that stories can trace to them, identify risks from constraints and dependencies.

**Phase 4 - Review and iteration**: show a section checklist (Executive Summary, Problem Statement, Goals & Metrics, Target Users, Functional Requirements, Non-Functional Requirements, Scope & Constraints, Timeline, Risks & Mitigations), flag incomplete ones, then offer to expand a section, detail personas or adjust prioritization.

```
project-management/
├── prd.md                    # Generated PRD (FR-xxx / NFR-xxx)
├── personas.md               # Extracted/created personas
└── analysis/discovery-notes.md
```

### Step 4 (`--only=backlog` or full run): Backlog Generation

You act as an experienced Product Owner and Scrum Master. The backlog must respect the 3 Scrum pillars (transparency, inspection, adaptation) and the Agile values.

**Inputs, in priority order**

1. `project-management/prd.md`: primary source. Its `FR-xxx` IDs feed the `**Implements**` field of every user story.
2. `project-management/tech-spec.md` if present (see `/workflow:design`): architecture, entities, endpoints used in the technical notes.
3. Fallback without PRD: specs in `./docs/`.

**Vertical slicing (mandatory)**: each user story traverses all layers of the project stack (UI, API, persistence). No "backend only" or "frontend only" story. Detect the stack from the tech spec or the codebase and adapt the DoD and the technical criteria accordingly.

**Structure created**

```
project-management/
├── README.md                 # Overview, personas, epics, metrics, roadmap
├── personas.md
├── definition-of-done.md
├── dependencies-matrix.md
├── backlog/
│   ├── epics/EPIC-XXX-name.md
│   └── user-stories/US-XXX-name.md
└── sprints/sprint-{N}-{slug}/   # e.g. sprint-1-walking_skeleton
    ├── sprint-goal.md
    └── sprint-dependencies.md
```

**personas.md**: minimum 3 personas (IDs P-001, P-002...; 1 primary, 2+ secondary). Each: identity, representative quote, context, 3 objectives, at least 3 frustrations, motivations, behaviors, usage scenarios (Context, Need, Action, Result), decision criteria. Add a personas/features matrix (3 stars critical, 2 important, 1 useful) and anti-personas.

**definition-of-done.md**: code (approved review, conventions, SOLID), tests (80% unit, integration, E2E, green CI), per-layer criteria (UI, API, parity between clients), documentation, quality (static analysis max level, API under 200 ms), deployment (migrations, staging, PO validation).

**Epics** (`EPIC-XXX-name.md`): description (business value), associated stories table (ID, title, points, priority, depends on), dependencies (prerequisites and dependents), Minimum Marketable Feature (MMF) with included stories, estimation (size S/M/L/XL, estimated sprints).

**User stories** (`US-XXX-name.md`), from `.claude/templates/project/user-story.md`:

- **INVEST** (mandatory): Independent, Negotiable, Valuable, Estimable, Sized (8 points max), Testable.
- **3 Cs** (mandatory): Card ("As [P-XXX]... I want... So that..."), Conversation (open questions), Confirmation (acceptance criteria).
- **Acceptance criteria** in SMART Gherkin: 1 nominal scenario, at least 2 alternative, at least 2 error scenarios.
- Parent epic, related persona, per-layer criteria, technical notes, estimation (Fibonacci points, MoSCoW), dependencies (blocking and blocked), assigned sprint.
- **Traceability**: fill the `## Traceability` section with `**Implements**: {FR-001, FR-003}` (PRD requirement IDs delivered by the story). A story with no `FR-xxx` is flagged.

**dependencies-matrix.md**: Mermaid graph between epics, dependencies table, critical path, inter-story dependencies.

**Sprints** (`sprint-{N}-{slug}/`): `sprint-goal.md` (one-sentence goal, ceremonies, selected stories and total points, execution order, Mermaid dependency graph, deliverable increment, retrospective directive and Starfish format) and `sprint-dependencies.md`.

**Register in `.bmad/sprint-status.yaml`**: for each story, add an entry with `status: backlog` (schema: `Project/templates/sprint-status.yaml.template`): `title`, `story_points`, `epic_id`, `tasks` (total 0), `acceptance_criteria.total`, and a `history` entry "Story created". `.bmad/sprint-status.yaml` is the single source of truth for status; markdown files hold content only and never a status. Create the file from the template if missing, never overwrite existing entries.

**Scrum rules**: 2-week sprints, velocity 20-40 points, 8 points max per story (otherwise split), Fibonacci scale (1, 2, 3, 5, 8, 13, 21), Sprint 1 = Walking Skeleton (infrastructure + one complete flow).

### Step 5: Validation

Run `/gate:check backlog` (or check inline):

| Check | Criteria |
|-------|----------|
| INVEST | All 6 criteria per story; sized at 8 points max (13+ must be split) |
| 3 Cs | Card, Conversation, Confirmation present |
| Gherkin | Valid format; 1 nominal + 2 alternative + 2 error |
| Personas | At least 3, matrix present |
| Epics | MMF identified, Mermaid dependencies |
| Sprints | Sprint 1 = Walking Skeleton, one-sentence goal, dependency graph |
| Traceability | Every story has `**Implements**`; every P0 `FR-xxx` is covered by at least one story |
| Status | Every story is registered in `.bmad/sprint-status.yaml` as `backlog` |

Report warnings (for example "US-012: 21 points - must be split") and fix them before completing.

### Step 6: Phase Completion

Summarize artifacts (PRD, personas, epics, stories count, total points, Sprint 1 scope, estimated sprints) and recommend the next step: after `--only=prd`, `/workflow:design` then `/workflow:plan --only=backlog`; after the backlog, `/workflow:design` (if no tech spec yet) or `/workflow:start 1`.

## Agents Involved

- **product-owner**: PRD creation, personas, prioritization, backlog
- **tech-lead**: technical feasibility review, estimation guidance
- **research-assistant**: research (`--research`)

## Output Files

| File | Purpose | Mode |
|------|---------|------|
| `analysis/*.md` | Research, constraints, risks | `--research` |
| `prd.md`, `personas.md` | PRD with `FR-xxx` / `NFR-xxx`, personas | `--only=prd` |
| `definition-of-done.md`, `dependencies-matrix.md`, `README.md` | Backlog framing | `--only=backlog` |
| `backlog/epics/`, `backlog/user-stories/` | Epics and stories (`**Implements**`) | `--only=backlog` |
| `sprints/sprint-{N}-{slug}/` | Sprint folders | `--only=backlog` |
| `.bmad/sprint-status.yaml` | Stories registered as `backlog` | `--only=backlog` |

## Continue Option

If interrupted, `/workflow:plan --continue` detects what exists (PRD complete, backlog at 12/18 stories) and resumes at the next missing item.

## Related Commands

- `/workflow:init` - Initialize workflow
- `/workflow:design` - Tech spec (between PRD and backlog)
- `/workflow:start` - Start a sprint from the backlog
- `/workflow:status` - Check progress
- `/project:backlog` - Add, list, edit and move stories afterwards
- `/gate:check` - Validate the backlog
