# Padrões de Código Rust

## Visão Geral

Padrões para código Rust (edition 2024) em serviços Axum. As Rust API Guidelines, o rustfmt e o clippy são a autoridade; este documento resume as regras do projeto e o raciocínio por trás delas.

## Cabeçalho de Crate e Lints Obrigatórios

```rust
#![forbid(unsafe_code)]
```

Todo crate de aplicação proíbe `unsafe`. A forma preferida é uma tabela de lints do workspace, herdada por cada membro:

```toml
# Cargo.toml (raiz do workspace)
[workspace.lints.rust]
unsafe_code = "forbid"

[workspace.lints.clippy]
all = { level = "warn", priority = -1 }
pedantic = { level = "warn", priority = -1 }
unwrap_used = "deny"
expect_used = "warn"
panic = "deny"

# crates/api/Cargo.toml
[lints]
workspace = true
```

`clippy::unwrap_used` e `clippy::panic` mantêm os panics fora dos caminhos de requisição; relaxe-os no código de teste com `#![cfg_attr(test, allow(clippy::unwrap_used))]` ou um `clippy.toml` (`allow-unwrap-in-tests = true`). Se uma dependência realmente precisar de `unsafe`, isole-a em um crate separado e revisado em vez de enfraquecer o lint.

---

## Convenções de Nomenclatura (Rust API Guidelines)

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Crates, módulos, arquivos | `snake_case` | `order_item.rs` |
| Tipos, traits, variantes de enum | `UpperCamelCase` | `OrderItem`, `PaymentGateway` |
| Funções, métodos, variáveis | `snake_case` | `calculate_total` |
| Constantes, statics | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |
| Parâmetros de tipo | `UpperCamelCase` curto | `T`, `S`, `Repo` |
| Getters | Sem prefixo `get_` | `fn name(&self)` |
| Conversões | `as_` (borrow barato), `to_` (custoso), `into_` (consome) | `as_str`, `to_vec`, `into_inner` |
| Construtores | `new`, `with_*`, `from_*`, `try_from` | `Order::new` |
| Booleanos | Forma de predicado, `is_` não é obrigatório mas comum | `is_empty`, `has_items` |
| Bindings não utilizados | Prefixo `_` | `_state` |

```rust
// RUIM
struct order_item;
fn getTotal(&self) -> i64;

// BOM
struct OrderItem;
fn total(&self) -> Money;
```

---

## Formatação

| Regra | Valor |
|-------|-------|
| Formatador | `rustfmt` (`cargo fmt`), a CI executa `cargo fmt --check` |
| Indentação | 4 espaços |
| Largura da linha | 100 caracteres (padrão do rustfmt; mantenha a configuração mínima) |
| Imports | Agrupados std / externos / crate, um `use` por árvore de caminho |
| Vírgulas finais | Obrigatórias em literais de várias linhas (o rustfmt as adiciona) |
| Edition | `edition = "2024"` em todo crate |

```toml
# rustfmt.toml: mantenha-o pequeno, os padrões são o standard
edition = "2024"
```

Execute `docker compose exec app cargo fmt` para formatar; nunca formate à mão.

---

## Funções

### Tamanho e Complexidade (KISS)

| Métrica | Alvo | Limite |
|---------|------|--------|
| Linhas por função | < 10 | < 20 |
| Parâmetros | 3 | 4 no máximo (use uma struct ou um builder) |
| Complexidade cognitiva | < 7 | < 10 |
| Profundidade de aninhamento | 2 | 3 no máximo |

Os lints `cognitive_complexity` e `too_many_arguments` do clippy ajudam; defina `cognitive-complexity-threshold` no `clippy.toml` para corresponder ao limite do projeto.

### Retornos Antecipados e `?`

```rust
// RUIM: match aninhado
fn discount(user: Option<&User>) -> u8 {
    match user {
        Some(u) => {
            if u.is_premium() { 20 } else { 0 }
        }
        None => 0,
    }
}

// BOM: let-else e guard clauses
fn discount(user: Option<&User>) -> u8 {
    let Some(user) = user else { return 0 };
    if !user.is_premium() {
        return 0;
    }
    20
}
```

### Newtypes e Parsing na Fronteira

```rust
// RUIM: obsessão por primitivos, validação espalhada
fn send_invoice(email: String, amount: i64) {}

// BOM: faça o parse uma vez, carregue a garantia no tipo
pub struct EmailAddress(String);

impl EmailAddress {
    pub fn parse(raw: &str) -> Result<Self, DomainError> {
        if raw.contains('@') && raw.len() <= 254 {
            Ok(Self(raw.to_owned()))
        } else {
            Err(DomainError::InvalidEmail)
        }
    }
}
```

Torne os estados inválidos irrepresentáveis: enums no lugar de booleanos e strings, `NonZeroU32`, `Duration` no lugar de inteiros brutos.

---

## Ownership e Borrowing

