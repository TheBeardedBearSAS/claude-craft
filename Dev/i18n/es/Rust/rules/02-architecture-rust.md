# Arquitectura Rust / Axum - Workspace en capas y fronteras hexagonales

## Principios arquitectónicos

### 1. Fronteras garantizadas por el compilador

Rust ofrece una herramienta única para la arquitectura: el grafo de crates. Una dependencia que no figura en un `Cargo.toml` no puede utilizarse. Úsala para mantener el dominio libre de frameworks. Empieza con módulos dentro de un único crate para los servicios pequeños y divide en crates cuando una frontera empiece a filtrarse.

```
Cargo.toml                    # [workspace], [workspace.dependencies], [workspace.lints]
rust-toolchain.toml
crates/
├── domain/                   # Entidades, value objects, errores de dominio, puertos (traits)
│   └── src/
│       ├── lib.rs
│       ├── order.rs
│       └── ports.rs          # OrderRepository, Clock, PaymentGateway
├── application/              # Casos de uso: orquestan los objetos del dominio a través de puertos
│   └── src/
│       ├── lib.rs
│       └── place_order.rs
├── infrastructure/           # Adaptadores: repositorios SQLx, clientes HTTP, correo
│   └── src/
│       ├── lib.rs
│       └── pg_order_repository.rs
└── api/                      # Binario: raíz de composición y capa HTTP
    └── src/
        ├── main.rs           # Configuración, tracing, listener, apagado ordenado
        ├── state.rs          # AppState
        ├── router.rs
        ├── error.rs          # AppError + IntoResponse
        ├── extractors/
        └── handlers/
migrations/                   # Migraciones SQLx
tests/                        # Tests de integración a nivel de Router
```

### 2. Capas pragmáticas

| Situación | Enfoque recomendado |
|-----------|---------------------|
| Servicio CRUD, pocas reglas | Un único crate: módulos `handlers`, `db`, `domain` |
| Reglas de negocio reales, varios adaptadores | Workspace con domain / application / infrastructure / api |
| Regla que afecta a una entidad | Método en el tipo de dominio, constructor validado |
| Flujo que abarca varias entidades o sistemas | Caso de uso en la capa de aplicación |
| Sistema externo (pago, correo) | Puerto (trait) en el dominio, adaptador en infrastructure |
| Preocupación HTTP transversal | Capa Tower o extractor |

**Regla práctica:** introduce un trait cuando tengas dos implementaciones o necesites un test double en una frontera de E/S, no antes (KISS, YAGNI). Se prefieren los parámetros genéricos (`impl OrderRepository`) a `dyn`, salvo que se requiera selección en tiempo de ejecución.

### 3. Dirección de las dependencias

```
api ──> application ──> domain <── infrastructure
 │                                      ^
 └──────────── raíz de composición ─────┘
```

- `domain` solo depende de `std` y de pequeños crates utilitarios (`thiserror`, `uuid`, `time`)
- `application` depende únicamente de `domain`
- `infrastructure` implementa los puertos de `domain` con SQLx y clientes HTTP
- `api` conecta todo (raíz de composición) y es el único crate que depende de axum
- Verificar con `cargo tree -p domain` que no aparece ningún framework

---

## Router, State y handlers

### Estado de la aplicación

```rust
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub place_order: Arc<PlaceOrder<PgOrderRepository>>,
    pub db: sqlx::PgPool, // PgPool ya es un handle barato con conteo de referencias
}
```

El estado debe ser `Clone + Send + Sync + 'static`. Envuelve los componentes pesados en `Arc`; no construyas clientes por petición.

### Composición del Router

```rust
use axum::{routing::{get, post}, Router};

pub fn build_router(state: AppState) -> Router {
    Router::new()
        .merge(orders::routes())
        .route("/health", get(|| async { "ok" }))
        // .layer(ServiceBuilder::new()...) ver "Middleware (Tower)"
        .with_state(state)
}

// handlers/orders.rs: devolver Router<AppState>, no llamar a with_state aquí
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/orders", post(create_order))
        .route("/orders/{id}", get(show_order))
}
```

Los parámetros de ruta de Axum 0.8 usan llaves (`/orders/{id}`, comodines `/{*rest}`); la sintaxis `:id` ya no es válida. Llama a `.with_state(...)` una sola vez, en la raíz.

### Sub-estados con FromRef

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

`FromRef` permite que los handlers y los extractors dependan de la porción de estado que necesitan, lo que además hace los extractors reutilizables.

### Handlers

Los handlers hacen cuatro cosas: extraer, validar, delegar, responder.

```rust
pub async fn create_order(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Json(body): Json<CreateOrderRequest>,
) -> Result<(StatusCode, Json<OrderResponse>), AppError> {
    let command = body.into_command(auth.user_id)?; // validación, parse-don't-validate
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

Directrices:
- Menos de 20 líneas por handler; delegar a partir de ahí
- El orden de los extractors importa: los extractors de cuerpo (`Json`, `Form`, `Bytes`) deben ir al final porque consumen la petición
- Usar DTOs de petición/respuesta dedicados; nunca exponer directamente tipos del dominio ni de la base de datos
- Devolver `201` con el recurso creado, `204` para un éxito sin contenido, `422` para los fallos de validación
- Los handlers son `async fn`; si llaman a código bloqueante, usar `tokio::task::spawn_blocking`

### Extractors personalizados

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

En axum 0.8 los traits de los extractors usan `async fn` nativo; no añadas `#[async_trait]`. Los extractors que pueden estar ausentes también pueden implementar `OptionalFromRequestParts` para usarse como `Option<T>`.

---

## Modelo de errores

### Capas

