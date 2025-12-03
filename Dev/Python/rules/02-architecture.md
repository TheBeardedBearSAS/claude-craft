# Architecture Python - Clean Architecture & Hexagonale

## Principes Fondamentaux

### Clean Architecture (Uncle Bob)

L'architecture propre repose sur plusieurs principes clés:

1. **Indépendance des frameworks** - La logique métier ne dépend pas de frameworks
2. **Testabilité** - La logique métier peut être testée sans UI, DB, serveur web
3. **Indépendance de l'UI** - L'UI peut changer sans modifier la logique métier
4. **Indépendance de la DB** - Postgres, MongoDB, etc. sont interchangeables
5. **Indépendance des services externes** - La logique métier ne connaît pas le monde extérieur

### Architecture Hexagonale (Ports & Adapters)

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

## Structure de Projet Complète

### Structure Recommandée

```
myproject/
├── src/
│   └── myproject/
│       ├── __init__.py
│       │
│       ├── domain/                      # DOMAIN LAYER - Logique métier pure
│       │   ├── __init__.py
│       │   ├── entities/                # Entités métier
│       │   │   ├── __init__.py
│       │   │   ├── user.py
│       │   │   ├── order.py
│       │   │   └── product.py
│       │   ├── value_objects/           # Value Objects immutables
│       │   │   ├── __init__.py
│       │   │   ├── email.py
│       │   │   ├── money.py
│       │   │   └── address.py
│       │   ├── events/                  # Domain Events
│       │   │   ├── __init__.py
│       │   │   ├── order_created.py
│       │   │   └── user_registered.py
│       │   ├── repositories/            # Interfaces (Ports)
│       │   │   ├── __init__.py
│       │   │   ├── user_repository.py
│       │   │   └── order_repository.py
│       │   ├── services/                # Services métier
│       │   │   ├── __init__.py
│       │   │   ├── order_service.py
│       │   │   └── pricing_service.py
│       │   └── exceptions/              # Exceptions métier
│       │       ├── __init__.py
│       │       └── domain_exceptions.py
│       │
│       ├── application/                 # APPLICATION LAYER - Use cases
│       │   ├── __init__.py
│       │   ├── use_cases/               # Use cases (interactors)
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
│       │   ├── interfaces/              # Ports pour infrastructure
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
│       │   ├── api/                     # API HTTP (FastAPI/Flask/Django)
│       │   │   ├── __init__.py
│       │   │   ├── main.py              # Point d'entrée API
│       │   │   ├── dependencies.py      # Dependency injection
│       │   │   ├── middleware.py
│       │   │   ├── routes/              # Routes/Endpoints
│       │   │   │   ├── __init__.py
│       │   │   │   ├── users.py
│       │   │   │   └── orders.py
│       │   │   └── schemas/             # Schémas Pydantic (API)
│       │   │       ├── __init__.py
│       │   │       ├── user_schema.py
│       │   │       └── order_schema.py
│       │   ├── database/                # Base de données
│       │   │   ├── __init__.py
│       │   │   ├── connection.py
│       │   │   ├── session.py
│       │   │   ├── models/              # ORM models (SQLAlchemy)
│       │   │   │   ├── __init__.py
│       │   │   │   ├── user_model.py
│       │   │   │   └── order_model.py
│       │   │   ├── repositories/        # Implémentations repositories
│       │   │   │   ├── __init__.py
│       │   │   │   ├── user_repository_impl.py
│       │   │   │   └── order_repository_impl.py
│       │   │   └── migrations/          # Alembic migrations
│       │   │       ├── versions/
│       │   │       └── env.py
│       │   ├── cache/                   # Cache (Redis)
│       │   │   ├── __init__.py
│       │   │   ├── redis_client.py
│       │   │   └── cache_service_impl.py
│       │   ├── messaging/               # Message queue
│       │   │   ├── __init__.py
│       │   │   ├── celery_app.py
│       │   │   └── tasks/
│       │   │       ├── __init__.py
│       │   │       └── email_tasks.py
│       │   ├── external/                # Services externes
│       │   │   ├── __init__.py
│       │   │   ├── stripe_payment.py
│       │   │   └── sendgrid_email.py
│       │   └── di/                      # Dependency Injection
│       │       ├── __init__.py
│       │       └── container.py
│       │
│       └── shared/                      # Code partagé
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
│   ├── conftest.py                      # Fixtures globales pytest
│   ├── unit/                            # Tests unitaires
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/                     # Tests d'intégration
│   │   ├── api/
│   │   ├── database/
│   │   └── external/
│   └── e2e/                             # Tests end-to-end
│       └── test_order_flow.py
│
├── docs/                                # Documentation
│   ├── api/
│   ├── architecture/
│   └── adr/                             # Architecture Decision Records
│
├── scripts/                             # Scripts utilitaires
│   ├── init_db.py
│   └── seed_data.py
│
├── docker/                              # Configuration Docker
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
│
├── .github/                             # CI/CD
│   └── workflows/
│       └── ci.yml
│
├── pyproject.toml                       # Configuration Poetry/uv
├── poetry.lock / uv.lock
├── Makefile                             # Commandes Docker
├── .env.example                         # Variables d'environnement
├── .gitignore
├── .pre-commit-config.yaml
├── pytest.ini
├── mypy.ini
├── ruff.toml
└── README.md
```

