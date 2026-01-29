# Claude Craft

A comprehensive framework for AI-assisted development with [Claude Code](https://claude.ai/code). Install standardized rules, agents, and commands for your projects across multiple technology stacks.

## What's New in v3.5

- **TCL (Tiered Context Loading)**: 95% token reduction through optimized context loading
- **On-Demand References**: Rules loaded only when explicitly requested via `@.claude/references/`
- **Minimal CLAUDE.md**: ~200 tokens auto-loaded instead of ~70,000
- **INDEX.md Summaries**: Quick reference checklists (~1,300 tokens)
- **context.yaml**: File-based contextual triggers for skills
- **All 10 Technologies**: TCL optimization applied across all stacks

## What's New in v3.4

- **Ralph Reliability**: 59 fixes for robust long-running sprints (2h+)
- **Auto-Compact**: Automatic context limit detection and session compaction
- **Strategic Compact**: Compact at natural workflow boundaries (task complete, sprint start)
- **Atomic Operations**: Temp-file-then-move pattern prevents file corruption
- **File Locking**: Safe concurrent access with portable mkdir-based locks
- **New `utils.sh` Module**: Shared helper functions for all Ralph modules

## What's New in v3.2

- **4 New Technology Stacks**: Angular, C#/.NET, Laravel, Vue.js
- **`/common:add-technology` Command**: Generate new technology stacks with web search + Context7 research
- **Angular**: Standalone components, Signals, OnPush, Vitest/Jest, Cypress
- **C#/.NET**: Clean Architecture, CQRS, .NET Aspire, xUnit, EF Core
- **Laravel**: Clean Arch, Pest PHP, Sanctum, Actions pattern, Livewire
- **Vue.js**: Composition API, Pinia, Vitest, TypeScript, Vue Router

## What's New in v3.1

- **Ralph Wiggum**: Continuous AI agent loop - run Claude until task completion
- **Definition of Done (DoD)**: Structured validation with 5 validator types (command, output, file, hook, human)
- **Circuit Breaker**: Safety mechanism to prevent infinite loops
- **Git Checkpointing**: Automatic recovery points after each iteration
- **CLI Command**: `npx @the-bearded-bear/claude-craft ralph "task"`

## What's New in v3.0

- **Workflow Methodology**: BMAD-inspired 4-phase development (Analysis → Planning → Design → Implementation)
- **Workflow Orchestrator**: Intelligent routing to appropriate agents and tracks
- **PRD/Tech Spec Generation**: Automated documentation from project context
- **3 Development Tracks**: Quick Flow, Standard, Enterprise - adapted to complexity
- **NPX Interactive CLI**: Install with `npx @the-bearded-bear/claude-craft` - interactive wizard
- **Codebase Flattener**: Generate context-optimized codebase summary for AI
- **Document Sharding**: Automatic splitting for large codebases (90% token savings)
- **Web Bundles**: Pre-built instructions for ChatGPT, Claude Projects, Gemini Gems
- **Hooks System**: Automated quality gates, linting, and notifications
- **MCP Integration**: Context7 for up-to-date library documentation
- **Migration Tool**: Upgrade existing projects to v3.0
- **Plugin Export**: Package for Claude Code marketplace distribution
- **Enhanced Settings**: Granular permissions and tool allowlists

## Features

- **10 Technology Stacks**: Symfony, Flutter, Python, React, React Native, Angular, C#/.NET, Laravel, Vue.js, PHP
- **Infrastructure Stack**: Docker agents and commands
- **5 Languages**: English, French, Spanish, German, Portuguese
- **25 AI Agents**: Specialized reviewers, architects, coaches, UI/UX, Docker experts, Workflow Orchestrator, and Ralph Conductor
- **90+ Slash Commands**: Automated workflows and code generation
- **Ralph Wiggum**: Continuous loop execution with Definition of Done validation
- **249 Skills**: Best practices in official Claude Code format (architecture, testing, security)
- **30 Templates**: Code generation patterns
- **21 Checklists**: Quality gates for commits, features, releases
- **Hooks System**: Pre/Post tool execution, quality gates, notifications
- **MCP Templates**: Context7, GitHub, PostgreSQL, Slack integration
- **Auto-generated CLAUDE.md**: Project configuration file created at installation
- **Multi-Account Manager**: Manage multiple Claude Code accounts easily
- **Custom Status Line**: Rich status bar with profile, model, git, context %

## Workflow Methodology

Claude-Craft includes a BMAD-inspired workflow system that adapts to your project complexity.

### Development Tracks

| Track | Setup Time | Phases | Best For |
|-------|------------|--------|----------|
| **Quick Flow** | < 5 min | Implementation only | Bug fixes, hotfixes, small tweaks |
| **Standard** | < 15 min | Plan → Design → Implement | New features, refactoring |
| **Enterprise** | < 30 min | Analyze → Plan → Design → Implement | Platforms, migrations, multi-team |

### Getting Started with Workflows

```bash
# Initialize workflow - auto-detects complexity
/workflow:init

# Or specify track
/workflow:init --quick      # Bug fix mode
/workflow:init --enterprise # Full methodology

# Check progress
/workflow:status
```

### Workflow Commands

| Command | Phase | Purpose |
|---------|-------|---------|
| `/workflow:init` | Setup | Analyze project, recommend track |
| `/workflow:analyze` | Analysis | Research and exploration (Enterprise) |
| `/workflow:plan` | Planning | Generate PRD, personas, backlog |
| `/workflow:design` | Design | Tech spec, architecture, ADRs |
| `/workflow:implement` | Implementation | Sprint development with TDD/BDD |
| `/workflow:status` | Any | Show current progress |

### Document Generation

```bash
# Generate Product Requirements Document
/project:generate-prd

# Generate Technical Specification
/project:generate-tech-spec
```

## Quick Start

### Method 1: NPX (Recommended)

```bash
# Interactive installation wizard
npx @the-bearded-bear/claude-craft

# Or install to specific directory
npx @the-bearded-bear/claude-craft install ~/my-project --tech=symfony --lang=fr
```

### Method 2: Clone Repository

```bash
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft
```

Then install rules to your project:

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
| **Angular** | 6 | 6 | 1 | Standalone, Signals, OnPush, RxJS |
| **C#/.NET** | 7 | 6 | 1 | Clean Architecture, CQRS, Entity Framework |
| **Laravel** | 6 | 6 | 1 | Clean Architecture, Pest PHP, Sanctum |
| **Vue.js** | 6 | 6 | 1 | Composition API, Pinia, Vitest |
| **PHP** | 6 | 5 | 1 | Clean Architecture, PSR-12, PHPStan, Pest |
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
│   │       ├── ReactNative/    # Mobile JS/TS
│   │       ├── Angular/        # Angular frontend
│   │       ├── CSharp/         # C#/.NET backend
│   │       ├── Laravel/        # PHP/Laravel backend
│   │       ├── VueJS/          # Vue.js frontend
│   │       └── PHP/            # PHP Clean Architecture
│   └── scripts/                # Installation scripts
├── Infra/                      # Infrastructure (Docker)
│   ├── i18n/                   # Translated agents & commands
│   └── install-infra-rules.sh
├── Project/                    # Project management commands
│   ├── i18n/                   # Translated commands
│   └── install-project-commands.sh
├── Tools/                      # Claude Code utilities
│   ├── MultiAccount/           # Multi-account manager
│   ├── StatusLine/             # Custom status line
│   ├── ProjectConfig/          # YAML project manager
│   └── PluginExport/           # Export as Claude Code plugins
├── cli/                        # NPX CLI (npx @the-bearded-bear/claude-craft)
│   ├── index.js                # Interactive installer
│   └── flattener.js            # Codebase flattener
└── bundles/                    # Web platform bundles
    ├── chatgpt/                # ChatGPT bundle
    ├── claude/                 # Claude Projects bundle
    └── gemini/                 # Gemini Gems bundle
```

### What Gets Installed

After installation, your project will have the TCL-optimized structure:

```
your-project/
└── .claude/
    ├── CLAUDE.md           # Minimal config (~200 tokens) - auto-loaded
    ├── INDEX.md            # Quick reference summaries (~1,300 tokens)
    ├── context.yaml        # File-based skill triggers
    ├── settings.json       # Permissions and tool allowlists
    ├── references/         # Full documentation (loaded on-demand via @)
    │   ├── base/           # Universal principles (SOLID, DRY, etc.)
    │   └── {tech}/         # Technology-specific rules
    ├── skills/             # Best practices (official format)
    │   ├── architecture/   # Architecture patterns
    │   ├── testing/        # Testing strategies
    │   └── security/       # Security guidelines
    ├── agents/             # AI specialist definitions
    ├── commands/           # Slash commands
    │   ├── common/
    │   └── {tech}/
    ├── hooks/              # Pre/Post tool execution scripts
    ├── mcp/                # MCP server templates
    ├── checklists/         # Quality gates
    └── templates/          # Code generation templates
```

### Token Optimization (TCL)

The TCL structure reduces context from ~70,000 to ~3,500 tokens (95% reduction):

| Level | Content | Tokens | Loading |
|-------|---------|--------|---------|
| **Always Loaded** | CLAUDE.md + INDEX.md | ~1,500 | Automatic |
| **On-Demand** | Skills | ~variable | Via `/skill-name` or triggers |
| **Reference** | Full rules | ~0 | Via `@.claude/references/...` |

Access full documentation with: `@.claude/references/{tech}/architecture.md`

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

# Migrate existing projects to v3.0
make migrate TARGET=~/my-project          # Upgrade project
make migrate-dry-run TARGET=~/my-project  # Preview changes
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

#### Multi-Technology Modules (v3.2+)

You can specify multiple technologies for a single module. This is useful for fullstack folders or projects using multiple frameworks:

```yaml
projects:
  - name: "fullstack-app"
    root: "~/Projects/fullstack"
    modules:
      # Single technology (legacy syntax)
      - path: "api"
        tech: symfony

      # Multiple technologies - inline array
      - path: "frontend"
        tech: [react, laravel]

      # Multiple technologies - YAML list
      - path: "dashboard"
        tech:
          - vuejs
          - symfony
```

When multiple technologies are specified:
- The **first technology** installs common rules (SOLID, TDD, etc.)
- **Subsequent technologies** skip common rules to avoid duplicates
- All tech-specific rules, commands, and agents are installed

### Method 3: Direct Script

```bash
# Default language (English)
./Dev/scripts/install-symfony-rules.sh --install ~/my-project

# With specific language
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/my-project
./Dev/scripts/install-flutter-rules.sh --lang=de ~/my-project
```

## CLI Tools

### Codebase Flattener

Generate a context-optimized summary of your codebase for AI assistants:

```bash
# Generate flattened context
npx @the-bearded-bear/claude-craft flatten

# With custom output file
npx @the-bearded-bear/claude-craft flatten --output=CONTEXT.md

# For large codebases (automatic sharding)
npx @the-bearded-bear/claude-craft flatten --max-tokens=50000
```

Features:
- Smart file selection (ignores node_modules, vendor, etc.)
- Automatic document sharding for large projects
- Token estimation
- Priority-based file ordering
- File tree generation

### Web Bundles

Use Claude-Craft methodology outside of Claude Code:

```bash
claude-craft/bundles/
├── chatgpt/claude-craft-bundle.md    # For ChatGPT Custom Instructions
├── claude/claude-craft-bundle.md     # For Claude Projects
└── gemini/claude-craft-bundle.md     # For Gemini Gems
```

Copy the appropriate bundle into your preferred AI platform's custom instructions.

## Available Agents

### Workflow Agent
| Agent | Expertise |
|-------|-----------|
| `workflow-orchestrator` | Intelligent routing, phase coordination, track selection |

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
| `angular-reviewer` | Angular code review |
| `laravel-reviewer` | Laravel code review |
| `vuejs-reviewer` | Vue.js code review |
| `php-reviewer` | PHP code review |

### Docker/Infrastructure Agents
| Agent | Expertise |
|-------|-----------|
| `docker-dockerfile` | Dockerfile optimization, multi-stage builds |
| `docker-compose` | Compose orchestration, networks, volumes |
| `docker-debug` | Container troubleshooting, diagnostics |
| `docker-cicd` | CI/CD pipelines, security scanning |
| `docker-architect` | Complete Docker architecture design |

## Command Namespaces

- `/workflow:` - Development workflow (init, analyze, plan, design, implement, status)
- `/project:` - Project management (backlog, PRD, tech-spec, sprints)
- `/common:` - Transversal commands (audit, changelog, CI/CD)
- `/symfony:` - Symfony-specific (CRUD, migrations, Doctrine)
- `/flutter:` - Flutter-specific (widgets, BLoC, performance)
- `/python:` - Python-specific (endpoints, async, typing)
- `/react:` - React-specific (components, hooks, a11y)
- `/reactnative:` - React Native-specific (screens, native modules)
- `/angular:` - Angular-specific (components, signals, standalone)
- `/csharp:` - C#/.NET-specific (features, architecture, CQRS)
- `/laravel:` - Laravel-specific (controllers, Actions, Pest PHP)
- `/vuejs:` - Vue.js-specific (components, composables, Pinia)
- `/php:` - PHP-specific (entities, value objects, use cases, Clean Architecture)
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
- [Migration Guide](docs/MIGRATION.md) - Upgrade existing projects to v3.0
- [Hooks Guide](docs/HOOKS.md) - Pre/Post tool execution automation
- [MCP Guide](docs/MCP.md) - Model Context Protocol integration

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
