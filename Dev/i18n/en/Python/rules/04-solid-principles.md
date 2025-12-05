# Rule 04: SOLID Principles

The SOLID principles are five design principles that make software more understandable, flexible, and maintainable.

## S - Single Responsibility Principle (SRP)

> A class should have only one reason to change.

Each class should have a single, well-defined responsibility.

### Example: Violation

```python
# ❌ Bad: UserService has too many responsibilities
class UserService:
    def create_user(self, data: dict) -> User:
        """Creates a user."""
        # Validates data
        if not data.get('email'):
            raise ValueError("Email required")

        # Creates user
        user = User(**data)

        # Sends email
        smtp = smtplib.SMTP('localhost')
        smtp.sendmail(
            'noreply@app.com',
            user.email,
            'Welcome!'
        )

        # Saves to database
        session.add(user)
        session.commit()

        # Logs action
        logging.info(f"User created: {user.id}")

        return user
```

### Example: Compliant

```python
# ✅ Good: Each class has a single responsibility

class UserValidator:
    """Validates user data."""

    def validate(self, data: dict) -> None:
        if not data.get('email'):
            raise ValueError("Email required")


class UserFactory:
    """Creates User entities."""

    def create(self, data: dict) -> User:
        return User(**data)


class EmailService:
    """Manages email sending."""

    def send_welcome_email(self, user: User) -> None:
        self._smtp.sendmail(
            'noreply@app.com',
            user.email,
            'Welcome!'
        )


class UserRepository:
    """Manages User persistence."""

    def save(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        return user


class UserLogger:
    """Logs user actions."""

    def log_creation(self, user: User) -> None:
        logging.info(f"User created: {user.id}")


class CreateUserUseCase:
    """Use case to create a user - Coordinates responsibilities."""

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
        # Each step delegates to the responsible class
        self._validator.validate(data)
        user = self._factory.create(data)
        user = self._repository.save(user)
        self._email_service.send_welcome_email(user)
        self._logger.log_creation(user)
        return user
```

## O - Open/Closed Principle (OCP)

> Software entities should be open for extension, but closed for modification.

You should be able to add new features without modifying existing code.

### Example: Violation

```python
# ❌ Bad: Must modify class to add new discount types
class DiscountCalculator:
    def calculate(self, order: Order, discount_type: str) -> Decimal:
        if discount_type == "percentage":
            return order.total * Decimal("0.10")
        elif discount_type == "fixed":
            return Decimal("5.00")
        elif discount_type == "seasonal":
            # Need to modify this class to add a new type
            return order.total * Decimal("0.15")
        else:
            return Decimal("0")
```

### Example: Compliant

```python
# ✅ Good: Use abstraction to allow extension
from abc import ABC, abstractmethod

class DiscountStrategy(ABC):
    """Base abstraction for discount strategies."""

    @abstractmethod
    def calculate(self, order: Order) -> Decimal:
        """Calculates the discount."""
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
    """New type added without modifying existing code."""

    def __init__(self, rate: Decimal):
        self._rate = rate

    def calculate(self, order: Order) -> Decimal:
        return order.total * self._rate


class DiscountCalculator:
    """Applies discount using strategy (closed for modification)."""

    def calculate(self, order: Order, strategy: DiscountStrategy) -> Decimal:
        return strategy.calculate(order)
```

## L - Liskov Substitution Principle (LSP)

> Objects of a superclass should be replaceable with objects of a subclass without breaking the application.

### Example: Violation

```python
# ❌ Bad: Square violates contract of Rectangle
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
        # Violates LSP: Changes parent behavior
        self.width = width
        self.height = width

    def set_height(self, height: int) -> None:
        # Violates LSP: Changes parent behavior
        self.width = height
        self.height = height


# Problem: LSP violation
def test_rectangle(rect: Rectangle):
    rect.set_width(5)
    rect.set_height(4)
    assert rect.area() == 20  # Fails with Square!
```

### Example: Compliant

```python
# ✅ Good: Use composition instead of problematic inheritance
from abc import ABC, abstractmethod

class Shape(ABC):
    """Base abstraction for shapes."""

    @abstractmethod
    def area(self) -> int:
        """Calculates the area."""
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


# Works with any Shape
def print_area(shape: Shape):
    print(f"Area: {shape.area()}")
```

## I - Interface Segregation Principle (ISP)

> Clients should not be forced to depend on interfaces they don't use.

### Example: Violation

```python
# ❌ Bad: Monolithic interface forcing unused methods
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
        print("Working...")

    def eat(self) -> None:
        print("Eating...")

    def sleep(self) -> None:
        print("Sleeping...")


class Robot(Worker):
    def work(self) -> None:
        print("Working...")

    def eat(self) -> None:
        # Robot doesn't eat! Must implement for no reason
        pass

    def sleep(self) -> None:
        # Robot doesn't sleep! Must implement for no reason
        pass
```

### Example: Compliant

```python
# ✅ Good: Small, specific interfaces
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
    """Human can do all three."""

    def work(self) -> None:
        print("Working...")

    def eat(self) -> None:
        print("Eating...")

    def sleep(self) -> None:
        print("Sleeping...")


class Robot(Workable):
    """Robot only needs Workable."""

    def work(self) -> None:
        print("Working...")
```

