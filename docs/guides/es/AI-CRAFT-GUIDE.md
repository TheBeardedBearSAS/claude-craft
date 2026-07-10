# Guía de Usuario de AI Craft
# Framework de Desarrollo Multi-IA

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Instalación](#instalación)
3. [Primeros Pasos](#primeros-pasos)
4. [Configuración de Proveedores](#configuración-de-proveedores)
5. [Servidores MCP](#servidores-mcp)
6. [Hooks](#hooks)
7. [Memoria Compartida](#memoria-compartida)
8. [Migración desde Claude Craft](#migración-desde-claude-craft)
9. [Referencia de Comandos](#referencia-de-comandos)
10. [Buenas Prácticas](#buenas-prácticas)
11. [Solución de Problemas](#solución-de-problemas)

---

## Introducción

AI Craft es un framework de desarrollo multi-IA integral que extiende la probada metodología de Claude Craft para trabajar sin problemas con múltiples proveedores de IA. Ya sea que uses **Vibe (Mistral AI)**, **Codex (OpenAI)**, **OpenCode (sst/opencode)**, **Claude Code (Anthropic)** o **Cursor CLI**, AI Craft ofrece una interfaz unificada para instalar reglas, agentes, comandos y flujos de trabajo.

> **GitHub Copilot no es compatible actualmente** — no existe un `copilot-provider.js` en `cli/lib/provider/`. GitHub Copilot CLI (`github.com/github/copilot-cli`) es un producto real y separado que podría añadirse como proveedor en el futuro.

### Características Clave

- ✅ **Soporte Multi-Proveedor**: Funciona con Vibe, Codex, OpenCode, Claude Code, Cursor y más
- ✅ **Integración MCP**: Soporte completo del Model Context Protocol con auto-descubrimiento
- ✅ **Memoria Compartida**: Historial de conversaciones y contexto compartidos entre proveedores
- ✅ **Sistema de Hooks**: Hooks pre/post comando y mensaje para cada proveedor
- ✅ **Retrocompatible**: 100% compatible con proyectos Claude Craft existentes
- ✅ **Migración Sencilla**: Herramienta de migración automática para proyectos Claude Craft

### Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Craft CLI                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Vibe      │  │   Codex      │  │    OpenCode         │  │
│  │ (Mistral)   │  │ (OpenAI)     │  │ (sst/opencode)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │   Claude    │  │   Cursor     │                          │
│  │ (Anthropic) │  │ (CLI)        │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Shared Memory & MCP                           │
├─────────────────────────────────────────────────────────────┤
│  • Conversation History                                        │
│  • Project Context                                             │
│  • User Preferences                                           │
│  • MCP Servers (filesystem, git, process, custom)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Instalación

### Instalación Global

```bash
# Install AI Craft globally
npm install -g @ai-craft/core

# Verify installation
ai-craft --version
# Output: 9.0.0
```

### Instalación Local (en un proyecto)

```bash
# Initialize AI Craft in your project
npx @ai-craft/core init-ai-craft

# Or install to a specific directory
npx @ai-craft/core install ./my-project
```

### Desde el Código Fuente

```bash
# Clone the repository
git clone https://github.com/TheBeardedBearSAS/ai-craft.git
cd ai-craft

# Install dependencies
npm install

# Link globally
npm link

# Run
ai-craft --version
```

---

## Primeros Pasos

### Inicio Rápido

```bash
# Navigate to your project
cd my-project

# Initialize AI Craft
ai-craft init-ai-craft

# List available AI providers
ai-craft providers

# Set your preferred provider
ai-craft use vibe

# Install rules for your tech stack
ai-craft install --tech=symfony
```

### Estructura del Proyecto

Después de la inicialización, tu proyecto tendrá la siguiente estructura:

```
my-project/
├── .ai-craft/                    # AI Craft configuration
│   ├── AI-CRAFT.md              # Main AI instructions
│   ├── ai-craft.yaml            # Configuration file
│   ├── providers/               # Provider-specific configs
│   │   ├── vibe/
│   │   │   ├── config/
│   │   │   │   └── default.yaml
│   │   │   ├── hooks/
│   │   │   │   ├── pre-execute.sh
│   │   │   │   └── post-execute.sh
│   │   │   └── mcp/
│   │   ├── codex/
│   │   ├── opencode/
│   │   ├── claude/
│   │   └── cursor/
│   ├── rules/                   # AI rules
│   ├── agents/                  # AI agents
│   ├── commands/                # Slash commands
│   ├── skills/                  # Community skills
│   ├── templates/               # Project templates
│   ├── memory/                  # Shared memory
│   │   ├── conversations/
│   │   ├── project-state.json
│   │   └── user-preferences.json
│   └── mcp/                     # Global MCP servers
└── .claude/                     # Symlink to .ai-craft/ (backward compatible)
```

### Usando con Diferentes Proveedores

```bash
# List all available providers
ai-craft providers

# Show provider health status
ai-craft provider-status

# Set default provider for this project
ai-craft use vibe

# Override provider for a single command
ai-craft --provider=codex install ./my-project
```

---

## Configuración de Proveedores

### Viendo la Configuración

```bash
# Show current configuration
ai-craft config show

# Get a specific value
ai-craft config show | grep primary
```

### Estableciendo la Configuración

```bash
# Set default provider
ai-craft config set providers.primary vibe

# Set model routing
ai-craft config set optimization.model_routing auto

# Set memory settings
ai-craft config set memory.enabled true
```

### Configuración Específica de Proveedor

Cada proveedor tiene su propio archivo de configuración en `.ai-craft/providers/<name>/config/default.yaml`:

**Ejemplo de Configuración de Vibe:**
```yaml
provider:
  name: vibe
  display_name: "Vibe (Mistral AI)"
  binary: "vibe"

model:
  default: "mistral-large-3.5"
  aliases:
    opus: "mistral-large-3.5"
    sonnet: "mistral-medium-3.5"
    haiku: "mistral-small-3.5"

mcp:
  enabled: true
  servers:
    filesystem: true
    git: true
    process: true
```

**Cambiando los Modelos del Proveedor:**
```yaml
model:
  default: "mistral-large-3.5"
  routing:
    architecture: "mistral-large-3.5"
    code_review: "mistral-medium-3.5"
    implementation: "mistral-medium-3.5"
    quick: "mistral-small-3.5"
```

---

## Servidores MCP

### ¿Qué es MCP?

MCP (Model Context Protocol) es un estándar para conectar modelos de IA con herramientas, APIs y fuentes de datos. AI Craft admite servidores MCP en todos los proveedores, permitiendo un acceso a herramientas consistente sin importar qué IA uses.

### Servidores MCP Integrados

Cada proveedor viene con servidores MCP integrados:

| Servidor | Descripción | Vibe | Codex | OpenCode | Claude | Cursor |
|--------|-------------|------|-------|----------|--------|--------|
| filesystem | Acceso al sistema de archivos | ✅ | ✅ | ✅ | ✅ | ✅ |
| git | Acceso al repositorio Git | ✅ | ✅ | ✅ | ✅ | ✅ |
| process | Ejecución de procesos | ✅ | ❌ | ✅ | ❌ | ❌ |

### Gestión de Servidores MCP

```bash
# List all MCP servers for current provider
ai-craft mcp list

# Add a custom MCP server
ai-craft mcp add my-server --command="npx" --args="-y,@modelcontextprotocol/server-postgres" --description="PostgreSQL access"

# Start all MCP servers
ai-craft mcp start
```

### Configuración de un Servidor MCP Personalizado

Crea un archivo JSON en `.ai-craft/providers/<name>/mcp/` o `.ai-craft/mcp/`:

```json
{
  "name": "postgres",
  "description": "PostgreSQL database access",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "DATABASE_URL": "postgresql://user:password@localhost:5432/db"
  },
  "timeout": 30,
  "enabled": true,
  "auto_start": true
}
```

### Servidores MCP Comunes

- `@modelcontextprotocol/server-filesystem` - Acceso al sistema de archivos
- `@modelcontextprotocol/server-git` - Acceso al repositorio Git
- `@modelcontextprotocol/server-process` - Ejecución de procesos
- `@modelcontextprotocol/server-sqlite` - Acceso a base de datos SQLite
- `@modelcontextprotocol/server-postgres` - Acceso a PostgreSQL

---

## Hooks

Los hooks te permiten ejecutar scripts personalizados antes y después de los comandos de IA. Son útiles para:

- Validación del entorno
- Registro (logging)
- Preprocesamiento personalizado
- Postprocesamiento de respuestas
- Manejo de errores

### Tipos de Hooks

1. **pre-execute.sh** - Se ejecuta antes de cualquier ejecución de comando
2. **post-execute.sh** - Se ejecuta después de la ejecución del comando
3. **pre-message.sh** - Se ejecuta antes de enviar un mensaje
4. **post-message.sh** - Se ejecuta después de recibir una respuesta

### Ubicación de los Hooks

Los hooks se ubican en `.ai-craft/providers/<name>/hooks/`:

```
.ai-craft/
└── providers/
    └── vibe/
        └── hooks/
            ├── pre-execute.sh
            └── post-execute.sh
```

### Hook de Ejemplo: pre-execute.sh

```bash
#!/bin/bash
# AI Craft - Vibe Provider Pre-Execute Hook

# Check if API key is set
if [[ -z "${MISTRAL_API_KEY:-}" ]]; then
  echo "⚠️  MISTRAL_API_KEY not set" >&2
  exit 1
fi

# Set system prompt from AI-CRAFT.md
if [[ -f ".ai-craft/AI-CRAFT.md" ]]; then
  export VIBE_SYSTEM_PROMPT="$(cat .ai-craft/AI-CRAFT.md)"
fi

exit 0
```

### Creación de Hooks Personalizados

1. Crea un directorio de hooks:
```bash
mkdir -p .ai-craft/providers/vibe/hooks
```

2. Crea tu script de hook:
```bash
cat > .ai-craft/providers/vibe/hooks/pre-execute.sh << 'EOF'
#!/bin/bash
# My custom pre-execute hook
echo "Running custom pre-execute hook..."
# Add your custom logic here
exit 0
EOF
chmod +x .ai-craft/providers/vibe/hooks/pre-execute.sh
```

3. Habilita el hook en la configuración:
```yaml
# In .ai-craft/providers/vibe/config/default.yaml
hooks:
  enabled: true
  pre_command:
    - "pre-execute.sh"
    - "custom-pre-execute.sh"
  post_command:
    - "post-execute.sh"
```

---

## Memoria Compartida

AI Craft ofrece un sistema de memoria compartida que permite a los diferentes proveedores compartir:

- **Conversaciones**: Historial de mensajes entre proveedores
- **Contexto del Proyecto**: Información compartida del proyecto
- **Preferencias del Usuario**: Configuraciones específicas del usuario
- **Caché**: Almacenamiento temporal de datos

### Uso de la Memoria Compartida

```bash
# Memory is automatically available through the AI Craft CLI
# You can access it programmatically in your scripts
```

### Acceso Programático

```javascript
import { memoryManager } from '@ai-craft/core/cli/lib/memory.js';

// Get or create a conversation
const conversation = memoryManager.getConversation('session-1', {
  provider: 'vibe',
  model: 'mistral-large-3.5'
});

// Add messages
memoryManager.addMessage('session-1', {
  role: 'user',
  content: 'Hello!'
});

// Get conversation history
const history = memoryManager.getHistory('session-1', 10);

// Set user preferences
memoryManager.setPreference('theme', 'dark');
const theme = memoryManager.getPreference('theme');

// Use cache
memoryManager.setCache('temp-data', { foo: 'bar' }, 60000); // 60s TTL
const data = memoryManager.getCache('temp-data');
```

### Estructura de la Memoria

```
.ai-craft/memory/
├── conversations/           # Conversation history (JSON files)
│   ├── session-1.json
│   └── session-2.json
├── project-state.json      # Project context and state
└── user-preferences.json   # User preferences
```

---

## Migración desde Claude Craft

AI Craft ofrece una migración sin fricciones desde proyectos Claude Craft.

### Migración Automática

```bash
# Navigate to your Claude Craft project
cd my-claude-craft-project

# Run the migration
npx @ai-craft/core migrate

# Or use the init command
npx @ai-craft/core init-ai-craft
```

### Qué Se Migra

| Componente | Estado de Migración | Notas |
|-----------|-----------------|-------|
| `.claude/CLAUDE.md` | ✅ Migrado | → `.ai-craft/AI-CRAFT.md` |
| `.claude/settings.json` | ✅ Migrado | Configuración adaptada para multi-proveedor |
| `.claude/context.yaml` | ✅ Migrado | → `.ai-craft/ai-craft.yaml` |
| `.claude/rules/` | ✅ Migrado | Copiado a `.ai-craft/rules/` |
| `.claude/agents/` | ✅ Migrado | Copiado a `.ai-craft/agents/` |
| `.claude/commands/` | ✅ Migrado | Copiado a `.ai-craft/commands/` |
| `.claude/skills/` | ✅ Migrado | Copiado a `.ai-craft/skills/` |
| `.claude/templates/` | ✅ Migrado | Copiado a `.ai-craft/templates/` |
| `.claude/mcp/` | ✅ Migrado | Copiado a `.ai-craft/mcp/` |
| symlink `.claude/` | ✅ Creado | Apunta a `.ai-craft/` para retrocompatibilidad |

### Pasos de Migración Manual

Si prefieres migrar manualmente:

1. Crea el directorio `.ai-craft/`
2. Copia todos los archivos de `.claude/` a `.ai-craft/`
3. Renombra `CLAUDE.md` a `AI-CRAFT.md`
4. Actualiza las referencias de `.claude/` a `.ai-craft/`
5. Crea directorios específicos de proveedor
6. Crea el symlink: `ln -s .ai-craft .claude`

### Después de la Migración

Después de la migración, puedes:

```bash
# Verify the migration
ai-craft doctor

# Set your preferred provider
ai-craft use vibe

# Check provider status
ai-craft provider-status

# Start using AI Craft
npx @ai-craft/core install --tech=symfony
```

---

## Referencia de Comandos

### Comandos Principales

| Comando | Descripción |
|---------|-------------|
| `ai-craft --version` | Muestra la versión |
| `ai-craft --help` | Muestra la ayuda |
| `ai-craft install` | Instalación interactiva |
| `ai-craft install <path>` | Instala en un directorio específico |
| `ai-craft install --auto` | Auto-instalación (sin preguntas) |
| `ai-craft install --tech=<name>` | Instala para una tecnología específica |
| `ai-craft init-ai-craft` | Inicializa AI Craft |

### Comandos de Proveedor

| Comando | Descripción |
|---------|-------------|
| `ai-craft providers` | Lista todos los proveedores |
| `ai-craft provider-status` | Muestra el estado de salud del proveedor |
| `ai-craft use <provider>` | Establece el proveedor predeterminado |
| `ai-craft --provider=<name> <cmd>` | Sobrescribe el proveedor para el comando |

### Comandos MCP

| Comando | Descripción |
|---------|-------------|
| `ai-craft mcp list` | Lista los servidores MCP |
| `ai-craft mcp add <name> [options]` | Añade un servidor MCP personalizado |
| `ai-craft mcp start` | Inicia los servidores MCP |

### Comandos de Configuración

| Comando | Descripción |
|---------|-------------|
| `ai-craft config show` | Muestra la configuración |
| `ai-craft config set <key> <value>` | Establece un valor de configuración |
| `ai-craft config edit` | Edita la configuración en el editor |

### Comandos de Migración

| Comando | Descripción |
|---------|-------------|
| `ai-craft migrate` | Migra un proyecto Claude Craft |
| `ai-craft migrate <path>` | Migra el proyecto en la ruta indicada |

### Comandos Legacy (Retrocompatibles)

Todos los comandos de Claude Craft siguen funcionando:

| Comando | Descripción |
|---------|-------------|
| `claude-craft install` | Igual que `ai-craft install` |
| `claude-craft --version` | Igual que `ai-craft --version` |
| Todos los comandos `/workflow:*` | Siguen funcionando |
| Todos los comandos `/common:*` | Siguen funcionando |

### Opciones de Comando de Servidor MCP

| Opción | Descripción | Ejemplo |
|--------|-------------|---------|
| `--command=<cmd>` | Comando a ejecutar | `--command=npx` |
| `--args=<args>` | Argumentos separados por comas | `--args="-y,@modelcontextprotocol/server-postgres"` |
| `--description=<desc>` | Descripción del servidor | `--description="PostgreSQL access"` |
| `--timeout=<seconds>` | Tiempo de espera en segundos | `--timeout=30` |

### Claves de Configuración

Puedes establecer cualquier clave de configuración usando notación de punto:

```bash
# Set primary provider
ai-craft config set providers.primary vibe

# Set fallback providers
ai-craft config set providers.fallback[0] codex

# Set memory settings
ai-craft config set memory.enabled true

# Set optimization settings
ai-craft config set optimization.prompt_caching true
```

---

## Buenas Prácticas

### 1. Empieza en Pequeño

Comienza con la configuración predeterminada y añade personalizaciones de forma incremental.

### 2. Usa Configuraciones Específicas de Proveedor

Cada proveedor tiene fortalezas diferentes. Configúralos adecuadamente:

- **Vibe**: Excelente para tareas de codificación, úsalo con modelos Mistral
- **Codex**: Agente de codificación de terminal de OpenAI, integración profunda con GitHub
- **OpenCode**: Más de 75 proveedores de modelos en la nube vía Models.dev, backend autoalojado opcional
- **Claude Code**: Fiabilidad probada, excelente para tareas complejas
- **Cursor CLI**: Agente de terminal independiente completo, scriptable en CI/SSH

### 3. Habilita los Servidores MCP de Forma Incremental

Comienza con los servidores MCP integrados (filesystem, git) y añade servidores personalizados según sea necesario.

### 4. Usa Hooks para Validación

Crea hooks pre-execute para validar tu entorno antes de ejecutar comandos de IA.

### 5. Comparte Contexto Entre Proveedores

Usa el sistema de memoria compartida para mantener el contexto al cambiar entre proveedores.

### 6. Mantén la Configuración Bajo Control de Versiones

Confirma (commit) tu `.ai-craft/ai-craft.yaml` y las configuraciones de proveedor al control de versiones, pero excluye:

```
.ai-craft/memory/
.ai-craft/logs/
.ai-craft/mcp/*.json  # If they contain API keys
```

### 7. Actualiza Regularmente

AI Craft está en desarrollo activo. Actualiza regularmente:

```bash
npm update -g @ai-craft/core
```

---

## Solución de Problemas

### Problemas Comunes

#### "Proveedor no encontrado"

```bash
# Check installed providers
ai-craft providers

# Install missing provider
# For Vibe: npm install -g @vibe/cli
# For Codex: npm install -g @openai/codex
# For OpenCode: npm install -g opencode-ai
# For Claude Code: Follow Anthropic instructions
# For Cursor: curl https://cursor.com/install -fsS | bash
```

#### "El servidor MCP no inicia"

```bash
# MCP auto-start is not yet implemented (startAllMCPServers() is a stub
# that registers servers without spawning a process) - there is no
# .ai-craft/logs/mcp.log to check. Start servers manually for now, see
# .ai-craft/providers/MCP-README.md.

# Test server manually
npx @modelcontextprotocol/server-filesystem --help

# Check permissions
ls -la .ai-craft/providers/*/mcp/
chmod +x .ai-craft/providers/*/mcp/*.json
```

#### "El hook falló"

```bash
# Check hook logs
tail -f .ai-craft/logs/*-hooks.log

# Test hook manually
bash .ai-craft/providers/vibe/hooks/pre-execute.sh

# Fix permissions
chmod +x .ai-craft/providers/*/hooks/*.sh
```

#### "La memoria no persiste"

```bash
# Check memory directory exists
ls -la .ai-craft/memory/

# Check permissions
chmod -R 755 .ai-craft/memory/
```

### Modo Depuración

Habilita el registro de depuración:

```bash
DEBUG=ai-craft* ai-craft providers
```

### Reiniciando AI Craft

```bash
# Remove AI Craft directory
rm -rf .ai-craft/

# Reinitialize
npx @ai-craft/core init-ai-craft
```

### Verificando el Entorno

```bash
# Check Node.js version (requires >= 22.0.0)
node --version

# Check npm version
npm --version

# Check AI Craft version
ai-craft --version
```

---

## Soporte

- **Documentación**: [https://github.com/TheBeardedBearSAS/ai-craft](https://github.com/TheBeardedBearSAS/ai-craft)
- **Incidencias (Issues)**: [GitHub Issues](https://github.com/TheBeardedBearSAS/ai-craft/issues)
- **Debates (Discussions)**: [GitHub Discussions](https://github.com/TheBeardedBearSAS/ai-craft/discussions)
- **Claude Craft Original**: [https://github.com/TheBeardedBearSAS/claude-craft](https://github.com/TheBeardedBearSAS/claude-craft)

---

*AI Craft - Framework de Desarrollo Multi-IA | Versión 9.0.0 | © 2026 TheBeardedCTO*
