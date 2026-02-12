# Claude-Craft - Multi-Technology Framework

**Version:** 7.8.0 | **Languages:** en, fr, es, de, pt

A comprehensive AI-assisted development framework for Claude Code with 10 technology stacks, 33 agents, 160 commands across 20 namespaces, and BMAD v6 project management.

---

## Supported Technologies (2026)

| Stack | Version | Architecture | Key Patterns |
|-------|---------|--------------|--------------|
| **.NET / C#** | 10 LTS / C# 14 | Clean Architecture | CQRS, MediatR, EF Core |
| **Symfony / PHP** | 8.0 / PHP 8.5 | Clean Architecture | DDD, Hexagonal, API Platform |
| **Flutter / Dart** | 3.38 / Dart 3.10 | Clean Architecture | BLoC, Riverpod, Material 3 |
| **React** | 19.x | Feature-based | Hooks, Zustand, React Query |
| **React Native** | 0.76+ | Feature-based | Navigation 7, Reanimated 3 |
| **Angular** | 19.x | Domain-driven | Signals, Standalone, RxJS |
| **Vue.js** | 3.5+ | Composition API | Pinia, Vitest, TypeScript |
| **Laravel** | 12.x / PHP 8.5 | Clean Architecture | Actions, Pest PHP, Sanctum |
| **Python** | 3.13+ | Clean Architecture | FastAPI, async/await, Pydantic |
| **PHP** | 8.5 | Clean Architecture | PSR-12, PHPStan, Pest PHP |

---

## Quick Reference

See `@.claude/INDEX.md` for condensed checklists and patterns.

### Technology Quick Links

| Technology | Reference | Commands |
|------------|-----------|----------|
| C# / .NET | `@.claude/references/csharp/` | `/csharp:*` |
| Symfony / PHP | `@.claude/references/symfony/CLAUDE.md` | `/symfony:*` |
| Flutter / Dart | `@.claude/references/flutter/CLAUDE.md` | `/flutter:*` |
| React | `@.claude/references/react/` | `/react:*` |
| React Native | `@.claude/references/react-native/` | `/reactnative:*` |
| Angular | `@.claude/references/angular/` | `/angular:*` |
| Vue.js | `@.claude/references/vuejs/` | `/vuejs:*` |
| Laravel | `@.claude/references/laravel/` | `/laravel:*` |
| Python | `@.claude/references/python/` | `/python:*` |
| PHP | `@.claude/references/php/` | `/php:*` |

---

## Available Commands

### Common (`/common:`)
| Command | Description |
|---------|-------------|
| `/common:pre-commit-check` | Validate before commit |
| `/common:ralph-run` | Run Claude in continuous loop |
| `/common:setup-project-context` | Configure project context |
| `/common:add-technology` | Add new tech stack |
| `/common:architecture-decision` | Document architecture decisions |
| `/common:daily-standup` | Daily standup summary |
| `/common:generate-changelog` | Generate changelog |
| `/common:pre-merge-check` | Pre-merge validation |
| `/common:release-checklist` | Release preparation |
| `/common:research-context7` | Research with Context7 |
| `/common:setup-ci` | Setup CI pipeline |
| `/common:sub-agents-patterns` | Agent patterns guide |

### Workflow (`/workflow:`)
| Command | Description |
|---------|-------------|
| `/workflow:init` | Initialize workflow (auto-detect track) |
| `/workflow:analyze` | Research and exploration |
| `/workflow:plan` | Generate PRD, backlog |
| `/workflow:design` | Tech spec, architecture |
| `/workflow:implement` | Sprint development |
| `/workflow:status` | Show progress |
| `/workflow:retro` | Sprint retrospective |
| `/workflow:review` | Sprint review |
| `/workflow:start` | Start sprint |

### Team (`/team:`)
| Command | Description |
|---------|-------------|
| `/team:audit` | Parallel multi-tech audit (Agent Teams) |
| `/team:sprint` | Parallel sprint implementation (Agent Teams) |
| `/team:security` | Parallel security review (Agent Teams) |
| `/team:delivery` | Full sprint lifecycle — writing + implementation (Agent Teams) |

