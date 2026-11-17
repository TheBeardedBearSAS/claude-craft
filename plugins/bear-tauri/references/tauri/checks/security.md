# Check Tauri v2 Security

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans both the Rust core and the web frontend, or requires cross-cutting investigation.

## MISSION

Security audit of a Tauri v2 application (stable line 2.12), aligned with OWASP Top 10:2025. Tauri's trust model: the WebView is untrusted code that can only reach the Rust core through IPC, and **capabilities** (permissions plus scopes, bound to windows) decide what it may call. The audit therefore centers on least privilege: capabilities, scopes, CSP, the Isolation pattern, updater signing and secrets. Rust removes memory-safety bugs in safe code, not authorization, path-traversal, injection or supply-chain flaws. Security findings are ALWAYS top priority in the consolidated report.

All commands run in Docker (`docker compose exec app ...`).

### Step 1: Capabilities and Permissions (7 points)

```bash
docker compose exec app ls src-tauri/capabilities
docker compose exec app sh -c 'cat src-tauri/capabilities/*.json'
docker compose exec app grep -nE "\"capabilities\"|\"security\"" src-tauri/tauri.conf.json
docker compose exec app grep -rnE "\"windows\"|\"webviews\"|\"platforms\"|\"remote\"" src-tauri/capabilities
docker compose exec app grep -rnE ":default\"|\"core:default\"|\"[a-z-]+:allow-" src-tauri/capabilities
```

Checklist:
- [ ] Capabilities live in `src-tauri/capabilities/*.json` and are enabled explicitly (all files in the directory are enabled by default unless `app.security.capabilities` lists identifiers)
- [ ] One capability per window or role, each with `identifier`, `description`, `windows` (or `webviews`) and a minimal `permissions` list; no catch-all capability granting everything to every window (`"windows": ["*"]` needs a documented reason)
- [ ] Only the permissions the frontend actually calls are granted; plugin `:default` sets are reviewed instead of trusted, and unused permissions are removed
- [ ] Platform restrictions (`platforms`) applied when a permission is needed on only some targets
- [ ] No `remote` capability (granting IPC access to remote URLs) unless unavoidable, in which case the URL list is as narrow as possible and the permissions read-only
- [ ] Custom commands needing authorization are exposed through app permissions (permission files), not left open to every window
- [ ] Capability changes are reviewed like code: the diff in `capabilities/` is a required reviewer focus in PRs

**Scoring**: 7 pts. Broad all-window capability = -2, unused powerful permission (fs, shell, http, process) = -1 each, remote capability without justification = -2 (min 0).

### Step 2: Scopes for Files, Shell and Network (4 points)

```bash
docker compose exec app grep -rnE "\"(fs|shell|http|opener|dialog|process|os)[:a-z-]*\"" src-tauri/capabilities
docker compose exec app grep -rnE "\"allow\"|\"deny\"|\"path\"|\"url\"|\"cmd\"|\"args\"" src-tauri/capabilities
docker compose exec app grep -rnE "\\$HOME/\*\*|\"/\*\*\"|\"\*\*\"|\\$APPDATA/\*\*" src-tauri/capabilities
docker compose exec app grep -rnE "Command::new|\.shell\(\)|std::process::Command" src-tauri/src
```

Checklist:
- [ ] Filesystem permissions are scoped with `allow` entries to app-specific directories (for example `$APPDATA`, `$APPCONFIG`), never the whole home directory or the disk root; sensitive paths (SSH keys, browser profiles, credentials) are covered by `deny`, which takes precedence over `allow`
- [ ] Shell access (if any) allows only named, pre-declared commands with validated argument patterns; no arbitrary executable or unrestricted argument strings
- [ ] HTTP permissions list specific origins (`allow: [{ "url": "https://api.example.com/*" }]`), not `https://*` or `http://*`
- [ ] Opening URLs or paths from untrusted content is restricted to expected schemes and hosts
- [ ] Rust commands that touch the filesystem or spawn processes validate and canonicalize their inputs themselves (paths stay inside an allowed root; no `..` escapes; no shell string concatenation)
- [ ] Dangerous powers (process spawning, full-disk access, arbitrary URL fetch) are absent unless the product genuinely needs them

**Scoring**: 4 pts. Unscoped fs/shell/http = -2 each, home or root wide scope = -1, unvalidated path or command argument in a Rust command = -1 each.

### Step 3: CSP, Isolation and Global API (4 points)

