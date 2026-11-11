# WordPress Security

> Scope: security of plugins and block themes (WordPress 7.1 line, PHP 7.4 minimum, 8.3+ recommended), mapped to OWASP Top 10:2025. Server hardening, hosting and Bedrock are out of scope. WooCommerce payment and webhook security is in the optional `woocommerce` skill.

## Principle

Validate and sanitize input early, escape output late, check a capability and a nonce on every state change, and treat every request, option, meta value and remote response as untrusted. Most WordPress plugin vulnerabilities are missing authorization, missing CSRF protection, SQL injection and unescaped output.

## Authorization (OWASP A01)

- Check a **specific capability** with `current_user_can()` before any state change or sensitive read: `manage_options`, `edit_post` with the post id, `delete_user` with the user id. `is_admin()` only says the admin screen is loading; it is not an authorization check. `is_user_logged_in()` alone is not authorization either
- Per-object capabilities defeat IDOR: always pass the object id from the request to `current_user_can( 'edit_post', $id )`
- Admin pages declare a capability on `add_menu_page()` / `add_submenu_page()` and the callback checks it again
- `wp_ajax_nopriv_*` exposes the handler to anonymous visitors: use only when intended, and validate everything
- Add custom capabilities and roles on activation, remove them on uninstall

```php
add_action( 'admin_post_acme_delete_report', 'acme_handle_delete_report' );

function acme_handle_delete_report(): void {
	$id = isset( $_POST['report_id'] ) ? absint( $_POST['report_id'] ) : 0;

	if ( ! current_user_can( 'delete_post', $id ) ) {
		wp_die( esc_html__( 'Not allowed.', 'acme-reports' ), '', array( 'response' => 403 ) );
	}
	check_admin_referer( 'acme_delete_report_' . $id );

	wp_delete_post( $id, true );
	wp_safe_redirect( add_query_arg( 'deleted', 1, admin_url( 'admin.php?page=acme-reports' ) ) );
	exit;
}
```

## Nonces (CSRF)

- Create: `wp_nonce_field( 'action', '_wpnonce' )` in forms, `wp_nonce_url()` for links, `wp_create_nonce()` for JavaScript
- Verify: `check_admin_referer( 'action' )` (forms and links), `check_ajax_referer( 'action', 'nonce' )` (AJAX), or `wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ?? '' ) ), 'action' )`
- Nonces prove intent, not identity or permission: always pair with `current_user_can()`. Nonces are not single-use secrets and expire (12 to 24 hours); never use them for authentication
- Cookie-authenticated REST requests carry the `X-WP-Nonce` header (`wp_rest` action); `@wordpress/api-fetch` adds it automatically

## Input: Validate and Sanitize

Read superglobals defensively: check existence, `wp_unslash()`, then validate and sanitize for the data type.

| Data | Function |
|------|----------|
| Text line | `sanitize_text_field()` |
| Multi-line text | `sanitize_textarea_field()` |
| Email | `sanitize_email()` + `is_email()` |
| Slug / key | `sanitize_key()`, `sanitize_title()` |
| File name | `sanitize_file_name()` |
| Integer | `absint()`, `(int)` |
| URL to store | `esc_url_raw()` |
| HTML subset | `wp_kses( $html, $allowed )`, `wp_kses_post()` |
| Enumeration | allow-list with `in_array( $v, $allowed, true )` |

- Validate before sanitizing when a strict format is required; reject rather than silently fix
- REST `args` use `type`, `enum`, `format`, `required`, `validate_callback`, `sanitize_callback`; `register_setting()` uses `sanitize_callback`; registered meta uses `sanitize_callback` and `auth_callback`
- Never `extract( $_POST )` or mass-assign request arrays into options, user meta or post fields; list allowed keys

## Output: Escape Late

Escape at the point of output, with the function matching the context.

