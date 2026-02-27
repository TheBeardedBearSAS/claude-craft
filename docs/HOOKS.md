# Claude Code Hooks Reference

Hooks are user-defined shell commands that execute automatically at specific points in Claude Code's lifecycle. They provide guaranteed automation that doesn't rely on Claude "remembering" to do something.

## Table of Contents

- [Overview](#overview)
- [Hook Events](#hook-events)
- [Configuration](#configuration)
- [Matchers](#matchers)
- [Exit Codes](#exit-codes)
- [Input/Output Format](#inputoutput-format)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

Hooks complement the "should-do" suggestions in CLAUDE.md with "must-do" deterministic rules. They're perfect for:

- **Quality gates**: Block commits with secrets, enforce linting
- **Automation**: Auto-format on save, run tests on stop
- **Integration**: Slack notifications, CI/CD triggers
- **Context loading**: Initialize project environment at session start

### Hook vs CLAUDE.md

| Aspect | CLAUDE.md | Hooks |
|--------|-----------|-------|
| Execution | Suggestions Claude may follow | Guaranteed execution |
| Flexibility | Context-dependent | Deterministic |
| Use case | Guidelines, preferences | Enforcement, automation |

---

## Hook Events

Claude Code supports **16 hook event types**:

| Event | When it fires | Matcher support |
|-------|---------------|-----------------|
| `PreToolUse` | Before tool execution | Yes (tool names) |
| `PostToolUse` | After tool completes | Yes (tool names) |
| `PermissionRequest` | When permission dialog shows | Yes (tool names) |
| `UserPromptSubmit` | When user submits prompt | No |
| `Stop` | When main agent finishes | No |
| `SubagentStop` | When subagent finishes | No |
| `Notification` | When notification is sent | Yes (notification type) |
| `PreCompact` | Before context compaction | Yes (`manual`, `auto`) |
| `SessionStart` | When session starts/resumes | Yes (`startup`, `resume`, `clear`, `compact`) |
| `SessionEnd` | When session terminates | No |
| `Setup` | When `--init`, `--init-only`, `--maintenance` run | No |
| `TeammateIdle` | When a teammate agent goes idle | Yes (teammate name) |
| `TaskCompleted` | When a task is marked completed | Yes (task ID) |
| `ConfigChange` | When configuration files change | Yes (config key) |
| `WorktreeCreate` | When a git worktree is created | Yes (worktree path) |
| `WorktreeRemove` | When a git worktree is removed | Yes (worktree path) |

### Event Details

#### PreToolUse
Fires after Claude creates tool parameters, before execution. Can:
- Block the tool call (exit code 2)
- Modify tool inputs (since v2.0.10)
- Add context for Claude

#### PostToolUse
Fires immediately after tool completes successfully. Use for:
- Post-processing (linting, formatting)
- Logging and metrics
- Validation of results

#### Stop / SubagentStop
Fires when Claude finishes responding. Perfect for:
- Quality gates (run tests before accepting)
- Summary generation
- Cleanup tasks

#### SessionStart
Fires when session starts or resumes. Use for:
- Loading project context
- Setting environment variables
- Initializing tools

#### Setup (v2.1.20+)
Fires when running initialization/maintenance commands:
- `--init`: First-time project setup
- `--init-only`: Run setup without starting session
- `--maintenance`: Run maintenance tasks

Use for:
- Project initialization scripts
- First-time environment configuration
- Database migrations on setup

#### TeammateIdle (v2.1.33+)

Fires when a teammate agent becomes idle after completing its turn. Use for:
- Auto-assigning next available task
- Collecting teammate status updates
- Triggering coordination logic

#### TaskCompleted (v2.1.33+)

Fires when a task is marked as completed via TaskUpdate. Use for:
- Triggering dependent workflows
- Running validation checks
- Updating external systems (Jira, Slack)

#### ConfigChange (v2.1.49+)

Fires when a configuration file (settings.json, .claude/CLAUDE.md, etc.) is modified. Use for:
- Reloading configuration automatically
- Validating settings changes
- Syncing configuration across tools

#### WorktreeCreate (v2.1.50+)

Fires when a git worktree is created via `--worktree` flag or `git worktree add`. Use for:
- Initializing worktree-specific settings
- Setting up environment for parallel sessions
- Notifying team members of new work branches

#### WorktreeRemove (v2.1.50+)

Fires when a git worktree is removed. Use for:
- Cleaning up worktree-specific resources
- Archiving session logs
- Updating project tracking

---

## Configuration

### Settings File Locations

| Location | Path | Scope |
|----------|------|-------|
| User | `~/.claude/settings.json` | All projects |
| Project | `.claude/settings.json` | Shared with team |
| Local | `.claude/settings.local.json` | Personal, not committed |

### Basic Structure

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit:*)",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/pre-commit-check.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint:fix"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/quality-gate.sh"
          }
        ]
      }
    ]
  }
}
```

### Hook Types

#### Command Hooks
Execute a shell command:

```json
{
  "type": "command",
  "command": "/path/to/script.sh",
  "timeout": 60
}
```

#### Hook Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `type` | string | `"command"` or `"prompt"` |
| `command` | string | Shell command to execute |
| `timeout` | number | Max execution time in seconds (default: 60) |
| `once` | boolean | Run hook only once per session (v2.1.0+) |

**Example with `once: true`**:
```json
{
  "type": "command",
  "command": ".claude/hooks/expensive-check.sh",
  "once": true
}
```

#### Prompt Hooks
Use AI to evaluate (Stop, SubagentStop, UserPromptSubmit, PreToolUse, PermissionRequest):

```json
{
  "type": "prompt",
  "prompt": "Evaluate if this code change is safe: $ARGUMENTS",
  "timeout": 30
}
```

---

## Matchers

Matchers are **case-sensitive** patterns for tool names.

### Pattern Types

| Pattern | Example | Matches |
|---------|---------|---------|
| Exact | `Write` | Only Write tool |
| Regex OR | `Write\|Edit` | Write or Edit |
| Wildcard | `Notebook.*` | Notebook and variants |
| All tools | `*` or `""` | Everything |

### Common Tool Names

- **File ops**: `Read`, `Write`, `Edit`, `Glob`, `Grep`
- **Shell**: `Bash`
- **Subagents**: `Task`
- **Web**: `WebFetch`, `WebSearch`
- **MCP tools**: `mcp__<server>__<tool>`

### Bash Command Matching

```json
"matcher": "Bash(git commit:*)"    // Any git commit
"matcher": "Bash(npm run:*)"       // Any npm script
"matcher": "Bash(rm:*)"            // Any rm command
```

### Notification Types

```json
"matcher": "permission_prompt"     // Permission requests
"matcher": "idle_prompt"           // Idle > 60 seconds
"matcher": "auth_success"          // Authentication success
```

---

## Exit Codes

| Code | Meaning | Behavior |
|------|---------|----------|
| **0** | Success | Continue, stdout shown in verbose mode |
| **2** | Block | Stop action, stderr shown to Claude/user |
| **Other** | Non-blocking error | Continue, stderr shown in verbose mode |

### Exit Code 2 Behavior by Event

| Event | Effect |
|-------|--------|
| PreToolUse | Blocks tool, shows stderr to Claude |
| PermissionRequest | Denies permission |
| PostToolUse | Shows stderr to Claude (tool already ran) |
| UserPromptSubmit | Blocks prompt, erases it, shows stderr to user |
| Stop/SubagentStop | Blocks stop, shows stderr to Claude |

---

## Input/Output Format

### Input (via stdin)

All hooks receive JSON on stdin:

```json
{
  "session_id": "abc123",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse"
}
```

#### PreToolUse Additional Fields
```json
{
  "tool_name": "Write",
  "tool_input": { "file_path": "/path/file.txt", "content": "..." },
  "tool_use_id": "toolu_01ABC..."
}
```

#### PostToolUse Additional Fields
```json
{
  "tool_name": "Write",
  "tool_input": { ... },
  "tool_response": { "filePath": "/path/file.txt", "success": true },
  "tool_use_id": "toolu_01ABC..."
}
```

### Output (JSON on stdout)

#### Common Fields
```json
{
  "continue": true,
  "stopReason": "Message when continue=false",
  "suppressOutput": true,
  "systemMessage": "Warning to user"
}
```

#### PreToolUse Output
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "Reason",
    "updatedInput": { "field": "new_value" },
    "additionalContext": "Context message for Claude (v2.1.21+)"
  }
}
```

