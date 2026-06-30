# Claude-Craft Cheat Sheet

Quick reference for the most common commands. Keep this handy for daily development.

---

## Quick Start (5 Lines)

```bash
npx @the-bearded-bear/claude-craft install . --auto       # Zero-prompt auto-detection
# or with an explicit stack:
npx @the-bearded-bear/claude-craft install . --tech=react --lang=en
/common:getting-started         # Interactive onboarding wizard (10 min) — run THIS FIRST
/common:init                    # Set up the project's .claude/ structure
/workflow:init                  # Initialize BMAD workflow
/common:pre-commit-check        # Validate before commit
/team:audit                     # Run full audit
```

**Alternative install methods:**
```bash
npx @the-bearded-bear/claude-craft install . --auto              # Auto-detect the stack
npx @the-bearded-bear/claude-craft install . --from=URL          # Shared team config
npx @the-bearded-bear/claude-craft skill add <name>              # Add a community skill
npx @the-bearded-bear/claude-craft kanban --open                 # Open the Kanban board
```

**Uninstall:**
```bash
rm -rf .claude/ CLAUDE.md .bmad/ ralph.yml                       # Full removal
```

> **Note:** `/sprint:*`, `/gate:*` and `/project:*` require `make install-project TARGET=.` (separate install).
> `/common:getting-started` and `/common:init` require Claude Craft to be installed first.

---

## By Persona

### Developer (Backend/Frontend)

| Task | Command |
|------|---------|
| Start new feature | `/workflow:start "Add user authentication"` |
| Pre-commit validation | `/common:pre-commit-check` |
| Fix bug with TDD | `/qa:tdd "Login fails with empty password"` |
| Generate CRUD (Symfony) | `/symfony:generate-crud User` |
| Generate component (React) | `/react:generate-component Button` |
| Generate endpoint (Python) | `/python:generate-endpoint /api/users` |
| Continuous loop | `/common:ralph-run "Implement payment module"` |
| Run tests | `/qa:status` |
| Research tech topic | `/common:research-context7 "FastAPI best practices"` |
| Daily standup summary | `/common:daily-standup` |

### QA / Tester

| Task | Command |
|------|---------|
| Test a story | `/qa:recette --scope=story --id=US-001` |
| Test a sprint | `/qa:recette --scope=sprint --id=Sprint-3` |
| Resume test session | `/qa:recette --resume=REC-20260130-143022` |
| Fix regression | `/qa:fix "User can submit empty form"` |
| Generate regression test | `/qa:regression US-042` |
| Report test results | `/qa:report` |

### Tech Lead / Architect

| Task | Command |
|------|---------|
| Full audit (sequential) | `/team:audit --sequential` |
| Full audit (parallel) | `/team:audit` |
| Security review | `/team:security` |
| Pre-merge check | `/common:pre-merge-check` |
| Architecture decision | `/common:architecture-decision "Choose database"` |
| Sprint review | `/workflow:review` |
| Sprint retrospective | `/workflow:retro` |
| Check architecture | `/symfony:check-architecture` (or tech-specific) |
| Check security | `/react:check-security` (or tech-specific) |
| Setup CI/CD | `/common:setup-ci` |

---

## 20 Installed Namespaces — Top Commands

> **Note:** The 7 namespaces `/sprint:`, `/gate:`, `/project:` (sprint management) and the infra namespaces (`/docker:`, `/k8s:`, `/coolify:`, etc.) require a separate install via `make install-project TARGET=.` or `make install-infra TARGET=.`.

### `/common:` - Cross-cutting

```
/common:getting-started           # Interactive onboarding wizard (run first)
/common:init                      # Configure project
/common:pre-commit-check          # Validate before commit
/common:pre-merge-check           # Validate before merge
/common:ralph-run "task"          # Continuous AI loop
/common:setup-rtk                 # Install token optimizer
/common:setup-ci                  # Configure CI/CD
/common:pack-repo                 # Pack codebase for AI
/common:research-context7 "topic" # Deep research
/common:daily-standup             # Standup summary
/common:release-checklist         # Pre-release checks
/common:generate-changelog        # Generate CHANGELOG
/common:architecture-decision     # Document ADR
/common:add-technology "nextjs"   # Add new tech stack
/common:setup-project-context     # Interactive project config (distinct from /common:init)
/common:aliases                   # Custom shortcuts and aliases
```

### `/workflow:` - BMAD Workflow

```
/workflow:init                    # Initialize workflow
/workflow:start "feature"         # Start new feature
/workflow:analyze "requirement"   # Analyze requirement
/workflow:plan "feature"          # Plan feature
/workflow:design "feature"        # Design architecture
/workflow:implement "feature"     # Implement feature
/workflow:review                  # Sprint review
/workflow:retro                   # Sprint retrospective
/workflow:status                  # Current status
```

### `/team:` - Agent Teams (Parallel)

