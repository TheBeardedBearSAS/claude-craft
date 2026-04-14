# Claude Code Compatibility

**Minimum Version**: 2.1.47
**Recommended Version**: 2.1.107

This document tracks Claude Code features and version compatibility for claude-craft.

---

### PR Integration (v2.1.27+)

| Feature | CLI Option | Description |
|---------|------------|-------------|
| Resume PR session | `--from-pr 123` or `--from-pr <url>` | Resume session linked to a PR |
| PR Status | Footer indicator | Shows PR state in status line |
| Auto-link | via `gh pr create` | Sessions auto-link when creating PR |

**PR Status Indicators:**

| Status | Indicator |
|--------|-----------|
| Approved | approved |
| Pending | pending |
| Changes Requested | changes requested |
| Draft | draft |
| Merged | merged |

### File Operations Best Practice (v2.1.21+)

Claude prefers native file tools over bash equivalents for better reliability:

| Task | Use | Avoid |
|------|-----|-------|
| Read files | `Read` tool | `cat`, `head`, `tail` |
| Edit files | `Edit` tool | `sed`, `awk` |
| Write files | `Write` tool | `echo >`, `cat <<EOF` |

### spinnerVerbs Configuration (v2.1.23+)

Customize spinner text displayed during tool execution:

```json
{
  "spinnerVerbs": {
    "default": ["Thinking", "Processing"],
    "Edit": ["Editing", "Modifying"],
    "Bash": ["Running", "Executing"]
  }
}
```

Linked to `activeForm` field in TaskCreate for custom task spinners.

### Background Agent Permissions (v2.1.20+)

Background agents request permissions **before** launching, avoiding mid-execution blocks:

```
Launching background task: "Analyze and fix code"

This task will need permissions for:
- Read (all files)
- Edit (src/**)
- Bash (npm run lint:fix)

Approve all? [y/N/select]
```

### Task Status: deleted (v2.1.20+)

Tasks can now be permanently removed using `deleted` status via TaskUpdate:

```
pending → in_progress → completed
              ↓
           deleted
```

### VSCode Python venv (v2.1.21+)

Setting `claudeCode.usePythonEnvironment` enables automatic virtual environment activation in VSCode.

### PDF Page Range Support (v2.1.30+)

The Read tool now supports a `pages` parameter for PDF files:

| Feature | Description |
|---------|-------------|
| `pages` parameter | Specify page range (e.g., `pages: "1-5"`) |
| Large PDF optimization | PDFs >10 pages return lightweight reference when `@` mentioned |

### OAuth Client Credentials for MCP (v2.1.30+)

For MCP servers that don't support Dynamic Client Registration:

| Flag | Description |
|------|-------------|
| `--client-id` | OAuth client ID for the MCP server |
| `--client-secret` | OAuth client secret for the MCP server |

Usage: `claude mcp add --client-id <id> --client-secret <secret> <server-name>`

### /debug Command (v2.1.30+)

| Command | Description |
|---------|-------------|
| `/debug` | Troubleshoot current session issues |

Complements `/doctor` (environment diagnostics) with session-specific debugging.

### Task Tool Metrics (v2.1.30+)

Task tool results now include execution metrics:

| Metric | Description |
|--------|-------------|
| Token count | Tokens consumed by the sub-agent |
| Tool uses | Number of tool invocations |
| Duration | Elapsed time for task execution |

### Reduced Motion Mode (v2.1.30+)

Configuration option to minimize animations: `"reducedMotion": true` in settings.json.

### Session Resume Hint (v2.1.31+)

On exit, Claude Code now displays a hint showing how to resume the current session.

### PDF Limits Clarification (v2.1.31+)

Improved error messages now show actual PDF limits:

| Limit | Value |
|-------|-------|
| Max pages | 100 pages per request |
| Max file size | 20MB |

### Enhanced File Tools Preference (v2.1.31+)

