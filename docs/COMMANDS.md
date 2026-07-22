# Commands Reference

> **This is the narrated, namespace-grouped reference (126 core commands).** For the complete auto-generated table of all 220 commands (core + infra, with source links), see [COMMANDS-FULL-REFERENCE.md](COMMANDS-FULL-REFERENCE.md). For the `claude-craft` NPX CLI (a different tool — `install`, `init`, `check`…), see [CLI-REFERENCE.md](CLI-REFERENCE.md).

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

## Plan Mode Classification

Every command includes a **Plan Mode** section that indicates when Claude should activate plan mode before executing. This ensures proper analysis and validation for impactful operations.

| Level | Description | Example Commands |
|-------|-------------|-----------------|
| **MANDATORY** | Plan mode activates automatically before execution. Claude analyzes impacted code and proposes a plan for your validation. | `/workflow:implement`, `/qa:tdd`, `/qa:recette`, `generate-*` commands |
| **RECOMMENDED** | Plan mode is recommended for complex scenarios. Activates when scope spans multiple modules. | `/workflow:plan`, `/workflow:design`, `/common:architecture-decision` |
| **CONDITIONAL** | Plan mode activates automatically when scope is broad (multiple modules, cross-cutting analysis). | `check-*` commands, `/workflow:analyze`, `/common:research-context7` |

> **Tip:** Commands without a Plan Mode section (e.g., `/workflow:status`, `/common:daily-standup`) are lightweight and never require plan mode.

---

## Command Namespaces

> Les **17 namespaces cœur + technologies** (`/common`, `/workflow`, `/team`, `/qa`, `/uiux` + les 13 stacks dont `/paperclip:*`, `/vite:*` et `/vercel:*`) totalisent **139 commandes** — c'est le chiffre d'en-tête de Claude Craft. Le tableau ci-dessous inclut en plus les namespaces d'infrastructure et de gestion de projet (BMAD), pour un total installable de **233 commandes sur 29 namespaces**. Référence détaillée auto-générée : [COMMANDS-FULL-REFERENCE](COMMANDS-FULL-REFERENCE.md).

| Namespace | Technology | Count |
|-----------|------------|-------|
| `/common:` | Transversal | 19 |
| `/workflow:` | Workflow (BMAD) | 10 |
| `/team:` | Agent Teams | 4 |
| `/qa:` | QA & Testing | 6 |
| `/uiux:` | UI/UX & Accessibility | 8 |
| `/symfony:` | PHP/Symfony | 10 |
| `/flutter:` | Dart/Flutter | 10 |
| `/python:` | Python | 10 |
| `/react:` | React/TypeScript | 10 |
| `/reactnative:` | React Native | 10 |
| `/angular:` | Angular | 6 |
| `/csharp:` | C#/.NET | 6 |
| `/laravel:` | PHP/Laravel | 6 |
| `/vuejs:` | Vue.js | 6 |
| `/vite:` | Vite | 7 |
| `/vercel:` | Vercel | 6 |
| `/php:` | PHP | 5 |
| `/docker:` | Docker/Infrastructure | 5 |
| `/coolify:` | Coolify/PaaS | 5 |
| `/kubernetes:` | Kubernetes/Infrastructure | 5 |
| `/opentofu:` | OpenTofu/IaC | 5 |
| `/ansible:` | Ansible/Automation | 5 |
| `/hcloud:` | Hcloud/Hetzner Cloud | 5 |
| `/pgbouncer:` | PgBouncer/Connection Pooling | 5 |
| `/frankenphp:` | FrankenPHP/PHP Server | 5 |
| `/paperclip:` | Paperclip AI-workforce orchestration | 8 |
| `/sprint:` | Sprint Management (BMAD v6) | 5 |
| `/gate:` | Quality Gates (BMAD v6) | 7 |

---

## Common Commands (`/common:`)

Transversal commands for all projects.

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
| `/workflow:auto-sprint` | End-to-end sprint orchestrator (start → decompose → validate → implement → PR → CI → review → retro → merge) |
| `/workflow:review` | Generate sprint review summary |
| `/workflow:retro` | Conduct sprint retrospective |
| `/common:daily-standup` | Generate standup summary |

