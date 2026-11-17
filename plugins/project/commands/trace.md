---
name: trace
description: "Bidirectional traceability matrix (requirement → story → code → tests); --gaps lists uncovered requirements, --by-priority groups by MoSCoW"
argument-hint: "[all|requirement|story|code] [ID] [--gaps] [--by-priority] [--level=story|code|test|all] [--format=table|mermaid|json]"
---

# /project:trace

## Mission

Map every requirement of the PRD through user stories, code and tests. The default view is the full bidirectional matrix; `--gaps` turns it into a coverage report that lists only what is not covered (this is the former `/project:trace --gaps`); `--by-priority` groups the result by MoSCoW priority.

## Usage

| Invocation | What it does | Replaces |
|------------|--------------|----------|
| `/project:trace` or `/project:trace all` | Full matrix: requirement → story → code → tests | `/project:trace` |
| `/project:trace requirement FR-001` | Trace one requirement downwards | `/project:trace --scope requirement --id FR-001` |
| `/project:trace story US-001` | Trace one story upwards (requirements) and downwards (code, tests) | `/project:trace --scope story` |
| `/project:trace code` | Code files with and without story reference | `/project:trace --scope code` |
| `/project:trace --gaps` | Coverage report: requirements not covered by stories, code or tests, with recommended actions | `/project:trace --gaps` |
| `/project:trace --gaps --level test` | Same, limited to one coverage level (`story`, `code`, `test`, `all`; default `all`) | `/project:trace --gaps --level test` |
| `/project:trace --by-priority` | Group requirements and coverage percentages by MoSCoW priority | new (was a section of coverage-map) |

Flags combine: `/project:trace --gaps --by-priority` gives the coverage report with the per-priority breakdown.

## Arguments

Parse `$ARGUMENTS`:
- First positional token in `all|requirement|story|code` → scope (default `all`).
- Next positional token matching `FR-\d+` or `US-\d+` → ID to trace (required to be meaningful for `requirement` and `story`).
- `--gaps` → coverage mode. `--level` is only read in this mode.
- `--by-priority` → group by priority: P0 = Must have, P1 = Should have, P2 = Could have / Nice to have.
- `--format` → `table` (default), `mermaid`, `json`.

## Prerequisites

- `project-management/prd.md` exists with FR-xxx requirement IDs
- `project-management/backlog/` contains user stories with `Implements:` references
- Codebase with `// Story: US-xxx` or `# Story: US-xxx` comments (optional for `--gaps --level story`)
- Test files with story/requirement references

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## Shared scans

Both modes run the same four scans once; the results feed either the matrix or the coverage report. Story **status** always comes from `.bmad/sprint-status.yaml` (single source of truth); markdown files only provide content.

### Scan 1: Requirements

1. Read `project-management/prd.md`
2. Extract all FR-xxx IDs from the Functional Requirements section
3. Record text, priority (P0/P1/P2) and acceptance criteria
4. Registry: `{FR-001: {text, priority}}`; count requirements per priority

### Scan 2: User stories

1. Scan `project-management/backlog/` for `US-*.md` (or `user-stories/` files)
2. In each story, read the `Implements:` line or the `Traceability` section
3. Mapping: `{US-001: [FR-001, FR-003]}`; read status and sprint from `.bmad/sprint-status.yaml`
4. A requirement with no story referencing it is "No Story"

### Scan 3: Code

1. Grep the codebase for `// Story: US-xxx`, `# Story: US-xxx`, `@story US-xxx`
2. Mapping with file and line: `{US-001: [src/Service/OrderService.php:42]}`
3. A story with no reference is "No Code"; list code files with no story reference

### Scan 4: Tests

1. Grep test directories for `US-xxx` / `FR-xxx` references and check test names
2. Mapping: `{US-001: [tests/OrderServiceTest.php]}`
3. A story with code but no test reference is "No Tests"

```
╔══════════════════════════════════════════════════════════╗
║ Requirements: {n} | Stories: {n} | Files: {n} | Tests: {n}║
╚══════════════════════════════════════════════════════════╝
```

## Matrix mode (default)

Combine the four mappings. Output (table format):

```
Bidirectional Traceability Matrix
=================================

FR-001 (P0) User Authentication
  ├── US-001: Login with email/password
  │   ├── src/Service/AuthService.php:25
  │   ├── tests/AuthServiceTest.php ✅
  │   └── tests/AuthControllerTest.php ✅
  └── US-002: Password reset flow
      ├── src/Service/PasswordResetService.php:10
      └── tests/PasswordResetServiceTest.php ✅

FR-002 (P0) User Registration
  └── US-003: Register with email
      ├── src/Service/RegistrationService.php:12
      └── ⚠️ NO TESTS

FR-010 (P1) Export to CSV
  └── ⚠️ NO STORIES

Coverage Summary
================
| Level | Covered | Total | Percentage |
|-------|---------|-------|------------|
| Requirements → Stories | 8 | 10 | 80% |
| Stories → Code | 7 | 8 | 87% |
| Stories → Tests | 6 | 8 | 75% |
| End-to-End (FR → Test) | 6 | 10 | 60% |

Gaps Identified
===============
| Type | ID | Description | Action Needed |
|------|----|-------------|---------------|
| No Stories | FR-010 | Export to CSV | Create user story |
| No Tests | US-003 | Register with email | Add test coverage |
```

