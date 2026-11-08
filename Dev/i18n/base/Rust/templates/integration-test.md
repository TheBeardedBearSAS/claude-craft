# Template: HTTP Integration Tests (tower oneshot + sqlx::test)

Exercise the real `Router` in process (no network port) and a real PostgreSQL database. Each `#[sqlx::test]` gets its own freshly created database with migrations applied, so tests are isolated and can run in parallel under cargo-nextest.

## Conventions

- The application factory `app(state) -> Router` is shared by `main` and the tests (see `handler.md`), so real layers and routes are tested
- `tower::ServiceExt::oneshot` consumes the service: clone the `Router` (cheap) for each request in a multi-request test
- `#[sqlx::test]` needs `DATABASE_URL` pointing at a PostgreSQL server (the Compose `db` service) and the `migrate` feature of sqlx
- Assert status, headers (`application/problem+json` on errors), body shape, and persisted side effects
- Cover for every endpoint: success, validation failure, unauthenticated, unauthorized, not found, conflict
- Stub external HTTP services (wiremock); never call the real network
- Run through Docker: `docker compose exec app cargo nextest run --workspace`

## Dev Dependencies

```toml
# crates/http/Cargo.toml
[dev-dependencies]
tower = { workspace = true, features = ["util"] }  # ServiceExt::oneshot
serde_json = { workspace = true }
sqlx = { workspace = true }                         # #[sqlx::test]
tokio = { workspace = true }
```

## Test Helpers

```rust
// crates/http/tests/common/mod.rs
use axum::{
    body::{to_bytes, Body},
    http::{header, Method, Request, Response},
    Router,
};
use serde_json::Value;
use sqlx::PgPool;
use tower::ServiceExt;

use http::{app, AppState};

pub fn test_app(pool: PgPool) -> Router {
    app(AppState::new(pool))
}

pub fn json_request(method: Method, uri: &str, body: Value) -> Request<Body> {
    Request::builder()
        .method(method)
        .uri(uri)
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(body.to_string()))
        .expect("valid request")
}

pub fn get(uri: &str) -> Request<Body> {
    Request::builder().uri(uri).body(Body::empty()).expect("valid request")
}

pub async fn send(app: &Router, request: Request<Body>) -> Response<Body> {
    app.clone().oneshot(request).await.expect("router is infallible")
}

pub async fn body_json(response: Response<Body>) -> Value {
    let bytes = to_bytes(response.into_body(), usize::MAX).await.expect("readable body");
    serde_json::from_slice(&bytes).expect("JSON body")
}
```

`expect` is acceptable in test helpers; it is forbidden in request paths.

## Tests

```rust
// crates/http/tests/users.rs
mod common;

use axum::http::{header, Method, StatusCode};
use common::{body_json, get, json_request, send, test_app};
use serde_json::json;
use sqlx::PgPool;

#[sqlx::test] // fresh database per test; migrations applied (see the note below)
async fn create_user_returns_201_and_persists(pool: PgPool) {
    let app = test_app(pool.clone());

    let response = send(
        &app,
        json_request(Method::POST, "/users", json!({ "email": "Ada@Example.com", "password": "correct horse battery" })),
    )
    .await;

    assert_eq!(response.status(), StatusCode::CREATED);
    assert!(response.headers().contains_key(header::LOCATION));
    let body = body_json(response).await;
    assert_eq!(body["email"], "ada@example.com"); // normalized by the domain type

    let stored: i64 = sqlx::query_scalar!("SELECT COUNT(*) FROM users WHERE email = $1", "ada@example.com")
        .fetch_one(&pool)
        .await
        .expect("count")
        .unwrap_or(0);
    assert_eq!(stored, 1);
}

#[sqlx::test]
async fn weak_password_returns_422_problem_json(pool: PgPool) {
    let app = test_app(pool);

    let response = send(
        &app,
        json_request(Method::POST, "/users", json!({ "email": "ada@example.com", "password": "short" })),
    )
    .await;

    assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
    assert_eq!(response.headers()[header::CONTENT_TYPE], "application/problem+json");
    let body = body_json(response).await;
    assert_eq!(body["status"], 422);
    assert_eq!(body["errors"][0]["field"], "password");
}

#[sqlx::test]
async fn duplicate_email_returns_409(pool: PgPool) {
    let app = test_app(pool);
    let payload = json!({ "email": "ada@example.com", "password": "correct horse battery" });

    let first = send(&app, json_request(Method::POST, "/users", payload.clone())).await;
    let second = send(&app, json_request(Method::POST, "/users", payload)).await;

    assert_eq!(first.status(), StatusCode::CREATED);
    assert_eq!(second.status(), StatusCode::CONFLICT);
}

#[sqlx::test]
async fn unknown_user_returns_404(pool: PgPool) {
    let app = test_app(pool);

    let response = send(&app, get("/users/00000000-0000-0000-0000-000000000000")).await;

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
    assert_eq!(response.headers()[header::CONTENT_TYPE], "application/problem+json");
}

#[sqlx::test]
async fn malformed_json_returns_400_without_internal_details(pool: PgPool) {
    let app = test_app(pool);
    let mut request = json_request(Method::POST, "/users", json!({}));
    *request.body_mut() = axum::body::Body::from("{ not json");

    let response = send(&app, request).await;

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[sqlx::test]
async fn protected_route_without_token_returns_401(pool: PgPool) {
    let app = test_app(pool);

    let response = send(&app, get("/me")).await;

    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}
```

Migrations are resolved relative to the crate running the test (`CARGO_MANIFEST_DIR`). With migrations at the workspace root, point the macro at them explicitly, for example `#[sqlx::test(migrations = "../../migrations")]`, after checking the attribute options in the sqlx documentation.

## SQL Fixtures

For tests needing existing rows, use scoped fixtures instead of inserting through the API:

```rust
#[sqlx::test(fixtures("users"))] // loads the named SQL fixture (see the sqlx docs for the lookup path)
async fn lists_seeded_users(pool: PgPool) {
    // ...
}
```

Check the sqlx documentation of the pinned version for the exact fixture lookup path and options.

## Running and Coverage

```bash
docker compose exec app cargo nextest run --workspace --all-features
docker compose exec app cargo llvm-cov nextest --workspace --fail-under-lines 80
```

## Checklist

- [ ] Application factory shared with `main`
- [ ] Success, 400/422, 401, 403, 404 and 409 cases covered for each endpoint
- [ ] Error responses assert `application/problem+json` and a body without internal details
- [ ] Database state asserted after writes; one database per test through `#[sqlx::test]`
- [ ] No `sleep`; time controlled with injected clocks or `tokio::time::pause`
- [ ] External HTTP stubbed; no real network access
