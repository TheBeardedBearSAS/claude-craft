# WordPress Tooling

> Scope: local environment, build, PHP and JS toolchain for plugins and block themes (WordPress 7.1 line). Hosting, Bedrock and deployment pipelines are out of scope. Always run tools in Docker; `wp-env` itself runs on Docker.

## Version Reference

| Component | Reference version | Notes |
|-----------|-------------------|-------|
| WordPress core | 7.1.4 (registry line 7.1) | Latest stable at the time of writing |
| PHP | 7.4 minimum, 8.3+ recommended | WordPress minimum and hosting recommendation |
| WooCommerce (optional) | 11.2.2 | Only when the project extends it; see the `woocommerce` skill |
| `@wordpress/scripts` | 37.1.0 | Build, lint, unit tests |
| `@wordpress/env` | 12.1.0 | Docker-based local site and test site |
| `@wordpress/create-block` | 5.1.0 | Block scaffolding |
| `@wordpress/eslint-plugin` | 28.1.0 | JS lint rules |
| `@wordpress/e2e-test-utils-playwright` | 3.2.0 | E2E helpers |
| `@playwright/test` | 1.65.0 | E2E runner |
| `wp-coding-standards/wpcs` | 3.4.1 | PHPCS ruleset |
| `szepeviktor/phpstan-wordpress` | 2.0.4 | PHPStan extension |
| `php-stubs/wordpress-stubs` | 7.1.2 | WordPress function and class stubs |
| `yoast/phpunit-polyfills` | 4.0.0 | Required by the WordPress test suite |
| `wp-cli/wp-cli-bundle` | 2.12.0 | WP-CLI |

Pin exact versions in lockfiles (`composer.lock`, `package-lock.json`) and the PHP version in `.wp-env.json`.

## Local Environment: wp-env

```json
{
  "core": null,
  "phpVersion": "8.3",
  "plugins": [ "." ],
  "themes": [],
  "config": { "WP_DEBUG": true, "WP_DEBUG_LOG": true, "SCRIPT_DEBUG": true },
  "env": {
    "tests": { "port": 8889 }
  }
}
```

| Command | Purpose |
|---------|---------|
| `npx wp-env start` | Start the development site (port 8888) and the tests site (port 8889) |
| `npx wp-env stop` / `destroy` | Stop or remove containers and data |
| `npx wp-env run cli wp <command>` | Run WP-CLI against the development site |
| `npx wp-env run tests-cli wp <command>` | Run WP-CLI against the tests site |
| `npx wp-env run tests-cli --env-cwd=wp-content/plugins/<slug> vendor/bin/phpunit` | Run PHPUnit inside the environment |
| `npx wp-env clean all` | Reset databases |

Set `core` to a version, branch or ZIP URL to test other WordPress versions (`null` means latest production release); use `env.development` / `env.tests` to override per site. Commit `.wp-env.json`, put personal overrides in the git-ignored `.wp-env.override.json`.

## Scaffolding

```bash
npx @wordpress/create-block@latest my-block                                    # Block plugin
npx @wordpress/create-block@latest my-block --template @wordpress/create-block-interactive-template   # Interactivity API block
```

Review the generated `block.json`, `render.php` and build scripts and trim what you do not need. Pin `@latest` to the 5.1.0 release in CI scripts if you need reproducibility.

## Build: @wordpress/scripts

| Script | Purpose |
|--------|---------|
| `wp-scripts start` | Watch and build with source maps |
| `wp-scripts build` | Production build to `build/` (generates `*.asset.php`) |
| `wp-scripts build --blocks-manifest` / `wp-scripts build-blocks-manifest` | Generate `build/blocks-manifest.php` for `wp_register_block_types_from_metadata_collection()` |
| `wp-scripts lint-js` / `lint-style` / `format` | ESLint, Stylelint, Prettier |
| `wp-scripts test-unit-js` | Jest unit tests |
| `wp-scripts plugin-zip` | Package the distributable ZIP (respects `files` in `package.json` or `.distignore`) |

Typical `package.json` scripts:

```json
{
  "scripts": {
    "start": "wp-scripts start --blocks-manifest",
    "build": "wp-scripts build --blocks-manifest",
    "lint:js": "wp-scripts lint-js",
    "lint:css": "wp-scripts lint-style",
    "format": "wp-scripts format",
    "test:unit": "wp-scripts test-unit-js",
    "test:e2e": "playwright test",
    "env": "wp-env",
    "plugin-zip": "wp-scripts plugin-zip"
  }
}
```

For Interactivity API blocks, `viewScriptModule` builds need `--experimental-modules` on `build` and `start` unless the template already sets it. Script modules and classic scripts get their dependencies from the generated `*.asset.php`.

## Composer

```json
{
  "require": { "php": ">=7.4" },
  "require-dev": {
    "wp-coding-standards/wpcs": "^3.4",
    "dealerdirect/phpcodesniffer-composer-installer": "^1.0",
    "phpstan/phpstan": "^2.3",
    "szepeviktor/phpstan-wordpress": "^2.0",
    "php-stubs/wordpress-stubs": "^7.1",
    "yoast/phpunit-polyfills": "^4.0"
  },
  "autoload": { "psr-4": { "Acme\\Reports\\": "src/" } },
  "config": { "allow-plugins": { "dealerdirect/phpcodesniffer-composer-installer": true } }
}
```

- `core: null` uses the latest production WordPress; set a version, branch or ZIP URL to test others
- Add `phpcompatibility/phpcompatibility-wp` (PHPCompatibilityWP) when you enforce `testVersion` in PHPCS; check its current stable constraint and the `phpstan/phpstan` major compatible with `szepeviktor/phpstan-wordpress` on Packagist before pinning
- `composer.lock` is committed; `vendor/` is shipped in the plugin ZIP only with the production autoloader (`composer install --no-dev --optimize-autoloader`)
- When other plugins may load different versions of the same library, prefix your vendor code (Strauss or PHP-Scoper)

## WP-CLI

Install through `wp-cli/wp-cli-bundle` 2.12.0 or use the one inside `wp-env`. Useful commands during development:

| Command | Purpose |
|---------|---------|
| `wp scaffold plugin-tests <plugin>` | Generate the PHPUnit bootstrap and config (adapt to `wp-env`) |
| `wp i18n make-pot` / `make-json` | Extract strings; convert JS translations |
| `wp plugin check <plugin>` | Run Plugin Check (requires the Plugin Check plugin) |
| `wp cron event list`, `wp transient delete --all` | Inspect cron, clear transients |
| `wp eval-file`, `wp shell` | Run scripts and explore with WordPress loaded |
| `wp db query` | Read-only inspection of the test database |

## Plugin Check

Plugin Check (the WordPress.org Plugin Check plugin) validates plugin guidelines, security and i18n rules. Install it in `wp-env` (`"plugins": [ ".", "https://downloads.wordpress.org/plugin/plugin-check.latest-stable.zip" ]`) and run `wp plugin check <slug>` or use its admin screen; run it in CI before every release.

## Distribution

- `.distignore` (or the `files` array in `package.json`) excludes `node_modules/`, `tests/`, `.github/`, dev configs, source maps and `src/` JavaScript when only `build/` is needed
- Verify the ZIP installs on a clean `wp-env` site and activates without notices (`WP_DEBUG` on)

## Sources

- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/
- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/
- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-create-block/
- https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/
- https://wordpress.org/plugins/plugin-check/
- https://make.wordpress.org/cli/handbook/
- https://api.wordpress.org/core/version-check/1.7/
- https://registry.npmjs.org/ and https://packagist.org/ (version verification, 2026-11-10)
