# Installation Guide

This guide covers all methods to install Claude Craft rules in your projects.

## Prerequisites

### Required
- **bash** - Available on Linux, macOS, and Windows (WSL/Git Bash)

### Optional
- **yq** - Required only for YAML configuration-based installation

```bash
# Install yq
sudo apt install yq      # Debian/Ubuntu
brew install yq          # macOS
snap install yq          # Snap
```

## Installation Methods

### Method 1: Makefile (Recommended)

The Makefile provides the simplest way to install rules.

#### Basic Usage

```bash
# Navigate to the claude-craft directory
cd claude-craft

# Install a single technology (default: English)
make install-symfony TARGET=~/my-project
make install-flutter TARGET=~/my-project
make install-python TARGET=~/my-project
make install-react TARGET=~/my-project
make install-reactnative TARGET=~/my-project

# Install with specific language
make install-symfony TARGET=~/my-project RULES_LANG=fr
make install-flutter TARGET=~/my-project RULES_LANG=de
make install-react TARGET=~/my-project RULES_LANG=es

# Available languages: en, fr, es, de, pt

# Install common rules only (agents + /common: commands)
make install-common TARGET=~/my-project

# Install ALL technologies
make install-all TARGET=~/my-project RULES_LANG=fr
```

#### Preset Combinations

```bash
# Web project (Common + React)
make install-web TARGET=~/my-project

# Backend project (Common + Symfony + Python)
make install-backend TARGET=~/my-project

# Mobile project (Common + Flutter + React Native)
make install-mobile TARGET=~/my-project

# Fullstack JS (Common + React + Python)
make install-fullstack-js TARGET=~/my-project
```

#### With Options

```bash
# Dry run (simulate without changes)
make install-symfony TARGET=~/my-project OPTIONS="--dry-run"

# Force overwrite existing files
make install-symfony TARGET=~/my-project OPTIONS="--force"

# Force but preserve user config (CLAUDE.md, 00-project-context.md)
make install-symfony TARGET=~/my-project OPTIONS="--force --preserve-config"

# Create backup before installation
make install-symfony TARGET=~/my-project OPTIONS="--backup"

# Combine options
make install-symfony TARGET=~/my-project OPTIONS="--force --backup"
make install-symfony TARGET=~/my-project OPTIONS="--force --backup --preserve-config"
```

#### Dry Run Shortcuts

```bash
make dry-run-all TARGET=~/my-project
make dry-run-symfony TARGET=~/my-project
make dry-run-flutter TARGET=~/my-project
make dry-run-python TARGET=~/my-project
make dry-run-react TARGET=~/my-project
make dry-run-reactnative TARGET=~/my-project
```

#### Tools Installation

Install Claude Code utilities (status line, multi-account manager):

```bash
# Install all tools
make install-tools

# Install individually
make install-statusline      # Custom status line (~/.claude/)
make install-multiaccount    # Multi-account manager (~/.local/bin/)
make install-projectconfig   # Project config manager (~/.local/bin/)
make install-rtk             # RTK token optimizer (~/.claude/)
```

**Status Line** displays: Profile | Model | Git | Project | Context % | Cost | Time

**Multi-Account Manager** lets you manage multiple Claude Code accounts with aliases.

**Project Config Manager** provides an interactive UI to manage `claude-projects.yaml` (add/edit/delete projects and modules).

**RTK (Token Optimizer)** reduces LLM token consumption by 60-90% via smart command output filtering.

### Method 2: YAML Configuration (Monorepos)

For complex projects with multiple modules, use YAML configuration.

#### 1. Create Configuration File

```bash
cp claude-projects.yaml.example claude-projects.yaml
```

#### 2. Edit Configuration

```yaml
# claude-projects.yaml
settings:
  default_lang: "en"  # Default language (en, fr, es, de, pt)

projects:
  - name: "my-monorepo"
    description: "My fullstack application"
    root: "~/Projects/my-monorepo"
    lang: "fr"    # Override default language for this project
    common: true  # Install common rules at root
    modules:
      - path: "frontend"
        tech: react
      - path: "backend"
        tech: symfony
      - path: "mobile"
        tech: flutter
```

