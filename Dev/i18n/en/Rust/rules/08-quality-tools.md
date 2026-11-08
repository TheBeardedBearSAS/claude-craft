# Rust / Axum Quality Tools

> Run every tool inside the container: `docker compose exec app <command>`. The same commands run in CI so local and pipeline results match.

## Quality Gate Overview

| Tool | Purpose | Gate |
|------|---------|------|
| **rustfmt** (`cargo fmt`) | Formatting | `--check` passes |
| **clippy** | Lints (correctness, perf, style, pedantic) | 0 warnings (`-D warnings`) |
| **rustc lints** | `unsafe_code = "forbid"`, `unused`, `missing_docs` (libs) | 0 warnings |
| **cargo-deny** | Advisories, licenses, bans, sources | `cargo deny check` passes |
| **cargo-audit** | RustSec advisory scan of `Cargo.lock` | 0 known vulnerabilities |
| **cargo-nextest** | Test runner | All green |
| **cargo-llvm-cov** | Coverage | >= 80% |
| **cargo-udeps / cargo-machete** | Unused dependencies | 0 unused |
| **cargo-mutants** | Mutation testing | Advisory, scheduled |
| **cargo-vet** | Supply-chain audits of dependencies | Gate when adopted |
| **sqlx prepare --check** | `.sqlx` metadata freshness | Gate |
| **cargo-semver-checks** | API breakage in library crates | Gate for published libs |

---

## rustfmt

```bash
docker compose exec app cargo fmt --all              # Format
docker compose exec app cargo fmt --all --check      # CI: fail on drift
```

```toml
# rustfmt.toml: keep minimal, defaults are the community standard
edition = "2024"
```

Avoid nightly-only options so the formatter runs on the pinned stable toolchain.

---

## Clippy

### Default plus Workspace Lints

```toml
# Cargo.toml (workspace root)
[workspace.lints.rust]
unsafe_code = "forbid"
unused_must_use = "deny"

[workspace.lints.clippy]
all = { level = "warn", priority = -1 }
pedantic = { level = "warn", priority = -1 }
unwrap_used = "deny"
expect_used = "warn"
panic = "deny"
dbg_macro = "deny"
todo = "deny"
await_holding_lock = "deny"
# Pedantic lints that are noisy for web services
module_name_repetitions = "allow"
missing_errors_doc = "allow"

# each crate
[lints]
workspace = true
```

```toml
# clippy.toml
allow-unwrap-in-tests = true
allow-expect-in-tests = true
cognitive-complexity-threshold = 10
too-many-arguments-threshold = 4
```

```bash
docker compose exec app cargo clippy --workspace --all-targets --all-features -- -D warnings
docker compose exec app cargo clippy --workspace --fix --allow-dirty    # Apply machine-applicable fixes
```

### Handling Warnings

- Fix the code first; allow a lint locally with a reason:

```rust
#[allow(clippy::too_many_lines, reason = "state machine kept flat for readability")]
fn transition(&mut self, event: Event) { /* ... */ }
```

- Prefer `#[expect(lint, reason = "...")]` (stable): it warns when the suppression becomes unnecessary
- No crate-wide `#![allow(clippy::all)]`; scope allows narrowly
- Pedantic is opt-in: adopt it with a documented allow-list rather than switching it off wholesale

---

## cargo-deny

One tool for four policies. Initialise with `cargo deny init`, then tighten.

```toml
# deny.toml
[graph]
all-features = true

[advisories]
version = 2
yanked = "deny"
ignore = []                          # every entry needs a reason and an expiry comment

[licenses]
version = 2
allow = ["MIT", "Apache-2.0", "BSD-3-Clause", "ISC", "Unicode-3.0"]
confidence-threshold = 0.9

[bans]
multiple-versions = "warn"
wildcards = "deny"
deny = [{ crate = "openssl-sys", reason = "use rustls" }]

[sources]
unknown-registry = "deny"
unknown-git = "deny"
allow-registry = ["https://github.com/rust-lang/crates.io-index"]
```

```bash
docker compose exec app cargo deny check               # All four checks
docker compose exec app cargo deny check advisories    # Only RustSec advisories
docker compose exec app cargo deny check licenses bans sources
```

Verify the exact keys against the cargo-deny book for the installed version (0.20.2 at the time of writing); the configuration schema evolves between releases.

## cargo-audit (RustSec)

