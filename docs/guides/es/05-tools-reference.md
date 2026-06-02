# Guía de Referencia de Herramientas

Esta guía cubre las herramientas utilitarias incluidas con Claude-Craft para gestionar perfiles, visualización de estado, configuración de proyectos, y los comandos y funcionalidades de Claude Code (v8.7).

---

## Tabla de Contenidos

1. [Comandos de Claude Code](#comandos-de-claude-code)
2. [Eventos de Hook](#eventos-de-hook)
3. [Frontmatter de Agentes](#frontmatter-de-agentes)
4. [Búsqueda de Herramientas MCP](#búsqueda-de-herramientas-mcp)
5. [Modo Auto](#modo-auto)
6. [Plantillas de Hook](#plantillas-de-hook)
7. [Configuración Administrada](#configuración-administrada)
8. [Gestor MultiAccount](#gestor-multiaccount)
9. [StatusLine](#statusline)
10. [Gestor ProjectConfig](#gestor-projectconfig)
11. [Instalación](#instalación)

---

## Comandos de Claude Code

Claude Code proporciona comandos integrados para la gestión del contexto y las sesiones. Están disponibles en cualquier sesión de Claude Code (v2.1.47+).

### Comandos de Gestión del Contexto

| Comando | Versión | Descripción |
|---------|---------|-------------|
| `/clear` | Todas | Limpiar el contexto entre tareas no relacionadas |
| `/compact` | Todas | Compactar el contexto de forma proactiva (ejecutar al ~70% de uso) |
| `/context` | v2.1.74+ | Obtener sugerencias accionables para optimizar el contexto |
| `/effort low\|medium\|high` | v2.1.72+ | Ajustar el esfuerzo de razonamiento del modelo según la complejidad de la tarea |
| `/memory` | v2.1.59+ | Guardar aprendizajes persistentes entre sesiones y compactaciones |
| `/model haiku\|sonnet\|opus` | v2.1.72+ | Cambiar de modelo a mitad de sesión según la complejidad de la tarea |

### Comandos de Sesión

| Comando | Versión | Descripción |
|---------|---------|-------------|
| `/loop [intervalo] [comando]` | v2.1.71+ | Ejecutar tareas recurrentes (p. ej., `/loop 5m /common:pre-commit-check`) |
| `/proactive` | v2.1.105+ | Alias para `/loop` |
| `/color` | v2.1.94+ | Cambiar el esquema de colores del terminal |
| `/rename` | v2.1.94+ | Renombrar la sesión actual |
| `/powerup` | v2.1.94+ | Activar funcionalidades adicionales |

### Ejemplos de Uso

```bash
# Ajustar el esfuerzo para una búsqueda sencilla
/effort low

# Cambiar a un modelo más económico para exploración
/model sonnet

# Configurar monitoreo recurrente de CI
/loop 5m "Check if CI pipeline passed"

# Guardar contexto importante antes de la compactación
/memory "Authentication uses JWT with RS256, refresh tokens in HttpOnly cookies"
```

---

## Eventos de Hook

Claude Code soporta 24 eventos de hook (8 añadidos en versiones recientes de Claude Code) para automatizar flujos de trabajo:

### Todos los Eventos de Hook

| Evento | Momento | Caso de Uso |
|--------|---------|-------------|
| **PreToolUse** | Antes de ejecutar la herramienta | Bloquear comandos peligrosos, reescribir con RTK |
| **PostToolUse** | Después de ejecutar la herramienta | Filtrar salida verbosa, resumir resultados |
| **PreCompact** | Antes de la compactación del contexto | Guardar contexto crítico; el código de salida 2 bloquea la compactación (v2.1.105+) |
| **PostCompact** | Después de la compactación del contexto | Re-inyectar contexto esencial |
| **SessionStart** | Al iniciar la sesión | Cargar elementos esenciales del contexto, configurar el entorno |
| **StopFailure** | En parada inesperada | Guardar estado, alertar sobre fallos |
| **Notification** | En eventos de notificación | Alertas personalizadas |
| **TaskCreated** | Cuando se crea una tarea de sub-agente | Rastrear el trabajo de sub-agentes |
| **CwdChanged** | Cambio del directorio de trabajo | Actualizar el entorno según el directorio |
| **FileChanged** | Modificación de archivo detectada | Activar reconstrucciones, linting |
| **PermissionDenied** | Fallo en la comprobación de permisos | Registrar eventos de seguridad |
| **Elicitation** | Antes del prompt del usuario | Personalizar el flujo de elicitación |
| **ElicitationResult** | Después de la respuesta del usuario | Procesar los resultados de elicitación |
| **Stop** | Al detener la sesión | Limpieza |

### Mejoras de Hook (v8.7)

| Funcionalidad | Descripción |
|---------------|-------------|
| **`if` condicional** | Ejecutar hooks solo cuando la condición coincide |
| **`defer`** | Diferir la ejecución del hook para evitar bloqueos |
| **Bloqueo PreCompact** | El código de salida 2 en el hook PreCompact bloquea la compactación (v2.1.105+) |

### Ejemplo: Filtro de Salida PostToolUse

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "echo '$TOOL_OUTPUT' | head -100"
      }]
    }]
  }
}
```

---

## Frontmatter de Agentes

Los agentes personalizados (v2.1.78+) soportan campos frontmatter para controlar el comportamiento y el coste:

```yaml
---
effort: low          # Esfuerzo de razonamiento (low/medium/high)
maxTurns: 10         # Número máximo de turnos de conversación
disallowedTools:     # Herramientas que el agente no puede usar
  - Edit
  - Write
---
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `effort` | string | Esfuerzo de razonamiento `low`, `medium` o `high` |
| `maxTurns` | number | Número máximo de turnos antes de detenerse |
| `disallowedTools` | lista | Herramientas que el agente no tiene permitido usar |

Esto es útil para crear agentes de exploración económicos que pueden leer pero no modificar código.

---

## Búsqueda de Herramientas MCP

La Búsqueda de Herramientas MCP (v2.1.80+) permite la carga diferida de herramientas MCP, reduciendo el consumo de contexto en un 95%:

| Enfoque | Coste de Contexto |
|---------|-------------------|
| MCP clásico (todas las herramientas cargadas) | ~500-2000 tokens/herramienta/turno |
| MCP con Búsqueda de Herramientas (diferida) | ~50 tokens en total |

### Uso

```bash
# Cargar una herramienta específica bajo demanda
ToolSearch with query: "select:tool_name"

# Buscar por palabra clave
ToolSearch with query: "slack send"
```

En lugar de cargar todas las herramientas del servidor MCP al iniciar, la Búsqueda de Herramientas las carga solo cuando se necesitan.

---

## Modo Auto

El Modo Auto (v2.1.94+) es un clasificador de permisos basado en IA que reemplaza `--dangerously-skip-permissions` de forma más segura:

| Modo | Protección | Velocidad | Caso de Uso |
|------|-----------|-----------|-------------|
| Manual | Máxima | Lenta | Flujos de trabajo auditados, alta seguridad |
| Modo Auto | Alta | Rápida | Flujos de trabajo de desarrollo confiables |
| Omitir Permisos | Mínima | Máxima | Solo proyectos locales/personales |

**Funcionalidades de seguridad:**
- Un modelo de seguridad en segundo plano evalúa cada llamada a herramienta
- Las operaciones seguras (lecturas, pruebas) se aprueban automáticamente
- Las acciones de riesgo (eliminación masiva, exfiltración) se bloquean
- 3 bloqueos consecutivos revierten al modo manual
- Más de 20 bloqueos en una sesión revierten al modo manual completo

Disponible para planes Team con aprobación de administrador.

---

## Plantillas de Hook

Claude-Craft proporciona plantillas de hook listas para usar en `.claude/templates/hooks/`:

| Plantilla | Propósito |
|-----------|-----------|
| `output-filter.json` | Filtro PostToolUse para salidas grandes de CLI |
| `pre-compact.json` | Hook PreCompact para preservar el contexto crítico |
| `context-reinject.json` | Hook SessionStart para re-inyección de contexto después de la compactación |

### Instalación

Copia las plantillas al archivo `.claude/settings.json` de tu proyecto o combínalas en tu configuración de hooks:

```bash
# Ver plantillas disponibles
ls .claude/templates/hooks/

# Aplicar a tu proyecto (combinar manualmente en settings.json)
cat .claude/templates/hooks/output-filter.json
```

---

## Configuración Administrada

El directorio `managed-settings.d/` (v2.1.83+) permite la configuración modular mediante combinación en orden alfabético:

```
.claude/
  managed-settings.d/
    00-base.json          # Configuración base
    10-security.json      # Reglas de seguridad
    20-team.json          # Preferencias del equipo
```

Los archivos se combinan en orden alfabético, lo que permite a los equipos superponer configuraciones sin conflictos.

---

## Gestor MultiAccount

Gestiona múltiples perfiles de Claude Code para diferentes cuentas o contextos.

### Propósito

- Cambiar entre cuentas de Claude (personal, trabajo, cliente)
- Gestionar los límites de velocidad cambiando de perfil
- Mantener los contextos de proyecto aislados
- Compartir o aislar configuraciones

### Instalación

```bash
# Mediante Makefile
make install-multiaccount

# O manualmente
cp Tools/MultiAccount/claude-accounts.sh ~/.local/bin/
chmod +x ~/.local/bin/claude-accounts.sh
```

### Uso

#### Modo Interactivo

```bash
# Lanzar el menú interactivo
./claude-accounts.sh
# O si está instalado globalmente
claude-accounts.sh
```

Opciones del menú:
```
1. Listar perfiles
2. Añadir un perfil
3. Eliminar un perfil
4. Autenticar un perfil
5. Lanzar Claude Code
6. Instalar la función ccsp()
7. Migrar perfil heredado
8. Ayuda
9. Salir
```

#### Modo CLI

```bash
# Listar todos los perfiles
./claude-accounts.sh list

# Añadir nuevo perfil
./claude-accounts.sh add <nombre-de-perfil>

# Eliminar perfil
./claude-accounts.sh remove <nombre-de-perfil>

# Autenticar perfil
./claude-accounts.sh auth <nombre-de-perfil>

# Lanzar Claude Code con perfil
./claude-accounts.sh launch <nombre-de-perfil>

# Mostrar ayuda
./claude-accounts.sh --help
```

### Modos de Perfil

#### Modo Compartido (Predeterminado)

El perfil comparte la configuración con `~/.claude` principal:

```bash
./claude-accounts.sh add trabajo --mode=shared
```

- La configuración está vinculada simbólicamente a `~/.claude`
- Adecuado para: cambiar entre cuentas manteniendo la configuración
- Caso de uso: Gestión de límites de velocidad

#### Modo Aislado

El perfil tiene una configuración completamente independiente:

```bash
./claude-accounts.sh add cliente-a --mode=isolated
```

- Copia independiente de la configuración
- Adecuado para: trabajo con clientes con reglas separadas
- Caso de uso: Diferentes configuraciones de proyecto

### Cambio Rápido de Perfil

Instala la función de shell `ccsp()`:

```bash
# Añadir al perfil mediante la opción 6 del menú
# O añadir manualmente a ~/.bashrc o ~/.zshrc:

ccsp() {
    if [ -z "$1" ]; then
        claude-accounts.sh list
    else
        export CLAUDE_CONFIG_DIR="$HOME/.claude-profiles/$1"
        echo "Switched to profile: $1"
    fi
}
```

Uso:
```bash
# Listar perfiles
ccsp

# Cambiar a un perfil
ccsp trabajo

# Lanzar Claude Code (usa el perfil actual)
claude
```

### Estructura de Perfiles

```
~/.claude-profiles/
├── trabajo/
│   ├── .mode              # "shared" o "isolated"
│   ├── config/            # Configuración de Claude
│   └── settings.json      # Configuración del perfil
├── cliente-a/
│   └── ...
└── personal/
    └── ...
```

### Soporte de Idiomas

```bash
# Usar en un idioma específico
./claude-accounts.sh --lang=fr list
./claude-accounts.sh --lang=es add trabajo
./claude-accounts.sh --lang=de --help
```

---

## StatusLine

Muestra información contextual en la barra de estado de Claude Code.

### Propósito

- Mostrar el perfil actual
- Visualizar el modelo en uso
- Mostrar la rama y el estado de git
- Rastrear el porcentaje de uso del contexto
- Monitorear los costes de sesión y semanales
- Mostrar los límites de uso

### Instalación

```bash
# Mediante Makefile
make install-statusline

# O manualmente
cp Tools/StatusLine/statusline.sh ~/.claude/statusline.sh
cp Tools/StatusLine/statusline.conf.example ~/.claude/statusline.conf
chmod +x ~/.claude/statusline.sh
```

### Configurar Claude Code

Añadir a `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

### Formato de la Línea de Estado

```
🔑 pro | 🧠 Opus | 🌿 main +2~1 | 📁 my-project | 📊 45% | ⏱️ 5h: 23% | 📅 Sem: 45% | 💰 $0.42 | 🕐 14:32
```

| Elemento | Descripción |
|----------|-------------|
| 🔑 pro | Nombre del perfil activo |
| 🧠 Opus | Modelo actual (🧠 Opus, 🎵 Sonnet, 🍃 Haiku) |
| 🌿 main +2~1 | Rama de git + estado (+staged ~modificado ?sin-seguimiento) |
| 📁 my-project | Nombre del directorio del proyecto |
| 📊 45% | Uso de la ventana de contexto |
| ⏱️ 5h: 23% | Porcentaje de uso de la sesión (5h) |
| 📅 Sem: 45% | Porcentaje de uso semanal |
| 💰 $0.42 | Coste de la sesión |
| 🕐 14:32 | Hora actual |

### Código de Colores

Los indicadores de uso cambian de color según los umbrales:

| Color | Significado | Umbral |
|-------|-------------|--------|
| Verde | Uso bajo | < 60% |
| Amarillo | Uso moderado | 60-80% |
| Rojo | Uso alto | > 80% |

### Configuración

Editar `~/.claude/statusline.conf`:

```bash
# =============================================================================
# LÍMITES DE USO
# =============================================================================
# Valores recomendados por plan:
#   - Pro ($20/mes)        : SESSION=25,   WEEKLY=150
#   - Max 5x ($100/mes)   : SESSION=125,  WEEKLY=750
#   - Max 20x ($200/mes)  : SESSION=500,  WEEKLY=3000

SESSION_COST_LIMIT=500.00
WEEKLY_COST_LIMIT=3000.00

# =============================================================================
# UMBRALES DE ALERTA (porcentaje)
# =============================================================================
USAGE_WARN_THRESHOLD=60    # Amarillo al 60%
USAGE_CRIT_THRESHOLD=80    # Rojo al 80%

# =============================================================================
# CACHÉ (rendimiento)
# =============================================================================
SESSION_CACHE_TTL=60       # Refresco de sesión cada 60s
WEEKLY_CACHE_TTL=300       # Refresco semanal cada 5min

# =============================================================================
# OPCIONES DE VISUALIZACIÓN
# =============================================================================
SHOW_SESSION_LIMIT=true
SHOW_WEEKLY_LIMIT=true

# Etiquetas personalizadas
SESSION_LABEL="⏱️ 5h"
WEEKLY_LABEL="📅 Sem"
```

### Dependencias

```bash
# Requerido: jq (procesador JSON)
# macOS
brew install jq

# Linux
sudo apt install jq

# Opcional: ccusage (seguimiento de costes)
npm install -g ccusage
```

### Solución de Problemas

**La línea de estado no se muestra:**
```bash
# Verificar que el script es ejecutable
ls -la ~/.claude/statusline.sh

# Probar manualmente
echo '{"model":{"display_name":"Test"}}' | ~/.claude/statusline.sh
```

**El coste muestra $0.00:**
```bash
# Verificar que ccusage funciona
npx ccusage daily --json
```

**Los porcentajes de uso no se muestran:**
```bash
# Comprobar los archivos de caché
ls -la /tmp/.ccusage_*

# Limpiar caché para refrescar
rm /tmp/.ccusage_*
```

---

## Gestor ProjectConfig

Gestiona las configuraciones de proyecto de Claude-Craft mediante YAML.

### Propósito

- Definir la configuración del proyecto en YAML
- Gestionar múltiples proyectos
- Manejar configuraciones de monorepo
- Validar configuraciones
- Instalar reglas desde la configuración

### Instalación

```bash
# Mediante Makefile
make install-projectconfig

# O manualmente
cp Tools/ProjectConfig/claude-projects.sh ~/.local/bin/
chmod +x ~/.local/bin/claude-projects.sh
```

### Dependencias

```bash
# Requerido: yq (procesador YAML)
# macOS
brew install yq

# Linux (snap)
sudo snap install yq

# Linux (binario)
wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq
```

### Uso

#### Modo Interactivo

```bash
./claude-projects.sh
```

Opciones del menú:
```
1. Listar proyectos
2. Añadir un proyecto
3. Editar un proyecto
4. Añadir un módulo
5. Eliminar un proyecto
6. Validar configuración
7. Instalar proyecto
8. Ayuda
9. Salir
```

#### Modo CLI

```bash
# Listar proyectos configurados
./claude-projects.sh list

# Validar el archivo de configuración
./claude-projects.sh validate [archivo-de-config]

# Instalar un proyecto específico
./claude-projects.sh install <nombre-de-proyecto>

# Instalar todos los proyectos
./claude-projects.sh install-all

# Mostrar los detalles del proyecto
./claude-projects.sh show <nombre-de-proyecto>

# Añadir nuevo proyecto
./claude-projects.sh add <nombre-de-proyecto> <ruta>

# Eliminar proyecto
./claude-projects.sh remove <nombre-de-proyecto>
```

### Archivo de Configuración

Ubicación predeterminada: `./claude-projects.yaml`

```yaml
settings:
  default_lang: "fr"

projects:
  - name: "my-saas"
    description: "Plataforma SaaS"
    path: "~/Projects/my-saas"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
      - name: "web"
        path: "frontend"
        technologies: ["react"]
      - name: "mobile"
        path: "app"
        technologies: ["flutter"]

  - name: "internal-tool"
    path: "~/Projects/internal"
    technologies: ["python"]
    lang: "en"
```

### Validación

```bash
# Validar la configuración
./claude-projects.sh validate

# O mediante Makefile
make config-validate CONFIG=claude-projects.yaml
```

Las comprobaciones de validación incluyen:
- Sintaxis YAML válida
- Campos requeridos presentes
- Rutas existentes
- Tecnologías válidas
- Idiomas válidos

### Instalación desde Configuración

```bash
# Instalar un proyecto individual
./claude-projects.sh install my-saas

# O mediante Makefile
make config-install CONFIG=claude-projects.yaml PROJECT=my-saas

# Instalar todos los proyectos
make config-install-all CONFIG=claude-projects.yaml

# Simulacro (dry run)
make config-install CONFIG=claude-projects.yaml PROJECT=my-saas OPTIONS="--dry-run"
```

### Soporte de Idiomas

```bash
# Usar en un idioma específico
./claude-projects.sh --lang=fr list
./claude-projects.sh --lang=de validate
```

---

## Instalación

### Instalar Todas las Herramientas

```bash
make install-tools
```

Esto instala:
- Gestor MultiAccount
- StatusLine
- Gestor ProjectConfig

### Instalar Herramientas Individualmente

```bash
# Solo MultiAccount
make install-multiaccount

# Solo StatusLine
make install-statusline

# Solo ProjectConfig
make install-projectconfig
```

### Verificar la Instalación

```bash
# Comprobar MultiAccount
which claude-accounts.sh
claude-accounts.sh --version

# Comprobar StatusLine
ls ~/.claude/statusline.sh
cat ~/.claude/settings.json | jq '.statusLine'

# Comprobar ProjectConfig
which claude-projects.sh
claude-projects.sh --version
```

---

## Referencia Rápida

### Comandos MultiAccount

| Comando | Descripción |
|---------|-------------|
| `list` | Mostrar todos los perfiles |
| `add <nombre>` | Crear nuevo perfil |
| `remove <nombre>` | Eliminar perfil |
| `auth <nombre>` | Autenticar perfil |
| `launch <nombre>` | Iniciar Claude con el perfil |
| `migrate` | Convertir perfil heredado |

### Elementos de StatusLine

| Emoji | Significado |
|-------|-------------|
| 🔑 | Perfil |
| 🧠 | Modelo Opus |
| 🎵 | Modelo Sonnet |
| 🍃 | Modelo Haiku |
| 🌿 | Rama de git |
| 📁 | Proyecto |
| 📊 | % de contexto |
| ⏱️ | Uso de sesión |
| 📅 | Uso semanal |
| 💰 | Coste |
| 🕐 | Hora |

### Comandos ProjectConfig

| Comando | Descripción |
|---------|-------------|
| `list` | Mostrar todos los proyectos |
| `validate` | Comprobar la validez de la configuración |
| `install <nombre>` | Instalar reglas del proyecto |
| `install-all` | Instalar todos los proyectos |
| `show <nombre>` | Mostrar los detalles del proyecto |
| `add <nombre> <ruta>` | Añadir nuevo proyecto |
| `remove <nombre>` | Eliminar proyecto |

---

[&larr; Corrección de Bugs](04-bug-fixing.md) | [Solución de Problemas &rarr;](06-troubleshooting.md)
