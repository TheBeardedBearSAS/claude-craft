# Regra 05: KISS, DRY, YAGNI

Três princípios fundamentais para escrever código simples e manutenível.

## KISS - Keep It Simple, Stupid

> A solução mais simples é frequentemente a melhor.

### Princípio

- Favoreça simplicidade ao invés de esperteza
- Código deve ser fácil de entender à primeira vista
- Se uma solução é complexa, provavelmente não é a certa

### Exemplo: Violação

```python
# ❌ Muito complexo: Esperto mas difícil de entender
result = reduce(lambda x, y: x + y, map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, numbers)))
```

### Exemplo: Conforme

```python
# ✅ Simples e claro
total = 0
for number in numbers:
    if number % 2 == 0:  # Se par
        total += number ** 2  # Adiciona quadrado
```

### Funções Curtas

Funções devem ser curtas e fazer uma coisa.

```python
# ❌ Função muito longa (>20 linhas)
def process_order(order_data):
    # 50 linhas de código fazendo múltiplas coisas
    pass

# ✅ Funções curtas com responsabilidade única
def validate_order(order_data) -> None:
    """Valida dados do pedido."""
    if not order_data.get('items'):
        raise ValueError("Pedido deve ter itens")

def calculate_total(items: list[OrderItem]) -> Decimal:
    """Calcula total."""
    return sum(item.price * item.quantity for item in items)

def apply_discounts(total: Decimal, discounts: list[Discount]) -> Decimal:
    """Aplica descontos."""
    for discount in discounts:
        total -= discount.calculate(total)
    return total
```

### Nível Único de Abstração

Cada função deve permanecer em um único nível de abstração.

```python
# ❌ Níveis mistos de abstração
def process_user_registration(data: dict):
    # Alto nível
    user = User(**data)

    # Baixo nível (detalhes de implementação)
    smtp = smtplib.SMTP('localhost', 25)
    msg = MIMEText("Bem-vindo")
    msg['Subject'] = "Bem-vindo"
    msg['From'] = "noreply@app.com"
    msg['To'] = user.email
    smtp.send_message(msg)

    # Alto nível novamente
    save_to_database(user)

# ✅ Nível único de abstração
def process_user_registration(data: dict):
    """Processa registro de usuário (alto nível)."""
    user = create_user(data)
    send_welcome_email(user)  # Esconde detalhes
    save_user(user)           # Esconde detalhes
```

### Retornos Antecipados

Use retornos antecipados para reduzir aninhamento.

```python
# ❌ Aninhamento profundo
def process_payment(order: Order) -> bool:
    if order.is_valid():
        if order.has_items():
            if order.customer.has_payment_method():
                if charge_customer(order):
                    return True
                else:
                    return False
            else:
                return False
        else:
            return False
    else:
        return False

# ✅ Retornos antecipados
def process_payment(order: Order) -> bool:
    """Processa pagamento com retornos antecipados."""
    if not order.is_valid():
        return False

    if not order.has_items():
        return False

    if not order.customer.has_payment_method():
        return False

    return charge_customer(order)
```

## DRY - Don't Repeat Yourself

> Cada pedaço de conhecimento deve ter uma representação única, não ambígua, no sistema.

### Princípio

- Não duplique código
- Extraia lógica comum em funções/classes
- Reuse ao invés de copy-paste

### Exemplo: Violação

```python
# ❌ Duplicação de código
class UserController:
    def create_user(self, data: dict):
        if not data.get('email'):
            return {"error": "Email obrigatório"}, 400
        if not data.get('name'):
            return {"error": "Nome obrigatório"}, 400
        # ...

    def update_user(self, user_id: str, data: dict):
        if not data.get('email'):
            return {"error": "Email obrigatório"}, 400
        if not data.get('name'):
            return {"error": "Nome obrigatório"}, 400
        # ...
```

### Exemplo: Conforme

```python
# ✅ Validação extraída
class UserValidator:
    """Valida dados de usuário."""

    def validate(self, data: dict) -> None:
        """Valida campos obrigatórios."""
        if not data.get('email'):
            raise ValueError("Email obrigatório")
        if not data.get('name'):
            raise ValueError("Nome obrigatório")


class UserController:
    def __init__(self, validator: UserValidator):
        self._validator = validator

    def create_user(self, data: dict):
        self._validator.validate(data)  # Reuso
        # ...

    def update_user(self, user_id: str, data: dict):
        self._validator.validate(data)  # Reuso
        # ...
```

### Centralização de Configuração

```python
# ❌ Configuração espalhada
class EmailService:
    def send(self):
        smtp_host = "smtp.gmail.com"  # Duplicado
        smtp_port = 587              # Duplicado

class NotificationService:
    def send(self):
        smtp_host = "smtp.gmail.com"  # Duplicado
        smtp_port = 587              # Duplicado

# ✅ Configuração centralizada
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Configurações centralizadas."""
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587

    class Config:
        env_file = ".env"

settings = Settings()

class EmailService:
    def send(self):
        host = settings.smtp_host  # Fonte única
        port = settings.smtp_port  # Fonte única
```

### Constantes

