# Principes KISS, DRY et YAGNI

## KISS - Keep It Simple, Stupid

> La simplicité est la sophistication suprême. - Leonardo da Vinci

### Principe

Préférer les solutions simples aux solutions complexes. Un code simple est:
- Plus facile à comprendre
- Plus facile à maintenir
- Moins sujet aux bugs
- Plus facile à tester

### ❌ Violation de KISS

```python
# Sur-ingénierie: Factory de factory avec métaclasses
class RepositoryMetaclass(type):
    """Métaclasse pour créer des repositories dynamiquement."""

    _registry = {}

    def __new__(mcs, name, bases, namespace):
        cls = super().__new__(mcs, name, bases, namespace)
        if name != 'BaseRepository':
            mcs._registry[name.lower().replace('repository', '')] = cls
        return cls


class BaseRepository(metaclass=RepositoryMetaclass):
    """Base repository avec métaclasse."""
    pass


class AbstractRepositoryFactory(ABC):
    """Factory abstraite pour repositories."""

    @abstractmethod
    def create_repository(self, entity_type: str) -> BaseRepository:
        pass


class ConcreteRepositoryFactory(AbstractRepositoryFactory):
    """Implémentation concrète de la factory."""

    def __init__(self, session_factory: Callable):
        self._session_factory = session_factory

    def create_repository(self, entity_type: str) -> BaseRepository:
        registry = RepositoryMetaclass._registry
        repo_class = registry.get(entity_type)
        if repo_class:
            session = self._session_factory()
            return repo_class(session)
        raise ValueError(f"Unknown entity type: {entity_type}")


class RepositoryFactoryProvider:
    """Provider pour les factories de repositories."""

    _instance = None
    _factory = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def set_factory(cls, factory: AbstractRepositoryFactory):
        cls._factory = factory

    @classmethod
    def get_factory(cls) -> AbstractRepositoryFactory:
        if cls._factory is None:
            raise ValueError("Factory not initialized")
        return cls._factory


# Utilisation complexe
provider = RepositoryFactoryProvider()
factory = ConcreteRepositoryFactory(get_session)
provider.set_factory(factory)
repo_factory = provider.get_factory()
user_repo = repo_factory.create_repository('user')
```

### ✅ Respect de KISS

```python
# Solution simple et directe
from typing import Protocol


class UserRepository(Protocol):
    """Interface simple pour UserRepository."""

    def find_by_id(self, user_id: int) -> Optional[User]:
        ...

    def save(self, user: User) -> User:
        ...


class UserRepositoryImpl:
    """Implémentation simple."""

    def __init__(self, session: Session):
        self._session = session

    def find_by_id(self, user_id: int) -> Optional[User]:
        return self._session.query(User).filter_by(id=user_id).first()

    def save(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        return user


# Utilisation simple
session = get_session()
user_repo = UserRepositoryImpl(session)
user = user_repo.find_by_id(123)
```

### Exemples KISS

```python
# ❌ Complexe: Chaînage excessif
result = (
    data_source
    .transform(lambda x: x.upper())
    .filter(lambda x: len(x) > 5)
    .map(lambda x: x.split('_'))
    .flatten()
    .distinct()
    .sort()
    .take(10)
)

# ✅ Simple: Étapes claires
uppercase_items = [item.upper() for item in data_source]
long_items = [item for item in uppercase_items if len(item) > 5]
split_items = [part for item in long_items for part in item.split('_')]
unique_items = list(set(split_items))
sorted_items = sorted(unique_items)
result = sorted_items[:10]


# ❌ Complexe: One-liner illisible
users = {u.id: u for u in [User(**d) for d in [json.loads(r) for r in [requests.get(url).text for url in urls]]] if u.is_active}

# ✅ Simple: Décomposé
users = {}
for url in urls:
    response = requests.get(url)
    data = json.loads(response.text)
    user = User(**data)
    if user.is_active:
        users[user.id] = user


# ❌ Complexe: Abstraction prématurée
class ConfigurableValidatorFactory:
    """Factory configurable pour créer des validators."""

    def __init__(self, config: dict):
        self._config = config
        self._validators = {}

    def register_validator(self, name: str, validator_class: type):
        self._validators[name] = validator_class

    def create_validator(self, name: str, **kwargs):
        validator_class = self._validators.get(name)
        config = self._config.get(name, {})
        return validator_class(**config, **kwargs)

# ✅ Simple: Direct
def validate_email(email: str) -> bool:
    """Valide un email."""
    return "@" in email and "." in email.split("@")[1]

def validate_phone(phone: str) -> bool:
    """Valide un téléphone."""
    return phone.isdigit() and len(phone) == 10
```

