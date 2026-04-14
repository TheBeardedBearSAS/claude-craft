# Testing TDD/BDD — Quick Reference

Le TDD et le BDD sont **obligatoires**. Couverture >= 80%.

## Pyramide des tests

| Type | % | Temps | Quand |
|------|---|-------|-------|
| Unit | 70% | < 1s chacun | Chaque commit |
| Integration | 20% | < 5s chacun | Chaque PR |
| E2E | 10% | < 30s chacun | Avant deploy |

## TDD — Red → Green → Refactor

1. **RED** : Écrire un test qui échoue (définir le comportement attendu)
2. **GREEN** : Code minimal pour passer (pas d'optimisation)
3. **REFACTOR** : Améliorer (tests doivent toujours passer)

## BDD — Given/When/Then

Format Gherkin pour les user stories. Documentation vivante, langage commun dev + métier.

## Bonnes pratiques

- **AAA** : Arrange-Act-Assert dans chaque test
- **Nommage** : `test "calculateTotal returns zero for empty cart"`
- **Indépendants** : Chaque test crée ses propres données (factories)
- **Pas d'implémentation** : Tester WHAT (comportement), pas HOW (implémentation)

## Outils 2026

| Stack | Unit/Composants | E2E/Browser |
|-------|-----------------|-------------|
| **JS/TS/React** | **Vitest 4.1+** (Browser Mode stable) | **Playwright** |
| **PHP** | **Pest 4.5+** (PHPUnit 12, Browser Testing intégré) | Playwright via Pest |
| **Python** | **pytest 8.x** + **Ruff 0.8+** (linting+format) | Playwright |

**Sources :** [Vitest 4](https://vitest.dev/blog/vitest-4), [Pest 4](https://pestphp.com/docs/pest-v4-is-here-now-with-browser-testing)

## Stratégies 2026

- **Vitest Browser Mode** (Chromium/Firefox/WebKit) — abandonner JSDOM lourd
- **Vitest workspaces** pour monorepos (unit/browser séparés)
- **Playwright component testing** — alternative supérieure à React Testing Library
- **Mutation testing** : **Stryker** (JS/TS/C#), **Infection** (PHP), **Mutmut** (Python) — "coverage ment, mutation scores disent la vérité" ([Stryker Mutator](https://stryker-mutator.io/))
- **Property-based testing** : **fast-check** (JS), **Hypothesis** (Python)

## Anti-patterns

- Tests qui testent l'implémentation (mocks excessifs)
- Tests flaky (injecter le temps, pas de sleep)
- Tests commentés → corriger ou supprimer
- Tests sans assertions
- Couverture 100% sans mutation testing (faux sentiment de sécurité)

## Bug fix = test de régression

1. Test qui reproduit le bug (échoue avant fix)
2. Fix implémenté
3. Test passe après fix

> Détails complets et exemples : `@.claude/references/base/testing.md`
