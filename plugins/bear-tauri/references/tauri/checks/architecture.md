# Check Tauri v2 Architecture

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans both the Rust core and the web frontend, or requires cross-cutting investigation.

## MISSION

Audit the architecture of a Tauri v2 application (stable line 2.12; Tauri 3 alpha is out of scope). Stance: **a thin, typed IPC boundary between a Rust core (`src-tauri/`) and a frontend-agnostic web UI (`src/`)**. Commands are small adapters over plain Rust modules; the frontend never reaches the OS directly except through declared commands and permissions. UI-framework concerns (React, Vue, Svelte, Vite config) are audited with the matching stack, not here.

All commands run in Docker (`docker compose exec app ...`). Building and running the GUI requires a display and the platform WebView libraries; audit static structure in the container and run the app on the target OS when runtime behavior must be verified.

### Step 1: Project Layout (5 points)

```bash
docker compose exec app ls src src-tauri src-tauri/src src-tauri/capabilities src-tauri/icons
docker compose exec app cat src-tauri/src/main.rs
docker compose exec app grep -nE "mobile_entry_point|pub fn run|generate_context" src-tauri/src/lib.rs
docker compose exec app grep -nE "crate-type|\[lib\]|tauri-build|rust-version|edition" src-tauri/Cargo.toml
docker compose exec app cat src-tauri/build.rs
```

Checklist:
- [ ] Frontend in `src/`, Rust core in `src-tauri/` with `Cargo.toml`, `build.rs` (calls `tauri_build`), `tauri.conf.json`, `capabilities/*.json`, `icons/`
- [ ] `src-tauri/src/main.rs` is a stub that only calls `app_lib::run()` (the library name set in `[lib]`); all logic lives in `src/lib.rs`
- [ ] `lib.rs` exposes `pub fn run()` annotated with `#[cfg_attr(mobile, tauri::mobile_entry_point)]` (required for iOS/Android, harmless on desktop)
- [ ] `src-tauri/Cargo.toml` declares a `[lib]` section with the crate types Tauri requires and a library name distinct from the package name
- [ ] `rust-version` (MSRV) declared and compatible with Tauri 2.12 (`1.90`)
- [ ] Generated schemas (`gen/schemas/`) are not hand-edited; `Cargo.lock` committed
- [ ] `tauri.conf.json` has a reverse-DNS `identifier` and a `build` section (`frontendDist`, `devUrl`, `beforeDevCommand`, `beforeBuildCommand`) that matches the frontend toolchain

Detect anti-patterns:

```bash
docker compose exec app sh -c 'find src-tauri/src -name "*.rs" | xargs wc -l | sort -rn | head -10'
docker compose exec app sh -c 'wc -l src-tauri/src/main.rs src-tauri/src/lib.rs'
```

**Scoring**: 5 pts, minus 1 per violation (min 0).

### Step 2: Command Layer (6 points)

Commands adapt IPC to plain Rust functions: deserialize arguments, call a module, map the result. No business rules and no OS plumbing inline.

```bash
docker compose exec app grep -rnE "#\[tauri::command" src-tauri/src
docker compose exec app grep -rnE "generate_handler!" src-tauri/src
docker compose exec app grep -rnE "\.unwrap\(\)|\.expect\(|panic!|todo!" src-tauri/src
docker compose exec app grep -rnE "async fn .*(&str|&String|State<)" src-tauri/src
docker compose exec app grep -rnE "impl .*Serialize for|thiserror" src-tauri/src
```

Checklist:
- [ ] Commands are grouped by module (`commands/files.rs`, `commands/settings.rs`, ...) and registered in a single `tauri::generate_handler![...]` passed to `.invoke_handler(...)`; every `#[tauri::command]` is registered exactly once
- [ ] A command body is <= 15 lines (target 10): extract arguments, call a function, map the result
- [ ] Core logic lives in plain Rust modules that do not depend on `tauri` types, so it is unit-testable without a runtime
- [ ] Fallible commands return `Result<T, E>` where `E` is an enum derived with `thiserror` and implements `serde::Serialize` (for example `serialize_str(self.to_string())`)
- [ ] Async commands with borrowed arguments (`&str`, `State<'_, T>`) return `Result`, which Tauri requires; otherwise take owned arguments
- [ ] No `unwrap()` / `expect()` / `panic!` in command paths: a panic must not be the way errors reach the UI
- [ ] Heavy or blocking work does not run on the main thread: use async commands, and `spawn_blocking` for blocking calls
- [ ] Long-running progress and streaming use `tauri::ipc::Channel<T>`, not polling or ad-hoc event spam
- [ ] Command and argument names are stable, intention-revealing and snake_case on the Rust side (the frontend passes camelCase argument keys by default)

**Scoring**: 6 pts. Deduct 1 per command mixing business rules or OS plumbing, 1 per unregistered or doubly-registered command, 1 per `unwrap`/`expect` cluster in command paths, max -6.

### Step 3: State, Plugins and Setup (5 points)

