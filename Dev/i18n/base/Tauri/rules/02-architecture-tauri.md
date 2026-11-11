# Tauri v2 Architecture

> Scope: **Tauri v2, stable line 2.12** (`tauri` 2.12.x, MSRV Rust 1.90). Tauri 3 (alpha) is out of scope. This stack is **frontend-agnostic**: UI code follows the React / Vue / Svelte / Vite stacks; general Rust rules (workspace, Clippy, `thiserror`) follow the `rust` stack. This document covers what is specific to Tauri.

## Mental Model

A Tauri app is two programs talking over IPC:

- **Rust core** (`src-tauri/`): owns the OS, the filesystem, state and every privileged operation.
- **Web frontend** (`src/`): any web UI, bundled to static assets and rendered in the platform WebView. It is **untrusted** from the core's point of view and can reach only what **capabilities** permit.

The boundary is made of commands (request/response), events (notifications) and channels (streaming). Keep it thin and typed.

## Project Layout

```
my-app/
├── package.json
├── tsconfig.json
├── vite.config.ts                 # Or the bundler of your frontend
├── src/                           # Frontend (any framework)
│   └── lib/ipc.ts                 # Typed invoke wrappers
└── src-tauri/
    ├── Cargo.toml                 # [lib] + tauri, tauri-build, plugins
    ├── build.rs                   # tauri_build::build()
    ├── tauri.conf.json            # App, build, bundle, security
    ├── capabilities/              # One JSON file per window/role
    │   └── main.json
    ├── icons/
    ├── gen/schemas/               # Generated (for example desktop-schema.json); do not edit
    └── src/
        ├── main.rs                # Stub: calls app_lib::run()
        ├── lib.rs                 # run(): Builder, plugins, state, handlers
        ├── commands/              # Command adapters grouped by feature
        │   ├── mod.rs
        │   └── files.rs
        ├── state.rs               # Managed state types
        └── error.rs               # Serializable error enum
```

## Entry Points: `main.rs` and `lib.rs`

`main.rs` is a stub so the same code serves desktop and mobile. The library name set in `[lib]` of `Cargo.toml` must differ from the package name.

```rust
// src-tauri/src/main.rs
fn main() {
    app_lib::run();
}
```

```rust
// src-tauri/src/lib.rs
mod commands;
mod error;
mod state;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            use tauri::Manager;
            app.manage(std::sync::Mutex::new(state::Settings::default()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::files::read_note,
            commands::files::save_note,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Rules:
- `#[cfg_attr(mobile, tauri::mobile_entry_point)]` is required on `run()` for Android and iOS builds and is harmless on desktop
- Exactly one `invoke_handler` call: `generate_handler!` lists **all** commands (a second `.invoke_handler` replaces the first)
- `expect` on `run` is acceptable at the process boundary; nowhere else in application paths
- Keep `setup` short: wire state and plugins, no feature logic

## Commands

A command is a thin adapter: deserialize arguments, call plain Rust, map the result.

```rust
// src-tauri/src/commands/files.rs
use crate::error::Error;

#[tauri::command]
pub fn read_note(name: String) -> Result<String, Error> {
    crate::notes::read(&name) // core logic: no `tauri` types
}
```

Rules:
- Group commands by feature module and register them with module paths in `generate_handler!`
- Core logic lives in modules that **do not import `tauri`**; they are unit-testable without a runtime
- Return `Result<T, E>` for anything fallible; `E` is a `thiserror` enum implementing `serde::Serialize`
- **Async commands that borrow arguments** (`&str`, `State<'_, T>`) **must return `Result`**; otherwise take owned arguments
- Synchronous commands run on the main thread, so a blocking one freezes the app: prefer `async` commands and `spawn_blocking` for blocking calls
- Argument names are snake_case in Rust and arrive as camelCase from the frontend by default
- Commands needing more than four arguments take one typed struct

### Error type

```rust
// src-tauri/src/error.rs
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("note not found")]
    NotFound,
    #[error("invalid note name")]
    InvalidName,
    #[error("io error")]
    Io(#[from] std::io::Error),
}

impl serde::Serialize for Error {
    fn serialize<S: serde::ser::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
```

Serialize a message that is safe to show; log the underlying cause on the Rust side.

## State

State is registered with `manage` and read through `State<'_, T>`; there are no global mutable statics.

```rust
use std::sync::Mutex;
use tauri::State;

#[derive(Default)]
pub struct Settings { pub theme: String }

#[tauri::command]
pub fn set_theme(state: State<'_, Mutex<Settings>>, theme: String) {
    state.lock().unwrap().theme = theme;
}
```