### Règles KISS

1. **Préférer la clarté à la concision**
   ```python
   # ❌ Concis mais obscur
   r = lambda x: x if x > 0 else -x

   # ✅ Clair
   def absolute_value(number: int) -> int:
       """Retourne la valeur absolue."""
       if number > 0:
           return number
       return -number
   ```

2. **Éviter l'over-engineering**
   ```python
   # ❌ Over-engineered pour un simple cache
   class CacheStrategyFactory:
       pass

   class AbstractCacheStrategy:
       pass

   class LRUCacheStrategy:
       pass

   # ✅ Simple
   from functools import lru_cache

   @lru_cache(maxsize=128)
   def expensive_function(x: int) -> int:
       return x * 2
   ```

3. **Une fonction = une chose**
   ```python
   # ❌ Fait trop de choses
   def process_user_and_send_email_and_log(user_data: dict):
       user = User(**user_data)
       validate_user(user)
       save_user(user)
       email_content = create_email(user)
       send_email(email_content)
       log_user_creation(user)
       update_stats()

   # ✅ Focalisé
   def create_user(user_data: dict) -> User:
       """Crée un utilisateur."""
       user = User(**user_data)
       validate_user(user)
       save_user(user)
       return user
   ```

## DRY - Don't Repeat Yourself

> Chaque connaissance doit avoir une représentation unique, non ambiguë et faisant autorité dans un système.

### Principe

Éviter la duplication de code, de logique et de connaissances.

### ❌ Violation de DRY

```python
# Duplication de logique de validation
def create_user(email: str, name: str) -> User:
    """Crée un utilisateur."""
    # Validation dupliquée
    if not email or "@" not in email:
        raise ValueError("Invalid email")
    if not name or len(name) < 2:
        raise ValueError("Invalid name")

    user = User(email=email, name=name)
    save_user(user)
    return user


def update_user(user_id: int, email: str, name: str) -> User:
    """Met à jour un utilisateur."""
    # MÊME validation dupliquée
    if not email or "@" not in email:
        raise ValueError("Invalid email")
    if not name or len(name) < 2:
        raise ValueError("Invalid name")

    user = get_user(user_id)
    user.email = email
    user.name = name
    save_user(user)
    return user


# Duplication de code de formatting
def format_user_for_display(user: User) -> str:
    """Formate un utilisateur pour affichage."""
    return f"{user.name} ({user.email})"


def format_admin_for_display(admin: Admin) -> str:
    """Formate un admin pour affichage."""
    return f"{admin.name} ({admin.email})"  # MÊME logique


# Duplication de queries
def get_active_users() -> list[User]:
    """Récupère les utilisateurs actifs."""
    return session.query(User).filter(User.is_active == True).all()


def count_active_users() -> int:
    """Compte les utilisateurs actifs."""
    return session.query(User).filter(User.is_active == True).count()  # Duplication du filtre
```

### ✅ Respect de DRY

