# Check WordPress Architecture

## Arguments

$ARGUMENTS (optional: path to the plugin or theme to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans several plugins/themes, or mixes PHP, block JavaScript and theme configuration.

## MISSION

Audit the architecture of a WordPress plugin or block theme (WordPress 7.1 line; PHP 7.4 minimum, 8.3+ recommended). Stance: **extend core through its public APIs (hooks, blocks, REST, Settings API) and keep the plugin a thin wiring layer over plain, testable PHP classes**. Never modify core, never fork behavior that a filter can change. Out of scope: Bedrock, hosting and multi-environment deployment, generic PHP design (see the `php` stack), frontend frameworks outside the block editor.

All commands run in Docker (`docker compose exec app ...`, or `npx wp-env run cli ...` when WordPress itself must be loaded).

### Step 1: Plugin / Theme Layout and Bootstrap (5 points)

```bash
docker compose exec app ls
docker compose exec app sh -c 'head -40 *.php | grep -nE "Plugin Name|Version|Requires at least|Requires PHP|Requires Plugins|Text Domain|Domain Path|License"'
docker compose exec app grep -rnE "defined\( *'ABSPATH' *\)" --include=*.php . --exclude-dir=vendor --exclude-dir=node_modules
docker compose exec app ls uninstall.php composer.json readme.txt theme.json
```

Checklist:
- [ ] Main plugin file has a complete header: `Plugin Name`, `Version`, `Requires at least`, `Requires PHP`, `Text Domain` matching the slug, `License`; `Requires Plugins` lists hard dependencies by slug
- [ ] The main file only bootstraps: constants, autoloader, activation/deactivation hooks, one `plugins_loaded` (or later) call that starts the plugin; no feature logic at file scope
- [ ] Every PHP file that can be requested directly starts with `defined( 'ABSPATH' ) || exit;` (files that only declare classes are still guarded)
- [ ] Unique prefix or namespace for every global (functions, constants, options, hooks, post types, REST namespaces, script handles); no generic names like `init_settings()`
- [ ] Composer PSR-4 autoload (or a single documented autoloader); no `require_once` chains scattered through the code
- [ ] Activation, deactivation and `uninstall.php` (or `register_uninstall_hook`) exist and are idempotent; uninstall removes options, custom tables and cron events the plugin created
- [ ] Block themes: `theme.json` (version 3), `style.css` header, `templates/`, `parts/`, `patterns/`; classic PHP templates only where justified

**Scoring**: 5 pts, minus 1 per violation (min 0).

### Step 2: Hooks and Separation of Concerns (6 points)

```bash
docker compose exec app grep -rnE "add_(action|filter)\(" --include=*.php . --exclude-dir=vendor --exclude-dir=node_modules
docker compose exec app grep -rnE "remove_(action|filter)\(" --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE '\bglobal \$|\$GLOBALS' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE "add_(action|filter)\( *'[a-z_]+' *, *function" --include=*.php . --exclude-dir=vendor
```

Checklist:
- [ ] Hooks are registered in one place per feature (a `register()` / `boot()` method), not inside constructors of value objects or at file scope
- [ ] Callbacks are class methods or named functions, so they can be removed with `remove_action()` and tested; anonymous closures only for hooks that never need removal
- [ ] Priorities are explicit when order matters and documented; `remove_*` calls run late enough (priority and hook) to find the callback
- [ ] Business logic lives in plain classes with injected dependencies (including `$wpdb`, clock, HTTP client); hook callbacks are thin adapters
- [ ] Heavy work does not run on every request: guard with `is_admin()`, `wp_doing_ajax()` or load classes lazily on the relevant hook (`admin_init`, `rest_api_init`, `init`)
- [ ] The plugin exposes its own extension points (`apply_filters()` / `do_action()`) with prefixed names for behavior that integrators may change, documented with a docblock
- [ ] Globals (`$post`, `$wp_query`) are read through functions (`get_post()`, `get_queried_object()`); any temporary global change is restored (`wp_reset_postdata()`)
- [ ] Custom post types, taxonomies and meta are registered on `init` with `show_in_rest` where the editor or REST needs them; rewrite rules are flushed only on activation/deactivation

**Scoring**: 6 pts. Deduct 1 per feature mixing business rules with hook plumbing, 1 per irremovable callback that integrators need, 1 per file-scope side effect, max -6.

### Step 3: Blocks, Themes and the Interactivity API (5 points)

```bash
docker compose exec app find . -name block.json -not -path "./node_modules/*" -not -path "./vendor/*"
docker compose exec app grep -rnE "wp_register_block_types_from_metadata_collection|register_block_type\(|blocks-manifest" --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE "\"apiVersion\"|\"viewScriptModule\"|\"render\"|\"supports\"" --include=block.json . --exclude-dir=node_modules
docker compose exec app grep -nE '"version"|"[$]schema"' theme.json
```

Checklist:
- [ ] Each block has a `block.json` with `apiVersion` 3, a namespaced `name`, `title`, `category`, `textdomain`, and declared `attributes`, `supports`, `editorScript` / `style` / `render` as needed
- [ ] Blocks are registered from metadata: `wp_register_block_types_from_metadata_collection()` with a `blocks-manifest.php` produced by `wp-scripts build-blocks-manifest`, or `register_block_type( __DIR__ . '/build/<block>' )` for a single block
- [ ] Dynamic blocks use `render.php` (or a `render_callback`) that escapes late and relies on `$attributes`, `$content`, `$block`; static markup is saved in JS only when it never changes server-side
- [ ] Block deprecations are provided when saved markup or attributes change
- [ ] Interactive front-end behavior uses the Interactivity API (`viewScriptModule`, `data-wp-interactive`, `data-wp-on--click`, a namespaced `store()`), not ad-hoc jQuery on the front end
- [ ] Block themes configure design in `theme.json` (settings, styles, `templateParts`, `customTemplates`) rather than custom CSS; patterns live in `patterns/` with a header (`Title`, `Slug`, `Categories`)
- [ ] Front-end assets are enqueued only where needed (block `style` / `viewScriptModule`, or conditional `wp_enqueue_scripts`) using the `*.asset.php` dependencies and version

**Scoring**: 5 pts (2 block metadata and registration, 1 dynamic rendering, 1 Interactivity API, 1 theme.json and patterns). Mark items N/A when the project has no blocks or no theme, and rescale.

### Step 4: REST API, Settings and Data (4 points)

```bash
docker compose exec app grep -rnE "register_rest_route|permission_callback|register_setting|add_settings_(section|field)|add_options_page|add_menu_page" --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE "(get|update|add)_option\(|(get|set)_transient\(|wp_cache_(get|set)\(" --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'dbDelta|[$]wpdb->(query|get_results|get_var|insert|update)' --include=*.php . --exclude-dir=vendor
```

Checklist:
- [ ] Custom endpoints use `register_rest_route()` on `rest_api_init` with a vendor namespace and version (`vendor/v1`), a `permission_callback` on every route, and `args` with `type`, `required`, `sanitize_callback` and `validate_callback`
- [ ] Controllers extend `WP_REST_Controller` (or follow its schema conventions) and return `WP_REST_Response` / `WP_Error` with proper status codes
- [ ] Settings use `register_setting()` with `type`, `sanitize_callback`, `default`, and `show_in_rest` when needed; admin pages use the Settings API, not hand-rolled forms
- [ ] Options are namespaced, grouped (one array option per feature instead of many scalar options), and large or rarely read ones use `autoload` set to false
- [ ] Expensive computations use transients or the object cache (`wp_cache_*` with a group) with an explicit expiration and invalidation on change
- [ ] Custom tables are created with `dbDelta()` on activation, versioned (a `{prefix}_db_version` option) with upgrade routines, and always accessed through `$wpdb` with the table prefix
- [ ] WP-CLI commands (when present) register via `WP_CLI::add_command()` inside `if ( defined( 'WP_CLI' ) && WP_CLI )` and reuse the same service classes as hooks and REST

**Scoring**: 4 pts (1 per group: REST, settings, options and caching, custom tables / WP-CLI).

### Step 5: Internationalization, Assets and Compatibility (5 points)

```bash
docker compose exec app grep -rnE "load_plugin_textdomain|wp_set_script_translations|esc_html__|_x\(|_n\(" --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE "wp_(register|enqueue)_(script|style)|\.asset\.php" --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE "<script|<style|<link rel=.stylesheet" --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE "wp_remote_(get|post)|file_get_contents\( *'http|curl_init" --include=*.php . --exclude-dir=vendor
```

Checklist:
- [ ] All user-facing strings use `__()`, `_x()`, `_n()`, `esc_html__()` with a single literal text domain matching the plugin slug (no variables as domain or string); a `.pot` file is generated with `wp i18n make-pot`
- [ ] JavaScript strings use `@wordpress/i18n` and `wp_set_script_translations( $handle, $domain, $path )`; `Domain Path` header set when translations ship in the plugin
- [ ] Assets are registered/enqueued with `wp_enqueue_script/style` and the dependencies and version from `build/*.asset.php`; no inline `<script>` / `<style>` tags in templates (use `wp_add_inline_script` / `wp_add_inline_style`)
- [ ] Scripts load in the footer or with the `strategy` argument set to `defer` where possible; admin assets are limited to the relevant screen via the hook suffix
- [ ] Bundled libraries come from npm and are built, not copied minified without source; no remote CDN assets that leak visitor data
- [ ] Outbound HTTP uses the HTTP API (`wp_remote_get` / `wp_safe_remote_get`) with timeouts and error handling, never raw cURL
- [ ] Declared `Requires at least` / `Requires PHP` match the APIs actually used; deprecated functions are not called (check with Plugin Check and `WP_DEBUG` logs)
- [ ] Multisite: `switch_to_blog()` / `restore_current_blog()` are paired; network-wide data uses the network option variants

**Scoring**: 5 pts (2 i18n, 2 assets and HTTP, 1 compatibility declarations).

### Step 6: WooCommerce Extension (conditional, not scored here)

If the project depends on WooCommerce (plugin header `Requires Plugins: woocommerce`, `wc_*` calls, `before_woocommerce_init` hook), also apply `.claude/skills/woocommerce/checklist.md` and report its findings in a separate section.

## OUTPUT FORMAT

```
WORDPRESS ARCHITECTURE AUDIT
============================

SCORE: XX/25

WordPress: X.Y   PHP: X.Y   Type: [plugin/block theme/both]   Blocks: N   REST routes: N   Hooks: N

SUB-SCORES:
  Layout and bootstrap               : XX/5
  Hooks and separation of concerns   : XX/6
  Blocks, themes, Interactivity API  : XX/5
  REST, settings and data            : XX/4
  i18n, assets and compatibility     : XX/5

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

- Findings must cite `file:line` and propose a concrete refactoring (for example "move the pricing rules out of the `save_post` callback into `Pricing\Calculator` so it can be unit-tested")
- Do not recommend a DI container, custom abstraction layers or service providers for a small plugin (YAGNI)
- Never edit WordPress core or third-party plugins in the audit; propose a hook or a filter instead
- Generic PHP design belongs to the `php` stack; hosting and deployment (Bedrock, multi-environment) are out of scope
