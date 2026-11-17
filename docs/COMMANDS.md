# Commands Reference

> **This is the narrated, namespace-grouped reference (active commands only; the commands removed in 9.0 are listed in [MIGRATION-v9.md](MIGRATION-v9.md)).** For the complete auto-generated table of all 197 command files (core + infra, with source links), see [COMMANDS-FULL-REFERENCE.md](COMMANDS-FULL-REFERENCE.md). For the `bear-craft` NPX CLI (a different tool — `install`, `init`, `check`…), see [CLI-REFERENCE.md](CLI-REFERENCE.md).

Claude Code commands are slash commands that automate workflows and provide structured assistance.

## How to Use Commands

Type a slash command in Claude Code:

```
/bear-gate:check commit
/bear-symfony:generate-crud User
/bear-react:generate-component Button
```

Commands can take arguments:
```
/command:name argument1 argument2
```

## Plan Mode Classification

Every command includes a **Plan Mode** section that indicates when Claude should activate plan mode before executing. This ensures proper analysis and validation for impactful operations.

| Level | Description | Example Commands |
|-------|-------------|-----------------|
| **MANDATORY** | Plan mode activates automatically before execution. Claude analyzes impacted code and proposes a plan for your validation. | `/bear-workflow:implement`, `/bear-qa:tdd`, `/bear-qa:recette`, `generate-*` commands |
| **RECOMMENDED** | Plan mode is recommended for complex scenarios. Activates when scope spans multiple modules. | `/bear-workflow:plan`, `/bear-workflow:design`, `/bear-common:architecture-decision` |
| **CONDITIONAL** | Plan mode activates automatically when scope is broad (multiple modules, cross-cutting analysis). | `check-*` commands, `/bear-workflow:plan --research` |

> **Tip:** Commands without a Plan Mode section (e.g., `/bear-workflow:status`, `/bear-workflow:status --standup`) are lightweight and never require plan mode.

---

## Command Namespaces

> The generated reference lists **135 commands** across all namespaces (infra and project management included). The counts below are the commands of the 18 namespaces. `/bear-common:add-technology` and `/bear-common:audit-*` are maintainer-only (they work on the Bear Craft repository itself). Full auto-generated reference: [COMMANDS-FULL-REFERENCE](COMMANDS-FULL-REFERENCE.md).

| Namespace | Technology | Count |
|-----------|------------|-------|
| `/common:` | Transversal | 13 (10 distributed + 3 maintainer-only) |
| `/workflow:` | Workflow (BMAD) — main path | 9 |
| `/team:` | Agent Teams | 3 |
| `/qa:` | QA & Testing | 5 |
| `/uiux:` | UI/UX & Accessibility | 7 |
| `/symfony:` | PHP/Symfony | 6 |
| `/flutter:` | Dart/Flutter | 6 |
| `/python:` | Python | 6 |
| `/react:` | React/TypeScript | 6 |
| `/reactnative:` | React Native | 6 |
| `/angular:` | Angular | 2 |
| `/csharp:` | C#/.NET | 2 |
| `/laravel:` | PHP/Laravel | 2 |
| `/vuejs:` | Vue.js | 2 |
| `/vite:` | Vite | 3 |
| `/vercel:` | Vercel | 2 |
| `/tauri:` | Tauri | 1 |
| `/wordpress:` | WordPress | 1 |
| `/php:` | PHP | 1 |
| `/ruby:` | Ruby / Rails | 1 |
| `/rust:` | Rust / Axum | 1 |
| `/docker:` | Docker/Infrastructure | 5 |
| `/coolify:` | Coolify/PaaS | 5 |
| `/kubernetes:` | Kubernetes/Infrastructure | 5 |
| `/opentofu:` | OpenTofu/IaC | 5 |
| `/ansible:` | Ansible/Automation | 5 |
| `/hcloud:` | Hcloud/Hetzner Cloud | 5 |
| `/pgbouncer:` | PgBouncer/Connection Pooling | 5 |
| `/frankenphp:` | FrankenPHP/PHP Server | 5 |
| `/paperclip:` | Paperclip AI-workforce orchestration | 4 |
| `/gate:` | Quality Gates (BMAD v6) | 1 (`/bear-gate:check`, 11 modes) |
| `/project:` | Project Management (BMAD v6) | 5 |

