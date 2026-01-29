---
description: Mostrar el estado del sprint BMAD con informacion de enrutamiento
argument-hint: [--verbose]
---

# Estado Sprint BMAD

Mostrar el estado completo del sprint utilizando el seguimiento BMAD v6 con enrutamiento basado en maquina de estados.

## Argumentos

$ARGUMENTS (format: [--verbose])
- **--verbose** (opcional): Mostrar el detalle de las tareas por story

## Proceso

### Paso 1: Cargar sprint-status.yaml

1. Leer `.bmad/sprint-status.yaml`
2. Parsear metadatos, stories, reglas de enrutamiento
3. Si el archivo no existe, sugerir `/project:migrate-backlog`

### Paso 2: Extraer los metadatos

Mostrar la informacion del sprint:
- ID y nombre del sprint
- Fechas de inicio y fin
- Objetivo del sprint
- Dias restantes

### Paso 3: Contar las stories por estado

Agregar las stories por estado:
- 📋 Backlog
- 🎯 Listo para Dev
- 🔄 En Curso
- 👀 Revision
- ✅ Completado
- ⛔ Bloqueado

Calcular:
- Total de story points planificados
- Story points completados
- Velocidad (si hay historial disponible)
- Progreso burndown

### Paso 4: Mostrar la maquina de estados

```
backlog → ready-for-dev → in-progress → review → done
   ↓          ↓              ↓           ↓
   └──────────┴──────────────┴───────────┴→ blocked
```

### Paso 5: Mostrar la vista detallada (si --verbose)

Para cada story:
- ID y titulo
- Estado actual y fase TDD
- Detalle de las tareas (completadas/total)
- Estado de los criterios de aceptacion
- Tarea en curso
- Tiempo en el estado actual

### Paso 6: Sugerencias de auto-enrutamiento

Verificar si deberian producirse transiciones automaticas:
- Stories con todas las tareas completas → sugerir paso a revision
- Stories desbloqueadas → sugerir reanudar el estado anterior

## Formato de Salida

```
═══════════════════════════════════════════════════════
                  Estado Sprint BMAD
═══════════════════════════════════════════════════════

Sprint: {SPRINT_ID} - {NOMBRE_SPRINT}
Periodo: {FECHA_INICIO} → {FECHA_FIN} ({DIAS_RESTANTES} dias restantes)
Objetivo: {OBJETIVO_SPRINT}

Progreso: ▓▓▓▓▓▓▓▓░░░░░░░░░░░░ 40% (24/60 pts)

Stories por Estado:
──────────────────────────────────────────────────────
📋 Backlog:       2
🎯 Listo para Dev: 3
🔄 En Curso:      2
👀 Revision:      1
✅ Completado:    4
⛔ Bloqueado:     1

En Curso:
──────────────────────────────────────────────────────
🔄 US-005: Autenticacion de usuario
   TDD: 🟢 Green | Tareas: 3/5 | CA: 1/3
   En curso: TASK-015 - Implementar validacion JWT

Bloqueado:
──────────────────────────────────────────────────────
⛔ US-003: Integracion OAuth
   Razon: En espera de credenciales API
   Bloqueado desde: 2026-01-27 (2 dias)

Sugerencias de auto-enrutamiento:
──────────────────────────────────────────────────────
💡 US-008 tiene todas sus tareas completas → /sprint:transition US-008 review

Comandos:
  /sprint:next-story         Tomar la siguiente story
  /sprint:transition <ID>    Cambiar el estado
  /sprint:auto-route        Aplicar las transiciones auto
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/sprint:bmad-status
/sprint:bmad-status --verbose
```