## Domain Layer - Le Coeur Métier

### Entities (Entités)

Les entités sont des objets avec une identité unique.

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
    Entité User représentant un utilisateur du système.

    Une entité a une identité unique (id) qui persiste dans le temps,
    même si ses attributs changent.
    """

    id: UUID = field(default_factory=uuid4)
    email: Email = field(default=None)
    name: str = field(default="")
    is_active: bool = field(default=True)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = field(default=None)

    # Domain events (pattern Event Sourcing)
    _events: list = field(default_factory=list, init=False, repr=False)

    def __post_init__(self) -> None:
        """Validation après initialisation."""
        if not self.email:
            raise ValueError("Email is required")
        if not self.name or len(self.name) < 2:
            raise ValueError("Name must be at least 2 characters")

    def activate(self) -> None:
        """Active l'utilisateur."""
        if self.is_active:
            raise ValueError("User is already active")

        self.is_active = True
        self.updated_at = datetime.utcnow()

    def deactivate(self) -> None:
        """Désactive l'utilisateur."""
        if not self.is_active:
            raise ValueError("User is already inactive")

        self.is_active = False
        self.updated_at = datetime.utcnow()

    def change_email(self, new_email: Email) -> None:
        """Change l'email de l'utilisateur."""
        if self.email == new_email:
            return

        old_email = self.email
        self.email = new_email
        self.updated_at = datetime.utcnow()

        # Émettre un événement domain
        self._add_event(UserEmailChanged(
            user_id=self.id,
            old_email=old_email,
            new_email=new_email,
            changed_at=self.updated_at
        ))

    def _add_event(self, event) -> None:
        """Ajoute un événement domain."""
        self._events.append(event)

    def clear_events(self) -> list:
        """Récupère et nettoie les événements."""
        events = self._events.copy()
        self._events.clear()
        return events

    def __eq__(self, other: object) -> bool:
        """Égalité basée sur l'identité, pas sur les attributs."""
        if not isinstance(other, User):
            return NotImplemented
        return self.id == other.id

    def __hash__(self) -> int:
        """Hash basé sur l'identité."""
        return hash(self.id)
```

### Value Objects (Objets Valeur)

Les value objects sont immuables et définis par leurs attributs.

```python
# src/myproject/domain/value_objects/email.py
from __future__ import annotations

from dataclasses import dataclass
from email_validator import validate_email, EmailNotValidError


