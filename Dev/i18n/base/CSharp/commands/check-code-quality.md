---
description: Run comprehensive code quality analysis on C#/.NET project
---

# C#/.NET Code Quality Check

You are a C#/.NET code quality expert. Analyze the codebase for code smells, anti-patterns, and quality issues.

## Analysis Areas

### 1. Async/Await Patterns

**Check for anti-patterns:**

```csharp
// ❌ BAD: Blocking on async code
var result = GetDataAsync().Result;  // Deadlock risk!
var data = GetDataAsync().GetAwaiter().GetResult();  // Also bad
task.Wait();  // Blocking

// ✅ GOOD: Proper async
var result = await GetDataAsync();
await task;

// ❌ BAD: async void (except event handlers)
public async void ProcessOrder(Guid id) { }

// ✅ GOOD: async Task
public async Task ProcessOrderAsync(Guid id) { }

// ❌ BAD: Missing CancellationToken
public async Task<Order> GetOrderAsync(Guid id) { }

// ✅ GOOD: CancellationToken propagated
public async Task<Order> GetOrderAsync(Guid id, CancellationToken ct = default) { }
```

### 2. LINQ Performance

**Inefficient patterns:**

```csharp
// ❌ BAD: Multiple enumerations
var list = items.Where(x => x.Active);
var count = list.Count();
var first = list.First();

// ✅ GOOD: Single enumeration
var list = items.Where(x => x.Active).ToList();
var count = list.Count;
var first = list[0];

// ❌ BAD: N+1 query problem
var orders = await _context.Orders.ToListAsync();
foreach (var order in orders)
{
    var items = await _context.OrderItems  // N additional queries!
        .Where(i => i.OrderId == order.Id)
        .ToListAsync();
}

// ✅ GOOD: Eager loading
var orders = await _context.Orders
    .Include(o => o.Items)
    .ToListAsync();

// ❌ BAD: Loading all columns
var orders = await _context.Orders.ToListAsync();
return orders.Select(o => new { o.Id, o.Status });

// ✅ GOOD: Projection at database level
var orders = await _context.Orders
    .Select(o => new OrderSummaryDto { Id = o.Id, Status = o.Status })
    .ToListAsync();
```

### 3. Memory Management

**Memory issues:**

```csharp
// ❌ BAD: String concatenation in loops
var result = "";
foreach (var item in items)
{
    result += item.ToString() + ",";  // Creates new string each iteration
}

// ✅ GOOD: StringBuilder
var sb = new StringBuilder();
foreach (var item in items)
{
    sb.Append(item.ToString()).Append(',');
}

// ❌ BAD: Large object allocations
var hugeArray = new byte[100_000_000];  // Goes to LOH

// ✅ GOOD: ArrayPool for large arrays
var array = ArrayPool<byte>.Shared.Rent(100_000_000);
try { /* use array */ }
finally { ArrayPool<byte>.Shared.Return(array); }
```

### 4. Exception Handling

**Anti-patterns:**

```csharp
// ❌ BAD: Empty catch
try { DoSomething(); }
catch { }  // Swallowing exceptions!

// ❌ BAD: Catching Exception
try { DoSomething(); }
catch (Exception ex) { Log(ex); }  // Too broad

// ✅ GOOD: Specific exceptions
try { DoSomething(); }
catch (OrderNotFoundException ex)
{
    _logger.LogWarning(ex, "Order not found");
    throw;  // Re-throw domain exceptions
}
catch (DbUpdateException ex)
{
    _logger.LogError(ex, "Database error");
    throw new InfrastructureException("Failed to save", ex);
}

// ❌ BAD: throw ex (loses stack trace)
catch (Exception ex)
{
    Log(ex);
    throw ex;  // Stack trace lost!
}

// ✅ GOOD: throw (preserves stack trace)
catch (Exception ex)
{
    Log(ex);
    throw;  // Stack trace preserved
}
```

### 5. Null Safety

**Check nullable reference types:**

```csharp
// ❌ BAD: Nullable warnings ignored
public Order GetOrder(Guid id)
{
    return _orders.FirstOrDefault(o => o.Id == id);  // May return null!
}

// ✅ GOOD: Explicit nullability
public Order? GetOrder(Guid id)
{
    return _orders.FirstOrDefault(o => o.Id == id);
}

// ✅ GOOD: Throw on null
public Order GetRequiredOrder(Guid id)
{
    return _orders.FirstOrDefault(o => o.Id == id)
        ?? throw new OrderNotFoundException(id);
}

// ❌ BAD: Null reference potential
var name = customer.Address.City;  // Address could be null!

// ✅ GOOD: Null-conditional
var name = customer.Address?.City ?? "Unknown";
```

