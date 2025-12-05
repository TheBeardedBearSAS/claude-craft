# Rule 05: KISS, DRY, YAGNI

Three fundamental principles for writing simple, maintainable code.

## KISS - Keep It Simple, Stupid

> The simplest solution is often the best.

### Principle

- Favor simplicity over cleverness
- Code should be easy to understand at first glance
- If a solution is complex, it's probably not the right one

### Example: Violation

```python
# ❌ Too complex: Clever but hard to understand
result = reduce(lambda x, y: x + y, map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, numbers)))
```

### Example: Compliant

```python
# ✅ Simple and clear
total = 0
for number in numbers:
    if number % 2 == 0:  # If even
        total += number ** 2  # Add square
```

### Short Functions

Functions should be short and do one thing.

```python
# ❌ Function too long (>20 lines)
def process_order(order_data):
    # 50 lines of code doing multiple things
    pass

# ✅ Short functions with single responsibility
def validate_order(order_data) -> None:
    """Validates order data."""
    if not order_data.get('items'):
        raise ValueError("Order must have items")

def calculate_total(items: list[OrderItem]) -> Decimal:
    """Calculates total."""
    return sum(item.price * item.quantity for item in items)

def apply_discounts(total: Decimal, discounts: list[Discount]) -> Decimal:
    """Applies discounts."""
    for discount in discounts:
        total -= discount.calculate(total)
    return total
```

### Single Level of Abstraction

Each function should stay at a single level of abstraction.

```python
# ❌ Mixed abstraction levels
def process_user_registration(data: dict):
    # High level
    user = User(**data)

    # Low level (implementation details)
    smtp = smtplib.SMTP('localhost', 25)
    msg = MIMEText("Welcome")
    msg['Subject'] = "Welcome"
    msg['From'] = "noreply@app.com"
    msg['To'] = user.email
    smtp.send_message(msg)

    # High level again
    save_to_database(user)

# ✅ Single abstraction level
def process_user_registration(data: dict):
    """Process user registration (high level)."""
    user = create_user(data)
    send_welcome_email(user)  # Hides details
    save_user(user)           # Hides details
```

### Early Returns

Use early returns to reduce nesting.

```python
# ❌ Deep nesting
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

# ✅ Early returns
def process_payment(order: Order) -> bool:
    """Process payment with early returns."""
    if not order.is_valid():
        return False

    if not order.has_items():
        return False

    if not order.customer.has_payment_method():
        return False

    return charge_customer(order)
```

## DRY - Don't Repeat Yourself

> Every piece of knowledge should have a single, unambiguous representation in the system.

### Principle

- Don't duplicate code
- Extract common logic into functions/classes
- Reuse instead of copy-paste

### Example: Violation

```python
# ❌ Code duplication
class UserController:
    def create_user(self, data: dict):
        if not data.get('email'):
            return {"error": "Email required"}, 400
        if not data.get('name'):
            return {"error": "Name required"}, 400
        # ...

    def update_user(self, user_id: str, data: dict):
        if not data.get('email'):
            return {"error": "Email required"}, 400
        if not data.get('name'):
            return {"error": "Name required"}, 400
        # ...
```

### Example: Compliant

```python
# ✅ Validation extracted
class UserValidator:
    """Validates user data."""

    def validate(self, data: dict) -> None:
        """Validates required fields."""
        if not data.get('email'):
            raise ValueError("Email required")
        if not data.get('name'):
            raise ValueError("Name required")


class UserController:
    def __init__(self, validator: UserValidator):
        self._validator = validator

    def create_user(self, data: dict):
        self._validator.validate(data)  # Reuse
        # ...

    def update_user(self, user_id: str, data: dict):
        self._validator.validate(data)  # Reuse
        # ...
```

### Configuration Centralization

```python
# ❌ Configuration scattered
class EmailService:
    def send(self):
        smtp_host = "smtp.gmail.com"  # Duplicated
        smtp_port = 587              # Duplicated

class NotificationService:
    def send(self):
        smtp_host = "smtp.gmail.com"  # Duplicated
        smtp_port = 587              # Duplicated

# ✅ Centralized configuration
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Centralized settings."""
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587

    class Config:
        env_file = ".env"

settings = Settings()

class EmailService:
    def send(self):
        host = settings.smtp_host  # Single source
        port = settings.smtp_port  # Single source
```

### Constants

