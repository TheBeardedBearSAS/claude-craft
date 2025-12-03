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
│   ├── Common/                 # Shared components
│   │   ├── claude-agents/      # Transversal agents
│   │   ├── claude-commands/    # /common: commands
│   │   ├── templates/          # Generic templates
│   │   ├── checklists/         # Shared checklists
│   │   └── install-common-rules.sh
│   ├── {Technology}/           # Technology-specific
│   │   ├── rules/              # Rule definitions
│   │   ├── claude-agents/      # Technology agent
│   │   ├── claude-commands/    # /{tech}: commands
│   │   ├── templates/          # Code templates
│   │   ├── checklists/         # Quality checklists
│   │   └── install-{tech}-rules.sh
│   ├── install-from-config.sh  # YAML installer
│   └── claude-projects.yaml.example
├── Project/                    # Project management
├── Makefile                    # Orchestration
└── docs/                       # Documentation
```

## File Naming Conventions

### Rules
- Format: `{number}-{topic}.md`
- Example: `01-workflow-analysis.md`, `02-architecture.md`
- Numbers ensure consistent ordering

### Commands
- Format: `{action}-{target}.md`
- Example: `generate-crud.md`, `check-architecture.md`
- Use kebab-case

### Agents
- Format: `{role}-{specialty}.md`
- Example: `database-architect.md`, `tdd-coach.md`
- Use kebab-case

### Templates
- Format: `{component-type}.md`
- Example: `service.md`, `aggregate-root.md`

## Writing Rules

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

## Writing Commands

Commands should follow this structure:

```markdown
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

## Writing Agents

Agents should follow this structure:

```markdown
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