## D - Dependency Inversion Principle (DIP)

> High-level modules should not depend on low-level modules. Both should depend on abstractions.

### Example: Violation

```python
# ❌ Bad: Direct dependency on concrete implementation
class MySQLDatabase:
    def connect(self) -> None:
        print("Connecting to MySQL...")

    def query(self, sql: str) -> list:
        print(f"Executing: {sql}")
        return []


class UserService:
    def __init__(self):
        # Direct dependency on MySQL (concrete)
        self._db = MySQLDatabase()

    def get_users(self) -> list[User]:
        self._db.connect()
        results = self._db.query("SELECT * FROM users")
        return [User(**row) for row in results]
```

### Example: Compliant

```python
# ✅ Good: Depend on abstraction (interface)
from abc import ABC, abstractmethod

class Database(ABC):
    """Abstraction (Port)."""

    @abstractmethod
    def connect(self) -> None:
        pass

    @abstractmethod
    def query(self, sql: str) -> list:
        pass


class MySQLDatabase(Database):
    """Concrete implementation (Adapter)."""

    def connect(self) -> None:
        print("Connecting to MySQL...")

    def query(self, sql: str) -> list:
        print(f"Executing: {sql}")
        return []


class PostgreSQLDatabase(Database):
    """Another implementation (Adapter)."""

    def connect(self) -> None:
        print("Connecting to PostgreSQL...")

    def query(self, sql: str) -> list:
        print(f"Executing: {sql}")
        return []


class UserService:
    def __init__(self, database: Database):
        # Depends on abstraction, not concrete
        self._db = database

    def get_users(self) -> list[User]:
        self._db.connect()
        results = self._db.query("SELECT * FROM users")
        return [User(**row) for row in results]


# Dependency injection: can choose implementation
mysql_service = UserService(MySQLDatabase())
postgres_service = UserService(PostgreSQLDatabase())
```

## Python Protocols for DIP

Python 3.8+ allows using `Protocol` for structural typing (duck typing).

```python
from typing import Protocol

# No need to inherit explicitly
class Saveable(Protocol):
    """Protocol for saveable entities."""

    def save(self) -> None:
        """Saves the entity."""
        ...


class FileRepository:
    """Implements Saveable without explicit inheritance."""

    def save(self) -> None:
        print("Saving to file...")


class DatabaseRepository:
    """Also implements Saveable."""

    def save(self) -> None:
        print("Saving to database...")


def persist_data(repository: Saveable) -> None:
    """Accepts any object that implements save()."""
    repository.save()


# Both work without explicit inheritance
persist_data(FileRepository())
persist_data(DatabaseRepository())
```

## Complete Example: SOLID Applied

```python
# Domain Layer (business logic)
from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol

# Abstractions (DIP)
class OrderRepository(Protocol):
    """Repository abstraction (port)."""

    def save(self, order: 'Order') -> 'Order':
        ...

    def find_by_id(self, order_id: str) -> 'Order':
        ...


class PaymentGateway(Protocol):
    """Payment gateway abstraction (port)."""

    def process_payment(self, amount: Decimal) -> bool:
        ...


class NotificationService(Protocol):
    """Notification service abstraction (port)."""

    def send(self, recipient: str, message: str) -> None:
        ...


# Entities
@dataclass
class Order:
    """Order entity (SRP: represents order)."""

    id: str
    total: Decimal
    status: str

    def mark_as_paid(self) -> None:
        """Marks order as paid (SRP: business logic)."""
        self.status = "paid"


# Domain Services
class OrderPaymentService:
    """Domain service for payment (SRP: handles payment)."""

    def __init__(self, payment_gateway: PaymentGateway):
        self._payment_gateway = payment_gateway

    def process_payment(self, order: Order) -> bool:
        """Processes payment for an order."""
        return self._payment_gateway.process_payment(order.total)


# Use Case (Application Layer)
class PayOrderUseCase:
    """
    Use case to pay for an order (SRP: coordinates payment).
    Depends on abstractions (DIP).
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
        """Executes order payment."""
        # 1. Retrieve order
        order = self._order_repo.find_by_id(order_id)

        # 2. Process payment
        success = self._payment_service.process_payment(order)

        if success:
            # 3. Update order
            order.mark_as_paid()
            self._order_repo.save(order)

            # 4. Notify customer
            self._notification_service.send(
                order.customer_email,
                "Your payment was successful"
            )

        return success
```

## Benefits of SOLID

1. **Easier maintenance**: Changes are localized
2. **Better testability**: Classes are isolated and mockable
3. **Greater flexibility**: Easy to add new features
4. **Better reusability**: Decoupled components
5. **Improved readability**: Clear responsibilities

## Checklist

- [ ] Each class has a single responsibility (SRP)
- [ ] Extension without modification (OCP)
- [ ] Subtypes are substitutable for their base types (LSP)
- [ ] Small, specific interfaces (ISP)
- [ ] Dependencies on abstractions, not concrete implementations (DIP)
- [ ] Use of Protocols for abstractions
- [ ] Dependency injection for dependencies
- [ ] Testable code with mocks
