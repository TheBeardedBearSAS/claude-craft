#!/bin/bash
# Install/update Claude Code rules for Vue.js projects
# Version: 4.0.1 - TCL (Tiered Context Loading) optimized
# Usage: ./install-vuejs-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="VueJS"
TECH_DISPLAY_NAME="Vue.js"
TECH_NAMESPACE="vuejs"
DEFAULT_STACK="Vue 3+, TypeScript 5+, Vite, Pinia, Vue Router, TailwindCSS"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture-vuejs.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-vuejs.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-vuejs.md:security.md"
)

TECH_RULES=(
    "02-architecture-vuejs.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-vuejs.md"
    "08-quality-tools.md"
    "11-security-vuejs.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Composition API patterns
    - TypeScript strict mode
    - Pinia state management
    - Vue Router configuration
    - Vitest + Vue Test Utils + Playwright
    - ESLint + Prettier + Vue-specific rules

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit"

ARCHITECTURE_SUMMARY="\`\`\`
src/
├── components/       # Reusable Vue components
│   ├── common/       # Shared UI components
│   └── features/     # Feature-specific components
├── composables/      # Composition API functions
├── views/            # Page-level components
├── stores/           # Pinia stores
├── router/           # Vue Router config
├── types/            # TypeScript types
├── utils/            # Helper functions
├── services/         # API services
└── assets/           # Static assets
\`\`\`

**Composition API**: Always use \`<script setup lang=\"ts\">\` with Composition API."

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | \`UserCard.vue\` |
| Composables | camelCase + use prefix | \`useAuth.ts\` |
| Stores | camelCase | \`userStore.ts\` |
| Props | camelCase | \`userName: string\` |
| Events | kebab-case | \`@update-user\` |
| CSS Classes | kebab-case / BEM | \`user-card__title\` |

**Always**: TypeScript strict mode, defineProps/defineEmits with types."

TESTING_STACK="**Vue.js Stack**: Vitest + Vue Test Utils + Playwright + MSW"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Component architecture
- \`${TECH_NAMESPACE}/coding-standards.md\` - TypeScript & Vue conventions
- \`${TECH_NAMESPACE}/testing.md\` - Vitest & Playwright patterns
- \`${TECH_NAMESPACE}/tooling.md\` - Vite, ESLint, Prettier
- \`${TECH_NAMESPACE}/quality-tools.md\` - Code quality tools
- \`${TECH_NAMESPACE}/security.md\` - Vue.js security best practices"

FILE_CONTEXTS="  # Vue Single File Components
  \"*.vue\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Use <script setup lang=\"ts\"> with Composition API.
      Props: defineProps<{}>(), Emits: defineEmits<{}>()
      Keep components small and focused.

  # Composables
  \"**/composables/**/*.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Prefix with 'use': useAuth, useUser
      Return reactive refs and computed properties.
      Extract reusable logic from components.

  # Pinia Stores
  \"**/stores/**/*.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Use defineStore() with setup syntax.
      Keep state minimal, derive with getters.
      Actions for async operations.

  # Test files
  \"*.spec.ts\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      Use @vue/test-utils for component tests.
      Mock composables and stores.
      Test user interactions, not implementation.

  \"*.test.ts\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/tests/**\":
    suggest_skills:
      - testing
    auto_load: false

  # Router
  \"**/router/**/*.ts\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Use typed routes with vue-router.
      Implement navigation guards for auth.
      Lazy load route components.

  # API Services
  \"**/services/**/*.ts\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Use typed API responses.
      Handle errors consistently.
      Implement request interceptors.

  # TypeScript types
  \"**/types/**/*.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Use interfaces for objects, types for unions.
      Export shared types from index.ts.

  # Views (Pages)
  \"**/views/**/*.vue\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Views orchestrate components.
      Fetch data here, pass to children.
      Use Suspense for async components.

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