### 6. Disposable Resources

```csharp
// ❌ BAD: Not disposing
var client = new HttpClient();
var result = await client.GetAsync(url);
// HttpClient never disposed!

// ✅ GOOD: Using statement
using var client = new HttpClient();
var result = await client.GetAsync(url);

// ✅ BETTER: IHttpClientFactory (for HttpClient)
public class OrderService
{
    private readonly HttpClient _httpClient;

    public OrderService(IHttpClientFactory factory)
    {
        _httpClient = factory.CreateClient("OrderApi");
    }
}
```

### 7. Thread Safety

```csharp
// ❌ BAD: Shared mutable state
public class OrderCounter
{
    private int _count;

    public void Increment() => _count++;  // Not thread-safe!
}

// ✅ GOOD: Interlocked
public class OrderCounter
{
    private int _count;

    public void Increment() => Interlocked.Increment(ref _count);
}

// ❌ BAD: Non-thread-safe collection
private List<Order> _orders = new();

public void Add(Order order) => _orders.Add(order);  // Not thread-safe!

// ✅ GOOD: Concurrent collection
private ConcurrentBag<Order> _orders = new();

public void Add(Order order) => _orders.Add(order);
```

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## Output Format

```
══════════════════════════════════════════════════════════════
CODE QUALITY ANALYSIS REPORT
══════════════════════════════════════════════════════════════

Project: {ProjectName}
Files Analyzed: {Count}
Analysis Date: {Date}

──────────────────────────────────────────────────────────────
ASYNC/AWAIT PATTERNS
──────────────────────────────────────────────────────────────

Issues Found: 3

[CRITICAL] Blocking call detected
  File: OrderService.cs:45
  Code: var result = GetOrderAsync().Result;
  Fix: Replace with 'await GetOrderAsync()'

[HIGH] Missing CancellationToken
  File: OrderRepository.cs:23
  Fix: Add CancellationToken parameter

[MEDIUM] async void method
  File: EventHandler.cs:12
  Fix: Change to async Task (unless event handler)

──────────────────────────────────────────────────────────────
LINQ PERFORMANCE
──────────────────────────────────────────────────────────────

Issues Found: 2

[HIGH] N+1 Query detected
  File: OrderController.cs:34-42
  Fix: Use Include() for eager loading

[MEDIUM] Multiple enumeration
  File: ReportService.cs:56
  Fix: Materialize with ToList() before reuse

──────────────────────────────────────────────────────────────
MEMORY MANAGEMENT
──────────────────────────────────────────────────────────────

Issues Found: 1

[MEDIUM] String concatenation in loop
  File: ExportService.cs:78
  Fix: Use StringBuilder instead

──────────────────────────────────────────────────────────────
EXCEPTION HANDLING
──────────────────────────────────────────────────────────────

Issues Found: 2

[CRITICAL] Empty catch block
  File: PaymentService.cs:92
  Fix: Log exception and handle appropriately

[HIGH] Catching generic Exception
  File: OrderProcessor.cs:67
  Fix: Catch specific exception types

──────────────────────────────────────────────────────────────
NULL SAFETY
──────────────────────────────────────────────────────────────

Issues Found: 4

[HIGH] Possible null reference
  File: CustomerService.cs:34
  Fix: Add null check or use null-conditional operator

──────────────────────────────────────────────────────────────
DISPOSABLE RESOURCES
──────────────────────────────────────────────────────────────

Issues Found: 1

[MEDIUM] HttpClient not disposed
  File: ExternalApiClient.cs:23
  Fix: Use IHttpClientFactory or using statement

──────────────────────────────────────────────────────────────
THREAD SAFETY
──────────────────────────────────────────────────────────────

Issues Found: 0

[✓] No thread safety issues detected

══════════════════════════════════════════════════════════════
SUMMARY
══════════════════════════════════════════════════════════════

Total Issues: 13
  Critical: 2
  High: 5
  Medium: 6
  Low: 0

Code Quality Score: 72/100

Priority Actions:
1. Fix blocking calls in OrderService.cs
2. Remove empty catch in PaymentService.cs
3. Fix N+1 query in OrderController.cs
4. Add null checks in CustomerService.cs
```

## Scoring Criteria

| Severity | Weight | Impact |
|----------|--------|--------|
| Critical | -15 pts | Deadlocks, data loss risk |
| High | -10 pts | Performance, reliability |
| Medium | -5 pts | Maintainability |
| Low | -2 pts | Code style |

Base score: 100, deduct per issue found.
