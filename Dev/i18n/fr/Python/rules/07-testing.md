# Stratégie de Tests Python

## Pyramide de Tests

```
            /\
           /E2E\         (Peu, lents, fragiles)
          /------\
         /  Intég  \      (Moyennement, moyens)
        /------------\
       /   Unitaires  \   (Beaucoup, rapides, stables)
      /----------------\
```

- **Tests Unitaires (70%)**: Rapides, isolés, nombreux
- **Tests d'Intégration (20%)**: Composants réels, moyennement rapides
- **Tests E2E (10%)**: Flux complets, lents, fragiles

## pytest - Configuration

### pyproject.toml

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = """
    -v
    --strict-markers
    --strict-config
    --cov=src
    --cov-report=term-missing
    --cov-report=html
"""
markers = [
    "unit: Unit tests",
    "integration: Integration tests",
    "e2e: End-to-end tests",
    "slow: Slow tests",
]

[tool.coverage.run]
source = ["src"]
omit = [
    "*/tests/*",
    "*/migrations/*",
    "*/__pycache__/*",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
    "if __name__ == .__main__.:",
    "if TYPE_CHECKING:",
]
precision = 2
```

### Structure des Tests

```
tests/
├── conftest.py              # Fixtures globales
├── unit/                    # Tests unitaires
│   ├── conftest.py          # Fixtures pour tests unitaires
│   ├── domain/
│   │   ├── entities/
│   │   │   └── test_user.py
│   │   ├── value_objects/
│   │   │   └── test_email.py
│   │   └── services/
│   │       └── test_pricing_service.py
│   ├── application/
│   │   └── use_cases/
│   │       └── test_create_user.py
│   └── infrastructure/
│       └── email/
│           └── test_email_service.py
├── integration/             # Tests d'intégration
│   ├── conftest.py
│   ├── database/
│   │   └── test_user_repository.py
│   ├── api/
│   │   └── test_users_routes.py
│   └── external/
│       └── test_stripe_payment.py
└── e2e/                     # Tests end-to-end
    ├── conftest.py
    └── test_order_flow.py
```

## Tests Unitaires

### Principes

- **Isolation complète**: Aucune dépendance externe (DB, API, fichiers)
- **Rapides**: < 100ms par test
- **Déterministes**: Même résultat à chaque exécution
- **Indépendants**: Peuvent s'exécuter dans n'importe quel ordre

### Exemple: Test d'Entité

```python
# tests/unit/domain/entities/test_user.py
import pytest
from datetime import datetime
from uuid import uuid4

from myproject.domain.entities.user import User
from myproject.domain.value_objects.email import Email


class TestUser:
    """Tests unitaires pour l'entité User."""

    def test_create_user_with_valid_data(self):
        """Test création d'un utilisateur valide."""
        # Arrange
        email = Email("test@example.com")
        name = "John Doe"

        # Act
        user = User(
            id=uuid4(),
            email=email,
            name=name
        )

        # Assert
        assert user.email == email
        assert user.name == name
        assert user.is_active is True
        assert isinstance(user.created_at, datetime)

    def test_create_user_with_empty_name_raises_error(self):
        """Test création avec nom vide lève une erreur."""
        # Arrange
        email = Email("test@example.com")

        # Act & Assert
        with pytest.raises(ValueError, match="Name must be at least 2 characters"):
            User(
                id=uuid4(),
                email=email,
                name=""
            )

    def test_activate_user_changes_status(self):
        """Test activation change le statut."""
        # Arrange
        user = User(
            id=uuid4(),
            email=Email("test@example.com"),
            name="John Doe",
            is_active=False
        )

        # Act
        user.activate()

        # Assert
        assert user.is_active is True
        assert user.updated_at is not None

    def test_activate_already_active_user_raises_error(self):
        """Test activation d'un utilisateur déjà actif lève une erreur."""
        # Arrange
        user = User(
            id=uuid4(),
            email=Email("test@example.com"),
            name="John Doe",
            is_active=True
        )

        # Act & Assert
        with pytest.raises(ValueError, match="User is already active"):
            user.activate()

    def test_user_equality_based_on_id(self):
        """Test égalité basée sur l'ID."""
        # Arrange
        user_id = uuid4()
        user1 = User(id=user_id, email=Email("test@example.com"), name="John")
        user2 = User(id=user_id, email=Email("other@example.com"), name="Jane")
        user3 = User(id=uuid4(), email=Email("test@example.com"), name="John")

        # Assert
        assert user1 == user2  # Même ID
        assert user1 != user3  # ID différent
```

### Exemple: Test de Value Object

```python
# tests/unit/domain/value_objects/test_email.py
import pytest

from myproject.domain.value_objects.email import Email


