# 🚀 Guía de Migración: Claude Craft → AI Craft

**Versión:** 9.0.0  
**Estado:** En Progreso  
**Rama:** `refactor/ai-craft`  
**Última Actualización:** 2026-07-10

---

## 📌 Resumen

Este documento describe la ruta de migración desde **Claude Craft** (proveedor único, solo Claude Code) hacia **AI Craft** (multi-proveedor, con soporte para Vibe, Codex, OpenCode, Claude Code, Cursor y GitHub Copilot).

### Estado Actual

| Componente | Estado | Detalles |
|-----------|--------|---------|
| **Arquitectura Central** | ✅ Completo | AI Provider Manager implementado |
| **Integraciones de Proveedores** | ✅ 80% Completo | Vibe, Codex, OpenCode, Claude, Cursor |
| **Configuración** | ✅ Completo | ai-craft.yaml, AI-CRAFT.md |
| **Documentación** | ✅ 70% Completo | README, AI-CRAFT.md actualizados |
| **Retrocompatibilidad** | ✅ Completo | Symlinks, modo legacy |
| **Migración de Agentes** | ⏳ No Iniciado | 70 agentes por actualizar |
| **Migración de Comandos** | ⏳ No Iniciado | 220 comandos por verificar |
| **Tests** | ⏳ No Iniciado | Se necesitan tests multi-proveedor |
| **Actualizaciones de Bundles** | ⏳ No Iniciado | bundles vibe/, codex/, opencode/ |

---

## 🎯 Fases de Migración

### Fase 1: Fundación (Rama Actual)
**Rama:** `refactor/ai-craft`  
**Estado:** ✅ Completo  
**Duración:** 2 semanas (estimado)

#### Lo Que Está Hecho

1. **AI Provider Manager** (`cli/lib/ai-provider.js`)
   - Clase de proveedor base con interfaz común
   - Detección de proveedor (configuración, entorno, binarios)
   - Ejecución de comandos con fallback
   - Soporte de sub-agentes
   - Gestión de servidores MCP

2. **Implementaciones de Proveedores** (`cli/lib/provider/`)
   - `base-provider.js` - Clase base abstracta
   - `vibe-provider.js` - Mistral AI Vibe
   - `codex-provider.js` - Google Codex
   - `opencode-provider.js` - OpenCode autoalojado
   - `claude-provider.js` - Anthropic Claude Code
   - `cursor-provider.js` - Cursor (VSCode)

3. **Configuración**
   - `ai-craft.yaml` - Plantilla de configuración multi-proveedor
   - `AI-CRAFT.md` - Instrucciones centrales para todos los proveedores
   - Ajustes de retrocompatibilidad

4. **Compatibilidad Legacy** (`cli/lib/legacy/claude-compat.js`)
   - Detección de proyectos Claude Craft
   - Herramienta de migración automática
   - Gestión de symlinks (`.claude/ -> .ai-craft/`)
   - Funcionalidad de backup y restauración

5. **Actualizaciones del Paquete**
   - Nombre del paquete: `@ai-craft/core` (antes `@the-bearded-bear/claude-craft`)
   - Versión: `9.0.0` (salto mayor — continuidad SemVer desde la serie `8.19.x` de
     Claude Craft, no un reinicio a `1.0.0`, dado que el cambio de nombre del paquete
     se trata como el breaking change de este proyecto, no como un producto totalmente nuevo)
   - Binarios: `ai-craft` + `claude-craft` (retrocompatible)

6. **Obsolescencia del Paquete Antiguo** (acción del mantenedor, no automatizada por este repositorio)
   - Una vez publicado `@ai-craft/core`, marca el paquete antiguo como obsoleto para
     que las instalaciones existentes muestren una indicación clara en lugar de quedar
     silenciosamente desactualizadas:
     ```bash
     npm deprecate @the-bearded-bear/claude-craft "Renamed to @ai-craft/core — see https://github.com/TheBeardedBearSAS/claude-craft/blob/main/docs/guides/en/MIGRATION-TO-AI-CRAFT.md"
     ```
   - Esto requiere acceso de publicación npm al nombre del paquete antiguo y no lo
     ejecuta ningún script de este repositorio — es un paso manual y único para quien
     tenga ese acceso.

