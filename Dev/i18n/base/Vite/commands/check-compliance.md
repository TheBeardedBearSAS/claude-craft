---
description: Audit Vite project compliance with framework-agnostic best practices
argument-hint: [arguments]
---

# Check Complete Vite Compliance

> For Vite configured as a React/Vue/Angular/Svelte dev-server, use that stack's `check-compliance` command instead — this command covers **only** framework-agnostic Vite usage (vanilla SPA, library, multi-page app, worker/WASM).

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Perform a complete compliance audit of the Vite project by orchestrating the 4 major checks: Config & Architecture, TypeScript & Quality, Tests, and Build Output & Performance. Produce a consolidated report with an overall score out of 100 points.

### Step 1: Audit Preparation

Prepare audit environment:
- [ ] Identify project path to audit
- [ ] Verify presence of configuration files (package.json, tsconfig.json, vite.config.ts)
- [ ] List main directories (src/, public/, dist/, vite-plugins/, etc.)
- [ ] Detect the project shape: vanilla-spa / library / multi-page / worker-wasm (see `02-architecture-vite.md`)
- [ ] Identify Vite and TypeScript versions

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: Config & Architecture Audit (30 points)

Execute complete architecture check:

**Command**: Use slash command `/vite:check-architecture` or manually follow steps in `check-architecture.md`

**Evaluated Criteria**:
- Project shape detection and consistency (6 pts)
- `vite.config.ts` structure and functional `(mode, command)` form (6 pts)
- Entry point declarations matching the detected shape (8 pts)
- Custom plugin organization (`vite-plugin-*` naming, single concern) (5 pts)
- Dependency externalization for libraries (3 pts)
- Output structure (dist/ gitignored, stable naming) (2 pts)

**Reference**: `check-architecture.md`

### Step 3: TypeScript & Quality Audit (20 points)

Execute code quality check:

**Command**: Use slash command `/vite:check-code-quality` or manually follow steps in `check-code-quality.md`

**Evaluated Criteria**:
- TypeScript strict mode and `moduleResolution: "bundler"` (5 pts)
- ESLint flat config compliance (5 pts)
- No accidental framework leakage (React/Vue/Angular/Svelte imports) (4 pts)
- KISS/DRY/YAGNI and code complexity (3 pts)
- Naming conventions (`vite-plugin-*`, `*.worker.ts`) (3 pts)

**Reference**: `check-code-quality.md`

### Step 4: Testing Audit (25 points)

Execute testing check:

**Command**: Use slash command `/vite:check-testing` or manually follow steps in `check-testing.md`

**Evaluated Criteria**:
- Code coverage (7 pts)
- Unit tests for vanilla modules (6 pts)
- Worker message-contract tests (4 pts)
- WASM wrapper tests (mocked `?init` + one real integration test) (4 pts)
- Library build-output smoke test, if applicable (2 pts)
- Test organization and co-location (2 pts)

**Reference**: `check-testing.md`

### Step 5: Build Output & Performance Audit (25 points)

Evaluate build configuration and output quality:

- [ ] Bundle size within `chunkSizeWarningLimit` (6 pts)
- [ ] Code splitting configured correctly (Rolldown `codeSplitting.groups` on Vite 8, or legacy `manualChunks`) (5 pts)
- [ ] Library build emits ES + CJS + `.d.ts` via `vite-plugin-dts`, peer deps externalized (6 pts)
- [ ] Source maps disabled or private in production (3 pts)
- [ ] `vite preview` used to validate the production build locally before deploy (2 pts)
- [ ] `npm audit` clean at moderate+ severity (3 pts)

**Reference**: `08-quality-tools.md`, `11-security-vite.md`

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
VITE COMPLIANCE AUDIT - COMPLETE REPORT
=============================================

OVERALL SCORE: XX/100

COMPLIANCE LEVEL: [Excellent/Very Good/Acceptable/Insufficient/Critical]
PROJECT SHAPE: [vanilla-spa/library/multi-page/worker-wasm]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORES BY CATEGORY:

CONFIG & ARCHITECTURE  : XX/30  [██████████░░░░░░░░░░] XX%
TYPESCRIPT & QUALITY    : XX/20  [██████████░░░░░░░░░░] XX%
TESTS                   : XX/25  [██████████░░░░░░░░░░] XX%
BUILD OUTPUT & PERF     : XX/25  [██████████░░░░░░░░░░] XX%

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
│ CONFIG & ARCHITECTURE (XX/30)                │
└─────────────────────────────────────────────┘

Sub-scores:
  • Project shape detection      : XX/6
  • vite.config.ts structure     : XX/6
  • Entry point declarations     : XX/8
  • Custom plugin organization   : XX/5
  • Dependency externalization   : XX/3
  • Output structure             : XX/2

Strengths:
- [Architecture strengths]

Issues:
- [Architecture issues]

[Similar sections for TypeScript & Quality, Tests, and Build Output & Performance...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITY ACTIONS (ALL CATEGORIES):

1. CRITICAL - [Action #1]
   Category  : [Architecture/Quality/Tests/Build]
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
- Security-relevant findings (env leakage, CSP, WASM sandboxing) surfaced during any check are ALWAYS top priority
- Propose automatable corrections (scripts, pre-commit hooks)
- Report must be actionable, not just descriptive
- Adapt recommendations to the detected project shape — do not apply library-shape recommendations to a vanilla SPA, or vice versa
