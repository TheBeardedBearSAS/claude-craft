---
name: generate-constitution
description: Generate a Project Constitution capturing immutable project decisions and principles
arguments:
  - name: output
    description: Output path (default project-management/constitution.md)
    required: false
---

# /project:generate-constitution

## Mission

Generate a comprehensive Project Constitution by analyzing the project context, existing documentation, and through interactive clarification with the user. The constitution captures immutable decisions about vision, technical constraints, design principles, non-functional requirements, and project boundaries.

## Prerequisites

- Project directory exists
- Optional: `README.md` with project description
- Optional: `project-management/prd.md` with product requirements
- Optional: `project-management/tech-spec.md` with technical specification

## Mode Plan

> **Le mode plan est obligatoire.** Avant l'exécution, Claude active le mode plan pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification.

## Workflow

### Phase 1: Context Discovery

```
╔══════════════════════════════════════════════════════════╗
║         CONSTITUTION GENERATION - DISCOVERY               ║
╠══════════════════════════════════════════════════════════╣
║ Scanning project context...                               ║
╚══════════════════════════════════════════════════════════╝
```

**Automatic Analysis:**
1. Read `README.md` for project overview and tech stack
2. Scan `project-management/prd.md` for product vision and requirements
3. Check `project-management/tech-spec.md` for architecture decisions
4. Analyze codebase structure for existing patterns and conventions
5. Review `.claude/` configuration for established rules

**Sources Found:**
- [ ] README.md
- [ ] project-management/prd.md
- [ ] project-management/tech-spec.md
- [ ] .claude/CLAUDE.md
- [ ] Codebase structure analysis

### Phase 2: Interactive Clarification

Ask the user clarifying questions to fill gaps:

#### Vision & Mission
```
┌─────────────────────────────────────────────────────────┐
│ QUESTIONS - Vision & Mission                             │
├─────────────────────────────────────────────────────────┤
│ 1. What is the product vision in one sentence?           │
│ 2. What does the product do, for whom, and why?          │
│ 3. What are the non-negotiable objectives?               │
│ 4. What would make this project a failure?               │
└─────────────────────────────────────────────────────────┘
```

#### Technical Constraints
```
┌─────────────────────────────────────────────────────────┐
│ QUESTIONS - Technical Constraints                        │
├─────────────────────────────────────────────────────────┤
│ 1. Which technologies are locked (non-negotiable)?       │
│ 2. What architecture pattern must be followed?           │
│ 3. What infrastructure constraints exist?                │
│ 4. Are there mandatory third-party integrations?         │
└─────────────────────────────────────────────────────────┘
```

#### Design Principles
```
┌─────────────────────────────────────────────────────────┐
│ QUESTIONS - Design Principles                            │
├─────────────────────────────────────────────────────────┤
│ 1. Which design patterns are mandatory?                  │
│ 2. Which patterns or practices are forbidden?            │
│ 3. What code standards must be enforced?                 │
│ 4. What testing strategy is required?                    │
└─────────────────────────────────────────────────────────┘
```

#### Non-Functional Requirements
```
┌─────────────────────────────────────────────────────────┐
│ QUESTIONS - Non-Functional Requirements                  │
├─────────────────────────────────────────────────────────┤
│ 1. What are the performance targets? (latency, load)     │
│ 2. What security requirements exist?                     │
│ 3. What compliance standards apply? (GDPR, SOC2, etc.)   │
│ 4. What are the availability/uptime targets?             │
└─────────────────────────────────────────────────────────┘
```

#### Boundaries
```
┌─────────────────────────────────────────────────────────┐
│ QUESTIONS - Boundaries                                   │
├─────────────────────────────────────────────────────────┤
│ 1. What is explicitly out of scope?                      │
│ 2. What external systems will be integrated?             │
│ 3. What are the team boundaries and ownership rules?     │
│ 4. Who has authority to amend this constitution?         │
└─────────────────────────────────────────────────────────┘
```

### Phase 3: Constitution Generation

Using the collected information, generate the constitution:

1. **Load Template**: `./templates/constitution.md`
2. **Fill Vision**: Populate vision, mission, and non-negotiable objectives
3. **Lock Tech Stack**: Document all locked technology decisions
4. **Define Principles**: Capture mandatory and forbidden patterns
5. **Set NFRs**: Record performance, security, and compliance targets
6. **Draw Boundaries**: Document exclusions and integration boundaries

### Phase 4: Review & Ratification

```
╔══════════════════════════════════════════════════════════╗
║              CONSTITUTION GENERATED                       ║
╠══════════════════════════════════════════════════════════╣
║ Output: project-management/constitution.md                ║
║                                                           ║
║ Sections completed:                                       ║
║ ✅ Vision & Mission                                       ║
║ ✅ Technical Constraints                                  ║
║ ✅ Design Principles                                      ║
║ ✅ Non-Functional Requirements                            ║
║ ✅ Boundaries                                             ║
║ ✅ Amendment Process                                      ║
╚══════════════════════════════════════════════════════════╝
```

**Offer iterations:**
- "Would you like to adjust any locked decisions?"
- "Should I add more technical constraints?"
- "Do you want to refine the boundaries?"

## Output Structure

```
project-management/
├── constitution.md           # Generated constitution
└── analysis/
    └── discovery-notes.md    # Notes from discovery phase
```

## Integration with Workflow

After constitution generation, suggest next steps:

```
╔══════════════════════════════════════════════════════════╗
║                     NEXT STEPS                            ║
╠══════════════════════════════════════════════════════════╣
║ Constitution is ratified! Recommended next actions:       ║
║                                                           ║
║ 1. /project:generate-prd         → Product requirements   ║
║ 2. /project:generate-tech-spec   → Technical design       ║
║ 3. /project:generate-backlog     → Create SCRUM backlog   ║
║ 4. /workflow:plan                → Full planning phase     ║
╚══════════════════════════════════════════════════════════╝
```

## Example Session

```
User: /project:generate-constitution

Claude: Starting constitution generation...

📂 Context Discovery
Found sources:
- README.md (project overview)
- project-management/prd.md (product requirements)

Let me ask some clarifying questions:

❓ Vision & Mission
1. What is your product vision in one sentence?
> User: Empower small teams to ship quality software faster with AI-assisted workflows.

❓ Technical Constraints
2. Which technologies are locked?
> User: TypeScript, React 19, PostgreSQL, Docker...

❓ Design Principles
3. Which patterns are mandatory?
> User: Clean Architecture, TDD, SOLID principles...

[... interactive Q&A continues ...]

✅ Constitution Generated!
Output: project-management/constitution.md

The constitution includes:
- Vision: AI-assisted development workflows
- 6 locked technologies with versions
- 4 mandatory patterns, 3 forbidden anti-patterns
- Performance SLAs: <200ms p95, 99.9% uptime
- 5 explicit exclusions

Would you like me to:
1. Adjust any locked decisions?
2. Generate the PRD next?
3. Start the technical specification?
```

## Related Commands

- `/project:generate-prd` - Generate product requirements document
- `/project:generate-tech-spec` - Generate technical specification
- `/project:generate-backlog` - Create SCRUM backlog from PRD
- `/workflow:init` - Initialize project workflow
- `/workflow:plan` - Full planning phase workflow
