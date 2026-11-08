# Verificación completa de conformidad Tauri v2

## Argumentos

$ARGUMENTS (opcional: ruta del proyecto a analizar)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Realizar una auditoría completa de conformidad del proyecto Tauri v2 orquestando las 4 verificaciones principales: Arquitectura, Calidad de código, Tests y Seguridad. Producir un informe consolidado con una puntuación global sobre 100 puntos.

### Paso 1: Preparación de la auditoría

Preparar el entorno de auditoría:
- [ ] Identificar la ruta del proyecto que se va a auditar
- [ ] Verificar la presencia de los archivos de configuración (`src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/*.json`, `src-tauri/build.rs`, `package.json`, configuración de Vite)
- [ ] Listar los directorios principales (`src/`, `src-tauri/src/`, `src-tauri/capabilities/`, `src-tauri/icons/`, tests, workflows de CI)
- [ ] Identificar la versión de Tauri (`tauri`, `tauri-build`, `@tauri-apps/api`, `@tauri-apps/cli` en los lockfiles), el `rust-version` de Rust y los plugins oficiales en uso
- [ ] Confirmar que el objetivo es Tauri v2 estable (Tauri 3 alpha y Tauri v1 quedan fuera del alcance); anotar si los destinos son solo escritorio o también móviles (iOS/Android)

**Nota**: Si se proporciona $ARGUMENTS, usarlo como ruta del proyecto; de lo contrario, usar el directorio actual.

### Paso 2: Auditoría de arquitectura (25 puntos)

Ejecutar la verificación completa de arquitectura:

**Comando**: Usar el comando slash `/tauri:check architecture` o seguir manualmente los pasos de `.claude/references/tauri/checks/architecture.md`

**Criterios evaluados**:
- Disposición del proyecto (`src/` / `src-tauri/`, entrada `run()` en `lib.rs`, punto de entrada móvil) y `main.rs` delgado (5 pts)
- Diseño de comandos: handlers `#[tauri::command]` delgados, lógica en módulos Rust testeables (6 pts)
- Modelo de errores tipado: enum `thiserror` que implementa `Serialize` (4 pts)
- Gestión del estado (`manage` / `State<'_, T>`) y corrección asíncrona (sin bloqueos, alcance de los locks) (4 pts)
- Eventos y `Channel<T>` para streaming, uso de plugins (`.plugin(...)`, `#[cfg(desktop)]`) (4 pts)
- Frontera frontend/núcleo: sin lógica de negocio en el webview, IPC tipado (2 pts)

**Referencia**: `.claude/references/tauri/checks/architecture.md`

### Paso 3: Auditoría de calidad de código (25 puntos)

Ejecutar la verificación de calidad de código:

**Comando**: Usar el comando slash `/tauri:check code-quality` o seguir manualmente los pasos de `.claude/references/tauri/checks/code-quality.md`

**Criterios evaluados**:
- Clippy limpio con `-D warnings` y `cargo fmt --check` (5 pts)
- Nomenclatura Rust, higiene de ownership y borrowing (los comandos async con argumentos prestados devuelven `Result`) (5 pts)
- Tipado y lint del frontend (`tsc --noEmit`, ESLint o Biome) y wrappers de `invoke` coherentes (4 pts)
- Principios KISS/DRY/YAGNI (4 pts)
- Tamaño de las funciones y complejidad cognitiva (4 pts)
- Gestión de errores: sin `unwrap()` / `expect()` en los comandos, sin fallos silenciosos (3 pts)

**Referencia**: `.claude/references/tauri/checks/code-quality.md`

### Paso 4: Auditoría de tests (25 puntos)

Ejecutar la verificación de tests:

**Comando**: Usar el comando slash `/tauri:check testing` o seguir manualmente los pasos de `.claude/references/tauri/checks/testing.md`

**Criterios evaluados**:
- Cobertura de código (objetivo >= 80%) en el núcleo Rust y en el frontend (7 pts)
- Tests de comandos Rust sin interfaz gráfica (runtime simulado `tauri::test`: `mock_builder()`, `mock_context(noop_assets())`) (6 pts)
- Tests del frontend con `@tauri-apps/api/mocks` (`mockIPC`, `clearMocks()` en `afterEach`) (4 pts)
- Tests de extremo a extremo (WebdriverIO + `@wdio/tauri-service`, o `tauri-driver` en Windows/Linux) sobre un build `tauri build --debug --no-bundle` (3 pts)
- Calidad de los tests: AAA, nombres, sin inestabilidad (flakiness), ejecución en CI (3 pts)
- Aislamiento de los tests y simulación (mock) del IPC y del acceso al sistema operativo (2 pts)

**Referencia**: `.claude/references/tauri/checks/testing.md`

### Paso 5: Auditoría de seguridad (25 puntos)

Ejecutar la verificación de seguridad:

**Comando**: Usar el comando slash `/tauri:check security` o seguir manualmente los pasos de `.claude/references/tauri/checks/security.md`

**Criterios evaluados**:
- Capabilities y permisos: una capability por ventana/rol, mínimo privilegio (6 pts)
- Scopes: listas allow y deny de `fs` / `http`, sin comodines amplios (4 pts)
- CSP (`app.security.csp`) y patrón Isolation (`app.security.pattern`) (5 pts)
- Firma del updater: clave pública en la configuración, clave privada nunca commiteada, secreto de CI (4 pts)
- Gestión de secretos y credenciales, protecciones OWASP Top 10:2025 (3 pts)
- Vulnerabilidades de dependencias y cadena de suministro (`cargo deny` / `cargo audit`, `npm audit`) (2 pts)
- Validación de entradas en los comandos y mentalidad de webview no confiable (1 pt)

**Referencia**: `.claude/references/tauri/checks/security.md`

