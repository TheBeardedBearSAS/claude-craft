# Tauri v2 Coding Standards

> Scope: Tauri v2 (stable 2.12). Rust rules defer to the `rust` stack (`.claude/rules/` of that stack: edition 2024, Clippy, `thiserror`, ownership); UI rules defer to the React / Vue / Svelte / Vite stacks. This document adds the Tauri-specific standards on both sides of the IPC boundary.

## Principles

- **SOLID, KISS, DRY, YAGNI** apply to both halves; the 3 Karpathy principles apply to AI-assisted code: state assumptions, minimal code, surface confusion
- Cognitive complexity target < 7 (limit 10); functions < 10 lines (limit 20); nesting <= 3; parameters <= 4
- The IPC boundary is an API: name it, type it, version it with the app

## Rust Side

### Defer to the `rust` stack for

Edition 2024, `rustfmt`, Clippy `-D warnings`, ownership and borrowing, iterators over index loops, newtypes, `thiserror` in libraries, `#![forbid(unsafe_code)]` by default, no `unwrap()` in non-test paths.

### Tauri specifics

**Commands**
- Verb-first snake_case names: `read_note`, `export_report`, `set_theme`
- One command = one adapter over a function that has no `tauri` types in its signature
- Fallible commands return `Result<T, E>`; `E` is a `thiserror` enum implementing `serde::Serialize` (message safe to show, causes logged)
- Async commands with borrowed arguments (`&str`, `State<'_, T>`) return `Result`
- Never `anyhow::Error` in a command signature (it does not implement `Serialize`)
- Command doc comment states: arguments, errors, required permission

```rust
/// Reads a note from the app data directory.
///
/// # Errors
/// `NotFound` when the note does not exist, `InvalidName` for path-like names.
/// Needs no frontend permission beyond calling this command.
#[tauri::command]
pub fn read_note(name: String) -> Result<String, Error> { /* ... */ }
```

**Validation**
- Treat every argument as untrusted; validate in Rust regardless of UI validation
- Parse into validated types (`TryFrom<Dto>`, newtypes) at the command boundary
- Paths: resolve against an allowed root and reject escapes; never concatenate user input into shell strings

**State and concurrency**
- `manage` + `State<'_, Mutex<T>>`; keep critical sections short; no std guard across `.await`
- Blocking work off the main thread (`async` + `spawn_blocking`)
- Tasks spawned with `tauri::async_runtime::spawn` have their errors observed (logged)

**Logging**
- Use `log` / `tracing` (through the log plugin or a subscriber); no `println!`
- Never log secrets, tokens or full user documents

**Platform code**
- `#[cfg(desktop)]` / `#[cfg(mobile)]` at module or function level, not scattered inline

## TypeScript Side

### Compiler and lint

- `strict: true`; `noUncheckedIndexedAccess` recommended
- ESLint (flat config) or Biome with zero warnings; `@ts-ignore` banned, `@ts-expect-error` needs a reason

### Typed `invoke` wrappers

All calls go through one module. Components never call `invoke` themselves.

```typescript
// src/lib/ipc.ts
import { invoke } from '@tauri-apps/api/core'

export type IpcError = string // matches the serialized Rust error enum

export function readNote(name: string): Promise<string> {
  return invoke<string>('read_note', { name })
}

export function saveNote(name: string, body: string): Promise<void> {
  return invoke<void>('save_note', { name, body })
}
```

Rules:
- Command names are string literals that appear **only** in this module
- Explicit generic on `invoke<T>`; explicit parameter and return types on the wrapper
- Argument object keys are camelCase (Tauri converts them to the Rust snake_case parameter names)
- Wrappers are thin: no business logic, no caching policy (put those in the app layer)
- Rejections: the promise rejects with the serialized Rust error; handle them in the caller and show an error state

### Events and channels

```typescript
import { listen } from '@tauri-apps/api/event'
import { Channel, invoke } from '@tauri-apps/api/core'

export const DOWNLOAD_PROGRESS = 'download://progress' as const

export function onProgress(cb: (pct: number) => void) {
  return listen<number>(DOWNLOAD_PROGRESS, (e) => cb(e.payload)) // returns Promise<UnlistenFn>
}

type DownloadEvent =
  | { event: 'progress'; data: { chunkLength: number } }
  | { event: 'finished' }

export async function download(url: string, onEvent: (e: DownloadEvent) => void) {
  const channel = new Channel<DownloadEvent>()
  channel.onmessage = onEvent
  await invoke('download', { url, onEvent: channel })
}
```

- Event names are exported constants, namespaced
- Always keep and call the unlisten function on teardown
- Narrow event payloads before use; do not trust their shape blindly

### Optional: tauri-specta

tauri-specta generates TypeScript bindings from the Rust commands and removes hand-written mirror types. It is **optional**; adopt it when the command surface is large enough that drift is a real risk. If used: generate on build or in CI, commit or reproducibly regenerate the output, never hand-edit it, and fail CI when it is stale. For small surfaces, hand-written wrappers plus `mockIPC` contract tests are enough (YAGNI).

## Naming Summary

| Element | Convention | Example |
|---------|------------|---------|
| Rust command | verb-first snake_case | `export_report` |
| TS wrapper | camelCase verb | `exportReport` |
| Rust module | feature, snake_case | `commands/files.rs` |
| Event name | namespaced constant | `download://progress` |
| Capability identifier | role, kebab-case | `main-window` |
| Window label | role | `main`, `settings` |
| Error enum | `Error` per module or crate, PascalCase variants | `Error::NotFound` |

## Anti-Patterns

| Anti-pattern | Fix |
|--------------|-----|
| `Result<T, String>` everywhere | Typed `thiserror` enum with `Serialize` |
| `invoke` returning `any` | `invoke<T>` plus wrapper types |
| Business logic in a wrapper or a command | Core module (Rust) or app layer (TS) |
| Hard-coded command strings in components | One wrapper module |
| Event listeners never unregistered | Keep the unlisten handle, call it on teardown |
| Silent `catch {}` on `invoke` | Error state in the UI |
| Hand-edited generated bindings | Regenerate |
