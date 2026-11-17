---
description: Generate a complete feature with Clean Architecture structure
argument-hint: <FeatureName>
---

# Generate C#/.NET Feature

You are a C#/.NET architect. Generate a complete feature following Clean Architecture and CQRS patterns.

## Arguments

$ARGUMENTS

- `FeatureName`: Name of the feature to generate (e.g., "Order", "Customer", "Product")

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## Generation Process

### Step 1: Analyze Requirements

Ask if not clear:
- What is the primary entity for this feature?
- What operations are needed? (CRUD, specific business operations)
- What relationships exist with other entities?
- Are there specific validation rules?

### Step 2: Generate Domain Layer

**Entity:**

```csharp
// Domain/Entities/{Feature}.cs
namespace {Project}.Domain.Entities;

public class {Feature} : BaseEntity, IAggregateRoot
{
    private readonly List<{Feature}Item> _items = new();

    public string Name { get; private set; } = string.Empty;
    public {Feature}Status Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ModifiedAt { get; private set; }
    public IReadOnlyCollection<{Feature}Item> Items => _items.AsReadOnly();

    private {Feature}() { } // EF Core

    public static {Feature} Create(string name)
    {
        Guard.Against.NullOrWhiteSpace(name, nameof(name));

        var entity = new {Feature}
        {
            Id = Guid.NewGuid(),
            Name = name,
            Status = {Feature}Status.Draft,
            CreatedAt = DateTime.UtcNow
        };

        entity.AddDomainEvent(new {Feature}CreatedEvent(entity.Id));
        return entity;
    }

    public void UpdateName(string name)
    {
        Guard.Against.NullOrWhiteSpace(name, nameof(name));

        Name = name;
        ModifiedAt = DateTime.UtcNow;
        AddDomainEvent(new {Feature}UpdatedEvent(Id));
    }

    public void Activate()
    {
        if (Status == {Feature}Status.Active)
            return;

        Status = {Feature}Status.Active;
        ModifiedAt = DateTime.UtcNow;
        AddDomainEvent(new {Feature}ActivatedEvent(Id));
    }
}
```

**Repository Interface:**

```csharp
// Domain/Interfaces/I{Feature}Repository.cs
namespace {Project}.Domain.Interfaces;

public interface I{Feature}Repository
{
    Task<{Feature}?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<{Feature}>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync({Feature} entity, CancellationToken cancellationToken = default);
    Task UpdateAsync({Feature} entity, CancellationToken cancellationToken = default);
    Task DeleteAsync({Feature} entity, CancellationToken cancellationToken = default);
}
```

### Step 3: Generate Application Layer

**DTO:**

```csharp
// Application/Features/{Features}/Models/{Feature}Dto.cs
namespace {Project}.Application.Features.{Features}.Models;

public record {Feature}Dto(
    Guid Id,
    string Name,
    string Status,
    DateTime CreatedAt,
    DateTime? ModifiedAt);
```

**Create Command:**

```csharp
// Application/Features/{Features}/Commands/Create{Feature}/Create{Feature}Command.cs
namespace {Project}.Application.Features.{Features}.Commands.Create{Feature};

public record Create{Feature}Command(string Name) : IRequest<Guid>;

// Handler
public class Create{Feature}CommandHandler : IRequestHandler<Create{Feature}Command, Guid>
{
    private readonly I{Feature}Repository _{feature}Repository;
    private readonly IUnitOfWork _unitOfWork;

    public Create{Feature}CommandHandler(
        I{Feature}Repository {feature}Repository,
        IUnitOfWork unitOfWork)
    {
        _{feature}Repository = {feature}Repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(Create{Feature}Command request, CancellationToken cancellationToken)
    {
        var entity = {Feature}.Create(request.Name);

        await _{feature}Repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}

// Validator
public class Create{Feature}CommandValidator : AbstractValidator<Create{Feature}Command>
{
    public Create{Feature}CommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters");
    }
}
```

**Update Command:**

```csharp
// Application/Features/{Features}/Commands/Update{Feature}/Update{Feature}Command.cs
namespace {Project}.Application.Features.{Features}.Commands.Update{Feature};

public record Update{Feature}Command(Guid Id, string Name) : IRequest;

public class Update{Feature}CommandHandler : IRequestHandler<Update{Feature}Command>
{
    private readonly I{Feature}Repository _{feature}Repository;
    private readonly IUnitOfWork _unitOfWork;

    public Update{Feature}CommandHandler(
        I{Feature}Repository {feature}Repository,
        IUnitOfWork unitOfWork)
    {
        _{feature}Repository = {feature}Repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(Update{Feature}Command request, CancellationToken cancellationToken)
    {
        var entity = await _{feature}Repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof({Feature}), request.Id);

        entity.UpdateName(request.Name);

        await _{feature}Repository.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
```

**Delete Command:**

```csharp
// Application/Features/{Features}/Commands/Delete{Feature}/Delete{Feature}Command.cs
namespace {Project}.Application.Features.{Features}.Commands.Delete{Feature};

public record Delete{Feature}Command(Guid Id) : IRequest;

public class Delete{Feature}CommandHandler : IRequestHandler<Delete{Feature}Command>
{
    private readonly I{Feature}Repository _{feature}Repository;
    private readonly IUnitOfWork _unitOfWork;

    public Delete{Feature}CommandHandler(
        I{Feature}Repository {feature}Repository,
        IUnitOfWork unitOfWork)
    {
        _{feature}Repository = {feature}Repository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(Delete{Feature}Command request, CancellationToken cancellationToken)
    {
        var entity = await _{feature}Repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof({Feature}), request.Id);

        await _{feature}Repository.DeleteAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
```

