---
name: critical-path
description: Identify the critical path through story dependencies to optimize sprint execution
arguments:
  - name: sprint
    description: Sprint ID to analyze (e.g., Sprint-3)
    required: false
  - name: velocity
    description: Team velocity in points per sprint for timeline estimation
    required: false
---

# /project:critical-path

## Mission

Identify the critical path through story dependencies — the longest sequence of dependent stories that determines the minimum time to complete all work. Use this to optimize sprint planning and identify where delays would cascade.

## Prerequisites

- `project-management/backlog/` contains user stories with `Depends on:` fields
- Stories have story points estimated
- Optional: `.bmad/sprint-status.yaml` for current progress

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## Workflow

### Step 1: Build Dependency Graph

1. Load all stories (or filter by sprint)
2. Extract `Depends on:` relationships
3. Build a directed acyclic graph (DAG)
4. Validate no circular dependencies exist

### Step 2: Calculate Critical Path

1. Apply topological sort to the dependency graph
2. Calculate earliest start and finish times for each story
3. Calculate latest start and finish times
4. Identify stories with zero slack (critical path)
5. Sum story points along the critical path

### Step 3: Identify Slack

For non-critical stories:
- Calculate total slack (how much delay is acceptable)
- Identify near-critical paths (slack < 2 story points)
- Flag stories that could become critical if delayed

### Step 4: Generate Timeline

```
+==========================================================+
|           CRITICAL PATH ANALYSIS                         |
+==========================================================+
| Sprint: Sprint-3 | Velocity: 21 pts/sprint               |
+==========================================================+
|                                                          |
| Critical Path (13 story points):                         |
| -------------------------------------------------------- |
|                                                          |
| US-001 (5pts) -> US-002 (3pts) -> US-005 (5pts)         |
| [Login Page]    [JWT Tokens]    [Admin Dashboard]        |
|                                                          |
| !! Critical path = 13pts > velocity 21pts                |
|    Minimum: 1 sprint (if no blockers)                    |
|                                                          |
| Near-Critical Paths:                                     |
| -------------------------------------------------------- |
| US-001 (5pts) -> US-004 (3pts)  [slack: 2pts]           |
|                                                          |
| Parallel Execution Plan:                                 |
| -------------------------------------------------------- |
| Phase 1: US-001 + US-006 + US-007  (5+2+1 = 8pts)       |
| Phase 2: US-002 + US-004           (3+3 = 6pts)          |
| Phase 3: US-003 + US-005           (2+5 = 7pts)          |
| Total: 21pts across 3 phases                             |
|                                                          |
| Stories with Slack:                                      |
| -------------------------------------------------------- |
| US-003: 5pts slack (can delay without impact)            |
| US-004: 2pts slack (near-critical, monitor)              |
| US-006: 8pts slack (fully flexible)                      |
| US-007: 8pts slack (fully flexible)                      |
+==========================================================+
```

### Step 5: Recommendations

Based on analysis, provide:
1. **Optimal execution order** respecting dependencies
2. **Parallelization opportunities**
3. **Risk assessment** for critical path stories
4. **Suggestions** to shorten the critical path (split stories, etc.)

## Example Session

```
User: /project:critical-path --sprint=Sprint-3 --velocity=21

Claude: Analyzing critical path for Sprint-3...

Critical Path: US-001 -> US-002 -> US-005 (13 story points)

This means the minimum time to complete all dependent work is 13 story
points of sequential effort, regardless of team size.

Recommended execution plan:
Phase 1 (8pts): US-001 [critical] + US-006, US-007 [independent]
Phase 2 (6pts): US-002 [critical] + US-004 [near-critical]
Phase 3 (7pts): US-005 [critical] + US-003 [has slack]

Total: 21pts, fits within 1 sprint at velocity 21.

!! Risk: If US-001 is delayed by 2+ days, the entire sprint is at risk.
Recommendation: Assign strongest developer to US-001.
```

## Related Commands

- `/project:dependencies` — View full dependency graph
- `/project:trace` — View traceability matrix
- `/sprint:next-story` — Get next story (considers dependencies)
- `/sprint:status` — View sprint progress
