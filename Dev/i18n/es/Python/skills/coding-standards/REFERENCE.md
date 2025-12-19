# Regla 03: Estándares de Codificación

## Cumplimiento de PEP 8

Seguir la Propuesta de Mejora de Python 8 (PEP 8) para el estilo de código.

### Convenciones de Nomenclatura

```python
# Clases: PascalCase
class UserRepository:
    pass

# Funciones y variables: snake_case
def calculate_total_price():
    user_count = 10

# Constantes: UPPER_CASE
MAX_RETRY_ATTEMPTS = 3
DATABASE_URL = "postgresql://localhost/db"

# Atributos privados: prefijo con guión bajo
class BankAccount:
    def __init__(self):
        self._balance = 0  # Privado

# Atributos protegidos: guión bajo simple
class BaseRepository:
    def __init__(self):
        self._session = None  # Protegido
```

### Formato del Código

- **Indentación**: 4 espacios (sin tabs)
- **Longitud de línea**: Máximo 88 caracteres (estándar Black)
- **Líneas en blanco**:
  - 2 líneas en blanco antes de clases y funciones de nivel superior
  - 1 línea en blanco entre métodos en una clase
- **Importaciones**:
  - Librería estándar
  - Librerías de terceros
  - Importaciones locales
  - Separadas por líneas en blanco

```python
# Librería estándar
import os
import sys
from datetime import datetime

# Terceros
from fastapi import FastAPI
from pydantic import BaseModel
import sqlalchemy

# Local
from myproject.domain.entities.user import User
from myproject.infrastructure.database import get_session
```

### Docstrings

Usar docstrings estilo Google para todos los módulos, clases y funciones públicas.

```python
def calculate_order_total(
    items: list[OrderItem],
    tax_rate: Decimal,
    discount: Optional[Decimal] = None
) -> Money:
    """
    Calcula el monto total de una orden.

    Aplica descuentos e impuestos según las reglas de negocio.
    El total no puede ser negativo.

    Args:
        items: Lista de artículos en la orden
        tax_rate: Tasa de impuesto a aplicar (ejemplo: Decimal("0.20") para 20%)
        discount: Descuento opcional a aplicar (por defecto: None)

    Returns:
        Monto total incluyendo impuestos y descuentos

    Raises:
        ValueError: Si la lista de artículos está vacía
        ValueError: Si la tasa de impuesto es negativa

    Example:
        >>> items = [OrderItem(price=Money(100), quantity=2)]
        >>> total = calculate_order_total(items, Decimal("0.20"))
        >>> total.amount
        Decimal("240.00")
    """
    pass
```

## Anotaciones de Tipo

Tipar todos los parámetros de función y valores de retorno.

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
    """Procesa un usuario."""
    pass

# Optional (nullable)
def find_user(user_id: str) -> Optional[User]:
    """Devuelve User o None si no se encuentra."""
    pass

# Union (múltiples tipos posibles)
def parse_id(value: Union[str, int]) -> str:
    """Acepta str o int, devuelve str."""
    return str(value)

# Sintaxis moderna Python 3.10+
def parse_id(value: str | int) -> str:
    return str(value)
```

### Colecciones

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

# Sequence (más genérico que list)
def count_items(items: Sequence[str]) -> int:
    return len(items)
```

### Protocolos e Interfaces

```python
from typing import Protocol

class Closeable(Protocol):
    """Protocolo para recursos cerrables."""

    def close(self) -> None:
        """Cierra el recurso."""
        ...

class Saveable(Protocol):
    """Protocolo para entidades guardables."""

    def save(self) -> None:
        """Guarda la entidad."""
        ...

def cleanup_resource(resource: Closeable) -> None:
    """Cierra cualquier recurso cerrable."""
    resource.close()
```

### Genéricos

```python
from typing import TypeVar, Generic

T = TypeVar('T')

class Repository(Generic[T]):
    """Repositorio genérico."""

    def find_by_id(self, entity_id: str) -> Optional[T]:
        pass

    def save(self, entity: T) -> T:
        pass

# Uso
user_repo: Repository[User] = UserRepository()
product_repo: Repository[Product] = ProductRepository()
```

