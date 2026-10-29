# Verificar la Conformidad Completa de Vercel

## Argumentos

$ARGUMENTS (opcional: ruta del proyecto a analizar)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Realizar una auditoría de conformidad completa de la configuración de despliegue Vercel y del código de superficie de plataforma, orquestando las 4 verificaciones principales: Arquitectura, Calidad de Código, Pruebas y Seguridad. Producir un reporte consolidado con una puntuación general sobre 100 puntos. **Recordatorio de alcance**: esta auditoría cubre únicamente el uso de la plataforma Vercel agnóstico de framework (`vercel.json`, Serverless Functions en Node.js/Fluid Compute, primitivas de caché ISR, Cron Jobs, Storage). No evaluar el enrutamiento, renderizado o data-fetching específicos de Next.js (`revalidatePath`, `revalidateTag`, App Router, etc.) — eso pertenece a la verificación de conformidad propia del stack de framework correspondiente (`/react:*`, `/vuejs:*`, `/angular:*`).

### Paso 1: Preparación de la Auditoría

Preparar el entorno de auditoría:
- [ ] Identificar la ruta del proyecto a auditar
- [ ] Verificar la presencia de archivos de configuración (`vercel.json`, `package.json`, `tsconfig.json`)
- [ ] Listar los directorios principales (`api/`, `middleware.ts`, `.vercel/`, directorios de tests, etc.)
- [ ] Clasificar la forma del proyecto: static-only, Functions-only, ISR-enabled, Cron-enabled, o híbrido
- [ ] Identificar si algún framework (Next.js, o un build de Vite/React/Vue/Angular) se ejecuta encima, y confirmar que el enrutamiento/renderizado específico del framework queda fuera del alcance de esta auditoría

**Nota**: Si se proporciona $ARGUMENTS, usarlo como ruta del proyecto; en caso contrario, usar el directorio actual.

### Paso 2: Auditoría de Arquitectura (25 puntos)

Ejecutar la verificación completa de arquitectura:

**Comando**: Usar el comando slash `/vercel:check architecture` o seguir manualmente los pasos de `.claude/references/vercel/checks/architecture.md`

**Criterios Evaluados**:
- Validez del esquema de vercel.json (`$schema`, `version`, claves de nivel superior válidas) (6 pts)
- Corrección de rewrites / redirects / headers (6 pts)
- Bloque regions y functions (sin solapamiento ambiguo de globs, memory/maxDuration justificados) (5 pts)
- Configuración de Cron Jobs (rutas y programaciones válidas en `crons[]`) (4 pts)
- Ajuste a la forma del proyecto y conflictos con el adaptador de framework (4 pts)

**Referencia**: `.claude/references/vercel/checks/architecture.md`

### Paso 3: Auditoría de Calidad de Código (25 puntos)

Ejecutar la verificación de calidad de código:

**Comando**: Usar el comando slash `/vercel:check code-quality` o seguir manualmente los pasos de `.claude/references/vercel/checks/code-quality.md`

**Criterios Evaluados**:
- Análisis ESLint de las Functions y del middleware (6 pts)
- Modo estricto de TypeScript y seguridad de tipos (6 pts)
- Convenciones de firma de los handlers (request/response tipados, entrada validada, runtime Node.js/Fluid Compute por defecto) (6 pts)
- Control del tamaño del bundle (imports adaptados al cold start) (4 pts)
- Calidad del middleware (3 pts)

**Referencia**: `.claude/references/vercel/checks/code-quality.md`

### Paso 4: Auditoría de Pruebas (25 puntos)

Ejecutar la verificación de pruebas:

**Comando**: Usar el comando slash `/vercel:check testing` o seguir manualmente los pasos de `.claude/references/vercel/checks/testing.md`

**Criterios Evaluados**:
- Cobertura de los handlers de Functions y del middleware (>= 80%) (7 pts)
- Pruebas de los handlers de Functions (caso nominal, validación y errores) (6 pts)
- Pruebas de las guardas de secreto de los Cron (todas las ramas de guarda) (5 pts)
- Pruebas del middleware (3 pts)
- Organización y aislamiento de las pruebas (2 pts)
- Pruebas de humo con `vercel dev` y verificación de `x-vercel-cache` (2 pts)

**Referencia**: `.claude/references/vercel/checks/testing.md`

### Paso 5: Auditoría de Seguridad (25 puntos)

Ejecutar la verificación de seguridad:

**Comando**: Usar el comando slash `/vercel:check security` o seguir manualmente los pasos de `.claude/references/vercel/checks/security.md`

**Criterios Evaluados**:
- Manejo de variables de entorno (sin valores fijos en el código, sin fugas al bundle del cliente, alcance de entorno correcto) (7 pts)
- Autenticación de los endpoints Cron (secreto de invocación, comparación en tiempo constante) (7 pts)
- Cabeceras CORS / CSP en vercel.json (4 pts)
- Alcance de las credenciales de Marketplace (mínimo privilegio) (3 pts)
- Paquetes Storage obsoletos (`@vercel/kv`, `@vercel/postgres`) y señalización de migración del runtime Edge heredado (2 pts)
- Vulnerabilidades de dependencias (2 pts)

**Referencia**: `.claude/references/vercel/checks/security.md`

### Paso 6: Consolidación y Puntuación Global

