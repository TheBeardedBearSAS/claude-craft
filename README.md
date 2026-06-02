# Claude Craft — Sprint workflow, multi-stack reviewers, and browser QA for Claude Code teams

> **The AI framework where bugs don't come back.** Sprint workflow, a continuous build loop, browser-based acceptance testing, and token-optimized multi-stack reviewers for tech leads adopting Claude Code with their team. **11 stacks, 5 languages, BMAD v6.**

## Why teams pick Claude Craft

Four things Claude Code + an Anthropic cookbook **won't** give you — they're workflow and orchestration, not prompts:

| Differentiator | What it does |
|----------------|--------------|
| 🏆 **QA Recette** (browser-based) | `/qa:recette` drives Chrome to run acceptance tests and auto-generates a regression test for every bug you fix — the Golden Rule: a fixed bug never comes back. No other Claude Code framework does this. |
| 🚀 **BMAD v6 sprint workflow** | Analyze → Plan → Design → Implement → QA, executed by Claude Code directly with quality gates. Quick Flow < 5 min, Standard < 15 min, Enterprise < 30 min. |
| 🔁 **Ralph Wiggum loop** | `/common:ralph-run` runs Claude in a continuous loop until your Definition of Done holds — adaptive circuit breaker, native `/goal` integration, DoD validators. |
| ⚡ **RTK token optimization** | Forked sub-agents, `context: fork` on heavy skills, 1h prompt caching, Haiku/Sonnet/Opus routing per task. Target 55-65% token savings vs raw Claude Code. |

Plus **11 stack-specific reviewers** (@symfony-reviewer, @react-reviewer, @python-reviewer…) that enforce SOLID/TDD/Clean Architecture so you don't re-type your conventions every sprint.

> **Why not just Claude Code + a cookbook?** Claude already knows React, Symfony, and Flutter patterns — so Claude Craft's value isn't the prompts, it's the **workflow and orchestration around them**: a sprint lifecycle with gates, a continuous loop with a real DoD, browser-based regression capture, and per-task token routing. Those are the parts a per-stack cookbook doesn't cover.



