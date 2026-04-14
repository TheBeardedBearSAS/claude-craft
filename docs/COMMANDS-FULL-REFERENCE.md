# Commands Full Reference

Complete reference for all 204+ commands available in Claude Craft.

---

## Quick Reference

| Namespace | Count | Description |
|-----------|-------|-------------|
| `/common:` | 14 | Transversal commands |
| `/workflow:` | 9 | Development workflow |
| `/team:` | 4 | Agent Teams |
| `/qa:` | 6 | QA & Testing |
| `/uiux:` | 7 | UI/UX & Accessibility |
| `/symfony:` | 10 | Symfony/PHP |
| `/flutter:` | 10 | Flutter/Dart |
| `/python:` | 10 | Python |
| `/react:` | 10 | React/TypeScript |
| `/reactnative:` | 10 | React Native |
| `/angular:` | 6 | Angular |
| `/csharp:` | 6 | C#/.NET |
| `/laravel:` | 6 | Laravel |
| `/vuejs:` | 6 | Vue.js |
| `/php:` | 5 | PHP |
| `/docker:` | 5 | Docker/Infrastructure |
| `/coolify:` | 5 | Coolify/PaaS |
| `/kubernetes:` | 5 | Kubernetes/Infrastructure |
| `/opentofu:` | 5 | OpenTofu/IaC |
| `/ansible:` | 5 | Ansible/Automation |
| `/hcloud:` | 5 | Hcloud/Hetzner Cloud |
| `/pgbouncer:` | 5 | PgBouncer/Connection Pooling |
| `/frankenphp:` | 5 | FrankenPHP/PHP Server |
| `/project:` | 34 | Project Management |
| `/sprint:` | 5 | Sprint Management (BMAD v6) |
| `/gate:` | 7 | Quality Gates (BMAD v6) |

---

## Common Commands (`/common:`)

### Workflow Commands

| Command | Description |
|---------|-------------|
| `/common:pre-commit-check` | Validate code before commit |
| `/common:pre-merge-check` | Validate code before merge |
| `/common:release-checklist` | Pre-release validation |

### Generation Commands

| Command | Description |
|---------|-------------|
| `/common:generate-changelog` | Generate changelog from commits |
| `/common:architecture-decision` | Document an ADR |

### Sprint Commands

| Command | Description |
|---------|-------------|
| `/workflow:start` | Initialize a new sprint |
| `/workflow:review` | Generate sprint review summary |
| `/workflow:retro` | Conduct sprint retrospective |
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
| `/docker:optimize` | Optimize Docker configuration |

### Development Commands

| Command | Description |
|---------|-------------|
| `/qa:tdd` | Fix bug using TDD methodology |
| `/common:research-context7` | Deep technical research |

### UI/UX Commands

| Command | Description |
|---------|-------------|
| `/uiux:orchestrator` | Orchestrate UI/UX/A11y experts |
| `/uiux:audit` | Complete UI/UX/A11y audit |
| `/uiux:component-spec` | Full component specification |
| `/uiux:design-tokens` | Define design system tokens |
| `/uiux:user-flow` | Design user journey |
| `/uiux:a11y-audit` | WCAG 2.2 AAA audit |
| `/uiux:a11y-component` | Accessibility specs for component |

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
| `/project:move-task` | Change task status |

### Sprint

| Command | Description |
|---------|-------------|
| `/project:board` | Display Kanban board |
| `/sprint:status` | Show sprint metrics |
| `/sprint:dev` | Start TDD/BDD sprint development |