**Get By Id Query:**

```csharp
// Application/Features/{Features}/Queries/Get{Feature}ById/Get{Feature}ByIdQuery.cs
namespace {Project}.Application.Features.{Features}.Queries.Get{Feature}ById;

public record Get{Feature}ByIdQuery(Guid Id) : IRequest<{Feature}Dto?>;

public class Get{Feature}ByIdQueryHandler : IRequestHandler<Get{Feature}ByIdQuery, {Feature}Dto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public Get{Feature}ByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<{Feature}Dto?> Handle(Get{Feature}ByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.{Features}
            .AsNoTracking()
            .Where(x => x.Id == request.Id)
            .ProjectTo<{Feature}Dto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
```

**Get All Query:**

```csharp
// Application/Features/{Features}/Queries/GetAll{Features}/GetAll{Features}Query.cs
namespace {Project}.Application.Features.{Features}.Queries.GetAll{Features};

public record GetAll{Features}Query : IRequest<IReadOnlyList<{Feature}Dto>>;

public class GetAll{Features}QueryHandler : IRequestHandler<GetAll{Features}Query, IReadOnlyList<{Feature}Dto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAll{Features}QueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<{Feature}Dto>> Handle(
        GetAll{Features}Query request,
        CancellationToken cancellationToken)
    {
        return await _context.{Features}
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<{Feature}Dto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
```

### Step 4: Generate Infrastructure Layer

**EF Configuration:**

```csharp
// Infrastructure/Data/Configurations/{Feature}Configuration.cs
namespace {Project}.Infrastructure.Data.Configurations;

public class {Feature}Configuration : IEntityTypeConfiguration<{Feature}>
{
    public void Configure(EntityTypeBuilder<{Feature}> builder)
    {
        builder.ToTable("{Features}");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasIndex(x => x.Name);
        builder.HasIndex(x => x.CreatedAt);
    }
}
```

**Repository:**

```csharp
// Infrastructure/Data/Repositories/{Feature}Repository.cs
namespace {Project}.Infrastructure.Data.Repositories;

public class {Feature}Repository : I{Feature}Repository
{
    private readonly ApplicationDbContext _context;

    public {Feature}Repository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<{Feature}?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.{Features}
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<{Feature}>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.{Features}
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync({Feature} entity, CancellationToken cancellationToken = default)
    {
        await _context.{Features}.AddAsync(entity, cancellationToken);
    }

    public Task UpdateAsync({Feature} entity, CancellationToken cancellationToken = default)
    {
        _context.{Features}.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync({Feature} entity, CancellationToken cancellationToken = default)
    {
        _context.{Features}.Remove(entity);
        return Task.CompletedTask;
    }
}
```

### Step 5: Generate WebAPI Layer

**Minimal API Endpoints:**

```csharp
// WebAPI/Endpoints/{Feature}Endpoints.cs
namespace {Project}.WebAPI.Endpoints;

public static class {Feature}Endpoints
{
    public static void Map{Feature}Endpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/{features}")
            .WithTags("{Features}")
            .RequireAuthorization();

        group.MapGet("/", GetAll)
            .WithName("GetAll{Features}")
            .Produces<IReadOnlyList<{Feature}Dto>>(StatusCodes.Status200OK);

        group.MapGet("/{id:guid}", GetById)
            .WithName("Get{Feature}ById")
            .Produces<{Feature}Dto>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("/", Create)
            .WithName("Create{Feature}")
            .Produces<Guid>(StatusCodes.Status201Created)
            .ProducesValidationProblem();

        group.MapPut("/{id:guid}", Update)
            .WithName("Update{Feature}")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", Delete)
            .WithName("Delete{Feature}")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> GetAll(ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetAll{Features}Query(), ct);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetById(Guid id, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new Get{Feature}ByIdQuery(id), ct);
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    private static async Task<IResult> Create(Create{Feature}Command command, ISender sender, CancellationToken ct)
    {
        var id = await sender.Send(command, ct);
        return TypedResults.CreatedAtRoute("Get{Feature}ById", new { id }, id);
    }

    private static async Task<IResult> Update(Guid id, Update{Feature}Command command, ISender sender, CancellationToken ct)
    {
        if (id != command.Id)
            return TypedResults.BadRequest();

        await sender.Send(command, ct);
        return TypedResults.NoContent();
    }

    private static async Task<IResult> Delete(Guid id, ISender sender, CancellationToken ct)
    {
        await sender.Send(new Delete{Feature}Command(id), ct);
        return TypedResults.NoContent();
    }
}
```

### Step 6: Generate Tests

```csharp
// Tests/Application.UnitTests/Features/{Features}/Commands/Create{Feature}CommandTests.cs
public class Create{Feature}CommandTests
{
    private readonly Mock<I{Feature}Repository> _repositoryMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    [Fact]
    public async Task Handle_ValidCommand_Returns{Feature}Id()
    {
        // Arrange
        var handler = new Create{Feature}CommandHandler(
            _repositoryMock.Object,
            _unitOfWorkMock.Object);

        var command = new Create{Feature}Command("Test Name");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeEmpty();
        _repositoryMock.Verify(
            x => x.AddAsync(It.IsAny<{Feature}>(), It.IsAny<CancellationToken>()),
            Times.Once);
        _unitOfWorkMock.Verify(
            x => x.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
```

## Output

Generate all files and provide:
1. List of created files
2. DI registration code to add
3. Migration command to run
4. Endpoint routes summary
