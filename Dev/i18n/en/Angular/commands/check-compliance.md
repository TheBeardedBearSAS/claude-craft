---
description: Check Complete Angular Compliance
argument-hint: [arguments]
---

# Check Complete Angular Compliance

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## MISSION

Perform a complete compliance audit of the Angular project by orchestrating the 4 major checks: Architecture, Code Quality, Tests, and Security. Produce a consolidated report with an overall score out of 100 points.

### Step 1: Audit Preparation

Prepare audit environment:
- [ ] Identify project path to audit
- [ ] Verify presence of configuration files (angular.json, tsconfig.json, package.json)
- [ ] List main directories (src/app/, e2e/, etc.)
- [ ] Identify project structure and Angular version

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: Architecture Audit (25 points)

Execute complete architecture check:

**Command**: Use slash command `/angular:check-architecture` or manually follow steps in `check-architecture.md`

**Evaluated Criteria**:
- Domain-driven module structure (6 pts)
- Standalone components usage (6 pts)
- Lazy loading and routing (4 pts)
- Core/Shared/Feature separation (4 pts)
- Service layer organization (3 pts)
- Dependency injection patterns (2 pts)

**Reference**: `check-architecture.md`

### Step 3: Code Quality Audit (25 points)

Execute code quality check:

**Command**: Use slash command `/angular:check-code-quality` or manually follow steps in `check-code-quality.md`

**Evaluated Criteria**:
- TypeScript strict mode and type safety (5 pts)
- ESLint compliance (5 pts)
- Signals and modern Angular patterns (4 pts)
- KISS/DRY/YAGNI principles (4 pts)
- Naming conventions and file structure (4 pts)
- OnPush change detection (3 pts)

**Reference**: `check-code-quality.md`

### Step 4: Testing Audit (25 points)

Execute testing check:

**Command**: Use slash command `/angular:check-testing` or manually follow steps in `check-testing.md`

**Evaluated Criteria**:
- Code coverage (7 pts)
- Unit tests for services and pipes (6 pts)
- Component tests with TestBed (4 pts)
- Integration tests (3 pts)
- E2E tests (3 pts)
- Test isolation and mocks (2 pts)

**Reference**: `check-testing.md`

### Step 5: Security Audit (25 points)

Execute security check:

**Command**: Use slash command `/angular:check-security` or manually follow steps in `check-security.md`

**Evaluated Criteria**:
- XSS prevention and DomSanitizer (6 pts)
- Secrets and credentials management (5 pts)
- Input validation and sanitization (4 pts)
- Dependency vulnerabilities (4 pts)
- Authentication and route guards (3 pts)
- CSRF and HTTP interceptors (2 pts)
- Content Security Policy (1 pt)

**Reference**: `check-security.md`

### Step 6: Consolidation and Global Scoring

Calculate overall score and produce consolidated report:
- [ ] Sum the 4 scores (max 100 points)
- [ ] Identify critical categories (<50%)
- [ ] List all critical cross-cutting issues
- [ ] Prioritize actions by impact/effort
- [ ] Produce final consolidated report

**Grading Scale**:
- 90-100: Excellent - Reference project
- 75-89: Very Good - Some minor improvements
- 60-74: Acceptable - Requires improvements
- 40-59: Insufficient - Major refactoring required
- 0-39: Critical - Complete overhaul necessary

### Step 7: Recommendations and Action Plan

Produce final recommendations:
- [ ] Identify top 3 priority actions across all categories
- [ ] Estimate effort (Low/Medium/High) for each action
- [ ] Estimate impact (Low/Medium/High) for each action
- [ ] Propose implementation order
- [ ] Suggest quick wins (high impact/effort ratio)

## OUTPUT FORMAT

```
ANGULAR COMPLIANCE AUDIT - COMPLETE REPORT
=============================================

OVERALL SCORE: XX/100

COMPLIANCE LEVEL: [Excellent/Very Good/Acceptable/Insufficient/Critical]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORES BY CATEGORY:

ARCHITECTURE       : XX/25  [██████████░░░░░░░░░░] XX%
CODE QUALITY       : XX/25  [██████████░░░░░░░░░░] XX%
TESTS              : XX/25  [██████████░░░░░░░░░░] XX%
SECURITY           : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL STRENGTHS:
1. [Strength identified in multiple categories]
2. [Other major strength]
3. [Third strength]

OVERALL IMPROVEMENTS:
1. [Minor cross-cutting improvement]
2. [Other recommended improvement]
3. [Third improvement]

CRITICAL ISSUES:
1. [Critical issue #1 - affected category]
2. [Critical issue #2 - affected category]
3. [Critical issue #3 - affected category]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILS BY CATEGORY:

┌─────────────────────────────────────────────┐
│ ARCHITECTURE (XX/25)                        │
└─────────────────────────────────────────────┘

Sub-scores:
  • Domain-driven modules        : XX/6
  • Standalone components        : XX/6
  • Lazy loading and routing     : XX/4
  • Core/Shared/Feature          : XX/4
  • Service layer                : XX/3
  • Dependency injection         : XX/2

Strengths:
- [Architecture strengths]

Issues:
- [Architecture issues]

[Similar sections for Code Quality, Tests, and Security...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITY ACTIONS (ALL CATEGORIES):

1. CRITICAL - [Action #1]
   Category  : [Architecture/Quality/Tests/Security]
   Impact    : [High/Medium/Low]
   Effort    : [High/Medium/Low]
   Priority  : IMMEDIATE

   Detailed description:
   [Explanation of problem and proposed solution]

   Affected files:
   - [file:line]

   Correction example:
   [Code or correction command]

2. IMPORTANT - [Action #2]
   [Same format...]

3. RECOMMENDED - [Action #3]
   [Same format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (High Impact / Low Effort):

- [Quick win #1] - Category: [X] - Impact: [X] - Effort: [X]
- [Quick win #2] - Category: [X] - Impact: [X] - Effort: [X]
- [Quick win #3] - Category: [X] - Impact: [X] - Effort: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECOMMENDED ACTION PLAN:

WEEK 1 (Immediate):
- [ ] [Critical action #1]
- [ ] [Priority quick win]

WEEK 2-4 (Short term):
- [ ] [Important action #2]
- [ ] [Other quick wins]

MONTH 2-3 (Medium term):
- [ ] [Recommended action #3]
- [ ] [Progressive improvements]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY:

[Summary paragraph on overall project state, major strengths,
major weaknesses, and recommended trajectory to improve
compliance. Mention if project is production-ready,
requires corrections, or needs refactoring.]

General Recommendation: [Production-ready / Minor corrections /
Major refactoring / Overhaul necessary]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## IMPORTANT NOTES

- This command orchestrates the 4 specialized audits
- Use Docker for all analysis tools
- Provide concrete examples with file:line for each problem
- Prioritize actions based on Impact/Effort matrix
- Security problems are ALWAYS top priority
- Propose automatable corrections (scripts, pre-commit hooks)
- Report must be actionable, not just descriptive
- Adapt recommendations to project business context
