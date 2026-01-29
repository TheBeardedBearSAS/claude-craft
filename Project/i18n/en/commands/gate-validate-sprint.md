---
description: Validate sprint readiness before starting
argument-hint: [--verbose]
---

# Validate Sprint Gate

Validate that the sprint is properly planned and ready to start.
All required criteria must be met.

## Arguments

$ARGUMENTS (format: [--verbose])
- **--verbose** (optional): Show detailed story breakdown

## Sprint Ready Criteria

| Criterion | Weight | Required | Description |
|-----------|--------|----------|-------------|
| Sprint Metadata | 20% | Yes | ID, name, dates defined |
| Sprint Goal | 15% | Yes | Clear goal statement |
| Stories Ready | 25% | Yes | Stories in ready-for-dev |
| Stories Estimated | 20% | Yes | All stories have points |
| Capacity Check | 10% | No | Points within capacity |
| Dependencies Resolved | 10% | No | No blocked ready stories |

**Threshold: All required criteria**

## Process

### Step 1: Load sprint status

1. Read `.bmad/sprint-status.yaml`
2. Extract metadata
3. Count stories by status

### Step 2: Validate metadata

Check required fields:
- `metadata.sprint_id` - Sprint identifier
- `metadata.name` - Sprint name
- `metadata.start_date` - Start date
- `metadata.end_date` - End date
- `metadata.goal` - Sprint goal (min 10 chars)

### Step 3: Validate stories

Check story readiness:
- At least 1 story in `ready-for-dev`
- All stories have story points
- No blocked stories in ready status

### Step 4: Optional capacity check

If `metadata.capacity_points` defined:
- Sum of ready story points ≤ capacity + 20%

### Step 5: Generate report

Show sprint readiness status.

## Output Format

### Sprint Ready

```
═══════════════════════════════════════════════════════
           Sprint Ready Gate Validation
═══════════════════════════════════════════════════════

Sprint: sprint-3 - User Management
Period: 2026-01-29 → 2026-02-12 (14 days)

Validation Results:
──────────────────────────────────────────────────────
✅ Sprint Metadata (20%)
   ID: sprint-3
   Name: User Management
   Start: 2026-01-29
   End: 2026-02-12

✅ Sprint Goal (15%)
   "Implement core user management features including
    registration, login, and profile management"

✅ Stories Ready (25%)
   5 stories in ready-for-dev status
   Total points: 21

✅ Stories Estimated (20%)
   All 8 stories have story points

✅ Capacity Check (10%)
   Planned: 21 points
   Capacity: 25 points
   Utilization: 84%

✅ Dependencies Resolved (10%)
   No blocked stories in ready status

Score: 100/100
──────────────────────────────────────────────────────

✅ SPRINT READY GATE PASSED

Sprint can be started.

Ready Stories:
  📖 US-010: User registration (5 pts)
  📖 US-011: User login (5 pts)
  📖 US-012: Profile page (5 pts)
  📖 US-013: Password reset (3 pts)
  📖 US-014: Email verification (3 pts)

Commands:
  /sprint:start           Start the sprint
  /sprint:next-story     Pick first story
═══════════════════════════════════════════════════════
```

### Sprint Not Ready

```
═══════════════════════════════════════════════════════
           Sprint Ready Gate Validation
═══════════════════════════════════════════════════════

Sprint: (not configured)

Validation Results:
──────────────────────────────────────────────────────
❌ Sprint Metadata (20%)
   Missing: sprint_id
   Missing: start_date
   Missing: end_date

❌ Sprint Goal (15%)
   Missing: No goal defined

⚠️ Stories Ready (25%)
   Only 1 story in ready-for-dev
   Recommended: at least 3 stories

❌ Stories Estimated (20%)
   3 stories missing story points:
   - US-010: User registration
   - US-012: Profile page
   - US-015: Settings page

⏳ Capacity Check (10%)
   Skipped: No capacity defined

⚠️ Dependencies Resolved (10%)
   1 ready story is blocked:
   - US-011: Blocked by external API

Score: 35/100
──────────────────────────────────────────────────────

❌ SPRINT READY GATE FAILED

Required Actions:
──────────────────────────────────────────────────────
1. Configure sprint metadata
   Edit .bmad/sprint-status.yaml:
   ```yaml
   metadata:
     sprint_id: "sprint-3"
     name: "User Management"
     start_date: "2026-01-29"
     end_date: "2026-02-12"
     goal: "Implement user management features"
   ```

2. Define sprint goal
   Add clear, measurable goal

3. Estimate missing stories
   /project:update-story US-010 --points 5
   /project:update-story US-012 --points 5
   /project:update-story US-015 --points 3

4. Resolve blocked stories
   US-011 blocked by: external API dependency
   Options:
   - Remove from sprint
   - Unblock dependency
   - Re-order stories

Re-run: /gate:validate-sprint
═══════════════════════════════════════════════════════
```

## Example

```
/gate:validate-sprint
/gate:validate-sprint --verbose
```

## Sprint Configuration

Configure sprint in `.bmad/sprint-status.yaml`:

```yaml
metadata:
  sprint_id: "sprint-3"
  name: "User Management"
  start_date: "2026-01-29"
  end_date: "2026-02-12"
  goal: "Implement core user management features"
  capacity_points: 25  # Optional: team capacity
```

Gate configuration: `.bmad/gates/sprint-ready-gate.yaml`
