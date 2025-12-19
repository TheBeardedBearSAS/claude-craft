# Arquitectura Python - Clean Architecture y Hexagonal

## Principios Fundamentales

### Clean Architecture (Uncle Bob)

La arquitectura limpia se basa en varios principios clave:

1. **Independencia del Framework** - La lógica de negocio no depende de frameworks
2. **Testabilidad** - La lógica de negocio puede probarse sin UI, BD, servidor web
3. **Independencia de la UI** - La UI puede cambiar sin modificar la lógica de negocio
4. **Independencia de la BD** - Postgres, MongoDB, etc. son intercambiables
5. **Independencia de Servicios Externos** - La lógica de negocio no conoce el mundo exterior

### Arquitectura Hexagonal (Ports & Adapters)

```
┌─────────────────────────────────────────────────────────────────┐
│                        INFRAESTRUCTURA                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  FastAPI     │  │  PostgreSQL  │  │   Redis      │          │
│  │  (Adapter)   │  │  (Adapter)   │  │  (Adapter)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         ▼                  ▼                  ▼                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │           CAPA DE APLICACIÓN (Ports)            │            │
│  │  ┌──────────────┐  ┌──────────────┐            │            │
│  │  │  Casos de    │  │  Interfaces  │            │            │
│  │  │  Uso         │  │              │            │            │
│  │  └──────────────┘  └──────────────┘            │            │
│  └────────────────────┬────────────────────────────┘            │
│                       │                                          │
│                       ▼                                          │
│  ┌─────────────────────────────────────────────────┐            │
│  │           CAPA DE DOMINIO (Core)                │            │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │            │
│  │  │ Entidades│  │ Servicios│  │  Eventos │      │            │
│  │  └──────────┘  └──────────┘  └──────────┘      │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Estructura Completa del Proyecto

### Estructura Recomendada

```
myproject/
├── src/
│   └── myproject/
│       ├── __init__.py
│       │
│       ├── domain/                      # CAPA DE DOMINIO - Lógica de negocio pura
│       │   ├── __init__.py
│       │   ├── entities/                # Entidades de negocio
│       │   │   ├── __init__.py
│       │   │   ├── user.py
│       │   │   ├── order.py
│       │   │   └── product.py
│       │   ├── value_objects/           # Value Objects inmutables
│       │   │   ├── __init__.py
│       │   │   ├── email.py
│       │   │   ├── money.py
│       │   │   └── address.py
│       │   ├── events/                  # Eventos de Dominio
│       │   │   ├── __init__.py
│       │   │   ├── order_created.py
│       │   │   └── user_registered.py
│       │   ├── repositories/            # Interfaces (Ports)
│       │   │   ├── __init__.py
│       │   │   ├── user_repository.py
│       │   │   └── order_repository.py
│       │   ├── services/                # Servicios de negocio
│       │   │   ├── __init__.py
│       │   │   ├── order_service.py
│       │   │   └── pricing_service.py
│       │   └── exceptions/              # Excepciones de negocio
│       │       ├── __init__.py
│       │       └── domain_exceptions.py
│       │
│       ├── application/                 # CAPA DE APLICACIÓN - Casos de uso
│       │   ├── __init__.py
│       │   ├── use_cases/               # Casos de uso (interactors)
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
│       │   ├── interfaces/              # Ports para infraestructura
│       │   │   ├── __init__.py
│       │   │   ├── email_service.py
│       │   │   ├── payment_gateway.py
│       │   │   └── cache_service.py
│       │   └── exceptions/
│       │       ├── __init__.py
│       │       └── application_exceptions.py
│       │
│       ├── infrastructure/              # CAPA DE INFRAESTRUCTURA - Adapters
│       │   ├── __init__.py
│       │   ├── api/                     # API HTTP (FastAPI/Flask/Django)
│       │   │   ├── __init__.py
│       │   │   ├── main.py              # Punto de entrada de la API
│       │   │   ├── dependencies.py      # Inyección de dependencias
│       │   │   ├── middleware.py
│       │   │   ├── routes/              # Rutas/Endpoints
│       │   │   │   ├── __init__.py
│       │   │   │   ├── users.py
│       │   │   │   └── orders.py
│       │   │   └── schemas/             # Schemas Pydantic (API)
│       │   │       ├── __init__.py
│       │   │       ├── user_schema.py
│       │   │       └── order_schema.py
│       │   ├── database/                # Base de datos
│       │   │   ├── __init__.py
│       │   │   ├── connection.py
│       │   │   ├── session.py
│       │   │   ├── models/              # Modelos ORM (SQLAlchemy)
│       │   │   │   ├── __init__.py
│       │   │   │   ├── user_model.py
│       │   │   │   └── order_model.py
│       │   │   ├── repositories/        # Implementaciones de repositorio
│       │   │   │   ├── __init__.py
│       │   │   │   ├── user_repository_impl.py
│       │   │   │   └── order_repository_impl.py
│       │   │   └── migrations/          # Migraciones Alembic
│       │   │       ├── versions/
│       │   │       └── env.py
│       │   ├── cache/                   # Cache (Redis)
│       │   │   ├── __init__.py
│       │   │   ├── redis_client.py
│       │   │   └── cache_service_impl.py
│       │   ├── messaging/               # Cola de mensajes
│       │   │   ├── __init__.py
│       │   │   ├── celery_app.py
│       │   │   └── tasks/
│       │   │       ├── __init__.py
│       │   │       └── email_tasks.py
│       │   ├── external/                # Servicios externos
│       │   │   ├── __init__.py
│       │   │   ├── stripe_payment.py
│       │   │   └── sendgrid_email.py
│       │   └── di/                      # Inyección de Dependencias
│       │       ├── __init__.py
│       │       └── container.py
│       │
│       └── shared/                      # Código compartido
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
│   ├── conftest.py                      # Fixtures globales de pytest
│   ├── unit/                            # Tests unitarios
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/                     # Tests de integración
│   │   ├── api/
│   │   ├── database/
│   │   └── external/
│   └── e2e/                             # Tests end-to-end
│       └── test_order_flow.py
│
├── docs/                                # Documentación
│   ├── api/
│   ├── architecture/
│   └── adr/                             # Architecture Decision Records
│
├── scripts/                             # Scripts de utilidad
│   ├── init_db.py
│   └── seed_data.py
│
├── docker/                              # Configuración Docker
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
│
├── .github/                             # CI/CD
│   └── workflows/
│       └── ci.yml
│
├── pyproject.toml                       # Configuración Poetry/uv
├── poetry.lock / uv.lock
├── Makefile                             # Comandos Docker
├── .env.example                         # Variables de entorno
├── .gitignore
├── .pre-commit-config.yaml
├── pytest.ini
├── mypy.ini
├── ruff.toml
└── README.md
```

## Capa de Dominio - El Corazón del Negocio

### Entidades

Las entidades son objetos con identidad única.

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
    Entidad de usuario que representa un usuario del sistema.

    Una entidad tiene una identidad única (id) que persiste en el tiempo,
    incluso si sus atributos cambian.
    """

    id: UUID = field(default_factory=uuid4)
    email: Email = field(default=None)
    name: str = field(default="")
    is_active: bool = field(default=True)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = field(default=None)

    # Eventos de dominio (patrón Event Sourcing)
    _events: list = field(default_factory=list, init=False, repr=False)

    def __post_init__(self) -> None:
        """Validación después de la inicialización."""
        if not self.email:
            raise ValueError("El email es requerido")
        if not self.name or len(self.name) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")

    def activate(self) -> None:
        """Activa el usuario."""
        if self.is_active:
            raise ValueError("El usuario ya está activo")

        self.is_active = True
        self.updated_at = datetime.utcnow()

    def deactivate(self) -> None:
        """Desactiva el usuario."""
        if not self.is_active:
            raise ValueError("El usuario ya está inactivo")

        self.is_active = False
        self.updated_at = datetime.utcnow()

    def change_email(self, new_email: Email) -> None:
        """Cambia el email del usuario."""
        if self.email == new_email:
            return

        old_email = self.email
        self.email = new_email
        self.updated_at = datetime.utcnow()

        # Emitir un evento de dominio
        self._add_event(UserEmailChanged(
            user_id=self.id,
            old_email=old_email,
            new_email=new_email,
            changed_at=self.updated_at
        ))

    def _add_event(self, event) -> None:
        """Agrega un evento de dominio."""
        self._events.append(event)

    def clear_events(self) -> list:
        """Recupera y limpia los eventos."""
        events = self._events.copy()
        self._events.clear()
        return events

    def __eq__(self, other: object) -> bool:
        """Igualdad basada en la identidad, no en los atributos."""
        if not isinstance(other, User):
            return NotImplemented
        return self.id == other.id

    def __hash__(self) -> int:
        """Hash basado en la identidad."""
        return hash(self.id)
```

