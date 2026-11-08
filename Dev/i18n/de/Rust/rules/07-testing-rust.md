# Rust-/Axum-Teststandards

TDD ist verpflichtend: **Red -> Green -> Refactor**. Abdeckungsziel: **>= 80 %** (cargo-llvm-cov). Jeder behobene Bug erhält einen Regressionstest, der vor dem Fix fehlschlägt.

Alle Befehle laufen im Container (`docker compose exec app ...`).

## Überblick über die Werkzeuge

| Werkzeug | Rolle | Befehl |
|----------|-------|--------|
| `cargo test` (eingebauter Harness) | Unit-, Integrations- und Doc-Tests | `cargo test` |
| **cargo-nextest** | Schneller Runner, Isolation pro Test als eigener Prozess, Retries, JUnit-Ausgabe | `cargo nextest run` |
| **cargo-llvm-cov** | Quellcodebasierte Abdeckung | `cargo llvm-cov nextest` |
| `#[sqlx::test]` | Isolierte Datenbank pro Test | im Testcode |
| **proptest** | Property-based Testing | im Testcode |
| **insta** | Snapshot-Tests | `cargo insta review` |
| **cargo-mutants** | Mutation Testing | `cargo mutants` |
| **wiremock** | HTTP-Mocking externer Services | im Testcode |

Regeln:
- nextest führt keine Doc-Tests aus; `cargo test --doc` als separaten CI-Schritt beibehalten
- Einen Assertion-Stil wählen (`assert_eq!`, optional `pretty_assertions`) und konsequent dabei bleiben

## Testpyramide

| Typ | Anteil | Geschwindigkeit | Ort in Rust |
|-----|--------|-----------------|-------------|
| Unit (Domäne, Anwendungsfälle mit Fake-Ports) | 70 % | < 1 s | `#[cfg(test)] mod tests` in derselben Datei |
| Integration (Router, Datenbank, Adapter) | 20 % | < 5 s | `crates/api/tests/*.rs`, `tests/` |
| End-to-End (echter Server, echte Abhängigkeiten) | 10 % | < 30 s | `tests/e2e/`, gegen Compose ausgeführt |

---

## Unit-Tests

Unit-Tests liegen neben dem Code und können auf private Items zugreifen.

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

Richtlinien:
- Tests nach dem Verhalten benennen (`pay_rejects_an_already_paid_order`), nicht nach der Funktion
- `unwrap()` / `expect()` sind in Tests in Ordnung
- Zeit injizieren (`Clock`-Port oder ein Parameter `now`); niemals die Systemuhr im Domänencode lesen
- Kleine Builder oder Fixture-Funktionen verwenden, keine geteilten veränderlichen Statics

### Anwendungsfälle mit Fake-Ports

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

Für Ports handgeschriebene Fakes gegenüber Mocking-Frameworks bevorzugen: Sie dokumentieren das Verhalten und überstehen Refactorings. Mocking (`mockall`) für schwer zu fakende Grenzen reservieren.

---

## Integrationstests: Router mit `oneshot`

Den Router direkt mit `tower::ServiceExt::oneshot` ansteuern; ein TCP-Listener ist nicht erforderlich.

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

Richtlinien:
- `build_router(state)` aus einem Library-Target bereitstellen, damit Tests (und das Binary) dieselbe Verdrahtung teilen
- `oneshot` verbraucht den Router; zuvor `.clone()` aufrufen oder für mehrere Requests `into_service()` + `ready()` verwenden
- Den gesamten Middleware-Stack, Fehler-Bodys (problem+json) und die Autorisierung testen, nicht nur Happy Paths
- Auf Status, Header (`content-type`, `www-authenticate`) und die Form des Bodys prüfen

### Einen echten Listener testen (optional)

Für WebSocket-, Graceful-Shutdown- oder Client-Bibliothek-Tests an einen ephemeren Port binden:

```rust
let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
let addr = listener.local_addr().unwrap();
tokio::spawn(async move { axum::serve(listener, build_router(state)).await.unwrap() });
// call http://{addr} with reqwest
```

---

## Datenbanktests mit `#[sqlx::test]`

`#[sqlx::test]` erstellt für jeden Test eine frische Datenbank, wendet die Migrationen an, übergibt einen Pool und räumt bei Erfolg auf (fehlgeschlagene Tests behalten die Datenbank zur Untersuchung).

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

Voraussetzungen und Tipps:
- `DATABASE_URL` muss auf einen Postgres-Server zeigen, auf dem der Benutzer Datenbanken anlegen darf (der Compose-Service `db`)
- Tests sind voneinander isoliert und können parallel laufen; sich nicht auf Reihenfolge oder geteilte Zeilen verlassen
- Fixtures sind reines SQL, das in der angegebenen Reihenfolge angewendet wird; so ordnen, dass Fremdschlüssel erfüllt sind
- Für jeden Constraint (unique, Fremdschlüssel), auf den sich die Anwendung stützt, einen eigenen Test vorhalten
- In der CI `cargo sqlx prepare --check --workspace` ausführen, damit die Makros offline kompilieren

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

