---
name: gap-analysis
description: Compare existing specifications with actual codebase to identify gaps and inconsistencies
arguments:
  - name: prd
    description: Path to PRD (default project-management/prd.md)
    required: false
  - name: scope
    description: Analysis scope (full, requirements, stories, code)
    required: false
---

# /project:gap-analysis

## Mission

Compare existing specifications (PRD, user stories, tech spec) with the actual codebase to identify gaps, inconsistencies, and missing coverage. This command produces an actionable report with severity-ranked findings and remediation suggestions.

## Prerequisites

- PRD exists at `project-management/prd.md` (from `/project:generate-prd` or `/project:reverse-prd`)
- Codebase is accessible for analysis
- Optional: Scan report at `project-management/scan-report.md`
- Optional: User stories in `project-management/backlog/user-stories/`
- Optional: Tech spec at `project-management/tech-spec.md`

## Modo Plano

> **O modo plano é obrigatório.** Antes de executar, Claude ativa o modo plano para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## Workflow

### Step 1: Load Specifications

```
+--------------------------------------------------------------+
|              GAP ANALYSIS - LOADING SPECS                       |
+--------------------------------------------------------------+
| Loading specifications and codebase data...                    |
+--------------------------------------------------------------+
```

**Actions:**
1. Load PRD from `project-management/prd.md`
2. Load user stories from `project-management/backlog/user-stories/`
3. Load tech spec from `project-management/tech-spec.md` (if exists)
4. Load scan report from `project-management/scan-report.md` (or run `/project:scan`)
5. Parse all functional requirements (FR-xxx), non-functional requirements (NFR-xxx), and user stories (US-xxx)

### Step 2: Scan Codebase

```
+--------------------------------------------------------------+
|              GAP ANALYSIS - SCANNING CODE                      |
+--------------------------------------------------------------+
| Scanning codebase for implemented features...                  |
+--------------------------------------------------------------+
```

**Actions:**
1. If scan report is missing or outdated, run a fresh scan
2. Catalog all implemented features:
   - API endpoints (routes, controllers, handlers)
   - Business logic (services, use cases, domain events)
   - Data models (entities, migrations, relationships)
   - Tests (unit, integration, E2E)
   - Infrastructure (Docker, CI/CD, monitoring)
3. Build a feature inventory indexed by module/domain

### Step 3: Compare Spec vs Code

```
+--------------------------------------------------------------+
|              GAP ANALYSIS - COMPARING                          |
+--------------------------------------------------------------+
| Comparing specifications with codebase...                      |
+--------------------------------------------------------------+
```

**Four-way comparison:**

#### 1. Spec without Code (Not Implemented)
Requirements defined in the PRD or user stories that have no corresponding implementation in the codebase.

| Check | Method |
|-------|--------|
| FR-xxx without matching endpoint | Match requirement keywords to route paths and controller actions |
| US-xxx without matching feature | Match story actions to implemented handlers |
| NFR-xxx without matching config | Match NFR descriptions to infrastructure setup |

#### 2. Code without Spec (Undocumented)
Features implemented in the codebase that are not covered by any specification document.

| Check | Method |
|-------|--------|
| Endpoints without FR reference | List endpoints not mapped to any requirement |
| Services without US reference | List services not referenced in any user story |
| Entities without spec coverage | List data models not documented in specs |

#### 3. Spec-Code Mismatch (Inconsistent)
Implementation differs from what the specification defines.

| Check | Method |
|-------|--------|
| Field mismatches | Compare entity fields vs spec-defined attributes |
| Status flow mismatches | Compare implemented state machine vs spec-defined workflow |
| Auth mismatches | Compare actual auth rules vs spec-defined access control |
| Validation mismatches | Compare actual validation vs spec-defined constraints |
| Response format mismatches | Compare actual API responses vs spec-defined schemas |

#### 4. Test Gaps (Untested)
Features that exist in both spec and code but lack test coverage.

| Check | Method |
|-------|--------|
| Features without unit tests | Map features to test files |
| Features without integration tests | Check for API/DB test coverage |
| Acceptance criteria without E2E tests | Match Gherkin scenarios to test methods |
| Error paths without tests | Check validation/error test coverage |

### Step 4: Analyze and Classify Gaps

```
+--------------------------------------------------------------+
|              GAP ANALYSIS - CLASSIFICATION                     |
+--------------------------------------------------------------+
| Classifying gaps by severity...                                |
+--------------------------------------------------------------+
```

**Severity Levels:**

| Severity | Criteria | Action Required |
|----------|----------|----------------|
| **Critical** | Core business feature missing or broken; security vulnerability; data integrity risk | Immediate fix required |
| **Major** | Important feature gap; significant spec-code mismatch; missing critical tests | Fix in current sprint |
| **Minor** | Documentation gap; non-critical mismatch; missing edge-case tests | Fix in next sprint |
| **Info** | Style inconsistency; optional feature not implemented; enhancement opportunity | Backlog item |

**Classification Rules:**
- Spec without Code + P0 requirement = **Critical**
- Spec without Code + P1 requirement = **Major**
- Spec without Code + P2 requirement = **Minor**
- Code without Spec + auth-related = **Major**
- Code without Spec + CRUD = **Minor**
- Spec-Code Mismatch + data integrity = **Critical**
- Spec-Code Mismatch + UI/UX = **Minor**
- Test Gap + business logic = **Major**
- Test Gap + edge case = **Minor**

