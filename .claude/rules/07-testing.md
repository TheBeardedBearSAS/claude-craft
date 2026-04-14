# Testing TDD/BDD — Quick Reference

Le TDD et le BDD sont **obligatoires**. Couverture >= 80%.

## Pyramide des tests

| Type | % | Temps | Quand |
|------|---|-------|-------|
| Unit | 70% | < 1s chacun | Chaque commit |
| Integration | 20% | < 5s chacun | Chaque PR |
| E2E | 10% | < 30s chacun | Avant deploy |

## TDD — Red → Green → Refactor

1. **RED** : Ecrire un test qui echoue (definir le comportement attendu)
2. **GREEN** : Code minimal pour passer (pas d'optimisation)
3. **REFACTOR** : Ameliorer (tests doivent toujours passer)

## BDD — Given/When/Then

Format Gherkin pour les user stories. Documentation vivante, langage commun dev + metier.

## Bonnes pratiques

- **AAA** : Arrange-Act-Assert dans chaque test
- **Nommage** : `test "calculateTotal returns zero for empty cart"`
- **Independants** : Chaque test cree ses propres donnees (factories)
- **Pas d'implementation** : Tester WHAT (comportement), pas HOW (implementation)

## Anti-patterns

- Tests qui testent l'implementation (mocks excessifs)
- Tests flaky (injecter le temps, pas de sleep)
- Tests commentes → corriger ou supprimer
- Tests sans assertions

## Bug fix = test de regression

1. Test qui reproduit le bug (echoue avant fix)
2. Fix implemente
3. Test passe apres fix

> Details complets et exemples : `@.claude/references/base/testing.md`