```python
# Validation centralisée
from dataclasses import dataclass


@dataclass
class UserData:
    """Value object avec validation."""

    email: str
    name: str

    def __post_init__(self):
        """Validation unique et centralisée."""
        if not self.email or "@" not in self.email:
            raise ValueError("Invalid email")
        if not self.name or len(name) < 2:
            raise ValueError("Invalid name")


def create_user(user_data: UserData) -> User:
    """Crée un utilisateur - validation déléguée à UserData."""
    user = User(email=user_data.email, name=user_data.name)
    save_user(user)
    return user


def update_user(user_id: int, user_data: UserData) -> User:
    """Met à jour un utilisateur - validation déléguée à UserData."""
    user = get_user(user_id)
    user.email = user_data.email
    user.name = user_data.name
    save_user(user)
    return user


# Formatting centralisé via Protocol
from typing import Protocol


class Displayable(Protocol):
    """Interface pour objets affichables."""

    name: str
    email: str


def format_for_display(entity: Displayable) -> str:
    """Formate n'importe quelle entité avec name et email."""
    return f"{entity.name} ({entity.email})"


# Utilisation
format_for_display(user)   # ✅
format_for_display(admin)  # ✅


# Query centralisée
class UserRepository:
    """Repository avec logique de query centralisée."""

    def _active_users_query(self):
        """Query de base pour utilisateurs actifs - DRY."""
        return self._session.query(User).filter(User.is_active == True)

    def get_active_users(self) -> list[User]:
        """Récupère les utilisateurs actifs."""
        return self._active_users_query().all()

    def count_active_users(self) -> int:
        """Compte les utilisateurs actifs."""
        return self._active_users_query().count()

    def get_active_users_page(self, page: int, size: int) -> list[User]:
        """Récupère une page d'utilisateurs actifs."""
        offset = page * size
        return self._active_users_query().offset(offset).limit(size).all()
```

### Attention: DRY vs Couplage

```python
# ❌ MAUVAIS: DRY excessif crée du couplage
def process_payment(amount: float, user_id: int):
    """Traite un paiement ET envoie un email ET log."""
    # Logique paiement
    payment = charge_card(amount)

    # Logique email (couplé!)
    send_email(user_id, f"Payment of ${amount} processed")

    # Logique logging (couplé!)
    log_payment(user_id, amount)

    return payment


# ✅ BON: Séparer les responsabilités même si code similaire
def process_payment(amount: float) -> Payment:
    """Traite seulement le paiement."""
    return charge_card(amount)


def send_payment_confirmation(user_id: int, amount: float):
    """Envoie la confirmation - responsabilité séparée."""
    send_email(user_id, f"Payment of ${amount} processed")


def log_payment_event(user_id: int, amount: float):
    """Log le paiement - responsabilité séparée."""
    log_payment(user_id, amount)


# Coordination dans un use case
class ProcessPaymentUseCase:
    def execute(self, user_id: int, amount: float) -> Payment:
        payment = process_payment(amount)
        send_payment_confirmation(user_id, amount)
        log_payment_event(user_id, amount)
        return payment
```

### Techniques DRY

