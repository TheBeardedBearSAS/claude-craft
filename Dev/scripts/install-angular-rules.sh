#!/bin/bash
# Install/update Claude Code rules for Angular projects
# Version: 4.0.1 - TCL (Tiered Context Loading) optimized
# Usage: ./install-angular-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="Angular"
TECH_DISPLAY_NAME="Angular"
TECH_NAMESPACE="angular"
DEFAULT_STACK="Angular 17+, TypeScript 5+, RxJS, NgRx, Angular Material"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture-angular.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-angular.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-angular.md:security.md"
)

TECH_RULES=(
    "02-architecture-angular.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-angular.md"
    "08-quality-tools.md"
    "11-security-angular.md"
)

# --- Angular verifies rules/00-project-context.md.template instead of CLAUDE.md.template ---
TECH_VERIFY_FILE="rules/00-project-context.md.template"

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Module-based architecture / Standalone components
    - TypeScript strict mode, Angular style guide
    - Tests Jasmine, Karma, Cypress
    - Quality (ESLint, Prettier, Stylelint)
    - RxJS, NgRx patterns

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check-compliance\` - Full compliance audit
- \`/${TECH_NAMESPACE}:check-architecture\` - Architecture validation
- \`/${TECH_NAMESPACE}:check-code-quality\` - Code quality analysis
- \`/${TECH_NAMESPACE}:check-testing\` - Test coverage analysis
- \`/${TECH_NAMESPACE}:check-security\` - Security audit
- \`/${TECH_NAMESPACE}:generate-component\` - Generate Angular component"

ARCHITECTURE_SUMMARY="\`\`\`
src/app/
├── core/             # Singleton services, guards, interceptors
│   ├── services/     # Application-wide services
│   ├── guards/       # Route guards
│   └── interceptors/ # HTTP interceptors
├── shared/           # Shared components, pipes, directives
│   ├── components/   # Reusable UI components
│   ├── pipes/        # Custom pipes
│   └── directives/   # Custom directives
├── features/         # Feature modules (lazy-loaded)
│   └── feature-name/
│       ├── components/
│       ├── services/
│       ├── models/
│       └── feature-name.module.ts
├── app.module.ts     # Root module
└── app-routing.module.ts
\`\`\`

**Dependency Rule**: features -> shared -> core (NO circular dependencies)"

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase + Suffix | \`UserProfileComponent\` |
| Services | PascalCase + Suffix | \`AuthService\` |
| Pipes | camelCase | \`dateFormat\` |
| Directives | camelCase | \`highlight\` |
| Files | kebab-case | \`user-profile.component.ts\` |

**Always**: Strict TypeScript, OnPush change detection, trackBy for ngFor."

TESTING_STACK="**Angular Stack**: Jasmine + Karma + Angular Testing Library + Cypress (E2E)"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Module-based architecture
- \`${TECH_NAMESPACE}/coding-standards.md\` - TypeScript & Angular style guide
- \`${TECH_NAMESPACE}/testing.md\` - Jasmine/Karma patterns
- \`${TECH_NAMESPACE}/tooling.md\` - Angular CLI, ESLint, Prettier
- \`${TECH_NAMESPACE}/quality-tools.md\` - Linting & formatting
- \`${TECH_NAMESPACE}/security.md\` - Angular security best practices"

FILE_CONTEXTS="  # Angular components
  \"*.component.ts\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Use OnPush change detection strategy.
      Keep components small and focused.
      Use trackBy for ngFor loops.

  # Angular services
  \"*.service.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Use providedIn: 'root' for singletons.
      Return Observables, not Promises.
      Use dependency injection properly.

  # Angular modules
  \"*.module.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Keep modules focused (feature modules).
      Use lazy loading for feature modules.
      Export only what's needed.

  # Angular pipes
  \"*.pipe.ts\":
    suggest_skills:
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Make pipes pure when possible.
      Keep transformation logic simple.

  # Angular directives
  \"*.directive.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Use HostBinding and HostListener.
      Keep directives single-purpose.

  # Angular guards
  \"*.guard.ts\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Return Observable<boolean> or UrlTree.
      Handle authentication and authorization.

  # Angular interceptors
  \"*.interceptor.ts\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Handle errors globally.
      Add auth tokens consistently.
      Implement retry logic.

  # Angular resolvers
  \"*.resolver.ts\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Pre-fetch data before route activation.
      Handle loading states properly.

  # Test files
  \"*.spec.ts\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      TDD: RED -> GREEN -> REFACTOR
      Use TestBed for Angular testing.
      Mock services and HTTP calls.

  # E2E test files
  \"*.cy.ts\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      Test user flows end-to-end.
      Use data-testid attributes.
      Avoid flaky selectors.

  \"**/*.e2e-spec.ts\":
    suggest_skills:
      - testing
    auto_load: false

  # TypeScript files (general)
  \"*.ts\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Strict TypeScript mode required.
      Use interfaces for contracts.
      Avoid 'any' type.

  # HTML templates
  \"*.component.html\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Avoid complex logic in templates.
      Use async pipe for observables.
      Sanitize user input.

  # Styles
  \"*.component.scss\":
    auto_load: false
    quick_tips: |
      Use BEM naming convention.
      Leverage Angular Material theming.
      Keep component styles scoped.

  # Documentation
  \"*.md\":
    suggest_skills:
      - documentation
    auto_load: false"

# --- Run ---
source "${SCRIPT_DIR}/lib/install-tech-common.sh"
run_tech_install "$@"
