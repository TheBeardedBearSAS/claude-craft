# Tauri v2 Quality Tools

> Scope: Tauri v2 (stable 2.12). Two toolchains, one gate: the Rust core (`src-tauri/`) and the TypeScript frontend (`src/`). General Rust tooling is detailed in the `rust` stack; frontend linting in the React / Vue / Svelte / Vite stacks. All commands run in Docker (`docker compose exec app ...`).

## Tool Matrix

| Concern | Rust core | Frontend |
|---------|-----------|----------|
| Format | `cargo fmt --all -- --check` | Prettier or Biome format |
| Lint | `cargo clippy --all-targets --all-features -- -D warnings` | ESLint (flat config) or Biome |
| Types | compiler | `tsc --noEmit` (strict) |
| Tests | `cargo test` / `cargo nextest run` | `vitest run` |
| Coverage | `cargo llvm-cov` (>= 80%) | Vitest coverage (>= 80%) |
| Dependency audit | `cargo audit`, `cargo deny check` | `npm audit --omit=dev --audit-level=moderate` |
| Secrets | gitleaks or equivalent on the repo | same |

## Rust Configuration

```toml
# rust-toolchain.toml
[toolchain]
channel = "stable"
components = ["clippy", "rustfmt"]
```

```toml
# src-tauri/Cargo.toml
[package]
edition = "2024"
rust-version = "1.90"        # Tauri 2.12 MSRV; raise if your own code needs more

[lints.rust]
unsafe_code = "forbid"

[lints.clippy]
unwrap_used = "warn"
expect_used = "warn"
```

Notes:
- `unwrap_used` / `expect_used` as warnings (denied by `-D warnings`) keep panics out of command paths; `run()`'s final `expect` and test code use a scoped `#[expect(clippy::expect_used, reason = "process boundary")]` or `#[cfg(test)]` allowance
- Run clippy with `--all-targets` so tests and benches are linted
- If a platform integration genuinely needs `unsafe`, downgrade `forbid` to `deny` for that crate only and document each block with `// SAFETY:`

### cargo-deny

```toml
# src-tauri/deny.toml
[advisories]
ignore = []                  # each ignore needs a documented reason and an expiry

[licenses]
allow = ["MIT", "Apache-2.0", "BSD-3-Clause", "ISC", "Unicode-3.0"]

[bans]
multiple-versions = "warn"

[sources]
unknown-registry = "deny"
unknown-git = "deny"
```

Adjust the license list to the project's policy; Tauri's own dependency tree is large (WebView bindings, windowing), so review `multiple-versions` output once and then keep it as a warning.

## Frontend Configuration

```json
// tsconfig.json (excerpt)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true
  }
}
```

- ESLint flat config (`eslint.config.js`) or Biome, `--max-warnings 0` in CI
- Ban `any` and `@ts-ignore` at least in the IPC module
- Optional tauri-specta: regenerate bindings in CI and fail on a diff

## Tauri-Specific Gates

| Gate | How |
|------|-----|
| Capability review | PRs touching `src-tauri/capabilities/` or `tauri.conf.json` require an explicit reviewer sign-off (CODEOWNERS) |
| Capability snapshot test | Vitest snapshot of the permission list (see `07-testing-tauri.md`) |
| Version alignment | Script comparing `tauri`, `tauri-build`, `@tauri-apps/cli`, `@tauri-apps/api` and plugin versions; fail on minor-line mismatch |
| No secrets in the bundle | Grep `VITE_*` (or the bundler's public prefix) variables for secret-like names |
| Generated files untouched | CI fails if `gen/schemas/` or generated bindings differ after a clean build |
| Release signing | Only `tauri-apps/tauri-action` in the release workflow with secrets from the CI store |

## CI Pipeline

```yaml
# .github/workflows/ci.yml (excerpt)
jobs:
  rust:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with: { components: 'clippy, rustfmt' }
      # install the Linux WebView/GTK build packages required by Tauri here
      - run: cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
      - run: cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --all-features -- -D warnings
      - run: cargo test --manifest-path src-tauri/Cargo.toml --all-features
      - run: cargo deny --manifest-path src-tauri/Cargo.toml check
      - run: cargo audit --file src-tauri/Cargo.lock
  frontend:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: lts/*, cache: npm }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint . --max-warnings 0
      - run: npx vitest run --coverage
      - run: npm audit --omit=dev --audit-level=moderate
```

- The fast gate is Rust unit/mock-runtime tests and Vitest; E2E runs in its own workflow per OS
- Cache `~/.cargo` and `src-tauri/target` (for example with a Rust cache action) to keep the gate fast
- Dependabot or Renovate for `cargo`, `npm` and `github-actions`
- Pin actions to versions or commit SHAs; generate a CycloneDX SBOM per release

## Local Hooks

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    fmt:
      glob: "*.rs"
      run: docker compose exec -T app cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
    clippy:
      glob: "*.{rs,toml}"
      run: docker compose exec -T app cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
    types:
      glob: "*.{ts,tsx,vue,svelte}"
      run: docker compose exec -T app npx tsc --noEmit
```

Hooks are requirements; CLAUDE.md is a suggestion.

## Thresholds

| Metric | Target | Limit |
|--------|--------|-------|
| Cognitive complexity | < 7 | < 10 |
| Function length | < 10 lines | < 20 |
| Nesting depth | 2 | 3 |
| Parameters | 3 | 4 |
| Coverage (Rust, frontend) | >= 80% | blocking below |
| Clippy / ESLint warnings | 0 | 0 |
| Known vulnerabilities (moderate and above) | 0 | 0 |
