---
name: workflow-plan
description: Ejecutar la fase de Planificacion - creacion del PRD, personas y generacion del backlog
arguments:
  - name: continue
    description: Continuar desde donde se dejo
    required: false
---

# /workflow:plan

## Mision

Ejecutar la fase de Planificacion del flujo de trabajo de desarrollo. Esta fase se centra en crear el Documento de Requisitos del Producto, definir personas y generar el backlog inicial del producto.

## Cuando usar

- Flujos **Standard** y **Enterprise**
- Despues de `/workflow:init` (o `/workflow:analyze` para Enterprise)
- Al comenzar la planificacion de funcionalidades

## Flujo de trabajo

### Paso 1: Configuracion de la planificacion

```
╔══════════════════════════════════════════════════════════╗
║             FASE DE PLANIFICACION - INICIANDO              ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Fase: 2 de 4 - Planificacion                              ║
║                                                           ║
║ Objetivos:                                                ║
║ • Crear o actualizar Documento de Requisitos del Producto ║
║ • Definir user personas                                   ║
║ • Generar backlog del producto con user stories            ║
║   priorizadas                                             ║
║ • Establecer metricas de exito y KPIs                     ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 2: Verificar artefactos existentes

```
╔══════════════════════════════════════════════════════════╗
║              VERIFICACION DE ARTEFACTOS EXISTENTES        ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Verificando project-management/ ...                       ║
║                                                           ║
║ PRD:                                                      ║
║ ├── ❌ prd.md                    No encontrado            ║
║                                                           ║
║ Personas:                                                 ║
║ ├── ❌ personas.md               No encontrado            ║
║                                                           ║
║ Backlog:                                                  ║
║ ├── ❌ backlog/                  No encontrado            ║
║                                                           ║
║ Analisis (Enterprise):                                    ║
║ ├── ✅ analysis/constraints.md   Disponible               ║
║ └── ✅ analysis/research.md      Disponible               ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 3: Tareas de planificacion

Ejecutar las tareas de planificacion en orden:

```
╔══════════════════════════════════════════════════════════╗
║               TAREAS DE PLANIFICACION                     ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ □ Tarea 1: Generar PRD                                    ║
║   Comando: /project:generate-prd                          ║
║   Salida: project-management/prd.md                       ║
║                                                           ║
║ □ Tarea 2: Definir personas                               ║
║   (Incluido en la generacion del PRD)                     ║
║   Salida: project-management/personas.md                  ║
║                                                           ║
║ □ Tarea 3: Generar backlog                                ║
║   Comando: /project:generate-backlog                      ║
║   Salida: project-management/backlog/                     ║
║                                                           ║
║ □ Tarea 4: Validar backlog                                ║
║   Comando: /project:validate-backlog                      ║
║   Asegura cumplimiento SCRUM                              ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 4: Ejecutar generacion del PRD

Invocar el comando de generacion del PRD:

```
Iniciando /project:generate-prd...

[Flujo de generacion del PRD se ejecuta]

✅ PRD creado: project-management/prd.md
✅ Personas extraidas: project-management/personas.md
```

### Paso 5: Ejecutar generacion del backlog

Despues de completar el PRD:

```
Iniciando /project:generate-backlog...

Usando PRD como entrada:
• 3 personas identificadas
• 12 requisitos funcionales extraidos
• 8 requisitos no funcionales registrados

Generando estructura del backlog...

[Flujo de generacion del backlog se ejecuta]

✅ Backlog creado con:
   • 4 EPICs
   • 18 User Stories
   • Sprint 1 planificado (Walking Skeleton)
```

### Paso 6: Validacion

Ejecutar validacion del backlog:

```
╔══════════════════════════════════════════════════════════╗
║              VALIDACION DEL BACKLOG                       ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Verificacion criterios INVEST:                            ║
║ ├── Independent:    18/18 ✅                              ║
║ ├── Negotiable:     18/18 ✅                              ║
║ ├── Valuable:       18/18 ✅                              ║
║ ├── Estimable:      18/18 ✅                              ║
║ ├── Sized (≤8pts):  16/18 ⚠️  (2 stories necesitan       ║
║ │                            division)                    ║
║ └── Testable:       18/18 ✅                              ║
║                                                           ║
║ Verificacion criterios 3C:                                ║
║ ├── Card:           18/18 ✅                              ║
║ ├── Conversation:   18/18 ✅                              ║
║ └── Confirmation:   18/18 ✅                              ║
║                                                           ║
║ Criterios de aceptacion (Gherkin):                        ║
║ └── Formato valido:   18/18 ✅                            ║
║                                                           ║
║ ADVERTENCIAS:                                             ║
║ • US-007: 13 puntos - considerar dividir                  ║
║ • US-012: 21 puntos - debe dividirse                      ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 7: Finalizacion de la fase

```
╔══════════════════════════════════════════════════════════╗
║             FASE DE PLANIFICACION COMPLETADA               ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Artefactos creados:                                       ║
║ ✅ prd.md              Documento de Requisitos del        ║
║                         Producto                          ║
║ ✅ personas.md         3 user personas                    ║
║ ✅ backlog/            Backlog SCRUM completo              ║
║    ├── epics/          4 EPICs                            ║
║    └── user-stories/   18 User Stories                    ║
║                                                           ║
║ Resumen:                                                  ║
║ • Total Story Points: 89                                  ║
║ • Alcance Sprint 1: 21 puntos (Walking Skeleton)          ║
║ • Sprints estimados: 4-5                                  ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ SIGUIENTE FASE: Diseno (Solucion)                         ║
║ Comando: /workflow:design                                 ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ El tech spec se basara en los requisitos del PRD.         ║
╚══════════════════════════════════════════════════════════╝
```

## Agentes involucrados

- **product-owner**: Creacion del PRD, definicion de personas, priorizacion
- **tech-lead**: Revision de viabilidad tecnica, guia de estimacion

## Archivos de salida

| Archivo | Proposito |
|---------|-----------|
| `prd.md` | Documento de Requisitos del Producto |
| `personas.md` | Definiciones de user personas |
| `backlog/epics/` | Definiciones de EPICs |
| `backlog/user-stories/` | Archivos de User Stories |
| `sprints/sprint-001/` | Estructura del primer sprint |

## Opcion de continuacion

Si se interrumpe, usar `--continue` para reanudar:

```bash
/workflow:plan --continue

# Detecta:
# ✅ PRD completado
# ⏳ Backlog en progreso (12/18 stories)
# → Continua desde la story 13
```

## Comandos relacionados

- `/workflow:init` - Inicializar flujo de trabajo
- `/workflow:analyze` - Fase anterior (Enterprise)
- `/workflow:design` - Siguiente fase
- `/workflow:status` - Verificar progreso
- `/project:generate-prd` - Generacion directa del PRD
- `/project:generate-backlog` - Generacion directa del backlog
