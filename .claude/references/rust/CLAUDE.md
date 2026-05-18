# Rust 1.95+ - Quick Reference

> ⚠️ **Experimental** — This stack is community-maintained. For authoritative guidance refer to the official Rust documentation: https://www.rust-lang.org/.

## Versions Requises (2026)

| Composant | Version | Notes |
|-----------|---------|-------|
| Rust | 1.95+ | Edition 2024, async closures stables (1.85), AFIT généralisé, return position impl trait élargi |
| rustfmt | stable | Formatage officiel |
| clippy | stable | Linter officiel |
| cargo-audit | 0.21+ | Scan CVE RustSec |

## Architecture Hexagonal

```
src/
├── domain/           # Entités, Value Objects, Traits (ports)
├── application/      # Use Cases, Business Logic
├── infrastructure/   # Adapters (DB, HTTP clients, cache)
└── interfaces/       # HTTP handlers, gRPC, CLI

Cargo.toml            # Workspace root
```

**Cargo Workspaces** pour modularité :

```toml
[workspace]
members = [
    "crates/domain",
    "crates/application",
    "crates/infrastructure",
    "crates/interfaces",
]
```

**Règle d'or** : crate `domain` ne dépend de RIEN (zero dependencies externes).

## Frameworks Web 2026

| Framework | Quand l'utiliser | Notes |
|-----------|------------------|-------|
| **axum (0.9+)** | Recommandé 2026, tokio + tower | Type-safe extractors, composition middlewares |
| **actix-web (4.x)** | APIs haute performance, mature | Actor model, maintenance conservatrice |
| **rocket (0.6+)** | Prototypage rapide, ergonomie | Moins performant, syntax macro heavy |
| **tower** | Middlewares, services composables | Briques pour axum/tonic |

**Best practice 2026** : axum (nouvelle API) ou actix-web (legacy stable).

## Async Runtime

| Runtime | Usage | Notes |
|---------|-------|-------|
| **tokio (1.x)** | De facto standard | Multi-threaded, mature, écosystème riche |
| **async-std** | Alternative | Maintenance réduite, préférer tokio |

**Async Traits Natifs** (stable Rust 1.75+) :

```rust
// Plus besoin de #[async_trait]
trait Repository {
    async fn get(&self, id: &str) -> Result<User, Error>;
    async fn save(&self, user: &User) -> Result<(), Error>;
}
```

## ORM / Database 2026

| Outil | Approche | Quand l'utiliser |
|-------|----------|------------------|
| **sqlx (0.9+)** | Compile-time SQL check, async | Type-safe, zéro runtime overhead, PostgreSQL/MySQL/SQLite |
| **sea-orm (1.x)** | ORM async | Relations complexes, migrations intégrées |
| **diesel (2.x)** | ORM sync | Legacy, pas d'async natif (préférer sqlx/sea-orm) |

**Recommandation** : sqlx (queries complexes) ou sea-orm (ORM complet).

## Testing 2026

```rust
// Tests unitaires
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_user() {
        let user = User::new("test@example.com", "Test");
        assert!(user.is_ok());
    }

    #[tokio::test]
    async fn test_repository() {
        let repo = MockRepository::new();
        let user = repo.get("123").await.unwrap();
        assert_eq!(user.email, "test@example.com");
    }
}
```

**Outils** :
- `cargo test` (stdlib)
- `rstest` (fixtures, parametrized tests)
- `proptest` (property-based testing)
- `mockall` (mocks)
- `criterion` (benchmarks)

## Rust 1.85 → 1.95 Features (Edition 2024)

```rust
// Async traits natifs (stable 1.75+)
trait Service {
    async fn process(&self, data: &str) -> Result<String, Error>;
}

// Generic Associated Types (GATs) stable
trait Repository {
    type Item<'a> where Self: 'a;
    fn get<'a>(&'a self, id: &str) -> Self::Item<'a>;
}

// let-else (Rust 1.65+)
let Ok(user) = repo.get(id).await else {
    return Err(Error::NotFound);
};

// Type inference améliorée (Rust 1.84+)
// Meilleure inférence dans closures et iterators
```

**Edition 2024** : Rust 1.85+ par défaut. Migration : `cargo fix --edition`.

## Error Handling

