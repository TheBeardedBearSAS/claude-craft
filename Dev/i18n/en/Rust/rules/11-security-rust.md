# Rust / Axum Security Best Practices

Security is a top priority. References: **OWASP Top 10:2025**, OWASP ASVS 5.0, RustSec advisories. Rust removes whole classes of memory-safety bugs, but not logic flaws, injection, broken access control or supply-chain risk. cargo-deny and cargo-audit run on every CI build.

> Commands run in the container: `docker compose exec app cargo deny check`, `docker compose exec app cargo audit`.

## OWASP Top 10:2025 in Rust / Axum

| # | Category | Rust / Axum defense |
|---|----------|---------------------|
| A01 | Broken Access Control (incl. SSRF) | Scope every query by the authenticated principal, typed auth extractor, deny by default, allow-list outbound hosts |
| A02 | Security Misconfiguration | Security headers layer, explicit CORS origins, TLS at the edge, generic error bodies, no debug endpoints |
| A03 | Software Supply Chain Failures | `Cargo.lock` committed, cargo-deny, cargo-audit, cargo-vet, SBOM (cargo-cyclonedx), pinned CI actions |
| A04 | Cryptographic Failures | Argon2id, EdDSA JWT, `rustls`, `secrecy`, OS CSPRNG (`OsRng`), no home-made crypto |
| A05 | Injection | SQLx bind parameters, typed deserialization, validation (validator / garde), no shell interpolation |
| A06 | Insecure Design | Threat modelling, rate limiting, body limits, timeouts, least privilege |
| A07 | Authentication Failures | Argon2id, MFA, brute-force limits (tower_governor), short-lived tokens, session invalidation |
| A08 | Software or Data Integrity Failures | Verified signatures, `deny_unknown_fields`, signed images and artifacts, no unsafe deserialization of untrusted formats |
| A09 | Security Logging and Alerting Failures | `tracing` with request IDs, redaction of secrets, audit events, centralised alerts |
| A10 | Mishandling of Exceptional Conditions | `Result` everywhere, no panics on request paths, `AppError` with generic bodies, fail closed |

---

## Memory Safety and `unsafe`

```rust
#![forbid(unsafe_code)]
```

- Forbid `unsafe` in application crates via `[workspace.lints.rust] unsafe_code = "forbid"`
- A panic is a denial-of-service primitive: no `unwrap()` / `expect()` / indexing on request paths (`clippy::unwrap_used = "deny"`)
- Integer overflow wraps in release builds: use `checked_*` / `saturating_*` arithmetic for money and quantities, or enable `overflow-checks = true` in the release profile
- `cargo geiger` (or `cargo tree`) shows `unsafe` in dependencies; prefer well-audited crates

---

## A01: Broken Access Control

### Scope Every Query by the Principal

```rust
// BAD: insecure direct object reference
async fn show(State(s): State<AppState>, Path(id): Path<Uuid>) -> Result<Json<Order>, AppError> {
    Ok(Json(s.orders.find(id).await?.ok_or(AppError::NotFound)?))
}

// GOOD: only the caller's orders can be found
async fn show(
    State(s): State<AppState>,
    auth: AuthenticatedUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Order>, AppError> {
    let order = s.orders.find_for_user(id, auth.user_id).await?.ok_or(AppError::NotFound)?;
    Ok(Json(order))
}
```

Returning `404` for records owned by someone else avoids leaking existence.

### Typed Authentication and Authorization

- Protected handlers declare an `AuthenticatedUser` extractor; a route without it is public by construction, so review every public route
- Role checks through a typed extractor or a policy function, never a role string from the request body
- Never accept `role`, `is_admin` or `user_id` from client payloads: DTOs are separate from domain types and omit privileged fields
- Deny by default: apply an auth layer to the whole protected router and mount public routes separately

### SSRF

