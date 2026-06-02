---
description: 
argument-hint: [argumentos]
---

# Preparación de la Revisión de Sprint

Eres un Scrum Master experimentado. Debes preparar y facilitar la Revisión de Sprint recopilando información sobre el trabajo realizado.

## Argumentos
$ARGUMENTS

Argumentos:
- Número de sprint

Ejemplo: `/workflow:review 5`

## MISIÓN

### Paso 1: Recopilar Datos del Sprint

```bash
# Recuperar commits del sprint
git log --since="YYYY-MM-DD" --until="YYYY-MM-DD" --oneline

# PRs fusionadas
gh pr list --state merged --search "merged:YYYY-MM-DD..YYYY-MM-DD"

# Issues cerradas
gh issue list --state closed --search "closed:YYYY-MM-DD..YYYY-MM-DD"
```

### Paso 2: Analizar el Sprint Backlog

```
══════════════════════════════════════════════════════════════
📋 REVISIÓN DE SPRINT - Sprint {N}
══════════════════════════════════════════════════════════════

Fecha: {YYYY-MM-DD}
Objetivo del Sprint: "{Objetivo}"

──────────────────────────────────────────────────────────────
🎯 LOGRO DEL OBJETIVO DEL SPRINT
──────────────────────────────────────────────────────────────

Objetivo del sprint alcanzado: ✅ SÍ / ❌ NO / ⚠️ PARCIALMENTE

Justificación: {Explicación}

──────────────────────────────────────────────────────────────
✅ HISTORIAS DE USUARIO ENTREGADAS
──────────────────────────────────────────────────────────────

| ID | Título | Puntos | Demo | Estado |
|----|--------|--------|------|--------|
| US-045 | Registro de usuario | 5 | ✅ | ✅ Entregada |
| US-046 | Login con Google OAuth | 8 | ✅ | ✅ Entregada |
| US-047 | Login con GitHub OAuth | 5 | ✅ | ✅ Entregada |
| US-048 | Restablecimiento de contraseña | 3 | ⚠️ | ⚠️ 80% |

**Entregadas: 18/21 puntos (86%)**

──────────────────────────────────────────────────────────────
❌ HISTORIAS DE USUARIO NO TERMINADAS
──────────────────────────────────────────────────────────────

| ID | Título | Puntos | Progreso | Razón |
|----|--------|--------|----------|-------|
| US-048 | Restablecimiento de contraseña | 3 | 80% | API de email no disponible |

Acción: Trasladar al Sprint {N+1}

──────────────────────────────────────────────────────────────
📊 MÉTRICAS
──────────────────────────────────────────────────────────────

| Métrica | Valor | Tendencia |
|---------|-------|-----------|
| Puntos planificados | 21 | - |
| Puntos entregados | 18 | - |
| Velocidad | 18 | ⬆️ (+2 vs S-1) |
| Tasa de finalización | 86% | ⬆️ |
| Bugs descubiertos | 2 | ⬇️ |
| Bugs corregidos | 3 | ⬆️ |

──────────────────────────────────────────────────────────────
🎬 DEMOSTRACIÓN
──────────────────────────────────────────────────────────────

## Orden de demo sugerido

1. **US-045: Registro de usuario** (~5 min)
   - Mostrar el formulario de registro
   - Email de confirmación
   - Activación de cuenta
   - Demo por: @dev1

2. **US-046: Login con Google OAuth** (~5 min)
   - Botón "Iniciar sesión con Google"
   - Flujo OAuth
   - Creación automática de cuenta
   - Demo por: @dev2

3. **US-047: Login con GitHub OAuth** (~3 min)
   - Mismo flujo con GitHub
   - Demo por: @dev1

## Escenario de demo

```gherkin
# Escenario completo para la demo
Dado que estoy en la página de inicio
Cuando hago clic en "Registrarse"
Y relleno el formulario
Entonces recibo un email de confirmación
Y puedo activar mi cuenta

Dado que estoy en la página de login
Cuando hago clic en "Google"
Entonces soy redirigido a Google
Y después de auth, estoy conectado
```

──────────────────────────────────────────────────────────────
💬 FEEDBACK A RECOPILAR
──────────────────────────────────────────────────────────────

Preguntas para los stakeholders:

1. "¿El flujo de registro es claro?"
2. "¿Faltan proveedores de OAuth?" (Apple, Microsoft, etc.)
3. "¿El diseño cumple las expectativas?"
4. "¿Prioridad para el próximo sprint?"

──────────────────────────────────────────────────────────────
📝 NOTAS DE LA SESIÓN
──────────────────────────────────────────────────────────────

Feedback recibido:
- {Feedback 1}
- {Feedback 2}

Nuevas solicitudes:
- {Solicitud 1} → Crear US-XXX
- {Solicitud 2} → Añadir al backlog

Decisiones tomadas:
- {Decisión 1}
- {Decisión 2}
```

