# Quickstart - Get Results in 10 Minutes

This guide takes you from zero to a working audit of your project. Every step includes what you should see and how to verify it worked.

---

## First 10 Minutes with Claude Craft

**New to Claude Craft?** Start here for a personalized guided tour that shows you the 3 most valuable commands for YOUR project.

```bash
# Inside Claude Code
/getting-started
```

This interactive wizard will:
1. **Detect your tech stack** (React, Symfony, Flutter, Python, etc.) in 30 seconds
2. **Recommend 3 high-impact checks** tailored to your technology (1 minute)
3. **Run your chosen command** with pedagogical commentary (5 minutes)
4. **Show you what to do next** with clear paths to explore further (1 minute)

**Time to First Value: Under 10 minutes.** No reading documentation — jump straight to actionable insights.

After completing the wizard, you can either:
- Continue with the full installation steps below for team setup
- Jump to [What's Next](#whats-next) to explore workflows and agents
- Join the community on [Discord](https://discord.gg/claude-craft) to ask questions

> See `.claude/commands/common/getting-started.md` for the full wizard reference.

---

## Prerequisites (30 seconds)

You need **Node.js 20+**, **npm**, and **Claude Code CLI** installed.

```bash
node --version   # v20.x or higher
npm --version    # 10.x or higher
claude --version # Should show Claude Code version
```

Missing something? See [Prerequisites Guide](PREREQUISITES.md) for installation instructions.

---

## Step 1: Install Claude Craft (2 minutes)

Navigate to your existing project (or create one) and install:

```bash
cd ~/my-project
npx @the-bearded-bear/claude-craft install . --tech=react --lang=en
```

Replace `react` with your technology: `symfony`, `flutter`, `python`, `angular`, `vuejs`, `reactnative`, `csharp`, `laravel`, `php`.

**What you should see:**

```
  Claude Craft v7.x - AI Development Framework

  Installing react rules to /home/user/my-project...
  [OK] Common rules installed
  [OK] React rules installed
  [OK] CLAUDE.md generated
  [OK] Installation complete!
```

**Checkpoint:** Verify the installation:

```bash
npx @the-bearded-bear/claude-craft check .
```

This shows installed commands, agents, skills, and references. You should see your technology listed alongside common rules.

---

## Step 2: Run Your First Audit (3 minutes)

Start Claude Code and run a full project audit:

```bash
claude
```

Inside Claude Code, type:

```
/team:audit
```

**What you should see:**

The audit runs multiple specialized agents in parallel -- architecture, security, performance, and code quality. Each agent produces a section with findings and scores.

A typical output includes:
- Architecture compliance score (e.g., 72/100)
- Security findings grouped by severity
- Performance hotspots
- Code quality metrics (duplication, complexity)

**Checkpoint:** You see a summary with scores and actionable findings. If the command is not recognized, verify installation with `npx @the-bearded-bear/claude-craft check .`

---

## Step 3: Fix a Finding with TDD (5 minutes)

Pick one finding from the audit (for example, a missing test or an architecture violation) and use TDD to fix it:

```
/qa:tdd
```

Describe the issue and the agent guides you through:

1. **RED** -- Write a failing test that captures the expected behavior
2. **GREEN** -- Write the minimum code to make the test pass
3. **REFACTOR** -- Clean up while keeping tests green

You can also ask the TDD coach agent directly:

```
@tdd-coach Help me fix this architecture violation: [paste finding]
```

**Checkpoint:** Your test suite passes with the new test included. Run your project's test command (e.g., `npm test`, `pytest`, `php artisan test`) to confirm.

---

## What's Next?

### By task

| I want to... | Command / Agent |
|--------------|----------------|
| Review my code | `@{tech}-reviewer Review my src/ folder` |
| Start a feature with full workflow | `/workflow:init` |
| Generate code following project patterns | `/{tech}:generate-*` |
| Validate before committing | `/common:pre-commit-check` |
| Run acceptance tests in Chrome | `/qa:recette --scope=story --id=US-001` |
| Run Claude in a continuous loop | `/common:ralph-run "implement feature X"` |

### By role

**Backend developer:** Start with `/workflow:init`, use `@api-designer` for API design, `@database-architect` for schema work.

**Frontend developer:** Use `@uiux-orchestrator` for design system coordination, `/{tech}:generate-component` for scaffolding.

**Team lead:** Run `/team:audit` regularly, use `/sprint:status` for progress tracking, `/gate:report` for quality metrics.

### Learn more

| Topic | Guide |
|-------|-------|
| Full command reference | [CLI Reference](CLI-REFERENCE.md) |
| All 33 agents | [Agents](AGENTS.md) |
| Project management (BMAD) | [BMAD Practical Guide](BMAD-PRACTICAL-GUIDE.md) |
| Continuous loop execution | [Ralph Wiggum Guide](RALPH-GUIDE.md) |
| Feature development walkthrough | [Feature Guide](guides/en/03-feature-development.md) |
| Bug fixing walkthrough | [Bug Fixing Guide](guides/en/04-bug-fixing.md) |
| Hooks and automation | [Hooks Guide](HOOKS.md) |
| FAQ and troubleshooting | [FAQ](FAQ.md) / [Troubleshooting](TROUBLESHOOTING.md) |

---

## Quick Reference

```
INSTALLATION
  npx @the-bearded-bear/claude-craft install . --tech=X --lang=en
  npx @the-bearded-bear/claude-craft check .
  npx @the-bearded-bear/claude-craft doctor .

COMMON COMMANDS
  /team:audit                Full project audit
  /workflow:init             Start development workflow
  /common:pre-commit-check   Validate before commit
  /qa:tdd                    TDD flow

USEFUL AGENTS
  @tdd-coach                 TDD guidance
  @api-designer              API design
  @{tech}-reviewer           Code review for your stack
```
