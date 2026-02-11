#!/bin/bash
# Install/update Claude Code rules for React projects
# Version: 4.0.1 - TCL (Tiered Context Loading) optimized
# Usage: ./install-react-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="React"
TECH_DISPLAY_NAME="React"
TECH_NAMESPACE="react"
DEFAULT_STACK="React 18+, TypeScript 5+, Vite, TailwindCSS, React Query, Zustand"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-react.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-react.md:security.md"
)

TECH_RULES=(
    "02-architecture.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-react.md"
    "08-quality-tools.md"
    "11-security-react.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Component-based Architecture
    - TypeScript strict mode
    - Testing (Vitest, RTL, Playwright)
    - Quality tools (ESLint, Prettier, Biome)
    - State management (Zustand, React Query)

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit"

ARCHITECTURE_SUMMARY="\`\`\`
src/
├── components/        # Reusable UI components
│   ├── ui/           # Base components (Button, Input)
│   └── features/     # Feature-specific components
├── hooks/            # Custom React hooks
├── pages/            # Page components / routes
├── services/         # API calls, external services
├── stores/           # State management (Zustand)
├── types/            # TypeScript types/interfaces
└── utils/            # Helper functions
\`\`\`

**Component Rule**: Smart components (pages) -> Feature components -> UI components (INWARD ONLY)"

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | \`UserProfile\` |
| Hooks | camelCase + use | \`useAuth\` |
| Utils | camelCase | \`formatDate\` |
| Constants | UPPER_SNAKE | \`API_BASE_URL\` |
| Types | PascalCase + suffix | \`UserProps\`, \`AuthState\` |

**Always**: TypeScript strict mode, ESLint + Prettier, named exports."

TESTING_STACK="**React Stack**: Vitest + React Testing Library + Playwright + MSW"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Component-based Architecture
- \`${TECH_NAMESPACE}/coding-standards.md\` - TypeScript & React conventions
- \`${TECH_NAMESPACE}/testing.md\` - Vitest & RTL patterns
- \`${TECH_NAMESPACE}/tooling.md\` - Vite, ESLint, Prettier
- \`${TECH_NAMESPACE}/quality-tools.md\` - Biome, Husky, lint-staged
- \`${TECH_NAMESPACE}/security.md\` - React security best practices"

FILE_CONTEXTS="  # React/TypeScript components
  \"*.tsx\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Use functional components with TypeScript.
      Props interface required. Prefer composition over inheritance.

  # TypeScript files
  \"*.ts\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      TypeScript strict mode required.
      Explicit return types for functions.

  # Test files
  \"*.test.tsx\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      TDD: RED -> GREEN -> REFACTOR
      Use RTL queries: getByRole > getByText > getByTestId

  \"*.test.ts\":
    suggest_skills:
      - testing
    auto_load: false

  \"*.spec.tsx\":
    suggest_skills:
      - testing
    auto_load: false

  \"*.spec.ts\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/__tests__/**\":
    suggest_skills:
      - testing
    auto_load: false

  # Component directories
  \"**/components/**/*.tsx\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Components: Single responsibility, props validation.
      Extract logic to custom hooks.

  # Hooks
  \"**/hooks/**/*.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Hooks: Start with 'use', single purpose.
      Handle cleanup in useEffect return.

  \"**/hooks/**/*.tsx\":
    suggest_skills:
      - solid-principles
    auto_load: false

  # Pages/Routes
  \"**/pages/**/*.tsx\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Pages: Smart components, data fetching here.
      Handle loading/error states.

  # Services/API
  \"**/services/**/*.ts\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Services: Type API responses.
      Use React Query for server state.

  # State management
  \"**/stores/**/*.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Stores: Keep minimal, derive state when possible.
      Separate UI state from server state.

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