[![npm version](https://img.shields.io/npm/v/@the-bearded-bear/claude-craft)](https://www.npmjs.com/package/@the-bearded-bear/claude-craft)
[![npm downloads](https://img.shields.io/npm/dm/@the-bearded-bear/claude-craft)](https://www.npmjs.com/package/@the-bearded-bear/claude-craft)
[![Claude Code 2.1.97+](https://img.shields.io/badge/Claude%20Code-2.1.97%2B-blue)](https://code.claude.com)
[![CI](https://github.com/TheBeardedBearSAS/claude-craft/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/TheBeardedBearSAS/claude-craft/actions/workflows/npm-publish.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2FTheBeardedBearSAS%2Fclaude-craft%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/TheBeardedBearSAS/claude-craft/main)

A comprehensive framework for AI-assisted development with [Claude Code](https://claude.ai/code). Install standardized rules, agents, and commands for your projects across multiple technology stacks — **31 specialized agents (+39 infra agents on-demand), 125 commands across 15 namespaces, 48 skills**, all token-optimized via `context: fork` and sub-agent model routing.

## What's New in v8.7 (Audit 2026-05-18 — Phases 1→5 + refresh 2026-05-29)

**Reliability & security (Phases 1→5, v8.4.0 → v8.7.1):**

- **Automatic rollback on update failure** (v8.7.1) -- `claude-craft update` snapshots `.claude/` before running scripts and restores it on any partial failure (`--no-rollback` opt-out for CI)
- **Zero-prompt & team installs** (v8.7.0) -- `install --auto` auto-detects stack + locale (TTFV < 2 min), `install --from=<url>` syncs a team config from a Gist/internal endpoint, `skill add|list|remove` adds community skills from npm
- **Hardened CI** (v8.4.0 → v8.5.0) -- CodeQL SAST + Trivy CVE scan, mutation testing now **blocking** on PRs, `@`-include linter (`lint:includes`), post-publish smoke test, 12 property-based tests via `fast-check`. **937 Vitest tests** green.
- **Cost-optimized agents** (v8.5.0) -- 11 reviewer agents routed to `haiku`/`low` effort (-60% cost), 50 `check-*` commands to `haiku`, output filter threshold halved
- **Security baseline** (v8.4.0) -- Python JWT pattern switched HS256 → **EdDSA (Ed25519)** with 15-min tokens, `disallowedTools` deny-list on 7 destructive-capable agents, fixed dangerous-command hook template
- **New references** (v8.4.0) -- `paperclip/`, React Native New Architecture (JSI/TurboModules/Fabric), Vue Vapor Mode (beta)

**Refresh 2026-05-29:**

- **Claude Code 2.1.154 + Opus 4.8** -- recommended runtime, Dynamic Workflows (orchestrate tens-to-hundreds of background agents), `effort: max`; critical agents (`security-auditor`, `migration-specialist`, `database-architect`, `ralph-conductor`) routed to `opus`/`xhigh`, reviewers stay `haiku`/`low`
- **Repositioned around 4 defensible differentiators** -- QA Recette (browser regression capture), BMAD v6 sprint workflow, Ralph Wiggum loop, RTK token optimization (the workflow/orchestration a per-stack cookbook doesn't cover)
- **Honest stack count (19 → 11)** -- removed orphan Go/Rust reference stacks (no commands, no reviewers); **PHP is now a base layer** auto-included with Symfony/Laravel rather than a standalone selectable stack
- **Stack versions refreshed** -- Flutter 3.44/Dart 3.12, .NET 10 LTS/EF Core 10, Symfony 8.1, Laravel 13.12, Angular 21 (zoneless default), Docker 29.4.3, Ansible 2.21.0

> ← Versions antérieures (v8.0 → v8.3) : voir le [CHANGELOG](CHANGELOG.md) et [.claude/COMPATIBILITY.md](.claude/COMPATIBILITY.md).

## Install and First Result

```bash
# Install to your project (picks your tech stack interactively)
npx @the-bearded-bear/claude-craft

# Or install directly
npx @the-bearded-bear/claude-craft install ~/my-project --tech=react --lang=en

# Zero-prompt install (auto-detects your stack + locale, target < 2 min)
npx @the-bearded-bear/claude-craft install --auto

# Install from a team config URL (Gist or internal endpoint)
npx @the-bearded-bear/claude-craft install --from=https://org.example/cc-team.json

# Add a community skill from npm (claude-craft-skill-* convention)
npx @the-bearded-bear/claude-craft skill add claude-craft-skill-foo

# Open Claude Code and run your first audit
claude
/team:audit
```

That's it. You get an architecture, security, and quality audit of your project in minutes.

**New to Claude Craft?** Run `/getting-started` in Claude Code for a 10-minute guided tour that shows you the 3 most valuable commands for YOUR project.

> See [Quickstart](docs/QUICKSTART.md) for a step-by-step walkthrough with expected output at each stage.

## Why Claude Craft?

Claude Code is powerful on its own. Claude Craft makes it **consistent and team-ready**:

- **Standardized rules** -- SOLID, Clean Architecture, TDD enforced across your team, not just suggested
- **31 default agents + 39 infra agents on-demand** -- reviewers, architects, coaches that know your stack deeply (70 total potentially installable)
- **125 slash commands across 15 namespaces** -- repeatable workflows for audits, code generation, sprint management
- **Quality gates** -- automated checks at every stage from PRD to deployment
- **5 languages** -- English, French, Spanish, German, Portuguese

## Supported Technologies

| Stack | Version | Install Command |
|-------|---------|-----------------|
| **Symfony / PHP** | 8.0 / PHP 8.4+ | `--tech=symfony` |
| **React** | 19.2 + Compiler 1.0 | `--tech=react` |
| **Flutter / Dart** | 3.44 / Dart 3.12 | `--tech=flutter` |
| **Python** | 3.14+ / FastAPI | `--tech=python` |
| **Angular** | 20 LTS (ou 21) | `--tech=angular` |
| **Vue.js** | 3.5+ (3.6 beta Vapor) | `--tech=vuejs` |
| **React Native** | 0.85 (New Architecture) | `--tech=reactnative` |
| **C# / .NET** | 10 LTS / C# 14 | `--tech=csharp` |
| **Laravel** | 13.x / PHP 8.5 | `--tech=laravel` |
| **PHP** | 8.5 | `--tech=php` |
| **Paperclip** | 2026.403.0 | `--tech=paperclip` |

| **Docker** | 29.4.3 | `--tech=docker` |
| **Coolify** | v4.0.0 (stable) | `--tech=coolify` |
| **Kubernetes** | 1.36.1 | `--tech=kubernetes` |
| **OpenTofu** | 1.12.0 | `--tech=opentofu` |
| **Ansible** | 2.21.0 | `--tech=ansible` |
| **Hcloud** | 1.61+ | `--tech=hcloud` |
| **PgBouncer** | 1.25.2 (CVE-2026-6664/6667 patched) | `--tech=pgbouncer` |
| **FrankenPHP** | 1.12.1 | `--tech=frankenphp` |

See [Technologies](docs/TECHNOLOGIES.md) for full details.

## What's Included

| Category | Count | Examples |
|----------|-------|---------|
| **Agents** | 31 default (+ 39 infra on-demand) | `@tdd-coach`, `@api-designer`, `@symfony-reviewer`, `@kubernetes-architect`, `@hcloud-architect` |
| **Commands** | 125 across 15 namespaces | `/workflow:init`, `/team:audit`, `/react:generate-component` |
| **Skills** | 48 | Architecture, testing, security best practices |
| **Templates** | 21 | Code generation patterns, BMAD project templates |
| **Checklists** | 10 | Commit, feature, release quality gates |

See [Agents](docs/AGENTS.md) | [Commands](docs/COMMANDS.md) | [Skills](docs/SKILLS.md)

## Workflow Tracks

Claude Craft adapts to your project complexity with three development tracks:

| Track | Setup | Phases | Best For |
|-------|-------|--------|----------|
| **Quick Flow** | < 5 min | Implementation only | Bug fixes, hotfixes |
| **Standard** | < 15 min | Plan > Design > Implement | New features, refactoring |
| **Enterprise** | < 30 min | Analyze > Plan > Design > Implement | Platforms, migrations |

```bash
/workflow:init              # Auto-detects complexity
/workflow:init --quick      # Bug fix mode
/workflow:init --enterprise # Full methodology
```

See [BMAD Practical Guide](docs/BMAD-PRACTICAL-GUIDE.md) for the complete project management framework.

## Key Commands

These are the commands you'll use most:

| Command | What It Does |
|---------|-------------|
| `/workflow:init` | Start a development workflow (auto-detects track) |
| `/team:audit` | Full project audit (architecture, security, quality) |
| `/common:pre-commit-check` | Validate before committing |
| `/sprint:next-story` | Get next story ready for development |
| `/qa:tdd` | Test-Driven Development flow |
| `/gate:validate-story` | Check story meets Definition of Done |
| `/{tech}:check-architecture` | Verify architecture compliance |
| `/{tech}:generate-*` | Generate code following project patterns |
| `/common:ralph-run "task"` | Run Claude in continuous loop until task is done |
| `/qa:recette` | Automated acceptance testing via Chrome |

See [CLI Reference](docs/CLI-REFERENCE.md) for all 125 commands across 15 namespaces.

## Installation

> **Platform:** Linux and macOS. Windows is not tested and not officially supported.

### NPX (Recommended)

```bash
npx @the-bearded-bear/claude-craft install ~/my-project --tech=symfony --lang=en
```

### Clone + Makefile

```bash
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft
make install-symfony TARGET=~/my-project RULES_LANG=en
```

### YAML Configuration (Monorepos)

```yaml
# claude-projects.yaml
projects:
  - name: "my-monorepo"
    root: "~/Projects/my-monorepo"
    lang: "fr"
    modules:
      - path: "frontend"
        tech: react
      - path: "backend"
        tech: symfony
```

```bash
make config-install PROJECT=my-monorepo
```

See [Installation Guide](docs/INSTALLATION.md) | [Configuration](docs/CONFIGURATION.md)

## Use Claude Craft Without Claude Code

Claude Craft's principles and rules are available as pre-built bundles for other AI surfaces. No installation required — paste and go.

| Surface | Bundle | Doc |
|---------|--------|-----|
| ChatGPT / GPT-5 | `bundles/chatgpt/claude-craft-bundle.md` | [Multi-IDE Guide](docs/guides/MULTI-IDE.md) |
| Claude.ai (Web) / Claude Projects | `bundles/claude/claude-craft-bundle.md` | [Multi-IDE Guide](docs/guides/MULTI-IDE.md) |
| Gemini / Cursor / Windsurf | `bundles/gemini/claude-craft-bundle.md` | [Multi-IDE Guide](docs/guides/MULTI-IDE.md) |
| Codex CLI / other agents | `bundles/claude/claude-craft-bundle.md` | [Multi-IDE Guide](docs/guides/MULTI-IDE.md) |

See [`bundles/README.md`](bundles/README.md) for platform-specific installation instructions and token budgets.

### What Gets Installed

```
your-project/.claude/
  CLAUDE.md           # Minimal config (~200 tokens, auto-loaded)
  INDEX.md            # Quick reference summaries
  references/         # Full documentation (loaded on-demand via @)
  agents/             # AI specialist definitions
  commands/           # Slash commands
  skills/             # Best practices
  checklists/         # Quality gates
  templates/          # Code generation patterns
  hooks/              # Pre/Post tool execution scripts
  mcp/                # MCP server templates
```

Context usage is optimized: ~3,500 tokens always loaded vs ~70,000 if everything were inline (95% reduction).

## Documentation

| Document | Description |
|----------|-------------|
| [Quickstart](docs/QUICKSTART.md) | Get results in 10 minutes |
| [Installation](docs/INSTALLATION.md) | All installation methods |
| [Configuration](docs/CONFIGURATION.md) | Project configuration |
| [CLI Reference](docs/CLI-REFERENCE.md) | Full CLI documentation |
| [Commands](docs/COMMANDS.md) | All 125 commands |
| [Agents](docs/AGENTS.md) | All 31 default agents (+ 39 infra on-demand) |
| [Skills](docs/SKILLS.md) | Best practices reference |
| [Technologies](docs/TECHNOLOGIES.md) | Stack-specific guides |
| [BMAD Guide](docs/BMAD-PRACTICAL-GUIDE.md) | Project management framework |
| [Hooks](docs/HOOKS.md) | Pre/Post tool execution |
| [MCP](docs/MCP.md) | Model Context Protocol integration |
| [Privacy Policy](PRIVACY.md) | Data protection and GDPR compliance |
| [FAQ](docs/FAQ.md) | Common questions |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Problem solving |
| [Migration v7](docs/MIGRATION-v7.md) | Upgrade from previous versions |
| [Skills Publishing](docs/SKILLS-PUBLISHING.md) | Guide for publishing skills |
| [Compatibility](.claude/COMPATIBILITY.md) | Claude Code version compatibility |

### User Guides (Multilingual)

Step-by-step tutorials available in 5 languages:

| Guide | EN | FR | ES | DE | PT |
|-------|----|----|----|----|-----|
| Getting Started | [EN](docs/guides/en/01-getting-started.md) | [FR](docs/guides/fr/01-getting-started.md) | [ES](docs/guides/es/01-getting-started.md) | [DE](docs/guides/de/01-getting-started.md) | [PT](docs/guides/pt/01-getting-started.md) |
| Feature Development | [EN](docs/guides/en/03-feature-development.md) | [FR](docs/guides/fr/03-feature-development.md) | [ES](docs/guides/es/03-feature-development.md) | [DE](docs/guides/de/03-feature-development.md) | [PT](docs/guides/pt/03-feature-development.md) |
| Bug Fixing | [EN](docs/guides/en/04-bug-fixing.md) | [FR](docs/guides/fr/04-bug-fixing.md) | [ES](docs/guides/es/04-bug-fixing.md) | [DE](docs/guides/de/04-bug-fixing.md) | [PT](docs/guides/pt/04-bug-fixing.md) |

[All guides](docs/guides/index.md) | [Project Creation](docs/guides/en/02-project-creation.md) | [Tools Reference](docs/guides/en/05-tools-reference.md) | [Troubleshooting](docs/guides/en/06-troubleshooting.md) | [Backlog Management](docs/guides/en/07-backlog-management.md)

## Project Governance & Sustainability

Claude Craft is maintained by [The Bearded CTO](https://thebeardedcto.com), a solo founder with deep involvement in the AFUP and Symfony French ecosystem.

| Item | Status |
|------|--------|
| **Funding model** | Bootstrapped — no VC, no sponsorships. Sustainability via consulting + future Pro support tier. |
| **Maintenance commitment** | Active development since 2026-01. Targeting weekly minor releases, monthly minor versions. |
| **Bus factor** | Currently 1 (solo maintainer). [Co-maintainer search open](CHARTER.md) — looking for one tech lead from the AFUP / Symfony / Flutter / React community. |
| **Succession plan** | Documented in [CHARTER.md](CHARTER.md). MIT license guarantees indefinite community fork rights if maintainer disappears. |
| **Roadmap visibility** | [GitHub Issues](https://github.com/TheBeardedBearSAS/claude-craft/issues) + [CHANGELOG.md](CHANGELOG.md) + recurring `audit/YYYY-MM-DD-*` reports |
| **Decision process** | RFC via GitHub Discussions for breaking changes. ADRs in `docs/adr/` for architectural choices. |
| **Security disclosure** | See [SECURITY.md](SECURITY.md). 90-day disclosure timeline, GPG-signed advisories. |
| **License upgrade path** | MIT (free, perpetual). A future Commercial license is documented in `LICENSE-COMMERCIAL.md` (DRAFT) for support contracts; never restrictive of MIT rights. |

### For Enterprise Adopters

If you're considering Claude Craft for a team of 5+ developers and need :

- **SLA-backed support** with response times
- **Custom integration** for your stack
- **Onboarding consulting** for your team
- **DPA** (Data Processing Agreement) for RGPD compliance

Contact `flavien.metivier@gmail.com` to discuss a Pro support agreement. Pricing is project-based (no per-seat licensing).

## Training & Consulting

**Using Claude Code with your team and hitting friction?** The framework is free and open-source. The expertise behind it is available directly.

| Service | Best for | Format |
|---------|----------|--------|
| **Team onboarding** | 5–20 devs adopting Claude Code, conventions diverging | Half-day workshop |
| **Quality Gates calibration** | Adjusting BMAD thresholds to your stack and risk profile | 1-day audit |
| **Claude Code team training** | Structured adoption from solo to consistent team workflow | 2-day training |
| **Architecture consulting** | Migrating an existing codebase to BMAD v6 | 3–5 days |

→ [Contact TheBeardedCTO](mailto:contact@thebeardedcto.dev) to discuss your situation. No commitment.

📅 **Need help getting started?** Book a free 30-minute discovery call: [https://calendly.com/the-bearded-cto](https://calendly.com/the-bearded-cto)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Warranty Disclaimer

THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. See [LICENSE](LICENSE) for full terms.

---

Built for [Claude Code](https://claude.ai/code) by Anthropic. Inspired by Clean Architecture and Domain-Driven Design principles.
