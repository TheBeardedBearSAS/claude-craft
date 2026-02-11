#!/bin/bash
# Install/update Claude Code rules for Flutter projects
# Version: 4.0.1 - TCL (Tiered Context Loading) optimized
# Usage: ./install-flutter-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="Flutter"
TECH_DISPLAY_NAME="Flutter"
TECH_NAMESPACE="flutter"
DEFAULT_STACK="Flutter 3+, Dart 3+, Riverpod, GoRouter, Freezed, Dio"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-flutter.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-flutter.md:security.md"
    "12-performance.md:performance.md"
    "13-state-management.md:state-management.md"
)

TECH_RULES=(
    "02-architecture.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-flutter.md"
    "08-quality-tools.md"
    "11-security-flutter.md"
    "12-performance.md"
    "13-state-management.md"
)

# --- 2026 feature references ---
TECH_2026_REFS=(
    "wasm.md"
    "mcp-integration.md"
    "web-performance-2026.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Clean Architecture / Feature-first
    - Dart standards, Effective Dart
    - Tests flutter_test, integration_test
    - Quality (dart analyze, DCM)
    - Riverpod, Bloc, Provider patterns
    - Performance and widget optimization

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit
- \`/${TECH_NAMESPACE}:check-performance\` - Performance analysis"

ARCHITECTURE_SUMMARY="\`\`\`
lib/
├── core/             # Core utilities, extensions
├── features/
│   └── feature_name/
│       ├── data/     # Repositories, data sources
│       ├── domain/   # Entities, use cases
│       └── presentation/ # Widgets, state
├── shared/           # Shared widgets, utils
└── main.dart
\`\`\`

**Dependency Rule**: presentation -> domain <- data (domain has NO dependencies)"

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | \`UserRepository\` |
| Functions | camelCase | \`getUserById\` |
| Constants | lowerCamelCase | \`defaultPadding\` |
| Private | _prefix | \`_internalState\` |
| Files | snake_case | \`user_repository.dart\` |

**Always**: Effective Dart, prefer const, use final."

TESTING_STACK="**Flutter Stack**: flutter_test + mockito + integration_test + patrol"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Clean Architecture for Flutter
- \`${TECH_NAMESPACE}/coding-standards.md\` - Effective Dart
- \`${TECH_NAMESPACE}/testing.md\` - flutter_test patterns
- \`${TECH_NAMESPACE}/tooling.md\` - dart analyze, DCM
- \`${TECH_NAMESPACE}/state-management.md\` - Riverpod, Bloc, Provider
- \`${TECH_NAMESPACE}/performance.md\` - Widget optimization
- \`${TECH_NAMESPACE}/security.md\` - Mobile security best practices"

FILE_CONTEXTS="  # Dart source files
  \"*.dart\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Use const constructors where possible.
      Follow Effective Dart guidelines.
      Prefer final for immutable variables.

  # Test files
  \"*_test.dart\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      TDD: RED -> GREEN -> REFACTOR
      Use setUp/tearDown, coverage >= 80%

  \"**/test/**\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/integration_test/**\":
    suggest_skills:
      - testing
    auto_load: false

  # Widget files
  \"*_widget.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Prefer StatelessWidget when possible.
      Extract widgets for reusability.
      Use const constructors.

  \"*_screen.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Keep screens focused on UI composition.
      Delegate logic to providers/blocs.

  \"*_page.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false

  # State management
  \"*_provider.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Keep providers focused and small.
      Use proper state immutability.

  \"*_notifier.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false

  \"*_controller.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false

  \"*_bloc.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Separate events and states.
      Keep blocs pure and testable.

  \"*_cubit.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false

  # Domain layer
  \"**/domain/**/*.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Domain: Pure Dart, no Flutter/external dependencies.
      Use freezed for immutable entities.

  # Data layer
  \"**/data/**/*.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Implement domain interfaces.
      Handle API/database errors properly.

  \"*_repository.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false

  \"*_datasource.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false

  # Models and DTOs
  \"*_model.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Use freezed for data classes.
      Include fromJson/toJson methods.

  \"*_dto.dart\":
    suggest_skills:
      - solid-principles
    auto_load: false

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
