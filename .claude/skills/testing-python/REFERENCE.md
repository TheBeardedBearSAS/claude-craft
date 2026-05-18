# Stratégie de Tests Python 3.14+ — Référence Complète

**Versions :** Python 3.14+ | pytest 8.x | Ruff 0.8+ | mypy 1.13+ | Playwright

## Configuration pytest + Ruff + mypy

```toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "--cov=app --cov-report=term-missing --cov-fail-under=80"

[tool.ruff]
line-length = 88
target-version = "py314"
select = ["E", "F", "I", "N", "W", "UP", "B", "C4", "SIM"]
fix = true

[tool.mypy]
python_version = "3.14"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

**Source :** [Ruff Configuration](https://docs.astral.sh/ruff/configuration/)

## Tests pytest avec fixtures

```python
# tests/test_user_service.py
import pytest
from app.services.user_service import UserService
from app.models.user import User

@pytest.fixture
def user_service():
    """Fixture pour créer un service utilisateur avec dépendances mockées."""
    return UserService(db=MockDatabase())

def test_create_user_returns_user_with_id(user_service):
    # Arrange
    user_data = {"name": "Alice", "email": "alice@example.com"}
    
    # Act
    user = user_service.create_user(user_data)
    
    # Assert
    assert user.id is not None
    assert user.name == "Alice"
    assert user.email == "alice@example.com"
```

**Source :** [pytest fixtures](https://docs.pytest.org/en/stable/fixture.html)

## Mutation Testing avec Mutmut

```bash
# Installation
pip install mutmut

# Exécution
mutmut run

# Rapport
mutmut results
mutmut html  # Génère rapport HTML

# Seuil minimum mutation score
mutmut run --min-msi=80
```

**Philosophie :** "Coverage mesure la quantité, mutation score mesure la qualité."

**Source :** [Mutmut](https://mutmut.readthedocs.io/)

## Property-based Testing avec Hypothesis

```python
# tests/test_calculator.py
from hypothesis import given, strategies as st
from app.calculator import calculate_total

@given(st.lists(st.floats(min_value=0, max_value=1000)))
def test_calculate_total_is_never_negative(prices):
    """Le total ne peut jamais être négatif."""
    total = calculate_total(prices)
    assert total >= 0

@given(st.lists(st.floats(min_value=0, max_value=1000)))
def test_calculate_total_order_independent(prices):
    """L'ordre des prix ne change pas le total."""
    total1 = calculate_total(prices)
    total2 = calculate_total(prices[::-1])
    assert total1 == total2
```

**Source :** [Hypothesis](https://hypothesis.readthedocs.io/)

## Tests FastAPI avec pytest

```python
# tests/test_api.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_user_returns_200():
    response = client.get("/users/123")
    assert response.status_code == 200
    assert response.json()["id"] == "123"

def test_create_user_validates_email():
    response = client.post("/users", json={"name": "Bob", "email": "invalid"})
    assert response.status_code == 422  # Validation error
```

**Source :** [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)

## Ruff — Linting + Formatting unifié

Remplace Black, isort, Flake8, pyupgrade — 10-100× plus rapide.

```bash
# Check
ruff check .

# Format
ruff format .

# Fix automatique
ruff check --fix .
```

**Source :** [Ruff](https://docs.astral.sh/ruff/)

## mypy strict mode

```python
# app/services/user_service.py
from typing import Protocol

class Database(Protocol):
    def save(self, user: User) -> None: ...

class UserService:
    def __init__(self, db: Database) -> None:
        self._db = db
    
    def create_user(self, data: dict[str, str]) -> User:
        user = User(**data)
        self._db.save(user)
        return user
```

**Source :** [mypy strict mode](https://mypy.readthedocs.io/en/stable/command_line.html#cmdoption-mypy-strict)

## Tests Playwright pour E2E

```python
# tests/e2e/test_login.py
from playwright.sync_api import Page, expect

def test_user_can_login(page: Page):
    page.goto("http://localhost:8000/login")
    page.fill('input[name="email"]', "alice@example.com")
    page.fill('input[name="password"]', "secret")
    page.click('button[type="submit"]')
    
    expect(page).to_have_url("http://localhost:8000/dashboard")
```

**Source :** [Playwright Python](https://playwright.dev/python/docs/intro)

---

Voir `@.claude/rules/07-testing.md` pour principes transverses.
