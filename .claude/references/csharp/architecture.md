# C#/.NET Architecture Standards

## Clean Architecture Principles

### Layer Structure

```
Solution/
├── src/
│   ├── Domain/                    # Core business logic
│   │   ├── Entities/              # Business entities
│   │   ├── ValueObjects/          # Immutable value types
│   │   ├── Enums/                 # Domain enumerations
│   │   ├── Events/                # Domain events
│   │   ├── Exceptions/            # Domain exceptions
│   │   └── Interfaces/            # Repository contracts
│   │
│   ├── Application/               # Use cases & orchestration
│   │   ├── Common/                # Shared behaviors
│   │   │   ├── Behaviors/         # MediatR pipeline behaviors
│   │   │   ├── Exceptions/        # Application exceptions
│   │   │   ├── Interfaces/        # Service interfaces
│   │   │   ├── Mappings/          # AutoMapper profiles
│   │   │   └── Models/            # DTOs
│   │   ├── Features/              # CQRS commands & queries
│   │   │   └── {Feature}/
│   │   │       ├── Commands/      # Write operations
│   │   │       └── Queries/       # Read operations
│   │   └── DependencyInjection.cs
│   │
│   ├── Infrastructure/            # External concerns
│   │   ├── Data/                  # EF Core DbContext
│   │   │   ├── Configurations/    # Entity configurations
│   │   │   ├── Migrations/        # Database migrations
│   │   │   └── Repositories/      # Repository implementations
│   │   ├── Identity/              # Authentication/Authorization
│   │   ├── Services/              # External service implementations
│   │   └── DependencyInjection.cs
│   │
│   └── WebAPI/                    # Presentation layer
│       ├── Controllers/           # API controllers (if not Minimal)
│       ├── Endpoints/             # Minimal API endpoints
│       ├── Filters/               # Action filters
│       ├── Middleware/            # Custom middleware
│       └── Program.cs             # Entry point
│
├── tests/
│   ├── Domain.UnitTests/
│   ├── Application.UnitTests/
│   ├── Infrastructure.IntegrationTests/
│   └── WebAPI.FunctionalTests/
│
└── docker-compose.yml
```

### Dependency Rules

```
┌─────────────────────────────────────────────────────┐
│                      WebAPI                          │
│              (Controllers, Endpoints)                │
└────────────────────────┬────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────┐
│                   Infrastructure                     │
│         (EF Core, External Services)                 │
└────────────────────────┬────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────┐
│                    Application                       │
│           (Use Cases, CQRS, DTOs)                    │
└────────────────────────┬────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────┐
│                      Domain                          │
│     (Entities, Value Objects, Interfaces)            │
└─────────────────────────────────────────────────────┘
```

**CRITICAL**: Dependencies MUST flow inward only. Domain has NO external dependencies.

## Domain Layer

### Entity Design

```csharp
// Domain/Entities/Order.cs
public class Order : BaseEntity, IAggregateRoot
{
    private readonly List<OrderItem> _items = new();

    public Guid CustomerId { get; private set; }
    public OrderStatus Status { get; private set; }
    public Money TotalAmount { get; private set; }
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();
    public DateTime CreatedAt { get; private set; }

    private Order() { } // EF Core constructor

    public static Order Create(Guid customerId)
    {
        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            Status = OrderStatus.Draft,
            TotalAmount = Money.Zero,
            CreatedAt = DateTime.UtcNow
        };

        order.AddDomainEvent(new OrderCreatedEvent(order.Id));
        return order;
    }

    public void AddItem(Product product, int quantity)
    {
        Guard.Against.NegativeOrZero(quantity, nameof(quantity));

        var item = new OrderItem(product.Id, product.Price, quantity);
        _items.Add(item);
        RecalculateTotal();

        AddDomainEvent(new OrderItemAddedEvent(Id, item.ProductId));
    }

    public void Submit()
    {
        if (Status != OrderStatus.Draft)
            throw new InvalidOrderStateException("Only draft orders can be submitted");

        if (!_items.Any())
            throw new EmptyOrderException("Cannot submit an empty order");

        Status = OrderStatus.Submitted;
        AddDomainEvent(new OrderSubmittedEvent(Id));
    }

    private void RecalculateTotal()
    {
        TotalAmount = _items.Aggregate(Money.Zero, (sum, item) => sum + item.Total);
    }
}
```

### Value Objects

```csharp
// Domain/ValueObjects/Money.cs
public sealed class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    public static Money Zero => new(0, "USD");

    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public static Money Create(decimal amount, string currency = "USD")
    {
        Guard.Against.Negative(amount, nameof(amount));
        Guard.Against.NullOrWhiteSpace(currency, nameof(currency));

        return new Money(amount, currency.ToUpperInvariant());
    }

    public static Money operator +(Money left, Money right)
    {
        if (left.Currency != right.Currency)
            throw new CurrencyMismatchException();

        return new Money(left.Amount + right.Amount, left.Currency);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }
}
```

### Repository Interfaces

```csharp
// Domain/Interfaces/IOrderRepository.cs
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Order>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task AddAsync(Order order, CancellationToken cancellationToken = default);
    Task UpdateAsync(Order order, CancellationToken cancellationToken = default);
    Task DeleteAsync(Order order, CancellationToken cancellationToken = default);
}
```

