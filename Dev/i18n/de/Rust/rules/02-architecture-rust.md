# Rust-/Axum-Architektur - Geschichteter Workspace & hexagonale Grenzen

## Architekturprinzipien

### 1. Vom Compiler erzwungene Grenzen

Rust bietet für die Architektur ein einzigartiges Werkzeug: den Crate-Graphen. Eine Abhängigkeit, die in keiner `Cargo.toml` steht, kann nicht verwendet werden. Damit bleibt die Domäne frei von Frameworks. Bei kleinen Services mit Modulen in einem einzelnen Crate beginnen und in Crates aufteilen, sobald eine Grenze undicht wird.

```
Cargo.toml                    # [workspace], [workspace.dependencies], [workspace.lints]
rust-toolchain.toml
crates/
├── domain/                   # Entitäten, Value Objects, Domänenfehler, Ports (Traits)
│   └── src/
│       ├── lib.rs
│       ├── order.rs
│       └── ports.rs          # OrderRepository, Clock, PaymentGateway
├── application/              # Anwendungsfälle: orchestrieren Domänenobjekte über Ports
│   └── src/
│       ├── lib.rs
│       └── place_order.rs
├── infrastructure/           # Adapter: SQLx-Repositories, HTTP-Clients, Mail
│   └── src/
│       ├── lib.rs
│       └── pg_order_repository.rs
└── api/                      # Binary: Composition Root und HTTP-Schicht
    └── src/
        ├── main.rs           # Konfiguration, Tracing, Listener, Graceful Shutdown
        ├── state.rs          # AppState
        ├── router.rs
        ├── error.rs          # AppError + IntoResponse
        ├── extractors/
        └── handlers/
migrations/                   # SQLx-Migrationen
tests/                        # Integrationstests auf Router-Ebene
```

### 2. Pragmatische Schichtung

| Situation | Empfohlener Ansatz |
|-----------|--------------------|
| CRUD-Service, wenige Regeln | Einzelnes Crate: Module `handlers`, `db`, `domain` |
| Echte Geschäftsregeln, mehrere Adapter | Workspace mit domain / application / infrastructure / api |
| Regel, die eine Entität betrifft | Methode auf dem Domänentyp, validierter Konstruktor |
| Workflow über mehrere Entitäten oder Systeme | Anwendungsfall in der Application-Schicht |
| Externes System (Zahlung, Mail) | Port (Trait) in der Domäne, Adapter in der Infrastruktur |
| Übergreifender HTTP-Belang | Tower-Layer oder Extractor |

**Faustregel:** Ein Trait erst einführen, wenn es zwei Implementierungen gibt oder ein Test-Double an einer I/O-Grenze nötig ist, nicht früher (KISS, YAGNI). Generische Parameter (`impl OrderRepository`) sind `dyn` vorzuziehen, es sei denn, eine Auswahl zur Laufzeit ist erforderlich.

### 3. Abhängigkeitsrichtung

```
api ──> application ──> domain <── infrastructure
 │                                      ^
 └──────────── composition root ────────┘
```

- `domain` hängt von nichts ab außer `std` und kleinen Hilfs-Crates (`thiserror`, `uuid`, `time`)
- `application` hängt nur von `domain` ab
- `infrastructure` implementiert die `domain`-Ports mit SQLx und HTTP-Clients
- `api` verdrahtet alles (Composition Root) und ist das einzige Crate, das von axum abhängt
- Mit `cargo tree -p domain` prüfen, dass kein Framework auftaucht

---

## Router, State und Handler

### Anwendungszustand (State)

```rust
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub place_order: Arc<PlaceOrder<PgOrderRepository>>,
    pub db: sqlx::PgPool, // PgPool ist bereits ein günstiges, referenzgezähltes Handle
}
```

Der State muss `Clone + Send + Sync + 'static` sein. Schwergewichtige Komponenten in `Arc` wickeln; keine Clients pro Request erzeugen.

### Router-Komposition