```rust
// BAD: user-controlled URL fetched server-side
let body = reqwest::get(&params.url).await?.text().await?;

// GOOD: allow-list, https only, no redirects, timeouts
const ALLOWED_HOSTS: &[&str] = &["api.partner.example"];

fn validate_target(raw: &str) -> Result<Url, AppError> {
    let url = Url::parse(raw).map_err(|_| AppError::Validation(vec![]))?;
    if url.scheme() != "https" || !url.host_str().is_some_and(|h| ALLOWED_HOSTS.contains(&h)) {
        return Err(AppError::Validation(vec![]));
    }
    Ok(url)
}

let client = reqwest::Client::builder()
    .redirect(reqwest::redirect::Policy::none())
    .timeout(Duration::from_secs(5))
    .build()?;
```

When hosts cannot be allow-listed, resolve DNS yourself and reject loopback, link-local (including cloud metadata addresses) and private ranges, then connect to the resolved address.

### Open Redirects

Redirect only to relative paths or allow-listed origins; never `Redirect::to(&query.next)` unchecked.

---

## A05: Injection

### SQL: Bind Parameters Only

```rust
// BAD: string building (SQL injection)
sqlx::query(&format!("SELECT * FROM users WHERE email = '{email}'"));

// GOOD: bind parameters
sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
    .bind(email)
    .fetch_optional(&pool)
    .await?;

// GOOD: compile-time checked
sqlx::query_as!(User, "SELECT id, email FROM users WHERE email = $1", email)
    .fetch_optional(&pool)
    .await?;
```

sqlx 0.9 makes the `query*()` functions take `impl SqlSafeStr`: string literals pass, runtime `String`s must be wrapped in `AssertSqlSafe(...)`. That wrapper is an explicit promise that the string contains no untrusted data; **grep for `AssertSqlSafe` in review** and never wrap user input.

### Dynamic Identifiers (ORDER BY, columns)

Bind parameters cannot carry identifiers. Map user choices to a closed enum:

```rust
#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
enum SortColumn { CreatedAt, Total }

impl SortColumn {
    fn as_sql(&self) -> &'static str {
        match self { Self::CreatedAt => "created_at", Self::Total => "total_cents" }
    }
}
```

Build the final query from `&'static str` values only, or use `sqlx::QueryBuilder` with `push_bind` for values.

### Commands, Paths and Templates

- Avoid `std::process::Command` with user input; pass arguments as separate items (never through `sh -c`)
- Path parameters: canonicalize and verify the prefix, reject `..`, or use opaque IDs instead of file names
- HTML output: use an auto-escaping template engine (askama, minijinja, maud); never concatenate user input into HTML

---

## Input Validation

```rust
use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct CreateUserRequest {
    #[validate(email, length(max = 254))]
    pub email: String,
    #[validate(length(min = 12, max = 128))]
    pub password: String,
}

pub async fn register(Json(body): Json<CreateUserRequest>) -> Result<StatusCode, AppError> {
    body.validate().map_err(AppError::from)?;
    // ...
    Ok(StatusCode::CREATED)
}
```

- Use `validator` (0.21.0) or `garde` (0.23.0) declaratively, or hand-written newtype constructors (`EmailAddress::parse`); parse once at the boundary
- `#[serde(deny_unknown_fields)]` for strict DTOs; separate DTOs per use case to prevent mass assignment
- Limit sizes: `RequestBodyLimitLayer`, `DefaultBodyLimit`, string `max` lengths, pagination caps (`limit <= 100`)
- Wrap `Json` in an extractor that maps malformed-body rejections to the problem+json format without echoing internals
- Passwords: minimum 15 characters (single-factor; 8 with MFA), allow any printable character, no composition rules, no periodic rotation (NIST SP 800-63B-4)

---

## A04: Cryptography and Passwords

### Password Hashing: Argon2id

```rust
use argon2::{Algorithm, Argon2, Params, Version};

// OWASP minimum: 19 MiB (19_456 KiB), t=2, p=1
// Internal recommendation: 128 MiB (131_072 KiB), t>=3, p=1 (t=4 for high security)
pub fn hasher() -> Result<Argon2<'static>, argon2::Error> {
    let params = Params::new(131_072, 3, 1, None)?; // m_cost in KiB, t_cost, p_cost
    Ok(Argon2::new(Algorithm::Argon2id, Version::V0x13, params))
}
```

