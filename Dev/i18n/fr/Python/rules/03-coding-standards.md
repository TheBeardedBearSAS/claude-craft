# Standards de Code Python

## PEP 8 - Style Guide for Python Code

### Import Organization

```python
# 1. Standard library imports
import os
import sys
from datetime import datetime
from typing import Optional, Protocol
from uuid import UUID, uuid4

# 2. Related third party imports
import numpy as np
import pandas as pd
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

# 3. Local application/library imports
from myproject.domain.entities.user import User
from myproject.domain.value_objects.email import Email
from myproject.application.use_cases.create_user import CreateUserUseCase

# Ordre alphabétique dans chaque groupe
# Séparation par ligne vide entre groupes
```

### Règles d'import

```python
# ✅ BON: Imports explicites
from typing import Optional, List, Dict

# ❌ MAUVAIS: Import wildcard
from typing import *

# ✅ BON: Import absolu
from myproject.domain.entities.user import User

# ❌ MAUVAIS: Import relatif pour packages non adjacents
from ....domain.entities.user import User

# ✅ ACCEPTABLE: Import relatif pour packages adjacents
from .user import User  # Dans le même package
from ..entities.user import User  # Package parent

# ✅ BON: Alias pour éviter les conflits
from myproject.domain.entities.user import User as DomainUser
from myproject.infrastructure.models.user import User as UserModel
```

### Longueur de Ligne

```python
# Maximum 88 caractères (Black) ou 79 (PEP 8)
# Pour les docstrings et commentaires: 72 caractères

# ✅ BON: Continuation implicite
result = some_function(
    argument1,
    argument2,
    argument3,
    keyword_arg1=value1,
    keyword_arg2=value2
)

# ✅ BON: Continuation avec parenthèses
if (this_is_one_thing
    and that_is_another_thing
    and yet_another_condition):
    do_something()

# ✅ BON: Chaînage de méthodes
result = (
    some_dataframe
    .filter(lambda x: x > 0)
    .groupby('category')
    .sum()
)

# ❌ MAUVAIS: Backslash
result = some_very_long_function_name(argument1, argument2, \
                                      argument3, argument4)
```

### Indentation

```python
# ✅ BON: 4 espaces par niveau d'indentation
def long_function_name(
    var_one,
    var_two,
    var_three,
    var_four
):
    print(var_one)

# ✅ BON: Alignement sur le délimiteur
foo = long_function_name(
    var_one, var_two,
    var_three, var_four
)

# ✅ BON: Hanging indent
foo = long_function_name(
    var_one,
    var_two,
    var_three,
    var_four
)
```

### Espacement

```python
# ✅ BON: Espaces autour des opérateurs
i = i + 1
submitted += 1
x = x * 2 - 1
hypot2 = x * x + y * y
c = (a + b) * (a - b)

# ❌ MAUVAIS: Pas d'espaces ou trop d'espaces
i=i+1
submitted +=1
x = x*2 - 1
hypot2 = x*x + y*y
c = (a+b) * (a-b)

# ✅ BON: Pas d'espaces pour les arguments de fonction
spam(ham[1], {eggs: 2})
dct['key'] = lst[index]

# ❌ MAUVAIS
spam( ham[ 1 ], { eggs: 2 } )
dct ['key'] = lst [index]

# ✅ BON: Un espace après la virgule
def complex(real, imag=0.0):
    return magic(r=real, i=imag)

# ❌ MAUVAIS
def complex(real,imag = 0.0):
    return magic(r = real,i = imag)
```

### Naming Conventions