**Usage:**
```
/sprint:dev 1        # Sprint 1
/sprint:dev next     # Next incomplete sprint
/sprint:dev current  # Current sprint
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

## Coolify Commands (`/coolify:`)

Infrastructure deployment with Coolify self-hosted PaaS.

| Command | Description |
|---------|-------------|
| `/coolify:setup` | Initialize project for Coolify deployment |
| `/coolify:deploy` | Deploy application to Coolify |
| `/coolify:debug` | Diagnose Coolify deployment issues |
| `/coolify:backup` | Configure and manage backups |
| `/coolify:optimize` | Optimize Coolify deployment |

### Usage Examples

```bash
/coolify:setup "Node.js API with PostgreSQL"
/coolify:deploy --branch=main --env=production
/coolify:debug "502 Bad Gateway after deploy"
/coolify:backup --provider=s3 --schedule=daily
/coolify:optimize
```

---

## Infrastructure Commands

All 6 additional infrastructure namespaces follow the same 5-command pattern:

| Command | Purpose |
|---------|---------|
| `/{platform}:architecture` | Design infrastructure architecture |
| `/{platform}:deploy-setup` | Configure deployment pipelines |
| `/{platform}:debug` | Troubleshoot infrastructure issues |
| `/{platform}:security-audit` | Review security configurations |
| `/{platform}:optimize` | Performance and cost optimization |

### Kubernetes (`/kubernetes:`)

```bash
/kubernetes:architecture "Microservices e-commerce with 3 services"
/kubernetes:deploy-setup --env=production --provider=gke
/kubernetes:debug "Pods in CrashLoopBackOff"
/kubernetes:security-audit
/kubernetes:optimize --focus=cost
```

### OpenTofu (`/opentofu:`)

```bash
/opentofu:architecture "Multi-cloud AWS + GCP infrastructure"
/opentofu:deploy-setup --provider=aws --env=staging
/opentofu:debug "State lock issue"
/opentofu:security-audit
/opentofu:optimize --focus=cost
```

### Ansible (`/ansible:`)

```bash
/ansible:architecture "Configuration management for 50 servers"
/ansible:deploy-setup --inventory=production
/ansible:debug "Playbook failing on target hosts"
/ansible:security-audit
/ansible:optimize
```

### Hcloud (`/hcloud:`)

```bash
/hcloud:architecture "European hosting for SaaS platform"
/hcloud:deploy-setup --location=fsn1
/hcloud:debug "Network connectivity issues"
/hcloud:security-audit
/hcloud:optimize --focus=cost
```

### PgBouncer (`/pgbouncer:`)

```bash
/pgbouncer:architecture "Connection pooling for 1000+ concurrent users"
/pgbouncer:deploy-setup --pool-mode=transaction
/pgbouncer:debug "Connection timeout errors"
/pgbouncer:security-audit
/pgbouncer:optimize
```

### FrankenPHP (`/frankenphp:`)

```bash
/frankenphp:architecture "Symfony app with worker mode"
/frankenphp:deploy-setup --framework=symfony
/frankenphp:debug "Worker process crashes"
/frankenphp:security-audit
/frankenphp:optimize --focus=performance
```

---

## QA Recette Commands (`/qa:`)

Automated acceptance testing with Claude in Chrome.

### Prerequisites

- Claude in Chrome extension v1.0.36+
- Claude Code v2.0.73+
- Launch with `claude --chrome` or run `/chrome`

### Core Commands

| Command | Description |
|---------|-------------|
| `/qa:recette` | Run acceptance tests on web application |
| `/qa:fix` | Fix bugs from recette session with TDD workflow |
| `/qa:status` | Show session status and progress |
| `/qa:regression` | View and manage regression test registry |
| `/qa:report` | Generate recette report (MD/HTML/JSON) |

### `/qa:recette` Arguments

| Argument | Description | Values |
|----------|-------------|--------|
| `--scope` | Testing scope | `story`, `epic`, `sprint`, `task` |
| `--id` | Target identifier | e.g., `US-001`, `EPIC-002` |
| `--dry-run` | Generate plan without execution | - |
| `--resume` | Resume interrupted session | session-id |
| `--record-gif` | Record test execution | - |

### `/qa:fix` Arguments

| Argument | Description | Values |
|----------|-------------|--------|
| `--session` | Recette session ID | e.g., `REC-20260130-143022` |
| `--dry-run` | Refine and document without fixing | - |
| `--severity` | Filter by minimum severity | `critical`, `high`, `medium`, `low` |
| `--skip-fix` | Generate BMAD documents only | - |
| `--auto-commit` | Auto-commit after each fix | - |

### `/qa:status` Arguments

| Argument | Description | Values |
|----------|-------------|--------|
| `--session` | Show specific session detail | e.g., `REC-20260130-143022` |
| `--all` | List all sessions | - |
| `--scope` | Filter by scope | `story`, `sprint` |
| `--status` | Filter by status | `running`, `completed`, `paused`, `failed` |
| `--format` | Output format | `table`, `yaml`, `json` |
| `--watch` | Live refresh mode | - |

### `/qa:regression` Arguments

| Argument | Description | Values |
|----------|-------------|--------|
| `--list` | List all regression tests | - |
| `--stats` | Show stability score and trends | - |
| `--check` | Run regression tests, detect violations | - |
| `--status` | Filter by test status | `active`, `verified`, `obsolete` |
| `--source` | Filter by source story | e.g., `US-001` |
| `--trend` | Show historical trend | - |
| `--format` | Output format | `table`, `yaml`, `json` |

### `/qa:report` Arguments

| Argument | Description | Values |
|----------|-------------|--------|
| `--session` | Session ID (required) | e.g., `REC-20260130-143022` |
| `--format` | Output format | `md`, `html`, `json` |
| `--output` | Custom output path | e.g., `./reports/sprint-3/` |
| `--include-screenshots` | Embed screenshots in HTML | - |
| `--compare` | Compare with another session | session-id |

### Usage Examples

```bash
# Run acceptance tests for a user story
/qa:recette --scope=story --id=US-001

# Dry-run to preview test plan
/qa:recette --scope=story --id=US-001 --dry-run

# Resume interrupted session
/qa:recette --resume=REC-20260130-143022

# Run with GIF recording
/qa:recette --scope=sprint --id=SPRINT-03 --record-gif

# Show all sessions
/qa:status --all

# Show specific session status
/qa:status --session=REC-20260130-143022

# Check regression tests (Golden Rule)
/qa:regression --check

# Show regression stability score
/qa:regression --stats

# Generate report from session
/qa:report --session=REC-20260130-143022

# Generate HTML report with screenshots
/qa:report --session=REC-20260130-143022 --format=html --include-screenshots

# Fix all bugs from a recette session
/qa:fix --session=REC-20260130-143022

# Dry run
/qa:fix --session=REC-20260130-143022 --dry-run
```

### Test Categories

| Category | Description |
|----------|-------------|
| `acceptance_criteria_validation` | Validate story acceptance criteria |
| `edge_cases` | Test boundary conditions |
| `error_scenarios` | Error handling verification |
| `ui_ux_verification` | UI/UX consistency checks |
| `performance_checks` | Response time validation |
| `security_basics` | XSS, CSRF, injection checks |

### Golden Rule

**A fixed bug should NEVER reappear.**

When errors are detected:
1. Error is classified (visual, interaction, validation, logic, security, API)
2. Appropriate tests are auto-generated (Unit, Functional, Behat)
3. Tests are added to regression registry
4. All future runs include regression checks

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
