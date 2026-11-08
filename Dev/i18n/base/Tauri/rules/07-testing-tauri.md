# Tauri v2 Testing Guidelines

> Scope: Tauri v2 (stable 2.12). Component-level UI testing follows the React / Vue / Svelte / Vite stacks; general Rust testing (nextest, proptest, cargo-llvm-cov) follows the `rust` stack. This document covers the Tauri-specific test surfaces.

TDD (Red, Green, Refactor) is mandatory; coverage >= 80%; pyramid 70% unit / 20% integration / 10% E2E. Bug fix = regression test first.

## The Three Test Surfaces

| Surface | Tool | Needs GUI | Speed |
|---------|------|-----------|-------|
| Rust core logic | `cargo test` / nextest (plain modules) | No | ms |
| Commands and state | `tauri::test` mock runtime (feature `test`) | No | ms |
| Frontend IPC code | Vitest + `mockIPC` from `@tauri-apps/api/mocks` | No (DOM env) | ms |
| Assembled app | WebDriver E2E (WebdriverIO + `@wdio/tauri-service`, or `tauri-driver`) | Yes (display) | seconds |

Design for the fast three: keep logic in plain Rust modules and plain TS functions so that E2E stays small.

## Rust: Core Logic

Test modules that do not import `tauri` with ordinary unit tests: valid and invalid inputs, boundaries, every error variant, AAA structure. Use temporary directories for filesystem code and inject time and randomness.

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_path_like_note_names() {
        assert!(matches!(validate_name("../etc/passwd"), Err(Error::InvalidName)));
    }
}
```

## Rust: Commands on the Mock Runtime

The `tauri::test` module (feature `test`, documented as unstable) builds an app on `MockRuntime`, so commands run without a window system:

- `mock_builder()`: a `Builder<MockRuntime>`; register state, plugins and `invoke_handler` on it
- `mock_context(noop_assets())`: a minimal test context
- `mock_app()`: `mock_builder().build(mock_context(noop_assets()))` in one call
- `get_ipc_response(&webview, request)`: sends an IPC message to a webview window and returns the response

Enable the feature for tests only:

```toml
# src-tauri/Cargo.toml
[dev-dependencies]
tauri = { version = "2", features = ["test"] }
```

Pattern: build the app with `mock_builder()`, `manage` the state, register the handler, create a `WebviewWindowBuilder` window on the mock app, then send an `InvokeRequest` through `get_ipc_response` and assert on the `Ok`/`Err` value. See `templates/ipc-mock-test.md` for the full test. Prefer testing the plain function directly and keep a few mock-runtime tests for wiring: command registration, argument names, state injection and error serialization.

Tips:
- Assert the **serialized** error shape (the `Err(serde_json::Value)`) because that is what the frontend receives
- Keep one test per command wiring; do not re-test business rules through IPC
- Never point tests at real user directories; use `tempfile` directories

## Frontend: `mockIPC` with Vitest

`@tauri-apps/api/mocks` replaces the IPC layer so wrapper code runs without Tauri.

```typescript
import { mockIPC, clearMocks } from '@tauri-apps/api/mocks'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readNote } from './ipc'

afterEach(() => clearMocks())

describe('readNote', () => {
  it('invokes read_note with the name', async () => {
    const handler = vi.fn((cmd: string, args: unknown) => {
      if (cmd === 'read_note') return 'hello'
    })
    mockIPC(handler)

    await expect(readNote('todo')).resolves.toBe('hello')
    expect(handler).toHaveBeenCalledWith('read_note', { name: 'todo' })
  })

  it('surfaces Rust errors as rejections', async () => {
    mockIPC((cmd) => {
      if (cmd === 'read_note') throw 'note not found'
    })
    await expect(readNote('missing')).rejects.toBe('note not found')
  })
})
```

Rules:
- `clearMocks()` in `afterEach`, always: mocks are global
- Asserting command name and argument keys in the mock makes a Rust-side rename or signature change fail a test
- For events (`emit` / `listen`), enable event mocking: `mockIPC(handler, { shouldMockEvents: true })`
- Test components through the wrapper module; do not mock `@tauri-apps/api` ad hoc in every test
- Use the DOM environment recommended by the UI stack (jsdom, or Vitest Browser Mode); no real network

## End-to-End (WebDriver)

E2E drives the **real built app** through the platform WebDriver.

### Recommended: WebdriverIO + `@wdio/tauri-service`

- Supports Windows, Linux and macOS
- Default provider `embedded`: relies on the `tauri-plugin-wdio-webdriver` plugin inside the app (the only way on macOS)
- `tauri-plugin-wdio` adds `browser.tauri.execute()` (run code in the app), IPC mocking and log capture
- Bootstrap with `npm create wdio@latest`, choose Desktop Testing, then Tauri
- A **browser mode** runs the frontend in Chrome against the Vite dev server with `invoke()` intercepted: fast, no native build, good for UI flows

### Alternative: `tauri-driver`

Windows and Linux only (no macOS), used with Selenium or WebdriverIO. Pick it when the plugin-based approach is not wanted.

### Build and run

```bash
npm run tauri build -- --debug --no-bundle     # debug binary without packaging
npx wdio run wdio.conf.ts
```

Rules:
- The E2E plugins are compiled into **debug/test builds only** (feature-gate or `#[cfg(debug_assertions)]`); a release build never contains a WebDriver backdoor
- On headless Linux CI run under a virtual display (for example `xvfb-run`)
- Stable selectors (test ids, roles), a fresh app data directory per run, no fixed sleeps
- Cover critical journeys only: first run, main workflow, a permission-gated action, the update prompt. Everything else belongs lower in the pyramid
- Run the E2E matrix per target OS before release; keep it out of the per-commit gate

## Capability Regression Tests

A permission added by accident is a vulnerability. Guard it:

```typescript
// tests/capabilities.test.ts
import { readFileSync, readdirSync } from 'node:fs'
import { expect, it } from 'vitest'

it('main window permissions match the reviewed list', () => {
  const dir = 'src-tauri/capabilities'
  const all = readdirSync(dir).filter((f) => f.endsWith('.json'))
  const perms = all.flatMap((f) => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')).permissions)
  expect(perms).toMatchSnapshot()
})
```

The snapshot diff forces a conscious review whenever `capabilities/` changes.

## Mobile

Unit and mock-runtime tests run on the host Rust target as usual. Device-level UI tests are tooling-specific (for example Maestro for mobile E2E per the testing rule); keep logic testable off-device.

## Coverage and CI

```bash
cargo llvm-cov nextest --manifest-path src-tauri/Cargo.toml --fail-under-lines 80
npx vitest run --coverage
```

- Exclude `main.rs` and generated files from coverage
- Enforce thresholds in CI; mutation testing (`cargo-mutants`, Stryker) on critical logic
- Fast gate (Rust + Vitest) on every PR; E2E on schedule and before release

## Anti-Patterns

| Anti-pattern | Fix |
|--------------|-----|
| Business logic only reachable through IPC in tests | Extract a plain function, test it directly |
| Missing `clearMocks()` | `afterEach(() => clearMocks())` |
| Mock handler that accepts any command | Assert command name and arguments |
| E2E for every screen | Keep E2E to ~10%, critical journeys |
| WebDriver plugin in release builds | Debug/test builds only |
| Tests touching real user directories | Temporary directories |
| `sleep` waits | Awaited conditions, fake timers |