@dataclass(frozen=True)  # Immutable
class Email:
    """
    Value Object représentant une adresse email.

    Un Value Object:
    - Est immutable (frozen=True)
    - N'a pas d'identité propre
    - L'égalité est basée sur les valeurs
    - Contient sa propre validation
    """

    value: str

    def __post_init__(self) -> None:
        """Validation à l'initialisation."""
        try:
            # Normalisation et validation
            email_info = validate_email(self.value, check_deliverability=False)
            # Utiliser object.__setattr__ car frozen=True
            object.__setattr__(self, 'value', email_info.normalized)
        except EmailNotValidError as e:
            raise ValueError(f"Invalid email address: {e}")

    def __str__(self) -> str:
        return self.value

    @property
    def domain(self) -> str:
        """Extrait le domaine de l'email."""
        return self.value.split('@')[1]

    @property
    def local_part(self) -> str:
        """Extrait la partie locale de l'email."""
        return self.value.split('@')[0]


# src/myproject/domain/value_objects/money.py
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Union


@dataclass(frozen=True)
class Money:
    """
    Value Object représentant une valeur monétaire.

    Gère correctement les opérations monétaires avec Decimal
    pour éviter les erreurs de float.
    """

    amount: Decimal
    currency: str = "EUR"

    def __post_init__(self) -> None:
        """Validation."""
        # Conversion en Decimal si nécessaire
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
            raise ValueError("Amount cannot be negative")

        if len(self.currency) != 3:
            raise ValueError("Currency must be ISO 4217 code (3 letters)")

    def __add__(self, other: Money) -> Money:
        """Addition de deux Money."""
        self._check_same_currency(other)
        return Money(
            amount=self.amount + other.amount,
            currency=self.currency
        )

    def __sub__(self, other: Money) -> Money:
        """Soustraction de deux Money."""
        self._check_same_currency(other)
        return Money(
            amount=self.amount - other.amount,
            currency=self.currency
        )

    def __mul__(self, factor: Union[int, float, Decimal]) -> Money:
        """Multiplication par un facteur."""
        return Money(
            amount=self.amount * Decimal(str(factor)),
            currency=self.currency
        )

    def __truediv__(self, divisor: Union[int, float, Decimal]) -> Money:
        """Division par un diviseur."""
        if divisor == 0:
            raise ValueError("Cannot divide by zero")
        return Money(
            amount=self.amount / Decimal(str(divisor)),
            currency=self.currency
        )

    def _check_same_currency(self, other: Money) -> None:
        """Vérifie que les devises sont identiques."""
        if self.currency != other.currency:
            raise ValueError(
                f"Cannot operate on different currencies: "
                f"{self.currency} vs {other.currency}"
            )

    def __str__(self) -> str:
        return f"{self.amount:.2f} {self.currency}"
```

### Domain Services

Services contenant de la logique métier qui ne rentre pas dans une entité.

```python
# src/myproject/domain/services/pricing_service.py
from decimal import Decimal
from typing import Protocol

from myproject.domain.entities.order import Order
from myproject.domain.value_objects.money import Money


class DiscountRule(Protocol):
    """Interface pour les règles de discount."""

    def applies_to(self, order: Order) -> bool:
        """Vérifie si la règle s'applique à la commande."""
        ...

    def calculate_discount(self, order: Order) -> Money:
        """Calcule le montant du discount."""
        ...


