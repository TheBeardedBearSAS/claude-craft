# Contributing to Claude Craft

Thank you for your interest in contributing to Claude Craft! This document provides guidelines and information for contributors.

---

## First-Time Contributors — 15 Minute Onboarding

Welcome! We're excited to have you contribute to Claude Craft. Here's how to get started in just 15 minutes:

### Step 1: Fork and Clone (2 minutes)

```bash
# Fork the repository on GitHub (click "Fork" button)
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/claude-craft.git
cd claude-craft
```

### Step 2: Install Dependencies (3 minutes)

```bash
# Install Node.js dependencies
npm install

# Check prerequisites (and optionally auto-fix)
./Dev/scripts/check-prerequisites.sh --fix

# Make scripts executable
make fix-permissions
```

### Step 3: Run Tests (2 minutes)

```bash
# Run tests to ensure everything works
npm test

# Optional: Test an installation
make dry-run-symfony TARGET=./test-output/test-project
```

### Step 4: Pick a Good First Issue (3 minutes)

Browse [good-first-issue](https://github.com/TheBeardedBearSAS/claude-craft/labels/good-first-issue) labels to find an issue that interests you.

**Great starter issues**:
- Fix documentation typos (any language: ES, DE, PT, FR)
- Add missing translations
- Write unit tests for existing modules
- Fix lint warnings (shellcheck, ESLint)
- Add missing ADRs (Architecture Decision Records)

### Step 5: Create a Branch (1 minute)

```bash
# Create a feature branch
git checkout -b fix/issue-XXX

# Or for specific types
git checkout -b docs/fix-typo-es
git checkout -b test/add-unit-tests
git checkout -b refactor/install-scripts
```

### Step 6: Make Your Changes (time varies)

Edit files, following our conventions:
- Use conventional commits: `type(scope): description`
- Follow the coding style in existing files
- Add tests if applicable
- Update documentation if needed

### Step 7: Commit and Push (2 minutes)

```bash
# Stage your changes
git add .

# Commit with a clear message
git commit -m "docs(es): fix typo in QUICKSTART.md"

# Push to your fork
git push origin fix/issue-XXX
```

### Step 8: Open a Pull Request (2 minutes)

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. **Sign the CLA** (Contributor License Agreement) when the bot prompts you — see [.github/CLA.md](/.github/CLA.md)

### Step 9: Respond to Feedback

Maintainers will review your PR and may suggest changes. Don't worry — this is normal! Just make the requested changes and push again.

```bash
# Make requested changes
git add .
git commit -m "fix: apply code review suggestions"
git push origin fix/issue-XXX
```

---

**That's it!** You're now a Claude Craft contributor. Thank you! 🎉

---

## Release Cadence (Maintainers)

To protect maintainer bandwidth and community stability, Claude Craft follows a **maximum cadence of 1 release per week** (audit P1-08 / M-02).

Exceptions:
- Critical security fixes (CVE, supply-chain): ship immediately.
- Hotfix for a documented regression: ship within 48h.
- Any other change: batch into the weekly release.

This rule is non-negotiable and is enforced via the release checklist (`/common:release-checklist`).

---

## Quick Navigation

| I want to... | Go to |
|--------------|-------|
| Add a new technology stack | [Adding a New Technology](#adding-a-new-technology) |
| Improve a reviewer agent | [Contributing to Upgrade a Tier 3 Stack](#contributing-to-upgrade-a-tier-3-stack) |
| Fix a CLI bug | [Submitting Changes](#submitting-changes) |
| Add translations | [Adding Translations](#adding-translations) |
| Write a skill | [Writing Skills](#writing-skills-official-format) |
| Write a command | [Writing Commands](#writing-commands) |
| Write an agent | [Writing Agents](#writing-agents) |

---

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

## Technology Tiers

Claude Craft uses a **3-tier maturity model** to classify its technology stacks. This ensures users know what level of support to expect, and gives contributors a clear path for improving stacks.

### Tier Definitions

| Tier | Label | Description |
|------|-------|-------------|
| **Tier 1** | Core | Deep, production-grade support. Extensive i18n, specialized agents with deep expertise, many commands and tech-specific skills. |
| **Tier 2** | Supported | Solid support with good coverage. Customized reviewer agent, multiple commands, growing i18n. |
| **Tier 3** | Community | Basic scaffolding in place. Generic reviewer template, minimal i18n, shared skills only. Community contributions welcome to grow these stacks. |

### Current Tier Assignments

| Tier | Technologies |
|------|-------------|
| **Tier 1 (Core)** | Symfony, React, Python, Flutter |
| **Tier 2 (Supported)** | React Native, PHP |
| **Tier 3 (Community)** | C# / .NET, Angular, Laravel, Vue.js |
| **Infra (no tier)** | Docker, Coolify |

### Tier Requirements

| Requirement | Tier 3 (Community) | Tier 2 (Supported) | Tier 1 (Core) |
|---|---|---|---|
| i18n files | >= 2 | >= 7 | >= 25 |
| Agent reviewer | Generic template | Customized | Deep specialization |
| Agent model | haiku | haiku | sonnet |
| Commands | >= 3 | >= 5 | >= 8 |
| Skills | Shared only | 1+ tech-specific | 3+ tech-specific |
| Reference docs | Basic CLAUDE.md | Full reference | Full + examples |

### Contributing to Upgrade a Tier 3 Stack

If you want to help promote a Tier 3 stack to Tier 2, here is what to focus on:

1. **Add i18n content**: Create at least 7 i18n files across `Dev/i18n/{lang}/{Technology}/` directories (agents, commands, skills, templates, checklists)
2. **Customize the reviewer agent**: Replace the generic template with a reviewer that understands the technology's specific patterns, anti-patterns, and best practices
3. **Add commands**: Implement at least 5 commands in the `/{tech}:` namespace (e.g., `check-architecture`, `check-compliance`, `check-security`, `check-testing`, `check-code-quality`)
4. **Create a tech-specific skill**: Add at least one skill under `Dev/i18n/{lang}/{Technology}/skills/` with `SKILL.md` + `REFERENCE.md`
5. **Write reference documentation**: Expand the reference docs in `.claude/references/{tech}/` beyond the basic CLAUDE.md

### New Stack Contribution Template

When adding a new technology stack (starts at Tier 3):

```
Dev/i18n/en/{NewTech}/
  agents/{newtech}-reviewer.md      # Reviewer agent (can start from generic template)
  commands/check-architecture.md    # Architecture validation command
  commands/check-compliance.md      # Standards compliance command
  commands/check-security.md        # Security audit command
  skills/                           # Tech-specific skills (optional for Tier 3)
  templates/                        # Code templates
  checklists/                       # Quality checklists
```

Also required:
- Entry in `cli/lib/tech-registry.js` with `tier: 3`
- Install script in `Dev/scripts/install-{newtech}-rules.sh`
- Reference docs in `.claude/references/{newtech}/CLAUDE.md`
- Translations for at least English (`en`); other languages are welcome

See [docs/TECHNOLOGIES.md](docs/TECHNOLOGIES.md) for the full tier overview and upgrade paths.

---

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
   make dry-run-{tech} TARGET=./test-output/test-project
   ```

2. Test actual installation:
   ```bash
   make install-{tech} TARGET=./test-output/test-project
   ```

3. Verify files are correctly placed:
   ```bash
   tree ./test-output/test-project/.claude
   ```

## Adding a New Technology

1. Create directory structure (i18n layout):
   ```bash
   for lang in en fr es de pt; do
     mkdir -p Dev/i18n/$lang/NewTech/{agents,commands,skills,templates,checklists}
   done
   mkdir -p Dev/i18n/base/NewTech/{agents,commands,skills,templates,checklists}
   ```

2. Create installation script based on existing ones

3. Add skills in the official format (SKILL.md + REFERENCE.md)

4. Create technology-specific agent

5. Add commands with proper namespace and frontmatter

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

## Security & Supply Chain

Claude Craft follows modern software supply chain security practices. For detailed information on our security policies, see [SECURITY.md](SECURITY.md).

### Security Expectations for Contributors

When contributing to Claude Craft:

1. **No secrets in commits**: Never commit API keys, tokens, or credentials
2. **Dependency hygiene**: Only add well-maintained dependencies with active security patching
3. **Audit new dependencies**: Check for known CVEs before adding new dependencies
4. **Report security issues privately**: Email security@thebearded-cto.com instead of opening public issues
5. **Supply chain awareness**: Understand SLSA provenance and SBOM generation (see SECURITY.md)

### Verifying Package Integrity

Before contributing, you can verify the integrity of the published package:

```bash
# Verify npm signatures (npm 9+)
npm audit signatures

# Check SLSA provenance
npm view @the-bearded-bear/claude-craft dist.attestations

# Download and verify SBOM from GitHub Releases
# https://github.com/TheBeardedBearSAS/claude-craft/releases
```

### Dependency Updates

When updating dependencies:

1. Run `npm audit` to check for vulnerabilities
2. Test the update thoroughly (unit tests, integration tests, dry-run installations)
3. Update package-lock.json (`npm install` or `npm ci`)
4. Document breaking changes in the PR description

---

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Keep discussions professional

## Development Setup

### Prerequisites

```bash
# Check all prerequisites
./Dev/scripts/check-prerequisites.sh --fix
```

Required:
- Node.js 20+
- npm 9+
- yq v4 (Mike Farah's version)
- Git 2+
- Bash
- shellcheck (for `npm run lint:shell`)

Recommended:
- Docker
- jq
- make

### Local Development

```bash
# Clone the repository
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# Make scripts executable
make fix-permissions

# Test installation to temp directory
make install-symfony TARGET=./test-output/test-project RULES_LANG=en

# View statistics
make stats

# List available components
make list
```

### Running Tests

```bash
# Test all installations
for tech in symfony flutter react python angular csharp reactnative vuejs laravel php; do
  make dry-run-$tech TARGET=./test-output/test-$tech
done

# Validate YAML config
make config-validate

# Check prerequisites
./Dev/scripts/check-prerequisites.sh

# Lint shell scripts
npm run lint:shell

# Verify i18n parity
npm run lint:i18n
```

### Release Checklist

Before releasing a new version:

1. [ ] Update version in package.json
2. [ ] Update version in README.md (What's New section)
3. [ ] Update version in docs/QUICKSTART.md
4. [ ] Update CHANGELOG.md
5. [ ] Run full test suite
6. [ ] Test NPX installation
7. [ ] Create git tag
8. [ ] Publish to npm

---

## Adding Translations

All content is available in 5 languages. When adding new content:

1. Create in English first (`Dev/i18n/en/`)
2. Translate to other languages:
   - `fr` - French
   - `es` - Spanish
   - `de` - German
   - `pt` - Portuguese

3. Maintain consistent structure across all languages

### i18n Verification Checklist

Before submitting translations:

1. **File parity**: Verify all 5 language directories have the same files:
   ```bash
   diff <(cd Dev/i18n/en && find . -type f | sort) <(cd Dev/i18n/fr && find . -type f | sort)
   ```
2. **No untranslated content**: Check for English text remaining in translated files
3. **Consistent frontmatter**: Ensure `description` fields are translated in all SKILL.md and command files
4. **Hook scripts**: Hook scripts in `Common/hooks/scripts/` should be identical across languages (code is not translated)
5. **Test installation**: Run `make install-{tech} TARGET=./test-output/test RULES_LANG={lang}` for each language

---

## Documentation

### Adding Documentation

1. Create in `docs/` directory
2. Add translations in `docs/i18n/{lang}/`
3. Update links in:
   - README.md
   - docs/guides/index.md
   - .claude/CLAUDE.md

### Documentation Standards

- Use GitHub-flavored Markdown
- Include code examples
- Add command output samples
- Keep language accessible for juniors
- Include troubleshooting sections

---

## Questions?

Feel free to open an issue for questions or clarifications.

---

## See Also

- [Architecture Guide](docs/ARCHITECTURE.md)
- [CLI Reference](docs/CLI-REFERENCE.md)
- [Scripts Reference](docs/SCRIPTS-REFERENCE.md)
