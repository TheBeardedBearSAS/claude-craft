# Bear-Craft Cheat Sheet

Quick reference for the most common commands. Keep this handy for daily development.

---

## Quick Start (5 Lines)

```bash
npx @the-bearded-bear/bear-craft install . --auto       # Zero-prompt auto-detection
# or with an explicit stack:
npx @the-bearded-bear/bear-craft install . --tech=react --lang=en
/bear-common:getting-started         # Interactive onboarding wizard (10 min) — run THIS FIRST
/bear-common:init                    # Set up the project's .claude/ structure
/bear-workflow:init                  # Initialize BMAD workflow
/bear-gate:check commit            # Validate before commit
/bear-team:audit                     # Run full audit
```

**Alternative install methods:**
```bash
npx @the-bearded-bear/bear-craft install . --auto              # Auto-detect the stack
npx @the-bearded-bear/bear-craft install . --from=URL          # Shared team config
npx @the-bearded-bear/bear-craft skill add <name>              # Add a community skill
npx @the-bearded-bear/bear-craft kanban --open                 # Open the Kanban board
```

**Uninstall:**
```bash
rm -rf .claude/ CLAUDE.md .bmad/ ralph.yml                       # Full removal
```

> **Note:** `/bear-gate:*` and `/bear-project:*` require `make install-project TARGET=.` (separate install).
> `/bear-common:getting-started` and `/bear-common:init` require Bear Craft to be installed first.

---

## By Persona

### Developer (Backend/Frontend)

| Task | Command |
|------|---------|
| Start the sprint | `/bear-workflow:start 1` |
| Implement the sprint | `/bear-workflow:implement` (or `--story US-001`) |
| Pre-commit validation | `/bear-gate:check commit` |
| Fix bug with TDD | `/bear-qa:tdd "Login fails with empty password"` |
| Generate CRUD (Symfony) | `/bear-symfony:generate-crud User` |
| Generate component (React) | `/bear-react:generate-component Button` |
| Generate endpoint (Python) | `/bear-python:generate-endpoint /api/users` |
| Continuous loop | `/bear-common:ralph-run "Implement payment module"` |
| Run tests | `/bear-qa:status` |
| Research library docs | context7 MCP (`/deep-research` for web research) |
| Daily standup summary | `/bear-workflow:status --standup` |

### QA / Tester

| Task | Command |
|------|---------|
| Test a story | `/bear-qa:recette --scope=story --id=US-001` |
| Test a sprint | `/bear-qa:recette --scope=sprint --id=Sprint-3` |
| Resume test session | `/bear-qa:recette --resume=REC-20260130-143022` |
| Fix regression | `/bear-qa:fix "User can submit empty form"` |
| Generate regression test | `/bear-qa:regression US-042` |
| Report test results | `/bear-qa:status --report` |

### Tech Lead / Architect

| Task | Command |
|------|---------|
| Full audit (sequential) | `/bear-team:audit --sequential` |
| Full audit (parallel) | `/bear-team:audit` |
| Security review | `/bear-team:security` |
| Pre-merge check | `/bear-gate:check merge` |
| Architecture decision | `/bear-common:architecture-decision "Choose database"` |
| Sprint review | `/bear-workflow:review` |
| Sprint retrospective | `/bear-workflow:retro` |
| Check architecture | `/bear-symfony:check architecture` (or tech-specific) |
| Check security | `/bear-react:check security` (or tech-specific) |
| Setup CI/CD | `/bear-common:setup-ci` |

---

## 20 Installed Namespaces — Top Commands

> **Note:** The namespaces `/gate:` and `/project:` (project management) and the infra namespaces (`/docker:`, `/k8s:`, `/coolify:`, etc.) require a separate install via `make install-project TARGET=.` or `make install-infra TARGET=.`.

### `/common:` - Cross-cutting

```
/bear-common:getting-started           # Interactive onboarding wizard (run first)
/bear-common:init                      # Configure project
/bear-common:ralph-run "task"          # Continuous AI loop (code gates moved to /bear-gate:check commit|merge|release)
/bear-common:setup-rtk                 # Install token optimizer
/bear-common:setup-ci                  # Configure CI/CD
/bear-common:pack-repo                 # Pack codebase for AI
/bear-common:generate-changelog        # Generate CHANGELOG
/bear-common:architecture-decision     # Document ADR
/bear-common:add-technology "nextjs"   # Add new tech stack (bear-craft repo only)
/bear-common:init --context            # Analyze codebase, configure project context
/bear-common:aliases                   # Custom shortcuts and aliases
```

### `/workflow:` - BMAD Workflow (9 commands)

Main path: `init → plan → design → start → implement → review → retro`, with `status` at any time.

