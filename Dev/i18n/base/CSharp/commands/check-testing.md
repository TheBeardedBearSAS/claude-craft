---
description: Analyze test coverage and testing practices in C#/.NET project
---

# C#/.NET Testing Check

You are a testing expert for .NET. Analyze the project's test coverage, testing patterns, and best practices adherence.

## Analysis Process

### Step 1: Test Project Structure

**Expected structure:**

```
tests/
├── {Project}.Domain.UnitTests/
│   ├── Entities/
│   │   ├── OrderTests.cs
│   │   └── CustomerTests.cs
│   └── ValueObjects/
│       └── MoneyTests.cs
│
├── {Project}.Application.UnitTests/
│   ├── Features/
│   │   └── Orders/
│   │       ├── Commands/
│   │       │   ├── CreateOrderCommandTests.cs
│   │       │   └── CreateOrderCommandValidatorTests.cs
│   │       └── Queries/
│   │           └── GetOrderByIdQueryTests.cs
│   └── Behaviors/
│       └── ValidationBehaviorTests.cs
│
├── {Project}.Infrastructure.IntegrationTests/
│   ├── Repositories/
│   │   └── OrderRepositoryTests.cs
│   └── Services/
│       └── EmailServiceTests.cs
│
└── {Project}.WebAPI.FunctionalTests/
    ├── Endpoints/
    │   └── OrderEndpointsTests.cs
    └── Controllers/
        └── OrdersControllerTests.cs
```

### Step 2: Test Coverage Analysis

**Check coverage for:**

| Layer | Expected Coverage | Critical Areas |
|-------|------------------|----------------|
| Domain | 90%+ | Entities, Value Objects, Domain Services |
| Application | 85%+ | Command/Query Handlers, Validators |
| Infrastructure | 70%+ | Repositories (integration tests) |
| WebAPI | 60%+ | Endpoints, Middleware |

### Step 3: Test Pattern Compliance

**Unit Test Structure (AAA Pattern):**

```csharp
[Fact]
public async Task MethodName_StateUnderTest_ExpectedBehavior()
{
    // Arrange
    var mockRepo = new Mock<IOrderRepository>();
    var sut = new OrderService(mockRepo.Object);

    // Act
    var result = await sut.GetOrderAsync(orderId);

    // Assert
    result.Should().NotBeNull();
}
```

**Verify:**
- [ ] Tests follow AAA pattern
- [ ] Descriptive test names (Method_State_Expected)
- [ ] One assertion concept per test
- [ ] Tests are independent (no shared state)

### Step 4: Mocking Practices

**Check for:**

```csharp
// ✅ GOOD: Verify interactions
_mockRepo.Verify(
    x => x.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()),
    Times.Once);

// ✅ GOOD: Setup with specific behavior
_mockRepo
    .Setup(x => x.GetByIdAsync(orderId, default))
    .ReturnsAsync(expectedOrder);

// ❌ BAD: Over-mocking (mocking internals)
var mockList = new Mock<List<OrderItem>>();  // Don't mock concrete classes

// ❌ BAD: Not verifying important interactions
// Test passes but doesn't verify the repository was called
```

### Step 5: Assertion Quality

**FluentAssertions usage:**

```csharp
// ✅ GOOD: Clear, readable assertions
result.Should().NotBeNull();
result.Id.Should().Be(expectedId);
result.Items.Should().HaveCount(3);
result.Status.Should().Be(OrderStatus.Submitted);

// ✅ GOOD: Exception assertions
var act = async () => await service.ProcessAsync(invalidId);
await act.Should().ThrowAsync<OrderNotFoundException>()
    .WithMessage("*not found*");

// ❌ BAD: Multiple unrelated assertions
result.Should().NotBeNull();
otherResult.Should().BeEmpty();  // Different object!
```

### Step 6: Integration Test Quality

**Check for proper isolation:**

```csharp
// ✅ GOOD: Using Testcontainers for real database
public class OrderRepositoryTests : IAsyncLifetime
{
    private PostgreSqlContainer _postgres;

    public async Task InitializeAsync()
    {
        _postgres = new PostgreSqlBuilder().Build();
        await _postgres.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
    }
}

// ✅ GOOD: WebApplicationFactory for API tests
public class OrderEndpointsTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public OrderEndpointsTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }
}
```

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## Output Format

