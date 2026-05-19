---
name: parallel-worktrees
description: Parallel git worktrees for concurrent Claude Code sessions. Use when working on multiple features or writer/reviewer workflows.
context: fork
disable-model-invocation: true
triggers:
  files: []
  keywords: ["worktree", "parallel", "concurrent", "writer", "reviewer", "multi-session"]
auto_suggest: true
---

# Parallel Worktrees

Productivity pattern for running multiple Claude Code sessions on the same repository.

See `../../rules/12-context-management.md` for detailed documentation.

## Quick Reference

### Setup

```bash
# Create worktree for a feature branch
git worktree add ../feature-name feature/branch-name

# Launch Claude in the worktree
cd ../feature-name && claude
```

### Writer/Reviewer Pattern

| Terminal | Role | Command |
|----------|------|---------|
| Terminal 1 | Writer | `cd ../feature-auth && claude "Implement feature"` |
| Terminal 2 | Reviewer | `cd ../review-auth && claude "Review the code"` |

### Best Practices

- 3-5 worktrees maximum
- One worktree = one task
- Remove completed worktrees: `git worktree remove ../feature-name`
- Never share sessions between worktrees

### Cleanup

```bash
# List all worktrees
git worktree list

# Remove a worktree
git worktree remove ../feature-name

# Prune stale worktree entries
git worktree prune
```
