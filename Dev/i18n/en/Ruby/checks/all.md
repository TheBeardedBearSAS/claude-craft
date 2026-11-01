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
- [ ] Verify presence of configuration files (Gemfile, Gemfile.lock, .rubocop.yml, config/ci.rb, spec/ or test/)
- [ ] List main directories (app/, config/, db/, spec/ or test/, lib/)
- [ ] Identify Ruby version (`.ruby-version`) and Rails version (`Gemfile.lock`)

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: Architecture Audit (25 points)

Execute complete architecture check:

**Command**: Use slash command `/ruby:check architecture` or manually follow steps in `.claude/references/ruby/checks/architecture.md`

**Evaluated Criteria**:
- Rails conventions and `app/` layout (6 pts)
- Thin controllers and fat-model discipline (6 pts)
- Service, form and query objects where justified (4 pts)
- Active Record usage: associations, scopes, N+1 prevention (4 pts)
- Background jobs, caching and Hotwire usage (3 pts)
- Zeitwerk autoloading and dependency direction (2 pts)

**Reference**: `.claude/references/ruby/checks/architecture.md`

### Step 3: Code Quality Audit (25 points)

Execute code quality check:

**Command**: Use slash command `/ruby:check code-quality` or manually follow steps in `.claude/references/ruby/checks/code-quality.md`

**Evaluated Criteria**:
- RuboCop compliance (rubocop-rails-omakase or project config) (5 pts)
- Ruby style guide, naming and `# frozen_string_literal: true` (5 pts)
- Optional typing (RBS/Steep or Sorbet) and documentation (4 pts)
- KISS/DRY/YAGNI principles (4 pts)
- Method size and complexity (4 pts)
- Error handling (3 pts)

**Reference**: `.claude/references/ruby/checks/code-quality.md`

### Step 4: Testing Audit (25 points)

Execute testing check:

**Command**: Use slash command `/ruby:check testing` or manually follow steps in `.claude/references/ruby/checks/testing.md`

**Evaluated Criteria**:
- Code coverage (SimpleCov, target >= 80%) (7 pts)
- Model and service unit tests (6 pts)
- Request, job and system tests (Capybara) (4 pts)
- RSpec / Minitest quality (3 pts)
- Fixtures / FactoryBot data (3 pts)
- Test isolation and mocking (2 pts)

**Reference**: `.claude/references/ruby/checks/testing.md`

### Step 5: Security Audit (25 points)

Execute security check:

**Command**: Use slash command `/ruby:check security` or manually follow steps in `.claude/references/ruby/checks/security.md`

**Evaluated Criteria**:
- OWASP Top 10:2025 protections (6 pts)
- Secrets and credentials management (5 pts)
- Strong parameters, input validation and output escaping (4 pts)
- Dependency vulnerabilities (bundler-audit, Brakeman) (4 pts)
- Authentication, authorization and rate limiting (3 pts)
- Secure configuration (CSP, SSL, cookies) (2 pts)
- SQL injection prevention (1 pt)

**Reference**: `.claude/references/ruby/checks/security.md`

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
RUBY / RAILS COMPLIANCE AUDIT - COMPLETE REPORT
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
  • Rails conventions / app layout : XX/6
  • Thin controllers / models      : XX/6
  • Service, form, query objects   : XX/4
  • Active Record usage            : XX/4
  • Jobs, caching, Hotwire         : XX/3
  • Zeitwerk and dependencies      : XX/2

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
- Propose automatable corrections (scripts, pre-commit hooks, `bin/ci` steps)
- Report must be actionable, not just descriptive
- Adapt recommendations to project business context
- Rails Way first: do not penalize a project for lacking hexagonal layers when conventions are followed
