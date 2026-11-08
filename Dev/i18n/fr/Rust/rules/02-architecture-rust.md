# Architecture Rust / Axum - Workspace en couches et frontières hexagonales

## Principes architecturaux

### 1. Des frontières imposées par le compilateur

Rust offre un outil unique pour l'architecture : le graphe de crates. Une dépendance absente d'un `Cargo.toml` ne peut pas être utilisée. Servez-vous-en pour garder le domaine exempt de frameworks. Commencez par des modules dans une seule crate pour les petits services et découpez en crates lorsqu'une frontière commence à fuir.

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

### 2. Découpage en couches pragmatique

| Situation | Approche recommandée |
|-----------|----------------------|
| Service CRUD, peu de règles | Une seule crate : modules `handlers`, `db`, `domain` |
| Vraies règles métier, plusieurs adaptateurs | Workspace avec domain / application / infrastructure / api |
| Règle touchant une seule entité | Méthode sur le type du domaine, constructeur validé |
| Workflow couvrant plusieurs entités ou systèmes | Cas d'usage dans la couche application |
| Système externe (paiement, mail) | Port (trait) dans domain, adaptateur dans infrastructure |
| Préoccupation HTTP transverse | Couche Tower ou extractor |

**Règle empirique :** introduisez un trait lorsque vous avez deux implémentations ou un besoin de test double à une frontière d'E/S, pas avant (KISS, YAGNI). Les paramètres génériques (`impl OrderRepository`) sont préférés à `dyn`, sauf si une sélection à l'exécution est nécessaire.

### 3. Sens des dépendances

```
api ──> application ──> domain <── infrastructure
 │                                      ^
 └──────────── composition root ────────┘
```

- `domain` ne dépend de rien d'autre que `std` et de petites crates utilitaires (`thiserror`, `uuid`, `time`)
- `application` dépend uniquement de `domain`
- `infrastructure` implémente les ports de `domain` avec SQLx et des clients HTTP
- `api` assemble le tout (composition root) et est la seule crate dépendant d'axum
- Vérifiez avec `cargo tree -p domain` qu'aucun framework n'apparaît

---

## Router, State et Handlers

### État de l'application

```rust
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub place_order: Arc<PlaceOrder<PgOrderRepository>>,
    pub db: sqlx::PgPool, // PgPool is already a cheap, reference-counted handle
}
```

Le State doit être `Clone + Send + Sync + 'static`. Enveloppez les composants lourds dans un `Arc` ; ne construisez pas de clients à chaque requête.

### Composition du Router

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

Les paramètres de chemin d'Axum 0.8 utilisent des accolades (`/orders/{id}`, jokers `/{*rest}`) ; la syntaxe `:id` n'est plus valide. Appelez `.with_state(...)` une seule fois, au sommet.

### Sous-états avec FromRef

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

`FromRef` permet aux handlers et aux extractors de dépendre uniquement de la portion d'état dont ils ont besoin, ce qui rend aussi les extractors réutilisables.

### Handlers

Les handlers font quatre choses : extraire, valider, déléguer, répondre.

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

Directives :
- Moins de 20 lignes par handler ; déléguer au-delà
- L'ordre des extractors compte : les extractors de corps (`Json`, `Form`, `Bytes`) doivent venir en dernier car ils consomment la requête
- Utilisez des DTO de requête/réponse dédiés ; n'exposez jamais directement les types du domaine ou de la base de données
- Renvoyez `201` avec la ressource créée, `204` pour un succès sans contenu, `422` pour les échecs de validation
- Les handlers sont des `async fn` ; s'ils appellent du code bloquant, utilisez `tokio::task::spawn_blocking`

### Extractors personnalisés

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

Dans axum 0.8, les traits d'extractors utilisent `async fn` natif ; n'ajoutez pas `#[async_trait]`. Les extractors pouvant être absents peuvent aussi implémenter `OptionalFromRequestParts` pour être utilisés sous la forme `Option<T>`.

---

## Modèle d'erreurs

### Couches

| Couche | Type d'erreur | Crate |
|--------|---------------|-------|
| domain | Enum `DomainError` (`thiserror`) | `thiserror` |
| application | `UseCaseError` enveloppant les erreurs du domaine et des ports | `thiserror` |
| infrastructure | Erreurs d'adaptateurs converties en erreurs de ports | `thiserror`, `sqlx::Error` |
| api (binaire) | `AppError` implémentant `IntoResponse` ; `anyhow` autorisé pour le démarrage et le contexte interne | `anyhow` |

Les bibliothèques exposent des erreurs typées sur lesquelles les appelants peuvent faire un `match` ; seul le binaire les efface.

### AppError et problem+json

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

