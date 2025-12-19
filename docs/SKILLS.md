# Skills Reference

Skills are the official Claude Code format for best practices and guidelines. They provide Claude with domain expertise to assist you more effectively.

## What are Skills?

Skills are structured knowledge modules that Claude Code loads to understand best practices for specific domains. Unlike simple rules, skills follow the official Claude Code format with:

- **Directory-based structure**: Each skill is a folder, not a single file
- **Two-file pattern**: `SKILL.md` (index) + `REFERENCE.md` (details)
- **Frontmatter metadata**: `name` and `description` fields for discovery
- **Rich documentation**: Comprehensive guidelines, examples, and checklists

## Skills vs Rules (Legacy)

| Aspect | Skills (New) | Rules (Legacy) |
|--------|--------------|----------------|
| Format | Directory with 2 files | Single file |
| Structure | SKILL.md + REFERENCE.md | All in one |
| Metadata | YAML frontmatter | Optional |
| Discovery | By `description` field | By filename |
| Depth | Comprehensive reference | Brief guidelines |
| Official | Yes (Claude Code format) | Deprecated |

> **Note**: Legacy rules in `.claude/rules/` are still supported for backward compatibility.

## Directory Structure

```
.claude/
└── skills/
    ├── architecture/
    │   ├── SKILL.md           # Index with frontmatter
    │   └── REFERENCE.md       # Detailed documentation
    ├── testing/
    │   ├── SKILL.md
    │   └── REFERENCE.md
    └── security/
        ├── SKILL.md
        └── REFERENCE.md
```

## Skill Format

### SKILL.md (Index File)

```markdown
---
name: testing
description: Testing - TDD/BDD principles. Use when writing tests or reviewing coverage.
---

# Testing - TDD/BDD Principles

This skill provides guidelines and best practices.

See @REFERENCE.md for detailed documentation.
```

**Frontmatter Fields:**
- `name` (required): Skill identifier, matches directory name
- `description` (required): Brief description + when to use this skill

### REFERENCE.md (Documentation File)

Contains comprehensive documentation:

- Overview and objectives
- Table of contents
- Detailed sections with examples
- Code snippets (language-agnostic or tech-specific)
- Diagrams (ASCII art for compatibility)
- Best practices and anti-patterns
- Checklists
- External resources

## Skills by Technology

### Common Skills (7)

Universal skills installed with all technology stacks:

| Skill | Description |
|-------|-------------|
| `solid-principles` | SOLID object-oriented design principles |
| `kiss-dry-yagni` | Code simplicity principles |
| `testing` | TDD/BDD testing methodology |
| `security` | Security best practices (OWASP) |
| `documentation` | Documentation standards |
| `git-workflow` | Git conventions and branching |
| `workflow-analysis` | Problem analysis methodology |

### Symfony Skills (16)

| Skill | Description |
|-------|-------------|
| `architecture-clean-ddd` | Clean Architecture + DDD + Hexagonal |
| `aggregates` | DDD aggregates design |
| `value-objects` | Immutable value objects |
| `domain-events` | Domain event patterns |
| `cqrs` | Command Query Responsibility Segregation |
| `ddd-patterns` | Domain-Driven Design patterns |
| `async` | Messenger async processing |
| `multitenant` | Multi-tenancy patterns |
| `doctrine-extensions` | Doctrine extensions usage |
| `coding-standards` | PHP/Symfony coding style |
| `quality-tools` | PHPStan, CS Fixer, Rector |
| `testing-symfony` | PHPUnit, Behat testing |
| `security-symfony` | Symfony security component |
| `performance` | Caching, optimization |
| `i18n` | Internationalization |
| `docker-hadolint` | Dockerfile linting |

### Flutter Skills (10)

| Skill | Description |
|-------|-------------|
| `architecture` | Clean Architecture for Flutter |
| `state-management` | BLoC, Riverpod, Provider |
| `coding-standards` | Dart/Flutter style guide |
| `quality-tools` | Analyzer, DCM, linting |
| `testing-flutter` | Widget, unit, integration tests |
| `security-flutter` | Mobile security patterns |
| `performance` | Widget optimization |
| `tooling` | DevTools, debugging |

### React Skills (8)

