# Stack profiles

Language-agnostic per-technology data used by the installers to render
stack-aware root files (`CLAUDE.md`, `AGENTS.md`, `.claude/settings.json`)
from the `--tech=a,b,c` list. Read by `Dev/scripts/lib/stack-profiles.sh`.

One directory per tech key (same keys as `cli/lib/tech-registry.js` plus infra techs):

| File | Required | Format |
|------|----------|--------|
| `stack.txt` | yes | Line 1: display name. Line 2: main components (comma-separated) |
| `quality.md` | no | Markdown bullets, tool names only (no prose — shared by all languages) |
| `permissions.txt` | no | One Claude Code permission rule per line, e.g. `Bash(pytest:*)` |

Adding a tech: create its directory here; `tests/content/stack-profiles.test.mjs` checks every registry tech has one.
