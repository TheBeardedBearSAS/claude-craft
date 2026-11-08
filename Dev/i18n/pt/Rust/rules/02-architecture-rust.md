# Arquitetura Rust / Axum - Workspace em Camadas e Fronteiras Hexagonais

## Princípios Arquiteturais

### 1. Fronteiras impostas pelo compilador

Rust oferece uma ferramenta única para a arquitetura: o grafo de crates. Uma dependência ausente de um `Cargo.toml` não pode ser usada. Aproveite isso para manter o domínio livre de frameworks. Comece com módulos em um único crate para serviços pequenos e divida em crates quando uma fronteira começar a vazar.

```
Cargo.toml                    # [workspace], [workspace.dependencies], [workspace.lints]
rust-toolchain.toml
crates/
├── domain/                   # Entidades, value objects, erros de domínio, ports (traits)
│   └── src/
│       ├── lib.rs
│       ├── order.rs
│       └── ports.rs          # OrderRepository, Clock, PaymentGateway
├── application/              # Casos de uso: orquestram objetos de domínio por meio de ports
│   └── src/
│       ├── lib.rs
│       └── place_order.rs
├── infrastructure/           # Adapters: repositórios SQLx, clientes HTTP, e-mail
│   └── src/
│       ├── lib.rs
│       └── pg_order_repository.rs
└── api/                      # Binário: composition root e camada HTTP
    └── src/
        ├── main.rs           # Config, tracing, listener, graceful shutdown
        ├── state.rs          # AppState
        ├── router.rs
        ├── error.rs          # AppError + IntoResponse
        ├── extractors/
        └── handlers/
migrations/                   # Migrations SQLx
tests/                        # Testes de integração no nível do Router
```

### 2. Camadas pragmáticas

| Situação | Abordagem recomendada |
|----------|-----------------------|
| Serviço CRUD, poucas regras | Um único crate: módulos `handlers`, `db`, `domain` |
| Regras de negócio reais, vários adapters | Workspace com domain / application / infrastructure / api |
| Regra que afeta uma entidade | Método no tipo de domínio, construtor validado |
| Fluxo que abrange várias entidades ou sistemas | Caso de uso na camada de aplicação |
| Sistema externo (pagamento, e-mail) | Port (trait) no domain, adapter na infrastructure |
| Preocupação HTTP transversal | Layer Tower ou extractor |

**Regra prática:** introduza uma trait quando houver duas implementações ou necessidade de um test double em uma fronteira de I/O, e não antes (KISS, YAGNI). Parâmetros genéricos (`impl OrderRepository`) são preferíveis a `dyn`, a menos que a seleção em tempo de execução seja necessária.

### 3. Direção das Dependências

```
api ──> application ──> domain <── infrastructure
 │                                      ^
 └──────────── composition root ────────┘
```

- `domain` não depende de nada além de `std` e de pequenos crates utilitários (`thiserror`, `uuid`, `time`)
- `application` depende somente de `domain`
- `infrastructure` implementa os ports de `domain` com SQLx e clientes HTTP
- `api` conecta tudo (composition root) e é o único crate que depende do axum
- Verifique com `cargo tree -p domain` que nenhum framework aparece

---

## Router, State e Handlers

### Estado da Aplicação

```rust
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub place_order: Arc<PlaceOrder<PgOrderRepository>>,
    pub db: sqlx::PgPool, // PgPool já é um handle barato, com contagem de referências
}
```

O state deve ser `Clone + Send + Sync + 'static`. Envolva os componentes pesados em `Arc`; não construa clientes a cada requisição.

### Composição do Router

```rust
use axum::{routing::{get, post}, Router};

pub fn build_router(state: AppState) -> Router {
    Router::new()
        .merge(orders::routes())
        .route("/health", get(|| async { "ok" }))
        // .layer(ServiceBuilder::new()...) veja "Middleware (Tower)"
        .with_state(state)
}

// handlers/orders.rs: retorne Router<AppState>, não chame with_state aqui
pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/orders", post(create_order))
        .route("/orders/{id}", get(show_order))
}
```

Os parâmetros de caminho do Axum 0.8 usam chaves (`/orders/{id}`, wildcards `/{*rest}`); a sintaxe `:id` não é mais válida. Chame `.with_state(...)` uma única vez, no topo.

### Sub-states com FromRef

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

`FromRef` permite que handlers e extractors dependam apenas da fatia do state de que precisam, o que também torna os extractors reutilizáveis.

### Handlers

Os handlers fazem quatro coisas: extrair, validar, delegar, responder.

```rust
pub async fn create_order(
    State(state): State<AppState>,
    auth: AuthenticatedUser,
    Json(body): Json<CreateOrderRequest>,
) -> Result<(StatusCode, Json<OrderResponse>), AppError> {
    let command = body.into_command(auth.user_id)?; // validação, parse-don't-validate
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

Diretrizes:
- Menos de 20 linhas por handler; delegue o que passar disso
- A ordem dos extractors importa: os extractors de corpo (`Json`, `Form`, `Bytes`) devem ser os últimos, pois consomem a requisição
- Use DTOs dedicados de requisição/resposta; nunca exponha diretamente tipos de domínio ou de banco de dados
- Retorne `201` com o recurso criado, `204` para sucesso sem conteúdo, `422` para falhas de validação
- Os handlers são `async fn`; se chamarem código bloqueante, use `tokio::task::spawn_blocking`

### Extractors Personalizados

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

No axum 0.8, as traits de extractors usam `async fn` nativo; não adicione `#[async_trait]`. Extractors que podem estar ausentes também podem implementar `OptionalFromRequestParts` para serem usados como `Option<T>`.

---

## Modelo de Erros

### Camadas

