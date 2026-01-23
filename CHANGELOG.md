# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Updated to Claude Code 2.1.14 best practices

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
