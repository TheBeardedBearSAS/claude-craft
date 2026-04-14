# Project Creation Guide

This guide walks you through setting up a new project with Claude-Craft, from choosing your technology stack to configuring your development environment.

---

## Table of Contents

1. [Choosing Your Technology](#choosing-your-technology)
2. [Installation Methods](#installation-methods)
3. [Single Technology Projects](#single-technology-projects)
4. [Monorepo Projects](#monorepo-projects)
5. [Post-Installation Configuration](#post-installation-configuration)
6. [Project Startup Checklist](#project-startup-checklist)

---

## Choosing Your Technology

### Technology Comparison

| Technology | Best For | Architecture | Key Features |
|------------|----------|--------------|--------------|
| **.NET / C#** | Enterprise APIs | Clean Architecture + CQRS | MediatR, EF Core, C# 14 |
| **Symfony** | Backend APIs, Web apps | Clean Architecture + DDD | Doctrine, Messenger, API Platform |
| **Flutter** | Mobile apps | Feature-based + BLoC | Material/Cupertino, State management |
| **Python** | APIs, Data services | Clean Architecture | FastAPI, async/await, Pydantic |
| **React** | Web SPAs | Feature-based + Hooks | State management, accessibility |
| **React Native** | Cross-platform mobile | Navigation-based | Native modules, platform-specific code |
| **Angular** | Enterprise Web apps | Domain-driven | Signals, Standalone, RxJS |
| **Vue.js** | Web SPAs | Composition API | Pinia, Vitest, TypeScript |
| **Laravel** | PHP APIs, Web apps | Clean Architecture | Actions, Pest PHP, Sanctum |
| **PHP** | Libraries, Backend | Clean Architecture | PSR-12, PHPStan, Pest PHP |

### Choosing Based on Project Type

| Project Type | Recommended Stack |
|--------------|-------------------|
| REST API | Symfony or Python |
| Mobile app (native feel) | Flutter |
| Mobile app (JS team) | React Native |
| Web SPA | React |
| Full-stack web | Symfony + React |
| Full-stack mobile | Symfony + Flutter |
| Microservices | Python (FastAPI) |

### Common Combinations

```
Web Application:     Symfony (backend) + React (frontend)
Mobile Application:  Symfony (API) + Flutter (mobile)
Full Platform:       Symfony (API) + React (web) + Flutter (mobile)
Data Platform:       Python (API) + React (dashboard)
```

---

## Installation Methods

Claude-Craft offers multiple installation methods to fit different workflows.

### Method 1: Makefile (Recommended)

The simplest and most flexible approach.

```bash
# Basic syntax
make install-{technology} TARGET=path LANG=language

# Examples
make install-symfony TARGET=./backend LANG=en
make install-flutter TARGET=./mobile LANG=fr
make install-python TARGET=./api LANG=es
make install-react TARGET=./frontend LANG=de
make install-reactnative TARGET=./app LANG=pt
```

#### Available Options

| Option | Description | Example |
|--------|-------------|---------|
| `TARGET` | Installation path | `TARGET=~/projects/myapp` |
| `LANG` | Language code | `LANG=fr` |
| `OPTIONS` | Additional flags | `OPTIONS="--force --backup"` |

#### Option Flags

```bash
# Preview changes without applying
make install-symfony TARGET=./backend OPTIONS="--dry-run"

# Force overwrite existing files (creates backup)
make install-symfony TARGET=./backend OPTIONS="--force"

# Create backup before installation
make install-symfony TARGET=./backend OPTIONS="--backup"

# Interactive mode (prompts for project info)
make install-symfony TARGET=./backend OPTIONS="--interactive"

# Update only (preserve project-specific files)
make install-symfony TARGET=./backend OPTIONS="--update"
```

### Method 2: Direct Script Execution

Run installation scripts directly for more control.

```bash
# Syntax
./Dev/scripts/install-{technology}-rules.sh [OPTIONS] [TARGET]

# Examples
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/my-project
./Dev/scripts/install-flutter-rules.sh --lang=en --dry-run .
./Dev/scripts/install-python-rules.sh --force --backup ~/api
```

#### Script Options

```bash
--lang=XX       # Language (en, fr, es, de, pt)
--install       # Full installation mode
--update        # Update common rules only
--force         # Overwrite all files
--dry-run       # Preview without changes
--backup        # Create backup first
--interactive   # Prompt for project info
--help          # Show help
--version       # Show version
```

### Method 3: YAML Configuration

Best for monorepos and multi-project setups.

```bash
# Create configuration
cp claude-projects.yaml.example claude-projects.yaml

# Edit configuration
nano claude-projects.yaml

# Validate configuration
make config-validate CONFIG=claude-projects.yaml

# Install specific project
make config-install CONFIG=claude-projects.yaml PROJECT=my-project

# Install all projects
make config-install-all CONFIG=claude-projects.yaml
```

---

## Single Technology Projects

### Symfony Project

```bash
# Create project directory
mkdir ~/my-symfony-api
cd ~/my-symfony-api
composer create-project symfony/skeleton .
git init

# Install Claude-Craft rules
make install-symfony TARGET=. LANG=fr

# Verify installation
ls -la .claude/
```

**Installed content:**
- 21 Symfony-specific rules (Clean Architecture, DDD, CQRS, etc.)
- 10+ Symfony commands (`/symfony:generate-crud`, `/symfony:check-compliance`, etc.)
- Symfony reviewer agent
- Code templates (Service, ValueObject, Aggregate, etc.)
- Quality checklists

### Flutter Project

```bash
# Create project
flutter create my_flutter_app
cd my_flutter_app
git init

# Install Claude-Craft rules
make install-flutter TARGET=. LANG=en

# Verify
ls -la .claude/
```

**Installed content:**
- 13 Flutter-specific rules (BLoC, state management, testing)
- 10 Flutter commands
- Flutter reviewer agent
- Widget and BLoC templates
- Quality checklists

### Python Project

```bash
# Create project
mkdir ~/my-python-api
cd ~/my-python-api
python -m venv venv
git init

# Install Claude-Craft rules
make install-python TARGET=. LANG=en

# Verify
ls -la .claude/
```

**Installed content:**
- 12 Python-specific rules (FastAPI, async, typing)
- 10 Python commands
- Python reviewer agent
- Service and API templates
- Quality checklists

### React Project

```bash
# Create project
npx create-react-app my-react-app
cd my-react-app

# Install Claude-Craft rules
make install-react TARGET=. LANG=en

# Verify
ls -la .claude/
```

### React Native Project

```bash
# Create project
npx react-native init MyApp
cd MyApp

# Install Claude-Craft rules
make install-reactnative TARGET=. LANG=en

# Verify
ls -la .claude/
```

---

## Monorepo Projects

### Understanding Monorepo Structure

A typical monorepo might look like:

```
my-platform/
├── backend/          # Symfony API
├── web/              # React frontend
├── mobile/           # Flutter app
├── shared/           # Shared types/contracts
└── claude-projects.yaml
```

### YAML Configuration Structure

```yaml
# claude-projects.yaml

settings:
  default_lang: "fr"              # Default language for all projects
  claude_craft_path: "~/claude-craft"  # Path to claude-craft (optional)

projects:
  - name: "my-platform"
    description: "Full-stack SaaS platform"
    path: "~/Projects/my-platform"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
        lang: "en"                # Override default language

      - name: "web"
        path: "web"
        technologies: ["react"]

      - name: "mobile"
        path: "mobile"
        technologies: ["flutter"]
```

### Configuration Fields

#### Project Level

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Project identifier |
| `description` | No | Project description |
| `path` | Yes | Absolute path to project root |
| `lang` | No | Language override |
| `modules` | No | List of modules (for monorepos) |
| `technologies` | No | Technologies if no modules |

#### Module Level

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Module identifier |
| `path` | Yes | Relative path from project root |
| `technologies` | Yes | List of technologies |
| `lang` | No | Language override |
| `skip_common` | No | Skip common rules (default: false) |

### Installation Commands

```bash
# Validate configuration
make config-validate CONFIG=claude-projects.yaml

# List configured projects
make config-list CONFIG=claude-projects.yaml

# Install specific project
make config-install CONFIG=claude-projects.yaml PROJECT=my-platform

# Install specific module
make config-install CONFIG=claude-projects.yaml PROJECT=my-platform MODULE=api

# Dry-run to preview
make config-install CONFIG=claude-projects.yaml PROJECT=my-platform OPTIONS="--dry-run"

# Install all projects
make config-install-all CONFIG=claude-projects.yaml
```

### Real-World Examples

#### Example 1: SaaS Platform

```yaml
projects:
  - name: "saas-platform"
    path: "~/Projects/saas"
    modules:
      - name: "api"
        path: "services/api"
        technologies: ["symfony"]
      - name: "admin"
        path: "apps/admin"
        technologies: ["react"]
      - name: "mobile"
        path: "apps/mobile"
        technologies: ["flutter"]
```

#### Example 2: Microservices

```yaml
projects:
  - name: "microservices"
    path: "~/Projects/micro"
    modules:
      - name: "gateway"
        path: "gateway"
        technologies: ["python"]
      - name: "users"
        path: "services/users"
        technologies: ["symfony"]
      - name: "orders"
        path: "services/orders"
        technologies: ["symfony"]
      - name: "analytics"
        path: "services/analytics"
        technologies: ["python"]
```

#### Example 3: Multiple Independent Projects

```yaml
settings:
  default_lang: "fr"

projects:
  - name: "client-a"
    path: "~/Clients/client-a"
    technologies: ["symfony", "react"]

  - name: "client-b"
    path: "~/Clients/client-b"
    technologies: ["flutter"]
    lang: "en"

  - name: "internal-tool"
    path: "~/Internal/tool"
    technologies: ["python"]
```

---

## Post-Installation Configuration

After installation, configure these files for your specific project.

### 1. Project Context (`rules/00-project-context.md`)

This is the most important file to customize. It tells Claude about your specific project.

**Option A: Interactive Setup (Recommended)**

Run this command in Claude Code to auto-detect your stack and answer targeted questions:
```bash
/common:setup-project-context
```

**Option B: Manual Configuration**

Edit the file directly with your project details:

```markdown
# Project Context

## Project Information
- **Name**: My Awesome API
- **Type**: REST API for e-commerce platform
- **Team Size**: 3 developers

## Technical Stack
- PHP 8.3 with Symfony 7.0
- PostgreSQL 16
- Redis for caching
- RabbitMQ for messaging

## Conventions
- PSR-12 coding standard
- Strict typing enabled
- English code, French documentation

## Constraints
- RGPD compliance required
- Must support multi-tenant architecture
- Maximum response time: 200ms

## External Dependencies
- Stripe for payments
- SendGrid for emails
- S3 for file storage
```

### 2. Main Configuration (`CLAUDE.md`)

The CLAUDE.md file in `.claude/` directory contains the main configuration. Key sections to review:

```markdown
# Project Configuration

## Language Settings
- Code: English
- Documentation: French
- Comments: English

## Architecture
Clean Architecture + DDD + Hexagonal

## Quality Requirements
- Test coverage: 80%+
- PHPStan level: 9
- No critical security issues

## Docker Requirements
All commands must use Docker via make targets.
```

### 3. Agent Configuration

Review installed agents in `.claude/agents/` and customize if needed:

```bash
ls .claude/agents/
# api-designer.md
# database-architect.md
# symfony-reviewer.md
# tdd-coach.md
# ...
```

---

## Project Startup Checklist

Use this checklist when setting up a new project:

### Pre-Installation

- [ ] Project directory created
- [ ] Git repository initialized
- [ ] Technology stack decided
- [ ] Language preference chosen

### Installation

- [ ] Claude-Craft rules installed
- [ ] Installation verified (`ls .claude/`)
- [ ] No errors in installation output

### Configuration

- [ ] `00-project-context.md` customized with project details
- [ ] `CLAUDE.md` reviewed and adjusted
- [ ] Team conventions documented
- [ ] Constraints and requirements listed

### Verification

- [ ] Claude Code started in project directory
- [ ] Commands available (try `/symfony:check-compliance`)
- [ ] Agents responding (try `@symfony-reviewer hello`)

### Team Setup

- [ ] `.claude/` directory committed to git
- [ ] Team members informed of available commands
- [ ] README updated with Claude-Craft usage info

---

## Common Patterns

### Installing Common Rules Only

For shared libraries or packages that don't fit a specific technology:

```bash
make install-common TARGET=./shared-lib LANG=en
```

### Installing Project Management Tools

For sprint tracking and backlog management:

```bash
make install-project TARGET=. LANG=fr
```

### Installing Infrastructure Tools

For Docker and CI/CD support:

```bash
make install-infra TARGET=. LANG=en
```

### Full Installation (All Technologies)

```bash
make install-all TARGET=. LANG=fr
```

---

### Token Optimization Setup

After installing rules, optionally configure RTK for token savings:

```bash
# In Claude Code session
/common:setup-rtk
```

This sets up RTK proxy, sub-agent model optimization, and hook templates for 55-65% overall token reduction.

---

## Updating Rules

When Claude-Craft releases new versions:

```bash
# Update to latest (preserves project-specific files)
make install-symfony TARGET=./backend OPTIONS="--update"

# Force full reinstall (backup created automatically)
make install-symfony TARGET=./backend OPTIONS="--force"
```

---

## Next Steps

Your project is now set up! Continue with:

1. **[Feature Development Guide](03-feature-development.md)** - Learn the TDD workflow
2. **[Bug Fixing Guide](04-bug-fixing.md)** - Handle bugs effectively
3. **[Tools Reference](05-tools-reference.md)** - Explore additional tools

---

[&larr; Getting Started](01-getting-started.md) | [Feature Development &rarr;](03-feature-development.md)