```python
# MODULES ET PACKAGES
# snake_case, court, lowercase
# ✅ myproject, user_service, data_processor
# ❌ MyProject, UserService, data-processor

# CLASSES
# PascalCase (CapWords)
# ✅ UserService, OrderRepository, EmailAddress
# ❌ user_service, orderRepository, email_address

class UserService:
    pass

class HTTPResponseError(Exception):
    pass

# FONCTIONS ET MÉTHODES
# snake_case
# ✅ get_user, calculate_total, send_email
# ❌ getUser, CalculateTotal, SendEmail

def calculate_order_total(order):
    pass

# VARIABLES
# snake_case
# ✅ user_count, total_amount, is_active
# ❌ userCount, TotalAmount, IsActive

user_count = 10
total_amount = 100.50
is_active = True

# CONSTANTES
# UPPER_CASE with underscores
# ✅ MAX_RETRIES, DEFAULT_TIMEOUT, API_BASE_URL
# ❌ max_retries, DefaultTimeout, apiBaseUrl

MAX_RETRIES = 3
DEFAULT_TIMEOUT = 30
API_BASE_URL = "https://api.example.com"

# VARIABLES PRIVÉES
# Préfixe underscore simple
# ✅ _internal_cache, _process_data
# ❌ __private_var (double underscore = name mangling, rarement nécessaire)

class MyClass:
    def __init__(self):
        self._internal_state = {}  # Convention: private
        self.public_state = {}     # Public

    def _helper_method(self):  # Convention: private
        pass

    def public_method(self):   # Public API
        pass

# PROTECTION NAME MANGLING
# Double underscore (rarement nécessaire)
class MyClass:
    def __init__(self):
        self.__truly_private = 42  # Devient _MyClass__truly_private
```

## Type Hints (PEP 484, 585, 604)

### Types de Base

```python
from typing import Optional, Union, List, Dict, Set, Tuple, Any

# ✅ BON: Type hints sur tout
def greet(name: str) -> str:
    return f"Hello, {name}"

# Variables annotées
age: int = 30
price: float = 19.99
is_valid: bool = True
name: str = "John"

# Collections (Python 3.9+)
# ✅ Nouvelle syntaxe (préférée)
numbers: list[int] = [1, 2, 3]
scores: dict[str, float] = {"math": 95.5}
unique_ids: set[int] = {1, 2, 3}
coordinates: tuple[float, float] = (10.5, 20.3)

# ❌ Ancienne syntaxe (déprécié Python 3.9+)
from typing import List, Dict, Set, Tuple
numbers: List[int] = [1, 2, 3]
scores: Dict[str, float] = {"math": 95.5}

# Optional (peut être None)
def find_user(user_id: int) -> Optional[User]:
    """Retourne un User ou None."""
    return user or None

# Union (plusieurs types possibles) - Python 3.10+
def process_id(user_id: int | str) -> None:
    """Accepte int ou str."""
    pass

# Ancienne syntaxe Union (avant Python 3.10)
from typing import Union
def process_id(user_id: Union[int, str]) -> None:
    pass

# Any (éviter autant que possible)
from typing import Any
def process_data(data: Any) -> Any:  # ❌ Trop vague
    pass
```

### Types Avancés

```python
from typing import (
    Protocol, TypeVar, Generic, Callable,
    Literal, Final, TypedDict, NewType
)
from collections.abc import Sequence, Iterable, Mapping

# Generic Types
T = TypeVar('T')

def first(items: list[T]) -> Optional[T]:
    """Retourne le premier élément ou None."""
    return items[0] if items else None

# Generic Class
class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

# Protocol (Structural Subtyping - PEP 544)
class Drawable(Protocol):
    """Interface pour les objets dessinables."""

    def draw(self) -> None:
        """Dessine l'objet."""
        ...

def render(obj: Drawable) -> None:
    """Accepte tout objet avec une méthode draw()."""
    obj.draw()

# Callable
from collections.abc import Callable

def execute_callback(
    callback: Callable[[int, str], bool],
    value: int,
    name: str
) -> bool:
    """Execute un callback avec les paramètres donnés."""
    return callback(value, name)

# Literal (valeurs exactes)
from typing import Literal

def set_mode(mode: Literal["read", "write", "append"]) -> None:
    """Mode doit être exactement l'une de ces valeurs."""
    pass

set_mode("read")  # ✅ OK
set_mode("delete")  # ❌ Type error

# Final (constante)
from typing import Final

MAX_CONNECTIONS: Final = 100
MAX_CONNECTIONS = 200  # ❌ Type error

# TypedDict (dictionnaires typés)
from typing import TypedDict

class UserDict(TypedDict):
    id: int
    name: str
    email: str
    is_active: bool

def process_user(user: UserDict) -> None:
    print(user["name"])

# NewType (alias sémantique)
from typing import NewType

UserId = NewType('UserId', int)
OrderId = NewType('OrderId', int)

def get_user(user_id: UserId) -> User:
    pass

user_id = UserId(42)
order_id = OrderId(42)

get_user(user_id)    # ✅ OK
get_user(order_id)   # ❌ Type error (même si même type de base)
```

