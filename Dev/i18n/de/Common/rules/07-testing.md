# Testing - TDD/BDD-Prinzipien

## Überblick

**Test-Driven Development (TDD)** und **Behavior-Driven Development (BDD)** sind **obligatorische** Praktiken, um die Qualität und Wartbarkeit des Codes zu gewährleisten.

> **Hinweis:** Dieses Dokument stellt die allgemeinen Prinzipien vor. Konsultieren Sie die technologiespezifischen Regeln für konkrete Tools und Frameworks.

**Ziele:**
- Codeabdeckung >= 80%
- Schnelle Tests (< 10s für Unit-Tests)
- Unabhängige und reproduzierbare Tests
- CI/CD blockiert bei fehlschlagenden Tests

---

## Inhaltsverzeichnis

1. [Testpyramide](#testpyramide)
2. [TDD - Test-Driven Development](#tdd---test-driven-development)
3. [BDD - Behavior-Driven Development](#bdd---behavior-driven-development)
4. [Testtypen](#testtypen)
5. [Best Practices](#best-practices)
6. [Anti-Patterns](#anti-patterns)
7. [Checkliste](#checkliste)

---

## Testpyramide

```
          ┌─────────────┐
          │    E2E      │  ← Wenige (10%)
          │  (UI/API)   │    Langsam, fragil
          ├─────────────┤
          │ Integration │  ← Moderat (20%)
          │   Tests     │    Prüfen die Verbindungen
          ├─────────────┤
          │   Unit      │  ← Zahlreich (70%)
          │   Tests     │    Schnell, isoliert
          └─────────────┘

Je höher, desto langsamer und teurer.
Je tiefer, desto schneller und zuverlässiger.
```

### Empfohlene Verteilung

| Typ | % | Zeit | Wann |
|-----|---|------|------|
| Unit | 70% | < 1s pro Test | Bei jedem Commit |
| Integration | 20% | < 5s pro Test | Bei jedem PR |
| E2E | 10% | < 30s pro Test | Vor dem Deployment |

---

## TDD - Test-Driven Development

### Der Red-Green-Refactor-Zyklus

```
     ┌─────────────────────────────────────┐
     │                                     │
     ▼                                     │
┌─────────┐    ┌─────────┐    ┌──────────┐│
│   RED   │───▶│  GREEN  │───▶│ REFACTOR ││
│  Test   │    │  Code   │    │ Verbessern││
│ schlägt │    │ besteht │    │          ││
│  fehl   │    │         │    │          ││
└─────────┘    └─────────┘    └──────────┘│
                                   │      │
                                   └──────┘
```

### Schritte

1. **RED** - Einen fehlschlagenden Test schreiben
   - Das erwartete Verhalten definieren
   - Der Test MUSS fehlschlagen (sonst testet er nichts)

2. **GREEN** - Das Minimum an Code schreiben, um zu bestehen
   - Einfachster möglicher Code
   - Keine Optimierung
   - Keine Generalisierung

3. **REFACTOR** - Den Code verbessern
   - Duplikation entfernen
   - Lesbarkeit verbessern
   - Tests müssen weiterhin bestehen

### TDD-Beispiel

```
// 1. RED - Fehlschlagender Test
test "calculateTotal returns sum of item prices":
  cart = new Cart()
  cart.addItem(Item(price: 10))
  cart.addItem(Item(price: 20))

  assert cart.calculateTotal() == 30
  // FAIL: method calculateTotal() not defined

// 2. GREEN - Minimaler Code
class Cart:
  items = []

  addItem(item):
    items.add(item)

  calculateTotal():
    return items.sum(item => item.price)
  // PASS

// 3. REFACTOR - Verbessern
class Cart:
  items: List<Item> = []

  addItem(item: Item): void
    items.add(item)

  calculateTotal(): Money
    return Money.sum(items.map(i => i.price))
  // PASS (verbessert mit Typen)
```

### TDD-Regeln

1. **Ein Test nach dem anderen**
2. **Der Test definiert das Verhalten** (nicht die Implementierung)
3. **Minimaler Code zum Bestehen**
4. **Refactor nach jedem GREEN**
5. **Einen fehlschlagenden Test niemals ignorieren**

---

## BDD - Behavior-Driven Development

### Gherkin-Format

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

### Given-When-Then-Struktur

| Schlüsselwort | Zweck | Beispiel |
|---------------|-------|---------|
| **Given** | Anfangskontext | "Given I am logged in" |
| **When** | Aktion | "When I click submit" |
| **Then** | Erwartetes Ergebnis | "Then I see success message" |
| **And** | Fortsetzung | "And I receive an email" |
| **But** | Ausnahme | "But I don't see errors" |

### BDD-Vorteile

- Lebende Dokumentation
- Gemeinsame Sprache (Entwickler + Fachbereich)
- Von Nicht-Technikern lesbare Tests
- Fokus auf Verhalten, nicht auf Implementierung

---

## Testtypen

### Unit-Tests

**Zweck:** Eine Codeeinheit isoliert testen

```
test "Money can be added":
  a = Money(10, "EUR")
  b = Money(5, "EUR")

  result = a.add(b)

  assert result.amount == 15
  assert result.currency == "EUR"
```

**Eigenschaften:**
- Schnell (< 1s)
- Isoliert (keine externen Abhängigkeiten)
- Deterministisch (jedes Mal gleiches Ergebnis)
- Unabhängig (Ausführungsreihenfolge spielt keine Rolle)

### Integrationstests

**Zweck:** Die Interaktion zwischen Komponenten testen

```
test "UserRepository saves and retrieves user":
  repo = UserRepository(database)
  user = User(name: "John")

  repo.save(user)
  retrieved = repo.findByName("John")

  assert retrieved.name == "John"
```

**Eigenschaften:**
- Testen die Verbindungen (DB, API, Dateien)
- Verwenden echte Abhängigkeiten oder Testcontainers
- Langsamer als Unit-Tests

### End-to-End-Tests (E2E)

**Zweck:** Das gesamte System aus Benutzersicht testen

```
test "User can complete purchase":
  browser.goto("/products")
  browser.click("#add-to-cart")
  browser.click("#checkout")
  browser.fill("#email", "test@example.com")
  browser.click("#submit")

  assert browser.text("#confirmation") contains "Order confirmed"
```

**Eigenschaften:**
- Testen den vollständigen Benutzerpfad
- Langsam und fragil
- Sparsam einsetzen

### Vertragstests

**Zweck:** Verträge zwischen Services überprüfen

```
test "API returns valid user schema":
  response = api.get("/users/1")

  assert response.status == 200
  assert response.body matches UserSchema
```

---

## Best Practices

### 1. Arrange-Act-Assert (AAA)

```
test "user can change email":
  // Arrange - Vorbereiten
  user = User(email: "old@test.com")

  // Act - Ausführen
  user.changeEmail("new@test.com")

  // Assert - Prüfen
  assert user.email == "new@test.com"
```

### 2. Ein Assert pro Test (bevorzugt)

```
// Mehrere nicht zusammenhängende Assertions
test "user is valid":
  assert user.email is valid
  assert user.password is strong
  assert user.age > 18

// Getrennte Tests
test "user email is valid": ...
test "user password is strong": ...
test "user is adult": ...
```

### 3. Aussagekräftige Benennung

```
// SCHLECHT - Vage Namen
test "test1": ...
test "user test": ...
test "it works": ...

// GUT - Beschreibende Namen
test "calculateTotal returns zero for empty cart": ...
test "login fails with invalid credentials": ...
test "email is sent after order confirmation": ...
```

### 4. Unabhängige Tests

```
// SCHLECHT - Abhängige Tests
test "create user": ...      // Erstellt Benutzer
test "update user": ...      // Verwendet Benutzer aus vorherigem Test
test "delete user": ...      // Verwendet Benutzer aus vorherigem Test

// GUT - Unabhängige Tests
test "create user":
  user = createUser()
  assert user.exists

test "update user":
  user = createUser()        // Jeder Test erstellt seine Daten
  user.update(name: "New")
  assert user.name == "New"
```

### 5. Fixtures/Factories verwenden

```
// SCHLECHT - Wiederholte manuelle Erstellung
test "test 1":
  user = User(
    name: "John",
    email: "john@test.com",
    password: "hash123",
    role: "admin",
    // ... 10 weitere Felder
  )

// GUT - Factory
test "test 1":
  user = UserFactory.create(role: "admin")
```

---

## Anti-Patterns

### 1. Tests, die die Implementierung testen

```
// SCHLECHT - Testet WIE (Implementierung)
test "save calls repository.insert":
  mock = mock(Repository)
  service.save(user)
  verify mock.insert was called once

// GUT - Testet WAS (Verhalten)
test "user is persisted":
  service.save(user)
  assert repository.findById(user.id) exists
```

### 2. Zu stark gekoppelte Tests

```
// SCHLECHT - Test kennt zu viele interne Details
test "process order":
  order.process()
  assert order._internalState == "processed"
  assert order._processedAt != null
  assert order._processorId == 123

// GUT - Test über öffentliches Interface
test "process order":
  order.process()
  assert order.isProcessed()
```

### 3. Flaky Tests (nicht deterministisch)

```
// SCHLECHT - Hängt von realer Zeit ab
test "expires after 1 hour":
  item.setExpiry(now + 1.hour)
  sleep(1.hour)              // Langsam und fragil
  assert item.isExpired()

// GUT - Zeit injizieren
test "expires after 1 hour":
  clock = FakeClock()
  item.setExpiry(clock.now + 1.hour)
  clock.advance(1.hour)
  assert item.isExpired()
```

### 4. Auskommentierte Tests

```
// SCHLECHT - NIEMALS
// test "broken test":
//   ...

// GUT - Korrigieren oder löschen
// Falls vorübergehend deaktiviert: skip("reason")
```

### 5. Tests ohne Assertions

```
// SCHLECHT - Testet nichts
test "create user":
  service.createUser(data)
  // Kein Assert!

// GUT - Ergebnis prüfen
test "create user":
  user = service.createUser(data)
  assert user.id != null
  assert user.email == data.email
```

---

## Checkliste

### Vor jedem Commit

- [ ] Alle Tests bestehen
- [ ] Neue Tests für neuen Code
- [ ] Abdeckung >= 80%
- [ ] Schnelle Tests (< 10s gesamt für Unit-Tests)
- [ ] Keine auskommentierten Tests
- [ ] Aussagekräftige Testnamen

### Für jedes neue Feature

- [ ] Unit-Tests für die Geschäftslogik
- [ ] Integrationstests für externe Verbindungen
- [ ] BDD-Szenarien für die User Stories
- [ ] Tests für Grenzfälle

### Für jeden Bugfix

- [ ] Test, der den Bug reproduziert (schlägt vor dem Fix fehl)
- [ ] Fix implementiert
- [ ] Test besteht nach dem Fix
- [ ] Regressionstest hinzugefügt

### Metriken

| Metrik | Ziel | Minimum |
|--------|------|---------|
| Zeilenabdeckung | > 85% | > 80% |
| Branch-Abdeckung | > 80% | > 75% |
| Unit-Tests | < 1s pro Test | < 2s |
| Gesamte Suite | < 5min | < 10min |
| Flaky Tests | 0 | < 1% |

---

## Ressourcen

- **Buch:** *Test-Driven Development* - Kent Beck
- **Buch:** *Growing Object-Oriented Software, Guided by Tests* - Freeman & Pryce
- **Buch:** *The Art of Unit Testing* - Roy Osherove
- **Artikel:** [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

**Datum der letzten Aktualisierung:** 2025-01
**Version:** 1.0.0
**Autor:** The Bearded CTO
