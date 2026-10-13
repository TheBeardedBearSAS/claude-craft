---
name: testing-react
description: Stratégie de Tests React 19 + Compiler 1.0. Use when writing tests, reviewing test coverage, or setting up testing.
context: fork
---

# Stratégie de Tests React 19 + Compiler 1.0

**Versions :** React 19.2+ | React Compiler 1.0 | Vitest 5 | Playwright

React Compiler 1.0 (auto-memoization) est transparent pour les tests — tester le comportement visible, jamais les optimisations internes.

## Stack recommandée 2026

| Type | Outil | Usage |
|------|-------|-------|
| **Unit/Composants** | **Vitest 5** Browser Mode | Chromium/Firefox/WebKit natif |
| **Composants (navigateur)** | **vitest-browser-react** | `render` + locators, intégré à Vitest Browser Mode |
| **Component Testing** | **Playwright CT** | Alternative à RTL — browser réel |
| **Composants (JSDOM)** | **React Testing Library 16** | Toujours maintenu — pertinent pour les suites JSDOM existantes |
| **E2E** | **Playwright** | Flows utilisateur complets |
| **Mutation** | **Stryker** | Qualité des tests (score >= 80%) |
| **Property-based** | **fast-check** | Génération de cas de test |

Privilégier un vrai navigateur (Vitest Browser Mode, Playwright CT) plutôt que JSDOM (lourd, incomplet). React Testing Library 16 reste maintenu : l'utiliser pour les suites JSDOM existantes, ne pas migrer sans bénéfice.

**Sources :** [Vitest Browser Mode](https://vitest.dev/guide/browser/), [vitest-browser-react](https://github.com/vitest-community/vitest-browser-react), [Playwright Component Testing](https://playwright.dev/docs/test-components), [Stryker Mutator](https://stryker-mutator.io/)

## Invariants non-négociables

- Vitest Browser Mode (provider: playwright) pour les nouveaux tests composants — éviter JSDOM
- Tester le comportement (ce que voit l'utilisateur), pas l'implémentation
- Ne jamais tester les optimisations du React Compiler (memoization)
- Mutation score >= 80% via Stryker avant merge
- Vitest `projects` pour monorepos (unit / browser séparés) — `workspace` est déprécié
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
