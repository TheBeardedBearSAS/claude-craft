# Principes SOLID en Python

## Introduction

SOLID est un acronyme représentant 5 principes de conception orientée objet:

- **S** - Single Responsibility Principle (SRP)
- **O** - Open/Closed Principle (OCP)
- **L** - Liskov Substitution Principle (LSP)
- **I** - Interface Segregation Principle (ISP)
- **D** - Dependency Inversion Principle (DIP)

Ces principes favorisent un code maintenable, testable et évolutif.

## S - Single Responsibility Principle

> Une classe ne devrait avoir qu'une seule raison de changer.

### ❌ Violation du SRP

```python
class User:
    """
    PROBLÈME: Cette classe a TROP de responsabilités:
    1. Gestion des données utilisateur
    2. Validation
    3. Persistence en base de données
    4. Envoi d'emails
    5. Génération de rapports
    """

    def __init__(self, name: str, email: str):
        self.name = name
        self.email = email

    def validate_email(self) -> bool:
        """Responsabilité 1: Validation"""
        return "@" in self.email

    def save_to_database(self) -> None:
        """Responsabilité 2: Persistence"""
        db = Database()
        db.execute(f"INSERT INTO users VALUES ('{self.name}', '{self.email}')")

    def send_welcome_email(self) -> None:
        """Responsabilité 3: Envoi d'emails"""
        smtp = SMTP()
        smtp.send(self.email, "Welcome!", "Thanks for joining!")

    def generate_report(self) -> str:
        """Responsabilité 4: Génération de rapports"""
        return f"User Report:\nName: {self.name}\nEmail: {self.email}"
```

### ✅ Respect du SRP

```python
from dataclasses import dataclass
from typing import Protocol


@dataclass
class User:
    """
    Responsabilité UNIQUE: Représenter un utilisateur.
    Contient uniquement les données et la logique métier de l'entité User.
    """

    name: str
    email: str

    def __post_init__(self) -> None:
        """Validation basique (fait partie de l'entité)."""
        if not self.name:
            raise ValueError("Name cannot be empty")


class EmailValidator:
    """
    Responsabilité UNIQUE: Valider des emails.
    """

    @staticmethod
    def is_valid(email: str) -> bool:
        """Valide une adresse email."""
        # Logique de validation complète
        return "@" in email and "." in email.split("@")[1]


class UserRepository:
    """
    Responsabilité UNIQUE: Persistence des utilisateurs.
    """

    def __init__(self, database: Database):
        self._db = database

    def save(self, user: User) -> None:
        """Sauvegarde un utilisateur."""
        self._db.execute(
            "INSERT INTO users (name, email) VALUES (?, ?)",
            (user.name, user.email)
        )

    def find_by_email(self, email: str) -> Optional[User]:
        """Trouve un utilisateur par email."""
        result = self._db.query(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        )
        return User(**result) if result else None


class EmailService:
    """
    Responsabilité UNIQUE: Envoi d'emails.
    """

    def __init__(self, smtp_client: SMTPClient):
        self._smtp = smtp_client

    def send_welcome_email(self, email: str, name: str) -> None:
        """Envoie un email de bienvenue."""
        subject = "Welcome!"
        body = f"Hello {name}, thanks for joining!"
        self._smtp.send(email, subject, body)


class UserReportGenerator:
    """
    Responsabilité UNIQUE: Génération de rapports utilisateur.
    """

    def generate_report(self, user: User) -> str:
        """Génère un rapport pour un utilisateur."""
        return f"User Report:\nName: {user.name}\nEmail: {user.email}"


# Utilisation: Coordination via un Use Case
class CreateUserUseCase:
    """
    Use case qui COORDONNE les différentes responsabilités.
    """

    def __init__(
        self,
        repository: UserRepository,
        email_service: EmailService,
        validator: EmailValidator
    ):
        self._repository = repository
        self._email_service = email_service
        self._validator = validator

    def execute(self, name: str, email: str) -> User:
        """Crée un utilisateur."""
        # Validation
        if not self._validator.is_valid(email):
            raise ValueError("Invalid email")

        # Création
        user = User(name=name, email=email)

        # Persistence
        self._repository.save(user)

        # Email
        self._email_service.send_welcome_email(email, name)

        return user
```