```bash
docker compose exec app grep -rnE "\.manage\(|State<" src-tauri/src
docker compose exec app grep -rnE "Mutex|RwLock|static mut|lazy_static|OnceLock" src-tauri/src
docker compose exec app grep -rnE "\.plugin\(|tauri_plugin_" src-tauri/src src-tauri/Cargo.toml
docker compose exec app grep -rnE "\.setup\(|cfg\(desktop\)|cfg\(mobile\)" src-tauri/src
```

Checklist:
- [ ] Application state is registered with `app.manage(...)` (or `Builder::manage`) and read via `State<'_, T>`; no global mutable statics
- [ ] Shared mutable state is wrapped in `Mutex` / `RwLock` (std `Mutex` for short critical sections, an async-aware mutex when the guard is held across `.await`); no other guard is held across `.await`
- [ ] State types are small and purpose-specific (one per concern), not a single god `AppState`
- [ ] Plugins registered with `.plugin(tauri_plugin_xxx::init())`; every plugin in `Cargo.toml` has its npm package (when it has a JS API) and its permissions declared in a capability file
- [ ] Desktop-only plugins and code are gated with `#[cfg(desktop)]`, typically inside `.setup(|app| ...)`; mobile-only code with `#[cfg(mobile)]`
- [ ] The `setup` hook stays short: it wires state and plugins, it does not contain feature logic
- [ ] Custom plugins (if any) own their commands, state and permissions, and are consumed through the same capability mechanism as official ones

**Scoring**: 5 pts (2 state, 2 plugins and platform gating, 1 setup hygiene).

### Step 4: Windows, Configuration and Platforms (4 points)

```bash
docker compose exec app cat src-tauri/tauri.conf.json
docker compose exec app ls src-tauri/capabilities
docker compose exec app grep -rnE "WebviewWindowBuilder|get_webview_window|\"windows\"" src-tauri
docker compose exec app ls src-tauri/gen
```

Checklist:
- [ ] Windows are declared in `tauri.conf.json` or created from Rust with an explicit label; each label is covered by a capability (see the security check)
- [ ] Multi-window apps keep one capability per window role; shared logic lives in Rust, not duplicated in each window's frontend
- [ ] Platform differences use `cfg` attributes or capability `platforms`, not runtime sniffing in the UI
- [ ] If mobile is targeted: `tauri android init` / `tauri ios init` have been run, the generated projects are committed or reproducibly generated, and the mobile entry point is present
- [ ] Configuration (`productName`, `version`, `identifier`, bundle targets, icons) is complete and consistent with the `Cargo.toml` and `package.json` versions
- [ ] Environment-specific values come from build-time or runtime configuration, not hard-coded URLs and keys

**Scoring**: 4 pts (1 per checklist group: windows, platform gating, mobile, configuration).

### Step 5: Frontend / Backend Boundary (5 points)

```bash
docker compose exec app grep -rnE "from ['\"]@tauri-apps/api" src
docker compose exec app grep -rnE "invoke\(" src
docker compose exec app grep -rnE "listen\(|emit\(|Channel" src
docker compose exec app grep -nE "withGlobalTauri" src-tauri/tauri.conf.json
```

Checklist:
- [ ] `invoke` is called from one typed wrapper module (for example `src/lib/ipc.ts`), not scattered through UI components; each wrapper has explicit argument and return types
- [ ] Types for command payloads are shared by construction (hand-written mirror types, or bindings generated with tauri-specta, which is optional) and kept in sync by a CI check
- [ ] Errors crossing the boundary have a documented shape that the UI handles (the rejected promise carries the serialized error); no silent catch
- [ ] Events (`emit` / `listen`) are used for notifications; request/response uses commands; streaming uses `Channel`; listeners are unregistered on teardown
- [ ] The frontend imports from `@tauri-apps/api` (or an official plugin package) only inside the IPC layer or thin adapters, keeping UI components testable without Tauri
- [ ] `app.withGlobalTauri` is off unless a documented need exists (see the security check)
- [ ] The web assets build is a static bundle (`frontendDist`); the dev server URL is used only in development

**Scoring**: 5 pts (2 typed wrappers and types, 1 error contract, 1 events/channels, 1 global API exposure and build output).

## OUTPUT FORMAT

```
TAURI v2 ARCHITECTURE AUDIT
===========================

SCORE: XX/25

Tauri: X.Y   Rust: X.Y.Z   Frontend: [framework + bundler]   Commands: N   Plugins: N   Windows: N   Targets: [desktop/android/ios]

SUB-SCORES:
  Project layout                    : XX/5
  Command layer                     : XX/6
  State, plugins and setup          : XX/5
  Windows, configuration, platforms : XX/4
  Frontend / backend boundary       : XX/5

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

- Findings must cite `file:line` and propose a concrete refactoring (for example "move the file-copy logic from the `copy_file` command into `files::copy` so it can be unit-tested without a runtime")
- Do not recommend tauri-specta, custom plugins or extra abstractions when the app is small and readable (YAGNI)
- UI-framework architecture belongs to the React / Vue / Svelte / Vite stacks; general Rust architecture (workspace, error design) belongs to the `rust` stack
- Tauri v1 projects: report the version and recommend the migration to v2; do not score v1 projects against v2-only items
- Never run `tauri build` for release or signing steps during an audit
