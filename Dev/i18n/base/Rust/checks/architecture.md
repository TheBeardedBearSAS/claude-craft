# Check Rust / Axum Architecture

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple crates or requires cross-cutting investigation.

## MISSION

Audit the architecture of the Rust web service (Rust stable, edition 2024, axum 0.8, tokio 1.x, sqlx 0.9). Stance: **layered or hexagonal, enforced by the crate graph**. The domain crate must not depend on axum, sqlx or tokio; the HTTP layer adapts requests to use cases and nothing more. A single crate with well-separated modules is acceptable for small services; do not demand a workspace the project does not need (YAGNI).

All commands run in Docker (`docker compose exec app ...`).

### Step 1: Workspace and Project Structure (5 points)

```bash
docker compose exec app cargo metadata --no-deps --format-version 1 | jq -r '.packages[].name'
docker compose exec app cargo tree --workspace --depth 1
docker compose exec app ls crates/ migrations/ .sqlx/
docker compose exec app grep -nE "edition|rust-version|resolver|\[workspace" Cargo.toml
```

Checklist:
- [ ] Cargo workspace with one crate per layer (for example `domain`, `application`, `infrastructure`, `http`, plus a thin `app` binary), or a single crate with equivalent top-level modules
- [ ] `edition = "2024"` and `rust-version` (MSRV) declared; `resolver = "3"` or the edition default
- [ ] Shared dependency versions centralized in `[workspace.dependencies]`; shared lints in `[workspace.lints]`
- [ ] `Cargo.lock` committed for binaries; `rust-toolchain.toml` pins the channel
- [ ] The binary crate only wires dependencies (config, pool, router, server); no business code in `main.rs`
- [ ] SQL migrations in `migrations/` (sqlx-cli) and the offline query cache `.sqlx/` committed

Detect anti-patterns:

```bash
# Giant files
docker compose exec app sh -c 'find crates src -name "*.rs" | xargs wc -l | sort -rn | head -10'
# Business code in main
docker compose exec app sh -c 'wc -l src/main.rs crates/*/src/main.rs'
```

**Scoring**: 5 pts, minus 1 per violation (min 0).

### Step 2: Thin HTTP Layer (6 points)

Handlers coordinate: extract, validate, call a use case, map the result to a response. No business rules, no SQL.

```bash
docker compose exec app sh -c 'find crates src -path "*http*" -name "*.rs" | xargs wc -l | sort -rn | head -10'
# SQL or pool access inside handlers
docker compose exec app grep -rnE "sqlx::query|\.fetch_(one|all|optional)|\.execute\(" crates/http src/http src/handlers
# Panics in request paths
docker compose exec app grep -rnE "\.unwrap\(\)|\.expect\(|panic!|unreachable!|todo!|unimplemented!" crates/http src/http src/handlers
```

Checklist:
- [ ] Handlers are <= 15 lines (target 10): extractors in, use case call, response out
- [ ] Router assembled in one function per resource (`fn routes() -> Router<AppState>`) and merged/nested in the app builder
- [ ] Path parameters use the 0.8 syntax (`/{id}`, `/{*rest}`), not the removed `/:id`
- [ ] Shared state is a cheap-to-clone `AppState` (`Arc` inside, or `Clone` handles such as `PgPool`) injected with `State<AppState>`; no global mutable statics
- [ ] Request/response DTOs are separate from domain types and database rows
- [ ] Validation at the boundary (`validator`, or `TryFrom<Dto>` building validated domain types); no `unwrap()`/`expect()` in request paths
- [ ] Cross-cutting concerns (tracing, timeout, CORS, body limit, auth) are Tower layers, not copy-pasted in handlers
- [ ] Custom extractors implement `FromRequestParts` / `FromRequest` without `#[async_trait]` (not needed in axum 0.8)

**Scoring**: 6 pts. Deduct 1 per handler with SQL or business rules, 1 per `unwrap`/`expect` cluster in request paths, max -6.

### Step 3: Domain and Application Design (6 points)

```bash
docker compose exec app cat crates/domain/Cargo.toml
docker compose exec app cargo tree -p domain --edges normal --depth 1
docker compose exec app grep -rnE "^use (axum|sqlx|tokio|tower|hyper)" crates/domain/src
docker compose exec app grep -rnE "(pub )?trait \w+" crates/application/src crates/domain/src
```

Checklist:
- [ ] The domain crate has no dependency on axum, sqlx, tokio or tower
- [ ] Invariants live in types: newtypes (`Email`, `UserId`) validated in constructors; enums for states instead of strings or booleans
- [ ] Ports (repository, clock, mailer traits) are defined in domain/application; adapters live in infrastructure
- [ ] Use cases are plain async functions or structs with a single public method; dependencies injected through constructors or generics
- [ ] Trait objects (`dyn`) used only where runtime polymorphism is needed; generics preferred otherwise
- [ ] Domain errors are explicit enums (`thiserror`), not `anyhow::Error`
- [ ] Illegal states are unrepresentable (typestate or enums) where cheap
- [ ] No God types: a struct named `Manager`, `Service` or `Utils` with many unrelated methods is a smell

