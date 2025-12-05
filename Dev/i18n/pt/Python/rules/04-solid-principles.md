# Regra 04: Princípios SOLID

Os princípios SOLID são cinco princípios de design que tornam o software mais compreensível, flexível e manutenível.

## S - Princípio da Responsabilidade Única (SRP)

> Uma classe deve ter apenas um motivo para mudar.

Cada classe deve ter uma única responsabilidade bem definida.

### Exemplo: Violação

```python
# ❌ Ruim: UserService tem muitas responsabilidades
class UserService:
    def create_user(self, data: dict) -> User:
        """Cria um usuário."""
        # Valida dados
        if not data.get('email'):
            raise ValueError("Email obrigatório")

        # Cria usuário
        user = User(**data)

        # Envia email
        smtp = smtplib.SMTP('localhost')
        smtp.sendmail(
            'noreply@app.com',
            user.email,
            'Bem-vindo!'
        )

        # Salva no banco
        session.add(user)
        session.commit()

        # Registra ação
        logging.info(f"Usuário criado: {user.id}")

        return user
```

### Exemplo: Conforme

```python
# ✅ Bom: Cada classe tem uma única responsabilidade

class UserValidator:
    """Valida dados de usuário."""

    def validate(self, data: dict) -> None:
        if not data.get('email'):
            raise ValueError("Email obrigatório")


class UserFactory:
    """Cria entidades User."""

    def create(self, data: dict) -> User:
        return User(**data)


class EmailService:
    """Gerencia envio de emails."""

    def send_welcome_email(self, user: User) -> None:
        self._smtp.sendmail(
            'noreply@app.com',
            user.email,
            'Bem-vindo!'
        )


class UserRepository:
    """Gerencia persistência de User."""

    def save(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        return user


class UserLogger:
    """Registra ações de usuário."""

    def log_creation(self, user: User) -> None:
        logging.info(f"Usuário criado: {user.id}")


class CreateUserUseCase:
    """Caso de uso para criar usuário - Coordena responsabilidades."""

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
        # Cada etapa delega para a classe responsável
        self._validator.validate(data)
        user = self._factory.create(data)
        user = self._repository.save(user)
        self._email_service.send_welcome_email(user)
        self._logger.log_creation(user)
        return user
```

## O - Princípio Aberto/Fechado (OCP)

> Entidades de software devem estar abertas para extensão, mas fechadas para modificação.

Você deve poder adicionar novos recursos sem modificar código existente.

### Exemplo: Violação

```python
# ❌ Ruim: Deve modificar classe para adicionar novos tipos de desconto
class DiscountCalculator:
    def calculate(self, order: Order, discount_type: str) -> Decimal:
        if discount_type == "percentage":
            return order.total * Decimal("0.10")
        elif discount_type == "fixed":
            return Decimal("5.00")
        elif discount_type == "seasonal":
            # Precisa modificar esta classe para adicionar novo tipo
            return order.total * Decimal("0.15")
        else:
            return Decimal("0")
```

### Exemplo: Conforme

```python
# ✅ Bom: Usa abstração para permitir extensão
from abc import ABC, abstractmethod

class DiscountStrategy(ABC):
    """Abstração base para estratégias de desconto."""

    @abstractmethod
    def calculate(self, order: Order) -> Decimal:
        """Calcula o desconto."""
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
    """Novo tipo adicionado sem modificar código existente."""

    def __init__(self, rate: Decimal):
        self._rate = rate

    def calculate(self, order: Order) -> Decimal:
        return order.total * self._rate


class DiscountCalculator:
    """Aplica desconto usando estratégia (fechado para modificação)."""

    def calculate(self, order: Order, strategy: DiscountStrategy) -> Decimal:
        return strategy.calculate(order)
```

## L - Princípio da Substituição de Liskov (LSP)

> Objetos de uma superclasse devem ser substituíveis por objetos de uma subclasse sem quebrar a aplicação.

### Exemplo: Violação

```python
# ❌ Ruim: Square viola contrato de Rectangle
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
        # Viola LSP: Muda comportamento do pai
        self.width = width
        self.height = width

    def set_height(self, height: int) -> None:
        # Viola LSP: Muda comportamento do pai
        self.width = height
        self.height = height


# Problema: Violação de LSP
def test_rectangle(rect: Rectangle):
    rect.set_width(5)
    rect.set_height(4)
    assert rect.area() == 20  # Falha com Square!
```

### Exemplo: Conforme

```python
# ✅ Bom: Usa composição ao invés de herança problemática
from abc import ABC, abstractmethod

class Shape(ABC):
    """Abstração base para formas."""

    @abstractmethod
    def area(self) -> int:
        """Calcula a área."""
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


# Funciona com qualquer Shape
def print_area(shape: Shape):
    print(f"Área: {shape.area()}")
```

## I - Princípio da Segregação de Interface (ISP)

> Clientes não devem ser forçados a depender de interfaces que não usam.

### Exemplo: Violação

```python
# ❌ Ruim: Interface monolítica forçando métodos não utilizados
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
        print("Trabalhando...")

    def eat(self) -> None:
        print("Comendo...")

    def sleep(self) -> None:
        print("Dormindo...")


class Robot(Worker):
    def work(self) -> None:
        print("Trabalhando...")

    def eat(self) -> None:
        # Robô não come! Deve implementar sem motivo
        pass

    def sleep(self) -> None:
        # Robô não dorme! Deve implementar sem motivo
        pass
```

### Exemplo: Conforme

```python
# ✅ Bom: Interfaces pequenas e específicas
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
    """Humano pode fazer todas as três."""

    def work(self) -> None:
        print("Trabalhando...")

    def eat(self) -> None:
        print("Comendo...")

    def sleep(self) -> None:
        print("Dormindo...")


class Robot(Workable):
    """Robô só precisa de Workable."""

    def work(self) -> None:
        print("Trabalhando...")
```

