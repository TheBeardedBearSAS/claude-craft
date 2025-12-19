# Claude Craft

A comprehensive framework for AI-assisted development with [Claude Code](https://claude.ai/code). Install standardized rules, agents, and commands for your projects across multiple technology stacks.

## Features

- **5 Technology Stacks**: Symfony, Flutter, Python, React, React Native
- **Infrastructure Stack**: Docker agents and commands
- **5 Languages**: English, French, Spanish, German, Portuguese
- **23 AI Agents**: Specialized reviewers, architects, coaches, UI/UX, and Docker experts
- **90+ Slash Commands**: Automated workflows and code generation
- **249 Skills**: Best practices in official Claude Code format (architecture, testing, security)
- **30 Templates**: Code generation patterns
- **21 Checklists**: Quality gates for commits, features, releases
- **Auto-generated CLAUDE.md**: Project configuration file created at installation
- **Multi-Account Manager**: Manage multiple Claude Code accounts easily
- **Custom Status Line**: Rich status bar with profile, model, git, context %

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft
```

### 2. Install rules to your project

```bash
# Install Symfony rules (default: English)
make install-symfony TARGET=~/my-project

# Install with specific language
make install-symfony TARGET=~/my-project RULES_LANG=fr

# Install React rules in German
make install-react TARGET=~/my-project RULES_LANG=de

# Install all technologies
make install-all TARGET=~/my-project RULES_LANG=es
```

### 3. Use in Claude Code

Once installed, use the commands in your project:

```
/symfony:check-architecture
/react:generate-component Button
/common:pre-commit-check
```

## Supported Technologies

| Technology | Skills | Commands | Agents | Focus |
|------------|--------|----------|--------|-------|
| **Common** | 7 | 21 | 11 | Cross-tech best practices, UI/UX |
| **Symfony** | 16 | 10 | 1 | Clean Architecture, DDD, API Platform |
| **Flutter** | 10 | 10 | 1 | BLoC pattern, Material/Cupertino |
| **Python** | 6 | 10 | 1 | FastAPI, async/await, Type hints |
| **React** | 8 | 8 | 1 | Hooks, State management, A11y |
| **React Native** | 11 | 7 | 1 | Navigation, Native modules |
| **Docker** | - | 4 | 5 | Dockerfile, Compose, CI/CD, Debugging |

## Project Structure

```
claude-craft/
├── Makefile                    # Main orchestration
├── claude-projects.yaml        # YAML configuration (user copy)
├── Dev/
│   ├── i18n/                   # Internationalized content
│   │   ├── en/                 # English
│   │   ├── fr/                 # French
│   │   ├── es/                 # Spanish
│   │   ├── de/                 # German
│   │   └── pt/                 # Portuguese
│   │       ├── Common/         # Shared agents, commands & skills
│   │       ├── Symfony/        # PHP backend
│   │       ├── Flutter/        # Mobile Dart
│   │       ├── Python/         # Backend/API
│   │       ├── React/          # Frontend JS/TS
│   │       └── ReactNative/    # Mobile JS/TS
│   └── scripts/                # Installation scripts
├── Infra/                      # Infrastructure (Docker)
│   ├── i18n/                   # Translated agents & commands
│   └── install-infra-rules.sh
├── Project/                    # Project management commands
│   ├── i18n/                   # Translated commands
│   └── install-project-commands.sh
└── Tools/                      # Claude Code utilities
    ├── MultiAccount/           # Multi-account manager
    ├── StatusLine/             # Custom status line
    └── ProjectConfig/          # YAML project manager
```

### What Gets Installed

After installation, your project will have:

```
your-project/
└── .claude/
    ├── CLAUDE.md           # Auto-generated project configuration
    ├── skills/             # Best practices (official format)
    │   ├── architecture/   # Architecture patterns
    │   ├── testing/        # Testing strategies
    │   └── security/       # Security guidelines
    ├── agents/             # AI specialist definitions
    ├── commands/           # Slash commands
    │   ├── common/
    │   └── {tech}/
    ├── checklists/         # Quality gates
    └── rules/              # Legacy rules (backward compat)
```

## Installation Methods

### Method 1: Makefile (Recommended)

```bash
# Single technology
make install-symfony TARGET=~/my-project

# Common rules only
make install-common TARGET=~/my-project

# Preset combinations
make install-web TARGET=~/my-project      # React
make install-backend TARGET=~/my-project  # Symfony + Python
make install-mobile TARGET=~/my-project   # Flutter + React Native

# Infrastructure (Docker)
make install-infra TARGET=~/my-project

# Install Claude Code tools
make install-tools                        # All tools
make install-statusline                   # Custom status line
make install-multiaccount                 # Multi-account manager
make install-projectconfig                # Project config manager
```

### Method 2: YAML Configuration (Monorepos)

```yaml
# claude-projects.yaml
settings:
  default_lang: "en"  # Default language for all projects

projects:
  - name: "my-monorepo"
    root: "~/Projects/my-monorepo"
    lang: "fr"        # Override: French for this project
    common: true
    modules:
      - path: "frontend"
        tech: react
      - path: "backend"
        tech: symfony
      - path: "mobile"
        tech: flutter
```

```bash
make config-install PROJECT=my-monorepo
```

### Method 3: Direct Script

```bash
# Default language (English)
./Dev/scripts/install-symfony-rules.sh --install ~/my-project

# With specific language
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/my-project
./Dev/scripts/install-flutter-rules.sh --lang=de ~/my-project
```

## Available Agents

### Common Agents
| Agent | Expertise |
|-------|-----------|
| `api-designer` | REST/GraphQL API design |
| `database-architect` | Database optimization |
| `devops-engineer` | CI/CD, Docker, deployment |
| `performance-auditor` | Performance analysis |
| `refactoring-specialist` | Safe code refactoring |
| `research-assistant` | Technical research |
| `tdd-coach` | Test-Driven Development |

### UI/UX Agents
| Agent | Expertise |
|-------|-----------|
| `uiux-orchestrator` | Coordinates UI, UX, and A11y experts |
| `ui-designer` | Design systems, tokens, components |
| `ux-ergonome` | User flows, cognitive ergonomics |
| `accessibility-expert` | WCAG 2.2 AAA, ARIA, audits |

### Technology Reviewers
| Agent | Expertise |
|-------|-----------|
| `symfony-reviewer` | Symfony code review |
| `flutter-reviewer` | Flutter code review |
| `python-reviewer` | Python code review |
| `react-reviewer` | React code review |
| `reactnative-reviewer` | React Native code review |

### Docker/Infrastructure Agents
| Agent | Expertise |
|-------|-----------|
| `docker-dockerfile` | Dockerfile optimization, multi-stage builds |
| `docker-compose` | Compose orchestration, networks, volumes |
| `docker-debug` | Container troubleshooting, diagnostics |
| `docker-cicd` | CI/CD pipelines, security scanning |
| `docker-architect` | Complete Docker architecture design |

## Command Namespaces

- `/common:` - Transversal commands (audit, changelog, CI/CD)
- `/symfony:` - Symfony-specific (CRUD, migrations, Doctrine)
- `/flutter:` - Flutter-specific (widgets, BLoC, performance)
- `/python:` - Python-specific (endpoints, async, typing)
- `/react:` - React-specific (components, hooks, a11y)
- `/reactnative:` - React Native-specific (screens, native modules)
- `/docker:` - Docker/Infrastructure (compose, debug, pipelines, architecture)

## Documentation

### 📚 User Guides (Multilingual)

Complete step-by-step tutorials for getting started, developing features, and fixing bugs:

| Guide | 🇬🇧 EN | 🇫🇷 FR | 🇪🇸 ES | 🇩🇪 DE | 🇧🇷 PT |
|-------|--------|--------|--------|--------|--------|
| Getting Started | [EN](docs/guides/en/01-getting-started.md) | [FR](docs/guides/fr/01-getting-started.md) | [ES](docs/guides/es/01-getting-started.md) | [DE](docs/guides/de/01-getting-started.md) | [PT](docs/guides/pt/01-getting-started.md) |
| Project Creation | [EN](docs/guides/en/02-project-creation.md) | [FR](docs/guides/fr/02-project-creation.md) | [ES](docs/guides/es/02-project-creation.md) | [DE](docs/guides/de/02-project-creation.md) | [PT](docs/guides/pt/02-project-creation.md) |
| Feature Development | [EN](docs/guides/en/03-feature-development.md) | [FR](docs/guides/fr/03-feature-development.md) | [ES](docs/guides/es/03-feature-development.md) | [DE](docs/guides/de/03-feature-development.md) | [PT](docs/guides/pt/03-feature-development.md) |
| Bug Fixing | [EN](docs/guides/en/04-bug-fixing.md) | [FR](docs/guides/fr/04-bug-fixing.md) | [ES](docs/guides/es/04-bug-fixing.md) | [DE](docs/guides/de/04-bug-fixing.md) | [PT](docs/guides/pt/04-bug-fixing.md) |
| Tools Reference | [EN](docs/guides/en/05-tools-reference.md) | [FR](docs/guides/fr/05-tools-reference.md) | [ES](docs/guides/es/05-tools-reference.md) | [DE](docs/guides/de/05-tools-reference.md) | [PT](docs/guides/pt/05-tools-reference.md) |
| Troubleshooting | [EN](docs/guides/en/06-troubleshooting.md) | [FR](docs/guides/fr/06-troubleshooting.md) | [ES](docs/guides/es/06-troubleshooting.md) | [DE](docs/guides/de/06-troubleshooting.md) | [PT](docs/guides/pt/06-troubleshooting.md) |
| Backlog Management | [EN](docs/guides/en/07-backlog-management.md) | [FR](docs/guides/fr/07-backlog-management.md) | [ES](docs/guides/es/07-backlog-management.md) | [DE](docs/guides/de/07-backlog-management.md) | [PT](docs/guides/pt/07-backlog-management.md) |

📖 [Guide Index](docs/guides/index.md)

### 📋 Reference Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Configuration](docs/CONFIGURATION.md)
- [Skills Reference](docs/SKILLS.md) - Best practices in official format
- [Agents Reference](docs/AGENTS.md)
- [Commands Reference](docs/COMMANDS.md)
- [Technologies Guide](docs/TECHNOLOGIES.md)
- [Migration Guide](docs/MIGRATION.md) - Rules to Skills migration

## Requirements

- **bash** - For installation scripts
- **yq** - For YAML configuration parsing (optional)

```bash
# Install yq
sudo apt install yq      # Debian/Ubuntu
brew install yq          # macOS
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for [Claude Code](https://claude.ai/code) by Anthropic
- Inspired by Clean Architecture and Domain-Driven Design principles
