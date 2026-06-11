---
name: atomic-tasks
description: GSD pattern — split work into atomic tasks with fresh subagent contexts to fight context rot
author: The Bearded CTO / Claude Craft
version: 1.0.0
tags: [workflow, productivity, context-management, gsd, atomic, subagent]
category: workflow
license: MIT
repository: https://github.com/TheBeardedBearSAS/claude-craft
---

# Atomic Tasks — GSD Pattern (Get Shit Done)

Pattern to fight **context rot** (quality degradation beyond ~50% context used) by splitting work into atomic tasks executed in fresh subagent contexts.

**Inspired by:** [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) (Lex Christopherson, adopted by Amazon/Google/Shopify/Webflow)

## The 5 Steps

### 1. Split Work

Split feature into **atomic** tasks:
- Expressible in 1-3 sentences
- Achievable in < 30 minutes
- Testable independently
- Committable in one atomic commit

```
❌ BAD: "Add authentication system"
✅ GOOD:
  1. "Create users table with migration"
  2. "Implement POST /auth/register with email validation"
  3. "Implement POST /auth/login returning JWT"
  4. "Add JWT verification middleware"
  5. "Integration tests for login flow"
```

### 2. Small Plans — Short Plan Per Task

For each atomic task, a **short** plan:
- 1 objective
- 3-5 steps max
- Explicit success criteria (test passes, endpoint responds, file exists)

### 3. Fresh Subagent Contexts

**Fundamental rule:** Each atomic task executes in a **fresh subagent context** (via Task tool or `/clear` between tasks).

| Reason | Impact |
|--------|--------|
| Context < 30% at start | Maximum response quality |
| No residue from previous task | Zero cross-task confusion |
| Optimized token cost | No unnecessary context rereading |
| Parallelizable | Multiple subagents simultaneously |

**Implementation:**
- Use Agent tool with `subagent_type=general-purpose` or specialized
- Pass ONLY necessary context (not entire project)
- Request concise report at end (< 200 words)

### 4. Atomic Git Commits

Each task = 1 commit. **Never** commit mixing 2 tasks.

```
✅ GOOD:
  commit 1: "feat(auth): add users table migration"
  commit 2: "feat(auth): implement register endpoint"
  commit 3: "feat(auth): implement login endpoint"

❌ BAD:
  commit 1: "feat: auth system + bug fixes + refactor"
```

**Benefit:** Efficient `git bisect`, targeted reverts, easier review.

### 5. Verify Goals

Before moving to next task, **explicitly verify** objective is met:

- [ ] Written test passes
- [ ] Endpoint responds with correct HTTP code
- [ ] Build compiles
- [ ] Linter passes
- [ ] User behavior is observable

**Rule:** No "I think it works". **Proof or not done.**

## Signals to Apply This Pattern

- Context used > 50%
- Task spanning > 1h without intermediate deliverable
- Claude responses becoming less precise
- Need to re-explain things already said
- Multiple responsibilities in single request

## Anti-patterns

| Anti-pattern | Why bad |
|--------------|---------|
| **Kitchen-sink session** | Everything in 1 session = context rot guaranteed |
| **Non-testable task** | Impossible to verify = never "done" |
| **Mixed commit** | Review impossible, revert dangerous |
| **No clear between tasks** | Cross-task pollution |
| **Excessive planning** | 10 steps to change 1 line = overhead |

## Checklist

- [ ] Feature split into tasks < 30 min each
- [ ] Each task has 1 clear objective
- [ ] Each task testable independently
- [ ] Fresh context for each task (subagent or `/clear`)
- [ ] 1 task = 1 atomic commit
- [ ] Explicit verification before next task

---

**By The Bearded CTO / Claude Craft**
**Framework-agnostic — works with any stack**