### Configuration Commands

| Command | Description |
|---------|-------------|
| `/common:setup-project-context` | Interactive project context configuration |
| `/common:setup-rtk` | Install and configure RTK (token optimization) |

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

> **Note:** `/common:full-audit` and `/common:ralph-sprint` were removed in v6.0. Use `/team:audit --sequential` and `/team:sprint --ralph-mode` instead. See [Migration Guide](MIGRATION-v6.md).

### DevOps Commands

| Command | Description |
|---------|-------------|
| `/common:setup-ci` | Configure CI/CD pipeline |
| `/docker:optimize` | Optimize Docker configuration |

### Codebase Packing (v7.33+)

| Command | Description |
|---------|-------------|
| `/common:pack-repo` | Pack the codebase into a single AI-friendly file (XML/Markdown/Plain/JSON). Wrapper around [Repomix](https://github.com/yamadashy/repomix) with native shell fallback. Token counting included. Options : `--format`, `--output`, `--compress`, `--include`, `--exclude`, `--mcp`, `--fallback`. |

### Development Commands

| Command | Description |
|---------|-------------|
| `/qa:tdd` | Fix bug using TDD methodology |
| `/common:research-context7` | Deep technical research |

### UI/UX Commands

| Command | Description |
|---------|-------------|
| `/uiux:orchestrator` | Orchestrate UI, UX, and A11y experts for a task |
| `/uiux:audit` | Complete UI/UX/Accessibility audit |
| `/uiux:component-spec` | Full component specification (UI + UX + A11y) |
| `/uiux:design-tokens` | Define design system tokens |
| `/uiux:user-flow` | Design user journey and flow |
| `/uiux:a11y-audit` | WCAG 2.2 AAA accessibility audit |
| `/uiux:a11y-component` | Accessibility specs for a component |
| `/uiux:generate-design-md` | Generate root `DESIGN.md` from template (auto-detect Tailwind / W3C tokens). Options : `--from-tailwind`, `--from-tokens`, `--interactive`. Convention : `design-md-convention` skill. (v7.34+) |

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
- [ ] website/LandingPage.vue updated (stats + tech card)
- [ ] Makefile target added

### Agent Teams Commands

| Command | Description |
|---------|-------------|
| `/team:audit` | Parallel multi-tech audit (Agent Teams) |
| `/team:sprint` | Parallel sprint implementation (Agent Teams) |
| `/team:security` | Parallel security review (Agent Teams) |
| `/team:delivery` | Full sprint lifecycle — writing + implementation (Agent Teams) |
| `/common:sub-agents-patterns` | Sub-agent orchestration patterns for Agent Teams |

---

## Workflow Commands (`/workflow:`)

BMAD-inspired workflow system adapted to project complexity.

| Command | Description |
|---------|-------------|
| `/workflow:init` | Initialize workflow (auto-detect track) |
| `/workflow:analyze` | Research and exploration phase |
| `/workflow:plan` | Generate PRD, personas, backlog |
| `/workflow:design` | Tech spec, architecture, ADRs |
| `/workflow:implement` | Sprint development with TDD/BDD |
| `/workflow:status` | Show current progress |
| `/workflow:retro` | Sprint retrospective |
| `/workflow:review` | Sprint review summary |
| `/workflow:start` | Start a new sprint |
| `/workflow:auto-sprint` | End-to-end sprint orchestrator (PO/SM): chains start → decompose → validate → implement → PR → CI watch → review → retro → merge, each step in an isolated sub-agent (replaces `/clear`) |

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

## Vite Commands (`/vite:`)

Framework-agnostic Vite projects only — vanilla JS/TS apps, library authoring, multi-page apps, Workers/WASM entries. For React/Vue/Angular/Svelte's own Vite tooling, use `/react:*`, `/vuejs:*`, `/angular:*` commands instead.

### Code Generation

| Command | Description |
|---------|-------------|
| `/vite:scaffold-project` | Scaffold a new Vite project (`vanilla-ts`/`lit-ts` template) or a library skeleton |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/vite:check-architecture` | Validate project shape (vanilla SPA, library, multi-page, Workers/WASM) and `vite.config.ts` organization |
| `/vite:check-code-quality` | Run code quality checks (ESLint, `tsc --noEmit`) |
| `/vite:check-compliance` | Check rule compliance (Config & Architecture, TypeScript & Quality, Tests, Build Output & Performance) |
| `/vite:check-security` | Security audit (`envPrefix`/`define()` leakage, multi-page CSP, Workers/WASM sandboxing) |
| `/vite:check-testing` | Test coverage analysis (Vitest) |
| `/vite:check-library-build` | Validate `build.lib` output and `vite-plugin-dts` `.d.ts` generation |

---

## Vercel Commands (`/vercel:`)

Framework-agnostic Vercel platform features only — `vercel.json`, Serverless Functions (Node.js/Fluid Compute runtime), ISR, Cron Jobs, Storage. Not a Next.js stack (no `/nextjs:*` namespace exists) — for framework-specific routing/rendering, use `/react:*`, `/vuejs:*`, `/angular:*` instead.

### Code Generation

| Command | Description |
|---------|-------------|
| `/vercel:deploy-config` | Detect project shape and generate/validate a `vercel.json` |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/vercel:check-architecture` | Validate `vercel.json` structure (rewrites/redirects/headers/regions/functions/crons) and project-shape fit |
| `/vercel:check-code-quality` | Run code quality checks on `api/**` (ESLint, `tsc --strict`, handler signature conventions) |
| `/vercel:check-compliance` | Check rule compliance (vercel.json & Architecture, Functions & Runtime Choice, Security & Env Handling, ISR/Caching & Tests) |
| `/vercel:check-security` | Security audit (env vars/secrets, cron auth guard, CORS/CSP headers, Marketplace credential scoping) |
| `/vercel:check-testing` | Test coverage analysis (Vitest for Function handlers, `vercel dev` smoke tests) |

---

## PHP Commands (`/php:`)

Standalone PHP development with PSR-12 and PHPStan.

| Command | Description |
|---------|-------------|
| `/php:check-architecture` | Validate architecture (layers, dependencies) |
| `/php:check-code-quality` | Run code quality checks (PHPStan, PSR-12) |
| `/php:check-compliance` | Check rule compliance (modern PHP 8.5) |
| `/php:check-security` | Security audit (OWASP Top 10, injection) |
| `/php:check-testing` | Test coverage analysis (Pest PHP) |

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
| `/docker:optimize <Target>` | Optimize Docker configuration |

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

---

## Kubernetes Commands (`/kubernetes:`)

Infrastructure orchestration with Kubernetes.

### Architecture Commands

| Command | Description |
|---------|-------------|
| `/kubernetes:architecture <Project>` | Design complete Kubernetes architecture |
| `/kubernetes:deploy-setup <Stack>` | Setup GitOps deployment pipeline |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/kubernetes:debug <Symptom>` | Diagnose Kubernetes issues |
| `/kubernetes:security-audit [Scope]` | Kubernetes security posture audit |
| `/kubernetes:optimize [Target]` | Optimize Kubernetes resource usage and costs |

---

## OpenTofu Commands (`/opentofu:`)

Infrastructure as Code with OpenTofu.

### Architecture Commands

| Command | Description |
|---------|-------------|
| `/opentofu:architecture <Project>` | Design complete OpenTofu IaC architecture |
| `/opentofu:deploy-setup <Platform>` | Setup CI/CD pipeline for OpenTofu |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/opentofu:debug <Symptom>` | Diagnose OpenTofu state issues and drift |
| `/opentofu:security-audit [Scope]` | Audit OpenTofu security posture |
| `/opentofu:optimize [Target]` | Cost optimization and resource analysis |

---

## Ansible Commands (`/ansible:`)

Infrastructure automation with Ansible.

### Architecture Commands

| Command | Description |
|---------|-------------|
| `/ansible:architecture <Project>` | Design complete Ansible automation architecture |
| `/ansible:deploy-setup <Platform>` | Setup CI/CD pipeline for Ansible |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/ansible:debug <Symptom>` | Diagnose Ansible playbook issues |
| `/ansible:security-audit [Scope]` | Audit Ansible security posture |
| `/ansible:optimize [Target]` | Optimize Ansible performance and quality |

---

## Hcloud Commands (`/hcloud:`)

Hetzner Cloud infrastructure management with hcloud CLI.

### Architecture Commands

| Command | Description |
|---------|-------------|
| `/hcloud:architecture <Project>` | Design complete Hetzner Cloud infrastructure architecture |
| `/hcloud:deploy-setup <Platform>` | Setup CI/CD pipeline for Hetzner Cloud deployments |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/hcloud:debug <Symptom>` | Diagnose Hetzner Cloud infrastructure issues |
| `/hcloud:security-audit [Scope]` | Audit Hetzner Cloud security posture |
| `/hcloud:optimize [Target]` | Optimize Hetzner Cloud cost and performance |

---

## PgBouncer Commands (`/pgbouncer:`)

PgBouncer connection pooling management.

### Architecture Commands

| Command | Description |
|---------|-------------|
| `/pgbouncer:architecture <Project>` | Design complete PgBouncer connection pooling architecture |
| `/pgbouncer:deploy-setup <Platform>` | Setup PgBouncer deployment with Docker, Kubernetes, or systemd |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/pgbouncer:debug <Symptom>` | Diagnose PgBouncer connection pool issues from symptoms |
| `/pgbouncer:security-audit [Scope]` | Audit PgBouncer security posture |
| `/pgbouncer:optimize [Target]` | Optimize PgBouncer pool performance and connection utilization |

---

## FrankenPHP Commands (`/frankenphp:`)

FrankenPHP PHP application server management.

### Architecture Commands

| Command | Description |
|---------|-------------|
| `/frankenphp:architecture <Project>` | Design complete FrankenPHP serving architecture |
| `/frankenphp:deploy-setup <Platform>` | Generate FrankenPHP deployment files for Docker, Kubernetes, or standalone |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/frankenphp:debug <Symptom>` | Diagnose FrankenPHP worker and Caddyfile issues from symptoms |
| `/frankenphp:security-audit [Scope]` | Audit FrankenPHP security posture |
| `/frankenphp:optimize [Target]` | Optimize FrankenPHP worker performance and throughput |

---

## Paperclip Commands (`/paperclip:`)

Paperclip is an open-source AI-workforce orchestration platform (Node.js + TypeScript + React UI, MIT, v2026.529.0+). It exposes a control plane that governs AI agents (budgets, approvals, audit trails) and adapters (Claude Code, Codex, Gemini, HTTP, process) that execute work.

### Generation Commands

| Command | Description |
|---------|-------------|
| `/paperclip:generate-adapter <name> <kind>` | Scaffold a custom adapter (`local` \| `process` \| `http`) implementing the full `AdapterContract` |
| `/paperclip:generate-agent-config <name>` | Produce an `agent.yaml` with budget, skills, approvals, adapter binding |
| `/paperclip:setup-company <name>` | Bootstrap a new Paperclip company end-to-end (install, company, goal, budget, adapter, first agent) |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/paperclip:check-compliance` | Full audit — Architecture + Code Quality + Tests + Security + Adapter protocol, scored /100 |
| `/paperclip:check-architecture` | Two-layer split, module boundaries, activity log coverage, OpenAPI spec alignment |
| `/paperclip:check-code-quality` | TypeScript strictness, lint, complexity, logging hygiene, error modeling |
| `/paperclip:check-testing` | Coverage thresholds, adapter contract tests, integration tests vs real Postgres, cross-tenant isolation |
| `/paperclip:check-security` | Tenant isolation, secrets, approval gates, hard budgets, signed adapter channel, HTTP headers, supply chain |

---

## Project Commands (`/project:`)

Available with Project installation.

| Command | Description |
|---------|-------------|
| `/project:generate-backlog <Feature>` | Generate backlog |
| `/project:decompose-tasks <Epic>` | Break down epic into tasks |
| `/project:add-epic <Name>` | Create a new EPIC |
| `/project:add-story <Epic> <Name>` | Create a User Story |
| `/project:add-task <US> <Desc> <Est>` | Create a task |
| `/project:list-epics` | List all EPICs |
| `/project:list-stories` | List User Stories |
| `/project:list-tasks` | List tasks |
| `/project:move-task <Task> <Status>` | Change task status |
| `/project:board` | Display Kanban board |
| `/sprint:status` | Show sprint metrics |
| `/project:update-epic <Epic>` | Update an EPIC |
| `/project:update-story <US>` | Update a User Story |
| `/sprint:dev <N\|next>` | **Start TDD/BDD sprint development** |

### BMAD v6 Commands (NEW)

| Command | Description |
|---------|-------------|
| `/project:analyze-backlog` | Analyze current backlog structure |
| `/project:migrate-backlog` | Convert backlog to BMAD v6 format |
| `/project:update-stories` | Add missing BMAD fields to stories |
| `/project:sync-backlog` | Synchronize backlog files ↔ YAML |
| `/project:generate-prd` | Generate Product Requirements Document |
| `/project:generate-tech-spec` | Generate Technical Specification |
| `/project:run-epic <ID>` | Queue all stories in an epic |
| `/project:run-queue` | Process queued stories |
| `/project:run-sprint` | Execute full sprint |
| `/project:batch-status` | View batch queue status |

### SDD v2.0 Commands (NEW)

| Command | Description |
|---------|-------------|
| `/project:generate-constitution` | Generate project constitution document |
| `/project:trace [--scope] [--id]` | Display bidirectional traceability matrix |
| `/project:coverage-map` | Analyze requirement coverage gaps |
| `/project:scan [--scope]` | Analyze codebase and generate structured inventory |
| `/project:reverse-prd` | Generate PRD from existing codebase (brownfield) |
| `/project:reverse-stories` | Generate user stories from existing features |
| `/project:gap-analysis` | Compare specifications with actual code |
| `/project:checkpoint --phase=<phase>` | Run spec verification checkpoints (pre-sprint, pre-impl, post-impl, pre-merge) |
| `/project:dependencies [--sprint]` | Generate story dependency graph (Mermaid) |
| `/project:critical-path [--sprint]` | Identify critical path for sprint optimization |
| `/project:metrics [--sprint]` | Generate project metrics dashboard |
| `/project:burndown [--sprint]` | Generate sprint burndown chart (Mermaid) |

### Sprint Development (`/sprint:dev`)

Orchestrates complete sprint development in TDD/BDD mode:

```bash
/sprint:dev 1        # Sprint 1
/sprint:dev next     # Next incomplete sprint
/sprint:dev current  # Currently active sprint
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
| `/gate:validate-alignment [story-id]` | Validate spec-code alignment (≥85% threshold) |

### Quality Gate Thresholds

| Gate | Threshold | Criteria |
|------|-----------|----------|
| PRD Gate | ≥80% | Problem, users, goals, metrics, scope |
| Tech Spec Gate | ≥90% | Architecture, security, testing, deployment |
| Backlog Gate | 6/6 INVEST | Independent, Negotiable, Valuable, Estimable, Small, Testable |
| Story DoD | 100% | Tasks, tests, AC, review, no blockers |
| Sprint Ready | 100% | Metadata, goal, stories ready, estimated |
| Spec Alignment | ≥85% | Requirement coverage, story-code mapping, AC-test mapping, constitution |

---

## QA Recette Commands (`/common:`) - NEW

Automated acceptance testing with Claude in Chrome.

| Command | Description |
|---------|-------------|
| `/qa:recette` | Execute automated acceptance tests via browser |
| `/qa:fix` | Fix bugs from recette session (TDD workflow) |
| `/qa:status` | Show recette session status and progress |
| `/qa:regression` | View and manage regression test registry |
| `/qa:report` | Generate recette report (MD/HTML/JSON) |

### Golden Rule

> **A fixed bug should NEVER reappear.**

All detected errors automatically generate regression tests.

### Usage Examples

```bash
# Test a specific story
/qa:recette --scope=story --id=US-001

# Test all stories in a sprint
/qa:recette --scope=sprint --id=Sprint-3

# Dry run to see test plan
/qa:recette --scope=story --id=US-001 --dry-run

# Resume interrupted session
/qa:recette --resume=REC-20260130-143022

# Record execution as GIF
/qa:recette --scope=story --id=US-001 --record-gif

# Fix all bugs from a recette session
/qa:fix --session=REC-20260130-143022

# Dry run: refine and document without fixing
/qa:fix --session=REC-20260130-143022 --dry-run

# Fix critical bugs only
/qa:fix --session=REC-20260130-143022 --severity=critical
```

### Prerequisites

- Chrome extension Claude in Chrome v1.0.36+
- Claude Code with `--chrome` flag or `/chrome` command

### Test Categories

| Category | Description |
|----------|-------------|
| `acceptance_criteria_validation` | Tests for each AC |
| `edge_cases` | Boundary conditions |
| `error_scenarios` | Error handling |
| `ui_ux_verification` | UI/UX consistency |
| `performance_checks` | Load times |
| `security_basics` | XSS, CSRF, injection |

### Error → Test Pipeline

When an error is detected:
1. **Classify** error type (visual, interaction, validation, logic, security, API)
2. **Generate** appropriate tests:
   - Logic/Validation → Unit test
   - API/Service → Functional test
   - User flow → Behat feature
3. **Register** in regression suite with `@regression` tag
4. **Fix** bug using TDD workflow
5. **Verify** all regression tests pass

### Output Structure

```
.recette/
├── plans/           # Test plans (YAML)
├── sessions/        # Session states (resume)
├── regression/      # Regression tests
│   └── registry.yaml
├── metrics/         # Historical data
└── reports/         # Generated reports
```

See command documentation: `Dev/i18n/{lang}/Common/commands/recette.md`
See fix command documentation: `Dev/i18n/{lang}/Common/commands/recette-fix.md`
See status command documentation: `Dev/i18n/{lang}/Common/commands/recette-status.md`
See regression command documentation: `Dev/i18n/{lang}/Common/commands/recette-regression.md`
See report command documentation: `Dev/i18n/{lang}/Common/commands/recette-report.md`

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

## Context Management Best Practices

Effective context management is the #1 productivity factor with Claude Code (source: Anthropic).

### Key Principles

| Principle | Action |
|-----------|--------|
| **Context is finite** | Monitor context % in status line |
| **Use `/clear`** | Between unrelated tasks |
| **Delegate investigations** | Use sub-agents (Task tool) for exploration |
| **Verification loops** | Always provide tests/expected outputs |
| **Plan before acting** | Use Plan Mode for complex tasks (> 3 files) |
| **Parallel worktrees** | `git worktree add` for concurrent sessions |

### CLAUDE.md Size

Keep your main CLAUDE.md under 200 lines. Each additional instruction dilutes attention on existing ones. Use `.claude/rules/` for detailed guidelines.

### Hooks vs Instructions

| Mechanism | Strength | Use When |
|-----------|----------|----------|
| CLAUDE.md | Suggestion | Guidelines, conventions |
| Rules (`.claude/rules/`) | Strong suggestion | Detailed best practices |
| Hooks | Enforcement | Security constraints, formatting |

See `.claude/templates/hooks/` for ready-to-use hook templates.

### Context Thresholds

| Context % | Recommended Action |
|-----------|--------------------|
| < 30% | Normal operation |
| 30-60% | Monitor, avoid unnecessary file reads |
| 60-80% | Delegate to sub-agents, consider `/clear` |
| > 80% | Compaction imminent, save critical context |

See rule `12-context-management.md` for full documentation.

---

## Best Practices

1. **Use check commands** before commits
2. **Generate with commands** for consistent code
3. **Audit regularly** with team-audit
4. **Document decisions** with architecture-decision
5. **Track sprints** with sprint commands
6. **Manage context** — use `/clear` between tasks, delegate investigations
7. **Use hooks** for security enforcement (not just CLAUDE.md instructions)
