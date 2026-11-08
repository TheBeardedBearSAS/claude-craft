# Padrões de Testes Rust / Axum

O TDD é obrigatório: **Red -> Green -> Refactor**. Meta de cobertura: **>= 80%** (cargo-llvm-cov). Todo bug corrigido recebe um teste de regressão que falha antes da correção.

Todos os comandos são executados dentro do container (`docker compose exec app ...`).

## Visão Geral das Ferramentas

| Ferramenta | Papel | Comando |
|------------|-------|---------|
| `cargo test` (harness integrado) | Testes unitários, de integração e de documentação | `cargo test` |
| **cargo-nextest** | Runner rápido, isolamento de um processo por teste, retries, saída JUnit | `cargo nextest run` |
| **cargo-llvm-cov** | Cobertura baseada no código-fonte | `cargo llvm-cov nextest` |
| `#[sqlx::test]` | Banco de dados isolado por teste | no código de teste |
| **proptest** | Testes baseados em propriedades | no código de teste |
| **insta** | Testes de snapshot | `cargo insta review` |
| **cargo-mutants** | Testes de mutação | `cargo mutants` |
| **wiremock** | Mock HTTP de serviços externos | no código de teste |

Regras:
- O nextest não executa os doc tests; mantenha `cargo test --doc` como uma etapa separada da CI
- Escolha um único estilo de asserção (`assert_eq!`, opcionalmente `pretty_assertions`) e mantenha a consistência

## Pirâmide de Testes

| Tipo | Parcela | Velocidade | Localização em Rust |
|------|---------|------------|---------------------|
| Unitário (domain, casos de uso com ports fake) | 70% | < 1 s | `#[cfg(test)] mod tests` no mesmo arquivo |
| Integração (Router, banco de dados, adapters) | 20% | < 5 s | `crates/api/tests/*.rs`, `tests/` |
| End-to-end (servidor real, dependências reais) | 10% | < 30 s | `tests/e2e/`, executado contra o compose |

---

## Testes Unitários

Os testes unitários ficam ao lado do código e podem acessar itens privados.

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

Diretrizes:
- Nomeie os testes pelo comportamento (`pay_rejects_an_already_paid_order`), não pela função
- `unwrap()` / `expect()` são aceitáveis em testes
- Injete o tempo (port `Clock` ou parâmetro `now`); nunca leia o relógio do sistema no código de domínio
- Use pequenos builders ou funções de fixture, não statics mutáveis compartilhados

### Casos de Uso com Ports Fake

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

Prefira fakes escritos à mão a frameworks de mock para os ports: eles documentam o comportamento e sobrevivem às refatorações. Reserve o mocking (`mockall`) para fronteiras difíceis de simular com fakes.

---

## Testes de Integração: Router com `oneshot`

Acione o Router diretamente com `tower::ServiceExt::oneshot`; nenhum listener TCP é necessário.

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

Diretrizes:
- Exponha `build_router(state)` a partir de um target de biblioteca para que os testes (e o binário) compartilhem a mesma ligação
- O `oneshot` consome o router; chame `.clone()` antes ou use `into_service()` + `ready()` para várias requisições
- Teste a pilha completa de middleware, os corpos de erro (problem+json) e a autorização, não apenas os caminhos felizes
- Verifique o status, os headers (`content-type`, `www-authenticate`) e o formato do corpo

### Testando um Listener Real (opcional)

Para testes de WebSocket, de graceful shutdown ou de bibliotecas cliente, faça o bind em uma porta efêmera:

```rust
let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
let addr = listener.local_addr().unwrap();
tokio::spawn(async move { axum::serve(listener, build_router(state)).await.unwrap() });
// chame http://{addr} com o reqwest
```

---

## Testes de Banco de Dados com `#[sqlx::test]`

`#[sqlx::test]` cria um banco de dados novo para cada teste, aplica as migrations, fornece um pool e faz a limpeza em caso de sucesso (os testes que falham mantêm o banco para inspeção).

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

