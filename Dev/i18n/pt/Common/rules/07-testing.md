# Testes - Principios TDD/BDD

## Visao Geral

O **Test-Driven Development (TDD)** e o **Behavior-Driven Development (BDD)** sao praticas **obrigatorias** para garantir a qualidade e a manutencao do codigo.

> **Nota:** Este documento apresenta os principios gerais. Consulte as regras especificas da sua tecnologia para as ferramentas e frameworks concretos.

**Objetivos:**
- Cobertura de codigo >= 80%
- Testes rapidos (< 10s para os unitarios)
- Testes independentes e reproduziveis
- CI/CD que bloqueia se testes falharem

---

## Sumario

1. [Piramide de testes](#piramide-de-testes)
2. [TDD - Test-Driven Development](#tdd---test-driven-development)
3. [BDD - Behavior-Driven Development](#bdd---behavior-driven-development)
4. [Tipos de testes](#tipos-de-testes)
5. [Boas praticas](#boas-praticas)
6. [Anti-patterns](#anti-patterns)
7. [Checklist](#checklist)

---

## Piramide de testes

```
          +-------------+
          |    E2E      |  <- Poucos (10%)
          |  (UI/API)   |    Lentos, frageis
          +-------------+
          | Integration |  <- Moderados (20%)
          |   Tests     |    Verificam as conexoes
          +-------------+
          |   Unit      |  <- Numerosos (70%)
          |   Tests     |    Rapidos, isolados
          +-------------+

Quanto mais alto, mais lento e custoso.
Quanto mais baixo, mais rapido e confiavel.
```

### Distribuicao recomendada

| Tipo | % | Tempo | Quando |
|------|---|-------|--------|
| Unit | 70% | < 1s cada | A cada commit |
| Integration | 20% | < 5s cada | A cada PR |
| E2E | 10% | < 30s cada | Antes do deploy |

---

## TDD - Test-Driven Development

### O ciclo Red-Green-Refactor

```
     +-------------------------------------+
     |                                     |
     v                                     |
+---------+    +---------+    +----------+ |
|   RED   |--->|  GREEN  |--->| REFACTOR | |
|  Teste  |    |  Codigo |    | Melhorar | |
|  falha  |    |  passa  |    |          | |
+---------+    +---------+    +----------+ |
                                   |       |
                                   +-------+
```

### Etapas

1. **RED** - Escrever um teste que falha
   - Definir o comportamento esperado
   - O teste DEVE falhar (senao nao testa nada)

2. **GREEN** - Escrever o minimo de codigo para passar
   - Codigo mais simples possivel
   - Sem otimizacao
   - Sem generalizacao

3. **REFACTOR** - Melhorar o codigo
   - Remover a duplicacao
   - Melhorar a legibilidade
   - Os testes devem continuar passando

### Exemplo TDD

```
// 1. RED - Teste que falha
test "calculateTotal returns sum of item prices":
  cart = new Cart()
  cart.addItem(Item(price: 10))
  cart.addItem(Item(price: 20))

  assert cart.calculateTotal() == 30
  // FAIL: method calculateTotal() not defined

// 2. GREEN - Codigo minimo
class Cart:
  items = []

  addItem(item):
    items.add(item)

  calculateTotal():
    return items.sum(item => item.price)
  // PASS

// 3. REFACTOR - Melhorar
class Cart:
  items: List<Item> = []

  addItem(item: Item): void
    items.add(item)

  calculateTotal(): Money
    return Money.sum(items.map(i => i.price))
  // PASS (melhorado com tipos)
```

### Regras TDD

1. **Um unico teste por vez**
2. **O teste define o comportamento** (nao a implementacao)
3. **Codigo minimo para passar**
4. **Refactor apos cada GREEN**
5. **Nunca ignorar um teste que falha**

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

### Estrutura Given-When-Then

| Keyword | Proposito | Exemplo |
|---------|-----------|---------|
| **Given** | Contexto inicial | "Given I am logged in" |
| **When** | Acao | "When I click submit" |
| **Then** | Resultado esperado | "Then I see success message" |
| **And** | Continuacao | "And I receive an email" |
| **But** | Excecao | "But I don't see errors" |

### Vantagens BDD

- Documentacao viva
- Linguagem comum (dev + negocio)
- Testes legiveis por nao-tecnicos
- Foco no comportamento, nao na implementacao

---

## Tipos de testes

### Testes Unitarios

**Objetivo:** Testar uma unidade de codigo isoladamente

```
test "Money can be added":
  a = Money(10, "EUR")
  b = Money(5, "EUR")

  result = a.add(b)

  assert result.amount == 15
  assert result.currency == "EUR"
```

**Caracteristicas:**
- Rapidos (< 1s)
- Isolados (sem dependencias externas)
- Deterministicos (mesmo resultado toda vez)
- Independentes (ordem de execucao nao importa)

### Testes de Integracao

**Objetivo:** Testar a interacao entre componentes

```
test "UserRepository saves and retrieves user":
  repo = UserRepository(database)
  user = User(name: "John")

  repo.save(user)
  retrieved = repo.findByName("John")

  assert retrieved.name == "John"
```

**Caracteristicas:**
- Testam as conexoes (DB, API, arquivos)
- Utilizam dependencias reais ou testcontainers
- Mais lentos que os unitarios

### Testes End-to-End (E2E)

**Objetivo:** Testar o sistema completo do ponto de vista do usuario

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
- Testam o percurso completo do usuario
- Lentos e frageis
- Usar com parcimonia

### Testes de Contrato

**Objetivo:** Verificar os contratos entre servicos

```
test "API returns valid user schema":
  response = api.get("/users/1")

  assert response.status == 200
  assert response.body matches UserSchema
```

---

## Boas praticas

### 1. Arrange-Act-Assert (AAA)

```
test "user can change email":
  // Arrange - Preparar
  user = User(email: "old@test.com")

  // Act - Agir
  user.changeEmail("new@test.com")

  // Assert - Verificar
  assert user.email == "new@test.com"
```

### 2. Um assert por teste (preferencia)

```
// Varias assercoes nao relacionadas
test "user is valid":
  assert user.email is valid
  assert user.password is strong
  assert user.age > 18

// Testes separados
test "user email is valid": ...
test "user password is strong": ...
test "user is adult": ...
```

### 3. Nomenclatura explicita

```
// Nomes vagos
test "test1": ...
test "user test": ...
test "it works": ...

// Nomes descritivos
test "calculateTotal returns zero for empty cart": ...
test "login fails with invalid credentials": ...
test "email is sent after order confirmation": ...
```

### 4. Testes independentes

```
// Testes dependentes
test "create user": ...      // Cria user
test "update user": ...      // Usa user do teste anterior
test "delete user": ...      // Usa user do teste anterior

// Testes independentes
test "create user":
  user = createUser()
  assert user.exists

test "update user":
  user = createUser()        // Cada teste cria seus dados
  user.update(name: "New")
  assert user.name == "New"
```

### 5. Utilizar fixtures/factories

```
// Criacao manual repetida
test "test 1":
  user = User(
    name: "John",
    email: "john@test.com",
    password: "hash123",
    role: "admin",
    // ... 10 outros campos
  )

// Factory
test "test 1":
  user = UserFactory.create(role: "admin")
```

---

## Anti-patterns

### 1. Testes que testam a implementacao

```
// Testa HOW (implementacao)
test "save calls repository.insert":
  mock = mock(Repository)
  service.save(user)
  verify mock.insert was called once

// Testa WHAT (comportamento)
test "user is persisted":
  service.save(user)
  assert repository.findById(user.id) exists
```

### 2. Testes muito acoplados

```
// Teste que conhece muitos detalhes internos
test "process order":
  order.process()
  assert order._internalState == "processed"
  assert order._processedAt != null
  assert order._processorId == 123

// Teste via interface publica
test "process order":
  order.process()
  assert order.isProcessed()
```

### 3. Testes flaky (nao deterministicos)

```
// Depende do tempo real
test "expires after 1 hour":
  item.setExpiry(now + 1.hour)
  sleep(1.hour)              // Lento e fragil
  assert item.isExpired()

// Inject time
test "expires after 1 hour":
  clock = FakeClock()
  item.setExpiry(clock.now + 1.hour)
  clock.advance(1.hour)
  assert item.isExpired()
```

### 4. Testes comentados

```
// NUNCA
// test "broken test":
//   ...

// Corrigir ou remover
// Se temporariamente desabilitado: skip("reason")
```

### 5. Testes sem assercoes

```
// Nao testa nada
test "create user":
  service.createUser(data)
  // Sem assert!

// Verificar o resultado
test "create user":
  user = service.createUser(data)
  assert user.id != null
  assert user.email == data.email
```

---

## Checklist

### Antes de cada commit

- [ ] Todos os testes passam
- [ ] Novos testes para novo codigo
- [ ] Cobertura >= 80%
- [ ] Testes rapidos (< 10s total para unitarios)
- [ ] Sem testes comentados
- [ ] Nomes de testes explicitos

### Para cada nova funcionalidade

- [ ] Testes unitarios para a logica de negocio
- [ ] Testes de integracao para as conexoes externas
- [ ] Cenarios BDD para as user stories
- [ ] Testes de edge cases

### Para cada bug fix

- [ ] Teste que reproduz o bug (falha antes do fix)
- [ ] Fix implementado
- [ ] Teste passa apos o fix
- [ ] Teste de regressao adicionado

### Metricas

| Metrica | Alvo | Minimo |
|---------|------|--------|
| Cobertura de linhas | > 85% | > 80% |
| Cobertura de branches | > 80% | > 75% |
| Testes unitarios | < 1s cada | < 2s |
| Suite completa | < 5min | < 10min |
| Testes flaky | 0 | < 1% |

---

## Recursos

- **Livro:** *Test-Driven Development* - Kent Beck
- **Livro:** *Growing Object-Oriented Software, Guided by Tests* - Freeman & Pryce
- **Livro:** *The Art of Unit Testing* - Roy Osherove
- **Artigo:** [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

**Data da ultima atualizacao:** 2025-01
**Versao:** 1.0.0
**Autor:** The Bearded CTO
