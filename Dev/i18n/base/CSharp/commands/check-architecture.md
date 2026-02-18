---
description: Validate Clean Architecture implementation in C#/.NET project
---

# C#/.NET Architecture Check

You are a Clean Architecture expert for .NET. Analyze the project's architectural compliance with a focus on layer separation, dependency direction, and design patterns.

## Analysis Process

### Step 1: Project Structure Analysis

Identify the solution structure:

```bash
# Find all .csproj files
find . -name "*.csproj" -type f

# Check project references
dotnet list reference
```

**Expected Clean Architecture structure:**

```
src/
├── {Project}.Domain/
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Events/
│   ├── Exceptions/
│   └── Interfaces/
│
├── {Project}.Application/
│   ├── Common/
│   │   ├── Behaviors/
│   │   ├── Interfaces/
│   │   ├── Mappings/
│   │   └── Models/
│   ├── Features/
│   │   └── {Feature}/
│   │       ├── Commands/
│   │       └── Queries/
│   └── DependencyInjection.cs
│
├── {Project}.Infrastructure/
│   ├── Data/
│   │   ├── Configurations/
│   │   ├── Migrations/
│   │   └── Repositories/
│   ├── Identity/
│   ├── Services/
│   └── DependencyInjection.cs
│
└── {Project}.WebAPI/
    ├── Controllers/ or Endpoints/
    ├── Filters/
    ├── Middleware/
    └── Program.cs
```

### Step 2: Dependency Direction Validation

Verify the dependency rule is respected:

```
┌─────────────────────────────────────────────────────┐
│                      WebAPI                          │
│              (Presentation Layer)                    │
└────────────────────────┬────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────┐
│                   Infrastructure                     │
│              (External Concerns)                     │
└────────────────────────┬────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────┐
│                    Application                       │
│               (Use Cases, CQRS)                      │
└────────────────────────┬────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────┐
│                      Domain                          │
│        (Entities, Value Objects, Interfaces)         │
└─────────────────────────────────────────────────────┘
```

**Check for violations:**
- [ ] Domain references ANY other project
- [ ] Application references Infrastructure
- [ ] Circular references between projects

### Step 3: Domain Layer Analysis

**Entities:**
```csharp
// CORRECT: Rich domain model
public class Order : BaseEntity, IAggregateRoot
{
    private readonly List<OrderItem> _items = new();

    public OrderStatus Status { get; private set; }
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    public void AddItem(Product product, int quantity) { ... }
}

// INCORRECT: Anemic domain model
public class Order
{
    public Guid Id { get; set; }
    public List<OrderItem> Items { get; set; }  // Public setter!
}
```

**Value Objects:**
```csharp
// CORRECT: Immutable value object
public sealed class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    private Money(decimal amount, string currency) { ... }
    public static Money Create(decimal amount, string currency) { ... }
}

// INCORRECT: Mutable value
public class Money
{
    public decimal Amount { get; set; }  // Should be immutable!
}
```

### Step 4: Application Layer Analysis

**CQRS Pattern:**
```csharp
// Commands (Write operations)
public record CreateOrderCommand(Guid CustomerId) : IRequest<Guid>;
public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid> { }
public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand> { }

// Queries (Read operations)
public record GetOrderByIdQuery(Guid Id) : IRequest<OrderDto?>;
public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto?> { }
```

**Check:**
- [ ] Commands and Queries are separated
- [ ] Each handler has a single responsibility
- [ ] Validators exist for commands
- [ ] DTOs used instead of entities

### Step 5: Infrastructure Layer Analysis

**Repository Pattern:**
```csharp
// Interface in Domain
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Order order, CancellationToken ct = default);
}

// Implementation in Infrastructure
public class OrderRepository : IOrderRepository
{
    private readonly ApplicationDbContext _context;
    // ...
}
```

**Check:**
- [ ] Interfaces defined in Domain/Application
- [ ] Implementations in Infrastructure
- [ ] DbContext not leaked outside Infrastructure

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## Output Format

```
══════════════════════════════════════════════════════════════
CLEAN ARCHITECTURE ANALYSIS REPORT
══════════════════════════════════════════════════════════════

Solution: {SolutionName}
Projects: {Count}

──────────────────────────────────────────────────────────────
PROJECT STRUCTURE
──────────────────────────────────────────────────────────────

[✓] Domain project exists
[✓] Application project exists
[✓] Infrastructure project exists
[✓] WebAPI project exists

──────────────────────────────────────────────────────────────
DEPENDENCY DIRECTION
──────────────────────────────────────────────────────────────

Domain → (none)                    [✓] PASS
Application → Domain               [✓] PASS
Infrastructure → Application       [✓] PASS
Infrastructure → Domain            [✓] PASS
WebAPI → Application               [✓] PASS
WebAPI → Infrastructure            [✓] PASS

Violations Found: 0

──────────────────────────────────────────────────────────────
DOMAIN LAYER
──────────────────────────────────────────────────────────────

Entities:
  [✓] Order - Rich domain model with private setters
  [✓] Customer - Proper encapsulation
  [✗] Product - Has public setter for Price
      → Fix: Change to private set with method

Value Objects:
  [✓] Money - Immutable, proper equality
  [✗] Address - Missing GetEqualityComponents
      → Fix: Override equality comparison

Aggregate Roots:
  [✓] Order marked as IAggregateRoot
  [✗] Customer not marked
      → Fix: Implement IAggregateRoot interface

Score: 75/100

──────────────────────────────────────────────────────────────
APPLICATION LAYER
──────────────────────────────────────────────────────────────

CQRS Implementation:
  Commands: 8 found
  Queries: 6 found
  [✓] Proper separation

Handlers:
  [✓] CreateOrderCommandHandler
  [✗] UpdateOrderCommandHandler - Too many responsibilities
      → Fix: Split into smaller handlers

Validators:
  [✓] CreateOrderCommandValidator
  [✓] UpdateOrderCommandValidator
  [✗] DeleteOrderCommand - Missing validator
      → Fix: Add DeleteOrderCommandValidator

Score: 85/100

──────────────────────────────────────────────────────────────
INFRASTRUCTURE LAYER
──────────────────────────────────────────────────────────────

Repositories:
  [✓] IOrderRepository → OrderRepository
  [✓] ICustomerRepository → CustomerRepository

EF Core Configuration:
  [✓] Separate configuration files
  [✓] Fluent API used
  [✗] OrderItemConfiguration missing
      → Fix: Add IEntityTypeConfiguration<OrderItem>

External Services:
  [✓] IEmailService → EmailService
  [✓] Proper interface abstraction

Score: 90/100

══════════════════════════════════════════════════════════════
ARCHITECTURE SCORE: 83/100
══════════════════════════════════════════════════════════════

Recommendations:
1. Add IAggregateRoot marker to Customer entity
2. Make Product.Price immutable
3. Add missing validator for DeleteOrderCommand
4. Add EF configuration for OrderItem
```

## Scoring Criteria

| Area | Weight | Criteria |
|------|--------|----------|
| Project Structure | 20% | Correct layer organization |
| Dependency Direction | 25% | No violations, proper flow |
| Domain Layer | 25% | Rich models, immutability, DDD patterns |
| Application Layer | 15% | CQRS, validators, DTOs |
| Infrastructure Layer | 15% | Repository pattern, abstractions |
