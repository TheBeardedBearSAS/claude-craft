# Referencia CLI

Referencia completa de la interfaz de línea de comandos de Claude Craft.

---

## Instalación NPX

La forma recomendada de instalar Claude Craft es a través de NPX:

```bash
npx @the-bearded-bear/claude-craft [comando] [opciones]
```

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `install` | Instalar Claude Craft en un proyecto |
| `flatten` | Generar un contexto aplanado del codebase |
| (ningún comando) | Asistente de instalación interactivo |

---

## Asistente Interactivo

Ejecuta sin argumentos para el asistente interactivo:

```bash
npx @the-bearded-bear/claude-craft
```

El asistente te guiará a través de:
1. **Directorio destino** - Dónde instalar
2. **Stack tecnológico** - Qué framework(s) usar
3. **Idioma** - Idioma de la documentación (en, fr, es, de, pt)
4. **Opciones** - Respaldo, sobrescritura forzada, etc.

---

## Comando Install

### Uso Básico

```bash
npx @the-bearded-bear/claude-craft install <directorio-destino> [opciones]
```

### Opciones

| Opción | Atajo | Descripción |
|--------|-------|-------------|
| `--tech=<tecnología>` | `-t` | Stack tecnológico a instalar |
| `--lang=<idioma>` | `-l` | Idioma de la documentación |
| `--force` | `-f` | Sobrescribir archivos existentes |
| `--backup` | `-b` | Crear respaldo antes de instalar |
| `--dry-run` | `-d` | Simular sin efectuar cambios |
| `--preserve-config` | | Conservar el CLAUDE.md existente |

### Opciones de Tecnología

| Valor | Descripción |
|-------|-------------|
| `symfony` | Backend Symfony/PHP |
| `flutter` | Mobile Flutter/Dart |
| `react` | Frontend React |
| `reactnative` | Mobile React Native |
| `python` | Backend Python |
| `angular` | Frontend Angular |
| `csharp` | Backend C#/.NET |
| `laravel` | Backend Laravel/PHP |
| `vuejs` | Frontend Vue.js |
| `php` | PHP Clean Architecture |
| `common` | Reglas comunes únicamente |
| `all` | Todas las tecnologías |

### Opciones de Idioma

| Valor | Idioma |
|-------|--------|
| `en` | Inglés (predeterminado) |
| `fr` | Francés |
| `es` | Español |
| `de` | Alemán |
| `pt` | Portugués |

### Ejemplos

```bash
# Instalar reglas Symfony en español
npx @the-bearded-bear/claude-craft install ~/mi-proyecto --tech=symfony --lang=es

# Instalar múltiples tecnologías
npx @the-bearded-bear/claude-craft install . --tech=react
npx @the-bearded-bear/claude-craft install . --tech=python

# Forzar reinstalación con respaldo
npx @the-bearded-bear/claude-craft install ~/app --tech=flutter --force --backup

# Dry run para previsualizar cambios
npx @the-bearded-bear/claude-craft install . --tech=angular --dry-run

# Instalar todas las tecnologías
npx @the-bearded-bear/claude-craft install ~/proyecto --tech=all --lang=es
```

---

## Comando Flatten

Genera un resumen aplanado de tu codebase para asistentes de IA.

### Uso

```bash
npx @the-bearded-bear/claude-craft flatten [opciones]
```

### Opciones

| Opción | Descripción |
|--------|-------------|
| `--output=<archivo>` | Nombre del archivo de salida (predeterminado: `CODEBASE.md`) |
| `--max-tokens=<n>` | Tokens máximos antes de fragmentación |
| `--exclude=<patrones>` | Patrones adicionales a excluir |

### Ejemplos

```bash
# Generar el codebase aplanado
npx @the-bearded-bear/claude-craft flatten

# Archivo de salida personalizado
npx @the-bearded-bear/claude-craft flatten --output=CONTEXT.md

# Limitar el número de tokens (activa la fragmentación para proyectos grandes)
npx @the-bearded-bear/claude-craft flatten --max-tokens=50000

# Excluir directorios adicionales
npx @the-bearded-bear/claude-craft flatten --exclude="*.test.ts,*.spec.ts"
```

