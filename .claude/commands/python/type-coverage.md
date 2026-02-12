---
description: Vérification Couverture des Types Python
argument-hint: [arguments]
---

# Vérification Couverture des Types Python

Tu es un expert Python. Tu dois vérifier la couverture des annotations de types dans le projet et identifier les fonctions/méthodes non typées.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Chemin vers un module spécifique
- (Optionnel) Seuil de couverture minimum (ex: `80`)

Exemple : `/python:type-coverage app/` ou `/python:type-coverage app/api/ 90`

## MISSION

### Étape 1 : Configuration mypy

```toml
# pyproject.toml
[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
show_error_codes = true
show_column_numbers = true

# Exclusions
exclude = [
    "tests/",
    "migrations/",
    "alembic/",
]

# Plugins
plugins = [
    "pydantic.mypy",
    "sqlalchemy.ext.mypy.plugin",
]

# Configuration par module
[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false

[[tool.mypy.overrides]]
module = "alembic.*"
ignore_errors = true
```

### Étape 2 : Lancer l'Analyse

```bash
# Mypy standard
mypy app/

# Avec rapport de couverture
mypy app/ --txt-report type-coverage/

# Rapport HTML
mypy app/ --html-report type-coverage-html/

# Mode strict progressif
mypy app/ --strict --warn-return-any

# Ignorer les erreurs existantes (génère baseline)
mypy app/ --strict 2>&1 | tee mypy-baseline.txt
```

### Étape 3 : Script d'Analyse de Couverture

```python
# scripts/type_coverage.py
"""Analyse la couverture des types dans le projet."""

import ast
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Generator


@dataclass
class FunctionInfo:
    """Informations sur une fonction."""
    name: str
    file: str
    line: int
    has_return_type: bool
    params_typed: int
    params_total: int
    is_method: bool = False
    class_name: str | None = None

    @property
    def fully_typed(self) -> bool:
        return self.has_return_type and self.params_typed == self.params_total

    @property
    def coverage_percent(self) -> float:
        total = self.params_total + 1  # +1 pour le return type
        typed = self.params_typed + (1 if self.has_return_type else 0)
        return (typed / total * 100) if total > 0 else 100.0


@dataclass
class ModuleStats:
    """Statistiques d'un module."""
    path: str
    functions: list[FunctionInfo] = field(default_factory=list)

    @property
    def total_functions(self) -> int:
        return len(self.functions)

    @property
    def fully_typed_functions(self) -> int:
        return sum(1 for f in self.functions if f.fully_typed)

    @property
    def coverage_percent(self) -> float:
        if not self.functions:
            return 100.0
        return self.fully_typed_functions / self.total_functions * 100


class TypeCoverageAnalyzer(ast.NodeVisitor):
    """Analyseur de couverture des types."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.functions: list[FunctionInfo] = []
        self._current_class: str | None = None

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        self._current_class = node.name
        self.generic_visit(node)
        self._current_class = None

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self._analyze_function(node)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        self._analyze_function(node)
        self.generic_visit(node)

    def _analyze_function(self, node: ast.FunctionDef | ast.AsyncFunctionDef) -> None:
        # Skip private/magic methods sauf __init__
        if node.name.startswith('_') and node.name != '__init__':
            return

        # Compter les paramètres typés
        params_total = 0
        params_typed = 0

        for arg in node.args.args:
            # Ignorer 'self' et 'cls'
            if arg.arg in ('self', 'cls'):
                continue
            params_total += 1
            if arg.annotation is not None:
                params_typed += 1

        # Vérifier le type de retour
        has_return_type = node.returns is not None

        # Pour __init__, pas besoin de return type
        if node.name == '__init__':
            has_return_type = True

        self.functions.append(FunctionInfo(
            name=node.name,
            file=self.file_path,
            line=node.lineno,
            has_return_type=has_return_type,
            params_typed=params_typed,
            params_total=params_total,
            is_method=self._current_class is not None,
            class_name=self._current_class,
        ))


def analyze_file(file_path: Path) -> ModuleStats:
    """Analyse un fichier Python."""
    with open(file_path, 'r', encoding='utf-8') as f:
        source = f.read()

    try:
        tree = ast.parse(source)
    except SyntaxError:
        return ModuleStats(path=str(file_path))

    analyzer = TypeCoverageAnalyzer(str(file_path))
    analyzer.visit(tree)

    return ModuleStats(
        path=str(file_path),
        functions=analyzer.functions,
    )


def find_python_files(directory: Path) -> Generator[Path, None, None]:
    """Trouve tous les fichiers Python."""
    for path in directory.rglob('*.py'):
        # Ignorer certains dossiers
        if any(part.startswith('.') or part in ('__pycache__', 'venv', '.venv', 'migrations', 'alembic')
               for part in path.parts):
            continue
        yield path


def main(target_path: str, min_coverage: float = 80.0) -> int:
    """Point d'entrée principal."""
    target = Path(target_path)

    if target.is_file():
        files = [target]
    else:
        files = list(find_python_files(target))

    all_stats: list[ModuleStats] = []
    for file_path in files:
        stats = analyze_file(file_path)
        all_stats.append(stats)

    # Afficher le rapport
    print_report(all_stats, min_coverage)

    # Calculer la couverture globale
    total_functions = sum(s.total_functions for s in all_stats)
    fully_typed = sum(s.fully_typed_functions for s in all_stats)
    global_coverage = (fully_typed / total_functions * 100) if total_functions > 0 else 100.0

    return 0 if global_coverage >= min_coverage else 1


if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'app/'
    threshold = float(sys.argv[2]) if len(sys.argv) > 2 else 80.0
    sys.exit(main(target, threshold))
```

