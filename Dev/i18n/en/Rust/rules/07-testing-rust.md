# Rust / Axum Testing Standards

TDD is mandatory: **Red -> Green -> Refactor**. Coverage target: **>= 80%** (cargo-llvm-cov). Every fixed bug gets a regression test that fails before the fix.

All commands run inside the container (`docker compose exec app ...`).

## Tooling Overview

| Tool | Role | Command |
|------|------|---------|
| `cargo test` (built-in harness) | Unit, integration and doc tests | `cargo test` |
| **cargo-nextest** | Fast runner, process-per-test isolation, retries, JUnit output | `cargo nextest run` |
| **cargo-llvm-cov** | Source-based coverage | `cargo llvm-cov nextest` |
| `#[sqlx::test]` | Isolated database per test | in test code |
| **proptest** | Property-based testing | in test code |
| **insta** | Snapshot testing | `cargo insta review` |
| **cargo-mutants** | Mutation testing | `cargo mutants` |
| **wiremock** | HTTP mocking of external services | in test code |

Rules:
- nextest does not run doc tests; keep `cargo test --doc` as a separate CI step
- Pick one assertion style (`assert_eq!`, optionally `pretty_assertions`) and stay consistent

## Test Pyramid

| Type | Share | Speed | Rust location |
|------|-------|-------|---------------|
| Unit (domain, use cases with fake ports) | 70% | < 1 s | `#[cfg(test)] mod tests` in the same file |
| Integration (Router, database, adapters) | 20% | < 5 s | `crates/api/tests/*.rs`, `tests/` |
| End-to-end (real server, real dependencies) | 10% | < 30 s | `tests/e2e/`, run against compose |

---

## Unit Tests

Unit tests live next to the code and can reach private items.

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_order_is_pending() {
        let order = Order::new(UserId::new(), vec![]);
        assert_eq!(order.status(), Status::Pending);
    }

    #[test]
    fn pay_moves_pending_to_paid() {
        let mut order = Order::pending_fixture();

        order.pay(fixed_now()).unwrap();

        assert_eq!(order.status(), Status::Paid);
    }

    #[test]
    fn pay_rejects_an_already_paid_order() {
        let mut order = Order::paid_fixture();

        let err = order.pay(fixed_now()).unwrap_err();

        assert!(matches!(err, DomainError::InvalidTransition { .. }));
    }
}
```

Guidelines:
- Name tests after behaviour (`pay_rejects_an_already_paid_order`), not after the function
- `unwrap()` / `expect()` are fine in tests
- Inject time (`Clock` port or a `now` parameter); never read the system clock in domain code
- Use small builders or fixture functions, not shared mutable statics

### Use Cases with Fake Ports

```rust
struct InMemoryOrders(std::sync::Mutex<Vec<Order>>);

impl OrderRepository for InMemoryOrders {
    async fn save(&self, order: &Order) -> Result<(), RepoError> {
        self.0.lock().unwrap().push(order.clone());
        Ok(())
    }
}

#[tokio::test]
async fn place_order_persists_the_order() {
    let repo = InMemoryOrders::default();
    let use_case = PlaceOrder::new(repo, FixedClock::at(2026, 1, 1));

    let order = use_case.execute(valid_command()).await.unwrap();

    assert_eq!(use_case.repo().count(), 1);
    assert_eq!(order.status(), Status::Pending);
}
```

Prefer hand-written fakes over mocking frameworks for ports: they document behaviour and survive refactors. Reserve mocking (`mockall`) for hard-to-fake boundaries.

---

## Integration Tests: Router with `oneshot`

Drive the Router directly with `tower::ServiceExt::oneshot`; no TCP listener is required.

```rust
// crates/api/tests/orders.rs
use axum::{body::Body, http::{header, Request, StatusCode}};
use http_body_util::BodyExt;
use tower::ServiceExt;

