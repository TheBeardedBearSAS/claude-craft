# Testing - Principes TDD/BDD

## Vue d'ensemble

Le **Test-Driven Development (TDD)** et le **Behavior-Driven Development (BDD)** sont des pratiques **obligatoires** pour garantir la qualité et la maintenabilité du code.

> **Note:** Ce document présente les principes généraux. Consultez les règles spécifiques à votre technologie pour les outils et frameworks concrets.

**Objectifs:**
- ✅ Couverture de code ≥ 80%
- ✅ Tests rapides (< 10s pour les unitaires)
- ✅ Tests indépendants et reproductibles
- ✅ CI/CD qui bloque si tests échouent

---

## Table des matières

1. [Pyramide des tests](#pyramide-des-tests)
2. [TDD - Test-Driven Development](#tdd---test-driven-development)
3. [BDD - Behavior-Driven Development](#bdd---behavior-driven-development)
4. [Types de tests](#types-de-tests)
5. [Bonnes pratiques](#bonnes-pratiques)
6. [Anti-patterns](#anti-patterns)
7. [Checklist](#checklist)

---

## Pyramide des tests

```
          ┌─────────────┐
          │    E2E      │  ← Peu nombreux (10%)
          │  (UI/API)   │    Lents, fragiles
          ├─────────────┤
          │ Integration │  ← Modérés (20%)
          │   Tests     │    Vérifient les connexions
          ├─────────────┤
          │   Unit      │  ← Nombreux (70%)
          │   Tests     │    Rapides, isolés
          └─────────────┘

Plus on monte, plus c'est lent et coûteux.
Plus on descend, plus c'est rapide et fiable.
```

### Répartition recommandée

| Type | % | Temps | Quand |
|------|---|-------|-------|
| Unit | 70% | < 1s chacun | À chaque commit |
| Integration | 20% | < 5s chacun | À chaque PR |
| E2E | 10% | < 30s chacun | Avant deploy |

---

## TDD - Test-Driven Development

### Le cycle Red-Green-Refactor

```
     ┌─────────────────────────────────────┐
     │                                     │
     ▼                                     │
┌─────────┐    ┌─────────┐    ┌──────────┐│
│   RED   │───▶│  GREEN  │───▶│ REFACTOR ││
│  Test   │    │  Code   │    │ Améliorer││
│ échoue  │    │ passe   │    │          ││
└─────────┘    └─────────┘    └──────────┘│
                                   │      │
                                   └──────┘
```

### Étapes

1. **RED** - Écrire un test qui échoue
   - Définir le comportement attendu
   - Le test DOIT échouer (sinon il ne teste rien)

2. **GREEN** - Écrire le minimum de code pour passer
   - Code le plus simple possible
   - Pas d'optimisation
   - Pas de généralisation

3. **REFACTOR** - Améliorer le code
   - Supprimer la duplication
   - Améliorer la lisibilité
   - Les tests doivent toujours passer

### Exemple TDD

```
// 1. RED - Test qui échoue
test "calculateTotal returns sum of item prices":
  cart = new Cart()
  cart.addItem(Item(price: 10))
  cart.addItem(Item(price: 20))

  assert cart.calculateTotal() == 30
  // ❌ FAIL: method calculateTotal() not defined

// 2. GREEN - Code minimal
class Cart:
  items = []

  addItem(item):
    items.add(item)

  calculateTotal():
    return items.sum(item => item.price)
  // ✅ PASS

// 3. REFACTOR - Améliorer
class Cart:
  items: List<Item> = []

  addItem(item: Item): void
    items.add(item)

  calculateTotal(): Money
    return Money.sum(items.map(i => i.price))
  // ✅ PASS (amélioré avec types)
```

### Règles TDD

1. **Un seul test à la fois**
2. **Le test définit le comportement** (pas l'implémentation)
3. **Code minimal pour passer**
4. **Refactor après chaque GREEN**
5. **Ne jamais ignorer un test qui échoue**

---

## BDD - Behavior-Driven Development

### Format Gherkin

```gherkin
Feature: Shopping Cart
  As a customer
  I want to manage items in my cart
  So that I can purchase them

  Scenario: Add item to cart
    Given I have an empty cart
    When I add a product priced at 29.99€
    Then my cart should contain 1 item
    And the cart total should be 29.99€

  Scenario: Apply discount code
    Given I have a cart with items totaling 100€
    When I apply discount code "SAVE10"
    Then the cart total should be 90€
```

### Structure Given-When-Then

| Keyword | Purpose | Example |
|---------|---------|---------|
| **Given** | Contexte initial | "Given I am logged in" |
| **When** | Action | "When I click submit" |
| **Then** | Résultat attendu | "Then I see success message" |
| **And** | Continuation | "And I receive an email" |
| **But** | Exception | "But I don't see errors" |

### Avantages BDD

- ✅ Documentation vivante
- ✅ Langage commun (dev + métier)
- ✅ Tests lisibles par non-techniciens
- ✅ Focus sur le comportement, pas l'implémentation

---

## Types de tests

### Tests Unitaires

**But:** Tester une unité de code en isolation

```
test "Money can be added":
  a = Money(10, "EUR")
  b = Money(5, "EUR")

  result = a.add(b)

  assert result.amount == 15
  assert result.currency == "EUR"
```

**Caractéristiques:**
- ✅ Rapides (< 1s)
- ✅ Isolés (pas de dépendances externes)
- ✅ Déterministes (même résultat à chaque fois)
- ✅ Indépendants (ordre d'exécution n'importe pas)

### Tests d'Intégration

**But:** Tester l'interaction entre composants

```
test "UserRepository saves and retrieves user":
  repo = UserRepository(database)
  user = User(name: "John")

  repo.save(user)
  retrieved = repo.findByName("John")

  assert retrieved.name == "John"
```

**Caractéristiques:**
- ✅ Testent les connexions (DB, API, files)
- ✅ Utilisent de vraies dépendances ou testcontainers
- ✅ Plus lents que unitaires

### Tests End-to-End (E2E)

**But:** Tester le système complet du point de vue utilisateur

```
test "User can complete purchase":
  browser.goto("/products")
  browser.click("#add-to-cart")
  browser.click("#checkout")
  browser.fill("#email", "test@example.com")
  browser.click("#submit")

  assert browser.text("#confirmation") contains "Order confirmed"
```

**Caractéristiques:**
- ✅ Testent le parcours utilisateur complet
- ⚠️ Lents et fragiles
- ⚠️ À utiliser avec parcimonie

### Tests de Contrat

**But:** Vérifier les contrats entre services

```
test "API returns valid user schema":
  response = api.get("/users/1")

  assert response.status == 200
  assert response.body matches UserSchema
```

---

## Bonnes pratiques

### 1. Arrange-Act-Assert (AAA)

```
test "user can change email":
  // Arrange - Préparer
  user = User(email: "old@test.com")

  // Act - Agir
  user.changeEmail("new@test.com")

  // Assert - Vérifier
  assert user.email == "new@test.com"
```

### 2. Un assert par test (préférence)

```
// ❌ Plusieurs assertions non liées
test "user is valid":
  assert user.email is valid
  assert user.password is strong
  assert user.age > 18

// ✅ Tests séparés
test "user email is valid": ...
test "user password is strong": ...
test "user is adult": ...
```

### 3. Nommage explicite

```
// ❌ Noms vagues
test "test1": ...
test "user test": ...
test "it works": ...

// ✅ Noms descriptifs
test "calculateTotal returns zero for empty cart": ...
test "login fails with invalid credentials": ...
test "email is sent after order confirmation": ...
```

### 4. Tests indépendants

```
// ❌ Tests dépendants
test "create user": ...      // Crée user
test "update user": ...      // Utilise user du test précédent
test "delete user": ...      // Utilise user du test précédent

// ✅ Tests indépendants
test "create user":
  user = createUser()
  assert user.exists

test "update user":
  user = createUser()        // Chaque test crée ses données
  user.update(name: "New")
  assert user.name == "New"
```

### 5. Utiliser des fixtures/factories

```
// ❌ Création manuelle répétée
test "test 1":
  user = User(
    name: "John",
    email: "john@test.com",
    password: "hash123",
    role: "admin",
    // ... 10 autres champs
  )

// ✅ Factory
test "test 1":
  user = UserFactory.create(role: "admin")
```

---

## Anti-patterns

### 1. Tests qui testent l'implémentation

```
// ❌ Teste HOW (implémentation)
test "save calls repository.insert":
  mock = mock(Repository)
  service.save(user)
  verify mock.insert was called once

// ✅ Teste WHAT (comportement)
test "user is persisted":
  service.save(user)
  assert repository.findById(user.id) exists
```

### 2. Tests trop couplés

```
// ❌ Test qui connaît trop de détails internes
test "process order":
  order.process()
  assert order._internalState == "processed"
  assert order._processedAt != null
  assert order._processorId == 123

// ✅ Test via interface publique
test "process order":
  order.process()
  assert order.isProcessed()
```

### 3. Tests flaky (non déterministes)

```
// ❌ Dépend du temps réel
test "expires after 1 hour":
  item.setExpiry(now + 1.hour)
  sleep(1.hour)              // ❌ Lent et fragile
  assert item.isExpired()

// ✅ Inject time
test "expires after 1 hour":
  clock = FakeClock()
  item.setExpiry(clock.now + 1.hour)
  clock.advance(1.hour)
  assert item.isExpired()
```

### 4. Tests commentés

```
// ❌ JAMAIS
// test "broken test":
//   ...

// ✅ Corriger ou supprimer
// Si temporairement désactivé: skip("reason")
```

### 5. Tests sans assertions

```
// ❌ Ne teste rien
test "create user":
  service.createUser(data)
  // Pas d'assert !

// ✅ Vérifier le résultat
test "create user":
  user = service.createUser(data)
  assert user.id != null
  assert user.email == data.email
```

---

## Checklist

### Avant chaque commit

- [ ] Tous les tests passent
- [ ] Nouveaux tests pour nouveau code
- [ ] Couverture ≥ 80%
- [ ] Tests rapides (< 10s total pour unitaires)
- [ ] Pas de tests commentés
- [ ] Noms de tests explicites

### Pour chaque nouvelle fonctionnalité

- [ ] Tests unitaires pour la logique métier
- [ ] Tests d'intégration pour les connexions externes
- [ ] Scénarios BDD pour les user stories
- [ ] Tests de edge cases

### Pour chaque bug fix

- [ ] Test qui reproduit le bug (échoue avant fix)
- [ ] Fix implémenté
- [ ] Test passe après fix
- [ ] Test de régression ajouté

### Métriques

| Métrique | Cible | Minimum |
|----------|-------|---------|
| Couverture lignes | > 85% | > 80% |
| Couverture branches | > 80% | > 75% |
| Tests unitaires | < 1s chacun | < 2s |
| Suite complète | < 5min | < 10min |
| Tests flaky | 0 | < 1% |

---

## Ressources

- **Livre:** *Test-Driven Development* - Kent Beck
- **Livre:** *Growing Object-Oriented Software, Guided by Tests* - Freeman & Pryce
- **Livre:** *The Art of Unit Testing* - Roy Osherove
- **Article:** [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

**Date de dernière mise à jour:** 2025-01
**Version:** 1.0.0
**Auteur:** The Bearded CTO
