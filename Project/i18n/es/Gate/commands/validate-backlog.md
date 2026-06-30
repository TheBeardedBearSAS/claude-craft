---
description: "Validar las stories del backlog contra los criterios INVEST"
argument-hint: "[story-id] [--no-gate]"
---

# Validar Gate Backlog

Validar las User Stories contra los criterios INVEST.
Todas las stories deben aprobar los 6 criterios INVEST.

## Argumentos

$ARGUMENTS (format: [story-id] [--no-gate])
- **story-id** (opcional): Story específica a validar (ej: US-001). Si se omite, valida todas las stories.
- **--no-gate** (opcional): Ejecutar solo la validación INVEST simple (omitir la aplicación del gate de calidad, los umbrales de puntuación y el veredicto pasa/falla). Útil para verificaciones rápidas durante el refinement sin bloquear en los criterios del gate.

## Criterios INVEST

| Letra | Criterio | Descripción | Verificaciones |
|-------|----------|-------------|----------------|
| **I** | Independiente | Puede desarrollarse sola | Sin dependencias bloqueantes |
| **N** | Negociable | Los detalles pueden discutirse | Tiene descripción, no sobre-especificada |
| **V** | Valiosa | Aporta valor al usuario | Tiene criterios de aceptación, declaración de beneficio |
| **E** | Estimable | Puede ser estimada | Tiene story points |
| **S** | Suficientemente pequeña | Cabe en un sprint | ≤ 8 story points |
| **T** | Testeable | Puede ser probada | Tiene criterios de aceptación |

**Umbral: 6/6 para cada story**

## Proceso

### Paso 1: Cargar las stories

1. Leer `.bmad/sprint-status.yaml`
2. Obtener la story especificada o todas las stories
3. Cargar los detalles de cada story

### Paso 2: Validar INVEST para cada story

Para cada criterio:
- **Independiente**: Verificar que `blocked_by` esté vacío
- **Negociable**: Verificar la longitud de la descripción, el número de tareas
- **Valiosa**: Verificar que existen criterios de aceptación
- **Estimable**: Verificar que los story points > 0
- **Suficientemente pequeña**: Verificar que los story points ≤ 8
- **Testeable**: Verificar que el número de criterios de aceptación > 0

### Paso 3: Calcular las puntuaciones

Puntuación INVEST por story (0-6)

### Paso 4: Generar el informe

Mostrar resultados individuales y agregados.

## Formato de Salida

### Todas las Stories Aprueban

```
═══════════════════════════════════════════════════════
          Validación Gate INVEST Backlog
═══════════════════════════════════════════════════════

Validando 8 stories...

Resultados:
──────────────────────────────────────────────────────
✅ US-001: Inicio de sesión de usuario
   [I] ✓ Independiente - Sin dependencias
   [N] ✓ Negociable - Descripción clara
   [V] ✓ Valiosa - 3 criterios de aceptación
   [E] ✓ Estimable - 5 story points
   [S] ✓ Suficientemente pequeña - 5 ≤ 8 puntos
   [T] ✓ Testeable - CA Gherkin definidos
   Puntuación: 6/6 ✅

✅ US-002: Registro de usuario
   Puntuación: 6/6 ✅

Resumen:
──────────────────────────────────────────────────────
Stories validadas: 8
Aprobadas (6/6): 8
Advertencias (4-5/6): 0
Fallidas (<4/6): 0

✅ GATE BACKLOG APROBADO

Todas las stories cumplen los criterios INVEST.
Lista para planificación del sprint.
═══════════════════════════════════════════════════════
```

### Stories en Fallo

```
═══════════════════════════════════════════════════════
          Validación Gate INVEST Backlog
═══════════════════════════════════════════════════════

Validando 8 stories...

Resultados:
──────────────────────────────────────────────────────
✅ US-001: Inicio de sesión de usuario
   Puntuación: 6/6 ✅

⚠️ US-002: Registro de usuario
   [I] ✓ Independiente
   [N] ✓ Negociable
   [V] ✓ Valiosa
   [E] ✗ Estimable - Sin story points
   [S] ? Suficientemente pequeña - No se puede verificar sin puntos
   [T] ✓ Testeable
   Puntuación: 4/6 ⚠️

❌ US-003: Refactorización completa del sistema auth
   [I] ✗ Independiente - Bloqueada por US-001, US-002
   [N] ✗ Negociable - 15 tareas (demasiado especificada)
   [V] ✓ Valiosa
   [E] ✓ Estimable - 13 puntos
   [S] ✗ Suficientemente pequeña - 13 > 8 puntos
   [T] ✓ Testeable
   Puntuación: 3/6 ❌

Resumen:
──────────────────────────────────────────────────────
Stories validadas: 8
Aprobadas (6/6): 6
Advertencias (4-5/6): 1
Fallidas (<4/6): 1

❌ GATE BACKLOG FALLIDO

Acciones Requeridas:
──────────────────────────────────────────────────────
US-002:
  → Agregar la estimación en story points
  → Ejecutar: /project:update-story US-002 --points 3

US-003:
  → Dividir en stories más pequeñas (≤8 puntos cada una)
  → Eliminar detalles de tareas innecesarios
  → Resolver dependencias o reordenar
  → Considerar: /project:split-story US-003

Relanzar después de correcciones: /gate:validate-backlog
═══════════════════════════════════════════════════════
```

### Validación de Story Única

```
═══════════════════════════════════════════════════════
          Validación INVEST: US-005
═══════════════════════════════════════════════════════

📖 US-005: Verificación de email

Análisis INVEST:
──────────────────────────────────────────────────────
[I] ✓ Independiente
    Sin dependencias bloqueantes

[N] ✓ Negociable
    Descripción: 45 palabras
    Tareas: 4 (razonable)

[V] ✓ Valiosa
    "Como usuario, quiero verificar mi email
     para poder asegurar mi cuenta"
    Criterios de aceptación: 3

[E] ✓ Estimable
    Story Points: 3

[S] ✓ Suficientemente pequeña
    3 puntos ≤ 8 puntos

[T] ✓ Testeable
    3 escenarios Gherkin definidos

Puntuación: 6/6 ✅
──────────────────────────────────────────────────────

✅ Story cumple los criterios INVEST

Estado: ready-for-dev
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/gate:validate-backlog
/gate:validate-backlog US-005
```

## Corrección de Problemas Comunes

### Story demasiado grande (S)
```
/project:split-story US-003
```

### Story points faltantes (E)
```
/project:update-story US-002 --points 3
```

### Criterios de aceptación faltantes (V, T)
```
/project:add-ac US-002 "Given... When... Then..."
```

Configuración del gate: `.bmad/gates/backlog-gate.yaml`

## Siguiente Paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Si PASS (≥ umbral):                                     ║
║  → /gate:validate-sprint                                 ║
║    Validar la preparación del sprint                     ║
║                                                          ║
║  Si FAIL (< umbral):                                     ║
║  → Corregir los problemas identificados                  ║
║  → /gate:validate-backlog (re-run tras correcciones)     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
