# Check WordPress Security

## Arguments

$ARGUMENTS (optional: path to the plugin or theme to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans several plugins/themes, includes file uploads or payment-like flows, or requires cross-cutting investigation.

## MISSION

Audit the security of a WordPress plugin or block theme against the WordPress Plugin Handbook security guidance and OWASP Top 10:2025. Stance: **validate input early, sanitize before storing, escape late on output, check capabilities and nonces on every state change, and never trust the request**. Most plugin vulnerabilities are missing authorization, missing nonce checks, SQL injection and unescaped output.

All commands run in Docker (`docker compose exec app ...`). Never run exploit attempts against a production site.

### Step 1: Authorization and Nonces (7 points)

```bash
docker compose exec app grep -rnE 'current_user_can|user_can\(|is_user_logged_in|is_super_admin' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'wp_verify_nonce|check_admin_referer|check_ajax_referer|wp_nonce_field|wp_create_nonce|wp_nonce_url' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'admin_post_|wp_ajax_(nopriv_)?|admin_init|add_(menu|submenu|options)_page' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE '[$]_(POST|GET|REQUEST)' --include=*.php . --exclude-dir=vendor
```

Checklist:
- [ ] Every state-changing handler (`admin_post_*`, `wp_ajax_*`, form handlers on `init` / `admin_init`, REST write routes) checks a specific capability with `current_user_can()` (`manage_options`, `edit_post` with the post id, a custom capability), not `is_admin()` and not `is_user_logged_in()` alone
- [ ] Every form and action link carries a nonce (`wp_nonce_field()` / `wp_nonce_url()`) verified server-side with `check_admin_referer()`, `check_ajax_referer()` or `wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ), 'action' )`; the nonce is a CSRF defense, never a substitute for the capability check
- [ ] `wp_ajax_nopriv_*` handlers are justified; each one validates input as untrusted and never exposes private data or privileged actions
- [ ] Per-object capabilities are used (`edit_post`, `delete_user` with the object id) to prevent IDOR; ownership is verified for user-scoped data
- [ ] Admin menu pages declare a capability, and the page callback re-checks it
- [ ] Custom roles and capabilities are added on activation and removed on uninstall; no capability is granted to `subscriber` or `anonymous` implicitly
- [ ] REST write endpoints use a real `permission_callback` (see Step 4)

**Scoring**: 7 pts. Deduct 2 per state-changing handler without a capability check (critical), 1 per missing nonce, 1 per `nopriv` handler without justification, max -7.

### Step 2: Input Sanitization and Output Escaping (7 points)

```bash
docker compose exec app grep -rnE 'sanitize_(text_field|textarea_field|email|key|title|file_name|url|hex_color)|absint\(|intval\(|wp_unslash|esc_url_raw|wp_kses' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'echo +[$]|<\?=|print +[$]|printf\(' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'esc_(html|attr|url|js|textarea)|wp_kses_post|wp_kses_data|wp_json_encode' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'innerHTML|dangerouslySetInnerHTML|insertAdjacentHTML|RawHTML' src --include=*.js --include=*.jsx --include=*.ts --include=*.tsx
```

Checklist:
- [ ] Superglobals are read with an `isset()` / `??` guard, then `wp_unslash()`, then a sanitizer matching the data type (`sanitize_text_field`, `sanitize_textarea_field`, `sanitize_email`, `absint`, `sanitize_key`, `esc_url_raw` for stored URLs, `wp_kses` / `wp_kses_post` for allowed HTML); validation (allow-lists, `in_array( ..., true )`, `is_email()`) comes first for enumerations
- [ ] Output is escaped late, at the point of echo, with the function matching the context: `esc_html()` (text), `esc_attr()` (attribute), `esc_url()` (href/src), `esc_js()` / `wp_json_encode()` (inline JS data), `esc_textarea()`, `wp_kses_post()` (limited HTML); translated strings use `esc_html__()` / `esc_attr__()` / `esc_html_e()`
- [ ] No unescaped `echo $var`, `<?= $var ?>` or `printf` with raw variables, including values read from options, post meta, term names and `$_SERVER` (`REQUEST_URI`, `HTTP_HOST`); `add_query_arg()` and `remove_query_arg()` results are passed through `esc_url()`
- [ ] Blocks: `render.php` escapes every attribute and content value; `get_block_wrapper_attributes()` is output as-is (it is already escaped), user-provided attributes are not concatenated into markup
- [ ] JavaScript never assigns untrusted strings through `innerHTML` / `dangerouslySetInnerHTML` / `RawHTML`; React escaping is relied upon in edit components
- [ ] `wp_kses` allowed-tags arrays are explicit and minimal; `unfiltered_html` is not assumed
- [ ] Redirects use `wp_safe_redirect()` with `exit` afterwards, and `wp_validate_redirect()` for user-provided targets

**Scoring**: 7 pts. Deduct 2 per unescaped output of request-derived or stored data (critical), 1 per missing sanitizer on stored input, max -7.

### Step 3: Database and Injection (4 points)

```bash
docker compose exec app grep -rnE '[$]wpdb->(query|get_results|get_row|get_var|get_col|prepare|insert|update|delete|replace)' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE '[$]wpdb->(query|get_results|get_row|get_var|get_col)\(.*(\.|[$]|\{)' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE '(exec|shell_exec|system|passthru|proc_open|popen|eval|assert)\(' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'unserialize\(|maybe_unserialize\(|include *\(?[$]|require(_once)? *\(?[$]' --include=*.php . --exclude-dir=vendor
```

Checklist:
- [ ] Every dynamic SQL statement goes through `$wpdb->prepare()` with placeholders `%s`, `%d`, `%f` and `%i` (identifiers); no string concatenation or interpolation of variables into SQL, including `ORDER BY` and `LIMIT` (allow-list the column, cast the integers)
- [ ] `LIKE` values use `$wpdb->esc_like()` before `prepare()`; `IN (...)` lists build placeholders with `array_fill()` and `implode()`
- [ ] Prefer `$wpdb->insert()`, `update()`, `delete()` with format arrays, or `WP_Query` / meta APIs, over raw SQL
- [ ] No `unserialize()` on user-controlled or remote data (object injection); use `json_decode()`; `maybe_unserialize()` is limited to trusted core storage and passes `allowed_classes` where applicable
- [ ] No command execution functions, `eval`, or dynamic `include` / `require` with variables; file paths built from user input are validated against an allow-list and `realpath()` containment
- [ ] No `extract( $_POST )` or mass-assignment of request arrays into options, user meta or post fields; the allowed keys are listed explicitly

**Scoring**: 4 pts. Deduct 2 per injectable query (critical), 1 per unsafe unserialize/include/exec, max -4.

### Step 4: REST API, AJAX and Outbound Requests (3 points)

```bash
docker compose exec app grep -rnE -B2 -A12 'register_rest_route' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'permission_callback.*__return_true' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'wp_remote_(get|post|request)|wp_safe_remote_(get|post|request)|curl_init|file_get_contents' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'Access-Control-Allow-Origin|rest_pre_serve_request|rest_send_cors_headers' --include=*.php . --exclude-dir=vendor
```

Checklist:
- [ ] Every `register_rest_route()` defines `permission_callback`; write routes (`POST`, `PUT`, `PATCH`, `DELETE`) never use `__return_true`; public read routes use `__return_true` only deliberately and expose no private fields
- [ ] Route `args` declare `type`, `required`, `validate_callback` and `sanitize_callback` (or a JSON schema); object-level checks use the id from the request (`current_user_can( 'edit_post', $id )`)
- [ ] Cookie-authenticated REST calls rely on the `X-WP-Nonce` (`wp_rest`) header; Application Passwords or OAuth are used for external clients; no custom token scheme without review
- [ ] REST responses do not leak password hashes, emails, tokens, internal paths or other users' data; fields are filtered through a response schema
- [ ] Outbound requests to user-provided URLs use `wp_safe_remote_get()` / `wp_safe_remote_post()` (SSRF protection) with timeouts and `reject_unsafe_urls`; webhook callbacks verify an HMAC signature with `hash_equals()`
- [ ] CORS headers are not opened to `*` for authenticated endpoints

**Scoring**: 3 pts. Deduct 1.5 per unauthenticated write route (critical), 1 per leaking response, 1 per SSRF-prone call, max -3.

### Step 5: Files, Secrets, Configuration and Supply Chain (4 points)

```bash
docker compose exec app grep -rnE 'move_uploaded_file|wp_handle_upload|wp_check_filetype|[$]_FILES|upload_mimes' --include=*.php . --exclude-dir=vendor
docker compose exec app grep -rnE 'defined\( *.ABSPATH' --include=*.php . --exclude-dir=vendor --exclude-dir=node_modules
docker compose exec app grep -rnE -i '(api[_-]?key|secret|password|token) *= *.[A-Za-z0-9]{12,}' --include=*.php --include=*.js --include=*.json . --exclude-dir=vendor --exclude-dir=node_modules
docker compose exec app composer audit
docker compose exec app npm audit --omit=dev --audit-level=moderate
```

Checklist:
- [ ] Uploads use `wp_handle_upload()` / `media_handle_upload()` with an allow-list of MIME types and extensions (`wp_check_filetype_and_ext()`), size limits and capability (`upload_files`); files are never stored with their original name in executable locations; no `move_uploaded_file()` with user paths
- [ ] Every PHP file reachable by URL starts with `defined( 'ABSPATH' ) || exit;`; directories holding generated files contain an `index.php` stub or a deny rule; sensitive exports are not written under `wp-content/uploads` with guessable names
- [ ] No secrets, API keys, salts or credentials in the repository; configuration comes from constants in `wp-config.php`, environment variables, or encrypted options; secrets are never printed in `WP_DEBUG` logs or REST responses
- [ ] Sensitive options are `autoload` false and not exposed via `show_in_rest` or `register_setting` in REST
- [ ] Debug output (`WP_DEBUG_DISPLAY`, `var_dump`, stack traces) never reaches visitors; error messages are generic
- [ ] Passwords and tokens use core APIs (`wp_hash_password`, `wp_generate_password`, `wp_generate_uuid4`, `random_bytes`), never `md5`, `sha1`, `rand` or `mt_rand`; comparisons use `hash_equals()`
- [ ] Dependencies are pinned in `composer.lock` / `package-lock.json`, scanned in CI (`composer audit`, `npm audit --omit=dev --audit-level=moderate`), and trusted (no abandoned packages); namespaced vendor code (Strauss or PHP-Scoper) when conflicts with other plugins are possible
- [ ] Uninstall removes personal data the plugin stored; privacy exporters and erasers are registered (`wp_privacy_personal_data_exporters` / `wp_privacy_personal_data_erasers`) when personal data is collected

**Scoring**: 4 pts (1 uploads, 1 file access and secrets, 1 configuration and cryptography, 1 dependencies and privacy).

### Step 6: WooCommerce Extension (conditional, not scored here)

If the project depends on WooCommerce (plugin header `Requires Plugins: woocommerce`, `wc_*` calls, `before_woocommerce_init` hook), also apply `.claude/skills/woocommerce/checklist.md` and report its findings in a separate section.

## OUTPUT FORMAT

```
WORDPRESS SECURITY AUDIT
========================

SCORE: XX/25

WordPress: X.Y   PHP: X.Y   Handlers: N   REST routes: N   Unprotected writes: N   Raw SQL: N   Advisories: N

SUB-SCORES:
  Authorization and nonces           : XX/7
  Sanitization and escaping          : XX/7
  Database and injection             : XX/4
  REST, AJAX, outbound requests      : XX/3
  Files, secrets, supply chain       : XX/4

STRENGTHS:
- [...]

ISSUES (by severity):
- CRITICAL: [file:line] [description] [CWE/OWASP] -> [fix]
- IMPORTANT: ...
- MINOR: ...

RECOMMENDATIONS:
1. [Action] (effort: Low/Medium/High, impact: Low/Medium/High)
2. ...
```

## IMPORTANT NOTES

- Security findings are ALWAYS top priority; a missing capability check, an injectable query or an unauthenticated write route is a release blocker
- Findings must cite `file:line` and include the corrected snippet (capability check, nonce, `prepare()`, escaper)
- Sanitize on input, escape on output: both are required, neither replaces the other
- Do not test exploits against live sites; reproduce in `wp-env`
- Map findings to OWASP Top 10:2025 (A01 access control, A03 supply chain, A05 injection, A10 exceptional conditions) when reporting
- Hosting-level hardening (server config, WAF, file permissions, Bedrock) is out of scope