### Avantages du SRP

```python
# ✅ Testabilité: Chaque classe peut être testée indépendamment
def test_email_validator():
    validator = EmailValidator()
    assert validator.is_valid("test@example.com") is True
    assert validator.is_valid("invalid") is False

# ✅ Maintenabilité: Changer la validation n'affecte pas la persistence
# ✅ Réutilisabilité: EmailValidator peut être utilisé partout
# ✅ Compréhension: Chaque classe a un rôle clair
```

## O - Open/Closed Principle

> Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.

### ❌ Violation de l'OCP

```python
class DiscountCalculator:
    """
    PROBLÈME: Ajouter un nouveau type de discount nécessite
    de MODIFIER cette classe (violation OCP).
    """

    def calculate_discount(self, order: Order, discount_type: str) -> float:
        """Calcule le discount selon le type."""
        if discount_type == "percentage":
            return order.total * 0.10
        elif discount_type == "fixed":
            return 5.0
        elif discount_type == "buy_one_get_one":
            # Logique complexe
            return order.total * 0.50
        elif discount_type == "seasonal":
            # Encore une autre logique
            return order.total * 0.15
        # Chaque nouveau type nécessite un nouveau if!
        else:
            return 0.0
```

### ✅ Respect de l'OCP

```python
from abc import ABC, abstractmethod
from typing import Protocol


class DiscountStrategy(Protocol):
    """
    Interface (Port) pour les stratégies de discount.

    Utilise Protocol (PEP 544) pour structural subtyping.
    Toute classe avec une méthode calculate() est compatible.
    """

    def calculate(self, order: Order) -> float:
        """Calcule le montant du discount."""
        ...


# Implémentation 1: Discount en pourcentage
class PercentageDiscount:
    """Discount en pourcentage du total."""

    def __init__(self, percentage: float):
        self._percentage = percentage

    def calculate(self, order: Order) -> float:
        """Calcule le discount."""
        return order.total * self._percentage


# Implémentation 2: Discount fixe
class FixedDiscount:
    """Discount d'un montant fixe."""

    def __init__(self, amount: float):
        self._amount = amount

    def calculate(self, order: Order) -> float:
        """Calcule le discount."""
        return min(self._amount, order.total)


# Implémentation 3: Buy One Get One
class BuyOneGetOneDiscount:
    """Discount 50% sur les items."""

    def calculate(self, order: Order) -> float:
        """Calcule le discount."""
        # Logique complexe isolée
        eligible_items = [item for item in order.items if item.eligible_for_bogo]
        return sum(item.price for item in eligible_items) * 0.5


# Implémentation 4: Discount saisonnier
class SeasonalDiscount:
    """Discount basé sur la saison."""

    def __init__(self, season: str, percentage: float):
        self._season = season
        self._percentage = percentage

    def calculate(self, order: Order) -> float:
        """Calcule le discount."""
        current_season = get_current_season()
        if current_season == self._season:
            return order.total * self._percentage
        return 0.0


# Calculator FERMÉ à modification mais OUVERT à extension
class DiscountCalculator:
    """
    Calculateur de discount utilisant le pattern Strategy.

    Cette classe n'a JAMAIS besoin d'être modifiée quand on ajoute
    un nouveau type de discount.
    """

    def __init__(self, strategy: DiscountStrategy):
        self._strategy = strategy

    def calculate_discount(self, order: Order) -> float:
        """Calcule le discount en utilisant la stratégie."""
        return self._strategy.calculate(order)


# Utilisation
order = Order(total=100.0)

# Discount 10%
calculator = DiscountCalculator(PercentageDiscount(0.10))
discount = calculator.calculate_discount(order)  # 10.0

# Discount fixe 5€
calculator = DiscountCalculator(FixedDiscount(5.0))
discount = calculator.calculate_discount(order)  # 5.0

# BOGO
calculator = DiscountCalculator(BuyOneGetOneDiscount())
discount = calculator.calculate_discount(order)

# ✅ Ajouter un nouveau type de discount n'affecte PAS DiscountCalculator
class VIPDiscount:
    """Nouveau discount pour VIP - AUCUNE modification du code existant!"""

    def calculate(self, order: Order) -> float:
        return order.total * 0.25 if order.customer.is_vip else 0.0
```

