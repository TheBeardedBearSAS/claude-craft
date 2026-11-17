# Bear Craft vs SuperClaude — Honest Comparison

> **TL;DR :** SuperClaude is a viral, single-prompt persona library optimised for individual developers. Bear Craft is a multi-stack, team-oriented framework with sprint workflow and browser-based QA. They solve different problems for different audiences. This page compares them honestly so you can pick the right tool.

**Last updated :** 2026-06-27 | **Bear Craft v8.19.2** | **SuperClaude v4.x (snapshot 2026-06)**

> **Looking for the broader market picture?** This page is the user-facing, single-competitor comparison. For the full strategic landscape (all competitors, SWOT, roadmap), see the maintainer doc [`COMPETITIVE-ANALYSIS.md`](COMPETITIVE-ANALYSIS.md).

---

## The Short Answer

| You are... | Pick |
|-----------|------|
| Individual developer who wants to switch persona quickly (`@architect`, `@reviewer`) on a side-project | **SuperClaude** — 5-minute install, zero learning curve |
| Tech lead managing a team of 3-15 developers on a multi-stack project | **Bear Craft** — built for team consistency, sprint workflow, audit trails |
| Building a one-off prototype | **Either** works — try the lightest tool first (SuperClaude) |
| Working on a regulated codebase (banking, health, public sector) needing audit trails and BMAD-style quality gates | **Bear Craft** — BMAD v6 with PRD/Tech Spec/INVEST/DoD gates |
| Want browser-based acceptance testing integrated with your AI workflow | **Bear Craft** — QA Recette + Chrome extension |
| Want a single-language English experience | **SuperClaude** — French/Spanish/German/Portuguese support is partial |
| Want full i18n in 5 languages (en/fr/es/de/pt) | **Bear Craft** — first-class i18n |

If you're undecided, **start with SuperClaude** to learn how Claude Code persona-based workflows feel. Migrate to Bear Craft when you need team consistency or sprint management.

---

## Feature-by-Feature Comparison

### Core Architecture

| Feature | SuperClaude | Bear Craft |
|---------|-------------|--------------|
| Persona system | 11 built-in personas (architect, frontend, backend, security, etc.) | 72 specialised agents (organised in common, tech-reviewers, infrastructure, project) |
| Stack-specific reviewers | Generic (one persona for all stacks) | Per-stack (`@symfony-reviewer`, `@react-reviewer`, `@flutter-reviewer`, etc.) |
| Sprint management | None | BMAD v6 (Quick Flow / Standard / Enterprise tracks) |
| Quality gates | None | PRD ≥80%, Tech Spec ≥90%, INVEST 6/6, Sprint Ready 100%, Story DoD 100%, Spec Alignment ≥85% |
| Browser-based acceptance testing | None | QA Recette (Golden Rule: a fixed bug should NEVER reappear) |
| Local Kanban board | None | Built-in (Svelte + Hono + chokidar, no SaaS) |
| Continuous loop autonomous mode | None | Ralph Wiggum (`/bear-common:ralph-run`) with adaptive circuit breaker |

### Stack Coverage

| Stack | SuperClaude | Bear Craft |
|-------|-------------|--------------|
| Symfony / PHP 8.5 | Generic | Dedicated: Clean Architecture, DDD, API Platform, Doctrine, Pest 4 |
| Laravel 13 / PHP 8.5 | Generic | Dedicated: Actions pattern, Pest 4, Sanctum, AI SDK, Passkey |
| Pure PHP 8.5 | Generic | Dedicated: PSR-12, PHPStan Level 10, DDD |
| React 19.2 + Compiler 1.0 | Generic | Dedicated: Hooks, Server Components, Zustand, React Query, bundle analysis |
| Vue.js 3.5+ (3.6 Vapor beta) | Generic | Dedicated: Composition API, Pinia, Alien Signals |
| Angular 22 | Generic | Dedicated: Signals, Standalone, Zoneless, httpResource |
| Flutter 3.44 / Dart 3.12 | Generic | Dedicated: BLoC v9, Riverpod 3, Material 3, Impeller |
| React Native 0.85 New Arch | Generic | Dedicated: JSI, TurboModules, Fabric, Reanimated 4 |
| C# / .NET 10 LTS | Generic | Dedicated: Clean Architecture, CQRS, MediatR, EF Core |
| Python 3.14+ | Generic | Dedicated: FastAPI, Pydantic, free-threading, JIT |
| Paperclip 2026.529 | None | Dedicated: control plane + adapters |
| Docker / K8s / OpenTofu / Ansible | None | Dedicated infra agents (39 agents) |

### Operational Features

| Feature | SuperClaude | Bear Craft |
|---------|-------------|--------------|
| Installation | `npx superclaude install` | `npx @the-bearded-bear/bear-craft install . --tech=react --lang=fr` |
| Config update | Manual or re-run installer | `npx ... update` with diff preview |
| Languages supported | English (full), partial others | en, fr, es, de, pt (full parity, automated CI check) |
| Slash commands | ~30 | 219 across 15 namespaces |
| Skills (Claude Code v2.1.105+) | A few | 55 skills, 15 with `context: fork` for token isolation |
| Hooks templates | None | 9 templates (auto-format, security-block, pre-compact, output-filter, etc.) |
| Token optimisation guide | Generic | RTK integration + `context: fork` + sub-agent model routing (55-65% reduction stack) |
| Local Kanban board (BMAD v6) | None | Built-in Svelte + Hono — ingests `.bmad/sprint-status.yaml` read-only (🔒) |
| Licence | MIT | MIT (strict MIT-only since v8.10.1 — no enterprise/commercial tier) |