```python
# 1. Extraction de fonction
# ❌ Duplication
def format_date_us(date):
    return f"{date.month}/{date.day}/{date.year}"

def format_datetime_us(datetime):
    return f"{datetime.month}/{datetime.day}/{datetime.year} {datetime.hour}:{datetime.minute}"

# ✅ DRY
def format_date_us(date) -> str:
    return f"{date.month}/{date.day}/{date.year}"

def format_datetime_us(datetime) -> str:
    date_part = format_date_us(datetime)  # Réutilisation
    return f"{date_part} {datetime.hour}:{datetime.minute}"


# 2. Parameterization
# ❌ Duplication
def get_users_above_18():
    return [u for u in users if u.age > 18]

def get_users_above_21():
    return [u for u in users if u.age > 21]

def get_users_above_65():
    return [u for u in users if u.age > 65]

# ✅ DRY
def get_users_above_age(min_age: int) -> list[User]:
    return [u for u in users if u.age > min_age]


# 3. Décorateurs
# ❌ Duplication de logging
def create_user(data):
    logger.info("Creating user")
    user = User(**data)
    logger.info("User created")
    return user

def delete_user(id):
    logger.info("Deleting user")
    delete_from_db(id)
    logger.info("User deleted")

# ✅ DRY avec décorateur
def log_operation(func):
    """Décorateur pour logger les opérations."""
    def wrapper(*args, **kwargs):
        logger.info(f"Starting {func.__name__}")
        result = func(*args, **kwargs)
        logger.info(f"Finished {func.__name__}")
        return result
    return wrapper

@log_operation
def create_user(data):
    return User(**data)

@log_operation
def delete_user(id):
    delete_from_db(id)


# 4. Héritage / Composition
# ❌ Duplication de comportement
class EmailNotification:
    def send(self, recipient, message):
        validate_message(message)
        log_send(recipient)
        # Send email
        mark_as_sent()

class SMSNotification:
    def send(self, recipient, message):
        validate_message(message)  # Dupliqué
        log_send(recipient)         # Dupliqué
        # Send SMS
        mark_as_sent()              # Dupliqué

# ✅ DRY avec classe de base
class BaseNotification:
    """Comportement commun."""

    def send(self, recipient: str, message: str):
        """Template method."""
        self._validate_message(message)
        self._log_send(recipient)
        self._do_send(recipient, message)  # Hook
        self._mark_as_sent()

    def _validate_message(self, message: str):
        """Validation commune."""
        if not message:
            raise ValueError("Empty message")

    def _log_send(self, recipient: str):
        """Logging commun."""
        logger.info(f"Sending to {recipient}")

    def _mark_as_sent(self):
        """Marking commun."""
        self.sent = True

    def _do_send(self, recipient: str, message: str):
        """Hook pour implémentation spécifique."""
        raise NotImplementedError


class EmailNotification(BaseNotification):
    """Implémentation email - seulement la partie spécifique."""

    def _do_send(self, recipient: str, message: str):
        # Send email
        pass


class SMSNotification(BaseNotification):
    """Implémentation SMS - seulement la partie spécifique."""

    def _do_send(self, recipient: str, message: str):
        # Send SMS
        pass
```

## YAGNI - You Aren't Gonna Need It

> N'implémentez pas quelque chose tant que ce n'est pas nécessaire.

### Principe

Ne pas ajouter de fonctionnalités, d'abstractions ou de complexité avant d'en avoir réellement besoin.

### ❌ Violation de YAGNI

```python
class User:
    """
    PROBLÈME: Plein de fonctionnalités "au cas où" qui ne sont jamais utilisées.
    """

    def __init__(self, email: str, name: str):
        self.email = email
        self.name = name
        self.created_at = datetime.now()

        # "Au cas où on aurait besoin de soft delete"
        self.deleted_at = None
        self.deleted_by = None

        # "Au cas où on aurait besoin de tracking"
        self.last_login = None
        self.login_count = 0
        self.failed_login_count = 0

        # "Au cas où on aurait besoin de préférences"
        self.preferences = {}
        self.settings = {}
        self.metadata = {}

        # "Au cas où on aurait besoin de tags"
        self.tags = []
        self.categories = []

        # "Au cas où on aurait besoin de permissions"
        self.permissions = []
        self.roles = []
        self.groups = []

    def soft_delete(self, deleted_by: int):
        """Fonction jamais utilisée."""
        self.deleted_at = datetime.now()
        self.deleted_by = deleted_by

    def add_tag(self, tag: str):
        """Fonction jamais utilisée."""
        self.tags.append(tag)

    def set_preference(self, key: str, value: any):
        """Fonction jamais utilisée."""
        self.preferences[key] = value

    # 50 autres méthodes "au cas où"...


# Infrastructure complexe "au cas où"
class CacheManager:
    """
    PROBLÈME: Support de 5 backends de cache alors qu'on utilise seulement Redis.
    """

    def __init__(self):
        self._backends = {
            'redis': RedisBackend(),
            'memcached': MemcachedBackend(),  # Jamais utilisé
            'file': FileBackend(),            # Jamais utilisé
            'database': DatabaseBackend(),    # Jamais utilisé
            'memory': MemoryBackend()         # Jamais utilisé
        }

    def get(self, key: str, backend: str = 'redis'):
        return self._backends[backend].get(key)

    # Méthodes complexes pour gérer les différents backends...
```

