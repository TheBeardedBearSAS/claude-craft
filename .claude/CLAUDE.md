# Claude-Craft - Multi-Technology Framework

**Version:** 4.3.0 | **Languages:** en, fr, es, de, pt

A comprehensive AI-assisted development framework for Claude Code with 10 technology stacks, 34 agents, 127+ commands, and BMAD v6 project management.

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

---

## Quick Reference

See `@.claude/INDEX.md` for condensed checklists and patterns.

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

---

## Available Commands

### Common (`/common:`)
| Command | Description |
|---------|-------------|
| `/common:pre-commit-check` | Validate before commit |
| `/common:full-audit` | Complete project audit |
| `/common:ralph-run` | Run Claude in continuous loop |
| `/common:setup-project-context` | Configure project context |
| `/common:add-technology` | Add new tech stack |

### Workflow (`/workflow:`)
| Command | Description |
|---------|-------------|
| `/workflow:init` | Initialize workflow (auto-detect track) |
| `/workflow:analyze` | Research and exploration |
| `/workflow:plan` | Generate PRD, backlog |
| `/workflow:design` | Tech spec, architecture |
| `/workflow:implement` | Sprint development |
| `/workflow:status` | Show progress |

### BMAD v6 (`/bmad:`, `/sprint:`, `/gate:`, `/project:`)
| Command | Description |
|---------|-------------|
| `/bmad:init` | Initialize BMAD framework |
| `/bmad:status` | Show project status |
| `/sprint:next-story` | Get next ready story |
| `/sprint:transition` | Transition story status |
| `/gate:validate-prd` | PRD quality gate (≥80%) |
| `/gate:validate-story` | Story DoD validation |
| `/project:run-sprint` | Execute full sprint |

### C# / .NET (`/csharp:`)
| Command | Description |
|---------|-------------|
| `/csharp:check-compliance` | Full compliance audit |
| `/csharp:check-architecture` | Architecture validation |
| `/csharp:check-code-quality` | Code quality analysis |
| `/csharp:check-testing` | Test coverage analysis |
| `/csharp:check-security` | Security audit (OWASP) |
| `/csharp:generate-feature` | Generate CQRS feature |

### Symfony (`/symfony:`)
| Command | Description |
|---------|-------------|
| `/symfony:check-architecture` | Validate Clean Architecture |
| `/symfony:check-compliance` | DDD compliance check |
| `/symfony:generate-crud` | Generate CRUD operations |
| `/symfony:check-security` | Security audit |

### Flutter (`/flutter:`)
| Command | Description |
|---------|-------------|
| `/flutter:check-architecture` | Validate architecture |
| `/flutter:generate-feature` | Generate feature module |
| `/flutter:analyze-performance` | Performance analysis |

### React (`/react:`)
| Command | Description |
|---------|-------------|
| `/react:generate-component` | Generate component |
| `/react:check-architecture` | Validate architecture |
| `/react:accessibility-check` | A11y validation |

### Docker (`/docker:`)
| Command | Description |
|---------|-------------|
| `/docker:compose-setup` | Generate docker-compose |
| `/docker:architecture` | Design Docker architecture |
| `/docker:debug` | Diagnose Docker issues |
| `/docker:cicd-pipeline` | Generate CI/CD pipeline |

---

## Available Agents

### Common Agents (12)
| Agent | Expertise |
|-------|-----------|
| `@api-designer` | REST/GraphQL API design |
| `@database-architect` | Database optimization |
| `@devops-engineer` | CI/CD, Docker, deployment |
| `@performance-auditor` | Performance analysis |
| `@refactoring-specialist` | Safe code refactoring |
| `@tdd-coach` | Test-Driven Development |
| `@uiux-orchestrator` | UI/UX coordination |
| `@ui-designer` | Design systems, tokens |
| `@ux-ergonome` | User flows, cognitive ergonomics |
| `@accessibility-expert` | WCAG 2.2 AAA compliance |
| `@research-assistant` | Technical research |
| `@ralph-conductor` | Continuous loop orchestration |

### Technology Reviewers
| Agent | Technology |
|-------|------------|
| `@symfony-reviewer` | Symfony/PHP |
| `@flutter-reviewer` | Flutter/Dart |
| `@react-reviewer` | React |
| `@python-reviewer` | Python |
| `@angular-reviewer` | Angular |
| `@laravel-reviewer` | Laravel |
| `@vuejs-reviewer` | Vue.js |
| `@reactnative-reviewer` | React Native |

### BMAD v6 Agents (9)
| Agent | Role |
|-------|------|
| `@bmad-master` | Orchestrator |
| `@pm` | Product Manager |
| `@ba` | Business Analyst |
| `@architect` | System Architect |
| `@po` | Product Owner |
| `@sm` | Scrum Master |
| `@dev` | Developer (TDD) |
| `@qa` | QA Engineer |
| `@ux` | UX Designer |

### Docker Agents (5)
| Agent | Expertise |
|-------|-----------|
| `@docker-dockerfile` | Dockerfile optimization |
| `@docker-compose` | Compose orchestration |
| `@docker-debug` | Container troubleshooting |
| `@docker-cicd` | CI/CD pipelines |
| `@docker-architect` | Docker architecture |

---

## BMAD v6 Framework

### Development Tracks

| Track | Setup | Phases | Best For |
|-------|-------|--------|----------|
| **Quick Flow** | < 5 min | Implement only | Bug fixes, hotfixes |
| **Standard** | < 15 min | Plan → Design → Implement | New features |
| **Enterprise** | < 30 min | Analyze → Plan → Design → Implement | Platforms |

### Quality Gates

| Gate | Threshold | When |
|------|-----------|------|
| PRD Gate | ≥80% | Vision → PRD |
| Tech Spec Gate | ≥90% | PRD → Tech Spec |
| Backlog Gate | INVEST 6/6 | Tech Spec → Backlog |
| Sprint Ready | 100% | Backlog → Sprint |
| Story DoD | 100% | Dev → Done |

### Status-based Routing

```
backlog → ready-for-dev → in-progress → review → done
   ↓          ↓              ↓           ↓
   └──────────┴──────────────┴───────────┴→ blocked
```

TDD Phases: 🔴 Red → 🟢 Green → 🔵 Refactor

---

## Ralph Wiggum

Continuous AI loop that runs Claude until task completion.

```bash
/common:ralph-run "Implement user authentication"
```

**DoD Validators:**
| Type | Description |
|------|-------------|
| `command` | Run tests, lint, build |
| `output_contains` | Check for patterns |
| `file_changed` | Verify modifications |
| `hook` | Integrate with quality-gate.sh |
| `human` | Manual approval |

---

## Docker Requirement

**Always use Docker for commands to abstract from local environment.**

```bash
# Run commands in Docker
docker compose exec app php bin/console ...
docker compose exec app ./vendor/bin/phpunit
```

---

## Skills

Skills provide best practices loaded on-demand:

| Skill | Topic |
|-------|-------|
| `/solid-principles` | SOLID patterns |
| `/kiss-dry-yagni` | Code simplicity |
| `/testing` | TDD/BDD practices |
| `/security` | Security guidelines |
| `/git-workflow` | Git best practices |
| `/documentation` | Documentation standards |
| `/workflow-analysis` | Analysis methodology |

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
/common:full-audit
```
