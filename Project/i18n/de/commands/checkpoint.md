---
name: checkpoint
description: Run spec verification checkpoints before and after implementation phases
arguments:
  - name: phase
    description: "Checkpoint phase: pre-sprint, pre-impl, post-impl, pre-merge"
    required: true
  - name: story
    description: Story ID to validate (e.g., US-001)
    required: false
  - name: sprint
    description: Sprint ID to validate (e.g., Sprint-3)
    required: false
---

# /project:checkpoint

## Mission

Run automated verification checkpoints at critical phases of the development lifecycle to ensure specs are coherent, complete, and aligned with implementation. Each phase validates different aspects of spec-code alignment.

## Prerequisites

- `project-management/prd.md` exists with FR-xxx requirement IDs
- `project-management/backlog/` contains user stories
- `.bmad/sprint-status.yaml` exists for sprint context
- Optional: `project-management/constitution.md` for constitution checks

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Checkpoint Phases

### Phase 1: Pre-Sprint Checkpoint

**When:** Before starting a sprint (after `/workflow:start`)
**What it validates:**

```
╔══════════════════════════════════════════════════════════╗
║           CHECKPOINT: PRE-SPRINT                         ║
╠══════════════════════════════════════════════════════════╣
║ Validating sprint readiness...                           ║
╚══════════════════════════════════════════════════════════╝
```

| Check | Description | Required |
|-------|-------------|----------|
| Story AC completeness | Every story has Gherkin AC | Yes |
| Story estimation | All stories have story points | Yes |
| PRD traceability | Every story references FR-xxx IDs | Yes |
| Task decomposition | Stories have decomposed tasks | Yes |
| Dependency check | No circular or unresolved dependencies | Yes |
| Constitution alignment | Stories don't contradict constitution | No |

**Process:**
1. Load all stories assigned to the sprint
2. For each story, verify AC are in Gherkin format
3. Verify `Implements:` field references valid FR-xxx IDs from PRD
4. Check task decomposition (at least 1 task per story)
5. Verify no circular dependencies in `Depends on:` fields
6. If constitution exists, verify no contradictions
7. Generate pass/fail report

### Phase 2: Pre-Implementation Checkpoint

**When:** Before coding a specific story (after `/sprint:next-story --claim`)
**What it validates:**

```
╔══════════════════════════════════════════════════════════╗
║           CHECKPOINT: PRE-IMPLEMENTATION                 ║
╠══════════════════════════════════════════════════════════╣
║ Validating story readiness for coding...                 ║
╚══════════════════════════════════════════════════════════╝
```

| Check | Description | Required |
|-------|-------------|----------|
| Tech spec coverage | Tech spec covers all story requirements | Yes |
| AC testability | Each AC can be converted to a test | Yes |
| Dependencies resolved | All `Depends on` stories are done | Yes |
| Task clarity | Tasks have clear descriptions | Yes |
| NFR alignment | Implementation respects NFRs from constitution | No |

**Process:**
1. Load the specific story
2. Find corresponding tech spec sections (via `Tech Spec:` reference)
3. Verify tech spec covers each FR-xxx referenced by the story
4. Verify each AC is testable (has GIVEN/WHEN/THEN structure)
5. Check that all blocking stories (`Depends on`) are in status `done`
6. Generate readiness report

### Phase 3: Post-Implementation Checkpoint

**When:** After completing a story (before `/sprint:transition US-xxx review`)
**What it validates:**

```
╔══════════════════════════════════════════════════════════╗
║           CHECKPOINT: POST-IMPLEMENTATION                ║
╠══════════════════════════════════════════════════════════╣
║ Validating implementation completeness...                ║
╚══════════════════════════════════════════════════════════╝
```

| Check | Description | Required |
|-------|-------------|----------|
| Code traceability | Code files reference `// Story: US-xxx` | Yes |
| Test coverage | Tests exist for each AC | Yes |
| All tasks done | Every task in the story is completed | Yes |
| TDD phase | Story is in `refactor` or `done` TDD phase | Yes |
| No regressions | Existing tests still pass | Yes |
| Spec drift | Implementation matches spec (no scope creep) | No |

**Process:**
1. Load the story and its tasks
2. Search codebase for `// Story: US-xxx` or `# Story: US-xxx` references
3. Verify test files exist covering each AC
4. Check all tasks are marked done
5. Verify TDD phase is `refactor` or `done`
6. Run test suite to check for regressions
7. Compare implemented scope with spec scope

