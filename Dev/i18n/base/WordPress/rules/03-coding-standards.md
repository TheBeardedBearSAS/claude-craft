# WordPress Coding Standards

> Scope: PHP, JavaScript and CSS written for WordPress 7.1-line plugins and block themes. Generic PHP style (PER-CS, SOLID) follows the `php` stack; this file lists what is specific to WordPress. WPCS 3.4.1 is the reference PHPCS ruleset.

## Principle

Follow the WordPress Coding Standards (WPCS) through PHPCS, not by memory. Where the project deliberately deviates (for example short array syntax or PSR-4 file names), declare the exclusion once in `.phpcs.xml.dist` with a comment, and keep it consistent.

## PHP

| Topic | Rule |
|-------|------|
| Indentation | Tabs for indentation, spaces for alignment (WPCS default) |
| Spacing | Spaces inside parentheses: `if ( $a ) { foo( $b ); }` |
| Braces | Always, on the same line as the control structure |
| Yoda conditions | `if ( true === $enabled )`; required by WPCS for comparisons with literals |
| Arrays | `array()` is the WPCS default; short `[]` allowed via a ruleset decision, applied consistently |
| Naming | `snake_case` functions and variables; `Capitalized_Words` classes in WPCS file-naming mode, or PSR-4 `PascalCase` with the `WordPress.Files.FileName` exclusion; `UPPER_CASE` constants |
| Prefixing | Every global (function, class outside a namespace, constant, hook, option, post type, handle) is prefixed or namespaced; configure `WordPress.NamingConventions.PrefixAllGlobals` with your prefixes |
| Strictness | `in_array( $x, $list, true )`, `array_search( ..., true )`; no loose comparisons on user data |
| Docblocks | Public functions, classes and hooks documented: `@since`, `@param`, `@return` |
| Files | `defined( 'ABSPATH' ) || exit;` at the top of directly reachable files |
| Forbidden | `eval()`, `extract()`, `create_function()`, error suppression `@`, runtime `ini_set()`, `error_reporting()`, `query_posts()`, `$wpdb` queries concatenated with variables |

### Minimum PHP Compatibility

`Requires PHP` in the plugin header, `composer.json` (`"php": ">=7.4"`) and the PHPCS `testVersion` must agree. PHP 7.4 is the WordPress minimum; 8.3+ is recommended for hosting. If the minimum is 7.4, do not use `match`, enums, readonly properties, union types or constructor promotion; raise the minimum deliberately and everywhere at once.

### WordPress Idioms

```php
// Late escaping of translated output
printf(
	/* translators: %s: report title. */
	esc_html__( 'Report: %s', 'acme-reports' ),
	esc_html( $title )
);

// Capability, nonce, unslash, sanitize
if ( ! current_user_can( 'edit_post', $post_id ) ) {
	wp_die( esc_html__( 'Not allowed.', 'acme-reports' ), '', array( 'response' => 403 ) );
}
check_admin_referer( 'acme_save_report_' . $post_id );
$title = isset( $_POST['title'] ) ? sanitize_text_field( wp_unslash( $_POST['title'] ) ) : '';

// Safe errors
$result = $service->save( $post_id, $title );
if ( is_wp_error( $result ) ) {
	return $result;
}
```

- Return `WP_Error` for recoverable failures; check with `is_wp_error()`; use exceptions inside domain code and convert at the hook/REST boundary
- Use core functions rather than native equivalents when they exist: `wp_remote_get()` (not cURL), `wp_json_encode()`, `wp_parse_args()`, `wp_list_pluck()`, `wp_mkdir_p()`, `WP_Filesystem` for file writes, `current_time()` / `wp_date()` for site-timezone dates
- Debug logging goes through a guarded helper that checks `WP_DEBUG` and `WP_DEBUG_LOG`; no `var_dump` or `print_r` in committed code

### Complexity

Cognitive complexity < 10, nesting <= 3, methods < 20 lines (target 10), at most 4 parameters. Early returns and guard clauses; extract validation into small methods.

## JavaScript

- Lint with `@wordpress/eslint-plugin` through `wp-scripts lint-js`; format with `wp-scripts format` (Prettier config from `@wordpress/prettier-config`)
- Use `@wordpress/*` packages as externals (`@wordpress/element`, `@wordpress/components`, `@wordpress/data`, `@wordpress/block-editor`, `@wordpress/i18n`); `wp-scripts` generates `*.asset.php` with the dependency list
- Functional components and hooks; `useBlockProps()` on the root element in `edit`, `useBlockProps.save()` in `save`
- `edit` and `save` must be pure; side effects belong in hooks (`useEffect`) or data stores
- Strings through `__()`, `_x()`, `_n()` from `@wordpress/i18n` with the plugin text domain
- No jQuery in new code; use the Interactivity API for front-end behavior and `@wordpress/api-fetch` for REST calls (it adds the REST nonce middleware)
- TypeScript is optional: strict mode, typed block attributes, no `any`

## CSS / SCSS

- Prefix class names with the block or plugin namespace (`wp-block-acme-report`, `acme-report__title`); prefer BEM-like names
- Use `theme.json` presets through CSS variables (`var(--wp--preset--color--primary)`) rather than hard-coded values
- Lint with `wp-scripts lint-style` (`@wordpress/stylelint-config`)
- No `!important` unless overriding third-party output, with a comment

## HTML, Templates and Patterns

- Block theme templates and parts are block-markup HTML; patterns are PHP files with a header and `esc_html_e()` / `esc_attr_e()` for strings
- Classic PHP templates: output escaped late, no logic beyond presentation, `get_template_part()` for reuse
- Use semantic HTML and accessible markup (landmarks, labels, focus states); follow the WordPress accessibility coding standards

## Documentation

- `readme.txt` in WordPress.org format (`Stable tag`, `Tested up to`, `Requires at least`, `Requires PHP`, changelog); keep it consistent with the main plugin header
- Code comments explain why, not what; hooks documented with `@since` and `@param` descriptions
- `CHANGELOG.md` in Keep a Changelog format, or the `readme.txt` changelog section when the plugin is distributed through WordPress.org

## Sources

- https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/
- https://developer.wordpress.org/coding-standards/wordpress-coding-standards/javascript/
- https://developer.wordpress.org/coding-standards/wordpress-coding-standards/css/
- https://developer.wordpress.org/coding-standards/inline-documentation-standards/php/
- https://developer.wordpress.org/plugins/wordpress-org/how-your-readme-txt-works/
- https://github.com/WordPress/WordPress-Coding-Standards
- https://developer.wordpress.org/block-editor/reference-guides/packages/packages-eslint-plugin/
