# Hook Templates

Claude Code hooks allow you to enforce rules programmatically, going beyond CLAUDE.md suggestions to actual enforcement.

> **Key insight:** CLAUDE.md = suggestions. Hooks = requirements.

## Available Templates

| Template | Hook Event | Purpose |
|----------|-----------|---------|
| `auto-format.json` | PostToolUse(Edit) | Auto-format code after each edit |
| `protect-files.json` | PreToolUse(Edit/Write) | Block edits on sensitive files |
| `context-reinject.json` | SessionStart(compact) | Re-inject context after compaction |
| `security-block.json` | PreToolUse(Bash) | Block suspicious network commands |

## How to Use

1. Choose a template from this directory
2. Copy the `hooks` section into your `.claude/settings.json`
3. Adapt the commands to your project

### Example: Adding auto-format

```json
// .claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "command": "npx prettier --write \"$FILEPATH\""
      }
    ]
  }
}
```

## Hook Events Reference

| Event | When | Common Use |
|-------|------|------------|
| `PreToolUse` | Before a tool executes | Block dangerous operations |
| `PostToolUse` | After a tool executes | Format code, run linters |
| `SessionStart` | When session starts | Load context, check environment |
| `SessionStart(compact)` | After context compaction | Re-inject essential context |
| `TeammateIdle` | When a teammate goes idle | Assign next task |
| `TaskCompleted` | When a task is completed | Trigger next workflow step |

## Combining Templates

You can combine multiple hooks in the same `settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "# security-block check"
      },
      {
        "matcher": "Edit",
        "command": "# protect-files check"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "command": "# auto-format"
      }
    ],
    "SessionStart": [
      {
        "matcher": "compact",
        "command": "# context-reinject"
      }
    ]
  }
}
```

## Creating Custom Hooks

Hooks are shell commands that receive tool context via environment variables:

- `$TOOL_INPUT` — JSON input for the tool
- `$TOOL_OUTPUT` — JSON output from the tool (PostToolUse only)
- `$FILEPATH` — File path for file-related tools

Exit codes:
- `0` — Allow the operation
- Non-zero — Block the operation (PreToolUse) or report error (PostToolUse)

## Resources

- [Claude Code Hooks Documentation](https://docs.anthropic.com/en/docs/claude-code/hooks)
- Rule: `.claude/rules/11-security.md` — MCP & Plugins Security section
- Rule: `.claude/rules/12-context-management.md` — Context Compaction section
