# RTK - Token Optimizer for Claude Code

RTK (Rust Token Killer) is a CLI proxy that reduces LLM token consumption by **60-90%** by intercepting terminal commands and compressing their outputs.

## How it Works

```
Claude Code runs "git status"
        |
        v
PreToolUse hook rewrites -> "rtk git status"
        |
        v
RTK executes the real command
        |
        v
Output filtered/compressed (85% less tokens)
        |
        v
Compact output returned to Claude Code
```

## Installation

### Via Makefile

```bash
make install-rtk RULES_LANG=fr
```

### Via CLI

```bash
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en
# Answer 'y' to "Include Token Optimization (RTK)?"
```

### Via Claude Code Command

```bash
/common:setup-rtk
```

### Manual

```bash
bash Tools/RTK/install-rtk.sh --lang=en
```

## Options

| Option | Description |
|--------|-------------|
| `--lang=XX` | Language: en, fr, es, de, pt (default: en) |
| `--check` | Check installation status |
| `--uninstall` | Remove RTK hooks (keeps binary) |

## What it Does

1. **Installs RTK binary** via the official installer
2. **Creates hook script** at `~/.claude/hooks/rtk-rewrite.sh`
3. **Merges settings.json** — safely adds RTK hook to `PreToolUse[]` without overwriting existing hooks

## Safe Merge

The installer performs a **safe merge** of `~/.claude/settings.json`:
- Creates a backup before any modification
- Appends the RTK hook alongside existing hooks (security hooks are preserved)
- Is idempotent (running twice produces no duplicates)

## Uninstall

```bash
bash Tools/RTK/install-rtk.sh --uninstall
```

This removes the hook from `settings.json` and deletes the hook script. The RTK binary is kept.

## Check Status

```bash
bash Tools/RTK/install-rtk.sh --check
```

Shows binary version, hook status, and token savings.

## Token Savings

After using Claude Code with RTK, check your savings:

```bash
rtk gain
```

## Tests

```bash
docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/RTK/tests/
```