### Step 5: Generate Report

```
+--------------------------------------------------------------+
|              GAP ANALYSIS - REPORT                             |
+--------------------------------------------------------------+
| Generating gap analysis report...                              |
+--------------------------------------------------------------+
```

**Generate a comprehensive report with:**
1. Executive summary with coverage percentages
2. Gap inventory grouped by category and severity
3. Detailed findings with evidence (file paths, line references)
4. Remediation suggestions for each gap
5. Priority-ranked action list

## Output Format

```
project-management/
+-- analysis/
    +-- gap-analysis.md          # Full gap analysis report
```

**Report Structure:**

```
+==============================================================+
|                   GAP ANALYSIS REPORT                          |
+==============================================================+
| Project: {name}                                                |
| Analysis Date: {date}                                          |
| Scope: {scope}                                                 |
+==============================================================+
| Spec Coverage: 72%                                             |
| Code Coverage: 85%                                             |
| Test Coverage: 60%                                             |
+==============================================================+
| Gaps Found: 12                                                 |
| +-- Critical: 3                                                |
| +-- Major: 5                                                   |
| +-- Minor: 4                                                   |
+==============================================================+

## 1. Spec without Code (Not Implemented)

| ID     | Requirement                    | Priority | Severity |
|--------|--------------------------------|----------|----------|
| FR-005 | Password reset flow            | P0       | Critical |
| FR-008 | Export orders to PDF           | P1       | Major    |
| FR-012 | Email notification preferences | P2       | Minor    |

## 2. Code without Spec (Undocumented)

| Feature                  | Module  | Endpoint              | Severity |
|--------------------------|---------|-----------------------|----------|
| Admin dashboard stats    | Admin   | GET /api/admin/stats  | Major    |
| Health check endpoint    | Infra   | GET /health           | Info     |
| Debug toolbar            | Dev     | GET /_profiler         | Info     |

## 3. Spec-Code Mismatch (Inconsistent)

| Spec                     | Expected            | Actual               | Severity |
|--------------------------|---------------------|----------------------|----------|
| FR-003: Order status     | 5 status values     | 4 status values      | Major    |
| US-007: User fields      | 10 fields           | 8 fields (2 missing) | Major    |
| NFR-002: Response time   | < 200ms             | Not measured          | Minor    |

## 4. Test Gaps (Untested)

| Feature                  | Unit | Integration | E2E  | Severity |
|--------------------------|------|-------------|------|----------|
| Payment processing       | Yes  | No          | No   | Critical |
| Order cancellation       | Yes  | Yes         | No   | Minor    |
| User profile update      | No   | No          | No   | Major    |

## Remediation Action List (Priority Ranked)

| # | Action                                    | Severity | Effort |
|---|-------------------------------------------|----------|--------|
| 1 | Implement FR-005 (password reset)         | Critical | M      |
| 2 | Add integration tests for payment         | Critical | S      |
| 3 | Implement FR-003 missing order status     | Critical | S      |
| 4 | Document admin dashboard stats endpoint   | Major    | S      |
| 5 | Add missing User entity fields            | Major    | M      |
| 6 | Add unit tests for user profile update    | Major    | S      |
| 7 | Implement FR-008 (PDF export)             | Major    | L      |
| 8 | Implement FR-012 (notification prefs)     | Minor    | M      |
| 9 | Add E2E test for order cancellation       | Minor    | S      |
| 10| Measure and enforce response time NFR     | Minor    | M      |

Effort: S = Small (< 2h) | M = Medium (2-8h) | L = Large (> 8h)
```

## Example Session

```
User: /project:gap-analysis

Claude: Starting gap analysis...

[Loading Specs]
Loaded PRD: 14 functional requirements, 6 NFRs
Loaded user stories: 18 stories across 5 modules
Loaded scan report: 23 endpoints, 8 entities, 60 tests

[Scanning Code]
Cataloging implemented features...
Found 23 endpoints, 15 services, 8 entities

[Comparing]
Matching specifications to codebase...

Spec Coverage: 72% (10/14 FRs implemented)
Code Coverage: 85% (20/23 endpoints documented)
Test Coverage: 60% (estimated from test-to-feature ratio)

[Classification]
Classified 12 gaps:
- 3 Critical (2 missing P0 features, 1 untested payment flow)
- 5 Major (3 mismatches, 1 undocumented feature, 1 test gap)
- 4 Minor (2 P2 features, 1 edge-case test, 1 NFR measurement)

Gap analysis report: project-management/analysis/gap-analysis.md

Top 3 actions to address immediately:
1. [CRITICAL] Implement password reset flow (FR-005)
2. [CRITICAL] Add integration tests for payment processing
3. [CRITICAL] Add missing order status value (FR-003)

Would you like to:
1. Create user stories for the missing features?
2. Generate tasks for the remediation items?
3. Focus on a specific gap category?
```

## Related Commands

- `/project:scan` - Scan codebase (prerequisite if no scan report)
- `/project:reverse-prd` - Generate PRD from codebase
- `/project:reverse-stories` - Generate user stories from codebase
- `/project:generate-backlog` - Create SCRUM backlog from PRD
- `/project:generate-tech-spec` - Generate technical specification