```python
# ❌ Números mágicos espalhados
def calculate_discount(amount: Decimal) -> Decimal:
    if amount > 100:
        return amount * 0.10  # Número mágico
    return Decimal("0")

def check_vip_status(total_purchases: Decimal) -> bool:
    return total_purchases > 100  # Número mágico duplicado

# ✅ Constantes nomeadas
MINIMUM_AMOUNT_FOR_DISCOUNT = Decimal("100")
STANDARD_DISCOUNT_RATE = Decimal("0.10")
VIP_THRESHOLD = Decimal("100")

def calculate_discount(amount: Decimal) -> Decimal:
    """Calcula desconto com constante nomeada."""
    if amount > MINIMUM_AMOUNT_FOR_DISCOUNT:
        return amount * STANDARD_DISCOUNT_RATE
    return Decimal("0")

def check_vip_status(total_purchases: Decimal) -> bool:
    """Verifica status VIP com constante nomeada."""
    return total_purchases > VIP_THRESHOLD
```

## YAGNI - You Aren't Gonna Need It

> Não adicione funcionalidade até que você precise dela.

### Princípio

- Implemente apenas o que é necessário agora
- Não antecipe necessidades futuras
- Não faça over-engineering

### Exemplo: Violação

```python
# ❌ Over-engineering: Adicionando recursos não necessários
class User:
    def __init__(self, email: str):
        self.email = email
        self.preferences = {}  # Não necessário ainda
        self.settings = {}     # Não necessário ainda
        self.metadata = {}     # Não necessário ainda
        self.cache = {}        # Não necessário ainda
        self.flags = {}        # Não necessário ainda

    def get_preference(self, key: str):  # Não necessário ainda
        pass

    def set_preference(self, key: str, value: any):  # Não necessário ainda
        pass

    def clear_cache(self):  # Não necessário ainda
        pass

    def export_to_json(self):  # Não necessário ainda
        pass

    def export_to_xml(self):  # Não necessário ainda
        pass

    def export_to_csv(self):  # Não necessário ainda
        pass
```

### Exemplo: Conforme

```python
# ✅ Apenas o que é necessário agora
class User:
    """Entidade User - mínima e necessária."""

    def __init__(self, email: str):
        self.email = email

    # Outros recursos serão adicionados quando necessário
```

### Soluções Genéricas

```python
# ❌ Solução genérica para um caso
class GenericDataProcessor:
    """Processa qualquer tipo de dado (over-engineered)."""

    def process(
        self,
        data: any,
        format: str,
        options: dict,
        filters: list,
        transformers: list,
        validators: list
    ):
        # Sistema genérico complexo para um único caso de uso
        pass

# ✅ Solução específica para necessidade real
class UserDataValidator:
    """Valida dados de usuário (necessidade atual apenas)."""

    def validate(self, data: dict) -> None:
        """Valida campos obrigatórios de usuário."""
        if not data.get('email'):
            raise ValueError("Email obrigatório")
```

### Abstração Prematura

```python
# ❌ Abstração prematura
class AbstractBaseRepositoryFactoryBuilder:
    """Over-abstração para caso único."""
    pass

# ✅ Solução simples
class UserRepository:
    """Repositório para usuários - simples e direto."""

    def save(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        return user
```

## Combinando KISS, DRY, YAGNI

```python
# ✅ Bom exemplo combinando todos os três princípios
from decimal import Decimal

# YAGNI: Implementa apenas o necessário
class Order:
    """Entidade Order."""

    def __init__(self, items: list['OrderItem']):
        self.items = items

    # KISS: Método simples e claro
    def calculate_total(self) -> Decimal:
        """Calcula total do pedido."""
        return sum(item.subtotal() for item in items)


class OrderItem:
    """Item de pedido."""

    def __init__(self, price: Decimal, quantity: int):
        self.price = price
        self.quantity = quantity

    # DRY: Cálculo reutilizável
    def subtotal(self) -> Decimal:
        """Calcula subtotal do item."""
        return self.price * self.quantity


# KISS: Caso de uso simples
class CalculateOrderTotalUseCase:
    """Caso de uso para calcular total do pedido."""

    def execute(self, order: Order) -> Decimal:
        """Executa cálculo."""
        return order.calculate_total()
```

## Nomenclatura

Boa nomenclatura é fundamental para KISS.

```python
# ❌ Nomenclatura ruim (não clara)
def proc(d: dict) -> bool:
    if d.get('t') > 100:
        return True
    return False

# ✅ Nomenclatura boa (clara)
def is_eligible_for_discount(order_data: dict) -> bool:
    """Verifica se pedido é elegível para desconto."""
    order_total = order_data.get('total')
    DISCOUNT_THRESHOLD = 100
    return order_total > DISCOUNT_THRESHOLD
```

## Checklist

### KISS

- [ ] Função < 20 linhas
- [ ] Nível único de abstração
- [ ] Sem aninhamento profundo (< 3 níveis)
- [ ] Retornos antecipados usados
- [ ] Código claro e explícito
- [ ] Nomes auto-documentados

### DRY

- [ ] Sem código duplicado
- [ ] Lógica comum extraída
- [ ] Configuração centralizada
- [ ] Constantes nomeadas usadas
- [ ] Utilitários reutilizáveis criados

### YAGNI

- [ ] Apenas recursos atuais implementados
- [ ] Sem código especulativo
- [ ] Sem abstração prematura
- [ ] Sem código não utilizado
- [ ] Solução simples e direta

### Sinais de Alerta

- ❌ "Pode ser útil no futuro"
- ❌ "Apenas por precaução"
- ❌ "Podemos precisar depois"
- ❌ Código copy-paste
- ❌ Função > 20 linhas
- ❌ Aninhamento > 3 níveis
- ❌ Código esperto mas obscuro
