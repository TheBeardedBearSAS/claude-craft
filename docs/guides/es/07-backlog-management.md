# Guía de Gestión del Backlog

Flujo de trabajo completo para crear y gestionar un backlog SCRUM con Claude-Craft.

---

## Visión General

Claude-Craft proporciona un conjunto completo de comandos para gestionar tu product backlog siguiendo la metodología SCRUM:

- **Un único comando `/project:backlog`** (`add`, `list`, `edit`, `move`, más `next story` y `move story --auto` para el enrutamiento de historias) junto con `/workflow:plan --only=backlog`, `/workflow:start` y `/workflow:status --board`; los antiguos comandos por entidad (add-*, list-*, update-*, move-task, generate-backlog, decompose-tasks, board) y el namespace de sprint se eliminaron en 9.0 (ver MIGRATION-v9)
- **5 plantillas** para estructura consistente
- **Vertical slicing** obligatorio en todas las capas tecnológicas
- **Validación del modelo INVEST** para las User Stories

### Filosofía

Basada en:
- Principios del Manifiesto Ágil
- Los 12 Principios Ágiles
- Fundamentos de SCRUM
- Vertical slicing (cada US atraviesa todas las capas)

---

## Generación Inicial del Backlog

### Desde Especificaciones

Coloca las especificaciones de tu proyecto en `./docs/` y luego ejecuta:

```bash
/workflow:plan --only=backlog symfony+flutter
```

### Estructura Generada

```
project-management/
├── README.md                    # Visión general del proyecto
├── personas.md                  # Personas de usuario (mín. 3)
├── definition-of-done.md        # Niveles de DoD progresivos
├── dependencies-matrix.md       # Dependencias entre EPICs y US
├── backlog/
│   ├── epics/                   # Archivos EPIC-XXX-nombre.md
│   └── user-stories/            # Archivos US-XXX-nombre.md
└── sprints/
    └── sprint-XXX-objetivo/     # Planes de sprint
```

---

## Estructura SCRUM

### Personas

Se requieren mínimo 3 personas, cada una con:
- **Identidad**: Nombre, rol, datos demográficos
- **Objetivos**: Lo que quieren lograr
- **Frustraciones**: Puntos de dolor que resolver

Formato: `P-001`, `P-002`, `P-003`...

### EPICs

Funcionalidades grandes que contienen múltiples User Stories:

| Campo | Descripción |
|-------|-------------|
| ID | Identificador único (EPIC-001, EPIC-002...) |
| MMF | Minimum Marketable Feature |
| Estado | Draft, Ready, In Progress, Done |
| Objetivos de Negocio | Por qué este EPIC es importante |
| Criterios de Éxito | Cómo medir el éxito |

### User Stories

Siguen el modelo **INVEST**:

| Letra | Significado | Validación |
|-------|-------------|------------|
| **I** | Independent (Independiente) | Sin dependencias de otras US |
| **N** | Negotiable (Negociable) | Los detalles pueden discutirse |
| **V** | Valuable (Valiosa) | Aporta valor al usuario |
| **E** | Estimable | Puede dimensionarse en puntos |
| **S** | Sized (Dimensionada) | Máx. 8 story points |
| **T** | Testable (Verificable) | Tiene criterios de aceptación claros |

#### Las 3 C

1. **Card (Tarjeta)**: Descripción breve
2. **Conversation (Conversación)**: Detalles de la discusión
3. **Confirmation (Confirmación)**: Criterios de aceptación

#### Criterios de Aceptación (Gherkin)

Cada US requiere:
- 1 escenario nominal (happy path)
- 2 escenarios alternativos
- 2 escenarios de error

```gherkin
Scenario: El usuario inicia sesión correctamente
  Given un usuario registrado con credenciales válidas
  When envía el formulario de inicio de sesión
  Then debería ver su panel de control
  And se debería crear una sesión
```

### Tareas

Elementos de trabajo técnico dentro de una User Story:

| Tipo | Descripción | Duración Típica |
|------|-------------|-----------------|
| `[DB]` | Base de datos (entidades, migraciones) | 1-3h |
| `[BE]` | Backend (servicios, APIs) | 2-4h |
| `[FE-WEB]` | Frontend Web (controladores, plantillas) | 2-4h |
| `[FE-MOB]` | Frontend Móvil (pantallas, blocs) | 3-5h |
| `[TEST]` | Testing (unitario, integración, E2E) | 2-4h |
| `[DOC]` | Documentación | 0.5-1h |
| `[OPS]` | DevOps (CI/CD, despliegue) | 1-2h |
| `[REV]` | Revisión de código | 1-2h |

**Reglas de estimación:**
- Duración de tarea: 0.5h - 8h máx.
- Story points (Fibonacci): 1, 2, 3, 5, 8, 13, 21
- Tamaño máx. de US: 8 puntos (dividir si es mayor)

---

## Flujo de Trabajo

### Flujo de Estados

```
┌─────────┐     ┌─────────────┐     ┌──────┐
│  To Do  │ ──→ │ In Progress │ ──→ │ Done │
└─────────┘     └─────────────┘     └──────┘
     │                │
     │                ↓
     └────────→ ┌─────────┐
                │ Blocked │
                └─────────┘
                     │
                     ↓
              ┌─────────────┐
              │ In Progress │
              └─────────────┘
```

**Transiciones prohibidas:**
- To Do → Done (debe pasar por In Progress)
- Cualquier estado → To Do (excepto reapertura manual)

---

## Referencia de Comandos

### Comandos de Creación

