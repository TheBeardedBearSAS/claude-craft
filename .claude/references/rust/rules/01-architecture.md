# Architecture Rust — Hexagonal + Patterns

## Vue d'ensemble

L'architecture Rust suit les principes Hexagonal (Ports & Adapters) avec ownership/borrowing natifs.

**Principes** :
- ✅ Domain crate sans dépendances externes
- ✅ Traits pour ports (interfaces)
- ✅ Ownership au lieu de clonage excessif
- ✅ Type state pour états compilés
- ✅ Error handling explicite (Result<T, E>)

---

## Structure Cargo Workspace

```toml
# Cargo.toml (root)
[workspace]
members = [
    "crates/domain",
    "crates/application",
    "crates/infrastructure",
    "crates/interfaces",
]

[workspace.dependencies]
tokio = { version = "1.45", features = ["full"] }
sqlx = { version = "0.9", features = ["postgres", "runtime-tokio-rustls"] }
```

```
my-app/
├── Cargo.toml
├── crates/
│   ├── domain/           # Entités, Value Objects, Traits (ports)
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── user/
│   │       │   ├── mod.rs
│   │       │   ├── entity.rs
│   │       │   ├── email.rs      # Value Object
│   │       │   └── repository.rs # Trait (port)
│   │       └── order/
│   │
│   ├── application/      # Use Cases, Business Logic
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── user/
│   │       │   ├── create_user.rs
│   │       │   └── get_user.rs
│   │       └── order/
│   │
│   ├── infrastructure/   # Adapters (DB, HTTP, cache)
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── postgres/
│   │       │   ├── user_repo.rs
│   │       │   └── order_repo.rs
│   │       └── redis/
│   │           └── cache.rs
│   │
│   └── interfaces/       # HTTP handlers, CLI, gRPC
│       ├── Cargo.toml
│       └── src/
│           ├── main.rs
│           ├── http/
│           │   ├── mod.rs
│           │   ├── user_handler.rs
│           │   └── middleware.rs
│           └── cli/
```

---

## Domain Layer

### Entity

```rust
// crates/domain/src/user/entity.rs
use super::Email;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone)]
pub struct User {
    pub id: String,
    pub email: Email,
    pub name: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl User {
    pub fn new(email: Email, name: String) -> Self {
        let now = Utc::now();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            email,
            name,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn change_name(&mut self, new_name: String) -> Result<(), UserError> {
        if new_name.is_empty() {
            return Err(UserError::InvalidName);
        }
        self.name = new_name;
        self.updated_at = Utc::now();
        Ok(())
    }
}
```

### Value Object

```rust
// crates/domain/src/user/email.rs
use std::fmt;
use regex::Regex;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Email(String);

impl Email {
    pub fn new(email: impl Into<String>) -> Result<Self, UserError> {
        let email = email.into();
        let re = Regex::new(r"^[^@]+@[^@]+\.[^@]+$").unwrap();
        
        if !re.is_match(&email) {
            return Err(UserError::InvalidEmail);
        }
        
        Ok(Email(email))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for Email {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}
```

### Repository Trait (Port)

```rust
// crates/domain/src/user/repository.rs
use async_trait::async_trait; // Legacy, ou native async trait si Rust 1.75+

use super::{User, Email};
use crate::error::DomainError;

// Async trait natif (Rust 1.75+)
pub trait UserRepository: Send + Sync {
    async fn get(&self, id: &str) -> Result<User, DomainError>;
    async fn save(&self, user: &User) -> Result<(), DomainError>;
    async fn delete(&self, id: &str) -> Result<(), DomainError>;
    async fn find_by_email(&self, email: &Email) -> Result<Option<User>, DomainError>;
}
```

---

## Application Layer

### Use Case

```rust
// crates/application/src/user/create_user.rs
use domain::user::{User, Email, UserRepository};
use domain::error::DomainError;

pub struct CreateUserInput {
    pub email: String,
    pub name: String,
}

pub struct CreateUserOutput {
    pub id: String,
}

pub struct CreateUserUseCase<R: UserRepository> {
    repository: R,
}

impl<R: UserRepository> CreateUserUseCase<R> {
    pub fn new(repository: R) -> Self {
        Self { repository }
    }

    pub async fn execute(&self, input: CreateUserInput) -> Result<CreateUserOutput, DomainError> {
        // Valider email
        let email = Email::new(input.email)
            .map_err(|_| DomainError::InvalidInput("invalid email".to_string()))?;

        // Vérifier unicité
        if let Some(_) = self.repository.find_by_email(&email).await? {
            return Err(DomainError::AlreadyExists("email already exists".to_string()));
        }

        // Créer user
        let user = User::new(email, input.name);

        // Sauvegarder
        self.repository.save(&user).await?;

        Ok(CreateUserOutput { id: user.id })
    }
}
```

---

## Infrastructure Layer

### Repository Implementation