### ✅ Respect de YAGNI

```python
class User:
    """
    Version simple: Seulement ce qui est ACTUELLEMENT nécessaire.
    """

    def __init__(self, email: str, name: str):
        self.email = email
        self.name = name
        self.created_at = datetime.now()

    # C'est tout! On ajoutera le reste QUAND on en aura besoin.


# Cache simple: Seulement ce qu'on utilise
class CacheManager:
    """Cache Redis simple."""

    def __init__(self, redis_client: Redis):
        self._redis = redis_client

    def get(self, key: str) -> Optional[str]:
        """Récupère une valeur du cache."""
        return self._redis.get(key)

    def set(self, key: str, value: str, ttl: int = 3600) -> None:
        """Met une valeur en cache."""
        self._redis.setex(key, ttl, value)

    # Si on a besoin de Memcached plus tard, on refactorera.
    # Pour l'instant: YAGNI!
```

### Exemples YAGNI

```python
# ❌ Configuration complexe "au cas où"
class AppConfig:
    """Configuration avec 100 options dont 95 inutilisées."""

    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL')
        self.redis_url = os.getenv('REDIS_URL')

        # "Au cas où" on aurait plusieurs bases
        self.read_database_url = os.getenv('READ_DATABASE_URL')  # Jamais utilisé
        self.write_database_url = os.getenv('WRITE_DATABASE_URL')  # Jamais utilisé

        # "Au cas où" on aurait plusieurs Redis
        self.cache_redis_url = os.getenv('CACHE_REDIS_URL')  # Jamais utilisé
        self.session_redis_url = os.getenv('SESSION_REDIS_URL')  # Jamais utilisé

        # "Au cas où" on aurait besoin de features flags
        self.feature_flags = {}  # Jamais utilisé

        # 90 autres options "au cas où"...


# ✅ Configuration simple
class AppConfig:
    """Configuration: seulement ce qui est utilisé."""

    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL')
        self.redis_url = os.getenv('REDIS_URL')

    # On ajoutera le reste quand nécessaire.


# ❌ Abstraction prématurée "au cas où"
class AbstractDataProcessor(ABC):
    """Interface générique pour traiter "n'importe quelle" donnée."""

    @abstractmethod
    def validate(self, data: Any) -> bool:
        pass

    @abstractmethod
    def transform(self, data: Any) -> Any:
        pass

    @abstractmethod
    def load(self, data: Any) -> None:
        pass

    @abstractmethod
    def rollback(self, data: Any) -> None:  # Jamais utilisé
        pass

    @abstractmethod
    def audit(self, data: Any) -> None:  # Jamais utilisé
        pass


# ✅ Implémentation concrète simple
def process_user_data(user_data: dict) -> User:
    """
    Traite des données utilisateur.

    Pas besoin d'abstraction tant qu'on n'a pas plusieurs implémentations.
    """
    # Validation
    if not user_data.get('email'):
        raise ValueError("Email required")

    # Transformation
    user = User(**user_data)

    # Sauvegarde
    save_user(user)

    return user

# On créera une abstraction QUAND on aura un second type de données à traiter.
```

### Quand YAGNI ne s'applique PAS

