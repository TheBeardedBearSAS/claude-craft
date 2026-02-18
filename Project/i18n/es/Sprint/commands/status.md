---
description: Estado del Sprint
argument-hint: [arguments]
---

# Estado del Sprint

Mostrar métricas detalladas y progreso del sprint.

## Argumentos

$ARGUMENTS (opcional, formato: [sprint N])
- **sprint N** (opcional): Número de sprint
- Si no se especifica, muestra el sprint actual

## Proceso

### Paso 1: Identificar sprint

1. Encontrar sprint solicitado o sprint actual
2. Leer sprint-goal.md

### Paso 2: Recopilar datos

1. Leer todas las User Stories del sprint
2. Leer todas las Tareas asociadas
3. Calcular métricas

### Paso 3: Generar reporte

Crear reporte detallado con:
- Vista general
- Progreso por US
- Métricas de tiempo
- Gráfico burndown (texto)
- Bloqueadores
- Riesgos

## Formato de salida

```
╔══════════════════════════════════════════════════════════════════╗
║  📊 SPRINT 1 - REPORTE DE ESTADO                                ║
║  Generado: 2024-01-22 14:30                                     ║
╚══════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────┐
│ 🎯 OBJETIVO DEL SPRINT                                           │
├──────────────────────────────────────────────────────────────────┤
│ Walking Skeleton - Autenticación completa y primera página     │
│ Período: 2024-01-15 → 2024-01-29 (Día 8/14)                   │
└──────────────────────────────────────────────────────────────────┘

══════════════════════════════════════════════════════════════════════════
📈 VISTA GENERAL

Progreso general:
██████████████░░░░░░░░░░░░░░░░░░ 45%

│ Métrica           │ Actual │ Objetivo│ Estado │
├───────────────────┼────────┼────────┼────────┤
│ Puntos completados│ 5      │ 10     │ 🟡 50% │
│ Tareas completadas│ 8      │ 16     │ 🟡 50% │
│ Horas completadas │ 28h    │ 62h    │ 🟡 45% │
│ Días restantes    │ 6      │ -      │        │

══════════════════════════════════════════════════════════════════════════
📖 PROGRESO POR USER STORY

│ US      │ Nombre             │ Puntos │ Tareas   │ Estado          │
├─────────┼────────────────────┼────────┼──────────┼─────────────────┤
│ US-001  │ Inicio de sesión   │ 5      │ 6/10     │ 🟡 In Progress  │
│         │                    │        │ 60%      │ ██████░░░░      │
├─────────┼────────────────────┼────────┼──────────┼─────────────────┤
│ US-002  │ Lista de productos │ 5      │ 2/6      │ 🔴 To Do        │
│         │                    │        │ 33%      │ ███░░░░░░░      │

══════════════════════════════════════════════════════════════════════════
⏱️ MÉTRICAS DE TIEMPO

Estimado vs Real (horas):
│ Tipo    │ Est.   │ Real   │ Dif    │
├─────────┼────────┼────────┼────────┤
│ [DB]    │ 6h     │ 5.5h   │ -0.5h  │ ✅
│ [BE]    │ 20h    │ 12h    │ -      │ 🟡 En progreso
│ [FE-WEB]│ 12h    │ 3h     │ -      │ 🟡 En progreso
│ [FE-MOB]│ 14h    │ 0h     │ -      │ ⏸️ Bloqueado
│ [TEST]  │ 10h    │ 7.5h   │ -2.5h  │ ✅ Subestimado

Velocidad diaria: 4h/día (objetivo: 4.4h/día)

══════════════════════════════════════════════════════════════════════════
📉 BURNDOWN (simplificado)

Horas restantes por día:
62h │████████████████████████████████████████████████████████████████
    │█████████████████████████████████████████████████████░░░░░░░░░░░
    │██████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░
    │█████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │█████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    │████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ← Ideal
34h │████████████████████████████████████████████████ ← Real
    └───────────────────────────────────────────────────────────────
    D1  D2  D3  D4  D5  D6  D7  D8  D9  D10 D11 D12 D13 D14

Estado: 🟡 Ligeramente atrasado (6h)

══════════════════════════════════════════════════════════════════════════
⚠️ BLOQUEADORES

│ Tarea    │ US     │ Bloqueador                      │ Desde  │
├──────────┼────────┼─────────────────────────────────┼────────┤
│ TASK-008 │ US-001 │ Esperando auth API              │ 2 días │
│ TASK-021 │ US-002 │ Falta configuración SMTP        │ 1 día  │

Impacto: 14h bloqueadas (22% del sprint)

══════════════════════════════════════════════════════════════════════════
🚨 RIESGOS

│ Nivel  │ Descripción                           │ Mitigación              │
├────────┼───────────────────────────────────────┼─────────────────────────┤
│ 🔴 Alto│ Móvil bloqueado 2 días                │ Priorizar TASK-005      │
│ 🟡 Med │ 6h de retraso                         │ Posible overtime        │
│ 🟢 Bajo│ Tests subestimados                    │ Agregar buffer sprint 2 │

══════════════════════════════════════════════════════════════════════════
📋 ACCIONES RECOMENDADAS

1. 🔴 URGENTE: Desbloquear TASK-008 completando TASK-005
2. 🟡 Configurar SMTP para desbloquear TASK-021
3. 🟢 Revisar estimaciones de tests para futuros sprints

══════════════════════════════════════════════════════════════════════════

Acciones:
  /project:board                    # Ver Kanban
  /project:move-task TASK-XXX done  # Completar una tarea
  /project:list-tasks status blocked # Ver todos los bloqueadores
```

## Ejemplos

```
# Estado del sprint actual
/sprint:status

# Estado del sprint 2
/sprint:status sprint 2
```

## Generación de Reporte

El reporte también se guarda en:
`project-management/sprints/sprint-XXX/status-YYYY-MM-DD.md`

## Siguiente paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /sprint:next-story                                    ║
║    Tomar la siguiente story                              ║
║                                                          ║
║  → /sprint:dev                                           ║
║    Continuar el desarrollo                               ║
║                                                          ║
║  → /workflow:review                                      ║
║    Sprint review (si el sprint está completo)            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
