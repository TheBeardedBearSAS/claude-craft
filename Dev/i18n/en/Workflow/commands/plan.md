---
name: workflow-plan
description: Execute the Planning phase - PRD creation, personas, and backlog generation
arguments:
  - name: continue
    description: Continue from where left off
    required: false
---

# /workflow:plan

## Mission

Execute the Planning phase of the development workflow. This phase focuses on creating the Product Requirements Document, defining personas, and generating the initial product backlog.

## When to Use

- **Standard** and **Enterprise** tracks
- After `/workflow:init` (or `/workflow:analyze` for Enterprise)
- When starting feature planning

## Workflow

### Step 1: Planning Setup

```
╔══════════════════════════════════════════════════════════╗
║             PLANNING PHASE - STARTING                     ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Phase: 2 of 4 - Planning                                  ║
║                                                           ║
║ Objectives:                                               ║
║ • Create or update Product Requirements Document          ║
║ • Define user personas                                    ║
║ • Generate product backlog with prioritized user stories  ║
║ • Set success metrics and KPIs                            ║
╚══════════════════════════════════════════════════════════╝
```

### Step 2: Check Existing Artifacts

```
╔══════════════════════════════════════════════════════════╗
║              EXISTING ARTIFACTS CHECK                     ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Checking project-management/ ...                          ║
║                                                           ║
║ PRD:                                                      ║
║ ├── ❌ prd.md                    Not found               ║
║                                                           ║
║ Personas:                                                 ║
║ ├── ❌ personas.md               Not found               ║
║                                                           ║
║ Backlog:                                                  ║
║ ├── ❌ backlog/                  Not found               ║
║                                                           ║
║ Analysis (Enterprise):                                    ║
║ ├── ✅ analysis/constraints.md   Available               ║
║ └── ✅ analysis/research.md      Available               ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 3: Planning Tasks

Execute planning tasks in order:

```
╔══════════════════════════════════════════════════════════╗
║               PLANNING TASKS                              ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ □ Task 1: Generate PRD                                    ║
║   Command: /project:generate-prd                          ║
║   Output: project-management/prd.md                       ║
║                                                           ║
║ □ Task 2: Define Personas                                 ║
║   (Included in PRD generation)                            ║
║   Output: project-management/personas.md                  ║
║                                                           ║
║ □ Task 3: Generate Backlog                                ║
║   Command: /project:generate-backlog                      ║
║   Output: project-management/backlog/                     ║
║                                                           ║
║ □ Task 4: Validate Backlog                                ║
║   Command: /gate:validate-backlog                      ║
║   Ensures SCRUM compliance                                ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 4: Execute PRD Generation

Invoke the PRD generation command:

```
Starting /project:generate-prd...

[PRD generation workflow runs]

✅ PRD created: project-management/prd.md
✅ Personas extracted: project-management/personas.md
```

### Step 5: Execute Backlog Generation

After PRD is complete:

```
Starting /project:generate-backlog...

Using PRD as input:
• 3 personas identified
• 12 functional requirements extracted
• 8 non-functional requirements noted

Generating backlog structure...

[Backlog generation workflow runs]

✅ Backlog created with:
   • 4 EPICs
   • 18 User Stories
   • Sprint 1 planned (Walking Skeleton)
```

### Step 6: Validation

Run backlog validation:

```
╔══════════════════════════════════════════════════════════╗
║              BACKLOG VALIDATION                           ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ INVEST Criteria Check:                                    ║
║ ├── Independent:    18/18 ✅                              ║
║ ├── Negotiable:     18/18 ✅                              ║
║ ├── Valuable:       18/18 ✅                              ║
║ ├── Estimable:      18/18 ✅                              ║
║ ├── Sized (≤8pts):  16/18 ⚠️  (2 stories need split)     ║
║ └── Testable:       18/18 ✅                              ║
║                                                           ║
║ 3C Criteria Check:                                        ║
║ ├── Card:           18/18 ✅                              ║
║ ├── Conversation:   18/18 ✅                              ║
║ └── Confirmation:   18/18 ✅                              ║
║                                                           ║
║ Acceptance Criteria (Gherkin):                            ║
║ └── Valid format:   18/18 ✅                              ║
║                                                           ║
║ WARNINGS:                                                 ║
║ • US-007: 13 points - consider splitting                  ║
║ • US-012: 21 points - must be split                       ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Step 7: Phase Completion

```
╔══════════════════════════════════════════════════════════╗
║             PLANNING PHASE COMPLETE                       ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Artifacts Created:                                        ║
║ ✅ prd.md              Product Requirements Document      ║
║ ✅ personas.md         3 user personas                    ║
║ ✅ backlog/            Complete SCRUM backlog             ║
║    ├── epics/          4 EPICs                            ║
║    └── user-stories/   18 User Stories                    ║
║                                                           ║
║ Summary:                                                  ║
║ • Total Story Points: 89                                  ║
║ • Sprint 1 Scope: 21 points (Walking Skeleton)            ║
║ • Estimated Sprints: 4-5                                  ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ NEXT PHASE: Design (Solutioning)                          ║
║ Command: /workflow:design                                 ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ The tech spec will be based on PRD requirements.          ║
╚══════════════════════════════════════════════════════════╝
```

## Agents Involved

- **product-owner**: PRD creation, persona definition, prioritization
- **tech-lead**: Technical feasibility review, estimation guidance

## Output Files

| File | Purpose |
|------|---------|
| `prd.md` | Product Requirements Document |
| `personas.md` | User persona definitions |
| `backlog/epics/` | EPIC definitions |
| `backlog/user-stories/` | User Story files |
| `sprints/sprint-001/` | First sprint structure |

## Continue Option

If interrupted, use `--continue` to resume:

```bash
/workflow:plan --continue

# Detects:
# ✅ PRD complete
# ⏳ Backlog in progress (12/18 stories)
# → Continues from story 13
```

## Related Commands

- `/workflow:init` - Initialize workflow
- `/workflow:analyze` - Previous phase (Enterprise)
- `/workflow:design` - Next phase
- `/workflow:status` - Check progress
- `/project:generate-prd` - Direct PRD generation
- `/project:generate-backlog` - Direct backlog generation
