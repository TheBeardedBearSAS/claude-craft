---
description: Verificar Conformidad Completa de Vite
argument-hint: [arguments]
---

# Verificar Conformidad Completa de Vite

## Argumentos

$ARGUMENTS (opcional: ruta del proyecto a analizar)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Realizar una auditoría de conformidad completa del proyecto Vite orquestando las 4 verificaciones principales: Configuración y Arquitectura Vite, TypeScript y Calidad, Tests, y Salida de Build y Rendimiento. Producir un reporte consolidado con una puntuación general sobre 100 puntos. **Recordatorio de alcance**: esta auditoría cubre únicamente el uso de Vite agnóstico de framework (aplicaciones vanilla JS/TS, creación de librerías, aplicaciones multi-página, Workers/WASM). No evaluar la integración del servidor de desarrollo específica de React/Vue/Angular/Svelte — eso corresponde a la verificación de conformidad propia de cada stack.

### Paso 1: Preparación de la Auditoría

Preparar el entorno de auditoría:
- [ ] Identificar la ruta del proyecto a auditar
- [ ] Verificar la presencia de archivos de configuración (package.json, tsconfig.json, vite.config.ts)
- [ ] Listar los directorios principales (src/, pages/, public/, tests/, etc.)
- [ ] Identificar el tipo de proyecto: SPA vanilla, librería (build.lib), app multi-página, o puntos de entrada Workers/WASM
- [ ] Identificar la versión de Vite y confirmar que ningún plugin específico de framework (`@vitejs/plugin-react`, `@vitejs/plugin-vue`, etc.) esté dentro del alcance de esta auditoría

**Nota**: Si se proporciona $ARGUMENTS, usarlo como ruta del proyecto; en caso contrario, usar el directorio actual.

### Paso 2: Auditoría de Configuración y Arquitectura Vite (30 puntos)

Ejecutar la verificación completa de configuración y arquitectura:

**Criterios Evaluados**:
- Corrección de vite.config.ts (defineConfig, alias sincronizados con tsconfig) (8 pts)
- Ubicación de index.html en la raíz del proyecto, nunca dentro de public/ (6 pts)
- Configuración de build.lib para librerías (entry, formats, external, vite-plugin-dts) (8 pts)
- rollupOptions.input para apps multi-página, convención de nombrado de plugins (vite-plugin-*) (8 pts)

**Referencia**: `.claude/agents/vite-reviewer.md` (sección 1)

### Paso 3: Auditoría de TypeScript y Calidad (20 puntos)

Ejecutar la verificación de configuración TypeScript y calidad del tipado:

**Criterios Evaluados**:
- strict: true, moduleResolution: "bundler", target ES2022+ (6 pts)
- Tipos de Vite presentes (vite/client), import.meta.env correctamente tipado (5 pts)
- Corrección de la salida de vite-plugin-dts (rollupTypes, cero any injustificado) (5 pts)
- Hooks de plugins personalizados tipados vía la interfaz Plugin (4 pts)

**Referencia**: `.claude/agents/vite-reviewer.md` (sección 2)

### Paso 4: Auditoría de Testing (25 puntos)

Ejecutar la verificación de testing:

**Criterios Evaluados**:
- Configuración Vitest coherente (mergeConfig o archivo dedicado), sin divergencia con vite.config.ts (6 pts)
- Cobertura >= 80% en lógica de negocio / API pública (6 pts)
- Entorno de test acorde a la necesidad (node vs jsdom/happy-dom) (4 pts)
- Tests sobre el build publicado (dist/), no solo el código fuente (5 pts)
- Tests de integración/E2E para apps multi-página (4 pts)

**Referencia**: `.claude/agents/vite-reviewer.md` (sección 3)

### Paso 5: Auditoría de Salida de Build y Rendimiento (25 puntos)

Ejecutar la verificación de salida de build y rendimiento:

**Criterios Evaluados**:
- Tree-shaking efectivo (sideEffects: false, exports nombrados, exports map coherente) (6 pts)
- Dependencias externalizadas para librerías (peer deps no empaquetadas) (6 pts)
- Code-splitting para apps multi-página (manualChunks, vendor compartido) (5 pts)
- Bundle bajo los umbrales, assetsInlineLimit controlado (4 pts)
- Hashing de assets, build.target apropiado, sourcemaps gestionados correctamente en producción (4 pts)

**Referencia**: `.claude/agents/vite-reviewer.md` (sección 4)

### Paso 6: Consolidación y Puntuación Global

Calcular la puntuación general y producir el reporte consolidado:
- [ ] Sumar las 4 puntuaciones (30 + 20 + 25 + 25 = 100 puntos)
- [ ] Identificar categorías críticas (<50% de su máximo)
- [ ] Listar todos los problemas críticos transversales (ej. index.html en public/, falta de externalización de peer deps)
- [ ] Priorizar acciones por impacto/esfuerzo
- [ ] Producir el reporte consolidado final

