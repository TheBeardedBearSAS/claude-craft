# Sécurité Rust — OWASP 2025 + RustSec

## Vue d'ensemble

La sécurité Rust bénéficie de memory safety natif, mais nécessite vigilance sur crypto, SQL, et supply chain.

**Principes** :
- ✅ cargo audit obligatoire (RustSec)
- ✅ unsafe minimisé + audité
- ✅ Requêtes SQL paramétrées (sqlx)
- ✅ Crypto : ring, rustls (pas openssl)
- ✅ SBOM automatique (syft)

---

## OWASP Top 10:2025 — Rust

| # | Menace | Défense Rust |
|---|--------|--------------|
| 1 | Broken Access Control | Middleware auth + RBAC type-safe |
| 2 | Cryptographic Failures | ring, rustls, argon2, zeroize |
| 3 | Injection | sqlx compile-time check, parameterized |
| 4 | Insecure Design | Type state pattern, borrow checker |
| 5 | Security Misconfiguration | Config explicite, errors génériques prod |
| 6 | **Supply Chain Failures** | cargo audit, cargo deny, SBOM |
| 7 | **Exceptional Conditions** | Result<T, E>, panic recovery, tracing |

---

## Injection SQL

### sqlx (compile-time verification)

```rust
// ✅ BON : compile-time check
let user = sqlx::query_as!(
    User,
    "SELECT id, email, name FROM users WHERE id = $1",
    user_id
)
.fetch_one(&pool)
.await?;

// ❌ MAUVAIS
let query = format!("SELECT * FROM users WHERE id = '{}'", user_id); // DANGER
```

### Parameterized Queries

```rust
use sqlx::{PgPool, query_as};

async fn get_user(pool: &PgPool, id: &str) -> Result<User, sqlx::Error> {
    query_as!(
        User,
        r#"
        SELECT id, email, name, created_at
        FROM users
        WHERE id = $1
        "#,
        id
    )
    .fetch_one(pool)
    .await
}
```

---

## Authentification

### JWT

```rust
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Serialize, Deserialize};
use chrono::{Utc, Duration};

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,  // subject (user ID)
    exp: i64,     // expiration
    iat: i64,     // issued at
}

fn generate_token(user_id: &str, secret: &[u8]) -> Result<String, jsonwebtoken::errors::Error> {
    let now = Utc::now();
    let claims = Claims {
        sub: user_id.to_string(),
        exp: (now + Duration::minutes(15)).timestamp(),
        iat: now.timestamp(),
    };

    encode(&Header::default(), &claims, &EncodingKey::from_secret(secret))
}

fn validate_token(token: &str, secret: &[u8]) -> Result<Claims, jsonwebtoken::errors::Error> {
    let validation = Validation::default();
    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret),
        &validation,
    )?;

    Ok(token_data.claims)
}
```

### Password Hashing (Argon2id)

```rust
use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2, Params, Version,
};

// OWASP 2026 : 128 MiB RAM, t=4, p=1
fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
    let params = Params::new(
        128 * 1024, // 128 MiB memory
        4,          // iterations
        1,          // parallelism
        None,       // output length (default 32)
    )?;

    let argon2 = Argon2::new(
        argon2::Algorithm::Argon2id,
        Version::V0x13,
        params,
    );

    let salt = SaltString::generate(&mut OsRng);
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)?
        .to_string();

    Ok(password_hash)
}

fn verify_password(password: &str, hash: &str) -> Result<bool, argon2::password_hash::Error> {
    let parsed_hash = PasswordHash::new(hash)?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}
```

---

## TLS

### rustls (pure Rust, pas OpenSSL)

