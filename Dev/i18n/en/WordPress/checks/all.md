# Check Complete WordPress Compliance

## Arguments

$ARGUMENTS (optional: path to plugin/theme to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Perform a complete compliance audit of the WordPress plugin or theme by orchestrating the 4 major checks: Architecture, Code Quality, Tests, and Security. Produce a consolidated report with an overall score out of 100 points.

### Step 1: Audit Preparation

Prepare audit environment:
- [ ] Identify project path to audit
- [ ] Verify presence of key files (plugin header file or `style.css`/`theme.json`, `composer.json`, `package.json`, `.wp-env.json`, `phpcs.xml*`, `phpstan.neon*`, `uninstall.php`, `block.json` files)
- [ ] List main directories (`src/` or `includes/`, `blocks/`, `languages/`, `tests/`, CI workflows)
- [ ] Identify declared `Requires at least`, `Requires PHP`, `Requires Plugins`, and the tooling versions in lockfiles
- [ ] Determine the type: plugin, classic theme, block theme, or mixed; note whether the project depends on WooCommerce

**Note**: If $ARGUMENTS provided, use it as project path, otherwise use current directory.

### Step 2: Architecture Audit (25 points)

**Command**: Use slash command `/wordpress:check architecture` or manually follow steps in `.claude/references/wordpress/checks/architecture.md`

**Evaluated Criteria**:
- Plugin header, bootstrap file, ABSPATH guard, Composer autoload (5 pts)
- Prefixing and namespaces for functions, classes, options, hooks, handles (5 pts)
- Hooks organization and thin callbacks (5 pts)
- Blocks (`block.json` apiVersion 3, `render.php`) and block theme structure (`theme.json`, templates, parts) (5 pts)
- REST design and lifecycle (activation, deactivation, uninstall) (5 pts)

**Reference**: `.claude/references/wordpress/checks/architecture.md`

### Step 3: Code Quality Audit (25 points)

**Command**: Use slash command `/wordpress:check code-quality` or manually follow steps in `.claude/references/wordpress/checks/code-quality.md`

**Evaluated Criteria**:
- WPCS (PHPCS) passes (7 pts)
- i18n: text domain, translator comments, JS translations (5 pts)
- PHPStan (phpstan-wordpress) and ESLint (`@wordpress/eslint-plugin`) (5 pts)
- KISS/DRY/YAGNI principles (4 pts)
- Function size and cognitive complexity (4 pts)

**Reference**: `.claude/references/wordpress/checks/code-quality.md`

### Step 4: Testing Audit (25 points)

**Command**: Use slash command `/wordpress:check testing` or manually follow steps in `.claude/references/wordpress/checks/testing.md`

**Evaluated Criteria**:
- Code coverage (target >= 80%) across PHP and JS (7 pts)
- PHPUnit with `WP_UnitTestCase` through wp-env, `yoast/phpunit-polyfills` (6 pts)
- Jest via `@wordpress/scripts` for blocks and JS (4 pts)
- Playwright end-to-end with `@wordpress/e2e-test-utils-playwright` (3 pts)
- Test quality: AAA, naming, no flakiness, CI execution (3 pts)
- Test isolation and use of factories (2 pts)

**Reference**: `.claude/references/wordpress/checks/testing.md`

### Step 5: Security Audit (25 points)

**Command**: Use slash command `/wordpress:check security` or manually follow steps in `.claude/references/wordpress/checks/security.md`

**Evaluated Criteria**:
- Capability checks and nonces on every state change (6 pts)
- REST `permission_callback` and argument validation (5 pts)
- Output escaping (`esc_*`, `wp_kses_post`) (5 pts)
- Input sanitization and `$wpdb->prepare()` (4 pts)
- Secrets and credentials management, OWASP Top 10:2025 protections (3 pts)
- Dependency vulnerabilities and supply chain (`composer audit`, `npm audit`) (2 pts)

**Reference**: `.claude/references/wordpress/checks/security.md`

### Step 6: WooCommerce (only if the project depends on it)

Apply `.claude/skills/woocommerce/checklist.md`: HPOS compatibility declared, `wc_get_order()` / CRUD objects instead of post meta, `cart_checkout_blocks` compatibility. Fold findings into the Architecture and Security scores; skip this step entirely for projects without WooCommerce.

### Step 7: Consolidation and Global Scoring

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

### Step 8: Recommendations and Action Plan

- [ ] Identify top 3 priority actions across all categories
- [ ] Estimate effort and impact (Low/Medium/High) for each
- [ ] Propose implementation order
- [ ] Suggest quick wins (high impact/effort ratio)

## OUTPUT FORMAT

```
WORDPRESS COMPLIANCE AUDIT - COMPLETE REPORT
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
  • Header / bootstrap / autoload  : XX/5
  • Prefixing / namespaces         : XX/5
  • Hooks organization             : XX/5
  • Blocks / theme structure       : XX/5
  • REST / lifecycle               : XX/5

Strengths:
- [Architecture strengths]

Issues:
- [Architecture issues]

[Similar sections for Code Quality, Tests, and Security...]

WOOCOMMERCE (if applicable): [HPOS / CRUD / checkout blocks findings]

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
major weaknesses, and recommended trajectory. Mention if the
project is production-ready, requires corrections, or needs refactoring.]

General Recommendation: [Production-ready / Minor corrections /
Major refactoring / Overhaul necessary]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## IMPORTANT NOTES

- This command orchestrates the 4 specialized audits
- Use Docker for all analysis tools (`docker compose exec app ...` or `npx wp-env run ...`)
- Provide concrete examples with file:line for each problem
- Prioritize actions based on Impact/Effort matrix
- Security problems are ALWAYS top priority
- Propose automatable corrections (scripts, pre-commit hooks, CI steps)
- Report must be actionable, not just descriptive
- Pragmatism first: do not penalize a small single-file plugin for lacking layers when responsibilities are separated
- Out of scope: generic PHP rules (see the `php` stack), hosting and Bedrock-style deployments, WordPress core development
