# Hook Examples

Claude Code hooks enforce rules programmatically, beyond what CLAUDE.md can suggest.

> **Key insight:** CLAUDE.md = suggestions. Hooks = requirements.

These examples are copied into `.claude/templates/hooks/` by the claude-craft installer
(`install-common-rules.sh --hooks=default|full|none`, `--hooks=none` copies nothing).
The scripts they call are installed in `.claude/hooks/`. In the repository itself they
live in `Dev/i18n/base/Common/hooks/templates/examples/`.

## Available examples

| Example | Hook event | Purpose |
|---------|-----------|---------|
| `auto-format.json` | PostToolUse (Edit\|Write) | Format the edited file |
| `protect-files.json` | PreToolUse (Edit\|Write\|NotebookEdit) | Block edits of sensitive files (`protect-sensitive-files.sh`) |
| `security-block.json` | PreToolUse (Bash) | Block download-then-execute (`guard-network.sh`) |
| `block-dangerous-commands.json` | PreToolUse (Bash) | Block destructive commands (`block-dangerous-commands.sh`) |
| `context-reinject.json` | SessionStart (compact) | Re-inject `context-essentials.md` after compaction |
| `pre-compact.json` | PreCompact | Give the compaction summary the critical context (plain text) |
| `output-filter.json` | PostToolUse (Bash) | Replace outputs above 50 KB by an extract (`output-filter.sh`) |
| `stop-hook.json` | Stop | Log each end of turn |
| `user-prompt-submit.json` | UserPromptSubmit | Log the size of each prompt |

The default profile (`--hooks=default`) already wires `protect-files`, `security-block`,
`block-dangerous-commands`, `context-reinject` and `pre-compact`; `--hooks=full` adds the
Stop quality gate, lint and the session hooks. The persistent memory add-on is installed
with `--hooks=default,memory` (SQLite database `.claude/memory.db`, not `MEMORY.md`).

## How to use

Never copy an example over `.claude/settings.json` or `.claude/settings.local.json`: that
would erase your existing hooks and settings. Merge instead:

```bash
node <claude-craft>/Dev/scripts/lib/merge-hooks.mjs add \
  --settings .claude/settings.json \
  --fragment .claude/templates/hooks/output-filter.json
```

`merge-hooks.mjs` is idempotent and never removes or rewrites a hook it does not own
(`<claude-craft>` is the installed npm package or your clone of the repository).
You can also paste the `hooks` section by hand.

## Hook contract (summary)

- Handlers use the nested schema `{ "matcher": ..., "hooks": [ { "type": "command", "command": ..., "timeout": <seconds> } ] }`.
- The payload is **JSON on stdin** (no `$TOOL_INPUT` / `$FILEPATH` variables). Read it with `jq` or `node`.
- **Only exit code 2 blocks** (PreToolUse, UserPromptSubmit, Stop...); stderr is shown to Claude.
  Any other non-zero code is a non-blocking error: the action goes ahead.
- Only `hookSpecificOutput.additionalContext` reaches the model; `systemMessage` is UI-only.
- `timeout` is in seconds. A matcher containing `(` is read as a regex and will not match a tool name.

Official reference (events, fields, exit codes): <https://code.claude.com/docs/en/hooks>

## Resources

- Rule `11-security.md` (MCP and plugins security), rule `12-context-management.md` (compaction)
