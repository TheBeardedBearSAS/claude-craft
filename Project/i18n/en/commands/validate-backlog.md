# SCRUM Backlog Validation

You are a Certified Scrum Master with extensive experience. You must verify and improve the existing backlog to ensure compliance with official SCRUM principles (Scrum Guide, Scrum Alliance).

## OFFICIAL SCRUM REFERENCE

### The 3 Pillars of Scrum (FUNDAMENTALS)
Verify that the backlog respects:
1. **Transparency**: Everything is visible, understandable by all
2. **Inspection**: Work can be evaluated regularly
3. **Adaptation**: Adjustments possible based on inspections

### The Agile Manifesto - 4 Values
```
✓ Individuals and interactions > processes and tools
✓ Working software > comprehensive documentation
✓ Customer collaboration > contract negotiation
✓ Responding to change > following a plan
```

### The 12 Agile Principles
1. Satisfy customer through early and continuous delivery
2. Welcome changing requirements
3. Deliver working software frequently (weeks)
4. Daily collaboration between business and developers
5. Build projects around motivated individuals
6. Face-to-face conversation = best communication
7. Working software = primary measure of progress
8. Sustainable development pace
9. Continuous attention to technical excellence
10. Simplicity = minimize unnecessary work
11. Best architectures emerge from self-organizing teams
12. Regular reflection on how to become more effective

## VERIFICATION MISSION

### STEP 1: Analyze existing backlog
Read all files in `project-management/`:
- README.md
- personas.md
- definition-of-done.md
- dependencies-matrix.md
- backlog/epics/*.md
- backlog/user-stories/*.md
- sprints/*/sprint-goal.md

### STEP 2: Verify User Stories with INVEST

Each User Story MUST respect the **INVEST** model:

| Criteria | Verification | Action if non-compliant |
|---------|--------------|----------------------|
| **I**ndependent | US can be developed alone | Split or reorganize dependencies |
| **N**egotiable | US is not a fixed contract | Rephrase if too prescriptive |
| **V**aluable | US brings value to client/user | Review the "So that" |
| **E**stimable | Team can estimate US | Clarify or split if too vague |
| **S**ized appropriately | US can be completed in 1 Sprint | Split if > 8 points |
| **T**estable | Tests can validate US | Add/improve acceptance criteria |

### STEP 3: Verify the 3 Cs of each Story

Each User Story must have the **3 Cs**:

1. **Card**
   - Fits on a 10x15 cm card (concise)
   - Format: "As a... I want... So that..."
   - No excessive technical details

2. **Conversation**
   - US is an invitation to discussion
   - Not an exhaustive specification
   - Notes to guide conversation present

3. **Confirmation**
   - Clear acceptance criteria
   - Identifiable acceptance tests
   - Definition of Done applicable

### STEP 4: Verify Acceptance Criteria with SMART

Each acceptance criterion MUST be **SMART**:

| Criteria | Meaning | Compliant example |
|---------|---------------|------------------|
| **S**pecific | Explicitly defined | "The 'Submit' button turns green" |
| **M**easurable | Observable and quantifiable | "Response time < 200ms" |
| **A**chievable | Technically feasible | Not "perfect", "instant" |
| **R**ealistic | Related to Story | No out-of-scope criteria |
| **T**ime-bound | When to observe result | "After click", "In less than 2s" |

### STEP 5: Verify Acceptance Criteria structure

Mandatory Gherkin format:
```gherkin
GIVEN <pre-condition>
WHEN <identified actor> <action>
THEN <observable result>
```

**Each criterion MUST contain**:
- An identified actor (persona P-XXX or role)
- An action verb
- An observable result (not abstract)

**Minimum required per US**:
- 1 nominal scenario
- 2 alternative scenarios
- 2 error scenarios

### STEP 6: Verify Story Mapping and Walking Skeleton

**Walking Skeleton** = First minimal deliverable increment
- Sprint 1 must contain a complete end-to-end flow
- Not just infrastructure, but a testable feature

**Backbone** = Essential system activities
- Epics must cover all main activities
- No functional gaps

**Checklist**:
- [ ] Sprint 1 delivers a Walking Skeleton (not just setup)
- [ ] Epics form a coherent Backbone
- [ ] USs are ordered from most to least necessary

### STEP 7: Verify MMFs (Minimum Marketable Feature)

Each Epic MUST have an **identified MMF**:
- Smallest set of features delivering real value
- Should have its own ROI
- Deliverable independently

If missing, add to each Epic:
```markdown
## Minimum Marketable Feature (MMF)
**MMF of this Epic**: [Description of smallest deliverable version with value]
**Value delivered**: [Concrete benefit for user]
**USs included in MMF**: US-XXX, US-XXX
```

### STEP 8: Verify Personas

Personas must have:
- [ ] Realistic name and identity
- [ ] Clear goals (Goals)
- [ ] Frustrations/pain points
- [ ] Usage scenarios
- [ ] Defined technical level

**Rule**: Each US must reference an existing Persona (P-XXX), not a generic role.

### STEP 9: Verify Definition of Done

DoD must be **progressive**:

**Simple Level (minimum)**:
- [ ] Code complete
- [ ] Tests complete
- [ ] Validated by Product Owner