The `additionalContext` field (v2.1.21+) allows hooks to inject context that Claude will see when processing the tool result. Use for warnings, hints, or additional information.

---

## Examples

### 1. Block Commits with Secrets

**`.claude/hooks/block-secrets.sh`**:
```bash
#!/bin/bash
set -e

# Read JSON input
INPUT=$(cat)
TOOL_INPUT=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Check for sensitive patterns
if echo "$TOOL_INPUT" | grep -qE "(password|api_key|secret|token)="; then
  echo "BLOCKED: Potential secret in commit" >&2
  exit 2
fi

exit 0
```

**`settings.json`**:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit:*)",
        "hooks": [{
          "type": "command",
          "command": ".claude/hooks/block-secrets.sh"
        }]
      }
    ]
  }
}
```

### 2. Auto-Lint on File Save

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "npm run lint:fix --silent"
        }]
      }
    ]
  }
}
```

### 3. Quality Gate on Stop

**`.claude/hooks/quality-gate.sh`**:
```bash
#!/bin/bash

# Run tests
if ! npm test --silent 2>/dev/null; then
  echo '{"decision": "block", "reason": "Tests are failing. Please fix before completing."}'
  exit 0
fi

echo '{"continue": true}'
exit 0
```

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [{
          "type": "command",
          "command": ".claude/hooks/quality-gate.sh"
        }]
      }
    ]
  }
}
```

### 4. Slack Notification on Completion

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [{
          "type": "command",
          "command": "curl -X POST -H 'Content-type: application/json' --data '{\"text\":\"Claude Code task completed!\"}' $SLACK_WEBHOOK_URL"
        }]
      }
    ]
  }
}
```

