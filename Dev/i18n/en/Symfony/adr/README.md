# Architecture Decision Records (ADR)

> Documentation of major architectural decisions for the project

## What is an ADR?

An **Architecture Decision Record** (ADR) is a document that captures an important architectural decision, including:
- The **context** and problem to solve
- The **alternatives** considered with their pros/cons
- The **decision** made and its justification
- The **consequences** both positive AND negative
- **Implementation** details

**Format used**: MADR v2.2 (Markdown Any Decision Records)

---

## ADR Index

### Critical (P0)

| ADR | Title | Status | Date | Tags |
|-----|-------|--------|------|------|
| [0001](0001-halite-encryption.md) | Halite Encryption for GDPR Sensitive Data | ✅ Accepted | 2025-11-26 | security, gdpr, halite |
| [0002](0002-gedmo-doctrine-extensions.md) | Gedmo Doctrine Extensions for Audit Trail | ✅ Accepted | 2025-11-26 | audit, gedmo, gdpr |
| [0003](0003-clean-architecture-ddd.md) | Clean Architecture + DDD + Hexagonal | 🔄 Refactoring | 2025-11-26 | architecture, ddd |

### Important (P1)

| ADR | Title | Status | Date | Tags |
|-----|-------|--------|------|------|
| [0004](0004-docker-multi-stage.md) | Docker Multi-stage for Dev and Prod | ✅ Accepted | 2025-11-26 | docker, infra |
| [0005](0005-symfony-messenger-async.md) | Symfony Messenger for Async Emails | 📝 Proposed | 2025-11-26 | async, messaging |
| [0006](0006-postgresql-database.md) | PostgreSQL 16 as Database | ✅ Accepted | 2025-11-26 | database |

### Standard (P2)

| ADR | Title | Status | Date | Tags |
|-----|-------|--------|------|------|
| [0007](0007-easyadmin-backoffice.md) | EasyAdmin for Backoffice | ✅ Accepted | 2025-11-26 | admin, crud |
| [0008](0008-tailwind-alpine-frontend.md) | Tailwind CSS + Alpine.js for Frontend | ✅ Accepted | 2025-11-26 | frontend |
| [0009](0009-phpstan-quality-tools.md) | PHPStan and Quality Tools | ✅ Accepted | 2025-11-26 | quality, phpstan |
| [0010](0010-conventional-commits.md) | Conventional Commits | ✅ Accepted | 2025-11-26 | git, commits |

### Status Legend

- 📝 **Proposed**: Under discussion, not yet accepted
- ✅ **Accepted**: Decision validated and in production
- 🔄 **Refactoring**: Implementation in progress (gradual migration)
- ⚠️ **Deprecated**: Obsolete, do not use
- 🔄 **Superseded**: Replaced by a new ADR (see link)

---

## When to Create an ADR?

### ✅ CREATE an ADR if:

- **Structural architectural decision** impacting > 1 bounded context
- **Significant trade-offs** between multiple viable options
- **Constraint** (regulatory/security/performance) imposing a choice
- **Recurring question** in code review needing an official answer
- **Paradigm shift** (e.g., sync → async, monolith → microservices)
- **Major technology choice** (framework, library, infrastructure)
- **New architectural pattern** for the team

### ❌ DO NOT CREATE an ADR if:

- **Local tactical decision** affecting < 3 files
- **Simple bug fix** without architectural impact
- **Standard CRUD** following existing patterns
- **Minor dependency update** (patch/minor version)
- **Obvious choice** with no viable alternative
- **Environment configuration** (unless security/compliance impact)

**Golden rule**: If in doubt, discuss with the Lead Dev before creating the ADR.

---

## ADR Creation Process

### 1️⃣ Proposal (Status: Proposed)

```bash
# 1. Create dedicated branch
git checkout -b adr/0011-decision-title

# 2. Copy template
cp .claude/adr/template.md .claude/adr/0011-decision-title.md

# 3. Fill all mandatory sections
# - Minimum 2 options with pros/cons
# - Clear justification for decision
# - Positive AND negative consequences

# 4. Commit
git add .claude/adr/0011-decision-title.md
git commit -m "docs: add ADR-0011 for [title] (Proposed)"
```

### 2️⃣ Discussion (Pull Request)

