---
description: Validación de Arquitectura PHP
argument-hint: [argumentos]
---

# Validación de Arquitectura PHP

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto PHP a auditar, por defecto el directorio actual)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca múltiples módulos o requiere una investigación transversal.

## MISIÓN

Eres un arquitecto de software PHP experto. Audita la arquitectura de un proyecto PHP nativo (sin framework) contra Clean Architecture, Hexagonal Architecture, patrones tácticos de DDD y reglas de autocarga PSR-4.

**Reglas de referencia**: `.claude/rules/php-architecture.md`

### Paso 1: Análisis de la Estructura del Proyecto

1. Identificar la raíz del proyecto (usar $ARGUMENTS o directorio actual)
2. Leer `composer.json` — verificar versión de PHP (≥ 8.4, idealmente 8.5) y mapeo de autocarga PSR-4
3. Mapear la estructura del directorio `src/` y las capas esperadas
4. Listar todos los namespaces de nivel superior

**Estructura esperada** (PHP nativo):

```
src/
├── Domain/              # Lógica de negocio pura (Entities, Value Objects, Domain Events)
│   ├── Entity/
│   ├── ValueObject/
│   ├── Event/
│   └── Exception/
├── Application/         # Use Cases / Commands / Queries, orquestación
│   ├── UseCase/
│   ├── DTO/
│   └── Port/            # Interfaces consumidas por Application
└── Infrastructure/      # Adapters (DB, HTTP, filesystem, APIs externas)
    ├── Persistence/
    ├── Http/
    └── Adapter/
tests/
├── Unit/
├── Integration/
└── Fixtures/
```

### Paso 2: Verificación de Separación de Capas (6 pts)

- [ ] La capa Domain tiene **cero** dependencias en Application o Infrastructure
- [ ] La capa Application depende **solo** de abstracciones de Domain (interfaces/ports)
- [ ] Infrastructure implementa puertos de Domain/Application, nunca al revés
- [ ] No hay código específico de framework filtrado en Domain
- [ ] `declare(strict_types=1);` en la parte superior de cada archivo

**Comando de detección**:

```bash
docker compose exec app grep -rn "use.*Infrastructure" src/Domain/ src/Application/
# Esperado: sin coincidencias
```

### Paso 3: Puertos y Adaptadores (5 pts)

- [ ] Puertos de entrada (interfaces) definidos en `Application/Port/In/` o similar
- [ ] Puertos de salida definidos en `Application/Port/Out/` o `Domain/Port/`
- [ ] Adaptadores en `Infrastructure/` implementan esos puertos
- [ ] Inyección de Dependencias vía constructor (sin service locator, sin estado estático)

### Paso 4: Modelado de Dominio (5 pts)

- [ ] Las Entities tienen identidad e invariantes aplicados en constructores / constructores nombrados
- [ ] Los Value Objects son inmutables (clases `readonly` PHP 8.2+, o propiedades readonly)
- [ ] Los Aggregates encapsulan invariantes; mutación externa imposible
- [ ] Domain events emitidos para cambios de estado relevantes
- [ ] Las excepciones son específicas del dominio (extienden una `DomainException` base)

### Paso 5: Casos de Uso (4 pts)

- [ ] Un caso de uso = una clase con un único método público (`execute()`, `handle()`, o `__invoke()`)
- [ ] Entrada como un objeto DTO / Command / Query dedicado
- [ ] Salida como un DTO de retorno o void (para comandos)
- [ ] Límites transaccionales manejados en el nivel Application, no Domain

### Paso 6: PSR-4 y Reglas de Dependencias (3 pts)

- [ ] La autocarga de `composer.json` es compatible con PSR-4
- [ ] El namespace coincide exactamente con la estructura de directorios
- [ ] Sin dependencias circulares (`deptrac` o `phparkitect` para verificar)
- [ ] El acoplamiento entre módulos es explícito y documentado

**Comando de detección**:

```bash
docker compose exec app composer dump-autoload --strict-psr
docker compose exec app vendor/bin/deptrac analyse --fail-on-uncovered
```

### Paso 7: Patrones Alternativos (2 pts)

Aceptar alternativas pragmáticas cuando estén justificadas:

| Patrón | Cuándo es aceptable |
|---|---|
| **Vertical Slice Architecture** | App pequeña, CRUD intensivo, sin reutilización entre features |
| **Modular Monolith** | Múltiples bounded contexts dentro de un único desplegable |
| **Simple layered** | Dominio es trivial — no sobreingeniería |

Señalar sobreingeniería (abstracciones vacías, mapeo excesivo de DTOs) como un problema.

## FORMATO DE SALIDA

```
AUDITORÍA DE ARQUITECTURA PHP
==============================

PUNTUACIÓN: XX/25

SEPARACIÓN DE CAPAS (X/6)
  Fortalezas:
  - [...]
  Problemas:
  - [archivo:línea] descripción

PUERTOS Y ADAPTADORES (X/5)
  [...]

MODELADO DE DOMINIO (X/5)
  [...]

CASOS DE USO (X/4)
  [...]

PSR-4 Y REGLAS DE DEPENDENCIAS (X/3)
  [...]

ADECUACIÓN DEL PATRÓN (X/2)
  [...]

TOP 3 ACCIONES:
1. [CRÍTICO] Descripción
   Archivos: src/...
   Esfuerzo: Bajo/Medio/Alto
2. [...]
3. [...]

PATRÓN RECOMENDADO: [Clean / Hexagonal / VSA / Modular Monolith]
```

## NOTAS IMPORTANTES

- Usar Docker para todas las herramientas de análisis (`composer`, `deptrac`, `phparkitect`)
- Citar referencias concretas `archivo:línea` para cada problema
- No imponer Clean Architecture si el dominio es trivial — favorecer el pragmatismo
- Señalar inmediatamente las filtraciones de framework (un proyecto PHP nativo no debe depender de clases Symfony/Laravel)
