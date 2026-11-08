# Rust / Axum Development Tools

> All commands run inside the application container. Prefix with `docker compose exec app` (or `docker compose run --rm app` for one-off tasks) so results do not depend on the local environment.

## Docker Setup

### Dockerfile (multi-stage with cargo-chef)

cargo-chef caches compiled dependencies in a separate layer so that source-only changes rebuild in seconds. Pin the Rust version through a build argument and check it against the official image tags before use.

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
# Build dependencies only: cached until Cargo.toml / Cargo.lock change
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

Notes:
- `SQLX_OFFLINE=true` makes `query!` macros use the committed `.sqlx` metadata, no database is needed at build time
- Use `rustls` (SQLx and reqwest feature) to avoid the OpenSSL system dependency and enable a distroless or `scratch` runtime when the binary is statically linked
- Run as a non-root user; mount no secrets in the image

### compose.yaml for development

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

Named volumes for the registry and `target/` keep rebuilds incremental inside the container. Adjust the database image and version to the project's actual choice. The dev image must have `cargo-watch` (or `bacon`) and `sqlx-cli` installed.

---

## Toolchain Management

| Item | Practice |
|------|----------|
| `rust-toolchain.toml` | Single source of truth for channel and components |
| `Cargo.toml` | `edition = "2024"`, `rust-version` set to the MSRV |
| Docker | `ARG RUST_VERSION` matches `rust-toolchain.toml` |
| Local manager | `rustup` is optional; Docker is the reference |

```toml
# rust-toolchain.toml
[toolchain]
channel = "1.99.1"
components = ["rustfmt", "clippy", "llvm-tools-preview"]
profile = "minimal"
```

```toml
# Cargo.toml (workspace root)
[workspace]
resolver = "3"
members = ["crates/*"]

[workspace.package]
edition = "2024"
rust-version = "1.99"
```

- Pin an exact stable version for applications; bump deliberately, with the changelog read
- Rust stable was 1.99.1 at the time of writing (1.99.0 released 2026-10-01); a new stable ships every six weeks
- Edition 2024 uses resolver 3 by default for new workspaces; set it explicitly for virtual workspaces
- `rust-version` documents the MSRV and lets Cargo select compatible dependency versions

---

## Cargo - Essential Commands

```bash
docker compose exec app cargo check --workspace --all-targets      # Fast type check
docker compose exec app cargo build --release -p api               # Release build
docker compose exec app cargo run -p api                           # Run the server
docker compose exec app cargo test --doc                           # Doc tests (nextest skips them)
docker compose exec app cargo add serde --features derive          # Add a dependency
docker compose exec app cargo update -p tokio                      # Targeted update
docker compose exec app cargo tree -d                              # Duplicate versions
docker compose exec app cargo tree -i openssl                      # Why is a crate pulled in
```

### Workspace Conventions