## Application Layer

### CQRS Pattern with MediatR

```csharp
// Application/Features/Orders/Commands/CreateOrder/CreateOrderCommand.cs
public record CreateOrderCommand(Guid CustomerId) : IRequest<Guid>;

// Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandHandler.cs
public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IOrderRepository _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateOrderCommandHandler(
        IOrderRepository orderRepository,
        IUnitOfWork unitOfWork)
    {
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var order = Order.Create(request.CustomerId);

        await _orderRepository.AddAsync(order, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return order.Id;
    }
}

// Application/Features/Orders/Commands/CreateOrder/CreateOrderCommandValidator.cs
public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty()
            .WithMessage("Customer ID is required");
    }
}
```

### Query Pattern

```csharp
// Application/Features/Orders/Queries/GetOrderById/GetOrderByIdQuery.cs
public record GetOrderByIdQuery(Guid OrderId) : IRequest<OrderDto?>;

// Application/Features/Orders/Queries/GetOrderById/GetOrderByIdQueryHandler.cs
public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetOrderByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<OrderDto?> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Orders
            .AsNoTracking()
            .Where(o => o.Id == request.OrderId)
            .ProjectTo<OrderDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
```

### Pipeline Behaviors

```csharp
// Application/Common/Behaviors/ValidationBehavior.cs
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
            return await next();

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Any())
            throw new ValidationException(failures);

        return await next();
    }
}
```

## Infrastructure Layer

### Entity Framework Configuration

```csharp
// Infrastructure/Data/Configurations/OrderConfiguration.cs
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.OwnsOne(o => o.TotalAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("TotalAmount")
                .HasPrecision(18, 2);
            money.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3);
        });

        builder.HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey("OrderId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(o => o.Items)
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(o => o.CustomerId);
        builder.HasIndex(o => o.CreatedAt);
    }
}
```

### Repository Implementation

```csharp
// Infrastructure/Data/Repositories/OrderRepository.cs
public class OrderRepository : IOrderRepository
{
    private readonly ApplicationDbContext _context;

    public OrderRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Order>> GetByCustomerIdAsync(
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Order order, CancellationToken cancellationToken = default)
    {
        await _context.Orders.AddAsync(order, cancellationToken);
    }

    public Task UpdateAsync(Order order, CancellationToken cancellationToken = default)
    {
        _context.Orders.Update(order);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Order order, CancellationToken cancellationToken = default)
    {
        _context.Orders.Remove(order);
        return Task.CompletedTask;
    }
}
```

## WebAPI Layer

### Minimal API Endpoints (Preferred in .NET 10)

```csharp
// WebAPI/Endpoints/OrderEndpoints.cs
public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/orders")
            .WithTags("Orders")
            .RequireAuthorization();

        group.MapGet("/{id:guid}", GetOrderById)
            .WithName("GetOrderById")
            .Produces<OrderDto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", CreateOrder)
            .WithName("CreateOrder")
            .Produces<Guid>(StatusCodes.Status201Created)
            .ProducesValidationProblem();

        group.MapPost("/{id:guid}/submit", SubmitOrder)
            .WithName("SubmitOrder")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetOrderById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var order = await sender.Send(new GetOrderByIdQuery(id), cancellationToken);
        return order is null
            ? TypedResults.NotFound()
            : TypedResults.Ok(order);
    }

    private static async Task<IResult> CreateOrder(
        CreateOrderCommand command,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var orderId = await sender.Send(command, cancellationToken);
        return TypedResults.CreatedAtRoute("GetOrderById", new { id = orderId }, orderId);
    }

    private static async Task<IResult> SubmitOrder(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        await sender.Send(new SubmitOrderCommand(id), cancellationToken);
        return TypedResults.NoContent();
    }
}
```

### Controller-Based API (Alternative)

```csharp
// WebAPI/Controllers/OrdersController.cs
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly ISender _sender;

    public OrdersController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var order = await _sender.Send(new GetOrderByIdQuery(id), cancellationToken);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(CreateOrderCommand command, CancellationToken cancellationToken)
    {
        var orderId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = orderId }, orderId);
    }
}
```

## .NET Aspire Integration (Cloud-Native)

```csharp
// AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    .AddDatabase("ordersdb");

var redis = builder.AddRedis("cache");

var api = builder.AddProject<Projects.WebAPI>("api")
    .WithReference(postgres)
    .WithReference(redis)
    .WithExternalHttpEndpoints();

builder.AddProject<Projects.MigrationService>("migrations")
    .WithReference(postgres);

builder.Build().Run();
```

## Architecture Checklist

- [ ] Domain layer has NO external dependencies
- [ ] Application layer only depends on Domain
- [ ] Infrastructure implements interfaces from Application/Domain
- [ ] WebAPI depends on all other layers but only through DI
- [ ] All entities have private setters
- [ ] Value Objects are immutable
- [ ] Repository interfaces are in Domain
- [ ] CQRS separates read/write operations
- [ ] Validation is in Application layer (FluentValidation)
- [ ] DTOs are used for data transfer, not entities
