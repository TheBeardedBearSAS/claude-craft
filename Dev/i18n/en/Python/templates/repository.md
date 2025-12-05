# Template: Repository Pattern

## Repository Pattern

The Repository pattern:
- Abstracts data access
- Separates domain from infrastructure
- Allows changing DB without affecting domain
- Facilitates testing (mocks)

## Structure

1. **Interface (Protocol)** in `domain/repositories/`
2. **Implementation** in `infrastructure/database/repositories/`
3. **ORM Model** in `infrastructure/database/models/`

## Template: Interface (Domain)

```python
# src/myproject/domain/repositories/[entity]_repository.py
"""Interface for [Entity] repository."""

from typing import Optional, Protocol
from uuid import UUID

from myproject.domain.entities.[entity] import [Entity]


class [Entity]Repository(Protocol):
    """
    Port (interface) for [Entity] repository.

    The domain defines the contract, infrastructure provides implementation.
    Uses Protocol (PEP 544) for structural subtyping.

    This interface defines all persistence operations
    for [Entity] entity.
    """

    def save(self, entity: [Entity]) -> [Entity]:
        """
        Save a [entity].

        Creates new [entity] or updates existing one.

        Args:
            entity: The [entity] to save

        Returns:
            Saved [entity] (with generated ID if new)

        Raises:
            RepositoryError: If save fails
        """
        ...

    def find_by_id(self, entity_id: UUID) -> Optional[[Entity]]:
        """
        Find [entity] by ID.

        Args:
            entity_id: The [entity] ID

        Returns:
            Found [entity] or None if not found
        """
        ...

    def find_all(self) -> list[[Entity]]:
        """
        Retrieve all [entities].

        Returns:
            List of all [entities]
        """
        ...

    def delete(self, entity_id: UUID) -> None:
        """
        Delete [entity].

        Args:
            entity_id: The [entity] ID to delete

        Raises:
            RepositoryError: If deletion fails
            [Entity]NotFoundError: If [entity] doesn't exist
        """
        ...
```

## Template: Implementation (Infrastructure)

[Complete repository implementation with SQLAlchemy]

## Template: ORM Model

[SQLAlchemy model with proper columns, indexes, timestamps]

## Concrete Example: UserRepository

[Complete working example with User entity]

## Tests

[Unit and integration test examples]

## Checklist

- [ ] Interface (Protocol) in domain/repositories/
- [ ] Implementation in infrastructure/database/repositories/
- [ ] ORM Model in infrastructure/database/models/
- [ ] Base CRUD methods (save, find_by_id, find_all, delete)
- [ ] Entity-specific search methods
- [ ] Entity <-> model conversion in private methods
- [ ] Error handling with try/catch
- [ ] Rollback on error
- [ ] Unit tests with mocks
- [ ] Integration tests with real DB
- [ ] Complete docstrings
