---
name: architect
description: Architecture phase before TDD — define boundaries, contracts, and dependencies before writing any code
author: The Bearded CTO / Claude Craft
version: 1.0.0
tags: [architecture, design, tdd, planning, boundaries, contracts, dependencies]
category: design
license: MIT
repository: https://github.com/TheBeardedBearSAS/claude-craft
---

# Architect — Architecture Before TDD

**Rule of thumb:** If you can't draw the diagram, you can't code the feature.

## When to Use

| Situation | Architect phase? |
|-----------|-------------------|
| Bug in 1 file | ❌ No (go TDD direct) |
| New feature < 3 files | ⚠️ Short (10 min) |
| New feature > 3 files | ✅ Mandatory |
| New module/bounded context | ✅ Mandatory |
| External integration (API, queue, DB) | ✅ Mandatory |

## 5-Step Process

### 1. Identify Boundaries
Which boundaries does the feature cross?
- Domain boundaries (bounded contexts)
- Layer boundaries (Presentation / Application / Domain / Infrastructure)
- Process boundaries (sync HTTP / async queue / event-driven)
- Data boundaries (databases, tables, schemas)

### 2. Define Contracts
For each boundary, define the contract:
- **Inputs:** format, types, invariants, nullability
- **Outputs:** format, error codes, latency target
- **Side effects:** DB writes, events emitted, external calls
- **Idempotence:** is the contract idempotent?

### 3. Draw Dependencies
Who depends on what? In which direction?

Verify:
- [ ] No cycles (A → B → A)
- [ ] DIP respected (domain doesn't depend on infra)
- [ ] Max 3 call levels between entry and business logic

### 4. List Trade-offs
Document **why** each non-obvious choice:
- Decision made
- Alternative considered
- Reason for this choice

### 5. Define Architecture Tests
Before TDD on behavior, define architecture tests:
- Dependency tests (ArchUnit, Deptrac)
- Contract tests (OpenAPI validation)
- Performance targets (p99 latency, throughput)

## Deliverables

At the end of the Architect phase:
1. **Diagram** (dependencies, 1 page max)
2. **Contracts** (signatures + DTOs)
3. **Short ADR** (trade-offs)
4. **Architecture tests** list
5. **Atomic task breakdown**

Only **after** this phase, enter TDD (Red/Green/Refactor).

## Anti-patterns

| Anti-pattern | Solution |
|--------------|----------|
| Code directly without diagram | Draw FIRST, even 5 min is enough |
| Architect phase > 2h on simple feature | YAGNI — cut short |
| Vague contracts ("User object") | Strict types, all fields |
| Ignoring trade-offs | Short ADR mandatory |

---

**By The Bearded CTO / Claude Craft**
**Framework-agnostic — works with any stack**
