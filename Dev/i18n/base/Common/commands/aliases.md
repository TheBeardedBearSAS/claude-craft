---
name: aliases
description: CLI aliases for frequently used commands
tags: [shortcuts, aliases, productivity, quick-access]
---

# Claude Craft CLI Aliases

Quick shortcuts for the most frequently used Claude Craft commands.

## Overview

These aliases reduce typing and improve productivity by providing short mnemonics for common operations.

## Command Aliases

### Common Namespace

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/ci` | `/common:init` | Initialize Claude Craft |
| `/cr` | `/gate:check release` | Pre-release verification checklist |
| `/cs` | `/common:init --context` | Setup project context for Claude |

### Technology Checks (`/<tech>:check all`)

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/sc` | `/symfony:check all` | Full Symfony audit (4 axes, scored /100) |
| `/rc` | `/react:check all` | Full React audit (4 axes, scored /100) |
| `/fc` | `/flutter:check all` | Full Flutter audit (4 axes, scored /100) |
| `/pc` | `/python:check all` | Full Python audit (4 axes, scored /100) |
| `/ac` | `/angular:check all` | Full Angular audit (4 axes, scored /100) |
| `/vc` | `/vuejs:check all` | Full Vue.js audit (4 axes, scored /100) |
| `/lc` | `/laravel:check all` | Full Laravel audit (4 axes, scored /100) |
| `/cc` | `/csharp:check all` | Full C# audit (4 axes, scored /100) |

Single axis: `/<tech>:check architecture|code-quality|security|testing`. Stacks without an alias: `/php:check all`, `/reactnative:check all`, `/vite:check all`, `/vercel:check all`.

### Team Namespace

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/ta` | `/team:audit` | Run team audit (sequential) |
| `/ts` | `/team:delivery --phase=implementation` | Parallel sprint implementation |
| `/td` | `/team:delivery` | Delivery workflow |

### Workflow Namespace

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/wi` | `/workflow:init` | Initialize workflow |
| `/wp` | `/workflow:plan` | Planning phase |

### QA Namespace

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/qr` | `/qa:recette` | Run acceptance testing (recette) |
| `/qs` | `/qa:status` | QA status report |

### Ralph (Continuous Loop)

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/rr` | `/common:ralph-run` | Run Ralph continuous AI loop |

## Usage Examples

### Quick Project Setup
```bash
# Instead of: /common:init
/ci

# Instead of: /common:init --context
/cs
```

### Quick Compliance Checks
```bash
# Instead of: /symfony:check all
/sc

# Instead of: /react:check all
/rc
```

### Quick Team Operations
```bash
# Instead of: /team:audit --sequential
/ta --sequential

# Instead of: /team:delivery Sprint-3 --phase=implementation
/ts Sprint-3
```

### Quick QA
```bash
# Instead of: /qa:recette --scope=story --id=US-001
/qr --scope=story --id=US-001

# Instead of: /qa:status
/qs
```

### Quick Ralph Loop
```bash
# Instead of: /common:ralph-run "fix all failing tests"
/rr "fix all failing tests"
```

## Implementation

These aliases are **virtual** — they exist as documentation shortcuts. Users can:

1. **Use them directly in Claude Code** (Claude recognizes them via this file)
2. **Create shell aliases** (for CLI usage)
3. **Add to shell config** (~/.bashrc, ~/.zshrc, ~/.config/fish/config.fish)

### Bash/Zsh Setup

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# Claude Craft Aliases
alias ci='claude -p /common:init'
alias cr='claude -p "/gate:check release"'
alias cs='claude -p "/common:init --context"'

alias sc='claude -p "/symfony:check all"'
alias rc='claude -p "/react:check all"'
alias fc='claude -p "/flutter:check all"'
alias pc='claude -p "/python:check all"'
alias ac='claude -p "/angular:check all"'
alias vc='claude -p "/vuejs:check all"'
alias lc='claude -p "/laravel:check all"'
alias cc='claude -p "/csharp:check all"'

alias ta='claude -p /team:audit'
alias ts='claude -p "/team:delivery --phase=implementation"'
alias td='claude -p /team:delivery'

alias wi='claude -p /workflow:init'
alias wp='claude -p /workflow:plan'

alias qr='claude -p /qa:recette'
alias qs='claude -p /qa:status'

alias rr='claude -p /common:ralph-run'
```

### Fish Setup

Add to `~/.config/fish/config.fish`:

```fish
# Claude Craft Aliases
alias ci 'claude -p /common:init'
alias cr 'claude -p "/gate:check release"'
alias cs 'claude -p "/common:init --context"'

alias sc 'claude -p "/symfony:check all"'
alias rc 'claude -p "/react:check all"'
alias fc 'claude -p "/flutter:check all"'
alias pc 'claude -p "/python:check all"'
alias ac 'claude -p "/angular:check all"'
alias vc 'claude -p "/vuejs:check all"'
alias lc 'claude -p "/laravel:check all"'
alias cc 'claude -p "/csharp:check all"'

alias ta 'claude -p /team:audit'
alias ts 'claude -p "/team:delivery --phase=implementation"'
alias td 'claude -p /team:delivery'

alias wi 'claude -p /workflow:init'
alias wp 'claude -p /workflow:plan'

alias qr 'claude -p /qa:recette'
alias qs 'claude -p /qa:status'

alias rr 'claude -p /common:ralph-run'
```

## Mnemonic Logic

| Pattern | Examples | Logic |
|---------|----------|-------|
| **First letter + c** (check) | `/sc`, `/rc`, `/fc` | Technology + check-compliance |
| **First letter + first letter** | `/ca`, `/ci`, `/cr` | Namespace + command |
| **Namespace abbreviation** | `/ta`, `/ts`, `/qr` | Team/QA + command initial |
| **Double letter** | `/rr`, `/cc` | Memorable repetition |

## Discover More

Use `/common:search` to discover commands by keyword:

```bash
/common:search testing
/common:search security
/common:search workflow
```

## Best Practices

1. **Learn 5 aliases first** — Start with `/ci`, `/sc`, `/ta`, `/qr`, `/rr`
2. **Use shell aliases for CLI** — Add to shell config for terminal usage
3. **Use virtual aliases in Claude Code** — Just type the alias in conversation
4. **Combine with arguments** — All aliases support the same arguments as full commands

## Future Expansion

Additional aliases can be proposed via:
- GitHub issues
- Pull requests
- Community suggestions

The goal: **20-30 aliases max** (avoid cognitive overload).

---

## Troubleshooting

**Q: Alias not recognized in Claude Code?**  
A: Mention this file explicitly: "Use `/ca` as defined in `/common:aliases`"

**Q: Alias not working in terminal?**  
A: Reload shell config: `source ~/.bashrc` or `source ~/.zshrc`

**Q: Want to add custom aliases?**  
A: Add to `~/.claude/commands/custom/aliases.md` (project-specific)

---

**Version:** 1.0.0  
**Author:** The Bearded CTO  
**Date:** 2026-04-17