```rust
use tokio_rustls::rustls::{self, ServerConfig};
use tokio_rustls::TlsAcceptor;
use std::sync::Arc;
use std::fs::File;
use std::io::BufReader;

async fn create_tls_acceptor() -> Result<TlsAcceptor, Box<dyn std::error::Error>> {
    let certs = rustls_pemfile::certs(&mut BufReader::new(File::open("cert.pem")?))
        .collect::<Result<Vec<_>, _>>()?;
    
    let key = rustls_pemfile::private_key(&mut BufReader::new(File::open("key.pem")?))?
        .ok_or("no private key found")?;

    let config = ServerConfig::builder()
        .with_no_client_auth()
        .with_single_cert(certs, key)?;

    Ok(TlsAcceptor::from(Arc::new(config)))
}
```

---

## Secrets Management

### secrecy (zeroize on drop)

```rust
use secrecy::{Secret, ExposeSecret};

struct Config {
    api_key: Secret<String>,
    db_password: Secret<String>,
}

fn load_config() -> Config {
    Config {
        api_key: Secret::new(std::env::var("API_KEY").expect("API_KEY not set")),
        db_password: Secret::new(std::env::var("DB_PASSWORD").expect("DB_PASSWORD not set")),
    }
}

fn use_secret(config: &Config) {
    // Exposer uniquement quand nécessaire
    let key = config.api_key.expose_secret();
    // ...
} // Secret zeroized automatiquement au drop
```

### dotenvy (env vars)

```rust
use dotenvy::dotenv;

fn main() {
    dotenv().ok();

    let api_key = std::env::var("API_KEY")
        .expect("API_KEY must be set");
}
```

---

## Input Validation

### validator

```rust
use validator::{Validate, ValidationError};
use serde::Deserialize;

#[derive(Debug, Deserialize, Validate)]
struct User {
    #[validate(email)]
    email: String,

    #[validate(length(min = 3, max = 50))]
    name: String,

    #[validate(range(min = 18, max = 120))]
    age: u8,
}

fn validate_user(user: &User) -> Result<(), ValidationError> {
    user.validate()?;
    Ok(())
}
```

### serde deny_unknown_fields

```rust
use serde::Deserialize;

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct UserInput {
    email: String,
    name: String,
}

// Rejette les champs inconnus (protection injection)
```

---

## HTTP Security Headers

### tower-http

```rust
use tower_http::set_header::SetResponseHeaderLayer;
use http::header;

let app = Router::new()
    .route("/", get(handler))
    .layer(SetResponseHeaderLayer::overriding(
        header::X_CONTENT_TYPE_OPTIONS,
        HeaderValue::from_static("nosniff"),
    ))
    .layer(SetResponseHeaderLayer::overriding(
        header::X_FRAME_OPTIONS,
        HeaderValue::from_static("DENY"),
    ))
    .layer(SetResponseHeaderLayer::overriding(
        header::STRICT_TRANSPORT_SECURITY,
        HeaderValue::from_static("max-age=63072000; includeSubDomains; preload"),
    ));
```

---

## CORS

### tower-http CORS

```rust
use tower_http::cors::{CorsLayer, Any};
use http::Method;

let cors = CorsLayer::new()
    .allow_origin("https://example.com".parse::<HeaderValue>()?)
    .allow_methods([Method::GET, Method::POST])
    .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
    .allow_credentials(true)
    .max_age(Duration::from_secs(300));

let app = Router::new()
    .route("/", get(handler))
    .layer(cors);
```

---

## Rate Limiting

### governor

```rust
use governor::{Quota, RateLimiter};
use std::num::NonZeroU32;

let limiter = RateLimiter::direct(Quota::per_second(NonZeroU32::new(10).unwrap()));

async fn rate_limit_middleware(
    limiter: &RateLimiter,
    next: Next<Request>,
) -> Result<Response, StatusCode> {
    if limiter.check().is_err() {
        return Err(StatusCode::TOO_MANY_REQUESTS);
    }
    Ok(next.run(request).await)
}
```

---

## Supply Chain Security

### cargo audit (RustSec)

```bash
# Installer
cargo install cargo-audit

# Scan CVE
cargo audit

# CI : fail si CVE trouvées
cargo audit --deny warnings
```