### Alternative avec ABC

```python
from abc import ABC, abstractmethod


class DiscountStrategy(ABC):
    """Base class abstraite pour les stratégies de discount."""

    @abstractmethod
    def calculate(self, order: Order) -> float:
        """Calcule le montant du discount."""
        pass


class PercentageDiscount(DiscountStrategy):
    """Doit implémenter calculate()."""

    def __init__(self, percentage: float):
        self._percentage = percentage

    def calculate(self, order: Order) -> float:
        return order.total * self._percentage


# ❌ Erreur si on oublie d'implémenter calculate()
class BrokenDiscount(DiscountStrategy):
    pass  # TypeError: Can't instantiate abstract class
```

## L - Liskov Substitution Principle

> Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base sans altérer le comportement du programme.

### ❌ Violation du LSP

```python
class Rectangle:
    """Rectangle avec width et height indépendants."""

    def __init__(self, width: float, height: float):
        self._width = width
        self._height = height

    def set_width(self, width: float) -> None:
        self._width = width

    def set_height(self, height: float) -> None:
        self._height = height

    def area(self) -> float:
        return self._width * self._height


class Square(Rectangle):
    """
    PROBLÈME: Square VIOLE LSP car il change le comportement
    de set_width() et set_height().

    Un carré n'est PAS un rectangle du point de vue comportemental!
    """

    def set_width(self, width: float) -> None:
        # Modification du comportement parent
        self._width = width
        self._height = width  # Force width = height

    def set_height(self, height: float) -> None:
        # Modification du comportement parent
        self._width = height
        self._height = height  # Force width = height


# Test qui prouve la violation
def test_rectangle_area(rect: Rectangle) -> None:
    """
    Cette fonction s'attend au comportement de Rectangle.
    Elle ÉCHOUE avec Square!
    """
    rect.set_width(5)
    rect.set_height(4)
    assert rect.area() == 20  # ✅ OK pour Rectangle, ❌ FAIL pour Square (16)


# Utilisation
rectangle = Rectangle(0, 0)
test_rectangle_area(rectangle)  # ✅ Pass

square = Square(0, 0)
test_rectangle_area(square)  # ❌ Fail - Violation LSP!
```

### ✅ Respect du LSP