```bash
docker compose exec app grep -nE "\"csp\"|\"devCsp\"|\"pattern\"|\"isolation\"|withGlobalTauri|dangerous|freezePrototype|assetProtocol" src-tauri/tauri.conf.json
docker compose exec app grep -rnE "unsafe-inline|unsafe-eval|\*\s|http:" src-tauri/tauri.conf.json
docker compose exec app grep -rnE "dangerouslySetInnerHTML|v-html|innerHTML|\{@html" src
```

Checklist:
- [ ] `app.security.csp` is set (not `null`) and restrictive: `default-src 'self'` as the base, explicit `connect-src` for the IPC and allowed APIs, no `unsafe-eval`, no broad wildcards (Tauri adds nonces and hashes for its own scripts and styles at compile time)
- [ ] `unsafe-inline` appears only where a framework requires it and is documented; `devCsp` differences do not leak into production
- [ ] The Isolation pattern (`app.security.pattern: { "use": "isolation", "options": { "dir": "..." } }`) is enabled when the frontend loads many third-party dependencies, so IPC messages are intercepted and validated before reaching the core; the isolation application is minimal
- [ ] `app.withGlobalTauri` is `false` (the default); the global `window.__TAURI__` is exposed only when no bundler is used and the need is documented, since it widens the reach of any injected script
- [ ] The asset protocol, if enabled, has a narrow scope
- [ ] The frontend avoids raw HTML injection (`innerHTML`, `v-html`, `dangerouslySetInnerHTML`, `{@html}`) on untrusted data; XSS in a WebView with permissions equals privileged code execution
- [ ] Navigation and new-window handling restrict where the WebView can go (no loading arbitrary remote content in a privileged window)

**Scoring**: 4 pts (1.5 CSP, 1 Isolation, 0.5 global API, 1 XSS and navigation hygiene).

### Step 4: Updater, Signing and Secrets (4 points)

```bash
git ls-files | grep -E "\.key$|\.pem$|\.env$|\.p12$|\.keystore$|\.mobileprovision$|secrets"
docker compose exec app grep -nE "\"updater\"|\"pubkey\"|\"endpoints\"|createUpdaterArtifacts" src-tauri/tauri.conf.json
docker compose exec app grep -rnE "TAURI_SIGNING_PRIVATE_KEY|APPLE_|WINDOWS_CERTIFICATE" .github/workflows
docker compose exec app grep -rnEi "(api[_-]?key|secret|password|token)\s*[:=]\s*[\"'][A-Za-z0-9_\-]{12,}" src src-tauri/src
docker compose exec app grep -rnE "VITE_[A-Z_]*(SECRET|KEY|TOKEN)" src .env.example
```