With an ID, only that branch is printed, with story status and test counts (e.g. `US-001: Login [Done]`, `tests/AuthServiceTest.php ✅ (12 tests)`), then `Status: Fully covered (2/2 stories, 3/3 code files, 3/3 test files)`.

### Mermaid (`--format mermaid`)

`graph LR` with four subgraphs (Requirements, Stories, Code, Tests); solid arrows for links, dotted arrows (`-.->|NO STORY|`) to a gap node for missing links; gaps styled `fill:#ff6b6b`.

### JSON (`--format json`)

```json
{
  "generated_at": "2026-02-19T10:00:00Z",
  "requirements": {"FR-001": {"text": "User Authentication", "priority": "P0", "stories": ["US-001"], "covered": true}},
  "stories": {"US-001": {"title": "Login", "implements": ["FR-001"], "code_files": ["src/Service/AuthService.php"], "test_files": ["tests/AuthServiceTest.php"], "covered": true}},
  "coverage": {"requirements_to_stories": 0.80, "stories_to_code": 0.87, "stories_to_tests": 0.75, "end_to_end": 0.60},
  "gaps": [{"type": "no_stories", "id": "FR-010", "description": "Export to CSV"}]
}
```

## Gaps mode (`--gaps`)

Reuses the shared scans, computes coverage per layer and lists only what is missing. `--level` restricts the layers computed: `story` (scan 1-2), `code` (1-3), `test` (1-4), `all` (default).

```
Requirement Coverage Map
========================
| Layer | Covered | Total | Coverage | Status |
|-------|---------|-------|----------|--------|
| Stories | 8 | 10 | 80% | ⚠️ |
| Code | 7 | 8 | 87% | ⚠️ |
| Tests | 6 | 8 | 75% | ❌ |
| End-to-End | 6 | 10 | 60% | ❌ |

Uncovered Requirements
| ID | Requirement | Priority | Missing |
|----|-------------|----------|---------|
| FR-005 | Bulk export | P0 | Tests |
| FR-010 | CSV import | P1 | Story, Code, Tests |

Recommended Actions
1. 🔴 CRITICAL: FR-005 (P0) has code but no tests — add test coverage
2. ⚠️ HIGH: FR-010 (P1) has no story — create a user story
3. 📝 LOW: FR-020 (P2) not started — plan for future sprints

Next Commands
- /project:trace requirement FR-005   → deep trace of one requirement
- /project:backlog add story         → create missing user stories
- /workflow:plan --only=backlog          → regenerate backlog with gaps
```

With `--level test`, print one row per story: `US-003 | ❌ | 0 files | 0 tests` and the action (e.g. "Create tests/RegistrationServiceTest.php").

Mermaid (`--format mermaid`): `graph TD` with one subgraph per priority; nodes `FR-001 ✅`, `FR-005 ⚠️ No Tests`, `FR-010 ❌ No Story`; styles `#4caf50` (covered), `#ff9800` (partial), `#f44336` (missing).

### Coverage thresholds

| Threshold | Status | Action |
|-----------|--------|--------|
| >= 90% | ✅ Excellent | Maintain |
| 80-89% | ⚠️ Good | Review gaps |
| 60-79% | ⚠️ Needs Work | Prioritize coverage |
| < 60% | ❌ Critical | Immediate action required |

## Priority grouping (`--by-priority`)

Works in both modes. In matrix mode, requirements are listed under `P0 Must have`, `P1 Should have`, `P2 Could have` headings. In gaps mode, add:

```
Coverage by Priority
| Priority | Requirements | Story Coverage | Code Coverage | Test Coverage |
|----------|-------------|----------------|---------------|---------------|
| P0 (Must Have) | 5 | 100% ✅ | 100% ✅ | 80% ⚠️ |
| P1 (Should Have) | 3 | 66% ⚠️ | 50% ❌ | 33% ❌ |
| P2 (Could Have) | 2 | 0% ❌ | 0% ❌ | 0% ❌ |
```

Recommended actions are then ordered P0 first.

## Example session

```
User: /project:trace
Claude: Found 10 requirements (5 P0, 3 P1, 2 P2), 8 stories, 24 code files, 18 test files.
        [full matrix] Coverage: 60% end-to-end

User: /project:trace requirement FR-001
Claude: [FR-001 branch only]

User: /project:trace --gaps --by-priority
Claude: [coverage report with per-priority table, 2 P0 requirements need attention]
```

## Related Commands

- `/workflow:plan --only=prd` - Generate PRD with requirement IDs
- `/workflow:plan --only=backlog` - Create backlog from PRD
- `/workflow:design` - Generate technical specification
- `/project:migrate --stories` - Add missing fields (such as `Implements:`) to stories
