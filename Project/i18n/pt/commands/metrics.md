---
name: metrics
description: Generate project metrics dashboard with sprint velocity, spec coverage, and quality indicators
arguments:
  - name: sprint
    description: Sprint ID for sprint-specific metrics (e.g., Sprint-3)
    required: false
  - name: format
    description: Output format (dashboard, json, markdown)
    required: false
---

# /project:metrics

## Mission

Generate a comprehensive project metrics dashboard showing sprint velocity, burndown progress, spec coverage, quality gate pass rates, and regression tracking. This provides data-driven visibility into project health.

## Prerequisites

- `.bmad/sprint-status.yaml` exists with sprint data
- `project-management/backlog/` contains user stories
- Optional: `.bmad/metrics/` with historical data
- Optional: `project-management/prd.md` for coverage metrics

## Modo Plano

> **O modo plano e obrigatorio.** Antes de executar, Claude ativa o modo plano para analisar o codigo impactado, propor um plano de implementacao e aguardar sua validacao antes de realizar qualquer alteracao.

## Metrics Categories

### 1. Sprint Velocity

Track team throughput across sprints:

| Metric | Description | Source |
|--------|-------------|--------|
| Velocity | Story points completed per sprint | sprint-status.yaml |
| Average velocity | Rolling average (last 3 sprints) | metrics history |
| Commitment ratio | Completed / committed points | sprint-status.yaml |
| Carryover | Points carried to next sprint | sprint-status.yaml |

### 2. Spec Coverage

Track requirement-to-code coverage:

| Metric | Description | Source |
|--------|-------------|--------|
| Requirement coverage | % FR-xxx covered by stories | PRD + stories |
| Story coverage | % stories with code references | stories + code |
| Test coverage | % ACs with corresponding tests | stories + tests |
| Traceability completeness | % full chains (FR→US→Code→Test) | trace matrix |

### 3. Quality Gates

Track gate pass rates:

| Metric | Description | Source |
|--------|-------------|--------|
| PRD gate pass rate | % PRD validations passing (≥80%) | gate history |
| Story gate pass rate | % story DoD checks passing | gate history |
| Sprint ready pass rate | % sprint readiness checks passing | gate history |
| First-pass rate | % passing on first attempt | gate history |

### 4. Sprint Health

Track sprint execution health:

| Metric | Description | Source |
|--------|-------------|--------|
| Stories done | Completed / total stories | sprint-status.yaml |
| Tasks done | Completed / total tasks | sprint-status.yaml |
| Blocked stories | Currently blocked count | sprint-status.yaml |
| TDD compliance | % stories following TDD cycle | sprint-status.yaml |

### 5. Regression

Track quality over time:

| Metric | Description | Source |
|--------|-------------|--------|
| Bugs found | Bugs found per sprint (QA recette) | qa sessions |
| Bugs fixed | Bugs fixed per sprint | qa sessions |
| Regression rate | Bugs reintroduced | regression registry |
| Escape rate | Bugs found in prod/review | sprint history |

## Workflow

### Step 1: Collect Data

1. Read `.bmad/sprint-status.yaml` for current sprint
2. Read `.bmad/metrics/` for historical data (if exists)
3. Run `/project:trace` data to get coverage metrics
4. Read gate validation history
5. Read QA recette session data (if exists)

### Step 2: Calculate Metrics

1. Compute velocity (current + rolling average)
2. Compute spec coverage percentages
3. Compute gate pass rates
4. Compute sprint health indicators
5. Compare with previous sprints for trends

### Step 3: Generate Dashboard

