---
description: Orquestador de sprint de extremo a extremo (inicio -> descomposición -> validación -> implementación -> PR -> CI -> revisión -> retro -> merge)
argument-hint: "<N> [--from-prd] [--auto-merge] [--max-fix-attempts=2] [--max-workers=3] [--base=main] [--dry-run] [--overnight] [--engine=subagents|teams]"
---

# Auto Sprint — Orquestador de Sprint de Extremo a Extremo

Actúas como **Product Owner / Scrum Master** y conduces un sprint completo desde el arranque hasta el merge
en un **único comando**. Cada ceremonia se ejecuta dentro de un **sub-agente aislado**: la ventana de
contexto propia del sub-agente reemplaza el `/clear` manual entre pasos, de modo que el contexto del
orquestador se mantiene liviano. La fase de implementación la ejecutas **tú como conductor** (misma lógica
que `/team:delivery --phase=implementation`) para evitar el anidamiento de Agent Teams.

Esto automatiza lo que antes eran seis comandos manuales con un `/clear` de por medio:

```
/workflow:start N -> /workflow:start N --tasks-only -> /gate:check sprint 00N
-> /workflow:implement N -> /workflow:review N -> /workflow:retro N
```

…y añade: rama, commit, Pull Request, vigilancia de CI y merge.

## Argumentos

$ARGUMENTS

- `<N>` : Número de sprint (p. ej. `5`). **Obligatorio.**
- `--from-prd` : Antes de la Fase 1, ejecuta `/workflow:plan --only=backlog` (sub-agente) para generar el backlog a partir de `project-management/prd.md` y luego continúa con el pipeline normal.
- `--auto-merge` : Realiza el merge automáticamente una vez que la CI esté en verde y el DoD se haya aprobado. **Por defecto: DESACTIVADO** — el
  comando hace una pausa y espera una confirmación humana explícita antes de hacer el merge (respeta la "revisión obligatoria",
  regla 09, y el principio Karpathy de "no auto-merge sin revisión humana").
- `--max-fix-attempts=2` : Máximo de reintentos de corrección automática por gate fallido antes de abortar (por defecto: 2).
- `--max-workers=3` : Máximo de workers de desarrollo en paralelo durante la fase de implementación (por defecto: 2, máximo: 3).
- `--engine=subagents`: Motor de la fase de implementación (por defecto: `subagents`, delegación mediante la herramienta `Agent`). `teams`: Agent Teams experimental, con repliegue a `subagents` si no está disponible. Ver `/team:delivery --phase=implementation`, sección «Motor de ejecución»
- `--base=main` : Rama base para la PR (por defecto: `main`).
- `--dry-run` : Muestra las 9 fases planificadas y el contexto de sprint resuelto, luego se detiene. **Sin escrituras.**
- `--overnight` : Se pasa directamente a la fase de implementación (acotada, se detiene a las 6 a.m.).

## Requisitos previos

