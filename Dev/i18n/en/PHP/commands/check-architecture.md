---
description: PHP Architecture Validation
argument-hint: [arguments]
---

# PHP Architecture Validation

## Arguments

$ARGUMENTS (optional: path to PHP project to audit, defaults to current directory)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

You are an expert PHP software architect. Audit the architecture of a native PHP project (no framework) against Clean Architecture, Hexagonal Architecture, DDD tactical patterns, and PSR-4 autoloading rules.

**Reference rules**: `.claude/rules/php-architecture.md`

### Step 1: Project Structure Analysis

1. Identify project root (use $ARGUMENTS or current directory)
2. Read `composer.json` — verify PHP version (≥ 8.4, ideally 8.5) and PSR-4 autoload mapping
3. Map the `src/` directory structure and expected layers
4. List all top-level namespaces

**Expected structure** (native PHP):

```
src/
├── Domain/              # Pure business logic (Entities, Value Objects, Domain Events)
│   ├── Entity/
│   ├── ValueObject/
│   ├── Event/
│   └── Exception/
├── Application/         # Use Cases / Commands / Queries, orchestration
│   ├── UseCase/
│   ├── DTO/
│   └── Port/            # Interfaces consumed by Application
└── Infrastructure/      # Adapters (DB, HTTP, filesystem, external APIs)
    ├── Persistence/
    ├── Http/
    └── Adapter/
tests/
├── Unit/
├── Integration/
└── Fixtures/
```

### Step 2: Layer Separation Check (6 pts)

- [ ] Domain layer has **zero** dependencies on Application or Infrastructure
- [ ] Application layer depends **only** on Domain abstractions (interfaces/ports)
- [ ] Infrastructure implements Domain/Application ports, never the reverse
- [ ] No framework-specific code leaks into Domain
- [ ] `declare(strict_types=1);` at the top of every file

**Detection command**:

```bash
docker compose exec app grep -rn "use.*Infrastructure" src/Domain/ src/Application/
# Expected: no match
```

### Step 3: Ports and Adapters (5 pts)

- [ ] Inbound ports (interfaces) defined in `Application/Port/In/` or similar
- [ ] Outbound ports defined in `Application/Port/Out/` or `Domain/Port/`
- [ ] Adapters in `Infrastructure/` implement those ports
- [ ] Dependency Injection via constructor (no service locator, no static state)

### Step 4: Domain Modeling (5 pts)

- [ ] Entities have identity and invariants enforced in constructors / named constructors
- [ ] Value Objects are immutable (`readonly` classes PHP 8.2+, or readonly properties)
- [ ] Aggregates encapsulate invariants; external mutation impossible
- [ ] Domain events raised for relevant state changes
- [ ] Exceptions are domain-specific (extend a base `DomainException`)

### Step 5: Use Cases (4 pts)

- [ ] One use case = one class with a single public method (`execute()`, `handle()`, or `__invoke()`)
- [ ] Input as a dedicated DTO / Command / Query object
- [ ] Output as a return DTO or void (for commands)
- [ ] Transactional boundaries handled at Application level, not Domain

### Step 6: PSR-4 & Dependency Rules (3 pts)

- [ ] `composer.json` autoload is PSR-4 compliant
- [ ] Namespace matches directory structure exactly
- [ ] No circular dependencies (`deptrac` or `phparkitect` to verify)
- [ ] Coupling between modules is explicit and documented

**Detection command**:

```bash
docker compose exec app composer dump-autoload --strict-psr
docker compose exec app vendor/bin/deptrac analyse --fail-on-uncovered
```

### Step 7: Alternative Patterns (2 pts)

Accept pragmatic alternatives when justified:

| Pattern | When acceptable |
|---|---|
| **Vertical Slice Architecture** | Small app, CRUD-heavy, no cross-feature reuse |
| **Modular Monolith** | Multiple bounded contexts inside one deployable |
| **Simple layered** | Domain is trivial — don't over-engineer |

Flag over-engineering (empty abstractions, excessive DTO mapping) as an issue.

## OUTPUT FORMAT

```
PHP ARCHITECTURE AUDIT
======================

SCORE: XX/25

LAYER SEPARATION (X/6)
  Strengths:
  - [...]
  Issues:
  - [file:line] description

PORTS & ADAPTERS (X/5)
  [...]

DOMAIN MODELING (X/5)
  [...]

USE CASES (X/4)
  [...]

PSR-4 & DEPENDENCY RULES (X/3)
  [...]

PATTERN FITNESS (X/2)
  [...]

TOP 3 ACTIONS:
1. [CRITICAL] Description
   Files: src/...
   Effort: Low/Medium/High
2. [...]
3. [...]

RECOMMENDED PATTERN: [Clean / Hexagonal / VSA / Modular Monolith]
```

## IMPORTANT NOTES

- Use Docker for all analysis tools (`composer`, `deptrac`, `phparkitect`)
- Cite concrete `file:line` references for every issue
- Don't impose Clean Architecture if the domain is trivial — favor pragmatism
- Flag framework leaks immediately (a native PHP project must not depend on Symfony/Laravel classes)