```rust
// thiserror (library errors)
use thiserror::Error;

#[derive(Error, Debug)]
pub enum UserError {
    #[error("user not found")]
    NotFound,
    #[error("invalid email: {0}")]
    InvalidEmail(String),
    #[error("database error")]
    Database(#[from] sqlx::Error),
}

// anyhow (application errors)
use anyhow::{Context, Result};

fn process() -> Result<()> {
    let user = get_user(id)
        .context("failed to get user")?;
    Ok(())
}
```

**Règle** : thiserror pour libs (types précis), anyhow pour apps (ergonomie).

## Observability 2026

```rust
// tracing (async-aware logging)
use tracing::{info, warn, error, instrument};

#[instrument]
async fn process_order(order_id: &str) -> Result<()> {
    info!(order_id, "processing order");
    // ...
    Ok(())
}

// OpenTelemetry
use opentelemetry::trace::Tracer;
use tracing_opentelemetry::OpenTelemetryLayer;

let tracer = opentelemetry_otlp::new_pipeline()
    .tracing()
    .install_simple()?;

tracing_subscriber::registry()
    .with(OpenTelemetryLayer::new(tracer))
    .init();
```

## Concurrency Patterns

```rust
// Channels (message passing > shared state)
use tokio::sync::mpsc;

let (tx, mut rx) = mpsc::channel(100);

tokio::spawn(async move {
    while let Some(msg) = rx.recv().await {
        process(msg).await;
    }
});

tx.send("message").await?;

// Arc<Mutex<T>> uniquement si nécessaire
use std::sync::Arc;
use tokio::sync::Mutex;

let data = Arc::new(Mutex::new(vec![]));
let data_clone = Arc::clone(&data);

tokio::spawn(async move {
    let mut d = data_clone.lock().await;
    d.push(42);
});
```

**Best practice** : message passing > shared memory (Arc/Mutex).

## Commandes Cargo

```bash
# Qualité
cargo fmt              # Formatage
cargo clippy           # Linter
cargo clippy -- -D warnings  # Fail si warnings

# Tests
cargo test             # Tests unitaires
cargo test --all       # Tous les tests
cargo test --doc       # Doc tests

# Benchmarks
cargo bench            # Criterion.rs

# Audit
cargo audit            # RustSec CVE scan
```

## Best Practices 2026

### Type State Pattern

```rust
// États compilés
pub struct Draft;
pub struct Published;

pub struct Post<State> {
    content: String,
    _state: PhantomData<State>,
}

impl Post<Draft> {
    pub fn new(content: String) -> Self {
        Post { content, _state: PhantomData }
    }

    pub fn publish(self) -> Post<Published> {
        Post { content: self.content, _state: PhantomData }
    }
}

impl Post<Published> {
    pub fn view(&self) -> &str {
        &self.content
    }
}

// Type safety : impossible de view() un Draft
```

### Builder Pattern

```rust
#[derive(Default)]
pub struct UserBuilder {
    email: Option<String>,
    name: Option<String>,
}

impl UserBuilder {
    pub fn email(mut self, email: String) -> Self {
        self.email = Some(email);
        self
    }

    pub fn name(mut self, name: String) -> Self {
        self.name = Some(name);
        self
    }

    pub fn build(self) -> Result<User, Error> {
        Ok(User {
            email: self.email.ok_or(Error::MissingEmail)?,
            name: self.name.ok_or(Error::MissingName)?,
        })
    }
}

// Usage
let user = UserBuilder::default()
    .email("test@example.com".to_string())
    .name("Test".to_string())
    .build()?;
```

### Clippy Pedantic

```toml
# Cargo.toml
[lints.clippy]
pedantic = "warn"
nursery = "warn"
```

```bash
cargo clippy -- -W clippy::pedantic -W clippy::nursery
```

## Documentation Complète

- `rules/01-architecture.md` - Hexagonal + patterns Rust
- `rules/02-testing.md` - Testing strategies + outils
- `rules/03-security.md` - OWASP + RustSec audit

## Checklist Rapide

- [ ] Rust 1.95+, edition 2024
- [ ] Domain crate sans dependencies externes
- [ ] cargo clippy 0 warnings
- [ ] cargo test passe
- [ ] cargo audit 0 CVE
- [ ] Async traits natifs (pas #[async_trait])
- [ ] Error handling thiserror (lib) ou anyhow (app)
- [ ] Message passing > Arc<Mutex<T>>
- [ ] Clippy pedantic activé
- [ ] Tests coverage ≥ 80%
