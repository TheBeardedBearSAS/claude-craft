# Claude Craft Skills — Universal Collection (Marketplace Ready)

This directory contains **10 universal skills** ready for submission to the Anthropic Skills Marketplace.

Each skill is framework-agnostic, production-tested across 19+ tech stacks, and fully documented.

---

## Available Skills

| Skill | Category | Description | Tags |
|-------|----------|-------------|------|
| **architect** | Design | Architecture phase before TDD — boundaries, contracts, dependencies | architecture, design, tdd, planning |
| **testing** | Quality | TDD/BDD principles with mutation testing and browser mode (2026) | testing, tdd, bdd, coverage, mutation |
| **security** | Security | OWASP Top 10:2025, supply chain, JWT best practices | security, owasp, auth, encryption |
| **git-workflow** | DevOps | GitHub Flow with conventional commits and code review | git, workflow, commits, pr, review |
| **documentation** | Quality | Documentation as Code — README, ADR, CHANGELOG, OpenAPI 3.2 | documentation, adr, openapi, changelog |
| **solid-principles** | Design | SOLID principles (SRP, OCP, LSP, ISP, DIP) for clean code | solid, oop, clean-code, architecture |
| **kiss-dry-yagni** | Quality | Simplicity principles — cognitive complexity, minimal code | simplicity, refactoring, yagni, clean-code |
| **debug-methodical** | Quality | 4-phase debugging (reproduce → isolate → fix → verify) | debugging, troubleshooting, regression |
| **socratic-brainstorm** | Planning | Socratic questioning before coding to clarify requirements | brainstorming, requirements, planning |
| **atomic-tasks** | Workflow | GSD pattern — split work into atomic tasks with fresh contexts | workflow, productivity, context-management |

---

## Marketplace Preparation

Each skill file includes:
- ✅ Marketplace-ready frontmatter (name, description, author, version, tags)
- ✅ Actionable summary (< 50 lines)
- ✅ Integration notes for Claude Code
- ✅ Attribution "by The Bearded CTO / Claude Craft"

---

## Usage

### In Claude Code

These skills are already integrated in Claude Craft. To use:

```bash
# Load a skill
/architect
/testing
/security
# etc.
```

### Standalone Installation

To use these skills outside Claude Craft:

```bash
# Copy to your Claude Code skills directory
cp skills-marketplace/universal/architect.md ~/.claude/skills/architect/SKILL.md
```

---

## Attribution

All skills developed by **The Bearded CTO** as part of **Claude Craft** — the AI-first TDD methodology framework.

- **Author:** The Bearded CTO
- **License:** MIT
- **Repository:** https://github.com/TheBeardedCTO/claude-craft
- **Version:** 8.2.4
- **Marketplace Status:** Ready for submission (2026-Q2)

---

## Quality Standards

All skills follow:
- ✅ Framework-agnostic (works with any tech stack)
- ✅ Production-tested across Symfony, React, Flutter, Python, Laravel, Angular, Vue.js, React Native, C#, PHP
- ✅ Aligned with industry standards (OWASP 2025, SemVer, Keep a Changelog, OpenAPI 3.2)
- ✅ Updated with 2026 best practices
- ✅ < 150 lines each (actionable, not exhaustive)
- ✅ Auto-suggest triggers configured
- ✅ File/keyword patterns for smart loading

---

**Last updated:** 2026-04-17
**Version:** 1.0.0
