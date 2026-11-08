# Ferramentas de Desenvolvimento Rust / Axum

> Todos os comandos são executados dentro do container da aplicação. Use o prefixo `docker compose exec app` (ou `docker compose run --rm app` para tarefas pontuais) para que os resultados não dependam do ambiente local.

## Configuração do Docker

### Dockerfile (multi-stage com cargo-chef)

O cargo-chef coloca em cache as dependências compiladas em uma camada separada, de modo que mudanças apenas no código-fonte são recompiladas em segundos. Fixe a versão do Rust por meio de um argumento de build e confira-a com as tags oficiais da imagem antes de usar.

```dockerfile
# syntax=docker/dockerfile:1
ARG RUST_VERSION=1.99
FROM docker.io/library/rust:${RUST_VERSION}-slim-bookworm AS chef
RUN cargo install cargo-chef --locked
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*
COPY --from=planner /app/recipe.json recipe.json
# Compila apenas as dependências: em cache até Cargo.toml / Cargo.lock mudarem
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
ENV SQLX_OFFLINE=true
RUN cargo build --release -p api

FROM docker.io/library/debian:bookworm-slim AS runtime
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system --gid 1000 app && \
    useradd app --uid 1000 --gid 1000 --no-create-home --shell /usr/sbin/nologin
COPY --from=builder /app/target/release/api /usr/local/bin/api
USER 1000:1000
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/api"]
```

Notas:
- `SQLX_OFFLINE=true` faz as macros `query!` usarem os metadados `.sqlx` versionados, sem necessidade de banco de dados durante o build
- Use `rustls` (feature do SQLx e do reqwest) para evitar a dependência de sistema do OpenSSL e habilitar um runtime distroless ou `scratch` quando o binário for linkado estaticamente
- Execute como usuário não root; não monte segredos na imagem

### compose.yaml para desenvolvimento

```yaml
services:
  app:
    build:
      context: .
      target: chef
    command: cargo watch -x "run -p api"
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/app_development
      RUST_LOG: info,tower_http=debug
    volumes:
      - .:/app
      - cargo-registry:/usr/local/cargo/registry
      - cargo-target:/app/target
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  cargo-registry:
  cargo-target:
  pgdata:
```

Os volumes nomeados para o registry e para o `target/` mantêm as recompilações incrementais dentro do container. Ajuste a imagem e a versão do banco de dados à escolha real do projeto. A imagem de desenvolvimento deve ter `cargo-watch` (ou `bacon`) e `sqlx-cli` instalados.

---

## Gerenciamento da Toolchain

| Item | Prática |
|------|---------|
| `rust-toolchain.toml` | Fonte única de verdade para o canal e os componentes |
| `Cargo.toml` | `edition = "2024"`, `rust-version` definido com o MSRV |
| Docker | `ARG RUST_VERSION` corresponde ao `rust-toolchain.toml` |
| Gerenciador local | `rustup` é opcional; o Docker é a referência |

```toml
# rust-toolchain.toml
[toolchain]
channel = "1.99.1"
components = ["rustfmt", "clippy", "llvm-tools-preview"]
profile = "minimal"
```

```toml
# Cargo.toml (raiz do workspace)
[workspace]
resolver = "3"
members = ["crates/*"]

[workspace.package]
edition = "2024"
rust-version = "1.99"
```

- Fixe uma versão stable exata para aplicações; atualize de forma deliberada, depois de ler o changelog
- O Rust stable era a 1.99.1 no momento da redação (1.99.0 lançada em 2026-10-01); uma nova versão stable é publicada a cada seis semanas
- A edition 2024 usa o resolver 3 por padrão em novos workspaces; defina-o explicitamente em workspaces virtuais
- `rust-version` documenta o MSRV e permite que o Cargo selecione versões de dependências compatíveis

---

## Cargo - Comandos Essenciais