#### Archivos Modificados/Creados

```
cli/
├── lib/
│   ├── ai-provider.js          # ✅ NEW: Main provider manager
│   ├── provider/               # ✅ NEW: Provider implementations
│   │   ├── base-provider.js
│   │   ├── vibe-provider.js
│   │   ├── codex-provider.js
│   │   ├── opencode-provider.js
│   │   ├── claude-provider.js
│   │   └── cursor-provider.js
│   └── legacy/                 # ✅ NEW: Compatibility layer
│       └── claude-compat.js
├── index.js                    # ⚠️ TODO: Update to use provider manager
│
.claude/
└── AI-CRAFT.md                # ✅ NEW: Multi-provider instructions

ai-craft.yaml                  # ✅ NEW: Default configuration
package.json                   # ✅ UPDATED: New name and version
README.md                      # ✅ UPDATED: Transition notice
docs/guides/en/MIGRATION-TO-AI-CRAFT.md  # ✅ NEW: This file (translated fr/es/de/pt)
```

---

## 📋 Checklist de Migración

### Para Mantenedores del Framework

- [x] Crear la rama `refactor/ai-craft`
- [x] Actualizar package.json con el nuevo nombre y versión
- [x] Crear la arquitectura del AI Provider Manager
- [x] Implementar la clase de proveedor base
- [x] Implementar el proveedor Vibe
- [x] Implementar el proveedor Codex
- [x] Implementar el proveedor OpenCode
- [x] Implementar el proveedor Claude (retrocompatible)
- [x] Implementar el proveedor Cursor
- [x] Crear la configuración ai-craft.yaml
- [x] Crear las instrucciones AI-CRAFT.md
- [x] Crear la capa de retrocompatibilidad
- [x] Actualizar README.md con el aviso de transición
- [x] Crear esta guía de migración
- [ ] Actualizar la CLI para usar el provider manager
- [ ] Actualizar el instalador para crear la estructura .ai-craft/
- [ ] Actualizar Ralph para funcionar con multi-proveedor
- [ ] Actualizar QA Recette para multi-navegador
- [ ] Actualizar los hooks de BMAD para multi-proveedor
- [ ] Migrar los 70 agentes al formato multi-proveedor
- [ ] Verificar que los 220 comandos funcionan con todos los proveedores
- [ ] Crear una suite de tests multi-proveedor
- [ ] Actualizar la documentación para todos los proveedores
- [ ] Crear bundles específicos de proveedor
- [ ] Probar la migración desde proyectos Claude Craft
- [ ] Actualizar GitHub Actions CI/CD
- [ ] Actualizar los metadatos del paquete npm
- [ ] Preparar las notas de la release
- [ ] Anunciar a la comunidad

### Para Usuarios que Migran Proyectos

1. **Haz una copia de seguridad de tu proyecto**
   ```bash
   cd ~/my-project
   git commit -am "Backup before AI Craft migration"
   ```

2. **Instala AI Craft**
   ```bash
   npx @ai-craft/core install ~/my-project
   ```

3. **Ejecuta la migración** (si es un proyecto Claude Craft)
   ```bash
   npx @ai-craft/core migrate ~/my-project
   ```

4. **Verifica la instalación**
   ```bash
   # Check .ai-craft/ directory exists
   ls -la .ai-craft/
   
   # Check symlink exists
   ls -la .claude/  # Should show -> .ai-craft/
   
   # Test with your provider
   vibe --system .ai-craft/AI-CRAFT.md
   ```

5. **Actualiza tu flujo de trabajo**
   - Usa el comando `ai-craft` (o `claude-craft` para retrocompatibilidad)
   - Actualiza cualquier script que referencie `.claude/` para usar `.ai-craft/`
   - Configura tu proveedor preferido en `ai-craft.yaml`

---

## 🔧 Detalles Técnicos de Implementación