```python
from abc import ABC, abstractmethod


class Shape(ABC):
    """Interface commune pour les formes."""

    @abstractmethod
    def area(self) -> float:
        """Calcule l'aire."""
        pass


class Rectangle(Shape):
    """Rectangle avec width et height indépendants."""

    def __init__(self, width: float, height: float):
        self._width = width
        self._height = height

    def set_width(self, width: float) -> None:
        self._width = width

    def set_height(self, height: float) -> None:
        self._height = height

    def area(self) -> float:
        return self._width * self._height


class Square(Shape):
    """
    Square est SÉPARÉ de Rectangle.
    Il n'hérite pas de Rectangle, donc ne peut pas violer son contrat.
    """

    def __init__(self, side: float):
        self._side = side

    def set_side(self, side: float) -> None:
        """Méthode propre à Square."""
        self._side = side

    def area(self) -> float:
        return self._side * self._side


# Alternative: Composition plutôt qu'héritage
class Rectangle:
    """Rectangle immutable - respecte LSP."""

    def __init__(self, width: float, height: float):
        self._width = width
        self._height = height

    @property
    def width(self) -> float:
        return self._width

    @property
    def height(self) -> float:
        return self._height

    def area(self) -> float:
        return self._width * self._height

    def with_width(self, width: float) -> Rectangle:
        """Retourne un nouveau Rectangle avec la nouvelle width."""
        return Rectangle(width, self._height)

    def with_height(self, height: float) -> Rectangle:
        """Retourne un nouveau Rectangle avec la nouvelle height."""
        return Rectangle(self._width, height)


class Square:
    """Square immutable - pas d'héritage problématique."""

    def __init__(self, side: float):
        self._side = side

    @property
    def side(self) -> float:
        return self._side

    def area(self) -> float:
        return self._side * self._side

    def with_side(self, side: float) -> Square:
        """Retourne un nouveau Square."""
        return Square(side)
```

### Exemple concret: Collections

```python
from typing import Protocol


class ReadableCollection(Protocol):
    """Interface pour une collection lisible."""

    def get(self, index: int) -> Any:
        """Récupère un élément."""
        ...

    def size(self) -> int:
        """Taille de la collection."""
        ...


class MutableCollection(ReadableCollection, Protocol):
    """Interface pour une collection mutable."""

    def add(self, item: Any) -> None:
        """Ajoute un élément."""
        ...

    def remove(self, index: int) -> None:
        """Supprime un élément."""
        ...


# ✅ Implémentation qui respecte LSP
class ArrayList:
    """Liste mutable."""

    def __init__(self):
        self._items = []

    def get(self, index: int) -> Any:
        return self._items[index]

    def size(self) -> int:
        return len(self._items)

    def add(self, item: Any) -> None:
        self._items.append(item)

    def remove(self, index: int) -> None:
        del self._items[index]


class ImmutableList:
    """Liste immutable - N'implémente PAS MutableCollection."""

    def __init__(self, items: list):
        self._items = tuple(items)  # Immutable

    def get(self, index: int) -> Any:
        return self._items[index]

    def size(self) -> int:
        return len(self._items)

    # PAS de add() ou remove() - respecte LSP


# Utilisation
def process_readable(collection: ReadableCollection) -> None:
    """Accepte toute collection lisible."""
    for i in range(collection.size()):
        print(collection.get(i))

def process_mutable(collection: MutableCollection) -> None:
    """Accepte seulement les collections mutables."""
    collection.add("new item")

# ✅ LSP respecté
mutable = ArrayList()
process_readable(mutable)  # OK
process_mutable(mutable)   # OK

immutable = ImmutableList([1, 2, 3])
process_readable(immutable)  # OK
# process_mutable(immutable)  # Type error - CORRECT!
```

## I - Interface Segregation Principle

> Les clients ne doivent pas être forcés de dépendre d'interfaces qu'ils n'utilisent pas.

### ❌ Violation de l'ISP

```python
class Worker(ABC):
    """
    PROBLÈME: Interface trop large qui force les implémentations
    à implémenter des méthodes inutiles.
    """

    @abstractmethod
    def work(self) -> None:
        """Travaille."""
        pass

    @abstractmethod
    def eat(self) -> None:
        """Mange."""
        pass

    @abstractmethod
    def sleep(self) -> None:
        """Dort."""
        pass


class HumanWorker(Worker):
    """Humain - peut tout faire."""

    def work(self) -> None:
        print("Working hard")

    def eat(self) -> None:
        print("Eating lunch")

    def sleep(self) -> None:
        print("Sleeping")


class RobotWorker(Worker):
    """
    Robot - FORCÉ d'implémenter eat() et sleep() qui ne font pas sens!
    """

    def work(self) -> None:
        print("Processing tasks")

    def eat(self) -> None:
        # ❌ Robot ne mange pas, mais doit implémenter
        raise NotImplementedError("Robots don't eat")

    def sleep(self) -> None:
        # ❌ Robot ne dort pas, mais doit implémenter
        raise NotImplementedError("Robots don't sleep")


# Utilisation problématique
def lunch_break(worker: Worker) -> None:
    """Pause déjeuner pour tous les workers."""
    worker.eat()  # ❌ Crash si worker est un robot!

robot = RobotWorker()
lunch_break(robot)  # NotImplementedError!
```

