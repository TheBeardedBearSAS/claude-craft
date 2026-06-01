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
| `check` | Verify claude-craft installation structure |
| `list` | Detailed component inventory |
| `doctor` | Environment diagnostics & health check |
| `update` | Refresh existing installation |
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

## Check Command

Verify the structure of a claude-craft installation.

### Usage

```bash
npx @the-bearded-bear/claude-craft check [target-directory]
```

### Description

Scans the `.claude/` directory and reports a summary of installed components: commands (by namespace), agents, references, skills, checklists, and templates.

### Examples

```bash
# Check current directory
npx @the-bearded-bear/claude-craft check

# Check a specific project
npx @the-bearded-bear/claude-craft check ~/my-project
```

---

## List Command

Display a detailed inventory of all installed claude-craft components.

### Usage

```bash
npx @the-bearded-bear/claude-craft list [target-directory]
```

### Description

Lists every installed component grouped by category (commands, agents, skills, references, checklists, templates) with counts and names. Useful for verifying what was installed and comparing across projects.

### Examples

```bash
# List components in current directory
npx @the-bearded-bear/claude-craft list

# List components in a project
npx @the-bearded-bear/claude-craft list ~/my-project
```

---

## Doctor Command

Run environment diagnostics and installation health checks.

### Usage

```bash
npx @the-bearded-bear/claude-craft doctor [target-directory]
```

### Description

Checks the development environment for required and recommended tools:

| Check | Status |
|-------|--------|
| Node.js >= 20 | `[OK]` / `[FAIL]` |
| npm | `[OK]` / `[FAIL]` |
| Claude Code | `[OK]` / `[WARN]` |
| git | `[OK]` / `[FAIL]` |
| yq | `[OK]` / `[WARN]` |
| `.claude/` structure | `[OK]` / `[WARN]` |
| Shell script permissions | `[OK]` / `[WARN]` |
| i18n directories | `[OK]` / `[WARN]` |

### Examples

```bash
# Check current project
npx @the-bearded-bear/claude-craft doctor

# Check a specific project
npx @the-bearded-bear/claude-craft doctor ~/my-project
```

---

## Update Command

Refresh an existing claude-craft installation by re-running install scripts.

### Usage

```bash
npx @the-bearded-bear/claude-craft update [target-directory] [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--tech=<technology>` | Specific technology to update (if omitted, auto-detects from installed references) |
| `--lang=<language>` | Language override (default: `en`) |

### Description

Re-runs install scripts with `--force` to refresh all files. Common rules are always refreshed first, then tech-specific rules. If `--tech` is omitted, the command auto-detects installed technologies from `.claude/references/`.

### Examples

