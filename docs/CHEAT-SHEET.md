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
/gate:check commit            # Validate before commit
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

> **Note:** `/gate:*` and `/project:*` require `make install-project TARGET=.` (separate install).
> `/common:getting-started` and `/common:init` require Claude Craft to be installed first.

---

## By Persona

### Developer (Backend/Frontend)

| Task | Command |
|------|---------|
| Start the sprint | `/workflow:start 1` |
| Implement the sprint | `/workflow:implement` (or `--story US-001`) |
| Pre-commit validation | `/gate:check commit` |
| Fix bug with TDD | `/qa:tdd "Login fails with empty password"` |
| Generate CRUD (Symfony) | `/symfony:generate-crud User` |
| Generate component (React) | `/react:generate-component Button` |
| Generate endpoint (Python) | `/python:generate-endpoint /api/users` |
| Continuous loop | `/common:ralph-run "Implement payment module"` |
| Run tests | `/qa:status` |
| Research tech topic | `/common:research-context7 "FastAPI best practices"` |
| Daily standup summary | `/workflow:status --standup` |

### QA / Tester

| Task | Command |
|------|---------|
| Test a story | `/qa:recette --scope=story --id=US-001` |
| Test a sprint | `/qa:recette --scope=sprint --id=Sprint-3` |
| Resume test session | `/qa:recette --resume=REC-20260130-143022` |
| Fix regression | `/qa:fix "User can submit empty form"` |
| Generate regression test | `/qa:regression US-042` |
| Report test results | `/qa:status --report` |

### Tech Lead / Architect

| Task | Command |
|------|---------|
| Full audit (sequential) | `/team:audit --sequential` |
| Full audit (parallel) | `/team:audit` |
| Security review | `/team:security` |
| Pre-merge check | `/gate:check merge` |
| Architecture decision | `/common:architecture-decision "Choose database"` |
| Sprint review | `/workflow:review` |
| Sprint retrospective | `/workflow:retro` |
| Check architecture | `/symfony:check-architecture` (or tech-specific) |
| Check security | `/react:check-security` (or tech-specific) |
| Setup CI/CD | `/common:setup-ci` |

---

## 20 Installed Namespaces — Top Commands

> **Note:** The namespaces `/gate:` and `/project:` (project management) and the infra namespaces (`/docker:`, `/k8s:`, `/coolify:`, etc.) require a separate install via `make install-project TARGET=.` or `make install-infra TARGET=.`.

### `/common:` - Cross-cutting

```
/common:getting-started           # Interactive onboarding wizard (run first)
/common:init                      # Configure project
/common:ralph-run "task"          # Continuous AI loop (code gates moved to /gate:check commit|merge|release)
/common:setup-rtk                 # Install token optimizer
/common:setup-ci                  # Configure CI/CD
/common:pack-repo                 # Pack codebase for AI
/common:research-context7 "topic" # Deep research
/common:generate-changelog        # Generate CHANGELOG
/common:architecture-decision     # Document ADR
/common:add-technology "nextjs"   # Add new tech stack (claude-craft repo only)
/common:init --context            # Analyze codebase, configure project context
/common:aliases                   # Custom shortcuts and aliases
```

### `/workflow:` - BMAD Workflow (9 commands)

Main path: `init → plan → design → start → implement → review → retro`, with `status` at any time.

```
/workflow:init                    # 1. Detect track / analyze context
/workflow:plan                    # 2. PRD + backlog (--research, --only=prd|backlog)
/workflow:design                  # 3. Tech spec (--constitution)
/workflow:start 1                 # 4. Sprint folder + sprint-status.yaml + tasks
/workflow:implement               # 5. TDD sprint (--story, --epic, --queue, --parallel N)
/workflow:review                  # 6. Sprint review
/workflow:retro                   # 7. Retrospective
/workflow:status                  # Anytime: phase, metrics, next action (--board, --queue, --standup, --gates)
/workflow:auto-sprint 1           # start → … → merge in one run (--from-prd to start from a PRD)
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
/qa:status --report                        # Test report
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

### `/sprint:` - Deprecated

The 5 `/sprint:*` commands are redirect stubs (removed in 9.0): `/sprint:dev` → `/workflow:implement`, `/sprint:status` → `/workflow:status`, `/sprint:next-story` → `/project:backlog next story`, `/sprint:transition` → `/project:backlog move story <US> <status>`, `/sprint:auto-route` → `/project:backlog move story --auto`.

### `/gate:` - Quality Gates

> **Prerequisite:** `make install-project TARGET=.`

```
/gate:check prd                   # PRD gate (>= 80%)
/gate:check spec                  # Tech Spec gate (>= 90%)
/gate:check backlog               # Backlog / INVEST gate (6/6)
/gate:check sprint                # Sprint Ready gate
/gate:check story US-001          # Story DoD gate
/gate:check alignment             # Spec-code alignment gate (>= 85%)
/gate:check all                   # Report of all document gates
/gate:check commit|merge|release  # Code gates (ex /common:pre-*-check, release-checklist)
/gate:check --phase=pre-sprint    # Lifecycle checkpoint (pre-sprint|pre-impl|post-impl|pre-merge)
```

### `/project:` - Project Management (5 commands)

```
/project:backlog add epic|story|task      # Create (also: list, edit, move task)
/project:backlog list story               # List EPICs / stories / tasks
/project:backlog move task TASK-001 done  # Change task status
/project:reverse scan|prd|stories|gaps|all  # Brownfield reverse engineering
/project:trace [--gaps] [--by-priority]   # Traceability matrix / coverage
/project:report burndown|metrics|deps [--critical]  # Sprint reports
/project:migrate [--analyze|--stories|--resync|--dry-run]  # Backlog to BMAD v6
/project:backlog next story --claim       # Next ready story
/project:backlog move story US-001 done  # Transition a story (--auto for routing rules)
```

> The 52 former commands (`/project:add-epic`, `/gate:validate-prd`, `/sprint:dev`, `/project:run-sprint`...) are deprecated redirect stubs removed in 9.0: see "Deprecated commands" in `docs/COMMANDS.md`.


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
| Validate before commit | `/gate:check commit` |
| Validate before merge | `/gate:check merge` |
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
- `/gate:check commit` → `Ctrl+Shift+P`
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
| Pre-release panic | `/gate:check release` |
| Need to pack repo | `/common:pack-repo --format=xml` |

---

## See Also

- [LEARNING-PATHS.md](LEARNING-PATHS.md) - Progressive learning paths
- [COMMANDS.md](COMMANDS.md) - Full command reference
- [RALPH-GUIDE.md](RALPH-GUIDE.md) - Ralph Wiggum guide
- [AGENT-TEAMS-GUIDE.md](AGENT-TEAMS-GUIDE.md) - Agent Teams guide
- [QUICKSTART.md](QUICKSTART.md) - Getting started
