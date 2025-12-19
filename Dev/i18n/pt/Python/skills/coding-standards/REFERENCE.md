# Regra 03: Padrões de Codificação

## Conformidade com PEP 8

Siga o Python Enhancement Proposal 8 (PEP 8) para estilo de código.

### Convenções de Nomenclatura

```python
# Classes: PascalCase
class UserRepository:
    pass

# Funções e variáveis: snake_case
def calculate_total_price():
    user_count = 10

# Constantes: UPPER_CASE
MAX_RETRY_ATTEMPTS = 3
DATABASE_URL = "postgresql://localhost/db"

# Atributos privados: prefixo com underscore
class BankAccount:
    def __init__(self):
        self._balance = 0  # Privado

# Atributos protegidos: underscore único
class BaseRepository:
    def __init__(self):
        self._session = None  # Protegido
```

### Formatação de Código

- **Indentação**: 4 espaços (sem tabs)
- **Comprimento de linha**: Máximo 88 caracteres (padrão Black)
- **Linhas em branco**:
  - 2 linhas em branco antes de classes e funções de nível superior
  - 1 linha em branco entre métodos em uma classe
- **Imports**:
  - Biblioteca padrão
  - Bibliotecas de terceiros
  - Imports locais
  - Separados por linhas em branco

```python
# Biblioteca padrão
import os
import sys
from datetime import datetime

# Terceiros
from fastapi import FastAPI
from pydantic import BaseModel
import sqlalchemy

# Local
from myproject.domain.entities.user import User
from myproject.infrastructure.database import get_session
```

### Docstrings

Use docstrings estilo Google para todos os módulos, classes e funções públicas.

```python
def calculate_order_total(
    items: list[OrderItem],
    tax_rate: Decimal,
    discount: Optional[Decimal] = None
) -> Money:
    """
    Calcula o valor total de um pedido.

    Aplica descontos e impostos de acordo com as regras de negócio.
    O total não pode ser negativo.

    Args:
        items: Lista de itens do pedido
        tax_rate: Taxa de imposto a aplicar (exemplo: Decimal("0.20") para 20%)
        discount: Desconto opcional a aplicar (padrão: None)

    Returns:
        Valor total incluindo impostos e descontos

    Raises:
        ValueError: Se a lista de itens estiver vazia
        ValueError: Se a taxa de imposto for negativa

    Example:
        >>> items = [OrderItem(price=Money(100), quantity=2)]
        >>> total = calculate_order_total(items, Decimal("0.20"))
        >>> total.amount
        Decimal("240.00")
    """
    pass
```

## Type Hints

Tipifique todos os parâmetros de função e valores de retorno.

### Tipos Básicos

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
    """Processa um usuário."""
    pass

# Optional (nullable)
def find_user(user_id: str) -> Optional[User]:
    """Retorna User ou None se não encontrado."""
    pass

# Union (múltiplos tipos possíveis)
def parse_id(value: Union[str, int]) -> str:
    """Aceita str ou int, retorna str."""
    return str(value)

# Sintaxe moderna Python 3.10+
def parse_id(value: str | int) -> str:
    return str(value)
```

### Coleções

```python
from collections.abc import Sequence, Mapping

# Listas
def process_users(users: list[User]) -> list[str]:
    return [u.email for u in users]

# Dicts
def get_config() -> dict[str, str]:
    return {"key": "value"}

# Tuplas
def get_coordinates() -> tuple[float, float]:
    return (48.8566, 2.3522)

# Sets
def get_unique_tags() -> set[str]:
    return {"python", "fastapi"}

# Sequence (mais genérico que list)
def count_items(items: Sequence[str]) -> int:
    return len(items)
```

### Protocols e Interfaces

```python
from typing import Protocol

class Closeable(Protocol):
    """Protocol para recursos que podem ser fechados."""

    def close(self) -> None:
        """Fecha o recurso."""
        ...

class Saveable(Protocol):
    """Protocol para entidades que podem ser salvas."""

    def save(self) -> None:
        """Salva a entidade."""
        ...

def cleanup_resource(resource: Closeable) -> None:
    """Fecha qualquer recurso que seja Closeable."""
    resource.close()
```

### Genéricos

```python
from typing import TypeVar, Generic

