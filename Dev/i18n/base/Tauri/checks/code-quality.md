# Check Tauri v2 Code Quality

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans both the Rust core and the web frontend, or requires cross-cutting investigation.

## MISSION

Audit the code quality of a Tauri v2 application: the Rust core (`src-tauri/`) and the TypeScript side of the IPC boundary. General Rust rules (Clippy, ownership, `thiserror`) follow the `rust` stack; UI code follows the React / Vue / Svelte / Vite stack in use. This check covers what is specific to Tauri plus the quality gates that tie both halves together. KISS, DRY and YAGNI apply: no speculative plugins, wrappers or generated bindings.

All commands run in Docker (`docker compose exec app ...`).

### Step 1: Rust Lints and Formatting (6 points)

```bash
docker compose exec app sh -c 'cd src-tauri && cargo fmt --all -- --check'
docker compose exec app sh -c 'cd src-tauri && cargo clippy --all-targets --all-features -- -D warnings'
docker compose exec app grep -rnE "#\[allow\(" src-tauri/src
docker compose exec app grep -rnE "dbg!|println!|todo!|unimplemented!" src-tauri/src
docker compose exec app grep -nE "\[lints|unsafe_code|rust-version|edition" src-tauri/Cargo.toml
```

Checklist:
- [ ] `cargo fmt --check` clean
- [ ] `cargo clippy -- -D warnings` clean on all targets; lints configured once (`[lints]` in `Cargo.toml`)
- [ ] `#![forbid(unsafe_code)]` (or equivalent lint) on the app crate unless a documented platform integration needs `unsafe`
- [ ] Each `#[allow(...)]` is scoped to one item and justified (prefer `#[expect(..., reason = "...")]`)
- [ ] No `dbg!`, `println!`, `todo!` left behind; logging goes through `log` / `tracing` (via the log plugin or a subscriber), not `println!`
- [ ] Edition 2024 for new code (the `rust` stack baseline); `rust-version` set and >= Tauri's own MSRV (1.90 for Tauri 2.12)

**Scoring**: 6 pts (2 fmt, 2 clippy, 1 allow/unsafe hygiene, 1 logging and leftovers).

### Step 2: TypeScript Side of the Boundary (5 points)

```bash
docker compose exec app npx tsc --noEmit
docker compose exec app npx eslint . --max-warnings 0
docker compose exec app grep -rnE "invoke(<any>)?\(" src
docker compose exec app grep -rnE ": any|as any|@ts-ignore|@ts-expect-error" src
docker compose exec app grep -nE "\"strict\"|noUncheckedIndexedAccess" tsconfig.json
```

Checklist:
- [ ] `tsc --noEmit` passes with `strict: true`
- [ ] ESLint (flat config) or Biome passes with zero warnings
- [ ] Every `invoke` call is typed (`invoke<ReturnType>('command_name', { args })`) and wrapped in a function with named parameters; command names are string literals defined once
- [ ] No `any` at the IPC boundary; unknown payloads from events are validated or narrowed before use
- [ ] `@ts-ignore` is banned; `@ts-expect-error` carries a reason
- [ ] The wrapper layer is the only place that knows command names, so renaming a Rust command is a one-file frontend change
- [ ] If tauri-specta is used, the generated bindings file is committed or reproducibly generated in CI, and never hand-edited

**Scoring**: 5 pts (2 strict typing and lint, 2 typed wrappers, 1 generated bindings or mirror-type discipline).

### Step 3: KISS / DRY / YAGNI and Complexity (3 points)

```bash
docker compose exec app sh -c 'find src-tauri/src src -name "*.rs" -o -name "*.ts" | xargs wc -l | sort -rn | head -15'
```

Checklist:
- [ ] Rust functions < 10 lines target (limit 20), nesting <= 3, parameters <= 4 (cognitive complexity < 10)
- [ ] Commands that take more than 4 arguments take one typed struct instead
- [ ] No plugin, capability, window or event added "for later"; every command has a caller in the frontend
- [ ] No duplicated command logic across modules (rule of three before abstracting)
- [ ] Unused commands, events and permissions are removed (an unused permission is a security finding, too)

**Scoring**: 3 pts, minus 1 per violation group.