### ✅ Respect de l'ISP

```python
from typing import Protocol


class Workable(Protocol):
    """Interface ségrégée: seulement le travail."""

    def work(self) -> None:
        """Travaille."""
        ...


class Eatable(Protocol):
    """Interface ségrégée: seulement manger."""

    def eat(self) -> None:
        """Mange."""
        ...


class Sleepable(Protocol):
    """Interface ségrégée: seulement dormir."""

    def sleep(self) -> None:
        """Dort."""
        ...


# Implémentation: Combine seulement ce qui est nécessaire
class HumanWorker:
    """Humain implémente les 3 interfaces."""

    def work(self) -> None:
        print("Working hard")

    def eat(self) -> None:
        print("Eating lunch")

    def sleep(self) -> None:
        print("Sleeping")


class RobotWorker:
    """Robot implémente seulement Workable - pas forcé d'implémenter le reste."""

    def work(self) -> None:
        print("Processing tasks")

    def recharge(self) -> None:
        """Méthode spécifique au robot."""
        print("Recharging batteries")


# Utilisation type-safe
def manage_work(worker: Workable) -> None:
    """Gère le travail - accepte humains ET robots."""
    worker.work()

def manage_lunch_break(worker: Eatable) -> None:
    """Gère la pause déjeuner - seulement pour les workers qui mangent."""
    worker.eat()

def manage_sleep(worker: Sleepable) -> None:
    """Gère le sommeil - seulement pour les workers qui dorment."""
    worker.sleep()


# ✅ ISP respecté
human = HumanWorker()
manage_work(human)          # OK
manage_lunch_break(human)   # OK
manage_sleep(human)         # OK

robot = RobotWorker()
manage_work(robot)          # OK
# manage_lunch_break(robot)  # Type error - CORRECT!
# manage_sleep(robot)        # Type error - CORRECT!
```

### Exemple concret: Repository Pattern

```python
# ❌ Interface trop large
class Repository(Protocol):
    """Repository avec TOUTES les opérations possibles."""

    def find_by_id(self, id: int) -> Any: ...
    def find_all(self) -> list[Any]: ...
    def save(self, entity: Any) -> None: ...
    def update(self, entity: Any) -> None: ...
    def delete(self, id: int) -> None: ...
    def search(self, criteria: dict) -> list[Any]: ...
    def count(self) -> int: ...
    # ... 20 autres méthodes


# ✅ Interfaces ségrégées
class Readable(Protocol):
    """Interface pour lecture seule."""

    def find_by_id(self, id: int) -> Any: ...
    def find_all(self) -> list[Any]: ...


class Writable(Protocol):
    """Interface pour écriture seule."""

    def save(self, entity: Any) -> None: ...
    def delete(self, id: int) -> None: ...


class Searchable(Protocol):
    """Interface pour recherche avancée."""

    def search(self, criteria: dict) -> list[Any]: ...


# Implémentation combine ce qui est nécessaire
class FullRepository:
    """Repository complet."""

    def find_by_id(self, id: int) -> Any: ...
    def find_all(self) -> list[Any]: ...
    def save(self, entity: Any) -> None: ...
    def delete(self, id: int) -> None: ...
    def search(self, criteria: dict) -> list[Any]: ...


class ReadOnlyRepository:
    """Repository en lecture seule - n'implémente que Readable."""

    def find_by_id(self, id: int) -> Any: ...
    def find_all(self) -> list[Any]: ...


# Utilisation
def display_data(repo: Readable) -> None:
    """Affiche des données - besoin seulement de lecture."""
    data = repo.find_all()
    for item in data:
        print(item)


def modify_data(repo: Writable) -> None:
    """Modifie des données - besoin seulement d'écriture."""
    entity = create_new_entity()
    repo.save(entity)


# ✅ Clients dépendent seulement de ce qu'ils utilisent
read_only = ReadOnlyRepository()
display_data(read_only)  # OK
# modify_data(read_only)  # Type error - CORRECT!
```