### Visión General de la Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Craft CLI                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌────────────────────────┐   │
│  │   AI Provider        │    │        Commands         │   │
│  │   Manager            │    │                         │   │
│  │                     │    │  /workflow:init         │   │
│  │  ┌───────────────┐  │    │  /team:audit           │   │
│  │  │ Provider      │  │    │  /qa:recette          │   │
│  │  │ Detection     │  │    │  /common:ralph-run    │   │
│  │  └───────────────┘  │    │                         │   │
│  │                     │    └────────────────────────┘   │
│  │  ┌───────────────┐  │                                  │
│  │  │ Provider      │  │    ┌────────────────────────┐   │
│  │  │ Execution     │  │    │        Legacy           │   │
│  │  └───────────────┘  │    │        Compat           │   │
│  │                     │    │                         │   │
│  │  ┌───────────────┐  │    │  Claude Craft          │   │
│  │  │ Fallback      │  │    │  Migration             │   │
│  │  │ Handling      │  │    │  Symlink Management    │   │
│  │  └───────────────┘  │    └────────────────────────┘   │
│  └─────────────────────┘                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│   Vibe Provider  │ │ Codex Provider│ │ OpenCode Provider│
│   (Mistral AI)   │ │   (Google)    │ │ (Self-Hosted)    │
└─────────────────┘ └──────────────┘ └─────────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Providers                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │   Vibe CLI  │ │ Codex CLI   │ │ OpenCode CLI│    │
│  │ (vibe)      │ │ (codex)     │ │ (opencode)  │    │
│  └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                    │
│  ┌─────────────┐ ┌─────────────┐                    │
│  │ Claude Code │ │   Cursor    │                    │
│  │ (claude)    │ │ (VSCode)    │                    │
│  └─────────────┘ └─────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Interfaz de Proveedor

Todos los proveedores implementan la siguiente interfaz:

```javascript
class BaseProvider {
  // Metadata
  name: string              // 'vibe', 'codex', etc.
  displayName: string       // 'Vibe (Mistral AI)'
  mcpSupported: boolean     // Supports MCP servers
  hooksSupported: boolean   // Supports hooks system
  subAgentsSupported: boolean // Supports sub-agents
  forkSupported: boolean    // Supports context forking
  
  // Configuration
  supportedModels: string[] // List of supported models
  defaultModel: string      // Default model to use
  modelAliases: Object      // Model name mappings
  
  // Methods
  async execute(command, args, options)      // Execute a command
  async sendMessage(prompt, options)         // Send a message to AI
  async spawnSubAgent(prompt, options)       // Spawn a sub-agent
  getMCPServers()                           // Get MCP server configs
  mapCommand(command, args)                 // Map generic → provider-specific
  async isAvailable()                       // Check if provider is installed
  async getVersion()                        // Get provider version
  validateConfig(config)                    // Validate provider config
  getEnvVars()                              // Get environment variables
}
```

### Estructura de Configuración

**Nueva Estructura (`.ai-craft/`):**
```
.ai-craft/
├── AI-CRAFT.md              # Core instructions (replaces CLAUDE.md)
├── ai-craft.yaml            # Multi-provider configuration
├── ai-craft-config.json     # Generic settings (optional)
├── providers/               # Provider-specific configs
│   ├── vibe.yaml
│   ├── codex.yaml
│   ├── opencode.yaml
│   ├── claude.yaml
│   └── cursor.yaml
├── agents/                  # Multi-provider agents
│   └── api-designer.md
│   └── symfony-reviewer.md
│   └── ...
├── commands/                # Framework commands
├── skills/                  # Universal skills
├── templates/               # Code generation templates
├── memory/                  # Cross-session memory
├── logs/                    # Log files
└── hooks/                   # Hook scripts
```

**Estructura Legacy (`.claude/`):**
```
.claude/ → .ai-craft/  (symlink for backward compatibility)
```

### Mapeo de Nombres de Modelo

AI Craft ofrece un mapeo automático de nombres de modelo entre proveedores:

