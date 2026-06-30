# C# Coding Standards

## Naming Conventions

### General Rules

| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | `OrderService`, `CustomerRepository` |
| Interfaces | IPascalCase | `IOrderService`, `IRepository<T>` |
| Methods | PascalCase | `GetOrderByIdAsync`, `CalculateTotal` |
| Properties | PascalCase | `CustomerId`, `TotalAmount` |
| Parameters | camelCase | `orderId`, `cancellationToken` |
| Local variables | camelCase | `orderCount`, `isValid` |
| Private fields | _camelCase | `_orderRepository`, `_logger` |
| Constants | PascalCase | `MaxRetryCount`, `DefaultPageSize` |
| Async methods | Suffix with Async | `GetOrderAsync`, `SaveChangesAsync` |

### Specific Patterns

```csharp
// DO: Use meaningful, descriptive names
public class OrderProcessor { }
public async Task<Order> GetOrderByIdAsync(Guid orderId) { }
private readonly IOrderRepository _orderRepository;
public const int MaxPageSize = 100;

// DON'T: Use abbreviations or unclear names
public class OrdProc { }           // Bad
public async Task<Order> Get(Guid id) { }  // Bad
private readonly IOrderRepository _repo;    // Bad
public const int MPS = 100;        // Bad
```

## Modern C# Features (C# 13/14)

> **Note 2026**: .NET 10 LTS avec C# 14 apporte Extension Members, Null-Conditional Assignment, et Span<T> enhancements.

### Primary Constructors

```csharp
// Modern approach with primary constructors
public class OrderService(
    IOrderRepository orderRepository,
    ILogger<OrderService> logger)
{
    public async Task<Order?> GetOrderAsync(Guid id)
    {
        logger.LogInformation("Fetching order {OrderId}", id);
        return await orderRepository.GetByIdAsync(id);
    }
}

// Alternative: Traditional constructor (still valid)
public class OrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger<OrderService> _logger;

    public OrderService(
        IOrderRepository orderRepository,
        ILogger<OrderService> logger)
    {
        _orderRepository = orderRepository;
        _logger = logger;
    }
}
```

### Records and Init-Only Properties

```csharp
// Record for DTOs (immutable by default)
public record OrderDto(
    Guid Id,
    Guid CustomerId,
    string Status,
    decimal TotalAmount,
    IReadOnlyList<OrderItemDto> Items);

// Record with additional logic
public record CreateOrderRequest
{
    public required Guid CustomerId { get; init; }
    public required List<OrderItemRequest> Items { get; init; }

    public bool HasItems => Items.Count > 0;
}

// Init-only properties for mutable classes
public class OrderFilter
{
    public required DateOnly StartDate { get; init; }
    public DateOnly? EndDate { get; init; }
    public string? Status { get; init; }
}
```

### Pattern Matching

```csharp
// Switch expressions
public string GetOrderStatusDisplay(OrderStatus status) => status switch
{
    OrderStatus.Draft => "Brouillon",
    OrderStatus.Submitted => "Soumise",
    OrderStatus.Confirmed => "Confirmée",
    OrderStatus.Shipped => "Expédiée",
    OrderStatus.Delivered => "Livrée",
    OrderStatus.Cancelled => "Annulée",
    _ => throw new ArgumentOutOfRangeException(nameof(status))
};

// Property patterns
public decimal CalculateDiscount(Order order) => order switch
{
    { TotalAmount.Amount: > 1000 } => 0.15m,
    { TotalAmount.Amount: > 500 } => 0.10m,
    { Items.Count: > 10 } => 0.05m,
    _ => 0m
};

// List patterns (C# 11+)
public string DescribeItems(Order order) => order.Items.ToArray() switch
{
    [] => "No items",
    [var single] => $"Single item: {single.ProductId}",
    [var first, .. var rest] => $"First: {first.ProductId}, plus {rest.Length} more"
};
```

### Collection Expressions (C# 12)

```csharp
// Collection expressions
List<string> statuses = ["Draft", "Submitted", "Confirmed"];
int[] numbers = [1, 2, 3, 4, 5];
Span<int> span = [1, 2, 3];

// Spread operator
int[] combined = [..numbers, 6, 7, 8];
List<OrderDto> allOrders = [..pendingOrders, ..completedOrders];
```

### Raw String Literals

```csharp
// Multi-line SQL queries
var sql = """
    SELECT o.Id, o.CustomerId, o.TotalAmount
    FROM Orders o
    WHERE o.Status = @Status
      AND o.CreatedAt >= @StartDate
    ORDER BY o.CreatedAt DESC
    """;

// JSON templates
var json = """
    {
        "orderId": "{orderId}",
        "status": "confirmed",
        "items": []
    }
    """;
```

