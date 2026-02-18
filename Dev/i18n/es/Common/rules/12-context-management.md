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

---

## Context compaction

### Funcionamiento

Claude Code compacta automaticamente el contexto cuando se acerca a los limites de la ventana. Los mensajes antiguos se resumen para liberar espacio.

### Hooks de re-inyeccion

Usar el hook `SessionStart` con el matcher `compact` para re-inyectar el contexto critico despues de una compactacion:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "command": "cat .claude/context-essentials.md"
      }
    ]
  }
}
```

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

---

## Seguimiento de tokens

### Umbrales de accion

| Contexto usado | Accion |
|----------------|--------|
| < 30% | Normal, continuar |
| 30-60% | Monitorear, evitar lecturas innecesarias |
| 60-80% | Delegar a sub-agentes, considerar /clear |
| > 80% | Compactacion inminente, guardar contexto critico |

---

## Worktrees paralelos

### Principio

> **"Single biggest productivity unlock"** — Boris Cherny (Anthropic)

Usar `git worktree` para trabajar en multiples ramas simultaneamente con sesiones Claude independientes.

### Setup

```bash
git worktree add ../feature-auth feature/auth
cd ../feature-auth && claude
```

### Patron Writer/Reviewer

```
Terminal 1 (Writer):
  cd ../feature-auth
  claude "Implementar autenticacion JWT"

Terminal 2 (Reviewer):
  cd ../review-auth
  claude "Revisar el codigo de autenticacion"
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
- [ ] Contexto limpio

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

## Recursos

- **Anthropic Best Practices:** [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code/overview)
- **Boris Cherny Workflow:** Worktrees paralelos + bucles de verificacion
- **Claude Code Context Management:** Context compaction, `/clear`, sub-agentes

---

**Ultima actualizacion:** 2026-02
**Version:** 1.0.0
**Autor:** The Bearded CTO
