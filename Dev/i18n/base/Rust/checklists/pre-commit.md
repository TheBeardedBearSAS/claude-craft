# Pre-Commit Checklist - Rust / Axum

## Quick Validation Before Each Commit

All commands run in Docker (`docker compose exec app ...`). Keep one script or `make ci` target that chains the steps below so the local gate equals the CI gate.

### Code Quality

- [ ] Formatting clean (`cargo fmt --all -- --check`)
- [ ] Clippy clean with warnings denied (`cargo clippy --workspace --all-targets --all-features -- -D warnings`)
- [ ] New `#[allow(...)]` justified, scoped to one item (prefer `#[expect(..., reason = "...")]`)
- [ ] No unused `use`, dead code, or commented-out code
- [ ] No `dbg!`, `println!`, `todo!` left behind
- [ ] Functions < 10 lines (limit 20), nesting <= 3, parameters <= 4

### Tests

- [ ] All tests pass (`cargo nextest run --workspace --all-features`)
- [ ] Doc tests pass (`cargo test --workspace --doc`)
- [ ] New behavior has tests written first (Red, Green, Refactor)
- [ ] Bug fixes include a regression test that failed before the fix
- [ ] Coverage maintained at 80% or higher (`cargo llvm-cov nextest --workspace --fail-under-lines 80`)
- [ ] No `#[ignore]` added without a ticket

### Security

- [ ] `cargo audit` reports no vulnerabilities
- [ ] `cargo deny check` passes (advisories, licenses, bans, sources)
- [ ] No hardcoded secrets; `.env` and key files not staged; secrets wrapped in `SecretString`
- [ ] `#![forbid(unsafe_code)]` still present; any new `unsafe` has a `// SAFETY:` comment and a test
- [ ] No `unwrap()` / `expect()` / indexing that can panic in request paths
- [ ] No string-built SQL (`format!` into a query); user input only bound as parameters
- [ ] New handlers authenticated, authorized per resource, and rate limited when they authenticate or send mail

### Database

- [ ] Migration added with `sqlx migrate add`, has indexes and foreign keys
- [ ] No data backfill mixed into the schema migration
- [ ] `cargo sqlx prepare --workspace` run and `.sqlx/` committed (`cargo sqlx prepare --check` passes)
- [ ] Migrations apply cleanly on an empty database
- [ ] Multi-statement writes wrapped in a transaction; no N+1 query loops in handlers

### Dependencies

- [ ] `Cargo.lock` committed and consistent (`cargo build --locked`)
- [ ] New crates justified (maintained, license allowed by `deny.toml`, no overlap with existing dependencies)
- [ ] Features trimmed (`default-features = false` where practical)

### Documentation and Git

- [ ] README / docs updated when behavior or setup changed
- [ ] CHANGELOG updated if applicable
- [ ] Commit message follows Conventional Commits (`feat(orders): add refund endpoint`)
- [ ] Commit is atomic; branch up to date with `main`
- [ ] No unrelated files staged (`git status`, `git diff --staged`)

## Automated Validation

### CI gate script

```bash
#!/usr/bin/env bash
# scripts/ci.sh - same steps locally and in CI
set -euo pipefail

cargo fmt --all -- --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo sqlx prepare --check --workspace
cargo nextest run --workspace --all-features
cargo test --workspace --doc
cargo deny check
cargo audit
```

Run it in the container:

```bash
docker compose exec app ./scripts/ci.sh
```

### Git pre-commit hook (Lefthook)

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    fmt:
      glob: "*.rs"
      run: docker compose exec -T app cargo fmt --all -- --check
    clippy:
      glob: "*.{rs,toml}"
      run: docker compose exec -T app cargo clippy --workspace --all-targets -- -D warnings
pre-push:
  commands:
    tests:
      run: docker compose exec -T app cargo nextest run --workspace
    deny:
      run: docker compose exec -T app cargo deny check
```

Hooks are requirements, CLAUDE.md is a suggestion.

## Quick Commands

```bash
docker compose exec app cargo fmt --all
docker compose exec app cargo clippy --workspace --all-targets -- -D warnings
docker compose exec app cargo nextest run --workspace
docker compose exec app cargo llvm-cov nextest --workspace --summary-only
docker compose exec app cargo sqlx prepare --workspace
docker compose exec app cargo deny check
docker compose exec app cargo audit
```

## Final Check

If any box is unchecked, do not commit. Fix first, then re-run `./scripts/ci.sh`.