**Escala de Calificación**:
- 90-100: Excelente - Proyecto de referencia
- 75-89: Muy bueno - Algunas mejoras menores
- 60-74: Aceptable - Requiere mejoras
- 40-59: Insuficiente - Se requiere refactorización mayor
- 0-39: Crítico - Se necesita una revisión completa

### Paso 7: Recomendaciones y Plan de Acción

Producir las recomendaciones finales:
- [ ] Identificar las 3 acciones prioritarias principales en todas las categorías
- [ ] Estimar el esfuerzo (Bajo/Medio/Alto) para cada acción
- [ ] Estimar el impacto (Bajo/Medio/Alto) para cada acción
- [ ] Proponer un orden de implementación
- [ ] Sugerir quick wins (alta relación impacto/esfuerzo)

## FORMATO DE SALIDA

```
AUDITORÍA DE CONFORMIDAD VITE - REPORTE COMPLETO
=============================================

PUNTUACIÓN GENERAL: XX/100

NIVEL DE CONFORMIDAD: [Excelente/Muy bueno/Aceptable/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNTUACIONES POR CATEGORÍA:

CONFIGURACIÓN Y ARQUITECTURA VITE : XX/30  [██████████░░░░░░░░░░] XX%
TYPESCRIPT Y CALIDAD               : XX/20  [██████████░░░░░░░░░░] XX%
TESTS                               : XX/25  [██████████░░░░░░░░░░] XX%
SALIDA DE BUILD Y RENDIMIENTO       : XX/25  [██████████░░░░░░░░░░] XX%

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

DETALLE POR CATEGORÍA:

┌─────────────────────────────────────────────┐
│ CONFIGURACIÓN Y ARQUITECTURA VITE (XX/30)    │
└─────────────────────────────────────────────┘

Sub-puntuaciones:
  • Corrección de vite.config.ts     : XX/8
  • Ubicación de index.html          : XX/6
  • Configuración de build.lib       : XX/8
  • rollupOptions.input / plugins    : XX/8

Fortalezas:
- [Fortalezas de arquitectura]

Problemas:
- [Problemas de arquitectura]

┌─────────────────────────────────────────────┐
│ TYPESCRIPT Y CALIDAD (XX/20)                 │
└─────────────────────────────────────────────┘

Sub-puntuaciones:
  • Modo strict / moduleResolution   : XX/6
  • Tipos de Vite / import.meta.env  : XX/5
  • Salida de vite-plugin-dts        : XX/5
  • Hooks de plugins tipados         : XX/4

Fortalezas:
- [Fortalezas de tipado]

Problemas:
- [Problemas de tipado]

┌─────────────────────────────────────────────┐
│ TESTS (XX/25)                                │
└─────────────────────────────────────────────┘

Sub-puntuaciones:
  • Coherencia de la configuración Vitest : XX/6
  • Cobertura >= 80%                      : XX/6
  • Adecuación del entorno de test        : XX/4
  • Build publicado testeado              : XX/5
  • Integración/E2E multi-página          : XX/4

Fortalezas:
- [Fortalezas de testing]

Problemas:
- [Problemas de testing]

┌─────────────────────────────────────────────┐
│ SALIDA DE BUILD Y RENDIMIENTO (XX/25)        │
└─────────────────────────────────────────────┘

Sub-puntuaciones:
  • Efectividad del tree-shaking          : XX/6
  • Externalización de peer deps          : XX/6
  • Code-splitting multi-página           : XX/5
  • Umbrales del bundle                   : XX/4
  • Hashing / build.target / sourcemaps   : XX/4

Fortalezas:
- [Fortalezas de rendimiento]

Problemas:
- [Problemas de rendimiento]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 ACCIONES PRIORITARIAS (TODAS LAS CATEGORÍAS):

1. CRÍTICO - [Acción #1]
   Categoría : [Arquitectura/TypeScript/Tests/Rendimiento]
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

MESES 2-3 (Mediano plazo):
- [ ] [Acción recomendada #3]
- [ ] [Mejoras progresivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMEN EJECUTIVO:

[Párrafo resumen sobre el estado general del proyecto, las principales
fortalezas, las principales debilidades, y la trayectoria recomendada
para mejorar la conformidad. Mencionar si el proyecto está listo para
producción, requiere correcciones, o necesita refactorización.]

Recomendación General: [Listo para producción / Correcciones menores /
Refactorización mayor / Revisión completa necesaria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 categorías cubiertas por `@vite-reviewer`
- Usar Docker para todas las herramientas de análisis
- Proporcionar ejemplos concretos con file:line para cada problema
- Priorizar acciones según la matriz Impacto/Esfuerzo
- La ubicación de index.html y la externalización de peer dependencies SIEMPRE son prioridad máxima cuando se violan (rompen el grafo de módulos o inflan el bundle de todos los consumidores)
- Proponer correcciones automatizables (scripts, hooks de pre-commit)
- El reporte debe ser accionable, no solo descriptivo
- Adaptar las recomendaciones al tipo de proyecto (app vanilla / librería / multi-página / Workers-WASM)
- NO evaluar la integración del servidor de desarrollo específica de framework (React/Vue/Angular/Svelte) — fuera del alcance de esta auditoría
