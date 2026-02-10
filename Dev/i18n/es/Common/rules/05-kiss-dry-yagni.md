# Principios KISS, DRY, YAGNI

## Vision general

Los principios **KISS** (Keep It Simple, Stupid), **DRY** (Don't Repeat Yourself) y **YAGNI** (You Aren't Gonna Need It) son **obligatorios** para mantener un codigo simple, mantenible y evolutivo.

> **Referencias:**
> - `04-solid-principles.md` - Principios SOLID complementarios

---

## Tabla de contenidos

1. [KISS - Keep It Simple, Stupid](#kiss---keep-it-simple-stupid)
2. [DRY - Don't Repeat Yourself](#dry---dont-repeat-yourself)
3. [YAGNI - You Aren't Gonna Need It](#yagni---you-arent-gonna-need-it)
4. [Anti-patterns comunes](#anti-patterns-comunes)
5. [Checklist de validacion](#checklist-de-validacion)

---

## KISS - Keep It Simple, Stupid

### Definicion

**La simplicidad debe ser un objetivo clave del diseno. La complejidad debe evitarse.**

El codigo mas simple es a menudo el mejor codigo.

### Reglas KISS

1. **Metodos cortos:** Maximo 20 lineas por metodo
2. **Complejidad ciclomatica:** Maximo 10 por metodo
3. **Profundidad de indentacion:** Maximo 3 niveles
4. **Parametros:** Maximo 4 parametros por metodo
5. **Clases:** Maximo 200 lineas por clase

### Signos de violacion

- Metodos de mas de 20 lineas
- Niveles de anidamiento profundos (> 3)
- Comentarios explicando lo que hace el codigo
- Dificultad para nombrar una funcion (hace demasiadas cosas)
- Tests complejos con mucho setup

### Aplicacion

```
❌ MALO - Codigo complejo
┌─────────────────────────────────────────────┐
│ calculatePrice(order):                      │
│   total = 0                                 │
│   for item in order.items:                  │
│     price = item.basePrice                  │
│     if item.category == "food":             │
│       if item.isOrganic:                    │
│         if item.weight > 1:                 │
│           price = price * 0.9               │
│         else:                               │
│           price = price * 0.95              │
│       else:                                 │
│         // ... 50 lineas mas                │
│     // ... aun mas condiciones              │
│   return total                              │
└─────────────────────────────────────────────┘

✅ BUENO - Codigo descompuesto y simple
┌─────────────────────────────────────────────┐
│ PricingService:                             │
│   calculateTotal(order):                    │
│     return sum(                             │
│       calculateItemPrice(item)              │
│       for item in order.items               │
│     )                                       │
│                                             │
│ ItemPriceCalculator:                        │
│   calculate(item):                          │
│     basePrice = item.basePrice              │
│     return applyDiscounts(basePrice, item)  │
│                                             │
│ DiscountPolicy:                             │
│   apply(price, item): Money                 │
└─────────────────────────────────────────────┘
```

### Reglas de simplicidad

1. **Un solo return por metodo** (excepto early returns para validacion)
2. **Sin else** cuando sea posible (early returns, guard clauses)
3. **Nombrado explicito** (sin necesidad de comentarios)
4. **Composicion > Herencia**
5. **Inmutabilidad por defecto**

### Early Returns (Guard Clauses)

```
❌ MALO - Else anidados
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

✅ BUENO - Early returns
function process(user):
  if user == null:
    throw NotFound

  if not user.isActive:
    throw Inactive

  if not user.hasPermission:
    throw NoPermission

  // logica de negocio (sin indentacion)
```

---

## DRY - Don't Repeat Yourself

### Definicion

**Cada conocimiento debe tener una representacion unica, no ambigua y con autoridad en el sistema.**

No dupliques la logica de negocio, las reglas de validacion ni los algoritmos.

### Tipos de duplicacion a evitar

| Tipo | Descripcion | Solucion |
|------|-------------|----------|
| **Logica** | Mismo codigo en varios lugares | Extraer en una funcion/clase |
| **Conocimiento** | Mismas reglas de negocio redefinidas | Value Objects, Domain Services |
| **Estructural** | Mismos patrones repetidos | Abstracciones, Templates |
| **Documentacion** | Misma info en varios formatos | Single Source of Truth |

### Aplicacion

```
❌ MALO - Validacion duplicada
┌─────────────────────────────────────────────┐
│ // En el Controller                         │
│ if not isValidEmail(email):                 │
│   throw InvalidEmail                        │
│                                             │
│ // En el Form                               │
│ emailField.addConstraint(EmailConstraint)   │
│                                             │
│ // En la Entity                             │
│ @Assert.Email                               │
│ email: string                               │
│                                             │
│ // 3 lugares con la misma regla!            │
└─────────────────────────────────────────────┘

✅ BUENO - Validacion centralizada (Value Object)
┌─────────────────────────────────────────────┐
│ class Email:                                │
│   constructor(value):                       │
│     if not isValidEmail(value):             │
│       throw InvalidEmail(value)             │
│     this.value = value                      │
│                                             │
│ // Usado en todas partes:                   │
│ // - Entity: email: Email                   │
│ // - Form: transforma en Email              │
│ // - Controller: recibe Email               │
│                                             │
│ // UNA SOLA fuente de verdad!               │
└─────────────────────────────────────────────┘
```

### Regla de 3

> **No abstraer antes de haber visto el patron 3 veces.**

```
// Visto 1 vez → copiar
// Visto 2 veces → anotar
// Visto 3 veces → abstraer
```

### DRY vs WET (Write Everything Twice)

**Duplicacion aceptable:**
- Estructura similar pero tipos diferentes (type safety)
- Codigo de test (claridad > DRY)
- Configuracion por entorno

**Duplicacion a evitar:**
- Reglas de negocio
- Validacion
- Algoritmos
- Calculos

---

## YAGNI - You Aren't Gonna Need It

### Definicion

**No implementes una funcionalidad hasta que sea necesaria.**

No codifiques para necesidades hipoteticas futuras.

### Signos de violacion

- Codigo "por si acaso"
- Abstracciones prematuras
- Funcionalidades no solicitadas
- Soporte de casos que aun no existen
- Over-engineering

### Aplicacion

```
❌ MALO - Over-engineering
┌─────────────────────────────────────────────┐
│ ExportService:                              │
│   export(data, format):                     │
│     if format == "csv":                     │
│       // implementado                       │
│     if format == "xml":                     │
│       // implementado (no solicitado)       │
│     if format == "json":                    │
│       // implementado (no solicitado)       │
│     if format == "pdf":                     │
│       // implementado (no solicitado)       │
│     if format == "xlsx":                    │
│       // implementado (no solicitado)       │
│                                             │
│ // Solo CSV es requerido!                   │
└─────────────────────────────────────────────┘

✅ BUENO - Solo lo necesario
┌─────────────────────────────────────────────┐
│ CsvExporter:                                │
│   export(data, filename):                   │
│     // Implementa UNICAMENTE CSV            │
│     // (el unico formato requerido)         │
│                                             │
│ // Si se necesita en el futuro: nueva clase │
│ // Sin modificar lo existente (OCP)         │
└─────────────────────────────────────────────┘
```

### Checklist YAGNI

Antes de agregar una funcionalidad, preguntate:

- [ ] **Es requerido AHORA?** (en el ticket actual)
- [ ] **Tiene test?** (test existente que falla)
- [ ] **Esta en el MVP?** (scope definido)
- [ ] **El cliente lo ha solicitado explicitamente?**

Si **NO** a alguna de estas preguntas → **YAGNI: No implementar**

### YAGNI vs Extensibilidad

**Buen equilibrio:** Codigo simple PERO extensible

```
✅ Interfaz simple, extensible si es necesario
┌─────────────────────────────────────────────┐
│ interface ExportPolicy:                     │
│   export(data): bytes                       │
│                                             │
│ class CsvExporter implements ExportPolicy:  │
│   export(data): bytes                       │
│     // Implementacion CSV                   │
│                                             │
│ // Si se necesita en el futuro: PdfExporter │
│ // Sin modificar CsvExporter (OCP)          │
└─────────────────────────────────────────────┘
```

---

## Anti-patterns comunes

### 1. Premature Optimization

```
❌ MALO
// Cache complejo antes de tener un problema de rendimiento
class Repository:
  cache = {}
  cacheTimestamps = {}
  CACHE_TTL = 300

  find(id):
    if id in cache and not expired(id):
      return cache[id]
    // ... complejidad innecesaria

✅ BUENO
// Implementacion simple primero
class Repository:
  find(id):
    return database.find(id)

// Cache agregado SOLO si el profiling muestra un problema
```

### 2. Gold Plating

```
❌ MALO - Funcionalidades no solicitadas
class Notifier:
  sendEmail()      // ✅ Requerido
  sendSms()        // ❌ No solicitado
  sendPush()       // ❌ No solicitado
  sendWhatsApp()   // ❌ No solicitado

✅ BUENO - Solo lo necesario
class EmailNotifier:
  send()  // ✅ Unicamente email (requerido)
```

### 3. Speculative Generality

```
❌ MALO - Framework interno generico
abstract class AbstractEntityManager
  abstract getEntityClass()
  findAll()
  findById()
  save()
  delete()
  // ... 50 metodos genericos

class UserManager extends AbstractEntityManager
  // ... para UN caso de uso

✅ BUENO - Usar las herramientas existentes
class UserRepository:
  find(id): User
    return orm.find(User, id)
```

### 4. Lasagna Code

```
❌ MALO - Demasiadas capas
interface FinderInterface
interface SearchInterface extends FinderInterface
interface QueryInterface extends SearchInterface
abstract class AbstractFinder implements QueryInterface
class BaseFinder extends AbstractFinder
class ConcreteFinder extends BaseFinder
// Para hacer: finder.find(id)

✅ BUENO - Solo capas justificadas
interface RepositoryInterface    // Domain
class ConcreteRepository         // Infrastructure
// 2 capas son suficientes
```

---

## Checklist de validacion

### Antes de cada commit

#### KISS
- [ ] Metodos < 20 lineas
- [ ] Complejidad ciclomatica < 10
- [ ] Indentacion max 3 niveles
- [ ] Parametros max 4 por metodo
- [ ] Sin else anidados (early returns)
- [ ] Nombrado explicito (sin comentarios necesarios)

#### DRY
- [ ] Sin codigo duplicado (> 3 lineas identicas)
- [ ] Validacion centralizada (Value Objects)
- [ ] Reglas de negocio en un solo lugar
- [ ] Sin duplicacion de conocimiento

#### YAGNI
- [ ] Funcionalidad solicitada explicitamente
- [ ] Test que falla existe
- [ ] Dentro del scope del ticket actual
- [ ] Sin codigo "por si acaso"
- [ ] Sin abstraccion prematura

### Metricas objetivo

| Metrica | Objetivo | Limite |
|---------|----------|--------|
| Lineas por metodo | < 10 | < 20 |
| Complejidad ciclomatica | < 5 | < 10 |
| Lineas por clase | < 150 | < 200 |
| Duplicacion | 0% | < 3% |
| Cobertura de tests | > 80% | > 70% |
| Dependencias por clase | < 5 | < 7 |

---

## Recursos

- **Libro:** *The Pragmatic Programmer* - Andy Hunt & Dave Thomas
- **Libro:** *Clean Code* - Robert C. Martin
- **Articulo:** [KISS Principle](https://en.wikipedia.org/wiki/KISS_principle)
- **Articulo:** [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- **Articulo:** [YAGNI](https://martinfowler.com/bliki/Yagni.html)

---

**Fecha de ultima actualizacion:** 2025-01
**Version:** 1.0.0
**Autor:** The Bearded CTO