T = TypeVar('T')

class Repository(Generic[T]):
    """Repositório genérico."""

    def find_by_id(self, entity_id: str) -> Optional[T]:
        pass

    def save(self, entity: T) -> T:
        pass

# Uso
user_repo: Repository[User] = UserRepository()
product_repo: Repository[Product] = ProductRepository()
```

## Tratamento de Erros

### Exceções Específicas

Sempre capture e levante exceções específicas, não `Exception` genérica.

```python
# ❌ Ruim
try:
    result = risky_operation()
except Exception:
    pass  # Ignora silenciosamente todos os erros

# ✅ Bom
try:
    result = risky_operation()
except FileNotFoundError as e:
    logger.error(f"Arquivo não encontrado: {e}")
    raise
except PermissionError as e:
    logger.error(f"Permissão negada: {e}")
    raise
```

### Exceções Customizadas

Crie exceções customizadas para o domínio de negócio.

```python
# domain/exceptions.py
class DomainException(Exception):
    """Exceção base para erros de domínio."""
    pass

class UserNotFoundError(DomainException):
    """Usuário não encontrado."""

    def __init__(self, user_id: str):
        self.user_id = user_id
        super().__init__(f"Usuário não encontrado: {user_id}")

class InsufficientBalanceError(DomainException):
    """Saldo insuficiente para operação."""

    def __init__(self, required: Decimal, available: Decimal):
        self.required = required
        self.available = available
        super().__init__(
            f"Saldo insuficiente: necessário {required}, disponível {available}"
        )
```

### Context Managers

Use context managers para gerenciamento de recursos.

```python
# ❌ Ruim
file = open("data.txt")
content = file.read()
file.close()

# ✅ Bom
with open("data.txt") as file:
    content = file.read()
# Arquivo fechado automaticamente

# Context manager customizado
from contextlib import contextmanager

@contextmanager
def database_transaction(session):
    """Context manager para transação de banco de dados."""
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# Uso
with database_transaction(session) as db:
    user = User(name="John")
    db.add(user)
# Commit ou rollback automático
```

## Documentação

### Docstrings de Módulo

```python
"""
Módulo de gerenciamento de usuários.

Este módulo contém entidades de domínio de usuário, value objects,
e regras de negócio relacionadas ao gerenciamento de usuários.

Classes:
    User: Entidade de domínio de usuário
    Email: Value object de email
    UserRole: Enumeração de papel de usuário

Example:
    >>> from myproject.domain.user import User, Email
    >>> user = User(name="John", email=Email("john@example.com"))
"""
```

### Comentários Inline

Comente apenas o "porquê", não o "o quê".

```python
# ❌ Comentário ruim (explica o que o código faz)
# Incrementa contador por 1
counter += 1

# ✅ Comentário bom (explica o porquê)
# Compensa indexação baseada em zero
counter += 1

# ✅ Comentário bom (explica regra de negócio)
# De acordo com LGPD, mantemos dados do usuário por 3 anos no máximo
retention_days = 365 * 3
```

### TODOs e FIXMEs

Use comentários padronizados para trabalho pendente.

```python
# TODO: Implementar cache para consultas de usuário
# TODO(john): Adicionar suporte para operações em lote
# FIXME: Tratar caso quando API retorna 429
# HACK: Solução temporária até biblioteca corrigir bug #123
# NOTE: Esta implementação é intencionalmente simplificada
```

**Importante**: TODOs devem ser rastreados no issue tracker do projeto.

## Organização de Código

### Estrutura de Arquivos

```
src/myproject/
├── domain/              # Camada de domínio (lógica de negócio)
│   ├── entities/        # Entidades de domínio
│   ├── value_objects/   # Value objects
│   ├── repositories/    # Interfaces de repositório (ports)
│   ├── services/        # Serviços de domínio
│   └── exceptions.py    # Exceções de domínio
│
├── application/         # Camada de aplicação (casos de uso)
│   ├── use_cases/       # Casos de uso / Serviços de aplicação
│   ├── dtos/           # Data Transfer Objects
│   └── commands/       # Comandos
│
├── infrastructure/     # Camada de infraestrutura (adaptadores externos)
│   ├── database/       # Banco de dados (SQLAlchemy, etc.)
│   ├── api/           # API (FastAPI, etc.)
│   ├── messaging/     # Message broker (RabbitMQ, etc.)
│   └── external/      # Serviços externos (clientes HTTP, etc.)
│
└── config/            # Configuração
    ├── settings.py    # Configurações da aplicação
    └── dependencies.py # Injeção de dependência
