---
description: Validar la alineación spec-código para garantizar que la implementación coincide con las especificaciones
argument-hint: [id-story]
---

# Validar Alineación Spec-Código

Validar que la implementación del código está alineada con las especificaciones (PRD, user stories, spec técnica). Este gate asegura que no se ha producido deriva de especificación durante la implementación.

## Argumentos

$ARGUMENTS (formato: [id-story])
- **id-story** (opcional): ID de la story a verificar. Por defecto: todas las stories del sprint actual

## Criterios del Gate

| Criterio | Peso | Requerido | Descripción |
|----------|------|-----------|-------------|
| Cobertura de requirements | 20% | Sí | Todos los FR-xxx del PRD cubiertos por stories |
| Mapeo story-código | 20% | Sí | Todas las stories tienen referencias de código |
| Mapeo AC-test | 20% | Sí | Todos los criterios de aceptación tienen tests |
| Adherencia al spec técnico | 15% | Sí | La implementación sigue el diseño del spec técnico |
| Conformidad constitución | 15% | Sí | El código respeta la constitución del proyecto |
| Detección de deriva | 10% | No | Sin cambios de código no referenciados |

**Umbral: 85%**

## Proceso

### Paso 1: Cargar especificaciones

1. Cargar el PRD con los IDs de requirements FR-xxx
2. Cargar las user stories con las referencias `Implements:`
3. Cargar el spec técnico con el mapeo de requirements
4. Cargar la constitución del proyecto (si existe)

### Paso 2: Trazado hacia adelante (Spec → Código)

Para cada requirement FR-xxx en el PRD:
1. Encontrar stories que lo implementan (`Implements: FR-xxx`)
2. Para cada story, encontrar archivos de código con `// Story: US-xxx`
3. Para cada AC, encontrar el test correspondiente
4. Registrar el estado de cobertura

### Paso 3: Trazado hacia atrás (Código → Spec)

Para cada archivo de código con referencias de story:
1. Verificar que la referencia de story existe en el backlog
2. Verificar que la story está asignada al sprint correcto
3. Buscar cambios de código sin referencias de story (deriva)

### Paso 4: Validar la constitución

Si `project-management/constitution.md` existe:
1. Verificar conformidad de restricciones técnicas
2. Verificar adherencia a principios de diseño
3. Verificar objetivos NFR

### Paso 5: Puntuar y reportar

Calcular puntuación ponderada en todos los criterios. Generar reporte detallado.

## Formato de salida

### Gate aprobado

```
╔══════════════════════════════════════════════════════════╗
║          GATE ALINEACIÓN SPEC-CÓDIGO ✅                  ║
╠══════════════════════════════════════════════════════════╣
║ Story: US-012 | Puntuación: 92%                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ ✅ Cobertura requirements     3/3 FR-xxx cubiertos       ║
║ ✅ Mapeo story-código         4 archivos ref. US-012     ║
║ ✅ Mapeo AC-test              3/3 ACs tienen tests       ║
║ ✅ Adherencia spec técnico    Diseño conforme al spec    ║
║ ✅ Conformidad constitución   Todas las restricciones OK ║
║ ⚠️  Detección de deriva       1 archivo no referenciado  ║
║                                                          ║
║ → Alineación verificada, listo para merge                ║
╚══════════════════════════════════════════════════════════╝
```

### Gate fallido

```
╔══════════════════════════════════════════════════════════╗
║          GATE ALINEACIÓN SPEC-CÓDIGO ❌                  ║
╠══════════════════════════════════════════════════════════╣
║ Story: US-012 | Puntuación: 65%                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ ✅ Cobertura requirements     3/3 FR-xxx cubiertos       ║
║ ❌ Mapeo story-código         2 archivos sin referencias ║
║ ❌ Mapeo AC-test              AC-2 no tiene test         ║
║ ✅ Adherencia spec técnico    Diseño conforme al spec    ║
║ ❌ Conformidad constitución   NFR de rendimiento no OK   ║
║ ⚠️  Detección de deriva       3 archivos no referenciados║
║                                                          ║
║ Acciones requeridas:                                     ║
║ 1. Agregar // Story: US-012 a ProfileService.ts         ║
║ 2. Agregar // Story: US-012 a ProfileValidator.ts       ║
║ 3. Escribir test para AC-2: Usuario puede editar email  ║
║ 4. Optimizar API de perfil para meta de <200ms          ║
║                                                          ║
║ → Corregir problemas antes del merge                     ║
╚══════════════════════════════════════════════════════════╝
```

## Ejemplo

```
/gate:validate-alignment US-012
/gate:validate-alignment          # Todas las stories del sprint actual
```

## Comandos relacionados

- `/project:trace` — Ver matriz de trazabilidad
- `/project:coverage-map` — Verificar cobertura de requirements
- `/project:checkpoint` — Ejecutar checkpoints de fase
- `/gate:validate-story` — Validar completitud de la story
