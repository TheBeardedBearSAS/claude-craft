# Testing - Principios TDD/BDD

## Vision general

El **Test-Driven Development (TDD)** y el **Behavior-Driven Development (BDD)** son practicas **obligatorias** para garantizar la calidad y la mantenibilidad del codigo.

> **Nota:** Este documento presenta los principios generales. Consulta las reglas especificas de tu tecnologia para las herramientas y frameworks concretos.

**Objetivos:**
- ✅ Cobertura de codigo >= 80%
- ✅ Tests rapidos (< 10s para los unitarios)
- ✅ Tests independientes y reproducibles
- ✅ CI/CD que bloquea si los tests fallan

---

## Tabla de contenidos

1. [Piramide de tests](#piramide-de-tests)
2. [TDD - Test-Driven Development](#tdd---test-driven-development)
3. [BDD - Behavior-Driven Development](#bdd---behavior-driven-development)
4. [Tipos de tests](#tipos-de-tests)
5. [Buenas practicas](#buenas-practicas)
6. [Anti-patterns](#anti-patterns)
7. [Checklist](#checklist)

---

## Piramide de tests

```
          ┌─────────────┐
          │    E2E      │  ← Pocos (10%)
          │  (UI/API)   │    Lentos, fragiles
          ├─────────────┤
          │ Integration │  ← Moderados (20%)
          │   Tests     │    Verifican las conexiones
          ├─────────────┤
          │   Unit      │  ← Numerosos (70%)
          │   Tests     │    Rapidos, aislados
          └─────────────┘

Cuanto mas arriba, mas lento y costoso.
Cuanto mas abajo, mas rapido y fiable.
```

### Distribucion recomendada

| Tipo | % | Tiempo | Cuando |
|------|---|--------|--------|
| Unit | 70% | < 1s cada uno | En cada commit |
| Integration | 20% | < 5s cada uno | En cada PR |
| E2E | 10% | < 30s cada uno | Antes del deploy |

---

## TDD - Test-Driven Development

### El ciclo Red-Green-Refactor

```
     ┌─────────────────────────────────────┐
     │                                     │
     ▼                                     │
┌─────────┐    ┌─────────┐    ┌──────────┐│
│   RED   │───▶│  GREEN  │───▶│ REFACTOR ││
│  Test   │    │  Codigo │    │ Mejorar  ││
│  falla  │    │  pasa   │    │          ││
└─────────┘    └─────────┘    └──────────┘│
                                   │      │
                                   └──────┘
```

### Pasos

1. **RED** - Escribir un test que falla
   - Definir el comportamiento esperado
   - El test DEBE fallar (sino no prueba nada)

2. **GREEN** - Escribir el minimo de codigo para pasar
   - Codigo lo mas simple posible
   - Sin optimizacion
   - Sin generalizacion

3. **REFACTOR** - Mejorar el codigo
   - Eliminar la duplicacion
   - Mejorar la legibilidad
   - Los tests deben seguir pasando

### Ejemplo TDD

```
// 1. RED - Test que falla
test "calculateTotal returns sum of item prices":
  cart = new Cart()
  cart.addItem(Item(price: 10))
  cart.addItem(Item(price: 20))

  assert cart.calculateTotal() == 30
  // ❌ FAIL: method calculateTotal() not defined

// 2. GREEN - Codigo minimal
class Cart:
  items = []

  addItem(item):
    items.add(item)

  calculateTotal():
    return items.sum(item => item.price)
  // ✅ PASS

// 3. REFACTOR - Mejorar
class Cart:
  items: List<Item> = []

  addItem(item: Item): void
    items.add(item)

  calculateTotal(): Money
    return Money.sum(items.map(i => i.price))
  // ✅ PASS (mejorado con tipos)
```

### Reglas TDD

1. **Un solo test a la vez**
2. **El test define el comportamiento** (no la implementacion)
3. **Codigo minimal para pasar**
4. **Refactor despues de cada GREEN**
5. **Nunca ignorar un test que falla**

---

## BDD - Behavior-Driven Development

### Formato Gherkin

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

### Estructura Given-When-Then

| Keyword | Proposito | Ejemplo |
|---------|-----------|---------|
| **Given** | Contexto inicial | "Given I am logged in" |
| **When** | Accion | "When I click submit" |
| **Then** | Resultado esperado | "Then I see success message" |
| **And** | Continuacion | "And I receive an email" |
| **But** | Excepcion | "But I don't see errors" |

### Ventajas BDD

- ✅ Documentacion viva
- ✅ Lenguaje comun (dev + negocio)
- ✅ Tests legibles por no tecnicos
- ✅ Enfoque en el comportamiento, no en la implementacion

---

## Tipos de tests

### Tests Unitarios

**Objetivo:** Probar una unidad de codigo de forma aislada

```
test "Money can be added":
  a = Money(10, "EUR")
  b = Money(5, "EUR")

  result = a.add(b)

  assert result.amount == 15
  assert result.currency == "EUR"
```

**Caracteristicas:**
- ✅ Rapidos (< 1s)
- ✅ Aislados (sin dependencias externas)
- ✅ Deterministicos (mismo resultado cada vez)
- ✅ Independientes (el orden de ejecucion no importa)

### Tests de Integracion

**Objetivo:** Probar la interaccion entre componentes

```
test "UserRepository saves and retrieves user":
  repo = UserRepository(database)
  user = User(name: "John")

  repo.save(user)
  retrieved = repo.findByName("John")

  assert retrieved.name == "John"
```

**Caracteristicas:**
- ✅ Prueban las conexiones (DB, API, archivos)
- ✅ Usan dependencias reales o testcontainers
- ✅ Mas lentos que los unitarios

### Tests End-to-End (E2E)

**Objetivo:** Probar el sistema completo desde el punto de vista del usuario

```
test "User can complete purchase":
  browser.goto("/products")
  browser.click("#add-to-cart")
  browser.click("#checkout")
  browser.fill("#email", "test@example.com")
  browser.click("#submit")

  assert browser.text("#confirmation") contains "Order confirmed"
```

**Caracteristicas:**
- ✅ Prueban el recorrido completo del usuario
- ⚠️ Lentos y fragiles
- ⚠️ Usar con moderacion

### Tests de Contrato

**Objetivo:** Verificar los contratos entre servicios

```
test "API returns valid user schema":
  response = api.get("/users/1")

  assert response.status == 200
  assert response.body matches UserSchema
```

---

## Buenas practicas

### 1. Arrange-Act-Assert (AAA)

```
test "user can change email":
  // Arrange - Preparar
  user = User(email: "old@test.com")

  // Act - Actuar
  user.changeEmail("new@test.com")

  // Assert - Verificar
  assert user.email == "new@test.com"
```

### 2. Un assert por test (preferencia)

```
// ❌ Varias aserciones no relacionadas
test "user is valid":
  assert user.email is valid
  assert user.password is strong
  assert user.age > 18

// ✅ Tests separados
test "user email is valid": ...
test "user password is strong": ...
test "user is adult": ...
```

### 3. Nombrado explicito

```
// ❌ Nombres vagos
test "test1": ...
test "user test": ...
test "it works": ...

// ✅ Nombres descriptivos
test "calculateTotal returns zero for empty cart": ...
test "login fails with invalid credentials": ...
test "email is sent after order confirmation": ...
```

### 4. Tests independientes

```
// ❌ Tests dependientes
test "create user": ...      // Crea usuario
test "update user": ...      // Usa usuario del test anterior
test "delete user": ...      // Usa usuario del test anterior

// ✅ Tests independientes
test "create user":
  user = createUser()
  assert user.exists

test "update user":
  user = createUser()        // Cada test crea sus datos
  user.update(name: "New")
  assert user.name == "New"
```

### 5. Usar fixtures/factories

```
// ❌ Creacion manual repetida
test "test 1":
  user = User(
    name: "John",
    email: "john@test.com",
    password: "hash123",
    role: "admin",
    // ... 10 campos mas
  )

// ✅ Factory
test "test 1":
  user = UserFactory.create(role: "admin")
```

---

## Anti-patterns

### 1. Tests que prueban la implementacion

```
// ❌ Prueba el COMO (implementacion)
test "save calls repository.insert":
  mock = mock(Repository)
  service.save(user)
  verify mock.insert was called once

// ✅ Prueba el QUE (comportamiento)
test "user is persisted":
  service.save(user)
  assert repository.findById(user.id) exists
```

### 2. Tests demasiado acoplados

```
// ❌ Test que conoce demasiados detalles internos
test "process order":
  order.process()
  assert order._internalState == "processed"
  assert order._processedAt != null
  assert order._processorId == 123

// ✅ Test via interfaz publica
test "process order":
  order.process()
  assert order.isProcessed()
```

### 3. Tests flaky (no deterministicos)

```
// ❌ Depende del tiempo real
test "expires after 1 hour":
  item.setExpiry(now + 1.hour)
  sleep(1.hour)              // ❌ Lento y fragil
  assert item.isExpired()

// ✅ Inyectar el tiempo
test "expires after 1 hour":
  clock = FakeClock()
  item.setExpiry(clock.now + 1.hour)
  clock.advance(1.hour)
  assert item.isExpired()
```

### 4. Tests comentados

```
// ❌ NUNCA
// test "broken test":
//   ...

// ✅ Corregir o eliminar
// Si temporalmente desactivado: skip("reason")
```

### 5. Tests sin aserciones

```
// ❌ No prueba nada
test "create user":
  service.createUser(data)
  // Sin assert!

// ✅ Verificar el resultado
test "create user":
  user = service.createUser(data)
  assert user.id != null
  assert user.email == data.email
```

---

## Checklist

### Antes de cada commit

- [ ] Todos los tests pasan
- [ ] Nuevos tests para nuevo codigo
- [ ] Cobertura >= 80%
- [ ] Tests rapidos (< 10s total para unitarios)
- [ ] Sin tests comentados
- [ ] Nombres de tests explicitos

### Para cada nueva funcionalidad

- [ ] Tests unitarios para la logica de negocio
- [ ] Tests de integracion para las conexiones externas
- [ ] Escenarios BDD para las user stories
- [ ] Tests de casos limite

### Para cada bug fix

- [ ] Test que reproduce el bug (falla antes del fix)
- [ ] Fix implementado
- [ ] Test pasa despues del fix
- [ ] Test de regresion agregado

### Metricas

| Metrica | Objetivo | Minimo |
|---------|----------|--------|
| Cobertura de lineas | > 85% | > 80% |
| Cobertura de ramas | > 80% | > 75% |
| Tests unitarios | < 1s cada uno | < 2s |
| Suite completa | < 5min | < 10min |
| Tests flaky | 0 | < 1% |

---

## Recursos

- **Libro:** *Test-Driven Development* - Kent Beck
- **Libro:** *Growing Object-Oriented Software, Guided by Tests* - Freeman & Pryce
- **Libro:** *The Art of Unit Testing* - Roy Osherove
- **Articulo:** [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

**Fecha de ultima actualizacion:** 2025-01
**Version:** 1.0.0
**Autor:** The Bearded CTO