```

### Ordem de Imports

```python
# 1. Biblioteca padrão
import os
import sys
from datetime import datetime
from typing import Optional

# 2. Terceiros
from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy.orm import Session

# 3. Aplicação local
from myproject.domain.entities.user import User
from myproject.domain.repositories.user_repository import UserRepository
from myproject.infrastructure.database.session import get_session
```

## Melhores Práticas de Segurança

### Nunca Hardcode Secrets

```python
# ❌ Nunca faça isso
API_KEY = "sk_live_abc123def456"
DATABASE_PASSWORD = "password123"

# ✅ Use variáveis de ambiente
import os

API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise ValueError("Variável de ambiente API_KEY não definida")
```

### Validação de Entrada

Sempre valide entradas do usuário com Pydantic.

```python
from pydantic import BaseModel, Field, validator

class CreateUserDTO(BaseModel):
    """DTO para criar um usuário."""

    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8)
    age: int = Field(..., ge=18, le=150)

    @validator('email')
    def validate_email(cls, v):
        """Valida formato de email."""
        if '@' not in v:
            raise ValueError('Formato de email inválido')
        return v.lower()

    @validator('password')
    def validate_password(cls, v):
        """Valida força da senha."""
        if not any(char.isdigit() for char in v):
            raise ValueError('Senha deve conter pelo menos um dígito')
        return v
```

### Prevenção de SQL Injection

Sempre use queries parametrizadas.

```python
# ❌ Vulnerável a SQL injection
def find_user(email: str):
    query = f"SELECT * FROM users WHERE email = '{email}'"
    return db.execute(query)

# ✅ Seguro com query parametrizada
def find_user(email: str):
    query = "SELECT * FROM users WHERE email = :email"
    return db.execute(query, {"email": email})

# ✅ Ainda melhor com ORM
def find_user(email: str):
    return session.query(User).filter(User.email == email).first()
```

## Logging

Use o módulo `logging` do Python, não `print()`.

```python
import logging

logger = logging.getLogger(__name__)

# Níveis de log: DEBUG, INFO, WARNING, ERROR, CRITICAL
logger.debug("Informação detalhada para debug")
logger.info("Informação geral")
logger.warning("Mensagem de aviso")
logger.error("Ocorreu um erro")
logger.critical("Erro crítico")

# Com contexto
logger.info(
    "Usuário criado com sucesso",
    extra={
        "user_id": user.id,
        "email": user.email,
        "request_id": request_id
    }
)

# Logging de exceções
try:
    risky_operation()
except Exception as e:
    logger.error("Operação falhou", exc_info=True)
    raise
```

## Testes

Testes também devem seguir padrões de codificação.

```python
# tests/unit/domain/test_user.py
import pytest
from myproject.domain.entities.user import User
from myproject.domain.exceptions import InvalidEmailError


class TestUser:
    """Testes para entidade User."""

    def test_create_user_with_valid_data(self):
        """Testa criação de usuário com dados válidos."""
        # Arrange
        name = "John Doe"
        email = "john@example.com"

        # Act
        user = User(name=name, email=email)

        # Assert
        assert user.name == name
        assert user.email == email

    def test_create_user_with_invalid_email_raises_error(self):
        """Testa que email inválido levanta erro."""
        # Act & Assert
        with pytest.raises(InvalidEmailError):
            User(name="John", email="invalid-email")
```

## Configuração de Ferramentas

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

Antes de commitar:

- [ ] Código segue PEP 8
- [ ] Todas as funções públicas têm docstrings
- [ ] Todos os parâmetros e retornos têm type hints
- [ ] Sem secrets hardcoded
- [ ] Exceções são específicas e bem tratadas
- [ ] Imports estão organizados
- [ ] `black` e `isort` aplicados
- [ ] `ruff` passa sem erros
- [ ] `mypy` passa em modo strict
