# Tauri v2 Tooling

> Scope: Tauri v2, stable line 2.12 (`tauri-cli` / `@tauri-apps/cli` 2.12.x). Tauri 3 (alpha) is out of scope. Frontend bundler details (Vite config, plugins) live in the Vite / React / Vue / Svelte stacks.

## Version Alignment

| Component | Reference line |
|-----------|----------------|
| `tauri` crate | 2.12.x |
| `tauri-build` | 2.7.x (build-dependency) |
| `tauri-cli` (cargo) / `@tauri-apps/cli` (npm) | 2.12.x |
| `@tauri-apps/api` | 2.12.x |
| Official plugins (`tauri-plugin-*` and `@tauri-apps/plugin-*`) | Latest 2.x of each; versions are independent of the core |
| Rust (MSRV of Tauri 2.12) | 1.90 |
| CI action | `tauri-apps/tauri-action` v1 |

Keep the Rust crate and the npm package of the same component on the same minor line; mismatches between `@tauri-apps/api` and the `tauri` crate produce IPC or permission errors. Exact versions are pinned in lockfiles (`Cargo.lock`, JS lockfile), and `rust-toolchain.toml` pins the Rust channel.

## Creating a Project

```bash
npm create tauri-app@latest
```

The scaffolder asks for the project name, identifier, frontend language and framework template and generates `src/`, `src-tauri/` and the `tauri` npm script. Review the generated `capabilities/`, `tauri.conf.json` and plugin list immediately, and trim whatever the app does not use.

Adding Tauri to an existing frontend: install `@tauri-apps/cli`, run `tauri init`, then set `build.frontendDist`, `build.devUrl`, `build.beforeDevCommand` and `build.beforeBuildCommand` to match the frontend toolchain.

## CLI Subcommands

Run through the package manager (`npm run tauri <cmd>`) or `cargo tauri <cmd>` when `tauri-cli` is installed with cargo.

| Command | Purpose |
|---------|---------|
| `tauri dev` | Run the app with the frontend dev server (hot reload) and the Rust core rebuilt on change |
| `tauri build` | Production build and bundles; `--debug` for a debug build, `--no-bundle` to skip packaging |
| `tauri add <plugin>` | Add an official plugin: crate, npm package, registration |
| `tauri permission` | Inspect and manage permissions (list available, create app permissions) |
| `tauri capability` | Manage capability files |
| `tauri signer generate` | Generate the updater signing keypair (`-w <path>` to write the private key) |
| `tauri icon` | Generate the icon set from one source image |
| `tauri android init\|dev\|build` | Android project and builds |
| `tauri ios init\|dev\|build` | iOS project and builds (needs macOS and Xcode) |
| `tauri info` | Print environment and version info (include it in bug reports) |

Run `tauri <cmd> --help` for the flags available in the installed version.

## Frontend Integration (Vite and Others)

- The CLI starts the frontend through `build.beforeDevCommand` and loads `build.devUrl`; production loads the static `build.frontendDist`
- With Vite, bind the dev server so the WebView (and a mobile device) can reach it, and keep `clearScreen` off if you want to see Rust errors; see the Vite stack for `server` options
- The frontend must build to static files: no server-side rendering at runtime. Frameworks with an SSR mode are used in their static/SPA output mode
- Env variables prefixed for the client bundle (for example Vite's `VITE_*`) are **public**: never put secrets there
- Do not import Node-only modules in the frontend; OS access goes through commands and plugins

## Mobile

```bash
npm run tauri android init
npm run tauri android dev
npm run tauri ios init
npm run tauri ios dev
```

- Prerequisites: Android Studio + SDK/NDK and the Rust Android targets for Android; macOS, Xcode and the Rust iOS targets for iOS
- `run()` carries `#[cfg_attr(mobile, tauri::mobile_entry_point)]`; the library crate type in `[lib]` must support mobile
- iOS distribution needs the Apple Developer Program, a bundle identifier, a certificate and a provisioning profile
- Gate desktop-only plugins with `#[cfg(desktop)]` and restrict capabilities with `platforms`

## Docker and Local Environment

Per project policy, tooling runs in Docker: `cargo`, `npm`, `tsc`, lint and the headless tests run in the `app` container. The container needs the Linux WebView build dependencies to compile the app; running the GUI (`tauri dev`) and mobile emulators happens on the host or a CI runner with a display. Do not mix host and container `node_modules` or `target/` directories.

## CI/CD with tauri-action

```yaml
# .github/workflows/release.yml
name: release
on:
  push:
    tags: ['v*']
jobs:
  release:
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: ubuntu-22.04
          - platform: windows-latest
          - platform: macos-latest
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - uses: dtolnay/rust-toolchain@stable
      - run: npm ci
      - uses: tauri-apps/tauri-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: 'App ${{ github.ref_name }}'
          releaseDraft: true
```

Notes:
- Build per OS in a matrix: Tauri does not cross-compile desktop bundles reliably
- Linux runners need the WebView/GTK system packages installed before the build (see the Tauri prerequisites for the distribution used)
- Signing secrets come from the CI secret store only; pin third-party actions to a version or commit SHA per the supply-chain policy
- Draft releases let you smoke-test the signed artifacts before publishing
- Quality gates (fmt, clippy, tests, tsc, lint, audit) run on every PR in a separate workflow; see `08-quality-tools.md`

## Updater and Signing Keys

```bash
npm run tauri signer generate -- -w ~/.tauri/myapp.key
```

- The updater requires signed artifacts and **signature verification cannot be disabled**
- The public key goes into `tauri.conf.json`; the private key stays out of the repository (CI secret + secure backup). Losing it means installed apps can no longer be updated
- Update artifacts are produced at build time when the bundle config enables them; endpoints are HTTPS

## Build for E2E

```bash
npm run tauri build -- --debug --no-bundle
```

Produces the debug binary used by WebDriver E2E tests without packaging (see `07-testing-tauri.md`).
