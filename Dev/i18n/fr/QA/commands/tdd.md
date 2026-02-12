---
description: Correction de Bug en Mode TDD/BDD
argument-hint: [arguments]
---

# Correction de Bug en Mode TDD/BDD

Tu es un développeur senior expert en TDD (Test-Driven Development) et BDD (Behavior-Driven Development). Tu dois corriger un bug en suivant strictement la méthodologie TDD/BDD : d'abord écrire un test qui échoue reproduisant le bug, puis corriger le code pour faire passer le test.

## Arguments
$ARGUMENTS

Arguments :
- Description du bug ou lien vers le ticket
- (Optionnel) Fichier ou module concerné

Exemple : `/common:fix-bug-tdd "L'utilisateur ne peut pas se déconnecter"` ou `/common:fix-bug-tdd #123`

## MISSION

### Philosophie TDD/BDD

```
RED → GREEN → REFACTOR

1. RED    : Écrire un test qui échoue (reproduit le bug)
2. GREEN  : Écrire le minimum de code pour faire passer le test
3. REFACTOR : Améliorer le code sans casser les tests
```

### Étape 1 : Comprendre le Bug

#### Collecter les informations
- Description précise du comportement actuel
- Comportement attendu
- Étapes de reproduction
- Environnement concerné
- Logs/stack traces disponibles

#### Questions à se poser
1. Quel est le comportement actuel ?
2. Quel devrait être le comportement correct ?
3. Quand le bug a-t-il été introduit ? (git bisect si nécessaire)
4. Quels sont les cas limites ?
5. Y a-t-il des tests existants qui auraient dû catcher ce bug ?

### Étape 2 : RED - Écrire le Test qui Échoue

#### Format BDD (Gherkin-style)

```gherkin
Feature: [Fonctionnalité concernée]
  En tant que [type d'utilisateur]
  Je veux [action]
  Afin de [bénéfice]

  Scenario: [Description du cas de bug]
    Given [contexte/état initial]
    When [action qui déclenche le bug]
    Then [comportement attendu qui ne se produit pas actuellement]
```

#### Test Unitaire

```python
# Python - pytest
class TestBugFix:
    """
    Bug: [Description courte]
    Ticket: #XXX

    Comportement actuel: [ce qui se passe]
    Comportement attendu: [ce qui devrait se passer]
    """

    def test_should_[expected_behavior]_when_[condition](self):
        # Arrange - Préparer le contexte
        # ...

        # Act - Exécuter l'action qui cause le bug
        # ...

        # Assert - Vérifier le comportement attendu
        # Ce test DOIT échouer avant le fix
        assert result == expected_value
```

```typescript
// TypeScript - Jest
describe('Bug #XXX: [Description]', () => {
  /**
   * Comportement actuel: [ce qui se passe]
   * Comportement attendu: [ce qui devrait se passer]
   */
  it('should [expected behavior] when [condition]', () => {
    // Arrange
    const input = prepareTestData();

    // Act
    const result = functionUnderTest(input);

    // Assert - Ce test DOIT échouer avant le fix
    expect(result).toBe(expectedValue);
  });
});
```

```php
// PHP - PHPUnit
/**
 * @testdox Bug #XXX: [Description du bug]
 */
class BugFixTest extends TestCase
{
    /**
     * Comportement actuel: [ce qui se passe]
     * Comportement attendu: [ce qui devrait se passer]
     *
     * @test
     */
    public function it_should_expected_behavior_when_condition(): void
    {
        // Arrange
        $input = $this->prepareTestData();

        // Act
        $result = $this->service->methodUnderTest($input);

        // Assert - Ce test DOIT échouer avant le fix
        $this->assertEquals($expectedValue, $result);
    }
}
```

```dart
// Dart - Flutter test
group('Bug #XXX: [Description]', () {
  /// Comportement actuel: [ce qui se passe]
  /// Comportement attendu: [ce qui devrait se passe]
  test('should [expected behavior] when [condition]', () {
    // Arrange
    final input = prepareTestData();

    // Act
    final result = functionUnderTest(input);

    // Assert - Ce test DOIT échouer avant le fix
    expect(result, equals(expectedValue));
  });
});
```

### Étape 3 : Vérifier que le Test Échoue

```bash
# Lancer le test spécifique
# Python
pytest tests/test_bug_xxx.py -v

# JavaScript/TypeScript
npm test -- --testPathPattern="bug-xxx"

# PHP
./vendor/bin/phpunit --filter "it_should_expected_behavior"

# Flutter
flutter test test/bug_xxx_test.dart
```

**IMPORTANT** : Le test DOIT échouer à ce stade. Si le test passe, c'est que :
- Le test ne reproduit pas correctement le bug
- Le bug a déjà été corrigé
- Le test est mal écrit

