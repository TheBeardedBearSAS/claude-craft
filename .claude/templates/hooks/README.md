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
| `pre-compact.json` | PreCompact | Sauvegarde le contexte critique avant compaction (token optim) |
| `post-compact.json` | PostCompact (2.1.76+) | Re-injecte le contexte essentiel immédiatement après compaction |
| `output-filter.json` | PostToolUse(Bash) | Filtre les outputs >10KB (RTK ultra-compact, -60-90% tokens CLI) |
| `block-dangerous-commands.json` | PreToolUse(Bash) | Bloque les commandes destructives (rm -rf /, dd, mkfs) |
| `quality-gate.json` | PreToolUse(Edit) | Bloque les edits qui violent les SOLID/KISS principes |
| `memory-lifecycle.json` | SessionStart/SessionEnd | Gestion du fichier MEMORY.md |

## How to Use

1. Choose a template from this directory
2. Copy the `hooks` section into your `.claude/settings.json`
3. Adapt the commands to your project

### Token Optimization Stack (recommended)

For maximum token savings (55-65% reduction global), apply this combo :

```bash
# 1. Output filter (PostToolUse Bash) - guides Claude to summarize >10KB outputs
cp .claude/templates/hooks/output-filter.json .claude/settings.local.json

# 2. PreCompact hook - preserves critical context before compaction
cp .claude/templates/hooks/pre-compact.json .claude/settings.local.json

# 3. SessionStart compact reinject - restores context-essentials.md after compaction
cp .claude/templates/hooks/context-reinject.json .claude/settings.local.json
```

Combined with `context: fork` on heavy skills (already enabled by Claude Craft) and `CLAUDE_CODE_SUBAGENT_MODEL=sonnet`, you reach the 55-65% global token reduction documented in `.claude/rules/12-context-management.md` §15.

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

- [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks)
- Rule: `.claude/rules/11-security.md` — MCP & Plugins Security section
- Rule: `.claude/rules/12-context-management.md` — Context Compaction section