| Skill | Description |
|-------|-------------|
| `architecture` | Component architecture patterns |
| `coding-standards` | React/TypeScript style guide |
| `quality-tools` | ESLint, Prettier, TypeScript |
| `testing-react` | Jest, Testing Library, Playwright |
| `security-react` | XSS prevention, secure state |
| `tooling` | DevTools, bundlers |

### React Native Skills (11)

| Skill | Description |
|-------|-------------|
| `architecture` | Mobile app architecture |
| `state-management` | Redux, Zustand, Context |
| `navigation` | React Navigation patterns |
| `coding-standards` | React Native style guide |
| `quality-tools` | Linting, type checking |
| `testing-reactnative` | Detox, Jest Native |
| `security-reactnative` | Mobile security (MASVS) |
| `performance` | Native optimization |
| `tooling` | Metro, Flipper |

### Python Skills (6)

| Skill | Description |
|-------|-------------|
| `architecture` | Clean Architecture, FastAPI patterns |
| `coding-standards` | PEP 8, type hints |
| `quality-tools` | Ruff, MyPy, Black |
| `testing-python` | Pytest, hypothesis |
| `tooling` | Virtual envs, Poetry |

## How Claude Code Uses Skills

When you ask Claude Code for help, it:

1. **Scans skill descriptions** to find relevant expertise
2. **Loads SKILL.md** to understand the domain
3. **References REFERENCE.md** for detailed guidance
4. **Applies best practices** from the skill to your code

Example:

```
You: Help me write tests for this service

Claude: [Loads testing skill]
       I'll help you write tests following TDD principles.
       Based on the testing skill, we should:
       - Follow the Red-Green-Refactor cycle
       - Aim for 80%+ coverage
       - Use the AAA pattern (Arrange-Act-Assert)
       ...
```

## Creating Custom Skills

### Step 1: Create Directory

```bash
mkdir -p .claude/skills/my-custom-skill
```

### Step 2: Create SKILL.md

```markdown
---
name: my-custom-skill
description: Custom domain expertise. Use when working on [specific context].
---

# My Custom Skill

This skill provides guidelines for [domain].

See @REFERENCE.md for detailed documentation.
```

### Step 3: Create REFERENCE.md

```markdown
# My Custom Skill

## Overview

[Describe the domain and objectives]

## Guidelines

### Section 1

[Detailed content with examples]

### Section 2

[More content]

## Checklist

- [ ] Item 1
- [ ] Item 2

## Resources

- [Link 1](url)
- [Link 2](url)
```

### Best Practices for Custom Skills

1. **Clear descriptions**: Include when to use the skill
2. **Actionable content**: Provide concrete examples
3. **ASCII diagrams**: For architecture and flows
4. **Checklists**: Quality gates for each domain
5. **Anti-patterns**: What to avoid
6. **Language-agnostic** (Common) or **tech-specific** (others)

## Installation

Skills are automatically installed with technology rules:

```bash
# Install Symfony with all skills
make install-symfony TARGET=~/my-project

# Skills are placed in .claude/skills/
ls ~/my-project/.claude/skills/
# architecture-clean-ddd/  coding-standards/  testing-symfony/  ...
```

## Skill Count by Stack

| Stack | Skills Count |
|-------|--------------|
| Common | 7 |
| Symfony | 16 |
| Flutter | 10 |
| React | 8 |
| React Native | 11 |
| Python | 6 |
| **Total unique** | **58** |
| **With i18n (×5)** | **249** |

## Frequently Asked Questions

### Can I mix skills from different technologies?

Yes. Common skills are always installed, and you can install multiple tech stacks:

```bash
make install-symfony TARGET=~/my-project
make install-react TARGET=~/my-project
# Both Symfony and React skills coexist
```

### Do skills conflict with each other?

No. Each skill is scoped to its domain. Claude Code selects the appropriate skill based on context.

### Can I customize installed skills?

Yes. Skills are regular markdown files. You can:
- Edit REFERENCE.md to add project-specific guidelines
- Add new skills alongside installed ones
- Override specific sections

### Are legacy rules still supported?

Yes. Rules in `.claude/rules/` continue to work. However, we recommend migrating to skills for better organization and the official format.

---

## See Also

- [Agents Reference](AGENTS.md) - AI personas with specialized expertise
- [Commands Reference](COMMANDS.md) - Slash commands for workflows
- [Installation Guide](INSTALLATION.md) - How to install skills
