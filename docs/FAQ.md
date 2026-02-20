# FAQ - Frequently Asked Questions

Common questions and answers about Claude Craft.

---

## Installation

### What are the minimum requirements?

- **Node.js 20+** - For NPX and CLI
- **Bash** - For installation scripts
- **yq v4+** - For YAML configuration
- **Git** - For version control

See [Prerequisites](PREREQUISITES.md) for complete details.

### How do I install Claude Craft?

**Quickest method (NPX):**
```bash
npx @the-bearded-bear/claude-craft install ~/my-project --tech=symfony --lang=en
```

**Alternative (Makefile):**
```bash
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft
make install-symfony TARGET=~/my-project
```

### How do I reduce token consumption?

Install RTK (Rust Token Killer) to reduce token usage by 60-90%:

```bash
make install-rtk
# or
/common:setup-rtk
```

RTK intercepts terminal commands and compresses their output before it reaches the LLM context window.

### Can I install multiple technologies?

Yes! Run multiple install commands or use the YAML configuration:

```bash
make install-symfony TARGET=~/project
make install-react TARGET=~/project
```

Or with YAML:
```yaml
modules:
  - path: "."
    tech: [symfony, react]
```

### How do I update an existing installation?

```bash
make install-symfony TARGET=~/project OPTIONS="--update"
# or
./Dev/scripts/install-symfony-rules.sh --update ~/project
```

### How do I completely reinstall?

```bash
make install-symfony TARGET=~/project OPTIONS="--force --backup"
```

---

## Configuration

### Where is the configuration file?

- **Project-level:** `~/my-project/.claude/CLAUDE.md`
- **Index:** `~/my-project/.claude/INDEX.md`
- **Context triggers:** `~/my-project/.claude/context.yaml`

### How do I customize the project context?

Edit `.claude/CLAUDE.md` or run:
```
/common:setup-project-context
```

### How do I change the documentation language?

Use the `--lang` or `RULES_LANG` option during installation:
```bash
make install-symfony TARGET=~/project RULES_LANG=fr
```

Available: `en`, `fr`, `es`, `de`, `pt`

### What's the difference between CLAUDE.md and INDEX.md?

