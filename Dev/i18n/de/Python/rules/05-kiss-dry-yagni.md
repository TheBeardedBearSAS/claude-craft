# Regel 05: KISS, DRY, YAGNI

Drei fundamentale Prinzipien für das Schreiben einfachen, wartbaren Codes.

## KISS - Keep It Simple, Stupid

> Die einfachste Lösung ist oft die beste.

### Prinzip

- Einfachheit über Cleverness bevorzugen
- Code sollte auf den ersten Blick verständlich sein
- Wenn eine Lösung komplex ist, ist sie wahrscheinlich nicht die richtige

### Beispiel: Verletzung

```python
# ❌ Zu komplex: Clever, aber schwer zu verstehen
result = reduce(lambda x, y: x + y, map(lambda x: x ** 2, filter(lambda x: x % 2 == 0, numbers)))
```

### Beispiel: Konform

```python
# ✅ Einfach und klar
total = 0
for number in numbers:
    if number % 2 == 0:  # Wenn gerade
        total += number ** 2  # Quadrat hinzufügen
```

### Kurze Funktionen

Funktionen sollten kurz sein und eine Sache tun.

```python
# ❌ Funktion zu lang (>20 Zeilen)
def process_order(order_data):
    # 50 Zeilen Code, die mehrere Dinge tun
    pass

# ✅ Kurze Funktionen mit einzelner Verantwortlichkeit
def validate_order(order_data) -> None:
    """Validiert Bestelldaten."""
    if not order_data.get('items'):
        raise ValueError("Bestellung muss Artikel enthalten")

def calculate_total(items: list[OrderItem]) -> Decimal:
    """Berechnet Gesamtsumme."""
    return sum(item.price * item.quantity for item in items)

def apply_discounts(total: Decimal, discounts: list[Discount]) -> Decimal:
    """Wendet Rabatte an."""
    for discount in discounts:
        total -= discount.calculate(total)
    return total
```

### Einzelne Abstraktionsebene

Jede Funktion sollte auf einer einzelnen Abstraktionsebene bleiben.

```python
# ❌ Gemischte Abstraktionsebenen
def process_user_registration(data: dict):
    # Hohe Ebene
    user = User(**data)

    # Niedrige Ebene (Implementierungsdetails)
    smtp = smtplib.SMTP('localhost', 25)
    msg = MIMEText("Willkommen")
    msg['Subject'] = "Willkommen"
    msg['From'] = "noreply@app.com"
    msg['To'] = user.email
    smtp.send_message(msg)

    # Hohe Ebene wieder
    save_to_database(user)

# ✅ Einzelne Abstraktionsebene
def process_user_registration(data: dict):
    """Verarbeitet Benutzerregistrierung (hohe Ebene)."""
    user = create_user(data)
    send_welcome_email(user)  # Versteckt Details
    save_user(user)           # Versteckt Details
```

### Frühe Returns

Frühe Returns verwenden, um Verschachtelung zu reduzieren.

```python
# ❌ Tiefe Verschachtelung
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

# ✅ Frühe Returns
def process_payment(order: Order) -> bool:
    """Verarbeitet Zahlung mit frühen Returns."""
    if not order.is_valid():
        return False

    if not order.has_items():
        return False

    if not order.customer.has_payment_method():
        return False

    return charge_customer(order)
```

## DRY - Don't Repeat Yourself

> Jedes Wissenselement sollte eine einzige, eindeutige Darstellung im System haben.

### Prinzip

- Code nicht duplizieren
- Gemeinsame Logik in Funktionen/Klassen extrahieren
- Wiederverwenden statt Copy-Paste

### Beispiel: Verletzung

```python
# ❌ Code-Duplikation
class UserController:
    def create_user(self, data: dict):
        if not data.get('email'):
            return {"error": "E-Mail erforderlich"}, 400
        if not data.get('name'):
            return {"error": "Name erforderlich"}, 400
        # ...

    def update_user(self, user_id: str, data: dict):
        if not data.get('email'):
            return {"error": "E-Mail erforderlich"}, 400
        if not data.get('name'):
            return {"error": "Name erforderlich"}, 400
        # ...
```

