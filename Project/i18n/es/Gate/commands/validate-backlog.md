---
description: Validar las stories del backlog contra los criterios INVEST
argument-hint: [story-id]
---

# Validar Gate Backlog

Validar las User Stories contra los criterios INVEST.
Todas las stories deben aprobar los 6 criterios INVEST.

## Argumentos

$ARGUMENTS (format: [story-id])
- **story-id** (opcional): Story especifica a validar (ej: US-001). Si se omite, valida todas las stories.

## Criterios INVEST

| Letra | Criterio | Descripcion | Verificaciones |
|-------|----------|-------------|----------------|
| **I** | Independiente | Puede desarrollarse sola | Sin dependencias bloqueantes |
| **N** | Negociable | Los detalles pueden discutirse | Tiene descripcion, no sobre-especificada |
| **V** | Valiosa | Aporta valor al usuario | Tiene criterios de aceptacion |
| **E** | Estimable | Puede ser estimada | Tiene story points |
| **S** | Suficientemente pequena | Cabe en un sprint | ≤ 8 story points |
| **T** | Testeable | Puede ser probada | Tiene criterios de aceptacion |

**Umbral: 6/6 para cada story**

## Formato de Salida

### Todas las Stories Aprueban

```
═══════════════════════════════════════════════════════
          Validacion Gate INVEST Backlog
═══════════════════════════════════════════════════════

Validando 8 stories...

Resultados:
──────────────────────────────────────────────────────
✅ US-001: Inicio de sesion de usuario
   [I] ✓ Independiente - Sin dependencias
   [N] ✓ Negociable - Descripcion clara
   [V] ✓ Valiosa - 3 criterios de aceptacion
   [E] ✓ Estimable - 5 story points
   [S] ✓ Suficientemente pequena - 5 ≤ 8 puntos
   [T] ✓ Testeable - CA Gherkin definidos
   Puntuacion: 6/6 ✅

Resumen:
──────────────────────────────────────────────────────
Stories validadas: 8
Aprobadas (6/6): 8
Advertencias (4-5/6): 0
Fallidas (<4/6): 0

✅ GATE BACKLOG APROBADO
═══════════════════════════════════════════════════════
```

### Stories en Fallo

```
═══════════════════════════════════════════════════════
          Validacion Gate INVEST Backlog
═══════════════════════════════════════════════════════

⚠️ US-002: Registro de usuario
   Puntuacion: 4/6 ⚠️
   Faltante: [E] Estimable - Sin story points

❌ US-003: Refactorizacion completa del sistema auth
   Puntuacion: 3/6 ❌
   Faltante: [I] Independiente, [N] Negociable, [S] Suficientemente pequena

❌ GATE BACKLOG FALLIDO

Acciones Requeridas:
──────────────────────────────────────────────────────
US-002:
  → Agregar la estimacion en story points
  → Ejecutar: /project:update-story US-002 --points 3

US-003:
  → Dividir en stories mas pequenas (≤8 puntos cada una)
  → Considerar: /project:split-story US-003

Relanzar despues de correcciones: /gate:validate-backlog
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/gate:validate-backlog
/gate:validate-backlog US-005
```
