---
description: Configure RTK and token optimization for Claude Code
argument-hint: [--check]
---

# Token Optimization Setup

Configure RTK (Rust Token Killer) and comprehensive token optimization for Claude Code sessions.

## Steps

### 1. Check RTK Installation

```bash
# Check if RTK is installed
if command -v rtk &>/dev/null; then
  echo "RTK installed: $(rtk --version)"
  echo ""
  rtk gain 2>/dev/null || echo "No savings data yet"
else
  echo "RTK is NOT installed"
  echo "Install with: curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | bash"
  echo "Or run: make install-rtk (from claude-craft root)"
fi
```

### 2. Configure RTK Optimizations

If RTK is installed, apply these optimizations:

#### a) Enable ultra-compact mode

Check the hook at `~/.claude/hooks/rtk-rewrite.sh`. The rewrite command should use `--ultra-compact`:

```bash
REWRITTEN=$(rtk rewrite --ultra-compact "$CMD" 2>/dev/null)
```

If it doesn't have `--ultra-compact`, update the hook file.

#### b) Optimize RTK limits

Check `~/.config/rtk/config.toml` and recommend these limits:

```toml
[limits]
grep_max_results = 100
grep_max_per_file = 10
status_max_files = 10
status_max_untracked = 5
passthrough_max_chars = 1500
```

#### c) Add custom filters

Check `~/.config/rtk/filters.toml`. If it only contains template comments, suggest filters based on the detected project stack:

- **Docker projects**: Add docker exec, compose, logs filters
- **Node.js projects**: Add npm/npx install filters
- **PHP projects**: Add composer filters
- **Python projects**: Add pip install filters

### 3. Configure Sub-Agent Model and Forked Subagents

Check if both env vars are set:

```bash
echo "CLAUDE_CODE_SUBAGENT_MODEL=${CLAUDE_CODE_SUBAGENT_MODEL:-NOT SET}"
echo "CLAUDE_CODE_FORK_SUBAGENT=${CLAUDE_CODE_FORK_SUBAGENT:-NOT SET}"
```

If not set, recommend adding to `~/.bashrc` (or `~/.zshrc`):

```bash
# Use Sonnet 4.6 for sub-agents (exploration, grep, file reading) instead of Opus
# → 40-60% cost reduction on sub-agent invocations
export CLAUDE_CODE_SUBAGENT_MODEL="sonnet"

# Run sub-agents in isolated contexts (Claude Code 2.1.117+, see COMPATIBILITY.md)
# → Avoids polluting the main context window with sub-agent intermediate state
# → Compounds with context: fork on skills (~8-15K tokens saved per long session)
export CLAUDE_CODE_FORK_SUBAGENT=1
```

After updating, reload your shell: `source ~/.bashrc`.

### 4. Configure Hooks

Check the current settings.json for these hooks:

| Hook | Purpose | Status |
|------|---------|--------|
| **PreToolUse** (Bash) | RTK rewrite | Check if configured |
| **PostToolUse** (Bash) | Output filtering | Check if configured |
| **PreCompact** | Context preservation | Check if configured |
| **SessionStart** (compact) | Context re-injection | Check if configured |

For missing hooks, reference the templates in `.claude/templates/hooks/`:
- `output-filter.json` — PostToolUse for large output filtering
- `pre-compact.json` — PreCompact for context preservation
- `context-reinject.json` — SessionStart for post-compaction re-injection

### 5. Summary

Display a summary table of all optimizations with their status:

| Optimization | Expected Savings | Status |
|---|---|---|
| RTK installed + hooks | 60-90% on CLI output | ? |
| RTK ultra-compact | +5-10% additional | ? |
| RTK optimized limits | grep 19% -> 40-50% | ? |
| RTK custom filters | +30-50% on docker/npm | ? |
| Sub-agent model (Sonnet) | 40-60% cost reduction | ? |
| Forked sub-agents (`CLAUDE_CODE_FORK_SUBAGENT=1`) | 8-15K tokens/long session | ? |
| PostToolUse hook | Reduces context pollution | ? |
| PreCompact hook | Preserves critical context | ? |

**Target: 55-65% overall token efficiency**

## Arguments

- `$ARGUMENTS` — Pass `--check` to only display current status without making changes
