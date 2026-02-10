# KISS, DRY, YAGNI Principles

## Overview

The **KISS** (Keep It Simple, Stupid), **DRY** (Don't Repeat Yourself), and **YAGNI** (You Aren't Gonna Need It) principles are **mandatory** to maintain simple, maintainable, and scalable code.

> **References:**
> - `04-solid-principles.md` - Complementary SOLID principles

---

## Table of Contents

1. [KISS - Keep It Simple, Stupid](#kiss---keep-it-simple-stupid)
2. [DRY - Don't Repeat Yourself](#dry---dont-repeat-yourself)
3. [YAGNI - You Aren't Gonna Need It](#yagni---you-arent-gonna-need-it)
4. [Common Anti-Patterns](#common-anti-patterns)
5. [Validation Checklist](#validation-checklist)

---

## KISS - Keep It Simple, Stupid

### Definition

**Simplicity should be a key design goal. Complexity must be avoided.**

The simplest code is often the best code.

### KISS Rules

1. **Short methods:** Maximum 20 lines per method
2. **Cyclomatic complexity:** Maximum 10 per method
3. **Indentation depth:** Maximum 3 levels
4. **Parameters:** Maximum 4 parameters per method
5. **Classes:** Maximum 200 lines per class

### Signs of Violation

- Methods longer than 20 lines
- Deep nesting levels (> 3)
- Comments explaining what the code does
- Difficulty naming a function (does too many things)
- Complex tests with a lot of setup

### Application

```
BAD - Complex code
+---------------------------------------------+
| calculatePrice(order):                      |
|   total = 0                                 |
|   for item in order.items:                  |
|     price = item.basePrice                  |
|     if item.category == "food":             |
|       if item.isOrganic:                    |
|         if item.weight > 1:                 |
|           price = price * 0.9               |
|         else:                               |
|           price = price * 0.95              |
|       else:                                 |
|         // ... 50 more lines                |
|     // ... even more conditions             |
|   return total                              |
+---------------------------------------------+

GOOD - Decomposed and simple code
+---------------------------------------------+
| PricingService:                             |
|   calculateTotal(order):                    |
|     return sum(                             |
|       calculateItemPrice(item)              |
|       for item in order.items               |
|     )                                       |
|                                             |
| ItemPriceCalculator:                        |
|   calculate(item):                          |
|     basePrice = item.basePrice              |
|     return applyDiscounts(basePrice, item)  |
|                                             |
| DiscountPolicy:                             |
|   apply(price, item): Money                 |
+---------------------------------------------+
```

### Simplicity Rules

1. **Single return per method** (except early returns for validation)
2. **No else** when possible (early returns, guard clauses)
3. **Explicit naming** (no need for comments)
4. **Composition > Inheritance**
5. **Immutability by default**

### Early Returns (Guard Clauses)

```
BAD - Nested else
function process(user):
  if user != null:
    if user.isActive:
      if user.hasPermission:
        // business logic
      else:
        throw NoPermission
    else:
      throw Inactive
  else:
    throw NotFound

GOOD - Early returns
function process(user):
  if user == null:
    throw NotFound

  if not user.isActive:
    throw Inactive

  if not user.hasPermission:
    throw NoPermission

  // business logic (no indentation)
```

---

## DRY - Don't Repeat Yourself

### Definition

**Every piece of knowledge must have a single, unambiguous, authoritative representation in the system.**

Do not duplicate business logic, validation rules, or algorithms.

### Types of Duplication to Avoid

| Type | Description | Solution |
|------|-------------|----------|
| **Logic** | Same code in multiple places | Extract into a function/class |
| **Knowledge** | Same business rules redefined | Value Objects, Domain Services |
| **Structural** | Same patterns repeated | Abstractions, Templates |
| **Documentation** | Same info in multiple formats | Single Source of Truth |

### Application

```
BAD - Duplicated validation
+---------------------------------------------+
| // In the Controller                        |
| if not isValidEmail(email):                 |
|   throw InvalidEmail                        |
|                                             |
| // In the Form                              |
| emailField.addConstraint(EmailConstraint)   |
|                                             |
| // In the Entity                            |
| @Assert.Email                               |
| email: string                               |
|                                             |
| // 3 places with the same rule!             |
+---------------------------------------------+

GOOD - Centralized validation (Value Object)
+---------------------------------------------+
| class Email:                                |
|   constructor(value):                       |
|     if not isValidEmail(value):             |
|       throw InvalidEmail(value)             |
|     this.value = value                      |
|                                             |
| // Used everywhere:                         |
| // - Entity: email: Email                   |
| // - Form: transforms to Email              |
| // - Controller: receives Email             |
|                                             |
| // ONE single source of truth!              |
+---------------------------------------------+
```

### Rule of Three

> **Do not abstract before seeing the pattern 3 times.**

```
// Seen 1 time -> copy
// Seen 2 times -> note
// Seen 3 times -> abstract
```

### DRY vs WET (Write Everything Twice)

**Acceptable duplication:**
- Similar structure but different types (type safety)
- Test code (clarity > DRY)
- Per-environment configuration

**Duplication to avoid:**
- Business rules
- Validation
- Algorithms
- Calculations

---

## YAGNI - You Aren't Gonna Need It

### Definition

**Do not implement a feature until it is needed.**

Do not code for hypothetical future needs.

### Signs of Violation

- "Just in case" code
- Premature abstractions
- Unrequested features
- Support for cases that do not yet exist
- Over-engineering

### Application

```
BAD - Over-engineering
+---------------------------------------------+
| ExportService:                              |
|   export(data, format):                     |
|     if format == "csv":                     |
|       // implemented                        |
|     if format == "xml":                     |
|       // implemented (not requested)        |
|     if format == "json":                    |
|       // implemented (not requested)        |
|     if format == "pdf":                     |
|       // implemented (not requested)        |
|     if format == "xlsx":                    |
|       // implemented (not requested)        |
|                                             |
| // Only CSV is required!                    |
+---------------------------------------------+

GOOD - Only what is needed
+---------------------------------------------+
| CsvExporter:                                |
|   export(data, filename):                   |
|     // Implements ONLY CSV                  |
|     // (the only required format)           |
|                                             |
| // If needed in the future: new class       |
| // Without modifying the existing one (OCP) |
+---------------------------------------------+
```

### YAGNI Checklist

Before adding a feature, ask yourself:

- [ ] **Is it required NOW?** (in the current ticket)
- [ ] **Is it tested?** (existing test that fails)
- [ ] **Is it in the MVP?** (defined scope)
- [ ] **Has the client explicitly requested it?**

If **NO** to any of these questions -> **YAGNI: Do not implement**

### YAGNI vs Extensibility

**Good balance:** Simple code BUT extensible

```
GOOD - Simple interface, extensible if needed
+---------------------------------------------+
| interface ExportPolicy:                     |
|   export(data): bytes                       |
|                                             |
| class CsvExporter implements ExportPolicy:  |
|   export(data): bytes                       |
|     // CSV implementation                   |
|                                             |
| // If needed in the future: PdfExporter     |
| // Without modifying CsvExporter (OCP)      |
+---------------------------------------------+
```

---

## Common Anti-Patterns

### 1. Premature Optimization

```
BAD
// Complex cache before even having a perf problem
class Repository:
  cache = {}
  cacheTimestamps = {}
  CACHE_TTL = 300

  find(id):
    if id in cache and not expired(id):
      return cache[id]
    // ... unnecessary complexity

GOOD
// Simple implementation first
class Repository:
  find(id):
    return database.find(id)

// Cache added ONLY if profiling shows a problem
```

### 2. Gold Plating

```
BAD - Unrequested features
class Notifier:
  sendEmail()      // Required
  sendSms()        // Not requested
  sendPush()       // Not requested
  sendWhatsApp()   // Not requested

GOOD - Only what is needed
class EmailNotifier:
  send()  // Only email (required)
```

### 3. Speculative Generality

```
BAD - Generic internal framework
abstract class AbstractEntityManager
  abstract getEntityClass()
  findAll()
  findById()
  save()
  delete()
  // ... 50 generic methods

class UserManager extends AbstractEntityManager
  // ... for ONE use case

GOOD - Use existing tools
class UserRepository:
  find(id): User
    return orm.find(User, id)
```

### 4. Lasagna Code

```
BAD - Too many layers
interface FinderInterface
interface SearchInterface extends FinderInterface
interface QueryInterface extends SearchInterface
abstract class AbstractFinder implements QueryInterface
class BaseFinder extends AbstractFinder
class ConcreteFinder extends BaseFinder
// Just to do: finder.find(id)

GOOD - Only justified layers
interface RepositoryInterface    // Domain
class ConcreteRepository         // Infrastructure
// 2 layers are enough
```

---

## Validation Checklist

### Before each commit

#### KISS
- [ ] Methods < 20 lines
- [ ] Cyclomatic complexity < 10
- [ ] Max 3 indentation levels
- [ ] Max 4 parameters per method
- [ ] No nested else (early returns)
- [ ] Explicit naming (no comments needed)

#### DRY
- [ ] No duplicated code (> 3 identical lines)
- [ ] Centralized validation (Value Objects)
- [ ] Business rules in one place
- [ ] No knowledge duplication

#### YAGNI
- [ ] Feature explicitly requested
- [ ] Failing test exists
- [ ] Within the scope of the current ticket
- [ ] No "just in case" code
- [ ] No premature abstraction

### Target Metrics

| Metric | Target | Limit |
|--------|--------|-------|
| Lines per method | < 10 | < 20 |
| Cyclomatic complexity | < 5 | < 10 |
| Lines per class | < 150 | < 200 |
| Duplication | 0% | < 3% |
| Test coverage | > 80% | > 70% |
| Dependencies per class | < 5 | < 7 |

---

## Resources

- **Book:** *The Pragmatic Programmer* - Andy Hunt & Dave Thomas
- **Book:** *Clean Code* - Robert C. Martin
- **Article:** [KISS Principle](https://en.wikipedia.org/wiki/KISS_principle)
- **Article:** [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- **Article:** [YAGNI](https://martinfowler.com/bliki/Yagni.html)

---

**Last updated:** 2025-01
**Version:** 1.0.0
**Author:** The Bearded CTO