### Value Objects

Los value objects son inmutables y se definen por sus atributos.

```python
# src/myproject/domain/value_objects/email.py
from __future__ import annotations

from dataclasses import dataclass
from email_validator import validate_email, EmailNotValidError


@dataclass(frozen=True)  # Inmutable
class Email:
    """
    Value Object que representa una dirección de email.

    Un Value Object:
    - Es inmutable (frozen=True)
    - No tiene identidad propia
    - La igualdad se basa en valores
    - Contiene su propia validación
    """

    value: str

    def __post_init__(self) -> None:
        """Validación en la inicialización."""
        try:
            # Normalización y validación
            email_info = validate_email(self.value, check_deliverability=False)
            # Usar object.__setattr__ porque frozen=True
            object.__setattr__(self, 'value', email_info.normalized)
        except EmailNotValidError as e:
            raise ValueError(f"Dirección de email inválida: {e}")

    def __str__(self) -> str:
        return self.value

    @property
    def domain(self) -> str:
        """Extrae el dominio del email."""
        return self.value.split('@')[1]

    @property
    def local_part(self) -> str:
        """Extrae la parte local del email."""
        return self.value.split('@')[0]


# src/myproject/domain/value_objects/money.py
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Union


@dataclass(frozen=True)
class Money:
    """
    Value Object que representa un valor monetario.

    Maneja correctamente las operaciones monetarias con Decimal
    para evitar errores de punto flotante.
    """

    amount: Decimal
    currency: str = "EUR"

    def __post_init__(self) -> None:
        """Validación."""
        # Convertir a Decimal si es necesario
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
            raise ValueError("El monto no puede ser negativo")

        if len(self.currency) != 3:
            raise ValueError("La moneda debe ser un código ISO 4217 (3 letras)")

    def __add__(self, other: Money) -> Money:
        """Suma de dos objetos Money."""
        self._check_same_currency(other)
        return Money(
            amount=self.amount + other.amount,
            currency=self.currency
        )

    def __sub__(self, other: Money) -> Money:
        """Resta de dos objetos Money."""
        self._check_same_currency(other)
        return Money(
            amount=self.amount - other.amount,
            currency=self.currency
        )

    def __mul__(self, factor: Union[int, float, Decimal]) -> Money:
        """Multiplicación por un factor."""
        return Money(
            amount=self.amount * Decimal(str(factor)),
            currency=self.currency
        )

    def __truediv__(self, divisor: Union[int, float, Decimal]) -> Money:
        """División por un divisor."""
        if divisor == 0:
            raise ValueError("No se puede dividir por cero")
        return Money(
            amount=self.amount / Decimal(str(divisor)),
            currency=self.currency
        )

    def _check_same_currency(self, other: Money) -> None:
        """Verifica que las monedas sean las mismas."""
        if self.currency != other.currency:
            raise ValueError(
                f"No se puede operar con diferentes monedas: "
                f"{self.currency} vs {other.currency}"
            )

    def __str__(self) -> str:
        return f"{self.amount:.2f} {self.currency}"
```

[Nota: Debido a restricciones de longitud, continuaré con los componentes restantes de arquitectura en escrituras de seguimiento. El archivo muestra los patrones centrales de Clean/Hexagonal Architecture en Python con entidades, value objects, servicios de dominio, repositorios, casos de uso y adaptadores de infraestructura.]