---

## Common Commands (`/common:`)

Transversal commands for all projects.

> Pre-commit, pre-merge and release checks are `/bear-gate:check commit|merge|release` (see [Quality Gate Commands](#quality-gate-commands-gate)).

### Generation Commands

| Command | Description |
|---------|-------------|
| `/bear-common:generate-changelog` | Generate changelog from commits |
| `/bear-common:architecture-decision` | Document an ADR |

> Sprint-lifecycle commands live in [`/workflow:`](#workflow-commands-workflow); the daily stand-up is `/bear-workflow:status --standup`.

### Configuration Commands

| Command | Description |
|---------|-------------|
| `/bear-common:init --context` | Analyze the codebase and configure the project context |
| `/bear-common:setup-rtk` | Install and configure RTK (token optimization) |

### Continuous Loop Commands

| Command | Description |
|---------|-------------|
| `/bear-common:ralph-run` | Run Claude in continuous loop until DoD passes |

Ralph Wiggum executes Claude iteratively until the task is complete:

```bash
/bear-common:ralph-run "Implement user authentication"
/bear-common:ralph-run --full "Fix the login bug"  # With all DoD checks
```

**Definition of Done validators:**
- `command`: Run tests, lint, build
- `output_contains`: Check for completion marker
- `file_changed`: Verify documentation updated
- `hook`: Integrate with quality-gate.sh
- `human`: Manual approval gate

> **Note:** `/bear-common:full-audit` and `/bear-common:ralph-sprint` were removed in v6.0. Use `/bear-team:audit --sequential` and `/bear-team:delivery --phase=implementation --engine=teams --ralph-mode` instead. See [Migration Guide](MIGRATION-v6.md).

### DevOps Commands

| Command | Description |
|---------|-------------|
| `/bear-common:setup-ci` | Configure CI/CD pipeline |
| `/bear-docker:optimize` | Optimize Docker configuration |

### Codebase Packing (v7.33+)

| Command | Description |
|---------|-------------|
| `/bear-common:pack-repo` | Pack the codebase into a single AI-friendly file (XML/Markdown/Plain/JSON). Wrapper around [Repomix](https://github.com/yamadashy/repomix) with native shell fallback. Token counting included. Options : `--format`, `--output`, `--compress`, `--include`, `--exclude`, `--mcp`, `--fallback`. |

### Development Commands

| Command | Description |
|---------|-------------|
| `/bear-qa:tdd` | Fix bug using TDD methodology (see [QA Recette Commands](#qa-recette-commands-qa)) |

### UI/UX Commands

| Command | Description |
|---------|-------------|
| `/bear-uiux:audit` | Complete UI/UX/Accessibility audit |
| `/bear-uiux:component-spec` | Full component specification (UI + UX + A11y) |
| `/bear-uiux:design-tokens` | Define design system tokens |
| `/bear-uiux:user-flow` | Design user journey and flow |
| `/bear-uiux:a11y-audit` | WCAG 2.2 AAA accessibility audit |
| `/bear-uiux:a11y-component` | Accessibility specs for a component |
| `/bear-uiux:generate-design-md` | Generate root `DESIGN.md` from template (auto-detect Tailwind / W3C tokens). Options : `--from-tailwind`, `--from-tokens`, `--interactive`. Convention : `design-md-convention` skill. (v7.34+) |

### Technology Commands

| Command | Description |
|---------|-------------|
| `/bear-common:add-technology` | Add a new technology to bear-craft (maintainer-only: available in a clone of the bear-craft repository, not installed in projects since 8.24.0) |

Add a complete technology stack to bear-craft with best practices:

```bash
/bear-common:add-technology "nextjs"
/bear-common:add-technology "golang" backend
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
| `/bear-team:audit` | Parallel multi-tech audit (Agent Teams) |
| `/bear-team:security` | Parallel security review (Agent Teams) |
| `/bear-team:delivery` | Full sprint lifecycle — writing + implementation (Agent Teams); `--phase=implementation` implements existing stories (replaced the former sprint command in 9.0) |
| skill `sub-agents-patterns` | Sub-agent orchestration patterns for Agent Teams (a skill since 8.26.0, no longer a command) |

---

## Workflow Commands (`/workflow:`)

BMAD-inspired workflow system adapted to project complexity. Since Phase 3 of the PM simplification, the whole sprint lifecycle is covered by **9 commands**; `.bmad/sprint-status.yaml` is the single source of truth for status.

**Main path:** `/bear-workflow:init` → `plan` → `design` → `start` → `implement` → `review` → `retro` (with `/bear-workflow:status` at any time). `/bear-workflow:auto-sprint <N>` chains start → … → merge in one run.

| Command | Description |
|---------|-------------|
| `/bear-workflow:init` | Analyze project context and recommend the track |
| `/bear-workflow:plan` | PRD + backlog (default); `--research` adds the research phase; `--only=prd` / `--only=backlog` runs a single document |
| `/bear-workflow:design` | Technical specification; `--constitution` generates the project constitution |
| `/bear-workflow:start <N>` | Prepare a sprint: sprint folder, `sprint-status.yaml` entries, task breakdown (`--tasks-only` decomposes an existing sprint) |
| `/bear-workflow:implement [<N>]` | Sprint development in TDD/BDD, sequential by default; `--story <US-ID>`, `--epic <EPIC>`, `--queue` / `--resume` (batch queue), `--parallel N` (delegates to `/bear-team:delivery --phase=implementation`), `--auto` |
| `/bear-workflow:status` | Where am I + next action; `--board` (Kanban), `--queue` (batch queue), `--standup`, `--gates` |
| `/bear-workflow:review` | Sprint review summary |
| `/bear-workflow:retro` | Sprint retrospective |
| `/bear-workflow:auto-sprint <N>` | End-to-end orchestrator (PO/SM): start → decompose → validate → implement → PR → CI watch → review → retro → merge, each step in an isolated sub-agent (`--from-prd` starts from a PRD) |

Story transitions are handled by `/bear-project:backlog` (`next story`, `move story <US> <status>`, `move story --auto`).

---

## Symfony Commands (`/symfony:`)

PHP backend development with Symfony.

### Code Generation

| Command | Description |
|---------|-------------|
| `/bear-symfony:generate-crud <Entity>` | Generate CRUD operations |
| `/bear-symfony:generate-command <Name>` | Generate CLI command |
| `/bear-symfony:api-endpoint <Resource>` | Generate API endpoint |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-symfony:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |

### Database Commands

| Command | Description |
|---------|-------------|
| `/bear-symfony:migration-plan <Change>` | Plan database migration |
| `/bear-symfony:optimize-doctrine` | Optimize Doctrine queries |

---

## Flutter Commands (`/flutter:`)

Mobile development with Flutter/Dart.

### Code Generation

| Command | Description |
|---------|-------------|
| `/bear-flutter:generate-feature <Name>` | Generate feature module |
| `/bear-flutter:generate-widget <Name>` | Generate widget |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-flutter:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |
| `/bear-flutter:analyze-performance` | Performance analysis |

### Testing Commands

| Command | Description |
|---------|-------------|
| `/bear-flutter:golden-update` | Update golden files |

### Localization Commands

| Command | Description |
|---------|-------------|
| `/bear-flutter:localization-check` | Validate i18n setup |

---

## Python Commands (`/python:`)

Python backend and API development.

### Code Generation

| Command | Description |
|---------|-------------|
| `/bear-python:generate-endpoint <Name>` | Generate API endpoint |
| `/bear-python:generate-model <Name>` | Generate data model |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-python:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |

### Type Commands

| Command | Description |
|---------|-------------|
| `/bear-python:type-coverage` | Analyze type hint coverage |

### Async Commands

| Command | Description |
|---------|-------------|
| `/bear-python:async-check` | Validate async/await usage |

### Dependency Commands

| Command | Description |
|---------|-------------|
| `/bear-python:dependency-audit` | Audit dependencies for vulnerabilities |

---

## React Commands (`/react:`)

Frontend development with React/TypeScript.

### Code Generation

| Command | Description |
|---------|-------------|
| `/bear-react:generate-component <Name>` | Generate React component |
| `/bear-react:generate-hook <Name>` | Generate custom hook |
| `/bear-react:storybook-story <Component>` | Generate Storybook story |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-react:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |

### Performance Commands

| Command | Description |
|---------|-------------|
| `/bear-react:bundle-analyze` | Analyze bundle size |

### Accessibility Commands

| Command | Description |
|---------|-------------|
| `/bear-react:accessibility-check` | A11y validation |

---

## React Native Commands (`/reactnative:`)

Mobile development with React Native.

### Code Generation

| Command | Description |
|---------|-------------|
| `/bear-reactnative:generate-screen <Name>` | Generate screen component |
| `/bear-reactnative:native-module <Name>` | Generate native module |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-reactnative:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |

### App Commands

| Command | Description |
|---------|-------------|
| `/bear-reactnative:app-size` | Analyze app bundle size |
| `/bear-reactnative:deep-link <Route>` | Configure deep linking |
| `/bear-reactnative:store-prepare` | Prepare for app store |

---

## Angular Commands (`/angular:`)

Frontend development with Angular standalone components and signals.

### Code Generation

| Command | Description |
|---------|-------------|
| `/bear-angular:generate-component <Name>` | Generate standalone component with tests |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-angular:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |

---

## C#/.NET Commands (`/csharp:`)

Backend development with C#/.NET, Clean Architecture, and CQRS.

### Code Generation

| Command | Description |
|---------|-------------|
| `/bear-csharp:generate-feature <Name>` | Generate complete CQRS feature (entity, commands, queries, endpoints) |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-csharp:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |

---

## Laravel Commands (`/laravel:`)

PHP backend development with Laravel, Clean Architecture, and Pest PHP.

### Code Generation

| Command | Description |
|---------|-------------|
| `/bear-laravel:generate-controller <Name>` | Generate API controller with Form Request, Resource, and Policy |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-laravel:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |

---

## Vue.js Commands (`/vuejs:`)

Frontend development with Vue.js 3, Composition API, and TypeScript.

### Code Generation

| Command | Description |
|---------|-------------|
| `/bear-vuejs:generate-component <Name>` | Generate component with test, types, and Storybook story |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-vuejs:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |

---

## Vite Commands (`/vite:`)

Framework-agnostic Vite projects only — vanilla JS/TS apps, library authoring, multi-page apps, Workers/WASM entries. For React/Vue/Angular/Svelte's own Vite tooling, use `/bear-react:*`, `/bear-vuejs:*`, `/bear-angular:*` commands instead.

### Code Generation

| Command | Description |
|---------|-------------|
| `/bear-vite:scaffold-project` | Scaffold a new Vite project (`vanilla-ts`/`lit-ts` template) or a library skeleton |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-vite:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |
| `/bear-vite:check-library-build` | Validate `build.lib` output and `vite-plugin-dts` `.d.ts` generation |

---

## Vercel Commands (`/vercel:`)

Framework-agnostic Vercel platform features only — `vercel.json`, Serverless Functions (Node.js/Fluid Compute runtime), ISR, Cron Jobs, Storage. Not a Next.js stack (no `/nextjs:*` namespace exists) — for framework-specific routing/rendering, use `/bear-react:*`, `/bear-vuejs:*`, `/bear-angular:*` instead.

### Code Generation

| Command | Description |
|---------|-------------|
| `/bear-vercel:deploy-config` | Detect project shape and generate/validate a `vercel.json` |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-vercel:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |

---

## Ruby / Rails Commands (`/ruby:`)

Ruby 4.0 + Rails 8.1: Rails Way first, service/form/query objects when code grows, Hotwire, Solid Queue, RSpec or Minitest, RuboCop and Brakeman.

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-ruby:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 |

---

## Rust / Axum Commands (`/rust:`)

Rust 1.99 (edition 2024) + Axum 0.8: layered Cargo workspace, Tokio, Tower middleware, SQLx compile-time checked queries, thiserror errors mapped to RFC 9457, cargo-nextest, Clippy and cargo-deny.

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-rust:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 |

---

## Tauri Commands (`/tauri:`)

Tauri v2 (2.12, community): desktop and mobile apps with a Rust core and a framework-agnostic web frontend — commands and IPC, capabilities and scoped permissions, CSP and the Isolation pattern, plugins, signed updater, `tauri::test` mock runtime, `mockIPC` and WebdriverIO E2E.

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-tauri:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 |

---

## WordPress Commands (`/wordpress:`)

WordPress 7.1 (community): plugins and block themes — plugin header and bootstrap, hooks, blocks (`block.json` apiVersion 3, `render.php`, blocks manifest), `theme.json`, REST API with mandatory `permission_callback`, WP-CLI, WPCS + PHPStan, wp-env, `WP_UnitTestCase` and Playwright E2E. WooCommerce (HPOS, Store API, Cart/Checkout blocks) ships as the on-demand `woocommerce` skill and is audited only when the project depends on it.

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-wordpress:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 |

---

## PHP Commands (`/php:`)

Standalone PHP development with PSR-12 and PHPStan.

| Command | Description |
|---------|-------------|
| `/bear-php:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |

---

## Docker Commands (`/docker:`)

Infrastructure and containerization commands.

### Setup Commands

| Command | Description |
|---------|-------------|
| `/bear-docker:compose-setup <Services>` | Generate docker-compose configuration |
| `/bear-docker:architecture <Project>` | Design complete Docker architecture |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/bear-docker:debug <Symptom>` | Diagnose Docker issues |
| `/bear-docker:cicd-pipeline <Platform>` | Generate CI/CD pipeline |
| `/bear-docker:optimize <Target>` | Optimize Docker configuration |

---

## Coolify Commands (`/coolify:`)

Infrastructure deployment with Coolify self-hosted PaaS.

| Command | Description |
|---------|-------------|
| `/bear-coolify:setup` | Initialize project for Coolify deployment |
| `/bear-coolify:deploy` | Deploy application to Coolify |
| `/bear-coolify:debug` | Diagnose Coolify deployment issues |
| `/bear-coolify:backup` | Configure and manage backups |
| `/bear-coolify:optimize` | Optimize Coolify deployment |

---

## Kubernetes Commands (`/kubernetes:`)

Infrastructure orchestration with Kubernetes.

### Architecture Commands

| Command | Description |
|---------|-------------|
| `/bear-kubernetes:architecture <Project>` | Design complete Kubernetes architecture |
| `/bear-kubernetes:deploy-setup <Stack>` | Setup GitOps deployment pipeline |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/bear-kubernetes:debug <Symptom>` | Diagnose Kubernetes issues |
| `/bear-kubernetes:security-audit [Scope]` | Kubernetes security posture audit |
| `/bear-kubernetes:optimize [Target]` | Optimize Kubernetes resource usage and costs |

---

## OpenTofu Commands (`/opentofu:`)

Infrastructure as Code with OpenTofu.

### Architecture Commands

| Command | Description |
|---------|-------------|
| `/bear-opentofu:architecture <Project>` | Design complete OpenTofu IaC architecture |
| `/bear-opentofu:deploy-setup <Platform>` | Setup CI/CD pipeline for OpenTofu |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/bear-opentofu:debug <Symptom>` | Diagnose OpenTofu state issues and drift |
| `/bear-opentofu:security-audit [Scope]` | Audit OpenTofu security posture |
| `/bear-opentofu:optimize [Target]` | Cost optimization and resource analysis |

---

## Ansible Commands (`/ansible:`)

Infrastructure automation with Ansible.

### Architecture Commands

| Command | Description |
|---------|-------------|
| `/bear-ansible:architecture <Project>` | Design complete Ansible automation architecture |
| `/bear-ansible:deploy-setup <Platform>` | Setup CI/CD pipeline for Ansible |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/bear-ansible:debug <Symptom>` | Diagnose Ansible playbook issues |
| `/bear-ansible:security-audit [Scope]` | Audit Ansible security posture |
| `/bear-ansible:optimize [Target]` | Optimize Ansible performance and quality |

---

## Hcloud Commands (`/hcloud:`)

Hetzner Cloud infrastructure management with hcloud CLI.

### Architecture Commands

| Command | Description |
|---------|-------------|
| `/bear-hcloud:architecture <Project>` | Design complete Hetzner Cloud infrastructure architecture |
| `/bear-hcloud:deploy-setup <Platform>` | Setup CI/CD pipeline for Hetzner Cloud deployments |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/bear-hcloud:debug <Symptom>` | Diagnose Hetzner Cloud infrastructure issues |
| `/bear-hcloud:security-audit [Scope]` | Audit Hetzner Cloud security posture |
| `/bear-hcloud:optimize [Target]` | Optimize Hetzner Cloud cost and performance |

---

## PgBouncer Commands (`/pgbouncer:`)

PgBouncer connection pooling management.

### Architecture Commands

| Command | Description |
|---------|-------------|
| `/bear-pgbouncer:architecture <Project>` | Design complete PgBouncer connection pooling architecture |
| `/bear-pgbouncer:deploy-setup <Platform>` | Setup PgBouncer deployment with Docker, Kubernetes, or systemd |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/bear-pgbouncer:debug <Symptom>` | Diagnose PgBouncer connection pool issues from symptoms |
| `/bear-pgbouncer:security-audit [Scope]` | Audit PgBouncer security posture |
| `/bear-pgbouncer:optimize [Target]` | Optimize PgBouncer pool performance and connection utilization |

---

## FrankenPHP Commands (`/frankenphp:`)

FrankenPHP PHP application server management.

### Architecture Commands

| Command | Description |
|---------|-------------|
| `/bear-frankenphp:architecture <Project>` | Design complete FrankenPHP serving architecture |
| `/bear-frankenphp:deploy-setup <Platform>` | Generate FrankenPHP deployment files for Docker, Kubernetes, or standalone |

### Operations Commands

| Command | Description |
|---------|-------------|
| `/bear-frankenphp:debug <Symptom>` | Diagnose FrankenPHP worker and Caddyfile issues from symptoms |
| `/bear-frankenphp:security-audit [Scope]` | Audit FrankenPHP security posture |
| `/bear-frankenphp:optimize [Target]` | Optimize FrankenPHP worker performance and throughput |

---

## Paperclip Commands (`/paperclip:`)

Paperclip is an open-source AI-workforce orchestration platform (Node.js + TypeScript + React UI, MIT, v2026.1106.0+). It exposes a control plane that governs AI agents (budgets, approvals, audit trails) and adapters (Claude Code, Codex, Gemini, HTTP, process) that execute work.

### Generation Commands

| Command | Description |
|---------|-------------|
| `/bear-paperclip:generate-adapter <name> <kind>` | Scaffold a custom adapter (`local` \| `process` \| `http`) implementing the full `AdapterContract` |
| `/bear-paperclip:generate-agent-config <name>` | Produce an `agent.yaml` with budget, skills, approvals, adapter binding |
| `/bear-paperclip:setup-company <name>` | Bootstrap a new Paperclip company end-to-end (install, company, goal, budget, adapter, first agent) |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/bear-paperclip:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |

---

## Project Commands (`/project:`)

Available with Project installation. Since Phase 2 of the PM simplification, the many per-entity commands were merged into five commands with subcommands (`backlog`, `reverse`, `trace`, `report`, `migrate`); the old names are listed in [MIGRATION-v9.md](MIGRATION-v9.md).

### Backlog (`/bear-project:backlog <action> <entity>`)

| Command | Description |
|---------|-------------|
| `/bear-project:backlog add epic <Name>` | Create a new EPIC |
| `/bear-project:backlog add story <Epic> <Name>` | Create a User Story |
| `/bear-project:backlog add task <US> <Desc> <Est>` | Create a task |
| `/bear-project:backlog list epic` | List all EPICs |
| `/bear-project:backlog list story` | List User Stories |
| `/bear-project:backlog list task` | List tasks |
| `/bear-project:backlog edit epic <Epic>` | Update an EPIC |
| `/bear-project:backlog edit story <US>` | Update a User Story |
| `/bear-project:backlog move task <Task> <Status>` | Change task status |
| `/bear-project:backlog move story <US> <Status>` | Transition a story (also `next story`, `move story --auto`) |

> Backlog generation, sprint breakdown and the Kanban board are workflow commands: `/bear-workflow:plan --only=backlog`, `/bear-workflow:start <N>`, `/bear-workflow:status --board`. PRD, tech spec, batch queue and constitution: `/bear-workflow:plan --only=prd`, `/bear-workflow:design`, `/bear-workflow:implement --queue`, `/bear-workflow:design --constitution` (see [Workflow Commands](#workflow-commands-workflow)).

### BMAD v6 Commands

| Command | Description |
|---------|-------------|
| `/bear-project:migrate --analyze` | Analyze current backlog structure |
| `/bear-project:migrate` | Convert backlog to BMAD v6 format |
| `/bear-project:migrate --stories` | Add missing BMAD fields to stories |
| `/bear-project:migrate --resync` | Synchronize backlog files and YAML |
| `/bear-project:migrate --dry-run` | Preview the migration without writing |

### SDD v2.0 Commands

| Command | Description |
|---------|-------------|
| `/bear-project:trace [--scope] [--id]` | Display bidirectional traceability matrix |
| `/bear-project:trace --gaps` | Analyze requirement coverage gaps |
| `/bear-project:trace --by-priority` | Coverage map grouped by priority |
| `/bear-project:reverse scan [--scope]` | Analyze codebase and generate structured inventory |
| `/bear-project:reverse prd` | Generate PRD from existing codebase (brownfield) |
| `/bear-project:reverse stories` | Generate user stories from existing features |
| `/bear-project:reverse gaps` | Compare specifications with actual code |
| `/bear-project:reverse all` | Run scan, prd, stories and gaps in sequence |
| `/bear-gate:check --phase=<phase>` | Run spec verification checkpoints (pre-sprint, pre-impl, post-impl, pre-merge) |

### Reports (`/bear-project:report`)

| Command | Description |
|---------|-------------|
| `/bear-project:report burndown [--sprint]` | Generate sprint burndown chart (Mermaid) |
| `/bear-project:report metrics [--sprint]` | Generate project metrics dashboard |
| `/bear-project:report deps [--sprint]` | Generate story dependency graph (Mermaid) |
| `/bear-project:report deps --critical [--sprint]` | Identify critical path for sprint optimization |

### Sprint Development (`/bear-workflow:implement`, part of the workflow path)

Orchestrates complete sprint development in TDD/BDD mode:

```bash
/bear-workflow:implement 1        # Sprint 1
/bear-workflow:implement next     # Next incomplete sprint
/bear-workflow:implement current  # Currently active sprint
/bear-workflow:implement --story US-003      # One story
/bear-workflow:implement --epic EPIC-002     # All stories of an epic
/bear-workflow:implement --queue [--resume]  # Batch queue (.bmad/batch-queue.yaml)
/bear-workflow:implement --parallel 3        # Parallel engine (/bear-team:delivery --phase=implementation)
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

## Sprint Status Commands

Story routing lives in `/bear-project:backlog`; status is read with `/bear-workflow:status`.

| Command | Description |
|---------|-------------|
| `/bear-project:backlog next story` | Get next ready-for-dev story |
| `/bear-project:backlog move story <ID> <status>` | Transition story status |
| `/bear-project:backlog move story --auto` | Execute automatic routing rules (`routing.auto_transitions`, also applied after every transition) |
| `/bear-workflow:status` | Phase, sprint metrics and next action |
| `/bear-workflow:implement` | Sprint development |

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
| `/bear-gate:check prd` | Validate PRD (≥80% threshold) |
| `/bear-gate:check spec` | Validate Tech Spec (≥90% threshold) |
| `/bear-gate:check backlog` | Validate INVEST compliance |
| `/bear-gate:check story <ID>` | Validate story Definition of Done |
| `/bear-gate:check sprint` | Validate sprint readiness |
| `/bear-gate:check alignment [story-id]` | Validate spec-code alignment (≥85% threshold) |
| `/bear-gate:check commit [--fix] [--staged]` | Pre-commit verification |
| `/bear-gate:check merge [source] [target]` | Pre-merge verification |
| `/bear-gate:check release <version>` | Release checklist |
| `/bear-gate:check <architecture|code-quality|security|testing|all>` | Audit by axis; `all` runs the 4 axes and scores them out of 100 (replaces the `check-*` commands in 9.0) |
| `/bear-gate:check --phase=<pre-sprint\|pre-impl\|post-impl\|pre-merge>` | Lifecycle checkpoint |

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

## Removed commands (9.0)

The 52 deprecated PM commands and the whole sprint namespace were removed in 9.0, together with `/bear-common:research-context7` and `/bear-uiux:orchestrator` (deprecated in 8.27.0). See [MIGRATION-v9.md](MIGRATION-v9.md) for the complete old → new table.

## Removed commands (10.0)

The 66 redirect stubs deprecated in 9.0 were removed in 10.0: the five per-axis commands of each of the 13 stacks that had them (`angular`, `csharp`, `flutter`, `laravel`, `paperclip`, `php`, `python`, `react`, `reactnative`, `symfony`, `vercel`, `vite`, `vuejs`) and the sprint command of the team namespace. See [MIGRATION-v10.md](MIGRATION-v10.md#removed-in-100) for the old → new table. The per-axis checklists are installed in `.claude/references/<tech>/checks/`.

---

## QA Recette Commands (`/qa:`)

Automated acceptance testing with Claude in Chrome.

| Command | Description |
|---------|-------------|
| `/bear-qa:recette` | Execute automated acceptance tests via browser |
| `/bear-qa:fix` | Fix bugs from recette session (TDD workflow) |
| `/bear-qa:status` | Show recette session status and progress |
| `/bear-qa:regression` | View and manage regression test registry |
| `/bear-qa:status --report` | Generate recette report (MD/HTML/JSON) |
| `/bear-qa:tdd` | Fix a bug in TDD/BDD mode |

### Golden Rule

> **A fixed bug should NEVER reappear.**

All detected errors automatically generate regression tests.

### Usage Examples

```bash
# Test a specific story
/bear-qa:recette --scope=story --id=US-001

# Test all stories in a sprint
/bear-qa:recette --scope=sprint --id=Sprint-3

# Dry run to see test plan
/bear-qa:recette --scope=story --id=US-001 --dry-run

# Resume interrupted session
/bear-qa:recette --resume=REC-20260130-143022

# Record execution as GIF
/bear-qa:recette --scope=story --id=US-001 --record-gif

# Fix all bugs from a recette session
/bear-qa:fix --session=REC-20260130-143022

# Dry run: refine and document without fixing
/bear-qa:fix --session=REC-20260130-143022 --dry-run

# Fix critical bugs only
/bear-qa:fix --session=REC-20260130-143022 --severity=critical
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
See report documentation: `/bear-qa:status --report` (`Dev/i18n/{lang}/QA/commands/status.md`)

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
- `.claude/commands/bear-common/` for `/common:` namespace
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

See `Dev/i18n/base/Common/hooks/templates/examples/` for ready-to-use hook templates.

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
