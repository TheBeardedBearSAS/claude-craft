# Claude-Craft - Multi-Technology Framework

**Version:** 8.8.1 | **Languages:** en, fr, es, de, pt

A comprehensive AI-assisted development framework for Claude Code with 11 technology stacks, 31 specialized agents (+39 infra agents on-demand), 125 commands across 15 namespaces, and BMAD v6 project management.

---

## Supported Technologies (2026)

| Stack | Version | Architecture | Key Patterns |
|-------|---------|--------------|--------------|
| **.NET / C#** | 10 LTS / C# 14 | Clean Architecture | CQRS, MediatR (ou alternative), EF Core |
| **Symfony / PHP** | 8.1 / PHP 8.4+ | Clean Architecture | DDD, Hexagonal, API Platform, HTTP-less apps, JsonStreamer |
| **Flutter / Dart** | 3.44 / Dart 3.12 | Clean Architecture | BLoC v9, Riverpod 3, Material 3, Impeller |
| **React** | 19.2 + Compiler 1.0 | Feature-based | Hooks, Zustand, React Query, Server Components |
| **React Native** | 0.85 (New Architecture) | Feature-based | Navigation 7, Reanimated 4, TurboModules |
| **Angular** | 21 (22 en RC) | Domain-driven | Signals, Standalone, Zoneless par défaut, httpResource |
| **Vue.js** | 3.5+ (3.6 beta Vapor) | Composition API | Pinia, Vitest, TypeScript, Alien Signals |
| **Laravel** | 13.x / PHP 8.5 | Clean Architecture | Actions, Pest 4, Sanctum, AI SDK, Passkey |
| **Python** | 3.14+ | Clean Architecture / Hexagonal | FastAPI, async/await, Pydantic, free-threading, JIT |
| **PHP** | 8.5 (Property Hooks 8.4+) | Clean Architecture | PSR-12, PHPStan Level 10, Pest 4 |
| **Paperclip** | 2026.403.0 | Two-layer (control plane + adapters) | Node.js 20+, TypeScript, Vitest, PostgreSQL, governance-first |

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
| Paperclip | `@.claude/references/paperclip/` | `/paperclip:*` |
| **Svelte** _(community)_ | `@.claude/references/svelte/CLAUDE.md` | — |

> **Note:** Svelte/SvelteKit is **community-maintained** and hors-scope officiel. Voir `.claude/references/svelte/CLAUDE.md` pour le disclaimer complet.

See `@.claude/INDEX.md` for condensed checklists and patterns.

---

## Available Commands (15 namespaces, 125 commands)

Core: `/common:*`, `/workflow:*`, `/team:*`, `/qa:*`, `/uiux:*` | Tech: `/symfony:*`, `/react:*`, `/flutter:*`, `/python:*`, `/angular:*`, `/vuejs:*`, `/laravel:*`, `/reactnative:*`, `/csharp:*`, `/php:*`, `/paperclip:*` | Infra (via `@devops-engineer`): Docker 29.4.3, Coolify v4.0.0 (stable), K8s 1.36.1, OpenTofu 1.12.0, Ansible 2.21.0, FrankenPHP 1.12.1, PgBouncer 1.25.2 (CVE-2026-6664/6667 patched) | Project: `/sprint:*`, `/gate:*`, `/project:*`

Full reference: [Commands](../docs/COMMANDS.md) | [CLI Reference](../docs/CLI-REFERENCE.md)

---

## Available Agents (31 specialized + 39 infra on-demand)

**Common** (20): `@api-designer`, `@database-architect`, `@devops-engineer`, `@performance-auditor`, `@refactoring-specialist`, `@tdd-coach`, `@uiux-orchestrator`, `@ui-designer`, `@ux-ergonome`, `@accessibility-expert`, `@research-assistant`, `@ralph-conductor`, `@security-auditor`, `@data-analyst`, `@migration-specialist`, `@cost-optimizer`, `@chaos-engineer`, `@devex-engineer`, `@mlops-engineer`, `@observability-engineer` | **Tech Reviewers** (11): `@{symfony,flutter,react,python,angular,laravel,vuejs,reactnative,csharp,php,paperclip}-reviewer` | **Infrastructure** (39): Docker, Coolify, K8s, OpenTofu, Ansible, Hcloud, PgBouncer, FrankenPHP — see [Agents](../docs/AGENTS.md) | **Project** (2): `@product-owner`, `@tech-lead`

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

`/solid-principles`, `/testing`, `/security`, `/git-workflow`, `/documentation`, `/kiss-dry-yagni`, `/workflow-analysis`, `/parallel-worktrees`, `/atomic-tasks`, `/design-md-convention`, `/architect`, `/debug-methodical`, `/socratic-brainstorm` — loaded on demand from `.claude/skills/`

## AI-First Development (Karpathy)

See `@.claude/rules/23-karpathy-principles.md` — 3 principles: **state assumptions explicitly**, **minimal code (no speculation)**, **surface confusion**. Apply to all LLM-assisted code. Extends rule 05 (KISS/DRY/YAGNI).

## Design System Convention

Projects with UI should include a root `DESIGN.md` file (template: `.claude/templates/DESIGN.md.template`). Skill `design-md-convention` and agents `@ui-designer`/`@ux-ergonome` auto-load it for consistent UI generation.

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

**Minimum Version:** 2.1.97 (CVE-2025-59536 patched) | **Recommended:** 2.1.159 (Opus 4.8 + Dynamic Workflows) — See `@.claude/COMPATIBILITY.md` for full changelog (v2.1.20+).

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
| **`/memory`** | Persistent session learnings across conversations (v2.1.59+) |
| **Pointers over copies** | Use `@path` references instead of copying code into CLAUDE.md |
| **Token optimization** | Use `/common:setup-rtk` for 55-65% token savings |
| **Sub-agent model** | Set `CLAUDE_CODE_SUBAGENT_MODEL=sonnet` for cost savings |

See `.claude/templates/hooks/` for ready-to-use hook templates.
