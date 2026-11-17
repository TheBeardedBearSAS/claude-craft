# Check Rust / Axum Security

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple crates or requires cross-cutting investigation.

## MISSION

Security audit of a Rust (edition 2024) / axum 0.8 service, aligned with OWASP Top 10:2025. Rust removes memory-safety bugs in safe code, but not logic, authorization, injection through `unsafe` or string-built SQL, supply-chain, or configuration flaws. Combine automated scanners (clippy, cargo-audit, cargo-deny) with targeted manual review. All commands run in Docker. Security findings are ALWAYS top priority in the consolidated report.

### Step 1: Memory Safety and Static Analysis (6 points)

```bash
docker compose exec app grep -rnE "forbid\(unsafe_code\)|unsafe_code" Cargo.toml crates src
docker compose exec app grep -rnE "\bunsafe\b" crates src
docker compose exec app cargo clippy --workspace --all-targets --all-features -- -D warnings -W clippy::unwrap_used -W clippy::expect_used -W clippy::panic -W clippy::indexing_slicing
docker compose exec app cargo geiger --all-features
```

Checklist:
- [ ] `#![forbid(unsafe_code)]` (or `unsafe_code = "forbid"` in workspace lints) is the default in every crate
- [ ] Each remaining `unsafe` block is isolated in a small module, carries a `// SAFETY:` justification, and is covered by tests (Miri where applicable)
- [ ] `clippy::unwrap_used`, `expect_used`, `panic` and `indexing_slicing` are enforced in request-path crates, so untrusted input cannot crash a worker
- [ ] A `CatchPanicLayer` or equivalent contains panics from third-party code
- [ ] Integer arithmetic on untrusted input uses checked/saturating operations; no lossy `as` casts on sizes or amounts
- [ ] Clippy security-relevant lints run in CI and fail the build

**Scoring**: 6 pts. Unjustified `unsafe` = -2 each; panic reachable from user input = -2 each (min 0); missing `forbid` without reason = -1.

### Step 2: Dependency Vulnerabilities and Supply Chain (4 points)

```bash
docker compose exec app cargo audit
docker compose exec app cargo deny check advisories bans licenses sources
docker compose exec app cargo outdated --workspace --depth 1
docker compose exec app cargo tree --workspace --duplicates | head -20
ls deny.toml .github/dependabot.yml renovate.json
docker compose exec app grep -nE "git = |path = " Cargo.toml crates/*/Cargo.toml
```

Checklist:
- [ ] `cargo audit` (RustSec advisory database) reports no vulnerabilities; each ignored advisory is documented with a mitigation and expiry
- [ ] `cargo deny check` is configured (`deny.toml`) for advisories, licenses, bans and sources, and runs in CI
- [ ] Rust toolchain and critical crates (axum, tokio, sqlx, tower-http, TLS stack) are on supported releases; yanked versions are not in `Cargo.lock`
- [ ] Dependabot or Renovate configured for `cargo`, `github-actions` and `docker`
- [ ] `Cargo.lock` committed; no git dependencies without a pinned `rev`; registries restricted to crates.io (or a vetted mirror)
- [ ] Optional: `cargo vet` or `cargo crev` for critical dependencies; build scripts and proc-macros of new crates reviewed
- [ ] Container image and OS packages scanned (Trivy or Grype) in CI; SBOM generated (CycloneDX) per build

**Scoring**: 4 pts. Critical advisory = -2, High = -1, yanked or unmaintained crate on a critical path = -1.

### Step 3: Secrets and Credentials (4 points)

```bash
git ls-files | grep -E "\.env$|\.pem$|\.key$|secrets"
docker compose exec app grep -rnEi "(api[_-]?key|secret|password|token)\s*[:=]\s*\"[A-Za-z0-9_\-]{12,}" crates src config
docker compose exec app grep -rnE "secrecy|SecretString|SecretBox" Cargo.toml crates src
docker compose exec app grep -rnE "derive\(.*Debug.*\)" crates/*/src/config* src/config*
docker compose exec app grep -rnE "println!|tracing::(info|debug|warn|error)!\(.*(password|token|secret)" crates src
```

