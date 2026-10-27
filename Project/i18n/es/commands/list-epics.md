---
description: Listar EPICs
argument-hint: [arguments]
---

# Listar EPICs

Mostrar la lista de todos los EPICs con su estado y progreso.

## Argumentos

$ARGUMENTS (opcional, formato: [estado] [prioridad])
- **Estado** (opcional, derivado de las stories): todo, in-progress, blocked, done, all (por defecto: all)
- **Prioridad** (opcional): high, medium, low

## Proceso

### Paso 1: Leer EPICs

1. Escanear directorio `project-management/backlog/epics/`
2. Leer cada archivo EPIC-XXX-*.md
3. Extraer los metadatos de contenido de cada EPIC (nombre, prioridad)
4. Leer los estados de sus stories desde `.bmad/sprint-status.yaml` (única fuente de verdad, esquema: `.claude/templates/project/sprint-status.md`)

### Paso 2: Filtrar (si hay argumentos)

Aplicar filtros solicitados:
- Por estado
- Por prioridad

### Paso 3: Calcular estadísticas

**El estado del EPIC se deriva, nunca se almacena**: todas las stories `backlog` (o ninguna story) = no iniciado; todas `done` = terminado; alguna `blocked` y ninguna en curso = bloqueado; en otro caso en curso.

Para cada EPIC:
- Contar USs totales
- Contar USs por estado
- Calcular porcentaje de progreso

### Paso 4: Mostrar

Generar tabla formateada con resultados.

## Formato de salida

```
📋 EPICs del Proyecto

| ID | Nombre | Estado | Prioridad | US | Progreso |
|----|-----|--------|----------|-----|-------------|
| EPIC-001 | Autenticación | 🟡 In Progress | High | 5 | ████░░░░░░ 40% |
| EPIC-002 | Catálogo | 🔴 To Do | Medium | 8 | ░░░░░░░░░░ 0% |
| EPIC-003 | Carrito | 🔴 To Do | High | 6 | ░░░░░░░░░░ 0% |

───────────────────────────────────────────────────
Resumen: 3 EPICs | 🔴 2 To Do | 🟡 1 In Progress | 🟢 0 Done
```

## Formato Compacto (si hay muchos EPICs)

```
📋 EPICs (12 total)

🔴 To Do (5):
   EPIC-002, EPIC-003, EPIC-004, EPIC-007, EPIC-010

🟡 In Progress (4):
   EPIC-001 (40%), EPIC-005 (60%), EPIC-008 (25%), EPIC-011 (80%)

⏸️ Blocked (1):
   EPIC-006 - Bloqueado por dependencia externa

🟢 Done (2):
   EPIC-009 ✓, EPIC-012 ✓
```

## Ejemplos

```
# Listar todos los EPICs
/project:list-epics

# Listar EPICs en progreso
/project:list-epics in-progress

# Listar EPICs de alta prioridad
/project:list-epics all high

# Listar EPICs bloqueados
/project:list-epics blocked
```

## Detalles del EPIC

Para ver detalles de un EPIC específico, sugerir:
```
Ver detalles: cat project-management/backlog/epics/EPIC-001-*.md
```