- Argon2id is recommended for all new code; never MD5, SHA-1 or a bare SHA-256; bcrypt is legacy-acceptable only where Argon2id is unavailable (cost >= 12, 72-byte input cap)
- Memory is the main lever: size parameters against your latency budget (target a few hundred milliseconds per hash on production hardware)
- Hashing is CPU and memory intensive: run it in `tokio::task::spawn_blocking`, never directly on the async executor
- Store the PHC string (`$argon2id$v=19$m=...`), which embeds parameters and salt; on login, rehash when parameters are outdated
- Salt generation, `hash_password` and `verify_password` signatures changed across `argon2` / `password-hash` releases (argon2 0.6.0 is current): follow the docs.rs page of the installed version rather than copying older snippets
- Compare secrets in constant time (`subtle::ConstantTimeEq`), never with `==`

### Randomness

Use the operating system CSPRNG (`rand::rngs::OsRng` / `getrandom`) for tokens, salts and API keys; never `rand::thread_rng` seeded by time, never `fastrand` for secrets. Generate at least 128 bits for session or reset tokens and store only their hash.

### TLS

Terminate TLS at the reverse proxy or load balancer, or use `rustls` in-process (`axum-server` with rustls). Prefer `rustls` over native OpenSSL for outbound clients (`reqwest` rustls feature, SQLx rustls feature). Require TLS 1.2 minimum, TLS 1.3 preferred.

---

## A07: Authentication

### JWT: EdDSA with Pinned Algorithm

```rust
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};

pub fn issue(claims: &Claims, private_pem: &[u8]) -> Result<String, jsonwebtoken::errors::Error> {
    let key = EncodingKey::from_ed_pem(private_pem)?;
    encode(&Header::new(Algorithm::EdDSA), claims, &key)
}

pub fn verify(token: &str, public_pem: &[u8]) -> Result<Claims, jsonwebtoken::errors::Error> {
    let key = DecodingKey::from_ed_pem(public_pem)?;
    let mut validation = Validation::new(Algorithm::EdDSA); // algorithm pinned by the verifier
    validation.set_issuer(&["https://auth.example.com"]);
    validation.set_audience(&["my-api"]);
    validation.set_required_spec_claims(&["exp", "iss", "aud", "sub"]);
    validation.leeway = 5;
    Ok(decode::<Claims>(token, &key, &validation)?.claims)
}
```

- **EdDSA (Ed25519) first choice**, ES256 next, RS256 less preferred (acceptable when the identity provider imposes it)
- `Validation::new(Algorithm::EdDSA)` restricts accepted algorithms: never read `alg` from the token header to choose the key or algorithm (algorithm confusion)
- Short expiry (15 minutes), refresh tokens rotated and stored hashed; DPoP (RFC 9449) for sensitive tokens
- Validate `iss`, `aud`, `exp`; keep leeway small
- jsonwebtoken 11 requires exactly one crypto-provider feature (`rust_crypto` or `aws_lc_rs`) to be enabled, otherwise `encode` / `decode` panic at runtime: enable one in `Cargo.toml` and cover it with a test (version 11.1.0 on crates.io; confirm feature names in its documentation)
- Private keys come from the secret store, never the repository; rotate with a `kid` and a JWKS endpoint

### Sessions and Cookies

Prefer HTTP-only cookies over `localStorage` for browser sessions:

```rust
// Set-Cookie: session=<opaque>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800
```

- `HttpOnly`, `Secure`, `SameSite=Strict` (or `Lax` when cross-site navigation is required), expiry 15-30 minutes idle
- Use `axum-extra` `CookieJar` (`PrivateCookieJar` / `SignedCookieJar` for tamper protection) with a key from the secret store
- Invalidate server-side on logout and password change; state-changing requests with cookie auth need CSRF protection (SameSite plus an origin check or token)

### Brute-force Protection: tower_governor

```rust
use std::sync::Arc;
use tower_governor::{governor::GovernorConfigBuilder, GovernorLayer};

let login_limit = Arc::new(
    GovernorConfigBuilder::default()
        .per_second(6)      // one element replenished every 6 seconds
        .burst_size(5)      // 5 attempts per key before blocking
        .finish()
        .expect("non-zero rate limit configuration"),
);

let auth_routes = Router::new()
    .route("/login", post(login))
    .layer(GovernorLayer::new(login_limit));

// The default key extractor uses the peer IP: serve with connect info
axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await?;
```

