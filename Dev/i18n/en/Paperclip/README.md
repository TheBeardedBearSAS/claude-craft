# Paperclip — Claude-Craft Integration

> **Paperclip**: open-source orchestration for zero-human companies.
> Docs: https://docs.paperclip.ing/ · Repo: https://github.com/paperclipai/paperclip · License: MIT

This directory contains the Claude-Craft rules, commands, skills, and templates for working with Paperclip — both as a **contributor** to a Paperclip codebase and as an **operator** using Paperclip with Claude Code as an adapter.

## Stack

| Tool | Version |
|---|---|
| Node.js | 20+ (LTS) |
| TypeScript | 5.x (strict) |
| pnpm | 9.15+ |
| React | 19+ (web UI) |
| Vitest | 4.1+ |
| PostgreSQL | 15+ (or embedded for dev) |
| Paperclip | 2026.529.0+ |

## What's in here

```
Paperclip/
├── CLAUDE.md.template
├── README.md                   (this file)
├── rules/                      # 7 rule files (architecture, standards, tooling, testing, quality, security, adapter-protocol)
├── commands/                   # 8 slash commands (check-*, generate-*, setup-company)
├── templates/                  # Adapter + agent-config scaffolds
├── checklists/                 # pre-commit, new-feature, new-adapter
├── agents/                     # paperclip-reviewer
└── skills/                     # 6 on-demand skills
```

## Commands

| Command | Purpose |
|---|---|
| `/paperclip:check-compliance` | Full audit (Architecture + Quality + Tests + Security + Adapter protocol), score /100 |
| `/paperclip:check-architecture` | Two-layer split + module boundaries + activity log coverage |
| `/paperclip:check-code-quality` | TypeScript strictness, lint, complexity, logging hygiene |
| `/paperclip:check-testing` | Coverage, adapter contract tests, cross-tenant isolation |
| `/paperclip:check-security` | Tenancy, secrets, approvals, budgets, signed adapter channel |
| `/paperclip:generate-adapter` | Scaffold an adapter (local / process / http) |
| `/paperclip:generate-agent-config` | Generate an `agent.yaml` with budget + approvals |
| `/paperclip:setup-company` | Bootstrap a new Paperclip company end-to-end |

## Install

### Via Makefile (from a claude-craft checkout)

```bash
make install-paperclip TARGET=/path/to/my/paperclip-project RULES_LANG=en
```

### Via script

```bash
./Dev/scripts/install-paperclip-rules.sh --lang=en /path/to/my/paperclip-project
```

### Flags

`--install` · `--update` · `--force` · `--preserve-config` · `--dry-run` · `--backup` · `--interactive` · `--lang=<en|fr|es|de|pt>`

## Governance invariants (non-negotiable)

- Adapters never hold governance state (budgets, approvals, permissions are control-plane only).
- Budgets are hard limits. Silent overruns are never acceptable.
- Approvals block adapter execution until the control plane returns a decision.
- Every DB mutation emits an activity event. Activity log is append-only.
- `companyId` always derives from the authenticated session.
- Plugins declare minimal capabilities; host rejects out-of-scope calls with `CapabilityDeniedError`.
- Public endpoints run behind TLS 1.3; operator auth via Better Auth with a rotated `BETTER_AUTH_SECRET`.

## Links

- Paperclip docs: https://docs.paperclip.ing/
- Paperclip repo: https://github.com/paperclipai/paperclip
- Claude-Craft: https://github.com/TheBeardedBearSAS/claude-craft