### Phase 4: Pre-Merge Checkpoint

**When:** Before merging to main (integrates with `/common:pre-merge-check`)
**What it validates:**

```
╔══════════════════════════════════════════════════════════╗
║           CHECKPOINT: PRE-MERGE                          ║
╠══════════════════════════════════════════════════════════╣
║ Final validation before merge...                         ║
╚══════════════════════════════════════════════════════════╝
```

| Check | Description | Required |
|-------|-------------|----------|
| AC validation | All acceptance criteria are validated | Yes |
| Code review | Code has been reviewed | Yes |
| Test suite green | All tests pass | Yes |
| Constitution respect | Code respects project constitution | Yes |
| Traceability complete | Full chain FR → US → Code → Test exists | Yes |
| Documentation | Relevant docs updated | No |

**Process:**
1. Run all previous checkpoint validations
2. Verify code review status
3. Run full test suite
4. Verify traceability chain completeness using `/project:trace`
5. Check constitution compliance
6. Generate final merge readiness report

## Output Format

### Passing Checkpoint

```
╔══════════════════════════════════════════════════════════╗
║              CHECKPOINT PASSED ✅                         ║
╠══════════════════════════════════════════════════════════╣
║ Phase: pre-sprint                                        ║
║ Sprint: Sprint-3                                         ║
║ Score: 100% (6/6 checks passed)                          ║
║                                                          ║
║ ✅ Story AC completeness          All 5 stories have AC  ║
║ ✅ Story estimation               All stories estimated   ║
║ ✅ PRD traceability               All stories linked      ║
║ ✅ Task decomposition             All stories decomposed  ║
║ ✅ Dependency check               No circular deps        ║
║ ✅ Constitution alignment         No contradictions       ║
║                                                          ║
║ → Ready to proceed                                       ║
╚══════════════════════════════════════════════════════════╝
```

### Failing Checkpoint

```
╔══════════════════════════════════════════════════════════╗
║              CHECKPOINT FAILED ❌                         ║
╠══════════════════════════════════════════════════════════╣
║ Phase: pre-impl                                          ║
║ Story: US-012                                            ║
║ Score: 60% (3/5 checks passed)                           ║
║                                                          ║
║ ✅ AC testability                 3/3 ACs testable        ║
║ ✅ Dependencies resolved          No blockers             ║
║ ✅ Task clarity                   4/4 tasks clear         ║
║ ❌ Tech spec coverage             Missing FR-003 mapping  ║
║ ❌ NFR alignment                  Perf target undefined   ║
║                                                          ║
║ Actions required:                                        ║
║ 1. Add FR-003 coverage to tech spec section 3.2          ║
║ 2. Define performance targets for profile API             ║
║                                                          ║
║ → Fix issues before proceeding                           ║
╚══════════════════════════════════════════════════════════╝
```

## Integration

This command integrates with the existing workflow:

```
/workflow:start       → triggers pre-sprint checkpoint
/sprint:next-story    → suggests pre-impl checkpoint
/sprint:transition    → triggers post-impl checkpoint (to review)
/common:pre-merge-check → triggers pre-merge checkpoint
```

## Example Session

```
User: /project:checkpoint --phase=pre-sprint --sprint=Sprint-3

Claude: Running pre-sprint checkpoint for Sprint-3...

Loading 5 stories assigned to Sprint-3...

✅ AC Completeness: 5/5 stories have Gherkin AC
✅ Estimation: All stories estimated (total: 21 points)
✅ PRD Traceability: All stories linked to FR-xxx IDs
⚠️  Task Decomposition: US-015 has no tasks yet
✅ Dependencies: No circular dependencies
✅ Constitution: No contradictions found

Score: 83% (5/6 passed)
Status: WARNING — 1 issue needs attention

Action: Decompose US-015 into tasks before starting sprint.
```

## Related Commands

- `/project:trace` — View traceability matrix
- `/project:coverage-map` — Check requirement coverage
- `/gate:validate-prd` — Validate PRD quality
- `/gate:validate-story` — Validate story completeness
- `/common:pre-merge-check` — Pre-merge validation
- `/workflow:start` — Start sprint (includes pre-sprint checkpoint)