| Comando | Descripción |
|---------|-------------|
| `/workflow:plan --only=backlog [stack]` | Generar backlog completo desde specs |
| `/project:backlog add epic` | Crear un nuevo EPIC |
| `/project:backlog add story` | Añadir una User Story a un EPIC |
| `/project:backlog add task` | Crear una tarea técnica para una US |

### Comandos de Visualización

| Comando | Descripción |
|---------|-------------|
| `/project:backlog list epic` | Mostrar todos los EPICs con su estado |
| `/project:backlog list story [filtro]` | Listar User Stories (por EPIC, Sprint, Estado) |
| `/project:backlog list task [filtro]` | Listar tareas (por US, Sprint, Tipo, Estado) |
| `/workflow:status --board [sprint]` | Mostrar tablero Kanban |
| `/workflow:status [sprint]` | Informe detallado de progreso del sprint |

### Comandos de Actualización

| Comando | Descripción |
|---------|-------------|
| `/project:backlog move story [id] [estado/sprint]` | Cambiar estado de US o asignarla a un sprint |
| `/project:backlog move task [id] [estado]` | Cambiar estado de una tarea |
| `/project:backlog edit epic [id]` | Modificar un EPIC existente |
| `/project:backlog edit story [id]` | Modificar una User Story existente |

### Comandos Avanzados

| Comando | Descripción |
|---------|-------------|
| `/workflow:start [sprint]` | Descomponer las US del sprint en tareas |
| `/gate:check backlog` | Auditar la calidad del backlog (conformidad SCRUM) |

---

## Ejemplo Completo: Proyecto Nuevo

### Paso 1: Generar el Backlog Inicial

```bash
# Asegúrate de que las specs estén en ./docs/
/workflow:plan --only=backlog symfony+flutter
```

### Paso 2: Validar la Calidad

```bash
/gate:check backlog
```

Esto genera `scrum-validation-report.md` con:
- Puntuación de conformidad INVEST
- Verificación de las 3 C
- Análisis de criterios SMART
- Consistencia de estimaciones

### Paso 3: Revisar el Sprint 1

```bash
/workflow:status --board 1
```

Muestra el tablero Kanban con columnas:
- To Do | In Progress | In Review | Done | Blocked

### Paso 4: Descomponer en Tareas

```bash
/workflow:start 1
```

Crea un desglose detallado de tareas:
- Tareas agrupadas por US
- Grafo de dependencias (Mermaid)
- Estimaciones de tiempo por capa

### Paso 5: Empezar a Trabajar

```bash
# Mover la primera tarea a en progreso
/project:backlog move task TASK-001 in-progress

# Después, marcar como hecha
/project:backlog move task TASK-001 done

# Si está bloqueada
/project:backlog move task TASK-002 blocked "Esperando specs de la API"
```

### Paso 6: Seguir el Progreso

```bash
/workflow:status 1
```

### Paso 7: Configurar Monitoreo Recurrente (Opcional)

Usa `/loop` (v2.1.71+) para monitorear automáticamente el progreso del sprint:

```bash
# Verificar el estado del sprint cada 30 minutos
/loop 30m /workflow:status 1

# Ejecutar verificaciones pre-commit cada 5 minutos durante el desarrollo
/loop 5m /gate:check commit
```

Alias: `/proactive` (v2.1.105+).

Muestra:
- Progreso global y burndown
- Métricas por User Story
- Bloqueantes y riesgos
- Acciones recomendadas

---

## Plantillas

Claude-Craft proporciona 5 plantillas para una estructura de backlog consistente:

| Plantilla | Propósito |
|-----------|-----------|
| `epic.md` | Estructura de archivo EPIC con metadatos, objetivos y lista de US |
| `user-story.md` | Estructura de US con criterios Gherkin y tabla de tareas |
| `task.md` | Estructura de tarea con checklist de DoD |
| `board.md` | Tablero Kanban con cálculo de métricas |
| `index.md` | Índice del backlog con resumen global |

---

## Reglas SCRUM Aplicadas

| Regla | Valor |
|-------|-------|
| Duración del sprint | 2 semanas (fija) |
| Velocidad | 20-40 puntos/sprint |
| Tamaño máx. de US | 8 puntos (dividir si es mayor) |
| Escala de estimación | Fibonacci (1, 2, 3, 5, 8, 13, 21) |
| Duración de tarea | 0.5h - 8h máx. |

### Sprint 1: Walking Skeleton

El primer sprint debe incluir:
- Configuración completa de la infraestructura
- 1 funcionalidad end-to-end (no solo configuración)
- Verificable tanto en Web como en Móvil

### Vertical Slicing

**Cada User Story DEBE atravesar todas las capas:**

```
UI (Web/Móvil) → API → Lógica de Negocio → Base de Datos
```

No se permiten User Stories solo de "Backend", solo de "Frontend" o solo de "Móvil".

---

## Checklist: Backlog Listo

- [ ] Mínimo 3 personas definidas
- [ ] Los EPICs tienen MMF y criterios de éxito
- [ ] Las User Stories siguen el modelo INVEST
- [ ] Criterios de aceptación en formato Gherkin
- [ ] Historias estimadas en puntos Fibonacci
- [ ] Sprint 1 = Walking Skeleton
- [ ] Definition of Done documentada
- [ ] Backlog validado (`/gate:check backlog`)

---

[&larr; Solución de Problemas](06-troubleshooting.md) | [Siguiente: Configuración de Proyecto Nuevo &rarr;](08-setup-new-project.md)
