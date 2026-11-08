# Rust Coding Standards

## Overview

Standards for Rust code (edition 2024) in Axum services. The Rust API Guidelines, rustfmt and clippy are the authority; this document summarises the project rules and the reasoning behind them.

## Mandatory Crate Header and Lints

```rust
#![forbid(unsafe_code)]
```

Every application crate forbids `unsafe`. The preferred form is a workspace lint table, inherited by each member:

```toml
# Cargo.toml (workspace root)
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

`clippy::unwrap_used` and `clippy::panic` keep panics off request paths; relax them for test code with `#![cfg_attr(test, allow(clippy::unwrap_used))]` or a `clippy.toml` (`allow-unwrap-in-tests = true`). If a dependency genuinely needs `unsafe`, isolate it in a separate reviewed crate rather than weakening the lint.

---

## Naming Conventions (Rust API Guidelines)

| Element | Convention | Example |
|---------|------------|---------|
| Crates, modules, files | `snake_case` | `order_item.rs` |
| Types, traits, enum variants | `UpperCamelCase` | `OrderItem`, `PaymentGateway` |
| Functions, methods, variables | `snake_case` | `calculate_total` |
| Constants, statics | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |
| Type parameters | Short `UpperCamelCase` | `T`, `S`, `Repo` |
| Getters | No `get_` prefix | `fn name(&self)` |
| Conversions | `as_` (cheap borrow), `to_` (expensive), `into_` (consuming) | `as_str`, `to_vec`, `into_inner` |
| Constructors | `new`, `with_*`, `from_*`, `try_from` | `Order::new` |
| Booleans | Predicate form, no `is_` required but common | `is_empty`, `has_items` |
| Unused bindings | Prefix with `_` | `_state` |

```rust
// BAD
struct order_item;
fn getTotal(&self) -> i64;

// GOOD
struct OrderItem;
fn total(&self) -> Money;
```

---

## Formatting

| Rule | Value |
|------|-------|
| Formatter | `rustfmt` (`cargo fmt`), CI runs `cargo fmt --check` |
| Indentation | 4 spaces |
| Line width | 100 characters (rustfmt default; keep configuration minimal) |
| Imports | Grouped std / external / crate, one `use` per path tree |
| Trailing commas | Required in multi-line literals (rustfmt adds them) |
| Edition | `edition = "2024"` in every crate |

```toml
# rustfmt.toml: keep it small, the defaults are the standard
edition = "2024"
```

Run `docker compose exec app cargo fmt` to format; never hand-format.

---

## Functions

### Size and Complexity (KISS)

| Metric | Target | Limit |
|--------|--------|-------|
| Lines per function | < 10 | < 20 |
| Parameters | 3 | 4 maximum (use a struct or builder) |
| Cognitive complexity | < 7 | < 10 |
| Nesting depth | 2 | 3 maximum |

Clippy's `cognitive_complexity` and `too_many_arguments` lints help; set `cognitive-complexity-threshold` in `clippy.toml` to match the project limit.

### Early Returns and `?`

```rust
// BAD: nested matching
fn discount(user: Option<&User>) -> u8 {
    match user {
        Some(u) => {
            if u.is_premium() { 20 } else { 0 }
        }
        None => 0,
    }
}

// GOOD: let-else and guard clauses
fn discount(user: Option<&User>) -> u8 {
    let Some(user) = user else { return 0 };
    if !user.is_premium() {
        return 0;
    }
    20
}
```

### Newtypes and Parsing at the Boundary

```rust
// BAD: primitive obsession, validation scattered
fn send_invoice(email: String, amount: i64) {}

// GOOD: parse once, carry the guarantee in the type
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

Make invalid states unrepresentable: enums over booleans and strings, `NonZeroU32`, `Duration` over raw integers.

---

## Ownership and Borrowing

| Situation | Guidance |
|-----------|----------|
| Function only reads | Take `&str`, `&[T]`, `&T` |
| Function stores or consumes | Take the owned value (`String`, `Vec<T>`) or `impl Into<String>` |
| Optional borrowed data | `Option<&T>` rather than `&Option<T>` |
| Sharing across tasks | `Arc<T>`; interior mutability via `tokio::sync::Mutex` or `RwLock` only when needed |
| Returning borrowed data | Elide lifetimes; name them only when elision fails |
| Heavy copies | Pass references, use `Cow<'_, str>` when ownership is conditional |