### Salida

El comando flatten genera:
- Estructura del árbol de archivos
- Contenido de archivos por orden de prioridad
- Estimación de tokens
- Fragmentación automática para proyectos grandes

---

## Comandos Makefile

Cuando clones el repositorio, puedes usar Make para la instalación.

### Comandos de Instalación

```bash
# Instalar una tecnología específica
make install-symfony TARGET=~/proyecto
make install-flutter TARGET=~/proyecto RULES_LANG=es
make install-react TARGET=~/proyecto OPTIONS="--force"

# Instalar presets
make install-all TARGET=~/proyecto         # Todo
make install-common TARGET=~/proyecto      # Reglas comunes únicamente
make install-web TARGET=~/proyecto         # React
make install-backend TARGET=~/proyecto     # Symfony + Python
make install-mobile TARGET=~/proyecto      # Flutter + React Native

# Instalar las herramientas
make install-tools                          # Todas las herramientas
make install-statusline                     # Línea de estado personalizada
make install-multiaccount                   # Gestor multi-cuentas
make install-projectconfig                  # Gestor de configuración de proyecto
```

### Comandos Dry Run

```bash
make dry-run-all TARGET=~/proyecto
make dry-run-symfony TARGET=~/proyecto
make dry-run-flutter TARGET=~/proyecto
```

### Comandos de Configuración

```bash
make config-list                            # Listar proyectos en la config YAML
make config-validate                        # Validar la config YAML
make config-install PROJECT=mi-proyecto     # Instalar desde la config
make config-install-all                     # Instalar todo desde la config
make config-dry-run PROJECT=mi-proyecto     # Dry run desde la config
```

### Comandos Utilitarios

```bash
make help                                   # Mostrar todos los comandos disponibles
make list                                   # Listar los componentes disponibles
make list-agents                            # Listar todos los agentes
make list-commands                          # Listar todos los comandos
make stats                                  # Mostrar las estadísticas
make tree                                   # Mostrar la estructura del proyecto
make fix-permissions                        # Corregir los permisos de los scripts
```

### Comandos de Migración

```bash
make migrate-check                          # Verificar el estado de migración
```

### Export Plugin

```bash
make plugin-export                          # Exportar como plugin Claude Code
make plugin-export-all                      # Exportar todas las tecnologías
```

---

## Ejecución Directa de Scripts

Para un control avanzado, ejecuta los scripts de instalación directamente.

### Sintaxis

```bash
./Dev/scripts/install-{tech}-rules.sh [opciones] <directorio-destino>
```

### Scripts Disponibles

| Script | Tecnología |
|--------|------------|
| `install-common-rules.sh` | Común/transversal |
| `install-symfony-rules.sh` | Symfony |
| `install-flutter-rules.sh` | Flutter |
| `install-react-rules.sh` | React |
| `install-reactnative-rules.sh` | React Native |
| `install-python-rules.sh` | Python |
| `install-angular-rules.sh` | Angular |
| `install-csharp-rules.sh` | C#/.NET |
| `install-laravel-rules.sh` | Laravel |
| `install-vuejs-rules.sh` | Vue.js |
| `install-php-rules.sh` | PHP |

### Opciones de los Scripts

| Opción | Descripción |
|--------|-------------|
| `--install` | Instalación fresca (predeterminado) |
| `--update` | Actualizar únicamente archivos existentes |
| `--force` | Sobrescribir todos los archivos |
| `--preserve-config` | Conservar CLAUDE.md y contexto proyecto |
| `--dry-run` | Simular sin cambios |
| `--backup` | Crear un respaldo antes de cambios |
| `--interactive` | Instalación guiada |
| `--lang=XX` | Definir el idioma (en, fr, es, de, pt) |
| `--agents-only` | Instalar únicamente los agentes |
| `--commands-only` | Instalar únicamente los comandos |
| `--rules-only` | Instalar únicamente las reglas |
| `--templates-only` | Instalar únicamente los templates |
| `--checklists-only` | Instalar únicamente las checklists |

