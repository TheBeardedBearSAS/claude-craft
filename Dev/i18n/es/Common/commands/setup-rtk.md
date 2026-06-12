---
description: Configurar RTK y la optimización de tokens para Claude Code
argument-hint: [--check]
---

# Configuración de la optimización de tokens

Configurar RTK (Rust Token Killer) y la optimización completa de tokens para las sesiones de Claude Code.

## Pasos

### 1. Verificar la instalación de RTK

```bash
# Verificar si RTK está instalado
if command -v rtk &>/dev/null; then
  echo "RTK instalado: $(rtk --version)"
  echo ""
  rtk gain 2>/dev/null || echo "Aún no hay datos de ahorro"
else
  echo "RTK NO está instalado"
  echo ""
  echo "Opciones de instalación (el patrón curl|bash está BLOQUEADO por los hooks de Claude Craft):"
  echo "  1. (Recomendado) make install-rtk    # desde la raíz de claude-craft"
  echo "  2. cargo install rtk-cli            # si tienes la toolchain de Rust"
  echo "  3. Descargar binario manualmente: https://github.com/rtk-ai/rtk/releases"
fi
```

### 2. Configurar las optimizaciones de RTK

Si RTK está instalado, aplicar estas optimizaciones:

#### a) Activar el modo ultra-compact

Verificar el hook en `~/.claude/hooks/rtk-rewrite.sh`. El comando de reescritura debe usar `--ultra-compact`:

```bash
REWRITTEN=$(rtk rewrite --ultra-compact "$CMD" 2>/dev/null)
```

Si no lo tiene, actualizar el archivo de hook.

#### b) Optimizar los límites de RTK

Verificar `~/.config/rtk/config.toml` y recomendar estos límites:

```toml
[limits]
grep_max_results = 100
grep_max_per_file = 10
status_max_files = 10
status_max_untracked = 5
passthrough_max_chars = 1500
```

#### c) Agregar filtros personalizados

Verificar `~/.config/rtk/filters.toml`. Si solo contiene comentarios de plantilla, sugerir filtros según el stack del proyecto detectado:

- **Proyectos Docker**: Agregar filtros docker exec, compose, logs
- **Proyectos Node.js**: Agregar filtros npm/npx install
- **Proyectos PHP**: Agregar filtros composer
- **Proyectos Python**: Agregar filtros pip install

### 3. Configurar el modelo de sub-agentes y sub-agentes aislados

Verificar si ambas variables de entorno están definidas:

```bash
echo "CLAUDE_CODE_SUBAGENT_MODEL=${CLAUDE_CODE_SUBAGENT_MODEL:-NO DEFINIDO}"
echo "CLAUDE_CODE_FORK_SUBAGENT=${CLAUDE_CODE_FORK_SUBAGENT:-NO DEFINIDO}"
```

Si no están definidas, recomendar agregar en `~/.bashrc` (o `~/.zshrc`):

```bash
# Usar Sonnet 4.6 para sub-agentes (exploración, grep, lectura de archivos) en lugar de Opus
# → 40-60% de reducción de coste en invocaciones de sub-agentes
export CLAUDE_CODE_SUBAGENT_MODEL="sonnet"

# Ejecutar sub-agentes en contextos aislados (Claude Code 2.1.117+, ver COMPATIBILITY.md)
# → Evita contaminar la ventana de contexto principal con el estado intermedio de sub-agentes
# → Se combina con context: fork en skills (~8-15K tokens ahorrados por sesión larga)
export CLAUDE_CODE_FORK_SUBAGENT=1

# Activar TTL de caché de prompts de 1 hora (Claude Code 2.1.108+)
# → -40% de coste en sesiones repetitivas (sprints BMAD, bucles /team:*)
# → La misma clave de caché de prompt se reutiliza hasta 1h en lugar del defecto de 5min
export ENABLE_PROMPT_CACHING_1H=1

# Forzar escrituras de caché de 5 minutos en cada turno (Claude Code 2.1.108+)
# → Útil para bucles de desarrollo cortos que acceden repetidamente al caché
# → Compromiso: pequeña sobrecarga de escritura, grandes ganancias en tasa de aciertos para trabajo iterativo
export FORCE_PROMPT_CACHING_5M=1
```

Después de actualizar, recargar el shell: `source ~/.bashrc`.

### 4. Configurar hooks

Verificar los hooks actuales en settings.json:

| Hook | Propósito | Estado |
|------|-----------|--------|
| **PreToolUse** (Bash) | Reescritura RTK | Verificar si está configurado |
| **PostToolUse** (Bash) | Filtrado de salidas | Verificar si está configurado |
| **PreCompact** | Preservación del contexto | Verificar si está configurado |
| **SessionStart** (compact) | Reinyección del contexto | Verificar si está configurado |

Para hooks ausentes, referenciar los templates en `.claude/templates/hooks/`:
- `output-filter.json` — PostToolUse para filtrado de salidas grandes
- `pre-compact.json` — PreCompact para preservación del contexto
- `context-reinject.json` — SessionStart para reinyección post-compactación
- `post-compact.json` — PostCompact para restauración del contexto tras compactación

#### Hook PostCompact — Restauración del contexto

El hook **PostCompact** (Claude Code v2.1.76+) reinyecta el contexto crítico después de un evento de compactación automática. Sin él, Claude puede perder el hilo de las tareas activas, rutas de archivos y decisiones tomadas antes en la sesión.

Template: `.claude/templates/hooks/post-compact.json`

El hook lee `context-essentials.md` (un archivo que mantienes con el estado de la sesión actual) y lo inyecta como mensaje del sistema después de la compactación. Combinarlo con el hook **PreCompact** (`pre-compact.json`) que guarda los elementos esenciales antes de que ocurra la compactación.

Ahorro estimado: evita 5-15 turnos de re-explicación por sesión larga (~3-8K tokens).

### 5. Resumen

Mostrar una tabla resumen de todas las optimizaciones con su estado:

| Optimización | Ahorro esperado | Estado |
|---|---|---|
| RTK instalado + hooks | 60-90% en salidas CLI | ? |
| RTK ultra-compact | +5-10% adicional | ? |
| RTK límites optimizados | grep 19% -> 40-50% | ? |
| RTK filtros personalizados | +30-50% en docker/npm | ? |
| Modelo sub-agentes (Sonnet) | 40-60% reducción de coste | ? |
| Sub-agentes aislados (`CLAUDE_CODE_FORK_SUBAGENT=1`) | 8-15K tokens/sesión larga | ? |
| Caché prompts 1h (`ENABLE_PROMPT_CACHING_1H=1`) | -40% coste en sesiones repetitivas | ? |
| Forzar escrituras caché 5min (`FORCE_PROMPT_CACHING_5M=1`) | Mayor tasa de aciertos en bucles iterativos | ? |
| Hook PostToolUse | Reduce contaminación del contexto | ? |
| Hook PreCompact | Preserva el contexto crítico | ? |
| Hook PostCompact | Restaura el contexto tras compactación | ? |

**Objetivo: 60-75% de eficiencia global de tokens (con caché 1h + ultra-compact + sub-agentes aislados)**

## Argumentos

- `$ARGUMENTS` — Pasar `--check` para mostrar solo el estado actual sin realizar cambios
