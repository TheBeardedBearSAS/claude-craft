# WordPress Quality Tools

> Scope: automated quality gates for plugins and block themes (WordPress 7.1 line). Run everything in Docker; the same commands run locally and in CI. Generic PHP quality tooling follows the `php` stack.

## Overview

| Tool | Version | Purpose | Gate |
|------|---------|---------|------|
| PHPCS + WordPress Coding Standards | WPCS 3.4.1 | Style, security and i18n sniffs | Zero errors |
| PHPCompatibilityWP | current stable (verify on Packagist) | PHP version compatibility (`testVersion`) | Zero errors |
| PHPStan + `szepeviktor/phpstan-wordpress` | 2.0.4 | Static analysis with WordPress awareness | Level 6 minimum, target 8+ |
| `php-stubs/wordpress-stubs` | 7.1.2 | WordPress symbols for analysis | Required by PHPStan setup |
| `@wordpress/eslint-plugin` via `wp-scripts lint-js` | 28.1.0 | JS and block editor lint | Zero warnings |
| Stylelint via `wp-scripts lint-style` | bundled with `@wordpress/scripts` 37.1.0 | CSS / SCSS lint | Zero errors |
| Plugin Check (PCP) | WordPress.org plugin | Guidelines, security, i18n, performance checks | No errors before release |
| `composer audit`, `npm audit` | n/a | Dependency vulnerabilities | No moderate or higher |

## PHPCS (WordPress Coding Standards)

```xml
<?xml version="1.0"?>
<ruleset name="Acme Reports">
  <description>WordPress Coding Standards for Acme Reports.</description>
  <file>.</file>
  <exclude-pattern>/vendor/*</exclude-pattern>
  <exclude-pattern>/node_modules/*</exclude-pattern>
  <exclude-pattern>/build/*</exclude-pattern>
  <arg name="extensions" value="php"/>
  <arg value="ps"/>
  <arg name="colors"/>

  <rule ref="WordPress"/>
  <config name="minimum_wp_version" value="6.6"/>
  <config name="testVersion" value="7.4-"/>

  <rule ref="WordPress.WP.I18n">
    <properties><property name="text_domain" type="array"><element value="acme-reports"/></property></properties>
  </rule>
  <rule ref="WordPress.NamingConventions.PrefixAllGlobals">
    <properties><property name="prefixes" type="array"><element value="acme_reports"/><element value="Acme\Reports"/></property></properties>
  </rule>
</ruleset>
```

- `WordPress` = Core + Docs + Extra. Add `PHPCompatibilityWP` with `testVersion` equal to your `Requires PHP`
- `phpcbf` fixes what it can; run `phpcs -s` to show sniff names so exclusions are precise
- Each `// phpcs:ignore Sniff.Name -- reason` is one line, names the sniff and gives a reason; never disable a whole file for security sniffs (`WordPress.Security.*`, `WordPress.DB.*`)

```bash
docker compose exec app vendor/bin/phpcs
docker compose exec app vendor/bin/phpcbf
```

## PHPStan

```neon
# phpstan.neon.dist
includes:
    - vendor/szepeviktor/phpstan-wordpress/extension.neon
parameters:
    level: 6
    paths:
        - src
        - my-plugin.php
    excludePaths:
        - vendor
        - node_modules
        - build
    scanDirectories:
        - ../woocommerce   # only when extending WooCommerce
```

- The extension loads `php-stubs/wordpress-stubs` and adds dynamic return types for `get_option()`, `apply_filters()`, `WP_Error` handling and more
- Raise the level progressively; use a baseline (`phpstan analyse --generate-baseline`) that only shrinks
- Narrow `mixed` values from options and meta before use; do not silence with `@phpstan-ignore` wholesale
- For WooCommerce projects add `php-stubs/woocommerce-stubs` (see the `woocommerce` skill)

```bash
docker compose exec app vendor/bin/phpstan analyse --memory-limit=1G
```

## JavaScript Quality

```bash
docker compose exec app npx wp-scripts lint-js
docker compose exec app npx wp-scripts lint-style
docker compose exec app npx wp-scripts format --check   # Prettier via @wordpress/prettier-config
docker compose exec app npx tsc --noEmit                # when TypeScript is used
```

`wp-scripts lint-js` uses `@wordpress/eslint-plugin` recommended rules; keep `.eslintrc.js` (or `eslint.config.js`) minimal and extend `plugin:@wordpress/eslint-plugin/recommended`.

## Plugin Check (PCP)

Plugin Check is the official WordPress.org tool that mirrors the plugin review checks: security, i18n, file hygiene, performance, plugin header and readme validation.

```bash
docker compose exec app npx wp-env run cli wp plugin install plugin-check --activate
docker compose exec app npx wp-env run cli wp plugin check my-plugin
```

Run it before each release and in CI against a built ZIP, not the dev tree; fix every error and review warnings.

## Dependency and Supply Chain

```bash
docker compose exec app composer audit
docker compose exec app npm audit --omit=dev --audit-level=moderate
```

- Pin versions through lockfiles; review new dependencies (maintenance, license compatible with GPL)
- Prefix vendor code (Strauss or PHP-Scoper) when conflicts with other plugins are possible
- Generate an SBOM (CycloneDX) for release artifacts when the distribution channel requires it

## CI Pipeline (GitHub Actions sketch)

```yaml
name: ci
on: [pull_request]
jobs:
  php:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        php: ['7.4', '8.3']
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '${{ matrix.php }}', tools: composer }
      - run: composer install --no-progress
      - run: vendor/bin/phpcs
      - run: vendor/bin/phpstan analyse --memory-limit=1G
      - run: composer audit
  js-and-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm }
      - run: npm ci
      - run: npx wp-scripts lint-js && npx wp-scripts test-unit-js
      - run: npx wp-env start
      - run: npx wp-env run tests-cli --env-cwd=wp-content/plugins/my-plugin vendor/bin/phpunit
      - run: npx playwright install --with-deps chromium && npx playwright test
```

Adapt action versions and the Node version to your policy; pin third-party actions by commit SHA for supply-chain safety.

## Pre-Commit

Use Lefthook or Husky to run `phpcs` and `wp-scripts lint-js` on staged files and the unit suites on push. Hooks are requirements, CLAUDE.md is a suggestion.

## Sources

- https://github.com/WordPress/WordPress-Coding-Standards
- https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/
- https://github.com/szepeviktor/phpstan-wordpress
- https://wordpress.org/plugins/plugin-check/
- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/
- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-eslint-plugin/
- https://packagist.org/ (versions verified 2026-11-10)