### QA (`/qa:`)
| Command | Description |
|---------|-------------|
| `/qa:recette` | Automated acceptance tests via Chrome |
| `/qa:fix` | Fix bugs from a recette session |
| `/qa:status` | Show recette session status |
| `/qa:regression` | View regression tests |
| `/qa:report` | Generate recette report |
| `/qa:tdd` | Fix bugs with TDD approach |

### UIUX (`/uiux:`)
| Command | Description |
|---------|-------------|
| `/uiux:audit` | UI/UX audit |
| `/uiux:a11y-audit` | WCAG accessibility audit |
| `/uiux:a11y-component` | Accessible component generator |
| `/uiux:component-spec` | UI component specification |
| `/uiux:orchestrator` | UI/UX orchestration |
| `/uiux:user-flow` | User flow design |
| `/uiux:design-tokens` | Design tokens generator |

### BMAD v6 (`/sprint:`, `/gate:`, `/project:`)
| Command | Description |
|---------|-------------|
| `/sprint:next-story` | Get next ready story |
| `/sprint:transition` | Transition story status |
| `/sprint:status` | Sprint metrics |
| `/sprint:auto-route` | Auto-route stories |
| `/sprint:dev` | Sprint TDD development |
| `/gate:validate-prd` | PRD quality gate (≥80%) |
| `/gate:validate-story` | Story DoD validation |
| `/gate:validate-backlog` | Backlog validation |
| `/gate:validate-techspec` | Tech spec validation |
| `/gate:validate-sprint` | Sprint validation |
| `/gate:report` | Gate quality report |
| `/project:run-sprint` | Execute full sprint |
| `/project:run-epic` | Execute full epic |
| `/project:run-queue` | Execute queue |
| `/project:batch-status` | Batch status report |

### C# / .NET (`/csharp:`)
| Command | Description |
|---------|-------------|
| `/csharp:check-compliance` | Full compliance audit |
| `/csharp:check-architecture` | Architecture validation |
| `/csharp:check-code-quality` | Code quality analysis |
| `/csharp:check-testing` | Test coverage analysis |
| `/csharp:check-security` | Security audit (OWASP) |
| `/csharp:generate-feature` | Generate CQRS feature |

### Symfony (`/symfony:`)
| Command | Description |
|---------|-------------|
| `/symfony:check-architecture` | Validate Clean Architecture |
| `/symfony:check-compliance` | DDD compliance check |
| `/symfony:generate-crud` | Generate CRUD operations |
| `/symfony:check-security` | Security audit |

### Flutter (`/flutter:`)
| Command | Description |
|---------|-------------|
| `/flutter:check-architecture` | Validate architecture |
| `/flutter:generate-feature` | Generate feature module |
| `/flutter:analyze-performance` | Performance analysis |

### React (`/react:`)
| Command | Description |
|---------|-------------|
| `/react:generate-component` | Generate component |
| `/react:check-architecture` | Validate architecture |
| `/react:accessibility-check` | A11y validation |

### Docker (`/docker:`)
| Command | Description |
|---------|-------------|
| `/docker:compose-setup` | Generate docker-compose |
| `/docker:architecture` | Design Docker architecture |
| `/docker:debug` | Diagnose Docker issues |
| `/docker:cicd-pipeline` | Generate CI/CD pipeline |
| `/docker:optimize` | Optimize Docker setup |

### Coolify (`/coolify:`)
| Command | Description |
|---------|-------------|
| `/coolify:setup` | Initialize project for Coolify |
| `/coolify:deploy` | Deploy application |
| `/coolify:debug` | Diagnose issues |
| `/coolify:backup` | Configure backups |
| `/coolify:optimize` | Optimize deployment |

---

## Available Agents