System prompts improved to more strongly guide Claude toward using dedicated tools (`Read`, `Edit`, `Glob`, `Grep`) instead of bash equivalents (`cat`, `sed`, `grep`, `find`).

### Reduced Layout Jitter (v2.1.31+)

Terminal layout jitter reduced when the spinner appears and disappears during streaming.

### Japanese IME Support (v2.1.31+)

Added support for full-width (zenkaku) space input from Japanese IME in checkbox selection.

### Third-party Provider Pricing (v2.1.31+)

Removed misleading Anthropic API pricing from model selector for third-party provider (Bedrock, Vertex, Foundry) users.

### Claude Opus 4.6 Support (v2.1.32+)

New flagship model with enhanced capabilities:

| Feature | Value |
|---------|-------|
| Model ID | `claude-opus-4-6` |
| Context window | 200K standard, 1M beta |
| Max output | 128K tokens |
| Adaptive thinking | Effort levels: low, medium, high, max |
| Context compaction | Beta - automatic context management |

### Agent Teams (v2.1.32+ Research Preview)

Multi-agent coordination with shared task management:

| Feature | Description |
|---------|-------------|
| `Teammate` tool | spawnTeam, cleanup operations |
| `SendMessage` tool | message, broadcast, shutdown_request/response |
| Shared tasks | TaskCreate/Update/List/Get across team |
| Display modes | In-process (Shift+Up/Down), split panes (tmux/iTerm2) |
| Delegate mode | Shift+Tab to switch between teammates |

