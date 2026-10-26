---
description: "Migración puntual de un backlog existente a BMAD v6 (análisis, migración, completar stories, resincronización)"
argument-hint: "[--analyze|--dry-run|--resync|--stories] [--force]"
---

# Migrar el backlog

Migración puntual de un backlog existente a la estructura BMAD v6, con `.bmad/sprint-status.yaml` como única fuente de verdad del estado de stories y tareas (esquema: `.claude/templates/project/sprint-status.md`). Un solo comando cubre cuatro modos: análisis, migración, completar los campos que faltan en las stories y resincronización del contenido.

## Uso

| Invocación | Qué hace | Reemplaza |
|------------|----------|-----------|
| `/project:migrate --analyze` | Solo informe: estructura, puntuaciones INVEST, carencias BMAD v6. No escribe nada | `analyze-backlog` |
| `/project:migrate` | Por defecto: migra el backlog y crea `.bmad/sprint-status.yaml` | `migrate-backlog` |
| `/project:migrate --stories [story-id]` | Completa los campos que faltan en las stories (tareas, CA, historial, INVEST) | `update-stories` |
| `/project:migrate --resync` | Reconcilia contenido e IDs entre el markdown y el YAML | `sync-backlog` |
| `--dry-run` | Solo previsualización, válido para todos los modos | - |
| `--force` | Sobrescribe los archivos BMAD existentes (modo migración) | - |

## Argumentos

$ARGUMENTS (formato: [--analyze|--dry-run|--resync|--stories] [--force])
- **--analyze**: modo análisis (solo lectura)
- **--stories**: `story-id` opcional (p. ej. US-001); si se omite, se procesan todas las stories
- **--resync**: modo reconciliación
- **--dry-run**: muestra lo que cambiaría, no escribe nada
- **--force**: sobrescribe un `sprint-status.yaml` y archivos BMAD existentes
- Los modos son mutuamente excluyentes; sin ninguno, se ejecuta la migración por defecto.

## Reglas comunes

- **Ubicación del backlog**, buscada en orden: `project-management/backlog/` (estándar), `docs/backlog/`, `backlog/`, `.bmad/` (ya migrado).
- **Única fuente de verdad**: el estado vive solo en `.bmad/sprint-status.yaml`. El markdown contiene únicamente contenido (título, descripción, CA, puntos, padres).
- **Estados heredados**: la migración inicial es el ÚNICO momento en que se leen los estados/emojis heredados del markdown; se mueven al YAML y luego se eliminan del markdown. `--resync` y `--stories` nunca copian un estado desde el markdown.
- **Plan mode obligatorio** para la migración por defecto, `--stories` y `--resync` (salvo `--dry-run`): Claude analiza el impacto, propone un plan y espera su validación antes de modificar nada.
- **Orden recomendado**: primero `--analyze`, luego la migración, luego `--stories`; usar `--resync` después cuando el contenido se desvíe.

## --analyze

Solo informe, no se modifica ningún archivo.

1. **Detectar** la ubicación del backlog (ver reglas comunes).
2. **Identificar** epics (`EPIC-*.md`, `epic*.md`), user stories (`US-*.md`, `story*.md`), tareas (`TASK-*.md` o integradas en las stories) y archivos de índice (`index.md`, `backlog.md`, `README.md`).
3. **Analizar** por archivo: ID, título, estado heredado (🔴 To Do, 🟡 In Progress, 🟢 Done, ⏸️ Blocked), sprint, story points, padres (US → EPIC, TASK → US), número de CA, número de tareas y avance.
4. **Puntuación INVEST** por story (0-6): Independent (sin dependencia bloqueante), Negotiable (tiene descripción), Valuable (beneficio indicado), Estimable (tiene puntos), Small (≤ 8 puntos), Testable (tiene CA).
5. **Carencias BMAD v6**: seguimiento de la fase TDD, lista de tareas con avance, historial de estados, asignación a sprint, estado de validación de los CA.
6. **Informe**: resumen (totales), estructura (árbol), tabla INVEST, tabla de carencias de migración (campo / % de stories afectadas / acción), recomendaciones.

```
📊 Informe de análisis del backlog
Ubicación: project-management/backlog/ | Epics: {N} | Stories: {N} | Tareas: {N}

| Story  | Título | INVEST | Falta     |
|--------|--------|--------|-----------|
| US-001 | Login  | 5/6    | Estimable |

Carencias de migración: tdd_phase 100% | tasks.list 60% | history 100%
Siguiente: /project:migrate
```

## Por defecto: migración

1. **Validar**: crear `.bmad/` si hace falta; avisar si `sprint-status.yaml` existe y no hay `--force`; el análisis debería haberse ejecutado.
2. **Crear la estructura**: `.bmad/sprint-status.yaml`, `batch-queue.yaml`, `gates/`, `hooks/`, `lib/`.
3. **Analizar** cada story: metadatos, CA (Gherkin), tareas relacionadas, estado heredado, avance.
4. **Convertir los estados heredados** al YAML:

   | Origen | Estado BMAD v6 |
   |--------|----------------|
   | 🔴 To Do | backlog |
   | 🟡 In Progress | in-progress |
   | 🟢 Done | done |
   | ⏸️ Blocked | blocked |
   | Asignada a Sprint-X | ready-for-dev |

