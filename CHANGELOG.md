# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.10.0] - 2026-02-11

### Changed
- **CQ-7**: Migrated CLI from CommonJS to native ESM (`"type": "module"`)
- All 6 CLI modules converted to `import`/`export` syntax
- Test suite updated to direct ESM imports (removed `createRequire` bridge)
- ESLint config updated for ESM source type

---

## [5.9.9] - 2026-02-11

### Fixed
- **CQ-14**: Fixed step counter in `runInstallation()` — docker no longer double-counted, missing scripts handled correctly

### Added
- Unit tests for `cli/lib/colors.js` module
- CI: `npm audit` security check before publish
- CI: Package size threshold enforcement (25 MB)
- Vitest timeout configuration for long-running install tests

---

## [5.9.8] - 2026-02-11

### Fixed
- **SEC-6**: YAML injection in escalation `create_escalation()` — replaced heredoc with safe `yq` construction
- **SEC-10**: Removed `DATABASE_URL` from session-init.sh env allowlist (may contain credentials)
- **SEC-11**: Hardened `block-dangerous-commands.sh` — expanded matcher scope, added flag reordering detection, broadened secret exposure patterns
- **SEC-12**: Added CLI input validation for `--max-iterations` and `--output` options
- **Ralph syntax**: Fixed bash syntax errors in `dod-validator.sh` (regex) and `escalation-service.sh` (for-loop redirect)

---

## [5.9.7] - 2026-02-11

### Changed
- **ARCH-1**: Consolidated 10 tech install scripts into thin wrappers + shared library (`Dev/scripts/lib/install-tech-common.sh`), reducing ~6,000 lines to ~2,600 (~57% reduction)
- All install scripts maintain identical CLI interface and behavior (backward compatible)

---

## [5.9.6] - 2026-02-11

### Added
- **ESLint config**: Created `eslint.config.mjs` (flat config ESLint 9) for `cli/` JavaScript linting

### Fixed
- **CQ-10**: Documented magic numbers in `flattener.js` (TOKENS_PER_CHAR, MAX_TOKENS_PER_SHARD) with rationale
- **DOC-6**: Replaced hardcoded French strings with English in all 11 install scripts
- **ESLint warnings**: Fixed 5 unused variable warnings in `flattener.js` and `index.js`

### Removed
- **ARCH-12**: Deleted dead code `Dev/scripts/lib/install-common.sh` (504 lines), obsolete `Dev/scripts/migrate-project.sh` (v3.0 migration script), and associated test

---

## [5.9.5] - 2026-02-10

### Added
- **ShellCheck CI**: Added ShellCheck linting step in `npm-publish.yml` workflow, completing 100% of audit Phase 2 items
- **`.shellcheckrc`**: Project-wide ShellCheck configuration (SC1091, SC1090, SC2034 exclusions)
- **`lint:shell`**: New npm script for local shell script linting (`--severity=warning`)

---

## [5.9.4] - 2026-02-10

### Added
- **JSDoc**: `@module` tag on `cli/flattener.js` exported module
- **routing-engine tests**: State machine validation, valid/invalid transitions, autonomous mode toggles (39 tests)
- **ASC mode tests**: Error classification, retry backoff logic, DoD security regression, stop conditions (39 tests)

### Fixed
- **quality-gate warning**: Now logs a warning when no test framework is detected instead of passing silently (all 5 languages)

---

## [5.9.3] - 2026-02-10

### Added
- **Test infrastructure**: vitest config, 14 test files (168+ tests), commitlint
- **Code quality tooling**: `.editorconfig`, `.prettierrc`, `.github/CODEOWNERS`, `dependabot.yml`
- **CLI testability**: Extracted `parseArgs`, `detectProject`, constants into `cli/lib/` modules
- **Vale prose linter**: `.vale.ini` config with project vocabulary for documentation linting
- **i18n team commands**: `team-audit`, `team-delivery`, `team-security`, `team-sprint` in de/es/fr/pt

### Fixed
- **i18n parity**: Updated workflow commands, rules, hooks across all 5 languages (de/en/es/fr/pt)
- **Flattener exports**: Exposed `DEFAULT_IGNORES`, `PRIORITY_EXTENSIONS`, constants for testing

---

## [5.9.2] - 2026-02-10

### Fixed
- **Shell hardening**: `set -euo pipefail` added to all 20 Ralph lib modules
- **Shell security**: Safe xargs (`-r`), allowlist env filtering, regex normalization in hook scripts
- **Shell security**: Shebang verification before `chmod +x`, `.npmignore` excludes runtime hooks
- **CLI quality**: Shared `cli/lib/colors.js` module, separated try/catch in `detectProject()`
- **CLI quality**: Fixed "GPT-4" → "Claude models", documented magic numbers in flattener
- **CLI quality**: Dynamic tech list in `--help` (all 11 technologies), fixed `CURRENT_VERSION` in migrate script
- **CI/CD**: Added `npm ci` + `npm run lint` to build job, `registry-url` in publish job
- **CI/CD**: Centralized VERSION via `get_claude_craft_version()` — no more hardcoded versions in install scripts
- **Docs**: Created `.markdownlint.json`, deleted orphan TRANSLATION_STATUS.md files
- **Docs**: Added i18n verification checklist to CONTRIBUTING.md

---

## [5.9.1] - 2026-02-10

### Added
- **CODE_OF_CONDUCT.md**: Contributor Covenant v2.1
- **SECURITY.md**: Security policy and vulnerability reporting

