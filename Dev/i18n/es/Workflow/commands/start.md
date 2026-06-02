---
description: 
argument-hint: [argumentos]
---

# Preparación del Inicio de Sprint

Eres un Scrum Master experimentado. Debes preparar y facilitar el inicio de un nuevo sprint verificando que todas las condiciones estén satisfechas.

## Argumentos
$ARGUMENTS

Argumentos:
- Número de sprint (p. ej., `5`)
- (Opcional) Duración en días (por defecto: 10 días = 2 semanas)

Ejemplo: `/workflow:start 5`

## MISIÓN

### Paso 1: Verificar Prerequisitos

#### 1.1 Sprint Anterior Cerrado
```bash
# Comprobar el estado del sprint anterior
# - Sprint Review completada
# - Retrospectiva completada
# - Todas las US finalizadas o trasladadas
```

#### 1.2 Backlog Priorizado
- El Product Owner ha priorizado el backlog
- Las US candidatas están estimadas
- Los criterios de aceptación están definidos

#### 1.3 Equipo Disponible
- Disponibilidad confirmada
- Vacaciones identificadas
- Capacidad calculada

### Paso 2: Calcular la Capacidad

```
══════════════════════════════════════════════════════════════
📊 CÁLCULO DE CAPACIDAD - Sprint {N}
══════════════════════════════════════════════════════════════

Duración del sprint: {X} días laborables
Fecha de inicio: {YYYY-MM-DD}
Fecha de fin: {YYYY-MM-DD}

──────────────────────────────────────────────────────────────
👥 DISPONIBILIDAD DEL EQUIPO
──────────────────────────────────────────────────────────────

| Miembro | Días disponibles | Foco (%) | Capacidad |
|---------|-----------------|----------|-----------|
| Dev 1   | 10/10           | 80%      | 8 días    |
| Dev 2   | 8/10            | 80%      | 6.4 días  |
| Dev 3   | 10/10           | 50%      | 5 días    |
| Total   | -               | -        | 19.4 días |

──────────────────────────────────────────────────────────────
📈 VELOCIDAD
──────────────────────────────────────────────────────────────

| Sprint | Puntos planificados | Puntos entregados |
|--------|---------------------|-------------------|
| S-3    | 25                  | 23                |
| S-2    | 28                  | 26                |
| S-1    | 30                  | 28                |
| Media  | 27.7                | 25.7              |

Velocidad media: 26 puntos
Capacidad ajustada: ~24 puntos (factor de seguridad del 10%)
```

### Paso 3: Preparar el Sprint Planning

```
══════════════════════════════════════════════════════════════
📋 SPRINT PLANNING - Sprint {N}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 OBJETIVO DEL SPRINT (a definir con el PO)
──────────────────────────────────────────────────────────────

> "{Objetivo de negocio claro en una frase}"

Ejemplo: "Los usuarios pueden crear una cuenta e iniciar sesión
mediante OAuth2 (Google, GitHub)"

──────────────────────────────────────────────────────────────
📋 HISTORIAS DE USUARIO CANDIDATAS
──────────────────────────────────────────────────────────────

| Prioridad | US | Título | Puntos | Estado |
|-----------|-----|--------|--------|--------|
| 🔴 Must   | US-045 | Registro de usuario | 5 | Listo |
| 🔴 Must   | US-046 | Login con Google OAuth | 8 | Listo |
| 🔴 Must   | US-047 | Login con GitHub OAuth | 5 | Listo |
| 🟡 Should | US-048 | Restablecimiento de contraseña | 3 | Listo |
| 🟡 Should | US-049 | Página de perfil de usuario | 5 | Listo |
| 🟢 Could  | US-050 | Avatar personalizado | 2 | Listo |

Total candidato: 28 puntos
Capacidad: 24 puntos

──────────────────────────────────────────────────────────────
✅ DEFINITION OF READY (verificar para cada US)
──────────────────────────────────────────────────────────────

Para cada US seleccionada:
- [ ] Descripción clara y completa
- [ ] Criterios de aceptación definidos (Given/When/Then)
- [ ] Estimación en puntos
- [ ] Dependencias identificadas
- [ ] Mockups/diseños disponibles (si hay UI)
- [ ] Datos de prueba preparados
- [ ] Sin bloqueador técnico

──────────────────────────────────────────────────────────────
📅 CEREMONIAS PLANIFICADAS
──────────────────────────────────────────────────────────────

| Ceremonia | Fecha | Hora | Duración | Lugar |
|-----------|-------|------|----------|-------|
| Sprint Planning P1 | {fecha} | 09:00 | 2h | Sala A |
| Sprint Planning P2 | {fecha} | 14:00 | 2h | Sala A |
| Daily Scrum | Diario | 09:30 | 15min | Stand-up |
| Backlog Refinement | {fecha} | 14:00 | 1h | Sala B |
| Sprint Review | {fecha fin} | 14:00 | 2h | Sala A |
| Retrospectiva | {fecha fin} | 16:30 | 1h30 | Sala A |
```

