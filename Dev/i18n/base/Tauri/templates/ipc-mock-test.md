# Template: IPC Tests (Rust Mock Runtime and Vitest `mockIPC`)

Two fast test layers cover the IPC boundary without launching a real window: Rust tests on the `tauri::test` mock runtime, and frontend tests with `mockIPC`. Targets Tauri v2 (stable 2.12). Real-app coverage is the job of the small WebDriver E2E suite (see `07-testing-tauri.md`).

## Conventions

- Test the plain function directly for business rules; use the mock runtime only for wiring (registration, argument names, state injection, error serialization)
- `tauri::test` is behind the `test` feature and documented as unstable: enable it in `[dev-dependencies]` only and check the signatures against the installed version when upgrading
- Frontend: `mockIPC` handler asserts the command name and argument keys; `clearMocks()` in `afterEach`
- Never touch real user directories; use temporary directories
- AAA structure (Arrange, Act, Assert); one behavior per test

## Cargo Setup

```toml
# src-tauri/Cargo.toml
[dev-dependencies]
tauri = { version = "2", features = ["test"] }
tempfile = "3"
serde_json = "1"
```

## Rust: Unit Tests on Core Logic

```rust
// src-tauri/src/notes.rs (tests module)
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn read_returns_not_found_for_missing_note() {
        let dir = tempfile::tempdir().unwrap();
        assert!(matches!(read(dir.path(), "missing"), Err(Error::NotFound)));
    }

    #[test]
    fn save_then_read_round_trips() {
        let dir = tempfile::tempdir().unwrap();
        save(dir.path(), "todo", "buy milk").unwrap();
        assert_eq!(read(dir.path(), "todo").unwrap(), "buy milk");
    }

    #[test]
    fn rejects_path_traversal_names() {
        for bad in ["../x", "a/b", "", "a.b"] {
            assert!(matches!(validate_name(bad), Err(Error::InvalidName)), "{bad}");
        }
    }
}
```

## Rust: Command Wiring on the Mock Runtime

```rust
// src-tauri/src/commands/tests.rs (or tests/ipc.rs through the library crate)
use std::sync::Mutex;

use tauri::{
    ipc::{CallbackFn, InvokeBody},
    test::{get_ipc_response, mock_builder, mock_context, noop_assets, INVOKE_KEY},
    webview::InvokeRequest,
    WebviewWindowBuilder,
};

use crate::{commands, state::Settings};

fn app() -> tauri::App<tauri::test::MockRuntime> {
    mock_builder()
        .manage(Mutex::new(Settings::default()))
        .invoke_handler(tauri::generate_handler![
            commands::notes::set_theme,
            commands::notes::read_note,
        ])
        .build(mock_context(noop_assets()))
        .expect("mock app builds")
}

fn request(cmd: &str, body: serde_json::Value) -> InvokeRequest {
    InvokeRequest {
        cmd: cmd.into(),
        callback: CallbackFn(0),
        error: CallbackFn(1),
        url: "http://tauri.localhost".parse().unwrap(),
        body: InvokeBody::Json(body),
        headers: Default::default(),
        invoke_key: INVOKE_KEY.to_string(),
    }
}

#[test]
fn set_theme_updates_managed_state() {
    let app = app();
    let window = WebviewWindowBuilder::new(&app, "main", Default::default()).build().unwrap();

    let res = get_ipc_response(&window, request("set_theme", serde_json::json!({ "theme": "dark" })));

    assert!(res.is_ok());
    let state = tauri::Manager::state::<Mutex<Settings>>(&app);
    assert_eq!(state.lock().unwrap().theme, "dark");
}

#[test]
fn read_note_error_is_serialized_as_a_safe_message() {
    let app = app();
    let window = WebviewWindowBuilder::new(&app, "main", Default::default()).build().unwrap();

    let res = get_ipc_response(&window, request("read_note", serde_json::json!({ "name": "../x" })));

    assert_eq!(res.unwrap_err(), serde_json::json!("invalid note name"));
}
```

Notes:
- `InvokeRequest`'s field set can change between minor versions of the unstable test module; adjust the helper in one place (`request`) when upgrading
- Argument keys in the JSON body are camelCase, exactly as the frontend sends them
- The mock runtime does not enforce capabilities, so it does not replace a capability review: keep the capability snapshot test

## Frontend: `mockIPC` with Vitest

```typescript
// src/lib/ipc.test.ts
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { readNote, saveNote } from './ipc'

afterEach(() => clearMocks())

describe('ipc wrappers', () => {
  it('readNote invokes read_note with the name', async () => {
    const handler = vi.fn((cmd: string) => (cmd === 'read_note' ? 'hello' : undefined))
    mockIPC(handler)

    await expect(readNote('todo')).resolves.toBe('hello')
    expect(handler).toHaveBeenCalledWith('read_note', { name: 'todo' })
  })

  it('saveNote sends name and body', async () => {
    const handler = vi.fn()
    mockIPC(handler)

    await saveNote('todo', 'buy milk')

    expect(handler).toHaveBeenCalledWith('save_note', { name: 'todo', body: 'buy milk' })
  })

  it('propagates Rust errors as rejections', async () => {
    mockIPC((cmd) => {
      if (cmd === 'read_note') throw 'note not found'
    })

    await expect(readNote('missing')).rejects.toBe('note not found')
  })
})
```

## Frontend: Events

```typescript
import { emit } from '@tauri-apps/api/event'
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks'
import { afterEach, expect, it, vi } from 'vitest'

import { onProgress } from './ipc'

afterEach(() => clearMocks())

it('delivers progress events to the callback', async () => {
  mockIPC(() => {}, { shouldMockEvents: true })
  const cb = vi.fn()
  const unlisten = await onProgress(cb)

  await emit('download://progress', 42)

  expect(cb).toHaveBeenCalledWith(42)
  unlisten()
})
```

## Checklist

- [ ] Business rules tested on plain functions, not through IPC
- [ ] One mock-runtime test per new command: registration, arguments, state, error shape
- [ ] One `mockIPC` test per new wrapper, asserting command name and argument keys
- [ ] `clearMocks()` in `afterEach`; unlisten called in event tests
- [ ] No real directories, network or time dependence
- [ ] Capability snapshot test updated if permissions changed
