---
description: Mostrar el informe completo de los quality gates
argument-hint: [--detailed]
---

# Informe Quality Gates

Generar un informe completo de todos los quality gates BMAD.

## Argumentos

$ARGUMENTS (format: [--detailed])
- **--detailed** (opcional): Incluir los detalles de validacion para cada gate

## Proceso

### Paso 1: Identificar los gates aplicables

Determinar cuales gates se aplican segun el estado del proyecto:
- Gate PRD: Si existe archivo PRD
- Gate Tech Spec: Si existe archivo tech spec
- Gate Backlog: Si existen stories
- Gate Sprint Ready: Si existen metadatos de sprint
- Gates Story: Para cada story in-progress/review

### Paso 2: Ejecutar las validaciones

Ejecutar cada validador de gate aplicable.

### Paso 3: Agregar los resultados

Compilar los resultados en un informe resumido.

### Paso 4: Generar las recomendaciones

Basado en los fallos, sugerir acciones prioritarias.

## Formato de Salida

```
═══════════════════════════════════════════════════════
            Informe Quality Gates BMAD
═══════════════════════════════════════════════════════

Proyecto: claude-craft
Sprint: sprint-3 - Gestion de Usuarios
Generado: 2026-01-29 10:00:00

Resumen de Gates:
══════════════════════════════════════════════════════
| Gate | Umbral | Puntuacion | Estado |
|------|--------|------------|--------|
| PRD | 80% | 90% | ✅ APROBADO |
| Tech Spec | 90% | 92% | ✅ APROBADO |
| Backlog | 6/6 | 5.8/6 prom | ⚠️ ADVERT |
| Sprint Ready | 100% | 100% | ✅ APROBADO |
| Story DoD | 100% | variable | 📊 |

Estado DoD por Story:
──────────────────────────────────────────────────────
| Story | Estado | Puntuacion DoD | Gate |
|-------|--------|----------------|------|
| US-010 | in-progress | 45% | ⏳ |
| US-011 | in-progress | 60% | ⏳ |
| US-012 | review | 85% | ⚠️ |
| US-013 | done | 100% | ✅ |

Salud Global: 🟢 Buena
──────────────────────────────────────────────────────
4/5 gates aprobados
8/10 stories en buen camino
Sin bloqueadores criticos

Recomendaciones:
──────────────────────────────────────────────────────
1. ⚠️ US-002 carece de story points (INVEST: E)
   Ejecutar: /project:update-story US-002 --points 3

2. ⚠️ US-012 requiere una revision de codigo para completarse
   Crear una PR y solicitar una revision

Comandos:
  /gate:validate-prd       Relanzar gate PRD
  /gate:validate-backlog   Relanzar gate backlog
  /gate:validate-story US-012  Verificar story especifica
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/gate:report
/gate:report --detailed
```

## Siguiente paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Ejecutar la gate específica que necesita atención:      ║
║                                                          ║
║  • /gate:validate-prd      — Gate calidad PRD            ║
║  • /gate:validate-techspec — Gate spec técnica           ║
║  • /gate:validate-backlog  — Gate backlog                ║
║  • /gate:validate-sprint   — Gate preparación sprint     ║
║  • /gate:validate-story    — Gate DoD story              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

## Validaciones Paso a Paso

### Validación PRD

```
Archivo: docs/prd.md
Umbral: 80%
Criterios:
  ✅ Declaración del problema (15%)
  ✅ Usuarios objetivo (15%)
  ✅ Objetivos (15%)
  ✅ Métricas de éxito (15%)
  ✅ Alcance/Límites (10%)
  ✅ Resumen de User Stories (10%)
  ✅ Supuestos (10%)
  ⚠️ Riesgos (10%) - Parcial
```

### Validación Tech Spec

```
Archivo: docs/tech-spec.md
Umbral: 90%
Criterios:
  ✅ Vista general de arquitectura (12%)
  ✅ Diagrama de arquitectura (10%)
  ✅ Componentes (12%)
  ✅ Modelo de datos (10%)
  ✅ Contratos API (10%)
  ✅ Seguridad (12%)
  ✅ Rendimiento (8%)
  ⚠️ Manejo de errores (8%) - Básico
  ✅ Estrategia de pruebas (10%)
  ✅ Despliegue (8%)
```

### Acciones por Prioridad

```
Prioridad 1 (Bloqueante): Ninguna
Prioridad 2 (Debe corregirse):
  1. US-002: Añadir estimación en story points
  2. US-008: Dividir en stories más pequeñas
Prioridad 3 (Deseable):
  1. Añadir mitigaciones de riesgo al PRD
  2. Mejorar manejo de errores en tech spec
```

## Configuración de Gates

Los gates están configurados en `.bmad/gates/`:
- `prd-gate.yaml`
- `techspec-gate.yaml`
- `backlog-gate.yaml`
- `story-gate.yaml`
- `sprint-ready-gate.yaml`

## Integración

El informe puede ser:
1. Generado bajo demanda mediante este comando
2. Incluido en la retrospectiva del sprint
3. Usado para monitorear la salud del proyecto
4. Exportado para informes a las partes interesadas

## Detalles Gates DoD Stories

```
US-010: Registro de usuario
  Estado: in-progress | Score DoD: 45%
  ❌ Tareas: 2/5 | ❌ Tests: fase roja
  ⚠️ CA: 1/3   | ❌ Revisión: no iniciada

US-011: Inicio de sesión de usuario
  Estado: in-progress | Score DoD: 60%
  ⚠️ Tareas: 3/4 | ✅ Tests: fase verde
  ⚠️ CA: 2/3   | ❌ Revisión: no iniciada

US-012: Página de perfil
  Estado: review | Score DoD: 85%
  ✅ Tareas: 4/4 | ✅ Tests: fase refactoring
  ✅ CA: 3/3   | ⚠️ Revisión: aprobación pendiente

US-013: Restablecimiento de contraseña
  Estado: done | Score DoD: 100%
  ✅ Todos los criterios cumplidos
```
## Informe por Gate — Detalles Completos

### Stories del Backlog con Problemas

| Story | INVEST | Problema | Acción |
|-------|--------|----------|--------|
| US-002 | 5/6 | Sin story points | Añadir estimación |
| US-008 | 5/6 | > 8 puntos (muy grande) | Dividir |

### Estado Sprint Ready — Detalles

| Criterio | Estado | Notas |
|----------|--------|-------|
| Metadatos Sprint | ✅ | sprint-3 configurado |
| Objetivo Sprint | ✅ | Gestión de usuarios |
| Stories Listas | ✅ | 5 stories ready-for-dev |
| Stories Estimadas | ✅ | Todas estimadas |
| Capacidad (84%) | ✅ | 42/50 puntos disponibles |
| Dependencias | ✅ | Ninguna sin resolver |

### Monitoreo y Alertas

El sistema de quality gates emite alertas cuando:
- Un gate crítico falla (PRD < 80%, Tech Spec < 90%)
- Una story supera el tiempo estimado sin avanzar
- Se detectan dependencias circulares entre stories
- La capacidad del sprint supera el 90%

**Frecuencia recomendada:**
- Gates PRD/TechSpec: Una vez al inicio del sprint
- Gate Backlog: Antes de cada sesión de refinement
- Gate Sprint Ready: 48h antes del inicio del sprint
- Gates Story DoD: Diariamente para stories en progreso
