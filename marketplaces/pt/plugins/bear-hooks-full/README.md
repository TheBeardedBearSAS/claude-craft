# Bear Craft — Hooks (full)

Extra hooks of the full profile: quality gate on stop, post-edit lint, tool-failure log, session init/end and Slack notifications. Install it next to bear-hooks.

## Installation

Inside Claude Code:

```
/plugin marketplace add TheBeardedBearSAS/bear-craft
/plugin install bear-hooks-full@bear-craft
```

Requires Claude Code 2.1.325 or later. Version 9.4.0.

## Requirements

- `jq` or `node` (hook payload parsing)
- `bash`
- optional: a Slack webhook for notifications

## Hooks

The hooks are declared in `hooks/hooks.json`; their scripts live in `hooks/scripts/` and run through `${CLAUDE_PLUGIN_ROOT}`.

This plugin only carries what the full profile adds to the default one: install `bear-hooks` as well.

**Pick a single channel**: these hook plugins *or* hooks merged into `.claude/settings.json` by an older copy-based installation. Using both runs every guard twice.

## About

Part of [Bear Craft](https://github.com/TheBeardedBearSAS/bear-craft) by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.

License: MIT. Author: The Bearded Bear.
