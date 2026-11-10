# Verificación completa de conformidad WordPress

## Argumentos

$ARGUMENTS (opcional: ruta del plugin/tema a analizar)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Realizar una auditoría completa de conformidad del plugin o tema de WordPress orquestando las 4 verificaciones principales: Arquitectura, Calidad de código, Tests y Seguridad. Producir un informe consolidado con una puntuación global sobre 100 puntos.

### Paso 1: Preparación de la auditoría

Preparar el entorno de auditoría:
- [ ] Identificar la ruta del proyecto a auditar
- [ ] Verificar la presencia de los archivos clave (archivo de cabecera del plugin o `style.css`/`theme.json`, `composer.json`, `package.json`, `.wp-env.json`, `phpcs.xml*`, `phpstan.neon*`, `uninstall.php`, archivos `block.json`)
- [ ] Enumerar los directorios principales (`src/` o `includes/`, `blocks/`, `languages/`, `tests/`, workflows de CI)
- [ ] Identificar los valores declarados `Requires at least`, `Requires PHP`, `Requires Plugins`, y las versiones de las herramientas en los lockfiles
- [ ] Determinar el tipo: plugin, tema clásico, tema de bloques o mixto; anotar si el proyecto depende de WooCommerce

**Nota**: Si se proporciona $ARGUMENTS, úsalo como ruta del proyecto; en caso contrario, usa el directorio actual.

### Paso 2: Auditoría de arquitectura (25 puntos)

**Comando**: Usa el slash command `/wordpress:check architecture` o sigue manualmente los pasos de `.claude/references/wordpress/checks/architecture.md`

**Criterios evaluados**:
- Cabecera del plugin, archivo de arranque, guarda ABSPATH, autoload de Composer (5 pts)
- Prefijos y namespaces para funciones, clases, opciones, hooks, handles (5 pts)
- Organización de los hooks y callbacks delgados (5 pts)
- Bloques (`block.json` apiVersion 3, `render.php`) y estructura del tema de bloques (`theme.json`, templates, parts) (5 pts)
- Diseño REST y ciclo de vida (activación, desactivación, desinstalación) (5 pts)

**Referencia**: `.claude/references/wordpress/checks/architecture.md`

### Paso 3: Auditoría de calidad de código (25 puntos)

**Comando**: Usa el slash command `/wordpress:check code-quality` o sigue manualmente los pasos de `.claude/references/wordpress/checks/code-quality.md`

**Criterios evaluados**:
- WPCS (PHPCS) sin errores (7 pts)
- i18n: text domain, comentarios para traductores, traducciones JS (5 pts)
- PHPStan (phpstan-wordpress) y ESLint (`@wordpress/eslint-plugin`) (5 pts)
- Principios KISS/DRY/YAGNI (4 pts)
- Tamaño de las funciones y complejidad cognitiva (4 pts)

**Referencia**: `.claude/references/wordpress/checks/code-quality.md`

### Paso 4: Auditoría de testing (25 puntos)

**Comando**: Usa el slash command `/wordpress:check testing` o sigue manualmente los pasos de `.claude/references/wordpress/checks/testing.md`

**Criterios evaluados**:
- Cobertura de código (objetivo >= 80 %) en PHP y JS (7 pts)
- PHPUnit con `WP_UnitTestCase` mediante wp-env, `yoast/phpunit-polyfills` (6 pts)
- Jest mediante `@wordpress/scripts` para bloques y JS (4 pts)
- Playwright de extremo a extremo con `@wordpress/e2e-test-utils-playwright` (3 pts)
- Calidad de los tests: AAA, nomenclatura, sin tests inestables, ejecución en CI (3 pts)
- Aislamiento de los tests y uso de factories (2 pts)

**Referencia**: `.claude/references/wordpress/checks/testing.md`

### Paso 5: Auditoría de seguridad (25 puntos)

**Comando**: Usa el slash command `/wordpress:check security` o sigue manualmente los pasos de `.claude/references/wordpress/checks/security.md`

**Criterios evaluados**:
- Verificaciones de capabilities y nonces en cada cambio de estado (6 pts)
- `permission_callback` REST y validación de argumentos (5 pts)
- Escapado en la salida (`esc_*`, `wp_kses_post`) (5 pts)
- Sanitización de la entrada y `$wpdb->prepare()` (4 pts)
- Gestión de secretos y credenciales, protecciones OWASP Top 10:2025 (3 pts)
- Vulnerabilidades de dependencias y cadena de suministro (`composer audit`, `npm audit`) (2 pts)

**Referencia**: `.claude/references/wordpress/checks/security.md`

### Paso 6: WooCommerce (solo si el proyecto depende de él)

Aplica `.claude/skills/woocommerce/checklist.md`: compatibilidad HPOS declarada, `wc_get_order()` / objetos CRUD en lugar de post meta, compatibilidad con `cart_checkout_blocks`. Integra los hallazgos en las puntuaciones de Arquitectura y Seguridad; omite este paso por completo en los proyectos sin WooCommerce.