```
/bear-workflow:init                    # 1. Detect track / analyze context
/bear-workflow:plan                    # 2. PRD + backlog (--research, --only=prd|backlog)
/bear-workflow:design                  # 3. Tech spec (--constitution)
/bear-workflow:start 1                 # 4. Sprint folder + sprint-status.yaml + tasks
/bear-workflow:implement               # 5. TDD sprint (--story, --epic, --queue, --parallel N)
/bear-workflow:review                  # 6. Sprint review
/bear-workflow:retro                   # 7. Retrospective
/bear-workflow:status                  # Anytime: phase, metrics, next action (--board, --queue, --standup, --gates)
/bear-workflow:auto-sprint 1           # start → … → merge in one run (--from-prd to start from a PRD)
```

### `/team:` - Agent Teams (Parallel)

```
/bear-team:audit                       # Full audit (parallel)
/bear-team:delivery Sprint-3 --phase=implementation  # Sprint implementation (parallel)
/bear-team:security                    # Security review (parallel)
/bear-team:delivery                    # Full lifecycle (write + implement)
```

### `/qa:` - QA & Testing

```
/bear-qa:tdd "bug description"         # Fix with TDD
/bear-qa:recette --scope=story --id=US-001  # Test story
/bear-qa:fix "regression"              # Fix regression
/bear-qa:regression US-042             # Generate regression test
/bear-qa:status                        # Test status
/bear-qa:status --report                        # Test report
```

### `/uiux:` - UI/UX & Accessibility

```
@uiux-orchestrator "task"         # Orchestrate UI/UX/A11y (agent)
/bear-uiux:audit                       # Full UI/UX/A11y audit
/bear-uiux:component-spec Button       # Component spec
/bear-uiux:design-tokens               # Design system tokens
/bear-uiux:user-flow "checkout"        # User journey design
/bear-uiux:a11y-audit                  # WCAG 2.2 AAA audit
/bear-uiux:generate-design-md          # Generate DESIGN.md
```

### `/symfony:` - Symfony/PHP

```
/bear-symfony:generate-crud User       # Generate CRUD
/bear-symfony:api-endpoint /api/users  # Generate API endpoint
/bear-symfony:generate-command app:import  # Generate console command
/bear-symfony:check testing            # Check tests
/bear-symfony:check code-quality       # Check quality
/bear-symfony:check architecture       # Check architecture
/bear-symfony:check security           # Check security
/bear-symfony:optimize-doctrine        # Optimize Doctrine
/bear-symfony:migration-plan           # Migration strategy
/bear-symfony:check all                # All 4 axes, scored /100
```

### `/react:` - React/TypeScript

```
/bear-react:generate-component Button  # Generate component
/bear-react:generate-hook useAuth      # Generate custom hook
/bear-react:storybook-story Button     # Generate Storybook story
/bear-react:accessibility-check        # Check accessibility
/bear-react:bundle-analyze             # Analyze bundle size
/bear-react:check testing              # Check tests
/bear-react:check code-quality         # Check quality
/bear-react:check architecture         # Check architecture
/bear-react:check security             # Check security
/bear-react:check all                  # All 4 axes, scored /100
```

### `/python:` - Python/FastAPI

```
/bear-python:generate-endpoint /api/users  # Generate endpoint
/bear-python:generate-model User       # Generate Pydantic model
/bear-python:dependency-audit          # Check dependencies
/bear-python:type-coverage             # Check type coverage
/bear-python:async-check               # Check async patterns
/bear-python:check testing             # Check tests
/bear-python:check code-quality        # Check quality
/bear-python:check architecture        # Check architecture
/bear-python:check security            # Check security
/bear-python:check all                 # All 4 axes, scored /100
```

### `/flutter:` - Flutter/Dart

```
/bear-flutter:generate-widget UserCard # Generate widget
/bear-flutter:generate-feature auth    # Generate feature module
/bear-flutter:golden-update            # Update golden files
/bear-flutter:analyze-performance      # Performance analysis
/bear-flutter:localization-check       # Check i18n
/bear-flutter:check testing            # Check tests
/bear-flutter:check code-quality       # Check quality
/bear-flutter:check architecture       # Check architecture
/bear-flutter:check security           # Check security
/bear-flutter:check all                # All 4 axes, scored /100
```

### `/angular:` - Angular

```
/bear-angular:generate-component Button  # Generate component
/bear-angular:check testing            # Check tests
/bear-angular:check code-quality       # Check quality
/bear-angular:check architecture       # Check architecture
/bear-angular:check security           # Check security
/bear-angular:check all                # All 4 axes, scored /100
```

### `/vuejs:` - Vue.js

```
/bear-vuejs:generate-component Button  # Generate component
/bear-vuejs:check testing              # Check tests
/bear-vuejs:check code-quality         # Check quality
/bear-vuejs:check architecture         # Check architecture
/bear-vuejs:check security             # Check security
/bear-vuejs:check all                  # All 4 axes, scored /100
```