```bash
docker compose exec app cargo check --workspace --all-targets      # Verificação rápida de tipos
docker compose exec app cargo build --release -p api               # Build de release
docker compose exec app cargo run -p api                           # Executar o servidor
docker compose exec app cargo test --doc                           # Doc tests (o nextest não os executa)
docker compose exec app cargo add serde --features derive          # Adicionar uma dependência
docker compose exec app cargo update -p tokio                      # Atualização direcionada
docker compose exec app cargo tree -d                              # Versões duplicadas
docker compose exec app cargo tree -i openssl                      # Por que um crate é incluído
```

### Convenções de Workspace

```toml
# Cargo.toml (raiz do workspace)
[workspace.dependencies]
axum = "0.8"
tokio = { version = "1", features = ["rt-multi-thread", "macros", "signal"] }
tower = "0.5"
tower-http = { version = "0.7", features = ["trace", "timeout", "limit", "cors"] }
serde = { version = "1", features = ["derive"] }
thiserror = "2"
anyhow = "1"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter", "json"] }

# crates/api/Cargo.toml
[dependencies]
axum.workspace = true
tokio.workspace = true
```

Os requisitos foram conferidos no crates.io (tower 0.5.3, thiserror 2.0.21, anyhow 1.0.104, tracing 0.1.44, tracing-subscriber 0.3.23). Os nomes das features de runtime e TLS do SQLx mudaram na 0.9 (as features combinadas no estilo `runtime-tokio-native-tls` foram removidas); siga a documentação da 0.9 para a lista exata de features.

| Regra | Detalhe |
|-------|---------|
| Versões compartilhadas | Somente em `[workspace.dependencies]` |
| Features | `default-features = false`, habilite o que é usado |
| Lockfile | `Cargo.lock` versionado para binários |
| Profiles | `[profile.release]` com `lto = "thin"`, `codegen-units = 1`, `strip = true` quando o tamanho do binário importar |
| Registry | Apenas crates.io, imposto pelas sources do `cargo deny` |

---

## Ciclo de Desenvolvimento: cargo-watch e bacon

```bash
docker compose exec app cargo watch -x check -x "nextest run" -x "run -p api"
docker compose exec app bacon              # TUI: jobs de clippy / test / run, configurados em bacon.toml
```

- O `cargo-watch` reinicia o servidor a cada mudança; o `bacon` oferece um ciclo de feedback mais rápido sobre os diagnósticos
- Ambos são ferramentas de desenvolvimento, nunca instaladas na imagem de produção
- `cargo check` é muito mais rápido que `cargo build`; execute-o constantemente e rode o clippy antes dos commits

---

## SQLx CLI e Migrations

```bash
docker compose exec app cargo install sqlx-cli --locked --no-default-features --features rustls,postgres
docker compose exec app sqlx database create
docker compose exec app sqlx migrate add -r create_orders          # Par de migrations reversíveis
docker compose exec app sqlx migrate run
docker compose exec app sqlx migrate revert
docker compose exec app cargo sqlx prepare --workspace              # Gera os metadados offline em .sqlx
docker compose exec app cargo sqlx prepare --check --workspace      # CI: falha se estiverem desatualizados
```

### Modo Offline

1. Execute as migrations em um banco de dados de desenvolvimento
2. Execute `cargo sqlx prepare --workspace`; ele grava um único diretório `.sqlx/` na raiz do workspace
3. Versione o `.sqlx/`; os builds com `SQLX_OFFLINE=true` não precisam de banco de dados
4. Na CI, execute `cargo sqlx prepare --check --workspace` para que metadados desatualizados façam o build falhar

Observe que a gravação dos metadados das consultas deve ser invocada como `cargo sqlx prepare` (a forma de subcomando do `cargo`). Execute-o novamente sempre que uma chamada a `query!` / `query_as!` ou uma migration mudar.

### Convenções de Migrations

- Uma única preocupação por migration, com timestamp gerado por `sqlx migrate add`
- Mudanças aditivas primeiro (adicione a coluna como nullable, faça o backfill e só então aplique a restrição) para permitir deploys graduais (rolling)
- Nunca edite uma migration já aplicada; adicione uma nova
- As migrations embarcadas (`sqlx::migrate!`) executam na inicialização apenas em deploys pequenos; prefira uma etapa de migration separada em produção

