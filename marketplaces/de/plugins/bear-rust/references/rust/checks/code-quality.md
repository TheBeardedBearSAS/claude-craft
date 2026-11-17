# Check Rust / Axum Code Quality

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple crates or requires cross-cutting investigation.

## MISSION

Audit code quality of the Rust (edition 2024) / axum 0.8 project: linting, formatting, idiomatic Rust, simplicity, error handling, naming, and toolchain hygiene. All commands run in Docker.

### Step 1: Clippy and rustfmt (6 points)

```bash
docker compose exec app cargo fmt --all -- --check
docker compose exec app cargo clippy --workspace --all-targets --all-features -- -D warnings
docker compose exec app grep -rnE "#!?\[(allow|expect)\(" crates src | wc -l
docker compose exec app grep -nE "\[(workspace\.)?lints" Cargo.toml
docker compose exec app ls rustfmt.toml .rustfmt.toml clippy.toml
```

Checklist:
- [ ] `cargo fmt --check` passes; `rustfmt.toml` (if any) is minimal
- [ ] `cargo clippy ... -D warnings` passes with zero warnings on the default branch
- [ ] Lints are configured once in `[workspace.lints]` (for example `clippy::all` as deny, a selective set of `clippy::pedantic` lints), not whole-group pedantic noise silenced piecemeal
- [ ] `#[allow(...)]` is rare, scoped to one item, and justified; prefer `#[expect(..., reason = "...")]` so stale suppressions are reported
- [ ] `#![forbid(unsafe_code)]` (or `unsafe_code = "forbid"` in lints) in every crate that has no justified `unsafe`
- [ ] Formatting and linting run in CI and in a pre-commit hook

**Scoring**: 6 pts. 0 warnings = 6; 1-10 = 4; 11-50 = 2; > 50 or no clippy in CI = 0. Deduct 1 for unjustified `allow`.

### Step 2: Idiomatic Rust (5 points)

```bash
docker compose exec app rustc --version
docker compose exec app grep -rnE "\.clone\(\)" crates src | wc -l
docker compose exec app grep -rnE "&String|&Vec<|Box<dyn Error>" crates src
docker compose exec app grep -rnE "as (u|i)(8|16|32|64|size)" crates src | head
docker compose exec app grep -rnE "\bunsafe\b" crates src
```

Checklist:
- [ ] Borrow instead of clone: function parameters take `&str`, `&[T]`, `impl AsRef<_>` rather than `&String`, `&Vec<T>`
- [ ] Iterator chains preferred over index loops; `collect` into the target type directly
- [ ] `Option`/`Result` combinators and `?` used instead of nested `match`; `let ... else` for early returns
- [ ] Newtypes and enums model the domain; no stringly-typed or boolean-flag APIs
- [ ] `From`/`TryFrom` for conversions; lossy `as` casts avoided (`try_from`)
- [ ] `Default`, `Display`, `Debug` derived or implemented where useful; secrets never derive `Debug` with their value
- [ ] Public APIs are small; items are private by default (`pub(crate)` over `pub`)
- [ ] Any `unsafe` block is isolated, minimal, and carries a `// SAFETY:` comment
- [ ] `rust-version` matches what CI builds; edition 2024 features used consistently

**Scoring**: 5 pts, minus 0.5 per violated item (min 0).

### Step 3: KISS / DRY / YAGNI and Complexity (4 points)

```bash
docker compose exec app cargo clippy --workspace --all-targets -- -W clippy::cognitive_complexity -W clippy::too_many_arguments -W clippy::too_many_lines
docker compose exec app sh -c 'find crates src -name "*.rs" | xargs wc -l | sort -rn | head -10'
docker compose exec app grep -rnE "macro_rules!|proc_macro" crates src
docker compose exec app grep -rnE "dbg!|println!|eprintln!|todo!" crates src
```

Project targets (rule 05): functions < 10 lines (limit 20), cognitive complexity < 7 (limit 10), nesting <= 3, parameters <= 4.

Checklist:
- [ ] Guard clauses and early returns instead of nested `if`/`match`
- [ ] No duplicated business rules (rule of three before abstracting)
- [ ] No speculative abstractions: traits with one implementation and no test double, unused generics, unused options
- [ ] Macros only where functions or generics cannot do the job
- [ ] No dead code (`dead_code` warnings fixed, not allowed) and no leftover `dbg!`, `println!`, `todo!`
- [ ] No unused dependencies (`cargo machete` or `cargo udeps` on nightly)

**Scoring**: 4 pts. Deduct 1 per 5 functions exceeding limits, 1 for duplication hotspots, 1 for leftover debug statements, 1 for speculative abstractions.