```toml
# Cargo.toml (workspace root)
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

Requirements were checked against crates.io (tower 0.5.3, thiserror 2.0.21, anyhow 1.0.104, tracing 0.1.44, tracing-subscriber 0.3.23). The SQLx runtime and TLS feature names changed in 0.9 (the combined `runtime-tokio-native-tls` style features were removed), so follow the 0.9 documentation for the exact feature list.

| Rule | Detail |
|------|--------|
| Shared versions | `[workspace.dependencies]` only |
| Features | `default-features = false`, enable what is used |
| Lockfile | `Cargo.lock` committed for binaries |
| Profiles | `[profile.release]` with `lto = "thin"`, `codegen-units = 1`, `strip = true` when binary size matters |
| Registry | crates.io only, enforced by `cargo deny` sources |

---

## Dev Loop: cargo-watch and bacon

```bash
docker compose exec app cargo watch -x check -x "nextest run" -x "run -p api"
docker compose exec app bacon              # TUI: clippy / test / run jobs, configured in bacon.toml
```

- `cargo-watch` restarts the server on change; `bacon` gives a faster feedback loop on diagnostics
- Both are development tools, never installed in the production image
- `cargo check` is much faster than `cargo build`; run it constantly, run clippy before commits

---

## SQLx CLI and Migrations

```bash
docker compose exec app cargo install sqlx-cli --locked --no-default-features --features rustls,postgres
docker compose exec app sqlx database create
docker compose exec app sqlx migrate add -r create_orders          # Reversible migration pair
docker compose exec app sqlx migrate run
docker compose exec app sqlx migrate revert
docker compose exec app cargo sqlx prepare --workspace              # Write .sqlx offline metadata
docker compose exec app cargo sqlx prepare --check --workspace      # CI: fail if stale
```

### Offline Mode

1. Run the migrations against a development database
2. Run `cargo sqlx prepare --workspace`; it writes one `.sqlx/` directory at the workspace root
3. Commit `.sqlx/`; builds with `SQLX_OFFLINE=true` need no database
4. In CI, run `cargo sqlx prepare --check --workspace` so stale metadata fails the build

Note that saving query metadata must be invoked as `cargo sqlx prepare` (the `cargo` subcommand form). Re-run it whenever a `query!` / `query_as!` call or a migration changes.

### Migration Conventions

- One concern per migration, timestamped by `sqlx migrate add`
- Additive changes first (add column nullable, backfill, then constrain) to allow rolling deployments
- Never edit an applied migration; add a new one
- Embedded migrations (`sqlx::migrate!`) run at startup only for small deployments; prefer a separate migration step for production

---

## Environment and Configuration

```bash
# .env.example (committed; .env is git-ignored)
DATABASE_URL=postgres://postgres:postgres@db:5432/app_development
LISTEN_ADDR=0.0.0.0:3000
RUST_LOG=info
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public.pem
```

- Load configuration once at startup into a typed `Config` struct (`envy`, `figment` or `config` crate), validate, fail fast
- Wrap secrets in `secrecy::SecretString`
- Never commit `.env`, private keys or credentials; use Docker/Compose secrets or the platform's vault

---

## IDE and Editor Support

| Tool | Purpose |
|------|---------|
| rust-analyzer | Language server (completion, inline errors, refactoring) |
| `clippy` on save | `rust-analyzer.check.command = "clippy"` |
| rustfmt on save | Formatting |
| CodeLLDB / `rust-gdb` | Debugging |
| `tokio-console` | Runtime task inspection (needs the `tokio_unstable` cfg, development only) |

Container-based workflows: use a devcontainer or remote-container so rust-analyzer runs against the same toolchain as CI.

---

## CI Skeleton

```yaml
# .github/workflows/ci.yml (essential steps)
steps:
  - uses: actions/checkout@v4
  - run: docker compose run --rm app cargo fmt --check
  - run: docker compose run --rm app cargo clippy --workspace --all-targets --all-features -- -D warnings
  - run: docker compose run --rm app cargo nextest run --workspace
  - run: docker compose run --rm app cargo deny check
  - run: docker compose run --rm app cargo sqlx prepare --check --workspace
```

See `rules/08-quality-tools.md` for the full pipeline (coverage, audit, mutation testing).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `query!` fails to compile in CI | No database and stale `.sqlx` | `cargo sqlx prepare --workspace`, commit, set `SQLX_OFFLINE=true` |
| Very slow Docker builds | Dependencies rebuilt each time | Use cargo-chef layers, named `target/` volume in dev |
| `the trait Handler<_, _> is not implemented` | Non-`Send` future, wrong extractor order or return type | Check body extractor is last; `#[debug_handler]` from `axum-macros` gives clear errors |
| Link errors on musl | Native OpenSSL dependency | Switch to `rustls` features |
| Duplicate crate versions | Divergent dependency requirements | `cargo tree -d`, align in `[workspace.dependencies]` |

---

## Sources

- Rust releases: https://releases.rs/ and https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- cargo-chef: https://github.com/LukeMathWalker/cargo-chef
- sqlx-cli (offline mode): https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md
- crates.io versions (axum 0.8.9, tokio 1.54.1, sqlx 0.9.0, tower-http 0.7.1, cargo-nextest 0.9.151, cargo-deny 0.20.2)

## Checklist

- [ ] `rust-toolchain.toml` pinned and aligned with the Dockerfile
- [ ] `Cargo.lock` committed; shared versions in `[workspace.dependencies]`
- [ ] Every documented command prefixed with `docker compose exec app`
- [ ] Multi-stage Dockerfile with cargo-chef, non-root runtime user
- [ ] `.sqlx/` committed and checked with `cargo sqlx prepare --check`
- [ ] `.env` ignored, `.env.example` committed
- [ ] rustfmt, clippy, nextest and cargo-deny run in CI
- [ ] `cargo-watch` / `bacon` only in the development image
