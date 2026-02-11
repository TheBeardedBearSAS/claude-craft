#!/bin/bash
# Install/update Claude Code rules for Symfony projects
# Version: 4.0.1 - TCL (Tiered Context Loading) optimized
# Usage: ./install-symfony-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="Symfony"
TECH_DISPLAY_NAME="Symfony"
TECH_NAMESPACE="symfony"
DEFAULT_STACK="Symfony 7+, PHP 8.3+, Doctrine ORM, API Platform, Messenger"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture-clean-ddd.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-docker-hadolint.md:docker.md"
    "07-testing-symfony.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-symfony.md:security.md"
    "12-performance.md:performance.md"
    "13-ddd-patterns.md:ddd-patterns.md"
    "14-multitenant.md:multitenant.md"
    "15-doctrine-extensions.md:doctrine-extensions.md"
    "16-i18n.md:i18n.md"
    "17-async.md:async.md"
    "18-value-objects.md:value-objects.md"
    "19-aggregates.md:aggregates.md"
    "20-domain-events.md:domain-events.md"
    "21-cqrs.md:cqrs.md"
)

TECH_RULES=(
    "02-architecture-clean-ddd.md"
    "03-coding-standards.md"
    "06-docker-hadolint.md"
    "07-testing-symfony.md"
    "08-quality-tools.md"
    "11-security-symfony.md"
    "12-performance.md"
    "13-ddd-patterns.md"
    "14-multitenant.md"
    "15-doctrine-extensions.md"
    "16-i18n.md"
    "17-async.md"
    "18-value-objects.md"
    "19-aggregates.md"
    "20-domain-events.md"
    "21-cqrs.md"
)

# --- 2026 feature references ---
TECH_2026_REFS=(
    "json-streamer.md"
    "object-mapper.md"
    "service-container-2026.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Clean Architecture / DDD / Hexagonal
    - PSR-12 standards, PHP 8.3+ attributes
    - Tests PHPUnit, Codeception, Behat, Infection
    - Quality (PHPStan, Psalm, PHP-CS-Fixer)
    - Doctrine ORM, API Platform, Messenger
    - CQRS, Domain Events, Value Objects

    Token reduction: ~95% (from ~120K to ~5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit (OWASP)"

ARCHITECTURE_SUMMARY="\`\`\`
src/
├── Domain/           # Business logic, entities
│   ├── Entity/       # Domain entities (Doctrine)
│   ├── ValueObject/  # Immutable value types
│   ├── Event/        # Domain events
│   └── Repository/   # Repository interfaces only
├── Application/      # Use cases, handlers
│   ├── Command/      # Write operations (CQRS)
│   ├── Query/        # Read operations (CQRS)
│   └── Service/      # Application services
├── Infrastructure/   # Technical implementations
│   ├── Persistence/  # Doctrine repositories
│   ├── Messenger/    # Message handlers
│   └── Api/          # API Platform resources
└── UI/               # User interface layer
    ├── Controller/   # HTTP controllers
    └── Console/      # CLI commands
\`\`\`

**Dependency Rule**: UI/Infrastructure -> Application -> Domain (INWARD ONLY)"

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | \`UserService\` |
| Methods | camelCase | \`getUserById()\` |
| Constants | UPPER_SNAKE | \`MAX_RETRIES\` |
| Properties | camelCase | \`\\\$firstName\` |

**Always**: PSR-12, PHP 8.3+ attributes, strict types, final classes."

TESTING_STACK="**Symfony Stack**: PHPUnit + Codeception + Behat + Infection (mutation testing)"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Clean Architecture + DDD
- \`${TECH_NAMESPACE}/coding-standards.md\` - PSR-12 & PHP 8.3+
- \`${TECH_NAMESPACE}/testing.md\` - PHPUnit, Behat, Infection
- \`${TECH_NAMESPACE}/quality-tools.md\` - PHPStan, Psalm, PHP-CS-Fixer
- \`${TECH_NAMESPACE}/security.md\` - Symfony security, OWASP
- \`${TECH_NAMESPACE}/ddd-patterns.md\` - DDD tactical patterns
- \`${TECH_NAMESPACE}/cqrs.md\` - CQRS with Messenger
- \`${TECH_NAMESPACE}/docker.md\` - Docker & Hadolint"

FILE_CONTEXTS="  # PHP source files
  \"*.php\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Strict types required. Use PHP 8.3+ attributes.
      Follow PSR-12 coding standards. Final classes by default.

  # Test files
  \"*Test.php\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      TDD: RED -> GREEN -> REFACTOR
      Use data providers, coverage >= 80%

  \"**/tests/**\":
    suggest_skills:
      - testing
    auto_load: false

  # Controllers
  \"*Controller.php\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Thin controllers: delegate to handlers/services.
      Use #[Route] attributes, validate input.

  \"**/Controller/**/*.php\":
    suggest_skills:
      - security
    auto_load: false

  # Domain layer - Entities
  \"**/Domain/Entity/**/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Rich domain model. Encapsulate behavior.
      Use value objects for identity and validation.

  \"**/Entity/**/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false

  # Domain layer - Value Objects
  \"**/ValueObject/**/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Immutable. Validate in constructor.
      Implement equals() for comparison.

  # Domain layer - Repositories
  \"**/Repository/**/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Domain: interfaces only.
      Infrastructure: Doctrine implementations.

  # Application layer - Commands/Queries (CQRS)
  \"**/Command/**/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Commands: write operations, return void or ID.
      Use Messenger for async processing.

  \"**/Query/**/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Queries: read operations, return DTOs.
      Optimize for read performance.

  # Infrastructure - Doctrine
  \"**/Persistence/**/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Implement domain repository interfaces.
      Use QueryBuilder for complex queries.

  # API Platform resources
  \"**/Api/**/*.php\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Use API Platform attributes.
      Define security per operation.

  # Messenger handlers
  \"**/Messenger/**/*.php\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      One handler per message.
      Handle failures gracefully.

  # Configuration files
  \"*.yaml\":
    suggest_skills: []
    auto_load: false
    quick_tips: |
      Use environment variables for secrets.
      Validate service definitions.

  \"*.yml\":
    suggest_skills: []
    auto_load: false

  # Doctrine mappings
  \"**/config/doctrine/**/*.xml\":
    suggest_skills: []
    auto_load: false
    quick_tips: |
      Prefer PHP 8 attributes over XML mappings.

  # Docker files
  \"Dockerfile\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Multi-stage builds. Non-root user.
      Use Hadolint for linting.

  \"docker-compose*.yml\":
    suggest_skills: []
    auto_load: false

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
