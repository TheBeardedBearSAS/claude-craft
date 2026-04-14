# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 7.27.x  | :white_check_mark: |
| 7.26.x  | :white_check_mark: |
| < 7.26  | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Claude Craft, please report it responsibly.

**Email:** security@thebearded-cto.com

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Disclosure Timeline

- We will acknowledge your report within **48 hours**.
- We aim to provide a fix within **90 days** of the initial report.
- **Do not** publicly disclose the vulnerability before a fix has been released.
- Once a fix is available, we will coordinate with you on public disclosure.

### What to Expect

- A confirmation of receipt within 48 hours.
- Regular updates on the status of the fix (at least every 2 weeks).
- Credit in the release notes (unless you prefer to remain anonymous).

### Out of Scope

- Vulnerabilities in dependencies managed by upstream maintainers (please report those directly to the relevant project).
- Issues that require physical access to the user's machine.
- Social engineering attacks.

## Security Best Practices

When using Claude Craft:

- Keep Claude Code updated to the minimum recommended version (2.1.97+).
- Review agent permissions in `.claude/settings.json` before granting access.
- Never commit sensitive data (API keys, tokens) in BMAD configuration files.
- Use the sandbox mode to restrict skill directory writes.

### Known CVE Fixes (Claude Code)

Claude Code v2.1.97+ includes critical security fixes:

| CVE | Severity | Fixed In | Description |
|-----|----------|----------|-------------|
| CVE-2025-59536 | 8.7/10 CVSS | v2.1.51 | Command injection via MCP hook inputs |
| CVE-2026-21852 | 5.3/10 CVSS | v2.0.65 | API key exfiltration via path traversal |
| CVE-2026-35020 | High | v2.1.97 | Compound command bypass in Bash tool |
| CVE-2026-35021 | High | v2.1.97 | Network redirect bypass in Bash tool |
| CVE-2026-35022 | High | v2.1.98 | Env-var prefix injection in Bash tool |
| N/A | High | v2.1.101 | Command injection via POSIX `which` fallback |

**Incident**: Claude Code v2.1.88 exposed source code via `.map` file (59.8 MB). Fixed in v2.1.89.

### Subprocess Sandboxing (v2.1.98+)

- **PID namespace isolation**: Subprocesses run in dedicated PID namespace (Linux)
- **Environment scrubbing**: `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` removes credentials
- **Fail-safe mode**: `sandbox.failIfUnavailable` fails if sandbox unavailable (v2.1.83+)
