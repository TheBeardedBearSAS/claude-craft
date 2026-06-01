# Troubleshooting Guide

Solutions to common problems with Claude Craft.

---

## Installation Issues

### "yq: command not found"

**Problem:** The installation scripts require yq but it's not installed or the wrong version is installed.

**Solution:**
```bash
# Check current version (if any)
which yq
yq --version

# Install correct version (Mike Farah's yq v4)
# macOS
brew install yq

# Ubuntu/Debian
sudo apt install yq

# Or download binary directly
sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
sudo chmod +x /usr/local/bin/yq
```

**Note:** There are multiple tools named "yq". Claude Craft requires Mike Farah's version (v4+), not the Python version.

---

### "Permission denied" when running scripts

**Problem:** Installation scripts are not executable.

**Solution:**
```bash
# Make all scripts executable
chmod +x Dev/scripts/*.sh

# Or use make
make fix-permissions

# Or run with bash directly
bash Dev/scripts/install-symfony-rules.sh --lang=en ~/my-project
```

---

### "Target directory does not exist"

**Problem:** The target project directory doesn't exist.

**Solution:**
```bash
# Create the directory first
mkdir -p ~/my-project

# Then run installation
make install-symfony TARGET=~/my-project
```

---

### Installation completes but files are missing

**Problem:** Some files weren't copied during installation.

**Diagnosis:**
```bash
# Check what was installed
ls -la ~/my-project/.claude/

# Count files
find ~/my-project/.claude -name "*.md" | wc -l
```

**Solution:**
```bash
# Force reinstall
make install-symfony TARGET=~/my-project OPTIONS="--force"

# Or run with verbose output
./Dev/scripts/install-symfony-rules.sh --verbose ~/my-project
```

---

### NPX cache issues

**Problem:** NPX uses old cached version of Claude Craft.

**Solution:**
```bash
# Clear NPX cache
npx clear-npx-cache

# Or manually remove
rm -rf ~/.npm/_npx

# Then reinstall
npx @the-bearded-bear/claude-craft install ~/my-project --tech=symfony
```

---

## Claude Code Issues

### Commands not showing up

**Problem:** Slash commands don't appear in Claude Code.

**Diagnosis:**
```bash
# Verify commands directory exists
ls -la ~/my-project/.claude/commands/

# Check file format
head -20 ~/my-project/.claude/commands/common/pre-commit-check.md
```

**Solutions:**

1. **Restart Claude Code session**
   ```bash
   # Exit and restart
   exit
   claude
   ```

2. **Check YAML frontmatter is valid**
   ```yaml
   ---
   description: Brief description
   argument-hint: <arg1> [arg2]
   ---
   ```

3. **Verify file extension is `.md`**

4. **Check Claude Code version**
   ```bash
   claude --version
   # Requires Claude Code 2.1.97+
   ```

---

### Agents not responding

**Problem:** @agent mentions don't trigger the agent behavior.

**Diagnosis:**
```bash
# Check agents directory
ls -la ~/my-project/.claude/agents/

# Verify agent file format
head -20 ~/my-project/.claude/agents/api-designer.md
```

**Solutions:**

1. **Use exact agent name**
   ```
   # Correct
   @api-designer Help me design...

   # Incorrect
   @API-Designer Help me design...
   @apidesigner Help me design...
   ```

2. **Check frontmatter format**
   ```yaml
   ---
   name: api-designer
   description: Expert in REST/GraphQL API design
   ---
   ```

---

### Plan mode crash (v2.1.38)

**Problem:** Claude Code crashes when entering plan mode.

**Cause:** Project config in `~/.claude.json` is missing default fields.

**Solution:**
```bash
# Ensure ~/.claude.json has valid structure
# Update Claude Code to v2.1.38+
npm update -g @anthropic-ai/claude-code
```

---

### Heredoc "Bad substitution" errors

**Problem:** Bash tool produces "Bad substitution" errors with JavaScript template literals like `${index + 1}` in heredocs.

**Solution:** Update Claude Code to v2.1.38+ which fixes heredoc parsing for JS template literals.

---

