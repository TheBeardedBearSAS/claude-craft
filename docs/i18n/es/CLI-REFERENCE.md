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

Lanza una interfaz web local que visualiza el directorio BMAD v6 `project-management/` como un tablero Scrum / Kanban. El servidor escucha exclusivamente en `127.0.0.1` y nunca solicita Internet.

### Uso

```bash
npx @the-bearded-bear/claude-craft kanban [ruta] [opciones]
```

La `ruta` es por defecto el directorio actual. El destino debe contener una subcarpeta `project-management/` (generada por `/workflow:plan` o `/sprint:start`).

### Opciones

| Opción | Descripción |
|--------|-------------|
| `--port=<n>` | Puerto HTTP (predeterminado: 3737) |
| `--open` | Abre automáticamente el navegador |
| `--readonly` | Desactiva todas las mutaciones (403 en cada PATCH) |
| `--no-watch` | Desactiva el watcher de archivos |

### Vistas

- **Kanban** — 6 columnas. Arrastrar y soltar para transicionar. Los gates (INVEST 6/6, DoD, tareas completas) se validan del lado del servidor.
- **Backlog** — árbol Epic (solo lectura) con progreso por epic.
- **Burndown** — curvas ideal vs real del sprint activo, indicador on-track / at-risk / behind.
- **Dependencies** — grafo dirigido de las dependencias inter-stories, ciclos en rojo.
- **Docs** — visualizador markdown. Los enlaces `[US-XXX]` abren la tarjeta correspondiente.

### Ejemplos

```bash
# Lanza en el proyecto actual y abre el navegador
npx @the-bearded-bear/claude-craft kanban --open

# Modo solo lectura
npx @the-bearded-bear/claude-craft kanban --readonly --port=4040
```

### Seguridad

Bind `127.0.0.1` exclusivo, CSRF same-origin, path traversal bloqueado, escritura atómica (lock + backup + rollback + mtime check), CSP estricta, cero llamadas salientes.

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
