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
| **JS/TS/React** | **Vitest 5** (Browser Mode stable) | **Playwright** |
| **PHP** | **Pest 5** (PHPUnit 13, PHP 8.4+, Browser Testing intégré) | Playwright via Pest |
| **Python** | **pytest 9.x** + **Ruff 0.17+** (linting+format) | Playwright |

**Sources :** [Vitest Browser Mode](https://vitest.dev/guide/browser/), [Pest 5 Upgrade Guide](https://v5.pestphp.com/docs/upgrade-guide)

## Stratégies 2026

- **Vitest Browser Mode** (Chromium/Firefox/WebKit) — abandonner JSDOM lourd
- **Vitest `projects`** pour monorepos (unit/browser séparés) — `workspace` est déprécié depuis Vitest 3.2
- **Playwright component testing** ou **vitest-browser-react** (navigateur réel) pour les composants ; React Testing Library 16 / RNTL 14 restent maintenus et valides (JSDOM, React Native)
- **E2E mobile** : **Maestro** (YAML, React Native/Flutter/natif), Detox (RN), Patrol (Flutter)
- **BDD (Gherkin)** : **Cucumber.js** (JS/TS), **Behat** (PHP), **pytest-bdd** (Python)
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
