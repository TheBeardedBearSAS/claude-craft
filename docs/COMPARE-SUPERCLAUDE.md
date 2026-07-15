---
title: Claude Craft vs SuperClaude vs Vanilla Claude Code
description: Feature-by-feature comparison of Claude Craft, SuperClaude Framework, and plain Claude Code — commands, agents, tech-stack rules, and which one fits your workflow.
head:
  - - script
    - type: application/ld+json
    - '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Is Claude Craft free to use?","acceptedAnswer":{"@type":"Answer","text":"Yes. Claude Craft is 100% open-source under the MIT license — no paid tier, no open-core split."}},{"@type":"Question","name":"Does Claude Craft replace Claude Code?","acceptedAnswer":{"@type":"Answer","text":"No. Claude Craft is a configuration layer installed on top of Anthropic Claude Code — you still need Claude Code itself installed and running."}},{"@type":"Question","name":"Which has more agents, Claude Craft or SuperClaude?","acceptedAnswer":{"@type":"Answer","text":"Claude Craft ships 31 default agents plus 39 on-demand infrastructure agents (70 total available). SuperClaude Framework ships 20 specialized agents."}},{"@type":"Question","name":"Does SuperClaude support specific tech stacks like Claude Craft does?","acceptedAnswer":{"@type":"Answer","text":"Not as documented. SuperClaude''s agents are general-purpose roles (PM, security engineer, frontend architect, deep research). Claude Craft ships dedicated rulesets and reviewer agents for 11 named technology stacks."}},{"@type":"Question","name":"Can I install Claude Craft and SuperClaude together?","acceptedAnswer":{"@type":"Answer","text":"Both are configuration layers on top of Claude Code and are not inherently exclusive, but we have not tested running them side by side. Expect command-namespace or persona-naming overlaps if you try."}}]}'
---

# Claude Craft vs SuperClaude vs Vanilla Claude Code

