# ¿Qué camino elegir? Tu workflow en 30 segundos

> **¿Para quién?** Para cualquiera que esté a punto de empezar con Claude Craft y se pregunte «¿qué comandos ejecuto y en qué orden?». Responde dos preguntas, sigue un solo camino.
>
> **Regla general:** una situación = un camino = una secuencia corta de comandos. Nunca necesitas los otros 100+ comandos para empezar.

---

## 1. El árbol de decisión

```
                    ¿Qué haces hoy?
                         │
        ┌──────────────┬─┴────────────┬──────────────────┐
        ▼              ▼              ▼                  ▼
  Un producto      Código           Un bug por       Un sprint planificado
  nuevo desde      existente, aún   corregir         que quieres terminar
  cero             sin backlog                       sin supervisión
        │              │              │                  │
        ▼              ▼              ▼                  ▼
   GREENFIELD      BROWNFIELD      BUGFIX         SPRINT AUTÓNOMO
  /workflow:init  /project:reverse scan  /qa:tdd   /workflow:auto-sprint N
        │              │        (+ Quick Flow)          │
        ▼              ▼              ▼                  ▼
     Sección 2      Sección 3     Sección 4          Sección 5

  ¿Perdido en cualquier momento?  →  /workflow:status   (Sección 6)
```

¿No estás seguro? Hazte estas preguntas:

1. **¿Ya existe código?** No → Greenfield. Sí → pregunta 2.
2. **¿Ya existe un backlog (epics e historias)?** No → Brownfield. Sí → pregunta 3.
3. **¿Es un único bug?** Sí → Bugfix. No → continúa el sprint con `/workflow:start N`, o delégalo al Sprint autónomo.

---

## 2. Greenfield: un producto nuevo

Tienes una idea y un repositorio vacío. Sigue el camino principal, una fase a la vez:

```
/workflow:init  →  /workflow:plan  →  /workflow:design  →  /workflow:start 1
                →  /workflow:implement  →  /workflow:review  →  /workflow:retro
```

| Paso | Comando | Qué obtienes |
|------|---------|--------------|
| 1 | `/workflow:init` | Análisis del proyecto, track recomendado (Quick, Standard o Enterprise) y `.bmad/sprint-status.yaml` |
| 2 | `/workflow:plan` | PRD, personas y backlog generado |
| 3 | `/workflow:design` | Especificación técnica y arquitectura |
| 4 | `/workflow:start 1` | Sprint 1 preparado: historias seleccionadas y listas para desarrollar |
| 5 | `/workflow:implement` | Historias construidas con TDD (Red → Green → Refactor) |
| 6 | `/workflow:review` | Preparación de la revisión del sprint |
| 7 | `/workflow:retro` | Retrospectiva, y vuelta a `/workflow:start 2` |

Para una versión narrada paso a paso, lee el [tutorial del workflow completo](10-complete-workflow.md).

---

## 3. Brownfield: código existente, sin backlog

Heredas (o ya escribiste) una base de código, pero nadie documentó lo que hace. Primero haz ingeniería inversa del producto y luego únete al camino principal:

```
/project:reverse scan  →  /project:reverse prd  →  /project:reverse stories
               →  /project:reverse gaps  →  /workflow:start
```

| Paso | Comando | Qué obtienes |
|------|---------|--------------|
| 1 | `/project:reverse scan` | Inventario de la base de código: stack, estructura, módulos |
| 2 | `/project:reverse prd` | Un PRD reconstruido a partir de lo que el código hace realmente |
| 3 | `/project:reverse stories` | Historias de usuario deducidas de las funcionalidades existentes |
| 4 | `/project:reverse gaps` | Funcionalidades faltantes, pruebas faltantes, deuda técnica |
| 5 | `/workflow:start` | Primer sprint planificado a partir de las brechas; continúa con `/workflow:implement` |

Consulta también la [guía de integración en un proyecto existente](09-setup-existing-project.md).

---

## 4. Bugfix: reproducir primero, corregir después

Un bug no necesita un PRD. Usa el track más ligero y deja que la prueba guíe la corrección:

```
/qa:tdd        ← escribe PRIMERO la prueba que reproduce el bug (debe fallar)
/workflow:init --quick    ← track Quick Flow: solo implementación
```

1. Ejecuta `/qa:tdd` y describe el bug. La prueba que lo reproduce se escribe **antes** de cualquier corrección y debe fallar.
2. Ejecuta `/workflow:init --quick` para forzar el track Quick Flow (sin fases de planificación ni de diseño).
3. Corrige el código hasta que la prueba pase y después refactoriza. La prueba permanece en la suite como protección contra regresiones: un bug corregido nunca debe volver.

Consulta la [guía de corrección de bugs](04-bug-fixing.md) para más detalles.

---

## 5. Sprint autónomo: un comando, del inicio al merge

Cuando el trabajo ya está planificado, deja que Claude Craft dirija todo el sprint:

```
/workflow:auto-sprint N
```

**Requisitos previos**

- Existe un backlog (del camino Greenfield o Brownfield).
- El sprint `N` está planificado.

**Qué hace:** encadena el inicio, el desglose en tareas, la validación, la implementación, la pull request, la CI, la revisión, la retrospectiva y, por último, el merge. La ejecución termina con la **PR, una CI en verde y el merge**. Revisas el resultado en lugar de escribir cada comando.

¿Prefieres control a velocidad? Quédate en el camino principal manual de la Sección 2.

---

## 6. ¿Dónde estoy?

En cualquier momento, sea cual sea el camino:

```
/workflow:status
```

Muestra la fase actual, el avance del sprint y la siguiente acción recomendada.

> **Fuente única de verdad:** `.bmad/sprint-status.yaml` contiene el estado de cada historia (`backlog → ready-for-dev → in-progress → review → done`, o `blocked`). Lo crea `/workflow:init`, y cada comando lo lee y lo actualiza. Si dos vistas no coinciden, este archivo manda.

---

## Resumen rápido

| Situación | Empieza con | Después |
|-----------|-------------|---------|
| Producto nuevo | `/workflow:init` | `/workflow:plan` → `/workflow:design` → `/workflow:start 1` |
| Código existente, sin backlog | `/project:reverse scan` | `/project:reverse prd` → `/project:reverse stories` → `/project:reverse gaps` → `/workflow:start` |
| Bug | `/qa:tdd` | `/workflow:init --quick` |
| Sprint planificado, sin intervención | `/workflow:auto-sprint N` | Revisar la PR |
| Perdido | `/workflow:status` | Seguir la acción recomendada |