## Manejo de Errores

### Excepciones Específicas

Siempre capturar y lanzar excepciones específicas, no `Exception` genérica.

```python
# ❌ Malo
try:
    result = risky_operation()
except Exception:
    pass  # Silenciosamente ignora todos los errores

# ✅ Bueno
try:
    result = risky_operation()
except FileNotFoundError as e:
    logger.error(f"Archivo no encontrado: {e}")
    raise
except PermissionError as e:
    logger.error(f"Permiso denegado: {e}")
    raise
```

### Excepciones Personalizadas

Crear excepciones personalizadas para el dominio de negocio.

```python
# domain/exceptions.py
class DomainException(Exception):
    """Excepción base para errores de dominio."""
    pass

class UserNotFoundError(DomainException):
    """Usuario no encontrado."""

    def __init__(self, user_id: str):
        self.user_id = user_id
        super().__init__(f"Usuario no encontrado: {user_id}")

class InsufficientBalanceError(DomainException):
    """Saldo insuficiente para la operación."""

    def __init__(self, required: Decimal, available: Decimal):
        self.required = required
        self.available = available
        super().__init__(
            f"Saldo insuficiente: requerido {required}, disponible {available}"
        )
```

### Gestores de Contexto

Usar gestores de contexto para el manejo de recursos.

```python
# ❌ Malo
file = open("data.txt")
content = file.read()
file.close()

# ✅ Bueno
with open("data.txt") as file:
    content = file.read()
# Archivo automáticamente cerrado

# Gestor de contexto personalizado
from contextlib import contextmanager

@contextmanager
def database_transaction(session):
    """Gestor de contexto para transacción de base de datos."""
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
# Automáticamente hace commit o rollback
```

## Documentación

### Docstrings de Módulo

```python
"""
Módulo de gestión de usuarios.

Este módulo contiene entidades de dominio de usuario, value objects,
y reglas de negocio relacionadas con la gestión de usuarios.

Classes:
    User: Entidad de dominio de usuario
    Email: Value object de email
    UserRole: Enumeración de roles de usuario

Example:
    >>> from myproject.domain.user import User, Email
    >>> user = User(name="John", email=Email("john@example.com"))
"""
```

### Comentarios en Línea

Comentar solo el "por qué", no el "qué".

```python
# ❌ Mal comentario (explica qué hace el código)
# Incrementar contador en 1
counter += 1

# ✅ Buen comentario (explica por qué)
# Compensar por indexación basada en cero
counter += 1

# ✅ Buen comentario (explica regla de negocio)
# Según GDPR, guardamos datos de usuario por máximo 3 años
retention_days = 365 * 3
```

### TODOs y FIXMEs

Usar comentarios estandarizados para trabajo pendiente.

```python
# TODO: Implementar caché para consultas de usuario
# TODO(john): Agregar soporte para operaciones por lotes
# FIXME: Manejar caso cuando API devuelve 429
# HACK: Workaround temporal hasta que la librería corrija bug #123
# NOTE: Esta implementación está intencionalmente simplificada
```

**Importante**: Los TODOs deben rastrearse en el sistema de seguimiento de issues del proyecto.

## Organización del Código

### Estructura de Archivos

```
src/myproject/
├── domain/              # Capa de dominio (lógica de negocio)
│   ├── entities/        # Entidades de dominio
│   ├── value_objects/   # Value objects
│   ├── repositories/    # Interfaces de repositorio (ports)
│   ├── services/        # Servicios de dominio
│   └── exceptions.py    # Excepciones de dominio
│
├── application/         # Capa de aplicación (casos de uso)
│   ├── use_cases/       # Casos de uso / Servicios de aplicación
│   ├── dtos/           # Data Transfer Objects
│   └── commands/       # Comandos
│
├── infrastructure/     # Capa de infraestructura (adaptadores externos)
│   ├── database/       # Base de datos (SQLAlchemy, etc.)
│   ├── api/           # API (FastAPI, etc.)
│   ├── messaging/     # Message broker (RabbitMQ, etc.)
│   └── external/      # Servicios externos (clientes HTTP, etc.)
│
└── config/            # Configuración
    ├── settings.py    # Configuración de aplicación
    └── dependencies.py # Inyección de dependencias
```