### Beispiel: Konform

```python
# ✅ Validierung extrahiert
class UserValidator:
    """Validiert Benutzerdaten."""

    def validate(self, data: dict) -> None:
        """Validiert erforderliche Felder."""
        if not data.get('email'):
            raise ValueError("E-Mail erforderlich")
        if not data.get('name'):
            raise ValueError("Name erforderlich")


class UserController:
    def __init__(self, validator: UserValidator):
        self._validator = validator

    def create_user(self, data: dict):
        self._validator.validate(data)  # Wiederverwenden
        # ...

    def update_user(self, user_id: str, data: dict):
        self._validator.validate(data)  # Wiederverwenden
        # ...
```

### Konfigurationszentralisierung

```python
# ❌ Verstreute Konfiguration
class EmailService:
    def send(self):
        smtp_host = "smtp.gmail.com"  # Dupliziert
        smtp_port = 587              # Dupliziert

class NotificationService:
    def send(self):
        smtp_host = "smtp.gmail.com"  # Dupliziert
        smtp_port = 587              # Dupliziert

# ✅ Zentralisierte Konfiguration
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Zentralisierte Einstellungen."""
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587

    class Config:
        env_file = ".env"

settings = Settings()

class EmailService:
    def send(self):
        host = settings.smtp_host  # Einzelne Quelle
        port = settings.smtp_port  # Einzelne Quelle
```

### Konstanten

```python
# ❌ Verstreute Magic Numbers
def calculate_discount(amount: Decimal) -> Decimal:
    if amount > 100:
        return amount * 0.10  # Magic Number
    return Decimal("0")

def check_vip_status(total_purchases: Decimal) -> bool:
    return total_purchases > 100  # Magic Number dupliziert

# ✅ Benannte Konstanten
MINIMUM_AMOUNT_FOR_DISCOUNT = Decimal("100")
STANDARD_DISCOUNT_RATE = Decimal("0.10")
VIP_THRESHOLD = Decimal("100")

def calculate_discount(amount: Decimal) -> Decimal:
    """Berechnet Rabatt mit benannter Konstante."""
    if amount > MINIMUM_AMOUNT_FOR_DISCOUNT:
        return amount * STANDARD_DISCOUNT_RATE
    return Decimal("0")

def check_vip_status(total_purchases: Decimal) -> bool:
    """Prüft VIP-Status mit benannter Konstante."""
    return total_purchases > VIP_THRESHOLD
```

## YAGNI - You Aren't Gonna Need It

> Fügen Sie keine Funktionalität hinzu, bis Sie sie brauchen.

### Prinzip

- Nur das implementieren, was jetzt notwendig ist
- Zukünftige Bedürfnisse nicht antizipieren
- Nicht überentwickeln

### Beispiel: Verletzung

```python
# ❌ Überentwicklung: Funktionen hinzufügen, die nicht benötigt werden
class User:
    def __init__(self, email: str):
        self.email = email
        self.preferences = {}  # Noch nicht benötigt
        self.settings = {}     # Noch nicht benötigt
        self.metadata = {}     # Noch nicht benötigt
        self.cache = {}        # Noch nicht benötigt
        self.flags = {}        # Noch nicht benötigt

    def get_preference(self, key: str):  # Noch nicht benötigt
        pass

    def set_preference(self, key: str, value: any):  # Noch nicht benötigt
        pass

    def clear_cache(self):  # Noch nicht benötigt
        pass

    def export_to_json(self):  # Noch nicht benötigt
        pass

    def export_to_xml(self):  # Noch nicht benötigt
        pass

    def export_to_csv(self):  # Noch nicht benötigt
        pass
```

### Beispiel: Konform

```python
# ✅ Nur das, was jetzt benötigt wird
class User:
    """User-Entität - minimal und notwendig."""

    def __init__(self, email: str):
        self.email = email

    # Weitere Funktionen werden hinzugefügt, wenn sie benötigt werden
```