**Scoring**: 6 pts. Deduct 2 if the domain depends on axum/sqlx, 1 per use case mixing HTTP or SQL concerns, 1 per god type.

### Step 4: Data Layer (4 points)

```bash
docker compose exec app grep -rnE "query!|query_as!|query_scalar!" crates src | wc -l
docker compose exec app grep -rnE "format!\(.*(SELECT|INSERT|UPDATE|DELETE)" crates src
docker compose exec app cargo sqlx prepare --check --workspace
docker compose exec app sqlx migrate info
docker compose exec app grep -rnE "PgPoolOptions|max_connections|acquire_timeout" crates src
```

Checklist:
- [ ] Queries use `query!` / `query_as!` (compile-time checked) with the offline cache; `cargo sqlx prepare --check` passes in CI
- [ ] SQL is never built by string concatenation or `format!`; dynamic filters use `sqlx::QueryBuilder` with `push_bind`
- [ ] Every foreign key has an index and a database constraint; `NOT NULL`, `UNIQUE` and `CHECK` mirror domain invariants
- [ ] Migrations are forward-only and safe on large tables (concurrent index, backfill in a separate step)
- [ ] One `PgPool` created at startup with explicit `max_connections` and `acquire_timeout`; migrations run at startup or as a deploy step
- [ ] Multi-statement writes use a transaction (`pool.begin()`), committed explicitly; no transaction held across external calls
- [ ] Repositories return domain types, not `sqlx::Row`; row structs stay in infrastructure

**Scoring**: 4 pts, minus 1 per failed group above (checked queries, schema integrity, pool and migrations, transactions).

### Step 5: Async Runtime and Operations (2 points)

```bash
docker compose exec app grep -rnE "std::thread::sleep|std::fs::|reqwest::blocking" crates src
docker compose exec app grep -rnE "spawn_blocking|tokio::spawn|JoinSet" crates src
docker compose exec app grep -rnE "with_graceful_shutdown|ctrl_c|SignalKind" crates src
docker compose exec app grep -rnE "TraceLayer|TimeoutLayer|tracing_subscriber" crates src
```

Checklist:
- [ ] No blocking calls on the async runtime; CPU-bound or blocking work goes through `tokio::task::spawn_blocking`
- [ ] No `std::sync::Mutex` guard held across an `.await`
- [ ] Graceful shutdown: `axum::serve(listener, app).with_graceful_shutdown(signal)` handling Ctrl+C and SIGTERM
- [ ] Spawned tasks are tracked (`JoinSet`, handles) and their errors observed; no fire-and-forget panics
- [ ] Health endpoints for liveness and readiness (database reachable)
- [ ] Structured logs through `tracing` with request ids (`TraceLayer`); subscriber initialized once in `main`

**Scoring**: 2 pts (1 for runtime hygiene, 1 for shutdown and observability).

### Step 6: Dependency Direction and Features (2 points)

```bash
docker compose exec app cargo tree --workspace --duplicates | head -30
docker compose exec app cargo tree -i axum --workspace
docker compose exec app grep -rnE "std::env::var|dotenv" crates src
```

Checklist:
- [ ] Dependencies point inward: http and infrastructure depend on application and domain, never the reverse; no cycles
- [ ] Feature flags of heavy crates are trimmed (`default-features = false` where practical)
- [ ] Configuration parsed once at startup into a typed struct; `std::env::var` is not scattered through the code
- [ ] Duplicated major versions of the same crate are reviewed

**Scoring**: 2 pts (1 for dependency direction, 1 for configuration and dependency hygiene).

## OUTPUT FORMAT

```
RUST / AXUM ARCHITECTURE AUDIT
==============================

SCORE: XX/25

Rust: X.Y.Z   Edition: 20XX   axum: X.Y   Crates: N   Handlers: N

SUB-SCORES:
  Workspace and structure      : XX/5
  Thin HTTP layer              : XX/6
  Domain / application design  : XX/6
  Data layer                   : XX/4
  Async runtime / operations   : XX/2
  Dependency direction         : XX/2

STRENGTHS:
- [...]

ISSUES (by severity):
- CRITICAL: [file:line] [description] -> [fix]
- IMPORTANT: ...
- MINOR: ...

RECOMMENDATIONS:
1. [Action] (effort: Low/Medium/High, impact: Low/Medium/High)
2. ...
```

## IMPORTANT NOTES

- Findings must cite `file:line` and propose a concrete refactoring (for example "move the pricing rule from `create_order` into `Order::place` in the domain crate")
- Do not recommend new crates or traits when the code is small and readable (YAGNI); one implementation does not need a trait until a second one or a test double exists
- A single-crate service with clean modules scores fully on layering if the dependency direction holds
- Never run destructive tasks (`sqlx database drop`, `sqlx migrate revert`) during an audit