class TestEmail:
    """Tests unitaires pour Email value object."""

    @pytest.mark.parametrize("email_str", [
        "test@example.com",
        "user+tag@example.co.uk",
        "name.surname@subdomain.example.com",
    ])
    def test_create_email_with_valid_address(self, email_str):
        """Test création avec adresses valides."""
        email = Email(email_str)
        assert email.value == email_str.lower()

    @pytest.mark.parametrize("invalid_email", [
        "invalid",
        "@example.com",
        "test@",
        "test @example.com",
        "",
    ])
    def test_create_email_with_invalid_address_raises_error(self, invalid_email):
        """Test création avec adresses invalides."""
        with pytest.raises(ValueError, match="Invalid email"):
            Email(invalid_email)

    def test_email_normalization(self):
        """Test normalisation de l'email."""
        email = Email("Test@EXAMPLE.com")
        assert email.value == "test@example.com"

    def test_email_domain_property(self):
        """Test extraction du domaine."""
        email = Email("test@example.com")
        assert email.domain == "example.com"

    def test_email_equality(self):
        """Test égalité de deux emails."""
        email1 = Email("test@example.com")
        email2 = Email("test@example.com")
        email3 = Email("other@example.com")

        assert email1 == email2
        assert email1 != email3

    def test_email_is_immutable(self):
        """Test immutabilité de l'email."""
        email = Email("test@example.com")

        with pytest.raises(AttributeError):
            email.value = "other@example.com"
```

### Exemple: Test de Service avec Mocks

```python
# tests/unit/domain/services/test_pricing_service.py
import pytest
from decimal import Decimal
from unittest.mock import Mock

from myproject.domain.services.pricing_service import PricingService
from myproject.domain.entities.order import Order, OrderItem
from myproject.domain.value_objects.money import Money


class TestPricingService:
    """Tests unitaires pour PricingService."""

    @pytest.fixture
    def mock_discount_rule(self):
        """Fixture pour mock discount rule."""
        rule = Mock()
        rule.applies_to.return_value = False
        rule.calculate_discount.return_value = Money(Decimal("0"), "EUR")
        return rule

    @pytest.fixture
    def pricing_service(self, mock_discount_rule):
        """Fixture pour PricingService."""
        return PricingService(discount_rules=[mock_discount_rule])

    def test_calculate_total_without_discount(self, pricing_service):
        """Test calcul total sans discount."""
        # Arrange
        order = Order(
            items=[
                OrderItem(name="Item 1", unit_price=Money(Decimal("10"), "EUR"), quantity=2),
                OrderItem(name="Item 2", unit_price=Money(Decimal("15"), "EUR"), quantity=1),
            ],
            tax_rate=Decimal("0.20")
        )

        # Act
        total = pricing_service.calculate_total(order)

        # Assert
        # Subtotal: (10 * 2) + (15 * 1) = 35
        # Tax: 35 * 0.20 = 7
        # Total: 35 + 7 = 42
        assert total == Money(Decimal("42"), "EUR")

    def test_calculate_total_with_discount(self, pricing_service, mock_discount_rule):
        """Test calcul total avec discount."""
        # Arrange
        order = Order(
            items=[OrderItem(name="Item", unit_price=Money(Decimal("100"), "EUR"), quantity=1)],
            tax_rate=Decimal("0.20")
        )

        # Configure mock pour appliquer discount
        mock_discount_rule.applies_to.return_value = True
        mock_discount_rule.calculate_discount.return_value = Money(Decimal("10"), "EUR")

        # Act
        total = pricing_service.calculate_total(order)

        # Assert
        # Subtotal: 100
        # Discount: 10
        # After discount: 90
        # Tax: 90 * 0.20 = 18
        # Total: 90 + 18 = 108
        assert total == Money(Decimal("108"), "EUR")
        mock_discount_rule.applies_to.assert_called_once_with(order)
        mock_discount_rule.calculate_discount.assert_called_once_with(order)
```

### Exemple: Test de Use Case

```python
# tests/unit/application/use_cases/test_create_user.py
import pytest
from unittest.mock import Mock
from uuid import uuid4

from myproject.application.use_cases.user.create_user import (
    CreateUserUseCase,
    CreateUserCommand
)
from myproject.application.exceptions import UserAlreadyExistsError
from myproject.domain.entities.user import User
from myproject.domain.value_objects.email import Email


