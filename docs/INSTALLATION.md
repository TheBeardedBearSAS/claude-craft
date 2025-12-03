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

# Install a single technology
make install-symfony TARGET=~/my-project
make install-flutter TARGET=~/my-project
make install-python TARGET=~/my-project
make install-react TARGET=~/my-project
make install-reactnative TARGET=~/my-project

# Install common rules only (agents + /common: commands)
make install-common TARGET=~/my-project

# Install ALL technologies
make install-all TARGET=~/my-project
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

# Create backup before installation
make install-symfony TARGET=~/my-project OPTIONS="--backup"

# Combine options
make install-symfony TARGET=~/my-project OPTIONS="--force --backup"
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
```

**Status Line** displays: Profile | Model | Git | Project | Context % | Cost | Time

**Multi-Account Manager** lets you manage multiple Claude Code accounts with aliases.

**Project Config Manager** provides an interactive UI to manage `claude-projects.yaml` (add/edit/delete projects and modules).

### Method 2: YAML Configuration (Monorepos)

For complex projects with multiple modules, use YAML configuration.

#### 1. Create Configuration File

```bash
cp Dev/claude-projects.yaml.example Dev/claude-projects.yaml
```

#### 2. Edit Configuration

```yaml
# Dev/claude-projects.yaml
projects:
  - name: "my-monorepo"
    description: "My fullstack application"
    root: "~/Projects/my-monorepo"
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
make config-validate CONFIG=Dev/claude-projects.yaml
```

#### 4. Install

```bash
# Install a specific project
make config-install PROJECT=my-monorepo CONFIG=Dev/claude-projects.yaml

# Install all projects in config
make config-install-all CONFIG=Dev/claude-projects.yaml

# Dry run
make config-dry-run PROJECT=my-monorepo CONFIG=Dev/claude-projects.yaml
```

#### 5. List Projects

```bash
make config-list CONFIG=Dev/claude-projects.yaml
```

### Method 3: Direct Script Execution

Run installation scripts directly for more control.

#### Syntax

```bash
./Dev/{Technology}/install-{tech}-rules.sh [OPTIONS] TARGET_PATH
```

#### Examples

```bash
# Install Symfony rules
./Dev/Symfony/install-symfony-rules.sh --install ~/my-project

# Update existing installation
./Dev/Flutter/install-flutter-rules.sh --update ~/my-project

# Force reinstall with backup
./Dev/Python/install-python-rules.sh --force --backup ~/my-project

# Interactive mode
./Dev/React/install-react-rules.sh --interactive ~/my-project

# Dry run
./Dev/ReactNative/install-reactnative-rules.sh --dry-run ~/my-project
```

#### Script Options

| Option | Description |
|--------|-------------|
| `--install` | Fresh installation (default) |
| `--update` | Update existing files only |
| `--force` | Overwrite all files |
| `--dry-run` | Simulate without changes |
| `--backup` | Create backup before changes |
| `--interactive` | Guided installation |
| `--agents-only` | Install only agents |
| `--commands-only` | Install only commands |
| `--rules-only` | Install only rules |
| `--templates-only` | Install only templates |
| `--checklists-only` | Install only checklists |

### Method 4: Manual Installation

Copy files directly for maximum control.

```bash
# Create structure
mkdir -p ~/my-project/.claude/{agents,commands,rules,templates,checklists}

# Copy common agents
cp -r Dev/Common/claude-agents/* ~/my-project/.claude/agents/

# Copy common commands
cp -r Dev/Common/claude-commands/* ~/my-project/.claude/commands/

# Copy technology-specific files
cp -r Dev/Symfony/rules/* ~/my-project/.claude/rules/
cp -r Dev/Symfony/claude-agents/* ~/my-project/.claude/agents/
cp -r Dev/Symfony/claude-commands/* ~/my-project/.claude/commands/
cp -r Dev/Symfony/templates/* ~/my-project/.claude/templates/
cp -r Dev/Symfony/checklists/* ~/my-project/.claude/checklists/
```

## Installation Result

After installation, your project will have:

```
my-project/
├── .claude/
│   ├── agents/
│   │   ├── api-designer.md
│   │   ├── database-architect.md
│   │   ├── devops-engineer.md
│   │   ├── performance-auditor.md
│   │   ├── refactoring-specialist.md
│   │   ├── research-assistant.md
│   │   ├── tdd-coach.md
│   │   └── {technology}-reviewer.md
│   ├── commands/
│   │   ├── common/
│   │   │   ├── architecture-decision.md
│   │   │   ├── daily-standup.md
│   │   │   └── ... (14 commands)
│   │   └── {technology}/
│   │       └── ... (tech-specific commands)
│   ├── rules/
│   │   └── ... (technology rules)
│   ├── templates/
│   │   └── ... (code templates)
│   └── checklists/
│       └── ... (quality checklists)
└── src/
    └── ... (your code)
```

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
chmod +x Dev/*/install-*.sh
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
