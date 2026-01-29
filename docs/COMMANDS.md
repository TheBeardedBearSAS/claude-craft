# Commands Reference

Claude Code commands are slash commands that automate workflows and provide structured assistance.

## How to Use Commands

Type a slash command in Claude Code:

```
/common:pre-commit-check
/symfony:generate-crud User
/react:generate-component Button
```

Commands can take arguments:
```
/command:name argument1 argument2
```

## Command Namespaces

| Namespace | Technology | Count |
|-----------|------------|-------|
| `/common:` | Transversal | 24 |
| `/symfony:` | PHP/Symfony | 10 |
| `/flutter:` | Dart/Flutter | 10 |
| `/python:` | Python | 10 |
| `/react:` | React/TypeScript | 8 |
| `/reactnative:` | React Native | 7 |
| `/angular:` | Angular | 6 |
| `/csharp:` | C#/.NET | 6 |
| `/laravel:` | PHP/Laravel | 6 |
| `/vuejs:` | Vue.js | 6 |
| `/docker:` | Docker/Infrastructure | 4 |
| `/project:` | Project Management | 24 |
| `/sprint:` | Sprint Management (BMAD v6) | 4 |
| `/gate:` | Quality Gates (BMAD v6) | 6 |

---

## Common Commands (`/common:`)

Transversal commands for all projects.

### Workflow Commands

| Command | Description |
|---------|-------------|
| `/common:pre-commit-check` | Validate code before commit |
| `/common:pre-merge-check` | Validate code before merge |
| `/common:full-audit` | Complete project audit |
| `/common:release-checklist` | Pre-release validation |

### Generation Commands

| Command | Description |
|---------|-------------|
| `/common:generate-changelog` | Generate changelog from commits |
| `/common:architecture-decision` | Document an ADR |

### Sprint Commands

| Command | Description |
|---------|-------------|
| `/common:sprint-start` | Initialize a new sprint |
| `/common:sprint-review` | Generate sprint review summary |
| `/common:sprint-retro` | Conduct sprint retrospective |
| `/common:daily-standup` | Generate standup summary |

### Configuration Commands

| Command | Description |
|---------|-------------|
| `/common:setup-project-context` | Interactive project context configuration |

### Continuous Loop Commands

| Command | Description |
|---------|-------------|
| `/common:ralph-run` | Run Claude in continuous loop until DoD passes |

Ralph Wiggum executes Claude iteratively until the task is complete:

```bash
/common:ralph-run "Implement user authentication"
/common:ralph-run --full "Fix the login bug"  # With all DoD checks
```

**Definition of Done validators:**
- `command`: Run tests, lint, build
- `output_contains`: Check for completion marker
- `file_changed`: Verify documentation updated
- `hook`: Integrate with quality-gate.sh
- `human`: Manual approval gate

### DevOps Commands

| Command | Description |
|---------|-------------|
| `/common:setup-ci` | Configure CI/CD pipeline |
| `/common:docker-optimize` | Optimize Docker configuration |

### Development Commands

| Command | Description |
|---------|-------------|
| `/common:fix-bug-tdd` | Fix bug using TDD methodology |
| `/common:research-context7` | Deep technical research |

### UI/UX Commands

| Command | Description |
|---------|-------------|
| `/common:uiux-orchestrator` | Orchestrate UI, UX, and A11y experts for a task |
| `/common:uiux-audit` | Complete UI/UX/Accessibility audit |
| `/common:uiux-component-spec` | Full component specification (UI + UX + A11y) |
| `/common:ui-design-tokens` | Define design system tokens |
| `/common:ux-user-flow` | Design user journey and flow |
| `/common:a11y-audit` | WCAG 2.2 AAA accessibility audit |
| `/common:a11y-component` | Accessibility specs for a component |

### Technology Commands

| Command | Description |
|---------|-------------|
| `/common:add-technology` | Add a new technology to claude-craft |

Add a complete technology stack to claude-craft with best practices:

```bash
/common:add-technology "nextjs"
/common:add-technology "golang" backend
```

**Features:**
- **Context7 MCP research**: Official documentation, best practices, design patterns
- **Web search**: 2026 trends, community practices, common pitfalls
- **Full generation**: Rules, commands, templates, skills, agents (5 languages)
- **Installation script**: `install-{tech}-rules.sh`
- **Documentation updates**: README, landing page, Makefile

**Definition of Done:**
- [ ] Rules (7 files × 5 languages)
- [ ] Commands (5 files × 5 languages)
- [ ] Installation script created
- [ ] README.md updated
- [ ] docs/index.html updated (stats + tech card)
- [ ] Makefile target added

---

## Symfony Commands (`/symfony:`)

PHP backend development with Symfony.

### Code Generation