| Situação | Orientação |
|----------|------------|
| A função apenas lê | Receba `&str`, `&[T]`, `&T` |
| A função armazena ou consome | Receba o valor owned (`String`, `Vec<T>`) ou `impl Into<String>` |
| Dado emprestado opcional | `Option<&T>` em vez de `&Option<T>` |
| Compartilhamento entre tasks | `Arc<T>`; mutabilidade interior via `tokio::sync::Mutex` ou `RwLock` somente quando necessário |
| Retorno de dado emprestado | Elida os lifetimes; nomeie-os apenas quando a elisão falhar |
| Cópias pesadas | Passe referências, use `Cow<'_, str>` quando a ownership for condicional |

```rust
// RUIM: clone desnecessário para agradar o borrow checker
let name = user.name.clone();
log(&name);

// BOM: faça o borrow
log(&user.name);
```

Diretrizes:
- Um `.clone()` que existe apenas para silenciar o borrow checker é um sinal de problema de design; reestruture primeiro
- Clone `Arc`s à vontade (barato), clone dados owned grandes de forma deliberada
- Prefira iteradores e combinators a loops com índice; evite coletar em um `Vec` só para iterar de novo
- Nunca mantenha um `std::sync::MutexGuard` através de um `.await`; o `await_holding_lock` do clippy detecta isso

---

## Tratamento de Erros

```rust
// RUIM: panics em caminhos de requisição
let id: Uuid = s.parse().unwrap();
let user = repo.find(id).await.expect("user exists");

// BOM: propague com ?
let id: Uuid = s.parse().map_err(|_| AppError::Validation(vec![FieldError::new("id", "invalid")]))?;
let user = repo.find(id).await?.ok_or(AppError::NotFound)?;
```

| Onde | Regra |
|------|-------|
| Crates de biblioteca | Enums `thiserror`, `#[from]` para conversões, sem `anyhow` |
| Crate binário | `anyhow::Result` e `.context("...")` para a inicialização e o código de ligação |
| Caminhos de requisição | Sem `unwrap()`, `expect()`, `panic!`, `unreachable!` sobre entrada externa, sem indexação não verificada (`v[i]`) |
| Inicialização (config, bind) | `expect` com uma mensagem clara é aceitável, falhe rápido |
| Testes | `unwrap()` e `expect()` são aceitáveis |

Nunca engula erros com `let _ =` sobre um `Result`, a menos que a falha seja realmente irrelevante e esteja documentada.

---

## Convenções Assíncronas

- `async fn` em traits é nativo; `#[async_trait]` não é necessário para despacho estático (use-o, ou uma future em box, somente para `dyn Trait`)
- Não bloqueie o executor: `tokio::fs`, `tokio::time::sleep`, `spawn_blocking` para CPU ou I/O bloqueante
- As futures devem ser `Send` para o Tokio multi-thread: evite manter `Rc`, guards de `RefCell` ou tipos não `Send` através de um `.await`
- Segurança em relação ao cancelamento: qualquer `.await` pode ser descartado quando um cliente se desconecta; mantenha as seções críticas dentro de transações
- Limite sempre a concorrência (semáforos, canais limitados) e defina timeouts nas chamadas de saída

---

## Documentação

```rust
/// Calcula o total do pedido, incluindo os descontos por item.
///
/// # Errors
///
/// Retorna [`DomainError::EmptyOrder`] quando o pedido não tem itens.
pub fn total(&self) -> Result<Money, DomainError> { /* ... */ }
```

- Os itens públicos levam rustdoc `///`; seções `# Errors` e `# Panics` quando pertinentes
- Os comentários explicam o PORQUÊ, não o QUÊ
- `#![warn(missing_docs)]` para crates de biblioteca
- Os exemplos na documentação são compilados por `cargo test --doc`

---

## Dependências

| Regra | Detalhe |
|-------|---------|
| Declare as versões compartilhadas uma só vez | `[workspace.dependencies]`, os membros usam `dep.workspace = true` |
| Features mínimas | `default-features = false` e habilite apenas o que é usado (tokio, sqlx, tower-http) |
| Versione o `Cargo.lock` | Aplicações têm builds reprodutíveis |
| Sem versões curinga | `"*"` é rejeitado pelo `cargo deny` |

---

## Fontes

- Rust API Guidelines: https://rust-lang.github.io/api-guidelines/
- Lints do Clippy: https://rust-lang.github.io/rust-clippy/master/
- Release do Rust 1.99.1: https://blog.rust-lang.org/2026/10/01/Rust-1.99.1/ (edition 2024)

## Checklist

- [ ] `unsafe_code = "forbid"` via lints do workspace
- [ ] `cargo fmt --check` e `cargo clippy -- -D warnings` sem avisos
- [ ] `snake_case` / `UpperCamelCase` / `SCREAMING_SNAKE_CASE` respeitados
- [ ] Funções < 10 linhas (limite 20), retornos antecipados, `let ... else`
- [ ] Newtypes nas fronteiras, estados inválidos irrepresentáveis
- [ ] Nenhum `unwrap()` / `expect()` / `panic!` em caminhos de requisição
- [ ] Nenhum `.clone()` desnecessário, parâmetros emprestados sempre que possível
- [ ] Nenhuma chamada bloqueante nem guard de lock através de `.await`
- [ ] Itens públicos documentados, seções `# Errors` presentes
- [ ] Versões de dependências compartilhadas em `[workspace.dependencies]`
