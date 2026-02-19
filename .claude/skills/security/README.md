# Security

Universal security guidelines based on OWASP Top 10 and industry best practices.

Part of [Claude-Craft](https://github.com/TheBeardedBearSAS/claude-craft) -- AI-assisted development framework for Claude Code.

## Installation

Copy this directory to your project's `.claude/skills/` directory:

```bash
cp -r security/ your-project/.claude/skills/security/
```

## What's Included

- `SKILL.md` -- Skill definition with triggers and quick reference
- `REFERENCE.md` -- Comprehensive security guidelines covering OWASP Top 10, authentication, authorization, input validation, and security checklists

## Covers

- OWASP Top 10 -- Broken Access Control, Injection, SSRF, and more
- Input validation -- server-side validation, parameterized queries
- Authentication -- password hashing, JWT, sessions, MFA
- Authorization -- RBAC, row-level security, least privilege
- Data protection -- encryption at rest and in transit, secrets management
- Security headers -- CSP, HSTS, X-Frame-Options, nosniff

## Technology Agnostic

This skill provides universal security principles applicable to any language, framework, or platform. Adapt the recommendations to your stack's specific security libraries and tools.

## License

MIT -- See [Claude-Craft](https://github.com/TheBeardedBearSAS/claude-craft) for full license.
