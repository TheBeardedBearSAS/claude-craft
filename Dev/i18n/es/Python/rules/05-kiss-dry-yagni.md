# Regla 05: KISS, DRY, YAGNI

Tres principios fundamentales para escribir código simple y mantenible.

## KISS - Keep It Simple, Stupid

> La solución más simple suele ser la mejor.

### Principio

- Favorecer la simplicidad sobre la astucia
- El código debe ser fácil de entender a primera vista
- Si una solución es compleja, probablemente no es la correcta

### Ejemplo: Violación

```python
# ❌ Demasiado complejo: Astuto pero difícil de entender
result = reduce(lambda x, y: x + y, map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, numbers)))
```

### Ejemplo: Conforme

```python
# ✅ Simple y claro
total = 0
for number in numbers:
    if number % 2 == 0:  # Si es par
        total += number ** 2  # Agregar cuadrado
```

### Funciones Cortas

Las funciones deben ser cortas y hacer una sola cosa.

```python
# ❌ Función demasiado larga (>20 líneas)
def process_order(order_data):
    # 50 líneas de código haciendo múltiples cosas
    pass

# ✅ Funciones cortas con responsabilidad única
def validate_order(order_data) -> None:
    """Valida datos de orden."""
    if not order_data.get('items'):
        raise ValueError("La orden debe tener artículos")

def calculate_total(items: list[OrderItem]) -> Decimal:
    """Calcula total."""
    return sum(item.price * item.quantity for item in items)

def apply_discounts(total: Decimal, discounts: list[Discount]) -> Decimal:
    """Aplica descuentos."""
    for discount in discounts:
        total -= discount.calculate(total)
    return total
```

### Nivel Único de Abstracción

Cada función debe permanecer en un único nivel de abstracción.

```python
# ❌ Niveles de abstracción mezclados
def process_user_registration(data: dict):
    # Alto nivel
    user = User(**data)

    # Bajo nivel (detalles de implementación)
    smtp = smtplib.SMTP('localhost', 25)
    msg = MIMEText("Bienvenido")
    msg['Subject'] = "Bienvenido"
    msg['From'] = "noreply@app.com"
    msg['To'] = user.email
    smtp.send_message(msg)

    # Alto nivel nuevamente
    save_to_database(user)

# ✅ Nivel único de abstracción
def process_user_registration(data: dict):
    """Procesa registro de usuario (alto nivel)."""
    user = create_user(data)
    send_welcome_email(user)  # Oculta detalles
    save_user(user)           # Oculta detalles
```

### Retornos Tempranos

Usar retornos tempranos para reducir anidamiento.

```python
# ❌ Anidamiento profundo
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

# ✅ Retornos tempranos
def process_payment(order: Order) -> bool:
    """Procesa pago con retornos tempranos."""
    if not order.is_valid():
        return False

    if not order.has_items():
        return False

    if not order.customer.has_payment_method():
        return False

    return charge_customer(order)
```

## DRY - Don't Repeat Yourself

> Cada pieza de conocimiento debe tener una representación única, inequívoca en el sistema.

### Principio

- No duplicar código
- Extraer lógica común en funciones/clases
- Reutilizar en lugar de copiar y pegar

### Ejemplo: Violación

```python
# ❌ Duplicación de código
class UserController:
    def create_user(self, data: dict):
        if not data.get('email'):
            return {"error": "Email requerido"}, 400
        if not data.get('name'):
            return {"error": "Nombre requerido"}, 400
        # ...

    def update_user(self, user_id: str, data: dict):
        if not data.get('email'):
            return {"error": "Email requerido"}, 400
        if not data.get('name'):
            return {"error": "Nombre requerido"}, 400
        # ...
```

### Ejemplo: Conforme

```python
# ✅ Validación extraída
class UserValidator:
    """Valida datos de usuario."""

    def validate(self, data: dict) -> None:
        """Valida campos requeridos."""
        if not data.get('email'):
            raise ValueError("Email requerido")
        if not data.get('name'):
            raise ValueError("Nombre requerido")


class UserController:
    def __init__(self, validator: UserValidator):
        self._validator = validator

    def create_user(self, data: dict):
        self._validator.validate(data)  # Reutilizar
        # ...

    def update_user(self, user_id: str, data: dict):
        self._validator.validate(data)  # Reutilizar
        # ...
```

### Centralización de Configuración

```python
# ❌ Configuración dispersa
class EmailService:
    def send(self):
        smtp_host = "smtp.gmail.com"  # Duplicado
        smtp_port = 587              # Duplicado

class NotificationService:
    def send(self):
        smtp_host = "smtp.gmail.com"  # Duplicado
        smtp_port = 587              # Duplicado

# ✅ Configuración centralizada
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Configuración centralizada."""
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587

    class Config:
        env_file = ".env"

settings = Settings()

class EmailService:
    def send(self):
        host = settings.smtp_host  # Fuente única
        port = settings.smtp_port  # Fuente única
```

### Constantes

