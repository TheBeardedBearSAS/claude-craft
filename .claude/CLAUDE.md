# Claude-Craft - Multi-Technology Framework

**Version:** 7.19.0 | **Languages:** en, fr, es, de, pt

A comprehensive AI-assisted development framework for Claude Code with 11 technology stacks, 38 agents, 183 commands across 21 namespaces, and BMAD v6 project management.

---

## Supported Technologies (2026)

| Stack | Version | Architecture | Key Patterns |
|-------|---------|--------------|--------------|
| **.NET / C#** | 10 LTS / C# 14 | Clean Architecture | CQRS, MediatR, EF Core |
| **Symfony / PHP** | 8.0 / PHP 8.5 | Clean Architecture | DDD, Hexagonal, API Platform |
| **Flutter / Dart** | 3.38 / Dart 3.10 | Clean Architecture | BLoC, Riverpod, Material 3 |
| **React** | 19.x | Feature-based | Hooks, Zustand, React Query |
| **React Native** | 0.76+ | Feature-based | Navigation 7, Reanimated 3 |
| **Angular** | 19.x | Domain-driven | Signals, Standalone, RxJS |
| **Vue.js** | 3.5+ | Composition API | Pinia, Vitest, TypeScript |
| **Laravel** | 12.x / PHP 8.5 | Clean Architecture | Actions, Pest PHP, Sanctum |
| **Python** | 3.13+ | Clean Architecture | FastAPI, async/await, Pydantic |
| **PHP** | 8.5 | Clean Architecture | PSR-12, PHPStan, Pest PHP |

### Technology Quick Links

| Technology | Reference | Commands |
|------------|-----------|----------|
| C# / .NET | `@.claude/references/csharp/` | `/csharp:*` |
| Symfony / PHP | `@.claude/references/symfony/CLAUDE.md` | `/symfony:*` |
| Flutter / Dart | `@.claude/references/flutter/CLAUDE.md` | `/flutter:*` |
| React | `@.claude/references/react/` | `/react:*` |
| React Native | `@.claude/references/react-native/` | `/reactnative:*` |
| Angular | `@.claude/references/angular/` | `/angular:*` |
| Vue.js | `@.claude/references/vuejs/` | `/vuejs:*` |
| Laravel | `@.claude/references/laravel/` | `/laravel:*` |
| Python | `@.claude/references/python/` | `/python:*` |
| PHP | `@.claude/references/php/` | `/php:*` |

See `@.claude/INDEX.md` for condensed checklists and patterns.

---

## Available Commands (21 namespaces, 183 commands)

| Namespace | Key Commands | Count |
|-----------|-------------|-------|
| `/common:` | `pre-commit-check`, `ralph-run`, `setup-project-context`, `add-technology` | 13 |
| `/workflow:` | `init`, `analyze`, `plan`, `design`, `implement`, `status` | 9 |
| `/team:` | `audit`, `sprint`, `security`, `delivery` (Agent Teams) | 4 |
| `/qa:` | `recette`, `fix`, `tdd`, `regression`, `report` | 6 |
| `/uiux:` | `audit`, `a11y-audit`, `component-spec`, `design-tokens` | 7 |
| `/csharp:` | `check-compliance`, `check-architecture`, `generate-feature` | 6 |
| `/symfony:` | `check-architecture`, `check-compliance`, `generate-crud`, `api-endpoint` | 10 |
| `/flutter:` | `check-architecture`, `generate-feature`, `analyze-performance`, `golden-update` | 10 |
| `/react:` | `generate-component`, `check-architecture`, `accessibility-check`, `generate-hook` | 10 |
| `/reactnative:` | `generate-screen`, `check-architecture`, `deep-link`, `store-prepare` | 10 |
| `/angular:` | `generate-component`, `check-architecture`, `check-compliance` | 6 |
| `/vuejs:` | `generate-component`, `check-architecture`, `check-compliance` | 6 |
| `/laravel:` | `generate-controller`, `check-architecture`, `check-compliance` | 6 |
| `/python:` | `generate-endpoint`, `check-architecture`, `async-check`, `type-coverage` | 10 |
| `/php:` | `check-architecture`, `check-compliance`, `check-security` | 5 |
| `/sprint:` | `next-story`, `transition`, `status`, `dev` | 5 |
| `/gate:` | `validate-prd`, `validate-story`, `validate-backlog`, `validate-techspec`, `validate-alignment` | 7 |
| `/project:` | `run-sprint`, `run-epic`, `run-queue`, `generate-prd`, `board`, `trace`, `checkpoint`, `metrics` | 34 |
| `/docker:` | `compose-setup`, `architecture`, `debug`, `optimize` | 5 |
| `/coolify:` | `setup`, `deploy`, `debug`, `backup`, `optimize` | 5 |
| `/kubernetes:` | `architecture`, `deploy-setup`, `debug`, `security-audit`, `optimize` | 5 |

Full reference: [Commands](../docs/COMMANDS.md) | [CLI Reference](../docs/CLI-REFERENCE.md)

---

## Available Agents (38 agents)

