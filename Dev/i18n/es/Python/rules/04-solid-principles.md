# Regla 04: Principios SOLID

Los principios SOLID son cinco principios de diseño que hacen que el software sea más comprensible, flexible y mantenible.

## S - Principio de Responsabilidad Única (SRP)

> Una clase debe tener solo una razón para cambiar.

Cada clase debe tener una única responsabilidad bien definida.

### Ejemplo: Violación

```python
# ❌ Malo: UserService tiene demasiadas responsabilidades
class UserService:
    def create_user(self, data: dict) -> User:
        """Crea un usuario."""
        # Valida datos
        if not data.get('email'):
            raise ValueError("Email requerido")

        # Crea usuario
        user = User(**data)

        # Envía email
        smtp = smtplib.SMTP('localhost')
        smtp.sendmail(
            'noreply@app.com',
            user.email,
            'Bienvenido!'
        )

        # Guarda en base de datos
        session.add(user)
        session.commit()

        # Registra acción
        logging.info(f"Usuario creado: {user.id}")

        return user
```

### Ejemplo: Conforme

```python
# ✅ Bueno: Cada clase tiene una sola responsabilidad

class UserValidator:
    """Valida datos de usuario."""

    def validate(self, data: dict) -> None:
        if not data.get('email'):
            raise ValueError("Email requerido")


class UserFactory:
    """Crea entidades User."""

    def create(self, data: dict) -> User:
        return User(**data)


class EmailService:
    """Gestiona el envío de emails."""

    def send_welcome_email(self, user: User) -> None:
        self._smtp.sendmail(
            'noreply@app.com',
            user.email,
            'Bienvenido!'
        )


class UserRepository:
    """Gestiona la persistencia de User."""

    def save(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        return user


class UserLogger:
    """Registra acciones de usuario."""

    def log_creation(self, user: User) -> None:
        logging.info(f"Usuario creado: {user.id}")


class CreateUserUseCase:
    """Caso de uso para crear usuario - Coordina responsabilidades."""

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
        # Cada paso delega a la clase responsable
        self._validator.validate(data)
        user = self._factory.create(data)
        user = self._repository.save(user)
        self._email_service.send_welcome_email(user)
        self._logger.log_creation(user)
        return user
```

## O - Principio Abierto/Cerrado (OCP)

> Las entidades de software deben estar abiertas para extensión, pero cerradas para modificación.

Debes poder agregar nuevas funcionalidades sin modificar el código existente.

### Ejemplo: Violación

```python
# ❌ Malo: Debe modificar la clase para agregar nuevos tipos de descuento
class DiscountCalculator:
    def calculate(self, order: Order, discount_type: str) -> Decimal:
        if discount_type == "percentage":
            return order.total * Decimal("0.10")
        elif discount_type == "fixed":
            return Decimal("5.00")
        elif discount_type == "seasonal":
            # Necesita modificar esta clase para agregar un nuevo tipo
            return order.total * Decimal("0.15")
        else:
            return Decimal("0")
```

### Ejemplo: Conforme

```python
# ✅ Bueno: Usar abstracción para permitir extensión
from abc import ABC, abstractmethod

class DiscountStrategy(ABC):
    """Abstracción base para estrategias de descuento."""

    @abstractmethod
    def calculate(self, order: Order) -> Decimal:
        """Calcula el descuento."""
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
    """Nuevo tipo agregado sin modificar código existente."""

    def __init__(self, rate: Decimal):
        self._rate = rate

    def calculate(self, order: Order) -> Decimal:
        return order.total * self._rate


class DiscountCalculator:
    """Aplica descuento usando estrategia (cerrado para modificación)."""

    def calculate(self, order: Order, strategy: DiscountStrategy) -> Decimal:
        return strategy.calculate(order)
```

## L - Principio de Sustitución de Liskov (LSP)

> Los objetos de una superclase deben ser reemplazables con objetos de una subclase sin romper la aplicación.

### Ejemplo: Violación

```python
# ❌ Malo: Square viola el contrato de Rectangle
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
        # Viola LSP: Cambia comportamiento del padre
        self.width = width
        self.height = width

    def set_height(self, height: int) -> None:
        # Viola LSP: Cambia comportamiento del padre
        self.width = height
        self.height = height


# Problema: violación de LSP
def test_rectangle(rect: Rectangle):
    rect.set_width(5)
    rect.set_height(4)
    assert rect.area() == 20  # ¡Falla con Square!
```

### Ejemplo: Conforme

```python
# ✅ Bueno: Usar composición en lugar de herencia problemática
from abc import ABC, abstractmethod

class Shape(ABC):
    """Abstracción base para formas."""

    @abstractmethod
    def area(self) -> int:
        """Calcula el área."""
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


# Funciona con cualquier Shape
def print_area(shape: Shape):
    print(f"Área: {shape.area()}")
```

## I - Principio de Segregación de Interfaces (ISP)

> Los clientes no deben ser forzados a depender de interfaces que no usan.

### Ejemplo: Violación

```python
# ❌ Malo: Interfaz monolítica que fuerza métodos no utilizados
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
        print("Trabajando...")

    def eat(self) -> None:
        print("Comiendo...")

    def sleep(self) -> None:
        print("Durmiendo...")


class Robot(Worker):
    def work(self) -> None:
        print("Trabajando...")

    def eat(self) -> None:
        # ¡El robot no come! Debe implementar sin razón
        pass

    def sleep(self) -> None:
        # ¡El robot no duerme! Debe implementar sin razón
        pass
```

### Ejemplo: Conforme

```python
# ✅ Bueno: Interfaces pequeñas y específicas
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
    """El humano puede hacer las tres cosas."""

    def work(self) -> None:
        print("Trabajando...")

    def eat(self) -> None:
        print("Comiendo...")

    def sleep(self) -> None:
        print("Durmiendo...")


class Robot(Workable):
    """El robot solo necesita Workable."""

    def work(self) -> None:
        print("Trabajando...")
```

