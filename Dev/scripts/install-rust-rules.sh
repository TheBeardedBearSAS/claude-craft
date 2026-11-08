#!/bin/bash
# Install/update Claude Code rules for Rust / Axum projects
# Version: 1.0.0 - TCL (Tiered Context Loading) optimized
# Usage: ./install-rust-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="Rust"
TECH_DISPLAY_NAME="Rust / Axum"
TECH_NAMESPACE="rust"
DEFAULT_STACK="Rust 1.99 (edition 2024), Axum 0.8, Tokio, Tower, SQLx, cargo-nextest, Clippy, cargo-deny"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture-rust.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-rust.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-rust.md:security.md"
)

TECH_RULES=(
    "02-architecture-rust.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-rust.md"
    "08-quality-tools.md"
    "11-security-rust.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Cargo workspace, layered/hexagonal crates (domain free of axum/sqlx)
    - Rust 1.99 (edition 2024), Axum 0.8 (Router, State, extractors, Tower middleware)
    - Errors with thiserror + IntoResponse (RFC 9457), tracing, graceful shutdown
    - SQLx compile-time checked queries, cargo-nextest, cargo-llvm-cov
    - Quality (Clippy -D warnings, rustfmt, cargo-deny, cargo-audit)

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check <architecture|code-quality|security|testing|all>\` - Audit by axis (all = scored aggregate)"

ARCHITECTURE_SUMMARY="\`\`\`
crates/
├── domain/          # Entities, value objects, ports (no axum/sqlx)
├── application/     # Use cases depending on domain ports
├── infrastructure/  # SQLx repositories, external adapters
└── api/             # Axum Router, handlers, extractors, AppError
tests/               # Integration tests (tower::ServiceExt::oneshot)
\`\`\`

**Rule**: dependencies point inward; handlers stay thin and delegate to use cases."

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Types/Traits | UpperCamelCase | \`UserRepository\` |
| Functions/variables | snake_case | \`find_active_users\` |
| Constants | SCREAMING_SNAKE | \`MAX_RETRIES\` |
| Conversions | as_/to_/into_ | \`into_response\` |

**Standards**: Rust API Guidelines, rustfmt, Clippy \`-D warnings\`, no \`unwrap()\` on request paths."

TESTING_STACK="**Rust Stack**: cargo-nextest + #[tokio::test] + #[sqlx::test] + tower::ServiceExt + cargo-llvm-cov"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Workspace crates, Axum Router/State, layering
- \`${TECH_NAMESPACE}/coding-standards.md\` - Rust API Guidelines, rustfmt, Clippy
- \`${TECH_NAMESPACE}/testing.md\` - Unit, integration and SQLx tests
- \`${TECH_NAMESPACE}/tooling.md\` - rustup, Cargo, sqlx-cli, Docker builds
- \`${TECH_NAMESPACE}/quality-tools.md\` - Clippy, cargo-deny, cargo-audit
- \`${TECH_NAMESPACE}/security.md\` - OWASP, Axum/SQLx security"

FILE_CONTEXTS="  # Rust source files
  \"*.rs\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Run cargo fmt and cargo clippy -- -D warnings.
      Propagate errors with ?; no unwrap() on request paths.

  # Integration tests
  \"**/tests/**/*.rs\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      TDD: RED -> GREEN -> REFACTOR
      Use tower::ServiceExt::oneshot, coverage >= 80%

  # HTTP layer
  \"**/handlers/**/*.rs\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Keep handlers thin, validate extracted input.

  # Database access
  \"**/repositories/**/*.rs\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Use sqlx::query!/query_as! bind parameters; never format SQL.

  # Migrations
  \"**/migrations/**/*.sql\":
    suggest_skills:
      - security
    auto_load: false

  # Manifests
  \"Cargo.toml\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Check new dependencies with cargo deny check.

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
