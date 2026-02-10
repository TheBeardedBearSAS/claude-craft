# Principios SOLID

## Visao Geral

Os principios SOLID sao **obrigatorios** para todo o codigo do projeto. Esses principios garantem um codigo mantenivel, testavel e evolutivo.

> **Nota:** Este documento apresenta os principios gerais. Consulte as regras especificas da sua tecnologia para exemplos concretos.

---

## Sumario

1. [SRP - Single Responsibility Principle](#srp---single-responsibility-principle)
2. [OCP - Open/Closed Principle](#ocp---openclosed-principle)
3. [LSP - Liskov Substitution Principle](#lsp---liskov-substitution-principle)
4. [ISP - Interface Segregation Principle](#isp---interface-segregation-principle)
5. [DIP - Dependency Inversion Principle](#dip---dependency-inversion-principle)
6. [Checklist de validacao](#checklist-de-validacao)

---

## SRP - Single Responsibility Principle

### Definicao

**Uma classe deve ter apenas uma unica razao para mudar.**

Cada classe, metodo ou modulo deve ter uma responsabilidade unica e bem definida.

### Sinais de violacao

- Classe com "and" ou "or" no nome
- Metodo que faz varias coisas nao relacionadas
- Classe dificil de nomear claramente
- Testes complexos necessitando muitos mocks

### Aplicacao

```
RUIM - Multiplas responsabilidades
+-------------------------------------+
| OrderService                        |
+-------------------------------------+
| - validateOrder()                   |
| - calculatePrice()                  |
| - saveToDatabase()                  |
| - sendEmail()                       |
| - generatePDF()                     |
+-------------------------------------+

BOM - Responsabilidades separadas
+-----------------+  +-----------------+
| OrderValidator  |  | PricingService  |
+-----------------+  +-----------------+
| - validate()    |  | - calculate()   |
+-----------------+  +-----------------+

+-----------------+  +-----------------+
| OrderRepository |  | EmailNotifier   |
+-----------------+  +-----------------+
| - save()        |  | - notify()      |
+-----------------+  +-----------------+
```

### Vantagens

- **Testabilidade:** Cada classe pode ser testada isoladamente
- **Manutencao:** As mudancas sao localizadas
- **Reutilizacao:** Os componentes sao independentes
- **Legibilidade:** Cada classe tem um objetivo claro

---

## OCP - Open/Closed Principle

### Definicao

**As entidades de software devem ser abertas para extensao mas fechadas para modificacao.**

Deve ser possivel adicionar novas funcionalidades sem modificar o codigo existente.

### Sinais de violacao

- Switch/case sobre tipos para determinar o comportamento
- Modificacoes frequentes de uma mesma classe
- Adicao de funcionalidade = modificacao de codigo existente

### Aplicacao

```
RUIM - Modificacao do codigo existente
+-------------------------------------+
| DiscountCalculator                  |
+-------------------------------------+
| calculate(type):                    |
|   if type == "family":              |
|     return basePrice * 0.9          |
|   if type == "student":             |
|     return basePrice * 0.8          |
|   // Para adicionar "senior" ->     |
|   // modificar esta classe          |
+-------------------------------------+

BOM - Extensao via interfaces
+-------------------------------------+
| <<interface>>                       |
| DiscountPolicy                      |
+-------------------------------------+
| + apply(price): Money               |
| + isApplicable(order): boolean      |
+-------------------------------------+
         ^
         |
    +----+----+------------+
    |         |            |
+-------+ +-------+ +-------------+
|Family | |Student| |SeniorPolicy |
|Policy | |Policy | |(nova)       |
+-------+ +-------+ +-------------+
```

### Pattern Strategy

Utilize o pattern Strategy para permitir a extensao:

1. Definir uma interface para o comportamento variavel
2. Implementar cada variante em uma classe separada
3. Injetar as implementacoes via configuracao

### Vantagens

- **Extensao facil:** Novas funcionalidades = novas classes
- **Estabilidade:** O codigo existente nao e modificado
- **Testes:** Sem regressao no codigo existente
- **Evolucao:** Adicao de funcionalidades sem risco

---

## LSP - Liskov Substitution Principle

### Definicao

**Os objetos de uma classe derivada devem poder substituir os objetos da classe base sem alterar a coerencia do programa.**

Os subtipos devem ser substituiveis pelos seus tipos base.

### Sinais de violacao

- Subclasse que lanca excecoes nao documentadas
- Metodo que verifica o tipo concreto antes de agir
- Override que muda o comportamento esperado
- Precondicoes reforcadas ou poscondicoes enfraquecidas

### Regras

1. **Precondicoes:** Nao reforcar (aceitar ao menos o mesmo)
2. **Poscondicoes:** Nao enfraquecer (garantir ao menos o mesmo)
3. **Invariantes:** Manter os invariantes do pai
4. **Restricao historica:** Nao modificar o estado de maneira incompativel

### Aplicacao

```
RUIM - Violacao do contrato
+-------------------------------------+
| class Rectangle                     |
+-------------------------------------+
| - width, height                     |
| + setWidth(w)                       |
| + setHeight(h)                      |
| + area() = width * height           |
+-------------------------------------+
         ^
         |
+-------------------------------------+
| class Square extends Rectangle     |
+-------------------------------------+
| + setWidth(w):                      |
|     this.width = w                  |
|     this.height = w  // Viola LSP   |
+-------------------------------------+

BOM - Contratos respeitados
+-------------------------------------+
| <<interface>> Shape                 |
+-------------------------------------+
| + area(): number                    |
+-------------------------------------+
         ^
    +----+----+
    |         |
+-------+ +-------+
|Rect.  | |Square |
|w*h    | |side^2 |
+-------+ +-------+
```

### Vantagens

- **Polimorfismo seguro:** As substituicoes sempre funcionam
- **Contratos claros:** Interfaces bem documentadas
- **Previsibilidade:** Sem surpresas com os subtipos
- **Testabilidade:** Os mocks respeitam os contratos

---

## ISP - Interface Segregation Principle

### Definicao

**Os clientes nao devem depender de interfaces que nao utilizam.**

E melhor ter varias interfaces especificas do que uma interface geral.

### Sinais de violacao

- Interface com muitos metodos (> 5)
- Classes que implementam metodos vazios
- Metodos que lancam `NotImplementedException`
- Clientes que utilizam apenas parte da interface

### Aplicacao

```
RUIM - Interface muito ampla
+-------------------------------------+
| <<interface>>                       |
| UserRepository                      |
+-------------------------------------+
| + find(id)                          |
| + findAll()                         |
| + save(user)                        |
| + delete(user)                      |
| + findByEmail(email)                |
| + findByRole(role)                  |
| + countByMonth(month)               |
| + exportToCsv()                     |
| + importFromCsv()                   |
| + syncWithLDAP()                    |
+-------------------------------------+

BOM - Interfaces segregadas
+-----------------+  +-----------------+
| UserFinder      |  | UserPersister   |
+-----------------+  +-----------------+
| + find(id)      |  | + save(user)    |
| + findAll()     |  | + delete(user)  |
+-----------------+  +-----------------+

+-----------------+  +-----------------+
| UserSearcher    |  | UserExporter    |
+-----------------+  +-----------------+
| + byEmail()     |  | + toCsv()       |
| + byRole()      |  | + fromCsv()     |
+-----------------+  +-----------------+
```

### Vantagens

- **Acoplamento fraco:** Os clientes dependem do minimo necessario
- **Flexibilidade:** Implementacoes parciais possiveis
- **Testabilidade:** Mocks mais simples (menos metodos)
- **Evolucao:** Adicao de interfaces sem impactar o existente

---

## DIP - Dependency Inversion Principle

### Definicao

**Os modulos de alto nivel nao devem depender dos modulos de baixo nivel. Ambos devem depender de abstracoes.**

**As abstracoes nao devem depender dos detalhes. Os detalhes devem depender das abstracoes.**

### Sinais de violacao

- Instanciacao direta de dependencias (`new ConcreteClass()`)
- Import de classes de infraestrutura na camada de negocio
- Acoplamento forte com um framework ou uma biblioteca
- Testes dificeis de escrever sem banco de dados real

### Aplicacao

```
RUIM - Dependencia das implementacoes
+-------------------------------------+
| OrderService                        |
+-------------------------------------+
| - MySQLOrderRepository              |
| - SmtpMailer                        |
| - StripePaymentGateway              |
+-------------------------------------+
     |
     v Depende de
+-------------------------------------+
| Infraestrutura concreta             |
+-------------------------------------+

BOM - Dependencia das abstracoes
+-------------------------------------+
| OrderService (Application Layer)    |
+-------------------------------------+
| - OrderRepositoryInterface          |
| - MailerInterface                   |
| - PaymentGatewayInterface           |
+-------------------------------------+
     |
     v Depende de
+-------------------------------------+
| Interfaces (Domain Layer)           |
+-------------------------------------+
     ^
     | Implementado por
+-------------------------------------+
| MySQL, Smtp, Stripe (Infra Layer)   |
+-------------------------------------+
```

### Arquitetura em camadas

```
+---------------------------------------------+
|         APRESENTACAO (UI/API)               |
|   Controllers, Commands, Forms              |
+---------------------------------------------+
|         APLICACAO (Use Cases)               |
|   Servicos que orquestram a logica          |
|               |                             |
|       Depende de (Interfaces)               |
+---------------------------------------------+
|            DOMINIO (Business)               |
|   Entidades, Value Objects, Interfaces      |
|               ^                             |
|       Implementado por (Inversao)           |
+---------------------------------------------+
|       INFRAESTRUTURA (Tecnica)              |
|   Repositories, Mailers, Gateways           |
+---------------------------------------------+

As camadas superiores dependem de abstracoes
As camadas inferiores implementam essas abstracoes
A logica de negocio e isolada dos detalhes tecnicos
```

### Vantagens

- **Testabilidade:** Mocks e stubs faceis de criar
- **Flexibilidade:** Mudanca de implementacao sem impacto
- **Isolamento:** A logica de negocio nao depende da infraestrutura
- **Reutilizacao:** As abstracoes sao reutilizaveis

---

## Checklist de validacao

### Antes de cada commit

#### SRP
- [ ] Cada classe tem uma unica responsabilidade claramente definida
- [ ] Os metodos fazem uma unica coisa (< 20 linhas)
- [ ] Sem metodos com "e" ou "ou" no nome

#### OCP
- [ ] Novas funcionalidades adicionadas por extensao, nao modificacao
- [ ] Utilizacao de interfaces e patterns Strategy
- [ ] Sem switch/if sobre tipos para determinar o comportamento

#### LSP
- [ ] Os subtipos respeitam os contratos dos seus pais
- [ ] Sem precondicoes reforcadas nas subclasses
- [ ] Sem poscondicoes enfraquecidas nas subclasses
- [ ] Sem excecoes novas nao documentadas

#### ISP
- [ ] As interfaces sao pequenas e focadas (< 5 metodos)
- [ ] Os clientes dependem apenas dos metodos que utilizam
- [ ] Sem metodos `throw NotImplementedException()`

#### DIP
- [ ] Os use cases dependem de interfaces, nao de implementacoes
- [ ] As interfaces estao no dominio, nao na infraestrutura
- [ ] Injecao de dependencias via construtor

---

## Recursos

- **Livro:** *Clean Architecture* - Robert C. Martin
- **Livro:** *SOLID Principles* - Uncle Bob
- **Video:** [SOLID Principles Explained](https://www.youtube.com/watch?v=pTB30aXS77U)

---

**Data da ultima atualizacao:** 2025-01
**Versao:** 1.0.0
**Autor:** The Bearded CTO
