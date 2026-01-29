---
description: Synchronize backlog files with sprint-status.yaml
argument-hint: [--direction source] [--dry-run]
---

# Sync Backlog

Bidirectional synchronization between markdown backlog files and sprint-status.yaml.

## Arguments

$ARGUMENTS (format: [--direction source] [--dry-run])
- **--direction** (optional): Sync direction
  - `files-to-yaml`: Update sprint-status.yaml from markdown files
  - `yaml-to-files`: Update markdown files from sprint-status.yaml
  - `bidirectional`: Merge both (default, newest wins)
- **--dry-run** (optional): Preview changes without applying

## Process

### Step 1: Load both sources

1. Parse `.bmad/sprint-status.yaml`
2. Parse all story files from backlog directory
3. Build comparison map by story ID

### Step 2: Detect conflicts

For each story, compare:
- Status
- Task completion counts
- Acceptance criteria validation
- TDD phase
- Assignment

Conflict detection:
```yaml
conflicts:
  US-001:
    field: status
    yaml_value: "in-progress"
    file_value: "🟢 Done"
    yaml_timestamp: "2026-01-29T09:00:00Z"
    file_timestamp: "2026-01-29T10:00:00Z"
    resolution: "file"  # newer wins
```

### Step 3: Resolve conflicts

Resolution strategies:
1. **newest-wins** (default): Use most recently modified value
2. **yaml-wins**: Always prefer sprint-status.yaml
3. **files-win**: Always prefer markdown files
4. **prompt**: Ask user for each conflict

### Step 4: Sync files → YAML

Update sprint-status.yaml with:
- New stories found in files
- Status changes from files
- Task updates from files
- AC validation from files

### Step 5: Sync YAML → files

Update markdown files with:
- TDD phase (add to metadata comment)
- History (add to metadata comment)
- INVEST score (add to metadata comment)
- Sync timestamp

### Step 6: Handle orphans

- **Stories in YAML but not in files**: Mark as `archived` or warn
- **Stories in files but not in YAML**: Add to sprint-status.yaml

### Step 7: Update timestamps

Add last sync timestamp to both:
- `.bmad/sprint-status.yaml`: `last_sync: "2026-01-29T10:00:00Z"`
- Story files: `<!-- last_sync: 2026-01-29T10:00:00Z -->`

## Output Format

```
🔄 Backlog Synchronization
==========================

## Direction: Bidirectional

## Changes Detected

### Files → YAML (4 changes)
| Story | Field | Old | New |
|-------|-------|-----|-----|
| US-001 | status | in-progress | done |
| US-002 | tasks.completed | 2 | 3 |

### YAML → Files (2 changes)
| Story | Field | Old | New |
|-------|-------|-----|-----|
| US-003 | tdd_phase | - | green |
| US-004 | invest_score | - | 5/6 |

## Conflicts Resolved

| Story | Field | Resolution | Value |
|-------|-------|------------|-------|
| US-005 | status | newest-wins | done |

## Orphans

### In YAML only (archived):
- US-010: "Old feature" (archived on 2026-01-15)

### In files only (added to YAML):
- US-015: "New feature"

## Sync Complete

✅ sprint-status.yaml updated
✅ 12 story files updated
⏰ Last sync: 2026-01-29T10:00:00Z

## Next Steps
- Review changes in git diff
- Run `/sprint:status` to verify
```

## Dry Run Output

```
🔄 Backlog Synchronization (DRY RUN)
====================================

⚠️ No changes will be made

## Would Change:

### sprint-status.yaml
- US-001.status: "in-progress" → "done"
- US-002.tasks.completed: 2 → 3

### Story Files
- US-003: Add tdd_phase metadata
- US-004: Add invest_score metadata

Run without --dry-run to apply changes.
```

## Example

```
/project:sync-backlog
/project:sync-backlog --direction files-to-yaml
/project:sync-backlog --direction yaml-to-files --dry-run
```

## Automation

Add to pre-commit hook for automatic sync:
```bash
# .bmad/hooks/pre-commit.sh
/project:sync-backlog --direction files-to-yaml
```
