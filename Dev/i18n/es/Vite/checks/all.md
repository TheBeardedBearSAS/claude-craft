# Verificación Completa de Conformidad de Vite

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto a analizar)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Realizar una auditoría de conformidad completa del proyecto Vite orquestando las 4 verificaciones principales: Arquitectura, Calidad de Código, Pruebas y Seguridad. Producir un informe consolidado con una puntuación global sobre 100 puntos.

> **Recordatorio de alcance**: esta auditoría cubre únicamente el uso de Vite independiente de cualquier framework (aplicaciones JS/TS vanilla, creación de bibliotecas con `build.lib`, aplicaciones multipágina, entradas Workers/WASM). No evaluar la integración del dev-server específica de React/Vue/Angular/Svelte; corresponde a la verificación de conformidad propia de cada uno de esos stacks.

### Paso 1: Preparación de la Auditoría

Preparar el entorno de auditoría:
- [ ] Identificar la ruta del proyecto a auditar
- [ ] Verificar la presencia de los archivos de configuración (package.json, tsconfig.json, vite.config.ts)
- [ ] Listar los directorios principales (src/, pages/, public/, tests/, etc.)
- [ ] Identificar el tipo de proyecto: SPA vanilla, biblioteca (build.lib), aplicación multipágina o puntos de entrada Workers/WASM
- [ ] Identificar la versión de Vite y confirmar que ningún plugin específico de un framework (`@vitejs/plugin-react`, `@vitejs/plugin-vue`, etc.) forma parte del alcance

**Nota**: Si se proporcionan $ARGUMENTS, usarlos como ruta del proyecto; en caso contrario, usar el directorio actual.

### Paso 2: Auditoría de Arquitectura (25 puntos)

Ejecutar la verificación completa de arquitectura:

**Comando**: Usar el comando slash `/vite:check architecture` o seguir manualmente los pasos de `.claude/references/vite/checks/architecture.md`

**Criterios Evaluados**:
- Detección de la forma del proyecto y puntos de entrada (index.html en la raíz, entrada build.lib, input multipágina, patrón `new URL` de Worker/WASM) (6 pts)
- Estructura de vite.config.ts (defineConfig, forma funcional, orden de claves) (5 pts)
- Organización de plugins personalizados (vite-plugins/, nomenclatura vite-plugin-*, una responsabilidad por plugin) (4 pts)
- Externalización de dependencias y mapa exports de package.json (biblioteca) (6 pts)
- Estructura de salida (dist/ ignorado, ES + CJS + .d.ts mediante vite-plugin-dts, nombres de chunks estables) (4 pts)

**Referencia**: `.claude/references/vite/checks/architecture.md`

### Paso 3: Auditoría de Calidad de Código (25 puntos)

Ejecutar la verificación de calidad de código:

**Comando**: Usar el comando slash `/vite:check code-quality` o seguir manualmente los pasos de `.claude/references/vite/checks/code-quality.md`

**Criterios Evaluados**:
- Análisis de ESLint (no-explicit-any, no-restricted-imports, no-console) (5 pts)
- Rigor de TypeScript (strict, moduleResolution: "bundler", tipos vite/client) (6 pts)
- Detección de fuga de framework (sin acoplamiento a React/Vue/Angular/Svelte) (5 pts)
- Complejidad del código (tamaño de funciones/archivos, complejidad ciclomática, anidamiento) (4 pts)
- Calidad específica de Vite (config funcional, plugins extraídos, variables VITE_* solo públicas, patrones Worker/WASM estáticos) (5 pts)

**Referencia**: `.claude/references/vite/checks/code-quality.md`

### Paso 4: Auditoría de Pruebas (25 puntos)

Ejecutar la verificación de pruebas:

**Comando**: Usar el comando slash `/vite:check testing` o seguir manualmente los pasos de `.claude/references/vite/checks/testing.md`

**Criterios Evaluados**:
- Cobertura de código con Vitest (>= 80 % sentencias, ramas, funciones, líneas) (7 pts)
- Organización y aislamiento de las pruebas (4 pts)
- Pruebas de módulos vanilla (funciones puras, casos límite, entorno node) (4 pts)
- Pruebas de Workers (lógica del handler extraída, contrato de mensajes) (4 pts)
- Pruebas de wrappers WASM (`?init` simulado, una prueba de integración con un .wasm real) (3 pts)
- Pruebas de la salida de build de la biblioteca sobre dist/ (ESM, CJS, mapa exports) (3 pts)

**Referencia**: `.claude/references/vite/checks/testing.md`

### Paso 5: Auditoría de Seguridad (25 puntos)

Ejecutar la verificación de seguridad:

**Comando**: Usar el comando slash `/vite:check security` o seguir manualmente los pasos de `.claude/references/vite/checks/security.md`

**Criterios Evaluados**:
- Fuga de secretos mediante env / `define()` (prefijo VITE_*, secretos en el código) (7 pts)
- Cobertura de CSP en todas las entradas (multipágina, aplicación en servidor/CDN) (5 pts)
- Aislamiento de WASM (COOP/COEP, wasm-unsafe-eval, objeto de imports mínimo) (4 pts)
- Validación de mensajes de Worker (comprobación de forma, sin eval, comprobación de origen) (5 pts)
- Vulnerabilidades de dependencias (npm audit) (4 pts)

**Referencia**: `.claude/references/vite/checks/security.md`

### Paso 6: Consolidación y Puntuación Global

