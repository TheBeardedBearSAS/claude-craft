---
description: Verificar la Conformidad Completa de Vercel
argument-hint: [arguments]
---

# Verificar la Conformidad Completa de Vercel

## Argumentos

$ARGUMENTS (opcional: ruta del proyecto a analizar)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Realizar una auditoría de conformidad completa de la configuración de despliegue Vercel y del código de superficie de plataforma, orquestando las 4 verificaciones principales: vercel.json & Arquitectura, Functions & Elección de Runtime, Seguridad & Manejo de Entorno, e ISR/Caché & Tests. Producir un reporte consolidado con una puntuación general sobre 100 puntos. **Recordatorio de alcance**: esta auditoría cubre únicamente el uso de la plataforma Vercel agnóstico de framework (`vercel.json`, Serverless Functions en Node.js/Fluid Compute, primitivas de caché ISR, Cron Jobs, Storage). No evaluar el enrutamiento, renderizado o data-fetching específicos de Next.js (`revalidatePath`, `revalidateTag`, App Router, etc.) — eso pertenece a la verificación de conformidad propia del stack de framework correspondiente (`/react:*`, `/vuejs:*`, `/angular:*`).

### Paso 1: Preparación de la Auditoría

Preparar el entorno de auditoría:
- [ ] Identificar la ruta del proyecto a auditar
- [ ] Verificar la presencia de archivos de configuración (`vercel.json`, `package.json`, `tsconfig.json`)
- [ ] Listar los directorios principales (`api/`, `middleware.ts`, `.vercel/`, directorios de tests, etc.)
- [ ] Clasificar la forma del proyecto: static-only, Functions-only, ISR-enabled, Cron-enabled, o híbrido
- [ ] Identificar si algún framework (Next.js, o un build de Vite/React/Vue/Angular) se ejecuta encima, y confirmar que el enrutamiento/renderizado específico del framework queda fuera del alcance de esta auditoría

**Nota**: Si se proporciona $ARGUMENTS, usarlo como ruta del proyecto; en caso contrario, usar el directorio actual.

### Paso 2: Auditoría de vercel.json & Arquitectura (30 puntos)

Ejecutar la verificación completa de configuración y arquitectura:

**Criterios Evaluados**:
- vercel.json con schema correcto (`$schema`, `version`, claves de nivel superior válidas) (8 pts)
- Corrección de rewrites/redirects/headers (redirect vs rewrite, sin duplicación de headers con el middleware) (6 pts)
- Bloque de regions & functions (sin solapamiento ambiguo de globs, memory/maxDuration justificados) (8 pts)
- Ajuste a la forma del proyecto (la config coincide con la forma declarada static/Functions/ISR/Cron) (8 pts)

**Referencia**: `.claude/agents/vercel-reviewer.md` (sección 1)

### Paso 3: Auditoría de Functions & Elección de Runtime (20 puntos)

Ejecutar la verificación de runtime y calidad de los handlers:

**Criterios Evaluados**:
- Sin `runtime: 'edge'` sin marcar en código nuevo/modificado (se respeta el runtime por defecto Node.js/Fluid Compute) (8 pts)
- Versión de Node.js fijada a 20+ para el beneficio de bytecode-caching de Fluid Compute (6 pts)
- Calidad de la firma del handler (input validado, respuestas explícitas tipadas, imports conscientes del cold-start) (6 pts)

**Referencia**: `.claude/agents/vercel-reviewer.md` (sección 2)

### Paso 4: Auditoría de Seguridad & Manejo de Entorno (25 puntos)

Ejecutar la verificación de seguridad y manejo de secretos:

**Criterios Evaluados**:
- Secretos/variables de entorno (sin hardcoding, sin fuga hacia el bundle del cliente, alcance de entorno correcto) (8 pts)
- Los endpoints de Cron verifican un secreto de invocación (comparación timing-safe) (8 pts)
- Corrección de headers CORS/CSP (sin wildcard + credenciales, CSP base presente) (5 pts)
- Alcance de credenciales de Marketplace (least-privilege, sin `@vercel/kv`/`@vercel/postgres` deprecados) (4 pts)

