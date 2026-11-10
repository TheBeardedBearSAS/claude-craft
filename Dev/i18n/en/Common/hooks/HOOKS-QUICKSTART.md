# Hooks Quick Start Guide

Claude Code hooks for automated quality control and safety, installed in your project by claude-craft.

## Setup

1. **Install with the installer** (copies the scripts to `.claude/hooks/` and merges the hooks into `.claude/settings.json` without overwriting yours):
   ```bash
   bash Dev/scripts/install-common-rules.sh --hooks=default /path/to/project
   # or through the CLI: npx @the-bearded-bear/claude-craft install . --hooks=default
   ```
   - `--hooks=default` (default): safety guards, secrets check, output hints, context re-injection after compaction.
   - `--hooks=full`: `default` plus the Stop test gate, post-edit lint, Slack notification, session init/end metrics and tool-failure hints.
   - `--hooks=none`: no hooks. Append `,memory` (e.g. `--hooks=default,memory`) for the SQLite cross-session memory add-on (needs `sqlite3` and `jq`).

2. **Customize as needed**: edit the scripts in `.claude/hooks/` to match your tooling. Re-running the installer never removes or rewrites your own hooks.

3. **Merge by hand** if you prefer: the fragments are `hooks.default.json`, `hooks.full.json` and `hooks.memory.json` (`node <claude-craft>/Dev/scripts/lib/merge-hooks.mjs add --settings .claude/settings.json --fragment <fragment>`). Ready-to-adapt examples are copied to `.claude/templates/hooks/`.

## Available Hooks

| Hook | Purpose | Event | Profile |
|------|---------|-------|---------|
| `guard-network.sh` | Block download-then-execute (`curl \| sh`) | PreToolUse | default |
| `block-dangerous-commands.sh` | Block `rm -rf /`, `sudo`, `chmod 777`... | PreToolUse | default |
| `pre-commit-check.sh` | Block secrets in commits | PreToolUse | default |
| `protect-sensitive-files.sh` | Block edits of `.env`, keys... | PreToolUse | default |
| `output-size-hint.sh` | Hint to summarize large outputs | PostToolUse | default |
| `post-edit-lint.sh` | Auto-lint after edits | PostToolUse | full |
| `quality-gate.sh` | Run tests before completion | Stop | full |
| `notify-slack.sh` | Slack notifications | Notification | full |
| `session-init.sh` | Detect the stack, export safe `.env.local` variables | SessionStart | full |
| `session-end.sh` | Session log and metrics | SessionEnd | full |
| `post-tool-failure.sh` | Recovery hints after a tool failure | PostToolUseFailure | full |
| `pre-compact.sh` | Back up BMAD state before compaction | PreCompact | optional (not wired) |
| `output-filter.sh` | Truncate outputs above 50 KB | PostToolUse | optional (example) |

## Things to know

- The payload arrives as **JSON on stdin**; only **exit code 2** blocks (any other non-zero code is a non-blocking error).
- Only `hookSpecificOutput.additionalContext` reaches the model; PreCompact plain-text stdout is read as compaction instructions.
- Scripts need `jq` or `node` to read the payload: the safety guards block when neither is available, the informational hooks do nothing.

## More Information

Full documentation: [docs/HOOKS.md](/docs/HOOKS.md) and the official reference <https://code.claude.com/docs/en/hooks>.
