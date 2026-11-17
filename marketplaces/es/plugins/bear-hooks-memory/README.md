# Bear Craft — Hooks (memory)

Cross-session memory hooks backed by SQLite (session start, prompt submit, post-tool, pre-compact, session end).

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-hooks-memory@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 9.4.0.

## Requirements

- `sqlite3` (system package)
- `jq` (system package)
- `bash`

## Hooks

The hooks are declared in `hooks/hooks.json`; their scripts live in `hooks/scripts/` and run through `${CLAUDE_PLUGIN_ROOT}`.

**Pick a single channel**: these hook plugins *or* hooks merged into `.claude/settings.json` by an older copy-based installation. Using both runs every guard twice.

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
