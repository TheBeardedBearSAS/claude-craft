---
name: testing-python
description: Stratégie de Tests Python 3.14+. Use when writing tests, reviewing test coverage, or setting up testing.
context: fork
---

# Stratégie de Tests Python 3.14+

**Versions :** Python 3.14+ | pytest 8.x | Ruff 0.8+ | mypy 1.13+ | Playwright

Ruff remplace Black + isort + Flake8 (10-100x plus rapide). mypy strict élimine les bugs de type à la compilation.

## Stack recommandée 2026

| Type | Outil | Usage |
|------|-------|-------|
| **Unit/Integration** | **pytest 8.x** | Tests backend FastAPI/Django |
| **Linting + Format** | **Ruff 0.8+** | 10-100× plus rapide que Black+Flake8 |
| **Type checking** | **mypy 1.13+** strict | Vérification statique |
| **E2E/Browser** | **Playwright** | Tests frontend web |
| **Mutation** | **Mutmut** | Qualité des tests (score >= 80%) |
| **Property-based** | **Hypothesis** | Génération de cas de test automatique |

**Sources :** [pytest](https://docs.pytest.org/), [Ruff](https://docs.astral.sh/ruff/), [Mutmut](https://mutmut.readthedocs.io/)

## Invariants non-négociables

- Couverture >= 80% (`--cov-fail-under=80` dans `pyproject.toml`)
- mypy strict — zéro `Any` non justifié, `disallow_untyped_defs = true`
- Ruff obligatoire (check + format) dans CI
- Pattern AAA (Arrange-Act-Assert) dans chaque test
- Fixtures pytest pour l'injection de dépendances (pas d'état global)
- Mutation score >= 80% via Mutmut

## Checklist par type

| Type | Vérification |
|------|-------------|
| Unit | Isolation totale, fixtures pytest, mocks `unittest.mock` |
| Integration | `TestClient` FastAPI / `Client` Django, DB de test |
| E2E | Playwright sync_api, `expect()` assertions |
| Property | Hypothesis `@given` pour edge cases automatiques |
| Mutation | `mutmut run`, score >= 80 avant merge |

> Détails complets, exemples de code, configs et checklists : voir [REFERENCE.md](./REFERENCE.md)
