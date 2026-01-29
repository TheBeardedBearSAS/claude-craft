# Commands Full Reference

Complete reference for all 127+ commands available in Claude Craft.

---

## Quick Reference

| Namespace | Count | Description |
|-----------|-------|-------------|
| `/common:` | 24 | Transversal commands |
| `/workflow:` | 6 | Development workflow |
| `/project:` | 24 | Project management |
| `/sprint:` | 4 | Sprint management (BMAD) |
| `/gate:` | 6 | Quality gates (BMAD) |
| `/bmad:` | 4 | BMAD orchestration |
| `/pm:` | 5 | Product Manager |
| `/arch:` | 6 | Architect |
| `/symfony:` | 10 | Symfony/PHP |
| `/flutter:` | 10 | Flutter/Dart |
| `/python:` | 10 | Python |
| `/react:` | 8 | React |
| `/reactnative:` | 7 | React Native |
| `/angular:` | 6 | Angular |
| `/csharp:` | 6 | C#/.NET |
| `/laravel:` | 6 | Laravel |
| `/vuejs:` | 6 | Vue.js |
| `/php:` | 5 | PHP |
| `/docker:` | 4 | Docker |

---

## Common Commands (`/common:`)

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
| `/common:setup-project-context` | Interactive project context setup |

### Ralph Commands

| Command | Description |
|---------|-------------|
| `/common:ralph-run` | Run Claude in continuous loop |

**Usage:**
```
/common:ralph-run "Task description"
/common:ralph-run --full "Task with all DoD checks"
```

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
| `/common:uiux-orchestrator` | Orchestrate UI/UX/A11y experts |
| `/common:uiux-audit` | Complete UI/UX/A11y audit |
| `/common:uiux-component-spec` | Full component specification |
| `/common:ui-design-tokens` | Define design system tokens |
| `/common:ux-user-flow` | Design user journey |
| `/common:a11y-audit` | WCAG 2.2 AAA audit |
| `/common:a11y-component` | Accessibility specs for component |

### Technology Commands

| Command | Description |
|---------|-------------|
| `/common:add-technology` | Add new technology to Claude Craft |

**Usage:**
```
/common:add-technology "nextjs"
/common:add-technology "golang" backend
```

---

## Workflow Commands (`/workflow:`)

| Command | Description | Phase |
|---------|-------------|-------|
| `/workflow:init` | Initialize workflow (auto-detect track) | Setup |
| `/workflow:analyze` | Research and exploration | Analysis |
| `/workflow:plan` | Generate PRD, backlog | Planning |
| `/workflow:design` | Tech spec, architecture | Design |
| `/workflow:implement` | Sprint development | Implementation |
| `/workflow:status` | Show current progress | Any |

**Usage:**
```
/workflow:init              # Auto-detect
/workflow:init --quick      # Bug fix mode
/workflow:init --enterprise # Full methodology
```

---

## Project Commands (`/project:`)

### Backlog Management

| Command | Description |
|---------|-------------|
| `/project:generate-backlog` | Generate backlog from feature |
| `/project:validate-backlog` | Validate backlog quality |
| `/project:decompose-tasks` | Break epic into tasks |

### Epic/Story/Task

| Command | Description |
|---------|-------------|
| `/project:add-epic` | Create a new EPIC |
| `/project:add-story` | Create a User Story |
| `/project:add-task` | Create a task |
| `/project:list-epics` | List all EPICs |
| `/project:list-stories` | List User Stories |
| `/project:list-tasks` | List tasks |
| `/project:update-epic` | Update an EPIC |
| `/project:update-story` | Update a User Story |
| `/project:move-story` | Move story to sprint/status |
| `/project:move-task` | Change task status |

### Sprint

| Command | Description |
|---------|-------------|
| `/project:board` | Display Kanban board |
| `/project:sprint-status` | Show sprint metrics |
| `/project:sprint-dev` | Start TDD/BDD sprint development |

**Usage:**
```
/project:sprint-dev 1        # Sprint 1
/project:sprint-dev next     # Next incomplete sprint
/project:sprint-dev current  # Current sprint
```

### BMAD v6

| Command | Description |
|---------|-------------|
| `/project:analyze-backlog` | Analyze current backlog structure |
| `/project:migrate-backlog` | Convert to BMAD v6 format |
| `/project:update-stories` | Add missing BMAD fields |
| `/project:sync-backlog` | Sync files with YAML |
| `/project:run-epic` | Queue all stories in epic |
| `/project:run-queue` | Process queued stories |
| `/project:run-sprint` | Execute full sprint |
| `/project:batch-status` | View batch queue status |

---

## Sprint Commands (`/sprint:`)

