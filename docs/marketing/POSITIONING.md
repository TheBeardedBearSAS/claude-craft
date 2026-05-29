# Claude Craft — Positioning & Differentiation

**Lead:** AI-first TDD methodology framework for Claude Code — production-ready across 11 tech stacks.

---

## Core Positioning

Claude Craft is the **only comprehensive AI development framework** that combines:
1. **Methodology** (BMAD v6 — Analyze, Plan, Design, Implement)
2. **Quality enforcement** (TDD, SOLID, OWASP 2025, testing automation)
3. **Multi-stack production readiness** (11 stacks, 70 agents, 125 commands)
4. **Token optimization** (RTK — 60-90% savings on CLI outputs)

**Target audience:** Teams shipping production code with Claude Code, not hobbyists or single-stack projects.

---

## 4 Key Differentiators

### 1. QA Recette — Automated Acceptance Testing

**What:** Chrome extension + Claude agent that automates acceptance testing (Given/When/Then scenarios) and enforces the golden rule: **a fixed bug should NEVER reappear**.

**Why unique:**
- Other frameworks stop at unit tests
- QA Recette runs full user scenarios (login, checkout, permissions)
- Automatic regression registry (all fixed bugs = regression tests)

**Status:** v1.0.36+ Chrome extension, integrated in Claude Code v2.1.107+

**Competitor gap:** SuperClaude, Claude-Flow, Cursor rules have NO automated acceptance testing.

### 2. BMAD v6 — Structured Workflow with Quality Gates

**What:** 3-track workflow (Quick Flow, Standard, Enterprise) with 6 quality gates (PRD >=80%, Tech Spec >=90%, INVEST 6/6, Sprint Ready 100%, Story DoD 100%, Spec Alignment >=85%).

**Why unique:**
- Prevents "code first, think later" chaos
- Forces architecture phase BEFORE TDD (see skill `architect`)
- Built-in PM/BA/Architect/QA roles (not just dev)

**Status:** Tier 1 production-ready (Symfony, React, Flutter, Python)

**Competitor gap:** Cursor rules are dev-only, no PM/QA workflow. Claude-Flow is code-focused, no quality gates.

### 3. RTK — Rust Token Killer (55-65% Global Savings)

**What:** CLI proxy that filters command outputs (git status, npm install, etc.) to reduce token consumption by 60-90% on repetitive dev operations.

**Why unique:**
- Transparent hook-based integration (zero overhead)
- Combines with subagent model selection (sonnet for sub-agents, opus for main)
- Total combined savings: **55-65%** tokens globally

**Status:** `rtk` binary installable via `/common:setup-rtk`, hooks in `.claude/templates/hooks/`

**Competitor gap:** No other framework addresses token costs. SuperClaude and Cursor users pay full Claude API rates.

### 4. Agent Teams — 67 Specialized Agents Across Stacks

**What:** 67 domain experts (@api-designer, @database-architect, @security-auditor, @symfony-reviewer, @flutter-reviewer, etc.) + 41 infra agents (Docker, K8s, Coolify, Ansible, OpenTofu).

**Why unique:**
- Cross-stack expertise (one framework, 11 stacks)
- Infra agents for full DevOps lifecycle
- Agent frontmatter with `effort`, `maxTurns`, `disallowedTools` (v2.1.78+)

**Status:** All agents production-tested on real projects (2024-2026)

**Competitor gap:** SuperClaude has generic agents, Cursor/Windsurf have NO agent concept.

---

## Honest Comparison vs. Competitors

| Feature | Claude Craft | SuperClaude | Claude-Flow | Cursor Rules |
|---------|--------------|-------------|-------------|--------------|
| **Stacks** | 19 (Tier 1-3) | 1-2 (generic) | 1-2 (generic) | Project-specific |
| **Methodology** | BMAD v6 | None | Basic workflow | None |
| **TDD Enforcement** | Mandatory (skill-driven) | Optional | Optional | Manual |
| **Automated QA** | QA Recette (Chrome) | None | None | None |
| **Token Optimization** | RTK 55-65% | None | None | None |
| **Agents** | 67 specialists | ~10 generic | None | None |
| **Infra Support** | 41 agents (Docker, K8s, Ansible) | None | None | None |
| **Quality Gates** | 6 gates | None | None | None |
| **Multi-IDE** | Cursor, Windsurf export | N/A | N/A | Native |
| **Price** | Free (MIT) | $50/mo | Free | Free |