class PricingService:
    """
    Service métier pour le calcul des prix.

    Contient la logique de pricing qui ne dépend pas d'une seule entité
    mais coordonne plusieurs concepts métier.
    """

    def __init__(self, discount_rules: list[DiscountRule]) -> None:
        self._discount_rules = discount_rules

    def calculate_total(self, order: Order) -> Money:
        """
        Calcule le total d'une commande avec discounts.

        Args:
            order: La commande à pricer

        Returns:
            Le montant total après discounts
        """
        subtotal = self._calculate_subtotal(order)
        discount = self._calculate_discount(order)
        tax = self._calculate_tax(subtotal - discount, order.tax_rate)

        total = subtotal - discount + tax

        return total

    def _calculate_subtotal(self, order: Order) -> Money:
        """Calcule le sous-total (somme des items)."""
        subtotal = Money(amount=Decimal("0"), currency="EUR")

        for item in order.items:
            item_total = item.unit_price * item.quantity
            subtotal = subtotal + item_total

        return subtotal

    def _calculate_discount(self, order: Order) -> Money:
        """Applique les règles de discount."""
        total_discount = Money(amount=Decimal("0"), currency="EUR")

        for rule in self._discount_rules:
            if rule.applies_to(order):
                discount = rule.calculate_discount(order)
                total_discount = total_discount + discount

        return total_discount

    def _calculate_tax(self, amount: Money, tax_rate: Decimal) -> Money:
        """Calcule la taxe."""
        return amount * tax_rate
```

### Repository Interfaces (Ports)

Interfaces définissant comment accéder aux entités, sans implémentation.

```python
# src/myproject/domain/repositories/user_repository.py
from abc import ABC, abstractmethod
from typing import Optional, Protocol
from uuid import UUID

from myproject.domain.entities.user import User
from myproject.domain.value_objects.email import Email


class UserRepository(Protocol):
    """
    Port (interface) pour le repository User.

    Le domain définit le contrat, l'infrastructure fournit l'implémentation.
    Utilise Protocol (PEP 544) pour structural subtyping.
    """

    def save(self, user: User) -> User:
        """
        Sauvegarde un utilisateur.

        Args:
            user: L'utilisateur à sauvegarder

        Returns:
            L'utilisateur sauvegardé

        Raises:
            RepositoryError: Si la sauvegarde échoue
        """
        ...

    def find_by_id(self, user_id: UUID) -> Optional[User]:
        """
        Trouve un utilisateur par son ID.

        Args:
            user_id: L'ID de l'utilisateur

        Returns:
            L'utilisateur trouvé ou None
        """
        ...

    def find_by_email(self, email: Email) -> Optional[User]:
        """
        Trouve un utilisateur par son email.

        Args:
            email: L'email de l'utilisateur

        Returns:
            L'utilisateur trouvé ou None
        """
        ...

    def exists_with_email(self, email: Email) -> bool:
        """
        Vérifie si un utilisateur existe avec cet email.

        Args:
            email: L'email à vérifier

        Returns:
            True si un utilisateur existe
        """
        ...

    def delete(self, user_id: UUID) -> None:
        """
        Supprime un utilisateur.

        Args:
            user_id: L'ID de l'utilisateur à supprimer

        Raises:
            RepositoryError: Si la suppression échoue
            UserNotFoundError: Si l'utilisateur n'existe pas
        """
        ...


# Alternative avec ABC (Abstract Base Class)
class UserRepositoryABC(ABC):
    """Version avec ABC au lieu de Protocol."""

    @abstractmethod
    def save(self, user: User) -> User:
        """Sauvegarde un utilisateur."""
        pass

    @abstractmethod
    def find_by_id(self, user_id: UUID) -> Optional[User]:
        """Trouve un utilisateur par ID."""
        pass
```

## Application Layer - Use Cases

### Use Case Pattern

```python
# src/myproject/application/use_cases/user/create_user.py
from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from myproject.domain.entities.user import User
from myproject.domain.repositories.user_repository import UserRepository
from myproject.domain.value_objects.email import Email
from myproject.application.dtos.user_dto import UserDTO
from myproject.application.exceptions import (
    UserAlreadyExistsError,
    ValidationError
)
from myproject.application.interfaces.email_service import EmailService


@dataclass
class CreateUserCommand:
    """Command pour créer un utilisateur."""
    email: str
    name: str
    send_welcome_email: bool = True