```bash
# 5. Push and create PR
git push origin adr/0011-decision-title

# 6. Open PR with title: [ADR] ADR-0011: Decision Title
#    - Tag: [ADR]
#    - Reviewers: Lead Dev + 1 Senior minimum
#    - Description: Link to ADR in PR body
```

**Items to discuss in PR**:
- Have all options been considered?
- Is the justification convincing?
- Are the negative consequences acceptable?
- Are there undocumented risks?
- Is the implementation clear?

### 3️⃣ Acceptance (Status: Accepted)

**Acceptance criteria**:
- ✅ Minimum 2 reviewers approved (Lead Dev + 1 Senior)
- ✅ All mandatory sections filled
- ✅ Minimum 2 options documented with pros/cons
- ✅ Positive AND negative consequences listed
- ✅ References to existing rules/code present
- ✅ Concrete code examples (not generic)

### 4️⃣ Implementation

```bash
# When implementing the decision:
git commit -m "feat: implement [feature] (see ADR-0011)"
```

### 5️⃣ Superseded (If Evolution Needed)

If a decision needs significant modification:

```bash
# 1. NEVER delete the old ADR
# 2. Mark old ADR as Superseded
#    Status: Superseded by ADR-0015
# 3. Create new ADR (ADR-0015) explaining:
#    - Why the initial decision no longer holds
#    - What changed (context, constraints)
#    - The new decision
# 4. Link both ADRs mutually
```

---

## Validation Checklist

Before submitting an ADR in PR, verify:

- [ ] **Title** clear and descriptive (≤10 words)
- [ ] **Status** correct (Proposed for new ADR)
- [ ] **Date** in YYYY-MM-DD format
- [ ] **Deciders** listed with full names
- [ ] **Tags** relevant (3-5 tags)
- [ ] **Context** clearly explains the problem (2-3 paragraphs)
- [ ] **Minimum 2 options** documented
- [ ] Each option has **pros** AND **cons**
- [ ] **Decision** justified in detail (why this option?)
- [ ] **Positive consequences** listed (3-5)
- [ ] **Negative consequences** listed honestly (2-4)
- [ ] **Risks** identified with mitigation
- [ ] **Implementation**: affected files listed
- [ ] **Code example** concrete from project (NOT generic)
- [ ] **References** to `.claude/` rules, docs, related ADRs
- [ ] **Tests** required described
- [ ] Spelling/grammar review

---

## Resources and References

### Internal Documentation

- **Project configuration**: [`.claude/CLAUDE.md`](../CLAUDE.md)
- **Architecture rules**: [`.claude/rules/02-architecture-clean-ddd.md`](../rules/02-architecture-clean-ddd.md)
- **GDPR security rules**: [`.claude/rules/11-security-rgpd.md`](../rules/11-security-rgpd.md)
- **Development templates**: [`.claude/templates/`](../templates/)
- **Quality checklists**: [`.claude/checklists/`](../checklists/)

### MADR Resources

- [MADR (Markdown Any Decision Records)](https://adr.github.io/madr/) - Official format
- [ADR Tools](https://github.com/npryce/adr-tools) - CLI for managing ADRs
- [Architecture Decision Records (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Foundational article

---

## Best Practices

### ✅ DO

- **Be concise**: 2 pages maximum per ADR (except exceptional cases)
- **Be honest**: Document disadvantages and risks
- **Be concrete**: Project code examples, not generic
- **Reference**: Link ADRs, rules, existing code
- **Update**: Add post-implementation feedback
- **Version**: Sequential numbering (0001, 0002, ...)
- **Date**: Clear creation/acceptance date

### ❌ DON'T

- **Never delete** an ADR (use Superseded)
- **Don't copy** code from rules (reference them)
- **Don't over-generalize** (keep project context)
- **Don't forget** negative consequences (crucial)
- **Don't delay**: Create ADR BEFORE implementation if possible
- **Don't skip** reviews (2+ reviewers mandatory)

---

**Last update**: 2025-11-26

- **Total ADRs**: 10
- **Accepted**: 9
- **Proposed**: 1
- **Refactoring**: 1
- **Deprecated**: 0
- **Superseded**: 0

---

*This README is maintained by the Architecture team. Any modification must be validated by the Lead Dev.*
