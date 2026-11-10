# Pre-Commit Checklist - WordPress

## Quick Validation Before Each Commit

All commands run in Docker (`docker compose exec app ...`); suites that need WordPress loaded run in the `wp-env` containers (`npx wp-env run tests-cli ...`). Keep one script or `make ci` target that chains the steps below so the local gate equals the CI gate.

### Code Quality (PHP)

- [ ] WordPress Coding Standards pass (`vendor/bin/phpcs`), auto-fix with `vendor/bin/phpcbf`
- [ ] PHPStan passes at the project level (`vendor/bin/phpstan analyse`), baseline not grown
- [ ] New `phpcs:ignore` comments name the sniff, are one line and carry a reason
- [ ] No `var_dump`, `print_r`, `error_log`, `die()` or commented-out code left behind
- [ ] Every new global has the project prefix or namespace; every new PHP file has `defined( 'ABSPATH' ) || exit;` when directly reachable
- [ ] Code does not use syntax newer than the declared `Requires PHP`
- [ ] Methods < 10 lines (limit 20), nesting <= 3, parameters <= 4

### Code Quality (JavaScript / Blocks)

- [ ] `npx wp-scripts lint-js` and `lint-style` pass with zero warnings
- [ ] `npx wp-scripts format --check` passes
- [ ] `build/` regenerated (`npx wp-scripts build --blocks-manifest`) when block sources changed, if `build/` is committed
- [ ] Block markup changes include a `deprecated` entry and a fixture
- [ ] Strings use `__()` from `@wordpress/i18n` with the plugin text domain

### Tests

- [ ] PHPUnit passes (`npx wp-env run tests-cli --env-cwd=wp-content/plugins/<slug> vendor/bin/phpunit`)
- [ ] Jest passes (`npx wp-scripts test-unit-js`)
- [ ] New behavior has tests written first (Red, Green, Refactor)
- [ ] New handlers and routes have denied-path tests (logged out, wrong role, bad nonce, invalid input)
- [ ] Bug fixes include a regression test that failed before the fix
- [ ] Coverage maintained at 80% or higher
- [ ] No `markTestSkipped`, `test.skip` or `test.only` added without a ticket

### Security

- [ ] Every state-changing handler checks `current_user_can()` with a specific capability and verifies a nonce
- [ ] Every REST route has a `permission_callback`; writes never use `__return_true`
- [ ] Superglobals read with existence check, `wp_unslash()` and a sanitizer
- [ ] All output escaped late (`esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`)
- [ ] All SQL with variables uses `$wpdb->prepare()`
- [ ] No `unserialize()` on user data, no `eval`, no dynamic `include`
- [ ] No secrets, keys or `.env` staged
- [ ] `composer audit` and `npm audit --omit=dev --audit-level=moderate` pass

### Internationalization and Assets

- [ ] New user-facing strings are translatable with a literal text domain
- [ ] Scripts and styles enqueued with `*.asset.php` dependencies and version; no inline tags
- [ ] `.pot` regenerated if strings changed (`wp i18n make-pot`) when the project commits it

### Release Metadata

- [ ] Plugin header, `readme.txt` (`Stable tag`, `Tested up to`, `Requires at least`, `Requires PHP`) and `package.json` versions consistent when releasing
- [ ] Plugin Check has no errors on the built ZIP when releasing
- [ ] `uninstall.php` updated when new options, tables, cron events or roles are added

### Documentation and Git

- [ ] README / readme.txt / docs updated when features, hooks or settings changed
- [ ] CHANGELOG updated if applicable
- [ ] Commit message follows Conventional Commits (`feat(blocks): add report block`)
- [ ] Commit is atomic; branch up to date with `main`
- [ ] No unrelated files staged (`git status`, `git diff --staged`)

### If the project depends on WooCommerce

If the project depends on WooCommerce (plugin header `Requires Plugins: woocommerce`, `wc_*` calls, `before_woocommerce_init` hook), also apply `.claude/skills/woocommerce/checklist.md`.

## Automated Validation

### CI gate script

```bash
#!/usr/bin/env bash
# scripts/ci.sh - same steps locally and in CI
set -euo pipefail

vendor/bin/phpcs
vendor/bin/phpstan analyse --memory-limit=1G
npx wp-scripts lint-js
npx wp-scripts lint-style
npx wp-scripts test-unit-js
npx wp-env start
npx wp-env run tests-cli --env-cwd=wp-content/plugins/my-plugin vendor/bin/phpunit
composer audit
npm audit --omit=dev --audit-level=moderate
```

### Git pre-commit hook (Lefthook)

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    phpcs:
      glob: "*.php"
      run: docker compose exec -T app vendor/bin/phpcs {staged_files}
    js:
      glob: "*.{js,jsx,ts,tsx}"
      run: docker compose exec -T app npx wp-scripts lint-js {staged_files}
pre-push:
  commands:
    phpstan:
      run: docker compose exec -T app vendor/bin/phpstan analyse --memory-limit=1G
    tests:
      run: docker compose exec -T app sh -c 'npx wp-scripts test-unit-js && npx wp-env run tests-cli --env-cwd=wp-content/plugins/my-plugin vendor/bin/phpunit'
```

Hooks are requirements, CLAUDE.md is a suggestion.

## Quick Commands

```bash
docker compose exec app vendor/bin/phpcbf
docker compose exec app vendor/bin/phpcs
docker compose exec app vendor/bin/phpstan analyse
docker compose exec app npx wp-scripts lint-js --fix
docker compose exec app npx wp-env run tests-cli --env-cwd=wp-content/plugins/my-plugin vendor/bin/phpunit
```

## Final Check

If any box is unchecked, do not commit. Fix first, then re-run `./scripts/ci.sh`.
