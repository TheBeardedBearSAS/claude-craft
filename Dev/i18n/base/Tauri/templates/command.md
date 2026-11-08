# Template: Tauri Command, Error, State and Typed Wrapper

A command is a thin adapter: deserialize arguments, call plain Rust, map the result. Business rules live in a module that does not import `tauri`. Targets Tauri v2 (stable 2.12).

## Conventions

- One module per feature under `src-tauri/src/commands/`; all commands registered in a single `tauri::generate_handler![...]`
- Core logic in a plain module (no `tauri` types) so it is unit-testable without a runtime
- Fallible commands return `Result<T, Error>`; `Error` is a `thiserror` enum implementing `serde::Serialize`
- Async commands with borrowed arguments (`&str`, `State<'_, T>`) must return `Result`
- Arguments are validated in Rust; the UI check is a convenience only
- The frontend calls the command through one typed wrapper, never `invoke` inline in components
- Add the permission the frontend needs to the capability of the window that calls it (see `capability.md`) only if the command comes from a plugin or an app permission file

## Core Logic (no `tauri` dependency)

```rust
// src-tauri/src/notes.rs
use std::{fs, path::Path};

use crate::error::Error;

const MAX_NAME_LEN: usize = 64;

/// Accepts letters, digits, '-' and '_' only: no separators, no dots, no traversal.
pub fn validate_name(raw: &str) -> Result<&str, Error> {
    let ok = !raw.is_empty()
        && raw.len() <= MAX_NAME_LEN
        && raw.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_');
    if ok { Ok(raw) } else { Err(Error::InvalidName) }
}

pub fn read(dir: &Path, name: &str) -> Result<String, Error> {
    let name = validate_name(name)?;
    match fs::read_to_string(dir.join(format!("{name}.md"))) {
        Ok(body) => Ok(body),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Err(Error::NotFound),
        Err(e) => Err(Error::Io(e)),
    }
}

pub fn save(dir: &Path, name: &str, body: &str) -> Result<(), Error> {
    let name = validate_name(name)?;
    fs::create_dir_all(dir)?;
    fs::write(dir.join(format!("{name}.md")), body)?;
    Ok(())
}
```

## Error

```rust
// src-tauri/src/error.rs
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("invalid note name")]
    InvalidName,
    #[error("note not found")]
    NotFound,
    #[error("storage error")]
    Io(#[from] std::io::Error),
    #[error("internal error")]
    Path(#[from] tauri::Error),
}

// Tauri needs the error to be serializable. Only the safe message crosses the boundary.
impl serde::Serialize for Error {
    fn serialize<S: serde::ser::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        if let Error::Io(cause) = self {
            log::error!("io failure: {cause}"); // cause stays on the Rust side
        }
        serializer.serialize_str(self.to_string().as_ref())
    }
}
```

## State

```rust
// src-tauri/src/state.rs
use std::sync::Mutex;

#[derive(Default)]
pub struct Settings {
    pub theme: String,
}

pub type SettingsState = Mutex<Settings>;
```

Registered once with `app.manage(Mutex::new(Settings::default()))` (see the entry point below).

## Commands

```rust
// src-tauri/src/commands/notes.rs
use tauri::{AppHandle, Manager, State};

use crate::{error::Error, notes, state::SettingsState};

#[tauri::command]
pub fn read_note(app: AppHandle, name: String) -> Result<String, Error> {
    let dir = app.path().app_data_dir()?;
    notes::read(&dir, &name)
}

#[tauri::command]
pub fn save_note(app: AppHandle, name: String, body: String) -> Result<(), Error> {
    let dir = app.path().app_data_dir()?;
    notes::save(&dir, &name, &body)
}

#[tauri::command]
pub fn set_theme(state: State<'_, SettingsState>, theme: String) {
    state.lock().expect("settings lock poisoned").theme = theme;
}
```

If a command must block (heavy IO or CPU), make it `async` and move the work with `tauri::async_runtime::spawn_blocking`; with borrowed arguments the return type stays `Result`.

## Registration (`lib.rs`)

```rust
// src-tauri/src/lib.rs
mod commands;
mod error;
mod notes;
mod state;

use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(Mutex::new(state::Settings::default()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::notes::read_note,
            commands::notes::save_note,
            commands::notes::set_theme,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Streaming Progress with a Channel

```rust
use serde::Serialize;
use tauri::ipc::Channel;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase", tag = "event", content = "data")]
pub enum ExportEvent {
    Progress { done: u32, total: u32 },
    Finished,
}

#[tauri::command]
pub async fn export_all(on_event: Channel<ExportEvent>) -> Result<(), Error> {
    for done in 1..=10 {
        on_event.send(ExportEvent::Progress { done, total: 10 })?;
    }
    on_event.send(ExportEvent::Finished)?;
    Ok(())
}
```

`Channel::send` returns `tauri::Result`, covered by the `Path(#[from] tauri::Error)` variant above.

## Frontend Wrapper

```typescript
// src/lib/ipc.ts
import { Channel, invoke } from '@tauri-apps/api/core'

export function readNote(name: string): Promise<string> {
  return invoke<string>('read_note', { name })
}

export function saveNote(name: string, body: string): Promise<void> {
  return invoke<void>('save_note', { name, body })
}

export function setTheme(theme: string): Promise<void> {
  return invoke<void>('set_theme', { theme })
}

export type ExportEvent =
  | { event: 'progress'; data: { done: number; total: number } }
  | { event: 'finished' }

export async function exportAll(onEvent: (e: ExportEvent) => void): Promise<void> {
  const channel = new Channel<ExportEvent>()
  channel.onmessage = onEvent
  await invoke<void>('export_all', { onEvent: channel })
}
```

## Checklist

- [ ] Core function tested directly (valid, invalid, each error variant)
- [ ] Command wiring tested on the mock runtime (see `ipc-mock-test.md`)
- [ ] Wrapper tested with `mockIPC` and `clearMocks()`
- [ ] Command registered once in `generate_handler!`
- [ ] No `unwrap()` / `expect()` in the new command path (the lock `expect` above is a poisoned-lock invariant; prefer mapping it to an error variant when the state is critical)
- [ ] Capability updated only with what the frontend needs