Properties für Parser, Value Objects, Serialisierungs-Round-Trips und Zustandsautomaten einsetzen. proptest speichert fehlschlagende Fälle in `proptest-regressions/`; dieses Verzeichnis einchecken.

## Snapshot-Tests (insta)

```rust
#[test]
fn problem_json_for_not_found() {
    let body = render_problem(&AppError::NotFound);
    insta::assert_json_snapshot!(body);
}
```

Snapshots mit `cargo insta review` prüfen; `.snap`-Dateien einchecken; niemals blind akzeptieren. Gut geeignet für API-Fehler-Bodys, OpenAPI-Dokumente und gerenderte Templates.

## Externes HTTP mocken (wiremock)

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

In Tests niemals echte Drittanbieter-Services aufrufen.

---

## Asynchrone Tests und Zeit

- `#[tokio::test]` für asynchrone Unit-Tests; `#[tokio::test(flavor = "multi_thread")]` nur, wenn der Code es benötigt
- `tokio::time::pause()` (Feature `test-util`) mit `advance` macht Timer deterministisch; kein echtes `sleep`
- Assertions vermeiden, die von der Scheduling-Reihenfolge der Tasks abhängen; Channels oder `JoinHandle::await` verwenden
- Cancellation-Pfade testen: Das Droppen eines Handler-Futures darf keinen Teilzustand hinterlassen (Transaktionen verwenden)

---

## Die Suite ausführen

```bash
docker compose exec app cargo nextest run --workspace
docker compose exec app cargo nextest run --workspace --retries 0 --no-fail-fast
docker compose exec app cargo test --workspace --doc
docker compose exec app cargo llvm-cov nextest --workspace --fail-under-lines 80
docker compose exec app cargo llvm-cov nextest --workspace --html      # target/llvm-cov/html
docker compose exec app cargo mutants --in-diff changes.diff            # mutants on changed code
```

nextest in `.config/nextest.toml` konfigurieren:

```toml
[profile.default]
fail-fast = false
slow-timeout = { period = "30s", terminate-after = 2 }

[profile.ci]
retries = 0
junit.path = "junit.xml"
```

`cargo llvm-cov` benötigt die rustup-Komponente `llvm-tools-preview` (in `rust-toolchain.toml` deklariert). Generierten Code und den Bootstrap in `main.rs` mit `--ignore-filename-regex` aus dem Bericht ausschließen, nicht durch Absenken des Schwellenwerts.

## Erwartete Abdeckung

| Schicht | Ziel |
|---------|------|
| Domäne und Application | >= 90 % |
| HTTP-Schicht (Router-Tests) | >= 80 % |
| Gesamt (cargo-llvm-cov) | >= 80 % |
| Mutation Score (Domäne, beratend) | >= 70 %, überlebende Mutanten sind triagiert |
| Kritische Abläufe | Tests auf Router-Ebene oder End-to-End |

Abdeckung lügt; Mutation Testing sagt die Wahrheit. `cargo mutants` in einem nächtlichen Job auf die Domain- und Application-Crates anwenden und überlebende Mutanten als fehlende Assertions behandeln.

---

## Anti-Patterns

| Anti-Pattern | Lösung |
|--------------|--------|
| Tests, die auf die Implementierung prüfen (Anzahl der Aufrufe) | Auf beobachtbares Verhalten prüfen |
| Geteilte Datenbank zwischen Tests | `#[sqlx::test]` pro Test |
| `sleep`, um auf asynchrone Arbeit zu warten | Channels, `tokio::time::pause`, Polling mit Timeout |
| `#[ignore]` ohne Ticket | Beheben oder löschen |
| Riesige Fixtures, die überall wiederverwendet werden | Kleine Builder pro Test |
| Echte HTTP-Aufrufe an Drittanbieter | wiremock |

---

## Quellen

- cargo-nextest 0.9.151: https://nexte.st/
- sqlx `#[sqlx::test]`: https://docs.rs/sqlx/latest/sqlx/attr.test.html
- axum-Testbeispiel (`oneshot`): https://github.com/tokio-rs/axum/tree/main/examples/testing
- cargo-llvm-cov: https://github.com/taiki-e/cargo-llvm-cov
- proptest 1.12.0, insta 1.49.0, cargo-mutants 27.1.0 (crates.io)

## Checkliste

- [ ] Tests zuerst geschrieben (Red -> Green -> Refactor)
- [ ] Abdeckung >= 80 % durch cargo-llvm-cov erzwungen (`--fail-under-lines 80`)
- [ ] Schichten Unit, Router (`oneshot`) und Datenbank (`#[sqlx::test]`) abgedeckt
- [ ] Kein `sleep`; Uhr injiziert, `tokio::time::pause` für Timer
- [ ] Externes HTTP gemockt (wiremock), niemals echt
- [ ] Autorisierung getestet: Benutzer können nicht auf die Datensätze anderer zugreifen
- [ ] Fehlerantworten (problem+json) geprüft, nicht nur Happy Paths
- [ ] Jeder Bugfix hat einen Regressionstest
- [ ] Doc-Tests laufen separat (`cargo test --doc`)
- [ ] Mutation Testing für Domain- und Application-Crates eingeplant