### Type Hints pour Classes

```python
from __future__ import annotations  # PEP 563 - Forward references
from typing import ClassVar, Self  # Python 3.11+
from dataclasses import dataclass

@dataclass
class User:
    """Utilisateur du système."""

    # Class variable
    _instances: ClassVar[int] = 0

    # Instance variables avec types
    id: int
    name: str
    email: str
    is_active: bool = True

    def __post_init__(self) -> None:
        User._instances += 1

    def deactivate(self) -> None:
        """Désactive l'utilisateur."""
        self.is_active = False

    # Self type (Python 3.11+)
    def clone(self) -> Self:
        """Clone l'utilisateur."""
        return User(
            id=self.id,
            name=self.name,
            email=self.email,
            is_active=self.is_active
        )

    # Avant Python 3.11
    def clone_old(self) -> User:
        """Clone l'utilisateur."""
        return User(...)

# Forward reference (pour références circulaires)
class Node:
    def __init__(self, value: int, parent: Optional[Node] = None):
        self.value = value
        self.parent = parent
```

### Type Checking avec mypy

```python
# Inline type ignoring (utiliser avec parcimonie)
result = some_untyped_library()  # type: ignore

# Plus spécifique
result = some_untyped_library()  # type: ignore[no-untyped-call]

# Conditional types pour mypy
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    # Imports utilisés uniquement pour type checking
    # Évite les imports circulaires
    from myproject.domain.entities.order import Order

def process_order(order: Order) -> None:
    pass

# reveal_type pour debug
reveal_type(my_variable)  # mypy affichera le type inféré
```

## Docstrings

### Style Google (Recommandé)

```python
def calculate_order_total(
    order_id: int,
    apply_discount: bool = True,
    discount_code: Optional[str] = None
) -> float:
    """
    Calcule le total d'une commande avec discounts optionnels.

    Cette fonction récupère une commande, applique les discounts si demandé,
    et retourne le montant total incluant taxes.

    Args:
        order_id: L'identifiant unique de la commande
        apply_discount: Si True, applique les discounts disponibles
        discount_code: Code promo optionnel à appliquer

    Returns:
        Le montant total de la commande en euros

    Raises:
        OrderNotFoundError: Si la commande n'existe pas
        InvalidDiscountCodeError: Si le code promo est invalide

    Examples:
        >>> calculate_order_total(123)
        99.99
        >>> calculate_order_total(123, discount_code="SAVE10")
        89.99

    Note:
        Les discounts sont appliqués avant les taxes.

    Warning:
        Cette fonction fait un appel à la base de données.
    """
    pass


class OrderService:
    """
    Service pour la gestion des commandes.

    Ce service coordonne les opérations liées aux commandes:
    création, validation, calcul de prix, et persistence.

    Attributes:
        order_repository: Repository pour accéder aux commandes
        pricing_service: Service de calcul de prix

    Example:
        >>> service = OrderService(repo, pricing)
        >>> order = service.create_order(customer_id=123, items=[...])
    """

    def __init__(
        self,
        order_repository: OrderRepository,
        pricing_service: PricingService
    ) -> None:
        """
        Initialise le service.

        Args:
            order_repository: Repository pour les commandes
            pricing_service: Service de pricing
        """
        self.order_repository = order_repository
        self.pricing_service = pricing_service
```

### Style NumPy (Alternative)