### Orden de Importaciones

```python
# 1. Librería estándar
import os
import sys
from datetime import datetime
from typing import Optional

# 2. Terceros
from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy.orm import Session

# 3. Aplicación local
from myproject.domain.entities.user import User
from myproject.domain.repositories.user_repository import UserRepository
from myproject.infrastructure.database.session import get_session
```

## Mejores Prácticas de Seguridad

### Nunca Codificar Secretos en Duro

```python
# ❌ Nunca hacer esto
API_KEY = "sk_live_abc123def456"
DATABASE_PASSWORD = "password123"

# ✅ Usar variables de entorno
import os

API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise ValueError("Variable de entorno API_KEY no establecida")
```

### Validación de Entrada

Siempre validar entradas de usuario con Pydantic.

```python
from pydantic import BaseModel, Field, validator

class CreateUserDTO(BaseModel):
    """DTO para crear un usuario."""

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
        """Valida fortaleza de contraseña."""
        if not any(char.isdigit() for char in v):
            raise ValueError('La contraseña debe contener al menos un dígito')
        return v
```

### Prevención de Inyección SQL

Siempre usar consultas parametrizadas.

```python
# ❌ Vulnerable a inyección SQL
def find_user(email: str):
    query = f"SELECT * FROM users WHERE email = '{email}'"
    return db.execute(query)

# ✅ Seguro con consulta parametrizada
def find_user(email: str):
    query = "SELECT * FROM users WHERE email = :email"
    return db.execute(query, {"email": email})

# ✅ Aún mejor con ORM
def find_user(email: str):
    return session.query(User).filter(User.email == email).first()
```

## Registro de Eventos (Logging)

Usar el módulo `logging` de Python, no `print()`.

```python
import logging

logger = logging.getLogger(__name__)

# Niveles de log: DEBUG, INFO, WARNING, ERROR, CRITICAL
logger.debug("Información detallada para depuración")
logger.info("Información general")
logger.warning("Mensaje de advertencia")
logger.error("Ocurrió un error")
logger.critical("Error crítico")

# Con contexto
logger.info(
    "Usuario creado exitosamente",
    extra={
        "user_id": user.id,
        "email": user.email,
        "request_id": request_id
    }
)

# Registro de excepciones
try:
    risky_operation()
except Exception as e:
    logger.error("Operación falló", exc_info=True)
    raise
```

## Pruebas

Las pruebas también deben seguir estándares de codificación.

```python
# tests/unit/domain/test_user.py
import pytest
from myproject.domain.entities.user import User
from myproject.domain.exceptions import InvalidEmailError


class TestUser:
    """Pruebas para la entidad User."""

    def test_create_user_with_valid_data(self):
        """Prueba creación de usuario con datos válidos."""
        # Arrange
        name = "John Doe"
        email = "john@example.com"

        # Act
        user = User(name=name, email=email)

        # Assert
        assert user.name == name
        assert user.email == email

    def test_create_user_with_invalid_email_raises_error(self):
        """Prueba que email inválido lanza error."""
        # Act & Assert
        with pytest.raises(InvalidEmailError):
            User(name="John", email="invalid-email")
```

## Configuración de Herramientas

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

## Lista de Verificación

Antes de hacer commit:

- [ ] El código sigue PEP 8
- [ ] Todas las funciones públicas tienen docstrings
- [ ] Todos los parámetros y retornos tienen anotaciones de tipo
- [ ] No hay secretos codificados en duro
- [ ] Las excepciones son específicas y bien manejadas
- [ ] Las importaciones están organizadas
- [ ] `black` e `isort` aplicados
- [ ] `ruff` pasa sin errores
- [ ] `mypy` pasa en modo estricto