Règles :
- Une seule `AppError`, une seule conversion vers HTTP ; les handlers retournent `Result<T, AppError>` et utilisent `?`
- Suivre la RFC 9457 (`application/problem+json` : `type`, `title`, `status`, `detail` et `instance` optionnels)
- Ne jamais divulguer de messages internes, d'erreurs SQL ni de stack traces ; les journaliser avec `tracing::error!`
- Les rejets propres à axum (JSON invalide, chemin invalide) peuvent être convertis dans le même format avec un wrapper d'extractor personnalisé ou un adaptateur de type `WithRejection`

---

## Persistance avec SQLx

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

Directives :
- Paramètres liés uniquement (`$1`) ; préférer `query!` / `query_as!` vérifiés à la compilation avec les métadonnées `.sqlx` versionnées (`cargo sqlx prepare --workspace`)
- Convertir les lignes en types du domaine à la frontière de l'adaptateur (`TryFrom<OrderRow>`), garder les types SQLx hors du domaine
- Transactions : démarrer dans l'adaptateur ou dans une abstraction unit-of-work, valider explicitement ; abandonner une transaction la annule
- Les migrations sont du SQL versionné sous `migrations/`, additives et rétrocompatibles pour les déploiements progressifs
- Pool dimensionné depuis la configuration avec un timeout d'acquisition ; jamais un pool par requête
- Les fonctions de requête de sqlx 0.9 acceptent des littéraux de chaîne (`SqlSafeStr`) ; le SQL dynamique exige un wrapper explicite `AssertSqlSafe(...)`, qui ne doit jamais envelopper une entrée utilisateur
- Pagination keyset pour les grandes listes ; traitement par lots avec `ANY($1)` pour éviter le N+1

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

- `ServiceBuilder` applique les couches de haut en bas (la plus externe en premier) ; `Router::layer` place la dernière couche ajoutée la plus externe, donc préférez un seul `ServiceBuilder` pour la lisibilité
- Définissez toujours un timeout de requête et une limite de taille de corps
- Vérifiez le constructeur de `TimeoutLayer` dans la version installée de `tower-http`, sa signature a changé selon les versions
- L'authentification relève d'un extractor (typé, par route) ou d'une couche (globale) ; évitez de dupliquer les deux
- Utilisez `axum::middleware::from_fn` pour les petits middleware personnalisés

---

## Observabilité et cycle de vie

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

`expect` est acceptable ici : il s'exécute au démarrage, pas sur un chemin de requête. Journaux structurés (JSON) avec identifiants de requête ; métriques et traces via OpenTelemetry si nécessaire.

---

## Travail en arrière-plan

- `tokio::spawn` pour de courtes tâches fire-and-forget uniquement lorsque l'échec est acceptable ; sinon utilisez une file de jobs (adossée à la base de données ou à un broker) avec des handlers idempotents
- Suivez les tâches de longue durée avec `tokio::task::JoinSet` et arrêtez-les à l'arrêt du service
- N'exécutez jamais de travail intensif en CPU ou bloquant sur l'exécuteur : `spawn_blocking` ou un pool rayon dédié
- Utilisez des channels bornés (`tokio::sync::mpsc::channel(n)`) pour appliquer la contre-pression

---

## Sources

- Documentation axum 0.8 : https://docs.rs/axum/0.8.9/axum/ (syntaxe des chemins, `axum::serve`, `FromRef`, extractors)
- Release Rust 1.99.0 : https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- Changelog sqlx 0.9.0 : https://github.com/launchbadge/sqlx/blob/main/CHANGELOG.md
- RFC 9457 (Problem Details for HTTP APIs) : https://www.rfc-editor.org/rfc/rfc9457

Versions citées : axum 0.8.9, tokio 1.54.1, sqlx 0.9.0, tower-http 0.7.1 (crates.io).

## Checklist

- [ ] La crate/le module domain n'a aucune dépendance à axum ni sqlx (`cargo tree`)
- [ ] Les handlers sont fins et retournent `Result<_, AppError>`
- [ ] Une seule `AppError` implémente `IntoResponse` avec des corps RFC 9457
- [ ] `thiserror` dans les bibliothèques, `anyhow` uniquement dans le binaire
- [ ] `Arc<AppState>` / `FromRef`, aucun état mutable global
- [ ] Les routes utilisent la syntaxe `/{id}`, un seul appel `.with_state(...)`
- [ ] Couches timeout, limite de corps, tracing et CORS configurées
- [ ] Paramètres liés SQLx, métadonnées `.sqlx` versionnées
- [ ] Arrêt gracieux sur SIGTERM et Ctrl+C
- [ ] Aucun appel bloquant sur l'exécuteur async