```rust
// crates/infrastructure/src/postgres/user_repo.rs
use domain::user::{User, Email, UserRepository};
use domain::error::DomainError;
use sqlx::{PgPool, FromRow};

pub struct PostgresUserRepository {
    pool: PgPool,
}

impl PostgresUserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[derive(FromRow)]
struct UserRow {
    id: String,
    email: String,
    name: String,
    created_at: chrono::DateTime<chrono::Utc>,
    updated_at: chrono::DateTime<chrono::Utc>,
}

impl UserRepository for PostgresUserRepository {
    async fn get(&self, id: &str) -> Result<User, DomainError> {
        let row = sqlx::query_as::<_, UserRow>(
            "SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::Infrastructure(e.to_string()))?
        .ok_or(DomainError::NotFound)?;

        Ok(User {
            id: row.id,
            email: Email::new(row.email)?,
            name: row.name,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
    }

    async fn save(&self, user: &User) -> Result<(), DomainError> {
        sqlx::query(
            r#"
            INSERT INTO users (id, email, name, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                name = EXCLUDED.name,
                updated_at = EXCLUDED.updated_at
            "#
        )
        .bind(&user.id)
        .bind(user.email.as_str())
        .bind(&user.name)
        .bind(user.created_at)
        .bind(user.updated_at)
        .execute(&self.pool)
        .await
        .map_err(|e| DomainError::Infrastructure(e.to_string()))?;

        Ok(())
    }

    async fn find_by_email(&self, email: &Email) -> Result<Option<User>, DomainError> {
        let row = sqlx::query_as::<_, UserRow>(
            "SELECT id, email, name, created_at, updated_at FROM users WHERE email = $1"
        )
        .bind(email.as_str())
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| DomainError::Infrastructure(e.to_string()))?;

        match row {
            Some(r) => Ok(Some(User {
                id: r.id,
                email: Email::new(r.email)?,
                name: r.name,
                created_at: r.created_at,
                updated_at: r.updated_at,
            })),
            None => Ok(None),
        }
    }
}
```

---

## Interfaces Layer (HTTP)

### axum Handler

```rust
// crates/interfaces/src/http/user_handler.rs
use axum::{
    extract::State,
    response::Json,
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use application::user::{CreateUserUseCase, CreateUserInput};

#[derive(Deserialize)]
pub struct CreateUserRequest {
    email: String,
    name: String,
}

#[derive(Serialize)]
pub struct CreateUserResponse {
    id: String,
}

pub async fn create_user(
    State(use_case): State<CreateUserUseCase<impl UserRepository>>,
    Json(req): Json<CreateUserRequest>,
) -> Result<Json<CreateUserResponse>, StatusCode> {
    let output = use_case.execute(CreateUserInput {
        email: req.email,
        name: req.name,
    })
    .await
    .map_err(|_| StatusCode::BAD_REQUEST)?;

    Ok(Json(CreateUserResponse { id: output.id }))
}
```

### axum Router

```rust
// crates/interfaces/src/http/mod.rs
use axum::{Router, routing::post};
use infrastructure::postgres::PostgresUserRepository;
use application::user::CreateUserUseCase;

pub fn create_router(pool: PgPool) -> Router {
    let user_repo = PostgresUserRepository::new(pool);
    let create_user_uc = CreateUserUseCase::new(user_repo);

    Router::new()
        .route("/users", post(user_handler::create_user))
        .with_state(create_user_uc)
}
```

---

## Error Handling

### Domain Errors (thiserror)

```rust
// crates/domain/src/error.rs
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DomainError {
    #[error("not found")]
    NotFound,
    
    #[error("invalid input: {0}")]
    InvalidInput(String),
    
    #[error("already exists: {0}")]
    AlreadyExists(String),
    
    #[error("infrastructure error: {0}")]
    Infrastructure(String),
}
```

### Application Errors (anyhow)

```rust
// crates/application/src/error.rs
use anyhow::{Context, Result};

pub async fn process() -> Result<()> {
    let user = get_user(id)
        .await
        .context("failed to get user")?;
    
    Ok(())
}
```

---

## Dependency Injection

### Constructor Injection

```rust
// crates/interfaces/src/main.rs
use sqlx::PgPool;
use infrastructure::postgres::PostgresUserRepository;
use application::user::CreateUserUseCase;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // DB pool
    let pool = PgPool::connect(&std::env::var("DATABASE_URL")?).await?;

    // Repository
    let user_repo = PostgresUserRepository::new(pool.clone());

    // Use Case
    let create_user_uc = CreateUserUseCase::new(user_repo);

    // Router
    let app = Router::new()
        .route("/users", post(create_user))
        .with_state(create_user_uc);

    // Server
    axum::Server::bind(&"0.0.0.0:8080".parse()?)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}
```

---

## Patterns Rust

### Type State Pattern

```rust
pub struct Draft;
pub struct Published;

pub struct Post<State> {
    content: String,
    _state: std::marker::PhantomData<State>,
}

impl Post<Draft> {
    pub fn new(content: String) -> Self {
        Post { content, _state: std::marker::PhantomData }
    }

    pub fn publish(self) -> Post<Published> {
        Post { content: self.content, _state: std::marker::PhantomData }
    }
}

impl Post<Published> {
    pub fn view(&self) -> &str {
        &self.content
    }
}

// Compile error si on tente view() sur Draft
```

### Newtype Pattern

```rust
pub struct UserId(String);

impl UserId {
    pub fn new(id: String) -> Self {
        UserId(id)
    }
}

// Type safety : impossible de passer un OrderId à une fonction prenant UserId
```

---

## Checklist Architecture

- [ ] Domain crate sans dependencies externes
- [ ] Traits pour ports (repository, services)
- [ ] Infrastructure implémente les traits
- [ ] Use Cases dans application layer
- [ ] Interfaces (HTTP) mappent vers Use Cases
- [ ] Error handling thiserror (domain) + anyhow (app)
- [ ] Async traits natifs (Rust 1.75+)
- [ ] Cargo workspace pour modularité
- [ ] Type state pour états compilés
- [ ] Ownership > clonage excessif

---

**Date de dernière mise à jour** : 2026-04
**Version** : 1.0.0
**Auteur** : The Bearded CTO
