---
name: kiss-dry-yagni
description: Simplicity principles — KISS, DRY, YAGNI for maintainable code with minimal complexity
author: The Bearded CTO / Claude Craft
version: 1.0.0
tags: [simplicity, refactoring, yagni, clean-code, kiss, dry, cognitive-complexity]
category: quality
license: MIT
repository: https://github.com/TheBeardedCTO/claude-craft
---

# KISS, DRY, YAGNI — Simplicity Principles

These principles are **mandatory** for maintainable code.

## KISS — Keep It Simple

| Metric | Target | Limit |
|--------|--------|-------|
| **Cognitive Complexity** (primary 2026) | < 7 | < 10 |
| Lines per method | < 10 | < 20 |
| Cyclomatic complexity | < 5 | < 10 |
| Indentation depth | 2 | 3 max |
| Parameters per method | 3 | 4 max |

> **Cognitive Complexity** (SonarQube, ReSharper) is the dominant 2026 metric: it measures human understanding difficulty. It prevails over strict 20-line limit.

### Rules

- **Early returns** (guard clauses)
- No nested else
- Explicit naming
- Composition > inheritance

### Example

```
❌ BAD: Nested if/else, cognitive complexity 15
✅ GOOD: Early returns, cognitive complexity 3
```

## DRY — Don't Repeat Yourself

- Each business rule in **ONE place** (Value Objects for validation)
- **Rule of 3:** Don't abstract before 3 occurrences
- Acceptable duplication: tests (clarity), config per env, different types

### When to DRY

```
✅ ABSTRACT:
- Same validation in 3+ places
- Same calculation in 3+ places
- Same business rule in 3+ places

❌ DON'T ABSTRACT:
- 2 occurrences only
- Similar but different logic
- Tests (keep explicit)
```

## YAGNI — You Aren't Gonna Need It

Before adding: is it required NOW? Is it in the ticket? Did the client request it?
If NO → **don't implement**.

### Questions to Ask

1. Is this required NOW?
2. Is it in the current ticket/story?
3. Did the client/user explicitly request it?
4. Will it be used in the next release?

If NO to all → **YAGNI applies, don't build it.**

## Anti-patterns

| Anti-pattern | Description | Solution |
|--------------|-------------|----------|
| **Premature optimization** | Optimizing before measuring | Profile first |
| **Gold plating** | Adding unrequested features | Stick to requirements |
| **Speculative generality** | "We might need this later" | YAGNI — delete it |
| **Lasagna code** | Too many abstraction layers | Flatten |

## AI-Era Extension: Karpathy Principles

For LLM-generated/assisted code, apply **3 Karpathy principles**:

1. **State assumptions explicitly** — document all assumptions before coding
2. **Minimal code, no speculation** — 100 lines instead of 1000, zero "just in case"
3. **Surface confusion** — ask questions rather than generate plausible but wrong code

## Checklist

- [ ] Cognitive complexity < 10 for all methods
- [ ] No code duplication (DRY)
- [ ] No unused code (YAGNI)
- [ ] No premature optimization
- [ ] No speculative features
- [ ] Early returns instead of nested if/else
- [ ] Composition preferred over inheritance

---

**By The Bearded CTO / Claude Craft**
**Framework-agnostic — works with any stack**