| Command | Description |
|---------|-------------|
| `/sprint:bmad-status` | Display sprint status with routing |
| `/sprint:next-story` | Get next ready-for-dev story |
| `/sprint:transition` | Transition story status |
| `/sprint:auto-route` | Execute automatic routing |

**Usage:**
```
/sprint:next-story --claim
/sprint:transition US-005 in-progress
/sprint:transition US-005 blocked --reason="Waiting for API"
```

**Valid Transitions:**
```
backlog → ready-for-dev → in-progress → review → done
any → blocked
```

---

## Gate Commands (`/gate:`)

| Command | Threshold | Description |
|---------|-----------|-------------|
| `/gate:validate-prd` | ≥80% | Validate PRD quality |
| `/gate:validate-techspec` | ≥90% | Validate Tech Spec |
| `/gate:validate-backlog` | INVEST 6/6 | Validate INVEST compliance |
| `/gate:validate-story` | 100% | Validate story DoD |
| `/gate:validate-sprint` | 100% | Validate sprint readiness |
| `/gate:report` | - | Full quality gates report |

**Usage:**
```
/gate:validate-prd docs/prd.md
/gate:validate-story US-005
/gate:report
```

---

## BMAD Commands (`/bmad:`)

| Command | Description |
|---------|-------------|
| `/bmad:init` | Initialize BMAD framework |
| `/bmad:status` | Show project status |
| `/bmad:route` | Route to appropriate agent |
| `/bmad:handoff` | Handoff between agents |

---

## PM Commands (`/pm:`)

| Command | Description |
|---------|-------------|
| `/pm:prd` | Create Product Requirements Document |
| `/pm:vision` | Define product vision |
| `/pm:roadmap` | Create product roadmap |
| `/pm:prioritize` | Prioritize features |
| `/pm:okr` | Define OKRs |

---

## Architect Commands (`/arch:`)

| Command | Description |
|---------|-------------|
| `/arch:design` | Design system architecture |
| `/arch:techspec` | Create technical specification |
| `/arch:adr` | Document architecture decision |
| `/arch:api` | Design API contracts |
| `/arch:database` | Design database schema |
| `/arch:security` | Security architecture review |

---

## Symfony Commands (`/symfony:`)

### Code Generation

| Command | Description |
|---------|-------------|
| `/symfony:generate-crud` | Generate CRUD operations |
| `/symfony:generate-command` | Generate CLI command |
| `/symfony:api-endpoint` | Generate API endpoint |

### Analysis

| Command | Description |
|---------|-------------|
| `/symfony:check-architecture` | Validate Clean Architecture |
| `/symfony:check-code-quality` | Run code quality checks |
| `/symfony:check-compliance` | Check DDD compliance |
| `/symfony:check-security` | Security audit |
| `/symfony:check-testing` | Test coverage analysis |

### Database

| Command | Description |
|---------|-------------|
| `/symfony:migration-plan` | Plan database migration |
| `/symfony:optimize-doctrine` | Optimize Doctrine queries |

---

## Flutter Commands (`/flutter:`)

### Code Generation

| Command | Description |
|---------|-------------|
| `/flutter:generate-feature` | Generate feature module |
| `/flutter:generate-widget` | Generate widget |

### Analysis

| Command | Description |
|---------|-------------|
| `/flutter:check-architecture` | Validate architecture |
| `/flutter:check-code-quality` | Run code quality checks |
| `/flutter:check-compliance` | Check rule compliance |
| `/flutter:check-security` | Security audit |
| `/flutter:check-testing` | Test coverage analysis |
| `/flutter:analyze-performance` | Performance analysis |

### Testing

| Command | Description |
|---------|-------------|
| `/flutter:golden-update` | Update golden files |

### Localization

| Command | Description |
|---------|-------------|
| `/flutter:localization-check` | Validate i18n setup |

---

## Python Commands (`/python:`)

### Code Generation

| Command | Description |
|---------|-------------|
| `/python:generate-endpoint` | Generate API endpoint |
| `/python:generate-model` | Generate data model |

### Analysis

| Command | Description |
|---------|-------------|
| `/python:check-architecture` | Validate architecture |
| `/python:check-code-quality` | Run code quality checks |
| `/python:check-compliance` | Check rule compliance |
| `/python:check-security` | Security audit |
| `/python:check-testing` | Test coverage analysis |
| `/python:type-coverage` | Analyze type hint coverage |
| `/python:async-check` | Validate async/await usage |
| `/python:dependency-audit` | Audit dependencies |

---

## React Commands (`/react:`)

### Code Generation

| Command | Description |
|---------|-------------|
| `/react:generate-component` | Generate React component |
| `/react:generate-hook` | Generate custom hook |
| `/react:storybook-story` | Generate Storybook story |