- **CLAUDE.md**: Minimal config loaded automatically (~200 tokens)
- **INDEX.md**: Quick reference loaded on demand via `@` (~1,300 tokens)
- **references/**: Full documentation loaded explicitly

---

## Commands

### How do I list all available commands?

In Claude Code:
```
/help
```

Or see [Commands Reference](COMMANDS.md).

### What's the difference between `/common:` and `/symfony:` commands?

- `/common:` - Transversal commands for any technology
- `/symfony:`, `/react:`, etc. - Technology-specific commands

### How do I create a custom command?

Add a markdown file to `.claude/commands/{namespace}/`:

```markdown
---
description: What this command does
argument-hint: <arg1> [arg2]
---

# My Custom Command

Instructions for Claude...
```

### Why isn't my command appearing?

1. Check file extension is `.md`
2. Check YAML frontmatter is valid
3. Restart Claude Code session

---

## Agents

### How do I invoke an agent?

Use the `@` mention:
```
@api-designer Help me design a REST API
@symfony-reviewer Review this code
```

### Can I use multiple agents together?

Yes:
```
@tdd-coach @react-reviewer Help me TDD this component
```

### How do I create a custom agent?

Add a markdown file to `.claude/agents/`:

```markdown
---
name: my-agent
description: Expert in X. Use when Y.
---

# My Agent

## Identity
...

## Capabilities
...
```

---

## BMAD Framework

### What is BMAD?

BMAD (Build, Measure, Analyze, Deliver) is Claude Craft's project management framework with:
- 9 specialized agents (pm, ba, architect, po, sm, dev, qa, ux, bmad-master)
- Status-based story routing
- 5 quality gates
- Batch processing

### How do I start using BMAD?

```bash
# Initialize BMAD in your project
/bmad:init

# Check status
/bmad:status
```

### What are the quality gates?

| Gate | Threshold | Purpose |
|------|-----------|---------|
| PRD Gate | ≥80% | Vision → PRD |
| Tech Spec Gate | ≥90% | PRD → Tech Spec |
| Backlog Gate | INVEST 6/6 | Tech Spec → Backlog |
| Sprint Ready | 100% | Backlog → Sprint |
| Story DoD | 100% | Dev → Done |

See [BMAD Practical Guide](BMAD-PRACTICAL-GUIDE.md).

---

## Ralph Wiggum

### What is Ralph Wiggum?

Ralph Wiggum is a continuous AI agent loop that runs Claude iteratively until:
- All Definition of Done (DoD) validators pass
- Maximum iterations reached
- Circuit breaker triggers

### How do I use Ralph?

```bash
/common:ralph-run "Implement user authentication"
# or
npx @the-bearded-bear/claude-craft ralph "Fix the login bug"
```

### What DoD validators are available?

| Validator | Description |
|-----------|-------------|
| `command` | Run shell commands (tests, lint) |
| `output_contains` | Check output for patterns |
| `file_changed` | Verify files were modified |
| `hook` | Integrate with quality-gate.sh |
| `human` | Manual approval |

### Can I run sprints overnight?

Yes! Use the team-sprint command with Ralph mode:

```bash
/team:sprint --ralph-mode "Sprint 3" --overnight --max-stories 5
```

This will:
1. Process up to 5 stories
2. Auto-recover from transient errors
3. Escalate blocking issues
4. Stop at 6am or when limits are reached

> **Note:** `/common:ralph-sprint` was removed in v6.0. See [Migration Guide](MIGRATION-v6.md).

---

## Workflow

### What workflow tracks are available?

| Track | Setup Time | Best For |
|-------|------------|----------|
| Quick Flow | < 5 min | Bug fixes, hotfixes |
| Standard | < 15 min | New features |
| Enterprise | < 30 min | Platforms, migrations |

### How do I start a workflow?

```
/workflow:init              # Auto-detect
/workflow:init --quick      # Bug fix mode
/workflow:init --enterprise # Full methodology
```

### What are the workflow phases?

1. **Analyze** - Research and exploration (Enterprise only)
2. **Plan** - Generate PRD, personas, backlog
3. **Design** - Tech spec, architecture, ADRs
4. **Implement** - Sprint development with TDD/BDD

---

## Fast Mode

### What is Fast Mode?

Fast Mode (v2.1.36+) delivers up to 2.5x faster output for Opus 4.6 with the same capabilities. Toggle with `/fast`.

### How much does Fast Mode cost?

| Mode | Input | Output |
|------|-------|--------|
| Standard | $5/M | $25/M |
| Fast | $30/M | $150/M |

### When to use Fast Mode with Claude Craft?

Use for interactive work (code review, debugging). For batch operations (team-sprint, team-audit), standard mode is more cost-effective.

---

## Troubleshooting

### "yq: command not found"

Install yq v4:
```bash
brew install yq      # macOS
sudo apt install yq  # Ubuntu
```

Make sure it's Mike Farah's version:
```bash
yq --version
# Should show: yq (https://github.com/mikefarah/yq/)
```

### "Permission denied" on scripts

```bash
chmod +x Dev/scripts/*.sh
# or
make fix-permissions
```

### Commands not recognized in Claude Code

1. Restart Claude Code session
2. Verify files are in `.claude/commands/`
3. Check YAML frontmatter syntax

### Installation fails with "directory not found"

Create the directory first:
```bash
mkdir -p ~/my-project
make install-symfony TARGET=~/my-project
```

### Files overwritten unexpectedly

Use `--preserve-config` to keep your customizations:
```bash
make install-symfony TARGET=~/project OPTIONS="--force --preserve-config"
```

See [Troubleshooting Guide](TROUBLESHOOTING.md) for more solutions.

---

## Project Management

### How do I create a user story?

```
/project:add-story EPIC-001 "As a user, I want..."
```

### How do I track sprint progress?

```
/sprint:status
/project:board
```

### How do I run a TDD sprint?

```
/sprint:dev next
```

---

## Integration

### Does Claude Craft work with other AI tools?

Yes! Use the web bundles:
- `bundles/chatgpt/` - For ChatGPT
- `bundles/claude/` - For Claude Projects
- `bundles/gemini/` - For Gemini Gems

### Can I use MCP servers?

Yes, Claude Craft includes MCP templates:
```bash
# Copy MCP templates
cp .claude/mcp/* ~/.claude/mcp/
```

Available: Context7, GitHub, PostgreSQL, Slack

### Does it work in monorepos?

Yes! Use YAML configuration:
```yaml
projects:
  - name: "my-monorepo"
    root: "~/Projects/my-monorepo"
    modules:
      - path: "frontend"
        tech: react
      - path: "backend"
        tech: symfony
```

---

## Migration

### How do I migrate from v3 to v4?

See [Migration Guide](MIGRATION-v4.md).

### What breaks in v4?

Main changes:
- TCL (Tiered Context Loading) structure
- BMAD v6 format changes
- Some command renames

### Can I use v3 and v4 side by side?

Not recommended. Migrate projects one at a time.

---

## Best Practices

### What's the recommended workflow for a new feature?

1. Start with `/workflow:init`
2. Use `@api-designer` for API design
3. Generate code with `/symfony:generate-crud`
4. Write tests with `@tdd-coach`
5. Review with `@symfony-reviewer`
6. Validate with `/common:pre-commit-check`

### How often should I run audits?

- **Pre-commit**: Always (`/common:pre-commit-check`)
- **Full audit**: Weekly or before releases
- **Security audit**: Before each release

### Should I commit the .claude folder?

Yes! The `.claude/` folder should be committed to version control so all team members use the same rules and commands.

---

## Contributing

### How do I add a new technology?

Use the command:
```
/common:add-technology "nextjs"
```

This generates all files for 5 languages.

### How do I report a bug?

[Open an issue on GitHub](https://github.com/TheBeardedBearSAS/claude-craft/issues)

### Can I contribute translations?

Yes! Translations are in `Dev/i18n/{lang}/`. PRs welcome!

---

## Still have questions?

- Check [Troubleshooting](TROUBLESHOOTING.md)
- Read [Full Documentation](COMMANDS-FULL-REFERENCE.md)
- [Open a GitHub issue](https://github.com/TheBeardedBearSAS/claude-craft/issues)
