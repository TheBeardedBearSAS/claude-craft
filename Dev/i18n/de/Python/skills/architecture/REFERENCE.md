# Python-Architektur - Clean Architecture & Hexagonal

## Grundlegende Prinzipien

### Clean Architecture (Uncle Bob)

Clean Architecture basiert auf mehreren Schlüsselprinzipien:

1. **Framework-Unabhängigkeit** - Geschäftslogik hängt nicht von Frameworks ab
2. **Testbarkeit** - Geschäftslogik kann ohne UI, DB, Webserver getestet werden
3. **UI-Unabhängigkeit** - Die UI kann sich ändern, ohne die Geschäftslogik zu ändern
4. **DB-Unabhängigkeit** - Postgres, MongoDB usw. sind austauschbar
5. **Unabhängigkeit von externen Diensten** - Geschäftslogik kennt die Außenwelt nicht

### Hexagonal Architecture (Ports & Adapters)

```
┌─────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  FastAPI     │  │  PostgreSQL  │  │   Redis      │          │
│  │  (Adapter)   │  │  (Adapter)   │  │  (Adapter)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         ▼                  ▼                  ▼                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │           APPLICATION LAYER (Ports)             │            │
│  │  ┌──────────────┐  ┌──────────────┐            │            │
│  │  │  Use Cases   │  │  Interfaces  │            │            │
│  │  └──────────────┘  └──────────────┘            │            │
│  └────────────────────┬────────────────────────────┘            │
│                       │                                          │
│                       ▼                                          │
│  ┌─────────────────────────────────────────────────┐            │
│  │           DOMAIN LAYER (Core)                   │            │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │            │
│  │  │ Entities │  │ Services │  │  Events  │      │            │
│  │  └──────────┘  └──────────┘  └──────────┘      │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Vollständige Projektstruktur

### Empfohlene Struktur

```
myproject/
├── src/
│   └── myproject/
│       ├── __init__.py
│       │
│       ├── domain/                      # DOMAIN LAYER - Reine Geschäftslogik
│       │   ├── __init__.py
│       │   ├── entities/                # Geschäftsentitäten
│       │   │   ├── __init__.py
│       │   │   ├── user.py
│       │   │   ├── order.py
│       │   │   └── product.py
│       │   ├── value_objects/           # Unveränderliche Value Objects
│       │   │   ├── __init__.py
│       │   │   ├── email.py
│       │   │   ├── money.py
│       │   │   └── address.py
│       │   ├── events/                  # Domain Events
│       │   │   ├── __init__.py
│       │   │   ├── order_created.py
│       │   │   └── user_registered.py
│       │   ├── repositories/            # Schnittstellen (Ports)
│       │   │   ├── __init__.py
│       │   │   ├── user_repository.py
│       │   │   └── order_repository.py
│       │   ├── services/                # Geschäftsdienste
│       │   │   ├── __init__.py
│       │   │   ├── order_service.py
│       │   │   └── pricing_service.py
│       │   └── exceptions/              # Geschäftsausnahmen
│       │       ├── __init__.py
│       │       └── domain_exceptions.py
│       │
│       ├── application/                 # APPLICATION LAYER - Use Cases
│       │   ├── __init__.py
│       │   ├── use_cases/               # Use Cases (Interaktoren)
│       │   │   ├── __init__.py
│       │   │   ├── user/
│       │   │   │   ├── __init__.py
│       │   │   │   ├── create_user.py
│       │   │   │   ├── update_user.py
│       │   │   │   └── delete_user.py
│       │   │   └── order/
│       │   │       ├── __init__.py
│       │   │       ├── create_order.py
│       │   │       └── cancel_order.py
│       │   ├── dtos/                    # Data Transfer Objects
│       │   │   ├── __init__.py
│       │   │   ├── user_dto.py
│       │   │   └── order_dto.py
│       │   ├── interfaces/              # Ports für Infrastructure
│       │   │   ├── __init__.py
│       │   │   ├── email_service.py
│       │   │   ├── payment_gateway.py
│       │   │   └── cache_service.py
│       │   └── exceptions/
│       │       ├── __init__.py
│       │       └── application_exceptions.py
│       │
│       ├── infrastructure/              # INFRASTRUCTURE LAYER - Adapters
│       │   ├── __init__.py
│       │   ├── api/                     # HTTP API (FastAPI/Flask/Django)
│       │   │   ├── __init__.py
│       │   │   ├── main.py              # API-Einstiegspunkt
│       │   │   ├── dependencies.py      # Dependency Injection
│       │   │   ├── middleware.py
│       │   │   ├── routes/              # Routen/Endpoints
│       │   │   │   ├── __init__.py
│       │   │   │   ├── users.py
│       │   │   │   └── orders.py
│       │   │   └── schemas/             # Pydantic Schemas (API)
│       │   │       ├── __init__.py
│       │   │       ├── user_schema.py
│       │   │       └── order_schema.py
│       │   ├── database/                # Datenbank
│       │   │   ├── __init__.py
│       │   │   ├── connection.py
│       │   │   ├── session.py
│       │   │   ├── models/              # ORM-Modelle (SQLAlchemy)
│       │   │   │   ├── __init__.py
│       │   │   │   ├── user_model.py
│       │   │   │   └── order_model.py
│       │   │   ├── repositories/        # Repository-Implementierungen
│       │   │   │   ├── __init__.py
│       │   │   │   ├── user_repository_impl.py
│       │   │   │   └── order_repository_impl.py
│       │   │   └── migrations/          # Alembic-Migrationen
│       │   │       ├── versions/
│       │   │       └── env.py
│       │   ├── cache/                   # Cache (Redis)
│       │   │   ├── __init__.py
│       │   │   ├── redis_client.py
│       │   │   └── cache_service_impl.py
│       │   ├── messaging/               # Nachrichtenwarteschlange
│       │   │   ├── __init__.py
│       │   │   ├── celery_app.py
│       │   │   └── tasks/
│       │   │       ├── __init__.py
│       │   │       └── email_tasks.py
│       │   ├── external/                # Externe Dienste
│       │   │   ├── __init__.py
│       │   │   ├── stripe_payment.py
│       │   │   └── sendgrid_email.py
│       │   └── di/                      # Dependency Injection
│       │       ├── __init__.py
│       │       └── container.py
│       │
│       └── shared/                      # Gemeinsamer Code
│           ├── __init__.py
│           ├── utils/
│           │   ├── __init__.py
│           │   ├── date_utils.py
│           │   └── string_utils.py
│           ├── validators/
│           │   ├── __init__.py
│           │   └── common_validators.py
│           └── constants/
│               ├── __init__.py
│               └── app_constants.py
│
├── tests/                               # Tests
│   ├── __init__.py
│   ├── conftest.py                      # Globale pytest-Fixtures
│   ├── unit/                            # Unit-Tests
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/                     # Integrationstests
│   │   ├── api/
│   │   ├── database/
│   │   └── external/
│   └── e2e/                             # End-to-End-Tests
│       └── test_order_flow.py
│
├── docs/                                # Dokumentation
│   ├── api/
│   ├── architecture/
│   └── adr/                             # Architecture Decision Records
│
├── scripts/                             # Hilfsskripte
│   ├── init_db.py
│   └── seed_data.py
│
├── docker/                              # Docker-Konfiguration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
│
├── .github/                             # CI/CD
│   └── workflows/
│       └── ci.yml
│
├── pyproject.toml                       # Poetry/uv-Konfiguration
├── poetry.lock / uv.lock
├── Makefile                             # Docker-Befehle
├── .env.example                         # Umgebungsvariablen
├── .gitignore
├── .pre-commit-config.yaml
├── pytest.ini
├── mypy.ini
├── ruff.toml
└── README.md
```

## Domain Layer - Das Geschäftsherz

### Entities

Entities sind Objekte mit einer eindeutigen Identität.

```python
# src/myproject/domain/entities/user.py
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from myproject.domain.value_objects.email import Email
from myproject.domain.events.user_registered import UserRegistered