```python
# ❌ Magic numbers scattered
def calculate_discount(amount: Decimal) -> Decimal:
    if amount > 100:
        return amount * 0.10  # Magic number
    return Decimal("0")

def check_vip_status(total_purchases: Decimal) -> bool:
    return total_purchases > 100  # Magic number duplicated

# ✅ Named constants
MINIMUM_AMOUNT_FOR_DISCOUNT = Decimal("100")
STANDARD_DISCOUNT_RATE = Decimal("0.10")
VIP_THRESHOLD = Decimal("100")

def calculate_discount(amount: Decimal) -> Decimal:
    """Calculate discount with named constant."""
    if amount > MINIMUM_AMOUNT_FOR_DISCOUNT:
        return amount * STANDARD_DISCOUNT_RATE
    return Decimal("0")

def check_vip_status(total_purchases: Decimal) -> bool:
    """Check VIP status with named constant."""
    return total_purchases > VIP_THRESHOLD
```

## YAGNI - You Aren't Gonna Need It

> Don't add functionality until you need it.

### Principle

- Implement only what is necessary now
- Don't anticipate future needs
- Don't over-engineer

### Example: Violation

```python
# ❌ Over-engineering: Adding features not needed
class User:
    def __init__(self, email: str):
        self.email = email
        self.preferences = {}  # Not needed yet
        self.settings = {}     # Not needed yet
        self.metadata = {}     # Not needed yet
        self.cache = {}        # Not needed yet
        self.flags = {}        # Not needed yet

    def get_preference(self, key: str):  # Not needed yet
        pass

    def set_preference(self, key: str, value: any):  # Not needed yet
        pass

    def clear_cache(self):  # Not needed yet
        pass

    def export_to_json(self):  # Not needed yet
        pass

    def export_to_xml(self):  # Not needed yet
        pass

    def export_to_csv(self):  # Not needed yet
        pass
```

### Example: Compliant

```python
# ✅ Only what's needed now
class User:
    """User entity - minimal and necessary."""

    def __init__(self, email: str):
        self.email = email

    # Other features will be added when needed
```

### Generic Solutions

```python
# ❌ Generic solution for one case
class GenericDataProcessor:
    """Processes any type of data (over-engineered)."""

    def process(
        self,
        data: any,
        format: str,
        options: dict,
        filters: list,
        transformers: list,
        validators: list
    ):
        # Complex generic system for a single use case
        pass

# ✅ Specific solution for actual need
class UserDataValidator:
    """Validates user data (current need only)."""

    def validate(self, data: dict) -> None:
        """Validates required user fields."""
        if not data.get('email'):
            raise ValueError("Email required")
```

### Premature Abstraction

```python
# ❌ Premature abstraction
class AbstractBaseRepositoryFactoryBuilder:
    """Over-abstraction for single case."""
    pass

# ✅ Simple solution
class UserRepository:
    """Repository for users - simple and direct."""

    def save(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        return user
```

## Combining KISS, DRY, YAGNI

```python
# ✅ Good example combining all three principles
from decimal import Decimal

# YAGNI: Only implement what's needed
class Order:
    """Order entity."""

    def __init__(self, items: list['OrderItem']):
        self.items = items

    # KISS: Simple, clear method
    def calculate_total(self) -> Decimal:
        """Calculate order total."""
        return sum(item.subtotal() for item in items)


class OrderItem:
    """Order item."""

    def __init__(self, price: Decimal, quantity: int):
        self.price = price
        self.quantity = quantity

    # DRY: Reusable calculation
    def subtotal(self) -> Decimal:
        """Calculate item subtotal."""
        return self.price * self.quantity


# KISS: Simple use case
class CalculateOrderTotalUseCase:
    """Use case to calculate order total."""

    def execute(self, order: Order) -> Decimal:
        """Execute calculation."""
        return order.calculate_total()
```

## Naming

Good naming is key to KISS.

```python
# ❌ Bad naming (unclear)
def proc(d: dict) -> bool:
    if d.get('t') > 100:
        return True
    return False

# ✅ Good naming (clear)
def is_eligible_for_discount(order_data: dict) -> bool:
    """Check if order is eligible for discount."""
    order_total = order_data.get('total')
    DISCOUNT_THRESHOLD = 100
    return order_total > DISCOUNT_THRESHOLD
```

## Checklist

### KISS

- [ ] Function < 20 lines
- [ ] Single level of abstraction
- [ ] No deep nesting (< 3 levels)
- [ ] Early returns used
- [ ] Clear, explicit code
- [ ] Self-documenting names

### DRY

- [ ] No duplicate code
- [ ] Common logic extracted
- [ ] Configuration centralized
- [ ] Named constants used
- [ ] Reusable utilities created

### YAGNI

- [ ] Only current features implemented
- [ ] No speculative code
- [ ] No premature abstraction
- [ ] No unused code
- [ ] Simple, direct solution

### Red Flags

- ❌ "Might be useful in the future"
- ❌ "Just in case"
- ❌ "We might need it later"
- ❌ Copy-paste code
- ❌ Function > 20 lines
- ❌ Nesting > 3 levels
- ❌ Clever but obscure code
