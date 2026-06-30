# Tutorial de flujo de trabajo completo: De la idea a producción

> **¿Para quién es esto?** Para alguien que **nunca** ha usado Claude Code ni Claude Craft. Partimos de cero, construimos una funcionalidad real de principio a fin y explicamos cada término la primera vez que aparece.
>
> **Qué construimos:** *TaskFlow* — un SaaS de seguimiento de tareas para equipos pequeños con una API REST (Python / FastAPI) y un cliente web en React. Es lo suficientemente sencillo para seguirlo en una sola sesión, y lo suficientemente real para ejercitar todo el flujo de trabajo.
>
> **Claude Craft v8.19.0** · Tiempo estimado de lectura + práctica: 60–90 minutos.

---

## 0. Antes de empezar

### Qué harás

Llevarás TaskFlow desde una idea de una frase hasta un primer sprint revisado y probado — usando el flujo de trabajo BMAD de Claude Craft. El camino siempre avanza en una dirección, y **cada flecha está protegida por una puerta de calidad** (una verificación bloqueante):

```
 IDEA
   │  /workflow:init        ← elige el track
   ▼
 BACKLOG ──/gate:validate-backlog──┐  (PRD ≥ 80%, INVEST 6/6)
   │  /workflow:plan                │
   ▼                                │
 TECH DESIGN ──/gate:validate-techspec──┐  (Tech Spec ≥ 90%)
   │  /workflow:design                   │
   ▼                                      │
 SPRINT PLAN ──/gate:validate-sprint──┐  (Sprint Ready 100%)
   │  /workflow:start                  │
   │  /project:decompose-tasks         │
   ▼                                    │
 IMPLEMENTATION (TDD) ──/gate:validate-story──┐  (Story DoD 100%)
   │  /sprint:dev                              │
   ▼                                            │
 REVIEW + RETRO ──/workflow:review, /workflow:retro
   │
   ▼
 NEXT SPRINT ↺
```

> **Regla de oro del método:** no avanzas al siguiente paso hasta que su puerta pase. Esto es lo que evita que construyas sobre cimientos inestables.

---

## 1. Lo básico en 5 minutos

Lee esto una vez. Volverás a consultarlo.

- **Claude Code** — la CLI donde hablas con Claude en tu terminal (o IDE). Escribes mensajes y *slash-commands*; Claude lee/escribe archivos, ejecuta comandos y responde.
- **Slash-command** — una instrucción empaquetada que comienza con `/`. Ejemplo: `/workflow:init`. Claude Craft incluye 125 de ellos en 15 espacios de nombres.
- **Agent** — una persona especializada de Claude que invocas con `@`. Ejemplo: `@tdd-coach`, `@symfony-reviewer`. Cada uno tiene experiencia enfocada.
- **Claude Craft** — el framework que instalaste: reglas, comandos, agentes, habilidades y la capa de gestión de proyectos **BMAD**.
- **BMAD** — el método ligero estilo SCRUM de Claude Craft (Backlog → sprint → revisión). Escribe su estado en **archivos**, no en la conversación — por eso es seguro limpiar el chat más adelante.

### Mini-glosario

| Término | Significado simple |
|---------|-------------------|
| **Epic** | Un gran bloque de valor, dividido en historias. |
| **User Story (US)** | Un incremento pequeño y visible para el usuario ("Como usuario, puedo…"). |
| **Backlog** | La lista ordenada de epics e historias. |
| **Sprint** | Un lote corto de historias que te comprometes a terminar. |
| **Task** | Una historia dividida en pasos de ≤ 30 minutos que un desarrollador (o agente) ejecuta. |
| **Gate** | Una verificación de calidad bloqueante entre fases. |
| **DoD** | Definition of Done — la lista de verificación que debe superar una historia. |
| **INVEST** | Las 6 cualidades de una buena historia (Independent, Negotiable, Valuable, Estimable, Small, Testable). |
| **TDD** | Test-Driven Development: escribe un test que falla → hazlo pasar → refactoriza. |

---

## 1.5 Entender los modos de ejecución (lee esto — es donde todos se confunden)

Hay **dos cosas diferentes llamadas "modo"**. No las confundas.

**(a) Los tres modos de interacción** (alterna con `Shift+Tab` en Claude Code):

| Modo | Indicador | Qué hace |
|------|-----------|----------|
| **Plan** | 📋 | Claude propone un plan y **no edita nada** hasta que lo apruebes. |
| **Normal** | ⚡ | Claude actúa, pero pide permiso antes de acciones arriesgadas. **Por defecto en este tutorial.** |
| **Auto-accept** | 🤖 | Claude ejecuta sin preguntar. Potente, pero solo cuando confíes en el flujo. |

