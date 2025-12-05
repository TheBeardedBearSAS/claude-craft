# Principios KISS, DRY, YAGNI - Atoll Tourisme

## Descripción General

Los principios **KISS** (Keep It Simple, Stupid), **DRY** (Don't Repeat Yourself) y **YAGNI** (You Aren't Gonna Need It) son **obligatorios** para mantener un código simple, mantenible y evolutivo.

> **Referencias:**
> - `04-solid-principles.md` - Principios SOLID complementarios
> - `03-coding-standards.md` - Estándares de código
> - `07-testing-tdd-bdd.md` - Tests y simplicidad
> - `02-architecture-clean-ddd.md` - Arquitectura simple

---

## Tabla de contenidos

1. [KISS - Keep It Simple, Stupid](#kiss---keep-it-simple-stupid)
2. [DRY - Don't Repeat Yourself](#dry---dont-repeat-yourself)
3. [YAGNI - You Aren't Gonna Need It](#yagni---you-arent-gonna-need-it)
4. [Anti-patrones comunes](#anti-patrones-comunes)
5. [Checklist de validación](#checklist-de-validación)

---

## KISS - Keep It Simple, Stupid

### Definición

**La simplicidad debe ser un objetivo clave del diseño. La complejidad debe evitarse.**

El código más simple es a menudo el mejor código.

### Reglas KISS para Atoll Tourisme

1. **Métodos cortos:** Máximo 20 líneas por método
2. **Complejidad ciclomática:** Máximo 10 por método
3. **Profundidad de indentación:** Máximo 3 niveles
4. **Parámetros:** Máximo 4 parámetros por método
5. **Clases:** Máximo 200 líneas por clase

### Métricas KISS

```bash
# Complejidad ciclomática (max 10)
vendor/bin/phpmetrics --report-violations=phpmetrics.xml src/

# Líneas por método (max 20)
vendor/bin/phpmd src/ text cleancode

# PHPStan nivel max
vendor/bin/phpstan analyse -l max src/
```

### Reglas de simplicidad

1. **Un solo return por método** (excepto early returns para validación)
2. **Sin else** cuando sea posible (early returns, guard clauses)
3. **Nomenclatura explícita** (sin necesidad de comentarios)
4. **Composición > Herencia**
5. **Inmutabilidad por defecto** (readonly)

---

## DRY - Don't Repeat Yourself

### Definición

**Cada conocimiento debe tener una representación única, no ambigua y con autoridad en el sistema.**

No duplique la lógica de negocio, reglas de validación o algoritmos.

### Tipos de duplicación

1. **Duplicación de lógica** ❌ Mismo código en varios lugares
2. **Duplicación de conocimiento** ❌ Mismas reglas de negocio redefinidas
3. **Duplicación estructural** ❌ Mismos patrones repetidos
4. **Duplicación de documentación** ❌ Misma información en varios formatos

### DRY vs WET (Write Everything Twice)

#### ⚠️ Advertencia: Duplicación aceptable

La duplicación de estructura (no de lógica) puede ser aceptable cuando se trata de diferentes tipos con type safety.

### Regla de los 3

> **No abstraer antes de haber visto el patrón 3 veces.**

```php
// ❌ Abstracción prematura (visto 1 vez)
abstract class AbstractIdValueObject
{
    // Demasiado pronto para abstraer
}

// ✅ Esperar 3 ocurrencias similares antes de extraer
// Después de 3-4 IDs similares → crear un trait o clase base
```

---

## YAGNI - You Aren't Gonna Need It

### Definición

**No implemente funcionalidades hasta que sean necesarias.**

No codifique para necesidades hipotéticas futuras.

### Checklist YAGNI

Antes de agregar una funcionalidad, pregúntese:

- [ ] **¿Se requiere AHORA?** (en el ticket/user story actual)
- [ ] **¿Está testeado?** (test existente que falla)
- [ ] **¿Está en el MVP?** (scope definido)
- [ ] **¿El cliente lo solicitó explícitamente?**

Si **NO** a alguna de estas preguntas → **YAGNI: No implementar**

---

## Anti-patrones comunes

### 1. Optimización Prematura

#### ❌ MALO

```php
<?php

// ❌ Optimización prematura: cache complejo antes de tener un problema de rendimiento
class ReservationRepository
{
    private array $cache = [];
    private array $cacheTimestamps = [];
    private const CACHE_TTL = 300;

    public function find(int $id): ?Reservation
    {
        // Cache multi-nivel antes de medir un problema
        if (isset($this->cache[$id])) {
            if (time() - $this->cacheTimestamps[$id] < self::CACHE_TTL) {
                return $this->cache[$id];
            }
        }

        // ...
    }
}
```

#### ✅ BUENO

```php
<?php

// ✅ Implementación simple primero
class DoctrineReservationRepository
{
    public function find(ReservationId $id): ?Reservation
    {
        return $this->entityManager->find(Reservation::class, $id);
    }
}

// ✅ Cache agregado SOLO si el profiling muestra un problema
// Con medidas concretas (N+1 queries, tiempo de respuesta > 200ms)
```

### 2. Gold Plating

Funcionalidades "cool" pero no requeridas que agregan complejidad innecesaria.

### 3. Generalidad Especulativa

Frameworks internos genéricos cuando ya tenemos Symfony.

### 4. Código Lasagna

Demasiadas capas de abstracción innecesarias.

---

## Checklist de validación

### Antes de cada commit

#### KISS
- [ ] Métodos < 20 líneas
- [ ] Complejidad ciclomática < 10
- [ ] Indentación max 3 niveles
- [ ] Parámetros max 4 por método
- [ ] Sin else anidados (early returns)
- [ ] Nomenclatura explícita (sin comentarios necesarios)

#### DRY
- [ ] Sin código duplicado (> 3 líneas idénticas)
- [ ] Validación centralizada (Value Objects)
- [ ] Reglas de negocio en un solo lugar
- [ ] Sin duplicación de conocimiento

#### YAGNI
- [ ] Funcionalidad solicitada explícitamente
- [ ] Test que falla existe
- [ ] En el scope del ticket actual
- [ ] Sin código "por si acaso"
- [ ] Sin abstracción prematura

### Herramientas de validación

```bash
# Detección duplicación (DRY)
vendor/bin/phpcpd src/

# Complejidad (KISS)
vendor/bin/phpmetrics --report-html=metrics src/

# Código muerto (YAGNI)
vendor/bin/phpstan analyse --level=max src/

# Métodos largos
vendor/bin/phpmd src/ text cleancode,codesize

# Todo en uno
make quality
```

### Métricas objetivo

| Métrica | Objetivo | Límite |
|----------|-------|--------|
| Líneas por método | < 10 | < 20 |
| Complejidad ciclomática | < 5 | < 10 |
| Líneas por clase | < 150 | < 200 |
| Duplicación | 0% | < 3% |
| Cobertura tests | > 80% | > 70% |
| Dependencias por clase | < 5 | < 7 |

---

## Recursos

- **Libro:** *The Pragmatic Programmer* - Andy Hunt & Dave Thomas
- **Libro:** *Clean Code* - Robert C. Martin
- **Artículo:** [KISS Principle](https://en.wikipedia.org/wiki/KISS_principle)
- **Artículo:** [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- **Artículo:** [YAGNI](https://martinfowler.com/bliki/Yagni.html)

---

**Fecha de última actualización:** 2025-01-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