### Ejemplos

```bash
# Instalación básica
./Dev/scripts/install-symfony-rules.sh --lang=es ~/mi-proyecto

# Actualizar una instalación existente
./Dev/scripts/install-flutter-rules.sh --update ~/mi-app

# Forzar la reinstalación con respaldo
./Dev/scripts/install-python-rules.sh --force --backup ~/api

# Modo interactivo
./Dev/scripts/install-react-rules.sh --interactive ~/frontend

# Instalar únicamente los agentes
./Dev/scripts/install-symfony-rules.sh --agents-only ~/proyecto
```

---

## Ralph Wiggum CLI

Ejecuta Claude en bucle continuo hasta el cumplimiento de la tarea.

### Uso

```bash
npx @the-bearded-bear/claude-craft ralph "descripción de la tarea"
```

### Opciones

| Opción | Descripción |
|--------|-------------|
| `--full` | Activar todos los validadores DoD |
| `--max-iterations=<n>` | Número máximo de iteraciones (predeterminado: 10) |
| `--dod=<archivo>` | Archivo de configuración DoD personalizado |

### Ejemplos

```bash
# Tarea básica
npx @the-bearded-bear/claude-craft ralph "Implementar la autenticación de usuario"

# Con todas las verificaciones DoD
npx @the-bearded-bear/claude-craft ralph --full "Corregir el bug de conexión"

# Límite de iteraciones personalizado
npx @the-bearded-bear/claude-craft ralph --max-iterations=20 "Refactorizar el módulo de pago"
```

---

## Comando Kanban

Inicia una interfaz web local para visualizar y gestionar el backlog y los sprints BMAD v6 como un tablero Scrum / Kanban. El servidor escucha únicamente en `127.0.0.1` y nunca accede a Internet.

### Uso

```bash
npx @the-bearded-bear/claude-craft kanban [ruta] [opciones]
```

La `ruta` es por defecto el directorio actual. El destino debe contener un subdirectorio `project-management/` (generado por `/workflow:plan` o `/workflow:start`).

### Opciones

| Opción | Descripción |
|--------|-------------|
| `--port=<n>` | Puerto HTTP, de 1024 a 65535 (por defecto: 3737). La forma con `=` es obligatoria: `--port 4000` (con un espacio) se rechaza con un mensaje de uso |
| `--open` | Abre automáticamente el navegador |
| `--readonly` | Desactiva toda escritura: el servidor responde 403 `readonly` a cada PATCH, PUT, POST y DELETE, y el tablero no ofrece ningún control de movimiento |
| `--no-watch` | Desactiva el watcher de archivos (sin recarga ante cambios externos) |
| `--user=<nombre>` | Autor registrado en el `history` de los cambios hechos desde el tablero (`kanban:<nombre>`). Por defecto: `CLAUDE_CRAFT_USER`, luego `git config user.name`, luego el usuario del sistema y, por último, `kanban` |

### Vistas

Seis vistas, listadas en la barra de navegación.