| Nombre Genérico | Vibe (Mistral) | Codex (Google) | OpenCode | Claude (Anthropic) |
|--------------|----------------|---------------|----------|-------------------|
| `opus` | `mistral-large-3.5` | `codex-pro` | `llama-3.2-90b` | `opus-4.8` |
| `sonnet` | `mistral-medium-3.5` | `codex-plus` | `llama-3.2-70b` | `sonnet-5` |
| `haiku` | `mistral-small-3.5` | `codex` | `llama-3.2-11b` | `haiku-4.5` |

Esto permite que los comandos existentes de Claude Craft funcionen sin modificación:
```bash
# These work the same across all providers
/workflow:init --model=opus
/team:audit --model=sonnet
```

---

## 🎛️ Configuración Específica de Proveedor

### Vibe (Mistral AI)

**Prerrequisitos:**
- Instala la CLI de Vibe: `curl -sSL https://vibe.mistral.ai | sh`
- Establece la clave API: `export MISTRAL_API_KEY=your_key`

**Configuración:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "vibe"

provider_settings:
  vibe:
    model: "mistral-large-3.5"
    api_endpoint: "https://api.mistral.ai"
```

### Codex (Google)

**Prerrequisitos:**
- Instala la CLI de Codex: `npm install -g @google-cloud/codex-cli`
- Establece la clave API: `export CODEX_API_KEY=your_key`

**Configuración:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "codex"

provider_settings:
  codex:
    model: "codex-pro"
```

### OpenCode (Autoalojado)

**Prerrequisitos:**
- Instala OpenCode: `npm install -g @open-code/cli`
- Ejecuta un servidor LLM (p. ej., `llama-3.2-90b`)
- Establece el endpoint: `export OPENCODE_ENDPOINT=http://localhost:8080`

**Configuración:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "opencode"

provider_settings:
  opencode:
    model: "llama-3.2-90b"
    base_url: "http://localhost:8080"
```

### Claude Code (Anthropic)

**Prerrequisitos:**
- Instala Claude Code: `brew install claude-code` (macOS) o consulta la [documentación](https://code.claude.com)

**Configuración:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "claude"

provider_settings:
  claude:
    model: "sonnet-5"
```

### Cursor (VSCode)

**Prerrequisitos:**
- Instala la extensión Cursor en VSCode

**Configuración:**
```json
// VSCode settings.json
{
  "cursor.rules": [
    {
      "path": ".ai-craft",
      "prompt": ".ai-craft/AI-CRAFT.md"
    }
  ]
}
```

---

## 🚀 Inicio Rápido para Desarrolladores

### Clonar y Configurar

```bash
# Clone the repository
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# Switch to the AI Craft branch
git checkout refactor/ai-craft

# Install dependencies
npm install

# Link the package locally
npm link
```

### Probar la Migración

```bash
# Create a test project
mkdir ~/ai-craft-test
cd ~/ai-craft-test

# Initialize AI Craft
npx @ai-craft/core install . --provider=vibe

# Or test migration from Claude Craft
npx @the-bearded-bear/claude-craft install . --tech=symfony
npx @ai-craft/core migrate .

# Test with different providers
ai-craft --provider=vibe workflow:init
ai-craft --provider=codex workflow:init
ai-craft --provider=claude workflow:init
```

### Ejecutar Tests

```bash
# Run existing tests
npm test

# Run lint
npm run lint

# Check multi-provider functionality
node tests/ai-provider.test.mjs
```

---

## 🐛 Solución de Problemas

### Problemas Comunes

**1. Proveedor no detectado**
```
❌ Error: No AI provider detected
```
**Solución:** 
- Instala la CLI del proveedor (vibe, codex, opencode o claude)
- Establece la variable de entorno correspondiente
- O especifica el proveedor explícitamente: `--provider=vibe`

**2. Symlink no creado**
```
❌ Error: .claude/ directory not found
```
**Solución:**
- La migración debería crear un symlink automáticamente
- Créalo manualmente: `ln -s .ai-craft .claude`
- O usa directamente los comandos `ai-craft`

