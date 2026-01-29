# Rule 07: Testing

Testing strategy for Python projects with Clean Architecture.

## Testing Philosophy

1. **Tests are documentation**: They show how code is used
2. **TDD when possible**: Write tests before code
3. **Coverage > 80%**: Minimum required
4. **Fast tests**: Unit tests < 100ms

## Test Organization

```
tests/
├── unit/                    # Unit tests (fast, isolated)
│   ├── domain/
│   │   ├── entities/
│   │   ├── value_objects/
│   │   └── services/
│   └── application/
│       └── use_cases/
├── integration/            # Integration tests (DB, API)
│   ├── database/
│   └── api/
├── e2e/                   # End-to-end tests (full flows)
└── conftest.py           # Pytest fixtures
```

## Unit Tests

### Characteristics

- **Isolated**: No external dependencies
- **Fast**: < 100ms per test
- **Deterministic**: Always same result
- **Independent**: Can run in any order

### Example: Entity Test

```python
# tests/unit/domain/entities/test_user.py
import pytest
from myproject.domain.entities.user import User
from myproject.domain.exceptions import InvalidEmailError


class TestUser:
    """Tests for User entity."""

    def test_create_user_with_valid_data(self):
        """Test user creation with valid data."""
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
        """Test that invalid email raises error."""
        # Act & Assert
        with pytest.raises(InvalidEmailError):
            User(email="invalid-email", name="John")

    @pytest.mark.parametrize("email", [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.com",
    ])
    def test_create_user_with_various_valid_emails(self, email: str):
        """Test user creation with various valid email formats."""
        # Act
        user = User(email=email, name="Test")

        # Assert
        assert user.email == email
```

### Example: Use Case Test with Mocks

```python
# tests/unit/application/use_cases/test_create_user.py
import pytest
from unittest.mock import Mock, MagicMock

from myproject.application.use_cases.create_user import CreateUserUseCase
from myproject.domain.entities.user import User


class TestCreateUserUseCase:
    """Tests for CreateUserUseCase."""

    @pytest.fixture
    def mock_user_repository(self):
        """Mock repository."""
        return Mock()

    @pytest.fixture
    def mock_email_service(self):
        """Mock email service."""
        return Mock()

    @pytest.fixture
    def use_case(self, mock_user_repository, mock_email_service):
        """Create use case with mocks."""
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
        """Test that execute creates and saves user."""
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
        """Test that existing email raises error."""
        # Arrange
        mock_user_repository.exists_with_email.return_value = True

        # Act & Assert
        with pytest.raises(ValueError, match="Email already exists"):
            use_case.execute(email="test@example.com", name="Test")
```

## Integration Tests

### Characteristics

- **Real dependencies**: Database, API, etc.
- **Slower**: Can take seconds
- **Isolated data**: Each test has its own data
- **Cleanup**: Teardown after each test

### Example: Repository Test

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
    """Create test database session."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    yield session

    session.rollback()
    session.close()


class TestUserRepositoryImpl:
    """Integration tests for UserRepository."""

    def test_save_persists_user_to_database(self, db_session):
        """Test that save persists user to database."""
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
        """Test find_by_email returns user if exists."""
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

### Example: API Test

```python
# tests/integration/api/test_user_endpoints.py
import pytest
from fastapi.testclient import TestClient

from myproject.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


class TestUserEndpoints:
    """Integration tests for user endpoints."""

    def test_create_user_returns_201(self, client):
        """Test POST /users returns 201."""
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
        """Test GET /users/{id} returns 404 if not found."""
        # Act
        response = client.get("/api/v1/users/nonexistent-id")

        # Assert
        assert response.status_code == 404
```

## Test Coverage

```bash
# Run with coverage
pytest --cov=src --cov-report=html --cov-report=term-missing

# View HTML report
open htmlcov/index.html
```

Target coverage:
- **Domain layer**: > 95%
- **Application layer**: > 90%
- **Infrastructure layer**: > 80%
- **Global**: > 80%

## Pytest Fixtures

### Fixture Scopes

```python
# conftest.py
import pytest


@pytest.fixture(scope="function")  # Default: new per test
def user():
    """Create new user for each test."""
    return User(email="test@example.com", name="Test")


@pytest.fixture(scope="class")  # Once per test class
def database():
    """Setup database once per class."""
    db = setup_database()
    yield db
    teardown_database(db)


@pytest.fixture(scope="module")  # Once per module
def app():
    """Setup application once per module."""
    return create_app()


@pytest.fixture(scope="session")  # Once per test session
def config():
    """Load config once for entire session."""
    return load_config()
```

### Fixture Factories

```python
# conftest.py
import pytest
from typing import Callable


@pytest.fixture
def user_factory() -> Callable:
    """Factory to create users with custom data."""
    def _create_user(email: str = "test@example.com", name: str = "Test") -> User:
        return User(email=email, name=name)
    return _create_user


# Usage in test
def test_something(user_factory):
    user1 = user_factory()
    user2 = user_factory(email="other@example.com")
```

## Parametrized Tests

```python
import pytest


@pytest.mark.parametrize("email,expected_valid", [
    ("valid@example.com", True),
    ("invalid-email", False),
    ("@example.com", False),
    ("user@", False),
])
def test_email_validation(email: str, expected_valid: bool):
    """Test email validation with multiple cases."""
    if expected_valid:
        user = User(email=email, name="Test")
        assert user.email == email
    else:
        with pytest.raises(InvalidEmailError):
            User(email=email, name="Test")
```

## Async Tests

```python
import pytest


@pytest.mark.asyncio
async def test_async_function():
    """Test async function."""
    result = await some_async_function()
    assert result == expected
```

## Checklist

- [ ] Test organization (unit/integration/e2e)
- [ ] Coverage > 80%
- [ ] Fixtures configured in conftest.py
- [ ] Mocks for dependencies in unit tests
- [ ] AAA pattern (Arrange, Act, Assert)
- [ ] Descriptive test names
- [ ] One assertion per test concept
- [ ] Tests are fast (unit < 100ms)
- [ ] Tests are isolated and independent
- [ ] Edge cases tested
