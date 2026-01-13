# Getting Started with Claude-Craft

Welcome to Claude-Craft! This guide will help you understand what Claude-Craft is and get your first project up and running in just 5 minutes.

---

## What is Claude-Craft?

Claude-Craft is a comprehensive framework for AI-assisted development with Claude Code. It provides:

- **67+ Rules** - Best practices for architecture, testing, security, and code quality
- **23 AI Agents** - Specialized assistants for different tasks (API design, database architecture, code review, etc.)
- **74+ Slash Commands** - Quick actions for code generation, analysis, and quality checks
- **25+ Templates** - Ready-to-use code patterns for common components
- **21+ Checklists** - Quality gates for features, releases, and security audits

### Supported Technologies

| Technology | Focus | Use Cases |
|------------|-------|-----------|
| **Symfony** | Clean Architecture + DDD | APIs, Web apps, Backend services |
| **Flutter** | BLoC Pattern | Mobile apps (iOS/Android) |
| **Python** | FastAPI/Django | APIs, Data services, ML backends |
| **React** | Hooks + State Management | Web SPAs, Dashboards |
| **React Native** | Cross-platform Mobile | Mobile apps with JS |
| **Docker** | Infrastructure | Containerization, CI/CD |

### Supported Languages

All content is available in 5 languages:
- English (en)
- French (fr)
- Spanish (es)
- German (de)
- Portuguese (pt)

---

## Prerequisites

### Required

- **Bash** - Shell for running installation scripts
- **Claude Code** - The AI coding assistant from Anthropic

### Optional (Recommended)

- **yq** - YAML processor for configuration files
  ```bash
  # macOS
  brew install yq

  # Linux (Debian/Ubuntu)
  sudo apt install yq

  # Linux (snap)
  sudo snap install yq
  ```

- **jq** - JSON processor (for StatusLine tool)
  ```bash
  # macOS
  brew install jq

  # Linux
  sudo apt install jq
  ```

---

## Quick Installation

### Method 1: Makefile (Recommended)

```bash
# Clone Claude-Craft
git clone https://github.com/thebeardedcto/claude-craft.git
cd claude-craft

# Install for a Symfony project (in French)
make install-symfony TARGET=~/my-project LANG=fr

# Or for a Flutter project (in English)
make install-flutter TARGET=~/my-app LANG=en
```

### Method 2: Direct Script

```bash
# Navigate to Claude-Craft
cd claude-craft

# Run installation script
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/my-project
```

### Method 3: YAML Configuration (for Monorepos)

```bash
# Create configuration file
cp claude-projects.yaml.example claude-projects.yaml

# Edit with your projects
nano claude-projects.yaml

# Install from configuration
make config-install CONFIG=claude-projects.yaml PROJECT=my-project
```

---

## Your First Project in 5 Minutes

Let's create a new Symfony API project with French rules.

### Step 1: Create Project Directory

```bash
mkdir ~/my-api
cd ~/my-api
git init
```

### Step 2: Install Claude-Craft Rules

```bash
# From the claude-craft directory
make install-symfony TARGET=~/my-api LANG=fr
```

### Step 3: Verify Installation

```bash
ls -la ~/my-api/.claude/
```

You should see:
```
.claude/
├── CLAUDE.md           # Main configuration
├── rules/              # 21 rule files
├── agents/             # AI agents
├── commands/           # Slash commands
│   ├── common/         # Transversal commands
│   └── symfony/        # Symfony-specific commands
├── templates/          # Code templates
└── checklists/         # Quality gates
```

### Step 4: Configure Your Project Context

You can configure the project context interactively or manually:

**Option A: Interactive (Recommended)**
```bash
cd ~/my-api && claude
# Then run:
/common:setup-project-context
```

**Option B: Manual**
```bash
nano ~/my-api/.claude/rules/00-project-context.md
```

Update these sections:
- Project name and description
- Technical stack details
- Team conventions
- Specific constraints

### Step 5: Start Claude Code

```bash
cd ~/my-api
claude
```

Now you can use all the installed commands and agents!

---

## Understanding the Structure

### Rules (`rules/`)

Rules are guidelines that Claude follows when working on your project. They are numbered for priority:

| Number | Topic |
|--------|-------|
| 00 | Project context (customize this!) |
| 01 | Workflow and analysis |
| 02 | Architecture |
| 03 | Coding standards |
| 04 | SOLID principles |
| 05 | KISS, DRY, YAGNI |
| 06 | Docker and tooling |
| 07 | Testing |
| 08 | Quality tools |
| 09 | Git workflow |
| 10 | Documentation |
| 11 | Security |
| 12+ | Advanced topics (DDD, CQRS, etc.) |

### Agents (`agents/`)

Agents are specialized AI personas you can invoke for specific tasks:

```markdown
@api-designer Design the REST API for user management
@database-architect Create the schema for the Order aggregate
@symfony-reviewer Review my UserService implementation
@tdd-coach Help me write tests for the authentication flow
```

### Commands (`commands/`)

Slash commands are quick actions:

```bash
# Generate code
/symfony:generate-crud User

# Check quality
/symfony:check-compliance

# Analyze architecture
/common:architecture-decision
```

### Templates (`templates/`)

Templates provide code patterns:
- `service.md` - Service class template
- `value-object.md` - Value Object template
- `aggregate-root.md` - DDD Aggregate Root template
- `test-unit.md` - Unit test template

### Checklists (`checklists/`)

Quality gates for different scenarios:
- `feature-checklist.md` - Before completing a feature
- `pre-commit.md` - Before committing code
- `release.md` - Before releasing
- `security-audit.md` - Security review

---

## Key Concepts

### 1. TDD Workflow

Claude-Craft enforces Test-Driven Development:

```
1. Analyze requirements
2. Write failing tests
3. Implement code
4. Refactor
5. Review
```

### 2. Clean Architecture

All technology stacks follow Clean Architecture principles:

```
┌─────────────────────────────────────┐
│           Presentation              │
├─────────────────────────────────────┤
│           Application               │
├─────────────────────────────────────┤
│             Domain                  │
├─────────────────────────────────────┤
│          Infrastructure             │
└─────────────────────────────────────┘
```

### 3. Quality First

Every feature must pass quality gates:
- 80%+ test coverage
- Static analysis passing
- Security audit clear
- Documentation updated

---

## Next Steps

Now that you understand the basics, continue with:

1. **[Project Creation Guide](02-project-creation.md)** - Detailed setup for different scenarios
2. **[Feature Development Guide](03-feature-development.md)** - TDD workflow with agents and commands
3. **[Bug Fixing Guide](04-bug-fixing.md)** - Diagnostic and regression testing workflow

---

## Quick Reference

### Common Commands

```bash
# Installation
make install-{tech} TARGET=path LANG=xx

# List available options
make help

# Validate YAML config
make config-validate CONFIG=file.yaml
```

### Useful Agents

| Agent | Purpose |
|-------|---------|
| `@api-designer` | API design and documentation |
| `@database-architect` | Database schema design |
| `@tdd-coach` | Test writing assistance |
| `@{tech}-reviewer` | Code review for specific tech |

### Essential Commands

| Command | Purpose |
|---------|---------|
| `/common:analyze-feature` | Analyze requirements |
| `/{tech}:generate-crud` | Generate CRUD code |
| `/{tech}:check-compliance` | Full quality audit |
| `/common:security-audit` | Security review |

---

[Next: Project Creation Guide &rarr;](02-project-creation.md)
