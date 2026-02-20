---
description: Validate spec-code alignment to ensure implementation matches specifications
argument-hint: [story-id]
---

# Validate Spec-Code Alignment

Validate that the code implementation aligns with the specifications (PRD, user stories, tech spec). This gate ensures no specification drift has occurred during implementation.

## Arguments

$ARGUMENTS (format: [story-id])
- **story-id** (optional): Story ID to check alignment for. Default: all stories in current sprint

## Gate Criteria

| Criterion | Weight | Required | Description |
|-----------|--------|----------|-------------|
| Requirement coverage | 20% | Yes | All FR-xxx from PRD are covered by stories |
| Story-code mapping | 20% | Yes | All stories have corresponding code references |
| AC-test mapping | 20% | Yes | All acceptance criteria have corresponding tests |
| Tech spec adherence | 15% | Yes | Implementation follows tech spec design |
| Constitution compliance | 15% | Yes | Code respects project constitution |
| Scope drift detection | 10% | No | No unreferenced code changes |

**Threshold: 85%**

## Process

### Step 1: Load Specifications

1. Load PRD with FR-xxx requirement IDs
2. Load user stories with `Implements:` references
3. Load tech spec with requirement mapping
4. Load project constitution (if exists)

### Step 2: Trace Forward (Spec → Code)

For each requirement FR-xxx in the PRD:
1. Find stories that implement it (`Implements: FR-xxx`)
2. For each story, find code files with `// Story: US-xxx`
3. For each AC, find corresponding test
4. Record coverage status

### Step 3: Trace Backward (Code → Spec)

For each code file with story references:
1. Verify the story reference exists in the backlog
2. Verify the story is assigned to the correct sprint
3. Check for code changes without story references (scope drift)

### Step 4: Validate Constitution

If `project-management/constitution.md` exists:
1. Check technical constraints compliance
2. Verify design principles adherence
3. Check NFR targets

### Step 5: Score and Report

Calculate weighted score across all criteria. Generate detailed report.

## Output Format

### Passing Gate

```
╔══════════════════════════════════════════════════════════╗
║          SPEC-CODE ALIGNMENT GATE ✅                     ║
╠══════════════════════════════════════════════════════════╣
║ Story: US-012 | Score: 92%                               ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ ✅ Requirement coverage      3/3 FR-xxx covered (100%)   ║
║ ✅ Story-code mapping        4 files reference US-012     ║
║ ✅ AC-test mapping           3/3 ACs have tests           ║
║ ✅ Tech spec adherence       Design matches spec          ║
║ ✅ Constitution compliance   All constraints met          ║
║ ⚠️  Scope drift              1 unreferenced file found    ║
║                                                          ║
║ → Alignment verified, ready for merge                    ║
╚══════════════════════════════════════════════════════════╝
```

### Failing Gate

```
╔══════════════════════════════════════════════════════════╗
║          SPEC-CODE ALIGNMENT GATE ❌                     ║
╠══════════════════════════════════════════════════════════╣
║ Story: US-012 | Score: 65%                               ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ ✅ Requirement coverage      3/3 FR-xxx covered           ║
║ ❌ Story-code mapping        2 files missing references   ║
║ ❌ AC-test mapping           AC-2 has no test             ║
║ ✅ Tech spec adherence       Design matches spec          ║
║ ❌ Constitution compliance   Perf NFR not met             ║
║ ⚠️  Scope drift              3 unreferenced files         ║
║                                                          ║
║ Actions required:                                        ║
║ 1. Add // Story: US-012 to ProfileService.ts             ║
║ 2. Add // Story: US-012 to ProfileValidator.ts           ║
║ 3. Write test for AC-2: User can edit email              ║
║ 4. Optimize profile API to meet <200ms target            ║
║                                                          ║
║ → Fix issues before merging                              ║
╚══════════════════════════════════════════════════════════╝
```

## Example

```
/gate:validate-alignment US-012
/gate:validate-alignment          # All stories in current sprint
```

## Related Commands

- `/project:trace` — View traceability matrix
- `/project:coverage-map` — Check requirement coverage
- `/project:checkpoint` — Run phase-specific checkpoints
- `/gate:validate-story` — Validate story completeness