## D - Principio de Inversión de Dependencias (DIP)

> Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.

### Ejemplo: Violación

```python
# ❌ Malo: Dependencia directa de implementación concreta
class MySQLDatabase:
    def connect(self) -> None:
        print("Conectando a MySQL...")

    def query(self, sql: str) -> list:
        print(f"Ejecutando: {sql}")
        return []


class UserService:
    def __init__(self):
        # Dependencia directa de MySQL (concreto)
        self._db = MySQLDatabase()

    def get_users(self) -> list[User]:
        self._db.connect()
        results = self._db.query("SELECT * FROM users")
        return [User(**row) for row in results]
```

### Ejemplo: Conforme

```python
# ✅ Bueno: Depender de abstracción (interfaz)
from abc import ABC, abstractmethod

class Database(ABC):
    """Abstracción (Port)."""

    @abstractmethod
    def connect(self) -> None:
        pass

    @abstractmethod
    def query(self, sql: str) -> list:
        pass


class MySQLDatabase(Database):
    """Implementación concreta (Adapter)."""

    def connect(self) -> None:
        print("Conectando a MySQL...")

    def query(self, sql: str) -> list:
        print(f"Ejecutando: {sql}")
        return []


class PostgreSQLDatabase(Database):
    """Otra implementación (Adapter)."""

    def connect(self) -> None:
        print("Conectando a PostgreSQL...")

    def query(self, sql: str) -> list:
        print(f"Ejecutando: {sql}")
        return []


class UserService:
    def __init__(self, database: Database):
        # Depende de abstracción, no de concreto
        self._db = database

    def get_users(self) -> list[User]:
        self._db.connect()
        results = self._db.query("SELECT * FROM users")
        return [User(**row) for row in results]


# Inyección de dependencias: puede elegir implementación
mysql_service = UserService(MySQLDatabase())
postgres_service = UserService(PostgreSQLDatabase())
```

## Protocolos de Python para DIP

Python 3.8+ permite usar `Protocol` para tipado estructural (duck typing).

```python
from typing import Protocol

# No necesita heredar explícitamente
class Saveable(Protocol):
    """Protocolo para entidades guardables."""

    def save(self) -> None:
        """Guarda la entidad."""
        ...


class FileRepository:
    """Implementa Saveable sin herencia explícita."""

    def save(self) -> None:
        print("Guardando en archivo...")


class DatabaseRepository:
    """También implementa Saveable."""

    def save(self) -> None:
        print("Guardando en base de datos...")


def persist_data(repository: Saveable) -> None:
    """Acepta cualquier objeto que implemente save()."""
    repository.save()


# Ambos funcionan sin herencia explícita
persist_data(FileRepository())
persist_data(DatabaseRepository())
```

## Ejemplo Completo: SOLID Aplicado

```python
# Capa de Dominio (lógica de negocio)
from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol

# Abstracciones (DIP)
class OrderRepository(Protocol):
    """Abstracción de repositorio (port)."""

    def save(self, order: 'Order') -> 'Order':
        ...

    def find_by_id(self, order_id: str) -> 'Order':
        ...


class PaymentGateway(Protocol):
    """Abstracción de pasarela de pago (port)."""

    def process_payment(self, amount: Decimal) -> bool:
        ...


class NotificationService(Protocol):
    """Abstracción de servicio de notificación (port)."""

    def send(self, recipient: str, message: str) -> None:
        ...


# Entidades
@dataclass
class Order:
    """Entidad de orden (SRP: representa orden)."""

    id: str
    total: Decimal
    status: str

    def mark_as_paid(self) -> None:
        """Marca orden como pagada (SRP: lógica de negocio)."""
        self.status = "paid"


# Servicios de Dominio
class OrderPaymentService:
    """Servicio de dominio para pago (SRP: maneja pago)."""

    def __init__(self, payment_gateway: PaymentGateway):
        self._payment_gateway = payment_gateway

    def process_payment(self, order: Order) -> bool:
        """Procesa pago de una orden."""
        return self._payment_gateway.process_payment(order.total)


# Caso de Uso (Capa de Aplicación)
class PayOrderUseCase:
    """
    Caso de uso para pagar una orden (SRP: coordina pago).
    Depende de abstracciones (DIP).
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
        """Ejecuta pago de orden."""
        # 1. Recuperar orden
        order = self._order_repo.find_by_id(order_id)

        # 2. Procesar pago
        success = self._payment_service.process_payment(order)

        if success:
            # 3. Actualizar orden
            order.mark_as_paid()
            self._order_repo.save(order)

            # 4. Notificar cliente
            self._notification_service.send(
                order.customer_email,
                "Su pago fue exitoso"
            )

        return success
```

## Beneficios de SOLID

1. **Mantenimiento más fácil**: Los cambios están localizados
2. **Mejor testabilidad**: Las clases están aisladas y se pueden simular (mock)
3. **Mayor flexibilidad**: Fácil agregar nuevas funcionalidades
4. **Mejor reusabilidad**: Componentes desacoplados
5. **Legibilidad mejorada**: Responsabilidades claras

## Lista de Verificación

- [ ] Cada clase tiene una sola responsabilidad (SRP)
- [ ] Extensión sin modificación (OCP)
- [ ] Los subtipos son sustituibles por sus tipos base (LSP)
- [ ] Interfaces pequeñas y específicas (ISP)
- [ ] Dependencias en abstracciones, no en implementaciones concretas (DIP)
- [ ] Uso de Protocolos para abstracciones
- [ ] Inyección de dependencias para dependencias
- [ ] Código testeable con mocks
