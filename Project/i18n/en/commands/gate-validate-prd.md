---
description: Validate PRD against quality gate (≥80%)
argument-hint: [prd-file]
---

# Validate PRD Gate

Validate a Product Requirements Document against the PRD quality gate.
The PRD must score at least 80% to pass.

## Arguments

$ARGUMENTS (format: [prd-file])
- **prd-file** (optional): Path to PRD file. Default: `docs/prd.md`

## Gate Criteria

| Criterion | Weight | Required | Description |
|-----------|--------|----------|-------------|
| Problem Statement | 15% | Yes | Clear articulation of the problem |
| Target Users | 15% | Yes | Defined audience/personas |
| Goals/Objectives | 15% | Yes | Measurable goals |
| Success Metrics | 15% | Yes | KPIs and measurements |
| Scope/Boundaries | 10% | Yes | What's in/out of scope |
| User Stories Overview | 10% | Yes | High-level feature list |
| Assumptions | 10% | No | Documented assumptions |
| Risks | 10% | No | Risk identification |

**Threshold: 80%**

## Process

### Step 1: Locate PRD file

1. Use provided path or default `docs/prd.md`
2. Verify file exists
3. Load content for analysis

### Step 2: Validate each criterion

For each criterion, check:
- Content exists with relevant keywords
- Section has minimum content length
- Required elements are present

### Step 3: Calculate score

Score calculation:
- Each criterion has a weight (percentage)
- Passing a criterion adds its weight to the score
- Final score = sum of passed weights

### Step 4: Generate report

Show:
- Individual criterion results
- Total score and threshold
- Pass/Fail status
- Suggestions for improvement

## Output Format

### Passing PRD

```
═══════════════════════════════════════════════════════
            PRD Quality Gate Validation
═══════════════════════════════════════════════════════

File: docs/prd.md
Threshold: 80%

Validation Results:
──────────────────────────────────────────────────────
✅ Problem Statement (15%)
   Found: Clear problem definition in "Overview" section

✅ Target Users (15%)
   Found: 3 personas defined

✅ Goals/Objectives (15%)
   Found: 5 measurable objectives

✅ Success Metrics (15%)
   Found: KPIs with numeric targets

✅ Scope/Boundaries (10%)
   Found: In-scope and out-of-scope sections

✅ User Stories Overview (10%)
   Found: 12 user stories referenced

✅ Assumptions (10%)
   Found: 4 assumptions documented

⚠️ Risks (10%)
   Partial: Risks listed but no mitigations

Score: 90/100 (90%)
──────────────────────────────────────────────────────

✅ PRD GATE PASSED

Ready to proceed to Tech Spec phase.
Next: /pm:handoff architect
═══════════════════════════════════════════════════════
```

### Failing PRD

```
═══════════════════════════════════════════════════════
            PRD Quality Gate Validation
═══════════════════════════════════════════════════════

File: docs/prd.md
Threshold: 80%

Validation Results:
──────────────────────────────────────────────────────
✅ Problem Statement (15%)
✅ Target Users (15%)
❌ Goals/Objectives (15%)
   Missing: No measurable goals found
❌ Success Metrics (15%)
   Missing: No KPIs or metrics defined
✅ Scope/Boundaries (10%)
⚠️ User Stories Overview (10%)
   Partial: Only 1 story mentioned
❌ Assumptions (10%)
   Missing: No assumptions section
❌ Risks (10%)
   Missing: No risk assessment

Score: 50/100 (50%)
──────────────────────────────────────────────────────

❌ PRD GATE FAILED (need 80%, got 50%)

Required Actions:
──────────────────────────────────────────────────────
1. Add measurable goals with specific targets
   Example: "Reduce checkout time by 30%"

2. Define success metrics and KPIs
   Example: "Conversion rate > 5%"

3. Document assumptions
   Example: "Users have stable internet"

4. Add risk assessment
   Example: "Risk: API rate limits; Mitigation: caching"

Re-run after fixes: /gate:validate-prd
═══════════════════════════════════════════════════════
```

## Example

```
/gate:validate-prd
/gate:validate-prd docs/feature-prd.md
```

## Integration

This gate is checked:
1. Manually via this command
2. Before `/pm:handoff architect`
3. In the BMAD workflow transition

Gate configuration: `.bmad/gates/prd-gate.yaml`