### Paso 6: Consolidación y puntuación global

Calcular la puntuación global y producir el informe consolidado:
- [ ] Sumar las 4 puntuaciones (máximo 100 puntos)
- [ ] Identificar las categorías críticas (<50%)
- [ ] Enumerar todos los problemas críticos transversales
- [ ] Priorizar las acciones según impacto/esfuerzo
- [ ] Producir el informe consolidado final

**Escala de calificación**:
- 90-100: Excelente - Proyecto de referencia
- 75-89: Muy bueno - Algunas mejoras menores
- 60-74: Aceptable - Requiere mejoras
- 40-59: Insuficiente - Refactorización mayor requerida
- 0-39: Crítico - Revisión completa necesaria

### Paso 7: Recomendaciones y plan de acción

Producir las recomendaciones finales:
- [ ] Identificar las 3 acciones prioritarias principales entre todas las categorías
- [ ] Estimar el esfuerzo (Bajo/Medio/Alto) de cada acción
- [ ] Estimar el impacto (Bajo/Medio/Alto) de cada acción
- [ ] Proponer el orden de implementación
- [ ] Sugerir victorias rápidas (quick wins, alta relación impacto/esfuerzo)

## FORMATO DE SALIDA

```
AUDITORÍA DE CONFORMIDAD TAURI V2 - INFORME COMPLETO
=====================================================

PUNTUACIÓN GLOBAL: XX/100

NIVEL DE CONFORMIDAD: [Excelente/Muy bueno/Aceptable/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNTUACIONES POR CATEGORÍA:

ARQUITECTURA       : XX/25  [██████████░░░░░░░░░░] XX%
CALIDAD DE CÓDIGO  : XX/25  [██████████░░░░░░░░░░] XX%
TESTS              : XX/25  [██████████░░░░░░░░░░] XX%
SEGURIDAD          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNTOS FUERTES GLOBALES:
1. [Punto fuerte identificado en varias categorías]
2. [Otro punto fuerte importante]
3. [Tercer punto fuerte]

MEJORAS GLOBALES:
1. [Mejora transversal menor]
2. [Otra mejora recomendada]
3. [Tercera mejora]

PROBLEMAS CRÍTICOS:
1. [Problema crítico n.º 1 - categoría afectada]
2. [Problema crítico n.º 2 - categoría afectada]
3. [Problema crítico n.º 3 - categoría afectada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALLE POR CATEGORÍA:

┌─────────────────────────────────────────────┐
│ ARQUITECTURA (XX/25)                        │
└─────────────────────────────────────────────┘

Subpuntuaciones:
  • Disposición / puntos de entrada    : XX/5
  • Diseño de comandos                 : XX/6
  • Errores tipados                    : XX/4
  • Estado y asincronía                : XX/4
  • Eventos, Channels, plugins         : XX/4
  • Frontera frontend / núcleo         : XX/2

Puntos fuertes:
- [Puntos fuertes de la arquitectura]

Problemas:
- [Problemas de la arquitectura]

[Secciones similares para Calidad de código, Tests y Seguridad...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 ACCIONES PRIORITARIAS (TODAS LAS CATEGORÍAS):

1. CRÍTICA - [Acción n.º 1]
   Categoría : [Arquitectura/Calidad/Tests/Seguridad]
   Impacto   : [Alto/Medio/Bajo]
   Esfuerzo  : [Alto/Medio/Bajo]
   Prioridad : INMEDIATA

   Descripción detallada:
   [Explicación del problema y de la solución propuesta]

   Archivos afectados:
   - [archivo:línea]

   Ejemplo de corrección:
   [Código o comando de corrección]

2. IMPORTANTE - [Acción n.º 2]
   [Mismo formato...]

3. RECOMENDADA - [Acción n.º 3]
   [Mismo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VICTORIAS RÁPIDAS (Alto impacto / Bajo esfuerzo):

- [Victoria rápida n.º 1] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Victoria rápida n.º 2] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Victoria rápida n.º 3] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN DE ACCIÓN RECOMENDADO:

SEMANA 1 (Inmediato):
- [ ] [Acción crítica n.º 1]
- [ ] [Victoria rápida prioritaria]

SEMANAS 2-4 (Corto plazo):
- [ ] [Acción importante n.º 2]
- [ ] [Otras victorias rápidas]

MESES 2-3 (Medio plazo):
- [ ] [Acción recomendada n.º 3]
- [ ] [Mejoras progresivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMEN EJECUTIVO:

[Párrafo de resumen sobre el estado global del proyecto, los puntos
fuertes principales, las debilidades principales y la trayectoria
recomendada para mejorar la conformidad. Indicar si el proyecto está
listo para producción, requiere correcciones o necesita una
refactorización.]

Recomendación general: [Listo para producción / Correcciones menores /
Refactorización mayor / Revisión completa necesaria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 auditorías especializadas
- Usar Docker para todas las herramientas de análisis (`docker compose exec app ...`); los builds con interfaz gráfica pueden requerir CI
- Proporcionar ejemplos concretos con archivo:línea para cada problema
- Priorizar las acciones según la matriz Impacto/Esfuerzo
- Los problemas de seguridad son SIEMPRE la máxima prioridad
- Proponer correcciones automatizables (scripts, hooks pre-commit, pasos de CI)
- El informe debe ser accionable, no solo descriptivo
- Adaptar las recomendaciones al contexto de negocio del proyecto
- Pragmatismo ante todo: no penalizar a una app pequeña por un único `lib.rs` con módulos cuando las responsabilidades están separadas
- Fuera del alcance: código del framework de interfaz (ver los stacks React / Vue / Svelte / Vite) y reglas generales de Rust (ver el stack `rust`)