**When to choose Claude Craft:**
- Shipping production code across multiple stacks
- Team of 3+ developers
- TDD/BDD mandatory
- Need PM/BA/QA workflow

**When to choose alternatives:**
- Single stack, small project → Cursor rules
- No quality gates needed → Claude-Flow
- Budget for premium support → SuperClaude ($50/mo)

---

## Formalized Tiers

### Tier 1 — Production-Ready (4 stacks)

Full BMAD v6 workflow, QA Recette, 100% skill coverage, battle-tested 2024-2026.

| Stack | Version | Key Features | Status |
|-------|---------|--------------|--------|
| **Symfony / PHP** | 8.0 / PHP 8.4+ | DDD, Hexagonal, API Platform, JsonStreamer | ✅ Production |
| **React** | 19.2 + Compiler 1.0 | Hooks, Zustand, React Query, Server Components | ✅ Production |
| **Flutter / Dart** | 3.44 / Dart 3.12 | BLoC v9, Riverpod 3, Material 3, Impeller | ✅ Production |
| **Python** | 3.14+ | FastAPI, async/await, Pydantic, free-threading, JIT | ✅ Production |

**Confidence level:** Ship to production without review.

### Tier 2 — Stable (6 stacks)

Full skill coverage, limited battle-testing, may require review on edge cases.

| Stack | Version | Key Features | Status |
|-------|---------|--------------|--------|
| **Angular** | 20 LTS (21 latest) | Signals, Standalone, Zoneless, httpResource | ✅ Stable |
| **Vue.js** | 3.5+ (3.6 beta Vapor) | Composition API, Pinia, Vitest, Alien Signals | ✅ Stable |
| **Laravel** | 13.x / PHP 8.5 | Actions, Pest 4, Sanctum, AI SDK, Passkey | ✅ Stable |
| **React Native** | 0.85 (New Architecture) | Navigation 7, Reanimated 4, TurboModules | ✅ Stable |
| **C# / .NET** | 10 LTS / C# 14 | CQRS, MediatR (or alternative), EF Core | ✅ Stable |
| **PHP** | 8.5 (Property Hooks 8.4+) | PSR-12, PHPStan Level 10, Pest 4 | ✅ Stable |

**Confidence level:** Production-ready, occasional expert review recommended.

### Tier 3 — Experimental (9 stacks)

Partial coverage, early adopters, evolving references.

| Stack | Version | Status |
|-------|---------|--------|
| **Go** | 1.24+ | ⚠️ Experimental |
| **Rust** | 1.85+ | ⚠️ Experimental |
| **Svelte** | 5.0+ (Runes) | ⚠️ Experimental |
| **Paperclip** | 2026.403.0 | ⚠️ Experimental |
| **Astro** | 5.0+ | ⚠️ Experimental |
| **Elixir / Phoenix** | 1.17 / Phoenix 1.7 | ⚠️ Experimental |
| **Spring Boot** | 3.4+ / Java 21+ | ⚠️ Experimental |
| **Django** | 5.2+ | ⚠️ Experimental |
| **FastAPI** | 0.115+ | ⚠️ Experimental |

**Confidence level:** Early adopters only, expect gaps in coverage.

---

## Roadmap 2026-Q2

| Milestone | Target | Status |
|-----------|--------|--------|
| **Tier 1 → Tier 2** | Promote Angular, Vue, Laravel, React Native to Tier 1 | In progress |
| **Skills Marketplace** | Submit 10 universal skills to Anthropic | Ready |
| **Multi-IDE Export** | Cursor + Windsurf bundles | ✅ Done (v8.0.1) |
| **Champions Program** | Onboard 10 community champions | Planned |
| **QA Recette v2** | Parallel test execution, CI integration | Planned Q3 |

---

## Attribution

**Author:** The Bearded CTO  
**License:** MIT  
**Repository:** https://github.com/TheBeardedCTO/claude-craft  
**Website:** https://claude-craft.dev

---

**Last updated:** 2026-04-17  
**Version:** 1.0.0