#### 3. Validate Configuration

```bash
make config-validate
```

#### 4. Install

```bash
# Install a specific project
make config-install PROJECT=my-monorepo

# Install all projects in config
make config-install-all

# Dry run
make config-dry-run PROJECT=my-monorepo
```

#### 5. List Projects

```bash
make config-list
```

### Method 3: Direct Script Execution

Run installation scripts directly for more control.

#### Syntax

```bash
./Dev/scripts/install-{tech}-rules.sh [OPTIONS] TARGET_PATH
```

#### Examples

```bash
# Install Symfony rules (English by default)
./Dev/scripts/install-symfony-rules.sh --install ~/my-project

# Install with specific language
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/my-project
./Dev/scripts/install-flutter-rules.sh --lang=de ~/my-project
./Dev/scripts/install-react-rules.sh --lang=es ~/my-project

# Update existing installation
./Dev/scripts/install-flutter-rules.sh --update ~/my-project

# Force reinstall with backup
./Dev/scripts/install-python-rules.sh --force --backup ~/my-project

# Interactive mode
./Dev/scripts/install-react-rules.sh --interactive ~/my-project

# Dry run
./Dev/scripts/install-reactnative-rules.sh --dry-run ~/my-project
```

#### Script Options

| Option | Description |
|--------|-------------|
| `--install` | Fresh installation (default) |
| `--update` | Update existing files only |
| `--force` | Overwrite all files |
| `--preserve-config` | With `--force`, preserve CLAUDE.md and 00-project-context.md |
| `--dry-run` | Simulate without changes |
| `--backup` | Create backup before changes |
| `--interactive` | Guided installation |
| `--lang=XX` | Set language (en, fr, es, de, pt) |
| `--agents-only` | Install only agents |
| `--commands-only` | Install only commands |
| `--rules-only` | Install only rules |
| `--templates-only` | Install only templates |
| `--checklists-only` | Install only checklists |

### Method 4: Manual Installation

> **Note**: As of v3.5, we recommend using the install scripts (Methods 1-3) which automatically configure the TCL (Tiered Context Loading) structure for optimal token usage.

For manual installation with TCL structure:

```bash
# Create TCL structure
mkdir -p ~/my-project/.claude/{references/base,references/symfony,skills,agents,commands/common,commands/symfony,templates,checklists}

# Choose language (en, fr, es, de, pt)
RULES_LANG=en

# Copy base references (universal principles)
cp Dev/i18n/$RULES_LANG/Common/rules/01-workflow-analysis.md ~/my-project/.claude/references/base/workflow-analysis.md
cp Dev/i18n/$RULES_LANG/Common/rules/04-solid-principles.md ~/my-project/.claude/references/base/solid-principles.md
cp Dev/i18n/$RULES_LANG/Common/rules/05-kiss-dry-yagni.md ~/my-project/.claude/references/base/kiss-dry-yagni.md
cp Dev/i18n/$RULES_LANG/Common/rules/09-git-workflow.md ~/my-project/.claude/references/base/git-workflow.md
cp Dev/i18n/$RULES_LANG/Common/rules/10-documentation.md ~/my-project/.claude/references/base/documentation.md

# Copy technology-specific references (example: Symfony)
cp Dev/i18n/$RULES_LANG/Symfony/rules/02-architecture-clean-ddd.md ~/my-project/.claude/references/symfony/architecture.md
cp Dev/i18n/$RULES_LANG/Symfony/rules/03-coding-standards.md ~/my-project/.claude/references/symfony/coding-standards.md
# ... (see install script for full mappings)

# Copy agents, commands, etc.
cp -r Dev/i18n/$RULES_LANG/Common/agents/* ~/my-project/.claude/agents/
cp -r Dev/i18n/$RULES_LANG/Common/commands/* ~/my-project/.claude/commands/common/
cp -r Dev/i18n/$RULES_LANG/Symfony/agents/* ~/my-project/.claude/agents/
cp -r Dev/i18n/$RULES_LANG/Symfony/commands/* ~/my-project/.claude/commands/symfony/
```

