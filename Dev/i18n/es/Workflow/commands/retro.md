---
description: Facilitación de la Retrospectiva
argument-hint: [argumentos]
---

# Facilitación de la Retrospectiva

Eres un Scrum Master experimentado. Debes facilitar una retrospectiva productiva usando diferentes formatos y generando acciones concretas.

## Argumentos
$ARGUMENTS

Argumentos:
- Número de sprint
- (Opcional) Formato de retro (starfish, 4L, sailboat, start-stop-continue)

Ejemplo: `/workflow:retro 5 starfish`

## MISIÓN

### Directiva Fundamental (Recordatorio Obligatorio)

> "Independientemente de lo que descubramos, entendemos y creemos sinceramente
> que todos hicieron su mejor esfuerzo, dado lo que sabían
> en ese momento, sus habilidades y capacidades, los recursos disponibles,
> y la situación."
> — Norman Kerth

### Paso 1: Elegir el Formato

#### Formato: Estrella de Mar ⭐

```
══════════════════════════════════════════════════════════════
⭐ RETROSPECTIVA ESTRELLA DE MAR - Sprint {N}
══════════════════════════════════════════════════════════════

              🟢 Continuar
                   │
    ⬆️ Más de ─────┼──── 🟡 Iniciar
                   │
    ⬇️ Menos de ───┴──── 🔴 Detener

──────────────────────────────────────────────────────────────
🟢 CONTINUAR (lo que funciona bien)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
🟡 INICIAR (nuevas ideas a probar)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
🔴 DETENER (lo que no funciona)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
⬆️ MÁS DE (intensificar lo que funciona)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
⬇️ MENOS DE (reducir sin detener)
──────────────────────────────────────────────────────────────
-
-
-
```

#### Formato: 4L (Liked, Learned, Lacked, Longed for)

```
══════════════════════════════════════════════════════════════
💡 RETROSPECTIVA 4L - Sprint {N}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
❤️ ME GUSTÓ (Lo que me gustó)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
📚 APRENDÍ (Lo que aprendí)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
❌ FALTÓ (Lo que faltó)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
🌟 DESEÉ (Lo que deseé tener)
──────────────────────────────────────────────────────────────
-
-
```

#### Formato: Velero ⛵

```
══════════════════════════════════════════════════════════════
⛵ RETROSPECTIVA VELERO - Sprint {N}
══════════════════════════════════════════════════════════════

                    🏝️ Isla (Objetivo)
                         │
    💨 Viento ───────────┼───────────── ⚓ Ancla
    (Lo que nos          │              (Lo que nos
     impulsa)            │               frena)
                        │
                   🪨 Arrecifes
              (Riesgos a evitar)

──────────────────────────────────────────────────────────────
🏝️ ISLA - Nuestro destino (objetivos del próximo sprint)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
💨 VIENTO - Lo que nos impulsa hacia el objetivo
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
⚓ ANCLA - Lo que nos frena
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
🪨 ARRECIFES - Riesgos a evitar
──────────────────────────────────────────────────────────────
-
-
```

### Paso 2: Agenda de la Retrospectiva

```
══════════════════════════════════════════════════════════════
📅 AGENDA DE LA RETROSPECTIVA
══════════════════════════════════════════════════════════════

Duración total: 1h30

00:00 - 00:05 | Check-in
               - Recordatorio de la directiva fundamental
               - "¿Cómo llegas?" (emoji/palabra)

00:05 - 00:10 | Resumen del Sprint
               - Objetivo del Sprint
               - Métricas clave
               - Eventos destacados

00:10 - 00:30 | Recolección Individual
               - Todos escriben sus observaciones
               - En silencio, con post-its (físicos o virtuales)

00:30 - 00:50 | Compartir y Agrupar
               - Turno de mesa
               - Agrupación por temas
               - Aclaración (sin debate)

00:50 - 01:10 | Priorización y Discusión
               - Votación (dot voting)
               - Discusión sobre el top 3
               - Análisis de causa raíz si es necesario

01:10 - 01:25 | Acciones
               - Definir 1-3 acciones SMART
               - Asignar responsable
               - Definir Definition of Done

01:25 - 01:30 | Check-out
               - "¿Qué te llevas de esta retro?"
               - ROTI (Return On Time Invested)
```

