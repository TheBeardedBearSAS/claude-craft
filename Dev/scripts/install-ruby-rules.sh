#!/bin/bash
# Install/update Claude Code rules for Ruby / Rails projects
# Version: 1.0.0 - TCL (Tiered Context Loading) optimized
# Usage: ./install-ruby-rules.sh [OPTIONS] [PROJECT_DIR]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
I18N_DIR="$(dirname "$SCRIPT_DIR")/i18n"

# --- Tech identity ---
TECH_NAME="Ruby"
TECH_DISPLAY_NAME="Ruby / Rails"
TECH_NAMESPACE="ruby"
DEFAULT_STACK="Ruby 4.0, Rails 8.1, Hotwire, Solid Queue, RSpec or Minitest, RuboCop, Brakeman"

# --- TCL version ---
source "${SCRIPT_DIR}/tcl-common.sh"
VERSION=$(get_claude_craft_version)

# --- Rule mappings ---
TECH_RULE_MAPPINGS=(
    "02-architecture-ruby.md:architecture.md"
    "03-coding-standards.md:coding-standards.md"
    "06-tooling.md:tooling.md"
    "07-testing-ruby.md:testing.md"
    "08-quality-tools.md:quality-tools.md"
    "11-security-ruby.md:security.md"
)

TECH_RULES=(
    "02-architecture-ruby.md"
    "03-coding-standards.md"
    "06-tooling.md"
    "07-testing-ruby.md"
    "08-quality-tools.md"
    "11-security-ruby.md"
)

# --- Help description ---
HELP_DESCRIPTION="    TCL-optimized installation covering:
    - Rails Way first, service/form/query objects when code grows
    - Ruby 4.0 (YJIT/ZJIT), Rails 8.1 defaults (Solid Queue/Cache/Cable, Hotwire, Kamal)
    - RSpec or Minitest, FactoryBot, Capybara system tests
    - Quality (RuboCop, rubocop-rails-omakase, Brakeman, bundler-audit)

    Token reduction: ~95% (from ~70K to ~3.5K)"

# --- Install data ---
AVAILABLE_COMMANDS="- \`/${TECH_NAMESPACE}:check <architecture|code-quality|security|testing|all>\` - Audit by axis (all = scored aggregate)"

ARCHITECTURE_SUMMARY="\`\`\`
app/
├── models/        # Active Record models (persistence + domain rules)
├── controllers/   # Thin controllers, strong params
├── views/         # ERB + Hotwire (Turbo Frames/Streams)
├── services/      # Service objects (one public #call)
├── forms/         # Form objects (multi-model input)
├── queries/       # Query objects (complex scopes)
└── jobs/          # Active Job (Solid Queue)
spec/ or test/     # RSpec or Minitest
\`\`\`

**Rule**: Rails Way first; extract an object only when a model or controller grows."

CODING_STANDARDS_SUMMARY="| Element | Convention | Example |
|---------|-----------|---------|
| Classes/Modules | PascalCase | \`UserRegistration\` |
| Methods/variables | snake_case | \`find_active_users\` |
| Predicates | trailing ? | \`active?\` |
| Constants | UPPER_SNAKE | \`MAX_RETRIES\` |

**Standards**: Ruby Style Guide via RuboCop, \`# frozen_string_literal: true\`."

TESTING_STACK="**Ruby Stack**: RSpec or Minitest + FactoryBot + Capybara + SimpleCov"

TECH_REFERENCES="- \`${TECH_NAMESPACE}/architecture.md\` - Rails Way and service/form/query objects
- \`${TECH_NAMESPACE}/coding-standards.md\` - Ruby Style Guide, RuboCop
- \`${TECH_NAMESPACE}/testing.md\` - RSpec / Minitest patterns
- \`${TECH_NAMESPACE}/tooling.md\` - Bundler, bin/rails, bin/ci, Kamal
- \`${TECH_NAMESPACE}/quality-tools.md\` - RuboCop, Brakeman, bundler-audit
- \`${TECH_NAMESPACE}/security.md\` - OWASP, Rails security guide"

FILE_CONTEXTS="  # Ruby source files
  \"*.rb\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false
    quick_tips: |
      Follow the Ruby Style Guide (RuboCop).
      Start files with: # frozen_string_literal: true

  # Test files
  \"*_spec.rb\":
    suggest_skills:
      - testing
    auto_load: false
    quick_tips: |
      TDD: RED -> GREEN -> REFACTOR
      Use FactoryBot, coverage >= 80%

  \"*_test.rb\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/spec/**\":
    suggest_skills:
      - testing
    auto_load: false

  \"**/test/**\":
    suggest_skills:
      - testing
    auto_load: false

  # Controllers
  \"**/app/controllers/**/*.rb\":
    suggest_skills:
      - security
    auto_load: false
    quick_tips: |
      Keep controllers thin, permit params explicitly.

  # Models
  \"**/app/models/**/*.rb\":
    suggest_skills:
      - solid-principles
    auto_load: false
    quick_tips: |
      Never interpolate user input in where(); use placeholders.

  # Service objects
  \"**/app/services/**/*.rb\":
    suggest_skills:
      - solid-principles
      - kiss-dry-yagni
    auto_load: false

  # Migrations
  \"**/db/migrate/**/*.rb\":
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
