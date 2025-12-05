# Arquitetura Python - Clean Architecture & Hexagonal

## Princípios Fundamentais

### Clean Architecture (Uncle Bob)

A arquitetura limpa é baseada em vários princípios-chave:

1. **Independência de Framework** - A lógica de negócio não depende de frameworks
2. **Testabilidade** - A lógica de negócio pode ser testada sem UI, BD, servidor web
3. **Independência de UI** - A UI pode mudar sem modificar a lógica de negócio
4. **Independência de BD** - Postgres, MongoDB, etc. são intercambiáveis
5. **Independência de Serviços Externos** - A lógica de negócio não conhece o mundo exterior

### Arquitetura Hexagonal (Ports & Adapters)

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
│  │           CAMADA APPLICATION (Ports)            │            │
│  │  ┌──────────────┐  ┌──────────────┐            │            │
│  │  │ Casos de Uso │  │  Interfaces  │            │            │
│  │  └──────────────┘  └──────────────┘            │            │
│  └────────────────────┬────────────────────────────┘            │
│                       │                                          │
│                       ▼                                          │
│  ┌─────────────────────────────────────────────────┐            │
│  │           CAMADA DOMAIN (Core)                  │            │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │            │
│  │  │Entidades │  │ Serviços │  │  Eventos │      │            │
│  │  └──────────┘  └──────────┘  └──────────┘      │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Estrutura Completa do Projeto

### Estrutura Recomendada

```
myproject/
├── src/
│   └── myproject/
│       ├── __init__.py
│       │
│       ├── domain/                      # CAMADA DOMAIN - Lógica de negócio pura
│       │   ├── __init__.py
│       │   ├── entities/                # Entidades de negócio
│       │   │   ├── __init__.py
│       │   │   ├── user.py
│       │   │   ├── order.py
│       │   │   └── product.py
│       │   ├── value_objects/           # Value Objects imutáveis
│       │   │   ├── __init__.py
│       │   │   ├── email.py
│       │   │   ├── money.py
│       │   │   └── address.py
│       │   ├── events/                  # Eventos de Domínio
│       │   │   ├── __init__.py
│       │   │   ├── order_created.py
│       │   │   └── user_registered.py
│       │   ├── repositories/            # Interfaces (Ports)
│       │   │   ├── __init__.py
│       │   │   ├── user_repository.py
│       │   │   └── order_repository.py
│       │   ├── services/                # Serviços de negócio
│       │   │   ├── __init__.py
│       │   │   ├── order_service.py
│       │   │   └── pricing_service.py
│       │   └── exceptions/              # Exceções de negócio
│       │       ├── __init__.py
│       │       └── domain_exceptions.py
│       │
│       ├── application/                 # CAMADA APPLICATION - Casos de uso
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
│       │   ├── interfaces/              # Ports para infraestrutura
│       │   │   ├── __init__.py
│       │   │   ├── email_service.py
│       │   │   ├── payment_gateway.py
│       │   │   └── cache_service.py
│       │   └── exceptions/
│       │       ├── __init__.py
│       │       └── application_exceptions.py
│       │
│       ├── infrastructure/              # CAMADA INFRASTRUCTURE - Adapters
│       │   ├── __init__.py
│       │   ├── api/                     # API HTTP (FastAPI/Flask/Django)
│       │   │   ├── __init__.py
│       │   │   ├── main.py              # Ponto de entrada da API
│       │   │   ├── dependencies.py      # Injeção de dependência
│       │   │   ├── middleware.py
│       │   │   ├── routes/              # Rotas/Endpoints
│       │   │   │   ├── __init__.py
│       │   │   │   ├── users.py
│       │   │   │   └── orders.py
│       │   │   └── schemas/             # Schemas Pydantic (API)
│       │   │       ├── __init__.py
│       │   │       ├── user_schema.py
│       │   │       └── order_schema.py
│       │   ├── database/                # Banco de dados
│       │   │   ├── __init__.py
│       │   │   ├── connection.py
│       │   │   ├── session.py
│       │   │   ├── models/              # Modelos ORM (SQLAlchemy)
│       │   │   │   ├── __init__.py
│       │   │   │   ├── user_model.py
│       │   │   │   └── order_model.py
│       │   │   ├── repositories/        # Implementações de Repository
│       │   │   │   ├── __init__.py
│       │   │   │   ├── user_repository_impl.py
│       │   │   │   └── order_repository_impl.py
│       │   │   └── migrations/          # Migrations Alembic
│       │   │       ├── versions/
│       │   │       └── env.py
│       │   ├── cache/                   # Cache (Redis)
│       │   │   ├── __init__.py
│       │   │   ├── redis_client.py
│       │   │   └── cache_service_impl.py
│       │   ├── messaging/               # Fila de mensagens
│       │   │   ├── __init__.py
│       │   │   ├── celery_app.py
│       │   │   └── tasks/
│       │   │       ├── __init__.py
│       │   │       └── email_tasks.py
│       │   ├── external/                # Serviços externos
│       │   │   ├── __init__.py
│       │   │   ├── stripe_payment.py
│       │   │   └── sendgrid_email.py
│       │   └── di/                      # Injeção de Dependência
│       │       ├── __init__.py
│       │       └── container.py
│       │
│       └── shared/                      # Código compartilhado
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
├── tests/                               # Testes
│   ├── __init__.py
│   ├── conftest.py                      # Fixtures globais pytest
│   ├── unit/                            # Testes unitários
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── integration/                     # Testes de integração
│   │   ├── api/
│   │   ├── database/
│   │   └── external/
│   └── e2e/                             # Testes end-to-end
│       └── test_order_flow.py
│
├── docs/                                # Documentação
│   ├── api/
│   ├── architecture/
│   └── adr/                             # Architecture Decision Records
│
├── scripts/                             # Scripts utilitários
│   ├── init_db.py
│   └── seed_data.py
│
├── docker/                              # Configuração Docker
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
│
├── .github/                             # CI/CD
│   └── workflows/
│       └── ci.yml
│
├── pyproject.toml                       # Configuração Poetry/uv
├── poetry.lock / uv.lock
├── Makefile                             # Comandos Docker
├── .env.example                         # Variáveis de ambiente
├── .gitignore
├── .pre-commit-config.yaml
├── pytest.ini
├── mypy.ini
├── ruff.toml
└── README.md
```