### Analysis

| Command | Description |
|---------|-------------|
| `/react:check-architecture` | Validate architecture |
| `/react:check-code-quality` | Run code quality checks |
| `/react:check-compliance` | Check rule compliance |
| `/react:check-security` | Security audit |
| `/react:check-testing` | Test coverage analysis |
| `/react:bundle-analyze` | Analyze bundle size |
| `/react:accessibility-check` | A11y validation |

---

## React Native Commands (`/reactnative:`)

### Code Generation

| Command | Description |
|---------|-------------|
| `/reactnative:generate-screen` | Generate screen component |
| `/reactnative:native-module` | Generate native module |

### Analysis

| Command | Description |
|---------|-------------|
| `/reactnative:check-architecture` | Validate architecture |
| `/reactnative:check-code-quality` | Run code quality checks |
| `/reactnative:check-compliance` | Check rule compliance |
| `/reactnative:check-security` | Security audit |
| `/reactnative:check-testing` | Test coverage analysis |
| `/reactnative:app-size` | Analyze app bundle size |
| `/reactnative:deep-link` | Configure deep linking |
| `/reactnative:store-prepare` | Prepare for app store |

---

## Angular Commands (`/angular:`)

### Code Generation

| Command | Description |
|---------|-------------|
| `/angular:generate-component` | Generate standalone component |

### Analysis

| Command | Description |
|---------|-------------|
| `/angular:check-architecture` | Validate architecture |
| `/angular:check-code-quality` | Run code quality checks |
| `/angular:check-compliance` | Check rule compliance |
| `/angular:check-security` | Security audit |
| `/angular:check-testing` | Test coverage analysis |

---

## C#/.NET Commands (`/csharp:`)

### Code Generation

| Command | Description |
|---------|-------------|
| `/csharp:generate-feature` | Generate CQRS feature |

### Analysis

| Command | Description |
|---------|-------------|
| `/csharp:check-architecture` | Validate Clean Architecture |
| `/csharp:check-code-quality` | Run code quality checks |
| `/csharp:check-compliance` | Check rule compliance |
| `/csharp:check-security` | Security audit (OWASP) |
| `/csharp:check-testing` | Test coverage analysis |

---

## Laravel Commands (`/laravel:`)

### Code Generation

| Command | Description |
|---------|-------------|
| `/laravel:generate-controller` | Generate API controller |

### Analysis

| Command | Description |
|---------|-------------|
| `/laravel:check-architecture` | Validate Clean Architecture |
| `/laravel:check-code-quality` | Run code quality checks |
| `/laravel:check-compliance` | Check rule compliance |
| `/laravel:check-security` | Security audit |
| `/laravel:check-testing` | Test coverage analysis |

---

## Vue.js Commands (`/vuejs:`)

### Code Generation

| Command | Description |
|---------|-------------|
| `/vuejs:generate-component` | Generate component with test |

### Analysis

| Command | Description |
|---------|-------------|
| `/vuejs:check-architecture` | Validate architecture |
| `/vuejs:check-code-quality` | Run code quality checks |
| `/vuejs:check-compliance` | Check rule compliance |
| `/vuejs:check-security` | Security audit |
| `/vuejs:check-testing` | Test coverage analysis |

---

## PHP Commands (`/php:`)

| Command | Description |
|---------|-------------|
| `/php:check-architecture` | Validate Clean Architecture |
| `/php:check-code-quality` | Run code quality checks |
| `/php:check-compliance` | Check rule compliance |
| `/php:check-security` | Security audit |
| `/php:check-testing` | Test coverage analysis |

---

## Docker Commands (`/docker:`)

| Command | Description |
|---------|-------------|
| `/docker:compose-setup` | Generate docker-compose |
| `/docker:architecture` | Design Docker architecture |
| `/docker:debug` | Diagnose Docker issues |
| `/docker:cicd-pipeline` | Generate CI/CD pipeline |

**Usage:**
```
/docker:compose-setup symfony postgresql redis
/docker:architecture microservices e-commerce
/docker:cicd-pipeline github-actions
```

---

## Creating Custom Commands

Add to `.claude/commands/{namespace}/`:

```markdown
---
description: What this command does
argument-hint: <required> [optional]
---

# Command Title

## Purpose
What this command accomplishes.

## Arguments
$ARGUMENTS

## Process

### Step 1
Instructions...

### Step 2
Instructions...

## Output
Expected output format...
```

---

## See Also

- [Agents Reference](AGENTS-FULL-REFERENCE.md)
- [CLI Reference](CLI-REFERENCE.md)
- [Quick Reference](COMMANDS.md)