class TestCreateUserUseCase:
    """Tests unitaires pour CreateUserUseCase."""

    @pytest.fixture
    def mock_user_repository(self):
        """Mock UserRepository."""
        repo = Mock()
        repo.exists_with_email.return_value = False
        repo.save.side_effect = lambda user: user
        return repo

    @pytest.fixture
    def mock_email_service(self):
        """Mock EmailService."""
        return Mock()

    @pytest.fixture
    def use_case(self, mock_user_repository, mock_email_service):
        """Fixture CreateUserUseCase."""
        return CreateUserUseCase(
            user_repository=mock_user_repository,
            email_service=mock_email_service
        )

    def test_execute_creates_and_saves_user(self, use_case, mock_user_repository):
        """Test création et sauvegarde de l'utilisateur."""
        # Arrange
        command = CreateUserCommand(
            email="test@example.com",
            name="John Doe"
        )

        # Act
        result = use_case.execute(command)

        # Assert
        assert result.email == "test@example.com"
        assert result.name == "John Doe"
        mock_user_repository.save.assert_called_once()

    def test_execute_sends_welcome_email(self, use_case, mock_email_service):
        """Test envoi de l'email de bienvenue."""
        # Arrange
        command = CreateUserCommand(
            email="test@example.com",
            name="John Doe",
            send_welcome_email=True
        )

        # Act
        use_case.execute(command)

        # Assert
        mock_email_service.send_welcome_email.assert_called_once_with(
            "test@example.com",
            "John Doe"
        )

    def test_execute_with_existing_email_raises_error(
        self,
        use_case,
        mock_user_repository
    ):
        """Test création avec email existant lève une erreur."""
        # Arrange
        mock_user_repository.exists_with_email.return_value = True
        command = CreateUserCommand(
            email="existing@example.com",
            name="John Doe"
        )

        # Act & Assert
        with pytest.raises(UserAlreadyExistsError):
            use_case.execute(command)

        mock_user_repository.save.assert_not_called()

    def test_execute_with_invalid_email_raises_error(self, use_case):
        """Test création avec email invalide."""
        # Arrange
        command = CreateUserCommand(
            email="invalid-email",
            name="John Doe"
        )

        # Act & Assert
        with pytest.raises(ValueError, match="Invalid email"):
            use_case.execute(command)
```

## Tests d'Intégration

### Principes

- **Composants réels**: DB réelle, Redis réel, etc.
- **Isolation par test**: Chaque test a sa propre DB/état
- **Plus lents**: Acceptable car moins nombreux

### Fixtures de Base

```python
# tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from testcontainers.postgres import PostgresContainer

from myproject.infrastructure.database.base import Base


@pytest.fixture(scope="session")
def postgres_container():
    """Container PostgreSQL pour les tests."""
    with PostgresContainer("postgres:16") as postgres:
        yield postgres


@pytest.fixture(scope="session")
def engine(postgres_container):
    """Engine SQLAlchemy pour tests."""
    engine = create_engine(postgres_container.get_connection_url())
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)


@pytest.fixture
def db_session(engine) -> Session:
    """Session DB pour chaque test."""
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    yield session

    session.rollback()
    session.close()
```

### Exemple: Test de Repository

```python
# tests/integration/database/test_user_repository.py
import pytest
from uuid import uuid4

from myproject.domain.entities.user import User
from myproject.domain.value_objects.email import Email
from myproject.infrastructure.database.repositories.user_repository_impl import (
    UserRepositoryImpl
)


class TestUserRepositoryImpl:
    """Tests d'intégration pour UserRepositoryImpl."""

    @pytest.fixture
    def repository(self, db_session):
        """Fixture repository."""
        return UserRepositoryImpl(db_session)

    def test_save_user_persists_to_database(self, repository, db_session):
        """Test sauvegarde persiste en DB."""
        # Arrange
        user = User(
            id=uuid4(),
            email=Email("test@example.com"),
            name="John Doe"
        )

        # Act
        saved_user = repository.save(user)

        # Assert
        db_session.commit()  # Commit pour vérifier persistence
        found_user = repository.find_by_id(saved_user.id)
        assert found_user is not None
        assert found_user.email.value == "test@example.com"
        assert found_user.name == "John Doe"

    def test_find_by_email_returns_user(self, repository):
        """Test recherche par email."""
        # Arrange
        email = Email("test@example.com")
        user = User(id=uuid4(), email=email, name="John Doe")
        repository.save(user)

        # Act
        found_user = repository.find_by_email(email)

        # Assert
        assert found_user is not None
        assert found_user.email == email

    def test_find_by_email_returns_none_if_not_found(self, repository):
        """Test recherche retourne None si non trouvé."""
        # Act
        found_user = repository.find_by_email(Email("notfound@example.com"))

        # Assert
        assert found_user is None

    def test_exists_with_email_returns_true_if_exists(self, repository):
        """Test exists retourne True si email existe."""
        # Arrange
        email = Email("test@example.com")
        user = User(id=uuid4(), email=email, name="John Doe")
        repository.save(user)

        # Act
        exists = repository.exists_with_email(email)

        # Assert
        assert exists is True

    def test_delete_user_removes_from_database(self, repository):
        """Test suppression retire de la DB."""
        # Arrange
        user = User(id=uuid4(), email=Email("test@example.com"), name="John")
        saved_user = repository.save(user)

        # Act
        repository.delete(saved_user.id)

        # Assert
        found_user = repository.find_by_id(saved_user.id)
        assert found_user is None
