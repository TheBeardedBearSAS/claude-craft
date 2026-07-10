# ⚡ AI Craft — Multi-AI Development Framework

> **The AI framework where bugs don't come back.** Sprint workflow, a continuous build loop, browser-based acceptance testing, and token-optimized multi-AI reviewers for teams using **Vibe, Codex, OpenCode, Claude Code, Cursor, or GitHub Copilot**. **11 stacks, 5 languages, BMAD v6.**

> **🔄 Transition en cours : Claude Craft → AI Craft**
> 
> Cette branche (`refactor/ai-craft`) représente la transition vers **AI Craft**, une version **multi-provider** du framework. 
> **Statut actuel** : ✅ Architecture de base implémentée | 🟡 Migration des agents en cours | ⏳ Tests multi-provider à compléter
> 
> [Voir la roadmap de migration](#-roadmap-de-migration-vers-ai-craft) en bas de ce fichier.
>
> Pour le détail de l'architecture multi-provider (Vibe, Codex, OpenCode, Claude Code, Cursor), voir [`.claude/AI-CRAFT.md`](.claude/AI-CRAFT.md).

## Why teams pick AI Craft

AI Craft extends the proven Claude Craft methodology to work with **any AI provider**, not just Claude Code. Four things **any single AI tool** won't give you — they're workflow and orchestration, not prompts:

Four things Claude Code + an Anthropic cookbook **won't** give you — they're workflow and orchestration, not prompts:

| Differentiator | What it does |
|----------------|--------------|
| 🏆 **QA Recette** (browser-based) | `/qa:recette` drives Chrome to run acceptance tests and auto-generates a regression test for every bug you fix — the Golden Rule: a fixed bug never comes back. No other Claude Code framework does this. |
| 🚀 **BMAD v6 sprint workflow** | Analyze → Plan → Design → Implement → QA, executed by Claude Code directly with quality gates. Quick Flow < 5 min, Standard < 15 min, Enterprise < 30 min. |
| 🔁 **Ralph Wiggum loop** | `/common:ralph-run` runs Claude in a continuous loop until your Definition of Done holds — adaptive circuit breaker, native `/goal` integration, DoD validators. |
| ⚡ **RTK token optimization** | Forked sub-agents, `context: fork` on heavy skills, 1h prompt caching, Haiku/Sonnet/Opus routing per task. Target 55-65% token savings vs raw Claude Code. |

Plus **11 stack-specific reviewers** (@symfony-reviewer, @react-reviewer, @python-reviewer…) that enforce SOLID/TDD/Clean Architecture so you don't re-type your conventions every sprint.

> **Why not just Claude Code + a cookbook?** Claude already knows React, Symfony, and Flutter patterns — so Claude Craft's value isn't the prompts, it's the **workflow and orchestration around them**: a sprint lifecycle with gates, a continuous loop with a real DoD, browser-based regression capture, and per-task token routing. Those are the parts a per-stack cookbook doesn't cover.



[![npm version](https://img.shields.io/npm/v/@ai-craft/core)](https://www.npmjs.com/package/@ai-craft/core)
[![npm downloads](https://img.shields.io/npm/dm/@ai-craft/core)](https://www.npmjs.com/package/@ai-craft/core)
[![Claude Code 2.1.97+](https://img.shields.io/badge/Claude%20Code-2.1.97%2B-blue)](https://code.claude.com)
[![CI](https://github.com/TheBeardedBearSAS/claude-craft/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/TheBeardedBearSAS/claude-craft/actions/workflows/npm-publish.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2FTheBeardedBearSAS%2Fclaude-craft%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/TheBeardedBearSAS/claude-craft/main)

A comprehensive framework for AI-assisted development with [Claude Code](https://claude.ai/code). Install standardized rules, agents, and commands for your projects across multiple technology stacks — **31 specialized agents (+39 infra agents on-demand), 126 commands across 15 namespaces (220 total), 55 skills**, all token-optimized via `context: fork` and sub-agent model routing.

## What's New in v8.18.0

**Nouvelle commande `/workflow:auto-sprint` (2026-06-27, v8.18.0) :**

- **Orchestrateur de sprint de bout en bout** : une seule commande joue le rôle Product Owner / Scrum Master et enchaîne `start → decompose → validate → implement → PR → CI watch → review → retro → merge`. Chaque cérémonie tourne dans un **sous-agent au contexte isolé** — l'isolation remplace le `/clear` manuel entre étapes ; la phase d'implémentation assume le rôle conductor **inline** (réutilise `/team:sprint`).
- **PR + CI + merge intégrés** (`gh`) : `--auto-merge` opt-in (défaut : pause + GO humain) ; échec de gate (validate KO / CI rouge / DoD miss) → **auto-fix loop** borné (`--max-fix-attempts`).
- **5 langues** (`Dev/i18n/{en,fr,es,de,pt}`) ; compteurs réalignés **126 core / 220 total** commandes.

## What's New in v8.17.2

**Revue documentation (2026-06-26, v8.17.2) :**

- **Nouveau tutoriel phare** : `docs/guides/*/10-complete-workflow.md` réécrit en walkthrough narré de bout en bout (idée → backlog → sprint → livraison) pour grands débutants — glossaire, modes d'exécution, gates, discipline `/clear`, exemple *TaskFlow* + annexe multi-stack. Disponible en 5 langues, lié depuis le README et `guides/index.md`.
- **Fraîcheur** : compteurs et versions réalignés sur le SSOT (125 core / 219 total commandes, 70 agents, 55 skills, 11 stacks ; Claude Code 2.1.97 min / 2.1.193 rec ; Flutter 3.44, RN 0.85, Symfony 8.1). Suppression de `/bmad:init` (→ `/workflow:init`).
- **Sans doublon** : index des guides de migration, en-têtes « narré vs full » (COMMANDS/AGENTS), bannière PLANNED sur MCP-SERVERS, cross-links entre docs concurrentielles, stub `docs/SECURITY.md` supprimé.

## What's New in v8.17.1

**Correctifs tests (2026-06-26, v8.17.1) :**

- **`tests/scripts/` sous docker sans bash** : les 12 fichiers shell-out `bash "*.sh"` échouaient en `/bin/sh: bash: not found` sous busybox/alpine. Nouveau target `make test-scripts-docker` (image bash, `node:24`) + garde `tests/scripts/bash-available.test.mjs`.

**Audit exhaustif multi-agents + mises à jour 2026-06-24 (v8.17.0) :**

- **Versions infra** : Docker 29.6.1, OpenTofu 1.12.2, Ansible 2.21.1, Helm 4.2.2, Node.js 24.x Active LTS.
- **Sécurité** : OWASP Top 10:2025 complet (10/10 catégories dans la règle 11) ; RS256 marqué DEPRECATED ; guidance Argon2id précisée ; hook templates `protect-files.json` / `quality-gate.json` corrigés (anti-pattern `$TOOL_INPUT` → lecture stdin JSON).
- **Modèles** : IDs canoniques dans la table d'effort (Opus 4.8 / **Sonnet 5** sorti 2026-06-30, intro $2/$10 / Haiku 4.5). Sonnet 5 remplace 4.6 comme Sonnet courant. Fable 5 / Mythos 5 suspendus (directive export-control US, 2026-06-12) — retirés des recommandations.
- **CLI** : `/goal`, `/usage`, `/workflows` documentés dans CLI-REFERENCE.md.
- **Optimisation tokens** : `ENABLE_PROMPT_CACHING_1H` et `fallbackModel` activés dans `settings.json` distribué.
- **Docs** : compteur commandes corrigé (133 → 125 core / 219 total) ; TROUBLESHOOTING, FAQ, CHEAT-SHEET, COMPETITIVE-ANALYSIS enrichis.

**Dépendances et supply chain (v8.16.0 / v8.16.1) :**

- **Trivy action** : `aquasecurity/trivy-action` mis à jour (v8.16.0) — scan CVE supply chain.
- **Download artifact** : `actions/download-artifact` bumped de 4.2.1 à 8.0.1 (v8.16.0).
- **CodeQL action** : `github/codeql-action` mis à jour (v8.16.0) — analyse SAST.
- **Playwright** : `@playwright/test` mis à jour de 1.60.0 à 1.61.0 dans `/website` (v8.16.0).
- **Patch de stabilité** : correctifs de dernière minute (v8.16.1).

**Refonte du design de l'interface web Kanban (v8.15.0) :**

- **Thème dark-only opiniâtre** d'après une maquette **Claude Design** : accent **acid-lime** (oklch, distinct des six teintes de statut), typographie **Space Grotesk + JetBrains Mono** auto-hébergée via `@fontsource` (CSP `font-src 'self'`).
- **Panneau Tweaks** : code couleur des cartes (statut / priorité / TDD / epic), accent et densité, persistés en `localStorage`.
- **Les 6 vues restylées** (board, backlog, sprints, burndown, deps, docs) ; drag&drop, navigation clavier, `<dialog>` natifs et a11y préservés. Coloration en helpers JS purs testés.

**Interface web Kanban — accès à tous les artefacts BMAD v6 (v8.14.0) :**

- **Vue Sprints dédiée** : navigation listant **tous** les sprints (points, stories, badges goal/review/retro) ; le détail rend le Goal, les Stories avec leurs Tasks dépliables, et les sections **Review** et **Retro** en markdown (`GET /api/sprints`, `GET /api/sprints/:id`).
- **Docs élargis** : les corps markdown des EPIC, US, sprint-goal/board/review/retro sont désormais navigables dans le DocsView.
- **Détail US enrichi** : la modale du board affiche la **liste des tâches associées** et la **description** de la story (`/api/stories/:id` renvoie `body`). Tests RED-first, suite complète verte.

**Corrections de l'interface web Kanban (v8.13.1) :**

- **Dashboard Kanban réparé** : 4 bugs corrigés en TDD sur le SPA Svelte 5 (`claude-craft kanban`) — vue Backlog vide (stories à `epic_id` inconnu désormais regroupées au lieu d'être perdues), raccourcis clavier inopérants (synchronisation focus + reducer pur), détails de carte inaccessibles (modale au clic/Entrée), et feedback visible (toast) au lieu d'un échec silencieux sur les cartes read-only `sprint-status.yaml`.

**Fiabilité BMAD + distribution AgentTeams (v8.13.0) :**

- **`/gate:*` réparé** : `((var++))` sous `set -e` avortait les scripts de gate/hook après le 1er check (post-incrément = exit 1 quand le compteur vaut 0). 68 occurrences corrigées sur 6 fichiers + tests de non-régression (`make test-bmad`).
- **Scripts AgentTeams livrés** : `Tools/AgentTeams/lib/*.sh` désormais installés automatiquement avec les commandes `/team:*` (fini le warning « scripts MISSING » ; dashboard coût et `--ralph-mode` disponibles out-of-the-box). Install/refresh manuel : `make install-agentteams TARGET=.`.

**Audit exhaustif + durcissement (v8.12.0) :**

- **Audit multi-domaines** (sécurité, DX, concurrentiel, fiabilité, tokens/modèles, docs, architecture) mené par une équipe d'agents avec devil's advocates et vérification de fraîcheur des 14 stacks -- 80 findings, tous les P0/P1/P2 corrigés.
- **Sécurité** : CVE FrankenPHP (CVE-2026-45062) et Docker (CVE-2026-33997) patchées ; hook de sécurité distribué corrigé (`exit 2`) ; durcissement Kanban (CSRF, COEP) et CI supply chain (digests épinglés, SHA256).
- **Optimisation tokens** : templates `settings.json` distribués corrigés (IDs de modèles valides + `CLAUDE_CODE_FORK_SUBAGENT`).
- **988 Vitest tests** green, mutation testing bloquant sur PRs.

**Kanban BMAD v6 integration (v8.11.0):**

- **Kanban ingère `.bmad/sprint-status.yaml`** -- le board Kanban lit les sprints directement depuis le fichier YAML BMAD v6 en lecture seule (icône verrou), sans dépendance SaaS. Les projets BMAD v6 n'ont plus le board vide.

**Releases 8.8.x → 8.10.x :**

- **MIT-only strict (v8.8.0)** -- Claude Craft est 100 % open-source MIT, aucune licence commerciale ou enterprise. Stratégie open-core abandonnée.
- **Parité i18n stricte (v8.8.2)** -- la CI bloque désormais si un fichier traduit est à < 80 % de la taille de l'anglais. Dette i18n résorbée (gap 101 → 0).
- **Branding the-bearded-bear.com (v8.10.1)** -- migration complète des domaines vers `the-bearded-bear.com`, normalisation de l'organisation GitHub.
- **126 commandes sur 15 namespaces** (220 total avec infra/projet) -- namespace `/paperclip:*` (8 commandes) ajouté, 55 skills disponibles.
- **Claude Code 2.1.193** -- version recommandée (Opus 4.8, Artifacts, `claude mcp login`, `/cd`, sous-agents imbriqués, `effort: ultracode`).

> ← Versions antérieures (v8.0 → v8.7) : voir le [CHANGELOG](CHANGELOG.md) et [.claude/COMPATIBILITY.md](.claude/COMPATIBILITY.md).

## Install and First Result

```bash
# Install to your project (picks your tech stack interactively)
npx @ai-craft/core

# Or install directly
npx @ai-craft/core install ~/my-project --tech=react --lang=en

# Zero-prompt install (auto-detects your stack + locale, target < 2 min)
npx @ai-craft/core install --auto

# Install from a team config URL (Gist or internal endpoint)
npx @ai-craft/core install --from=https://org.example/cc-team.json

# Add a community skill from npm (claude-craft-skill-* convention)
npx @ai-craft/core skill add claude-craft-skill-foo

# Open Claude Code and run your first audit
claude
/team:audit
```

That's it. You get an architecture, security, and quality audit of your project in minutes.

**New to Claude Craft?** Run `/common:getting-started` in Claude Code for a 10-minute guided tour that shows you the 3 most valuable commands for YOUR project.

> See [Quickstart](docs/QUICKSTART.md) for a step-by-step walkthrough with expected output at each stage.

## Why Claude Craft?

Claude Code is powerful on its own. Claude Craft makes it **consistent and team-ready**:

- **Standardized rules** -- SOLID, Clean Architecture, TDD enforced across your team, not just suggested
- **31 default agents + 39 infra agents on-demand** -- reviewers, architects, coaches that know your stack deeply (70 total potentially installable)
- **126 slash commands across 15 namespaces** -- repeatable workflows for audits, code generation, sprint management
- **Quality gates** -- automated checks at every stage from PRD to deployment
- **5 languages** -- English, French, Spanish, German, Portuguese

## Supported Technologies

| Stack | Version | Install Command |
|-------|---------|-----------------|
| **Symfony / PHP** | 8.1 / PHP 8.4+ | `--tech=symfony` |
| **React** | 19.2 + Compiler 1.0 | `--tech=react` |
| **Flutter / Dart** | 3.44 / Dart 3.12 | `--tech=flutter` |
| **Python** | 3.14+ / FastAPI | `--tech=python` |
| **Angular** | 22 | `--tech=angular` |
| **Vue.js** | 3.5+ (3.6 beta Vapor) | `--tech=vuejs` |
| **React Native** | 0.85 (New Architecture) | `--tech=reactnative` |
| **C# / .NET** | 10 LTS / C# 14 | `--tech=csharp` |
| **Laravel** | 13.x / PHP 8.3+ (8.5 recommandé) | `--tech=laravel` |
| **PHP** | 8.5 | `--tech=php` |
| **Paperclip** | 2026.609.0 | `--tech=paperclip` |

| **Docker** | 29.6.1 (CVE-2026-33997) | `--tech=docker` |
| **Coolify** | v4.1.2 | `--tech=coolify` |
| **Kubernetes** | 1.36.1 | `--tech=kubernetes` |
| **OpenTofu** | 1.12.2 | `--tech=opentofu` |
| **Ansible** | 2.21.1 | `--tech=ansible` |
| **Hcloud** | 1.61+ | `--tech=hcloud` |
| **PgBouncer** | 1.25.2 (CVE-2026-6664/6665/6666/6667 patched) | `--tech=pgbouncer` |
| **FrankenPHP** | 1.12.4 (CVE-2026-45062 patched) | `--tech=frankenphp` |

See [Technologies](docs/TECHNOLOGIES.md) for full details.

## What's Included

| Category | Count | Examples |
|----------|-------|---------|
| **Agents** | 31 default (+ 39 infra on-demand) | `@tdd-coach`, `@api-designer`, `@symfony-reviewer`, `@kubernetes-architect`, `@hcloud-architect` |
| **Commands** | 126 across 15 namespaces (220 total with infra/project) | `/workflow:init`, `/team:audit`, `/react:generate-component` |
| **Skills** | 55 | Architecture, testing, security, DDD best practices |
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

See [CLI Reference](docs/CLI-REFERENCE.md) for all 126 commands across 15 core namespaces (220 total including infra and project management).

## Installation

> **Platform:** Linux and macOS. Windows is not tested and not officially supported.

### NPX (Recommended)

```bash
npx @ai-craft/core install ~/my-project --tech=symfony --lang=en
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
| [**Tutorial: Complete Workflow**](docs/guides/en/10-complete-workflow.md) | End-to-end narrated walkthrough: idea → backlog → sprint → ship |
| [Learning Paths](docs/LEARNING-PATHS.md) | Beginner → Intermediate → Advanced progression |
| [Installation](docs/INSTALLATION.md) | All installation methods |
| [Configuration](docs/CONFIGURATION.md) | Project configuration |
| [CLI Reference](docs/CLI-REFERENCE.md) | Full CLI documentation |
| [Commands](docs/COMMANDS.md) | All 126 commands |
| [Agents](docs/AGENTS.md) | All 31 default agents (+ 39 infra on-demand) |
| [Skills](docs/SKILLS.md) | Best practices reference |
| [Technologies](docs/TECHNOLOGIES.md) | Stack-specific guides |
| [BMAD Guide](docs/BMAD-PRACTICAL-GUIDE.md) | Project management framework |
| [Hooks](docs/HOOKS.md) | Pre/Post tool execution |
| [MCP](docs/MCP.md) | Model Context Protocol integration |
| [Ecosystem](docs/ECOSYSTEM.md) | Curated third-party token/context/review tools |
| [Privacy Policy](PRIVACY.md) | Data protection and GDPR compliance |
| [FAQ](docs/FAQ.md) | Common questions |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Problem solving |
| [Migration Guide](docs/MIGRATION.md) | Format migration + version-upgrade index (v3→v8) |
| [Migration v6→v7](docs/MIGRATION-v7.md) | Upgrade from v6 to v7 |
| [Migration v7→v8](docs/MIGRATION-v7-to-v8.md) | Upgrade from v7 to v8 |
| [Agent Teams Guide](docs/AGENT-TEAMS-GUIDE.md) | Multi-agent team orchestration |
| [Cheat Sheet](docs/CHEAT-SHEET.md) | Quick command reference card |
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

Claude Craft is maintained by [The Bearded CTO](https://the-bearded-bear.com), a solo founder with deep involvement in the AFUP and Symfony French ecosystem.

| Item | Status |
|------|--------|
| **Funding model** | Bootstrapped, community-driven — no VC. 100% open-source MIT, sustained by community contributions. |
| **Maintenance commitment** | Active development since 2026-01. Targeting weekly minor releases, monthly minor versions. |
| **Bus factor** | Currently 1 (solo maintainer). [Co-maintainer search open](CHARTER.md) — looking for one tech lead from the AFUP / Symfony / Flutter / React community. |
| **Succession plan** | Documented in [CHARTER.md](CHARTER.md). MIT license guarantees indefinite community fork rights if maintainer disappears. |
| **Roadmap visibility** | [GitHub Issues](https://github.com/TheBeardedBearSAS/claude-craft/issues) + [CHANGELOG.md](CHANGELOG.md) + recurring `audit/YYYY-MM-DD-*` reports |
| **Decision process** | RFC via GitHub Discussions for breaking changes. ADRs in `docs/adr/` for architectural choices. |
| **Security disclosure** | See [SECURITY.md](SECURITY.md). 90-day disclosure timeline, GPG-signed advisories. |
| **License** | MIT (free, perpetual). Claude Craft is and remains 100% open-source — no commercial, enterprise, or proprietary tier. See [CHARTER.md](CHARTER.md). |

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Warranty Disclaimer

THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. See [LICENSE](LICENSE) for full terms.

---

Built for [Claude Code](https://claude.ai/code) by Anthropic. Inspired by Clean Architecture and Domain-Driven Design principles.
