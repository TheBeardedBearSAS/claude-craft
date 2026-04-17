---
name: debug-methodical
description: 4-phase debugging methodology — reproduce, isolate, fix, verify (no random fixes)
author: The Bearded CTO / Claude Craft
version: 1.0.0
tags: [debugging, troubleshooting, regression, bug-fix, methodical]
category: quality
license: MIT
repository: https://github.com/TheBeardedCTO/claude-craft
---

# Debug-Methodical — 4-Phase Debugging

Rigorous debugging methodology instead of "try random fixes until it works".

**Golden rule:** A bug without stable reproduction is a bug poorly understood. NEVER fix before reproducing.

## The 4 Phases (strict, in order)

### Phase 1: REPRODUCE

**Objective:** Execute the bug at will, in a controlled environment.

**Checklist:**
- [ ] Reproduction steps documented (Given/When/Then)
- [ ] Deterministic reproduction (>= 3 consecutive identical runs)
- [ ] Isolated environment (local, container, test env)
- [ ] Minimal inputs (least data/steps possible)
- [ ] Exact version/commit identified

**Output:** Automated test that **fails** exposing the bug (regression test).

**Red flag:** "works on my machine" / "sometimes fails" → reproduction insufficient, return to Phase 1.

### Phase 2: ISOLATE

**Objective:** Identify the **root cause**, not just a symptom.

**Techniques:**
- **Bisect:** `git bisect` to find the faulty commit
- **Binary search** in code: comment half, then iterate
- **Print-driven debugging:** logs at boundaries (function entry/exit)
- **Debugger:** breakpoints, step-through, variable watch
- **Diff environments:** what differs between "working" and "broken"?
- **Question the premise:** is the initial assumption correct?

**Checklist:**
- [ ] Cause identified (exact line / condition / input)
- [ ] Explanation of **why** (not just **what**)
- [ ] Causality chain documented (A causes B causes C)
- [ ] Other manifestations of same bug identified

**Red flag:** "I think it's X" without proof → return to isolate with instrumentation.

### Phase 3: FIX

**Objective:** Fix the root cause with minimal change.

**Checklist:**
- [ ] Fix at the right level (root cause, not symptom)
- [ ] Minimal change (KISS)
- [ ] No side effects on other features
- [ ] No "just in case" / speculative fixes
- [ ] Fix in the correct layer (domain / infra / UI)

**Red flags:**
- Fix that adds `try/catch` to mask the error → treats symptom, not cause
- Fix that requires suspiciously modifying existing tests
- Fix that "works" without understanding why

### Phase 4: VERIFY

**Objective:** Prove the fix works AND didn't break anything else.

**Checklist:**
- [ ] Regression test (Phase 1) now passes
- [ ] Full test suite passes
- [ ] Manual reproduction no longer shows bug
- [ ] Adjacent scenarios tested (close edge cases)
- [ ] Performance not degraded
- [ ] Logs / monitoring verified in staging if critical

**Regression rule:** The test written in Phase 1 stays in the codebase **forever**. A fixed bug should NEVER reappear.

## Critical Anti-patterns

| Anti-pattern | Why it's bad |
|--------------|--------------|
| **Shotgun debugging** | Change 10 things randomly, no learning |
| **Symptom fix** | Bug returns in another form |
| **Skip reproduction** | Fix impossible to validate |
| **Skip verification** | "should work" — proof or not done |
| **No regression test** | Bug reappears in 3 months |
| **Fix with generic `catch (Exception)`** | Masks other bugs |
| **Mixed commit fix + refactor** | `git bisect` impossible |

## Advanced Techniques

### For Concurrency Bugs
- Force interleavings (strategic sleep, stress test)
- Thread dumps / profiler
- Verify invariants atomically

### For Integration Bugs
- Snapshot exact payload (HAR, logs)
- Reproduce with `curl` or minimal client
- Verify exact dependency versions

### For Flaky Tests
- Run 100x to measure flakiness rate
- Identify dependency (time, order, shared resource)
- NEVER mark test `@Flaky` without fix ticket

---

**By The Bearded CTO / Claude Craft**
**Framework-agnostic — works with any stack**
