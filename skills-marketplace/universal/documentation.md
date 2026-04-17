---
name: documentation
description: Documentation as Code — README, ADR, CHANGELOG, OpenAPI 3.2 best practices
author: The Bearded CTO / Claude Craft
version: 1.0.0
tags: [documentation, adr, openapi, changelog, readme, markdown]
category: quality
license: MIT
repository: https://github.com/TheBeardedCTO/claude-craft
---

# Documentation — Documentation as Code

Universal documentation principles for any project.

## Core Principles

- ✅ Documentation as Code (versioned with code)
- ✅ Single Source of Truth (no duplication)
- ✅ Updated with each PR
- ✅ Automated when possible

## Types of Documentation

| Type | Audience | Content | Format |
|------|----------|---------|--------|
| README | New devs | Quick start | Markdown |
| Code comments | Developers | Why, not what | Inline |
| API docs | Consumers | Endpoints, schemas | OpenAPI |
| ADR | Team | Arch. decisions | Markdown |
| Changelog | All | Change history | Markdown |

## README.md — Required Sections

1. **Name + description** (1-2 sentences)
2. **Prerequisites** (tools, versions)
3. **Installation** (commands)
4. **Quick start** (commands)
5. **Configuration** (env variables)
6. **Tests** (how to run)
7. **Deployment** (instructions)
8. **Architecture** (brief + link to detailed docs)
9. **Contributing** (link to CONTRIBUTING.md)
10. **License**

## Code Comments — Golden Rule

> **Code must be self-documented.**
> Comments explain **WHY**, not **WHAT**.

### When to Comment

✅ **COMMENT:**
- Non-obvious decisions
- Temporary workarounds
- External references (tickets, specs)
- Complex algorithms

❌ **DON'T COMMENT:**
- What the code does (readable)
- Obvious code
- Dead code

## ADR — Architecture Decision Records

### Format

| Section | Content |
|---------|---------|
| **Status** | Accepted / Rejected / Deprecated + date |
| **Context** | Problem to solve, constraints |
| **Decision** | Chosen solution |
| **Alternatives** | Options evaluated with pros/cons |
| **Consequences** | Positive and negative impacts |

### When to Create ADR

- Major technology choice
- Architecture change
- Pattern adoption
- Irreversible or costly decision

### Recommended Tools

- **Log4brains** — CLI + web UI + ADR dependency graphs
- **adr-log** — Compliance validation (policy enforcement)
- **ADR Manager** — VS Code extension for creating/editing ADRs

## API Documentation — OpenAPI 3.2

### New in OpenAPI 3.2

- **JSON Schema 2020-12** alignment
- **Streaming responses** native support (SSE, JSON Lines)
- **OAuth 2.0 device flow**
- **Discriminated unions** better support

### Best Practices

1. **Concrete examples** for each endpoint
2. **Error codes** documented (RFC 9457 Problem Details)
3. **Authentication** explained (Bearer, OAuth2, OIDC)
4. **Rate limits** mentioned (`X-RateLimit-*` headers)
5. **Versioning** clear (URI `/v1/`, header `API-Version`)

## CHANGELOG — Keep a Changelog Format

### Categories

| Category | Content |
|-----------|---------|
| **Added** | New features |
| **Changed** | Behavior changes |
| **Deprecated** | Soon-to-be-removed features |
| **Removed** | Removed features |
| **Fixed** | Bug fixes |
| **Security** | Security fixes |

## Best Practices

### 1. Documentation as Code

```
✅ Versioned with Git
✅ Reviewed in PRs
✅ Documentation tests (links, syntax)
✅ CI/CD generates docs
```

### 2. Single Source of Truth

```
❌ BAD
- README says "use npm"
- Wiki says "use yarn"
- Slack says "use pnpm"

✅ GOOD
- README says "use npm"
- Wiki links to README
- Slack links to README
```

### 3. Continuous Update

**Rule:** Each PR that changes behavior must update documentation.

**PR Checklist:**
- [ ] README updated
- [ ] API docs updated
- [ ] CHANGELOG updated
- [ ] ADR created if architectural decision

---

**By The Bearded CTO / Claude Craft**
**Framework-agnostic — works with any stack**
