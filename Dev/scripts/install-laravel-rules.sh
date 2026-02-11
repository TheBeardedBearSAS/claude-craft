#!/bin/bash
# Install/update Claude Code rules for Laravel projects
# Version: 4.0.1 - TCL (Tiered Context Loading) optimized
# Usage: ./install-laravel-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="Laravel"
TECH_DISPLAY_NAME="Laravel"
TECH_NAMESPACE="laravel"
DEFAULT_STACK="Laravel 11+, PHP 8.3+, Eloquent ORM, Livewire, Inertia.js"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture-laravel.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-laravel.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-laravel.md:security.md"
)

TECH_RULES=(
    "02-architecture-laravel.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-laravel.md"
    "08-quality-tools.md"
    "11-security-laravel.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Laravel Architecture (MVC, Services, Repositories)
    - PSR-12 standards, PHP 8.3+ features
    - PHPUnit, Pest, Laravel Dusk tests
    - Quality (PHPStan, Pint, Rector)
    - Eloquent, Livewire, Inertia patterns

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit (OWASP)"

ARCHITECTURE_SUMMARY="\`\`\`
app/
├── Models/           # Eloquent models
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   └── Requests/     # Form requests
├── Services/         # Business logic
├── Repositories/     # Data access
├── Events/           # Event classes
└── Listeners/        # Event handlers
\`\`\`

**Dependency Rule**: Controllers -> Services -> Repositories -> Models"

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | \`UserService\` |
| Methods | camelCase | \`getUserById\` |
| Variables | camelCase | \`\\\$userName\` |
| Constants | UPPER_SNAKE | \`MAX_RETRIES\` |

**Always**: PSR-12 compliance, type declarations, Laravel Pint formatting."

TESTING_STACK="**Laravel Stack**: PHPUnit + Pest + Laravel Dusk + Mockery"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Laravel Architecture patterns
- \`${TECH_NAMESPACE}/coding-standards.md\` - PSR-12 & Laravel conventions
- \`${TECH_NAMESPACE}/testing.md\` - PHPUnit/Pest patterns
- \`${TECH_NAMESPACE}/tooling.md\` - Artisan, Composer, Vite
- \`${TECH_NAMESPACE}/quality-tools.md\` - PHPStan, Pint, Rector
- \`${TECH_NAMESPACE}/security.md\` - Laravel security best practices"

FILE_CONTEXTS="  # PHP source files
  \"*.php\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Type declarations required. Use Laravel Pint for formatting.
      Follow PSR-12 coding standards.

  # Controller files
  \"*Controller.php\":
    suggest_skills:
      - solid-principles
      - security
    auto_load: false
    quick_tips: |
      Controllers should be thin. Move logic to Services.
      Use Form Requests for validation.

  # Model files
  \"**/Models/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Define fillable/guarded. Use relationships.
      Avoid business logic in models.

  # Migration files
  \"**/migrations/*.php\":
    suggest_skills: []
    auto_load: false
    quick_tips: |
      Use descriptive column names.
      Add indexes for frequently queried columns.

  # Service files
  \"**/Services/*.php\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Single responsibility. Inject dependencies.
      Use interfaces for abstraction.

  # Repository files
  \"**/Repositories/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      One repository per model.
      Return collections/models, not query builders.

  # Test files
  \"*Test.php\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      TDD: RED -> GREEN -> REFACTOR
      Use factories, coverage >= 80%

  \"**/tests/**\":
    suggest_skills:
      - testing
    auto_load: false

  # Feature tests
  \"**/tests/Feature/**\":
    suggest_skills:
      - testing
      - security
    auto_load: false
    quick_tips: |
      Test full HTTP request/response cycle.
      Use actingAs() for authentication.

  # Unit tests
  \"**/tests/Unit/**\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      Test isolated units with mocks.
      Fast execution, no database.

  # Request files
  \"*Request.php\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Centralize validation rules here.
      Use authorize() for authorization.

  # Middleware files
  \"**/Middleware/*.php\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Keep middleware focused and fast.
      Use for cross-cutting concerns.

  # Event/Listener files
  \"**/Events/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false

  \"**/Listeners/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Keep listeners focused on one task.
      Consider queueing for heavy operations.

  # Livewire components
  \"**/Livewire/*.php\":
    suggest_skills:
      - solid-principles
      - security
    auto_load: false
    quick_tips: |
      Validate input. Use wire:model carefully.
      Consider component extraction.

  # Blade templates
  \"*.blade.php\":
    suggest_skills: []
    auto_load: false
    quick_tips: |
      Use @csrf in forms. Escape output with {{ }}.
      Extract reusable components.

  # Configuration files
  \"config/*.php\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Use env() only in config files.
      Never commit sensitive values.

  # Route files
  \"routes/*.php\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Group routes with middleware.
      Use route model binding.

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