### Fixed
- README badges (npm, CI, license) added
- Removed 14 stale "What's New" sections from README, kept only v5.9
- Fixed command count `130+` → `157` and BMAD agent count `9` → `10` in README and `.bmad/README.md`
- Removed ghost commands `/bmad:init`, `/bmad:status` from README and `.bmad/README.md`
- Removed `/bmad:` namespace from command list
- Updated LICENSE copyright to 2024-2026
- Separated fixes from features in CHANGELOG v5.9.0 (`### Fixed` section)

---

## [5.9.0] - 2026-02-10

### Added
- **Claude Code 2.1.36 / 2.1.38 Compatibility**
  - **Fast Mode** (v2.1.36): `/fast` toggles up to 2.5x faster Opus 4.6 output
  - **Skills Directory Protection** (v2.1.38): Writes to `.claude/skills` blocked in sandbox

### Fixed
- **Heredoc Fix** (v2.1.38): No more "Bad substitution" with JS template literals
- **Plan Mode Crash Fix** (v2.1.38): Fixed crash when `~/.claude.json` missing fields
- **temperatureOverride Fix** (v2.1.38): No longer ignored in streaming API
- **LSP Compatibility** (v2.1.38): Fixed shutdown/exit with strict language servers
- **VSCode Fixes** (v2.1.38): Terminal scroll, Tab key, duplicate sessions
- **Text Rendering** (v2.1.38): Thai/Lao spacing, text between tool uses

### Changed
- Updated recommended Claude Code version from 2.1.34 to 2.1.38
- Updated VERSION in all 11 install scripts from 5.4.0 to 5.9.0

---

## [5.8.0] - 2026-02-07

### Fixed
- **Documentation Accuracy** — Fixed agent/command counts in documentation (40 agents, 157 commands)
- **BMAD Agent Cleanup** — Removed ghost menu blocks from all 10 BMAD agent YAMLs
- **Ghost Commands** — Removed ghost commands `/bmad:init`, `/bmad:status`
- **QA Commands** — Marked `/qa:recette-status`, `/qa:recette-regression`, `/qa:recette-report` as [PLANNED]

### Added
- **Documentation** — Added `/common:team-delivery` to documentation

### Changed
- **Command Harmonization** — Harmonized 8 check-compliance commands to unified delegation pattern
- **Command Merging**
  - Merged `sprint-bmad-status` → `sprint-status --bmad`
  - Merged `validate-backlog` → `gate-validate-backlog --no-gate`

### Deprecated
- **full-audit** → Use `team-audit --sequential` instead (removal in v6.0)
- **ralph-sprint** → Use `team-sprint --ralph-mode` instead (removal in v6.0)
- **workflow-orchestrator agent** → Deprecated (removal in v6.0)

---

## [5.7.0] - 2026-02-07

### Added
- **Agent Teams Integration** — 3 team templates, infrastructure scripts, cost framework
  - `/common:team-audit` — Parallel multi-technology audit (1 opus leader + N haiku auditors, max 4)
  - `/common:team-sprint` — Sprint Development Team (1 opus conductor + 2-3 sonnet devs)
  - `/common:team-security` — Security Review Team (1 opus lead + 3 haiku reviewers)
  - `Tools/AgentTeams/lib/result-aggregator.sh` — Merges isolated audit results
  - `Tools/AgentTeams/lib/compatibility-check.sh` — Validates agent-role compatibility
  - `Tools/AgentTeams/lib/ralph-teams-adapter.sh` — Abstraction layer with bash fallback
  - `Tools/AgentTeams/lib/cost-estimator.sh` — Token cost estimation (parallel vs sequential)
  - `Tools/AgentTeams/lib/cost-dashboard.sh` — Visual cost comparison before team launch
  - `docs/AGENT-TEAMS-GUIDE.md` — User guide for Agent Teams integration

### Changed
- `ralph-sprint.md` — Added `--use-teams` option for Agent Teams mode
- `ralph-conductor.md` — Added Agent Teams coordination mode
- `full-audit.md` — Added isolated output directories and result merge step
- `.claude/INDEX.md` — Added Agent Teams section

### Fixed
- **sprint-status.yaml race condition** — Single-writer pattern in `.bmad/lib/batch-executor.sh` and `Tools/Ralph/lib/parallel-manager.sh`

---

## [5.6.0] - 2026-02-06

### Changed
- **Claude Code 2.1.33 Compatibility**
  - **Agent Memory Frontmatter** (v2.1.33): Persistent `memory` field for agents with 3 scopes (user/project/local)
  - **TeammateIdle & TaskCompleted Hooks** (v2.1.33): New hook events for multi-agent coordination
  - **Agent Type Restrictions** (v2.1.33): `Task(agent_type)` syntax in tools frontmatter
  - **Plugin Name in Skills** (v2.1.33): Plugin name shown in /skills menu
  - **VSCode Remote Sessions** (v2.1.33): Browse/resume from claude.ai
  - **VSCode Session Picker** (v2.1.33): Git branch and message count display
  - **Improved API Errors** (v2.1.33): Specific error causes (ECONNREFUSED, SSL)
  - **Agent Teams Stability** (v2.1.33): tmux fix, plan warnings fix

### Added
- Added `memory: user` frontmatter to key agents (ralph-conductor, research-assistant, workflow-orchestrator)
- Documented TeammateIdle and TaskCompleted hook events in HOOKS.md (11 → 13 events)
- Documented agent type restrictions and memory frontmatter in AGENTS.md

