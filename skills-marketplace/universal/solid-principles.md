---
name: solid-principles
description: SOLID principles for clean object-oriented design — SRP, OCP, LSP, ISP, DIP
author: The Bearded CTO / Claude Craft
version: 1.0.0
tags: [solid, oop, clean-code, architecture, srp, ocp, lsp, isp, dip]
category: design
license: MIT
repository: https://github.com/TheBeardedCTO/claude-craft
---

# SOLID Principles — Clean OO Design

Universal SOLID principles for object-oriented code quality.

## The 5 Principles

| Principle | Rule | Verification |
|-----------|------|-------------|
| **S**RP | 1 class = 1 responsibility. Methods < 20 lines | Clear naming, no "and/or" |
| **O**CP | Extension via interfaces/Strategy, not modification | No switch/if on types |
| **L**SP | Subtypes substitutable for base types. No stronger preconditions | Contracts respected |
| **I**SP | Interfaces < 5 methods, segregated by client | No NotImplementedException |
| **D**IP | Depend on abstractions (interfaces in domain) | Injection via constructor |

## Single Responsibility Principle (SRP)

**Rule:** A class should have ONE reason to change.

```
❌ BAD: UserService handles auth + email + logging
✅ GOOD: AuthService, EmailService, Logger (3 classes)
```

### Verification

- Can you name the class responsibility in 1 sentence?
- Would 2 different people need to change this class for different reasons?

## Open/Closed Principle (OCP)

**Rule:** Open for extension, closed for modification.

```
❌ BAD: Add new if/switch for each payment type
✅ GOOD: PaymentStrategy interface + concrete implementations
```

### Verification

- Can you add a new variant without modifying existing code?
- Are you using Strategy, Factory, or Template Method patterns?

## Liskov Substitution Principle (LSP)

**Rule:** Subtypes must be substitutable for their base types.

```
❌ BAD: Square extends Rectangle but breaks area calculation
✅ GOOD: Square and Rectangle both implement Shape interface
```

### Verification

- Can you replace the base class with any subclass without breaking behavior?
- Are preconditions not stronger in subclasses?
- Are postconditions not weaker in subclasses?

## Interface Segregation Principle (ISP)

**Rule:** Clients shouldn't depend on methods they don't use.

```
❌ BAD: IUser with save(), delete(), sendEmail(), generateReport()
✅ GOOD: IRepository, IEmailSender, IReportGenerator (3 interfaces)
```

### Verification

- Is the interface < 5 methods?
- Are all clients using all methods?
- Can you split the interface by client type?

## Dependency Inversion Principle (DIP)

**Rule:** Depend on abstractions, not implementations.

```
❌ BAD: UserService depends on PostgresRepository
✅ GOOD: UserService depends on IUserRepository (interface)
```

### Verification

- Are dependencies injected via constructor?
- Do interfaces live in the domain layer (not infra)?
- Is the dependency graph pointing inward (domain at center)?

## Layered Architecture (DIP)

```
Presentation → Application → Domain ← Infrastructure
                                ↑
                          (interfaces here)
```

**Rule:** Domain defines interfaces. Infrastructure implements them.

## Checklist

- [ ] Each class has a single responsibility
- [ ] New features via extension, not modification
- [ ] Interfaces small and focused
- [ ] Use cases depend on interfaces, not implementations
- [ ] Dependency graph points inward

---

**By The Bearded CTO / Claude Craft**
**Framework-agnostic — works with any stack**
