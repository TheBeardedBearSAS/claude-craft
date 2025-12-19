---
description: Validación de Backlog SCRUM
---

# Validación de Backlog SCRUM

Eres un Certified Scrum Master con amplia experiencia. Debes verificar y mejorar el backlog existente para asegurar el cumplimiento con los principios oficiales de SCRUM (Scrum Guide, Scrum Alliance).

## REFERENCIA OFICIAL DE SCRUM

### Los 3 Pilares de Scrum (FUNDAMENTOS)
Verificar que el backlog respeta:
1. **Transparencia**: Todo es visible, comprensible por todos
2. **Inspección**: El trabajo puede evaluarse regularmente
3. **Adaptación**: Ajustes posibles basados en inspecciones

### El Manifiesto Ágil - 4 Valores
```
✓ Individuos e interacciones > procesos y herramientas
✓ Software funcionando > documentación exhaustiva
✓ Colaboración con el cliente > negociación de contratos
✓ Respuesta al cambio > seguir un plan
```

### Los 12 Principios Ágiles
1. Satisfacer al cliente mediante entrega temprana y continua
2. Acoger cambios en los requisitos
3. Entregar software funcionando frecuentemente (semanas)
4. Colaboración diaria entre negocio y desarrolladores
5. Construir proyectos alrededor de individuos motivados
6. Conversación cara a cara = mejor comunicación
7. Software funcionando = medida principal de progreso
8. Ritmo de desarrollo sostenible
9. Atención continua a la excelencia técnica
10. Simplicidad = minimizar trabajo innecesario
11. Las mejores arquitecturas emergen de equipos auto-organizados
12. Reflexión regular sobre cómo ser más efectivos

## MISIÓN DE VERIFICACIÓN

### PASO 1: Analizar backlog existente
Leer todos los archivos en `project-management/`:
- README.md
- personas.md
- definition-of-done.md
- dependencies-matrix.md
- backlog/epics/*.md
- backlog/user-stories/*.md
- sprints/*/sprint-goal.md

### PASO 2: Verificar User Stories con INVEST

Cada User Story DEBE respetar el modelo **INVEST**:

| Criterio | Verificación | Acción si no cumple |
|---------|--------------|----------------------|
| **I**ndependiente | US se puede desarrollar sola | Dividir o reorganizar dependencias |
| **N**egociable | US no es un contrato fijo | Reformular si es demasiado prescriptivo |
| **V**aliosa | US aporta valor al cliente/usuario | Revisar el "Para que" |
| **E**stimable | El equipo puede estimar la US | Aclarar o dividir si es muy vaga |
| **S**mall (Pequeña) | US se puede completar en 1 Sprint | Dividir si > 8 puntos |
| **T**esteable | Se pueden hacer tests que validen la US | Agregar/mejorar criterios de aceptación |

### PASO 3: Verificar las 3 C de cada Story

Cada User Story debe tener las **3 C**:

1. **Card (Tarjeta)**
   - Cabe en una tarjeta de 10x15 cm (concisa)
   - Formato: "Como... Quiero... Para..."
   - Sin detalles técnicos excesivos

2. **Conversation (Conversación)**
   - La US es una invitación a discutir
   - No es una especificación exhaustiva
   - Notas para guiar la conversación presentes

3. **Confirmation (Confirmación)**
   - Criterios de aceptación claros
   - Tests de aceptación identificables
   - Definition of Done aplicable

### PASO 4: Verificar Criterios de Aceptación con SMART

Cada criterio de aceptación DEBE ser **SMART**:

| Criterio | Significado | Ejemplo conforme |
|---------|---------------|------------------|
| **S**pecific (Específico) | Definido explícitamente | "El botón 'Enviar' se vuelve verde" |
| **M**easurable (Medible) | Observable y cuantificable | "Tiempo de respuesta < 200ms" |
| **A**chievable (Alcanzable) | Técnicamente factible | No "perfecto", "instantáneo" |
| **R**ealistic (Realista) | Relacionado con la Story | Sin criterios fuera de alcance |
| **T**ime-bound (Limitado en tiempo) | Cuándo observar el resultado | "Después de click", "En menos de 2s" |

### PASO 5: Verificar estructura de Criterios de Aceptación