### Upgraded
- Updated minimum Claude Code version from 2.1.32 to 2.1.34
- Updated recommendedClaudeCodeVersion to 2.1.34 in plugin.json

---

## [5.5.1] - 2026-02-06

### Fixed
- Harmonized agent counts from 34/35 to 40 across all documentation (13 Common + 10 Reviewers + 10 BMAD + 5 Docker + 2 Project)
- Fixed `recommendedClaudeCodeVersion` from 2.1.25 to 2.1.32 in plugin.json
- Added missing frontmatter: `model: opus` for ralph-conductor (EN/ES), `model: haiku` + tools for vuejs-reviewer and php-reviewer
- Added @workflow-orchestrator to Common agents, @csharp-reviewer/@php-reviewer to Technology Reviewers, Project Agents (2) section
- Translated 5 remaining French strings in INDEX.md to English
- Fixed `claude-projects.yaml` version from 5.3.0 to 5.5.0

## [5.5.0] - 2026-02-06

### Changed
- **Claude Code 2.1.32 Compatibility**
  - **Claude Opus 4.6** (v2.1.32): New flagship model - 200K context (1M beta), 128K output, adaptive thinking
  - **Agent Teams** (v2.1.32 Research Preview): Multi-agent coordination with Teammate/SendMessage tools
  - **Automatic Memory Recording** (v2.1.32): Auto-records session context for future use
  - **Summarize from Here** (v2.1.32): Partial conversation summarization
  - **Auto Skill Loading** (v2.1.32): Skills from --add-dir auto-discovered
  - **Skill Budget Scaling** (v2.1.32): Skill content scales to 2% of context window
  - **--resume Agent Inheritance** (v2.1.32): Auto-inherits --agent value
  - **VSCode Session Spinner** (v2.1.32): Loading spinner during session restore

### Upgraded
- All common agents upgraded from `model: sonnet` to `model: opus` (Opus 4.6)
- Settings templates updated to use `claude-opus-4-6` as default model

---

## [5.4.0] - 2026-02-03

### Added
- **Claude Code 2.1.31 Compatibility** - Documentation update for latest Claude Code features
  - **PDF Page Range** (v2.1.30): `pages` parameter for Read tool, lightweight reference for large PDFs
  - **OAuth Client Credentials for MCP** (v2.1.30): `--client-id` / `--client-secret` flags for `claude mcp add`
  - **/debug Command** (v2.1.30): Session-specific troubleshooting (complements `/doctor`)
  - **Task Tool Metrics** (v2.1.30): Token count, tool uses, duration in Task results
  - **Reduced Motion Mode** (v2.1.30): `reducedMotion: true` setting to minimize animations
  - **Session Resume Hint** (v2.1.31): Resume hint displayed on exit
  - **PDF Limits Clarification** (v2.1.31): Error messages show actual limits (100 pages, 20MB)
  - **Enhanced File Tools Preference** (v2.1.31): Improved system prompts for native tools usage
  - **Reduced Layout Jitter** (v2.1.31): Less terminal UI jitter during spinner
  - **Japanese IME Support** (v2.1.31): Full-width space input in checkbox selection
  - **Third-party Pricing Fix** (v2.1.31): Corrected pricing display for Bedrock/Vertex/Foundry
  - **PR Integration** (v2.1.27): `--from-pr` flag, auto-link sessions to PRs, status indicators
  - **spinnerVerbs** (v2.1.23): Customizable spinner text configuration in settings.json
  - **File Tools Preference** (v2.1.21): Claude prefers Read/Edit/Write over bash equivalents
  - **Task status `deleted`** (v2.1.20): Permanent task removal via TaskUpdate
  - **Background Agent Permissions** (v2.1.20): Permission prompts before agent launch
  - **VSCode Python venv** (v2.1.21): `claudeCode.usePythonEnvironment` setting

### Changed
- Updated all documentation to reference Claude Code 2.1.31
- Added Claude Code Compatibility section to `.claude/CLAUDE.md`
- Enhanced `.claude/INDEX.md` with quick reference for new features
- Updated training materials and cheatsheets

---

## [5.3.0] - 2026-01-31

### Added
- **QA Recette Fix** (`/qa:recette-fix`) - Automated bug fixing from recette sessions
  - 7-phase workflow: load → refine → group → BMAD docs → TDD fix → verify → report
  - Error refinement with severity matrix and root cause analysis
  - Smart grouping by root cause (deduplication)
  - BMAD bug story generation from template
  - TDD workflow (RED → GREEN → REFACTOR) per bug
  - `--dry-run`, `--skip-fix`, `--severity`, `--auto-commit` flags
  - fix-state.yaml for progress tracking
  - Bug story template in 5 languages (fr, en, es, de, pt)

## [5.2.1] - 2026-01-30

### Fixed
- **install-from-config.sh**: Added missing technology mappings (angular, csharp, laravel, vuejs, php) in `get_install_script()`
- **install-from-config.sh**: Docker tech now correctly routes to `Infra/install-infra-rules.sh` instead of being skipped
- **install-from-config.sh**: Script options (`--install`, `--force`, `--preserve-config`, `--skip-common`) are now adapted per technology script capabilities
- **install-common-rules.sh**: Fixed `install_claude_md()` crash when markdown files lack `description:` frontmatter (grep exit code 1 with `set -e`)

### Changed
- **claude-projects.yaml**: Added Docker module to all SaaS projects (kapitain, CareLink, Joina, SkillProof) for consistent infrastructure tooling across all projects

