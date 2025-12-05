# Regel 03: Codierungsstandards

## PEP 8-Konformität

Folgen Sie Python Enhancement Proposal 8 (PEP 8) für den Code-Stil.

### Namenskonventionen

```python
# Klassen: PascalCase
class UserRepository:
    pass

# Funktionen und Variablen: snake_case
def calculate_total_price():
    user_count = 10

# Konstanten: UPPER_CASE
MAX_RETRY_ATTEMPTS = 3
DATABASE_URL = "postgresql://localhost/db"

# Private Attribute: Mit Unterstrich beginnen
class BankAccount:
    def __init__(self):
        self._balance = 0  # Privat

# Geschützte Attribute: Einfacher Unterstrich
class BaseRepository:
    def __init__(self):
        self._session = None  # Geschützt
```

### Code-Formatierung

- **Einrückung**: 4 Leerzeichen (keine Tabs)
- **Zeilenlänge**: Maximal 88 Zeichen (Black-Standard)
- **Leerzeilen**:
  - 2 Leerzeilen vor Klassen und Funktionen auf oberster Ebene
  - 1 Leerzeile zwischen Methoden in einer Klasse
- **Imports**:
  - Standardbibliothek
  - Drittanbieter-Bibliotheken
  - Lokale Imports
  - Durch Leerzeilen getrennt

```python
# Standardbibliothek
import os
import sys
from datetime import datetime

# Drittanbieter
from fastapi import FastAPI
from pydantic import BaseModel
import sqlalchemy

# Lokal
from myproject.domain.entities.user import User
from myproject.infrastructure.database import get_session
```

### Docstrings

Verwenden Sie Google-Stil-Docstrings für alle öffentlichen Module, Klassen und Funktionen.

```python
def calculate_order_total(
    items: list[OrderItem],
    tax_rate: Decimal,
    discount: Optional[Decimal] = None
) -> Money:
    """
    Berechnet den Gesamtbetrag einer Bestellung.

    Wendet Rabatte und Steuern gemäß Geschäftsregeln an.
    Der Gesamtbetrag kann nicht negativ sein.

    Args:
        items: Liste der Artikel in der Bestellung
        tax_rate: Anzuwendender Steuersatz (Beispiel: Decimal("0.20") für 20%)
        discount: Optionaler Rabatt (Standard: None)

    Returns:
        Gesamtbetrag einschließlich Steuern und Rabatten

    Raises:
        ValueError: Wenn die Artikelliste leer ist
        ValueError: Wenn der Steuersatz negativ ist

    Example:
        >>> items = [OrderItem(price=Money(100), quantity=2)]
        >>> total = calculate_order_total(items, Decimal("0.20"))
        >>> total.amount
        Decimal("240.00")
    """
    pass
```

## Type Hints

Typisieren Sie alle Funktionsparameter und Rückgabewerte.

### Grundlegende Typen

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
    """Verarbeitet einen Benutzer."""
    pass

# Optional (nullable)
def find_user(user_id: str) -> Optional[User]:
    """Gibt User zurück oder None, wenn nicht gefunden."""
    pass

# Union (mehrere mögliche Typen)
def parse_id(value: Union[str, int]) -> str:
    """Akzeptiert str oder int, gibt str zurück."""
    return str(value)

# Moderne Python 3.10+ Syntax
def parse_id(value: str | int) -> str:
    return str(value)
```

### Collections

```python
from collections.abc import Sequence, Mapping

# Listen
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

# Sequence (generischer als list)
def count_items(items: Sequence[str]) -> int:
    return len(items)
```

### Protocols und Interfaces

```python
from typing import Protocol

class Closeable(Protocol):
    """Protokoll für schließbare Ressourcen."""

    def close(self) -> None:
        """Schließt die Ressource."""
        ...

class Saveable(Protocol):
    """Protokoll für speicherbare Entitäten."""

    def save(self) -> None:
        """Speichert die Entität."""
        ...

def cleanup_resource(resource: Closeable) -> None:
    """Schließt jede schließbare Ressource."""
    resource.close()
```

### Generics

```python
from typing import TypeVar, Generic

T = TypeVar('T')

class Repository(Generic[T]):
    """Generisches Repository."""

    def find_by_id(self, entity_id: str) -> Optional[T]:
        pass

    def save(self, entity: T) -> T:
        pass

