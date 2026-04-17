---
name: git-workflow
description: Git workflow with GitHub Flow and conventional commits — branches, commits, PRs, code review
author: The Bearded CTO / Claude Craft
version: 1.0.0
tags: [git, workflow, commits, pr, review, conventional-commits, github-flow]
category: devops
license: MIT
repository: https://github.com/TheBeardedCTO/claude-craft
---

# Git Workflow — GitHub Flow + Conventional Commits

Universal Git workflow for any project.

## Core Principles

- ✅ `main` branch always deployable
- ✅ Feature branches short (< 3 days)
- ✅ Pull Requests mandatory
- ✅ Code review before merge
- ✅ CI must pass (tests + quality)

## Conventional Commits

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add login endpoint` |
| `fix` | Bug fix | `fix(cart): correct total calculation` |
| `docs` | Documentation only | `docs(readme): update installation steps` |
| `style` | Formatting (no code change) | `style: apply formatter` |
| `refactor` | Refactoring (neither feat nor fix) | `refactor(user): extract validation logic` |
| `perf` | Performance improvement | `perf(query): add index on created_at` |
| `test` | Add/fix tests | `test(auth): add edge cases` |
| `build` | Build system, external deps | `build: upgrade framework to v2.0` |
| `ci` | CI/CD configuration | `ci: add lint step to pipeline` |
| `chore` | Other (no prod code) | `chore: update .gitignore` |

## Branches

### Naming

```
<type>/<short-description>
```

**Types:** `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`

**Examples:**
- `feature/add-user-registration` ✅
- `fix/login-validation-error` ✅
- `dev-branch` ❌
- `my-work` ❌

### Lifetime

- **Max 3 days** of development
- If > 3 days → **split** into multiple PRs
- Merge as soon as functional (even if incomplete)
- Use **feature flags** if needed

## Pull Requests

### Labels

- `enhancement` — New feature
- `bug` — Bug fix
- `documentation` — Documentation only
- `refactoring` — Refactoring
- `performance` — Performance improvement
- `security` — Security
- `breaking-change` — Breaking change
- `needs-review` — Awaiting review
- `ready-to-merge` — Ready for merge

## Code Review Checklist

### Architecture
- [ ] SOLID principles respected
- [ ] Layers well separated
- [ ] No inverted dependencies

### Code Quality
- [ ] KISS / DRY / YAGNI applied
- [ ] Explicit naming
- [ ] No code duplication
- [ ] Complexity acceptable (< 10)
- [ ] Short methods (< 20 lines)

### Tests
- [ ] Tests for business logic
- [ ] Coverage >= 80%
- [ ] All tests pass
- [ ] No commented tests

### Security
- [ ] No hardcoded secrets
- [ ] Input validation
- [ ] XSS/CSRF protection

## Pre-PR Checklist

- [ ] Tests pass (`make test`)
- [ ] Coverage >= 80%
- [ ] Linter: 0 errors
- [ ] Self-review: `git diff main...HEAD`
- [ ] Branch up to date with `main`
- [ ] CI passes
- [ ] At least 1 approval

---

**By The Bearded CTO / Claude Craft**
**Framework-agnostic — works with any stack**
