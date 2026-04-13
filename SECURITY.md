# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 7.25.x  | :white_check_mark: |
| 7.24.x  | :white_check_mark: |
| < 7.24  | :x:                |

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