@dataclass
class User:
    """
    User-Entity, die einen Systembenutzer repräsentiert.

    Eine Entity hat eine eindeutige Identität (id), die über die Zeit
    bestehen bleibt, selbst wenn sich ihre Attribute ändern.
    """

    id: UUID = field(default_factory=uuid4)
    email: Email = field(default=None)
    name: str = field(default="")
    is_active: bool = field(default=True)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = field(default=None)

    # Domain Events (Event Sourcing Pattern)
    _events: list = field(default_factory=list, init=False, repr=False)

    def __post_init__(self) -> None:
        """Validierung nach der Initialisierung."""
        if not self.email:
            raise ValueError("E-Mail ist erforderlich")
        if not self.name or len(self.name) < 2:
            raise ValueError("Name muss mindestens 2 Zeichen lang sein")

    def activate(self) -> None:
        """Aktiviert den Benutzer."""
        if self.is_active:
            raise ValueError("Benutzer ist bereits aktiv")

        self.is_active = True
        self.updated_at = datetime.utcnow()

    def deactivate(self) -> None:
        """Deaktiviert den Benutzer."""
        if not self.is_active:
            raise ValueError("Benutzer ist bereits inaktiv")

        self.is_active = False
        self.updated_at = datetime.utcnow()

    def change_email(self, new_email: Email) -> None:
        """Ändert die E-Mail-Adresse des Benutzers."""
        if self.email == new_email:
            return

        old_email = self.email
        self.email = new_email
        self.updated_at = datetime.utcnow()

        # Domain Event ausgeben
        self._add_event(UserEmailChanged(
            user_id=self.id,
            old_email=old_email,
            new_email=new_email,
            changed_at=self.updated_at
        ))

    def _add_event(self, event) -> None:
        """Fügt ein Domain Event hinzu."""
        self._events.append(event)

    def clear_events(self) -> list:
        """Ruft Events ab und löscht sie."""
        events = self._events.copy()
        self._events.clear()
        return events

    def __eq__(self, other: object) -> bool:
        """Gleichheit basiert auf Identität, nicht auf Attributen."""
        if not isinstance(other, User):
            return NotImplemented
        return self.id == other.id

    def __hash__(self) -> int:
        """Hash basiert auf Identität."""
        return hash(self.id)