### Tab key queues slash commands instead of autocompleting

**Problem:** Pressing Tab queues slash commands instead of triggering autocomplete.

**Solution:** Update Claude Code to v2.1.38+ which fixes Tab key behavior.

---

### Skills not loading

**Problem:** Skills don't activate when triggered.

**Diagnosis:**
```bash
# Check skills directory
ls -la ~/my-project/.claude/skills/

# Check context.yaml
cat ~/my-project/.claude/context.yaml
```

**Solutions:**

1. **Verify context.yaml format**
   ```yaml
   triggers:
     - pattern: "*.test.ts"
       skills: ["testing"]
   ```

2. **Use explicit skill invocation**
   ```
   /testing
   ```

---

### Stalled Stream Handling (v2.1.105+)

**Problem:** Claude Code appears frozen with no response for 5+ minutes.

**Solution:** Claude Code v2.1.105+ automatically detects stalled streams with a 5-minute timeout and automatic retry mechanism.

**Manual recovery:**
```bash
# Resume the stalled session
claude --resume <session-id>

# Or use debug mode
/debug
```

**Common causes:**
- Network interruptions or unstable connections
- API rate limiting
- Large file operations (reading/writing very large files)
- MCP server hangs or unresponsive external tools

**Prevention:**
- Keep Claude Code updated to v2.1.105+
- Monitor network stability during long operations
- Break down large file operations into smaller chunks
- Review MCP server logs if using external tools

---

### WebFetch Token Optimization (v2.1.105+)

**Problem:** WebFetch consuming excessive tokens when fetching web pages.

**Solution:** Claude Code v2.1.105+ automatically strips `<style>` and `<script>` tag contents, reducing token consumption by 50-80%.

**Features:**
- Automatic optimization (no configuration needed)
- Preserves semantic HTML structure
- Removes inline CSS and JavaScript
- Keeps essential page content

**Note:** This optimization is automatic in v2.1.105+. If you're experiencing high token usage from web fetches, update Claude Code:
```bash
npm update -g @anthropic-ai/claude-code
claude --version  # Verify v2.1.105+
```

---

## Docker Issues

### Docker permission denied

**Problem:** Can't run Docker commands without sudo.

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or
newgrp docker

# Verify
docker run hello-world
```

---

### Container not starting

**Problem:** Docker containers fail to start.

**Diagnosis:**
```bash
# Check container logs
docker compose logs

# Check container status
docker compose ps

# Check for port conflicts
sudo lsof -i :8080
```

**Solutions:**

1. **Stop conflicting services**
   ```bash
   # Kill process using port
   sudo kill $(sudo lsof -t -i:8080)
   ```

2. **Rebuild containers**
   ```bash
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

3. **Check Docker resources**
   ```bash
   docker system df
   docker system prune -a
   ```

---

### Volume permission issues

**Problem:** Files created in Docker have wrong permissions.

**Solution:**
```bash
# Fix ownership
sudo chown -R $(id -u):$(id -g) ./

# Or use user in docker-compose.yml
services:
  app:
    user: "${UID}:${GID}"
```

---

## BMAD Issues

### "No sprint-status.yaml found"

**Problem:** BMAD commands fail because sprint-status.yaml doesn't exist.

**Solution:**
```bash
# Initialize BMAD
/bmad:init

# Or create manually
mkdir -p .bmad
cat > .bmad/sprint-status.yaml << 'EOF'
version: 2
current_sprint: 1
sprints:
  - number: 1
    goal: "Initial sprint"
    stories: []
EOF
```

---

### Quality gate always fails

**Problem:** Quality gates fail even when criteria seem met.

**Diagnosis:**
```
/gate:report
```

**Common causes:**

1. **Missing required fields**
   - PRD must have: problem, users, goals, metrics, scope
   - Story must have: AC, estimate, tasks

2. **Format issues**
   - YAML syntax errors in story files
   - Missing frontmatter

3. **Threshold not met**
   - PRD Gate: ≥80%
   - Tech Spec Gate: ≥90%
   - Story DoD: 100%

---

### Story transitions not working