- **Board** — 6 columnas (backlog, ready-for-dev, in-progress, review, done, blocked). Una tarjeta se mueve arrastrándola o con el menú «Mover» de la tarjeta, que solo ofrece las columnas permitidas (alternativa para teclado y para un único puntero). Los gates (INVEST o puntos, tareas completas, fase TDD) se validan en el servidor. La cabecera de columna muestra el número de tarjetas, o `número/límite` cuando hay un límite WIP definido.
- **Backlog** — árbol de epics con el progreso de cada uno. Se seleccionan una o varias stories para añadirlas a un sprint o devolverlas al backlog; una barra de capacidad compara los puntos comprometidos con la capacidad del sprint de destino.
- **Sprints** — todos los sprints (planificados, activo, cerrados) con objetivo, fechas, puntos, stories y tareas desplegables, además de sus notas de revisión y retrospectiva. Aquí se crean, inician y cierran los sprints.
- **Burndown** — curvas ideal y real del sprint activo, indicador on-track / at-risk / behind. El gráfico de velocidad (puntos comprometidos y entregados de los sprints cerrados, media de los tres últimos, previsión de sprints restantes) incluye una tabla equivalente.
- **Dependencies** — grafo dirigido de dependencias entre stories con los ciclos resaltados, y una tabla equivalente (story, depende de, bloquea, estado, ciclo).
- **Docs** — visor markdown de `prd.md`, `tech-spec.md`, `personas.md`, `architecture/*.md` y de los documentos de epics, stories y sprints. Los identificadores `US-XXX` del texto enlazan con la story.

### Qué se puede hacer desde el tablero