```bash
docker compose exec app cargo install cargo-audit --locked
docker compose exec app cargo audit                    # Reads Cargo.lock, fetches the RustSec advisory-db
docker compose exec app cargo audit --deny warnings    # Also fail on unmaintained / yanked
```

cargo-deny already covers advisories; keep `cargo audit` as a second opinion or for its `audit fix` and reporting integrations. Schedule a daily CI run so new advisories on unchanged code are caught.

## Unused Dependencies

```bash
docker compose exec app cargo machete                  # Fast, heuristic (regex based)
docker compose exec app cargo +nightly udeps --all-targets   # Accurate, needs nightly
```

`cargo-machete` can false-positive on crates used only through macros; allow-list those in `Cargo.toml` (`[package.metadata.cargo-machete] ignored = [...]`). cargo-udeps needs a nightly toolchain: run it in a dedicated CI job, not in the pinned stable image.

## Coverage and Mutation

```bash
docker compose exec app cargo llvm-cov nextest --workspace --fail-under-lines 80
docker compose exec app cargo llvm-cov report --lcov --output-path lcov.info     # For Codecov / SonarQube
docker compose exec app cargo mutants --package domain --package application
```

Mutation runs are slow: schedule nightly, run `--in-diff` on pull requests.

## Supply-chain Reviews (cargo-vet) and SBOM

```bash
docker compose exec app cargo vet init
docker compose exec app cargo vet                    # Verify every dependency is audited or exempted
docker compose exec app cargo cyclonedx --format json     # CycloneDX SBOM per crate
```

Start with exemptions for existing dependencies and ratchet down; import audits from trusted organisations rather than auditing everything alone.

## Semver Checking (libraries)

`cargo semver-checks` detects accidental breaking changes in published library crates; run it before releases.

---

## Complexity and Size Metrics

| Metric | Target | Limit | Tool |
|--------|--------|-------|------|
| Cognitive complexity | < 7 | < 10 | clippy `cognitive_complexity` (nursery), review |
| Lines per function | < 10 | < 20 | clippy `too_many_lines` (pedantic, `too-many-lines-threshold`) |
| Parameters | 3 | 4 | clippy `too_many_arguments` |
| Public items documented | 100% for libs | | `missing_docs` |

Tokei or `scc` give quick size statistics; they are advisory.

---

## CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose run --rm app cargo fmt --all --check
      - run: docker compose run --rm app cargo clippy --workspace --all-targets --all-features -- -D warnings
      - run: docker compose run --rm app cargo sqlx prepare --check --workspace
      - run: docker compose run --rm app cargo deny check
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose up -d db
      - run: docker compose run --rm app cargo nextest run --workspace --profile ci
      - run: docker compose run --rm app cargo test --workspace --doc
      - run: docker compose run --rm app cargo llvm-cov nextest --workspace --fail-under-lines 80
  nightly:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose run --rm app cargo audit
      - run: docker compose run --rm app cargo mutants --package domain --package application
```

- Cache `~/.cargo/registry` and `target/` between runs (or rely on cargo-chef image layers)
- Pin third-party GitHub Actions to a commit SHA (supply chain rule 11)
- Run `cargo audit` and mutation testing on a schedule, not on every pull request
- Dependabot or Renovate keeps `Cargo.toml` and GitHub Actions current

---

## Sources

- Clippy: https://rust-lang.github.io/rust-clippy/master/
- cargo-deny book: https://embarkstudios.github.io/cargo-deny/ (0.20.2)
- RustSec advisory database: https://rustsec.org/
- cargo-nextest 0.9.151, cargo-llvm-cov 0.9.1, cargo-mutants 27.1.0, cargo-audit 0.22.2, cargo-vet 0.10.3, cargo-machete 0.9.2, cargo-udeps 0.1.61 (crates.io)

## Checklist

- [ ] `cargo fmt --check` and `cargo clippy -- -D warnings` clean
- [ ] Workspace lints configured, `unsafe_code = "forbid"`
- [ ] `deny.toml` present; `cargo deny check` passes
- [ ] `cargo audit` scheduled daily and on release branches
- [ ] Coverage >= 80% enforced with `--fail-under-lines 80`
- [ ] Unused dependencies checked (machete in PR, udeps nightly)
- [ ] `cargo sqlx prepare --check --workspace` in CI
- [ ] Dependabot or Renovate configured
- [ ] Ignored advisories and `#[allow]` carry a reason
- [ ] CI runs the same commands as the local pipeline