### `/laravel:` - Laravel/PHP

```
/bear-laravel:generate-controller UserController  # Generate controller
/bear-laravel:check testing            # Check tests
/bear-laravel:check code-quality       # Check quality
/bear-laravel:check architecture       # Check architecture
/bear-laravel:check security           # Check security
/bear-laravel:check all                # All 4 axes, scored /100
```

### `/reactnative:` - React Native

```
/bear-reactnative:generate-screen Home # Generate screen
/bear-reactnative:native-module Camera # Generate native module
/bear-reactnative:deep-link            # Configure deep links
/bear-reactnative:app-size             # Analyze app size
/bear-reactnative:store-prepare        # Prepare for app stores
/bear-reactnative:check testing        # Check tests
/bear-reactnative:check code-quality   # Check quality
/bear-reactnative:check architecture   # Check architecture
/bear-reactnative:check security       # Check security
/bear-reactnative:check all            # All 4 axes, scored /100
```

### `/csharp:` - C#/.NET

```
/bear-csharp:generate-feature Auth     # Generate feature (CQRS)
/bear-csharp:check testing             # Check tests
/bear-csharp:check code-quality        # Check quality
/bear-csharp:check architecture        # Check architecture
/bear-csharp:check security            # Check security
/bear-csharp:check all                 # All 4 axes, scored /100
```

### `/php:` - PHP (Generic)

```
/bear-php:check testing                # Check tests
/bear-php:check code-quality           # Check quality
/bear-php:check architecture           # Check architecture
/bear-php:check security               # Check security
/bear-php:check all                    # All 4 axes, scored /100
```

### `/ruby:` - Ruby / Rails

```
/bear-ruby:check security              # Check security (Brakeman, strong params)
/bear-ruby:check testing               # Check tests
/bear-ruby:check all                   # All 4 axes, scored /100
```

### `/rust:` - Rust / Axum

```
/bear-rust:check architecture          # Check workspace layering, Axum Router/State
/bear-rust:check security              # Check security (SQLx, unsafe, cargo-deny)
/bear-rust:check testing               # Check tests
/bear-rust:check all                   # All 4 axes, scored /100
```

### `/tauri:` - Tauri

```
/bear-tauri:check architecture         # Check src-tauri layout, commands, state, plugins
/bear-tauri:check security             # Check capabilities, CSP, Isolation, updater signing
/bear-tauri:check testing              # Check tests (mock runtime, mockIPC, E2E)
/bear-tauri:check all                  # All 4 axes, scored /100
```

### `/wordpress:` - WordPress

```
/bear-wordpress:check architecture     # Check plugin/theme layout, hooks, blocks, REST
/bear-wordpress:check security         # Check capabilities, nonces, escaping, $wpdb->prepare
/bear-wordpress:check testing          # Check tests (WP_UnitTestCase, wp-scripts, Playwright)
/bear-wordpress:check all              # All 4 axes, scored /100 (+ WooCommerce if used)
```

### `/vite:` - Vite (framework-agnostic)

```
/bear-vite:scaffold-project            # Scaffold a vanilla/lit project
/bear-vite:check-library-build         # Validate build.lib / vite-plugin-dts output
/bear-vite:check architecture          # Check architecture
/bear-vite:check all                   # All 4 axes, scored /100
```

### `/vercel:` - Vercel (deployment platform)

```
/bear-vercel:deploy-config             # Generate vercel.json
/bear-vercel:check security            # Check security
/bear-vercel:check all                 # All 4 axes, scored /100
```

### `/paperclip:` - Paperclip Orchestration

```
/bear-paperclip:check architecture     # Check architecture (control plane + adapters)
/bear-paperclip:check code-quality     # Check code quality
/bear-paperclip:check security         # Check security
/bear-paperclip:check testing          # Check tests
/bear-paperclip:check all              # All 4 axes, scored /100
/bear-paperclip:generate-feature       # Generate feature module
/bear-paperclip:api-endpoint           # Generate API endpoint
/bear-paperclip:generate-command       # Generate CLI command
```

### Removed in 9.0

The sprint namespace and 52 deprecated PM commands were removed in 9.0; see [MIGRATION-v9.md](MIGRATION-v9.md) for the old → new table.

### `/gate:` - Quality Gates

> **Prerequisite:** `make install-project TARGET=.`