| Command | Description |
|---------|-------------|
| `/symfony:generate-crud <Entity>` | Generate CRUD operations |
| `/symfony:generate-command <Name>` | Generate CLI command |
| `/symfony:api-endpoint <Resource>` | Generate API endpoint |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/symfony:check-architecture` | Validate Clean Architecture |
| `/symfony:check-code-quality` | Run code quality checks |
| `/symfony:check-compliance` | Check DDD compliance |
| `/symfony:check-security` | Security audit |
| `/symfony:check-testing` | Test coverage analysis |

### Database Commands

| Command | Description |
|---------|-------------|
| `/symfony:migration-plan <Change>` | Plan database migration |
| `/symfony:optimize-doctrine` | Optimize Doctrine queries |

---

## Flutter Commands (`/flutter:`)

Mobile development with Flutter/Dart.

### Code Generation

| Command | Description |
|---------|-------------|
| `/flutter:generate-feature <Name>` | Generate feature module |
| `/flutter:generate-widget <Name>` | Generate widget |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/flutter:check-architecture` | Validate architecture |
| `/flutter:check-code-quality` | Run code quality checks |
| `/flutter:check-compliance` | Check rule compliance |
| `/flutter:check-security` | Security audit |
| `/flutter:check-testing` | Test coverage analysis |
| `/flutter:analyze-performance` | Performance analysis |

### Testing Commands

| Command | Description |
|---------|-------------|
| `/flutter:golden-update` | Update golden files |

### Localization Commands

| Command | Description |
|---------|-------------|
| `/flutter:localization-check` | Validate i18n setup |

---

## Python Commands (`/python:`)

Python backend and API development.

### Code Generation

| Command | Description |
|---------|-------------|
| `/python:generate-endpoint <Name>` | Generate API endpoint |
| `/python:generate-model <Name>` | Generate data model |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/python:check-architecture` | Validate architecture |
| `/python:check-code-quality` | Run code quality checks |
| `/python:check-compliance` | Check rule compliance |
| `/python:check-security` | Security audit |
| `/python:check-testing` | Test coverage analysis |

### Type Commands

| Command | Description |
|---------|-------------|
| `/python:type-coverage` | Analyze type hint coverage |

### Async Commands

| Command | Description |
|---------|-------------|
| `/python:async-check` | Validate async/await usage |

### Dependency Commands

| Command | Description |
|---------|-------------|
| `/python:dependency-audit` | Audit dependencies for vulnerabilities |

---

## React Commands (`/react:`)

Frontend development with React/TypeScript.

### Code Generation

| Command | Description |
|---------|-------------|
| `/react:generate-component <Name>` | Generate React component |
| `/react:generate-hook <Name>` | Generate custom hook |
| `/react:storybook-story <Component>` | Generate Storybook story |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/react:check-architecture` | Validate architecture |
| `/react:check-code-quality` | Run code quality checks |
| `/react:check-compliance` | Check rule compliance |
| `/react:check-security` | Security audit |
| `/react:check-testing` | Test coverage analysis |

### Performance Commands

| Command | Description |
|---------|-------------|
| `/react:bundle-analyze` | Analyze bundle size |

### Accessibility Commands

| Command | Description |
|---------|-------------|
| `/react:accessibility-check` | A11y validation |

---

## React Native Commands (`/reactnative:`)

Mobile development with React Native.

### Code Generation

| Command | Description |
|---------|-------------|
| `/reactnative:generate-screen <Name>` | Generate screen component |
| `/reactnative:native-module <Name>` | Generate native module |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/reactnative:check-architecture` | Validate architecture |
| `/reactnative:check-code-quality` | Run code quality checks |
| `/reactnative:check-compliance` | Check rule compliance |
| `/reactnative:check-security` | Security audit |
| `/reactnative:check-testing` | Test coverage analysis |

### App Commands

| Command | Description |
|---------|-------------|
| `/reactnative:app-size` | Analyze app bundle size |
| `/reactnative:deep-link <Route>` | Configure deep linking |
| `/reactnative:store-prepare` | Prepare for app store |

---

## Angular Commands (`/angular:`)

Frontend development with Angular standalone components and signals.

### Code Generation

| Command | Description |
|---------|-------------|
| `/angular:generate-component <Name>` | Generate standalone component with tests |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/angular:check-architecture` | Validate architecture (domain-driven, smart/dumb) |
| `/angular:check-code-quality` | Run code quality checks (signals, OnPush, RxJS) |
| `/angular:check-compliance` | Check rule compliance (standalone, modern syntax) |
| `/angular:check-security` | Security audit (XSS, CSRF, authentication) |
| `/angular:check-testing` | Test coverage analysis (Vitest/Jest, Cypress) |

---

## C#/.NET Commands (`/csharp:`)

Backend development with C#/.NET, Clean Architecture, and CQRS.

### Code Generation

