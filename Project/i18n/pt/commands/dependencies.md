---
name: dependencies
description: Generate a visual dependency graph between user stories using Mermaid
arguments:
  - name: sprint
    description: Sprint ID to scope the graph (e.g., Sprint-3)
    required: false
  - name: format
    description: Output format (mermaid, table, json)
    required: false
  - name: output
    description: Output path (default stdout)
    required: false
---

# /project:dependencies

## Mission

Generate a visual dependency graph showing relationships between user stories. Detect circular dependencies, identify bottleneck stories, and help optimize execution order.

## Prerequisites

- `project-management/backlog/` contains user stories with `Depends on:` fields
- Optional: `.bmad/sprint-status.yaml` for sprint context
- Optional: `project-management/prd.md` for epic grouping

## Modo Plano

> **O modo plano e obrigatorio.** Antes de executar, Claude ativa o modo plano para analisar o codigo impactado, propor um plano de implementacao e aguardar sua validacao antes de realizar qualquer alteracao.

## Workflow

### Step 1: Load Stories

1. Scan `project-management/backlog/` for all story files
2. If `--sprint` is provided, filter to stories assigned to that sprint
3. Extract `Depends on:` fields from each story's Traceability section
4. Build adjacency list of dependencies

### Step 2: Validate Dependencies

1. Check for circular dependencies (A -> B -> C -> A)
2. Check for references to non-existent stories
3. Check for self-references
4. Report any issues found

### Step 3: Generate Graph

**Mermaid format (default):**

```mermaid
graph TD
    subgraph "EPIC-001: Authentication"
        US-001[US-001: Login Page]
        US-002[US-002: JWT Tokens]
        US-003[US-003: Password Reset]
    end

    subgraph "EPIC-002: User Management"
        US-004[US-004: User Profile]
        US-005[US-005: Admin Dashboard]
    end

    US-002 --> US-001
    US-003 --> US-002
    US-004 --> US-001
    US-005 --> US-004

    classDef done fill:#90EE90
    classDef inProgress fill:#FFD700
    classDef blocked fill:#FF6B6B
    classDef ready fill:#87CEEB

    class US-001 done
    class US-002 inProgress
    class US-003 blocked
    class US-004 ready
    class US-005 ready
```

### Step 4: Analyze Dependencies

Generate analysis including:
- **Bottleneck stories**: Stories that block the most other stories
- **Independent stories**: Stories with no dependencies (can start anytime)
- **Dependency chains**: Longest chain of sequential dependencies
- **Parallel opportunities**: Groups of stories that can be worked in parallel

### Step 5: Output Report

```
+==========================================================+
|           STORY DEPENDENCY GRAPH                         |
+==========================================================+
| Sprint: Sprint-3 | Stories: 8 | Dependencies: 5          |
+==========================================================+
|                                                          |
| Bottleneck Stories (block 3+ others):                    |
|   !! US-001: Login Page (blocks 4 stories)               |
|                                                          |
| Independent Stories (no dependencies):                   |
|   OK US-006: Landing Page                                |
|   OK US-007: Error Pages                                 |
|                                                          |
| Longest Chain (3 steps):                                 |
|   US-001 -> US-002 -> US-003                             |
|                                                          |
| Parallel Groups:                                         |
|   Group 1: US-006, US-007 (independent)                  |
|   Group 2: US-004, US-005 (after US-001)                 |
|                                                          |
| Issues:                                                  |
|   OK No circular dependencies                            |
|   OK No missing references                               |
+==========================================================+
```

## Example Session

```
User: /project:dependencies --sprint=Sprint-3

Claude: Analyzing dependencies for Sprint-3...

Found 8 stories with 5 dependencies.

[Mermaid graph displayed]

Key findings:
- US-001 is a bottleneck (blocks 4 stories). Consider prioritizing it.
- US-006 and US-007 are independent and can start immediately.
- Critical path: US-001 -> US-002 -> US-003 (3 sprints if sequential)

Recommendation: Start with US-001 + US-006/US-007 in parallel.
```

## Related Commands

- `/project:critical-path` — Identify the critical path
- `/project:trace` — View traceability matrix
- `/sprint:next-story` — Get next story (considers dependencies)
- `/sprint:status` — View sprint progress