## [5.2.0] - 2026-01-30

### Added
- **Claude Code 2.1.25 Optimization** - Full leverage of Claude Code advanced features
  - **New Hooks**:
    - `PostToolUseFailure`: Automatic recovery context after tool failures
    - `PreCompact`: Backup sprint state before memory compaction
    - `SessionEnd`: Collect session metrics, cleanup logs, generate daily summaries
  - **Agent YAML Frontmatter** (~100 agents across 5 languages):
    - `model`: haiku for reviewers/auditors, sonnet for engineers/architects
    - `tools`: Explicit tool whitelist per agent role
    - `disallowedTools`: Security restrictions (no Write/Edit for reviewers)
    - `skills`: Preloaded skill context (solid-principles, testing, security)
  - **Skills Frontmatter Enhancement**:
    - `allowed-tools`: Tool restrictions per skill
    - `model`: Cost optimization (haiku for simple skills)
    - Enhanced `triggers`: file patterns + keywords
  - **Plugin Manifest** (`.claude-plugin/plugin.json`):
    - Full plugin metadata for marketplace distribution
    - Capabilities declaration (skills, agents, hooks, mcp)
    - Technology stack listing
  - **Settings Enhancement**:
    - `plansDirectory: .claude/plans` for organized plans
    - Extended permissions (npm, pnpm, yarn, php, flutter, ng, dotnet)
    - Extended deny rules (chmod 777, curl|sh, credentials)

### Changed
- Claude Code feature utilization: ~40% → ~75%
- Hook coverage: 5/13 → 9/13 events
- Agent configuration: Added formal YAML frontmatter to all agents
- Skills configuration: Added tool restrictions and model selection

### Technical Details
- Hook scripts use jq for JSON parsing
- Backup rotation: keeps last 10 backups
- Log retention: 7 days for logs, 30 days for metrics
- Session metrics in `.claude/metrics/session-YYYYMMDD.json`

---

## [5.1.0] - 2026-01-30

### Added
- **QA Recette** - Automated Acceptance Testing with Claude in Chrome
  - `/qa:recette` command for browser-based acceptance tests
  - `/qa:recette-status` to view session progress
  - `/qa:recette-regression` to run regression tests only
  - `@qa-recette` agent for QA automation expertise
  - **Golden Rule Enforcement**: Fixed bugs never reappear
  - **Session Recovery**: Resume interrupted tests with checkpoints
  - **Auto Test Generation**: Unit, Functional, Behat tests from errors
  - **Regression Detection**: Compare historical runs
  - **6 Test Categories**: AC validation, edge cases, errors, UI/UX, performance, security
  - **Error Classification**: visual, interaction, validation, logic, security, API
  - **Chrome MCP Integration**: navigate, click, type, screenshot, record_gif
- **Recette Library** (`Tools/Recette/lib/`)
  - `chrome-check.sh`: MCP Chrome verification
  - `session.sh`: Session management with checkpoints
  - `plan-generator.sh`: Test plan from acceptance criteria
  - `browser-executor.sh`: Chrome automation execution
  - `test-generator.sh`: Regression test generation
  - `regression-detector.sh`: Historical comparison
  - `report-generator.sh`: MD/HTML/JSON reports
- **Templates** (`Tools/Recette/templates/`)
  - `unit-test.php.template`: PHPUnit template
  - `functional-test.php.template`: Symfony WebTestCase
  - `feature.feature.template`: Behat scenarios
  - `report.md.template`: Report template
- **i18n**: Full translation for en, fr, es, de, pt
- **Documentation**: Updated CLAUDE.md, INDEX.md, COMMANDS.md, AGENTS.md

### Changed
- Agent count: 34 → 35 (qa-recette added)
- Command count: 127+ → 130+ (3 QA commands added)

## [5.0.0] - 2026-01-30

### Added
- **Autonomous Sprint Conductor (ASC)** - Run entire sprints overnight with minimal human intervention
  - `/common:ralph-sprint` command for overnight/unattended sprint execution
  - `--overnight` mode: Bounded execution with stop window at 6am
  - `--parallel N` mode: Process up to N stories concurrently
  - `--supervised` mode: Confirm each story before processing
  - `--max-stories N` and `--timeout H` options for limits
- **Recovery Engine** (`Tools/Ralph/lib/recovery-engine.sh`)
  - 4-level error classification: Transient, Recoverable, Degraded, Blocked
  - Auto-retry with exponential backoff for transient errors
  - Auto-fix strategies: lint fix, TDD retry, dependency install
  - Recovery logging and metrics
- **Escalation Service** (`Tools/Ralph/lib/escalation-service.sh`)
  - Queue management for blocking issues
  - Webhook notifications: Slack, Teams, Discord, generic
  - Configurable timeout with default actions (skip, proceed, retry, abort)
  - Audit trail in `.ralph/escalations/audit.jsonl`
- **Parallel Manager** (`Tools/Ralph/lib/parallel-manager.sh`)
  - Dependency graph building from stories
  - Multi-session spawning with isolation
  - Resource monitoring (CPU, memory limits)
  - Result aggregation
- **Sprint Conductor** (`Tools/Ralph/lib/sprint-conductor.sh`)
  - Main orchestrator for autonomous sprint execution
  - Auto-claim, progress tracking, transitions
  - Stop conditions: max stories, consecutive failures, runtime, time window