### Common Agents (12)
| Agent | Expertise |
|-------|-----------|
| `@api-designer` | REST/GraphQL API design |
| `@database-architect` | Database optimization |
| `@devops-engineer` | CI/CD, Docker, deployment |
| `@performance-auditor` | Performance analysis |
| `@refactoring-specialist` | Safe code refactoring |
| `@tdd-coach` | Test-Driven Development |
| `@uiux-orchestrator` | UI/UX coordination |
| `@ui-designer` | Design systems, tokens |
| `@ux-ergonome` | User flows, cognitive ergonomics |
| `@accessibility-expert` | WCAG 2.2 AAA compliance |
| `@research-assistant` | Technical research |
| `@ralph-conductor` | Continuous loop orchestration |

### Technology Reviewers (10)
| Agent | Technology |
|-------|------------|
| `@symfony-reviewer` | Symfony/PHP |
| `@flutter-reviewer` | Flutter/Dart |
| `@react-reviewer` | React |
| `@python-reviewer` | Python |
| `@angular-reviewer` | Angular |
| `@laravel-reviewer` | Laravel |
| `@vuejs-reviewer` | Vue.js |
| `@reactnative-reviewer` | React Native |
| `@csharp-reviewer` | C#/.NET |
| `@php-reviewer` | PHP |

### Docker Agents (5)
| Agent | Expertise |
|-------|-----------|
| `@docker-dockerfile` | Dockerfile optimization |
| `@docker-compose` | Compose orchestration |
| `@docker-debug` | Container troubleshooting |
| `@docker-cicd` | CI/CD pipelines |
| `@docker-architect` | Docker architecture |

### Coolify Agents (4)
| Agent | Expertise |
|-------|-----------|
| `@coolify-architect` | Infrastructure design |
| `@coolify-deployment` | Deploy and manage apps |
| `@coolify-debug` | Troubleshoot deployments |
| `@coolify-monitoring` | Monitoring and backups |

### Project Agents (2)
| Agent | Role |
|-------|------|
| `@product-owner` | Product management (CSPO) |
| `@tech-lead` | Technical leadership |

---

## BMAD v6 Framework

### Development Tracks

| Track | Setup | Phases | Best For |
|-------|-------|--------|----------|
| **Quick Flow** | < 5 min | Implement only | Bug fixes, hotfixes |
| **Standard** | < 15 min | Plan → Design → Implement | New features |
| **Enterprise** | < 30 min | Analyze → Plan → Design → Implement | Platforms |

### Quality Gates

| Gate | Threshold | When |
|------|-----------|------|
| PRD Gate | ≥80% | Vision → PRD |
| Tech Spec Gate | ≥90% | PRD → Tech Spec |
| Backlog Gate | INVEST 6/6 | Tech Spec → Backlog |
| Sprint Ready | 100% | Backlog → Sprint |
| Story DoD | 100% | Dev → Done |

### Status-based Routing

```
backlog → ready-for-dev → in-progress → review → done
   ↓          ↓              ↓           ↓
   └──────────┴──────────────┴───────────┴→ blocked
```

TDD Phases: 🔴 Red → 🟢 Green → 🔵 Refactor

---

## Ralph Wiggum

Continuous AI loop that runs Claude until task completion.

```bash
/common:ralph-run "Implement user authentication"
```

**DoD Validators:**
| Type | Description |
|------|-------------|
| `command` | Run tests, lint, build |
| `output_contains` | Check for patterns |
| `file_changed` | Verify modifications |
| `hook` | Integrate with quality-gate.sh |
| `human` | Manual approval |

---

## QA Recette - Automated Acceptance Testing

Automated acceptance testing via Claude in Chrome with the **Golden Rule**: A fixed bug should NEVER reappear.

```bash
# Test a specific story
/qa:recette --scope=story --id=US-001

# Test a full sprint
/qa:recette --scope=sprint --id=Sprint-3

# Dry run to see test plan
/qa:recette --scope=story --id=US-001 --dry-run

# Resume interrupted session
/qa:recette --resume=REC-20260130-143022
```