### 5. Load Project Context on Session Start

**`.claude/hooks/session-init.sh`**:
```bash
#!/bin/bash

# Set environment variables
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=development' >> "$CLAUDE_ENV_FILE"
  echo 'export DATABASE_URL=postgres://...' >> "$CLAUDE_ENV_FILE"
fi

# Output context for Claude
echo '{"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "Project uses Symfony 7.2, PHP 8.3, PostgreSQL 16"}}'
exit 0
```

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [{
          "type": "command",
          "command": ".claude/hooks/session-init.sh"
        }]
      }
    ]
  }
}
```

---

## Best Practices

### Security

1. **Validate all inputs** - Never trust hook input blindly
2. **Quote shell variables** - Always use `"$VAR"` not `$VAR`
3. **Block path traversal** - Check for `..` in file paths
4. **Skip sensitive files** - Avoid `.env`, `.git/`, keys

### Performance

1. **Set appropriate timeouts** - Default is 60s
2. **Use fast scripts** - Hooks run synchronously
3. **Cache when possible** - Avoid repeated expensive operations

### Reliability

1. **Use absolute paths** - Specify full script paths
2. **Handle errors gracefully** - Exit codes matter
3. **Test thoroughly** - Test in safe environment first
4. **Log actions** - For debugging

### Organization

```
.claude/
├── hooks/
│   ├── pre-commit-check.sh
│   ├── post-edit-lint.sh
│   ├── quality-gate.sh
│   └── session-init.sh
└── settings.json
```

---

## Troubleshooting

### Hook Not Executing

1. Check matcher pattern (case-sensitive)
2. Verify script is executable (`chmod +x`)
3. Check file path is correct
4. Enable verbose mode (`ctrl+o`) to see output

### Hook Blocking Unexpectedly

1. Check exit code (should be 0 for success)
2. Verify stderr is empty for non-blocking
3. Test script independently

### Environment Variables Not Set

For `SessionStart`, use `$CLAUDE_ENV_FILE`:
```bash
echo 'export VAR=value' >> "$CLAUDE_ENV_FILE"
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Script not found | Use absolute path |
| Permission denied | `chmod +x script.sh` |
| JSON parse error | Validate JSON output |
| Timeout | Increase timeout or optimize script |

---

## Related Documentation

- [Skills](/docs/SKILLS.md) - Model-invoked capabilities
- [MCP](/docs/MCP.md) - External tool integration
- [Settings](/docs/CONFIGURATION.md) - Configuration options
- [Commands](/docs/COMMANDS.md) - Slash commands

---

## Sources

- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Claude Code Settings](https://code.claude.com/docs/en/settings)
