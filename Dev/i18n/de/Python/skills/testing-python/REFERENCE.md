# Regel 07: Testing

Teststrategie für Python-Projekte mit Clean Architecture.

## Test-Philosophie

1. **Tests sind Dokumentation**: Sie zeigen, wie Code verwendet wird
2. **TDD wenn möglich**: Tests vor Code schreiben
3. **Coverage > 80%**: Mindesterforderlich
4. **Schnelle Tests**: Unit-Tests < 100ms

## Test-Organisation

```
tests/
├── unit/                    # Unit-Tests (schnell, isoliert)
│   ├── domain/
│   │   ├── entities/
│   │   ├── value_objects/
│   │   └── services/
│   └── application/
│       └── use_cases/
├── integration/            # Integrationstests (DB, API)
│   ├── database/
│   └── api/
├── e2e/                   # End-to-End-Tests (vollständige Abläufe)
└── conftest.py           # Pytest-Fixtures
```

## Unit-Tests

### Eigenschaften

- **Isoliert**: Keine externen Abhängigkeiten
- **Schnell**: < 100ms pro Test
- **Deterministisch**: Immer gleiches Ergebnis
- **Unabhängig**: Kann in beliebiger Reihenfolge ausgeführt werden

### Beispiel: Entity-Test

```python
# tests/unit/domain/entities/test_user.py
import pytest
from myproject.domain.entities.user import User
from myproject.domain.exceptions import InvalidEmailError


class TestUser:
    """Tests für User-Entität."""

    def test_create_user_with_valid_data(self):
        """Testet Benutzererstellung mit gültigen Daten."""
        # Arrange
        email = "john@example.com"
        name = "John Doe"

        # Act
        user = User(email=email, name=name)

        # Assert
        assert user.email == email
        assert user.name == name
        assert user.is_active is True

    def test_create_user_with_invalid_email_raises_error(self):
        """Testet, dass ungültige E-Mail Fehler auslöst."""
        # Act & Assert
        with pytest.raises(InvalidEmailError):
            User(email="invalid-email", name="John")

    @pytest.mark.parametrize("email", [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.com",
    ])
    def test_create_user_with_various_valid_emails(self, email: str):
        """Testet Benutzererstellung mit verschiedenen gültigen E-Mail-Formaten."""
        # Act
        user = User(email=email, name="Test")

        # Assert
        assert user.email == email
```

### Beispiel: Use Case-Test mit Mocks

```python
# tests/unit/application/use_cases/test_create_user.py
import pytest
from unittest.mock import Mock, MagicMock

from myproject.application.use_cases.create_user import CreateUserUseCase
from myproject.domain.entities.user import User


class TestCreateUserUseCase:
    """Tests für CreateUserUseCase."""

    @pytest.fixture
    def mock_user_repository(self):
        """Mock-Repository."""
        return Mock()

    @pytest.fixture
    def mock_email_service(self):
        """Mock-E-Mail-Service."""
        return Mock()

    @pytest.fixture
    def use_case(self, mock_user_repository, mock_email_service):
        """Use Case mit Mocks erstellen."""
        return CreateUserUseCase(
            user_repository=mock_user_repository,
            email_service=mock_email_service
        )

    def test_execute_creates_and_saves_user(
        self,
        use_case,
        mock_user_repository,
        mock_email_service
    ):
        """Testet, dass execute Benutzer erstellt und speichert."""
        # Arrange
        email = "test@example.com"
        name = "Test User"

        mock_user = User(email=email, name=name)
        mock_user_repository.save.return_value = mock_user
        mock_user_repository.exists_with_email.return_value = False

        # Act
        result = use_case.execute(email=email, name=name)

        # Assert
        mock_user_repository.save.assert_called_once()
        mock_email_service.send_welcome_email.assert_called_once_with(mock_user)
        assert result.email == email

    def test_execute_with_existing_email_raises_error(
        self,
        use_case,
        mock_user_repository
    ):
        """Testet, dass existierende E-Mail Fehler auslöst."""
        # Arrange
        mock_user_repository.exists_with_email.return_value = True

        # Act & Assert
        with pytest.raises(ValueError, match="E-Mail existiert bereits"):
            use_case.execute(email="test@example.com", name="Test")
```

## Integrationstests

### Eigenschaften

- **Echte Abhängigkeiten**: Datenbank, API usw.
- **Langsamer**: Kann Sekunden dauern
- **Isolierte Daten**: Jeder Test hat eigene Daten
- **Aufräumen**: Teardown nach jedem Test

### Beispiel: Repository-Test

