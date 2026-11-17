---
name: aliases
description: CLI aliases for frequently used commands
tags: [shortcuts, aliases, productivity, quick-access]
---

# Bear Craft CLI Aliases

Quick shortcuts for the most frequently used Bear Craft commands.

## Overview

These aliases reduce typing and improve productivity by providing short mnemonics for common operations.

## Command Aliases

### Common Namespace

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/ci` | `/bear-common:init` | Initialize Bear Craft |
| `/cr` | `/bear-gate:check release` | Pre-release verification checklist |
| `/cs` | `/bear-common:init --context` | Setup project context for Claude |

### Technology Checks (`/<tech>:check all`)

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/sc` | `/bear-symfony:check all` | Full Symfony audit (4 axes, scored /100) |
| `/rc` | `/bear-react:check all` | Full React audit (4 axes, scored /100) |
| `/fc` | `/bear-flutter:check all` | Full Flutter audit (4 axes, scored /100) |
| `/pc` | `/bear-python:check all` | Full Python audit (4 axes, scored /100) |
| `/ac` | `/bear-angular:check all` | Full Angular audit (4 axes, scored /100) |
| `/vc` | `/bear-vuejs:check all` | Full Vue.js audit (4 axes, scored /100) |
| `/lc` | `/bear-laravel:check all` | Full Laravel audit (4 axes, scored /100) |
| `/cc` | `/bear-csharp:check all` | Full C# audit (4 axes, scored /100) |

Single axis: `/<tech>:check architecture|code-quality|security|testing`. Stacks without an alias: `/bear-php:check all`, `/bear-reactnative:check all`, `/bear-vite:check all`, `/bear-vercel:check all`.

### Team Namespace

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/ta` | `/bear-team:audit` | Run team audit (sequential) |
| `/ts` | `/bear-team:delivery --phase=implementation` | Parallel sprint implementation |
| `/td` | `/bear-team:delivery` | Delivery workflow |

### Workflow Namespace

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/wi` | `/bear-workflow:init` | Initialize workflow |
| `/wp` | `/bear-workflow:plan` | Planning phase |

### QA Namespace

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/qr` | `/bear-qa:recette` | Run acceptance testing (recette) |
| `/qs` | `/bear-qa:status` | QA status report |

### Ralph (Continuous Loop)

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/rr` | `/bear-common:ralph-run` | Run Ralph continuous AI loop |

## Usage Examples

### Quick Project Setup
```bash
# Instead of: /bear-common:init
/ci

# Instead of: /bear-common:init --context
/cs
```

### Quick Compliance Checks
```bash
# Instead of: /bear-symfony:check all
/sc

# Instead of: /bear-react:check all
/rc
```

### Quick Team Operations
```bash
# Instead of: /bear-team:audit --sequential
/ta --sequential

# Instead of: /bear-team:delivery Sprint-3 --phase=implementation
/ts Sprint-3
```

### Quick QA
```bash
# Instead of: /bear-qa:recette --scope=story --id=US-001
/qr --scope=story --id=US-001

# Instead of: /bear-qa:status
/qs
```

### Quick Ralph Loop
```bash
# Instead of: /bear-common:ralph-run "fix all failing tests"
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
# Bear Craft Aliases
alias ci='claude -p /bear-common:init'
alias cr='claude -p "/bear-gate:check release"'
alias cs='claude -p "/bear-common:init --context"'

alias sc='claude -p "/bear-symfony:check all"'
alias rc='claude -p "/bear-react:check all"'
alias fc='claude -p "/bear-flutter:check all"'
alias pc='claude -p "/bear-python:check all"'
alias ac='claude -p "/bear-angular:check all"'
alias vc='claude -p "/bear-vuejs:check all"'
alias lc='claude -p "/bear-laravel:check all"'
alias cc='claude -p "/bear-csharp:check all"'

alias ta='claude -p /bear-team:audit'
alias ts='claude -p "/bear-team:delivery --phase=implementation"'
alias td='claude -p /bear-team:delivery'

alias wi='claude -p /bear-workflow:init'
alias wp='claude -p /bear-workflow:plan'

alias qr='claude -p /bear-qa:recette'
alias qs='claude -p /bear-qa:status'

alias rr='claude -p /bear-common:ralph-run'
```

### Fish Setup

Add to `~/.config/fish/config.fish`:

```fish
# Bear Craft Aliases
alias ci 'claude -p /bear-common:init'
alias cr 'claude -p "/bear-gate:check release"'
alias cs 'claude -p "/bear-common:init --context"'

alias sc 'claude -p "/bear-symfony:check all"'
alias rc 'claude -p "/bear-react:check all"'
alias fc 'claude -p "/bear-flutter:check all"'
alias pc 'claude -p "/bear-python:check all"'
alias ac 'claude -p "/bear-angular:check all"'
alias vc 'claude -p "/bear-vuejs:check all"'
alias lc 'claude -p "/bear-laravel:check all"'
alias cc 'claude -p "/bear-csharp:check all"'

alias ta 'claude -p /bear-team:audit'
alias ts 'claude -p "/bear-team:delivery --phase=implementation"'
alias td 'claude -p /bear-team:delivery'

alias wi 'claude -p /bear-workflow:init'
alias wp 'claude -p /bear-workflow:plan'

alias qr 'claude -p /bear-qa:recette'
alias qs 'claude -p /bear-qa:status'

alias rr 'claude -p /bear-common:ralph-run'
```

## Mnemonic Logic

| Pattern | Examples | Logic |
|---------|----------|-------|
| **First letter + c** (check) | `/sc`, `/rc`, `/fc` | Technology + check-compliance |
| **First letter + first letter** | `/ca`, `/ci`, `/cr` | Namespace + command |
| **Namespace abbreviation** | `/ta`, `/ts`, `/qr` | Team/QA + command initial |
| **Double letter** | `/rr`, `/cc` | Memorable repetition |

## Discover More

Use `/bear-common:search` to discover commands by keyword:

```bash
/bear-common:search testing
/bear-common:search security
/bear-common:search workflow
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
A: Mention this file explicitly: "Use `/ca` as defined in `/bear-common:aliases`"

**Q: Alias not working in terminal?**  
A: Reload shell config: `source ~/.bashrc` or `source ~/.zshrc`

**Q: Want to add custom aliases?**  
A: Add to `~/.claude/commands/custom/aliases.md` (project-specific)

---

**Version:** 1.0.0  
**Author:** The Bearded Bear  
**Date:** 2026-04-17