The install scripts also generate `CLAUDE.md`, `INDEX.md`, and `context.yaml` automatically.

## Installation Result

After installation with TCL structure (v3.5+), your project will have:

```
my-project/
├── .claude/
│   ├── CLAUDE.md              # Minimal config (~200 tokens) - auto-loaded
│   ├── INDEX.md               # Quick reference summaries (~1,300 tokens)
│   ├── context.yaml           # File-based skill triggers
│   ├── references/
│   │   ├── base/              # Universal principles
│   │   │   ├── solid-principles.md
│   │   │   ├── kiss-dry-yagni.md
│   │   │   ├── workflow-analysis.md
│   │   │   ├── git-workflow.md
│   │   │   └── documentation.md
│   │   └── {technology}/      # Tech-specific rules
│   │       ├── architecture.md
│   │       ├── coding-standards.md
│   │       ├── testing.md
│   │       ├── tooling.md
│   │       ├── quality-tools.md
│   │       └── security.md
│   ├── skills/                # On-demand loading
│   │   └── ... (skill directories)
│   ├── agents/
│   │   ├── api-designer.md
│   │   ├── database-architect.md
│   │   └── {technology}-reviewer.md
│   ├── commands/
│   │   ├── common/
│   │   │   └── ... (common commands)
│   │   └── {technology}/
│   │       └── ... (tech-specific commands)
│   ├── templates/
│   │   └── ... (code templates)
│   └── checklists/
│       └── ... (quality checklists)
└── src/
    └── ... (your code)
```

### Token Optimization

The TCL structure reduces context from ~70,000 to ~3,500 tokens (95% reduction):

| Content | Tokens | When Loaded |
|---------|--------|-------------|
| CLAUDE.md | ~200 | Always (auto) |
| INDEX.md | ~1,300 | On reference via `@` |
| Skills | Variable | Via `/skill-name` |
| References | 0 | On explicit request |

Access full documentation: `@.claude/references/{tech}/architecture.md`

## Verification

### List Installed Components

```bash
# List all agents
ls -la ~/my-project/.claude/agents/

# List all commands
ls -la ~/my-project/.claude/commands/*/

# Count files
find ~/my-project/.claude -name "*.md" | wc -l
```

### Test in Claude Code

Open your project in Claude Code and try:

```
/common:pre-commit-check
/symfony:check-architecture
```

## Updating

To update an existing installation:

```bash
# Update mode preserves your customizations
make install-symfony TARGET=~/my-project OPTIONS="--update"

# Force mode overwrites everything
make install-symfony TARGET=~/my-project OPTIONS="--force --backup"
```

## Uninstalling

Remove the `.claude` directory:

```bash
rm -rf ~/my-project/.claude
```

Or remove specific components:

```bash
rm -rf ~/my-project/.claude/agents/
rm -rf ~/my-project/.claude/commands/symfony/
```

## Troubleshooting

### Permission Denied

```bash
# Make scripts executable
make fix-permissions
# Or manually
chmod +x Dev/scripts/install-*.sh
```

### yq Not Found

```bash
# Install yq for YAML config support
sudo apt install yq  # Debian/Ubuntu
brew install yq      # macOS
```

### Target Directory Doesn't Exist

The scripts will create the `.claude` directory automatically. However, the target project directory must exist.

```bash
mkdir -p ~/my-project
make install-symfony TARGET=~/my-project
```

## Next Steps

- [Configuration Guide](CONFIGURATION.md) - Learn about YAML configuration
- [Agents Reference](AGENTS.md) - Explore available agents
- [Commands Reference](COMMANDS.md) - See all commands
