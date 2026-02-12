# Quickstart - Claude Craft in 5 Minutes

Get up and running with Claude Craft in just 5 minutes!

---

## Prerequisites Check

Before starting, verify you have these tools installed:

```bash
# Check Node.js (18+ required)
node --version

# Check npm
npm --version

# Check yq (required for YAML config)
yq --version

# Check Docker (recommended)
docker --version
```

**Missing something?** See [Prerequisites Guide](PREREQUISITES.md) for installation instructions.

---

## Quick Verification Script

Run this to check all prerequisites at once:

```bash
# Download and run the check script
curl -sSL https://raw.githubusercontent.com/TheBeardedBearSAS/claude-craft/main/Dev/scripts/check-prerequisites.sh | bash

# Or if you've cloned the repo
./Dev/scripts/check-prerequisites.sh
```

---

## Installation

### Method 1: NPX (Recommended)

The fastest way to get started:

```bash
# Interactive wizard
npx @the-bearded-bear/claude-craft

# Or install directly to a project
npx @the-bearded-bear/claude-craft install ~/my-project --tech=symfony --lang=en
```

### Method 2: Clone + Makefile

```bash
# 1. Clone the repository
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# 2. Install to your project (choose your technology)
make install-symfony TARGET=~/my-project RULES_LANG=en
# Or: make install-flutter, make install-react, make install-python, etc.
```

---

## Your First Project in 3 Commands

```bash
# 1. Create a new project directory
mkdir ~/my-first-app && cd ~/my-first-app && git init

# 2. Install Claude Craft rules (example: Symfony + English)
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en

# 3. Start Claude Code
claude
```

That's it! You now have access to all Claude Craft features.

---

## Verify Installation

Use the built-in CLI commands to check your installation:

```bash
# Verify installation structure (commands, agents, skills, references)
npx @the-bearded-bear/claude-craft check ~/my-first-app

# Run environment diagnostics (Node.js, npm, git, yq, Claude Code)
npx @the-bearded-bear/claude-craft doctor ~/my-first-app
```

You can also manually inspect the directory:

```bash
ls -la ~/my-first-app/.claude/

# You should see:
# CLAUDE.md          - Main configuration
# INDEX.md           - Quick reference
# references/        - Full documentation
# agents/            - AI specialists
# commands/          - Slash commands
# skills/            - Best practices
```

---

## Try Your First Commands

In Claude Code, try these commands:

```
# Check your project architecture
/symfony:check-architecture

# Get a code review
@symfony-reviewer Review my src/ folder

# Generate a new entity with CRUD
/symfony:generate-crud Product
```

---

## What's Next?

| Task | Guide |
|------|-------|
| Understand the project structure | [Architecture Guide](ARCHITECTURE.md) |
| Create a complete feature | [Feature Development](guides/en/03-feature-development.md) |
| Set up BMAD project management | [BMAD Practical Guide](BMAD-PRACTICAL-GUIDE.md) |
| Run Claude in continuous loop | [Ralph Wiggum Guide](RALPH-GUIDE.md) |
| Fix a bug with TDD | [Bug Fixing Guide](guides/en/04-bug-fixing.md) |

---

## Available Technologies

Claude Craft supports 10 technology stacks:

| Technology | Install Command | Focus |
|------------|-----------------|-------|
| Symfony/PHP | `make install-symfony` | Clean Architecture, DDD, API Platform |
| Flutter/Dart | `make install-flutter` | BLoC, Riverpod, Material/Cupertino |
| React | `make install-react` | Hooks, State Management, A11y |
| React Native | `make install-reactnative` | Mobile, Navigation, Native Modules |
| Python | `make install-python` | FastAPI, async/await, Type Hints |
| Angular | `make install-angular` | Signals, Standalone, RxJS |
| C#/.NET | `make install-csharp` | Clean Architecture, CQRS, MediatR |
| Laravel | `make install-laravel` | Clean Architecture, Pest PHP |
| Vue.js | `make install-vuejs` | Composition API, Pinia, Vitest |
| PHP | `make install-php` | Clean Architecture, PSR-12, PHPStan |

---

## Need Help?

- **FAQ**: Common questions and answers → [FAQ.md](FAQ.md)
- **Troubleshooting**: Common errors and solutions → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Full Documentation**: All commands and agents → [COMMANDS-FULL-REFERENCE.md](COMMANDS-FULL-REFERENCE.md)
- **GitHub Issues**: [Report a bug](https://github.com/TheBeardedBearSAS/claude-craft/issues)

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────┐
│                    CLAUDE CRAFT CHEATSHEET                 │
├────────────────────────────────────────────────────────────┤
│ INSTALLATION                                               │
│   npx @the-bearded-bear/claude-craft install . --tech=X   │
│   make install-{tech} TARGET=~/project RULES_LANG=en      │
├────────────────────────────────────────────────────────────┤
│ COMMON COMMANDS                                            │
│   /common:pre-commit-check    Pre-commit validation        │
│   /team:audit          Multi-tech project audit     │
│   /workflow:init              Start workflow methodology   │
├────────────────────────────────────────────────────────────┤
│ USEFUL AGENTS                                              │
│   @tdd-coach                  TDD guidance                 │
│   @api-designer               API design help              │
│   @{tech}-reviewer            Code review for your tech    │
├────────────────────────────────────────────────────────────┤
│ NEED HELP?                                                 │
│   /help                       Claude Code built-in help    │
│   See docs/FAQ.md             Common questions             │
└────────────────────────────────────────────────────────────┘
```