### Paso 4: Crear la Estructura del Sprint

Crear la carpeta del sprint:

```
project-management/
   sprints/
       sprint-{N}-{objetivo}/
           sprint-goal.md
           sprint-backlog.md
           daily-notes/
              {YYYY-MM-DD}.md
              ...
           sprint-review.md
           sprint-retro.md
```

### Paso 5: Plantilla sprint-goal.md

```markdown
# Sprint {N}: {Objetivo}

## Información

| Atributo | Valor |
|----------|-------|
| Número | {N} |
| Inicio | {YYYY-MM-DD} |
| Fin | {YYYY-MM-DD} |
| Duración | {X} días |
| Capacidad | {Y} puntos |

## Objetivo del Sprint

> "{Objetivo de negocio claro}"

## Definition of Done (Recordatorio)

- [ ] Code review aprobado (2 revisores)
- [ ] Tests unitarios (cobertura ≥ 80%)
- [ ] Tests de integración pasan
- [ ] Documentación actualizada
- [ ] Sin deuda técnica añadida
- [ ] Desplegable a producción

## Sprint Backlog

| ID | Título | Puntos | Asignado | Estado |
|----|--------|--------|----------|--------|
| US-045 | Registro de usuario | 5 | @dev1 | 🔵 Por hacer |
| US-046 | Login con Google OAuth | 8 | @dev2 | 🔵 Por hacer |
| US-047 | Login con GitHub OAuth | 5 | @dev1 | 🔵 Por hacer |
| US-048 | Restablecimiento de contraseña | 3 | @dev3 | 🔵 Por hacer |

**Total comprometido: 21 puntos**

## Dependencias

| US | Depende de | Estado |
|----|-----------|--------|
| US-046 | Configuración de Google OAuth Console | ✅ Hecho |
| US-047 | Configuración de GitHub OAuth App | ⚠️ En progreso |

## Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Cambios en la API de Google | Baja | Media | Usar librería oficial |
| Dev2 de baja | Media | Media | @dev1 puede asumir |

## Burndown Chart

```
Puntos |
  21   |████
  18   |████████
  15   |████████████
  12   |████████████████
   9   |████████████████████
   6   |████████████████████████
   3   |████████████████████████████
   0   |________________________________
       D1  D2  D3  D4  D5  D6  D7  D8  D9  D10
```

## Notas

{Notas del sprint planning, decisiones tomadas...}
```

### Paso 6: Lista de Verificación Final

```
══════════════════════════════════════════════════════════════
✅ LISTA DE VERIFICACIÓN INICIO SPRINT {N}
══════════════════════════════════════════════════════════════

## Antes del Sprint Planning

- [ ] Sprint anterior oficialmente completado
- [ ] Acciones de la retrospectiva en curso
- [ ] Backlog priorizado por el PO
- [ ] US candidatas estimadas y en estado "Listo"
- [ ] Capacidad del equipo calculada
- [ ] Salas reservadas para las ceremonias

## Durante el Sprint Planning

### Parte 1 - QUÉ (con el PO)
- [ ] Objetivo del Sprint definido y aceptado
- [ ] US seleccionadas por el equipo
- [ ] Compromiso con el alcance
- [ ] Dependencias identificadas

### Parte 2 - CÓMO (equipo dev)
- [ ] Desglose en tareas
- [ ] Estimación de tareas
- [ ] Asignación inicial
- [ ] Riesgos discutidos

## Después del Sprint Planning

- [ ] Sprint backlog visible (tablero actualizado)
- [ ] Daily Scrum programado
- [ ] Herramientas configuradas (tablero, ramas, etc.)
- [ ] Comunicación del equipo (canal, notificaciones)

══════════════════════════════════════════════════════════════
🚀 ¡SPRINT {N} LISTO PARA EMPEZAR!
══════════════════════════════════════════════════════════════
```

## Consejos Scrum

### Objetivo del Sprint
- Una frase
- Orientado al valor de negocio
- Medible
- Compartido por todo el equipo

### Compromiso vs Previsión
- El equipo se compromete con el Objetivo del Sprint
- El número de puntos es una previsión
- La confianza aumenta con la experiencia

### Factor de Foco
- Equipo principiante: 50-60%
- Equipo establecido: 70-80%
- Equipo maduro: 80-90%

## Siguiente Paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /sprint:next-story                                    ║
║    Tomar la primera story del sprint backlog             ║
║                                                          ║
║  → /sprint:dev                                           ║
║    Iniciar el desarrollo TDD/BDD                         ║
║                                                          ║
║  Ver también:                                            ║
║  • /workflow:status  — Verificar el progreso del sprint  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
