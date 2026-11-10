#!/bin/bash
# Install/update Claude Code rules for WordPress projects (plugins + block themes)
# Version: 1.0.0 - TCL (Tiered Context Loading) optimized
# Usage: ./install-wordpress-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="WordPress"
TECH_DISPLAY_NAME="WordPress"
TECH_NAMESPACE="wordpress"
DEFAULT_STACK="WordPress 7.1 (PHP 7.4+ minimum, 8.3+ recommended), plugins + block themes, @wordpress/scripts 37, wp-env 12; WooCommerce 11.2 via the optional woocommerce skill"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture-wordpress.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-wordpress.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-wordpress.md:security.md"
)

TECH_RULES=(
    "02-architecture-wordpress.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-wordpress.md"
    "08-quality-tools.md"
    "11-security-wordpress.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation for WordPress plugins and block themes:
    - Plugins: header, prefixing/namespaces, hooks, activation/uninstall
    - Block themes (theme.json, templates, patterns) and blocks (block.json, render.php)
    - REST API (permission_callback), WP-CLI, i18n, caching
    - Tooling: wp-env, @wordpress/scripts, WPCS, PHPStan, Plugin Check
    - Tests: PHPUnit (WP_UnitTestCase), Jest via wp-scripts, Playwright

    Modular: WooCommerce guidance ships as the on-demand skill
    .claude/skills/woocommerce/ and stays out of context for plain WordPress.

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check <architecture|code-quality|security|testing|all>\` - Audit by axis (all = scored aggregate)"

ARCHITECTURE_SUMMARY="\`\`\`
my-plugin/
├── my-plugin.php         # Header (Requires at least, Requires PHP, Text Domain) + bootstrap
├── composer.json         # PSR-4 autoload, dev tools (WPCS, PHPStan, PHPUnit)
├── package.json          # @wordpress/scripts (build, lint, test)
├── .wp-env.json          # Local WordPress for dev and tests
├── uninstall.php         # Cleanup of options/tables
├── src/                  # Namespaced PHP classes (hooks registered in one place)
├── blocks/               # One folder per block: block.json, edit.js, render.php
├── build/                # wp-scripts output + blocks-manifest.php
├── languages/
└── tests/                # phpunit/ and e2e/
\`\`\`

**Rule**: no logic at file load time — everything hooks into WordPress actions/filters."

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Global symbols | Unique prefix or PHP namespace | \`My_Plugin\\\\Admin\\\\Settings\` |
| Hook names | Prefixed, snake_case | \`my_plugin_before_save\` |
| Strings | Translatable with the plugin text domain | \`__( 'Saved', 'my-plugin' )\` |
| Output | Escaped late | \`echo esc_html( \$title );\` |
| SQL | Always prepared | \`\$wpdb->prepare( '... WHERE id = %d', \$id )\` |

**Always**: check capabilities and nonces on every write, sanitize input, escape output."

TESTING_STACK="**WordPress Stack**: PHPUnit + WP_UnitTestCase (wp-env) + yoast/phpunit-polyfills, Jest via @wordpress/scripts, Playwright + @wordpress/e2e-test-utils-playwright (E2E)"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Plugin/theme layout, hooks, blocks, REST, WP-CLI
- \`${TECH_NAMESPACE}/coding-standards.md\` - WPCS, prefixing, i18n, escaping conventions
- \`${TECH_NAMESPACE}/testing.md\` - WP_UnitTestCase, wp-scripts tests, Playwright E2E
- \`${TECH_NAMESPACE}/tooling.md\` - wp-env, @wordpress/scripts, WP-CLI, CI
- \`${TECH_NAMESPACE}/quality-tools.md\` - PHPCS/WPCS, PHPStan, Plugin Check, ESLint
- \`${TECH_NAMESPACE}/security.md\` - Capabilities, nonces, sanitize/escape, \$wpdb->prepare"

FILE_CONTEXTS="  # Main plugin file / theme config
  \"*.php\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Guard direct access: defined( 'ABSPATH' ) || exit;
      Check current_user_can() and a nonce before any write; escape late.

  \"theme.json\":
    suggest_skills:
      - documentation
    auto_load: false
    quick_tips: |
      Prefer theme.json settings/styles over custom CSS and PHP theme supports.

  # Blocks
  \"**/block.json\":
    suggest_skills:
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      apiVersion 3; register all blocks via the blocks manifest.
      Dynamic blocks render in render.php: escape every attribute.

  # REST endpoints
  \"src/**/Rest/**\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      permission_callback is mandatory; never __return_true for writes.

  # WooCommerce extensions (optional module)
  \"**/*woocommerce*/**\":
    suggest_skills:
      - woocommerce
    auto_load: false
    quick_tips: |
      Load .claude/skills/woocommerce/ : HPOS-safe CRUD, declared compatibility.

  \"**/*-wc-*.php\":
    suggest_skills:
      - woocommerce
    auto_load: false

  # Test files
  \"tests/**\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      Extend WP_UnitTestCase; create fixtures with self::factory().

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
