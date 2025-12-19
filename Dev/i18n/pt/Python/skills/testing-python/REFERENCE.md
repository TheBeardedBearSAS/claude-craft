# Regra 07: Testes

Estratégia de testes para projetos Python com Arquitetura Limpa.

## Filosofia de Testes

1. **Testes são documentação**: Eles mostram como o código é usado
2. **TDD quando possível**: Escrever testes antes do código
3. **Cobertura > 80%**: Mínimo exigido
4. **Testes rápidos**: Testes unitários < 100ms

## Organização de Testes

```
tests/
├── unit/                    # Testes unitários (rápidos, isolados)
│   ├── domain/
│   │   ├── entities/
│   │   ├── value_objects/
│   │   └── services/
│   └── application/
│       └── use_cases/
├── integration/            # Testes de integração (BD, API)
│   ├── database/
│   └── api/
├── e2e/                   # Testes end-to-end (fluxos completos)
└── conftest.py           # Fixtures Pytest
```

## Testes Unitários

### Características

- **Isolados**: Sem dependências externas
- **Rápidos**: < 100ms por teste
- **Determinísticos**: Sempre o mesmo resultado
- **Independentes**: Podem executar em qualquer ordem

### Exemplo: Teste de Entidade

```python
# tests/unit/domain/entities/test_user.py
import pytest
from myproject.domain.entities.user import User
from myproject.domain.exceptions import InvalidEmailError


class TestUser:
    """Testes para entidade User."""

    def test_create_user_with_valid_data(self):
        """Testa criação de usuário com dados válidos."""
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
        """Testa que email inválido lança erro."""
        # Act & Assert
        with pytest.raises(InvalidEmailError):
            User(email="invalid-email", name="John")

    @pytest.mark.parametrize("email", [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.com",
    ])
    def test_create_user_with_various_valid_emails(self, email: str):
        """Testa criação de usuário com vários formatos de email válidos."""
        # Act
        user = User(email=email, name="Test")

        # Assert
        assert user.email == email
```

### Exemplo: Teste de Caso de Uso com Mocks

```python
# tests/unit/application/use_cases/test_create_user.py
import pytest
from unittest.mock import Mock, MagicMock

from myproject.application.use_cases.create_user import CreateUserUseCase
from myproject.domain.entities.user import User


class TestCreateUserUseCase:
    """Testes para CreateUserUseCase."""

    @pytest.fixture
    def mock_user_repository(self):
        """Mock repository."""
        return Mock()

    @pytest.fixture
    def mock_email_service(self):
        """Mock serviço de email."""
        return Mock()

    @pytest.fixture
    def use_case(self, mock_user_repository, mock_email_service):
        """Criar caso de uso com mocks."""
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
        """Testa que execute cria e salva usuário."""
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
        """Testa que email existente lança erro."""
        # Arrange
        mock_user_repository.exists_with_email.return_value = True

        # Act & Assert
        with pytest.raises(ValueError, match="Email already exists"):
            use_case.execute(email="test@example.com", name="Test")
```

## Testes de Integração

### Características

- **Dependências reais**: Banco de dados, API, etc.
- **Mais lentos**: Podem levar segundos
- **Dados isolados**: Cada teste tem seus próprios dados
- **Limpeza**: Teardown após cada teste

### Exemplo: Teste de Repository

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
    """Criar sessão de banco de dados de teste."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    yield session

    session.rollback()
    session.close()


class TestUserRepositoryImpl:
    """Testes de integração para UserRepository."""

    def test_save_persists_user_to_database(self, db_session):
        """Testa que save persiste usuário no banco de dados."""
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
        """Testa find_by_email retorna usuário se existe."""
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

### Exemplo: Teste de API

```python
# tests/integration/api/test_user_endpoints.py
import pytest
from fastapi.testclient import TestClient

from myproject.main import app


@pytest.fixture
def client():
    """Criar cliente de teste."""
    return TestClient(app)


class TestUserEndpoints:
    """Testes de integração para endpoints de usuário."""

    def test_create_user_returns_201(self, client):
        """Testa POST /users retorna 201."""
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
        """Testa GET /users/{id} retorna 404 se não encontrado."""
        # Act
        response = client.get("/api/v1/users/nonexistent-id")

        # Assert
        assert response.status_code == 404
```

## Cobertura de Testes

```bash
# Executar com cobertura
pytest --cov=src --cov-report=html --cov-report=term-missing

# Ver relatório HTML
open htmlcov/index.html
```

Cobertura alvo:
- **Camada de domínio**: > 95%
- **Camada de aplicação**: > 90%
- **Camada de infraestrutura**: > 80%
- **Global**: > 80%

## Fixtures Pytest

### Escopos de Fixture

```python
# conftest.py
import pytest


@pytest.fixture(scope="function")  # Padrão: novo por teste
def user():
    """Criar novo usuário para cada teste."""
    return User(email="test@example.com", name="Test")


@pytest.fixture(scope="class")  # Uma vez por classe de teste
def database():
    """Configurar banco de dados uma vez por classe."""
    db = setup_database()
    yield db
    teardown_database(db)


@pytest.fixture(scope="module")  # Uma vez por módulo
def app():
    """Configurar aplicação uma vez por módulo."""
    return create_app()


@pytest.fixture(scope="session")  # Uma vez por sessão de teste
def config():
    """Carregar config uma vez para toda a sessão."""
    return load_config()
```

### Factories de Fixture

```python
# conftest.py
import pytest
from typing import Callable


@pytest.fixture
def user_factory() -> Callable:
    """Factory para criar usuários com dados customizados."""
    def _create_user(email: str = "test@example.com", name: str = "Test") -> User:
        return User(email=email, name=name)
    return _create_user


# Uso no teste
def test_something(user_factory):
    user1 = user_factory()
    user2 = user_factory(email="other@example.com")
```

## Testes Parametrizados

```python
import pytest


@pytest.mark.parametrize("email,expected_valid", [
    ("valid@example.com", True),
    ("invalid-email", False),
    ("@example.com", False),
    ("user@", False),
])
def test_email_validation(email: str, expected_valid: bool):
    """Testa validação de email com múltiplos casos."""
    if expected_valid:
        user = User(email=email, name="Test")
        assert user.email == email
    else:
        with pytest.raises(InvalidEmailError):
            User(email=email, name="Test")
```

## Testes Async

```python
import pytest


@pytest.mark.asyncio
async def test_async_function():
    """Testa função async."""
    result = await some_async_function()
    assert result == expected
```

## Checklist

- [ ] Organização de testes (unit/integration/e2e)
- [ ] Cobertura > 80%
- [ ] Fixtures configuradas em conftest.py
- [ ] Mocks para dependências em testes unitários
- [ ] Padrão AAA (Arrange, Act, Assert)
- [ ] Nomes de teste descritivos
- [ ] Uma assertion por conceito de teste
- [ ] Testes são rápidos (unit < 100ms)
- [ ] Testes são isolados e independentes
- [ ] Casos extremos testados
