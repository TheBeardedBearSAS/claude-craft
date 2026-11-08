# Estándares de testing Rust / Axum

El TDD es obligatorio: **Red -> Green -> Refactor**. Objetivo de cobertura: **>= 80%** (cargo-llvm-cov). Cada bug corregido recibe un test de regresión que falla antes de la corrección.

Todos los comandos se ejecutan dentro del contenedor (`docker compose exec app ...`).

## Visión general de las herramientas

| Herramienta | Función | Comando |
|-------------|---------|---------|
| `cargo test` (harness integrado) | Tests unitarios, de integración y de documentación | `cargo test` |
| **cargo-nextest** | Runner rápido, aislamiento de un proceso por test, reintentos, salida JUnit | `cargo nextest run` |
| **cargo-llvm-cov** | Cobertura basada en el código fuente | `cargo llvm-cov nextest` |
| `#[sqlx::test]` | Base de datos aislada por test | en el código de test |
| **proptest** | Tests basados en propiedades | en el código de test |
| **insta** | Tests de snapshots | `cargo insta review` |
| **cargo-mutants** | Mutation testing | `cargo mutants` |
| **wiremock** | Mocking HTTP de servicios externos | en el código de test |

Reglas:
- nextest no ejecuta los doc tests; mantén `cargo test --doc` como un paso de CI aparte
- Elige un único estilo de aserciones (`assert_eq!`, opcionalmente `pretty_assertions`) y mantén la coherencia

## Pirámide de tests

| Tipo | Proporción | Velocidad | Ubicación en Rust |
|------|------------|-----------|-------------------|
| Unitarios (dominio, casos de uso con puertos fake) | 70% | < 1 s | `#[cfg(test)] mod tests` en el mismo archivo |
| Integración (Router, base de datos, adaptadores) | 20% | < 5 s | `crates/api/tests/*.rs`, `tests/` |
| Extremo a extremo (servidor real, dependencias reales) | 10% | < 30 s | `tests/e2e/`, ejecutados contra compose |

---

## Tests unitarios

Los tests unitarios viven junto al código y pueden acceder a los elementos privados.

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

Directrices:
- Nombra los tests según el comportamiento (`pay_rejects_an_already_paid_order`), no según la función
- `unwrap()` / `expect()` están bien en los tests
- Inyecta el tiempo (puerto `Clock` o un parámetro `now`); nunca leas el reloj del sistema en el código de dominio
- Usa builders pequeños o funciones de fixture, no statics mutables compartidos

### Casos de uso con puertos fake

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

Prefiere los fakes escritos a mano a los frameworks de mocking para los puertos: documentan el comportamiento y sobreviven a las refactorizaciones. Reserva el mocking (`mockall`) para las fronteras difíciles de simular con un fake.

---

## Tests de integración: Router con `oneshot`

Conduce el Router directamente con `tower::ServiceExt::oneshot`; no se necesita ningún listener TCP.

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

Directrices:
- Expón `build_router(state)` desde un target de librería para que los tests (y el binario) compartan el mismo cableado
- `oneshot` consume el router; llama primero a `.clone()` o usa `into_service()` + `ready()` para varias peticiones
- Prueba la pila completa de middleware, los cuerpos de error (problem+json) y la autorización, no solo los caminos felices
- Verifica el status, las cabeceras (`content-type`, `www-authenticate`) y la forma del cuerpo

### Probar un listener real (opcional)

Para tests de WebSocket, de apagado ordenado o de librerías cliente, enlaza a un puerto efímero:

```rust
let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
let addr = listener.local_addr().unwrap();
tokio::spawn(async move { axum::serve(listener, build_router(state)).await.unwrap() });
// llamar a http://{addr} con reqwest
```

---

## Tests de base de datos con `#[sqlx::test]`

`#[sqlx::test]` crea una base de datos nueva para cada test, aplica las migraciones, pasa un pool y la limpia en caso de éxito (los tests fallidos conservan la base de datos para poder inspeccionarla).

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