### Étape 4 : Patterns de Typage

```python
# Bonnes pratiques de typage

from typing import (
    Any,
    Callable,
    Generic,
    Literal,
    Optional,  # Déprécié en 3.10+, utiliser X | None
    Protocol,
    Self,
    TypeAlias,
    TypeVar,
    Union,  # Déprécié en 3.10+, utiliser X | Y
    cast,
    overload,
)
from collections.abc import (
    Awaitable,
    Callable,
    Coroutine,
    Generator,
    Iterable,
    Iterator,
    Mapping,
    Sequence,
)

# Type aliases
UserId: TypeAlias = str
JSON: TypeAlias = dict[str, Any]

# Generics
T = TypeVar('T')
T_co = TypeVar('T_co', covariant=True)

# Fonctions
def process_items(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}

# Méthodes async
async def fetch_data(url: str) -> dict[str, Any]:
    ...

# Callable
Handler = Callable[[str, int], bool]
AsyncHandler = Callable[[str], Awaitable[dict[str, Any]]]

# Overload pour différents types de retour
@overload
def get_item(id: int) -> Item: ...
@overload
def get_item(id: str) -> Item | None: ...
def get_item(id: int | str) -> Item | None:
    ...

# Protocol pour duck typing
class Closeable(Protocol):
    def close(self) -> None: ...

def process_resource(resource: Closeable) -> None:
    try:
        ...
    finally:
        resource.close()

# Self pour les méthodes de classe
class Builder:
    def with_name(self, name: str) -> Self:
        self.name = name
        return self

# Literal pour valeurs spécifiques
def set_status(status: Literal["pending", "active", "archived"]) -> None:
    ...
```

### Étape 5 : Générer le Rapport