```python
def calculate_statistics(data: list[float]) -> dict[str, float]:
    """
    Calcule des statistiques sur un ensemble de données.

    Parameters
    ----------
    data : list[float]
        Liste de valeurs numériques à analyser

    Returns
    -------
    dict[str, float]
        Dictionnaire contenant:
        - mean: Moyenne
        - median: Médiane
        - std: Écart-type

    Raises
    ------
    ValueError
        Si la liste est vide

    Examples
    --------
    >>> calculate_statistics([1, 2, 3, 4, 5])
    {'mean': 3.0, 'median': 3.0, 'std': 1.41}

    Notes
    -----
    Utilise les algorithmes de la bibliothèque statistics.

    See Also
    --------
    numpy.mean : Pour de grandes datasets
    """
    pass
```

### Docstrings de Modules

```python
"""
Module de gestion des utilisateurs.

Ce module contient:
- Entité User
- Exceptions liées aux utilisateurs
- Fonctions utilitaires pour la validation

Example:
    >>> from myproject.domain.entities import user
    >>> u = user.User(email="test@example.com", name="Test")

Todo:
    * Ajouter support pour les rôles
    * Implémenter la vérification 2FA
"""

from __future__ import annotations
# ... rest of module
```

## Conventions de Code

### Constants et Enums

```python
# Constants
MAX_RETRY_ATTEMPTS = 3
DEFAULT_TIMEOUT_SECONDS = 30
API_VERSION = "v1"

# Enums
from enum import Enum, auto

class OrderStatus(str, Enum):
    """Status d'une commande."""

    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class UserRole(Enum):
    """Rôle utilisateur."""

    ADMIN = auto()
    MODERATOR = auto()
    USER = auto()

# Utilisation
status = OrderStatus.PENDING
if status == OrderStatus.CONFIRMED:
    ship_order()
```

### Comprehensions

```python
# ✅ BON: List comprehension lisible
active_users = [user for user in users if user.is_active]

# ✅ BON: Dict comprehension
user_map = {user.id: user for user in users}

# ✅ BON: Set comprehension
unique_emails = {user.email for user in users}

# ✅ BON: Generator expression pour grande liste
total = sum(order.total for order in orders)

# ❌ MAUVAIS: Trop complexe
result = [
    user.name.upper()
    for user in users
    if user.is_active and user.email_verified
    if user.created_at > cutoff_date
    for order in user.orders
    if order.status == "completed"
]

# ✅ MEILLEUR: Décomposer
active_verified_users = [
    user for user in users
    if user.is_active and user.email_verified
    if user.created_at > cutoff_date
]
completed_orders = [
    order for user in active_verified_users
    for order in user.orders
    if order.status == "completed"
]
```

### Context Managers

```python
# ✅ BON: Utiliser context managers
with open("file.txt", "r") as f:
    content = f.read()

# Database session
with get_db_session() as session:
    user = session.query(User).first()

# Multiple context managers
with open("input.txt") as fin, open("output.txt", "w") as fout:
    fout.write(fin.read())

# Custom context manager
from contextlib import contextmanager

@contextmanager
def timer(name: str):
    """Context manager pour mesurer le temps."""
    start = time.time()
    try:
        yield
    finally:
        elapsed = time.time() - start
        print(f"{name} took {elapsed:.2f}s")

# Utilisation
with timer("Database query"):
    results = expensive_query()
```

### Exception Handling

```python
# ✅ BON: Exceptions spécifiques
try:
    user = get_user(user_id)
except UserNotFoundError:
    logger.error(f"User {user_id} not found")
    raise
except DatabaseError as e:
    logger.error(f"Database error: {e}")
    raise

# ✅ BON: Finally pour cleanup
try:
    file = open("data.txt")
    process_file(file)
except IOError as e:
    logger.error(f"IO error: {e}")
finally:
    file.close()  # Toujours exécuté

# ✅ BON: Else clause (exécuté si pas d'exception)
try:
    user = get_user(user_id)
except UserNotFoundError:
    create_default_user()
else:
    update_user(user)  # Seulement si pas d'exception

# ❌ MAUVAIS: Bare except
try:
    risky_operation()
except:  # Catch TOUT, même KeyboardInterrupt
    pass

# ❌ MAUVAIS: Pass silencieux
try:
    important_operation()
except Exception:
    pass  # Erreur ignorée!

# ✅ MEILLEUR
try:
    important_operation()
except SpecificError as e:
    logger.warning(f"Expected error: {e}")
    # Handle gracefully
```