```
/bear-gate:check prd                   # PRD gate (>= 80%)
/bear-gate:check spec                  # Tech Spec gate (>= 90%)
/bear-gate:check backlog               # Backlog / INVEST gate (6/6)
/bear-gate:check sprint                # Sprint Ready gate
/bear-gate:check story US-001          # Story DoD gate
/bear-gate:check alignment             # Spec-code alignment gate (>= 85%)
/bear-gate:check all                   # All 4 axes, scored /100
/bear-gate:check commit|merge|release  # Code gates (ex /bear-common:pre-*-check, release-checklist)
/bear-gate:check --phase=pre-sprint    # Lifecycle checkpoint (pre-sprint|pre-impl|post-impl|pre-merge)
```

### `/project:` - Project Management (5 commands)

```
/bear-project:backlog add epic|story|task      # Create (also: list, edit, move task)
/bear-project:backlog list story               # List EPICs / stories / tasks
/bear-project:backlog move task TASK-001 done  # Change task status
/bear-project:reverse scan|prd|stories|gaps|all  # Brownfield reverse engineering
/bear-project:trace [--gaps] [--by-priority]   # Traceability matrix / coverage
/bear-project:report burndown|metrics|deps [--critical]  # Sprint reports
/bear-project:migrate [--analyze|--stories|--resync|--dry-run]  # Backlog to BMAD v6
/bear-project:backlog next story --claim       # Next ready story
/bear-project:backlog move story US-001 done  # Transition a story (--auto for routing rules)
```

> The 52 former PM commands (e.g. add-epic, validate-prd, run-sprint) were removed in 9.0: see [MIGRATION-v9.md](MIGRATION-v9.md).


---

## Ralph Wiggum - Continuous Loop

Ralph runs Claude iteratively until all DoD validators pass.

```bash
/bear-common:ralph-run "Implement user registration"
/bear-common:ralph-run --full "Fix login bug"
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
/bear-qa:recette --scope=story --id=US-001
/bear-qa:recette --scope=sprint --id=Sprint-3
/bear-qa:recette --resume=REC-20260130-143022
```

Prerequisites: Chrome extension v1.0.36+

---

## Token Optimization

```bash
/bear-common:setup-rtk                 # Install RTK (60-90% token savings)
export CLAUDE_CODE_SUBAGENT_MODEL=sonnet  # Cheaper subagents
```

---

## Best Practices

| Practice | Command |
|----------|---------|
| Clear context between tasks | `/clear` |
| Use Plan Mode for complex tasks | Automatic for `generate-*` commands |
| Validate before commit | `/bear-gate:check commit` |
| Validate before merge | `/bear-gate:check merge` |
| Use parallel teams for 2+ stacks | `/bear-team:audit` (vs `--sequential`) |
| Use Ralph for long tasks | `/bear-common:ralph-run "task"` |
| Research with Context7 | context7 MCP, or `/deep-research` |
| Multi-agent concurrent | `@tdd-coach @react-reviewer Implement this feature` |
| Reload skills without restart | `/reload-skills` (v2.1.157+) |

---

## Shortcuts & Aliases

```bash
/bear-common:aliases                   # View and configure custom aliases
```

Configure keyboard shortcuts in `~/.claude/keybindings.json` for your 5 most frequent commands:
- `/bear-gate:check commit` → `Ctrl+Shift+P`
- `/bear-common:ralph-run` → `Ctrl+Shift+R`
- `/bear-qa:tdd` → `Ctrl+Shift+T`
- `/bear-workflow:status` → `Ctrl+Shift+S`
- `/clear` → `Ctrl+Shift+C`

See `~/.claude/keybindings.json` for the full configuration.

---

## Kanban Board

```bash
npx @the-bearded-bear/bear-craft kanban --open   # Open in the browser
npx @the-bearded-bear/bear-craft kanban          # Start the local server (port 3737; --port=<n> to change it)
```

The Kanban board reads `.bmad/sprint-status.yaml` and lets you move, create, edit and delete stories and plan, start and close sprints (`--readonly` disables all writes). No SaaS dependency.
Requires `make install-project TARGET=.` for BMAD v6 story generation.

---

## Emergency Commands

| Situation | Command |
|-----------|---------|
| Context overload | `/clear` |
| Need plan before action | `/bear-workflow:plan "feature"` |
| Broken tests | `/bear-qa:tdd "test description"` |
| Security vulnerability | `/bear-team:security` |
| Pre-release panic | `/bear-gate:check release` |
| Need to pack repo | `/bear-common:pack-repo --format=xml` |

---

## See Also

- [LEARNING-PATHS.md](LEARNING-PATHS.md) - Progressive learning paths
- [COMMANDS.md](COMMANDS.md) - Full command reference
- [RALPH-GUIDE.md](RALPH-GUIDE.md) - Ralph Wiggum guide
- [AGENT-TEAMS-GUIDE.md](AGENT-TEAMS-GUIDE.md) - Agent Teams guide
- [QUICKSTART.md](QUICKSTART.md) - Getting started