class CreateUserUseCase:
    """
    Use case pour créer un utilisateur.

    Coordonne les opérations nécessaires à la création d'un utilisateur:
    - Validation
    - Vérification d'unicité
    - Création de l'entité
    - Persistence
    - Envoi d'email de bienvenue
    """

    def __init__(
        self,
        user_repository: UserRepository,
        email_service: EmailService
    ) -> None:
        self._user_repository = user_repository
        self._email_service = email_service

    def execute(self, command: CreateUserCommand) -> UserDTO:
        """
        Exécute le use case.

        Args:
            command: Les données de création

        Returns:
            Le DTO de l'utilisateur créé

        Raises:
            UserAlreadyExistsError: Si l'email existe déjà
            ValidationError: Si les données sont invalides
        """
        # 1. Créer les value objects (validation automatique)
        try:
            email = Email(command.email)
        except ValueError as e:
            raise ValidationError(f"Invalid email: {e}")

        # 2. Vérifier que l'email n'existe pas
        if self._user_repository.exists_with_email(email):
            raise UserAlreadyExistsError(f"User with email {email} already exists")

        # 3. Créer l'entité (validation métier)
        user = User(
            email=email,
            name=command.name
        )

        # 4. Sauvegarder
        user = self._user_repository.save(user)

        # 5. Envoyer email de bienvenue (opération secondaire)
        if command.send_welcome_email:
            try:
                self._email_service.send_welcome_email(user.email, user.name)
            except Exception as e:
                # Logger mais ne pas faire échouer le use case
                # (pattern: eventual consistency)
                logger.warning(f"Failed to send welcome email: {e}")

        # 6. Retourner DTO
        return UserDTO.from_entity(user)
```

### DTOs (Data Transfer Objects)

```python
# src/myproject/application/dtos/user_dto.py
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID

from myproject.domain.entities.user import User


@dataclass
class UserDTO:
    """
    DTO pour transférer les données utilisateur entre layers.

    Les DTOs sont de simples structures de données sans logique métier.
    Ils découplent le domain de l'extérieur.
    """

    id: UUID
    email: str
    name: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    @classmethod
    def from_entity(cls, user: User) -> UserDTO:
        """Crée un DTO depuis une entité."""
        return cls(
            id=user.id,
            email=str(user.email),
            name=user.name,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )

    def to_dict(self) -> dict:
        """Convertit en dictionnaire pour sérialisation."""
        return {
            'id': str(self.id),
            'email': self.email,
            'name': self.name,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
```

## Infrastructure Layer - Adapters

### Repository Implementation

```python
# src/myproject/infrastructure/database/repositories/user_repository_impl.py
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from myproject.domain.entities.user import User
from myproject.domain.repositories.user_repository import UserRepository
from myproject.domain.value_objects.email import Email
from myproject.infrastructure.database.models.user_model import UserModel
from myproject.infrastructure.database.exceptions import RepositoryError


class UserRepositoryImpl:
    """
    Implémentation du UserRepository avec SQLAlchemy.

    Adapte l'interface domain au modèle ORM.
    """

    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, user: User) -> User:
        """Sauvegarde un utilisateur."""
        try:
            # Convertir entité -> modèle ORM
            user_model = self._to_model(user)

            # Merge (insert ou update)
            self._session.merge(user_model)
            self._session.commit()

            # Refresh pour obtenir les valeurs DB (id auto-généré, etc.)
            self._session.refresh(user_model)

            # Convertir modèle -> entité
            return self._to_entity(user_model)

        except Exception as e:
            self._session.rollback()
            raise RepositoryError(f"Failed to save user: {e}") from e

    def find_by_id(self, user_id: UUID) -> Optional[User]:
        """Trouve un utilisateur par ID."""
        user_model = self._session.query(UserModel).filter(
            UserModel.id == user_id
        ).first()

        return self._to_entity(user_model) if user_model else None

    def find_by_email(self, email: Email) -> Optional[User]:
        """Trouve un utilisateur par email."""
        user_model = self._session.query(UserModel).filter(
            UserModel.email == str(email)
        ).first()

        return self._to_entity(user_model) if user_model else None

    def exists_with_email(self, email: Email) -> bool:
        """Vérifie si un email existe."""
        count = self._session.query(UserModel).filter(
            UserModel.email == str(email)
        ).count()

        return count > 0

    def delete(self, user_id: UUID) -> None:
        """Supprime un utilisateur."""
        try:
            user_model = self._session.query(UserModel).filter(
                UserModel.id == user_id
            ).first()

            if not user_model:
                raise UserNotFoundError(f"User {user_id} not found")

            self._session.delete(user_model)
            self._session.commit()

        except Exception as e:
            self._session.rollback()
            raise RepositoryError(f"Failed to delete user: {e}") from e

    def _to_entity(self, model: UserModel) -> User:
        """Convertit ORM model -> domain entity."""
        return User(
            id=model.id,
            email=Email(model.email),
            name=model.name,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at
        )

    def _to_model(self, entity: User) -> UserModel:
        """Convertit domain entity -> ORM model."""
        return UserModel(
            id=entity.id,
            email=str(entity.email),
            name=entity.name,
            is_active=entity.is_active,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )
```

### Database Models (ORM)

```python
# src/myproject/infrastructure/database/models/user_model.py
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID

from myproject.infrastructure.database.base import Base


class UserModel(Base):
    """
    Modèle ORM pour User.

    Séparé de l'entité domain pour:
    - Éviter la pollution du domain par l'ORM
    - Permettre des schémas DB différents de l'entité
    - Faciliter les changements de DB
    """

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<UserModel(id={self.id}, email={self.email})>"
```

### FastAPI Routes

```python
# src/myproject/infrastructure/api/routes/users.py
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from myproject.application.use_cases.user.create_user import (
    CreateUserUseCase,
    CreateUserCommand
)
from myproject.application.dtos.user_dto import UserDTO
from myproject.application.exceptions import (
    UserAlreadyExistsError,
    ValidationError
)
from myproject.infrastructure.api.dependencies import get_create_user_use_case
from myproject.infrastructure.api.schemas.user_schema import (
    UserCreateSchema,
    UserResponseSchema
)


router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    "/",
    response_model=UserResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
    description="Creates a new user with the provided email and name"
)
async def create_user(
    user_data: UserCreateSchema,
    use_case: Annotated[CreateUserUseCase, Depends(get_create_user_use_case)]
) -> UserResponseSchema:
    """
    Create a new user.

    Args:
        user_data: User creation data
        use_case: Injected use case

    Returns:
        The created user

    Raises:
        409: User already exists
        400: Invalid data
    """
    try:
        command = CreateUserCommand(
            email=user_data.email,
            name=user_data.name,
            send_welcome_email=user_data.send_welcome_email
        )

        user_dto = use_case.execute(command)

        return UserResponseSchema.from_dto(user_dto)

    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get(
    "/{user_id}",
    response_model=UserResponseSchema,
    summary="Get user by ID"
)
async def get_user(
    user_id: UUID,
    # Inject GetUserUseCase
) -> UserResponseSchema:
    """Get a user by ID."""
    # Implementation...
    pass
```

### API Schemas (Pydantic)

```python
# src/myproject/infrastructure/api/schemas/user_schema.py
from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from myproject.application.dtos.user_dto import UserDTO


class UserCreateSchema(BaseModel):
    """Schéma pour la création d'un utilisateur via API."""

    email: EmailStr = Field(..., description="User email address")
    name: str = Field(..., min_length=2, max_length=255, description="User name")
    send_welcome_email: bool = Field(default=True, description="Send welcome email")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "john.doe@example.com",
                "name": "John Doe",
                "send_welcome_email": True
            }
        }
    )


class UserResponseSchema(BaseModel):
    """Schéma pour la réponse API utilisateur."""

    id: UUID
    email: str
    name: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_dto(cls, dto: UserDTO) -> UserResponseSchema:
        """Crée un schéma depuis un DTO."""
        return cls(
            id=dto.id,
            email=dto.email,
            name=dto.name,
            is_active=dto.is_active,
            created_at=dto.created_at,
            updated_at=dto.updated_at
        )