- Behind a reverse proxy the peer IP is the proxy: use a key extractor reading the trusted forwarding header only when the proxy overwrites it, otherwise limits are bypassable or shared by everyone
- Rate-limit per account as well as per IP for credential stuffing; return identical errors for unknown user and wrong password
- Periodically evict stale keys (`retain_recent`) in a background task; limiter state is in memory and per instance, use a shared store for multi-replica deployments
- Verify the API against the installed `tower_governor` version (0.8.0 at the time of writing)

---

## A02: Secure Configuration

### Secrets: `secrecy`

```rust
use secrecy::{ExposeSecret, SecretString};

#[derive(Clone)]
pub struct Config {
    pub database_url: SecretString,
    pub cookie_key: SecretString,
}

let pool = PgPoolOptions::new().connect(config.database_url.expose_secret()).await?;
```

- `SecretString` / `SecretBox` redact `Debug` output and zeroize memory on drop; call `expose_secret()` only at the point of use
- Never log request bodies or headers wholesale: redact `Authorization`, `Cookie` and password fields (`TraceLayer` with `SensitiveRequestHeadersLayer` from tower-http)
- Secrets from environment variables, Docker/Compose secrets or Vault; never in the repository, image layers or `.env` committed to git
- Scan history with gitleaks or trufflehog in CI

### Security Headers

```rust
use axum::http::{header, HeaderValue};
use tower_http::set_header::SetResponseHeaderLayer;

let headers = tower::ServiceBuilder::new()
    .layer(SetResponseHeaderLayer::overriding(
        header::STRICT_TRANSPORT_SECURITY,
        HeaderValue::from_static("max-age=63072000; includeSubDomains"),
    ))
    .layer(SetResponseHeaderLayer::overriding(
        header::X_CONTENT_TYPE_OPTIONS,
        HeaderValue::from_static("nosniff"),
    ))
    .layer(SetResponseHeaderLayer::overriding(
        header::X_FRAME_OPTIONS,
        HeaderValue::from_static("DENY"),
    ))
    .layer(SetResponseHeaderLayer::overriding(
        header::CONTENT_SECURITY_POLICY,
        HeaderValue::from_static("default-src 'none'; frame-ancestors 'none'"),
    ))
    .layer(SetResponseHeaderLayer::overriding(
        header::REFERRER_POLICY,
        HeaderValue::from_static("no-referrer"),
    ));
```

For a JSON API a restrictive `Content-Security-Policy` of `default-src 'none'` is appropriate; for HTML responses use a tailored CSP Level 3 policy. Also set `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` and a granular `Permissions-Policy`. HSTS is only meaningful over HTTPS (set it at the TLS terminator if that is where TLS ends).

### CORS

```rust
use tower_http::cors::{AllowOrigin, CorsLayer};

let cors = CorsLayer::new()
    .allow_origin(AllowOrigin::exact(HeaderValue::from_static("https://app.example.com")))
    .allow_methods([Method::GET, Method::POST])
    .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
    .max_age(Duration::from_secs(600));
```

Explicit origins only; wildcard origins cannot be combined with credentials and should not be used for authenticated APIs.

### Resource Limits

- `RequestBodyLimitLayer` (default 1 MiB for JSON), per-route larger limits for uploads
- `TimeoutLayer` on every request, timeouts on every outbound client and database acquire
- Bounded concurrency (`tower::limit::ConcurrencyLimitLayer`) and bounded queues to avoid memory exhaustion
- File uploads: validate content type by magic bytes, cap size, store outside the web root, generate server-side names

---

## A03: Supply Chain