| Command | Description |
|---------|-------------|
| `/csharp:generate-feature <Name>` | Generate complete CQRS feature (entity, commands, queries, endpoints) |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/csharp:check-architecture` | Validate Clean Architecture (layers, dependencies) |
| `/csharp:check-code-quality` | Run code quality checks (async, LINQ, null safety) |
| `/csharp:check-compliance` | Check rule compliance (CQRS, DDD, modern C#) |
| `/csharp:check-security` | Security audit (OWASP Top 10, injection, auth) |
| `/csharp:check-testing` | Test coverage analysis (xUnit, integration tests) |

---

## Laravel Commands (`/laravel:`)

PHP backend development with Laravel, Clean Architecture, and Pest PHP.

### Code Generation

| Command | Description |
|---------|-------------|
| `/laravel:generate-controller <Name>` | Generate API controller with Form Request, Resource, and Policy |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/laravel:check-architecture` | Validate Clean Architecture (layers, dependencies) |
| `/laravel:check-code-quality` | Run code quality checks (PHPStan, Pint, N+1) |
| `/laravel:check-compliance` | Check rule compliance (Actions, DTOs, modern PHP) |
| `/laravel:check-security` | Security audit (OWASP Top 10, Sanctum, validation) |
| `/laravel:check-testing` | Test coverage analysis (Pest PHP, factories) |

---

## Vue.js Commands (`/vuejs:`)

Frontend development with Vue.js 3, Composition API, and TypeScript.

### Code Generation

| Command | Description |
|---------|-------------|
| `/vuejs:generate-component <Name>` | Generate component with test, types, and Storybook story |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/vuejs:check-architecture` | Validate architecture (modules, components, stores) |
| `/vuejs:check-code-quality` | Run code quality checks (ESLint, TypeScript, Prettier) |
| `/vuejs:check-compliance` | Check rule compliance (Composition API, Pinia, modern Vue) |
| `/vuejs:check-security` | Security audit (XSS, CSRF, authentication) |
| `/vuejs:check-testing` | Test coverage analysis (Vitest, Vue Test Utils) |

---

## Docker Commands (`/docker:`)

Infrastructure and containerization commands.

### Setup Commands

| Command | Description |
|---------|-------------|
| `/docker:compose-setup <Services>` | Generate docker-compose configuration |
| `/docker:architecture <Project>` | Design complete Docker architecture |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/docker:debug <Symptom>` | Diagnose Docker issues |
| `/docker:cicd-pipeline <Platform>` | Generate CI/CD pipeline |

---

## Project Commands (`/project:`)

Available with Project installation.

| Command | Description |
|---------|-------------|
| `/project:generate-backlog <Feature>` | Generate backlog |
| `/project:validate-backlog` | Validate backlog quality |
| `/project:decompose-tasks <Epic>` | Break down epic into tasks |
| `/project:add-epic <Name>` | Create a new EPIC |
| `/project:add-story <Epic> <Name>` | Create a User Story |
| `/project:add-task <US> <Desc> <Est>` | Create a task |
| `/project:list-epics` | List all EPICs |
| `/project:list-stories` | List User Stories |
| `/project:list-tasks` | List tasks |
| `/project:move-story <US> <Dest>` | Move story to sprint/status |
| `/project:move-task <Task> <Status>` | Change task status |
| `/project:board` | Display Kanban board |
| `/project:sprint-status` | Show sprint metrics |
| `/project:update-epic <Epic>` | Update an EPIC |
| `/project:update-story <US>` | Update a User Story |
| `/project:sprint-dev <N\|next>` | **Start TDD/BDD sprint development** |

### BMAD v6 Commands (NEW)

| Command | Description |
|---------|-------------|
| `/project:analyze-backlog` | Analyze current backlog structure |
| `/project:migrate-backlog` | Convert backlog to BMAD v6 format |
| `/project:update-stories` | Add missing BMAD fields to stories |
| `/project:sync-backlog` | Synchronize backlog files ↔ YAML |
| `/project:run-epic <ID>` | Queue all stories in an epic |
| `/project:run-queue` | Process queued stories |
| `/project:run-sprint` | Execute full sprint |
| `/project:batch-status` | View batch queue status |

### Sprint Development (`/project:sprint-dev`)

Orchestrates complete sprint development in TDD/BDD mode:

```bash
/project:sprint-dev 1        # Sprint 1
/project:sprint-dev next     # Next incomplete sprint
/project:sprint-dev current  # Currently active sprint
```

**Features:**
- **Mandatory plan mode** before each task implementation
- **TDD cycle** (RED → GREEN → REFACTOR)
- **Automatic status updates** (Task → User Story → Sprint)
- **Progress tracking** with metrics

**Workflow:**
1. Load sprint and display board
2. For each User Story (by priority):
   - Mark US → In Progress
   - Display acceptance criteria (Gherkin)