```

### Dependency Injection

```python
# src/myproject/infrastructure/di/container.py
from functools import lru_cache

from sqlalchemy.orm import Session

from myproject.application.use_cases.user.create_user import CreateUserUseCase
from myproject.domain.repositories.user_repository import UserRepository
from myproject.infrastructure.database.repositories.user_repository_impl import (
    UserRepositoryImpl
)
from myproject.infrastructure.database.session import get_db_session
from myproject.infrastructure.external.sendgrid_email import SendGridEmailService


# FastAPI dependencies
def get_user_repository(
    session: Session = Depends(get_db_session)
) -> UserRepository:
    """Factory pour UserRepository."""
    return UserRepositoryImpl(session)


def get_email_service() -> EmailService:
    """Factory pour EmailService."""
    return SendGridEmailService()


def get_create_user_use_case(
    user_repository: UserRepository = Depends(get_user_repository),
    email_service: EmailService = Depends(get_email_service)
) -> CreateUserUseCase:
    """Factory pour CreateUserUseCase."""
    return CreateUserUseCase(
        user_repository=user_repository,
        email_service=email_service
    )


# Alternative: Container-based DI (dependency-injector, punq, etc.)
from dependency_injector import containers, providers


class Container(containers.DeclarativeContainer):
    """DI Container."""

    config = providers.Configuration()

    # Database
    db_session = providers.Factory(get_db_session)

    # Repositories
    user_repository = providers.Factory(
        UserRepositoryImpl,
        session=db_session
    )

    # External services
    email_service = providers.Singleton(
        SendGridEmailService,
        api_key=config.sendgrid.api_key
    )

    # Use cases
    create_user_use_case = providers.Factory(
        CreateUserUseCase,
        user_repository=user_repository,
        email_service=email_service
    )
```

## Principes d'Architecture

### 1. Dependency Rule (Règle de Dépendance)

```
┌─────────────────────────────────────────────────┐
│          Infrastructure Layer                    │
│              (Frameworks, DB, API)              │
│                     ↓                           │
│          Application Layer                       │
│            (Use Cases, DTOs)                    │
│                     ↓                           │
│          Domain Layer                            │
│      (Entities, Services, Events)              │
└─────────────────────────────────────────────────┘

RÈGLE: Les dépendances pointent TOUJOURS vers l'intérieur
- Infrastructure dépend de Application et Domain
- Application dépend de Domain
- Domain ne dépend de RIEN
```

### 2. Inversion de Dépendances (SOLID - D)

```python
# ❌ MAUVAIS: Domain dépend de l'infrastructure
from myproject.infrastructure.database.session import Session

class UserService:
    def create_user(self, session: Session):  # Dépendance concrète
        pass


# ✅ BON: Domain définit l'interface, infrastructure l'implémente
from typing import Protocol

class DatabaseSession(Protocol):  # Interface dans le domain
    def commit(self) -> None: ...
    def rollback(self) -> None: ...

class UserService:
    def create_user(self, session: DatabaseSession):  # Dépendance abstraite
        pass
```

### 3. Screaming Architecture

```
# ✅ L'architecture crie "C'est une application de e-commerce!"
src/myproject/
├── domain/
│   ├── entities/
│   │   ├── order.py          # Crie "Orders!"
│   │   ├── product.py        # Crie "Products!"
│   │   └── customer.py       # Crie "Customers!"
│   └── services/
│       └── pricing_service.py

# ❌ L'architecture crie "C'est du Django/Flask!"
src/
├── models.py
├── views.py
├── serializers.py
└── urls.py
```

## Patterns Complémentaires

### Event-Driven Architecture

```python
# Domain events
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class DomainEvent:
    """Base class for domain events."""
    occurred_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class OrderCreatedEvent(DomainEvent):
    """Event émis quand une commande est créée."""
    order_id: UUID
    customer_id: UUID
    total_amount: Decimal