Checklist:
- [ ] If the updater plugin is used: update signatures are mandatory and cannot be disabled; the public key is in `tauri.conf.json` and the update endpoints use HTTPS
- [ ] The updater private key (generated with `tauri signer generate`) is NEVER committed; it lives in a secret store or CI secret (for example `TAURI_SIGNING_PRIVATE_KEY`) and is backed up securely, because losing it means existing installs can no longer be updated
- [ ] Release builds are produced by CI (`tauri-apps/tauri-action`) with signing secrets injected from the CI secret store, not from developer machines
- [ ] OS code signing is configured per platform (Windows certificate, macOS signing and notarization, iOS Apple Developer Program certificate and provisioning profile, Android keystore); certificates and profiles are not in the repository
- [ ] No secret is bundled into the app: anything in the frontend bundle or the Rust binary is extractable; build-time variables exposed to the client (for example Vite's `VITE_*` prefix) hold no secrets
- [ ] User secrets (tokens, credentials) go to the OS credential store or an encrypted store plugin, not to plain files or `localStorage`
- [ ] Debug builds, devtools and verbose logging are not enabled in release configurations

**Scoring**: 4 pts. A committed private key or secret = -4 and caps the axis (see notes); missing updater signature verification = -2; unsigned release pipeline = -1.

### Step 5: Command Input Validation and Injection (3 points)

```bash
docker compose exec app grep -rnE "#\[tauri::command" -A6 src-tauri/src
docker compose exec app grep -rnE "format!\(.*(SELECT|INSERT|UPDATE|DELETE)" src-tauri/src
docker compose exec app grep -rnE "Command::new\(|\.arg\(|sh -c|cmd /c|powershell" src-tauri/src
docker compose exec app grep -rnE "eval\(|new Function\(|\.emit\(.*(window|payload)" src
```

Checklist:
- [ ] Every command treats its arguments as untrusted: lengths, ranges, enums and paths are validated in Rust, regardless of frontend checks
- [ ] SQL (through `tauri-plugin-sql`, sqlx or rusqlite) uses bound parameters; no string-built queries
- [ ] Process spawning passes arguments as separate items, never through a shell string with user input
- [ ] Commands that perform privileged actions check the caller (window label or webview) when the capability model alone is not enough
- [ ] Payloads emitted to the frontend never include secrets or unnecessary personal data; event payloads received from the frontend are validated
- [ ] Deep links, custom URL schemes and file associations are treated as untrusted input and parsed defensively

**Scoring**: 3 pts. Injection reachable from the UI = -2 each (min 0).

### Step 6: Dependencies and Supply Chain (3 points)

```bash
docker compose exec app sh -c 'cd src-tauri && cargo audit'
docker compose exec app sh -c 'cd src-tauri && cargo deny check advisories bans licenses sources'
docker compose exec app npm audit --omit=dev --audit-level=moderate
ls src-tauri/deny.toml deny.toml .github/dependabot.yml renovate.json
docker compose exec app grep -nE "^tauri |tauri-plugin-|git = |path = " src-tauri/Cargo.toml
```

Checklist:
- [ ] `cargo audit` and `cargo deny check` pass in CI; ignored advisories are documented with a mitigation and expiry
- [ ] `npm audit --omit=dev --audit-level=moderate` (or the package manager equivalent) passes; lockfiles committed
- [ ] `tauri`, `@tauri-apps/cli`, `@tauri-apps/api` and official plugins are on supported 2.x releases; no known-vulnerable or yanked versions in `Cargo.lock`
- [ ] Community plugins and third-party crates are reviewed (maintainer, activity, requested permissions) before adoption; git dependencies are pinned to a `rev`
- [ ] Dependabot or Renovate covers `cargo`, `npm` and `github-actions`; CI actions are pinned
- [ ] An SBOM (CycloneDX) is generated per release build; signing artifacts with Sigstore is recommended

**Scoring**: 3 pts. Critical advisory = -2, High = -1, unreviewed community plugin with broad permissions = -1.

## OUTPUT FORMAT

```
TAURI v2 SECURITY AUDIT
=======================

SCORE: XX/25

Tauri: X.Y   Capabilities: N files   Windows: N   Isolation: yes/no   CSP: set/null   Updater signed: yes/no/n.a.

SUB-SCORES:
  Capabilities and permissions     : XX/7
  Scopes (fs / shell / http)       : XX/4
  CSP, Isolation, global API       : XX/4
  Updater, signing, secrets        : XX/4
  Input validation / injection     : XX/3
  Dependencies / supply chain      : XX/3

STRENGTHS:
- [...]

VULNERABILITIES (by severity):
- CRITICAL: [OWASP category] [file:line] [description] -> [fix]
- HIGH: ...
- MEDIUM: ...
- LOW: ...

RECOMMENDATIONS:
1. [Action] (effort, impact)
```

## OWASP Top 10:2025 Mapping

| Category | Where it shows up in Tauri |
|----------|----------------------------|
| A01 Broken Access Control | Over-broad capabilities, all-window grants, remote capabilities, unscoped fs/shell/http |
| A02 Security Misconfiguration | `csp: null`, `withGlobalTauri` enabled, devtools or debug settings in release, permissive asset protocol |
| A03 Software Supply Chain Failures | Unvetted plugins and crates, unpinned CI actions, missing audit and SBOM |
| A04 Cryptographic Failures | Secrets stored in plain files, plain-HTTP update endpoints, lost or leaked signing keys |
| A05 Injection | String-built SQL, shell strings, XSS in the WebView |
| A07 Authentication Failures | Tokens kept in `localStorage`, missing OS credential store |
| A08 Software or Data Integrity Failures | Updater without signature verification, unsigned releases |
| A09 Security Logging and Alerting Failures | Sensitive data in logs, no audit of privileged actions |
| A10 Mishandling of Exceptional Conditions | Panics in commands, internal errors serialized to the UI |

## IMPORTANT NOTES

- Never print secret values in the report; cite the file and line only
- Verify every scanner hit before reporting it (advisories may not affect the features actually used)
- A confirmed exploitable finding (committed signing key, shell or fs access reachable from untrusted content, injection) caps the overall security score at 12/25
- Do not run exploit payloads against shared or production environments, and never execute release or signing steps during an audit
