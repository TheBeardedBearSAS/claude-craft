---
description: Verify C#/.NET project compliance with Clean Architecture and coding standards
model: haiku

---

# C#/.NET Compliance Check

You are a C#/.NET compliance expert. Analyze the project to verify adherence to Clean Architecture principles and modern .NET best practices.

## Analysis Scope

### 1. Architecture Compliance

Check layer separation and dependencies:

```
Expected Structure:
src/
├── Domain/           → NO external dependencies
├── Application/      → Only depends on Domain
├── Infrastructure/   → Implements Domain/Application interfaces
└── WebAPI/          → Presentation layer

Dependency Rule: Dependencies MUST flow inward only
```

**Verify:**
- [ ] Domain has no references to Infrastructure or Application
- [ ] Application only references Domain
- [ ] Infrastructure implements interfaces from Domain/Application
- [ ] No circular dependencies between projects

### 2. Clean Architecture Patterns

**Domain Layer:**
- [ ] Entities have private setters
- [ ] Value Objects are immutable
- [ ] Aggregate roots are identified
- [ ] Domain events are used for side effects
- [ ] Repository interfaces defined in Domain

**Application Layer:**
- [ ] CQRS pattern implemented (Commands/Queries)
- [ ] MediatR used for decoupling
- [ ] FluentValidation for input validation
- [ ] DTOs used for data transfer
- [ ] No direct entity exposure to API

**Infrastructure Layer:**
- [ ] EF Core configurations in separate files
- [ ] Repository pattern implementations
- [ ] External service implementations

### 3. Modern C# Features

**Check usage of:**
- [ ] File-scoped namespaces
- [ ] Primary constructors (where appropriate)
- [ ] Records for DTOs
- [ ] Pattern matching
- [ ] Nullable reference types enabled
- [ ] Collection expressions (C# 12)

### 4. Coding Standards

**Naming Conventions:**
- [ ] PascalCase for public members
- [ ] _camelCase for private fields
- [ ] Async suffix on async methods
- [ ] I prefix for interfaces

**Code Quality:**
- [ ] No unused using directives
- [ ] No empty catch blocks
- [ ] Proper async/await usage (no .Result or .Wait())
- [ ] CancellationToken passed to async methods

## Output Format

```
══════════════════════════════════════════════════════════════
C#/.NET COMPLIANCE REPORT
══════════════════════════════════════════════════════════════

Project: {ProjectName}
Framework: .NET {Version}
Analysis Date: {Date}

──────────────────────────────────────────────────────────────
ARCHITECTURE COMPLIANCE
──────────────────────────────────────────────────────────────

Layer Separation:
[✓] Domain has no external dependencies
[✓] Application only references Domain
[✗] Infrastructure references Application directly
    → Issue: OrderRepository.cs:15 - direct DbContext usage

Dependency Flow:
[✓] No circular dependencies detected

Score: 75/100

──────────────────────────────────────────────────────────────
CLEAN ARCHITECTURE PATTERNS
──────────────────────────────────────────────────────────────

Domain Layer:
[✓] Entities use private setters
[✓] Value Objects are immutable
[✗] Missing aggregate root markers
    → Order.cs should implement IAggregateRoot

Application Layer:
[✓] CQRS pattern implemented
[✓] MediatR configured
[✗] Validation missing on CreateOrderCommand
    → Add CreateOrderCommandValidator

Score: 80/100

──────────────────────────────────────────────────────────────
MODERN C# FEATURES
──────────────────────────────────────────────────────────────

[✓] File-scoped namespaces used
[✓] Nullable reference types enabled
[✗] Records not used for DTOs
    → OrderDto.cs - consider converting to record
[✗] Pattern matching underutilized
    → OrderService.cs:45 - use switch expression

Score: 70/100

──────────────────────────────────────────────────────────────
CODING STANDARDS
──────────────────────────────────────────────────────────────

Naming:
[✓] PascalCase for public members
[✓] Private fields use _camelCase prefix
[✗] Async method missing Async suffix
    → OrderService.cs: GetOrder → GetOrderAsync

Code Quality:
[✓] No empty catch blocks
[✗] Blocking call detected
    → Program.cs:23 - Replace .Result with await

Score: 85/100

══════════════════════════════════════════════════════════════
OVERALL COMPLIANCE SCORE: 77/100
══════════════════════════════════════════════════════════════

Priority Fixes:
1. [HIGH] Remove blocking calls (.Result/.Wait())
2. [HIGH] Add missing validators
3. [MEDIUM] Convert DTOs to records
4. [MEDIUM] Mark aggregate roots with IAggregateRoot
5. [LOW] Rename async methods with Async suffix
```

## Scoring Criteria

| Category | Weight | Criteria |
|----------|--------|----------|
| Architecture | 30% | Layer separation, dependency flow |
| Clean Architecture | 25% | CQRS, DDD patterns, validation |
| Modern C# | 20% | Latest language features |
| Coding Standards | 25% | Naming, async patterns, quality |

## Actions

After analysis:
1. List all compliance issues found
2. Prioritize by severity (HIGH/MEDIUM/LOW)
3. Provide specific fix recommendations with code examples
4. Calculate overall compliance score