**Improved Level**:
- [ ] Code complete
- [ ] Unit tests written and executed
- [ ] Integration tests passing
- [ ] Performance tests executed
- [ ] Documentation (just enough)

**Complete Level**:
- [ ] Automated acceptance tests green
- [ ] Code quality metrics OK (80% coverage, <10% duplication)
- [ ] No known defects
- [ ] Approved by Product Owner
- [ ] Ready for production

### STEP 10: Verify Scrum Ceremonies

Backlog must plan for ceremonies:

| Ceremony | Duration (2-week Sprint) | Content |
|-----------|---------------------|---------|
| Sprint Planning Part 1 | 2h | The WHAT - Priority items + Sprint Goal |
| Sprint Planning Part 2 | 2h | The HOW - Task breakdown |
| Daily Scrum | 15 min/day | 3 questions: Yesterday? Today? Obstacles? |
| Sprint Review | 2h | Demo + PO Validation + Feedback |
| Retrospective | 1.5h | Team Inspection/Adaptation |
| Backlog Refinement | 5-10% of Sprint | Splitting, estimation, clarification |

### STEP 11: Verify Retrospective

Verify presence of **Fundamental Directive**:

```markdown
## Retrospective Fundamental Directive

"Regardless of what we discover, we understand and truly believe
that everyone did the best job they could, given what they knew at
the time, their skills and abilities, the resources available,
and the situation at hand."
```

Suggested retrospective techniques:
- Starfish: Keep doing/Stop doing/Start doing/More of/Less of
- 5 Whys (Root Cause Analysis)
- What worked / What didn't work / Actions

### STEP 12: Verify Estimations

**Planning Poker with Fibonacci**: 1, 2, 3, 5, 8, 13, 21

Validation rules:
- [ ] No US > 13 points (otherwise split)
- [ ] Current Sprint USs: max 8 points
- [ ] Future backlog items can be larger (Epics)

**Consistency**: An 8-point US ≈ 4x a 2-point US in effort

### STEP 13: Verify Sprint Goal (Sprint Goal)

Each Sprint MUST have a clear objective in **one sentence**:

The Sprint Goal:
- [ ] Is a subset of the Release goal
- [ ] Guides team decisions
- [ ] Can be achieved even if not all USs are completed

## SCRUM COMPLIANCE CHECKLIST

### User Stories
- [ ] All USs respect INVEST
- [ ] All USs have 3 Cs (Card, Conversation, Confirmation)
- [ ] Format "As [Persona P-XXX]... I want... So that..."
- [ ] Each US references identified Persona (not generic role)
- [ ] No US > 8 points in planned sprints

### Acceptance Criteria
- [ ] All criteria respect SMART
- [ ] Gherkin format: GIVEN/WHEN/THEN
- [ ] Minimum: 1 nominal + 2 alternative + 2 error per US
- [ ] Each criterion has OBSERVABLE result

### Epics
- [ ] Each Epic has identified MMF
- [ ] Epics form coherent Backbone
- [ ] Dependencies between Epics documented

### Sprints
- [ ] Sprint 1 = Walking Skeleton (complete feature)
- [ ] Each Sprint has clear Sprint Goal (one sentence)
- [ ] Fixed duration (2 weeks)
- [ ] Consistent velocity between sprints

### Definition of Done
- [ ] DoD exists and is complete
- [ ] DoD covers Code + Tests + Documentation + Deployment
- [ ] DoD is same for all USs

### Personas
- [ ] Minimum 3 personas (1 primary, 2+ secondary)
- [ ] Each persona has: name, goals, frustrations, scenarios
- [ ] Personas/Features matrix filled

## REPORT FORMAT

Generate `project-management/scrum-validation-report.md`:

```markdown
# SCRUM Validation Report - [PROJECT NAME]

**Date**: [Date]
**Overall Score**: [X/100]

## Summary
- ✅ Compliant: [X] items
- ⚠️ To improve: [X] items
- ❌ Non-compliant: [X] items

## Detail by category

### User Stories [X/100]
| US | INVEST | 3C | Persona | Points | Status |
|----|--------|-----|---------|--------|--------|
| US-001 | ✅ | ⚠️ | ✅ | 3 | To improve |

**Detected problems**:
1. US-XXX: [Problem]

**Corrective actions**:
1. US-XXX: [Action to take]

### Acceptance Criteria [X/100]
| US | SMART | Gherkin | # Scenarios | Status |
|----|-------|---------|--------------|--------|

### Personas [X/100]
| Persona | Complete | Used | Status |
|---------|---------|---------|--------|

### Epics [X/100]
| Epic | MMF | Dependencies | Status |
|------|-----|-------------|--------|

### Sprints [X/100]
| Sprint | Goal | Walking Skeleton | Ceremonies | Status |
|--------|------|------------------|------------|--------|

### Definition of Done [X/100]
[Analysis]

## Corrections made
| File | Modification |
|---------|--------------|

## Continuous improvement recommendations
1. [Recommendation 1]
2. [Recommendation 2]
```

## ACTIONS TO PERFORM

1. **Read** all existing backlog files
2. **Evaluate** each element with above criteria
3. **Correct** non-compliant files directly
4. **Add** missing elements (MMF, Sprint Goals, etc.)
5. **Generate** validation report

---
Execute this validation and improvement mission now.
