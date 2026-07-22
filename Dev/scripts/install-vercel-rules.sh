#!/bin/bash
# Install/update Claude Code rules for Vercel projects
# Version: 1.0.0 - TCL (Tiered Context Loading) optimized
# Usage: ./install-vercel-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="Vercel"
TECH_DISPLAY_NAME="Vercel"
TECH_NAMESPACE="vercel"
DEFAULT_STACK="Vercel Platform (framework-agnostic): vercel.json, Functions, ISR, Cron, Storage"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture-vercel.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-vercel.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-vercel.md:security.md"
)

TECH_RULES=(
    "02-architecture-vercel.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-vercel.md"
    "08-quality-tools.md"
    "11-security-vercel.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering framework-agnostic Vercel platform usage:
    - vercel.json configuration
    - Serverless Functions (Node.js runtime / Fluid Compute)
    - ISR (stale-while-revalidate cache)
    - Cron Jobs
    - Storage (Blob native; Postgres/KV via Marketplace — Neon/Upstash)
    - Analytics / Speed Insights
    - Env vars / Preview Deployments

    NOT covered: Next.js itself (see \`/react:*\`, \`/vuejs:*\`, \`/angular:*\`
    for framework-specific patterns) — this stack only documents Vercel's
    own platform primitives, never a framework's routing/rendering.

    Edge Runtime (\`export const runtime = 'edge'\`) is documented as
    DEPRECATED by Vercel — this stack flags it for migration to Fluid
    Compute, not as a recommended pattern.

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - vercel.json / Functions / ISR / Cron architecture review
- \`/${TECH_NAMESPACE}:check-code-quality\` - Function code quality (runtime config, handler signatures)
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage for Functions/middleware logic
- \`/${TECH_NAMESPACE}:check-security\` - Env var handling, header/CORS config, secrets audit
- \`/${TECH_NAMESPACE}:deploy-config\` - Detect project shape and generate/validate a vercel.json"

ARCHITECTURE_SUMMARY="\`\`\`
# Framework-agnostic Vercel platform shapes

# 1. Static/SPA + rewrites
vercel.json          # rewrites for client-side routing fallback

# 2. Serverless Functions (Node.js / Fluid Compute)
api/
└── hello.ts          # export default handler (Node.js runtime, default)

# 3. ISR-enabled pages (any framework with Vercel adapter support)
vercel.json           # cache primitives surfaced through Vercel's edge cache

# 4. Cron + scheduled Functions
vercel.json           # \"crons\": [{ \"path\": \"/api/cron/daily\", \"schedule\": \"0 6 * * *\" }]
api/cron/
└── daily.ts
\`\`\`

**Framework-agnostic only**: no Next.js routing/rendering conventions here."

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Function entry point | \`api/*.ts\`, default export handler | \`export default function handler(req, res) {}\` |
| Middleware entry point | \`middleware.ts\` at project root | \`export function middleware(req) {}\` |
| Config schema key | \`vercel.json\` top-level keys (\`functions\`, \`crons\`, \`rewrites\`) | \`{ \"functions\": { ... } }\` |
| Env var naming | \`VERCEL_*\` reserved system vars vs user-defined | \`VERCEL_URL\` (system) vs \`DATABASE_URL\` (user) |
| Runtime declaration | Default Node.js/Fluid Compute; \`export const config = { runtime: 'edge' }\` = legacy migration flag only | \`export const config = { runtime: 'edge' } // TODO: migrate\` |

**Always**: validate env vars at the top of handlers, never trust client-supplied headers for auth."

TESTING_STACK="**Vercel Stack (framework-agnostic)**: Vitest for Function handler unit tests + \`vercel dev\` for local integration smoke tests"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Project shapes (static/SPA, Functions, ISR, Cron)
- \`${TECH_NAMESPACE}/coding-standards.md\` - vercel.json & handler conventions
- \`${TECH_NAMESPACE}/testing.md\` - Vitest + vercel dev patterns
- \`${TECH_NAMESPACE}/tooling.md\` - CLI, Preview Deployments, env vars
- \`${TECH_NAMESPACE}/quality-tools.md\` - Code quality tools
- \`${TECH_NAMESPACE}/security.md\` - Vercel security best practices"

FILE_CONTEXTS="  # Vercel config
  \"vercel.json\":
    suggest_skills:
      - solid-principles
      - security
    auto_load: false
    quick_tips: |
      Validate against schema openapi.vercel.sh/vercel.json.
      The \"functions\" block sets runtime/memory/maxDuration per glob —
      don't duplicate config already expressed by the framework's own build output.
      \"crons\" schedules are UTC only, Hobby plan caps at 1/day.

  # Serverless Functions
  \"api/**/*.ts\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
      - testing
    auto_load: false
    quick_tips: |
      Default runtime is Node.js (Fluid Compute).
      Only declare export const config = { runtime: 'edge' } when migrating
      LEGACY code — new code stays on Node.js/Fluid Compute default.
      Handlers must be idempotent-safe for retries.
      Validate env vars at top of handler; never trust client-supplied headers for auth.

  \"api/**/*.js\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
      - testing
    auto_load: false
    quick_tips: |
      Default runtime is Node.js (Fluid Compute).
      Only declare export const config = { runtime: 'edge' } when migrating
      LEGACY code — new code stays on Node.js/Fluid Compute default.
      Handlers must be idempotent-safe for retries.
      Validate env vars at top of handler; never trust client-supplied headers for auth.

  # Middleware
  \"middleware.ts\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Runs on every matched request before Functions — keep it cheap (no DB calls).
      Use matcher config to scope it, avoid a global catch-all matcher.

  # Cron Functions
  \"api/cron/**/*.ts\":
    suggest_skills:
      - solid-principles
      - testing
    auto_load: false
    quick_tips: |
      Must read the schedule from vercel.json \"crons\", not hardcode timing in code.
      Protect the endpoint (verify a bearer/CRON_SECRET-style header, don't rely on path obscurity).

  # Test files
  \"*.test.ts\":
    suggest_skills:
      - testing
    auto_load: false

  \"*.spec.ts\":
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
