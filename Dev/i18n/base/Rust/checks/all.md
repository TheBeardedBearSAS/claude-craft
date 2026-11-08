# Check Complete Rust / Axum Compliance

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple crates or requires cross-cutting investigation.

## MISSION

Perform a complete compliance audit of the Rust / Axum project by orchestrating the 4 major checks: Architecture, Code Quality, Tests, and Security. Produce a consolidated report with an overall score out of 100 points.

### Step 1: Audit Preparation

Prepare audit environment:
- [ ] Identify project path to audit
- [ ] Verify presence of configuration files (`Cargo.toml`, `Cargo.lock`, `rust-toolchain.toml`, `deny.toml`, `rustfmt.toml`, `.sqlx/`)
- [ ] List main directories (`crates/` or `src/`, `migrations/`, `tests/`)
- [ ] Identify Rust toolchain, edition, and axum/tokio/sqlx versions

```bash
docker compose exec app rustc --version
docker compose exec app cargo --version
docker compose exec app cargo tree --workspace --depth 1 -i axum
docker compose exec app grep -nE "^(edition|rust-version)" Cargo.toml
```

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: Architecture Audit (25 points)

Execute architecture check: `/rust:check architecture` or follow `.claude/references/rust/checks/architecture.md`

**Evaluated Criteria**:
- Workspace layout and project structure (5 pts)
- Thin HTTP layer: routers, extractors, state (6 pts)
- Domain and application design, dependency-free domain (6 pts)
- Data layer: SQLx checked queries, migrations, transactions (4 pts)
- Async runtime hygiene, graceful shutdown, observability (2 pts)
- Dependency direction and configuration (2 pts)

**Reference**: `.claude/references/rust/checks/architecture.md`

### Step 3: Code Quality Audit (25 points)

Execute code quality check: `/rust:check code-quality` or follow `.claude/references/rust/checks/code-quality.md`

**Evaluated Criteria**:
- Clippy (`-D warnings`) and rustfmt clean (6 pts)
- Idiomatic Rust: borrowing, iterators, newtypes, no needless `unsafe` (5 pts)
- KISS/DRY/YAGNI and complexity (4 pts)
- Error handling: `thiserror`, `anyhow` only in binaries, no panics in request paths (4 pts)
- Naming conventions and documentation (3 pts)
- Toolchain pinning and CI (3 pts)

**Reference**: `.claude/references/rust/checks/code-quality.md`

### Step 4: Testing Audit (25 points)

Execute testing check: `/rust:check testing` or follow `.claude/references/rust/checks/testing.md`

**Evaluated Criteria**:
- Code coverage with cargo-llvm-cov, 80% minimum (7 pts)
- Domain and unit tests (6 pts)
- HTTP and integration tests (`oneshot`, `#[sqlx::test]`) (5 pts)
- Contract, end-to-end and doc tests (3 pts)
- Fixtures and test data (2 pts)
- Test isolation and speed (cargo-nextest) (2 pts)

**Reference**: `.claude/references/rust/checks/testing.md`

### Step 5: Security Audit (25 points)

Execute security check: `/rust:check security` or follow `.claude/references/rust/checks/security.md`

**Evaluated Criteria**:
- Memory safety and static analysis (`forbid(unsafe_code)`, clippy) (6 pts)
- Dependency vulnerabilities and supply chain (cargo-audit, cargo-deny) (4 pts)
- Secrets and credentials management (4 pts)
- Authentication and authorization (Argon2id, JWT pinning, IDOR) (4 pts)
- Injection and input validation (4 pts)
- Secure configuration, headers, rate limiting (3 pts)

**Reference**: `.claude/references/rust/checks/security.md`

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
- Rust stable is the baseline; flag a toolchain more than a few releases behind stable and an MSRV that blocks security updates.
- Edition 2024 is expected for new code; older editions are accepted with a migration plan (`cargo fix --edition`).
- axum 0.8, tokio 1.x and sqlx 0.9 are the reference lines; flag older minor lines and any yanked crate in `Cargo.lock`.

## OUTPUT FORMAT

```
RUST / AXUM COMPLIANCE AUDIT - COMPLETE REPORT
==============================================

OVERALL SCORE: XX/100

COMPLIANCE LEVEL: [Excellent/Very Good/Acceptable/Insufficient/Critical]

Rust: X.Y.Z   Edition: 20XX   axum: X.Y   Test runner: cargo-nextest

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
  • Workspace and structure       : XX/5
  • Thin HTTP layer               : XX/6
  • Domain / application design   : XX/6
  • Data layer                    : XX/4
  • Async runtime / operations    : XX/2
  • Dependency direction          : XX/2

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
major weaknesses, version health (toolchain, edition and key crate
lines), and recommended trajectory. Say whether the project is
production-ready, requires corrections, or needs refactoring.]

General Recommendation: [Production-ready / Minor corrections /
Major refactoring / Overhaul necessary]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## IMPORTANT NOTES

- This command orchestrates the 4 specialized audits
- Use Docker for all analysis tools (`docker compose exec app ...`)
- Provide concrete examples with file:line for each problem
- Prioritize actions based on Impact/Effort matrix
- Security problems are ALWAYS top priority
- A single-crate service with clean modules is acceptable; do not penalize the absence of a workspace on its own
- Propose automatable corrections (CI workflow, pre-commit hooks, `cargo deny`, `cargo clippy --fix` after review)
- Report must be actionable, not just descriptive
- Adapt recommendations to project business context