| Context | Function |
|---------|----------|
| HTML text | `esc_html()`, `esc_html__()`, `esc_html_e()` |
| HTML attribute | `esc_attr()`, `esc_attr__()` |
| URL (href, src, form action) | `esc_url()` |
| Inline JavaScript data | `wp_json_encode()` or `wp_add_inline_script()` with JSON; `esc_js()` for legacy inline handlers |
| Textarea content | `esc_textarea()` |
| Limited HTML | `wp_kses_post()`, `wp_kses( $html, $allowed )` |

- Escape values from the database too (options, meta, term names, user fields): stored data is untrusted
- `$_SERVER['REQUEST_URI']`, `HTTP_HOST` and `add_query_arg()` / `remove_query_arg()` results are escaped with `esc_url()` or `esc_attr()`
- In block `render.php`, escape each attribute and content value; `get_block_wrapper_attributes()` returns escaped markup that is output directly
- JavaScript: never assign untrusted strings to `innerHTML`, `dangerouslySetInnerHTML` or `RawHTML`; React text nodes are escaped by default
- Redirect with `wp_safe_redirect()` and `exit`; validate user-supplied targets with `wp_validate_redirect()`

## Database (OWASP A05)

```php
global $wpdb;

$row = $wpdb->get_row(
	$wpdb->prepare(
		"SELECT * FROM {$wpdb->prefix}acme_reports WHERE owner_id = %d AND status = %s",
		$user_id,
		$status
	)
);

// Identifiers: %i (supported since WordPress 6.2)
$wpdb->get_results( $wpdb->prepare( 'SELECT %i FROM %i', $column, $table ) );

// LIKE
$like = '%' . $wpdb->esc_like( $term ) . '%';
$wpdb->get_results( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}acme_reports WHERE title LIKE %s", $like ) );
```

- Every query with a variable goes through `$wpdb->prepare()` using `%s`, `%d`, `%f`, and `%i` for identifiers; never concatenate or interpolate user data, including `ORDER BY` and `LIMIT` (allow-list the column and direction, cast the integers)
- `IN (...)`: build `implode( ',', array_fill( 0, count( $ids ), '%d' ) )` placeholders and spread the values
- Prefer `$wpdb->insert()`, `update()`, `delete()` with format arrays, `WP_Query` and meta APIs over raw SQL

## REST API and AJAX

- Every `register_rest_route()` has a `permission_callback`. Write routes (`POST`, `PUT`, `PATCH`, `DELETE`) must never use `__return_true`; public reads may use it deliberately, with no private fields exposed
- Check object-level rights inside the permission callback using the id from the request
- Response schemas decide what leaves the server: never return password hashes, tokens, emails of other users, internal paths or raw option dumps
- External clients authenticate with Application Passwords (core) or OAuth; do not invent token schemes
- Do not enable permissive CORS (`Access-Control-Allow-Origin: *`) for authenticated endpoints

## File Handling

- Uploads: `wp_handle_upload()` / `media_handle_upload()` with an allow-list of MIME types and extensions (`wp_check_filetype_and_ext()`), a size limit, and the `upload_files` capability; never trust the client name or MIME type; do not store uploads in executable locations
- Guard direct access: `defined( 'ABSPATH' ) || exit;` at the top of every PHP file that can be requested by URL
- File paths from user input: allow-list names, resolve with `realpath()` and verify the result stays inside the intended directory; never `include` or `require` a variable path
- Use `WP_Filesystem` for writes outside uploads when permissions require it; do not write exports to guessable public paths
- 7.1 client-side media processing (wasm-vips in a Web Worker, on by default in Chromium 137+ with `Document-Isolation-Policy: isolate-and-credentialless`) uploads sub-sizes through `POST /wp/v2/media/{id}/sideload`: keep the `upload_files` capability and MIME allow-list on custom upload paths, make sure your CSP `worker-src` allows `blob:`, and opt out with `add_filter( 'wp_client_side_media_processing_enabled', '__return_false' )` if needed. Source: https://make.wordpress.org/core/2026/07/22/client-side-media-processing-in-wordpress-7-1/