```
══════════════════════════════════════════════════════════════
C#/.NET TESTING ANALYSIS REPORT
══════════════════════════════════════════════════════════════

Project: {ProjectName}
Test Framework: xUnit
Mocking Library: Moq
Assertion Library: FluentAssertions

──────────────────────────────────────────────────────────────
TEST PROJECT STRUCTURE
──────────────────────────────────────────────────────────────

[✓] Domain.UnitTests project exists
[✓] Application.UnitTests project exists
[✓] Infrastructure.IntegrationTests project exists
[✗] WebAPI.FunctionalTests project missing
    → Create functional tests for API endpoints

──────────────────────────────────────────────────────────────
TEST COVERAGE
──────────────────────────────────────────────────────────────

Domain Layer:
  Entities:     12/15 methods tested (80%)
  Value Objects: 8/8 methods tested (100%)
  Overall:      87%  [✓ Above 90% threshold? No]

Application Layer:
  Commands:     18/20 handlers tested (90%)
  Queries:      8/10 handlers tested (80%)
  Validators:   15/20 validators tested (75%)
  Overall:      82%  [✗ Below 85% threshold]

Infrastructure Layer:
  Repositories: 6/6 tested (100%)
  Services:     3/5 tested (60%)
  Overall:      75%  [✓ Above 70% threshold]

WebAPI Layer:
  Endpoints:    0/12 tested (0%)
  Middleware:   0/3 tested (0%)
  Overall:      0%   [✗ Below 60% threshold]

──────────────────────────────────────────────────────────────
UNTESTED CRITICAL PATHS
──────────────────────────────────────────────────────────────

[CRITICAL] Missing tests:
1. CreateOrderCommandHandler - Main business logic
2. Order.Submit() - State transition
3. /api/orders POST endpoint
4. Authentication middleware

──────────────────────────────────────────────────────────────
TEST QUALITY
──────────────────────────────────────────────────────────────

Naming Convention:
  [✓] 45/50 tests follow Method_State_Expected pattern
  [✗] 5 tests have unclear names
      → OrderTests.cs: "Test1", "TestOrder"

AAA Pattern:
  [✓] 48/50 tests follow Arrange-Act-Assert
  [✗] 2 tests mix concerns

Assertions:
  [✓] FluentAssertions used consistently
  [✓] Single assertion concept per test

Mocking:
  [✓] Moq used correctly
  [✗] 3 tests over-mock (mock concrete classes)
      → CustomerServiceTests.cs:34

──────────────────────────────────────────────────────────────
TEST DATA
──────────────────────────────────────────────────────────────

[✓] Bogus used for fake data generation
[✓] Test data builders found
[✗] Some hardcoded test data
    → OrderTests.cs:56 - Use OrderBuilder instead

──────────────────────────────────────────────────────────────
INTEGRATION TESTS
──────────────────────────────────────────────────────────────

[✓] Testcontainers configured for PostgreSQL
[✓] WebApplicationFactory used for API tests
[✓] Tests properly isolated (IAsyncLifetime)

══════════════════════════════════════════════════════════════
SUMMARY
══════════════════════════════════════════════════════════════

Total Tests: 50
  Unit Tests: 48
  Integration Tests: 2
  Functional Tests: 0

Overall Coverage: 61%
  Target: 80%
  Gap: 19%

Testing Score: 68/100

Priority Actions:
1. [CRITICAL] Add WebAPI functional tests
2. [HIGH] Test missing command handlers
3. [HIGH] Test Order.Submit() state transition
4. [MEDIUM] Rename unclear test methods
5. [LOW] Replace hardcoded test data with builders
```

## Scoring Criteria

| Category | Weight | Criteria |
|----------|--------|----------|
| Coverage | 35% | Above thresholds per layer |
| Test Quality | 25% | AAA, naming, isolation |
| Critical Paths | 25% | Business logic tested |
| Integration | 15% | Proper setup, real dependencies |

## Recommendations

After analysis, provide:
1. Missing test file templates
2. Priority order for adding tests
3. Example test implementations for critical paths