```rust
use axum::{routing::{get, post}, Router};

pub fn build_router(state: AppState) -> Router {
    Router::new()
        .merge(orders::routes())
        .route("/health", get(|| async { "ok" }))
        // .layer(ServiceBuilder::new()...) siehe "Middleware (Tower)"
        .with_state(state)
}

// handlers/orders.rs: Router<AppState> zurückgeben, hier nicht with_state aufrufen
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/orders", post(create_order))
        .route("/orders/{id}", get(show_order))
}
```

Pfadparameter in Axum 0.8 verwenden geschweifte Klammern (`/orders/{id}`, Wildcards `/{*rest}`); die Syntax `:id` ist nicht mehr gültig. `.with_state(...)` nur einmal ganz oben aufrufen.

### Teil-States mit FromRef

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

`FromRef` erlaubt es Handlern und Extractors, nur von dem Ausschnitt des States abzuhängen, den sie brauchen, was Extractors zugleich wiederverwendbar macht.

### Handler

Handler tun vier Dinge: extrahieren, validieren, delegieren, antworten.

```rust
pub async fn create_order(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Json(body): Json<CreateOrderRequest>,
) -> Result<(StatusCode, Json<OrderResponse>), AppError> {
    let command = body.into_command(auth.user_id)?; // Validierung, parse-don't-validate
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

Richtlinien:
- Weniger als 20 Zeilen pro Handler; darüber hinaus delegieren
- Die Reihenfolge der Extractors ist wichtig: Body-Extractors (`Json`, `Form`, `Bytes`) müssen zuletzt stehen, da sie den Request verbrauchen
- Dedizierte Request-/Response-DTOs verwenden; Domänen- oder Datenbanktypen niemals direkt exponieren
- `201` mit der erstellten Ressource zurückgeben, `204` für leeren Erfolg, `422` bei Validierungsfehlern
- Handler sind `async fn`; rufen sie blockierenden Code auf, `tokio::task::spawn_blocking` verwenden

### Eigene Extractors

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

In Axum 0.8 verwenden die Extractor-Traits natives `async fn`; kein `#[async_trait]` hinzufügen. Extractors, die fehlen dürfen, können zusätzlich `OptionalFromRequestParts` implementieren, um als `Option<T>` verwendet zu werden.

---

## Fehlermodell

### Schichten

| Schicht | Fehlertyp | Crate |
|---------|-----------|-------|
| domain | `DomainError`-Enum (`thiserror`) | `thiserror` |
| application | `UseCaseError`, das Domänen- und Port-Fehler umschließt | `thiserror` |
| infrastructure | Adapter-Fehler, auf Port-Fehler abgebildet | `thiserror`, `sqlx::Error` |
| api (Binary) | `AppError`, das `IntoResponse` implementiert; `anyhow` für Start und internen Kontext erlaubt | `anyhow` |

Bibliotheken stellen typisierte Fehler bereit, auf die Aufrufer per Match reagieren können; nur das Binary löscht die Typen.

### AppError und problem+json

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

Regeln:
- Ein `AppError`, ein Mapping auf HTTP; Handler geben `Result<T, AppError>` zurück und verwenden `?`
- RFC 9457 befolgen (`application/problem+json`: `type`, `title`, `status`, optional `detail`, `instance`)
- Niemals interne Meldungen, SQL-Fehler oder Stack-Traces preisgeben; sie mit `tracing::error!` protokollieren
- Axums eigene Rejections (fehlerhaftes JSON, fehlerhafter Pfad) lassen sich mit einem eigenen Extractor-Wrapper oder einem Adapter im Stil von `WithRejection` auf dasselbe Format abbilden

---

## Persistenz mit SQLx

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

