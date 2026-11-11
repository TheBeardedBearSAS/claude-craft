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
| `--hooks=<mode>` | | Hooks installed into `.claude/hooks/` and merged into `.claude/settings.json`: `default` (network guard, dangerous commands, pre-commit secrets check, sensitive files, output hints, context re-injection after compaction), `full` (adds the Stop test gate, post-edit lint and Slack notification) or `none`; append `,memory` (e.g. `--hooks=default,memory`, `--hooks=full,memory`) to also install the SQLite cross-session memory add-on into `.claude/hooks/memory-lifecycle/` (needs `sqlite3` and `jq`; the installer warns if they are missing). One profile is required, `memory` alone is rejected. Hook examples are copied to `.claude/templates/hooks/` (not with `none`). Default: `default`. Existing hooks are never removed or overwritten |
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

Launch a local web UI to view and manage the BMAD v6 backlog and sprints as a Scrum / Kanban board. The server binds to `127.0.0.1` only and never reaches out to the internet.

### Usage

```bash
npx @the-bearded-bear/claude-craft kanban [path] [options]
```

`path` defaults to the current working directory. The target must contain a `project-management/` subdirectory (generated by `/workflow:plan` or `/workflow:start`).

### Options

| Option | Description |
|--------|-------------|
| `--port=<n>` | HTTP port, 1024-65535 (default: 3737). The `=` form is required: `--port 4000` (with a space) is rejected with a usage message |
| `--open` | Open the default browser automatically |
| `--readonly` | Disable all writes: the server answers 403 `readonly` to every PATCH, PUT, POST and DELETE, and the board offers no move control |
| `--no-watch` | Disable the file watcher (no live reload on external edits) |
| `--user=<name>` | Author recorded in the `history` of changes made from the board (`kanban:<name>`). Default: `CLAUDE_CRAFT_USER`, then `git config user.name`, then the OS user, then `kanban` |

### Views

Six views, listed in the navigation bar.

- **Board** — 6 columns (backlog, ready-for-dev, in-progress, review, done, blocked). Move a card by drag and drop or with the "Move" menu of the card, which lists only the allowed target columns (the keyboard and single-pointer alternative to dragging). Gates (INVEST or story points, task completion, TDD phase) are enforced server-side. A column header shows its count, or `count/limit` when a WIP limit is set.
- **Backlog** — Epic tree with per-epic progress. Select one or several stories and add them to a sprint, or move them back to the backlog; a capacity bar compares the committed points with the capacity of the target sprint.
- **Sprints** — every sprint (planned, active, closed) with its goal, dates, points, stories and expandable tasks, plus its review and retro notes. Create, start and close sprints here.
- **Burndown** — ideal vs actual curve for the active sprint, on-track / at-risk / behind indicator. The velocity chart (committed vs delivered points of the closed sprints, average of the last three, forecast of the sprints left) comes with an equivalent table.
- **Dependencies** — directed graph of inter-story dependencies with cycles highlighted, and an equivalent table (story, depends on, blocks, status, cycle).
- **Docs** — markdown viewer for `prd.md`, `tech-spec.md`, `personas.md`, `architecture/*.md` and the epic, story and sprint documents. `US-XXX` identifiers in the text link to the story.

### What you can do from the board