# Event handler
class SendOrderConfirmationHandler:
    """Handler pour OrderCreatedEvent."""

    def handle(self, event: OrderCreatedEvent) -> None:
        """Envoie un email de confirmation."""
        # Logic...
        pass


# Event dispatcher
class EventDispatcher:
    """Dispatche les events vers les handlers."""

    def __init__(self):
        self._handlers: dict[type, list] = {}

    def register(self, event_type: type, handler) -> None:
        """Enregistre un handler."""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)

    def dispatch(self, event: DomainEvent) -> None:
        """Dispatche un event."""
        event_type = type(event)
        if event_type in self._handlers:
            for handler in self._handlers[event_type]:
                handler.handle(event)
```

### CQRS (Command Query Responsibility Segregation)

```python
# Command (write)
class CreateOrderCommand:
    """Command pour créer une commande."""
    customer_id: UUID
    items: list[OrderItemData]


# Query (read)
class OrderQuery:
    """Query pour lire des commandes."""

    def get_order_by_id(self, order_id: UUID) -> OrderDTO:
        """Lecture optimisée."""
        # Peut utiliser une DB read-only, cache, etc.
        pass

    def get_customer_orders(self, customer_id: UUID) -> list[OrderSummaryDTO]:
        """Lecture dénormalisée pour performance."""
        pass
```

## Anti-Patterns à Éviter

### 1. Anemic Domain Model

```python
# ❌ MAUVAIS: Entité anémique (juste des getters/setters)
class User:
    def __init__(self):
        self.email = ""
        self.is_active = False

    def get_email(self): return self.email
    def set_email(self, email): self.email = email
    def get_is_active(self): return self.is_active
    def set_is_active(self, active): self.is_active = active

# Logique métier dans les services
class UserService:
    def activate_user(self, user):
        user.set_is_active(True)  # Service fait tout


# ✅ BON: Entité riche avec comportement
class User:
    def __init__(self, email: Email):
        self.email = email
        self.is_active = False

    def activate(self) -> None:
        """Logique métier dans l'entité."""
        if self.is_active:
            raise AlreadyActiveError()
        self.is_active = True
```

### 2. God Service

```python
# ❌ MAUVAIS: Service omnipotent
class UserService:
    def create_user(self): pass
    def update_user(self): pass
    def delete_user(self): pass
    def send_email(self): pass
    def validate_password(self): pass
    def calculate_age(self): pass
    # ... 50 autres méthodes


# ✅ BON: Use cases spécifiques
class CreateUserUseCase:
    def execute(self, command): pass

class UpdateUserUseCase:
    def execute(self, command): pass
```

### 3. Leaky Abstractions

```python
# ❌ MAUVAIS: ORM dans le domain
from sqlalchemy.orm import Session

def create_user(session: Session):  # Fuite d'abstraction
    pass


# ✅ BON: Interface générique
from typing import Protocol

class UnitOfWork(Protocol):
    def commit(self): pass
    def rollback(self): pass

def create_user(uow: UnitOfWork):  # Abstraction propre
    pass
```

## Conclusion

L'architecture Clean/Hexagonale offre:

✅ **Testabilité** - Domain testable sans infrastructure
✅ **Maintenabilité** - Séparation claire des responsabilités
✅ **Flexibilité** - Changement facile de DB, framework, etc.
✅ **Clarté** - L'intention métier est explicite
✅ **Indépendance** - Logique métier protégée des détails techniques

**Règles d'or:**
1. Le domain ne dépend de RIEN
2. Les dépendances pointent vers l'intérieur
3. Utiliser des interfaces (Protocols) pour l'inversion de dépendances
4. Séparer les modèles: Entity (domain) ≠ Model (ORM) ≠ Schema (API)
5. Un use case = une action métier
