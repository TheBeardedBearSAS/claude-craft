---
name: sprint-dev
description: Inicia el desarrollo TDD/BDD de un sprint con actualizacion automatica de estados
arguments:
  - name: sprint
    description: Numero de sprint, "next" para el proximo incompleto, o "current"
    required: true
---

# /project:sprint-dev

## Objetivo

Orquestar el desarrollo completo de un sprint en modo TDD/BDD con:
- **Plan mode obligatorio** antes de cada implementacion
- **Ciclo TDD** (RED → GREEN → REFACTOR)
- **Actualizacion automatica** de estados (Tarea → User Story → Sprint)
- **Seguimiento de progreso** y metricas

## Prerrequisitos

- Sprint existente con tareas descompuestas
- Archivos presentes: `sprint-backlog.md`, `tasks/*.md`
- Ejecutar `/project:decompose-tasks N` primero si es necesario

## Argumentos

```bash
/project:sprint-dev 1        # Sprint 1
/project:sprint-dev next     # Proximo sprint incompleto
/project:sprint-dev current  # Sprint actualmente activo
```

---

## Workflow

### Fase 1: Inicializacion

1. Cargar sprint desde `project-management/sprints/sprint-N-*/`
2. Leer `sprint-backlog.md` para obtener User Stories
3. Listar tareas por US (ordenadas por dependencias)
4. Mostrar board inicial

### Fase 2: Bucle User Story

Para cada US en estado To Do o In Progress:
1. Marcar US → In Progress
2. Mostrar criterios de aceptacion (Gherkin)
3. Procesar cada tarea de la US

### Fase 3: Bucle Tarea (Workflow TDD)

Para cada tarea en To Do:

#### 3.1 Plan Mode (OBLIGATORIO)

⚠️ **SIEMPRE activar plan mode antes de implementar**

- Explorar codigo impactado
- Documentar analisis
- Proponer plan de implementacion
- Esperar validacion del usuario

#### 3.2 Ciclo TDD

```
🔴 RED    : Escribir tests que fallan
🟢 GREEN  : Implementar codigo minimo
🔧 REFACTOR : Mejorar sin romper tests
```

#### 3.3 Definition of Done

- [ ] Codigo escrito y funcional
- [ ] Tests pasan
- [ ] Codigo revisado (si existe tarea [REV])

#### 3.4 Marcar Tarea → Done

- Actualizar metadatos
- Commit convencional
- Actualizar board

### Fase 4: Validacion US

Cuando todas las tareas de una US estan Done:
- Verificar criterios de aceptacion
- Ejecutar tests E2E
- Marcar US → Done

### Fase 5: Cierre Sprint

Cuando todas las US estan Done:
- Mostrar resumen
- Generar sprint-review.md
- Generar sprint-retro.md

---

## Orden de Procesamiento

| Orden | Tipo | Descripcion |
|-------|------|-------------|
| 1 | `[DB]` | Base de datos |
| 2 | `[BE]` | Backend |
| 3 | `[FE-WEB]` | Frontend Web |
| 4 | `[FE-MOB]` | Frontend Mobile |
| 5 | `[TEST]` | Tests adicionales |
| 6 | `[DOC]` | Documentacion |
| 7 | `[REV]` | Code Review |

---

## Comandos de Control

| Comando | Accion |
|---------|--------|
| `continue` | Validar plan y proceder |
| `skip` | Saltar esta tarea |
| `block [razon]` | Marcar como bloqueada |
| `stop` | Detener sprint-dev |
| `status` | Mostrar progreso |
| `board` | Mostrar Kanban |

---

## Gestion de Bloqueos

```
⚠️ Tarea Bloqueada

TASK-003 no puede continuar.
Razon: Esperando especificaciones API

Opciones:
[1] Saltar y continuar con siguiente tarea
[2] Intentar resolver el bloqueo
[3] Detener sprint-dev
```

---

## Actualizaciones Automaticas

A cada cambio de estado:
1. Archivo tarea: status, time_spent
2. Archivo US: progreso tareas
3. Archivo EPIC: progreso US
4. board.md: columnas Kanban
5. index.md: metricas globales

---

## Ejemplo

```bash
> /project:sprint-dev 1

📋 Sprint 1: Walking Skeleton
   3 US, 17 tareas

🎯 Iniciando US-001: Autenticacion (5 pts)

▶️ TASK-001 [DB] Crear entidad User

⚠️ PLAN MODE ACTIVADO
   Analizando...

> continue

🧪 CICLO TDD
🔴 RED: Escribiendo tests...
🟢 GREEN: Implementando...
🔧 REFACTOR: Mejoras?

✅ Definition of Done: PASADO

📝 Commit creado

▶️ TASK-002 [BE] Servicio autenticacion...
```

---

## Comandos Relacionados

| Comando | Uso |
|---------|-----|
| `/project:decompose-tasks N` | Crear tareas antes |
| `/project:board N` | Ver Kanban |
| `/project:sprint-status N` | Ver metricas |
| `/project:move-task` | Cambiar estado tarea |
| `/project:move-story` | Cambiar estado US |