Checklist:
- [ ] Secrets come from environment variables or a secrets manager, never from source, `Cargo.toml`, Dockerfiles or CI files; `.env` is gitignored
- [ ] Secret values are wrapped in `secrecy::SecretString` (or `SecretBox`) so `Debug`/`Display` never print them and memory is zeroized on drop
- [ ] Configuration is parsed once into a typed struct at startup and fails fast when a variable is missing
- [ ] Logs and traces never contain passwords, tokens, personal data or full request bodies (`TraceLayer` configured with care; sensitive headers marked via `SetSensitiveHeadersLayer`)
- [ ] Database URLs with credentials are never logged; error messages do not echo connection strings
- [ ] No secret baked into container layers (`ARG`/`ENV` in the Dockerfile); build secrets use BuildKit secret mounts

**Scoring**: 4 pts. Committed secret = 0 for the whole step.

### Step 4: Authentication and Authorization (4 points)

```bash
docker compose exec app grep -rnE "argon2|bcrypt|scrypt|pbkdf2|sha1|md5" Cargo.toml crates src
docker compose exec app grep -rnE "jsonwebtoken|Validation::new|Algorithm::|insecure_disable_signature_validation|validate_exp" crates src
docker compose exec app grep -rnE "FromRequestParts|from_fn_with_state|route_layer|\.layer\(" crates src
docker compose exec app grep -rnE "Path<|Query<" crates/http src/http | head -30
```

Checklist:
- [ ] Passwords hashed with Argon2id (the `argon2` crate): minimum OWASP 19 MiB / t=2 / p=1, internal recommendation 128 MiB / t>=3 / p=1; unique random salt per hash; verification in constant time; MD5 and SHA1 never; bcrypt accepted as legacy only
- [ ] Hashing runs in `spawn_blocking` (CPU-bound), never directly on an async worker
- [ ] No composition rules for passwords (NIST SP 800-63B-4); minimum length 12; no forced rotation
- [ ] JWT: EdDSA (Ed25519) preferred, then ES256; the verifier pins the algorithm explicitly (`Validation::new(Algorithm::EdDSA)`), never trusts the token `alg` header; `exp`, `nbf`, `iss` and `aud` validated; short expiry (15 min); no signature validation disabled
- [ ] Tokens kept in `HttpOnly`, `Secure`, `SameSite=Strict` cookies for browsers (never `localStorage`); CSRF protection when cookies authenticate state-changing requests
- [ ] Authentication is a Tower layer or an extractor (`FromRequestParts`), applied to the whole protected router (deny by default); public routes are the explicit exception
- [ ] Authorization checked per resource: queries filter by the authenticated owner or tenant (`WHERE id = $1 AND owner_id = $2`), never by a client-supplied id alone (IDOR)
- [ ] Multi-tenant services scope every query by tenant and have isolation tests
- [ ] Login, signup and password-reset endpoints are rate limited (`tower_governor` or a gateway) with uniform error messages

**Scoring**: 4 pts. Missing authorization on a data-returning handler = -2. IDOR pattern = -1 each. Algorithm not pinned = -2 (min 0).

### Step 5: Injection and Input Validation (4 points)

```bash
# SQL built from strings
docker compose exec app grep -rnE "format!\(.*(SELECT|INSERT|UPDATE|DELETE|WHERE|ORDER BY)" crates src
docker compose exec app grep -rnE "sqlx::query\((&?format!|[a-z_]+\))" crates src
docker compose exec app grep -rnE "push_str\(.*(WHERE|ORDER|AND)" crates src
# Command execution and path handling
docker compose exec app grep -rnE "Command::new|std::process" crates src
docker compose exec app grep -rnE "Path::new\(|PathBuf|join\(" crates src
# Body and deserialization limits
docker compose exec app grep -rnE "DefaultBodyLimit|RequestBodyLimitLayer|deny_unknown_fields" crates src
# Server-side requests to user-supplied URLs
docker compose exec app grep -rnE "reqwest::|Client::new|\.get\(.*url" crates src
```