**Key Features:**
| Feature | Description |
|---------|-------------|
| **Comprehensive Plans** | Generates tests from acceptance criteria |
| **Browser Automation** | Uses Claude in Chrome for real testing |
| **Session Recovery** | Checkpoint-based resume |
| **Golden Rule** | Auto-generates regression tests for errors |
| **Regression Detection** | Compares runs to detect regressions |

**Prerequisites:**
- Chrome extension v1.0.36+
- Claude Code with `--chrome` or `/chrome`

**Output Structure:**
```
.recette/
├── plans/              # Test plans (YAML)
├── sessions/           # Session states
├── regression/         # Regression suite
│   ├── registry.yaml
│   └── tests/
├── metrics/            # Historical data
└── reports/            # Generated reports
```

See command help: `/qa:recette --help`

> **Note:** BMAD roles (bmad-master, pm, ba, architect, po, sm, dev, qa, qa-recette, ux) are integrated into workflow and sprint commands, not standalone agent files.

---

## Docker Requirement

**Always use Docker for commands to abstract from local environment.**

```bash
# Run commands in Docker
docker compose exec app php bin/console ...
docker compose exec app ./vendor/bin/phpunit
```

---

## Skills

Skills provide best practices loaded on-demand:

| Skill | Topic |
|-------|-------|
| `/solid-principles` | SOLID patterns |
| `/kiss-dry-yagni` | Code simplicity |
| `/testing` | TDD/BDD practices |
| `/security` | Security guidelines |
| `/git-workflow` | Git best practices |
| `/documentation` | Documentation standards |
| `/workflow-analysis` | Analysis methodology |

---

## Documentation

| Document | Description |
|----------|-------------|
| [Quickstart](../docs/QUICKSTART.md) | 5-minute getting started |
| [Prerequisites](../docs/PREREQUISITES.md) | Required dependencies |
| [CLI Reference](../docs/CLI-REFERENCE.md) | Full CLI documentation |
| [Commands](../docs/COMMANDS.md) | All commands |
| [Agents](../docs/AGENTS.md) | All agents |
| [FAQ](../docs/FAQ.md) | Common questions |
| [Troubleshooting](../docs/TROUBLESHOOTING.md) | Problem solving |

---

## Quick Start

```bash
# Install Claude Craft
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en

# Or with Makefile
make install-symfony TARGET=. RULES_LANG=en

# Start workflow
/workflow:init

# Use an agent
@tdd-coach Guide me through TDD for this feature

# Run audit
/team:audit --sequential
```

---

## Claude Code Compatibility

**Minimum Version**: 2.1.38

### PR Integration (v2.1.27+)

| Feature | CLI Option | Description |
|---------|------------|-------------|
| Resume PR session | `--from-pr 123` or `--from-pr <url>` | Resume session linked to a PR |
| PR Status | Footer indicator | Shows PR state in status line |
| Auto-link | via `gh pr create` | Sessions auto-link when creating PR |

**PR Status Indicators:**

| Status | Indicator |
|--------|-----------|
| Approved | approved |
| Pending | pending |
| Changes Requested | changes requested |
| Draft | draft |
| Merged | merged |

### File Operations Best Practice (v2.1.21+)

Claude prefers native file tools over bash equivalents for better reliability:

| Task | Use | Avoid |
|------|-----|-------|
| Read files | `Read` tool | `cat`, `head`, `tail` |
| Edit files | `Edit` tool | `sed`, `awk` |
| Write files | `Write` tool | `echo >`, `cat <<EOF` |

### spinnerVerbs Configuration (v2.1.23+)

Customize spinner text displayed during tool execution:

```json
{
  "spinnerVerbs": {
    "default": ["Thinking", "Processing"],
    "Edit": ["Editing", "Modifying"],
    "Bash": ["Running", "Executing"]
  }
}
```

Linked to `activeForm` field in TaskCreate for custom task spinners.

### Background Agent Permissions (v2.1.20+)

Background agents request permissions **before** launching, avoiding mid-execution blocks:

```
Launching background task: "Analyze and fix code"

This task will need permissions for:
- Read (all files)
- Edit (src/**)
- Bash (npm run lint:fix)

Approve all? [y/N/select]
```

### Task Status: deleted (v2.1.20+)

Tasks can now be permanently removed using `deleted` status via TaskUpdate:

```
pending → in_progress → completed
              ↓
           deleted
```

### VSCode Python venv (v2.1.21+)

Setting `claudeCode.usePythonEnvironment` enables automatic virtual environment activation in VSCode.

### PDF Page Range Support (v2.1.30+)

The Read tool now supports a `pages` parameter for PDF files:

| Feature | Description |
|---------|-------------|
| `pages` parameter | Specify page range (e.g., `pages: "1-5"`) |
| Large PDF optimization | PDFs >10 pages return lightweight reference when `@` mentioned |

### OAuth Client Credentials for MCP (v2.1.30+)

For MCP servers that don't support Dynamic Client Registration:

| Flag | Description |
|------|-------------|
| `--client-id` | OAuth client ID for the MCP server |
| `--client-secret` | OAuth client secret for the MCP server |

Usage: `claude mcp add --client-id <id> --client-secret <secret> <server-name>`

### /debug Command (v2.1.30+)

| Command | Description |
|---------|-------------|
| `/debug` | Troubleshoot current session issues |

Complements `/doctor` (environment diagnostics) with session-specific debugging.

### Task Tool Metrics (v2.1.30+)

Task tool results now include execution metrics:

| Metric | Description |
|--------|-------------|
| Token count | Tokens consumed by the sub-agent |
| Tool uses | Number of tool invocations |
| Duration | Elapsed time for task execution |

### Reduced Motion Mode (v2.1.30+)

Configuration option to minimize animations: `"reducedMotion": true` in settings.json.

### Session Resume Hint (v2.1.31+)

On exit, Claude Code now displays a hint showing how to resume the current session.

### PDF Limits Clarification (v2.1.31+)

Improved error messages now show actual PDF limits:

| Limit | Value |
|-------|-------|
| Max pages | 100 pages per request |
| Max file size | 20MB |

### Enhanced File Tools Preference (v2.1.31+)

System prompts improved to more strongly guide Claude toward using dedicated tools (`Read`, `Edit`, `Glob`, `Grep`) instead of bash equivalents (`cat`, `sed`, `grep`, `find`).

### Reduced Layout Jitter (v2.1.31+)

Terminal layout jitter reduced when the spinner appears and disappears during streaming.

### Japanese IME Support (v2.1.31+)

Added support for full-width (zenkaku) space input from Japanese IME in checkbox selection.

### Third-party Provider Pricing (v2.1.31+)

Removed misleading Anthropic API pricing from model selector for third-party provider (Bedrock, Vertex, Foundry) users.

### Claude Opus 4.6 Support (v2.1.32+)

New flagship model with enhanced capabilities:

| Feature | Value |
|---------|-------|
| Model ID | `claude-opus-4-6` |
| Context window | 200K standard, 1M beta |
| Max output | 128K tokens |
| Adaptive thinking | Effort levels: low, medium, high, max |
| Context compaction | Beta - automatic context management |

### Agent Teams (v2.1.32+ Research Preview)

Multi-agent coordination with shared task management:

| Feature | Description |
|---------|-------------|
| `Teammate` tool | spawnTeam, cleanup operations |
| `SendMessage` tool | message, broadcast, shutdown_request/response |
| Shared tasks | TaskCreate/Update/List/Get across team |
| Display modes | In-process (Shift+Up/Down), split panes (tmux/iTerm2) |
| Delegate mode | Shift+Tab to switch between teammates |

Enable: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

### Automatic Memory Recording (v2.1.32+)

Claude automatically records session memory for future context:

| Feature | Value |
|---------|-------|
| Trigger | After ~10K tokens of conversation |
| Update frequency | Every ~5K tokens or 3 tool calls |
| Storage | `~/.claude-profiles/<profile>/projects/<hash>/memory/` |