**(b) El "modo plan" que algunos comandos activan por sí mismos.** Varios comandos de Claude Craft (`/workflow:design`, `/workflow:plan`…) entran deliberadamente en un paso de planificación y esperan tu "adelante" antes de escribir archivos — independientemente del modo Shift-Tab en que estés.

> **Regla sencilla para principiantes:** mantente en **Normal (⚡)**, deja que los comandos activen su propio paso de planificación y aprueba los planes. Usa auto-accept y las banderas `--auto` solo cuando el flujo te resulte familiar.

A lo largo de este tutorial, cada comando muestra el modo que espera:
- **Modo: Normal (⚡)** — interactivo
- **Modo: Plan requerido** — Claude planificará primero
- **Modo: Solo lectura** — seguro en cualquier modo

---

## 2. Verificar tu instalación

**Modo: Solo lectura.** Abre Claude Code en la carpeta de tu proyecto y confirma que Claude Craft está presente.

```bash
# En tu terminal, dentro del proyecto
claude
```

Luego, dentro de Claude Code:

```
/workflow:status
```

Si ves un informe de estado del flujo de trabajo (aunque sea "no workflow yet"), Claude Craft está instalado. Si el comando es desconocido, (re)instala:

```bash
npx @the-bearded-bear/claude-craft install . --tech=python --lang=en
```

> **Sobre la capa de gestión de proyectos.** Los comandos `/gate:*`, `/sprint:*` y `/project:*` que se usan a continuación provienen de la opción **Project Management commands**, incluida por defecto durante la instalación (el instalador pregunta *"Include Project Management commands? (Y/n)"* → Sí). Si esos comandos faltan, vuelve a ejecutar el instalador y acepta esa opción.

### 2.x Ahorrando tokens: contexto y `/clear`

La **ventana de contexto** es la memoria de trabajo de Claude — y tu recurso más preciado. Dos hábitos la mantienen saludable:

- **`/clear`** entre pasos no relacionados. Como BMAD escribe su estado en archivos, **no se pierde nada**: después de `/clear`, ejecuta `/workflow:status` y Claude vuelve a leer dónde estás.
- **RTK + hooks** para optimización de tokens. Ejecuta `/common:setup-rtk` una vez para configurar el proxy Rust Token Killer y los hooks de optimización (ahorro del 60–90% en la salida de comandos de desarrollo).

Verás marcadores **"Buen momento para `/clear`"** entre los pasos con letras que siguen.

---

## Paso A — Construir el backlog

### A.1 Inicializar el flujo de trabajo

**Modo: Plan requerido.**

```
/workflow:init
```

Claude analiza tu proyecto y recomienda un **track**:

| Track | Configuración | Fases | Mejor para |
|-------|---------------|-------|------------|
| **Quick Flow** | < 5 min | Solo implementación | Corrección de bugs, hotfixes |
| **Standard** | < 15 min | Plan → Design → Implement | Nuevas funcionalidades (← TaskFlow usa este) |
| **Enterprise** | < 30 min | Analyze → Plan → Design → Implement | Plataformas |

Elige **Standard** para TaskFlow.

### A.2 Generar el PRD y el backlog

**Modo: Plan requerido.**

```
/workflow:plan
```

Claude te entrevista sobre TaskFlow y luego redacta un **PRD** (Product Requirements Document), personas y un **backlog** inicial de epics e historias bajo `project-management/`. Responde con concreción, por ejemplo:

> *"TaskFlow permite a un equipo pequeño crear proyectos, añadir tareas, asignarlas y marcarlas como completadas. MVP = API REST + vista web de lista/tablero. Sin móvil por ahora."*

> **Qué esperar:** archivos como `project-management/prd.md` y `project-management/backlog/` con epics como `EPIC-001 Projects`, `EPIC-002 Tasks`, e historias como `US-001 Create a project`.

### A.3 Validar el backlog

**Modo: Solo lectura.**

```
/gate:validate-backlog
```

Esta puerta verifica el backlog contra **INVEST (6/6)** y la cobertura del PRD (**≥ 80%**). Si falla, te indica exactamente qué historias son demasiado grandes, no testeables o no estimables. Corrígelas (vuelve a ejecutar `/workflow:plan` o edita las historias) hasta que la puerta esté en verde.

> **Buen momento para `/clear`.** Luego `/workflow:status` para retomar.

---

## Paso B — Diseñar y crear el sprint

### B.1 Diseñar la solución técnica

**Modo: Plan requerido.**

```
/workflow:design
```

Claude (actuando como arquitecto) produce un **Tech Spec**: decisiones de arquitectura, modelo de datos, contrato de API y las librerías a usar — fundamentado en las referencias de Claude Craft de tu stack (Clean Architecture, patrones FastAPI, etc.).