### cargo deny (policy enforcement)

```bash
# Installer
cargo install cargo-deny

# Initialiser
cargo deny init

# Check (licenses, CVE, bans, sources)
cargo deny check
```

```toml
# deny.toml
[advisories]
db-path = "~/.cargo/advisory-db"
db-urls = ["https://github.com/rustsec/advisory-db"]
vulnerability = "deny"
unmaintained = "warn"

[licenses]
unlicensed = "deny"
allow = ["MIT", "Apache-2.0", "BSD-3-Clause"]

[bans]
multiple-versions = "warn"
```

### SBOM (syft)

```bash
# Générer SBOM
syft . -o cyclonedx-json > sbom.json

# CI : générer SBOM à chaque build
syft packages dir:. -o spdx-json=sbom.spdx.json
```

---

## unsafe Code

### Minimiser unsafe

```rust
// ❌ ÉVITER unsafe sauf nécessité absolue
unsafe {
    // Code dangereux
}

// ✅ Si unsafe nécessaire : auditer + justifier
/// # Safety
/// Cette fonction est unsafe car elle déréférence un pointeur brut.
/// L'appelant doit garantir que `ptr` est valide et aligné.
pub unsafe fn read_raw(ptr: *const u8) -> u8 {
    *ptr
}
```

### MIRI (unsafe detector)

```bash
# Installer
rustup +nightly component add miri

# Lancer
cargo +nightly miri test
```

---

## Container Security

### Distroless Image

```dockerfile
# Multi-stage build
FROM rust:1.85-alpine AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN cargo fetch
COPY . .
RUN cargo build --release

# Distroless (aucun shell, aucun package OS)
FROM gcr.io/distroless/cc-debian12:nonroot
COPY --from=builder /app/target/release/myapp /app
USER nonroot:nonroot
ENTRYPOINT ["/app"]
```

### Scratch Image (ultra-minimal)

```dockerfile
FROM rust:1.85-alpine AS builder
WORKDIR /app
COPY . .
RUN cargo build --release --target x86_64-unknown-linux-musl

FROM scratch
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/myapp /app
USER 1000:1000
ENTRYPOINT ["/app"]
```

---

## Logging Sécurisé

### tracing (async-aware)

```rust
use tracing::{info, warn, error};

// ✅ Loguer : connexions, changements permissions, erreurs auth
info!(user_id = %user.id, ip = %req.ip, "user login");

// ❌ NE PAS loguer : mots de passe, tokens, données sensibles
warn!(password = %password, "auth failed"); // DANGER
```

### Redact Secrets

```rust
use secrecy::{Secret, ExposeSecret};
use tracing::info;

let api_key = Secret::new("secret-key");

// ✅ BON : secret masqué dans les logs
info!(api_key = ?api_key, "config loaded"); // affiche "Secret([REDACTED])"

// ❌ MAUVAIS
info!(api_key = %api_key.expose_secret(), "config loaded"); // affiche le secret
```

---

## Checklist Sécurité

- [ ] cargo audit 0 CVE
- [ ] cargo deny passe (licenses + CVE + bans)
- [ ] Requêtes SQL paramétrées (sqlx compile-time check)
- [ ] Secrets dans env vars + secrecy crate
- [ ] Passwords : Argon2id (128 MiB, t=4, p=1)
- [ ] JWT expiration courte (15 min)
- [ ] TLS : rustls (pas openssl)
- [ ] Headers sécurité (CSP, HSTS, X-Frame-Options)
- [ ] CORS strict (whitelist origins)
- [ ] Rate limiting activé (governor)
- [ ] Input validation (validator, serde deny_unknown_fields)
- [ ] unsafe minimisé + audité + MIRI
- [ ] SBOM généré (syft)
- [ ] Container distroless/scratch + non-root user
- [ ] Logs sans données sensibles (secrecy redact)

---

**Date de dernière mise à jour** : 2026-04
**Version** : 1.0.0
**Auteur** : The Bearded CTO