Enable: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`

### Automatic Memory Recording (v2.1.32+)

Claude automatically records session memory for future context:

| Feature | Value |
|---------|-------|
| Trigger | After ~10K tokens of conversation |
| Update frequency | Every ~5K tokens or 3 tool calls |
| Storage | `~/.claude-profiles/<profile>/projects/<hash>/memory/` |

### Summarize from Here (v2.1.32+)

Partial conversation summarization - summarize from a specific point rather than the entire conversation.

### Auto Skill Loading from --add-dir (v2.1.32+)

Skills in directories added via `--add-dir` are now automatically discovered and available.

### Skill Character Budget Scaling (v2.1.32+)

Skill content budget now scales to 2% of the model's context window size.

### --resume Agent Inheritance (v2.1.32+)

When resuming a session with `--resume`, the `--agent` value is automatically inherited from the original session.

### VSCode Session Loading Spinner (v2.1.32+)

Added loading spinner in VSCode while session is being restored.

### TeammateIdle & TaskCompleted Hook Events (v2.1.33+)

New hook events for multi-agent workflows:

| Event | When it fires | Use case |
|-------|---------------|----------|
| `TeammateIdle` | When a teammate goes idle | Assign next task, cleanup |
| `TaskCompleted` | When a task is marked completed | Trigger next workflow step |

### Agent Type Restrictions (v2.1.33+)

Control which sub-agent types an agent can spawn using `Task(agent_type)` in the `tools` frontmatter:

| Syntax | Description |
|--------|-------------|
| `Task(Explore)` | Only allow Explore sub-agents |
| `Task(Plan)` | Only allow Plan sub-agents |
| `Task(Bash)` | Only allow Bash sub-agents |

### Agent Memory Frontmatter (v2.1.33+)

Persistent memory for sub-agents with three scope options:

| Scope | Location | Use Case |
|-------|----------|----------|
| `user` | `~/.claude/agent-memory/<name>/` | Cross-project learnings (recommended) |
| `project` | `.claude/agent-memory/<name>/` | Project-specific, shareable via VCS |
| `local` | `.claude/agent-memory-local/<name>/` | Project-specific, NOT in VCS |

### Plugin Name in Skill Descriptions (v2.1.33+)

Plugin names now appear in skill descriptions and the `/skills` menu.

### VSCode Remote Sessions (v2.1.33+)

OAuth users can browse and resume Claude Code sessions from claude.ai remotely.

### VSCode Session Picker Enhancements (v2.1.33+)

Git branch and message count now displayed in session picker, with search by branch name.

### Fast Mode (v2.1.36+)

Toggle fast mode for Opus 4.6 with the `/fast` command:

| Feature | Description |
|---------|-------------|
| Command | `/fast` to toggle on/off |
| Speed | Up to 2.5x faster output tokens |
| Intelligence | Same Opus 4.6 capabilities |
| Visual indicator | Lightning bolt icon when enabled |
| Persistence | Setting persists across sessions |
| Pricing (fast) | $30/M input, $150/M output |
| Pricing (standard) | $5/M input, $25/M output |

### Security: Skills Directory Protection (v2.1.38+)

Writes to `.claude/skills` directory are now blocked in sandbox mode.

### Heredoc Fix for JS Template Literals (v2.1.38+)

Bash tool no longer produces "Bad substitution" errors with heredocs containing JavaScript template literals like `${index + 1}`.

### Plan Mode Crash Fix (v2.1.38+)

Fixed crash when entering plan mode with project config in `~/.claude.json` missing default fields.

### temperatureOverride Fix (v2.1.38+)

`temperatureOverride` is no longer silently ignored in the streaming API path.

### VSCode Fixes (v2.1.37/v2.1.38)

| Fix | Description |
|-----|-------------|
| Terminal scroll | Fixed scroll-to-top regression from v2.1.37 |
| Tab key | Fixed Tab key queueing slash commands instead of autocompleting |
| Duplicate sessions | Fixed duplicate sessions when resuming in VSCode |

### LSP Compatibility (v2.1.38+)

Fixed LSP shutdown/exit compatibility with strict language servers that reject null params.

### Text Rendering Fixes (v2.1.38+)

| Fix | Description |
|-----|-------------|
| Thai/Lao spacing | Fixed Thai/Lao spacing vowels rendering in input field |
| Tool use text | Fixed text between tool uses disappearing when not streaming |

### Nested Session Guard (v2.1.39+)

Claude Code now prevents launching inside another Claude Code session, avoiding accidental session inception.

### Agent Teams Cloud Provider Fix (v2.1.39+)

Fixed Agent Teams using wrong model identifier for Bedrock, Vertex, and Foundry customers.

### Non-Agent Markdown Warning Fix (v2.1.39+)

Fixed spurious warnings for non-agent markdown files in `.claude/agents/` directory. Only files with valid agent frontmatter are now treated as agents.

### OTel Fast Mode Tracing (v2.1.39+)

Added `speed` attribute to OTel events and trace spans for fast mode visibility in observability tools.

### Terminal & Streaming Fixes (v2.1.39+)

| Fix | Description |
|-----|-------------|
| MCP image streaming | Fixed crash when MCP tools return image content during streaming |
| /resume previews | Fixed raw XML tags shown instead of readable command names |
| Terminal rendering | Improved rendering performance and fixed character loss at screen boundary |
| Bedrock/Vertex errors | Improved model error messages with fallback suggestions |

### Auth CLI Commands (v2.1.41+)

New CLI subcommands for authentication management:

| Command | Description |
|---------|-------------|
| `claude auth login` | Authenticate with Anthropic |
| `claude auth status` | Check current authentication state |
| `claude auth logout` | Sign out and clear credentials |

### Windows ARM64 Support (v2.1.41+)

Native binary support for Windows ARM64 (win32-arm64) platform.

### /rename Auto-Generation (v2.1.41+)

`/rename` now auto-generates a descriptive session name from conversation context when called without arguments.

### @-Mention Anchor Fix (v2.1.41+)

Fixed file resolution failing for @-mentions with anchor fragments (e.g., `@README.md#installation`).

### Agent SDK & Plan Mode Fixes (v2.1.41+)