### Étape 4 : GREEN - Corriger le Bug (Minimum de Code)

#### Principes
1. Écrire le MINIMUM de code pour faire passer le test
2. Ne pas anticiper d'autres cas
3. Ne pas refactorer encore
4. Garder le code simple

#### Processus
1. Identifier la cause racine
2. Implémenter la correction minimale
3. Relancer le test
4. S'assurer que le test passe

```bash
# Relancer le test après correction
# Le test DOIT maintenant passer
```

### Étape 5 : Vérifier la Non-Régression

```bash
# Lancer TOUS les tests existants
# Python
pytest

# JavaScript/TypeScript
npm test

# PHP
./vendor/bin/phpunit

# Flutter
flutter test

# TOUS les tests doivent passer
```

### Étape 6 : REFACTOR - Améliorer le Code

#### Checklist Refactoring
- [ ] Le code est-il lisible ?
- [ ] Y a-t-il de la duplication ?
- [ ] Les noms sont-ils explicites ?
- [ ] La fonction fait-elle une seule chose ?
- [ ] Le code respecte-t-il les conventions du projet ?

#### Après chaque modification
```bash
# Relancer les tests après chaque refactoring
# Les tests doivent toujours passer
```

### Étape 7 : Ajouter des Tests Complémentaires

#### Cas limites à couvrir
```python
class TestBugFixEdgeCases:
    """Tests complémentaires pour les cas limites."""

    def test_with_empty_input(self):
        """Vérifie le comportement avec entrée vide."""
        pass

    def test_with_null_input(self):
        """Vérifie le comportement avec null."""
        pass

    def test_with_maximum_values(self):
        """Vérifie le comportement aux limites."""
        pass

    def test_with_special_characters(self):
        """Vérifie le comportement avec caractères spéciaux."""
        pass
```

### Étape 8 : Documentation

#### Commentaire dans le test
```python
def test_logout_clears_session_bug_123(self):
    """
    Regression test for bug #123.

    Problem: User session was not cleared on logout, allowing
             access to protected resources after logout.

    Root cause: Session.destroy() was not called in logout handler.

    Fix: Added Session.destroy() call before redirect.

    Date: 2024-01-15
    Author: developer@example.com
    """
```

#### Message de commit
```
fix(auth): clear session on logout (#123)

- Add regression test for logout bug
- Call Session.destroy() in logout handler
- Verify session is cleared before redirect

Fixes #123
```

### Rapport Final

```
══════════════════════════════════════════════════════════════
🐛 BUG FIX REPORT - TDD/BDD
══════════════════════════════════════════════════════════════

Ticket: #XXX
Description: [Description du bug]

──────────────────────────────────────────────────────────────
📋 ANALYSE
──────────────────────────────────────────────────────────────

Comportement actuel:
[Ce qui se passait]

Comportement attendu:
[Ce qui devrait se passer]

Cause racine:
[Pourquoi le bug se produisait]

──────────────────────────────────────────────────────────────
🔴 TEST ÉCRIT (RED)
──────────────────────────────────────────────────────────────

Fichier: tests/test_xxx.py
Test: test_should_xxx_when_yyy

```python
def test_should_xxx_when_yyy(self):
    # ... code du test
```

Résultat initial: ❌ FAIL
Message: AssertionError: expected X but got Y

──────────────────────────────────────────────────────────────
🟢 CORRECTION (GREEN)
──────────────────────────────────────────────────────────────

Fichier modifié: src/module/file.py
Lignes: 45-52

```python
# Avant
def problematic_function():
    # code bugué

# Après
def problematic_function():
    # code corrigé
```

Résultat après fix: ✅ PASS

──────────────────────────────────────────────────────────────
♻️ REFACTORING
──────────────────────────────────────────────────────────────

- [x] Code simplifié
- [x] Variable renommée pour clarté
- [x] Duplication supprimée

──────────────────────────────────────────────────────────────
✅ TESTS
──────────────────────────────────────────────────────────────

| Test | Status |
|------|--------|
| test_should_xxx_when_yyy (nouveau) | ✅ |
| test_existing_1 | ✅ |
| test_existing_2 | ✅ |
| ... | ✅ |

Total: XX tests, 0 failures

──────────────────────────────────────────────────────────────
📝 COMMIT
──────────────────────────────────────────────────────────────

```
fix(module): description courte (#XXX)

- Add regression test
- Fix root cause
- Add edge case tests

Fixes #XXX
```

──────────────────────────────────────────────────────────────
🎯 ACTIONS POST-FIX
──────────────────────────────────────────────────────────────

- [ ] PR créée
- [ ] Code review demandée
- [ ] Documentation mise à jour
- [ ] Ticket fermé
```
