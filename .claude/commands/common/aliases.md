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
| `/ca` | `/common:audit-freshness` | Audit documentation freshness |
| `/caa` | `/common:audit-claude-alignment` | Weekly Claude ecosystem alignment audit |
| `/ci` | `/common:init` | Initialize Claude Craft |
| `/cr` | `/common:release-checklist` | Pre-release verification checklist |
| `/cs` | `/common:setup-project-context` | Setup project context for Claude |

### Technology Check Compliance

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/sc` | `/symfony:check-compliance` | Check Symfony compliance |
| `/rc` | `/react:check-compliance` | Check React compliance |
| `/fc` | `/flutter:check-compliance` | Check Flutter compliance |
| `/pc` | `/python:check-compliance` | Check Python compliance |
| `/ac` | `/angular:check-compliance` | Check Angular compliance |
| `/vc` | `/vuejs:check-compliance` | Check Vue.js compliance |
| `/lc` | `/laravel:check-compliance` | Check Laravel compliance |
| `/cc` | `/csharp:check-compliance` | Check C# compliance |

### Team Namespace

| Alias | Full Command | Description |
|-------|-------------|-------------|
| `/ta` | `/team:audit` | Run team audit (sequential) |
| `/ts` | `/team:sprint` | Sprint planning and management |
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

# Instead of: /common:setup-project-context
/cs
```

### Quick Compliance Checks
```bash
# Instead of: /symfony:check-compliance
/sc

# Instead of: /react:check-compliance
/rc
```

### Quick Team Operations
```bash
# Instead of: /team:audit --sequential
/ta --sequential

# Instead of: /team:sprint --id=Sprint-3
/ts --id=Sprint-3
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
alias ca='claude-code -p /common:audit-freshness'
alias caa='claude-code -p /common:audit-claude-alignment'
alias ci='claude-code -p /common:init'
alias cr='claude-code -p /common:release-checklist'
alias cs='claude-code -p /common:setup-project-context'

alias sc='claude-code -p /symfony:check-compliance'
alias rc='claude-code -p /react:check-compliance'
alias fc='claude-code -p /flutter:check-compliance'
alias pc='claude-code -p /python:check-compliance'
alias ac='claude-code -p /angular:check-compliance'
alias vc='claude-code -p /vuejs:check-compliance'
alias lc='claude-code -p /laravel:check-compliance'
alias cc='claude-code -p /csharp:check-compliance'

alias ta='claude-code -p /team:audit'
alias ts='claude-code -p /team:sprint'
alias td='claude-code -p /team:delivery'

alias wi='claude-code -p /workflow:init'
alias wp='claude-code -p /workflow:plan'

alias qr='claude-code -p /qa:recette'
alias qs='claude-code -p /qa:status'

alias rr='claude-code -p /common:ralph-run'
```

### Fish Setup

Add to `~/.config/fish/config.fish`:

```fish
# Claude Craft Aliases
alias ca 'claude-code -p /common:audit-freshness'
alias caa 'claude-code -p /common:audit-claude-alignment'
alias ci 'claude-code -p /common:init'
alias cr 'claude-code -p /common:release-checklist'
alias cs 'claude-code -p /common:setup-project-context'

alias sc 'claude-code -p /symfony:check-compliance'
alias rc 'claude-code -p /react:check-compliance'
alias fc 'claude-code -p /flutter:check-compliance'
alias pc 'claude-code -p /python:check-compliance'
alias ac 'claude-code -p /angular:check-compliance'
alias vc 'claude-code -p /vuejs:check-compliance'
alias lc 'claude-code -p /laravel:check-compliance'
alias cc 'claude-code -p /csharp:check-compliance'

alias ta 'claude-code -p /team:audit'
alias ts 'claude-code -p /team:sprint'
alias td 'claude-code -p /team:delivery'

alias wi 'claude-code -p /workflow:init'
alias wp 'claude-code -p /workflow:plan'

alias qr 'claude-code -p /qa:recette'
alias qs 'claude-code -p /qa:status'

alias rr 'claude-code -p /common:ralph-run'
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
