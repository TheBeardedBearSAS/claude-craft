# Check Complete Tauri v2 Compliance

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Perform a complete compliance audit of the Tauri v2 project by orchestrating the 4 major checks: Architecture, Code Quality, Tests, and Security. Produce a consolidated report with an overall score out of 100 points.

### Step 1: Audit Preparation

Prepare audit environment:
- [ ] Identify project path to audit
- [ ] Verify presence of configuration files (`src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/*.json`, `src-tauri/build.rs`, `package.json`, Vite config)
- [ ] List main directories (`src/`, `src-tauri/src/`, `src-tauri/capabilities/`, `src-tauri/icons/`, tests, CI workflows)
- [ ] Identify the Tauri version (`tauri`, `tauri-build`, `@tauri-apps/api`, `@tauri-apps/cli` in lockfiles), the Rust `rust-version` and the official plugins in use
- [ ] Confirm the target is Tauri v2 stable (Tauri 3 alpha and Tauri v1 are out of scope); note desktop-only vs mobile (iOS/Android) targets

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: Architecture Audit (25 points)

Execute complete architecture check:

**Command**: Use slash command `/tauri:check architecture` or manually follow steps in `.claude/references/tauri/checks/architecture.md`

**Evaluated Criteria**:
- Project layout (`src/` / `src-tauri/`, `lib.rs` `run()` entry, mobile entry point) and thin `main.rs` (5 pts)
- Command design: thin `#[tauri::command]` handlers, logic in testable Rust modules (6 pts)
- Typed error model: `thiserror` enum implementing `Serialize` (4 pts)
- State management (`manage` / `State<'_, T>`) and async correctness (no blocking, lock scope) (4 pts)
- Events and `Channel<T>` for streaming, plugin usage (`.plugin(...)`, `#[cfg(desktop)]`) (4 pts)
- Frontend/core boundary: no business logic in the webview, typed IPC (2 pts)

**Reference**: `.claude/references/tauri/checks/architecture.md`

### Step 3: Code Quality Audit (25 points)

Execute code quality check:

**Command**: Use slash command `/tauri:check code-quality` or manually follow steps in `.claude/references/tauri/checks/code-quality.md`

**Evaluated Criteria**:
- Clippy clean with `-D warnings` and `cargo fmt --check` (5 pts)
- Rust naming, ownership and borrowing hygiene (async commands with borrowed args return `Result`) (5 pts)
- Frontend typing and lint (`tsc --noEmit`, ESLint or Biome) and consistent `invoke` wrappers (4 pts)
- KISS/DRY/YAGNI principles (4 pts)
- Function size and cognitive complexity (4 pts)
- Error handling: no `unwrap()` / `expect()` in commands, no silent failures (3 pts)

**Reference**: `.claude/references/tauri/checks/code-quality.md`

### Step 4: Testing Audit (25 points)

Execute testing check:

**Command**: Use slash command `/tauri:check testing` or manually follow steps in `.claude/references/tauri/checks/testing.md`

**Evaluated Criteria**:
- Code coverage (target >= 80%) across Rust core and frontend (7 pts)
- Rust command tests without GUI (`tauri::test` mock runtime: `mock_builder()`, `mock_context(noop_assets())`) (6 pts)
- Frontend tests with `@tauri-apps/api/mocks` (`mockIPC`, `clearMocks()` in `afterEach`) (4 pts)
- End-to-end tests (WebdriverIO + `@wdio/tauri-service`, or `tauri-driver` on Windows/Linux) on a `tauri build --debug --no-bundle` build (3 pts)
- Test quality: AAA, naming, no flakiness, CI execution (3 pts)
- Test isolation and mocking of IPC and OS access (2 pts)

**Reference**: `.claude/references/tauri/checks/testing.md`

### Step 5: Security Audit (25 points)

Execute security check:

**Command**: Use slash command `/tauri:check security` or manually follow steps in `.claude/references/tauri/checks/security.md`

**Evaluated Criteria**:
- Capabilities and permissions: one capability per window/role, least privilege (6 pts)
- Scopes: `fs` / `http` allow and deny lists, no broad wildcards (4 pts)
- CSP (`app.security.csp`) and Isolation pattern (`app.security.pattern`) (5 pts)
- Updater signing: public key in config, private key never committed, CI secret (4 pts)
- Secrets and credentials management, OWASP Top 10:2025 protections (3 pts)
- Dependency vulnerabilities and supply chain (`cargo deny` / `cargo audit`, `npm audit`) (2 pts)
- Input validation in commands and untrusted-webview mindset (1 pt)

**Reference**: `.claude/references/tauri/checks/security.md`

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
TAURI V2 COMPLIANCE AUDIT - COMPLETE REPORT
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
  • Layout / entry points          : XX/5
  • Command design                 : XX/6
  • Typed errors                   : XX/4
  • State and async                : XX/4
  • Events, Channels, plugins      : XX/4
  • Frontend / core boundary       : XX/2

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
- Use Docker for all analysis tools (`docker compose exec app ...`); GUI builds may require CI
- Provide concrete examples with file:line for each problem
- Prioritize actions based on Impact/Effort matrix
- Security problems are ALWAYS top priority
- Propose automatable corrections (scripts, pre-commit hooks, CI steps)
- Report must be actionable, not just descriptive
- Adapt recommendations to project business context
- Pragmatism first: do not penalize a small app for a single `lib.rs` with modules when responsibilities are separated
- Out of scope: UI framework code (see the React / Vue / Svelte / Vite stacks) and general Rust rules (see the `rust` stack)
