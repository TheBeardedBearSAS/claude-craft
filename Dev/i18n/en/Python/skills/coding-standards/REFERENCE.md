# Rule 03: Coding Standards

## PEP 8 Compliance

Follow Python Enhancement Proposal 8 (PEP 8) for code style.

### Naming Conventions

```python
# Classes: PascalCase
class UserRepository:
    pass

# Functions and variables: snake_case
def calculate_total_price():
    user_count = 10

# Constants: UPPER_CASE
MAX_RETRY_ATTEMPTS = 3
DATABASE_URL = "postgresql://localhost/db"

# Private attributes: prefix with underscore
class BankAccount:
    def __init__(self):
        self._balance = 0  # Private

# Protected attributes: single underscore
class BaseRepository:
    def __init__(self):
        self._session = None  # Protected
```

### Code Formatting

- **Indentation**: 4 spaces (no tabs)
- **Line length**: Maximum 88 characters (Black standard)
- **Blank lines**:
  - 2 blank lines before top-level classes and functions
  - 1 blank line between methods in a class
- **Imports**:
  - Standard library
  - Third-party libraries
  - Local imports
  - Separated by blank lines

```python
# Standard library
import os
import sys
from datetime import datetime

# Third-party
from fastapi import FastAPI
from pydantic import BaseModel
import sqlalchemy

# Local
from myproject.domain.entities.user import User
from myproject.infrastructure.database import get_session
```

### Docstrings

Use Google style docstrings for all public modules, classes, and functions.

```python
def calculate_order_total(
    items: list[OrderItem],
    tax_rate: Decimal,
    discount: Optional[Decimal] = None
) -> Money:
    """
    Calculate the total amount of an order.

    Applies discounts and taxes according to business rules.
    The total cannot be negative.

    Args:
        items: List of items in the order
        tax_rate: Tax rate to apply (example: Decimal("0.20") for 20%)
        discount: Optional discount to apply (default: None)

    Returns:
        Total amount including taxes and discounts

    Raises:
        ValueError: If the list of items is empty
        ValueError: If the tax rate is negative

    Example:
        >>> items = [OrderItem(price=Money(100), quantity=2)]
        >>> total = calculate_order_total(items, Decimal("0.20"))
        >>> total.amount
        Decimal("240.00")
    """
    pass
```

## Type Hints

Type all function parameters and return values.

### Basic Types

```python
from typing import Optional, Union
from decimal import Decimal
from datetime import datetime

def process_user(
    user_id: str,
    age: int,
    balance: Decimal,
    created_at: datetime,
    is_active: bool = True
) -> dict[str, any]:
    """Process a user."""
    pass

# Optional (nullable)
def find_user(user_id: str) -> Optional[User]:
    """Returns User or None if not found."""
    pass

# Union (multiple possible types)
def parse_id(value: Union[str, int]) -> str:
    """Accepts str or int, returns str."""
    return str(value)

# Modern Python 3.10+ syntax
def parse_id(value: str | int) -> str:
    return str(value)
```

### Collections

```python
from collections.abc import Sequence, Mapping

# Lists
def process_users(users: list[User]) -> list[str]:
    return [u.email for u in users]

# Dicts
def get_config() -> dict[str, str]:
    return {"key": "value"}

# Tuples
def get_coordinates() -> tuple[float, float]:
    return (48.8566, 2.3522)

# Sets
def get_unique_tags() -> set[str]:
    return {"python", "fastapi"}

# Sequence (more generic than list)
def count_items(items: Sequence[str]) -> int:
    return len(items)
```

### Protocols and Interfaces

```python
from typing import Protocol

class Closeable(Protocol):
    """Protocol for closeable resources."""

    def close(self) -> None:
        """Close the resource."""
        ...

class Saveable(Protocol):
    """Protocol for saveable entities."""

    def save(self) -> None:
        """Save the entity."""
        ...

def cleanup_resource(resource: Closeable) -> None:
    """Close any closeable resource."""
    resource.close()
```

### Generics

```python
from typing import TypeVar, Generic

T = TypeVar('T')

class Repository(Generic[T]):
    """Generic repository."""

    def find_by_id(self, entity_id: str) -> Optional[T]:
        pass

    def save(self, entity: T) -> T:
        pass

# Usage
user_repo: Repository[User] = UserRepository()
product_repo: Repository[Product] = ProductRepository()
```

## Error Handling

### Specific Exceptions

Always catch and raise specific exceptions, not generic `Exception`.

```python
# ❌ Bad
try:
    result = risky_operation()
except Exception:
    pass  # Silently ignores all errors

# ✅ Good
try:
    result = risky_operation()
except FileNotFoundError as e:
    logger.error(f"File not found: {e}")
    raise
except PermissionError as e:
    logger.error(f"Permission denied: {e}")
    raise
```

### Custom Exceptions

Create custom exceptions for business domain.

```python
# domain/exceptions.py
class DomainException(Exception):
    """Base exception for domain errors."""
    pass

class UserNotFoundError(DomainException):
    """User not found."""

    def __init__(self, user_id: str):
        self.user_id = user_id
        super().__init__(f"User not found: {user_id}")

class InsufficientBalanceError(DomainException):
    """Insufficient balance for operation."""

    def __init__(self, required: Decimal, available: Decimal):
        self.required = required
        self.available = available
        super().__init__(
            f"Insufficient balance: required {required}, available {available}"
        )
```

### Context Managers

Use context managers for resource management.

```python
# ❌ Bad
file = open("data.txt")
content = file.read()
file.close()

# ✅ Good
with open("data.txt") as file:
    content = file.read()
# File automatically closed

# Custom context manager
from contextlib import contextmanager

@contextmanager
def database_transaction(session):
    """Context manager for database transaction."""
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# Usage
with database_transaction(session) as db:
    user = User(name="John")
    db.add(user)
# Automatically commits or rollback
```