**3. Comando no encontrado**
```
❌ Error: ai-craft: command not found
```
**Solución:**
- Asegúrate de haber ejecutado npm link: `npm link`
- O usa npx: `npx @ai-craft/core`
- O instala globalmente: `npm install -g .`

**4. Permiso denegado**
```
❌ Error: EACCES: permission denied
```
**Solución:**
- Usa sudo si es necesario: `sudo npm link`
- O corrige los permisos de npm: `npm config set prefix ~/.npm-global`

**5. Errores de configuración**
```
❌ Error: Invalid configuration
```
**Solución:**
- Verifica la sintaxis de `ai-craft.yaml` con un validador YAML
- Compárala con la configuración predeterminada
- Elimínala y regenérala: `rm -rf .ai-craft && npx @ai-craft/core install .`

---

## 📊 Seguimiento del Progreso de Migración

| Tarea | Estado | Responsable | Notas |
|------|--------|-------|-------|
| Arquitectura central | ✅ Hecho | - | Provider manager completo |
| Proveedor Vibe | ✅ Hecho | - | Implementación completa |
| Proveedor Codex | ✅ Hecho | - | Implementación completa |
| Proveedor OpenCode | ✅ Hecho | - | Implementación completa |
| Proveedor Claude | ✅ Hecho | - | Retrocompatible |
| Proveedor Cursor | ✅ Hecho | - | Integración con VSCode |
| Configuración | ✅ Hecho | - | Plantilla ai-craft.yaml |
| AI-CRAFT.md | ✅ Hecho | - | Instrucciones multi-proveedor |
| Retrocompatibilidad | ✅ Hecho | - | Gestión de symlinks |
| Actualización del README | ✅ Hecho | - | Aviso de transición |
| Guía de migración | ✅ Hecho | - | Este documento |
| Integración de la CLI | ⏳ Por Hacer | Dev | Actualizar cli/index.js |
| Actualización del instalador | ⏳ Por Hacer | Dev | Crear la estructura .ai-craft/ |
| Adaptación de Ralph | ⏳ Por Hacer | Dev | Bucle multi-proveedor |
| Adaptación de QA Recette | ⏳ Por Hacer | Dev | Soporte multi-navegador |
| Migración de agentes | ⏳ Por Hacer | Dev | Actualizar 70 agentes |
| Verificación de comandos | ⏳ Por Hacer | QA | Probar 220 comandos |
| Suite de tests | ⏳ Por Hacer | QA | Tests multi-proveedor |
| Documentación | ⏳ Por Hacer | Docs | Actualizar toda la documentación |
| Bundles | ⏳ Por Hacer | Dev | Crear bundles para cada proveedor |
| Actualización CI/CD | ⏳ Por Hacer | DevOps | GitHub Actions |
| Publicación del paquete | ⏳ Por Hacer | DevOps | npm publish |
| Anuncio a la comunidad | ⏳ Por Hacer | Marketing | Anuncio de la release |

---

## 🎯 Hoja de Ruta de Migración hacia AI Craft

### Fase 1: Fundamentos (Semanas 1-2) ✅ **COMPLETO**
- [x] Arquitectura del AI Provider Manager
- [x] Implementación de los proveedores base
- [x] Configuración multi-proveedor
- [x] Capa de compatibilidad con Claude Craft
- [x] Documentación inicial

### Fase 2: Integración de la CLI (Semanas 3-4) ⏳ **EN CURSO**
- [ ] Actualización de cli/index.js para usar el provider manager
- [ ] Actualización del instalador (Dev/scripts/install-*.sh)
- [ ] Integración de Ralph con multi-proveedor
- [ ] Tests de integración básicos

### Fase 3: Adaptación de Herramientas (Semanas 5-6) ⏳ **PRÓXIMAMENTE**
- [ ] Ralph Wiggum multi-proveedor
- [ ] QA Recette multi-navegador + multi-IA
- [ ] Hooks de BMAD multi-proveedor
- [ ] Actualización de las plantillas de hooks

### Fase 4: Migración de Agentes (Semanas 7-8) ⏳ **PRÓXIMAMENTE**
- [ ] Script de migración de agentes
- [ ] Actualización de los 70 agentes existentes
- [ ] Frontmatter multi-proveedor
- [ ] Validación de los agentes

