# WordPress Testing

> Scope: tests for plugins and block themes (WordPress 7.1 line, PHP 7.4 minimum, 8.3+ recommended). TDD (Red, Green, Refactor) and 80% minimum coverage apply; pyramid 70% unit / 20% integration / 10% E2E. Generic PHP testing follows the `php` stack.

## Test Surfaces

| Surface | Tooling | Runs in |
|---------|---------|---------|
| Pure PHP logic | PHPUnit, optionally Brain Monkey or Mockery for a few WordPress functions | Plain PHP container, no WordPress |
| WordPress integration | PHPUnit + `WP_UnitTestCase`, `yoast/phpunit-polyfills` 4.0.0 | `wp-env` tests site (`tests-cli`) |
| JavaScript / blocks | Jest through `wp-scripts test-unit-js` | Node container |
| End-to-end | Playwright 1.65.0 + `@wordpress/e2e-test-utils-playwright` 3.2.0 | Against the `wp-env` tests site |

Keep domain logic free of WordPress calls so most tests are fast unit tests; use integration tests for hooks, REST routes, database access, capabilities and rendering.

## PHPUnit Setup

`composer.json`: `phpunit/phpunit` (the major supported by the WordPress test suite you target) and `yoast/phpunit-polyfills` in `require-dev`. `phpunit.xml.dist` defines separate test suites.

```xml
<phpunit bootstrap="tests/bootstrap.php" colors="true">
  <testsuites>
    <testsuite name="unit"><directory>tests/php/unit</directory></testsuite>
    <testsuite name="integration"><directory>tests/php/integration</directory></testsuite>
  </testsuites>
</phpunit>
```

```php
<?php
// tests/bootstrap.php
$_tests_dir = getenv( 'WP_TESTS_DIR' ) ?: '/wordpress-phpunit';

require_once $_tests_dir . '/includes/functions.php';

tests_add_filter(
	'muplugins_loaded',
	static function () {
		require dirname( __DIR__ ) . '/my-plugin.php';
	}
);

require $_tests_dir . '/includes/bootstrap.php';
```

Inside `wp-env`, `WP_TESTS_DIR` and the polyfills path are provided by the tests container; set `WP_TESTS_PHPUNIT_POLYFILLS_PATH` when your setup requires it. Run:

```bash
npx wp-env run tests-cli --env-cwd=wp-content/plugins/my-plugin vendor/bin/phpunit --testsuite integration
```

## WP_UnitTestCase Patterns

```php
class Report_Rest_Test extends WP_UnitTestCase {

	public function set_up(): void {
		parent::set_up();
		do_action( 'rest_api_init' );
	}

	public function test_create_report_rejects_subscriber(): void {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'subscriber' ) ) );

		$request  = new WP_REST_Request( 'POST', '/acme/v1/reports' );
		$request->set_body_params( array( 'title' => 'Q4' ) );
		$response = rest_do_request( $request );

		$this->assertSame( 403, $response->get_status() );
	}

	public function test_create_report_sanitizes_title(): void {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );

		$request = new WP_REST_Request( 'POST', '/acme/v1/reports' );
		$request->set_body_params( array( 'title' => '<script>x</script>Q4' ) );
		$response = rest_do_request( $request );

		$this->assertSame( 201, $response->get_status() );
		$this->assertSame( 'Q4', $response->get_data()['title'] );
	}
}
```

- Name the hooks `set_up()` / `tear_down()` (the polyfills make them available on every PHPUnit version); call `parent::` first
- `WP_UnitTestCase` wraps each test in a database transaction and restores globals; create data with `self::factory()->post|user|term|attachment|comment->create()`
- Always test denied paths: logged-out, wrong role, missing or invalid nonce, invalid arguments, then the success path
- Assert behavior through state (`get_post_meta`, `get_option`, `did_action`, `has_filter`), not through private calls
- Mock remote HTTP with the `pre_http_request` filter; control time through injected clocks or `current_time` filters; never depend on the network
- For AJAX handlers use `WP_Ajax_UnitTestCase`; for multisite tests use the `ms-required` group and run with `WP_TESTS_MULTISITE`/a multisite `wp-env`
- Test activation and uninstall: create state, run the routine, assert it is cleaned up

## Block and JavaScript Tests

- Name files `*.test.js` / `*.test.ts(x)` next to the code or in `__tests__/`; run with `wp-scripts test-unit-js` (Jest with the WordPress preset)
- Use Testing Library queries by role and text for `edit` components; assert `save()` output so changes to markup trigger a `deprecated` entry
- Keep fixtures of previously saved markup to make sure old content still validates
- Test `@wordpress/data` stores (actions, reducers, selectors) and Interactivity API stores (actions and derived state) as plain functions

## End-to-End (Playwright)

```ts
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Report block', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'inserts and renders on the front end', async ( { editor, page } ) => {
		await editor.insertBlock( { name: 'acme/report' } );
		const preview = await editor.openPreviewPage();
		await expect( preview.getByRole( 'region', { name: 'Report' } ) ).toBeVisible();
	} );
} );
```

- Use the fixtures `admin`, `editor`, `pageUtils`, `requestUtils`, and a global setup that authenticates once (`requestUtils` creates sessions and content through REST)
- Create the content each test needs and delete it afterward; tests must not depend on order or on leftovers
- Locators by role, label or test id; no `waitForTimeout`; retries only in CI with traces, screenshots and videos kept on failure
- Add accessibility checks with `@axe-core/playwright` on key screens
- Cover the critical journeys: activation, settings save, block insertion and configuration, front-end rendering, and Site Editor flows for block themes

## Coverage and CI

- Coverage >= 80% on `src/` for PHP (Xdebug or PCOV in the test container) and JavaScript (`--coverage`), 100% on authorization, nonce, sanitization and uninstall paths
- Mutation testing (Infection for PHP, Stryker for JS) on critical logic: coverage lies, mutation scores tell the truth
- CI matrix: minimum and latest PHP (7.4 and the 8.3+ line), minimum, latest and optionally trunk WordPress, plus multisite when supported
- Fast gate on every commit (unit suites, lint); integration and E2E on every pull request

## Anti-Patterns

| Anti-pattern | Fix |
|--------------|-----|
| Tests that hit the network or the real clock | `pre_http_request`, injected clock |
| Asserting private methods or hook internals | Assert resulting state and public hooks |
| State leaking through options, globals or the current user | `tear_down()` cleanup, `wp_set_current_user( 0 )` |
| Only happy-path REST tests | Add 401/403/400 cases |
| `test.only`, `markTestSkipped` without ticket | Fix or remove |
| `waitForTimeout` in Playwright | Web-first assertions |
| Mocking WordPress extensively when an integration test is cheap | `WP_UnitTestCase` with factories |

## Sources

- https://make.wordpress.org/core/handbook/testing/automated-testing/phpunit/
- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/
- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/#test-unit-js
- https://github.com/WordPress/gutenberg/tree/trunk/packages/e2e-test-utils-playwright
- https://github.com/Yoast/PHPUnit-Polyfills
- https://playwright.dev/docs/best-practices
