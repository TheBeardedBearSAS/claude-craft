# Principios KISS, DRY, YAGNI

## Visao Geral

Os principios **KISS** (Keep It Simple, Stupid), **DRY** (Don't Repeat Yourself) e **YAGNI** (You Aren't Gonna Need It) sao **obrigatorios** para manter um codigo simples, mantenivel e evolutivo.

> **Referencias:**
> - `04-solid-principles.md` - Principios SOLID complementares

---

## Sumario

1. [KISS - Keep It Simple, Stupid](#kiss---keep-it-simple-stupid)
2. [DRY - Don't Repeat Yourself](#dry---dont-repeat-yourself)
3. [YAGNI - You Aren't Gonna Need It](#yagni---you-arent-gonna-need-it)
4. [Anti-patterns comuns](#anti-patterns-comuns)
5. [Checklist de validacao](#checklist-de-validacao)

---

## KISS - Keep It Simple, Stupid

### Definicao

**A simplicidade deve ser um objetivo-chave do design. A complexidade deve ser evitada.**

O codigo mais simples e frequentemente o melhor codigo.

### Regras KISS

1. **Metodos curtos:** Maximo 20 linhas por metodo
2. **Complexidade ciclomatica:** Maximo 10 por metodo
3. **Profundidade de indentacao:** Maximo 3 niveis
4. **Parametros:** Maximo 4 parametros por metodo
5. **Classes:** Maximo 200 linhas por classe

### Sinais de violacao

- Metodos com mais de 20 linhas
- Niveis de aninhamento profundos (> 3)
- Comentarios explicando o que o codigo faz
- Dificuldade em nomear uma funcao (faz muitas coisas)
- Testes complexos com muito setup

### Aplicacao

```
RUIM - Codigo complexo
+---------------------------------------------+
| calculatePrice(order):                      |
|   total = 0                                 |
|   for item in order.items:                  |
|     price = item.basePrice                  |
|     if item.category == "food":             |
|       if item.isOrganic:                    |
|         if item.weight > 1:                 |
|           price = price * 0.9               |
|         else:                               |
|           price = price * 0.95              |
|       else:                                 |
|         // ... 50 linhas a mais             |
|     // ... ainda mais condicoes             |
|   return total                              |
+---------------------------------------------+

BOM - Codigo decomposto e simples
+---------------------------------------------+
| PricingService:                             |
|   calculateTotal(order):                    |
|     return sum(                             |
|       calculateItemPrice(item)              |
|       for item in order.items               |
|     )                                       |
|                                             |
| ItemPriceCalculator:                        |
|   calculate(item):                          |
|     basePrice = item.basePrice              |
|     return applyDiscounts(basePrice, item)  |
|                                             |
| DiscountPolicy:                             |
|   apply(price, item): Money                 |
+---------------------------------------------+
```

### Regras de simplicidade

1. **Um unico return por metodo** (exceto early returns para validacao)
2. **Sem else** quando possivel (early returns, guard clauses)
3. **Nomenclatura explicita** (sem necessidade de comentarios)
4. **Composicao > Heranca**
5. **Imutabilidade por padrao**

### Early Returns (Guard Clauses)

```
RUIM - Else aninhados
function process(user):
  if user != null:
    if user.isActive:
      if user.hasPermission:
        // logica de negocio
      else:
        throw NoPermission
    else:
      throw Inactive
  else:
    throw NotFound

BOM - Early returns
function process(user):
  if user == null:
    throw NotFound

  if not user.isActive:
    throw Inactive

  if not user.hasPermission:
    throw NoPermission

  // logica de negocio (sem indentacao)
```

---

## DRY - Don't Repeat Yourself

### Definicao

**Cada conhecimento deve ter uma representacao unica, nao ambigua e com autoridade no sistema.**

Nao duplique a logica de negocio, as regras de validacao ou os algoritmos.

### Tipos de duplicacao a evitar

| Tipo | Descricao | Solucao |
|------|-----------|---------|
| **Logica** | Mesmo codigo em varios lugares | Extrair em uma funcao/classe |
| **Conhecimento** | Mesmas regras de negocio redefinidas | Value Objects, Domain Services |
| **Estrutural** | Mesmos patterns repetidos | Abstracoes, Templates |
| **Documentacao** | Mesmas informacoes em varios formatos | Single Source of Truth |

### Aplicacao

```
RUIM - Validacao duplicada
+---------------------------------------------+
| // No Controller                            |
| if not isValidEmail(email):                 |
|   throw InvalidEmail                        |
|                                             |
| // No Form                                 |
| emailField.addConstraint(EmailConstraint)   |
|                                             |
| // Na Entity                               |
| @Assert.Email                               |
| email: string                               |
|                                             |
| // 3 lugares com a mesma regra!             |
+---------------------------------------------+

BOM - Validacao centralizada (Value Object)
+---------------------------------------------+
| class Email:                                |
|   constructor(value):                       |
|     if not isValidEmail(value):             |
|       throw InvalidEmail(value)             |
|     this.value = value                      |
|                                             |
| // Utilizado em todos os lugares:           |
| // - Entity: email: Email                   |
| // - Form: transforma em Email              |
| // - Controller: recebe Email               |
|                                             |
| // UMA UNICA fonte de verdade!              |
+---------------------------------------------+
```

### Regra dos 3

> **Nao abstrair antes de ver o pattern 3 vezes.**

```
// Visto 1 vez -> copiar
// Visto 2 vezes -> anotar
// Visto 3 vezes -> abstrair
```

### DRY vs WET (Write Everything Twice)

**Duplicacao aceitavel:**
- Estrutura similar mas tipos diferentes (type safety)
- Codigo de teste (clareza > DRY)
- Configuracao por ambiente

**Duplicacao a evitar:**
- Regras de negocio
- Validacao
- Algoritmos
- Calculos

---

## YAGNI - You Aren't Gonna Need It

### Definicao

**Nao implemente uma funcionalidade enquanto ela nao for necessaria.**

Nao codifique para necessidades hipoteticas futuras.

### Sinais de violacao

- Codigo "por precaucao"
- Abstracoes prematuras
- Funcionalidades nao solicitadas
- Suporte a casos que ainda nao existem
- Over-engineering

### Aplicacao

```
RUIM - Over-engineering
+---------------------------------------------+
| ExportService:                              |
|   export(data, format):                     |
|     if format == "csv":                     |
|       // implementado                       |
|     if format == "xml":                     |
|       // implementado (nao solicitado)      |
|     if format == "json":                    |
|       // implementado (nao solicitado)      |
|     if format == "pdf":                     |
|       // implementado (nao solicitado)      |
|     if format == "xlsx":                    |
|       // implementado (nao solicitado)      |
|                                             |
| // Apenas CSV e necessario!                 |
+---------------------------------------------+

BOM - Apenas o necessario
+---------------------------------------------+
| CsvExporter:                                |
|   export(data, filename):                   |
|     // Implementa APENAS CSV               |
|     // (o unico formato necessario)         |
|                                             |
| // Se necessidade futura: nova classe       |
| // Sem modificar o existente (OCP)          |
+---------------------------------------------+
```

### Checklist YAGNI

Antes de adicionar uma funcionalidade, pergunte-se:

- [ ] **E necessario AGORA?** (no ticket atual)
- [ ] **E testado?** (teste existente que falha)
- [ ] **Esta no MVP?** (escopo definido)
- [ ] **O cliente solicitou explicitamente?**

Se **NAO** a alguma dessas perguntas -> **YAGNI: Nao implementar**

### YAGNI vs Extensibilidade

**Bom equilibrio:** Codigo simples MAS extensivel

```
BOM - Interface simples, extensivel se necessario
+---------------------------------------------+
| interface ExportPolicy:                     |
|   export(data): bytes                       |
|                                             |
| class CsvExporter implements ExportPolicy:  |
|   export(data): bytes                       |
|     // Implementacao CSV                    |
|                                             |
| // Se necessidade futura: PdfExporter       |
| // Sem modificar CsvExporter (OCP)          |
+---------------------------------------------+
```

---

## Anti-patterns comuns

### 1. Premature Optimization

```
RUIM
// Cache complexo antes mesmo de ter um problema de performance
class Repository:
  cache = {}
  cacheTimestamps = {}
  CACHE_TTL = 300

  find(id):
    if id in cache and not expired(id):
      return cache[id]
    // ... complexidade desnecessaria

BOM
// Implementacao simples primeiro
class Repository:
  find(id):
    return database.find(id)

// Cache adicionado SOMENTE se profiling mostrar um problema
```

### 2. Gold Plating

```
RUIM - Funcionalidades nao solicitadas
class Notifier:
  sendEmail()      // Necessario
  sendSms()        // Nao solicitado
  sendPush()       // Nao solicitado
  sendWhatsApp()   // Nao solicitado

BOM - Apenas o necessario
class EmailNotifier:
  send()  // Apenas email (necessario)
```

### 3. Speculative Generality

```
RUIM - Framework interno generico
abstract class AbstractEntityManager
  abstract getEntityClass()
  findAll()
  findById()
  save()
  delete()
  // ... 50 metodos genericos

class UserManager extends AbstractEntityManager
  // ... para UM caso de uso

BOM - Utilizar as ferramentas existentes
class UserRepository:
  find(id): User
    return orm.find(User, id)
```

### 4. Lasagna Code

```
RUIM - Muitas camadas
interface FinderInterface
interface SearchInterface extends FinderInterface
interface QueryInterface extends SearchInterface
abstract class AbstractFinder implements QueryInterface
class BaseFinder extends AbstractFinder
class ConcreteFinder extends BaseFinder
// Para fazer: finder.find(id)

BOM - Camadas justificadas apenas
interface RepositoryInterface    // Domain
class ConcreteRepository         // Infrastructure
// 2 camadas sao suficientes
```

---

## Checklist de validacao

### Antes de cada commit

#### KISS
- [ ] Metodos < 20 linhas
- [ ] Complexidade ciclomatica < 10
- [ ] Indentacao max 3 niveis
- [ ] Parametros max 4 por metodo
- [ ] Sem else aninhados (early returns)
- [ ] Nomenclatura explicita (sem comentarios necessarios)

#### DRY
- [ ] Sem codigo duplicado (> 3 linhas identicas)
- [ ] Validacao centralizada (Value Objects)
- [ ] Regras de negocio em um unico lugar
- [ ] Sem duplicacao de conhecimento

#### YAGNI
- [ ] Funcionalidade solicitada explicitamente
- [ ] Teste que falha existe
- [ ] No escopo do ticket atual
- [ ] Sem codigo "por precaucao"
- [ ] Sem abstracao prematura

### Metricas-alvo

| Metrica | Alvo | Limite |
|---------|------|--------|
| Linhas por metodo | < 10 | < 20 |
| Complexidade ciclomatica | < 5 | < 10 |
| Linhas por classe | < 150 | < 200 |
| Duplicacao | 0% | < 3% |
| Cobertura de testes | > 80% | > 70% |
| Dependencias por classe | < 5 | < 7 |

---

## Recursos

- **Livro:** *The Pragmatic Programmer* - Andy Hunt & Dave Thomas
- **Livro:** *Clean Code* - Robert C. Martin
- **Artigo:** [KISS Principle](https://en.wikipedia.org/wiki/KISS_principle)
- **Artigo:** [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- **Artigo:** [YAGNI](https://martinfowler.com/bliki/Yagni.html)

---

**Data da ultima atualizacao:** 2025-01
**Versao:** 1.0.0
**Autor:** The Bearded CTO