### Comparaisons

```python
# ✅ BON: Comparaison avec None
if value is None:
    pass

# ❌ MAUVAIS
if value == None:
    pass

# ✅ BON: Vérifier vide
if not items:  # Vérifie [], "", 0, None, False
    pass

# ✅ BON: Vérifier type
if isinstance(value, str):
    pass

# ❌ MAUVAIS
if type(value) == str:
    pass

# ✅ BON: Comparaison booléenne
if is_valid:  # Pas: if is_valid == True
    pass

if not is_valid:  # Pas: if is_valid == False
    pass
```

### String Formatting

```python
name = "Alice"
age = 30

# ✅ BON: f-strings (Python 3.6+) - Préféré
message = f"Hello, {name}! You are {age} years old."

# ✅ BON: f-strings avec expressions
message = f"Next year you'll be {age + 1}"

# ✅ BON: f-strings avec format specs
price = 19.99
message = f"Price: ${price:.2f}"

# ✅ ACCEPTABLE: str.format() pour templates
template = "Hello, {name}! You are {age} years old."
message = template.format(name=name, age=age)

# ❌ ÉVITER: % formatting (vieux style)
message = "Hello, %s! You are %d years old." % (name, age)

# ❌ ÉVITER: Concatenation
message = "Hello, " + name + "! You are " + str(age) + " years old."
```

## Code Organization

### Module Structure

```python
"""Module docstring."""

# Imports (voir section Import Organization)

# Constants
MAX_RETRIES = 3
DEFAULT_TIMEOUT = 30

# Type aliases
UserId = int
EmailAddress = str

# Exceptions
class ModuleException(Exception):
    """Base exception for this module."""
    pass

# Functions
def public_function():
    """Public API."""
    pass

def _private_helper():
    """Private helper."""
    pass

# Classes
class PublicClass:
    """Public class."""
    pass

class _PrivateClass:
    """Private class."""
    pass

# Module initialization code
if __name__ == "__main__":
    # Script entry point
    main()
```

### Function Organization

```python
def process_order(
    order_id: int,
    apply_discount: bool = True
) -> OrderResult:
    """
    Traite une commande.

    Organisation:
    1. Validation des inputs
    2. Récupération des données
    3. Logique métier
    4. Persistence
    5. Return
    """
    # 1. Validation
    if order_id <= 0:
        raise ValueError("Invalid order_id")

    # 2. Récupération
    order = _fetch_order(order_id)
    customer = _fetch_customer(order.customer_id)

    # 3. Logique métier
    total = _calculate_total(order)
    if apply_discount:
        total = _apply_discount(total, customer)

    # 4. Persistence
    result = _save_order(order, total)

    # 5. Return
    return result


# Helpers privés
def _fetch_order(order_id: int) -> Order:
    """Helper privé pour récupérer une commande."""
    pass
```

## Tools Configuration

### pyproject.toml

```toml
[tool.black]
line-length = 88
target-version = ['py311']
include = '\.pyi?$'

[tool.isort]
profile = "black"
line_length = 88
multi_line_output = 3

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

[tool.ruff]
line-length = 88
target-version = "py311"

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "N",   # pep8-naming
    "UP",  # pyupgrade
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
]

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
```

## Checklist

- [ ] Imports organisés (stdlib, third-party, local)
- [ ] Ligne max 88 caractères (Black) ou 79 (PEP 8)
- [ ] Naming conventions respectées
- [ ] Type hints sur toutes les fonctions publiques
- [ ] Docstrings Google style sur toutes les fonctions/classes publiques
- [ ] Pas de code mort (commenté)
- [ ] Pas de print() (utiliser logging)
- [ ] Exception handling approprié
- [ ] Context managers pour ressources
- [ ] F-strings pour formatting