```bash
# Update all detected technologies
npx @the-bearded-bear/claude-craft update ~/my-project

# Update only React rules in French
npx @the-bearded-bear/claude-craft update ~/my-project --tech=react --lang=fr

# Update current directory
npx @the-bearded-bear/claude-craft update .
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
make install-rtk                           # RTK token optimizer
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

## Kanban Command

Launch a local web UI to visualize the BMAD v6 `project-management/` directory as a Scrum / Kanban board. The server binds to `127.0.0.1` only and never reaches out to the internet.

### Usage

```bash
npx @the-bearded-bear/claude-craft kanban [path] [options]
```

`path` defaults to the current working directory. The target must contain a `project-management/` subdirectory (generated by `/workflow:plan` or `/sprint:start`).

### Options

| Option | Description |
|--------|-------------|
| `--port=<n>` | HTTP port (default: 3737) |
| `--open` | Open the default browser automatically |
| `--readonly` | Disable all mutations (server blocks every PATCH with 403) |
| `--no-watch` | Disable the file watcher (no live reload on external edits) |

### Views

- **Kanban** — 6 columns (backlog, ready-for-dev, in-progress, review, done, blocked). Drag a card to transition a story. Gates (INVEST 6/6, DoD, task completion) are enforced server-side.
- **Backlog** — Epic tree (read-only) with per-epic progress.
- **Burndown** — ideal vs actual curve for the active sprint, on-track / at-risk / behind indicator.
- **Dependencies** — directed graph of inter-story dependencies, cycles highlighted in red.
- **Docs** — markdown viewer for `prd.md`, `tech-spec.md`, `personas.md`, `architecture/*.md`. Inline `[US-XXX]` links jump to the corresponding card.

### Examples

```bash
# Launch on the current project, open browser
npx @the-bearded-bear/claude-craft kanban --open

# Read-only mode for a demo or code review
npx @the-bearded-bear/claude-craft kanban --readonly --port=4040

# Against another project
npx @the-bearded-bear/claude-craft kanban ~/work/my-project
```

### Security

- Bound to `127.0.0.1` exclusively. No `0.0.0.0`, no LAN exposure.
- CSRF-like same-origin check (Origin/Referer) on every PATCH — cross-origin mutations are rejected with 403.
- Path traversal blocked on the docs endpoint.
- File writes are atomic (exclusive lock + backup + rollback) with an ETag-like mtime check to avoid overwriting external edits.
- Strict CSP (`script-src 'self'`, `connect-src 'self'`) on the served HTML.
- No `eval`, no shell execution, no outbound network.

### State machine

Allowed transitions (all others rejected with 409):

```
backlog       -> ready-for-dev (requires invest_score == 6) | blocked
ready-for-dev -> in-progress | backlog | blocked
in-progress   -> review (all tasks completed) | blocked
review        -> done (all tasks + tdd_phase in green|refactor|done) | in-progress | blocked
blocked       -> previous_status (unblock only)
done          -> (terminal)
```

---

## Claude Code Slash Commands

The following slash commands are available in Claude Code (v2.1.105+).

### /btw

Quick questions without context switching, using minimal context and low effort.

#### Usage

```bash
/btw <question>
```

#### Description

Ask a quick question without polluting the main conversation context. Uses minimal context window and low effort mode for fast responses. Ideal for simple lookups, factual questions, or quick clarifications that don't require full conversation history.

#### Examples

```bash
/btw What's the difference between bcrypt and argon2?
/btw How do I check my Node.js version?
/btw What does the --force flag do?
```

---

### /hooks

Interactive hook management interface.

#### Usage

```bash
/hooks
```

#### Description

Launch an interactive TUI for managing Claude Code hooks. Allows you to:
- View all installed hooks
- Enable/disable hooks
- Test hook execution
- Debug hook issues
- View hook output and errors

#### Examples

```bash
# Open hook management interface
/hooks
```

---

### /reload-plugins

Manually reload all Claude Code plugins.

#### Usage

```bash
/reload-plugins
```

#### Description

Force a reload of all installed plugins without restarting Claude Code. Useful after:
- Installing new plugins
- Updating plugin configurations
- Debugging plugin issues
- Making changes to plugin files

#### Examples

```bash
# Reload all plugins
/reload-plugins
```

---

### /proactive

Alias for `/loop` - run a command on a recurring interval.

#### Usage

```bash
/proactive [interval] [command]
```

#### Description

Execute a command or prompt repeatedly on a specified interval. This is an alias for the `/loop` command. If no interval is provided, the model will self-pace the iterations.

#### Examples

```bash
# Check deployment status every 5 minutes
/proactive 5m /status

# Run tests continuously with auto-pacing
/proactive npm test

# Monitor PR reviews every 10 minutes
/proactive 10m Check if there are new PR reviews
```

---

### /ultrareview

Parallel multi-agent code review of the current branch or a GitHub PR (available in Claude Code v2.1.111+).

#### Usage

```bash
/ultrareview          # Review current branch
/ultrareview <PR#>    # Review a GitHub PR
```

#### Description

Spawns multiple reviewer agents (security, architecture, performance, style) in parallel and aggregates findings. Cloud-based, billed separately. Requires a git repository (offer `git init` if not in one).

---

### /tui

Switch the session to the terminal UI mode (available in v2.1.110+).

#### Usage

```bash
/tui
```

Toggle via the `tui` setting in `settings.json`.

---

### /recap

Summarize the current session progress (v2.1.108+). Useful before `/clear` to capture state.

#### Usage

```bash
/recap
```

---

### /undo

Alias for `/rewind` (v2.1.108+). Reverts the last change in the session.

#### Usage

```bash
/undo
```

---

### /effort

Interactive effort level slider (v2.1.111+). Pick the thinking depth: `low`, `medium`, `high`, `xhigh` (Opus 4.7 only), `max`.

#### Usage

```bash
/effort               # Interactive picker
/effort high          # Set directly
```

Default for Pro/Max subscribers on Opus 4.6/Sonnet 4.6 is `high` since v2.1.111 (previously `medium`). Opus 4.8 supports the `xhigh` tier.

---

## Claude Code Native Features (v2.1.108+)

### Native CLI Binary (v2.1.113+)

Starting in v2.1.113, Claude Code spawns a native compiled binary instead of the bundled JavaScript. Faster startup, lower RAM footprint. No user action required — automatic when you update.

### Forked Subagents (v2.1.117+)

Set `CLAUDE_CODE_FORK_SUBAGENT=1` to run each subagent in an isolated, forked context. Prevents context pollution between parallel investigations.

```bash
export CLAUDE_CODE_FORK_SUBAGENT=1
```

### Prompt Caching Env Vars (v2.1.108+)

Fine-tune prompt caching behavior:

| Variable | Effect |
|----------|--------|
| `ENABLE_PROMPT_CACHING_1H` | Use the 1-hour cache tier (vs 5-minute default) |
| `FORCE_PROMPT_CACHING_5M` | Force the 5-minute tier even if 1h is available |

Use `ENABLE_PROMPT_CACHING_1H=1` for long-running sessions with a stable context (e.g., architecture reviews that span hours).

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
| `CLAUDE_CODE_FORK_SUBAGENT` | Fork each subagent in isolated context (v2.1.117+) | _unset_ |
| `ENABLE_PROMPT_CACHING_1H` | Use 1-hour prompt cache tier (v2.1.108+) | _unset_ |
| `FORCE_PROMPT_CACHING_5M` | Force 5-minute cache tier (v2.1.108+) | _unset_ |
| `CLAUDE_CODE_SUBAGENT_MODEL` | Model for subagents (e.g. `claude-sonnet-4-6`) | _unset_ |

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
