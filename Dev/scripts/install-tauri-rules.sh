#!/bin/bash
# Install/update Claude Code rules for Tauri v2 projects
# Version: 1.0.0 - TCL (Tiered Context Loading) optimized
# Usage: ./install-tauri-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="Tauri"
TECH_DISPLAY_NAME="Tauri"
TECH_NAMESPACE="tauri"
DEFAULT_STACK="Tauri 2.12 (Rust core, MSRV 1.90), @tauri-apps/api 2.12, Vite frontend (framework-agnostic), desktop + iOS/Android"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture-tauri.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-tauri.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-tauri.md:security.md"
)

TECH_RULES=(
    "02-architecture-tauri.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-tauri.md"
    "08-quality-tools.md"
    "11-security-tauri.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation for Tauri v2 desktop and mobile apps:
    - Rust core in src-tauri/ (commands, state, plugins, events, channels)
    - Capabilities and permissions (least privilege, scopes), CSP, Isolation pattern
    - Signed updater, desktop bundling, iOS/Android targets
    - Tests: tauri::test mock runtime, mockIPC (Vitest), WebdriverIO E2E

    Frontend-agnostic: UI code follows the React/Vue/Svelte/Vite stacks;
    general Rust conventions follow the rust stack.

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check <architecture|code-quality|security|testing|all>\` - Audit by axis (all = scored aggregate)"

ARCHITECTURE_SUMMARY="\`\`\`
src/                      # Web frontend (any framework, bundled by Vite)
└── lib/tauri.ts          # Typed invoke() wrappers
src-tauri/
├── Cargo.toml
├── build.rs              # tauri-build
├── tauri.conf.json       # App, build, bundle, security (CSP, capabilities)
├── capabilities/         # *.json: permissions per window (least privilege)
└── src/
    ├── main.rs           # Desktop entry: calls app_lib::run()
    ├── lib.rs            # run() + #[cfg_attr(mobile, tauri::mobile_entry_point)]
    ├── commands/         # #[tauri::command] grouped by feature
    ├── state.rs          # app.manage(...) types
    └── error.rs          # thiserror enum + impl Serialize
\`\`\`

**Rule**: the frontend never gets more permissions than its capability grants."

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Command | \`#[tauri::command]\`, snake_case, registered in \`generate_handler!\` | \`get_settings\` |
| Async + borrowed args | Must return \`Result<T, E>\` | \`async fn f(state: State<'_, AppState>) -> Result<T, Error>\` |
| Command error | \`thiserror\` enum + \`impl serde::Serialize\` | \`Error::Io(#[from] std::io::Error)\` |
| Capability | One file per window/role in \`src-tauri/capabilities/\` | \`main-capability.json\` |
| Frontend calls | Typed wrapper over \`invoke()\` from \`@tauri-apps/api/core\` | \`getSettings(): Promise<Settings>\` |

**Always**: deny by default, scoped permissions, no secrets in the frontend bundle."

TESTING_STACK="**Tauri Stack**: cargo test + tauri::test (MockRuntime), Vitest + @tauri-apps/api/mocks (mockIPC), WebdriverIO + @wdio/tauri-service (E2E)"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - src/ + src-tauri/ layout, commands, state, plugins
- \`${TECH_NAMESPACE}/coding-standards.md\` - Rust command and TypeScript IPC conventions
- \`${TECH_NAMESPACE}/testing.md\` - Mock runtime, mockIPC, WebDriver E2E
- \`${TECH_NAMESPACE}/tooling.md\` - Tauri CLI, mobile targets, CI
- \`${TECH_NAMESPACE}/quality-tools.md\` - Clippy, rustfmt, cargo-deny, tsc, ESLint/Biome
- \`${TECH_NAMESPACE}/security.md\` - Capabilities, CSP, Isolation, signed updates"

FILE_CONTEXTS="  # Tauri config
  \"src-tauri/tauri.conf.json\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Keep app.security.csp strict; reference capabilities by identifier.
      Updater pubkey goes here; the private key never enters the repo.

  # Capabilities
  \"src-tauri/capabilities/*.json\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      One capability per window or role; grant the narrowest permissions.
      Scope fs/http/shell permissions with allow lists; deny wins over allow.

  # Rust commands
  \"src-tauri/src/**/*.rs\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Commands validate every argument: the webview is untrusted input.
      Async commands with borrowed args (State<'_, T>) must return Result.

  # Frontend IPC wrappers
  \"src/**/*.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Wrap invoke() in typed functions; never scatter raw command names.

  # Test files
  \"*.test.ts\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      Use mockIPC from @tauri-apps/api/mocks and clearMocks() in afterEach.

  \"src-tauri/tests/**\":
    suggest_skills:
      - testing
    auto_load: false

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