Checklist:
- [ ] SQL uses `query!` / `query_as!` or bound parameters (`.bind()`, `QueryBuilder::push_bind`); `ORDER BY` columns and other identifiers come from an allowlist enum, never from raw input
- [ ] No `std::process::Command` with user-controlled program or a shell (`sh -c`); arguments passed as separate values
- [ ] File paths from users are canonicalized and confined to a base directory; no `..` traversal; filenames not trusted
- [ ] Request bodies bounded (`DefaultBodyLimit`, `RequestBodyLimitLayer`); upload size and content type validated
- [ ] DTOs use `#[serde(deny_unknown_fields)]` where strictness matters; validation (`validator` or `TryFrom`) runs before the use case
- [ ] Server-side requests to user-supplied URLs guarded against SSRF (scheme and host allowlist, block private and link-local ranges, redirects limited, timeouts set)
- [ ] HTML or templated output is auto-escaped (askama, maud, minijinja); no manual string-built HTML from user data
- [ ] Deserialization of untrusted data limited to bounded formats (JSON with size limits); no unbounded recursion on user input

**Scoring**: 4 pts. Each confirmed injection or traversal = -2; each SSRF-prone fetch without guard = -1; unbounded body = -1 (min 0).

### Step 6: Secure Configuration, Headers, Rate Limiting (3 points)

```bash
docker compose exec app grep -rnE "CorsLayer|allow_origin|Any|permissive" crates src
docker compose exec app grep -rnE "TimeoutLayer|ConcurrencyLimitLayer|RateLimit|tower_governor|SetResponseHeaderLayer" crates src
docker compose exec app grep -rnE "rustls|native-tls|openssl" Cargo.toml crates/*/Cargo.toml
docker compose exec app grep -rnE "RUST_LOG|log_level|debug" crates src config
docker compose exec app grep -nE "USER |FROM |HEALTHCHECK" Dockerfile
```

Checklist:
- [ ] TLS terminated by the proxy or by `rustls`; HSTS set; plaintext HTTP redirected
- [ ] CORS restricted to explicit origins, methods and headers (`CorsLayer` with a list); never `permissive()` or `Any` origin with credentials
- [ ] Security headers set through `SetResponseHeaderLayer`: `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, CSP for HTML responses, `X-Frame-Options: DENY`
- [ ] Request timeout (`TimeoutLayer`), concurrency limit and body limit configured globally; outbound calls have timeouts
- [ ] Rate limiting on authentication and expensive endpoints
- [ ] Errors are generic (RFC 9457 `problem+json`) in production: no stack traces, SQL text or internal paths; `RUST_LOG` not at `debug`/`trace` in production
- [ ] Container runs as a non-root user from a minimal image; health check present; read-only filesystem where possible
- [ ] Auth failures and permission denials are logged and alerted; logs retained >= 1 year where compliance requires

**Scoring**: 3 pts (1 transport/errors/container, 1 CORS and headers, 1 limits and rate limiting).

## OUTPUT FORMAT

```
RUST / AXUM SECURITY AUDIT
==========================

SCORE: XX/25

unsafe blocks: N   cargo-audit: N advisories   cargo-deny: pass/fail

SUB-SCORES:
  Memory safety / static analysis: XX/6
  Dependencies / supply chain   : XX/4
  Secrets and credentials       : XX/4
  Authentication / authorization: XX/4
  Injection / input validation  : XX/4
  Configuration / headers / limits: XX/3

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

## IMPORTANT NOTES

- Never print secret values in the report; cite the file and line only
- Verify every scanner hit before reporting it (advisories may not affect the features actually used)
- A confirmed exploitable finding (injection, auth bypass, committed secret) caps the overall security score at 12/25
- Do not run exploit payloads against shared or production environments