- Wrap mutable state in `Mutex` / `RwLock`; no `Arc` is needed because Tauri manages the sharing
- Use an async-aware mutex (for example `tokio::sync::Mutex`) when the guard must be held across `.await`; never hold a std guard across `.await`
- Outside commands, read state with `app_handle.state::<T>()` (the `Manager` trait)
- Several small state types beat one god `AppState`
- A poisoned lock is a bug to surface, not to `unwrap()` blindly in production paths: prefer a small helper that maps it to the error enum

## Events and Channels

| Need | Mechanism |
|------|-----------|
| Request/response | Command via `invoke()` |
| Notify the frontend (or other windows) | Events: `emit` in Rust, `listen` from `@tauri-apps/api/event` |
| Stream ordered data (download progress, logs) | `tauri::ipc::Channel<T>` argument on a command |

- Event names are constants, namespaced (for example `download://progress`)
- Event payloads are small, serializable and free of secrets
- Frontend listeners are unregistered on teardown to avoid leaks
- Prefer a `Channel` over many events when ordering and a single consumer matter

## Plugins

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_http::init())
    .setup(|app| {
        #[cfg(desktop)]
        app.handle().plugin(tauri_plugin_single_instance::init(|_app, _argv, _cwd| {}))?;
        Ok(())
    })
```

- Add official plugins with `tauri add <plugin>` (Rust crate, npm package and registration in one step)
- Every plugin with a JS API needs its npm package at a matching 2.x version, and its permissions in a capability file
- Desktop-only plugins are registered under `#[cfg(desktop)]`; mobile-only code under `#[cfg(mobile)]`
- Write a custom plugin only when code must be reused across apps or ships its own permissions; otherwise keep it in the app (YAGNI)
- Tauri 2.12: `exit()` from `@tauri-apps/api/app` quits the app without `@tauri-apps/plugin-process` (grant `core:app:allow-exit`); `app > appDirectoriesOverride` in `tauri.conf.json` redirects the `app_*_dir` path APIs (single root or per directory, e.g. portable apps keeping data next to the executable). Source: https://github.com/tauri-apps/tauri/blob/dev/crates/tauri/CHANGELOG.md

## Windows and Multi-Window

- Windows are declared in `tauri.conf.json` (`app.windows`) or created from Rust with an explicit label
- **Window label = security identity**: capabilities target labels, so one label per role (`main`, `settings`, `splash`)
- Each window role gets its own capability file with only the permissions that role needs
- Shared logic lives in Rust; windows coordinate through events and managed state, not through duplicated frontend logic

## Desktop vs Mobile

- Platform-specific Rust: `#[cfg(desktop)]` / `#[cfg(mobile)]` (and `target_os` where finer control is needed)
- Platform-specific permissions: the capability `platforms` field
- Mobile projects are generated with `tauri android init` / `tauri ios init`; the mobile entry point on `run()` is mandatory
- Design the UI for touch and small screens at the frontend level (see the frontend stack); do not branch on user-agent strings

## Frontend Boundary

- `invoke` lives in **one wrapper module** (see `03-coding-standards.md`); UI components never call it directly
- `app.withGlobalTauri` stays `false`: use the `@tauri-apps/api` imports
- The frontend ships as static assets (`build.frontendDist`); `devUrl` is development only
- Anything the frontend needs from the OS is a command or an official plugin API with an explicit permission

## Configuration (`tauri.conf.json`)

| Section | Purpose |
|---------|---------|
| `productName`, `version`, `identifier` | App identity (reverse-DNS identifier); keep version in line with `Cargo.toml` and `package.json` |
| `build` | `frontendDist`, `devUrl`, `beforeDevCommand`, `beforeBuildCommand` |
| `app.windows` | Declared windows and labels |
| `app.security` | `csp`, `pattern` (Isolation), `capabilities` |
| `bundle` | Targets, icons, signing, updater artifacts |

Schemas in `gen/schemas/` give editors validation for config and capability files; they are generated.

## Anti-Patterns

| Anti-pattern | Fix |
|--------------|-----|
| Business logic inside `#[tauri::command]` bodies | Move to plain modules, test without a runtime |
| Commands registered in several `invoke_handler` calls | One `generate_handler![...]` |
| `unwrap()` on locks or IO in command paths | Return the error enum |
| Global `static mut` / `lazy_static` state | `manage` + `State<'_, T>` |
| `invoke('cmd')` strings scattered in components | Typed wrapper module |
| One capability granting everything to every window | One least-privilege capability per window role |
| `withGlobalTauri: true` "for convenience" | Import from `@tauri-apps/api` |
| Polling a command for progress | `Channel<T>` |
| Plugin or window "for later" | Add when a feature needs it (YAGNI) |
