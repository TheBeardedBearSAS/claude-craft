---
name: testing-react
description: Stratégie de Tests React 19 + Compiler 1.0. Use when writing tests, reviewing test coverage, or setting up testing.
context: fork
---

# Stratégie de Tests React 19 + Compiler 1.0

**Versions :** React 19.2+ | React Compiler 1.0 | Vitest 4.1+ | Playwright

React Compiler 1.0 (auto-memoization) est transparent pour les tests — tester le comportement visible, jamais les optimisations internes.

## Stack recommandée 2026

| Type | Outil | Usage |
|------|-------|-------|
| **Unit/Composants** | **Vitest 4.1+** Browser Mode | Chromium/Firefox/WebKit natif |
| **Component Testing** | **Playwright CT** | Alternative à RTL — browser réel |
| **E2E** | **Playwright** | Flows utilisateur complets |
| **Mutation** | **Stryker** | Qualité des tests (score >= 80%) |
| **Property-based** | **fast-check** | Génération de cas de test |

Abandonner : JSDOM (lourd, incomplet) et React Testing Library (remplacé par Playwright CT).

**Sources :** [Vitest 4](https://vitest.dev/blog/vitest-4), [Playwright Component Testing](https://playwright.dev/docs/test-components), [Stryker Mutator](https://stryker-mutator.io/)

## Invariants non-négociables

- Vitest Browser Mode (provider: playwright) — pas de JSDOM
- Tester le comportement (ce que voit l'utilisateur), pas l'implémentation
- Ne jamais tester les optimisations du React Compiler (memoization)
- Mutation score >= 80% via Stryker avant merge
- Vitest workspaces pour monorepos (unit / browser séparés)
- MSW pour mocker les appels API (pas de `fetch` mockée à la main)

## Checklist par type

| Type | Vérification |
|------|-------------|
| Composant | Vitest Browser Mode ou Playwright CT, interactions réelles |
| Hook | Vitest, `renderHook` si nécessaire |
| RSC | Test du rendu HTML retourné (pas de DOM) |
| E2E | Playwright, flows complets avec `expect().toHaveURL()` |
| Mutation | `npx stryker run`, seuil break >= 50, high >= 80 |

> Détails complets, exemples de code, configs et checklists : voir [REFERENCE.md](./REFERENCE.md)
