---
name: socratic-brainstorm
description: Socratic questioning before coding — clarify requirements through targeted questions instead of jumping to solutions
author: The Bearded CTO / Claude Craft
version: 1.0.0
tags: [brainstorming, requirements, planning, socratic-method, clarification]
category: planning
license: MIT
repository: https://github.com/TheBeardedBearSAS/claude-craft
---

# Socratic Brainstorm — Clarify Before Coding

Force a phase of targeted questioning before any implementation, to avoid coding the wrong thing very fast.

**Golden rule:** A question costs 30 seconds, a false development costs 3 days.

## Socratic Method: 5 Question Families

Ask **before** touching code. Not all every time — choose the most relevant for context.

### 1. Questions About the PROBLEM

- What's the **real** problem to solve? (not the supposed solution)
- For whom? Which persona / user role?
- What's the cost of **doing nothing**?
- How will success be measured? (KPI, metric)
- Is there a simpler solution that solves 80% of the need?

### 2. Questions About CONSTRAINTS

- **Business** constraints: legal rules, compliance, SLA?
- **Technical** constraints: imposed stack, dependencies, legacy?
- **Time** constraints: deadline, external dependencies?
- **Resource** constraints: infra budget, HR, long-term maintenance?
- What should we **absolutely not** break?

### 3. Questions About ALTERNATIVES

- What are 3 possible approaches? (minimum)
- Why this one rather than another?
- What have we already tried / considered?
- Is there an off-the-shelf solution (lib, SaaS)?
- Can we code nothing (config, manual, process)?

### 4. Questions About ASSUMPTIONS

- What are we **assuming** without verifying?
- What's the expected volume / traffic?
- What's the real usage pattern (95% cases / 5% edge cases)?
- Which external actors involved? (third-party APIs, teams, users)
- What happens if this assumption is false?

### 5. Questions About CONSEQUENCES

- What changes for the end user?
- Impact on other features / modules?
- Operational costs (infra, monitoring, support)?
- How to rollback if it goes wrong?
- How does this solution evolve in 1 year, 3 years?

## Expected Output

After brainstorm phase, produce **one page** (max) with:

1. **Problem reformulated** in 1-2 sentences
2. **Main constraints** (5 bullets max)
3. **Chosen option** + **2 rejected alternatives** with reason
4. **Key assumptions** to validate early in implementation
5. **Identified risks** + mitigations

## Golden Rules

### DON'T skip this phase if:
- Initial request contains "maybe", "probably", "I think"
- Requester is not an end user
- Multiple solutions seem possible at first glance
- Feature touches legacy code or complex domain

### SKIP this phase if:
- Obvious bug with only one possible fix
- Typo / formatting / doc
- Task < 10 min with trivial scope

## Anti-patterns

| Anti-pattern | Solution |
|--------------|----------|
| Infinite brainstorm without decision | Timebox 30 min max |
| Rhetorical questions (obvious answer) | **Open** and useful questions |
| Answer yourself without asking | Really ask questions to requester |
| Skip brainstorm "because it's urgent" | Urgency costs 10x the avoided brainstorm |
| Note answers in your head | Write = visible, revisitable, versionable |

## Quick Variant: "5 Whys"

For bugs or root causes, use Toyota's **5 Whys**:

```
Bug: "Payment fails"
Why 1: Why? → API returns 500
Why 2: Why? → DB timeout
Why 3: Why? → Query without index
Why 4: Why? → Column added without index migration
Why 5: Why? → No PR checklist for migrations
```

**Root cause:** missing checklist, not the 500.

---

**By The Bearded CTO / Claude Craft**
**Framework-agnostic — works with any stack**
