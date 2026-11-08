# New Feature Development Checklist - Rust / Axum

## Before Starting

- [ ] Feature discussed and validated with the team
- [ ] Acceptance criteria written (Given/When/Then)
- [ ] Assumptions stated explicitly (inputs, invariants, volume, authorization, latency budget)
- [ ] API contract defined if exposed (OpenAPI 3.x, error format RFC 9457)
- [ ] Database changes identified (tables, columns, indexes, constraints)
- [ ] Impact analysis done: crates touched, breaking changes, rollback plan
- [ ] Feature flag decided for risky changes

## Development (TDD: Red, Green, Refactor)

### Design (layers first)

- [ ] Start from the domain: types, invariants and errors before routes
- [ ] Ports (traits) added only for real boundaries: repository, clock, mailer, external API
- [ ] One use case = one function or struct with one public method
- [ ] No speculative traits, generics, options, or parameters (YAGNI)
- [ ] Domain crate still free of axum, sqlx and tokio dependencies

### Domain Layer

- [ ] Newtypes validate on construction (`Email::parse`, `Quantity::new`); no primitive obsession
- [ ] States modeled as enums; illegal states unrepresentable where cheap
- [ ] Domain errors are a `thiserror` enum with one variant per failure the caller can act on
- [ ] No panics: fallible operations return `Result`

### Database

- [ ] Migration created with `sqlx migrate add` and is safe on large tables
- [ ] Foreign keys, indexes, `NOT NULL`, `UNIQUE` and `CHECK` constraints mirror domain invariants
- [ ] Queries written with `query!` / `query_as!`; dynamic filters through `QueryBuilder::push_bind`
- [ ] `cargo sqlx prepare --workspace` run and `.sqlx/` committed
- [ ] Multi-statement writes inside a transaction; no transaction held across external calls

### HTTP Layer

- [ ] Routes registered in the resource's `routes()` function; path syntax `/{id}` (axum 0.8)
- [ ] Handlers <= 15 lines: extract, validate, call the use case, map the result
- [ ] Request/response DTOs separate from domain types; `TryFrom<Dto>` builds validated domain values
- [ ] Authentication layer applied to the router; authorization checks the resource owner or tenant
- [ ] Rate limit added on sensitive endpoints (login, password reset, expensive operations)
- [ ] Errors flow through `AppError` and render RFC 9457 `application/problem+json`
- [ ] Correct statuses: 201 + `Location` on create, 204 on delete, 400/422 on validation, 404, 409, 403
- [ ] Body, timeout and CORS settings checked for the new route

### Async and Background Work

- [ ] No blocking calls on the runtime; CPU-bound work through `spawn_blocking`
- [ ] No lock guard held across `.await`
- [ ] Work slower than ~200 ms moved to a background worker or queue; jobs idempotent with retry policy
- [ ] Spawned tasks tracked and cancellation-safe; graceful shutdown still drains them

### Code Quality

- [ ] `cargo fmt` and `cargo clippy -D warnings` pass
- [ ] Borrowing preferred over cloning; iterators over index loops
- [ ] Naming explicit (RFC 430); comments explain WHY
- [ ] `tracing` spans/events added with structured fields; no secrets in logs

## Testing

- [ ] Domain tests: valid and invalid construction, state transitions, boundaries
- [ ] Use case tests against in-memory fakes: success and each failure variant
- [ ] HTTP tests with `tower::ServiceExt::oneshot` for every new endpoint, including 401 and 403 cases
- [ ] Database tests with `#[sqlx::test]`; migrations applied per test
- [ ] Error mapping tested (status, `problem+json` body)
- [ ] Property tests (`proptest`) for parsers and validators when relevant
- [ ] Coverage stays >= 80%; time injected; external HTTP stubbed

## Security

- [ ] `cargo audit` and `cargo deny check` clean
- [ ] No string-built SQL; no `unsafe` without `// SAFETY:` and tests
- [ ] IDOR checked: users cannot reach other users' or tenants' records
- [ ] Secrets in environment or secret store, wrapped in `SecretString`
- [ ] Input bounded (body size, collection sizes, pagination limits) and validated
- [ ] New logs do not contain sensitive data

## Performance

- [ ] No N+1 queries; batch with `ANY($1)` or joins
- [ ] Pagination on list endpoints (keyset where the table is large)
- [ ] Indexes support new filters and sorts; `EXPLAIN` checked on heavy queries
- [ ] Pool size and timeouts reviewed for the new load

## Documentation

- [ ] README or docs updated
- [ ] OpenAPI document updated
- [ ] ADR written for significant decisions
- [ ] CHANGELOG entry added; public items documented with `///`

## Before Merge

- [ ] `./scripts/ci.sh` passes locally and in CI
- [ ] Self-review of the diff completed
- [ ] PR description explains the why, links the ticket, lists risks and rollback
- [ ] Reviewer approval received; squash merge with Conventional Commit title

## Deployment

- [ ] Migrations run before the new binary starts (release step or startup migrate)
- [ ] Feature flag default set; rollback path verified
- [ ] Monitoring and alerts in place (error rate, latency, pool saturation)
- [ ] Smoke test after deploy (health endpoint and the main flow)
