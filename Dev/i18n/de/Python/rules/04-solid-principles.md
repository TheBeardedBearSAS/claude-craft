# Regel 04: SOLID-Prinzipien

Die SOLID-Prinzipien sind fünf Design-Prinzipien, die Software verständlicher, flexibler und wartbarer machen.

## S - Single Responsibility Principle (SRP)

> Eine Klasse sollte nur einen Grund zur Änderung haben.

Jede Klasse sollte eine einzige, klar definierte Verantwortlichkeit haben.

### Beispiel: Verletzung

```python
# ❌ Schlecht: UserService hat zu viele Verantwortlichkeiten
class UserService:
    def create_user(self, data: dict) -> User:
        """Erstellt einen Benutzer."""
        # Validiert Daten
        if not data.get('email'):
            raise ValueError("E-Mail erforderlich")

        # Erstellt Benutzer
        user = User(**data)

        # Sendet E-Mail
        smtp = smtplib.SMTP('localhost')
        smtp.sendmail(
            'noreply@app.com',
            user.email,
            'Willkommen!'
        )

        # Speichert in Datenbank
        session.add(user)
        session.commit()

        # Protokolliert Aktion
        logging.info(f"Benutzer erstellt: {user.id}")

        return user
```

### Beispiel: Konform

```python
# ✅ Gut: Jede Klasse hat eine einzige Verantwortlichkeit

class UserValidator:
    """Validiert Benutzerdaten."""

    def validate(self, data: dict) -> None:
        if not data.get('email'):
            raise ValueError("E-Mail erforderlich")


class UserFactory:
    """Erstellt User-Entitäten."""

    def create(self, data: dict) -> User:
        return User(**data)


class EmailService:
    """Verwaltet E-Mail-Versand."""

    def send_welcome_email(self, user: User) -> None:
        self._smtp.sendmail(
            'noreply@app.com',
            user.email,
            'Willkommen!'
        )


class UserRepository:
    """Verwaltet User-Persistenz."""

    def save(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        return user


class UserLogger:
    """Protokolliert Benutzeraktionen."""

    def log_creation(self, user: User) -> None:
        logging.info(f"Benutzer erstellt: {user.id}")


class CreateUserUseCase:
    """Use Case zum Erstellen eines Benutzers - Koordiniert Verantwortlichkeiten."""

    def __init__(
        self,
        validator: UserValidator,
        factory: UserFactory,
        repository: UserRepository,
        email_service: EmailService,
        logger: UserLogger
    ):
        self._validator = validator
        self._factory = factory
        self._repository = repository
        self._email_service = email_service
        self._logger = logger

    def execute(self, data: dict) -> User:
        # Jeder Schritt delegiert an die verantwortliche Klasse
        self._validator.validate(data)
        user = self._factory.create(data)
        user = self._repository.save(user)
        self._email_service.send_welcome_email(user)
        self._logger.log_creation(user)
        return user
```

## O - Open/Closed Principle (OCP)

> Software-Entitäten sollten offen für Erweiterung, aber geschlossen für Änderung sein.

Sie sollten in der Lage sein, neue Funktionen hinzuzufügen, ohne bestehenden Code zu ändern.

### Beispiel: Verletzung

```python
# ❌ Schlecht: Muss Klasse ändern, um neue Rabatttypen hinzuzufügen
class DiscountCalculator:
    def calculate(self, order: Order, discount_type: str) -> Decimal:
        if discount_type == "percentage":
            return order.total * Decimal("0.10")
        elif discount_type == "fixed":
            return Decimal("5.00")
        elif discount_type == "seasonal":
            # Muss diese Klasse ändern, um neuen Typ hinzuzufügen
            return order.total * Decimal("0.15")
        else:
            return Decimal("0")
```

### Beispiel: Konform

```python
# ✅ Gut: Abstraktion verwenden, um Erweiterung zu ermöglichen
from abc import ABC, abstractmethod

class DiscountStrategy(ABC):
    """Basis-Abstraktion für Rabattstrategien."""

    @abstractmethod
    def calculate(self, order: Order) -> Decimal:
        """Berechnet den Rabatt."""
        pass


class PercentageDiscount(DiscountStrategy):
    def __init__(self, rate: Decimal):
        self._rate = rate

    def calculate(self, order: Order) -> Decimal:
        return order.total * self._rate


class FixedDiscount(DiscountStrategy):
    def __init__(self, amount: Decimal):
        self._amount = amount

    def calculate(self, order: Order) -> Decimal:
        return self._amount


class SeasonalDiscount(DiscountStrategy):
    """Neuer Typ hinzugefügt ohne bestehenden Code zu ändern."""

    def __init__(self, rate: Decimal):
        self._rate = rate

    def calculate(self, order: Order) -> Decimal:
        return order.total * self._rate


class DiscountCalculator:
    """Wendet Rabatt mit Strategie an (geschlossen für Änderung)."""

    def calculate(self, order: Order, strategy: DiscountStrategy) -> Decimal:
        return strategy.calculate(order)
```

