# Check Complete Vite Compliance

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Perform a complete compliance audit of the Vite project by orchestrating the 4 major checks: Architecture, Code Quality, Tests, and Security. Produce a consolidated report with an overall score out of 100 points.

> **Scope reminder**: this audit covers framework-agnostic Vite usage only (vanilla JS/TS apps, library authoring with `build.lib`, multi-page apps, Workers/WASM entries). Do not evaluate React/Vue/Angular/Svelte-specific dev-server integration; that belongs to the corresponding stack's own compliance check.

### Step 1: Audit Preparation

Prepare audit environment:
- [ ] Identify project path to audit
- [ ] Verify presence of configuration files (package.json, tsconfig.json, vite.config.ts)
- [ ] List main directories (src/, pages/, public/, tests/, etc.)
- [ ] Identify project type: vanilla SPA, library (build.lib), multi-page app, or Workers/WASM entry points
- [ ] Identify Vite version and confirm no framework-specific plugin (`@vitejs/plugin-react`, `@vitejs/plugin-vue`, etc.) is in scope

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: Architecture Audit (25 points)

Execute complete architecture check:

**Command**: Use slash command `/vite:check architecture` or manually follow steps in `.claude/references/vite/checks/architecture.md`

**Evaluated Criteria**:
- Project shape detection and entry points (index.html at root, build.lib entry, multi-page input, Worker/WASM `new URL` pattern) (6 pts)
- vite.config.ts structure (defineConfig, functional form, key ordering) (5 pts)
- Custom plugin organization (vite-plugins/, vite-plugin-* naming, one concern per plugin) (4 pts)
- Dependency externalization and package.json exports map (library) (6 pts)
- Output structure (dist/ ignored, ES + CJS + .d.ts via vite-plugin-dts, stable chunk names) (4 pts)

**Reference**: `.claude/references/vite/checks/architecture.md`

### Step 3: Code Quality Audit (25 points)

Execute code quality check:

**Command**: Use slash command `/vite:check code-quality` or manually follow steps in `.claude/references/vite/checks/code-quality.md`

**Evaluated Criteria**:
- ESLint analysis (no-explicit-any, no-restricted-imports, no-console) (5 pts)
- TypeScript strictness (strict, moduleResolution: "bundler", vite/client types) (6 pts)
- Framework leakage check (no React/Vue/Angular/Svelte coupling) (5 pts)
- Code complexity (function/file size, cyclomatic complexity, nesting) (4 pts)
- Vite-specific quality (functional config, extracted plugins, public-only VITE_* variables, static Worker/WASM patterns) (5 pts)

**Reference**: `.claude/references/vite/checks/code-quality.md`

### Step 4: Testing Audit (25 points)

Execute testing check:

**Command**: Use slash command `/vite:check testing` or manually follow steps in `.claude/references/vite/checks/testing.md`

**Evaluated Criteria**:
- Code coverage with Vitest (>= 80% statements, branches, functions, lines) (7 pts)
- Test organization and isolation (4 pts)
- Vanilla module testing (pure functions, edge cases, node environment) (4 pts)
- Worker testing (extracted handler logic, message contract) (4 pts)
- WASM wrapper testing (mocked `?init`, one real .wasm integration test) (3 pts)
- Library build-output testing on dist/ (ESM, CJS, exports map) (3 pts)

**Reference**: `.claude/references/vite/checks/testing.md`

### Step 5: Security Audit (25 points)

Execute security check:

**Command**: Use slash command `/vite:check security` or manually follow steps in `.claude/references/vite/checks/security.md`

**Evaluated Criteria**:
- Env / `define()` secret leakage (VITE_* prefix, hardcoded secrets) (7 pts)
- CSP coverage across entries (multi-page, server/CDN enforcement) (5 pts)
- WASM sandboxing (COOP/COEP, wasm-unsafe-eval, minimal imports object) (4 pts)
- Worker message validation (shape checks, no eval, origin checks) (5 pts)
- Dependency vulnerabilities (npm audit) (4 pts)

**Reference**: `.claude/references/vite/checks/security.md`

### Step 6: Consolidation and Global Scoring

Calculate overall score and produce consolidated report:
- [ ] Sum the 4 scores (max 100 points)
- [ ] Identify critical categories (<50%)
- [ ] List all critical cross-cutting issues (e.g. index.html in public/, secrets exposed via VITE_*, missing peer dep externalization)
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

> **Library projects**: `/vite:check-library-build` complements this audit for library projects (build.lib output, exports map, type declarations, tree-shaking). Run it in addition when the project publishes a package.

## OUTPUT FORMAT

```
VITE COMPLIANCE AUDIT - COMPLETE REPORT
=============================================

OVERALL SCORE: XX/100

COMPLIANCE LEVEL: [Excellent/Very Good/Acceptable/Insufficient/Critical]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORES BY CATEGORY:

ARCHITECTURE      : XX/25  [██████████░░░░░░░░░░] XX%
CODE QUALITY      : XX/25  [██████████░░░░░░░░░░] XX%
TESTS             : XX/25  [██████████░░░░░░░░░░] XX%
SECURITY          : XX/25  [██████████░░░░░░░░░░] XX%

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
1. [Critical issue - affected category #1]
2. [Critical issue - affected category #2]
3. [Critical issue - affected category #3]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILS BY CATEGORY:

┌─────────────────────────────────────────────┐
│ ARCHITECTURE (XX/25)
└─────────────────────────────────────────────┘

Sub-scores:
  • Project shape detection and entry points (index.html at root, build.lib entry, multi-page input, Worker/WASM `new URL` pattern) : XX/6
  • vite.config.ts structure (defineConfig, functional form, key ordering) : XX/5
  • Custom plugin organization (vite-plugins/, vite-plugin-* naming, one concern per plugin) : XX/4
  • Dependency externalization and package.json exports map (library) : XX/6
  • Output structure (dist/ ignored, ES + CJS + .d.ts via vite-plugin-dts, stable chunk names) : XX/4

Strengths:
- [Architecture strengths]

Issues:
- [Architecture issues]

[Similar sections for Code Quality, Tests, and Security...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITY ACTIONS (ALL CATEGORIES):

1. CRITICAL - [Action #1]
   Category : [Architecture/Code Quality/Tests/Security]
   Impact   : [High/Medium/Low]
   Effort   : [High/Medium/Low]
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

- [Quick win #1] - Category : [X] - Impact   : [X] - Effort   : [X]
- [Quick win #2] - Category : [X] - Impact   : [X] - Effort   : [X]
- [Quick win #3] - Category : [X] - Impact   : [X] - Effort   : [X]

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

- This command orchestrates the 4 specialized audits (`/vite:check architecture`, `/vite:check code-quality`, `/vite:check testing`, `/vite:check security`)
- Use Docker for all analysis tools
- Provide concrete examples with file:line for each problem
- Prioritize actions based on Impact/Effort matrix
- Security problems are ALWAYS top priority (secrets exposed through VITE_* or define() first)
- Propose automatable corrections (scripts, pre-commit hooks)
- Report must be actionable, not just descriptive
- Adapt recommendations to project type (vanilla app / library / multi-page / Workers-WASM)
- Do NOT evaluate framework-specific dev-server integration (React/Vue/Angular/Svelte); out of scope for this audit
