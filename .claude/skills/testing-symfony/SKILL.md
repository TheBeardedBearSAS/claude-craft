---
name: testing-symfony
description: Stratégie de Tests Symfony 8.1 / PHP 8.5. Use when writing tests, reviewing test coverage, or setting up testing.
context: fork
---

# Stratégie de Tests Symfony 8.1 / PHP 8.5

**Versions :** Symfony 8.1+ | PHP 8.5 | Pest 4.5+ | PHPUnit 12 | Playwright

Abandonner Panther (lourd) et Behat (verbeux) — Pest 4 intègre tout nativement.

## Stack recommandée 2026

| Type | Outil | Usage |
|------|-------|-------|
| **Unit/Integration** | **Pest 4.5+** (PHPUnit 12, arch tests) | Tests backend Symfony |
| **Browser/E2E** | **Pest 4 Browser Testing** (Playwright natif) | Tests frontend intégrés |
| **Mutation** | **Infection** | Qualité des tests (MSI >= 80%) |
| **Static Analysis** | **PHPStan Level 10** | Vérification statique |

**Sources :** [Pest 4](https://pestphp.com/docs/pest-v4-is-here-now-with-browser-testing), [Infection](https://infection.github.io/)

## Invariants non-négociables

- Couverture >= 80% (line + branch)
- Mutation Score Indicator (MSI) >= 80% via Infection
- PHPStan Level 10 — aucun `mixed` non justifié
- Arch tests : domain indépendant de l'infrastructure
- Fixtures via `doctrine/data-fixtures` — pas de données hard-codées
- Pattern AAA (Arrange-Act-Assert) dans chaque test
- Tests browser dans `tests/Browser/`, unit dans `tests/Unit/`, feature dans `tests/Feature/`

## Checklist par type

| Type | Vérification |
|------|-------------|
| Unit | Isolation totale, pas de DB, mocks Prophecy/Mockery |
| Integration | `KernelTestCase`, fixtures chargées, DB de test |
| Browser | Playwright natif Pest 4, assertions sur l'UI réelle |
| Arch | `pest()->arch()` — namespaces, dépendances, interdictions |
| Mutation | `vendor/bin/infection --threads=4`, MSI >= 80 |

> Détails complets, exemples de code, configs et checklists : voir [REFERENCE.md](./REFERENCE.md)