### Step 4: Error Handling (4 points)

```bash
docker compose exec app grep -rnE "\.unwrap\(\)|\.expect\(" crates src --include="*.rs" | grep -v "tests/" | head -30
docker compose exec app grep -rnE "anyhow::|Box<dyn (std::error::)?Error" crates src
docker compose exec app grep -rnE "thiserror|derive\(.*Error" crates src
docker compose exec app grep -rnE "let _ = .*(await|send|execute)" crates src
docker compose exec app grep -rnE "impl IntoResponse for" crates src
```

Checklist:
- [ ] Library and domain crates return typed errors (`thiserror` enums); `anyhow` only in binaries (`main`, CLI tools, test helpers)
- [ ] No `unwrap()` / `expect()` / `panic!` / indexing that can panic in request paths; `expect` allowed at startup with a clear message, and in tests
- [ ] Errors keep their source (`#[from]`, `#[source]`) and add context; no `map_err(|_| ...)` that drops the cause silently
- [ ] No swallowed results (`let _ = fallible().await`) without a comment explaining why
- [ ] A single `AppError` implements `IntoResponse` and renders RFC 9457 `application/problem+json`; internal details are logged, never returned
- [ ] Error mapping is exhaustive (`match` without a wildcard on internal enums) so new variants force a decision
- [ ] A panic handler layer (`CatchPanicLayer`) or documented policy exists as a last resort

**Scoring**: 4 pts, minus 1 per violated item group.

### Step 5: Naming and Documentation (3 points)

```bash
docker compose exec app cargo doc --workspace --no-deps --document-private-items
docker compose exec app grep -rnE "#!\[warn\(missing_docs\)\]|missing_docs" Cargo.toml crates src
docker compose exec app ls README.md CHANGELOG.md docs
```

Checklist:
- [ ] RFC 430 naming: `UpperCamelCase` types and traits, `snake_case` functions, modules and variables, `SCREAMING_SNAKE_CASE` constants; getters without `get_` prefix
- [ ] `cargo doc` builds without warnings; public items have `///` docs with `# Errors` and `# Panics` sections where relevant
- [ ] Comments explain WHY, not WHAT; no commented-out code; `TODO` linked to a ticket
- [ ] Doc examples compile (they run as doc tests)
- [ ] README documents Docker setup, `cargo sqlx prepare`, how to run tests, and deployment

**Scoring**: 3 pts (1 naming, 1 docs and comments, 1 README).

### Step 6: Toolchain and CI (3 points)

```bash
docker compose exec app cat rust-toolchain.toml
docker compose exec app cargo deny check
docker compose exec app cargo audit
docker compose exec app cargo outdated --workspace --depth 1
ls .github/workflows .github/dependabot.yml renovate.json
```

Checklist:
- [ ] `rust-toolchain.toml` pins the channel and components (`clippy`, `rustfmt`); the Docker image uses the same toolchain
- [ ] CI runs fmt, clippy `-D warnings`, `cargo sqlx prepare --check`, tests (cargo-nextest), `cargo deny check` and `cargo audit`
- [ ] Docker build uses cargo caching (cargo-chef or BuildKit cache mounts) and a minimal runtime image
- [ ] Dependencies are justified and maintained; Dependabot or Renovate keeps them current

**Scoring**: 3 pts (1 pinned toolchain, 1 CI pipeline, 1 dependency hygiene).

## OUTPUT FORMAT

```
RUST / AXUM CODE QUALITY AUDIT
==============================

SCORE: XX/25

Clippy warnings: N   rustfmt diffs: N   unwrap/expect in request paths: N   unsafe blocks: N

SUB-SCORES:
  Clippy and rustfmt           : XX/6
  Idiomatic Rust               : XX/5
  KISS / DRY / YAGNI           : XX/4
  Error handling               : XX/4
  Naming and documentation     : XX/3
  Toolchain and CI             : XX/3

STRENGTHS:
- [...]

ISSUES (by severity):
- CRITICAL: [file:line] [description] -> [fix]
- IMPORTANT: ...
- MINOR: ...

AUTO-FIXABLE:
  docker compose exec app cargo fmt --all                      # formatting
  docker compose exec app cargo clippy --fix --allow-dirty     # machine-applicable lints: review the diff first

RECOMMENDATIONS:
1. [Action] (effort, impact)
```

## IMPORTANT NOTES

- Run `cargo clippy --fix` only on a clean git tree and review the diff
- Match the project's lint profile; do not impose another style, but never accept a missing `-D warnings` gate
- Cite `file:line` for every issue
- Treat generated code and the `.sqlx/` cache as excluded from style findings
