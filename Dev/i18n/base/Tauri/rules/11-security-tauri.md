# Tauri v2 Security Guidelines

> Scope: Tauri v2 (stable 2.12). Tauri 3 (alpha) is out of scope. General rules (OWASP Top 10:2025, secrets, supply chain) are in the project-wide security rule; Rust-specific hardening in the `rust` stack. This document covers what Tauri adds.

## Trust Model

- The **WebView content is untrusted**: any script that runs in it (a compromised npm dependency, an XSS bug) can call whatever IPC the window is allowed to call
- The **Rust core is trusted** but must treat all command arguments as untrusted input
- **Capabilities** are the access-control layer: they grant permissions (with scopes) to windows/webviews. Without a capability, a window cannot invoke plugin commands or core APIs
- Security is therefore: *grant the least*, *scope what you grant*, *restrict what the WebView can load and run*, *protect the release pipeline*

## OWASP Top 10:2025 Focus Areas for This Stack

### A01:2025 - Broken Access Control: Capabilities and Permissions

Capabilities live in `src-tauri/capabilities/*.json` and are enabled by `app.security.capabilities` in `tauri.conf.json` (by default every file in the directory applies). Each capability has an `identifier`, a `description`, the `windows` it applies to and a `permissions` list.

```json
// ❌ CRITICAL: every window, broad permission sets, unreviewed
{
  "identifier": "everything",
  "windows": ["*"],
  "permissions": ["core:default", "fs:default", "shell:default", "http:default"]
}
```

```json
// ✅ SAFE: one role, only what the frontend calls
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "main-window",
  "description": "Permissions for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "http:default"
  ]
}
```

Rules:
- **One capability per window role**; target windows by label, avoid `"*"`
- Grant only permissions the frontend actually uses; review `:default` sets instead of trusting them
- Remove permissions when the feature that needed them is removed
- Use the `platforms` field for permissions needed on some targets only
- Capabilities for **remote URLs** are exceptional: narrowest URL list, read-only permissions, documented
- Capability changes get a dedicated reviewer focus (CODEOWNERS) and a snapshot test
- Custom commands that need authorization are exposed through **app permissions** (permission files), not left open to every window

### A01:2025 - Scopes: `allow` and `deny`

Permissions that touch resources accept scopes. `deny` takes precedence over `allow`.

```json
// ❌ CRITICAL: the whole home directory, read and write
{ "identifier": "fs:allow-rename", "allow": [{ "path": "$HOME/**/*" }] }
```

```json
// ✅ SAFE: app data only, secrets explicitly denied
{
  "identifier": "fs:allow-rename",
  "allow": [{ "path": "$APPDATA/notes/**" }],
  "deny": [{ "path": "$APPDATA/notes/.private/**" }]
}
```

```json
// ✅ SAFE: http limited to the API origin
{
  "identifier": "http:default",
  "allow": [{ "url": "https://api.example.com/*" }]
}
```

Rules:
- Never grant filesystem access to `$HOME/**`, drive roots or credential locations (SSH keys, browser profiles, keychains)
- Shell access (the shell plugin) only for **named, pre-declared commands** with validated argument patterns; never arbitrary executables or free-form argument strings
- HTTP: list exact origins, never `https://*`
- A global `fs:scope` applies to all fs commands: keep it as narrow as the per-command scopes
- Scopes in capabilities do **not** replace validation inside your own commands

### A05:2025 - Injection: Command Arguments, Paths, SQL, Processes

```rust
// ❌ CRITICAL: path traversal and shell string with user input
#[tauri::command]
fn export(path: String, name: String) -> String {
    std::process::Command::new("sh").arg("-c")
        .arg(format!("cp data.db {path}/{name}")).output().unwrap();
    "ok".into()
}
```

```rust
// ✅ SAFE: validated name, resolved against an allowed root, no shell
#[tauri::command]
fn export(app: tauri::AppHandle, name: String) -> Result<(), Error> {
    use tauri::Manager;
    let name = validate_file_name(&name)?;            // letters, digits, '-', '_', bounded length
    let dir = app.path().app_data_dir().map_err(Error::from)?;
    std::fs::copy(dir.join("data.db"), dir.join("exports").join(name))?;
    Ok(())
}
```

Rules:
- Validate length, range, enum membership and path containment in Rust, whatever the UI does
- Canonicalize paths and check they stay under an allowed root; reject `..` and absolute paths from the UI
- Spawn processes with separate arguments, never a shell string with user data
- SQL (plugin or crate) uses bound parameters only
- Deep links, custom URL schemes and file associations are untrusted input
- XSS is privilege escalation here: avoid `innerHTML`, `v-html`, `dangerouslySetInnerHTML`, `{@html}` on untrusted data

### A02:2025 - Security Misconfiguration: CSP, Isolation, Global API

**CSP** is set in `app.security.csp`; Tauri injects nonces and hashes for its own scripts and styles at compile time.

