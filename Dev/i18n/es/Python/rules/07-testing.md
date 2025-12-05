# Regla 07: Pruebas

Estrategia de pruebas para proyectos Python con Clean Architecture.

## Filosofía de Pruebas

1. **Las pruebas son documentación**: Muestran cómo se usa el código
2. **TDD cuando sea posible**: Escribir pruebas antes del código
3. **Cobertura > 80%**: Mínimo requerido
4. **Pruebas rápidas**: Pruebas unitarias < 100ms

## Organización de Pruebas

```
tests/
├── unit/                    # Pruebas unitarias (rápidas, aisladas)
│   ├── domain/
│   │   ├── entities/
│   │   ├── value_objects/
│   │   └── services/
│   └── application/
│       └── use_cases/
├── integration/            # Pruebas de integración (BD, API)
│   ├── database/
│   └── api/
├── e2e/                   # Pruebas end-to-end (flujos completos)
└── conftest.py           # Fixtures de pytest
```

## Pruebas Unitarias

### Características

- **Aisladas**: Sin dependencias externas
- **Rápidas**: < 100ms por prueba
- **Deterministas**: Siempre el mismo resultado
- **Independientes**: Pueden ejecutarse en cualquier orden

### Ejemplo: Prueba de Entidad

```python
# tests/unit/domain/entities/test_user.py
import pytest
from myproject.domain.entities.user import User
from myproject.domain.exceptions import InvalidEmailError


class TestUser:
    """Pruebas para la entidad User."""

    def test_create_user_with_valid_data(self):
        """Prueba creación de usuario con datos válidos."""
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
        """Prueba que email inválido lanza error."""
        # Act & Assert
        with pytest.raises(InvalidEmailError):
            User(email="invalid-email", name="John")

    @pytest.mark.parametrize("email", [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.com",
    ])
    def test_create_user_with_various_valid_emails(self, email: str):
        """Prueba creación de usuario con varios formatos de email válidos."""
        # Act
        user = User(email=email, name="Test")

        # Assert
        assert user.email == email
```

### Ejemplo: Prueba de Caso de Uso con Mocks

```python
# tests/unit/application/use_cases/test_create_user.py
import pytest
from unittest.mock import Mock, MagicMock

from myproject.application.use_cases.create_user import CreateUserUseCase
from myproject.domain.entities.user import User


class TestCreateUserUseCase:
    """Pruebas para CreateUserUseCase."""

    @pytest.fixture
    def mock_user_repository(self):
        """Mock de repositorio."""
        return Mock()

    @pytest.fixture
    def mock_email_service(self):
        """Mock de servicio de email."""
        return Mock()

    @pytest.fixture
    def use_case(self, mock_user_repository, mock_email_service):
        """Crea caso de uso con mocks."""
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
        """Prueba que execute crea y guarda usuario."""
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
        """Prueba que email existente lanza error."""
        # Arrange
        mock_user_repository.exists_with_email.return_value = True

        # Act & Assert
        with pytest.raises(ValueError, match="El email ya existe"):
            use_case.execute(email="test@example.com", name="Test")
```

## Pruebas de Integración

### Características

- **Dependencias reales**: Base de datos, API, etc.
- **Más lentas**: Pueden tomar segundos
- **Datos aislados**: Cada prueba tiene sus propios datos
- **Limpieza**: Teardown después de cada prueba

### Ejemplo: Prueba de Repositorio

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
    """Crea sesión de base de datos de prueba."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    yield session

    session.rollback()
    session.close()


class TestUserRepositoryImpl:
    """Pruebas de integración para UserRepository."""

    def test_save_persists_user_to_database(self, db_session):
        """Prueba que save persiste usuario en base de datos."""
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
        """Prueba find_by_email devuelve usuario si existe."""
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

### Ejemplo: Prueba de API

```python
# tests/integration/api/test_user_endpoints.py
import pytest
from fastapi.testclient import TestClient

from myproject.main import app


@pytest.fixture
def client():
    """Crea cliente de prueba."""
    return TestClient(app)


class TestUserEndpoints:
    """Pruebas de integración para endpoints de usuario."""

    def test_create_user_returns_201(self, client):
        """Prueba POST /users devuelve 201."""
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
        """Prueba GET /users/{id} devuelve 404 si no se encuentra."""
        # Act
        response = client.get("/api/v1/users/nonexistent-id")

        # Assert
        assert response.status_code == 404
```

## Cobertura de Pruebas

```bash
# Ejecutar con cobertura
pytest --cov=src --cov-report=html --cov-report=term-missing

# Ver reporte HTML
open htmlcov/index.html
```

Cobertura objetivo:
- **Capa de dominio**: > 95%
- **Capa de aplicación**: > 90%
- **Capa de infraestructura**: > 80%
- **Global**: > 80%

## Fixtures de Pytest

### Ámbitos de Fixture

```python
# conftest.py
import pytest


@pytest.fixture(scope="function")  # Por defecto: nueva por prueba
def user():
    """Crea nuevo usuario para cada prueba."""
    return User(email="test@example.com", name="Test")


@pytest.fixture(scope="class")  # Una vez por clase de prueba
def database():
    """Configura base de datos una vez por clase."""
    db = setup_database()
    yield db
    teardown_database(db)


@pytest.fixture(scope="module")  # Una vez por módulo
def app():
    """Configura aplicación una vez por módulo."""
    return create_app()


@pytest.fixture(scope="session")  # Una vez por sesión de pruebas
def config():
    """Carga configuración una vez para toda la sesión."""
    return load_config()
```

### Fábricas de Fixture

```python
# conftest.py
import pytest
from typing import Callable


@pytest.fixture
def user_factory() -> Callable:
    """Fábrica para crear usuarios con datos personalizados."""
    def _create_user(email: str = "test@example.com", name: str = "Test") -> User:
        return User(email=email, name=name)
    return _create_user


# Uso en prueba
def test_something(user_factory):
    user1 = user_factory()
    user2 = user_factory(email="other@example.com")
```

## Pruebas Parametrizadas

```python
import pytest


@pytest.mark.parametrize("email,expected_valid", [
    ("valid@example.com", True),
    ("invalid-email", False),
    ("@example.com", False),
    ("user@", False),
])
def test_email_validation(email: str, expected_valid: bool):
    """Prueba validación de email con múltiples casos."""
    if expected_valid:
        user = User(email=email, name="Test")
        assert user.email == email
    else:
        with pytest.raises(InvalidEmailError):
            User(email=email, name="Test")
```

## Pruebas Asíncronas

```python
import pytest


@pytest.mark.asyncio
async def test_async_function():
    """Prueba función asíncrona."""
    result = await some_async_function()
    assert result == expected
```

## Lista de Verificación

- [ ] Organización de pruebas (unit/integration/e2e)
- [ ] Cobertura > 80%
- [ ] Fixtures configurados en conftest.py
- [ ] Mocks para dependencias en pruebas unitarias
- [ ] Patrón AAA (Arrange, Act, Assert)
- [ ] Nombres descriptivos de pruebas
- [ ] Una aserción por concepto de prueba
- [ ] Las pruebas son rápidas (unit < 100ms)
- [ ] Las pruebas están aisladas e independientes
- [ ] Casos extremos probados