```python
# ❌ Números mágicos dispersos
def calculate_discount(amount: Decimal) -> Decimal:
    if amount > 100:
        return amount * 0.10  # Número mágico
    return Decimal("0")

def check_vip_status(total_purchases: Decimal) -> bool:
    return total_purchases > 100  # Número mágico duplicado

# ✅ Constantes con nombre
MINIMUM_AMOUNT_FOR_DISCOUNT = Decimal("100")
STANDARD_DISCOUNT_RATE = Decimal("0.10")
VIP_THRESHOLD = Decimal("100")

def calculate_discount(amount: Decimal) -> Decimal:
    """Calcula descuento con constante con nombre."""
    if amount > MINIMUM_AMOUNT_FOR_DISCOUNT:
        return amount * STANDARD_DISCOUNT_RATE
    return Decimal("0")

def check_vip_status(total_purchases: Decimal) -> bool:
    """Verifica estado VIP con constante con nombre."""
    return total_purchases > VIP_THRESHOLD
```

## YAGNI - You Aren't Gonna Need It

> No agregues funcionalidad hasta que la necesites.

### Principio

- Implementar solo lo necesario ahora
- No anticipar necesidades futuras
- No sobre-ingenierizar

### Ejemplo: Violación

```python
# ❌ Sobre-ingenierización: Agregando funcionalidades no necesarias
class User:
    def __init__(self, email: str):
        self.email = email
        self.preferences = {}  # Aún no se necesita
        self.settings = {}     # Aún no se necesita
        self.metadata = {}     # Aún no se necesita
        self.cache = {}        # Aún no se necesita
        self.flags = {}        # Aún no se necesita

    def get_preference(self, key: str):  # Aún no se necesita
        pass

    def set_preference(self, key: str, value: any):  # Aún no se necesita
        pass

    def clear_cache(self):  # Aún no se necesita
        pass

    def export_to_json(self):  # Aún no se necesita
        pass

    def export_to_xml(self):  # Aún no se necesita
        pass

    def export_to_csv(self):  # Aún no se necesita
        pass
```

### Ejemplo: Conforme

```python
# ✅ Solo lo necesario ahora
class User:
    """Entidad de usuario - mínimo y necesario."""

    def __init__(self, email: str):
        self.email = email

    # Otras funcionalidades se agregarán cuando se necesiten
```

### Soluciones Genéricas

```python
# ❌ Solución genérica para un solo caso
class GenericDataProcessor:
    """Procesa cualquier tipo de dato (sobre-ingenierizado)."""

    def process(
        self,
        data: any,
        format: str,
        options: dict,
        filters: list,
        transformers: list,
        validators: list
    ):
        # Sistema genérico complejo para un solo caso de uso
        pass

# ✅ Solución específica para necesidad actual
class UserDataValidator:
    """Valida datos de usuario (solo necesidad actual)."""

    def validate(self, data: dict) -> None:
        """Valida campos de usuario requeridos."""
        if not data.get('email'):
            raise ValueError("Email requerido")
```

### Abstracción Prematura

```python
# ❌ Abstracción prematura
class AbstractBaseRepositoryFactoryBuilder:
    """Sobre-abstracción para un solo caso."""
    pass

# ✅ Solución simple
class UserRepository:
    """Repositorio para usuarios - simple y directo."""

    def save(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        return user
```

## Combinando KISS, DRY, YAGNI

```python
# ✅ Buen ejemplo combinando los tres principios
from decimal import Decimal

# YAGNI: Solo implementar lo necesario
class Order:
    """Entidad de orden."""

    def __init__(self, items: list['OrderItem']):
        self.items = items

    # KISS: Método simple y claro
    def calculate_total(self) -> Decimal:
        """Calcula total de orden."""
        return sum(item.subtotal() for item in items)


class OrderItem:
    """Artículo de orden."""

    def __init__(self, price: Decimal, quantity: int):
        self.price = price
        self.quantity = quantity

    # DRY: Cálculo reutilizable
    def subtotal(self) -> Decimal:
        """Calcula subtotal del artículo."""
        return self.price * self.quantity


# KISS: Caso de uso simple
class CalculateOrderTotalUseCase:
    """Caso de uso para calcular total de orden."""

    def execute(self, order: Order) -> Decimal:
        """Ejecuta cálculo."""
        return order.calculate_total()
```

## Nomenclatura

Una buena nomenclatura es clave para KISS.

```python
# ❌ Mala nomenclatura (poco clara)
def proc(d: dict) -> bool:
    if d.get('t') > 100:
        return True
    return False

# ✅ Buena nomenclatura (clara)
def is_eligible_for_discount(order_data: dict) -> bool:
    """Verifica si la orden es elegible para descuento."""
    order_total = order_data.get('total')
    DISCOUNT_THRESHOLD = 100
    return order_total > DISCOUNT_THRESHOLD
```

## Lista de Verificación

### KISS

- [ ] Función < 20 líneas
- [ ] Nivel único de abstracción
- [ ] Sin anidamiento profundo (< 3 niveles)
- [ ] Retornos tempranos utilizados
- [ ] Código claro y explícito
- [ ] Nombres auto-documentados

### DRY

- [ ] Sin duplicación de código
- [ ] Lógica común extraída
- [ ] Configuración centralizada
- [ ] Constantes con nombre utilizadas
- [ ] Utilidades reutilizables creadas

### YAGNI

- [ ] Solo funcionalidades actuales implementadas
- [ ] Sin código especulativo
- [ ] Sin abstracción prematura
- [ ] Sin código sin usar
- [ ] Solución simple y directa

### Señales de Alerta

- ❌ "Podría ser útil en el futuro"
- ❌ "Por si acaso"
- ❌ "Podríamos necesitarlo después"
- ❌ Código copia-pega
- ❌ Función > 20 líneas
- ❌ Anidamiento > 3 niveles
- ❌ Código astuto pero oscuro