```
/team:audit                       # Full audit (parallel)
/team:sprint Sprint-3             # Sprint implementation (parallel)
/team:security                    # Security review (parallel)
/team:delivery                    # Full lifecycle (write + implement)
```

### `/qa:` - QA & Testing

```
/qa:tdd "bug description"         # Fix with TDD
/qa:recette --scope=story --id=US-001  # Test story
/qa:fix "regression"              # Fix regression
/qa:regression US-042             # Generate regression test
/qa:status                        # Test status
/qa:report                        # Test report
```

### `/uiux:` - UI/UX & Accessibility

```
/uiux:orchestrator "task"         # Orchestrate UI/UX/A11y
/uiux:audit                       # Full UI/UX/A11y audit
/uiux:component-spec Button       # Component spec
/uiux:design-tokens               # Design system tokens
/uiux:user-flow "checkout"        # User journey design
/uiux:a11y-audit                  # WCAG 2.2 AAA audit
/uiux:generate-design-md          # Generate DESIGN.md
```

### `/symfony:` - Symfony/PHP

```
/symfony:generate-crud User       # Generate CRUD
/symfony:api-endpoint /api/users  # Generate API endpoint
/symfony:generate-command app:import  # Generate console command
/symfony:check-testing            # Check tests
/symfony:check-code-quality       # Check quality
/symfony:check-architecture       # Check architecture
/symfony:check-security           # Check security
/symfony:optimize-doctrine        # Optimize Doctrine
/symfony:migration-plan           # Migration strategy
/symfony:check-compliance         # Check GDPR/SOC2
```

### `/react:` - React/TypeScript

```
/react:generate-component Button  # Generate component
/react:generate-hook useAuth      # Generate custom hook
/react:storybook-story Button     # Generate Storybook story
/react:accessibility-check        # Check accessibility
/react:bundle-analyze             # Analyze bundle size
/react:check-testing              # Check tests
/react:check-code-quality         # Check quality
/react:check-architecture         # Check architecture
/react:check-security             # Check security
/react:check-compliance           # Check GDPR/SOC2
```

### `/python:` - Python/FastAPI

```
/python:generate-endpoint /api/users  # Generate endpoint
/python:generate-model User       # Generate Pydantic model
/python:dependency-audit          # Check dependencies
/python:type-coverage             # Check type coverage
/python:async-check               # Check async patterns
/python:check-testing             # Check tests
/python:check-code-quality        # Check quality
/python:check-architecture        # Check architecture
/python:check-security            # Check security
/python:check-compliance          # Check GDPR/SOC2
```

### `/flutter:` - Flutter/Dart

```
/flutter:generate-widget UserCard # Generate widget
/flutter:generate-feature auth    # Generate feature module
/flutter:golden-update            # Update golden files
/flutter:analyze-performance      # Performance analysis
/flutter:localization-check       # Check i18n
/flutter:check-testing            # Check tests
/flutter:check-code-quality       # Check quality
/flutter:check-architecture       # Check architecture
/flutter:check-security           # Check security
/flutter:check-compliance         # Check GDPR/SOC2
```

### `/angular:` - Angular

```
/angular:generate-component Button  # Generate component
/angular:check-testing            # Check tests
/angular:check-code-quality       # Check quality
/angular:check-architecture       # Check architecture
/angular:check-security           # Check security
/angular:check-compliance         # Check GDPR/SOC2
```

### `/vuejs:` - Vue.js

```
/vuejs:generate-component Button  # Generate component
/vuejs:check-testing              # Check tests
/vuejs:check-code-quality         # Check quality
/vuejs:check-architecture         # Check architecture
/vuejs:check-security             # Check security
/vuejs:check-compliance           # Check GDPR/SOC2
```

### `/laravel:` - Laravel/PHP

```
/laravel:generate-controller UserController  # Generate controller
/laravel:check-testing            # Check tests
/laravel:check-code-quality       # Check quality
/laravel:check-architecture       # Check architecture
/laravel:check-security           # Check security
/laravel:check-compliance         # Check GDPR/SOC2
```

### `/reactnative:` - React Native

```
/reactnative:generate-screen Home # Generate screen
/reactnative:native-module Camera # Generate native module
/reactnative:deep-link            # Configure deep links
/reactnative:app-size             # Analyze app size
/reactnative:store-prepare        # Prepare for app stores
/reactnative:check-testing        # Check tests
/reactnative:check-code-quality   # Check quality
/reactnative:check-architecture   # Check architecture
/reactnative:check-security       # Check security
/reactnative:check-compliance     # Check GDPR/SOC2
```

### `/csharp:` - C#/.NET

```
/csharp:generate-feature Auth     # Generate feature (CQRS)
/csharp:check-testing             # Check tests
/csharp:check-code-quality        # Check quality
/csharp:check-architecture        # Check architecture
/csharp:check-security            # Check security
/csharp:check-compliance          # Check GDPR/SOC2
```

### `/php:` - PHP (Generic)

