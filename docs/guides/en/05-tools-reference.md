# Tools Reference Guide

This guide covers the utility tools included with Claude-Craft for managing profiles, status display, project configuration, and Claude Code commands and features (v7.26.0).

---

## Table of Contents

1. [Claude Code Commands](#claude-code-commands)
2. [Hook Events](#hook-events)
3. [Agent Frontmatter](#agent-frontmatter)
4. [MCP Tool Search](#mcp-tool-search)
5. [Auto Mode](#auto-mode)
6. [Hook Templates](#hook-templates)
7. [Managed Settings](#managed-settings)
8. [MultiAccount Manager](#multiaccount-manager)
9. [StatusLine](#statusline)
10. [ProjectConfig Manager](#projectconfig-manager)
11. [Installation](#installation)

---

## Claude Code Commands

Claude Code provides built-in commands for context and session management. These are available in any Claude Code session (v2.1.47+).

### Context Management Commands

| Command | Version | Description |
|---------|---------|-------------|
| `/clear` | All | Clear context between unrelated tasks |
| `/compact` | All | Proactively compact context (run at ~70% usage) |
| `/context` | v2.1.74+ | Get actionable suggestions for context optimization |
| `/effort low\|medium\|high` | v2.1.72+ | Adjust model reasoning effort per task complexity |
| `/memory` | v2.1.59+ | Save persistent learnings across sessions and compactions |
| `/model haiku\|sonnet\|opus` | v2.1.72+ | Switch model mid-session based on task complexity |

### Session Commands

| Command | Version | Description |
|---------|---------|-------------|
| `/loop [interval] [command]` | v2.1.71+ | Run recurring tasks (e.g., `/loop 5m /common:pre-commit-check`) |
| `/proactive` | v2.1.105+ | Alias for `/loop` |
| `/color` | v2.1.94+ | Change terminal color scheme |
| `/rename` | v2.1.94+ | Rename current session |
| `/powerup` | v2.1.94+ | Enable power-up features |

### Usage Examples

```bash
# Adjust effort for a simple lookup
/effort low

# Switch to a cheaper model for exploration
/model sonnet

# Set up recurring CI monitoring
/loop 5m "Check if CI pipeline passed"

# Save important context before compaction
/memory "Authentication uses JWT with RS256, refresh tokens in HttpOnly cookies"
```

---

## Hook Events

Claude Code supports 24 hook events (8 new in v7.26.0) for automating workflows:

### All Hook Events

| Event | Timing | Use Case |
|-------|--------|----------|
| **PreToolUse** | Before tool execution | Block dangerous commands, rewrite with RTK |
| **PostToolUse** | After tool execution | Filter verbose output, summarize results |
| **PreCompact** | Before context compaction | Save critical context; exit code 2 blocks compaction (v2.1.105+) |
| **PostCompact** | After context compaction | Re-inject essential context |
| **SessionStart** | On session start | Load context essentials, setup environment |
| **StopFailure** | On unexpected stop | Save state, alert on failures |
| **Notification** | On notification events | Custom alerting |
| **TaskCreated** | When sub-agent task created | Track sub-agent work |
| **CwdChanged** | Working directory change | Update environment per directory |
| **FileChanged** | File modification detected | Trigger rebuilds, linting |
| **PermissionDenied** | Permission check fails | Log security events |
| **Elicitation** | Before user prompt | Customize elicitation flow |
| **ElicitationResult** | After user response | Process elicitation results |
| **Stop** | On session stop | Cleanup |

### Hook Enhancements (v7.26.0)

| Feature | Description |
|---------|-------------|
| **Conditional `if`** | Run hooks only when condition matches |
| **`defer`** | Defer hook execution to avoid blocking |
| **PreCompact blocking** | Exit code 2 in PreCompact hook blocks compaction (v2.1.105+) |

### Example: PostToolUse Output Filter

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "echo '$TOOL_OUTPUT' | head -100"
      }]
    }]
  }
}
```

---

## Agent Frontmatter

Custom agents (v2.1.78+) support frontmatter fields to control behavior and cost:

```yaml
---
effort: low          # Reasoning effort (low/medium/high)
maxTurns: 10         # Maximum conversation turns
disallowedTools:     # Tools the agent cannot use
  - Edit
  - Write
---
```

| Field | Type | Description |
|-------|------|-------------|
| `effort` | string | `low`, `medium`, or `high` reasoning effort |
| `maxTurns` | number | Maximum number of turns before stopping |
| `disallowedTools` | list | Tools the agent is not allowed to use |

This is useful for creating cost-effective exploration agents that can read but not modify code.

---

## MCP Tool Search

MCP Tool Search (v2.1.80+) enables lazy loading of MCP tools, reducing context consumption by 95%:

| Approach | Context Cost |
|----------|-------------|
| MCP classic (all tools loaded) | ~500-2000 tokens/tool/turn |
| MCP with Tool Search (lazy) | ~50 tokens total |

### Usage

```bash
# Load a specific tool on demand
ToolSearch with query: "select:tool_name"

# Search by keyword
ToolSearch with query: "slack send"
```

Instead of loading all MCP server tools at startup, Tool Search loads them only when needed.

---

## Auto Mode

Auto Mode (v2.1.94+) is an AI-powered permission classifier that replaces `--dangerously-skip-permissions` more safely:

| Mode | Protection | Speed | Use Case |
|------|-----------|-------|----------|
| Manual | Maximum | Slow | Audited workflows, high security |
| Auto Mode | High | Fast | Trusted dev workflows |
| Skip Permissions | Minimal | Maximum | Local/personal projects only |

**Safety features:**
- A background security model evaluates each tool call
- Safe operations (reads, tests) are auto-approved
- Risky actions (mass deletion, exfiltration) are blocked
- 3 consecutive blocks revert to manual mode
- 20+ blocks in a session revert to full manual mode

Available for Team plans with admin approval.

---

## Hook Templates

Claude-Craft provides ready-to-use hook templates in `.claude/templates/hooks/`:

| Template | Purpose |
|----------|---------|
| `output-filter.json` | PostToolUse filter for large CLI outputs |
| `pre-compact.json` | PreCompact hook to preserve critical context |
| `context-reinject.json` | SessionStart hook for context re-injection after compaction |

### Installation

Copy templates to your project's `.claude/settings.json` or merge into your hook configuration:

```bash
# View available templates
ls .claude/templates/hooks/

# Apply to your project (merge manually into settings.json)
cat .claude/templates/hooks/output-filter.json
```

---

## Managed Settings

The `managed-settings.d/` directory (v2.1.83+) enables modular configuration via alphabetical merge:

```
.claude/
  managed-settings.d/
    00-base.json          # Base configuration
    10-security.json      # Security rules
    20-team.json          # Team preferences
```

Files are merged in alphabetical order, allowing teams to layer configurations without conflicts.

---

## MultiAccount Manager

Manage multiple Claude Code profiles for different accounts or contexts.

### Purpose

- Switch between Claude accounts (personal, work, client)
- Manage rate limits by switching profiles
- Keep project contexts isolated
- Share or isolate configurations

### Installation

```bash
# Via Makefile
make install-multiaccount

# Or manually
cp Tools/MultiAccount/claude-accounts.sh ~/.local/bin/
chmod +x ~/.local/bin/claude-accounts.sh
```

### Usage

#### Interactive Mode

```bash
# Launch interactive menu
./claude-accounts.sh
# Or if installed globally
claude-accounts.sh
```

Menu options:
```
1. List profiles
2. Add a profile
3. Delete a profile
4. Authenticate a profile
5. Launch Claude Code
6. Install ccsp() function
7. Migrate legacy profile
8. Help
9. Exit
```

#### CLI Mode

```bash
# List all profiles
./claude-accounts.sh list

# Add new profile
./claude-accounts.sh add <profile-name>

# Remove profile
./claude-accounts.sh remove <profile-name>

# Authenticate profile
./claude-accounts.sh auth <profile-name>

# Launch Claude Code with profile
./claude-accounts.sh launch <profile-name>

# Show help
./claude-accounts.sh --help
```

### Profile Modes

#### Shared Mode (Default)

Profile shares configuration with main `~/.claude`:

```bash
./claude-accounts.sh add work --mode=shared
```

- Settings symlinked to `~/.claude`
- Good for: switching between accounts while keeping settings
- Use case: Rate limit management

#### Isolated Mode

Profile has completely independent configuration:

```bash
./claude-accounts.sh add client-a --mode=isolated
```

- Independent copy of settings
- Good for: client work with separate rules
- Use case: Different project configurations

### Quick Profile Switching

Install the `ccsp()` shell function:

```bash
# Add to profile via menu option 6
# Or manually add to ~/.bashrc or ~/.zshrc:

ccsp() {
    if [ -z "$1" ]; then
        claude-accounts.sh list
    else
        export CLAUDE_CONFIG_DIR="$HOME/.claude-profiles/$1"
        echo "Switched to profile: $1"
    fi
}
```

Usage:
```bash
# List profiles
ccsp

# Switch to profile
ccsp work

# Launch Claude Code (uses current profile)
claude
```

### Profile Structure

```
~/.claude-profiles/
├── work/
│   ├── .mode              # "shared" or "isolated"
│   ├── config/            # Claude configuration
│   └── settings.json      # Profile settings
├── client-a/
│   └── ...
└── personal/
    └── ...
```

### Language Support

```bash
# Use in specific language
./claude-accounts.sh --lang=fr list
./claude-accounts.sh --lang=es add trabajo
./claude-accounts.sh --lang=de --help
```

---

## StatusLine

Display contextual information in Claude Code's status bar.

### Purpose

- Show current profile
- Display model in use
- Show git branch and status
- Track context usage percentage
- Monitor session and weekly costs
- Display usage limits

### Installation

```bash
# Via Makefile
make install-statusline

# Or manually
cp Tools/StatusLine/statusline.sh ~/.claude/statusline.sh
cp Tools/StatusLine/statusline.conf.example ~/.claude/statusline.conf
chmod +x ~/.claude/statusline.sh
```

### Configure Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

### Status Line Format

```
🔑 pro | 🧠 Opus | 🌿 main +2~1 | 📁 my-project | 📊 45% | ⏱️ 5h: 23% | 📅 Sem: 45% | 💰 $0.42 | 🕐 14:32
```

| Element | Description |
|---------|-------------|
| 🔑 pro | Active profile name |
| 🧠 Opus | Current model (🧠 Opus, 🎵 Sonnet, 🍃 Haiku) |
| 🌿 main +2~1 | Git branch + status (+staged ~modified ?untracked) |
| 📁 my-project | Project directory name |
| 📊 45% | Context window usage |
| ⏱️ 5h: 23% | Session (5h) usage percentage |
| 📅 Sem: 45% | Weekly usage percentage |
| 💰 $0.42 | Session cost |
| 🕐 14:32 | Current time |

### Color Coding

Usage indicators change color based on thresholds:

| Color | Meaning | Threshold |
|-------|---------|-----------|
| Green | Low usage | < 60% |
| Yellow | Moderate usage | 60-80% |
| Red | High usage | > 80% |

### Configuration

Edit `~/.claude/statusline.conf`:

```bash
# =============================================================================
# USAGE LIMITS
# =============================================================================
# Recommended values by plan:
#   - Pro ($20/month)     : SESSION=25,   WEEKLY=150
#   - Max 5x ($100/month) : SESSION=125,  WEEKLY=750
#   - Max 20x ($200/month): SESSION=500,  WEEKLY=3000

SESSION_COST_LIMIT=500.00
WEEKLY_COST_LIMIT=3000.00

# =============================================================================
# ALERT THRESHOLDS (percentage)
# =============================================================================
USAGE_WARN_THRESHOLD=60    # Yellow at 60%
USAGE_CRIT_THRESHOLD=80    # Red at 80%

# =============================================================================
# CACHE (performance)
# =============================================================================
SESSION_CACHE_TTL=60       # Session refresh every 60s
WEEKLY_CACHE_TTL=300       # Weekly refresh every 5min

# =============================================================================
# DISPLAY OPTIONS
# =============================================================================
SHOW_SESSION_LIMIT=true
SHOW_WEEKLY_LIMIT=true

# Custom labels
SESSION_LABEL="⏱️ 5h"
WEEKLY_LABEL="📅 Sem"
```

### Dependencies

```bash
# Required: jq (JSON processor)
# macOS
brew install jq

# Linux
sudo apt install jq

# Optional: ccusage (cost tracking)
npm install -g ccusage
```

### Troubleshooting

**Status line not showing:**
```bash
# Check script is executable
ls -la ~/.claude/statusline.sh

# Test manually
echo '{"model":{"display_name":"Test"}}' | ~/.claude/statusline.sh
```

**Cost shows $0.00:**
```bash
# Verify ccusage works
npx ccusage daily --json
```

**Usage percentages not showing:**
```bash
# Check cache files
ls -la /tmp/.ccusage_*

# Clear cache to refresh
rm /tmp/.ccusage_*
```

---

## ProjectConfig Manager

Manage Claude-Craft project configurations via YAML.

### Purpose

- Define project settings in YAML
- Manage multiple projects
- Handle monorepo configurations
- Validate configurations
- Install rules from config

### Installation

```bash
# Via Makefile
make install-projectconfig

# Or manually
cp Tools/ProjectConfig/claude-projects.sh ~/.local/bin/
chmod +x ~/.local/bin/claude-projects.sh
```

### Dependencies

```bash
# Required: yq (YAML processor)
# macOS
brew install yq

# Linux (snap)
sudo snap install yq

# Linux (binary)
wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq
```

### Usage

#### Interactive Mode

```bash
./claude-projects.sh
```

Menu options:
```
1. List projects
2. Add a project
3. Edit a project
4. Add a module
5. Delete a project
6. Validate configuration
7. Install project
8. Help
9. Exit
```

#### CLI Mode

```bash
# List configured projects
./claude-projects.sh list

# Validate configuration file
./claude-projects.sh validate [config-file]

# Install specific project
./claude-projects.sh install <project-name>

# Install all projects
./claude-projects.sh install-all

# Show project details
./claude-projects.sh show <project-name>

# Add new project
./claude-projects.sh add <project-name> <path>

# Remove project
./claude-projects.sh remove <project-name>
```

### Configuration File

Default location: `./claude-projects.yaml`

```yaml
settings:
  default_lang: "fr"

projects:
  - name: "my-saas"
    description: "SaaS platform"
    path: "~/Projects/my-saas"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
      - name: "web"
        path: "frontend"
        technologies: ["react"]
      - name: "mobile"
        path: "app"
        technologies: ["flutter"]

  - name: "internal-tool"
    path: "~/Projects/internal"
    technologies: ["python"]
    lang: "en"
```

### Validation

```bash
# Validate configuration
./claude-projects.sh validate

# Or via Makefile
make config-validate CONFIG=claude-projects.yaml
```

Validation checks:
- YAML syntax valid
- Required fields present
- Paths exist
- Technologies valid
- Languages valid

### Installation from Config

```bash
# Install single project
./claude-projects.sh install my-saas

# Or via Makefile
make config-install CONFIG=claude-projects.yaml PROJECT=my-saas

# Install all projects
make config-install-all CONFIG=claude-projects.yaml

# Dry run
make config-install CONFIG=claude-projects.yaml PROJECT=my-saas OPTIONS="--dry-run"
```

### Language Support

```bash
# Use in specific language
./claude-projects.sh --lang=fr list
./claude-projects.sh --lang=de validate
```

---

## Installation

### Install All Tools

```bash
make install-tools
```

This installs:
- MultiAccount Manager
- StatusLine
- ProjectConfig Manager

### Install Individual Tools

```bash
# MultiAccount only
make install-multiaccount

# StatusLine only
make install-statusline

# ProjectConfig only
make install-projectconfig
```

### Verify Installation

```bash
# Check MultiAccount
which claude-accounts.sh
claude-accounts.sh --version

# Check StatusLine
ls ~/.claude/statusline.sh
cat ~/.claude/settings.json | jq '.statusLine'

# Check ProjectConfig
which claude-projects.sh
claude-projects.sh --version
```

---

## Quick Reference

### MultiAccount Commands

| Command | Description |
|---------|-------------|
| `list` | Show all profiles |
| `add <name>` | Create new profile |
| `remove <name>` | Delete profile |
| `auth <name>` | Authenticate profile |
| `launch <name>` | Start Claude with profile |
| `migrate` | Convert legacy profile |

### StatusLine Elements

| Emoji | Meaning |
|-------|---------|
| 🔑 | Profile |
| 🧠 | Opus model |
| 🎵 | Sonnet model |
| 🍃 | Haiku model |
| 🌿 | Git branch |
| 📁 | Project |
| 📊 | Context % |
| ⏱️ | Session usage |
| 📅 | Weekly usage |
| 💰 | Cost |
| 🕐 | Time |

### ProjectConfig Commands

| Command | Description |
|---------|-------------|
| `list` | Show all projects |
| `validate` | Check config validity |
| `install <name>` | Install project rules |
| `install-all` | Install all projects |
| `show <name>` | Show project details |
| `add <name> <path>` | Add new project |
| `remove <name>` | Delete project |

---

[&larr; Bug Fixing](04-bug-fixing.md) | [Troubleshooting &rarr;](06-troubleshooting.md)