**Problem:** `/sprint:transition` fails to update story status.

**Solution:**
```bash
# Check current status
cat .bmad/backlog/US-001.md

# Valid transitions:
# backlog → ready-for-dev
# ready-for-dev → in-progress
# in-progress → review
# review → done
# any → blocked

# Manual fix if needed
# Edit the frontmatter in the story file
```

---

## Ralph Wiggum Issues

### Infinite loop

**Problem:** Ralph keeps running without completing.

**Solution:**
```bash
# Ralph has built-in circuit breaker
# Default: 10 iterations max

# Check ralph.yml for limits
cat ralph.yml

# Adjust limits
max_iterations: 5
circuit_breaker:
  enabled: true
  threshold: 3
```

---

### DoD validators always fail

**Problem:** Definition of Done validators don't pass.

**Diagnosis:**
```bash
# Check DoD configuration
cat ralph.yml

# Run validators manually
npm test
npm run lint
```

**Common issues:**

1. **Command validator fails**
   ```yaml
   # Verify command works manually
   dod:
     - type: command
       command: "npm test"
       expect_exit_code: 0
   ```

2. **File changed validator fails**
   ```yaml
   # Check file paths are correct
   dod:
     - type: file_changed
       path: "src/feature/*.ts"
   ```

---

## Team Sprint Issues

### Sprint doesn't start

**Problem:** `/team:sprint --ralph-mode` fails immediately.

**Diagnosis:**
```bash
# Check BMAD is initialized
ls .bmad/sprint-status.yaml

# Check for ready stories
yq '.stories | to_entries[] | select(.value.status == "ready-for-dev")' .bmad/sprint-status.yaml
```

**Solutions:**

1. **Initialize BMAD first**
   ```bash
   /bmad:init
   /sprint:next-story
   ```

2. **Transition stories to ready-for-dev**
   ```bash
   /sprint:transition US-001 ready-for-dev
   ```

> **Note:** `/common:ralph-sprint` was removed in v6.0. Use `/team:sprint --ralph-mode` instead. See [Migration Guide](MIGRATION-v6.md).

---

## Configuration Issues

### YAML syntax errors

**Problem:** Configuration files have invalid YAML.

**Diagnosis:**
```bash
# Validate YAML
yq eval '.' claude-projects.yaml

# Or use online validator
```

**Common issues:**

1. **Indentation errors**
   ```yaml
   # Wrong
   projects:
   - name: "test"
     modules:
     - path: "src"

   # Correct
   projects:
     - name: "test"
       modules:
         - path: "src"
   ```

2. **Unquoted special characters**
   ```yaml
   # Wrong
   description: This is a test: value

   # Correct
   description: "This is a test: value"
   ```

---

### Multi-project config not working

**Problem:** `make config-install` fails for monorepo setup.

**Solution:**
```bash
# Validate configuration
make config-validate

# Check project name
make config-list

# Install with correct project name
make config-install PROJECT=my-monorepo
```

---

## Performance Issues

### Slow command execution

**Problem:** Commands take too long to complete.

**Solutions:**

1. **Reduce context size**
   - Use TCL structure (default in v4)
   - Reference only needed files with `@`

2. **Optimize Docker**
   ```bash
   # Use build cache
   docker compose build

   # Don't rebuild every time
   docker compose up -d
   ```

3. **Check Claude Code version**
   ```bash
   claude --version
   # Update if needed
   npm update -g @anthropic-ai/claude-code
   ```

---

### High memory usage

**Problem:** Claude Code consumes excessive memory.

**Solutions:**

1. **Flatten large codebases**
   ```bash
   npx @the-bearded-bear/claude-craft flatten --max-tokens=50000
   ```

2. **Use document sharding**
   - Automatic when max-tokens is set

3. **Exclude large files**
   ```bash
   # Add to .gitignore or .claudeignore
   *.log
   node_modules/
   vendor/
   ```

---

### Files overwritten after update

**Problem:** Custom configurations lost after reinstall.

**Prevention:**
```bash
# Use preserve-config option
make install-symfony TARGET=. OPTIONS="--force --preserve-config"
```

