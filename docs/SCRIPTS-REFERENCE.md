# Scripts Reference

Complete reference for all installation and utility scripts in Claude Craft.

---

## Installation Scripts

All installation scripts are located in `Dev/scripts/`.

### Common Options

All installation scripts support these options:

| Option | Description |
|--------|-------------|
| `--install` | Fresh installation (default) |
| `--update` | Update existing files only |
| `--force` | Overwrite all files |
| `--preserve-config` | Keep CLAUDE.md and project context |
| `--dry-run` | Simulate without changes |
| `--backup` | Create backup before changes |
| `--interactive` | Guided installation |
| `--verbose` | Show detailed output |
| `--lang=XX` | Set language (en, fr, es, de, pt) |
| `--agents-only` | Install only agents |
| `--commands-only` | Install only commands |
| `--rules-only` | Install only rules |
| `--templates-only` | Install only templates |
| `--checklists-only` | Install only checklists |

---

## Technology Installation Scripts

### install-common-rules.sh

Installs common/transversal rules, agents, and commands.

```bash
./Dev/scripts/install-common-rules.sh [options] <target>

# Examples
./Dev/scripts/install-common-rules.sh ~/my-project
./Dev/scripts/install-common-rules.sh --lang=fr ~/my-project
./Dev/scripts/install-common-rules.sh --force --backup ~/my-project
```

**Installs:**
- Common agents (api-designer, database-architect, tdd-coach, etc.)
- Common commands (`/common:*`)
- Base references (SOLID, KISS/DRY/YAGNI, Git workflow)
- Skills (testing, security, documentation)

---

### install-symfony-rules.sh

Installs Symfony/PHP rules and tooling.

```bash
./Dev/scripts/install-symfony-rules.sh [options] <target>

# Examples
./Dev/scripts/install-symfony-rules.sh ~/my-project
./Dev/scripts/install-symfony-rules.sh --lang=fr --force ~/my-project
```

**Installs:**
- Symfony-specific references (architecture, DDD, testing)
- Symfony reviewer agent
- Symfony commands (`/symfony:*`)
- PHP templates

---

### install-flutter-rules.sh

Installs Flutter/Dart rules and tooling.

```bash
./Dev/scripts/install-flutter-rules.sh [options] <target>

# Examples
./Dev/scripts/install-flutter-rules.sh ~/my-app
./Dev/scripts/install-flutter-rules.sh --lang=de ~/my-app
```

**Installs:**
- Flutter-specific references (BLoC, Riverpod, Material)
- Flutter reviewer agent
- Flutter commands (`/flutter:*`)
- Dart templates

---

### install-react-rules.sh

Installs React/TypeScript rules and tooling.

```bash
./Dev/scripts/install-react-rules.sh [options] <target>
```

**Installs:**
- React references (hooks, state management, a11y)
- React reviewer agent
- React commands (`/react:*`)
- TypeScript templates

---

### install-reactnative-rules.sh

Installs React Native rules and tooling.

```bash
./Dev/scripts/install-reactnative-rules.sh [options] <target>
```

**Installs:**
- React Native references (navigation, native modules)
- React Native reviewer agent
- React Native commands (`/reactnative:*`)

---

### install-python-rules.sh

Installs Python rules and tooling.

```bash
./Dev/scripts/install-python-rules.sh [options] <target>
```

**Installs:**
- Python references (FastAPI, async, typing)
- Python reviewer agent
- Python commands (`/python:*`)

---

### install-angular-rules.sh

Installs Angular rules and tooling.

```bash
./Dev/scripts/install-angular-rules.sh [options] <target>
```

**Installs:**
- Angular references (signals, standalone, RxJS)
- Angular reviewer agent
- Angular commands (`/angular:*`)

---

### install-csharp-rules.sh

Installs C#/.NET rules and tooling.

```bash
./Dev/scripts/install-csharp-rules.sh [options] <target>
```

**Installs:**
- C# references (Clean Architecture, CQRS, EF Core)
- C# reviewer agent
- C# commands (`/csharp:*`)
- C# templates

---

### install-laravel-rules.sh

Installs Laravel rules and tooling.

```bash
./Dev/scripts/install-laravel-rules.sh [options] <target>
```

**Installs:**
- Laravel references (Actions, Pest PHP, Sanctum)
- Laravel reviewer agent
- Laravel commands (`/laravel:*`)

---

### install-vuejs-rules.sh

Installs Vue.js rules and tooling.

```bash
./Dev/scripts/install-vuejs-rules.sh [options] <target>
```

**Installs:**
- Vue.js references (Composition API, Pinia)
- Vue.js reviewer agent
- Vue.js commands (`/vuejs:*`)

---

### install-php-rules.sh

Installs PHP (non-framework) rules and tooling.

```bash
./Dev/scripts/install-php-rules.sh [options] <target>
```

**Installs:**
- PHP references (PSR-12, PHPStan)
- PHP reviewer agent
- PHP commands (`/php:*`)