- **Autonomous Circuit Breaker Profile**
  - New `autonomous` profile with recovery_enabled
  - `check_circuit_breaker_with_recovery()` function
  - Integration with recovery engine before trip
- **BMAD Autonomous Mode**
  - `routing-engine.sh`: enable-autonomous, auto-claim, tdd-phase, tests-status commands
  - `batch-executor.sh`: autonomous mode with Ralph integration
  - Auto-transition based on TDD phase and test status
- **Configuration** (`Tools/Ralph/config/ralph-autonomous.yml`)
  - Complete autonomous mode configuration template
  - Schedule, limits, parallel, recovery, escalation settings
- **Documentation**
  - `docs/AUTONOMOUS-SPRINT.md`: Complete ASC guide
  - `docs/AGENTS.md`: Agent behavior in autonomous mode section
  - `docs/CLI-REFERENCE.md`: Full ASC CLI options documentation
  - `.claude/INDEX.md`: ASC quick reference section
  - `Tools/Ralph/docs/RECOVERY.md`: Recovery engine documentation
  - `Tools/Ralph/docs/PARALLEL.md`: Parallel processing documentation
  - `.bmad/docs/AUTONOMOUS.md`: BMAD autonomous mode documentation
  - Updated FAQ, TROUBLESHOOTING, COMMANDS docs
- **i18n** - `/common:ralph-sprint` command in 5 languages (en, fr, es, de, pt)

### Changed
- Ralph version: 2.0.0 → 3.0.0
- Ralph loads 4 new modules: recovery-engine, escalation-service, parallel-manager, sprint-conductor
- Ralph main script now supports: `--autonomous`, `--story=<id>`, `--sprint`, `--overnight`, `--parallel=<n>`
- Circuit breaker now includes recovery integration for autonomous profile
- `.claude/CLAUDE.md` updated with ASC section

### Technical Details
- New files: 6 shell modules (recovery-engine.sh, escalation-service.sh, parallel-manager.sh, sprint-conductor.sh, config/ralph-autonomous.yml)
- Updated files: ralph.sh, circuit-breaker.sh, batch-executor.sh, routing-engine.sh
- New command files: 5 (ralph-sprint.md in en/fr/es/de/pt)
- Documentation updates: README.md, CHANGELOG.md, docs/COMMANDS.md, docs/FAQ.md, docs/TROUBLESHOOTING.md, docs/AUTONOMOUS-SPRINT.md, .claude/CLAUDE.md, .bmad/README.md, Tools/Ralph/README.md

## [4.4.0] - 2026-01-29

### Added
- **Comprehensive Documentation for Junior Developers**
  - `docs/QUICKSTART.md`: 5-minute getting started guide
  - `docs/PREREQUISITES.md`: Complete dependency guide with OS-specific instructions
  - `docs/CLI-REFERENCE.md`: Full NPX CLI and Makefile documentation
  - `docs/FAQ.md`: 50+ frequently asked questions organized by category
  - `docs/TROUBLESHOOTING.md`: Common problems and solutions with diagnostic scripts
  - `docs/BMAD-PRACTICAL-GUIDE.md`: Practical guide for BMAD v6 framework
  - `docs/RALPH-GUIDE.md`: Ralph Wiggum configuration and DoD validators
  - `docs/MIGRATION-v4.md`: v3.x to v4.x migration guide
  - `docs/COMMANDS-FULL-REFERENCE.md`: All 127+ commands documented
  - `docs/AGENTS-FULL-REFERENCE.md`: All 40 agents documented
  - `docs/SCRIPTS-REFERENCE.md`: Installation scripts reference
  - `docs/MAKEFILE-REFERENCE.md`: All Makefile targets documented
  - `docs/ARCHITECTURE.md`: Internal architecture with diagrams (TCL, BMAD, Ralph)
- **Complete Workflow Guides** in 5 languages (en, fr, es, de, pt)
  - `docs/guides/*/10-complete-workflow.md`: Idea → Production workflow
- **Example Projects**
  - `docs/examples/symfony-api/`: Complete REST API example
  - `docs/examples/flutter-app/`: Mobile application example
  - `docs/examples/fullstack-saas/`: Full SaaS with Symfony + Flutter
- **Translations** for key documents (fr, es, de, pt)
  - QUICKSTART, PREREQUISITES, CLI-REFERENCE, FAQ, TROUBLESHOOTING
- **Prerequisites Check Script**
  - `Dev/scripts/check-prerequisites.sh`: Verify all Claude Craft dependencies
  - Supports `--verbose` and `--fix` options

### Changed
- `.claude/CLAUDE.md` expanded from 37 to 285 lines with all 10 technologies
- `CONTRIBUTING.md` enhanced with dev setup and release checklist
- All install scripts updated to version 4.4.0

## [4.3.0] - 2026-01-29

### Added
- **Complete i18n Support for BMAD v6 Commands**
  - Spanish (ES): 18 BMAD v6 commands translated
  - German (DE): 18 BMAD v6 commands translated
  - Portuguese (PT): 18 BMAD v6 commands translated
  - French (FR): 12 missing BMAD v6 commands completed
- **Dev/i18n Translations Completed**
  - `Common/commands/sub-agents-patterns.md` (FR, ES, DE, PT)
  - `Common/templates/mcp.json.template` (FR, ES, DE, PT)
  - `Python/rules/08-quality-tools.md` (FR, ES, DE, PT)
  - `Python/rules/11-security-python.md` (FR, ES, DE, PT)
  - `Flutter/rules/07-testing-flutter.md` (PT)
  - `Flutter/skills/testing-flutter/SKILL.md` (PT)