- **Move a story** between columns. Allowed transitions are listed in [State machine](#state-machine); blocking a story asks for a reason.
- **Create, edit and delete a story** ("New story" on the Board and Backlog views; the form is in the story detail). Editable fields: title, epic, story points, priority, assignee, sprint, TDD phase and dependencies; persona at creation. Deleting asks for confirmation and moves the file to `project-management/backlog/user-stories/.trash/` (it can be restored by moving it back). A story in progress or in review needs an explicit confirmation, and a story that other stories depend on cannot be deleted (409 `has_dependents`).
- **Add, rename, delete tasks and set their status** (`to-do`, `in-progress`, `done`, `blocked`) from the story detail (a task is renamed in place: Enter saves, Escape cancels; deleting asks once); the completed-task count is recomputed. A story goes to review only once it has tasks, all done. For a story that only had a task counter, the first change records a status per task (the first tasks, as many as the counter said, count as done).
- **Plan a sprint**: select stories in the Backlog view and add them to a planned or active sprint.
- **Create, start and close a sprint.** Creating a sprint (name, start and end dates, goal, capacity) writes `sprints/sprint-<N>-<slug>/sprint-goal.md`; the sprint is "planned". Starting it makes it the active sprint (refused while another sprint is active). Closing it archives the `done` stories under `archived_sprints` and lets you choose where the unfinished stories go: back to the backlog or into a planned sprint.
- **Set WIP limits** per column in the Settings panel. They are indicative: exceeding one shows a warning and never blocks a move. A column counts the stories of the active sprint, as the board shows them.
- **Unsaved input is protected**: closing a form (Escape, Cancel, the backdrop) or changing the URL (browser Back, a story link) while a story or sprint form holds changes asks before discarding them.
- **Search, filter and sort**: the search box (`Ctrl+K` or `/`) filters the Board and Backlog; priority, assignee and epic filters and the sort order are kept in the URL, for example `#/kanban?q=auth&prio=must,should&who=alice&epic=E4&sort=priority&dir=desc`. `?story=US-E4-03` opens a story from any view, and `#/docs/<path>` opens a document.
- **Interface language**: English, French, Spanish, German or Portuguese, chosen automatically from the browser or in the Settings panel. Story titles and documents are shown as written.

The `/workflow:*` and `/project:*` commands remain valid and write the same files.

### Where data is written

| What | File |
|------|------|
| Status, sprint membership, tasks, points, assignee, priority, history | `.bmad/sprint-status.yaml` |
| Story content (description, acceptance criteria, persona) | `project-management/backlog/user-stories/US-*.md` |
| Sprint goal of a new sprint | `project-management/sprints/sprint-<N>-<slug>/sprint-goal.md` |
| WIP limits | `.bmad/kanban.yaml` |
| Deleted stories | `project-management/backlog/user-stories/.trash/` |

The markdown files never receive a status line. The optional keys `stories.<id>.sprint_id` and `metadata.closed_date` are described in `Project/i18n/en/templates/sprint-status.md`. A story that exists only as a markdown file (no entry in the YAML) is still moved by rewriting its frontmatter.

### Concurrency

- Writes to `.bmad/sprint-status.yaml` take the same lock as the `.bmad/lib/` scripts (`status-lock.sh`). While a script holds it, the board answers 423 `locked`; a lock left by a crashed process is taken over after 10 seconds.
- Conflicts are detected per story: each story carries a revision, sent back as `If-Match`. A story changed elsewhere in the meantime is refused with 409 `conflict` and the interface offers to reload it.
- The file is rewritten with comments, key order and formatting preserved, after revalidation. A file that does not validate is never overwritten (409 `sprint_status_invalid`).

### Security

- Bound to `127.0.0.1` exclusively. No `0.0.0.0`, no LAN exposure.
- The `Host` header must be the loopback address and the served port (DNS rebinding protection); the `Origin` is checked on every write, and cross-origin writes are rejected with 403.
- Request bodies are limited to 64 KB (512 KB for a story body).
- `--readonly` blocks every write.
- Path traversal blocked on the docs endpoint; error responses carry no filesystem path.
- File writes are atomic (lock, temporary file, rename).
- Strict CSP (`script-src 'self'`, `connect-src 'self'`) on the served HTML.
- No `eval`, no shell execution, no outbound network.

### State machine

Allowed transitions (all others rejected with 409 `invalid_transition`, with the list of allowed targets):

```
backlog       -> ready-for-dev (invest_score >= 6 when set, else story_points > 0) | blocked
ready-for-dev -> in-progress | backlog | blocked
in-progress   -> review (all tasks completed) | blocked
review        -> done (all tasks + tdd_phase in green|refactor|done) | in-progress | blocked
blocked       -> previous_status (unblock only)
done          -> (terminal)
```

### BMAD v6 sprint-status source

Stories come from `.bmad/sprint-status.yaml` (written by `/workflow:*` and `/project:backlog`) and from the `project-management/` markdown files. When a story is tracked in the YAML, the YAML wins for status, title, points, priority, assignee, epic, tasks and sprint; the markdown keeps the content. The board is live: the watcher reloads it when either source changes. Stories of a closed sprint (`archived_sprints`) are read-only.

If the board is empty or a story is missing, the diagnostics banner lists the files that could not be read; the same list is returned by `GET /api/diagnostics`. See [Troubleshooting](TROUBLESHOOTING.md#kanban-board-empty).

### HTTP routes

Reads (`GET`): `/api/health` (`ok`, `readonly`, `user`, `wip_limits`), `/api/diagnostics`, `/api/stories`, `/api/stories/:id`, `/api/dependencies`, `/api/docs`, `/api/docs/<path>`, `/api/sprints`, `/api/sprints/:id`, `/api/sprints/current`, `/api/velocity`, `/api/events` (server-sent events).

Writes:

| Route | Purpose | Specific errors |
|-------|---------|-----------------|
| `PATCH /api/stories/:id/status` | Move a story (`status`, `blocked_reason?`, `reason?`) | 409 `invalid_transition`, `archived`, `read_only_source`, `conflict` |
| `PATCH /api/stories/:id` | Edit title, points, assignee, priority, TDD phase, epic, sprint (`null` = backlog), dependencies | 400 `invalid_payload`; 409 `archived`, `sprint_not_found`, `conflict` |
| `PUT /api/stories/:id/body` | Replace the markdown body (`markdown`, `expected_mtime`) | 409 `no_backing_file`, `conflict`; 422 `status_line_forbidden` |
| `POST /api/stories` | Create a story (`title`, `epic_id?`, `story_points?`, `priority?`, `persona?`, `sprint_id?`) | 409 `sprint_status_missing`, `sprint_status_invalid`, `sprint_not_found` |
| `DELETE /api/stories/:id[?force=1]` | Move a story to `.trash/` | 409 `story_active`, `has_dependents`, `archived` |
| `PATCH /api/stories/:id/tasks/:taskId` | Set a task status and/or rename it (`status?`, `title?`, at least one; 1..200 characters) | 400 `invalid_payload`; 404 `task_not_found`; 409 `task_exists` (name of another task), `conflict` |
| `DELETE /api/stories/:id/tasks/:taskId` | Remove a task (`total` and `completed` are recounted) | 404 `task_not_found`; 409 `conflict` |
| `POST /api/stories/:id/tasks` | Add a to-do task (`title`) | 409 `task_exists` |
| `POST /api/sprints` | Create a planned sprint | 409 `sprint_exists` |
| `POST /api/sprints/:id/start` | Start a sprint | 409 `sprint_already_active`, `sprint_closed`, `conflict` |
| `POST /api/sprints/:id/close` | Close a sprint (`carry_over`: `backlog` or a sprint id) | 409 `not_active`, `sprint_not_found`, `conflict` |
| `PUT /api/settings/wip` | Set WIP limits (status → 1..99 or `null`) | 400 `invalid_payload` |

`:taskId` is the current name of the task, URL-encoded (`encodeURIComponent`): names with `/`, `%`, `#`, spaces or non-ASCII characters are supported.

`POST /api/stories`, `POST /api/stories/:id/tasks` and `POST /api/sprints` accept an `Idempotency-Key` header (an opaque string of 8 to 128 visible ASCII characters; the board sends a fresh `crypto.randomUUID()` for each opening of a form). A second request on the same route with the same key within 5 minutes gets the answer of the first (same status and body, plus `Idempotent-Replayed: true`) and creates nothing; refused requests (status 400 and above) are not remembered, so a retry is evaluated again. The memory is the server process's, bounded to 500 keys. A malformed key is a 400 `invalid_idempotency_key`.

Errors common to all writes: 400 `invalid_json` / `invalid_payload`, 403 `forbidden` / `readonly`, 404 `not_found`, 413 `payload_too_large`, 423 `locked`, 500 `write_failed`. Changes are pushed to open browsers over `/api/events`.

### Keyboard shortcuts (Board)

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate cards |
| `←` `→` | Change column |
| `Alt+M` | Open the move menu of the focused card |
| `1`-`6` | Move the card to that column (move menu open) |
| `Enter` | Open the story details |
| `Esc` | Close the menu or dialog |
| `Ctrl+K` (`⌘+K`) or `/` | Search stories |

The shortcuts are optional: every action is reachable with `Tab` and the native buttons.

### Examples

```bash
# Launch on the current project, open browser
npx @the-bearded-bear/claude-craft kanban --open

# Read-only mode for a demo or code review
npx @the-bearded-bear/claude-craft kanban --readonly --port=4040

# Against another project
npx @the-bearded-bear/claude-craft kanban ~/work/my-project
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

### /reload-skills

Re-scan all Claude Code skills without restarting the session (v2.1.157+).

#### Usage

```bash
/reload-skills
```

#### Description

Force a re-scan of all installed skills (`.claude/skills/`) without restarting Claude Code. Distinct from `/reload-plugins` which reloads code intelligence plugins. Useful after:
- Adding a new skill to `.claude/skills/`
- Modifying an existing skill file
- Installing Claude Craft updates that include new skills

> **SessionStart hook:** A `SessionStart` hook can return `reloadSkills: true` to make newly-installed skills available in the same session without user intervention.

#### Examples

```bash
# Reload all skills
/reload-skills
```

---

### /loop

Run a prompt or slash command repeatedly until you stop it — the time-based member of Claude Code's four loop types.

#### The four loop types (Anthropic taxonomy)

| Type | Trigger | Stops when | Best for |
|------|---------|-----------|----------|
| **Turn-based** | your prompt | Claude finishes or needs input | short, one-off tasks |
| **Goal-based** (`/goal`) | your prompt | goal condition holds **or** max turns | tasks with a verifiable exit criterion |
| **Time-based** (`/loop`, `/schedule`) | an interval | you cancel / work is done | recurring work, monitoring external systems |
| **Proactive** | event or schedule, no human in the loop | routine disabled | well-defined recurring streams (triage, migrations) |

#### Usage

```bash
/loop [interval] [prompt-or-command]
```

- **Interval mode:** `/loop 5m …` re-runs every 5 minutes (`s`/`m`/`h` suffixes). Runs **locally** — the session must stay open.
- **Self-paced (dynamic) mode:** omit the interval and Claude schedules its own next wake-up (`ScheduleWakeup`), picking a delay matched to what it is waiting on. Ideal when the right cadence is not fixed.
- **Customisation:** a `loop.md` file lets you tune loop behaviour per project.
- Combine with **`/goal`** to give the loop a hard completion condition, and monitor cost/turns with **`/usage`**, **`/goal`**, **`/workflows`**.

#### Examples

```bash
# Fixed cadence: address review comments and fix CI every 5 min
/loop 5m check my PR, address review comments, and fix failing CI

# Self-paced: watch a deploy, waking when it makes sense
/loop watch the staging deploy and report when it is healthy or failed
```

---

### /schedule

Move a recurring job to the **cloud** as a *Routine* — it keeps running on a cron/event trigger **after you close the session** (unlike `/loop`, which is local). Use it for unattended nightly work: `@qa:recette` regression runs, `/common:ralph-run`-style completion loops, dependency-upgrade sweeps, PR triage. Pair with `/goal` (exit criteria), skills, and dynamic workflows for fully autonomous operation. Route judgement-heavy steps to capable models and mechanical steps to smaller/faster ones to control token cost.

```bash
/schedule            # create / list / manage cloud routines
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

### /goal (v2.1.139+)

Set a persistent session goal that Claude tracks until completion. A Stop hook activates and prevents Claude from stopping until the condition is met.

#### Usage

```bash
/goal <description>
/goal clear
```

#### Description

Defines an objective Claude must complete before the session ends. Useful for long-running tasks (audits, migrations, multi-file refactors) where you want Claude to self-direct until done. The goal is shown in the status line. Use `/goal clear` to remove it early.

#### Examples

```bash
/goal Write unit tests for all files in src/services/
/goal Migrate all Axios calls to the fetch API across the codebase
/goal clear
```

---

### /usage (v2.1.143+)

Display token usage statistics for the current session — input tokens, output tokens, cache reads, and estimated cost.

#### Usage

```bash
/usage
```

#### Description

Shows a breakdown of token consumption since session start: input tokens, cache read tokens, output tokens, and an estimated cost in USD. Since v2.1.149 the breakdown also attributes consumption **per component** — skill, subagent, plugin, and MCP server — so you can spot the costliest driver before deciding to delegate or `/clear`. Use before `/clear` to decide whether compaction is worth it.

---

### /workflows (v2.1.154+)

Show the live progress tree for the current Dynamic Workflow run (ultracode mode).

#### Usage

```bash
/workflows
```

#### Description

Displays a real-time view of all agents spawned by an active workflow, their phase assignments, completion status, and timing. Only meaningful when a Workflow tool call is in progress.

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

Interactive effort level slider (v2.1.111+). Pick the thinking depth: `low`, `medium`, `high`, `xhigh` (Opus 5.5, adaptive thinking), `ultracode` (v2.1.154+, Dynamic Workflows ; separate toggle since v2.1.284).

#### Usage

```bash
/effort               # Interactive picker
/effort high          # Set directly
/effort ultracode     # Dynamic Workflows — max code throughput (trigger keyword: ultracode)
```

Default effort: `medium` on Opus 5.5 and Haiku 5.5, `high` on Sonnet 5.5, Fable 5.2 and legacy models. Since v2.1.284 Ultracode is a separate toggle in `/effort` and no longer forces `xhigh`.

| Niveau | Modèle | Usage |
|--------|--------|-------|
| `low` | Haiku 5.5 (`claude-haiku-5-5`) | Tâches simples, lookups, classification |
| `medium` | Sonnet 5.5 (`claude-sonnet-5-5`) | Implémentation standard |
| `high` | Opus 5.5 (`claude-opus-5-5`) | Raisonnement complexe, architecture |
| `xhigh` | Opus 5.5 (adaptive thinking) | Décisions critiques, migrations complexes, ADR |
| `ultracode` | Opus 5.5 (toggle séparé depuis v2.1.284, Dynamic Workflows) | Mode débit code maximal — pipelines automatisés, génération massive |

> **Note Fable 5.2 / Mythos :** **Fable 5.2** (`claude-fable-5-2`, $8/$40) est le modèle Fable courant, adapté aux agents créatifs/narratifs ; Fable 5.1 et Fable 5 restent disponibles (*legacy*). Réflexion toujours active sur Fable 5.2 : pour la réduire, baisser l'effort. **Mythos 5 / 5.1 / 5.2** sont en disponibilité limitée (Cyber Verification Program) — ne pas les configurer par défaut.

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
| `CLAUDE_CODE_FORK_SUBAGENT` | Fork each subagent in isolated context (v2.1.117+); on by default in `-p`, the SDK, desktop and VS Code since 2.1.302, `0` to turn it off | _unset_ (on in `-p`/SDK since 2.1.302) |
| `ENABLE_PROMPT_CACHING_1H` | Use 1-hour prompt cache tier (v2.1.108+) | _unset_ |
| `FORCE_PROMPT_CACHING_5M` | Force 5-minute cache tier (v2.1.108+) | _unset_ |
| `CLAUDE_CODE_SUBAGENT_MODEL` | Model for subagents (e.g. `claude-sonnet-5-5`) | _unset_ |

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