## D - Princípio da Inversão de Dependência (DIP)

> Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.

### Exemplo: Violação

```python
# ❌ Ruim: Dependência direta de implementação concreta
class MySQLDatabase:
    def connect(self) -> None:
        print("Conectando ao MySQL...")

    def query(self, sql: str) -> list:
        print(f"Executando: {sql}")
        return []


class UserService:
    def __init__(self):
        # Dependência direta do MySQL (concreto)
        self._db = MySQLDatabase()

    def get_users(self) -> list[User]:
        self._db.connect()
        results = self._db.query("SELECT * FROM users")
        return [User(**row) for row in results]
```

### Exemplo: Conforme

```python
# ✅ Bom: Depende de abstração (interface)
from abc import ABC, abstractmethod

class Database(ABC):
    """Abstração (Port)."""

    @abstractmethod
    def connect(self) -> None:
        pass

    @abstractmethod
    def query(self, sql: str) -> list:
        pass


class MySQLDatabase(Database):
    """Implementação concreta (Adapter)."""

    def connect(self) -> None:
        print("Conectando ao MySQL...")

    def query(self, sql: str) -> list:
        print(f"Executando: {sql}")
        return []


class PostgreSQLDatabase(Database):
    """Outra implementação (Adapter)."""

    def connect(self) -> None:
        print("Conectando ao PostgreSQL...")

    def query(self, sql: str) -> list:
        print(f"Executando: {sql}")
        return []


class UserService:
    def __init__(self, database: Database):
        # Depende de abstração, não de concreto
        self._db = database

    def get_users(self) -> list[User]:
        self._db.connect()
        results = self._db.query("SELECT * FROM users")
        return [User(**row) for row in results]


# Injeção de dependência: pode escolher implementação
mysql_service = UserService(MySQLDatabase())
postgres_service = UserService(PostgreSQLDatabase())
```

## Protocols Python para DIP

Python 3.8+ permite usar `Protocol` para tipagem estrutural (duck typing).

```python
from typing import Protocol

# Não precisa herdar explicitamente
class Saveable(Protocol):
    """Protocol para entidades que podem ser salvas."""

    def save(self) -> None:
        """Salva a entidade."""
        ...


class FileRepository:
    """Implementa Saveable sem herança explícita."""

    def save(self) -> None:
        print("Salvando em arquivo...")


class DatabaseRepository:
    """Também implementa Saveable."""

    def save(self) -> None:
        print("Salvando no banco de dados...")


def persist_data(repository: Saveable) -> None:
    """Aceita qualquer objeto que implementa save()."""
    repository.save()


# Ambos funcionam sem herança explícita
persist_data(FileRepository())
persist_data(DatabaseRepository())
```

## Exemplo Completo: SOLID Aplicado

```python
# Camada Domain (lógica de negócio)
from abc import ABC, abstractmethod
from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol

# Abstrações (DIP)
class OrderRepository(Protocol):
    """Abstração de repositório (port)."""

    def save(self, order: 'Order') -> 'Order':
        ...

    def find_by_id(self, order_id: str) -> 'Order':
        ...


class PaymentGateway(Protocol):
    """Abstração de gateway de pagamento (port)."""

    def process_payment(self, amount: Decimal) -> bool:
        ...


class NotificationService(Protocol):
    """Abstração de serviço de notificação (port)."""

    def send(self, recipient: str, message: str) -> None:
        ...


# Entidades
@dataclass
class Order:
    """Entidade Order (SRP: representa pedido)."""

    id: str
    total: Decimal
    status: str

    def mark_as_paid(self) -> None:
        """Marca pedido como pago (SRP: lógica de negócio)."""
        self.status = "paid"


# Serviços de Domínio
class OrderPaymentService:
    """Serviço de domínio para pagamento (SRP: trata pagamento)."""

    def __init__(self, payment_gateway: PaymentGateway):
        self._payment_gateway = payment_gateway

    def process_payment(self, order: Order) -> bool:
        """Processa pagamento de um pedido."""
        return self._payment_gateway.process_payment(order.total)


# Caso de Uso (Camada Application)
class PayOrderUseCase:
    """
    Caso de uso para pagar pedido (SRP: coordena pagamento).
    Depende de abstrações (DIP).
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
        """Executa pagamento do pedido."""
        # 1. Recuperar pedido
        order = self._order_repo.find_by_id(order_id)

        # 2. Processar pagamento
        success = self._payment_service.process_payment(order)

        if success:
            # 3. Atualizar pedido
            order.mark_as_paid()
            self._order_repo.save(order)

            # 4. Notificar cliente
            self._notification_service.send(
                order.customer_email,
                "Seu pagamento foi bem-sucedido"
            )

        return success
```

## Benefícios do SOLID

1. **Manutenção mais fácil**: Mudanças são localizadas
2. **Melhor testabilidade**: Classes isoladas e mockáveis
3. **Maior flexibilidade**: Fácil adicionar novos recursos
4. **Melhor reusabilidade**: Componentes desacoplados
5. **Melhor legibilidade**: Responsabilidades claras

## Checklist

- [ ] Cada classe tem uma única responsabilidade (SRP)
- [ ] Extensão sem modificação (OCP)
- [ ] Subtipos são substituíveis por seus tipos base (LSP)
- [ ] Interfaces pequenas e específicas (ISP)
- [ ] Dependências em abstrações, não em implementações concretas (DIP)
- [ ] Uso de Protocols para abstrações
- [ ] Injeção de dependência para dependências
- [ ] Código testável com mocks
