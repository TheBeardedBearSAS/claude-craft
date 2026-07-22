---
description: Check Complete Vercel Compliance
argument-hint: [arguments]
---

# Check Complete Vercel Compliance

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Perform a complete compliance audit of the Vercel deployment configuration and platform-surface code by orchestrating the 4 major checks: vercel.json & Architecture, Functions & Runtime Choice, Security & Env Handling, and ISR/Caching & Tests. Produce a consolidated report with an overall score out of 100 points. **Scope reminder**: this audit covers framework-agnostic Vercel platform usage only (`vercel.json`, Serverless Functions on Node.js/Fluid Compute, ISR cache primitives, Cron Jobs, Storage). Do not evaluate Next.js-specific routing, rendering, or data-fetching (`revalidatePath`, `revalidateTag`, App Router, etc.) — that belongs to the corresponding framework stack's own compliance check (`/react:*`, `/vuejs:*`, `/angular:*`).

### Step 1: Audit Preparation

Prepare audit environment:
- [ ] Identify project path to audit
- [ ] Verify presence of configuration files (`vercel.json`, `package.json`, `tsconfig.json`)
- [ ] List main directories (`api/`, `middleware.ts`, `.vercel/`, test directories, etc.)
- [ ] Classify project shape: static-only, Functions-only, ISR-enabled, Cron-enabled, or hybrid
- [ ] Identify whether any framework (Next.js, or a Vite/React/Vue/Angular build) sits on top, and confirm framework-specific routing/rendering is out of scope for this audit

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: vercel.json & Architecture Audit (30 points)

Execute complete configuration and architecture check:

**Evaluated Criteria**:
- vercel.json schema-correct (`$schema`, `version`, valid top-level keys) (8 pts)
- rewrites/redirects/headers correctness (redirect vs rewrite, no header duplication with middleware) (6 pts)
- regions & functions block (no ambiguous glob overlap, memory/maxDuration justified) (8 pts)
- Project-shape fit (config matches the declared static/Functions/ISR/Cron shape) (8 pts)

**Reference**: `.claude/agents/vercel-reviewer.md` (section 1)

### Step 3: Functions & Runtime Choice Audit (20 points)

Execute runtime and handler quality check:

**Evaluated Criteria**:
- No unflagged `runtime: 'edge'` on new/modified code (Node.js/Fluid Compute default respected) (8 pts)
- Node.js version pinned to 20+ for the Fluid Compute bytecode-caching benefit (6 pts)
- Handler signature quality (input validated, explicit typed responses, cold-start-aware imports) (6 pts)

**Reference**: `.claude/agents/vercel-reviewer.md` (section 2)

### Step 4: Security & Env Handling Audit (25 points)

Execute security and secrets-handling check:

**Evaluated Criteria**:
- Secrets/env vars (no hardcoding, no leakage to client bundle, correct environment scoping) (8 pts)
- Cron endpoints verify an invocation secret (timing-safe compare) (8 pts)
- CORS/CSP headers correctness (no wildcard + credentials, baseline CSP present) (5 pts)
- Marketplace credential scoping (least-privilege, no deprecated `@vercel/kv`/`@vercel/postgres`) (4 pts)

**Reference**: `.claude/agents/vercel-reviewer.md` (section 3)

### Step 5: ISR/Caching & Tests Audit (25 points)

Execute caching and testing check:

**Evaluated Criteria**:
- Cache-Control correctness (stale-while-revalidate on cacheable routes) (8 pts)
- No vercel.json/framework revalidation conflict (single source of truth) (7 pts)
- Handler test coverage (happy/validation/auth paths, >= 80%) (6 pts)
- `x-vercel-cache` verified / integration smoke test via `vercel dev` (4 pts)

**Reference**: `.claude/agents/vercel-reviewer.md` (section 4)

### Step 6: Consolidation and Global Scoring

Calculate overall score and produce consolidated report:
- [ ] Sum the 4 scores (30 + 20 + 25 + 25 = 100 points)
- [ ] Identify critical categories (<50% of their max)
- [ ] List all critical cross-cutting issues (e.g. unguarded Cron endpoint, hardcoded secret, deprecated Storage package)
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
VERCEL COMPLIANCE AUDIT - COMPLETE REPORT
=============================================

OVERALL SCORE: XX/100

COMPLIANCE LEVEL: [Excellent/Very Good/Acceptable/Insufficient/Critical]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORES BY CATEGORY:

VERCEL.JSON & ARCHITECTURE   : XX/30  [██████████░░░░░░░░░░] XX%
FUNCTIONS & RUNTIME CHOICE   : XX/20  [██████████░░░░░░░░░░] XX%
SECURITY & ENV HANDLING      : XX/25  [██████████░░░░░░░░░░] XX%
ISR/CACHING & TESTS          : XX/25  [██████████░░░░░░░░░░] XX%

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
│ VERCEL.JSON & ARCHITECTURE (XX/30)           │
└─────────────────────────────────────────────┘

Sub-scores:
  • vercel.json schema correctness   : XX/8
  • rewrites/redirects/headers       : XX/6
  • regions & functions block        : XX/8
  • Project-shape fit                : XX/8

Strengths:
- [Architecture strengths]

Issues:
- [Architecture issues]

┌─────────────────────────────────────────────┐
│ FUNCTIONS & RUNTIME CHOICE (XX/20)           │
└─────────────────────────────────────────────┘

Sub-scores:
  • Node.js/Fluid Compute vs Edge     : XX/8
  • Node.js version pinned            : XX/6
  • Handler signature quality         : XX/6

Strengths:
- [Runtime strengths]

Issues:
- [Runtime issues]

┌─────────────────────────────────────────────┐
│ SECURITY & ENV HANDLING (XX/25)              │
└─────────────────────────────────────────────┘

Sub-scores:
  • Secrets/env vars                  : XX/8
  • Cron auth guard                   : XX/8
  • CORS/CSP headers                  : XX/5
  • Marketplace credential scoping    : XX/4

Strengths:
- [Security strengths]

Issues:
- [Security issues]

┌─────────────────────────────────────────────┐
│ ISR/CACHING & TESTS (XX/25)                  │
└─────────────────────────────────────────────┘

Sub-scores:
  • Cache-Control correctness         : XX/8
  • Revalidation conflict-free        : XX/7
  • Handler test coverage             : XX/6
  • x-vercel-cache verified           : XX/4

Strengths:
- [Caching/testing strengths]

Issues:
- [Caching/testing issues]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITY ACTIONS (ALL CATEGORIES):

1. CRITICAL - [Action #1]
   Category  : [Architecture/Runtime/Security/Caching]
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

- This command orchestrates the 4 categories covered by `@vercel-reviewer`
- Use Docker for all analysis tools
- Provide concrete examples with file:line for each problem
- Prioritize actions based on Impact/Effort matrix
- An unguarded Cron endpoint and a hardcoded secret are ALWAYS top priority when found (they allow anyone who discovers the path/repo to trigger jobs or exfiltrate credentials)
- A `runtime: 'edge'` finding on new/modified code is always flagged, but never blocks a report on unmodified legacy code — treat it as migration debt, not a hard failure
- Propose automatable corrections (scripts, pre-commit hooks)
- Report must be actionable, not just descriptive
- Adapt recommendations to project shape (static-only / Functions-only / ISR-enabled / Cron-enabled / hybrid)
- Do NOT evaluate Next.js-specific routing/rendering/data-fetching or any other framework's own dev-server integration — out of scope for this audit
