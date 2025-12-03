# Changelog - Claude Craft

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-03

### Added

#### Core Framework
- Makefile for orchestrating all installations
- YAML-based configuration system for multi-project setups
- `install-from-config.sh` script for monorepo support

#### Common Components
- 7 transversal AI agents:
  - `api-designer` - REST/GraphQL API design
  - `database-architect` - Database optimization
  - `devops-engineer` - CI/CD and deployment
  - `performance-auditor` - Performance analysis
  - `refactoring-specialist` - Safe refactoring
  - `research-assistant` - Technical research
  - `tdd-coach` - Test-Driven Development
- 14 `/common:` commands for workflows
- 3 generic templates (PR, issues)
- 4 shared checklists

#### Symfony Support
- 21 rules covering Clean Architecture and DDD
- `symfony-reviewer` agent
- 10 `/symfony:` commands
- 9 templates (services, aggregates, events)
- 5 checklists

#### Flutter Support
- 13 rules for mobile development
- `flutter-reviewer` agent
- 10 `/flutter:` commands
- 5 templates (widgets, BLoC, tests)
- 4 checklists

#### Python Support
- 12 rules for backend development
- `python-reviewer` agent
- 10 `/python:` commands
- 2 templates
- 2 checklists

#### React Support
- 12 rules for frontend development
- `react-reviewer` agent
- 8 `/react:` commands
- 2 templates
- 2 checklists

#### React Native Support
- 12 rules for mobile development
- `reactnative-reviewer` agent
- 7 `/reactnative:` commands
- 4 templates
- 4 checklists

#### SCRUM Support
- Product Owner agent (CSPO)
- Tech Lead agent (CSM)
- 3 `/project:` commands for backlog management

#### Installation Options
- `--install` - Fresh installation
- `--update` - Update existing files
- `--force` - Overwrite all files
- `--dry-run` - Simulate without changes
- `--backup` - Create backup before changes
- `--interactive` - Guided installation

### Documentation
- README.md with quick start guide
- docs/INSTALLATION.md
- docs/CONFIGURATION.md
- docs/AGENTS.md
- docs/COMMANDS.md
- docs/TECHNOLOGIES.md
- CONTRIBUTING.md
- MIT LICENSE

---

## [Unreleased]

### Planned
- Vue.js support
- Angular support
- Go support
- Rust support
- Java/Spring support
