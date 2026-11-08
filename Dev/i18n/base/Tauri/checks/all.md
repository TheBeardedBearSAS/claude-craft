# Check Complete Tauri v2 Compliance

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans both the Rust core and the web frontend, or requires cross-cutting investigation.

## MISSION

Perform a complete compliance audit of the Tauri v2 project (stable line 2.12; Tauri 3 alpha is out of scope) by orchestrating the 4 major checks: Architecture, Code Quality, Tests, and Security. Produce a consolidated report with an overall score out of 100 points.

### Step 1: Audit Preparation

Prepare audit environment:
- [ ] Identify project path to audit
- [ ] Verify presence of configuration files (`src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/`, `src-tauri/build.rs`, `package.json`, `tsconfig.json`, `rust-toolchain.toml`, `deny.toml`)
- [ ] List main directories (`src/`, `src-tauri/src/`, `src-tauri/capabilities/`, `tests/` or `e2e/`)
- [ ] Identify Tauri crate and CLI versions, Rust toolchain, frontend framework and bundler, target platforms (desktop, Android, iOS)

```bash
docker compose exec app rustc --version
docker compose exec app grep -nE "^(tauri|tauri-build) |tauri-plugin-|rust-version|edition" src-tauri/Cargo.toml
docker compose exec app grep -nE "@tauri-apps/" package.json
docker compose exec app ls src-tauri/capabilities
```

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: Architecture Audit (25 points)

Execute architecture check: `/tauri:check architecture` or follow `.claude/references/tauri/checks/architecture.md`

**Evaluated Criteria**:
- Project layout: `src/` + `src-tauri/`, thin `main.rs`, `run()` with the mobile entry point (5 pts)
- Command layer: thin, typed, grouped, registered once (6 pts)
- State, plugins and setup, desktop/mobile gating (5 pts)
- Windows, configuration and platforms (4 pts)
- Frontend / backend boundary: typed wrappers, events, channels (5 pts)

**Reference**: `.claude/references/tauri/checks/architecture.md`

### Step 3: Code Quality Audit (25 points)

Execute code quality check: `/tauri:check code-quality` or follow `.claude/references/tauri/checks/code-quality.md`

**Evaluated Criteria**:
- Rust lints and formatting: fmt, Clippy `-D warnings`, `unsafe` hygiene (6 pts)
- TypeScript side of the boundary: strict `tsc`, ESLint/Biome, typed `invoke` (5 pts)
- KISS/DRY/YAGNI and complexity (3 pts)
- Error handling: serializable `thiserror` enums, no panics, handled rejections (5 pts)
- Naming and documentation (3 pts)
- Toolchain pinning, CI and version alignment (3 pts)

**Reference**: `.claude/references/tauri/checks/code-quality.md`

### Step 4: Testing Audit (25 points)

Execute testing check: `/tauri:check testing` or follow `.claude/references/tauri/checks/testing.md`

**Evaluated Criteria**:
- Code coverage, 80% minimum, Rust and frontend (5 pts)
- Rust core tests with the `tauri::test` mock runtime (6 pts)
- Frontend IPC tests with `mockIPC` / `clearMocks` (5 pts)
- End-to-end tests with WebdriverIO or `tauri-driver` (5 pts)
- Isolation, speed and CI structure (4 pts)

**Reference**: `.claude/references/tauri/checks/testing.md`

### Step 5: Security Audit (25 points)

Execute security check: `/tauri:check security` or follow `.claude/references/tauri/checks/security.md`

**Evaluated Criteria**:
- Capabilities and permissions, least privilege (7 pts)
- Scopes for filesystem, shell and network (4 pts)
- CSP, Isolation pattern, global API exposure (4 pts)
- Updater signing, private key handling and secrets (4 pts)
- Command input validation and injection (3 pts)
- Dependencies and supply chain (3 pts)

**Reference**: `.claude/references/tauri/checks/security.md`

### Step 6: Consolidation and Global Scoring

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

- [ ] Identify top 3 priority actions across all categories
- [ ] Estimate effort (Low/Medium/High) and impact (Low/Medium/High) for each
- [ ] Propose implementation order
- [ ] Suggest quick wins (high impact/effort ratio)

**Version health** (reported in the executive summary, not scored):
- Tauri 2.12 is the reference stable line (`tauri` 2.12.x, `@tauri-apps/cli` and `@tauri-apps/api` 2.12.x); flag older minor lines, mismatched crate/npm versions and any yanked crate in `Cargo.lock`.
- Tauri v1 projects: report and recommend migration to v2. Tauri 3 alpha and other pre-releases are not for production.
- MSRV: Tauri 2.12 requires Rust 1.90; the `rust` stack targets current stable with edition 2024.
- Official plugins should track their latest 2.x releases (updater, shell, http, sql, single-instance, ...).

## OUTPUT FORMAT

```
TAURI v2 COMPLIANCE AUDIT - COMPLETE REPORT
===========================================

OVERALL SCORE: XX/100

COMPLIANCE LEVEL: [Excellent/Very Good/Acceptable/Insufficient/Critical]

Tauri: X.Y   Rust: X.Y.Z   Frontend: [framework + bundler]   Targets: [desktop/android/ios]   E2E: [wdio/tauri-driver/none]

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
1. [Cross-cutting improvement]
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
  • Project layout                    : XX/5
  • Command layer                     : XX/6
  • State, plugins and setup          : XX/5
  • Windows, configuration, platforms : XX/4
  • Frontend / backend boundary       : XX/5

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
major weaknesses, version health (Tauri line, Rust toolchain,
plugin alignment), and recommended trajectory. Say whether the
project is production-ready, requires corrections, or needs
refactoring.]

General Recommendation: [Production-ready / Minor corrections /
Major refactoring / Overhaul necessary]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## IMPORTANT NOTES

- This command orchestrates the 4 specialized audits
- Use Docker for all analysis tools (`docker compose exec app ...`); GUI and E2E runs need the target OS or a virtual display
- Provide concrete examples with file:line for each problem
- Prioritize actions based on Impact/Effort matrix
- Security problems are ALWAYS top priority; over-broad capabilities and leaked signing keys are release blockers
- Frontend-framework concerns are delegated to the React / Vue / Svelte / Vite audits, general Rust concerns to the `rust` stack
- Propose automatable corrections (CI workflow, pre-commit hooks, `cargo deny`, capability snapshot test)
- Report must be actionable, not just descriptive
- Adapt recommendations to project business context
