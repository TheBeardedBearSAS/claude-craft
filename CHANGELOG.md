# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [7.28.0] - 2026-04-14

### Added

- **Claude Code v2.1.106 compatibility** -- Internal improvements and bug fixes
- **Claude Code v2.1.107 compatibility** -- Show thinking hints sooner during long operations
- **Enhanced `/doctor` layout documentation** -- Status icons, categorized output, action hints (v2.1.105+)
- **New commands documentation** -- `/btw`, `/hooks`, `/reload-plugins`, `/proactive` in CLI reference, FAQ, and context management rules
- **PreCompact blocking documentation** -- Exit code 2 support fully documented in HOOKS.md
- **Stalled stream handling** -- 5-minute auto-retry documentation in TROUBLESHOOTING.md
- **WebFetch token optimization** -- Strips `<style>`/`<script>` contents documentation (50-80% token reduction)
- **New environment variables** -- `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD`, `MAX_THINKING_TOKENS`, `SLASH_COMMAND_TOOL_CHAR_BUDGET`, OTEL tracing vars (beta)
- **Advanced skills documentation** -- `context: fork`, `disable-model-invocation: true`, `claudeMdExcludes`, auto-compaction skill reload (5K/skill, 25K total)

### Changed

- **Recommended Claude Code version** -- 2.1.105 → 2.1.107 (minimum stays 2.1.47)
- **Documentation URLs** -- Migrated all references from docs.anthropic.com to code.claude.com (14 files)
- **Context management rules** -- Added new commands, environment variables, and skills sections (all 5 languages)
- **Version references** -- 7.27.0 → 7.28.0 across all docs, guides, and configuration files

## [7.27.0] - 2026-04-14

### Added

- **PostCompact hook** -- Context reinjection after compaction via `context-essentials.md` (previously only at session restart)
- **`.claudeignore` template** -- Generated during install to exclude `node_modules/`, `website/`, `Dev/i18n/`, lock files (40-70% reduction in file search operations)
- **`install_config()` in install scripts** -- Installs `settings.json`, `settings.local.json`, `.claudeignore`, and `context-essentials.md` during project setup
- **Agent memory frontmatter** -- 18 agents now have `memory: user` (6 cross-project) or `memory: project` (12 tech reviewers) for cross-session knowledge persistence
- **`effort:` field on all 22 agents** -- `low` for Haiku auditors, `medium` for Sonnet reviewers, `high` for Opus orchestrators
- **RTK `--ultra-compact` mode** -- Patched automatically during install for +5-10% additional token savings
- **MultiAccount `sync` command** -- Synchronizes hooks and settings from `~/.claude` to isolated profiles (`claude-accounts sync`)
- **BATS tests in CI** -- Shell script tests (MultiAccount, RTK, StatusLine, AgentTeams) now run in GitHub Actions via Docker
- **i18n parity check in CI** -- `npm run lint:i18n` added to build pipeline
- **66 new tests** -- `install-config` (11), `agents-optimization` (19), `templates` (19), `project-settings` (17), plus BATS for RTK ultra-compact (3) and MultiAccount sync (5)
- **`test-bats` and `test-all` Makefile targets** -- Run all BATS tests or combined vitest + BATS

### Changed

- **`settings.local.json` consolidated** -- 49KB (480+ accumulated permissions) → ~1KB (wildcard patterns), 98% reduction per session
- **`CLAUDE_CODE_SUBAGENT_MODEL` enforced** -- Set to `claude-sonnet-4-5` in `settings.json` (was only documented, not applied)
- **`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` removed** -- No longer always-on; teams overhead eliminated when not using `/team:*`
- **`api-designer` and `database-architect` downgraded** -- `opus` → `sonnet`, `maxTurns: 8` → `6` (~5x cost reduction per invocation)
- **INDEX.md trimmed** -- 358 → 215 lines, removed redundant Claude Code changelog and duplicated skills list
- **4 rules files condensed** -- `04-solid-principles` (17KB→1KB), `05-kiss-dry-yagni` (14KB→1KB), `07-testing` (11KB→1.3KB), `11-security` (10KB→1.6KB); full content preserved in `references/base/`
- **`settings.json.template` updated** -- Now includes `env` block, `PostCompact` hook, `SessionStart(compact)`, output filters for Bash/Grep, security hooks for Edit/Write
- **`settings.local.json.template` updated** -- Consolidated wildcard permissions instead of empty file
- **CI pipeline** -- `publish` now requires both `build` AND `bats` jobs; i18n parity check added to build

### Fixed

- **RTK integrity hash** -- `install-rtk.sh` now updates `.rtk-hook.sha256` after patching `--ultra-compact`
- **Version references** -- 7.26.0 → 7.27.0 across all docs, guides, and configuration files

## [7.26.0] - 2026-04-14

### Added

- **RTK setup command** -- `/common:setup-rtk` configures all token optimizations in one step (RTK proxy, PostToolUse hooks, PreCompact hooks, sub-agent model)
- **PostToolUse output-filtering hooks** -- Grep and Glob large output notices (>50KB) to guide context-efficient summarization
- **Enriched context-essentials.md** -- Architecture rules, stack detection, common test commands, active workflow state, key index pointers

### Changed

- **CLAUDE.md trimmed** -- 221 → 173 lines (-22%): commands/agents/skills tables replaced with compact summaries
- **Rules files condensed** -- 4 largest rules reduced by 54% (2,510 → 1,152 lines), verbose examples moved to `references/base/`
- **5 agents downgraded Opus → Sonnet** -- devops-engineer, ui-designer, ux-ergonome, uiux-orchestrator, refactoring-specialist (cost reduction, no quality loss for their task profiles)
- **maxTurns added to all 22 agents** -- Reviewers: 6, Orchestrators: 10, Specialists: 8, Auditors: 4, Designers: 6 (prevents runaway sessions)
- **Token savings** -- estimated 55-65% reduction per session from combined optimizations

### Fixed

- **Version references** -- 7.25.0 → 7.26.0 across CLAUDE.md, context-essentials.md, docs, and training materials

## [7.25.0] - 2026-04-14

### Added