3. For each Task (by type: DB → BE → FE → TEST → DOC → REV):
   - **Plan Mode** (mandatory): Analyze code, propose implementation
   - **TDD Cycle**: Write failing tests → Implement → Refactor
   - **Definition of Done** check
   - Mark Task → Done with time tracking
   - Conventional commit
4. When all tasks done → Mark US → Done
5. When all US done → Generate sprint review/retro

**Control commands during execution:**
| Command | Action |
|---------|--------|
| `continue` | Validate plan and implement |
| `skip` | Skip this task |
| `block [reason]` | Mark as blocked |
| `stop` | Stop (saves state) |

---

## Sprint Management Commands (`/sprint:`)

Available with BMAD v6 installation.

| Command | Description |
|---------|-------------|
| `/sprint:bmad-status` | Display sprint status with routing info |
| `/sprint:next-story` | Get next ready-for-dev story |
| `/sprint:transition <ID> <status>` | Transition story status |
| `/sprint:auto-route` | Execute automatic routing rules |

### State Machine

Stories flow through these statuses:

```
backlog → ready-for-dev → in-progress → review → done
    ↓         ↓              ↓           ↓
    └─────────┴──────────────┴───────────┴→ blocked
```

**TDD Phase Tracking:**
- 🔴 `red` - Writing failing tests
- 🟢 `green` - Implementing to pass
- 🔵 `refactor` - Cleaning up code

---

## Quality Gate Commands (`/gate:`)

Available with BMAD v6 installation.

| Command | Description |
|---------|-------------|
| `/gate:validate-prd` | Validate PRD (≥80% threshold) |
| `/gate:validate-techspec` | Validate Tech Spec (≥90% threshold) |
| `/gate:validate-backlog` | Validate INVEST compliance |
| `/gate:validate-story <ID>` | Validate story Definition of Done |
| `/gate:validate-sprint` | Validate sprint readiness |
| `/gate:report` | Full quality gates report |

### Quality Gate Thresholds

| Gate | Threshold | Criteria |
|------|-----------|----------|
| PRD Gate | ≥80% | Problem, users, goals, metrics, scope |
| Tech Spec Gate | ≥90% | Architecture, security, testing, deployment |
| Backlog Gate | 6/6 INVEST | Independent, Negotiable, Valuable, Estimable, Small, Testable |
| Story DoD | 100% | Tasks, tests, AC, review, no blockers |
| Sprint Ready | 100% | Metadata, goal, stories ready, estimated |

---

## Command Output Formats

Commands typically output in structured formats:

### Audit Commands

```
══════════════════════════════════════════════════════════════
AUDIT REPORT
══════════════════════════════════════════════════════════════

[ ] Issue 1
[x] Check passed
[ ] Issue 2

Summary: 2 issues found
```

### Generation Commands

```
Generated files:
- src/Component/NewComponent.tsx
- src/Component/NewComponent.test.tsx
- src/Component/NewComponent.stories.tsx
```

### Check Commands

```
Architecture Check
──────────────────────────────────────────────────────────────
✓ Layer separation: PASS
✗ Dependency direction: FAIL
  - Infrastructure depends on Domain (src/Infra/Service.php:15)

Score: 85/100
```

---

## Command Frontmatter Format

All commands include YAML frontmatter for Claude Code discovery:

```markdown
---
description: Brief description of what the command does
argument-hint: <required-arg> [optional-arg]
---

# Command Title

Command content...
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `description` | Yes | Brief description shown in command list |
| `argument-hint` | No | Shows expected arguments format |

### Examples

**Command with arguments:**

```markdown
---
description: Generate CRUD operations for an entity with Clean Architecture
argument-hint: <EntityName>
---

# Generate CRUD

Generate complete CRUD operations for $ARGUMENTS...
```

**Command without arguments:**

```markdown
---
description: Run all pre-commit checks (tests, lint, security)
---

# Pre-Commit Check

Execute all validation checks before committing...
```

### Variable Substitution

Commands can use these variables:

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | All arguments passed after command name |
| `$ARG1`, `$ARG2`... | Individual positional arguments |

---

## Creating Custom Commands

Add markdown files to `.claude/commands/{namespace}/`:

```markdown
---
description: What this command does
argument-hint: <arg1> [arg2]
---

# My Custom Command

Description of what this command does.

## Arguments
$ARGUMENTS

## Process

### Step 1
What to do first...

### Step 2
What to do next...

## Output
Expected output format...
```

Place in:
- `.claude/commands/common/` for `/common:` namespace
- `.claude/commands/myproject/` for `/myproject:` namespace

---

## Best Practices

1. **Use check commands** before commits
2. **Generate with commands** for consistent code
3. **Audit regularly** with full-audit
4. **Document decisions** with architecture-decision
5. **Track sprints** with sprint commands
