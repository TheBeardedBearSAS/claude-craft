#!/bin/bash
# Install/update Claude Code rules for Paperclip projects
# Version: 1.0.0 - TCL (Tiered Context Loading) optimized
# Usage: ./install-paperclip-rules.sh [OPTIONS] [PROJECT_DIR]
#
# Paperclip: Open-source orchestration for zero-human companies.
# Node.js 20+ / TypeScript / React UI / Vitest / PostgreSQL.
# Docs: https://docs.paperclip.ing/  —  Repo: https://github.com/paperclipai/paperclip

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="Paperclip"
TECH_DISPLAY_NAME="Paperclip"
TECH_NAMESPACE="paperclip"
DEFAULT_STACK="Node.js 20+, TypeScript 5+, React 18+, Vitest, pnpm 9.15+, PostgreSQL"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings (source in Paperclip/rules/  ->  destination in references/paperclip/) ---
TECH_RULE_MAPPINGS=(
    "02-architecture-paperclip.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-paperclip.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-paperclip.md:security.md"
    "12-adapter-protocol.md:adapter-protocol.md"
)

TECH_RULES=(
    "02-architecture-paperclip.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-paperclip.md"
    "08-quality-tools.md"
    "11-security-paperclip.md"
    "12-adapter-protocol.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Paperclip monorepo shape (server + ui + cli + packages)
    - Built-in adapters (packages/adapters/*) and plugins (@paperclipai/plugin-sdk)
    - Node.js 20+ / TypeScript strict mode
    - Testing (Vitest, plugin test harness from @paperclipai/plugin-sdk/testing)
    - Security (Better Auth, tenancy, plugin capabilities, approval gates)

    Token reduction: ~95% (from ~80K to ~4K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit
- \`/${TECH_NAMESPACE}:generate-adapter\` - Scaffold a custom adapter (HTTP / Process / Local)
- \`/${TECH_NAMESPACE}:generate-agent-config\` - Generate an agent.yaml configuration
- \`/${TECH_NAMESPACE}:setup-company\` - Bootstrap a new Paperclip company"

ARCHITECTURE_SUMMARY="\`\`\`
Paperclip monorepo (v2026.529.0+)

server/                Node.js + TypeScript API (companies, agents, approvals, activity)
ui/                    React dashboard
cli/                   \`paperclipai\` CLI (commander.js)
packages/
├── shared/            @paperclipai/shared — cross-cutting types
├── db/                @paperclipai/db — schema + migrations
├── adapter-utils/     @paperclipai/adapter-utils
├── mcp-server/        @paperclipai/mcp-server
├── adapters/          Built-in AI runtimes: claude-local, codex-local,
│                      cursor-local, gemini-local, opencode-local,
│                      openclaw-gateway, pi-local
└── plugins/
    ├── sdk/               @paperclipai/plugin-sdk (public SDK)
    ├── create-paperclip-plugin/   scaffolder
    └── examples/          reference plugins
\`\`\`

**Invariant**: Governance (budgets, approvals, secrets, tenancy) lives in \`server/\`. Adapters and plugins never decide; they execute and report."

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | \`agent-registry.ts\` |
| Types / Interfaces | PascalCase | \`AgentConfig\`, \`HeartbeatPayload\` |
| Functions / vars | camelCase | \`reportCost\`, \`isApproved\` |
| Constants | UPPER_SNAKE | \`DEFAULT_BUDGET_TOKENS\` |
| React components | PascalCase | \`OrgChart\`, \`ApprovalCard\` |
| Env vars | UPPER_SNAKE | \`PAPERCLIP_DATABASE_URL\` |

**Always**: TypeScript strict mode, ESLint flat config, Prettier, named exports, no \`any\`."

TESTING_STACK="**Paperclip Stack**: Vitest (unit + integration) + adapter contract tests + Playwright for web UI"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Two-layer control plane + adapters
- \`${TECH_NAMESPACE}/coding-standards.md\` - TypeScript & Paperclip conventions
- \`${TECH_NAMESPACE}/testing.md\` - Vitest & adapter contract tests
- \`${TECH_NAMESPACE}/tooling.md\` - pnpm, tsx, Vite, Node 20+
- \`${TECH_NAMESPACE}/quality-tools.md\` - ESLint flat config, Prettier, tsc
- \`${TECH_NAMESPACE}/security.md\` - Secrets, approval gates, budgets, audit trails
- \`${TECH_NAMESPACE}/adapter-protocol.md\` - Heartbeat, cost reporting, approvals"

FILE_CONTEXTS="  # Paperclip TypeScript server/adapters
  \"*.ts\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      TypeScript strict mode. No \`any\`. Explicit return types.
      Adapters: implement heartbeat + cost reporting contract.

  # Paperclip React web UI
  \"*.tsx\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Functional components, typed props. Keep UI pure — no governance logic client-side.

  # Tests
  \"*.test.ts\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      Vitest. TDD: RED -> GREEN -> REFACTOR.
      Adapter tests: verify heartbeat, cost reporting, approval propagation.

  \"*.test.tsx\":
    suggest_skills:
      - testing
    auto_load: false

  \"*.spec.ts\":
    suggest_skills:
      - testing
    auto_load: false

  # Built-in adapters (AI runtimes)
  \"**/packages/adapters/**/*.ts\":
    suggest_skills:
      - security
      - solid-principles
    auto_load: false
    quick_tips: |
      Adapters export: type, label, models, agentConfigurationDoc.
      No governance logic (budget/approval/permission) inside the adapter — server owns that.

  # Plugin worker entries
  \"**/src/worker.ts\":
    suggest_skills:
      - security
      - solid-principles
    auto_load: false
    quick_tips: |
      Use definePlugin({ setup(ctx) }) from @paperclipai/plugin-sdk.
      Resolve secrets via ctx.secrets.resolve(ref). Declare minimal capabilities in the manifest.

  # Server API
  \"**/server/**/*.ts\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Validate every input. Tenancy scoped by companyId from session/path (never client body).
      Emit activity events for every mutation.

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
