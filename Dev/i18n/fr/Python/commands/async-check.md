# Vérification Patterns Async Python

Tu es un expert Python asyncio. Tu dois vérifier l'utilisation correcte des patterns async/await, identifier les anti-patterns et les problèmes de concurrence.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Chemin vers un module spécifique

Exemple : `/python:async-check app/services/`

## MISSION

### Étape 1 : Analyser le Code Async

```bash
# Rechercher les fonctions async
grep -rn "async def" app/ --include="*.py"

# Rechercher les await
grep -rn "await " app/ --include="*.py"

# Rechercher asyncio.run (potentiel problème)
grep -rn "asyncio.run" app/ --include="*.py"

# Rechercher les .result() sur futures (blocking)
grep -rn "\.result()" app/ --include="*.py"
```

### Étape 2 : Anti-Patterns Courants

#### 1. Blocking dans Async

```python
# ❌ MAUVAIS - Bloque l'event loop
async def get_data():
    response = requests.get("https://api.example.com")  # BLOCKING!
    return response.json()

# ✅ BON - Non-bloquant
async def get_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com")
        return response.json()
```

#### 2. Sync Sleep dans Async

```python
# ❌ MAUVAIS - Bloque l'event loop
async def slow_task():
    time.sleep(5)  # BLOCKING!
    return "done"

# ✅ BON - Non-bloquant
async def slow_task():
    await asyncio.sleep(5)
    return "done"
```

#### 3. Await dans une Boucle (N+1)

```python
# ❌ MAUVAIS - Séquentiel, lent
async def fetch_all_users(user_ids: list[int]) -> list[User]:
    users = []
    for user_id in user_ids:
        user = await fetch_user(user_id)  # N requêtes séquentielles
        users.append(user)
    return users

# ✅ BON - Concurrent
async def fetch_all_users(user_ids: list[int]) -> list[User]:
    tasks = [fetch_user(user_id) for user_id in user_ids]
    users = await asyncio.gather(*tasks)
    return list(users)

# ✅ ENCORE MIEUX - Avec limite de concurrence
async def fetch_all_users(user_ids: list[int], max_concurrent: int = 10) -> list[User]:
    semaphore = asyncio.Semaphore(max_concurrent)

    async def fetch_with_limit(user_id: int) -> User:
        async with semaphore:
            return await fetch_user(user_id)

    tasks = [fetch_with_limit(user_id) for user_id in user_ids]
    users = await asyncio.gather(*tasks)
    return list(users)
```

#### 4. Oublier await

```python
# ❌ MAUVAIS - Coroutine jamais exécutée
async def process():
    fetch_data()  # RuntimeWarning: coroutine was never awaited
    do_something()

# ✅ BON
async def process():
    await fetch_data()
    do_something()
```

#### 5. asyncio.run() Imbriqué

```python
# ❌ MAUVAIS - Erreur "cannot be called from a running event loop"
async def outer():
    result = asyncio.run(inner())  # ERREUR!
    return result

# ✅ BON
async def outer():
    result = await inner()
    return result
```

#### 6. Pas de Gestion d'Erreur sur gather()

```python
# ❌ MAUVAIS - Une erreur fait échouer tout
async def fetch_all():
    results = await asyncio.gather(
        fetch_a(),
        fetch_b(),
        fetch_c(),
    )
    return results

# ✅ BON - Gestion individuelle des erreurs
async def fetch_all():
    results = await asyncio.gather(
        fetch_a(),
        fetch_b(),
        fetch_c(),
        return_exceptions=True,
    )

    # Filtrer les erreurs
    successes = [r for r in results if not isinstance(r, Exception)]
    errors = [r for r in results if isinstance(r, Exception)]

    if errors:
        logger.warning(f"Some requests failed: {errors}")

    return successes
```

#### 7. Task Non Référencée (Fire and Forget mal fait)

```python
# ❌ MAUVAIS - La task peut être garbage collected
async def handler():
    asyncio.create_task(background_job())  # Peut disparaître!
    return "ok"

# ✅ BON - Garder une référence
background_tasks: set[asyncio.Task] = set()

async def handler():
    task = asyncio.create_task(background_job())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)
    return "ok"
```

### Étape 3 : Patterns Recommandés

#### Context Manager Async

```python
class AsyncDatabaseConnection:
    async def __aenter__(self) -> Self:
        self.conn = await asyncpg.connect(...)
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        await self.conn.close()

# Usage
async with AsyncDatabaseConnection() as db:
    result = await db.conn.fetch("SELECT * FROM users")
```

