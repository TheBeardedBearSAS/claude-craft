# Auto Mode Guide

> **Requires:** Claude Code v2.1.94+

## What is Auto Mode?

Auto Mode allows Claude to execute approved commands without asking for confirmation. You define which commands to:
- **Auto-approve**: Execute immediately (e.g., tests, linters)
- **Confirm**: Ask before executing (e.g., commits, deploys)
- **Block**: Never execute (e.g., destructive operations)

This accelerates development workflows while maintaining safety.

---

## Quick Start

### 1. Install the Recommended Profile

```bash
# Copy profile to Claude Code config
cp .claude/templates/auto-mode-profile.json ~/.claude/auto-mode-profiles/claude-craft.json

# Enable in Claude Code
claude config auto-mode.profile claude-craft-recommended
```

### 2. Verify Configuration

```bash
# Check current profile
claude config auto-mode.profile

# Test with a safe command
claude "run npm test in auto mode"
```

---

## Profile Structure

The profile defines three categories:

| Category | Description | Examples |
|----------|-------------|----------|
| **auto_approve** | Execute without confirmation | `npm test`, `git status`, `vitest` |
| **confirm** | Ask before executing | `git push`, `npm publish` |
| **block** | Never execute | `rm -rf`, `git push --force` |

### Default Profile

```json
{
  "name": "claude-craft-recommended",
  "description": "Recommended Auto Mode profile for Claude Craft development",
  "auto_approve": [
    "npm test",
    "npm run lint",
    "npm run format",
    "npm run test:coverage",
    "vitest",
    "shellcheck",
    "git status",
    "git diff",
    "git log"
  ],
  "confirm": [
    "git push",
    "git commit",
    "npm publish",
    "make deploy"
  ],
  "block": [
    "rm -rf",
    "git push --force",
    "git reset --hard",
    "npm unpublish"
  ]
}
```

---

## Customization

### Create Your Own Profile

```bash
# Create custom profile
cat > ~/.claude/auto-mode-profiles/my-workflow.json <<EOF
{
  "name": "my-workflow",
  "description": "Custom profile for my workflow",
  "auto_approve": [
    "npm test",
    "make lint"
  ],
  "confirm": [
    "git push"
  ],
  "block": [
    "rm -rf"
  ]
}
EOF

# Enable it
claude config auto-mode.profile my-workflow
```

### Extend the Default Profile

```bash
# Copy default profile
cp ~/.claude/auto-mode-profiles/claude-craft.json ~/.claude/auto-mode-profiles/my-custom.json

# Edit to add your commands
nano ~/.claude/auto-mode-profiles/my-custom.json
```

---

## Security Best Practices

### ✅ Safe to Auto-Approve

- Read-only commands: `git status`, `git log`, `git diff`
- Tests: `npm test`, `vitest`, `pytest`
- Linters: `npm run lint`, `shellcheck`, `phpstan`
- Formatters: `npm run format`, `prettier`

### ⚠️ Should Confirm

- Write operations: `git commit`, `git push`
- Publishing: `npm publish`, `make deploy`
- Database migrations: `php bin/console doctrine:migrations:migrate`

### ❌ Never Auto-Approve

- Destructive operations: `rm -rf`, `git reset --hard`
- Force operations: `git push --force`, `npm unpublish`
- Sensitive commands: `docker system prune -a`

---

## Examples

### Auto Mode with TDD Workflow

```bash
# Claude auto-runs tests after each change
claude "implement the UserService with TDD"
# → Auto-approves: npm test (after each test written)
# → Confirms: git commit (when feature complete)
```

### Auto Mode with CI/CD

```bash
# Claude auto-runs linters before commit
claude "fix all linting errors and commit"
# → Auto-approves: npm run lint
# → Confirms: git commit, git push
```

---

## Troubleshooting

### Profile Not Found

```bash
# List available profiles
ls ~/.claude/auto-mode-profiles/

# Create directory if missing
mkdir -p ~/.claude/auto-mode-profiles
```

### Commands Still Asking for Confirmation

Check if the command matches the profile exactly:

```bash
# This matches
"npm test"

# This doesn't match (different syntax)
"npm run test"
```

Use glob patterns for flexibility:

```json
"auto_approve": [
  "npm *",
  "git status*",
  "git diff*"
]
```

---

## Resources

- Claude Code Documentation: [code.claude.com](https://code.claude.com)
- Auto Mode Release Notes: [v2.1.94 changelog](https://code.claude.com/changelog)

---

**Last Updated:** 2026-04  
**Version:** 1.0.0