Calcular la puntuación global y producir el informe consolidado:
- [ ] Sumar las 4 puntuaciones (máximo 100 puntos)
- [ ] Identificar las categorías críticas (<50 %)
- [ ] Enumerar todos los problemas transversales críticos (p. ej. index.html en public/, secretos expuestos mediante VITE_*, falta de externalización de peer deps)
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

> **Proyectos de biblioteca**: `/vite:check-library-build` complementa esta auditoría en proyectos de biblioteca (salida build.lib, mapa exports, declaraciones de tipos, tree-shaking). Ejecutarlo además cuando el proyecto publique un paquete.

## FORMATO DE SALIDA

```
AUDITORÍA DE CONFORMIDAD VITE - INFORME COMPLETO
=============================================

PUNTUACIÓN GLOBAL: XX/100

NIVEL DE CONFORMIDAD: [Excelente/Muy Bueno/Aceptable/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNTUACIONES POR CATEGORÍA:

ARQUITECTURA      : XX/25  [██████████░░░░░░░░░░] XX%
CALIDAD DE CÓDIGO : XX/25  [██████████░░░░░░░░░░] XX%
PRUEBAS           : XX/25  [██████████░░░░░░░░░░] XX%
SEGURIDAD         : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORTALEZAS GLOBALES:
1. [Fortaleza identificada en múltiples categorías]
2. [Otra fortaleza importante]
3. [Tercera fortaleza]

MEJORAS GLOBALES:
1. [Mejora transversal menor]
2. [Otra mejora recomendada]
3. [Tercera mejora]

PROBLEMAS CRÍTICOS:
1. [Problema crítico - categoría afectada #1]
2. [Problema crítico - categoría afectada #2]
3. [Problema crítico - categoría afectada #3]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALLES POR CATEGORÍA:

┌─────────────────────────────────────────────┐
│ ARQUITECTURA (XX/25)
└─────────────────────────────────────────────┘

Subpuntuaciones:
  • Detección de la forma del proyecto y puntos de entrada (index.html en la raíz, entrada build.lib, input multipágina, patrón `new URL` de Worker/WASM) : XX/6
  • Estructura de vite.config.ts (defineConfig, forma funcional, orden de claves) : XX/5
  • Organización de plugins personalizados (vite-plugins/, nomenclatura vite-plugin-*, una responsabilidad por plugin) : XX/4
  • Externalización de dependencias y mapa exports de package.json (biblioteca) : XX/6
  • Estructura de salida (dist/ ignorado, ES + CJS + .d.ts mediante vite-plugin-dts, nombres de chunks estables) : XX/4

Fortalezas:
- [Fortalezas de la arquitectura]

Problemas:
- [Problemas de arquitectura]

[Secciones similares para Calidad de Código, Pruebas y Seguridad...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 DE ACCIONES PRIORITARIAS (TODAS LAS CATEGORÍAS):

1. CRÍTICO - [Acción #1]
   Categoría: [Architecture/Code Quality/Tests/Security]
   Impacto  : [Alto/Medio/Bajo]
   Esfuerzo : [Alto/Medio/Bajo]
   Prioridad: INMEDIATA

   Descripción detallada:
   [Explicación del problema y de la solución propuesta]

   Archivos afectados:
   - [file:line]

   Ejemplo de corrección:
   [Código o comando de corrección]

2. IMPORTANTE - [Acción #2]
   [Mismo formato...]

3. RECOMENDADO - [Acción #3]
   [Mismo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VICTORIAS RÁPIDAS (Alto impacto / Bajo esfuerzo):

- [Quick win #1] - Categoría: [X] - Impacto  : [X] - Esfuerzo : [X]
- [Quick win #2] - Categoría: [X] - Impacto  : [X] - Esfuerzo : [X]
- [Quick win #3] - Categoría: [X] - Impacto  : [X] - Esfuerzo : [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN DE ACCIÓN RECOMENDADO:

SEMANA 1 (Inmediato):
- [ ] [Acción crítica n.º 1]
- [ ] [Victoria rápida prioritaria]

SEMANAS 2-4 (Corto plazo):
- [ ] [Acción importante n.º 2]
- [ ] [Otras victorias rápidas]

MES 2-3 (Medio plazo):
- [ ] [Acción recomendada n.º 3]
- [ ] [Mejoras progresivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMEN EJECUTIVO:

[Párrafo de síntesis sobre el estado global del proyecto, sus
principales fortalezas, sus principales debilidades y la trayectoria
recomendada para mejorar la conformidad. Indicar si el proyecto está
listo para producción, requiere correcciones o necesita refactorización.]

Recomendación general: [Listo para producción / Correcciones menores /
Refactorización importante / Revisión completa necesaria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 auditorías especializadas (`/vite:check architecture`, `/vite:check code-quality`, `/vite:check testing`, `/vite:check security`)
- Usar Docker para todas las herramientas de análisis
- Proporcionar ejemplos concretos con archivo:línea para cada problema
- Priorizar las acciones según la matriz Impacto/Esfuerzo
- Los problemas de seguridad son SIEMPRE la máxima prioridad (primero los secretos expuestos mediante VITE_* o define())
- Proponer correcciones automatizables (scripts, hooks de pre-commit)
- El informe debe ser accionable, no solo descriptivo
- Adaptar las recomendaciones al tipo de proyecto (aplicación vanilla / biblioteca / multipágina / Workers-WASM)
- NO evaluar la integración del dev-server específica de un framework (React/Vue/Angular/Svelte); fuera del alcance de esta auditoría
