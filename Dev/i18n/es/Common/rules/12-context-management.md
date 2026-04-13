# Gestion del Contexto

## Vision general

La ventana de contexto es **EL recurso critico** en Claude Code. Cada token cuenta. Una gestion eficaz del contexto es la diferencia entre un asistente productivo y uno que pierde el hilo.

> **Fuente:** Recomendacion #1 de Anthropic — "The context window is the single most important resource to manage."

**Principios:**
- El contexto es un recurso finito y valioso
- CLAUDE.md y las reglas compiten por la atencion del modelo
- Usar sub-agentes para las investigaciones
- Limpiar el contexto entre tareas

---

## Tabla de contenidos

1. [Reglas de tamano CLAUDE.md](#reglas-de-tamano-claudemd)
2. [Limpieza del contexto](#limpieza-del-contexto)
3. [Sub-agentes para investigaciones](#sub-agentes-para-investigaciones)
4. [Context compaction](#context-compaction)
5. [Bucles de verificacion](#bucles-de-verificacion)
6. [Plan Mode](#plan-mode)
7. [Seguimiento de tokens](#seguimiento-de-tokens)
8. [Checklist](#checklist)
9. [Compaction hints en CLAUDE.md](#compaction-hints-en-claudemd)
10. [CLAUDE.local.md para preferencias personales](#claudelocalmd-para-preferencias-personales)
11. [Anti-patrones de contexto](#anti-patrones-de-contexto)
12. [Buenas practicas de redaccion CLAUDE.md](#buenas-practicas-de-redaccion-claudemd)
13. [Optimizacion de rendimiento](#optimizacion-de-rendimiento)
14. [Patrones de comunicacion](#patrones-de-comunicacion)
15. [Nuevos comandos de contexto](#nuevos-comandos-de-contexto)
16. [Agent frontmatter](#agent-frontmatter)
17. [Managed settings](#managed-settings)
18. [Monitor y eventos en segundo plano](#monitor-y-eventos-en-segundo-plano)

---

## Reglas de tamano CLAUDE.md

### Limite recomendado

> **CLAUDE.md principal: 150-200 lineas maximo.**
> Cada instruccion adicional diluye la atencion sobre las instrucciones existentes.

### Estrategia de modularidad

```
.claude/
  CLAUDE.md              <- Resumen (150-200 lineas max)
  rules/                 <- Reglas detalladas (cargadas bajo demanda)
    01-workflow-analysis.md
    04-solid-principles.md
    05-kiss-dry-yagni.md
    ...
  references/            <- Documentacion tecnica
  skills/                <- Competencias bajo demanda
```

### Buenas practicas

| Practica | Descripcion |
|----------|-------------|
| **CLAUDE.md corto** | Vision general, enlaces a reglas |
| **Reglas modulares** | Un archivo por tema en `.claude/rules/` |
| **Referencias separadas** | Docs tecnicos en `.claude/references/` |
| **Skills bajo demanda** | Competencias cargadas solo cuando necesarias |

### Que va en CLAUDE.md vs Rules

| Contenido | Ubicacion |
|-----------|-----------|
| Tecnologias soportadas | CLAUDE.md |
| Comandos disponibles | CLAUDE.md |
| Agentes disponibles | CLAUDE.md |
| Compatibilidad Claude Code | CLAUDE.md |
| Principios SOLID detallados | `.claude/rules/04-solid-principles.md` |
| Reglas de seguridad | `.claude/rules/11-security.md` |
| Workflow de analisis | `.claude/rules/01-workflow-analysis.md` |

---

## Limpieza del contexto

### Cuando usar `/clear`

```
Usar /clear:
- Entre dos tareas NO relacionadas
- Despues de una larga investigacion
- Cuando el contexto supera el 50% de la ventana
- Antes de comenzar una nueva feature

NO usar /clear:
- En medio de una tarea en curso
- Si el contexto anterior es necesario
- Justo despues de cargar archivos relevantes
```

### Signos de contaminacion del contexto

- Claude repite informacion ya proporcionada
- Las respuestas se vuelven menos precisas
- Claude confunde elementos de tareas diferentes
- Los errores aumentan a pesar de instrucciones claras

### Patron: Investigacion luego implementacion

```
Sesion 1: Investigacion
  -> Leer codigo, entender la arquitectura
  -> Documentar hallazgos
  -> /clear

Sesion 2: Implementacion
  -> Cargar solo los archivos necesarios
  -> Implementar con un contexto limpio
```

---

## Sub-agentes para investigaciones

### Principio

> **Delegar las busquedas a sub-agentes para mantener el contexto principal limpio.**

Los sub-agentes (herramienta Task) tienen su propia ventana de contexto. Usar un sub-agente para explorar el codebase evita contaminar el contexto principal.

### Cuando usar un sub-agente

| Situacion | Accion |
|-----------|--------|
| Buscar archivo/patron especifico | Glob/Grep directamente |
| Explorar arquitectura desconocida | Sub-agente Explore |
| Investigacion multi-archivo (> 3) | Sub-agente Explore |
| Planificar una implementacion | Sub-agente Plan |
| Tarea independiente en paralelo | Sub-agente general-purpose |

### Ejemplo

```
# En lugar de leer 20 archivos en el contexto principal:

Task(Explore): "Como funciona la autenticacion en este proyecto?
  Lista los archivos, patrones y dependencias."

# El sub-agente explora y devuelve un resumen
# El contexto principal permanece limpio
```

### Agent frontmatter (v2.1.78+)

Los agentes personalizados soportan campos frontmatter para controlar su comportamiento:

```yaml
---
effort: low          # Nivel de esfuerzo (low/medium/high)
maxTurns: 10         # Numero maximo de turnos
disallowedTools:     # Herramientas no permitidas
  - Edit
  - Write
---
```

Estos campos permiten optimizar los costos y el alcance de los sub-agentes.

---

## Context compaction

### Funcionamiento

Claude Code compacta automaticamente el contexto cuando se acerca a los limites de la ventana. Los mensajes antiguos se resumen para liberar espacio.

### Compactacion proactiva

A partir del 70% de contexto usado, ejecutar `/compact` proactivamente para evitar una compactacion automatica no controlada.

El comando `/memory` (v2.1.59+) permite guardar aprendizajes persistentes de sesion que sobreviven a las compactaciones y nuevas sesiones.

### Hook PreCompact

Usar el hook `PreCompact` para guardar el contexto critico antes de una compactacion:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

### Hook PostCompact

Usar el hook `PostCompact` (v2.1.76+) para re-inyectar el contexto critico despues de una compactacion:

```json
{
  "hooks": {
    "PostCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

A partir de v2.1.105, el hook `PreCompact` puede **bloquear** la compactacion mediante el codigo de salida 2, permitiendo controlar cuando ocurre la compactacion.

### Hooks de re-inyeccion

Usar el hook `SessionStart` con el matcher `compact` para re-inyectar el contexto critico despues de una compactacion:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

### Preparar el contexto esencial

Crear un archivo `.claude/context-essentials.md` con:
- Decisiones arquitecturales clave
- Convenciones del proyecto
- Tareas en curso
- Restricciones criticas

---

## Bucles de verificacion

### Principio

> **Siempre proporcionar medios de verificacion: tests, screenshots, outputs esperados.**
> Fuente: "2-3x improvement in final result quality" (Anthropic)

### Patron: Especificacion-Implementacion-Verificacion

```
1. ESPECIFICACION
   -> Definir el comportamiento esperado
   -> Proporcionar ejemplos de input/output
   -> Escribir tests primero (TDD)

2. IMPLEMENTACION
   -> Codificar la solucion

3. VERIFICACION
   -> Ejecutar tests
   -> Comparar con outputs esperados
   -> Corregir si es necesario
   -> Repetir hasta satisfaccion
```

### Ejemplos de bucles eficaces

```
Bucle TDD:
  test (RED) -> codigo (GREEN) -> refactor -> test (GREEN)

Bucle UI:
  screenshot antes -> modificacion -> screenshot despues -> comparar

Bucle API:
  spec OpenAPI -> implementacion -> test curl -> comparar respuesta

Bucle CI:
  modificar codigo -> ejecutar tests -> corregir fallos -> re-ejecutar
```

### Anti-patrones

```
NO HACER:
- Implementar sin tests
- Suponer que funciona sin verificar
- Ignorar errores de tests
- Pasar a la siguiente tarea sin verificacion
```

---

## Plan Mode

### Cuando invertir en planificacion

| Situacion | Accion |
|-----------|--------|
| Bug simple, 1 archivo | Corregir directamente |
| Feature simple, < 3 archivos | Implementar directamente |
| Feature compleja, > 3 archivos | Plan Mode |
| Refactoring arquitectural | Plan Mode |
| Eleccion tecnologica | Plan Mode |
| Impacto incierto | Plan Mode |

### Ventajas del Plan Mode

- Explorar el codebase antes de actuar
- Identificar archivos impactados
- Proponer un enfoque antes de implementar
- Evitar retrabajo

---

## Seguimiento de tokens

### Linea de estado

La linea de estado de Claude Code muestra el porcentaje de contexto utilizado. Monitorear este indicador para anticipar compactaciones.

### Umbrales de accion

| Contexto usado | Accion |
|----------------|--------|
| < 30% | Normal, continuar |
| 30-60% | Monitorear, evitar lecturas innecesarias |
| 60-80% | Delegar a sub-agentes, considerar /clear |
| > 80% | Compactacion inminente, guardar contexto critico |

### Comando /context (v2.1.74+)

El comando `/context` proporciona sugerencias accionables para optimizar el uso del contexto. Usar regularmente para identificar fuentes de desperdicio.

### Comando /effort (v2.1.72+)

Ajustar el nivel de esfuerzo del modelo segun la complejidad de la tarea:

| Comando | Esfuerzo | Uso |
|---------|----------|-----|
| `/effort low` | Minimo | Tareas simples, lookups |
| `/effort medium` | Estandar | Implementacion rutinaria |
| `/effort high` | Maximo | Razonamiento complejo, arquitectura |

### Alerta de inactividad (v2.1.84+)

Despues de 75+ minutos de inactividad, Claude sugiere automaticamente `/clear` para evitar un contexto obsoleto.

### Estrategia multi-sesion

Para tareas complejas, dividir el trabajo en sesiones cortas y enfocadas. Cada sesion usa un contexto fresco, reduciendo el consumo de tokens en aproximadamente un 55%:

```
Sesion 1: Investigacion (leer, analizar, documentar)
  -> /memory para guardar conclusiones
  -> /clear

Sesion 2: Implementacion (codificar, testear)
  -> El /memory anterior se carga automaticamente
  -> Contexto fresco, sin contaminacion
```

### Tareas planificadas /loop (v2.1.71+)

El comando `/loop` permite planificar tareas recurrentes:

```bash
/loop 5m /common:pre-commit-check    # Verificar cada 5 minutos
/loop "Monitorear tests CI"           # Auto-cadencia por el modelo
```

Alias: `/proactive` (v2.1.105+).

---

## Worktrees paralelos

### Principio

> **"Single biggest productivity unlock"** — Boris Cherny (Anthropic)

Usar `git worktree` para trabajar en multiples ramas simultaneamente con sesiones Claude independientes.

### Setup

Desde v2.1.53+, Claude Code soporta el flag nativo `--worktree` (`-w`) para crear y trabajar en worktrees aislados:

```bash
# Flag nativo (v2.1.53+) — crea un worktree aislado automaticamente
claude --worktree "Implementar autenticacion JWT"
claude -w "Revisar el codigo de autenticacion"

# Metodo manual (todas las versiones)
git worktree add ../feature-auth feature/auth
cd ../feature-auth && claude

git worktree add ../review-auth feature/auth
cd ../review-auth && claude
```

### Patron Writer/Reviewer

```
Terminal 1 (Writer):
  cd ../feature-auth
  claude "Implementar autenticacion JWT"

Terminal 2 (Reviewer):
  cd ../review-auth
  claude "Revisar el codigo de autenticacion"
  # Contexto fresco, sin sesgo de autor
```

### Limpieza

```bash
git worktree remove ../feature-auth
git worktree remove ../review-auth
```

### Recomendaciones

- 3-5 worktrees maximo
- Un worktree = una tarea
- Eliminar worktrees completados
- No compartir sesiones entre worktrees

---

## Checklist

### Antes de cada sesion

- [ ] CLAUDE.md < 200 lineas
- [ ] Reglas modulares en `.claude/rules/`
- [ ] Contexto limpio (sin residuos de tareas anteriores)

### Durante la sesion

- [ ] Monitorear % de contexto
- [ ] Delegar investigaciones a sub-agentes
- [ ] `/clear` entre tareas no relacionadas
- [ ] Proporcionar tests/outputs esperados

### Para tareas complejas

- [ ] Usar Plan Mode
- [ ] Descomponer en sub-tareas
- [ ] Worktrees para paralelismo
- [ ] Bucles de verificacion

---

## Compaction hints en CLAUDE.md

### Principio

> **Indicar a Claude que debe preservar durante una compactacion.**

Agregar instrucciones de compactacion en CLAUDE.md para guiar el resumen durante la compactacion automatica:

```markdown
# En CLAUDE.md:
Durante la compactacion, siempre preservar:
- La lista de archivos modificados
- Los comandos de test
- Las decisiones de arquitectura
```

### Variables de entorno utiles

| Variable | Descripcion |
|----------|-------------|
| `CLAUDE_CODE_SUBAGENT_MODEL` | Modelo para sub-agentes (ej: `sonnet` para optimizar costos) |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Poner a `1` para desactivar la memoria automatica |

---

## CLAUDE.local.md para preferencias personales

### Principio

Crear un archivo `CLAUDE.local.md` en la raiz del proyecto (gitignore) para preferencias personales que no deben compartirse con el equipo.

```
proyecto/
  .claude/CLAUDE.md      <- Compartido (git)
  CLAUDE.local.md        <- Personal (gitignore)
```

### Contenido tipico

- Preferencias de estilo personal
- Rutas locales especificas
- Herramientas personales preferidas

### Configuracion

Agregar en `.gitignore`:
```
CLAUDE.local.md
```

---

## Anti-patrones de contexto

| Anti-patron | Descripcion | Solucion |
|-------------|-------------|----------|
| **Kitchen-sink session** | Hacer todo en una sola sesion | `/clear` entre tareas, sub-agentes |
| **CLAUDE.md sobrecargado** | > 200 lineas diluye la atencion | Modularizar en `.claude/rules/` |
| **Sobre-correccion** | Correcciones sucesivas contaminan el contexto | Despues de 2 fallos, `/clear` y reformular |
| **Trust-then-verify gap** | Implementar sin verificar | Bucles TDD, tests antes del codigo |
| **Exploracion infinita** | Leer demasiados archivos sin objetivo | Definir el alcance antes de explorar |

---

## Buenas practicas de redaccion CLAUDE.md

### Preferir punteros sobre copias

No copiar codigo en CLAUDE.md — se vuelve obsoleto. Usar la sintaxis `@ruta` para referenciar archivos:

```markdown
# En CLAUDE.md:
Ver @.claude/references/symfony/CLAUDE.md para las convenciones Symfony.
Ver @docs/API.md para la documentacion API.
```

### Enfasis para reglas criticas

Usar `IMPORTANT`, `DEBE`, `NUNCA` para restricciones no negociables:

```markdown
IMPORTANT: Nunca modificar las migraciones existentes.
DEBE ejecutar los tests antes de cada commit.
NUNCA secrets en el codigo fuente.
```

### Jerarquia de archivos CLAUDE.md

| Archivo | Alcance | Uso |
|---------|---------|-----|
| `~/.claude/CLAUDE.md` | Global (todos los proyectos) | Preferencias personales universales |
| `.claude/CLAUDE.md` o `./CLAUDE.md` | Proyecto (git) | Convenciones del equipo |
| `CLAUDE.local.md` | Proyecto (gitignore) | Preferencias personales del proyecto |

### Mantenimiento regular

- Revisar CLAUDE.md cada trimestre
- Para cada linea, preguntarse: "Si elimino esta linea, Claude cometera errores?"
- Si no, eliminar la linea
- Tratar CLAUDE.md como codigo de produccion

---

## Optimizacion de rendimiento

### CLI nativos en lugar de MCPs

Preferir herramientas CLI nativas (Glob, Grep, Read, Edit) sobre equivalentes MCP. Los servidores MCP agregan definiciones de herramientas persistentes en cada turno, consumiendo contexto permanentemente.

| Enfoque | Costo de contexto |
|---------|-------------------|
| Herramienta nativa (Glob, Grep) | 0 tokens adicionales |
| Servidor MCP | ~500-2000 tokens/herramienta/turno |
| CLI externo (gh, aws) | Puntual, via Bash |

### MCP Tool Search (v2.1.80+)

`ToolSearch` permite la carga diferida (lazy loading) de herramientas MCP, reduciendo el consumo de contexto en un **95%**:

| Enfoque | Costo de contexto |
|---------|-------------------|
| MCP clasico (todas las herramientas cargadas) | ~500-2000 tokens/herramienta/turno |
| MCP con Tool Search (lazy loading) | ~50 tokens en total |

Usar `ToolSearch` con `query: "select:tool_name"` para cargar una herramienta bajo demanda.

### Flag --bare (v2.1.81+)

Para llamadas con scripts usando `-p`, usar `--bare` para omitir hooks, LSP y sincronizacion de plugins:

```bash
claude --bare -p "Analizar este archivo" < input.txt
```

Reduccion significativa del tiempo de arranque para automatizacion.

### Monitor tool (v2.1.98+)

La herramienta `Monitor` permite hacer streaming de eventos de un proceso en segundo plano. Cada linea stdout es una notificacion. Usar en lugar de `sleep` + poll para esperar la finalizacion de un proceso.

### Cambio de modelo en sesion

Usar `/model` para cambiar de modelo segun la complejidad de la tarea:

| Comando | Modelo | Uso |
|---------|--------|-----|
| `/model haiku` | Haiku 4.5 | Tareas simples, clasificacion |
| `/model sonnet` | Sonnet 4.6 | Tareas estandar, implementacion |
| `/model opus` | Opus 4.6 | Razonamiento complejo, arquitectura |

### Filtrado de salida via hooks PostToolUse

Usar hooks PostToolUse para filtrar salidas verbosas antes de que Claude las procese:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "command": "echo '$TOOL_OUTPUT' | grep -A 5 -E '(FAIL|ERROR|WARN)' || echo 'All clear'"
    }]
  }
}
```

Reduccion potencial: 90%+ para logs verbosos.

### Plugins Code Intelligence

Para lenguajes tipados, una sola llamada `go-to-definition` reemplaza multiples grep + lecturas de archivos:

- PHP: `php-lsp` (Intelephense)
- TypeScript: `typescript-lsp` (vtsls)
- Python: `pyright-lsp`
- Dart: `dart-analyzer`
- C#: `csharp-lsp`

---

## Patrones de comunicacion

### Patron Entrevista

Para features complejas, pedir a Claude que lo entreviste antes de codificar:

```
"Quiero implementar [descripcion]. Entrevistame en detalle.
Haz preguntas sobre la implementacion tecnica, casos limite,
restricciones y compromisos. Continua hasta tener una vision
completa, luego escribe la especificacion en SPEC.md."
```

Resultado: especificacion completa antes de la implementacion, contexto limpio.

### Estructura CIF (Context, Intent, Format)

Estructurar los prompts para maximizar la precision:

| Elemento | Descripcion | Ejemplo |
|----------|-------------|---------|
| **Context** | Situacion actual | "En el modulo auth, el token JWT expira despues de 15min" |
| **Intent** | Objetivo preciso | "Agregar refresh token con rotacion" |
| **Format** | Formato de salida esperado | "Generar el servicio + tests unitarios" |

### Patron Writer/Reviewer

Usar dos sesiones para mejor calidad (ver tambien [Worktrees paralelos](#worktrees-paralelos)):

- **Sesion A (Writer):** Implementa la feature
- **Sesion B (Reviewer):** Revisa con contexto fresco (sin sesgo de autor)
- **Sesion A:** Integra el feedback

---

## Managed settings (v2.1.83+)

### Directorio managed-settings.d/

El directorio `managed-settings.d/` permite una configuracion modular por fusion alfabetica:

```
.claude/
  managed-settings.d/
    00-base.json          <- Configuracion base
    10-security.json      <- Reglas de seguridad
    20-team.json          <- Preferencias del equipo
```

Los archivos se fusionan en orden alfabetico, permitiendo a los equipos superponer configuraciones sin conflictos.

---

## Recursos

- **Anthropic Best Practices:** [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code/overview)
- **Boris Cherny Workflow:** Worktrees paralelos + bucles de verificacion
- **Claude Code Context Management:** Context compaction, `/clear`, sub-agentes
- **`/init`:** Genera automaticamente un CLAUDE.md a partir del analisis del proyecto
- **CLAUDE.md Authoring:** [Builder.io Guide](https://www.builder.io/blog/claude-md-guide), [HumanLayer Blog](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- **Cost Optimization:** [Anthropic Costs Docs](https://code.claude.com/docs/en/costs)

---

**Ultima actualizacion:** 2026-04
**Version:** 1.2.0
**Autor:** The Bearded CTO