#[sqlx::test(migrations = "../../migrations")]       // sobrescribir la ruta de las migraciones cuando haga falta
async fn custom_migrations_path(pool: PgPool) { /* ... */ }
```

Requisitos y consejos:
- `DATABASE_URL` debe apuntar a un servidor Postgres donde el usuario pueda crear bases de datos (el servicio `db` de compose)
- Los tests están aislados entre sí y pueden ejecutarse en paralelo; no dependas del orden ni de filas compartidas
- Las fixtures son SQL plano aplicado en el orden indicado; ordénalas para satisfacer las claves foráneas
- Mantén un test separado para cada restricción (unique, foreign key) de la que dependa la aplicación
- Ejecuta `cargo sqlx prepare --check --workspace` en la CI para que las macros compilen sin conexión

---

## Tests basados en propiedades (proptest)

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

Usa propiedades para parsers, value objects, ciclos de serialización (round-trips) y máquinas de estado. proptest guarda los casos fallidos en `proptest-regressions/`; commitea ese directorio.

## Tests de snapshots (insta)

```rust
#[test]
fn problem_json_for_not_found() {
    let body = render_problem(&AppError::NotFound);
    insta::assert_json_snapshot!(body);
}
```

Revisa los snapshots con `cargo insta review`; commitea los archivos `.snap`; nunca los aceptes a ciegas. Útil para cuerpos de error de la API, documentos OpenAPI y plantillas renderizadas.

## Mocking de HTTP externo (wiremock)

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

Nunca llames a servicios reales de terceros en los tests.

---

## Tests asíncronos y tiempo

- `#[tokio::test]` para los tests unitarios asíncronos; `#[tokio::test(flavor = "multi_thread")]` solo cuando el código lo necesite
- `tokio::time::pause()` (feature `test-util`) con `advance` hace deterministas los temporizadores; sin `sleep` real
- Evita las aserciones que dependan del orden de planificación de las tareas; usa canales o `JoinHandle::await`
- Prueba las rutas de cancelación: descartar el future de un handler no debe dejar un estado parcial (usa transacciones)

---

## Ejecutar la suite

```bash
docker compose exec app cargo nextest run --workspace
docker compose exec app cargo nextest run --workspace --retries 0 --no-fail-fast
docker compose exec app cargo test --workspace --doc
docker compose exec app cargo llvm-cov nextest --workspace --fail-under-lines 80
docker compose exec app cargo llvm-cov nextest --workspace --html      # target/llvm-cov/html
docker compose exec app cargo mutants --in-diff changes.diff            # mutantes sobre el código modificado
```

Configura nextest en `.config/nextest.toml`:

```toml
[profile.default]
fail-fast = false
slow-timeout = { period = "30s", terminate-after = 2 }

[profile.ci]
retries = 0
junit.path = "junit.xml"
```

`cargo llvm-cov` requiere el componente de rustup `llvm-tools-preview` (declarado en `rust-toolchain.toml`). Excluye del informe el código generado y el arranque de `main.rs` con `--ignore-filename-regex`, no bajando el umbral.

## Cobertura esperada

| Capa | Objetivo |
|------|----------|
| Dominio y aplicación | >= 90% |
| Capa HTTP (tests de Router) | >= 80% |
| Global (cargo-llvm-cov) | >= 80% |
| Puntuación de mutación (dominio, orientativa) | >= 70%, mutantes supervivientes analizados |
| Recorridos críticos | Tests a nivel de Router o de extremo a extremo |

La cobertura miente; el mutation testing dice la verdad. Ejecuta `cargo mutants` sobre los crates de dominio y aplicación en un job nocturno y trata a los supervivientes como aserciones que faltan.

---

## Anti-patrones

| Anti-patrón | Corrección |
|-------------|------------|
| Tests que verifican la implementación (número de llamadas) | Verificar el comportamiento observable |
| Base de datos compartida entre tests | `#[sqlx::test]` por test |
| `sleep` para esperar trabajo asíncrono | Canales, `tokio::time::pause`, sondeo con timeout |
| `#[ignore]` sin ticket | Corregir o eliminar |
| Fixtures gigantes reutilizadas en todas partes | Builders pequeños por test |
| Llamadas HTTP reales a terceros | wiremock |

---

## Fuentes

- cargo-nextest 0.9.151: https://nexte.st/
- sqlx `#[sqlx::test]`: https://docs.rs/sqlx/latest/sqlx/attr.test.html
- Ejemplo de testing de axum (`oneshot`): https://github.com/tokio-rs/axum/tree/main/examples/testing
- cargo-llvm-cov: https://github.com/taiki-e/cargo-llvm-cov
- proptest 1.12.0, insta 1.49.0, cargo-mutants 27.1.0 (crates.io)

## Checklist

- [ ] Tests escritos primero (Red -> Green -> Refactor)
- [ ] Cobertura >= 80% garantizada por cargo-llvm-cov (`--fail-under-lines 80`)
- [ ] Capas unitaria, de Router (`oneshot`) y de base de datos (`#[sqlx::test]`) cubiertas
- [ ] Sin `sleep`; reloj inyectado, `tokio::time::pause` para los temporizadores
- [ ] HTTP externo mockeado (wiremock), nunca real
- [ ] Autorización probada: los usuarios no pueden acceder a los registros de otros usuarios
- [ ] Respuestas de error (problem+json) verificadas, no solo los caminos felices
- [ ] Cada corrección de bug tiene un test de regresión
- [ ] Doc tests ejecutados por separado (`cargo test --doc`)
- [ ] Mutation testing programado sobre los crates de dominio y aplicación
