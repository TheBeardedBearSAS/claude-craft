# Rust / Axum Architecture - Layered Workspace & Hexagonal Boundaries

## Architectural Principles

### 1. Boundaries enforced by the compiler

Rust gives a unique tool for architecture: the crate graph. A dependency that is absent from a `Cargo.toml` cannot be used. Use it to keep the domain free of frameworks. Start with modules in a single crate for small services and split into crates when a boundary starts to leak.

```
Cargo.toml                    # [workspace], [workspace.dependencies], [workspace.lints]
rust-toolchain.toml
crates/
├── domain/                   # Entities, value objects, domain errors, ports (traits)
│   └── src/
│       ├── lib.rs
│       ├── order.rs
│       └── ports.rs          # OrderRepository, Clock, PaymentGateway
├── application/              # Use cases: orchestrate domain objects through ports
│   └── src/
│       ├── lib.rs
│       └── place_order.rs
├── infrastructure/           # Adapters: SQLx repositories, HTTP clients, mail
│   └── src/
│       ├── lib.rs
│       └── pg_order_repository.rs
└── api/                      # Binary: composition root and HTTP layer
    └── src/
        ├── main.rs           # Config, tracing, listener, graceful shutdown
        ├── state.rs          # AppState
        ├── router.rs
        ├── error.rs          # AppError + IntoResponse
        ├── extractors/
        └── handlers/
migrations/                   # SQLx migrations
tests/                        # Router-level integration tests
```

### 2. Pragmatic layering

| Situation | Recommended approach |
|-----------|----------------------|
| CRUD service, few rules | Single crate: `handlers`, `db`, `domain` modules |
| Real business rules, several adapters | Workspace with domain / application / infrastructure / api |
| Rule touching one entity | Method on the domain type, validated constructor |
| Workflow spanning several entities or systems | Use case in the application layer |
| External system (payment, mail) | Port (trait) in domain, adapter in infrastructure |
| Cross-cutting HTTP concern | Tower layer or extractor |

**Rule of thumb:** introduce a trait when you have two implementations or a need for a test double at an I/O boundary, not before (KISS, YAGNI). Generic parameters (`impl OrderRepository`) are preferred over `dyn` unless runtime selection is required.

### 3. Dependency Direction

```
api ──> application ──> domain <── infrastructure
 │                                      ^
 └──────────── composition root ────────┘
```

- `domain` depends on nothing but `std` and small utility crates (`thiserror`, `uuid`, `time`)
- `application` depends on `domain` only
- `infrastructure` implements `domain` ports with SQLx and HTTP clients
- `api` wires everything (composition root) and is the only crate depending on axum
- Verify with `cargo tree -p domain` that no framework appears

---

## Router, State and Handlers

### Application State

```rust
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub place_order: Arc<PlaceOrder<PgOrderRepository>>,
    pub db: sqlx::PgPool, // PgPool is already a cheap, reference-counted handle
}
```

State must be `Clone + Send + Sync + 'static`. Wrap heavy components in `Arc`; do not build clients per request.

### Router Composition

```rust
use axum::{routing::{get, post}, Router};

pub fn build_router(state: AppState) -> Router {
    Router::new()
        .merge(orders::routes())
        .route("/health", get(|| async { "ok" }))
        // .layer(ServiceBuilder::new()...) see "Middleware (Tower)"
        .with_state(state)
}

// handlers/orders.rs: return Router<AppState>, do not call with_state here
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/orders", post(create_order))
        .route("/orders/{id}", get(show_order))
}
```

Axum 0.8 path parameters use braces (`/orders/{id}`, wildcards `/{*rest}`); the `:id` syntax is not valid anymore. Call `.with_state(...)` once, at the top.

### Sub-states with FromRef

```rust
use axum::extract::FromRef;

impl FromRef<AppState> for sqlx::PgPool {
    fn from_ref(state: &AppState) -> Self {
        state.db.clone()
    }
}

async fn health(State(pool): State<sqlx::PgPool>) -> StatusCode {
    match sqlx::query("SELECT 1").execute(&pool).await {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::SERVICE_UNAVAILABLE,
    }
}
```

`FromRef` lets handlers and extractors depend on the slice of state they need, which also makes extractors reusable.

### Handlers

Handlers do four things: extract, validate, delegate, respond.