## Data and Object Handling

- Never `unserialize()` user-controlled or remote data (PHP object injection); use `json_decode()`; `maybe_unserialize()` is for trusted core storage only
- No `eval()`, `assert()` with strings, `shell_exec()`, `system()`, `exec()`, `proc_open()` with user data; if a process is unavoidable, use `escapeshellarg()` and fixed commands
- Passwords, keys and tokens: `wp_generate_password()`, `wp_generate_uuid4()`, `random_bytes()`; compare secrets with `hash_equals()`; never `md5`, `sha1`, `rand` or `mt_rand` for security

## Outbound Requests (SSRF)

- Use the HTTP API (`wp_remote_get`, `wp_remote_post`), never raw cURL; for URLs that come from users or settings use `wp_safe_remote_get()` / `wp_safe_remote_post()`, which reject local and private addresses (the `reject_unsafe_urls` argument)
- Set timeouts, handle `WP_Error`, validate the response, and cache results
- Webhook receivers verify an HMAC signature with `hash_equals()` and a timestamp window; respond quickly and process asynchronously

## Options, Secrets and Configuration

- Store secrets in `wp-config.php` constants or environment variables rather than plain options; if stored, treat as sensitive: `autoload` false, never `show_in_rest`, never logged
- Options autoload: pass `false` for large, rarely used or sensitive options (`add_option( $name, $value, '', false )`, `update_option( $name, $value, false )`); autoloaded data is read on every request
- Do not commit credentials, API keys or salts; scan with a secrets detector in CI
- Never print stack traces or debug output to visitors; `WP_DEBUG_DISPLAY` off in production; log without secrets or personal data

## Privacy

When the plugin stores personal data, register exporters and erasers (`wp_privacy_personal_data_exporters`, `wp_privacy_personal_data_erasers`), document what is collected, delete it on uninstall, and add privacy policy text with `wp_add_privacy_policy_content()`.

## Supply Chain (OWASP A03)

- `composer audit` and `npm audit --omit=dev --audit-level=moderate` in CI; lockfiles committed
- Review third-party libraries (maintenance, license compatible with GPL); prefer WordPress core APIs to extra dependencies
- Build release ZIPs in CI from a clean checkout with production dependencies only; verify with Plugin Check; sign or attest artifacts when the channel supports it

## Pre-Release Security Checklist

- [ ] Every state-changing handler has a capability check and a nonce
- [ ] Every REST route has a real `permission_callback`; writes never `__return_true`
- [ ] All superglobal reads use `wp_unslash()` and a sanitizer; allow-lists for enumerations
- [ ] All output escaped late with the right context function
- [ ] All SQL with variables uses `$wpdb->prepare()`; no concatenation
- [ ] No `unserialize()` on user data; no `eval`/`exec` with user data; no dynamic `include`
- [ ] Uploads validated; direct access guards in place
- [ ] Remote requests to user URLs use `wp_safe_remote_*`; webhooks verify signatures
- [ ] Secrets absent from the repository; sensitive options not autoloaded or exposed
- [ ] `composer audit` and `npm audit` clean; Plugin Check passes
- [ ] Uninstall removes data; privacy exporters and erasers registered if applicable

## Sources

- https://developer.wordpress.org/apis/security/
- https://developer.wordpress.org/apis/security/data-validation/
- https://developer.wordpress.org/apis/security/sanitizing/
- https://developer.wordpress.org/apis/security/escaping/
- https://developer.wordpress.org/apis/security/nonces/
- https://developer.wordpress.org/apis/security/user-roles-and-capabilities/
- https://developer.wordpress.org/reference/classes/wpdb/prepare/
- https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/#permissions-callback
- https://developer.wordpress.org/plugins/privacy/
- https://owasp.org/Top10/2025/