```

### Exemple: Test API

```python
# tests/integration/api/test_users_routes.py
import pytest
from fastapi.testclient import TestClient

from myproject.infrastructure.api.main import app


@pytest.fixture
def client():
    """Client de test FastAPI."""
    return TestClient(app)


class TestUsersRoutes:
    """Tests d'intégration pour les routes users."""

    def test_create_user_returns_201(self, client, db_session):
        """Test création utilisateur retourne 201."""
        # Arrange
        payload = {
            "email": "test@example.com",
            "name": "John Doe",
            "send_welcome_email": False
        }

        # Act
        response = client.post("/users/", json=payload)

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "John Doe"
        assert "id" in data

    def test_create_user_with_invalid_email_returns_400(self, client):
        """Test création avec email invalide retourne 400."""
        # Arrange
        payload = {
            "email": "invalid",
            "name": "John Doe"
        }

        # Act
        response = client.post("/users/", json=payload)

        # Assert
        assert response.status_code == 400

    def test_create_user_with_existing_email_returns_409(self, client):
        """Test création avec email existant retourne 409."""
        # Arrange
        payload = {"email": "test@example.com", "name": "John Doe"}
        client.post("/users/", json=payload)  # Premier utilisateur

        # Act
        response = client.post("/users/", json=payload)  # Doublon

        # Assert
        assert response.status_code == 409
```

## Tests End-to-End

```python
# tests/e2e/test_order_flow.py
import pytest
from fastapi.testclient import TestClient


@pytest.mark.e2e
class TestOrderFlow:
    """Tests E2E pour le flux de commande complet."""

    def test_complete_order_flow(self, client, db_session):
        """Test flux complet: créer user → créer order → payer → vérifier email."""
        # 1. Créer utilisateur
        user_response = client.post("/users/", json={
            "email": "customer@example.com",
            "name": "Customer"
        })
        assert user_response.status_code == 201
        user_id = user_response.json()["id"]

        # 2. Créer commande
        order_response = client.post("/orders/", json={
            "user_id": user_id,
            "items": [
                {"product_id": 1, "quantity": 2},
                {"product_id": 2, "quantity": 1}
            ]
        })
        assert order_response.status_code == 201
        order_id = order_response.json()["id"]

        # 3. Payer la commande
        payment_response = client.post(f"/orders/{order_id}/pay", json={
            "payment_method": "card",
            "card_token": "tok_visa"
        })
        assert payment_response.status_code == 200

        # 4. Vérifier email de confirmation envoyé
        # (vérifier dans la DB ou mock email service)
        emails = client.get(f"/internal/emails?user_id={user_id}")
        assert len(emails.json()) == 2  # Welcome + Order confirmation
```

## Fixtures Avancées

```python
# tests/conftest.py
import pytest
from typing import Generator

from myproject.domain.entities.user import User
from myproject.domain.value_objects.email import Email


@pytest.fixture
def sample_user() -> User:
    """Fixture utilisateur de test."""
    return User(
        id=uuid4(),
        email=Email("test@example.com"),
        name="Test User"
    )


@pytest.fixture
def sample_users(db_session) -> Generator[list[User], None, None]:
    """Fixture pour plusieurs utilisateurs."""
    users = [
        User(id=uuid4(), email=Email(f"user{i}@example.com"), name=f"User {i}")
        for i in range(5)
    ]

    for user in users:
        db_session.add(user)
    db_session.commit()

    yield users

    # Cleanup
    for user in users:
        db_session.delete(user)
    db_session.commit()
```

## Commandes de Test

```bash
# Tous les tests
pytest

# Tests unitaires uniquement
pytest tests/unit/ -m unit

# Tests d'intégration
pytest tests/integration/ -m integration

# Tests E2E
pytest tests/e2e/ -m e2e

# Test spécifique
pytest tests/unit/domain/entities/test_user.py::TestUser::test_create_user

# Avec couverture
pytest --cov=src --cov-report=html

# Mode watch (pytest-watch)
ptw

# Parallèle (pytest-xdist)
pytest -n auto

# Verbose
pytest -vv

# Arrêter au premier échec
pytest -x

# Voir print statements
pytest -s
```

## Checklist Tests

- [ ] Tests unitaires pour toutes les entités
- [ ] Tests unitaires pour tous les use cases
- [ ] Tests d'intégration pour tous les repositories
- [ ] Tests d'intégration pour toutes les routes API
- [ ] Tests E2E pour les flux critiques
- [ ] Couverture > 80% (> 95% domain)
- [ ] Tous les tests passent
- [ ] Tests rapides (< 1 minute pour unitaires)
- [ ] Fixtures bien organisées
- [ ] Mocks pour dépendances externes