#### Iterator Async

```python
class AsyncDataFetcher:
    def __init__(self, urls: list[str]):
        self.urls = urls
        self.index = 0

    def __aiter__(self) -> Self:
        return self

    async def __anext__(self) -> dict:
        if self.index >= len(self.urls):
            raise StopAsyncIteration

        url = self.urls[self.index]
        self.index += 1

        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            return response.json()

# Usage
async for data in AsyncDataFetcher(urls):
    process(data)
```

#### Timeout

```python
async def fetch_with_timeout(url: str, timeout: float = 30.0) -> dict:
    try:
        async with asyncio.timeout(timeout):
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                return response.json()
    except asyncio.TimeoutError:
        logger.error(f"Timeout fetching {url}")
        raise
```

#### Retry avec Backoff Exponentiel

```python
async def fetch_with_retry(
    url: str,
    max_retries: int = 3,
    base_delay: float = 1.0,
) -> dict:
    last_exception: Exception | None = None

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            last_exception = e
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)  # 1, 2, 4, 8...
                await asyncio.sleep(delay)

    raise last_exception
```

### Étape 4 : Script d'Analyse

```python
# scripts/async_analyzer.py
"""Analyse les patterns async dans le code."""

import ast
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Generator


@dataclass
class AsyncIssue:
    file: str
    line: int
    severity: str  # error, warning, info
    code: str
    message: str


class AsyncAnalyzer(ast.NodeVisitor):
    """Analyseur de code async."""

    BLOCKING_CALLS = {
        'time.sleep',
        'requests.get',
        'requests.post',
        'requests.put',
        'requests.delete',
        'requests.patch',
        'open',
        'subprocess.run',
        'subprocess.call',
    }

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.issues: list[AsyncIssue] = []
        self._in_async_function = False

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        self._in_async_function = True
        self.generic_visit(node)
        self._in_async_function = False

    def visit_Call(self, node: ast.Call) -> None:
        if self._in_async_function:
            # Vérifier les appels bloquants
            call_name = self._get_call_name(node)
            if call_name in self.BLOCKING_CALLS:
                self.issues.append(AsyncIssue(
                    file=self.file_path,
                    line=node.lineno,
                    severity="error",
                    code="ASYNC001",
                    message=f"Blocking call '{call_name}' in async function",
                ))

            # Vérifier asyncio.run dans async
            if call_name == 'asyncio.run':
                self.issues.append(AsyncIssue(
                    file=self.file_path,
                    line=node.lineno,
                    severity="error",
                    code="ASYNC002",
                    message="asyncio.run() cannot be called from async context",
                ))

        self.generic_visit(node)

    def visit_For(self, node: ast.For) -> None:
        if self._in_async_function:
            # Vérifier await dans boucle for
            for child in ast.walk(node):
                if isinstance(child, ast.Await):
                    self.issues.append(AsyncIssue(
                        file=self.file_path,
                        line=node.lineno,
                        severity="warning",
                        code="ASYNC003",
                        message="Sequential await in loop - consider asyncio.gather()",
                    ))
                    break

        self.generic_visit(node)

    def _get_call_name(self, node: ast.Call) -> str:
        if isinstance(node.func, ast.Name):
            return node.func.id
        elif isinstance(node.func, ast.Attribute):
            parts = []
            current = node.func
            while isinstance(current, ast.Attribute):
                parts.append(current.attr)
                current = current.value
            if isinstance(current, ast.Name):
                parts.append(current.id)
            return '.'.join(reversed(parts))
        return ""


def analyze_file(file_path: Path) -> list[AsyncIssue]:
    """Analyse un fichier."""
    with open(file_path, 'r', encoding='utf-8') as f:
        source = f.read()

    try:
        tree = ast.parse(source)
    except SyntaxError:
        return []

    analyzer = AsyncAnalyzer(str(file_path))
    analyzer.visit(tree)

    return analyzer.issues


def main(target_path: str) -> int:
    """Point d'entrée."""
    target = Path(target_path)
    all_issues: list[AsyncIssue] = []

    if target.is_file():
        all_issues.extend(analyze_file(target))
    else:
        for py_file in target.rglob('*.py'):
            if '__pycache__' not in str(py_file):
                all_issues.extend(analyze_file(py_file))

    # Afficher les résultats
    for issue in sorted(all_issues, key=lambda x: (x.file, x.line)):
        print(f"{issue.file}:{issue.line}: [{issue.code}] {issue.message}")

    errors = [i for i in all_issues if i.severity == "error"]
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else 'app/'))
```