### Summarize from Here (v2.1.32+)

Partial conversation summarization - summarize from a specific point rather than the entire conversation.

### Auto Skill Loading from --add-dir (v2.1.32+)

Skills in directories added via `--add-dir` are now automatically discovered and available.

### Skill Character Budget Scaling (v2.1.32+)

Skill content budget now scales to 2% of the model's context window size.

### --resume Agent Inheritance (v2.1.32+)

When resuming a session with `--resume`, the `--agent` value is automatically inherited from the original session.

### VSCode Session Loading Spinner (v2.1.32+)

Added loading spinner in VSCode while session is being restored.

### TeammateIdle & TaskCompleted Hook Events (v2.1.33+)

New hook events for multi-agent workflows:

| Event | When it fires | Use case |
|-------|---------------|----------|
| `TeammateIdle` | When a teammate goes idle | Assign next task, cleanup |
| `TaskCompleted` | When a task is marked completed | Trigger next workflow step |

### Agent Type Restrictions (v2.1.33+)

Control which sub-agent types an agent can spawn using `Task(agent_type)` in the `tools` frontmatter:

| Syntax | Description |
|--------|-------------|
| `Task(Explore)` | Only allow Explore sub-agents |
| `Task(Plan)` | Only allow Plan sub-agents |
| `Task(Bash)` | Only allow Bash sub-agents |

### Agent Memory Frontmatter (v2.1.33+)

Persistent memory for sub-agents with three scope options:

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.claude/agent-memory/<name>/` | Cross-project learnings (recommended) |
| `project` | `.claude/agent-memory/<name>/` | Project-specific, shareable via VCS |
| `local` | `.claude/agent-memory-local/<name>/` | Project-specific, NOT in VCS |

### Plugin Name in Skill Descriptions (v2.1.33+)

Plugin names now appear in skill descriptions and the `/skills` menu.

### VSCode Remote Sessions (v2.1.33+)

OAuth users can browse and resume Claude Code sessions from claude.ai remotely.

### VSCode Session Picker Enhancements (v2.1.33+)

Git branch and message count now displayed in session picker, with search by branch name.

### Fast Mode (v2.1.36+)

Toggle fast mode for Opus 4.6 with the `/fast` command:

| Feature | Description |
|---------|-------------|
| Command | `/fast` to toggle on/off |
| Speed | Up to 2.5x faster output tokens |
| Intelligence | Same Opus 4.6 capabilities |
| Visual indicator | Lightning bolt icon when enabled |
| Persistence | Setting persists across sessions |
| Pricing (fast) | $30/M input, $150/M output |
| Pricing (standard) | $5/M input, $25/M output |

### Security: Skills Directory Protection (v2.1.38+)

Writes to `.claude/skills` directory are now blocked in sandbox mode.

### Heredoc Fix for JS Template Literals (v2.1.38+)

Bash tool no longer produces "Bad substitution" errors with heredocs containing JavaScript template literals like `${index + 1}`.

### Plan Mode Crash Fix (v2.1.38+)

Fixed crash when entering plan mode with project config in `~/.claude.json` missing default fields.

### temperatureOverride Fix (v2.1.38+)

`temperatureOverride` is no longer silently ignored in the streaming API path.

### VSCode Fixes (v2.1.37/v2.1.38)

| Fix | Description |
|-----|-------------|
| Terminal scroll | Fixed scroll-to-top regression from v2.1.37 |
| Tab key | Fixed Tab key queueing slash commands instead of autocompleting |
| Duplicate sessions | Fixed duplicate sessions when resuming in VSCode |

### LSP Compatibility (v2.1.38+)

Fixed LSP shutdown/exit compatibility with strict language servers that reject null params.

### Text Rendering Fixes (v2.1.38+)

| Fix | Description |
|-----|-------------|
| Thai/Lao spacing | Fixed Thai/Lao spacing vowels rendering in input field |
| Tool use text | Fixed text between tool uses disappearing when not streaming |
