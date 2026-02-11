#!/bin/bash
# Install/update Claude Code rules for C#/.NET projects
# Version: 4.0.1 - TCL (Tiered Context Loading) optimized
# Usage: ./install-csharp-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="CSharp"
TECH_DISPLAY_NAME="C#/.NET"
TECH_NAMESPACE="csharp"
DEFAULT_STACK=".NET 9, C# 13, Clean Architecture, CQRS, MediatR, Entity Framework Core, xUnit"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture-csharp.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-csharp.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-csharp.md:security.md"
    "12-aspire-cloud-native.md:aspire.md"
)

TECH_RULES=(
    "02-architecture-csharp.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-csharp.md"
    "08-quality-tools.md"
    "11-security-csharp.md"
    "12-aspire-cloud-native.md"
)

# --- C# extra sed for project-context.md ---
TECH_EXTRA_SED_ARGS=(-e "s/{{DOTNET_VERSION}}/9/g")

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Clean Architecture, CQRS, DDD
    - .NET 9, C# 13, Modern Patterns
    - Entity Framework Core, MediatR
    - xUnit, FluentAssertions, Testcontainers
    - OWASP Security, .NET Aspire

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit (OWASP)
- \`/${TECH_NAMESPACE}:generate-feature\` - Generate CQRS feature"

ARCHITECTURE_SUMMARY="\`\`\`
src/
├── Domain/           # Core business logic (no dependencies)
│   ├── Entities/     # Aggregate roots
│   ├── ValueObjects/ # Immutable types
│   └── Interfaces/   # Repository contracts
├── Application/      # Use cases, CQRS
│   ├── Commands/     # Write operations
│   └── Queries/      # Read operations
├── Infrastructure/   # External concerns
│   └── Data/         # EF Core, repositories
└── WebAPI/           # Presentation layer
\`\`\`

**Dependency Rule**: WebAPI -> Application -> Domain (INWARD ONLY)
Infrastructure implements Domain interfaces."

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | \`UserService\` |
| Methods | PascalCase | \`GetUserById\` |
| Properties | PascalCase | \`FirstName\` |
| Private fields | _camelCase | \`_userRepository\` |
| Parameters | camelCase | \`userId\` |
| Constants | PascalCase | \`MaxRetries\` |

**Always**: Nullable reference types enabled, async/await patterns, records for DTOs."

TESTING_STACK="**C# Stack**: xUnit + FluentAssertions + Moq + Bogus + Testcontainers"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Clean Architecture for .NET
- \`${TECH_NAMESPACE}/coding-standards.md\` - C# conventions & patterns
- \`${TECH_NAMESPACE}/testing.md\` - xUnit & testing patterns
- \`${TECH_NAMESPACE}/tooling.md\` - .NET CLI & tooling
- \`${TECH_NAMESPACE}/quality-tools.md\` - Analyzers & code quality
- \`${TECH_NAMESPACE}/security.md\` - OWASP security guidelines
- \`${TECH_NAMESPACE}/aspire.md\` - .NET Aspire cloud-native"

FILE_CONTEXTS="  # C# source files
  \"*.cs\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Nullable reference types required. Use async/await.
      Follow C# naming conventions (PascalCase, _camelCase).

  # Test files
  \"*Tests.cs\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      TDD: RED -> GREEN -> REFACTOR
      Use FluentAssertions, coverage >= 80%

  \"*Test.cs\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/*Tests/**\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/Tests/**\":
    suggest_skills:
      - testing
    auto_load: false

  # Domain layer
  \"**/Domain/**/*.cs\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Domain: Pure C#, no framework dependencies.
      Use records for value objects, rich domain models.

  # Application layer
  \"**/Application/**/*.cs\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Application: Use cases via CQRS (Commands/Queries).
      MediatR handlers, FluentValidation.

  # Infrastructure layer
  \"**/Infrastructure/**/*.cs\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Infrastructure: EF Core, external services.
      Implement Domain interfaces here.

  # API layer
  \"**/WebAPI/**/*.cs\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      API: Minimal APIs or Controllers.
      Validate inputs, use DTOs, proper status codes.

  \"**/Controllers/**/*.cs\":
    suggest_skills:
      - security
    auto_load: false

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
