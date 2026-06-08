# Testing - TDD/BDD Principles & C#/.NET Standards

## Overview

**Test-Driven Development (TDD)** and **Behavior-Driven Development (BDD)** are **mandatory** practices for ensuring code quality and maintainability.

**Objectives:**
- Coverage: ≥ 80%
- Unit tests: < 10s total
- Independent and reproducible tests
- CI/CD blocks on failing tests

---

## Table of Contents

1. [Test Pyramid](#test-pyramid)
2. [TDD - Test-Driven Development](#tdd---test-driven-development)
3. [BDD - Behavior-Driven Development](#bdd---behavior-driven-development)
4. [C# Testing Frameworks](#c-testing-frameworks)
5. [Unit Testing Patterns](#unit-testing-patterns)
6. [Mocking with Moq](#mocking-with-moq)
7. [FluentAssertions](#fluentassertions)
8. [Test Data Builders](#test-data-builders)
9. [Integration Testing](#integration-testing)
10. [Best Practices](#best-practices)
11. [Anti-patterns](#anti-patterns)
12. [Checklist](#checklist)

---

## Test Pyramid

```
          ┌─────────────┐
          │    E2E      │  ← Few (10%)
          │  (UI/API)   │    Slow, fragile
          ├─────────────┤
          │ Integration │  ← Moderate (20%)
          │   Tests     │    Verify connections
          ├─────────────┤
          │   Unit      │  ← Many (70%)
          │   Tests     │    Fast, isolated
          └─────────────┘
```

| Type | % | Time | When |
|------|---|------|------|
| Unit | 70% | < 1s each | Every commit |
| Integration | 20% | < 5s each | Every PR |
| E2E | 10% | < 30s each | Before deploy |

---

## TDD - Test-Driven Development

### Red-Green-Refactor Cycle

```
     ┌─────────────────────────────────────┐
     │                                     │
     ▼                                     │
┌─────────┐    ┌─────────┐    ┌──────────┐│
│   RED   │───▶│  GREEN  │───▶│ REFACTOR ││
│  Test   │    │  Code   │    │ Improve  ││
│ fails   │    │ passes  │    │          ││
└─────────┘    └─────────┘    └──────────┘│
                                   │      │
                                   └──────┘
```

### Steps

1. **RED** - Write a failing test
   - Define expected behavior
   - Test MUST fail (otherwise it tests nothing)

2. **GREEN** - Write minimum code to pass
   - Simplest possible code
   - No optimization
   - No generalization

3. **REFACTOR** - Improve the code
   - Remove duplication
   - Improve readability
   - Tests must still pass

### TDD Rules

1. One test at a time
2. Test defines behavior (not implementation)
3. Minimal code to pass
4. Refactor after each GREEN
5. Never ignore a failing test

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
    When I add a product priced at 29.99€
    Then my cart should contain 1 item
    And the cart total should be 29.99€
```

### Given-When-Then Structure

| Keyword | Purpose | Example |
|---------|---------|---------|
| **Given** | Initial context | "Given I am logged in" |
| **When** | Action | "When I click submit" |
| **Then** | Expected result | "Then I see success message" |
| **And** | Continuation | "And I receive an email" |
| **But** | Exception | "But I don't see errors" |

---

## C# Testing Frameworks

### xUnit (Recommended for .NET)

```csharp
public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _orderRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly OrderService _sut; // System Under Test

    public OrderServiceTests()
    {
        _orderRepositoryMock = new Mock<IOrderRepository>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _sut = new OrderService(_orderRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task GetOrderAsync_WhenOrderExists_ReturnsOrder()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var expectedOrder = CreateTestOrder(orderId);
        _orderRepositoryMock
            .Setup(x => x.GetByIdAsync(orderId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedOrder);

        // Act
        var result = await _sut.GetOrderAsync(orderId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedOrder);
    }

    private static Order CreateTestOrder(Guid id) => Order.Create(Guid.NewGuid());
}
```

### Test Naming Convention

```csharp
// Pattern: MethodName_StateUnderTest_ExpectedBehavior
[Fact]
public async Task CreateOrder_WithValidCustomer_ReturnsNewOrderId() { }

[Fact]
public async Task SubmitOrder_WhenOrderIsEmpty_ThrowsEmptyOrderException() { }

// Alternative: Given_When_Then
[Fact]
public async Task GivenValidOrder_WhenSubmitting_ThenStatusChangesToSubmitted() { }
```

---

## Unit Testing Patterns

### Arrange-Act-Assert (AAA)

```csharp
[Fact]
public async Task ProcessOrder_ShouldUpdateStatusAndSave()
{
    // Arrange
    var orderId = Guid.NewGuid();
    var order = CreateDraftOrder(orderId);
    order.AddItem(CreateTestProduct(), 2);

    _orderRepositoryMock
        .Setup(x => x.GetByIdAsync(orderId, It.IsAny<CancellationToken>()))
        .ReturnsAsync(order);

    // Act
    await _sut.ProcessOrderAsync(orderId);

    // Assert
    order.Status.Should().Be(OrderStatus.Submitted);
    _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
}
```

### Theory with InlineData

```csharp
[Theory]
[InlineData(100, 0)]        // Below threshold
[InlineData(500, 0.05)]     // 5% discount
[InlineData(1000, 0.10)]    // 10% discount
[InlineData(2000, 0.15)]    // 15% discount
public void CalculateDiscount_BasedOnOrderAmount_ReturnsCorrectDiscount(
    decimal orderAmount,
    decimal expectedDiscount)
{
    // Arrange
    var order = CreateOrderWithAmount(orderAmount);

    // Act
    var discount = _sut.CalculateDiscount(order);

    // Assert
    discount.Should().Be(expectedDiscount);
}
```

### Theory with MemberData

```csharp
public static IEnumerable<object[]> InvalidOrderData =>
    new List<object[]>
    {
        new object[] { Guid.Empty, "Customer ID cannot be empty" },
        new object[] { Guid.NewGuid(), null }, // Missing items
    };

[Theory]
[MemberData(nameof(InvalidOrderData))]
public async Task CreateOrder_WithInvalidData_ThrowsValidationException(
    Guid customerId,
    string? expectedError)
{
    // Arrange & Act
    var act = async () => await _sut.CreateOrderAsync(customerId);

    // Assert
    await act.Should().ThrowAsync<ValidationException>();
}
```

---

## Mocking with Moq

### Basic Mocking

```csharp
private readonly Mock<IOrderRepository> _orderRepoMock = new();
private readonly Mock<IEmailService> _emailServiceMock = new();
private readonly Mock<ILogger<OrderService>> _loggerMock = new();

[Fact]
public async Task ProcessOrder_SendsConfirmationEmail()
{
    // Arrange
    var order = CreateTestOrder();
    _orderRepoMock
        .Setup(x => x.GetByIdAsync(order.Id, default))
        .ReturnsAsync(order);

    var service = new OrderService(
        _orderRepoMock.Object,
        _emailServiceMock.Object,
        _loggerMock.Object);

    // Act
    await service.ProcessOrderAsync(order.Id);

    // Assert
    _emailServiceMock.Verify(
        x => x.SendOrderConfirmationAsync(
            It.Is<Order>(o => o.Id == order.Id),
            It.IsAny<CancellationToken>()),
        Times.Once);
}
```

### Advanced Moq Patterns

```csharp
// Setup with callback
_orderRepoMock
    .Setup(x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
    .Callback<Order, CancellationToken>((order, _) =>
    {
        // Simulate database assigning ID
    })
    .Returns(Task.CompletedTask);

// Setup sequence
_orderRepoMock
    .SetupSequence(x => x.GetByIdAsync(It.IsAny<Guid>(), default))
    .ReturnsAsync((Order?)null)  // First call
    .ReturnsAsync(CreateTestOrder()); // Second call

// Verify call count
_emailServiceMock.Verify(
    x => x.SendAsync(It.IsAny<string>(), It.IsAny<string>()),
    Times.Exactly(2));

// Verify never called
_orderRepoMock.Verify(
    x => x.DeleteAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()),
    Times.Never);
```

---

## FluentAssertions

### Basic Assertions

```csharp
// Object assertions
result.Should().NotBeNull();
result.Should().BeOfType<Order>();
result.Should().BeEquivalentTo(expected);

// Collection assertions
orders.Should().HaveCount(3);
orders.Should().Contain(x => x.Status == OrderStatus.Submitted);
orders.Should().BeInDescendingOrder(x => x.CreatedAt);

// String assertions
name.Should().NotBeNullOrWhiteSpace();
email.Should().Contain("@").And.EndWith(".com");

// Numeric assertions
total.Should().BeGreaterThan(0);
discount.Should().BeInRange(0, 0.5m);
price.Should().BeApproximately(99.99m, 0.01m);

// Exception assertions
var act = async () => await service.ProcessAsync(invalidId);
await act.Should().ThrowAsync<OrderNotFoundException>()
    .WithMessage("*not found*");
```

### Object Equivalency

```csharp
// Compare objects ignoring certain properties
result.Should().BeEquivalentTo(expected, options => options
    .Excluding(x => x.Id)
    .Excluding(x => x.CreatedAt));

// Compare collections with specific rules
orders.Should().BeEquivalentTo(expectedOrders, options => options
    .WithStrictOrdering()
    .Using<DateTime>(ctx => ctx.Subject.Should().BeCloseTo(ctx.Expectation, TimeSpan.FromSeconds(1)))
    .WhenTypeIs<DateTime>());
```

---

## Test Data Builders

### Builder Pattern with Bogus

```csharp
public class OrderBuilder
{
    private readonly Faker _faker = new();
    private Guid _id = Guid.NewGuid();
    private Guid _customerId = Guid.NewGuid();
    private OrderStatus _status = OrderStatus.Draft;
    private readonly List<OrderItem> _items = new();

    public OrderBuilder WithId(Guid id)
    {
        _id = id;
        return this;
    }

    public OrderBuilder WithCustomer(Guid customerId)
    {
        _customerId = customerId;
        return this;
    }

    public OrderBuilder WithStatus(OrderStatus status)
    {
        _status = status;
        return this;
    }

    public OrderBuilder WithItems(int count)
    {
        for (int i = 0; i < count; i++)
        {
            _items.Add(new OrderItem(
                Guid.NewGuid(),
                Money.Create(_faker.Random.Decimal(10, 100)),
                _faker.Random.Int(1, 5)));
        }
        return this;
    }

    public Order Build()
    {
        var order = Order.Create(_customerId);
        return order;
    }
}

// Usage
[Fact]
public async Task Test_WithBuilder()
{
    var order = new OrderBuilder()
        .WithStatus(OrderStatus.Submitted)
        .WithItems(3)
        .Build();
}
```

---

## Integration Testing

### WebApplicationFactory

```csharp
public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove real database
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            // Add in-memory database
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase("TestDb");
            });

            // Replace external services with fakes
            services.AddScoped<IEmailService, FakeEmailService>();
        });
    }
}

public class OrdersApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public OrdersApiTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateOrder_ReturnsCreatedStatus()
    {
        // Arrange
        var command = new CreateOrderCommand(Guid.NewGuid());

        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", command);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
```

### Testcontainers for Real Database Testing

> **Version note:** Use Testcontainers **4.x** (4.12.0 latest stable). Starting with 4.0, default image versions
> are no longer provided — always call `.WithImage(...)` explicitly to avoid a runtime exception.

```csharp
public class DatabaseIntegrationTests : IAsyncLifetime
{
    private PostgreSqlContainer _postgres = null!;
    private ApplicationDbContext _context = null!;

    public async Task InitializeAsync()
    {
        _postgres = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")  // Required in 4.x — no default image
            .WithDatabase("testdb")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        await _postgres.StartAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(_postgres.GetConnectionString())
            .Options;

        _context = new ApplicationDbContext(options);
        await _context.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await _context.DisposeAsync();
        await _postgres.DisposeAsync();
    }

    [Fact]
    public async Task CanPersistAndRetrieveOrder()
    {
        // Arrange
        var order = Order.Create(Guid.NewGuid());
        order.AddItem(Guid.NewGuid(), Money.Create(99.99m), 2);

        // Act
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var retrieved = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == order.Id);

        // Assert
        retrieved.Should().NotBeNull();
        retrieved!.Items.Should().HaveCount(1);
    }
}
```

---

## Test Organization

### Project Structure

```
tests/
├── Domain.UnitTests/
│   ├── Entities/
│   │   ├── OrderTests.cs
│   │   └── OrderItemTests.cs
│   ├── ValueObjects/
│   │   └── MoneyTests.cs
│   └── Domain.UnitTests.csproj
│
├── Application.UnitTests/
│   ├── Features/
│   │   └── Orders/
│   │       ├── Commands/
│   │       │   └── CreateOrderCommandTests.cs
│   │       └── Queries/
│   │           └── GetOrderByIdQueryTests.cs
│   ├── Behaviors/
│   │   └── ValidationBehaviorTests.cs
│   └── Application.UnitTests.csproj
│
├── Infrastructure.IntegrationTests/
│   ├── Repositories/
│   │   └── OrderRepositoryTests.cs
│   └── Infrastructure.IntegrationTests.csproj
│
└── WebAPI.FunctionalTests/
    ├── Endpoints/
    │   └── OrderEndpointsTests.cs
    └── WebAPI.FunctionalTests.csproj
```

---

## Best Practices

### 1. One assert per test (preference)

```csharp
// Prefer separate tests
[Fact] public void User_Email_Is_Valid() { }
[Fact] public void User_Password_Is_Strong() { }
[Fact] public void User_Is_Adult() { }
```

### 2. Explicit naming

```csharp
// Descriptive names
[Fact] public void CalculateTotal_Returns_Zero_For_Empty_Cart() { }
[Fact] public void Login_Fails_With_Invalid_Credentials() { }
```

### 3. Independent tests

```csharp
// Each test creates its own data
[Fact]
public async Task UpdateUser_Changes_Name()
{
    var user = CreateUser();  // Fresh data per test
    user.Update(name: "New");
    user.Name.Should().Be("New");
}
```

### 4. Use fixtures/factories

```csharp
// Factory instead of manual creation
var user = UserFactory.Create(role: "admin");
```

---

## Anti-patterns

### 1. Testing implementation (not behavior)

```csharp
// BAD: Tests HOW
verify mock.Insert was called once

// GOOD: Tests WHAT
repository.FindById(user.Id).Should().NotBeNull();
```

### 2. Flaky tests

```csharp
// BAD: Depends on real time
sleep(1.hour);

// GOOD: Inject time
clock.Advance(1.hour);
```

### 3. Commented tests

```csharp
// NEVER do this
// [Fact] public void BrokenTest() { }

// Either fix or delete
```

### 4. Tests without assertions

```csharp
// BAD: Tests nothing
service.CreateUser(data);

// GOOD: Verify result
var user = service.CreateUser(data);
user.Id.Should().NotBeEmpty();
```

---

## Checklist

### Before each commit

- [ ] All tests pass
- [ ] New tests for new code
- [ ] Coverage ≥ 80%
- [ ] Tests are fast (< 10s total for unit tests)
- [ ] No commented tests
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

### C# Specific

- [ ] Unit tests for all domain entities and value objects
- [ ] Unit tests for all command/query handlers
- [ ] Unit tests for validators
- [ ] Integration tests for repositories
- [ ] Functional tests for API endpoints
- [ ] Mocks verify expected interactions
- [ ] FluentAssertions used for readability
- [ ] Test data builders for complex objects

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
**Version:** 2.0.0 (merged base + C#)
**Author:** The Bearded CTO