# Verwendung
user_repo: Repository[User] = UserRepository()
product_repo: Repository[Product] = ProductRepository()
```

## Fehlerbehandlung

### Spezifische Exceptions

Fangen und werfen Sie immer spezifische Exceptions, nicht generisch `Exception`.

```python
# ❌ Schlecht
try:
    result = risky_operation()
except Exception:
    pass  # Ignoriert stillschweigend alle Fehler

# ✅ Gut
try:
    result = risky_operation()
except FileNotFoundError as e:
    logger.error(f"Datei nicht gefunden: {e}")
    raise
except PermissionError as e:
    logger.error(f"Berechtigung verweigert: {e}")
    raise
```

### Benutzerdefinierte Exceptions

Erstellen Sie benutzerdefinierte Exceptions für die Geschäftsdomäne.

```python
# domain/exceptions.py
class DomainException(Exception):
    """Basis-Exception für Domain-Fehler."""
    pass

class UserNotFoundError(DomainException):
    """Benutzer nicht gefunden."""

    def __init__(self, user_id: str):
        self.user_id = user_id
        super().__init__(f"Benutzer nicht gefunden: {user_id}")

class InsufficientBalanceError(DomainException):
    """Unzureichendes Guthaben für Operation."""

    def __init__(self, required: Decimal, available: Decimal):
        self.required = required
        self.available = available
        super().__init__(
            f"Unzureichendes Guthaben: erforderlich {required}, verfügbar {available}"
        )
```

### Context Managers

Verwenden Sie Context Manager für die Ressourcenverwaltung.

```python
# ❌ Schlecht
file = open("data.txt")
content = file.read()
file.close()

# ✅ Gut
with open("data.txt") as file:
    content = file.read()
# Datei wird automatisch geschlossen

# Benutzerdefinierter Context Manager
from contextlib import contextmanager

@contextmanager
def database_transaction(session):
    """Context Manager für Datenbanktransaktionen."""
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# Verwendung
with database_transaction(session) as db:
    user = User(name="John")
    db.add(user)
# Automatisches Commit oder Rollback
```

## Dokumentation

### Modul-Docstrings

```python
"""
Benutzerverwaltungsmodul.

Dieses Modul enthält Benutzer-Domain-Entitäten, Value Objects
und Geschäftsregeln im Zusammenhang mit der Benutzerverwaltung.

Classes:
    User: Benutzer-Domain-Entität
    Email: E-Mail-Value-Object
    UserRole: Benutzerrollen-Enumeration

Example:
    >>> from myproject.domain.user import User, Email
    >>> user = User(name="John", email=Email("john@example.com"))
"""
```

### Inline-Kommentare

Kommentieren Sie nur das "Warum", nicht das "Was".

```python
# ❌ Schlechter Kommentar (erklärt, was der Code tut)
# Zähler um 1 erhöhen
counter += 1

# ✅ Guter Kommentar (erklärt warum)
# Kompensieren für nullbasierte Indizierung
counter += 1

# ✅ Guter Kommentar (erklärt Geschäftsregel)
# Gemäß DSGVO bewahren wir Benutzerdaten maximal 3 Jahre auf
retention_days = 365 * 3
```

### TODOs und FIXMEs

Verwenden Sie standardisierte Kommentare für ausstehende Arbeiten.

```python
# TODO: Caching für Benutzerabfragen implementieren
# TODO(john): Unterstützung für Batch-Operationen hinzufügen
# FIXME: Fall behandeln, wenn API 429 zurückgibt
# HACK: Temporäre Problemumgehung, bis Bibliothek Bug #123 behebt
# NOTE: Diese Implementierung ist absichtlich vereinfacht
```

**Wichtig**: TODOs sollten im Issue-Tracker des Projekts erfasst werden.

## Code-Organisation

### Dateistruktur

```
src/myproject/
├── domain/              # Domain-Layer (Geschäftslogik)
│   ├── entities/        # Domain-Entitäten
│   ├── value_objects/   # Value Objects
│   ├── repositories/    # Repository-Interfaces (Ports)
│   ├── services/        # Domain-Services
│   └── exceptions.py    # Domain-Exceptions

├── application/         # Application-Layer (Use Cases)
│   ├── use_cases/       # Use Cases / Application-Services
│   ├── dtos/           # Data Transfer Objects
│   └── commands/       # Befehle

├── infrastructure/     # Infrastructure-Layer (externe Adapter)
│   ├── database/       # Datenbank (SQLAlchemy usw.)
│   ├── api/           # API (FastAPI usw.)
│   ├── messaging/     # Message Broker (RabbitMQ usw.)
│   └── external/      # Externe Dienste (HTTP-Clients usw.)