Both Claude Craft and [SuperClaude Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework) are open-source, MIT-licensed configuration layers that sit on top of [Claude Code](https://claude.com/product/claude-code) — neither replaces it, both extend it. If you're deciding whether to add a framework at all, and if so which one, here's an honest, sourced comparison.

*Data as of 2026-07-15, sourced from this repository's own docs and the SuperClaude_Framework GitHub README. Feature counts change between releases — check each project's own docs for the current numbers before deciding.*

## At a glance

| Aspect | Claude Craft | SuperClaude Framework | Vanilla Claude Code |
|---|:---:|:---:|:---:|
| License | MIT | MIT | Proprietary (Anthropic product) |
| Install method | `git clone` + Makefile, or `npx @the-bearded-bear/claude-craft install` | `pipx install superclaude` (PyPI) | Built in |
| Ecosystem | Node.js / npm | Python / PyPI | — |
| Slash commands | 126 core across 15 namespaces (219–220 total incl. infra/project) | 30 | None by default |
| Agents / personas | 31 default + 39 on-demand infra agents (70 total available) | 20 specialized agents | None by default |
| Behavioral modes | — (BMAD quality gates + Ralph Wiggum loop cover similar ground, differently) | 7 | — |
| MCP servers bundled | 0 — documents setup (Context7, etc.), doesn't auto-install | 8 (Tavily, Context7, Sequential-Thinking, Serena, Playwright, Magic, Morphllm-Fast-Apply, Chrome DevTools) | 0 |
| Tech-stack-specific rulesets | 11 stacks (C#/.NET, Symfony/PHP, Flutter, React, React Native, Angular, Vue.js, Laravel, Python, PHP, Paperclip) | Not stack-specific — general-purpose personas | — |
| Skills catalogue | 55 | Not documented as a distinct concept | — |
| Project management framework | BMAD v6 (PRD, quality gates, sprint-status routing) | Not documented | — |
| Autonomous loop | Ralph Wiggum v2.0 (adaptive circuit breaker, DoD validators) | Not documented | — |
| Documentation languages | 5 (en, fr, es, de, pt) | English only (README) | English |

## What each one actually is

**Claude Craft** is a rules-and-agents installer: it drops technology-specific reference docs, reviewer/architect subagents, and slash commands into your project, scoped per stack. It also ships two standalone subsystems — **BMAD v6** (a lightweight PRD → sprint → quality-gate workflow) and **Ralph Wiggum** (a continuous-run loop with a Definition-of-Done validator and an adaptive circuit breaker) — that you can adopt independently of the per-stack rules.

**SuperClaude Framework** describes itself as "a meta-programming configuration framework that transforms Claude Code into a structured development platform through behavioral instruction injection and component orchestration." It installs via a Python CLI (`pipx install superclaude`) and layers in 30 commands, 20 general-purpose agent personas (PM, security engineer, frontend architect, deep-research agent, and others), 7 behavioral modes, and — notably — 8 bundled MCP servers covering web search, browser automation, and UI generation.

**Vanilla Claude Code** is Anthropic's CLI on its own: no added commands, no personas, no stack-specific rules. It's the right baseline if you don't want an opinionated layer at all, or you're still evaluating whether you need one.

## Where they actually differ

- **Stack-awareness vs. general-purpose.** Claude Craft's core bet is per-stack depth: a Symfony reviewer knows Doctrine and API Platform idioms, a Flutter reviewer knows BLoC and Riverpod. SuperClaude's personas are role-based (PM, security, frontend) rather than stack-based — useful across any language, but without the same stack-specific depth.
- **MCP servers.** SuperClaude installs 8 MCP servers as part of its setup. Claude Craft documents MCP configuration (see [MCP reference](/en/reference/mcp)) but doesn't bundle or auto-install any server — you wire up what you need yourself.
- **Project management layer.** Claude Craft's BMAD v6 gives you PRD quality gates and sprint-status routing out of the box. We didn't find an equivalent in SuperClaude's public docs.
- **Install footprint.** Claude Craft assumes a Node/npm toolchain (or plain `git clone`); SuperClaude assumes Python/pipx. If your team already standardizes on one ecosystem, that alone may decide it.
- **i18n.** Claude Craft's rules and guides ship translated in 5 languages; we found no equivalent in SuperClaude's README.

## Who each one is best for

- **Claude Craft** — teams working in one or more of the 11 supported stacks who want stack-aware review agents plus a lightweight sprint/PRD workflow, without adopting a separate project-management tool.
- **SuperClaude Framework** — users who want MCP tooling (search, browser automation, UI generation) bundled at install time and are already in the Python/pipx ecosystem.
- **Vanilla Claude Code** — anyone who wants zero added structure, or is still deciding if a framework is worth the setup cost at all.

## Can I run both?

Both are configuration layers on top of Claude Code and aren't inherently mutually exclusive — but we haven't tested installing them side by side. If you try it, expect possible overlaps in command namespaces or persona naming; treat it as unsupported until proven otherwise.

## FAQ

**Is Claude Craft free to use?**
Yes. Claude Craft is 100% open-source under the MIT license — no paid tier, no open-core split.

**Does Claude Craft replace Claude Code?**
No. Claude Craft is a configuration layer installed on top of Anthropic Claude Code — you still need Claude Code itself installed and running.

**Which has more agents, Claude Craft or SuperClaude?**
Claude Craft ships 31 default agents plus 39 on-demand infrastructure agents (70 total available). SuperClaude Framework ships 20 specialized agents.

**Does SuperClaude support specific tech stacks like Claude Craft does?**
Not as documented. SuperClaude's agents are general-purpose roles (PM, security engineer, frontend architect, deep research). Claude Craft ships dedicated rulesets and reviewer agents for 11 named technology stacks.

**Can I install Claude Craft and SuperClaude together?**
Both are configuration layers on top of Claude Code and are not inherently exclusive, but we have not tested running them side by side. Expect command-namespace or persona-naming overlaps if you try.

---

Ready to try Claude Craft? [Get started in 5 minutes](/en/getting-started/quickstart) or [view the source on GitHub](https://github.com/TheBeardedBearSAS/claude-craft).