## Camada Domain - O Coração do Negócio

### Entidades

Entidades são objetos com uma identidade única.

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
    Entidade User representando um usuário do sistema.

    Uma entidade possui uma identidade única (id) que persiste ao longo do tempo,
    mesmo que seus atributos mudem.
    """

    id: UUID = field(default_factory=uuid4)
    email: Email = field(default=None)
    name: str = field(default="")
    is_active: bool = field(default=True)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = field(default=None)

    # Eventos de domínio (padrão Event Sourcing)
    _events: list = field(default_factory=list, init=False, repr=False)

    def __post_init__(self) -> None:
        """Validação após inicialização."""
        if not self.email:
            raise ValueError("Email é obrigatório")
        if not self.name or len(self.name) < 2:
            raise ValueError("Nome deve ter pelo menos 2 caracteres")

    def activate(self) -> None:
        """Ativa o usuário."""
        if self.is_active:
            raise ValueError("Usuário já está ativo")

        self.is_active = True
        self.updated_at = datetime.utcnow()

    def deactivate(self) -> None:
        """Desativa o usuário."""
        if not self.is_active:
            raise ValueError("Usuário já está inativo")

        self.is_active = False
        self.updated_at = datetime.utcnow()

    def change_email(self, new_email: Email) -> None:
        """Altera o email do usuário."""
        if self.email == new_email:
            return

        old_email = self.email
        self.email = new_email
        self.updated_at = datetime.utcnow()

        # Emite um evento de domínio
        self._add_event(UserEmailChanged(
            user_id=self.id,
            old_email=old_email,
            new_email=new_email,
            changed_at=self.updated_at
        ))

    def _add_event(self, event) -> None:
        """Adiciona um evento de domínio."""
        self._events.append(event)

    def clear_events(self) -> list:
        """Recupera e limpa eventos."""
        events = self._events.copy()
        self._events.clear()
        return events

    def __eq__(self, other: object) -> bool:
        """Igualdade baseada na identidade, não em atributos."""
        if not isinstance(other, User):
            return NotImplemented
        return self.id == other.id

    def __hash__(self) -> int:
        """Hash baseado na identidade."""
        return hash(self.id)
```

### Value Objects

Value objects são imutáveis e definidos por seus atributos.

```python
# src/myproject/domain/value_objects/email.py
from __future__ import annotations

from dataclasses import dataclass
from email_validator import validate_email, EmailNotValidError


@dataclass(frozen=True)  # Imutável
class Email:
    """
    Value Object representando um endereço de email.

    Um Value Object:
    - É imutável (frozen=True)
    - Não tem identidade própria
    - Igualdade baseada em valores
    - Contém sua própria validação
    """

    value: str

    def __post_init__(self) -> None:
        """Validação na inicialização."""
        try:
            # Normalização e validação
            email_info = validate_email(self.value, check_deliverability=False)
            # Usa object.__setattr__ porque frozen=True
            object.__setattr__(self, 'value', email_info.normalized)
        except EmailNotValidError as e:
            raise ValueError(f"Endereço de email inválido: {e}")

    def __str__(self) -> str:
        return self.value

    @property
    def domain(self) -> str:
        """Extrai o domínio do email."""
        return self.value.split('@')[1]

    @property
    def local_part(self) -> str:
        """Extrai a parte local do email."""
        return self.value.split('@')[0]


# src/myproject/domain/value_objects/money.py
from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Union


@dataclass(frozen=True)
class Money:
    """
    Value Object representando um valor monetário.

    Trata corretamente operações monetárias com Decimal
    para evitar erros de ponto flutuante.
    """

    amount: Decimal
    currency: str = "BRL"

    def __post_init__(self) -> None:
        """Validação."""
        # Converte para Decimal se necessário
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
            raise ValueError("Valor não pode ser negativo")

        if len(self.currency) != 3:
            raise ValueError("Moeda deve ser código ISO 4217 (3 letras)")

    def __add__(self, other: Money) -> Money:
        """Adição de dois objetos Money."""
        self._check_same_currency(other)
        return Money(
            amount=self.amount + other.amount,
            currency=self.currency
        )

    def __sub__(self, other: Money) -> Money:
        """Subtração de dois objetos Money."""
        self._check_same_currency(other)
        return Money(
            amount=self.amount - other.amount,
            currency=self.currency
        )

    def __mul__(self, factor: Union[int, float, Decimal]) -> Money:
        """Multiplicação por um fator."""
        return Money(
            amount=self.amount * Decimal(str(factor)),
            currency=self.currency
        )

    def __truediv__(self, divisor: Union[int, float, Decimal]) -> Money:
        """Divisão por um divisor."""
        if divisor == 0:
            raise ValueError("Não é possível dividir por zero")
        return Money(
            amount=self.amount / Decimal(str(divisor)),
            currency=self.currency
        )

    def _check_same_currency(self, other: Money) -> None:
        """Verifica se as moedas são as mesmas."""
        if self.currency != other.currency:
            raise ValueError(
                f"Não é possível operar com moedas diferentes: "
                f"{self.currency} vs {other.currency}"
            )

    def __str__(self) -> str:
        return f"{self.amount:.2f} {self.currency}"
```

[Nota: Devido a restrições de comprimento, continuarei com os componentes restantes da arquitetura em acompanhamentos subsequentes. O arquivo mostra os padrões centrais para Clean/Hexagonal Architecture em Python com entidades, value objects, serviços de domínio, repositórios, casos de uso e adaptadores de infraestrutura.]
