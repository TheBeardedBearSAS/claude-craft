---
name: git-workflow
description: Git Workflow. Use when working with git, branches, or commits.
triggers:
  files: [".git/**", ".gitignore"]
  keywords: ["commit", "branch", "merge", "PR", "pull request", "git", "conventional"]
auto_suggest: true
---

# Git Workflow

This skill provides Git workflow and conventional commits guidelines.

See @REFERENCE.md for detailed documentation.

## Quick Reference

- **Commits**: `<type>(<scope>): <description>`
- **Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore
- **Branches**: `feature/`, `fix/`, `refactor/`, `docs/`
- **Max branch life**: 3 days
- **Review**: Required before merge
