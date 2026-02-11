# CLI Reference

Complete reference for the Claude Craft command-line interface.

---

## NPX Installation

The recommended way to install Claude Craft is via NPX:

```bash
npx @the-bearded-bear/claude-craft [command] [options]
```

### Available Commands

| Command | Description |
|---------|-------------|
| `install` | Install Claude Craft to a project |
| `init` | Initialize workflow (shows instructions) |
| `flatten` | Generate flattened codebase context |
| `ralph` | Run Ralph Wiggum continuous loop |
| `help` | Show help message |
| (no command) | Interactive installation wizard |

---

## Interactive Wizard

Run without arguments for the interactive wizard:

```bash
npx @the-bearded-bear/claude-craft
```

The wizard will guide you through:
1. **Target directory** - Where to install
2. **Technology stack** - Which framework(s) to use
3. **Language** - Documentation language (en, fr, es, de, pt)
4. **Options** - Backup, force overwrite, etc.

---

## Install Command

### Basic Usage

```bash
npx @the-bearded-bear/claude-craft install <target-directory> [options]
```

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--tech=<technology>` | `-t` | Technology stack to install |
| `--lang=<language>` | `-l` | Documentation language |
| `--force` | `-f` | Overwrite existing files |
| `--backup` | `-b` | Create backup before install |
| `--dry-run` | `-d` | Simulate without making changes |
| `--preserve-config` | | Keep existing CLAUDE.md |

### Technology Options

| Value | Description |
|-------|-------------|
| `symfony` | Symfony/PHP backend |
| `flutter` | Flutter/Dart mobile |
| `react` | React frontend |
| `reactnative` | React Native mobile |
| `python` | Python backend |
| `angular` | Angular frontend |
| `csharp` | C#/.NET backend |
| `laravel` | Laravel/PHP backend |
| `vuejs` | Vue.js frontend |
| `php` | PHP Clean Architecture |
| `common` | Common rules only |
| `all` | All technologies |

### Language Options

| Value | Language |
|-------|----------|
| `en` | English (default) |
| `fr` | French |
| `es` | Spanish |
| `de` | German |
| `pt` | Portuguese |

### Examples

```bash
# Install Symfony rules in French
npx @the-bearded-bear/claude-craft install ~/my-project --tech=symfony --lang=fr

# Install multiple technologies
npx @the-bearded-bear/claude-craft install . --tech=react
npx @the-bearded-bear/claude-craft install . --tech=python

# Force reinstall with backup
npx @the-bearded-bear/claude-craft install ~/app --tech=flutter --force --backup

# Dry run to preview changes
npx @the-bearded-bear/claude-craft install . --tech=angular --dry-run