### B.2 Validar el tech spec

**Modo: Solo lectura.**

```
/gate:validate-techspec
```

Umbral de la puerta: **Tech Spec ≥ 90%**. Señala el manejo de errores ausente, contratos indefinidos o diseños no testeables.

### B.3 Planificar el primer sprint

**Modo: Plan requerido.**

```
/workflow:start
```

Claude propone un **objetivo de sprint** y selecciona las principales historias del backlog que encajan. Para TaskFlow, un primer sprint sensato es un **walking skeleton**: creación de proyectos y tareas a través de la API, mostrada en la lista web.

### B.4 Descomponer historias en tareas

**Modo: Plan requerido.**

```
/project:decompose-tasks
```

Cada historia se divide en **tareas** de ≤ 30 minutos, testeables de forma independiente (escribir el modelo, escribir el endpoint, escribir el test, conectar la UI…). Esto es lo que hace que TDD y `/sprint:dev` fluyan sin problemas.

### B.5 Validar el sprint

**Modo: Solo lectura.**

```
/gate:validate-sprint
```

Umbral de la puerta: **Sprint Ready 100%** — cada historia estimada, cada tarea definida, dependencias ordenadas. Verde significa que puedes empezar a codificar.

> **Buen momento para `/clear`.**

---

## Paso C — Implementar el sprint con TDD

### C.1 El camino recomendado para principiantes

**Modo: Normal (⚡).**

```
/sprint:dev
```

`/sprint:dev` recorre el sprint **tarea por tarea**, guiándote a través del ciclo TDD **Red → Green → Refactor**:

1. **Red** — escribe un test que falla y fija el comportamiento esperado.
2. **Green** — escribe el código mínimo para que pase.
3. **Refactor** — limpia el código, los tests siguen en verde.

Para cada historia también ejecuta una revisión de código y verifica el **Story DoD (100%)** antes de continuar.

> **TDD no es negociable.** Un test escrito *antes* del código es lo que permite al agente escribir código en el que puedes confiar. Las correcciones de bugs obtienen primero un test de regresión (debe fallar antes de tu corrección y pasar después).

### C.2 Alternativas (opcional)

- `/project:run-sprint` — ejecuta todo el sprint de forma más autónoma.
- `/team:sprint` — implementa múltiples historias **en paralelo** usando Agent Teams (avanzado).
- `@tdd-coach` — invoca al coach a mitad de una tarea para recibir orientación.

Usa `/sprint:dev` en tu primera ejecución.

### C.3 Gestionarlo día a día

- `/sprint:next-story --claim` — toma la siguiente historia.
- `/sprint:transition US-001 in-progress` — mueve una historia por el tablero.
- `/qa:tdd` — corrige un bug en modo TDD/BDD estricto.

> **Recordatorio sobre Docker.** Ejecuta tests y comandos a través de Docker para que los resultados no dependan de tu máquina local, por ejemplo `docker compose exec app pytest`.

---

## Paso D — Seguir el progreso con el tablero Kanban

### D.1 Lanzar el tablero

**Modo: Solo lectura.**

```
/project:board
```

Esto abre un **tablero Kanban** local (sin SaaS, sin dependencias externas) que lee los archivos de estado de BMAD. Las columnas siguen el enrutamiento de estado:

```
backlog → ready-for-dev → in-progress → review → done   (any → blocked)
```

Vistas complementarias: `/project:burndown` (burndown del sprint), `/project:dependencies`, `/project:critical-path`, `/project:metrics`.

### D.2 Por qué una tarjeta puede negarse a moverse

El tablero aplica las mismas puertas. Una historia no entrará en **done** hasta que su DoD pase — el método te protege, no es un bug.

> **Buen momento para `/clear`.**

---

## Paso E — Cerrar el sprint y repetir

### E.1 Revisión del sprint

**Modo: Normal (⚡).**

```
/workflow:review
```

Resume lo que se entregó respecto al objetivo del sprint, con una lista de verificación para la demo.

### E.2 Retrospectiva

```
/workflow:retro
```

Captura lo que fue bien / lo que mejorar. Persiste los aprendizajes duraderos con `/memory` para que sobrevivan a futuros `/clear`.

### E.3 Repetir

Ejecuta `/workflow:start` de nuevo para planificar el sprint 2 desde el backlog restante. El ciclo se repite: plan → design → implement → review.

---

## Chuleta

### Comandos, en orden

