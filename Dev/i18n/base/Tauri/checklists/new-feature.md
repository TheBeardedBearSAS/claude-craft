# New Feature Development Checklist - Tauri v2

## Before Starting

- [ ] Feature discussed and validated with the team
- [ ] Acceptance criteria written (Given/When/Then)
- [ ] Assumptions stated explicitly (inputs, invariants, target platforms, offline behavior, volume, latency budget)
- [ ] Target platforms decided: desktop only, or also Android / iOS (mobile changes capability `platforms`, plugins and UI)
- [ ] OS access needed identified (files, network, shell, notifications, ...) and the minimal permissions and scopes listed up front
- [ ] IPC contract defined: command names, argument and return types, error cases, events, channels for streaming
- [ ] Impact analysis done: windows touched, capabilities changed, breaking changes for existing installs (stored data, settings), rollback plan
- [ ] Feature flag decided for risky changes

## Development (TDD: Red, Green, Refactor)

### Design (core first)

- [ ] Start from plain Rust logic with no `tauri` dependency: types, invariants and errors before the command
- [ ] One command = one adapter over one function; no business rules inside the command body
- [ ] No speculative plugins, windows, events, options or generics (YAGNI)
- [ ] Cross-platform differences isolated behind `#[cfg(desktop)]` / `#[cfg(mobile)]` or a small trait only when two implementations exist

### Rust Core

- [ ] Error type is a `thiserror` enum implementing `serde::Serialize` with a message safe to show to the user
- [ ] Command registered once in `tauri::generate_handler![...]`, grouped in its feature module
- [ ] Async command with borrowed arguments or `State<'_, T>` returns `Result`
- [ ] Shared state registered with `app.manage(...)`, wrapped in `Mutex` / `RwLock`; no guard held across `.await` unless the mutex is async-aware
- [ ] Blocking or CPU-heavy work moved off the main thread (async command, `spawn_blocking`)
- [ ] Long operations report progress through a `Channel<T>`; notifications use `emit`
- [ ] Arguments validated in Rust: lengths, ranges, enums, path containment
- [ ] No `unwrap()` / `expect()` / `panic!` in the new paths

### Capabilities and Security

- [ ] Permission needed by the frontend added to the capability of the window that needs it, and nowhere else
- [ ] Scopes written as narrow `allow` entries; sensitive locations added to `deny`
- [ ] App-specific commands guarded with app permissions where the capability model must restrict them
- [ ] CSP still passes with the new resources (no `unsafe-eval`, no wildcard origins added)
- [ ] Desktop-only permissions restricted with `platforms` when mobile is built too
- [ ] Secrets never stored in the bundle, config or `localStorage`

### Frontend

- [ ] Typed wrapper added to the IPC module (explicit parameter and return types); components call the wrapper, not `invoke`
- [ ] Rejected promises handled: error state shown to the user, not `console.log`
- [ ] Event listeners and channels cleaned up on teardown
- [ ] Loading, empty and error states handled; UI-framework specifics follow the React / Vue / Svelte / Vite stack
- [ ] If tauri-specta is in use, bindings regenerated and committed

### Code Quality

- [ ] `cargo fmt`, `cargo clippy -D warnings`, `tsc --noEmit` and lint pass
- [ ] Naming explicit (RFC 430 on Rust, verb-first command names); comments explain WHY
- [ ] Logging through the project logger with no sensitive data

## Testing

- [ ] Core unit tests: valid and invalid input, boundaries, each error variant
- [ ] Command test on the `tauri::test` mock runtime (`mock_builder()` / `mock_app()`) with managed state
- [ ] Error serialization tested against the shape the frontend expects
- [ ] Wrapper tests with `mockIPC`, `clearMocks()` in `afterEach`; events with `shouldMockEvents: true`
- [ ] E2E scenario added (WebdriverIO / `tauri-driver`) only when the feature is a critical journey
- [ ] Capability regression test or snapshot updated
- [ ] Coverage stays >= 80%; temporary directories for file tests; time injected

## Documentation

- [ ] README or docs updated (new permissions, commands, platform notes)
- [ ] `///` docs on the command: arguments, errors, required permission
- [ ] ADR written for significant decisions (new plugin, new window, Isolation pattern change)
- [ ] CHANGELOG entry added

## Before Merge

- [ ] `./scripts/ci.sh` passes locally and in CI
- [ ] Capability and `tauri.conf.json` diff explicitly reviewed
- [ ] Self-review of the diff completed
- [ ] PR description explains the why, links the ticket, lists risks and rollback
- [ ] Reviewer approval received; squash merge with Conventional Commit title

## Release and Deployment

- [ ] Versions aligned in `tauri.conf.json`, `Cargo.toml` and `package.json`
- [ ] Release built by CI with `tauri-apps/tauri-action`; signing secrets come from the CI secret store
- [ ] If the updater is used, update artifacts are signed and the endpoint serves the new version metadata
- [ ] Smoke test of the signed build on each target OS (install, launch, main flow, update path)
- [ ] Stored-data migration tested from the previous release