# Install all technologies
npx @the-bearded-bear/claude-craft install ~/project --tech=all --lang=en
```

---

## Flatten Command

Generate a flattened summary of your codebase for AI assistants.

### Usage

```bash
npx @the-bearded-bear/claude-craft flatten [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--output=<file>` | Output filename (default: `CODEBASE.md`) |
| `--max-tokens=<n>` | Maximum tokens before sharding |
| `--exclude=<patterns>` | Additional patterns to exclude |

### Examples

```bash
# Generate flattened codebase
npx @the-bearded-bear/claude-craft flatten

# Custom output file
npx @the-bearded-bear/claude-craft flatten --output=CONTEXT.md

# Limit token count (enables sharding for large codebases)
npx @the-bearded-bear/claude-craft flatten --max-tokens=50000

# Exclude additional directories
npx @the-bearded-bear/claude-craft flatten --exclude="*.test.ts,*.spec.ts"
```

### Output

The flatten command generates:
- File tree structure
- Priority-ordered file contents
- Token estimation
- Automatic sharding for large projects

---

## Makefile Commands

When you clone the repository, you can use Make for installation.

### Installation Commands

```bash
# Install specific technology
make install-symfony TARGET=~/project
make install-flutter TARGET=~/project RULES_LANG=fr
make install-react TARGET=~/project OPTIONS="--force"

# Install presets
make install-all TARGET=~/project         # Everything
make install-common TARGET=~/project      # Common rules only
make install-web TARGET=~/project         # React
make install-backend TARGET=~/project     # Symfony + Python
make install-mobile TARGET=~/project      # Flutter + React Native

# Install tools
make install-tools                         # All tools
make install-statusline                    # Custom status line
make install-multiaccount                  # Multi-account manager
make install-projectconfig                 # Project config manager
```

### Dry Run Commands

```bash
make dry-run-all TARGET=~/project
make dry-run-symfony TARGET=~/project
make dry-run-flutter TARGET=~/project
```

### Configuration Commands

```bash
make config-list                           # List projects in YAML config
make config-validate                       # Validate YAML config
make config-install PROJECT=my-project     # Install from config
make config-install-all                    # Install all from config
make config-dry-run PROJECT=my-project     # Dry run from config
```

### Utility Commands

```bash
make help                                  # Show all available commands
make list                                  # List available components
make list-agents                           # List all agents
make list-commands                         # List all commands
make stats                                 # Show statistics
make tree                                  # Show project structure
make fix-permissions                       # Fix script permissions
```

### Migration Commands

```bash
make migrate-check                         # Check migration status
```

### Plugin Export

```bash
make plugin-export                         # Export as Claude Code plugin
make plugin-export-all                     # Export all technologies
```

---

## Direct Script Execution

For advanced control, run installation scripts directly.

### Syntax

```bash
./Dev/scripts/install-{tech}-rules.sh [options] <target-directory>
```

### Available Scripts

| Script | Technology |
|--------|------------|
| `install-common-rules.sh` | Common/transversal |
| `install-symfony-rules.sh` | Symfony |
| `install-flutter-rules.sh` | Flutter |
| `install-react-rules.sh` | React |
| `install-reactnative-rules.sh` | React Native |
| `install-python-rules.sh` | Python |
| `install-angular-rules.sh` | Angular |
| `install-csharp-rules.sh` | C#/.NET |
| `install-laravel-rules.sh` | Laravel |
| `install-vuejs-rules.sh` | Vue.js |
| `install-php-rules.sh` | PHP |

### Script Options

| Option | Description |
|--------|-------------|
| `--install` | Fresh installation (default) |
| `--update` | Update existing files only |
| `--force` | Overwrite all files |
| `--preserve-config` | Keep CLAUDE.md and project context |
| `--dry-run` | Simulate without changes |
| `--backup` | Create backup before changes |
| `--interactive` | Guided installation |
| `--lang=XX` | Set language (en, fr, es, de, pt) |
| `--agents-only` | Install only agents |
| `--commands-only` | Install only commands |
| `--rules-only` | Install only rules |
| `--templates-only` | Install only templates |
| `--checklists-only` | Install only checklists |

### Examples

```bash
# Basic installation
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/my-project

# Update existing installation
./Dev/scripts/install-flutter-rules.sh --update ~/my-app

# Force reinstall with backup
./Dev/scripts/install-python-rules.sh --force --backup ~/api

# Interactive mode
./Dev/scripts/install-react-rules.sh --interactive ~/frontend

# Install only agents
./Dev/scripts/install-symfony-rules.sh --agents-only ~/project
```

---

## Ralph Wiggum CLI

Run Claude in a continuous loop until task completion.

### Usage

```bash
npx @the-bearded-bear/claude-craft ralph "task description" [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--full` | Enable all DoD validators |
| `--max-iterations=<n>` | Maximum iterations (default: 10) |
| `--dod=<file>` | Custom DoD configuration file |

### Examples

```bash
# Basic task
npx @the-bearded-bear/claude-craft ralph "Implement user authentication"

# With full DoD checks
npx @the-bearded-bear/claude-craft ralph --full "Fix the login bug"

# Custom iteration limit
npx @the-bearded-bear/claude-craft ralph --max-iterations=20 "Refactor the payment module"
```

---

## Autonomous Sprint Conductor (ASC) CLI

Run entire sprints with minimal human intervention.

### Usage

```bash
npx @the-bearded-bear/claude-craft ralph-sprint "sprint name" [options]
```

Or via Claude Code command:
```bash
/common:ralph-sprint "Sprint 3" --overnight
```

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--overnight` | `-o` | Enable overnight mode (stops at configured time window) |
| `--supervised` | `-s` | Pause before each story for confirmation |
| `--autonomous` | `-a` | Full autonomous mode (default for overnight) |
| `--parallel=<n>` | `-p` | Process N stories concurrently (default: 1) |
| `--story=<id>` | | Process single story only |
| `--sprint` | | Process entire sprint backlog |
| `--max-stories=<n>` | | Maximum stories to process (default: 10) |
| `--timeout=<hours>` | `-t` | Maximum runtime in hours (default: 12) |
| `--stop-at=<HH:MM>` | | Stop at specific time (e.g., "06:00") |
| `--config=<file>` | `-c` | Custom ASC configuration file |
| `--dry-run` | `-d` | Simulate without executing |
| `--resume=<session>` | | Resume from previous session checkpoint |

### Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| `--supervised` | Pause and confirm before each story | First runs, testing configuration |
| `--autonomous` | Full auto, stops only on critical | Overnight runs, trusted backlog |
| `--overnight` | Autonomous + stop window at 6am | Night execution |

### Examples

```bash
# Overnight sprint execution
npx @the-bearded-bear/claude-craft ralph-sprint "Sprint 3" --overnight

# Supervised first run
npx @the-bearded-bear/claude-craft ralph-sprint "Sprint 3" --supervised

# Parallel processing (3 stories)
npx @the-bearded-bear/claude-craft ralph-sprint "Sprint 3" --parallel 3 --overnight

# Limited run: 5 stories max, 4 hour timeout
npx @the-bearded-bear/claude-craft ralph-sprint "Sprint 3" --max-stories 5 --timeout 4

# Single story processing
npx @the-bearded-bear/claude-craft ralph-sprint "Sprint 3" --story US-042

# Resume interrupted session
npx @the-bearded-bear/claude-craft ralph-sprint "Sprint 3" --resume ASC-20240101-120000-12345

# Custom configuration
npx @the-bearded-bear/claude-craft ralph-sprint "Sprint 3" --config ./my-asc-config.yml --overnight

# Dry run to validate configuration
npx @the-bearded-bear/claude-craft ralph-sprint "Sprint 3" --dry-run
```

### Stop Conditions

The ASC stops when any condition is met:

| Condition | CLI Override | Environment Variable |
|-----------|--------------|---------------------|
| Max stories reached | `--max-stories=N` | `ASC_MAX_STORIES` |
| Consecutive failures | - | `ASC_MAX_CONSECUTIVE_FAILURES` |
| Runtime exceeded | `--timeout=H` | `ASC_MAX_RUNTIME_HOURS` |
| Stop window reached | `--stop-at=HH:MM` | `ASC_STOP_WINDOW` |
| Critical escalation | - | - |

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ASC_MAX_STORIES` | Max stories per session | `10` |
| `ASC_MAX_CONSECUTIVE_FAILURES` | Failures before stop | `3` |
| `ASC_MAX_RUNTIME_HOURS` | Maximum runtime | `12` |
| `ASC_STOP_WINDOW` | Time to stop (HH:MM) | `06:00` |
| `ASC_PARALLEL_MAX` | Max parallel sessions | `3` |
| `ASC_ESCALATION_TIMEOUT` | Escalation timeout (hours) | `4` |

### Output Files

| File | Location | Description |
|------|----------|-------------|
| State | `.ralph/conductor/state-ASC-*.yaml` | Current session state |
| Metrics | `.ralph/conductor/metrics-ASC-*.json` | Session metrics |
| Checkpoint | `.ralph/conductor/checkpoint-ASC-*.yaml` | Resume checkpoint |
| Escalations | `.ralph/escalations/queue/*.yaml` | Pending escalations |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All stories completed successfully |
| 1 | Partial completion (some stories failed/skipped) |
| 2 | Configuration or argument error |
| 3 | Critical escalation caused abort |
| 4 | Session interrupted (can resume) |
| 5 | Maximum failures reached |

---

## Configuration File

### YAML Configuration

For monorepos and multi-project setups, use `claude-projects.yaml`:

```yaml
settings:
  default_lang: "en"

projects:
  - name: "my-monorepo"
    description: "My fullstack application"
    root: "~/Projects/my-monorepo"
    lang: "fr"
    common: true
    modules:
      - path: "frontend"
        tech: react
      - path: "backend"
        tech: symfony
      - path: "mobile"
        tech: flutter
      - path: "api"
        tech: [python, react]  # Multiple technologies
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDE_CRAFT_LANG` | Default language | `en` |
| `CLAUDE_CRAFT_TARGET` | Default target directory | `.` |
| `CLAUDE_CRAFT_CONFIG` | Config file path | `claude-projects.yaml` |

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Missing prerequisites |
| 4 | Target directory not found |
| 5 | Permission denied |

---

## Troubleshooting

### NPX cache issues

```bash
# Clear NPX cache
npx clear-npx-cache
# or
rm -rf ~/.npm/_npx
```

### Script not executable

```bash
chmod +x Dev/scripts/*.sh
# or
make fix-permissions
```

### Wrong yq version

```bash
# Claude Craft requires yq v4 (Mike Farah's version)
yq --version
# Should show: yq (https://github.com/mikefarah/yq/) version v4.x.x
```

---

## See Also

- [Quickstart Guide](QUICKSTART.md)
- [Prerequisites](PREREQUISITES.md)
- [Installation Guide](INSTALLATION.md)
- [Commands Reference](COMMANDS-FULL-REFERENCE.md)