```

### Value Objects

Value Objects sind unveränderlich und durch ihre Attribute definiert.

```python
# src/myproject/domain/value_objects/email.py
from __future__ import annotations

from dataclasses import dataclass
from email_validator import validate_email, EmailNotValidError


@dataclass(frozen=True)  # Unveränderlich
class Email:
    """
    Value Object, das eine E-Mail-Adresse repräsentiert.

    Ein Value Object:
    - Ist unveränderlich (frozen=True)
    - Hat keine eigene Identität
    - Gleichheit basiert auf Werten
    - Enthält eigene Validierung
    """

    value: str

    def __post_init__(self) -> None:
        """Validierung bei Initialisierung."""
        try:
            # Normalisierung und Validierung
            email_info = validate_email(self.value, check_deliverability=False)
            # object.__setattr__ verwenden wegen frozen=True
            object.__setattr__(self, 'value', email_info.normalized)
        except EmailNotValidError as e:
            raise ValueError(f"Ungültige E-Mail-Adresse: {e}")

    def __str__(self) -> str:
        return self.value

    @property
    def domain(self) -> str:
        """Extrahiert die E-Mail-Domain."""
        return self.value.split('@')[1]

    @property
    def local_part(self) -> str:
        """Extrahiert den lokalen Teil der E-Mail."""
        return self.value.split('@')[0]


# src/myproject/domain/value_objects/money.py
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Union


@dataclass(frozen=True)
class Money:
    """
    Value Object, das einen Geldwert repräsentiert.

    Verwaltet Geldoperationen ordnungsgemäß mit Decimal,
    um Float-Fehler zu vermeiden.
    """

    amount: Decimal
    currency: str = "EUR"

    def __post_init__(self) -> None:
        """Validierung."""
        # In Decimal konvertieren, falls erforderlich
        if not isinstance(self.amount, Decimal):
            object.__setattr__(
                self,
                'amount',
                Decimal(str(self.amount)).quantize(
                    Decimal('0.01'),
                    rounding=ROUND_HALF_UP
                )
            )

        if self.amount < 0:
            raise ValueError("Betrag kann nicht negativ sein")

        if len(self.currency) != 3:
            raise ValueError("Währung muss ISO 4217-Code sein (3 Buchstaben)")

    def __add__(self, other: Money) -> Money:
        """Addition von zwei Money-Objekten."""
        self._check_same_currency(other)
        return Money(
            amount=self.amount + other.amount,
            currency=self.currency
        )

    def __sub__(self, other: Money) -> Money:
        """Subtraktion von zwei Money-Objekten."""
        self._check_same_currency(other)
        return Money(
            amount=self.amount - other.amount,
            currency=self.currency
        )

    def __mul__(self, factor: Union[int, float, Decimal]) -> Money:
        """Multiplikation mit einem Faktor."""
        return Money(
            amount=self.amount * Decimal(str(factor)),
            currency=self.currency
        )

    def __truediv__(self, divisor: Union[int, float, Decimal]) -> Money:
        """Division durch einen Divisor."""
        if divisor == 0:
            raise ValueError("Kann nicht durch Null teilen")
        return Money(
            amount=self.amount / Decimal(str(divisor)),
            currency=self.currency
        )

    def _check_same_currency(self, other: Money) -> None:
        """Überprüft, ob die Währungen gleich sind."""
        if self.currency != other.currency:
            raise ValueError(
                f"Kann nicht mit unterschiedlichen Währungen operieren: "
                f"{self.currency} vs {other.currency}"
            )

    def __str__(self) -> str:
        return f"{self.amount:.2f} {self.currency}"
```

[Hinweis: Aufgrund von Längenbeschränkungen werde ich mit den verbleibenden Architekturkomponenten in Folge-Writes fortfahren. Die Datei zeigt die Kernmuster für Clean/Hexagonal Architecture in Python mit Entities, Value Objects, Domain Services, Repositories, Use Cases und Infrastructure-Adaptern.]