| Fix | Description |
|-----|-------------|
| Background tasks | Fixed notifications not delivered in streaming Agent SDK mode |
| Subagent timing | Permission wait time no longer included in elapsed time display |
| Plan mode | Fixed proactive ticks firing while in plan mode |
| Auto-compact | Fixed failure error notifications being shown to users |
| AWS auth | Added 3-minute timeout to prevent indefinite hanging |

### Resume Title Fix (v2.1.42+)

Fixed session resume displaying wrong title when multiple sessions exist.

### Announcement Targeting (v2.1.42+)

Improved announcement targeting to show relevant messages based on user's plan and usage.

### Structured Outputs Header (v2.1.43+)

Added `anthropic-beta: structured-outputs` header support for typed API responses.

### AWS Auth Timeout Improvement (v2.1.43+)

Refined AWS authentication timeout handling (previously added in v2.1.41).

### Auth Token Refresh (v2.1.44+)

Automatic refresh of expired authentication tokens without requiring manual re-login.

### Plugin Hot-Reload (v2.1.44+)

| Feature | Description |
|---------|-------------|
| Hot-reload | Plugins reload automatically when files change |
| Backup files | Automatic backup before plugin updates |
| Startup perf | Improved plugin initialization speed |

### Memory Improvements (v2.1.44+)

Enhanced auto-memory recording with better deduplication and relevance filtering.

### Claude Sonnet 4.6 Support (v2.1.45+)

New model with near-Opus coding performance at lower cost:

| Feature | Value |
|---------|-------|
| Model ID | `claude-sonnet-4-6` |
| Context window | 200K standard, 1M beta |
| Max output | 64K tokens |
| Input pricing | $3/M tokens |
| Output pricing | $15/M tokens |
| Key strength | Near-Opus coding, tool use, instruction following |

### spinnerTipsOverride (v2.1.45+)

New setting to customize tips displayed during spinner animations:

```json
{
  "spinnerTipsOverride": [
    "Tip: Use /fast to toggle fast mode",
    "Tip: Use Shift+Tab for delegate mode"
  ]
}
```

### Plugin Directory Configuration (v2.1.45+)

Configure custom plugin directories via settings:

```json
{
  "pluginDirs": ["/path/to/custom/plugins"]
}
```

### Agent SDK Rate Limiting (v2.1.45+)

Built-in rate limiting for Agent SDK to prevent API throttling in multi-agent workflows.

### VSCode Fixes (v2.1.45)

| Fix | Description |
|-----|-------------|
| Session restore | Fixed session restore failing after VSCode update |
| Terminal focus | Fixed terminal losing focus during streaming |

### LSP Plugins — Code Intelligence (v2.1.46+)

LSP plugins give Claude automatic diagnostics and structural code navigation via the Language Server Protocol.

| Stack | Plugin | Prerequisite |
|-------|--------|--------------|
| PHP / Symfony / Laravel | `php-lsp` | `npm install -g intelephense` |
| Python | `pyright-lsp` | `pip install pyright` |
| TypeScript / React / Angular / Vue / RN | `typescript-lsp` | `npm install -g @vtsls/language-server typescript` |
| Flutter / Dart | `dart-analyzer` (boostvolt) | Flutter SDK |
| C# / .NET | `csharp-lsp` | `dotnet tool install -g csharp-ls` |

Installation: `/plugins install <name>@claude-plugins-official`

### MCP Connectors from claude.ai (v2.1.46+)

Support for adding MCP connectors directly from claude.ai to Claude Code.

### macOS Terminal Disconnect Fix (v2.1.46+)

Fixed orphan processes persisting on macOS after terminal disconnection.

### VS Code Plan Preview Auto-Updates (v2.1.47+)

| Feature | Description |
|---------|-------------|
| Auto-update | Plan preview comments update automatically when ready |
| Rejection support | Plan preview stays open after rejection for iteration |
| Smoother flow | Eliminates manual refresh for plan approval workflow |