└── config/            # Konfiguration
    ├── settings.py    # Anwendungseinstellungen
    └── dependencies.py # Dependency Injection
```

### Import-Reihenfolge

```python
# 1. Standardbibliothek
import os
import sys
from datetime import datetime
from typing import Optional

# 2. Drittanbieter
from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy.orm import Session

# 3. Lokale Anwendung
from myproject.domain.entities.user import User
from myproject.domain.repositories.user_repository import UserRepository
from myproject.infrastructure.database.session import get_session
```

## Sicherheits-Best-Practices

### Niemals Geheimnisse fest codieren

```python
# ❌ Niemals dies tun
API_KEY = "sk_live_abc123def456"
DATABASE_PASSWORD = "password123"

# ✅ Umgebungsvariablen verwenden
import os

API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise ValueError("API_KEY-Umgebungsvariable nicht gesetzt")
```

### Eingabevalidierung

Validieren Sie immer Benutzereingaben mit Pydantic.

```python
from pydantic import BaseModel, Field, validator

class CreateUserDTO(BaseModel):
    """DTO zum Erstellen eines Benutzers."""

    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8)
    age: int = Field(..., ge=18, le=150)

    @validator('email')
    def validate_email(cls, v):
        """Validiert E-Mail-Format."""
        if '@' not in v:
            raise ValueError('Ungültiges E-Mail-Format')
        return v.lower()

    @validator('password')
    def validate_password(cls, v):
        """Validiert Passwortstärke."""
        if not any(char.isdigit() for char in v):
            raise ValueError('Passwort muss mindestens eine Ziffer enthalten')
        return v
```

### SQL-Injection-Prävention

Verwenden Sie immer parametrisierte Abfragen.

```python
# ❌ Anfällig für SQL-Injection
def find_user(email: str):
    query = f"SELECT * FROM users WHERE email = '{email}'"
    return db.execute(query)

# ✅ Sicher mit parametrisierter Abfrage
def find_user(email: str):
    query = "SELECT * FROM users WHERE email = :email"
    return db.execute(query, {"email": email})

# ✅ Noch besser mit ORM
def find_user(email: str):
    return session.query(User).filter(User.email == email).first()
```

## Logging

Verwenden Sie Pythons `logging`-Modul, nicht `print()`.

```python
import logging

logger = logging.getLogger(__name__)

# Log-Level: DEBUG, INFO, WARNING, ERROR, CRITICAL
logger.debug("Detaillierte Informationen zum Debuggen")
logger.info("Allgemeine Informationen")
logger.warning("Warnmeldung")
logger.error("Fehler aufgetreten")
logger.critical("Kritischer Fehler")

# Mit Kontext
logger.info(
    "Benutzer erfolgreich erstellt",
    extra={
        "user_id": user.id,
        "email": user.email,
        "request_id": request_id
    }
)

# Exception-Logging
try:
    risky_operation()
except Exception as e:
    logger.error("Operation fehlgeschlagen", exc_info=True)
    raise
```

## Testing

Tests sollten ebenfalls Codierungsstandards folgen.

```python
# tests/unit/domain/test_user.py
import pytest
from myproject.domain.entities.user import User
from myproject.domain.exceptions import InvalidEmailError


class TestUser:
    """Tests für User-Entität."""

    def test_create_user_with_valid_data(self):
        """Testet Benutzererstellung mit gültigen Daten."""
        # Arrange
        name = "John Doe"
        email = "john@example.com"

        # Act
        user = User(name=name, email=email)

        # Assert
        assert user.name == name
        assert user.email == email

    def test_create_user_with_invalid_email_raises_error(self):
        """Testet, dass ungültige E-Mail einen Fehler auslöst."""
        # Act & Assert
        with pytest.raises(InvalidEmailError):
            User(name="John", email="invalid-email")
```

## Tools-Konfiguration

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

## Checkliste

Vor dem Commit:

- [ ] Code folgt PEP 8
- [ ] Alle öffentlichen Funktionen haben Docstrings
- [ ] Alle Parameter und Returns sind typisiert
- [ ] Keine fest codierten Geheimnisse
- [ ] Exceptions sind spezifisch und gut behandelt
- [ ] Imports sind organisiert
- [ ] `black` und `isort` angewendet
- [ ] `ruff` läuft ohne Fehler
- [ ] `mypy` läuft im Strict-Modus