```rust
// BAD: needless clone to appease the borrow checker
let name = user.name.clone();
log(&name);

// GOOD: borrow
log(&user.name);
```

Guidelines:
- A `.clone()` that exists only to silence the borrow checker is a design smell; restructure first
- Clone `Arc`s freely (cheap), clone large owned data deliberately
- Prefer iterators and combinators over index loops; avoid collecting into a `Vec` just to iterate again
- Never hold a `std::sync::MutexGuard` across `.await`; clippy's `await_holding_lock` catches it

---

## Error Handling

```rust
// BAD: panics on request paths
let id: Uuid = s.parse().unwrap();
let user = repo.find(id).await.expect("user exists");

// GOOD: propagate with ?
let id: Uuid = s.parse().map_err(|_| AppError::Validation(vec![FieldError::new("id", "invalid")]))?;
let user = repo.find(id).await?.ok_or(AppError::NotFound)?;
```

| Where | Rule |
|-------|------|
| Library crates | `thiserror` enums, `#[from]` for conversions, no `anyhow` |
| Binary crate | `anyhow::Result` and `.context("...")` for startup and glue |
| Request paths | No `unwrap()`, `expect()`, `panic!`, `unreachable!` on external input, no unchecked indexing (`v[i]`) |
| Startup (config, bind) | `expect` with a clear message is acceptable, fail fast |
| Tests | `unwrap()` and `expect()` are fine |

Never swallow errors with `let _ =` on a `Result` unless the failure is genuinely irrelevant and documented.

---

## Async Conventions

- `async fn` in traits is native; no `#[async_trait]` is needed for static dispatch (use it, or a boxed future, only for `dyn Trait`)
- Do not block the executor: `tokio::fs`, `tokio::time::sleep`, `spawn_blocking` for CPU or blocking I/O
- Futures must be `Send` for multi-threaded Tokio: avoid holding `Rc`, `RefCell` guards or non-`Send` types across `.await`
- Cancellation safety: any `.await` can be dropped when a client disconnects; keep critical sections inside transactions
- Always bound concurrency (semaphores, bounded channels) and set timeouts on outbound calls

---

## Documentation

```rust
/// Computes the order total, including line-item discounts.
///
/// # Errors
///
/// Returns [`DomainError::EmptyOrder`] when the order has no items.
pub fn total(&self) -> Result<Money, DomainError> { /* ... */ }
```

- Public items carry `///` rustdoc; `# Errors` and `# Panics` sections when relevant
- Comments explain WHY, not WHAT
- `#![warn(missing_docs)]` for library crates
- Doc examples are compiled by `cargo test --doc`

---

## Dependencies

| Rule | Detail |
|------|--------|
| Declare shared versions once | `[workspace.dependencies]`, members use `dep.workspace = true` |
| Minimal features | `default-features = false` and enable only what is used (tokio, sqlx, tower-http) |
| Commit `Cargo.lock` | Applications are reproducible builds |
| No wildcard versions | `"*"` is rejected by `cargo deny` |

---

## Sources

- Rust API Guidelines: https://rust-lang.github.io/api-guidelines/
- Clippy lints: https://rust-lang.github.io/rust-clippy/master/
- Rust 1.99.0 release: https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/ (edition 2024)

## Checklist

- [ ] `unsafe_code = "forbid"` via workspace lints
- [ ] `cargo fmt --check` and `cargo clippy -- -D warnings` clean
- [ ] `snake_case` / `UpperCamelCase` / `SCREAMING_SNAKE_CASE` respected
- [ ] Functions < 10 lines (limit 20), early returns, `let ... else`
- [ ] Newtypes at boundaries, invalid states unrepresentable
- [ ] No `unwrap()` / `expect()` / `panic!` on request paths
- [ ] No needless `.clone()`, borrowed parameters where possible
- [ ] No blocking calls or lock guards across `.await`
- [ ] Public items documented, `# Errors` sections present
- [ ] Shared dependency versions in `[workspace.dependencies]`