```
/php:check-testing                # Check tests
/php:check-code-quality           # Check quality
/php:check-architecture           # Check architecture
/php:check-security               # Check security
/php:check-compliance             # Check GDPR/SOC2
```

### `/paperclip:` - Paperclip Orchestration

```
/paperclip:check-architecture     # Check architecture (control plane + adapters)
/paperclip:check-code-quality     # Check code quality
/paperclip:check-security         # Check security
/paperclip:check-testing          # Check tests
/paperclip:check-compliance       # Check GDPR/SOC2
/paperclip:generate-feature       # Generate feature module
/paperclip:api-endpoint           # Generate API endpoint
/paperclip:generate-command       # Generate CLI command
```

### `/sprint:` - Sprint Management

> **Prerequisite:** `make install-project TARGET=.` — commands absent from the default install.

```
/sprint:create Sprint-3           # Create sprint
/sprint:status                    # Sprint status
/sprint:review                    # Sprint review
/sprint:retro                     # Sprint retrospective
/sprint:close                     # Close sprint
```

### `/gate:` - Quality Gates

> **Prerequisite:** `make install-project TARGET=.`

```
/gate:prd                         # PRD quality gate
/gate:backlog                     # Backlog quality gate
/gate:sprint-ready                # Sprint Ready gate
/gate:dod                         # DoD gate
/gate:spec-alignment              # Spec Alignment gate
/gate:tech-spec                   # Tech Spec gate
/gate:invest                      # INVEST criteria gate
```

### `/project:` - Project Management (34 commands)

See `docs/COMMANDS.md` for full list of project management commands.

---

## Ralph Wiggum - Continuous Loop

Ralph runs Claude iteratively until all DoD validators pass.

```bash
/common:ralph-run "Implement user registration"
/common:ralph-run --full "Fix login bug"
```

**DoD Validators:**
- `command`: Run tests, lint, build
- `output_contains`: Check completion marker
- `file_changed`: Verify files modified
- `hook`: Custom validation script
- `human`: Manual approval

Configuration: `ralph.yml` in project root

---

## QA Recette - Acceptance Testing

```bash
/qa:recette --scope=story --id=US-001
/qa:recette --scope=sprint --id=Sprint-3
/qa:recette --resume=REC-20260130-143022
```

Prerequisites: Chrome extension v1.0.36+

---

## Token Optimization

```bash
/common:setup-rtk                 # Install RTK (60-90% token savings)
export CLAUDE_CODE_SUBAGENT_MODEL=sonnet  # Cheaper subagents
```

---

## Best Practices

| Practice | Command |
|----------|---------|
| Clear context between tasks | `/clear` |
| Use Plan Mode for complex tasks | Automatic for `generate-*` commands |
| Validate before commit | `/common:pre-commit-check` |
| Validate before merge | `/common:pre-merge-check` |
| Use parallel teams for 2+ stacks | `/team:audit` (vs `--sequential`) |
| Use Ralph for long tasks | `/common:ralph-run "task"` |
| Research with Context7 | `/common:research-context7 "topic"` |
| Multi-agent concurrent | `@tdd-coach @react-reviewer Implement this feature` |
| Reload skills without restart | `/reload-skills` (v2.1.157+) |

---

## Shortcuts & Aliases

```bash
/common:aliases                   # View and configure custom aliases
```

Configure keyboard shortcuts in `~/.claude/keybindings.json` for your 5 most frequent commands:
- `/common:pre-commit-check` → `Ctrl+Shift+P`
- `/common:ralph-run` → `Ctrl+Shift+R`
- `/qa:tdd` → `Ctrl+Shift+T`
- `/workflow:status` → `Ctrl+Shift+S`
- `/clear` → `Ctrl+Shift+C`

See `~/.claude/keybindings.json` for the full configuration.

---

## Kanban Board

```bash
npx @the-bearded-bear/claude-craft kanban --open   # Open in the browser
npx @the-bearded-bear/claude-craft kanban          # Start the local server (port 3141)
```

The Kanban board ingests `.bmad/sprint-status.yaml` read-only. No SaaS dependency.
Requires `make install-project TARGET=.` for BMAD v6 story generation.

---

## Emergency Commands

| Situation | Command |
|-----------|---------|
| Context overload | `/clear` |
| Need plan before action | `/workflow:plan "feature"` |
| Broken tests | `/qa:tdd "test description"` |
| Security vulnerability | `/team:security` |
| Pre-release panic | `/common:release-checklist` |
| Need to pack repo | `/common:pack-repo --format=xml` |

---

## See Also

- [LEARNING-PATHS.md](LEARNING-PATHS.md) - Progressive learning paths
- [COMMANDS.md](COMMANDS.md) - Full command reference
- [RALPH-GUIDE.md](RALPH-GUIDE.md) - Ralph Wiggum guide
- [AGENT-TEAMS-GUIDE.md](AGENT-TEAMS-GUIDE.md) - Agent Teams guide
- [QUICKSTART.md](QUICKSTART.md) - Getting started