### C# 14 Features (.NET 10 LTS)

#### Extension Members (Properties + Static)

```csharp
// C# 14: Extension properties et static members
public static class OrderExtensions
{
    // Extension property (nouveau C# 14)
    extension(Order order)
    {
        public bool IsHighValue => order.TotalAmount.Amount > 1000m;
        public string DisplayStatus => GetStatusDisplay(order.Status);
    }

    // Extension static method (nouveau C# 14)
    extension(Order)
    {
        public static Order CreateEmpty() => Order.Create(Guid.NewGuid());
    }
}

// Usage
var order = Order.CreateEmpty();  // Static extension
if (order.IsHighValue) { }         // Property extension
```

#### Null-Conditional Assignment

```csharp
// C# 14: Null-conditional assignment
customer.Address?.City ??= "Unknown";

// Equivalent avant C# 14
if (customer.Address is not null)
{
    customer.Address.City ??= "Unknown";
}

// Utile pour initialisation lazy
order.Metadata?.Tags ??= [];
order.Metadata?.Notes ??= "No notes";
```

#### Span<T> Enhancements

```csharp
// C# 14: Span pattern matching amélioré
ReadOnlySpan<char> input = "ORDER-12345";

var result = input switch
{
    ['O', 'R', 'D', 'E', 'R', '-', .. var id] => $"Order ID: {new string(id)}",
    ['R', 'E', 'T', '-', .. var id] => $"Return ID: {new string(id)}",
    _ => "Unknown format"
};

// Span dans les lambdas
Span<int> ProcessNumbers(Span<int> numbers) => numbers switch
{
    [] => [],
    [var single] => [single * 2],
    [var first, .. var rest] => [first, ..ProcessNumbers(rest)]
};
```

#### `field` Keyword (C# 14)

Le mot-clé contextuel `field` donne accès au champ de support implicite d'une propriété auto-implémentée,
sans avoir à déclarer le champ manuellement.

```csharp
// C# 14: field keyword — accès au backing field implicite
public class Product
{
    public string Name
    {
        get;
        set => field = value?.Trim() ?? throw new ArgumentNullException(nameof(value));
    }

    public decimal Price
    {
        get => field;
        set => field = value >= 0 ? value : throw new ArgumentOutOfRangeException(nameof(value));
    }
}
```

### C# 14 — Autres Features

#### File-Based Apps (`dotnet run app.cs`)

C# 14 + .NET 10 permet d'exécuter un fichier `.cs` directement sans projet `.csproj`. Idéal pour scripts, outils internes et prototypes rapides.

```bash
# Exécuter un script sans projet
dotnet run app.cs

# Shebang Unix (nécessite chmod +x app.cs — Unix/macOS uniquement)
#!/usr/bin/env dotnet run --
```

```csharp
// app.cs — programme complet sans .csproj
#:package Humanizer@2.*

using Humanizer;

var name = args.FirstOrDefault() ?? "world";
Console.WriteLine($"Hello, {name.Humanize()}!");
```

Directives disponibles dans les file-based apps :

| Directive | Usage |
|-----------|-------|
| `#:package <pkg>@<ver>` | Ajouter une dépendance NuGet |
| `#:sdk <Sdk>` | Changer le SDK (ex : `Microsoft.NET.Sdk.Web`) |
| `#!` (shebang) | Script exécutable Unix |

#### Partial Constructors & Partial Events

C# 14 étend les membres partiels (`partial`) aux constructeurs d'instance et aux événements.

```csharp
partial class OrderProcessor
{
    // Déclarations définissantes (souvent dans un fichier généré)
    partial OrderProcessor();
    partial OrderProcessor(Guid customerId);
    partial event Action<Order> OrderCreated, OrderSubmitted;

    // Déclarations implémentantes (dans le fichier de logique métier)
    partial OrderProcessor() { /* init par défaut */ }
    partial OrderProcessor(Guid customerId) : this() { CustomerId = customerId; }

    partial event Action<Order> OrderCreated
    {
        add => _orderCreated += value;
        remove => _orderCreated -= value;
    }
    partial event Action<Order> OrderSubmitted
    {
        add => _orderSubmitted += value;
        remove => _orderSubmitted -= value;
    }
}
```

Cas d'usage typique : génération de code (source generators) où la déclaration définissante est générée et l'implémentation est fournie manuellement.

#### `nameof` sur Generics Non-Liés (Unbound Generics)

