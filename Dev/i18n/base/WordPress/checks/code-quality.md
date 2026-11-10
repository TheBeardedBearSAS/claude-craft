# Check WordPress Code Quality

## Arguments

$ARGUMENTS (optional: path to the plugin or theme to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans several plugins/themes, or mixes PHP and block JavaScript.

## MISSION

Audit the code quality of a WordPress plugin or block theme (WordPress 7.1 line; PHP 7.4 minimum, 8.3+ recommended). The quality gate is: **WordPress Coding Standards through PHPCS, static analysis with PHPStan (szepeviktor/phpstan-wordpress), the `@wordpress/eslint-plugin` ruleset for JavaScript, and Plugin Check for repository-level rules**. KISS / DRY / YAGNI and SOLID apply (cognitive complexity < 10, methods < 20 lines). Generic PHP style belongs to the `php` stack; this check covers the WordPress-specific parts.

All commands run in Docker (`docker compose exec app ...`).

### Step 1: PHP Standards and Static Analysis (7 points)

```bash
docker compose exec app composer validate --strict
docker compose exec app vendor/bin/phpcs --standard=WordPress -s --report=summary
docker compose exec app vendor/bin/phpcs -i
docker compose exec app vendor/bin/phpstan analyse --memory-limit=1G
docker compose exec app grep -nE 'level|phpstan-wordpress|bootstrapFiles|stubFiles' phpstan.neon phpstan.neon.dist
docker compose exec app cat .phpcs.xml.dist phpcs.xml.dist
```

Checklist:
- [ ] A committed `.phpcs.xml.dist` uses `WordPress` (or `WordPress-Core` + `WordPress-Extra` + `WordPress-Docs`), sets `minimum_wp_version`, `testVersion` (PHPCompatibilityWP) matching `Requires PHP`, `text_domain` and `prefixes` so i18n and prefix sniffs are enforced
- [ ] `phpcs` passes with zero errors; warnings are triaged; `phpcs:ignore` / `phpcs:disable` comments carry a reason and are scoped to one line
- [ ] PHPStan runs with `szepeviktor/phpstan-wordpress` (and `php-stubs/wordpress-stubs`), at level 6 minimum and a documented target of 8 or higher; the baseline, if any, only shrinks
- [ ] WordPress functions are typed through stubs, not suppressed with `@phpstan-ignore` wholesale; `mixed` from `get_option()` / `get_post_meta()` is narrowed before use
- [ ] Code matches the declared `Requires PHP`: no syntax newer than the minimum (union types, `match`, enums, readonly) unless the minimum is raised in the header and `composer.json`
- [ ] Short array syntax and `declare( strict_types=1 )` only where the project standard says so (WPCS itself allows both); consistency matters more than the choice
- [ ] No `eval`, `create_function`, `extract()`, `compact()` on user data, `@` error suppression, `error_reporting()` or `ini_set()` at runtime
- [ ] No `var_dump`, `print_r`, `error_log` debugging calls or `die()` left in production paths; logging goes through a guarded logger and respects `WP_DEBUG_LOG`

**Scoring**: 7 pts (2 PHPCS config and result, 2 PHPStan, 1 PHP compatibility, 2 forbidden constructs and debug leftovers).

### Step 2: JavaScript / Block Editor Code (5 points)

```bash
docker compose exec app npx wp-scripts lint-js
docker compose exec app npx wp-scripts lint-style
docker compose exec app npx wp-scripts format --check
docker compose exec app npx tsc --noEmit
docker compose exec app grep -rnE '@wordpress/eslint-plugin|wp-scripts' package.json .eslintrc* eslint.config.*
docker compose exec app grep -rnE 'jQuery|[$][(]' src --include=*.js --include=*.jsx --include=*.ts --include=*.tsx
```

Checklist:
- [ ] `@wordpress/scripts` drives build, lint and test (`wp-scripts build`, `start`, `lint-js`, `lint-style`, `test-unit-js`); no ad-hoc webpack config unless justified
- [ ] ESLint uses the `@wordpress/eslint-plugin` recommended config; zero errors and warnings in CI
- [ ] Editor code uses `@wordpress/*` packages (`@wordpress/element`, `@wordpress/components`, `@wordpress/data`, `@wordpress/block-editor`, `@wordpress/i18n`) as externals, not bundled copies of React or lodash
- [ ] Components are functional with hooks; `useBlockProps()` / `useBlockProps.save()` used on block roots; `edit` and `save` are pure with no side effects at render
- [ ] Strings in JS go through `__()` from `@wordpress/i18n` with the plugin text domain
- [ ] No jQuery in new editor or front-end code; the Interactivity API is used for front-end interactivity
- [ ] Optional TypeScript: strict mode with `@wordpress/*` types; no `any` on block attributes

**Scoring**: 5 pts (2 lint and format, 1 package usage and externals, 1 component hygiene, 1 i18n and no jQuery). Mark N/A when no JavaScript exists and rescale.

### Step 3: WordPress API Usage and Performance (5 points)

```bash
docker compose exec app grep -rnE 'posts_per_page.*-1|numberposts.*-1|nopaging' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'meta_query|meta_key|orderby.*meta_value' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'new WP_Query|get_posts\(|query_posts\(' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'update_option|add_option' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'wp_remote_(get|post)|sleep\(|file_get_contents' --include=*.php . --exclude-dir=vendor
```

Checklist:
- [ ] No unbounded queries: `posts_per_page => -1` is replaced by pagination or a bounded number; `no_found_rows => true` when the total is not needed; `fields => 'ids'` when only ids are used; `update_post_meta_cache` / `update_post_term_cache` set to false when unused
- [ ] `meta_query` and `meta_value` ordering are avoided on large sites (unindexed `wp_postmeta`); prefer taxonomies, a custom table or a precomputed field for filterable data
- [ ] `query_posts()` is never used; secondary loops use `WP_Query` or `get_posts()` and call `wp_reset_postdata()`; the main query is altered with `pre_get_posts`
- [ ] No queries inside loops (N+1): prime caches (`_prime_post_caches`, `update_meta_cache`) or batch with one query
- [ ] Options that are large or rarely used set `autoload` to `false` (`add_option( $name, $value, '', false )`, `update_option( $name, $value, false )`); no big arrays in autoloaded options
- [ ] Remote calls are cached (transients or object cache), have short timeouts, and never run on the front-end critical path without a cache
- [ ] Code that runs on every request (`init`, `wp_loaded`, `template_redirect`) stays cheap: no remote calls, no file scans, no unbounded database reads
- [ ] Cron jobs use `wp_schedule_event` / `wp_schedule_single_event` guarded by `wp_next_scheduled()` and are unscheduled on deactivation; long jobs are chunked (batch size, resumable)

**Scoring**: 5 pts, minus 1 per violation family (queries, meta, N+1, options, remote or cron), min 0.

### Step 4: KISS / DRY / YAGNI and Complexity (3 points)

```bash
docker compose exec app vendor/bin/phpcs --standard=Generic --sniffs=Generic.Metrics.CyclomaticComplexity,Generic.Metrics.NestingLevel --report=summary
docker compose exec app sh -c 'find . -name "*.php" -not -path "./vendor/*" -not -path "./node_modules/*" | xargs wc -l | sort -rn | head -10'
```

Checklist:
- [ ] Cognitive complexity < 10, cyclomatic complexity < 10, nesting <= 3, methods < 20 lines (target 10), at most 4 parameters
- [ ] Early returns and guard clauses; no `else` after `return`
- [ ] Rule of three before abstracting; no speculative interfaces, factories or settings
- [ ] No God classes (the main plugin class does not own settings, REST, admin UI and cron at once)
- [ ] No duplicated capability / nonce / sanitize snippets: shared helpers or request value objects

**Scoring**: 3 pts (1 complexity, 1 duplication, 1 YAGNI and class size).

### Step 5: Error Handling, Documentation and Release Hygiene (5 points)

```bash
docker compose exec app grep -rnE 'is_wp_error|new WP_Error|wp_die\(|trigger_error|_doing_it_wrong|_deprecated_' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -nE 'Stable tag|Tested up to|Requires at least|Requires PHP' readme.txt
docker compose exec app npx wp-env run cli wp plugin check <plugin-slug> --format=table
```

Checklist:
- [ ] Functions that can fail return `WP_Error` (or throw a typed exception caught at the hook boundary); callers use `is_wp_error()`; `wp_die()` is limited to admin form handlers
- [ ] Public hooks and functions have docblocks with `@since`, `@param`, `@return`; hooks are documented with `@param` descriptions for the hook arguments
- [ ] Deprecations use `_deprecated_function()` / `_deprecated_hook()`; misuse uses `_doing_it_wrong()`
- [ ] `readme.txt` (WordPress.org format) has `Stable tag`, `Tested up to`, `Requires at least`, `Requires PHP` consistent with the main plugin header; `CHANGELOG` is current
- [ ] Plugin Check (the `plugin-check` plugin or `wp plugin check`) reports no errors; the PCP ruleset is part of CI
- [ ] Version is bumped consistently (plugin header, constant, `package.json`, `readme.txt`)
- [ ] Build output (`build/`) is generated by CI or committed deliberately; `vendor/` and `node_modules/` are excluded from the distributed ZIP (`.distignore`)

**Scoring**: 5 pts (2 error handling, 1 documentation, 1 readme and versions, 1 Plugin Check and distribution).

### Step 6: WooCommerce Extension (conditional, not scored here)

If the project depends on WooCommerce (plugin header `Requires Plugins: woocommerce`, `wc_*` calls, `before_woocommerce_init` hook), also apply `.claude/skills/woocommerce/checklist.md` and report its findings in a separate section.

## OUTPUT FORMAT

```
WORDPRESS CODE QUALITY AUDIT
============================

SCORE: XX/25

WordPress: X.Y   PHP: X.Y   PHPCS errors: N   PHPStan level: N (errors: N)   ESLint problems: N   Plugin Check errors: N

SUB-SCORES:
  PHP standards and static analysis  : XX/7
  JavaScript / block editor          : XX/5
  WordPress API usage, performance   : XX/5
  KISS / DRY / YAGNI, complexity     : XX/3
  Errors, docs, release hygiene      : XX/5

STRENGTHS:
- [...]

ISSUES (by severity):
- CRITICAL: [file:line] [description] -> [fix]
- IMPORTANT: ...
- MINOR: ...

RECOMMENDATIONS:
1. [Action] (effort: Low/Medium/High, impact: Low/Medium/High)
2. ...
```

## IMPORTANT NOTES

- Findings must cite `file:line` and show the corrected snippet
- Prefer automatable fixes: `phpcbf` for style, a PHPStan baseline plan, a CI job running PHPCS, PHPStan, `wp-scripts lint-js` and Plugin Check
- Do not rewrite working code only to satisfy a stylistic sniff without a team decision; propose a ruleset exclusion with a reason instead
- Generic PHP design and PER-CS style belong to the `php` stack; hosting concerns are out of scope