## L - Liskov Substitution Principle (LSP)

> Objekte einer Superklasse sollten durch Objekte einer Subklasse ersetzbar sein, ohne die Anwendung zu brechen.

### Beispiel: Verletzung

```python
# ❌ Schlecht: Square verletzt den Vertrag von Rectangle
class Rectangle:
    def __init__(self, width: int, height: int):
        self.width = width
        self.height = height

    def set_width(self, width: int) -> None:
        self.width = width

    def set_height(self, height: int) -> None:
        self.height = height

    def area(self) -> int:
        return self.width * self.height


class Square(Rectangle):
    def set_width(self, width: int) -> None:
        # Verletzt LSP: Ändert Elternverhalten
        self.width = width
        self.height = width

    def set_height(self, height: int) -> None:
        # Verletzt LSP: Ändert Elternverhalten
        self.width = height
        self.height = height


# Problem: LSP-Verletzung
def test_rectangle(rect: Rectangle):
    rect.set_width(5)
    rect.set_height(4)
    assert rect.area() == 20  # Schlägt mit Square fehl!
```

### Beispiel: Konform

```python
# ✅ Gut: Komposition statt problematischer Vererbung verwenden
from abc import ABC, abstractmethod

class Shape(ABC):
    """Basis-Abstraktion für Formen."""

    @abstractmethod
    def area(self) -> int:
        """Berechnet die Fläche."""
        pass


class Rectangle(Shape):
    def __init__(self, width: int, height: int):
        self._width = width
        self._height = height

    def area(self) -> int:
        return self._width * self._height


class Square(Shape):
    def __init__(self, side: int):
        self._side = side

    def area(self) -> int:
        return self._side * self._side


# Funktioniert mit jeder Shape
def print_area(shape: Shape):
    print(f"Fläche: {shape.area()}")
```

## I - Interface Segregation Principle (ISP)

> Clients sollten nicht gezwungen werden, von Schnittstellen abzuhängen, die sie nicht verwenden.

### Beispiel: Verletzung

```python
# ❌ Schlecht: Monolithische Schnittstelle erzwingt ungenutzte Methoden
from abc import ABC, abstractmethod

class Worker(ABC):
    @abstractmethod
    def work(self) -> None:
        pass

    @abstractmethod
    def eat(self) -> None:
        pass

    @abstractmethod
    def sleep(self) -> None:
        pass


class Human(Worker):
    def work(self) -> None:
        print("Arbeite...")

    def eat(self) -> None:
        print("Esse...")

    def sleep(self) -> None:
        print("Schlafe...")


class Robot(Worker):
    def work(self) -> None:
        print("Arbeite...")

    def eat(self) -> None:
        # Roboter isst nicht! Muss grundlos implementieren
        pass

    def sleep(self) -> None:
        # Roboter schläft nicht! Muss grundlos implementieren
        pass
```

### Beispiel: Konform

```python
# ✅ Gut: Kleine, spezifische Schnittstellen
from abc import ABC, abstractmethod

class Workable(ABC):
    @abstractmethod
    def work(self) -> None:
        pass


class Eatable(ABC):
    @abstractmethod
    def eat(self) -> None:
        pass


class Sleepable(ABC):
    @abstractmethod
    def sleep(self) -> None:
        pass


class Human(Workable, Eatable, Sleepable):
    """Mensch kann alle drei."""

    def work(self) -> None:
        print("Arbeite...")

    def eat(self) -> None:
        print("Esse...")

    def sleep(self) -> None:
        print("Schlafe...")


class Robot(Workable):
    """Roboter braucht nur Workable."""

    def work(self) -> None:
        print("Arbeite...")
```

## D - Dependency Inversion Principle (DIP)

> High-Level-Module sollten nicht von Low-Level-Modulen abhängen. Beide sollten von Abstraktionen abhängen.

### Beispiel: Verletzung

```python
# ❌ Schlecht: Direkte Abhängigkeit von konkreter Implementierung
class MySQLDatabase:
    def connect(self) -> None:
        print("Verbinde mit MySQL...")

    def query(self, sql: str) -> list:
        print(f"Führe aus: {sql}")
        return []


class UserService:
    def __init__(self):
        # Direkte Abhängigkeit von MySQL (konkret)
        self._db = MySQLDatabase()

    def get_users(self) -> list[User]:
        self._db.connect()
        results = self._db.query("SELECT * FROM users")
        return [User(**row) for row in results]
```

### Beispiel: Konform