Calcular la puntuación global y producir el informe consolidado:
- [ ] Sumar las 4 puntuaciones (máximo 100 puntos)
- [ ] Identificar las categorías críticas (<50%)
- [ ] Enumerar todos los problemas transversales críticos
- [ ] Priorizar las acciones por impacto/esfuerzo
- [ ] Producir el informe consolidado final

**Escala de Calificación**:
- 90-100: Excelente - Proyecto de referencia
- 75-89: Muy Bueno - Algunas mejoras menores
- 60-74: Aceptable - Requiere mejoras
- 40-59: Insuficiente - Refactorización importante necesaria
- 0-39: Crítico - Revisión completa necesaria

### Paso 7: Recomendaciones y Plan de Acción

Producir las recomendaciones finales:
- [ ] Identificar las 3 acciones prioritarias principales en todas las categorías
- [ ] Estimar el esfuerzo (Bajo/Medio/Alto) para cada acción
- [ ] Estimar el impacto (Bajo/Medio/Alto) para cada acción
- [ ] Proponer el orden de implementación
- [ ] Sugerir victorias rápidas (alta relación impacto/esfuerzo)

## FORMATO DE SALIDA

```
AUDITORÍA DE CONFORMIDAD VERCEL - INFORME COMPLETO
=============================================

PUNTUACIÓN GLOBAL: XX/100

NIVEL DE CONFORMIDAD: [Excelente/Muy Bueno/Aceptable/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNTUACIONES POR CATEGORÍA:

ARQUITECTURA       : XX/25  [██████████░░░░░░░░░░] XX%
CALIDAD DE CÓDIGO  : XX/25  [██████████░░░░░░░░░░] XX%
PRUEBAS            : XX/25  [██████████░░░░░░░░░░] XX%
SEGURIDAD          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORTALEZAS GLOBALES:
1. [Fortaleza identificada en múltiples categorías]
2. [Otra fortaleza principal]
3. [Tercera fortaleza]

MEJORAS GLOBALES:
1. [Mejora transversal menor]
2. [Otra mejora recomendada]
3. [Tercera mejora]

PROBLEMAS CRÍTICOS:
1. [Problema crítico #1 - categoría afectada]
2. [Problema crítico #2 - categoría afectada]
3. [Problema crítico #3 - categoría afectada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALLES POR CATEGORÍA:

┌─────────────────────────────────────────────┐
│ ARQUITECTURA (XX/25)                        │
└─────────────────────────────────────────────┘

Sub-puntuaciones:
  • Esquema vercel.json           : XX/6
  • rewrites/redirects/headers    : XX/6
  • regions & functions           : XX/5
  • Configuración crons[]         : XX/4
  • Forma del proyecto            : XX/4

Fortalezas:
- [Fortalezas de arquitectura]

Problemas:
- [Problemas de arquitectura]

[Secciones similares para Calidad de Código, Pruebas y Seguridad...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 ACCIONES PRIORITARIAS (TODAS LAS CATEGORÍAS):

1. CRÍTICO - [Acción #1]
   Categoría : [Arquitectura/Calidad/Pruebas/Seguridad]
   Impacto   : [Alto/Medio/Bajo]
   Esfuerzo  : [Alto/Medio/Bajo]
   Prioridad : INMEDIATA

   Descripción detallada:
   [Explicación del problema y solución propuesta]

   Archivos afectados:
   - [archivo:línea]

   Ejemplo de corrección:
   [Código o comando de corrección]

2. IMPORTANTE - [Acción #2]
   [Mismo formato...]

3. RECOMENDADA - [Acción #3]
   [Mismo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VICTORIAS RÁPIDAS (Alto Impacto / Bajo Esfuerzo):

- [Victoria rápida #1] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Victoria rápida #2] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Victoria rápida #3] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN DE ACCIÓN RECOMENDADO:

SEMANA 1 (Inmediato):
- [ ] [Acción crítica #1]
- [ ] [Victoria rápida prioritaria]

SEMANAS 2-4 (Corto plazo):
- [ ] [Acción importante #2]
- [ ] [Otras victorias rápidas]

MESES 2-3 (Medio plazo):
- [ ] [Acción recomendada #3]
- [ ] [Mejoras progresivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMEN EJECUTIVO:

[Párrafo de resumen sobre el estado general del proyecto, las principales
fortalezas, las principales debilidades y la trayectoria recomendada para
mejorar la conformidad. Indicar si el proyecto está listo para producción,
requiere correcciones o necesita refactorización.]

Recomendación General: [Listo para producción / Correcciones menores /
Refactorización importante / Revisión completa necesaria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 auditorías especializadas
- Usar Docker para todas las herramientas de análisis
- Proporcionar ejemplos concretos con archivo:línea para cada problema
- Priorizar las acciones según la matriz Impacto/Esfuerzo
- Los problemas de seguridad son SIEMPRE la máxima prioridad
- Proponer correcciones automatizables (scripts, hooks de pre-commit)
- El informe debe ser accionable, no solo descriptivo
- Adaptar las recomendaciones al contexto de negocio del proyecto
- Un endpoint Cron sin protección y un secreto fijo en el código son SIEMPRE la máxima prioridad cuando se detectan
- Un `runtime: 'edge'` en código nuevo o modificado siempre se señala, pero es deuda de migración (no un fallo bloqueante) en código heredado sin modificar
- NO evaluar el enrutamiento/renderizado/data-fetching específicos de Next.js — fuera del alcance (ver `/react:*`, `/vuejs:*`, `/angular:*`)