**Referencia**: `.claude/agents/vercel-reviewer.md` (sección 3)

### Paso 5: Auditoría de ISR/Caché & Tests (25 puntos)

Ejecutar la verificación de caché y testing:

**Criterios Evaluados**:
- Corrección de Cache-Control (stale-while-revalidate en rutas cacheables) (8 pts)
- Sin conflicto de revalidación entre vercel.json/framework (única fuente de verdad) (7 pts)
- Cobertura de tests de los handlers (rutas happy/validation/auth, >= 80%) (6 pts)
- `x-vercel-cache` verificado / smoke test de integración vía `vercel dev` (4 pts)

**Referencia**: `.claude/agents/vercel-reviewer.md` (sección 4)

### Paso 6: Consolidación y Puntuación Global

Calcular la puntuación general y producir el reporte consolidado:
- [ ] Sumar las 4 puntuaciones (30 + 20 + 25 + 25 = 100 puntos)
- [ ] Identificar categorías críticas (<50% de su máximo)
- [ ] Listar todos los problemas críticos transversales (ej.: endpoint de Cron sin protección, secreto hardcodeado, paquete de Storage deprecado)
- [ ] Priorizar las acciones por impacto/esfuerzo
- [ ] Producir el reporte consolidado final

**Escala de Calificación**:
- 90-100: Excelente - Proyecto de referencia
- 75-89: Muy Bueno - Algunas mejoras menores
- 60-74: Aceptable - Requiere mejoras
- 40-59: Insuficiente - Se requiere una refactorización mayor
- 0-39: Crítico - Es necesaria una revisión completa

### Paso 7: Recomendaciones y Plan de Acción

Producir las recomendaciones finales:
- [ ] Identificar las 3 acciones prioritarias principales en todas las categorías
- [ ] Estimar el esfuerzo (Bajo/Medio/Alto) para cada acción
- [ ] Estimar el impacto (Bajo/Medio/Alto) para cada acción
- [ ] Proponer un orden de implementación
- [ ] Sugerir quick wins (alta relación impacto/esfuerzo)

## FORMATO DE SALIDA

