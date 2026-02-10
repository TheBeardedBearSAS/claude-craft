# SOLID Principles

## Overview

The SOLID principles are **mandatory** for all project code. These principles ensure maintainable, testable, and scalable code.

> **Note:** This document presents the general principles. Refer to the rules specific to your technology for concrete examples.

---

## Table of Contents

1. [SRP - Single Responsibility Principle](#srp---single-responsibility-principle)
2. [OCP - Open/Closed Principle](#ocp---openclosed-principle)
3. [LSP - Liskov Substitution Principle](#lsp---liskov-substitution-principle)
4. [ISP - Interface Segregation Principle](#isp---interface-segregation-principle)
5. [DIP - Dependency Inversion Principle](#dip---dependency-inversion-principle)
6. [Validation Checklist](#validation-checklist)

---

## SRP - Single Responsibility Principle

### Definition

**A class should have only one reason to change.**

Each class, method, or module must have a single, well-defined responsibility.

### Signs of Violation

- Class with "and" or "or" in the name
- Method that does multiple unrelated things
- Class that is difficult to name clearly
- Complex tests requiring many mocks

### Application

```
BAD - Multiple responsibilities
+-------------------------------------+
| OrderService                        |
+-------------------------------------+
| - validateOrder()                   |
| - calculatePrice()                  |
| - saveToDatabase()                  |
| - sendEmail()                       |
| - generatePDF()                     |
+-------------------------------------+

GOOD - Separated responsibilities
+-----------------+  +-----------------+
| OrderValidator  |  | PricingService  |
+-----------------+  +-----------------+
| - validate()    |  | - calculate()   |
+-----------------+  +-----------------+

+-----------------+  +-----------------+
| OrderRepository |  | EmailNotifier   |
+-----------------+  +-----------------+
| - save()        |  | - notify()      |
+-----------------+  +-----------------+
```

### Benefits

- **Testability:** Each class can be tested in isolation
- **Maintainability:** Changes are localized
- **Reusability:** Components are independent
- **Readability:** Each class has a clear purpose

---

## OCP - Open/Closed Principle

### Definition

**Software entities should be open for extension but closed for modification.**

You should be able to add new features without modifying existing code.

### Signs of Violation

- Switch/case on types to determine behavior
- Frequent modifications to the same class
- Adding a feature requires modifying existing code

### Application

```
BAD - Modifying existing code
+-------------------------------------+
| DiscountCalculator                  |
+-------------------------------------+
| calculate(type):                    |
|   if type == "family":              |
|     return basePrice * 0.9          |
|   if type == "student":             |
|     return basePrice * 0.8          |
|   // To add "senior" ->             |
|   // must modify this class         |
+-------------------------------------+

GOOD - Extension via interfaces
+-------------------------------------+
| <<interface>>                       |
| DiscountPolicy                      |
+-------------------------------------+
| + apply(price): Money               |
| + isApplicable(order): boolean      |
+-------------------------------------+
         ^
         |
    +----+----+------------+
    |         |            |
+-------+ +-------+ +-------------+
|Family | |Student| |SeniorPolicy |
|Policy | |Policy | |(new)        |
+-------+ +-------+ +-------------+
```

### Strategy Pattern

Use the Strategy pattern to allow extension:

1. Define an interface for the variable behavior
2. Implement each variant in a separate class
3. Inject implementations via configuration

### Benefits

- **Easy extension:** New features = new classes
- **Stability:** Existing code is not modified
- **Tests:** No regressions on existing code
- **Scalability:** Adding features without risk

---

## LSP - Liskov Substitution Principle

### Definition

**Objects of a derived class must be able to replace objects of the base class without altering the program's correctness.**

Subtypes must be substitutable for their base types.

### Signs of Violation

- Subclass that throws undocumented exceptions
- Method that checks the concrete type before acting
- Override that changes the expected behavior
- Strengthened preconditions or weakened postconditions

### Rules

1. **Preconditions:** Do not strengthen (accept at least as much)
2. **Postconditions:** Do not weaken (guarantee at least as much)
3. **Invariants:** Maintain parent invariants
4. **History constraint:** Do not modify state in an incompatible manner

### Application

```
BAD - Contract violation
+-------------------------------------+
| class Rectangle                     |
+-------------------------------------+
| - width, height                     |
| + setWidth(w)                       |
| + setHeight(h)                      |
| + area() = width * height           |
+-------------------------------------+
         ^
         |
+-------------------------------------+
| class Square extends Rectangle     |
+-------------------------------------+
| + setWidth(w):                      |
|     this.width = w                  |
|     this.height = w  // Violates LSP|
+-------------------------------------+

GOOD - Contracts respected
+-------------------------------------+
| <<interface>> Shape                 |
+-------------------------------------+
| + area(): number                    |
+-------------------------------------+
         ^
    +----+----+
    |         |
+-------+ +-------+
|Rect.  | |Square |
|w*h    | |side^2 |
+-------+ +-------+
```

### Benefits

- **Safe polymorphism:** Substitutions always work
- **Clear contracts:** Well-documented interfaces
- **Predictability:** No surprises with subtypes
- **Testability:** Mocks respect contracts

---

## ISP - Interface Segregation Principle

### Definition

**Clients should not depend on interfaces they do not use.**

Multiple specific interfaces are better than one general interface.

### Signs of Violation

- Interface with many methods (> 5)
- Classes that implement empty methods
- Methods that throw `NotImplementedException`
- Clients that use only part of the interface

### Application

```
BAD - Interface too broad
+-------------------------------------+
| <<interface>>                       |
| UserRepository                      |
+-------------------------------------+
| + find(id)                          |
| + findAll()                         |
| + save(user)                        |
| + delete(user)                      |
| + findByEmail(email)                |
| + findByRole(role)                  |
| + countByMonth(month)               |
| + exportToCsv()                     |
| + importFromCsv()                   |
| + syncWithLDAP()                    |
+-------------------------------------+

GOOD - Segregated interfaces
+-----------------+  +-----------------+
| UserFinder      |  | UserPersister   |
+-----------------+  +-----------------+
| + find(id)      |  | + save(user)    |
| + findAll()     |  | + delete(user)  |
+-----------------+  +-----------------+

+-----------------+  +-----------------+
| UserSearcher    |  | UserExporter    |
+-----------------+  +-----------------+
| + byEmail()     |  | + toCsv()       |
| + byRole()      |  | + fromCsv()     |
+-----------------+  +-----------------+
```

### Benefits

- **Low coupling:** Clients depend only on what they need
- **Flexibility:** Partial implementations are possible
- **Testability:** Simpler mocks (fewer methods)
- **Scalability:** Adding interfaces without impacting existing ones

---

## DIP - Dependency Inversion Principle

### Definition

**High-level modules should not depend on low-level modules. Both should depend on abstractions.**

**Abstractions should not depend on details. Details should depend on abstractions.**

### Signs of Violation

- Direct instantiation of dependencies (`new ConcreteClass()`)
- Import of infrastructure classes in the business layer
- Tight coupling with a framework or library
- Tests that are difficult to write without a real database

### Application

```
BAD - Depending on implementations
+-------------------------------------+
| OrderService                        |
+-------------------------------------+
| - MySQLOrderRepository              |
| - SmtpMailer                        |
| - StripePaymentGateway              |
+-------------------------------------+
     |
     v Depends on
+-------------------------------------+
| Concrete infrastructure             |
+-------------------------------------+

GOOD - Depending on abstractions
+-------------------------------------+
| OrderService (Application Layer)    |
+-------------------------------------+
| - OrderRepositoryInterface          |
| - MailerInterface                   |
| - PaymentGatewayInterface           |
+-------------------------------------+
     |
     v Depends on
+-------------------------------------+
| Interfaces (Domain Layer)           |
+-------------------------------------+
     ^
     | Implemented by
+-------------------------------------+
| MySQL, Smtp, Stripe (Infra Layer)   |
+-------------------------------------+
```

### Layered Architecture

```
+---------------------------------------------+
|         PRESENTATION (UI/API)               |
|   Controllers, Commands, Forms              |
+---------------------------------------------+
|         APPLICATION (Use Cases)             |
|   Services orchestrating the logic          |
|               |                             |
|       Depends on (Interfaces)               |
+---------------------------------------------+
|            DOMAIN (Business)                |
|   Entities, Value Objects, Interfaces       |
|               ^                             |
|       Implemented by (Inversion)            |
+---------------------------------------------+
|       INFRASTRUCTURE (Technical)            |
|   Repositories, Mailers, Gateways           |
+---------------------------------------------+

High-level layers depend on abstractions
Low-level layers implement those abstractions
Business logic is isolated from technical details
```

### Benefits

- **Testability:** Mocks and stubs are easy to create
- **Flexibility:** Changing implementation without impact
- **Isolation:** Business logic does not depend on infrastructure
- **Reusability:** Abstractions are reusable

---

## Validation Checklist

### Before each commit

#### SRP
- [ ] Each class has a single, clearly defined responsibility
- [ ] Methods do one thing (< 20 lines)
- [ ] No methods with "and" or "or" in the name

#### OCP
- [ ] New features added by extension, not modification
- [ ] Use of interfaces and Strategy patterns
- [ ] No switch/if on types to determine behavior

#### LSP
- [ ] Subtypes respect the contracts of their parents
- [ ] No strengthened preconditions in subclasses
- [ ] No weakened postconditions in subclasses
- [ ] No new undocumented exceptions

#### ISP
- [ ] Interfaces are small and focused (< 5 methods)
- [ ] Clients depend only on the methods they use
- [ ] No `throw NotImplementedException()` methods

#### DIP
- [ ] Use cases depend on interfaces, not implementations
- [ ] Interfaces are in the domain, not infrastructure
- [ ] Dependency injection via constructor

---

## Resources

- **Book:** *Clean Architecture* - Robert C. Martin
- **Book:** *SOLID Principles* - Uncle Bob
- **Video:** [SOLID Principles Explained](https://www.youtube.com/watch?v=pTB30aXS77U)

---

**Last updated:** 2025-01
**Version:** 1.0.0
**Author:** The Bearded CTO