**Recovery:**
```bash
# If you had backups
ls .claude.backup/

# Restore specific files
cp .claude.backup/rules/00-project-context.md .claude/rules/
```

---

## Getting More Help

### Debug Mode

Enable verbose output:
```bash
# With scripts
./Dev/scripts/install-symfony-rules.sh --verbose ~/project

# With make
make install-symfony TARGET=~/project OPTIONS="--verbose"
```

### Check Logs

```bash
# Claude Code logs
cat ~/.claude/logs/claude-code.log

# Docker logs
docker compose logs -f
```

### Report Issues

If you can't find a solution:

1. Search existing issues: https://github.com/TheBeardedBearSAS/claude-craft/issues
2. Create a new issue with:
   - Claude Craft version
   - OS and version
   - Steps to reproduce
   - Error messages
   - Expected vs actual behavior

---

## Quick Diagnostic Script

Run this to diagnose common issues:

```bash
#!/bin/bash
echo "=== Claude Craft Diagnostics ==="

echo -e "\n--- System Info ---"
echo "OS: $(uname -a)"
echo "Shell: $SHELL"

echo -e "\n--- Dependencies ---"
for cmd in node npm yq jq git docker make; do
    if command -v $cmd &> /dev/null; then
        echo "[OK] $cmd: $($cmd --version 2>&1 | head -n1)"
    else
        echo "[MISSING] $cmd"
    fi
done

echo -e "\n--- Claude Code ---"
if command -v claude &> /dev/null; then
    echo "[OK] Claude Code: $(claude --version 2>&1 | head -n1)"
else
    echo "[MISSING] Claude Code CLI"
fi

echo -e "\n--- Project Structure ---"
if [ -d ".claude" ]; then
    echo "Commands: $(find .claude/commands -name '*.md' 2>/dev/null | wc -l)"
    echo "Agents: $(find .claude/agents -name '*.md' 2>/dev/null | wc -l)"
    echo "References: $(find .claude/references -name '*.md' 2>/dev/null | wc -l)"
else
    echo "[MISSING] .claude directory"
fi

echo -e "\n--- Docker ---"
if command -v docker &> /dev/null; then
    echo "Docker running: $(docker info 2>&1 | grep -q 'Server Version' && echo 'Yes' || echo 'No')"
fi
```

Save as `diagnose.sh` and run with `bash diagnose.sh`.

---

## Hook Event Issues (v8.x)

### Hook not triggering

**Problem:** PreToolUse, PostToolUse, or new hook events don't execute.

**Solutions:**

1. Verify hook JSON syntax: `jq empty .claude/settings.json`
2. Check Claude Code version: v2.1.76+ required for most new hooks
3. Verify matcher is correct (`auto`, `compact`, `explicit`, `always`)
4. Check `if` conditional field syntax (v2.1.85+)

### PreCompact hook not blocking

**Problem:** PreCompact hook with exit code 2 doesn't block compaction.

**Solution:** Requires Claude Code v2.1.105+. Check version with `claude --version`.

---

## Subprocess Sandboxing Issues

### "PID namespace not available"

**Problem:** Linux system doesn't support PID namespaces.

**Solution:** Set `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` for standard isolation without PID namespaces.

### "Permission denied" in sandboxed subprocess

**Problem:** Subprocess lacks required permissions.

**Solution:** Check `sandbox.failIfUnavailable` in settings. Set to `false` for graceful degradation.

---

## MCP Tool Search Issues

### Tools not lazy-loading

**Problem:** MCP tools load eagerly instead of via Tool Search.

**Solution:** Update Claude Code to v2.1.80+ which includes Tool Search. Check with `claude --version`.

---

## Managed Settings Issues

### Settings not merging

**Problem:** Files in `managed-settings.d/` aren't being applied.

**Solutions:**

1. Verify files use `NN-name.json` naming pattern
2. Check JSON syntax: `for f in .claude/managed-settings.d/*.json; do jq empty "$f"; done`
3. Files merge alphabetically — later files override earlier ones
4. Requires Claude Code v2.1.83+
