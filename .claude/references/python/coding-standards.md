# Rule 03: Coding Standards

> **Version de référence :** Python **3.14 (stable, 3.14.6+)** — Python 3.15 en beta (release oct. 2026).
> FastAPI **~0.136.x** (0.136.3 au 2026-05) — Python 3.10+ minimum, Pydantic v2 obligatoire.
> Pydantic **>=2.9, 2.13.x recommandé** — Pydantic v1 incompatible avec Python 3.14.

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
    discount: Decimal | None = None  # 3.14+ : préférer X | None à Optional[X]
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

> **Python 3.14+ — syntaxe recommandée :**
> - `X | None` à la place de `Optional[X]` (plus concis, aucun import nécessaire)
> - `X | Y` à la place de `Union[X, Y]`
> - Ces deux formes sont équivalentes à l'exécution depuis Python 3.10 ; la syntaxe `|` est le standard 3.14+.
> - `from typing import Optional, Union` reste valide pour la compatibilité 3.9 et en code legacy.

```python
# Python 3.14+ — syntaxe recommandée (pas d'import Optional/Union)
from decimal import Decimal
from datetime import datetime

def process_user(
    user_id: str,
    age: int,
    balance: Decimal,
    created_at: datetime,
    is_active: bool = True
) -> dict[str, object]:
    """Process a user."""
    pass

# Optional (nullable) — 3.14+
def find_user(user_id: str) -> User | None:
    """Returns User or None if not found."""
    pass

# Union — 3.14+
def parse_id(value: str | int) -> str:
    """Accepts str or int, returns str."""
    return str(value)

# Compat note : si le projet doit supporter Python 3.9, conserver
# from typing import Optional, Union  et utiliser Optional[X] / Union[X, Y]
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

> **Python 3.14+ — syntaxe PEP 695 (recommandée) :** `class Foo[T]:` et `type Alias = ...`
> sans importer `TypeVar` ni `Generic`. La syntaxe `TypeVar`/`Generic` reste valide pour
> la compatibilité ≤ 3.11.

```python
# Python 3.14+ — PEP 695 (sans TypeVar / Generic)
class Repository[T]:
    """Generic repository."""

    def find_by_id(self, entity_id: str) -> T | None:
        pass

    def save(self, entity: T) -> T:
        pass

# Alias de type PEP 695
type UserId = str
type EntityId = str | int

# Usage
user_repo: Repository[User] = UserRepository()
product_repo: Repository[Product] = ProductRepository()

# --- Compat Python ≤ 3.11 : conserver l'ancienne syntaxe ---
# from typing import TypeVar, Generic
# T = TypeVar('T')
# class Repository(Generic[T]): ...
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
from pydantic import BaseModel, Field, field_validator

class CreateUserDTO(BaseModel):
    """DTO for creating a user."""

    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8)
    age: int = Field(..., ge=18, le=150)

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate email format."""
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower()

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
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
# [tool.black] — legacy, remplacé par [tool.ruff.format]
# [tool.isort] — legacy, remplacé par [tool.ruff.lint.isort]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
line-ending = "auto"

[tool.ruff.lint.isort]
known-first-party = ["src", "app"]
combine-as-imports = true

[tool.mypy]
python_version = "3.14"
strict = true
warn_return_any = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
```

## Python 3.14 — Nouveautés Clés

### Free-threading (PEP 703)

Interpréteur sans GIL **officiellement supporté (opt-in)** depuis Python 3.14. Le flag
`--disable-gil` est un flag de **compilation** de CPython — il ne s'utilise pas à l'invocation.

```bash
# Installer l'interpréteur free-threaded via uv (recommandé)
uv python install 3.14t
uv venv --python 3.14t
source .venv/bin/activate

# Ou via le binaire dédié (si installé séparément)
python3.14t script.py
```

Utile pour les workloads CPU-bound multi-threaded. Les extensions C tierces doivent être adaptées.

### Template Strings (PEP 750)

Nouveau type `Template` pour les interpolations structurées (distinct des f-strings).
Le module est `string.templatelib` ; les parties d'un Template sont accessibles par itération
(chaque élément est soit un `str` statique, soit un `Interpolation`).

```python
from string.templatelib import Template, Interpolation

def html_escape(t: Template) -> str:
    """Rend un t-string en HTML en échappant les interpolations."""
    import html
    parts = []
    for part in t:
        if isinstance(part, Interpolation):
            parts.append(html.escape(str(part.value)))
        else:
            parts.append(part)
    return "".join(parts)

user_input = "<script>alert('xss')</script>"
result = html_escape(t"<p>Bonjour {user_input}</p>")
# → "<p>Bonjour &lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;</p>"

# Accès aux parties du Template
tmpl = t"Hello {user_input!s}!"
# tmpl.strings      → ('Hello ', '!')            — parties statiques
# tmpl.interpolations → (Interpolation(...),)    — parties dynamiques
# for part in tmpl: ...                          — itère str et Interpolation
```

### Évaluation différée des annotations (PEP 649 / PEP 749)

Les annotations ne sont plus évaluées à la définition de la classe — résout les imports circulaires
de type hints sans recourir à `from __future__ import annotations`.

> **`from __future__ import annotations` (PEP 563) reste fonctionnel en Python 3.14.**
> Son retrait définitif est planifié après 2029 (PEP 749 remplace PEP 563 mais la transition
> est progressive). Il est donc sûr de continuer à l'utiliser pour la compatibilité ≤ 3.9.
> En Python 3.14+, préférer la nouvelle sémantique native (PEP 649) ; `from __future__ import
> annotations` n'est plus nécessaire dans les nouveaux modules ciblant 3.10+.

> **Python 3.15 beta 2 (feature-freeze, release oct. 2026) :** anticiper la migration.
> Surveiller les breaking changes potentiels : `__future__.annotations` obsolescence progressive,
> `concurrent.interpreters` API stabilisée, et renforcement du free-threading opt-in → opt-out.

### `concurrent.interpreters` (stdlib)

> **⚠️ API early-stage en Python 3.14 — ne pas utiliser en production.**
> `concurrent.interpreters` est une API expérimentale en 3.14 : l'interface publique, les canaux
> de communication et la sémantique de sérialisation sont susceptibles de changer dans 3.15/3.16.
> **En production, préférer `threading` (I/O-bound) ou `multiprocessing` (CPU-bound).**
> Réserver `concurrent.interpreters` aux prototypes et à l'exploration des sous-interpréteurs.

```python
# Prototype uniquement — API instable en 3.14
import concurrent.interpreters
interp = concurrent.interpreters.create()
```

### JIT (PEP 744) — expérimental, désactivé par défaut

> **⚠ Avertissement :** le JIT est expérimental (PEP 744), désactivé par défaut, et sujet à réévaluation par le Python Steering Council avant Python 3.15 (oct. 2026). Ne pas en dépendre en production.

Compilation JIT activable : `PYTHON_JIT=1 python script.py`. Gains observés sur boucles intensives en benchmarks isolés — non représentatifs en charge réelle.

---

## Checklist

Before committing:

- [ ] Code follows PEP 8
- [ ] All public functions have docstrings
- [ ] All parameters and returns are type-hinted
- [ ] No hardcoded secrets
- [ ] Exceptions are specific and well-handled
- [ ] Imports are organized
- [ ] `ruff format` applied (remplace black + isort)
- [ ] `ruff check` passes without errors
- [ ] `mypy` passes in strict mode (v2.0+)
