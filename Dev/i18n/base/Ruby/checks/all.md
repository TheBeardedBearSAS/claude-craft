# Check Complete Ruby / Rails Compliance

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Perform a complete compliance audit of the Ruby on Rails project by orchestrating the 4 major checks: Architecture, Code Quality, Tests, and Security. Produce a consolidated report with an overall score out of 100 points.

### Step 1: Audit Preparation

Prepare audit environment:
- [ ] Identify project path to audit
- [ ] Verify presence of configuration files (`Gemfile`, `Gemfile.lock`, `.ruby-version`, `.rubocop.yml`, `config/application.rb`)
- [ ] List main directories (`app/`, `config/`, `db/`, `spec/` or `test/`, `lib/`)
- [ ] Identify Ruby and Rails versions

```bash
docker compose exec app ruby -v
docker compose exec app bin/rails -v
docker compose exec app bin/rails about
```

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: Architecture Audit (25 points)

Execute architecture check: `/ruby:check architecture` or follow `.claude/references/ruby/checks/architecture.md`

**Evaluated Criteria**:
- Rails conventions and directory layout (5 pts)
- Thin controllers (6 pts)
- Model design and extraction of service/form/query objects (6 pts)
- Data layer: migrations, constraints, N+1 (4 pts)
- Background jobs, caching, realtime (Solid Queue/Cache/Cable) (2 pts)
- Zeitwerk autoloading and dependency direction (2 pts)

**Reference**: `.claude/references/ruby/checks/architecture.md`

### Step 3: Code Quality Audit (25 points)

Execute code quality check: `/ruby:check code-quality` or follow `.claude/references/ruby/checks/code-quality.md`

**Evaluated Criteria**:
- RuboCop (rubocop-rails-omakase or project config) clean (6 pts)
- Idiomatic Ruby 4.0 (frozen string literals, pattern matching, keyword args) (5 pts)
- KISS/DRY/YAGNI and complexity (4 pts)
- Error handling (4 pts)
- Naming conventions and documentation (3 pts)
- Typing (RBS/Steep or Sorbet, optional) and dead code (3 pts)

**Reference**: `.claude/references/ruby/checks/code-quality.md`

### Step 4: Testing Audit (25 points)

Execute testing check: `/ruby:check testing` or follow `.claude/references/ruby/checks/testing.md`

**Evaluated Criteria**:
- Code coverage with SimpleCov, 80% minimum (7 pts)
- Model and object unit tests (6 pts)
- Request and integration tests (5 pts)
- System tests (Capybara) (3 pts)
- Factories/fixtures quality (2 pts)
- Test isolation and speed (2 pts)

**Reference**: `.claude/references/ruby/checks/testing.md`

### Step 5: Security Audit (25 points)

Execute security check: `/ruby:check security` or follow `.claude/references/ruby/checks/security.md`

**Evaluated Criteria**:
- Brakeman static analysis (6 pts)
- Dependency vulnerabilities (bundler-audit, Dependabot) (4 pts)
- Secrets and credentials management (4 pts)
- Authentication and authorization (4 pts)
- Injection, XSS and mass assignment prevention (4 pts)
- Secure configuration, headers, rate limiting (3 pts)

**Reference**: `.claude/references/ruby/checks/security.md`

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
- Ruby 4.0.x is current; Ruby 3.x is accepted but flag a migration plan.
- Rails 8.1 is supported until 2027-10-10. Rails 8.0 reaches end of life on 2026-11-07: flag it as a high-priority upgrade.

## OUTPUT FORMAT

```
RUBY / RAILS COMPLIANCE AUDIT - COMPLETE REPORT
=============================================

OVERALL SCORE: XX/100

COMPLIANCE LEVEL: [Excellent/Very Good/Acceptable/Insufficient/Critical]

Ruby: X.Y.Z   Rails: X.Y.Z   Test framework: [RSpec/Minitest]

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
  • Rails conventions / layout    : XX/5
  • Thin controllers              : XX/6
  • Model design / extraction     : XX/6
  • Data layer                    : XX/4
  • Jobs, cache, realtime         : XX/2
  • Autoloading / dependencies    : XX/2

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
major weaknesses, version health (Ruby/Rails support status), and
recommended trajectory. Say whether the project is production-ready,
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
- Rails Way first: do not penalize a project for lacking hexagonal layering
- Propose automatable corrections (`bin/ci`, pre-commit hooks, GitHub Actions)
- Report must be actionable, not just descriptive
- Adapt recommendations to project business context