### Fixed
- Project commands now included in `make install-all` target
- Added "project" as valid technology in `install-from-config.sh`
- Added `--skip-common` flag support in `install-project-commands.sh`

### Changed
- All install scripts version updated: 4.0.1 → 4.3.0
- Project install script version: 2.0.0 → 2.1.0
- Dev/i18n file count now equal across all 5 languages (~346 files each)

## [4.2.0] - 2026-01-29

### Added
- **BMAD v6 Framework** - Complete project management enhancement
  - **9 Agent-as-Code Definitions** (`Project/agents/`)
    - `bmad-master`: Central orchestrator for BMAD methodology
    - `pm`: Product Manager (PRD, vision, roadmap, prioritization)
    - `ba`: Business Analyst (requirements, use cases, story mapping)
    - `architect`: System Architect (tech specs, ADRs, API design)
    - `po`: Product Owner (backlog management, acceptance)
    - `sm`: Scrum Master (ceremonies, velocity, impediments)
    - `dev`: Developer (TDD implementation, refactoring)
    - `qa`: QA Engineer (test strategy, validation)
    - `ux`: UX Designer (wireframes, journeys, accessibility)
  - **Status-based Routing** (`.bmad/lib/routing-engine.sh`)
    - State machine: backlog → ready-for-dev → in-progress → review → done
    - Automatic transitions based on task completion
    - History tracking for all status changes
    - Support for blocked state from any status
  - **5 Quality Gates** (`.bmad/gates/`)
    - PRD Gate (≥80%): Problem, users, goals, metrics, scope validation
    - Tech Spec Gate (≥90%): Architecture, security, testing, deployment
    - Backlog Gate: Full INVEST compliance (6/6 criteria)
    - Sprint Ready Gate: Metadata, goal, stories ready validation
    - Story DoD Gate: Tasks, tests, AC, review, no blockers
  - **Claude Code Hooks** (`.bmad/hooks/`)
    - `sprint-context.sh` (SessionStart): Inject sprint context at session start
    - `story-status.sh` (PreToolUse, once:true): Inject current story status
    - `quality-gate.sh` (Stop): Validate quality gates before completion (exit 2 blocks)
  - **Batch Processing** (`.bmad/lib/batch-executor.sh`)
    - Queue management for epic/sprint execution
    - Sequential and parallel execution modes
    - Checkpointing for resume on failure
    - Dependency-aware processing
  - **YAML Configuration Files**
    - `sprint-status.yaml`: Sprint state tracking with routing rules
    - `batch-queue.yaml`: Batch processing queue management

- **20+ New Commands**
  - Sprint Management:
    - `/sprint:bmad-status`: Display sprint status with routing info
    - `/sprint:next-story`: Get next story ready for development
    - `/sprint:transition <ID> <status>`: Transition story status
    - `/sprint:auto-route`: Execute automatic routing rules
  - Quality Gates:
    - `/gate:validate-prd [file]`: Validate PRD (≥80%)
    - `/gate:validate-techspec [file]`: Validate Tech Spec (≥90%)
    - `/gate:validate-backlog [story-id]`: Validate INVEST compliance
    - `/gate:validate-story <story-id>`: Validate story DoD
    - `/gate:validate-sprint`: Validate sprint readiness
    - `/gate:report`: Comprehensive quality gates report
  - Backlog Migration:
    - `/project:analyze-backlog`: Analyze current backlog structure
    - `/project:migrate-backlog`: Convert to BMAD v6 format
    - `/project:update-stories`: Add missing BMAD fields
    - `/project:sync-backlog`: Bidirectional sync files ↔ YAML
  - Batch Processing:
    - `/project:run-epic <epic-id>`: Queue all stories from an epic
    - `/project:run-queue`: Process batch queue
    - `/project:run-sprint`: Execute full sprint
    - `/project:batch-status`: View queue status

- **3 New Templates** (`Project/templates/`)
  - `sprint-status.yaml.template`: Sprint tracking template
  - `batch-queue.yaml.template`: Batch queue configuration
  - `agent.yaml.template`: Agent-as-Code template

- **French Translations** for all new BMAD commands
  - `analyze-backlog.md`, `migrate-backlog.md`
  - `sprint-bmad-status.md`
  - `gate-validate-prd.md`, `gate-validate-backlog.md`, `gate-report.md`

- **TDD Phase Tracking**
  - Stories track TDD phase: red → green → refactor
  - Automatic phase guidance in hooks
  - Phase validation in Story DoD gate

### Changed
- Agent count: 25 → 34 (9 BMAD agents added)
- Command count: 90+ → 110+ (20+ BMAD commands added)
- Template count: 30 → 33 (3 BMAD templates added)
- README.md updated with BMAD v6 documentation
- docs/AGENTS.md updated with BMAD agents section
- docs/COMMANDS.md updated with BMAD commands section

## [4.1.0] - 2026-01-29