| Category | Agents | Count |
|----------|--------|-------|
| **Common** | `@api-designer`, `@database-architect`, `@devops-engineer`, `@performance-auditor`, `@refactoring-specialist`, `@tdd-coach`, `@uiux-orchestrator`, `@ui-designer`, `@ux-ergonome`, `@accessibility-expert`, `@research-assistant`, `@ralph-conductor` | 12 |
| **Tech Reviewers** | `@symfony-reviewer`, `@flutter-reviewer`, `@react-reviewer`, `@python-reviewer`, `@angular-reviewer`, `@laravel-reviewer`, `@vuejs-reviewer`, `@reactnative-reviewer`, `@csharp-reviewer`, `@php-reviewer` | 10 |
| **Docker** | `@docker-dockerfile`, `@docker-compose`, `@docker-debug`, `@docker-cicd`, `@docker-architect` | 5 |
| **Coolify** | `@coolify-architect`, `@coolify-deployment`, `@coolify-debug`, `@coolify-monitoring` | 4 |
| **Kubernetes** | `@kubernetes-architect`, `@kubernetes-deployment`, `@kubernetes-debug`, `@kubernetes-security`, `@kubernetes-monitoring` | 5 |
| **Project** | `@product-owner`, `@tech-lead` | 2 |

Full reference: [Agents](../docs/AGENTS.md)

---

## BMAD v6 Framework

| Track | Setup | Phases | Best For |
|-------|-------|--------|----------|
| **Quick Flow** | < 5 min | Implement only | Bug fixes, hotfixes |
| **Standard** | < 15 min | Plan -> Design -> Implement | New features |
| **Enterprise** | < 30 min | Analyze -> Plan -> Design -> Implement | Platforms |

**Quality Gates:** PRD >=80% | Tech Spec >=90% | INVEST 6/6 | Sprint Ready 100% | Story DoD 100% | Spec Alignment >=85%

**Status Routing:** `backlog -> ready-for-dev -> in-progress -> review -> done` (any -> `blocked`)

**TDD Phases:** Red -> Green -> Refactor

---

## Ralph Wiggum

Continuous AI loop that runs Claude until task completion: `/common:ralph-run "task"`

**DoD Validators:** `command` | `output_contains` | `file_changed` | `hook` | `human`

## QA Recette

Automated acceptance testing via Chrome. **Golden Rule:** A fixed bug should NEVER reappear.

```bash
/qa:recette --scope=story --id=US-001      # Test a story
/qa:recette --scope=sprint --id=Sprint-3    # Test a sprint
/qa:recette --resume=REC-20260130-143022    # Resume session
```

**Prerequisites:** Chrome extension v1.0.36+ | Claude Code with `--chrome` or `/chrome`

> BMAD roles (bmad-master, pm, ba, architect, po, sm, dev, qa, qa-recette, ux) are integrated into workflow and sprint commands, not standalone agent files.

---

## Docker Requirement

**Always use Docker for commands to abstract from local environment.**

```bash
docker compose exec app php bin/console ...
docker compose exec app ./vendor/bin/phpunit
```

---

## Skills

| Skill | Topic |
|-------|-------|
| `/solid-principles` | SOLID patterns |
| `/kiss-dry-yagni` | Code simplicity |
| `/testing` | TDD/BDD practices |
| `/security` | Security guidelines |
| `/git-workflow` | Git best practices |
| `/documentation` | Documentation standards |
| `/workflow-analysis` | Analysis methodology |
| `/parallel-worktrees` | Concurrent Claude sessions |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Quickstart](../docs/QUICKSTART.md) | 5-minute getting started |
| [Prerequisites](../docs/PREREQUISITES.md) | Required dependencies |
| [CLI Reference](../docs/CLI-REFERENCE.md) | Full CLI documentation |
| [Commands](../docs/COMMANDS.md) | All commands |
| [Agents](../docs/AGENTS.md) | All agents |
| [FAQ](../docs/FAQ.md) | Common questions |
| [Troubleshooting](../docs/TROUBLESHOOTING.md) | Problem solving |

---

## Quick Start

```bash
# Install Claude Craft
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en

# Or with Makefile
make install-symfony TARGET=. RULES_LANG=en

# Start workflow
/workflow:init

# Use an agent
@tdd-coach Guide me through TDD for this feature

# Run audit
/team:audit --sequential
```

---

## Claude Code Compatibility

**Minimum Version:** 2.1.47 — See `@.claude/COMPATIBILITY.md` for full changelog (v2.1.20+).

---

## Best Practices

See `.claude/rules/12-context-management.md` for detailed guidance.

| Practice | Description |
|----------|-------------|
| **CLAUDE.md size** | Keep under 200 lines; use `.claude/rules/` for details |
| **Use `/clear`** | Between unrelated tasks to reset context |
| **Sub-agents** | Delegate investigations to keep main context clean |
| **Verification loops** | Always provide tests/expected outputs (2-3x quality improvement) |
| **Plan Mode** | Invest in planning for complex tasks (> 3 files) |
| **Parallel worktrees** | Use `git worktree` for concurrent sessions |
| **Hooks** | CLAUDE.md = suggestions. Hooks = requirements |

See `.claude/templates/hooks/` for ready-to-use hook templates.
