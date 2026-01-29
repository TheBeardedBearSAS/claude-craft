# Hooks Quick Start Guide

This directory contains Claude Code hooks for automated quality control and workflow enhancement.

## Setup

1. **Copy hooks to your project:**
   ```bash
   cp -r .claude/hooks/scripts/* .claude/hooks/
   chmod +x .claude/hooks/*.sh
   ```

2. **Enable hooks in settings.json:**
   Copy the configuration from `hooks/templates/settings-hooks.json` to your `.claude/settings.json`.

3. **Customize as needed** - Edit the scripts to match your project's tooling.

## Available Hooks

| Hook | Purpose | Event |
|------|---------|-------|
| `pre-commit-check.sh` | Block secrets in commits | PreToolUse |
| `post-edit-lint.sh` | Auto-lint on file save | PostToolUse |
| `quality-gate.sh` | Run tests before completion | Stop |
| `session-init.sh` | Load project context | SessionStart |
| `notify-slack.sh` | Slack notifications | Notification |
| `block-dangerous-commands.sh` | Block rm -rf, sudo, etc. | PreToolUse |
| `setup-init.sh` | Initialize project on first run | Setup |

## Hook Events (11 total)

- **PreToolUse / PostToolUse** - Before/after tool execution
- **Stop / SubagentStop** - When agent finishes
- **SessionStart / SessionEnd** - Session lifecycle
- **Setup** - On `--init`, `--init-only`, `--maintenance` (v2.1.20+)
- **PermissionRequest** - Permission dialogs
- **UserPromptSubmit** - User input
- **Notification** - Notifications
- **PreCompact** - Before context compaction

## Quick Enable

Add to your `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{"type": "command", "command": ".claude/hooks/quality-gate.sh"}]
    }]
  }
}
```

## More Information

See the full documentation: [docs/HOOKS.md](/docs/HOOKS.md)
