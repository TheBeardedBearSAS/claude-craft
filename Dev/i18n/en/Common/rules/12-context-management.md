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

---

## Context Compaction

### How It Works

Claude Code automatically compacts context when approaching window limits. Older messages are summarized to free space.

### Re-injection Hooks

Use the `SessionStart` hook with the `compact` matcher to re-inject critical context after compaction:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "command": "cat .claude/context-essentials.md"
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

---

## Parallel Worktrees

### Principle

> **"Single biggest productivity unlock"** — Boris Cherny (Anthropic)

Use `git worktree` to work on multiple branches simultaneously with independent Claude sessions.

### Setup

```bash
# Create a worktree for a feature
git worktree add ../feature-auth feature/auth

# Launch a Claude session in the worktree
cd ../feature-auth && claude

# Create a worktree for review
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

## Resources

- **Anthropic Best Practices:** [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code/overview)
- **Boris Cherny Workflow:** Parallel worktrees + verification loops
- **Claude Code Context Management:** Context compaction, `/clear`, sub-agents

---

**Last updated:** 2026-02
**Version:** 1.0.0
**Author:** The Bearded CTO
