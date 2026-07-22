#!/bin/bash
# Install/update Claude Code rules for Vite projects
# Version: 1.0.0 - TCL (Tiered Context Loading) optimized
# Usage: ./install-vite-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="Vite"
TECH_DISPLAY_NAME="Vite"
TECH_NAMESPACE="vite"
DEFAULT_STACK="Vite 8.x, TypeScript 5+ (vanilla/library/multi-page/Workers-WASM)"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture-vite.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-vite.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-vite.md:security.md"
)

TECH_RULES=(
    "02-architecture-vite.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-vite.md"
    "08-quality-tools.md"
    "11-security-vite.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering framework-agnostic Vite usage:
    - Vanilla JS/TS applications (src/main.ts entry)
    - Library authoring (build.lib + vite-plugin-dts)
    - Multi-page apps (rollupOptions.input)
    - Workers / WASM entry points
    - Vitest for testing

    NOT covered: React/Vue/Angular/Svelte's own Vite dev-server config.
    Those stacks document their own Vite integration in their tooling.md
    (see \`/react:*\`, \`/vuejs:*\`, \`/angular:*\` references) — install
    this stack only for framework-agnostic Vite projects.

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit
- \`/${TECH_NAMESPACE}:check-library-build\` - Validate build.lib / vite-plugin-dts output
- \`/${TECH_NAMESPACE}:scaffold-project\` - Wrap \`npm create vite@latest -- --template vanilla-ts|lit-ts\`"

ARCHITECTURE_SUMMARY="\`\`\`
# 4 project shapes supported by this stack

# 1. Vanilla app
src/
├── main.ts           # Entry point
└── style.css

# 2. Library (build.lib)
src/
└── index.ts           # Public API surface
vite.config.ts          # build.lib + vite-plugin-dts

# 3. Multi-page app
pages/
├── index.html
└── admin.html
vite.config.ts          # rollupOptions.input per page

# 4. Workers / WASM
src/
├── main.ts
├── *.worker.ts         # new Worker(new URL(...), { type: 'module' })
└── *.wasm
\`\`\`

**Framework-agnostic only**: no React/Vue/Angular/Svelte component conventions here."

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Entry point | \`src/main.ts\` (app) / \`src/index.ts\` (library) | \`main.ts\` |
| Custom plugins | \`vite-plugin-*\` prefix | \`vite-plugin-my-transform.ts\` |
| Config file | \`vite.config.ts\`, typed via \`defineConfig\` | \`defineConfig({ ... })\` |
| Multi-page entries | \`rollupOptions.input\` keyed by page name | \`{ admin: 'pages/admin.html' }\` |
| Worker entries | \`new URL('./x.worker.ts', import.meta.url)\` | \`type: 'module'\` |
| Library exports | \`build.lib.entry\` + \`vite-plugin-dts\` for \`.d.ts\` | \`entry: 'src/index.ts'\` |

**Always**: TypeScript strict mode, \`index.html\` treated as a source file (never as a static/public asset)."

TESTING_STACK="**Vite Stack (framework-agnostic)**: Vitest"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Project shapes (vanilla, library, multi-page, Workers/WASM)
- \`${TECH_NAMESPACE}/coding-standards.md\` - vite.config.ts & plugin conventions
- \`${TECH_NAMESPACE}/testing.md\` - Vitest patterns
- \`${TECH_NAMESPACE}/tooling.md\` - CLI, dev server, build pipeline
- \`${TECH_NAMESPACE}/quality-tools.md\` - Code quality tools
- \`${TECH_NAMESPACE}/security.md\` - Vite security best practices"

FILE_CONTEXTS="  # Vite config
  \"vite.config.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Use build.lib for npm packages, rollupOptions.input for multi-page apps.
      index.html is a source file, not a public asset.
      Not for React/Vue/Angular/Svelte dev-server config — see that stack's tooling.md.

  \"vite.config.js\":
    suggest_skills:
      - solid-principles
    auto_load: false

  # Vanilla app entry
  \"src/main.ts\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Application entry point for vanilla JS/TS apps.
      Keep bootstrapping minimal, extract logic into modules.

  # Library entry
  \"src/index.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Public API surface for library mode (build.lib).
      Pair with vite-plugin-dts to emit .d.ts declarations.

  # Workers
  \"*.worker.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Instantiate via new Worker(new URL('./x.worker.ts', import.meta.url), { type: 'module' }).
      Keep worker payloads serializable (structured clone).

  # WASM entries
  \"*.wasm\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Import via ?init or ?url depending on instantiation need.
      Prefer async instantiation to avoid blocking the main thread.

  # Test files
  \"*.spec.ts\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      Use Vitest for framework-agnostic unit tests.
      Test module behavior, not build configuration.

  \"*.test.ts\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/tests/**\":
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
