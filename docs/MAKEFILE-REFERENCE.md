# Makefile Reference

Complete reference for all Makefile targets in Claude Craft.

---

## Quick Start

```bash
# Show all available commands
make help

# Install a technology
make install-symfony TARGET=~/my-project

# Install with options
make install-symfony TARGET=~/my-project RULES_LANG=fr OPTIONS="--force"
```

---

## Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TARGET` | Target directory for installation | `.` |
| `RULES_LANG` | Language for rules (en, fr, es, de, pt) | `en` |
| `OPTIONS` | Additional options for scripts | (empty) |
| `CONFIG` | YAML configuration file | `claude-projects.yaml` |
| `PROJECT` | Project name (for config install) | (empty) |

---

## Installation Targets

### Single Technology

| Target | Description |
|--------|-------------|
| `install-common` | Install common rules (agents, /common: commands) |
| `install-symfony` | Install Symfony/PHP rules |
| `install-flutter` | Install Flutter/Dart rules |
| `install-python` | Install Python rules |
| `install-react` | Install React rules |
| `install-reactnative` | Install React Native rules |
| `install-angular` | Install Angular rules |
| `install-csharp` | Install C#/.NET rules |
| `install-laravel` | Install Laravel rules |
| `install-vuejs` | Install Vue.js rules |
| `install-php` | Install PHP rules |

**Usage:**
```bash
make install-symfony TARGET=~/my-project
make install-flutter TARGET=~/my-app RULES_LANG=de
```

### All Technologies

| Target | Description |
|--------|-------------|
| `install-all` | Install ALL technologies + common + project |

**Usage:**
```bash
make install-all TARGET=~/my-project RULES_LANG=fr
```

### Preset Combinations

| Target | Description |
|--------|-------------|
| `install-web` | Common + React |
| `install-backend` | Common + Symfony + Python |
| `install-mobile` | Common + Flutter + React Native |
| `install-fullstack-js` | Common + React + Python |

**Usage:**
```bash
make install-web TARGET=~/frontend
make install-backend TARGET=~/api
```

### Infrastructure

| Target | Description |
|--------|-------------|
| `install-infra` | Install Docker agents and commands |
| `install-project` | Install project management commands |

**Usage:**
```bash
make install-infra TARGET=~/my-project
make install-project TARGET=~/my-project
```

---

## Tools Installation

| Target | Description |
|--------|-------------|
| `install-tools` | Install all Claude Code tools |
| `install-statusline` | Install custom status line |
| `install-multiaccount` | Install multi-account manager |
| `install-projectconfig` | Install project config manager |

**Usage:**
```bash
make install-tools
make install-statusline
```

---

## Dry Run Targets

Preview installations without making changes.

| Target | Description |
|--------|-------------|
| `dry-run-all` | Dry run all technologies |
| `dry-run-symfony` | Dry run Symfony |
| `dry-run-flutter` | Dry run Flutter |
| `dry-run-python` | Dry run Python |
| `dry-run-react` | Dry run React |
| `dry-run-reactnative` | Dry run React Native |
| `dry-run-angular` | Dry run Angular |
| `dry-run-csharp` | Dry run C#/.NET |
| `dry-run-laravel` | Dry run Laravel |
| `dry-run-vuejs` | Dry run Vue.js |
| `dry-run-php` | Dry run PHP |

**Usage:**
```bash
make dry-run-symfony TARGET=~/my-project
```

---

## Configuration Targets

For YAML-based multi-project configuration.

| Target | Description |
|--------|-------------|
| `config-list` | List projects in configuration |
| `config-validate` | Validate configuration file |
| `config-install` | Install a specific project |
| `config-install-all` | Install all projects |
| `config-dry-run` | Dry run for a project |
| `config-check` | Check configuration |
| `config-check-fix` | Check and fix configuration |

**Usage:**
```bash
# List projects
make config-list

# Validate
make config-validate

# Install specific project
make config-install PROJECT=my-monorepo

# Install all
make config-install-all

# Dry run
make config-dry-run PROJECT=my-monorepo
```

---

## Migration Targets