| Capa | Tipo de error | Crate |
|------|---------------|-------|
| domain | Enum `DomainError` (`thiserror`) | `thiserror` |
| application | `UseCaseError` que envuelve los errores del dominio y de los puertos | `thiserror` |
| infrastructure | Errores de adaptador mapeados a errores de puerto | `thiserror`, `sqlx::Error` |
| api (binario) | `AppError` que implementa `IntoResponse`; `anyhow` permitido para el arranque y el contexto interno | `anyhow` |

Las librerías exponen errores tipados sobre los que quien llama puede hacer match; solo el binario los borra.

### AppError y problem+json

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

Reglas:
- Un único `AppError`, un único mapeo a HTTP; los handlers devuelven `Result<T, AppError>` y usan `?`
- Seguir la RFC 9457 (`application/problem+json`: `type`, `title`, `status`, opcionalmente `detail`, `instance`)
- Nunca filtrar mensajes internos, errores SQL ni trazas de pila; registrarlos con `tracing::error!`
- Los propios rechazos de Axum (JSON incorrecto, ruta incorrecta) pueden mapearse al mismo formato con un wrapper de extractor personalizado o un adaptador de estilo `WithRejection`

---

## Persistencia con SQLx

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

Directrices:
- Solo parámetros enlazados (`$1`); preferir `query!` / `query_as!` verificados en compilación con los metadatos `.sqlx` commiteados (`cargo sqlx prepare --workspace`)
- Mapear las filas a tipos del dominio en la frontera del adaptador (`TryFrom<OrderRow>`), mantener los tipos de SQLx fuera del dominio
- Transacciones: iniciarlas en el adaptador o en una abstracción de unit-of-work, confirmar (commit) explícitamente; descartar (drop) una transacción la revierte
- Las migraciones son SQL versionado bajo `migrations/`, aditivas y retrocompatibles para los despliegues progresivos
- Pool dimensionado desde la configuración con un timeout de adquisición; nunca un pool por petición
- Las funciones de consulta de sqlx 0.9 aceptan literales de cadena (`SqlSafeStr`); el SQL dinámico requiere un wrapper explícito `AssertSqlSafe(...)`, que nunca debe envolver una entrada de usuario
- Paginación keyset para las listas grandes; agrupación con `ANY($1)` para evitar N+1

---

## Middleware (Tower)

```rust
use std::time::Duration;
use tower::ServiceBuilder;
use tower_http::{cors::CorsLayer, limit::RequestBodyLimitLayer, timeout::TimeoutLayer, trace::TraceLayer};

let app = Router::new()
    // ...rutas...
    .layer(
        ServiceBuilder::new()
            .layer(TraceLayer::new_for_http())
            .layer(TimeoutLayer::new(Duration::from_secs(10)))
            .layer(RequestBodyLimitLayer::new(1024 * 1024))
            .layer(CorsLayer::new() /* orígenes explícitos, nunca "any" con credenciales */),
    );
```

- `ServiceBuilder` aplica las capas de arriba abajo (la más externa primero); `Router::layer` coloca la última capa añadida como la más externa, así que conviene preferir un único `ServiceBuilder` por legibilidad
- Definir siempre un timeout de petición y un límite de tamaño de cuerpo
- Comprobar el constructor de `TimeoutLayer` en la versión instalada de `tower-http`, su firma cambió entre versiones
- La autenticación pertenece a un extractor (tipado, por ruta) o a una capa (global); evitar duplicar ambos
- Usar `axum::middleware::from_fn` para middleware personalizado pequeño

---

## Observabilidad y ciclo de vida

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

`expect` es aceptable aquí: se ejecuta en el arranque, no en una ruta de petición. Logs estructurados (JSON) con identificadores de petición; métricas y trazas mediante OpenTelemetry cuando sea necesario.

---

## Trabajo en segundo plano

- `tokio::spawn` para tareas cortas de tipo fire-and-forget solo cuando el fallo es aceptable; en caso contrario, usar una cola de trabajos (respaldada por base de datos o por un broker) con handlers idempotentes
- Hacer seguimiento de las tareas de larga duración con `tokio::task::JoinSet` y detenerlas en el apagado
- Nunca ejecutar trabajo intensivo en CPU o bloqueante en el executor: `spawn_blocking` o un pool rayon dedicado
- Usar canales acotados (`tokio::sync::mpsc::channel(n)`) para aplicar contrapresión (back-pressure)

---

## Fuentes

- Documentación de axum 0.8: https://docs.rs/axum/0.8.9/axum/ (sintaxis de rutas, `axum::serve`, `FromRef`, extractors)
- Lanzamiento de Rust 1.99.0: https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- Changelog de sqlx 0.9.0: https://github.com/launchbadge/sqlx/blob/main/CHANGELOG.md
- RFC 9457 (Problem Details for HTTP APIs): https://www.rfc-editor.org/rfc/rfc9457

Versiones citadas: axum 0.8.9, tokio 1.54.1, sqlx 0.9.0, tower-http 0.7.1 (crates.io).

## Checklist

- [ ] El crate/módulo de dominio no tiene dependencia de axum ni de sqlx (`cargo tree`)
- [ ] Los handlers son delgados y devuelven `Result<_, AppError>`
- [ ] Un único `AppError` implementa `IntoResponse` con cuerpos RFC 9457
- [ ] `thiserror` en las librerías, `anyhow` solo en el binario
- [ ] `Arc<AppState>` / `FromRef`, sin estado mutable global
- [ ] Las rutas usan la sintaxis `/{id}`, una sola llamada a `.with_state(...)`
- [ ] Capas de timeout, límite de cuerpo, tracing y CORS configuradas
- [ ] Parámetros enlazados de SQLx, metadatos `.sqlx` commiteados
- [ ] Apagado ordenado ante SIGTERM y Ctrl+C
- [ ] Sin llamadas bloqueantes en el executor asíncrono