- Claude Code v2.1.32+ con soporte de Agent Teams — solo con `--engine=teams`
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` configurado — solo con `--engine=teams`
- CLI `gh` autenticada (creación de PR / checks / merge)
- Docker disponible (todos los tests se ejecutan vía Docker — ver CLAUDE.md del proyecto)
- Proyecto BMAD v6: `/workflow:start` (fase 1) crea `.bmad/sprint-status.yaml` si no existe

> Si falta algún requisito previo, abortar de inmediato con un mensaje claro y accionable. No omitir ninguna fase en silencio.

## Normalización del número de sprint

Los comandos encadenados difieren en el formato esperado. Normalizar **una sola vez** en la Fase 0 y pasar
la forma correcta a cada fase:

| Fase | Formato esperado |
|------|-----------------|
| `start`, `review`, `retro` | `N` simple (p. ej. `5`) |
| `start --tasks-only` | `N` simple (p. ej. `5`) |
| `team:sprint` (implementación) | nombre libre de sprint resuelto desde la carpeta / archivo de estado |

Resolver la carpeta del sprint mediante un glob `project-management/sprints/sprint-{N}-*/` y leer
`.bmad/sprint-status.yaml` para obtener el nombre canónico del sprint y la lista de historias.

## Proceso

### Fase 0 — Normalización y rama (en línea)

1. Parsear `<N>` y los flags. Derivar `N`, `00N`, el slug del sprint y el nombre del sprint.
2. Resolver `project-management/sprints/sprint-{N}-*/` y `.bmad/sprint-status.yaml`.
   Si ninguno existe, el sprint es nuevo: la Fase 1 crea ambos (sin abortar).
3. Verificar que el árbol de trabajo esté limpio y que `--base` esté actualizado. **Abortar** si está sucio.
4. Crear / hacer checkout de la rama de feature `feature/sprint-{N}-<slug>` desde `--base`
   (regla 09: `main` siempre desplegable — nunca trabajar directamente sobre la rama base).
5. Si `--dry-run`: mostrar el contexto resuelto + las 9 fases planificadas y **detenerse aquí**.

### Fase 0b — Backlog desde el PRD (sub-agente, solo con `--from-prd`)

> "Lee `.claude/commands/workflow/plan.md` y ejecuta `/workflow:plan --only=backlog` (entrada: `project-management/prd.md`). Devuelve un resumen conciso y los archivos creados."

### Fase 1 — Inicio (sub-agente)

Lanzar un sub-agente aislado:

> "Lee `.claude/commands/workflow/start.md` y ejecútalo para el sprint **N**.
> Crea la estructura de carpetas del sprint, `sprint-goal.md` y el checklist previo al sprint.
> Devuelve un resumen breve (< 50 tokens) y la lista de archivos creados."

### Fase 2 — Descomposición (sub-agente)

> "Lee `.claude/commands/workflow/start.md` (`/workflow:start {N} --tasks-only`) y ejecútalo para el sprint **N**.
> Genera los archivos `tasks/TASK-*.md`, `board.md` y el grafo de dependencias.
> Devuelve un resumen breve y los archivos creados."

### Fase 3 — Validación de gate (sub-agente + bucle de corrección automática)

> "Lee `.claude/commands/gate/check.md` (gate `sprint`) y ejecútalo para el sprint **00N**.
> Devuelve PASS/FAIL, la puntuación y la lista de criterios fallidos."

**En caso de FAIL → bucle de corrección automática** (hasta `--max-fix-attempts`):
- Lanzar un sub-agente de remediación que corrija los gaps reportados (historias no en `ready-for-dev`,
  estimaciones faltantes, dependencias no resueltas) directamente en los archivos del sprint.
- Volver a ejecutar el sub-agente de validación.
- Si sigue fallando tras `--max-fix-attempts` → **abortar** con el informe de remediación.

### Fase 4 — Implementación (tú = conductor)

> Equivalente a `/workflow:implement --parallel N` (que delega en `/team:delivery --phase=implementation`).

Asumir directamente el **rol de Lead de la fase de implementación de `/team:delivery --phase=implementation`** (**no** lanzar un Agent Team anidado):

**Motor**: con `--engine=subagents` (por defecto), en el paso 4 lanzar un subagente por story mediante la herramienta `Agent` (`isolation: "worktree"`, todos en un mismo mensaje) en lugar de `TaskCreate`, y en el paso 5 esperar su retorno en lugar de consultar `TaskList` (correspondencia completa en `/team:delivery --phase=implementation`, sección «Motor de ejecución»). Con `--engine=teams`, seguir los pasos tal como están escritos.

1. Leer `.bmad/sprint-status.yaml`; filtrar historias en estado `ready-for-dev`.
2. Analizar la independencia de dominio de archivos (marcar solapamientos de `**/Shared/**`, `**/Common/**`, `**/Utils/**`,
   `**/Helpers/**` → secuenciar en el mismo worker).
3. Estimar el coste mediante `Tools/AgentTeams/lib/cost-estimator.sh` (respetar el bloqueo de modo Fast
   y `--max-cost` si está presente).
4. `TaskCreate` con un worker de desarrollo por historia independiente (máximo `--max-workers`), contexto mínimo
   (solo `@.claude/references/<project-tech>/CLAUDE.md`). Los workers siguen el ciclo TDD Rojo/Verde/Refactorizar
   con comandos de test vía **Docker**.
5. Sondear `TaskList` cada 30s (ralentizar a 60s tras 3 sondeos sin actividad). Actualizar `TaskList`
   cada 5 completaciones de workers (mitigación de compactación de contexto). Limitar los mensajes de
   completación de workers a < 50 tokens.
6. Validar el **DoD** por historia; hacer la transición `in-progress -> review` en `sprint-status.yaml`
   mediante el patrón de escritor único.

**En caso de fallo de DoD en una historia → bucle de corrección automática** (mismo presupuesto de reintentos): re-asignar la historia al worker con los checks fallidos; tras `--max-fix-attempts`, marcar la historia como `blocked` y continuar.

### Fase 5 — Commit y PR (en línea)

1. Hacer commit de la implementación con **Conventional Commits** (atómico por historia cuando sea posible).
2. Hacer push de la rama de feature.
3. Abrir una PR en modo **borrador** contra `--base` mediante `gh pr create` (título + cuerpo que resuma el
   objetivo del sprint, las historias entregadas y el estado del DoD).

### Fase 6 — Vigilancia de CI (en línea + bucle de corrección automática)

1. Vigilar la CI: `gh pr checks --watch` (sondeo cada ~30s).
2. **En rojo → bucle de corrección automática** (hasta `--max-fix-attempts`): leer los logs del job fallido
   (`gh run view --log-failed`), lanzar un sub-agente de corrección, hacer commit + push, y volver a vigilar.
3. Tras `--max-fix-attempts` todavía en rojo → **abortar** con el informe del check fallido.

### Fase 7 — Revisión (sub-agente)

> "Lee `.claude/commands/workflow/review.md` y ejecútalo para el sprint **N** (usa
> `git log` / `gh pr` para recopilar los datos del sprint). Produce `sprint-review.md`. Devuelve un resumen breve."

### Fase 8 — Retrospectiva (sub-agente)

> "Lee `.claude/commands/workflow/retro.md` y ejecútalo para el sprint **N**.
> Produce `sprint-retro.md` con puntos de acción SMART. Devuelve un resumen breve."

### Fase 9 — Merge (en línea, con gate)

- **Si `--auto-merge`** Y la CI está en verde Y el DoD ha pasado:
  `gh pr ready` seguido de `gh pr merge --squash --delete-branch`.
- **En caso contrario (por defecto)**: **pausa**. Presentar el resumen final, el enlace a la PR, el estado de la CI y el
  informe del DoD, luego **esperar una confirmación humana explícita** antes de hacer el merge.

> **Los errores de merge se muestran, nunca se ignoran.** Si el merge está bloqueado por protección de rama,
> informar de ello y sugerir `--admin`. Si está bloqueado porque la PR toca `.github/workflows/`
> y el token no tiene el scope `workflow`, informar de ello y sugerir un squash-and-push manual.
> No incorporar quirks específicos del repositorio en este comando genérico.

## Informe final

```
================================================================
AUTO SPRINT — Resumen
================================================================
Sprint        : sprint-<N>-<slug>
Rama          : feature/sprint-<N>-<slug>
Base          : <base>
PR            : <url>  (CI: <verde|roja>)
----------------------------------------------------------------
Fase                  | Estado  | Notas
----------------------|---------|---------------------------------------
0 Normalización       | OK      | <N>/00<N>, rama lista
1 Inicio              | OK      | sprint-goal.md
2 Descomposición      | OK      | N archivos de tareas
3 Validación de gate  | OK      | puntuación X% (Y intentos de corrección)
4 Implementación      | OK      | A/B historias, C bloqueadas
5 Commit + PR         | OK      | <url>
6 Vigilancia CI       | OK      | verde (Z intentos de corrección)
7 Revisión            | OK      | sprint-review.md
8 Retrospectiva       | OK      | sprint-retro.md
9 Merge               | EN PAUSA| esperando confirmación humana   (o MERGEADO)
================================================================
```

## Manejo de errores

| Situación | Comportamiento |
|-----------|---------------|
| Carpeta de sprint / archivo de estado ausente | Abortar en la Fase 0 |
| Árbol de trabajo sucio | Abortar en la Fase 0 |
| Gate de validación falla tras reintentos | Abortar con informe de remediación |
| Fallo de DoD en historia tras reintentos | Marcar `blocked`, continuar, informar al final |
| CI en rojo tras reintentos | Abortar con informe del check fallido |
| Merge bloqueado (protección / scope) | Mostrar el error + flag sugerido, no forzar |
| Agent Teams no disponible con `--engine=teams` | Repliegue a `--engine=subagents` (sin abortar); definir `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` para usar `--engine=teams` |

## Notas

- **Sin Agent Teams anidados**: tú ejecutas el rol de conductor directamente en la Fase 4.
- **El auto-merge es opt-in** e intencionalmente requiere pasar un flag explícito.
- **Docker es obligatorio** para los tests (CLAUDE.md del proyecto).
- El aislamiento de sub-agentes es lo que reemplaza el `/clear` — mantener cada informe de sub-agente breve.
- Para la variante paralela con Agent Teams que además redacta las historias con revisión cruzada, usa `/team:delivery`.