```
╔══════════════════════════════════════════════════════════╗
║               PROJECT METRICS DASHBOARD                  ║
╠══════════════════════════════════════════════════════════╣
║ Sprint: Sprint-3 | Date: 2026-02-19                      ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ VELOCITY                                                 ║
║ ──────────────────────────────────────────────────────── ║
║ Current sprint:    18/21 pts completed (86%)             ║
║ Average velocity:  19 pts/sprint (last 3)                ║
║ Commitment ratio:  86% (target: >80%)              ✅    ║
║ Carryover:         3 pts (1 story)                       ║
║                                                          ║
║ SPEC COVERAGE                                            ║
║ ──────────────────────────────────────────────────────── ║
║ Requirements:      12/15 FR-xxx covered (80%)      ⚠️    ║
║ Story coverage:    8/10 stories have code refs     ⚠️    ║
║ Test coverage:     24/28 ACs have tests (86%)      ✅    ║
║ Full traceability: 7/10 complete chains (70%)      ⚠️    ║
║                                                          ║
║ QUALITY GATES                                            ║
║ ──────────────────────────────────────────────────────── ║
║ PRD gate:          1/1 passed (100%)               ✅    ║
║ Story DoD:         6/8 passed (75%)                ⚠️    ║
║ Sprint ready:      1/1 passed (100%)               ✅    ║
║ First-pass rate:   70%                             ⚠️    ║
║                                                          ║
║ SPRINT HEALTH                                            ║
║ ──────────────────────────────────────────────────────── ║
║ Stories:           6/8 done (75%)                         ║
║ Tasks:             22/28 done (79%)                       ║
║ Blocked:           1 story (US-015)                ⚠️    ║
║ TDD compliance:    100%                            ✅    ║
║                                                          ║
║ REGRESSION                                               ║
║ ──────────────────────────────────────────────────────── ║
║ Bugs found:        4 (this sprint)                       ║
║ Bugs fixed:        3 (75% fix rate)                      ║
║ Regressions:       0                               ✅    ║
║ Escape rate:       0%                              ✅    ║
║                                                          ║
║ TRENDS (vs previous sprint)                              ║
║ ──────────────────────────────────────────────────────── ║
║ Velocity:          ↑ +2 pts (was 16)                     ║
║ Spec coverage:     ↑ +10% (was 70%)                      ║
║ First-pass rate:   ↓ -5% (was 75%)                       ║
║ Blocked stories:   → same (was 1)                        ║
╚══════════════════════════════════════════════════════════╝
```

### Step 4: Store Metrics

Save current metrics to `.bmad/metrics/sprint-{id}.json`:

```json
{
  "sprint_id": "Sprint-3",
  "date": "2026-02-19",
  "velocity": {
    "completed": 18,
    "committed": 21,
    "ratio": 0.86
  },
  "coverage": {
    "requirements": 0.80,
    "stories": 0.80,
    "tests": 0.86,
    "traceability": 0.70
  },
  "gates": {
    "prd_pass_rate": 1.0,
    "story_pass_rate": 0.75,
    "sprint_ready_rate": 1.0,
    "first_pass_rate": 0.70
  },
  "health": {
    "stories_done": 6,
    "stories_total": 8,
    "tasks_done": 22,
    "tasks_total": 28,
    "blocked": 1,
    "tdd_compliance": 1.0
  },
  "regression": {
    "bugs_found": 4,
    "bugs_fixed": 3,
    "regressions": 0,
    "escape_rate": 0.0
  }
}
```

## Example Session

```
User: /project:metrics --sprint=Sprint-3

Claude: Generating metrics dashboard for Sprint-3...

[Dashboard displayed]

Key observations:
- Velocity is trending up (+2 pts vs Sprint-2). Good momentum.
- Spec coverage at 80% — 3 requirements still uncovered (FR-008, FR-011, FR-014)
- Story DoD pass rate at 75% — US-009 and US-012 failed first attempt
- 1 blocked story (US-015) — waiting for API credentials

Recommendations:
1. Address 3 uncovered requirements before Sprint-4
2. Unblock US-015 to complete sprint scope
3. Review DoD failures for common patterns
```

## Related Commands

- `/project:burndown` — Generate burndown chart
- `/project:trace` — View traceability matrix
- `/project:coverage-map` — Check requirement coverage
- `/sprint:status` — View sprint status
- `/workflow:retro` — Sprint retrospective (uses metrics)