```python
# ✅ Gut: Von Abstraktion (Schnittstelle) abhängen
from abc import ABC, abstractmethod

class Database(ABC):
    """Abstraktion (Port)."""

    @abstractmethod
    def connect(self) -> None:
        pass

    @abstractmethod
    def query(self, sql: str) -> list:
        pass


class MySQLDatabase(Database):
    """Konkrete Implementierung (Adapter)."""

    def connect(self) -> None:
        print("Verbinde mit MySQL...")

    def query(self, sql: str) -> list:
        print(f"Führe aus: {sql}")
        return []


class PostgreSQLDatabase(Database):
    """Weitere Implementierung (Adapter)."""

    def connect(self) -> None:
        print("Verbinde mit PostgreSQL...")

    def query(self, sql: str) -> list:
        print(f"Führe aus: {sql}")
        return []


class UserService:
    def __init__(self, database: Database):
        # Hängt von Abstraktion ab, nicht konkret
        self._db = database

    def get_users(self) -> list[User]:
        self._db.connect()
        results = self._db.query("SELECT * FROM users")
        return [User(**row) for row in results]


# Dependency Injection: Kann Implementierung wählen
mysql_service = UserService(MySQLDatabase())
postgres_service = UserService(PostgreSQLDatabase())
```

## Python Protocols für DIP

Python 3.8+ erlaubt die Verwendung von `Protocol` für strukturelle Typisierung (Duck Typing).

```python
from typing import Protocol

# Keine explizite Vererbung erforderlich
class Saveable(Protocol):
    """Protokoll für speicherbare Entitäten."""

    def save(self) -> None:
        """Speichert die Entität."""
        ...


class FileRepository:
    """Implementiert Saveable ohne explizite Vererbung."""

    def save(self) -> None:
        print("Speichere in Datei...")


class DatabaseRepository:
    """Implementiert ebenfalls Saveable."""

    def save(self) -> None:
        print("Speichere in Datenbank...")


def persist_data(repository: Saveable) -> None:
    """Akzeptiert jedes Objekt, das save() implementiert."""
    repository.save()


# Beide funktionieren ohne explizite Vererbung
persist_data(FileRepository())
persist_data(DatabaseRepository())
```

## Vollständiges Beispiel: SOLID angewendet

```python
# Domain Layer (Geschäftslogik)
from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol

# Abstraktionen (DIP)
class OrderRepository(Protocol):
    """Repository-Abstraktion (Port)."""

    def save(self, order: 'Order') -> 'Order':
        ...

    def find_by_id(self, order_id: str) -> 'Order':
        ...


class PaymentGateway(Protocol):
    """Payment-Gateway-Abstraktion (Port)."""

    def process_payment(self, amount: Decimal) -> bool:
        ...


class NotificationService(Protocol):
    """Notification-Service-Abstraktion (Port)."""

    def send(self, recipient: str, message: str) -> None:
        ...


# Entities
@dataclass
class Order:
    """Order-Entität (SRP: repräsentiert Bestellung)."""

    id: str
    total: Decimal
    status: str

    def mark_as_paid(self) -> None:
        """Markiert Bestellung als bezahlt (SRP: Geschäftslogik)."""
        self.status = "paid"


# Domain Services
class OrderPaymentService:
    """Domain-Service für Zahlung (SRP: verwaltet Zahlung)."""

    def __init__(self, payment_gateway: PaymentGateway):
        self._payment_gateway = payment_gateway

    def process_payment(self, order: Order) -> bool:
        """Verarbeitet Zahlung für eine Bestellung."""
        return self._payment_gateway.process_payment(order.total)


# Use Case (Application Layer)
class PayOrderUseCase:
    """
    Use Case zum Bezahlen einer Bestellung (SRP: koordiniert Zahlung).
    Hängt von Abstraktionen ab (DIP).
    """

    def __init__(
        self,
        order_repo: OrderRepository,
        payment_service: OrderPaymentService,
        notification_service: NotificationService
    ):
        self._order_repo = order_repo
        self._payment_service = payment_service
        self._notification_service = notification_service

    def execute(self, order_id: str) -> bool:
        """Führt Bestellzahlung aus."""
        # 1. Bestellung abrufen
        order = self._order_repo.find_by_id(order_id)

        # 2. Zahlung verarbeiten
        success = self._payment_service.process_payment(order)

        if success:
            # 3. Bestellung aktualisieren
            order.mark_as_paid()
            self._order_repo.save(order)

            # 4. Kunden benachrichtigen
            self._notification_service.send(
                order.customer_email,
                "Ihre Zahlung war erfolgreich"
            )

        return success
```

## Vorteile von SOLID

1. **Einfachere Wartung**: Änderungen sind lokalisiert
2. **Bessere Testbarkeit**: Klassen sind isoliert und mockbar
3. **Größere Flexibilität**: Einfaches Hinzufügen neuer Funktionen
4. **Bessere Wiederverwendbarkeit**: Entkoppelte Komponenten
5. **Verbesserte Lesbarkeit**: Klare Verantwortlichkeiten

## Checkliste

- [ ] Jede Klasse hat eine einzige Verantwortlichkeit (SRP)
- [ ] Erweiterung ohne Änderung (OCP)
- [ ] Subtypen sind für ihre Basistypen substituierbar (LSP)
- [ ] Kleine, spezifische Schnittstellen (ISP)
- [ ] Abhängigkeiten von Abstraktionen, nicht konkreten Implementierungen (DIP)
- [ ] Verwendung von Protocols für Abstraktionen
- [ ] Dependency Injection für Abhängigkeiten
- [ ] Testbarer Code mit Mocks
