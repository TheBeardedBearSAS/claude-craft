#!/bin/bash
# Install/update Claude Code rules for React Native projects
# Version: 4.0.1 - TCL (Tiered Context Loading) optimized
# Usage: ./install-reactnative-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="ReactNative"
TECH_DISPLAY_NAME="React Native"
TECH_NAMESPACE="reactnative"
DEFAULT_STACK="React Native 0.73+, TypeScript, Expo, React Navigation, Zustand"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-reactnative.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-reactnative.md:security.md"
    "12-performance.md:performance.md"
    "13-state-management.md:state-management.md"
    "14-navigation.md:navigation.md"
)

TECH_RULES=(
    "02-architecture.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-reactnative.md"
    "08-quality-tools.md"
    "11-security-reactnative.md"
    "12-performance.md"
    "13-state-management.md"
    "14-navigation.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Component-based Architecture
    - TypeScript standards, React Native best practices
    - Tests Jest, React Native Testing Library, Detox
    - Quality (ESLint, Prettier, TypeScript)
    - Expo, React Navigation, State Management

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit
- \`/${TECH_NAMESPACE}:check-performance\` - Performance analysis"

ARCHITECTURE_SUMMARY="\`\`\`
src/
├── components/       # Reusable UI components
│   ├── atoms/        # Basic building blocks
│   ├── molecules/    # Composed components
│   └── organisms/    # Complex components
├── screens/          # Screen components
├── navigation/       # Navigation configuration
├── services/         # API calls & external services
├── stores/           # State management (Zustand)
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Helper functions
├── constants/        # App constants
└── assets/           # Images, fonts, etc.
\`\`\`

**Component Rule**: screens -> organisms -> molecules -> atoms (TOP-DOWN)"

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | \`UserProfile.tsx\` |
| Hooks | camelCase + use | \`useAuth.ts\` |
| Constants | UPPER_SNAKE | \`API_BASE_URL\` |
| Types/Interfaces | PascalCase + I/T | \`IUser\`, \`TProps\` |
| Screens | PascalCase + Screen | \`HomeScreen.tsx\` |

**Always**: TypeScript strict mode, functional components, ESLint + Prettier."

TESTING_STACK="**React Native Stack**: Jest + React Native Testing Library + Detox (E2E)"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Component Architecture
- \`${TECH_NAMESPACE}/coding-standards.md\` - TypeScript & React Native standards
- \`${TECH_NAMESPACE}/testing.md\` - Jest + RNTL + Detox patterns
- \`${TECH_NAMESPACE}/tooling.md\` - ESLint, Prettier, Metro
- \`${TECH_NAMESPACE}/state-management.md\` - Zustand patterns
- \`${TECH_NAMESPACE}/navigation.md\` - React Navigation
- \`${TECH_NAMESPACE}/performance.md\` - Optimization techniques
- \`${TECH_NAMESPACE}/security.md\` - Mobile security best practices"

FILE_CONTEXTS="  # React Native components
  \"*.tsx\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Use functional components with TypeScript.
      Follow atomic design principles.

  # TypeScript files
  \"*.ts\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Strict TypeScript. Explicit return types.
      No 'any' types allowed.

  # Screen components
  \"**/screens/**/*.tsx\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Screens orchestrate components.
      Keep business logic in hooks/stores.

  # Navigation files
  \"**/navigation/**/*.tsx\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Type-safe navigation with React Navigation.
      Define screen params in types.

  # Test files
  \"*.test.tsx\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      TDD: RED -> GREEN -> REFACTOR
      Use React Native Testing Library.
      Coverage >= 80%

  \"*.test.ts\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/tests/**\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/__tests__/**\":
    suggest_skills:
      - testing
    auto_load: false

  # E2E tests
  \"**/e2e/**/*.ts\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      Detox E2E tests.
      Test critical user flows.

  # Store/State files
  \"**/stores/**/*.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Zustand stores: keep them small and focused.
      Use selectors for derived state.

  # Services/API files
  \"**/services/**/*.ts\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Handle errors gracefully.
      Use typed API responses.

  # Hooks
  \"**/hooks/**/*.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Custom hooks: single responsibility.
      Return consistent interfaces.

  # Components
  \"**/components/**/*.tsx\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Components: pure and reusable.
      Props: typed with interfaces.

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
