# Template: Domain Service

## When to Use a Domain Service?

A Domain Service contains business logic that:
- Doesn't naturally fit in any entity
- Operates on multiple entities
- Requires external dependencies (repositories, other services)

## Template

```python
# src/myproject/domain/services/[service_name]_service.py
"""
Business service for [description].

This service contains business logic for [functionality]
that cannot be placed in a single entity.
"""

from typing import Protocol
from uuid import UUID

from myproject.domain.entities.[entity] import [Entity]
from myproject.domain.repositories.[repository] import [Repository]
from myproject.domain.exceptions import [DomainException]


class [ServiceName]Service:
    """
    Business service for [detailed description].

    This service coordinates [which operations] while respecting
    following business rules:
    - [Business rule 1]
    - [Business rule 2]
    - [Business rule 3]

    Attributes:
        _repository: Repository to access [entities]

    Example:
        >>> service = [ServiceName]Service(repository)
        >>> result = service.[method_name](param1, param2)
    """

    def __init__(self, repository: [Repository]) -> None:
        """
        Initialize service.

        Args:
            repository: Repository for [description]
        """
        self._repository = repository

    def [method_name](
        self,
        param1: Type1,
        param2: Type2
    ) -> ReturnType:
        """
        [Description of what this method does].

        This method:
        1. [Step 1]
        2. [Step 2]
        3. [Step 3]

        Applied business rules:
        - [Rule 1]
        - [Rule 2]

        Args:
            param1: Description of parameter 1
            param2: Description of parameter 2

        Returns:
            Description of return value

        Raises:
            [DomainException]: If [condition]
            ValueError: If [condition]

        Example:
            >>> service.[method_name](value1, value2)
            result_value
        """
        # 1. Business rule validation
        self._validate_[rule_name](param1, param2)

        # 2. Retrieve necessary data
        entity = self._repository.find_by_id(param1)
        if not entity:
            raise [DomainException](f"[Entity] not found: {param1}")

        # 3. Apply business logic
        result = self._apply_[business_logic](entity, param2)

        # 4. Persist if necessary
        self._repository.save(entity)

        # 5. Return result
        return result
```

## Concrete Example: PricingService

[Complete pricing service example with discount rules]

## Unit Tests

[Test examples with mocks]

## Checklist

- [ ] Service name as `[Noun]Service` (e.g., PricingService, NotificationService)
- [ ] Complete docstring with Example
- [ ] Each public method documented
- [ ] Business rule validation
- [ ] No infrastructure dependency
- [ ] Dependencies injected via constructor
- [ ] Private methods prefixed with `_`
- [ ] Business exceptions (DomainException)
- [ ] Unit tests with mocks
- [ ] Coverage > 95%