Richtlinien:
- Ausschließlich Bind-Parameter (`$1`); zur Compile-Zeit geprüfte `query!` / `query_as!` mit eingecheckten `.sqlx`-Metadaten bevorzugen (`cargo sqlx prepare --workspace`)
- Zeilen an der Adapter-Grenze auf Domänentypen abbilden (`TryFrom<OrderRow>`), SQLx-Typen aus der Domäne heraushalten
- Transaktionen: im Adapter oder in einer Unit-of-Work-Abstraktion beginnen, explizit committen; das Droppen einer Transaktion rollt sie zurück
- Migrationen sind versioniertes SQL unter `migrations/`, additiv und abwärtskompatibel für Rolling Deployments
- Pool aus der Konfiguration dimensioniert, mit Acquire-Timeout; niemals ein Pool pro Request
- Die Query-Funktionen von sqlx 0.9 akzeptieren String-Literale (`SqlSafeStr`); dynamisches SQL benötigt einen expliziten Wrapper `AssertSqlSafe(...)`, der niemals Benutzereingaben umschließen darf
- Keyset-Paginierung für große Listen; Batching mit `ANY($1)`, um N+1 zu vermeiden

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

- `ServiceBuilder` wendet Layer von oben nach unten an (äußerster zuerst); `Router::layer` setzt den zuletzt hinzugefügten Layer am weitesten außen, daher aus Gründen der Lesbarkeit einen einzigen `ServiceBuilder` bevorzugen
- Immer ein Request-Timeout und ein Limit für die Body-Größe setzen
- Den Konstruktor von `TimeoutLayer` in der installierten `tower-http`-Version prüfen, seine Signatur hat sich zwischen Releases geändert
- Authentifizierung gehört in einen Extractor (typisiert, pro Route) oder einen Layer (pauschal); beides doppelt zu führen vermeiden
- Für kleine eigene Middleware `axum::middleware::from_fn` verwenden

---

## Observability und Lebenszyklus

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

`expect` ist hier akzeptabel: Es läuft beim Start, nicht auf einem Request-Pfad. Strukturierte Logs (JSON) mit Request-IDs; Metriken und Traces bei Bedarf über OpenTelemetry.

---

## Hintergrundarbeit

- `tokio::spawn` für kurze Fire-and-forget-Tasks nur, wenn ein Fehlschlag akzeptabel ist; andernfalls eine Job-Queue (datenbankgestützt oder Broker) mit idempotenten Handlern verwenden
- Langlebige Tasks mit `tokio::task::JoinSet` nachverfolgen und beim Shutdown stoppen
- Niemals CPU-intensive oder blockierende Arbeit auf dem Executor ausführen: `spawn_blocking` oder ein dedizierter rayon-Pool
- Begrenzte Channels (`tokio::sync::mpsc::channel(n)`) verwenden, um Back-Pressure anzuwenden

---

## Quellen

- axum-0.8-Dokumentation: https://docs.rs/axum/0.8.9/axum/ (Pfadsyntax, `axum::serve`, `FromRef`, Extractors)
- Rust-1.99.0-Release: https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- sqlx-0.9.0-Changelog: https://github.com/launchbadge/sqlx/blob/main/CHANGELOG.md
- RFC 9457 (Problem Details for HTTP APIs): https://www.rfc-editor.org/rfc/rfc9457

Zitierte Versionen: axum 0.8.9, tokio 1.54.1, sqlx 0.9.0, tower-http 0.7.1 (crates.io).

## Checkliste

- [ ] Domain-Crate/-Modul hat keine Abhängigkeit zu axum oder sqlx (`cargo tree`)
- [ ] Handler sind dünn und geben `Result<_, AppError>` zurück
- [ ] Ein `AppError` implementiert `IntoResponse` mit Bodys nach RFC 9457
- [ ] `thiserror` in Bibliotheken, `anyhow` nur im Binary
- [ ] `Arc<AppState>` / `FromRef`, kein globaler veränderlicher Zustand
- [ ] Routen verwenden die Syntax `/{id}`, ein einziger Aufruf von `.with_state(...)`
- [ ] Layer für Timeout, Body-Limit, Tracing und CORS konfiguriert
- [ ] SQLx-Bind-Parameter, `.sqlx`-Metadaten eingecheckt
- [ ] Graceful Shutdown bei SIGTERM und Strg+C
- [ ] Keine blockierenden Aufrufe auf dem asynchronen Executor