---

## Configuration Scripts

### install-from-config.sh

Installs from YAML configuration file.

```bash
./Dev/scripts/install-from-config.sh [options] <config-file> [project-name]

# Examples
./Dev/scripts/install-from-config.sh claude-projects.yaml
./Dev/scripts/install-from-config.sh claude-projects.yaml my-project
./Dev/scripts/install-from-config.sh --dry-run claude-projects.yaml
```

**Options:**
- `--dry-run` - Preview changes
- `--all` - Install all projects in config

---

### check-config.sh

Validates YAML configuration file.

```bash
./Dev/scripts/check-config.sh <config-file>

# Example
./Dev/scripts/check-config.sh claude-projects.yaml
```

**Validates:**
- YAML syntax
- Required fields (name, root, modules)
- Valid technology names
- Path existence

---

## Utility Scripts

### check-prerequisites.sh

Checks if all prerequisites are installed.

```bash
./Dev/scripts/check-prerequisites.sh [options]

# Examples
./Dev/scripts/check-prerequisites.sh
./Dev/scripts/check-prerequisites.sh --verbose
./Dev/scripts/check-prerequisites.sh --fix
```

**Options:**
- `--verbose` - Show version details
- `--fix` - Show installation commands

**Checks:**
- Node.js (18+)
- npm
- yq (v4, Mike Farah's version)
- Git
- Docker (optional)
- jq (optional)
- make (optional)

---

### tcl-common.sh

Common functions used by installation scripts.

**Not meant to be run directly.** Sourced by other scripts.

**Provides:**
- `create_tcl_structure()` - Creates TCL directories
- `copy_references()` - Copies reference files
- `generate_claude_md()` - Generates CLAUDE.md
- `generate_index_md()` - Generates INDEX.md
- `backup_existing()` - Creates backup
- `log_info()`, `log_error()` - Logging functions

---

## Infrastructure Scripts

Located in `Infra/`.

### install-infra-rules.sh

Installs Docker/infrastructure rules and agents.

```bash
./Infra/install-infra-rules.sh [options] <target>

# Examples
./Infra/install-infra-rules.sh ~/my-project
./Infra/install-infra-rules.sh --lang=fr ~/my-project
```

**Installs:**
- Docker agents (dockerfile, compose, debug, cicd, architect)
- Docker commands (`/docker:*`)

---

## Project Scripts

Located in `Project/`.

### install-project-commands.sh

Installs project management commands.

```bash
./Project/install-project-commands.sh [options] <target>

# Examples
./Project/install-project-commands.sh ~/my-project
./Project/install-project-commands.sh --lang=fr ~/my-project
```

**Installs:**
- Project commands (`/project:*`)
- Sprint commands (`/sprint:*`)
- Gate commands (`/gate:*`)
- BMAD agents and commands
- Product Owner and Tech Lead agents

---

## Tool Scripts

Located in `Tools/`.

### StatusLine Installation

```bash
./Tools/StatusLine/install.sh

# Or via make
make install-statusline
```

Installs custom status line for Claude Code.

### MultiAccount Installation

```bash
./Tools/MultiAccount/install.sh

# Or via make
make install-multiaccount
```

Installs multi-account manager for Claude Code.

### ProjectConfig Installation

```bash
./Tools/ProjectConfig/install.sh

# Or via make
make install-projectconfig
```

Installs interactive project configuration manager.

---

## Environment Variables

Scripts respect these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDE_CRAFT_LANG` | Default language | `en` |
| `CLAUDE_CRAFT_ROOT` | Claude Craft installation | `$(dirname $0)/..` |
| `VERBOSE` | Enable verbose output | `0` |
| `DRY_RUN` | Enable dry run | `0` |

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Missing prerequisites |
| 4 | Target not found |
| 5 | Permission denied |
| 6 | Backup failed |
| 7 | Migration failed |

---

## Examples

### Fresh Installation

```bash
# Full installation with French
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/my-project
./Dev/scripts/install-common-rules.sh --lang=fr ~/my-project
```

### Update Existing

```bash
# Update without overwriting customizations
./Dev/scripts/install-symfony-rules.sh --update ~/my-project
```

### Force Reinstall

```bash
# Force reinstall with backup
./Dev/scripts/install-symfony-rules.sh --force --backup ~/my-project
```

### Partial Installation

```bash
# Install only agents
./Dev/scripts/install-symfony-rules.sh --agents-only ~/my-project

# Install only commands
./Dev/scripts/install-symfony-rules.sh --commands-only ~/my-project
```

### Dry Run

```bash
# Preview what would be installed
./Dev/scripts/install-symfony-rules.sh --dry-run ~/my-project
```

---

## See Also

- [CLI Reference](CLI-REFERENCE.md)
- [Installation Guide](INSTALLATION.md)
- [Makefile Reference](MAKEFILE-REFERENCE.md)
