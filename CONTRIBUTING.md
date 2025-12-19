# Contributing to Claude Craft

Thank you for your interest in contributing to Claude Craft! This document provides guidelines and information for contributors.

## How to Contribute

### Reporting Issues

- Use GitHub Issues to report bugs or suggest features
- Check existing issues before creating a new one
- Provide clear descriptions and reproduction steps

### Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes following our conventions
4. Test your changes
5. Commit with a clear message
6. Push to your fork
7. Open a Pull Request

## Project Structure

```
claude-craft/
├── Dev/
│   ├── i18n/                   # Internationalized content
│   │   ├── {lang}/             # Language (en, fr, es, de, pt)
│   │   │   ├── Common/         # Shared components
│   │   │   │   ├── agents/     # Transversal agents
│   │   │   │   ├── commands/   # /common: commands
│   │   │   │   ├── skills/     # Skills (official format)
│   │   │   │   ├── templates/  # Generic templates
│   │   │   │   └── checklists/ # Shared checklists
│   │   │   └── {Technology}/   # Technology-specific
│   │   │       ├── agents/     # Technology agent
│   │   │       ├── commands/   # /{tech}: commands
│   │   │       ├── skills/     # Technology skills
│   │   │       ├── templates/  # Code templates
│   │   │       └── checklists/ # Quality checklists
│   └── scripts/                # Installation scripts
│       ├── install-common-rules.sh
│       ├── install-{tech}-rules.sh
│       └── install-from-config.sh
├── Infra/                      # Infrastructure (Docker)
├── Project/                    # Project management
├── Tools/                      # Claude Code utilities
├── Makefile                    # Orchestration
└── docs/                       # Documentation
```

## File Naming Conventions

### Skills (Official Format)
- Format: Directory with `SKILL.md` + `REFERENCE.md`
- Directory name: `{topic}` or `{topic}-{technology}`
- Example: `testing/`, `architecture-clean-ddd/`, `security-react/`
- Use kebab-case for directory names

### Rules (Legacy)
- Format: `{number}-{topic}.md`
- Example: `01-workflow-analysis.md`, `02-architecture.md`
- Numbers ensure consistent ordering
- **Note**: Prefer skills format for new contributions

### Commands
- Format: `{action}-{target}.md`
- Example: `generate-crud.md`, `check-architecture.md`
- Use kebab-case
- **Requires frontmatter** with `description` field

### Agents
- Format: `{role}-{specialty}.md`
- Example: `database-architect.md`, `tdd-coach.md`
- Use kebab-case
- **Requires frontmatter** with `name` and `description` fields

### Templates
- Format: `{component-type}.md`
- Example: `service.md`, `aggregate-root.md`

## Writing Skills (Official Format)

Skills are the preferred format for best practices. Each skill is a directory with two files:

### SKILL.md (Index)

```markdown
---
name: my-skill
description: Brief description. Use when [context].
---

# Skill Title

This skill provides guidelines and best practices.

See @REFERENCE.md for detailed documentation.
```

### REFERENCE.md (Documentation)

```markdown
# Skill Title

## Overview
Why this skill exists and what it covers.

## Guidelines

### Section 1
Detailed content with examples...

### Section 2
More content...

## Checklist
- [ ] Item 1
- [ ] Item 2

## Anti-patterns
What to avoid...

## Resources
- External links
```

### Skill Best Practices

1. **Clear `description`**: Include when to use the skill
2. **Actionable content**: Provide concrete examples
3. **Use ASCII diagrams**: For architecture and flows
4. **Add checklists**: Quality gates for the domain
5. **Document anti-patterns**: What to avoid
6. **Keep language consistent**: Common (language-agnostic) or tech-specific

---

## Writing Rules (Legacy)

Rules should follow this structure:

```markdown
# Rule Title

## Context
Why this rule exists

## Rule
What to do

## Examples
Good and bad examples

## Exceptions
When this rule may not apply
```

> **Note**: For new contributions, prefer the Skills format.

---

## Writing Commands

Commands **require YAML frontmatter** for Claude Code discovery:

```markdown
---
description: Brief description of what the command does
argument-hint: <required-arg> [optional-arg]
---

# Command Name

Brief description of what the command does.

## Arguments
$ARGUMENTS

## Process

### Step 1: Description
Details...

### Step 2: Description
Details...

## Output Format
Expected output structure
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `description` | Yes | Shown in command list |
| `argument-hint` | No | Expected arguments format |

---

## Writing Agents

Agents **require YAML frontmatter** for Claude Code discovery:

```markdown
---
name: agent-name
description: Expert in [domain]. Use when [context].
---

# Agent Name

## Identity
- **Name**: Agent Name
- **Expertise**: Areas of expertise
- **Role**: What this agent does

## Capabilities
What the agent can do

## Methodology
How the agent works

## Interactions
How to interact with this agent
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Agent identifier (for @mention) |
| `description` | Yes | Shown in agent discovery |

## Code Style

### Bash Scripts
- Use `set -euo pipefail` for safety
- Add `--dry-run` option for testing
- Include colored output for readability
- Document all options in `--help`

### Markdown
- Use GitHub-flavored markdown
- Include code blocks with language hints
- Use tables for structured data
- Keep lines under 100 characters

## Testing Changes

Before submitting:

1. Run dry-run to test installation:
   ```bash
   make dry-run-{tech} TARGET=/tmp/test-project
   ```

2. Test actual installation:
   ```bash
   make install-{tech} TARGET=/tmp/test-project
   ```

3. Verify files are correctly placed:
   ```bash
   tree /tmp/test-project/.claude
   ```

## Adding a New Technology

1. Create directory structure:
   ```bash
   mkdir -p Dev/NewTech/{rules,claude-agents,claude-commands/newtech,templates,checklists}
   ```

2. Create installation script based on existing ones

3. Add rules following numbering convention

4. Create technology-specific agent

5. Add commands with proper namespace

6. Update Makefile with new targets

7. Update documentation

## Pull Request Guidelines

- Keep PRs focused on a single change
- Update documentation if needed
- Add tests or verification steps
- Reference related issues
- Use clear commit messages

## Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(symfony): add new migration-plan command
fix(flutter): correct path in installation script
docs: update README with new features
```

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Keep discussions professional

## Questions?

Feel free to open an issue for questions or clarifications.
