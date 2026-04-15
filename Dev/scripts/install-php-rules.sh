#!/bin/bash
# Install/update Claude Code rules for PHP projects
# Version: 4.0.1 - TCL (Tiered Context Loading) optimized
# Usage: ./install-php-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="PHP"
TECH_DISPLAY_NAME="PHP"
TECH_NAMESPACE="php"
DEFAULT_STACK="PHP 8.5, Composer, PSR Standards, Pest 4, PHPUnit 12"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture-php.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-php.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-php.md:security.md"
)

TECH_RULES=(
    "02-architecture-php.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-php.md"
    "08-quality-tools.md"
    "11-security-php.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Clean Architecture / Hexagonal
    - PSR-1, PSR-4, PSR-12 standards
    - PHPUnit, Mockery tests
    - Quality (PHPStan, Psalm, PHP-CS-Fixer)
    - Pure PHP patterns

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit (OWASP)"

ARCHITECTURE_SUMMARY="\`\`\`
src/
├── Domain/           # Business logic
│   ├── Entity/       # Domain entities
│   └── Service/      # Domain services
├── Application/      # Use cases
│   ├── Command/      # Write operations
│   └── Query/        # Read operations
├── Infrastructure/   # External concerns
│   ├── Persistence/  # Database repositories
│   └── Http/         # Controllers, API
└── tests/
\`\`\`

**Dependency Rule**: Infrastructure -> Application -> Domain (INWARD ONLY)"

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | \`UserService\` |
| Methods | camelCase | \`getUserById\` |
| Constants | UPPER_SNAKE | \`MAX_RETRIES\` |
| Private | camelCase | \`\\\$privateField\` |

**Standards**: PSR-1, PSR-4 (autoloading), PSR-12 (coding style)."

TESTING_STACK="**PHP Stack**: PHPUnit + Mockery + PHPStan + Psalm"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Clean Architecture for PHP
- \`${TECH_NAMESPACE}/coding-standards.md\` - PSR-1, PSR-4, PSR-12
- \`${TECH_NAMESPACE}/testing.md\` - PHPUnit patterns
- \`${TECH_NAMESPACE}/tooling.md\` - Composer, PHP-CS-Fixer
- \`${TECH_NAMESPACE}/quality-tools.md\` - PHPStan, Psalm
- \`${TECH_NAMESPACE}/security.md\` - OWASP, security best practices"

FILE_CONTEXTS="  # PHP source files
  \"*.php\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Follow PSR-12 coding style.
      Use strict types: declare(strict_types=1);
      Document with PHPDoc annotations.

  # Test files
  \"*Test.php\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      TDD: RED -> GREEN -> REFACTOR
      Use PHPUnit assertions, coverage >= 80%

  \"**/tests/**\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/Tests/**\":
    suggest_skills:
      - testing
    auto_load: false

  # Controller/API files
  \"**/Controller/**/*.php\":
    suggest_skills:
      - security
    auto_load: false

  \"**/Http/**/*.php\":
    suggest_skills:
      - security
    auto_load: false

  # Domain layer
  \"**/Domain/**/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Domain: Pure PHP, no framework dependencies.
      Use value objects for immutable data.

  # Entity files
  \"**/Entity/**/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Entities encapsulate business logic.
      Keep them framework-agnostic.

  # Service files
  \"**/Service/**/*.php\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
