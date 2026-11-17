# Check Tauri v2 Testing

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans both the Rust core and the web frontend, or requires cross-cutting investigation.

## MISSION

Audit the test strategy of a Tauri v2 application. A Tauri app has three test surfaces: the Rust core (unit tests plus the `tauri::test` mock runtime, no GUI needed), the frontend (Vitest with `mockIPC` from `@tauri-apps/api/mocks`, no Tauri needed) and the assembled app (WebDriver end-to-end). TDD (Red, Green, Refactor) and 80% minimum coverage apply, with the pyramid 70% unit / 20% integration / 10% E2E. Component-level frontend testing is audited with the React / Vue / Svelte / Vite stack in use.

All commands run in Docker (`docker compose exec app ...`). End-to-end runs need the platform WebView and a display (a virtual display on headless Linux); keep them out of the fast gate.

### Step 1: Run the Suites

```bash
docker compose exec app sh -c 'cd src-tauri && cargo test --all-features'
docker compose exec app sh -c 'cd src-tauri && cargo nextest run --all-features'
docker compose exec app npx vitest run
```

Record: number of tests per suite, failures, flaky tests, duration. A failing suite caps the axis at 50%.

### Step 2: Code Coverage (5 points)

```bash
docker compose exec app sh -c 'cd src-tauri && cargo llvm-cov nextest --summary-only'
docker compose exec app npx vitest run --coverage
docker compose exec app grep -nE "fail-under|thresholds|coverage" .github/workflows/*.yml vitest.config.ts package.json
```

Checklist:
- [ ] Rust coverage >= 80% on the core logic (cargo-llvm-cov); `main.rs` and generated glue are excluded
- [ ] Frontend coverage >= 80% lines and branches, with thresholds enforced in `vitest.config.ts`
- [ ] Coverage is enforced in CI (`--fail-under-lines 80` for Rust) and not only reported
- [ ] Mutation testing (Stryker for the TypeScript side, `cargo-mutants` for Rust) considered for critical logic; coverage alone is not proof of quality

**Scoring**: 5 pts (3 Rust coverage, 2 frontend coverage), pro rata against the 80% target.

### Step 3: Rust Core Tests (6 points)

```bash
docker compose exec app grep -rnE "#\[cfg\(test\)\]|#\[test\]|#\[tokio::test\]" src-tauri/src src-tauri/tests
docker compose exec app grep -rnE "tauri::test|mock_builder|mock_context|noop_assets|mock_app" src-tauri
docker compose exec app grep -nE "features.*test|\[dev-dependencies\]" -A6 src-tauri/Cargo.toml
```

Checklist:
- [ ] Core logic (plain Rust modules with no `tauri` dependency) has fast unit tests: valid and invalid inputs, boundaries, each error variant
- [ ] Commands are tested through the mock runtime from the `tauri::test` module (feature `test`): `mock_builder()` with `mock_context(noop_assets())` or `mock_app()`, registering the command with `generate_handler!` and managed state, without opening a window
- [ ] Commands taking `State<'_, T>` are tested with the state managed on the mock app, including contention-free assertions on `Mutex` state
- [ ] Error mapping is tested: each error variant serializes to the documented shape
- [ ] Filesystem-touching code is tested against temporary directories (never the real user directories); time and randomness are injected
- [ ] Capability and permission regressions are guarded: a test or CI step fails when `capabilities/*.json` grants an unexpected permission (for example a snapshot of the permission list)
- [ ] Bug fixes come with a test that failed before the fix

**Scoring**: 6 pts (2 core unit tests, 2 mock-runtime command tests, 1 error mapping, 1 capability regression guard).

### Step 4: Frontend IPC Tests (5 points)

```bash
docker compose exec app grep -rnE "mockIPC|clearMocks|mockWindows|shouldMockEvents" src tests
docker compose exec app grep -rnE "@tauri-apps/api/mocks" src tests
docker compose exec app grep -rnE "afterEach|beforeEach" -A3 src tests
docker compose exec app grep -nE "environment|setupFiles" vitest.config.ts
```