### Paso 3: Preparar los Materiales

#### 3.1 Burndown Chart

```
Puntos |
  21   |████████████████████████████████
  18   |████████████████████████████████
  15   |████████████████████████████████
  12   |████████████████████████████████
   9   |████████████████████████████████
   6   |████████████████████████████████
   3   |████████████████████████████████ (ideal)
   3   |████████████████████████████████ (actual)
       D1  D2  D3  D4  D5  D6  D7  D8  D9  D10

Leyenda: ██ Actual  ── Ideal
```

#### 3.2 Flujo Acumulativo

```
US |
 4 |                    ████████████████
 3 |            ████████████████████████
 2 |    ████████████████████████████████
 1 |████████████████████████████████████
   |________________________________
   D1  D2  D3  D4  D5  D6  D7  D8  D9  D10

██ Hecho  ░░ En progreso  ── Por hacer
```

### Paso 4: Agenda de la Revisión de Sprint

```
══════════════════════════════════════════════════════════════
📅 AGENDA DE LA REVISIÓN DE SPRINT
══════════════════════════════════════════════════════════════

Duración total: 2h

00:00 - 00:10 | Introducción y Contexto
               - Recordatorio del objetivo del Sprint
               - Participantes presentes
               - Agenda

00:10 - 01:00 | Demostración de US entregadas
               - US por US
               - Preguntas/feedback después de cada demo

01:00 - 01:20 | Métricas y Resultados
               - Burndown chart
               - Velocidad
               - Puntos no entregados

01:20 - 01:40 | Discusión y Feedback
               - Reacciones de los stakeholders
               - Nuevas ideas
               - Priorización

01:40 - 02:00 | Próximos pasos
               - Impacto en el Product Backlog
               - Visión del próximo sprint
               - Preguntas
```

### Paso 5: Plantilla sprint-review.md

```markdown
# Revisión de Sprint - Sprint {N}

## Información

| Atributo | Valor |
|----------|-------|
| Fecha | {YYYY-MM-DD} |
| Duración | 2h |
| Facilitador | {Nombre} |

## Participantes

- [ ] Product Owner
- [ ] Scrum Master
- [ ] Equipo de Desarrollo
- [ ] Stakeholder 1
- [ ] Stakeholder 2

## Objetivo del Sprint

> "{Objetivo}"

**Alcanzado: ✅ / ❌ / ⚠️**

## Demostración

### US-XXX: Título
- **Demo por**: @miembro
- **Feedback**: {notas}

### US-XXX: Título
- **Demo por**: @miembro
- **Feedback**: {notas}

## Métricas

| Métrica | Valor |
|---------|-------|
| Planificados | X pts |
| Entregados | Y pts |
| Velocidad | Y pts |
| Tasa | Z% |

## Feedback de Stakeholders

### Positivo
- {Feedback positivo 1}
- {Feedback positivo 2}

### A mejorar
- {Punto de mejora 1}
- {Punto de mejora 2}

### Nuevas ideas
- {Idea 1} → US-XXX creada
- {Idea 2} → A refinar

## Impacto en el Backlog

| Acción | US | Descripción |
|--------|-----|-------------|
| Añadida | US-XXX | {Título} |
| Repriorizada | US-XXX | {Razón} |
| Eliminada | US-XXX | {Razón} |

## Próximos pasos

1. {Acción 1}
2. {Acción 2}
3. {Acción 3}
```

## Consejos para la Revisión de Sprint

### Lo que es
- Una inspección del incremento
- Un momento de feedback
- Una colaboración con los stakeholders

### Lo que NO es
- Una reunión de estado
- Una demo técnica
- Un informe para la dirección

### Buenas prácticas
- Demo en entorno real (staging/prod)
- El equipo hace la demo, no solo el SM
- Recopilar feedback activamente
- Adaptar el backlog en tiempo real

## Siguiente Paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /workflow:retro                                       ║
║    Facilitar la retrospectiva del sprint                 ║
║                                                          ║
║  Ver también:                                            ║
║  • /workflow:status  — Verificar el progreso general     ║
║  • /sprint:status    — Ver métricas del sprint           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