### Added
- **Ralph Wiggum v2.0** - Major upgrade to continuous AI agent loop
  - **Claude Code 2.1.23+ Hooks Integration** - Bidirectional communication
    - `SessionStart` hook injects Ralph context
    - `PreToolUse` hook (once:true) injects DoD status
    - `Stop` hook gates on DoD satisfaction (exit code 2 blocks)
  - **Auto-Detection** - Intelligent project type detection
    - Supports: Symfony, Laravel, Flutter, React, Vue, Angular, Next.js, .NET, Python, Go, Rust
    - Confidence levels (HIGH/MEDIUM) for detection accuracy
  - **Observability** - Real-time monitoring
    - Terminal dashboard with progress bar, circuit breaker status, context usage
    - Metrics export in JSON and Prometheus formats
    - Health monitoring (stall detection, error spiral, context bloat)
  - **Adaptive Circuit Breaker** - Profile-based thresholds
    - 5 profiles: `quick_fix`, `small_feature`, `medium_feature`, `large_feature`, `exploration`
    - Auto-detection from prompt keywords
    - Learning mode with historical adjustment
  - **DoD Templates** - Pre-configured for 8 technologies
    - Symfony (PHPUnit + PHPStan), Flutter (flutter_test + flutter_lints)
    - React (Jest/Vitest + ESLint), Python (pytest + ruff)
    - .NET (xUnit + Analyzers), Go (go test + golangci-lint), Rust (cargo test + clippy)
- New CLI flags: `--auto-detect`, `--init`, `--interactive`
- New modules: `metrics-exporter.sh`, `project-detector.sh`, `dod-templates.sh`, `config-generator.sh`, `dashboard.sh`, `health-monitor.sh`, `hooks-generator.sh`
- Hook scripts: `session-restore.sh`, `status-injector.sh`, `pre-tool-context.sh`, `stop-dod-gate.sh`

### Changed
- Ralph version bumped from 1.1.0 to 2.0.0
- `ralph.yml.template` updated with v2.0 configuration sections
- i18n messages updated for all 5 languages with v2.0 strings

## [4.0.3] - 2026-01-29

### Fixed
- CLI now reads version dynamically from package.json instead of hardcoded value
- Added `--version` and `-v` flags to CLI

## [4.0.2] - 2026-01-29

### Fixed
- Installation scripts now include 2026 feature references (json-streamer, object-mapper, wasm, mcp-integration, etc.)
- Aligned installation script versions with package version

## [4.0.1] - 2026-01-29

### Changed
- Updated to Claude Code 2.1.23 best practices
- Added `Setup` hook event documentation (for `--init`, `--init-only`, `--maintenance`)
- Added `once: true` hook configuration option
- Added `additionalContext` PreToolUse output field
- Added `spinnerVerbs` setting in templates
- Updated hook events from 10 to 11 (added Setup)

## [4.0.0] - 2026-01-29

### Added
- **2026 Best Practices Update** for all major frameworks
- `.claude/` directory now tracked in version control
- Sub-CLAUDE.md quick reference files per technology
  - `symfony/CLAUDE.md` - Symfony 8 quick reference
  - `flutter/CLAUDE.md` - Flutter 3.38 quick reference
- **Symfony 8.0 / PHP 8.5** documentation
  - `json-streamer.md` - JSON Streamer Component
  - `object-mapper.md` - ObjectMapper Component
  - `service-container-2026.md` - Container 2026 features
- **Flutter 3.38 / Dart 3.10** documentation
  - `wasm.md` - WebAssembly compilation
  - `mcp-integration.md` - Model Context Protocol
  - `web-performance-2026.md` - Web optimization
- `/common:init` command for bootstrapping new projects
- Technology Quick Links in INDEX.md

### Changed
- **PHP**: 8.4 → 8.5 (pipe operator, lazy objects)
- **Symfony**: 6.4 → 8.0 (JSON Streamer, ObjectMapper)
- **.NET**: 9 → 10 LTS
- **C#**: 13 → 14 (Extension Members, Null-Conditional Assignment)
- **Flutter**: 3.x → 3.38+ (WebAssembly, MCP)
- **Dart**: 3.x → 3.10+ (dot shorthands)
- **Rector**: 1.x → 2.3.x
- **Deptrac**: v1 → v4
- **PHPStan**: → 2.1.x
- `.gitignore` updated to track `.claude/` (except settings.local.json)
- CLAUDE.md updated to multi-technology framework format

### Improved
- Conformity score: 5.8/10 → 9/10
- Complete 2026 tooling stack documentation

## [3.6.0] - 2026-01-29

### Added
- **TCL (Tiered Context Loading)** extended to ALL 10 technologies
  - Python, React, Angular, Vue.js, Flutter, React Native
  - Symfony, Laravel, PHP, C#/.NET
- `.claude/references/{tech}/` structure for on-demand rule loading
- `INDEX.md` quick reference summaries for each technology
- `context.yaml` file-based contextual triggers
- `tcl-common.sh` shared functions for TCL installation scripts
- Templates: `CLAUDE.md.template`, `INDEX.md.template`, `context.yaml.template`

### Changed
- All installation scripts updated to TCL architecture (v3.5.0+)
- Rules renamed without numeric prefixes (e.g., `architecture.md` instead of `02-architecture.md`)
- CLAUDE.md reduced to ~200 tokens (previously ~70,000)
- Project context moved to `references/{tech}/project-context.md`

### Improved
- ~95% token reduction in auto-loaded context
- Fewer context compactions during long sessions
- Full rules still accessible via `@.claude/references/`

## [3.5.1] - 2026-01-23

### Fixed
- Nested code blocks in markdown templates now use 4 backticks
  - Fixes Claude misinterpreting nested gherkin/mermaid/bash/php/dart blocks
  - Updated 10 files across 5 languages (en, fr, de, es, pt)
  - Affected: generate-backlog.md, decompose-tasks.md

