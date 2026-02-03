# Claude Craft

A comprehensive framework for AI-assisted development with [Claude Code](https://claude.ai/code). Install standardized rules, agents, and commands for your projects across multiple technology stacks.

**Autonomous Sprint Ready**: Run entire sprints overnight with `/common:ralph-sprint` - auto-claim, error recovery, parallel processing.

## What's New in v5.4 - Claude Code 2.1.29 Compatibility

- **PR Integration** (v2.1.27): Resume sessions linked to PRs with `--from-pr`
  - `claude --from-pr 123` or `claude --from-pr <url>`
  - Auto-link when creating PRs via `gh pr create`
  - Status indicators: approved, pending, changes requested, draft, merged
- **File Tools Preference** (v2.1.21): Claude prefers native tools over bash
  - Use `Read` instead of `cat/head/tail`
  - Use `Edit` instead of `sed/awk`
  - Use `Write` instead of `echo >/cat <<EOF`
- **spinnerVerbs** (v2.1.23): Customize spinner text in settings.json
- **Task status `deleted`** (v2.1.20): Permanent task removal via TaskUpdate
- **Background Agent Permissions** (v2.1.20): Permission prompts before launch
- **VSCode Python venv** (v2.1.21): Auto-activate virtual environment
- See [CHANGELOG](CHANGELOG.md) for full details

## What's New in v5.1 - QA Recette (Acceptance Testing)

- **Automated Acceptance Testing**: Browser-based testing with Claude in Chrome
  - `/qa:recette --scope=story --id=US-001` - Test user stories
  - `/qa:recette --scope=sprint --id=SPRINT-03` - Test full sprints
  - `/qa:recette-regression` - Run regression suite
  - `/qa:recette-fix --session=REC-xxx` - Fix bugs from recette sessions (TDD)
- **Golden Rule**: A fixed bug should NEVER reappear
  - Auto-generate regression tests (Unit, Functional, Behat) from errors
  - Track all bugs in regression registry
  - Detect regressions by comparing historical runs
- **Session Recovery**: Resume interrupted tests with checkpoints
- **6 Test Categories**: AC validation, edge cases, errors, UI/UX, performance, security
- **Error Classification**: visual, interaction, validation, logic, security, API
- **Chrome Capabilities**: navigate, click, type, screenshot, record_gif
- **Full i18n**: English, French, Spanish, German, Portuguese
- See [Commands Reference](docs/COMMANDS.md) for usage

## What's New in v5.0 - Autonomous Sprint Conductor (ASC)

- **Overnight Sprint Execution**: Run sprints unattended with bounded execution
  - `/common:ralph-sprint "Sprint 3" --overnight` - Stops at 6am
  - `/common:ralph-sprint "Sprint 3" --parallel 3` - Process 3 stories concurrently
  - `/common:ralph-sprint "Sprint 3" --supervised` - Confirm each story
- **Recovery Engine**: 4-level error classification with auto-fix
  - Level 0 (Transient): Auto-retry with backoff (timeout, rate limit)
  - Level 1 (Recoverable): Auto-fix then retry (lint, tests, deps)
  - Level 2 (Degraded): Continue with warning (docs, optional gates)
  - Level 3 (Blocked): Escalate to human (security, architecture)
- **Escalation Service**: Queue blocking issues with webhook notifications
  - Slack, Teams, Discord integration
  - Configurable timeout with default actions
  - Audit trail for compliance
- **Parallel Processing**: Dependency-aware concurrent execution
  - Resource monitoring (CPU/memory limits)
  - Automatic session isolation
- **Enhanced Circuit Breaker**: New `autonomous` profile with recovery integration
- See [Autonomous Sprint Documentation](docs/AUTONOMOUS-SPRINT.md)

## What's New in v4.4

- **Comprehensive Documentation for Juniors**: 32 new documentation files
  - [QUICKSTART.md](docs/QUICKSTART.md): Get started in 5 minutes
  - [FAQ.md](docs/FAQ.md): 50+ frequently asked questions
  - [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md): Common problems and solutions
  - [BMAD-PRACTICAL-GUIDE.md](docs/BMAD-PRACTICAL-GUIDE.md): BMAD v6 step-by-step
  - [RALPH-GUIDE.md](docs/RALPH-GUIDE.md): Ralph Wiggum configuration
- **Complete Reference Documentation**: All 130+ commands and 34 agents documented
- **Example Projects**: symfony-api, flutter-app, fullstack-saas
- **Complete Workflow Guides**: Idea → Production in 5 languages
- **Prerequisites Check Script**: `./Dev/scripts/check-prerequisites.sh`

## What's New in v4.3

- **Complete i18n for BMAD v6**: All 18 BMAD commands translated to ES, DE, PT
- **Installation Fixes**: Project commands now properly included in `make install-all`
- **Dev Translations Complete**: All languages now have equal file coverage (~346 files)

## What's New in v4.2

- **BMAD v6 Framework**: Complete project management enhancement
  - **9 Agent-as-Code Agents**: bmad-master, pm, ba, architect, po, sm, dev, qa, ux
  - **Status-based Routing**: Automated state machine for story transitions
  - **5 Quality Gates**: PRD (≥80%), Tech Spec (≥90%), Backlog (INVEST), Sprint Ready, Story DoD
  - **Claude Code Hooks**: SessionStart, PreToolUse, Stop hooks for context injection
  - **Batch Processing**: Queue management for epic/sprint execution with checkpointing
  - **Backlog Migration**: Convert existing backlogs to BMAD v6 format
- 20+ new commands: `/sprint:*`, `/gate:*`, `/project:run-*`
- TDD phase tracking: red → green → refactor cycle per story
- Auto-routing rules for automatic story transitions

## What's New in v4.1

- **Ralph Wiggum v2.0**: Major upgrade to continuous AI agent loop
  - **Claude Code 2.1.23+ Hooks**: Bidirectional integration (SessionStart, PreToolUse, Stop)
  - **Auto-Detection**: Intelligent project type detection (11 technologies)
  - **Observability**: Real-time dashboard, JSON/Prometheus metrics, health monitoring
  - **Adaptive Circuit Breaker**: 5 profiles with learning mode
  - **DoD Templates**: Pre-configured for 8 technologies
- New CLI flags: `--auto-detect`, `--init`, `--interactive`

## What's New in v4.0

- **2026 Best Practices Update** for all major frameworks
- **Symfony 8.0 / PHP 8.5**: JSON Streamer, ObjectMapper, pipe operator, lazy objects
- **Flutter 3.38 / Dart 3.10**: WebAssembly compilation, MCP integration
- **.NET 10 LTS / C# 14**: Extension Members, Null-Conditional Assignment
- **Updated Tooling**: Rector 2.3.x, Deptrac v4, PHPStan 2.1.x
- **Sub-CLAUDE.md files**: Quick reference per technology in `.claude/references/`

## What's New in v3.5

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
- **35 AI Agents**: Specialized reviewers, architects, coaches, UI/UX, Docker experts, Workflow Orchestrator, Ralph Conductor, **10 BMAD agents**, and QA Recette
- **130+ Slash Commands**: Automated workflows, code generation, **sprint management, quality gates, batch processing, acceptance testing**
- **BMAD v6 Framework**: Complete project management with status-based routing, quality gates, and batch execution
- **Ralph Wiggum**: Continuous loop execution with Definition of Done validation
- **249 Skills**: Best practices in official Claude Code format (architecture, testing, security)
- **33 Templates**: Code generation patterns + BMAD templates
- **21 Checklists**: Quality gates for commits, features, releases
- **Hooks System**: Pre/Post tool execution, quality gates, notifications, **BMAD context injection**
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

## BMAD v6 Project Management

BMAD v6 (Build, Measure, Analyze, Deliver) extends the workflow system with comprehensive project management.

### 9 BMAD Agents

| Agent | Role | Key Commands |
|-------|------|--------------|
| `bmad-master` | Orchestrator | `/bmad:init`, `/bmad:status`, `/bmad:route` |
| `pm` | Product Manager | `/pm:prd`, `/pm:vision`, `/pm:roadmap` |
| `ba` | Business Analyst | `/ba:analyze`, `/ba:requirements`, `/ba:use-cases` |
| `architect` | System Architect | `/arch:design`, `/arch:techspec`, `/arch:adr` |
| `po` | Product Owner | `/po:prioritize`, `/po:accept`, `/po:reject` |
| `sm` | Scrum Master | `/sm:plan-sprint`, `/sm:daily`, `/sm:retro` |
| `dev` | Developer | `/dev:implement`, `/dev:tdd`, `/dev:refactor` |
| `qa` | QA Engineer | `/qa:validate`, `/qa:automate`, `/qa:strategy` |
| `ux` | UX Designer | `/ux:wireframe`, `/ux:journey`, `/ux:accessibility` |
| `qa-recette` | QA Recette Engineer | `/qa:recette`, `/qa:recette-fix`, `/qa:recette-status`, `/qa:recette-regression` |

### Status-based Routing

Stories automatically transition through a state machine:

```
backlog → ready-for-dev → in-progress → review → done
   ↓          ↓              ↓           ↓
   └──────────┴──────────────┴───────────┴→ blocked
```

```bash
# View sprint status with routing info
/sprint:bmad-status

# Get next story ready for development
/sprint:next-story --claim

# Transition story status
/sprint:transition US-005 review

# Run automatic routing rules
/sprint:auto-route
```

### 5 Quality Gates

| Gate | Threshold | When |
|------|-----------|------|
| **PRD Gate** | ≥80% | Vision → PRD |
| **Tech Spec Gate** | ≥90% | PRD → Tech Spec |
| **Backlog Gate** | INVEST 6/6 | Tech Spec → Backlog |
| **Sprint Ready** | 100% | Backlog → Sprint |
| **Story DoD** | 100% | Dev → Done |

```bash
# Validate PRD quality
/gate:validate-prd docs/prd.md

# Check INVEST compliance
/gate:validate-backlog

# Verify story meets Definition of Done
/gate:validate-story US-005

# Full gates report
/gate:report
```

### Batch Processing

Process multiple stories automatically:

```bash
# Queue all stories from an epic
/project:run-epic EPIC-002

# Process the queue
/project:run-queue --parallel 3

# Execute full sprint
/project:run-sprint --auto

# Check batch status
/project:batch-status
```

### Backlog Migration

Convert existing backlogs to BMAD v6:

```bash
# Analyze current backlog structure
/project:analyze-backlog

# Migrate to BMAD v6 format
/project:migrate-backlog --dry-run
/project:migrate-backlog

# Add missing fields to stories
/project:update-stories

# Sync files with sprint-status.yaml
/project:sync-backlog
```

### Claude Code Hooks Integration

Enable BMAD hooks in `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [{
      "command": ".bmad/hooks/sprint-context.sh",
      "timeout": 5000
    }],
    "PreToolUse": [{
      "command": ".bmad/hooks/story-status.sh",
      "once": true,
      "timeout": 3000
    }],
    "Stop": [{
      "command": ".bmad/hooks/quality-gate.sh",
      "timeout": 10000
    }]
  }
}
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

### BMAD v6 Agents (10)
| Agent | Role | Key Responsibilities |
|-------|------|----------------------|
| `bmad-master` | Orchestrator | Agent coordination, workflow routing, metrics |
| `pm` | Product Manager | PRD, vision, roadmap, feature prioritization |
| `ba` | Business Analyst | Requirements, use cases, story mapping |
| `architect` | System Architect | Tech specs, ADRs, API design, security |
| `po` | Product Owner | Backlog management, sprint planning, acceptance |
| `sm` | Scrum Master | Ceremonies, velocity, impediments, retrospectives |
| `dev` | Developer | TDD implementation, code review, refactoring |
| `qa` | QA Engineer | Test strategy, automation, validation |
| `ux` | UX Designer | Wireframes, user journeys, accessibility |
| `qa-recette` | QA Recette Engineer | Chrome automation, acceptance testing, regression detection |

## Command Namespaces

- `/workflow:` - Development workflow (init, analyze, plan, design, implement, status)
- `/project:` - Project management (backlog, PRD, tech-spec, sprints, **batch processing, migration**)
- `/sprint:` - **BMAD sprint management (status, transitions, routing, TDD)**
- `/gate:` - **Quality gate validation (PRD, tech-spec, backlog, story, sprint)**
- `/bmad:` - **BMAD orchestration (init, status, route, handoff)**
- `/pm:` - **Product Manager commands (prd, vision, roadmap, prioritize)**
- `/arch:` - **Architect commands (design, techspec, adr, api, security)**
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
- `/qa:` - **QA Recette** (acceptance testing, regression, Chrome automation)

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