```json
// ❌ csp: null disables protection
{ "app": { "security": { "csp": null } } }
```

```json
// ✅ restrictive baseline, adapted per app
{
  "app": {
    "security": {
      "csp": "default-src 'self'; connect-src ipc: http://ipc.localhost https://api.example.com; img-src 'self' data:",
      "pattern": { "use": "isolation", "options": { "dir": "../dist-isolation" } }
    }
  }
}
```

Rules:
- `default-src 'self'` baseline, explicit `connect-src` (keep `ipc:` and `http://ipc.localhost` for IPC), no `unsafe-eval`, no `*` origins; `unsafe-inline` only when a framework forces it, documented
- Keep `devCsp` differences out of production
- **Isolation pattern** (`app.security.pattern` set to `isolation` with a `dir`): an isolation application intercepts and can validate/modify IPC messages before they reach the core. Enable it for apps with many frontend dependencies; keep the isolation script tiny and dependency-free
- **`app.withGlobalTauri` stays `false`**: it exposes the Tauri API on `window.__TAURI__` for any script (including injected ones). Use `@tauri-apps/api` imports through the bundler instead; enable only for no-bundler setups with a documented reason
- Restrict the asset protocol scope if enabled; never serve arbitrary local paths
- Do not load remote content in a privileged window; restrict navigation to expected origins
- Release configuration has no devtools, no debug-only plugins (WebDriver, test helpers) and no verbose logging

### A03:2025 - Software Supply Chain Failures

- The frontend dependency tree runs inside the WebView with the window's permissions: audit it like server code (`npm audit --omit=dev --audit-level=moderate`, lockfile committed, `npm ci`)
- Rust: `cargo audit` and `cargo deny check` (advisories, bans, licenses, sources) in CI
- Third-party and community plugins: review maintainer, activity and the permissions they request before adopting; official plugins (updater, shell, http, sql, single-instance, ...) track Tauri 2.x releases
- Pin CI actions (version or SHA); Dependabot or Renovate for `cargo`, `npm`, `github-actions`
- SBOM (CycloneDX) per release; sign artifacts (Sigstore recommended)

### A08:2025 - Software or Data Integrity Failures: Updater and Code Signing

- **Updater signatures are mandatory and cannot be disabled**: the app verifies every update against the public key in `tauri.conf.json`
- Generate the keypair once: `tauri signer generate -w ~/.tauri/myapp.key`
- **The private key is never committed**: keep it in a secret manager and the CI secret store (for example `TAURI_SIGNING_PRIVATE_KEY`), with a secure offline backup. **Losing it means no further updates can ever be delivered** to installed apps
- Updater endpoints use HTTPS only
- OS code signing: Windows certificate, macOS signing and notarization, Android keystore, iOS via the Apple Developer Program (bundle identifier, certificate, provisioning profile). None of these files are in the repository
- Releases come from CI (`tauri-apps/tauri-action`), not developer laptops

```bash
# ❌ never
git add ~/.tauri/myapp.key
# ✅ store as CI secret, reference by name only
```

### A04:2025 - Cryptographic Failures and Secrets

- Anything in the frontend bundle or the Rust binary is extractable: **no API secrets in the app**. A client-side env prefix (Vite's `VITE_*`) is public
- User secrets (tokens, passwords) go to the OS credential store or an encrypted store, never `localStorage` or plain files
- Use HTTPS for every network call; pin trust to expected hosts via HTTP permission scopes
- Passwords, if handled locally: Argon2id (see the global security rule)

### A07:2025 - Authentication Failures

- Authenticate users against a backend; the app holds short-lived tokens, refreshed securely, stored in the credential store
- OAuth flows use PKCE and the system browser or a deep-link redirect; never embed client secrets
- Lock or re-authenticate before sensitive local actions when the threat model requires it

### A09:2025 / A10:2025 - Logging and Exceptional Conditions

- Log privileged actions (file export, update install, permission-gated operations); never log tokens, secrets or full user documents
- Commands return typed errors with safe messages; internal details (paths, SQL, OS errors) are logged on the Rust side only
- No `panic!` / `unwrap()` reachable from the UI: a panic must not be the error channel

## Pre-Release Security Checklist

- [ ] Each capability: least privilege, window-scoped, unused permissions removed
- [ ] All fs/shell/http scopes narrow; `deny` covers sensitive paths
- [ ] `csp` set and restrictive; `withGlobalTauri` false; Isolation considered or enabled
- [ ] No untrusted HTML injection; navigation restricted
- [ ] Command arguments validated in Rust; no shell strings, no string-built SQL
- [ ] Updater public key set, private key only in the secret store, backup verified
- [ ] OS code signing configured; no certificates/keys in the repository
- [ ] `cargo audit`, `cargo deny`, `npm audit` clean; plugins reviewed
- [ ] Debug features, devtools and test plugins absent from the release build
- [ ] Signed build smoke-tested on each target OS