## Documentation

### Module Docstrings

```python
"""
User management module.

This module contains user domain entities, value objects,
and business rules related to user management.

Classes:
    User: User domain entity
    Email: Email value object
    UserRole: User role enumeration

Example:
    >>> from myproject.domain.user import User, Email
    >>> user = User(name="John", email=Email("john@example.com"))
"""
```

### Inline Comments

Comment only the "why", not the "what".

```python
# ❌ Bad comment (explains what code does)
# Increment counter by 1
counter += 1

# ✅ Good comment (explains why)
# Compensate for zero-based indexing
counter += 1

# ✅ Good comment (explains business rule)
# According to GDPR, we keep user data for 3 years maximum
retention_days = 365 * 3
```

### TODOs and FIXMEs

Use standardized comments for pending work.

```python
# TODO: Implement caching for user queries
# TODO(john): Add support for batch operations
# FIXME: Handle case when API returns 429
# HACK: Temporary workaround until library fixes bug #123
# NOTE: This implementation is intentionally simplified
```

**Important**: TODOs should be tracked in the project's issue tracker.

## Code Organization

### File Structure

```
src/myproject/
├── domain/              # Domain layer (business logic)
│   ├── entities/        # Domain entities
│   ├── value_objects/   # Value objects
│   ├── repositories/    # Repository interfaces (ports)
│   ├── services/        # Domain services
│   └── exceptions.py    # Domain exceptions
│
├── application/         # Application layer (use cases)
│   ├── use_cases/       # Use cases / Application services
│   ├── dtos/           # Data Transfer Objects
│   └── commands/       # Commands
│
├── infrastructure/     # Infrastructure layer (external adapters)
│   ├── database/       # Database (SQLAlchemy, etc.)
│   ├── api/           # API (FastAPI, etc.)
│   ├── messaging/     # Message broker (RabbitMQ, etc.)
│   └── external/      # External services (HTTP clients, etc.)
│
└── config/            # Configuration
    ├── settings.py    # Application settings
    └── dependencies.py # Dependency injection
```

### Import Order

```python
# 1. Standard library
import os
import sys
from datetime import datetime
from typing import Optional

# 2. Third-party
from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy.orm import Session

# 3. Local application
from myproject.domain.entities.user import User
from myproject.domain.repositories.user_repository import UserRepository
from myproject.infrastructure.database.session import get_session
```

## Security Best Practices

### Never Hardcode Secrets

```python
# ❌ Never do this
API_KEY = "sk_live_abc123def456"
DATABASE_PASSWORD = "password123"

# ✅ Use environment variables
import os

API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise ValueError("API_KEY environment variable not set")
```

### Input Validation

Always validate user inputs with Pydantic.

```python
from pydantic import BaseModel, Field, validator

class CreateUserDTO(BaseModel):
    """DTO for creating a user."""

    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8)
    age: int = Field(..., ge=18, le=150)

    @validator('email')
    def validate_email(cls, v):
        """Validate email format."""
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower()

    @validator('password')
    def validate_password(cls, v):
        """Validate password strength."""
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        return v
```

### SQL Injection Prevention

Always use parameterized queries.

```python
# ❌ Vulnerable to SQL injection
def find_user(email: str):
    query = f"SELECT * FROM users WHERE email = '{email}'"
    return db.execute(query)

# ✅ Safe with parameterized query
def find_user(email: str):
    query = "SELECT * FROM users WHERE email = :email"
    return db.execute(query, {"email": email})

# ✅ Even better with ORM
def find_user(email: str):
    return session.query(User).filter(User.email == email).first()
```

## Logging

Use Python's `logging` module, not `print()`.

```python
import logging

logger = logging.getLogger(__name__)

# Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
logger.debug("Detailed information for debugging")
logger.info("General information")
logger.warning("Warning message")
logger.error("Error occurred")
logger.critical("Critical error")

# With context
logger.info(
    "User created successfully",
    extra={
        "user_id": user.id,
        "email": user.email,
        "request_id": request_id
    }
)

# Exception logging
try:
    risky_operation()
except Exception as e:
    logger.error("Operation failed", exc_info=True)
    raise
```

## Testing

Tests should also follow coding standards.

```python
# tests/unit/domain/test_user.py
import pytest
from myproject.domain.entities.user import User
from myproject.domain.exceptions import InvalidEmailError


class TestUser:
    """Tests for User entity."""

    def test_create_user_with_valid_data(self):
        """Test user creation with valid data."""
        # Arrange
        name = "John Doe"
        email = "john@example.com"

        # Act
        user = User(name=name, email=email)

        # Assert
        assert user.name == name
        assert user.email == email

    def test_create_user_with_invalid_email_raises_error(self):
        """Test that invalid email raises error."""
        # Act & Assert
        with pytest.raises(InvalidEmailError):
            User(name="John", email="invalid-email")
```

## Tools Configuration

### pyproject.toml

```toml
[tool.black]
line-length = 88
target-version = ['py312']
include = '\.pyi?$'

[tool.isort]
profile = "black"
line_length = 88
multi_line_output = 3

[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
```

## Checklist

Before committing:

- [ ] Code follows PEP 8
- [ ] All public functions have docstrings
- [ ] All parameters and returns are type-hinted
- [ ] No hardcoded secrets
- [ ] Exceptions are specific and well-handled
- [ ] Imports are organized
- [ ] `black` and `isort` applied
- [ ] `ruff` passes without errors
- [ ] `mypy` passes in strict mode
