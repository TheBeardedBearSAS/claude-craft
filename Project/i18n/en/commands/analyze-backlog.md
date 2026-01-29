---
description: Analyze existing backlog structure for BMAD migration
argument-hint: [--format json|yaml|md]
---

# Analyze Backlog

Analyze the current backlog structure to prepare for BMAD v6 migration.

## Arguments

$ARGUMENTS (format: [--format output_format])
- **--format** (optional): Output format (json, yaml, md). Default: md

## Process

### Step 1: Detect backlog location

Search for backlog files in common locations:
1. `project-management/backlog/` (claude-craft standard)
2. `docs/backlog/` (alternative)
3. `backlog/` (simple)
4. `.bmad/` (if already migrated)

### Step 2: Analyze structure

For each location found, identify:
- **Epics**: Files matching `EPIC-*.md` or `epic*.md`
- **User Stories**: Files matching `US-*.md` or `story*.md`
- **Tasks**: Files matching `TASK-*.md` or embedded in stories
- **Index files**: `index.md`, `backlog.md`, `README.md`

### Step 3: Parse metadata

For each file, extract:
- ID (EPIC-XXX, US-XXX, TASK-XXX)
- Title/Name
- Status (🔴 To Do, 🟡 In Progress, 🟢 Done, ⏸️ Blocked)
- Sprint assignment
- Story points (for US)
- Parent relationships (US → EPIC, TASK → US)
- Acceptance criteria count
- Task count and completion

### Step 4: Validate INVEST compliance

For each User Story, check:
- [ ] **I**ndependent: No blocking dependencies
- [ ] **N**egotiable: Has description (not just title)
- [ ] **V**aluable: Has benefit/value statement
- [ ] **E**stimable: Has story points
- [ ] **S**mall: ≤ 8 points
- [ ] **T**estable: Has acceptance criteria

Score each story (0-6 checks passed).

### Step 5: Identify migration gaps

Check for BMAD v6 compatibility:
- [ ] TDD phase tracking (red/green/refactor)
- [ ] Task list with completion tracking
- [ ] Status history
- [ ] Sprint assignment
- [ ] Acceptance criteria validation status

### Step 6: Generate compatibility report

Create report with:
1. **Summary**: Total epics, stories, tasks found
2. **Structure**: Current file organization
3. **INVEST Scores**: Per-story compliance
4. **Migration Gaps**: Missing BMAD v6 fields
5. **Recommendations**: Suggested actions

## Output Format

```
📊 Backlog Analysis Report
========================

## Summary
- Location: project-management/backlog/
- Format: Markdown (claude-craft standard)
- Epics: {COUNT}
- User Stories: {COUNT}
- Tasks: {COUNT}

## Structure
```
project-management/backlog/
├── index.md
├── epics/
│   ├── EPIC-001-*.md
│   └── EPIC-002-*.md
└── user-stories/
    ├── US-001-*.md
    └── US-002-*.md
```

## INVEST Compliance

| Story ID | Title | Score | Missing |
|----------|-------|-------|---------|
| US-001 | Login | 5/6 | Estimable |
| US-002 | Signup | 6/6 | - |

Average INVEST Score: {AVG}/6

## Migration Gaps

| Field | Stories Missing | Action Required |
|-------|-----------------|-----------------|
| tdd_phase | 100% | Add to all |
| tasks.list | 60% | Decompose |
| history | 100% | Initialize |

## Recommendations

1. ⚠️ {COUNT} stories missing story points
2. ⚠️ {COUNT} stories without acceptance criteria
3. ✅ Structure compatible with BMAD v6
4. 📝 Run `/project:migrate-backlog` to upgrade
```

## Example

```
/project:analyze-backlog
/project:analyze-backlog --format yaml
```

## Next Steps

After analysis:
- `/project:migrate-backlog` - Convert to BMAD v6 format
- `/project:update-stories` - Add missing fields
- `/project:sync-backlog` - Sync with sprint-status.yaml