- **Mover una story** entre columnas. Las transiciones permitidas figuran en [Máquina de estados](#máquina-de-estados); bloquear una story pide un motivo.
- **Crear, editar y eliminar una story** («Nueva story» en las vistas Board y Backlog; el formulario está en el detalle de la story). Campos editables: título, epic, puntos, prioridad, asignado, sprint, fase TDD y dependencias; persona al crear. Eliminar pide confirmación y mueve el archivo a `project-management/backlog/user-stories/.trash/` (se recupera devolviéndolo a su sitio). Una story en curso o en revisión exige una confirmación explícita, y una story de la que dependen otras no puede eliminarse (409 `has_dependents`).
- **Añadir, renombrar y eliminar tareas y cambiar su estado** (`to-do`, `in-progress`, `done`, `blocked`) desde el detalle de la story; el número de tareas terminadas se recalcula. Una story pasa a revisión solo cuando tiene tareas y todas están terminadas. En una story que solo tenía un contador de tareas, el primer cambio registra un estado por tarea (las primeras tareas, tantas como indicaba el contador, cuentan como terminadas).
- **Planificar un sprint**: seleccionar stories en la vista Backlog y añadirlas a un sprint planificado o activo.
- **Crear, iniciar y cerrar un sprint.** Al crearlo (nombre, fechas de inicio y fin, objetivo, capacidad) se escribe `sprints/sprint-<N>-<slug>/sprint-goal.md`; el sprint queda «planificado». Iniciarlo lo convierte en el sprint activo (se rechaza mientras otro sprint esté activo). Cerrarlo archiva las stories `done` en `archived_sprints` y permite elegir el destino de las no terminadas: volver al backlog o pasar a un sprint planificado.
- **Definir límites WIP** por columna en el panel de Ajustes. Son orientativos: superarlos muestra una advertencia y nunca bloquea un movimiento. Una columna cuenta las stories del sprint activo, tal como las muestra el tablero.
- **Los datos no guardados están protegidos**: cerrar un formulario (Escape, Cancelar, el fondo) o cambiar de URL (Atrás del navegador, un enlace a una story) cuando un formulario de story o de sprint tiene cambios pide confirmación antes de descartarlos.
- **Buscar, filtrar y ordenar**: el cuadro de búsqueda (`Ctrl+K` o `/`) filtra las vistas Board y Backlog; los filtros de prioridad, asignado y epic y el orden se conservan en la URL, por ejemplo `#/kanban?q=auth&prio=must,should&who=alice&epic=E4&sort=priority&dir=desc`. `?story=US-E4-03` abre una story desde cualquier vista y `#/docs/<ruta>` abre un documento.
- **Idioma de la interfaz**: inglés, francés, español, alemán o portugués, elegido automáticamente según el navegador o en el panel de Ajustes. Los títulos de las stories y los documentos se muestran tal como están escritos.

Los comandos `/workflow:*` y `/project:*` siguen siendo válidos y escriben los mismos archivos.

### Dónde se escriben los datos

| Dato | Archivo |
|------|---------|
| Estado, pertenencia a un sprint, tareas, puntos, asignado, prioridad, historial | `.bmad/sprint-status.yaml` |
| Contenido de una story (descripción, criterios de aceptación, persona) | `project-management/backlog/user-stories/US-*.md` |
| Objetivo de un sprint nuevo | `project-management/sprints/sprint-<N>-<slug>/sprint-goal.md` |
| Límites WIP | `.bmad/kanban.yaml` |
| Stories eliminadas | `project-management/backlog/user-stories/.trash/` |

Los archivos markdown nunca reciben una línea de estado. Las claves opcionales `stories.<id>.sprint_id` y `metadata.closed_date` se describen en `Project/i18n/es/templates/sprint-status.md`.

### Concurrencia

- Las escrituras en `.bmad/sprint-status.yaml` toman el mismo bloqueo que los scripts de `.bmad/lib/` (`status-lock.sh`). Mientras un script lo mantiene, el tablero responde 423 `locked`; un bloqueo dejado por un proceso interrumpido se recupera pasados 10 segundos.
- Los conflictos se detectan story por story: cada story lleva una revisión, devuelta en `If-Match`. Una story modificada en otro lugar entretanto se rechaza con 409 `conflict` y la interfaz propone recargarla.
- El archivo se reescribe tras revalidarlo, con los comentarios, el orden de las claves y el formato preservados. Un archivo que no valida nunca se sobrescribe (409 `sprint_status_invalid`).

### Seguridad

- Escucha únicamente en `127.0.0.1`, nunca en `0.0.0.0` ni en la red local.
- La cabecera `Host` debe ser la dirección de bucle local y el puerto servido (protección contra DNS rebinding); el `Origin` se comprueba en cada escritura y las escrituras entre orígenes se rechazan (403).
- Cuerpos de petición limitados a 64 KB (512 KB para el cuerpo de una story).
- `--readonly` bloquea toda escritura.
- Recorrido de rutas bloqueado en el punto de acceso a los documentos; las respuestas de error no contienen rutas del sistema de archivos.
- Escrituras atómicas (bloqueo, archivo temporal, renombrado).
- CSP estricta (`script-src 'self'`, `connect-src 'self'`), sin `eval`, sin ejecución de shell y sin llamadas salientes.

### Máquina de estados

Transiciones permitidas (todas las demás se rechazan con 409 `invalid_transition` y la lista de destinos permitidos):

```
backlog       -> ready-for-dev (invest_score >= 6 si existe, si no story_points > 0) | blocked
ready-for-dev -> in-progress | backlog | blocked
in-progress   -> review (todas las tareas terminadas) | blocked
review        -> done (todas las tareas + tdd_phase entre green|refactor|done) | in-progress | blocked
blocked       -> previous_status (solo desbloqueo)
done          -> (terminal)
```

### Fuente sprint-status de BMAD v6

Las stories proceden de `.bmad/sprint-status.yaml` (escrito por `/workflow:*` y `/project:backlog`) y de los archivos markdown de `project-management/`. Cuando una story se sigue en la YAML, la YAML prevalece para el estado, el título, los puntos, la prioridad, el asignado, el epic, las tareas y el sprint; el markdown conserva el contenido. El tablero se actualiza en directo cuando cambia cualquiera de las fuentes. Las stories de un sprint cerrado (`archived_sprints`) son de solo lectura.

Si el tablero está vacío o falta una story, el aviso de diagnóstico lista los archivos ilegibles; `GET /api/diagnostics` devuelve la misma lista. Véase la [resolución de problemas](../../TROUBLESHOOTING.md#kanban-board-empty).

### Rutas HTTP

Lecturas (`GET`): `/api/health` (`ok`, `readonly`, `user`, `wip_limits`), `/api/diagnostics`, `/api/stories`, `/api/stories/:id`, `/api/dependencies`, `/api/docs`, `/api/docs/<ruta>`, `/api/sprints`, `/api/sprints/:id`, `/api/sprints/current`, `/api/velocity`, `/api/events` (eventos del servidor).

Escrituras:

| Ruta | Función | Errores propios |
|------|---------|-----------------|
| `PATCH /api/stories/:id/status` | Mover una story (`status`, `blocked_reason?`, `reason?`) | 409 `invalid_transition`, `archived`, `read_only_source`, `conflict` |
| `PATCH /api/stories/:id` | Editar título, puntos, asignado, prioridad, fase TDD, epic, sprint (`null` = backlog), dependencias | 400 `invalid_payload`; 409 `archived`, `sprint_not_found`, `conflict` |
| `PUT /api/stories/:id/body` | Reemplazar el cuerpo markdown (`markdown`, `expected_mtime`) | 409 `no_backing_file`, `conflict`; 422 `status_line_forbidden` |
| `POST /api/stories` | Crear una story (`title`, `epic_id?`, `story_points?`, `priority?`, `persona?`, `sprint_id?`) | 409 `sprint_status_missing`, `sprint_status_invalid`, `sprint_not_found` |
| `DELETE /api/stories/:id[?force=1]` | Mover una story a `.trash/` | 409 `story_active`, `has_dependents`, `archived` |
| `PATCH /api/stories/:id/tasks/:taskId` | Cambiar el estado de una tarea y/o renombrarla (`status?`, `title?`, al menos uno; de 1 a 200 caracteres) | 400 `invalid_payload`; 404 `task_not_found`; 409 `task_exists` (nombre de otra tarea), `conflict` |
| `DELETE /api/stories/:id/tasks/:taskId` | Quitar una tarea (`total` y `completed` se recalculan) | 404 `task_not_found`; 409 `conflict` |
| `POST /api/stories/:id/tasks` | Añadir una tarea pendiente (`title`) | 409 `task_exists` |
| `POST /api/sprints` | Crear un sprint planificado | 409 `sprint_exists` |
| `POST /api/sprints/:id/start` | Iniciar un sprint | 409 `sprint_already_active`, `sprint_closed`, `conflict` |
| `POST /api/sprints/:id/close` | Cerrar un sprint (`carry_over`: `backlog` o un identificador de sprint) | 409 `not_active`, `sprint_not_found`, `conflict` |
| `PUT /api/settings/wip` | Definir los límites WIP (estado → 1..99 o `null`) | 400 `invalid_payload` |

`:taskId` es el nombre actual de la tarea, codificado para la URL (`encodeURIComponent`): se admiten nombres con `/`, `%`, `#`, espacios o caracteres no ASCII.

`POST /api/stories`, `POST /api/stories/:id/tasks` y `POST /api/sprints` aceptan una cabecera `Idempotency-Key` (cadena opaca de 8 a 128 caracteres ASCII visibles; el board envía un `crypto.randomUUID()` nuevo en cada apertura de formulario). Una segunda petición a la misma ruta con la misma clave en 5 minutos recibe la respuesta de la primera (mismo estado y cuerpo, más `Idempotent-Replayed: true`) y no crea nada; las peticiones rechazadas (estado 400 o superior) no se recuerdan, así que un reintento se evalúa de nuevo. La memoria es la del proceso del servidor, limitada a 500 claves. Una clave mal formada da 400 `invalid_idempotency_key`.

Errores comunes a todas las escrituras: 400 `invalid_json` / `invalid_payload`, 403 `forbidden` / `readonly`, 404 `not_found`, 413 `payload_too_large`, 423 `locked`, 500 `write_failed`. Los cambios se envían a los navegadores abiertos por `/api/events`.

### Atajos de teclado (Board)

| Tecla | Acción |
|-------|--------|
| `↑` `↓` | Navegar entre tarjetas |
| `←` `→` | Cambiar de columna |
| `Alt+M` | Abrir el menú de movimiento de la tarjeta activa |
| `1`-`6` | Mover la tarjeta a esa columna (menú abierto) |
| `Intro` | Abrir el detalle de la story |
| `Esc` | Cerrar el menú o el diálogo |
| `Ctrl+K` (`⌘+K`) o `/` | Buscar stories |

Los atajos son opcionales: todas las acciones siguen disponibles con `Tab` y los botones nativos.

### Ejemplos

```bash
# Lanzar sobre el proyecto actual y abrir el navegador
npx @the-bearded-bear/claude-craft kanban --open

# Modo de solo lectura
npx @the-bearded-bear/claude-craft kanban --readonly --port=4040
```

---

## Archivo de Configuración

### Configuración YAML

Para monorepos y configuraciones multi-proyecto, utiliza `claude-projects.yaml`:

```yaml
settings:
  default_lang: "es"

projects:
  - name: "mi-monorepo"
    description: "Mi aplicación fullstack"
    root: "~/Proyectos/mi-monorepo"
    lang: "es"
    common: true
    modules:
      - path: "frontend"
        tech: react
      - path: "backend"
        tech: symfony
      - path: "mobile"
        tech: flutter
      - path: "api"
        tech: [python, react]  # Tecnologías múltiples
```

### Variables de Entorno

| Variable | Descripción | Predeterminado |
|----------|-------------|----------------|
| `CLAUDE_CRAFT_LANG` | Idioma predeterminado | `en` |
| `CLAUDE_CRAFT_TARGET` | Directorio destino predeterminado | `.` |
| `CLAUDE_CRAFT_CONFIG` | Ruta del archivo de config | `claude-projects.yaml` |

---

## Códigos de Salida

| Código | Significado |
|--------|-------------|
| 0 | Éxito |
| 1 | Error general |
| 2 | Argumentos inválidos |
| 3 | Prerrequisitos faltantes |
| 4 | Directorio destino no encontrado |
| 5 | Permiso denegado |

---

## Solución de Problemas

### Problemas de caché NPX

```bash
# Vaciar el caché NPX
npx clear-npx-cache
# o
rm -rf ~/.npm/_npx
```

### Script no ejecutable

```bash
chmod +x Dev/scripts/*.sh
# o
make fix-permissions
```

### Mala versión de yq

```bash
# Claude Craft requiere yq v4 (versión de Mike Farah)
yq --version
# Debe mostrar: yq (https://github.com/mikefarah/yq/) version v4.x.x
```

---

## Optimización de Tokens (RTK)

### Configuración Automática

```bash
# En Claude Code, configura todas las optimizaciones en un comando
/common:setup-rtk
```

### Comandos RTK

| Comando | Descripción |
|---------|-------------|
| `rtk gain` | Mostrar las economías de tokens |
| `rtk gain --history` | Historial de comandos con economías |
| `rtk discover` | Analizar el historial para oportunidades perdidas |
| `rtk proxy <cmd>` | Ejecutar un comando sin filtrado (debug) |
| `rtk --version` | Verificar la versión instalada |

### Comandos de Contexto Claude Code

| Comando | Descripción |
|---------|-------------|
| `/effort low\|medium\|high` | Ajustar el nivel de esfuerzo del modelo |
| `/context` | Sugerencias de optimización del contexto |
| `/compact` | Compactar proactivamente el contexto |
| `/clear` | Limpiar entre tareas no relacionadas |
| `/memory` | Aprendizajes persistentes (v2.1.59+) |
| `/loop <intervalo> <cmd>` | Tareas recurrentes (v2.1.71+) |
| `/model haiku\|sonnet\|opus` | Cambiar de modelo en sesión |

---

## Ver También

- [Guía de Inicio Rápido](QUICKSTART.md)
- [Prerrequisitos](PREREQUISITES.md)
- [Guía de Instalación](../INSTALLATION.md)
- [Referencia de Comandos](../COMMANDS-FULL-REFERENCE.md)
