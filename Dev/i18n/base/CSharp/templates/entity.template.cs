// Domain/Entities/${EntityName}.cs
// Template for Clean Architecture entity with rich domain model

namespace ${ProjectName}.Domain.Entities;

/// <summary>
/// Represents a ${EntityName} aggregate root.
/// </summary>
public class ${EntityName} : BaseEntity, IAggregateRoot
{
    private readonly List<${EntityName}Item> _items = new();

    /// <summary>
    /// Gets the name of the ${EntityName}.
    /// </summary>
    public string Name { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the current status.
    /// </summary>
    public ${EntityName}Status Status { get; private set; }

    /// <summary>
    /// Gets the creation timestamp.
    /// </summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>
    /// Gets the last modification timestamp.
    /// </summary>
    public DateTime? ModifiedAt { get; private set; }

    /// <summary>
    /// Gets the collection of items (read-only).
    /// </summary>
    public IReadOnlyCollection<${EntityName}Item> Items => _items.AsReadOnly();

    /// <summary>
    /// EF Core constructor (private to enforce factory pattern).
    /// </summary>
    private ${EntityName}() { }

    /// <summary>
    /// Creates a new ${EntityName} instance.
    /// </summary>
    /// <param name="name">The name of the ${EntityName}.</param>
    /// <returns>A new ${EntityName} instance.</returns>
    /// <exception cref="ArgumentException">Thrown when name is null or empty.</exception>
    public static ${EntityName} Create(string name)
    {
        Guard.Against.NullOrWhiteSpace(name, nameof(name));

        var entity = new ${EntityName}
        {
            Id = Guid.NewGuid(),
            Name = name,
            Status = ${EntityName}Status.Draft,
            CreatedAt = DateTime.UtcNow
        };

        entity.AddDomainEvent(new ${EntityName}CreatedEvent(entity.Id));
        return entity;
    }

    /// <summary>
    /// Updates the name of the ${EntityName}.
    /// </summary>
    /// <param name="name">The new name.</param>
    /// <exception cref="ArgumentException">Thrown when name is null or empty.</exception>
    public void UpdateName(string name)
    {
        Guard.Against.NullOrWhiteSpace(name, nameof(name));

        if (Name == name)
            return;

        Name = name;
        ModifiedAt = DateTime.UtcNow;
        AddDomainEvent(new ${EntityName}UpdatedEvent(Id));
    }

    /// <summary>
    /// Activates the ${EntityName}.
    /// </summary>
    /// <exception cref="InvalidOperationException">Thrown when ${EntityName} cannot be activated.</exception>
    public void Activate()
    {
        if (Status == ${EntityName}Status.Active)
            return;

        if (Status == ${EntityName}Status.Cancelled)
            throw new InvalidOperationException("Cannot activate a cancelled ${EntityName}");

        Status = ${EntityName}Status.Active;
        ModifiedAt = DateTime.UtcNow;
        AddDomainEvent(new ${EntityName}ActivatedEvent(Id));
    }

    /// <summary>
    /// Cancels the ${EntityName}.
    /// </summary>
    /// <exception cref="InvalidOperationException">Thrown when ${EntityName} cannot be cancelled.</exception>
    public void Cancel()
    {
        if (Status == ${EntityName}Status.Cancelled)
            return;

        Status = ${EntityName}Status.Cancelled;
        ModifiedAt = DateTime.UtcNow;
        AddDomainEvent(new ${EntityName}CancelledEvent(Id));
    }

    /// <summary>
    /// Adds an item to the ${EntityName}.
    /// </summary>
    /// <param name="itemId">The item identifier.</param>
    /// <param name="quantity">The quantity.</param>
    public void AddItem(Guid itemId, int quantity)
    {
        Guard.Against.NegativeOrZero(quantity, nameof(quantity));

        var existingItem = _items.FirstOrDefault(i => i.ItemId == itemId);
        if (existingItem is not null)
        {
            existingItem.IncreaseQuantity(quantity);
        }
        else
        {
            _items.Add(new ${EntityName}Item(itemId, quantity));
        }

        ModifiedAt = DateTime.UtcNow;
    }

    /// <summary>
    /// Removes an item from the ${EntityName}.
    /// </summary>
    /// <param name="itemId">The item identifier.</param>
    public void RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.ItemId == itemId);
        if (item is null)
            return;

        _items.Remove(item);
        ModifiedAt = DateTime.UtcNow;
    }
}

/// <summary>
/// Status enumeration for ${EntityName}.
/// </summary>
public enum ${EntityName}Status
{
    Draft,
    Active,
    Completed,
    Cancelled
}
