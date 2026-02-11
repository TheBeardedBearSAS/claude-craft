#!/bin/bash
# Install/update Claude Code rules for Python projects
# Version: 4.0.1 - TCL (Tiered Context Loading) optimized
# Usage: ./install-python-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="Python"
TECH_DISPLAY_NAME="Python"
TECH_NAMESPACE="python"
DEFAULT_STACK="Python 3.12+, FastAPI, SQLAlchemy, pytest, ruff, mypy"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-python.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-python.md:security.md"
)

TECH_RULES=(
    "02-architecture.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-python.md"
    "08-quality-tools.md"
    "11-security-python.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Clean Architecture / Hexagonal
    - PEP 8 standards, type hints
    - Tests pytest, coverage
    - Quality (ruff, mypy, black)
    - FastAPI, Django, Flask patterns

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit"

ARCHITECTURE_SUMMARY="\`\`\`
src/
├── domain/           # Business logic (pure Python)
│   ├── entities/     # Domain entities
│   └── value_objects/# Immutable value types
├── application/      # Use cases
│   ├── commands/     # Write operations
│   └── queries/      # Read operations
├── infrastructure/   # Technical implementations
│   ├── persistence/  # Database repositories
│   └── api/          # REST endpoints
└── tests/
\`\`\`

**Dependency Rule**: infrastructure -> application -> domain (INWARD ONLY)"

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | \`UserService\` |
| Functions | snake_case | \`get_user_by_id\` |
| Constants | UPPER_SNAKE | \`MAX_RETRIES\` |
| Private | _prefix | \`_internal_method\` |

**Always**: Type hints, docstrings, ruff formatting."

TESTING_STACK="**Python Stack**: pytest + pytest-cov + pytest-asyncio + Faker + testcontainers"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Clean Architecture for Python
- \`${TECH_NAMESPACE}/coding-standards.md\` - PEP 8 & type hints
- \`${TECH_NAMESPACE}/testing.md\` - pytest patterns
- \`${TECH_NAMESPACE}/tooling.md\` - ruff, mypy, black
- \`${TECH_NAMESPACE}/quality-tools.md\` - Linters, formatters, CI/CD
- \`${TECH_NAMESPACE}/security.md\` - OWASP security guidelines"

FILE_CONTEXTS="  # Python source files
  \"*.py\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Type hints required. Use ruff for formatting.
      Follow PEP 8 naming conventions.

  # Test files
  \"test_*.py\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      TDD: RED -> GREEN -> REFACTOR
      Use pytest fixtures, coverage >= 80%

  \"*_test.py\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/tests/**\":
    suggest_skills:
      - testing
    auto_load: false

  # FastAPI/Django files
  \"**/api/**/*.py\":
    suggest_skills:
      - security
    auto_load: false

  \"**/routes/**/*.py\":
    suggest_skills:
      - security
    auto_load: false

  # Domain layer
  \"**/domain/**/*.py\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Domain: Pure Python, no framework dependencies.
      Use dataclasses or Pydantic for entities.

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