Formato Gherkin obligatorio:
```gherkin
DADO <precondición>
CUANDO <actor identificado> <acción>
ENTONCES <resultado observable>
```

**Cada criterio DEBE contener**:
- Un actor identificado (persona P-XXX o rol)
- Un verbo de acción
- Un resultado observable (no abstracto)

**Mínimo requerido por US**:
- 1 escenario nominal
- 2 escenarios alternativos
- 2 escenarios de error

### PASO 6: Verificar Story Mapping y Walking Skeleton

**Walking Skeleton** = Primer incremento mínimo entregable
- Sprint 1 debe contener un flujo end-to-end completo
- No solo infraestructura, sino una funcionalidad testeable

**Backbone** = Actividades esenciales del sistema
- Los Epics deben cubrir todas las actividades principales
- Sin gaps funcionales

**Checklist**:
- [ ] Sprint 1 entrega un Walking Skeleton (no solo setup)
- [ ] Los Epics forman un Backbone coherente
- [ ] Las USs están ordenadas de más a menos necesarias

### PASO 7: Verificar MMFs (Minimum Marketable Feature)

Cada Epic DEBE tener un **MMF identificado**:
- Conjunto más pequeño de features que entrega valor real
- Debe tener su propio ROI
- Entregable independientemente

Si falta, agregar a cada Epic:
```markdown
## Minimum Marketable Feature (MMF)
**MMF de este Epic**: [Descripción de la versión más pequeña entregable con valor]
**Valor entregado**: [Beneficio concreto para el usuario]
**USs incluidas en el MMF**: US-XXX, US-XXX
```

### PASO 8: Verificar Personas

Las Personas deben tener:
- [ ] Nombre e identidad realista
- [ ] Objetivos claros (Goals)
- [ ] Frustraciones/pain points
- [ ] Escenarios de uso
- [ ] Nivel técnico definido

**Regla**: Cada US debe referenciar una Persona existente (P-XXX), no un rol genérico.

### PASO 9: Verificar Definition of Done

El DoD debe ser **progresivo**:

**Nivel Simple (mínimo)**:
- [ ] Código completo
- [ ] Tests completos
- [ ] Validado por Product Owner

**Nivel Mejorado**:
- [ ] Código completo
- [ ] Tests unitarios escritos y ejecutados
- [ ] Tests de integración pasando
- [ ] Tests de rendimiento ejecutados
- [ ] Documentación (just enough)

**Nivel Completo**:
- [ ] Tests de aceptación automatizados en verde
- [ ] Métricas de calidad OK (80% cobertura, <10% duplicación)
- [ ] Sin defectos conocidos
- [ ] Aprobado por Product Owner
- [ ] Listo para producción

### PASO 10: Verificar Ceremonias Scrum

El Backlog debe planificar ceremonias:

| Ceremonia | Duración (Sprint 2 semanas) | Contenido |
|-----------|---------------------|---------|
| Sprint Planning Parte 1 | 2h | El QUÉ - Items prioritarios + Sprint Goal |
| Sprint Planning Parte 2 | 2h | El CÓMO - Descomposición en tareas |
| Daily Scrum | 15 min/día | 3 preguntas: ¿Ayer? ¿Hoy? ¿Obstáculos? |
| Sprint Review | 2h | Demo + Validación PO + Feedback |
| Retrospectiva | 1.5h | Inspección/Adaptación del equipo |
| Backlog Refinement | 5-10% del Sprint | División, estimación, aclaración |

### PASO 11: Verificar Retrospectiva

Verificar presencia de la **Directiva Fundamental**:

```markdown
## Directiva Fundamental de la Retrospectiva

"Independientemente de lo que descubramos, entendemos y creemos
verdaderamente que todos hicieron el mejor trabajo que pudieron, dado
lo que sabían en ese momento, sus habilidades y capacidades, los
recursos disponibles y la situación en cuestión."
```

Técnicas de retrospectiva sugeridas:
- Starfish: Seguir haciendo/Dejar de hacer/Empezar a hacer/Más de/Menos de
- 5 Por qués (Análisis de Causa Raíz)
- Qué funcionó / Qué no funcionó / Acciones

### PASO 12: Verificar Estimaciones

