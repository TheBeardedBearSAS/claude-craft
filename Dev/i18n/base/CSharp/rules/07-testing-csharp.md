# C#/.NET Testing Standards

## Testing Frameworks

### xUnit (Recommended for .NET)

```csharp
// Test class structure
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

    [Fact]
    public async Task GetOrderAsync_WhenOrderDoesNotExist_ReturnsNull()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        _orderRepositoryMock
            .Setup(x => x.GetByIdAsync(orderId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Order?)null);

        // Act
        var result = await _sut.GetOrderAsync(orderId);

        // Assert
        result.Should().BeNull();
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

[Fact]
public async Task CalculateTotal_WithMultipleItems_ReturnsSumOfItemTotals() { }

// Alternative: Given_When_Then
[Fact]
public async Task GivenValidOrder_WhenSubmitting_ThenStatusChangesToSubmitted() { }
```

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

### ClassData for Complex Test Cases

```csharp
public class OrderValidationTestData : IEnumerable<object[]>
{
    public IEnumerator<object[]> GetEnumerator()
    {
        yield return new object[]
        {
            new CreateOrderCommand(Guid.Empty),
            new[] { "Customer ID is required" }
        };
        yield return new object[]
        {
            new CreateOrderCommand(Guid.NewGuid()) { Items = new List<OrderItemDto>() },
            new[] { "At least one item is required" }
        };
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

[Theory]
[ClassData(typeof(OrderValidationTestData))]
public async Task ValidateOrder_WithInvalidData_ReturnsExpectedErrors(
    CreateOrderCommand command,
    string[] expectedErrors)
{
    // Arrange
    var validator = new CreateOrderCommandValidator();

    // Act
    var result = await validator.ValidateAsync(command);

    // Assert
    result.IsValid.Should().BeFalse();
    result.Errors.Select(e => e.ErrorMessage).Should().Contain(expectedErrors);
}
```

## Mocking with Moq

### Basic Mocking

```csharp
public class OrderServiceTests
{
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
        // (if needed for verification)
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

// Verify with specific arguments
_loggerMock.Verify(
    x => x.Log(
        LogLevel.Error,
        It.IsAny<EventId>(),
        It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("failed")),
        It.IsAny<Exception>(),
        It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
    Times.Once);
```

### Alternative: NSubstitute

> **Moq vs NSubstitute (2026):** Moq 4.20.0 (Aug 2023) briefly embedded SponsorLink (scraped git emails) — reverted in 4.20.2, 4.20.70 is clean and MIT. The .NET community has broadly adopted **NSubstitute** (MIT) for its cleaner API. Both frameworks are valid; NSubstitute is recommended for new projects.
>
> NuGet: `NSubstitute` Version 5.*

```csharp
// NSubstitute: equivalent of the Moq examples above
var orderRepo = Substitute.For<IOrderRepository>();
var emailService = Substitute.For<IEmailService>();

var sut = new OrderService(orderRepo, emailService);

// Setup
var order = CreateTestOrder();
orderRepo.GetByIdAsync(order.Id, Arg.Any<CancellationToken>()).Returns(order);

// Act
await sut.ProcessOrderAsync(order.Id);

// Verify
await emailService.Received(1).SendOrderConfirmationAsync(
    Arg.Is<Order>(o => o.Id == order.Id),
    Arg.Any<CancellationToken>());

// Verify NOT called
await orderRepo.DidNotReceive().DeleteAsync(
    Arg.Any<Order>(), Arg.Any<CancellationToken>());
```

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
orders.Should().OnlyContain(x => x.TotalAmount.Amount > 0);

// String assertions
name.Should().NotBeNullOrWhiteSpace();
email.Should().Contain("@").And.EndWith(".com");

// Numeric assertions
total.Should().BeGreaterThan(0);
discount.Should().BeInRange(0, 0.5m);
price.Should().BeApproximately(99.99m, 0.01m);

// DateTime assertions
order.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
order.DueDate.Should().BeAfter(order.CreatedAt);

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

## Test Data Builders with Bogus

```csharp
// Test data builder
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
        // Set properties using reflection or internal methods for testing
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

// Faker for random data
public class CustomerFaker : Faker<Customer>
{
    public CustomerFaker()
    {
        RuleFor(c => c.Id, f => Guid.NewGuid());
        RuleFor(c => c.Name, f => f.Person.FullName);
        RuleFor(c => c.Email, f => f.Person.Email);
        RuleFor(c => c.Phone, f => f.Phone.PhoneNumber());
        RuleFor(c => c.Address, f => f.Address.FullAddress());
    }
}
```

## Integration Testing

> **Critical anti-pattern: do not use `UseInMemoryDatabase` for integration tests.** The EF Core in-memory provider enforces no FK constraints, unique constraints, transactions, or `RowVersion`. Tests pass in-memory and silently fail against real PostgreSQL/SQL Server in production. Use **Testcontainers** (see below) or SQLite with `UseRelationalNulls()` as a Docker-free fallback.

### WebApplicationFactory (with Testcontainers)

```csharp
// NuGet: Testcontainers.PostgreSql 4.* (Version 4.x — always call WithImage explicitly)
public class CustomWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private PostgreSqlContainer _postgres = null!;

    public async Task InitializeAsync()
    {
        _postgres = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")  // Required in 4.x — no default image
            .WithDatabase("testdb")
            .WithUsername("test")
            .WithPassword("test")
            .Build();
        await _postgres.StartAsync();
    }

    public new async Task DisposeAsync() => await _postgres.DisposeAsync();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Replace real database with test container
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(_postgres.GetConnectionString()));

            // Replace external services with fakes
            services.AddScoped<IEmailService, FakeEmailService>();
        });

        builder.Configure(app =>
        {
            // Apply migrations on the test database
            using var scope = app.ApplicationServices.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            db.Database.MigrateAsync().GetAwaiter().GetResult();
        });
    }
}

// Integration test
public class OrdersApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public OrdersApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
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
        var orderId = await response.Content.ReadFromJsonAsync<Guid>();
        orderId.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetOrder_WhenNotFound_Returns404()
    {
        // Act
        var response = await _client.GetAsync($"/api/orders/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
```

### Testcontainers for Real Database Testing

```csharp
public class DatabaseIntegrationTests : IAsyncLifetime
{
    private PostgreSqlContainer _postgres = null!;
    private ApplicationDbContext _context = null!;

    public async Task InitializeAsync()
    {
        _postgres = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
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

## Testing Checklist

- [ ] Unit tests for all domain entities and value objects
- [ ] Unit tests for all command/query handlers
- [ ] Unit tests for validators
- [ ] Integration tests for repositories
- [ ] Functional tests for API endpoints
- [ ] Test naming follows convention
- [ ] Tests are independent and isolated
- [ ] No test interdependencies
- [ ] Mocks verify expected interactions
- [ ] FluentAssertions used for readability
- [ ] Test data builders for complex objects
- [ ] Code coverage > 80%