```python
# tests/integration/infrastructure/database/test_user_repository.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from myproject.domain.entities.user import User
from myproject.infrastructure.database.repositories.user_repository_impl import (
    UserRepositoryImpl
)


@pytest.fixture
def db_session():
    """Test-Datenbanksession erstellen."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    yield session

    session.rollback()
    session.close()


class TestUserRepositoryImpl:
    """Integrationstests für UserRepository."""

    def test_save_persists_user_to_database(self, db_session):
        """Testet, dass save Benutzer in Datenbank speichert."""
        # Arrange
        repository = UserRepositoryImpl(db_session)
        user = User(email="test@example.com", name="Test")

        # Act
        saved_user = repository.save(user)

        # Assert
        db_session.commit()
        found_user = repository.find_by_id(saved_user.id)
        assert found_user is not None
        assert found_user.email == user.email

    def test_find_by_email_returns_user_if_exists(self, db_session):
        """Testet find_by_email gibt Benutzer zurück, wenn vorhanden."""
        # Arrange
        repository = UserRepositoryImpl(db_session)
        user = User(email="test@example.com", name="Test")
        repository.save(user)
        db_session.commit()

        # Act
        found = repository.find_by_email("test@example.com")

        # Assert
        assert found is not None
        assert found.email == user.email
```

### Beispiel: API-Test

```python
# tests/integration/api/test_user_endpoints.py
import pytest
from fastapi.testclient import TestClient

from myproject.main import app


@pytest.fixture
def client():
    """Test-Client erstellen."""
    return TestClient(app)


class TestUserEndpoints:
    """Integrationstests für User-Endpoints."""

    def test_create_user_returns_201(self, client):
        """Testet POST /users gibt 201 zurück."""
        # Arrange
        data = {
            "email": "test@example.com",
            "name": "Test User"
        }

        # Act
        response = client.post("/api/v1/users", json=data)

        # Assert
        assert response.status_code == 201
        assert response.json()["email"] == data["email"]

    def test_get_user_returns_404_if_not_found(self, client):
        """Testet GET /users/{id} gibt 404 zurück, wenn nicht gefunden."""
        # Act
        response = client.get("/api/v1/users/nonexistent-id")

        # Assert
        assert response.status_code == 404
```

## Test-Coverage

```bash
# Mit Coverage ausführen
pytest --cov=src --cov-report=html --cov-report=term-missing

# HTML-Report anzeigen
open htmlcov/index.html
```

Ziel-Coverage:
- **Domain-Layer**: > 95%
- **Application-Layer**: > 90%
- **Infrastructure-Layer**: > 80%
- **Global**: > 80%

## Pytest-Fixtures

### Fixture-Scopes

```python
# conftest.py
import pytest


@pytest.fixture(scope="function")  # Standard: neu pro Test
def user():
    """Neuen Benutzer für jeden Test erstellen."""
    return User(email="test@example.com", name="Test")


@pytest.fixture(scope="class")  # Einmal pro Testklasse
def database():
    """Datenbank einmal pro Klasse einrichten."""
    db = setup_database()
    yield db
    teardown_database(db)


@pytest.fixture(scope="module")  # Einmal pro Modul
def app():
    """Anwendung einmal pro Modul einrichten."""
    return create_app()


@pytest.fixture(scope="session")  # Einmal pro Testsession
def config():
    """Konfiguration einmal für gesamte Session laden."""
    return load_config()
```

### Fixture-Factories

```python
# conftest.py
import pytest
from typing import Callable


@pytest.fixture
def user_factory() -> Callable:
    """Factory zum Erstellen von Benutzern mit benutzerdefinierten Daten."""
    def _create_user(email: str = "test@example.com", name: str = "Test") -> User:
        return User(email=email, name=name)
    return _create_user


# Verwendung im Test
def test_something(user_factory):
    user1 = user_factory()
    user2 = user_factory(email="other@example.com")
```

## Parametrisierte Tests

```python
import pytest


@pytest.mark.parametrize("email,expected_valid", [
    ("valid@example.com", True),
    ("invalid-email", False),
    ("@example.com", False),
    ("user@", False),
])
def test_email_validation(email: str, expected_valid: bool):
    """Testet E-Mail-Validierung mit mehreren Fällen."""
    if expected_valid:
        user = User(email=email, name="Test")
        assert user.email == email
    else:
        with pytest.raises(InvalidEmailError):
            User(email=email, name="Test")
```

## Async-Tests

```python
import pytest


@pytest.mark.asyncio
async def test_async_function():
    """Testet asynchrone Funktion."""
    result = await some_async_function()
    assert result == expected
```

## Checkliste

- [ ] Test-Organisation (unit/integration/e2e)
- [ ] Coverage > 80%
- [ ] Fixtures in conftest.py konfiguriert
- [ ] Mocks für Abhängigkeiten in Unit-Tests
- [ ] AAA-Pattern (Arrange, Act, Assert)
- [ ] Beschreibende Testnamen
- [ ] Eine Assertion pro Testkonzept
- [ ] Tests sind schnell (Unit < 100ms)
- [ ] Tests sind isoliert und unabhängig
- [ ] Randfälle getestet
