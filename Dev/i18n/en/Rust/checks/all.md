# Check Complete Rust / Axum Compliance

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Perform a complete compliance audit of the Rust / Axum project by orchestrating the 4 major checks: Architecture, Code Quality, Tests, and Security. Produce a consolidated report with an overall score out of 100 points.

### Step 1: Audit Preparation

Prepare audit environment:
- [ ] Identify project path to audit
- [ ] Verify presence of configuration files (Cargo.toml, Cargo.lock, rust-toolchain.toml, rustfmt.toml, clippy.toml or `[lints]` tables, deny.toml, `.sqlx/`)
- [ ] List main directories (crates/ or src/, migrations/, tests/, benches/)
- [ ] Identify the Rust toolchain (`rust-toolchain.toml`), the edition (`edition = "2024"`) and the axum / tokio / sqlx versions (`Cargo.lock`)

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: Architecture Audit (25 points)

Execute complete architecture check:

**Command**: Use slash command `/rust:check architecture` or manually follow steps in `.claude/references/rust/checks/architecture.md`

**Evaluated Criteria**:
- Workspace layout and crate boundaries (domain free of axum/sqlx) (6 pts)
- Thin handlers, use cases in the application layer (6 pts)
- Router, State (`Arc<AppState>` / `FromRef`) and extractors (4 pts)
- Error model: `thiserror` in libraries, `AppError: IntoResponse`, problem+json (4 pts)
- Tower middleware, tracing and graceful shutdown (3 pts)
- Dependency direction and persistence adapters (SQLx) (2 pts)

**Reference**: `.claude/references/rust/checks/architecture.md`

### Step 3: Code Quality Audit (25 points)

Execute code quality check:

**Command**: Use slash command `/rust:check code-quality` or manually follow steps in `.claude/references/rust/checks/code-quality.md`

**Evaluated Criteria**:
- Clippy clean with `-D warnings` and workspace lints (5 pts)
- rustfmt, Rust API Guidelines naming, `#![forbid(unsafe_code)]` (5 pts)
- Ownership and borrowing hygiene, no needless clones, rustdoc (4 pts)
- KISS/DRY/YAGNI principles (4 pts)
- Function size and cognitive complexity (4 pts)
- Error handling: no `unwrap()` / `expect()` on request paths (3 pts)

**Reference**: `.claude/references/rust/checks/code-quality.md`

### Step 4: Testing Audit (25 points)

Execute testing check:

**Command**: Use slash command `/rust:check testing` or manually follow steps in `.claude/references/rust/checks/testing.md`

**Evaluated Criteria**:
- Code coverage (cargo-llvm-cov, target >= 80%) (7 pts)
- Unit tests in-module for domain and use cases (6 pts)
- Integration tests: Router with `oneshot`, `#[sqlx::test]` (4 pts)
- Test quality: AAA, naming, nextest, no flakiness (3 pts)
- Property, snapshot and mutation testing (proptest, insta, cargo-mutants) (3 pts)
- Test isolation and mocking of ports (2 pts)

**Reference**: `.claude/references/rust/checks/testing.md`

### Step 5: Security Audit (25 points)

Execute security check:

**Command**: Use slash command `/rust:check security` or manually follow steps in `.claude/references/rust/checks/security.md`

**Evaluated Criteria**:
- OWASP Top 10:2025 protections (6 pts)
- Secrets and credentials management (`secrecy`, environment, vault) (5 pts)
- Input validation (validator / garde), body limits, output encoding (4 pts)
- Dependency vulnerabilities and supply chain (cargo-deny, cargo-audit, cargo-vet) (4 pts)
- Authentication, authorization and rate limiting (Argon2id, JWT EdDSA, tower_governor) (3 pts)
- Secure configuration (security headers, cookies, CORS, TLS) (2 pts)
- SQL injection prevention (SQLx bind parameters) (1 pt)

**Reference**: `.claude/references/rust/checks/security.md`

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
RUST / AXUM COMPLIANCE AUDIT - COMPLETE REPORT
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
  • Workspace / crate boundaries   : XX/6
  • Thin handlers / use cases      : XX/6
  • Router, State, extractors      : XX/4
  • Error model / problem+json     : XX/4
  • Middleware, tracing, shutdown  : XX/3
  • Dependencies and adapters      : XX/2

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
- Use Docker for all analysis tools (`docker compose exec app ...`)
- Provide concrete examples with file:line for each problem
- Prioritize actions based on Impact/Effort matrix
- Security problems are ALWAYS top priority
- Propose automatable corrections (scripts, pre-commit hooks, CI steps)
- Report must be actionable, not just descriptive
- Adapt recommendations to project business context
- Pragmatism first: do not penalize a small service for being a single crate with modules when boundaries are respected