Checklist:
- [ ] IPC wrappers and logic that calls `invoke` are tested with `mockIPC((cmd, args) => ...)` from `@tauri-apps/api/mocks`, covering success and rejection for each command
- [ ] `clearMocks()` runs in `afterEach` so mocks never leak between tests
- [ ] Event-driven code is tested with `mockIPC(handler, { shouldMockEvents: true })` to exercise `emit` / `listen`
- [ ] The mock handler asserts command names and argument shapes (camelCase keys as sent over IPC), so a Rust-side rename is caught by a test failure
- [ ] UI components that need no Tauri are tested without any mock, through the wrapper layer
- [ ] Vitest uses a DOM environment (jsdom or Browser Mode) appropriate to the UI framework; no real network calls

**Scoring**: 5 pts (2 command wrappers, 1 isolation via `clearMocks`, 1 events, 1 contract assertions).

### Step 5: End-to-End Tests (5 points)

```bash
docker compose exec app grep -rnE "wdio|tauri-driver|@wdio/tauri-service|tauri-plugin-wdio" package.json src-tauri/Cargo.toml
docker compose exec app ls wdio.conf.ts wdio.conf.js e2e tests/e2e
docker compose exec app grep -rnE "tauri build --debug --no-bundle|xvfb" .github/workflows package.json
```

Checklist:
- [ ] Critical user journeys (first run, main workflow, update prompt, permission-gated action) have E2E tests driving the real built app through WebDriver
- [ ] Recommended setup: WebdriverIO with `@wdio/tauri-service` (Windows, Linux, macOS); the default `embedded` provider relies on the `tauri-plugin-wdio-webdriver` plugin and is the only option on macOS; `tauri-plugin-wdio` adds `browser.tauri.execute()`, IPC mocking and log capture. `tauri-driver` (Windows and Linux only, with Selenium or WebdriverIO) is an accepted alternative
- [ ] The E2E plugins are compiled into debug/test builds only, never into release builds
- [ ] The app under test is built with `tauri build --debug --no-bundle`; tests do not depend on a developer's installed copy
- [ ] The service's browser mode (frontend in Chrome against the dev server with `invoke()` intercepted) is used for fast UI-flow checks where full E2E is not needed
- [ ] E2E tests use stable selectors (test ids, roles), isolated app data directories and no fixed sleeps
- [ ] E2E runs per target OS in CI (matrix) before release; the suite is 10% of the pyramid, not more

**Scoring**: 5 pts (2 critical journeys, 1 setup and debug-only plugins, 1 CI matrix, 1 stability practices). No Tauri-specific E2E at all = max 1/5 here.

### Step 6: Isolation, Speed and CI (4 points)

```bash
docker compose exec app grep -rnE "#\[ignore" src-tauri
docker compose exec app grep -rnE "\.(skip|only)\(|it\.todo|xit\(" src tests
docker compose exec app grep -rnE "sleep\(|setTimeout\(" src-tauri/src src tests
docker compose exec app grep -nE "cargo (nextest|test)|vitest|wdio" .github/workflows/*.yml
```

Checklist:
- [ ] Each test creates its own data (factories, temporary directories); no shared mutable state, no order dependence
- [ ] No sleeps for synchronization (use fake timers, awaited events, or explicit waits on conditions)
- [ ] No `#[ignore]`, `.skip` or `.only` without a ticket reference
- [ ] The fast gate (Rust unit + mock-runtime tests, Vitest) runs on every PR in under a few minutes; E2E runs separately on a schedule or before release
- [ ] Tests never touch real user directories, the OS keychain or production endpoints

**Scoring**: 4 pts (1 isolation, 1 determinism, 1 skip hygiene, 1 CI structure).

## OUTPUT FORMAT

```
TAURI v2 TESTING AUDIT
======================

SCORE: XX/25

Rust tests: N (coverage XX%)   Frontend tests: N (coverage XX%)   E2E tests: N (framework: wdio/tauri-driver/none)

SUB-SCORES:
  Coverage                      : XX/5
  Rust core tests               : XX/6
  Frontend IPC tests            : XX/5
  End-to-end tests              : XX/5
  Isolation, speed, CI          : XX/4

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

- Test behavior (what the user or the frontend observes), not implementation details; avoid over-mocking
- Do not ask for E2E coverage of every screen: the pyramid keeps E2E at about 10%
- Component-testing practice belongs to the React / Vue / Svelte / Vite audits; general Rust testing (nextest, proptest, llvm-cov) to the `rust` stack
- Never run E2E suites against a production data directory or a signed release build
