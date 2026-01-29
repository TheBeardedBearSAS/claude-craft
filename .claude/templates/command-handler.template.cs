// Application/Features/${Features}/Commands/${Action}${EntityName}/${Action}${EntityName}Command.cs
// Template for CQRS Command with Handler and Validator

namespace ${ProjectName}.Application.Features.${Features}.Commands.${Action}${EntityName};

/// <summary>
/// Command to ${action} a ${EntityName}.
/// </summary>
/// <param name="Id">The ${EntityName} identifier (for update/delete operations).</param>
/// <param name="Name">The ${EntityName} name.</param>
public record ${Action}${EntityName}Command(
    Guid? Id,
    string Name) : IRequest<${ReturnType}>;

/// <summary>
/// Handler for ${Action}${EntityName}Command.
/// </summary>
public class ${Action}${EntityName}CommandHandler : IRequestHandler<${Action}${EntityName}Command, ${ReturnType}>
{
    private readonly I${EntityName}Repository _${entityName}Repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<${Action}${EntityName}CommandHandler> _logger;

    public ${Action}${EntityName}CommandHandler(
        I${EntityName}Repository ${entityName}Repository,
        IUnitOfWork unitOfWork,
        ILogger<${Action}${EntityName}CommandHandler> logger)
    {
        _${entityName}Repository = ${entityName}Repository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<${ReturnType}> Handle(
        ${Action}${EntityName}Command request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "${Action}ing ${EntityName} with Id: {Id}",
            request.Id);

        // For Create operations
        var entity = ${EntityName}.Create(request.Name);

        // For Update operations (uncomment if needed)
        // var entity = await _${entityName}Repository.GetByIdAsync(request.Id!.Value, cancellationToken)
        //     ?? throw new NotFoundException(nameof(${EntityName}), request.Id!.Value);
        // entity.UpdateName(request.Name);

        await _${entityName}Repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "${EntityName} ${action}d successfully with Id: {Id}",
            entity.Id);

        return entity.Id;
    }
}

/// <summary>
/// Validator for ${Action}${EntityName}Command.
/// </summary>
public class ${Action}${EntityName}CommandValidator : AbstractValidator<${Action}${EntityName}Command>
{
    private readonly I${EntityName}Repository _${entityName}Repository;

    public ${Action}${EntityName}CommandValidator(I${EntityName}Repository ${entityName}Repository)
    {
        _${entityName}Repository = ${entityName}Repository;

        // For Update/Delete operations
        // RuleFor(x => x.Id)
        //     .NotEmpty()
        //     .WithMessage("${EntityName} ID is required");

        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required")
            .MaximumLength(200)
            .WithMessage("Name must not exceed 200 characters")
            .MustAsync(BeUniqueName)
            .WithMessage("A ${EntityName} with this name already exists");
    }

    private async Task<bool> BeUniqueName(
        ${Action}${EntityName}Command command,
        string name,
        CancellationToken cancellationToken)
    {
        // Check if name is unique (excluding current entity for updates)
        var existing = await _${entityName}Repository.GetByNameAsync(name, cancellationToken);

        if (existing is null)
            return true;

        // For updates, allow same name if it's the same entity
        return command.Id.HasValue && existing.Id == command.Id.Value;
    }
}