## D - Dependency Inversion Principle

> 1. Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions.
> 2. Les abstractions ne doivent pas dépendre des détails. Les détails doivent dépendre des abstractions.

### ❌ Violation du DIP

```python
# Bas niveau: Détails d'implémentation
class MySQLDatabase:
    """Implémentation concrète MySQL."""

    def connect(self) -> None:
        print("Connecting to MySQL")

    def query(self, sql: str) -> list:
        print(f"Executing MySQL query: {sql}")
        return []


# Haut niveau: Logique métier
class UserService:
    """
    PROBLÈME: Dépend directement de MySQLDatabase (détail).
    - Difficile à tester (nécessite MySQL)
    - Impossible de changer de DB sans modifier UserService
    - Couplage fort
    """

    def __init__(self):
        self._db = MySQLDatabase()  # ❌ Dépendance concrète

    def get_user(self, user_id: int) -> User:
        """Récupère un utilisateur."""
        self._db.connect()
        results = self._db.query(f"SELECT * FROM users WHERE id = {user_id}")
        return User(**results[0])
```

### ✅ Respect du DIP

```python
from typing import Protocol


# Abstraction (Interface)
class Database(Protocol):
    """
    Abstraction sur laquelle TOUT LE MONDE dépend.

    - UserService (haut niveau) dépend de Database
    - MySQLDatabase (bas niveau) dépend de Database
    """

    def connect(self) -> None:
        """Établit une connexion."""
        ...

    def query(self, sql: str) -> list[dict]:
        """Exécute une requête."""
        ...


# Bas niveau: Implémentations
class MySQLDatabase:
    """Implémentation MySQL de Database."""

    def connect(self) -> None:
        print("Connecting to MySQL")

    def query(self, sql: str) -> list[dict]:
        print(f"Executing MySQL query: {sql}")
        return [{"id": 1, "name": "John"}]


class PostgreSQLDatabase:
    """Implémentation PostgreSQL de Database."""

    def connect(self) -> None:
        print("Connecting to PostgreSQL")

    def query(self, sql: str) -> list[dict]:
        print(f"Executing PostgreSQL query: {sql}")
        return [{"id": 1, "name": "John"}]


class MongoDatabase:
    """Implémentation MongoDB de Database."""

    def connect(self) -> None:
        print("Connecting to MongoDB")

    def query(self, query: str) -> list[dict]:
        print(f"Executing MongoDB query: {query}")
        return [{"id": 1, "name": "John"}]


# Haut niveau: Logique métier
class UserService:
    """
    ✅ Dépend de l'abstraction Database, pas de l'implémentation.

    - Facilement testable (mock Database)
    - Peut utiliser n'importe quelle DB
    - Découplé des détails
    """

    def __init__(self, database: Database):
        """Injection de dépendance."""
        self._db = database

    def get_user(self, user_id: int) -> User:
        """Récupère un utilisateur."""
        self._db.connect()
        results = self._db.query(f"SELECT * FROM users WHERE id = {user_id}")
        return User(**results[0])


# Utilisation: Injection de dépendance
mysql_db = MySQLDatabase()
user_service = UserService(mysql_db)

# Changement de DB sans modifier UserService!
postgres_db = PostgreSQLDatabase()
user_service = UserService(postgres_db)

# Test avec mock
class MockDatabase:
    """Mock pour tests."""

    def connect(self) -> None:
        pass

    def query(self, sql: str) -> list[dict]:
        return [{"id": 1, "name": "Test User"}]

mock_db = MockDatabase()
test_service = UserService(mock_db)
```