### Hook Inputs: last_assistant_message (v2.1.47+)

Stop and SubagentStop hook inputs now include `last_assistant_message` for richer post-processing.

### Statusline added_dirs (v2.1.47+)

The statusline JSON now includes `added_dirs` in the workspace section for `--add-dir` visibility.

### Multi-line Input (v2.1.47+)

New `chat:newline` keybinding action enables multi-line input in the chat interface.

### Performance Improvements (v2.1.47+)

| Improvement | Description |
|-------------|-------------|
| Startup speed | ~500ms faster via deferred SessionStart hooks |
| `@` file mention | Pre-warming index and session caching for faster completion |
| Memory fix | Fixed O(n²) memory growth for long sessions |
| Resume picker | Now shows 50 sessions (previously 10) |

### Resume & Navigation (v2.1.47+)

| Feature | Description |
|---------|-------------|
| `/rename` | Updates terminal tab title |
| Resume picker | Shows 50 sessions (up from 10) |
| Teammate nav | Shift+Down wrapping for simplified navigation |
| Custom titles | `/rename` custom titles preserved across sessions (#23610) |

### Key Bug Fixes (v2.1.47+)

| Fix | Description |
|-----|-------------|
| FileWriteTool | Preserves trailing blank lines |
| Unicode curly quotes | Fixed corruption in Edit tool (#26141) |
| Parallel writes | Single file error no longer aborts parallel writes |
| Large sessions | Sessions >16KB no longer disappear from /resume (#25721) |
| Windows rendering | Correct terminal rendering with os.EOL \r\n |
| Windows Bash | Fixed output for MSYS2/Cygwin environments |
| Background agents | Return final response instead of raw transcript (#26012) |
| Git worktrees | Custom agents/skills discovered in worktrees (#25816) |
| Plan mode | Preserved after context compaction (#26061) |
| PDF compaction | Fixed compaction with many PDFs |
| CJK alignment | Fixed wide character alignment in terminal |

### ConfigChange Hook Event (v2.1.49+)

New hook event fires when configuration files are modified:

| Feature | Description |
|---------|-------------|
| `ConfigChange` event | Fires when settings.json, CLAUDE.md, or other config files change |
| Matcher support | Match on specific config keys |
| Use cases | Auto-reload config, validate settings, sync across tools |

Also in v2.1.49: Plugin scope auto-detection, simple mode file edit improvements, MCP auth failure caching to reduce retry noise.

### WorktreeCreate & WorktreeRemove Hook Events (v2.1.50+)

New hook events for git worktree lifecycle:

| Event | When it fires | Use case |
|-------|---------------|----------|
| `WorktreeCreate` | When a worktree is created | Initialize worktree settings, notify team |
| `WorktreeRemove` | When a worktree is removed | Cleanup resources, archive logs |

Also in v2.1.50: LSP `startupTimeout` setting, Opus 4.6 1M context window (beta), memory leak fixes for agent teams, `CLAUDE_CODE_SIMPLE` environment variable.

### Remote Control & Security Fixes (v2.1.51+)

| Feature | Description |
|---------|-------------|
| `claude remote-control` | Remote control protocol for external tool integration |
| Custom NPM registry | Support for private NPM registries for MCP servers |
| BashTool login shell | Bash tool now uses login shell for proper env loading |
| `/model` picker | Interactive model picker via `/model` command |

**Security Advisories (v2.1.51):**

| CVE | Impact | Fix |
|-----|--------|-----|
| CVE-2025-59536 | Hook command injection via crafted MCP tool inputs | Input sanitization in hook pipeline |
| CVE-2026-21852 | Path traversal in hook file resolution | Strict path validation |

**Recommendation:** Always run v2.1.51+ when using MCP servers with hooks.

### VS Code Windows Crash Fix (v2.1.52+)

Fixed VS Code extension crash on Windows when launching Claude Code sessions.

### UI & Worktree Improvements (v2.1.53+)

| Feature | Description |
|---------|-------------|
| UI flicker fixes | Eliminated rendering flicker during streaming |
| Ctrl+F bulk agent kill | Kill multiple background agents at once |
| Remote control shutdown | Graceful shutdown for remote control sessions |
| `--worktree` / `-w` flag | Consistent worktree flag for isolated sessions |
| Windows panic fixes | Resolved panic errors on Windows |

### BashTool EINVAL Fix (v2.1.55+)

Fixed BashTool EINVAL error on Windows that caused bash commands to fail silently.

### VS Code Command Fix (v2.1.56+)

Fixed "command not found" error when launching Claude Code from VS Code command palette.

### Remote Control Expansion (v2.1.58+)

Expanded remote control protocol with additional control commands and improved stability.

### Memory Command & Interactive Copy (v2.1.59+)

| Feature | Description |
|---------|-------------|
| `/memory` command | Save persistent session learnings that survive compactions and new sessions |
| `/copy` interactive | Copy interactive code blocks to clipboard |
| Bash handling | Improved bash command handling and error recovery |
| Multi-agent memory | Optimized memory usage across multi-agent sessions |

### Windows Config Corruption Fix (v2.1.61+)

Fixed concurrent writes corrupting config file on Windows. Multiple Claude Code sessions running simultaneously could race on `settings.json` writes, causing file corruption and session errors.

| Fix | Description |
|-----|-------------|
| Config file locking | Atomic writes with file locking for settings.json |
| Platform | Windows only (macOS/Linux unaffected) |

Note: v2.1.60 does not exist (skipped by Anthropic).

### Prompt Suggestion Cache Fix (v2.1.62+)

Fixed prompt suggestion cache regression that reduced cache hit rates, restoring normal prompt caching performance.

### Loop, Effort & Worktree Tools (v2.1.70-v2.1.72)

| Feature | Description |
|---------|-------------|
| `ExitWorktree` tool | Exit a worktree session and return to main repo |
| `/loop` command | Run a prompt or slash command on a recurring interval (cron scheduling) |
| `/effort` command | Set model thinking effort: `low`, `medium`, `high` |
| `/plan` description | Optional description parameter for plan mode intent |
| `w` key in `/copy` | Quick-copy worktree path from copy picker |

### Model Overrides & Context Suggestions (v2.1.73-v2.1.74)

| Feature | Description |
|---------|-------------|
| `modelOverrides` setting | Override model selection per task type in settings |
| `/context` command | Actionable suggestions for optimizing context usage |
| `autoMemoryDirectory` setting | Configure directory for automatic memory storage |
| LSP deadlock fixes | Improved Language Server Protocol stability |

### 1M Context Window GA (v2.1.75+)

| Feature | Description |
|---------|-------------|
| 1M context window | Generally available for Opus 4.6 (no pricing premium) |
| `/color` command | Customize session prompt-bar color |
| `/rename` command | Set session display name |
| Memory file timestamps | Automatic timestamps on memory files |

### MCP Elicitation & Sandbox Expansion (v2.1.76-v2.1.77)

| Feature | Description |
|---------|-------------|
| MCP elicitation | Interactive forms for MCP tool inputs |
| `Elicitation`/`ElicitationResult` hooks | Hook into the elicitation lifecycle |
| `-n`/`--name` flag | Name sessions from the command line |
| `worktree.sparsePaths` setting | Configure sparse checkout paths for large monorepos |
| `PostCompact` hook | Hook fires after context compaction completes |
| `allowRead` sandbox setting | Sandbox setting to allow read-only file access |
| Opus 4.6 output limits | 64K default output tokens, 128K upper limit |

### Plugin State & Agent Frontmatter (v2.1.78-v2.1.80)

| Feature | Description |
|---------|-------------|
| `StopFailure` hook | Hook fires when a stop/termination fails |
| `${CLAUDE_PLUGIN_DATA}` | Persistent state directory for plugins |
| Agent frontmatter | `effort`, `maxTurns`, `disallowedTools` fields for custom agents |
| `--console` flag | Authenticate via Anthropic Console |
| `rate_limits` in statusline | 5-hour and 7-day rate limit windows in statusline scripts |
| `effort` frontmatter for skills | Set default effort level in skill/slash command files |
| `source: 'settings'` plugins | Plugin marketplace defined inline in settings.json |

### Scripting & Managed Settings (v2.1.81-v2.1.83)

| Feature | Description |
|---------|-------------|
| `--bare` flag | Skip hooks, LSP, and plugin sync for scripted `-p` calls |
| `--channels` flag | Forward permission approval prompts to mobile/phone |
| `managed-settings.d/` | Drop-in directory with alphabetical merge for enterprise config |
| `CwdChanged` hook | Hook fires when working directory changes |
| `FileChanged` hook | Hook fires when a watched file changes |
| `sandbox.failIfUnavailable` | Fail if sandbox cannot be initialized |
| `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` | Strip credentials from subprocess environments |
| Transcript search | Press `/` in transcript mode to search |

### PowerShell, Hooks & Deep Links (v2.1.84-v2.1.86)

| Feature | Description |
|---------|-------------|
| PowerShell tool | Opt-in preview for Windows (replaces Bash on Windows) |
| `TaskCreated` hook | Hook fires when a new task is created |
| `WorktreeCreate` HTTP hook | WorktreeCreate hook now supports HTTP handler type |
| Idle-return prompt | After 75+ minutes idle, Claude nudges `/clear` |
| Conditional `if` for hooks | Filter hook execution using permission rule syntax |
| Deep link queries | Support up to 5,000 characters in deep link URLs |
| MCP OAuth RFC 9728 | Protected Resource Metadata discovery for OAuth |
| `.jj`/`.sl` VCS exclusion | Jujutsu and Sapling added to VCS exclusion lists |
| Reduced `@` mention overhead | Lower token cost when using `@file` references |

### Permission Hooks & Rendering (v2.1.87-v2.1.90)

| Feature | Description |
|---------|-------------|
| `X-Claude-Code-Session-Id` header | Session ID header for proxy aggregation |
| `"defer"` permission for PreToolUse | Pause tool execution for headless sessions with `--resume` |
| `CLAUDE_CODE_NO_FLICKER=1` | Flicker-free alt-screen terminal rendering |
| `PermissionDenied` hook | Hook fires after auto mode classifier denies a tool |
| `/powerup` command | Interactive lessons with animated demos |
| `.husky` protected directory | Husky hooks directory added to protected list |

### MCP Persistence & Cost Breakdown (v2.1.91-v2.1.92)

| Feature | Description |
|---------|-------------|
| MCP result persistence override | `_meta["anthropic/maxResultSizeChars"]` up to 500K |
| `disableSkillShellExecution` | Setting to prevent skills from running shell commands |
| `forceRemoteSettingsRefresh` | Policy setting for fail-closed remote settings |
| Per-model `/cost` breakdown | Per-model and cache-hit breakdown in `/cost` command |
| `/release-notes` interactive | Interactive version picker for release notes |

### Bedrock Mantle & Auto Mode (v2.1.94+)

| Feature | Description |
|---------|-------------|
| Amazon Bedrock Mantle | `CLAUDE_CODE_USE_MANTLE=1` for Bedrock Mantle support |
| Default effort `high` | Default effort level set to `high` for API-key/Bedrock/Vertex/Foundry |
| **Auto Mode** (March 24, 2026) | AI-powered permission classifier for Team plans |
| Auto Mode classifier | Background safety model reviews each tool call |
| Auto Mode escalation | 3 consecutive blocks → manual; 20+ blocks → revert |

### Security Hardening (v2.1.97-v2.1.98)

| Feature | Description |
|---------|-------------|
| Bash tool hardened | Env-var prefix injection and network redirect blocking |
| Compound command bypass fix | Permissions now checked on compound bash commands |
| MCP HTTP/SSE buffer leak fix | Fixed 50 MB/hr memory accumulation |
| Focus view toggle | `Ctrl+O` in `NO_FLICKER` mode |
| Google Vertex AI wizard | Interactive setup wizard for Vertex AI |
| `CLAUDE_CODE_PERFORCE_MODE` | Environment variable for Perforce read-only file hints |
| Monitor tool | Stream background events from processes |
| Subprocess sandboxing | PID namespace isolation on Linux |

### Security Advisories (v2.1.97-v2.1.101)

| Version | Fix | Severity |
|---------|-----|----------|
| v2.1.97 | Compound command bypass in Bash tool | High |
| v2.1.97 | Network redirect bypass | High |
| v2.1.97 | Prototype pollution in permission rules | High |
| v2.1.97 | MCP HTTP/SSE buffer leak (50 MB/hr) | Medium |
| v2.1.98 | Env-var prefix injection in Bash tool | High |
| v2.1.98 | Subprocess sandboxing with PID namespace | Enhancement |
| v2.1.101 | POSIX `which` fallback command injection | High |

**Recommendation:** Always run v2.1.97+ for production use. Update immediately if using MCP servers or Bash tool in automated workflows.

### Team Onboarding & Stability (v2.1.101-v2.1.105)

| Feature | Description |
|---------|-------------|
| `/team-onboarding` command | Generate teammate ramp-up guides |
| OS CA certificate trust | Trust system CA certificate store by default |
| Memory leak fixes | Fixed memory leaks in long-running sessions |
| `path` parameter for `EnterWorktree` | Switch between existing worktrees |
| PreCompact hook blocking | Block compaction via exit code 2 |
| Background monitors for plugins | `monitors` manifest key for plugin background tasks |
| `/proactive` alias | Alias for `/loop` command |
| Skill description limit | Increased from 250 to 1,536 characters |
| Stalled stream handling | 5-minute timeout with automatic retry |

### Enhanced Features (v2.1.105+)

| Feature | Description |
|---------|-------------|
| Enhanced `/doctor` layout | Status icons (✓, ✗, ⚠), categorized diagnostics, action hints, press `f` to fix |
| WebFetch token optimization | Strips `<style>` and `<script>` tag contents (50-80% token reduction on web pages) |
| MCP large-output truncation | Format-specific recipes for truncating large MCP outputs (e.g., `jq` for JSON) |
| `/btw` command | Quick questions without context switching, minimal context, low effort |
| `/hooks` command | Interactive hook management: view, enable/disable, test, debug |
| `/reload-plugins` command | Manual plugin reload (auto-reload on file changes also available) |
| Skill `context: fork` | Run skills in isolated subagent context |
| `disable-model-invocation: true` | Prevent Claude from auto-invoking a skill |
| `claudeMdExcludes` setting | Exclude specific CLAUDE.md files in monorepos |
| Auto-compaction skill reload | Skills re-attach after compaction (5K tokens/skill, 25K total max) |
| Live skill directory detection | Skills auto-reload when directory contents change |

### v2.1.106

Internal improvements and bug fixes. No major public features documented.

### Show Thinking Hints Sooner (v2.1.107+)

| Feature | Description |
|---------|-------------|
| Early thinking display | Thinking hints appear sooner during long tool operations |
| Improved feedback | Better UX during extended executions (file searches, large builds) |
| Reduced perceived latency | Users see progress indicators earlier in the response cycle |

### Source Code Leak Incident (v2.1.88)

On March 31, 2026, the full source code of Claude Code was exposed via the public npm package v2.1.88 due to a missing `.npmignore` exclusion for Bun-generated source maps (59.8 MB `.map` file). Patched in v2.1.89.
