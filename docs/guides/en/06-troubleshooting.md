# Troubleshooting Guide

This guide covers common issues and their solutions when using Claude-Craft.

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Agent Issues](#agent-issues)
3. [Command Issues](#command-issues)
4. [Configuration Issues](#configuration-issues)
5. [Tool Issues](#tool-issues)
6. [Performance Issues](#performance-issues)
7. [Getting Help](#getting-help)

---

## Installation Issues

### Commands Not Recognized After Installation

**Symptoms:**
- Slash commands like `/symfony:check-compliance` don't work
- Claude doesn't recognize installed commands

**Solutions:**

1. **Restart Claude Code**
   ```bash
   # Exit Claude Code completely
   exit

   # Start fresh
   claude
   ```

2. **Verify installation**
   ```bash
   ls -la .claude/commands/
   # Should show command directories
   ```

3. **Check command file format**
   ```bash
   head -5 .claude/commands/symfony/check-compliance.md
   # Should start with proper markdown header
   ```

### Files Not Found During Installation

**Symptoms:**
- "Source file not found" errors
- Missing rules or templates

**Solutions:**

1. **Verify Claude-Craft path**
   ```bash
   # Check you're running from claude-craft directory
   pwd
   ls -la Dev/scripts/
   ```

2. **Check language files exist**
   ```bash
   ls -la Dev/i18n/en/Symfony/rules/
   ```

3. **Use absolute TARGET path**
   ```bash
   # Instead of
   make install-symfony TARGET=./backend

   # Use
   make install-symfony TARGET=/full/path/to/backend
   ```

### Permission Denied Errors

**Symptoms:**
- Can't execute installation scripts
- Can't write to target directory

**Solutions:**

1. **Make scripts executable**
   ```bash
   chmod +x Dev/scripts/*.sh
   chmod +x Project/*.sh
   chmod +x Infra/*.sh
   chmod +x Tools/*/*.sh
   ```

2. **Check target directory permissions**
   ```bash
   ls -la ~/my-project/
   # Ensure you have write permissions
   ```

3. **Run with appropriate user**
   ```bash
   # Don't use sudo unless necessary
   # Check directory ownership
   ls -la ~/my-project
   ```

### Installation Creates Empty Directory

**Symptoms:**
- `.claude/` directory created but empty or missing files

**Solutions:**

1. **Check for errors in output**
   ```bash
   # Run with verbose output
   make install-symfony TARGET=./backend 2>&1 | tee install.log
   ```

2. **Verify source exists**
   ```bash
   ls -la Dev/i18n/en/Symfony/
   ```

3. **Try direct script execution**
   ```bash
   ./Dev/scripts/install-symfony-rules.sh --lang=en ./backend
   ```

---

## Agent Issues

### Agent Not Available

**Symptoms:**
- `@api-designer` or other agents don't respond
- "Unknown agent" type errors

**Solutions:**

1. **Verify agent files exist**
   ```bash
   ls -la .claude/agents/
   # Should list agent .md files
   ```

2. **Check agent file format**
   ```bash
   head -20 .claude/agents/api-designer.md
   # Should have proper frontmatter with name and description
   ```

3. **Reinstall agents**
   ```bash
   make install-common TARGET=. OPTIONS="--force"
   ```

### Agent Gives Irrelevant Responses

**Symptoms:**
- Agent doesn't follow its specialized instructions
- Generic responses instead of expert advice

**Solutions:**

1. **Provide more context**
   ```markdown
   @symfony-reviewer Review my UserService implementation

   Context:
   - Symfony 7 with API Platform
   - Clean Architecture
   - DDD approach

   Code to review:
   [paste code here]
   ```

2. **Be specific in your request**
   ```markdown
   # Instead of
   @database-architect Help with my database

   # Use
   @database-architect Design the schema for User aggregate with:
   - User entity (id, email, password_hash)
   - Role entity (many-to-many with User)
   - Permission entity (many-to-many with Role)
   - Audit trail for user changes
   ```

3. **Check project context file**
   ```bash
   cat .claude/rules/00-project-context.md
   # Ensure it describes your project accurately
   ```

### Agent Conflicts with Project Rules

**Symptoms:**
- Agent suggestions contradict project conventions
- Inconsistent advice

**Solutions:**

1. **Update project context**
   - Add specific conventions to `00-project-context.md`
   - Include team preferences and constraints

2. **Be explicit in requests**
   ```markdown
   @api-designer Design endpoint following our RESTful conventions
   (see 00-project-context.md for our API standards)
   ```

---

## Command Issues

### Command Not Found

**Symptoms:**
- `/symfony:generate-crud` returns "unknown command"
- Command suggestions don't appear

**Solutions:**

1. **Check command directory**
   ```bash
   ls .claude/commands/symfony/
   # Should include generate-crud.md
   ```

2. **Verify namespace**
   ```bash
   # Commands are in format: /{namespace}:{command}
   # Available namespaces:
   ls .claude/commands/
   # common/, symfony/, flutter/, python/, react/, reactnative/, docker/
   ```

3. **List available commands**
   ```bash
   # In Claude Code, type:
   /help
   ```

### Command Execution Errors

**Symptoms:**
- Command starts but fails
- Unexpected output or errors

**Solutions:**

1. **Check prerequisites**
   - Some commands require specific tools
   - Verify required dependencies installed

2. **Review command file**
   ```bash
   cat .claude/commands/symfony/generate-crud.md
   # Understand what the command expects
   ```

3. **Provide required parameters**
   ```bash
   # Instead of
   /symfony:generate-crud

   # Use
   /symfony:generate-crud User --with-api --with-tests
   ```

### Command Output Incorrect

**Symptoms:**
- Generated code doesn't match project style
- Wrong technology patterns used

**Solutions:**

1. **Update project context**
   ```bash
   # Edit .claude/rules/00-project-context.md
   # Add specific patterns and conventions
   ```

2. **Customize templates**
   ```bash
   # Edit templates in .claude/templates/
   # Adjust to match your project style
   ```

---

## Configuration Issues

### YAML Configuration Invalid

**Symptoms:**
- `make config-validate` fails
- Syntax errors in configuration

**Solutions:**

1. **Check YAML syntax**
   ```bash
   # Validate YAML
   yq e '.' claude-projects.yaml
   ```

2. **Common YAML errors:**
   ```yaml
   # Wrong: inconsistent indentation
   projects:
     - name: "project"
       path: "/path"  # 2 spaces
        technologies: ["symfony"]  # 3 spaces - ERROR!

   # Correct: consistent indentation
   projects:
     - name: "project"
       path: "/path"
       technologies: ["symfony"]
   ```

3. **Validate with tool**
   ```bash
   make config-validate CONFIG=claude-projects.yaml
   ```

### Project Not Found in Configuration

**Symptoms:**
- "Project not found" when installing
- Project not listed

**Solutions:**

1. **Check project name spelling**
   ```bash
   # List projects
   make config-list CONFIG=claude-projects.yaml

   # Names are case-sensitive
   ```

2. **Verify configuration file path**
   ```bash
   # Default looks for claude-projects.yaml in current directory
   # Specify explicitly:
   make config-install CONFIG=/path/to/config.yaml PROJECT=myproject
   ```

### Configuration Not Applied

**Symptoms:**
- Changes to config don't take effect
- Old settings persist

**Solutions:**

1. **Reinstall with force**
   ```bash
   make config-install CONFIG=claude-projects.yaml PROJECT=myproject OPTIONS="--force"
   ```

2. **Check for conflicts**
   ```bash
   # Remove existing installation
   rm -rf /path/to/project/.claude

   # Reinstall
   make config-install CONFIG=claude-projects.yaml PROJECT=myproject
   ```

---

## Tool Issues

### StatusLine Not Displaying

**Symptoms:**
- Status bar empty or default
- Custom status line not showing

**Solutions:**

1. **Verify script installed**
   ```bash
   ls -la ~/.claude/statusline.sh
   # Should exist and be executable
   ```

2. **Check settings.json**
   ```bash
   cat ~/.claude/settings.json | jq '.statusLine'
   # Should show:
   # {
   #   "type": "command",
   #   "command": "~/.claude/statusline.sh"
   # }
   ```

3. **Test script manually**
   ```bash
   echo '{"model":{"display_name":"Test","id":"claude-opus"}}' | ~/.claude/statusline.sh
   # Should output formatted status line
   ```

4. **Check for jq**
   ```bash
   which jq
   # Install if missing: brew install jq / apt install jq
   ```

### MultiAccount Profile Issues

**Symptoms:**
- Can't switch profiles
- Profile not recognized

**Solutions:**

1. **List profiles**
   ```bash
   ./claude-accounts.sh list
   ```

2. **Check profile directory**
   ```bash
   ls -la ~/.claude-profiles/
   # Should contain profile directories
   ```

3. **Verify profile mode file**
   ```bash
   cat ~/.claude-profiles/myprofile/.mode
   # Should contain "shared" or "isolated"
   ```

4. **Recreate problematic profile**
   ```bash
   ./claude-accounts.sh remove myprofile
   ./claude-accounts.sh add myprofile --mode=shared
   ```

### ProjectConfig yq Errors

**Symptoms:**
- "yq: command not found"
- YAML parsing errors

**Solutions:**

1. **Install yq**
   ```bash
   # macOS
   brew install yq

   # Linux
   sudo snap install yq
   # or
   sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
   sudo chmod +x /usr/local/bin/yq
   ```

2. **Verify yq version**
   ```bash
   yq --version
   # Should be v4.x (mikefarah/yq, not kislyuk/yq)
   ```

---

## Hook Issues

### Hook Not Firing

**Symptoms:**
- PreToolUse/PostToolUse hooks don't execute
- No output from hook commands

**Solutions:**

1. **Verify hook configuration in settings.json**
   ```bash
   cat .claude/settings.json | jq '.hooks'
   ```

2. **Check matcher syntax**
   ```json
   {
     "hooks": {
       "PreToolUse": [{
         "matcher": "Bash",
         "hooks": [{"type": "command", "command": "echo test"}]
       }]
     }
   }
   ```
   The `matcher` must match the tool name exactly (e.g., `Bash`, `Edit`, `Write`).

3. **Test hook command independently**
   ```bash
   # Run the hook command manually to verify it works
   bash -c 'echo test'
   ```

### PreCompact Hook Blocking

**Symptoms:**
- Context compaction not happening when expected
- Compaction seems stuck

**Solution:** PreCompact hooks (v2.1.105+) can block compaction with exit code 2. Check your hooks:
```bash
cat .claude/settings.json | jq '.hooks.PreCompact'
# Ensure hook scripts don't accidentally return exit code 2
```

### Sandbox Errors

**Symptoms:**
- "Sandbox unavailable" errors
- Subprocess permission issues

**Solutions:**

1. **Check Claude Code version** (sandboxing requires v2.1.98+)
   ```bash
   claude --version
   ```

2. **On Linux, verify PID namespace support**
   ```bash
   # Check if unshare is available
   which unshare
   ```

3. **Disable strict sandbox if needed** (not recommended for security)
   - Remove `sandbox.failIfUnavailable` from settings if it was added

### Security-Related Hook Failures

If using MCP servers with hooks, ensure Claude Code v2.1.97+ to avoid known CVEs:
- CVE-2025-59536: Command injection via MCP inputs in hook pipeline
- CVE-2026-35020: Compound command bypass
- CVE-2026-35022: Env-var prefix injection

---

## Performance Issues

### Slow Command Execution

**Symptoms:**
- Commands take long to respond
- StatusLine updates slowly

**Solutions:**

1. **Check cache settings**
   ```bash
   # In ~/.claude/statusline.conf
   SESSION_CACHE_TTL=60   # Reduce if too slow
   WEEKLY_CACHE_TTL=300   # Reduce if too slow
   ```

2. **Clear caches**
   ```bash
   rm /tmp/.ccusage_*
   ```

3. **Check network**
   - Some features require network (ccusage)
   - Slow network = slow updates

### Large Context Window Usage

**Symptoms:**
- Context indicator shows high percentage quickly
- "Context limit" warnings

**Solutions:**

1. **Use `/context` for optimization suggestions** (v2.1.74+)
   ```bash
   /context
   ```

2. **Adjust effort level** for simple tasks (v2.1.72+)
   ```bash
   /effort low    # Simple lookups
   /effort medium # Standard work
   ```

3. **Proactively compact** at ~70% usage
   ```bash
   /compact
   ```

4. **Use `/clear` between unrelated tasks**

5. **Save key learnings** before compaction
   ```bash
   /memory "Important: auth uses JWT RS256 with 15min expiry"
   ```

6. **Set up RTK** for 55-65% token savings
   ```bash
   /common:setup-rtk
   ```

7. **Use agents for complex tasks**
   ```markdown
   # Instead of pasting entire codebase
   @research-assistant Find all authentication-related files in src/
   ```

---

## Getting Help

### Check Documentation

1. **Main docs**: `docs/` directory
2. **Agent reference**: `docs/AGENTS.md`
3. **Commands reference**: `docs/COMMANDS.md`
4. **Technologies guide**: `docs/TECHNOLOGIES.md`

### Get Version Info

```bash
# Installation scripts
./Dev/scripts/install-symfony-rules.sh --version

# Tools
./Tools/MultiAccount/claude-accounts.sh --version
./Tools/ProjectConfig/claude-projects.sh --version
```

### Report Issues

If you encounter bugs:

1. Gather information:
   - Claude-Craft version
   - Operating system
   - Steps to reproduce
   - Error messages

2. Check existing issues on GitHub

3. Create new issue with details

### Ask for Help

```markdown
@research-assistant I'm having trouble with [describe issue]

Environment:
- OS: [your OS]
- Claude-Craft version: [version]
- Technology: [symfony/flutter/etc.]

What I tried:
1. [step 1]
2. [step 2]

Error message:
[paste error]
```

---

## Quick Fixes Checklist

When something doesn't work:

- [ ] Restart Claude Code
- [ ] Verify installation (`ls .claude/`)
- [ ] Check file permissions
- [ ] Validate configuration
- [ ] Clear caches
- [ ] Check dependencies (jq, yq)
- [ ] Try reinstall with `--force`
- [ ] Check documentation
- [ ] Ask for help

---

[&larr; Tools Reference](05-tools-reference.md) | [Backlog Management &rarr;](07-backlog-management.md)