```
══════════════════════════════════════════════════════════════
📊 RAPPORT COUVERTURE DES TYPES
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📈 RÉSUMÉ GLOBAL
──────────────────────────────────────────────────────────────

| Métrique | Valeur | Seuil | Status |
|----------|--------|-------|--------|
| Couverture globale | 78.5% | 80% | ⚠️ |
| Fonctions totales | 245 | - | - |
| Entièrement typées | 192 | - | - |
| Partiellement typées | 38 | - | - |
| Non typées | 15 | - | - |

──────────────────────────────────────────────────────────────
📁 COUVERTURE PAR MODULE
──────────────────────────────────────────────────────────────

| Module | Fonctions | Typées | Couverture |
|--------|-----------|--------|------------|
| app/api/ | 45 | 45 | 100% ✅ |
| app/core/ | 32 | 30 | 93.8% ✅ |
| app/services/ | 58 | 52 | 89.7% ✅ |
| app/crud/ | 40 | 35 | 87.5% ✅ |
| app/models/ | 28 | 20 | 71.4% ⚠️ |
| app/utils/ | 42 | 10 | 23.8% ❌ |

──────────────────────────────────────────────────────────────
❌ FONCTIONS NON TYPÉES
──────────────────────────────────────────────────────────────

### app/utils/helpers.py

| Ligne | Fonction | Manque |
|-------|----------|--------|
| 15 | `parse_date` | return type |
| 28 | `format_currency` | param: amount, return |
| 45 | `slugify` | return type |
| 67 | `calculate_hash` | param: data |

### app/models/base.py

| Ligne | Fonction | Manque |
|-------|----------|--------|
| 23 | `to_dict` | return type |
| 45 | `from_dict` | param: data |

──────────────────────────────────────────────────────────────
⚠️ FONCTIONS PARTIELLEMENT TYPÉES
──────────────────────────────────────────────────────────────

| Fichier | Ligne | Fonction | Typé | Total |
|---------|-------|----------|------|-------|
| app/services/payment.py | 34 | `process_payment` | 2/4 | 50% |
| app/services/email.py | 56 | `send_email` | 3/5 | 60% |
| app/crud/user.py | 78 | `search_users` | 4/6 | 67% |

──────────────────────────────────────────────────────────────
🔍 ERREURS MYPY
──────────────────────────────────────────────────────────────

Total : 23 erreurs

### Par type d'erreur
| Code | Description | Occurrences |
|------|-------------|-------------|
| arg-type | Argument de type incorrect | 8 |
| return-value | Valeur de retour incorrecte | 6 |
| assignment | Assignation incompatible | 5 |
| attr-defined | Attribut non défini | 4 |

### Erreurs détaillées
```
app/services/user.py:45: error: Argument "id" has incompatible type "str"; expected "int"  [arg-type]
app/crud/product.py:78: error: Incompatible return value type (got "None", expected "Product")  [return-value]
```

──────────────────────────────────────────────────────────────
🔧 CORRECTIONS SUGGÉRÉES
──────────────────────────────────────────────────────────────

### app/utils/helpers.py:15

```python
# Avant
def parse_date(date_str):
    ...

# Après
def parse_date(date_str: str) -> datetime | None:
    ...
```

### app/utils/helpers.py:28

```python
# Avant
def format_currency(amount, currency="EUR"):
    ...

# Après
def format_currency(
    amount: Decimal | float,
    currency: str = "EUR",
) -> str:
    ...
```

──────────────────────────────────────────────────────────────
📋 COMMANDES
──────────────────────────────────────────────────────────────

# Lancer mypy
mypy app/ --strict

# Générer rapport HTML
mypy app/ --html-report coverage-html/

# Vérifier un module spécifique
mypy app/utils/ --strict

# Ignorer temporairement (à utiliser avec parcimonie)
mypy app/ --ignore-missing-imports

──────────────────────────────────────────────────────────────
🎯 PRIORITÉS
──────────────────────────────────────────────────────────────

1. [ ] Typer app/utils/ (23.8% → 80%+)
2. [ ] Compléter app/models/ (71.4% → 90%+)
3. [ ] Corriger les 23 erreurs mypy
4. [ ] Ajouter plugin mypy pour SQLAlchemy
5. [ ] Configurer pre-commit hook mypy
```

### Étape 6 : Configuration CI/CD

```yaml
# .github/workflows/type-check.yml
name: Type Check

on: [push, pull_request]

jobs:
  mypy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          pip install mypy
          pip install -r requirements.txt

      - name: Run mypy
        run: mypy app/ --strict

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: type-coverage
          path: type-coverage-html/
```