```
AUDITORÍA DE CONFORMIDAD VERCEL - REPORTE COMPLETO
=============================================

PUNTUACIÓN GENERAL: XX/100

NIVEL DE CONFORMIDAD: [Excelente/Muy Bueno/Aceptable/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PUNTUACIONES POR CATEGORÍA:

VERCEL.JSON & ARQUITECTURA   : XX/30  [██████████░░░░░░░░░░] XX%
FUNCTIONS & ELECCIÓN DE RUNTIME : XX/20  [██████████░░░░░░░░░░] XX%
SEGURIDAD & MANEJO DE ENTORNO : XX/25  [██████████░░░░░░░░░░] XX%
ISR/CACHÉ & TESTS            : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORTALEZAS GENERALES:
1. [Fortaleza identificada en varias categorías]
2. [Otra fortaleza mayor]
3. [Tercera fortaleza]

MEJORAS GENERALES:
1. [Mejora menor transversal]
2. [Otra mejora recomendada]
3. [Tercera mejora]

PROBLEMAS CRÍTICOS:
1. [Problema crítico #1 - categoría afectada]
2. [Problema crítico #2 - categoría afectada]
3. [Problema crítico #3 - categoría afectada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALLES POR CATEGORÍA:

┌─────────────────────────────────────────────┐
│ VERCEL.JSON & ARQUITECTURA (XX/30)           │
└─────────────────────────────────────────────┘

Sub-puntuaciones:
  • Corrección del schema de vercel.json   : XX/8
  • rewrites/redirects/headers             : XX/6
  • regions & bloque de functions           : XX/8
  • Ajuste a la forma del proyecto         : XX/8

Fortalezas:
- [Fortalezas de arquitectura]

Problemas:
- [Problemas de arquitectura]

┌─────────────────────────────────────────────┐
│ FUNCTIONS & ELECCIÓN DE RUNTIME (XX/20)      │
└─────────────────────────────────────────────┘

Sub-puntuaciones:
  • Node.js/Fluid Compute vs Edge     : XX/8
  • Versión de Node.js fijada          : XX/6
  • Calidad de la firma del handler    : XX/6

Fortalezas:
- [Fortalezas de runtime]

Problemas:
- [Problemas de runtime]

┌─────────────────────────────────────────────┐
│ SEGURIDAD & MANEJO DE ENTORNO (XX/25)        │
└─────────────────────────────────────────────┘

Sub-puntuaciones:
  • Secretos/variables de entorno      : XX/8
  • Protección de auth en Cron         : XX/8
  • Headers CORS/CSP                   : XX/5
  • Alcance de credenciales Marketplace : XX/4

Fortalezas:
- [Fortalezas de seguridad]

Problemas:
- [Problemas de seguridad]

┌─────────────────────────────────────────────┐
│ ISR/CACHÉ & TESTS (XX/25)                    │
└─────────────────────────────────────────────┘

Sub-puntuaciones:
  • Corrección de Cache-Control        : XX/8
  • Ausencia de conflicto de revalidación : XX/7
  • Cobertura de tests de handlers     : XX/6
  • x-vercel-cache verificado          : XX/4

Fortalezas:
- [Fortalezas de caché/testing]

Problemas:
- [Problemas de caché/testing]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 ACCIONES PRIORITARIAS (TODAS LAS CATEGORÍAS):

1. CRÍTICO - [Acción #1]
   Categoría : [Arquitectura/Runtime/Seguridad/Caché]
   Impacto   : [Alto/Medio/Bajo]
   Esfuerzo  : [Alto/Medio/Bajo]
   Prioridad : INMEDIATA

   Descripción detallada:
   [Explicación del problema y solución propuesta]

   Archivos afectados:
   - [file:line]

   Ejemplo de corrección:
   [Código o comando de corrección]

2. IMPORTANTE - [Acción #2]
   [Mismo formato...]

3. RECOMENDADA - [Acción #3]
   [Mismo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Alto Impacto / Bajo Esfuerzo):

- [Quick win #1] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Quick win #2] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Quick win #3] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN DE ACCIÓN RECOMENDADO:

SEMANA 1 (Inmediato):
- [ ] [Acción crítica #1]
- [ ] [Quick win prioritario]

SEMANAS 2-4 (Corto plazo):
- [ ] [Acción importante #2]
- [ ] [Otros quick wins]

MES 2-3 (Mediano plazo):
- [ ] [Acción recomendada #3]
- [ ] [Mejoras progresivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMEN EJECUTIVO:

[Párrafo resumen sobre el estado general del proyecto, principales fortalezas,
principales debilidades, y la trayectoria recomendada para mejorar la
conformidad. Mencionar si el proyecto está listo para producción,
requiere correcciones, o necesita una refactorización.]

Recomendación General: [Listo para producción / Correcciones menores /
Refactorización mayor / Revisión completa necesaria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 categorías cubiertas por `@vercel-reviewer`
- Usar Docker para todas las herramientas de análisis
- Proporcionar ejemplos concretos con file:line para cada problema
- Priorizar las acciones según la matriz Impacto/Esfuerzo
- Un endpoint de Cron sin protección y un secreto hardcodeado son SIEMPRE prioridad máxima cuando se encuentran (permiten que cualquiera que descubra la ruta/repositorio dispare jobs o exfiltre credenciales)
- Un hallazgo `runtime: 'edge'` en código nuevo/modificado siempre se señala, pero nunca bloquea un reporte sobre código legacy no modificado — tratarlo como deuda de migración, no como un fallo bloqueante
- Proponer correcciones automatizables (scripts, hooks de pre-commit)
- El reporte debe ser accionable, no solo descriptivo
- Adaptar las recomendaciones a la forma del proyecto (static-only / Functions-only / ISR-enabled / Cron-enabled / híbrido)
- NO evaluar el enrutamiento/renderizado/data-fetching específico de Next.js ni la integración con el servidor de desarrollo propia de ningún otro framework — fuera de alcance para esta auditoría