| Camada | Tipo de erro | Crate |
|--------|--------------|-------|
| domain | enum `DomainError` (`thiserror`) | `thiserror` |
| application | `UseCaseError` que encapsula erros de domínio e de ports | `thiserror` |
| infrastructure | Erros de adapter mapeados para erros de port | `thiserror`, `sqlx::Error` |
| api (binário) | `AppError` implementando `IntoResponse`; `anyhow` permitido para a inicialização e para contexto interno | `anyhow` |

As bibliotecas expõem erros tipados nos quais quem as chama pode fazer match; somente o binário os apaga.

### AppError e problem+json

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

Regras:
- Um único `AppError`, um único mapeamento para HTTP; os handlers retornam `Result<T, AppError>` e usam `?`
- Siga a RFC 9457 (`application/problem+json`: `type`, `title`, `status`, opcionalmente `detail`, `instance`)
- Nunca vaze mensagens internas, erros SQL ou stack traces; registre-os com `tracing::error!`
- As próprias rejeições do Axum (JSON inválido, caminho inválido) podem ser mapeadas para o mesmo formato com um wrapper de extractor personalizado ou um adapter no estilo `WithRejection`

---

## Persistência com SQLx

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

Diretrizes:
- Somente parâmetros bind (`$1`); prefira `query!` / `query_as!` verificados em tempo de compilação, com os metadados `.sqlx` versionados (`cargo sqlx prepare --workspace`)
- Mapeie as linhas para tipos de domínio na fronteira do adapter (`TryFrom<OrderRow>`), mantendo os tipos do SQLx fora do domínio
- Transações: inicie no adapter ou em uma abstração de unit-of-work e faça commit explicitamente; descartar uma transação provoca o rollback
- As migrations são SQL versionado em `migrations/`, aditivas e retrocompatíveis para deploys graduais (rolling)
- Pool dimensionado a partir da configuração, com timeout de aquisição; nunca um pool por requisição
- As funções de consulta do sqlx 0.9 aceitam literais de string (`SqlSafeStr`); SQL dinâmico exige um wrapper explícito `AssertSqlSafe(...)`, que nunca deve envolver dados do usuário
- Paginação keyset para listas grandes; batching com `ANY($1)` para evitar N+1

---

## Middleware (Tower)

```rust
use std::time::Duration;
use tower::ServiceBuilder;
use tower_http::{cors::CorsLayer, limit::RequestBodyLimitLayer, timeout::TimeoutLayer, trace::TraceLayer};

let app = Router::new()
    // ...rotas...
    .layer(
        ServiceBuilder::new()
            .layer(TraceLayer::new_for_http())
            .layer(TimeoutLayer::new(Duration::from_secs(10)))
            .layer(RequestBodyLimitLayer::new(1024 * 1024))
            .layer(CorsLayer::new() /* origens explícitas, nunca "any" com credenciais */),
    );
```

- O `ServiceBuilder` aplica os layers de cima para baixo (o mais externo primeiro); `Router::layer` aplica o último layer adicionado como o mais externo, então prefira um único `ServiceBuilder` por legibilidade
- Defina sempre um timeout de requisição e um limite de tamanho do corpo
- Verifique o construtor de `TimeoutLayer` na versão instalada do `tower-http`; sua assinatura mudou entre releases
- A autenticação pertence a um extractor (tipado, por rota) ou a um layer (global); evite duplicar os dois
- Use `axum::middleware::from_fn` para middleware personalizado pequeno

---

## Observabilidade e Ciclo de Vida

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

`expect` é aceitável aqui: ele executa na inicialização, não em um caminho de requisição. Logs estruturados (JSON) com IDs de requisição; métricas e traces via OpenTelemetry quando necessário.

---

## Trabalho em Segundo Plano

- `tokio::spawn` apenas para tarefas curtas do tipo fire-and-forget quando a falha é aceitável; caso contrário, use uma fila de jobs (baseada em banco de dados ou broker) com handlers idempotentes
- Acompanhe as tarefas de longa duração com `tokio::task::JoinSet` e interrompa-as no shutdown
- Nunca execute trabalho intensivo de CPU ou bloqueante no executor: use `spawn_blocking` ou um pool rayon dedicado
- Use canais limitados (`tokio::sync::mpsc::channel(n)`) para aplicar back-pressure

---

## Fontes

- Documentação do axum 0.8: https://docs.rs/axum/0.8.9/axum/ (sintaxe de caminhos, `axum::serve`, `FromRef`, extractors)
- Release do Rust 1.99.0: https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- Changelog do sqlx 0.9.0: https://github.com/launchbadge/sqlx/blob/main/CHANGELOG.md
- RFC 9457 (Problem Details for HTTP APIs): https://www.rfc-editor.org/rfc/rfc9457

Versões citadas: axum 0.8.9, tokio 1.54.1, sqlx 0.9.0, tower-http 0.7.1 (crates.io).

## Checklist

- [ ] O crate/módulo domain não tem dependência de axum nem de sqlx (`cargo tree`)
- [ ] Os handlers são enxutos e retornam `Result<_, AppError>`
- [ ] Um único `AppError` implementa `IntoResponse` com corpos conformes à RFC 9457
- [ ] `thiserror` nas bibliotecas, `anyhow` apenas no binário
- [ ] `Arc<AppState>` / `FromRef`, sem estado global mutável
- [ ] As rotas usam a sintaxe `/{id}`, uma única chamada a `.with_state(...)`
- [ ] Layers de timeout, limite de corpo, tracing e CORS configurados
- [ ] Parâmetros bind do SQLx, metadados `.sqlx` versionados
- [ ] Graceful shutdown em SIGTERM e Ctrl+C
- [ ] Nenhuma chamada bloqueante no executor assíncrono
