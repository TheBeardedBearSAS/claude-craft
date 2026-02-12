# Guia de Gestion del Backlog

Flujo de trabajo completo para crear y gestionar un backlog SCRUM con Claude-Craft.

---

## Vision General

Claude-Craft proporciona un conjunto completo de comandos para gestionar tu product backlog siguiendo la metodologia SCRUM:

- **15 comandos slash** para operaciones de backlog
- **5 plantillas** para estructura consistente
- **Vertical slicing** obligatorio en todas las capas
- **Validacion INVEST** para User Stories

---

## Generacion Inicial del Backlog

```bash
# Desde especificaciones en ./docs/
/project:generate-backlog symfony+flutter
```

### Estructura Generada

```
project-management/
├── README.md                    # Vision general del proyecto
├── personas.md                  # Personas (min. 3)
├── definition-of-done.md        # Niveles DoD progresivos
├── backlog/
│   ├── epics/                   # EPIC-XXX-nombre.md
│   └── user-stories/            # US-XXX-nombre.md
└── sprints/
    └── sprint-XXX-objetivo/
```

---

## Estructura SCRUM

### Personas (minimo 3)
- Identidad, objetivos, frustraciones
- Formato: P-001, P-002...

### EPICs
- ID unico (EPIC-XXX)
- MMF (Minimum Marketable Feature)
- Objetivos de negocio y criterios de exito

### User Stories (modelo INVEST)

| Letra | Significado |
|-------|-------------|
| **I** | Independent - Sin dependencias |
| **N** | Negotiable - Detalles negociables |
| **V** | Valuable - Valor para el usuario |
| **E** | Estimable - Puede estimarse |
| **S** | Sized - Max 8 puntos |
| **T** | Testable - Criterios claros |

#### Criterios de Aceptacion (Gherkin)
- 1 escenario nominal
- 2 escenarios alternativos
- 2 escenarios de error

### Tasks (Tareas)

| Tipo | Descripcion |
|------|-------------|
| `[DB]` | Base de datos |
| `[BE]` | Backend |
| `[FE-WEB]` | Frontend Web |
| `[FE-MOB]` | Frontend Mobile |
| `[TEST]` | Testing |
| `[DOC]` | Documentacion |
| `[OPS]` | DevOps |
| `[REV]` | Code review |

---

## Flujo de Trabajo

```
To Do ──→ In Progress ──→ Done
   │            │
   └────→ Blocked ←────┘
```

---

## Referencia de Comandos

### Comandos de Creacion

| Comando | Descripcion |
|---------|-------------|
| `/project:generate-backlog [stack]` | Generar backlog desde specs |
| `/project:add-epic` | Crear nuevo EPIC |
| `/project:add-story` | Agregar User Story |
| `/project:add-task` | Crear tarea tecnica |

### Comandos de Visualizacion

| Comando | Descripcion |
|---------|-------------|
| `/project:list-epics` | Listar EPICs |
| `/project:list-stories` | Listar User Stories |
| `/project:list-tasks` | Listar tareas |
| `/project:board` | Tablero Kanban |
| `/project:sprint-status` | Estado del sprint |

### Comandos de Actualizacion

| Comando | Descripcion |
|---------|-------------|
| `/sprint:transition` | Cambiar estado/sprint de US |
| `/project:move-task` | Cambiar estado de tarea |
| `/project:update-epic` | Modificar EPIC |
| `/project:update-story` | Modificar User Story |

### Comandos Avanzados

| Comando | Descripcion |
|---------|-------------|
| `/project:decompose-tasks` | Descomponer US en tareas |
| `/gate:validate-backlog` | Auditar calidad SCRUM |

---

## Ejemplo Completo

```markdown
## Paso 1: Generar backlog inicial
/project:generate-backlog symfony+flutter

## Paso 2: Validar calidad
/gate:validate-backlog

## Paso 3: Ver Sprint 1
/project:board 1

## Paso 4: Descomponer en tareas
/project:decompose-tasks 1

## Paso 5: Comenzar trabajo
/project:move-task TASK-001 in-progress
```

---

## Plantillas Disponibles

| Plantilla | Proposito |
|-----------|-----------|
| `epic.md` | Estructura de EPIC |
| `user-story.md` | Estructura de User Story |
| `task.md` | Estructura de tarea |
| `board.md` | Tablero Kanban |
| `index.md` | Indice del backlog |

---

## Reglas SCRUM

| Regla | Valor |
|-------|-------|
| Duracion sprint | 2 semanas |
| Velocidad | 20-40 puntos/sprint |
| Max US | 8 puntos |
| Estimacion | Fibonacci (1,2,3,5,8,13,21) |
| Duracion tarea | 0.5h - 8h max |

### Sprint 1 = Walking Skeleton
- Infraestructura completa
- 1 feature end-to-end
- Testable en Web y Mobile

### Vertical Slicing
Cada US debe atravesar todas las capas:
```
UI → API → Logica de Negocio → Base de Datos
```

---

## Checklist

- [ ] Minimo 3 personas definidas
- [ ] EPICs con MMF y criterios de exito
- [ ] User Stories siguen INVEST
- [ ] Criterios en formato Gherkin
- [ ] Estimacion en Fibonacci
- [ ] Sprint 1 = Walking Skeleton
- [ ] Backlog validado

---

[&larr; Solucion de Problemas](06-troubleshooting.md) | [Siguiente: Configuracion Proyecto Nuevo &rarr;](08-setup-new-project.md)