```csharp
// C# 14 : nameof sur un type générique sans argument de type
var name = nameof(List<>);            // "List"
var name2 = nameof(Dictionary<,>);   // "Dictionary"

// Accès aux membres d'un type générique non-lié
var propName = nameof(Repository<>.Entity);    // "Entity"
var countName = nameof(IReadOnlyList<>.Count); // "Count"

// Utile dans les messages d'erreur, logs, attributs
[Display(Name = nameof(IRepository<>))]
public class GenericRepositoryBase { }
```

#### Modificateurs `ref`/`in`/`out` sur Paramètres Lambda

C# 14 autorise les modificateurs `ref`, `in`, `out`, `ref readonly` et `scoped ref` sur les paramètres simples de lambda (sans type explicite obligatoire).

```csharp
// ref — modification par référence
var increment = (ref int x) => x++;

// in — passage en lecture seule par référence (évite la copie)
var display = (in decimal amount) => Console.WriteLine(amount);

// out — paramètre de sortie
var tryParse = (string s, out int result) => int.TryParse(s, out result);

// ref readonly — lecture seule sans copie (C# 14)
var readSpan = (ref readonly ReadOnlySpan<char> span) => span.Length;

// scoped ref — durée de vie limitée au scope
ProcessBuffer((scoped ref Span<byte> buffer) => buffer.Fill(0));
```

## Async/Await Best Practices

### Proper Async Implementation

```csharp
// DO: Use async all the way
public async Task<OrderDto?> GetOrderAsync(Guid id, CancellationToken cancellationToken)
{
    var order = await _orderRepository.GetByIdAsync(id, cancellationToken);
    if (order is null)
        return null;

    return _mapper.Map<OrderDto>(order);
}

// DO: Always pass CancellationToken
public async Task<IReadOnlyList<OrderDto>> GetOrdersAsync(
    OrderFilter filter,
    CancellationToken cancellationToken = default)
{
    var orders = await _context.Orders
        .Where(o => o.CreatedAt >= filter.StartDate.ToDateTime(TimeOnly.MinValue))
        .ToListAsync(cancellationToken);

    return _mapper.Map<List<OrderDto>>(orders);
}

// DON'T: Block on async code
public OrderDto GetOrder(Guid id)
{
    // BAD: This can cause deadlocks
    return GetOrderAsync(id).Result;
}

// DON'T: Use async void (except for event handlers)
public async void ProcessOrder(Guid id) // BAD
{
    await _orderService.ProcessAsync(id);
}
```

### ValueTask for Hot Paths

```csharp
// Use ValueTask for methods that often complete synchronously
public ValueTask<Order?> GetCachedOrderAsync(Guid id)
{
    if (_cache.TryGetValue(id, out var order))
        return ValueTask.FromResult<Order?>(order);

    return new ValueTask<Order?>(LoadOrderFromDatabaseAsync(id));
}

private async Task<Order?> LoadOrderFromDatabaseAsync(Guid id)
{
    var order = await _orderRepository.GetByIdAsync(id);
    if (order is not null)
        _cache.Set(id, order, TimeSpan.FromMinutes(5));
    return order;
}
```

### Parallel Execution

```csharp
// Execute independent operations in parallel
public async Task<OrderSummary> GetOrderSummaryAsync(
    Guid customerId,
    CancellationToken cancellationToken)
{
    var ordersTask = _orderRepository.GetByCustomerIdAsync(customerId, cancellationToken);
    var customerTask = _customerRepository.GetByIdAsync(customerId, cancellationToken);

    await Task.WhenAll(ordersTask, customerTask);

    return new OrderSummary
    {
        Customer = await customerTask,
        Orders = await ordersTask,
        TotalSpent = (await ordersTask).Sum(o => o.TotalAmount.Amount)
    };
}
```

## LINQ Best Practices

### Prefer Method Syntax for Simple Queries

```csharp
// Method syntax - cleaner for simple operations
var activeOrders = orders
    .Where(o => o.Status == OrderStatus.Submitted)
    .OrderByDescending(o => o.CreatedAt)
    .Take(10)
    .ToList();

// Query syntax - better for complex joins
var orderDetails = from o in orders
                   join c in customers on o.CustomerId equals c.Id
                   where o.Status == OrderStatus.Submitted
                   select new { Order = o, CustomerName = c.Name };
```

### Optimize for Performance

```csharp
// DO: Use AsNoTracking for read-only queries
var orders = await _context.Orders
    .AsNoTracking()
    .Where(o => o.CustomerId == customerId)
    .ToListAsync(cancellationToken);

// DO: Use projections to limit data
var summaries = await _context.Orders
    .Where(o => o.Status == OrderStatus.Submitted)
    .Select(o => new OrderSummaryDto
    {
        Id = o.Id,
        CustomerName = o.Customer.Name,
        TotalAmount = o.TotalAmount.Amount
    })
    .ToListAsync(cancellationToken);

// DON'T: Load entire entities when you need a subset
var orders = await _context.Orders
    .Include(o => o.Items)
    .Include(o => o.Customer)
    .ThenInclude(c => c.Addresses)  // Avoid deep includes
    .ToListAsync(cancellationToken);
```