### Step 4: Error Handling (5 points)

```bash
docker compose exec app grep -rnE "Result<.*, String>" src-tauri/src
docker compose exec app grep -rnE "thiserror|impl serde::Serialize|impl Serialize" src-tauri/src
docker compose exec app grep -rnE "\.unwrap\(\)|\.expect\(" src-tauri/src
docker compose exec app grep -rnE "catch\s*\(|\.catch\(" src
```

Checklist:
- [ ] Commands return a typed error enum (`thiserror`) that implements `serde::Serialize`; `Result<T, String>` is accepted only for trivial commands
- [ ] Internal causes (paths, SQL, OS errors) are logged on the Rust side; the serialized error exposes a stable code or message safe to show
- [ ] `anyhow` stays out of command signatures (it does not implement `Serialize`); it may be used inside binaries and tools
- [ ] No `unwrap()` / `expect()` in command, event handler or setup paths (setup failures return `Err` from the hook so the app fails with a clear message)
- [ ] On the frontend, every awaited `invoke` has a handled rejection path (error state in the UI, not `console.log`)
- [ ] Panics in spawned tasks are observed (join handle checked or logged)

**Scoring**: 5 pts (2 Rust error types, 1 no-panic paths, 1 safe messages, 1 frontend handling).

### Step 5: Naming and Documentation (3 points)

Checklist:
- [ ] Rust: RFC 430 naming; commands are verb-first snake_case (`read_settings`, `export_report`); modules mirror the feature
- [ ] TypeScript wrappers use camelCase verbs matching the command (`readSettings`); event names are constants in one place, namespaced (for example `download://progress`)
- [ ] Public Rust items and non-obvious commands have `///` docs describing arguments, errors and required permission
- [ ] Each capability file has a meaningful `description`; `README` explains dev, build, mobile and release steps
- [ ] Comments explain WHY (platform quirks, permission choices), not what

**Scoring**: 3 pts (1 naming Rust, 1 naming TS and events, 1 documentation).

### Step 6: Toolchain and CI (3 points)

```bash
ls rust-toolchain.toml .github/workflows deny.toml rustfmt.toml
docker compose exec app grep -nE "tauri-action|cargo clippy|cargo fmt|tsc|eslint|biome" -r .github/workflows
docker compose exec app grep -nE "\"@tauri-apps/(cli|api)\"" package.json
docker compose exec app grep -nE "^tauri(-build)? " src-tauri/Cargo.toml
```

Checklist:
- [ ] `rust-toolchain.toml` pins the channel with `clippy` and `rustfmt`
- [ ] CI runs fmt, clippy, `cargo test`, `tsc --noEmit`, lint, frontend tests on every PR; release builds use `tauri-apps/tauri-action`
- [ ] `tauri`, `tauri-build`, `@tauri-apps/cli` and `@tauri-apps/api` are on the same 2.x minor line; plugin crates and their npm packages are kept in step (the CLI warns about mismatches)
- [ ] Lockfiles (`Cargo.lock`, `package-lock.json` / `pnpm-lock.yaml`) committed; CI installs with `--locked` / `npm ci`
- [ ] Dependabot or Renovate covers `cargo`, `npm` and `github-actions`

**Scoring**: 3 pts (1 pinning, 1 CI gates, 1 version alignment and updates).

## OUTPUT FORMAT

```
TAURI v2 CODE QUALITY AUDIT
===========================

SCORE: XX/25

Tauri: X.Y   Rust: X.Y.Z   clippy warnings: N   tsc errors: N   lint warnings: N

SUB-SCORES:
  Rust lints and formatting     : XX/6
  TypeScript boundary           : XX/5
  KISS / DRY / YAGNI            : XX/3
  Error handling                : XX/5
  Naming and documentation      : XX/3
  Toolchain and CI              : XX/3

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

- Findings must cite `file:line` and propose a concrete fix
- Defer UI-component quality to the React / Vue / Svelte / Vite audits and general Rust quality to the `rust` stack; do not double-count
- Do not demand tauri-specta: hand-written typed wrappers are fine for small command surfaces
- Auto-fixes (`cargo clippy --fix`, `eslint --fix`) are proposed, not applied, during an audit
