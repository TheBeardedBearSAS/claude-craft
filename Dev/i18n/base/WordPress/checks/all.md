# Check Complete WordPress Compliance

## Arguments

$ARGUMENTS (optional: path to the plugin or theme to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans PHP, block JavaScript and theme configuration, or requires cross-cutting investigation.

## MISSION

Perform a complete compliance audit of the WordPress plugin or block theme (WordPress 7.1 line; PHP 7.4 minimum, 8.3+ recommended) by orchestrating the 4 major checks: Architecture, Code Quality, Tests, and Security. Produce a consolidated report with an overall score out of 100 points. Out of scope: Bedrock, hosting and multi-environment deployment, generic PHP design (see the `php` stack), frontend frameworks outside the block editor.

### Step 1: Audit Preparation

Prepare audit environment:
- [ ] Identify project path to audit
- [ ] Verify presence of configuration files (main plugin file header, `composer.json`, `package.json`, `.wp-env.json`, `.phpcs.xml.dist`, `phpstan.neon.dist`, `phpunit.xml.dist`, `readme.txt`, `theme.json`, `block.json`, `playwright.config.ts`)
- [ ] List main directories (`src/`, `includes/`, `build/`, `blocks/`, `templates/`, `parts/`, `patterns/`, `tests/`, `languages/`)
- [ ] Identify WordPress minimum and tested versions, PHP minimum, project type (plugin, block theme, both), block count, and whether WooCommerce is a dependency

```bash
docker compose exec app sh -c 'head -40 *.php | grep -nE "Plugin Name|Version|Requires at least|Requires PHP|Requires Plugins|Text Domain"'
docker compose exec app cat .wp-env.json
docker compose exec app grep -nE '"(wordpress|php)"|"require(-dev)?"|szepeviktor|wp-coding-standards|phpunit-polyfills' composer.json
docker compose exec app grep -nE '@wordpress/(scripts|env|create-block|e2e-test-utils-playwright)|@playwright/test' package.json
```

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: Architecture Audit (25 points)

Execute architecture check: `/wordpress:check architecture` or follow `.claude/references/wordpress/checks/architecture.md`

**Evaluated Criteria**:
- Plugin/theme layout and bootstrap (5 pts)
- Hooks and separation of concerns (6 pts)
- Blocks, themes and the Interactivity API (5 pts)
- REST API, settings and data (4 pts)
- i18n, assets and compatibility (5 pts)

**Reference**: `.claude/references/wordpress/checks/architecture.md`

### Step 3: Code Quality Audit (25 points)

Execute code quality check: `/wordpress:check code-quality` or follow `.claude/references/wordpress/checks/code-quality.md`

**Evaluated Criteria**:
- PHP standards (PHPCS WordPress) and static analysis (PHPStan with phpstan-wordpress) (7 pts)
- JavaScript and block editor code (`@wordpress/scripts`, ESLint) (5 pts)
- WordPress API usage and performance (queries, options, caching) (5 pts)
- KISS/DRY/YAGNI and complexity (3 pts)
- Error handling, documentation and release hygiene (Plugin Check, readme) (5 pts)

**Reference**: `.claude/references/wordpress/checks/code-quality.md`

### Step 4: Testing Audit (25 points)

Execute testing check: `/wordpress:check testing` or follow `.claude/references/wordpress/checks/testing.md`

**Evaluated Criteria**:
- Code coverage, 80% minimum (5 pts)
- PHP integration and unit tests (`WP_UnitTestCase`, wp-env) (7 pts)
- JavaScript and block tests (4 pts)
- End-to-end tests (Playwright) (5 pts)
- Isolation, speed and structure (4 pts)

**Reference**: `.claude/references/wordpress/checks/testing.md`

### Step 5: Security Audit (25 points)

Execute security check: `/wordpress:check security` or follow `.claude/references/wordpress/checks/security.md`

**Evaluated Criteria**:
- Authorization and nonces (7 pts)
- Sanitization and escaping (7 pts)
- Database and injection (4 pts)
- REST, AJAX and outbound requests (3 pts)
- Files, secrets and supply chain (4 pts)

**Reference**: `.claude/references/wordpress/checks/security.md`

### Step 6: WooCommerce Extension (conditional, not scored here)

If the project depends on WooCommerce (plugin header `Requires Plugins: woocommerce`, `wc_*` calls, `before_woocommerce_init` hook), also apply `.claude/skills/woocommerce/checklist.md` and report its findings in a separate section after the scored report.

### Step 7: Consolidation and Global Scoring

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

### Step 8: Recommendations and Action Plan

- [ ] Identify top 3 priority actions across all categories
- [ ] Estimate effort (Low/Medium/High) and impact (Low/Medium/High) for each
- [ ] Propose implementation order
- [ ] Suggest quick wins (high impact/effort ratio)

**Version health** (reported in the executive summary, not scored):
- WordPress 7.1 is the reference line; flag a `Tested up to` that lags the current release, and a `Requires at least` far below the APIs actually used.
- PHP: 7.4 is the WordPress minimum, 8.3+ is recommended; flag a plugin that raises its floor without updating `Requires PHP` and `composer.json`.
- Tooling references: `@wordpress/scripts` 37, `@wordpress/env` 12, WPCS 3.4, `szepeviktor/phpstan-wordpress` 2.0, `yoast/phpunit-polyfills` 4.0, Playwright 1.65; flag major versions behind.
- Report the release readiness: Plugin Check result, `readme.txt` consistency, translation readiness.

## OUTPUT FORMAT

```
WORDPRESS COMPLIANCE AUDIT - COMPLETE REPORT
============================================

OVERALL SCORE: XX/100

COMPLIANCE LEVEL: [Excellent/Very Good/Acceptable/Insufficient/Critical]

WordPress: X.Y   PHP: X.Y   Type: [plugin/block theme/both]   WooCommerce: [yes/no]   E2E: [playwright/none]

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
  • Layout and bootstrap                : XX/5
  • Hooks and separation of concerns    : XX/6
  • Blocks, themes, Interactivity API   : XX/5
  • REST, settings and data             : XX/4
  • i18n, assets and compatibility      : XX/5

Strengths:
- [Architecture strengths]

Issues:
- [Architecture issues]

[Similar sections for Code Quality, Tests, and Security...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WOOCOMMERCE EXTENSION (only if applicable, not scored):
- [Findings from .claude/skills/woocommerce/checklist.md]

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
major weaknesses, version health (WordPress, PHP, tooling),
release readiness (Plugin Check, readme, translations), and
recommended trajectory. Say whether the project is
production-ready, requires corrections, or needs refactoring.]

General Recommendation: [Production-ready / Minor corrections /
Major refactoring / Overhaul necessary]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## IMPORTANT NOTES

- This command orchestrates the 4 specialized audits
- Use Docker for all analysis tools (`docker compose exec app ...`, `npx wp-env run ...` for suites that need WordPress loaded)
- Provide concrete examples with file:line for each problem
- Prioritize actions based on Impact/Effort matrix
- Security problems are ALWAYS top priority; missing capability checks, injectable queries and unauthenticated write routes are release blockers
- Generic PHP concerns are delegated to the `php` stack; frontend frameworks outside the block editor to their own stacks
- Propose automatable corrections (CI workflow with PHPCS, PHPStan, Plugin Check, wp-env tests; pre-commit hooks)
- Report must be actionable, not just descriptive
- Adapt recommendations to project business context