#[sqlx::test(migrations = "../../migrations")]       // substitua o caminho das migrations quando necessário
async fn custom_migrations_path(pool: PgPool) { /* ... */ }
```

Requisitos e dicas:
- `DATABASE_URL` deve apontar para um servidor Postgres em que o usuário possa criar bancos de dados (o serviço `db` do compose)
- Os testes são isolados entre si e podem executar em paralelo; não dependa da ordem nem de linhas compartilhadas
- As fixtures são SQL puro aplicado na ordem indicada; ordene-as para satisfazer as chaves estrangeiras
- Mantenha um teste separado para cada restrição (unique, chave estrangeira) em que a aplicação se apoia
- Execute `cargo sqlx prepare --check --workspace` na CI para que as macros compilem offline

---

## Testes Baseados em Propriedades (proptest)

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

Use propriedades para parsers, value objects, round-trips de serialização e máquinas de estado. O proptest armazena os casos que falham em `proptest-regressions/`; versione esse diretório.

## Testes de Snapshot (insta)

```rust
#[test]
fn problem_json_for_not_found() {
    let body = render_problem(&AppError::NotFound);
    insta::assert_json_snapshot!(body);
}
```

Revise os snapshots com `cargo insta review`; versione os arquivos `.snap`; nunca aceite às cegas. Adequado para corpos de erro de API, documentos OpenAPI e templates renderizados.

## Mock de HTTP Externo (wiremock)

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

Nunca chame serviços reais de terceiros nos testes.

---

## Testes Assíncronos e Tempo

- `#[tokio::test]` para testes unitários assíncronos; `#[tokio::test(flavor = "multi_thread")]` somente quando o código precisar
- `tokio::time::pause()` (feature `test-util`) com `advance` torna os timers determinísticos; sem `sleep` real
- Evite asserções que dependam da ordem de agendamento das tasks; use canais ou `JoinHandle::await`
- Teste os caminhos de cancelamento: descartar a future de um handler não deve deixar estado parcial (use transações)

---

## Executando a Suíte

```bash
docker compose exec app cargo nextest run --workspace
docker compose exec app cargo nextest run --workspace --retries 0 --no-fail-fast
docker compose exec app cargo test --workspace --doc
docker compose exec app cargo llvm-cov nextest --workspace --fail-under-lines 80
docker compose exec app cargo llvm-cov nextest --workspace --html      # target/llvm-cov/html
docker compose exec app cargo mutants --in-diff changes.diff            # mutantes no código alterado
```

Configure o nextest em `.config/nextest.toml`:

```toml
[profile.default]
fail-fast = false
slow-timeout = { period = "30s", terminate-after = 2 }

[profile.ci]
retries = 0
junit.path = "junit.xml"
```

O `cargo llvm-cov` requer o componente rustup `llvm-tools-preview` (declarado em `rust-toolchain.toml`). Exclua do relatório o código gerado e o bootstrap do `main.rs` com `--ignore-filename-regex`, e não reduzindo o limite.

## Cobertura Esperada

| Camada | Meta |
|--------|------|
| Domain e application | >= 90% |
| Camada HTTP (testes de Router) | >= 80% |
| Geral (cargo-llvm-cov) | >= 80% |
| Mutation score (domain, consultivo) | >= 70% dos mutantes sobreviventes triados |
| Jornadas críticas | Testes no nível do Router ou end-to-end |

A cobertura mente; o teste de mutação diz a verdade. Execute `cargo mutants` nos crates domain e application em um job noturno e trate os sobreviventes como asserções ausentes.

---

## Anti-padrões

| Anti-padrão | Correção |
|-------------|----------|
| Testes que verificam a implementação (contagem de chamadas) | Verifique o comportamento observável |
| Banco de dados compartilhado entre testes | `#[sqlx::test]` por teste |
| `sleep` para aguardar trabalho assíncrono | Canais, `tokio::time::pause`, polling com timeout |
| `#[ignore]` sem ticket | Corrija ou apague |
| Fixtures gigantes reutilizadas em todo lugar | Pequenos builders por teste |
| Chamadas HTTP reais a terceiros | wiremock |

---

## Fontes

- cargo-nextest 0.9.151: https://nexte.st/
- sqlx `#[sqlx::test]`: https://docs.rs/sqlx/latest/sqlx/attr.test.html
- Exemplo de testes do axum (`oneshot`): https://github.com/tokio-rs/axum/tree/main/examples/testing
- cargo-llvm-cov: https://github.com/taiki-e/cargo-llvm-cov
- proptest 1.12.0, insta 1.49.0, cargo-mutants 27.1.0 (crates.io)

## Checklist

- [ ] Testes escritos primeiro (Red -> Green -> Refactor)
- [ ] Cobertura >= 80% imposta pelo cargo-llvm-cov (`--fail-under-lines 80`)
- [ ] Camadas unitária, de Router (`oneshot`) e de banco de dados (`#[sqlx::test]`) cobertas
- [ ] Sem `sleep`; relógio injetado, `tokio::time::pause` para os timers
- [ ] HTTP externo simulado (wiremock), nunca real
- [ ] Autorização testada: usuários não acessam os registros de outros usuários
- [ ] Respostas de erro (problem+json) verificadas, não apenas os caminhos felizes
- [ ] Toda correção de bug tem um teste de regressão
- [ ] Doc tests executados separadamente (`cargo test --doc`)
- [ ] Testes de mutação agendados nos crates domain e application