---

## Ambiente e Configuração

```bash
# .env.example (versionado; .env é ignorado pelo git)
DATABASE_URL=postgres://postgres:postgres@db:5432/app_development
LISTEN_ADDR=0.0.0.0:3000
RUST_LOG=info
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public.pem
```

- Carregue a configuração uma única vez na inicialização em uma struct `Config` tipada (crate `envy`, `figment` ou `config`), valide e falhe rápido
- Envolva os segredos em `secrecy::SecretString`
- Nunca versione `.env`, chaves privadas ou credenciais; use os secrets do Docker/Compose ou o vault da plataforma

---

## Suporte de IDE e Editor

| Ferramenta | Finalidade |
|------------|------------|
| rust-analyzer | Language server (autocompletar, erros inline, refatoração) |
| `clippy` ao salvar | `rust-analyzer.check.command = "clippy"` |
| rustfmt ao salvar | Formatação |
| CodeLLDB / `rust-gdb` | Depuração |
| `tokio-console` | Inspeção das tasks do runtime (requer o cfg `tokio_unstable`, apenas em desenvolvimento) |

Fluxos baseados em containers: use um devcontainer ou remote-container para que o rust-analyzer execute com a mesma toolchain da CI.

---

## Esqueleto de CI

```yaml
# .github/workflows/ci.yml (etapas essenciais)
steps:
  - uses: actions/checkout@v4
  - run: docker compose run --rm app cargo fmt --check
  - run: docker compose run --rm app cargo clippy --workspace --all-targets --all-features -- -D warnings
  - run: docker compose run --rm app cargo nextest run --workspace
  - run: docker compose run --rm app cargo deny check
  - run: docker compose run --rm app cargo sqlx prepare --check --workspace
```

Consulte `rules/08-quality-tools.md` para o pipeline completo (cobertura, audit, testes de mutação).

---

## Solução de Problemas

| Sintoma | Causa provável | Correção |
|---------|----------------|----------|
| `query!` não compila na CI | Sem banco de dados e `.sqlx` desatualizado | `cargo sqlx prepare --workspace`, commit, defina `SQLX_OFFLINE=true` |
| Builds Docker muito lentos | Dependências recompiladas a cada vez | Use as camadas do cargo-chef e um volume nomeado para o `target/` em dev |
| `the trait Handler<_, _> is not implemented` | Future não `Send`, ordem de extractors ou tipo de retorno incorretos | Verifique se o extractor de corpo é o último; `#[debug_handler]` do `axum-macros` fornece erros claros |
| Erros de link no musl | Dependência nativa do OpenSSL | Mude para as features `rustls` |
| Versões duplicadas de crates | Requisitos de dependência divergentes | `cargo tree -d`, alinhe em `[workspace.dependencies]` |

---

## Fontes

- Releases do Rust: https://releases.rs/ e https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- cargo-chef: https://github.com/LukeMathWalker/cargo-chef
- sqlx-cli (modo offline): https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md
- Versões do crates.io (axum 0.8.9, tokio 1.54.1, sqlx 0.9.0, tower-http 0.7.1, cargo-nextest 0.9.151, cargo-deny 0.20.2)

## Checklist

- [ ] `rust-toolchain.toml` fixado e alinhado com o Dockerfile
- [ ] `Cargo.lock` versionado; versões compartilhadas em `[workspace.dependencies]`
- [ ] Todo comando documentado com o prefixo `docker compose exec app`
- [ ] Dockerfile multi-stage com cargo-chef, usuário de runtime não root
- [ ] `.sqlx/` versionado e verificado com `cargo sqlx prepare --check`
- [ ] `.env` ignorado, `.env.example` versionado
- [ ] rustfmt, clippy, nextest e cargo-deny executados na CI
- [ ] `cargo-watch` / `bacon` apenas na imagem de desenvolvimento