### Maintenance and Community

| Indicator | SuperClaude | Bear Craft |
|-----------|-------------|--------------|
| GitHub stars (2026-06-12) | ~30 000 (SuperClaude v4) | ~97 |
| npm weekly downloads | High (thousands) | Low (hundreds) |
| Contributors | 50+ | 1 (solo maintainer + co-maintainer search open) |
| Release cadence | Variable | Active (multiple releases/month) |
| First-party support contracts | None | Pro support tier in development |
| Security audit cadence | Ad-hoc | Quarterly multi-agent audits with public reports (`audit/YYYY-MM-DD-*/`) |

> **Honest note** : Bear Craft has fewer stars because it targets a niche (B2B francophone tech leads on Symfony/React/Flutter teams) and has been publicly active for less time. Stars do not reflect product-market fit in B2B tooling.

---

## When SuperClaude Wins

### 1. Time-to-first-value for individual developers

If you're a single developer wanting to upgrade your Claude Code experience in 5 minutes, SuperClaude is faster. You install, you switch persona, you ship. Bear Craft requires picking a tech stack, a language, and understanding the sprint workflow ; the value is bigger but the ramp-up is longer.

### 2. Mindshare and discoverability

22 600 stars vs 96 stars — if you're searching "claude code framework" on GitHub trending, SuperClaude is what you find. This matters for solo developers asking "what does the community recommend ?".

### 3. Lighter footprint

SuperClaude's bundle is smaller. It does less. If you don't need 11 stacks and 125 commands, that simplicity is a feature.

---

## When Bear Craft Wins

### 1. Multi-stack teams

You have a Symfony backend and a React frontend, with a Flutter mobile app. Bear Craft has dedicated reviewers, rules, and guides for each, with consistent BMAD sprint workflow across them. SuperClaude treats them as generic.

### 2. Sprint management with quality gates

If your team uses sprints (Scrum or otherwise), Bear Craft's BMAD v6 framework integrates the AI workflow with sprint phases (Analyse → Plan → Design → Implement) and enforces quality gates (PRD ≥80%, Story DoD 100%, etc.). SuperClaude has no sprint concept.

### 3. Browser-based acceptance testing

Bear Craft's QA Recette (Chrome extension + automated test runner) is unique. It enforces that fixed bugs never reappear. SuperClaude has no equivalent.

### 4. Multi-language teams (i18n)

If your team mixes French, Spanish, German, Portuguese speakers, Bear Craft installs rules in their language. The CI enforces parity across all 5 languages. SuperClaude is English-first.

### 5. Audit trails for regulated industries

Bear Craft generates SBOMs at every release, runs CodeQL + ShellCheck + i18n parity in CI, publishes quarterly multi-agent audit reports, and signs releases with `npm publish --provenance`. If you need to demonstrate due diligence to a security or compliance team, this matters.

### 6. Local Kanban without SaaS lock-in

If your IT department blocks Jira/Linear due to data residency rules, Bear Craft's local Kanban (Svelte + Hono + chokidar, no external service) is a drop-in alternative. SuperClaude has no Kanban.

---

## Migration Paths

### From SuperClaude to Bear Craft

```bash
# 1. Backup your existing SuperClaude setup
cp -r .claude .claude.superclaude-backup

# 2. Install Bear Craft for your stack
npx @the-bearded-bear/bear-craft install . --tech=react --lang=en

# 3. Compare your CLAUDE.md and personas; migrate custom prompts to .claude/rules/
# 4. Run /bear-workflow:init to bootstrap BMAD v6
```

### From Bear Craft to SuperClaude

```bash
# 1. Backup
cp -r .claude .claude.craft-backup

# 2. Uninstall Bear Craft
rm -rf .claude/

# 3. Install SuperClaude
npx superclaude install
```

Both projects respect each other's directory structures ; they don't overwrite outside `.claude/`.

---

## Cohabitation

You can use both in the same machine for different projects. The `.claude/` directory is project-local. `~/.claude/` (global config) needs to be one or the other — pick the one you use most.

---

## Disclosure

This page is maintained by Bear Craft authors. We have no commercial relationship with SuperClaude maintainers. Claims about SuperClaude are based on public documentation as of 2026-05-06. If anything is inaccurate, [open an issue](https://github.com/TheBeardedBearSAS/bear-craft/issues) and we'll correct it within 7 days.

SuperClaude maintainers are welcome to publish a comparable page on their side ; we'll link to it.

---

## Related Reading

- [Bear Craft README](../README.md)
- [Bear Craft BMAD v6 framework](.claude/CLAUDE.md)
- [Bear Craft QA Recette](qa-recette/README.md)
- [SuperClaude GitHub](https://github.com/SuperClaude-Org/SuperClaude_Framework)