- **Claude Code v2.1.63-v2.1.105 compatibility** -- 43 new versions documented with 12 feature sections
- **Auto Mode documentation** -- AI-powered permission classifier for Team plans (v2.1.94+)
- **New slash commands** -- /loop, /effort, /context, /powerup, /proactive, /color, /rename, /team-onboarding
- **8 new hook events** -- PostCompact, StopFailure, TaskCreated, CwdChanged, FileChanged, PermissionDenied, Elicitation, ElicitationResult
- **Hook enhancements** -- conditional `if` field (v2.1.85), `defer` permission (v2.1.89), PreCompact blocking (v2.1.105)
- **MCP enhancements** -- Elicitation, Tool Search lazy loading (95% context reduction), result persistence (500K), OAuth RFC 9728
- **Agent frontmatter** -- effort, maxTurns, disallowedTools fields for custom agents (v2.1.78+)
- **Security advisories** -- 7 new CVE fixes documented (v2.1.97-v2.1.101), source code leak incident (v2.1.88)
- **Subprocess sandboxing** -- PID namespace isolation, CLAUDE_CODE_SUBPROCESS_ENV_SCRUB (v2.1.98+)
- **Managed settings** -- managed-settings.d/ drop-in directory for enterprise config (v2.1.83+)
- **Context management updates** -- /context suggestions, /effort levels, idle-return prompt, /loop scheduling, MCP Tool Search, --bare flag, Monitor tool

### Changed

- **Recommended Claude Code version** -- 2.1.62 → 2.1.105 (minimum stays 2.1.47)
- **Security minimum** -- 2.1.51 → 2.1.97 (critical Bash tool hardening)
- **SECURITY.md** -- supported versions updated to 7.25.x/7.24.x

## [7.24.0] - 2026-02-27

### Added

- **Claude Code v2.1.62 compatibility** — Prompt suggestion cache regression fix
- **CLAUDE.md authoring best practices** — pointers over code copies, emphasis for critical rules, file placement hierarchy in context management rule
- **Performance optimization guide** — CLI tools over MCPs, model switching mid-session, PreToolUse output filtering in context management rule
- **Communication patterns** — Interview pattern, CIF structure, Writer/Reviewer pattern in context management rule

### Changed

- **Recommended Claude Code version** — 2.1.61 → 2.1.62 (minimum stays 2.1.47)
- **CVE-2026-21852 severity** — "High" → 5.3/10 CVSS in MCP.md and security rule
- **Agent Teams Guide** — Added ~7x token cost warning, recommended version bumped to 2.1.62
- **SECURITY.md** — supported versions updated to 7.24.x/7.23.x

## [7.23.0] - 2026-02-27

### Added

- **Claude Code v2.1.61 compatibility** — Windows config file corruption fix for concurrent writes
- **Native installer documentation** — PREREQUISITES (EN, FR) updated: `npm install -g` deprecated, recommend `curl https://install.claude.com | bash`
- **Context management best practices** — compaction hints in CLAUDE.md, CLAUDE.local.md for personal preferences, `CLAUDE_CODE_SUBAGENT_MODEL` env var, anti-patterns reference table
- **CVE severity scores** — CVE-2025-59536 (8.7/10 CVSS) and CVE-2026-21852 severity added to MCP.md and security rule

### Changed

- **Recommended Claude Code version** — 2.1.59 → 2.1.61 (minimum stays 2.1.47)
- **Agent Teams Guide** — `CLAUDE_CODE_SUBAGENT_MODEL` tip for cost optimization, recommended version bumped
- **SECURITY.md** — supported versions updated to 7.23.x/7.22.x

## [7.22.0] - 2026-02-27

### Added

- **Claude Code v2.1.48-v2.1.59 compatibility** — ConfigChange/WorktreeCreate/WorktreeRemove hooks, remote-control, /memory, /copy, --worktree flag, Opus 4.6 1M context, Ctrl+F bulk agent kill
- **Security CVE documentation** — CVE-2025-59536 (hook command injection) and CVE-2026-21852 (path traversal) documented in HOOKS.md, MCP.md, and security rule
- **Context management best practices** — proactive /compact at 70%, PreCompact hooks, /memory command, multi-session strategy (55% token reduction)

### Changed

- **Recommended Claude Code version** — 2.1.59 (minimum stays 2.1.47)
- **Hook event count** — 13 → 16 in HOOKS.md (added ConfigChange, WorktreeCreate, WorktreeRemove)
- **Agent Teams pricing corrected** — Opus $5/$25 (was $15/$75), Haiku $1/$5 (was $0.25/$1.25), Sonnet 4.5 → Sonnet 4.6
- **SECURITY.md** — supported versions updated to 7.22.x/7.21.x, minimum recommended version 2.1.38 → 2.1.51

## [7.21.0] - 2026-02-20

### Added

- **Full infrastructure install support** — all 8 infrastructure technologies (Docker, Coolify, Kubernetes, OpenTofu, Ansible, Hcloud, PgBouncer, FrankenPHP) now fully integrated in `install-from-config.sh` with generalized infra handling and `claude-projects.sh` available techs list
- **Complete technology catalog in example** — `claude-projects.yaml.example` updated with all 18 technologies organized by category (App/Infra/Other)

### Fixed

- **RTK multi-account profiles** — `install-rtk.sh` now respects `CLAUDE_CONFIG_DIR` environment variable, enabling RTK hook installation per profile in multi-account setups

## [7.20.0] - 2026-02-20

### Added