### Generische Lösungen

```python
# ❌ Generische Lösung für einen Fall
class GenericDataProcessor:
    """Verarbeitet jeden Datentyp (überentwickelt)."""

    def process(
        self,
        data: any,
        format: str,
        options: dict,
        filters: list,
        transformers: list,
        validators: list
    ):
        # Komplexes generisches System für einen einzigen Anwendungsfall
        pass

# ✅ Spezifische Lösung für aktuellen Bedarf
class UserDataValidator:
    """Validiert Benutzerdaten (nur aktueller Bedarf)."""

    def validate(self, data: dict) -> None:
        """Validiert erforderliche Benutzerfelder."""
        if not data.get('email'):
            raise ValueError("E-Mail erforderlich")
```

### Vorzeitige Abstraktion

```python
# ❌ Vorzeitige Abstraktion
class AbstractBaseRepositoryFactoryBuilder:
    """Über-Abstraktion für einen einzigen Fall."""
    pass

# ✅ Einfache Lösung
class UserRepository:
    """Repository für Benutzer - einfach und direkt."""

    def save(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        return user
```

## KISS, DRY, YAGNI kombinieren

```python
# ✅ Gutes Beispiel, das alle drei Prinzipien kombiniert
from decimal import Decimal

# YAGNI: Nur implementieren, was benötigt wird
class Order:
    """Order-Entität."""

    def __init__(self, items: list['OrderItem']):
        self.items = items

    # KISS: Einfache, klare Methode
    def calculate_total(self) -> Decimal:
        """Berechnet Bestellsumme."""
        return sum(item.subtotal() for item in items)


class OrderItem:
    """Bestellposition."""

    def __init__(self, price: Decimal, quantity: int):
        self.price = price
        self.quantity = quantity

    # DRY: Wiederverwendbare Berechnung
    def subtotal(self) -> Decimal:
        """Berechnet Positionssumme."""
        return self.price * self.quantity


# KISS: Einfacher Use Case
class CalculateOrderTotalUseCase:
    """Use Case zur Berechnung der Bestellsumme."""

    def execute(self, order: Order) -> Decimal:
        """Führt Berechnung aus."""
        return order.calculate_total()
```

## Benennung

Gute Benennung ist der Schlüssel zu KISS.

```python
# ❌ Schlechte Benennung (unklar)
def proc(d: dict) -> bool:
    if d.get('t') > 100:
        return True
    return False

# ✅ Gute Benennung (klar)
def is_eligible_for_discount(order_data: dict) -> bool:
    """Prüft, ob Bestellung für Rabatt berechtigt ist."""
    order_total = order_data.get('total')
    DISCOUNT_THRESHOLD = 100
    return order_total > DISCOUNT_THRESHOLD
```

## Checkliste

### KISS

- [ ] Funktion < 20 Zeilen
- [ ] Einzelne Abstraktionsebene
- [ ] Keine tiefe Verschachtelung (< 3 Ebenen)
- [ ] Frühe Returns verwendet
- [ ] Klarer, expliziter Code
- [ ] Selbstdokumentierende Namen

### DRY

- [ ] Kein duplizierter Code
- [ ] Gemeinsame Logik extrahiert
- [ ] Konfiguration zentralisiert
- [ ] Benannte Konstanten verwendet
- [ ] Wiederverwendbare Utilities erstellt

### YAGNI

- [ ] Nur aktuelle Funktionen implementiert
- [ ] Kein spekulativer Code
- [ ] Keine vorzeitige Abstraktion
- [ ] Kein ungenutzter Code
- [ ] Einfache, direkte Lösung

### Warnsignale

- ❌ "Könnte in Zukunft nützlich sein"
- ❌ "Nur für den Fall"
- ❌ "Wir könnten es später brauchen"
- ❌ Copy-Paste-Code
- ❌ Funktion > 20 Zeilen
- ❌ Verschachtelung > 3 Ebenen
- ❌ Cleverer, aber obskurer Code