```rust
pub async fn create_order(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Json(body): Json<CreateOrderRequest>,
) -> Result<(StatusCode, Json<OrderResponse>), AppError> {
    let command = body.into_command(auth.user_id)?; // validation, parse-don't-validate
    let order = state.place_order.execute(command).await?;
    Ok((StatusCode::CREATED, Json(OrderResponse::from(order))))
}

pub async fn show_order(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Path(id): Path<Uuid>,
) -> Result<Json<OrderResponse>, AppError> {
    let order = state.orders.find_for_user(id, auth.user_id).await?.ok_or(AppError::NotFound)?;
    Ok(Json(order.into()))
}
```

Guidelines:
- Fewer than 20 lines per handler; delegate beyond that
- Extractor order matters: body extractors (`Json`, `Form`, `Bytes`) must be last because they consume the request
- Use dedicated request/response DTOs; never expose domain or database types directly
- Return `201` with the created resource, `204` for empty success, `422` for validation failures
- Handlers are `async fn`; if they call blocking code, use `tokio::task::spawn_blocking`

### Custom Extractors

```rust
use axum::{extract::FromRequestParts, http::request::Parts};

pub struct AuthenticatedUser { pub user_id: Uuid }

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
    TokenVerifier: FromRef<S>,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let verifier = TokenVerifier::from_ref(state);
        let token = bearer_token(&parts.headers).ok_or(AppError::Unauthorized)?;
        let claims = verifier.verify(token).map_err(|_| AppError::Unauthorized)?;
        Ok(Self { user_id: claims.sub })
    }
}
```

In axum 0.8 extractor traits use native `async fn`; do not add `#[async_trait]`. Extractors that may be absent can also implement `OptionalFromRequestParts` to be used as `Option<T>`.

---

## Error Model

### Layers

| Layer | Error type | Crate |
|-------|------------|-------|
| domain | `DomainError` enum (`thiserror`) | `thiserror` |
| application | `UseCaseError` wrapping domain and port errors | `thiserror` |
| infrastructure | Adapter errors mapped to port errors | `thiserror`, `sqlx::Error` |
| api (binary) | `AppError` implementing `IntoResponse`; `anyhow` allowed for startup and internal context | `anyhow` |

Libraries expose typed errors callers can match on; only the binary erases them.

### AppError and problem+json

```rust
use axum::{http::{header, StatusCode}, response::{IntoResponse, Response}, Json};
use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("not found")]
    NotFound,
    #[error("unauthorized")]
    Unauthorized,
    #[error("validation failed")]
    Validation(Vec<FieldError>),
    #[error(transparent)]
    UseCase(#[from] UseCaseError),
    #[error(transparent)]
    Internal(#[from] anyhow::Error),
}

#[derive(Serialize)]
struct Problem<'a> {
    #[serde(rename = "type")]
    kind: &'a str,
    title: &'a str,
    status: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    errors: Option<&'a [FieldError]>,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, title, errors) = match &self {
            Self::NotFound => (StatusCode::NOT_FOUND, "Not Found", None),
            Self::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized", None),
            Self::Validation(e) => (StatusCode::UNPROCESSABLE_ENTITY, "Validation failed", Some(e.as_slice())),
            Self::UseCase(e) => (e.status(), e.title(), None),
            Self::Internal(e) => {
                tracing::error!(error = ?e, "internal error");
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error", None)
            }
        };
        let body = Problem { kind: "about:blank", title, status: status.as_u16(), errors };
        (status, [(header::CONTENT_TYPE, "application/problem+json")], Json(body)).into_response()
    }
}
```

Rules:
- One `AppError`, one mapping to HTTP; handlers return `Result<T, AppError>` and use `?`
- Follow RFC 9457 (`application/problem+json`: `type`, `title`, `status`, optional `detail`, `instance`)
- Never leak internal messages, SQL errors or stack traces; log them with `tracing::error!`
- Axum's own rejections (bad JSON, bad path) can be mapped to the same format with a custom extractor wrapper or a `WithRejection`-style adapter

---

## Persistence with SQLx

```rust
pub struct PgOrderRepository { pool: sqlx::PgPool }

impl OrderRepository for PgOrderRepository {
    async fn find_for_user(&self, id: Uuid, user_id: Uuid) -> Result<Option<Order>, RepoError> {
        let row = sqlx::query_as!(
            OrderRow,
            "SELECT id, user_id, status, total_cents FROM orders WHERE id = $1 AND user_id = $2",
            id,
            user_id,
        )
        .fetch_optional(&self.pool)
        .await?;
        row.map(Order::try_from).transpose().map_err(Into::into)
    }
}
```

