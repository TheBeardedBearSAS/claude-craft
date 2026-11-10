# New Feature Checklist - WordPress

Use this checklist when adding a feature to a plugin or block theme (a block, an admin screen, a REST endpoint, a WP-CLI command, a setting, a template). Apply the TDD cycle: write the failing test first, then the code.

## 1. Analysis (before code)

- [ ] Goal, acceptance criteria and user roles that can use the feature are written down
- [ ] Assumptions stated: minimum WordPress and PHP versions, whether multisite is supported, expected data volume, front-end versus admin context
- [ ] Core already offers it? Check core APIs, blocks, block bindings, patterns and `theme.json` before writing custom code
- [ ] Extension points identified: which hooks the feature uses, and which prefixed actions and filters it exposes
- [ ] Risk assessed: touches data model, uploads, remote calls, capabilities, or front-end output
- [ ] Impact written down (files, migrations, uninstall changes) and validated if more than 5 files or any breaking change

## 2. Design

- [ ] Domain logic planned as plain PHP classes (no WordPress calls); hook callbacks stay thin adapters
- [ ] Data storage chosen: option (array, `autoload` false), registered meta, custom post type/taxonomy, or custom table with `dbDelta()` and a version option
- [ ] Capability model defined: which capability gates each action; custom capabilities added on activation and removed on uninstall
- [ ] Namespace/prefix, text domain, script handles and REST namespace follow the project convention
- [ ] Performance considered: bounded queries (no `posts_per_page => -1`), `no_found_rows`, no meta_query on large tables, caching and invalidation plan
- [ ] Accessibility and i18n considered (labels, focus, translatable strings, RTL)

## 3. Implementation (TDD)

- [ ] Failing tests written first (unit for domain, `WP_UnitTestCase` for hooks/REST/DB, Jest for blocks, Playwright for the main journey)
- [ ] Hooks registered in one `register()` method on the right hook (`init`, `rest_api_init`, `admin_init`, ...)
- [ ] REST route: `permission_callback`, `args` with validate and sanitize callbacks, schema, proper `WP_Error` statuses (see `templates/rest-endpoint.md`)
- [ ] Block: `block.json` apiVersion 3, `render.php` with late escaping, deprecations if markup changes, registration through the build manifest (see `templates/block.md`)
- [ ] Admin screen or setting: Settings API, capability on the menu entry, nonce on custom forms
- [ ] WP-CLI command: registered under `WP_CLI`, reuses the domain services, documents synopsis and examples
- [ ] Assets: enqueued only where needed with `*.asset.php` dependencies; no inline tags
- [ ] Strings translatable with the literal text domain; JS translations loaded with `wp_set_script_translations()`
- [ ] Capability check and nonce on every state change; input sanitized, output escaped; SQL prepared

## 4. Quality

- [ ] `phpcs`, `phpstan`, `wp-scripts lint-js` clean
- [ ] Coverage >= 80%; authorization and sanitization paths covered, including denied cases
- [ ] Plugin Check has no new errors
- [ ] Tested on the minimum and the latest declared PHP and WordPress versions (and multisite if supported)
- [ ] Manual check in `wp-env` with `WP_DEBUG` on: no notices, warnings or deprecated calls

## 5. Lifecycle

- [ ] Activation routine idempotent; deactivation unschedules cron events
- [ ] `uninstall.php` removes the feature's options, tables, cron events, roles and capabilities
- [ ] Upgrade routine handles existing installs (`db_version` comparison)
- [ ] Privacy exporter and eraser registered if personal data is stored

## 6. Documentation and Delivery

- [ ] Hooks documented with docblocks (`@since`, `@param`); README / `readme.txt` updated
- [ ] CHANGELOG entry added; version bumped consistently if releasing
- [ ] Atomic Conventional Commits (`feat(rest): add reports endpoint`)
- [ ] Pull request lists the capability, nonce, escaping and SQL decisions for the reviewer

## 7. If the project depends on WooCommerce

If the project depends on WooCommerce (plugin header `Requires Plugins: woocommerce`, `wc_*` calls, `before_woocommerce_init` hook), also apply `.claude/skills/woocommerce/checklist.md` (HPOS compatibility, CRUD usage, Store API and block checkout extensibility, payment and webhook security).
