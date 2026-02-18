---
description: Update stories to BMAD v6 format with missing fields
argument-hint: [--dry-run] [story-id]
---

# Update Stories

Add missing BMAD v6 fields to existing user stories.

## Arguments

$ARGUMENTS (format: [--dry-run] [story-id])
- **--dry-run** (optional): Preview changes without applying
- **story-id** (optional): Specific story to update (e.g., US-001). If omitted, updates all.

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## Process

### Step 1: Load current state

1. Read `.bmad/sprint-status.yaml`
2. Load story files from backlog
3. Compare fields between file and sprint-status

### Step 2: Identify missing fields

For each story, check for:

| Field | Required | Default if Missing |
|-------|----------|-------------------|
| tdd_phase | Yes | "red" if in-progress, "" otherwise |
| tasks.list | Yes | Extract from ## Tasks section |
| tasks.total | Yes | Count from list |
| tasks.completed | Yes | Count done tasks |
| current_task | No | First in-progress task |
| history | Yes | Initialize with current status |
| acceptance_criteria.total | Yes | Count from AC section |
| acceptance_criteria.validated | Yes | 0 (default) |
| story_points | Yes | Prompt if missing |
| epic_id | No | Extract from file |

### Step 3: Parse task list from markdown

Extract tasks from story file format:
```markdown
## Tasks

| ID | Description | Status |
|----|-------------|--------|
| TASK-001 | Backend endpoint | 🟢 Done |
| TASK-002 | Frontend form | 🟡 In Progress |
```

Convert to BMAD format:
```yaml
tasks:
  list:
    - id: "TASK-001"
      title: "Backend endpoint"
      status: "done"
    - id: "TASK-002"
      title: "Frontend form"
      status: "in-progress"
```

### Step 4: Parse acceptance criteria

Extract from Gherkin format:
```markdown
## Acceptance Criteria

### AC1: Valid login
Given a registered user
When they enter valid credentials
Then they are logged in
Status: ✅ Validated

### AC2: Invalid login
Given a user
When they enter invalid credentials
Then they see an error message
Status: ⏳ Pending
```

Convert to BMAD format:
```yaml
acceptance_criteria:
  total: 2
  validated: 1
  list:
    - id: "AC1"
      title: "Valid login"
      status: "validated"
    - id: "AC2"
      title: "Invalid login"
      status: "pending"
```

### Step 5: Initialize history

If no history exists, create initial entry:
```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: ""
    to: "{current_status}"
    by: "update-stories"
    reason: "History initialized"
```

### Step 6: Validate INVEST compliance

Run INVEST checks and add score:
```yaml
invest_score:
  independent: true
  negotiable: true
  valuable: true
  estimable: true   # false if no story_points
  small: true       # false if > 8 points
  testable: true    # false if no AC
  total: 6
```

### Step 7: Update sprint-status.yaml

Merge updated fields into sprint-status.yaml.

### Step 8: Update story files (optional)

Add BMAD metadata comment to story files:
```markdown
<!-- BMAD v6 Metadata
tdd_phase: green
invest_score: 6/6
last_sync: 2026-01-29T10:00:00Z
-->
```

## Output Format

```
📝 Update Stories to BMAD v6
============================

## Stories Updated: {COUNT}

| Story | Fields Added | INVEST Score |
|-------|--------------|--------------|
| US-001 | tdd_phase, history | 6/6 ✅ |
| US-002 | tasks.list, history | 5/6 ⚠️ |
| US-003 | story_points required | 4/6 ❌ |

## Fields Summary

| Field | Added To | Skipped |
|-------|----------|---------|
| tdd_phase | 10 | 2 (already set) |
| tasks.list | 8 | 4 (already set) |
| history | 12 | 0 |
| invest_score | 12 | 0 |

## Warnings

⚠️ US-003: Missing story points - please estimate
⚠️ US-007: No acceptance criteria - add before development

## Files Modified
- .bmad/sprint-status.yaml
- project-management/backlog/user-stories/US-001-*.md (metadata comment)

## Next Steps
1. Fix warnings: add missing story_points and AC
2. Run `/project:sync-backlog` to verify consistency
3. Run `/gate:validate-backlog` for full validation
```

## Example

```
/project:update-stories --dry-run
/project:update-stories
/project:update-stories US-001
```

## Validation

After update, all stories should pass:
```
/gate:validate-backlog
```