Guidelines:
- Bind parameters only (`$1`); prefer compile-checked `query!` / `query_as!` with committed `.sqlx` metadata (`cargo sqlx prepare --workspace`)
- Map rows to domain types at the adapter boundary (`TryFrom<OrderRow>`), keep SQLx types out of the domain
- Transactions: begin in the adapter or a unit-of-work abstraction, commit explicitly; dropping a transaction rolls it back
- Migrations are versioned SQL under `migrations/`, additive and backward-compatible for rolling deploys
- Pool sized from configuration with an acquire timeout; never one pool per request
- sqlx 0.9 query functions accept string literals (`SqlSafeStr`); dynamic SQL needs an explicit `AssertSqlSafe(...)` wrapper, which must never wrap user input
- Keyset pagination for large lists; `ANY($1)` batching to avoid N+1

---

## Middleware (Tower)

```rust
use std::time::Duration;
use tower::ServiceBuilder;
use tower_http::{cors::CorsLayer, limit::RequestBodyLimitLayer, timeout::TimeoutLayer, trace::TraceLayer};

let app = Router::new()
    // ...routes...
    .layer(
        ServiceBuilder::new()
            .layer(TraceLayer::new_for_http())
            .layer(TimeoutLayer::new(Duration::from_secs(10)))
            .layer(RequestBodyLimitLayer::new(1024 * 1024))
            .layer(CorsLayer::new() /* explicit origins, never "any" with credentials */),
    );
```

- `ServiceBuilder` applies layers top to bottom (outermost first); `Router::layer` applies the last added layer outermost, so prefer one `ServiceBuilder` for readability
- Always set a request timeout and a body size limit
- Check the `TimeoutLayer` constructor in the installed `tower-http` version, its signature changed across releases
- Authentication belongs in an extractor (typed, per-route) or a layer (blanket); avoid duplicating both
- Use `axum::middleware::from_fn` for small custom middleware

---

## Observability and Lifecycle

```rust
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .json()
        .init();

    let config = Config::from_env()?;
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(config.db_max_connections)
        .acquire_timeout(Duration::from_secs(3))
        .connect(config.database_url.expose_secret())
        .await?;
    sqlx::migrate!("../../migrations").run(&pool).await?;

    let app = build_router(AppState::new(pool));
    let listener = tokio::net::TcpListener::bind(config.listen_addr).await?;
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;
    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async { tokio::signal::ctrl_c().await.expect("install Ctrl+C handler") };
    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("install SIGTERM handler")
            .recv()
            .await;
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! { _ = ctrl_c => {}, _ = terminate => {} }
}
```

`expect` is acceptable here: it runs at startup, not on a request path. Structured logs (JSON) with request IDs; metrics and traces through OpenTelemetry when needed.

---

## Background Work

- `tokio::spawn` for short fire-and-forget tasks only when failure is acceptable; otherwise use a job queue (database-backed or broker) with idempotent handlers
- Track long-lived tasks with `tokio::task::JoinSet` and stop them on shutdown
- Never run CPU-heavy or blocking work on the executor: `spawn_blocking` or a dedicated rayon pool
- Use bounded channels (`tokio::sync::mpsc::channel(n)`) to apply back-pressure

---

## Sources

- axum 0.8 documentation: https://docs.rs/axum/0.8.9/axum/ (path syntax, `axum::serve`, `FromRef`, extractors)
- Rust 1.99.0 release: https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- sqlx 0.9.0 changelog: https://github.com/launchbadge/sqlx/blob/main/CHANGELOG.md
- RFC 9457 (Problem Details for HTTP APIs): https://www.rfc-editor.org/rfc/rfc9457

Versions cited: axum 0.8.9, tokio 1.54.1, sqlx 0.9.0, tower-http 0.7.1 (crates.io).

## Checklist

- [ ] Domain crate/module has no axum or sqlx dependency (`cargo tree`)
- [ ] Handlers are thin and return `Result<_, AppError>`
- [ ] One `AppError` implements `IntoResponse` with RFC 9457 bodies
- [ ] `thiserror` in libraries, `anyhow` only in the binary
- [ ] `Arc<AppState>` / `FromRef`, no global mutable state
- [ ] Routes use `/{id}` syntax, one `.with_state(...)` call
- [ ] Timeout, body limit, tracing and CORS layers configured
- [ ] SQLx bind parameters, `.sqlx` metadata committed
- [ ] Graceful shutdown on SIGTERM and Ctrl+C
- [ ] No blocking calls on the async executor