| Target | Description |
|--------|-------------|
| `migrate` | Migrate project to v4 |
| `migrate-dry-run` | Preview migration |
| `migrate-all` | Migrate all projects |
| `migrate-check` | Check migration status |

**Usage:**
```bash
# Preview
make migrate-dry-run TARGET=~/my-project

# Migrate
make migrate TARGET=~/my-project

# With backup
make migrate TARGET=~/my-project OPTIONS="--backup"
```

---

## Plugin Export Targets

| Target | Description |
|--------|-------------|
| `plugin-export` | Export as Claude Code plugin |
| `plugin-export-all` | Export all technologies |

**Usage:**
```bash
make plugin-export
make plugin-export-all
```

---

## Utility Targets

| Target | Description |
|--------|-------------|
| `help` | Show help and available targets |
| `list` | List available components |
| `list-agents` | List all agents |
| `list-commands` | List all commands |
| `stats` | Show statistics |
| `tree` | Show project structure |
| `fix-permissions` | Fix script permissions |
| `clean` | Clean temporary files |
| `check` | Run checks |

**Usage:**
```bash
make help
make list
make stats
make fix-permissions
```

---

## Common Options

Pass options via `OPTIONS` variable:

| Option | Description |
|--------|-------------|
| `--dry-run` | Simulate without changes |
| `--force` | Overwrite existing files |
| `--backup` | Create backup before changes |
| `--update` | Update existing files only |
| `--interactive` | Guided installation |
| `--preserve-config` | Keep CLAUDE.md and project context |
| `--verbose` | Show detailed output |

**Usage:**
```bash
# Force with backup
make install-symfony TARGET=~/project OPTIONS="--force --backup"

# Force but keep config
make install-symfony TARGET=~/project OPTIONS="--force --preserve-config"

# Dry run
make install-symfony TARGET=~/project OPTIONS="--dry-run"
```

---

## Examples

### Basic Installation

```bash
# Install Symfony rules in English
make install-symfony TARGET=~/my-project

# Install Flutter rules in German
make install-flutter TARGET=~/my-app RULES_LANG=de
```

### Full Stack Setup

```bash
# Backend
make install-symfony TARGET=~/api RULES_LANG=fr

# Frontend
make install-react TARGET=~/frontend RULES_LANG=fr

# Mobile
make install-flutter TARGET=~/mobile RULES_LANG=fr

# Infrastructure
make install-infra TARGET=~/api RULES_LANG=fr
```

### Monorepo Setup

```bash
# Using preset
make install-backend TARGET=~/monorepo/api
make install-mobile TARGET=~/monorepo/mobile

# Or using config
cat > claude-projects.yaml << EOF
projects:
  - name: my-monorepo
    root: ~/monorepo
    lang: fr
    common: true
    modules:
      - path: api
        tech: symfony
      - path: mobile
        tech: flutter
EOF

make config-install PROJECT=my-monorepo
```

### Update Existing

```bash
# Update without overwriting customizations
make install-symfony TARGET=~/project OPTIONS="--update"
```

### Force Reinstall

```bash
# Complete reinstall with backup
make install-symfony TARGET=~/project OPTIONS="--force --backup"

# Reinstall but keep config files
make install-symfony TARGET=~/project OPTIONS="--force --preserve-config"
```

### Migration

```bash
# Check current state
make migrate-check TARGET=~/project

# Preview changes
make migrate-dry-run TARGET=~/project

# Migrate with backup
make migrate TARGET=~/project OPTIONS="--backup"
```

---

## Troubleshooting

### "Script not found"

```bash
make fix-permissions
```

### "yq not found"

```bash
# Check prerequisites
./Dev/scripts/check-prerequisites.sh --fix
```

### "TARGET required"

```bash
# Always specify TARGET
make install-symfony TARGET=~/my-project
```

### See Verbose Output

```bash
make install-symfony TARGET=~/project OPTIONS="--verbose"
```

---

## See Also

- [CLI Reference](CLI-REFERENCE.md)
- [Scripts Reference](SCRIPTS-REFERENCE.md)
- [Installation Guide](INSTALLATION.md)
