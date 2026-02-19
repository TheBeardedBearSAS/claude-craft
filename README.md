# Claude Craft

[![npm version](https://img.shields.io/npm/v/@the-bearded-bear/claude-craft)](https://www.npmjs.com/package/@the-bearded-bear/claude-craft)
[![CI](https://github.com/TheBeardedBearSAS/claude-craft/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/TheBeardedBearSAS/claude-craft/actions/workflows/npm-publish.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive framework for AI-assisted development with [Claude Code](https://claude.ai/code). Install standardized rules, agents, and commands for your projects across multiple technology stacks.

## What's New in v7.19

- **All 10 reviewers now v2.0** -- 6 remaining reviewers (Angular, Vue.js, Laravel, React Native, PHP, C#) upgraded with scoring /100, decision trees, and sonnet model
- **Hooks activated** -- project dogfoods its own hooks: security-block, file protection, auto-format, context re-injection
- **New hook templates** -- quality-gate (blocks commit if tests fail) and block-dangerous-commands (rm -rf, sudo)
- See [CHANGELOG](CHANGELOG.md) for full details

## Install and First Result

```bash
# Install to your project (picks your tech stack interactively)
npx @the-bearded-bear/claude-craft

# Or install directly
npx @the-bearded-bear/claude-craft install ~/my-project --tech=react --lang=en

# Open Claude Code and run your first audit
claude
/team:audit
```

That's it. You get an architecture, security, and quality audit of your project in minutes.

> See [Quickstart](docs/QUICKSTART.md) for a step-by-step walkthrough with expected output at each stage.

## Why Claude Craft?

Claude Code is powerful on its own. Claude Craft makes it **consistent and team-ready**:

- **Standardized rules** -- SOLID, Clean Architecture, TDD enforced across your team, not just suggested
- **53 specialized agents** -- reviewers, architects, coaches that know your stack deeply
- **194 slash commands** -- repeatable workflows for audits, code generation, sprint management
- **Quality gates** -- automated checks at every stage from PRD to deployment
- **5 languages** -- English, French, Spanish, German, Portuguese

## Supported Technologies

| Stack | Version | Install Command |
|-------|---------|-----------------|
| **Symfony / PHP** | 8.0 / PHP 8.5 | `--tech=symfony` |
| **React** | 19.x | `--tech=react` |
| **Flutter / Dart** | 3.38 / Dart 3.10 | `--tech=flutter` |
| **Python** | 3.13+ / FastAPI | `--tech=python` |
| **Angular** | 19.x | `--tech=angular` |
| **Vue.js** | 3.5+ | `--tech=vuejs` |
| **React Native** | 0.76+ | `--tech=reactnative` |
| **C# / .NET** | 10 LTS / C# 14 | `--tech=csharp` |
| **Laravel** | 12.x / PHP 8.5 | `--tech=laravel` |
| **PHP** | 8.5 | `--tech=php` |

| **Docker** | 27+ | `--tech=docker` |
| **Coolify** | 4.x | `--tech=coolify` |
| **Kubernetes** | 1.35+ | `--tech=kubernetes` |
| **OpenTofu** | 1.7+ | `--tech=opentofu` |
| **Ansible** | 2.18+ | `--tech=ansible` |
| **Hcloud** | 1.61+ | `--tech=hcloud` |

See [Technologies](docs/TECHNOLOGIES.md) for full details.

## What's Included

| Category | Count | Examples |
|----------|-------|---------|
| **Agents** | 53 | `@tdd-coach`, `@api-designer`, `@symfony-reviewer`, `@kubernetes-architect`, `@hcloud-architect` |
| **Commands** | 194 | `/workflow:init`, `/team:audit`, `/react:generate-component` |
| **Skills** | 37 | Architecture, testing, security best practices |
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

See [CLI Reference](docs/CLI-REFERENCE.md) for all 194 commands across 24 namespaces.

## Installation

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
| [Commands](docs/COMMANDS.md) | All 194 commands |
| [Agents](docs/AGENTS.md) | All 53 agents |
| [Skills](docs/SKILLS.md) | Best practices reference |
| [Technologies](docs/TECHNOLOGIES.md) | Stack-specific guides |
| [BMAD Guide](docs/BMAD-PRACTICAL-GUIDE.md) | Project management framework |
| [Hooks](docs/HOOKS.md) | Pre/Post tool execution |
| [MCP](docs/MCP.md) | Model Context Protocol integration |
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

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built for [Claude Code](https://claude.ai/code) by Anthropic. Inspired by Clean Architecture and Domain-Driven Design principles.