## [3.5.0] - 2026-01-22

### Changed
- **Token Optimization**: ~200K tokens saved (~19% reduction)
  - Deleted 249 REFERENCE.md duplicate files from skills directories
  - Removed 15 duplicate *-examples.md files from templates directories
  - SKILL.md files now reference rules/ directly via relative path
- Updated migrate-project.sh to no longer create REFERENCE.md files

### Improved
- Skills architecture: single source of truth (rules/) instead of duplicated content
- Reduced installed project size significantly

## [3.4.0] - 2026-01-22

### Added
- WHAT/WHY/HOW format for all CLAUDE.md templates
- Hooks support (PreToolUse, PostToolUse, Stop) in settings.json.template
- MCP configuration template (context7, filesystem, github)
- Sub-agents documentation (Explore, General-purpose, Plan)
- Wildcard permissions syntax in settings

### Changed
- Restructured all CLAUDE.md templates (55 total: 11 per language x 5 languages)
- Reduced template sizes from 239-544 lines to 79-110 lines
- Updated to Claude Code 2.1.23 best practices

### Improved
- Context usage optimization for Claude
- Consistent structure across all 5 languages (EN, FR, ES, DE, PT)

## [3.3.3] - 2026-01-16

### Fixed
- Ralph auto-compact: disable `compact_on_task_complete` by default

## [3.3.2] - 2026-01-15

### Changed
- Ralph auto-compact: increase `preventive_threshold` from 90% to 95%
- Ralph auto-compact: increase `max_compacts` from 3 to 5
- Ralph auto-compact: add `min_threshold` (default 50%) to skip compact when context is low

### Fixed
- Exclude `add-technology` command from project installations (internal only)

## [3.3.1] - 2026-01-14

### Fixed
- Sync package.json version with git tag for proper npm publishing

## [3.3.0] - 2026-01-14

### Changed
- Bump Ralph version to 1.1.0

## [3.2.0] - 2026-01-13

### Added
- 4 new technology stacks: Angular, C#/.NET, Laravel, Vue.js
- `/common:add-technology` command for generating new tech stacks

## [3.1.2] - 2026-01-13

### Changed
- Updated docs/index.html to showcase v3.0/v3.1 features
- Stats updated: 25 agents, 90+ commands
- Features grid: 4 → 6 cards (3-column layout)

## [3.1.1] - 2026-01-13

### Added
- Documentation for Ralph Wiggum feature

## [3.1.0] - 2026-01-13

### Added
- Ralph Wiggum continuous AI agent loop integration
- Definition of Done (DoD) structured validation system
- Circuit breaker safety mechanism
- Git checkpointing for recovery
- `/common:ralph-run` command (5 languages)
- `@ralph-conductor` agent (5 languages)
- CLI: `npx @the-bearded-bear/claude-craft ralph`

## [3.0.3] - 2026-01-13

### Added
- `/common:setup-project-context` command for interactive project configuration
  - Auto-detects tech stack, framework, database, CI/CD
  - Three modes: default, --auto (minimal), --full (comprehensive)
  - Generates complete `.claude/rules/00-project-context.md`

### Changed
- Updated all setup guides to reference the new command
- Added Configuration Commands section to COMMANDS.md

## [3.0.2] - 2026-01-12

### Added
- Installation tutorials for new and existing projects (10 files)
  - `08-setup-new-project.md`: Installation on brand new projects
  - `09-setup-existing-project.md`: Adding Claude-Craft to existing codebases
- Available in 5 languages (EN, FR, ES, DE, PT)

## [3.0.1] - 2026-01-12

### Fixed
- Version bump (3.0.0 was already published manually during initial setup)

## [3.0.0] - 2026-01-12

### Added
- OIDC trusted publishing for npm
- Node 24 support (npm 11.5.1+)

### Changed
- Pure OIDC authentication without token fallback
- Removed NODE_AUTH_TOKEN interference

### Security
- Enhanced npm publishing security via OIDC

[5.5.1]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v5.5.0...v5.5.1
[5.5.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v5.4.0...v5.5.0
[5.4.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v5.3.0...v5.4.0
[5.3.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v5.2.1...v5.3.0
[5.2.1]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v5.2.0...v5.2.1
[5.2.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v5.1.0...v5.2.0
[5.1.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v5.0.0...v5.1.0
[5.0.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v4.4.0...v5.0.0
[4.4.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v4.3.0...v4.4.0
[4.3.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v4.2.0...v4.3.0
[4.2.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v4.1.0...v4.2.0
[4.1.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v4.0.3...v4.1.0
[4.0.3]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v4.0.2...v4.0.3
[4.0.2]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v4.0.1...v4.0.2
[4.0.1]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.6.0...v4.0.0
[3.6.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.5.1...v3.6.0
[3.5.1]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.5.0...v3.5.1
[3.5.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.3.3...v3.4.0
[3.3.3]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.3.2...v3.3.3
[3.3.2]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.3.1...v3.3.2
[3.3.1]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.3.0...v3.3.1
[3.3.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.1.2...v3.2.0
[3.1.2]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.1.1...v3.1.2
[3.1.1]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.0.3...v3.1.0
[3.0.3]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.0.2...v3.0.3
[3.0.2]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.0.1...v3.0.2
[3.0.1]: https://github.com/TheBeardedBearSAS/claude-craft/compare/v3.0.0...v3.0.1
[3.0.0]: https://github.com/TheBeardedBearSAS/claude-craft/releases/tag/v3.0.0