### Étape 5 : Générer le Rapport

```
══════════════════════════════════════════════════════════════
🔄 RAPPORT ANALYSE ASYNC
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 RÉSUMÉ
──────────────────────────────────────────────────────────────

| Catégorie | Nombre |
|-----------|--------|
| Fonctions async | 45 |
| Erreurs | 8 |
| Warnings | 12 |
| Info | 5 |

──────────────────────────────────────────────────────────────
❌ ERREURS CRITIQUES
──────────────────────────────────────────────────────────────

### ASYNC001 - Appels Bloquants

| Fichier | Ligne | Appel |
|---------|-------|-------|
| app/services/external.py | 45 | `requests.get()` |
| app/services/external.py | 67 | `requests.post()` |
| app/utils/files.py | 23 | `open()` |
| app/tasks/report.py | 89 | `time.sleep()` |

**Correction** : Utiliser les alternatives async :
- `requests` → `httpx` ou `aiohttp`
- `open()` → `aiofiles`
- `time.sleep()` → `asyncio.sleep()`

### ASYNC002 - asyncio.run() dans Async

| Fichier | Ligne |
|---------|-------|
| app/services/worker.py | 34 |

**Correction** : Utiliser `await` directement

──────────────────────────────────────────────────────────────
⚠️ WARNINGS
──────────────────────────────────────────────────────────────

### ASYNC003 - Await Séquentiel dans Boucle

| Fichier | Ligne | Impact |
|---------|-------|--------|
| app/services/batch.py | 56 | N requêtes séquentielles |
| app/services/sync.py | 78 | Lenteur x10 |
| app/crud/bulk.py | 123 | Performance dégradée |

**Correction** : Utiliser `asyncio.gather()`

```python
# Avant (séquentiel)
for item in items:
    result = await process(item)

# Après (concurrent)
results = await asyncio.gather(*[process(item) for item in items])
```

### ASYNC004 - Task Non Référencée

| Fichier | Ligne |
|---------|-------|
| app/api/webhooks.py | 45 |
| app/services/notifications.py | 89 |

**Correction** : Garder une référence aux tasks

──────────────────────────────────────────────────────────────
ℹ️ INFORMATIONS
──────────────────────────────────────────────────────────────

### ASYNC005 - gather() sans return_exceptions

| Fichier | Ligne |
|---------|-------|
| app/services/multi.py | 34 |
| app/tasks/parallel.py | 67 |

**Suggestion** : Ajouter `return_exceptions=True` pour une meilleure gestion d'erreurs

──────────────────────────────────────────────────────────────
✅ BONNES PRATIQUES DÉTECTÉES
──────────────────────────────────────────────────────────────

| Pattern | Occurrences | Fichiers |
|---------|-------------|----------|
| asyncio.gather() | 12 | services/, tasks/ |
| async context manager | 8 | db/, cache/ |
| Semaphore pour limiter | 3 | services/ |
| Timeout explicite | 6 | api/, services/ |

──────────────────────────────────────────────────────────────
🔧 COMMANDES DE CORRECTION
──────────────────────────────────────────────────────────────

# Remplacer requests par httpx
pip install httpx
# Puis chercher/remplacer

# Remplacer open() par aiofiles
pip install aiofiles

# Lancer l'analyse
python scripts/async_analyzer.py app/

──────────────────────────────────────────────────────────────
🎯 PRIORITÉS
──────────────────────────────────────────────────────────────

1. [ ] Corriger les 4 appels bloquants (CRITIQUE)
2. [ ] Corriger asyncio.run() imbriqué (CRITIQUE)
3. [ ] Optimiser les 3 boucles avec await (PERF)
4. [ ] Ajouter références aux tasks fire-and-forget
5. [ ] Ajouter return_exceptions aux gather()
```

### Étape 6 : Configuration Ruff pour Async

```toml
# pyproject.toml
[tool.ruff.lint]
select = [
    "ASYNC",  # flake8-async rules
]

[tool.ruff.lint.flake8-async]
# Configuration spécifique async
```

### Configuration Pre-commit

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: async-check
        name: Check async patterns
        entry: python scripts/async_analyzer.py
        language: system
        types: [python]
        pass_filenames: false
```