### Dependency Injection Patterns

```python
# Pattern 1: Constructor Injection (Recommandé)
class OrderService:
    """Injection via constructeur."""

    def __init__(
        self,
        repository: OrderRepository,
        email_service: EmailService,
        payment_gateway: PaymentGateway
    ):
        self._repository = repository
        self._email_service = email_service
        self._payment_gateway = payment_gateway


# Pattern 2: Property Injection
class OrderService:
    """Injection via propriété (moins recommandé)."""

    def __init__(self):
        self._repository: Optional[OrderRepository] = None

    @property
    def repository(self) -> OrderRepository:
        if self._repository is None:
            raise ValueError("Repository not set")
        return self._repository

    @repository.setter
    def repository(self, repo: OrderRepository) -> None:
        self._repository = repo


# Pattern 3: Method Injection
class OrderService:
    """Injection via méthode (pour dépendances optionnelles)."""

    def process_order(
        self,
        order: Order,
        payment_gateway: PaymentGateway
    ) -> None:
        """Traite une commande avec un gateway spécifique."""
        payment_gateway.charge(order.total)


# Pattern 4: Dependency Injection Container
from dependency_injector import containers, providers


class Container(containers.DeclarativeContainer):
    """DI Container."""

    config = providers.Configuration()

    # Singletons
    database = providers.Singleton(
        MySQLDatabase,
        host=config.db.host,
        port=config.db.port
    )

    # Factories
    order_repository = providers.Factory(
        OrderRepository,
        database=database
    )

    email_service = providers.Factory(
        EmailService,
        smtp_host=config.smtp.host
    )

    # Services
    order_service = providers.Factory(
        OrderService,
        repository=order_repository,
        email_service=email_service
    )


# Utilisation
container = Container()
container.config.from_yaml('config.yml')

order_service = container.order_service()
```

## SOLID en Pratique - Exemple Complet