```python
# ✅ Sécurité: Pas de YAGNI
# Toujours valider les inputs, même si "pas besoin maintenant"
def create_user(email: str, password: str) -> User:
    # ✅ Validation stricte dès le début
    if not is_valid_email(email):
        raise ValueError("Invalid email")

    if len(password) < 12:  # ✅ Sécurité avant tout
        raise ValueError("Password too short")

    # Hash du password (pas de "on le fera plus tard")
    hashed = hash_password(password)

    return User(email=email, password=hashed)


# ✅ Tests: Pas de YAGNI
# Toujours écrire des tests, même pour du code "simple"
def test_create_user():
    """Tests dès le début."""
    user = create_user("test@example.com", "secure_password_123")
    assert user.email == "test@example.com"


# ✅ Logging: Pas de YAGNI
# Toujours logger les opérations importantes
def process_payment(amount: float) -> Payment:
    logger.info(f"Processing payment of ${amount}")  # ✅ Dès le début
    payment = charge_card(amount)
    logger.info(f"Payment {payment.id} processed")
    return payment


# ✅ Documentation: Pas de YAGNI
def calculate_compound_interest(
    principal: float,
    rate: float,
    time: int,
    n: int = 12
) -> float:
    """
    Calcule les intérêts composés.

    Toujours documenter, même code "simple".

    Args:
        principal: Montant initial
        rate: Taux d'intérêt annuel (0.05 = 5%)
        time: Durée en années
        n: Nombre de compositions par an (défaut: mensuel)

    Returns:
        Montant final avec intérêts
    """
    return principal * (1 + rate/n) ** (n * time)
```

## Équilibre entre les Principes

```python
"""
Exemple montrant l'équilibre entre KISS, DRY et YAGNI.
"""

# Scénario: Système de notifications

# ❌ YAGNI violé: Support de 10 canaux alors qu'on utilise seulement email
class NotificationService:
    def send_email(self, recipient, message): pass
    def send_sms(self, recipient, message): pass  # Pas encore utilisé
    def send_push(self, recipient, message): pass  # Pas encore utilisé
    def send_slack(self, recipient, message): pass  # Pas encore utilisé
    # ... 6 autres canaux jamais utilisés


# ❌ DRY violé: Duplication partout
def send_order_confirmation_email(user):
    smtp = SMTP('smtp.gmail.com')
    smtp.login('user', 'pass')
    smtp.send(user.email, "Order confirmed", "Your order is confirmed")
    smtp.quit()

def send_welcome_email(user):
    smtp = SMTP('smtp.gmail.com')  # Dupliqué
    smtp.login('user', 'pass')      # Dupliqué
    smtp.send(user.email, "Welcome", "Welcome to our service")
    smtp.quit()                     # Dupliqué


# ❌ KISS violé: Trop complexe
class AbstractNotificationChannelFactoryProvider:
    # 500 lignes de code pour envoyer un email...
    pass


# ✅ ÉQUILIBRE: Simple, DRY, et YAGNI
class EmailService:
    """
    KISS: Simple et direct
    DRY: Code de connexion SMTP centralisé
    YAGNI: Seulement email pour l'instant (c'est tout ce qu'on utilise)
    """

    def __init__(self, smtp_host: str, username: str, password: str):
        self._smtp_host = smtp_host
        self._username = username
        self._password = password

    def send(self, recipient: str, subject: str, body: str) -> None:
        """Envoie un email."""
        with SMTP(self._smtp_host) as smtp:
            smtp.login(self._username, self._password)
            smtp.send(recipient, subject, body)


# Utilisation
email_service = EmailService('smtp.gmail.com', 'user', 'pass')

email_service.send(
    user.email,
    "Order confirmed",
    "Your order is confirmed"
)

email_service.send(
    user.email,
    "Welcome",
    "Welcome to our service"
)

# Quand on aura VRAIMENT besoin de SMS, on ajoutera SMSService.
# Pour l'instant: YAGNI!
```

## Checklist

### KISS
- [ ] Solution la plus simple qui fonctionne
- [ ] Pas d'over-engineering
- [ ] Pas de métaclasses sauf si vraiment nécessaire
- [ ] Code compréhensible en 5 minutes

### DRY
- [ ] Pas de duplication de logique
- [ ] Validation centralisée
- [ ] Queries réutilisées
- [ ] Utilisation de décorateurs pour comportements communs

### YAGNI
- [ ] Fonctionnalités implémentées seulement si nécessaire
- [ ] Pas de code "au cas où"
- [ ] Abstractions créées quand on a 2+ implémentations
- [ ] Pas de configuration inutilisée

### Exceptions (toujours faire)
- [ ] Sécurité (validation, sanitization)
- [ ] Tests
- [ ] Logging
- [ ] Documentation
- [ ] Error handling