### Paso 3: Generar Acciones

```
══════════════════════════════════════════════════════════════
🎯 ACCIONES SPRINT {N+1}
══════════════════════════════════════════════════════════════

## Acción 1: {Título}

| Atributo | Valor |
|----------|-------|
| Descripción | {Descripción clara} |
| Responsable | @miembro |
| Plazo | {Fecha o "Sprint N+1"} |
| DoD | {Criterio de éxito medible} |
| Prioridad | Alta / Media / Baja |

## Acción 2: {Título}

| Atributo | Valor |
|----------|-------|
| Descripción | {Descripción clara} |
| Responsable | @miembro |
| Plazo | {Fecha o "Sprint N+1"} |
| DoD | {Criterio de éxito medible} |
| Prioridad | Alta / Media / Baja |

## Seguimiento de Acciones Anteriores

| Sprint | Acción | Responsable | Estado |
|--------|--------|-------------|--------|
| S-2 | {Acción 1} | @miembro | ✅ Hecho |
| S-1 | {Acción 2} | @miembro | ⚠️ En progreso |
| S-1 | {Acción 3} | @miembro | ❌ No hecho |

──────────────────────────────────────────────────────────────
📊 ROTI (Return On Time Invested)
──────────────────────────────────────────────────────────────

1 = Pérdida de tiempo
5 = Excelente retorno de la inversión

| Miembro | Puntuación | Comentario |
|---------|------------|------------|
| Dev 1   | 4          | {opcional} |
| Dev 2   | 5          |            |
| Dev 3   | 3          | "Un poco largo" |

Media: 4.0/5
```

### Paso 4: Plantilla sprint-retro.md

```markdown
# Retrospectiva - Sprint {N}

## Información

| Atributo | Valor |
|----------|-------|
| Fecha | {YYYY-MM-DD} |
| Formato | Estrella de Mar / 4L / Velero |
| Facilitador | {Nombre} |
| Participantes | {Número} |

## Directiva Fundamental

> "Independientemente de lo que descubramos, entendemos y creemos sinceramente
> que todos hicieron su mejor esfuerzo..."

## Check-in

| Miembro | Estado de ánimo |
|---------|-----------------|
| @dev1 | 😊 |
| @dev2 | 😐 |

## Observaciones

[Pegar el formato elegido con las observaciones recolectadas]

## Temas Identificados

### Tema 1: {Comunicación}
Votos: ●●●●●
- Observación 1
- Observación 2

### Tema 2: {Proceso}
Votos: ●●●
- Observación 1

## Discusión

### Análisis del Tema 1

**Problema**: {Descripción}

**5 Por qués**:
1. ¿Por qué? → {Respuesta}
2. ¿Por qué? → {Respuesta}
3. ¿Por qué? → {Causa raíz}

**Solución Propuesta**: {Solución}

## Acciones

### Acción 1: {Mejorar comunicación}
- **Responsable**: @dev1
- **Plazo**: Sprint {N+1}
- **DoD**: Daily máximo 15 min, parking lot utilizado
- **Estado**: 🔵 Por hacer

## Check-out

Media ROTI: {X}/5

Verbatims:
- "{Lo que me llevo...}"
- "{Lo que me llevo...}"
```

## Herramientas Recomendadas

### Virtuales
- Miro / FigJam (tableros visuales)
- Retrium (retros dedicadas)
- EasyRetro
- Metro Retro

### Formatos Alternativos
- Bien/Mal/Ideas
- Lo que fue bien / Lo que no fue bien / Ideas
- Coche de carreras (motor, paracaídas, abismo)
- Globo aerostático

## Siguiente Paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Si quedan más sprints:                                  ║
║  → /workflow:start {N+1}                                 ║
║    Iniciar el siguiente sprint                           ║
║                                                          ║
║  Si el proyecto está completo:                           ║
║  → /common:release-checklist                             ║
║    Preparar el lanzamiento                               ║
║  → /common:generate-changelog                            ║
║    Generar el changelog                                  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