### Paso 7: Consolidación y puntuación global

Calcular la puntuación global y producir el informe consolidado:
- [ ] Sumar las 4 puntuaciones (máximo 100 puntos)
- [ ] Identificar las categorías críticas (<50 %)
- [ ] Enumerar todos los problemas críticos transversales
- [ ] Priorizar las acciones por impacto/esfuerzo
- [ ] Producir el informe consolidado final

**Escala de calificación**:
- 90-100: Excelente - Proyecto de referencia
- 75-89: Muy bueno - Algunas mejoras menores
- 60-74: Aceptable - Requiere mejoras
- 40-59: Insuficiente - Se requiere una refactorización importante
- 0-39: Crítico - Es necesaria una revisión completa

### Paso 8: Recomendaciones y plan de acción

- [ ] Identificar las 3 acciones prioritarias principales en todas las categorías
- [ ] Estimar el esfuerzo y el impacto (Bajo/Medio/Alto) de cada una
- [ ] Proponer el orden de implementación
- [ ] Sugerir los quick wins (alta relación impacto/esfuerzo)

## FORMATO DE SALIDA

```
WORDPRESS COMPLIANCE AUDIT - COMPLETE REPORT
=============================================

OVERALL SCORE: XX/100

COMPLIANCE LEVEL: [Excellent/Very Good/Acceptable/Insufficient/Critical]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCORES BY CATEGORY:

ARCHITECTURE       : XX/25  [██████████░░░░░░░░░░] XX%
CODE QUALITY       : XX/25  [██████████░░░░░░░░░░] XX%
TESTS              : XX/25  [██████████░░░░░░░░░░] XX%
SECURITY           : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL STRENGTHS:
1. [Strength identified in multiple categories]
2. [Other major strength]
3. [Third strength]

OVERALL IMPROVEMENTS:
1. [Minor cross-cutting improvement]
2. [Other recommended improvement]
3. [Third improvement]

CRITICAL ISSUES:
1. [Critical issue #1 - affected category]
2. [Critical issue #2 - affected category]
3. [Critical issue #3 - affected category]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILS BY CATEGORY:

┌─────────────────────────────────────────────┐
│ ARCHITECTURE (XX/25)                        │
└─────────────────────────────────────────────┘

Sub-scores:
  • Header / bootstrap / autoload  : XX/5
  • Prefixing / namespaces         : XX/5
  • Hooks organization             : XX/5
  • Blocks / theme structure       : XX/5
  • REST / lifecycle               : XX/5

Strengths:
- [Architecture strengths]

Issues:
- [Architecture issues]

[Similar sections for Code Quality, Tests, and Security...]

WOOCOMMERCE (if applicable): [HPOS / CRUD / checkout blocks findings]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITY ACTIONS (ALL CATEGORIES):

1. CRITICAL - [Action #1]
   Category  : [Architecture/Quality/Tests/Security]
   Impact    : [High/Medium/Low]
   Effort    : [High/Medium/Low]
   Priority  : IMMEDIATE

   Detailed description:
   [Explanation of problem and proposed solution]

   Affected files:
   - [file:line]

   Correction example:
   [Code or correction command]

2. IMPORTANT - [Action #2]
   [Same format...]

3. RECOMMENDED - [Action #3]
   [Same format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (High Impact / Low Effort):

- [Quick win #1] - Category: [X] - Impact: [X] - Effort: [X]
- [Quick win #2] - Category: [X] - Impact: [X] - Effort: [X]
- [Quick win #3] - Category: [X] - Impact: [X] - Effort: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECOMMENDED ACTION PLAN:

WEEK 1 (Immediate):
- [ ] [Critical action #1]
- [ ] [Priority quick win]

WEEK 2-4 (Short term):
- [ ] [Important action #2]
- [ ] [Other quick wins]

MONTH 2-3 (Medium term):
- [ ] [Recommended action #3]
- [ ] [Progressive improvements]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY:

[Summary paragraph on overall project state, major strengths,
major weaknesses, and recommended trajectory. Mention if the
project is production-ready, requires corrections, or needs refactoring.]

General Recommendation: [Production-ready / Minor corrections /
Major refactoring / Overhaul necessary]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 auditorías especializadas
- Usa Docker para todas las herramientas de análisis (`docker compose exec app ...` o `npx wp-env run ...`)
- Proporciona ejemplos concretos con file:line para cada problema
- Prioriza las acciones según la matriz Impacto/Esfuerzo
- Los problemas de seguridad son SIEMPRE la máxima prioridad
- Propón correcciones automatizables (scripts, pre-commit hooks, pasos de CI)
- El informe debe ser accionable, no solo descriptivo
- Pragmatismo ante todo: no penalices a un plugin pequeño de un solo archivo por carecer de capas cuando las responsabilidades están separadas
- Fuera de alcance: reglas generales de PHP (consulta el stack `php`), hosting y despliegues estilo Bedrock, desarrollo del núcleo de WordPress