| Control | Tool / practice |
|---------|-----------------|
| Reproducible builds | `Cargo.lock` committed, `cargo build --locked` in CI and Docker |
| Advisories | `cargo deny check advisories` + scheduled `cargo audit` (RustSec) |
| Licenses, bans, sources | `cargo deny check licenses bans sources` (crates.io only) |
| Human audits | `cargo vet` with trusted imports |
| SBOM | `cargo cyclonedx --format json` (CycloneDX) on every release build |
| Signing and provenance | Sign images and the SBOM with cosign (Sigstore keyless), SLSA provenance from CI |
| Dependency updates | Dependabot or Renovate, review changelogs; `cargo update -p <crate>` for targeted bumps |
| Build scripts and proc macros | They run arbitrary code at build time: review new `build.rs` and proc-macro dependencies, build in an isolated CI runner |
| Typosquatting | Check crate names, owners and download counts before adding a dependency |
| Yanked releases | `yanked = "deny"` in `deny.toml` (for example tokio 1.54.0 was yanked, 1.54.1 is the fix) |

Pin third-party CI actions to commit SHAs, and publish artifacts with provenance where possible (SLSA L1 is realistic; do not over-claim L2/L3).

---

## A09: Logging and Monitoring

```rust
use tower_http::trace::TraceLayer;

let app = Router::new()
    // ...
    .layer(TraceLayer::new_for_http()); // spans per request with method, URI, status, latency
```

- Structured JSON logs through `tracing-subscriber`, a request ID propagated (tower-http `SetRequestIdLayer` / `PropagateRequestIdLayer`)
- Log authentication events, permission denials, sensitive data access, rate-limit hits and validation anomalies
- Never log passwords, tokens, full personal data, SQL with parameter values, or stack traces in client responses
- Retain logs for at least one year for compliance; alert on repeated authentication failures and off-hours access

## A10: Exceptional Conditions

- Handlers return `Result<_, AppError>`; `AppError` logs the cause with `tracing::error!` and returns a generic RFC 9457 body
- Add `tower_http::catch_panic::CatchPanicLayer` as a last line of defence to turn a panic into a generic 500 rather than a dropped connection; it does not replace removing `unwrap()`
- Fail closed: when authentication or authorization cannot be determined, deny
- Shut down gracefully and drain in-flight requests; handle `SIGTERM`

---

## Sources

- OWASP Top 10:2025: https://owasp.org/Top10/2025/
- OWASP Password Storage Cheat Sheet (Argon2id minimum 19 MiB / t=2 / p=1): https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- RFC 9457 (Problem Details), RFC 9449 (DPoP): https://www.rfc-editor.org/rfc/rfc9457
- RustSec: https://rustsec.org/ ; cargo-deny: https://embarkstudios.github.io/cargo-deny/
- sqlx 0.9.0 changelog (`SqlSafeStr` / `AssertSqlSafe`): https://github.com/launchbadge/sqlx/blob/main/CHANGELOG.md
- Crate versions (crates.io): argon2 0.6.0, jsonwebtoken 11.1.0, secrecy 0.10.3, tower_governor 0.8.0, validator 0.21.0, garde 0.23.0, tower-http 0.7.1, cargo-audit 0.22.2, cargo-vet 0.10.3, cargo-cyclonedx 0.5.10, tokio 1.54.1

## Checklist

- [ ] `unsafe_code = "forbid"`; no `unwrap()` / `expect()` on request paths
- [ ] Every query scoped by the authenticated principal; protected routes use the auth extractor
- [ ] SQLx bind parameters only; `AssertSqlSafe` never wraps user input
- [ ] DTOs validated (validator / garde), `deny_unknown_fields`, body limits and timeouts set
- [ ] Passwords hashed with Argon2id in `spawn_blocking`; parameters meet OWASP minimum or stricter
- [ ] JWT verified with a pinned algorithm (EdDSA), `iss` / `aud` / `exp` validated, one crypto provider enabled
- [ ] Cookies HTTP-only, Secure, SameSite; CSRF handled for cookie auth
- [ ] Rate limiting on authentication routes (tower_governor) with a correct key extractor
- [ ] Secrets wrapped in `secrecy`, never logged or committed
- [ ] Security headers and explicit CORS origins configured
- [ ] `cargo deny check` and `cargo audit` green in CI; `Cargo.lock` committed
- [ ] SBOM generated and artifacts signed; CI actions pinned
- [ ] Generic problem+json error bodies, no stack traces or SQL errors exposed
