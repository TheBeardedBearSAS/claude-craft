# Check WordPress Testing

## Arguments

$ARGUMENTS (optional: path to the plugin or theme to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans PHP, block JavaScript and end-to-end suites, or requires cross-cutting investigation.

## MISSION

Audit the test strategy of a WordPress plugin or block theme. Three test surfaces: PHP integration/unit tests (PHPUnit with `WP_UnitTestCase` running inside `wp-env`, `yoast/phpunit-polyfills` 4.0.0 for cross-version compatibility), JavaScript unit tests (`wp-scripts test-unit-js`, Jest) and end-to-end tests (Playwright with `@wordpress/e2e-test-utils-playwright`). TDD (Red, Green, Refactor) and 80% minimum coverage apply, with the pyramid 70% unit / 20% integration / 10% E2E. Pure PHP logic is kept free of WordPress calls so it can be unit-tested without loading WordPress.

All commands run in Docker. WordPress-dependent suites run inside the `wp-env` containers (`npx wp-env run tests-cli ...`); `wp-env` itself uses Docker.

### Step 1: Run the Suites

```bash
docker compose exec app npx wp-env start
docker compose exec app npx wp-env run tests-cli --env-cwd=wp-content/plugins/<plugin-slug> vendor/bin/phpunit
docker compose exec app npx wp-scripts test-unit-js --coverage
docker compose exec app npx playwright test
```

Record: number of tests per suite, failures, skipped tests, flaky tests, duration. A failing suite caps the axis at 50%.

### Step 2: Code Coverage (5 points)

```bash
docker compose exec app npx wp-env run tests-cli --env-cwd=wp-content/plugins/<plugin-slug> env XDEBUG_MODE=coverage vendor/bin/phpunit --coverage-text
docker compose exec app npx wp-scripts test-unit-js --coverage --coverageReporters=text-summary
```

Checklist:
- [ ] PHP coverage >= 80% on `src/` (a coverage driver such as Xdebug or PCOV is available in the test container)
- [ ] JavaScript coverage >= 80% on block and editor code
- [ ] Critical paths (capability checks, nonce verification, sanitization, REST permission callbacks, uninstall) are at 100%
- [ ] Mutation testing (Infection for PHP, Stryker for JS) is considered for critical logic: a high line coverage with weak assertions is a false sense of safety

**Scoring**: 5 pts (2 PHP, 2 JS, 1 critical paths). Mark JS N/A when the project has no JavaScript.

### Step 3: PHP Integration and Unit Tests (7 points)

```bash
docker compose exec app cat phpunit.xml.dist tests/bootstrap.php
docker compose exec app grep -rnE 'extends (WP_UnitTestCase|WP_UnitTestCase_Base|WP_Ajax_UnitTestCase|WP_REST_TestCase|PHPUnit.*TestCase)' tests
docker compose exec app grep -rnE 'static::factory|[$]this->factory|set_up|tear_down|setUp|tearDown' tests
docker compose exec app grep -nE 'yoast/phpunit-polyfills|phpunit/phpunit|wp-phpunit' composer.json
docker compose exec app cat .wp-env.json
```

Checklist:
- [ ] `phpunit.xml.dist` and a `tests/bootstrap.php` that loads the WordPress test suite (`WP_TESTS_DIR`, `tests_add_filter( 'muplugins_loaded', ... )` to load the plugin); `wp-env` provides the test environment; `yoast/phpunit-polyfills` is in `require-dev` and `WP_TESTS_PHPUNIT_POLYFILLS_PATH` is set
- [ ] Integration tests extend `WP_UnitTestCase`, use factories (`self::factory()->post->create()`, `user`, `term`) instead of hand-written SQL, and rely on its per-test transaction rollback; fixtures are created in `set_up()` and cleaned in `tear_down()` (calling the parent first)
- [ ] REST tests dispatch `new WP_REST_Request(...)` through `rest_do_request()` after `wp_set_current_user()` with roles for allowed and denied cases (401/403), validation failures (400) and success
- [ ] Hooks are asserted through behavior (`did_action()`, `has_filter()`, the resulting state), not through private calls; filters and actions registered by the test are removed
- [ ] Authorization and nonce tests exist for every state-changing handler (logged-out, wrong role, bad nonce, valid)
- [ ] Pure logic classes have fast unit tests with no WordPress load (Brain Monkey or Mockery for the few WordPress functions needed), so the unit suite runs in seconds
- [ ] Tests are deterministic: no dependence on the real clock, on remote HTTP (mock with `pre_http_request`), on global option leakage between tests, or on test order
- [ ] The CI matrix covers the supported range: the minimum and the latest PHP version declared (7.4 floor, 8.3+ recommended) and WordPress minimum, latest and trunk where feasible; multisite is run when the plugin supports it (`WP_TESTS_MULTISITE` / `@group ms-required`)

**Scoring**: 7 pts (2 environment and bootstrap, 2 integration quality, 1 REST/authorization, 1 pure unit tests, 1 CI matrix).

### Step 4: JavaScript / Block Tests (4 points)

```bash
docker compose exec app grep -rnE '"test:unit"|"test:e2e"|test-unit-js|wp-scripts' package.json
docker compose exec app find src -name '*.test.*' -o -name '__tests__' -type d
docker compose exec app grep -rnE '@testing-library|jest-dom|@wordpress/jest' package.json
```

Checklist:
- [ ] `npm run test:unit` maps to `wp-scripts test-unit-js` and runs in CI; test files live next to the code or in `__tests__/`
- [ ] Block `edit` / `save` and utility functions are tested with Testing Library semantics (roles, text), not implementation details; `save()` output is asserted so deprecations are not forgotten when markup changes
- [ ] Stores (`@wordpress/data`) and Interactivity API stores have tests for actions, selectors and state transitions
- [ ] Block fixtures cover deprecated markup so saved content keeps validating
- [ ] Snapshot tests are small and reviewed, not used to bless entire trees

**Scoring**: 4 pts (1 setup and CI, 1 component tests, 1 stores, 1 deprecations and fixtures). Mark N/A when no JavaScript exists and rescale.

### Step 5: End-to-End Tests (5 points)

```bash
docker compose exec app cat playwright.config.ts
docker compose exec app grep -rnE '@wordpress/e2e-test-utils-playwright|requestUtils|admin\.|editor\.|pageUtils' tests/e2e
docker compose exec app grep -rnE 'waitForTimeout|sleep\(|test\.(skip|only)' tests/e2e
docker compose exec app grep -nE 'test:e2e|playwright' package.json .github/workflows/*.yml
```

Checklist:
- [ ] Playwright with `@wordpress/e2e-test-utils-playwright` (`test`, `expect`, `admin`, `editor`, `pageUtils`, `requestUtils`) against the `wp-env` test site; a global setup authenticates once and stores the state
- [ ] Critical user journeys are covered: plugin activation, settings page save, inserting and configuring each block in the editor, front-end rendering of dynamic blocks, and (for block themes) Site Editor template edits
- [ ] Locators use roles, labels and test ids; no `waitForTimeout` or arbitrary sleeps; no `test.only` committed, and each `test.skip` has a ticket
- [ ] Tests create their own content through `requestUtils` (REST) and clean up (`deleteAllPosts()` and similar) so they are independent and repeatable
- [ ] E2E runs on pull requests with traces/screenshots/videos retained on failure; flakes are tracked and fixed, not retried indefinitely
- [ ] Accessibility checks (axe via `@axe-core/playwright`) run on key screens when the project ships UI

**Scoring**: 5 pts (1 setup, 2 journeys, 1 reliability, 1 CI and artifacts).

### Step 6: Isolation, Speed and Structure (4 points)

```bash
docker compose exec app ls tests tests/php tests/unit tests/integration tests/e2e
docker compose exec app grep -rnE '@group|@covers|@dataProvider|#\[Group|#\[CoversClass|#\[DataProvider' tests
docker compose exec app grep -rnE 'markTestSkipped|markTestIncomplete|@ignore' tests
```

Checklist:
- [ ] Unit, integration and E2E suites are separated (`testsuite` entries in `phpunit.xml.dist`, separate npm scripts) so the fast suite runs on every commit and the slow ones on every PR
- [ ] Tests follow Arrange-Act-Assert with names describing behavior (`test_rest_route_rejects_subscriber`); data providers for input matrices
- [ ] No test depends on network access, the production database or a fixed absolute URL
- [ ] Skipped or incomplete tests have a ticket; `@covers` / `#[CoversClass]` targets are declared when strict coverage is enabled
- [ ] Bug fixes ship with a regression test that failed before the fix

**Scoring**: 4 pts (1 per checklist family).

### Step 7: WooCommerce Extension (conditional, not scored here)

If the project depends on WooCommerce (plugin header `Requires Plugins: woocommerce`, `wc_*` calls, `before_woocommerce_init` hook), also apply `.claude/skills/woocommerce/checklist.md` and report its findings in a separate section.

## OUTPUT FORMAT

```
WORDPRESS TESTING AUDIT
=======================

SCORE: XX/25

WordPress: X.Y   PHP: X.Y   PHPUnit tests: N   Jest tests: N   E2E tests: N   Coverage: PHP XX% / JS XX%

SUB-SCORES:
  Coverage                           : XX/5
  PHP integration and unit tests     : XX/7
  JavaScript / block tests           : XX/4
  End-to-end tests                   : XX/5
  Isolation, speed, structure        : XX/4

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

- A missing authorization or nonce test for a state-changing handler is a critical finding
- Findings must cite `file:line` and propose a concrete test to add (given/when/then)
- Do not recommend heavy mocking of WordPress when `WP_UnitTestCase` with factories gives a faithful, fast integration test
- Generic PHP testing practice belongs to the `php` stack; hosting and deployment pipelines are out of scope