5. **Fase TDD inicial**: 0 % de tareas terminadas → `red`; 1-99 % → `green`; 100 % → `refactor` o `done`.
6. **Generar `sprint-status.yaml`**, una entrada por story:

   ```yaml
   stories:
     US-001:
       title: "User login"
       status: "in-progress"
       previous_status: "ready-for-dev"
       tdd_phase: "red"
       current_task: "TASK-001"
       story_points: 5
       epic_id: "EPIC-001"
       tasks:
         total: 4
         completed: 2
         list:
           - { id: "TASK-001", title: "Backend auth endpoint", status: "in-progress", type: "BE" }
       acceptance_criteria: { total: 3, validated: 1 }
       history:
         - { timestamp: "2026-01-29T10:00:00Z", from: "backlog", to: "in-progress", by: "migration", reason: "BMAD v6 migration" }
   ```

7. **Copia de seguridad** (salvo `--dry-run`): copiar el backlog en `.bmad/backup/` (con marca de tiempo) y registrar su ubicación.
8. **Aplicar** (salvo `--dry-run`): escribir el YAML, eliminar emojis/campos de estado de los archivos markdown, crear `.bmad/migration-log.md`.

Dry run: lista los archivos que se crearían (p. ej. `.bmad/sprint-status.yaml`), el número de stories/tareas/CA que se migrarían, y termina con «Run without --dry-run to apply changes.».

Reversión: `tar -xzf .bmad/backup/backlog-*.tar.gz -C project-management/ && rm .bmad/sprint-status.yaml`.

Pasos siguientes: revisar el YAML, ejecutar `/sprint:status`, configurar los metadatos del sprint (fechas, objetivos), comprobar los quality gates con `/gate:check all`.

## --stories

Completa los campos BMAD v6 que faltan en las stories existentes (todas, o una sola con `story-id`).

1. **Cargar** `.bmad/sprint-status.yaml` y los archivos de stories; compararlos.
2. **Campos que faltan** y valores por defecto:

   | Campo | Requerido | Valor por defecto si falta |
   |-------|-----------|----------------------------|
   | tdd_phase | Sí | "red" si in-progress, "" en otro caso |
   | tasks.list / total / completed | Sí | Extraer de `## Tasks`, contar, contar las terminadas |
   | current_task | No | Primera tarea in-progress |
   | history | Sí | Entrada inicial con el estado actual (`by: "migrate"`) |
   | acceptance_criteria.total / validated | Sí | Contar en la sección CA / 0 |
   | story_points | Sí | Preguntar al usuario si faltan |
   | epic_id | No | Extraer del archivo |

3. **Analizar las tareas** de la tabla `## Tasks` de la story y los **CA** de los bloques Gherkin `### ACn:` para rellenar `tasks.list` y `acceptance_criteria.list` (ids, títulos). Los estados de tareas y CA solo pasan al YAML para las entradas aún no seguidas allí; un estado ya presente en el YAML nunca se sobrescribe con el markdown.
4. **INVEST**: añadir `invest_score` (independent, negotiable, valuable, estimable, small, testable, total).
5. **Actualizar** `sprint-status.yaml` fusionando los campos; opcionalmente añadir un comentario de metadatos a los archivos de stories (`<!-- BMAD v6 Metadata … -->` con `tdd_phase`, `invest_score`, `last_sync`).

Salida: tabla de stories actualizadas (campos añadidos, puntuación INVEST), resumen por campo (añadidos / omitidos), advertencias (p. ej. «US-003: faltan story points», «US-007: sin criterios de aceptación»), archivos modificados. Después corregir las advertencias, y ejecutar `/project:migrate --resync` y `/gate:check backlog`.

## --resync

Reconcilia contenido e IDs entre los archivos markdown y el YAML. El estado nunca se sincroniza: el YAML manda.

1. **Cargar** ambas fuentes y construir un mapa de comparación por ID de story.
2. **Detectar diferencias** de contenido: stories que faltan, títulos, story points, listas de tareas, CA, asignación.
3. **Resolver**: el YAML es la autoridad para el estado, la fase TDD, el historial y el estado de las tareas; el markdown es la autoridad para títulos, descripciones, texto de los CA y puntos. Preguntar al usuario cuando ambos modificaron el mismo campo de contenido.
4. **Archivos → YAML**: añadir las stories presentes solo en los archivos; actualizar títulos, puntos, listas de tareas y de CA.
5. **YAML → archivos**: actualizar el comentario de metadatos (fase TDD, historial, puntuación INVEST, marca de sincronización); nunca escribir un estado en el markdown.
6. **Huérfanos**: en el YAML pero no en los archivos → marcar `archived` o avisar; en los archivos pero no en el YAML → añadir al YAML (estado `backlog`).
7. **Marcas de tiempo**: `last_sync` en el YAML y `<!-- last_sync: … -->` en los archivos de stories.

Salida: cambios archivos → YAML, cambios YAML → archivos, conflictos resueltos, huérfanos (archivados / añadidos), hora de la última sincronización. Después revisar `git diff` y ejecutar `/sprint:status`.

Automatización: un hook pre-commit puede ejecutar `/project:migrate --resync` (`.bmad/hooks/pre-commit.sh`).

## Ejemplos

```
/project:migrate --analyze
/project:migrate --dry-run
/project:migrate
/project:migrate --force
/project:migrate --stories US-001
/project:migrate --stories --dry-run
/project:migrate --resync --dry-run
```
