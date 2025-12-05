# Claude Craft

A comprehensive framework for AI-assisted development with [Claude Code](https://claude.ai/code). Install standardized rules, agents, and commands for your projects across multiple technology stacks.

## Features

- **5 Technology Stacks**: Symfony, Flutter, Python, React, React Native
- **5 Languages**: English, French, Spanish, German, Portuguese
- **12 AI Agents**: Specialized reviewers, architects, and coaches
- **64 Slash Commands**: Automated workflows and code generation
- **67 Rules**: Best practices for architecture, testing, security
- **25 Templates**: Code generation patterns
- **21 Checklists**: Quality gates for commits, features, releases
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
make install-symfony TARGET=~/my-project LANG=fr

# Install React rules in German
make install-react TARGET=~/my-project LANG=de

# Install all technologies
make install-all TARGET=~/my-project LANG=es
```

### 3. Use in Claude Code

Once installed, use the commands in your project:

```
/symfony:check-architecture
/react:generate-component Button
/common:pre-commit-check
```

## Supported Technologies

| Technology | Rules | Commands | Focus |
|------------|-------|----------|-------|
| **Symfony** | 21 | 10 | Clean Architecture, DDD, API Platform |
| **Flutter** | 13 | 10 | BLoC pattern, Material/Cupertino |
| **Python** | 12 | 10 | FastAPI, async/await, Type hints |
| **React** | 12 | 8 | Hooks, State management, A11y |
| **React Native** | 12 | 7 | Navigation, Native modules |

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
│   │       ├── Common/         # Shared agents & commands
│   │       ├── Symfony/        # PHP backend
│   │       ├── Flutter/        # Mobile Dart
│   │       ├── Python/         # Backend/API
│   │       ├── React/          # Frontend JS/TS
│   │       └── ReactNative/    # Mobile JS/TS
│   └── scripts/                # Installation scripts
├── Project/                    # Project management commands
│   ├── i18n/                   # Translated commands
│   └── install-project-commands.sh
└── Tools/                      # Claude Code utilities
    ├── MultiAccount/           # Multi-account manager
    ├── StatusLine/             # Custom status line
    └── ProjectConfig/          # YAML project manager
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

| Agent | Expertise |
|-------|-----------|
| `api-designer` | REST/GraphQL API design |
| `database-architect` | Database optimization |
| `devops-engineer` | CI/CD, Docker, deployment |
| `performance-auditor` | Performance analysis |
| `refactoring-specialist` | Safe code refactoring |
| `research-assistant` | Technical research |
| `tdd-coach` | Test-Driven Development |
| `symfony-reviewer` | Symfony code review |
| `flutter-reviewer` | Flutter code review |
| `python-reviewer` | Python code review |
| `react-reviewer` | React code review |
| `reactnative-reviewer` | React Native code review |

## Command Namespaces

- `/common:` - Transversal commands (audit, changelog, CI/CD)
- `/symfony:` - Symfony-specific (CRUD, migrations, Doctrine)
- `/flutter:` - Flutter-specific (widgets, BLoC, performance)
- `/python:` - Python-specific (endpoints, async, typing)
- `/react:` - React-specific (components, hooks, a11y)
- `/reactnative:` - React Native-specific (screens, native modules)

## Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Configuration](docs/CONFIGURATION.md)
- [Agents Reference](docs/AGENTS.md)
- [Commands Reference](docs/COMMANDS.md)
- [Technologies Guide](docs/TECHNOLOGIES.md)

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
