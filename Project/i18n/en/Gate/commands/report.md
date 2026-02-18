---
description: Show comprehensive quality gates report
argument-hint: [--detailed]
---

# Quality Gates Report

Generate a comprehensive report of all BMAD quality gates status.

## Arguments

$ARGUMENTS (format: [--detailed])
- **--detailed** (optional): Include validation details for each gate

## Process

### Step 1: Identify applicable gates

Determine which gates apply based on project state:
- PRD Gate: If PRD file exists
- Tech Spec Gate: If tech spec file exists
- Backlog Gate: If stories exist in sprint-status
- Sprint Ready Gate: If sprint metadata exists
- Story Gates: For each in-progress/review story

### Step 2: Run validations

Execute each applicable gate validator:
1. PRD validation (if docs/prd.md exists)
2. Tech Spec validation (if docs/tech-spec.md exists)
3. Backlog INVEST validation
4. Sprint readiness validation
5. Individual story DoD validations

### Step 3: Aggregate results

Compile results into summary report.

### Step 4: Generate recommendations

Based on failures, suggest prioritized actions.

## Output Format

### Summary Report

```
═══════════════════════════════════════════════════════
            BMAD Quality Gates Report
═══════════════════════════════════════════════════════

Project: claude-craft
Sprint: sprint-3 - User Management
Generated: 2026-01-29 10:00:00

Gate Summary:
══════════════════════════════════════════════════════
| Gate | Threshold | Score | Status |
|------|-----------|-------|--------|
| PRD | 80% | 90% | ✅ PASS |
| Tech Spec | 90% | 92% | ✅ PASS |
| Backlog | 6/6 | 5.8/6 avg | ⚠️ WARN |
| Sprint Ready | 100% | 100% | ✅ PASS |
| Story DoD | 100% | varies | 📊 |

Story DoD Status:
──────────────────────────────────────────────────────
| Story | Status | DoD Score | Gate |
|-------|--------|-----------|------|
| US-010 | in-progress | 45% | ⏳ |
| US-011 | in-progress | 60% | ⏳ |
| US-012 | review | 85% | ⚠️ |
| US-013 | done | 100% | ✅ |

Overall Health: 🟢 Good
──────────────────────────────────────────────────────
4/5 gates passing
8/10 stories on track
No critical blockers

Recommendations:
──────────────────────────────────────────────────────
1. ⚠️ US-002 missing story points (INVEST: E)
   Run: /project:update-story US-002 --points 3

2. ⚠️ US-012 needs code review to complete
   Create PR and request review

3. 💡 Consider adding capacity planning
   Add metadata.capacity_points to sprint config

Commands:
  /gate:validate-prd       Re-run PRD gate
  /gate:validate-backlog   Re-run backlog gate
  /gate:validate-story US-012  Check specific story
═══════════════════════════════════════════════════════
```

### Detailed Report

```
═══════════════════════════════════════════════════════
            BMAD Quality Gates Report (Detailed)
═══════════════════════════════════════════════════════

Project: claude-craft
Sprint: sprint-3 - User Management

═══════════════════════════════════════════════════════
                    PRD Gate
═══════════════════════════════════════════════════════
File: docs/prd.md
Threshold: 80%
Score: 90%
Status: ✅ PASS

Criteria:
  ✅ Problem Statement (15%)
  ✅ Target Users (15%)
  ✅ Goals/Objectives (15%)
  ✅ Success Metrics (15%)
  ✅ Scope/Boundaries (10%)
  ✅ User Stories Overview (10%)
  ✅ Assumptions (10%)
  ⚠️ Risks (10%) - Partial

═══════════════════════════════════════════════════════
                  Tech Spec Gate
═══════════════════════════════════════════════════════
File: docs/tech-spec.md
Threshold: 90%
Score: 92%
Status: ✅ PASS

Criteria:
  ✅ Architecture Overview (12%)
  ✅ Architecture Diagram (10%)
  ✅ Components (12%)
  ✅ Data Model (10%)
  ✅ API Contracts (10%)
  ✅ Security (12%)
  ✅ Performance (8%)
  ⚠️ Error Handling (8%) - Basic
  ✅ Testing Strategy (10%)
  ✅ Deployment (8%)

═══════════════════════════════════════════════════════
                  Backlog Gate
═══════════════════════════════════════════════════════
Stories: 10
Threshold: 6/6 INVEST
Average Score: 5.8/6
Status: ⚠️ WARNING

Stories with issues:
  ⚠️ US-002: 5/6 (missing: Estimable)
  ⚠️ US-008: 5/6 (missing: Small - 10 points)

═══════════════════════════════════════════════════════
                Sprint Ready Gate
═══════════════════════════════════════════════════════
Sprint: sprint-3
Threshold: 100%
Score: 100%
Status: ✅ PASS

Criteria:
  ✅ Sprint Metadata
  ✅ Sprint Goal
  ✅ Stories Ready (5)
  ✅ Stories Estimated
  ✅ Capacity Check (84%)
  ✅ Dependencies Resolved

═══════════════════════════════════════════════════════
                  Story DoD Gates
═══════════════════════════════════════════════════════

US-010: User registration
  Status: in-progress
  DoD Score: 45%
  ❌ Tasks: 2/5
  ❌ Tests: red phase
  ⚠️ AC: 1/3
  ❌ Review: not started

US-011: User login
  Status: in-progress
  DoD Score: 60%
  ⚠️ Tasks: 3/4
  ✅ Tests: green phase
  ⚠️ AC: 2/3
  ❌ Review: not started

US-012: Profile page
  Status: review
  DoD Score: 85%
  ✅ Tasks: 4/4
  ✅ Tests: refactor phase
  ✅ AC: 3/3
  ⚠️ Review: pending approval

US-013: Password reset
  Status: done
  DoD Score: 100%
  ✅ All criteria met

═══════════════════════════════════════════════════════
                   Action Items
═══════════════════════════════════════════════════════

Priority 1 (Blocking):
  None

Priority 2 (Should fix):
  1. US-002: Add story points estimate
  2. US-008: Split into smaller stories

Priority 3 (Nice to have):
  1. Add risk mitigations to PRD
  2. Enhance error handling in tech spec
═══════════════════════════════════════════════════════
```

## Example

```
/gate:report
/gate:report --detailed
```

## Gate Configuration

Gates are configured in `.bmad/gates/`:
- `prd-gate.yaml`
- `techspec-gate.yaml`
- `backlog-gate.yaml`
- `story-gate.yaml`
- `sprint-ready-gate.yaml`

## Integration

The report can be:
1. Generated on demand via this command
2. Included in sprint retrospective
3. Used for project health monitoring
4. Exported for stakeholder reporting

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Run the specific gate that needs attention:             ║
║                                                          ║
║  • /gate:validate-prd      — PRD quality gate            ║
║  • /gate:validate-techspec — Tech spec gate              ║
║  • /gate:validate-backlog  — Backlog gate                ║
║  • /gate:validate-sprint   — Sprint readiness gate       ║
║  • /gate:validate-story    — Story DoD gate              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
