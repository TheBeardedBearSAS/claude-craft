---
description: Check Complete Vite Compliance
argument-hint: [arguments]
---

# Check Complete Vite Compliance

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Perform a complete compliance audit of the Vite project by orchestrating the 4 major checks: Config & Architecture Vite, TypeScript & Quality, Tests, and Build Output & Performance. Produce a consolidated report with an overall score out of 100 points. **Scope reminder**: this audit covers framework-agnostic Vite usage only (vanilla JS/TS apps, library authoring, multi-page apps, Workers/WASM). Do not evaluate React/Vue/Angular/Svelte-specific dev-server integration — that belongs to the corresponding stack's own compliance check.

### Step 1: Audit Preparation

Prepare audit environment:
- [ ] Identify project path to audit
- [ ] Verify presence of configuration files (package.json, tsconfig.json, vite.config.ts)
- [ ] List main directories (src/, pages/, public/, tests/, etc.)
- [ ] Identify project type: vanilla SPA, library (build.lib), multi-page app, or Workers/WASM entry points
- [ ] Identify Vite version and confirm no framework-specific plugin (`@vitejs/plugin-react`, `@vitejs/plugin-vue`, etc.) is in scope for this audit

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: Config & Architecture Vite Audit (30 points)

Execute complete configuration and architecture check:

**Evaluated Criteria**:
- vite.config.ts correctness (defineConfig, aliases synced with tsconfig) (8 pts)
- index.html placement at project root, never inside public/ (6 pts)
- build.lib configuration for libraries (entry, formats, external, vite-plugin-dts) (8 pts)
- rollupOptions.input for multi-page apps, plugin naming convention (vite-plugin-*) (8 pts)

**Reference**: `.claude/agents/vite-reviewer.md` (section 1)

### Step 3: TypeScript & Quality Audit (20 points)

Execute TypeScript configuration and typing quality check:

**Evaluated Criteria**:
- strict: true, moduleResolution: "bundler", target ES2022+ (6 pts)
- Vite types present (vite/client), import.meta.env correctly typed (5 pts)
- vite-plugin-dts output correctness (rollupTypes, zero unjustified any) (5 pts)
- Custom plugin hooks typed via the Plugin interface (4 pts)

**Reference**: `.claude/agents/vite-reviewer.md` (section 2)

### Step 4: Testing Audit (25 points)

Execute testing check:

**Evaluated Criteria**:
- Coherent Vitest config (mergeConfig or dedicated file), no drift with vite.config.ts (6 pts)
- Coverage >= 80% on business logic / public API (6 pts)
- Test environment matches the need (node vs jsdom/happy-dom) (4 pts)
- Tests on the published build (dist/), not just source code (5 pts)
- Integration/E2E tests for multi-page apps (4 pts)

**Reference**: `.claude/agents/vite-reviewer.md` (section 3)

### Step 5: Build Output & Performance Audit (25 points)

Execute build output and performance check:

**Evaluated Criteria**:
- Effective tree-shaking (sideEffects: false, named exports, coherent exports map) (6 pts)
- Dependencies externalized for libraries (peer deps not bundled) (6 pts)
- Code-splitting for multi-page apps (manualChunks, shared vendor) (5 pts)
- Bundle under thresholds, assetsInlineLimit controlled (4 pts)
- Asset hashing, appropriate build.target, sourcemaps handled correctly in prod (4 pts)

**Reference**: `.claude/agents/vite-reviewer.md` (section 4)

### Step 6: Consolidation and Global Scoring

Calculate overall score and produce consolidated report:
- [ ] Sum the 4 scores (30 + 20 + 25 + 25 = 100 points)
- [ ] Identify critical categories (<50% of their max)
- [ ] List all critical cross-cutting issues (e.g. index.html in public/, missing peer dep externalization)
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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORES BY CATEGORY:

CONFIG & ARCHITECTURE VITE   : XX/30  [██████████░░░░░░░░░░] XX%
TYPESCRIPT & QUALITY         : XX/20  [██████████░░░░░░░░░░] XX%
TESTS                        : XX/25  [██████████░░░░░░░░░░] XX%
BUILD OUTPUT & PERFORMANCE   : XX/25  [██████████░░░░░░░░░░] XX%

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
│ CONFIG & ARCHITECTURE VITE (XX/30)           │
└─────────────────────────────────────────────┘

Sub-scores:
  • vite.config.ts correctness       : XX/8
  • index.html placement             : XX/6
  • build.lib configuration          : XX/8
  • rollupOptions.input / plugins    : XX/8

Strengths:
- [Architecture strengths]

Issues:
- [Architecture issues]

┌─────────────────────────────────────────────┐
│ TYPESCRIPT & QUALITY (XX/20)                 │
└─────────────────────────────────────────────┘

Sub-scores:
  • strict mode / moduleResolution   : XX/6
  • Vite types / import.meta.env     : XX/5
  • vite-plugin-dts output           : XX/5
  • Typed plugin hooks               : XX/4

Strengths:
- [Typing strengths]

Issues:
- [Typing issues]

┌─────────────────────────────────────────────┐
│ TESTS (XX/25)                                │
└─────────────────────────────────────────────┘

Sub-scores:
  • Vitest config coherence          : XX/6
  • Coverage >= 80%                  : XX/6
  • Test environment fit             : XX/4
  • Published build tested           : XX/5
  • Integration/E2E multi-page       : XX/4

Strengths:
- [Testing strengths]

Issues:
- [Testing issues]

┌─────────────────────────────────────────────┐
│ BUILD OUTPUT & PERFORMANCE (XX/25)           │
└─────────────────────────────────────────────┘

Sub-scores:
  • Tree-shaking effectiveness       : XX/6
  • Peer dep externalization         : XX/6
  • Multi-page code-splitting        : XX/5
  • Bundle thresholds                : XX/4
  • Hashing / build.target / sourcemaps : XX/4

Strengths:
- [Performance strengths]

Issues:
- [Performance issues]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITY ACTIONS (ALL CATEGORIES):

1. CRITICAL - [Action #1]
   Category  : [Architecture/TypeScript/Tests/Performance]
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

- This command orchestrates the 4 categories covered by `@vite-reviewer`
- Use Docker for all analysis tools
- Provide concrete examples with file:line for each problem
- Prioritize actions based on Impact/Effort matrix
- index.html placement and peer dependency externalization are ALWAYS top priority when violated (they break the module graph or bloat every consumer's bundle)
- Propose automatable corrections (scripts, pre-commit hooks)
- Report must be actionable, not just descriptive
- Adapt recommendations to project type (vanilla app / library / multi-page / Workers-WASM)
- Do NOT evaluate framework-specific dev-server integration (React/Vue/Angular/Svelte) — out of scope for this audit
