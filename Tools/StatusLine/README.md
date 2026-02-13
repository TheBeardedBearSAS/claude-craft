# Claude Code Status Line v2.0

A customizable status line for Claude Code displaying contextual information.

## Preview

**Compact mode** (default, 1 line):
```
🔑 pro | 🧠 Opus | 🌿 main +2~1 | 📁 my-project | 📊 42% | ⏱️ 5h: 23% | 📅 Sem: 45% | 💰 $0.42 | 🕐 14:32
```

**Detailed mode** (2 lines):
```
🔑 pro | 🧠 Opus | 🌿 main +2~1 | 📁 my-project | @agent | NORMAL
📊 [▓▓▓▓░░░░░░] 42% | 💰 $0.42 ($0.12/min) | +156 -23 | ⏱️ 5h: 23% | 📅 Sem: 45% | 🕐 14:32
```

### Elements

| Emoji | Element | Description |
|-------|---------|-------------|
| 🔑 | Profile | Active Claude account (via `CLAUDE_CONFIG_DIR`) |
| 🧠/🎵/🍃 | Model | Opus / Sonnet / Haiku |
| 🌿 | Git | Branch + status (+staged ~modified ?untracked) |
| 📁 | Project | Project directory name |
| @ | Agent | Current agent name (when using agents) |
| | Vim mode | NORMAL / INSERT (when vim mode enabled) |
| 📊 | Context | % context window used (percentage, bar, or both) |
| ⏱️ | Session | % session limit used (via ccusage) |
| 📅 | Weekly | % weekly limit used (via ccusage) |
| 💰 | Cost | Session cost in USD (+ optional burn rate $/min) |
| 🕐 | Time | Current time |

## Installation

### 1. Copy the script

```bash
mkdir -p ~/.claude
cp statusline.sh ~/.claude/statusline.sh
cp statusline.conf.example ~/.claude/statusline.conf
chmod +x ~/.claude/statusline.sh
```

### 2. Configure Claude Code

Merge into your `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

### 3. Install dependencies

```bash
# jq is required for JSON parsing
# macOS
brew install jq

# Linux (Debian/Ubuntu)
sudo apt install jq

# ccusage (optional — for session/weekly usage tracking)
npm install -g ccusage
```

### 4. Verify

```bash
# Check version
bash ~/.claude/statusline.sh --version

# Test with sample JSON
echo '{"model":{"display_name":"Opus","id":"claude-opus-4-6"},"context_window":{"used_percentage":42},"cost":{"total_cost_usd":0.5},"workspace":{"current_dir":"/tmp/test","project_dir":"/tmp/test"}}' | bash ~/.claude/statusline.sh
```

## Configuration

Edit `~/.claude/statusline.conf` (copied from `statusline.conf.example`):

### Element Toggles

Every element can be shown or hidden independently:

```bash
SHOW_PROFILE=true          # 🔑 Profile name
SHOW_MODEL=true            # 🧠 Model name
SHOW_GIT=true              # 🌿 Git branch + status
SHOW_PROJECT=true          # 📁 Project name
SHOW_CONTEXT=true          # 📊 Context percentage
SHOW_COST=true             # 💰 Session cost
SHOW_TIME=true             # 🕐 Current time
SHOW_AGENT=true            # @ Agent name (auto)
SHOW_VIM_MODE=true         # Vim mode (auto)
SHOW_SESSION_LIMIT=true    # ⏱️ Session usage %
SHOW_WEEKLY_LIMIT=true     # 📅 Weekly usage %
SHOW_BURN_RATE=false       # $/min (opt-in)
SHOW_LINES_CHANGED=false   # +N -M lines (opt-in)
```

### Display Mode

```bash
STATUSLINE_MODE=compact    # compact (1 line) or detailed (2 lines)
```

### Context Bar Style

```bash
CONTEXT_BAR_STYLE=percentage   # "42%"
# CONTEXT_BAR_STYLE=bar        # "[▓▓▓▓░░░░░░]"
# CONTEXT_BAR_STYLE=both       # "[▓▓▓▓░░░░░░] 42%"
```

### Usage Limits

Adjust for your Claude subscription plan:

```bash
# Pro ($20/month)
SESSION_COST_LIMIT=25.00
WEEKLY_COST_LIMIT=150.00

# Max 5x ($100/month)
SESSION_COST_LIMIT=125.00
WEEKLY_COST_LIMIT=750.00

# Max 20x ($200/month) — default
SESSION_COST_LIMIT=500.00
WEEKLY_COST_LIMIT=3000.00
```

### Alert Thresholds

```bash
CONTEXT_WARN_THRESHOLD=60    # Yellow at 60%
CONTEXT_CRIT_THRESHOLD=80    # Red at 80%
USAGE_WARN_THRESHOLD=60
USAGE_CRIT_THRESHOLD=80
```

### Cache TTL

```bash
SESSION_CACHE_TTL=60     # Session usage cache (seconds)
WEEKLY_CACHE_TTL=300     # Weekly usage cache (seconds)
GIT_CACHE_TTL=5          # Git status cache (seconds)
```

## Troubleshooting

### Status line not showing

1. Verify the script is executable: `ls -la ~/.claude/statusline.sh`
2. Check settings.json format — must use `"type": "command"`:
   ```bash
   cat ~/.claude/settings.json | jq '.statusLine'
   # Expected: { "type": "command", "command": "~/.claude/statusline.sh" }
   ```
3. Test manually: `echo '{"model":{"display_name":"Test"}}' | ~/.claude/statusline.sh`
4. Verify jq is installed: `which jq`

### Cost always shows $0.00

Claude Code provides `cost.total_cost_usd` natively. If it shows 0, the session may have just started.

### Session/Weekly limits not showing

- Install ccusage globally: `npm install -g ccusage`
- Verify it works: `ccusage daily --json`
- Values only appear when usage > 0%
- Cache may delay display (60s session, 5min weekly)

### Context % seems incorrect

v2.0 reads `context_window.used_percentage` natively from Claude Code.
Falls back to transcript size estimation only if native value is unavailable.

## What's New in v2.0

- **Fixed settings.json format** — uses correct `"type": "command"` format
- **Native context window** — reads `context_window.used_percentage` from Claude Code
- **Single jq call** — 7 separate jq invocations replaced by 1 (performance)
- **Cross-platform** — `stat` helper works on both Linux and macOS
- **Git cache** — git status cached for 5s to reduce overhead
- **Progress bar** — context can display as `[▓▓▓▓░░░░░░]`
- **Detailed mode** — 2-line layout with identity + metrics
- **Agent name** — shows `@agent-name` when using agents
- **Vim mode** — shows NORMAL/INSERT when vim mode is enabled
- **Burn rate** — optional $/min display
- **Lines changed** — optional +N -M from Claude Code
- **Full toggles** — every element individually toggleable
- **--version / --help** flags
- **Global ccusage preferred** — avoids slow `npx --yes` downloads
