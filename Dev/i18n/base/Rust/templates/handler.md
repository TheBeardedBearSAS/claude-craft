# Template: Axum Handler, Router and State

A handler coordinates: extract, validate, call a use case, map the result. Business rules live in the domain; SQL lives in the infrastructure layer. Targets axum 0.8 (path syntax `/{id}`, no `#[async_trait]` for extractors).

## Conventions

- One module per resource, exposing `pub fn routes() -> Router<AppState>`
- `AppState` is cheap to clone (`Clone` handles or `Arc`) and injected with `State<AppState>`
- Request DTOs are separate from domain types; `TryFrom<Dto>` builds validated domain values, so invalid data never reaches the use case
- Handlers return `Result<T, AppError>` (see `app-error.md`); no `unwrap()` / `expect()` in request paths
- Cross-cutting concerns (tracing, timeout, body limit, CORS, auth) are Tower layers on the router, not handler code
- Ids come from the path, the owner or tenant from the authenticated principal, never from the request body

## Domain Types (domain crate)

```rust
// crates/domain/src/user.rs
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Email(String);

impl Email {
    pub fn parse(raw: &str) -> Result<Self, UserError> {
        let raw = raw.trim().to_lowercase();
        // Minimal structural check; real deliverability is verified by a confirmation email.
        match raw.split_once('@') {
            Some((local, domain)) if !local.is_empty() && domain.contains('.') && raw.len() <= 254 => Ok(Self(raw)),
            _ => Err(UserError::InvalidEmail),
        }
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone)]
pub struct User {
    pub id: Uuid,
    pub email: Email,
}
```

## DTOs and Conversion (http crate)

```rust
// crates/http/src/users/dto.rs
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use domain::user::{Email, User, UserError};

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CreateUserRequest {
    pub email: String,
    pub password: String,
}

/// Validated command handed to the application layer.
pub struct RegisterUser {
    pub email: Email,
    pub password: String, // hashed (Argon2id) inside the use case, never stored or logged as is
}

impl TryFrom<CreateUserRequest> for RegisterUser {
    type Error = UserError;

    fn try_from(dto: CreateUserRequest) -> Result<Self, Self::Error> {
        if dto.password.chars().count() < 12 {
            return Err(UserError::WeakPassword);
        }
        Ok(Self { email: Email::parse(&dto.email)?, password: dto.password })
    }
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self { id: user.id, email: user.email.as_str().to_owned() }
    }
}
```

## State and Handlers (http crate)

```rust
// crates/http/src/users/mod.rs
use axum::{
    extract::{rejection::JsonRejection, Path, State},
    http::{header, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use uuid::Uuid;

use crate::{error::AppError, state::AppState};
use dto::{CreateUserRequest, RegisterUser, UserResponse};

mod dto;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create))
        .route("/{id}", get(show)) // axum 0.8 syntax: `/{id}`, not `/:id`
}

async fn create(
    State(state): State<AppState>,
    payload: Result<Json<CreateUserRequest>, JsonRejection>,
) -> Result<impl IntoResponse, AppError> {
    let Json(dto) = payload?; // JsonRejection -> AppError::BadRequest
    let command = RegisterUser::try_from(dto)?; // UserError -> AppError::Validation / Conflict

    let user = state.users.register(command).await?;

    let location = format!("/users/{}", user.id);
    Ok((StatusCode::CREATED, [(header::LOCATION, location)], Json(UserResponse::from(user))))
}

async fn show(State(state): State<AppState>, Path(id): Path<Uuid>) -> Result<Json<UserResponse>, AppError> {
    let user = state.users.find(id).await?.ok_or(AppError::NotFound)?;
    Ok(Json(user.into()))
}
```

`AppState` holds the application service; a handler never touches the pool directly.

```rust
// crates/http/src/state.rs
use std::sync::Arc;

use application::users::UserService;

#[derive(Clone)]
pub struct AppState {
    pub users: Arc<UserService>,
}
```

## Application Builder with Tower Layers

```rust
// crates/http/src/lib.rs
use std::time::Duration;

use axum::{http::StatusCode, routing::get, Router};
use tower_http::{limit::RequestBodyLimitLayer, timeout::TimeoutLayer, trace::TraceLayer};

mod error;
mod state;
mod users;

pub use state::AppState;

/// Shared by `main` and the integration tests, so tests exercise the real routes and layers.
pub fn app(state: AppState) -> Router {
    Router::new()
        .route("/healthz", get(|| async { StatusCode::OK }))
        .nest("/users", users::routes())
        .layer((
            TraceLayer::new_for_http(),
            RequestBodyLimitLayer::new(1024 * 1024), // 1 MiB
            TimeoutLayer::with_status_code(StatusCode::REQUEST_TIMEOUT, Duration::from_secs(10)),
        ))
        .with_state(state)
}
```

Add `CorsLayer` with an explicit origin list (never `permissive()` in production), an authentication layer on the protected sub-routers, and `SetResponseHeaderLayer` for security headers. Check the `tower-http` feature flags (`trace`, `timeout`, `limit`, `cors`) of the pinned version.

## Server with Graceful Shutdown (app binary)

```rust
// crates/app/src/main.rs
use tokio::{net::TcpListener, signal};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt().with_env_filter(tracing_subscriber::EnvFilter::from_default_env()).init();

    let config = Config::from_env()?; // typed, validated once; secrets as SecretString
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(config.db_max_connections)
        .connect(config.database_url.expose_secret())
        .await?;
    sqlx::migrate!("../../migrations").run(&pool).await?;

    let app = http::app(http::AppState::new(pool));
    let listener = TcpListener::bind(config.bind_addr).await?;
    tracing::info!(addr = %config.bind_addr, "listening");

    axum::serve(listener, app).with_graceful_shutdown(shutdown_signal()).await?;
    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async { signal::ctrl_c().await.expect("failed to install Ctrl+C handler") };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install SIGTERM handler")
            .recv()
            .await;
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
```

`anyhow` and `expect` are acceptable here only because this is the binary's startup path.

## Repository (infrastructure crate)

```rust
// crates/infrastructure/src/user_repository.rs
use sqlx::PgPool;
use uuid::Uuid;

pub struct UserRow {
    pub id: Uuid,
    pub email: String,
}

pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<UserRow>, sqlx::Error> {
    // Compile-time checked against the database (or the committed `.sqlx/` cache).
    sqlx::query_as!(UserRow, "SELECT id, email FROM users WHERE id = $1", id)
        .fetch_optional(pool)
        .await
}
```

Run `cargo sqlx prepare --workspace` after changing queries and commit `.sqlx/`. For dynamic filters use `sqlx::QueryBuilder` with `push_bind`; never `format!` values into SQL.

## Checklist

- [ ] Route registered with `/{id}` syntax and nested under the resource prefix
- [ ] Handler <= 15 lines; no SQL, no business rules
- [ ] DTO has `deny_unknown_fields` where strictness matters; conversion via `TryFrom`
- [ ] Authentication layer applied; ownership or tenant checked in the query
- [ ] Correct status codes (`201` + `Location`, `404`, `409`, `422`)
- [ ] Integration tests written first (see `integration-test.md`)