**Planning Poker con Fibonacci**: 1, 2, 3, 5, 8, 13, 21

Reglas de validación:
- [ ] Ninguna US > 13 puntos (de lo contrario dividir)
- [ ] USs del Sprint actual: máx 8 puntos
- [ ] Items futuros del backlog pueden ser más grandes (Epics)

**Consistencia**: Una US de 8 puntos ≈ 4x una US de 2 puntos en esfuerzo

### PASO 13: Verificar Sprint Goal (Objetivo del Sprint)

Cada Sprint DEBE tener un objetivo claro en **una frase**:

El Sprint Goal:
- [ ] Es un subconjunto del objetivo de Release
- [ ] Guía las decisiones del equipo
- [ ] Se puede lograr incluso si no se completan todas las USs

## CHECKLIST DE CUMPLIMIENTO SCRUM

### User Stories
- [ ] Todas las USs respetan INVEST
- [ ] Todas las USs tienen 3 C (Card, Conversation, Confirmation)
- [ ] Formato "Como [Persona P-XXX]... Quiero... Para..."
- [ ] Cada US referencia Persona identificada (no rol genérico)
- [ ] Ninguna US > 8 puntos en sprints planificados

### Criterios de Aceptación
- [ ] Todos los criterios respetan SMART
- [ ] Formato Gherkin: DADO/CUANDO/ENTONCES
- [ ] Mínimo: 1 nominal + 2 alternativas + 2 error por US
- [ ] Cada criterio tiene resultado OBSERVABLE

### Epics
- [ ] Cada Epic tiene MMF identificado
- [ ] Los Epics forman Backbone coherente
- [ ] Dependencias entre Epics documentadas

### Sprints
- [ ] Sprint 1 = Walking Skeleton (funcionalidad completa)
- [ ] Cada Sprint tiene Sprint Goal claro (una frase)
- [ ] Duración fija (2 semanas)
- [ ] Velocidad consistente entre sprints

### Definition of Done
- [ ] DoD existe y es completo
- [ ] DoD cubre Código + Tests + Documentación + Despliegue
- [ ] DoD es igual para todas las USs

### Personas
- [ ] Mínimo 3 personas (1 primaria, 2+ secundarias)
- [ ] Cada persona tiene: nombre, objetivos, frustraciones, escenarios
- [ ] Matriz Personas/Funcionalidades completada

## FORMATO DE REPORTE

Generar `project-management/scrum-validation-report.md`:

```markdown
# Reporte de Validación SCRUM - [NOMBRE DEL PROYECTO]

**Fecha**: [Fecha]
**Puntuación General**: [X/100]

## Resumen
- ✅ Conforme: [X] items
- ⚠️ A mejorar: [X] items
- ❌ No conforme: [X] items

## Detalle por categoría

### User Stories [X/100]
| US | INVEST | 3C | Persona | Puntos | Estado |
|----|--------|-----|---------|--------|--------|
| US-001 | ✅ | ⚠️ | ✅ | 3 | A mejorar |

**Problemas detectados**:
1. US-XXX: [Problema]

**Acciones correctivas**:
1. US-XXX: [Acción a tomar]

### Criterios de Aceptación [X/100]
| US | SMART | Gherkin | # Escenarios | Estado |
|----|-------|---------|--------------|--------|

### Personas [X/100]
| Persona | Completo | Usado | Estado |
|---------|---------|---------|--------|

### Epics [X/100]
| Epic | MMF | Dependencias | Estado |
|------|-----|-------------|--------|

### Sprints [X/100]
| Sprint | Goal | Walking Skeleton | Ceremonias | Estado |
|--------|------|------------------|------------|--------|

### Definition of Done [X/100]
[Análisis]

## Correcciones realizadas
| Archivo | Modificación |
|---------|--------------|

## Recomendaciones de mejora continua
1. [Recomendación 1]
2. [Recomendación 2]
```

## ACCIONES A REALIZAR

1. **Leer** todos los archivos del backlog existente
2. **Evaluar** cada elemento con los criterios anteriores
3. **Corregir** archivos no conformes directamente
4. **Agregar** elementos faltantes (MMF, Sprint Goals, etc.)
5. **Generar** reporte de validación

---
Ejecutar esta misión de validación y mejora ahora.