```python
"""
Exemple complet respectant SOLID:
Système de notification multi-canal (email, SMS, push).
"""

from abc import ABC, abstractmethod
from typing import Protocol


# ============================================================================
# D - Dependency Inversion: Abstractions (Protocols)
# ============================================================================

class NotificationChannel(Protocol):
    """
    Interface pour les canaux de notification (DIP).
    I - Interface Segregation: Interface focalisée sur une seule responsabilité.
    """

    def send(self, recipient: str, message: str) -> bool:
        """Envoie une notification."""
        ...


class NotificationRepository(Protocol):
    """Interface pour la persistence des notifications (DIP)."""

    def save(self, notification: Notification) -> None:
        """Sauvegarde une notification."""
        ...


# ============================================================================
# S - Single Responsibility: Chaque classe a une responsabilité unique
# ============================================================================

class Notification:
    """
    S - Responsabilité: Représenter une notification.
    Contient seulement les données et la logique métier de l'entité.
    """

    def __init__(
        self,
        recipient: str,
        message: str,
        channel: str
    ):
        self.recipient = recipient
        self.message = message
        self.channel = channel
        self.sent = False

    def mark_as_sent(self) -> None:
        """Marque la notification comme envoyée."""
        self.sent = True


# ============================================================================
# L - Liskov Substitution: Tous les channels sont interchangeables
# O - Open/Closed: Ajouter un channel n'affecte pas le code existant
# ============================================================================

class EmailChannel:
    """
    S - Responsabilité: Envoyer des emails.
    O - Ouvert à extension (nouveau channel), fermé à modification.
    L - Peut remplacer NotificationChannel sans problème.
    """

    def __init__(self, smtp_host: str):
        self._smtp_host = smtp_host

    def send(self, recipient: str, message: str) -> bool:
        """Envoie un email."""
        print(f"Sending email to {recipient} via {self._smtp_host}: {message}")
        return True


class SMSChannel:
    """S - Responsabilité: Envoyer des SMS."""

    def __init__(self, api_key: str):
        self._api_key = api_key

    def send(self, recipient: str, message: str) -> bool:
        """Envoie un SMS."""
        print(f"Sending SMS to {recipient}: {message}")
        return True


class PushChannel:
    """
    S - Responsabilité: Envoyer des push notifications.
    O - Nouveau channel ajouté SANS modifier le code existant!
    """

    def __init__(self, app_id: str):
        self._app_id = app_id

    def send(self, recipient: str, message: str) -> bool:
        """Envoie une push notification."""
        print(f"Sending push to {recipient} via app {self._app_id}: {message}")
        return True


# ============================================================================
# S - Single Responsibility: Use Case
# D - Dependency Inversion: Dépend des abstractions
# ============================================================================

class SendNotificationUseCase:
    """
    S - Responsabilité: Coordonner l'envoi de notification.
    D - Dépend des abstractions (NotificationChannel, NotificationRepository).
    """

    def __init__(
        self,
        channel: NotificationChannel,
        repository: NotificationRepository
    ):
        self._channel = channel
        self._repository = repository

    def execute(self, recipient: str, message: str, channel_name: str) -> None:
        """
        Exécute le use case.

        S - Responsabilité focalisée sur l'orchestration.
        """
        # Créer la notification
        notification = Notification(recipient, message, channel_name)

        # Envoyer
        success = self._channel.send(recipient, message)

        if success:
            notification.mark_as_sent()

        # Sauvegarder
        self._repository.save(notification)


# ============================================================================
# Utilisation
# ============================================================================

# Implémentation repository (bas niveau dépend de l'abstraction)
class InMemoryNotificationRepository:
    """Implémentation en mémoire du repository."""

    def __init__(self):
        self._notifications = []

    def save(self, notification: Notification) -> None:
        self._notifications.append(notification)


# Setup avec Dependency Injection
email_channel = EmailChannel(smtp_host="smtp.example.com")
repository = InMemoryNotificationRepository()

use_case = SendNotificationUseCase(
    channel=email_channel,
    repository=repository
)

# Envoyer notification
use_case.execute(
    recipient="user@example.com",
    message="Hello!",
    channel_name="email"
)

# ✅ Changer de channel sans modifier le use case (O, D)
sms_channel = SMSChannel(api_key="xxx")
use_case = SendNotificationUseCase(
    channel=sms_channel,
    repository=repository
)

# ✅ Nouveau channel ajouté sans modifier le code existant (O)
push_channel = PushChannel(app_id="my-app")
use_case = SendNotificationUseCase(
    channel=push_channel,
    repository=repository
)
```

## Checklist SOLID

### Single Responsibility
- [ ] Chaque classe a une seule raison de changer
- [ ] Les responsabilités sont clairement séparées
- [ ] Pas de classes "God Object"

### Open/Closed
- [ ] Utilisation de Protocol/ABC pour l'extensibilité
- [ ] Nouveaux comportements ajoutés par extension, pas modification
- [ ] Pattern Strategy pour les variations d'algorithmes

### Liskov Substitution
- [ ] Les sous-types peuvent remplacer les types de base
- [ ] Pas de NotImplementedError dans les overrides
- [ ] Composition préférée à l'héritage quand approprié

### Interface Segregation
- [ ] Interfaces focalisées et cohésives
- [ ] Pas de méthodes inutiles dans les interfaces
- [ ] Clients dépendent seulement de ce qu'ils utilisent

### Dependency Inversion
- [ ] Dépendances sur abstractions (Protocol), pas sur implémentations
- [ ] Injection de dépendances utilisée
- [ ] Code facilement testable avec mocks
