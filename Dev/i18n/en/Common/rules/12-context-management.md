# Context Management

## Overview

The context window is **THE critical resource** in Claude Code. Every token counts. Effective context management is the difference between a productive assistant and one that loses track.

> **Source:** Anthropic Best Practice #1 — "The context window is the single most important resource to manage."

**Principles:**
- Context is a finite and precious resource
- CLAUDE.md and rules compete for model attention
- Use sub-agents for investigations
- Clean context between tasks

---

## Table of Contents

1. [CLAUDE.md Size Rules](#claudemd-size-rules)
2. [Context Cleanup](#context-cleanup)
3. [Sub-agents for Investigations](#sub-agents-for-investigations)
4. [Context Compaction](#context-compaction)
5. [Verification Loops](#verification-loops)
6. [Plan Mode](#plan-mode)
7. [Token Tracking](#token-tracking)
8. [Checklist](#checklist)
9. [Compaction Hints in CLAUDE.md](#compaction-hints-in-claudemd)
10. [CLAUDE.local.md for Personal Preferences](#claudelocalmd-for-personal-preferences)
11. [Context Anti-patterns](#context-anti-patterns)
12. [CLAUDE.md Authoring Best Practices](#claudemd-authoring-best-practices)
13. [Performance Optimization](#performance-optimization)
14. [Communication Patterns](#communication-patterns)
15. [New Context Commands](#new-context-commands)
16. [Agent Frontmatter](#agent-frontmatter)
17. [Managed Settings](#managed-settings)
18. [Monitor and Background Events](#monitor-and-background-events)

---

## CLAUDE.md Size Rules

### Recommended Limit

> **Main CLAUDE.md: 150-200 lines maximum.**
> Each additional instruction dilutes attention on existing instructions.

### Modularity Strategy

```
.claude/
  CLAUDE.md              <- Summary (150-200 lines max)
  rules/                 <- Detailed rules (loaded on demand)
    01-workflow-analysis.md
    04-solid-principles.md
    05-kiss-dry-yagni.md
    ...
  references/            <- Technical documentation
  skills/                <- On-demand capabilities
```

### Best Practices

| Practice | Description |
|----------|-------------|
| **Short CLAUDE.md** | Overview, links to rules |
| **Modular rules** | One file per topic in `.claude/rules/` |
| **Separate references** | Technical docs in `.claude/references/` |
| **On-demand skills** | Capabilities loaded only when needed |

### What Goes in CLAUDE.md vs Rules

| Content | Location |
|---------|----------|
| Supported technologies | CLAUDE.md |
| Available commands | CLAUDE.md |
| Available agents | CLAUDE.md |
| Claude Code compatibility | CLAUDE.md |
| Detailed SOLID principles | `.claude/rules/04-solid-principles.md` |
| Security rules | `.claude/rules/11-security.md` |
| Analysis workflow | `.claude/rules/01-workflow-analysis.md` |

---

## Context Cleanup

### When to Use `/clear`

```
Use /clear:
- Between two UNRELATED tasks
- After a long investigation
- When context exceeds 50% of the window
- Before starting a new feature

DO NOT use /clear:
- In the middle of an ongoing task
- If previous context is needed
- Right after loading relevant files
```

### Signs of Context Pollution

- Claude repeats previously given information
- Responses become less accurate
- Claude confuses elements from different tasks
- Errors increase despite clear instructions

### Pattern: Investigation then Implementation

```
Session 1: Investigation
  -> Read code, understand architecture
  -> Document findings
  -> /clear

Session 2: Implementation
  -> Load only necessary files
  -> Implement with clean context
```

---

## Sub-agents for Investigations

### Principle

> **Delegate research to sub-agents to keep the main context clean.**

Sub-agents (Task tool) have their own context window. Using a sub-agent to explore the codebase avoids polluting the main context with hundreds of irrelevant code lines.

### When to Use a Sub-agent

| Situation | Action |
|-----------|--------|
| Search for specific file/pattern | Glob/Grep directly |
| Explore unknown architecture | Explore sub-agent |
| Multi-file investigation (> 3) | Explore sub-agent |
| Plan an implementation | Plan sub-agent |
| Independent parallel task | General-purpose sub-agent |

### Example

```
# Instead of reading 20 files in the main context:

Task(Explore): "How does authentication work in this project?
  List the files, patterns, and dependencies."

# The sub-agent explores and returns a summary
# The main context stays clean
```

### Agent Frontmatter (v2.1.78+)

Custom agents support frontmatter fields to control their behavior:

```yaml
---
effort: low          # Effort level (low/medium/high)
maxTurns: 10         # Maximum number of turns
disallowedTools:     # Disallowed tools
  - Edit
  - Write
---
```

These fields allow optimizing costs and scope of sub-agents.

---

## Context Compaction

### How It Works

Claude Code automatically compacts context when approaching window limits. Older messages are summarized to free space.

### Proactive Compaction

At 70% context usage, proactively run `/compact` to avoid uncontrolled automatic compaction.

The `/memory` command (v2.1.59+) lets you save persistent session learnings that survive compactions and new sessions.

### PreCompact Hook

Use the `PreCompact` hook to save critical context before compaction:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

### PostCompact Hook

Use the `PostCompact` hook (v2.1.76+) to re-inject critical context after compaction:

```json
{
  "hooks": {
    "PostCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

Starting from v2.1.105, the `PreCompact` hook can **block** compaction via exit code 2, allowing you to control when compaction occurs.

### Re-injection Hooks

Use the `SessionStart` hook with the `compact` matcher to re-inject critical context after compaction:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

### Prepare Essential Context

Create a `.claude/context-essentials.md` file with:
- Key architectural decisions
- Project conventions
- Current tasks
- Critical constraints

---

## Verification Loops

### Principle

> **Always provide verification means: tests, screenshots, expected outputs.**
> Source: "2-3x improvement in final result quality" (Anthropic)

### Pattern: Specification-Implementation-Verification

```
1. SPECIFICATION
   -> Define expected behavior
   -> Provide input/output examples
   -> Write tests first (TDD)

2. IMPLEMENTATION
   -> Code the solution

3. VERIFICATION
   -> Run tests
   -> Compare with expected outputs
   -> Fix if needed
   -> Repeat until satisfied
```

### Effective Loop Examples

```
TDD Loop:
  test (RED) -> code (GREEN) -> refactor -> test (GREEN)

UI Loop:
  screenshot before -> modification -> screenshot after -> compare

API Loop:
  OpenAPI spec -> implementation -> curl test -> compare response

CI Loop:
  modify code -> run tests -> fix failures -> re-run
```

### Anti-patterns

```
DO NOT:
- Implement without tests
- Assume it works without verifying
- Ignore test errors
- Move to next task without verification
```

---

## Plan Mode

### When to Invest in Planning

| Situation | Action |
|-----------|--------|
| Simple bug, 1 file | Fix directly |
| Simple feature, < 3 files | Implement directly |
| Complex feature, > 3 files | Plan Mode |
| Architectural refactoring | Plan Mode |
| Technology choice | Plan Mode |
| Uncertain impact | Plan Mode |

### Plan Mode Advantages

- Explore the codebase before acting
- Identify impacted files
- Propose an approach before implementing
- Avoid rework

---

## Token Tracking

### Status Line

The Claude Code status line displays the percentage of context used. Monitor this indicator to anticipate compactions.

### Action Thresholds

| Context Used | Action |
|-------------|--------|
| < 30% | Normal, continue |
| 30-60% | Monitor, avoid unnecessary reads |
| 60-80% | Delegate to sub-agents, consider /clear |
| > 80% | Compaction imminent, save critical context |

### /context Command (v2.1.74+)

The `/context` command provides actionable suggestions to optimize context usage. Use regularly to identify sources of waste.

### /effort Command (v2.1.72+)

Adjust the model's effort level based on task complexity:

| Command | Effort | Usage |
|---------|--------|-------|
| `/effort low` | Minimal | Simple tasks, lookups |
| `/effort medium` | Standard | Routine implementation |
| `/effort high` | Maximum | Complex reasoning, architecture |

### Inactivity Alert (v2.1.84+)

After 75+ minutes of inactivity, Claude automatically suggests `/clear` to avoid stale context.

### Multi-session Strategy

For complex tasks, split work into short focused sessions. Each session uses fresh context, reducing token consumption by approximately 55%:

```
Session 1: Investigation (read, analyze, document)
  -> /memory to save conclusions
  -> /clear

Session 2: Implementation (code, test)
  -> Previous /memory is automatically loaded
  -> Fresh context, no pollution
```

### Scheduled Tasks /loop (v2.1.71+)

The `/loop` command allows scheduling recurring tasks:

```bash
/loop 5m /common:pre-commit-check    # Check every 5 minutes
/loop "Monitor CI tests"              # Auto-paced by the model
```

Alias: `/proactive` (v2.1.105+).

---

## Parallel Worktrees

### Principle

> **"Single biggest productivity unlock"** — Boris Cherny (Anthropic)

Use `git worktree` to work on multiple branches simultaneously with independent Claude sessions.

### Setup

Since v2.1.53+, Claude Code supports the native `--worktree` (`-w`) flag to create and work in isolated worktrees:

```bash
# Native flag (v2.1.53+) — creates an isolated worktree automatically
claude --worktree "Implement JWT authentication"
claude -w "Review the authentication code"

# Manual method (all versions)
git worktree add ../feature-auth feature/auth
cd ../feature-auth && claude

git worktree add ../review-auth feature/auth
cd ../review-auth && claude
```

### Writer/Reviewer Pattern

```
Terminal 1 (Writer):
  cd ../feature-auth
  claude "Implement JWT authentication"

Terminal 2 (Reviewer):
  cd ../review-auth
  claude "Review the authentication code"
  # Fresh context, no author bias
```

### Cleanup

```bash
git worktree remove ../feature-auth
git worktree remove ../review-auth
```

### Recommendations

- 3-5 worktrees maximum
- One worktree = one task
- Remove completed worktrees
- Do not share sessions between worktrees

---

## Checklist

### Before Each Session

- [ ] CLAUDE.md < 200 lines
- [ ] Modular rules in `.claude/rules/`
- [ ] Clean context (no residue from previous tasks)

### During Session

- [ ] Monitor context %
- [ ] Delegate investigations to sub-agents
- [ ] `/clear` between unrelated tasks
- [ ] Provide tests/expected outputs

### For Complex Tasks

- [ ] Use Plan Mode
- [ ] Break into sub-tasks
- [ ] Worktrees for parallelism
- [ ] Verification loops

---

## Compaction Hints in CLAUDE.md

### Principle

> **Tell Claude what to preserve during compaction.**

Add compaction instructions to CLAUDE.md to guide the summary during automatic compaction:

```markdown
# In CLAUDE.md:
During compaction, always preserve:
- The list of modified files
- Test commands
- Architecture decisions
```

### Useful Environment Variables

| Variable | Description |
|----------|-------------|
| `CLAUDE_CODE_SUBAGENT_MODEL` | Model for sub-agents (e.g., `sonnet` to optimize costs) |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Set to `1` to disable automatic memory |

---

## CLAUDE.local.md for Personal Preferences

### Principle

Create a `CLAUDE.local.md` file at the project root (gitignored) for personal preferences that should not be shared with the team.

```
project/
  .claude/CLAUDE.md      <- Shared (git)
  CLAUDE.local.md        <- Personal (gitignore)
```

### Typical Content

- Personal style preferences
- Local-specific paths
- Preferred personal tools

### Configuration

Add to `.gitignore`:
```
CLAUDE.local.md
```

---

## Context Anti-patterns

| Anti-pattern | Description | Solution |
|-------------|-------------|----------|
| **Kitchen-sink session** | Doing everything in one session | `/clear` between tasks, sub-agents |
| **Overloaded CLAUDE.md** | > 200 lines dilutes attention | Modularize into `.claude/rules/` |
| **Over-correcting** | Successive corrections pollute context | After 2 failures, `/clear` and reformulate |
| **Trust-then-verify gap** | Implementing without verifying | TDD loops, tests before code |
| **Infinite exploration** | Reading too many files without purpose | Define scope before exploring |

---

## CLAUDE.md Authoring Best Practices

### Prefer Pointers over Copies

Do not copy code into CLAUDE.md — it becomes stale. Use `@path` syntax to reference files:

```markdown
# In CLAUDE.md:
See @.claude/references/symfony/CLAUDE.md for Symfony conventions.
See @docs/API.md for API documentation.
```

### Emphasis for Critical Rules

Use `IMPORTANT`, `YOU MUST`, `NEVER` for non-negotiable constraints:

```markdown
IMPORTANT: Never modify existing migrations.
YOU MUST run tests before every commit.
NEVER put secrets in source code.
```

### CLAUDE.md File Hierarchy

| File | Scope | Usage |
|------|-------|-------|
| `~/.claude/CLAUDE.md` | Global (all projects) | Universal personal preferences |
| `.claude/CLAUDE.md` or `./CLAUDE.md` | Project (git) | Team conventions |
| `CLAUDE.local.md` | Project (gitignore) | Personal project preferences |

### Regular Maintenance

- Review CLAUDE.md each quarter
- For each line, ask: "If I remove this line, will Claude make mistakes?"
- If no, remove the line
- Treat CLAUDE.md like production code

---

## Performance Optimization

### Native CLI over MCPs

Prefer native CLI tools (Glob, Grep, Read, Edit) over MCP equivalents. MCP servers add persistent tool definitions every turn, consuming context permanently.

| Approach | Context Cost |
|----------|-------------|
| Native tool (Glob, Grep) | 0 extra tokens |
| MCP server | ~500-2000 tokens/tool/turn |
| External CLI (gh, aws) | One-time, via Bash |

### MCP Tool Search (v2.1.80+)

`ToolSearch` enables lazy loading of MCP tools, reducing context consumption by **95%**:

| Approach | Context Cost |
|----------|-------------|
| Classic MCP (all tools loaded) | ~500-2000 tokens/tool/turn |
| MCP with Tool Search (lazy loading) | ~50 tokens total |

Use `ToolSearch` with `query: "select:tool_name"` to load a tool on demand.

### --bare Flag (v2.1.81+)

For scripted calls with `-p`, use `--bare` to skip hooks, LSP, and plugin synchronization:

```bash
claude --bare -p "Analyze this file" < input.txt
```

Significant startup time reduction for automation.

### Monitor Tool (v2.1.98+)

The `Monitor` tool allows streaming events from a background process. Each stdout line is a notification. Use instead of `sleep` + poll to wait for a process to finish.

### Mid-session Model Switching

Use `/model` to switch models based on task complexity:

| Command | Model | Usage |
|---------|-------|-------|
| `/model haiku` | Haiku 4.5 | Simple tasks, classification |
| `/model sonnet` | Sonnet 4.6 | Standard tasks, implementation |
| `/model opus` | Opus 4.6 | Complex reasoning, architecture |

### Output Filtering via Hooks

Use PostToolUse hooks to filter verbose outputs before Claude processes them:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "command": "echo '$TOOL_OUTPUT' | grep -A 5 -E '(FAIL|ERROR|WARN)' || echo 'All clear'"
    }]
  }
}
```

Potential reduction: 90%+ for verbose logs.

### Code Intelligence Plugins

For typed languages, a single `go-to-definition` call replaces multiple grep + file reads:

- PHP: `php-lsp` (Intelephense)
- TypeScript: `typescript-lsp` (vtsls)
- Python: `pyright-lsp`
- Dart: `dart-analyzer`
- C#: `csharp-lsp`

---

## Communication Patterns

### Interview Pattern

For complex features, ask Claude to interview you before coding:

```
"I want to implement [description]. Interview me in detail.
Ask questions about the technical implementation, edge cases,
constraints and trade-offs. Continue until you have a complete
picture, then write the specification in SPEC.md."
```

Result: complete specification before implementation, clean context.

### CIF Structure (Context, Intent, Format)

Structure prompts to maximize precision:

| Element | Description | Example |
|---------|-------------|---------|
| **Context** | Current situation | "In the auth module, the JWT token expires after 15min" |
| **Intent** | Precise objective | "Add refresh token with rotation" |
| **Format** | Expected output format | "Generate the service + unit tests" |

### Writer/Reviewer Pattern

Use two sessions for better quality (see also [Parallel Worktrees](#parallel-worktrees)):

- **Session A (Writer):** Implements the feature
- **Session B (Reviewer):** Reviews with fresh context (no author bias)
- **Session A:** Integrates feedback

---

## Managed Settings (v2.1.83+)

### managed-settings.d/ Directory

The `managed-settings.d/` directory enables modular configuration via alphabetical merging:

```
.claude/
  managed-settings.d/
    00-base.json          <- Base configuration
    10-security.json      <- Security rules
    20-team.json          <- Team preferences
```

Files are merged in alphabetical order, allowing teams to layer configurations without conflicts.

---

## New Commands (v2.1.105+)

| Command | Description | Use Case |
|---------|-------------|----------|
| `/btw` | Quick questions without context switching | Lookups, syntax, clarifications |
| `/hooks` | Interactive hook management | Enable/disable, test, debug |
| `/reload-plugins` | Manual plugin reload | After plugin updates |
| `/proactive` | Alias for `/loop` | Proactive recurring monitoring |

---

## Additional Environment Variables (v2.1.105+)

| Variable | Description |
|----------|-------------|
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` | Load CLAUDE.md from `--add-dir` |
| `MAX_THINKING_TOKENS=8000` | Thinking token limit |
| `SLASH_COMMAND_TOOL_CHAR_BUDGET` | Slash command character budget |
| `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` | PowerShell instead of Bash (Windows, v2.1.84+) |
| `OTEL_LOG_USER_PROMPTS` | Log prompts in traces (beta) |
| `OTEL_LOG_TOOL_DETAILS` | Log tool details (beta) |
| `OTEL_LOG_TOOL_CONTENT` | Log tool content (beta, verbose) |

---

## Advanced Skills (v2.1.105+)

| Frontmatter | Description |
|-------------|-------------|
| `context: fork` | Run in isolated context (no pollution) |
| `disable-model-invocation: true` | Prevent automatic invocation by Claude |
| `claudeMdExcludes` (setting) | Exclude specific CLAUDE.md files in monorepos |

**Auto-compaction and skills:** After compaction, skills auto-reload (5K tokens/skill, 25K total max).

---

## Resources

- **Anthropic Best Practices:** [code.claude.com](https://code.claude.com/docs/en/overview)
- **Boris Cherny Workflow:** Parallel worktrees + verification loops
- **Claude Code Context Management:** Context compaction, `/clear`, sub-agents
- **`/init`:** Automatically generates a CLAUDE.md from project analysis
- **CLAUDE.md Authoring:** [Builder.io Guide](https://www.builder.io/blog/claude-md-guide), [HumanLayer Blog](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- **Cost Optimization:** [Anthropic Costs Docs](https://code.claude.com/docs/en/costs)

---

**Last updated:** 2026-04
**Version:** 1.2.0
**Author:** The Bearded CTO