#[sqlx::test]
async fn create_order_returns_201(pool: sqlx::PgPool) {
    let app = api::build_router(api::AppState::for_test(pool));

    let response = app
        .oneshot(
            Request::post("/orders")
                .header(header::CONTENT_TYPE, "application/json")
                .header(header::AUTHORIZATION, test_bearer_token())
                .body(Body::from(r#"{"items":[{"product_id":"...","quantity":2}]}"#))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::CREATED);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["status"], "pending");
}

#[sqlx::test]
async fn unauthenticated_request_is_rejected(pool: sqlx::PgPool) {
    let app = api::build_router(api::AppState::for_test(pool));

    let response = app.oneshot(Request::get("/orders").body(Body::empty()).unwrap()).await.unwrap();

    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}
```

Guidelines:
- Expose `build_router(state)` from a library target so tests (and the binary) share the same wiring
- `oneshot` consumes the router; call `.clone()` first or use `into_service()` + `ready()` for several requests
- Test the full middleware stack, error bodies (problem+json) and authorization, not only happy paths
- Assert on status, headers (`content-type`, `www-authenticate`) and the body shape

### Testing a Real Listener (optional)

For WebSocket, graceful shutdown or client-library tests, bind to an ephemeral port:

```rust
let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
let addr = listener.local_addr().unwrap();
tokio::spawn(async move { axum::serve(listener, build_router(state)).await.unwrap() });
// call http://{addr} with reqwest
```

---

## Database Tests with `#[sqlx::test]`

`#[sqlx::test]` creates a fresh database for each test, applies the migrations, passes a pool and cleans up on success (failed tests keep the database for inspection).

```rust
use sqlx::PgPool;

#[sqlx::test]
async fn repository_round_trip(pool: PgPool) -> sqlx::Result<()> {
    let repo = PgOrderRepository::new(pool);
    let order = Order::pending_fixture();

    repo.save(&order).await.unwrap();
    let found = repo.find(order.id()).await.unwrap();

    assert_eq!(found, Some(order));
    Ok(())
}

#[sqlx::test(fixtures("users", "orders"))]            // ./fixtures/users.sql, ./fixtures/orders.sql
async fn lists_only_the_owners_orders(pool: PgPool) { /* ... */ }

#[sqlx::test(migrations = "../../migrations")]       // override the migrations path when needed
async fn custom_migrations_path(pool: PgPool) { /* ... */ }
```

Requirements and tips:
- `DATABASE_URL` must point at a Postgres server where the user can create databases (the compose `db` service)
- Tests are isolated from each other and can run in parallel; do not rely on ordering or shared rows
- Fixtures are plain SQL applied in the given order; order them to satisfy foreign keys
- Keep a separate test for each constraint (unique, foreign key) the application relies on
- Run `cargo sqlx prepare --check --workspace` in CI so macros compile offline

---

## Property-based Testing (proptest)

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn money_addition_is_commutative(a in 0i64..1_000_000, b in 0i64..1_000_000) {
        prop_assert_eq!(Money::cents(a) + Money::cents(b), Money::cents(b) + Money::cents(a));
    }

    #[test]
    fn email_parse_never_panics(s in ".*") {
        let _ = EmailAddress::parse(&s);
    }
}
```

Use properties for parsers, value objects, serialization round-trips and state machines. proptest stores failing cases in `proptest-regressions/`; commit that directory.

## Snapshot Testing (insta)

```rust
#[test]
fn problem_json_for_not_found() {
    let body = render_problem(&AppError::NotFound);
    insta::assert_json_snapshot!(body);
}
```

Review snapshots with `cargo insta review`; commit `.snap` files; never accept blindly. Good for API error bodies, OpenAPI documents and rendered templates.

## Mocking External HTTP (wiremock)

```rust
use wiremock::{matchers::{method, path}, Mock, MockServer, ResponseTemplate};

#[tokio::test]
async fn payment_gateway_maps_declines() {
    let server = MockServer::start().await;
    Mock::given(method("POST")).and(path("/charges"))
        .respond_with(ResponseTemplate::new(402))
        .mount(&server)
        .await;

    let gateway = HttpPaymentGateway::new(server.uri());

    assert!(matches!(gateway.charge(1500).await, Err(PaymentError::Declined)));
}
```

Never call real third-party services in tests.

---

## Async Tests and Time

- `#[tokio::test]` for async unit tests; `#[tokio::test(flavor = "multi_thread")]` only when the code needs it
- `tokio::time::pause()` (feature `test-util`) with `advance` makes timers deterministic; no real `sleep`
- Avoid assertions that depend on task scheduling order; use channels or `JoinHandle::await`
- Test cancellation paths: dropping a handler future must not leave partial state (use transactions)

---

## Running the Suite

```bash
docker compose exec app cargo nextest run --workspace
docker compose exec app cargo nextest run --workspace --retries 0 --no-fail-fast
docker compose exec app cargo test --workspace --doc
docker compose exec app cargo llvm-cov nextest --workspace --fail-under-lines 80
docker compose exec app cargo llvm-cov nextest --workspace --html      # target/llvm-cov/html
docker compose exec app cargo mutants --in-diff changes.diff            # mutants on changed code
```

Configure nextest in `.config/nextest.toml`:

```toml
[profile.default]
fail-fast = false
slow-timeout = { period = "30s", terminate-after = 2 }

[profile.ci]
retries = 0
junit.path = "junit.xml"
```

`cargo llvm-cov` requires the `llvm-tools-preview` rustup component (declared in `rust-toolchain.toml`). Exclude generated code and `main.rs` bootstrap from the report with `--ignore-filename-regex`, not by lowering the threshold.

## Expected Coverage

| Layer | Target |
|-------|--------|
| Domain and application | >= 90% |
| HTTP layer (Router tests) | >= 80% |
| Overall (cargo-llvm-cov) | >= 80% |
| Mutation score (domain, advisory) | >= 70% surviving mutants triaged |
| Critical journeys | Router-level or end-to-end tests |

Coverage lies; mutation testing tells the truth. Run `cargo mutants` on the domain and application crates in a nightly job and treat survivors as missing assertions.

---

## Anti-patterns

| Anti-pattern | Fix |
|--------------|-----|
| Tests asserting on implementation (calls count) | Assert on observable behaviour |
| Shared database between tests | `#[sqlx::test]` per test |
| `sleep` to wait for async work | Channels, `tokio::time::pause`, polling with timeout |
| `#[ignore]` without a ticket | Fix or delete |
| Giant fixtures reused everywhere | Small builders per test |
| Real HTTP calls to third parties | wiremock |

---

## Sources

- cargo-nextest 0.9.151: https://nexte.st/
- sqlx `#[sqlx::test]`: https://docs.rs/sqlx/latest/sqlx/attr.test.html
- axum testing example (`oneshot`): https://github.com/tokio-rs/axum/tree/main/examples/testing
- cargo-llvm-cov: https://github.com/taiki-e/cargo-llvm-cov
- proptest 1.12.0, insta 1.49.0, cargo-mutants 27.1.0 (crates.io)

## Checklist

- [ ] Tests written first (Red -> Green -> Refactor)
- [ ] Coverage >= 80% enforced by cargo-llvm-cov (`--fail-under-lines 80`)
- [ ] Unit, Router (`oneshot`) and database (`#[sqlx::test]`) layers covered
- [ ] No `sleep`; clock injected, `tokio::time::pause` for timers
- [ ] External HTTP mocked (wiremock), never real
- [ ] Authorization tested: users cannot reach other users' records
- [ ] Error responses (problem+json) asserted, not only happy paths
- [ ] Every bug fix has a regression test
- [ ] Doc tests run separately (`cargo test --doc`)
- [ ] Mutation testing scheduled on domain and application crates