## Null Handling

### Nullable Reference Types

```csharp
// Enable nullable reference types project-wide
// <Nullable>enable</Nullable> in .csproj

// Explicit nullability
public class OrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly ILogger<OrderService>? _logger; // Explicitly nullable

    public async Task<Order?> GetOrderAsync(Guid id) // May return null
    {
        return await _orderRepository.GetByIdAsync(id);
    }

    public async Task<Order> GetRequiredOrderAsync(Guid id) // Never returns null
    {
        return await _orderRepository.GetByIdAsync(id)
            ?? throw new OrderNotFoundException(id);
    }
}
```

### Null Operators

```csharp
// Null-coalescing operators
var displayName = customer.Name ?? "Unknown";
customer.Name ??= "Default Name";

// Null-conditional operators
var itemCount = order?.Items?.Count ?? 0;
order?.Customer?.Notify();

// Null-forgiving operator (use sparingly)
var name = customer.Name!; // Only when you're certain it's not null
```

## Error Handling

### Exception Best Practices

```csharp
// Custom domain exceptions
public class OrderNotFoundException : Exception
{
    public Guid OrderId { get; }

    public OrderNotFoundException(Guid orderId)
        : base($"Order with ID {orderId} was not found")
    {
        OrderId = orderId;
    }
}

// Proper exception handling
public async Task<Order> ProcessOrderAsync(Guid id, CancellationToken cancellationToken)
{
    try
    {
        var order = await _orderRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new OrderNotFoundException(id);

        order.Submit();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return order;
    }
    catch (OrderNotFoundException)
    {
        throw; // Re-throw domain exceptions
    }
    catch (DbUpdateException ex)
    {
        _logger.LogError(ex, "Database error while processing order {OrderId}", id);
        throw new OrderProcessingException("Failed to save order", ex);
    }
}
```

### Result Pattern (Alternative to Exceptions)

```csharp
// Result type for expected failures
public record Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }

    private Result(T value)
    {
        IsSuccess = true;
        Value = value;
    }

    private Result(string error)
    {
        IsSuccess = false;
        Error = error;
    }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(string error) => new(error);

    public TResult Match<TResult>(
        Func<T, TResult> onSuccess,
        Func<string, TResult> onFailure)
        => IsSuccess ? onSuccess(Value!) : onFailure(Error!);
}

// Usage
public async Task<Result<Order>> CreateOrderAsync(CreateOrderRequest request)
{
    if (!request.Items.Any())
        return Result<Order>.Failure("Order must have at least one item");

    var order = Order.Create(request.CustomerId);
    // ... add items
    return Result<Order>.Success(order);
}
```

## Code Organization

### File Structure

```csharp
// One class per file (with some exceptions)
// File name matches class name: OrderService.cs

// Group related nested types in same file
// Order.cs contains Order class and OrderItem if tightly coupled

// Use partial classes for large files
// Order.cs + Order.Validation.cs + Order.Events.cs
```

### Region Usage

```csharp
// Avoid regions - they hide complexity
// If you need regions, your class is too large

// DON'T
public class OrderService
{
    #region Fields
    // ...
    #endregion

    #region Constructors
    // ...
    #endregion

    #region Methods
    // ...
    #endregion
}

// DO: Split into multiple classes or use composition
```

## Documentation

### XML Documentation

```csharp
/// <summary>
/// Processes an order and updates its status to Submitted.
/// </summary>
/// <param name="orderId">The unique identifier of the order.</param>
/// <param name="cancellationToken">Token to cancel the operation.</param>
/// <returns>The processed order.</returns>
/// <exception cref="OrderNotFoundException">Thrown when the order is not found.</exception>
/// <exception cref="InvalidOrderStateException">Thrown when the order cannot be submitted.</exception>
public async Task<Order> ProcessOrderAsync(
    Guid orderId,
    CancellationToken cancellationToken = default)
{
    // Implementation
}
```

## Checklist

- [ ] Naming follows conventions (PascalCase, camelCase, _prefix)
- [ ] Async methods end with Async suffix
- [ ] CancellationToken passed to all async operations
- [ ] Nullable reference types enabled and properly annotated
- [ ] Modern C# features used where appropriate
- [ ] LINQ queries optimized with AsNoTracking and projections
- [ ] Custom exceptions for domain errors
- [ ] No empty catch blocks or catch-all handlers
- [ ] XML documentation on public APIs