- **FrankenPHP infrastructure** — 5 agents, 5 commands, install script, 5 languages
- **PgBouncer infrastructure** — 5 agents, 5 commands, install script, 5 languages
- **Kubernetes infrastructure** — 5 agents, 5 commands, install script, 5 languages
- **OpenTofu infrastructure** — 5 agents, 5 commands, install script, 5 languages
- **Ansible infrastructure** — 5 agents, 5 commands, install script, 5 languages
- **Hcloud infrastructure** — 5 agents, 5 commands, install script, 5 languages
- **12 project management commands** — `/project:burndown`, `/project:checkpoint`, `/project:coverage-map`, `/project:critical-path`, `/project:dependencies`, `/project:gap-analysis`, `/project:generate-constitution`, `/project:metrics`, `/project:reverse-prd`, `/project:reverse-stories`, `/project:scan`, `/project:trace` (5 languages each)
- **Spec alignment gate** — `/gate:validate-alignment` command + `spec-alignment-gate.yaml` with 85% threshold and 6 weighted criteria (5 languages)
- **Constitution template** — project governance template `constitution.md` (5 languages)
- **BMAD metrics** — `.bmad/metrics/` directory for sprint velocity and burndown tracking
- **RTK integration** — Rust Token Killer install script, i18n, BATS tests, CLI registry, `/common:setup-rtk` command. Reduces LLM token consumption by 60-90%
- **10 reviewer agents v2.0** — all reviewers (Angular, Vue.js, Laravel, React Native, PHP, C#, Symfony, React, Python, Flutter) propagated to 5 languages with scoring /100 and decision trees

### Changed

- **Infrastructure expanded** — from 2 stacks (Docker, Coolify) to 8 (+ Kubernetes, OpenTofu, Ansible, Hcloud, PgBouncer, FrankenPHP). Total tech stacks: 18
- **BMAD gates updated** — `prd-gate.yaml`, `sprint-ready-gate.yaml`, `story-gate.yaml` enhanced with improved validation criteria
- **Project templates updated** — `prd.md`, `tech-spec.md`, `user-story.md` improved across 5 languages
- **Sprint next-story command** — enhanced across 5 languages
- **Training materials** — updated to reflect 63 agents, 204 commands, 26 namespaces, 18 stacks
- **Documentation** — RTK added to INSTALLATION.md, CLI-REFERENCE.md, SCRIPTS-REFERENCE.md, FAQ.md, index.html

### Fixed

- **4 failing test suites** — fs mock and `process.exitCode` issues in installer, check, ralph, and interactive tests
- **Command counts corrected** — propagated accurate counts across all documentation surfaces
- **Coolify missing from index.html** — added to landing page with correct i18n translations
- **Context essentials stale** — updated from 33/161/20 to 63/204/26 (agents/commands/namespaces)

## [7.19.0] - 2026-02-19

### Added

- **Active hooks (dogfooding)** — `.claude/settings.json` with 6 hooks: security-block (Bash), protect-files (Edit/Write), auto-format (prettier PostToolUse), context-reinject (SessionStart compact). The project now practices what it preaches: "Hooks = requirements"
- **Context essentials** — `.claude/context-essentials.md` for automatic context re-injection after compaction (version, structure, conventions, test commands)
- **New hook templates** — `quality-gate.json` (blocks git commit if tests fail) and `block-dangerous-commands.json` (blocks rm -rf /, sudo, chmod 777) in `.claude/templates/hooks/`
- **Agent validation tests** — 3 new tests: all agents must have `model:` field, Tier 1 reviewers must use sonnet, all reviewers must have scoring system (/100 or points)
- **CONTRIBUTING quick navigation** — table at top linking to common contributor paths (add stack, improve reviewer, fix bug, add translations, write skill)

### Changed

- **6 reviewer agents upgraded to v2.0** — angular, vuejs, laravel, reactnative, php, csharp reviewers rewritten with: model sonnet, scoring /100 in 4 categories, decision trees (CRITIQUE/MAJEUR/MINEUR), 5-phase audit methodology, structured report template, French language, tech-specific 2026 patterns
- **csharp-reviewer now has frontmatter** — was the only agent missing YAML frontmatter; now fully compliant with model: sonnet
- **CONTRIBUTING /tmp/ paths fixed** — all `/tmp/test-project` references replaced with `./test-output/` (project convention: no /tmp/ storage)
- **KNOWN_NO_FRONTMATTER emptied** — removed csharp-reviewer.md from exclusion list in agent tests

## [7.18.0] - 2026-02-19

### Added

- **Technology tier system** — formalized 3-tier model (core/supported/community) in tech-registry with `tier` field and `getTechsByTier()` helper. Tier 1 (core): Symfony, React, Python, Flutter. Tier 2 (supported): React Native, PHP. Tier 3 (community): C#, Angular, Laravel, Vue.js
- **Content validation tests** — new `tests/content/` suite validating agents (YAML frontmatter, required fields, model whitelist, skill references), commands (frontmatter, namespace consistency), and skills (SKILL.md + REFERENCE.md presence, format). Added `test:content` script
- **Skills publishing guide** — `docs/SKILLS-PUBLISHING.md` with distribution methods, publishing checklist, and attribution guidelines. Standalone `README.md` added to 4 pilot skills (solid-principles, testing, security, git-workflow)
- **Technologies documentation** — `docs/TECHNOLOGIES.md` with tier breakdown, maturity criteria, and upgrade paths
- **Competitive analysis** — `docs/COMPETITIVE-ANALYSIS.md` benchmarking against cursor-rules-cli, 10xrules, awesome-cursorrules, and others

### Changed

- **Reviewer agents differentiated** — 4 Tier 1 reviewers (React, Symfony, Python, Flutter) rewritten with deep tech-specific decision trees, unique scoring breakdowns, and tech-specific skills. Model upgraded from haiku to sonnet
- **README simplified** — 611 → 205 lines with progressive disclosure (install-first hero, key commands, doc links)
- **QUICKSTART rewritten** — restructured as a 10-minute journey with checkpoints and expected output at each step
- **CONTRIBUTING updated** — added Technology Tiers section with tier requirements table, upgrade guide, and community contribution template
- **Skill frontmatter improved** — broadened triggers and updated descriptions for solid-principles, testing, security, git-workflow

### Fixed

- **Broken symlink handling** — skills test now uses `lstatSync` to skip broken symlinks (e.g. `remotion-best-practices`)

## [7.17.1] - 2026-02-19

### Changed

- **README** — updated What's New section for v7.17

## [7.17.0] - 2026-02-19

### Added

- **LSP plugin documentation** — documented Claude Code LSP plugins for all 10 technology stacks: PHP/Symfony/Laravel (Intelephense), Python (Pyright), React/Angular/Vue/RN (vtsls), Flutter (Dart analyzer), C#/.NET (csharp-ls). Added sections in tooling references, CLAUDE.md, INDEX.md, PREREQUISITES.md, MCP.md (LSP vs MCP comparison), and TECHNOLOGIES.md

## [7.16.0] - 2026-02-19

### Added

- **Claude Code 2.1.46-2.1.47 compatibility** — MCP connectors from claude.ai, macOS orphan process fix, VS Code Plan Preview auto-updates, `last_assistant_message` in Stop/SubagentStop hooks, `added_dirs` in statusline JSON, `chat:newline` keybinding for multi-line input
- **Performance improvements** — ~500ms faster startup (deferred SessionStart hooks), `@` file mention pre-warming and session caching, O(n²) memory fix for long sessions
- **Resume & navigation** — `/rename` updates terminal tab title, resume picker shows 50 sessions (up from 10), Shift+Down wrapping for teammate navigation, custom `/rename` titles preserved
- **45+ bug fixes** — FileWriteTool trailing blank lines, Unicode curly quotes corruption (#26141), parallel write resilience, large sessions >16KB in /resume (#25721), Windows terminal rendering, background agents final response (#26012), agents/skills in git worktrees (#25816), plan mode after compaction (#26061), PDF compaction, CJK wide character alignment

### Changed

- **Minimum Claude Code version** — bumped from 2.1.45 to 2.1.47
- **README What's New** — updated to v7.16 highlights

## [7.15.0] - 2026-02-18

### Added

- **Context management rule** — new `12-context-management.md` (5 languages) covering Anthropic's #1 best practice: context window as THE critical resource, `/clear` usage, sub-agent delegation, verification loops (2-3x quality), Plan Mode guidance, token tracking thresholds
- **MCP & Plugin security** — updated `11-security.md` (6 files, 5 languages) with Snyk 2026 findings (76 malicious payloads in public MCP registries), vetting checklist, PreToolUse hook enforcement, CLAUDE.md vs Hooks distinction
- **Hook templates** — 4 ready-to-use templates in `.claude/templates/hooks/`: auto-format (PostToolUse), protect-files (PreToolUse), context-reinject (SessionStart compact), security-block (PreToolUse Bash)
- **Parallel worktrees skill** — new `/parallel-worktrees` skill documenting Boris Cherny's productivity pattern for concurrent Claude sessions (writer/reviewer workflow)
- **Best Practices section** — CLAUDE.md updated with MCP Tool Search (46.9% context reduction), adaptive thinking guidance (low/medium/high/max), hooks enforcement references
- **Context Management Best Practices** — new section in COMMANDS.md with thresholds, hooks vs instructions comparison

### Changed

- **README What's New** — updated to v7.14 highlights
- **Skill count** — 36 → 37 (added parallel-worktrees)

## [7.14.0] - 2026-02-18

### Added

- **Documentation update** — Plan Mode Classification section in COMMANDS.md, updated README What's New to v7.13, enriched training materials with Plan Mode guidance (MANDATORY/RECOMMENDED/CONDITIONAL), updated all training docs versions to 2.1.45/7.13.0

## [7.13.0] - 2026-02-18

### Added

- **Claude Code 2.1.42-2.1.45 compatibility** — resume title fix, structured outputs header, auth token refresh, plugin hot-reload/backup, memory improvements, spinnerTipsOverride, plugin directory config, Agent SDK rate limiting
- **Claude Sonnet 4.6 support** — new model (`claude-sonnet-4-6`, $3/$15/M, 200K/1M context, near-Opus coding performance)
- **Plan Mode guidance** — added Plan Mode sections to all 543 command files across 5 languages (en, fr, es, de, pt), classifying each command as MANDATORY (22 commands — code generation, implementation, QA), RECOMMENDED (6 commands — architecture decisions, design, planning), or CONDITIONAL (51 commands — analysis, audits, checks activated automatically based on scope)

### Fixed

- **Cost-estimator pricing** — corrected Opus from $15/$75 (Opus 4.1) to $5/$25 (Opus 4.6), Haiku from $0.25/$1.25 (Haiku 3) to $1/$5 (Haiku 4.5)

### Changed

- **Minimum Claude Code version** — bumped from 2.1.41 to 2.1.45

## [7.12.0] - 2026-02-18

### Added

- **Playwright E2E tests** — 119 tests covering all 89 pages (5 locales), landing page, navigation, search, accessibility (axe-core WCAG 2.1 AA), and 404 page
- **CI E2E test job** — Playwright runs between build and deploy in docs workflow, blocking deploy on test failure

### Fixed

- **Accessibility** — added `<main>` landmark, `aria-label` on language selects and GitHub links, `aria-hidden` on decorative SVGs, semantic `<dl>` for stats grid
- **Performance** — removed unused Tailwind CDN and Lucide CDN scripts from landing page
- **Responsive mobile layout** — proper mobile styles for landing page grid and navigation

## [7.11.0] - 2026-02-13

### Added

- **Agent Teams optimization** — reduce token overhead from ~30% to ~15-20% via lean context loading (task-type-specific tokens per worker: audit=4K, sprint=5K, security=3.5K, delivery=5.5K) and adaptive coordination overhead (5% + 3.5%/worker replacing flat 15%)
- **Fast Mode blocking guard** — all 4 team commands display 6x cost comparison dashboard and require explicit confirmation before proceeding in Fast Mode
- **Budget guard (`--max-cost`)** — abort team execution when estimated parallel cost exceeds user-specified dollar threshold
- **Structured spawn templates** — rich TaskCreate context per worker type (project, tech, reference, checks, output schema) for higher quality first-pass results
- **Context compaction mitigation** — leader re-reads TaskList every 5 completions (bug #23620); delivery re-reads phase-handoff.yaml at Phase 2 start
- **Per-task timeout baselines** — 1.5x estimated duration per task type in ralph-teams-adapter (audit=135s, sprint=1350s, security=180s, delivery=1800s)
- **Auto-size recommendation** — `recommend_team_size()` in cost-estimator for optimal worker count
- **Sub-agents vs Agent Teams decision matrix** — comparison table and concrete examples in sub-agents-patterns.md
- **138 bats tests** — cost-estimator (42), cost-dashboard (24), ralph-teams-adapter (27), compatibility-check (23), result-aggregator (22)

### Changed

- **Delivery Phase 1 Reviewer** — model changed from sonnet to haiku (-15% Phase 1 cost)
- **Polling cadence** — standardized across all team commands (30s, backoff to 60s after 3 idle polls)
- **Message verbosity** — worker completion messages capped at <50 tokens across all team commands
- **i18n** — all changes mirrored across 5 languages (en, fr, es, de, pt) for 4 team commands

## [7.10.2] - 2026-02-13

### Changed

- **Claude Code compatibility** — document v2.1.39 and v2.1.41 features (nested session guard, auth CLI commands, Windows ARM64, /rename auto-generation, Agent Teams cloud provider fix, OTel fast mode tracing, @-mention anchor fix, Agent SDK & plan mode fixes); bump minimum version from 2.1.38 to 2.1.41

## [7.10.1] - 2026-02-13

### Fixed

- **Status line locale bug** — force `LC_NUMERIC=C` in `statusline.sh` for locale-safe numeric formatting; `printf "%.2f"` failed on non-English locales (e.g. French) where the decimal separator is a comma, causing cost to display as `$0,00` instead of `$0.50`

## [7.10.0] - 2026-02-13

### Added

- **Status Line v2.0** — fixed critical `settings.json` format (`"type": "command"` instead of `"enabled"`/`"script"`), native `context_window.used_percentage`, single jq call (7→1), cross-platform `stat`, git cache (5s TTL), 13 element toggles, agent name, vim mode, burn rate, lines changed, progress bar styles (`percentage`/`bar`/`both`), compact/detailed modes, `--version`/`--help` flags
- **27 bats tests** for status line (`Tools/StatusLine/tests/statusline.bats`)
- **`test-statusline` Makefile target** — runs status line tests via Docker

### Changed

- **Status line README** — rewritten in English with full v2.0 documentation
- **`statusline.conf.example`** — expanded with all new options (toggles, bar style, display mode, git cache TTL)
- **Docs** — fixed `settings.json` format in `docs/guides/{en,fr}/05-tools-reference.md` and `06-troubleshooting.md`

## [7.9.0] - 2026-02-13

### Added

- **Multi-account `doctor` command** — checks profile permissions, .mode file, symlink validity, credentials JSON, shell aliases, and orphan alias detection
- **`--json` flag** — machine-readable JSON output for `list` and `--version`, enabling scripting and pipeline integration
- **Standardized exit codes** — `0` (OK), `1` (error), `2` (usage), `3` (not found), `4` (missing dep)
- **Shell completions** — bash and zsh tab-completion for commands and profile names (`completions/`)
- **`.claude-profile` per project** — `ccsp` reads this file for automatic profile switching by directory
- **`CLAUDE_PROFILE_NAME` export** — `ccsp()` exports the active profile name for shell prompt integration (PS1, Starship)
- **23 bats tests** — comprehensive test suite for version, CRUD, exit codes, JSON output, doctor (`tests/claude-accounts.bats`)
- **Makefile targets** — `install-completions` (bash/zsh) and `test-tools` (bats via Docker)
- **29 i18n keys** across 5 languages (en/fr/es/de/pt) — doctor, permissions warning, backup, delete confirmation, JSON output

### Changed

- **Profile directory permissions** — `chmod 0700` enforced on creation (`add`, `migrate`) and `ensure_profiles_dir`; warning displayed in `list` if permissions are too open
- **Signal handling** — `trap _cleanup EXIT` with `_TMP_FILES` tracking for safe Ctrl+C cleanup
- **Profile validation** — `validate_profile()` guard added to `run` and `auth` CLI commands; returns exit code 3 for missing profiles
- **CLI `rm` i18n** — hardcoded English strings replaced with i18n keys (`MSG_CONFIRM_DELETE`, `MSG_BACKUP_CREATED`)
- **Interactive menu** — doctor added as option 8, help moved to option 9

## [7.8.0] - 2026-02-12

### Added

- **Coolify infrastructure technology** — 4 agents (`@coolify-architect`, `@coolify-deployment`, `@coolify-debug`, `@coolify-monitoring`), 5 commands (`/coolify:setup`, `/coolify:deploy`, `/coolify:debug`, `/coolify:backup`, `/coolify:optimize`), install script, full i18n (en/fr/es/de/pt) — 46 new files
- **`install-coolify` Makefile target** — standalone Coolify installation; `install-infra` now installs both Docker and Coolify
- **Coolify in tech registry** — CLI namespace, help text, and `INSTALLABLE_TECHS` exclusion (infra, not dev tech)

### Changed

- **Counter updates** — commands 155→160, agents 29→33, namespaces 19→20 across CLAUDE.md, README.md, docs/index.html (stats grid + i18n), COMMANDS.md, COMMANDS-FULL-REFERENCE.md, AGENTS.md
- **README.md** — added Coolify to AI Agents description
- **docs/AGENTS.md** — added Coolify/Infrastructure Agents section (4 agents)

## [7.7.2] - 2026-02-12

### Fixed

- **Command count** — reverted erroneous 156→155 (verified: 117 Dev + 33 Project + 5 Docker = 155)
- **docs/index.html** — 9 stale `v5.8.0` version badges updated to `v7.7.1`; template count 23→21; checklist count 9→10
- **README.md** — "What's New" updated to v7.7; template count 33→21; checklist count 21→10
- **docs/AGENTS.md** — removed phantom BMAD agent section (39→29 actual); cleaned up ASC mode documentation

## [7.7.1] - 2026-02-12

### Fixed

- **docs/index.html** — copyright symbol `&copy;` rendered as literal text in i18n translations; replaced with Unicode `©` in all 5 JS translation strings (the i18n system uses `textContent` for non-HTML strings)

## [7.7.0] - 2026-02-12

### Changed

- **docs/index.html** — fixed all outdated counters in presentation page: agents 40→29, commands 130+→155, skills 249→36, templates 25→23, checklists 21→9; updated feature cards and all 5 i18n translations (EN/FR/ES/DE/PT)
- **README.md** — "What's New" updated to v7.6 features; agent count 28→29; skills count 50→36
- **CLAUDE.md** — agent count 28→29 in header description
- **docs/AGENTS.md** — added note explaining Docker and Project agent bundling
- **docs/FAQ.md** — Node.js 18+→20+
- **docs/PREREQUISITES.md** — Claude Code minimum version 2.1.0→2.1.38
- **docs/QUICKSTART.md** — Node.js 18+→20+
- **i18n docs** — PREREQUISITES and QUICKSTART updated for DE/ES/FR/PT (Node.js 20+, Claude Code 2.1.38); FR FAQ Node.js 20+

### Added

- **.github/PULL_REQUEST_TEMPLATE.md** — standardized PR template

## [7.6.1] - 2026-02-12

### Fixed

- **CLI `update` command** — argument order was wrong (`script TARGET LANG --force` instead of `script --lang=LANG --force TARGET`), causing all install scripts to reject the lang parameter
- **2026 feature references copy** — added same-directory guard in `install-tech-common.sh` to prevent `cp` errors when source and destination resolve to the same path

## [7.6.0] - 2026-02-12

### Changed

- **README.md** — "What's New" updated to v7.5 features; fixed namespace count (20→19); added `/team:` and `/uiux:` to Command Namespaces (17→19); Docker commands 4→5
- **COMMANDS.md** — added `/docker:optimize` to Docker detailed section (was in summary but missing from details)
- **CONTRIBUTING.md** — Node.js 18+→20+; added shellcheck to prerequisites; added `lint:shell` and `lint:i18n` to Running Tests
- **PREREQUISITES.md** — Node.js 18→20 (lines 9 and 229)
- **vitest.config.mjs** — raised coverage thresholds from 80/85/70/80 to 90/90/90/90 (actual coverage: 96/93/96/96)

## [7.5.0] - 2026-02-12

### Added

- **Doctor yq check** — `doctor` command now verifies `yq` availability (required for YAML config per PREREQUISITES.md)
- **CLI-REFERENCE.md** — added `check`, `list`, `doctor`, `update` command sections with usage, options, and examples
- 5 new doctor tests (yq OK/missing, unreadable scripts dir, empty i18n, non-executable scripts, real tryExec)
- 2 new update tests (skip when install script missing, all-scripts-fail path)

### Changed

- **README.md** — "What's New" updated to v7.4 features (list/doctor/update, 20 namespaces, fs-utils)
- **QUICKSTART.md** — verification section now recommends `check` and `doctor` commands instead of `ls -la`
- **CLAUDE.md** — fixed namespace count: "16+" → "19 namespaces"
- **doctor.js** — renumbered check comments (5→yq, 6→structure, 7→scripts, 8→i18n)
- Test count: 511 → 519 tests
- Coverage: doctor.js 86% → 96%, update.js 91% → 100%

## [7.4.0] - 2026-02-12

### Added

- **CLI `list` command** — detailed listing of installed claude-craft components (`npx @the-bearded-bear/claude-craft list [dir]`)
- **CLI `doctor` command** — environment diagnostics & installation health check (`npx @the-bearded-bear/claude-craft doctor [dir]`)
- **CLI `update` command** — re-run install scripts to refresh an existing installation (`npx @the-bearded-bear/claude-craft update [dir] [--lang=XX] [--tech=NAME]`)
- `cli/lib/fs-utils.js` — shared `countFiles` / `listDirs` utilities extracted from check.js
- `cli/lib/list.js`, `cli/lib/doctor.js`, `cli/lib/update.js` — new command modules
- `tests/cli/list.test.mjs` — 4 tests for list command
- `tests/cli/doctor.test.mjs` — 8 tests for doctor command
- `tests/cli/update.test.mjs` — 7 tests for update command
- `tests/cli/fs-utils.test.mjs` — 6 tests for shared fs utilities
- 2 detect-project tests for Python/Docker catch path coverage
- 4 index.js tests for flattenCodebase, constructor, detectProject, parseArgs delegation

### Changed

- **check.js**: Refactored to import `countFiles` / `listDirs` from `fs-utils.js` (DRY)
- **help.js**: Added 3 missing namespace entries (python, reactnative, php) — now 20 namespaces; added list, doctor, update to Commands section
- **README.md**: Removed phantom `/pm:` and `/arch:` namespaces; replaced stale `/common:recette*` with `/qa:*`
- **index.js**: Wired 3 new commands (list, doctor, update)
- Test count: 480 → 511 tests

## [7.3.0] - 2026-02-12

### Added

- **CLI `check` command** — verify claude-craft installation in a project directory (`npx @the-bearded-bear/claude-craft check [dir]`)
- `cli/lib/check.js` — new module: scans `.claude/` for commands, agents, references, skills with colorized summary
- `tests/cli/check.test.mjs` — 6 tests for check command (empty dir, full structure, partial, multi-namespace, tech detection)
- 4 shell-ui integration tests for cross-directory sourcing (Infra/, Project/, tcl-common guard)
- 4 detect-project tests (unreadable dir, debug logging, all 10 techs, 2-tech complexity)

### Changed

- **install-from-config.sh**: Sources `shell-ui.sh` instead of defining local colors/logging; `log_*`/`print_header`/`print_section` are backward-compat aliases
- **install-infra-rules.sh**: Sources `shell-ui.sh` instead of defining local colors/logging; `log_*` are backward-compat aliases
- **install-project-commands.sh**: Sources `shell-ui.sh`; emoji echo replaced with `ui_box`/`ui_info`/`ui_success`
- **check-prerequisites.sh**: Sources `shell-ui.sh`; header uses `ui_box`, checks use `ui_check_ok`/`ui_check_fail`/`ui_check_warn`
- **tcl-common.sh**: Added shell-ui.sh guard — auto-sources when `ui_info` not already defined
- **help.js**: Added `--version, -v` to Options display; added `check` to Commands list
- **README.md**: Updated "What's New" to v7.3; removed stale `(v3.2+)` suffix; fixed Migration Guide link (v3.0 → v7.0)
- **FAQ.md**: Fixed stale `.claude/rules/00-project-context.md` path → `.claude/CLAUDE.md`
- Zero duplicate color/logging definitions across all install scripts
- Test count: 466 → 480 tests

## [7.2.0] - 2026-02-12

### Added

- `detect-project.js`: Detection for 5 missing techs — Angular (`@angular/core`), Vue.js (`vue`), C#/.NET (`.csproj`/`.sln`), Laravel (`laravel/framework`), generic PHP (composer.json fallback)
- `help.js`: "Available Namespaces" section listing all 16 v7.0 namespaces with descriptions
- `tests/cli/shell-ui.test.mjs` — 16 tests verifying all `ui_*` functions, color variables, and output format
- `tests/cli/detect-project.test.mjs` — expanded from 14 to 30 tests covering all 10 tech detections, malformed JSON, multi-tech, edge cases
- `tests/cli/help.test.mjs` — expanded from 3 to 8 tests covering namespaces, options, examples
- `tests/cli/tech-registry.test.mjs` — 2 additional consistency tests (derived keys, displayName match)
- `tests/cli/cli-class.test.mjs` — readline lifecycle test

### Changed

- **constants.js**: `TECHNOLOGIES` now derived from `tech-registry.js` SSOT (DRY consolidation)
- **detect-project.js**: Refined Symfony detection to check for `symfony/` packages; added Laravel/generic PHP distinction
- **install-tech-common.sh**: Sources `shell-ui.sh` instead of defining local colors/logging; `log_*` are backward-compat aliases
- **install-common-rules.sh**: Sources `shell-ui.sh` instead of defining local colors/logging; `print_header` uses `ui_box`
- **check-config.sh**: Sources `shell-ui.sh` instead of defining local colors; `log_*` delegate to `ui_check_*`, `print_header` uses `ui_header`
- **Makefile `list-commands`**: Now includes Docker, Workflow, Team, QA, UIUX namespaces; checks both lang and base directories
- Test count: 430+ → 466 tests
- Coverage: detect-project.js → 93%, help.js → 100%, constants.js → 100%

## [7.1.0] - 2026-02-12

### Added

- `cli/lib/tech-registry.js` — Single Source of Truth for all 11 technology stacks (name, namespace, i18n dir, install script, version)
- `Dev/scripts/lib/shell-ui.sh` — Shared UI library for shell scripts (colors, logging, headers, progress indicators)
- `tests/cli/installer-interactive.test.mjs` — 10 tests for interactive install wizard (directory creation, language selection, tech selection, cancel flow)
- `tests/cli/tech-registry.test.mjs` — 11 consistency tests verifying registry matches constants.js, i18n directories, install scripts, and plugin.json
- `tests/scripts/install-dry-run.test.mjs` — 6 integration tests for install dry-run (file counts, namespace validation, no-side-effects)
- Ralph DoD failure modes and timeout documentation in `ralph-run.md`

### Changed

- **README.md**: Fixed skills count from 249 to 50 (actual unique skills)
- **CONTRIBUTING.md**: Added all 10 technologies to test loop (was missing csharp, reactnative, vuejs, laravel, php)
- **vitest.config.mjs**: Raised coverage thresholds — statements 75→80%, branches 80→85%, functions 65→70%, lines 75→80%
- **CLAUDE.md.template**: Updated to v7.0 structure — `rules/` → `references/`, `commands/` now namespaced
- **check-config.sh**: Refactored from 5 hardcoded check functions to data-driven `TECH_REGISTRY` array supporting all 10 technologies
- **plugin.json**: Version bump from 6.2.0 to 7.1.0
- **cli-class.test.mjs**: Added 5 tests for language, tech, path options and flatten command
- Test count: 393 → 430+ tests
- Coverage: statements 81% → 92%+, installer.js 51% → 97%

---

## [7.0.0] - 2026-02-12

### BREAKING CHANGES

- `/common:` reduced from 38 to 12 commands — 26 commands moved to dedicated namespaces
- 9 workflow commands moved: `/common:workflow-*` → `/workflow:*`, `/common:sprint-retro` → `/workflow:retro`, `/common:sprint-review` → `/workflow:review`, `/common:sprint-start` → `/workflow:start`
- 4 team commands moved: `/common:team-*` → `/team:*`
- 6 QA commands moved: `/common:recette*` → `/qa:*`, `/common:fix-bug-tdd` → `/qa:tdd`
- 7 UI/UX commands moved: `/common:uiux-*` → `/uiux:*`, `/common:a11y-*` → `/uiux:a11y-*`, `/common:ui-design-tokens` → `/uiux:design-tokens`, `/common:ux-user-flow` → `/uiux:user-flow`
- 1 Docker command moved: `/common:docker-optimize` → `/docker:optimize`
- 5 sprint commands moved: `/project:sprint-*` → `/sprint:*`
- 6 gate commands moved: `/project:gate-*` → `/gate:*`
- 4 project commands renamed: `/project:project-run-sprint` → `/project:run-sprint`, `/project:project-run-epic` → `/project:run-epic`, `/project:project-run-queue` → `/project:run-queue`, `/project:project-batch-status` → `/project:batch-status`

### Added

- `docs/MIGRATION-v7.md` — complete migration guide with 41-entry mapping table
- `tests/scripts/namespace-integrity.test.mjs` — 5 tests for residual patterns, i18n parity, command counts
- New i18n directories: `Workflow/`, `Team/`, `QA/`, `UIUX/` under `Dev/i18n/{lang}/`
- New i18n directories: `Sprint/`, `Gate/` under `Project/i18n/{lang}/`

### Changed

- `/common:` namespace: 38 → 12 commands
- `/project:` namespace: 33 → 22 commands
- `/workflow:` namespace: 6 → 9 commands (added retro, review, start)
- `/docker:` namespace: 4 → 5 commands (added optimize)
- `/sprint:` namespace: 4 → 5 commands (added dev)
- New namespaces: `/team:` (4), `/qa:` (6), `/uiux:` (7)
- Total command count unchanged: 155
- Install scripts updated: `install-common-rules.sh`, `install-project-commands.sh`, `tcl-common.sh`
- All cross-references updated across Dev/, Project/, Infra/, docs/, .claude/

---

## [6.2.0] - 2026-02-12

### Removed

- `/sprint:bmad-status` command — alias stub for `/sprint:status --bmad` (5 i18n files)
- `/project:validate-backlog` command — alias stub for `/gate:validate-backlog --no-gate` (5 i18n files)
- `/project:move-story` command — merged into `/sprint:transition` (5 i18n files)
- BMAD v6 phantom agents section from documentation — these 10 roles (bmad-master, pm, ba, architect, po, sm, dev, qa, qa-recette, ux) are personas in workflow/sprint commands, not standalone agent files

### Changed

- `/sprint:transition` now supports sprint assignment (`sprint-N`) and task cascade behavior (merged from move-story)
- Agent count: 39 → 28 (removed 10 phantom BMAD agent entries from docs; php-reviewer has no agent file)
- Command count: 158 → 155 (removed 3 redundant commands)
- QA Recette namespace: documented as `/common:recette*` instead of `/qa:recette*` to match actual installation
- Updated COMMANDS-FULL-REFERENCE.md command count from "132+" to "155"

---

## [6.1.1] - 2026-02-12

### Added

- `/qa:recette-status` command — show session status and progress (5 languages)
- `/qa:recette-regression` command — view and manage regression test registry (5 languages)
- `/qa:recette-report` command — generate reports from session data in MD/HTML/JSON (5 languages)

### Changed

- Command count: 155 → 158 (3 new QA Recette commands)
- Removed `[PLANNED]` tags from QA Recette commands in documentation
- Updated COMMANDS.md, COMMANDS-FULL-REFERENCE.md, INDEX.md with new command details

### Fixed

- Widened `execSync` timeouts in 4 test files to eliminate flaky ETIMEDOUT failures under load
- Restored OIDC npm publishing (broken since v5.9.2 Phase 2 remediation)
- Fixed `workflow_dispatch` generating `-next` suffix instead of using package.json version directly

---

## [6.0.0] - 2026-02-11

### BREAKING

- **Removed** `/common:full-audit` command — use `/common:team-audit --sequential` instead
- **Removed** `/common:ralph-sprint` command — use `/common:team-sprint --ralph-mode` instead
- **Removed** `@workflow-orchestrator` agent — use `/workflow:*` commands directly

### Added

- `docs/MIGRATION-v6.md` — upgrade guide from v5.x to v6.0

### Removed

- `docs/AUTONOMOUS-SPRINT.md` — ASC-specific documentation (functionality now in team-sprint)
- 15 i18n files for removed commands/agent (full-audit, ralph-sprint, workflow-orchestrator)

### Changed

- Agent count: 40 → 39 (removed workflow-orchestrator)
- Command count: 157 → 155 (removed full-audit and ralph-sprint)
- Updated all documentation references to use replacement commands

---

## [5.19.0] - 2026-02-11

### Added
- **DOC-13**: Automated i18n parity check script (`scripts/verify-i18n-parity.sh`) with `npm run lint:i18n` alias — compares file counts across all 5 languages in `Dev/i18n/` and `docs/guides/`

### Fixed
- **SEC-16**: Upgraded 5 Ralph scripts from `set -e` to `set -euo pipefail` (ralph.sh, pre-tool-context.sh, session-restore.sh, status-injector.sh, stop-dod-gate.sh) with uninitialized variable fixes

### Changed
- **DOC-5**: Closed as "by design" — i18n asymmetry is intentional per I18N-STATUS.md (Dev/i18n and docs/guides at full parity, docs/*.md English-only with opt-in community translations)

---

## [5.18.0] - 2026-02-11

### Added
- **SEC-13**: 46 CLI injection security tests (shell metacharacters, command substitution, null bytes, path traversal, prototype pollution, oversized inputs)

### Fixed
- **SEC-1**: Removed unnecessary `$(echo ...)` subshell from tilde expansion in `install-from-config.sh` (3 occurrences) and `check-config.sh` (1 occurrence) — direct variable assignment `"${root/#\~/$HOME}"` eliminates any residual injection surface

### Changed
- Confirmed CICD-8, CICD-13, CICD-15/CQ-15 already resolved in prior phases (CI permissions scoped, node_modules gitignored, engines.node >=20.0.0)

---

## [5.17.0] - 2026-02-11

### Added
- **TEST-20**: 1 unit test for ralph.js synchronous spawn error path (lines 92-95)
- **CICD-21**: Raised coverage thresholds (lines 50→75%, branches 40→80%, functions 50→65%)

### Fixed
- **DOC-17**: Removed stale `migrate-project.sh` and `make migrate*` references from 10 doc files (README, CLI-REFERENCE, TROUBLESHOOTING, ARCHITECTURE, SCRIPTS-REFERENCE, MIGRATION-v4, FAQ, MAKEFILE-REFERENCE, fr/FAQ, fr/CLI-REFERENCE)
- **DOC-18**: Updated README "What's New" to v5.17

---

## [5.16.0] - 2026-02-11

### Added
- **TEST-19**: 3 unit tests for ralph.js event handlers (close code 0, close code 1, spawn error)
- **CQ-18**: Convenience scripts `test:watch` and `lint:fix` in package.json

### Fixed
- **DOC-15**: Fixed SKILLS.md — corrected skill counts (Flutter 10→8, React 8→6, ReactNative 11→9, Python 6→4), removed phantom `quality-tools`, updated total 58→50 unique
- **DOC-16**: Updated README "What's New" to v5.16
- **ARCH-17**: Removed 3 stale Makefile migrate targets referencing nonexistent `migrate-project.sh`

### Changed
- **CQ-17**: ESLint tightened with `no-shadow`, `object-shorthand`, `prefer-template` (warnings)

---

## [5.15.0] - 2026-02-11

### Added
- **TEST-17**: 8 unit tests for `ClaudeCraftCLI.run()` (version flags, validation errors, command dispatch)
- **TEST-18**: 3 unit tests for installer.js error handling (spawn failure, non-zero exit, missing script)
- **CICD-19**: Vale prose linter in CI pipeline
- **CICD-20**: Coverage thresholds in vitest config (50% lines, 40% branches)

### Fixed
- **DOC-12**: Fixed COMMANDS.md — namespace count table (7 wrong counts), added `/workflow:` (6), `/php:` (5), 3 missing commands
- **DOC-13**: Fixed CONTRIBUTING.md stale directory structure (now references `Dev/i18n/{lang}/{Tech}/`)
- **DOC-14**: Updated README "What's New" from v5.13 to v5.15

---

## [5.14.0] - 2026-02-11

### Added
- **TEST-16**: 4 unit tests for `ClaudeCraftCLI` class (constructor, delegates)
  - `cli/index.js` now exports class + guards auto-run for testability

### Changed
- **DOC-9**: Updated README project structure to reflect Phase 14 CLI refactoring (cli/lib/)
- **DOC-10**: Fixed ARCHITECTURE.md Mermaid diagram — added banner.js, help.js, installer.js, ralph.js
- **DOC-11**: Added missing `init`, `ralph`, `help` commands to CLI-REFERENCE.md
- **TEST-15**: Removed ~25 redundant tests from index.test.mjs (logic now tested in dedicated module files)
- **CQ-16**: Tightened ESLint rules (eqeqeq, no-var, prefer-const)

---

## [5.13.0] - 2026-02-11

### Added
- **TEST-14**: 15 unit tests for Phase 14 extracted CLI modules
  - banner.js (3), help.js (3), installer.js (4), ralph.js (5)
- **CICD-18**: Coverage reporting with `@vitest/coverage-v8`
  - New `test:coverage` script, v8 provider on cli/ modules

### Changed
- **CICD-17**: CI now enforces Prettier formatting (`format:check`)
- **CQ-15**: Fixed Prettier formatting violations in 7 CLI files
- **DOC-8**: Updated README "What's New" from v5.9 to v5.13
- **DOC-7**: Fixed bundles/README.md version (v3.0 → v5.13.0), removed ghost `bundle` CLI commands

---

## [5.12.0] - 2026-02-11

### Changed
- **ARCH-15**: Refactored CLI from 595-line monolith into 6 focused modules
  - Extracted `banner.js`, `help.js`, `installer.js`, `ralph.js` into `cli/lib/`
  - `cli/index.js` reduced to ~220-line thin orchestrator
- **ARCH-16**: Added `bundles/` (AI instruction bundles) to npm distribution

### Added
- **TEST-6**: 8 additional unit tests for `CodebaseFlattener` (cli/flattener.js)
  - Constructor defaults/custom options, flatten() end-to-end, printSummary()

---

## [5.11.0] - 2026-02-11

### Changed
- **ARCH-3**: Deduplicated i18n directory — extracted 114 language-agnostic files into `Dev/i18n/base/`
  - Removed 570 redundant file copies across 5 language directories (~17 MB saved)
  - Install scripts now use base+overlay resolution: shared files from `base/`, translations from `{lang}/`
  - New helpers: `copy_i18n_files()`, `copy_i18n_dir()`, `resolve_i18n_file()`, `i18n_dir_exists()` in install-tech-common.sh
  - Updated `get_source_dir()`, `verify_source_files()`, `copy_tech_references()`, `copy_base_references()` for base fallback
  - i18n file count: 2,035 → 1,584 (−22%)

### Added
- 26 new tests for i18n base overlay resolution (shell function unit tests + integration tests)

---

## [5.10.1] - 2026-02-11

### Fixed
- **SEC-9**: Fixed unsafe `xargs` without `-r` flag in pre-compact.sh
- **SEC-15**: Added shebang validation before `chmod +x` in hooks-generator.sh

### Added
- **TEST-12/13**: Additional unit tests for flattener output and CLI argument building
- **DOC-5**: i18n status documentation (`docs/I18N-STATUS.md`)
- **DOC-17a**: Architecture diagram (Mermaid) in `docs/ARCHITECTURE.md`
- **SEC-14**: Documented MCP template placeholder requirements

### Changed
- **ARCH-4**: Trimmed Makefile — removed CLI-redundant targets, added loop-based install-all (~390 lines)
- **SEC-17**: Updated `.npmignore` to exclude Ralph state directories from npm package
- **CICD-16**: Clarified version semantics in migration script

---

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