### Fase 5: Tests y Validación (Semanas 9-10) ⏳ **PRÓXIMAMENTE**
- [ ] Suite de tests multi-proveedor
- [ ] Tests de integración end-to-end
- [ ] Validación de la retrocompatibilidad
- [ ] Benchmark de rendimiento

### Fase 6: Release (Semanas 11-12) ⏳ **PRÓXIMAMENTE**
- [ ] Actualización de la documentación
- [ ] Creación de los bundles multi-IDE
- [ ] Actualización del CI/CD
- [ ] Publicación en npm
- [ ] Anuncio a la comunidad

---

## 🤝 Cómo Contribuir

¡Damos la bienvenida a las contribuciones a AI Craft! Así es como puedes ayudar:

### 1. Reportar Incidencias
- Abre una incidencia en GitHub con la etiqueta `ai-craft`
- Incluye detalles sobre:
  - Tu sistema operativo
  - El/los proveedor(es) de IA que estás usando
  - Pasos para reproducir el problema
  - Comportamiento esperado vs. actual

### 2. Corregir Bugs
- Haz un fork del repositorio
- Crea una rama: `git checkout -b fix/your-issue`
- Realiza tus cambios
- Añade tests para la corrección
- Envía un Pull Request

### 3. Añadir Funcionalidades
- Discute la funcionalidad primero en GitHub Discussions
- Crea una rama: `git checkout -b feat/your-feature`
- Implementa la funcionalidad
- Añade tests y documentación
- Envía un Pull Request

### 4. Mejorar la Documentación
- Actualiza la documentación existente
- Añade ejemplos
- Mejora las traducciones (en, fr, es, de, pt)

### 5. Probar Nuevos Proveedores
- Prueba AI Craft con diferentes proveedores de IA
- Reporta problemas de compatibilidad
- Ayuda a mejorar las implementaciones de proveedores

---

## 📞 Soporte

### Comunidad
- **GitHub Discussions:** [TheBeardedBearSAS/ai-craft/discussions](https://github.com/TheBeardedBearSAS/ai-craft/discussions)
- **Discord:** [Únete a nuestro servidor de Discord](https://discord.gg/...) (enlace por actualizar)
- **Twitter/X:** [@TheBeardedCTO](https://twitter.com/TheBeardedCTO)

### Documentación
- **Documentación Principal:** [ai-craft.the-bearded-bear.com](https://ai-craft.the-bearded-bear.com) (próximamente)
- **Wiki de GitHub:** [TheBeardedBearSAS/ai-craft/wiki](https://github.com/TheBeardedBearSAS/ai-craft/wiki)

### Soporte Comercial
Para soporte empresarial, desarrollo a medida o formación:
- **Email:** support@the-bearded-bear.com
- **Sitio web:** [https://the-bearded-bear.com](https://the-bearded-bear.com)

---

## 📜 Licencia

AI Craft es **100% de código abierto** bajo la [Licencia MIT](LICENSE).

Esto significa que puedes:
- ✅ Usarlo gratis (uso personal y comercial)
- ✅ Modificar el código fuente
- ✅ Distribuir versiones modificadas
- ✅ Usarlo en software propietario

No puedes:
- ❌ Usar las marcas registradas sin permiso
- ❌ Hacernos responsables de ningún problema

---

## 🙏 Agradecimientos

AI Craft se construye sobre la base de **Claude Craft**, creado y mantenido por [The Bearded CTO](https://the-bearded-bear.com) con contribuciones de la comunidad de código abierto.

Un agradecimiento especial a:
- **Anthropic** por crear Claude Code
- **Mistral AI** por Vibe y sus contribuciones de código abierto
- **Google** por Codex y su investigación en IA
- **Todos los colaboradores** que han ayudado a dar forma a este framework

---

**AI Craft - El Framework de Desarrollo Multi-IA**  
*Antes Claude Craft - ¡Ahora Independiente del Proveedor!*  
*Construido con ❤️ por la Comunidad de AI Craft*