```bash
# Paso A — Backlog
/workflow:init                 # elige el track
/workflow:plan                 # PRD + backlog
/gate:validate-backlog         # INVEST 6/6, PRD ≥ 80%

# Paso B — Diseño + sprint
/workflow:design               # tech spec
/gate:validate-techspec        # Tech Spec ≥ 90%
/workflow:start                # planifica el sprint
/project:decompose-tasks       # historias → tareas
/gate:validate-sprint          # Sprint Ready 100%

# Paso C — Implementar (TDD)
/sprint:dev                    # tarea por tarea Red/Green/Refactor
/gate:validate-story US-001    # Story DoD 100%

# Paso D — Seguimiento
/project:board                 # Kanban
/project:burndown              # burndown

# Paso E — Cerrar + repetir
/workflow:review
/workflow:retro
```

### Cuándo usar `/clear`

Después de cada paso con letra (A→B→C→D→E). El estado vive en archivos; `/workflow:status` lo vuelve a leer.

### Dónde viven los archivos

| Qué | Dónde |
|-----|-------|
| PRD, personas | `project-management/prd.md` |
| Backlog (epics/historias) | `project-management/backlog/` |
| Sprints, tareas | `project-management/sprints/` |
| Estado BMAD | `project-management/.bmad/` / `sprint-status.yaml` |

### Umbrales de las puertas

| Puerta | Umbral |
|--------|--------|
| PRD | ≥ 80% |
| Tech Spec | ≥ 90% |
| INVEST | 6/6 |
| Sprint Ready | 100% |
| Story DoD | 100% |
| Spec Alignment | ≥ 85% |

### Problemas comunes

| Síntoma | Solución |
|---------|----------|
| `/gate:*` / `/sprint:*` desconocido | Reinstala y acepta *Project Management commands*. |
| `/bmad:init` no encontrado | No existe — usa `/workflow:init`. |
| La puerta sigue fallando | Lee su informe; nombra el elemento exacto que falla. |
| La tarjeta no llega a **done** | Su DoD aún no se cumple — es intencional. |
| Perdido después de `/clear` | Ejecuta `/workflow:status`. |
| Contexto > 60% | `/clear`, luego `/workflow:status`. |

---

## Automatizar con Ralph (opcional)

Una vez que te sientas cómodo, automatiza una historia de principio a fin con el bucle continuo:

```
/common:ralph-run "Implement US-001 with full DoD validation"
```

Ralph mantiene a Claude trabajando hasta que pasen los validadores de Definition of Done. Ver [RALPH-GUIDE.md](../../RALPH-GUIDE.md).

---

## Apéndice — Un escenario real multi-stack

TaskFlow es de un solo stack a propósito. Los productos reales son más complejos — y el **mismo** flujo de trabajo escala para ellos. Como ejemplo más rico, considera una aplicación estilo Wrandly (versión anonimizada incluida como fixture de prueba en `tests/fixtures/wrandly-anon/`):

- **Dos clientes:** una PWA web (Symfony + React) **y** una app móvil Flutter, más una API REST personalizada.
- **Ya existe un handoff de diseño** antes de que comience el desarrollo (un paquete "Claude Design"): documentos fuente, 5 decisiones de arquitectura bloqueadas y un plan por fases (Epics 0 → 7).

Cómo se mapea a este tutorial:

| Artefacto de diseño | Alimenta |
|--------------------|----------|
| Documentos fuente | `/workflow:plan` (entrada para el PRD + backlog) |
| Decisiones de arquitectura bloqueadas | `/workflow:design` (formalizadas en el Tech Spec) |
| Fases 0 → 7 | La división epics → sprints |

Dos ajustes para multi-stack:

1. **Empieza con el epic de fundación** (Epic 0): monorepo, tokens de diseño compartidos, el contrato OpenAPI y un estilo de mapa **antes** de cualquier componente de UI — un verdadero *walking skeleton*.
2. **Ejecuta sprints web y móvil en paralelo** con `/team:sprint` (Agent Teams), cada uno respetando las puertas de su propio stack.

Todo lo demás — puertas, TDD, el tablero Kanban, la disciplina de `/clear` — es idéntico. El método no cambia con la escala; solo lo hace el número de tracks paralelos.

---

## Próximos pasos

- [Desarrollo de funcionalidades](03-feature-development.md) — profundiza en el bucle TDD y los agentes.
- [Gestión del backlog](07-backlog-management.md) — domina los epics, historias y los más de 15 comandos de proyecto.
- [Guía práctica de BMAD](../../BMAD-PRACTICAL-GUIDE.md) — la referencia completa de comandos del método.
- [Sprint autónomo](../AUTONOMOUS-SPRINT.md) — deja que un pipeline de agentes ejecute todo el sprint.
- [Rutas de aprendizaje](../../LEARNING-PATHS.md) — progresión de Principiante → Intermedio → Avanzado.
