# Testing - TDD/BDD Principles

## Overview

**Test-Driven Development (TDD)** and **Behavior-Driven Development (BDD)** are **mandatory** practices to ensure code quality and maintainability.

> **Note:** This document presents the general principles. Refer to the rules specific to your technology for concrete tools and frameworks.

**Objectives:**
- Code coverage >= 80%
- Fast tests (< 10s for unit tests)
- Independent and reproducible tests
- CI/CD blocks if tests fail

---

## Table of Contents

1. [Test Pyramid](#test-pyramid)
2. [TDD - Test-Driven Development](#tdd---test-driven-development)
3. [BDD - Behavior-Driven Development](#bdd---behavior-driven-development)
4. [Types of Tests](#types-of-tests)
5. [Best Practices](#best-practices)
6. [Anti-Patterns](#anti-patterns)
7. [Checklist](#checklist)

---

## Test Pyramid

```
          +-------------+
          |    E2E      |  <- Few (10%)
          |  (UI/API)   |    Slow, fragile
          +-------------+
          | Integration |  <- Moderate (20%)
          |   Tests     |    Verify connections
          +-------------+
          |   Unit      |  <- Many (70%)
          |   Tests     |    Fast, isolated
          +-------------+

The higher up, the slower and more expensive.
The lower down, the faster and more reliable.
```

### Recommended Distribution

| Type | % | Time | When |
|------|---|------|------|
| Unit | 70% | < 1s each | On every commit |
| Integration | 20% | < 5s each | On every PR |
| E2E | 10% | < 30s each | Before deploy |

---

## TDD - Test-Driven Development

### The Red-Green-Refactor Cycle

```
     +-------------------------------------+
     |                                     |
     v                                     |
+---------+    +---------+    +----------+|
|   RED   |--->|  GREEN  |--->| REFACTOR ||
|  Test   |    |  Code   |    | Improve  ||
|  fails  |    |  passes |    |          ||
+---------+    +---------+    +----------+|
                                   |      |
                                   +------+
```

### Steps

1. **RED** - Write a failing test
   - Define the expected behavior
   - The test MUST fail (otherwise it tests nothing)

2. **GREEN** - Write the minimum code to pass
   - Simplest code possible
   - No optimization
   - No generalization

3. **REFACTOR** - Improve the code
   - Remove duplication
   - Improve readability
   - Tests must still pass

### TDD Example

```
// 1. RED - Failing test
test "calculateTotal returns sum of item prices":
  cart = new Cart()
  cart.addItem(Item(price: 10))
  cart.addItem(Item(price: 20))

  assert cart.calculateTotal() == 30
  // FAIL: method calculateTotal() not defined

// 2. GREEN - Minimal code
class Cart:
  items = []

  addItem(item):
    items.add(item)

  calculateTotal():
    return items.sum(item => item.price)
  // PASS

// 3. REFACTOR - Improve
class Cart:
  items: List<Item> = []

  addItem(item: Item): void
    items.add(item)

  calculateTotal(): Money
    return Money.sum(items.map(i => i.price))
  // PASS (improved with types)
```

### TDD Rules

1. **One test at a time**
2. **The test defines the behavior** (not the implementation)
3. **Minimal code to pass**
4. **Refactor after each GREEN**
5. **Never ignore a failing test**

---

## BDD - Behavior-Driven Development

### Gherkin Format

```gherkin
Feature: Shopping Cart
  As a customer
  I want to manage items in my cart
  So that I can purchase them

  Scenario: Add item to cart
    Given I have an empty cart
    When I add a product priced at 29.99
    Then my cart should contain 1 item
    And the cart total should be 29.99

  Scenario: Apply discount code
    Given I have a cart with items totaling 100
    When I apply discount code "SAVE10"
    Then the cart total should be 90
```

### Given-When-Then Structure

| Keyword | Purpose | Example |
|---------|---------|---------|
| **Given** | Initial context | "Given I am logged in" |
| **When** | Action | "When I click submit" |
| **Then** | Expected result | "Then I see success message" |
| **And** | Continuation | "And I receive an email" |
| **But** | Exception | "But I don't see errors" |

### BDD Benefits

- Living documentation
- Common language (dev + business)
- Tests readable by non-technical people
- Focus on behavior, not implementation

---

## Types of Tests

### Unit Tests

**Purpose:** Test a unit of code in isolation

```
test "Money can be added":
  a = Money(10, "EUR")
  b = Money(5, "EUR")

  result = a.add(b)

  assert result.amount == 15
  assert result.currency == "EUR"
```

**Characteristics:**
- Fast (< 1s)
- Isolated (no external dependencies)
- Deterministic (same result every time)
- Independent (execution order does not matter)

### Integration Tests

**Purpose:** Test the interaction between components

```
test "UserRepository saves and retrieves user":
  repo = UserRepository(database)
  user = User(name: "John")

  repo.save(user)
  retrieved = repo.findByName("John")

  assert retrieved.name == "John"
```

**Characteristics:**
- Test connections (DB, API, files)
- Use real dependencies or testcontainers
- Slower than unit tests

### End-to-End (E2E) Tests

**Purpose:** Test the complete system from the user's perspective

```
test "User can complete purchase":
  browser.goto("/products")
  browser.click("#add-to-cart")
  browser.click("#checkout")
  browser.fill("#email", "test@example.com")
  browser.click("#submit")

  assert browser.text("#confirmation") contains "Order confirmed"
```

**Characteristics:**
- Test the complete user journey
- Slow and fragile
- Use sparingly

### Contract Tests

**Purpose:** Verify contracts between services

```
test "API returns valid user schema":
  response = api.get("/users/1")

  assert response.status == 200
  assert response.body matches UserSchema
```

---

## Best Practices

### 1. Arrange-Act-Assert (AAA)

```
test "user can change email":
  // Arrange - Prepare
  user = User(email: "old@test.com")

  // Act - Execute
  user.changeEmail("new@test.com")

  // Assert - Verify
  assert user.email == "new@test.com"
```

### 2. One assert per test (preferred)

```
// BAD - Multiple unrelated assertions
test "user is valid":
  assert user.email is valid
  assert user.password is strong
  assert user.age > 18

// GOOD - Separate tests
test "user email is valid": ...
test "user password is strong": ...
test "user is adult": ...
```

### 3. Explicit naming

```
// BAD - Vague names
test "test1": ...
test "user test": ...
test "it works": ...

// GOOD - Descriptive names
test "calculateTotal returns zero for empty cart": ...
test "login fails with invalid credentials": ...
test "email is sent after order confirmation": ...
```

### 4. Independent tests

```
// BAD - Dependent tests
test "create user": ...      // Creates user
test "update user": ...      // Uses user from previous test
test "delete user": ...      // Uses user from previous test

// GOOD - Independent tests
test "create user":
  user = createUser()
  assert user.exists

test "update user":
  user = createUser()        // Each test creates its own data
  user.update(name: "New")
  assert user.name == "New"
```

### 5. Use fixtures/factories

```
// BAD - Repeated manual creation
test "test 1":
  user = User(
    name: "John",
    email: "john@test.com",
    password: "hash123",
    role: "admin",
    // ... 10 more fields
  )

// GOOD - Factory
test "test 1":
  user = UserFactory.create(role: "admin")
```

---

## Anti-Patterns

### 1. Tests that test the implementation

```
// BAD - Tests HOW (implementation)
test "save calls repository.insert":
  mock = mock(Repository)
  service.save(user)
  verify mock.insert was called once

// GOOD - Tests WHAT (behavior)
test "user is persisted":
  service.save(user)
  assert repository.findById(user.id) exists
```

### 2. Tests that are too coupled

```
// BAD - Test knows too many internal details
test "process order":
  order.process()
  assert order._internalState == "processed"
  assert order._processedAt != null
  assert order._processorId == 123

// GOOD - Test via public interface
test "process order":
  order.process()
  assert order.isProcessed()
```

### 3. Flaky tests (non-deterministic)

```
// BAD - Depends on real time
test "expires after 1 hour":
  item.setExpiry(now + 1.hour)
  sleep(1.hour)              // Slow and fragile
  assert item.isExpired()

// GOOD - Inject time
test "expires after 1 hour":
  clock = FakeClock()
  item.setExpiry(clock.now + 1.hour)
  clock.advance(1.hour)
  assert item.isExpired()
```

### 4. Commented-out tests

```
// NEVER
// test "broken test":
//   ...

// GOOD - Fix or delete
// If temporarily disabled: skip("reason")
```

### 5. Tests without assertions

```
// BAD - Tests nothing
test "create user":
  service.createUser(data)
  // No assert!

// GOOD - Verify the result
test "create user":
  user = service.createUser(data)
  assert user.id != null
  assert user.email == data.email
```

---

## Checklist

### Before each commit

- [ ] All tests pass
- [ ] New tests for new code
- [ ] Coverage >= 80%
- [ ] Fast tests (< 10s total for unit tests)
- [ ] No commented-out tests
- [ ] Explicit test names

### For each new feature

- [ ] Unit tests for business logic
- [ ] Integration tests for external connections
- [ ] BDD scenarios for user stories
- [ ] Edge case tests

### For each bug fix

- [ ] Test that reproduces the bug (fails before fix)
- [ ] Fix implemented
- [ ] Test passes after fix
- [ ] Regression test added

### Metrics

| Metric | Target | Minimum |
|--------|--------|---------|
| Line coverage | > 85% | > 80% |
| Branch coverage | > 80% | > 75% |
| Unit tests | < 1s each | < 2s |
| Full suite | < 5min | < 10min |
| Flaky tests | 0 | < 1% |

---

## Resources

- **Book:** *Test-Driven Development* - Kent Beck
- **Book:** *Growing Object-Oriented Software, Guided by Tests* - Freeman & Pryce
- **Book:** *The Art of Unit Testing* - Roy Osherove
- **Article:** [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

**Last updated:** 2025-01
**Version:** 1.0.0
**Author:** The Bearded CTO
